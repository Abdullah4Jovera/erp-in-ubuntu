import React, { useState } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Card, Button } from 'react-bootstrap';

ChartJS.register(ArcElement, Tooltip, Legend);

const HodTargetDashboard = ({ financeStatus, loading }) => {
    const [visibleCount, setVisibleCount] = useState(2); // Number of pipelines to show initially

    // Toggle between showing all and limited charts
    const toggleVisibleCount = () => {
        if (visibleCount === 2) {
            setVisibleCount(financeStatus.length);
        } else {
            setVisibleCount(2);
        }
    };

    // Render UI based on states
    if (loading) {
        return <div>Loading...</div>;
    }

    // Function to generate chart data
    const getDoughnutChartData = (pipeline) => {
        const achieved = pipeline.currentMonthStats.totalFinanceAmount;
        const target = pipeline.pipelineTarget;
        const remaining = target - achieved;

        return {
            labels: ['Achieved', 'Remaining'],
            datasets: [
                {
                    data: [achieved, remaining > 0 ? remaining : 0],
                    backgroundColor: ['#00FF00', '#FF0000'],
                    hoverBackgroundColor: ['#00FF00', '#FF0000'],
                },
            ],
        };
    };

    // Function to get options for the Doughnut chart
    const getChartOptions = () => ({
        plugins: {
            legend: {
                labels: {
                    color: 'white', // Set legend label color to white
                },
            },
        },
    });

    return (
        <Card
            className="mt-3"
            bg="dark"
            style={{
                boxShadow:
                    'rgba(236, 204, 22, 0.75) 0px 6px 12px -2px, rgba(230, 196, 9, 0.88) 0px 3px 7px -3px',
            }}
        >
            <Card.Body>
                {financeStatus && financeStatus.length > 0 ? (
                    <>
                        {financeStatus.slice(0, visibleCount).map((pipeline) => (
                            <div key={pipeline.pipelineId} className="mb-3">
                                <h4 style={{ color: '#d7aa47', textAlign: 'center' }}>
                                    {pipeline.pipelineName}
                                </h4>
                                <div style={{ width: '300px', height: '300px', margin: '0 auto' }}>
                                    <Doughnut
                                        data={getDoughnutChartData(pipeline)}
                                        options={getChartOptions()}
                                    />
                                </div>
                            </div>
                        ))}
                        {financeStatus.length > 2 && (
                            <div className="text-center mt-3">
                                <Button
                                    variant="outline-warning"
                                    onClick={toggleVisibleCount}
                                >
                                    {visibleCount === 2 ? 'Show More' : 'Show Less'}
                                </Button>
                            </div>
                        )}
                    </>
                ) : (
                    <p style={{ color: '#d7aa47', textAlign: 'center' }}>No Data Available.</p>
                )}
            </Card.Body>
        </Card>
    );
};

export default HodTargetDashboard;