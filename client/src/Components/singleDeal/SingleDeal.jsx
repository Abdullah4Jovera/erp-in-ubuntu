import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Spinner, Alert, Button, Modal, Form } from 'react-bootstrap';
import SidebarComponent from '../sidebar/Sidebar';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { MdOutlinePhone, MdOutlineEmail } from "react-icons/md";
import { SiEmirates } from "react-icons/si";
import WhatsAppChatBoxDeal from './WhatsAppChatBoxDeal';
import LeadDiscussionDeal from './LeadDiscussionDeal';
import DealUsers from './DealUsers';
import FileUploaderDeal from './FileUploaderDeal';
import DealActivity from './DealActivity';
import DealCommissionDetails from './DealCommissionDetails';
import { TiDeleteOutline } from "react-icons/ti";
import EditDeal from './EditDeal';

const SingleDeal = () => {
  const { id } = useParams(); // Get deal ID from URL
  const token = useSelector((state) => state.loginSlice.user?.token); // Get token from Redux store

  // State for the single deal, loading, and errors
  const [deal, setDeal] = useState(null);
  const labels = Array.isArray(deal?.lead_id?.labels) ? deal.lead_id.labels : [];
  const permissions = useSelector(state => state.loginSlice.user?.permissions)
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [leadId, setLeadId] = useState('')
  const [ClientId, setClientId] = useState('')
  const [rtl, setRtl] = useState(null);
  const [editModal, setEditModal] = useState(false)
  const [rejectLead, setRejectLead] = useState('')
  const [rejectReasonErrorMessage, setRejectReasonErrorMessage] = useState('')
  const [rejectModal, setRejectModal] = useState(false)
  const userRole = useSelector((state) => state.loginSlice.user?.role)
  const canRejecteDeal = permissions?.includes('reject_deal');

  useEffect(() => {
    const savedRtl = localStorage.getItem('rtl');
    setRtl(savedRtl); // Update state with the 'rtl' value from localStorage
  }, [rtl]);

  // Fetch single deal based on ID
  const fetchSingleDeal = async () => {
    try {
      setLoading(true); // Start loading
      setError(''); // Clear previous errors

      const response = await axios.get(
        `/api/deals/get-single-deal/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`, // Include token in the header
          },
        }
      );

      setDeal(response.data); // Set fetched deal data
      setClientId(response.data?.client_id?._id)
      setLeadId(response.data?.lead_id?._id)
      // toast.success('Deal fetched successfully!');
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to fetch deal.');
      toast.error(error.response?.data?.message || 'Failed to fetch deal.');
    } finally {
      setLoading(false); // Stop loading
    }
  };

  useEffect(() => {
    if (token) {
      fetchSingleDeal();
    }
  }, [token, id]);

  const limitWords = (text, maxWords = 3) => {
    const words = text.split(' ');
    if (words.length <= maxWords) return text;
    return words.slice(0, maxWords).join(' ') + '...';
  };

  // Reject Handler Contract
  const RejectHandler = async () => {
    try {
      const rejectedContract = await axios.put(`/api/deals/reject-deal/${id}`, { reject_reason: rejectLead }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      setRejectModal(false)
      setRejectReasonErrorMessage('')
      setRejectLead('')
    } catch (error) {
      setRejectReasonErrorMessage(error.response.data.message)
      setTimeout(() => {
        setRejectReasonErrorMessage(false);
      }, 3000)
    }
  }

  return (
    <>
      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
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

          <Col xs={12} md={12} lg={10}>
            <Card className="leads_main_cards mt-4">
              {/* Show loading spinner */}
              {loading && (
                <div className="text-center mt-4">
                  <Spinner animation="border" variant="primary" />
                </div>
              )}

              <div className='' style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-end', gap: '8px' }}>
                <>
                  {/* <Button
                    className="all_single_leads_button"
                    onClick={() => setEditModal(true)}
                  // style={{ direction: rtl === 'true' ? 'rtl' : 'ltr' }}
                  >
                    Edit
                  </Button> */}
                  {canRejecteDeal && (
                    <Button
                      className="all_single_leads_button"
                      onClick={() => setRejectModal(true)}
                    // style={{ direction: rtl === 'true' ? 'rtl' : 'ltr' }}
                    >
                      Reject
                    </Button>
                  )}

                  {userRole === 'Super Admin' && (
                    <Button
                      className="all_single_leads_button"
                    // onClick={() => setDeleteModal(true)}
                    >
                      Delete
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
                          <h5 style={{ textAlign: 'center' }} className='mutual_class_color' title={deal?.client_id?.name} >{deal?.client_id?.name ? limitWords(deal?.client_id?.name) : ''} </h5>
                          <div className='first_card' >
                            <div className='single_lead_upper_container' >
                              <div className='single_lead_icons_one' >
                                <MdOutlinePhone style={{ fontSize: '18px' }} />
                              </div>
                              <div>
                                <p className='text-muted text-sm mb-0 mutual_heading_class' >Phone</p>
                                <p className='mb-0 mutual_class_color' style={{}}>{deal?.client_id?.phone && deal?.client_id?.phone}</p>
                              </div>
                            </div>

                            <div className='single_lead_upper_container' >
                              <div className='single_lead_icons_one' >
                                <MdOutlineEmail style={{ fontSize: '18px' }} />
                              </div>
                              <div>
                                <p className='text-muted text-sm mb-0 mutual_heading_class' >Email</p>
                                <div style={{ width: '100%', maxWidth: '180px' }} >
                                  <p className='mb-0 mutual_class_color' style={{}}>{deal?.client_id?.email && deal?.client_id?.email}</p>
                                </div>

                              </div>
                            </div>

                            <div className='single_lead_upper_container' >
                              <div className='single_lead_icons_two' >
                                <SiEmirates style={{ fontSize: '18px' }} />
                              </div>
                              <div>
                                <p className='text-muted text-sm mb-0 mutual_heading_class' >Emirates ID</p>
                                <p className='mb-0 mutual_class_color' style={{}}>{deal?.client_id?.e_id && deal?.client_id?.e_id}</p>
                              </div>
                            </div>
                          </div>
                        </Card.Body>
                      </Card>
                      <DealUsers deal={deal} />
                      {/* File Uploader */}
                      <FileUploaderDeal id={leadId} fetchSingleDeal={fetchSingleDeal} deal={deal} />
                    </Col>
                    <Col sm={12} md={8}>
                      <Card body className='lead_discussion_main_card_singledeal mutual_background_class'>
                        {
                          labels?.length > 0 && (
                            <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap' }}>
                              {labels.map((label, index) => {
                                let backgroundColor = '';

                                // Set the background color based on the label color
                                switch (label.color) {
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
                                    backgroundColor = '#ccc'; // Default color if no match
                                }

                                return (
                                  <div key={index} style={{ marginRight: '4px', marginTop: '-26px', marginBottom: '10px' }}>
                                    <div
                                      className='labels_class'
                                      style={{
                                        backgroundColor: backgroundColor,
                                        borderRadius: '4px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        padding: '4px 8px',
                                        cursor: 'pointer'
                                      }}
                                    >
                                      <p style={{ color: '#fff', margin: 0 }}>{label.name}</p>
                                    </div>
                                  </div>
                                );
                              })}

                            </div>
                          )
                        }
                        <h5 style={{ textAlign: 'center' }} className='mutual_class_color'>
                          {deal && deal?.lead_id?.company_Name ? deal?.lead_id?.company_Name : 'No Company Name'}
                        </h5>
                        <div className='first_card_product'>
                          <div className='single_lead_upper_container'>
                            <div>
                              <p className='text-muted text-sm mutual_heading_class mb-0' style={{ fontSize: '14px', fontWeight: '600' }}>
                                {rtl === 'true' ? 'الفرع' : 'Product'}
                              </p>
                              <p className='mutual_class_color' style={{ fontSize: '14px', fontWeight: '500' }}>
                                {deal?.products?.name ? deal?.products?.name : (rtl === 'true' ? 'لا يوجد فرع' : 'No Product')}
                              </p>
                            </div>
                          </div>

                          <div className='single_lead_upper_container'>
                            <div>
                              <p className='text-muted text-sm mutual_heading_class mb-0' style={{ fontSize: '14px', fontWeight: '600' }}>
                                {rtl === 'true' ? 'خط الأنابيب' : 'Pipeline'}
                              </p>
                              <p className='mutual_class_color' style={{ fontSize: '14px', fontWeight: '500' }}>
                                {deal?.pipeline_id?.name ? deal?.pipeline_id?.name : (rtl === 'true' ? 'لا يوجد خط أنابيب' : 'No pipeline')}
                              </p>
                            </div>
                          </div>

                          <div className='single_lead_upper_container'>
                            <div>
                              <p className='text-muted text-sm mutual_heading_class mb-0' style={{ fontSize: '14px', fontWeight: '600' }}>
                                {rtl === 'true' ? 'العميل من' : 'Lead From'}
                              </p>
                              <p className='mutual_class_color' style={{ fontSize: '14px', fontWeight: '500' }}>
                                {deal?.lead_type?.name ? deal?.lead_type?.name : (rtl === 'true' ? 'لا يوجد نوع' : 'No lead type')}
                              </p>
                            </div>
                          </div>

                          <div className='single_lead_upper_container'>
                            <div>
                              <p className='text-muted text-sm mutual_heading_class mb-0' style={{ fontSize: '14px', fontWeight: '600' }}>
                                {rtl === 'true' ? 'المصدر' : 'Source'}
                              </p>
                              <p className='mutual_class_color' style={{ fontSize: '14px', fontWeight: '500' }}>
                                {deal?.source_id?.name ? deal?.source_id?.name : (rtl === 'true' ? 'لا يوجد مصدر' : 'No source')}
                              </p>
                            </div>
                          </div>

                          <div className='single_lead_upper_container'>
                            <div>
                              <p className='text-muted text-sm mutual_heading_class mb-0' style={{ fontSize: '14px', fontWeight: '600' }}>
                                {rtl === 'true' ? 'مرحلة العميل المحتمل' : 'Deal Stage'}
                              </p>
                              <p className='mutual_class_color' style={{ fontSize: '14px', fontWeight: '500' }}>
                                {deal?.deal_stage?.name ? deal?.deal_stage?.name : (rtl === 'true' ? 'لا توجد مرحلة' : 'No stage')}
                              </p>
                            </div>
                          </div>

                        </div>
                      </Card>
                      <div className='mt-2'>
                        <DealCommissionDetails fetchSingleDeal={fetchSingleDeal} deal={deal} />
                      </div>
                      <div className='mt-2' >
                        <DealActivity deal={deal} />
                      </div>
                    </Col>
                  </Row>
                </Col>
                <Col sm={12} md={3} >
                  <Row style={{ height: '100vh', maxHeight: '800px' }}>
                    <Col sm={12} md={12} >
                      {/* WhatsApp Chat */}
                      <WhatsAppChatBoxDeal leadId={leadId} ClientId={ClientId} />
                      <LeadDiscussionDeal id={leadId} fetchSingleDeal={fetchSingleDeal} deal={deal} />
                    </Col>
                  </Row>
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>

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
              {rtl === 'true' ? 'رفض العميل' : 'Reject Deal'}
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
                {rtl === 'true' ? 'هل تريد رفض هذا العميل' : 'You Want to Reject this Deal'}
              </span>
            </p>

            <Form.Group className="mb-3" controlId="exampleForm.ControlTextarea1">
              <Form.Control as="textarea" rows={3} placeholder={rtl === 'true' ? 'سبب الرفض' : 'Reason For Rejection'} className="input_field_input_field" name='reject_reason' value={rejectLead} onChange={(e) => setRejectLead(e.target.value)} />
            </Form.Group>
            {rejectReasonErrorMessage && rejectReasonErrorMessage && <Alert variant="danger">{rejectReasonErrorMessage}</Alert>}
          </Modal.Body>

          <Modal.Footer style={{ border: 'none', direction: rtl === 'true' ? 'rtl' : 'ltr' }}>
            <Button className='all_close_btn_container' onClick={() => setRejectModal(false)}>   {rtl === 'true' ? 'إغلاق' : 'Close'}</Button>
            <Button className='all_common_btn_single_lead' onClick={RejectHandler} >   {rtl === 'true' ? 'رفض العميل' : 'Reject Deal'}</Button>
          </Modal.Footer>
        </Modal>
        {/* <EditDeal setEditModal={setEditModal} editModal={editModal} deal={deal} /> */}
      </Container>
    </>
  );
};

export default SingleDeal;
