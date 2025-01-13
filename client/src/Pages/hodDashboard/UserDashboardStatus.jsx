import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Spinner, Table, Button, Form, Modal, InputGroup } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import { LuView } from "react-icons/lu";

const UserDashboardStatus = () => {
    const token = useSelector((state) => state.loginSlice.user?.token); // Get the token from Redux store
    const location = useLocation();
    const { dashboardData, financeStatus } = location.state || {};
    const [userData, setUserData] = useState(null); // State to store the API response data
    const [loading, setLoading] = useState(true); // State to track loading state
    const [error, setError] = useState(null); // State to track any error
    const [searchTerm, setSearchTerm] = useState(''); // State for search input
    const [selectedUser, setSelectedUser] = useState(null); // State for the selected user to display in the modal
    const [showModal, setShowModal] = useState(false); // State to control modal visibility
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    useEffect(() => {
        if (!token) return; // Ensure that the token exists before making the API call

        const fetchData = async () => {
            try {
                setLoading(true); // Start loading
                const response = await axios.get('/api/commission/dashboard-status-users-by-pipeline', {
                    headers: {
                        Authorization: `Bearer ${token}`, // Send the token as Bearer token in the header
                    }
                });
                setUserData(response.data.pipelineStats); // Store the pipelineStats response data in state
            } catch (err) {
                setError(err.message); // Set the error message if the request fails
            } finally {
                setLoading(false); // End loading
            }
        };

        fetchData();
    }, [token]); // Trigger useEffect when the token changes

    if (loading) {
        return (
            <div className="text-center">
                <Spinner animation="grow" style={{ color: '#d7aa47' }} />
            </div>
        );
    }

    // Filter the user stats based on the search term
    const filteredData = userData?.map((pipeline) => ({
        ...pipeline,
        userStats: pipeline.userStats.filter((user) =>
            user.userName.toLowerCase().includes(searchTerm.toLowerCase())
        ),
    })).filter((pipeline) => pipeline.userStats.length > 0); // Exclude pipelines with no matching users

    const handleViewDetails = (user) => {
        setSelectedUser(user); // Set the selected user data
        setShowModal(true); // Show the modal
    };

    const handleCloseModal = () => {
        setShowModal(false); // Hide the modal
        setSelectedUser(null); // Clear the selected user data
    };

    const renderMonthlyTable = (title, stats) => {
        return (
            <>
                <h3 className="text-center" style={{ color: '#d7aa47' }}>{title}</h3>
                <Table striped bordered hover responsive className="text-center" variant="dark">
                    <thead>
                        <tr>
                            <th style={{ backgroundColor: '#d7aa47' }}>Month</th>
                            <th style={{ backgroundColor: '#d7aa47' }}>Total</th>
                            <th style={{ backgroundColor: '#d7aa47' }}>Rejected</th>
                            {/* <th style={{ backgroundColor: '#d7aa47' }}>Finance Amount</th>
                            <th style={{ backgroundColor: '#d7aa47' }}>Target</th> */}
                        </tr>
                    </thead>
                    <tbody>
                        {stats.map((item, index) => {
                            const [month, year] = item?.month?.split("-");
                            const monthName = monthNames[parseInt(month, 10) - 1];
                            // Get finance data for the selected user
                            // const financeStat = selectedUser?.financeStats?.monthWiseFinanceStats?.find(
                            //     (stat) => stat?.month === item?.month
                            // );
                            return (
                                <tr key={index}>
                                    <td>{`${monthName} ${year}`}</td>
                                    <td>{item?.total}</td>
                                    <td>{item?.rejected}</td>
                                    {/* <td>{financeStat?.financeAmount || 0}</td>
                                    <td>{financeStat?.target || 0}</td>  */}
                                </tr>
                            );
                        })}
                    </tbody>
                </Table>
            </>
        )
    };

    const renderFinanceTable = (financeStats) => {
        return (
            <>
                <h3 className="text-center" style={{ color: '#d7aa47' }}>Finance Statistics</h3>
                <Table striped bordered hover responsive className="text-center" variant="dark">
                    <thead>
                        <tr>
                            <th style={{ backgroundColor: '#d7aa47' }}>Month</th>
                            <th style={{ backgroundColor: '#d7aa47' }}>Finance Amount</th>
                            <th style={{ backgroundColor: '#d7aa47' }}>Target</th>
                        </tr>
                    </thead>
                    <tbody>
                        {financeStats.map((item, index) => {
                            const [month, year] = item?.month?.split("-");
                            const monthName = monthNames[parseInt(month, 10) - 1];
                            return (
                                <tr key={index}>
                                    <td>{`${monthName} ${year}`}</td>
                                    <td>{item?.financeAmount || 0}</td>
                                    <td>{item?.target || 0}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </Table>
            </>
        );
    };

    const handleClearSearch = () => {
        setSearchTerm("");
    };

    return (
        <Container fluid>
            <Row>
                <Col xs={12} md={12} lg={2}></Col>
                <Col xs={12} md={12} lg={9}>
                    {/* <h3 style={{ color: '#fff' }} className='mt-3' >User Statistics</h3> */}
                    {/* Search Input */}
                    <div className=" mt-3" style={{ width: '100%', maxWidth: '500px' }} >
                        <InputGroup>
                            <Form.Control
                                type="text"
                                placeholder="Search by Client Name"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className='input_field_input_field'
                            />
                            <Button
                                variant="outline-secondary"
                                onClick={handleClearSearch}
                                style={{
                                    backgroundColor: "#d7aa47",
                                    color: "white",
                                    border: "none",
                                }}
                            >
                                Clear
                            </Button>
                        </InputGroup>
                    </div>
                    {/* Render data here */}
                    {filteredData && filteredData.length > 0 ? (
                        filteredData.map((pipeline) => (
                            <div key={pipeline.pipelineId}>
                                <h4 className="mt-3" style={{ color: '#d7aa47' }}>{pipeline.pipelineName}</h4>
                                <Table striped bordered hover responsive className="text-center" variant="dark">
                                    <thead>
                                        <tr>
                                            <th style={{ backgroundColor: '#d7aa47' }} >Name</th>
                                            <th style={{ backgroundColor: '#d7aa47' }}>Leads</th>
                                            <th style={{ backgroundColor: '#d7aa47' }}>Rejected Leads</th>
                                            <th style={{ backgroundColor: '#d7aa47' }}>Contracts</th>
                                            <th style={{ backgroundColor: '#d7aa47' }}>Rejected Contracts </th>
                                            <th style={{ backgroundColor: '#d7aa47' }}>Deals</th>
                                            <th style={{ backgroundColor: '#d7aa47' }}>Rejected Deals</th>
                                            <th style={{ backgroundColor: '#d7aa47' }}>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {pipeline.userStats.map((user) => {
                                            const { stats } = user;
                                            return (
                                                <tr key={user.userId}>
                                                    <td>
                                                        <div className="name-container">
                                                            <p style={{ fontSize: '14px' }} >
                                                                {user.userName && typeof user.userName === 'string'
                                                                    ? user.userName.split(' ').slice(0, 2).join(' ') +
                                                                    (user.userName.split(' ').length > 15 ? '...' : '')
                                                                    : 'N/A'}
                                                            </p>
                                                            <span className="tooltip">{user.userName || 'N/A'}</span>
                                                        </div>
                                                    </td>
                                                    <td>{stats.totalLeads}</td>
                                                    <td>{stats.rejectedLeads}</td>
                                                    <td>{stats.totalContracts}</td>
                                                    <td>{stats.rejectedContracts}</td>
                                                    <td>{stats.totalDeals}</td>
                                                    <td>{stats.rejectedDeals}</td>
                                                    <td><LuView style={{ fontSize: '20px', color: '#d7aa47', cursor: 'pointer' }} onClick={() => handleViewDetails(user)} /></td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </Table>
                            </div>
                        ))
                    ) : (
                        <p style={{ color: '#d7aa47', textAlign: 'center' }}>No Data Available</p>
                    )}
                </Col>
            </Row>

            {/* User Details Modal */}
            <Modal show={showModal} onHide={handleCloseModal} centered size='xl'>
                <Modal.Header closeButton style={{ border: 'none' }}>
                    <Modal.Title style={{ color: 'white' }}>Monthly Statistics of <span style={{ color: '#d7aa47' }} >{selectedUser?.userName}</span> </Modal.Title>
                </Modal.Header>
                <Modal.Body style={{ color: 'white' }}>
                    {selectedUser ? (
                        <div>
                            {renderMonthlyTable('Leads', selectedUser.monthlyStats.leads)}
                            {renderMonthlyTable('Contracts', selectedUser.monthlyStats.contracts)}
                            {renderMonthlyTable('Deals', selectedUser.monthlyStats.deals)}
                            {renderFinanceTable(selectedUser.financeStats.monthWiseFinanceStats || [])}
                        </div>
                    ) : (
                        <p style={{ color: '#d7aa47', textAlign: 'center' }} >No Details Available.</p>
                    )}
                </Modal.Body>
                <Modal.Footer style={{ border: 'none' }}>
                    <Button variant="secondary" onClick={handleCloseModal}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default UserDashboardStatus;
