import React, { useState, useEffect } from 'react';
import { Container, Spinner, Card, Row, Col, Button } from 'react-bootstrap';
import { Bar } from 'react-chartjs-2';
import { toast, ToastContainer } from "react-toastify";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import "react-toastify/dist/ReactToastify.css";
import './HodDashboard.css';

// Register required Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const HodMonthStatus = ({ dashboardData }) => {
    const [pipelineStats, setPipelineStats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAll, setShowAll] = useState(false);

    // Helper function to get the month name
    const getMonthName = (monthYear) => {
        const [month, year] = monthYear.split('-').map(Number); // Split and convert to numbers
        const date = new Date(year, month - 1); // Create a date object
        return date.toLocaleString('default', { month: 'short' }); // Get the short month name
    };

    useEffect(() => {
        try {
            const formattedData = dashboardData?.pipelineStats?.map((pipeline) => {
                const leadsStats = pipeline?.monthlyStats?.leads?.map((item) => ({
                    month: getMonthName(item.month),
                    total: item.total,
                    rejected: item.rejected,
                })) || [];
                const contractsStats = pipeline?.monthlyStats?.contracts?.map((item) => ({
                    month: getMonthName(item.month),
                    total: item.total,
                    rejected: item.rejected,
                })) || [];
                const dealsStats = pipeline?.monthlyStats?.deals?.map((item) => ({
                    month: getMonthName(item.month),
                    total: item.total,
                    rejected: item.rejected,
                })) || [];

                return {
                    pipelineId: pipeline.pipelineId,
                    pipelineName: pipeline.pipelineName,
                    leadsStats,
                    contractsStats,
                    dealsStats,
                };
            }) || [];

            setPipelineStats(formattedData);
            setLoading(false);
        } catch (error) {
            toast.error('Failed to process data');
            setLoading(false);
        }
    }, [dashboardData]);

    if (loading) {
        return (
            <Container className="text-center">
                <div className="text-center">
                    <Spinner animation="border" style={{ color: '#d7aa47' }} />
                </div>
            </Container>
        );
    }

    const generateChartData = (stats, label) => {
        return {
            labels: stats.map((stat) => stat.month),
            datasets: [
                {
                    label: `Total ${label}`,
                    data: stats.map((stat) => stat.total),
                    backgroundColor: '#00FF00',
                },
                {
                    label: `Rejected ${label}`,
                    data: stats.map((stat) => stat.rejected),
                    backgroundColor: '#FF0000',
                },
            ],
        };
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    color: '#ffffff', // White text for legend
                },
            },
            title: {
                display: true,
                color: '#ffffff', // White text for title
            },
            tooltip: {
                titleColor: '#ffffff', // Tooltip text color
                bodyColor: '#ffffff', // Tooltip body text color
                backgroundColor: 'rgba(0, 0, 0, 0.8)', // Tooltip background
            },
        },
        scales: {
            x: {
                title: {
                    display: true,
                    text: 'Months',
                    color: '#ffffff', // White text for axis title
                },
                ticks: {
                    color: '#ffffff', // White text for axis labels
                },
                grid: {
                    color: 'rgba(255, 255, 255, 0.2)', // Y-axis grid color
                },
            },
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Count',
                    color: '#ffffff', // White text for axis title
                },
                ticks: {
                    stepSize: 10,
                    callback: (value) => value.toString(),
                    color: '#ffffff', // White text for axis labels
                },
                grid: {
                    color: 'rgba(255, 255, 255, 0.2)', // Y-axis grid color
                },
            },
        },
    };

    // Determine how many graphs to show based on the `showAll` state
    const visiblePipelines = showAll ? pipelineStats : pipelineStats.slice(0, 2);

    return (
        <Container fluid>
            <ToastContainer />
            <Row>
                {visiblePipelines.map((pipeline) => (
                    <Col md={6} key={pipeline.pipelineId} className="mt-2">
                        <Card className='bg-dark' style={{ color: '#fff' }}>
                            <Card.Body>
                                <h5>{pipeline.pipelineName} - Leads</h5>
                                <Bar
                                    data={generateChartData(pipeline.leadsStats, 'Leads')}
                                    options={{
                                        ...chartOptions,
                                        plugins: {
                                            ...chartOptions.plugins,
                                            title: {
                                                text: `${pipeline.pipelineName} Monthly Leads`,
                                            },
                                        },
                                    }}
                                />
                            </Card.Body>
                        </Card>
                        <Card className="mt-2 bg-dark" style={{ color: '#fff' }}>
                            <Card.Body>
                                <h5>{pipeline.pipelineName} - Contracts</h5>
                                <Bar
                                    data={generateChartData(pipeline.contractsStats, 'Contracts')}
                                    options={{
                                        ...chartOptions,
                                        plugins: {
                                            ...chartOptions.plugins,
                                            title: {
                                                text: `${pipeline.pipelineName} Monthly Contracts`,
                                            },
                                        },
                                    }}
                                />
                            </Card.Body>
                        </Card>
                        <Card className="mt-2 bg-dark" style={{ color: '#fff' }}>
                            <Card.Body>
                                <h5>{pipeline.pipelineName} - Deals</h5>
                                <Bar
                                    data={generateChartData(pipeline.dealsStats, 'Deals')}
                                    options={{
                                        ...chartOptions,
                                        plugins: {
                                            ...chartOptions.plugins,
                                            title: {
                                                text: `${pipeline.pipelineName} Monthly Deals`,
                                            },
                                        },
                                    }}
                                />
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>
            {!showAll && pipelineStats.length > 4 && (
                <div className="mt-2" style={{ display: "flex", justifyContent: 'center' }}>
                    <Button onClick={() => setShowAll(true)} className='all_common_btn_single_lead'>
                        Show More
                    </Button>
                </div>
            )}
        </Container>
    );
};

export default HodMonthStatus;
