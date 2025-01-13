import React from 'react'
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from 'react-router-dom'
import Login from '../Auth/login/Login'
import SuperAdminDashboard from '../Pages/SuperAdminDashboard'
import Allusers from '../Pages/Allusers'
import SingleLead from '../Pages/SingleLead'
import Contract from '../Pages/Contract'
import RejectedLeads from '../Pages/RejectedLeads'
import Branches from '../Components/SuperAdminPages/Branches'
import Pipelines from '../Components/SuperAdminPages/Pipelines'
import Sources from '../Components/SuperAdminPages/Sources'
import LeadType from '../Components/SuperAdminPages/LeadType'
import Products from '../Components/SuperAdminPages/Products'
import ProductStages from '../Components/SuperAdminPages/ProductStages'
import UserManagement from '../Pages/UserManagement'
import CEODashboard from '../Pages/CEODashboard'
import Unsigned from '../Pages/Unsigned'
import Request from '../Pages/Request'
import CeoUnassign from '../Pages/CeoUnassign'
import CEOphoneBook from '../Pages/phoneBook/CeoPhoneBook'
import HodPhoneBook from '../Pages/phoneBook/HodPhoneBook'
import PhoneBook from '../Pages/phoneBook/PhoneBook'
import SuperAdminPhoneBook from '../Pages/phoneBook/SuperAdminPhoneBook'
import Blocklist from '../Pages/phoneBook/BlockList'
import LeadConverted from '../Pages/phoneBook/LeadConverted'
import GenerateReport from '../Pages/phoneBook/GenerateReport'
import { useSelector } from 'react-redux'
import LeadApiConfig from '../Pages/LeadApiConfig'
import Session from '../Pages/Sessions'
import SingleContract from '../Pages/SingleContract '
import ContractStages from '../Components/SuperAdminPages/ContractStages'
import CreateLabels from '../Pages/CreateLabels'
import TeamLeaderUnassigned from '../Pages/UnAssignTeamLeader'
import SingleDeal from '../Components/singleDeal/SingleDeal'
import ContractCommissionDetails from '../Components/singleContract/ContractCommissionDetails'
import AccountantDashboard from '../Pages/AccountantDashboard'
import CommissionsList from '../Pages/CommissionList'
import Deal from '../Components/Deal'
import DealStages from '../Pages/DealStages'
import RejectedDeals from '../Components/singleDeal/RejectedDeals'
import RejectedContract from '../Components/singleContract/RejectedContract'
import CeoMainDashboard from '../Pages/ceoDashboard/CeoMainDashboard'
import HodDashboard from '../Pages/hodDashboard/HodDashboard'
import SidebarComponent from '../Components/sidebar/Sidebar'
import Dashboard from '../Pages/salesDashboard/Dashboard'
import HodDashboardDetails from '../Pages/hodDashboard/HodDashboardDetails'

const ProtectedRoute = ({ element: Component, requiredPermission, ...rest }) => {
    const permissions = useSelector(state => state.loginSlice.user?.permissions);
    return permissions && permissions?.includes(requiredPermission) ? (
        <Component {...rest} />
    ) : (
        <Navigate to="/" replace />
    );
};

