import React, { useState, useEffect } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const TransferLeads = ({ fetchLeadsData, leadId, transferModal, setTransferModal, fetchSingleLead, rtl }) => {
    const [pipelineId, setPipelineId] = useState('');
    const [branch, setBranch] = useState('');
    const [selectedProduct, setSelectedProduct] = useState('');
    const [selectedProductStage, setSelectedProductStage] = useState('');
    const [productStage, setProductStage] = useState([]);
    const [filteredPipelines, setFilteredPipelines] = useState([]);
    const [productStageName, setProductStageName] = useState('');
    const [isDisabled, setIsDisabled] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const pipelines = useSelector(state => state.loginSlice.pipelines);
    const branches = useSelector(state => state.loginSlice.branches || []);
    const products = useSelector(state => state.loginSlice.productNames);
    const token = useSelector(state => state.loginSlice.user?.token);

    const productPipelineMap = {
        'Business Banking': ['Business Banking'],
        'Personal Loan': ['EIB Bank', 'Personal Loan'],
        'Mortgage Loan': ['Mortgage', 'CEO Mortgage'],
    };

    useEffect(() => {
        const fetchLeadData = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/leads/single-lead/${leadId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const leadData = response.data;
                setSelectedProduct(leadData.products?._id || '');
                setPipelineId(leadData.pipeline_id?._id || '');
                setProductStageName(leadData.product_stage?._id || '');
                setBranch(leadData.branch?._id || '');
                setSelectedProductStage(leadData.product_stage?._id || '');
            } catch (error) {
                console.error('Error fetching lead data:', error);
            }
        };
        if (leadId) {
            fetchLeadData();
        }
    }, [leadId, token]);

    useEffect(() => {
        if (selectedProduct) {
            const productName = products.find(product => product._id === selectedProduct)?.name;
            if (productName && productPipelineMap[productName]) {
                setFilteredPipelines(pipelines.filter(pipeline => productPipelineMap[productName].includes(pipeline.name)));
            } else {
                setFilteredPipelines([]);
            }
        } else {
            setFilteredPipelines(pipelines);
        }
    }, [selectedProduct, pipelines, products]);

    useEffect(() => {
        const fetchProductStages = async () => {
            if (selectedProduct && pipelineId) {
                try {
                    const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/productstages/${selectedProduct}`, {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    setProductStage(response.data);
                } catch (error) {
                    console.error('Error fetching product stages:', error);
                }
            } else {
                setProductStage([]);
            }
        };
        fetchProductStages();
    }, [selectedProduct, pipelineId, token]);

    const handlePipelineChange = (e) => {
        setPipelineId(e.target.value);
    };

    const handleBranchChange = (e) => {
        const selectedBranchId = e.target.value;
        setBranch(selectedBranchId);

        // Check if the selected branch is the specified one
        if (selectedBranchId === '673b34924b966621c041caac') {
            setFilteredPipelines([{ _id: '673b190186706b218f6f3262', name: 'Ajman Branch' }]);
            setPipelineId('673b190186706b218f6f3262'); // Set pipeline to Ajman Branch
            setIsDisabled(false); // Enable other selections
        } else {
            setIsDisabled(false); // Enable other selections
            // Reset pipeline selection
            setPipelineId('');
            // Keep the existing logic for other branches
            const productName = products.find(product => product._id === selectedProduct)?.name;
            if (productName && productPipelineMap[productName]) {
                setFilteredPipelines(pipelines.filter(pipeline => productPipelineMap[productName].includes(pipeline.name)));
            } else {
                setFilteredPipelines(pipelines);
            }
        }
    };

    const handleProductChange = (e) => {
        setSelectedProduct(e.target.value);
        setSelectedProductStage('');
        setPipelineId('');
        setIsDisabled(!e.target.value);
    };

    const handleProductStageChange = (e) => {
        setSelectedProductStage(e.target.value);
    };

    const getProductID = localStorage.getItem('selectedProductId');
    const getBranchID = localStorage.getItem('selectedBranchId');

    const transferLeads = async () => {
        if (!pipelineId || !branch || !selectedProduct || !selectedProductStage) {
            alert('Please select all fields before transferring');
            return;
        }

        const payload = {
            pipeline: pipelineId,
            branch,
            product_stage: selectedProductStage,
            products: selectedProduct,
        };

        try {
            const response = await axios.put(
                `${process.env.REACT_APP_BASE_URL}/api/leads/transfer-lead/${leadId}`,
                payload,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            if (response.status === 200) {
                setTransferModal(false);
                fetchLeadsData(getProductID, getBranchID);
                fetchSingleLead();
            }
        } catch (error) {
            if (error.response && error.response.data && error.response.data.message) {
                setErrorMessage(error.response.data.message);
            } else {
                setSuccessMessage('Leads Transfer Successfully');
            }

            // Hide error message after 5 seconds
            setTimeout(() => {
                setErrorMessage('');
                setSuccessMessage('');
                setTransferModal(false)
            }, 500);
        }
    };

    return (
        <div>
            <Modal
                show={transferModal}
                onHide={() => setTransferModal(false)}
                size="lg"
                aria-labelledby="contained-modal-title-vcenter"
                centered

            >
                <Modal.Body 
                style={{
                    padding: '30px',
                    textAlign: rtl === 'true' ? 'right' : 'left', // Align text dynamically
                    direction: rtl === 'true' ? 'rtl' : 'ltr' // Set text direction dynamically
                }}
                >
                    <h4 className='mutual_heading_class' style={{ textAlign: 'center' }}> {rtl === 'true' ? 'تحويل العملاء المحتملين' : 'Transfer Leads'}</h4>
                    {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}
                    {successMessage && <div className="alert alert-success">{successMessage}</div>}
                    <Form>
                        <Form.Group controlId="product">
                            <Form.Label className='mutual_heading_class'>{rtl === 'true' ? 'منتج' : 'Product'}</Form.Label>
                            <Form.Select
                                aria-label="Select Product"
                                name="product"
                                value={selectedProduct}
                                onChange={handleProductChange}
                                className='input_field_input_field'
                            >
                                <option value="">Select Product</option>
                                {products.map(product => (
                                    <option key={product._id} value={product._id}>
                                        {product.name}
                                    </option>
                                ))}
                            </Form.Select>
                        </Form.Group>

                        <Form.Label className='mutual_heading_class'>  {rtl === 'true' ? 'فرع' : 'Branch'}</Form.Label>
                        <Form.Select
                            aria-label="Select Branch"
                            name="branch"
                            value={branch}
                            onChange={handleBranchChange}
                            disabled={isDisabled}
                            className='input_field_input_field'
                        >
                            <option value="">Select Branch</option>
                            {branches.map(branch => (
                                <option key={branch._id} value={branch._id}>
                                    {branch.name}
                                </option>
                            ))}
                        </Form.Select>

                        <Form.Label className='mutual_heading_class'>   {rtl === 'true' ? 'الخط الأنابيب' : 'Pipeline'}</Form.Label>
                        <Form.Select
                            aria-label="Select Pipeline"
                            name="pipeline"
                            value={pipelineId}
                            onChange={handlePipelineChange}
                            disabled={isDisabled}
                            className='input_field_input_field'
                        >
                            <option value="">Select Pipeline</option>
                            {filteredPipelines.map(pipeline => (
                                <option key={pipeline._id} value={pipeline._id}>
                                    {pipeline.name}
                                </option>
                            ))}
                        </Form.Select>

                        <Form.Group controlId="productStage">
                            <Form.Label className='mutual_heading_class'>  {rtl === 'true' ? 'مرحلة المنتج' : 'Product Stage'}</Form.Label>
                            <Form.Select
                                aria-label="Select Product Stage"
                                name="productStage"
                                value={selectedProductStage}
                                onChange={handleProductStageChange}
                                disabled={isDisabled}
                                className='input_field_input_field'
                            >
                                <option value="">Select Product Stage</option>
                                {productStage.map(stage => (
                                    <option key={stage._id} value={stage._id}>
                                        {stage.name}
                                    </option>
                                ))}
                            </Form.Select>
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer style={{ border: 'none', direction: rtl === 'true' ? 'rtl' : 'ltr', }}>
                    <Button className='all_close_btn_container' onClick={() => setTransferModal(false)}>
                        {rtl === 'true' ? 'إغلاق' : 'Close'}
                    </Button>
                    <Button className='all_common_btn_single_lead' onClick={transferLeads}>
                        {rtl === 'true' ? 'نقل' : 'Transfer'}
                    </Button>
                </Modal.Footer>
            </Modal>
            <ToastContainer />
        </div>
    );
};

export default TransferLeads;
