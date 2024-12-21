import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Container, Row, Col, Card, Spinner, Modal, Button, Form, Table, InputGroup } from 'react-bootstrap';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import SidebarComponent from '../Components/sidebar/Sidebar';

const CommissionsList = () => {
    const [commissions, setCommissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);
    const [paymentData, setPaymentData] = useState({});
    const [showModal, setShowModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState(''); // State for search query
    const [errorsMessage, setErrorsMessage] = useState({});
    const [confirmModal, setConfirmModal] = useState(false);
    const [currentDeal, setCurrentDeal] = useState(null);

    useEffect(() => {
        const fetchCommissions = async () => {
            try {
                const response = await axios.get(`/api/commission/commissions`);
                setCommissions(response.data.commissions);
                setLoading(false);
            } catch (err) {
                setError('Failed to fetch commissions');
                setLoading(false);
            }
        };

        fetchCommissions();
    }, []);

    // Aggregate commissions by userId and dealId
    const aggregatedCommissions = commissions.reduce((acc, commission) => {
        const userId = commission.userId._id;
        const dealId = commission.dealId._id;
        if (!acc[userId]) {
            acc[userId] = {
                user: commission.userId,
                deals: {},
                totalCommission: 0,
                paidCommission: 0,
                remainingCommission: 0,
            };
        }
        if (!acc[userId].deals[dealId]) {
            acc[userId].deals[dealId] = {
                deal: commission.dealId,
                totalCommission: 0,
                paidCommission: 0,
                remainingCommission: 0,
            };
        }
        // Update the totals for the individual deal and the user
        acc[userId].deals[dealId].totalCommission += commission.totalCommission;
        acc[userId].deals[dealId].paidCommission += commission.paidCommission || 0;
        acc[userId].deals[dealId].remainingCommission += commission.remainingCommission || 0;

        acc[userId].totalCommission += commission.totalCommission;
        acc[userId].paidCommission += commission.paidCommission || 0;
        acc[userId].remainingCommission += commission.remainingCommission || 0;

        return acc;
    }, {});

    // Filter the aggregated commissions based on the search query
    const filteredCommissions = Object.values(aggregatedCommissions).filter(userCommission =>
        userCommission.user.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handlePaymentChange = (userId, dealId, value) => {
        setPaymentData(prev => ({
            ...prev,
            [`${userId}-${dealId}`]: value
        }));
    };

    const handlePaymentSubmit = async (userId, dealId, paymentAmount) => {
        try {
            await axios.put(`/api/commission/commissions/pay`, {
                userId,
                dealId,
                paymentAmount
            });

            toast.success('Payment successful!');
            setCommissions(prev => prev.map(commission =>
                commission.userId._id === userId && commission.dealId._id === dealId
                    ? {
                        ...commission,
                        paidCommission: commission.paidCommission + paymentAmount,
                        remainingCommission: commission.remainingCommission - paymentAmount
                    }
                    : commission
            ));
            setPaymentData({})

        } catch (err) {
            console.error(err);
            toast.error('Failed to process payment.');
        }
    };

    const handleFullPayment = (userId, dealId, remainingCommission) => {
        const paymentAmount = remainingCommission;

        // Check if the paymentAmount is a valid number
        if (isNaN(paymentAmount) || paymentAmount <= 0) {
            toast.error('Invalid payment amount.');
            return;
        }

        // Check if the payment amount exceeds the remaining commission
        if (paymentAmount > remainingCommission) {
            toast.error('Payment amount exceeds remaining commission.');
            return;
        }

        // Directly hit the API for full payment
        handlePaymentSubmit(userId, dealId, paymentAmount);
    };

    const openPaymentModal = (user) => {
        setSelectedUser(user);
        setShowModal(true);
    };

    const closePaymentModal = () => {
        setSelectedUser(null);
        setPaymentData({});
        setShowModal(false);
        setErrorsMessage({})
    };

    if (loading) {
        return <div className="text-center my-5"><Spinner animation="grow" style={{ color: '#d7aa47' }} /></div>;
    }

    const handleClearSearch = () => {
        setSearchQuery("");
    };

    const validatePayment = (userId, dealId, value) => {
        const key = `${userId}-${dealId}`;
        if (!value || isNaN(value) || Number(value) <= 0) {
            setErrorsMessage(prevErrors => ({
                ...prevErrors,
                [key]: 'Please Enter Amount',
            }));
            return false;
        } else {
            setErrorsMessage(prevErrors => {
                const { [key]: removedError, ...rest } = prevErrors;
                return rest;
            });
            return true;
        }
    };

    const handleFullPaymentClick = (userId, dealId, remainingCommission) => {
        setCurrentDeal({ userId, dealId, remainingCommission });
        setConfirmModal(true);
    };

    const handleConfirmFullPayment = () => {
        if (currentDeal) {
            const { userId, dealId, remainingCommission } = currentDeal;
            handlePaymentSubmit(userId, dealId, remainingCommission);
        }
        setConfirmModal(false);
        setShowModal(false)
    };

    return (
        <div>
            <ToastContainer
                position="bottom-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
            />
            <Container fluid>
                <Row>
                    <Col xs={12} md={12} lg={2}>
                        {/* <SidebarComponent /> */}
                    </Col>

                    <Col xs={12} md={12} lg={10}>
                        <Card className="leads_main_cards mt-4">
                            <h2 style={{ color: 'white', textAlign: 'center' }}>Commission Payments</h2>

                            {/* Search Field */}
                            <div className="mb-3" style={{ width: '100%', maxWidth: '500px' }} >
                                <InputGroup>
                                    <Form.Control
                                        type="text"
                                        placeholder="Search by Client Name"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
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


                            <div style={{ height: '100%', maxHeight: '700px', overflowY: 'auto' }}>
                                <Table striped bordered hover responsive variant="dark" className='table_main_container'>
                                    <thead>
                                        <tr>
                                            <th style={{ backgroundColor: '#d7aa47' }} >User</th>
                                            <th style={{ backgroundColor: '#d7aa47' }}>Email</th>
                                            <th style={{ backgroundColor: '#d7aa47' }}>Total Commission</th>
                                            <th style={{ backgroundColor: '#d7aa47' }}>Paid Commission</th>
                                            <th style={{ backgroundColor: '#d7aa47' }}>Remaining Commission</th>
                                            <th style={{ backgroundColor: '#d7aa47' }}>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredCommissions.map(userCommission => (
                                            <tr key={userCommission.user._id}>
                                                <td className="table_td_class">{userCommission.user.name}</td>
                                                <td className="table_td_class">{userCommission.user.email}</td>
                                                <td className="table_td_class">{`${Math.round(userCommission.totalCommission)} AED`}</td>
                                                <td className="table_td_class">{`${Math.round(userCommission.paidCommission)} AED`}</td>
                                                <td className="table_td_class">{`${Math.round(userCommission.remainingCommission)} AED`}</td>
                                                <td className="table_td_class" style={{ textAlign: 'center' }}>
                                                    <Button style={{ backgroundColor: '#d7aa47', border: 'none' }} onClick={() => openPaymentModal(userCommission)}>
                                                        Pay
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            </div>

                            {/* Modal for showing deals and payment input */}
                            <Modal
                                show={showModal}
                                onHide={closePaymentModal}
                                centered
                                size="md"
                                style={{ height: '100%', maxHeight: '800px', overflowY: 'auto' }}
                            >
                                <Modal.Header closeButton style={{ border: 'none' }}>
                                    <Modal.Title style={{ color: '#d7aa47' }}>
                                        Payment for {selectedUser?.user.name}
                                    </Modal.Title>
                                </Modal.Header>
                                <Modal.Body>
                                    {selectedUser &&
                                        Object.values(selectedUser.deals).map(deal => {
                                            if (deal.remainingCommission <= 0) return null;

                                            const remainingCommission = Math.round(deal.remainingCommission);
                                            const totalCommission = Math.round(deal.totalCommission);
                                            const paidCommission = Math.round(deal.paidCommission);
                                            const clientName = deal.deal.client_id?.name || 'Unknown Client';
                                            const key = `${selectedUser.user._id}-${deal.deal._id}`;

                                            return (
                                                <div key={deal.deal._id} className="deal-container">
                                                    <p>
                                                        <span style={{ color: '#d7aa47', textAlign: 'center' }}> {clientName}</span> <br />
                                                        <span style={{ color: "white" }}>Total Amount : </span>
                                                        <span style={{ color: '#d7aa47' }}>{`${totalCommission} AED`}</span>
                                                        <br />
                                                        <span style={{ color: "white" }}>Paid Amount : </span>
                                                        <span style={{ color: '#d7aa47' }}>{`${paidCommission} AED`}</span>
                                                        <br />
                                                        <span style={{ color: "white" }}>Remaining Amount : </span>
                                                        <span style={{ color: '#d7aa47' }}>{`${remainingCommission} AED`}</span>
                                                    </p>
                                                    <Form.Group className="mb-2">
                                                        <Form.Control
                                                            type="text"
                                                            value={paymentData[key] || ''}
                                                            onChange={e => {
                                                                handlePaymentChange(selectedUser.user._id, deal.deal._id, e.target.value);
                                                                validatePayment(selectedUser.user._id, deal.deal._id, e.target.value);
                                                            }}
                                                            placeholder="Enter Amount"
                                                            className='input_field_input_field'
                                                        />
                                                        {errorsMessage[key] && (
                                                            <span style={{ color: 'red', fontSize: '0.9rem' }}>{errorsMessage[key]}</span>
                                                        )}
                                                    </Form.Group>
                                                    <Button
                                                        variant="success"
                                                        onClick={() => {
                                                            const isValid = validatePayment(selectedUser.user._id, deal.deal._id, paymentData[key]);
                                                            if (isValid) {
                                                                handlePaymentSubmit(selectedUser.user._id, deal.deal._id, deal.remainingCommission);
                                                            }
                                                        }}
                                                    >
                                                        Pay
                                                    </Button>
                                                    <Button
                                                        onClick={() =>
                                                            handleFullPaymentClick(selectedUser.user._id, deal.deal._id, deal.remainingCommission)
                                                        }
                                                        style={{ marginLeft: '10px', backgroundColor: '#d7aa47', border: 'none' }}
                                                    >
                                                        Full Payment
                                                    </Button>
                                                    <hr />
                                                </div>
                                            );
                                        })}
                                </Modal.Body>
                                <Modal.Footer style={{ border: 'none' }}>
                                    <Button variant="secondary" onClick={closePaymentModal}>Close</Button>
                                </Modal.Footer>
                            </Modal>

                            {/* Confirmation Modal */}
                            <Modal
                                show={confirmModal}
                                onHide={() => setConfirmModal(false)}
                                centered
                            >
                                <Modal.Header closeButton style={{ color: '#d7aa47', border: 'none' }}>
                                    <Modal.Title>Confirm Full Payment</Modal.Title>
                                </Modal.Header>
                                <Modal.Body>
                                    <p style={{ color: '#fff' }}>Are you sure you want to proceed with the full payment?</p>
                                </Modal.Body>
                                <Modal.Footer style={{ color: '#d7aa47', border: 'none' }}>
                                    <Button variant="secondary" onClick={() => setConfirmModal(false)}>No</Button>
                                    <Button variant="success" onClick={handleConfirmFullPayment}>Pay</Button>
                                </Modal.Footer>
                            </Modal>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default CommissionsList;
