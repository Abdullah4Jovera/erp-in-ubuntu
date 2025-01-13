import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Spinner } from 'react-bootstrap';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import { useSelector } from 'react-redux';

const CurrentMonthStatus = () => {
    const [currentMonthStats, setCurrentMonthStats] = useState(null);
    const [loading, setLoading] = useState(false);
    const token = useSelector((state) => state.loginSlice.user?.token);
    useEffect(() => {
        const fetchCommissionStatus = async () => {
            setLoading(true);
            try {
                const response = await axios.get('/api/commission/commission-status', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                });
                if (response.data && response.data) {
                    setCurrentMonthStats(response.data);
                } else {
                    toast.error('Failed to fetch current month stats.');
                }
            } catch (error) {
                toast.error('Error fetching data. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchCommissionStatus();
    }, []);

    return (
        <Container className="mt-2 mb-2">
            <ToastContainer />
            {loading ? (
                <div className="d-flex justify-content-center align-items-center" style={{ height: '200px' }}>
                    <Spinner animation="grow" style={{ color: '#d7aa47' }} />
                </div>
            ) : currentMonthStats ? (
                <Row>
                    {['Total Commission', 'Paid Commission', 'Remaining Commission'].map((title, index) => {
                        const stats = [
                            `${currentMonthStats?.allTimeStats?.totalCommission} AED`,
                            `${currentMonthStats.currentMonthStats.totalPaidCommission} AED`,
                            `${currentMonthStats.currentMonthStats.totalRemainingCommission} AED`,
                        ];

                        return (
                            <Col md={4} key={index}>
                                <Card
                                    className="text-center card-custom"
                                >
                                    <Card.Body>
                                        <Card.Title>{title}</Card.Title>
                                        <Card.Text className="fs-4">{stats[index]}</Card.Text>
                                    </Card.Body>
                                </Card>
                            </Col>
                        );
                    })}
                </Row>
            ) : (
                <p className="text-center" style={{ color: '#d7aa47' }} >No data available for the current month.</p>
            )}
        </Container>
    );
};

export default CurrentMonthStatus;
