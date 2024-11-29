import React, { useState, useEffect } from 'react';
import { Table, Form, Container, Row, Col, Card, Button } from 'react-bootstrap';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Sidebar from '../../Components/sidebar/Sidebar';
import { LuView } from "react-icons/lu";

const LeadConverted = () => {
    const token = useSelector(state => state.loginSlice.user?.token);
    const userID = useSelector(state => state.loginSlice.user?._id);
    const [blockedNumbers, setBlockedNumbers] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredNumbers, setFilteredNumbers] = useState([]);
    const [rtl, setRtl] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 14; // Show 13 items on the first page
    const navigate = useNavigate();

    useEffect(() => {
        if (!token) {
            navigate('/');
        } else {
            // Fetch blocked numbers from the API
            axios.get(`${process.env.REACT_APP_BASE_URL}/api/phonebook/get-leads-numbers`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            })
                .then(response => {
                    // Filter the data to include only entries where userID matches in lead_id.selected_users
                    const filteredData = response.data.filter(entry =>
                        entry.lead_id?.selected_users?.some(user => user._id === userID)
                    );
                    setBlockedNumbers(filteredData);
                    setFilteredNumbers(filteredData); // Initialize filtered numbers
                })
                .catch(error => {
                    console.error('Error fetching blocked numbers:', error);
                });
        }
    }, [token, userID, navigate]);

    useEffect(() => {
        const savedRtl = localStorage.getItem('rtl');
        setRtl(savedRtl); // Update state with the 'rtl' value from localStorage
    }, [rtl]);

    useEffect(() => {
        // Filter numbers based on search query for both number and user name
        if (searchQuery) {
            const queryLower = searchQuery.toLowerCase();
            setFilteredNumbers(blockedNumbers.filter(entry =>
                entry.number.toLowerCase().includes(queryLower) ||
                entry.status.toLowerCase().includes(queryLower) ||
                (entry.user && entry.user.name && entry.user.name.toLowerCase().includes(queryLower))
            ));
            setCurrentPage(1); // Reset to the first page when search is applied
        } else {
            setFilteredNumbers(blockedNumbers);
        }
    }, [searchQuery, blockedNumbers]);

    const handlePreviousPage = () => {
        if (currentPage > 1) setCurrentPage(prevPage => prevPage - 1);
    };

    const handleNextPage = () => {
        if (currentPage < Math.ceil(filteredNumbers.length / itemsPerPage)) {
            setCurrentPage(prevPage => prevPage + 1);
        }
    };

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredNumbers.slice(indexOfFirstItem, indexOfLastItem);

    return (
        <div>
            <Container fluid style={{ direction: rtl === 'true' ? 'rtl' : 'ltr' }}>
                <Row>
                    <Col xs={12} md={12} lg={2}>
                        <Sidebar />
                    </Col>
                    <Col xs={12} md={12} lg={10}>
                        <Card className="leads_main_cards mt-4">
                            <h2
                                className="text-center mt-3 mutual_heading_class"
                                style={{
                                    direction: rtl === 'true' ? 'rtl' : 'ltr',
                                }}
                            >
                                {rtl === 'true' ? `إجمالي العملاء المحولين: ${filteredNumbers.length}` : `Total Converted Leads: ${filteredNumbers.length}`}
                            </h2>
                            <div className="phonebook-container">
                                <div style={{ display: 'flex', justifyContent: rtl === 'true' ? 'flex-start' : 'flex-end', alignItems: 'flex-end' }}>
                                    <Form.Group controlId="searchBar">
                                        <Form.Control
                                            type="text"
                                            placeholder={rtl === 'true' ? "البحث برقم أو اسم المستخدم" : "Search by Number/Name"}
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="input_field_input_field"
                                        />
                                    </Form.Group>
                                </div>

                                {currentItems.length > 0 ? (
                                    <>
                                        <Table hover bordered responsive className="mt-3 table_main_container" size="md">
                                            <thead style={{ backgroundColor: '#f8f9fd' }}>
                                                <tr
                                                    className="teble_tr_class"
                                                    style={{
                                                        backgroundColor: '#000',
                                                        color: '#343a40',
                                                        borderBottom: '1px solid #d7aa47',
                                                        transition: 'background-color 0.3s ease',
                                                    }}
                                                >
                                                    <th style={{ backgroundColor: '#d7aa47' }} className="equal-width">{rtl === 'true' ? 'المستخدم' : 'User'}</th>
                                                    <th style={{ backgroundColor: '#d7aa47' }} className="equal-width">{rtl === 'true' ? 'رقم' : 'Number'}</th>
                                                    <th style={{ backgroundColor: '#d7aa47' }} className="equal-width">{rtl === 'true' ? 'الحالة' : 'Status'}</th>
                                                    <th style={{ backgroundColor: '#d7aa47' }} className="equal-width">{rtl === 'true' ? 'حالة المكالمة' : 'Call Status'}</th>
                                                    <th style={{ backgroundColor: '#d7aa47' }} className="equal-width">{rtl === 'true' ? 'خط الأنابيب' : 'Pipeline'}</th>
                                                    <th style={{ backgroundColor: '#d7aa47' }} className="equal-width">{rtl === 'true' ? 'عرض العميل' : 'View Lead'}</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {currentItems.map((entry, index) => (
                                                    <tr key={index}>
                                                        <td style={{ textAlign: 'center' }} className="table_td_class">
                                                            <div className="name-container">
                                                                {entry.user?.name
                                                                    ? entry.user.name.split(' ').slice(0, 15).join(' ') +
                                                                    (entry.user.name.split(' ').length > 15 ? '...' : '')
                                                                    : 'N/A'}
                                                                {entry.user?.name && <span className="tooltip">{entry.user.name}</span>}
                                                            </div>
                                                        </td>
                                                        <td className="table_td_class" style={{ direction: rtl === 'true' ? 'ltr' : 'ltr' }}>{entry.number}</td>
                                                        <td className="table_td_class">{entry.status}</td>
                                                        <td className="table_td_class">{entry.calstatus}</td>
                                                        <td className="table_td_class">{entry.pipeline?.name}</td>
                                                        <td className="table_td_class">
                                                            <Link to={`/single-leads/${entry.lead_id._id}`} style={{ textDecoration: 'none' }}>
                                                                <LuView style={{ color: '#ffa000', fontSize: '20px', cursor: 'pointer' }} />
                                                            </Link>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </Table>

                                        <div
                                            className="d-flex justify-content-center align-items-center mt-3"
                                            style={{
                                                direction: rtl === 'true' ? 'rtl' : 'ltr',
                                            }}
                                        >
                                            <Button
                                                className="all_common_btn_single_lead"
                                                onClick={handlePreviousPage}
                                                disabled={currentPage === 1}
                                            >
                                                {rtl === 'true' ? 'السابق' : 'Previous'}
                                            </Button>
                                            <span
                                                className="mutual_heading_class"
                                                style={{
                                                    textAlign: rtl === 'true' ? 'right' : 'left',
                                                    direction: rtl === 'true' ? 'rtl' : 'ltr',
                                                }}
                                            >
                                                {rtl === 'true' ? `الصفحة ${currentPage} من ${Math.ceil(filteredNumbers.length / itemsPerPage)}` : `Page ${currentPage} of ${Math.ceil(filteredNumbers.length / itemsPerPage)}`}
                                            </span>
                                            <Button
                                                className="all_common_btn_single_lead"
                                                onClick={handleNextPage}
                                                disabled={currentPage === Math.ceil(filteredNumbers.length / itemsPerPage)}
                                            >
                                                {rtl === 'true' ? 'التالي' : 'Next'}
                                            </Button>
                                        </div>
                                    </>
                                ) : (
                                    <p className="mutual_heading_class">{rtl === 'true' ? 'لا توجد أرقام عملاء متاحة.' : 'No Leads Numbers Available.'}</p>
                                )}
                            </div>
                        </Card>

                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default LeadConverted;
