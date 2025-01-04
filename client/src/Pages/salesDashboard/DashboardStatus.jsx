import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Card, Container,Spinner } from 'react-bootstrap';
// Register chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const DashboardStatus = () => {
    const token = useSelector((state) => state.loginSlice.user?.token);
    const [dashboardData, setDashboardData] = useState({
        dashboardStatus: null,
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (token) {
            const fetchDashboardData = async () => {
                try {
                    setLoading(true);
                    setError(null);

                    const headers = {
                        Authorization: `Bearer ${token}`,
                    };

                    const urls = [
                        '/api/commission/dashboard-status',
                        '/api/commission/commission-status',
                        '/api/commission/finance-status',
                    ];

                    const [dashboardStatus] = await Promise.all(
                        urls.map((url) => axios.get(url, { headers }))
                    );

                    setDashboardData({
                        dashboardStatus: dashboardStatus.data,
                    });
                } catch (err) {
                    setError('Failed to fetch dashboard data');
                } finally {
                    setLoading(false);
                }
            };

            fetchDashboardData();
        }
    }, [token]);

    if (loading) {
        return <div className="d-flex justify-content-center align-items-center" style={{ height: '200px' }}>
            <Spinner animation="grow" style={{ color: '#d7aa47' }} />
        </div>
    }

    // Prepare chart data from the API response
    const chartData = {
        labels: dashboardData.dashboardStatus?.monthWiseStats?.map(item => item.month),
        datasets: [
            {
                label: 'Total Contracts',
                data: dashboardData.dashboardStatus?.monthWiseStats?.map(item => item.stats.totalContracts),
                backgroundColor: 'rgba(54, 162, 235, 0.5)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1,
            },
            {
                label: 'Rejected Contracts',
                data: dashboardData.dashboardStatus?.monthWiseStats?.map(item => item.stats.rejectedContracts),
                backgroundColor: 'rgba(255, 99, 132, 0.5)',
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 1,
            },
            {
                label: 'Total Leads',
                data: dashboardData.dashboardStatus?.monthWiseStats?.map(item => item.stats.totalLeads),
                backgroundColor: 'rgba(75, 192, 192, 0.5)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
            },
            {
                label: 'Rejected Leads',
                data: dashboardData.dashboardStatus?.monthWiseStats?.map(item => item.stats.rejectedLeads),
                backgroundColor: 'rgba(153, 102, 255, 0.5)',
                borderColor: 'rgba(153, 102, 255, 1)',
                borderWidth: 1,
            },
            {
                label: 'Total Deals',
                data: dashboardData.dashboardStatus?.monthWiseStats?.map(item => item.stats.totalDeals),
                backgroundColor: 'rgba(255, 159, 64, 0.5)',
                borderColor: 'rgba(255, 159, 64, 1)',
                borderWidth: 1,
            },
            {
                label: 'Rejected Deals',
                data: dashboardData.dashboardStatus?.monthWiseStats?.map(item => item.stats.rejectedDeals),
                backgroundColor: 'rgba(255, 159, 64, 0.7)',
                borderColor: 'rgba(255, 159, 64, 1)',
                borderWidth: 1,
            },
        ],
    };

    // Chart options for better styling
    const chartOptions = {
        responsive: true,
        plugins: {
            title: {
                display: true,
                text: 'Dashboard Status',
            },
            tooltip: {
                mode: 'index',
                intersect: false,
            },
        },
        scales: {
            x: {
                title: {
                    display: true,
                    text: 'Months',
                },
            },
            y: {
                title: {
                    display: true,
                    text: 'Count',
                },
                beginAtZero: true,
            },
        },
    };

    return (
        <Container>
            {dashboardData.dashboardStatus && (
                <Card className='mb-2'>
                    <Card.Body>
                        <Bar data={chartData} options={chartOptions} style={{ height: '100%', maxHeight: '300px' }} />
                    </Card.Body>
                </Card>
            )}
        </Container>
    );
};

export default DashboardStatus;
