import React, { useEffect, useState } from "react";
import { Container, Spinner, Card } from "react-bootstrap";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useSelector } from "react-redux";
import { Bar } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from "chart.js";

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const HodCommissionDashboard = () => {
    const token = useSelector((state) => state.loginSlice.user?.token);
    const [commissionData, setCommissionData] = useState(null);
    const [loading, setLoading] = useState(true);

    // Function to convert "MM-YYYY" format to month name
    const formatMonth = (monthYear) => {
        const [month, year] = monthYear.split("-"); // Split into month and year
        const date = new Date(year, month - 1); // Create a Date object
        return new Intl.DateTimeFormat("en-US", { month: "short" }).format(date); // Format month as "Jan", "Feb", etc.
    };

    useEffect(() => {
        const fetchCommissionStatus = async () => {
            try {
                const response = await axios.get("/api/commission/commission-status", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setCommissionData(response.data);
                setLoading(false);
            } catch (error) {
                setLoading(false);
                console.log(error);
            }
        };

        if (token) {
            fetchCommissionStatus();
        } else {
            setLoading(false);
            toast.error("User is not Authenticated. Please log in.");
        }
    }, [token]);

    // Prepare chart data if commissionData and monthWiseStats are available
    const chartData = commissionData?.monthWiseStats
        ? {
            labels: commissionData.monthWiseStats.map((stat) => formatMonth(stat.month)), // Format the month
            datasets: [
                {
                    label: "Total Commission",
                    data: commissionData.monthWiseStats.map((stat) => stat.totalCommission),
                    backgroundColor: "rgb(215,170,71)",
                },
                {
                    label: "Total Paid Commission",
                    data: commissionData.monthWiseStats.map((stat) => stat.totalPaidCommission),
                    backgroundColor: "rgb(0, 255, 0)",
                },
                {
                    label: "Total Remaining Commission",
                    data: commissionData.monthWiseStats.map((stat) => stat.totalRemainingCommission),
                    backgroundColor: "rgb(255, 0, 0)",
                },
            ],
        }
        : null;

    // Determine the maximum value for the y-axis
    const yAxisMax = commissionData?.allTimeStats?.totalCommission || 0;

    return (
        <Container fluid>
            <ToastContainer />
            {loading ? (
                <div
                    className="d-flex justify-content-center align-items-center"
                    style={{ height: "100vh" }}
                >
                    <Spinner animation="grow" role="status"></Spinner>
                </div>
            ) : commissionData && chartData ? (
                <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', gap: '5px' }} >
                        <Card className="w-100 card-custom mb-2" style={{ backgroundColor: 'black', color: 'white' }}>
                            <Card.Body>
                                <Card.Title>Total Commission</Card.Title>
                                <Card.Text>
                                    {`${commissionData.allTimeStats?.totalCommission ?? 0}AED`}
                                </Card.Text>
                            </Card.Body>
                        </Card>

                        <Card className="w-100 card-custom mb-2" style={{ backgroundColor: 'black', color: 'white' }}>
                            <Card.Body>
                                <Card.Title>Paid Commission</Card.Title>
                                <Card.Text>
                                    {`${commissionData.allTimeStats?.totalPaidCommission ?? 0}AED`}
                                </Card.Text>
                            </Card.Body>
                        </Card>

                        <Card className="w-100 card-custom mb-2" style={{ backgroundColor: 'black', color: 'white' }}>
                            <Card.Body>
                                <Card.Title>Remaining Commission</Card.Title>
                                <Card.Text>
                                    {`${commissionData.allTimeStats?.totalRemainingCommission ?? 0}AED`}
                                </Card.Text>
                            </Card.Body>
                        </Card>
                    </div>

                    {/* Chart */}
                    <Card className="mt-2 bg-dark" style={{  color: 'white' }}>
                        <Card.Body>
                            <Bar
                                data={chartData}
                                options={{
                                    responsive: true,
                                    plugins: {
                                        legend: {
                                            position: "top",
                                            labels: {
                                                color: 'white', // Change legend text color
                                            }
                                        },
                                        title: {
                                            display: true,
                                            text: "Monthly Commission Status",
                                            color: 'white', // Change title text color
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
                                                text: "Amount",
                                                color: 'white', // Change y-axis title color
                                            },
                                            ticks: {
                                                color: 'white', // Change y-axis ticks color
                                            },
                                            grid: {
                                                color: 'rgba(255, 255, 255, 0.2)', // Y-axis grid color
                                            },
                                        },
                                    },
                                }}
                                style={{ height: "100%", maxHeight: "300px" }}
                            />
                        </Card.Body>
                    </Card>
                </>
            ) : (
                <div className="text-center" style={{ color: "#fff" }}>
                    No Commission Data Available.
                </div>
            )}
        </Container>
    );
};

export default HodCommissionDashboard;
