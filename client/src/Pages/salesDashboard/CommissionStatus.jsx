import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import { Spinner, Alert, Container, Card } from 'react-bootstrap';
import {
    Chart as ChartJS,
    LineElement,
    PointElement,
    CategoryScale,
    LinearScale,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';

// Register necessary Chart.js components
ChartJS.register(LineElement, PointElement, CategoryScale, LinearScale, Title, Tooltip, Legend);

const CommissionStatus = () => {
    const token = useSelector((state) => state.loginSlice.user?.token);
    const userTarget = useSelector((state) => state.loginSlice.user?.target);

    const [commissionData, setCommissionData] = useState(null);
    const [monthWiseStats, setMonthWiseStats] = useState([]);
    const [progressPercentage, setProgressPercentage] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchFinanceStatus = async () => {
            try {
                setLoading(true);
                const response = await axios.get('/api/commission/commission-status', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                const data = response.data;
                setCommissionData(data);
                setMonthWiseStats(data.monthWiseStats || []);

                // Calculate progress percentage
                const totalFinanceAmount = data?.currentMonthStats?.totalFinanceAmount || 0;

                if (userTarget > 0) {
                    let percentage = ((totalFinanceAmount / userTarget) * 100).toFixed(2);
                    percentage = Math.min(percentage, 100); // Cap percentage at 100%
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

    // Prepare data for the chart
    const chartData = {
        labels: monthWiseStats.map((stat) => stat.month),
        datasets: [
            {
                label: 'Total Commission',
                data: monthWiseStats.map((stat) => stat.totalCommission),
                borderColor: 'rgb(252,199,55)',
                backgroundColor: 'rgb(252,199,55)',
                fill: true,
            },
            {
                label: 'Paid Commission',
                data: monthWiseStats.map((stat) => stat.totalPaidCommission),
                borderColor: 'rgb(93,135,54)',
                backgroundColor: 'rgb(93,135,54)',
                fill: true,
            },
            {
                label: 'Remaining Commission',
                data: monthWiseStats.map((stat) => stat.totalRemainingCommission),
                borderColor: 'rgba(255, 0, 0, 1)',
                backgroundColor: 'rgba(255, 0, 0, 1)',
                fill: true,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            title: {
                display: true,
                text: 'Commission Status',
                color: 'white',
                font: {
                    size: 18,
                },
            },
            legend: {
                display: true,
                position: 'top',
                labels: {
                    color: 'white',
                },
            },
            tooltip: {
                mode: 'index',
                intersect: false,
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                titleColor: 'white',
                bodyColor: 'white',
            },
        },
        scales: {
            x: {
                title: {
                    display: true,
                    text: 'Month',
                    color: 'white',
                },
                ticks: {
                    color: 'white',
                },
                grid: {
                    color: 'rgba(255, 255, 255, 0.2)',
                },
            },
            y: {
                title: {
                    display: true,
                    text: 'Amount',
                    color: 'white',
                },
                ticks: {
                    color: 'white',
                },
                grid: {
                    color: 'rgba(255, 255, 255, 0.2)',
                },
                beginAtZero: true,
            },
        },
    };

    return (
        <Container>
            {loading && <Spinner animation="border" style={{ color: '#d7aa47' }} />}
            {error && <Alert variant="danger">{error}</Alert>}
            {!loading && !error && (
                <Card className="mt-2 bg-dark text-light">
                    <Card.Body>
                        <Line data={chartData} options={chartOptions} style={{ height: '100%', maxHeight: '300px' }} />
                    </Card.Body>
                </Card>
            )}
        </Container>
    );
};

export default CommissionStatus;
