import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { Container, Row, Col, Card, Form, Modal, Button } from 'react-bootstrap';
import Sidebar from '../Components/sidebar/Sidebar';
import { IoMdAdd } from 'react-icons/io';
import Select from 'react-select';
import { Link } from 'react-router-dom';
import { GrView } from "react-icons/gr";

const UnassignedLead = () => {
    const token = useSelector((state) => state.loginSlice.user?.token);
    const products = useSelector((state) => state.loginSlice.user?.products);
    const branchID = useSelector((state) => state.loginSlice.user?.branch);
    const branches = useSelector((state) => state.loginSlice.branches || []);
    const [leads, setLeads] = useState([]);
    const [filteredLeads, setFilteredLeads] = useState([]); // For displaying filtered leads
    const [leadTypes, setLeadTypes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [allUsers, setAllUsers] = useState([]);
    const [UnassignHodModal, setHodUnassignModal] = useState(false)
    const [userError, setUserError] = useState('');
    const [userModal, setUserModal] = useState(false);
    const [selectedLeadUsers, setSelectedLeadUsers] = useState([]);
    const [selectedLead, setSelectedLead] = useState([]);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [pipelineUsers, setPipelineUsers] = useState([]);
    const [selectedBranchId, setSelectedBranchId] = useState(''); // For selected branch
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUserDescription, setSelectedUserDescription] = useState('')
    const [rtl, setRtl] = useState(null);
    const [selectedProduct, setSelectedProduct] = useState(products[0]?._id || "");
    console.log(products, 'products');

    const handleProductSelect = (id) => {
        setSelectedProduct(id);

        // Filter leads based on the selected product ID
        const filtered = leads.filter((lead) => lead.product_id === id);
        setFilteredLeads(filtered);
    };

    const fetchData = async () => {
        try {
            const response = await axios.get(
                `/api/users/get-users-by-branch/${selectedBranchId}/${selectedProduct}`
            );
            setAllUsers(response.data);
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    useEffect(() => {
        const savedRtl = localStorage.getItem('rtl');
        setRtl(savedRtl); // Update state with the 'rtl' value from localStorage
    }, [rtl]);

    useEffect(() => {
        fetchData();
    }, [selectedProduct, selectedBranchId]);

    // Add User
    const AddUser = async () => {
        setUserError('');

        if (!selectedLeadUsers || selectedLeadUsers.length === 0) {
            setUserError('Please select at least one user before submitting.');
            return;
        }

        try {
            const leadId = selectedLead ? selectedLead._id : null;
            if (!leadId) {
                setUserError('No lead selected.');
                return;
            }

            // Sending the array of userIds and the branchId in one API call
            const userIds = selectedLeadUsers.map(user => user.value); // Extracting user IDs from the selected users
            await axios.put(
                `/api/leads/add-multiple-users-to-lead/${leadId}`,
                { userIds, branchId: selectedBranchId },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            // Clear the selected users and close the modal
            setSelectedLeadUsers([]);
            setUserModal(false);

            // Fetch the unassigned leads after updating
            fetchUnassignedLeads();
        } catch (error) {
            console.error('Error adding users:', error.response?.data?.message || error.message);
            setUserError(error.response?.data?.message || 'An error occurred while adding users.');
        }
    };

    // Fetch lead types
    useEffect(() => {
        const fetchLeadTypes = async () => {
            try {
                const response = await axios.get(`/api/leadtypes/get-all-leadtypes`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setLeadTypes(response.data || []);
            } catch (err) {
                console.error('Error fetching lead types:', err);
                setError('Error fetching lead types');
            }
        };

        if (token) {
            fetchLeadTypes();
        }
    }, [token]);

    // Fetch unassigned leads (fetch all leads initially)
    const fetchUnassignedLeads = async () => {
        if (!selectedProduct || !token) {
            setError('Invalid products or token');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await axios.get(
                `/api/leads/unassigned-leads/${selectedProduct}`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            setLeads(response.data.leads || []);
            setFilteredLeads(response.data.leads || []); // Set all leads initially
        } catch (err) {
            console.error('Error fetching unassigned leads:', err);
            setError('Error fetching unassigned leads');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUnassignedLeads();
    }, [selectedProduct, token]);

    if (loading) {
        return <div>Loading...</div>;
    }

    const handleAddUserClick = (leadId) => {
        const lead = filteredLeads.find((lead) => lead._id === leadId);
        setSelectedLead(lead);
        setSelectedLeadUsers(selectedUsers[leadId] || []);

        const filteredUsers = allUsers.filter((user) =>
            user.pipeline?.[0]?._id === lead.pipeline_id?._id
        );
        setPipelineUsers(filteredUsers);

        setUserModal(true);
    };

    // Filter leads based on the search term
    const filteredLeadsBySearch = filteredLeads.filter((lead) =>
        lead.client?.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const viewDescription = (lead) => {
        setSelectedUserDescription(lead);
        setHodUnassignModal(true);
    };

    return (
        <div>
            {/* <Navbar /> */}
            <Container fluid style={{ direction: rtl === 'true' ? 'rtl' : 'ltr' }} >
                <Row>
                    <Col xs={12} md={12} lg={2}>
                        {/* <Sidebar /> */}
                    </Col>
                    <Col xs={12} md={12} lg={10}>
                        <Card className='leads_main_cards' style={{ maxHeight: '97vh', overflow: 'hidden' }} >
                            <h2 className="text-center mt-1 mutual_heading_class"> {rtl === 'true' ? 'القيادات غير المعينة' : 'Un-Assigned Leads'} </h2>
                            {/* Search Input */}
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: rtl === 'true' ? "flex-start" : "flex-end",
                                    alignItems: "flex-end",
                                    width: "100%",
                                    maxWidth: "500px",
                                    direction: rtl === 'true' ? "rtl" : "ltr",
                                }}
                            >
                                <Form.Group
                                    className="mb-3 mt-3 w-100"
                                    controlId="search"
                                    style={{ textAlign: rtl === 'true' ? "right" : "left" }}
                                >
                                    <Form.Control
                                        type="text"
                                        placeholder={rtl === 'true' ? "البحث عن طريق اسم العميل..." : "Search by client name..."}
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="input_field_input_field"
                                        style={{
                                            textAlign: rtl === 'true' ? "right" : "left",
                                            direction: rtl === 'true' ? "rtl" : "ltr",
                                        }}
                                    />
                                </Form.Group>
                            </div>

                            <div style={{ display: 'flex', gap: '5px' }} className='mb-2'>
                                {products.map((product) => (
                                    <Button
                                        key={product._id}
                                        onClick={() => handleProductSelect(product._id)}
                                        style={{
                                            backgroundColor: product._id === selectedProduct ? "#d7aa47" : "transparent",
                                            color: product._id === selectedProduct ? "#fff" : "#fff",
                                            border: "1px solid #d7aa47",
                                            borderRadius: "5px",
                                            cursor: "pointer",
                                        }}
                                    >
                                        {product.name}
                                    </Button>
                                ))}
                            </div>

                            {/* Display Leads */}
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                {leadTypes && leadTypes.length > 0 ? (
                                    leadTypes.map((leadType) => {
                                        // Filter leads by the lead type and calculate the length
                                        const leadsForThisType = filteredLeadsBySearch
                                            .filter((lead) => lead.lead_type?._id === leadType._id)
                                            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at)); // Sort by created_at

                                        return (
                                            <>
                                                {leadType.name !== "Others" && (
                                                    <Card key={leadType._id} className="mb-3 p-1 unassign_stage-card" style={{ margin: '0 7px', height: 'auto', borderRadius: '20px', maxHeight: '70vh', overflowX: 'hidden' }}>
                                                        <h5 className="sticky-top stageNames" style={{ backgroundColor: '#d7aa47', color: 'white', textAlign: 'center', fontSize: '16px', padding: '15px 0' }}>
                                                            {leadType.name} ({leadsForThisType.length})
                                                        </h5>
                                                        <div className="row">
                                                            {leadsForThisType.map((lead) => (
                                                                <div key={lead._id} className="col-6 mb-2" style={{ width: '45%', padding: '0px 10px 0px 25px' }}>
                                                                    <Card className="lead-card" style={{ width: '100%', maxWidth: '450px', height: '250px', backgroundColor: '#fff' }}>
                                                                        <div>
                                                                            <div style={{ display: 'flex', gap: '5px', justifyContent: 'flex-end', alignItems: 'flex-end' }}>
                                                                                <div className="main_lead_users_delete_btn_unassign">
                                                                                    <IoMdAdd
                                                                                        style={{ fontSize: '20px', color: 'white', cursor: 'pointer' }}
                                                                                        onClick={() => handleAddUserClick(lead._id)}
                                                                                    />
                                                                                </div>
                                                                                <GrView style={{ fontSize: '20px', color: '#ffa000', cursor: 'pointer' }} onClick={() => viewDescription(lead)} />
                                                                            </div>
                                                                            <Link to={`/single-leads/${lead._id}`} style={{ textDecoration: 'none', color: 'black' }}>
                                                                                <p style={{ fontWeight: '600', color: '#ffa000' }} className="text-center mt-2">{lead.client?.name}</p>
                                                                            </Link>

                                                                            <div className="text-center" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
                                                                                <div className="marketing_source_lead_unassign">
                                                                                    <p className="mb-0" style={{ fontSize: '11px' }}>
                                                                                        {lead?.pipeline_id?.name && lead.pipeline_id.name}
                                                                                    </p>
                                                                                    <p className="mb-0" style={{ fontSize: '11px' }}>
                                                                                        {lead?.product_stage?.name && lead.product_stage.name}
                                                                                    </p>
                                                                                </div>
                                                                                <div className="marketing_source_lead_unassign">
                                                                                    <p className="mb-0" style={{ fontSize: '11px' }}>
                                                                                        {lead?.source?.name && lead.source.name}
                                                                                    </p>
                                                                                </div>
                                                                            </div>

                                                                            <p
                                                                                className="text-center mt-4"
                                                                                style={{
                                                                                    fontWeight: '500',
                                                                                    fontSize: '16px',
                                                                                    color: '#979797',
                                                                                    textAlign: rtl === 'true' ? 'right' : 'center',
                                                                                    direction: rtl === 'true' ? 'rtl' : 'ltr',
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

                                                                        </div>
                                                                    </Card>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </Card>
                                                )}
                                            </>
                                        );
                                    })
                                ) : (
                                    <p>No lead types available</p>
                                )}
                            </div>

                        </Card>
                    </Col>
                </Row>
            </Container>


            <Modal show={userModal} onHide={() => setUserModal(false)} centered size="md">
                <Modal.Header
                    closeButton
                    style={{
                        border: 'none',
                        fontWeight: '600',
                        fontSize: '20px',
                        textAlign: rtl === 'true' ? 'right' : 'center',
                        direction: rtl === 'true' ? 'rtl' : 'ltr',
                    }}
                >
                    <Modal.Title style={{ color: '#fff' }} >{rtl === 'true' ? 'إضافة مستخدم' : 'Add User'}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Group>
                        <Form.Label style={{ color: '#fff' }}>{rtl === 'true' ? 'حدد فرعاً' : 'Select Branch'}</Form.Label>
                        <Select
                            options={branches.map((branch) => ({
                                value: branch._id,
                                label: branch.name,
                            }))}
                            value={
                                branches.find((b) => b._id === selectedBranchId)
                                    ? {
                                        value: selectedBranchId,
                                        label: branches.find((b) => b._id === selectedBranchId).name
                                    }
                                    : null
                            }
                            onChange={(selectedOption) => {
                                setSelectedBranchId(selectedOption.value);
                                fetchData(selectedOption.value);
                            }}
                            placeholder={rtl === 'true' ? 'اختر فرعًا' : 'Choose a branch'}
                        />
                    </Form.Group>
                    <Form.Group>
                        <Form.Label style={{ color: '#fff' }}>{rtl === 'true' ? 'اختر المستخدمين' : 'Select Users'}</Form.Label>
                        <Select
                            isMulti
                            options={
                                Array.isArray(allUsers) && allUsers.length > 0
                                    ? allUsers.map((user) => ({
                                        value: user._id,
                                        label: `${user.name} (${user.role})`
                                    }))
                                    : [] // If allUsers is not an array or is empty, use an empty array for options
                            }
                            value={selectedLeadUsers}
                            onChange={(selectedOptions) => setSelectedLeadUsers(selectedOptions)}
                            placeholder={rtl === 'true' ? 'حدد المستخدمين' : 'Select users'}
                        />
                    </Form.Group>

                    {userError && <p style={{ color: 'red' }}>{userError}</p>}
                </Modal.Body>
                <Modal.Footer style={{ border: 'none' }}>
                    <Button variant="secondary" onClick={() => setUserModal(false)}>
                        {rtl === 'true' ? 'إلغاء' : 'Cancel'}
                    </Button>
                    <Button variant="primary" onClick={AddUser}>
                        {rtl === 'true' ? 'إضافة' : 'Add'}
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Selected User Modal Description */}
            <Modal
                size="lg"
                aria-labelledby="contained-modal-title-vcenter"
                centered
                show={UnassignHodModal}
                onHide={() => setHodUnassignModal(false)}
            >
                <Modal.Header
                    closeButton
                    style={{
                        border: 'none',
                        textAlign: rtl === 'true' ? 'right' : 'left',
                        direction: rtl === 'true' ? 'rtl' : 'ltr',
                    }}
                >
                    <Modal.Title id="contained-modal-title-vcenter" className="mutual_heading_class">
                        {rtl === 'true' ? 'وصف العميل المحتمل' : 'Lead Description'}
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
                                <li className="mutual_heading_class" key={index}>
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
                    <Button className="all_close_btn_container" onClick={() => setHodUnassignModal(false)}>
                        {rtl === 'true' ? 'إغلاق' : 'Close'}
                    </Button>
                </Modal.Footer>
            </Modal>


        </div>
    );
};

export default UnassignedLead;
