import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { useSelector } from "react-redux";
import { Card, Container, Spinner } from 'react-bootstrap';

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const HodMonthTarget = ({ loading }) => {
    const token = useSelector((state) => state.loginSlice.user?.token);
    const [chartData, setChartData] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get('/api/commission/finance-status-by-pipeline', {
                    headers: { Authorization: `Bearer ${token}` },
                });

                const pipelineStats = response.data.pipelineStats || [];

                const charts = pipelineStats.map((pipeline) => {
                    const monthlyStats = pipeline.monthlyStats || [];

                    // Convert "MM-YYYY" format to month names
                    const months = monthlyStats.map(item => {
                        const [month, year] = item.month.split('-'); // Split "MM-YYYY"
                        const date = new Date(`${year}-${month}-01`); // Create a Date object
                        return date.toLocaleString('default', { month: 'short' }); // Get short month name
                    });

                    const financeAmounts = monthlyStats.map(item => item.financeAmount);

                    return {
                        pipelineId: pipeline.pipelineId,
                        pipelineName: pipeline.pipelineName,
                        pipelineTarget: pipeline.pipelineTarget,
                        totalFinanceAmount: pipeline.allTimeStats.totalFinanceAmount,
                        currentMonthFinanceAmount: pipeline.currentMonthStats.totalFinanceAmount,
                        chartData: {
                            labels: months,
                            datasets: [
                                {
                                    label: `${pipeline.pipelineName} Finance Amount`,
                                    data: financeAmounts,
                                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                                    borderColor: 'rgba(75, 192, 192, 1)',
                                    borderWidth: 1,
                                },
                            ],
                        },
                    };
                });

                setChartData(charts);
            } catch (error) {
                setError('Error fetching data');
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, [token]);

    if (loading) {
        return <div className="text-center">
            <Spinner animation="grow" variant="primary" />
        </div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <Container fluid>
            {chartData.length > 0 ? (
                chartData.map((chart) => (
                    <Card className="mt-2 mb-2" key={chart.pipelineId}>
                        <Card.Body>
                            <Card.Title>{chart.pipelineName}</Card.Title>
                            {/* <Card.Text>
                                <strong>Pipeline Target:</strong> {chart.pipelineTarget.toLocaleString()} <br />
                                <strong>All-Time Finance Amount:</strong> {chart.totalFinanceAmount.toLocaleString()} <br />
                                <strong>Current Month Finance Amount:</strong> {chart.currentMonthFinanceAmount.toLocaleString()}
                            </Card.Text> */}
                            <Bar
                                data={chart.chartData}
                                options={{
                                    responsive: true,
                                    plugins: {
                                        legend: {
                                            position: 'top',
                                        },
                                        title: {
                                            display: true,
                                            text: `${chart.pipelineName} Monthly Finance Status`,
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
                                                text: 'Finance Amount',
                                            },
                                            beginAtZero: true,
                                        },
                                    },
                                }}
                                style={{ height: '100%', maxHeight: '300px' }}
                            />
                        </Card.Body>
                    </Card>
                ))
            ) : (
                <div>No data available</div>
            )}
        </Container>
    );
};

export default HodMonthTarget;
