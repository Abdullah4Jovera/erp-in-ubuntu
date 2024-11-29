import React, { useState, useEffect } from 'react';
import { Row, Col, Modal, Button, Form, Card } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import axios from 'axios';
import Select from 'react-select';
import '../Components/convertLead/convertLeadStyle.css'
import { FiAlertCircle } from "react-icons/fi";
import { useNavigate } from 'react-router-dom';

const EditContract = ({ leadId, setLeadToContract, leadtocontract, fetchSingleLead, contractModal, setContractModal, singleLead, leads, rtl, setEditModal, editModal, contract }) => {
    // User Token
    const token = useSelector(state => state.loginSlice.user?.token)
    const { service_commission_id } = contract
    console.log(service_commission_id, 'servicecommissionvalue')
    // Set initial values using useState
    const [financialAmount, setFinancialAmount] = useState(0);
    const [bankCommission, setBankCommission] = useState(0);
    const [customerCommission, setCustomerCommission] = useState(0);
    const [withVatCommission, setWithVatCommission] = useState(0);
    const [withoutVatCommission, setWithoutVatCommission] = useState(0);
    const [selectedHOD, setSelectedHOD] = useState(null);
    console.log(selectedHOD, 'selectedHOD')
    // Edit Value
    const [leadData, setLeadData] = useState({});
    const [hodOptions, setHodOptions] = useState([]);
    const [managerOptions, setManagerOptions] = useState([]);
    const [managerAjmanOptions, setManagerAjmanOptions] = useState([]);
    const [managerDubaiOptions, setManagerDubaiOptions] = useState([]);
    const [coordinatorOptions, setCoordinatorOptions] = useState([]);
    const [coordinatorAjmanOptions, setCoordinatorAjmanOptions] = useState([]);
    const [teamLeaderOptions, setTeamLeaderOptions] = useState([]);
    const [teamLeaderAjmanOptions, setTeamLeaderAjmanOptions] = useState([]);
    const [tsAgentOptions, setTsAgentOptions] = useState([]);
    const [tsAgentAjmanOptions, setTsAgentAjmanOptions] = useState([]);
    const [developerOptions, setDeveloperOptions] = useState([])
    const [marketingOptions, setMarketingOptions] = useState([])
    const [revenueWithVat, setRevenueWithVat] = useState('');
    const [revenueWithoutVat, setRevenueWithoutVat] = useState('');
    const [brokerName, setBrokerName] = useState('')
    const [otherPersonName, setOtherPersonName] = useState('')
    const [userOptions, setUserOptions] = useState([]);
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
    const [teamLeaderTwoCommissionPercentage, setTeamLeaderTwoCommissionPercentage] = useState(0);
    const [teamLeaderTwoCommission, setTeamLeaderTwoCommission] = useState(0);
    const [agentOneCommissionPercentage, setAgentOneCommissionPercentage] = useState(0);
    const [agentTwoCommissionPercentage, setAgentTwoCommissionPercentage] = useState(0);
    const [salesManagerTwoCommissionPercentage, setSalesManagerTwoCommissionPercentage] = useState(0);
    const [salesManagerTwoCommission, setSalesManagerTwoCommission] = useState(0);
    const [selectedManagerTwo, setSelectedManagerTwo] = useState(null);
    const [ajmanManagerCommissionPercentage, setAjmanManagerCommissionPercentage] = useState('');
    const [ajmanManagerCommission, setAjmanManagerCommission] = useState('');
    const [ajmanCoordinatorCommissionPercentage, setAjmanCoordinatorCommissionPercentage] = useState(0); // Percentage
    const [ajmanCoordinatorCommissionValue, setAjmanCoordinatorCommissionValue] = useState(0); // Commission value
    const [ajmanTeamLeaderCommissionPercentage, setAjmanTeamLeaderCommissionPercentage] = useState('');
    const [ajmanTeamLeaderCommission, setAjmanTeamLeaderCommission] = useState(0);
    const [ajmanBranchCommissionPercentage, setAjmanBranchCommissionPercentage] = useState('');
    const [ajmanBranchCommission, setAjmanBranchCommission] = useState(0);

    // Dubai
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
    const navigate = useNavigate()

    // Load initial data when the component mounts
    useEffect(() => {
        // Set the initial values for the form fields
        setFinancialAmount(service_commission_id.finance_amount);
        setBankCommission(service_commission_id.bank_commission);
        setCustomerCommission(service_commission_id.customer_commission);
        setWithVatCommission(service_commission_id.with_vat_commission);
        setWithoutVatCommission(service_commission_id.without_vat_commission);
        setHodCommission(service_commission_id.hodsalecommission)
    }, [contract]);

    // This useEffect will run when the component is mounted or when hodsale changes
    useEffect(() => {
        if (service_commission_id.hodsale && service_commission_id.hodsale._id) {
            const selected = hodOptions.find(hod => hod._id === service_commission_id.hodsale._id);
            setSelectedHOD(selected);
        }
    }, [contract, hodOptions]);

    const HandlerChange = (selectedOption) => {
        setSelectedHOD(selectedOption);
    };

    const handleSubmit = async () => {
        try {
            // Prepare the updated data
            const updatedData = {
                finance_amount: financialAmount,
                bank_commission: bankCommission,
                customer_commission: customerCommission,
                with_vat_commission: withVatCommission,
                without_vat_commission: withoutVatCommission,
                hodsalecommission:hodCommission
            };

            // Send the PUT request with updated data
            const response = await axios.put(`${process.env.REACT_APP_BASE_URL}/api/contracts/update-service-commission/${contract._id}`, updatedData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (response.status === 200) {
                alert('Service commission updated successfully');
            }
        } catch (error) {
            console.error('Error updating service commission:', error);
            alert('Failed to update service commission');
        }
    }

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                // Fetch lead data
                const leadResponse = await axios.get(
                    `${process.env.REACT_APP_BASE_URL}/api/contracts/single-contract/${contract._id}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );
                console.log(leadResponse.data, 'leadResponse')
                const response = await axios.get(
                    `${process.env.REACT_APP_BASE_URL}/api/users/get-users`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                const users = response.data; // Adjust according to your API response structur

                // Filter users based on branch.name or branch being null
                const filteredUsers = users.filter(user =>
                    user.branch?.name === 'Abu Dhabi' || user.branch === null
                );

                if (leadResponse.data) {
                    // Set options based on roles and filtered users
                    const hoddata = filteredUsers.filter(user => user.role === 'HOD')
                    console.log(hoddata, 'hoddatahoddata')
                    setHodOptions(filteredUsers.filter(user => user.role === 'HOD'));
                    setManagerOptions(filteredUsers.filter(user => user.role === 'Manager'));
                    setCoordinatorOptions(filteredUsers.filter(user => user.role === 'Coordinator'));
                    setTeamLeaderOptions(filteredUsers.filter(user => user.role === 'Team Leader'));
                    setTsAgentOptions(filteredUsers.filter(user => user.role === 'Sales'));
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
                    // Set options based on roles and filtered users
                    setManagerDubaiOptions(filteredDubaiUsers.filter(user => user.role === 'Manager'));
                    setCoordinatorAjmanOptions(filteredDubaiUsers.filter(user => user.role === 'Coordinator'));
                    setTeamLeaderAjmanOptions(filteredDubaiUsers.filter(user => user.role === 'Team Leader'));
                    setTsAgentAjmanOptions(filteredDubaiUsers.filter(user => user.role === 'Sales'));
                }

                setLeadData(leadResponse.data);
            } catch (error) {
                console.error('Error fetching users:', error);
            }
        };
        fetchUsers()
    }, [token]);


    useEffect(() => {
        // Calculate revenue based on inputs
        const totalCommission = bankCommission + customerCommission;
        const totalRevenue = totalCommission / 1.05

        // Update revenues
        setRevenueWithVat(totalCommission);
        setRevenueWithoutVat(totalRevenue);
    }, [financialAmount, bankCommission, customerCommission]);

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
    // Tele Sales HOD Commission Handler
    const handleTeleSalesHodCommissionChange = (e) => {
        const percentage = parseFloat(e.target.value);
        setTeleSalesHodCommissionPercentage(percentage);

        // Calculate and update Tele Sales HOD commission based on adjusted revenue after broker commission
        const adjustedRevenue = revenueWithoutVat - brokerCommissionValue;
        const teleSalesHodCommissionValue = calculateCommission(adjustedRevenue, percentage);
        setTeleSalesHodCommission(teleSalesHodCommissionValue);
    };
    // Tele Sales Team Leader Commission Handler
    const handleTeleSalesTeamLeaderCommissionChange = (e) => {
        const percentage = parseFloat(e.target.value);
        setTeleSalesTeamLeaderCommissionPercentage(percentage);

        // Calculate and update Tele Sales Team Leader commission based on adjusted revenue after broker commission
        const adjustedRevenue = revenueWithoutVat - brokerCommissionValue;
        const teleSalesTeamLeaderCommissionValue = calculateCommission(adjustedRevenue, percentage);
        setTeleSalesTeamLeaderCommission(teleSalesTeamLeaderCommissionValue);
    };
    // Tele Sales Agent Commission Handler
    const handleTeleSalesAgentCommissionChange = (e) => {
        const percentage = parseFloat(e.target.value);
        setTeleSalesAgentCommissionPercentage(percentage);

        // Calculate and update Tele Sales Agent commission based on adjusted revenue after broker commission
        const adjustedRevenue = revenueWithoutVat - brokerCommissionValue;
        const teleSalesAgentCommissionValue = calculateCommission(adjustedRevenue, percentage);
        setTeleSalesAgentCommission(teleSalesAgentCommissionValue);
    };

    // Tele Sales AgenT one Commission Handler
    const handleTeleSalesAgentOneCommissionChange = (e) => {
        const percentage = parseFloat(e.target.value);
        setTeleSalesAgentOneCommissionPercentage(percentage);

        // Calculate and update Tele Sales Agent commission based on adjusted revenue after broker commission
        const adjustedRevenue = revenueWithoutVat - brokerCommissionValue;
        const teleSalesAgentOneCommissionValue = calculateCommission(adjustedRevenue, percentage);
        setTeleSalesAgentOneCommission(teleSalesAgentOneCommissionValue);
    };

    // Marketing Manager Commission Handler
    const handleMarketingManagerCommissionChange = (e) => {
        const percentage = parseFloat(e.target.value);
        setMarketingManagerCommissionPercentage(percentage);

        // Calculate and update Marketing Manager commission based on adjusted revenue after broker commission
        const adjustedRevenue = revenueWithoutVat - brokerCommissionValue;
        const marketingManagerCommissionValue = calculateCommission(adjustedRevenue, percentage);
        setMarketingManagerCommission(marketingManagerCommissionValue);
    };

    // Marketing Manager One Commission Handler
    const handleMarketingManagerOneCommissionChange = (e) => {
        const percentage = parseFloat(e.target.value);
        setMarketingManagerOneCommissionPercentage(percentage);

        // Calculate and update Marketing Manager commission based on adjusted revenue after broker commission
        const adjustedRevenue = revenueWithoutVat - brokerCommissionValue;
        const marketingManagerOneCommissionValue = calculateCommission(adjustedRevenue, percentage);
        setMarketingManagerOneCommission(marketingManagerOneCommissionValue);
    };

    // Marketing Agent Commission Handler
    const handleMarketingAgentCommissionChange = (e) => {
        const percentage = parseFloat(e.target.value);
        setMarketingAgentCommissionPercentage(percentage);

        // Calculate and update Marketing Agent commission based on adjusted revenue after broker commission
        const adjustedRevenue = revenueWithoutVat - brokerCommissionValue;
        const marketingAgentCommissionValue = calculateCommission(adjustedRevenue, percentage);
        setMarketingAgentCommission(marketingAgentCommissionValue);
    }

    // Marketing Agent One Commission Handler
    const handleMarketingAgentOneCommissionChange = (e) => {
        const percentage = parseFloat(e.target.value);
        setMarketingAgentOneCommissionPercentage(percentage);

        // Calculate and update Marketing Agent commission based on adjusted revenue after broker commission
        const adjustedRevenue = revenueWithoutVat - brokerCommissionValue;
        const marketingAgentOneCommissionValue = calculateCommission(adjustedRevenue, percentage);
        setMarketingAgentOneCommission(marketingAgentOneCommissionValue);
    }

    // IT Manager Commission Handler
    const handleItManagerCommissionChange = (e) => {
        const percentage = parseFloat(e.target.value);
        setItManagerCommissionPercentage(percentage);

        // Calculate and update Marketing Manager commission based on adjusted revenue after broker commission
        const adjustedRevenue = revenueWithoutVat - brokerCommissionValue;
        const ITManagerCommissionValue = calculateCommission(adjustedRevenue, percentage);
        setItManagerCommission(ITManagerCommissionValue);
    };

    // IT Developer Commission Handler
    const handleItDeveloperCommissionChange = (e) => {
        const percentage = parseFloat(e.target.value);
        setDeveloperCommissionPercentage(percentage);

        // Calculate and update Marketing Manager commission based on adjusted revenue after broker commission
        const adjustedRevenue = revenueWithoutVat - brokerCommissionValue;
        const ITDeveloperCommissionValue = calculateCommission(adjustedRevenue, percentage);
        setDeveloperCommission(ITDeveloperCommissionValue);
    };

    // IT Developer One Commission Handler
    const handleDeveloperOneCommissionChange = (e) => {
        const percentage = parseFloat(e.target.value);
        setDeveloperOneCommissionPercentage(percentage);

        // Calculate and update Marketing Manager commission based on adjusted revenue after broker commission
        const adjustedRevenue = revenueWithoutVat - brokerCommissionValue;
        const ITDeveloperOneCommissionValue = calculateCommission(adjustedRevenue, percentage);
        setDeveloperOneCommission(ITDeveloperOneCommissionValue);
    };

    // IT Developer Two Commission Handler
    const handleDeveloperTwoCommissionChange = (e) => {
        const percentage = parseFloat(e.target.value);
        setDeveloperTwoCommissionPercentage(percentage);

        // Calculate and update Marketing Manager commission based on adjusted revenue after broker commission
        const adjustedRevenue = revenueWithoutVat - brokerCommissionValue;
        const ITDeveloperOneCommissionValue = calculateCommission(adjustedRevenue, percentage);
        setDeveloperTwoCommission(ITDeveloperOneCommissionValue);
    };

    // Sales Manager Ref Commission Transfer Handler
    const handleSalesManagerRefCommissionTransferChange = (e) => {
        const percentage = parseFloat(e.target.value);
        setSalesManagerRefCommissionTransferPercentage(percentage);

        // Calculate and update Sales Manager Ref commission based on adjusted revenue
        const adjustedRevenue = revenueWithoutVat - brokerCommissionValue; // Adjusted revenue after broker commission
        const commissionValue = calculateCommission(adjustedRevenue, percentage); // Sales Manager Ref commission calculation
        setSalesManagerRefCommissionTransfer(commissionValue);
    };
    // Agent Ref Commission Handler
    const handleAgentRefCommissionTransferChange = (e) => {
        const percentage = parseFloat(e.target.value);
        setAgentRefCommissionPercentage(percentage);

        // Calculate and update Agent Ref commission based on adjusted revenue
        const adjustedRevenue = revenueWithoutVat - brokerCommissionValue; // Adjusted revenue after broker commission
        const commissionValue = calculateCommission(adjustedRevenue, percentage); // Calculate commission
        setAgentRefCommission(commissionValue);
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
    // const HandlerChange = (selectedOption) => {
    //     if (selectedOption) {
    //         setSelectedHod(selectedOption);
    //     }
    // };
    // onChange Function for Manager
    const handleManagerChange = (selectedManagerOption) => {
        if (selectedManagerOption) {
            setSelectedManager(selectedManagerOption)
        }
    }
    // onChange Function for Coordinator
    const handleCoordinatorChange = (selectedCoordinatorOption) => {
        if (selectedCoordinatorOption) {
            setSelectedCoordinator(selectedCoordinatorOption)
        }
    }
    // onChange Function for Coordinator dubai
    const handleDubaiCoordinatorChange = (selectedCoordinatorDubaiOption) => {
        if (selectedCoordinatorDubaiOption) {
            setSelectedDubaiCoordinator(selectedCoordinatorDubaiOption)
        }
    }
    const handleAjmanCoordinatorChange = (selectedAjmanCoordinatorOption) => {
        if (selectedAjmanCoordinatorOption) {
            setSelectedAjmanCoordinator(selectedAjmanCoordinatorOption)
        }
    }
    // onChange Function for Team Leader
    const handleTeamLeaderChange = (selectedTeamLeaderOption) => {
        if (selectedTeamLeaderOption) {
            setSelectedTeamLeader(selectedTeamLeaderOption)
        }
    }

    // OnChangeFunction For Ajman
    const handleAjmanTeamLeaderChange = (selectedAjmanTeamLOption) => {
        if (selectedAjmanTeamLOption) {
            setSelectedAjmanTeamLeader(selectedAjmanTeamLOption)
        }
    }
    // onChange Function for Sales Agent
    const handleSaleAgentChange = (selectedSalesAgentOption) => {
        if (selectedSalesAgentOption) {
            setSelectedSalesAgent(selectedSalesAgentOption)
        }
    }
    // onChange Function for Team  Sales Agent One
    const handleSaleAgentOneChange = (selectedSalesAgentOneOption) => {
        if (selectedSalesAgentOneOption) {
            setSelectedSalesAgentOne(selectedSalesAgentOneOption)
        }
    }

    // onChange Function for Team  Sales Agent One
    const handleSaleAgentTwoChange = (selectedSalesAgentTwoOption) => {
        if (selectedSalesAgentTwoOption) {
            setSelectedSalesAgentTwo(selectedSalesAgentTwoOption)
        }
    }

    const handleAjmanSaleAgentChange = (selectedSalesAgentAjmanOptions) => {
        if (selectedSalesAgentAjmanOptions) {
            setSelectedSalesAgentAjman(selectedSalesAgentAjmanOptions)
        }
    }
    // onChange Function for Marketing Manager
    const handleMarketingManagerChange = (selectedMarketingManagerOption) => {
        if (selectedMarketingManagerOption) {
            setSelectedMarketingManager(selectedMarketingManagerOption)
        }
    }

    // onChange Function for Marketing Manager One
    const handleMarketingManagerOneChange = (selectedMarketingManagerOneOption) => {
        if (selectedMarketingManagerOneOption) {
            setSelectedMarketingManagerOne(selectedMarketingManagerOneOption)
        }
    }
    // onChange Function for Marketing Agent
    const handleMarketingAgentChange = (selectedMarketingAgentOption) => {
        if (selectedMarketingAgentOption) {
            setSelectedMarketingAgent(selectedMarketingAgentOption)
        }
    }

    // onChange Function for Marketing Agent One
    const handleMarketingAgentOneChange = (selectedMarketingAgentOneOption) => {
        if (selectedMarketingAgentOneOption) {
            setSelectedMarketingOneAgent(selectedMarketingAgentOneOption)
        }
    }

    // IT Team
    // onChange Function for IT Manager
    const handleITManagerChange = (selectedItManagerOption) => {
        if (selectedItManagerOption) {
            setSelectedItManager(selectedItManagerOption)
        }
    }

    // onChange Function for IT Developer
    const handleItDeveloperChange = (selectedITDeveloperOption) => {
        if (selectedITDeveloperOption) {
            setDeveloper(selectedITDeveloperOption)
        }
    }

    // onChange Function for IT Developer One
    const handleDeveloperOneChange = (selectedITDeveloperOneOption) => {
        if (selectedITDeveloperOneOption) {
            setDeveloperOne(selectedITDeveloperOneOption)
        }
    }

    // onChange Function for IT Developer Two
    const handleDeveloperTwoChange = (selectedITDevelopertwoOption) => {
        if (selectedITDevelopertwoOption) {
            setDeveloperTwo(selectedITDevelopertwoOption)
        }
    }

    // onChange Function for Tele sales Agent
    const handleTelesalesHodChange = (selectedTelesalesOption) => {
        if (selectedTelesalesOption) {
            setSelectedTeleSalesMaangers(selectedTelesalesOption)
        }
    }
    // onChange Function for Tele salesTeam Leader
    const handleTelesalesTeamLeaderChange = (selectedTelesalesTeamLeaderOption) => {
        if (selectedTelesalesTeamLeaderOption) {
            setSelectedTeleSalesTeamLeader(selectedTelesalesTeamLeaderOption)
        }
    }
    // onChange Function for Tele sales Agent
    const handleTelesalesAgentChange = (selectedTelesalesAgentOption) => {
        if (selectedTelesalesAgentOption) {
            setSelectedTeleSalesAgent(selectedTelesalesAgentOption)
        }
    }

    // onChange Function for Tele sales Agent One
    const handleTelesalesAgentOneChange = (selectedTelesalesAgentOneOption) => {
        if (selectedTelesalesAgentOneOption) {
            setSelectedTeleSalesAgentOne(selectedTelesalesAgentOneOption)
        }
    }
    // OnChange Function for Ajman Branch
    const handleAjmanManagerChange = (selectedAjmanManagerOptions) => {
        if (selectedAjmanManagerOptions) {
            setSelectedAjmanManager(selectedAjmanManagerOptions)
        }
    }

    // OnChange Function for Dubai Branch
    const handleDubaiManagerChange = (selectedDubaiManagerOptions) => {
        if (selectedDubaiManagerOptions) {
            setSelectedDubaiManager(selectedDubaiManagerOptions)
        }
    }

    const handleDubaiTeamLeaderChange = (selectedDubaiTeamLeaderOptions) => {
        if (selectedDubaiTeamLeaderOptions) {
            setSelectedDubaiTeamLeader(selectedDubaiTeamLeaderOptions)
        }
    }

    const handleDubaiSaleAgentChange = (selectedDubaiSalesOptions) => {
        if (selectedDubaiSalesOptions) {
            setSelectedDubaiSales(selectedDubaiSalesOptions)
        }
    }
    // Post API For Lead Convert to Contract
    const LeadConvertHandler = async () => {
        try {
            const response = await axios.post(`${process.env.REACT_APP_BASE_URL}/update-service-commission/${contract._id}`, {
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
                broker_name: brokerName,
                broker_name_commission: brokerCommissionValue,
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            console.log(response.data.contract._id, 'allresponses')
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

    const handleTeamLeaderTwoChange = (selectedOption) => {
        setTeamLeaderTwo(selectedOption);
        // Additional logic can be added here if needed
    };

    const handleTeamLeaderTwoCommissionPercentageChange = (e) => {
        const percentage = parseFloat(e.target.value);
        setTeamLeaderTwoCommissionPercentage(percentage);

        if (isNaN(percentage) || percentage === '') {
            // Clear the value field when percentage is invalid
            setTeamLeaderTwoCommission(0);
            return;
        }

        const adjustedRevenue = revenueWithoutVat - brokerCommissionValue;
        if (adjustedRevenue > 0) {
            const commissionValue = calculateCommission(adjustedRevenue, percentage);
            setTeamLeaderTwoCommission(Math.round(commissionValue));
        }
    };

    const handleTeamLeaderTwoCommissionValueChange = (e) => {
        const value = parseFloat(e.target.value);
        setTeamLeaderTwoCommission(value);

        if (!isNaN(value) && revenueWithoutVat - brokerCommissionValue > 0) {
            const adjustedRevenue = revenueWithoutVat - brokerCommissionValue;
            const percentage = (value / adjustedRevenue) * 100;
            setTeamLeaderTwoCommissionPercentage(Math.round(percentage));
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

    const handleAgentTwoCommissionPercentageChange = (e) => {
        const percentage = parseFloat(e.target.value);
        setAgentTwoCommissionPercentage(percentage);

        if (isNaN(percentage) || percentage === '') {
            // Reset commission value if input is invalid
            setAgentTwoCommission(0);
            return;
        }

        const adjustedRevenue = revenueWithoutVat - brokerCommissionValue;
        if (adjustedRevenue > 0) {
            const commissionValue = calculateCommission(adjustedRevenue, percentage);
            setAgentTwoCommission(Math.round(commissionValue));
        }
    };

    const handleAgentTwoCommissionValueChange = (e) => {
        const value = parseFloat(e.target.value);
        setAgentTwoCommission(value);

        if (!isNaN(value) && revenueWithoutVat - brokerCommissionValue > 0) {
            const adjustedRevenue = revenueWithoutVat - brokerCommissionValue;
            const percentage = (value / adjustedRevenue) * 100;
            setAgentTwoCommissionPercentage(Math.round(percentage));
        }
    };
    const handleManagerTwoChange = (selectedOption) => {
        // Handle Manager (2) selection logic
        setSelectedManagerTwo(selectedOption); // Example state variable for selected manager
    };

    const handleSalesManagerTwoCommissionPercentageChange = (e) => {
        const percentage = parseFloat(e.target.value);
        setSalesManagerTwoCommissionPercentage(percentage);

        if (isNaN(percentage) || percentage === '') {
            setSalesManagerTwoCommission(0);
            return;
        }

        // Calculate commission based on percentage
        const adjustedRevenue = revenueWithoutVat - brokerCommissionValue;
        if (adjustedRevenue > 0) {
            const commissionValue = calculateCommission(adjustedRevenue, percentage);
            setSalesManagerTwoCommission(Math.round(commissionValue));
        }
    };

    const handleSalesManagerTwoCommissionValueChange = (e) => {
        const value = parseFloat(e.target.value);
        setSalesManagerTwoCommission(value);

        if (!isNaN(value) && revenueWithoutVat - brokerCommissionValue > 0) {
            const adjustedRevenue = revenueWithoutVat - brokerCommissionValue;
            const percentage = (value / adjustedRevenue) * 100;
            setSalesManagerTwoCommissionPercentage(Math.round(percentage));
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

    return (
        <div>
            <Modal
                size="xl"
                aria-labelledby="contained-modal-title-vcenter"
                centered
                show={editModal}
                onHide={() => setEditModal(false)}
            >
                <Modal.Header closeButton style={{ border: 'none' }}>
                    <Modal.Title className='text-center mutual_class_color'>
                        {rtl === 'true'
                            ? `نموذج طلب الخدمة (${singleLead ? singleLead.products?.name : leads?.[0]?.products?.name})`
                            : `Service Application Form`}
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
                                            className="convert_to_lead_input_field input_field_input_field"
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
                                            className="convert_to_lead_input_field input_field_input_field"
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
                                            className="convert_to_lead_input_field input_field_input_field"
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
                                            className="convert_to_lead_input_field input_field_input_field"
                                            value={Math.max(0, Math.round(withVatCommission))} // Ensures no negative values
                                            readOnly
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
                                            type="text"
                                            className="convert_to_lead_input_field input_field_input_field"
                                            value={Math.max(0, Math.round(withoutVatCommission))} // Ensures no negative values
                                            readOnly
                                            disabled
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>
                        </Card>

                        {/* Third Card */}
                        {leadData.lead_type?.name === 'Others' && leadData.source?.name === 'Third Party' && (
                            <Card className='convertToLead_card mt-2 modal_body_bg_color' style={{ border: '#d7aa47' }}>
                                <h5 className='heading_tag'>3rd Party</h5>
                                <Row>
                                    <Col xs={12} md={6}>
                                        <Form.Group className="mb-3" controlId="formBrokerName">
                                            <Form.Control
                                                type="text"
                                                name="brokerName"
                                                value={brokerName}
                                                onChange={(e) => setBrokerName(e.target.value)}
                                                className='convert_to_lead_input_field input_field_input_field'
                                                placeholder="3rd Party Broker Name"
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col xs={12} md={3}>
                                        <Form.Group className="mb-3" controlId="formBrokerCommission">
                                            <Form.Control
                                                type="number"
                                                className="convert_to_lead_input_field input_field_input_field"
                                                placeholder="3rd Party Broker Commission (%)"
                                                value={brokerCommission}
                                                onChange={handleBrokerCommissionChange}
                                                min="0"
                                            />
                                        </Form.Group>
                                    </Col>

                                    <Col xs={12} md={2}>
                                        <Form.Group className="mb-3" controlId="formHodCommission">
                                            <Form.Control
                                                type="number"
                                                className="convert_to_lead_input_field input_field_input_field"
                                                placeholder="(%)"
                                                value={Math.max(0, Math.floor(brokerCommissionValue))}
                                                disabled
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>
                            </Card>
                        )}
                        {/* Second Card */}
                        <Card className='convertToLead_card mt-2 modal_body_bg_color' style={{ border: '#d7aa47' }} >
                            <h5
                                className={`heading_tag mutual_class_color ${rtl === 'true' ? 'text-right' : 'text-left'}`}
                            >
                                {rtl === 'true' ? 'أبوظبي (المقر الرئيسي)' : 'Abu Dhabi (Head Office)'}
                            </h5>
                            <Row>
                                {hodOptions.length > 0 && (
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
                                                    value={selectedHOD} // Set the selected value
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
                                                />
                                            </Form.Group>
                                        </Col>
                                    </>
                                )}

                                {/* Manager One */}
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
                                        />
                                    </Form.Group>
                                </Col>

                                {/* Manager Two */}
                                {/* <Col xs={12} md={3}>
                                    <Form.Group className="mb-3" controlId="formBasicManager">
                                        <Select
                                            className="custom-select mutual_heading_class input_field_input_field"
                                            classNamePrefix="react-select"
                                            options={managerOptions.map(manager => ({
                                                label: manager.name, // Display the name in options
                                                value: manager._id   // Use the _id as the value
                                            }))}
                                            placeholder="Manager (2)"
                                            isClearable
                                            onChange={handleManagerTwoChange} // Updated function name for clarity
                                        />
                                    </Form.Group>
                                </Col> */}

                                {/* <Col xs={12} md={1}>
                                    <Form.Group className="mb-3" controlId="formSalesManagerCommissionPercentage">
                                        <Form.Control
                                            type="text"
                                            className="convert_to_lead_input_field mutual_heading_class input_field_input_field"
                                            placeholder="(%)"
                                            value={salesManagerTwoCommissionPercentage || ''}
                                            onChange={handleSalesManagerTwoCommissionPercentageChange} // Updated function name
                                        />
                                    </Form.Group>
                                </Col>

                                <Col xs={12} md={2}>
                                    <Form.Group className="mb-3" controlId="formSalesManagerCommissionValue">
                                        <Form.Control
                                            type="text"
                                            className="convert_to_lead_input_field mutual_heading_class input_field_input_field"
                                            placeholder="Commission Value"
                                            value={salesManagerTwoCommission || ''}
                                            onChange={handleSalesManagerTwoCommissionValueChange} // Updated function name
                                        />
                                    </Form.Group>
                                </Col> */}

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
                                        />
                                    </Form.Group>
                                </Col>

                                {/* Team Leader One */}

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
                                        />
                                    </Form.Group>
                                </Col>

                                {/* Team Leader Two */}
                                {/* <Col xs={12} md={3}>
                                    <Form.Group className="mb-3" controlId="formBasicTeamLeaderTwo">
                                        <Select
                                            className="custom-select mutual_heading_class input_field_input_field"
                                            classNamePrefix="react-select"
                                            options={teamLeaderOptions.map(teamleader => ({
                                                label: teamleader.name, // Display the name in options
                                                value: teamleader._id   // Use the _id as the value
                                            }))} // Use the teamLeaderOptions array here
                                            placeholder="Team Leader (2) "
                                            isClearable
                                            onChange={handleTeamLeaderTwoChange}
                                        />
                                    </Form.Group>
                                </Col>

                                <Col xs={12} md={1}>
                                    <Form.Group className="mb-3" controlId="formTeamLeaderTwoCommissionPercentage">
                                        <Form.Control
                                            type="text"
                                            className="convert_to_lead_input_field input_field_input_field"
                                            placeholder="(%)"
                                            onChange={handleTeamLeaderTwoCommissionPercentageChange}
                                            value={teamLeaderTwoCommissionPercentage || ''}
                                        />
                                    </Form.Group>
                                </Col>

                                <Col xs={12} md={2}>
                                    <Form.Group className="mb-3" controlId="formTeamLeaderTwoCommissionValue">
                                        <Form.Control
                                            type="text"
                                            className="convert_to_lead_input_field input_field_input_field"
                                            placeholder="Commission Value"
                                            value={teamLeaderTwoCommission || ''}
                                            onChange={handleTeamLeaderTwoCommissionValueChange}
                                        />
                                    </Form.Group>
                                </Col> */}

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
                                        />
                                    </Form.Group>
                                </Col>

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
                                        />
                                    </Form.Group>
                                </Col>

                                {/* <Col xs={12} md={3}>
                                    <Form.Group className="mb-3" controlId="formBasicTsAgentTwo">
                                        <Select
                                            className="custom-select mutual_heading_class input_field_input_field"
                                            classNamePrefix="react-select"
                                            options={tsAgentOptions.map(tsagent => ({
                                                label: tsagent.name, // Display the name in options
                                                value: tsagent._id   // Use the _id as the value
                                            }))} // Use the teamLeaderOptions array here
                                            placeholder="Sales Agent (3)"
                                            isClearable
                                            onChange={handleSaleAgentTwoChange}
                                        />
                                    </Form.Group>
                                </Col>

                                <Col xs={12} md={1}>
                                    <Form.Group className="mb-3" controlId="formAgentTwoCommissionPercentage">
                                        <Form.Control
                                            type="text"
                                            className="convert_to_lead_input_field input_field_input_field"
                                            placeholder="(%)"
                                            onChange={handleAgentTwoCommissionPercentageChange}
                                            value={agentTwoCommissionPercentage || ''}
                                        />
                                    </Form.Group>
                                </Col>

                                <Col xs={12} md={2}>
                                    <Form.Group className="mb-3" controlId="formAgentTwoCommissionValue">
                                        <Form.Control
                                            type="text"
                                            className="convert_to_lead_input_field input_field_input_field"
                                            placeholder="Commission Value"
                                            value={agentTwoCommission || ''}
                                            onChange={handleAgentTwoCommissionValueChange}
                                        />
                                    </Form.Group>
                                </Col> */}


                            </Row>

                            {/* Ajman Branch */}
                            {
                                leadData?.selected_users?.some(user => user?.branch?.name === 'Ajman') && (
                                    <>
                                        <Card className='convertToLead_card input_field_input_field'>
                                            <h5 className='heading_tag mutual_class_color'>Ajman Branch</h5>
                                            <Row>
                                                {/* Manager */}
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
                                                        />
                                                    </Form.Group>
                                                </Col>

                                                {/* Coordinator */}
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
                                                        />
                                                    </Form.Group>
                                                </Col>


                                                {/* Team Leader */}
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
                                                        />
                                                    </Form.Group>
                                                </Col>


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
                                        <Card className='convertToLead_card input_field_input_field'>
                                            <h5 className='heading_tag mutual_class_color'>Dubai Branch</h5>
                                            <Row>
                                                {/* Manager */}
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
                                                        />
                                                    </Form.Group>
                                                </Col>


                                                {/* Coordinator */}
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
                                                        />
                                                    </Form.Group>
                                                </Col>

                                                {/* Team Leader */}
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
                                                        />
                                                    </Form.Group>
                                                </Col>


                                                {/* Sales */}
                                                <Col xs={12} md={3}>
                                                    <Form.Group className="mb-3" controlId="formBasicTsAgent">
                                                        <Select
                                                            className="custom-select mutual_heading_class input_field_input_field"
                                                            classNamePrefix="react-select"
                                                            options={tsAgentOptions.map(tsagent => ({
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
                                                        <Form.Control
                                                            type="text"
                                                            className='convert_to_lead_input_field input_field_input_field'
                                                            placeholder='Sales Manager Ref (Transfer)'
                                                        />
                                                    </Form.Group>
                                                </Col>
                                                {/* Sales Manager Commission Transfer Input */}
                                                <Col xs={12} md={1}>
                                                    <Form.Group className="mb-3" controlId="formDubaiBranchSalesManagerCommissionTransfer">
                                                        <Form.Control
                                                            type="number"
                                                            className="convert_to_lead_input_field input_field_input_field"
                                                            placeholder="(%)"
                                                            onChange={handleDubaiBranchSalesManagerCommissionTransferChange}
                                                            value={dubaiBranchSalesManagerCommissionTransfer || ''}
                                                        />
                                                    </Form.Group>
                                                </Col>

                                                {/* Sales Manager Commission Value Display */}
                                                <Col xs={12} md={2}>
                                                    <Form.Group className="mb-3" controlId="formDubaiBranchCoordinatorCommission">
                                                        <Form.Control
                                                            type="number"
                                                            className="convert_to_lead_input_field input_field_input_field"
                                                            placeholder="Commission Value"
                                                            value={Math.max(0, Math.floor(dubaiBranchSalesManagerCommissionValue))}
                                                        // disabled
                                                        />
                                                    </Form.Group>
                                                </Col>


                                                <Col xs={12} md={3}>
                                                    <Form.Group className="mb-3" controlId="formAgentRefTransfer">
                                                        <Form.Control
                                                            type="text"
                                                            className='convert_to_lead_input_field input_field_input_field'
                                                            placeholder='Agent Ref (Transfer)'
                                                        />
                                                    </Form.Group>
                                                </Col>

                                                <Col xs={12} md={1}>
                                                    <Form.Group className="mb-3" controlId="formAgentCommissionTransfer">
                                                        <Form.Control
                                                            type="number"
                                                            className='convert_to_lead_input_field input_field_input_field'
                                                            placeholder='(%)'
                                                            onChange={handleAgentRefCommissionTransferChange} // Add the handler here
                                                        />

                                                    </Form.Group>
                                                </Col>

                                                <Col xs={12} md={2}>
                                                    <Form.Group className="mb-3" controlId="formCoordinatorCommission">
                                                        <Form.Control
                                                            type="number"
                                                            className='convert_to_lead_input_field input_field_input_field'
                                                            placeholder='(%)'
                                                            value={Math.max(0, Math.floor(agentRefCommission))}
                                                            disabled
                                                        />
                                                    </Form.Group>
                                                </Col>
                                            </Row>
                                        </Card>
                                    </>
                                }
                            </div>

                            {/* Lead Cards */}
                            <Card className='convertToLead_card mt-2 input_field_input_field'>
                                {leadData && leadData.lead_type && (
                                    <>
                                        <h5 className='heading_tag mutual_class_color'>
                                            {leadData.lead_type.name === "Others" ? leadData.lead_type.name : `${leadData.lead_type.name} Team`}
                                        </h5>
                                        <Row>
                                            {leadData.lead_type?.name === 'Marketing' && (
                                                <>
                                                    <Col xs={12} md={3}>
                                                        <Form.Group className="mb-3" controlId="formTeleSalesHOD">
                                                            <Select
                                                                className="custom-select input_field_input_field "
                                                                classNamePrefix="react-select"
                                                                placeholder="Team Leader"
                                                                options={marketingOptions}
                                                                getOptionLabel={option => option.label}
                                                                onChange={handleMarketingManagerChange}
                                                            />
                                                        </Form.Group>
                                                    </Col>
                                                    <Col xs={12} md={1}>
                                                        <Form.Group className="mb-3" controlId="formMarketingManagerCommission">
                                                            <Form.Control
                                                                type="number"
                                                                className='convert_to_lead_input_field input_field_input_field'
                                                                placeholder='(%)'
                                                                onChange={handleMarketingManagerCommissionChange} // Add the handler here
                                                            />
                                                        </Form.Group>
                                                    </Col>
                                                    <Col xs={12} md={2}>
                                                        <Form.Group className="mb-3" controlId="formCoordinatorCommission">
                                                            <Form.Control
                                                                type="number"
                                                                className='convert_to_lead_input_field input_field_input_field'
                                                                placeholder='(%)'
                                                                value={Math.max(0, Math.floor(marketingManagerCommission))}
                                                                disabled
                                                            />
                                                        </Form.Group>
                                                    </Col>
                                                    <Col xs={12} md={3}>
                                                        <Form.Group className="mb-3" controlId="formTeleSalesHOD">
                                                            <Select
                                                                className="custom-select input_field_input_field"
                                                                classNamePrefix="react-select"
                                                                placeholder="Marketing Agent (1) "
                                                                options={marketingOptions}
                                                                getOptionLabel={option => option.label}
                                                                onChange={handleMarketingAgentChange}
                                                            />
                                                        </Form.Group>
                                                    </Col>
                                                    <Col xs={12} md={1}>
                                                        <Form.Group className="mb-3" controlId="formMarketingAgentCommission">
                                                            <Form.Control
                                                                type="number"
                                                                className='convert_to_lead_input_field input_field_input_field'
                                                                placeholder='(%)'
                                                                onChange={handleMarketingAgentCommissionChange} // Add the handler here
                                                            />

                                                        </Form.Group>
                                                    </Col>
                                                    <Col xs={12} md={2}>
                                                        <Form.Group className="mb-3" controlId="formCoordinatorCommission">
                                                            <Form.Control
                                                                type="number"
                                                                className='convert_to_lead_input_field input_field_input_field'
                                                                placeholder='(%)'
                                                                value={Math.max(0, Math.floor(marketingAgentCommission))}
                                                                disabled
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
                                                                options={marketingOptions}
                                                                getOptionLabel={option => option.label}
                                                                onChange={handleMarketingManagerOneChange}
                                                            />
                                                        </Form.Group>
                                                    </Col>
                                                    <Col xs={12} md={1}>
                                                        <Form.Group className="mb-3" controlId="formMarketingManagerCommission">
                                                            <Form.Control
                                                                type="number"
                                                                className='convert_to_lead_input_field input_field_input_field'
                                                                placeholder='(%)'
                                                                onChange={handleMarketingManagerOneCommissionChange} // Add the handler here
                                                            />

                                                        </Form.Group>
                                                    </Col>
                                                    <Col xs={12} md={2}>
                                                        <Form.Group className="mb-3" controlId="formCoordinatorCommission">
                                                            <Form.Control
                                                                type="number"
                                                                className='convert_to_lead_input_field input_field_input_field'
                                                                placeholder='(%)'
                                                                value={Math.max(0, Math.floor(marketingManagerOneCommission))}
                                                                disabled
                                                            />
                                                        </Form.Group>
                                                    </Col>
                                                    <Col xs={12} md={3}>
                                                        <Form.Group className="mb-3" controlId="formTeleSalesHOD">
                                                            <Select
                                                                className="custom-select input_field_input_field"
                                                                classNamePrefix="react-select"
                                                                placeholder="Marketing Agent (3)"
                                                                options={marketingOptions}
                                                                getOptionLabel={option => option.label}
                                                                onChange={handleMarketingAgentOneChange}
                                                            />
                                                        </Form.Group>
                                                    </Col>
                                                    <Col xs={12} md={1}>
                                                        <Form.Group className="mb-3" controlId="formMarketingAgentCommission">
                                                            <Form.Control
                                                                type="number"
                                                                className='convert_to_lead_input_field input_field_input_field'
                                                                placeholder='(%)'
                                                                onChange={handleMarketingAgentOneCommissionChange} // Add the handler here
                                                            />

                                                        </Form.Group>
                                                    </Col>
                                                    <Col xs={12} md={2}>
                                                        <Form.Group className="mb-3" controlId="formCoordinatorCommission">
                                                            <Form.Control
                                                                type="number"
                                                                className='convert_to_lead_input_field input_field_input_field'
                                                                placeholder='(%)'
                                                                value={Math.max(0, Math.floor(marketingAgentOneCommission))}
                                                                disabled
                                                            />
                                                        </Form.Group>
                                                    </Col>
                                                    <h5 className='heading_tag mutual_class_color'>Software Team</h5>
                                                    <Col xs={12} md={3}>
                                                        <Form.Group className="mb-3" controlId="formTeleSalesHOD">
                                                            <Select
                                                                className="custom-select input_field_input_field"
                                                                classNamePrefix="react-select"
                                                                placeholder="IT Manager"
                                                                options={developerOptions}
                                                                getOptionLabel={option => option.label}
                                                                onChange={handleITManagerChange}
                                                            />
                                                        </Form.Group>
                                                    </Col>

                                                    <Col xs={12} md={1}>
                                                        <Form.Group className="mb-3" controlId="formMarketingManagerCommission">
                                                            <Form.Control
                                                                type="number"
                                                                className='convert_to_lead_input_field input_field_input_field'
                                                                placeholder='(%)'
                                                                onChange={handleItManagerCommissionChange} // Add the handler here
                                                            />

                                                        </Form.Group>
                                                    </Col>
                                                    <Col xs={12} md={2}>
                                                        <Form.Group className="mb-3" controlId="formCoordinatorCommission">
                                                            <Form.Control
                                                                type="number"
                                                                className='convert_to_lead_input_field input_field_input_field'
                                                                placeholder='(%)'
                                                                value={Math.max(0, Math.floor(ItManagerCommission))}
                                                                disabled
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
                                                                options={developerOptions}
                                                                getOptionLabel={option => option.label}
                                                                onChange={handleItDeveloperChange}
                                                            />
                                                        </Form.Group>
                                                    </Col>
                                                    <Col xs={12} md={1}>
                                                        <Form.Group className="mb-3" controlId="formMarketingAgentCommission">
                                                            <Form.Control
                                                                type="number"
                                                                className='convert_to_lead_input_field input_field_input_field'
                                                                placeholder='(%)'
                                                                onChange={handleItDeveloperCommissionChange} // Add the handler here
                                                            />
                                                        </Form.Group>
                                                    </Col>
                                                    <Col xs={12} md={2}>
                                                        <Form.Group className="mb-3" controlId="formCoordinatorCommission">
                                                            <Form.Control
                                                                type="number"
                                                                className='convert_to_lead_input_field input_field_input_field'
                                                                placeholder='(%)'
                                                                value={Math.max(0, Math.floor(developerCommission))}
                                                                disabled
                                                            />
                                                        </Form.Group>
                                                    </Col>


                                                    <Col xs={12} md={3}>
                                                        <Form.Group className="mb-3" controlId="formTeleSalesHOD">
                                                            <Select
                                                                className="custom-select input_field_input_field"
                                                                classNamePrefix="react-select"
                                                                placeholder="Developer One"
                                                                options={developerOptions}
                                                                getOptionLabel={option => option.label}
                                                                onChange={handleDeveloperOneChange}
                                                            />
                                                        </Form.Group>
                                                    </Col>
                                                    <Col xs={12} md={1}>
                                                        <Form.Group className="mb-3" controlId="formMarketingManagerCommission">
                                                            <Form.Control
                                                                type="number"
                                                                className='convert_to_lead_input_field input_field_input_field'
                                                                placeholder='(%)'
                                                                onChange={handleDeveloperOneCommissionChange} // Add the handler here
                                                            />
                                                        </Form.Group>
                                                    </Col>
                                                    <Col xs={12} md={2}>
                                                        <Form.Group className="mb-3" controlId="formCoordinatorCommission">
                                                            <Form.Control
                                                                type="number"
                                                                className='convert_to_lead_input_field input_field_input_field'
                                                                placeholder='(%)'
                                                                value={Math.max(0, Math.floor(developerOneCommission))}
                                                                disabled
                                                            />
                                                        </Form.Group>
                                                    </Col>
                                                    <Col xs={12} md={3}>
                                                        <Form.Group className="mb-3" controlId="formTeleSalesHOD">
                                                            <Select
                                                                className="custom-select input_field_input_field"
                                                                classNamePrefix="react-select"
                                                                placeholder="Developer Two"
                                                                options={developerOptions}
                                                                getOptionLabel={option => option.label}
                                                                onChange={handleDeveloperTwoChange}
                                                            />
                                                        </Form.Group>
                                                    </Col>
                                                    <Col xs={12} md={1}>
                                                        <Form.Group className="mb-3" controlId="formMarketingAgentCommission">
                                                            <Form.Control
                                                                type="number"
                                                                className='convert_to_lead_input_field input_field_input_field'
                                                                placeholder='(%)'
                                                                onChange={handleDeveloperTwoCommissionChange} // Add the handler here
                                                            />
                                                        </Form.Group>
                                                    </Col>
                                                    <Col xs={12} md={2}>
                                                        <Form.Group className="mb-3" controlId="formCoordinatorCommission">
                                                            <Form.Control
                                                                type="number"
                                                                className='convert_to_lead_input_field input_field_input_field'
                                                                placeholder='(%)'
                                                                value={Math.max(0, Math.floor(developerTwoCommission))}
                                                                disabled
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
                                                                placeholder="HOD"
                                                                options={userOptions}
                                                                getOptionLabel={option => option.label}
                                                                getOptionValue={option => option.value}
                                                                onChange={handleTelesalesHodChange}
                                                            />
                                                        </Form.Group>
                                                    </Col>
                                                    <Col xs={12} md={1}>
                                                        <Form.Group className="mb-3" controlId="formTeleSalesHODCommission">
                                                            <Form.Control
                                                                type="number"
                                                                className='convert_to_lead_input_field input_field_input_field'
                                                                placeholder='(%)'
                                                                onChange={handleTeleSalesHodCommissionChange} // Add the handler here
                                                            />
                                                        </Form.Group>
                                                    </Col>
                                                    <Col xs={12} md={2}>
                                                        <Form.Group className="mb-3" controlId="formCoordinatorCommission">
                                                            <Form.Control
                                                                type="number"
                                                                className='convert_to_lead_input_field input_field_input_field'
                                                                placeholder='(%)'
                                                                value={Math.max(0, Math.floor(teleSalesHodCommission))}
                                                                disabled
                                                            />
                                                        </Form.Group>
                                                    </Col>


                                                    <Col xs={12} md={3}>
                                                        <Form.Group className="mb-3" controlId="formTeleSalesHOD">
                                                            <Select
                                                                className="custom-select input_field_input_field"
                                                                classNamePrefix="react-select"
                                                                placeholder="Team Leader"
                                                                options={userOptions}
                                                                getOptionLabel={option => option.label}
                                                                getOptionValue={option => option.value}
                                                                onChange={handleTelesalesTeamLeaderChange}
                                                            />
                                                        </Form.Group>
                                                    </Col>
                                                    <Col xs={12} md={1}>
                                                        <Form.Group className="mb-3" controlId="formTeleSalesTeamLeaderCommission">
                                                            <Form.Control
                                                                type="number"
                                                                className='convert_to_lead_input_field input_field_input_field'
                                                                placeholder='Tele Sales Team Leader commission (%)'
                                                                onChange={handleTeleSalesTeamLeaderCommissionChange} // Add the handler here
                                                            />
                                                        </Form.Group>
                                                    </Col>
                                                    <Col xs={12} md={2}>
                                                        <Form.Group className="mb-3" controlId="formCoordinatorCommission">
                                                            <Form.Control
                                                                type="number"
                                                                className='convert_to_lead_input_field input_field_input_field'
                                                                placeholder='(%)'
                                                                value={Math.max(0, Math.floor(teleSalesTeamLeaderCommission))}
                                                                disabled
                                                            />
                                                        </Form.Group>
                                                    </Col>
                                                    <Col xs={12} md={3}>
                                                        <Form.Group className="mb-3" controlId="formTeleSalesHOD">
                                                            <Select
                                                                className="custom-select input_field_input_field"
                                                                classNamePrefix="react-select"
                                                                placeholder="Sales Agent (1)"
                                                                options={userOptions}
                                                                getOptionLabel={option => option.label}
                                                                getOptionValue={option => option.value}
                                                                onChange={handleTelesalesAgentChange}
                                                            />
                                                        </Form.Group>
                                                    </Col>
                                                    <Col xs={12} md={1}>
                                                        <Form.Group className="mb-3" controlId="formTeleSalesAgentCommission">
                                                            <Form.Control
                                                                type="number"
                                                                className='convert_to_lead_input_field input_field_input_field'
                                                                placeholder='(%)'
                                                                onChange={handleTeleSalesAgentCommissionChange} // Add the handler here
                                                            />
                                                            {/* <Form.Text className="text-muted">
                                                                {Math.round(teleSalesAgentCommission)}
                                                            </Form.Text> */}
                                                        </Form.Group>
                                                    </Col>
                                                    <Col xs={12} md={2}>
                                                        <Form.Group className="mb-3" controlId="formCoordinatorCommission">
                                                            <Form.Control
                                                                type="number"
                                                                className='convert_to_lead_input_field input_field_input_field'
                                                                placeholder='(%)'
                                                                value={Math.max(0, Math.floor(teleSalesAgentCommission))}
                                                                disabled
                                                            />
                                                        </Form.Group>
                                                    </Col>

                                                    <Col xs={12} md={3}>
                                                        <Form.Group className="mb-3" controlId="formTeleSalesHOD">
                                                            <Select
                                                                className="custom-select input_field_input_field"
                                                                classNamePrefix="react-select"
                                                                placeholder="Sales Agent (2)"
                                                                options={userOptions}
                                                                getOptionLabel={option => option.label}
                                                                getOptionValue={option => option.value}
                                                                onChange={handleTelesalesAgentOneChange}
                                                            />
                                                        </Form.Group>
                                                    </Col>
                                                    <Col xs={12} md={1}>
                                                        <Form.Group className="mb-3" controlId="formTeleSalesAgentCommission">
                                                            <Form.Control
                                                                type="number"
                                                                className='convert_to_lead_input_field input_field_input_field'
                                                                placeholder='(%)'
                                                                onChange={handleTeleSalesAgentOneCommissionChange} // Add the handler here
                                                            />
                                                        </Form.Group>
                                                    </Col>
                                                    <Col xs={12} md={2}>
                                                        <Form.Group className="mb-3" controlId="formCoordinatorCommission">
                                                            <Form.Control
                                                                type="number"
                                                                className='convert_to_lead_input_field input_field_input_field'
                                                                placeholder='(%)'
                                                                value={Math.max(0, Math.floor(teleSalesAgentOneCommission))}
                                                                disabled
                                                            />
                                                        </Form.Group>
                                                    </Col>
                                                </>
                                            )}
                                        </Row>
                                    </>
                                )}
                            </Card>

                        </Card>
                    </Form>
                </Modal.Body>
                <Modal.Footer style={{ border: 'none', direction: rtl === 'true' ? 'rtl' : 'ltr' }}>
                    <Button
                        className="all_close_btn_container"
                        onClick={() => setEditModal(false)}
                    >
                        {rtl === 'true' ? 'إغلاق' : 'Close'}
                    </Button>
                    <Button
                        className="all_common_btn_single_lead"
                        onClick={handleSubmit}  // Use onClick instead of onSubmit
                    >
                        {rtl === 'true' ? 'إنشاء العقد' : 'Update Contract'}
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
export default EditContract