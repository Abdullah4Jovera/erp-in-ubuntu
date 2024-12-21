import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Table, Form, Pagination, Modal, Button, Card, Image } from 'react-bootstrap';
import Sidebar from '../Components/sidebar/Sidebar';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { GrView } from "react-icons/gr";
import { Link } from 'react-router-dom';
import { FcCancel } from "react-icons/fc";
import '../Pages/style.css';
import rejected_image from '../Assets/rejected_image.png';

const RejectedLeads = () => {
    const token = useSelector(state => state.loginSlice.user?.token);
    const branchNames = useSelector(state => state.loginSlice.branches);
    const productNames = useSelector(state => state.loginSlice.products);
    const product = useSelector((state) => state.loginSlice.user?.products);
    const branch = useSelector((state) => state.loginSlice.user?.branch);
    const [rtl, setRtl] = useState(null);
    const [rejectedLeads, setRejectedLeads] = useState([]);
    const [rejectedLeadReason, setRejectedLeadReason] = useState(false);
    const [selectedRejectReason, setSelectedRejectReason] = useState('');
    const [searchClientName, setSearchClientName] = useState('');
    const [searchCompanyName, setSearchCompanyName] = useState('')
    const [searchPhoneNumber, setSearchPhoneNumber] = useState('');
    const [searchPipelineName, setSearchPipelineName] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedBranch, setSelectedBranch] = useState('All');
    const [selectedProduct, setSelectedProduct] = useState('All');
    const leadsPerPage = 14;
    const pagesToShow = 5;

    const productPipelineMap = {
        'Business Banking': ['Business Banking'],
        'Personal Loan': ['EIB Bank', 'Personal Loan'],
        'Mortgage Loan': ['Mortgage', 'CEO Mortgage'],
    };

    // Fetch Rejected Leads
    const fetchRejectedLeads = async () => {
        try {
            const response = await axios.get(`/api/leads/rejected-leads`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setRejectedLeads(response.data.leadDetails || []);
        } catch (error) {
            console.error('Error fetching rejected leads:', error);
        }
    };
    useEffect(() => {
        fetchRejectedLeads();
    }, [token]);

    // Filter leads based on selected branch, pipeline name, and search terms
    const filteredLeads = rejectedLeads?.filter(lead =>
        (selectedBranch === 'All' || lead.branchName === selectedBranch) &&
        (selectedProduct === 'All' || lead.productName === selectedProduct) &&
        lead.clientName?.toLowerCase().includes(searchClientName?.toLowerCase()) &&
        lead.pipelineName?.toLowerCase().includes(searchPipelineName?.toLowerCase()) &&
        lead.phone?.toLowerCase().includes(searchPhoneNumber?.toLowerCase()) &&
        (lead.companyName?.toLowerCase() || '').includes(searchCompanyName.toLowerCase())
    );

    // Pagination for the filtered leads
    const totalLeads = filteredLeads.length;
    const indexOfLastLead = currentPage * leadsPerPage;
    const indexOfFirstLead = indexOfLastLead - leadsPerPage;
    const currentLeads = filteredLeads.slice(indexOfFirstLead, indexOfLastLead);
    const totalPages = Math.ceil(totalLeads / leadsPerPage);

    // Handle page change
    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    // Reset pagination when search terms, branch, or product changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchClientName, searchPhoneNumber, searchCompanyName, searchPipelineName, selectedBranch, selectedProduct]);

    // Reset pipeline selection when product changes
    useEffect(() => {
        setSearchPipelineName('');
    }, [selectedProduct]);

    // Calculate page range to show in pagination
    const startPage = Math.max(1, currentPage - Math.floor(pagesToShow / 2));
    const endPage = Math.min(totalPages, startPage + pagesToShow - 1);
    const pages = Array.from({ length: endPage - startPage + 1 }, (_, index) => startPage + index);

    const handleShowReason = (reason) => {
        setSelectedRejectReason(reason);
        setRejectedLeadReason(true);
    };

    // Get RTL state from localStorage on initial load
    useEffect(() => {
        const savedRtl = localStorage.getItem('rtl');
        setRtl(savedRtl);
    }, [token]);

    // Choose language based on RTL setting
    const translations = {
        en: {
            rejectedLeads: "Rejected Leads",
            clientName: "Client Name",
            companyName: "Company Name",
            phone: "Phone",
            pipelineName: "Pipeline Name",
            productStage: "Product Stage",
            branchName: "Branch Name",
            action: "Action",
            all: "All",
            noPipelineAvailable: "No Pipeline Available",
            selectPipeline: "Select Pipeline",
            searchByClientName: "Search by Client Name",
            searchByCompanyName: "Search by Company Name",
            searchByPhoneNumber: "Search by Phone Number",
        },
        ar: {
            rejectedLeads: "العملاء المرفوضون",
            clientName: "اسم العميل",
            companyName: "اسم الشركة",
            phone: "الهاتف",
            pipelineName: "اسم الأنابيب",
            productStage: "مرحلة المنتج",
            branchName: "اسم الفرع",
            action: "إجراء",
            all: "الكل",
            noPipelineAvailable: "لا توجد خطوط أنابيب متاحة",
            selectPipeline: "اختر الأنبوب",
            searchByClientName: "البحث حسب اسم العميل",
            searchByCompanyName: "البحث حسب اسم الشركة",
            searchByPhoneNumber: "البحث حسب رقم الهاتف",
        }
    };
    const language = rtl === 'true' ? translations.ar : translations.en;
    return (
        <div>
            <Container fluid style={{ direction: rtl === 'true' ? 'rtl' : 'ltr' }}>
                <Row>
                    <Col xs={12} md={12} lg={2}>
                        {/* <Sidebar /> */}
                    </Col>

                    <Col xs={12} md={12} lg={10}>
                        <Card className='leads_main_cards mt-3' style={{ padding: '0px 20px 10px 20px' }}  >
                            <div style={{ position: 'relative' }} >
                                <h2 className="text-center mutual_heading_class mt-3">
                                    {language.rejectedLeads} ({rejectedLeads.length} {rejectedLeads.length === 1 ? 'Lead' : 'Leads'})
                                </h2>
                                <Image src={rejected_image} alt='Rejected Image' style={{ width: '120px', height: '120px', borderRadius: '50%', position: 'absolute', [rtl === 'true' ? 'left' : 'right']: '0px', top: 0 }} />
                            </div>

                            {/* Branch and Product Filter Buttons */}
                            <div className="filter-buttons" style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                                <Button
                                    variant="outline-primary"
                                    onClick={() => {
                                        setSelectedBranch('All');
                                        setSelectedProduct('All');
                                    }}
                                    active={selectedBranch === 'All' && selectedProduct === 'All'}
                                    style={{
                                        backgroundColor: selectedBranch === 'All' && selectedProduct === 'All' ? '#d7aa47' : '#6c757da2',
                                        color: 'white',
                                        border: 'none',
                                    }}
                                >
                                    {language.all}
                                </Button>
                                {branchNames.map((branch) => (
                                    <Button
                                        key={branch._id}
                                        variant="outline-primary"
                                        onClick={() => setSelectedBranch(branch.name)}
                                        active={selectedBranch === branch.name}
                                        style={{
                                            backgroundColor: selectedBranch === branch.name ? '#d7aa47' : '#6c757da2',
                                            color: 'white',
                                            border: 'none',
                                        }}
                                    >
                                        {branch.name}
                                    </Button>
                                ))}
                            </div>
                            {!product && (
                                <div style={{ display: 'flex', gap: '5px' }} className='mt-3' >
                                    {productNames.map((product) => (
                                        <Button
                                            key={product._id}
                                            variant="outline-primary"
                                            onClick={() => setSelectedProduct(product.name)}
                                            active={selectedProduct === product.name}
                                            style={{
                                                backgroundColor: selectedProduct === product.name ? '#d7aa47' : '#6c757da2',
                                                color: 'white',
                                                border: 'none',
                                            }}
                                        >
                                            {product.name}
                                        </Button>
                                    ))}
                                </div>
                            )}

                            {/* Search Form */}
                            <Form className="my-3">
                                <Row>
                                    <Col md={3}>
                                        <Form.Group controlId="searchClientName">
                                            <Form.Control
                                                type="text"
                                                placeholder={language.searchByClientName}
                                                value={searchClientName}
                                                onChange={e => setSearchClientName(e.target.value)}
                                                className='input_field_input_field'
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={3}>
                                        <Form.Group controlId="searchCompanyName">
                                            <Form.Control
                                                type="text"
                                                placeholder={language.searchByCompanyName}
                                                value={searchCompanyName}
                                                onChange={e => setSearchCompanyName(e.target.value)}
                                                className='input_field_input_field'
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={3}>
                                        <Form.Group controlId="searchClientPhone">
                                            <Form.Control
                                                type="text"
                                                placeholder={language.searchByPhoneNumber}
                                                value={searchPhoneNumber}
                                                onChange={e => setSearchPhoneNumber(e.target.value)}
                                                className='input_field_input_field'
                                            />
                                        </Form.Group>
                                    </Col>
                                    {!product && !branch && (
                                        <Col md={3}>
                                            <Form.Group controlId="searchPipelineName">
                                                <Form.Select
                                                    value={searchPipelineName}
                                                    onChange={e => setSearchPipelineName(e.target.value)}
                                                    disabled={selectedBranch === 'Ajman'} // Disable if "Ajman" is selected
                                                    className='input_field_input_field'
                                                >
                                                    <option value="">Select Pipeline</option>
                                                    {(selectedProduct !== 'All' && productPipelineMap[selectedProduct]) ? (
                                                        productPipelineMap[selectedProduct].map(pipeline => (
                                                            <option key={pipeline} value={pipeline}>{pipeline}</option>
                                                        ))
                                                    ) : (
                                                        <option value="">No Pipeline Available</option>
                                                    )}
                                                </Form.Select>
                                            </Form.Group>
                                        </Col>
                                    )}
                                </Row>
                            </Form>

                            {/* Leads Table */}
                            <Table striped bordered hover responsive className='mt-1 table_main_container' size='md' variant='dark'>
                                <thead style={{ backgroundColor: '#d7aa47' }}>
                                    <tr className="teble_tr_class" style={{
                                        backgroundColor: '#d7aa47',
                                        color: '#343a40',
                                        border: '1px solid #d7aa47',
                                        transition: 'background-color 0.3s ease',
                                    }}
                                    >
                                        <th style={{ backgroundColor: '#d7aa47', color: "white", textAlign: 'center' }}>{language.clientName}</th>
                                        <th style={{ backgroundColor: '#d7aa47', color: "white", textAlign: 'center' }}>{language.companyName}</th>
                                        <th style={{ backgroundColor: '#d7aa47', color: "white", textAlign: 'center' }}>{language.phone}</th>
                                        <th style={{ backgroundColor: '#d7aa47', color: "white", textAlign: 'center' }}>{language.pipelineName}</th>
                                        <th style={{ backgroundColor: '#d7aa47', color: "white", textAlign: 'center' }}>{language.productStage}</th>
                                        <th style={{ backgroundColor: '#d7aa47', color: "white", textAlign: 'center' }}>{language.branchName}</th>
                                        <th style={{ backgroundColor: '#d7aa47', color: "white", textAlign: 'center' }}>{language.action}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentLeads.length > 0 ? (
                                        currentLeads.map((lead) => (
                                            <tr key={lead.id} className='table_td_class'>
                                                <td className="cell-width table_td_class">
                                                    <div className="name-container">
                                                        {lead.clientName
                                                            ? lead.clientName.split(' ').slice(0, 2).join(' ') +
                                                            (lead.clientName.split(' ').length > 2 ? '...' : '')
                                                            : 'N/A'}
                                                        {lead.clientName && (
                                                            <span className="tooltip">{lead.clientName}</span>
                                                        )}
                                                    </div>
                                                </td>

                                                <td className="cell-width table_td_class">
                                                    <div className="name-container">
                                                        {lead.companyName
                                                            ? lead.companyName.split(' ').slice(0, 2).join(' ') +
                                                            (lead.companyName.split(' ').length > 2 ? '...' : '')
                                                            : 'N/A'}
                                                        {lead.companyName && (
                                                            <span className="tooltip">{lead.companyName}</span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td
                                                    className="cell-width table_td_class"
                                                    style={{ direction: rtl === 'true' ? 'ltr' : 'ltr' }}  // Always keep phone in left-to-right
                                                >
                                                    {lead.phone}
                                                </td>
                                                {/* <td className="cell-width table_td_class">{lead.productName}</td> */}
                                                <td className="cell-width table_td_class">{lead.pipelineName}</td>
                                                <td className="cell-width table_td_class">{lead.productStage}</td>
                                                <td className="cell-width table_td_class">{lead.branchName}</td>
                                                <td className="cell-width table_td_class">
                                                    <Link to={`/single-leads/${lead.id}`} >
                                                        <GrView style={{ color: '#ffa000', fontSize: '20px', cursor: 'pointer' }} />
                                                    </Link>
                                                    <FcCancel className="mx-2" onClick={() => handleShowReason(lead.reason)} style={{ cursor: 'pointer', color: 'red', fontSize: '20px', }} />
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="6" className="text-center table_td_class">No leads found</td>
                                        </tr>
                                    )}
                                </tbody>
                            </Table>

                            {/* Pagination */}
                            <div style={{ display: 'flex', justifyContent: 'center' }}>
                                <Pagination className='custom-pagination' >
                                    <Pagination.First onClick={() => handlePageChange(1)} disabled={currentPage === 1} />
                                    <Pagination.Prev onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} />
                                    {pages.map(page => (
                                        <Pagination.Item key={page} active={page === currentPage} onClick={() => handlePageChange(page)}>
                                            {page}
                                        </Pagination.Item>
                                    ))}
                                    <Pagination.Next onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} />
                                    <Pagination.Last onClick={() => handlePageChange(totalPages)} disabled={currentPage === totalPages} />
                                </Pagination>
                            </div>

                            {/* Modal for rejected lead reason */}
                            <Modal
                                show={rejectedLeadReason}
                                onHide={() => setRejectedLeadReason(false)}
                                size="md"
                                centered
                            >
                                <Modal.Header
                                    closeButton
                                    style={{
                                        border: 'none',
                                        textAlign: rtl === 'true' ? 'right' : 'left',
                                        direction: rtl === 'true' ? 'rtl' : 'ltr',
                                    }}
                                >
                                    <Modal.Title className="mutual_class_color">
                                        {rtl === 'true' ? 'سبب رفض العميل' : 'Rejected Lead Reason'}
                                    </Modal.Title>
                                </Modal.Header>

                                <Modal.Body
                                    style={{
                                        textAlign: rtl === 'true' ? 'right' : 'left',
                                        direction: rtl === 'true' ? 'rtl' : 'ltr',
                                    }}
                                >
                                    <span className='mutual_class_color'>{selectedRejectReason ? selectedRejectReason : (rtl === 'true' ? "لا يوجد سبب" : "No Reason Available!")}</span>
                                </Modal.Body>

                                <Modal.Footer
                                    style={{
                                        border: 'none',
                                        textAlign: rtl === 'true' ? 'right' : 'left',
                                        direction: rtl === 'true' ? 'rtl' : 'ltr',
                                    }}
                                >
                                    <Button className="all_close_btn_container" onClick={() => setRejectedLeadReason(false)}>
                                        {rtl === 'true' ? 'إغلاق' : 'Close'}
                                    </Button>
                                </Modal.Footer>
                            </Modal>

                        </Card>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default RejectedLeads;
