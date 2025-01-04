import React, { useState, useEffect } from 'react';
import { ProSidebar, Menu, MenuItem, SubMenu } from 'react-pro-sidebar';
import 'react-pro-sidebar/dist/css/styles.css';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Button, Image, Modal } from 'react-bootstrap';
import { FaUsers, FaFolder, FaFileAlt, FaChartLine, FaCog, FaPhoneAlt, FaSignOutAlt, FaBell } from 'react-icons/fa';
import { logoutUser, fetchUpdatedPermission, refreshToken, logout } from '../../Redux/loginSlice';
import { IoIosArrowDown } from 'react-icons/io';
import './sidebar.css'; // Custom styling
import defaultImage from '../../Assets/default_image.jpg';
import axios from 'axios';
import io from 'socket.io-client';
import { RiContractFill } from "react-icons/ri";
import { FcManager } from "react-icons/fc";
import { SiNginxproxymanager } from "react-icons/si";
import { MdManageAccounts } from "react-icons/md";
import { BiCodeAlt } from "react-icons/bi";
import { RxDashboard } from "react-icons/rx";
import Calculator from '../../Pages/Calculator';


const SidebarComponent = () => {
    const [showNotificationsModal, setShowNotificationsModal] = useState(false);
    const [collapsed, setCollapsed] = useState(false); // State to manage sidebar collapse
    const [openSubMenu, setOpenSubMenu] = useState(null);
    const [rtl, setRtl] = useState(false); // State to toggle RTL mode
    const userID = useSelector(state => state.loginSlice.user?._id);
    const userId = useSelector(state => state.loginSlice.user?._id);
    const token = useSelector(state => state.loginSlice.user?.token);
    const userImage = useSelector(state => state.loginSlice.user?.image);
    const userName = useSelector(state => state.loginSlice.user?.name);
    const userEmail = useSelector(state => state.loginSlice.user?.email);
    const userRole = useSelector(state => state.loginSlice.user?.role);
    const [socket, setSocket] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionCount, setActionCount] = useState(0);
    const [pendingCount, setPendingCount] = useState(0);
    const [notifications, setNotifications] = useState([]);
    const [requests, setRequests] = useState([]);
    const [currentTime, setCurrentTime] = useState('');
    const [openCalculator, setOpenCalculator] = useState(false);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    // const notificationSound = new Audio('/goat.mp3');
    // notificationSound.preload = 'auto'; 

    // Update the clock every second
    useEffect(() => {
        const updateClock = () => {
            const now = new Date();
            setCurrentTime(now.toLocaleTimeString());
        };

        updateClock(); // Set the initial time
        const clockInterval = setInterval(updateClock, 1000); // Update the time every second
        return () => clearInterval(clockInterval);
    }, []);

    useEffect(() => {
        if (userID) {
            const newSocket = io(``, {
                query: { userId: userID },
                transports: ['websocket'],
            });
            setSocket(newSocket);
            // Handle incoming notifications
            newSocket.on('notification', (data) => {
                // try {
                //     notificationSound.currentTime = 0; // Reset playback to the start
                //     notificationSound.play().catch((error) => {
                //         console.error('Failed to play notification sound:', error);
                //     });
                // } catch (err) {
                //     console.error('Error managing notification sound:', err);
                // }
                setNotifications(prevNotifications => [
                    ...prevNotifications,
                    {
                        message: data.message,
                        leadId: data.referenceId,
                        notificationType: data.notificationType,
                        notificationId: data.notificationId,
                        createdAt: data.createdAt,
                        read: false
                    }
                ]);
            });
            newSocket.on('permission-update', async (data) => {
                await dispatch(fetchUpdatedPermission()); // Fetch updated permissions 
                const refreshResponse = await dispatch(refreshToken()); // Refresh token
                if (refreshResponse.payload) {
                    console.log('Token refreshed:', refreshResponse.payload.token); // Log the new token
                }
            });

            newSocket.on('logout-notification', async (data) => {
                await dispatch(logoutUser());
                dispatch(logout());
                navigate('/');

            });

            // Disconnect socket on component unmount
            return () => {
                newSocket.disconnect();
            };
        }
    }, [userID]);

    const fetchRequests = async () => {
        try {
            const response = await axios.get(
                `/api/request/my-requests`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                }
            );
            if (response.data && response.data.data) {
                const fetchedRequests = response.data.data;
                setRequests(fetchedRequests);
                // Count pending requests where the user is a receiver
                const pending = fetchedRequests.filter(request =>
                    request.receivers.some(receiver => receiver._id === userId) && request.action === 'Pending'
                );
                setPendingCount(pending.length);
                // Count accepted or declined requests where the sender is the logged-in user and read is false
                const actionTaken = fetchedRequests.filter(request =>
                    request.sender._id === userId &&
                    (request.action === 'Accept' || request.action === 'Decline') &&
                    request.read === false // Only count if read is false
                );
                setActionCount(actionTaken.length);
            } else {
                setRequests([]);
                setPendingCount(0);
                setActionCount(0);  // Reset actionCount when no requests
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Error fetching requests');
        } finally {
            setLoading(false);
        }
    };
    const logoutHandler = () => {
        dispatch(logoutUser());
        dispatch(logout());
        navigate('/');
    };

    const markAsRead = async (notificationId) => {
        try {
            const response = await fetch(`/api/notifications/mark-as-read/${notificationId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
            });

            if (response.ok) {
                setNotifications(prevNotifications =>
                    prevNotifications.map(notification =>
                        notification.notificationId === notificationId
                            ? { ...notification, read: true }
                            : notification
                    )
                );
            } else {
                console.error('Failed to mark notification as read');
            }
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const closeNotificationsModal = () => {
        setShowNotificationsModal(false);
    };

    const unreadNotifications = notifications.filter(notification => !notification.read);
    useEffect(() => {
        fetchRequests();
    }, [token, userId]);

    const handleShowNotifications = () => setShowNotificationsModal(true);

    // Get rtl state from localStorage on initial load
    useEffect(() => {
        const savedRtl = localStorage.getItem('rtl') === 'true';
        setRtl(savedRtl);
    }, []);

    useEffect(() => {
        // Automatically collapse sidebar if route is /leads
        if (location.pathname === '/leads') {
            setCollapsed(true);
        } else {
            setCollapsed(false);
        }
    }, [location.pathname]);

    const handleMouseEnter = () => {
        if (collapsed) setCollapsed(false); // Expand the sidebar on hover
    };

    const handleMouseLeave = () => {
        if (location.pathname === '/leads') setCollapsed(true); // Collapse again if the route is /leads
    };
    const toggleRtl = () => {
        const newRtlState = !rtl; // Toggle RTL state
        setRtl(newRtlState); // Update state
        // Save the updated RTL state to localStorage
        localStorage.setItem('rtl', newRtlState); // Convert to string for storage
        window.location.reload();
    };

    const getDashboardRoute = (userRole) => {
        switch (userRole) {
            case 'CEO':
                return '/ceodashboard';
            case 'HOD':
                return '/hoddashboard';
            default:
                return '/dashboard';
        }
    };

    const toggleSubMenu = (menuName) => {
        setOpenSubMenu(openSubMenu === menuName ? null : menuName);
    };

    return (
        <div style={{ display: 'flex', flexDirection: rtl ? 'row-reverse' : 'row' }}>
            <ProSidebar
                rtl={rtl}
                collapsed={collapsed}
                style={{
                    height: '100%',
                    maxHeight: 'auto',
                    overflowY: 'auto',
                    backgroundColor: '#333',
                    color: '#fff',
                    position: 'fixed',
                    [rtl ? 'right' : 'left']: 0,
                    transition: 'all 0.3s ease',
                }}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
            >
                <div style={{ textAlign: 'center', padding: '20px' }}>
                    {!collapsed && (
                        <Image
                            src={userImage ? `/images/${userImage}` : defaultImage}
                            alt={`${userName || 'User'} Image`}
                            style={{
                                width: '100px',
                                height: '100px',
                                borderRadius: '50%',
                                border: '2px solid #d7aa47',
                            }}
                        />
                    )}
                    {!collapsed && (
                        <>
                            <p style={{ margin: '10px 0', color: '#ffa000', fontWeight: 'bold' }}>
                                {userName || 'User Name'}
                            </p>
                            <p style={{ margin: '5px 0', fontSize: '14px', color: '#bbb' }}>{userRole || 'Role'}</p>
                            <p className='mb-0' style={{ margin: '5px 0', fontSize: '12px', color: '#bbb' }}>{userEmail || 'Email'}</p>
                        </>
                    )}
                </div>
                <p className='mb-0' style={{ fontSize: '20px', fontWeight: '500', color: '#d7aa47', textAlign: 'center' }}>{currentTime}</p>
                <Menu>
                    <MenuItem>
                        <Button
                            variant="link"
                            style={{
                                color: '#fff',
                                padding: '0',
                                display: 'flex',
                                alignItems: 'center',
                                textDecoration: 'none',
                                marginLeft: '6px'
                            }}
                            onClick={() => navigate(getDashboardRoute(userRole))}
                        >
                            <RxDashboard
                                style={{
                                    marginRight: rtl === 'true' ? '0' : '10px',
                                    marginLeft: rtl === 'true' ? '10px' : '0',
                                    fontSize: '20px',
                                    color: '#ffa000'
                                }}
                            />
                            {rtl === 'true' ? 'الإشعارات' :
                                userRole === 'CEO' ? 'Dashboard' :
                                    userRole === 'HOD' ? 'Dashboard' : 'Dashboard'}
                        </Button>
                    </MenuItem>

                    <MenuItem>
                        <Button
                            variant="link"
                            style={{
                                color: '#fff',
                                padding: '0',
                                display: 'flex',
                                alignItems: 'center',
                                textDecoration: 'none',
                                marginLeft: '6px'
                            }}
                            // onClick={() => navigate('/calculator')}
                            onClick={() => setOpenCalculator(true)}
                        >
                            <RxDashboard
                                style={{
                                    marginRight: rtl === 'true' ? '0' : '10px',
                                    marginLeft: rtl === 'true' ? '10px' : '0',
                                    fontSize: '20px',
                                    color: '#ffa000'
                                }}
                            />
                            Calculator
                        </Button>
                    </MenuItem>

                    <SubMenu
                        title={rtl === 'true' ? 'دليل الهاتف' : 'PhoneBook'}
                        icon={<FaPhoneAlt style={{ color: '#ffa000', fontSize: '20px' }} />}
                        isOpen={openSubMenu === 'phonebook'}
                        onTitleClick={() => toggleSubMenu('phonebook')}

                    >
                        {!['Super Admin', 'HOD', 'Manager', 'CEO', 'Coordinator'].includes(userRole) && (
                            <MenuItem
                                style={{
                                    textAlign: rtl === 'true' ? 'right' : 'right',
                                    direction: rtl === 'true' ? 'rtl' : 'rtl',
                                }}
                            >
                                <Link to="/phonebook" className="sidebar_link">
                                    {rtl === 'true' ? 'دليل الهاتف' : 'PhoneBook'}
                                </Link>
                            </MenuItem>
                        )}

                        {userRole === 'CEO' && (
                            <MenuItem
                                style={{
                                    textAlign: rtl === 'true' ? 'right' : 'left',
                                    direction: rtl === 'true' ? 'rtl' : 'ltr',
                                }}
                            >
                                <Link to="/ceophonebook" className="sidebar_link">
                                    {rtl === 'true' ? 'دليل الهاتف للرئيس التنفيذي' : 'PhoneBook'}
                                </Link>
                            </MenuItem>
                        )}

                        {['HOD', 'Manager', 'Coordinator'].includes(userRole) && (
                            <MenuItem
                                style={{
                                    textAlign: rtl === 'true' ? 'right' : 'left',
                                    direction: rtl === 'true' ? 'rtl' : 'ltr',
                                }}
                            >
                                <Link to="/HodPhoneBook" className="sidebar_link">
                                    {rtl === 'true' ? 'دليل الهاتف للرؤساء' : 'PhoneBook'}
                                </Link>
                            </MenuItem>
                        )}

                        <MenuItem
                            style={{
                                textAlign: rtl === 'true' ? 'right' : 'left',
                                direction: rtl === 'true' ? 'rtl' : 'ltr',
                            }}
                        >
                            <Link to="/blocklist" className="mt-3">
                                {rtl === 'true' ? 'قائمة الحظر' : 'BlockList'}
                            </Link>
                        </MenuItem>

                        <MenuItem
                            style={{
                                textAlign: rtl === 'true' ? 'right' : 'left',
                                direction: rtl === 'true' ? 'rtl' : 'ltr',
                            }}
                        >
                            <Link to="/convertedlead" className="mt-3">
                                {rtl === 'true' ? 'العملاء المحولين' : 'Lead Converted'}
                            </Link>
                        </MenuItem>
                    </SubMenu>

                    <SubMenu
                        title={rtl === 'true' ? 'إدارة القادة' : 'Lead Management'}
                        icon={<FcManager style={{ fontSize: '24px' }} />}
                        isOpen={openSubMenu === 'leadManagement'}
                        onTitleClick={() => toggleSubMenu('leadManagement')}
                    >
                        <MenuItem
                            style={{
                                textAlign: rtl === 'true' ? 'right' : 'left',
                                direction: rtl === 'true' ? 'rtl' : 'ltr',
                            }}
                        >
                            <Link to={'/leads'} className='sidebar_link'>
                                {rtl === 'true' ? 'القادة' : 'Leads'}
                            </Link>
                        </MenuItem>

                        <MenuItem
                            style={{
                                textAlign: rtl === 'true' ? 'right' : 'left',
                                direction: rtl === 'true' ? 'rtl' : 'ltr',
                            }}
                        >
                            <Link to={'/rejectedlead'} className='sidebar_link'>
                                {rtl === 'true' ? 'المرفوضة' : 'Rejected'}
                            </Link>
                        </MenuItem>

                        {userRole === 'CEO' && (
                            <>
                                <MenuItem
                                    style={{
                                        textAlign: rtl === 'true' ? 'right' : 'left',
                                        direction: rtl === 'true' ? 'rtl' : 'ltr',
                                    }}
                                >
                                    <Link to={'/ceounassign'} className='sidebar_link'>
                                        {rtl === 'true' ? 'إلغاء التعيين' : 'UnAssign'}
                                    </Link>
                                </MenuItem>
                                <MenuItem
                                    style={{
                                        textAlign: rtl === 'true' ? 'right' : 'left',
                                        direction: rtl === 'true' ? 'rtl' : 'ltr',
                                    }}
                                >
                                    <Link to={'/request'} className='sidebar_link'>
                                        {rtl === 'true' ? 'طلبات القادة' : 'Lead Requests'} {actionCount > 0 && `(${actionCount})`} {pendingCount > 0 && `(${pendingCount})`}
                                    </Link>
                                </MenuItem>
                                <MenuItem
                                    style={{
                                        textAlign: rtl === 'true' ? 'right' : 'left',
                                        direction: rtl === 'true' ? 'rtl' : 'ltr',
                                    }}
                                >
                                    <Link to={'/createlabels'} className='sidebar_link'>
                                        {rtl === 'true' ? 'إدارة العلامات' : 'Label Management'}
                                    </Link>
                                </MenuItem>
                            </>
                        )}


                        {(userRole === 'HOD' || userRole === 'Manager') && (
                            <>
                                <MenuItem
                                    style={{
                                        textAlign: rtl === 'true' ? 'right' : 'left',
                                        direction: rtl === 'true' ? 'rtl' : 'ltr',
                                    }}
                                >
                                    <Link to={'/unsigned'} className='sidebar_link'>
                                        {rtl === 'true' ? 'إلغاء التعيين HOD' : 'UnAssign'}
                                    </Link>
                                </MenuItem>

                                <MenuItem
                                    style={{
                                        textAlign: rtl === 'true' ? 'right' : 'left',
                                        direction: rtl === 'true' ? 'rtl' : 'ltr',
                                    }}
                                >
                                    <Link to={'/request'} className='sidebar_link'>
                                        {rtl === 'true' ? 'طلبات القادة' : 'Lead Requests'} {actionCount > 0 && `(${actionCount})`} {pendingCount > 0 && `(${pendingCount})`}
                                    </Link>
                                </MenuItem>

                                <MenuItem
                                    style={{
                                        textAlign: rtl === 'true' ? 'right' : 'left',
                                        direction: rtl === 'true' ? 'rtl' : 'ltr',
                                    }}
                                >
                                    <Link to={'/createlabels'} className='sidebar_link'>
                                        {rtl === 'true' ? 'إدارة العلامات' : 'Label Management'}
                                    </Link>
                                </MenuItem>
                                {userRole === 'Team Leader' && (
                                    <MenuItem
                                        style={{
                                            textAlign: rtl === 'true' ? 'right' : 'left',
                                            direction: rtl === 'true' ? 'rtl' : 'ltr',
                                        }}
                                    >
                                        <Link to={'/teamleaderunassigned'} className='sidebar_link'>
                                            {rtl === 'true' ? 'إدارة العلامات' : 'Team Leader Unassign'}
                                        </Link>
                                    </MenuItem>
                                )}
                            </>
                        )}

                        {(userRole === 'Super Admin' || userRole === 'Developer') && (
                            <>
                                <MenuItem
                                    style={{
                                        textAlign: rtl === 'true' ? 'right' : 'left',
                                        direction: rtl === 'true' ? 'rtl' : 'ltr',
                                    }}
                                >
                                    <Link to={'/request'} className='sidebar_link'>
                                        {rtl === 'true' ? 'طلبات القادة' : 'Lead Requests'} {actionCount > 0 && `(${actionCount})`} {pendingCount > 0 && `(${pendingCount})`}
                                    </Link>
                                </MenuItem>
                                <MenuItem
                                    style={{
                                        textAlign: rtl === 'true' ? 'right' : 'left',
                                        direction: rtl === 'true' ? 'rtl' : 'ltr',
                                    }}
                                >
                                    <Link to={'/createlabels'} className='sidebar_link'>
                                        {rtl === 'true' ? 'إدارة العلامات' : 'Label Management'}
                                    </Link>
                                </MenuItem>

                                <MenuItem
                                    style={{
                                        textAlign: rtl === 'true' ? 'right' : 'left',
                                        direction: rtl === 'true' ? 'rtl' : 'ltr',
                                    }}
                                >
                                    <Link to={'/ceounassign'} className='sidebar_link'>
                                        {rtl === 'true' ? 'إلغاء التعيين' : 'UnAssign/CEO'}
                                    </Link>
                                </MenuItem>

                                <MenuItem
                                    style={{
                                        textAlign: rtl === 'true' ? 'right' : 'left',
                                        direction: rtl === 'true' ? 'rtl' : 'ltr',
                                    }}
                                >
                                    <Link to={'/unsigned'} className='sidebar_link'>
                                        {rtl === 'true' ? 'إلغاء التعيين HOD' : 'UnAssign/HOD'}
                                    </Link>
                                </MenuItem>
                            </>
                        )}
                    </SubMenu>

                    <SubMenu
                        title={rtl === 'true' ? 'العقد' : 'Contract'}
                        icon={<RiContractFill style={{ color: '#ffa000', fontSize: '20px' }} />}
                    >
                        <MenuItem
                            style={{
                                textAlign: rtl === 'true' ? 'right' : 'left',
                                direction: rtl === 'true' ? 'rtl' : 'ltr',
                            }}
                        >
                            <Link to="/contract">
                                {rtl === 'true' ? 'العقد' : 'Contract'}
                            </Link>
                        </MenuItem>

                        <MenuItem
                            style={{
                                textAlign: rtl === 'true' ? 'right' : 'left',
                                direction: rtl === 'true' ? 'rtl' : 'ltr',
                            }}
                        >
                            <Link to="/rejectedcontract">
                                {rtl === 'true' ? 'العقد' : 'Rejected Contract'}
                            </Link>
                        </MenuItem>
                    </SubMenu>

                    <SubMenu
                        title={rtl === 'true' ? 'العقد' : 'Deals'}
                        icon={<BiCodeAlt style={{ color: '#ffa000', fontSize: '20px' }} />}
                    >
                        <MenuItem
                            style={{
                                textAlign: rtl === 'true' ? 'right' : 'left',
                                direction: rtl === 'true' ? 'rtl' : 'ltr',
                            }}
                        >
                            <Link to="/deal">
                                {rtl === 'true' ? 'العقد' : 'Deals'}
                            </Link>
                        </MenuItem>

                        <MenuItem
                            style={{
                                textAlign: rtl === 'true' ? 'right' : 'left',
                                direction: rtl === 'true' ? 'rtl' : 'ltr',
                            }}
                        >
                            <Link to="/rejecteddeals">
                                {rtl === 'true' ? 'العقد' : 'Rejected Deals'}
                            </Link>
                        </MenuItem>
                    </SubMenu>

                    <SubMenu
                        title={rtl === 'true' ? 'العقد' : 'Accounts'}
                        icon={<MdManageAccounts style={{ color: '#ffa000', fontSize: '20px' }} />}
                    >
                        <MenuItem
                            style={{
                                textAlign: rtl === 'true' ? 'right' : 'left',
                                direction: rtl === 'true' ? 'rtl' : 'ltr',
                            }}
                        >
                            <Link to="/accountantdashboard">
                                {rtl === 'true' ? 'العقد' : 'Accounts'}
                            </Link>
                        </MenuItem>

                        <MenuItem
                            style={{
                                textAlign: rtl === 'true' ? 'right' : 'left',
                                direction: rtl === 'true' ? 'rtl' : 'ltr',
                            }}
                        >
                            <Link to="/commissionslist">
                                {rtl === 'true' ? 'العقد' : 'Commissions List'}
                            </Link>
                        </MenuItem>
                    </SubMenu>

                    {(userRole === 'Super Admin' || userRole === 'Developer') && (
                        <SubMenu
                            title={rtl === 'true' ? 'إدارة التطبيق' : 'App Management'}
                            icon={<SiNginxproxymanager style={{ color: '#ffa000', fontSize: '20px' }} />}
                        >
                            <MenuItem
                                style={{
                                    textAlign: rtl === 'true' ? 'right' : 'left',
                                    direction: rtl === 'true' ? 'rtl' : 'ltr',
                                }}
                            >
                                <Link to="/product">
                                    {rtl === 'true' ? 'العقد' : 'Products'}
                                </Link>
                            </MenuItem>

                            <MenuItem
                                style={{
                                    textAlign: rtl === 'true' ? 'right' : 'left',
                                    direction: rtl === 'true' ? 'rtl' : 'ltr',
                                }}
                            >
                                <Link to="/branches">
                                    {rtl === 'true' ? 'العقد' : 'Branches'}
                                </Link>
                            </MenuItem>

                            <MenuItem
                                style={{
                                    textAlign: rtl === 'true' ? 'right' : 'left',
                                    direction: rtl === 'true' ? 'rtl' : 'ltr',
                                }}
                            >
                                <Link to="/pipelines">
                                    {rtl === 'true' ? 'العقد' : 'Pipelines'}
                                </Link>
                            </MenuItem>

                            <MenuItem
                                style={{
                                    textAlign: rtl === 'true' ? 'right' : 'left',
                                    direction: rtl === 'true' ? 'rtl' : 'ltr',
                                }}
                            >
                                <Link to="/productstages">
                                    {rtl === 'true' ? 'العقد' : 'Product Stages'}
                                </Link>
                            </MenuItem>

                            <MenuItem
                                style={{
                                    textAlign: rtl === 'true' ? 'right' : 'left',
                                    direction: rtl === 'true' ? 'rtl' : 'ltr',
                                }}
                            >
                                <Link to="/leadtype">
                                    {rtl === 'true' ? 'العقد' : 'Lead Type'}
                                </Link>
                            </MenuItem>

                            <MenuItem
                                style={{
                                    textAlign: rtl === 'true' ? 'right' : 'left',
                                    direction: rtl === 'true' ? 'rtl' : 'ltr',
                                }}
                            >
                                <Link to="/sources">
                                    {rtl === 'true' ? 'العقد' : 'Sources'}
                                </Link>
                            </MenuItem>

                            <MenuItem
                                style={{
                                    textAlign: rtl === 'true' ? 'right' : 'left',
                                    direction: rtl === 'true' ? 'rtl' : 'ltr',
                                }}
                            >
                                <Link to="/allusers">
                                    {rtl === 'true' ? 'العقد' : 'Users'}
                                </Link>
                            </MenuItem>


                            <MenuItem
                                style={{
                                    textAlign: rtl === 'true' ? 'right' : 'left',
                                    direction: rtl === 'true' ? 'rtl' : 'ltr',
                                }}
                            >
                                <Link to="/usermanagement">
                                    {rtl === 'true' ? 'العقد' : 'User Management'}
                                </Link>
                            </MenuItem>

                            <MenuItem
                                style={{
                                    textAlign: rtl === 'true' ? 'right' : 'left',
                                    direction: rtl === 'true' ? 'rtl' : 'ltr',
                                }}
                            >
                                <Link to="/leadapiconfig">
                                    {rtl === 'true' ? 'العقد' : 'Lead Api Config'}
                                </Link>
                            </MenuItem>

                            <MenuItem
                                style={{
                                    textAlign: rtl === 'true' ? 'right' : 'left',
                                    direction: rtl === 'true' ? 'rtl' : 'ltr',
                                }}
                            >
                                <Link to="/session">
                                    {rtl === 'true' ? 'العقد' : 'Session'}
                                </Link>
                            </MenuItem>

                            <MenuItem
                                style={{
                                    textAlign: rtl === 'true' ? 'right' : 'left',
                                    direction: rtl === 'true' ? 'rtl' : 'ltr',
                                }}
                            >
                                <Link to="/contractstages">
                                    {rtl === 'true' ? 'العقد' : 'Contract Stages'}
                                </Link>
                            </MenuItem>

                            <MenuItem
                                style={{
                                    textAlign: rtl === 'true' ? 'right' : 'left',
                                    direction: rtl === 'true' ? 'rtl' : 'ltr',
                                }}
                            >
                                <Link to="/dealstages">
                                    {rtl === 'true' ? 'العقد' : 'Deal Stages'}
                                </Link>
                            </MenuItem>
                        </SubMenu>
                    )}

                    <MenuItem>
                        <Button
                            variant="link"
                            style={{
                                color: '#fff',
                                padding: '0',
                                display: 'flex',
                                alignItems: 'center',
                                textDecoration: 'none',
                                marginLeft: '6px'
                            }}
                            onClick={handleShowNotifications}
                        >
                            <FaBell
                                style={{
                                    marginRight: rtl === 'true' ? '0' : '10px',
                                    marginLeft: rtl === 'true' ? '10px' : '0',
                                    fontSize: '20px',
                                    color: '#ffa000'
                                }}
                            />
                            {rtl === 'true' ? 'الإشعارات' : `Notifications (${unreadNotifications.length})`}
                        </Button>
                    </MenuItem>

                    <MenuItem>
                        <Button
                            to="#"
                            style={{
                                color: '#fff',
                                padding: '0',
                                textDecoration: 'none',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: rtl === 'true' ? 'flex-end' : 'flex-start',
                                marginLeft: rtl === 'true' ? '0' : '10px',
                                backgroundColor: 'transparent',
                                border: 'none'
                            }}
                            onClick={logoutHandler}
                        >
                            <FaSignOutAlt
                                style={{
                                    marginRight: rtl === 'true' ? '0' : '10px',
                                    marginLeft: rtl === 'true' ? '10px' : '0',
                                    fontSize: '20px',
                                    color: '#ffa000'
                                }}
                            />
                            {rtl === 'true' ? 'تسجيل الخروج' : 'Logout'}
                        </Button>


                    </MenuItem>



                </Menu>

                {/* Move the RTL toggle button to the footer */}
                <div
                    style={{
                        width: '100%',
                        padding: '10px',
                        textAlign: 'center',
                    }}
                >
                    <Button
                        variant="primary"
                        onClick={toggleRtl}
                        style={{
                            width: '100%',
                            backgroundColor: '#d7aa47',
                            border: 'none',
                            color: '#fff',
                            transition: 'all 0.3s ease-in-out', // Smooth transition for hover effect
                            transform: 'scale(1)', // Initial scale for hover effect
                        }}
                    >
                        {rtl ? 'English' : 'عربي'}
                    </Button>
                </div>

                <Modal show={showNotificationsModal} onHide={closeNotificationsModal} size="lg">
                    <Modal.Header
                        closeButton
                        style={{
                            border: 'none',
                            textAlign: rtl === 'true' ? 'right' : 'left',
                            direction: rtl === 'true' ? 'rtl' : 'ltr',
                        }}
                    >
                        <Modal.Title className="mutual_class_color">
                            {rtl === 'true' ? 'الإشعارات' : 'Notifications'}
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body
                        style={{
                            height: '100%',
                            maxHeight: '750px',
                            overflowY: 'auto',
                            textAlign: rtl === 'true' ? 'right' : 'left',
                            direction: rtl === 'true' ? 'rtl' : 'ltr',
                        }}
                    >
                        {notifications.length === 0 ? (
                            <p className="mutual_class_color">
                                {rtl === 'true' ? 'لا توجد إشعارات متاحة.' : 'No Notifications Available.'}
                            </p>
                        ) : (
                            notifications.map((notification) => (
                                <div
                                    key={notification.notificationId}
                                    style={{
                                        marginBottom: '10px',
                                        borderBottom: '1px solid #d7aa47',
                                        paddingBottom: '10px',
                                    }}
                                >
                                    <p className="mutual_heading_class">
                                        {rtl === 'true' ? notification.messageArabic : notification.message}
                                    </p>
                                    {!notification.read && (
                                        <Button
                                            onClick={() =>
                                                console.log(
                                                    `Mark ${notification.notificationId} as read`
                                                )
                                            }
                                            variant="success"
                                            style={{
                                                marginTop: '10px',
                                                direction: rtl === 'true' ? 'rtl' : 'ltr',
                                            }}
                                        >
                                            {rtl === 'true' ? 'وضع علامة كمقروء' : 'Mark as Read'}
                                        </Button>
                                    )}
                                </div>
                            ))
                        )}
                    </Modal.Body>
                    <Modal.Footer
                        style={{
                            border: 'none',
                            textAlign: rtl === 'true' ? 'right' : 'left',
                            direction: rtl === 'true' ? 'rtl' : 'ltr',
                        }}
                    >
                        <Button variant="secondary" onClick={closeNotificationsModal}>
                            {rtl === 'true' ? 'إغلاق' : 'Close'}
                        </Button>
                    </Modal.Footer>
                </Modal>

                <Calculator openCalculator={openCalculator} setOpenCalculator={setOpenCalculator} />
            </ProSidebar>
        </div>
    );
};

export default SidebarComponent;
