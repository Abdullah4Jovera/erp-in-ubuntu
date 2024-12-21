import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { Col, Container, Image, Row, Card, Button, OverlayTrigger, Tooltip, Modal } from 'react-bootstrap';
import Sidebar from '../Components/sidebar/Sidebar';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import Select from 'react-select';
import { TiDeleteOutline } from "react-icons/ti";
import { AiFillDelete } from "react-icons/ai";
import { GrView } from "react-icons/gr";

const Request = () => {
    const [requests, setRequests] = useState([]);
    const [filteredRequests, setFilteredRequests] = useState([]);
    const token = useSelector(state => state.loginSlice.user?.token);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const userId = useSelector(state => state.loginSlice.user?._id);
    const [pendingCount, setPendingCount] = useState(0);
    const [actionCount, setActionCount] = useState(0);
    const [delLabelModal, setDelLabelModal] = useState(false);
    const [deleteLabelId, setDeleteLabelId] = useState(null)
    const navigate = useNavigate()
    const [rtl, setRtl] = useState(null);

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 2;

    const fetchRequests = async () => {
        try {
            const response = await axios.get(
                `/api/request/my-requests`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                }
            );

            if (response.data && response.data.data) {
                const fetchedRequests = response.data.data;
                setRequests(fetchedRequests);
                setFilteredRequests(fetchedRequests); // Set initial filtered requests to all requests

                // Count pending requests where the user is a receiver
                const pending = fetchedRequests.filter(request =>
                    request.receivers.some(receiver => receiver._id === userId) && request.action === 'Pending'
                );
                setPendingCount(pending.length);

                // Count accepted or declined requests where the sender is the logged-in user and read is false
                const actionTaken = fetchedRequests.filter(request =>
                    request.sender._id === userId &&
                    (request.action === 'Accept' || request.action === 'Decline') &&
                    request.read === false
                );
                setActionCount(actionTaken.length);
            } else {
                setRequests([]);
                setFilteredRequests([]);
                setPendingCount(0);
                setActionCount(0);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Error fetching requests');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const savedRtl = localStorage.getItem('rtl');
        setRtl(savedRtl); // Update state with the 'rtl' value from localStorage
    }, [rtl]);

    useEffect(() => {
        fetchRequests();
    }, [token]);

    const handleActionChange = async (requestId, action) => {
        try {
            const response = await axios.put(
                `/api/request/change-action/${requestId}`,
                { action },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                }
            );

            // Update the local state after successful action change
            setRequests(prevRequests =>
                prevRequests.map(req =>
                    req._id === requestId ? { ...req, action: response.data.updatedRequest?.action || 'Pending' } : req
                )
            );
            fetchRequests();
        } catch (err) {
            setError(err.response?.data?.message || 'Error updating request action');
        }
    };

    const handleMarkReadChange = async (requestId) => {
        try {
            await axios.put(`/api/request/mark-read/${requestId}`, {}, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            fetchRequests();
        } catch (error) {
            console.log(error, 'err');
        }
    };

    // Filter options for Select dropdown
    const actionOptions = [
        { value: 'All', label: rtl === 'true' ? 'الكل' : 'All' },
        { value: 'Pending', label: rtl === 'true' ? 'قيد الانتظار' : 'Pending' },
        { value: 'Accept', label: rtl === 'true' ? 'مقبول' : 'Accepted' },
        { value: 'Decline', label: rtl === 'true' ? 'مرفوض' : 'Decline' },
        ,
    ];

    // Handle filter change
    const handleFilterChange = (selectedOption) => {
        const action = selectedOption.value;
        if (action === 'All') {
            setFilteredRequests(requests);
        } else {
            setFilteredRequests(requests.filter(request => request.action === action));
        }
        setCurrentPage(1); // Reset pagination to first page
    };

    // Pagination logic
    const indexOfLastRequest = currentPage * itemsPerPage;
    const indexOfFirstRequest = indexOfLastRequest - itemsPerPage;
    const currentRequests = filteredRequests.slice(indexOfFirstRequest, indexOfLastRequest);
    const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
    };

    const DelRequestModal = (id) => {
        setDelLabelModal(true)
        setDeleteLabelId(id)
    }

    const handleDelete = async (id) => {
        try {
            await axios.put(`/api/request/soft-delete/${id}`, {}, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            })
            fetchRequests();
            setDelLabelModal(false)
        } catch (error) {
            console.log(error, 'error')
        }
    }

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <Container fluid style={{ direction: rtl === 'true' ? 'rtl' : 'ltr' }}>
                <Row>
                    <Col xs={12} md={12} lg={2}>
                        {/* <Sidebar /> */}
                    </Col>

                    <Col xs={12} md={12} lg={10}>
                        <Card className='leads_main_cards mt-4' style={{ maxHeight: '95vh', overflowX: 'auto' }}>
                            <h2 className='text-center mt-3 mutual_heading_class'>  {rtl === 'true' ? 'طلبات القادة' : 'Lead Requests'}</h2>

                            {/* Action Filter */}
                            <div className="mb-4 d-flex justify-content-end">
                                <Select
                                    options={actionOptions}
                                    onChange={handleFilterChange}
                                    defaultValue={actionOptions[0]}
                                    isClearable={false}
                                    placeholder="Filter by Action"
                                    className="custom-select w-50 w-sm-50 "  // Ensure it's responsive
                                    // classNamePrefix="react-select"
                                    // input_field_input_field
                                    styles={{
                                        control: (provided) => ({
                                            ...provided,
                                            borderRadius: '8px',  // Rounded corners
                                            border: 'none',  // Subtle border color
                                            padding: '2px',  // Padding for better touch targets
                                            boxShadow: 'none',  // Remove default box-shadow
                                        }),
                                        menu: (provided) => ({
                                            ...provided,
                                            borderRadius: '8px',  // Rounded menu dropdown
                                            boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',  // Subtle shadow for the dropdown
                                        }),
                                        option: (provided, state) => ({
                                            ...provided,
                                            backgroundColor: state.isSelected ? '#007bff' : 'white',  // Change color on select
                                            color: state.isSelected ? 'white' : 'black',  // Adjust text color based on selection
                                            padding: '10px',  // Padding for better legibility
                                            cursor: 'pointer',
                                            ':hover': {
                                                backgroundColor: '#f1f1f1',  // Light hover effect
                                            },
                                        }),
                                    }}
                                />
                            </div>

                            {filteredRequests.length === 0 ? (
                                <p className='mutual_heading_class'>{rtl === 'true' ? 'لا توجد طلبات ليد' : 'No lead requests found.'}</p>
                            ) : (
                                <>
                                    <Row>
                                        {currentRequests.map((request) => {
                                            const imageSrc = request.sender.image
                                                ? `/images/${request.sender.image}`
                                                : null;
                                            return (
                                                <Col key={request._id} xs={12} sm={12} md={12} lg={12} xxl={6} className="mb-4">
                                                    <Card style={{ width: '100%' }} className='lead_request_main_card' >
                                                        <Card.Body>
                                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} >
                                                                <Card.Title className='request_message' > <span style={{ color: 'white' }} >{request.message}</span> </Card.Title>
                                                                <div style={{ display: 'flex', gap: '8px', alignItems: 'start' }}>
                                                                    <AiFillDelete onClick={() => DelRequestModal(request?._id)} style={{ fontSize: '20px', color: 'red', cursor: 'pointer' }} />
                                                                    <GrView onClick={() => navigate(`/single-leads/${request?.lead_id?._id}`)} style={{ fontSize: '20px', color: '#d7aa47', cursor: 'pointer' }} />
                                                                </div>
                                                            </div>
                                                            <Row className='mt-2'>
                                                                <div
                                                                    style={{
                                                                        display: 'flex',
                                                                        justifyContent: 'space-between',
                                                                        alignItems: 'center',
                                                                        textAlign: rtl === 'true' ? 'right' : 'left', // Align text dynamically
                                                                        direction: rtl === 'true' ? 'rtl' : 'ltr',   // Set text direction dynamically
                                                                    }}
                                                                >
                                                                    <div>
                                                                        <strong style={{ color: 'white' }}>
                                                                            {rtl === 'true' ? 'المرسل' : 'Sender'}
                                                                        </strong>
                                                                        <Card.Subtitle className="mb-2 text-muted">
                                                                            {imageSrc && (
                                                                                <OverlayTrigger
                                                                                    placement="top"
                                                                                    overlay={<Tooltip id={`tooltip-sender`}>{request.sender.name}</Tooltip>}
                                                                                >
                                                                                    <Image
                                                                                        src={imageSrc}
                                                                                        alt="Sender Image"
                                                                                        style={{ width: '40px', height: '40px', borderRadius: '50%' }}
                                                                                    />
                                                                                </OverlayTrigger>
                                                                            )}
                                                                            <span style={{ color: '#d7aa47', fontWeight: '500' }}> {request.sender?.name}</span>
                                                                        </Card.Subtitle>
                                                                    </div>

                                                                    <div className="mt-1">
                                                                        <Card.Text>
                                                                            <strong style={{ color: 'white' }}>
                                                                                {rtl === 'true' ? 'العميل' : 'Client'}
                                                                            </strong>
                                                                            <p style={{ color: '#d7aa47', fontWeight: '500' }}>
                                                                                {request.lead_id?.client.name}
                                                                            </p>
                                                                        </Card.Text>
                                                                    </div>

                                                                    <div>
                                                                        <Card.Text>
                                                                            <strong style={{ color: 'white' }}>
                                                                                {rtl === 'true' ? 'النوع' : 'Type'}
                                                                            </strong>
                                                                            <p style={{ color: '#d7aa47', fontWeight: '500' }}>
                                                                                {request.type}
                                                                            </p>
                                                                        </Card.Text>
                                                                    </div>

                                                                    <div>
                                                                        <Card.Text>
                                                                            <strong style={{ color: 'white' }}>
                                                                                {rtl === 'true' ? 'الإجراء' : 'Action'}
                                                                            </strong>
                                                                            <p style={{ color: '#d7aa47', fontWeight: '500' }}>
                                                                                {request.action || (rtl === 'true' ? 'معلق' : 'Pending')}
                                                                            </p>
                                                                        </Card.Text>
                                                                    </div>
                                                                </div>


                                                                <Col
                                                                    md={6}
                                                                    lg={6}
                                                                    style={{
                                                                        textAlign: rtl === 'true' ? 'right' : 'left', // Align text dynamically
                                                                        direction: rtl === 'true' ? 'rtl' : 'ltr',   // Set text direction dynamically
                                                                    }}
                                                                >
                                                                    <Card className='current_request_status'>
                                                                        <Card.Text>
                                                                            <strong>{rtl === 'true' ? 'الحالة الحالية:' : 'Current Status:'}</strong>
                                                                            <div>
                                                                                <p className='mt-3'>
                                                                                    <strong>{rtl === 'true' ? 'الفرع:' : 'Branch:'}</strong> {request.currentBranch?.name || 'N/A'}
                                                                                </p>
                                                                                <p>
                                                                                    <strong>{rtl === 'true' ? 'المنتج:' : 'Product:'}</strong> {request?.currentProduct?.name || 'N/A'}
                                                                                </p>
                                                                                <p>
                                                                                    <strong>{rtl === 'true' ? 'الأنبوب:' : 'Pipeline:'}</strong> {request.currentPipeline?.name || 'N/A'}
                                                                                </p>
                                                                                <p>
                                                                                    <strong>{rtl === 'true' ? 'مرحلة المنتج:' : 'Product Stage:'}</strong> {request.currentProductStage?.name || 'N/A'}
                                                                                </p>
                                                                            </div>
                                                                        </Card.Text>
                                                                    </Card>
                                                                </Col>

                                                                <Col
                                                                    md={6}
                                                                    lg={6}
                                                                    style={{
                                                                        textAlign: rtl === 'true' ? 'right' : 'left', // Align text dynamically
                                                                        direction: rtl === 'true' ? 'rtl' : 'ltr',   // Set text direction dynamically
                                                                    }}
                                                                >
                                                                    <Card className='current_request_status'>
                                                                        <Card.Text>
                                                                            <strong>{rtl === 'true' ? 'الحالة المطلوبة:' : 'Requested Status:'}</strong>
                                                                            <div>
                                                                                <p className='mt-3'>
                                                                                    <strong>{rtl === 'true' ? 'الفرع:' : 'Branch:'}</strong> {request.branch?.name || 'N/A'}
                                                                                </p>
                                                                                <p>
                                                                                    <strong>{rtl === 'true' ? 'المنتج:' : 'Product:'}</strong> {request.products?.name || 'N/A'}
                                                                                </p>
                                                                                <p>
                                                                                    <strong>{rtl === 'true' ? 'الأنبوب:' : 'Pipeline:'}</strong> {request.pipeline_id?.name || 'N/A'}
                                                                                </p>
                                                                                <p>
                                                                                    <strong>{rtl === 'true' ? 'مرحلة المنتج:' : 'Product Stage:'}</strong> {request.product_stage?.name || 'N/A'}
                                                                                </p>
                                                                            </div>
                                                                        </Card.Text>
                                                                    </Card>
                                                                </Col>

                                                            </Row>

                                                            <Card.Text className='mt-2' >
                                                                <strong style={{ color: 'white' }}>Receivers</strong>
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', cursor: 'pointer' }}>
                                                                    {request.receivers?.map((receiver) => (
                                                                        <OverlayTrigger
                                                                            key={receiver._id}
                                                                            placement="top"
                                                                            overlay={<Tooltip id={`tooltip-${receiver._id}`}>{receiver.name}</Tooltip>}
                                                                        >
                                                                            <Image
                                                                                src={`/images/${receiver.image}`}
                                                                                alt="Receiver Image"
                                                                                style={{ width: '40px', height: '40px', borderRadius: '50%' }}
                                                                            />
                                                                        </OverlayTrigger>
                                                                    ))}
                                                                </div>

                                                                {request?.action !== 'Pending' && request?.actionChangedBy && (
                                                                    <Card.Text
                                                                        className={`mt-3 ${request.action === 'Accept' ? 'text-success' : request.action === 'Decline' ? 'text-danger' : ''}`}
                                                                        style={{
                                                                            textAlign: rtl === 'true' ? 'right' : 'left', // Align text dynamically
                                                                            direction: rtl === 'true' ? 'rtl' : 'ltr'    // Set text direction dynamically
                                                                        }}
                                                                    >
                                                                        Lead Request of type "{request?.type}" {request.action.toLowerCase()} by <strong>{request.actionChangedBy.name}</strong>
                                                                        {request.actionChangedBy.image && (
                                                                            <Image
                                                                                src={`/images/${request?.actionChangedBy.image}`}
                                                                                alt="Action Changed By"
                                                                                style={{
                                                                                    width: '30px',
                                                                                    height: '30px',
                                                                                    borderRadius: '50%',
                                                                                    marginLeft: rtl === 'true' ? '0' : '8px', // Adjust image margin based on RTL
                                                                                    marginRight: rtl === 'true' ? '8px' : '0'  // Adjust image margin based on RTL
                                                                                }}
                                                                            />
                                                                        )}
                                                                    </Card.Text>

                                                                )}
                                                                <div>

                                                                    {request.action === 'Pending' && request.receivers?.some((receiver) => receiver._id === userId) && (
                                                                        <div className="mt-3" style={{ display: 'flex', gap: '10px', flexDirection: rtl === 'true' ? 'row-reverse' : 'row' }}>
                                                                            <Button
                                                                                variant="success"
                                                                                onClick={() => handleActionChange(request._id, 'Accept')}
                                                                                style={{ direction: rtl === 'true' ? 'rtl' : 'ltr' }}
                                                                            >
                                                                                {rtl === 'true' ? 'قبول' : 'Accept'}
                                                                            </Button>
                                                                            <Button
                                                                                variant="danger"
                                                                                onClick={() => handleActionChange(request._id, 'Decline')}
                                                                                style={{ direction: rtl === 'true' ? 'rtl' : 'ltr' }}
                                                                            >
                                                                                {rtl === 'true' ? 'رفض' : 'Decline'}
                                                                            </Button>
                                                                        </div>
                                                                    )}
                                                                    {(request.action === 'Accept' || request.action === 'Decline') && request.sender && request.sender._id === userId && !request.read && (
                                                                        <div className="mt-3" style={{ display: 'flex', gap: '10px' }}>
                                                                            <Button
                                                                                variant="success"
                                                                                onClick={() => handleMarkReadChange(request._id)}
                                                                            >
                                                                                {rtl === 'true' ? 'تم الوسم كـ مقروء' : 'Mark as Read'}
                                                                            </Button>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </Card.Text>

                                                        </Card.Body>
                                                    </Card>
                                                </Col>
                                            );
                                        })}
                                    </Row>

                                    {/* Pagination */}
                                    <div className="pagination mt-1 d-flex justify-content-center" style={{ textAlign: rtl === 'true' ? 'right' : 'left' }}>
                                        <Button
                                            onClick={() => handlePageChange(currentPage - 1)}
                                            disabled={currentPage === 1}
                                            style={{ backgroundColor: '#d7aa47', border: 'none' }}
                                        >
                                            {rtl === 'true' ? 'السابق' : 'Previous'}
                                        </Button>
                                        <span className="mx-2 mb-0" style={{ color: 'white' }}>
                                            {currentPage} {rtl === 'true' ? 'من' : 'of'} {totalPages}
                                        </span>
                                        <Button
                                            onClick={() => handlePageChange(currentPage + 1)}
                                            disabled={currentPage === totalPages}
                                            style={{ backgroundColor: '#d7aa47', border: 'none' }}
                                        >
                                            {rtl === 'true' ? 'التالي' : 'Next'}
                                        </Button>
                                    </div>
                                </>
                            )}
                        </Card>
                    </Col>
                </Row>

                <Modal
                    size="sm"
                    aria-labelledby="contained-modal-title-vcenter"
                    centered
                    show={delLabelModal}
                    onHide={() => setDelLabelModal(false)}
                >
                    <Modal.Header closeButton style={{ border: 'none' }}>
                        <Modal.Title id="contained-modal-title-vcenter" className='mutual_heading_class'>
                            {rtl === 'true' ? 'حذف التسمية' : 'Delete Request'}
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body className="text-center">
                        <TiDeleteOutline className="text-danger" style={{ fontSize: '6rem' }} />
                        <p className='mutual_heading_class'>
                            {rtl === 'true' ? 'هل أنت متأكد أنك تريد حذف هذه التسمية؟' : 'Are you sure you want to Delete this Request?'}
                        </p>
                    </Modal.Body>
                    <Modal.Footer style={{ border: 'none' }}>
                        <Button className='all_close_btn_container' onClick={() => setDelLabelModal(false)}>
                            {rtl === 'true' ? 'لا' : 'No'}
                        </Button>
                        <Button className='all_common_btn_single_lead' onClick={() => handleDelete(deleteLabelId)}>
                            {rtl === 'true' ? 'نعم' : 'Yes'}
                        </Button>
                    </Modal.Footer>
                </Modal>

            </Container>
        </div>
    );
};

export default Request;
