import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Container, Row, Col, Card, Spinner, Image, Button, Modal, Form, Alert, } from 'react-bootstrap';
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
import { TiDeleteOutline } from "react-icons/ti";

const SingleContract = () => {
    const { id } = useParams(); // Get the contract ID from URL params 
    const permissions = useSelector(state => state.loginSlice.user?.permissions)
    const [contract, setContract] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [leadId, setLeadId] = useState('')
    const [ClientId, setClientId] = useState('')
    const [editModal, setEditModal] = useState(false)
    const [rejectModal, setRejectModal] = useState(false)
    const [deleteModal, setDeleteModal] = useState(false)
    const [rtl, setRtl] = useState(null);
    const token = useSelector((state) => state.loginSlice.user?.token);
    const userRole = useSelector((state) => state.loginSlice.user?.role)
    const [rejectLead, setRejectLead] = useState('')
    const [rejectReasonErrorMessage, setRejectReasonErrorMessage] = useState('')
    const navigate = useNavigate()

    const canEditContract = permissions?.includes('edit_contract');
    const canRejectContract = permissions?.includes('reject_contract');
    const canCreateDeal = permissions?.includes('create_deal');

    useEffect(() => {
        const savedRtl = localStorage.getItem('rtl');
        setRtl(savedRtl); // Update state with the 'rtl' value from localStorage
    }, [rtl]);

    const fetchContract = async () => {
        if (!token) return; // Ensure ID and token are available
        setLoading(true); // Start loading state

        try {
            const response = await axios.get(
                `/api/contracts/single-contract/${id}`,
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
    const convertToDealHandler = async () => {
        if (!token) {
            return; // Exit early if there's no token
        }

        try {
            const response = await axios.post(
                `/api/contracts/convert-to-deal/${id}`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            console.log(response.data.deal, 'responseresponse')
            if (response.data.deal) {
                const deal = response.data.deal;
                navigate(`/singledeal/${response?.data?.deal?._id}`, { state: { deal } });
            }
        } catch (error) {
            console.error('Error converting to deal:', error);
        }
    };

    const deleteHandler = async () => {
        // if (!token) {
        //     return; 
        // }
        // try {
        //     const response = await axios.delete(`/api/contracts/convert-to-deal/${id}`, {}, {
        //         headers: {
        //             Authorization: `Bearer ${token}`,
        //         },
        //     })
        // } catch (error) {
        //     console.log(error, 'error')
        // }
    }

    // Reject Handler Contract
    const RejectHandler = async () => {
        try {
            const rejectedContract = await axios.put(`/api/contracts/reject-contract/${id}`, { reject_reason: rejectLead }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
            setRejectModal(false)
            setRejectReasonErrorMessage('')
            setRejectLead('')
        } catch (error) {
            setRejectReasonErrorMessage(error.response.data.message)
            console.log(error.response.data.message, 'errorMeaage')

            setTimeout(() => {
                setRejectReasonErrorMessage(false);
            }, 3000)
        }
    }

    const limitWords = (text, maxWords = 3) => {
        const words = text.split(' ');
        if (words.length <= maxWords) return text;
        return words.slice(0, maxWords).join(' ') + '...';
    };

    return (
        <Container fluid>
            <Row>
                <Col xs={12} md={12} lg={2}>
                    {/* <Sidebar /> */}
                </Col>
                <Col xs={10}>
                    <Card className='leads_main_cards mt-4'>
                        <div className='' style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-end', gap: '8px' }}>
                            <>
                                {canEditContract && (
                                    <Button
                                        className="all_single_leads_button"
                                        onClick={() => setEditModal(true)}
                                    // style={{ direction: rtl === 'true' ? 'rtl' : 'ltr' }}
                                    >
                                        Edit
                                    </Button>
                                )}

                                {userRole === 'Super Admin' && (
                                    <Button
                                        className="all_single_leads_button"
                                        onClick={() => setDeleteModal(true)}
                                    >
                                        Delete
                                    </Button>
                                )}

                                {canRejectContract && (
                                    <Button
                                        className="all_single_leads_button"
                                        onClick={() => setRejectModal(true)}
                                    // style={{ direction: rtl === 'true' ? 'rtl' : 'ltr' }}
                                    >
                                        Reject
                                    </Button>
                                )}

                                {canCreateDeal && (
                                    <Button
                                        className="all_single_leads_button"
                                        onClick={convertToDealHandler}
                                    // style={{ direction: rtl === 'true' ? 'rtl' : 'ltr' }}
                                    >
                                        Convert To Deal
                                    </Button>
                                )}
                            </>
                        </div>
                        <Row>
                            <Col sm={12} md={9}>
                                <Row>
                                    <Col sm={12} md={4}>
                                        <Card className='lead_discussion_main_card_user mutual_background_class'>
                                            <Card.Body>
                                                <h5 style={{ textAlign: 'center' }} className='mutual_class_color' title={contract.client_id?.name} >{contract.client_id?.name ? limitWords(contract.client_id?.name) : ''} </h5>
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
                                        {/* <ServiceDetails contract={contract} /> */}
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
                                        <LeadDiscussionContract id={leadId} fetchContract={fetchContract} contract={contract} />
                                    </Col>
                                </Row>

                            </Col>
                        </Row>

                    </Card>
                </Col>
            </Row>
            <EditContract editModal={editModal} setEditModal={setEditModal} contract={contract} />

            {/* Delete User Modal */}
            <Modal
                size="sm"
                aria-labelledby="contained-modal-title-vcenter"
                centered
                show={deleteModal}
                onHide={() => setDeleteModal(false)}
            >
                <Modal.Header closeButton style={{ border: 'none' }}>
                    <Modal.Title
                        id="contained-modal-title-vcenter"
                        className="mutual_heading_class"
                    >
                        {rtl === 'true' ? 'حذف المستخدم' : 'Delete Contract'}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className="text-center">
                    <TiDeleteOutline className="text-danger" style={{ fontSize: '4rem' }} />
                    <p className="mutual_heading_class">
                        {rtl === 'true' ? 'هل أنت متأكد أنك تريد حذف هذا المستخدم؟' : 'Are you sure you want to Delete this Contract?'}
                    </p>
                </Modal.Body>
                <Modal.Footer style={{ border: 'none' }}>
                    <Button onClick={() => setDeleteModal(false)} className="all_close_btn_container">
                        {rtl === 'true' ? 'إغلاق' : 'No'}
                    </Button>
                    <Button className="all_common_btn_single_lead" onClick={deleteHandler}>
                        {rtl === 'true' ? 'حذف' : 'Yes'}
                    </Button>
                </Modal.Footer>

            </Modal>

            {/* Reject User Modal */}
            <Modal
                size="md"
                aria-labelledby="contained-modal-title-vcenter"
                centered
                show={rejectModal}
                onHide={() => setRejectModal(false)}

            >
                <Modal.Header closeButton style={{ border: 'none' }} >
                    <Modal.Title id="contained-modal-title-vcenter" className='mutual_heading_class'>
                        {rtl === 'true' ? 'رفض العميل' : 'Reject Lead'}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className="text-center" style={{

                    textAlign: rtl === 'true' ? 'right' : 'left', // Align text dynamically
                    direction: rtl === 'true' ? 'rtl' : 'ltr' // Set text direction dynamically
                }}>
                    <TiDeleteOutline className="text-danger" style={{ fontSize: '4rem' }} />
                    <p>
                        <span style={{ color: 'red', fontWeight: '600' }}>
                            {rtl === 'true' ? 'هل أنت متأكد؟' : 'Are You Sure?'}
                        </span>
                        <br />
                        <span style={{ color: '#fff' }}>
                            {rtl === 'true' ? 'هل تريد رفض هذا العميل' : 'You Want to Reject this Lead'}
                        </span>
                    </p>

                    <Form.Group className="mb-3" controlId="exampleForm.ControlTextarea1">
                        <Form.Control as="textarea" rows={3} placeholder={rtl === 'true' ? 'سبب الرفض' : 'Reason For Rejection'} className="input_field_input_field" name='reject_reason' value={rejectLead} onChange={(e) => setRejectLead(e.target.value)} />
                    </Form.Group>
                    {rejectReasonErrorMessage && rejectReasonErrorMessage && <Alert variant="danger">{rejectReasonErrorMessage}</Alert>}
                </Modal.Body>

                <Modal.Footer style={{ border: 'none', direction: rtl === 'true' ? 'rtl' : 'ltr' }}>
                    <Button className='all_close_btn_container' onClick={() => setRejectModal(false)}>   {rtl === 'true' ? 'إغلاق' : 'Close'}</Button>
                    <Button className='all_common_btn_single_lead' onClick={RejectHandler} >   {rtl === 'true' ? 'رفض العميل' : 'Reject Lead'}</Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default SingleContract;