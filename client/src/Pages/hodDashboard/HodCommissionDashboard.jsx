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
                    backgroundColor: "rgba(54, 162, 235, 0.6)",
                },
                {
                    label: "Total Paid Commission",
                    data: commissionData.monthWiseStats.map((stat) => stat.totalPaidCommission),
                    backgroundColor: "rgba(25, 221, 41, 0.6)",
                },
                {
                    label: "Total Remaining Commission",
                    data: commissionData.monthWiseStats.map((stat) => stat.totalRemainingCommission),
                    backgroundColor: "rgba(255, 0, 0, 0.5)",
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
                        <Card className="w-100"  >
                            <Card.Body>
                                <Card.Title>Total Commission </Card.Title>
                                <Card.Text>
                                    {`${commissionData.allTimeStats?.totalCommission ?? 0}AED`}
                                </Card.Text>
                            </Card.Body>
                        </Card>

                        <Card className="w-100">
                            <Card.Body>
                                <Card.Title>Paid Commission</Card.Title>
                                <Card.Text>
                                    {`${commissionData.allTimeStats?.totalPaidCommission ?? 0}AED`}
                                </Card.Text>
                            </Card.Body>
                        </Card>

                        <Card className="w-100">
                            <Card.Body>
                                <Card.Title>Remaining Commission</Card.Title>
                                <Card.Text>
                                    {`${commissionData.allTimeStats?.totalRemainingCommission ?? 0}AED`}
                                </Card.Text>
                            </Card.Body>
                        </Card>
                    </div>
                    {/* Chart */}
                    <Card className="mt-2" >
                        <Card.Body>
                            <Bar
                                data={chartData}
                                options={{
                                    responsive: true,
                                    plugins: {
                                        legend: {
                                            position: "top",
                                        },
                                        title: {
                                            display: true,
                                            text: "Monthly Commission Status",
                                        },
                                    },
                                    scales: {
                                        x: {
                                            title: {
                                                display: true,
                                                text: "Months",
                                            },
                                        },
                                        y: {
                                            title: {
                                                display: true,
                                                text: "Amount",
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
