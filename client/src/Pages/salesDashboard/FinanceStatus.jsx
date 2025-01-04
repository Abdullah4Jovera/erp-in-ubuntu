import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { Doughnut } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
} from 'chart.js';
import { Card, Spinner } from 'react-bootstrap';

// Register the required components
ChartJS.register(ArcElement, Tooltip, Legend);

const FinanceStatus = () => {
    const token = useSelector((state) => state.loginSlice.user?.token);
    const userTarget = useSelector((state) => state.loginSlice.user?.target);

    const [financeData, setFinanceData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [progressPercentage, setProgressPercentage] = useState(0);

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

    // Doughnut chart data
    const chartData = {
        labels: ['Achieved', 'Remaining'],
        datasets: [
            {
                data: [progressPercentage, 100 - progressPercentage],
                backgroundColor: ['#4CAF50', '#FF0000'], // Green for progress, grey for remaining
                hoverBackgroundColor: ['#388E3C', '#FF0000'],

            },
        ],
    };

    const chartOptions = {
        maintainAspectRatio: false,
        cutout: '70%', // Creates a donut hole in the chart
        plugins: {
            tooltip: {
                callbacks: {
                    label: function (tooltipItem) {
                        return `${tooltipItem.label}: ${tooltipItem.raw}%`;
                    },
                },
            },
        },
    };

    return (
        <Card className='mt-4' >
            <h5 className='mt-3' style={{ color: '#000', textAlign: 'center' }} >Target : <span style={{ color: '#d7aa47' }} > {`${userTarget && userTarget}AED`} </span> </h5>
            {loading && <div className="d-flex justify-content-center align-items-center" style={{ height: '200px' }}>
                <Spinner animation="grow" style={{ color: '#d7aa47' }} />
            </div>}
            {error && <p style={{ color: 'red' }}>Error: {error}</p>}
            {financeData && (
                <div className='mb-3' >
                    <div style={{ width: '300px', height: '300px', margin: '0 auto' }}>
                        <Doughnut data={chartData} options={chartOptions} />
                    </div>
                </div>
            )}
        </Card>
    );
};

export default FinanceStatus;