const AppRoutes = () => {
    const location = useLocation();
    const isContractCommissionDetails = location.pathname === '/contractcommissiondetails';
    const isLoggedIn = useSelector(state => state.loginSlice.user?.token);

    return (
        <>
            {isLoggedIn && !isContractCommissionDetails && <SidebarComponent />}
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/leads" element={<ProtectedRoute element={CEODashboard} requiredPermission="view_lead" />} />
                <Route path="/createlabels" element={<ProtectedRoute element={CreateLabels} requiredPermission="label_management" />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/superadmindashboard" element={<SuperAdminDashboard />} />
                <Route path="/single-leads/:id" element={<ProtectedRoute element={SingleLead} requiredPermission="view_lead" />} />
                <Route path="/rejectedlead" element={<ProtectedRoute element={RejectedLeads} requiredPermission="view_lead" />} />
                <Route path="/allusers" element={<ProtectedRoute element={Allusers} requiredPermission="app_management" />} />
                <Route path="/branches" element={<ProtectedRoute element={Branches} requiredPermission="app_management" />} />
                <Route path="/pipelines" element={<ProtectedRoute element={Pipelines} requiredPermission="app_management" />} />
                <Route path="/leadtype" element={<ProtectedRoute element={LeadType} requiredPermission="app_management" />} />
                <Route path="/sources" element={<ProtectedRoute element={Sources} requiredPermission="app_management" />} />
                <Route path="/product" element={<ProtectedRoute element={Products} requiredPermission="app_management" />} />
                <Route path="/productstages" element={<ProtectedRoute element={ProductStages} requiredPermission="app_management" />} />
                <Route path="/usermanagement" element={<ProtectedRoute element={UserManagement} requiredPermission="app_management" />} />
                <Route path="/leadapiconfig" element={<ProtectedRoute element={LeadApiConfig} requiredPermission="app_management" />} />
                <Route path="/session" element={<ProtectedRoute element={Session} requiredPermission="app_management" />} />
                <Route path="/unsigned" element={<ProtectedRoute element={Unsigned} requiredPermission="unassigned_lead" />} />
                <Route path="/request" element={<Request />} />
                <Route path="/ceounassign" element={<ProtectedRoute element={CeoUnassign} requiredPermission="unassigned_lead" />} />
                <Route path="/ceophonebook" element={<ProtectedRoute element={CEOphoneBook} requiredPermission="show_phonebook" />} />
                <Route path="/hodphonebook" element={<ProtectedRoute element={HodPhoneBook} requiredPermission="show_phonebook" />} />
                <Route path="/phonebook" element={<ProtectedRoute element={PhoneBook} requiredPermission="show_phonebook" />} />
                <Route path="/superadminphonebook" element={<ProtectedRoute element={SuperAdminPhoneBook} requiredPermission="app_management" />} />
                <Route path="/blocklist" element={<Blocklist />} />
                <Route path="/convertedlead" element={<ProtectedRoute element={LeadConverted} requiredPermission="create_lead" />} />
                {/* <Route path="/generatereport" element={<GenerateReport />} /> */}
                <Route path="/contract" element={<ProtectedRoute element={Contract} requiredPermission="view_contract" />} />
                <Route path="/rejectedcontract" element={<ProtectedRoute element={RejectedContract} requiredPermission="view_contract" />} />
                <Route path="/contractcommissiondetails" element={<ProtectedRoute element={ContractCommissionDetails} requiredPermission="view_contract" />} />
                <Route path="/contracts/:id" element={<ProtectedRoute element={SingleContract} requiredPermission="view_contract" />} />
                <Route path="/contractstages" element={<ProtectedRoute element={ContractStages} requiredPermission="app_management" />} />
                <Route path="/teamleaderunassigned" element={<ProtectedRoute element={TeamLeaderUnassigned} requiredPermission="unassigned_lead" />} />
                <Route path="/singledeal/:id" element={<ProtectedRoute element={SingleDeal} requiredPermission="view_deal" />} />
                <Route path="/deal" element={<ProtectedRoute element={Deal} requiredPermission="view_deal" />} />
                <Route path="/rejecteddeals" element={<ProtectedRoute element={RejectedDeals} requiredPermission="view_deal" />} />
                <Route path="/dealstages" element={<ProtectedRoute element={DealStages} requiredPermission="app_management" />} />
                <Route path="/accountantdashboard" element={<ProtectedRoute element={AccountantDashboard} requiredPermission="accountant_management" />} />
                <Route path="/commissionslist" element={<ProtectedRoute element={CommissionsList} requiredPermission="accountant_management" />} />
                <Route path="/ceodashboard" element={<CeoMainDashboard />} />
                <Route path="/hoddashboard" element={<HodDashboard />} />
                <Route path="/hoddashboarddetails" element={<HodDashboardDetails />} />
            </Routes>
        </>
    );
};

const Routing = () => {
    return (
        <Router>
            <AppRoutes />
        </Router>
    );
};

export default Routing;