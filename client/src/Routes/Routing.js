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
import Dashboard from '../Pages/Dashboard'
import TeamLeaderUnassigned from '../Pages/UnAssignTeamLeader'
import SingleDeal from '../Components/singleDeal/SingleDeal'
import ContractCommissionDetails from '../Components/singleContract/ContractCommissionDetails'
import AccountantDashboard from '../Pages/AccountantDashboard'
import CommissionsList from '../Pages/CommissionList'
import Deal from '../Components/Deal'
import DealStages from '../Pages/DealStages'
import RejectedDeals from '../Components/singleDeal/RejectedDeals'
import RejectedContract from '../Components/singleContract/RejectedContract'
import CeoMainDashboard from '../Pages/CeoMainDashboard'
import HodDashboard from '../Pages/HodDashboard'
import SidebarComponent from '../Components/sidebar/Sidebar'

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
                <Route path="/leads" element={<ProtectedRoute element={CEODashboard} requiredPermission="crm_dashboard" />} />
                <Route path="/createlabels" element={<ProtectedRoute element={CreateLabels} requiredPermission="label_management" />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/superadmindashboard" element={<SuperAdminDashboard />} />
                <Route path="/single-leads/:id" element={<SingleLead />} />
                <Route path="/rejectedlead" element={<RejectedLeads />} />
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
                <Route path="/unsigned" element={<Unsigned />} />
                <Route path="/request" element={<Request />} />
                <Route path="/ceounassign" element={<CeoUnassign />} />
                <Route path="/ceophonebook" element={<CEOphoneBook />} />
                <Route path="/hodphonebook" element={<HodPhoneBook />} />
                <Route path="/phonebook" element={<PhoneBook />} />
                <Route path="/superadminphonebook" element={<SuperAdminPhoneBook />} />
                <Route path="/blocklist" element={<Blocklist />} />
                <Route path="/convertedlead" element={<LeadConverted />} />
                <Route path="/generatereport" element={<GenerateReport />} />
                <Route path="/contract" element={<Contract />} />
                <Route path="/rejectedcontract" element={<RejectedContract />} />
                <Route path="/contractcommissiondetails" element={<ContractCommissionDetails />} />
                <Route path="/contracts/:id" element={<SingleContract />} />
                <Route path="/contractstages" element={<ContractStages />} />
                <Route path="/teamleaderunassigned" element={<TeamLeaderUnassigned />} />
                <Route path="/singledeal/:id" element={<SingleDeal />} />
                <Route path="/deal" element={<Deal />} />
                <Route path="/rejecteddeals" element={<RejectedDeals />} />
                <Route path="/dealstages" element={<DealStages />} />
                <Route path="/accountantdashboard" element={<AccountantDashboard />} />
                <Route path="/commissionslist" element={<CommissionsList />} />
                <Route path="/ceodashboard" element={<CeoMainDashboard />} />
                <Route path="/hoddashboard" element={<HodDashboard />} />
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