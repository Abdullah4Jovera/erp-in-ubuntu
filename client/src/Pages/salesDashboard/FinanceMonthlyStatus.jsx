import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { Card, Container, Spinner } from 'react-bootstrap';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const FinanceMonthlyStatus = () => {
    const token = useSelector((state) => state.loginSlice.user?.token);
    const userTarget = useSelector((state) => state.loginSlice.user?.target);

    const [financeData, setFinanceData] = useState(null);
    const [monthWiseStats, setMonthWiseStats] = useState([]);
    const [progressPercentage, setProgressPercentage] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchFinanceStatus = async () => {
            try {
                setLoading(true);
                const response = await axios.get('/api/commission/finance-status', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                const data = response.data;
                setFinanceData(data);
                setMonthWiseStats(data.monthWiseStats || []);

                // Calculate progress percentage
                const totalFinanceAmount = data?.currentMonthStats?.totalFinanceAmount || 0;

                if (userTarget > 0) {
                    let percentage = ((totalFinanceAmount / userTarget) * 100).toFixed(2);
                    // Ensure percentage does not exceed 100%
                    percentage = Math.min(percentage, 100);
                    setProgressPercentage(percentage);
                } else {
                    setProgressPercentage(0);
                }

                setError(null);
            } catch (err) {
                setError(err.response?.data?.message || 'An error occurred');
            } finally {
                setLoading(false);
            }
        };

        if (token) {
            fetchFinanceStatus();
        }
    }, [token, userTarget]);

    // Prepare data for the bar chart
    const chartData = {
        labels: monthWiseStats.map((item) => item.month),
        datasets: [
            {
                label: 'Finance Amount',
                data: monthWiseStats.map((item) => item.financeAmount),
                backgroundColor: 'rgb(93,135,54)', // White bars
                borderColor: 'rgb(93,135,54)', // White borders
                borderWidth: 1,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: {
                labels: {
                    color: 'white', // Legend text color
                },
                position: 'top',
            },
            title: {
                display: true,
                text: 'Month-Wise Finance Amount',
                color: 'white', // Title text color
            },
            tooltip: {
                bodyColor: 'white', // Tooltip text color
                backgroundColor: 'rgba(0, 0, 0, 0.8)', // Tooltip background
                titleColor: 'white', // Tooltip title color
            },
        },
        scales: {
            x: {
                ticks: {
                    color: 'white', // X-axis tick color
                },
                grid: {
                    color: 'rgba(255, 255, 255, 0.2)', // Grid line color
                },
                title: {
                    display: true,
                    text: 'Months',
                    color: 'white', // X-axis title color
                },
            },
            y: {
                ticks: {
                    color: 'white', // Y-axis tick color
                },
                grid: {
                    color: 'rgba(255, 255, 255, 0.2)', // Grid line color
                },
                title: {
                    display: true,
                    text: 'Finance Amount',
                    color: 'white', // Y-axis title color
                },
            },
        },
    };

    return (
        <Container>
            {loading ? (
                <div className="d-flex justify-content-center align-items-center" style={{ height: '200px' }}>
                    <Spinner animation="grow" style={{ color: '#d7aa47' }} />
                </div>
            ) : error ? (
                <p style={{ color: 'red' }}>{error}</p>
            ) : (
                <Card className='bg-dark' style={{  color: 'white' }}> {/* Black background */}
                    <Card.Body>
                        <Bar data={chartData} options={chartOptions} style={{ maxHeight: '300px' }} />
                    </Card.Body>
                </Card>
            )}
        </Container>
    );
};

export default FinanceMonthlyStatus;
