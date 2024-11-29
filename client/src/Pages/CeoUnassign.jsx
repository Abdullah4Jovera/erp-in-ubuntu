import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import Navbar from '../Components/navbar/Navbar';
import { Container, Row, Col, Modal, Button, Card, Pagination, Spinner } from 'react-bootstrap';
import Sidebar from '../Components/sidebar/Sidebar';
import Select from 'react-select';
import { MdDriveFileMove } from "react-icons/md";
import { FaFacebookSquare } from "react-icons/fa";
import { GrView } from "react-icons/gr";

const CEOunassignedLead = () => {
    const token = useSelector((state) => state.loginSlice.user?.token);
    const branches = useSelector((state) => state.loginSlice.branches);
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [assignModal, setAssignModal] = useState(false);
    const [selectedLead, setSelectedLead] = useState(null);
    const [selectedPipeline, setSelectedPipeline] = useState(null);
    const [selectedStage, setSelectedStage] = useState(null);
    const [selectedBranch, setSelectedBranch] = useState(null);
    const [stages, setStages] = useState([]);
    const [moveSuccessMessage, setMoveSuccessMessage] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUserDescription, setSelectedUserDescription] = useState('')
    const [ceoUnassignModal, setCeoUnassignModal] = useState(false);
    const [rtl, setRtl] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const leadsPerPage = 10; // Number of leads per page

    const fetchLeads = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/leads/ceo-lead`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setLeads(response.data);
        } catch (error) {
            setError('Error fetching CEO leads');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const savedRtl = localStorage.getItem('rtl');
        setRtl(savedRtl); // Update state with the 'rtl' value from localStorage
    }, [rtl]);

    useEffect(() => {
        if (token) {
            fetchLeads();
        }
    }, [token]);

    const fetchProductStages = async (productId) => {
        try {
            const headers = { Authorization: `Bearer ${token}` };
            const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/productstages/${productId}`, { headers });
            setStages(response.data);
        } catch (err) {
            setError('Error fetching product stages');
        }
    };

    const moveLeadsHandler = async () => {
        try {
            const response = await axios.put(
                `${process.env.REACT_APP_BASE_URL}/api/leads/move-lead/${selectedLead?._id}`,
                {
                    pipeline: selectedPipeline?.value,
                    branch: selectedBranch?.value,
                    product_stage: selectedStage?.value,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            setMoveSuccessMessage(response.data.message);
            setSelectedPipeline(null);
            setSelectedBranch(null);
            setSelectedStage(null);

            setTimeout(() => {
                setMoveSuccessMessage(false);
                setAssignModal(false);
            }, 3000);

            fetchLeads();

        } catch (error) {
            console.error('Error moving leads:', error);
        }
    };

    useEffect(() => {
        if (selectedLead && selectedPipeline) {
            fetchProductStages(selectedLead.products._id);
        }
    }, [selectedPipeline, selectedLead, token]);

    const openMoveModal = (lead) => {
        setSelectedLead(lead);
        setAssignModal(true);
    };

    const viewDescription = (lead) => {
        setSelectedUserDescription(lead);
        setCeoUnassignModal(true);
    };

    const pipelineOptions = selectedLead?.products.pipeline_id.map((pipeline) => ({
        value: pipeline._id,
        label: pipeline.name,
    }));

    const stageOptions = stages.map((stage) => ({
        value: stage._id,
        label: stage.name,
    }));

    const branchOptions = branches.map((branch) => ({
        value: branch._id,
        label: branch.name,
    }));

    // Automatically set selectedPipeline when the specific branch is selected
    useEffect(() => {
        if (selectedBranch?.value === '673b34924b966621c041caac') {
            setSelectedPipeline({ value: '673b190186706b218f6f3262', label: 'Ajman Branch' });
        } else {
            setSelectedPipeline(null);
        }
    }, [selectedBranch]);

    const filteredLeads = leads.filter(lead =>
        lead.client.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Pagination Logic
    const totalPages = Math.ceil(filteredLeads.length / leadsPerPage);
    const indexOfLastLead = currentPage * leadsPerPage;
    const indexOfFirstLead = indexOfLastLead - leadsPerPage;
    const currentLeads = filteredLeads.slice(indexOfFirstLead, indexOfLastLead);

    const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);

    const renderPaginationItems = () => {
        const maxPagesToShow = 3;
        let startPage = Math.max(currentPage - 1, 1);
        let endPage = Math.min(startPage + maxPagesToShow - 1, totalPages);

        // Adjust startPage if we're at the end of the page list
        if (endPage - startPage < maxPagesToShow - 1) {
            startPage = Math.max(endPage - maxPagesToShow + 1, 1);
        }

        const pageItems = [];
        for (let i = startPage; i <= endPage; i++) {
            pageItems.push(
                <Pagination.Item
                    key={i}
                    active={i === currentPage}
                    onClick={() => handlePageChange(i)}
                >
                    {i}
                </Pagination.Item>
            );
        }
        return pageItems;
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Spinner animation="grow" />
            </div>
        );
    }

    return (
        <div>
            <Container fluid style={{ direction: rtl === 'true' ? 'rtl' : 'ltr' }}>
                <Row>
                    <Col xs={12} md={12} lg={2}>
                        <Sidebar />
                    </Col>

                    <Col xs={12} md={12} lg={10}>
                        <Card className='leads_main_cards' style={{ maxHeight: '95vh', overflow: 'hidden' }}>
                            <h2
                                className="mutual_heading_class"
                                style={{
                                    textAlign: rtl === 'true' ? 'center' : 'center',
                                    direction: rtl === 'true' ? 'rtl' : 'ltr',
                                }}
                            >
                                {rtl === 'true'
                                    ? `القيادة غير المعينة (${filteredLeads.length})`
                                    : `Un-Assigned Leads (${filteredLeads.length})`}
                            </h2>
                            <div className="mb-3">
                                <input
                                    type="text"
                                    className="form-control search-input"
                                    placeholder={rtl === 'true' ? 'ابحث بواسطة اسم العميل' : 'Search by client name'}
                                    value={searchTerm}
                                    onChange={(e) => {
                                        setSearchTerm(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    style={{
                                        textAlign: rtl === 'true' ? 'right' : 'left',
                                        direction: rtl === 'true' ? 'rtl' : 'ltr',
                                    }}
                                />
                            </div>
                            <div
                                style={{
                                    display: 'flex',
                                    flexWrap: 'wrap',
                                    gap: '5px',
                                    justifyContent: 'center',
                                    alignItems: 'center'
                                }}
                            >
                                {currentLeads.map((lead) => (
                                    <Card
                                        key={lead.id}
                                        className="lead-card p-3 border rounded "
                                        style={{
                                            // width: '215px',
                                            height: '303px',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            justifyContent: 'space-between',
                                            backgroundColor: '#fff'
                                        }}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'end', alignItems: 'start' }}>
                                            <MdDriveFileMove
                                                style={{ fontSize: '20px', color: '#ffa000', cursor: 'pointer', marginRight: '5px' }}
                                                onClick={() => openMoveModal(lead)}
                                            />
                                            <GrView style={{ fontSize: '20px', color: '#ffa000', cursor: 'pointer' }} onClick={() => viewDescription(lead)} />
                                        </div>

                                        <div style={{ width: '100%', maxWidth: '220px' }} className='mt-2 text-center'>
                                            <p className='text-center' style={{ fontWeight: '600', color: '#ffa000' }}>{lead.client.name}</p>
                                        </div>

                                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }} >
                                            <p style={{ fontWeight: '600' }} >{lead.client.phone}</p>

                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }} >
                                                <div className="product_stage_lead p-1">
                                                    <p className="mb-0 text-center" style={{ fontSize: '11px' }}>
                                                        {lead.products?.name}
                                                    </p>
                                                </div>
                                                <p className="mb-0 text-center" style={{ fontSize: '30px', cursor: 'pointer', color: '#3f51b5' }}>
                                                    <FaFacebookSquare style={{ color: '#1877F2' }} />
                                                </p>
                                                <div className="lead_type_lead">
                                                    <p className="mb-0 text-center" style={{ fontSize: '11px' }}>
                                                        {lead.lead_type?.name}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        <p
                                            className="text-center mt-4"
                                            style={{
                                                fontWeight: '500',
                                                fontSize: '16px',
                                                color: '#979797',
                                                textAlign: rtl === 'true' ? 'right' : 'left', // Adjust text alignment
                                                direction: rtl === 'true' ? 'rtl' : 'ltr', // Set direction to rtl or ltr
                                            }}
                                        >
                                            {new Date(lead.created_at).toLocaleDateString(rtl === 'true' ? 'ar-EG' : 'en-US', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit',
                                                hour12: true,
                                            })}
                                        </p>

                                    </Card>
                                ))}
                            </div>
                            {/* Pagination Controls */}
                            <Pagination className="mt-1 justify-content-center custom-pagination">
                                <Pagination.Prev
                                    onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
                                    disabled={currentPage === 1}
                                />
                                {renderPaginationItems()}
                                <Pagination.Next
                                    onClick={() => currentPage < totalPages && setCurrentPage(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                />
                            </Pagination>
                        </Card>
                    </Col>
                </Row>
            </Container>

            {/* Modal for Assigning Leads */}
            <Modal show={assignModal} onHide={() => setAssignModal(false)} size="md">
                <Modal.Header closeButton style={{ border: 'none' }} >
                    <Modal.Title
                        className="mutual_heading_class"
                        style={{
                            textAlign: rtl === 'true' ? 'right' : 'left',
                            direction: rtl === 'true' ? 'rtl' : 'ltr',
                        }}
                    >
                        {rtl === 'true' ? 'تعيين العميل' : 'Assign Lead'}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {moveSuccessMessage && <div className="alert alert-success">{moveSuccessMessage}</div>}
                    <h6
                        className="mutual_heading_class"
                        style={{
                            textAlign: rtl === 'true' ? 'right' : 'left',
                            direction: rtl === 'true' ? 'rtl' : 'ltr',
                        }}
                    >
                        {rtl === 'true' ? 'اختر الفرع' : 'Select Branch'}
                    </h6>
                    <Select
                        options={branchOptions}
                        onChange={setSelectedBranch}
                        value={selectedBranch}
                        className=' input_field_input_field'
                        classNamePrefix="react-select"
                    />

                    <h6
                        className="mt-3 mutual_heading_class"
                        style={{
                            textAlign: rtl === 'true' ? 'right' : 'left',
                            direction: rtl === 'true' ? 'rtl' : 'ltr',
                        }}
                    >
                        {rtl === 'true' ? 'اختر خط الأنابيب' : 'Select Pipeline'}
                    </h6>
                    <Select
                        options={pipelineOptions}
                        onChange={setSelectedPipeline}
                        value={selectedPipeline}
                        isDisabled={selectedBranch?.value === '673b34924b966621c041caac'} // Disable when specific branch is selected
                        className=' input_field_input_field'
                        classNamePrefix="react-select"
                    />

                    <h6
                        className="mt-3 mutual_heading_class"
                        style={{
                            textAlign: rtl === 'true' ? 'right' : 'left',
                            direction: rtl === 'true' ? 'rtl' : 'ltr',
                        }}
                    >
                        {rtl === 'true' ? 'اختر المرحلة' : 'Select Stage'}
                    </h6>
                    <Select
                        options={stageOptions}
                        onChange={setSelectedStage}
                        value={selectedStage}
                        className='input_field_input_field'
                        classNamePrefix="react-select"
                    />
                </Modal.Body>
                <Modal.Footer
                    style={{
                        border: 'none',
                        textAlign: rtl === 'true' ? 'right' : 'left',
                        direction: rtl === 'true' ? 'rtl' : 'ltr',
                    }}
                >
                    <Button className='all_close_btn_container' onClick={() => setAssignModal(false)}>
                        {rtl === 'true' ? 'إغلاق' : 'Close'}
                    </Button>
                    <Button className='all_single_leads_button' onClick={moveLeadsHandler}>
                        {rtl === 'true' ? 'نقل العميل' : 'Move Lead'}
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Selected User Modal Description */}
            <Modal
                size="lg"
                aria-labelledby="contained-modal-title-vcenter"
                centered
                show={ceoUnassignModal}
                onHide={() => setCeoUnassignModal(false)}
            >
                <Modal.Header
                    closeButton
                    style={{
                        border: 'none',
                        textAlign: rtl === 'true' ? 'right' : 'left',
                        direction: rtl === 'true' ? 'rtl' : 'ltr',
                    }}
                >
                    <Modal.Title id="contained-modal-title-vcenter" className='mutual_heading_class'>
                        {rtl === 'true' ? 'وصف العميل' : 'Lead Description'}
                    </Modal.Title>
                </Modal.Header>

                <Modal.Body
                    style={{
                        textAlign: rtl === 'true' ? 'right' : 'left',
                        direction: rtl === 'true' ? 'rtl' : 'ltr',
                    }}
                >
                    {selectedUserDescription && (
                        <ul>
                            {selectedUserDescription.description.split('\n').map((item, index) => (
                                <li className='mutual_heading_class' key={index}>
                                    {item.replace('• ', '')} {/* Remove the bullet character */}
                                </li>
                            ))}
                        </ul>
                    )}
                </Modal.Body>

                <Modal.Footer
                    style={{
                        border: 'none',
                        textAlign: rtl === 'true' ? 'right' : 'left',
                        direction: rtl === 'true' ? 'rtl' : 'ltr',
                    }}
                >
                    <Button className='all_close_btn_container' onClick={() => setCeoUnassignModal(false)}>
                        {rtl === 'true' ? 'إغلاق' : 'Close'}
                    </Button>
                </Modal.Footer>
            </Modal>

            <style jsx>{`
  .search-input {
    width: 100%;
    max-width: 400px;  /* Adjust the max width as per your design */
    height: 40px;      /* iOS-style height */
    padding: 0 15px;   /* Add padding for rounded feel */
    border-radius: 25px; /* Rounded corners */
    border: 1px solid #ddd; /* Light border color for iOS look */
    font-size: 16px;   /* Appropriate font size */
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1); /* Light shadow for depth */
    outline: none;     /* Remove outline on focus */
    transition: box-shadow 0.2s ease-in-out; /* Smooth transition for focus effect */
  }

  .search-input:focus {
    border-color: #007aff;  /* Blue color for focused input (iOS blue) */
    box-shadow: 0 0 5px rgba(0, 122, 255, 0.5); /* Blue glow when focused */
  }

  /* Optional: Mobile responsive tweaks */
  @media (max-width: 767px) {
    .search-input {
      max-width: 90%;  /* Adjust width on smaller screens */
    }
  }
`}</style>
        </div>


    );
};

export default CEOunassignedLead;
