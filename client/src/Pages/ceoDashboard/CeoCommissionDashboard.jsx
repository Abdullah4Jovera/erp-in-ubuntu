import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Spinner, Button, Modal, Table } from 'react-bootstrap';
import axios from 'axios';
import { useSelector } from 'react-redux';

const CeoCommissionDashboard = () => {
    const [loading, setLoading] = useState(true); // State to handle loading
    const [error, setError] = useState(null); // State to handle errors
    const [collectedCommission, setCollectedCommission] = useState(null); // State to store collected commission data
    const [rejectedCommission, setRejectedCommission] = useState(null); // State to store rejected commission data
    const [operationalCommission, setOperationalCommission] = useState(null); // State to store operational commission data
    const token = useSelector((state) => state.loginSlice.user?.token);
    const [collectedModal, setCollectedModal] = useState(false);
    const [rejectedModal, setRejectedModal] = useState(false);
    const [allCommissionOperationalModal, setAllCommissionOperationalModal] = useState(false);
    const [companyCommissionModal, setCompanyCommissionModal] = useState(false);

    // console.log(collectedCommission.monthWiseStats.totalCommission,'operational')
    const fetchCollectedCommission = async () => {
        try {
            const response = await axios.get('/api/commission/collected', {
                headers: { Authorization: `Bearer ${token}` },
            });
            setCollectedCommission(response.data);
        } catch (err) {
            setError('Failed to fetch collected commission data. Please try again.');
        }
    };

    const fetchRejectedCommission = async () => {
        try {
            const response = await axios.get('/api/commission/rejected', {
                headers: { Authorization: `Bearer ${token}` },
            });
            setRejectedCommission(response.data);
        } catch (err) {
            setError('Failed to fetch rejected commission data. Please try again.');
        }
    };

    const fetchAllCommissionOperational = async () => {
        try {
            const response = await axios.get('/api/commission/all-commission-status', {
                headers: { Authorization: `Bearer ${token}` },
            });
            setOperationalCommission(response.data);
        } catch (err) {
            setError('Failed to fetch operational commission data. Please try again.');
        }
    };

    useEffect(() => {
        if (token) {
            setLoading(true);
            Promise.all([fetchCollectedCommission(), fetchRejectedCommission(), fetchAllCommissionOperational()])
                .then(() => setLoading(false))
                .catch(() => setLoading(false));
        }
    }, [token]);

    if (loading) {
        return (
            <div className="text-center mt-5">
                <Spinner animation="grow" role="status"> </Spinner>
            </div>
        );
    }

    const getMonthName = (monthNumber) => {
        const monthNames = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December',
        ];
        return monthNames[monthNumber - 1];
    };

    const getMonthAndYear = (date) => {
        const [month, year] = date.split("-");
        const monthNames = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];
        return { monthName: monthNames[parseInt(month) - 1], year };
    };

    // Calculate company commissions
    const companyTotalCommission = collectedCommission && operationalCommission
        ? Math.round(collectedCommission.allTimeStats.totalCommission - operationalCommission.allTimeStats.totalCommission)
        : null;

    const companyCurrentMonthCommission = collectedCommission && operationalCommission
        ? Math.round(collectedCommission.currentMonthStats.totalCommission - operationalCommission.currentMonthStats.totalCommission)
        : null;

    const calculateCommissionDifference = () => {
        const collectedStats = collectedCommission?.monthWiseStats || [];
        const operationalStats = operationalCommission?.monthWiseStats || [];
        // Calculate the difference for each month
        const commissionDifferences = collectedStats.map((collectedStat) => {
            const operationalStat = operationalStats.find(
                (opStat) =>
                    opStat.year === collectedStat.year &&
                    opStat.month === collectedStat.month
            );

            return {
                year: collectedStat.year,
                month: collectedStat.month,
                collectedCommission: collectedStat.totalCommission || 0,
                operationalCommission: operationalStat?.totalCommission || 0,
                difference:
                    (collectedStat.totalCommission || 0) -
                    (operationalStat?.totalCommission || 0),
            };
        });

        return commissionDifferences; // Return array of monthly differences
    };

    const commissionData = calculateCommissionDifference();

    return (
        <Container className="mt-2">
            <Row className="gy-4">
                {/* Collected Commission */}
                <Col md={3}>
                    <Card className="h-100">
                        <Card.Body>
                            <Card.Title style={{ fontSize: '17px' }} className="text-center">Collected Commission</Card.Title>
                            {collectedCommission ? (
                                <div>
                                    <p><strong>Total Commission:</strong> {`${Math.round(collectedCommission.allTimeStats.totalCommission)} AED`}</p>
                                    <p><strong>Current Month Commission:</strong> {`${Math.round(collectedCommission.currentMonthStats.totalCommission)} AED`}</p>
                                </div>
                            ) : (
                                <p className="text-muted" style={{ color: 'white' }}>No Data Available.</p>
                            )}
                            <Button onClick={() => setCollectedModal(true)} >Collected</Button>
                        </Card.Body>
                    </Card>
                </Col>

                {/* Rejected Commission */}
                <Col md={3}>
                    <Card className="h-100">
                        <Card.Body>
                            <Card.Title style={{ fontSize: '17px' }} className="text-center">Rejected Commission</Card.Title>
                            {rejectedCommission ? (
                                <div>
                                    <p><strong>Total Commission:</strong> {`${Math.round(rejectedCommission.allTimeStats.totalCommission)} AED`}</p>
                                    <p><strong>Current Month Commission:</strong> {`${Math.round(rejectedCommission.currentMonthStats.totalCommission)} AED`}</p>
                                </div>
                            ) : (
                                <p className="text-muted" style={{ color: 'white' }}>No data available.</p>
                            )}
                            <Button onClick={() => setRejectedModal(true)} >Rejected</Button>
                        </Card.Body>
                    </Card>
                </Col>

                {/* Operational Commission */}
                <Col md={3}>
                    <Card className="h-100">
                        <Card.Body>
                            <Card.Title style={{ fontSize: '17px' }} className="text-center">Operational Commission</Card.Title>
                            {operationalCommission ? (
                                <div>
                                    <p><strong>Total Commission:</strong> {`${Math.round(operationalCommission.allTimeStats.totalCommission)} AED`}</p>
                                    <p><strong>Current Month Commission:</strong> {`${Math.round(operationalCommission.currentMonthStats.totalCommission)} AED`}</p>
                                </div>
                            ) : (
                                <p className="text-muted" style={{ color: 'white' }}>No data available.</p>
                            )}
                            <Button onClick={() => setAllCommissionOperationalModal(true)} >Commission</Button>
                        </Card.Body>
                    </Card>
                </Col>

                {/* Company Commission */}
                <Col md={3}>
                    <Card className="h-100">
                        <Card.Body>
                            <Card.Title style={{ fontSize: '17px' }} className="text-center">Company Commission</Card.Title>
                            {companyTotalCommission !== null && companyCurrentMonthCommission !== null ? (
                                <div>
                                    <p><strong>Total Commission:</strong> {`${companyTotalCommission} AED`}</p>
                                    <p><strong>Current Month Commission:</strong> {`${companyCurrentMonthCommission} AED`}</p>
                                </div>
                            ) : (
                                <p className="text-muted" style={{ color: 'white' }}>No data available.</p>
                            )}
                            {/* <Button onClick={() => setCompanyCommissionModal(true)} >Company</Button> */}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Modal for Collected Commission */}
            <Modal
                size="lg"
                aria-labelledby="contained-modal-title-vcenter"
                centered
                show={collectedModal}
                onHide={() => setCollectedModal(false)}
            >
                <Modal.Header closeButton style={{ border: 'none' }}>
                    <Modal.Title id="contained-modal-title-vcenter" style={{ color: '#d7aa47' }}>
                        Monthly Collected Commission
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {collectedCommission?.monthWiseStats && (
                        <Table striped bordered hover responsive variant="dark">
                            <thead>
                                <tr className='text-center' >
                                    <th style={{backgroundColor: '#d7aa47'}} >Year</th>
                                    <th style={{backgroundColor: '#d7aa47'}}>Month</th>
                                    <th style={{backgroundColor: '#d7aa47'}}>Total Commission (AED)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {collectedCommission.monthWiseStats.map((item, index) => (
                                    <tr key={index} className='text-center' >
                                        <td>{item.year}</td>
                                        <td>{getMonthName(item.month)}</td>
                                        <td>{`${Math.round(item.totalCommission)} AED`}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    )}
                </Modal.Body>
                <Modal.Footer style={{ border: 'none' }}>
                    <Button onClick={() => setCollectedModal(false)}>Close</Button>
                </Modal.Footer>
            </Modal>

            {/* Modal for Rejected Commission */}
            <Modal
                size="lg"
                aria-labelledby="contained-modal-title-vcenter"
                centered
                show={rejectedModal}
                onHide={() => setRejectedModal(false)}
            >
                <Modal.Header closeButton style={{ border: 'none' }}>
                    <Modal.Title id="contained-modal-title-vcenter" style={{ color: '#d7aa47' }}>
                        Monthly Rejected Commission
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {rejectedCommission?.monthWiseStats && (
                        <Table striped bordered hover responsive variant="dark">
                            <thead>
                                <tr className='text-center'>
                                    <th style={{backgroundColor: '#d7aa47'}} >Year</th>
                                    <th style={{backgroundColor: '#d7aa47'}}>Month</th>
                                    <th style={{backgroundColor: '#d7aa47'}}>Total Commission (AED)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rejectedCommission.monthWiseStats.map((item, index) => (
                                    <tr key={index} className='text-center' >
                                        <td>{item.year}</td>
                                        <td>{getMonthName(item.month)}</td>
                                        <td>{`${Math.round(item.totalCommission)} AED`}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    )}
                </Modal.Body>
                <Modal.Footer style={{ border: 'none' }}>
                    <Button onClick={() => setRejectedModal(false)}>Close</Button>
                </Modal.Footer>
            </Modal>

            {/* Modal for All operational Commission */}
            <Modal
                size="lg"
                aria-labelledby="contained-modal-title-vcenter"
                centered
                show={allCommissionOperationalModal}
                onHide={() => setAllCommissionOperationalModal(false)}
            >
                <Modal.Header closeButton style={{ border: "none" }}>
                    <Modal.Title id="contained-modal-title-vcenter" style={{ color: '#d7aa47' }} >
                        Monthly Operational Commission
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {operationalCommission?.monthWiseStats?.length > 0 ? (
                        <Table striped bordered hover responsive variant="dark">
                            <thead>
                                <tr className='text-center'>
                                    <th style={{backgroundColor: '#d7aa47'}} >Year</th>
                                    <th style={{backgroundColor: '#d7aa47'}}>Month</th>
                                    <th style={{backgroundColor: '#d7aa47'}}>Total Commission</th>
                                    <th style={{backgroundColor: '#d7aa47'}}>Paid Commission</th>
                                    <th style={{backgroundColor: '#d7aa47'}}>Remaining Commission</th>
                                </tr>
                            </thead>
                            <tbody>
                                {operationalCommission.monthWiseStats.map((item, index) => {
                                    const { monthName, year } = getMonthAndYear(item.month);
                                    return (
                                        <tr key={index} className='text-center' >
                                            <td>{year}</td>
                                            <td>{monthName}</td>
                                            <td>{`${Math.round(item.totalCommission)}AED`}</td>
                                            <td>{`${Math.round(item.totalPaidCommission)}AED`}</td>
                                            <td>{`${Math.round(item.totalRemainingCommission)}AED`}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </Table>
                    ) : (
                        <p style={{ color: '#d7aa47' }}>No data available for Monthly Operational Commission.</p>
                    )}
                </Modal.Body>
                <Modal.Footer style={{ border: "none" }}>
                    <Button onClick={() => setAllCommissionOperationalModal(false)}>Close</Button>
                </Modal.Footer>
            </Modal>

            {/* Modal for All Company Commission */}
            <Modal
                size="lg"
                aria-labelledby="contained-modal-title-vcenter"
                centered
                show={companyCommissionModal}
                onHide={() => setCompanyCommissionModal(false)}
            >
                <Modal.Header closeButton style={{ border: 'none' }}>
                    <Modal.Title
                        id="contained-modal-title-vcenter"
                        style={{ color: '#d7aa47' }}
                    >
                        Monthly Company Commission
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Year</th>
                                <th>Month</th>
                                <th>Collected Commission</th>
                                <th>Operational Commission</th>
                                <th>Difference</th>
                            </tr>
                        </thead>
                        <tbody>
                            {commissionData.length > 0 ? (
                                commissionData.map((data, index) => (
                                    <tr key={index}>
                                        <td>{data.year || 'N/A'}</td>
                                        <td>{data.month || 'N/A'}</td>
                                        <td>{data.collectedCommission.toFixed(2)}</td>
                                        <td>{data.operationalCommission.toFixed(2)}</td>
                                        <td>{data.difference.toFixed(2)}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="text-center">
                                        No data available
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </Modal.Body>
                <Modal.Footer style={{ border: 'none' }}>
                    <Button onClick={() => setCompanyCommissionModal(false)}>Close</Button>
                </Modal.Footer>
            </Modal>

        </Container>
    );
};

export default CeoCommissionDashboard;
// all-pipelines-commission