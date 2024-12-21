import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Select from 'react-select';
import { Table, Modal, Button, Container, Form, Spinner, Row, Col, Card, Image } from 'react-bootstrap';
import { GrView } from 'react-icons/gr';
import { MdAdd } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import { FiEdit2 } from "react-icons/fi";
import defaultimage from '../../Assets/default_image.jpg'
import DatePicker from 'react-datepicker'; // Import DatePicker
import "react-datepicker/dist/react-datepicker.css";
import { useSelector } from 'react-redux';
import Navbar from '../../Components/navbar/Navbar';
import Sidebar from '../../Components/sidebar/Sidebar';
import './phoneBookstyle.css'
import CreatePhoneBook from './CreatePhoneBook';
import { IoOpenOutline } from "react-icons/io5";
import { Dropdown, Menu } from 'antd';
import { BsThreeDotsVertical } from "react-icons/bs";

const CEOphoneBook = () => {
    const token = useSelector(state => state.loginSlice.user?.token);
    const [ceoPhoneBookData, setCeoPhoneBookData] = useState([]);
    const [pipelines, setPipelines] = useState([]);
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [selectedPipeline, setSelectedPipeline] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);
    const [selectedCalStatus, setSelectedCalStatus] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [commentsToView, setCommentsToView] = useState([]);
    const [selectedEntry, setSelectedEntry] = useState(null);
    const [currentComment, setCurrentComment] = useState('');
    const [filteredPhonebookData, setFilteredPhonebookData] = useState([]);
    const [dropdownEntry, setDropdownEntry] = useState(null);
    const [pendingStatusChange, setPendingStatusChange] = useState(null);
    const [showConvertModal, setShowConvertModal] = useState(false);
    const [startDate, setStartDate] = useState(null); // New state for start date
    const [endDate, setEndDate] = useState(null); // New state for end date
    const navigate = useNavigate();
    const [phoneBookModal, setPhoneBookModal] = useState(false)
    const [phoneBookNumber, setPhoneBookNumber] = useState('')
    const [phoneID, setPhoneID] = useState('')
    const [currentPage, setCurrentPage] = useState(1);
    const [showCommentsModal, setShowCommentsModal] = useState(false);
    const [rtl, setRtl] = useState(null);
    const [calStatus, setCalStatus] = useState('');
    const [currentIdForComments, setCurrentIdForComments] = useState(null);
    const entriesPerPage = 13;

    const leadsPerPage = 9;
    const pagesToShow = 5;

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


    useEffect(() => {
        const savedRtl = localStorage.getItem('rtl');
        setRtl(savedRtl); // Update state with the 'rtl' value from localStorage
    }, [rtl]);

    const fetchData = async () => {
        try {
            if (!token) {
                throw new Error('Token not found');
            }

            const [pipelinesResponse, usersResponse, phoneBookResponse] = await Promise.all([
                axios.get(`/api/pipelines/get-pipelines`, {
                    headers: { 'Authorization': `Bearer ${token}` },
                }),
                axios.get(`/api/users/get-users`, {
                    headers: { 'Authorization': `Bearer ${token}` },
                }),
                axios.get(`/api/phonebook/get-all-phonebook`, {
                    headers: { 'Authorization': `Bearer ${token}` },
                }),
            ]);

            // Set pipelines and users data
            setPipelines((pipelinesResponse.data || []).map(pipeline => ({
                value: pipeline._id,
                label: pipeline.name,
            })));

            setUsers((usersResponse.data || []).map(user => ({
                ...user,
                pipelines: (user.pipeline || []).map(p => p._id), // Flatten pipelines to IDs
            })));

            // Preserve order of phonebook data and only filter out 'Convert to Lead'
            const filteredPhoneBookData = (phoneBookResponse.data || []).filter(
                entry => entry.calstatus !== 'Convert to Lead'
            );

            // Set phonebook data without reordering
            setCeoPhoneBookData(filteredPhoneBookData);
            setFilteredData(filteredPhoneBookData);
        } catch (error) {
            setError(error.response?.data?.message || error.message);
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        fetchData();
    }, []);

    // This useEffect will filter users based on selectedPipeline
    useEffect(() => {
        if (selectedPipeline) {
            const pipelineUsers = users.filter(user => user.pipelines.includes(selectedPipeline.value));
            setFilteredUsers(pipelineUsers);
        } else {
            setFilteredUsers(users);
        }
    }, [selectedPipeline, users]);

    // This useEffect will handle all filtering logic
    useEffect(() => {
        let filtered = ceoPhoneBookData;

        // Apply filters based on selected options
        if (selectedPipeline) {
            filtered = filtered.filter(entry => entry.pipeline._id === selectedPipeline.value);
        }

        if (selectedUser) {
            filtered = filtered.filter(entry => entry.user?._id === selectedUser.value); // Assuming entry.user is an object
        }

        if (selectedCalStatus) {
            filtered = filtered.filter(entry => entry.calstatus === selectedCalStatus.value);
        }

        if (searchQuery) {
            filtered = filtered.filter(entry => entry.number.toString().toLowerCase().includes(searchQuery.toLowerCase()));
        }

        if (startDate && endDate) {
            filtered = filtered.filter(entry => {
                const entryDate = new Date(entry.updatedAt);
                return entryDate >= startDate && entryDate <= endDate;
            });
        }

        // Set the filtered data based on all active filters
        setFilteredData(filtered);
    }, [selectedPipeline, selectedUser, selectedCalStatus, searchQuery, ceoPhoneBookData, startDate, endDate]);


    if (loading) return (
        <div className="no-results mt-5" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Spinner animation="grow" style={{ color: 'white' }} role="status"></Spinner>
        </div>
    );

    const updateCallStatus = async (status) => {
        if (dropdownEntry) {
            try {
                if (token) {
                    await axios.put(
                        `/api/phonebook/update-calstatus/${dropdownEntry._id}`,
                        {
                            calstatus: status
                        },
                        {
                            headers: {
                                'Authorization': `Bearer ${token}`,
                                'Content-Type': 'application/json'
                            }
                        }
                    );

                    const updatedData = ceoPhoneBookData.map((entry) =>
                        entry._id === dropdownEntry._id ? { ...entry, calstatus: status } : entry
                    );
                    // Re-sort updated data by updatedAt
                    const sortedUpdatedData = updatedData.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
                    setCeoPhoneBookData(sortedUpdatedData);
                    setFilteredPhonebookData(sortedUpdatedData);
                } else {
                    navigate('/');
                }
            } catch (error) {
                console.error('Error updating call status:', error);
            }
        }

        setDropdownEntry(null); // Hide dropdown after selecting status
        setShowConvertModal(false); // Hide confirmation modal after updating 
    };

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
            const response = await fetch(`/api/phonebook/update-calstatus/${id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ calstatus: status }),
            });

            // Fetch updated phonebook data
            await fetchData();

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

    const handleConfirmConversion = () => {
        updateCallStatus(pendingStatusChange);
    };

    const HandleCreatePhoneBook = async (num, id) => {
        setPhoneBookModal(true)
        setPhoneBookNumber(num)
        setPhoneID(id)
    }

    // Logic to handle pagination
    const indexOfLastEntry = currentPage * entriesPerPage;
    const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
    const currentEntries = filteredData.slice(indexOfFirstEntry, indexOfLastEntry);

    const totalPages = Math.ceil(filteredData.length / entriesPerPage);

    // Handle page change
    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    // Pagination handlers
    const handleNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    const handlePrevPage = () => {
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
    const handleSaveComment = async () => {
        if (selectedEntry && currentComment.trim()) {
            try {
                if (token) {
                    await axios.post(
                        `/api/phonebook/add-comment`,
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

                    // Update the local state with the new comment while preserving the original order
                    const updatedData = ceoPhoneBookData.map(entry =>
                        entry._id === selectedEntry._id
                            ? { ...entry, comments: [...(entry.comments || []), { remarks: currentComment, createdAt: new Date() }] }
                            : entry
                    );

                    // Fetch updated data from the backend (if necessary)
                    fetchData();

                    // Update local state without re-sorting
                    setCeoPhoneBookData(updatedData);
                    setFilteredPhonebookData(updatedData);

                    // Close the modal
                    setShowCommentsModal(false);
                } else {
                    navigate('/');
                }
            } catch (error) {
                console.error('Error saving comment:', error);
            }
        }

        // Clear the comment field
        setCurrentComment('');
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
            {/* <Navbar /> */}
            <Container fluid style={{ direction: rtl === 'true' ? 'rtl' : 'ltr' }}>
                <Row>
                    <Col xs={12} md={12} lg={2} style={{ backgroundColor: '' }}>
                        {/* <Sidebar /> */}
                    </Col>

                    <Col xs={12} md={12} lg={10} style={{ backgroundColor: '' }} >
                        <Card className='leads_main_cards mt-4'>
                            <div style={{ display: 'flex', justifyContent: 'end', alignItems: 'end' }} >
                                {/* <Button className='button_two' onClick={() => navigate('/generatereport')} >Call History</Button> */}
                            </div>
                            {/* Filter by pipeline */}
                            <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', gap: '10px' }} className='mt-4'>
                                <div className="filter-container w-100">
                                    <label
                                        htmlFor="pipeline-filter"
                                        className="mutual_heading_class"
                                        style={{
                                            textAlign: rtl === 'true' ? 'right' : 'left',
                                            direction: rtl === 'true' ? 'rtl' : 'ltr',
                                        }}
                                    >
                                        {rtl === 'true' ? 'تصفية حسب خط الأنابيب' : 'Filter by Pipeline'}
                                    </label>
                                    <Select
                                        id="pipeline-filter"
                                        value={selectedPipeline}
                                        onChange={setSelectedPipeline}
                                        options={[{ value: '', label: 'All Pipelines' }, ...pipelines]}
                                        isClearable
                                        className='input_field_input_field'
                                        classNamePrefix="react-select"
                                        placeholder={rtl === 'true' ? 'اختر المسار' : 'Select Pipeline'}

                                    />
                                </div>

                                {/* Filter by user */}
                                <div className="filter-container w-100 mutual_heading_class">
                                    <label
                                        htmlFor="user-filter"
                                        className="mutual_heading_class"
                                        style={{
                                            textAlign: rtl === 'true' ? 'right' : 'left',
                                            direction: rtl === 'true' ? 'rtl' : 'ltr',
                                        }}
                                    >
                                        {rtl === 'true' ? 'تصفية حسب المستخدم' : 'Filter by User'}
                                    </label>
                                    <Select
                                        id="user-filter"
                                        value={selectedUser}
                                        onChange={setSelectedUser}
                                        options={[{ value: '', label: rtl === 'true' ? 'اختر المستخدم' : 'Select User' }, ...filteredUsers.map(user => ({ value: user._id, label: user.name }))]}
                                        isClearable
                                        className='input_field_input_field'
                                        classNamePrefix="react-select"
                                        placeholder={rtl === 'true' ? 'اختر المستخدم' : 'Select User'}
                                    />
                                </div>

                                {/* Filter by call status */}
                                <div className="filter-container w-100 mutual_heading_class">
                                    <label
                                        htmlFor="user-filter"
                                        className="mutual_heading_class"
                                        style={{
                                            textAlign: rtl === 'true' ? 'right' : 'left',
                                            direction: rtl === 'true' ? 'rtl' : 'ltr',
                                        }}
                                    >
                                        {rtl === 'true' ? 'تصفية حسب حالة الاتصال' : 'Filter by Call Status'}
                                    </label>
                                    <Form.Group controlId="selectCalStatus" className='w-100'>
                                        <Select
                                            options={calStatusOptions}
                                            value={selectedCalStatus}
                                            onChange={setSelectedCalStatus}
                                            placeholder={rtl === 'true' ? 'اختر حالة المكالمة' : 'Select Call Status'}
                                            isClearable
                                            className='input_field_input_field'
                                            classNamePrefix="react-select"
                                        />
                                    </Form.Group>
                                </div>
                                {/* Search by Number */}
                                <Form.Group controlId="searchBarNumber" className='w-100 mutual_heading_class'>
                                    <label
                                        htmlFor="search-query"
                                        className="mutual_heading_class"
                                        style={{
                                            textAlign: rtl === 'true' ? 'right' : 'left',
                                            direction: rtl === 'true' ? 'rtl' : 'ltr',
                                        }}
                                    >
                                        {rtl === 'true' ? 'البحث عن طريق الرقم:' : 'Search by Number'}
                                    </label>
                                    <Form.Control
                                        type="text"
                                        placeholder={rtl === 'true' ? 'البحث برقم' : 'Search by Number'}
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className='input_field_input_field'
                                    />
                                </Form.Group>
                                <div className="filter-container w-100">
                                    <label
                                        htmlFor="date-filter"
                                        className="mutual_heading_class"
                                        style={{
                                            textAlign: rtl === 'true' ? 'right' : 'left',
                                            direction: rtl === 'true' ? 'rtl' : 'ltr',
                                        }}
                                    >
                                        {rtl === 'true' ? 'تصفية حسب التاريخ' : 'Filter by Date'}
                                    </label>
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <DatePicker
                                            selected={startDate}
                                            onChange={(date) => setStartDate(date)}
                                            selectsStart
                                            startDate={startDate}
                                            endDate={endDate}
                                            placeholderText={rtl === 'true' ? 'تاريخ البدء' : 'Start Date'}
                                            dateFormat="yyyy/MM/dd"
                                            className="form-control input_field_input_field"

                                        />
                                        <DatePicker
                                            selected={endDate}
                                            onChange={(date) => setEndDate(date)}
                                            selectsEnd
                                            startDate={startDate}
                                            endDate={endDate}
                                            minDate={startDate}
                                            placeholderText={rtl === 'true' ? 'تاريخ النهاية' : 'End Date'}
                                            dateFormat="yyyy/MM/dd"
                                            className="form-control input_field_input_field"
                                        />
                                    </div>
                                </div>

                            </div>

                            <Table hover bordered striped responsive className='mt-3 table_main_container' size='md' variant="dark">
                                <thead style={{ backgroundColor: '#f8f9fd' }}>
                                    <tr
                                        className="teble_tr_class"
                                        style={{
                                            backgroundColor: '#000',
                                            color: '#343a40',
                                            borderBottom: '1px solid #d7aa47',
                                            transition: 'background-color 0.3s ease',
                                        }}
                                    >
                                        <th
                                            className="equal-width"
                                            style={{
                                                backgroundColor: '#d7aa47',
                                                textAlign: rtl === 'true' ? 'center' : 'center',
                                                direction: rtl === 'true' ? 'rtl' : 'ltr',
                                            }}
                                        >
                                            {rtl === 'true' ? 'تم التحميل بواسطة' : 'Uploaded by'}
                                        </th>
                                        <th
                                            style={{
                                                backgroundColor: '#d7aa47',
                                                textAlign: rtl === 'true' ? 'center' : 'center',
                                                direction: rtl === 'true' ? 'rtl' : 'ltr',
                                            }}
                                            className="equal-width"
                                        >
                                            {rtl === 'true' ? 'المستخدم' : 'User'}
                                        </th>
                                        <th
                                            style={{
                                                backgroundColor: '#d7aa47',
                                                textAlign: rtl === 'true' ? 'center' : 'center',
                                                direction: rtl === 'true' ? 'rtl' : 'ltr',
                                            }}
                                            className="equal-width"
                                        >
                                            {rtl === 'true' ? 'الخط الأنبوبي' : 'Pipeline'}
                                        </th>
                                        <th
                                            style={{
                                                backgroundColor: '#d7aa47',
                                                textAlign: rtl === 'true' ? 'center' : 'center',
                                                direction: rtl === 'true' ? 'rtl' : 'ltr',
                                            }}
                                            className="equal-width"
                                        >
                                            {rtl === 'true' ? 'رقم' : 'Number'}
                                        </th>
                                        <th
                                            style={{
                                                backgroundColor: '#d7aa47',
                                                textAlign: rtl === 'true' ? 'center' : 'center',
                                                direction: rtl === 'true' ? 'rtl' : 'ltr',
                                            }}
                                            className="equal-width"
                                        >
                                            {rtl === 'true' ? 'الحالة' : 'Status'}
                                        </th>
                                        <th
                                            style={{
                                                backgroundColor: '#d7aa47',
                                                textAlign: rtl === 'true' ? 'center' : 'center',
                                                direction: rtl === 'true' ? 'rtl' : 'ltr',
                                            }}
                                            className="equal-width"
                                        >
                                            {rtl === 'true' ? 'حالة المكالمة' : 'Call Status'}
                                        </th>
                                        <th
                                            style={{
                                                backgroundColor: '#d7aa47',
                                                textAlign: rtl === 'true' ? 'center' : 'center',
                                                direction: rtl === 'true' ? 'rtl' : 'ltr',
                                            }}
                                            className="equal-width"
                                        >
                                            {rtl === 'true' ? 'الإجراءات' : 'Actions'}
                                        </th>

                                    </tr>
                                </thead>
                                <tbody>
                                    {currentEntries.length > 0 ? (
                                        currentEntries.map((entry, index) => {
                                            return (
                                                <>
                                                    <tr key={index}>
                                                        <td className="table_td_class">
                                                            <div className="name-container">
                                                                {entry.uploaded_by.name.split(' ').slice(0, 2).join(' ')}{entry.uploaded_by.name.split(' ').length > 15 && '...'}
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
                                                        <td className='table_td_class' style={{ textAlign: 'center' }}>{entry.pipeline?.name || 'N/A'}</td>
                                                        <td className='table_td_class' style={{ textAlign: 'center', direction: rtl === 'true' ? 'ltr' : 'ltr' }}>{entry.number}</td>
                                                        <td className="table_td_class" style={{ textAlign: 'center' }}>
                                                            {(() => {
                                                                const date = new Date(entry.createdAt); // Parse the date
                                                                const today = new Date(); // Get today's date
                                                                const yesterday = new Date(); // Prepare yesterday's date
                                                                yesterday.setDate(today.getDate() - 1); // Subtract 1 day from today

                                                                // Reset the time to midnight for date-only comparison
                                                                today.setHours(0, 0, 0, 0);
                                                                yesterday.setHours(0, 0, 0, 0);
                                                                date.setHours(0, 0, 0, 0);

                                                                if (date.getTime() === today.getTime()) {
                                                                    return 'Today'; // If the date matches today
                                                                } else if (date.getTime() === yesterday.getTime()) {
                                                                    return 'Yesterday'; // If the date matches yesterday
                                                                } else {
                                                                    // Format to show the day of the week for other dates
                                                                    return date.toLocaleDateString('en-US', { weekday: 'long' }); // e.g., "Monday"
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
                                                            <Dropdown overlay={renderMenu(entry._id)} trigger={['click']}>
                                                                <BsThreeDotsVertical style={{ cursor: 'pointer', fontSize: '25px' }} />
                                                            </Dropdown>
                                                            <div className="addAction">
                                                                <MdAdd
                                                                    style={{ fontSize: '15px', cursor: 'pointer', color: 'white' }}
                                                                    onClick={() => handleCommentsClick(entry)}
                                                                />
                                                                <div className="tooltip"> {rtl === 'true' ? 'عرض/إضافة التعليقات' : 'View/Add Comments'}</div>
                                                            </div>
                                                            <div className="viewAction">
                                                                <IoOpenOutline
                                                                    onClick={() => HandleCreatePhoneBook(entry.number, entry._id)}
                                                                    style={{ fontSize: '15px', cursor: 'pointer', color: 'white' }}
                                                                />
                                                                <div className="tooltip">Create Lead</div>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                </>
                                            )
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan="6" className='table_td_class' style={{ textAlign: rtl === 'true' ? 'right' : 'center' }}>
                                                {rtl === 'true' ? 'لا توجد بيانات متاحة' : 'No data available'}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </Table>

                            {/* Pagination Controls */}
                            <div
                                style={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    gap: '10px',
                                    direction: rtl === 'true' ? 'rtl' : 'ltr',
                                }}
                            >
                                <Button
                                    className="all_common_btn_single_lead"
                                    onClick={handlePrevPage}
                                    disabled={currentPage === 1}
                                    style={{
                                        textAlign: rtl === 'true' ? 'right' : 'left',
                                    }}
                                >
                                    {rtl === 'true' ? 'السابق' : 'Previous'}
                                </Button>
                                <span
                                    className="mutual_heading_class"
                                    style={{
                                        textAlign: rtl === 'true' ? 'right' : 'left',
                                        direction: rtl === 'true' ? 'rtl' : 'ltr',
                                    }}
                                >
                                    {rtl === 'true' ? `الصفحة ${currentPage} من ${totalPages}` : `Page ${currentPage} of ${totalPages}`}
                                </span>
                                <Button
                                    className="all_common_btn_single_lead"
                                    onClick={handleNextPage}
                                    disabled={currentPage === totalPages}
                                    style={{
                                        textAlign: rtl === 'true' ? 'right' : 'left',
                                    }}
                                >
                                    {rtl === 'true' ? 'التالي' : 'Next'}
                                </Button>
                            </div>

                        </Card>

                        {/* Add Comment Modal */}
                        <Modal show={showCommentsModal} onHide={() => setShowCommentsModal(false)} centered size="md">
                            <Modal.Header closeButton style={{ border: 'none', direction: rtl === 'true' ? 'rtl' : 'ltr' }} >
                                <Modal.Title className='mutual_heading_class' style={{ textAlign: rtl === 'true' ? 'right' : 'left' }}>
                                    {rtl === 'true' ? 'التعليقات' : 'Comments'}  {/* Localize title */}
                                </Modal.Title>
                            </Modal.Header>
                            <Modal.Body>
                                <div className="comments-section input_field_input_field" style={{
                                    height: '100%',
                                    maxHeight: '300px',
                                    overflowY: 'scroll',
                                    padding: '20px',
                                    backgroundColor: '#f5f5f5',
                                    borderRadius: '15px',
                                    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
                                    marginTop: '0px',
                                    position: 'relative',
                                    textAlign: rtl === 'true' ? 'right' : 'left'  // Adjust alignment based on RTL
                                }}>
                                    {commentsToView.length > 0 ? (
                                        commentsToView.slice().reverse().map((comment, index) => (
                                            <div key={index} className="comment-item" style={{
                                                display: 'flex',
                                                flexDirection: comment?.user?.name === 'CurrentUser' ? (rtl === 'true' ? 'row-reverse' : 'row') : 'row', // Adjust flex direction based on RTL
                                                alignItems: 'flex-start',
                                                marginBottom: '20px',
                                                animation: 'fadeIn 0.5s ease-in-out',
                                                gap: '10px',
                                                textAlign: rtl === 'true' ? 'right' : 'left' // Adjust text alignment for each comment
                                            }}>
                                                {/* User Image */}
                                                <div className="user-image " style={{
                                                    width: '45px',
                                                    height: '45px',
                                                    borderRadius: '50%',
                                                    overflow: 'hidden',
                                                    marginRight: comment?.user?.name === 'CurrentUser' ? (rtl === 'true' ? '0' : '15px') : '15px',
                                                    marginLeft: comment?.user?.name === 'CurrentUser' ? (rtl === 'true' ? '15px' : '0') : '0',
                                                    border: '2px solid #fff',
                                                    boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)'
                                                }}>
                                                    <Image
                                                        src={comment.user?.image ? `/images/${comment.user?.image}` : defaultimage}
                                                        alt="User_image"
                                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                    />
                                                </div>

                                                {/* Comment Text */}
                                                <div className="comment-text" style={{
                                                    backgroundColor: comment.user?.name === 'CurrentUser' ? '#4CAF50' : '#fff',
                                                    color: comment.user?.name === 'CurrentUser' ? '#fff' : '#333',
                                                    borderRadius: '15px',
                                                    padding: '12px 18px',
                                                    maxWidth: '75%',
                                                    wordWrap: 'break-word',
                                                    boxShadow: comment.user?.name === 'CurrentUser' ? '0 2px 10px rgba(0, 128, 0, 0.2)' : '0 2px 10px rgba(0, 0, 0, 0.1)',
                                                    position: 'relative',
                                                    marginBottom: '8px',
                                                    fontSize: '14px',
                                                    lineHeight: '1.5',
                                                    textAlign: rtl === 'true' ? 'right' : 'left' // Align comment text based on RTL
                                                }}>
                                                    <p style={{ margin: '0 0 8px', color: 'inherit' }}>{comment.remarks}</p>

                                                    {/* Comment Author & Time */}
                                                    <div style={{
                                                        fontSize: '12px',
                                                        color: comment.user?.name === 'CurrentUser' ? '#e0e0e0' : '#888',
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        flexDirection: rtl === 'true' ? 'row-reverse' : 'row', // Adjust direction based on RTL
                                                        textAlign: rtl === 'true' ? 'right' : 'left' // Align text based on RTL
                                                    }}>
                                                        <div>
                                                            <strong>{comment.user?.name}</strong>
                                                        </div>

                                                        <div>
                                                            <p className='mb-0' style={{ fontSize: '12px' }}>
                                                                {new Date(comment.createdAt).toLocaleDateString('en-US', {
                                                                    year: 'numeric',
                                                                    month: 'long',
                                                                    day: 'numeric',
                                                                    hour: '2-digit',
                                                                    minute: '2-digit',
                                                                    hour12: true
                                                                })}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p className='mutual_heading_class' style={{ fontSize: '14px', color: '#888', textAlign: rtl === 'true' ? 'right' : 'left' }}>
                                            {rtl === 'true' ? 'لا توجد تعليقات بعد. كن أول من يضيف تعليقاً!' : 'No comments yet. Be the first to add one!'}
                                        </p>
                                    )}
                                </div>

                                {/* Text area for adding a new comment */}
                                <Form.Group controlId="commentTextarea" className="mt-3">
                                    <Form.Control
                                        as="textarea"
                                        rows={1}
                                        value={currentComment}
                                        onChange={(e) => setCurrentComment(e.target.value)}
                                        placeholder={rtl === 'true' ? 'أدخل تعليقك هنا' : 'Enter your comment here'}
                                        className='input_field_input_field'
                                        style={{ textAlign: rtl === 'true' ? 'right' : 'left' }} // Align text area based on RTL
                                    />
                                </Form.Group>
                            </Modal.Body>
                            <Modal.Footer style={{ border: 'none', direction: rtl === 'true' ? 'rtl' : 'ltr' }}>
                                <Button className='all_common_btn_single_lead'  onClick={() => handleSaveComment(currentIdForComments)}>
                                    {rtl === 'true' ? 'حفظ التعليق' : 'Save Comment'}  {/* Localize button text */}
                                </Button>
                            </Modal.Footer>
                        </Modal>

                        {/* Convert to Lead Confirmation Modal */}
                        <Modal show={showConvertModal} onHide={() => setShowConvertModal(false)} centered >
                            <Modal.Header closeButton>
                                <Modal.Title>Confirm Conversion</Modal.Title>
                            </Modal.Header>
                            <Modal.Body>Are you sure you want to convert this status to Lead?</Modal.Body>
                            <Modal.Footer>
                                <Button className='button_one' onClick={handleConfirmConversion}>
                                    Confirm
                                </Button>
                            </Modal.Footer>
                        </Modal>
                    </Col>
                </Row>
                <CreatePhoneBook fetchData={fetchData} phoneBookModal={phoneBookModal} setPhoneBookModal={setPhoneBookModal} phoneBookNumber={phoneBookNumber} setPhoneBookNumber={setPhoneBookNumber} phoneID={phoneID} />
            </Container>
        </>
    );
};

export default CEOphoneBook;
