import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Spinner, Image, Table, Button } from 'react-bootstrap';
import axios from 'axios';
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useSelector } from "react-redux";
import './CeoDashboard.css';
import mrning from '../../Assets/mrning.jpg';
import evening from '../../Assets/evening.jpg';
import afternnon from '../../Assets/afternnon.jpg';
import { TypeAnimation } from 'react-type-animation';
import { CiFaceSmile } from "react-icons/ci";
import { useNavigate } from 'react-router-dom';
import CeoCommissionDashboard from './CeoCommissionDashboard';
import HodTopAgent from '../hodDashboard/HodTopAgent';
import HodMonthStatus from '../hodDashboard/HodMonthStatus';
import HodMonthTarget from '../hodDashboard/HodMonthTarget';
import HodTargetDashboard from '../hodDashboard/HodTargetDashboard';
import CeoPipelineCommission from './CeoPipelineCommission';
import './CeoDashboard.css'

const CeoMainDashboard = () => {
    const [greeting, setGreeting] = useState('');
    const [logo, setLogo] = useState('');
    const token = useSelector((state) => state.loginSlice.user?.token);
    const userName = useSelector((state) => state.loginSlice.user?.name);
    const [error, setError] = useState(null); // State to handle errors
    const [dashboardData, setDashboardData] = useState(null); // State to store API data
    const [loading, setLoading] = useState(true); // State to handle loading
    const [financeStatus, setFinanceStatus] = useState(null); // State to store API data
    const [visibleCount, setVisibleCount] = useState(2);
    const [showMessage, setShowMessage] = useState(true);
    const navigate = useNavigate();

    const toggleVisibleCount = () => {
        setVisibleCount((prevCount) =>
            prevCount === 2 ? dashboardData?.pipelineStats?.length : 2
        );
    };

    useEffect(() => {
        const updateGreeting = () => {
            const currentHour = new Date().getHours();
            if (currentHour < 12) {
                setGreeting('Good Morning');
                setLogo(mrning);
                setShowMessage(true); // Show "Have a Good Day" before 12 PM
            } else if (currentHour >= 12 && currentHour < 16) {
                setGreeting('Good Afternoon');
                setLogo(afternnon);
                setShowMessage(false); // Hide "Have a Good Day" after 12 PM
            } else {
                setGreeting('Good Evening');
                setLogo(evening);
                setShowMessage(false); // Hide "Have a Good Day" in the evening
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

            <Container fluid>
                <Row>
                    <Col xs={12} md={12} lg={2}></Col>

                    <Col xs={12} md={10}>
                        <Card className='leads_main_cards mt-3' style={{ padding: '5px 10px', border: 'none' }}>
                            <Row>
                                <Col xs={12} md={12} lg={9} className="text-center">
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }} >
                                        {logo && <Image src={logo} alt={'greeting'} style={{ width: '60px', height: '60px', borderRadius: '50%' }} />}

                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <h3 style={{ color: 'white' }}>{greeting},</h3>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                <TypeAnimation
                                                    sequence={[
                                                        `${userName}`, // Always show the user's name
                                                        1000,
                                                        '',
                                                        500,
                                                        `${userName}`, // Repeat userName animation
                                                        1000,
                                                    ]}
                                                    wrapper="h3"
                                                    cursor={true}
                                                    repeat={Infinity}
                                                    style={{ fontSize: '24px', fontWeight: '400', color: '#d7aa47' }}
                                                />
                                                {showMessage && ( // Conditionally show "Have a Good Day"
                                                    <h4 style={{ fontSize: '18px', fontWeight: '300', color: '#d7aa47', marginLeft: '10px' }}>
                                                        Have a Good Day
                                                    </h4>
                                                )}
                                                <CiFaceSmile style={{ fontSize: '28px', color: '#f2c92d' }} />
                                            </span>
                                        </div>
                                    </div>

                                    <div style={{ display: "flex", justifyContent: 'end' }} >
                                        <Button className='all_common_btn_single_lead mb-0' onClick={() => navigate('/hoddashboarddetails', { state: { dashboardData, financeStatus } })} >Details</Button>
                                    </div>
                                    <CeoCommissionDashboard />
                                    <HodMonthStatus dashboardData={dashboardData} />
                                    <HodMonthTarget financeStatus={financeStatus} loading={loading} />
                                    <CeoPipelineCommission />
                                </Col>
                                <Col xs={12} md={12} lg={3}>
                                    <HodTargetDashboard financeStatus={financeStatus} loading={loading} />
                                    <HodTopAgent />
                                    <div>
                                        {loading ? (
                                            <div className="text-center">
                                                <Spinner animation="border" style={{ color: '#d7aa47' }} />
                                            </div>
                                        ) : (
                                            <Card
                                                className="mt-3 mb-3"
                                                bg="dark"
                                                style={{
                                                    boxShadow:
                                                        'rgba(236, 204, 22, 0.75) 0px 6px 12px -2px, rgba(230, 196, 9, 0.88) 0px 3px 7px -3px',
                                                }}
                                            >
                                                <Card.Body>
                                                    {dashboardData?.pipelineStats?.length > 0 ? (
                                                        <>
                                                            {dashboardData.pipelineStats
                                                                .slice(0, visibleCount)
                                                                .map(({ pipelineId, pipelineName, stats }) => (
                                                                    <div
                                                                        key={pipelineId}
                                                                        style={{
                                                                            overflowX: 'auto',
                                                                            padding: '10px',
                                                                        }}
                                                                    >
                                                                        <Table
                                                                            striped
                                                                            bordered
                                                                            hover
                                                                            responsive
                                                                            variant="dark"
                                                                        >
                                                                            <thead>
                                                                                <tr>
                                                                                    <th style={tableHeaderStyle}>
                                                                                        {pipelineName}
                                                                                    </th>
                                                                                    <th style={tableHeaderStyle}>
                                                                                        Number
                                                                                    </th>
                                                                                </tr>
                                                                            </thead>
                                                                            <tbody>
                                                                                {Object.entries(stats).map(
                                                                                    ([key, value]) => (
                                                                                        <tr key={key}>
                                                                                            <td style={tableCellStyle}>
                                                                                                {key
                                                                                                    .replace(
                                                                                                        /([A-Z])/g,
                                                                                                        ' $1'
                                                                                                    ) // Add spaces before capital letters
                                                                                                    .replace(
                                                                                                        /^./,
                                                                                                        (str) =>
                                                                                                            str.toUpperCase()
                                                                                                    )}{' '}
                                                                                                {/* Capitalize first letter */}
                                                                                            </td>
                                                                                            <td
                                                                                                style={tableValueStyle}
                                                                                            >
                                                                                                {value}
                                                                                            </td>
                                                                                        </tr>
                                                                                    )
                                                                                )}
                                                                            </tbody>
                                                                        </Table>
                                                                    </div>
                                                                ))}
                                                            <div className="text-center mt-3">
                                                                <Button
                                                                    variant="outline-warning"
                                                                    onClick={toggleVisibleCount}
                                                                >
                                                                    {visibleCount === 2
                                                                        ? 'Show More'
                                                                        : 'Show Less'}
                                                                </Button>
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <p
                                                            className="text-center"
                                                            style={{ color: '#d7aa47' }}
                                                        >
                                                            No Data Available.
                                                        </p>
                                                    )}
                                                </Card.Body>
                                            </Card>
                                        )}
                                    </div>

                                </Col>
                            </Row>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </div>
    )
}

export default CeoMainDashboard