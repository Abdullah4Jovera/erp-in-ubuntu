import React, { useState, useEffect } from 'react';
import { Row, Col, Modal, Button, Form, Card } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import axios from 'axios';
import Select from 'react-select';
import './convertLeadStyle.css'
import { FiAlertCircle } from "react-icons/fi";
import { useNavigate } from 'react-router-dom';

const ConvertLead = ({ leadId, setLeadToContract, leadtocontract, fetchSingleLead, contractModal, setContractModal, singleLead, leads, rtl }) => {
    // Abu Dhabi Branch
    const token = useSelector(state => state.loginSlice.user?.token)
    const hasHodRole = singleLead?.selected_users?.some(user => user.role === "HOD");
    const hasManagerRole = singleLead?.selected_users?.some(user => user.role === "Manager");
    const hascoordinatorRole = singleLead?.selected_users?.some(user => user.role === "Coordinator");
    const hasTeamLeaderRole = singleLead?.selected_users?.some(user => user.role === "Team Leader");
    // Ajman Branch
    const hasCoordinatorInAjman = singleLead?.selected_users?.some(
        user => user.branch?.name === "Ajman" && user.role === "Coordinator"
    );

    const hasManagerInAjman = singleLead?.selected_users?.some(
        user => user.branch?.name === "Ajman" && user.role === "Manager"
    );

    const hasTeamLeaderInAjman = singleLead?.selected_users?.some(
        user => user.branch?.name === "Ajman" && user.role === "Team Leader"
    );
    // Dubai Branch
    const hasCoordinatorInDubai = singleLead?.selected_users?.some(
        user => user.branch?.name === "Dubai" && user.role === "Coordinator"
    );

    const hasManagerInDubai = singleLead?.selected_users?.some(
        user => user.branch?.name === "Dubai" && user.role === "Manager"
    );

    const hasTeamLeaderInDubai = singleLead?.selected_users?.some(
        user => user.branch?.name === "Dubai" && user.role === "Team Leader"
    );
    const [leadData, setLeadData] = useState({});
    // Dubai
    const [coordinatorDubaiOptions, setCoordinatorDubaiOptions] = useState([])
    const [teamLeaderDubaiOptions, setTeamLeaderDubaiOptions] = useState([])
    const [tsAgentDubaiOptions, setTsAgentDubaiOptions] = useState([])
    const [managerDubaiOptions, setManagerDubaiOptions] = useState([]);

    const [hodOptions, setHodOptions] = useState([]);
    const [hodReferalOptions, setHodReferalOptions] = useState([])
    const [ManagerReferalOptions, setManagerReferalOptions] = useState([])
    const [selectHodReferal, setSelectedHodReferal] = useState(null)
    const [selectManagerReferal, setSelectManagerReferal] = useState(null)
    const [managerOptions, setManagerOptions] = useState([]);
    const [managerAjmanOptions, setManagerAjmanOptions] = useState([]);
    const [coordinatorOptions, setCoordinatorOptions] = useState([]);
    const [coordinatorAjmanOptions, setCoordinatorAjmanOptions] = useState([]);
    const [teamLeaderOptions, setTeamLeaderOptions] = useState([]);
    const [teamLeaderAjmanOptions, setTeamLeaderAjmanOptions] = useState([]);
    const [tsAgentOptions, setTsAgentOptions] = useState([]);
    const [tsAgentAjmanOptions, setTsAgentAjmanOptions] = useState([]);
    const [developerOptions, setDeveloperOptions] = useState([])
    const [marketingOptions, setMarketingOptions] = useState([])
    const [financialAmount, setFinancialAmount] = useState('');
    const [bankCommission, setBankCommission] = useState('');
    const [customerCommission, setCustomerCommission] = useState('');
    const [revenueWithVat, setRevenueWithVat] = useState('');
    const [revenueWithoutVat, setRevenueWithoutVat] = useState('');
    const [brokerName, setBrokerName] = useState('')
    const [otherPersonName, setOtherPersonName] = useState('')
    const [teleSalesTeamLeaderOptions, setTeleSalesTeamLeaderOptions] = useState([]);
    const [teleTsAgentOptions, setTeleSalesTsAgentOptions] = useState([]);
    const [selectedHod, setSelectedHod] = useState(null);
    const [selectedManger, setSelectedManager] = useState(null);
    const [selectedAjmanManger, setSelectedAjmanManager] = useState(null);
    const [selectedDubaiManger, setSelectedDubaiManager] = useState(null);
    const [selectedCoordinator, setSelectedCoordinator] = useState(null)
    const [selectedDubaiCoordinator, setSelectedDubaiCoordinator] = useState(null)
    const [selectedAjmanCoordinator, setSelectedAjmanCoordinator] = useState(null)
    const [selectedTeamLeader, setSelectedTeamLeader] = useState(null)
    const [selectedAjmanTeamLeader, setSelectedAjmanTeamLeader] = useState(null)
    const [selectedTeamLeaderOne, setSelectedTeamLeaderOne] = useState(null)
    const [selectedSalesAgent, setSelectedSalesAgent] = useState(null)
    const [selectedDubaiTeamLeader, setSelectedDubaiTeamLeader] = useState(null)
    const [selectedDubaiSales, setSelectedDubaiSales] = useState(null)

    const [selectedSalesAgentOne, setSelectedSalesAgentOne] = useState(null)
    const [selectedSalesAgenttwo, setSelectedSalesAgentTwo] = useState(null)
    const [selectedSalesAgentAjman, setSelectedSalesAgentAjman] = useState(null)

    const [selectedMarketingManager, setSelectedMarketingManager] = useState(null)
    const [selectedMarketingManagerOne, setSelectedMarketingManagerOne] = useState(null)

    // IT Team
    const [selectedItManager, setSelectedItManager] = useState(null)
    const [developer, setDeveloper] = useState(null)
    const [developerOne, setDeveloperOne] = useState(null)
    const [developerTwo, setDeveloperTwo] = useState(null)

    const [selectedMarketingAgent, setSelectedMarketingAgent] = useState(null)
    const [selectedMarketingAgentOne, setSelectedMarketingOneAgent] = useState(null)

    const [selectedTeleSalesMaangers, setSelectedTeleSalesMaangers] = useState(null)
    const [selectedtelesalesTeamLeader, setSelectedTeleSalesTeamLeader] = useState(null)
    const [selectedtelesalesAgent, setSelectedTeleSalesAgent] = useState(null)
    const [selectedtelesalesAgentOne, setSelectedTeleSalesAgentOne] = useState(null)

    const [brokerCommission, setBrokerCommission] = useState(0);
    const [hodCommissionPercentage, setHodCommissionPercentage] = useState(0);
    const [hodCommission, setHodCommission] = useState(0);
    const [brokerCommissionValue, setBrokerCommissionValue] = useState(0);
    const [salesManagerCommissionPercentage, setSalesManagerCommissionPercentage] = useState(0);
    const [salesManagerCommission, setSalesManagerCommission] = useState(0);
    const [coordinatorCommissionPercentage, setCoordinatorCommissionPercentage] = useState(0);
    const [coordinatorCommission, setCoordinatorCommission] = useState(0);
    const [teamLeaderCommissionPercentage, setTeamLeaderCommissionPercentage] = useState(0);
    const [teamLeaderCommission, setTeamLeaderCommission] = useState(0);
    const [agentCommissionPercentage, setAgentCommissionPercentage] = useState(0);
    const [agentCommission, setAgentCommission] = useState(0);
    const [otherCommissionPercentage, setOtherCommissionPercentage] = useState(0);
    const [otherCommission, setOtherCommission] = useState(0);

    const [teleSalesHodCommissionPercentage, setTeleSalesHodCommissionPercentage] = useState(0);
    const [teleSalesHodCommission, setTeleSalesHodCommission] = useState(0);
    const [teleSalesTeamLeaderCommissionPercentage, setTeleSalesTeamLeaderCommissionPercentage] = useState(0);
    const [teleSalesTeamLeaderCommission, setTeleSalesTeamLeaderCommission] = useState(0);

    const [teleSalesAgentCommissionPercentage, setTeleSalesAgentCommissionPercentage] = useState(0);
    const [teleSalesAgentCommission, setTeleSalesAgentCommission] = useState(0);

    const [teleSalesAgentOneCommissionPercentage, setTeleSalesAgentOneCommissionPercentage] = useState(0);
    const [teleSalesAgentOneCommission, setTeleSalesAgentOneCommission] = useState(0);

    const [marketingManagerCommissionPercentage, setMarketingManagerCommissionPercentage] = useState(0);
    const [marketingManagerOneCommissionPercentage, setMarketingManagerOneCommissionPercentage] = useState(0);
    const [marketingManagerCommission, setMarketingManagerCommission] = useState(0);
    const [marketingManagerOneCommission, setMarketingManagerOneCommission] = useState(0);

    const [marketingAgentCommissionPercentage, setMarketingAgentCommissionPercentage] = useState(0);
    const [marketingAgentCommission, setMarketingAgentCommission] = useState(0);

    const [marketingAgentOneCommissionPercentage, setMarketingAgentOneCommissionPercentage] = useState(0);
    const [marketingAgentOneCommission, setMarketingAgentOneCommission] = useState(0);

    // IT Team Percentage
    const [ItManagerCommission, setItManagerCommission] = useState(0)
    const [ItManagerCommissionPercentage, setItManagerCommissionPercentage] = useState(0)

    const [developerCommission, setDeveloperCommission] = useState(0)
    const [developerCommissionPercentage, setDeveloperCommissionPercentage] = useState(0)

    const [developerOneCommission, setDeveloperOneCommission] = useState(0)
    const [developerOneCommissionPercentage, setDeveloperOneCommissionPercentage] = useState(0)

    const [developerTwoCommission, setDeveloperTwoCommission] = useState(0)
    const [developerTwoCommissionPercentage, setDeveloperTwoCommissionPercentage] = useState(0)

    const [salesManagerRefCommissionTransferPercentage, setSalesManagerRefCommissionTransferPercentage] = useState(0);
    const [salesManagerRefCommissionTransfer, setSalesManagerRefCommissionTransfer] = useState(0);
    const [agentRefCommissionPercentage, setAgentRefCommissionPercentage] = useState(0);
    const [agentRefCommission, setAgentRefCommission] = useState(0);
    const [teamLeaderOnePercentage, setTeamLeaderOnePercentage] = useState(0);
    const [teamLeaderOneCommission, setteamLeaderOneCommission] = useState(0);

    const [agentCommissionOnePercentage, setAgentCommissionOnePercentage] = useState(0);
    const [agentOneCommission, setAgentOneCommission] = useState(0);

    const [agentCommissionTwoPercentage, setAgentCommissiontwoPercentage] = useState(0);
    const [agentTwoCommission, setAgentTwoCommission] = useState(0);

    const [teamLeaderTwo, setTeamLeaderTwo] = useState(null);
    const [agentOneCommissionPercentage, setAgentOneCommissionPercentage] = useState(0);
    const [selectedManagerTwo, setSelectedManagerTwo] = useState(null);
    const [ajmanManagerCommissionPercentage, setAjmanManagerCommissionPercentage] = useState('');
    const [ajmanManagerCommission, setAjmanManagerCommission] = useState(0);
    const [ajmanCoordinatorCommissionPercentage, setAjmanCoordinatorCommissionPercentage] = useState(0); // Percentage
    const [ajmanCoordinatorCommissionValue, setAjmanCoordinatorCommissionValue] = useState(0); // Commission value
    const [ajmanTeamLeaderCommissionPercentage, setAjmanTeamLeaderCommissionPercentage] = useState(0);
    const [ajmanTeamLeaderCommission, setAjmanTeamLeaderCommission] = useState(0);
    const [ajmanBranchCommissionPercentage, setAjmanBranchCommissionPercentage] = useState(0);
    const [ajmanBranchCommission, setAjmanBranchCommission] = useState(0);

    // State for Dubai Branch Commission Percentage and Value
    const [dubaiBranchCommissionPercentage, setDubaiBranchCommissionPercentage] = useState('');
    const [dubaiBranchCommission, setDubaiBranchCommission] = useState(0);
    // State for Dubai Branch Coordinator Commission Percentage and Value
    const [dubaiBranchCoordinatorCommissionPercentage, setDubaiBranchCoordinatorCommissionPercentage] = useState('');
    const [dubaiBranchCoordinatorCommission, setDubaiBranchCoordinatorCommission] = useState(0);
    // State for Dubai Branch Team Leader Commission Percentage and Value
    const [dubaiBranchTeamLeaderCommissionPercentage, setDubaiBranchTeamLeaderCommissionPercentage] = useState('');
    const [dubaiBranchTeamLeaderCommission, setDubaiBranchTeamLeaderCommission] = useState(0);
    // State for Dubai Branch Agent Commission Percentage and Value
    const [dubaiBranchAgentCommissionPercentage, setDubaiBranchAgentCommissionPercentage] = useState('');
    const [dubaiBranchAgentCommission, setDubaiBranchAgentCommission] = useState(0);
    // State for Sales Manager Commission Transfer Percentage and Value for Dubai Branch
    const [dubaiBranchSalesManagerCommissionTransfer, setDubaiBranchSalesManagerCommissionTransfer] = useState('');
    const [dubaiBranchSalesManagerCommissionValue, setDubaiBranchSalesManagerCommissionValue] = useState(0);
    const [transferHOD, setTransferHod] = useState('')
    const [transferManager, setTransferManager] = useState('')
    const navigate = useNavigate()
    const activityLog = Array.isArray(singleLead?.activity_logs) && singleLead.activity_logs[0];

    const logType = activityLog?.log_type;
    const userName =
        logType === "Create Lead" || logType === "Lead Created"
            ? activityLog?.user_id?.name
            : null;

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                // Fetch lead data
                const leadResponse = await axios.get(
                    `${process.env.REACT_APP_BASE_URL}/api/leads/single-lead/${leadId}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                const response = await axios.get(
                    `${process.env.REACT_APP_BASE_URL}/api/users/get-users`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                const users = response.data;
                const filterReferalHod = users.filter(user => user.role === 'HOD');
                setHodReferalOptions(filterReferalHod);
                const filterReferalManager = users.filter(user => user.role === 'Manager');
                setManagerReferalOptions(filterReferalManager);
                const teleSalesTeamLeaderOptions = users.filter(user => user.role === 'TS Team Leader')
                setTeleSalesTeamLeaderOptions(teleSalesTeamLeaderOptions);
                const teleSalesAgentOptions = users.filter(user => user.role === 'TS Agent')
                setTeleSalesTsAgentOptions(teleSalesAgentOptions);

                const filteredUsers = users.filter(user =>
                    user.branch?.name === 'Abu Dhabi' || user.branch === null
                );
                const productOfInterest = leadResponse.data.products?.name;
                const pipelineOfInterest = leadResponse.data.pipeline_id?.name;
                if (leadResponse.data) {
                    // Set options based on roles and filtered users
                    setHodOptions(filteredUsers.filter(user => user.role === 'HOD' && user.products.name === productOfInterest));
                    setManagerOptions(filteredUsers.filter(user => user.role === 'Manager' && user.pipeline[0]?.name === pipelineOfInterest));
                    setCoordinatorOptions(filteredUsers.filter(user => user.role === 'Coordinator' && user.pipeline[0]?.name === pipelineOfInterest));
                    setTeamLeaderOptions(filteredUsers.filter(user => user.role === 'Team Leader' && user.pipeline[0]?.name === pipelineOfInterest));
                    setTsAgentOptions(filteredUsers.filter(user => user.role === 'Sales' && user.pipeline[0]?.name === pipelineOfInterest));
                    setMarketingOptions(filteredUsers.filter(user => user.role === 'Marketing'));
                    setDeveloperOptions(filteredUsers.filter(user => user.role === 'Developer'));
                }

                // Filter users based on branch.name 
                const filteredajmansers = users.filter(user =>
                    user.branch?.name === 'Ajman'
                );
                if (leadResponse.data) {
                    // Set options based on roles and filtered users
                    setManagerAjmanOptions(filteredajmansers.filter(user => user.role === 'Manager'));
                    setCoordinatorAjmanOptions(filteredajmansers.filter(user => user.role === 'Coordinator'));
                    setTeamLeaderAjmanOptions(filteredajmansers.filter(user => user.role === 'Team Leader'));
                    setTsAgentAjmanOptions(filteredajmansers.filter(user => user.role === 'Sales'));
                }

                // Filter users based on branch.name 
                const filteredDubaiUsers = users.filter(user =>
                    user.branch?.name === 'Dubai'
                );

                if (leadResponse.data) {
                    setManagerDubaiOptions(filteredDubaiUsers.filter(user => user.role === 'Manager'));
                    setCoordinatorDubaiOptions(filteredDubaiUsers.filter(user => user.role === 'Coordinator'));
                    setTeamLeaderDubaiOptions(filteredDubaiUsers.filter(user => user.role === 'Team Leader'));
                    setTsAgentDubaiOptions(filteredDubaiUsers.filter(user => user.role === 'Sales'));
                }

                // setHodReferalOptions(user => user.role === 'HOD')
                setLeadData(leadResponse.data);
            } catch (error) {
                console.error('Error fetching users:', error);
            }
        };

        if (token && leadId) {
            fetchUsers();
        }
    }, [leadId, token]);

    // Clear states when transferHOD is empty
    useEffect(() => {
        if (!transferHOD) {
            setDubaiBranchSalesManagerCommissionTransfer('');
            setDubaiBranchSalesManagerCommissionValue('');
        }
        if (!transferManager) {
            setAgentRefCommission('')
            setAgentRefCommissionPercentage('')
        }
    }, [transferHOD, transferManager]);

    // UseEffect for updating revenue without VAT
    useEffect(() => {
        const totalCommission = bankCommission + customerCommission;
        const totalRevenue = totalCommission / 1.05;

        // Update revenues
        setRevenueWithVat(totalCommission);
        setRevenueWithoutVat(totalRevenue);

        // Recalculate hodCommission when revenueWithoutVat changes (without changing the percentage)
        const adjustedRevenue = revenueWithoutVat - brokerCommissionValue;
        if (!isNaN(hodCommissionPercentage)) {
            const updatedHodCommission = calculateCommission(adjustedRevenue, hodCommissionPercentage);
            setHodCommission(Math.round(updatedHodCommission));
        }

        // Update SalesManagerCommission based on percentage
        if (!isNaN(salesManagerCommissionPercentage)) {
            const updatedSalesManagerCommission = calculateCommission(adjustedRevenue, salesManagerCommissionPercentage);
            setSalesManagerCommission(Math.round(updatedSalesManagerCommission));
        }

        // Update CoordinatorCommission based on percentage
        if (!isNaN(coordinatorCommissionPercentage)) {
            const updatedCoordinatorCommission = calculateCommission(adjustedRevenue, coordinatorCommissionPercentage);
            setCoordinatorCommission(Math.round(updatedCoordinatorCommission));
        }

        // Update TeamLeaderCommission based on percentage
        if (!isNaN(teamLeaderCommissionPercentage)) {
            const updatedTeamLeaderCommission = calculateCommission(adjustedRevenue, teamLeaderCommissionPercentage);
            setTeamLeaderCommission(Math.round(updatedTeamLeaderCommission));
        }

        if (!isNaN(agentCommissionPercentage)) {
            const updatedAgentCommission = calculateCommission(adjustedRevenue, agentCommissionPercentage);
            setAgentCommission(Math.round(updatedAgentCommission));
        }

        if (!isNaN(agentOneCommissionPercentage)) {
            const updatedAgentOneCommission = calculateCommission(adjustedRevenue, agentOneCommissionPercentage);
            setAgentOneCommission(Math.round(updatedAgentOneCommission));
        }

        if (!isNaN(dubaiBranchCommissionPercentage)) {
            const updatedDubaiManagerCommission = calculateCommission(adjustedRevenue, dubaiBranchCommissionPercentage);
            setDubaiBranchCommission(Math.round(updatedDubaiManagerCommission));
        }

        if (!isNaN(dubaiBranchCoordinatorCommissionPercentage)) {
            const updatedDubaiCoordinatorCommission = calculateCommission(adjustedRevenue, dubaiBranchCoordinatorCommissionPercentage);
            setDubaiBranchCoordinatorCommission(Math.round(updatedDubaiCoordinatorCommission));
        }

        if (!isNaN(dubaiBranchTeamLeaderCommissionPercentage)) {
            const updatedDubaiTeamLeaderCommission = calculateCommission(adjustedRevenue, dubaiBranchTeamLeaderCommissionPercentage);
            setDubaiBranchTeamLeaderCommission(Math.round(updatedDubaiTeamLeaderCommission));
        }

        if (!isNaN(dubaiBranchAgentCommissionPercentage)) {
            const updatedDubaiSalesAgentCommission = calculateCommission(adjustedRevenue, dubaiBranchAgentCommissionPercentage);
            setDubaiBranchAgentCommission(Math.round(updatedDubaiSalesAgentCommission));
        }

        if (!isNaN(ajmanManagerCommissionPercentage)) {
            const updatedAjmanManagerCommission = calculateCommission(adjustedRevenue, ajmanManagerCommissionPercentage);
            setAjmanManagerCommission(Math.round(updatedAjmanManagerCommission));
        }

        if (!isNaN(ajmanCoordinatorCommissionPercentage)) {
            const updatedAjmanCoordinatorCommission = calculateCommission(adjustedRevenue, ajmanCoordinatorCommissionPercentage);
            setAjmanCoordinatorCommissionValue(Math.round(updatedAjmanCoordinatorCommission));
        }

        if (!isNaN(ajmanTeamLeaderCommissionPercentage)) {
            const updatedAjmanTeamLeaderCommission = calculateCommission(adjustedRevenue, ajmanTeamLeaderCommissionPercentage);
            setAjmanTeamLeaderCommission(Math.round(updatedAjmanTeamLeaderCommission));
        }

        if (!isNaN(ajmanBranchCommissionPercentage)) {
            const updatedAjmanSalesAgentCommission = calculateCommission(adjustedRevenue, ajmanBranchCommissionPercentage);
            setAjmanBranchCommission(Math.round(updatedAjmanSalesAgentCommission));
        }

        if (!isNaN(dubaiBranchSalesManagerCommissionTransfer)) {
            const updatedHODrRefCommission = calculateCommission(adjustedRevenue, dubaiBranchSalesManagerCommissionTransfer);
            setDubaiBranchSalesManagerCommissionValue(Math.round(updatedHODrRefCommission));
        }

        if (!isNaN(agentRefCommissionPercentage)) {
            const updatedsalesManagerRefCommission = calculateCommission(adjustedRevenue, agentRefCommissionPercentage);
            setAgentRefCommission(Math.round(updatedsalesManagerRefCommission));
        }

        if (!isNaN(marketingManagerCommissionPercentage)) {
            const updatedMarketingTeamLeaderCommission = calculateCommission(adjustedRevenue, marketingManagerCommissionPercentage);
            setMarketingManagerCommission(Math.round(updatedMarketingTeamLeaderCommission));
        }

        if (!isNaN(marketingAgentCommissionPercentage)) {
            const updatedMarketingAgentOneCommission = calculateCommission(adjustedRevenue, marketingAgentCommissionPercentage);
            setMarketingAgentCommission(Math.round(updatedMarketingAgentOneCommission));
        }

        if (!isNaN(marketingManagerOneCommissionPercentage)) {
            const updatedMarketingAgentTwoCommission = calculateCommission(adjustedRevenue, marketingManagerOneCommissionPercentage);
            setMarketingManagerOneCommission(Math.round(updatedMarketingAgentTwoCommission));
        }

        if (!isNaN(marketingAgentOneCommissionPercentage)) {
            const updatedMarketingAgentThreeCommission = calculateCommission(adjustedRevenue, marketingAgentOneCommissionPercentage);
            setMarketingAgentOneCommission(Math.round(updatedMarketingAgentThreeCommission));
        }

        if (!isNaN(ItManagerCommissionPercentage)) {
            const updatedITManagerCommission = calculateCommission(adjustedRevenue, ItManagerCommissionPercentage);
            setItManagerCommission(Math.round(updatedITManagerCommission));
        }

        if (!isNaN(developerCommissionPercentage)) {
            const updateddeveloperCommission = calculateCommission(adjustedRevenue, developerCommissionPercentage);
            setDeveloperCommission(Math.round(updateddeveloperCommission));
        }

        if (!isNaN(developerOneCommissionPercentage)) {
            const updateddeveloperOneCommission = calculateCommission(adjustedRevenue, developerOneCommissionPercentage);
            setDeveloperOneCommission(Math.round(updateddeveloperOneCommission));
        }

        if (!isNaN(developerTwoCommissionPercentage)) {
            const updateddeveloperTwoCommission = calculateCommission(adjustedRevenue, developerTwoCommissionPercentage);
            setDeveloperTwoCommission(Math.round(updateddeveloperTwoCommission));
        }

        if (!isNaN(teleSalesHodCommissionPercentage)) {
            const updateTeleSalesTeamLeaderCommission = calculateCommission(adjustedRevenue, teleSalesHodCommissionPercentage);
            setTeleSalesHodCommission(Math.round(updateTeleSalesTeamLeaderCommission));
        }

        if (!isNaN(teleSalesTeamLeaderCommissionPercentage)) {
            const updateTeleSalesAgentCommission = calculateCommission(adjustedRevenue, teleSalesTeamLeaderCommissionPercentage);
            setTeleSalesTeamLeaderCommission(Math.round(updateTeleSalesAgentCommission));
        }

    }, [financialAmount, bankCommission, customerCommission, revenueWithoutVat, brokerCommissionValue]);

    // Helper function to calculate commission
    const calculateCommission = (adjustedRevenue, percentage) => {
        return (adjustedRevenue * percentage) / 100;
    };
    // Broker Commission Handler
    const handleBrokerCommissionChange = (e) => {
        const percentage = parseFloat(e.target.value) || 0;
        setBrokerCommission(percentage);

        // Calculate and update broker commission value
        const commissionValue = calculateCommission(revenueWithoutVat, percentage);
        setBrokerCommissionValue(commissionValue);

        // Adjust all other commissions after the broker commission
        const adjustedRevenue = revenueWithoutVat - commissionValue;

        // Update HOD Commission
        const hodCommissionValue = calculateCommission(adjustedRevenue, hodCommissionPercentage);
        setHodCommission(hodCommissionValue);

        // Update Sales Manager Commission
        const salesManagerCommissionValue = calculateCommission(adjustedRevenue, salesManagerCommissionPercentage);
        setSalesManagerCommission(salesManagerCommissionValue);

        // Update Coordinator Commission
        const coordinatorCommissionValue = calculateCommission(adjustedRevenue, coordinatorCommissionPercentage);
        setCoordinatorCommission(coordinatorCommissionValue);

        // Update Team Leader Commission
        const teamLeaderCommissionValue = calculateCommission(adjustedRevenue, teamLeaderCommissionPercentage);
        setTeamLeaderCommission(teamLeaderCommissionValue);

        // Update Agent Commission
        const agentCommissionValue = calculateCommission(adjustedRevenue, agentCommissionPercentage);
        setAgentCommission(agentCommissionValue);

        // Update Agent Two Commission
        const agentTwoCommissionValue = calculateCommission(adjustedRevenue, agentCommissionTwoPercentage);
        setAgentTwoCommission(agentTwoCommissionValue);

        // Update Other Commission
        const otherCommissionValue = calculateCommission(adjustedRevenue, otherCommissionPercentage);
        setOtherCommission(otherCommissionValue);

        // Update Tele Sales HOD Commission
        const teleSalesHodCommissionValue = calculateCommission(adjustedRevenue, teleSalesHodCommissionPercentage);
        setTeleSalesHodCommission(teleSalesHodCommissionValue);

        // Update Tele Sales Team Leader Commission
        const teleSalesTeamLeaderCommissionValue = calculateCommission(adjustedRevenue, teleSalesTeamLeaderCommissionPercentage);
        setTeleSalesTeamLeaderCommission(teleSalesTeamLeaderCommissionValue);

        // Update Tele Sales Agent Commission
        const teleSalesAgentCommissionValue = calculateCommission(adjustedRevenue, teleSalesAgentCommissionPercentage);
        setTeleSalesAgentCommission(teleSalesAgentCommissionValue);

        // Update Tele Sales Agent one Commission
        const teleSalesAgentOneCommissionValue = calculateCommission(adjustedRevenue, teleSalesAgentOneCommissionPercentage);
        setTeleSalesAgentOneCommission(teleSalesAgentOneCommissionValue);

        // Update Marketing Manager Commission
        const marketingManagerCommissionValue = calculateCommission(adjustedRevenue, marketingManagerCommissionPercentage);
        setMarketingManagerCommission(marketingManagerCommissionValue);

        // Update IT Manager Commission
        const ItManagerCommissionValue = calculateCommission(adjustedRevenue, ItManagerCommissionPercentage);
        setItManagerCommission(ItManagerCommissionValue);

        // Update IT Developer Commission
        const ItDeveloperCommissionValue = calculateCommission(adjustedRevenue, developerCommissionPercentage);
        setDeveloperCommission(ItDeveloperCommissionValue);

        // Update IT Developer One Commission
        const ItDeveloperOneCommissionValue = calculateCommission(adjustedRevenue, developerOneCommissionPercentage);
        setDeveloperOneCommission(ItDeveloperOneCommissionValue);

        // Update IT Developer two Commission
        const ItDeveloperTwoCommissionValue = calculateCommission(adjustedRevenue, developerTwoCommissionPercentage);
        setDeveloperTwoCommission(ItDeveloperTwoCommissionValue);

        // Update Marketing Manager One Commission
        const marketingManagerOneCommissionValue = calculateCommission(adjustedRevenue, marketingManagerOneCommissionPercentage);
        setMarketingManagerOneCommissionPercentage(marketingManagerOneCommissionValue);

        // Update Marketing Agent Commission
        const marketingAgentCommissionValue = calculateCommission(adjustedRevenue, marketingAgentCommissionPercentage);
        setMarketingAgentCommission(marketingAgentCommissionValue);

        // Update Marketing Agent One Commission
        const marketingAgentOneCommissionValue = calculateCommission(adjustedRevenue, marketingAgentOneCommissionPercentage);
        setMarketingAgentOneCommission(marketingAgentOneCommissionValue);


        // Update Transfer Ref sales Manager Commission
        const TransferRefsalesManagerCommissionValue = calculateCommission(adjustedRevenue, salesManagerRefCommissionTransferPercentage);
        setSalesManagerRefCommissionTransfer(TransferRefsalesManagerCommissionValue);

        // Update Transfer Ref sales Agent Commission
        const TransferRefsalesAgentCommissionValue = calculateCommission(adjustedRevenue, agentRefCommissionPercentage);
        setAgentRefCommission(TransferRefsalesAgentCommissionValue);

        // Update TeamLeaderOneCommissionValue Commission
        const TeamLeaderOneCommissionValue = calculateCommission(adjustedRevenue, teamLeaderOnePercentage);
        setteamLeaderOneCommission(TeamLeaderOneCommissionValue);

        // Update SalesAgentOneCommissionValue Commission
        const SalesAgentOneCommissionValue = calculateCommission(adjustedRevenue, agentCommissionOnePercentage);
        setAgentOneCommission(SalesAgentOneCommissionValue);

    };

    useEffect(() => {
        // Reset calculations if revenue changes or commission percentages are set to 0
        if (
            hodCommissionPercentage === 0 ||
            brokerCommission === 0 ||
            salesManagerCommissionPercentage === 0 ||
            coordinatorCommissionPercentage === 0 ||
            teamLeaderCommissionPercentage === 0 ||
            agentCommissionPercentage === 0
        ) {
            // setHodCommission((revenueWithoutVat * hodCommissionPercentage) / 100);
            // setSalesManagerCommission((revenueWithoutVat * salesManagerCommissionPercentage) / 100);
            // setCoordinatorCommission((revenueWithoutVat * coordinatorCommissionPercentage) / 100);
            // setTeamLeaderCommission((revenueWithoutVat * teamLeaderCommissionPercentage) / 100);
            // setAgentCommission((revenueWithoutVat * agentCommissionPercentage) / 100); 
        }
    }, [
        revenueWithoutVat,
        hodCommissionPercentage,
        brokerCommission,
        salesManagerCommissionPercentage,
        coordinatorCommissionPercentage,
        teamLeaderCommissionPercentage,
        agentCommissionPercentage
    ]);

    // onChange Function for HOD
    const HandlerChange = (selectedOption) => {
        if (selectedOption) {
            setSelectedHod(selectedOption); // Set selected HOD when a value is chosen
        } else {
            setSelectedHod(null); // Clear selected HOD when the value is removed
            setHodCommissionPercentage(0); // Reset percentage
            setHodCommission(0); // Reset commission
        }
    };
    // onChange Function for Manager
    const handleManagerChange = (selectedManagerOption) => {
        if (selectedManagerOption) {
            setSelectedManager(selectedManagerOption)
        }
        else {
            setSelectedManager(null); // Clear selected Manager when the value is removed
            setSalesManagerCommissionPercentage(0); // Reset percentage
            setSalesManagerCommission(0); // Reset commission
        }
    }
    // onChange Function for Coordinator
    const handleCoordinatorChange = (selectedCoordinatorOption) => {
        if (selectedCoordinatorOption) {
            setSelectedCoordinator(selectedCoordinatorOption)
        } else {
            setSelectedCoordinator(null); // Clear selected Manager when the value is removed
            setCoordinatorCommissionPercentage(0); // Reset percentage
            setCoordinatorCommission(0); // Reset commission
        }
    }
    // onChange Function for Coordinator dubai
    const handleDubaiCoordinatorChange = (selectedCoordinatorDubaiOption) => {
        if (selectedCoordinatorDubaiOption) {
            setSelectedDubaiCoordinator(selectedCoordinatorDubaiOption)
        } else {
            setSelectedDubaiCoordinator(null)
            setDubaiBranchCoordinatorCommission(0)
            setDubaiBranchCoordinatorCommissionPercentage('')
        }
    }
    const handleAjmanCoordinatorChange = (selectedAjmanCoordinatorOption) => {
        if (selectedAjmanCoordinatorOption) {
            setSelectedAjmanCoordinator(selectedAjmanCoordinatorOption)
        } else {
            setSelectedAjmanCoordinator(null)
            setAjmanCoordinatorCommissionValue(0)
            setAjmanCoordinatorCommissionPercentage(0)
        }
    }
    // onChange Function for Team Leader
    const handleTeamLeaderChange = (selectedTeamLeaderOption) => {
        if (selectedTeamLeaderOption) {
            setSelectedTeamLeader(selectedTeamLeaderOption)
        } else {
            setSelectedTeamLeader(null); // Clear selected Manager when the value is removed
            setTeamLeaderCommissionPercentage(0); // Reset percentage
            setTeamLeaderCommission(0); // Reset commission
        }
    }

    // OnChangeFunction For Ajman
    const handleAjmanTeamLeaderChange = (selectedAjmanTeamLOption) => {
        if (selectedAjmanTeamLOption) {
            setSelectedAjmanTeamLeader(selectedAjmanTeamLOption)
        } else {
            setSelectedAjmanTeamLeader(null)
            setAjmanTeamLeaderCommissionPercentage(0)
            setAjmanTeamLeaderCommission(0)
        }
    }
    // onChange Function for Sales Agent
    const handleSaleAgentChange = (selectedSalesAgentOption) => {
        if (selectedSalesAgentOption) {
            setSelectedSalesAgent(selectedSalesAgentOption)
        }
        else {
            setSelectedSalesAgent(null); // Clear selected Manager when the value is removed
            setAgentCommissionPercentage(0); // Reset percentage
            setAgentCommission(0); // Reset commission
        }
    }
    // onChange Function for Team  Sales Agent One
    const handleSaleAgentOneChange = (selectedSalesAgentOneOption) => {
        if (selectedSalesAgentOneOption) {
            setSelectedSalesAgentOne(selectedSalesAgentOneOption)
        } else {
            setSelectedSalesAgentOne(null); // Clear selected Manager when the value is removed
            setAgentOneCommissionPercentage(0); // Reset percentage
            setAgentOneCommission(0); // Reset commission
        }
    }

    const handleAjmanSaleAgentChange = (selectedSalesAgentAjmanOptions) => {
        if (selectedSalesAgentAjmanOptions) {
            setSelectedSalesAgentAjman(selectedSalesAgentAjmanOptions)
        } else {
            setSelectedSalesAgentAjman(null)
            setAjmanBranchCommissionPercentage(0)
            setAjmanBranchCommission(0)
        }
    }
    // onChange Function for Marketing Manager
    const handleMarketingManagerChange = (selectedMarketingManagerOption) => {
        if (selectedMarketingManagerOption) {
            setSelectedMarketingManager(selectedMarketingManagerOption)
        } else {
            setSelectedMarketingManager(null)
            setMarketingManagerCommission('')
            setMarketingManagerCommissionPercentage('')
        }
    }

    // onChange Function for Marketing Manager One
    const handleMarketingManagerOneChange = (selectedMarketingManagerOneOption) => {
        if (selectedMarketingManagerOneOption) {
            setSelectedMarketingManagerOne(selectedMarketingManagerOneOption)
        } else {
            setSelectedMarketingManagerOne(null)
            setMarketingManagerOneCommissionPercentage('')
            setMarketingManagerOneCommission('')
        }
    }
    // onChange Function for Marketing Agent
    const handleMarketingAgentChange = (selectedMarketingAgentOption) => {
        if (selectedMarketingAgentOption) {
            setSelectedMarketingAgent(selectedMarketingAgentOption)
        } else {
            setSelectedMarketingAgent(null)
            setMarketingAgentCommissionPercentage('')
            setMarketingAgentCommission('')
        }
    }

    // onChange Function for Marketing Agent One
    const handleMarketingAgentOneChange = (selectedMarketingAgentOneOption) => {
        if (selectedMarketingAgentOneOption) {
            setSelectedMarketingOneAgent(selectedMarketingAgentOneOption)
        } else {
            setSelectedMarketingOneAgent(null)
            setMarketingAgentOneCommissionPercentage('')
            setMarketingAgentOneCommission(0)
        }
    }

    // IT Team
    // onChange Function for IT Manager
    const handleITManagerChange = (selectedItManagerOption) => {
        if (selectedItManagerOption) {
            setSelectedItManager(selectedItManagerOption)
        } else {
            setSelectedItManager(null)
            setItManagerCommission('')
            setItManagerCommissionPercentage(0)
        }
    }

    // onChange Function for IT Developer
    const handleItDeveloperChange = (selectedITDeveloperOption) => {
        if (selectedITDeveloperOption) {
            setDeveloper(selectedITDeveloperOption)
        } else {
            setDeveloper(null)
            setDeveloperCommission(0)
            setDeveloperCommissionPercentage(0)
        }
    }

    // onChange Function for IT Developer One
    const handleDeveloperOneChange = (selectedITDeveloperOneOption) => {
        if (selectedITDeveloperOneOption) {
            setDeveloperOne(selectedITDeveloperOneOption)
        } else {
            setDeveloperOne(null)
            setDeveloperOneCommissionPercentage(0)
            setDeveloperOneCommission(0)
        }
    }

    // onChange Function for IT Developer Two
    const handleDeveloperTwoChange = (selectedITDevelopertwoOption) => {
        if (selectedITDevelopertwoOption) {
            setDeveloperTwo(selectedITDevelopertwoOption)
        } else {
            setDeveloperTwo(null)
            setDeveloperTwoCommissionPercentage(0)
            setDeveloperTwoCommission(0)
        }
    }

    // onChange Function for Tele sales Agent
    const handleTelesalesHodChange = (selectedTelesalesOption) => {
        if (selectedTelesalesOption) {
            setSelectedTeleSalesMaangers(selectedTelesalesOption)
        } else {
            setSelectedTeleSalesMaangers(null)
            setTeleSalesHodCommissionPercentage(0)
            setTeleSalesHodCommission(0)
        }

    }

    // onChange Function for Tele salesTeam Leader
    const handleTelesalesTeamLeaderChange = (selectedTelesalesTeamLeaderOption) => {
        if (selectedTelesalesTeamLeaderOption) {
            setSelectedTeleSalesTeamLeader(selectedTelesalesTeamLeaderOption)
        } else {
            setSelectedTeleSalesTeamLeader(null)
            setTeleSalesTeamLeaderCommissionPercentage(0)
            setTeleSalesTeamLeaderCommission(0)
        }
    }

    // OnChange Function for Ajman Branch
    const handleAjmanManagerChange = (selectedAjmanManagerOptions) => {
        if (selectedAjmanManagerOptions) {
            setSelectedAjmanManager(selectedAjmanManagerOptions)
        }
        else {
            setSelectedAjmanManager(null); // Clear selected Manager when the value is removed
            setAjmanManagerCommissionPercentage(0); // Reset percentage
            setAjmanManagerCommission(0); // Reset commission
        }
    }

    // OnChange Function for Dubai Branch
    const handleDubaiManagerChange = (selectedDubaiManagerOptions) => {
        if (selectedDubaiManagerOptions) {
            setSelectedDubaiManager(selectedDubaiManagerOptions)
        } else {
            setSelectedDubaiManager(null)
            setDubaiBranchCommission(0)
            setDubaiBranchCommissionPercentage(0)
        }
    }

    const handleDubaiTeamLeaderChange = (selectedDubaiTeamLeaderOptions) => {
        if (selectedDubaiTeamLeaderOptions) {
            setSelectedDubaiTeamLeader(selectedDubaiTeamLeaderOptions)
        } else {
            setSelectedDubaiTeamLeader(null)
            setDubaiBranchTeamLeaderCommission('')
            setDubaiBranchTeamLeaderCommissionPercentage(0)
        }
    }

    const handleDubaiSaleAgentChange = (selectedDubaiSalesOptions) => {
        if (selectedDubaiSalesOptions) {
            setSelectedDubaiSales(selectedDubaiSalesOptions)
        } else {
            setSelectedDubaiSales(null)
            setDubaiBranchAgentCommission(0)
            setDubaiBranchAgentCommissionPercentage(0)
        }
    }

    // Post API For Lead Convert to Contract
    const LeadConvertHandler = async () => {
        try {
            const response = await axios.post(`${process.env.REACT_APP_BASE_URL}/api/leads/convert-lead-to-contract/${leadId}`, {
                finance_amount: financialAmount,
                bank_commission: bankCommission,
                customer_commission: customerCommission,
                with_vat_commission: revenueWithVat,
                without_vat_commission: revenueWithoutVat,
                hodsale: selectedHod ? selectedHod.value : null,
                hodsalecommission: hodCommission,
                salemanager: selectedManger ? selectedManger.value : null,
                selectedAjmanManger: selectedAjmanManger ? selectedAjmanManger.value : null,
                selectedDubaiManger: selectedDubaiManger ? selectedDubaiManger.value : null,
                selectedManagerTwo: selectedManagerTwo ? selectedManagerTwo.value : null,
                salemanagercommission: salesManagerCommission,
                selectedAjmanCoordinator: selectedAjmanCoordinator ? selectedAjmanCoordinator.value : null,
                selectedDubaiCoordinator: selectedDubaiCoordinator ? selectedDubaiCoordinator.value : null,
                selectedDubaiTeamLeader: selectedDubaiTeamLeader ? selectedDubaiTeamLeader.value : null,
                selectedDubaiSales: selectedDubaiSales ? selectedDubaiSales.value : null,
                coordinator: selectedCoordinator ? selectedCoordinator.value : null,
                coordinator_commission: coordinatorCommission,
                team_leader: selectedTeamLeader ? selectedTeamLeader.value : null,
                selectedAjmanTeamLeader: selectedAjmanTeamLeader ? selectedAjmanTeamLeader.value : null,
                team_leader_commission: teamLeaderCommission,
                team_leader_one: selectedTeamLeaderOne ? selectedTeamLeaderOne.value : null,
                team_leader_one_commission: teamLeaderOneCommission,
                teamLeaderTwo: teamLeaderTwo ? teamLeaderTwo.value : null,
                salesagent: selectedSalesAgent ? selectedSalesAgent.value : null,
                salesagent_commission: agentCommission,
                sale_agent_one: selectedSalesAgentOne ? selectedSalesAgentOne.value : null,
                sale_agent_one_commission: agentOneCommission,
                agent_commission: agentCommission,

                sale_agent_two: selectedSalesAgenttwo ? selectedSalesAgenttwo.value : null,
                sale_agent_two_commission: agentTwoCommission,
                teleSales_agent_one: selectedtelesalesAgentOne ? selectedtelesalesAgentOne.value : null,

                selectedSalesAgentAjman: selectedSalesAgentAjman ? selectedSalesAgentAjman.value : null,

                ts_hod: selectedTeleSalesMaangers ? selectedTeleSalesMaangers.value : null,
                ts_hod_commision: teleSalesHodCommission,
                ts_team_leader: selectedtelesalesTeamLeader ? selectedtelesalesTeamLeader.value : null,
                ts_team_leader_commission: teleSalesTeamLeaderCommission,
                tsagent: selectedtelesalesAgent ? selectedtelesalesAgent.value : null,
                tsagent_commission: teleSalesAgentCommission,

                marketingone: selectedMarketingManager ? selectedMarketingManager.value : null,
                marketingonecommission: marketingManagerCommission,

                marketingtwo: selectedMarketingAgent ? selectedMarketingAgent.value : null,
                marketingtwocommission: marketingAgentCommission,

                marketingthree: selectedMarketingManagerOne ? selectedMarketingManagerOne.value : null,
                marketingthreecommission: marketingManagerOneCommission,

                marketingfour: selectedMarketingAgentOne ? selectedMarketingAgentOne.value : null,
                marketingfourcommission: marketingAgentOneCommission,

                developerone: selectedItManager ? selectedItManager.value : null,
                developeronecommission: ItManagerCommission,

                developertwo: developer ? developer.value : null,
                developertwocommission: developerCommission,

                developerthree: developerOne ? developerOne.value : null,
                developerthreecommission: developerTwoCommission,

                developerfour: developerTwo ? developerTwo.value : null,
                developerfourcommission: developerTwoCommission,

                marketingagentOne: selectedMarketingAgentOne ? selectedMarketingAgentOne.value : null,
                marketingagentcommission: marketingAgentCommission,

                other_name: otherPersonName,
                other_name_commission: otherCommission,
                thirdpartyname: brokerName,
                broker_name_commission: brokerCommissionValue,
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            fetchSingleLead()
            setLeadToContract(false)
            navigate(`/contracts/${response?.data?.contract?._id}`)
        } catch (error) {
            console.log(error, 'error')
        }
    }

    const openLeadContractModal = () => {
        setLeadToContract(true)
        setContractModal(false)
    }

    const handleHodCommissionValueChange = (e) => {
        const value = parseFloat(e.target.value);
        setHodCommission(value);

        if (!isNaN(value) && revenueWithoutVat - brokerCommissionValue !== 0) {
            const adjustedRevenue = revenueWithoutVat - brokerCommissionValue;
            const percentage = (value / adjustedRevenue) * 100;
            setHodCommissionPercentage(Math.round(percentage));
        }
    };

    const handleHodCommissionChange = (e) => {
        const percentage = parseFloat(e.target.value);
        setHodCommissionPercentage(percentage);

        if (isNaN(percentage) || percentage === "") {
            // Clear the other field when this one is cleared
            setHodCommission(0);
            return;
        }

        if (!isNaN(percentage)) {
            const adjustedRevenue = revenueWithoutVat - brokerCommissionValue;
            const hodCommissionValue = calculateCommission(adjustedRevenue, percentage);
            setHodCommission(Math.round(hodCommissionValue));
        }
    };

    const handleSalesManagerCommissionChange = (e) => {
        const percentage = parseFloat(e.target.value);
        setSalesManagerCommissionPercentage(percentage);

        if (isNaN(percentage) || percentage === "") {
            // Clear the other field when this one is cleared
            setSalesManagerCommissionPercentage(0);
            return;
        }

        if (!isNaN(percentage)) {
            const adjustedRevenue = revenueWithoutVat - brokerCommissionValue;
            const commissionValue = calculateCommission(adjustedRevenue, percentage);
            setSalesManagerCommission(Math.round(commissionValue));
        }
    };

    const handleSalesManagerCommissionValueChange = (e) => {
        const value = parseFloat(e.target.value);
        setSalesManagerCommission(value);

        if (!isNaN(value) && revenueWithoutVat - brokerCommissionValue !== 0) {
            const adjustedRevenue = revenueWithoutVat - brokerCommissionValue;
            const percentage = (value / adjustedRevenue) * 100;
            setSalesManagerCommissionPercentage(Math.round(percentage));
        }
    }

    const handleCoordinatorCommissionPercentageChange = (e) => {
        const percentage = parseFloat(e.target.value);
        setCoordinatorCommissionPercentage(percentage);

        if (isNaN(percentage) || percentage === "") {
            // Clear the other field when this one is cleared
            setCoordinatorCommissionPercentage(0);
            return;
        }

        if (!isNaN(percentage)) {
            const adjustedRevenue = revenueWithoutVat - brokerCommissionValue;
            const commissionValue = calculateCommission(adjustedRevenue, percentage);
            setCoordinatorCommission(Math.round(commissionValue));
        }
    };

    const handleCoordinatorCommissionValueChange = (e) => {
        const value = parseFloat(e.target.value);
        setCoordinatorCommission(value);

        if (!isNaN(value) && revenueWithoutVat - brokerCommissionValue !== 0) {
            const adjustedRevenue = revenueWithoutVat - brokerCommissionValue;
            const percentage = (value / adjustedRevenue) * 100;
            setCoordinatorCommissionPercentage(Math.round(percentage));
        }
    };

    const handleTeamLeaderCommissionPercentageChange = (e) => {
        const percentage = parseFloat(e.target.value);
        setTeamLeaderCommissionPercentage(percentage);

        if (isNaN(percentage) || percentage === "") {
            // Clear the other field when this one is cleared
            setTeamLeaderCommissionPercentage(0);
            return;
        }

        if (!isNaN(percentage)) {
            const adjustedRevenue = revenueWithoutVat - brokerCommissionValue;
            const commissionValue = calculateCommission(adjustedRevenue, percentage);
            setTeamLeaderCommission(Math.round(commissionValue));
        }
    };

    const handleTeamLeaderCommissionValueChange = (e) => {
        const value = parseFloat(e.target.value);
        setTeamLeaderCommission(value);

        if (!isNaN(value) && revenueWithoutVat - brokerCommissionValue !== 0) {
            const adjustedRevenue = revenueWithoutVat - brokerCommissionValue;
            const percentage = (value / adjustedRevenue) * 100;
            setTeamLeaderCommissionPercentage(Math.round(percentage));
        }
    };

    const handleAgentCommissionPercentageChange = (e) => {
        const percentage = parseFloat(e.target.value);
        setAgentCommissionPercentage(percentage);

        if (isNaN(percentage) || percentage === '') {
            // Clear the commission value when percentage is invalid
            setAgentCommission(0);
            return;
        }

        const adjustedRevenue = revenueWithoutVat - brokerCommissionValue;
        if (adjustedRevenue > 0) {
            const commissionValue = calculateCommission(adjustedRevenue, percentage);
            setAgentCommission(Math.round(commissionValue));
        }
    };

    const handleAgentCommissionValueChange = (e) => {
        const value = parseFloat(e.target.value);
        setAgentCommission(value);

        if (!isNaN(value) && revenueWithoutVat - brokerCommissionValue > 0) {
            const adjustedRevenue = revenueWithoutVat - brokerCommissionValue;
            const percentage = (value / adjustedRevenue) * 100;
            setAgentCommissionPercentage(Math.round(percentage));
        }
    };

    const handleAgentOneCommissionPercentageChange = (e) => {
        const percentage = parseFloat(e.target.value);
        setAgentOneCommissionPercentage(percentage);

        if (isNaN(percentage) || percentage === '') {
            // Reset commission value if input is invalid
            setAgentOneCommission(0);
            return;
        }

        const adjustedRevenue = revenueWithoutVat - brokerCommissionValue;
        if (adjustedRevenue > 0) {
            const commissionValue = calculateCommission(adjustedRevenue, percentage);
            setAgentOneCommission(Math.round(commissionValue));
        }
    };

    const handleAgentOneCommissionValueChange = (e) => {
        const value = parseFloat(e.target.value);
        setAgentOneCommission(value);

        if (!isNaN(value) && revenueWithoutVat - brokerCommissionValue > 0) {
            const adjustedRevenue = revenueWithoutVat - brokerCommissionValue;
            const percentage = (value / adjustedRevenue) * 100;
            setAgentOneCommissionPercentage(Math.round(percentage));
        }
    };

    // Ajman Branch Commission Start
    const handleAjmanManagerCommissionPercentageChange = (e) => {
        const percentage = parseFloat(e.target.value);
        setAjmanManagerCommissionPercentage(percentage);

        if (isNaN(percentage) || percentage === '') {
            // Reset commission value if input is invalid
            setAjmanManagerCommission(0);
            return;
        }

        const adjustedRevenue = revenueWithoutVat - brokerCommissionValue;
        if (adjustedRevenue > 0) {
            const commissionValue = calculateCommission(adjustedRevenue, percentage);
            setAjmanManagerCommission(Math.round(commissionValue));
        }
    };

    const handleAjmanManagerCommissionValueChange = (e) => {
        const value = parseFloat(e.target.value);
        setAjmanManagerCommission(value);

        if (!isNaN(value) && revenueWithoutVat - brokerCommissionValue > 0) {
            const adjustedRevenue = revenueWithoutVat - brokerCommissionValue;
            const percentage = (value / adjustedRevenue) * 100;
            setAjmanManagerCommissionPercentage(Math.round(percentage));
        }
    };

    // Handler for AjmanCoordinator Commission Percentage Input
    const handleAjmanCoordinatorCommissionPercentageChange = (e) => {
        const percentage = parseFloat(e.target.value);
        setAjmanCoordinatorCommissionPercentage(percentage);

        if (isNaN(percentage) || percentage === '') {
            // Reset commission value if input is invalid
            setAjmanCoordinatorCommissionValue(0);
            return;
        }

        const adjustedRevenue = revenueWithoutVat - brokerCommissionValue;
        if (adjustedRevenue > 0) {
            const commissionValue = calculateCommission(adjustedRevenue, percentage);
            setAjmanCoordinatorCommissionValue(Math.round(commissionValue));
        }
    };

    // Handler for AjmanCoordinator Commission Value Input
    const handleAjmanCoordinatorCommissionValueChange = (e) => {
        const value = parseFloat(e.target.value);
        setAjmanCoordinatorCommissionValue(value);

        if (!isNaN(value) && revenueWithoutVat - brokerCommissionValue > 0) {
            const adjustedRevenue = revenueWithoutVat - brokerCommissionValue;
            const percentage = (value / adjustedRevenue) * 100;
            setAjmanCoordinatorCommissionPercentage(Math.round(percentage));
        }
    };

    const handleAjmanTeamLeaderCommissionPercentageChange = (e) => {
        const percentage = parseFloat(e.target.value);
        setAjmanTeamLeaderCommissionPercentage(percentage);

        if (isNaN(percentage) || percentage === '') {
            // Reset commission value if input is invalid
            setAjmanTeamLeaderCommission(0);
            return;
        }

        const adjustedRevenue = revenueWithoutVat - brokerCommissionValue;
        if (adjustedRevenue > 0) {
            const commissionValue = calculateCommission(adjustedRevenue, percentage);
            setAjmanTeamLeaderCommission(Math.round(commissionValue));
        }
    };

    // Handler for Ajman Team Leader Commission Value Input
    const handleAjmanTeamLeaderCommissionValueChange = (e) => {
        const value = parseFloat(e.target.value);
        setAjmanTeamLeaderCommission(value);

        if (!isNaN(value) && revenueWithoutVat - brokerCommissionValue > 0) {
            const adjustedRevenue = revenueWithoutVat - brokerCommissionValue;
            const percentage = (value / adjustedRevenue) * 100;
            setAjmanTeamLeaderCommissionPercentage(Math.round(percentage));
        }
    };

    // Handler for Ajman Branch Commission Percentage Input
    const handleAjmanBranchCommissionPercentageChange = (e) => {
        const percentage = parseFloat(e.target.value);
        setAjmanBranchCommissionPercentage(percentage);

        if (isNaN(percentage) || percentage === '') {
            // Reset commission value if input is invalid
            setAjmanBranchCommission(0);
            return;
        }

        const adjustedRevenue = revenueWithoutVat - brokerCommissionValue;
        if (adjustedRevenue > 0) {
            const commissionValue = calculateCommission(adjustedRevenue, percentage);
            setAjmanBranchCommission(Math.round(commissionValue));
        }
    };

    // Handler for Ajman Branch Commission Value Input
    const handleAjmanBranchCommissionValueChange = (e) => {
        const value = parseFloat(e.target.value);
        setAjmanBranchCommission(value);

        if (!isNaN(value) && revenueWithoutVat - brokerCommissionValue > 0) {
            const adjustedRevenue = revenueWithoutVat - brokerCommissionValue;
            const percentage = (value / adjustedRevenue) * 100;
            setAjmanBranchCommissionPercentage(Math.round(percentage));
        }
    };

    // Handler for Dubai Branch Commission Percentage Input
    const handleDubaiBranchCommissionPercentageChange = (e) => {
        const percentage = parseFloat(e.target.value);
        setDubaiBranchCommissionPercentage(percentage);

        if (isNaN(percentage) || percentage === '') {
            // Reset commission value if input is invalid
            setDubaiBranchCommission(0);
            return;
        }

        const adjustedRevenue = revenueWithoutVat - brokerCommissionValue;
        if (adjustedRevenue > 0) {
            const commissionValue = calculateCommission(adjustedRevenue, percentage);
            setDubaiBranchCommission(Math.round(commissionValue));
        }
    };

    // Handler for Dubai Branch Commission Value Input
    const handleDubaiBranchCommissionValueChange = (e) => {
        const value = parseFloat(e.target.value);
        setDubaiBranchCommission(value);

        if (!isNaN(value) && revenueWithoutVat - brokerCommissionValue > 0) {
            const adjustedRevenue = revenueWithoutVat - brokerCommissionValue;
            const percentage = (value / adjustedRevenue) * 100;
            setDubaiBranchCommissionPercentage(Math.round(percentage));
        }
    };

    // Handler for Dubai Branch Coordinator Commission Percentage Input
    const handleDubaiBranchCoordinatorCommissionPercentageChange = (e) => {
        const percentage = parseFloat(e.target.value);
        setDubaiBranchCoordinatorCommissionPercentage(percentage);

        if (isNaN(percentage) || percentage === '') {
            // Reset commission value if input is invalid
            setDubaiBranchCoordinatorCommission(0);
            return;
        }

        const adjustedRevenue = revenueWithoutVat - brokerCommissionValue;
        if (adjustedRevenue > 0) {
            const commissionValue = calculateCommission(adjustedRevenue, percentage);
            setDubaiBranchCoordinatorCommission(Math.round(commissionValue));
        }
    };

    // Handler for Dubai Branch Coordinator Commission Value Input
    const handleDubaiBranchCoordinatorCommissionValueChange = (e) => {
        const value = parseFloat(e.target.value);
        setDubaiBranchCoordinatorCommission(value);

        if (!isNaN(value) && revenueWithoutVat - brokerCommissionValue > 0) {
            const adjustedRevenue = revenueWithoutVat - brokerCommissionValue;
            const percentage = (value / adjustedRevenue) * 100;
            setDubaiBranchCoordinatorCommissionPercentage(Math.round(percentage));
        }
    };

    // Handler for Dubai Branch Team Leader Commission Percentage Input
    const handleDubaiBranchTeamLeaderCommissionPercentageChange = (e) => {
        const percentage = parseFloat(e.target.value);
        setDubaiBranchTeamLeaderCommissionPercentage(percentage);

        if (isNaN(percentage) || percentage === '') {
            // Reset commission value if input is invalid
            setDubaiBranchTeamLeaderCommission(0);
            return;
        }

        const adjustedRevenue = revenueWithoutVat - brokerCommissionValue;
        if (adjustedRevenue > 0) {
            const commissionValue = calculateCommission(adjustedRevenue, percentage);
            setDubaiBranchTeamLeaderCommission(Math.round(commissionValue));
        }
    };

    // Handler for Dubai Branch Team Leader Commission Value Input
    const handleDubaiBranchTeamLeaderCommissionValueChange = (e) => {
        const value = parseFloat(e.target.value);
        setDubaiBranchTeamLeaderCommission(value);

        if (!isNaN(value) && revenueWithoutVat - brokerCommissionValue > 0) {
            const adjustedRevenue = revenueWithoutVat - brokerCommissionValue;
            const percentage = (value / adjustedRevenue) * 100;
            setDubaiBranchTeamLeaderCommissionPercentage(Math.round(percentage));
        }
    };

    // Handler for Dubai Branch Agent Commission Percentage Input
    const handleDubaiBranchAgentCommissionPercentageChange = (e) => {
        const percentage = parseFloat(e.target.value);
        setDubaiBranchAgentCommissionPercentage(percentage);

        if (isNaN(percentage) || percentage === '') {
            // Reset commission value if input is invalid
            setDubaiBranchAgentCommission(0);
            return;
        }

        const adjustedRevenue = revenueWithoutVat - brokerCommissionValue;
        if (adjustedRevenue > 0) {
            const commissionValue = calculateCommission(adjustedRevenue, percentage);
            setDubaiBranchAgentCommission(Math.round(commissionValue));
        }
    };

    // Handler for Dubai Branch Agent Commission Value Input
    const handleDubaiBranchAgentCommissionValueChange = (e) => {
        const value = parseFloat(e.target.value);
        setDubaiBranchAgentCommission(value);

        if (!isNaN(value) && revenueWithoutVat - brokerCommissionValue > 0) {
            const adjustedRevenue = revenueWithoutVat - brokerCommissionValue;
            const percentage = (value / adjustedRevenue) * 100;
            setDubaiBranchAgentCommissionPercentage(Math.round(percentage));
        }
    };

    const handleDubaiBranchSalesManagerCommissionTransferChange = (e) => {
        const percentage = parseFloat(e.target.value);
        setDubaiBranchSalesManagerCommissionTransfer(percentage);

        if (isNaN(percentage) || percentage === '') {
            // Reset commission value if input is invalid
            setDubaiBranchSalesManagerCommissionValue(0);
            return;
        }

        // Example calculation for the commission value (you can adjust based on your business logic)
        const adjustedRevenue = revenueWithoutVat - brokerCommissionValue; // Adjust as per your formula
        if (adjustedRevenue > 0) {
            const commissionValue = calculateCommission(adjustedRevenue, percentage); // You can define this function as per your requirements
            setDubaiBranchSalesManagerCommissionValue(Math.round(commissionValue));
        }
    };

    const handleSalesManagerRef = (e) => {
        const value = parseFloat(e.target.value);
        setDubaiBranchSalesManagerCommissionValue(value);

        if (isNaN(value) || value === '') {
            // Reset percentage value if input is invalid
            setDubaiBranchSalesManagerCommissionTransfer(0);
            return;
        }

        const adjustedRevenue = revenueWithoutVat - brokerCommissionValue;
        if (adjustedRevenue > 0) {
            const percentage = (value / adjustedRevenue) * 100;
            setDubaiBranchSalesManagerCommissionTransfer(Math.round(percentage));
        }
    }
    // Handler for Agent Ref Commission Percentage Input
    const handleAgentRefCommissionTransferChange = (e) => {
        const percentage = parseFloat(e.target.value);
        setAgentRefCommissionPercentage(percentage);

        if (isNaN(percentage) || percentage === '') {
            // Reset commission value if input is invalid
            setAgentRefCommission(0);
            return;
        }

        // Calculate and update Agent Ref commission based on adjusted revenue
        const adjustedRevenue = revenueWithoutVat - brokerCommissionValue; // Adjusted revenue after broker commission
        if (adjustedRevenue > 0) {
            const commissionValue = calculateCommission(adjustedRevenue, percentage); // Calculate commission
            setAgentRefCommission(Math.round(commissionValue));
        }
    };

    // Handler for Agent Ref Commission Value Input
    const handleManagerRefCommissionTransferChange = (e) => {
        const value = parseFloat(e.target.value);
        setAgentRefCommission(value);

        if (isNaN(value) || value === '') {
            // Reset percentage value if input is invalid
            setAgentRefCommissionPercentage(0);
            return;
        }

        // Calculate and update Agent Ref commission percentage based on adjusted revenue
        const adjustedRevenue = revenueWithoutVat - brokerCommissionValue;
        if (adjustedRevenue > 0) {
            const percentage = (value / adjustedRevenue) * 100;
            setAgentRefCommissionPercentage(Math.round(percentage));
        }
    };

    // Handler for Marketing Manager Commission Percentage Input
    const handleMarketingManagerCommissionChange = (e) => {
        const percentage = parseFloat(e.target.value);
        setMarketingManagerCommissionPercentage(percentage);

        if (isNaN(percentage) || percentage === '') {
            // Reset commission value if input is invalid
            setMarketingManagerCommission(0);
            return;
        }

        // Calculate and update Marketing Manager commission based on adjusted revenue after broker commission
        const adjustedRevenue = revenueWithoutVat - brokerCommissionValue;
        if (adjustedRevenue > 0) {
            const marketingManagerCommissionValue = calculateCommission(adjustedRevenue, percentage);
            setMarketingManagerCommission(Math.round(marketingManagerCommissionValue));
        }
    };

    // Handler for Marketing Manager Commission Value Input
    const handleMarketingCommissionVlaue = (e) => {
        const value = parseFloat(e.target.value);
        setMarketingManagerCommission(value);

        if (isNaN(value) || value === '') {
            // Reset percentage value if input is invalid
            setMarketingManagerCommissionPercentage(0);
            return;
        }

        // Calculate and update Marketing Manager commission percentage based on adjusted revenue
        const adjustedRevenue = revenueWithoutVat - brokerCommissionValue;
        if (adjustedRevenue > 0) {
            const percentage = (value / adjustedRevenue) * 100;
            setMarketingManagerCommissionPercentage(Math.round(percentage));
        }
    };

    // Handler for Marketing Agent Commission Percentage Input
    const handleMarketingAgentCommissionChange = (e) => {
        const percentage = parseFloat(e.target.value);
        setMarketingAgentCommissionPercentage(percentage);

        if (isNaN(percentage) || percentage === '') {
            // Reset commission value if input is invalid
            setMarketingAgentCommission(0);
            return;
        }

        // Calculate and update Marketing Agent commission based on adjusted revenue after broker commission
        const adjustedRevenue = revenueWithoutVat - brokerCommissionValue;
        if (adjustedRevenue > 0) {
            const marketingAgentCommissionValue = calculateCommission(adjustedRevenue, percentage);
            setMarketingAgentCommission(Math.round(marketingAgentCommissionValue));
        }
    };

    // Handler for Marketing Agent Commission Value Input
    const handlemarketingAgentOne = (e) => {
        const value = parseFloat(e.target.value);
        setMarketingAgentCommission(value);

        if (isNaN(value) || value === '') {
            // Reset percentage value if input is invalid
            setMarketingAgentCommissionPercentage(0);
            return;
        }

        // Calculate and update Marketing Agent commission percentage based on adjusted revenue
        const adjustedRevenue = revenueWithoutVat - brokerCommissionValue;
        if (adjustedRevenue > 0) {
            const percentage = (value / adjustedRevenue) * 100;
            setMarketingAgentCommissionPercentage(Math.round(percentage));
        }
    };

    // Handler for Marketing Manager One Commission Percentage Input
    const handleMarketingManagerOneCommissionChange = (e) => {
        const percentage = parseFloat(e.target.value);
        setMarketingManagerOneCommissionPercentage(percentage);

        if (isNaN(percentage) || percentage === '') {
            // Reset commission value if input is invalid
            setMarketingManagerOneCommission(0);
            return;
        }

        // Calculate and update Marketing Manager commission based on adjusted revenue after broker commission
        const adjustedRevenue = revenueWithoutVat - brokerCommissionValue;
        if (adjustedRevenue > 0) {
            const marketingManagerOneCommissionValue = calculateCommission(adjustedRevenue, percentage);
            setMarketingManagerOneCommission(Math.round(marketingManagerOneCommissionValue));
        }
    };

    // Handler for Marketing Manager One Commission Value Input
    const handleMarketingOneAgent = (e) => {
        const value = parseFloat(e.target.value);
        setMarketingManagerOneCommission(value);

        if (isNaN(value) || value === '') {
            // Reset percentage value if input is invalid
            setMarketingManagerOneCommissionPercentage(0);
            return;
        }

        // Calculate and update Marketing Manager commission percentage based on adjusted revenue
        const adjustedRevenue = revenueWithoutVat - brokerCommissionValue;
        if (adjustedRevenue > 0) {
            const percentage = (value / adjustedRevenue) * 100;
            setMarketingManagerOneCommissionPercentage(Math.round(percentage));
        }
    };
    // Handler for Marketing Agent One Commission Percentage Input
    const handleMarketingAgentOneCommissionChange = (e) => {
        const percentage = parseFloat(e.target.value);
        setMarketingAgentOneCommissionPercentage(percentage);

        if (isNaN(percentage) || percentage === '') {
            // Reset commission value if input is invalid
            setMarketingAgentOneCommission(0);
            return;
        }

        // Calculate and update Marketing Agent commission based on adjusted revenue after broker commission
        const adjustedRevenue = revenueWithoutVat - brokerCommissionValue;
        if (adjustedRevenue > 0) {
            const marketingAgentOneCommissionValue = calculateCommission(adjustedRevenue, percentage);
            setMarketingAgentOneCommission(Math.round(marketingAgentOneCommissionValue));
        }
    };

    // Handler for Marketing Agent One Commission Value Input
    const handleMarketingAgentTwo = (e) => {
        const value = parseFloat(e.target.value);
        setMarketingAgentOneCommission(value);

        if (isNaN(value) || value === '') {
            // Reset percentage value if input is invalid
            setMarketingAgentOneCommissionPercentage(0);
            return;
        }

        // Calculate and update Marketing Agent commission percentage based on adjusted revenue
        const adjustedRevenue = revenueWithoutVat - brokerCommissionValue;
        if (adjustedRevenue > 0) {
            const percentage = (value / adjustedRevenue) * 100;
            setMarketingAgentOneCommissionPercentage(Math.round(percentage));
        }
    };
    // Handler for IT Manager Commission Percentage Input
    const handleItManagerCommissionChange = (e) => {
        const percentage = parseFloat(e.target.value);
        setItManagerCommissionPercentage(percentage);

        if (isNaN(percentage) || percentage === '') {
            // Reset commission value if input is invalid
            setItManagerCommission(0);
            return;
        }

        // Calculate and update IT Manager commission based on adjusted revenue after broker commission
        const adjustedRevenue = revenueWithoutVat - brokerCommissionValue;
        if (adjustedRevenue > 0) {
            const ITManagerCommissionValue = calculateCommission(adjustedRevenue, percentage);
            setItManagerCommission(Math.round(ITManagerCommissionValue));
        }
    };

    // Handler for IT Manager Commission Value Input (for updating percentage)
    const handleItManagerCommission = (e) => {
        const value = parseFloat(e.target.value);
        setItManagerCommission(value);

        if (isNaN(value) || value === '') {
            // Reset percentage value if input is invalid
            setItManagerCommissionPercentage(0);
            return;
        }

        // Calculate and update IT Manager commission percentage based on adjusted revenue
        const adjustedRevenue = revenueWithoutVat - brokerCommissionValue;
        if (adjustedRevenue > 0) {
            const percentage = (value / adjustedRevenue) * 100;
            setItManagerCommissionPercentage(Math.round(percentage));
        }
    };

    // Handler for IT Developer Commission Percentage Input
    const handleItDeveloperCommissionChange = (e) => {
        const percentage = parseFloat(e.target.value);
        setDeveloperCommissionPercentage(percentage);

        if (isNaN(percentage) || percentage === '') {
            // Reset commission value if input is invalid
            setDeveloperCommission(0);
            return;
        }

        // Calculate and update IT Developer commission based on adjusted revenue after broker commission
        const adjustedRevenue = revenueWithoutVat - brokerCommissionValue;
        if (adjustedRevenue > 0) {
            const ITDeveloperCommissionValue = calculateCommission(adjustedRevenue, percentage);
            setDeveloperCommission(Math.round(ITDeveloperCommissionValue));
        }
    };

    // Handler for IT Developer Commission Value Input (for updating percentage)
    const handledevelopercommission = (e) => {
        const value = parseFloat(e.target.value);
        setDeveloperCommission(value);

        if (isNaN(value) || value === '') {
            // Reset percentage value if input is invalid
            setDeveloperCommissionPercentage(0);
            return;
        }

        // Calculate and update IT Developer commission percentage based on adjusted revenue
        const adjustedRevenue = revenueWithoutVat - brokerCommissionValue;
        if (adjustedRevenue > 0) {
            const percentage = (value / adjustedRevenue) * 100;
            setDeveloperCommissionPercentage(Math.round(percentage));
        }
    };

    // Handler for IT Developer One Commission Percentage Input
    const handleDeveloperOneCommissionChange = (e) => {
        const percentage = parseFloat(e.target.value);
        setDeveloperOneCommissionPercentage(percentage);

        if (isNaN(percentage) || percentage === '') {
            // Reset commission value if input is invalid
            setDeveloperOneCommission(0);
            return;
        }

        // Calculate and update IT Developer One commission based on adjusted revenue after broker commission
        const adjustedRevenue = revenueWithoutVat - brokerCommissionValue;
        if (adjustedRevenue > 0) {
            const ITDeveloperOneCommissionValue = calculateCommission(adjustedRevenue, percentage);
            setDeveloperOneCommission(Math.round(ITDeveloperOneCommissionValue));
        }
    };

    // Handler for IT Developer One Commission Value Input (for updating percentage)
    const handleDeveloperOneCommission = (e) => {
        const value = parseFloat(e.target.value);
        setDeveloperOneCommission(value);

        if (isNaN(value) || value === '') {
            // Reset percentage value if input is invalid
            setDeveloperOneCommissionPercentage(0);
            return;
        }

        // Calculate and update IT Developer One commission percentage based on adjusted revenue
        const adjustedRevenue = revenueWithoutVat - brokerCommissionValue;
        if (adjustedRevenue > 0) {
            const percentage = (value / adjustedRevenue) * 100;
            setDeveloperOneCommissionPercentage(Math.round(percentage));
        }
    };
    // Handler for IT Developer Two Commission Percentage Input
    const handleDeveloperTwoCommissionChange = (e) => {
        const percentage = parseFloat(e.target.value);
        setDeveloperTwoCommissionPercentage(percentage);

        if (isNaN(percentage) || percentage === '') {
            // Reset commission value if input is invalid
            setDeveloperTwoCommission(0);
            return;
        }

        // Calculate and update IT Developer Two commission based on adjusted revenue after broker commission
        const adjustedRevenue = revenueWithoutVat - brokerCommissionValue;
        if (adjustedRevenue > 0) {
            const ITDeveloperTwoCommissionValue = calculateCommission(adjustedRevenue, percentage);
            setDeveloperTwoCommission(Math.round(ITDeveloperTwoCommissionValue));
        }
    };

    // Handler for IT Developer Two Commission Value Input (for updating percentage)
    const handleDeveloperTwocommission = (e) => {
        const value = parseFloat(e.target.value);
        setDeveloperTwoCommission(value);

        if (isNaN(value) || value === '') {
            // Reset percentage value if input is invalid
            setDeveloperTwoCommissionPercentage(0);
            return;
        }

        // Calculate and update IT Developer Two commission percentage based on adjusted revenue
        const adjustedRevenue = revenueWithoutVat - brokerCommissionValue;
        if (adjustedRevenue > 0) {
            const percentage = (value / adjustedRevenue) * 100;
            setDeveloperTwoCommissionPercentage(Math.round(percentage));
        }
    };

    // Handler for Tele Sales HOD Commission Percentage Input
    const handleTeleSalesHodCommissionChange = (e) => {
        const percentage = parseFloat(e.target.value);
        setTeleSalesHodCommissionPercentage(percentage);

        if (isNaN(percentage) || percentage === '') {
            // Reset commission value if input is invalid
            setTeleSalesHodCommission(0);
            return;
        }

        // Calculate and update Tele Sales HOD commission based on adjusted revenue after broker commission
        const adjustedRevenue = revenueWithoutVat - brokerCommissionValue;
        if (adjustedRevenue > 0) {
            const teleSalesHodCommissionValue = calculateCommission(adjustedRevenue, percentage);
            setTeleSalesHodCommission(Math.round(teleSalesHodCommissionValue));
        }
    };

    // Handler for Tele Sales HOD Commission Value Input (for updating percentage)
    const handleTeleSalesCommission = (e) => {
        const value = parseFloat(e.target.value);
        setTeleSalesHodCommission(value);

        if (isNaN(value) || value === '') {
            // Reset percentage value if input is invalid
            setTeleSalesHodCommissionPercentage(0);
            return;
        }

        // Calculate and update Tele Sales HOD commission percentage based on adjusted revenue
        const adjustedRevenue = revenueWithoutVat - brokerCommissionValue;
        if (adjustedRevenue > 0) {
            const percentage = (value / adjustedRevenue) * 100;
            setTeleSalesHodCommissionPercentage(Math.round(percentage));
        }
    };

    // Handler for Tele Sales Team Leader Commission Percentage Input
    const handleTeleSalesTeamLeaderCommissionChange = (e) => {
        const percentage = parseFloat(e.target.value);
        setTeleSalesTeamLeaderCommissionPercentage(percentage);

        if (isNaN(percentage) || percentage === '') {
            // Reset commission value if input is invalid
            setTeleSalesTeamLeaderCommission(0);
            return;
        }

        // Calculate and update Tele Sales Team Leader commission based on adjusted revenue after broker commission
        const adjustedRevenue = revenueWithoutVat - brokerCommissionValue;
        if (adjustedRevenue > 0) {
            const teleSalesTeamLeaderCommissionValue = calculateCommission(adjustedRevenue, percentage);
            setTeleSalesTeamLeaderCommission(Math.round(teleSalesTeamLeaderCommissionValue));
        }
    };

    // Handler for Tele Sales Team Leader Commission Value Input (for updating percentage)
    const handleTeleSalesTSagentCommission = (e) => {
        const value = parseFloat(e.target.value);
        setTeleSalesTeamLeaderCommission(value);

        if (isNaN(value) || value === '') {
            // Reset percentage value if input is invalid
            setTeleSalesTeamLeaderCommissionPercentage(0);
            return;
        }

        // Calculate and update Tele Sales Team Leader commission percentage based on adjusted revenue
        const adjustedRevenue = revenueWithoutVat - brokerCommissionValue;
        if (adjustedRevenue > 0) {
            const percentage = (value / adjustedRevenue) * 100;
            setTeleSalesTeamLeaderCommissionPercentage(Math.round(percentage));
        }
    };
    // Transfer Case Handler
    const handleReferalManager = (selectedReferalHod) => {
        if (selectedReferalHod) {
            setSelectManagerReferal(selectedReferalHod)
        } else {
            setSelectManagerReferal(null)
            setAgentRefCommissionPercentage(0)
            setAgentRefCommission(0)
        }
    }

    const handleReferalHod = (selectedReferalManager) => {
        if (selectedReferalManager) {
            setSelectedHodReferal(selectedReferalManager)
        } else {
            setSelectedHodReferal(null)
            setDubaiBranchSalesManagerCommissionTransfer('')
            setDubaiBranchSalesManagerCommissionValue(0)
        }
    }

    return (
        <div>
            <Modal
                size="xl"
                aria-labelledby="contained-modal-title-vcenter"
                centered
                show={leadtocontract}
                onHide={() => setLeadToContract(false)}
            >
                <Modal.Header closeButton style={{ border: 'none' }}>
                    <Modal.Title className='text-center mutual_class_color'>
                        {rtl === 'true'
                            ? `نموذج طلب الخدمة (${singleLead ? singleLead.products?.name : leads?.[0]?.products?.name})`
                            : `Service Application Form (${singleLead ? singleLead.products?.name : leads?.[0]?.products?.name})`}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Card className='convertToLead_card modal_body_bg_color' style={{ border: '#d7aa47' }}>
                            <Row>
                                <Col xs={12} md={12}>
                                    <Form.Group className="mb-3" controlId="formBasicEmail">
                                        <Form.Label
                                            className={`mb-0 mutual_class_color ${rtl === 'true' ? 'text-right' : 'text-left'}`}
                                        >
                                            {rtl === 'true' ? 'المبلغ المالي' : 'Financial Amount'}
                                        </Form.Label>
                                        <Form.Control
                                            type="text"
                                            placeholder={rtl === 'true' ? 'أدخل المبلغ' : 'Enter Amount'}
                                            className='convert_to_lead_input_field input_field_input_field'
                                            value={financialAmount}
                                            onChange={(e) => setFinancialAmount(Math.max(0, parseFloat(e.target.value) || 0))}
                                            required
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>
                            <Row>
                                <Col xs={12} md={3}>
                                    <Form.Group className="mb-3" controlId="formBankCommission">
                                        <Form.Label
                                            className={`mb-0 mutual_class_color ${rtl === 'true' ? 'text-right' : 'text-left'}`}
                                        >
                                            {rtl === 'true' ? 'عمولة البنك' : 'Bank Commission'}
                                        </Form.Label>
                                        <Form.Control
                                            type="text"
                                            placeholder={rtl === 'true' ? 'عمولة البنك' : 'Bank Commission'}
                                            className='convert_to_lead_input_field input_field_input_field'
                                            value={bankCommission}
                                            onChange={(e) => setBankCommission(Math.max(0, parseFloat(e.target.value) || 0))}
                                            required
                                        />
                                    </Form.Group>
                                </Col>

                                <Col xs={12} md={3}>
                                    <Form.Group className="mb-3" controlId="formCustomerCommission">
                                        <Form.Label
                                            className={`mb-0 mutual_class_color ${rtl === 'true' ? 'text-right' : 'text-left'}`}
                                        >
                                            {rtl === 'true' ? 'عمولة العميل' : 'Customer Commission'}
                                        </Form.Label>
                                        <Form.Control
                                            type="text"
                                            placeholder={rtl === 'true' ? 'عمولة العميل' : 'Customer Commission'}
                                            className='convert_to_lead_input_field input_field_input_field'
                                            value={customerCommission}
                                            onChange={(e) => setCustomerCommission(Math.max(0, parseFloat(e.target.value) || 0))}
                                            required
                                        />
                                    </Form.Group>
                                </Col>

                                <Col xs={12} md={3}>
                                    <Form.Group className="mb-3" controlId="formRevenueWithVat">
                                        <Form.Label
                                            className={`mb-0 mutual_class_color ${rtl === 'true' ? 'text-right' : 'text-left'}`}
                                        >
                                            {rtl === 'true' ? 'الإيرادات (مع ضريبة القيمة المضافة 5%)' : 'Revenue (with VAT 5%)'}
                                        </Form.Label>
                                        <Form.Control
                                            type="text"
                                            className='convert_to_lead_input_field input_field_input_field'
                                            value={Math.max(0, Math.round(revenueWithVat))} // Ensures no negative values
                                            disabled
                                        />
                                    </Form.Group>
                                </Col>

                                <Col xs={12} md={3}>
                                    <Form.Group className="mb-3" controlId="formRevenueWithoutVat">
                                        <Form.Label
                                            className={`mb-0 mutual_class_color ${rtl === 'true' ? 'text-right' : 'text-left'}`}
                                        >
                                            {rtl === 'true' ? 'الإيرادات (بدون ضريبة القيمة المضافة 5%)' : 'Revenue (without VAT 5%)'}
                                        </Form.Label>
                                        <Form.Control
                                            type="number"
                                            className='convert_to_lead_input_field input_field_input_field'
                                            value={Math.max(0, Math.round(revenueWithoutVat))} // Ensures no negative values
                                            disabled
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>
                        </Card>

                        {/* <Card className="convertToLead_card modal_body_bg_color mt-2" style={{ borderColor: '#d7aa47' }}>
                            <Row >
                                <Col xs={12} md={6}>
                                    <Form.Group controlId="inputField1">
                                        <Form.Label className='mutual_class_color' >Created By</Form.Label>
                                        <Form.Control type="text" value={userName && userName} className='convert_to_lead_input_field input_field_input_field' readOnly />
                                    </Form.Group>
                                </Col>

                            </Row>
                        </Card> */}

                        {/* Third Card */}
                        <Card className='convertToLead_card mt-2 modal_body_bg_color' style={{ border: '#d7aa47' }}>
                            {
                                leadData.lead_type?.name === 'Others' && leadData.source?.name === 'Third Party' && (
                                    <h5 className='heading_tag mutual_class_color'>3rd Party</h5>
                                )
                            }
                            <Row>
                                <Col xs={12} md={6}>
                                    <Form.Group controlId="inputField1">
                                        <Form.Label className='mutual_class_color' >Created By</Form.Label>
                                        <Form.Control type="text" value={userName && userName} className='convert_to_lead_input_field input_field_input_field' readOnly />
                                    </Form.Group>
                                </Col>
                                {leadData.lead_type?.name === 'Others' && leadData.source?.name === 'Third Party' && (
                                    <>
                                        <Col xs={12} md={3}>
                                            <Form.Group className="mb-3" controlId="formBrokerName">
                                                <Form.Control
                                                    type="text"
                                                    name="brokerName"
                                                    value={singleLead?.thirdpartyname ? singleLead?.thirdpartyname : null}
                                                    // onChange={(e) => setBrokerName(e.target.value)}
                                                    className='convert_to_lead_input_field input_field_input_field'
                                                    placeholder="3rd Party Broker Name"
                                                    readOnly
                                                />
                                            </Form.Group>
                                        </Col>

                                        <Col xs={12} md={1}>
                                            <Form.Group className="mb-3" controlId="formBrokerCommission">
                                                <Form.Control
                                                    type="text"
                                                    className="convert_to_lead_input_field input_field_input_field"
                                                    placeholder="(%)"
                                                    value={brokerCommission}
                                                    onChange={handleBrokerCommissionChange}
                                                />
                                            </Form.Group>
                                        </Col>

                                        <Col xs={12} md={2}>
                                            <Form.Group className="mb-3" controlId="formHodCommission">
                                                <Form.Control
                                                    type="text"
                                                    className="convert_to_lead_input_field input_field_input_field"
                                                    placeholder="commission Value"
                                                    value={Math.round(brokerCommissionValue)}
                                                    disabled
                                                />
                                            </Form.Group>
                                        </Col>
                                    </>
                                )}
                            </Row>
                        </Card>
                        {/* Second Card */}
                        <Card className='convertToLead_card mt-2 modal_body_bg_color' style={{ border: '#d7aa47' }} >
                            <h5
                                className={`heading_tag mutual_class_color ${rtl === 'true' ? 'text-right' : 'text-left'}`}
                            >
                                {rtl === 'true' ? 'أبوظبي (المقر الرئيسي)' : 'Abu Dhabi (Head Office)'}
                            </h5>
                            <Row>
                                {hasHodRole && hodOptions.length > 0 && (
                                    <>
                                        <Col xs={12} md={3}>
                                            <Form.Group className="mb-3" controlId="formBasicHOD">
                                                <Select
                                                    className="custom-select mutual_heading_class input_field_input_field"
                                                    classNamePrefix="react-select"
                                                    options={hodOptions.map(hod => ({
                                                        label: hod.name, // Display the name in options
                                                        value: hod._id   // Use the _id as the value
                                                    }))}
                                                    placeholder="Select HOD"
                                                    isClearable
                                                    onChange={HandlerChange}
                                                />
                                            </Form.Group>
                                        </Col>

                                        <Col xs={12} md={1}>
                                            <Form.Group className="mb-3" controlId="formHodCommissionPercentage">
                                                <Form.Control
                                                    type="text"
                                                    className="convert_to_lead_input_field input_field_input_field"
                                                    placeholder="(%)"
                                                    onChange={handleHodCommissionChange}
                                                    value={hodCommissionPercentage || ''}
                                                    disabled={!selectedHod}
                                                />
                                            </Form.Group>
                                        </Col>

                                        <Col xs={12} md={2}>
                                            <Form.Group className="mb-3" controlId="formHodCommissionValue">
                                                <Form.Control
                                                    type="text"
                                                    className="convert_to_lead_input_field input_field_input_field"
                                                    placeholder="Commission Value"
                                                    value={hodCommission || ''}
                                                    onChange={handleHodCommissionValueChange}
                                                    disabled={!selectedHod}
                                                />
                                            </Form.Group>
                                        </Col>
                                    </>
                                )}

                                {/* Manager*/}
                                {
                                    hasManagerRole && (
                                        <>
                                            <Col xs={12} md={3}>
                                                <Form.Group className="mb-3" controlId="formBasicManager">
                                                    <Select
                                                        className="custom-select mutual_heading_class input_field_input_field"
                                                        classNamePrefix="react-select"
                                                        options={managerOptions.map(manager => ({
                                                            label: manager.name, // Display the name in options
                                                            value: manager._id   // Use the _id as the value
                                                        }))}
                                                        placeholder="Manager"
                                                        isClearable
                                                        onChange={handleManagerChange}
                                                    />
                                                </Form.Group>
                                            </Col>

                                            <Col xs={12} md={1}>
                                                <Form.Group className="mb-3" controlId="formSalesManagerCommissionPercentage">
                                                    <Form.Control
                                                        type="text"
                                                        className="convert_to_lead_input_field mutual_heading_class input_field_input_field"
                                                        placeholder="(%)"
                                                        onChange={handleSalesManagerCommissionChange}
                                                        value={salesManagerCommissionPercentage || ''}
                                                        disabled={!selectedManger}
                                                    />
                                                </Form.Group>
                                            </Col>

                                            <Col xs={12} md={2}>
                                                <Form.Group className="mb-3" controlId="formSalesManagerCommissionValue">
                                                    <Form.Control
                                                        type="text"
                                                        className="convert_to_lead_input_field mutual_heading_class input_field_input_field"
                                                        placeholder="Commission Value"
                                                        value={salesManagerCommission || ''}
                                                        onChange={handleSalesManagerCommissionValueChange}
                                                        disabled={!selectedManger}
                                                    />
                                                </Form.Group>
                                            </Col>
                                        </>
                                    )
                                }
                                {/* Coordinator*/}
                                {
                                    hascoordinatorRole && (
                                        <>
                                            <Col xs={12} md={3}>
                                                <Form.Group className="mb-3" controlId="formBasicCoordinator">
                                                    <Select
                                                        className="custom-select mutual_heading_class input_field_input_field"
                                                        classNamePrefix="react-select"
                                                        options={coordinatorOptions.map(c => ({
                                                            label: c.name, // Display the name in options
                                                            value: c._id   // Use the _id as the value
                                                        }))}
                                                        placeholder="Coordinator"
                                                        isClearable
                                                        onChange={handleCoordinatorChange}
                                                    />
                                                </Form.Group>
                                            </Col>

                                            <Col xs={12} md={1}>
                                                <Form.Group className="mb-3" controlId="formCoordinatorCommissionPercentage">
                                                    <Form.Control
                                                        type="text"
                                                        className="convert_to_lead_input_field mutual_heading_class input_field_input_field"
                                                        placeholder="(%)"
                                                        onChange={handleCoordinatorCommissionPercentageChange}
                                                        value={coordinatorCommissionPercentage || ''}
                                                        disabled={!selectedCoordinator}
                                                    />
                                                </Form.Group>
                                            </Col>

                                            <Col xs={12} md={2}>
                                                <Form.Group className="mb-3" controlId="formCoordinatorCommissionValue">
                                                    <Form.Control
                                                        type="text"
                                                        className="convert_to_lead_input_field mutual_heading_class input_field_input_field"
                                                        placeholder="Commission Value"
                                                        value={coordinatorCommission || ''}
                                                        onChange={handleCoordinatorCommissionValueChange}
                                                        disabled={!selectedCoordinator}
                                                    />
                                                </Form.Group>
                                            </Col>
                                        </>
                                    )
                                }

                                {/* Team Leader*/}
                                {
                                    hasTeamLeaderRole && (
                                        <>
                                            <Col xs={12} md={3}>
                                                <Form.Group className="mb-3" controlId="formBasicTeamLeader">
                                                    <Select
                                                        className="custom-select mutual_heading_class input_field_input_field"
                                                        classNamePrefix="react-select"
                                                        options={teamLeaderOptions.map(teamleader => ({
                                                            label: teamleader.name, // Display the name in options
                                                            value: teamleader._id   // Use the _id as the value
                                                        }))} // Use the teamLeaderOptions array here
                                                        placeholder="Team Leader"
                                                        isClearable
                                                        onChange={handleTeamLeaderChange}
                                                    />
                                                </Form.Group>
                                            </Col>

                                            <Col xs={12} md={1}>
                                                <Form.Group className="mb-3" controlId="formTeamLeaderCommissionPercentage">
                                                    <Form.Control
                                                        type="text"
                                                        className="convert_to_lead_input_field mutual_heading_class input_field_input_field"
                                                        placeholder="(%)"
                                                        onChange={handleTeamLeaderCommissionPercentageChange}
                                                        value={teamLeaderCommissionPercentage || ''}
                                                        disabled={!selectedTeamLeader}
                                                    />
                                                </Form.Group>
                                            </Col>

                                            <Col xs={12} md={2}>
                                                <Form.Group className="mb-3" controlId="formTeamLeaderCommissionValue">
                                                    <Form.Control
                                                        type="text"
                                                        className="convert_to_lead_input_field mutual_heading_class input_field_input_field"
                                                        placeholder="Commission Value"
                                                        value={teamLeaderCommission || ''}
                                                        onChange={handleTeamLeaderCommissionValueChange}
                                                        disabled={!selectedTeamLeader}
                                                    />
                                                </Form.Group>
                                            </Col>
                                        </>
                                    )
                                }
                                {/* Sales Agent One*/}
                                <Col xs={12} md={3}>
                                    <Form.Group className="mb-3" controlId="formBasicTsAgent">
                                        <Select
                                            className="custom-select mutual_heading_class input_field_input_field"
                                            classNamePrefix="react-select"
                                            options={tsAgentOptions.map(tsagent => ({
                                                label: tsagent.name, // Display the name in options
                                                value: tsagent._id   // Use the _id as the value
                                            }))} // Use the teamLeaderOptions array here
                                            placeholder="Sales Agent (1) "
                                            isClearable
                                            onChange={handleSaleAgentChange}
                                        />
                                    </Form.Group>
                                </Col>

                                <Col xs={12} md={1}>
                                    <Form.Group className="mb-3" controlId="formAgentCommissionPercentage">
                                        <Form.Control
                                            type="text"
                                            className="convert_to_lead_input_field input_field_input_field"
                                            placeholder="(%)"
                                            onChange={handleAgentCommissionPercentageChange}
                                            value={agentCommissionPercentage || ''}
                                            disabled={!selectedSalesAgent}
                                        />
                                    </Form.Group>
                                </Col>

                                <Col xs={12} md={2}>
                                    <Form.Group className="mb-3" controlId="formAgentCommissionValue">
                                        <Form.Control
                                            type="text"
                                            className="convert_to_lead_input_field input_field_input_field"
                                            placeholder="Commission Value"
                                            value={agentCommission || ''}
                                            onChange={handleAgentCommissionValueChange}
                                            disabled={!selectedSalesAgent}
                                        />
                                    </Form.Group>
                                </Col>

                                {/* Sales Agent Two*/}
                                <Col xs={12} md={3}>
                                    <Form.Group className="mb-3" controlId="formBasicTsAgentOne">
                                        <Select
                                            className="custom-select mutual_heading_class input_field_input_field"
                                            classNamePrefix="react-select"
                                            options={tsAgentOptions.map(tsagent => ({
                                                label: tsagent.name, // Display the name in options
                                                value: tsagent._id   // Use the _id as the value
                                            }))} // Use the teamLeaderOptions array here
                                            placeholder="Sales Agent (2)"
                                            isClearable
                                            onChange={handleSaleAgentOneChange}
                                        />
                                    </Form.Group>
                                </Col>

                                <Col xs={12} md={1}>
                                    <Form.Group className="mb-3" controlId="formAgentOneCommissionPercentage">
                                        <Form.Control
                                            type="text"
                                            className="convert_to_lead_input_field input_field_input_field"
                                            placeholder="(%)"
                                            onChange={handleAgentOneCommissionPercentageChange}
                                            value={agentOneCommissionPercentage || ''}
                                            disabled={!selectedSalesAgentOne}
                                        />
                                    </Form.Group>
                                </Col>

                                <Col xs={12} md={2}>
                                    <Form.Group className="mb-3" controlId="formAgentOneCommissionValue">
                                        <Form.Control
                                            type="text"
                                            className="convert_to_lead_input_field input_field_input_field"
                                            placeholder="Commission Value"
                                            value={agentOneCommission || ''}
                                            onChange={handleAgentOneCommissionValueChange}
                                            disabled={!selectedSalesAgentOne}
                                        />
                                    </Form.Group>
                                </Col>

                            </Row>

                            {/* Ajman Branch */}
                            {
                                leadData?.selected_users?.some(user => user?.branch?.name === 'Ajman') && (
                                    <>
                                        <Card className='convertToLead_card input_field_input_field'>
                                            <h5 className='heading_tag mutual_class_color'>Ajman Branch</h5>
                                            <Row>
                                                {/* Manager */}
                                                {
                                                    hasManagerInAjman && (
                                                        <>
                                                            <Col xs={12} md={3}>
                                                                <Form.Group className="mb-3" controlId="formAjmanManager">
                                                                    <Select
                                                                        className="custom-select mutual_heading_class input_field_input_field"
                                                                        classNamePrefix="react-select"
                                                                        options={managerAjmanOptions.map(manager => ({
                                                                            label: manager.name, // Display the name in options
                                                                            value: manager._id   // Use the _id as the value
                                                                        }))}
                                                                        placeholder="Manager"
                                                                        isClearable
                                                                        onChange={handleAjmanManagerChange}
                                                                    />
                                                                </Form.Group>
                                                            </Col>

                                                            <Col xs={12} md={1}>
                                                                <Form.Group className="mb-3" controlId="formAjmanManagerCommissionPercentage">
                                                                    <Form.Control
                                                                        type="text"
                                                                        className="convert_to_lead_input_field mutual_heading_class input_field_input_field"
                                                                        placeholder="(%)"
                                                                        onChange={handleAjmanManagerCommissionPercentageChange}
                                                                        value={ajmanManagerCommissionPercentage || ''}
                                                                        disabled={!selectedAjmanManger}
                                                                    />
                                                                </Form.Group>
                                                            </Col>

                                                            <Col xs={12} md={2}>
                                                                <Form.Group className="mb-3" controlId="formAjmanManagerCommissionValue">
                                                                    <Form.Control
                                                                        type="text"
                                                                        className="convert_to_lead_input_field mutual_heading_class input_field_input_field"
                                                                        placeholder="Commission Value"
                                                                        value={ajmanManagerCommission || ''}
                                                                        onChange={handleAjmanManagerCommissionValueChange}
                                                                        disabled={!selectedAjmanManger}
                                                                    />
                                                                </Form.Group>
                                                            </Col>
                                                        </>
                                                    )
                                                }

                                                {/* Coordinator */}
                                                {
                                                    hasCoordinatorInAjman && (
                                                        <>
                                                            <Col xs={12} md={3}>
                                                                <Form.Group className="mb-3" controlId="formBasicCoordinator">
                                                                    <Select
                                                                        className="custom-select mutual_heading_class input_field_input_field"
                                                                        classNamePrefix="react-select"
                                                                        options={coordinatorAjmanOptions.map(c => ({
                                                                            label: c.name, // Display the name in options
                                                                            value: c._id   // Use the _id as the value
                                                                        }))}
                                                                        placeholder="Coordinator"
                                                                        isClearable
                                                                        onChange={handleAjmanCoordinatorChange}
                                                                    />
                                                                </Form.Group>
                                                            </Col>

                                                            {/* Commission Percentage Input */}
                                                            <Col xs={12} md={1}>
                                                                <Form.Group className="mb-3" controlId="formAjmanCoordinatorCommissionPercentage">
                                                                    <Form.Control
                                                                        type="text"
                                                                        className="convert_to_lead_input_field mutual_heading_class input_field_input_field"
                                                                        placeholder="(%)"
                                                                        value={ajmanCoordinatorCommissionPercentage || ''}
                                                                        onChange={handleAjmanCoordinatorCommissionPercentageChange}
                                                                        disabled={!selectedAjmanCoordinator}
                                                                    />
                                                                </Form.Group>
                                                            </Col>

                                                            {/* Commission Value Input */}
                                                            <Col xs={12} md={2}>
                                                                <Form.Group className="mb-3" controlId="formAjmanCoordinatorCommissionValue">
                                                                    <Form.Control
                                                                        type="text"
                                                                        className="convert_to_lead_input_field mutual_heading_class input_field_input_field"
                                                                        placeholder="Commission Value"
                                                                        value={ajmanCoordinatorCommissionValue || ''}
                                                                        onChange={handleAjmanCoordinatorCommissionValueChange}
                                                                        disabled={!selectedAjmanCoordinator}
                                                                    />
                                                                </Form.Group>
                                                            </Col>
                                                        </>
                                                    )
                                                }

                                                {/* Team Leader */}
                                                {
                                                    hasTeamLeaderInAjman && (
                                                        <>

                                                            <Col xs={12} md={3}>
                                                                <Form.Group className="mb-3" controlId="formBasicTeamLeader">
                                                                    <Select
                                                                        className="custom-select mutual_heading_class input_field_input_field"
                                                                        classNamePrefix="react-select"
                                                                        options={teamLeaderAjmanOptions.map(teamleader => ({
                                                                            label: teamleader.name, // Display the name in options
                                                                            value: teamleader._id   // Use the _id as the value
                                                                        }))} // Use the teamLeaderOptions array here
                                                                        placeholder="Team Leader"
                                                                        isClearable
                                                                        onChange={handleAjmanTeamLeaderChange}
                                                                    />
                                                                </Form.Group>
                                                            </Col>

                                                            {/* Commission Percentage Input */}
                                                            <Col xs={12} md={1}>
                                                                <Form.Group className="mb-3" controlId="formAjmanTeamLeaderCommissionPercentage">
                                                                    <Form.Control
                                                                        type="text"
                                                                        className="convert_to_lead_input_field mutual_heading_class input_field_input_field"
                                                                        placeholder="(%)"
                                                                        onChange={handleAjmanTeamLeaderCommissionPercentageChange}
                                                                        value={ajmanTeamLeaderCommissionPercentage || ''}
                                                                        disabled={!selectedAjmanTeamLeader}
                                                                    />
                                                                </Form.Group>
                                                            </Col>

                                                            {/* Commission Value Input */}
                                                            <Col xs={12} md={2}>
                                                                <Form.Group className="mb-3" controlId="formAjmanTeamLeaderCommissionValue">
                                                                    <Form.Control
                                                                        type="text"
                                                                        className="convert_to_lead_input_field mutual_heading_class input_field_input_field"
                                                                        placeholder="Commission Value"
                                                                        value={ajmanTeamLeaderCommission || ''}
                                                                        onChange={handleAjmanTeamLeaderCommissionValueChange}
                                                                        disabled={!selectedAjmanTeamLeader}
                                                                    />
                                                                </Form.Group>
                                                            </Col>
                                                        </>
                                                    )
                                                }


                                                {/* Sales */}
                                                <Col xs={12} md={3}>
                                                    <Form.Group className="mb-3" controlId="formBasicTsAgent">
                                                        <Select
                                                            className="custom-select mutual_heading_class input_field_input_field"
                                                            classNamePrefix="react-select"
                                                            options={tsAgentAjmanOptions.map(tsagent => ({
                                                                label: tsagent.name, // Display the name in options
                                                                value: tsagent._id   // Use the _id as the value
                                                            }))} // Use the teamLeaderOptions array here
                                                            placeholder="Sales Agent"
                                                            isClearable
                                                            onChange={handleAjmanSaleAgentChange}
                                                        />
                                                    </Form.Group>
                                                </Col>

                                                {/* Commission Percentage Input */}
                                                <Col xs={12} md={1}>
                                                    <Form.Group className="mb-3" controlId="formAjmanBranchCommissionPercentage">
                                                        <Form.Control
                                                            type="text"
                                                            className="convert_to_lead_input_field input_field_input_field"
                                                            placeholder="(%)"
                                                            onChange={handleAjmanBranchCommissionPercentageChange}
                                                            value={ajmanBranchCommissionPercentage || ''}
                                                            disabled={!selectedSalesAgentAjman}
                                                        />
                                                    </Form.Group>
                                                </Col>

                                                {/* Commission Value Input */}
                                                <Col xs={12} md={2}>
                                                    <Form.Group className="mb-3" controlId="formAjmanBranchCommissionValue">
                                                        <Form.Control
                                                            type="text"
                                                            className="convert_to_lead_input_field input_field_input_field"
                                                            placeholder="Commission Value"
                                                            value={ajmanBranchCommission || ''}
                                                            onChange={handleAjmanBranchCommissionValueChange}
                                                            disabled={!selectedSalesAgentAjman}
                                                        />
                                                    </Form.Group>
                                                </Col>


                                            </Row>
                                        </Card>
                                    </>
                                )
                            }

                            {/* Dubai */}
                            {
                                leadData?.selected_users?.some(user => user?.branch?.name === 'Dubai') && (
                                    <>
                                        <Card className='convertToLead_card input_field_input_field mt-2'>
                                            <h5 className='heading_tag mutual_class_color'>Dubai Branch</h5>
                                            <Row>
                                                {/* Manager */}
                                                {
                                                    hasManagerInDubai && (
                                                        <>
                                                            <Col xs={12} md={3}>
                                                                <Form.Group className="mb-3" controlId="formBasicManager">
                                                                    <Select
                                                                        className="custom-select mutual_heading_class input_field_input_field"
                                                                        classNamePrefix="react-select"
                                                                        options={managerDubaiOptions.map(manager => ({
                                                                            label: manager.name, // Display the name in options
                                                                            value: manager._id   // Use the _id as the value
                                                                        }))}
                                                                        placeholder="Manager"
                                                                        isClearable
                                                                        onChange={handleDubaiManagerChange}
                                                                    />
                                                                </Form.Group>
                                                            </Col>

                                                            {/* Commission Percentage Input */}
                                                            <Col xs={12} md={1}>
                                                                <Form.Group className="mb-3" controlId="formDubaiBranchCommissionPercentage">
                                                                    <Form.Control
                                                                        type="text"
                                                                        className="convert_to_lead_input_field mutual_heading_class input_field_input_field"
                                                                        placeholder="(%)"
                                                                        onChange={handleDubaiBranchCommissionPercentageChange}
                                                                        value={dubaiBranchCommissionPercentage || ''}
                                                                        disabled={!selectedDubaiManger}
                                                                    />
                                                                </Form.Group>
                                                            </Col>

                                                            {/* Commission Value Input */}
                                                            <Col xs={12} md={2}>
                                                                <Form.Group className="mb-3" controlId="formDubaiBranchCommissionValue">
                                                                    <Form.Control
                                                                        type="text"
                                                                        className="convert_to_lead_input_field mutual_heading_class input_field_input_field"
                                                                        placeholder="Commission Value"
                                                                        value={dubaiBranchCommission || ''}
                                                                        onChange={handleDubaiBranchCommissionValueChange}
                                                                        disabled={!selectedDubaiManger}
                                                                    />
                                                                </Form.Group>
                                                            </Col>
                                                        </>
                                                    )
                                                }

                                                {/* Coordinator */}
                                                {
                                                    hasCoordinatorInDubai && (
                                                        <>

                                                            <Col xs={12} md={3}>
                                                                <Form.Group className="mb-3" controlId="formBasicCoordinator">
                                                                    <Select
                                                                        className="custom-select mutual_heading_class input_field_input_field"
                                                                        classNamePrefix="react-select"
                                                                        options={coordinatorDubaiOptions.map(c => ({
                                                                            label: c.name, // Display the name in options
                                                                            value: c._id   // Use the _id as the value
                                                                        }))}
                                                                        placeholder="Coordinator"
                                                                        isClearable
                                                                        onChange={handleDubaiCoordinatorChange}
                                                                    />
                                                                </Form.Group>
                                                            </Col>

                                                            {/* Commission Percentage Input for Dubai Branch */}
                                                            <Col xs={12} md={1}>
                                                                <Form.Group className="mb-3" controlId="formDubaiBranchCoordinatorCommissionPercentage">
                                                                    <Form.Control
                                                                        type="text"
                                                                        className="convert_to_lead_input_field mutual_heading_class input_field_input_field"
                                                                        placeholder="(%)"
                                                                        onChange={handleDubaiBranchCoordinatorCommissionPercentageChange}
                                                                        value={dubaiBranchCoordinatorCommissionPercentage || ''}
                                                                        disabled={!selectedDubaiCoordinator}
                                                                    />
                                                                </Form.Group>
                                                            </Col>

                                                            {/* Commission Value Input for Dubai Branch */}
                                                            <Col xs={12} md={2}>
                                                                <Form.Group className="mb-3" controlId="formDubaiBranchCoordinatorCommissionValue">
                                                                    <Form.Control
                                                                        type="text"
                                                                        className="convert_to_lead_input_field mutual_heading_class input_field_input_field"
                                                                        placeholder="Commission Value"
                                                                        value={dubaiBranchCoordinatorCommission || ''}
                                                                        onChange={handleDubaiBranchCoordinatorCommissionValueChange}
                                                                        disabled={!selectedDubaiCoordinator}
                                                                    />
                                                                </Form.Group>
                                                            </Col>
                                                        </>
                                                    )
                                                }

                                                {
                                                    hasTeamLeaderInDubai && (
                                                        <>
                                                            {/* Team Leader */}
                                                            <Col xs={12} md={3}>
                                                                <Form.Group className="mb-3" controlId="formBasicTeamLeader">
                                                                    <Select
                                                                        className="custom-select mutual_heading_class input_field_input_field"
                                                                        classNamePrefix="react-select"
                                                                        options={teamLeaderDubaiOptions.map(teamleader => ({
                                                                            label: teamleader.name, // Display the name in options
                                                                            value: teamleader._id   // Use the _id as the value
                                                                        }))} // Use the teamLeaderOptions array here
                                                                        placeholder="Team Leader"
                                                                        isClearable
                                                                        onChange={handleDubaiTeamLeaderChange}
                                                                    />
                                                                </Form.Group>
                                                            </Col>

                                                            {/* Commission Percentage Input for Dubai Branch - Team Leader */}
                                                            <Col xs={12} md={1}>
                                                                <Form.Group className="mb-3" controlId="formDubaiBranchTeamLeaderCommissionPercentage">
                                                                    <Form.Control
                                                                        type="text"
                                                                        className="convert_to_lead_input_field mutual_heading_class input_field_input_field"
                                                                        placeholder="(%)"
                                                                        onChange={handleDubaiBranchTeamLeaderCommissionPercentageChange}
                                                                        value={dubaiBranchTeamLeaderCommissionPercentage || ''}
                                                                        disabled={!selectedDubaiTeamLeader}
                                                                    />
                                                                </Form.Group>
                                                            </Col>

                                                            {/* Commission Value Input for Dubai Branch - Team Leader */}
                                                            <Col xs={12} md={2}>
                                                                <Form.Group className="mb-3" controlId="formDubaiBranchTeamLeaderCommissionValue">
                                                                    <Form.Control
                                                                        type="text"
                                                                        className="convert_to_lead_input_field mutual_heading_class input_field_input_field"
                                                                        placeholder="Commission Value"
                                                                        value={dubaiBranchTeamLeaderCommission || ''}
                                                                        onChange={handleDubaiBranchTeamLeaderCommissionValueChange}
                                                                        disabled={!selectedDubaiTeamLeader}
                                                                    />
                                                                </Form.Group>
                                                            </Col>
                                                        </>
                                                    )
                                                }


                                                {/* Sales */}
                                                <Col xs={12} md={3}>
                                                    <Form.Group className="mb-3" controlId="formBasicTsAgent">
                                                        <Select
                                                            className="custom-select mutual_heading_class input_field_input_field"
                                                            classNamePrefix="react-select"
                                                            options={tsAgentDubaiOptions.map(tsagent => ({
                                                                label: tsagent.name, // Display the name in options
                                                                value: tsagent._id   // Use the _id as the value
                                                            }))} // Use the teamLeaderOptions array here
                                                            placeholder="Sales Agent"
                                                            isClearable
                                                            onChange={handleDubaiSaleAgentChange}
                                                        />
                                                    </Form.Group>
                                                </Col>
                                                {/* Dubai Branch Agent Commission Percentage Input */}
                                                <Col xs={12} md={1}>
                                                    <Form.Group className="mb-3" controlId="formDubaiBranchAgentCommissionPercentage">
                                                        <Form.Control
                                                            type="text"
                                                            className="convert_to_lead_input_field input_field_input_field"
                                                            placeholder="(%)"
                                                            onChange={handleDubaiBranchAgentCommissionPercentageChange}
                                                            value={dubaiBranchAgentCommissionPercentage || ''}
                                                            disabled={!selectedDubaiSales}
                                                        />
                                                    </Form.Group>
                                                </Col>

                                                {/* Dubai Branch Agent Commission Value Input */}
                                                <Col xs={12} md={2}>
                                                    <Form.Group className="mb-3" controlId="formDubaiBranchAgentCommissionValue">
                                                        <Form.Control
                                                            type="text"
                                                            className="convert_to_lead_input_field input_field_input_field"
                                                            placeholder="Commission Value"
                                                            value={dubaiBranchAgentCommission || ''}
                                                            onChange={handleDubaiBranchAgentCommissionValueChange}
                                                            disabled={!selectedDubaiSales}
                                                        />
                                                    </Form.Group>
                                                </Col>

                                            </Row>
                                        </Card>
                                    </>
                                )
                            }

                            {/* is_transfer */}
                            <div>
                                {leadData?.is_transfer &&
                                    <>
                                        <Card className='convertToLead_card mt-2 modal_body_bg_color' style={{ border: '#d7aa47' }}>
                                            <h5
                                                className={`heading_tag mutual_class_color ${rtl === 'true' ? 'text-right' : 'text-left'}`}
                                            >
                                                {rtl === 'true' ? 'معلومات التحويل' : 'Transfer Information'}
                                            </h5>
                                            <Row>
                                                <Col xs={12} md={3}>
                                                    <Form.Group className="mb-3" controlId="formSalesManagerRefTransfer">
                                                        {leadData?.ref_hod?.name ? (
                                                            <Form.Control
                                                                type="text"
                                                                className='convert_to_lead_input_field input_field_input_field'
                                                                placeholder='HOD (Transfer)'
                                                                value={leadData?.ref_hod?.name ? leadData?.ref_hod?.name : null}
                                                                // onChange={(e) => setTransferHod(e.target.value)}
                                                                readOnly
                                                            />
                                                        ) :
                                                            (
                                                                <Select
                                                                    options={hodReferalOptions.map(hod => ({
                                                                        label: hod.name, // Display the name in options
                                                                        value: hod._id   // Use the _id as the value
                                                                    }))}
                                                                    className="custom-select mutual_heading_class input_field_input_field"
                                                                    classNamePrefix="react-select"
                                                                    onChange={handleReferalHod}
                                                                    isClearable
                                                                    placeholder="Select Referal HOD"
                                                                />
                                                            )}
                                                    </Form.Group>
                                                </Col>
                                                {/* Sales Manager Commission Transfer Input */}
                                                <Col xs={12} md={1}>
                                                    <Form.Group className="mb-3" controlId="formDubaiBranchSalesManagerCommissionTransfer">
                                                        <Form.Control
                                                            type="text"
                                                            className="convert_to_lead_input_field input_field_input_field"
                                                            placeholder="(%)"
                                                            onChange={handleDubaiBranchSalesManagerCommissionTransferChange}
                                                            value={dubaiBranchSalesManagerCommissionTransfer || ''}
                                                            disabled={!leadData?.ref_hod?.name && !selectHodReferal}
                                                        />
                                                    </Form.Group>
                                                </Col>

                                                {/* Sales Manager Commission Value Display */}
                                                <Col xs={12} md={2}>
                                                    <Form.Group className="mb-3" controlId="">
                                                        <Form.Control
                                                            type="text"
                                                            className="convert_to_lead_input_field input_field_input_field"
                                                            placeholder="Commission Value"
                                                            value={dubaiBranchSalesManagerCommissionValue || ''}
                                                            onChange={handleSalesManagerRef}
                                                            disabled={!leadData?.ref_hod?.name && !selectHodReferal}
                                                        />
                                                    </Form.Group>
                                                </Col>

                                                <Col xs={12} md={3}>
                                                    <Form.Group className="mb-3" controlId="formAgentRefTransfer">
                                                        {leadData?.ref_manager?.name ? (
                                                            <Form.Control
                                                                type="text"
                                                                className='convert_to_lead_input_field input_field_input_field'
                                                                placeholder='Sales Manager (Transfer)'
                                                                value={leadData?.ref_manager?.name ? leadData?.ref_manager?.name : null}
                                                                // onChange={(e) => setTransferManager(e.target.value)}
                                                                readOnly
                                                            />
                                                        )
                                                            :
                                                            (
                                                                <Select
                                                                    options={ManagerReferalOptions.map(hod => ({
                                                                        label: hod.name, // Display the name in options
                                                                        value: hod._id   // Use the _id as the value
                                                                    }))}
                                                                    className="custom-select mutual_heading_class input_field_input_field"
                                                                    classNamePrefix="react-select"
                                                                    onChange={handleReferalManager}
                                                                    isClearable
                                                                    placeholder="Select Referal Manager"
                                                                />
                                                            )}
                                                    </Form.Group>
                                                </Col>

                                                <Col xs={12} md={1}>
                                                    <Form.Group className="mb-3" controlId="formAgentCommissionTransfer">
                                                        <Form.Control
                                                            type="text"
                                                            className='convert_to_lead_input_field input_field_input_field'
                                                            placeholder='(%)'
                                                            value={agentRefCommissionPercentage || ''}
                                                            onChange={handleAgentRefCommissionTransferChange} // Add the handler here
                                                            disabled={!leadData?.ref_manager?.name && !selectManagerReferal}
                                                        />

                                                    </Form.Group>
                                                </Col>

                                                <Col xs={12} md={2}>
                                                    <Form.Group className="mb-3" controlId="formCoordinatorCommission">
                                                        <Form.Control
                                                            type="text"
                                                            className='convert_to_lead_input_field input_field_input_field'
                                                            placeholder='commission Value'
                                                            value={agentRefCommission || ''}
                                                            onChange={handleManagerRefCommissionTransferChange}
                                                            disabled={!leadData?.ref_manager?.name && !selectManagerReferal}
                                                        />
                                                    </Form.Group>
                                                </Col>
                                            </Row>
                                        </Card>
                                    </>
                                }
                            </div>

                            {/* Lead Cards */}
                            {leadData?.lead_type?.name !== "Others" && (
                                <Card className='convertToLead_card mt-2 input_field_input_field'>
                                    {leadData && leadData.lead_type && (
                                        <>
                                            {leadData?.lead_type?.name !== "Others" && (
                                                <h5 className="heading_tag mutual_class_color">
                                                    {`${leadData.lead_type.name} Team`}
                                                </h5>
                                            )}
                                            <Row>
                                                {leadData.lead_type?.name === 'Marketing' && (
                                                    <>
                                                        <Col xs={12} md={3}>
                                                            <Form.Group className="mb-3" controlId="formTeleSalesHOD">
                                                                <Select
                                                                    className="custom-select input_field_input_field"
                                                                    classNamePrefix="react-select"
                                                                    placeholder="Team Leader"
                                                                    options={marketingOptions.map(option => ({
                                                                        label: option.name, // Display the name in the dropdown
                                                                        value: option._id,  // Use the unique ID as the value
                                                                    }))}
                                                                    isClearable
                                                                    onChange={handleMarketingManagerChange}
                                                                />
                                                            </Form.Group>
                                                        </Col>

                                                        <Col xs={12} md={1}>
                                                            <Form.Group className="mb-3" controlId="formMarketingManagerCommission">
                                                                <Form.Control
                                                                    type="text"
                                                                    className='convert_to_lead_input_field input_field_input_field'
                                                                    placeholder='(%)'
                                                                    value={marketingManagerCommissionPercentage || ''}
                                                                    onChange={handleMarketingManagerCommissionChange} // Add the handler here
                                                                    disabled={!selectedMarketingManager}
                                                                />
                                                            </Form.Group>
                                                        </Col>

                                                        <Col xs={12} md={2}>
                                                            <Form.Group className="mb-3" controlId="formCoordinatorCommission">
                                                                <Form.Control
                                                                    type="text"
                                                                    className='convert_to_lead_input_field input_field_input_field'
                                                                    placeholder='commission Value'
                                                                    value={marketingManagerCommission || ''}
                                                                    onChange={handleMarketingCommissionVlaue}
                                                                    disabled={!selectedMarketingManager}

                                                                />
                                                            </Form.Group>
                                                        </Col>

                                                        <Col xs={12} md={3}>
                                                            <Form.Group className="mb-3" controlId="formTeleSalesHOD">
                                                                <Select
                                                                    className="custom-select input_field_input_field"
                                                                    classNamePrefix="react-select"
                                                                    placeholder="Marketing Agent (1) "
                                                                    options={marketingOptions.map(option => ({
                                                                        label: option.name, // Display the name in the dropdown
                                                                        value: option._id,  // Use the unique ID as the value
                                                                    }))}
                                                                    isClearable
                                                                    onChange={handleMarketingAgentChange}
                                                                />
                                                            </Form.Group>
                                                        </Col>

                                                        <Col xs={12} md={1}>
                                                            <Form.Group className="mb-3" controlId="formMarketingAgentCommission">
                                                                <Form.Control
                                                                    type="text"
                                                                    className='convert_to_lead_input_field input_field_input_field'
                                                                    placeholder='(%)'
                                                                    value={marketingAgentCommissionPercentage || ''}
                                                                    onChange={handleMarketingAgentCommissionChange} // Add the handler here
                                                                    disabled={!selectedMarketingAgent}
                                                                />

                                                            </Form.Group>
                                                        </Col>

                                                        <Col xs={12} md={2}>
                                                            <Form.Group className="mb-3" controlId="formCoordinatorCommission">
                                                                <Form.Control
                                                                    type="text"
                                                                    className='convert_to_lead_input_field input_field_input_field'
                                                                    placeholder='commission Value'
                                                                    value={marketingAgentCommission || ''}
                                                                    onChange={handlemarketingAgentOne}
                                                                    disabled={!selectedMarketingAgent}
                                                                />
                                                            </Form.Group>
                                                        </Col>
                                                        {/* 2nd */}
                                                        <Col xs={12} md={3}>
                                                            <Form.Group className="mb-3" controlId="formTeleSalesHOD">
                                                                <Select
                                                                    className="custom-select input_field_input_field"
                                                                    classNamePrefix="react-select"
                                                                    placeholder="Marketing Agent (2)"
                                                                    options={marketingOptions.map(option => ({
                                                                        label: option.name, // Display the name in the dropdown
                                                                        value: option._id,  // Use the unique ID as the value
                                                                    }))}
                                                                    isClearable
                                                                    onChange={handleMarketingManagerOneChange}
                                                                />
                                                            </Form.Group>
                                                        </Col>

                                                        <Col xs={12} md={1}>
                                                            <Form.Group className="mb-3" controlId="formMarketingManagerCommission">
                                                                <Form.Control
                                                                    type="text"
                                                                    className='convert_to_lead_input_field input_field_input_field'
                                                                    placeholder='(%)'
                                                                    value={marketingManagerOneCommissionPercentage || ''}
                                                                    onChange={handleMarketingManagerOneCommissionChange} // Add the handler here
                                                                    disabled={!selectedMarketingManagerOne}
                                                                />

                                                            </Form.Group>
                                                        </Col>

                                                        <Col xs={12} md={2}>
                                                            <Form.Group className="mb-3" controlId="formCoordinatorCommission">
                                                                <Form.Control
                                                                    type="text"
                                                                    className='convert_to_lead_input_field input_field_input_field'
                                                                    placeholder='commission Value'
                                                                    value={marketingManagerOneCommission || ''}
                                                                    onChange={handleMarketingOneAgent}
                                                                    disabled={!selectedMarketingManagerOne}
                                                                />
                                                            </Form.Group>
                                                        </Col>

                                                        <Col xs={12} md={3}>
                                                            <Form.Group className="mb-3" controlId="formTeleSalesHOD">
                                                                <Select
                                                                    className="custom-select input_field_input_field"
                                                                    classNamePrefix="react-select"
                                                                    placeholder="Marketing Agent (3)"
                                                                    options={marketingOptions.map(option => ({
                                                                        label: option.name, // Display the name in the dropdown
                                                                        value: option._id,  // Use the unique ID as the value
                                                                    }))}
                                                                    isClearable
                                                                    onChange={handleMarketingAgentOneChange}
                                                                />
                                                            </Form.Group>
                                                        </Col>

                                                        <Col xs={12} md={1}>
                                                            <Form.Group className="mb-3" controlId="formMarketingAgentCommission">
                                                                <Form.Control
                                                                    type="text"
                                                                    className='convert_to_lead_input_field input_field_input_field'
                                                                    placeholder='(%)'
                                                                    value={marketingAgentOneCommissionPercentage || ''}
                                                                    onChange={handleMarketingAgentOneCommissionChange} // Add the handler here
                                                                    disabled={!selectedMarketingAgentOne}
                                                                />

                                                            </Form.Group>
                                                        </Col>

                                                        <Col xs={12} md={2}>
                                                            <Form.Group className="mb-3" controlId="formCoordinatorCommission">
                                                                <Form.Control
                                                                    type="text"
                                                                    className='convert_to_lead_input_field input_field_input_field'
                                                                    placeholder='commission Value'
                                                                    value={marketingAgentOneCommission || ''}
                                                                    onChange={handleMarketingAgentTwo}
                                                                    disabled={!selectedMarketingAgentOne}
                                                                />
                                                            </Form.Group>
                                                        </Col>
                                                        {/* Software Team */}
                                                        <h5 className='heading_tag mutual_class_color'>Software Team</h5>
                                                        <Col xs={12} md={3}>
                                                            <Form.Group className="mb-3" controlId="formTeleSalesHOD">
                                                                <Select
                                                                    className="custom-select input_field_input_field"
                                                                    classNamePrefix="react-select"
                                                                    placeholder="IT Manager"
                                                                    options={developerOptions.map(option => ({
                                                                        label: option.name, // Display the name in the dropdown
                                                                        value: option._id,  // Use the unique ID as the value
                                                                    }))}
                                                                    isClearable
                                                                    onChange={handleITManagerChange}
                                                                />
                                                            </Form.Group>
                                                        </Col>

                                                        <Col xs={12} md={1}>
                                                            <Form.Group className="mb-3" controlId="formMarketingManagerCommission">
                                                                <Form.Control
                                                                    type="text"
                                                                    className='convert_to_lead_input_field input_field_input_field'
                                                                    placeholder='(%)'
                                                                    value={ItManagerCommissionPercentage || ''}
                                                                    onChange={handleItManagerCommissionChange} // Add the handler here
                                                                    disabled={!selectedItManager}
                                                                />

                                                            </Form.Group>
                                                        </Col>

                                                        <Col xs={12} md={2}>
                                                            <Form.Group className="mb-3" controlId="formCoordinatorCommission">
                                                                <Form.Control
                                                                    type="text"
                                                                    className='convert_to_lead_input_field input_field_input_field'
                                                                    placeholder='commission Value'
                                                                    value={ItManagerCommission || ''}
                                                                    onChange={handleItManagerCommission}
                                                                    disabled={!selectedItManager}
                                                                />
                                                            </Form.Group>
                                                        </Col>
                                                        {/* Developer */}
                                                        <Col xs={12} md={3}>
                                                            <Form.Group className="mb-3" controlId="formTeleSalesHOD">
                                                                <Select
                                                                    className="custom-select input_field_input_field"
                                                                    classNamePrefix="react-select"
                                                                    placeholder="Developer"
                                                                    options={developerOptions.map(option => ({
                                                                        label: option.name, // Display the name in the dropdown
                                                                        value: option._id,  // Use the unique ID as the value
                                                                    }))}
                                                                    isClearable
                                                                    onChange={handleItDeveloperChange}
                                                                />
                                                            </Form.Group>
                                                        </Col>

                                                        <Col xs={12} md={1}>
                                                            <Form.Group className="mb-3" controlId="formMarketingAgentCommission">
                                                                <Form.Control
                                                                    type="text"
                                                                    className='convert_to_lead_input_field input_field_input_field'
                                                                    placeholder='(%)'
                                                                    value={developerCommissionPercentage || ''}
                                                                    onChange={handleItDeveloperCommissionChange} // Add the handler here
                                                                    disabled={!developer}
                                                                />
                                                            </Form.Group>
                                                        </Col>

                                                        <Col xs={12} md={2}>
                                                            <Form.Group className="mb-3" controlId="formCoordinatorCommission">
                                                                <Form.Control
                                                                    type="text"
                                                                    className='convert_to_lead_input_field input_field_input_field'
                                                                    placeholder='commission Value'
                                                                    onChange={handledevelopercommission}
                                                                    value={developerCommission || ''}
                                                                    disabled={!developer}
                                                                />
                                                            </Form.Group>
                                                        </Col>

                                                        <Col xs={12} md={3}>
                                                            <Form.Group className="mb-3" controlId="formTeleSalesHOD">
                                                                <Select
                                                                    className="custom-select input_field_input_field"
                                                                    classNamePrefix="react-select"
                                                                    placeholder="Developer One"
                                                                    options={developerOptions.map(option => ({
                                                                        label: option.name, // Display the name in the dropdown
                                                                        value: option._id,  // Use the unique ID as the value
                                                                    }))}
                                                                    isClearable
                                                                    onChange={handleDeveloperOneChange}
                                                                />
                                                            </Form.Group>
                                                        </Col>

                                                        <Col xs={12} md={1}>
                                                            <Form.Group className="mb-3" controlId="formMarketingManagerCommission">
                                                                <Form.Control
                                                                    type="text"
                                                                    className='convert_to_lead_input_field input_field_input_field'
                                                                    placeholder='(%)'
                                                                    value={developerOneCommissionPercentage || ''}
                                                                    onChange={handleDeveloperOneCommissionChange} // Add the handler here
                                                                    disabled={!developerOne}
                                                                />
                                                            </Form.Group>
                                                        </Col>

                                                        <Col xs={12} md={2}>
                                                            <Form.Group className="mb-3" controlId="formCoordinatorCommission">
                                                                <Form.Control
                                                                    type="text"
                                                                    className='convert_to_lead_input_field input_field_input_field'
                                                                    placeholder='commission Value'
                                                                    value={developerOneCommission || ''}
                                                                    onChange={handleDeveloperOneCommission}
                                                                    disabled={!developerOne}
                                                                />
                                                            </Form.Group>
                                                        </Col>

                                                        <Col xs={12} md={3}>
                                                            <Form.Group className="mb-3" controlId="formTeleSalesHOD">
                                                                <Select
                                                                    className="custom-select input_field_input_field"
                                                                    classNamePrefix="react-select"
                                                                    placeholder="Developer Two"
                                                                    options={developerOptions.map(option => ({
                                                                        label: option.name, // Display the name in the dropdown
                                                                        value: option._id,  // Use the unique ID as the value
                                                                    }))}
                                                                    isClearable
                                                                    onChange={handleDeveloperTwoChange}
                                                                />
                                                            </Form.Group>
                                                        </Col>

                                                        <Col xs={12} md={1}>
                                                            <Form.Group className="mb-3" controlId="formMarketingAgentCommission">
                                                                <Form.Control
                                                                    type="text"
                                                                    className='convert_to_lead_input_field input_field_input_field'
                                                                    placeholder='(%)'
                                                                    value={developerTwoCommissionPercentage || ''}
                                                                    onChange={handleDeveloperTwoCommissionChange} // Add the handler here
                                                                    disabled={!developerTwo}
                                                                />
                                                            </Form.Group>
                                                        </Col>

                                                        <Col xs={12} md={2}>
                                                            <Form.Group className="mb-3" controlId="formCoordinatorCommission">
                                                                <Form.Control
                                                                    type="text"
                                                                    className='convert_to_lead_input_field input_field_input_field'
                                                                    placeholder='commission Value'
                                                                    value={developerTwoCommission || ''}
                                                                    onChange={handleDeveloperTwocommission}
                                                                    disabled={!developerTwo}
                                                                />
                                                            </Form.Group>
                                                        </Col>

                                                    </>
                                                )}

                                                {leadData.lead_type?.name === 'Tele Sales' && (
                                                    <>
                                                        <Col xs={12} md={3}>
                                                            <Form.Group className="mb-3" controlId="formTeleSalesHOD">
                                                                <Select
                                                                    className="custom-select input_field_input_field"
                                                                    classNamePrefix="react-select"
                                                                    placeholder="Team Leader"
                                                                    options={teleSalesTeamLeaderOptions.map(option => ({
                                                                        label: option.name, // Display the name in the dropdown
                                                                        value: option._id,  // Use the unique ID as the value
                                                                    }))}
                                                                    isClearable
                                                                    onChange={handleTelesalesHodChange}
                                                                />
                                                            </Form.Group>
                                                        </Col>

                                                        <Col xs={12} md={1}>
                                                            <Form.Group className="mb-3" controlId="formTeleSalesHODCommission">
                                                                <Form.Control
                                                                    type="text"
                                                                    className='convert_to_lead_input_field input_field_input_field'
                                                                    placeholder='(%)'
                                                                    value={teleSalesHodCommissionPercentage || ''}
                                                                    onChange={handleTeleSalesHodCommissionChange} // Add the handler here
                                                                    disabled={!selectedTeleSalesMaangers}
                                                                />
                                                            </Form.Group>
                                                        </Col>

                                                        <Col xs={12} md={2}>
                                                            <Form.Group className="mb-3" controlId="formCoordinatorCommission">
                                                                <Form.Control
                                                                    type="text"
                                                                    className='convert_to_lead_input_field input_field_input_field'
                                                                    placeholder='commission Value'
                                                                    value={teleSalesHodCommission || ''}
                                                                    onChange={handleTeleSalesCommission}
                                                                    disabled={!selectedTeleSalesMaangers}
                                                                />
                                                            </Form.Group>
                                                        </Col>

                                                        <Col xs={12} md={3}>
                                                            <Form.Group className="mb-3" controlId="formTeleSalesHOD">
                                                                <Select
                                                                    className="custom-select input_field_input_field"
                                                                    classNamePrefix="react-select"
                                                                    placeholder="TS Agent"
                                                                    options={teleTsAgentOptions.map(option => ({
                                                                        label: option.name, // Display the name in the dropdown
                                                                        value: option._id,  // Use the unique ID as the value
                                                                    }))}
                                                                    isClearable
                                                                    onChange={handleTelesalesTeamLeaderChange}
                                                                />
                                                            </Form.Group>
                                                        </Col>

                                                        <Col xs={12} md={1}>
                                                            <Form.Group className="mb-3" controlId="formTeleSalesTeamLeaderCommission">
                                                                <Form.Control
                                                                    type="text"
                                                                    className='convert_to_lead_input_field input_field_input_field'
                                                                    placeholder='(%)'
                                                                    value={teleSalesTeamLeaderCommissionPercentage || ''}
                                                                    onChange={handleTeleSalesTeamLeaderCommissionChange}
                                                                    disabled={!selectedtelesalesTeamLeader}
                                                                />
                                                            </Form.Group>
                                                        </Col>

                                                        <Col xs={12} md={2}>
                                                            <Form.Group className="mb-3" controlId="formCoordinatorCommission">
                                                                <Form.Control
                                                                    type="text"
                                                                    className='convert_to_lead_input_field input_field_input_field'
                                                                    placeholder='commission Value'
                                                                    value={teleSalesTeamLeaderCommission || ''}
                                                                    onChange={handleTeleSalesTSagentCommission}
                                                                    disabled={!selectedtelesalesTeamLeader}
                                                                />
                                                            </Form.Group>
                                                        </Col>
                                                    </>
                                                )}
                                            </Row>
                                        </>
                                    )}
                                </Card>
                            )}

                        </Card>
                    </Form>
                </Modal.Body>
                <Modal.Footer style={{ border: 'none', direction: rtl === 'true' ? 'rtl' : 'ltr' }}>
                    <Button
                        className='all_close_btn_container'
                        onClick={() => setLeadToContract(false)}
                    >
                        {rtl === 'true' ? 'إغلاق' : 'Close'}
                    </Button>
                    <Button
                        className='all_common_btn_single_lead'
                        onClick={LeadConvertHandler}
                    >
                        {rtl === 'true' ? 'إنشاء العقد' : 'Create Contract'}
                    </Button>
                </Modal.Footer>

            </Modal>

            {/* Contract Modal */}
            <Modal
                size="lg"
                aria-labelledby="contained-modal-title-vcenter"
                centered
                show={contractModal}
                onHide={() => setContractModal(false)}
                style={{ zIndex: '-100px' }}
            >
                <Modal.Body>

                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }} >
                        <FiAlertCircle style={{ fontSize: '100px', color: '#ffc16a' }} />
                    </div>

                    <div className='lead_information_data mt-3' >
                        <h4 style={{ fontSize: '1.875em', fontWeight: '600px', textAlign: 'center' }} className='mutual_heading_class'>Alert</h4>
                        <p style={{ fontSize: '1.125em' }} className='mutual_heading_class'>
                            Please check all <span style={{ color: '#ff3863' }} >Lead Information</span>  . Once a lead is converted to <span style={{ color: '#5dc9d6' }} >Service Application</span>, it can't be <span style={{ color: '#ff3863' }} >changed</span>.
                        </p>
                    </div>
                </Modal.Body>
                <Modal.Footer style={{ border: 'none' }} >
                    <Button className='all_close_btn_container' onClick={() => setContractModal(false)}>No</Button>
                    <Button className='all_single_leads_button' onClick={openLeadContractModal}>Yes</Button>
                </Modal.Footer>
            </Modal>
        </div>
    )
}
export default ConvertLead