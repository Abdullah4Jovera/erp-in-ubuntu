import React, { useState, useEffect } from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { Row, Col } from 'react-bootstrap'; // Importing Row and Col from react-bootstrap
import InputMask from "react-input-mask";

const EditLead = ({ modalShow, setModalShow, leadId, fetchLeadsData, fetchSingleLead, rtl }) => {
    const [leadData, setLeadData] = useState({
        clientPhone: '',
        clientName: '',
        clientEmail: '',
        cliente_id: '',
        description: '',
        company_Name: '',
        lead_type: {},
        pipeline_id: {},
        products: {},
        branch: {},
        product_stage: {},
        source: {},
    });
    const [sources, setSources] = useState([]);
    const [productStages, setProductStages] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState('');
    const [selectedUsers, setSelectedUsers] = useState([]);
    const productsName = useSelector(state => state.loginSlice.productNames);
    const leadTypeSlice = useSelector(state => state.loginSlice.leadType);
    const token = useSelector((state) => state.loginSlice.user?.token);
    const branchesSlice = useSelector(state => state.loginSlice.branches || []);
    const pipelineSlice = useSelector(state => state.loginSlice.pipelines);

    // Fetching lead data when the modal opens
    useEffect(() => {
        const fetchLeadData = async () => {
            try {
                const response = await axios.get(`/api/leads/single-lead/${leadId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                const client = response.data.client || {};
                setLeadData({
                    clientPhone: client.phone || '',
                    clientName: client.name || '',
                    clientEmail: client.email || '',
                    cliente_id: client.e_id,
                    description: response.data.description || '',
                    company_Name: response.data.company_Name,
                    lead_type: response.data.lead_type || {},
                    pipeline_id: response.data.pipeline_id || {},
                    products: response.data.products || {},
                    branch: response.data.branch || {},
                    product_stage: response.data.product_stage || {},
                    source: response.data.source || {},
                });

                setSelectedProduct(response.data.products?._id || '');
            } catch (error) {
                console.log(error, 'Error fetching lead data');
            }
        };

        if (modalShow) {
            fetchLeadData();
        }
    }, [modalShow, leadId, token]);

    // Fetching sources based on the selected lead type
    useEffect(() => {
        const fetchSources = async () => {
            if (leadData.lead_type?._id) {
                try {
                    const response = await axios.get(`/api/sources/${leadData.lead_type._id}`, {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    });
                    setSources(response.data);
                } catch (error) {
                    console.log(error, 'Failed to fetch sources');
                }
            } else {
                setSources([]);
            }
        };

        fetchSources();
    }, [leadData.lead_type, token]);

    // Fetching product stages based on the selected product
    useEffect(() => {
        const fetchProductStages = async () => {
            if (selectedProduct) {
                try {
                    const response = await axios.get(`/api/productstages/${selectedProduct}`, {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    });
                    setProductStages(response.data);
                } catch (error) {
                    console.log(error, 'Error fetching product stages');
                }
            } else {
                setProductStages([]);
            }
        };

        fetchProductStages();
    }, [selectedProduct, token]);

    // Handling changes to input fields
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setLeadData((prevData) => ({ ...prevData, [name]: value }));
    };

    // Handling branch selection
    const handleBranchChange = (e) => {
        const selectedBranchId = e.target.value;
        const selectedBranch = branchesSlice.find((branch) => branch._id === selectedBranchId);
        setLeadData((prevData) => ({
            ...prevData,
            branch: selectedBranch ? { _id: selectedBranch._id, name: selectedBranch.name } : {},
        }));
    };

    // Handling product selection
    const handleProductChange = (e) => {
        const selectedProductId = e.target.value;
        setSelectedProduct(selectedProductId);
        setLeadData((prevData) => ({
            ...prevData,
            products: productsName.find((product) => product._id === selectedProductId) || {},
        }));
    };

    // Handling lead type selection
    const handleLeadTypeChange = (e) => {
        const selectedLeadTypeId = e.target.value;
        const selectedLeadType = leadTypeSlice.find((leadType) => leadType._id === selectedLeadTypeId);
        setLeadData((prevData) => ({
            ...prevData,
            lead_type: selectedLeadType || {},
        }));
    };

    // Handling pipeline selection
    const handlePipelineChange = (e) => {
        const selectedPipelineId = e.target.value;
        const selectedPipeline = pipelineSlice.find((pipeline) => pipeline._id === selectedPipelineId);
        setLeadData((prevData) => ({
            ...prevData,
            pipeline_id: selectedPipeline || {},
        }));
    };

    // Handling source selection
    const handleSourceChange = (e) => {
        const selectedSourceId = e.target.value;
        const selectedSource = sources.find((source) => source._id === selectedSourceId);
        setLeadData((prevData) => ({
            ...prevData,
            source: selectedSource || {},
        }));
    };

    // Handling product stage selection
    const handleProductStagesChange = (e) => {
        const selectedProductStageId = e.target.value;
        const selectedProductStage = productStages.find((stage) => stage._id === selectedProductStageId);
        setLeadData((prevData) => ({
            ...prevData,
            product_stage: selectedProductStage || {},
        }));
    };
    const getProductID = localStorage.getItem('selectedProductId')
    const getBranchID = localStorage.getItem('selectedBranchId')
    // Saving changes to the lead
    const handleSaveChanges = async () => {
        const payload = {
            clientPhone: leadData.clientPhone,
            clientName: leadData.clientName,
            clientEmail: leadData.clientEmail,
            company_Name: leadData.company_Name,
            cliente_id: leadData.cliente_id,
            description: leadData.description || '',
            product_stage: leadData.product_stage?._id || '',
            lead_type: leadData.lead_type?._id || '',
            pipeline: leadData.pipeline_id?._id || '',
            products: leadData.products?._id || '',
            source: leadData.source?._id || '',
            branch: leadData.branch?._id || '',
            selected_users: selectedUsers || [],
        };

        try {
            await axios.put(`/api/leads/edit-lead/${leadId}`, payload, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setModalShow(false);
            fetchLeadsData(getProductID, getBranchID);
            fetchSingleLead();
        } catch (error) {
            console.log(error, 'Error saving lead data');
        }
    };

    return (
        <Modal
            size="xl"
            aria-labelledby="contained-modal-title-vcenter"
            centered
            show={modalShow}
            onHide={() => setModalShow(false)}

        >
            <Modal.Body
                style={{
                    padding: '40px',
                    textAlign: rtl === 'true' ? 'right' : 'left', // Align text dynamically
                    direction: rtl === 'true' ? 'rtl' : 'ltr' // Set text direction dynamically
                }}
            >
                <h4
                    className="text-center mb-3 mutual_heading_class"
                    style={{ textAlign: rtl === 'true' ? 'right' : 'center' }} // Center or align to right for RTL
                >
                    {rtl === 'true' ? 'تعديل العميل' : 'Edit Lead'}
                </h4>
                <Form>
                    <Row>
                        {/* Client Name */}
                        <Col md={6} className="mb-3">
                            <Form.Group controlId="clientName">
                                <Form.Label className="mutual_heading_class">
                                    {rtl === 'true' ? 'اسم العميل' : 'Client Name'}
                                </Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder={rtl === 'true' ? 'ادخل الاسم' : 'Enter Name'}
                                    name="clientName"
                                    value={leadData.clientName}
                                    onChange={handleInputChange}
                                    className="input_field_input_field"
                                />
                            </Form.Group>
                        </Col>

                        {/* Client Email */}
                        <Col md={6} className="mb-3">
                            <Form.Group controlId="clientEmail">
                                <Form.Label className="mutual_heading_class">
                                    {rtl === 'true' ? 'البريد الإلكتروني للعميل' : 'Client Email'}
                                </Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder={rtl === 'true' ? 'ادخل البريد الإلكتروني' : 'Enter Email'}
                                    name="clientEmail"
                                    value={leadData.clientEmail}
                                    onChange={handleInputChange}
                                    className="input_field_input_field"
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    <Row>
                        {/* Emirates ID */}
                        <Col md={6} className="mb-3">
                            <Form.Group controlId="cliente_id">
                                <Form.Label className="mutual_heading_class">
                                    {rtl === 'true' ? 'الهوية الإماراتية' : 'Emirates ID'}
                                </Form.Label>
                                <InputMask
                                    mask="999-9999-9999999-9"
                                    value={leadData.cliente_id}
                                    onChange={handleInputChange}
                                    name="cliente_id"
                                    className="input_field_input_field"
                                >
                                    {(inputProps) => (
                                        <Form.Control
                                            {...inputProps}
                                            type="text"
                                            placeholder={rtl === 'true' ? '784-1234-1234567-1' : '784-1234-1234567-1'}
                                            name="cliente_id"
                                        />
                                    )}
                                </InputMask>
                            </Form.Group>
                        </Col>

                        {/* Company Name */}
                        <Col md={6} className="mb-3">
                            <Form.Group controlId="company_Name">
                                <Form.Label className="mutual_heading_class">
                                    {rtl === 'true' ? 'اسم الشركة' : 'Company Name'}
                                </Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder={rtl === 'true' ? 'ادخل اسم الشركة' : 'Enter Name'}
                                    name="company_Name"
                                    value={leadData.company_Name}
                                    onChange={handleInputChange}
                                    className="input_field_input_field"
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    <Row>
                        {/* Lead Details */}
                        <Col md={6} className="mb-3">
                            <Form.Group controlId="description">
                                <Form.Label className="mutual_heading_class">
                                    {rtl === 'true' ? 'تفاصيل العميل' : 'Lead Details'}
                                </Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={10}
                                    placeholder={rtl === 'true' ? 'ادخل الوصف' : 'Enter Description'}
                                    name="description"
                                    value={leadData.description}
                                    onChange={handleInputChange}
                                    className="input_field_input_field"
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    <div
                        style={{
                            display: 'flex',
                            justifyContent: rtl === 'true' ? 'flex-start' : 'flex-end', // Align left if RTL is true
                            alignItems: 'center', // Align buttons vertically at the center
                            gap: '10px',
                            flexDirection: rtl === 'true' ? 'row-reverse' : 'row' // Reverse the order of buttons in RTL
                        }}
                    >
                        <Button
                            className="all_close_btn_container"
                            onClick={() => setModalShow(false)}
                        >
                            {rtl === 'true' ? 'إغلاق' : 'Close'}
                        </Button>
                        <Button
                            className="all_common_btn_single_lead"
                            onClick={handleSaveChanges}
                        >
                            {rtl === 'true' ? 'تحديث العميل' : 'Update Lead'}
                        </Button>
                    </div>
                </Form>
            </Modal.Body>

        </Modal>
    );
};

export default EditLead;
