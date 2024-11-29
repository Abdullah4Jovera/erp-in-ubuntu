import React, { useState, useEffect } from 'react';
import { Table, Form, Container, Row, Col, Card, Button, Image } from 'react-bootstrap';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Sidebar from '../../Components/sidebar/Sidebar';
import blovkimage from '../../Assets/blovkimage.png';

const Blocklist = () => {
    const token = useSelector(state => state.loginSlice.user?.token);
    const [blockedNumbers, setBlockedNumbers] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredNumbers, setFilteredNumbers] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [rtl, setRtl] = useState(null);
    const itemsPerPage = 34; // Show 15 items per page
    const navigate = useNavigate();

    useEffect(() => {
        if (!token) {
            navigate('/');
        } else {
            axios.get(`${process.env.REACT_APP_BASE_URL}/api/phonebook/get-blocked-numbers`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                }
            })
                .then(response => {
                    setBlockedNumbers(response.data);
                    setFilteredNumbers(response.data);
                })
                .catch(error => {
                    console.error('Error fetching blocked numbers:', error);
                });
        }
    }, [token, navigate]);

    useEffect(() => {
        const savedRtl = localStorage.getItem('rtl');
        setRtl(savedRtl); // Update state with the 'rtl' value from localStorage
    }, [rtl]);

    useEffect(() => {
        if (searchQuery) {
            setFilteredNumbers(blockedNumbers.filter(entry =>
                entry.number.includes(searchQuery) || entry.status.includes(searchQuery)
            ));
            setCurrentPage(1); // Reset to the first page when a search is applied
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

    const halfLength = Math.ceil(currentItems.length / 2);
    const firstHalf = currentItems.slice(0, halfLength);
    const secondHalf = currentItems.slice(halfLength);

    return (
        <div>
            <Container fluid style={{ direction: rtl === 'true' ? 'rtl' : 'ltr' }}>
                <Row>
                    <Col xs={12} md={12} lg={2}>
                        <Sidebar />
                    </Col>
                    <Col xs={12} md={12} lg={10}>
                        <Card className='leads_main_cards mt-4'>
                            <Image
                                src={blovkimage}
                                className='rejected_image'
                                alt='Blocked Image'
                                style={{ width: '100px', height: '100px', borderRadius: '50%' }}
                            />
                            <h3
                                className="text-center mutual_heading_class"
                                style={{
                                    textAlign: rtl === 'true' ? 'right' : 'left',
                                    direction: rtl === 'true' ? 'rtl' : 'ltr',
                                }}
                            >
                                {rtl === 'true'
                                    ? `إجمالي الأرقام المحظورة: ${filteredNumbers.length}`
                                    : `Total Blocked Numbers: ${filteredNumbers.length}`}
                            </h3>
                            <div className="phonebook-container">
                                <div
                                    style={{
                                        width: '100%',
                                        maxWidth: '1600px',
                                        display: 'flex',
                                        justifyContent: rtl === 'true' ? 'flex-start' : 'flex-end', // Adjust alignment based on RTL or LTR
                                        alignItems: 'flex-end',
                                        direction: rtl === 'true' ? 'rtl' : 'ltr', // Set text direction
                                    }}
                                >
                                    <Form.Group controlId="searchBar" >
                                        <Form.Control
                                            type="text"
                                            placeholder={rtl === 'true' ? "البحث بالرقم" : "Search by Number"} // Adjust placeholder text based on RTL
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className='input_field_input_field'
                                            style={{
                                                textAlign: rtl === 'true' ? 'right' : 'left', // Adjust text alignment for input field
                                            }}
                                        />
                                    </Form.Group>
                                </div>

                                {currentItems.length > 0 ? (
                                    <>
                                        <Row className="mt-3">
                                            <Col xs={12} md={6}>
                                                <Table hover bordered responsive className='table_main_container' size='md'>
                                                    <thead className='table_head' style={{ backgroundColor: '#f8f9fd' }}>
                                                        <tr className="teble_tr_class" style={{ backgroundColor: '#e9ecef', color: '#343a40', borderBottom: '1px solid #d7aa47' }}>
                                                            <th
                                                                style={{
                                                                    backgroundColor: '#d7aa47',
                                                                    textAlign: rtl === 'true' ? 'center' : 'center', // Adjust text alignment based on RTL
                                                                }}
                                                                className="equal-width"
                                                            >
                                                                {rtl === 'true' ? 'الرقم' : 'Number'}  {/* Localize column name */}
                                                            </th>

                                                            <th
                                                                style={{
                                                                    backgroundColor: '#d7aa47',
                                                                    textAlign: rtl === 'true' ? 'center' : 'center', // Adjust text alignment based on RTL
                                                                }}
                                                                className="equal-width"
                                                            >
                                                                {rtl === 'true' ? 'الحالة' : 'Status'}  {/* Localize column name */}
                                                            </th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {firstHalf.map((entry, index) => (
                                                            <tr key={index}>
                                                                <td className='table_td_class' style={{ textAlign: 'center',direction: rtl === 'true' ? 'ltr' : 'ltr' }}>{entry.number}</td>
                                                                <td className='table_td_class' style={{ textAlign: 'center',direction: rtl === 'true' ? 'ltr' : 'ltr' }}>{entry.status}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </Table>
                                            </Col>
                                            <Col xs={12} md={6}>
                                                <Table hover bordered responsive className='table_main_container' size='md'>
                                                    <thead className='table_head' style={{ backgroundColor: '#f8f9fd' }}>
                                                        <tr className="teble_tr_class" style={{ backgroundColor: '#e9ecef', color: '#343a40', borderBottom: '1px solid #dee2e6' }}>
                                                            <th
                                                                style={{
                                                                    backgroundColor: '#d7aa47',
                                                                    textAlign: rtl === 'true' ? 'center' : 'center', // Adjust text alignment based on RTL
                                                                }}
                                                                className="equal-width"
                                                            >
                                                                {rtl === 'true' ? 'الرقم' : 'Number'}  {/* Localize column name */}
                                                            </th>

                                                            <th
                                                                style={{
                                                                    backgroundColor: '#d7aa47',
                                                                    textAlign: rtl === 'true' ? 'center' : 'center', // Adjust text alignment based on RTL
                                                                }}
                                                                className="equal-width"
                                                            >
                                                                {rtl === 'true' ? 'الحالة' : 'Status'}  {/* Localize column name */}
                                                            </th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {secondHalf.map((entry, index) => (
                                                            <tr key={index}>
                                                                <td className='table_td_class' style={{ textAlign: 'center', direction: rtl === 'true' ? 'ltr' : 'ltr' }}>{entry.number}</td>
                                                                <td className='table_td_class' style={{ textAlign: 'center' }}>{entry.status}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </Table>
                                            </Col>
                                        </Row>

                                        <div className="d-flex justify-content-center align-items-center">
                                            <Button
                                                className='all_common_btn_single_lead'
                                                onClick={handlePreviousPage}
                                                disabled={currentPage === 1}
                                            >
                                                Previous
                                            </Button>
                                            <span className='mutual_heading_class' >Page {currentPage} of {Math.ceil(filteredNumbers.length / itemsPerPage)}</span>
                                            <Button
                                                className='all_common_btn_single_lead'
                                                onClick={handleNextPage}
                                                disabled={currentPage === Math.ceil(filteredNumbers.length / itemsPerPage)}
                                            >
                                                Next
                                            </Button>
                                        </div>
                                    </>
                                ) : (
                                    <p className='mutual_heading_class'>No Blocked Numbers Available.</p>
                                )}
                            </div>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default Blocklist;
