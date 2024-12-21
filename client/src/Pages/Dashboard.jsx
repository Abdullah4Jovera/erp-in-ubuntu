import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Spinner, Button, Alert, Form, OverlayTrigger, Tooltip, Image } from 'react-bootstrap';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useSelector } from 'react-redux';
import axios from 'axios';
import SidebarComponent from '../Components/sidebar/Sidebar';

const Dashboard = () => {
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
                        {/* <SidebarComponent /> */}
                    </Col>

                    <Col xs={12} md={10}>
                        <Card className='leads_main_cards mt-3' style={{ padding: '5px 10px' }}>
                            <h4 className='text-center' style={{ color: 'white' }} >Dashboard</h4>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </div>
    )
}

export default Dashboard

// linear-gradient(141.55deg, #ffa000 3.46%, #1c1c1c 99.86%), #ffa000 !important
// #6fd943
// #3ec9d6
// #ffa21d
// #ff3a6e
// #6E777F