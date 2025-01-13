import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Table, Image, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useSelector } from 'react-redux';
import axios from 'axios';
import default_image from '../../Assets/default_image.jpg';
import DashboardStatus from './DashboardStatus';
import { IoMdSunny } from "react-icons/io";
import mrning from '../../Assets/mrning.jpg';
import evening from '../../Assets/evening.jpg';
import afternnon from '../../Assets/afternnon.jpg';
import { TypeAnimation } from 'react-type-animation';
import { CiFaceSmile } from "react-icons/ci";
import FinanceStatus from './FinanceStatus';
import FinanceMonthlyStatus from './FinanceMonthlyStatus';
import CommissionStatus from './CommissionStatus';
import CurrentMonthStatus from './CurrentMonthStatus';

const Dashboard = () => {
    const [financeData, setFinanceData] = useState([]);
    const [apiError, setApiError] = useState('');
    const [greeting, setGreeting] = useState('');
    const [logo, setLogo] = useState('');
    const token = useSelector((state) => state.loginSlice.user?.token);
    const userName = useSelector((state) => state.loginSlice.user?.name);
    const [showMessage, setShowMessage] = useState(true);
    
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



    // Fetch finance data and user details
    const fetchFinanceData = async () => {
        try {
            const response = await axios.get(`/api/commission/highest-finance-amount-pipeline`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setFinanceData(response.data.users || []);
        } catch (err) {
            setApiError('Failed to fetch finance data.');
            toast.error('Failed to fetch finance data.');
        }
    };

    useEffect(() => {
        if (token) {
            fetchFinanceData();
        }
    }, [token]);

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
                    <Col xs={12} md={12} lg={2}>
                        {/* Sidebar component can go here */}
                    </Col>

                    <Col xs={12} md={10}>
                        <Card className="leads_main_cards mt-2" style={{ padding: '5px 10px', border: 'none' }}>
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
                                    <CurrentMonthStatus />
                                    <DashboardStatus />
                                    <FinanceMonthlyStatus />
                                    <CommissionStatus />
                                </Col>
                                <Col xs={12} md={12} lg={3}>
                                    <FinanceStatus />
                                    {financeData.length > 0 ? (
                                        <div className='mt-2' style={{ height: '100%', maxHeight: '800px', overflowY: 'auto' }}>
                                            <Table striped bordered hover responsive>
                                                <thead >
                                                    <tr >
                                                        <th
                                                            style={{
                                                                backgroundColor: '#d7aa47',
                                                                border: '1px solid #d7aa47',
                                                                textAlign: 'center',
                                                                color: 'white',
                                                            }}
                                                        >
                                                            Top Agents
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {financeData.map((user) => {
                                                        const imageSrc = user?.image
                                                            ? `/images/${user?.image}`
                                                            : default_image;

                                                        const renderTooltip = (props) => (
                                                            <Tooltip id="user-tooltip" {...props}>
                                                                {user.name}
                                                            </Tooltip>
                                                        );
                                                        return (
                                                            <tr key={user._id}>
                                                                <td
                                                                    style={{
                                                                        verticalAlign: 'middle',
                                                                        backgroundColor: '#2d3134',
                                                                    }}
                                                                >
                                                                    <div
                                                                        style={{
                                                                            display: 'flex',
                                                                            gap: '8px',
                                                                            alignItems: 'center',
                                                                        }}
                                                                    >
                                                                        <OverlayTrigger
                                                                            placement="top"
                                                                            delay={{ show: 250, hide: 400 }}
                                                                            overlay={renderTooltip}
                                                                        >
                                                                            <Image
                                                                                src={imageSrc}
                                                                                alt="User"
                                                                                className="image_control_discussion"
                                                                                style={{
                                                                                    objectFit: 'cover',
                                                                                    cursor: 'pointer',
                                                                                }}
                                                                            />
                                                                        </OverlayTrigger>
                                                                        <span
                                                                            style={{
                                                                                fontWeight: '600',
                                                                                fontSize: '12px',
                                                                            }}
                                                                            className="mutual_class_color name-container"
                                                                        >
                                                                            {user.name
                                                                                ? user.name
                                                                                    .split(' ')
                                                                                    .slice(0, 5)
                                                                                    .join(' ') +
                                                                                (user.name.split(' ').length > 2
                                                                                    ? '...'
                                                                                    : '')
                                                                                : 'N/A'}
                                                                        </span>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}

                                                </tbody>
                                            </Table>
                                        </div>
                                    ) : (
                                        <p className="text-muted" style={{ color: 'white' }} >No team members available.</p>
                                    )}
                                    {apiError && <p className="text-danger">{apiError}</p>}
                                </Col>
                            </Row>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default Dashboard;
