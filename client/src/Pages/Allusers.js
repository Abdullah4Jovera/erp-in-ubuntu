import React, { useState, useEffect } from 'react';
import { Button, Modal, Form, Image, Row, Col, Card, Container } from 'react-bootstrap';
import axios from 'axios';
import default_image from '../Assets/default_image.jpg'
import { useSelector } from 'react-redux';
import { TiDeleteOutline } from "react-icons/ti";
import Select from 'react-select';
import Sidebar from '../Components/sidebar/Sidebar';
import './style.css'

const AllUsers = () => {
    const branchNames = useSelector(state => state.loginSlice.branches);
    const productNames = useSelector(state => state.loginSlice.products);
    const [selectedBranch, setSelectedBranch] = useState('');
    const [selectedProduct, setSelectedProduct] = useState('');
    const [users, setUsers] = useState([]);
    const [pipelines, setPipelines] = useState([]);
    const [branches, setBranches] = useState([]);
    const [roles, setRoles] = useState([]); // New state for roles
    const [showModal, setShowModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [deleteModal, setdeleteModal] = useState(false)
    const [createModal, setCreateModal] = useState(false)
    const [userId, setUserId] = useState('')
    const [errors, setErrors] = useState({}); // Validation state
    const [passwords, setPasswords] = useState({ newPassword: '', confirmPassword: '' });
    const [isPasswordModalVisible, setIsPasswordModalVisible] = useState(false)
    const [resetPasswordError, setResetPasswordError] = useState('')
    const [resignModal, setResignModal] = useState(false)
    const [products, setProducts] = useState([])

    const [replacementUserId, setReplacementUserId] = useState(null);

    const [formData, setFormData] = useState({
        name: '',
        pipeline: [],
        email: '',
        password: '',
        image: '',
        role: '', // Role field
        branch: [],
        permissions: [],
        delstatus: false,
        verified: false,
        products: [],
        phone: '',
        target: '',
    });
    const token = useSelector(state => state.loginSlice.user?.token);

    // State for form values
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [phone, setPhone] = useState('');
    const [target, setTarget] = useState('');
    const [role, setRole] = useState(null);
    const [branch, setBranch] = useState(null);
    const [pipeline, setPipeline] = useState(null);
    const [product, setProduct] = useState(null);
    const [image, setImage] = useState(null);

    const fetchProducts = async () => {
        try {
            const response = await axios.get(`/api/products/get-all-products-admin`)
            setProducts(response.data)
        } catch (error) {
            console.log(error)
        }
    }

    // Fetch all users
    const fetchUsers = async () => {
        try {
            const response = await axios.get(`/api/users/get-users`);
            setUsers(response.data);
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };
    useEffect(() => {
        fetchUsers();
        fetchProducts()
    }, []);

    // Fetch pipelines, branches, products, and roles
    useEffect(() => {
        const fetchPipelines = async () => {
            try {
                const response = await axios.get(`/api/pipelines/get-pipelines`);
                setPipelines(response.data);
            } catch (error) {
                console.error('Error fetching pipelines:', error);
            }
        };

        const fetchBranches = async () => {
            try {
                const response = await axios.get(`/api/branch/get-branches`);
                setBranches(response.data);
            } catch (error) {
                console.error('Error fetching branches:', error);
            }
        };



        const fetchRoles = async () => {
            try {
                const response = await axios.get(`/api/roles`);
                setRoles(response.data); // Store roles in state
            } catch (error) {
                console.error('Error fetching roles:', error);
            }
        };

        fetchPipelines();
        fetchBranches();
        fetchProducts();
        fetchRoles(); // Fetch roles
    }, []);

    // Handle input change
    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        console.log(name, value, 'namevalue')
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value,
        });
    };

    // Open modal and populate form data with the selected user's data
    const handleEditClick = (user) => {
        console.log(user, 'edituser')
        setSelectedUser(user);
        setFormData({
            name: user.name || '',
            pipeline: user.pipeline.map(p => p._id) || [], // Extract pipeline IDs for default values
            email: user.email || '',
            password: '',
            image: user.image || '',
            role: user?.role || '', // Set role from user data
            branch: user?.branch?.map(b => b._id) || [],
            products: user?.products?.map(product => product._id) || [], // Set product ID or null
            // user.products.map(product => product._id) || [],
            permissions: user?.permissions || [], // Ensure permissions is an array
            delstatus: user.delstatus || false,
            verified: user.verified || false,
            phone: user.phone || '',
            target: user.target || '',
            image: user.image || null
        });
        setShowModal(true);
    };

    // Update user
    const handleUpdateUser = async (e) => {
        e.preventDefault();

        // Set null values for products and pipeline if "No Product" or "No Pipeline" is selected
        const updatedFormData = {
            ...formData,
            branch: formData.branch && formData.branch.length > 0 ? formData.branch : [], // Ensure it's an empty array if no branches are selected
            products: formData.products && formData.products.length > 0 ? formData.products : [], // Ensure products is an array
            pipeline: formData.pipeline && formData.pipeline.length > 0 ? formData.pipeline : [], // Ensure pipeline is an array
        };

        try {
            const response = await axios.put(
                `/api/users/update-user/${selectedUser._id}`,
                updatedFormData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
            );
            setUsers((prevUsers) =>
                prevUsers.map((user) =>
                    user._id === selectedUser._id ? response.data : user
                )
            );
            setShowModal(false);
            fetchUsers();
        } catch (error) {
            console.error('Error updating user:', error);
        }
    };

    const openDeleteModal = (user) => {
        setUserId(user)
        setdeleteModal(true)
    }

    // Delete User API
    const handleDeleteClick = async (id) => {
        try {
            await axios.put(`/api/users//delete-user/${id}`, {}, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
            fetchUsers();
            setdeleteModal(false)
        } catch (error) {
            console.log(error, 'err')
        }
    }
    // Handle form submission
    // Handle user creation
    const handleCreateUser = async (e) => {
        e.preventDefault(); // Prevent default form submission

        // Validate required fields
        const newErrors = {};
        if (!name) newErrors.name = 'Name is required';
        if (!email) newErrors.email = 'Email is required';
        if (!password) newErrors.password = 'Password is required';
        if (!phone) newErrors.phone = 'Phone is required';
        if (!role) newErrors.role = 'Role is required';
        if (!branch || branch.length === 0) newErrors.branch = 'At least one branch is required';
        // if (!product || product.length === 0) newErrors.product = 'At least one product is required';
        // if (!pipeline || pipeline.length === 0) newErrors.pipeline = 'At least one pipeline is required';
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors); // Set validation errors
            return; // Stop form submission
        }

        // Prepare form data
        const formData = new FormData();
        formData.append('name', name);
        formData.append('email', email);
        formData.append('password', password);
        formData.append('phone', phone);
        formData.append('target', target);
        formData.append('role', role?.value);
        formData.append('image', image);

        // Append branches as an array
        const branchIds = branch.map((b) => b.value); // Extract only the `value` from selected options
        formData.append('branch', JSON.stringify(branchIds)); // Send as a JSON string

        // Append products as an array
        const productIds = product.map((p) => p.value); // Extract only the `value` from selected options
        formData.append('products', JSON.stringify(productIds)); // Send as a JSON string

        // Append pipelines as an array
        const pipelineIds = pipeline.map((p) => p.value); // Extract pipeline IDs
        formData.append('pipeline', JSON.stringify(pipelineIds)); // Send as JSON string

        try {
            const response = await axios.post(
                `/api/users/create-user`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );
            setCreateModal(false); // Close modal on success
            fetchUsers(); // Fetch the updated user list
            resetFormFields(); // Clear the form state
        } catch (error) {
            console.error('Error creating user:', error);
        }
    };

    // User Role
    const roleOptions = roles.map((role) => ({
        value: role.role,
        label: role.role,
    }));

    // Branch options
    const branchOptions = branches.map((branch) => ({
        value: branch._id,
        label: branch.name,
    }));

    // User Product
    const productOptions = products.map((product) => ({
        value: product._id,
        label: product.name,
    }));

    // User Pipeline
    const pipelineOptions = pipelines.map((pipeline) => ({
        value: pipeline._id,
        label: pipeline.name,
    }));

    // Field-specific onChange handlers
    const handleNameChange = (e) => {
        setName(e.target.value);
        if (errors.name) setErrors((prev) => ({ ...prev, name: '' }));
    };

    const handleEmailChange = (e) => {
        setEmail(e.target.value);
        if (errors.email) setErrors((prev) => ({ ...prev, email: '' }));
    };

    const handlePasswordChange = (e) => {
        setPassword(e.target.value);
        if (errors.password) setErrors((prev) => ({ ...prev, password: '' }));
    };

    const handlePhoneChange = (e) => {
        setPhone(e.target.value);
        if (errors.phone) setErrors((prev) => ({ ...prev, phone: '' }));
    };

    const handleTargetChange = (e) => {
        setTarget(e.target.value);
        if (errors.target) setErrors((prev) => ({ ...prev, target: '' }));
    };

    const handleRoleChange = (selectedOption) => {
        setRole(selectedOption);
        if (errors.role) setErrors((prev) => ({ ...prev, role: '' }));
    };

    // Handle branch change
    const handleBranchChange = (selectedOptions) => {
        setBranch(selectedOptions); // Store the selected options as an array
        // if (errors.branch) setErrors((prev) => ({ ...prev, branch: '' }));
    };

    const handleProductChange = (selectedOption) => {
        setProduct(selectedOption);
        // if (errors.product) setErrors((prev) => ({ ...prev, product: '' }));
    };

    const handlePipelineChange = (selectedOption) => {
        setPipeline(selectedOption);
        // if (errors.pipeline) setErrors((prev) => ({ ...prev, pipeline: '' }));
    };

    const handleImageUpload = (e) => {
        setImage(e.target.files[0]);
    };

    const resetFormFields = () => {
        setName('');
        setEmail('');
        setPassword('');
        setPhone('');
        setTarget('');
        setRole(null);
        setBranch(null);
        setPipeline(null);
        setProduct(null);
        setImage(null);
        setErrors({}); // Reset errors
    };

    const openResetPasswordModal = (user) => {
        setUserId(user)
        setIsPasswordModalVisible(true)
    }

    // Reset Password API
    const handlePasswordReset = async (id) => {
        if (passwords.newPassword !== passwords.confirmPassword) {
            setResetPasswordError('Passwords do not match')
            return;
        }

        try {
            const response = await axios.put(
                `/api/users/reset-password/${id}`,
                { password: passwords.newPassword },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response.status === 200) {
                // message.success('Password reset successfully');
            }
        } catch (error) {
            // message.error('Failed to reset password');
        } finally {
            setIsPasswordModalVisible(false);
            setPasswords({ newPassword: '', confirmPassword: '' });
            setSelectedUser(null);
        }

        // Hide error message after 5 seconds
        setTimeout(() => {
            setResetPasswordError('');
        }, 3000);
    };

    const handleResetPasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswords({ ...passwords, [name]: value });

        // Clear error when fields have values
        if (value) {
            setErrors({ ...errors, [name]: false, matchError: false });
        }
    };

    const handleImageChange = (e) => {
        setFormData((prevData) => ({
            ...prevData,
            image: e.target.files[0]
        }));
    };

    // Open resign modal
    const openResignModal = (id) => {
        setUserId(id);
        setReplacementUserId(null); // Reset selection
        setResignModal(true);
    };
    const ResignHandler = async () => {
        try {
            const payload = replacementUserId ? { replacementUserId } : {};
            const response = await axios.patch(
                `/api/users/resign-user/${userId}`,
                payload
            );

            console.log(response.data.message);
            // Handle success (e.g., show a toast or update the UI)
        } catch (error) {
            console.error('Error resigning user:', error.response?.data?.message || error.message);
            // Handle error (e.g., show an error toast)
        } finally {
            setResignModal(false);
        }
    };

    // Format users for React-Select
    const userOptions = users.map((user) => ({
        value: user._id,
        label: user.name,
    }));

    // Filter users based on selected branch and product
    const filteredUsers = users.filter((user) => {
        const matchesBranch = selectedBranch ? user.branch?.name === selectedBranch : true;
        const matchesProduct = selectedProduct ? user.products?.name === selectedProduct : true;
        return matchesBranch && matchesProduct;
    });


    return (
        <div>
            <Container fluid >
                <Row>
                    <Col xs={12} md={12} lg={2} >
                        {/* <Sidebar /> */}
                    </Col>

                    <Col xs={12} md={12} lg={10}>
                        <Card className='leads_main_cards'>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} >
                                <h1>All Users</h1>
                                <Button variant="primary" onClick={() => setCreateModal(true)}>
                                    Create
                                </Button>
                            </div>

                            <div style={{ display: 'flex', gap: '5px' }}>
                                <Button
                                    variant="outline-primary"
                                    onClick={() => {
                                        setSelectedBranch('');
                                        setSelectedProduct('');
                                    }}
                                    active={!selectedBranch && !selectedProduct}
                                >
                                    All
                                </Button>

                                {/* Branch Selection Buttons */}
                                {Array.isArray(branchNames) && branchNames.length > 0 && (
                                    <div style={{ display: 'flex', gap: '5px' }} className="mt-2">
                                        {branchNames.map(branch => (
                                            <Button
                                                key={branch._id}
                                                variant="outline-primary"
                                                onClick={() => setSelectedBranch(branch.name)}
                                                active={selectedBranch === branch.name}
                                            >
                                                {branch.name}
                                            </Button>
                                        ))}
                                    </div>
                                )}

                                {/* Product Selection Buttons */}
                                {Array.isArray(productNames) && productNames.length > 0 && (
                                    <div style={{ display: 'flex', gap: '5px' }} className="mt-2">
                                        {productNames.map(product => (
                                            <Button
                                                key={product._id}
                                                variant="outline-primary"
                                                onClick={() => setSelectedProduct(product.name)}
                                                active={selectedProduct === product.name}
                                            >
                                                {product.name}
                                            </Button>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <Row>
                                {filteredUsers.map(user => (
                                    <Col key={user._id} xs={12} sm={6} md={4} lg={3} className="mt-3">
                                        <Card
                                            style={{
                                                width: '100%',
                                                height: '100%',
                                                borderRadius: '8px',
                                                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                                            }}
                                        >
                                            <Card.Body>
                                                <Image
                                                    src={user.image || default_image}
                                                    alt="user_image"
                                                    style={{ width: '100px', height: '100px', borderRadius: '50%' }}
                                                />
                                                <div>
                                                    {user.name} - {user.email} - {user.role}
                                                </div>
                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                                                    <Button variant="primary" onClick={() => handleEditClick(user)}>
                                                        Edit
                                                    </Button>
                                                    <Button variant="danger" onClick={() => openDeleteModal(user._id)}>
                                                        Delete
                                                    </Button>
                                                    <Button variant="primary" onClick={() => openResignModal(user._id)}>
                                                        Resign
                                                    </Button>
                                                    <Button variant="primary" onClick={() => openResetPasswordModal(user._id)}>
                                                        Reset Password
                                                    </Button>
                                                </div>
                                            </Card.Body>
                                        </Card>
                                    </Col>
                                ))}
                            </Row>
                        </Card>
                    </Col>
                </Row>
            </Container>

            {/* Modal for editing user */}
            <Modal show={showModal} onHide={() => setShowModal(false)} centered size='lg'>
                <Modal.Header closeButton>
                    <Modal.Title>Edit User</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleUpdateUser}>
                        <Row>
                            <Col md={6}>
                                <Form.Group controlId="formName">
                                    <Form.Label>Name</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group controlId="formEmail">
                                    <Form.Label>Email</Form.Label>
                                    <Form.Control
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        <Row>
                            <Col md={6}>
                                <Form.Group controlId="formRole">
                                    <Form.Label>Role</Form.Label>
                                    <Form.Control
                                        as="select"
                                        name="role"
                                        value={formData.role || 'null'} // Default to "null" if no role is selected
                                        onChange={handleInputChange}
                                    >
                                        <option value="null">No Role</option> {/* No Role option */}
                                        {roles.map((role) => (
                                            <option key={role.role} value={role.role}>
                                                {role.role}
                                            </option>
                                        ))}
                                    </Form.Control>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group controlId="formBranch">
                                    <Form.Label>Branch</Form.Label>
                                    <Select
                                        options={branchOptions} // Options for react-select
                                        name="branch"
                                        value={branchOptions.filter((option) =>
                                            formData.branch?.includes(option.value)
                                        )}
                                        onChange={(selectedOption) => {
                                            // When multi-select, collect all selected values
                                            const selectedValues = selectedOption.map(option => option.value);
                                            handleInputChange({ target: { name: 'branch', value: selectedValues } });
                                        }}
                                        placeholder="Select a branch"
                                        isMulti
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        <Row>
                            <Col md={6}>
                                <Form.Group controlId="formProducts">
                                    <Form.Label>Products</Form.Label>
                                    <Select
                                        options={productOptions} // Options for react-select
                                        name="products"
                                        value={productOptions.filter((option) =>
                                            formData.products?.includes(option.value)
                                        )}
                                        onChange={(selectedOption) => {
                                            // When multi-select, collect all selected values
                                            const selectedValues = selectedOption.map(option => option.value);
                                            handleInputChange({ target: { name: 'products', value: selectedValues } });
                                        }}
                                        placeholder="Select a product"
                                        isMulti
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group controlId="formPhone">
                                    <Form.Label>Phone</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        <Row>
                            <Col md={6}>
                                <Form.Group controlId="formPipeline">
                                    <Form.Label>Pipeline</Form.Label>
                                    <Select
                                        options={pipelineOptions} // Options for react-select
                                        name="pipeline"
                                        value={pipelineOptions.filter((option) =>
                                            formData.pipeline?.includes(option.value)
                                        )}
                                        onChange={(selectedOption) => {
                                            // When multi-select, collect all selected values
                                            const selectedValues = selectedOption.map(option => option.value);
                                            setFormData({ ...formData, pipeline: selectedValues });
                                        }}
                                        placeholder="Select a pipeline"
                                        isMulti
                                    />
                                </Form.Group>
                            </Col>

                            <Col md={6}>
                                <Form.Group controlId="formPhone">
                                    <Form.Label>Target</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="target"
                                        value={formData.target}
                                        onChange={handleInputChange}
                                    />
                                </Form.Group>
                            </Col>

                        </Row>
                        <Row>
                            <Col md={12}>
                                <Form.Group controlId="formImage">
                                    <Form.Label>Image</Form.Label>
                                    <Form.Control
                                        type="file"
                                        name="image"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        <Modal.Footer>
                            <Button className='all_close_btn_container' onClick={() => setShowModal(false)} >Close</Button>
                            <Button className='all_single_leads_button' type="submit">Update</Button>
                        </Modal.Footer>
                    </Form>
                </Modal.Body>
            </Modal>

            {/* Delete Modal */}
            <Modal
                size="sm"
                aria-labelledby="contained-modal-title-vcenter"
                centered
                show={deleteModal}
                onHide={() => setdeleteModal(false)}
            >
                <Modal.Header closeButton>
                    <Modal.Title id="contained-modal-title-vcenter">
                        Delete User
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className="text-center">
                    <TiDeleteOutline className="text-danger" style={{ fontSize: '4rem' }} />
                    <p>Are you sure you want to delete this user?</p>
                </Modal.Body>
                <Modal.Footer>
                    <Button className='all_close_btn_container' onClick={() => setdeleteModal(false)} >Close</Button>
                    <Button className='all_single_leads_button' onClick={() => handleDeleteClick(userId)} >Delete</Button>
                </Modal.Footer>
            </Modal>

            {/* Create Modal */}
            <Modal
                size="lg"
                aria-labelledby="contained-modal-title-vcenter"
                centered
                show={createModal}
                onHide={() => setCreateModal(false)}
            >
                <Modal.Header closeButton style={{ border: 'none' }} >
                    <Modal.Title id="contained-modal-title-vcenter" style={{ color: '#fff' }}>
                        User Details
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleCreateUser}>
                        <Row className="mb-3">
                            <Col md={6}>
                                <Form.Group controlId="formName">
                                    <Form.Label style={{ color: '#fff' }}>Name</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Enter name"
                                        value={name}
                                        onChange={handleNameChange}
                                        required
                                    />
                                    {errors.name && <small className="text-danger">{errors.name}</small>}
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group controlId="formEmail">
                                    <Form.Label style={{ color: '#fff' }}>Email</Form.Label>
                                    <Form.Control
                                        type="email"
                                        placeholder="Enter email"
                                        value={email}
                                        onChange={handleEmailChange}
                                        required
                                    />
                                    {errors.email && <small className="text-danger">{errors.email}</small>}
                                </Form.Group>
                            </Col>
                        </Row>

                        <Row className="mb-3">
                            <Col md={6}>
                                <Form.Group controlId="formPassword">
                                    <Form.Label style={{ color: '#fff' }}>Password</Form.Label>
                                    <Form.Control
                                        type="password"
                                        placeholder="Enter password"
                                        value={password}
                                        onChange={handlePasswordChange}
                                        required
                                    />
                                    {errors.password && <small className="text-danger">{errors.password}</small>}
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group controlId="formPhone">
                                    <Form.Label style={{ color: '#fff' }}>Phone</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Enter phone number"
                                        value={phone}
                                        onChange={handlePhoneChange}
                                        required
                                    />
                                    {errors.phone && <small className="text-danger">{errors.phone}</small>}
                                </Form.Group>
                            </Col>
                        </Row>

                        <Row className="mb-3">
                            <Col md={6}>
                                <Form.Group controlId="formRole">
                                    <Form.Label style={{ color: '#fff' }}>Role</Form.Label>
                                    <Select
                                        options={roleOptions}
                                        placeholder="Select role"
                                        value={role}
                                        onChange={handleRoleChange}
                                        isClearable
                                        required
                                    />
                                    {errors.role && <small className="text-danger">{errors.role}</small>}
                                </Form.Group>
                            </Col>

                            <Col md={6}>
                                <Form.Group controlId="formBranch">
                                    <Form.Label style={{ color: '#fff' }}>Branch</Form.Label>
                                    <Select
                                        options={branchOptions}
                                        placeholder="Select branch"
                                        value={branch}
                                        onChange={handleBranchChange}
                                        isClearable
                                        isMulti
                                    />
                                    {errors.branch && <small className="text-danger">{errors.branch}</small>}
                                </Form.Group>
                            </Col>
                        </Row>

                        <Row className="mb-3">
                            <Col md={6}>
                                <Form.Group controlId="formProduct">
                                    <Form.Label style={{ color: '#fff' }}>Product</Form.Label>
                                    <Select
                                        options={productOptions}
                                        placeholder="Select product"
                                        value={product}
                                        onChange={handleProductChange}
                                        isClearable
                                        isMulti
                                    />
                                    {errors.product && <small className="text-danger">{errors.product}</small>}
                                </Form.Group>
                            </Col>

                            <Col md={6}>
                                <Form.Group controlId="formPipeline">
                                    <Form.Label style={{ color: '#fff' }}>Pipeline</Form.Label>
                                    <Select
                                        options={pipelineOptions}
                                        placeholder="Select pipeline"
                                        value={pipeline}
                                        onChange={handlePipelineChange}
                                        isClearable
                                        isMulti
                                    />
                                    {errors.pipeline && <small className="text-danger">{errors.pipeline}</small>}
                                </Form.Group>
                            </Col>
                        </Row>

                        <Row className="mb-3">
                            <Col md={6}>
                                <Form.Group controlId="formTarget">
                                    <Form.Label style={{ color: '#fff' }}>Target</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Enter Target"
                                        value={target}
                                        onChange={handleTargetChange}

                                    />
                                    {errors.target && <small className="text-danger">{errors.target}</small>}
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group controlId="formImage">
                                    <Form.Label style={{ color: '#fff' }}>Image</Form.Label>
                                    <Form.Control
                                        type="file"
                                        onChange={handleImageUpload}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        <Modal.Footer style={{ border: 'none' }}>
                            <Button className="all_close_btn_container" onClick={() => setCreateModal(false)}>
                                Close
                            </Button>
                            <Button type="submit" className='all_single_leads_button'>Create User</Button>
                        </Modal.Footer>
                    </Form>
                </Modal.Body>
            </Modal>

            {/* Reset Passowrd Modal */}
            <Modal
                show={isPasswordModalVisible}
                onHide={() => setIsPasswordModalVisible(false)}
                centered
            >
                <Modal.Header closeButton>
                    <Modal.Title>Reset Password</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group controlId="newPassword">
                            <Form.Label>New Password</Form.Label>
                            <Form.Control
                                type="password"
                                name="newPassword"
                                value={passwords.newPassword}
                                onChange={handleResetPasswordChange}
                                required
                            />
                        </Form.Group>
                        <Form.Group controlId="confirmPassword">
                            <Form.Label>Confirm Password</Form.Label>
                            <Form.Control
                                type="password"
                                name="confirmPassword"
                                value={passwords.confirmPassword}
                                onChange={handleResetPasswordChange}
                                required
                            />
                        </Form.Group>
                    </Form>
                    {resetPasswordError && <div className="alert alert-danger mt-2">{resetPasswordError}</div>}
                </Modal.Body>
                <Modal.Footer>
                    <Button className='all_close_btn_container' onClick={() => setIsPasswordModalVisible(false)}>
                        Cancel
                    </Button>
                    <Button className='all_single_leads_button' onClick={() => handlePasswordReset(userId)}>
                        Reset Password
                    </Button>
                </Modal.Footer>
            </Modal>

            <Modal
                size="sm"
                aria-labelledby="contained-modal-title-vcenter"
                centered
                show={resignModal}
                onHide={() => setResignModal(false)}
            >
                <Modal.Header closeButton>
                    <Modal.Title id="contained-modal-title-vcenter">
                        Resign Modal
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>Are you sure you want to resign this user?</p>
                    <Select
                        options={userOptions}
                        onChange={(selectedOption) =>
                            setReplacementUserId(selectedOption?.value || null)
                        }
                        placeholder="Select Replacement User (optional)"
                        isClearable
                    />
                </Modal.Body>
                <Modal.Footer>
                    <Button onClick={() => setResignModal(false)}>No</Button>
                    <Button onClick={ResignHandler}>Yes</Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default AllUsers;
// 509133445