import React, { useEffect, useState } from 'react';
import Sidebar from '../Components/sidebar/Sidebar';
import { Container, Row, Col, Card, Spinner, Form, InputGroup, Button, Modal } from 'react-bootstrap';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import DatePicker from 'react-datepicker';
import { FaTimes } from 'react-icons/fa';
import "react-datepicker/dist/react-datepicker.css";
import '../Pages/style.css';
import '../Pages/ContractStyle.css';

const Contract = () => {
    const [contracts, setContracts] = useState([]);
    const [contractStages, setContractStages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPipeline, setSelectedPipeline] = useState('');
    const [selectedBranch, setSelectedBranch] = useState('');
    const [selectedProduct, setSelectedProduct] = useState('');
    const [totalCommission, setTotalCommission] = useState(0); // For the total commission (all time)
    const [totalContracts, setTotalContracts] = useState(0); // For the total number of contracts
    const [currentMonthContracts, setCurrentMonthContracts] = useState(0); // For the total contracts of the current month
    const [currentMonthCommission, setCurrentMonthCommission] = useState(0); // For the total commission of the current month
    const [startDate, setStartDate] = useState(null); // Start date for range
    const [endDate, setEndDate] = useState(null); // End date for range
    const token = useSelector((state) => state.loginSlice.user?.token);
    const allPipelines = useSelector((state) => state.loginSlice.pipelines);
    const allProducts = useSelector((state) => state.loginSlice.products);
    const allBranches = useSelector((state) => state.loginSlice.branches);
    const [stageModal, setStageModal] = useState(false)
    const [isHovered, setIsHovered] = useState(false);

    useEffect(() => {
        const fetchContracts = async () => {
            try {
                const response = await axios.get(`/api/contracts/get-all-contracts`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setContracts(response.data);
            } catch (err) {
                setError('Failed to fetch contracts');
                console.error(err);
            }
        };

        const fetchContractStages = async () => {
            try {
                const response = await axios.get(`/api/contract-stages/get-all-contract-stages`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setContractStages(response.data);
            } catch (err) {
                setError('Failed to fetch contract stages');
                console.error(err);
            }
        };

        const fetchData = async () => {
            setLoading(true);
            await Promise.all([fetchContracts(), fetchContractStages()]);
            setLoading(false);
        };

        fetchData();
    }, [token]);

    // Function to calculate the total commission (all time)
    const calculateTotalCommission = (filteredContracts) => {
        return filteredContracts.reduce((acc, contract) => {
            const commission = contract.service_commission_id?.without_vat_commission || 0;
            return acc + commission;
        }, 0);
    };

    // Function to calculate the total commission for the current month
    const calculateCurrentMonthCommission = (filteredContracts) => {
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();

        return filteredContracts.reduce((acc, contract) => {
            const contractDate = new Date(contract.created_at);
            if (contractDate.getMonth() === currentMonth && contractDate.getFullYear() === currentYear) {
                const commission = contract.service_commission_id?.without_vat_commission || 0;
                return acc + commission;
            }
            return acc;
        }, 0);
    };

    // Function to calculate the total number of contracts
    const calculateTotalContracts = (filteredContracts) => {
        return filteredContracts.length;
    };

    // Function to filter contracts based on selected filters
    const filterContracts = () => {
        return contracts.filter((contract) =>
            contract.client_id?.name?.toLowerCase().includes(searchTerm.toLowerCase()) &&
            (selectedPipeline ? contract.pipeline_id?.name === selectedPipeline : true) &&
            (selectedBranch ? contract.branch?.name === selectedBranch : true) &&
            (selectedProduct ? contract.products?.name === selectedProduct : true) &&
            (startDate && endDate ?
                new Date(contract.created_at) >= new Date(startDate) && new Date(contract.created_at) <= new Date(endDate) : true)
        );
    };

    // Function to get contracts for the current month
    const getCurrentMonthContracts = (filteredContracts) => {
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();

        return filteredContracts.filter(contract => {
            const contractDate = new Date(contract.created_at);
            return contractDate.getMonth() === currentMonth && contractDate.getFullYear() === currentYear;
        }).length;
    };

    // Recalculate totals whenever the filters change
    useEffect(() => {
        const filteredContracts = filterContracts();
        const totalComm = calculateTotalCommission(filteredContracts);
        const totalCount = calculateTotalContracts(filteredContracts);
        const currentMonthCount = getCurrentMonthContracts(filteredContracts);
        const currentMonthComm = calculateCurrentMonthCommission(filteredContracts);

        setTotalCommission(totalComm); // Update the total commission in state
        setTotalContracts(totalCount); // Update the total contracts in state
        setCurrentMonthContracts(currentMonthCount); // Update the current month's contract count
        setCurrentMonthCommission(currentMonthComm); // Update the current month's commission
    }, [selectedPipeline, selectedBranch, selectedProduct, contracts, searchTerm, startDate, endDate]); // Depend on selected filters

    const handleStageChange = async (contractId, newStageId, newStageName) => {
        try {
            await axios.put(`/api/contracts/update-stage/${contractId}`, { contract_stage: newStageId }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            // Show modal when moving to "Under Process" stage
            if (newStageName === 'Under Process') { // Check if the new stage name is "Under Process"
                setStageModal(true);
            }

            const updatedContracts = await axios.get(`/api/contracts/get-all-contracts`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setContracts(updatedContracts.data);
            setError(null);
        } catch (err) {
            setError('Failed to update contract stage');
            console.error(err);
        }
    };

    const groupedContracts = contractStages.reduce((acc, stage) => {
        acc[stage._id] = {
            name: stage.name,
            contracts: filterContracts().filter(contract => contract.contract_stage && contract.contract_stage._id === stage._id),
        };
        return acc;
    }, {});

    const onDragEnd = (result) => {
        const { source, destination, draggableId } = result;
        if (!destination || source.droppableId === destination.droppableId) return;

        // Checking if the drag is to "Under Process"
        const sourceStageId = source.droppableId;
        const destinationStageId = destination.droppableId;

        const destinationStage = contractStages.find(stage => stage._id === destinationStageId); // Find the destination stage by ID
        const destinationStageName = destinationStage ? destinationStage.name : null;

        if (destinationStageName === 'Under Process') { // Check if the destination is "Under Process"
            setStageModal(true); // Open the modal
        }

        // Proceed to handle the stage change
        handleStageChange(draggableId, destinationStageId, destinationStageName);
    }
    const handleClear = () => {
        setSelectedPipeline(null)
        setSearchTerm('')
        setEndDate(null)
        setStartDate(null)
    };
    const isSearchEnabled =
        searchTerm.trim() || selectedPipeline || (startDate && endDate);
    const data = [
        { title: "Total Contracts", value: totalContracts },
        { title: "Total Commission", value: `${Math.round(totalCommission, 2)} AED` },
        { title: "Current Month Contracts", value: currentMonthContracts },
        { title: "Current/M Commission", value: `${Math.round(currentMonthCommission, 2)} AED` },
    ];
    return (
        <div>
            <Container fluid>
                <Row>
                    <Col xs={12} md={12} lg={2}>
                        {/* <Sidebar /> */}
                    </Col>
                    <Col xs={12} md={12} lg={10}>
                        <Card className='leads_main_cards mt-3' style={{ padding: '5px 10px' }} >
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '5px' }} >
                                {/* Search by client name */}
                                <div className='w-100'>
                                    <Form.Control
                                        type="text"
                                        placeholder="Search by Client/Company Name"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className='input_field_input_field'
                                    />
                                </div>
                                {/* Pipeline Filter Dropdown */}
                                <div className='w-100'>
                                    <InputGroup className="my-3">
                                        <Form.Control
                                            as="select"
                                            value={selectedPipeline || ''}
                                            onChange={(e) => setSelectedPipeline(e.target.value)}
                                            placeholder="Select Pipeline"
                                            classNamePrefix="react-select"
                                            className='input_field_input_field'
                                        >
                                            <option value="">Select Pipeline</option>
                                            {allPipelines.map(pipeline => (
                                                <option key={pipeline._id} value={pipeline.name}>{pipeline.name}</option>
                                            ))}
                                        </Form.Control>

                                    </InputGroup>
                                </div>
                                {/* Date Range Picker */}
                                <div className='w-100' style={{ display: 'flex', gap: '5px' }}>
                                    <DatePicker
                                        selected={startDate}
                                        onChange={(date) => setStartDate(date)}
                                        startDate={startDate}
                                        endDate={endDate}
                                        selectsStart
                                        placeholderText="Start Date"
                                        className="form-control w-100 input_field_input_field"
                                    />
                                    <div>
                                        <DatePicker
                                            selected={endDate}
                                            onChange={(date) => setEndDate(date)}
                                            startDate={startDate}
                                            endDate={endDate}
                                            selectsEnd
                                            minDate={startDate}
                                            placeholderText="End Date"
                                            className="form-control w-100 input_field_input_field"
                                        />
                                    </div>
                                </div>
                                {/* Search Button */}
                                <div>
                                    <Button
                                        variant="primary"
                                        onClick={handleClear}
                                        disabled={!isSearchEnabled}
                                    >
                                        Clear
                                    </Button>
                                </div>
                            </div>

                            <Row>
                                {data.map((item, index) => (
                                    <Col key={index} sm={6} md={3}>
                                        <Card
                                            className={`ios-card ${isHovered ? 'hovered' : ''} mb-2`}
                                            onMouseEnter={() => setIsHovered(true)}
                                            onMouseLeave={() => setIsHovered(false)}
                                        >
                                            <Card.Body>
                                                <Card.Title className="card-title">
                                                    <p className='mb-0 text-center' >
                                                        {`${item.title} - ${item.value}`}
                                                    </p>
                                                </Card.Title>
                                            </Card.Body>
                                        </Card>
                                    </Col>
                                ))}
                            </Row>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} >
                                <div className="d-flex flex-wrap">
                                    {allBranches.map((branch) => (
                                        <Button
                                            key={branch._id}
                                            variant={selectedBranch === branch.name ? 'primary' : 'outline-primary'}
                                            onClick={() =>
                                                setSelectedBranch(selectedBranch === branch.name ? null : branch.name)
                                            }
                                            className="m-1"
                                            style={{
                                                backgroundColor: selectedBranch === branch.name ? '#d7aa47' : '#2d3134',
                                                color: 'white',
                                                border: 'none',
                                            }}
                                        >
                                            {branch.name}
                                        </Button>
                                    ))}
                                    {selectedBranch && (
                                        <Button
                                            variant="outline-danger"
                                            onClick={() => setSelectedBranch(null)}
                                            className="m-1"
                                        >
                                            <FaTimes />
                                        </Button>
                                    )}
                                </div>
                                {/* Product Filter Buttons */}
                                <div className="d-flex flex-wrap">
                                    {allProducts.map((product) => (
                                        <Button
                                            key={product._id}
                                            variant={selectedProduct === product.name ? 'primary' : 'outline-primary'}
                                            onClick={() =>
                                                setSelectedProduct(selectedProduct === product.name ? null : product.name)
                                            }
                                            className={`button ${selectedProduct === product.name ? 'selected' : ''}`}
                                            style={{
                                                backgroundColor: selectedProduct === product.name ? '#d7aa47' : '#2d3134',
                                                color: 'white',
                                                border: 'none',
                                            }}
                                        >
                                            {product.name}
                                        </Button>
                                    ))}
                                    {selectedProduct && (
                                        <Button
                                            variant="outline-danger"
                                            onClick={() => setSelectedProduct(null)}
                                            className="m-1"
                                        >
                                            <FaTimes />
                                        </Button>
                                    )}
                                </div>
                            </div>

                            {/* Drag and Drop */}
                            {loading ? (
                                <div style={{ display: 'flex', justifyContent: 'center' }}>
                                    <Spinner animation="grow" style={{ color: '#d7aa47' }} />
                                </div>
                            ) : error ? (
                                <h3 className="text-center text-danger">{error}</h3>
                            ) : Object.keys(groupedContracts).length > 0 ? (
                                <DragDropContext onDragEnd={onDragEnd}>
                                    <div style={{ display: 'flex', overflow: 'hidden' }}>
                                        {Object.keys(groupedContracts).map((stageId) => {
                                            const stage = groupedContracts[stageId];
                                            console.log(stage,'contractstage')
                                            return (
                                                <Droppable key={stageId} droppableId={stageId}>
                                                    {(provided) => (
                                                        <Card
                                                            ref={provided.innerRef}
                                                            {...provided.droppableProps}
                                                            className="d-inline-block m-2 contact_main_card"
                                                        >
                                                            <h5 className="sticky-top stageNames" style={{ backgroundColor: '#d7aa47', color: 'white', textAlign: 'center', fontSize: '16px', padding: '15px 0px', zIndex: 1 }}>
                                                                {`${stage.name} (${stage.contracts.length})`}
                                                            </h5>
                                                            <Card.Body>
                                                                <div style={{ height: '100%', maxHeight: '600px', overflowY: 'auto', backgroundColor: '' }}>
                                                                    {stage.contracts.length > 0 ? (
                                                                        stage.contracts.map((contract, index) => (
                                                                            <Draggable key={contract._id} draggableId={contract._id} index={index}>
                                                                                {(provided) => (
                                                                                    <Card
                                                                                        ref={provided.innerRef}
                                                                                        {...provided.draggableProps}
                                                                                        {...provided.dragHandleProps}
                                                                                        className="lead-card"
                                                                                    >
                                                                                        <Card.Body>
                                                                                            <Card.Title>
                                                                                                <Link to={`/contracts/${contract._id}`} className="text-decoration-none">
                                                                                                    <p style={{ color: '#000', fontWeight: '600', fontSize: '14px', textAlign: 'center' }}>
                                                                                                        {contract.client_id.name}
                                                                                                    </p>
                                                                                                </Link>
                                                                                            </Card.Title>
                                                                                            <Card.Text>
                                                                                                <div
                                                                                                    className='marketing_source_lead'
                                                                                                    style={{
                                                                                                        backgroundColor:
                                                                                                            contract.lead_type?.name === 'Marketing'
                                                                                                                ? '#1877F2'
                                                                                                                : contract.lead_type?.name === 'Tele Sales'
                                                                                                                    ? '#32c5bc'
                                                                                                                    : contract.lead_type?.name === 'Others'
                                                                                                                        ? '#f97820'
                                                                                                                        : 'transparent', // fallback for other cases
                                                                                                    }}
                                                                                                >
                                                                                                    <p className='mb-0 text-center' style={{ fontSize: '11px' }}>
                                                                                                        {`${contract.lead_type?.name && contract.lead_type?.name} / ${contract.source_id?.name && contract.source_id?.name}`}
                                                                                                    </p>
                                                                                                </div>
                                                                                                <div
                                                                                                    className='product_stage_lead'
                                                                                                    style={{
                                                                                                        backgroundColor:
                                                                                                            contract.pipeline_id?.name === 'Personal Loan'
                                                                                                                ? '#ffa000'
                                                                                                                : contract.pipeline_id?.name === 'EIB Bank'
                                                                                                                    ? '#08448c'
                                                                                                                    : 'defaultBackgroundColor', // Set a default background color if needed
                                                                                                    }}
                                                                                                >
                                                                                                    <p className='mb-0 text-center' style={{ fontSize: '11px' }}>
                                                                                                        {contract.pipeline_id?.name && contract.pipeline_id?.name}
                                                                                                    </p>
                                                                                                </div>

                                                                                            </Card.Text>
                                                                                        </Card.Body>
                                                                                    </Card>
                                                                                )}
                                                                            </Draggable>
                                                                        ))
                                                                    ) : (
                                                                        <p className="text-center mutual_heading_class">No contracts available</p>
                                                                    )}
                                                                </div>
                                                                {provided.placeholder}
                                                            </Card.Body>
                                                        </Card>
                                                    )}
                                                </Droppable>
                                            );
                                        })}
                                    </div>
                                </DragDropContext>
                            ) : (
                                <h3 className="text-center">No contracts available</h3>
                            )}
                        </Card>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};
export default Contract;
