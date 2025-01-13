import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { useSelector } from "react-redux";
import { Card, Container, Spinner, Button } from 'react-bootstrap';

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const HodMonthTarget = ({ loading }) => {
    const token = useSelector((state) => state.loginSlice.user?.token);
    const [chartData, setChartData] = useState([]);
    const [error, setError] = useState(null);
    const [showAll, setShowAll] = useState(false);

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
                                    backgroundColor: 'rgb(0, 255, 0)',
                                    borderColor: 'rgb(0, 255, 0)',
                                    borderWidth: 0,
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
            <Spinner animation="border" style={{ color: '#d7aa47' }} />
        </div>
    }

    const displayedCharts = showAll ? chartData : chartData.slice(0, 2);

    return (
        <Container fluid>
            {displayedCharts.length > 0 ? (
                displayedCharts.map((chart) => (
                    <Card
                        className="mt-2 mb-2 bg-dark"
                        key={chart.pipelineId}
                        style={{  color: '#fff' }}
                    >
                        <Card.Body>
                            <Card.Title>{chart.pipelineName}</Card.Title>
                            <Bar
                                data={chart.chartData}
                                options={{
                                    responsive: true,
                                    plugins: {
                                        legend: {
                                            labels: {
                                                color: '#ffffff', // Legend text color
                                            },
                                        },
                                        title: {
                                            display: true,
                                            text: `${chart.pipelineName} Monthly Finance Status`,
                                            color: '#ffffff', // Title color
                                        },
                                    },
                                    scales: {
                                        x: {
                                            title: {
                                                display: true,
                                                text: 'Months',
                                                color: '#ffffff', // X-axis title color
                                            },
                                            ticks: {
                                                color: '#ffffff', // X-axis ticks color
                                            },
                                            grid: {
                                                color: 'rgba(255, 255, 255, 0.2)', // X-axis grid color
                                            },
                                        },
                                        y: {
                                            title: {
                                                display: true,
                                                text: 'Finance Amount',
                                                color: '#ffffff', // Y-axis title color
                                            },
                                            ticks: {
                                                color: '#ffffff', // Y-axis ticks color
                                            },
                                            grid: {
                                                color: 'rgba(255, 255, 255, 0.2)', // Y-axis grid color
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
            {chartData.length > 4 && (
                <div className="mt-2" style={{ display: "flex", justifyContent: 'center' }}>
                    <Button onClick={() => setShowAll(!showAll)} className='all_common_btn_single_lead'>
                        {showAll ? 'Show Less' : 'Show More'}
                    </Button>
                </div>
            )}
        </Container>
    );
};

export default HodMonthTarget;
