import React, { useState, useEffect } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import { useSelector } from 'react-redux';
import axios from 'axios';

const MoveLeads = ({ setMoveLeadModal, moveLeadModal, leadId, fetchLeadsData, fetchSingleLead, rtl }) => {
    const [pipeline, setPipeline] = useState('');
    const [branch, setBranch] = useState('');
    const [selectedProduct, setSelectedProduct] = useState('');
    const [selectedProductStage, setSelectedProductStage] = useState('');
    const [pipelines, setPipelines] = useState([]);
    const [filteredPipelines, setFilteredPipelines] = useState([]);
    const [productStages, setProductStages] = useState([]);
    const [initialValues, setInitialValues] = useState({ pipeline: '', branch: '', productStage: '' });
    const branchesSlice = useSelector(state => state.loginSlice.branches || []);
    const token = useSelector(state => state.loginSlice.user?.token);

    const productPipelineMap = {
        'Business Banking': ['Business Banking'],
        'Personal Loan': ['EIB Bank', 'Personal Loan'],
        'Mortgage Loan': ['Mortgage', 'CEO Mortgage'],
    };

    // Fetch pipelines on component mount
    useEffect(() => {
        const fetchPipelines = async () => {
            try {
                const response = await axios.get(`/api/pipelines/get-pipelines`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setPipelines(response.data);
            } catch (error) {
                console.error('Error fetching pipelines:', error);
            }
        };
        fetchPipelines();
    }, [token]);

    // Fetch lead data when modal opens
    useEffect(() => {
        if (moveLeadModal) {
            const fetchLeadData = async () => {
                try {
                    const response = await axios.get(`/api/leads/single-lead/${leadId}`, {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    });
                    const leadData = response.data;

                    // Set initial values based on lead data
                    const initialPipeline = leadData.pipeline_id?._id || '';
                    const initialBranch = leadData.branch?._id || '';
                    const initialProductStage = leadData.product_stage?._id || '';

                    setInitialValues({ pipeline: initialPipeline, branch: initialBranch, productStage: initialProductStage });
                    setSelectedProduct(leadData.products?._id || '');
                    setBranch(initialBranch);
                    setPipeline(initialPipeline);
                    setSelectedProductStage(initialProductStage); // Set the product stage correctly

                    // Filter pipelines based on the selected product
                    const productName = leadData.products?.name;
                    if (productName) {
                        const filtered = productPipelineMap[productName] || [];
                        setFilteredPipelines(pipelines.filter(pipeline => filtered.includes(pipeline.name)));
                    }
                } catch (error) {
                    console.error('Error fetching lead data:', error);
                }
            };
            fetchLeadData();
        }
    }, [moveLeadModal, leadId, token, pipelines]);

    // Fetch product stages based on selected pipeline
    useEffect(() => {
        const fetchProductStages = async () => {
            if (pipeline) {
                try {
                    const response = await axios.get(`/api/productstages/${selectedProduct}`, {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    });
                    setProductStages(response.data);

                    // Reset selected product stage if it doesn't match the fetched stages
                    const matchingStage = response.data.find(stage => stage._id === initialValues.productStage);
                    setSelectedProductStage(matchingStage ? matchingStage._id : ''); // Set the matching product stage or reset
                } catch (error) {
                    console.error('Error fetching product stages:', error);
                }
            } else {
                setProductStages([]); // Clear product stages if no pipeline is selected
                setSelectedProductStage(''); // Reset selected product stage
            }
        };
        fetchProductStages();
    }, [pipeline, token, initialValues.productStage]);

    const handlePipelineChange = (e) => {
        setPipeline(e.target.value);
        setSelectedProductStage(''); // Reset selected stage when pipeline changes
    };

    const handleBranchChange = (e) => {
        const selectedBranch = e.target.value;
        setBranch(selectedBranch);

        if (selectedBranch === '673b34924b966621c041caac') {
            // If Ajman Branch is selected, show only the Ajman pipeline
            const ajmanPipeline = pipelines.find(pipeline => pipeline._id === '673b190186706b218f6f3262');
            setFilteredPipelines(ajmanPipeline ? [ajmanPipeline] : []);
            setPipeline(ajmanPipeline ? ajmanPipeline._id : ''); // Set pipeline if available
        } else {
            // For other branches, revert to previous logic
            const productName = selectedProduct ? 'Business Banking' : ''; // Adjust according to your logic
            const filtered = productPipelineMap[productName] || [];
            setFilteredPipelines(pipelines.filter(pipeline => filtered.includes(pipeline.name)));

            // Reset pipeline if it's no longer valid
            setPipeline(initialValues.pipeline); // Reset to the initial value if the selected product is not valid anymore
        }
    };

    const handleProductStageChange = (e) => {
        setSelectedProductStage(e.target.value); // Set selected product stage
    };

    const getProductID = localStorage.getItem('selectedProductId');
    const getBranchID = localStorage.getItem('selectedBranchId');

    const moveLeadsHandler = async () => {
        try {
            await axios.put(
                `/api/leads/move-lead/${leadId}`,
                {
                    pipeline,
                    branch,
                    product_stage: selectedProductStage,
                    product: selectedProduct
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            fetchLeadsData(getProductID, getBranchID);
            setMoveLeadModal(false);
            fetchSingleLead();
        } catch (error) {
            console.error('Error moving leads:', error);
        }
    };

    const resetToInitialValues = () => {
        setBranch(initialValues.branch);
        setPipeline(initialValues.pipeline);
        setSelectedProductStage(initialValues.productStage);
    };

    return (
        <div>
            <Modal
                show={moveLeadModal}
                onHide={() => {
                    resetToInitialValues();
                    setMoveLeadModal(false);
                }}
                size="lg"
                aria-labelledby="contained-modal-title-vcenter"
                centered
            >
                <Modal.Body style={{
                    padding: '30px',
                    textAlign: rtl === 'true' ? 'right' : 'left', // Align text dynamically
                    direction: rtl === 'true' ? 'rtl' : 'ltr' // Set text direction dynamically
                }}>
                    <h4
                        className="mutual_heading_class"
                        style={{ textAlign: rtl === 'true' ? 'center' : 'center' }} // Align text dynamically
                    >
                        {rtl === 'true' ? 'نقل العملاء' : 'Move Leads'}
                    </h4>
                    <Form>
                        <Form.Label className="mutual_heading_class">
                            {rtl === 'true' ? 'فرع' : 'Branch'}
                        </Form.Label>
                        <Form.Select
                            aria-label="Select Branch"
                            name="branch"
                            value={branch}
                            onChange={handleBranchChange}
                            className='input_field_input_field'
                            disabled
                        >
                            <option value="">Select Branch</option>
                            {branchesSlice.map(branch => (
                                <option key={branch._id} value={branch._id}>
                                    {branch.name}
                                </option>
                            ))}
                        </Form.Select>

                        {branch === '673b34924b966621c041caac' && (
                            <>
                                <Form.Label className="mutual_heading_class">
                                    {rtl === 'true' ? 'خط الأنابيب' : 'Pipeline'}
                                </Form.Label>
                                <Form.Select
                                    aria-label="Select Pipeline"
                                    name="pipeline"
                                    value={pipeline}
                                    onChange={handlePipelineChange}
                                    className='input_field_input_field'
                                >
                                    <option value="">Select Pipeline</option>
                                    {filteredPipelines.map(pipeline => (
                                        <option key={pipeline._id} value={pipeline._id}>
                                            {pipeline.name}
                                        </option>
                                    ))}
                                </Form.Select>
                            </>
                        )}

                        {branch !== '673b34924b966621c041caac' && (
                            <>
                                <Form.Label className="mutual_heading_class">
                                    {rtl === 'true' ? 'خط الأنابيب' : 'Pipeline'}
                                </Form.Label>
                                <Form.Select
                                    aria-label="Select Pipeline"
                                    name="pipeline"
                                    value={pipeline}
                                    onChange={handlePipelineChange}
                                    className='input_field_input_field'
                                >
                                    <option value="">Select Pipeline</option>
                                    {filteredPipelines.map(pipeline => (
                                        <option key={pipeline._id} value={pipeline._id}>
                                            {pipeline.name}
                                        </option>
                                    ))}
                                </Form.Select>
                            </>
                        )}

                        <Form.Label className="mutual_heading_class">
                            {rtl === 'true' ? 'مرحلة المنتج' : 'Product Stage'}
                        </Form.Label>
                        <Form.Select
                            aria-label="Select Product Stage"
                            name="productStage"
                            value={selectedProductStage}
                            onChange={handleProductStageChange}
                            className='input_field_input_field'
                        >
                            <option value="" disabled={!productStages.length}>Select Product Stage</option>
                            {productStages.map(stage => (
                                <option key={stage._id} value={stage._id}>
                                    {stage.name}
                                </option>
                            ))}
                        </Form.Select>
                    </Form>
                </Modal.Body>
                <Modal.Footer style={{ border: 'none', direction: rtl === 'true' ? 'rtl' : 'ltr', }} >
                    <Button className='all_close_btn_container' onClick={() => {
                        resetToInitialValues();
                        setMoveLeadModal(false);
                    }}>
                        {rtl === 'true' ? 'إغلاق' : 'Close'}
                    </Button>
                    <Button
                        className='all_common_btn_single_lead'
                        disabled={!pipeline || !branch || !selectedProductStage}
                        onClick={moveLeadsHandler}
                    >
                        {rtl === 'true' ? 'نقل العملاء المحتملين' : 'Move Leads'}
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default MoveLeads;
