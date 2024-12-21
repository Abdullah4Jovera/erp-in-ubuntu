const mongoose = require('mongoose');
const { Schema } = mongoose;
const serviceCommissionSchema = new Schema({
    contract_id: {
        type: Schema.Types.ObjectId,
        ref: 'Contract',
        required: false
    },
    finance_amount: {
        type: Number,
    },
    bank_commission: {
        type: Number,
    },
    customer_commission: {
        type: Number,
    },
    with_vat_commission: {
        type: Number,
    },
    without_vat_commission: {
        type: Number,
    },
    hod: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
    hod_commission_percentage: {
        type: Number,
    },
    hod_commission_amount: {
        type: Number,
    },

    hom: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
    hom_commission_percentage: {
        type: Number,
    },
    hom_commission_amount: {
        type: Number,
    },



    sale_manager: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
    sale_manager_commission_percentage: {
        type: Number,
    },
    sale_manager_commission_amount: {
        type: Number,
    },
        //// New Fields 
    ajman_manager :{
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
    ajman_manager_commission_percentage: {
        type: Number,
    },
    ajman_manager_commission_amount: {
        type: Number,
    },
    ajman_coordinator :{
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
    ajman_coordinator_commission_percentage: {
        type: Number,
    },
    ajman_coordinator_commission_amount: {
        type: Number,
    },
    ajman_team_leader :{
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
    ajman_team_leader_commission_percentage: {
        type: Number,
    },
    ajman_team_leader_commission_amount: {
        type: Number,
    },

    dubai_manager :{
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
    dubai_manager_commission_percentage: {
        type: Number,
    },
    dubai_manager_commission_amount: {
        type: Number,
    },
    dubai_coordinator :{
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
    dubai_coordinator_commission_percentage: {
        type: Number,
    },
    dubai_coordinator_commission_amount: {
        type: Number,
    },
    dubaiteam_leader :{
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
    dubaiteam_leader_commission_percentage: {
        type: Number,
    },
    dubaiteam_leader_commission_amount: {
        type: Number,
    },

    dubaisale_agent :{
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
    dubaiteam_sale_agent_percentage: {
        type: Number, 
    },
    dubaiteam_sale_agent_amount: {
        type: Number,
    },

    ajman_sale_agent :{
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
    ajman_sale_agent_percentage: {
        type: Number,
    },
    ajman_sale_agent_amount: {
        type: Number,
    },

    /////
    coordinator: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
    coordinator_commission_percentage: {
        type: Number,
    },
    coordinator_commission_amount: {
        type: Number,
    },
    team_leader: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
    team_leader_commission_percentage: {
        type: Number,
    },
    team_leader_commission_amount: {
        type: Number,
    },
    sales_agent: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    sales_agent_commission_percentage: {
        type: Number,
        default: "0"
    },
    sales_agent_commission_amount: {
        type: Number,
        default: "0"
    },
    team_leader_one: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    team_leader_one_commission_percentage: {
        type: Number,
        default: "0"
    },
    team_leader_one_commission_amount: {
        type: Number,
        default: "0"
    },
    sales_agent_one: {
        type: Schema.Types.ObjectId, 
        ref: 'User',
        default: null
    },  
    sales_agent_one_commission_percentage: {
        type: Number,
        default: "0"
    },
    sales_agent_one_commission_amount: {
        type: Number,
        default: "0"
    },
    // sales_agent_two: {
    //     type: Schema.Types.ObjectId,
    //     ref: 'User',
    //     default: null
    // },
    // sales_agent_two_commission_percentage: {
    //     type: Number,
    //     default: "0"
    // },
    // sales_agent_two_commission_amount: {
    //     type: Number,
    //     default: "0"
    // },
    ////////

    ref_hod: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    ref_hod_commission_percentage: {
        type: Number,
        default: "0"
    },
    ref_hod_commission_amount: {
        type: Number,
        default: "0"
    },


    ref_manager: {
        type: Schema.Types.ObjectId, 
        ref: 'User',
        default: null
    },
    ref_manager_commission_percentage: {
        type: Number,
        default: "0"
    },
    ref_manager_commission_amount: {
        type: Number,
        default: "0"
    },
    ref_hom: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    ref_hom_commission_percentage: {
        type: Number,
        default: "0"
    },
    ref_hom_commission_amount: {
        type: Number,
        default: "0"
    },
    ts_hod: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    ts_hod_commision_percentage: {
        type: Number,
        default: "0"
    },
    ts_hod_commision_amount: {
        type: Number,
        default: "0"
    },
    ts_team_leader: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    ts_team_leader_commission_percentage: {
        type: Number,
        default: "0"
    },
    ts_team_leader_commission_amount: {
        type: Number,
        default: "0"
    },
    ts_agent: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    tsagent_commission_percentage: {
        type: Number, 
        default: "0"
    },
    tsagent_commission_amount: {
        type: Number, 
        default: "0"
    },
   
    ///////New fields
    marketing_one: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    marketing_one_commission_percentage: {
        type: Number,
        default: "0"
    },
    marketing_one_commission_amount: {
        type: Number,
        default: "0"
    },
    marketing_two: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    marketing_two_commission_percentage: {
        type: Number,
        default: "0"
    },
    marketing_two_commission_amount: {
        type: Number,
        default: "0"
    },
    marketing_three: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    marketing_three_commission_percentage: {
        type: Number,
        default: "0"
    },
    marketing_three_commission_amount: {
        type: Number,
        default: "0"
    },
    marketing_four: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    marketing_four_commission_percentage: {
        type: Number,
        default: "0"
    },
    marketing_four_commission_amount: {
        type: Number,
        default: "0"
    },
    developer_one: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    developer_one_commission_percentage: {
        type: Number,
        default: "0"
    },
    developer_one_commission_amount: {
        type: Number,
        default: "0"
    },
    developer_two: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    developer_two_commission_percentage: {
        type: Number,
        default: "0"
    },
    developer_two_commission_amount: {
        type: Number,
        default: "0"
    },
    developerthree: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    developer_three_commission_percentage: {
        type: Number,
        default: "0"
    },
    developer_three_commission_amount: {
        type: Number,
        default: "0"
    },
    developer_four: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    developer_four_commission_percentage: {
        type: Number,
        default: "0"
    },
    developer_four_commission_amount: {
        type: Number,
        default: "0"
    },

    broker_name: {
        type: String,
        default: null
    },
    broker_name_commission_percentage: {
        type: Number,
        default: "0"
    },
    broker_name_commission_amount: {
        type: Number,
        default: "0"
    },
    


    lead_created_by: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    lead_created_by_commission_percentage: {
        type: Number,
        default: "0"
    },
    lead_created_by_commission_amount: {
        type: Number,
        default: "0"
    },


    created_by: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },


    created_at: {
        type: Date,
        default: Date.now
    },
    updated_at: { 
        type: Date,
        default: Date.now
    },
    delstatus: { type: Boolean, default: false },

}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

module.exports = mongoose.model('ServiceCommission', serviceCommissionSchema);
