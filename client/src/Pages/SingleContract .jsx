import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Container, Row, Col, Card, Spinner, Image, Button } from 'react-bootstrap';
import Sidebar from '../Components/sidebar/Sidebar';
import { MdOutlinePhone, MdOutlineEmail } from "react-icons/md";
import { SiEmirates } from "react-icons/si";
import '../Pages/ContractStyle.css'
import WhatsAppChatBoxContract from '../Components/singleContract/WhatsAppChatBoxContract';
import LeadDiscussionContract from '../Components/singleContract/LeadDiscussionContract';
import FileUploaderContract from '../Components/singleContract/FileUploaderContract';
import ContractActivity from '../Components/singleContract/ContractActivity';
import ServiceDetails from '../Components/singleContract/ServiceDetails';
import CommissionDetails from '../Components/singleContract/CommissionDetails';
import ContractUsers from '../Components/ContractUsers';
import EditContract from '../Components/EditContract';

const SingleContract = () => {
    const { id } = useParams(); // Get the contract ID from URL params 
    const [contract, setContract] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [leadId, setLeadId] = useState('')
    const [ClientId, setClientId] = useState('')
    const [editModal, setEditModal] = useState(false)
    const token = useSelector((state) => state.loginSlice.user?.token);

    const fetchContract = async () => {
        if (!token) return; // Ensure ID and token are available
        setLoading(true); // Start loading state

        try {
            const response = await axios.get(
                `${process.env.REACT_APP_BASE_URL}/api/contracts/single-contract/${id}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            setContract(response.data);
            setLeadId(response.data?.lead_id?._id)
            setClientId(response.data?.client_id?._id)
            setError(null); // Clear any previous errors
        } catch (err) {
            setError('Failed to fetch contract');
        } finally {
            setLoading(false); // End loading state
        }
    };

    useEffect(() => {
        fetchContract();
    }, [token, id]);

    if (loading) {
        return <div className="text-center my-5">
            <Spinner animation="grow" color='#d7aa47'></Spinner>
        </div>;
    }

    if (!contract) {
        return <h3 className="text-center mutual_heading_class">No contract found</h3>;
    }

    return (
        <Container fluid>
            <Row>
                <Col xs={12} md={12} lg={2}>
                    <Sidebar />
                </Col>
                <Col xs={10}>
                    <Card className='leads_main_cards mt-4'>
                        <div className='' style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-end', gap: '8px' }}>
                            <>
                                <Button
                                    className="all_single_leads_button"
                                    onClick={() => setEditModal(true)}
                                // style={{ direction: rtl === 'true' ? 'rtl' : 'ltr' }}
                                >
                                    Edit
                                </Button>


                                <Button
                                    className="all_single_leads_button"
                                // onClick={() => setModalShow(true)}
                                // style={{ direction: rtl === 'true' ? 'rtl' : 'ltr' }}
                                >
                                    Delete
                                </Button>


                                <Button
                                    className="all_single_leads_button"
                                // onClick={() => setMoveLeadModal(true)}
                                // style={{ direction: rtl === 'true' ? 'rtl' : 'ltr' }}
                                >
                                    Convert To Deal
                                </Button>
                            </>
                        </div>
                        <Row>
                            <Col sm={12} md={9}>
                                <Row>
                                    <Col sm={12} md={4}>
                                        <Card className='lead_discussion_main_card_user mutual_background_class'>
                                            <Card.Body>
                                                <h5 style={{ textAlign: 'center' }} className='mutual_class_color' >{contract.client_id?.name || 'N/A'} </h5>
                                                <div className='first_card' >
                                                    <div className='single_lead_upper_container' >
                                                        <div className='single_lead_icons_one' >
                                                            <MdOutlinePhone style={{ fontSize: '18px' }} />
                                                        </div>
                                                        <div>
                                                            <p className='text-muted text-sm mb-0 mutual_heading_class' >Phone</p>
                                                            <p className='mb-0 mutual_class_color' style={{}}>{contract.client_id?.phone && contract.client_id?.phone}</p>
                                                        </div>
                                                    </div>

                                                    <div className='single_lead_upper_container' >
                                                        <div className='single_lead_icons_one' >
                                                            <MdOutlineEmail style={{ fontSize: '18px' }} />
                                                        </div>
                                                        <div>
                                                            <p className='text-muted text-sm mb-0 mutual_heading_class' >Email</p>
                                                            <div style={{ width: '100%', maxWidth: '180px' }} >
                                                                <p className='mb-0 mutual_class_color' style={{}}>{contract.client_id?.email && contract.client_id?.email}</p>
                                                            </div>

                                                        </div>
                                                    </div>

                                                    <div className='single_lead_upper_container' >
                                                        <div className='single_lead_icons_two' >
                                                            <SiEmirates style={{ fontSize: '18px' }} />
                                                        </div>
                                                        <div>
                                                            <p className='text-muted text-sm mb-0 mutual_heading_class' >Emirates ID</p>
                                                            <p className='mb-0 mutual_class_color' style={{}}>{contract.client_id?.e_id && contract.client_id?.e_id}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </Card.Body>
                                        </Card>
                                        <ContractUsers contract={contract} />
                                        {/* File Uploader */}
                                        <FileUploaderContract id={leadId} fetchContract={fetchContract} contract={contract} />
                                    </Col>
                                    <Col sm={12} md={8}>
                                        <ServiceDetails contract={contract} />
                                        <div className='mt-2'>
                                            <CommissionDetails fetchContract={fetchContract} contract={contract} />
                                        </div>
                                        <div className='mt-2' >
                                            <ContractActivity contract={contract} />
                                        </div>
                                    </Col>
                                </Row>
                            </Col>
                            <Col sm={12} md={3} >
                                <Row style={{ height: '100vh', maxHeight: '800px' }}>
                                    <Col sm={12} md={12} >
                                        {/* WhatsApp Chat */}
                                        <WhatsAppChatBoxContract leadId={leadId} ClientId={ClientId} />
                                    </Col>

                                    <Col sm={12} md={12} className='mt-0'>
                                        {/* Discussion */}
                                        <LeadDiscussionContract id={leadId} fetchContract={fetchContract} contract={contract} />
                                    </Col>
                                </Row>

                            </Col>
                        </Row>

                    </Card>
                </Col>
            </Row>
            <EditContract editModal={editModal} setEditModal={setEditModal} contract={contract} />
        </Container>
    );
};

export default SingleContract;