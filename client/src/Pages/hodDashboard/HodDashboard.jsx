import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Spinner, Image, Table, Button } from 'react-bootstrap';
import axios from 'axios';
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useSelector } from "react-redux";
import './HodDashboard.css';
import mrning from '../../Assets/mrning.jpg';
import evening from '../../Assets/evening.jpg';
import afternnon from '../../Assets/afternnon.jpg';
import { TypeAnimation } from 'react-type-animation';
import { CiFaceSmile } from "react-icons/ci";
import HodMonthStatus from './HodMonthStatus';
import HodCommissionDashboard from './HodCommissionDashboard';
import HodTargetDashboard from './HodTargetDashboard';
import HodMonthTarget from './HodMonthTarget';
import HodTopAgent from './HodTopAgent';
import { useNavigate } from 'react-router-dom';

const HodDashboard = () => {
    const [dashboardData, setDashboardData] = useState(null); // State to store API data
    const [loading, setLoading] = useState(true); // State to handle loading
    const [greeting, setGreeting] = useState('');
    const [logo, setLogo] = useState('');
    const [error, setError] = useState(null); // State to handle errors
    const [financeStatus, setFinanceStatus] = useState(null); // State to store API data
    const token = useSelector((state) => state.loginSlice.user?.token);
    const userName = useSelector((state) => state.loginSlice.user?.name);
    const navigate = useNavigate();

    useEffect(() => {
        const updateGreeting = () => {
            const currentHour = new Date().getHours();
            if (currentHour < 12) {
                setGreeting('Good Morning');
                setLogo(mrning); // Set the imported morning image
            } else if (currentHour >= 12 && currentHour < 16) {
                setGreeting('Good Afternoon');
                setLogo(afternnon); // Set the imported morning image
            } else {
                setGreeting('Good Evening');
                setLogo(evening); // Set the imported morning image
            }
        };

        updateGreeting(); // Set greeting initially
        const interval = setInterval(updateGreeting, 60000); // Update greeting every minute

        return () => clearInterval(interval); // Cleanup interval on unmount
    }, []);

    const fetchDashboardData = async () => {
        try {
            const response = await axios.get('/api/commission/dashboard-status-by-pipeline', {
                headers: { Authorization: `Bearer ${token}` },
            });
            setDashboardData(response.data); // Store the data in state
            setLoading(false); // Stop loading once data is fetched
        } catch (error) {
            setLoading(false); // Stop loading on error
        }
    };

    // Function to fetch data from the API
    const fetchFinanceStatus = async () => {
        try {
            const response = await axios.get('/api/commission/finance-status-by-pipeline', {
                headers: { Authorization: `Bearer ${token}` },
            });
            setFinanceStatus(response.data.pipelineStats); // Store the pipeline stats in state
            setLoading(false); // Set loading to false after data is fetched
        } catch (err) {
            setError('Failed to fetch data. Please try again.'); // Handle errors
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchDashboardData();
        fetchFinanceStatus();
    }, [token]);

    const tableHeaderStyle = {
        backgroundColor: '#d7aa47',
        border: '1px solid #d7aa47',
        textAlign: 'center',
        color: 'white',
    };

    const tableCellStyle = {
        verticalAlign: 'middle',
        backgroundColor: '#2d3134',
        color: '#d7aa47',
    };

    const tableValueStyle = {
        ...tableCellStyle,
        fontSize: '1.5rem',
        textAlign: 'center',
    };

    return (
        <div>
            <ToastContainer
                position="bottom-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={true}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
            />

            <Container fluid  >
                <Row>
                    <Col xs={12} md={12} lg={2}></Col>

                    <Col xs={12} md={10}>
                        <Card className="leads_main_cards mt-2" style={{ padding: '5px 10px', border: 'none' }}>
                            <Row>
                                <Col xs={12} md={12} lg={9} className="text-center">
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }} >
                                        {logo && <Image src={logo} alt={'greeting'} style={{ width: '60px', height: '60px', borderRadius: '50%' }} />}

                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <h3 style={{ color: 'white' }} >
                                                {greeting},
                                            </h3>
                                            <span style={{ display: 'flex' }}>
                                                <TypeAnimation
                                                    sequence={[
                                                        `${userName}, Have a Good Day` || 'Guest',  // Fallback to 'Guest' if userName is not available
                                                        1000,
                                                        '',
                                                        500,
                                                        `${userName}, Have a Good Day` || 'Guest',  // Repeat userName (or 'Guest') for the animation
                                                        1000
                                                    ]}
                                                    wrapper="h3"
                                                    cursor={true}
                                                    repeat={Infinity}
                                                    style={{ fontSize: '24px', fontWeight: '400', color: '#d7aa47' }}
                                                />
                                                <CiFaceSmile style={{ fontSize: '28px', color: '#f2c92d' }} />
                                            </span>
                                        </div>
                                    </div>
                                    <Button onClick={() => navigate('/hoddashboarddetails', { state: { dashboardData, financeStatus } })} >Details</Button>
                                    <HodCommissionDashboard />
                                    <HodMonthStatus dashboardData={dashboardData} />
                                    <HodMonthTarget financeStatus={financeStatus} loading={loading} />
                                </Col>
                                <Col xs={12} md={12} lg={3}>
                                    <HodTargetDashboard financeStatus={financeStatus} loading={loading} />
                                    <div>
                                        {loading ? (
                                            <div className="text-center">
                                                <Spinner animation="border" style={{ color: '#d7aa47' }} />
                                            </div>
                                        ) : (
                                            <Card className='mt-3 mb-3' bg='dark' style={{ boxShadow: 'rgba(236, 204, 22, 0.75) 0px 6px 12px -2px, rgba(230, 196, 9, 0.88) 0px 3px 7px -3px' }}>
                                                <Card.Body>
                                                    {dashboardData?.pipelineStats?.length > 0 ? (
                                                        dashboardData.pipelineStats.map(({ pipelineId, pipelineName, stats }) => (
                                                            <div key={pipelineId} style={{ overflowX: 'auto', padding: '10px' }}>
                                                                <Table striped bordered hover responsive variant="dark">
                                                                    <thead>
                                                                        <tr>
                                                                            <th style={tableHeaderStyle}>{pipelineName}</th>
                                                                            <th style={tableHeaderStyle}>Number</th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody>
                                                                        {Object.entries(stats).map(([key, value]) => (
                                                                            <tr key={key}>
                                                                                <td style={tableCellStyle}>
                                                                                    {key
                                                                                        .replace(/([A-Z])/g, ' $1') // Add spaces before capital letters
                                                                                        .replace(/^./, (str) => str.toUpperCase())} {/* Capitalize first letter */}
                                                                                </td>
                                                                                <td style={tableValueStyle}>{value}</td>
                                                                            </tr>
                                                                        ))}
                                                                    </tbody>
                                                                </Table>
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <p className="text-center" style={{ color: '#d7aa47' }}>
                                                            No Data Available.
                                                        </p>
                                                    )}
                                                </Card.Body>
                                            </Card>
                                        )}
                                    </div>
                                    <HodTopAgent />
                                </Col>
                            </Row>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default HodDashboard;
