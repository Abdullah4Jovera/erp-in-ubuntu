import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Button, Modal, Form, Row, Col } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

const Labels = ({ labelName, labelModal, setLabelModal, leadId, fetchSingleLead, previousLabels, rtl }) => {
    const token = useSelector(state => state.loginSlice.user?.token);
    const [selectedLabelIds, setSelectedLabelIds] = useState(previousLabels?.map(label => label._id));
    const [newLabelName, setNewLabelName] = useState('');
    const [selectedColor, setSelectedColor] = useState('#fff');
    const [isEditMode, setIsEditMode] = useState(false);
    const navigate = useNavigate()

    useEffect(() => {
        setSelectedLabelIds(previousLabels.map(label => label._id));
    }, [previousLabels]);

    const handleCheckboxChange = (labelId) => {
        setSelectedLabelIds((prevSelected) => {
            if (prevSelected.includes(labelId)) {
                return prevSelected.filter(id => id !== labelId);
            } else {
                return [...prevSelected, labelId];
            }
        });
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

    const submitLabels = async () => {
        try {
            const payload = { labels: selectedLabelIds };
            await axios.put(`/api/leads/edit-labels/${leadId}`, payload, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setLabelModal(false);
            fetchSingleLead();
            setNewLabelName('');
            setSelectedColor('#fff');
            setSelectedLabelIds(previousLabels.map(label => label._id));
        } catch (error) {
            console.error('Error adding labels:', error);
        }
    };

    const handleLabelClick = (label) => {
        setNewLabelName(label.name);
        setSelectedColor(getBackgroundColor(label.color)); // Apply color background
        setIsEditMode(true);
        // setEditingLabelId(label._id);
    };

    return (
        <div>
            <Modal
                size="lg"
                aria-labelledby="contained-modal-title-vcenter"
                centered
                show={labelModal}
                onHide={() => {
                    setLabelModal(false);
                    setIsEditMode(false);
                }}
            >
                <Modal.Header closeButton style={{ border: 'none' }} >
                    <Modal.Title
                        id="contained-modal-title-vcenter"
                        className="mutual_heading_class"
                        style={{
                            textAlign: rtl === 'true' ? 'right' : 'left', // Align text dynamically
                            direction: rtl === 'true' ? 'rtl' : 'ltr', // Set text direction
                        }}
                    >
                        {rtl === 'true' ? 'التصنيفات' : 'Labels'}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body
                    style={{
                        height: '100%',
                        maxHeight: '600px',
                        overflowY: 'scroll',
                        direction: rtl === 'true' ? 'rtl' : 'ltr', // Adjust direction dynamically
                    }}
                >
                    {labelName.length === 0 ? (
                        <div style={{ textAlign: rtl === 'true' ? 'right' : 'left' }}>
                            <span className='mutual_heading_class' > {rtl === 'true' ? 'لا توجد تصنيفات حتى الآن' : 'No Label Found'}</span>
                        </div>
                    ) : (
                        <div
                            style={{
                                display: 'flex',
                                flexWrap: 'wrap',
                                margin: rtl === 'true' ? '-4px -4px 0 0' : '-4px', // Adjust margin for RTL
                                justifyContent: rtl === 'true' ? 'flex-end' : 'flex-start', // Align items for RTL
                            }}
                        >
                            {labelName.map((label, index) => (
                                <div
                                    key={index}
                                    style={{
                                        flex: '0 0 calc(25% - 8px)',
                                        margin: rtl === 'true' ? '4px 0 0 4px' : '4px', // Adjust margin for RTL
                                    }}
                                >
                                    <div
                                        className='labels_class'
                                        style={{
                                            backgroundColor: getBackgroundColor(label.color),
                                            borderRadius: '4px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            padding: '4px',
                                            cursor: 'pointer',
                                            fontSize: '12px',
                                            justifyContent: rtl === 'true' ? 'space-between' : 'flex-start', // Adjust alignment for RTL
                                        }}
                                        onClick={() => handleLabelClick(label)}
                                    >
                                        <Form.Check
                                            inline
                                            id={`${label._id}`}
                                            type="checkbox"
                                            label={
                                                <span
                                                    style={{
                                                        backgroundColor: getBackgroundColor(label.color),
                                                        padding: '2px 6px',
                                                        borderRadius: '4px',
                                                        color: '#fff',
                                                        whiteSpace: 'nowrap', // Prevent text wrapping
                                                    }}
                                                >
                                                    {label.name}
                                                </span>
                                            }
                                            onChange={() => handleCheckboxChange(label._id)}
                                            checked={selectedLabelIds.includes(label._id)}
                                            style={{ textAlign: rtl === 'true' ? 'right' : 'left' }} // Adjust alignment for RTL
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer
                    style={{
                        border: 'none',
                        direction: rtl === 'true' ? 'rtl' : 'ltr',
                    }}
                >
                    <Button
                        className="all_close_btn_container"
                        onClick={() => {
                            setLabelModal(false);
                            setNewLabelName('');
                            setSelectedColor('#fff');
                            setIsEditMode(false);
                        }}
                    >
                        {rtl === 'true' ? 'إغلاق' : 'Close'}
                    </Button>

                    {/* Conditional rendering for "Create" or "Add Labels" button */}
                    {labelName.length === 0 ? (
                        <Button
                            className="all_common_btn_single_lead"
                            onClick={() => {
                                navigate('/createlabels')
                            }}
                        >
                            {rtl === 'true' ? 'إنشاء التصنيف' : 'Create Label'}
                        </Button>
                    ) : (
                        <Button
                            className="all_common_btn_single_lead"
                            onClick={submitLabels}
                        >
                            {rtl === 'true' ? 'إضافة التصنيفات' : 'Add Labels'}
                        </Button>
                    )}
                </Modal.Footer>


            </Modal>
        </div>
    );
};

export default Labels;
