import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';

const DashboardLabels = ({ fetchLeadsData, leadId, setLabelsDashBoardModal, labelsDashboardModal,rtl }) => {
    const token = useSelector(state => state.loginSlice.user?.token);
    const [singleLead, setSingleLead] = useState(null);
    const [pipelineId, setPipelineID] = useState(null);
    const [previousLabels, setPreviousLabels] = useState([]);
    const [allLabels, setAllLabels] = useState([]);
    const [selectedLabelIds, setSelectedLabelIds] = useState([]);
    const [newLabelName, setNewLabelName] = useState('');
    const [selectedColor, setSelectedColor] = useState('#fff');
    const [editingLabelId, setEditingLabelId] = useState(null);
    const [isEditMode, setIsEditMode] = useState(false);

    const fetchSingleLead = async () => {
        try {
            const response = await axios.get(`/api/leads/single-lead/${leadId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const leadData = response.data;
            setSingleLead(leadData);
            setPreviousLabels(leadData.labels);
            setSelectedLabelIds(leadData.labels.map(label => label._id));
            setPipelineID(leadData.pipeline_id._id);
        } catch (error) {
            console.error('Error fetching single lead:', error);
        }
    };

    const fetchPipelineLabels = async (pipelineId) => {
        try {
            const response = await axios.get(`/api/labels/pipeline/${pipelineId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setAllLabels(response.data);
        } catch (error) {
            console.error('Error fetching labels:', error);
        }
    };

    useEffect(() => {
        fetchSingleLead();
    }, [leadId]);

    useEffect(() => {
        if (pipelineId) {
            fetchPipelineLabels(pipelineId);
        }
    }, [pipelineId]);

    const handleCheckboxChange = (labelId) => {
        setSelectedLabelIds((prevSelected) => {
            if (prevSelected.includes(labelId)) {
                return prevSelected.filter(id => id !== labelId);
            } else {
                return [...prevSelected, labelId];
            }
        });
    };

    const getBranchID = localStorage.getItem('selectedBranchId');
    const getProductID = localStorage.getItem('selectedProductId');

    const submitDashBoardLabels = async () => {
        try {
            const payload = { labels: selectedLabelIds };
            await axios.put(`/api/leads/edit-labels/${leadId}`, payload, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setLabelsDashBoardModal(false);
            setSelectedColor('#fff');
            fetchLeadsData(getProductID, getBranchID);
        } catch (error) {
            console.error('Error updating labels:', error);
        }
    };

    // Mapping color to custom background color
    const getBackgroundColor = (color) => {
        let backgroundColor = '';
        switch (color) {
            case 'success':
                backgroundColor = '#6fd943';
                break;
            case 'danger':
                backgroundColor = '#ff3a6e';
                break;
            case 'primary':
                backgroundColor = '#5c91dc';
                break;
            case 'warning':
                backgroundColor = '#ffa21d';
                break;
            case 'info':
                backgroundColor = '#6ac4f4';
                break;
            case 'secondary':
                backgroundColor = '#6c757d';
                break;
            default:
                backgroundColor = '#ccc';
        }
        return backgroundColor;
    };

    const handleLabelClick = (label) => {
        setNewLabelName(label.name);
        setSelectedColor(getBackgroundColor(label.color));  // Apply color background
        setIsEditMode(true);
        setEditingLabelId(label._id);
    };

    return (
        <Modal
            size="lg"
            aria-labelledby="contained-modal-title-vcenter"
            centered
            show={labelsDashboardModal}
            onHide={() => {
                setLabelsDashBoardModal(false);
                setIsEditMode(false);
                setNewLabelName('');
                setSelectedColor('#fff');
            }}
        >
            <Modal.Header closeButton style={{ border: 'none', direction: rtl === 'true' ? 'rtl' : 'ltr' }}>
                <Modal.Title id="contained-modal-title-vcenter" className='mutual_heading_class'>
                    {rtl === 'true' ? 'التصنيفات' : 'Labels'}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body
                style={{
                    height: '100%',
                    maxHeight: '600px',
                    overflowY: 'scroll',
                    direction: rtl === 'true' ? 'rtl' : 'ltr',
                    textAlign: rtl === 'true' ? 'right' : 'left',
                }}
            >
                {allLabels.length === 0 ? (
                    <p className="text-center mt-2 mutual_class_color">
                        {rtl === 'true' ? 'لم يتم العثور على تصنيفات لهذه الفئة.' : 'No labels found for this pipeline.'}
                    </p>
                ) : (
                    <div style={{ display: 'flex', flexWrap: 'wrap', margin: '-4px' }}>
                        {allLabels.map((label, index) => {
                            return (
                                <div
                                    key={index}
                                    style={{
                                        flex: '0 0 calc(25% - 8px)',
                                        margin: '4px',
                                        direction: rtl === 'true' ? 'rtl' : 'ltr',
                                    }}
                                >
                                    <div
                                        className="labels_class"
                                        style={{
                                            backgroundColor: getBackgroundColor(label.color), // Set dynamic color
                                            borderRadius: '4px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            padding: '4px',
                                            cursor: 'pointer',
                                            fontSize: '12px',
                                            justifyContent: rtl === 'true' ? 'flex-start' : 'space-between',
                                        }}
                                        onClick={() => handleLabelClick(label)}
                                    >
                                        <Form.Check
                                            inline
                                            id={`${label._id}`}
                                            type="checkbox"
                                            label={label.name}
                                            onChange={() => handleCheckboxChange(label._id)}
                                            checked={selectedLabelIds.includes(label._id)}
                                            style={{
                                                direction: rtl === 'true' ? 'rtl' : 'ltr',
                                                textAlign: rtl === 'true' ? 'right' : 'left',
                                            }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </Modal.Body>
            <Modal.Footer style={{ border: 'none', direction: rtl === 'true' ? 'rtl' : 'ltr' }}>
                <Button
                    className='all_close_btn_container'
                    onClick={() => setLabelsDashBoardModal(false)}
                >
                    {rtl === 'true' ? 'إغلاق' : 'Close'}
                </Button>
                <Button className='all_common_btn_single_lead' onClick={submitDashBoardLabels}>
                    {rtl === 'true' ? 'إضافة التصنيفات' : 'Add Labels'}
                </Button>
            </Modal.Footer>

        </Modal>
    );
};

export default DashboardLabels;
