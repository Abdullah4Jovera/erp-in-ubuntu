import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { Dropdown, Menu } from 'antd';
import { Container, Row, Col, Button, Card, Form, Modal, Image, Spinner, Alert, OverlayTrigger, Tooltip } from 'react-bootstrap';
import Sidebar from '../Components/sidebar/Sidebar';
import { Link } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import './Dashboard.css';
import { AiFillDelete } from "react-icons/ai";
import { BsThreeDotsVertical } from "react-icons/bs";
import { BiSolidLabel } from "react-icons/bi";
import DashboardLabels from '../Components/DashboardLabels';
import { TiDeleteOutline } from "react-icons/ti";
import { RiContractLine } from "react-icons/ri";
import ConvertLead from '../Components/convertLead/ConvertLead';
import { TbTransfer, TbFileDescription } from "react-icons/tb";
import TransferLeads from '../Components/transferLeads/TransferLeads';
import { LuMoveUpLeft } from "react-icons/lu";
import MoveLeads from '../Components/moveLead/MoveLeads';
import { FiEdit2 } from "react-icons/fi";
import EditLead from '../Components/editlead/EditLead';
import default_image from '../Assets/default_image.jpg';
import { IoMdAdd, IoLogoWhatsapp } from "react-icons/io";
import { SiImessage } from "react-icons/si";
import Select from 'react-select';
import WhatsappNotification from '../Components/whatsappNotification/WhatsappNotification';
import CreateLead from '../Components/createLead/CreateLead';
import { RxCross1 } from "react-icons/rx";
import { MdClear } from "react-icons/md";
import { RiFileAddFill } from "react-icons/ri";
import { AiOutlineFileAdd } from "react-icons/ai";
import rejected_image from '../Assets/rejected_image.png'
import DatePicker from 'react-datepicker'; // Import DatePicker
import "react-datepicker/dist/react-datepicker.css";
import { GrAttachment } from "react-icons/gr";

