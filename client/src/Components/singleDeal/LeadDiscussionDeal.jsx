import React, { useState, useRef, useEffect } from 'react';
import { Card, Container, Row, Col, Button, Form, Image, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import axios from 'axios';
import default_image from '../../Assets/default_image.jpg';
import '../../Pages/style.css';
import { FiSend } from "react-icons/fi";

const LeadDiscussionDeal = ({ id, deal, fetchSingleDeal }) => {
    const token = useSelector(state => state.loginSlice.user?.token);
    const [discussionText, setDiscussionText] = useState('');
    const [error, setError] = useState('');
    const textareaRef = useRef(null);
    const chatHistoryRef = useRef(null); // Ref to the chat history container
    const chatEndRef = useRef(null); // Ref to scroll to the end of chat
    // const { lead_id: { discussions } = {} } = deal;
    const discussions = deal?.lead_id?.discussions || [];

    const handleInputChange = (e) => {
        const value = e.target.value;
        setDiscussionText(value);

        if (value.trim()) {
            setError('');
        }
    };

    // Add Discussion
    const sendDiscussionMessage = async () => {
        if (!discussionText.trim()) {
            setError('Please Enter a Comment.');
            return;
        }

        try {
            await axios.post(`/api/leads/add-discussion/${id}`, {
                comment: discussionText
            }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setDiscussionText('');
            fetchSingleDeal();
        } catch (error) {
            console.log(error, 'err');
        }
    };

    return (
        <Card className='mt-2 lead_discussion_main_card_main mutual_background_class' style={{ padding: '10px', height: '100%', maxHeight: '450px' }}>
            <Container>
                <Row>
                    <Col xs={12}>
                        <div className='discussion_files'>
                            <h5 className='mutual_class_color'>Discussion</h5>
                        </div>
                        <div
                            className="chat-history mb-2 p-3"
                            style={{
                                height: '100vh',
                                maxHeight: '350px',
                                overflowY: 'auto',
                                backgroundColor: '#2d3134',
                                borderRadius: '8px',
                                border: '1px solid #d7aa47',
                            }}
                            ref={chatHistoryRef} // Attach ref to the chat history container
                        >
                            {discussions.slice().reverse().map((leadDiscussion, index) => {
                                const imageSrc = leadDiscussion.created_by.image
                                    ? `/images/${leadDiscussion.created_by.image}`
                                    : default_image;

                                return (
                                    <div key={index} style={{ marginBottom: '16px' }}>
                                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                            <OverlayTrigger
                                                placement="top"
                                                overlay={<Tooltip id={`tooltip-${index}`}>{leadDiscussion.created_by.name}</Tooltip>}
                                            >
                                                <Image
                                                    src={imageSrc}
                                                    alt="User profile"
                                                    className="image_control_discussion"
                                                    style={{
                                                        width: '32px',
                                                        height: '32px',
                                                        borderRadius: '50%',
                                                        objectFit: 'cover',
                                                        border: '1px solid #ddd',
                                                    }}
                                                />
                                            </OverlayTrigger>
                                            <p className="mb-0" style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#d7aa47' }}>
                                                {leadDiscussion.created_by.name}
                                            </p>
                                        </div>
                                        <p className="mb-0" style={{ fontSize: '0.75rem', color: '#ccc' }}>
                                            {new Date(leadDiscussion.created_at).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit',
                                                hour12: true,
                                            })}
                                        </p>
                                        <p
                                            className="mb-4 mt-2"
                                            style={{
                                                fontSize: '0.9rem',
                                                color: '#333',
                                                backgroundColor: '#e9ecef',
                                                padding: '10px',
                                                borderRadius: '6px',
                                                maxWidth: '80%',
                                            }}
                                        >
                                            {leadDiscussion.comment}
                                        </p>
                                    </div>
                                );
                            })}
                            <div ref={chatEndRef}></div> {/* Scroll to this when new messages are added */}
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }} >
                            <Form>
                                <Form.Control
                                    as="textarea"
                                    placeholder="Leave a comment here"
                                    rows={1}
                                    value={discussionText}
                                    onChange={handleInputChange}
                                    required
                                    ref={textareaRef} // Attach ref to the textarea
                                    maxLength={300}
                                    className='lead_discussion_class'
                                />
                                {error && <div style={{ color: 'red', marginTop: '5px' }}>{error}</div>}
                            </Form>
                            <div className='whatspp_send_message' onClick={sendDiscussionMessage}>
                                <FiSend className='sending_message_btn' />
                            </div>
                        </div>

                    </Col>
                </Row>
            </Container>
        </Card>
    );
}

export default LeadDiscussionDeal;
