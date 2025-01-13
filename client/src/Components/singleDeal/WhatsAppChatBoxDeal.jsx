import React, { useState, useEffect, useRef } from 'react';
import { Card, Form, Button } from 'react-bootstrap';
import axios from 'axios';
import { useSelector } from 'react-redux';
import io from 'socket.io-client';
import '../../Pages/style.css';
import { FiSend } from "react-icons/fi";
import { RiWhatsappFill } from "react-icons/ri";
import { GrAttachment } from "react-icons/gr";
import { BiSolidFilePdf } from "react-icons/bi";
import Spinner from 'react-bootstrap/Spinner';

const WhatsAppChat = ({ leadId, rtl }) => {
    const [chatHistory, setChatHistory] = useState([]);
    const [message, setMessage] = useState('');
    const [file, setFile] = useState(null);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState('');
    const token = useSelector(state => state.loginSlice.user?.token);
    const textareaRef = useRef(null);
    const chatEndRef = useRef(null);

    useEffect(() => {
        const fetchChatHistory = async () => {
            try {
                const { data } = await axios.get(`/api/whatsup/chat-history/${leadId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setChatHistory(data);
            } catch (err) {
                console.error('Failed to fetch chat history', err);
            }
        };

        fetchChatHistory();

        const socket = io(``, {
            transports: ['websocket'],
            upgrade: false,
        });

        socket.emit('join_lead_room', leadId);

        socket.on('new_message', (newMessage) => {
            setChatHistory(prevChatHistory => [...prevChatHistory, newMessage]);
        });

        return () => {
            socket.disconnect();
        };
    }, [leadId, token]);

    const handleSendMessage = async () => {
        if (!message && !file) {
            setError('Please provide a message or upload a file.');
            return;
        }

        setSending(true);
        setError('');

        const formData = new FormData();
        formData.append('leadId', leadId);
        if (message) formData.append('messageBody', message);
        if (file) formData.append('mediaFile', file); // Attach media file

        try {
            await axios.post(`/api/whatsup/send-message`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                },
            });

            setMessage('');
            setFile(null); // Reset file after successful send
        } catch (err) {
            setError('Failed to send message. Please try again.');
        } finally {
            setSending(false);
        }
    };

    const handleFileChange = (e) => {
        const selectedFile = e.target.files && e.target.files[0] ? e.target.files[0] : null;
        if (selectedFile) {
            setFile(selectedFile);
        } else {
            setFile(null); // Reset if no file selected
        }
    };

    useEffect(() => {
        const adjustHeight = () => {
            if (textareaRef.current) {
                textareaRef.current.style.height = 'auto';
                textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
            }
        };
        adjustHeight();
    }, [message]);

    const firstUser = chatHistory[0]?.user;
    const firstUserName = firstUser ? firstUser.name : 'the user';

    const handleRemoveFile = () => {
        setFile(null); // Clear file from state
    };

    // Helper function to format dates
    const formatDate = (date) => {
        const today = new Date();
        const messageDate = new Date(date);
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);

        // Check if message was sent today, yesterday or earlier
        if (messageDate.toDateString() === today.toDateString()) {
            return 'Today';
        } else if (messageDate.toDateString() === yesterday.toDateString()) {
            return 'Yesterday';
        } else {
            return messageDate.toLocaleDateString(); // Show date for older messages
        }
    };

    // Group chat history by date
    const groupedMessages = Array.isArray(chatHistory) ? chatHistory.reduce((groups, chat) => {
        const messageDate = formatDate(chat.createdAt);
        if (!groups[messageDate]) {
            groups[messageDate] = [];
        }
        groups[messageDate].push(chat);
        return groups;
    }, {}) : {}; // If chatHistory is not an array, return an empty object
    


    useEffect(() => {
        // Scroll to the bottom when a new message is received or sent
        if (chatEndRef.current) {
            chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [chatHistory]); // Trigger on every chatHistory change

    return (
        <Card body style={{ padding: '5px 5px 0px 5px', backgroundColor: 'white' }} className='card_discussion_chat_boat mutual_background_class'>
            <h5 className='text-center'>
                <RiWhatsappFill style={{ fontSize: '24px', color: '#4fc65a' }} /> <span className='mutual_class_color'>WhatsApp Chat</span>
            </h5>

            <div className="chat-history" style={{ display: 'flex', flexDirection: 'column', height: '100%', maxHeight: '315px', overflowY: 'auto' }}>
                <div
                    className="chat-messages"
                    style={{
                        flex: '1',
                        overflowY: 'auto',
                        padding: '30px 5px 5px 5px',
                        backgroundColor: '#2d3134',
                        marginBottom: '10px',
                        height: '100%',
                        borderRadius: '10px',
                    }}
                >
                    {Object.keys(groupedMessages).length > 0 ? (
                        Object.keys(groupedMessages)
                            .sort((a, b) => new Date(b) - new Date(a)) // Sort dates in descending order
                            .map((date, index) => (
                                <div key={index}>
                                    <h6 style={{ color: 'white', margin: '2px 0', fontSize: '14px', textAlign: 'center' }}>{date}</h6>
                                    {groupedMessages[date].map((chat, idx) => (
                                        <div
                                            key={idx}
                                            style={{
                                                display: 'flex',
                                                justifyContent: chat.user ? 'flex-end' : 'flex-start',
                                                margin: '10px 0',
                                            }}
                                        >
                                            <Card
                                                className={`message_sender ${chat.user ? 'bg-green text-white' : ''}`}
                                                style={{
                                                    borderRadius: '10px',
                                                    padding: '10px',
                                                }}
                                            >
                                                <p className="" style={{ fontSize: '12px', padding: '0 5px' }}>
                                                    <strong style={{ fontSize: '12px', paddingRight: '5px' }}>
                                                        {chat.user ? chat.user.name : 'Client'}:
                                                    </strong>
                                                    {chat.message_body}
                                                </p>
                                                <div style={{
                                                    position: 'absolute',
                                                    bottom: 0,
                                                    right: '6px',
                                                    marginTop: '6px'
                                                }} >
                                                    <p
                                                        className="mb-0"
                                                        style={{
                                                            fontSize: '10px',
                                                            color: '#b4b0b0'
                                                        }}
                                                    >
                                                        {new Date(chat.createdAt).toLocaleTimeString([], {
                                                            hour: '2-digit',
                                                            minute: '2-digit',
                                                        })}
                                                    </p>
                                                </div>
                                                {chat.media_urls && chat.media_urls.length > 0 && (
                                                    <img
                                                        src={chat.media_urls[0]}
                                                        alt="Media"
                                                        style={{ maxWidth: '100%', marginTop: '10px', borderRadius: '5px' }}
                                                    />
                                                )}
                                            </Card>
                                        </div>
                                    ))}
                                </div>
                            ))
                    ) : (
                        <p style={{ color: 'white', fontSize: '12px' }}>
                            Start a chat with {firstUserName}.
                        </p>
                    )}

                    <div ref={chatEndRef} />
                </div>

                <div className='chat_text_container_whatsapp'>
                    <Form.Group controlId="messageTextarea" className='chat_text_message w-100'>
                        {/* Combined input for message and file */}
                        <Form.Control
                            as="textarea"
                            rows={1}
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Type your message here..."
                            className='chat_input_field_placeholder'
                            ref={textareaRef}
                            maxLength={300}
                            style={{
                                paddingRight: file ? '70px' : '15px', // Space for file preview
                                position: 'relative'
                            }}
                        />

                        {/* File Preview */}
                        <label htmlFor="fileInput" style={{
                            position: 'absolute',
                            fontSize: '24px',
                            color: '#000',
                            [rtl === 'true' ? 'left' : 'right']: '46px',
                            top: '-2px',
                            cursor: 'pointer',
                        }} >
                            <GrAttachment />
                        </label>
                        <input
                            type="file"
                            id="fileInput"
                            style={{ display: 'none' }}
                            accept="image/*,application/pdf,video/*" // Set the accepted file types
                            onChange={handleFileChange}
                        />

                        {/* File Preview within the Form.Control */}
                        {file && (
                            <>
                                <div
                                    style={{
                                        position: 'absolute',
                                        [rtl === 'true' ? 'right' : 'left']: 0,
                                        bottom: '13px',
                                        transform: 'translateY(-50%)',
                                        display: 'flex',
                                        alignItems: 'center',
                                    }}
                                >
                                    {/* Conditionally render file preview */}
                                    {file.type === 'application/pdf' ? (
                                        // Show PDF icon if the file is PDF
                                        <BiSolidFilePdf size={50} style={{ color: '#ef222b', cursor: 'pointer' }} />
                                    ) : (
                                        <img
                                            src={URL.createObjectURL(file)}
                                            alt="File Preview"
                                            style={{
                                                width: '50px',
                                                height: '50px',
                                                objectFit: 'cover',
                                                borderRadius: '10px',
                                                border: '1px solid #d7aa47',
                                            }}
                                        />
                                    )}
                                </div>

                                <Button
                                    variant="danger"
                                    size="sm"
                                    onClick={handleRemoveFile}
                                    style={{
                                        position: 'absolute',
                                        bottom: '70px',
                                        [rtl === 'true' ? 'right' : 'left']: '-2px',
                                        borderRadius: '50%',
                                        padding: '0.2rem 0.5rem',
                                    }}
                                >
                                    &times;
                                </Button>
                            </>
                        )}
                    </Form.Group>

                    <div className="text-center whstapp">
                        <Button
                            variant="success"
                            disabled={sending}
                            onClick={handleSendMessage}
                            style={{ borderRadius: '50%', width: '40px', height: '40px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                        >
                            {sending ? (
                                <Spinner animation="grow" size='sm' />
                            ) : (
                                <FiSend style={{ fontSize: '24px', color: 'white' }} />
                            )}
                        </Button>
                    </div>
                </div>
                {error && (
                    <div className="error-message text-center" style={{ color: 'red', fontSize: '14px', marginTop: '5px' }}>
                        {error}
                    </div>
                )}
            </div>
        </Card>
    );
};

export default WhatsAppChat;