const CeoDashboard = () => {
    const token = useSelector((state) => state.loginSlice.user?.token);
    const branch = useSelector((state) => state.loginSlice.user?.branch);
    const product = useSelector((state) => state.loginSlice.user?.products);
    const permissions = useSelector(state => state.loginSlice.user?.permissions)
    const [branches, setBranches] = useState([]);
    const [products, setProducts] = useState([]);
    const [stages, setStages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [leads, setLeads] = useState([]);
    const [leadsByStage, setLeadsByStage] = useState({});
    const [selectedBranchId, setSelectedBranchId] = useState(localStorage.getItem('selectedBranchId') || branch || null);
    const [selectedProductId, setSelectedProductId] = useState(localStorage.getItem('selectedProductId') || product || null);
    const [hasFetchedLeads, setHasFetchedLeads] = useState(false);
    const [leadId, setLeadId] = useState(null);
    const defaultBranchName = 'Abu Dhabi';
    const defaultProductName = 'Business Banking';
    const [searchQuery, setSearchQuery] = useState(''); // Search state
    const [rejectedLeadModal, setRejectedLeadModal] = useState(false)
    const [labelsDashboardModal, setLabelsDashBoardModal] = useState(false)
    const [contractModal, setContractModal] = useState(false)
    const [leadtocontract, setLeadToContract] = useState(false)
    const [transferModal, setTransferModal] = useState(false);
    const [moveLeadModal, setMoveLeadModal] = useState(false);
    const [modalShow, setModalShow] = useState(false);
    const [allUsers, setAllUsers] = useState([]);
    const [userModal, setUserModal] = useState(false);
    const [selectedUsers, setSelectedUsers] = useState([]); // Changed to an array for multiple users
    const [openLeadDescriptionModal, setOpenLeadDescriptionModal] = useState(false)
    const [pipelineUsers, setPipelineUsers] = useState([]);
    const [selectedLead, setSelectedLead] = useState(null);
    const [selectedLeadUsers, setSelectedLeadUsers] = useState([]);
    const [selectedLeadDiscussion, setSelectedDiscussion] = useState([])
    const [leadDiscussionModal, setLeadDiscussionModal] = useState(false)
    const textareaRef = useRef(null);
    const [discussionText, setDiscussionText] = useState('');
    const [clientId, setClientId] = useState('')
    const [whtsappModal, setWhatsAppModal] = useState(false)
    const [userError, setUserError] = useState('')
    const [leadTransferMessageModal, setLeadTransferMessageModal] = useState(false)
    const [selectedTransferForm, setSelectedTransferForm] = useState('')
    const [modal2Open, setModal2Open] = useState(false);
    const [isFetchingLeads, setIsFetchingLeads] = useState(false);
    const [productStageError, setProductStageError] = useState('')
    const [productStageModal, setProductStageModal] = useState(false)
    const [rejectLead, setRejectLead] = useState('')
    const [rejectReasonErrorMessage, setRejectReasonErrorMessage] = useState('')
    const [phoneNumber, setPhoneNumber] = useState('')
    const [phoneNumberSuccess, setPhoneumberSuccess] = useState(false)
    const [apiData, setApiData] = useState(null);
    const [rtl, setRtl] = useState(null);
    const initialBranchId = localStorage.getItem('selectedBranchId') || branch || (branches.length > 0 ? branches[0]._id : null);
    const initialProductId = localStorage.getItem('selectedProductId') || product || (products.length > 0 ? products[0]._id : null);

    // New Data
    const [selectedLeadType, setSelectedLeadType] = useState(null);
    const [selectedSource, setSelectedSource] = useState(null);
    const [createdAtStart, setCreatedAtStart] = useState('');
    const [createdAtEnd, setCreatedAtEnd] = useState('');
    const [pipelines, setPipelines] = useState([]); // State for pipelines
    const [sources, setSources] = useState([]);
    const [selectedPipeline, setSelectedPipeline] = useState(null);
    const [users, setUsers] = useState([]);
    const [messageCounts, setMessageCounts] = useState({});
    const [leadTypes, setLeadTypes] = useState([]);
    // New Data
    useEffect(() => {
        const fetchSources = async () => {
            try {
                const response = selectedLeadType
                    ? await axios.get(`${process.env.REACT_APP_BASE_URL}/api/sources/${selectedLeadType.value}`)
                    : await axios.get(`${process.env.REACT_APP_BASE_URL}/api/sources/get/get-sources`);

                setSources(response.data);
            } catch (error) {
                console.error('Error fetching sources:', error);
            }
        };

        fetchSources();
    }, [selectedLeadType]);

    useEffect(() => {
        const savedRtl = localStorage.getItem('rtl');
        setRtl(savedRtl); // Update state with the 'rtl' value from localStorage
    }, [rtl]);

    useEffect(() => {
        // Set default selected product and branch ID in localStorage if not already set
        if (!localStorage.getItem('selectedProductId') && initialProductId) {
            localStorage.setItem('selectedProductId', initialProductId);
        }
        if (!localStorage.getItem('selectedBranchId') && initialBranchId) {
            localStorage.setItem('selectedBranchId', initialBranchId);
        }
    }, [initialProductId, initialBranchId]);

    useEffect(() => {
        // Update localStorage whenever selectedProductId changes
        if (selectedProductId) {
            localStorage.setItem('selectedProductId', selectedProductId);
        }
    }, [selectedProductId]);

    useEffect(() => {
        // Update localStorage whenever selectedBranchId changes
        if (selectedBranchId) {
            localStorage.setItem('selectedBranchId', selectedBranchId);
        }
    }, [selectedBranchId]);

    useEffect(() => {
        const fetchUsers = async () => {
            if (selectedProductId) {
                try {
                    const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/users/get-users-by-product/${selectedProductId}`, {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        }
                    });
                    setUsers(response.data);
                } catch (error) {
                    console.error('Error fetching users:', error);
                }
            } else {
                setUsers([]);
            }
        };

        fetchUsers();
    }, [selectedProductId]);

    useEffect(() => {
        const fetchPipelines = async () => {
            if (selectedBranchId === '673b34924b966621c041caac') {
                setPipelines([
                    {
                        _id: '673b190186706b218f6f3262',
                        name: 'Ajman Branch'
                    }
                ]);
            } else if (selectedProductId) {
                try {
                    const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/products/${selectedProductId}`);
                    const pipelinesData = response.data.pipeline_id || [];
                    setPipelines(pipelinesData);
                } catch (error) {
                    console.error('Error fetching pipelines:', error);
                }
            } else {
                setPipelines([]);
            }
        };

        fetchPipelines();
    }, [selectedProductId, selectedBranchId]);

    const handleClearFilters = () => {
        setSelectedPipeline(null);
        setSelectedUsers([]);
        setSelectedLeadType(null);
        setSelectedSource(null);
        setCreatedAtStart('');
        setCreatedAtEnd('');
        fetchLeads(selectedProductId, selectedBranchId);
    };

    const handleSearch = async () => {
        try {
            // alert('working')
            const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/leads/search-leads`, {
                params: {
                    pipeline: selectedPipeline?.value,
                    userId: selectedUsers.value,
                    created_at_start: createdAtStart,
                    created_at_end: createdAtEnd,
                    products: selectedProductId,
                    lead_type: selectedLeadType?.value,
                    source: selectedSource?.value,

                    branch: selectedBranchId,
                },
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setLeads(response.data.leads);
            organizeLeadsByStage(response.data.leads);
            const messageCountMap = {};
            response.data.leads.forEach(lead => {
                const messageCount = Array.isArray(lead.messages) ? lead.messages.length : 0;
                messageCountMap[lead._id] = messageCount;
            });
            setMessageCounts(messageCountMap);
        } catch (error) {
            console.error('Error searching leads:', error);
        }

    };
    const debounce = (func, delay) => {
        let timeout;
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), delay);
        };
    };

    const debouncedSearch = debounce(handleSearch, 300);

    useEffect(() => {
        debouncedSearch();
    }, [selectedBranchId, selectedProductId, selectedPipeline, selectedUsers, selectedLeadType, selectedSource, createdAtStart, createdAtEnd]);

    // END data

    const canEditLead = permissions?.includes('edit_lead');
    const canMoveLead = permissions?.includes('move_lead');
    const canTransferLead = permissions?.includes('transfer_lead');
    const canRejectLead = permissions?.includes('reject_lead');
    const canAddUserLead = permissions?.includes('add_user_lead');
    const canContractLead = permissions?.includes('convert_lead');
    const canLabelLead = permissions?.includes('lead_labels');

    const getProductID = localStorage.getItem('selectedProductId')
    const getBranchID = localStorage.getItem('selectedBranchId')


    useEffect(() => {
        const fetchBranchesAndProducts = async () => {
            try {
                const branchResponse = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/branch/get-branches`
                    , {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        }
                    }
                );
                const productResponse = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/products/get-all-products`
                    , {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        }
                    }
                );

                const leadtypeResponse = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/leadtypes/get-all-leadtypes`)

                setBranches(branchResponse.data);
                setProducts(productResponse.data);
                setLeadTypes(leadtypeResponse.data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchBranchesAndProducts();
    }, [token]);

    useEffect(() => {
        const branchId = selectedBranchId || branches.find(b => b.name === defaultBranchName)?._id;
        const productId = selectedProductId || products.find(p => p.name === defaultProductName)?._id;

        if (branchId && productId && !hasFetchedLeads && token) {
            fetchLeads(productId, branchId);
            fetchProductStages(productId);
            setSelectedBranchId(branchId);
            setSelectedProductId(productId);
            setHasFetchedLeads(true);
        }
    }, [selectedBranchId, selectedProductId, token, branch, product, branches, products, hasFetchedLeads]);

    const fetchLeads = async (productId, branchId) => {
        setIsFetchingLeads(true);
        try {
            const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/leads/get-leads/${productId}/branch/${branchId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });
            setLeads(response.data);
            organizeLeadsByStage(response.data);
            const messageCountMap = {};
            response.data.leads.forEach(lead => {
                const messageCount = Array.isArray(lead.messages) ? lead.messages.length : 0;
                messageCountMap[lead._id] = messageCount;
            });
            setMessageCounts(messageCountMap);
        } catch (err) {
            setError(err.message);
        }
        finally {
            setIsFetchingLeads(false); // Stop loading
        }
    };


    const fetchProductStages = async (productId) => {
        try {
            const headers = {
                Authorization: `Bearer ${token}`,
            };
            const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/productstages/${productId}`, { headers });
            setStages(response.data);
        } catch (err) {
            setError(err.message);
        }
    };

    const organizeLeadsByStage = (leads) => {
        const organizedLeads = {};

        leads.forEach(lead => {
            const stageId = lead.product_stage._id;
            if (!organizedLeads[stageId]) {
                organizedLeads[stageId] = {
                    stageName: lead.product_stage.name,
                    leads: []
                };
            }
            organizedLeads[stageId].leads.push(lead);
        });

        setLeadsByStage(organizedLeads);
    };

    const handleBranchSelect = (branchId) => {
        setSelectedBranchId(branchId);
        if (selectedProductId) {
            fetchLeads(selectedProductId, branchId);
        }
    };

    const handleProductSelect = (productId) => {
        setSelectedProductId(productId);
        localStorage.setItem('selectedProductId', productId);
        setSelectedPipeline('');
        setSelectedUsers('');
        fetchProductStages(productId);
        if (selectedBranchId) {
            fetchLeads(productId, selectedBranchId);
        }
    };

    // Fetch all users
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/users/get-users`);
                setAllUsers(response.data);
            } catch (error) {
                console.log(error, 'err');
            }
        };
        fetchData();
    }, []);

    const draggableCardHandler = async (leadId, newStageId) => {
        try {
            await axios.put(
                `${process.env.REACT_APP_BASE_URL}/api/leads/update-product-stage/${leadId}`,
                { newProductStageId: newStageId },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            fetchLeads(selectedProductId, selectedBranchId); // Refresh leads
        } catch (error) {
            setProductStageModal(true)
            setProductStageError(`${error?.response?.data?.message} to Move Lead`)

            setTimeout(() => {
                setProductStageModal(false)
            }, 3000)
        }
    };

    const onDragEnd = (result) => {
        const { source, destination, draggableId } = result;

        // Check if dropped outside any droppable area
        if (!destination) return;

        const sourceStageId = source.droppableId;
        const destinationStageId = destination.droppableId;

        // If dropped in the same stage, do nothing
        if (sourceStageId === destinationStageId) return;

        // Call handler to update lead's stage in backend
        draggableCardHandler(draggableId, destinationStageId);
    };

    if (loading) {
        return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Spinner animation="grow" style={{ color: '#d7aa47' }} />
        </div>;
    }

    const openRejectedLead = (id) => {
        setLeadId(id)
        setRejectedLeadModal(true)
    }

    const openLabelsLead = (id) => {
        setLeadId(id)
        setLabelsDashBoardModal(true)
    }

    const openLeadConvertModal = (id) => {
        setLeadId(id);
        setContractModal(true)
    }

    const openTransferLeadModal = (id) => {
        setLeadId(id);
        setTransferModal(true);
    };

    const openMoveLeadModal = (id) => {
        setLeadId(id);
        setMoveLeadModal(true);
    };

    const openModal = (id) => {
        setLeadId(id);
        setModalShow(true);
    };

    const TransferMessageModal = (lead) => {
        setSelectedTransferForm(lead)
        setLeadTransferMessageModal(true)
    }

    // Show modal with lead Discussion
    const showLeadDiscussion = (lead) => {
        setSelectedDiscussion(lead)
        setLeadDiscussionModal(true)
    }

    const openWhtsappModal = (id, clientId) => {
        setLeadId(id);
        setClientId(clientId)
        setWhatsAppModal(true);
    }

    // Show modal with lead details
    const showLeadDetails = (lead) => {
        setSelectedLead(lead); // Set the selected lead
        setOpenLeadDescriptionModal(true)
    };

    // Add User
    const AddUser = async () => {
        setUserError('');

        // Ensure there are selected users
        if (!selectedLeadUsers || selectedLeadUsers.length === 0) {
            setUserError('Please select at least one user before submitting.');
            return;
        }

        try {
            // Extract the lead ID
            const leadId = selectedLead ? selectedLead._id : null;
            if (!leadId) {
                setUserError('No lead selected.');
                return;
            }

            // Loop through selected users and add them to the lead
            for (const user of selectedLeadUsers) {
                await axios.put(
                    `${process.env.REACT_APP_BASE_URL}/api/leads/add-user-to-lead/${leadId}`, // Use the lead ID
                    {
                        userId: user.value, // Send user ID
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${token}`, // Ensure token is passed in headers
                        },
                    }
                );
            }

            // Clear the selection and close the modal
            setSelectedLeadUsers([]);
            setUserModal(false);
            fetchLeads(selectedProductId, selectedBranchId);
        } catch (error) {
            setUserError(error.response.data.message && error.response.data.message);
        }
    };

    // Function to handle the modal opening for a specific lead
    const handleAddUserClick = (leadId) => {
        // Find the lead based on the leadId
        const lead = leads.find((lead) => lead._id === leadId);

        // Set the selected lead and its users
        setSelectedLead(lead);
        setSelectedLeadUsers(selectedUsers[leadId] || []); // Using the selectedUsers map

        // const filteredUsers = allUsers.filter(user =>
        //     user.pipeline?.[0]?._id === lead.pipeline_id?._id
        // );
        const excludedRoles = ["MD", "CEO", "HOD", "Super Admin", "Developer", "Marketing", "No Role"];

        // Filter users to exclude specific roles
        const filteredUsers = allUsers.filter(user => !excludedRoles.includes(user.role));

        // Set the state with filtered users
        setPipelineUsers(filteredUsers);

        // Open the modal
        setUserModal(true);
    };


    // Add Discussion
    const sendDiscussionMessage = async () => {
        if (!discussionText.trim()) {
            setError('Please Enter a Comment.');
            return;
        }

        try {
            await axios.post(`${process.env.REACT_APP_BASE_URL}/api/leads/add-discussion/${selectedLeadDiscussion._id}`, {
                comment: discussionText
            }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setDiscussionText('');
            setLeadDiscussionModal(false)
            fetchLeads(getProductID, getBranchID);
        } catch (error) {
            console.log(error, 'err');
        }
    }

    const handleInputChange = (e) => {
        const value = e.target.value;
        setDiscussionText(value);

        if (value.trim()) {
            setError('');
        }
    };

    const RejectedLead = async (id) => {
        try {
            await axios.put(`${process.env.REACT_APP_BASE_URL}/api/leads/reject-lead/${leadId}`, {
                reject_reason: rejectLead
            }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })

            setRejectedLeadModal(false)
            setRejectReasonErrorMessage('')
            fetchLeads(getProductID, getBranchID)
        } catch (error) {
            setRejectReasonErrorMessage(error.response.data.message)
            setTimeout(() => {
                setRejectReasonErrorMessage(false);
            }, 3000)
        }
    }

    const renderMenu = (lead) => (
        <Menu
            style={{
                padding: '10px 20px',
                inset: '0px 0px auto auto',
                display: 'flex',
                gap: '5px',
                flexDirection: 'column',
                backgroundColor: '#000',
                direction: rtl === 'true' ? 'rtl' : 'ltr',
            }}
        >
            {canEditLead && (
                <Menu.Item key="edit" onClick={() => openModal(lead._id)}>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <FiEdit2 style={{ color: '#d7aa47', fontSize: '16px' }} />
                        <span style={{ color: '#d7aa47' }}>
                            {rtl === 'true' ? 'تحرير' : 'Edit'}
                        </span>
                    </div>
                </Menu.Item>
            )}

            {canMoveLead && (
                <Menu.Item key="move" onClick={() => openMoveLeadModal(lead._id)}>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <LuMoveUpLeft style={{ color: '#d7aa47', fontSize: '16px' }} />
                        <span style={{ color: '#d7aa47' }}>
                            {rtl === 'true' ? 'نقل' : 'Move'}
                        </span>
                    </div>
                </Menu.Item>
            )}

            {canTransferLead && (
                <Menu.Item key="transfer" onClick={() => openTransferLeadModal(lead._id)}>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <TbTransfer style={{ color: '#d7aa47', fontSize: '16px' }} />
                        <span style={{ color: '#d7aa47' }}>
                            {rtl === 'true' ? 'تحويل' : 'Transfer'}
                        </span>
                    </div>
                </Menu.Item>
            )}

            {canRejectLead && (
                <Menu.Item key="reject" onClick={() => openRejectedLead(lead._id)}>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <AiFillDelete style={{ color: '#d7aa47', fontSize: '16px' }} />
                        <span style={{ color: '#d7aa47' }}>
                            {rtl === 'true' ? 'رفض' : 'Reject'}
                        </span>
                    </div>
                </Menu.Item>
            )}

            {canLabelLead && (
                <Menu.Item key="labels" onClick={() => openLabelsLead(lead._id)}>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <BiSolidLabel style={{ color: '#d7aa47', fontSize: '16px' }} />
                        <span style={{ color: '#d7aa47' }}>
                            {rtl === 'true' ? 'التصنيفات' : 'Labels'}
                        </span>
                    </div>
                </Menu.Item>
            )}
        </Menu>

    );

    // Custom styles for the select dropdown
    const customStyles = {
        menu: (provided) => ({
            ...provided,
            maxHeight: 120, // Limit height to show only 2 or 3 options
            overflowY: 'hidden', // Hide scrollbar in the menu container
            padding: 0, // Remove padding
        }),
        menuList: (provided) => ({
            ...provided,
            maxHeight: 120, // Set the same max height to the menuList
            overflowY: 'auto', // Enable scrolling
            paddingRight: '8px', // Add padding to make room for the scrollbar
            '::-webkit-scrollbar': {
                width: '6px', // Set scrollbar width
            },
            '::-webkit-scrollbar-thumb': {
                backgroundColor: '#ccc', // Style the scrollbar thumb
                borderRadius: '4px', // Make the scrollbar thumb rounded
            },
            '::-webkit-scrollbar-thumb:hover': {
                backgroundColor: '#aaa', // Change color on hover for better visibility
            },
        }),
        control: (provided) => ({
            ...provided,
            minHeight: 38, // Set the minimum height of the control
        }),
    };

    const handlePhoneInputChange = async (e) => {
        let inputValue = e.target.value;

        // Validation and formatting
        let processedValue = inputValue.replace(/^\+971\s?/, '').replace(/^971\s?/, '').replace(/^0+/, '');
        const digitsOnly = processedValue.replace(/\D/g, '').slice(0, 9); // Keep only digits
        const formattedValue = digitsOnly.replace(/(\d{2})(\d{3})(\d{4})/, '$1 $2 $3'); // Format the number

        setPhoneNumber(formattedValue); // Update state with formatted number

        // If there are not exactly 9 digits, return early and don't make an API call
        if (digitsOnly.length !== 9) {
            return; // Optionally, you can display a message or reset the state here
        }

        // Concatenate +971 with the processed phone number for the payload
        const payloadPhone = `+971${digitsOnly}`;

        try {
            const response = await axios.post(`${process.env.REACT_APP_BASE_URL}/api/leads/check-client-phone-search`, {
                clientPhone: payloadPhone, // Use the concatenated phone number for API call
            }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });

            // Handle the response as needed
            const responseData = response.data[0];
            setApiData(responseData); // Save the first object in state

            // Check if apiData exists and if the phone number matches
            if (responseData && responseData.client && responseData.client.phone === payloadPhone) {
                setPhoneumberSuccess(true);
            }
        } catch (error) {
            console.error('Error checking client phone:', error);
            // Handle error accordingly (e.g., show an error message)
        }
    };



    return (
        <div>
            {/* <Navbar /> */}
            <Container fluid style={{ direction: rtl === 'true' ? 'rtl' : 'ltr' }} >
                <Row>
                    <Col xs={12} md={12} lg={1}>
                        <Sidebar />
                    </Col>

                    <Col xs={12} md={12} lg={11}>
                        <Card className='leads_main_cards mt-4'>

                            {/* <div className='mb-3 lead_search_container '  > */}
                            <div className="lead-search" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '15px', marginBottom: '4%' }}>
                                <div>
                                    <Select
                                        id="pipeline"
                                        value={selectedPipeline}
                                        onChange={setSelectedPipeline}
                                        options={pipelines.map((pipeline) => ({ value: pipeline._id, label: pipeline.name }))}
                                        placeholder={rtl === 'true' ? 'اختر الخط الأنابيب' : 'Pipeline'}
                                        classNamePrefix="react-select"
                                        className='input_field_input_field'
                                        styles={{
                                            container: (provided) => ({
                                                ...provided,
                                                width: '100vw',          // Full viewport width
                                                maxWidth: '200px',
                                                borderRadius: '0.375rem'      // Maximum width set to 200px
                                            }),
                                            option: (provided) => ({
                                                ...provided,
                                                whiteSpace: 'nowrap',    // Ensuring no wrapping of option text
                                                overflowX: 'hidden'
                                            }),
                                        }}
                                    />
                                </div>

                                <div>
                                    <Select
                                        id="users"
                                        value={selectedUsers}
                                        onChange={setSelectedUsers}
                                        options={users.map((user) => ({ value: user._id, label: user.name }))}
                                        placeholder={rtl === 'true' ? 'اختر المستخدمين' : 'Users'}
                                        classNamePrefix="react-select"
                                        className='input_field_input_field'
                                        styles={{
                                            container: (provided) => ({
                                                ...provided,
                                                width: '100vw',          // Full viewport width
                                                maxWidth: '200px',
                                                borderRadius: '0.375rem'      // Maximum width set to 200px
                                            }),
                                            option: (provided) => ({
                                                ...provided,
                                                whiteSpace: 'nowrap',    // Ensuring no wrapping of option text
                                                overflowX: 'hidden'
                                            }),
                                        }}
                                    />
                                </div>

                                <div>
                                    <Select
                                        id="lead_type"
                                        value={selectedLeadType}
                                        onChange={setSelectedLeadType}
                                        options={leadTypes.map((leadType) => ({ value: leadType._id, label: leadType.name }))}
                                        placeholder={rtl === 'true' ? 'اختر نوع العميل' : 'Lead Type'}
                                        classNamePrefix="react-select"
                                        className='input_field_input_field'
                                        styles={{
                                            container: (provided) => ({
                                                ...provided,
                                                width: '100vw',          // Full viewport width
                                                maxWidth: '200px',
                                                borderRadius: '0.375rem'      // Maximum width set to 200px
                                            }),
                                            option: (provided) => ({
                                                ...provided,
                                                whiteSpace: 'nowrap',    // Ensuring no wrapping of option text
                                                overflowX: 'hidden'
                                            }),
                                        }}
                                    />
                                </div>

                                <div>
                                    <Select
                                        id="source"
                                        value={selectedSource}
                                        onChange={setSelectedSource}
                                        options={sources.map((source) => ({ value: source._id, label: source.name }))}
                                        placeholder={rtl === 'true' ? 'اختر المصدر' : 'Source'}
                                        classNamePrefix="react-select"
                                        className='input_field_input_field'
                                        styles={{
                                            container: (provided) => ({
                                                ...provided,
                                                width: '100vw',          // Full viewport width
                                                maxWidth: '200px',
                                                borderRadius: '0.375rem'      // Maximum width set to 200px
                                            }),
                                            option: (provided) => ({
                                                ...provided,
                                                whiteSpace: 'nowrap',    // Ensuring no wrapping of option text
                                                overflowX: 'hidden'
                                            }),
                                        }}
                                    />
                                </div>

                                <div>
                                    <Form>
                                        <Form.Group controlId="searchLeads">
                                            <Form.Control
                                                type="text"
                                                placeholder={rtl === 'true' ? 'العميل/الشركة' : 'Client/Company'}
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                className='input_field_input_field'
                                            />
                                        </Form.Group>
                                    </Form>
                                </div>

                                <div>
                                    <Form.Control
                                        className='input_field_input_field'
                                        type="text"
                                        placeholder={rtl === 'true' ? 'ابحث برقم الهاتف' : 'Number'}
                                        value={phoneNumber}
                                        name='phoneNumber'
                                        onChange={handlePhoneInputChange}
                                    />
                                </div>

                                <DatePicker
                                    id="created_at_start"
                                    selected={createdAtStart}
                                    onChange={(date) => setCreatedAtStart(date)}
                                    // onChange={(e) => setCreatedAtStart(e.target.value)}
                                    className="form-control input_field_input_field"
                                    placeholderText={rtl === 'true' ? 'تاريخ البدء' : 'Start Date'}
                                />
                                <DatePicker
                                    id="created_at_end"
                                    selected={createdAtEnd}
                                    onChange={(date) => setCreatedAtEnd(date)}
                                    placeholderText={rtl === 'true' ? 'تاريخ النهاية' : 'End Date'}
                                    className="form-control input_field_input_field"
                                />

                                <div
                                    style={{ cursor: 'pointer', backgroundColor: '#d7aa47' }}
                                    className='clear_filter_btn'
                                    onClick={handleClearFilters}
                                >
                                    <MdClear style={{ color: 'black', fontSize: '25px' }} />
                                </div>

                            </div>

                            <Row>
                                <div className='' >
                                    {!branch && (
                                        <div style={{ position: 'relative' }}>
                                            <div style={{position:'absolute', left: 0, bottom: 0, zIndex: 1}}>
                                                {branches.length > 0 ? (
                                                    branches.map((branch) => (
                                                        <Button
                                                            key={branch._id}
                                                            className={`button ${selectedBranchId === branch._id ? 'selected' : ''} outside_lead_class`}
                                                            style={{
                                                                backgroundColor: selectedBranchId === branch._id ? '#d7aa47' : '#2d3134',
                                                                color: selectedBranchId === branch._id ? 'white' : 'white',
                                                                border: 'none'
                                                            }}
                                                            onClick={() => handleBranchSelect(branch._id)}
                                                        >
                                                            {branch.name}
                                                        </Button>
                                                    ))
                                                ) : (
                                                    <p className='mutual_heading_class' >No Branches Available</p>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {!product && (
                                        <div style={{ position: 'relative' }} >
                                            <div style={{ position: 'absolute', right: 0, bottom: 0, zIndex: 1 }} >
                                                {products.length > 0 ? (
                                                    products.map((product) => (
                                                        <Button
                                                            key={product._id}
                                                            className={`button ${selectedProductId === product._id ? 'selected' : ''}`}
                                                            onClick={() => handleProductSelect(product._id)}
                                                            style={{
                                                                backgroundColor: selectedProductId === product._id ? '#d7aa47' : '#2d3134',
                                                                color: selectedProductId === product._id ? 'white' : 'white',
                                                                border: 'none',
                                                            }}
                                                        >
                                                            {product.name}
                                                        </Button>
                                                    ))
                                                ) : (
                                                    <p className='mutual_heading_class'>No Products Available</p>
                                                )}
                                                <AiOutlineFileAdd style={{ backgroundColor: '#d7aa47', borderRadius: '5px', cursor: 'pointer', fontSize: '35px' }} onClick={() => setModal2Open(true)} />
                                            </div>
                                        </div>
                                    )}

                                </div>

                            </Row>

                            {isFetchingLeads ? ( // Show spinner while fetching leads
                                <div className="text-center my-5">
                                    <Spinner animation="grow" role="status" style={{ color: '#d7aa47' }}></Spinner>
                                </div>
                            ) : (

                                <DragDropContext onDragEnd={onDragEnd}>
                                    <div className="stages-wrapper d-flex overflow-auto mt-3" style={{ maxHeight: '75vh', overflowX: 'auto' }}>
                                        {stages.length > 0 ? (
                                            // Sort stages by the 'order' field before rendering
                                            stages
                                                .sort((a, b) => a.order - b.order)
                                                .map((stage) => (
                                                    <Droppable key={stage._id} droppableId={stage._id}>
                                                        {(provided) => (
                                                            <Card
                                                                className="stage-card"
                                                                style={{ minWidth: '268px', margin: '0 7px', height: '100%', maxHeight: '750px', overflowY: 'auto', borderRadius: '20px', }}
                                                                ref={provided.innerRef}
                                                                {...provided.droppableProps}
                                                            >
                                                                <h5 className='sticky-top stageNames' style={{ backgroundColor: '#d7aa47', color: 'white', textAlign: 'center', fontSize: '16px', padding: '15px 0px', zIndex: 0 }} >
                                                                    {stage.name}
                                                                    {leadsByStage[stage._id]?.leads.length > 0 && (
                                                                        <span style={{ fontSize: '14px', color: '#666', marginLeft: '10px', color: 'white', textAlign: 'center' }}>
                                                                            ({leadsByStage[stage._id].leads.length})
                                                                        </span>
                                                                    )}
                                                                </h5>

                                                                <div className='lead_stage_card_main' >
                                                                    {leadsByStage[stage._id] ? (
                                                                        leadsByStage[stage._id].leads
                                                                            ?.filter((lead) =>
                                                                            (lead.client?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                                                                lead.company_Name?.toLowerCase().includes(searchQuery.toLowerCase()))
                                                                            )
                                                                            .map((lead, index) => (
                                                                                <Draggable key={lead._id} draggableId={lead._id} index={index}>
                                                                                    {(provided) => (
                                                                                        <Card
                                                                                            className="lead-card mt-3"
                                                                                            ref={provided.innerRef}
                                                                                            {...provided.draggableProps}
                                                                                            {...provided.dragHandleProps}
                                                                                        >
                                                                                            {/* Labels Section */}
                                                                                            <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', marginTop: '-27px' }}>
                                                                                                {lead.labels.map((labelname, index) => {
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

                                                                                            {/* Lead Info */}
                                                                                            <div style={{ paddingTop: '20px' }}>
                                                                                                <div style={{ width: '100%' }}>
                                                                                                    <Link to={`/single-leads/${lead._id}`} style={{ textDecoration: 'none', color: 'black' }}>
                                                                                                        <p className='mb-1' style={{ color: '#000', fontWeight: '600', fontSize: '14px' }}>
                                                                                                            {lead.company_Name ? lead.company_Name : lead.client?.name && lead.client?.name}
                                                                                                        </p>
                                                                                                    </Link>
                                                                                                </div>
                                                                                            </div>

                                                                                            {/* User Images */}
                                                                                            <div className="image_container">
                                                                                                {lead.selected_users
                                                                                                    .filter((leadImage) => {
                                                                                                        const excludedRoles = ['Developer', 'Marketing', 'CEO', 'MD', 'Super Admin', 'HOD', 'Admin'];
                                                                                                        return !excludedRoles.includes(leadImage?.role);
                                                                                                    })
                                                                                                    .map((leadImage, index) => {
                                                                                                        const imageSrc = leadImage?.image
                                                                                                            ? `${process.env.REACT_APP_BASE_URL}/images/${leadImage?.image}`
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
                                                                                                                    // style={{ width: '100px', height: '100px' }} 
                                                                                                                    />
                                                                                                                </div>
                                                                                                            </OverlayTrigger>
                                                                                                        );
                                                                                                    })}
                                                                                            </div>

                                                                                            {/* Lead Metadata */}
                                                                                            <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-end' }} className='mb-2 mt-2'>

                                                                                                <div style={{ display: 'flex', gap: '5px', width: '100%', justifyContent: 'space-around', alignItems: 'center' }}>
                                                                                                    {
                                                                                                        canAddUserLead && canAddUserLead ?

                                                                                                            <div className="main_lead_users_delete_btn">
                                                                                                                <IoMdAdd style={{ fontSize: '30px', color: 'white', cursor: 'pointer' }} onClick={() => handleAddUserClick(lead._id)} />
                                                                                                            </div>
                                                                                                            :
                                                                                                            null

                                                                                                    }
                                                                                                    <SiImessage className='' style={{ fontSize: '25px', color: '#5c91dc', cursor: 'pointer' }} onClick={() => showLeadDiscussion(lead)} />
                                                                                                    <TbFileDescription className='' style={{ fontSize: '25px', color: '#5c91dc', cursor: 'pointer' }} onClick={() => showLeadDetails(lead)} />
                                                                                                    <div style={{ position: 'relative' }}>
                                                                                                        <IoLogoWhatsapp
                                                                                                            style={{
                                                                                                                color: 'green',
                                                                                                                fontSize: '25px',
                                                                                                                cursor: 'pointer'
                                                                                                            }}
                                                                                                            onClick={() => openWhtsappModal(lead._id, lead.client._id)}
                                                                                                        />
                                                                                                        {messageCounts[lead._id] > 0 && (
                                                                                                            <span
                                                                                                                className='w_message_notification'
                                                                                                                style={{
                                                                                                                    position: 'absolute',
                                                                                                                    top: '-8px',
                                                                                                                    right: '-5px',
                                                                                                                    backgroundColor: 'red',
                                                                                                                    color: 'white',
                                                                                                                    borderRadius: '50%',
                                                                                                                    padding: '2px 6px',
                                                                                                                    fontSize: '8px',
                                                                                                                }}
                                                                                                            >
                                                                                                                {messageCounts[lead._id]}
                                                                                                            </span>
                                                                                                        )}
                                                                                                    </div>
                                                                                                </div>

                                                                                                <div>
                                                                                                    <Dropdown overlay={renderMenu(lead)} trigger={['click']}>
                                                                                                        <BsThreeDotsVertical style={{ cursor: 'pointer', fontSize: '25px' }} />
                                                                                                    </Dropdown>
                                                                                                </div>
                                                                                            </div>

                                                                                            <div
                                                                                                className='marketing_source_lead'
                                                                                                style={{
                                                                                                    backgroundColor:
                                                                                                        lead.lead_type?.name === 'Marketing'
                                                                                                            ? '#1877F2'
                                                                                                            : lead.lead_type?.name === 'Tele Sales'
                                                                                                                ? '#32c5bc'
                                                                                                                : lead.lead_type?.name === 'Others'
                                                                                                                    ? '#f97820'
                                                                                                                    : 'transparent', // fallback for other cases
                                                                                                }}
                                                                                            >
                                                                                                <p className='mb-0 text-center' style={{ fontSize: '11px' }}>
                                                                                                    {`${lead.lead_type?.name && lead.lead_type?.name} / ${lead.source?.name && lead.source?.name}`}
                                                                                                </p>
                                                                                            </div>

                                                                                            {/* Product Stage Lead */}
                                                                                            <div
                                                                                                className='product_stage_lead'
                                                                                                style={{
                                                                                                    backgroundColor:
                                                                                                        lead.pipeline_id?.name === 'Personal Loan'
                                                                                                            ? '#ffa000'
                                                                                                            : lead.pipeline_id?.name === 'EIB Bank'
                                                                                                                ? '#08448c'
                                                                                                                : 'defaultBackgroundColor', // Set a default background color if needed
                                                                                                }}
                                                                                            >
                                                                                                <p className='mb-0 text-center' style={{ fontSize: '11px' }}>
                                                                                                    {lead.pipeline_id?.name && lead.pipeline_id?.name}
                                                                                                </p>
                                                                                            </div>

                                                                                            {/* Transfer Stage Lead */}
                                                                                            {lead.is_transfer && (
                                                                                                <div className='Transfer_stage_lead' onClick={() => TransferMessageModal(lead)}>
                                                                                                    <p className={`mb-0 ${rtl === 'true' ? 'text-right' : 'text-center'}`} style={{ fontSize: '11px', cursor: 'pointer' }}>
                                                                                                        {rtl === 'true' ? 'نموذج التحويل' : 'Transfer Foam'}
                                                                                                    </p>

                                                                                                </div>
                                                                                            )}
                                                                                        </Card>
                                                                                    )}
                                                                                </Draggable>
                                                                            ))
                                                                    ) : (
                                                                        <p className='text-center' style={{ color: 'white' }} >No leads available</p>
                                                                    )}
                                                                </div>
                                                                {provided.placeholder}
                                                            </Card>
                                                        )}
                                                    </Droppable>
                                                ))
                                        ) : (
                                            <p className='mutual_heading_class'>No Stages Available</p>
                                        )}
                                    </div>
                                </DragDropContext>
                            )}
                        </Card>
                    </Col>
                </Row>

                {/* Lead Transfer Message Modal */}
                <Modal
                    size="lg"
                    aria-labelledby="contained-modal-title-vcenter"
                    centered
                    show={leadTransferMessageModal}
                    onHide={() => setLeadTransferMessageModal(false)}
                >
                    <Modal.Header closeButton style={{ border: 'none' }}>
                        <Modal.Title id="contained-modal-title-vcenter" className={`mutual_heading_class ${rtl === 'true' ? 'text-right' : ''}`}>
                            {rtl === 'true' ? 'حالة تحويل القيادة' : 'Lead Transfer Status'}
                        </Modal.Title>
                    </Modal.Header>

                    <Modal.Body className={rtl === 'true' ? 'text-right' : ''}>
                        {/* Lead Transfer From */}
                        <p className='mb-0' style={{ fontWeight: '500', color: '#d7aa47' }}>
                            {rtl === 'true' ? 'تم تحويل القيادة من : ' : 'Lead Transfer From : '}
                        </p>
                        <p className='mutual_heading_class'>
                            {selectedTransferForm ?
                                `${rtl === 'true' ? 'الفرع' : 'Branch'} : ${selectedTransferForm?.transfer_from?.branch?.name} - ${rtl === 'true' ? 'المنتج' : 'Product'} : ${selectedTransferForm?.transfer_from?.products?.name} - ${rtl === 'true' ? 'خط الأنابيب' : 'Pipeline'} : ${selectedTransferForm?.transfer_from?.pipeline?.name} - ${rtl === 'true' ? 'مرحلة المنتج' : 'Product-Stage'} : ${selectedTransferForm?.transfer_from?.product_stage?.name}` :
                                (rtl === 'true' ? 'لم يتم تحديد القيادة.' : 'No lead selected.')}
                        </p>

                        {/* Lead Transfer To */}
                        <p className='mb-0' style={{ fontWeight: '500', color: '#d7aa47' }}>
                            {rtl === 'true' ? 'تم تحويل القيادة إلى : ' : 'Lead Transfer To : '}
                        </p>
                        <p className='mutual_heading_class'>
                            {selectedTransferForm ?
                                `${rtl === 'true' ? 'الفرع' : 'Branch'} : ${selectedTransferForm?.branch?.name} - ${rtl === 'true' ? 'المنتج' : 'Product'} : ${selectedTransferForm?.products?.name} - ${rtl === 'true' ? 'خط الأنابيب' : 'Pipeline'} : ${selectedTransferForm?.pipeline_id?.name} - ${rtl === 'true' ? 'مرحلة المنتج' : 'Product-Stage'} : ${selectedTransferForm?.product_stage?.name}` :
                                (rtl === 'true' ? 'لم يتم تحديد القيادة.' : 'No lead selected.')}
                        </p>

                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <p style={{ fontWeight: '500', color: '#d7aa47' }}>
                                {new Date(selectedTransferForm?.updated_at).toLocaleDateString(rtl === 'true' ? 'ar-EG' : 'en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    hour12: true
                                })}
                            </p>
                        </div>
                    </Modal.Body>

                    <Modal.Footer style={{ border: 'none' }}>
                        <Button onClick={() => setLeadTransferMessageModal(false)} className='all_close_btn_container'>
                            {rtl === 'true' ? 'إغلاق' : 'Close'}
                        </Button>
                    </Modal.Footer>

                </Modal>

                {/* Lead Discussion */}
                <Modal
                    show={leadDiscussionModal}
                    size="lg"
                    aria-labelledby="contained-modal-title-vcenter"
                    centered
                    onHide={() => setLeadDiscussionModal(false)}
                    dir={rtl === 'true' ? "rtl" : "ltr"} // Set direction based on rtl state
                >
                    <Modal.Header closeButton style={{ border: 'none' }} >
                        <Modal.Title id="contained-modal-title-vcenter" style={{ color: "#d7aa47" }}>
                            {rtl === 'true' ? 'مناقشة القيادة' : 'Lead Discussion'}
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Card className="lead_discussion_main_card_main_lead_discussion" style={{ padding: '15px', backgroundColor: '#6c757da2' }}>
                            <Container>
                                <Row>
                                    <Col xs={12}>
                                        <div className="chat-history mb-3" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                            {selectedLeadDiscussion?.discussions?.length > 0 ? (
                                                selectedLeadDiscussion.discussions.map((leadDiscussion, index, array) => {
                                                    // Access items from the end of the array to the beginning
                                                    const discussion = array[array.length - 1 - index];
                                                    const imageSrc = discussion.created_by?.image
                                                        ? `${process.env.REACT_APP_BASE_URL}/images/${discussion.created_by?.image}`
                                                        : default_image;

                                                    return (
                                                        <div key={index} style={{ marginBottom: '15px' }}>
                                                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                                <Image
                                                                    src={imageSrc}
                                                                    alt={discussion.created_by?.name}
                                                                    className="image_control_discussion"
                                                                    style={{ width: '40px', height: '40px', borderRadius: '50%' }}
                                                                />
                                                                <p className="mb-0" style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#ffbf00' }}>
                                                                    {discussion.created_by?.name}
                                                                </p>
                                                            </div>
                                                            <p className="mb-0" style={{ fontSize: '0.75rem', color: '#aeaeae' }}>
                                                                {new Date(discussion?.created_at).toLocaleDateString(rtl === 'true' ? 'ar-EG' : 'en-US', {
                                                                    year: 'numeric',
                                                                    month: 'long',
                                                                    day: 'numeric',
                                                                    hour: '2-digit',
                                                                    minute: '2-digit',
                                                                    hour12: true,
                                                                })}
                                                            </p>
                                                            <p style={{ fontSize: '14px', color: 'white' }} className="mb-4 mt-2">
                                                                {discussion?.comment}
                                                            </p>
                                                        </div>
                                                    );
                                                })
                                            ) : (
                                                <p className='mutual_class_color'>{rtl ? 'لا توجد مناقشات متاحة.' : 'No discussions available.'}</p>
                                            )}
                                        </div>

                                        <div style={{ display: 'flex', alignItems: 'start', justifyContent: 'start' }}>
                                            <div className="w-100">
                                                <Form>
                                                    <Form.Control
                                                        as="textarea"
                                                        placeholder={rtl === 'true' ? 'اترك تعليق هنا' : 'Leave a comment here'}
                                                        rows={1}
                                                        value={discussionText}
                                                        onChange={handleInputChange}
                                                        required
                                                        ref={textareaRef}
                                                        maxLength={300}
                                                        className="w-100 input_field_input_field"
                                                    />
                                                    {error && <div style={{ color: 'red', marginTop: '5px' }}>{error}</div>}
                                                </Form>
                                            </div>
                                            <Button onClick={sendDiscussionMessage} className="all_common_btn_single_lead" style={{ marginRight: '10px' }} >
                                                {rtl === 'true' ? 'إنشاء' : 'Create'}
                                            </Button>
                                        </div>
                                    </Col>
                                </Row>
                            </Container>
                        </Card>
                    </Modal.Body>
                </Modal>

                {/* Lead Description Modal */}
                <Modal
                    size="lg"
                    aria-labelledby="contained-modal-title-vcenter"
                    centered
                    show={openLeadDescriptionModal}
                    onHide={() => setOpenLeadDescriptionModal(false)}
                >
                    <Modal.Header closeButton style={{ border: 'none', direction: rtl === 'true' ? 'rtl' : 'ltr' }} >
                        <Modal.Title
                            id="contained-modal-title-vcenter"
                            style={{ color: "#d7aa47", textAlign: rtl === 'true' ? 'right' : 'left' }}
                        >
                            {rtl === 'true' ? 'تفاصيل العميل' : 'Lead Details'}
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body className={`modal_body_bg_color ${rtl === 'true' ? 'rtl' : 'ltr'}`} style={{ height: '100%', maxHeight: '500px', overflowY: 'auto' }} >
                        {selectedLead ? (
                            <div>
                                {selectedLead.description
                                    ? selectedLead.description.split('\n').map((line, index) => (
                                        <p
                                            key={index}
                                            style={{ fontWeight: index % 2 === 0 ? 'bold' : 'normal' }}
                                            className={`mb-1 ${index % 2 === 0 ? 'mutual_class_color' : 'mutual_heading_class'} ${rtl === 'true' ? 'text-left' : 'text-left'}`}
                                        >
                                            {line}
                                        </p>
                                    ))
                                    : <p className='mutual_class_color' >{rtl === 'true' ? 'لا توجد تفاصيل متاحة.' : 'No description available.'}</p>
                                }
                            </div>
                        ) : (
                            <p>{rtl === 'true' ? 'لم يتم تحديد العميل.' : 'No lead selected.'}</p>
                        )}
                    </Modal.Body>

                </Modal>

                {/* Add user Modal */}
                <Modal
                    size="md"
                    aria-labelledby="contained-modal-title-vcenter"
                    centered
                    show={userModal}
                    onHide={() => setUserModal(false)}
                >
                    <Modal.Header closeButton style={{ border: 'none', direction: rtl === 'true' ? 'rtl' : 'ltr' }}>
                        <Modal.Title id="contained-modal-title-vcenter">
                            <h5 className={rtl === 'true' ? 'mutual_class_color' : 'mutual_class_color'}>
                                {rtl === 'true' ? `إضافة مستخدمين لـ ${selectedLead ? selectedLead.client?.name : 'القيادة'}` : `Add Users for ${selectedLead ? selectedLead.client?.name : 'Lead'}`}
                            </h5>
                        </Modal.Title>
                    </Modal.Header>

                    <Modal.Body className={rtl === 'true' ? 'text-right' : ''}>
                        <Form>
                            <Form.Group className="mb-3">
                                <Form.Label style={{ color: '#fff' }}>
                                    {rtl === 'true' ? 'اختر المستخدمين' : 'Select Users'}
                                </Form.Label>
                                <Select
                                    options={pipelineUsers.map(user => ({
                                        value: user._id,
                                        label: rtl === 'true'
                                            ? `${user.name} (${user.role})`
                                            : `${user.name} (${user.role})`
                                    }))} // Only show users from the same pipeline
                                    value={selectedLeadUsers} // Prepopulate selected users for the lead
                                    onChange={(options) => {
                                        setSelectedLeadUsers(options);
                                        setUserError('');
                                    }}
                                    isMulti // Enable multi-select
                                    placeholder={rtl === 'true' ? 'حدد المستخدمين...' : 'Select users...'}
                                    classNamePrefix="react-select"
                                    className='input_field_input_field'
                                    styles={{ color: 'white' }}
                                />
                                {userError && <div className="text-danger">{userError}</div>}
                            </Form.Group>
                        </Form>
                    </Modal.Body>

                    <Modal.Footer style={{ border: 'none', direction: rtl === 'true' ? 'rtl' : 'ltr' }}>
                        <Button className='all_common_btn_single_lead' onClick={AddUser}>
                            {rtl === 'true' ? 'إرسال' : 'Submit'}
                        </Button>
                        <Button onClick={() => setUserModal(false)} className='all_close_btn_container'>
                            {rtl === 'true' ? 'إغلاق' : 'Close'}
                        </Button>
                    </Modal.Footer>

                </Modal>

                {/* Rejected Modal */}
                <Modal
                    size="md"
                    aria-labelledby="contained-modal-title-vcenter"
                    centered
                    show={rejectedLeadModal}
                    onHide={() => setRejectedLeadModal(false)}
                >
                    <Modal.Header closeButton style={{ border: 'none', direction: rtl === 'true' ? 'rtl' : 'ltr' }}>
                        <Modal.Title id="contained-modal-title-vcenter" className='mutual_heading_class'>
                            {rtl === 'true' ? 'رفض العميل المحتمل' : 'Reject Lead'}
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body className="text-center">
                        <TiDeleteOutline className="text-danger" style={{ fontSize: '4rem' }} />
                        <p>
                            <span style={{ color: 'red', fontWeight: '600' }}>
                                {rtl === 'true' ? 'هل أنت متأكد؟' : 'Are You Sure?'}
                            </span>
                            <br />
                            <span style={{ color: '#fff' }}>
                                {rtl === 'true' ? 'تريد رفض هذا العميل المحتمل' : 'You Want to Reject this Lead'}
                            </span>
                        </p>
                        <Form.Group className="mb-3" controlId="exampleForm.ControlTextarea1">
                            <Form.Control
                                as="textarea"
                                rows={3}
                                placeholder={rtl === 'true' ? 'سبب الرفض' : 'Reason For Rejection'}
                                name="reject_reason"
                                value={rejectLead}
                                onChange={(e) => setRejectLead(e.target.value)}
                                className="input_field_input_field"
                                style={{
                                    textAlign: rtl === 'true' ? 'right' : 'left', // Adjust text alignment
                                    direction: rtl === 'true' ? 'rtl' : 'ltr', // Adjust input direction
                                }}
                            />
                        </Form.Group>
                        {rejectReasonErrorMessage && (
                            <Alert variant="danger" style={{ direction: rtl === 'true' ? 'rtl' : 'ltr' }}>
                                {rejectReasonErrorMessage}
                            </Alert>
                        )}
                    </Modal.Body>
                    <Modal.Footer style={{ border: 'none', direction: rtl === 'true' ? 'rtl' : 'ltr' }}>
                        <Button
                            className='all_close_btn_container'
                            onClick={() => setRejectedLeadModal(false)}
                            style={{
                                textAlign: rtl === 'true' ? 'right' : 'left', // Align text based on direction
                            }}
                        >
                            {rtl === 'true' ? 'إغلاق' : 'Close'}
                        </Button>
                        <Button
                            className='all_common_btn_single_lead'
                            onClick={RejectedLead}
                            style={{
                                textAlign: rtl === 'true' ? 'right' : 'left',
                            }}
                        >
                            {rtl === 'true' ? 'رفض العميل المحتمل' : 'Reject Lead'}
                        </Button>
                    </Modal.Footer>

                </Modal>

                <Modal
                    size="lg"
                    aria-labelledby="contained-modal-title-vcenter"
                    centered
                    show={phoneNumberSuccess}
                    onHide={() => setPhoneumberSuccess(false)}
                >
                    <Modal.Body style={{ borderRadius: '14px' }} >
                        <div >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} className='mb-2'>
                                <h4 className='mutual_heading_class' >Lead Already Exist</h4>
                                {
                                    apiData && apiData.isRejected ?
                                        <Image src={rejected_image} alt='rejected_image' style={{ width: '100px', height: '100px', borderRadius: '50%' }} />
                                        : null
                                }
                            </div>
                            {
                                apiData && (
                                    <>
                                        <Row>
                                            <Col md={6} lg={6}>
                                                <Card className='lead_exist_status modal_body_bg_color'>
                                                    <strong className='text-center mb-2 mutual_class_color' >Client Details</strong>
                                                    <p className='mutual_heading_class' >
                                                        {`Name : ${apiData.companyName ? apiData.companyName : apiData.client.name}`}
                                                    </p>

                                                    <p className='mutual_heading_class'>
                                                        {`Emirates ID : ${apiData.client.e_id ? apiData.client.e_id : 'No Emirates ID'}`}
                                                    </p>

                                                    <p className='mutual_heading_class'>
                                                        {`Email : ${apiData.client.email ? apiData.client.email : 'No Email'}`}
                                                    </p>
                                                </Card>
                                            </Col>

                                            <Col md={6} lg={6}>
                                                <Card className='lead_exist_status modal_body_bg_color'>
                                                    <strong className='text-center mb-2 mutual_class_color' >Lead Details</strong>
                                                    <p className='mutual_heading_class'>
                                                        {`Product :  ${apiData.products.name}`}
                                                    </p>

                                                    <p className='mutual_heading_class'>
                                                        {`PipeLine :  ${apiData.pipeline.name}`}
                                                    </p>

                                                    <p className='mutual_heading_class'>
                                                        {`Product Stage :  ${apiData.productStage.name}`}
                                                    </p>

                                                    <p className='mutual_heading_class'>
                                                        {`Lead Type :  ${apiData.leadType.name}`}
                                                    </p>

                                                    <p className='mutual_heading_class'>
                                                        {`Source :  ${apiData.source.name}`}
                                                    </p>
                                                </Card>
                                            </Col>
                                        </Row>
                                    </>
                                )
                            }

                            <Modal.Footer style={{ border: 'none' }} >
                                <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '10px' }} >
                                    <Button
                                        className="all_close_btn_container"
                                        onClick={() => {
                                            setPhoneumberSuccess(false);
                                            setPhoneNumber(''); // Clear the phone number state as well
                                        }}
                                    >
                                        Close
                                    </Button>
                                    {
                                        apiData && (
                                            <Link className='view_lead_btn_lead_search' to={`/single-leads/${apiData.id}`}>View Lead</Link>
                                        )
                                    }
                                </div>
                            </Modal.Footer>
                        </div>
                    </Modal.Body>
                </Modal>

                {/* productStage modal */}
                <Modal
                    size="sm"
                    aria-labelledby="contained-modal-title-vcenter"
                    centered
                    show={productStageModal}
                    onHide={() => setProductStageModal(false)}
                >
                    <Modal.Body className='text-center'>
                        <RxCross1 style={{ color: "red", fontSize: '100px' }} />
                        <p>
                            {productStageError && productStageError}
                        </p>
                    </Modal.Body>
                </Modal>

                <CreateLead
                    setModal2Open={setModal2Open}
                    modal2Open={modal2Open}
                    fetchLeadsData={fetchLeads}
                    leads={leads}
                />

                <EditLead
                    modalShow={modalShow}
                    setModalShow={setModalShow}
                    leadId={leadId}
                    fetchLeadsData={fetchLeads}
                    rtl={rtl}
                />

                <MoveLeads
                    moveLeadModal={moveLeadModal}
                    setMoveLeadModal={setMoveLeadModal}
                    leadId={leadId}
                    fetchLeadsData={fetchLeads}
                    rtl={rtl}
                />

                <TransferLeads
                    leadId={leadId}
                    fetchLeadsData={fetchLeads}
                    setTransferModal={setTransferModal}
                    transferModal={transferModal}
                    rtl={rtl}
                />

                <ConvertLead rtl={rtl} leadId={leadId} setLeadToContract={setLeadToContract} leadtocontract={leadtocontract} contractModal={contractModal} setContractModal={setContractModal} leads={leads} />

                <DashboardLabels rtl={rtl} leadId={leadId} fetchLeadsData={fetchLeads} labelsDashboardModal={labelsDashboardModal} setLabelsDashBoardModal={setLabelsDashBoardModal} />

                <WhatsappNotification rtl={rtl} leadId={leadId} whtsappModal={whtsappModal} setWhatsAppModal={setWhatsAppModal} clientId={clientId} />
            </Container>
        </div>
    );
};

export default CeoDashboard;
