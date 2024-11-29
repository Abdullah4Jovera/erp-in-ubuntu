import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, Modal, Button, Form, Container, Row, Col, Card, ListGroup, Image } from 'react-bootstrap';
import Select from 'react-select';
import { MdAdd } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import { FiEdit2 } from "react-icons/fi";
import defaultimage from '../../Assets/default_image.jpg';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useSelector } from 'react-redux';
import Sidebar from '../../Components/sidebar/Sidebar';
import { IoOpenOutline } from "react-icons/io5";
import './phoneBookstyle.css'
import CreatePhoneBook from './CreatePhoneBook';
import { BsThreeDotsVertical } from "react-icons/bs";
import { Dropdown, Menu } from 'antd';

const HodPhoneBook = () => {
    const token = useSelector(state => state.loginSlice.user?.token);
    const role = useSelector(state => state.loginSlice.user?.role)
    const userID = useSelector(state => state.loginSlice.user?._id)
    const piprlineID = useSelector(state => state.loginSlice.user?.pipeline)

    const [hodData, setHodData] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [userRoleOptions, setUserRoleOptions] = useState([]);
    const [error, setError] = useState(null);
    const [showViewCommentModal, setShowViewCommentModal] = useState(false);
    const [commentsToView, setCommentsToView] = useState([]);
    const [hasAccess, setHasAccess] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [selectedCalStatus, setSelectedCalStatus] = useState(null);
    const [filteredPhonebookData, setFilteredPhonebookData] = useState([]);
    const [currentComment, setCurrentComment] = useState('');
    const [selectedEntry, setSelectedEntry] = useState(null);
    const [dropdownEntry, setDropdownEntry] = useState(null);
    const [pendingStatusChange, setPendingStatusChange] = useState(null);
    const [showConvertModal, setShowConvertModal] = useState(false);
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [showImportModal, setShowImportModal] = useState(false);
    const [csvFile, setCsvFile] = useState(null);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [selectedAgent, setSelectedAgent] = useState(null);
    const [phoneBookModal, setPhoneBookModal] = useState(false)
    const [phoneBookNumber, setPhoneBookNumber] = useState('')
    const [phoneID, setPhoneID] = useState('')
    const [insertSkipNumber, setInsertSkipNumber] = useState(false)
    const [insertedNumbers, setInsertedNumbers] = useState([]);
    const [skippedNumbers, setSkippedNumbers] = useState([]);
    const [message, setMessage] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [showCommentsModal, setShowCommentsModal] = useState(false);
    const entriesPerPage = 13;
    const totalPages = Math.ceil(filteredPhonebookData.length / entriesPerPage);
    const [rtl, setRtl] = useState(null);
    const [currentIdForComments, setCurrentIdForComments] = useState(null);
    const [calStatus, setCalStatus] = useState('');
    const navigate = useNavigate();
    const isSubmitDisabled = !(selectedAgent && csvFile);

    const allowedRoles = [
        'HOD',
        'Team Leader',
        'Manager',
        'Coordinator',
        'CEO'
    ];

    const calStatusOptions = [
        {
            value: 'Req to call',
            label: rtl === 'true' ? 'طلب الاتصال' : 'Req to call'  // Localized label for 'Req to call'
        },
        {
            value: 'No Answer',
            label: rtl === 'true' ? 'مرفوض' : 'No Answer'  // Localized label for 'Rejected'
        },
        {
            value: 'Not Interested',
            label: rtl === 'true' ? 'مرفوض' : 'Not Interested'  // Localized label for 'Rejected'
        },
    ];

    const getHodPhoneBookData = async () => {
        try {
            const response = await axios.get(
                `${process.env.REACT_APP_BASE_URL}/api/phonebook/get-all-phonebook`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            // Filter out entries with 'Convert to Lead' without altering the order
            const filteredData = response.data.filter(
                (entry) => entry.calstatus !== 'Convert to Lead'
            );

            // Preserve the current order of `setFilteredPhonebookData` if it exists, otherwise set filtered data
            setFilteredPhonebookData((prevData) => {
                if (prevData.length > 0) {
                    // Map existing order with updated data to avoid reordering
                    return prevData.map((prevEntry) =>
                        filteredData.find((entry) => entry._id === prevEntry._id) || prevEntry
                    );
                } else {
                    return filteredData;
                }
            });

            // For HOD-specific data, use filtered data directly
            setHodData(filteredData);

            // Fetch all users if necessary
            getAllUsers(token);
        } catch (error) {
            console.error('Error fetching HOD Phone Book data:', error);
            setError('No Phone Book Data Available.');
        }
    };


    const getAllUsers = async () => {
        try {
            const response = await axios.get(
                `${process.env.REACT_APP_BASE_URL}/api/users/get-users`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            const users = response.data;
            // Filter and map for users with role 'Ts Agent' or 'Sales'
            const userOptions = users
                .filter(user => user.role === 'TS Agent' || user.role === 'Sales')
                .map(user => ({
                    value: user._id,
                    label: user.name,
                }));
            // Filter and map for users with roles 'Ts Team Leader', 'Team Leader', or 'Coordinator'
            const userRoleOptions = users
                .filter(
                    user =>
                        user.role === 'TS Team Leader' ||
                        user.role === 'Team Leader' ||
                        user.role === 'Coordinator'
                )
                .map(user => ({
                    value: user._id,
                    label: user.name,
                }));
            // Update state with filtered user options
            setAllUsers(userOptions);
            setUserRoleOptions(userRoleOptions); // New state for team leaders/coordinators

        } catch (error) {
            console.error('Error fetching all users:', error);
        }
    };

    useEffect(() => {

        if (!token) {
            setError('No token found in user data.');
            return;
        }

        if (allowedRoles.includes(role)) {
            setHasAccess(true);
            getHodPhoneBookData(token);
        } else {
            setError('You do not have access to this dashboard.');
        }
    }, []);

    useEffect(() => {
        const results = hodData.filter(entry =>
            entry.number.toLowerCase().includes(searchQuery.toLowerCase()) &&
            (!selectedUser || entry.user._id === selectedUser.value) &&
            (!selectedCalStatus || entry.calstatus === selectedCalStatus.value) &&
            (!startDate || new Date(entry.updatedAt) >= startDate) &&
            (!endDate || new Date(entry.updatedAt) <= endDate)
        );
        setFilteredPhonebookData(results);
    }, [searchQuery, hodData, selectedUser, selectedCalStatus, startDate, endDate]);

    useEffect(() => {
        const savedRtl = localStorage.getItem('rtl');
        setRtl(savedRtl); // Update state with the 'rtl' value from localStorage
    }, [rtl]);

    const handleCallStatusChange = async (id, status) => {
        if (status === 'Convert to Lead') {
            setPendingStatusChange(status);
            setShowConvertModal(true);
        } else {
            try {
                const response = await updateCallStatusAPI(id, status); // Call the API with status and id
                if (response.success) {
                    // Update the table data locally to reflect the new status
                    setFilteredPhonebookData((prevData) =>
                        prevData.map((entry) =>
                            entry._id === id ? { ...entry, calstatus: status } : entry
                        )
                    );
                } else {
                    console.error('Error updating status:', response.message);
                }
            } catch (error) {
                console.error('API Error:', error);
            }
        }
    };

    const updateCallStatusAPI = async (id, status) => {
        try {
            // Make the API call to update the call status
            const response = await fetch(`${process.env.REACT_APP_BASE_URL}/api/phonebook/update-calstatus/${id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ calstatus: status }),
            });

            // Fetch updated phonebook data
            await getHodPhoneBookData(token);

            // Check if the status is "Not Interested"
            if (status === 'Not Interested') {
                setCurrentIdForComments(id); // Store the unique ID
                setShowCommentsModal(true); // Open the modal
            }
            setCalStatus(status);
            return response.json();
        } catch (error) {
            console.error('API Call Error:', error);
            throw error;
        }
    };

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            const fileExtension = selectedFile.name.split('.').pop().toLowerCase();
            if (fileExtension !== 'csv') {
                setError('Only CSV files are Allowed.');
                setCsvFile(null); // Clear the file input
            } else {
                setError('');
                setCsvFile(selectedFile);
            }
        }
    };

    const handleUserChange = (selectedOption) => {
        setSelectedUsers(selectedOption); // Update selected users
    };

    const handleAgentChange = (selectedOption) => {
        setSelectedAgent(selectedOption); // Update selected agent
    };

    const handleImportSubmit = async () => {
        // if (selectedUsers.length > 0 && csvFile && selectedAgent) {
        if (token) {
            const formData = new FormData();
            // Append each selected user ID to `visibilityUserIds`
            selectedUsers.forEach(user => { // Use selectedUsers state variable
                formData.append('visibilityUserId', user.value);
            });

            // Use the selected agent for userId
            formData.append('userId', selectedAgent?.value); // Assuming single agent selection

            // Append additional fields
            formData.append('pipelineId', piprlineID); // Ensure pipelineID is defined
            formData.append('file', csvFile); // Attach the CSV file

            try {
                const response = await axios.post(`${process.env.REACT_APP_BASE_URL}/api/phonebook/upload-csv`, formData, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data',
                    },
                });
                setMessage(response.data.message || ''); // Set the message from the response
                setInsertedNumbers(response.data.insertedNumbers || []);
                setSkippedNumbers(response.data.skippedNumbers || []);
                // Reset the state if needed or handle success
                getHodPhoneBookData()
                setInsertSkipNumber(true)
                setSelectedUsers([]); // Reset to an empty array
                setSelectedAgent(null);
                setCsvFile(null);
                setShowImportModal(false);
            } catch (error) {
                console.error('Error uploading CSV:', error);
            }
        } else {
            navigate('/'); // Adjust navigation as needed
        }
        // }
    };

    const HandleCreatePhoneBook = async (num, id) => {
        setPhoneBookModal(true)
        setPhoneBookNumber(num)
        setPhoneID(id)
    }

    // Determine the entries to show on the current page
    const indexOfLastEntry = currentPage * entriesPerPage;
    const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
    const currentEntries = filteredPhonebookData.slice(indexOfFirstEntry, indexOfLastEntry);

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    const handlePreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const handleCommentsClick = (entry) => {
        setSelectedEntry(entry);
        setCommentsToView(entry.comments || []); // Load existing comments
        setCurrentComment(''); // Reset the new comment field
        setShowCommentsModal(true); // Open the modal
    };

    // Save comment API call and update state
    const handleSaveComment = async (id) => {
        if (selectedEntry && currentComment.trim()) {
            try {
                if (token) {
                    await axios.post(
                        `${process.env.REACT_APP_BASE_URL}/api/phonebook/add-comment`,
                        {
                            phonebookId: selectedEntry._id,
                            comment: currentComment
                        },
                        {
                            headers: {
                                'Authorization': `Bearer ${token}`,
                                'Content-Type': 'application/json'
                            }
                        }
                    );

                    // Update local state with the new comment
                    const updatedData = hodData.map(entry =>
                        entry._id === selectedEntry._id
                            ? {
                                ...entry,
                                comments: [...(entry.comments || []), { remarks: currentComment, createdAt: new Date() }]
                            }
                            : entry
                    );

                    // Update the state without sorting
                    setHodData(updatedData);
                    setFilteredPhonebookData(updatedData);
                    setShowCommentsModal(false);
                } else {
                    navigate('/');
                }
            } catch (error) {
                console.error('Error saving comment:', error);
            }
        }
        setCurrentComment(''); // Clear the comment field
    };

    const renderMenu = (id) => {
        const filteredOptions = calStatusOptions.filter(option => option.value !== calStatus);
    
        return (
            <>
                <Menu
                    style={{
                        padding: '10px 20px',
                        inset: '0px 0px auto auto',
                        display: 'flex',
                        gap: '5px',
                        flexDirection: 'column',
                        backgroundColor: '#fff',
                        direction: rtl === 'true' ? 'rtl' : 'ltr',
                    }}
                >
                    {filteredOptions.map(option => (
                        <Menu.Item
                            key={option.value}
                            onClick={() => {
                                updateCallStatusAPI(id, option.value); // Update the status via API
                            }}
                        >
                            {option.label}
                        </Menu.Item>
                    ))}
                </Menu>
            </>
        );
    };

    return (
        <>
            <Container fluid style={{ direction: rtl === 'true' ? 'rtl' : 'ltr' }}>
                <Row>
                    <Col xs={12} md={12} lg={2}>
                        <Sidebar />
                    </Col>

                    <Col xs={12} md={12} lg={10}>
                        <Card className='leads_main_cards mt-4' >
                            <div className="phonebook-container">

                                {role !== 'CEO' && (
                                    <div style={{ display: 'flex', justifyContent: 'end', gap: '15px', alignItems: 'end', marginBottom: '20px' }}>
                                        <Button className='button_one' onClick={() => setShowImportModal(true)}>
                                            {rtl === 'true' ? 'استيراد ملف CSV' : 'Import CSV'}
                                        </Button>
                                    </div>
                                )}

                                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '15px', alignItems: 'center' }}>
                                    {/* Search by Number */}
                                    <Form.Group controlId="searchBarNumber" className="w-100">
                                        <Form.Control
                                            type="text"
                                            placeholder={rtl === 'true' ? 'بحث برقم' : 'Search by Number'} // Localized placeholder
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="searchfield input_field_input_field"
                                            style={{
                                                textAlign: rtl === 'true' ? 'right' : 'left', // Adjust text alignment
                                                direction: rtl === 'true' ? 'rtl' : 'ltr', // Adjust direction
                                            }}
                                        />
                                    </Form.Group>

                                    {/* Select User */}
                                    <Form.Group controlId="selectUser" className="w-100">
                                        <Select
                                            options={allUsers}
                                            value={selectedUser}
                                            onChange={setSelectedUser}
                                            placeholder={rtl === 'true' ? 'اختر مستخدم' : 'Select User'} // Localized placeholder
                                            isClearable
                                            className="searchfield input_field_input_field"
                                            classNamePrefix="react-select"
                                            styles={{
                                                input: (base) => ({
                                                    ...base,
                                                    textAlign: rtl === 'true' ? 'right' : 'left', // Adjust text alignment
                                                    direction: rtl === 'true' ? 'rtl' : 'ltr', // Adjust direction
                                                }),
                                            }}
                                        />
                                    </Form.Group>

                                    {/* Select Call Status */}
                                    <Form.Group controlId="selectCalStatus" className="w-100">
                                        <Select
                                            options={calStatusOptions}
                                            value={selectedCalStatus}
                                            onChange={setSelectedCalStatus}
                                            placeholder={rtl === 'true' ? 'اختر حالة المكالمة' : 'Select Call Status'} // Localized placeholder
                                            isClearable
                                            className="searchfield input_field_input_field"
                                            classNamePrefix="react-select"
                                            styles={{
                                                input: (base) => ({
                                                    ...base,
                                                    textAlign: rtl === 'true' ? 'right' : 'left', // Adjust text alignment
                                                    direction: rtl === 'true' ? 'rtl' : 'ltr', // Adjust direction
                                                }),
                                            }}
                                        />
                                    </Form.Group>

                                    {/* Date Pickers */}
                                    <div className="w-100" style={{ display: 'flex', gap: '15px' }}>
                                        <DatePicker
                                            selected={startDate}
                                            onChange={(date) => setStartDate(date)}
                                            placeholderText={rtl === 'true' ? 'تاريخ البدء' : 'Start Date'} // Localized placeholder
                                            dateFormat="yyyy/MM/dd"
                                            className="form-control searchfield input_field_input_field"
                                            style={{
                                                textAlign: rtl === 'true' ? 'right' : 'left', // Adjust text alignment
                                                direction: rtl === 'true' ? 'rtl' : 'ltr', // Adjust direction
                                            }}
                                        />
                                        <DatePicker
                                            selected={endDate}
                                            onChange={(date) => setEndDate(date)}
                                            placeholderText={rtl === 'true' ? 'تاريخ الانتهاء' : 'End Date'} // Localized placeholder
                                            dateFormat="yyyy/MM/dd"
                                            className="form-control searchfield input_field_input_field"
                                            style={{
                                                textAlign: rtl === 'true' ? 'right' : 'left', // Adjust text alignment
                                                direction: rtl === 'true' ? 'rtl' : 'ltr', // Adjust direction
                                            }}
                                        />
                                    </div>
                                </div>

                                <div>
                                    {error ? (
                                        <p style={{ color: 'red' }}>{error}</p>
                                    ) : hasAccess ? (
                                        filteredPhonebookData.length > 0 ? (
                                            <Table hover bordered responsive className="mt-1 table_main_container" size="md">
                                                <thead style={{ backgroundColor: '#d7aa47' }}>
                                                    <tr
                                                        className="teble_tr_class"
                                                        style={{
                                                            backgroundColor: '#000',
                                                            color: '#343a40',
                                                            borderBottom: '1px solid #d7aa47',
                                                            transition: 'background-color 0.3s ease',
                                                        }}
                                                    >
                                                        <th className="equal-width" style={{ backgroundColor: '#d7aa47', color: 'white' }}>
                                                            {rtl === 'true' ? 'تم التحميل بواسطة' : 'Uploaded by'}
                                                        </th>
                                                        <th className="equal-width" style={{ backgroundColor: '#d7aa47', color: 'white' }}>
                                                            {rtl === 'true' ? 'المستخدم' : 'User'}
                                                        </th>
                                                        <th className="equal-width" style={{ backgroundColor: '#d7aa47', color: 'white' }}>
                                                            {rtl === 'true' ? 'الأنبوب' : 'Pipeline'}
                                                        </th>
                                                        <th className="equal-width" style={{ backgroundColor: '#d7aa47', color: 'white' }}>
                                                            {rtl === 'true' ? 'الهاتف' : 'Phone'}
                                                        </th>
                                                        <th className="equal-width" style={{ backgroundColor: '#d7aa47', color: 'white' }}>
                                                            {rtl === 'true' ? 'الحالة' : 'Status'}
                                                        </th>
                                                        <th className="equal-width" style={{ backgroundColor: '#d7aa47', color: 'white' }}>
                                                            {rtl === 'true' ? 'حالة المكالمة' : 'Call Status'}
                                                        </th>
                                                        <th className="equal-width" style={{ backgroundColor: '#d7aa47', color: 'white' }}>
                                                            {rtl === 'true' ? 'الإجراء' : 'Action'}
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {currentEntries.map((entry, index) => (
                                                        <tr key={index}>
                                                            <td className="table_td_class">
                                                                <div className="name-container">
                                                                    {entry.uploaded_by.name.split(' ').slice(0, 2).join(' ')}
                                                                    {entry.uploaded_by.name.split(' ').length > 15 && '...'}
                                                                    <span className="tooltip">{entry.uploaded_by.name}</span>
                                                                </div>
                                                            </td>
                                                            <td style={{ textAlign: 'center' }} className="table_td_class">
                                                                <div className="name-container">
                                                                    {entry.user?.name
                                                                        ? entry.user.name.split(' ').slice(0, 15).join(' ') +
                                                                        (entry.user.name.split(' ').length > 15 ? '...' : '')
                                                                        : 'N/A'}
                                                                    {entry.user?.name && <span className="tooltip">{entry.user.name}</span>}
                                                                </div>
                                                            </td>
                                                            <td className="table_td_class">{entry.pipeline.name}</td>
                                                            <td className="table_td_class" style={{ textAlign: 'center', direction: rtl === 'true' ? 'ltr' : 'ltr' }}>{entry.number}</td>
                                                            <td className="table_td_class">
                                                                {(() => {
                                                                    const date = new Date(entry.createdAt);
                                                                    const today = new Date();
                                                                    const yesterday = new Date();
                                                                    yesterday.setDate(today.getDate() - 1);

                                                                    today.setHours(0, 0, 0, 0);
                                                                    yesterday.setHours(0, 0, 0, 0);
                                                                    date.setHours(0, 0, 0, 0);

                                                                    if (date.getTime() === today.getTime()) {
                                                                        return 'Today';
                                                                    } else if (date.getTime() === yesterday.getTime()) {
                                                                        return 'Yesterday';
                                                                    } else {
                                                                        return date.toLocaleDateString('en-US', { weekday: 'long' });
                                                                    }
                                                                })()}
                                                            </td>
                                                            <td
                                                                style={{
                                                                    textAlign: 'center',
                                                                    backgroundColor: '#000',
                                                                    color:
                                                                        entry.calstatus === 'Not Interested'
                                                                            ? 'red'
                                                                            : entry.calstatus === 'No Answer'
                                                                                ? '#d7aa47'
                                                                                : 'white',
                                                                    border: '1px solid #d7aa47',
                                                                }}
                                                            >
                                                                {entry.calstatus}
                                                            </td>
                                                            <td
                                                                className="table_td_class"
                                                                style={{
                                                                    textAlign: 'center',
                                                                    display: 'flex',
                                                                    justifyContent: 'center',
                                                                    alignItems: 'center',
                                                                    gap: '15px',
                                                                }}
                                                            >
                                                                <Dropdown overlay={renderMenu(entry._id,)} trigger={['click']}>
                                                                    <BsThreeDotsVertical style={{ cursor: 'pointer', fontSize: '25px' }} />
                                                                </Dropdown>
                                                                <div className="addAction">
                                                                    <MdAdd
                                                                        style={{ fontSize: '15px', cursor: 'pointer', color: 'white' }}
                                                                        onClick={() => handleCommentsClick(entry)}
                                                                    />
                                                                    <div className="tooltip"> {rtl === 'true' ? 'عرض/إضافة تعليقات' : 'View/Add Comments'}</div>
                                                                </div>
                                                                <div className="viewAction">
                                                                    <IoOpenOutline
                                                                        onClick={() => HandleCreatePhoneBook(entry.number, entry._id)}
                                                                        style={{ fontSize: '15px', cursor: 'pointer', color: 'white' }}
                                                                    />
                                                                    <div className="tooltip"> {rtl === 'true' ? 'إنشاء عميل' : 'Create Lead'}</div>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </Table>
                                        ) : (
                                            <p className="text-center mt-5 mutual_heading_class">No Data Available</p>
                                        )
                                    ) : (
                                        <p className='mutual_class_color' >{rtl === 'true' ? 'ليس لديك صلاحية للوصول إلى هذه الصفحة.' : 'You do not have access to this page.'}</p>
                                    )}
                                    <div
                                        className="pagination-controls"
                                        style={{ display: 'flex', justifyContent: 'center' }}
                                    >
                                        <Button className="button_one" onClick={handlePreviousPage} disabled={currentPage === 1}>
                                            {rtl === 'true' ? 'السابق' : 'Previous'}
                                        </Button>

                                        <span
                                            className="mutual_heading_class"
                                            style={{ padding: '0 15px', lineHeight: '38px' }}
                                        >
                                            {rtl === 'true' ? `الصفحة ${currentPage} من ${totalPages}` : `Page ${currentPage} of ${totalPages}`}
                                        </span>

                                        <Button className="button_one" onClick={handleNextPage} disabled={currentPage === totalPages}>
                                            {rtl === 'true' ? 'التالي' : 'Next'}
                                        </Button>

                                    </div>
                                </div>

                                {/* View Comments Modal */}
                                <Modal show={showViewCommentModal} onHide={() => setShowViewCommentModal(false)} size='lg' >
                                    <Modal.Header closeButton>
                                        <Modal.Title>View Comments</Modal.Title>
                                    </Modal.Header>
                                    <Modal.Body style={{ height: 'auto', maxHeight: '700px', overflowY: 'scroll' }} >
                                        <ul>
                                            {commentsToView.length > 0 ? (
                                                commentsToView.map((comment, index) => (
                                                    <li key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #ddd', padding: '10px 0', }} >
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }} >
                                                            <img
                                                                src={comment.user?.image || defaultimage}
                                                                alt="User image"
                                                                className='image_url_default'
                                                                onError={(e) => {
                                                                    e.target.onerror = null; // Prevents infinite loop in case defaultimage also fails
                                                                    e.target.src = defaultimage; // Fallback to default image
                                                                }}
                                                            />

                                                            <div>
                                                                <p className='mb-0'>{comment?.remarks && comment?.remarks ? comment?.remarks : 'No Comments Available'}</p>
                                                                <small> {comment.user?.name && comment.user?.name} </small>
                                                            </div>
                                                        </div>

                                                        <small>
                                                            {`${new Date(comment.createdAt).toDateString()} - ${new Date(comment.createdAt).toLocaleTimeString()}`}
                                                        </small>

                                                    </li>
                                                ))
                                            ) : (
                                                <p>No Comments Available.</p>
                                            )}
                                        </ul>
                                    </Modal.Body>
                                </Modal>


                                {/* Add Comment Modal */}
                                <Modal
                                    show={showCommentsModal}
                                    onHide={() => setShowCommentsModal(false)}
                                    centered
                                    size="md"
                                >
                                    <Modal.Header
                                        closeButton
                                        style={{
                                            border: 'none',
                                            direction: rtl === 'true' ? 'rtl' : 'ltr',
                                        }}
                                    >
                                        <Modal.Title className="mutual_class_color">
                                            {rtl === 'true' ? 'تعليقات' : 'Comments'}
                                        </Modal.Title>
                                    </Modal.Header>
                                    <Modal.Body
                                        style={{
                                            textAlign: rtl === 'true' ? 'right' : 'left',
                                            direction: rtl === 'true' ? 'rtl' : 'ltr',
                                        }}
                                    >
                                        <div
                                            className="comments-section"
                                            style={{
                                                height: '100%',
                                                maxHeight: '300px',
                                                overflowY: 'scroll',
                                                padding: '20px',
                                                backgroundColor: '#f5f5f5',
                                                borderRadius: '15px',
                                                boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
                                                position: 'relative',
                                            }}
                                        >
                                            {commentsToView.length > 0 ? (
                                                commentsToView.slice().reverse().map((comment, index) => (
                                                    <div
                                                        key={index}
                                                        className="comment-item"
                                                        style={{
                                                            display:
                                                                comment?.user?.name === 'CurrentUser' ? 'row-reverse' : 'row',
                                                            alignItems: 'flex-start',
                                                            marginBottom: '20px',
                                                            animation: 'fadeIn 0.5s ease-in-out',
                                                        }}
                                                    >
                                                        {/* User Image */}
                                                        <div
                                                            className="user-image"
                                                            style={{
                                                                width: '45px',
                                                                height: '45px',
                                                                borderRadius: '50%',
                                                                overflow: 'hidden',
                                                                marginRight:
                                                                    comment?.user?.name === 'CurrentUser' ? '15px' : '0',
                                                                marginLeft:
                                                                    comment?.user?.name === 'CurrentUser' ? '0' : '15px',
                                                                border: '2px solid #fff',
                                                                boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
                                                            }}
                                                        >
                                                            <Image
                                                                src={
                                                                    comment.user?.image
                                                                        ? `${process.env.REACT_APP_BASE_URL}/images/${comment.user?.image}`
                                                                        : defaultimage
                                                                }
                                                                alt="User_image"
                                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                            />
                                                        </div>

                                                        {/* Comment Text */}
                                                        <div
                                                            className="comment-text"
                                                            style={{
                                                                backgroundColor:
                                                                    comment?.user?.name === 'CurrentUser' ? '#4CAF50' : '#fff',
                                                                color:
                                                                    comment?.user?.name === 'CurrentUser' ? '#fff' : '#333',
                                                                borderRadius: '15px',
                                                                padding: '12px 18px',
                                                                maxWidth: '75%',
                                                                wordWrap: 'break-word',
                                                                boxShadow:
                                                                    comment?.user?.name === 'CurrentUser'
                                                                        ? '0 2px 10px rgba(0, 128, 0, 0.2)'
                                                                        : '0 2px 10px rgba(0, 0, 0, 0.1)',
                                                                position: 'relative',
                                                                marginBottom: '8px',
                                                                fontSize: '14px',
                                                                lineHeight: '1.5',
                                                            }}
                                                        >
                                                            <p style={{ margin: '0 0 8px', color: 'inherit' }}>
                                                                {comment.remarks}
                                                            </p>

                                                            {/* Comment Author & Time */}
                                                            <div
                                                                style={{
                                                                    fontSize: '12px',
                                                                    color:
                                                                        comment?.user?.name === 'CurrentUser'
                                                                            ? '#e0e0e0'
                                                                            : '#888',
                                                                    display: 'flex',
                                                                    justifyContent: 'space-between',
                                                                    flexDirection: 'column',
                                                                }}
                                                            >
                                                                <div>
                                                                    <strong>{comment?.user?.name}</strong>
                                                                </div>

                                                                <div>
                                                                    <p className="mb-0" style={{ fontSize: '12px' }}>
                                                                        {new Date(comment.createdAt).toLocaleDateString('en-US', {
                                                                            year: 'numeric',
                                                                            month: 'long',
                                                                            day: 'numeric',
                                                                            hour: '2-digit',
                                                                            minute: '2-digit',
                                                                            hour12: true,
                                                                        })}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <p style={{ fontSize: '14px', color: '#888' }}>
                                                    {rtl === 'true'
                                                        ? 'لا تعليقات بعد. كن الأول في إضافة تعليق!'
                                                        : 'No comments yet. Be the first to add one!'}
                                                </p>
                                            )}
                                        </div>

                                        {/* Text area for adding a new comment */}
                                        <Form.Group controlId="commentTextarea" className="mt-2">
                                            <Form.Control
                                                as="textarea"
                                                rows={1}
                                                value={currentComment}
                                                onChange={(e) => setCurrentComment(e.target.value)}
                                                placeholder={
                                                    rtl === 'true' ? 'أدخل تعليقك هنا' : 'Enter your comment here'
                                                }
                                            />
                                        </Form.Group>
                                    </Modal.Body>
                                    <Modal.Footer
                                        style={{
                                            border: 'none',
                                            direction: rtl === 'true' ? 'rtl' : 'ltr',
                                        }}
                                    >
                                        <Button
                                            className="all_common_btn_single_lead"
                                            onClick={() => handleSaveComment(currentIdForComments)}
                                        >
                                            {rtl === 'true' ? 'حفظ التعليق' : 'Save Comment'}
                                        </Button>
                                    </Modal.Footer>
                                </Modal>



                                {/* Convert to Lead Confirmation Modal */}
                                <Modal show={showConvertModal} onHide={() => setShowConvertModal(false)} centered>
                                    <Modal.Header closeButton>
                                        <Modal.Title>Confirm Conversion</Modal.Title>
                                    </Modal.Header>
                                    <Modal.Body>Are you sure you want to convert this status to Lead?</Modal.Body>
                                </Modal>

                                <Modal
                                    size="lg"
                                    aria-labelledby="contained-modal-title-vcenter"
                                    centered
                                    show={showImportModal} onHide={() => setShowImportModal(false)} style={{ borderRadius: '20px' }}
                                >
                                    <Modal.Header closeButton style={{ border: 'none' }} >
                                        <Modal.Title className='mutual_class_color' >Import CSV</Modal.Title>
                                    </Modal.Header>
                                    <Modal.Body>
                                        <Form>

                                            <Form.Group controlId="selectAgent" className="w-100">
                                                <Form.Label className='mutual_class_color' >Select Agent</Form.Label>
                                                <Select
                                                    options={allUsers} // Ensure allUsers is defined
                                                    placeholder="Select an agent"
                                                    className="w-100"
                                                    isClearable
                                                    onChange={handleAgentChange}
                                                />
                                            </Form.Group>

                                            {!(role === "Team Leader" || role === "Coordinator") && (
                                                <Form.Group controlId="selectUser" className="w-100">
                                                    <Form.Label className='mutual_class_color mt-2'>Select Team Leader / Coordinator</Form.Label>
                                                    <Select
                                                        options={userRoleOptions}
                                                        placeholder="Select a team leader or coordinator"
                                                        className="w-100"
                                                        isClearable
                                                        isMulti
                                                        onChange={handleUserChange}
                                                    />
                                                </Form.Group>
                                            )}

                                            <Form.Group controlId="csvFile">
                                                <Form.Label className='mutual_class_color mt-2'>Upload CSV</Form.Label>
                                                <Form.Control
                                                    type="file"
                                                    accept=".csv"
                                                    onChange={handleFileChange}
                                                />
                                                {error && <Form.Text className="text-danger">{error}</Form.Text>}
                                            </Form.Group>

                                        </Form>
                                    </Modal.Body>
                                    <Modal.Footer style={{ border: 'none' }}>
                                        <Button className='button_one' onClick={handleImportSubmit} disabled={isSubmitDisabled}>
                                            Upload
                                        </Button>
                                    </Modal.Footer>
                                </Modal>

                                {/* Skip and Inserted Numbers */}
                                <Modal
                                    size="lg"
                                    aria-labelledby="contained-modal-title-vcenter"
                                    centered
                                    show={insertSkipNumber}
                                    onHide={() => setInsertSkipNumber(false)}
                                >
                                    <Modal.Header closeButton>
                                        <Modal.Title id="contained-modal-title-vcenter">
                                            Phonebook entries
                                        </Modal.Title>
                                    </Modal.Header>
                                    <Modal.Body style={{ maxHeight: '400px', overflowY: 'auto' }}>
                                        <h5 className="text-success">{message}</h5> {/* Display the message */}

                                        <div className="d-flex mt-4">
                                            <div className="w-50 pe-3">
                                                <h5>Inserted Numbers</h5>
                                                {insertedNumbers.length > 0 ? (
                                                    <ListGroup>
                                                        {insertedNumbers.map((number, index) => (
                                                            <ListGroup.Item key={index}>{number}</ListGroup.Item>
                                                        ))}
                                                    </ListGroup>
                                                ) : (
                                                    <p>No numbers were inserted.</p>
                                                )}
                                            </div>
                                            <div className="w-50 ps-3">
                                                <h5>Skipped Numbers</h5>
                                                {skippedNumbers.length > 0 ? (
                                                    <ListGroup>
                                                        {skippedNumbers.map((number, index) => (
                                                            <ListGroup.Item key={index}>{number}</ListGroup.Item>
                                                        ))}
                                                    </ListGroup>
                                                ) : (
                                                    <p>No numbers were skipped.</p>
                                                )}
                                            </div>
                                        </div>
                                    </Modal.Body>
                                    <Modal.Footer>
                                        <Button className='all_close_btn_container' onClick={() => setInsertSkipNumber(false)}>Close</Button>
                                    </Modal.Footer>
                                </Modal>

                            </div>
                        </Card>
                    </Col>
                </Row>

                <CreatePhoneBook phoneID={phoneID} getHodPhoneBookData={getHodPhoneBookData} phoneBookModal={phoneBookModal} setPhoneBookModal={setPhoneBookModal} phoneBookNumber={phoneBookNumber} setPhoneBookNumber={setPhoneBookNumber} />

            </Container>
        </>
    );
};

export default HodPhoneBook;
