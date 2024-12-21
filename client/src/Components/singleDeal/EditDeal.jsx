import React, { useState, useEffect } from 'react';
import { Row, Col, Modal, Button, Form, Card } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import axios from 'axios';
import Select from 'react-select';
import '../../Components/convertLead/convertLeadStyle.css'
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const EditDeal = ({ setLeadToContract, setContractModal, singleLead, leads, rtl, setEditModal, editModal, deal }) => {
    // Abu Dhabi Branch
    const { service_commission_id } = deal
    const { selected_users } = deal

    const [financialAmount, setFinancialAmount] = useState(0);
    const [bankCommission, setBankCommission] = useState(0);
    const [customerCommission, setCustomerCommission] = useState(0);
    const [withVatCommission, setWithVatCommission] = useState(0);
    const [withoutVatCommission, setWithoutVatCommission] = useState(0);
    const [selectedHOD, setSelectedHOD] = useState(null);
    const [selectedHoM, setSelectedHoM] = useState(null);
    const [selectedManger, setSelectedManager] = useState(null);
    const [selectHomReferal, setSelectHomReferal] = useState(null)
    const [homRefCommissionPercentage, setHomRefCommissionPercentage] = useState(0);
    const [homRefCommission, setHomRefCommission] = useState(0);
    const token = useSelector(state => state.loginSlice.user?.token)

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
    const [hoMOptions, setHoMOptions] = useState([])
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
    const [revenueWithVat, setRevenueWithVat] = useState('');
    const [revenueWithoutVat, setRevenueWithoutVat] = useState('');
    const [teleSalesTeamLeaderOptions, setTeleSalesTeamLeaderOptions] = useState([]);
    const [teleTsAgentOptions, setTeleSalesTsAgentOptions] = useState([]);

    const [selectedAjmanManger, setSelectedAjmanManager] = useState(null);
    const [selectedDubaiManger, setSelectedDubaiManager] = useState(null);

    const [selectedCoordinator, setSelectedCoordinator] = useState(null)
    const [selectedDubaiCoordinator, setSelectedDubaiCoordinator] = useState(null)
    const [selectedAjmanCoordinator, setSelectedAjmanCoordinator] = useState(null)
    const [selectedTeamLeader, setSelectedTeamLeader] = useState(null)
    const [selectedAjmanTeamLeader, setSelectedAjmanTeamLeader] = useState(null)
    const [selectedSalesAgent, setSelectedSalesAgent] = useState(null)
    const [selectedDubaiTeamLeader, setSelectedDubaiTeamLeader] = useState(null)
    const [selectedDubaiSales, setSelectedDubaiSales] = useState(null)
    const [selectedSalesAgentOne, setSelectedSalesAgentOne] = useState(null)
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
    const [selectedtelesalesTeamLeader, setSelectedTeleSalesTeamLeader] = useState(null)
    const [selectedtelesalesAgent, setSelectedTeleSalesAgent] = useState(null)
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
    const [dubaiBranchSalesManagerCommissionTransfer, setDubaiBranchSalesManagerCommissionTransfer] = useState(0);
    const [dubaiBranchSalesManagerCommissionValue, setDubaiBranchSalesManagerCommissionValue] = useState(0);
    const [transferHOD, setTransferHod] = useState('')
    const [transferManager, setTransferManager] = useState('')
    const [homCommissionPercentage, setHomCommissionPercentage] = useState(0);
    const [homCommission, setHomCommission] = useState(0);
    const [brokerName, setBrokerName] = useState(singleLead?.thirdpartyname ? singleLead?.thirdpartyname : null)
    const [homRef, setHomRef] = useState(null);
    const [hodRef, setHodRef] = useState(null);
    const [ManagerRef, setManagerRef] = useState(null);

    const navigate = useNavigate()
    // Load initial data when the component mounts
    useEffect(() => {
        // Set the initial values for the form fields
        setFinancialAmount(service_commission_id.finance_amount);
        setBankCommission(service_commission_id.bank_commission);
        setCustomerCommission(service_commission_id.customer_commission);
        setWithVatCommission(service_commission_id.with_vat_commission);
        setWithoutVatCommission(service_commission_id.without_vat_commission);
        setHodCommissionPercentage(service_commission_id.hod_commission_percentage)
        setHodCommission(service_commission_id.hod_commission_amount)
        setSelectedHOD(service_commission_id?.hod?.name)
        setSelectedHoM(service_commission_id?.hom?.name)
        setHomCommissionPercentage(service_commission_id?.hom_commission_percentage)
        setHomCommission(service_commission_id?.hom_commission_amount)
        setSalesManagerCommission(service_commission_id?.sale_manager_commission_amount)
        setSalesManagerCommissionPercentage(service_commission_id?.sale_manager_commission_percentage)
        setCoordinatorCommissionPercentage(service_commission_id?.coordinator_commission_percentage)
        setCoordinatorCommission(service_commission_id?.coordinator_commission_amount)
        setAgentCommissionPercentage(service_commission_id?.sales_agent_commission_percentage)
        setAgentCommission(service_commission_id?.sales_agent_commission_amount)
        setAgentOneCommissionPercentage(service_commission_id?.sales_agent_one_commission_percentage)
        setAgentOneCommission(service_commission_id?.sales_agent_one_commission_amount)
        setMarketingManagerCommissionPercentage(service_commission_id?.marketing_one_commission_percentage)
        setMarketingManagerCommission(service_commission_id?.marketing_one_commission_amount)
        setMarketingAgentCommissionPercentage(service_commission_id.marketing_two_commission_percentage)
        setMarketingAgentCommission(service_commission_id.marketing_two_commission_amount)
        setMarketingManagerOneCommissionPercentage(service_commission_id.marketing_three_commission_percentage)
        setMarketingManagerOneCommission(service_commission_id.marketing_three_commission_amount)
        setMarketingAgentOneCommissionPercentage(service_commission_id.marketing_four_commission_percentage)
        setMarketingAgentOneCommission(service_commission_id.marketing_four_commission_amount)
        setItManagerCommissionPercentage(service_commission_id.developer_one_commission_percentage)
        setItManagerCommission(service_commission_id.developer_one_commission_amount)
        setDeveloperCommissionPercentage(service_commission_id.developer_two_commission_percentage)
        setDeveloperCommission(service_commission_id.developer_two_commission_amount)
        setDeveloperOneCommissionPercentage(service_commission_id.developer_two_commission_percentage)
        setDeveloperOneCommission(service_commission_id.developer_two_commission_amount)
        setDeveloperTwoCommissionPercentage(service_commission_id.developer_two_commission_percentage)
        setDeveloperTwoCommission(service_commission_id.developer_two_commission_amount)
        setDubaiBranchSalesManagerCommissionValue(service_commission_id.hod_ref_commission_amount)
        setTeleSalesHodCommissionPercentage(service_commission_id.ts_team_leader_commission_percentage)
        setTeleSalesHodCommission(service_commission_id.ts_team_leader_commission_amount)
        setTeleSalesTeamLeaderCommissionPercentage(service_commission_id.tsagent_commission_percentage)
        setTeleSalesTeamLeaderCommission(service_commission_id.tsagent_commission_amount)
        setBrokerName(service_commission_id.broker_name)
        setBrokerCommission(service_commission_id.broker_name_commission_percentage)
        setBrokerCommissionValue(service_commission_id.broker_name_commission_amount)
        setSelectedTeleSalesTeamLeader(service_commission_id?.ts_team_leader?.name)
        setSelectedTeleSalesAgent(service_commission_id?.ts_agent?.name)
        setSelectedAjmanManager(service_commission_id?.ajman_manager?.name)
        setAjmanManagerCommission(service_commission_id?.ajman_manager_commission_amount)
        setAjmanManagerCommissionPercentage(service_commission_id?.ajman_manager_commission_percentage)
        setSelectedAjmanCoordinator(service_commission_id?.ajman_coordinator?.name)
        setAjmanCoordinatorCommissionPercentage(service_commission_id?.ajman_coordinator_commission_percentage)
        setAjmanCoordinatorCommissionValue(service_commission_id?.ajman_coordinator_commission_amount)
        setSelectedAjmanTeamLeader(service_commission_id?.ajman_team_leader?.name)
        setAjmanTeamLeaderCommissionPercentage(service_commission_id?.ajman_team_leader_commission_percentage)
        setAjmanTeamLeaderCommission(service_commission_id?.ajman_team_leader_commission_amount)
        setSelectedSalesAgentAjman(service_commission_id?.ajman_sale_agent?.name)
        setAjmanBranchCommissionPercentage(service_commission_id?.ajman_sale_agent_percentage)
        setAjmanBranchCommission(service_commission_id?.ajman_sale_agent_amount)

        setSelectedDubaiManager(service_commission_id?.dubai_manager?.name)
        setDubaiBranchCommissionPercentage(service_commission_id?.dubai_manager_commission_percentage)
        setDubaiBranchCommission(service_commission_id?.dubai_manager_commission_amount)

        setSelectedDubaiCoordinator(service_commission_id?.dubai_coordinator?.name)
        setDubaiBranchCoordinatorCommissionPercentage(service_commission_id?.dubai_coordinator_commission_percentage)
        setDubaiBranchCoordinatorCommission(service_commission_id?.dubai_coordinator_commission_amount)

        setSelectedDubaiTeamLeader(service_commission_id?.dubaiteam_leader?.name)
        setDubaiBranchTeamLeaderCommissionPercentage(service_commission_id?.dubaiteam_leader_commission_percentage)
        setDubaiBranchTeamLeaderCommission(service_commission_id?.dubaiteam_leader_commission_amount)

        setSelectedDubaiSales(service_commission_id?.dubaisale_agent?.name)
        setDubaiBranchAgentCommissionPercentage(service_commission_id?.dubaiteam_sale_agent_percentage)
        setDubaiBranchAgentCommission(service_commission_id?.dubaiteam_sale_agent_amount)

        setHomRef(service_commission_id?.ref_hom?.name)
        setHomRefCommissionPercentage(service_commission_id?.ref_hom_commission_percentage)
        setHomRefCommission(service_commission_id?.ref_hom_commission_amount)

        setHodRef(service_commission_id?.ref_hod?.name)
        setDubaiBranchSalesManagerCommissionTransfer(service_commission_id?.ref_hod_commission_percentage)
        setDubaiBranchSalesManagerCommissionValue(service_commission_id?.ref_hod_commission_amount)

        setManagerRef(service_commission_id?.ref_manager?.name)
        setAgentRefCommissionPercentage(service_commission_id?.ref_manager_commission_percentage)
        setAgentRefCommission(service_commission_id?.ref_manager_commission_amount)

        setSelectedTeamLeader(service_commission_id?.team_leader_one?.name)
        setTeamLeaderCommissionPercentage(service_commission_id?.team_leader_one_commission_percentage)
        setTeamLeaderCommission(service_commission_id?.team_leader_one_commission_amount)

        // setHomRef(service_commission_id?.dubaiteam_sale_agent_amount)
    }, [deal, service_commission_id]);

    // Update the default value when `service_commission_id` changes
    useEffect(() => {
        if (service_commission_id?.hod?.name) {
            const defaultHOD = hodOptions.find(
                hod => hod.name === service_commission_id.hod.name
            );
            if (defaultHOD) {
                setSelectedHOD({ label: defaultHOD.name, value: defaultHOD._id });
            }
        }
        if (service_commission_id?.hom?.name) {
            const defaultHoM = hoMOptions.find(
                hom => hom.name === service_commission_id.hom.name
            );
            if (defaultHoM) {
                setSelectedHoM({ label: defaultHoM.name, value: defaultHoM._id });
            }
        }
        if (service_commission_id?.sale_manager?.name) {
            const defaultManager = managerOptions.find(
                manager => (service_commission_id?.sale_manager?.name === manager.name)
            );
            if (defaultManager) {
                setSelectedManager({ label: defaultManager.name, value: defaultManager._id });
            }
        }
        if (service_commission_id?.coordinator?.name) {
            const defaultCoordinator = coordinatorOptions.find(
                c => c.name === service_commission_id.coordinator.name
            );
            if (defaultCoordinator) {
                setSelectedCoordinator({ label: defaultCoordinator.name, value: defaultCoordinator._id });
            }
        }
        if (service_commission_id?.team_leader_one?.name) {
            const defaultTeamLeader = teamLeaderOptions.find(
                teamleader => teamleader.name === service_commission_id.team_leader_one.name
            );
            if (defaultTeamLeader) {
                setSelectedTeamLeader({ label: defaultTeamLeader.name, value: defaultTeamLeader._id });
            }
        }
        if (service_commission_id?.sales_agent?.name) {
            const defaultSalesAgent = tsAgentOptions.find(
                tsagent => tsagent.name === service_commission_id.sales_agent?.name
            );
            if (defaultSalesAgent) {
                setSelectedSalesAgent({ label: defaultSalesAgent.name, value: defaultSalesAgent._id });
            }
        }
        if (service_commission_id?.sales_agent_one?.name) {
            const defaultSalesAgentOne = tsAgentOptions.find(
                tsagent => tsagent.name === service_commission_id.sales_agent_one?.name
            );
            if (defaultSalesAgentOne) {
                setSelectedSalesAgentOne({ label: defaultSalesAgentOne.name, value: defaultSalesAgentOne._id });
            }
        }
        if (service_commission_id?.marketing_one?.name) {
            const defaultMarketingManager = marketingOptions.find(
                option => option.name === service_commission_id.marketing_one?.name
            );
            if (defaultMarketingManager) {
                setSelectedMarketingManager({ label: defaultMarketingManager.name, value: defaultMarketingManager._id });
            }
        }
        if (service_commission_id?.marketing_two?.name) {
            const defaultMarketingAgent = marketingOptions.find(
                option => option.name === service_commission_id.marketing_two.name
            );
            if (defaultMarketingAgent) {
                setSelectedMarketingAgent({ label: defaultMarketingAgent.name, value: defaultMarketingAgent._id });
            }
        }
        if (service_commission_id?.marketing_three?.name) {
            const defaultMarketingManagerOne = marketingOptions.find(
                option => option.name === service_commission_id.marketing_three.name
            );
            if (defaultMarketingManagerOne) {
                setSelectedMarketingManagerOne({
                    label: defaultMarketingManagerOne.name,
                    value: defaultMarketingManagerOne._id,
                });
            }
        }
        if (service_commission_id?.marketing_four?.name) {
            const defaultMarketingAgentOne = marketingOptions.find(
                option => option.name === service_commission_id.marketing_four.name
            );
            if (defaultMarketingAgentOne) {
                setSelectedMarketingOneAgent({
                    label: defaultMarketingAgentOne.name,
                    value: defaultMarketingAgentOne._id,
                });
            }
        }
        if (service_commission_id?.developer_one?.name) {
            const defaultItManager = developerOptions.find(
                option => option.name === service_commission_id.developer_one.name
            );
            if (defaultItManager) {
                setSelectedItManager({
                    label: defaultItManager.name,
                    value: defaultItManager._id,
                });
            }
        }
        if (service_commission_id?.developer_two?.name) {
            const defaultDeveloper = developerOptions.find(
                option => option.name === service_commission_id.developer_two?.name
            );
            if (defaultDeveloper) {
                setDeveloper({
                    label: defaultDeveloper.name,
                    value: defaultDeveloper._id,
                });
            }
        }
        if (service_commission_id?.developerthree?.name) {
            const defaultDeveloperOne = developerOptions.find(
                option => option.name === service_commission_id.developerthree.name
            );
            if (defaultDeveloperOne) {
                setDeveloperOne({
                    label: defaultDeveloperOne.name,
                    value: defaultDeveloperOne._id,
                });
            }
        }
        if (service_commission_id?.developer_four?.name) {
            const defaultDeveloperTwo = developerOptions.find(
                option => option.name === service_commission_id.developer_four.name
            );
            if (defaultDeveloperTwo) {
                setDeveloperTwo({
                    label: defaultDeveloperTwo.name,
                    value: defaultDeveloperTwo._id,
                });
            }
        }

        if (service_commission_id?.ts_team_leader?.name) {
            const defaultTeamLeader = teleSalesTeamLeaderOptions.find(
                option => option.name === service_commission_id.ts_team_leader?.name
            );
            if (defaultTeamLeader) {
                setSelectedTeleSalesTeamLeader({
                    label: defaultTeamLeader.name,
                    value: defaultTeamLeader._id,
                });
            }
        }

        if (service_commission_id?.ts_agent?.name) {
            const defaultAgent = teleTsAgentOptions.find(
                option => option.name === service_commission_id.ts_agent?.name
            );
            if (defaultAgent) {
                setSelectedTeleSalesAgent({
                    label: defaultAgent.name,
                    value: defaultAgent._id,
                });
            }
        }
        if (service_commission_id?.ajman_manager?.name) {
            const defaultManager = managerAjmanOptions.find(
                manager => manager.name === service_commission_id.ajman_manager.name
            );
            if (defaultManager) {
                setSelectedAjmanManager({
                    label: defaultManager.name,
                    value: defaultManager._id,
                });
            }
        }

        if (service_commission_id?.ajman_coordinator?.name) {
            const defaultCoordinator = coordinatorAjmanOptions.find(
                c => c.name === service_commission_id.ajman_coordinator.name
            );
            if (defaultCoordinator) {
                setSelectedAjmanCoordinator({
                    label: defaultCoordinator.name,
                    value: defaultCoordinator._id,
                });
            }
        }

        if (service_commission_id?.ajman_team_leader?.name) {
            const defaultTeamLeader = teamLeaderAjmanOptions.find(
                leader => leader.name === service_commission_id.ajman_team_leader?.name
            );
            if (defaultTeamLeader) {
                setSelectedAjmanTeamLeader({
                    label: defaultTeamLeader.name,
                    value: defaultTeamLeader._id,
                });
            }
        }

        if (service_commission_id?.ajman_sale_agent?.name) {
            const defaultSalesAgent = tsAgentAjmanOptions.find(
                agent => agent.name === service_commission_id.ajman_sale_agent.name
            );
            if (defaultSalesAgent) {
                setSelectedSalesAgentAjman({
                    label: defaultSalesAgent.name,
                    value: defaultSalesAgent._id,
                });
            }
        }

        if (service_commission_id?.dubai_manager?.name) {
            const defaultDubaiManager = managerDubaiOptions.find(
                manager => manager.name === service_commission_id.dubai_manager.name
            );
            if (defaultDubaiManager) {
                setSelectedDubaiManager({
                    label: defaultDubaiManager.name,
                    value: defaultDubaiManager._id,
                });
            }
        }

        if (service_commission_id?.dubai_coordinator?.name) {
            const defaultDubaiCoordinator = coordinatorDubaiOptions.find(
                c => c.name === service_commission_id.dubai_coordinator?.name
            );
            if (defaultDubaiCoordinator) {
                setSelectedDubaiCoordinator({
                    label: defaultDubaiCoordinator.name,
                    value: defaultDubaiCoordinator._id,
                });
            }
        }

        if (service_commission_id?.dubaisale_agent?.name) {
            const defaultDubaiSalesAgent = tsAgentDubaiOptions.find(
                tsagent => tsagent.name === service_commission_id.dubaisale_agent.name
            );
            if (defaultDubaiSalesAgent) {
                setSelectedDubaiSales({
                    label: defaultDubaiSalesAgent.name,
                    value: defaultDubaiSalesAgent._id,
                });
            }
        }
    }, [service_commission_id, hodOptions, hoMOptions, managerOptions, coordinatorOptions, teamLeaderOptions, tsAgentOptions, marketingOptions, developerOptions, teleSalesTeamLeaderOptions, teleTsAgentOptions, managerAjmanOptions, coordinatorAjmanOptions, tsAgentAjmanOptions, managerDubaiOptions, coordinatorDubaiOptions, tsAgentDubaiOptions]);

    // Calculate VAT-related commissions whenever bank or customer commissions change
    useEffect(() => {
        const totalCommission = bankCommission + customerCommission;
        const totalRevenue = totalCommission / 1.05; // Revenue without VAT

        setWithVatCommission(totalCommission);
        setWithoutVatCommission(totalRevenue);
        // Calculate HOD commission if necessary
        const hodCommissionCalculated = totalRevenue * (hodCommissionPercentage / 100);
        setHodCommission(Math.round(hodCommissionCalculated));
        // Calculate HOM commission
        const homCommissionCalculated = totalRevenue * (homCommissionPercentage / 100);
        setHomCommission(Math.round(homCommissionCalculated));
        // Calculate Sales Manager commission
        const salesManagerCommissionCalculated = totalRevenue * (salesManagerCommissionPercentage / 100);
        setSalesManagerCommission(Math.round(salesManagerCommissionCalculated));

    }, [bankCommission,
        customerCommission,
        hodCommissionPercentage,
        homCommissionPercentage,
        salesManagerCommissionPercentage,
    ]);

    // This useEffect will run when the component is mounted or when hodsale changes
    useEffect(() => {
        if (service_commission_id.hodsale && service_commission_id.hodsale._id) {
            const selected = hodOptions.find(hod => hod._id === service_commission_id.hodsale._id);
            setSelectedHOD(selected);
        }
    }, [deal, hodOptions]);

    const handleSubmit = async () => {
        try {
            // Prepare the updated data
            const updatedData = {
                finance_amount: financialAmount,
                bank_commission: bankCommission,
                customer_commission: customerCommission,
                with_vat_commission: withVatCommission,
                without_vat_commission: withoutVatCommission,
                hod: selectedHOD ? selectedHOD.value : null,
                hod_commission_amount: hodCommission,
                hod_commission_percentage: hodCommissionPercentage,
                // HOM
                hom: selectedHoM ? selectedHoM.value : null,
                hom_commission_amount: homCommission,
                hom_commission_percentage: homCommissionPercentage,
                // ABU Dhabi Manager
                sale_manager: selectedManger ? selectedManger.value : null,
                sale_manager_commission_percentage: salesManagerCommissionPercentage,
                sale_manager_commission_amount: salesManagerCommission,
                // Abu Dhabi Coordinator
                coordinator: selectedCoordinator ? selectedCoordinator.value : null,
                coordinator_commission_percentage: coordinatorCommissionPercentage,
                coordinator_commission_amount: coordinatorCommission,
                // Abu Dhabi Team Leader
                team_leader_one: selectedTeamLeader ? selectedTeamLeader.value : null,
                team_leader_one_commission_amount: teamLeaderCommission,
                team_leader_one_commission_percentage: teamLeaderCommissionPercentage,
                // Abu Dhabi Sale Agent
                sales_agent: selectedSalesAgent ? selectedSalesAgent.value : null,
                sales_agent_commission_percentage: agentCommissionPercentage,
                sales_agent_commission_amount: agentCommission,
                // Abu Dhabi Sale Agent One
                sales_agent_one: selectedSalesAgentOne ? selectedSalesAgentOne.value : null,
                sales_agent_one_commission_percentage: agentOneCommissionPercentage,
                sales_agent_one_commission_amount: agentOneCommission,
                //  ts_Team Leader
                ts_team_leader: selectedtelesalesTeamLeader ? selectedtelesalesTeamLeader.value : null,
                ts_team_leader_commission_amount: teleSalesHodCommission,
                ts_team_leader_commission_percentage: teleSalesHodCommissionPercentage,
                //  TS Agent
                ts_agent: selectedtelesalesAgent ? selectedtelesalesAgent.value : null,
                tsagent_commission_percentage: teleSalesTeamLeaderCommissionPercentage,
                tsagent_commission_amount: teleSalesTeamLeaderCommission,
                // Marketing Team 
                marketing_one: selectedMarketingManager ? selectedMarketingManager.value : null,
                marketing_one_commission_percentage: marketingManagerCommissionPercentage,
                marketing_one_commission_amount: marketingManagerCommission,
                // Marketing Team One
                marketing_two: selectedMarketingAgent ? selectedMarketingAgent.value : null,
                marketing_two_commission_percentage: marketingAgentCommissionPercentage,
                marketing_two_commission_amount: marketingAgentCommission,
                // Marketing Team Two
                marketing_three: selectedMarketingManagerOne ? selectedMarketingManagerOne.value : null,
                marketing_three_commission_percentage: marketingManagerOneCommissionPercentage,
                marketing_three_commission_amount: marketingManagerOneCommission,
                // Marketing Team Three
                marketing_four: selectedMarketingAgentOne ? selectedMarketingAgentOne.value : null,
                marketing_four_commission_percentage: marketingAgentOneCommissionPercentage,
                marketing_four_commission_amount: marketingAgentOneCommission,
                // Developer one
                developer_one: selectedItManager ? selectedItManager.value : null,
                developer_one_commission_percentage: ItManagerCommissionPercentage,
                developer_one_commission_amount: ItManagerCommission,
                // Developer Two
                developer_two: developer ? developer.value : null,
                developer_two_commission_percentage: developerCommissionPercentage,
                developer_two_commission_amount: developerCommission,
                // Developer THree
                developerthree: developerOne ? developerOne.value : null,
                developer_three_commission_percentage: developerOneCommissionPercentage,
                developer_three_commission_amount: developerOneCommission,
                // Developer Four
                developer_four: developerTwo ? developerTwo.value : null,
                developer_four_commission_percentage: developerTwoCommissionPercentage,
                developer_four_commission_amount: developerTwoCommission,

                // Broker Name
                broker_name: brokerName,
                broker_name_commission_amount: brokerCommissionValue,
                broker_name_commission_percentage: brokerCommission,

                // Ref_Fields_Hod
                ref_hod: hodRef?.id || selectHodReferal?.value,
                ref_hod_commission_percentage: dubaiBranchSalesManagerCommissionTransfer,
                ref_hod_commission_amount: dubaiBranchSalesManagerCommissionValue,

                ref_hom: homRef?.id || selectHomReferal?.value,
                ref_hom_commission_percentage: homRefCommissionPercentage,
                ref_hom_commission_amount: homRefCommission,

                ref_manager: ManagerRef?.id || selectManagerReferal?.value,
                ref_manager_commission_percentage: agentRefCommissionPercentage,
                ref_manager_commission_amount: agentRefCommission,
                // Dubai Manager
                dubai_manager: selectedDubaiManger ? selectedDubaiManger.value : null,
                dubai_manager_commission_percentage: dubaiBranchCommissionPercentage,
                dubai_manager_commission_amount: dubaiBranchCommission,
                // Dubai Coordinator
                dubai_coordinator: selectedDubaiCoordinator ? selectedDubaiCoordinator.value : null,
                dubai_coordinator_commission_percentage: dubaiBranchCoordinatorCommissionPercentage,
                dubai_coordinator_commission_amount: dubaiBranchCoordinatorCommission,
                // Dubai Team Leader
                dubaiteam_leader: selectedDubaiTeamLeader ? selectedDubaiTeamLeader.value : null,
                dubaiteam_leader_commission_percentage: dubaiBranchTeamLeaderCommissionPercentage,
                dubaiteam_leader_commission_amount: dubaiBranchTeamLeaderCommission,
                // Dubai Sales Agnet
                dubaisale_agent: selectedDubaiSales ? selectedDubaiSales.value : null,
                dubaiteam_sale_agent_percentage: dubaiBranchAgentCommissionPercentage,
                dubaiteam_sale_agent_amount: dubaiBranchAgentCommission,

            };

            // Send the PUT request with updated data
            const response = await axios.put(`/api/contracts/update-service-commission/${deal._id}`, updatedData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (response.status === 200) {
                toast.success('Updated Successfully');
            }
        } catch (error) {
            toast.error('Failed to update service commission');
        }
        setEditModal(false)
    }

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                // Fetch lead data
                const leadResponse = await axios.get(
                    `/api/contracts/single-contract/${deal._id}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );
                console.log(leadResponse.data, 'leadResponse')
                const response = await axios.get(
                    `/api/users/get-users`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                const users = response.data; // Adjust according to your API response structur
                const filterReferalHod = users.filter(user => user.role === 'HOD');
                setHodReferalOptions(filterReferalHod);
                const filterReferalManager = users.filter(user => user.role === 'Manager');
                setManagerReferalOptions(filterReferalManager);
                const teleSalesTeamLeaderOptions = users.filter(user => user.role === 'TS Team Leader')
                setTeleSalesTeamLeaderOptions(teleSalesTeamLeaderOptions);
                const teleSalesAgentOptions = users.filter(user => user.role === 'TS Agent')
                setTeleSalesTsAgentOptions(teleSalesAgentOptions);
                // Filter users based on branch.name or branch being null
                const filteredUsers = users.filter(user =>
                    user.branch?.name === 'Abu Dhabi' || user.branch === null
                );

                if (leadResponse.data) {
                    // Set options based on roles and filtered users
                    const hoddata = filteredUsers.filter(user => user.role === 'HOD')
                    setHodOptions(filteredUsers.filter(user => user.role === 'HOD'));
                    setHoMOptions(filteredUsers.filter(user => user.role === 'HOM'))
                    setManagerOptions(filteredUsers.filter(user => user.role === 'Manager'));
                    setCoordinatorOptions(filteredUsers.filter(user => user.role === 'Coordinator'));
                    setTeamLeaderOptions(filteredUsers.filter(user => user.role === 'Team Leader'));
                    setTsAgentOptions(filteredUsers.filter(user => user.role === 'Sales'));
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
                    // Set options based on roles and filtered users
                    setManagerDubaiOptions(filteredDubaiUsers.filter(user => user.role === 'Manager'));
                    setCoordinatorDubaiOptions(filteredDubaiUsers.filter(user => user.role === 'Coordinator'));
                    setTeamLeaderDubaiOptions(filteredDubaiUsers.filter(user => user.role === 'Team Leader'));
                    setTsAgentDubaiOptions(filteredDubaiUsers.filter(user => user.role === 'Sales'));
                }

                setLeadData(leadResponse.data);
            } catch (error) {
                console.error('Error fetching users:', error);
            }
        };
        fetchUsers()
    }, [token]);


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

        if (!isNaN(homCommissionPercentage)) {
            const updatedHoMCommission = calculateCommission(adjustedRevenue, homCommissionPercentage);
            setHomCommission(Math.round(updatedHoMCommission));
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
    // Transfer Case Handler
    const handleReferalHom = (selectedReferalHom) => {
        if (selectedReferalHom) {
            setSelectHomReferal(selectedReferalHom)
        } else {
            setSelectHomReferal(null)
            setHomRefCommissionPercentage(0)
            setHomRefCommission(0)
        }
    }
    // onChange Function for HOD
    const HandlerChange = (selectedOption) => {
        if (selectedOption) {
            setSelectedHOD(selectedOption); // Set selected HOD when a value is chosen
        } else {
            setSelectedHOD(null); // Clear selected HOD when the value is removed
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
            setSelectedTeleSalesTeamLeader(selectedTelesalesOption)
        } else {
            setSelectedTeleSalesTeamLeader(null)
            setTeleSalesHodCommissionPercentage(0)
            setTeleSalesHodCommission(0)
        }
    }

    // onChange Function for Tele salesTeam Leader
    const handleTelesalesAgentChange = (selectedTelesalesTsAgentOption) => {
        if (selectedTelesalesTsAgentOption) {
            setSelectedTeleSalesAgent(selectedTelesalesTsAgentOption)
        } else {
            setSelectedTeleSalesAgent(null)
            setTeleSalesAgentCommissionPercentage(0)
            setTeleSalesAgentCommission(0)
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

    const HandlerHoMChange = (selectedHom) => {
        if (selectedHom) {
            setSelectedHoM(selectedHom)
        } else {
            setSelectedHoM(null)
            setHomCommission(0)
            setHomCommissionPercentage(0)
        }
    }

    // Handler for HOM Commission Percentage
    const handleHomCommissionChange = (e) => {
        const percentage = parseFloat(e.target.value);
        setHomCommissionPercentage(percentage);

        if (isNaN(percentage) || percentage === '') {
            // Reset commission value if input is invalid
            setHomCommission(0);
            return;
        }

        // Example calculation for commission value
        const adjustedRevenue = revenueWithoutVat - brokerCommissionValue; // Adjust as per your formula
        if (adjustedRevenue > 0) {
            const commissionValue = calculateCommission(adjustedRevenue, percentage); // Define this function as needed
            setHomCommission(Math.round(commissionValue));
        }
    };

    // Handler for HOM Commission Value
    const handleHomCommissionValueChange = (e) => {
        const value = parseFloat(e.target.value);
        setHomCommission(value);

        if (isNaN(value) || value === '') {
            // Reset percentage if input is invalid
            setHomCommissionPercentage(0);
            return;
        }

        // Example calculation for percentage
        const adjustedRevenue = revenueWithoutVat - brokerCommissionValue; // Adjust as per your formula
        if (adjustedRevenue > 0) {
            const percentage = (value / adjustedRevenue) * 100;
            setHomCommissionPercentage(Math.round(percentage));
        }
    };

    const handleHomRefCommissionPercentageChange = (e) => {
        const percentage = parseFloat(e.target.value);
        setHomRefCommissionPercentage(percentage);

        if (isNaN(percentage) || percentage === '') {
            // Clear the commission value when percentage is invalid
            setHomRefCommission(0);
            return;
        }

        const adjustedRevenue = revenueWithoutVat - brokerCommissionValue;
        if (adjustedRevenue > 0) {
            const commissionValue = calculateCommission(adjustedRevenue, percentage);
            setHomRefCommission(Math.round(commissionValue));
        }
    };

    const handleHomRefCommissionValueChange = (e) => {
        const value = parseFloat(e.target.value);
        setHomRefCommission(value);

        if (!isNaN(value) && revenueWithoutVat - brokerCommissionValue > 0) {
            const adjustedRevenue = revenueWithoutVat - brokerCommissionValue;
            const percentage = (value / adjustedRevenue) * 100;
            setHomRefCommissionPercentage(Math.round(percentage));
        }
    };

    return (
        <div>
            <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={true}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
            />
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
                            : `Service Application Edit Form`}
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

                        {/* Third Card */}
                        {deal.lead_type?.name === 'Others' && deal.source_id?.name === 'Third Party' && (
                            <Card className='convertToLead_card mt-2 modal_body_bg_color' style={{ border: '#d7aa47' }}>
                                <h5 className='text-center heading_tag mutual_class_color' >Third Party</h5>
                                <>
                                    <Row>
                                        <Col xs={12} md={6}>
                                            <Form.Group className="mb-3" controlId="formBrokerName">
                                                <Form.Control
                                                    type="text"
                                                    name="brokerName"
                                                    value={brokerName}
                                                    // onChange={(e) => setBrokerName(e.target.value)}
                                                    className='convert_to_lead_input_field input_field_input_field'
                                                    placeholder="3rd Party Broker Name"
                                                    readOnly
                                                />
                                            </Form.Group>
                                        </Col>

                                        <Col xs={12} md={2}>
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

                                        <Col xs={12} md={4}>
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
                                    </Row>
                                </>
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
                                                        label: hod.name,
                                                        value: hod._id
                                                    }))}
                                                    placeholder="Select HOD"
                                                    isClearable
                                                    value={selectedHOD}
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

                                {hoMOptions.length > 0 && (
                                    <>
                                        <Col xs={12} md={3}>
                                            <Form.Group className="mb-3" controlId="formBasicHOD">
                                                <Select
                                                    className="custom-select mutual_heading_class input_field_input_field"
                                                    classNamePrefix="react-select"
                                                    options={hoMOptions.map(hod => ({
                                                        label: hod.name, // Display the name in options
                                                        value: hod._id   // Use the _id as the value
                                                    }))}
                                                    placeholder="Select Head of Manager(HOM)"
                                                    isClearable
                                                    value={selectedHoM}
                                                    onChange={HandlerHoMChange}
                                                />
                                            </Form.Group>
                                        </Col>

                                        {/* HOM Commission Percentage Input */}
                                        <Col xs={12} md={1}>
                                            <Form.Group className="mb-3" controlId="formHomCommissionPercentage">
                                                <Form.Control
                                                    type="text"
                                                    className="convert_to_lead_input_field input_field_input_field"
                                                    placeholder="(%)"
                                                    onChange={handleHomCommissionChange}
                                                    value={homCommissionPercentage || ''}
                                                />
                                            </Form.Group>
                                        </Col>

                                        {/* HOM Commission Value Input */}
                                        <Col xs={12} md={2}>
                                            <Form.Group className="mb-3" controlId="formHomCommissionValue">
                                                <Form.Control
                                                    type="text"
                                                    className="convert_to_lead_input_field input_field_input_field"
                                                    placeholder="Commission Value"
                                                    onChange={handleHomCommissionValueChange}
                                                    value={homCommission || ''}
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
                                            value={selectedManger}
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

                                {/* Coordinator*/}
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
                                            value={selectedCoordinator}
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
                                            value={selectedTeamLeader}
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
                                            value={selectedSalesAgent}
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
                                            value={selectedSalesAgentOne}
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

                            </Row>

                            {/* Ajman Branch */}
                            {
                                selected_users?.some(user => user?.branch?.name === 'Ajman') && (
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
                                                                        value={selectedAjmanManger}
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
                                                                    // disabled={!selectedAjmanManger}
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
                                                                    // disabled={!selectedAjmanManger}
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
                                                                        value={selectedAjmanCoordinator}
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
                                                                    // disabled={!selectedAjmanCoordinator}
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
                                                                    // disabled={!selectedAjmanCoordinator}
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
                                                                        value={selectedAjmanTeamLeader}
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
                                                                    // disabled={!selectedAjmanTeamLeader}
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
                                                                    // disabled={!selectedAjmanTeamLeader}
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
                                                            value={selectedSalesAgentAjman}
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
                                                        // disabled={!selectedSalesAgentAjman}
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
                                                        // disabled={!selectedSalesAgentAjman}
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
                                selected_users?.some(user => user?.branch?.name === 'Dubai') && (
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
                                                                        value={selectedDubaiManger}
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
                                                                        value={selectedDubaiCoordinator}
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
                                                                        value={selectedDubaiTeamLeader}
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
                                                            value={selectedDubaiSales}
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
                                {deal?.lead_id?.is_transfer &&
                                    <>
                                        <Card className='convertToLead_card mt-2 modal_body_bg_color' style={{ border: '#d7aa47' }}>
                                            <h5
                                                className={`heading_tag mutual_class_color ${rtl === 'true' ? 'text-right' : 'text-left'}`}
                                            >
                                                {rtl === 'true' ? 'معلومات التحويل' : 'Transfer Information'}
                                            </h5>
                                            <Row>
                                                {/* Ref HOD */}
                                                <Col xs={12} md={3}>
                                                    <Form.Group className="mb-3" controlId="formSalesManagerRefTransfer">
                                                        <Form.Control
                                                            type="text"
                                                            className='convert_to_lead_input_field input_field_input_field'
                                                            placeholder='HOD (Transfer)'
                                                            value={hodRef}
                                                            // onChange={(e) => setHodRef(e.target.value)}
                                                            readOnly
                                                        />
                                                    </Form.Group>
                                                </Col>

                                                <Col xs={12} md={1}>
                                                    <Form.Group className="mb-3" controlId="formDubaiBranchSalesManagerCommissionTransfer">
                                                        <Form.Control
                                                            type="text"
                                                            className="convert_to_lead_input_field input_field_input_field"
                                                            placeholder="(%)"
                                                            onChange={handleDubaiBranchSalesManagerCommissionTransferChange}
                                                            value={dubaiBranchSalesManagerCommissionTransfer || ''}
                                                        />
                                                    </Form.Group>
                                                </Col>

                                                <Col xs={12} md={2}>
                                                    <Form.Group className="mb-3" controlId="">
                                                        <Form.Control
                                                            type="text"
                                                            className="convert_to_lead_input_field input_field_input_field"
                                                            placeholder="Commission Value"
                                                            value={dubaiBranchSalesManagerCommissionValue || ''}
                                                            onChange={handleSalesManagerRef}
                                                        />
                                                    </Form.Group>
                                                </Col>

                                                {/* Ref Manager */}
                                                <Col xs={12} md={3}>
                                                    <Form.Group className="mb-3" controlId="formAgentRefTransfer">
                                                        <Form.Control
                                                            type="text"
                                                            className='convert_to_lead_input_field input_field_input_field'
                                                            placeholder='Sales Manager (Transfer)'
                                                            value={ManagerRef}
                                                            // onChange={(e) => setTransferManager(e.target.value)}
                                                            readOnly
                                                        />

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
                                                        />
                                                    </Form.Group>
                                                </Col>

                                                {/* Ref HOM */}
                                                <Col xs={12} md={3}>
                                                    <Form.Group className="mb-3" controlId="formAgentRefTransfer">
                                                        <Form.Control
                                                            type="text"
                                                            className='convert_to_lead_input_field input_field_input_field'
                                                            placeholder='HOM (Transfer)'
                                                            value={homRef}
                                                            // onChange={(e) => setTransferManager(e.target.value)}
                                                            readOnly
                                                        />
                                                    </Form.Group>
                                                </Col>

                                                <Col xs={12} md={1}>
                                                    <Form.Group className="mb-3" controlId="formHomRefCommissionPercentage">
                                                        <Form.Control
                                                            type="text"
                                                            className="convert_to_lead_input_field input_field_input_field"
                                                            placeholder="(%)"
                                                            value={homRefCommissionPercentage || ''}
                                                            onChange={handleHomRefCommissionPercentageChange} // Use the new handler here
                                                        />
                                                    </Form.Group>
                                                </Col>

                                                <Col xs={12} md={2}>
                                                    <Form.Group className="mb-3" controlId="formHomRefCommission">
                                                        <Form.Control
                                                            type="text"
                                                            className="convert_to_lead_input_field input_field_input_field"
                                                            placeholder="Commission Value"
                                                            value={homRefCommission || ''}
                                                            onChange={handleHomRefCommissionValueChange} // Use the new handler here
                                                        />
                                                    </Form.Group>
                                                </Col>
                                            </Row>
                                        </Card>
                                    </>
                                }
                            </div>

                            {/* Lead Cards */}
                            {deal?.lead_type?.name !== "Others" && (
                                <Card className='convertToLead_card mt-2 input_field_input_field'>
                                    {deal && deal?.lead_type && (
                                        <>
                                            {deal?.lead_type?.name !== "Others" && (
                                                <h5 className="heading_tag mutual_class_color">
                                                    {`${deal?.lead_type?.name} Team`}
                                                </h5>
                                            )}
                                            <Row>
                                                {deal?.lead_type?.name === 'Marketing' && (
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
                                                                    value={selectedMarketingManager}
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
                                                                    value={selectedMarketingAgent}
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
                                                                    value={selectedMarketingManagerOne}
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
                                                                    value={selectedMarketingAgentOne}
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
                                                                    value={selectedItManager}
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
                                                                    value={developer}
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
                                                                />
                                                            </Form.Group>
                                                        </Col>
                                                        {/*  */}

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
                                                                    value={developerOne}
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
                                                                />
                                                            </Form.Group>
                                                        </Col>
                                                        {/*  */}

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
                                                                    value={developerTwo}
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
                                                                    value={selectedtelesalesTeamLeader}
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
                                                                    value={selectedtelesalesAgent}
                                                                    isClearable
                                                                    onChange={handleTelesalesAgentChange}
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
                        onClick={() => setEditModal(false)}
                    >
                        {rtl === 'true' ? 'إغلاق' : 'Close'}
                    </Button>
                    <Button
                        className='all_common_btn_single_lead'
                        onClick={handleSubmit}
                    >
                        {rtl === 'true' ? 'إنشاء العقد' : 'Update Contract'}
                    </Button>
                </Modal.Footer>

            </Modal>

        </div>
    )
}
export default EditDeal