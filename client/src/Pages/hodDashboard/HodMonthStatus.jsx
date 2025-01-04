import React, { useState, useEffect } from 'react';
import { Container, Spinner, Card, Row, Col } from 'react-bootstrap';
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
                <Spinner animation="grow" style={{ color: '#d7aa47' }} />
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
                    backgroundColor: '#8884d8',
                },
                {
                    label: `Rejected ${label}`,
                    data: stats.map((stat) => stat.rejected),
                    backgroundColor: '#ff8042',
                },
            ],
        };
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
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
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Count',
                },
                ticks: {
                    stepSize: 10,
                    callback: (value) => value.toString(),
                },
            },
        },
    };

    return (
        <Container fluid>
            <ToastContainer />
            <Row>
                {pipelineStats.map((pipeline) => (
                    <Col md={6} key={pipeline.pipelineId} className="mt-2">
                        <Card>
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
                        <Card className="mt-2">
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
                        <Card className="mt-2">
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
        </Container>
    );
};

export default HodMonthStatus;
