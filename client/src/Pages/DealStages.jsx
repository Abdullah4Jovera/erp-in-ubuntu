import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { Col, Container, Row } from 'react-bootstrap';

const DealStages = () => {
    const token = useSelector((state) => state.loginSlice.user?.token);
    const [dealStages, setDealStages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [stageName, setStageName] = useState('');
    const [stageOrder, setStageOrder] = useState('');
    const [editMode, setEditMode] = useState(false);
    const [selectedStageId, setSelectedStageId] = useState(null);

    useEffect(() => {
        const fetchDealStages = async () => {
            try {
                const response = await axios.get(`/api/deal-stages/get-all-deal-stages`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setDealStages(response.data);
            } catch (err) {
                setError('Failed to load deal stages');
            } finally {
                setLoading(false);
            }
        };

        if (token) {
            fetchDealStages();
        } else {
            setLoading(false);
            setError('No authentication token found');
        }
    }, [token]);

    const resetForm = () => {
        setStageName('');
        setStageOrder('');
        setEditMode(false);
        setSelectedStageId(null);
        setError(null);
    };

    const handleAddOrUpdateDealStage = async (e) => {
        e.preventDefault();

        if (!stageName || !stageOrder) {
            setError('Both fields are required');
            return;
        }

        const payload = {
            name: stageName,
            order: parseInt(stageOrder, 10),
        };

        try {
            if (editMode) {
                // Update deal stage
                await axios.put(
                    `/api/deal-stages/update-deal-stage/${selectedStageId}`,
                    payload,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );
            } else {
                // Add new deal stage
                await axios.post(
                    `/api/deal-stages/create-deal-stage`,
                    payload,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );
            }

            // Refresh the deal stages
            const response = await axios.get(`/api/deal-stages/get-all-deal-stages`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setDealStages(response.data);

            // Reset the form
            resetForm();
        } catch (err) {
            setError(editMode ? 'Failed to update deal stage' : 'Failed to add deal stage');
        }
    };

    const handleDelete = async (stageId) => {
        try {
            await axios.put(`/api/deal-stages/delete/${stageId}`, {}, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            // Refresh the deal stages after deletion
            const response = await axios.get(`/api/deal-stages/get-all-deal-stages`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setDealStages(response.data);
        } catch (err) {
            setError('Failed to delete deal stage');
        }
    };

    const handleEdit = (stage) => {
        setStageName(stage.name);
        setStageOrder(stage.order);
        setSelectedStageId(stage.id || stage._id);
        setEditMode(true);
        setError(null);
    };

    const handleCancelEdit = () => {
        resetForm();
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <Container fluid>
            <Row>
                <Col xs={12} md={12} lg={2}>
                    {/* <Sidebar /> */}
                </Col>
                <Col xs={12} md={12} lg={10}>
                    <div>
                        <h2>Deal Stages</h2>
                        {error && <div style={{ color: 'red' }}>{error}</div>}
                        <ul>
                            {dealStages.map((stage) => (
                                <li key={stage.id || stage._id}>
                                    {stage.name} (Order: {stage.order}){' '}
                                    <button onClick={() => handleEdit(stage)}>Edit</button>
                                    <button onClick={() => handleDelete(stage.id || stage._id)} style={{ marginLeft: '10px' }}>Delete</button>
                                </li>
                            ))}
                        </ul>
                        <form onSubmit={handleAddOrUpdateDealStage} style={{ marginTop: '20px' }}>
                            <div>
                                <label>Stage Name:</label>
                                <input
                                    type="text"
                                    value={stageName}
                                    onChange={(e) => setStageName(e.target.value)}
                                    placeholder="Enter stage name"
                                />
                            </div>
                            <div>
                                <label>Order:</label>
                                <input
                                    type="number"
                                    value={stageOrder}
                                    onChange={(e) => setStageOrder(e.target.value)}
                                    placeholder="Enter stage order"
                                />
                            </div>
                            <button type="submit" style={{ marginTop: '10px' }}>
                                {editMode ? 'Update Deal Stage' : 'Add Deal Stage'}
                            </button>
                            {editMode && (
                                <button
                                    type="button"
                                    onClick={handleCancelEdit}
                                    style={{ marginLeft: '10px', marginTop: '10px' }}
                                >
                                    Cancel
                                </button>
                            )}
                        </form>
                    </div>
                </Col>
            </Row>
        </Container>
    );
};

export default DealStages;