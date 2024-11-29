import React, { useEffect, useState } from 'react';
import Sidebar from '../Components/sidebar/Sidebar';
import { Container, Row, Col, Card, Spinner, Form, InputGroup, Button } from 'react-bootstrap';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import '../Pages/style.css';
import '../Pages/ContractStyle.css';
import { FaTimes } from 'react-icons/fa';

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
    const productPipelineMap = {
        'Business Banking': ['Business Banking'],
        'Personal Loan': ['EIB Bank', 'Personal Loan'],
        'Mortgage Loan': ['Mortgage', 'CEO Mortgage'],
    };

    useEffect(() => {
        const fetchContracts = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/contracts/get-all-contracts`, {
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
                const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/contract-stages/get-all-contract-stages`, {
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
            contract.client_id.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
            (selectedPipeline ? contract.pipeline_id.name === selectedPipeline : true) &&
            (selectedBranch ? contract.branch.name === selectedBranch : true) &&
            (selectedProduct ? contract.products.name === selectedProduct : true) &&
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

    const handleStageChange = async (contractId, newStageId) => {
        try {
            await axios.put(`${process.env.REACT_APP_BASE_URL}/api/contracts/update-stage/${contractId}`, { contract_stage: newStageId }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const updatedContracts = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/contracts/get-all-contracts`, {
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
        handleStageChange(draggableId, destination.droppableId);
    };
    const handleClear = () => {
        setSelectedPipeline(null)
        setSearchTerm('')
        setEndDate(null)
        setStartDate(null)
    };

    const isSearchEnabled =
        searchTerm.trim() || selectedPipeline || (startDate && endDate);
    return (
        <div>
            <Container fluid>
                <Row>
                    <Col xs={12} md={12} lg={2}>
                        <Sidebar />
                    </Col>
                    <Col xs={12} md={12} lg={10}>
                        <Card className='leads_main_cards mt-4'>
                            <h2 className="text-center mutual_heading_class">
                                Contracts - Total Commission : {`${Math.round(totalCommission, 2)} AED`} | Total Contracts: {totalContracts} | Current Month Contracts: {currentMonthContracts} | Current Month Commission: {`${Math.round(currentMonthCommission, 2)} AED`}
                            </h2>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '5px' }} >
                                {/* Search by client name */}
                                <div className='w-100'>
                                    <Form.Control
                                        type="text"
                                        placeholder="Search by client name"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
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
                                        >
                                            <option value="">Select Pipeline</option>
                                            {allPipelines.map(pipeline => (
                                                <option key={pipeline._id} value={pipeline.name}>{pipeline.name}</option>
                                            ))}
                                        </Form.Control>
                                        {/* {selectedPipeline && (
                                            <Button variant="outline-secondary" onClick={() => setSelectedPipeline(null)}>
                                                <FaTimes />
                                            </Button>
                                        )} */}
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
                                        className="form-control w-100"
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
                                            className="form-control w-100"
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
                            {contracts.length ? (
                                <DragDropContext onDragEnd={onDragEnd}>
                                    <div className="d-flex flex-wrap">
                                        {Object.entries(groupedContracts).map(([stageId, { name, contracts }]) => (
                                            <Droppable key={stageId} droppableId={stageId}>
                                                {(provided) => (
                                                    <Card
                                                        ref={provided.innerRef}
                                                        {...provided.droppableProps}
                                                        className="my-3"
                                                    >
                                                        <h5>{name}</h5>
                                                        <span className="badge bg-secondary mx-2">{contracts.length} Contracts</span>

                                                        <div className="contact_list">
                                                            {contracts.map((contract, index) => (
                                                                <Draggable key={contract._id} draggableId={contract._id} index={index}>
                                                                    {(provided) => (
                                                                        <div
                                                                            ref={provided.innerRef}
                                                                            {...provided.draggableProps}
                                                                            {...provided.dragHandleProps}
                                                                            className="contact_card"
                                                                        >
                                                                            <Link to={`/contracts/${contract._id}`} className="text-decoration-none">
                                                                                <div className="contract_card_body">
                                                                                    <h5>{contract.client_id?.name}</h5>
                                                                                    <p>{contract.contract_stage?.name}</p>
                                                                                </div>
                                                                            </Link>
                                                                        </div>
                                                                    )}
                                                                </Draggable>
                                                            ))}
                                                            {provided.placeholder}
                                                        </div>
                                                    </Card>
                                                )}
                                            </Droppable>
                                        ))}
                                    </div>
                                </DragDropContext>
                            ) : (
                                <h3 className="text-center text-danger">No contracts found</h3>
                            )}
                        </Card>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default Contract;
