import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Spinner, Button, Alert, Form, OverlayTrigger, Tooltip, Image } from 'react-bootstrap';
import SidebarComponent from './sidebar/Sidebar';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useSelector } from 'react-redux';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { FaTimes } from 'react-icons/fa';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Link } from 'react-router-dom';
import '../Pages/ContractStyle.css';
import default_image from '../Assets/default_image.jpg';

const Deal = () => {
    const token = useSelector((state) => state.loginSlice.user?.token);
    const allPipelines = useSelector((state) => state.loginSlice.pipelines);
    const allProducts = useSelector((state) => state.loginSlice.products);
    const allBranches = useSelector((state) => state.loginSlice.branches);
    const [deals, setDeals] = useState([]);
    const [filteredDeals, setFilteredDeals] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [pipelineFilter, setPipelineFilter] = useState("");
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [selectedBranch, setSelectedBranch] = useState('');
    const [selectedProduct, setSelectedProduct] = useState('');
    const [dealStages, setDealStages] = useState([]);
    const [totalDeals, setTotalDeals] = useState(0);
    const [totalCommission, setTotalCommission] = useState(0);
    const [currentMonthDeals, setCurrentMonthDeals] = useState(0);
    const [currentMonthCommission, setCurrentMonthCommission] = useState(0);
    const [isHovered, setIsHovered] = useState(false);

    const fetchAllDeals = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(`/api/deals/get-deals`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });
            const dealsData = response.data || [];
            setDeals(dealsData);
            setFilteredDeals(dealsData);
            calculateTotals(dealsData);
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to fetch deals.');
            toast.error(error.response?.data?.message || 'Failed to fetch deals.');
        } finally {
            setLoading(false);
        }
    };

    const fetchDealStages = async () => {
        try {
            const response = await axios.get(`/api/deal-stages/get-all-deal-stages`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });
            setDealStages(response.data || []);
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to fetch deal stages.');
            toast.error(error.response?.data?.message || 'Failed to fetch deal stages.');
        }
    };

    const calculateTotals = (dealsData) => {
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();

        let totalDealsCount = 0;
        let totalCommissionAmount = 0;
        let currentMonthDealsCount = 0;
        let currentMonthCommissionAmount = 0;

        dealsData.forEach(deal => {
            // Increment total deals count
            totalDealsCount++;

            // Extract commission details from service_commission_id
            const commissionDetails = deal.service_commission_id || {};

            // Calculate total commission amount from relevant fields
            const dealTotalCommission = commissionDetails.without_vat_commission || 0;
            totalCommissionAmount += dealTotalCommission;

            // Check if the deal is from the current month and year
            const dealDate = new Date(deal.date);
            if (dealDate.getMonth() === currentMonth && dealDate.getFullYear() === currentYear) {
                currentMonthDealsCount++;

                // Calculate current month commission amount
                currentMonthCommissionAmount += dealTotalCommission;
            }
        });

        // Update state or return calculated values
        setTotalDeals(totalDealsCount);
        setTotalCommission(totalCommissionAmount);
        setCurrentMonthDeals(currentMonthDealsCount);
        setCurrentMonthCommission(currentMonthCommissionAmount);
    };

    const data = [
        { title: "Total Deals", value: totalDeals },
        { title: "Total Commission", value: `${Math.round(totalCommission)}AED` },
        { title: "Current Month Deals", value: currentMonthDeals },
        { title: "C-M/Commission", value: `${Math.round(currentMonthCommission)}AED` },
    ];

    const handleSearch = (e) => {
        const query = e.target.value.toLowerCase();
        setSearchQuery(query);
        filterDeals(query, pipelineFilter, startDate, endDate, selectedBranch, selectedProduct);
    };

    const handlePipelineFilter = (e) => {
        const pipelineId = e.target.value;
        setPipelineFilter(pipelineId);
        filterDeals(searchQuery, pipelineId, startDate, endDate, selectedBranch, selectedProduct);
    };

    const handleStartDateChange = (date) => {
        setStartDate(date);
        filterDeals(searchQuery, pipelineFilter, date, endDate, selectedBranch, selectedProduct);
    };

    const handleEndDateChange = (date) => {
        setEndDate(date);
        filterDeals(searchQuery, pipelineFilter, startDate, date, selectedBranch, selectedProduct);
    };

    const handleBranchFilter = (branchName) => {
        const updatedBranch = selectedBranch === branchName ? '' : branchName;
        setSelectedBranch(updatedBranch);
        filterDeals(searchQuery, pipelineFilter, startDate, endDate, updatedBranch, selectedProduct);
    };

    const handleProductFilter = (productName) => {
        const updatedProduct = selectedProduct === productName ? '' : productName;
        setSelectedProduct(updatedProduct);
        filterDeals(searchQuery, pipelineFilter, startDate, endDate, selectedBranch, updatedProduct);
    };

    const filterDeals = (query, pipelineId, start, end, branch, product) => {
        const filtered = deals.filter((deal) => {
            const matchesQuery = deal.client_id?.name.toLowerCase().includes(query) ||
                deal.pipeline_id?.name.toLowerCase().includes(query);
            const matchesPipeline = pipelineId ? deal.pipeline_id?._id === pipelineId : true;
            const matchesStartDate = start ? new Date(deal.date) >= new Date(start) : true;
            const matchesEndDate = end ? new Date(deal.date) <= new Date(end) : true;
            const matchesBranch = branch ? deal.branch?.name === branch : true;
            const matchesProduct = product ? deal.products?.name === product : true;

            return matchesQuery && matchesPipeline && matchesStartDate && matchesEndDate && matchesBranch && matchesProduct;
        });
        setFilteredDeals(filtered);
        calculateTotals(filtered); // Recalculate totals after filtering
    };

    const handleClear = () => {
        setSearchQuery("");
        setPipelineFilter("");
        setStartDate(null);
        setEndDate(null);
        setSelectedBranch("");
        setSelectedProduct("");
        setFilteredDeals(deals);
        calculateTotals(deals); // Reset totals after clearing filters
    };

    useEffect(() => {
        if (token) {
            fetchAllDeals();
            fetchDealStages();
        }
    }, [token]);

    // Organize deals by stage
    const organizedDeals = dealStages.reduce((acc, stage) => {
        acc[stage._id] = filteredDeals.filter(deal => deal.deal_stage?._id === stage._id);
        return acc;
    }, {});


    const handleDragEnd = async (result) => {
        const { destination, source, draggableId } = result;

        // If there's no destination (i.e., the deal was dropped outside a valid area), return
        if (!destination) return;

        // If the deal was dropped in the same position, return
        if (destination.droppableId === source.droppableId && destination.index === source.index) return;

        // Find the deal that was dragged
        const draggedDeal = filteredDeals.find(deal => deal._id === draggableId);
        if (!draggedDeal) return;

        // Get the new stage ID from the destination
        const newStageId = destination.droppableId;

        // Update the deal stage locally (optional, for immediate UI update)
        const updatedDeals = filteredDeals.map(deal =>
            deal._id === draggableId ? { ...deal, deal_stage: { ...deal.deal_stage, _id: newStageId } } : deal
        );
        setFilteredDeals(updatedDeals);

        try {
            // Send the API request to update the deal stage
            await axios.put(
                `/api/deals/update-deal-stage/${draggableId}`,
                {
                    deal_stage: newStageId, // The new stage's ID
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            // Handle the response if needed (for example, show a success toast)
            toast.success('Deal stage updated successfully!');
        } catch (error) {
            // If an error occurs, revert the deal stage back to the previous one
            setFilteredDeals(deals);
            toast.error(error.response?.data?.message || 'Failed to update deal stage.');
        }
    };

    return (
        <>
            <ToastContainer
                position="bottom-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={true}
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

                    <Col xs={12} md={10}>
                        <Card className='leads_main_cards mt-3' style={{ padding: '5px 10px' }}>
                            <Card.Body>
                                <Form>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '5px' }} className='mb-3'>
                                        <div className='w-100'>
                                            <Form.Group controlId="searchBar">
                                                <Form.Control
                                                    type="text"
                                                    placeholder="Search by client name or company name"
                                                    value={searchQuery}
                                                    onChange={handleSearch}
                                                    className="w-100"
                                                />
                                            </Form.Group>
                                        </div>

                                        <div className='w-100'>
                                            <Form.Group controlId="pipelineFilter">
                                                <Form.Select
                                                    value={pipelineFilter}
                                                    onChange={handlePipelineFilter}
                                                    className="w-100"
                                                >
                                                    <option value="">Filter by Pipeline</option>
                                                    {allPipelines?.map((pipeline) => (
                                                        <option key={pipeline._id} value={pipeline._id}>
                                                            {pipeline.name}
                                                        </option>
                                                    ))}
                                                </Form.Select>
                                            </Form.Group>
                                        </div>

                                        <div className='w-100' style={{ display: 'flex', gap: '5px' }}>
                                            <Form.Group controlId="startDate">
                                                <DatePicker
                                                    selected={startDate}
                                                    onChange={handleStartDateChange}
                                                    dateFormat="yyyy-MM-dd"
                                                    placeholderText="Start Date"
                                                    className="form-control w-100"
                                                />
                                            </Form.Group>

                                            <Form.Group controlId="endDate">
                                                <DatePicker
                                                    selected={endDate}
                                                    onChange={handleEndDateChange}
                                                    dateFormat="yyyy-MM-dd"
                                                    placeholderText="End Date"
                                                    className="form-control w-100"
                                                />
                                            </Form.Group>
                                        </div>

                                        <div className="ms-auto">
                                            <Button variant="secondary" onClick={handleClear}>
                                                Clear
                                            </Button>
                                        </div>
                                    </div>
                                </Form>

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
                                                        <p className='mb-0 ' >
                                                            {`${item.title} - ${item.value}`}
                                                        </p>
                                                    </Card.Title>
                                                </Card.Body>
                                            </Card>
                                        </Col>
                                    ))}
                                </Row>

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div className="d-flex flex-wrap">
                                        {allBranches.map((branch) => (
                                            <Button
                                                key={branch._id}
                                                variant={selectedBranch === branch.name ? 'primary' : 'outline-primary'}
                                                onClick={() => handleBranchFilter(branch.name)}
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
                                                onClick={() => handleBranchFilter(selectedBranch)}
                                                className="m-1"
                                            >
                                                <FaTimes />
                                            </Button>
                                        )}
                                    </div>

                                    <div className="d-flex flex-wrap">
                                        {allProducts.map((product) => (
                                            <Button
                                                key={product._id}
                                                variant={selectedProduct === product.name ? 'primary' : 'outline-primary'}
                                                onClick={() => handleProductFilter(product.name)}
                                                className="button m-1"
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
                                                onClick={() => handleProductFilter(selectedProduct)}
                                                className="m-1"
                                            >
                                                <FaTimes />
                                            </Button>
                                        )}
                                    </div>
                                </div>

                                <DragDropContext onDragEnd={handleDragEnd}>
                                    <div style={{ display: 'flex', overflow: 'hidden' }}>
                                        {dealStages.map((stage) => {
                                            // Get deals for the current stage
                                            const stageDeals = organizedDeals[stage._id] || [];
                                            // Calculate the total commission for the current stage
                                            const totalCommission = organizedDeals[stage._id]?.reduce((total, deal) => {
                                                return total + (deal.service_commission_id?.without_vat_commission || 0); // Assume `commission` is in AED
                                            }, 0);

                                            // Get the total number of deals for the current stage
                                            const totalDeals = stageDeals.length;

                                            return (
                                                <Droppable key={stage._id} droppableId={stage._id}>
                                                    {(provided) => (
                                                        <Card
                                                            ref={provided.innerRef}
                                                            {...provided.droppableProps}
                                                            className="d-inline-block m-2 deal_main_card"
                                                        >

                                                            {/* Stage name */}
                                                            <h5
                                                                className="sticky-top stageNames"
                                                                style={{
                                                                    backgroundColor: '#d7aa47',
                                                                    color: 'white',
                                                                    textAlign: 'center',
                                                                    fontSize: '16px',
                                                                    padding: '15px 0px',
                                                                    zIndex: 1,
                                                                }}
                                                            >
                                                                {`${stage.name} (${totalDeals})- ${Math.round(totalCommission)} AED`}
                                                            </h5>

                                                            {/* Deals within the stage */}
                                                            {organizedDeals[stage._id]?.map((deal, index) => (
                                                                <Draggable key={deal._id} draggableId={deal._id} index={index}>
                                                                    {(provided) => (
                                                                        <Card
                                                                            ref={provided.innerRef}
                                                                            {...provided.draggableProps}
                                                                            {...provided.dragHandleProps}
                                                                            className="lead-card"
                                                                            style={{
                                                                                ...provided.draggableProps.style,
                                                                                marginBottom: '10px',
                                                                                backgroundColor: '#fff',
                                                                                border: '1px solid #ccc',
                                                                                borderRadius: '10px',
                                                                                padding: '10px',
                                                                            }}
                                                                        >
                                                                            {/* Labels Section */}
                                                                            <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', marginTop: '-25px' }}>
                                                                                {deal?.lead_id?.labels.map((labelname, index) => {
                                                                                    let backgroundColor = labelname.color || '#ccc';
                                                                                    switch (labelname.color) {
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
                                                                                        <div key={index} style={{ marginRight: '4px', marginTop: '8px' }}>
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
                                                                                                <p style={{ color: '#000', margin: 0, fontSize: '11px' }}>{labelname.name}</p>
                                                                                            </div>
                                                                                        </div>
                                                                                    );
                                                                                })}
                                                                            </div>
                                                                            {/* Deal Client Name */}
                                                                            <div style={{ paddingTop: '20px' }}>

                                                                                <Link
                                                                                    to={`/singledeal/${deal._id}`}
                                                                                    className="text-decoration-none"
                                                                                    style={{ textDecoration: 'none' }}
                                                                                >
                                                                                    <p
                                                                                        style={{
                                                                                            color: '#000',
                                                                                            fontWeight: '600',
                                                                                            fontSize: '14px',
                                                                                            textAlign: 'center',
                                                                                            position: 'relative',
                                                                                        }}
                                                                                    >
                                                                                        <span
                                                                                            style={{
                                                                                                display: 'inline-block',
                                                                                                transition: 'opacity 0.3s ease',
                                                                                            }}
                                                                                            className="name-short"
                                                                                        >
                                                                                            {deal.client_id.name.slice(0, 20)}
                                                                                        </span>
                                                                                        <span
                                                                                            style={{
                                                                                                position: 'absolute',
                                                                                                top: '0',
                                                                                                left: '0',
                                                                                                width: '100%',
                                                                                                textAlign: 'center',
                                                                                                opacity: '0',
                                                                                                pointerEvents: 'none',
                                                                                                transition: 'opacity 0.3s ease',
                                                                                            }}
                                                                                            className="name-full"
                                                                                        >
                                                                                            {deal.client_id.name}
                                                                                        </span>
                                                                                    </p>
                                                                                </Link>
                                                                            </div>


                                                                            {/* User Images */}
                                                                            <div className="image_container">
                                                                                {deal.selected_users
                                                                                    .filter((leadImage) => {
                                                                                        const excludedRoles = ['Developer', 'Marketing', 'CEO', 'MD', 'Super Admin', 'HOD', 'Admin'];
                                                                                        return !excludedRoles.includes(leadImage?.role);
                                                                                    })
                                                                                    .map((leadImage, index) => {
                                                                                        const imageSrc = leadImage?.image
                                                                                            ? `/images/${leadImage?.image}`
                                                                                            : default_image;
                                                                                        return (
                                                                                            <OverlayTrigger
                                                                                                key={index}
                                                                                                placement="top" // Change this to 'bottom', 'left', or 'right' as needed
                                                                                                overlay={
                                                                                                    <Tooltip id={`tooltip-${index}`}>
                                                                                                        {leadImage.name}
                                                                                                    </Tooltip>
                                                                                                }
                                                                                            >
                                                                                                <div style={{ display: 'inline-block', cursor: 'pointer' }}>
                                                                                                    <Image
                                                                                                        src={imageSrc}
                                                                                                        alt={`Lead ${index}`}
                                                                                                        className="image_control_discussion_main_lead"
                                                                                                    />
                                                                                                </div>
                                                                                            </OverlayTrigger>
                                                                                        );
                                                                                    })}
                                                                            </div>

                                                                            <div
                                                                                className='marketing_source_lead'
                                                                                style={{
                                                                                    backgroundColor:
                                                                                        deal.lead_type?.name === 'Marketing'
                                                                                            ? '#1877F2'
                                                                                            : deal.lead_type?.name === 'Tele Sales'
                                                                                                ? '#32c5bc'
                                                                                                : deal.lead_type?.name === 'Others'
                                                                                                    ? '#f97820'
                                                                                                    : 'transparent', // fallback for other cases
                                                                                }}
                                                                            >
                                                                                <p className='mb-0 text-center' style={{ fontSize: '11px' }}>
                                                                                    {`${deal.lead_type?.name && deal.lead_type?.name} / ${deal.source_id?.name && deal.source_id?.name}`}
                                                                                </p>
                                                                            </div>
                                                                            <div
                                                                                className='product_stage_lead'
                                                                                style={{
                                                                                    backgroundColor:
                                                                                        deal.pipeline_id?.name === 'Personal Loan'
                                                                                            ? '#ffa000'
                                                                                            : deal.pipeline_id?.name === 'EIB Bank'
                                                                                                ? '#08448c'
                                                                                                : 'defaultBackgroundColor', // Set a default background color if needed
                                                                                }}
                                                                            >
                                                                                <p className='mb-0 text-center' style={{ fontSize: '11px' }}>
                                                                                    {deal.pipeline_id?.name && deal.pipeline_id?.name}
                                                                                </p>
                                                                            </div>
                                                                        </Card>
                                                                    )}
                                                                </Draggable>
                                                            ))}
                                                            {provided.placeholder}
                                                        </Card>
                                                    )}
                                                </Droppable>
                                            );
                                        })}
                                    </div>
                                </DragDropContext>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </>
    );
};
export default Deal;
