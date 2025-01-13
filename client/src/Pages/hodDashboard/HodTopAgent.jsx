import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Image, Table, Tooltip, OverlayTrigger } from 'react-bootstrap';
import { useSelector } from "react-redux";
import default_image from '../../Assets/default_image.jpg';
const HodTopAgent = () => {
    const [agents, setAgents] = useState([]);  // Ensure it's always an array
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const token = useSelector((state) => state.loginSlice.user?.token);

    const fetchDashboardData = async () => {
        try {
            const response = await axios.get('/api/commission/highest-finance-amount-pipeline', {
                headers: { Authorization: `Bearer ${token}` },
            });
            setAgents(response.data.users || []);
            setLoading(false);
        } catch (error) {
            setLoading(false);
            setError('Failed to fetch top agents. Please try again later.');
        }
    }
    useEffect(() => {
        if (token) {
            fetchDashboardData();
        }
    }, [token])
    return (
        <div className='mt-2' >
            <div style={{ height: '100%', maxHeight: '650px', overflowY: 'auto' }}>
                <Table striped bordered hover responsive variant='dark' >
                    <thead>
                        <tr>
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
                        {agents?.map((user) => {
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
        </div>
    );
};

export default HodTopAgent;
