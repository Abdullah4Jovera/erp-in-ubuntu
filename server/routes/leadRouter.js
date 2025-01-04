const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();
const Lead = require('../models/leadModel');
const { isAuth, hasRole } = require('../utils');
const Client = require('../models/clientModel');
const bcrypt = require('bcrypt');
const User = require('../models/userModel');
const ProductStage = require('../models/productStageModel');
const leadDiscussionModel = require('../models/leadDiscussionModel');
const multer = require('multer');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');
const File = require('../models/fileModel');
const serviceCommissionModel = require('../models/serviceCommissionModel');
const Contract = require('../models/contractModel');
const ActivityLog = require('../models/activityLogModel');
const LeadType = require('../models/leadTypeModel');
const Pipeline = require('../models/pipelineModel');
const Source = require('../models/sourceModel');
const Product = require('../models/productModel');
const Branch = require('../models/branchModel');
const Notification = require('../models/notificationModel');
const { getIO } = require('../socket');
const twilio = require('twilio');
const Phonebook = require('../models/phonebookModel.js')
const accountSid = 'AC48e99fa5d2a4ecdd660e8f5391e375ed';
const authToken = '8d6ad3c2eb9063995cea53598eec5d93';
const client = twilio(accountSid, authToken);
const fromWhatsAppNumber = 'whatsapp:+14155238886';
const axios = require('axios');
const hasPermission = require('../hasPermission.js');
const contractStageModel = require('../models/contractStageModel.js');
const ContractActivityLog = require('../models/ContractActivityLogModel.js');
const DealActivityLog = require('../models/dealActivityLogModel.js');
const dealModel = require('../models/dealModel.js');
// GET leads for CEO with specific criteria (lead type: Marketing, product: Mortgage Loan, and no pipeline)
router.get('/ceo-lead', isAuth, async (req, res) => {
    try {
        // Fetch the "Marketing" lead type
        const marketingLeadType = await LeadType.findOne({ name: 'Marketing' });
        if (!marketingLeadType) {
            return res.status(404).json({ message: 'Lead type "Marketing" not found' });
        }

        // Fetch the "Mortgage Loan" product
        const mortgageLoanProduct = await Product.findOne({ name: 'Mortgage Loan' });
        if (!mortgageLoanProduct) {
            return res.status(404).json({ message: 'Product "Mortgage Loan" not found' });
        }

        // Fetch leads that match the criteria: lead type = Marketing, product = Mortgage Loan, and pipeline_id is null
        const leads = await Lead.find({
            lead_type: marketingLeadType._id,
            products: mortgageLoanProduct._id,
            pipeline_id: null,

        })
            .populate('pipeline_id', 'name')
            .populate('stage', 'name')
            .populate('lead_type', 'name')
            .populate({
                path: 'source',
                populate: {
                    path: 'lead_type_id',
                    select: 'name created_by'
                }
            })
            .populate('created_by', 'name email')
            .populate('client', 'name email phone')
            // .populate({
            //     path: 'selected_users',
            //     select: 'name role image',
            // })
            .populate({
                path: 'activity_logs',
                populate: {
                    path: 'user_id',
                    select: 'name email'
                }
            })
            .populate({
                path: 'stage',
                populate: {
                    path: 'pipeline_id',
                    select: 'name created_by'
                }
            })
            .populate({
                path: 'product_stage',
                populate: {
                    path: 'product_id',
                    select: 'name'
                }
            })

            .populate({
                path: 'products',
                populate: {
                    path: 'pipeline_id',
                    select: 'name'
                }
            })


        res.status(200).json(leads);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});
router.get('/get-leads/:productId/branch/:branchId', isAuth, hasPermission(['view_lead']), async (req, res) => {
    try {
        const { productId, branchId } = req.params; // Get productId and branchId from URL params
        const userId = req.user._id; // Authenticated user's ID from isAuth middleware
        const userPipeline = req.user.pipeline; // User's pipeline array from JWT token

        // Validate if the product exists
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Validate if the branch exists
        const branch = await Branch.findById(branchId);
        if (!branch) {
            return res.status(404).json({ message: 'Branch not found' });
        }

        // Build query filters dynamically
        const leadFilters = {
            products: productId,
            branch: branchId,
            selected_users: userId,
            is_converted: false,
            is_reject: false,
        };

        // If userPipeline is not empty, filter leads by pipeline IDs
        if (userPipeline && userPipeline.length > 0) {
            leadFilters.pipeline_id = { $in: userPipeline };
        }

        // Fetch leads with the dynamic filters
        const leads = await Lead.find(leadFilters)
            .populate('pipeline_id', 'name')
            .populate('stage', 'name')
            .populate('lead_type', 'name')
            .populate({
                path: 'discussions',
                select: 'comment created_at',
                populate: {
                    path: 'created_by',
                    select: 'name',
                },
            })
            .populate({
                path: 'source',
                populate: {
                    path: 'lead_type_id',
                    select: 'name created_by',
                },
            })
            .populate('created_by', 'name email')
            .populate('client', 'name email phone')
            .populate({
                path: 'selected_users',
                match: { role: { $nin: ['HOD', 'CEO', 'MD', 'Super Admin', 'Developer', 'Marketing'] } },
                select: 'name role image',
            })
            .populate({
                path: 'activity_logs',
                populate: {
                    path: 'user_id',
                    select: 'name email',
                },
            })
            .populate({
                path: 'stage',
                populate: {
                    path: 'pipeline_id',
                    select: 'name created_by',
                },
            })
            .populate({
                path: 'transfer_from.pipeline',
                select: 'name',
            })
            .populate({
                path: 'transfer_from.branch',
                select: 'name',
            })
            .populate({
                path: 'transfer_from.product_stage',
                select: 'name',
            })
            .populate({
                path: 'transfer_from.products',
                select: 'name',
            })
            .populate({
                path: 'product_stage',
                populate: {
                    path: 'product_id',
                    select: 'name',
                },
            })
            .populate({
                path: 'labels',
                select: 'name color',
            })
            .populate('products', 'name')
            .populate({
                path: 'messages',
                match: { read: false },
                select: 'read message_body',
            });

        res.status(200).json(leads);
    } catch (error) {
        console.error('Error fetching leads:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});
router.get('/search-leads', isAuth, async (req, res) => {
    try {
        const {
            userId, // Filter by userId
            pipeline, // Filter by pipeline
            created_at_start,
            created_at_end,
            lead_type, // Filter by lead type
            source, // Filter by source
            client, // Filter by client
            products, // Filter by products
            branch, // Filter by branch
        } = req.query;

        const user = req.user; // Authenticated user from isAuth middleware
        const authenticatedUserId = user._id;

        // Initialize the query object
        const query = {
            is_converted: false,
            is_reject: false,
            selected_users: authenticatedUserId, // Ensure lead's selected_users includes the authenticated user
        };

        // Filter by userId if provided
        if (userId) {
            query.selected_users = new mongoose.Types.ObjectId(String(userId));
        }

        // Filter by pipeline if provided or restrict by the user's pipeline array
        if (pipeline) {
            query.pipeline_id = new mongoose.Types.ObjectId(String(pipeline));
        }

        // Filter by lead type
        if (lead_type) {
            query.lead_type = new mongoose.Types.ObjectId(String(lead_type));
        }

        // Filter by source
        if (source) {
            query.source = new mongoose.Types.ObjectId(String(source));
        }

        // Filter by client
        if (client) {
            query.client = new mongoose.Types.ObjectId(String(client));
        }

        // Filter by branch
        if (branch) {
            query.branch = new mongoose.Types.ObjectId(String(branch));
        }

        // Date range filtering for created_at
        if (created_at_start || created_at_end) {
            const createdAtFilter = {};
            if (created_at_start) createdAtFilter.$gte = new Date(created_at_start);
            if (created_at_end) createdAtFilter.$lte = new Date(created_at_end);
            query.created_at = createdAtFilter;
        }

        // Filter by products
        if (products) {
            query.products = {
                $in: products.split(',').map(id => new mongoose.Types.ObjectId(String(id))),
            };
        }

        // Fetch total leads matching the query
        const totalLeads = await Lead.countDocuments(query);



        // Fetch leads with population
        const leads = await Lead.find(query)

            .populate('branch', 'name') // Populate branch
            .populate('pipeline_id', 'name') // Populate pipeline
            .populate('stage', 'name') // Populate stage
            .populate('lead_type', 'name') // Populate lead type
            .populate({
                path: 'discussions',
                select: 'comment created_at',
                populate: {
                    path: 'created_by',
                    select: 'name image',
                },
            })
            .populate({
                path: 'source',
                populate: {
                    path: 'lead_type_id',
                    select: 'name ',
                },
            })
            .populate('created_by', 'name email') // Populate created_by
            .populate('client', 'name email phone') // Populate client
            .populate('selected_users', 'name role image') // Populate selected_users
            .populate({
                path: 'activity_logs',
                populate: {
                    path: 'user_id',
                    select: 'name email',
                },
            })
            .populate({
                path: 'files',
                select: 'file_name file_path created_at updated_at',
            })
            .populate({
                path: 'stage',
                populate: {
                    path: 'pipeline_id',
                    select: 'name created_by',
                },
            })
            .populate({
                path: 'transfer_from.pipeline',
                select: 'name',
            })
            .populate({
                path: 'transfer_from.branch',
                select: 'name',
            })
            .populate({
                path: 'transfer_from.product_stage',
                select: 'name',
            })
            .populate({
                path: 'transfer_from.products',
                select: 'name',
            })
            .populate({
                path: 'product_stage',
                populate: {
                    path: 'product_id',
                    select: 'name',
                },
            })
            .populate({
                path: 'labels',
                select: 'name color',
            })
            .populate('products', 'name')
            .populate({
                path: 'messages',
                match: { read: false },
                select: 'read message_body',
            });

        // Format file paths in leads
        leads.forEach(lead => {
            if (lead.files) {
                lead.files.forEach(file => {
                    file.file_path = `${file.file_path}`;
                });
            }
        });

        // Respond with leads and total count
        res.status(200).json({
            leads,
            total: totalLeads,
        });
    } catch (error) {
        console.error('Error searching leads:', error);
        res.status(500).json({ message: 'Error searching leads', error: error.message });
    }
});
// Route to send WhatsApp message (optional, if you want to keep it separate)
router.post('/send-sms', async (req, res) => {
    const { to, message } = req.body; // Get the recipient's phone number and the message from the request body

    // Ensure the recipient's phone number is formatted for WhatsApp
    const formattedTo = `whatsapp:${to}`;

    try {
        // Send WhatsApp message
        const sms = await client.messages.create({
            body: message,
            from: fromWhatsAppNumber, // Twilio WhatsApp number
            to: formattedTo // Recipient's WhatsApp number
        });

        // Respond with the message SID and a success message
        res.status(200).json({
            message: 'WhatsApp message sent successfully',
            sid: sms.sid
        });
    } catch (error) {
        console.error('Error sending WhatsApp message:', error);
        res.status(500).json({ message: 'Failed to send WhatsApp message', error: error.message });
    }
});
router.post('/create-lead', isAuth, hasPermission(['create_lead']), async (req, res) => {
    try {
        let {
            clientPhone,
            clientw_phone, // WhatsApp phone
            clientName,
            clientEmail,
            cliente_id,
            company_Name,
            product_stage,
            lead_type,
            pipeline,
            products,
            source,
            description,
            branch,
            thirdpartyname // New field to be added
        } = req.body;

        if (!product_stage) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const formatPhoneNumber = (phone) => {
            if (!phone) return null;
            const cleanedPhone = phone.replace(/\s+/g, '');
            return cleanedPhone.startsWith('+971') ? cleanedPhone : `+971${cleanedPhone}`;
        };

        clientPhone = formatPhoneNumber(clientPhone);
        clientw_phone = formatPhoneNumber(clientw_phone || clientPhone);

        const branchId = new mongoose.Types.ObjectId(String(branch));
        const productStageId = new mongoose.Types.ObjectId(String(product_stage));
        const pipelineId = new mongoose.Types.ObjectId(String(pipeline));
        const productId = new mongoose.Types.ObjectId(String(products));

        const validProductStage = await ProductStage.findById(productStageId);
        if (!validProductStage) {
            return res.status(400).json({ message: 'Invalid product stage' });
        }

        const phonebookEntry = await Phonebook.findOne({ number: clientPhone }).populate('comments');
        if (phonebookEntry) {
            lead_type = '673b190186706b218f6f327f';
            source = '673b190186706b218f6f3282';

            if (phonebookEntry.status === "BLOCKED") {
                req.body.is_blocklist_number = true;
            }
        } else {
            lead_type = req.body.lead_type;
            source = req.body.source;
        }

        const leadTypeId = new mongoose.Types.ObjectId(String(lead_type));
        const sourceId = new mongoose.Types.ObjectId(String(source));

        const validLeadType = await LeadType.findById(leadTypeId);
        if (!validLeadType) {
            return res.status(400).json({ message: 'Invalid lead type' });
        }

        let client = await Client.findOne({ phone: clientPhone });
        if (client) {
            const existingLeads = await Lead.findOne({ client: client._id });
            if (existingLeads) {
                return res.status(400).json({ message: 'Lead already exists for this client.' });
            }
        }

        if (!client) {
            const defaultPassword = '123';
            const hashedPassword = await bcrypt.hash(defaultPassword, 10);
            client = new Client({
                phone: clientPhone,
                w_phone: clientw_phone,
                e_id: cliente_id,
                name: clientName || '',
                email: clientEmail || '',
                password: hashedPassword,
            });
            await client.save();
        }

        const initialSelectedUsers = req.body.selected_users || [];
        const initialUserIds = initialSelectedUsers
            .filter(user => user && user._id)  // Filter out invalid or undefined users
            .map(user => user._id.toString()); // Now safely call toString()

        let allSelectedUserIds = [...initialUserIds, req.user._id.toString()];

        const ceoUsers = await User.find({ role: 'CEO' }).select('_id name');
        const superadminUsers = await User.find({ role: 'Super Admin' }).select('_id name');
        const mdUsers = await User.find({ role: 'MD' }).select('_id name');
        const managerUsers = await User.find({
            $or: [
                { role: 'Manager', branch: branchId, pipeline: pipelineId },
                // { role: 'Manager', branch: null, pipeline: pipelineId }
            ]
        }).select('_id name');
        const hodUsers = await User.find({ role: 'HOD', products: productId }).select('_id name');
        const homUsers = await User.find({ role: 'HOM', products: productId }).select('_id name');


        allSelectedUserIds = [
            ...allSelectedUserIds,
            ...ceoUsers.map(user => user._id.toString()),
            ...superadminUsers.map(user => user._id.toString()),
            ...mdUsers.map(user => user._id.toString()),
            ...hodUsers.map(user => user._id.toString()),
            ...homUsers.map(user => user._id.toString()),
            ...managerUsers.map(user => user._id.toString())
        ];

        if (validLeadType.name === 'Marketing') {
            const marketingUsers = await User.find({ role: 'Marketing' }).select('_id name');
            const developerUsers = await User.find({ role: 'Developer' }).select('_id name');
            allSelectedUserIds.push(...marketingUsers.map(user => user._id.toString()));
            allSelectedUserIds.push(...developerUsers.map(user => user._id.toString()));
        }

        const uniqueUserIds = [...new Set(allSelectedUserIds)];

        const newLead = new Lead({
            client: client._id,
            clientName,
            product_stage: productStageId,
            lead_type: leadTypeId,
            pipeline_id: pipelineId,
            source: sourceId,
            products: productId,
            description,
            branch: branchId,
            selected_users: uniqueUserIds,
            company_Name,
            created_by: req.user._id,
            is_blocklist_number: req.body.is_blocklist_number || false,
            phonebookcomments: phonebookEntry ? phonebookEntry.comments.map(comment => comment._id) : [],
            thirdpartyname: thirdpartyname || null
        });

        const savedLead = await newLead.save();

        if (phonebookEntry) {
            phonebookEntry.calstatus = 'Convert to Lead';
            phonebookEntry.lead_id = savedLead._id;
            await phonebookEntry.save();
        }

        const message = 'Thanks for registering';
        const formattedTo = client.w_phone || clientPhone;

        try {
            await axios.post('http://192.168.2.137:4000/api/leads/send-sms', {
                to: formattedTo,
                message: message
            });
        } catch (smsError) {
            console.error('Error sending SMS:', smsError);
        }

        const activityLog = new ActivityLog({
            lead_id: savedLead._id,
            log_type: 'Create Lead',
            remark: `Lead created by ${req.user.name || req.user.email} for client ${client.name || client.phone}`,
            user_id: req.user._id,
            created_at: new Date()
        });
        await activityLog.save();
        savedLead.activity_logs.push(activityLog._id);
        await savedLead.save();

        return res.status(201).json(savedLead);
    } catch (error) {
        console.error('Error creating lead:', error);
        return res.status(500).json({ message: 'Error creating lead', error: error.message });
    }
});
router.post('/create-lead-for-phone-book', isAuth, hasPermission(['create_lead']), async (req, res) => {
    try {
        let {
            clientPhone,
            clientw_phone, // WhatsApp phone
            clientName,
            clientEmail,
            cliente_id,
            company_Name,
            product_stage,
            lead_type,
            pipeline,
            products,
            source,
            description,
            branch,
            thirdpartyname // New field to be added
        } = req.body;

        // Check for missing required fields
        if (!product_stage || !lead_type || !source) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        // Format clientPhone and clientw_phone
        const formatPhoneNumber = (phone) => {
            if (!phone) return null;
            const cleanedPhone = phone.replace(/\s+/g, ''); // Remove spaces
            return cleanedPhone.startsWith('+971') ? cleanedPhone : `+971${cleanedPhone}`;
        };

        clientPhone = formatPhoneNumber(clientPhone);
        clientw_phone = formatPhoneNumber(clientw_phone || clientPhone); // Default WhatsApp to clientPhone if not provided

        const branchId = new mongoose.Types.ObjectId(String(branch));
        const productStageId = new mongoose.Types.ObjectId(String(product_stage));
        let leadTypeId = new mongoose.Types.ObjectId(String(lead_type));
        const pipelineId = new mongoose.Types.ObjectId(String(pipeline));
        let sourceId = new mongoose.Types.ObjectId(String(source));
        const productId = new mongoose.Types.ObjectId(String(products));

        // Validate product_stage and lead_type
        const validProductStage = await ProductStage.findById(productStageId);
        const validLeadType = await LeadType.findById(leadTypeId);
        if (!validProductStage || !validLeadType) {
            return res.status(400).json({ message: 'Invalid product stage or lead type' });
        }

        // Check if client already exists in Client collection
        let client = await Client.findOne({ phone: clientPhone });
        if (client) {
            const existingLeads = await Lead.findOne({ client: client._id });
            if (existingLeads) {
                return res.status(400).json({ message: 'Lead already exists for this client.' });
            }
        }

        // If client doesn't exist, create a new client
        if (!client) {
            const defaultPassword = '123';
            const hashedPassword = await bcrypt.hash(defaultPassword, 10);
            client = new Client({
                phone: clientPhone,
                w_phone: clientw_phone,
                e_id: cliente_id,
                name: clientName || '',
                email: clientEmail || '',
                password: hashedPassword,
            });
            await client.save();
        }

        // Get selected_users and unique user IDs
        const initialSelectedUsers = req.body.selected_users || [];
        const initialUserIds = initialSelectedUsers.map(user => user._id.toString());
        let allSelectedUserIds = [...initialUserIds, req.user._id.toString()];

        // Filter users by role and branch
        const ceoUsers = await User.find({ role: 'CEO' }).select('_id name');
        const superadminUsers = await User.find({ role: 'superadmin' }).select('_id name');
        const mdUsers = await User.find({ role: 'MD' }).select('_id name');
        const managerUsers = await User.find({
            $or: [
                { role: 'Manager', branch: branchId, pipeline: pipelineId },
                { role: 'Manager', branch: null, pipeline: pipelineId }
            ]
        }).select('_id name');
        const hodUsers = await User.find({ role: 'HOD', pipeline: pipelineId }).select('_id name');

        allSelectedUserIds = [
            ...allSelectedUserIds,
            ...ceoUsers.map(user => user._id.toString()),
            ...superadminUsers.map(user => user._id.toString()),
            ...mdUsers.map(user => user._id.toString()),
            ...hodUsers.map(user => user._id.toString()),
            ...managerUsers.map(user => user._id.toString())
        ];

        if (validLeadType.name === 'Marketing') {
            const marketingUsers = await User.find({ role: 'Marketing' }).select('_id name');
            const developerUsers = await User.find({ role: 'Developer' }).select('_id name');
            allSelectedUserIds.push(...marketingUsers.map(user => user._id.toString()));
            allSelectedUserIds.push(...developerUsers.map(user => user._id.toString()));
        }

        const uniqueUserIds = [...new Set(allSelectedUserIds)];

        // Create a new lead
        const newLead = new Lead({
            client: client._id,
            clientName,
            product_stage: productStageId,
            lead_type: leadTypeId,
            pipeline_id: pipelineId,
            source: sourceId,
            products: productId,
            description,
            branch: branchId,
            selected_users: uniqueUserIds,
            company_Name,
            created_by: req.user._id
        });

        const savedLead = await newLead.save();

        // Find matching phone number in Phonebook and update lead_id
        await Phonebook.findOneAndUpdate(
            { number: clientPhone },
            { lead_id: savedLead._id },
            { new: true }
        );

        // Send SMS to client
        const message = 'Thanks for registering';
        const formattedTo = client.w_phone || clientPhone;
        try {
            await axios.post('http://192.168.2.137:4000/api/leads/send-sms', {
                to: formattedTo,
                message: message
            });
        } catch (smsError) {
            console.error('Error sending SMS:', smsError);
        }

        // Log activity for new lead creation
        const activityLog = new ActivityLog({
            lead_id: savedLead._id,
            log_type: 'Lead Created',
            remark: `Lead created by ${req.user.name || req.user.email} for client ${client.name || client.phone}`,
            user_id: req.user._id,
            created_at: new Date()
        });
        await activityLog.save();
        savedLead.activity_logs.push(activityLog._id);
        await savedLead.save();

        return res.status(201).json(savedLead);
    } catch (error) {
        console.error('Error creating lead:', error);
        return res.status(500).json({ message: 'Error creating lead', error: error.message });
    }
});
// Helper function to validate and convert strings to ObjectIds
const convertToObjectId = id => {
    if (id && mongoose.isValidObjectId(id)) {
        return new mongoose.Types.ObjectId(String(id));
    } else {
        return null;
    }
};
// New route to get leads based on products and filter by unassigned Sales users 
router.get('/unassigned-leads/:productId', isAuth, hasPermission(['unassigned_lead']), async (req, res) => {
    try {
        const { productId } = req.params; // Extract productId from route params
        const UserId = req.user._id;
        // Validate productId
        const productObjectId = convertToObjectId(productId);
        if (!productObjectId) {
            return res.status(400).json({ message: 'Invalid product ID' });
        }

        // Fetch all leads with the specific product and filter unassigned Sales and Team Leaders
        const unassignedLeads = await Lead.find({ products: productObjectId, is_reject: false, selected_users: UserId })
            .populate('pipeline_id', 'name') // Populate pipeline name
            .populate('product_stage', 'name') // Populate product stage
            .populate('lead_type', 'name') // Populate lead type
            .populate('source', 'name') // Populate source
            .populate('products', 'name') // Populate products
            .populate('branch') // Populate branch
            .populate('client', 'name phone') // Populate client
            .populate('created_by', 'name email') // Populate the creator's name and email
            .populate({
                path: 'selected_users',
                select: 'name role',
                model: 'User',
            });

        // Filter leads where both "Sales" and "Team Leader" roles are not present in selected_users
        const leadsWithoutSalesOrTeamLeaders = unassignedLeads.filter(lead => {
            const hasSales = lead.selected_users.some(user => user.role === 'Sales');
            const hasTeamLeader = lead.selected_users.some(user => user.role === 'Team Leader');

            // Return lead only if neither Sales nor Team Leader is present
            return !hasSales && !hasTeamLeader;
        });

        if (leadsWithoutSalesOrTeamLeaders.length === 0) {
            return res.status(404).json({ message: 'No unassigned leads found for the selected product' });
        }

        res.status(200).json({
            message: 'Unassigned leads fetched successfully',
            leads: leadsWithoutSalesOrTeamLeaders
        });
    } catch (error) {
        console.error('Error fetching unassigned leads:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
router.get('/unassigned-leads-for-team-leadser/:productId', isAuth, hasPermission(['unassigned_lead']), async (req, res) => {
    try {
        const { productId } = req.params; // Extract productId from route params
        const UserId = req.user._id;
        // Validate productId
        const productObjectId = convertToObjectId(productId);
        if (!productObjectId) {
            return res.status(400).json({ message: 'Invalid product ID' });
        }

        // Fetch all leads with the specific product and filter unassigned Sales and Team Leaders
        const unassignedLeads = await Lead.find({ products: productObjectId, is_reject: false, selected_users: UserId, })
            .populate('pipeline_id', 'name') // Populate pipeline name
            .populate('product_stage', 'name') // Populate product stage
            .populate('lead_type', 'name') // Populate lead type
            .populate('source', 'name') // Populate source
            .populate('products', 'name') // Populate products
            .populate('branch') // Populate branch
            .populate('client', 'name phone') // Populate client
            .populate('created_by', 'name email') // Populate the creator's name and email
            .populate({
                path: 'selected_users',
                select: 'name role',
                model: 'User',
            });

        // Filter leads where none of the selected users have the roles "Sales" or "Team Leader"
        const leadsWithoutSalesOrTeamLeaders = unassignedLeads.filter(lead => {
            const relevantUsers = lead.selected_users.filter(
                user => user.role === 'Sales'
            );
            return relevantUsers.length === 0; // Only return leads with no "Sales" or "Team Leader" users
        });

        if (leadsWithoutSalesOrTeamLeaders.length === 0) {
            return res.status(404).json({ message: 'No unassigned leads found for the selected product' });
        }

        res.status(200).json({
            message: 'Unassigned leads fetched successfully',
            leads: leadsWithoutSalesOrTeamLeaders
        });
    } catch (error) {
        console.error('Error fetching unassigned leads:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
// New route to get all leads with a pipeline name "CEO"
// router.get('/leads-ceo-pipeline', isAuth, async (req, res) => {
//     try {
//         // Find the pipeline with the name "CEO"
//         const ceoPipeline = await Pipeline.findOne({ name: 'CEO' });

//         if (!ceoPipeline) {
//             return res.status(404).json({ message: 'CEO pipeline not found' });
//         }

//         // Find all leads with the CEO pipeline ID and populate all necessary fields
//         const leads = await Lead.find({ pipeline_id: ceoPipeline._id })
//             .populate('pipeline_id')  // Populate pipeline name
//             .populate('product_stage')  // Populate product stage
//             .populate('lead_type')  // Populate lead type
//             .populate('source')  // Populate source
//             .populate('products')  // Populate products
//             .populate('branch')  // Populate branch
//             .populate('client', 'name')  // Populate client
//             .populate('created_by', 'name email')  // Populate the creator's name and email
//             .populate('selected_users', 'name email');  // Populate the selected users' names and emails

//         if (leads.length === 0) {
//             return res.status(404).json({ message: 'No leads found for the CEO pipeline' });
//         }

//         res.status(200).json({ message: 'Leads fetched successfully', leads });
//     } catch (error) {
//         console.error('Error fetching leads with CEO pipeline:', error);
//         res.status(500).json({ message: 'Server error' });
//     }
// });
router.put('/edit-labels/:leadId', isAuth, hasPermission(['lead_labels']), async (req, res) => {
    try {
        const { leadId } = req.params;
        const { labels } = req.body; // Expecting an array of label IDs or an empty array

        // Validate leadId and convert to ObjectId
        const leadObjectId = convertToObjectId(leadId);
        if (!leadObjectId) {
            return res.status(400).json({ message: 'Invalid lead ID' });
        }

        // If labels is undefined or not an array, default to an empty array (clear labels)
        const labelArray = Array.isArray(labels) ? labels : [];

        // Ensure all labels are valid ObjectIds
        const validLabelIds = labelArray.map(label => convertToObjectId(label)).filter(id => id !== null);

        // Update the lead by setting the labels field to the new validLabelIds array (empty if none provided)
        const updatedLead = await Lead.findByIdAndUpdate(
            leadObjectId,
            { $set: { labels: validLabelIds } }, // Set the labels field to the new array or empty array
            { new: true }
        ).populate('labels', 'name'); // Assuming Label has a 'name' field

        if (!updatedLead) {
            return res.status(404).json({ message: 'Lead not found' });
        }

        res.status(200).json({ message: 'Labels updated successfully', lead: updatedLead });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});
// Route to get all leads that are not rejected (is_reject: false)
router.get('/rejected-leads', isAuth, async (req, res) => {
    try {
        const userId = req.user._id;
        const userPipeline = req.user.pipeline || []; // Ensure pipeline is an array even if undefined

        // Build the query condition
        const query = { is_reject: true, selected_users: userId };

        // If userPipeline is not empty, add it to the query condition
        if (userPipeline.length > 0) {
            query.pipeline_id = { $in: userPipeline }; // Match pipelines in the user's pipeline array
        }

        const leads = await Lead.find(query)
            .populate({
                path: 'pipeline_id',
                select: 'name'
            })
            .populate({
                path: 'product_stage',
                select: 'name'
            })
            .populate({
                path: 'products',
                select: 'name'
            })
            .populate({
                path: 'client',
                select: 'name phone'
            })
            .populate({
                path: 'branch',
                select: 'name'
            })
            .select('_id pipeline_id products product_stage client branch reject_reason company_Name'); // Ensure company_Name is selected

        if (leads.length === 0) {
            return res.status(404).json({ message: 'No rejected leads found' });
        }

        // Map through leads to create an array of detailed lead objects
        const leadDetails = leads.map(lead => ({
            id: lead._id,
            pipelineName: lead.pipeline_id?.name || null,
            productStage: lead.product_stage?.name || null,
            productId: lead.products._id || null,
            productName: lead.products?.name || null,
            clientName: lead.client?.name || null,
            branchName: lead.branch?.name || null,
            companyName: lead.company_Name || null, // Ensure company_Name is mapped here
            reject_reason: lead.reject_reason || null,
            phone: lead.client?.phone || null,
        }));

        res.status(200).json({ leadDetails });
    } catch (error) {
        console.error('Error fetching rejected leads:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
// router.post('/check-client-phone', isAuth, async (req, res) => {
//     try {
//         const { clientPhone } = req.body;

//         // Find client by phone
//         const client = await Client.findOne({ phone: clientPhone });
//         if (!client) {
//             return res.status(404).json({ message: 'Client not found' });
//         }

//         // Find all leads associated with the client, populating all necessary fields
//         const leads = await Lead.find({ client: client._id })
//             .populate({
//                 path: 'pipeline_id', // Populate the pipeline_id field with full details
//             })
//             .populate({
//                 path: 'product_stage', // Populate the product_stage field with full details
//             })
//             .populate({
//                 path: 'products', // Populate the products field with full details
//             })
//             .populate({
//                 path: 'client', // Populate client details
//             })
//             .populate({
//                 path: 'lead_type', // Populate lead_type field with full details
//             })
//             .populate({
//                 path: 'source', // Populate source field with full details
//             })
//             .populate({
//                 path: 'selected_users', // Populate selected users with their full details
//                 select: 'name email', // Only return relevant user details
//             })
//             .populate({
//                 path: 'activity_logs', // Populate activity logs related to the lead
//             })
//             .populate({
//                 path: 'files', // Populate any files related to the lead
//             })
//             .populate({
//                 path: 'branch', // Populate branch details
//             })
//             .populate({
//                 path: 'stage', // Populate the lead stage field with full details
//             })
//             .populate({
//                 path: 'discussions', // Populate discussions related to the lead
//             })
//             .populate({
//                 path: 'messages', // Populate messages related to the lead
//             });

//         if (leads.length === 0) {
//             return res.status(404).json({ message: 'No leads found for this client' });
//         }

//         // Return full lead data, including populated fields
//         const leadDetails = leads.map(lead => ({
//             id: lead._id,
//             client: lead.client, // Include full client details
//             createdBy: lead.created_by, // Include details of the creator
//             selectedUsers: lead.selected_users, // Include details of selected users
//             pipeline: lead.pipeline_id, // Full pipeline details
//             stage: lead.stage, // Full lead stage details
//             productStage: lead.product_stage, // Full product stage details
//             products: lead.products, // Full products details
//             leadType: lead.lead_type, // Full lead type details
//             source: lead.source, // Full source details
//             notes: lead.notes || '', // Notes (if any)
//             companyName: lead.company_Name || '', // Company name (if any)
//             description: lead.description || '', // Description (if any)
//             activityLogs: lead.activity_logs, // Full activity log details
//             files: lead.files, // Full file details
//             labels: lead.labels || [], // Labels (if any)
//             branch: lead.branch, // Full branch details
//             order: lead.order || '', // Order details (if any)
//             thirdPartyName: lead.thirdpartyname || '', // Third-party name (if any)
//             dealStage: lead.deal_stage || '', // Deal stage (if any)
//             isActive: lead.is_active, // Lead active status
//             isConverted: lead.is_converted, // Lead converted status
//             isRejected: lead.is_reject, // Lead rejected status
//             isTransferred: lead.is_transfer, // Lead transfer status
//             date: lead.date, // Lead date
//             messages: lead.messages, // WhatsApp messages related to the lead
//             createdAt: lead.created_at, // Created timestamp
//             updatedAt: lead.updated_at, // Updated timestamp
//         }));

//         res.status(200).json(leadDetails); // Send an array of detailed lead objects 
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: 'Server error' });
//     }
// });
router.post('/check-client-phone', isAuth, async (req, res) => {
    try {
        const { clientPhone } = req.body;

        // Try to find the client by phone number
        const client = await Client.findOne({ phone: clientPhone });

        if (client) {
            // If the client is found, retrieve associated leads
            const leads = await Lead.find({ client: client._id })
                .populate('pipeline_id')
                .populate('product_stage')
                .populate('products')
                .populate('client')
                .populate('lead_type')
                .populate('source')
                .populate({ path: 'selected_users', select: 'name email' })
                .populate('activity_logs')
                .populate('files')
                .populate('branch')
                .populate('stage')
                .populate('discussions')
                .populate('messages');

            const leadDetails = leads.map(lead => ({
                id: lead._id,
                client: lead.client,
                createdBy: lead.created_by,
                selectedUsers: lead.selected_users,
                pipeline: lead.pipeline_id,
                stage: lead.stage,
                productStage: lead.product_stage,
                products: lead.products,
                leadType: lead.lead_type,
                source: lead.source,
                notes: lead.notes || '',
                companyName: lead.company_Name || '',
                description: lead.description || '',
                activityLogs: lead.activity_logs,
                files: lead.files,
                labels: lead.labels || [],
                branch: lead.branch,
                order: lead.order || '',
                thirdPartyName: lead.thirdpartyname || '',
                dealStage: lead.deal_stage || '',
                isActive: lead.is_active,
                isConverted: lead.is_converted,
                isRejected: lead.is_reject,
                isTransferred: lead.is_transfer,
                date: lead.date,
                messages: lead.messages,
                createdAt: lead.created_at,
                updatedAt: lead.updated_at,
            }));

            // Return lead details only
            return res.status(200).json({ leadDetails, phonebookEntry: null });
        } else {
            // If client is not found, check in the phone book
            const phonebookEntry = await Phonebook.findOne({ number: clientPhone })
                .populate('user', 'name email')
                .populate('pipeline')
                .populate('uploaded_by', 'name')
                .populate('comments')
                .populate('visibility', 'name email');

            if (phonebookEntry) {
                // Return an empty leadDetails array with phonebookEntry if found
                return res.status(200).json({ leadDetails: [], phonebookEntry });
            } else {
                // If neither client nor phone book entry is found, return not found
                return res.status(404).json({ message: 'Client and phone book entry not found' });
            }
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});
router.post('/check-client-phone-search', isAuth, async (req, res) => {
    try {
        const { clientPhone } = req.body;

        // Find client by phone
        const client = await Client.findOne({ phone: clientPhone });
        if (!client) {
            return res.status(404).json({ message: 'Client not found' });
        }

        // Find all leads associated with the client, populating all necessary fields
        const leads = await Lead.find({ client: client._id })
            .populate({
                path: 'pipeline_id', // Populate the pipeline_id field with full details
            })
            .populate({
                path: 'product_stage', // Populate the product_stage field with full details
            })
            .populate({
                path: 'products', // Populate the products field with full details
            })
            .populate({
                path: 'client', // Populate client details
            })
            .populate({
                path: 'lead_type', // Populate lead_type field with full details
            })
            .populate({
                path: 'source', // Populate source field with full details
            })
            .populate({
                path: 'selected_users', // Populate selected users with their full details
                select: 'name email', // Only return relevant user details
            })
            .populate({
                path: 'activity_logs', // Populate activity logs related to the lead
            })
            .populate({
                path: 'files', // Populate any files related to the lead
            })
            .populate({
                path: 'branch', // Populate branch details
            })
            .populate({
                path: 'stage', // Populate the lead stage field with full details
            })
            .populate({
                path: 'discussions', // Populate discussions related to the lead
            })
            .populate({
                path: 'messages', // Populate messages related to the lead
            });

        if (leads.length === 0) {
            return res.status(404).json({ message: 'No leads found for this client' });
        }

        // Return full lead data, including populated fields
        const leadDetails = leads.map(lead => ({
            id: lead._id,
            client: lead.client, // Include full client details
            createdBy: lead.created_by, // Include details of the creator
            selectedUsers: lead.selected_users, // Include details of selected users
            pipeline: lead.pipeline_id, // Full pipeline details
            stage: lead.stage, // Full lead stage details
            productStage: lead.product_stage, // Full product stage details
            products: lead.products, // Full products details
            leadType: lead.lead_type, // Full lead type details
            source: lead.source, // Full source details
            notes: lead.notes || '', // Notes (if any)
            companyName: lead.company_Name || '', // Company name (if any)
            description: lead.description || '', // Description (if any)
            activityLogs: lead.activity_logs, // Full activity log details
            files: lead.files, // Full file details
            labels: lead.labels || [], // Labels (if any)
            branch: lead.branch, // Full branch details
            order: lead.order || '', // Order details (if any)
            thirdPartyName: lead.thirdpartyname || '', // Third-party name (if any)
            dealStage: lead.deal_stage || '', // Deal stage (if any)
            isActive: lead.is_active, // Lead active status
            isConverted: lead.is_converted, // Lead converted status
            isRejected: lead.is_reject, // Lead rejected status
            isTransferred: lead.is_transfer, // Lead transfer status
            date: lead.date, // Lead date
            messages: lead.messages, // WhatsApp messages related to the lead
            createdAt: lead.created_at, // Created timestamp
            updatedAt: lead.updated_at, // Updated timestamp
        }));

        res.status(200).json(leadDetails); // Send an array of detailed lead objects
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});
router.put('/reject-lead/:leadId', isAuth, hasPermission(['reject_lead']), async (req, res) => {
    try {
        const { leadId } = req.params;
        const { reject_reason } = req.body;

        // Validate leadId and convert to ObjectId
        const leadObjectId = convertToObjectId(leadId);
        if (!leadObjectId) {
            return res.status(400).json({ message: 'Invalid lead ID' });
        }

        // Ensure reject_reason is provided
        if (!reject_reason || typeof reject_reason !== 'string') {
            return res.status(400).json({ message: 'Please Enter Reject Reason' });
        }

        // Find the lead and update is_reject to true and add reject_reason
        const lead = await Lead.findById(leadObjectId).populate('client selected_users');
        if (!lead) {
            return res.status(404).json({ message: 'Lead not found' });
        }

        // Update the lead status
        lead.is_reject = true;
        lead.reject_reason = reject_reason;
        const updatedLead = await lead.save();

        // Log activity for rejecting a lead
        const activityLog = new ActivityLog({
            user_id: req.user._id,
            log_type: 'Reject Lead',
            remark: `Lead rejected with reason: ${reject_reason}`,
            created_at: Date.now(),
            updated_at: Date.now(),
        });
        await activityLog.save();

        // Push activity log to lead
        updatedLead.activity_logs.push(activityLog._id);
        await updatedLead.save();

        // Notification and Socket.IO logic
        const io = getIO(); // Initialize socket IO
        const notifications = [];

        // Get the list of selected users (users who need to be notified)
        const usersToNotify = lead.selected_users.filter(user =>
            !['CEO', 'MD', 'Developer', 'Super Admin'].includes(user.role)
        );

        // Fetch the sender's details (name and image)
        const sender = await User.findById(req.user._id);

        // Send notification to each selected user
        for (const notifiedUser of usersToNotify) {
            // Create and save the notification using the polymorphic reference
            const newNotification = new Notification({
                receiver: notifiedUser._id,
                sender: req.user._id, // Save the sender's user ID
                message: `Lead for ${lead.client.name} has been rejected: ${reject_reason}`,
                reference_id: updatedLead._id,
                notification_type: 'Lead', // Polymorphic reference to Lead
                created_at: Date.now(),
            });

            const savedNotification = await newNotification.save();
            notifications.push(savedNotification);

            // Emit notification to the correct user room via WebSockets
            io.to(`user_${notifiedUser._id}`).emit('notification', {

                message: newNotification.message,
                referenceId: savedNotification.reference_id,
                notificationType: savedNotification.notification_type,
                notificationId: savedNotification._id,
                sender: {
                    name: sender.name, // Sender's name
                    image: sender.image, // Sender's image
                },
                createdAt: savedNotification.created_at,
            });
        }

        res.status(200).json({
            message: 'Lead marked as rejected, activity log saved, and notifications sent',
            lead: updatedLead,
            activity_log: activityLog,
            notifications,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});
router.put('/restore-reject-lead/:leadId', isAuth, async (req, res) => {
    try {
        const { leadId } = req.params;
        const { product_stage } = req.body;

        // Validate leadId and convert to ObjectId
        const leadObjectId = convertToObjectId(leadId);
        if (!leadObjectId) {
            return res.status(400).json({ message: 'Invalid lead ID' });
        }

        // Ensure product_stage is provided
        if (!product_stage) {
            return res.status(400).json({ message: 'Product stage is required' });
        }

        // Find the lead and ensure it exists
        const lead = await Lead.findById(leadObjectId).populate('client selected_users');
        if (!lead) {
            return res.status(404).json({ message: 'Lead not found' });
        }

        // // Check if the lead is already not rejected
        // if (!lead.is_reject) {
        //     return res.status(400).json({ message: 'Lead is not marked as rejected' });
        // }

        // Update the lead to restore it
        lead.is_reject = false;
        lead.reject_reason = ''; // Reset reject reason to an empty string
        lead.product_stage = product_stage; // Update product_stage
        const updatedLead = await lead.save();

        // Log activity for restoring the lead
        const activityLog = new ActivityLog({
            user_id: req.user._id,
            log_type: 'Restore Lead',
            remark: `Lead restored from rejected status with updated product stage: ${product_stage}`,
            created_at: Date.now(),
            updated_at: Date.now(),
        });
        await activityLog.save();

        // Push activity log to lead
        updatedLead.activity_logs.push(activityLog._id);
        await updatedLead.save();

        // Notification and Socket.IO logic
        const io = getIO(); // Initialize socket IO
        const notifications = [];

        // Get the list of selected users (users who need to be notified)
        const usersToNotify = lead.selected_users.filter(user =>
            !['CEO', 'MD', 'Developer', 'Super Admin'].includes(user.role)
        );

        // Fetch the sender's details (name and image)
        const sender = await User.findById(req.user._id);

        // Send notification to each selected user
        for (const notifiedUser of usersToNotify) {
            // Create and save the notification using the polymorphic reference
            const newNotification = new Notification({
                receiver: notifiedUser._id,
                sender: req.user._id, // Save the sender's user ID
                message: `Lead for ${lead.client.name} has been restored from rejection with updated product stage.`,
                reference_id: updatedLead._id,
                notification_type: 'Lead', // Polymorphic reference to Lead
                created_at: Date.now(),
            });

            const savedNotification = await newNotification.save();
            notifications.push(savedNotification);

            // Emit notification to the correct user room via WebSockets
            io.to(`user_${notifiedUser._id}`).emit('notification', {
                message: newNotification.message,
                referenceId: savedNotification.reference_id,
                notificationType: savedNotification.notification_type,
                notificationId: savedNotification._id,
                sender: {
                    name: sender.name, // Sender's name
                    image: sender.image, // Sender's image
                },
                createdAt: savedNotification.created_at,
            });
        }

        res.status(200).json({
            message: 'Lead restored from rejected status, product stage updated, activity log saved, and notifications sent',
            lead: updatedLead,
            activity_log: activityLog,
            notifications,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});
// Remove user from selected users in a lead
router.put('/remove-user-from-lead/:leadId', isAuth, hasPermission(['remove_user_lead']), async (req, res) => {
    try {
        const { userId } = req.body;
        const leadId = req.params.leadId;

        const lead = await Lead.findById(leadId)
            .populate('client selected_users');
        if (!lead) {
            return res.status(404).json({ message: 'Lead not found' });
        }

        // Filter out any invalid/null entries in selected_users
        lead.selected_users = lead.selected_users.filter(user => user);

        // Check if the user exists in selected_users
        if (!lead.selected_users.some(user => user._id.toString() === userId)) {
            return res.status(400).json({ message: 'User not found in selected users' });
        }

        // Fetch the user information to get the name
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Remove user from selected_users
        lead.selected_users = lead.selected_users.filter(user => user._id.toString() !== userId);
        const updatedLead = await lead.save();

        // Log activity for removing a user
        const activityLog = new ActivityLog({
            user_id: req.user._id,
            log_type: 'Remove User',
            remark: `User ${user.name} removed from selected users`, // Store user name in remark
            created_at: Date.now(),
            updated_at: Date.now()
        });
        await activityLog.save();

        // Push activity log to lead
        updatedLead.activity_logs.push(activityLog._id);
        await updatedLead.save();

        // Notification and Socket.IO logic
        const io = getIO(); // Initialize socket IO
        const notifications = [];

        // Get the list of selected users (users who need to be notified)
        const usersToNotify = lead.selected_users.filter(user =>
            !['CEO', 'MD', 'Developer', 'Super Admin'].includes(user.role)
        );

        // Fetch the sender's details (name and image)
        const sender = await User.findById(req.user._id);

        // Send notification to each selected user
        for (const notifiedUser of usersToNotify) {

            // Create and save the notification using the polymorphic reference
            const newNotification = new Notification({
                receiver: notifiedUser._id,
                sender: req.user._id, // Save the sender's user ID
                message: `User ${user.name} was removed from the lead ${lead.client.name}`,
                reference_id: updatedLead._id,
                notification_type: 'Lead', // Polymorphic reference to Lead
                created_at: Date.now(),
            });

            const savedNotification = await newNotification.save();
            notifications.push(savedNotification);

            // Emit notification to the correct user room via WebSockets
            io.to(`user_${notifiedUser._id}`).emit('notification', {
                message: newNotification.message,
                referenceId: savedNotification.reference_id,
                notificationType: savedNotification.notification_type,
                notificationId: savedNotification._id,
                sender: {
                    name: sender.name, // Sender's name
                    image: sender.image, // Sender's image
                },
                createdAt: savedNotification.created_at,
            });
        }

        res.status(200).json({
            message: 'User removed from selected users successfully, notifications sent',
            lead: updatedLead,
            activity_log: activityLog,
            notifications,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});
router.post('/convert-lead-to-contract/:leadId', isAuth, hasPermission(['convert_lead']), async (req, res) => {
    try {
        const { leadId } = req.params;
        const {
            finance_amount,
            bank_commission,
            customer_commission,
            with_vat_commission,
            without_vat_commission,
            hod, hod_commission_percentage, hod_commission_amount,
            hom, hom_commission_percentage, hom_commission_amount,
            sale_manager, sale_manager_commission_percentage, sale_manager_commission_amount,
            ajman_manager, ajman_manager_commission_percentage, ajman_manager_commission_amount,
            ajman_coordinator, ajman_coordinator_commission_percentage, ajman_coordinator_commission_amount,
            ajman_team_leader, ajman_team_leader_commission_percentage, ajman_team_leader_commission_amount,
            dubai_manager, dubai_manager_commission_percentage, dubai_manager_commission_amount,
            dubai_coordinator, dubai_coordinator_commission_percentage, dubai_coordinator_commission_amount,
            dubaiteam_leader, dubaiteam_leader_commission_percentage, dubaiteam_leader_commission_amount,
            dubaisale_agent, dubaiteam_sale_agent_percentage, dubaiteam_sale_agent_amount,
            ajman_sale_agent, ajman_sale_agent_percentage, ajman_sale_agent_amount,
            coordinator, coordinator_commission_percentage, coordinator_commission_amount,
            team_leader, team_leader_commission_percentage, team_leader_commission_amount,
            sales_agent, sales_agent_commission_percentage, sales_agent_commission_amount,
            sales_agent_one, sales_agent_one_commission_percentage, sales_agent_one_commission_amount,
            marketing_one, marketing_one_commission_percentage, marketing_one_commission_amount,
            marketing_two, marketing_two_commission_percentage, marketing_two_commission_amount,
            marketing_three, marketing_three_commission_percentage, marketing_three_commission_amount,
            marketing_four, marketing_four_commission_percentage, marketing_four_commission_amount,
            developer_one, developer_one_commission_percentage, developer_one_commission_amount,
            developer_two, developer_two_commission_percentage, developer_two_commission_amount,
            developerthree, developer_three_commission_percentage, developer_three_commission_amount,
            developer_four, developer_four_commission_percentage, developer_four_commission_amount,
            broker_name, broker_name_commission_percentage, broker_name_commission_amount,
            lead_created_by, lead_created_by_commission_percentage, lead_created_by_commission_amount
            , ts_team_leader, ts_team_leader_commission_percentage, ts_team_leader_commission_amount,
            ts_agent, tsagent_commission_percentage, tsagent_commission_amount,
            ref_hod, ref_hod_commission_percentage, ref_hod_commission_amount,
            ref_manager, ref_manager_commission_percentage, ref_manager_commission_amount,
            ref_hom, ref_hom_commission_percentage, ref_hom_commission_amount,
            team_leader_one, team_leader_one_commission_percentage, team_leader_one_commission_amount
        } = req.body;

        // Find the lead
        const lead = await Lead.findById(leadId)
            .populate('client') // Populate client data
            .populate('products'); // Populate product data

        if (!lead) {
            return res.status(404).json({ message: 'Lead not found' });
        }

        const productIds = lead.products._id;
        // Create a new ServiceCommission
        const newServiceCommission = new serviceCommissionModel({
            contract_id: null, // Temporary, updated after creating the contract
            finance_amount,
            bank_commission,
            customer_commission,
            with_vat_commission,
            without_vat_commission,
            hod: convertToObjectId(hod),
            hod_commission_percentage,
            hod_commission_amount,
            hom: convertToObjectId(hom),
            hom_commission_percentage,
            hom_commission_amount,
            sale_manager: convertToObjectId(sale_manager),
            sale_manager_commission_percentage,
            sale_manager_commission_amount,
            ajman_manager: convertToObjectId(ajman_manager),
            ajman_manager_commission_percentage,
            ajman_manager_commission_amount,
            ajman_coordinator: convertToObjectId(ajman_coordinator),
            ajman_coordinator_commission_percentage,
            ajman_coordinator_commission_amount,
            ajman_team_leader: convertToObjectId(ajman_team_leader),
            ajman_team_leader_commission_percentage,
            ajman_team_leader_commission_amount,
            dubai_manager: convertToObjectId(dubai_manager),
            dubai_manager_commission_percentage,
            dubai_manager_commission_amount,
            dubai_coordinator: convertToObjectId(dubai_coordinator),
            dubai_coordinator_commission_percentage,
            dubai_coordinator_commission_amount,
            dubaiteam_leader: convertToObjectId(dubaiteam_leader),
            dubaiteam_leader_commission_percentage,
            dubaiteam_leader_commission_amount,
            dubaisale_agent: convertToObjectId(dubaisale_agent),
            dubaiteam_sale_agent_percentage,
            dubaiteam_sale_agent_amount,
            ajman_sale_agent: convertToObjectId(ajman_sale_agent),
            ajman_sale_agent_percentage,
            ajman_sale_agent_amount,
            coordinator: convertToObjectId(coordinator),
            coordinator_commission_percentage,
            coordinator_commission_amount,
            team_leader: convertToObjectId(team_leader),
            team_leader_commission_percentage,
            team_leader_commission_amount,
            sales_agent: convertToObjectId(sales_agent),
            sales_agent_commission_percentage,
            sales_agent_commission_amount,

            sales_agent_one: convertToObjectId(sales_agent_one),
            sales_agent_one_commission_percentage,
            sales_agent_one_commission_amount,

            marketing_one: convertToObjectId(marketing_one),
            marketing_one_commission_percentage,
            marketing_one_commission_amount,
            marketing_two: convertToObjectId(marketing_two),
            marketing_two_commission_percentage,
            marketing_two_commission_amount,
            marketing_three: convertToObjectId(marketing_three),
            marketing_three_commission_percentage,
            marketing_three_commission_amount,
            marketing_four: convertToObjectId(marketing_four),
            marketing_four_commission_percentage,
            marketing_four_commission_amount,
            developer_one: convertToObjectId(developer_one),
            developer_one_commission_percentage,
            developer_one_commission_amount,
            developer_two: convertToObjectId(developer_two),
            developer_two_commission_percentage,
            developer_two_commission_amount,
            developerthree: convertToObjectId(developerthree),
            developer_three_commission_percentage,
            developer_three_commission_amount,
            developer_four: convertToObjectId(developer_four),
            developer_four_commission_percentage,
            developer_four_commission_amount,
            broker_name,
            broker_name_commission_percentage,
            broker_name_commission_amount,
            lead_created_by: convertToObjectId(lead_created_by),
            lead_created_by_commission_percentage,
            lead_created_by_commission_amount,
            created_by: req.user._id,
            delstatus: false,
            tsagent_commission_amount,
            tsagent_commission_percentage,
            ts_agent: convertToObjectId(ts_agent),
            ts_team_leader: convertToObjectId(ts_team_leader),
            ts_team_leader_commission_percentage,
            ts_team_leader_commission_amount,
            ref_hom: convertToObjectId(ref_hom), ref_hom_commission_percentage, ref_hom_commission_amount,
            ref_hod: convertToObjectId(ref_hod), ref_hod_commission_percentage, ref_hod_commission_amount,
            ref_manager: convertToObjectId(ref_manager), ref_manager_commission_percentage, ref_manager_commission_amount,
            team_leader_one: convertToObjectId(team_leader_one), team_leader_one_commission_percentage, team_leader_one_commission_amount


        });

        // Save the ServiceCommission
        await newServiceCommission.save();

        // Prepare and save the contract 
        const newContract = new Contract({
            client_id: lead.client._id,
            lead_type: lead.lead_type,
            pipeline_id: lead.pipeline_id,
            source_id: lead.source,
            products: productIds,
            contract_stage: '673dad2024830568266491ff',
            status: 'Active',
            is_transfer: false,
            labels: lead.labels,
            branch: lead.branch._id,
            created_by: req.user._id,
            lead_id: lead._id,
            selected_users: lead.selected_users,
            service_commission_id: newServiceCommission._id,
            date: new Date(),
        });

        await newContract.save();

        // Update the ServiceCommission with the contract ID
        newServiceCommission.contract_id = newContract._id;
        await newServiceCommission.save();

        // Mark lead as converted
        lead.is_converted = true;
        await lead.save();

        // Add activity log
        const activityLog = new ActivityLog({
            user_id: req.user._id,
            log_type: 'Lead Conversion',
            remark: `Lead converted to contract. Contract ID: ${newContract._id}. Service Commission ID: ${newServiceCommission._id}.`,
            created_at: new Date(),
            updated_at: new Date()
        });
        await activityLog.save();

        // Update lead with activity log
        lead.activity_logs.push(activityLog._id);
        await lead.save();

        res.status(201).json({ message: 'Contract created and lead converted successfully', contract: newContract });
    } catch (error) {
        console.error('Error converting lead to contract:', error);
        res.status(500).json({ message: 'Failed to convert lead to contract', error: error.message });
    }
});
// Set storage engine 
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, '../lead_files');

        // Create the directory if it doesn't exist
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        // Generate a random filename
        const randomHexName = crypto.randomBytes(16).toString('hex');
        const ext = path.extname(file.originalname); // Get the original file extension
        cb(null, `${randomHexName}${ext}`); // Save with random hex filename and original extension
    }
});
// Allow multiple file uploads 
const upload = multer({ storage }).array('files', 10); // Max 10 files at a time (you can adjust this)
// Route to handle multiple file uploads and link to the lead
router.post('/upload-files/:leadId', isAuth, hasPermission(['file_upload']), (req, res) => {
    upload(req, res, async (err) => {
        if (err) {
            return res.status(400).json({ message: 'Error uploading files', error: err });
        }
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: 'No files uploaded' });
        }

        try {
            const { leadId } = req.params;
            const lead = await Lead.findById(leadId);

            if (!lead) {
                return res.status(404).json({ message: 'Lead not found' });
            }

            const fileDocs = [];
            const activityLogPromises = [];

            for (const file of req.files) {
                // Create a new file document with original name and random path
                const newFile = new File({
                    file_name: file.originalname,
                    file_path: `/lead_files/${file.filename}`,
                    created_at: new Date(),
                    updated_at: new Date(),
                });

                await newFile.save();
                fileDocs.push(newFile);

                // Attach file reference to the lead
                lead.files.push(newFile._id);

                // Create an activity log
                const logRemark = `File ${file.originalname} was uploaded by ${req.user.name || req.user.email}`;
                if (!lead.is_converted) {
                    // Case 1: Lead Not Converted
                    const activityLog = new ActivityLog({
                        log_type: 'File Uploaded',
                        remark: logRemark,
                        user_id: req.user._id,
                        created_at: new Date(),
                    });
                    activityLogPromises.push(activityLog.save());
                    lead.activity_logs.push(activityLog._id);
                } else {
                    const contract = await Contract.findOne({ lead_id: leadId });
                    if (!contract) {
                        return res.status(404).json({ message: 'Associated contract not found' });
                    }

                    if (contract.is_converted) {
                        // Case 3: Lead and Contract Converted
                        const deal = await dealModel.findOne({ lead_id: leadId });
                        if (!deal) {
                            return res.status(404).json({ message: 'Associated deal not found' });
                        }

                        const dealActivityLog = new DealActivityLog({
                            user_id: req.user._id,
                            deal_id: deal._id,
                            log_type: 'File Uploaded',
                            remark: logRemark,
                            created_at: new Date(),
                        });
                        activityLogPromises.push(dealActivityLog.save());
                        deal.deal_activity_logs.push(dealActivityLog._id);
                        await deal.save();
                    } else {
                        // Case 2: Lead Converted but Contract Not Converted
                        const contractActivityLog = new ContractActivityLog({
                            user_id: req.user._id,
                            contract_id: contract._id,
                            log_type: 'File Uploaded',
                            remark: logRemark,
                            created_at: new Date(),
                        });
                        activityLogPromises.push(contractActivityLog.save());
                        contract.contract_activity_logs.push(contractActivityLog._id);
                        await contract.save();
                    }
                }
            }

            // Save lead and log activities in parallel
            await Promise.all([lead.save(), ...activityLogPromises]);

            res.status(201).json({
                message: 'Files uploaded and activity logged successfully',
                files: fileDocs,
            });
        } catch (error) {
            console.error('Error uploading files:', error);
            res.status(500).json({ message: 'Error uploading files' });
        }
    });
});


// Delete file endpoint
router.delete('/delete-file/:leadId/:fileId', isAuth, async (req, res) => {
    try {
        const { leadId, fileId } = req.params;

        const lead = await Lead.findById(leadId);
        if (!lead) {
            return res.status(404).json({ message: 'Lead not found' });
        }

        const file = await File.findById(fileId);
        if (!file) {
            return res.status(404).json({ message: 'File not found' });
        }

        // Remove file from lead's files array
        lead.files = lead.files.filter(id => id.toString() !== fileId);

        // Log the file deletion in activity logs
        const activityLog = new ActivityLog({
            log_type: 'File Deleted',
            remark: `File ${file.file_name} was deleted by ${req.user.name || req.user.email}`,
            user_id: req.user._id,
            created_at: new Date()
        });
        await activityLog.save();

        lead.activity_logs.push(activityLog._id);

        // Delete the file document from the database
        await File.findByIdAndDelete(fileId);

        // Construct the file path for deletion
        const filePath = path.join(__dirname, `../${file.file_path}`);

        // Check if the file exists before attempting to delete
        if (fs.existsSync(filePath)) {
            fs.unlink(filePath, (err) => {
                if (err) {
                    console.error('Error deleting file from filesystem:', err);
                }
            });
        } else {
            console.error('File does not exist in filesystem:', filePath);
        }

        await lead.save();

        res.status(200).json({ message: 'File deleted and activity logged successfully' });
    } catch (error) {
        console.error('Error deleting file:', error);
        res.status(500).json({ message: 'Error deleting file' });
    }
});
/// Add Discussion in the lead Model  
router.post('/add-discussion/:leadId', isAuth, async (req, res) => {
    try {
        const { leadId } = req.params;
        const { comment } = req.body;

        // Validate comment input
        if (!comment) {
            return res.status(400).json({ message: 'Comment is required' });
        }

        // Find the lead by ID
        const lead = await Lead.findById(leadId);
        if (!lead) {
            return res.status(404).json({ message: 'Lead not found' });
        }

        // Create a new discussion
        const newDiscussion = new leadDiscussionModel({
            created_by: req.user._id,
            comment,
        });

        await newDiscussion.save();
        lead.discussions.push(newDiscussion._id);
        await lead.save();

        // Handle the activity log creation
        let activityLog;

        if (!lead.is_converted) {
            // Case 1: Lead Not Converted - Log a standard lead activity log
            activityLog = new ActivityLog({
                log_type: 'Discussion Added',
                remark: `Discussion added by ${req.user.name || req.user.email}: "${comment}"`,
                user_id: req.user._id,
                created_at: new Date(),
            });

            await activityLog.save();
            lead.activity_logs.push(activityLog._id);
            await lead.save();
        } else {
            // Lead is converted, check the contract
            const contract = await Contract.findOne({ lead_id: leadId });
            if (!contract) {
                return res.status(404).json({ message: 'Associated contract not found' });
            }

            if (contract.is_converted) {
                // Case 3: Lead and Contract Converted - Log a Deal Activity Log
                const deal = await dealModel.findOne({ lead_id: leadId });
                if (!deal) {
                    return res.status(404).json({ message: 'Associated deal not found' });
                }

                activityLog = new DealActivityLog({
                    user_id: req.user._id,
                    deal_id: deal._id,
                    log_type: 'Discussion Added',
                    remark: `Discussion added for converted deal: "${comment}"`,
                    created_at: new Date(),
                });

                await activityLog.save();
                deal.deal_activity_logs.push(activityLog._id);
                await deal.save();
            } else {
                // Case 2: Lead Converted but Contract Not Converted - Log a Contract Activity Log
                activityLog = new ContractActivityLog({
                    user_id: req.user._id,
                    contract_id: contract._id,
                    log_type: 'Discussion Added',
                    remark: `Discussion added for converted lead: "${comment}"`,
                    created_at: new Date(),
                });

                await activityLog.save();
                contract.contract_activity_logs.push(activityLog._id);
                await contract.save();
            }
        }

        return res.status(201).json({
            message: 'Discussion added successfully',
            discussion: newDiscussion,
            activity_log: activityLog,
        });
    } catch (error) {
        console.error('Error adding discussion:', error);
        res.status(500).json({ message: 'Error adding discussion' });
    }
});




/// Transfer Lead 
router.put('/transfer-lead/:id', isAuth, hasPermission(['transfer_lead']), async (req, res) => {
    try {
        const leadId = req.params.id;
        const { pipeline, branch, product_stage, products } = req.body;

        if (!pipeline || !branch || !product_stage || !products) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const branchId = new mongoose.Types.ObjectId(String(branch));
        const productStageId = new mongoose.Types.ObjectId(String(product_stage));
        const pipelineId = new mongoose.Types.ObjectId(String(pipeline));
        const productId = new mongoose.Types.ObjectId(String(products));

        const lead = await Lead.findById(leadId);
        if (!lead) {
            return res.status(404).json({ message: 'Lead not found' });
        }

        const validProductStage = await ProductStage.findById(productStageId);
        if (!validProductStage) {
            return res.status(400).json({ message: 'Invalid product stage' });
        }

        if (String(lead.products) === String(productId)) {
            return res.status(403).json({ message: 'Cannot transfer the lead in the same product; please change product' });
        }

        const oldBranch = await Branch.findById(lead.branch).select('name');
        const oldPipeline = await Pipeline.findById(lead.pipeline_id).select('name');
        const oldProductStage = await ProductStage.findById(lead.product_stage).select('name');
        const oldProducts = lead.products;

        const newBranch = await Branch.findById(branchId).select('name');
        const newPipeline = await Pipeline.findById(pipelineId).select('name');
        const newProductStage = await ProductStage.findById(productStageId).select('name');

        let changes = [];
        if (String(lead.pipeline_id) !== String(pipelineId)) {
            changes.push(`Pipeline changed from ${oldPipeline.name} to ${newPipeline.name}`);
        }
        if (String(lead.branch) !== String(branchId)) {
            changes.push(`Branch changed from ${oldBranch.name} to ${newBranch.name}`);
        }
        if (String(lead.product_stage) !== String(productStageId)) {
            changes.push(`Product Stage changed from ${oldProductStage.name} to ${newProductStage.name}`);
        }
        if (String(lead.products) !== String(productId)) {
            const oldProduct = oldProducts ? await Product.findById(oldProducts) : { name: 'None' };
            const newProduct = await Product.findById(productId);
            changes.push(`Product changed from ${oldProduct.name} to ${newProduct.name}`);
        }

        lead.transfer_from = {
            pipeline: lead.pipeline_id,
            branch: lead.branch,
            product_stage: lead.product_stage,
            products: lead.products,
        };

        lead.products = productId;

        const ceoUsers = await User.find({ role: 'CEO' }).select('_id name');
        const superadminUsers = await User.find({ role: 'superadmin' }).select('_id name');
        const mdUsers = await User.find({ role: 'MD' }).select('_id name');
        const hodUsers = await User.find({ role: 'HOD', products: productId }).select('_id name');
        const homUsers = await User.find({ role: 'HOM', products: productId }).select('_id name');

        const managerUsers = await User.find({
            pipeline: pipelineId,
            role: 'Manager',
            branch: branchId,
        }).select('_id name');

        const previousproduct = lead.products;
        previousPipelineId = lead.pipeline_id._id;
        const previousproductHodUser = await User.findOne({
            role: 'HOD',
            products: previousproduct,
        }).select('_id');
        const previousproductHomUser = await User.findOne({
            role: 'HOM',
            products: previousproduct,
        }).select('_id');
        const previousPipelinemanagerUser = await User.findOne({
            role: 'Manager',
            pipeline: previousPipelineId,
        }).select('_id');

        lead.ref_hod = previousproductHodUser ? previousproductHodUser._id : null;
        lead.ref_hom = previousproductHomUser ? previousproductHomUser._id : null;
        lead.ref_manager = previousPipelinemanagerUser ? previousPipelinemanagerUser._id : null;

        const newSelectedUserIds = [
            req.user._id.toString(),
            lead.created_by.toString(),
            ...ceoUsers.map(user => user._id.toString()),
            ...superadminUsers.map(user => user._id.toString()),
            ...mdUsers.map(user => user._id.toString()),
            ...hodUsers.map(user => user._id.toString()),
            ...homUsers.map(user => user._id.toString()),
            ...managerUsers.map(user => user._id.toString()),
        ];

        lead.selected_users = getUniqueUserIds(newSelectedUserIds);

        lead.pipeline_id = pipelineId;
        lead.branch = branchId;
        lead.product_stage = productStageId;
        lead.is_transfer = true;

        const updatedLead = await lead.save();

        const activityLog = new ActivityLog({
            user_id: req.user._id,
            log_type: 'Lead Transfer',
            remark: changes.length ? `Lead transferred: ${changes.join(', ')}` : 'Lead transferred with no significant changes',
            created_at: Date.now(),
            updated_at: Date.now(),
        });
        await activityLog.save();

        updatedLead.activity_logs.push(activityLog._id);
        await updatedLead.save();

        // Notification and Socket.IO logic
        const io = getIO(); // Initialize socket IO
        const notifications = [];

        // Filter out users with roles that should not receive notifications
        const usersToNotify = lead.selected_users.filter(user =>
            !['CEO', 'MD', 'Developer', 'Super Admin'].includes(user.role)
        );

        // Send notification to each selected user
        for (const user of usersToNotify) {
            // Create and save the notification using the polymorphic reference
            const newNotification = new Notification({
                receiver: user._id,
                sender: req.user._id, // Save the sender's user ID
                message: `Lead transferred: ${changes.length ? changes.join(', ') : 'No significant changes'}`,
                reference_id: lead._id,
                notification_type: 'Lead', // Polymorphic reference to Lead
                created_at: Date.now(),
            });

            const savedNotification = await newNotification.save();
            notifications.push(savedNotification);

            // Fetch the sender's details (name and image)
            const sender = await User.findById(req.user._id);

            // Emit notification to the correct user room via WebSockets
            io.to(`user_${user._id}`).emit('notification', {
                message: newNotification.message,
                referenceId: savedNotification.reference_id, // Send the lead's ID
                notificationType: savedNotification.notification_type, // Send the polymorphic type
                notificationId: savedNotification._id, // Send the notification ID
                sender: {
                    name: sender.name, // Sender's name
                    image: sender.image, // Sender's image
                },
                createdAt: savedNotification.created_at,
            });
        }

        res.status(200).json({
            message: 'Lead transferred successfully, notifications sent',
            lead: updatedLead,
            activity_log: activityLog,
            notifications,
        });
    } catch (error) {
        console.error('Error transferring lead:', error);
        res.status(500).json({ message: 'Error transferring lead' });
    }
});
router.put('/add-user-to-lead/:leadId', isAuth, hasPermission(['add_user_lead']), async (req, res) => {
    try {
        const { userId } = req.body;
        const leadId = req.params.leadId;

        const lead = await Lead.findById(leadId)
            .populate('client selected_users');
        if (!lead) {
            return res.status(404).json({ message: 'Lead not found' });
        }

        // Check if the user already exists in selected_users
        if (lead.selected_users.some(user => user._id.toString() === userId)) {
            return res.status(400).json({ message: 'User already added to selected users' });
        }

        // Fetch the user information to get the name
        const newUser = await User.findById(userId);
        if (!newUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Add user to selected_users
        lead.selected_users.push(newUser);
        const updatedLead = await lead.save();

        // Log activity for adding a user
        const activityLog = new ActivityLog({
            user_id: req.user._id,
            log_type: 'Add User',
            remark: `User ${newUser.name} added to selected users`, // Store user name in remark
            created_at: Date.now(),
            updated_at: Date.now()
        });
        await activityLog.save();

        // Push activity log to lead
        updatedLead.activity_logs.push(activityLog._id);
        await updatedLead.save();

        // Notification and Socket.IO logic
        const io = getIO(); // Initialize socket IO
        const notifications = [];

        // Get the list of selected users (users who need to be notified)
        const usersToNotify = lead.selected_users.filter(user =>
            !['CEO', 'MD', 'Developer', 'Super Admin'].includes(user.role)
        );

        // Fetch the sender's details (name and image)
        const sender = await User.findById(req.user._id);

        // Send notification to each selected user
        for (const user of usersToNotify) {
            // Create and save the notification using the polymorphic reference
            const newNotification = new Notification({
                receiver: user._id,
                sender: req.user._id, // Save the sender's user ID
                message: `User ${newUser.name} was added to the lead ${lead.client.name}`,
                reference_id: updatedLead._id,
                notification_type: 'Lead', // Polymorphic reference to Lead
                created_at: Date.now(),
            });

            const savedNotification = await newNotification.save();
            notifications.push(savedNotification);

            // Emit notification to the correct user room via WebSockets
            io.to(`user_${user._id}`).emit('notification', {
                message: newNotification.message,
                referenceId: savedNotification.reference_id,
                notificationType: savedNotification.notification_type,
                notificationId: savedNotification._id,
                sender: {
                    name: sender.name, // Sender's name
                    image: sender.image, // Sender's image
                },
                createdAt: savedNotification.created_at,
            });
        }

        res.status(200).json({
            message: 'User added to selected users successfully, notifications sent',
            lead: updatedLead,
            activity_log: activityLog,
            notifications,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});
// Add multiple users to selected_users and update branch
router.put('/add-multiple-users-to-lead/:leadId', isAuth, hasPermission(['add_user_lead']), async (req, res) => {
    try {
        const { userIds, branchId } = req.body;
        const leadId = req.params.leadId;

        const lead = await Lead.findById(leadId).populate('client selected_users');
        if (!lead) {
            return res.status(404).json({ message: 'Lead not found' });
        }

        const newUsers = await User.find({ _id: { $in: userIds } });
        if (newUsers.length === 0) {
            return res.status(404).json({ message: 'No users found' });
        }

        const addedUsers = [];
        newUsers.forEach(user => {
            if (!lead.selected_users.some(selected => selected._id.toString() === user._id.toString())) {
                lead.selected_users.push(user);
                addedUsers.push(user.name);
            }
        });

        lead.branch = branchId; // Update branch
        const updatedLead = await lead.save();

        const activityLog = new ActivityLog({
            user_id: req.user._id,
            log_type: 'Add Users',
            remark: `Users [${addedUsers.join(', ')}] added to selected users and branch updated to ${branchId}`,
            created_at: Date.now(),
            updated_at: Date.now()
        });
        await activityLog.save();

        updatedLead.activity_logs.push(activityLog._id);
        await updatedLead.save();

        const io = getIO();
        const usersToNotify = lead.selected_users.filter(user => !['CEO', 'MD', 'Developer', 'Super Admin'].includes(user.role));
        const sender = await User.findById(req.user._id);

        const notifications = [];
        for (const user of usersToNotify) {
            const newNotification = new Notification({
                receiver: user._id,
                sender: req.user._id,
                message: `Users [${addedUsers.join(', ')}] were added to the lead ${lead.client.name} and branch updated.`,
                reference_id: updatedLead._id,
                notification_type: 'Lead',
                created_at: Date.now(),
            });

            const savedNotification = await newNotification.save();
            notifications.push(savedNotification);

            io.to(`user_${user._id}`).emit('notification', {
                message: newNotification.message,
                referenceId: savedNotification.reference_id,
                notificationType: savedNotification.notification_type,
                notificationId: savedNotification._id,
                sender: {
                    name: sender.name,
                    image: sender.image,
                },
                createdAt: savedNotification.created_at,
            });
        }

        res.status(200).json({
            message: 'Users added to selected users, branch updated successfully, and notifications sent',
            lead: updatedLead,
            activity_log: activityLog,
            notifications,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});
const getUniqueUserIds = (userIds) => {
    const uniqueUserMap = {};
    userIds.forEach(id => {
        if (id) {
            uniqueUserMap[id] = true;
        }
    });
    return Object.keys(uniqueUserMap);
};
// New route to move lead (Update pipeline, branch, product_stage)
router.put('/move-lead/:id', isAuth, hasPermission(['move_lead']), async (req, res) => {
    try {
        const leadId = req.params.id;
        const { pipeline, branch, product_stage, product } = req.body;

        // Ensure required fields are provided
        if (!pipeline || !branch || !product_stage) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const branchId = new mongoose.Types.ObjectId(String(branch));
        const productStageId = new mongoose.Types.ObjectId(String(product_stage));
        const pipelineId = new mongoose.Types.ObjectId(String(pipeline));
        const productId = new mongoose.Types.ObjectId(String(product));

        // Check if the lead exists
        const lead = await Lead.findById(leadId);
        if (!lead) {
            return res.status(404).json({ message: 'Lead not found' });
        }

        // Validate product_stage
        const validProductStage = await ProductStage.findById(productStageId);
        if (!validProductStage) {
            return res.status(400).json({ message: 'Invalid product stage' });
        }

        // Initialize variables for tracking changes
        let changes = [];
        let updatedSelectedUsers = [...lead.selected_users]; // Keep previous selected users

        // Fetch names for old values
        const oldBranch = await Branch.findById(lead.branch).select('name');
        const oldPipeline = await Pipeline.findById(lead.pipeline_id).select('name');
        const oldProductStage = await ProductStage.findById(lead.product_stage).select('name');

        // Fetch names for new values
        const newBranch = await Branch.findById(branchId).select('name');
        const newPipeline = await Pipeline.findById(pipelineId).select('name');
        const newProductStage = await ProductStage.findById(productStageId).select('name');

        // Track changes in pipeline, branch, and product_stage
        if (String(lead.pipeline_id) !== String(pipelineId)) {
            changes.push(`Pipeline changed from ${oldPipeline?.name} to ${newPipeline.name}`);
        }
        if (String(lead.branch) !== String(branchId)) {
            changes.push(`Branch changed from ${oldBranch?.name} to ${newBranch.name}`);
        }
        if (String(lead.product_stage) !== String(productStageId)) {
            changes.push(`Product Stage changed from ${oldProductStage?.name} to ${newProductStage.name}`);
        }

        // Fetch additional users based on the new pipeline and branch
        const ceoUsers = await User.find({ role: 'CEO' }).select('_id name');
        const superadminUsers = await User.find({ role: 'superadmin' }).select('_id name');
        const mdUsers = await User.find({ role: 'MD' }).select('_id name');
        const hodUsers = await User.find({ role: 'HOD', products: productId }).select('_id name'); // HOD with no branch filter
        const homUsers = await User.find({ role: 'HOM', products: productId }).select('_id name'); // HOD with no branch filter
        const managerUsers = await User.find({
            pipeline: pipelineId,
            role: 'Manager',
            branch: branchId, // Filter managers by the new branch
        }).select('_id name');

        // Include created_by user from the lead
        const createdByUser = lead.created_by ? await User.findById(lead.created_by).select('_id name') : null;

        // Combine all selected user IDs while keeping previous selected users
        const allSelectedUsers = [
            req.user._id.toString(), // Include the currently authenticated user
            createdByUser ? createdByUser._id.toString() : null, // Include the created_by user if it exists
            ...ceoUsers.map(user => user._id.toString()),
            ...superadminUsers.map(user => user._id.toString()),
            ...mdUsers.map(user => user._id.toString()),
            ...hodUsers.map(user => user._id.toString()), // Include HOD without branch restriction
            ...homUsers.map(user => user._id.toString()), // Include HOD without branch restriction
            ...managerUsers.map(user => user._id.toString()), // Manager filtered by branch
            ...updatedSelectedUsers.map(user => user.toString()), // Keep previous selected users
        ].filter(Boolean); // Filter out any null or undefined values

        // Filter out duplicate IDs and update the lead's selected_users
        updatedSelectedUsers = getUniqueUserIds(allSelectedUsers);
        lead.selected_users = updatedSelectedUsers;

        // Update the pipeline, branch, and product_stage
        lead.pipeline_id = pipelineId;
        lead.branch = branchId;
        lead.product_stage = productStageId;

        // Save the updated lead
        const updatedLead = await lead.save();

        // Create an activity log entry
        const activityLog = new ActivityLog({
            user_id: req.user._id,
            log_type: 'Lead Movement',
            remark: changes.length ? `Lead moved: ${changes.join(', ')}` : 'Lead moved with no significant changes',
            created_at: Date.now(),
            updated_at: Date.now(),
        });
        await activityLog.save();

        // Push the activity log ID to the lead
        updatedLead.activity_logs.push(activityLog._id);
        await updatedLead.save();

        const io = getIO(); // Initialize socket IO
        const notifications = [];

        // Filter out users with roles that should not receive notifications
        const usersToNotify = lead.selected_users.filter(user =>
            !['CEO', 'MD', 'Developer', 'Super Admin'].includes(user.role)
        );

        // Send notification to each selected user
        for (const user of usersToNotify) {
            // Create and save the notification using the polymorphic reference
            const newNotification = new Notification({
                receiver: user._id,
                sender: req.user._id, // Save the sender's user ID
                message: `Lead has been moved. Changes: ${changes.join(', ')}`,
                reference_id: lead._id,
                notification_type: 'Lead', // Polymorphic reference to Lead
                created_at: Date.now(),
            });

            const savedNotification = await newNotification.save();
            notifications.push(savedNotification);

            // Fetch the sender's details (name and image)
            const sender = await User.findById(req.user._id).select('name image');

            // Emit notification to the correct user room via WebSockets
            io.to(`user_${user._id}`).emit('notification', {
                message: newNotification.message,
                referenceId: savedNotification.reference_id, // Send the lead's ID
                notificationType: savedNotification.notification_type, // Send the polymorphic type
                notificationId: savedNotification._id, // Send the notification ID
                sender: {
                    name: sender.name, // Sender's name
                    image: sender.image, // Sender's image
                },
                createdAt: savedNotification.created_at,
            });
        }

        // Respond with success
        res.status(200).json({
            message: 'Lead moved successfully, notifications sent',
            lead: updatedLead,
            activity_log: activityLog,
            notifications,
        });
    } catch (error) {
        console.error('Error moving lead:', error);
        res.status(500).json({ message: 'Error moving lead' });
    }
});
router.get('/single-lead/:id', isAuth, hasPermission(['view_lead']), async (req, res) => {
    try {
        const { id } = req.params;

        // Validate the ID format
        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({ message: 'Invalid lead ID format' });
        }

        // Step 1: Fetch the lead with necessary fields for authorization and "is_converted" check
        const leadForAuthCheck = await Lead.findById(id).select('selected_users is_converted');
        if (!leadForAuthCheck) {
            return res.status(404).json({ message: 'Lead not found' });
        }

        // Check if the lead is converted
        if (leadForAuthCheck.is_converted) {
            return res.status(403).json({ message: 'This lead has been converted and cannot be accessed.' });
        }

        // Ensure `selected_users` is an array and not empty
        if (!Array.isArray(leadForAuthCheck.selected_users) || leadForAuthCheck.selected_users.length === 0) {
            return res.status(403).json({ message: 'You are not authorized to view this lead' });
        }

        // Ensure the user session is valid
        if (!req.user || !req.user._id) {
            return res.status(403).json({ message: 'Invalid user session. Authorization failed' });
        }

        // Step 2: Check if the user is authorized
        const isAuthorized = leadForAuthCheck.selected_users.some(userId => userId.equals(req.user._id));
        if (!isAuthorized) {
            return res.status(403).json({ message: 'You are not authorized to view this lead' });
        }

        // Step 3: Fetch the full lead details
        const lead = await Lead.findById(id)
            .populate({
                path: 'client',
                select: 'name email phone w_phone e_id'
            })
            .populate({
                path: 'created_by',
                select: 'name role'
            })
            .populate({
                path: 'selected_users',
                match: { role: { $nin: ['CEO', 'MD', 'Developer', 'Marketing'] } },
                select: 'name role image branch',
                populate: {
                    path: 'branch',
                    select: 'name'
                }
            })
            .populate('pipeline_id', 'name')
            .populate('product_stage', 'name')
            .populate('lead_type', 'name')
            .populate('source', 'name')
            .populate('products', 'name')
            .populate('branch', 'name')
            .populate('labels', 'name color')
            .populate({
                path: 'phonebookcomments',
                populate: {
                    path: 'user',
                    select: 'name image'
                },
                select: 'remarks createdAt'
            })
            .populate({
                path: 'messages',
                populate: [
                    { path: 'client', select: 'name' },
                    { path: 'user', select: 'name' }
                ]
            })
            .populate({
                path: 'discussions',
                populate: { path: 'created_by', select: 'name image' }
            })
            .populate({
                path: 'files',
            })
            .populate({
                path: 'transfer_from.pipeline',
                select: 'name'
            })
            .populate({
                path: 'transfer_from.branch',
                select: 'name'
            })
            .populate({
                path: 'transfer_from.product_stage',
                select: 'name'
            })
            .populate({
                path: 'transfer_from.products',
                select: 'name'
            })
            .populate({
                path: 'ref_hod',
                select: 'name role'
            })
            .populate({
                path: 'ref_hom',
                select: 'name role'
            })
            .populate({
                path: 'ref_manager',
                select: 'name role'
            })
            .populate({
                path: 'activity_logs',
                populate: {
                    path: 'user_id',
                    select: 'name image'
                }
            });

        if (!lead) {
            return res.status(404).json({ message: 'Lead details not found after population' });
        }

        res.status(200).json(lead);
    } catch (error) {
        console.error('Error fetching lead:', error.message, error.stack);

        if (error.name === 'CastError') {
            return res.status(400).json({ message: 'Invalid data type in query' });
        }

        res.status(500).json({ message: 'Server error', error: error.message });
    }
});
// Update product_stage of a lead
router.put('/update-product-stage/:leadId', isAuth, hasPermission(['update_product_stage']), async (req, res) => {
    const { leadId } = req.params;
    const { newProductStageId } = req.body;

    if (!newProductStageId) {
        return res.status(400).json({ message: 'New product stage ID is required' });
    }

    try {
        const newProductStage = await ProductStage.findById(newProductStageId);
        if (!newProductStage) {
            return res.status(404).json({ message: 'Product stage not found' });
        }

        const lead = await Lead.findById(leadId).populate('product_stage selected_users client');
        if (!lead) {
            return res.status(404).json({ message: 'Lead not found' });
        }

        // Check if the user is authorized
        if (!lead.selected_users.some(user => user._id.equals(req.user._id))) {
            return res.status(403).json({ message: 'You are not authorized to update this lead' });
        }

        const previousStageName = lead.product_stage.name; // Store the previous stage name

        // Check if the product stage is already at the desired value
        if (previousStageName === newProductStage.name) {
            return res.status(200).json({ message: 'Product stage is already at the desired value', lead });
        }

        // Create an activity log for the update
        const activityLog = new ActivityLog({
            user_id: req.user._id,
            log_type: 'Product Stage Update',
            remark: `Product Stage of ${lead.client.name} has been changed from ${previousStageName} to ${newProductStage.name}`,
            created_at: Date.now(),
            updated_at: Date.now(),
        });
        const savedActivityLog = await activityLog.save();

        // Update the lead with the new product stage and log
        lead.product_stage = newProductStage._id;
        lead.updated_at = Date.now();
        lead.activity_logs.push(savedActivityLog._id);
        await lead.save();

        const io = getIO(); // Initialize socket IO
        const notifications = [];

        // Filter out users with roles that should not receive notifications
        const usersToNotify = lead.selected_users.filter(user =>
            !['CEO', 'MD', 'Developer', 'Super Admin'].includes(user.role)
        );

        // Send notification to each selected user
        for (const user of usersToNotify) {
            // Create and save the notification using the polymorphic reference
            const newNotification = new Notification({
                receiver: user._id,
                sender: req.user._id, // Save the sender's user ID
                message: `Product Stage of ${lead.client.name} has been changed from ${previousStageName} to ${newProductStage.name}`,
                reference_id: lead._id,
                notification_type: 'Lead', // Polymorphic reference to Lead
                created_at: Date.now(),
            });

            const savedNotification = await newNotification.save();
            notifications.push(savedNotification);

            // Fetch the sender's details (name and image)
            const sender = await User.findById(req.user._id);

            // Emit notification to the correct user room via WebSockets
            io.to(`user_${user._id}`).emit('notification', {
                message: newNotification.message,
                referenceId: savedNotification.reference_id, // Send the lead's ID
                notificationType: savedNotification.notification_type, // Send the polymorphic type
                notificationId: savedNotification._id, // Send the notification ID
                sender: {
                    name: sender.name, // Sender's name
                    image: sender.image, // Sender's image
                },
                createdAt: savedNotification.created_at,
            });
        }

        // Respond with success
        res.status(200).json({
            message: 'Product stage updated successfully, notifications sent',
            lead,
            activity_log: savedActivityLog,
            notifications,
        });
    } catch (error) {
        console.error('Error updating product stage:', error);
        res.status(500).json({ message: 'Server error', error });
    }
});
router.put('/restore-lead/:id', isAuth, async (req, res) => {
    try {
        const { description, branch, product_stage, products, pipeline_id } = req.body;
        const leadId = req.params.id;

        // Convert to ObjectIds where necessary
        const branchId = new mongoose.Types.ObjectId(String(branch));
        const productStageId = new mongoose.Types.ObjectId(String(product_stage));
        const productId = new mongoose.Types.ObjectId(String(products));
        const pipelineId = new mongoose.Types.ObjectId(String(pipeline_id));

        // Check for product_stage validity
        const validProductStage = await ProductStage.findById(productStageId);
        if (!validProductStage) {
            return res.status(400).json({ message: 'Invalid product stage' });
        }

        // Find the lead by ID to get previous values
        const lead = await Lead.findById(leadId)
            .populate('branch', 'name')
            .populate('product_stage', 'name')
            .populate('products', 'name')
            .populate('pipeline_id', 'name')
            .exec();

        if (!lead) {
            return res.status(404).json({ message: 'Lead not found' });
        }

        // Prepare previous values for logging and comparison
        const previousProductId = lead.products?.toString();
        const previousPipelineId = lead.pipeline_id?.toString();

        let selectedUsers;

        // Check if products or pipeline_id have changed
        if (previousProductId !== productId.toString() || previousPipelineId !== pipelineId.toString()) {
            // Fetch new selected users based on the updated pipeline and branch
            const ceoUsers = await User.find({ role: 'CEO' }).select('_id name');
            const superadminUsers = await User.find({ role: 'Super Admin' }).select('_id name');
            const mdUsers = await User.find({ role: 'MD' }).select('_id name');
            const managerUsers = await User.find({
                $or: [
                    { role: 'Manager', branch: branchId, pipeline: pipelineId },
                    { role: 'Manager', branch: null, pipeline: pipelineId }
                ]
            }).select('_id name');
            const hodUsers = await User.find({ role: 'HOD', products: productId }).select('_id name');

            // Combine all selected user IDs, ensuring they are unique
            const allSelectedUserIds = [
                ...new Set([
                    ...ceoUsers.map(user => user._id.toString()),
                    ...superadminUsers.map(user => user._id.toString()),
                    ...mdUsers.map(user => user._id.toString()),
                    ...hodUsers.map(user => user._id.toString()),
                    ...managerUsers.map(user => user._id.toString())
                ])
            ];

            // Update selected users with new unique IDs
            selectedUsers = allSelectedUserIds;
        } else {
            // Retain the existing selected_users if products and pipeline_id are the same
            selectedUsers = lead.selected_users;
        }

        // Prepare previous values for logging
        const previousBranchName = lead.branch?.name || 'N/A';
        const previousProductStageName = (await ProductStage.findById(lead.product_stage)).name || 'N/A';
        const previousProductName = (await Product.findById(lead.products)).name || 'N/A';
        const previousPipelineName = (await Pipeline.findById(lead.pipeline_id)).name || 'N/A';

        // Update the lead with new values
        const updatedLead = await Lead.findByIdAndUpdate(
            leadId,
            {
                is_reject: false,
                description,
                branch: branchId,
                product_stage: productStageId,
                products: productId,
                pipeline_id: pipelineId,
                selected_users: selectedUsers
            },
            { new: true }
        ).exec();

        if (!updatedLead) {
            return res.status(404).json({ message: 'Lead not found' });
        }

        // Fetch new values for logging
        const newBranchName = (await Branch.findById(branchId)).name;
        const newProductStageName = (await ProductStage.findById(productStageId)).name;
        const newProductName = (await Product.findById(productId)).name;
        const newPipelineName = (await Pipeline.findById(pipelineId)).name;

        // Log the restoration activity with previous and new values
        const activityLog = new ActivityLog({
            user_id: req.user._id,
            log_type: 'Lead Restoration',
            remark: `Lead restored. Previous - Branch: ${previousBranchName}, Product Stage: ${previousProductStageName}, Product: ${previousProductName}, Pipeline: ${previousPipelineName}. New - Branch: ${newBranchName}, Product Stage: ${newProductStageName}, Product: ${newProductName}, Pipeline: ${newPipelineName}.`,
            created_at: Date.now(),
            updated_at: Date.now()
        });
        await activityLog.save();

        // Add the activity log ID to the lead's activity logs
        updatedLead.activity_logs.push(activityLog._id);
        await updatedLead.save();

        res.status(200).json(updatedLead);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});
router.put('/edit-lead/:id', isAuth, hasPermission(['edit_lead']), async (req, res) => {
    try {
        const {
            clientPhone,
            clientName,
            clientEmail,
            cliente_id,
            clientw_phone,
            product_stage,
            company_Name,
            lead_type,
            pipeline,
            products,
            source,
            description,
        } = req.body;
        const UserId = req.user._id;
        const leadId = req.params.id;
        const productStageId = new mongoose.Types.ObjectId(String(product_stage));
        const leadTypeId = new mongoose.Types.ObjectId(String(lead_type));
        const pipelineId = new mongoose.Types.ObjectId(String(pipeline));
        const sourceId = new mongoose.Types.ObjectId(String(source));
        const productId = new mongoose.Types.ObjectId(String(products));

        // Check for product_stage validity
        const validProductStage = await ProductStage.findById(productStageId);
        if (!validProductStage) {
            return res.status(400).json({ message: 'Invalid product stage' });
        }

        // Find the lead to get the previous state
        const lead = await Lead.findById(leadId).populate('selected_users', 'name')
            .populate('client', 'name').exec();
        if (!lead) {
            return res.status(404).json({ message: 'Lead not found' });
        }
        let client = await Client.findOne({ phone: clientPhone });

        // Capture the previous state of the lead
        const previousState = {
            clientName: client?.name,
            clientEmail: client?.email,
            clientPhone: client?.phone,
            cliente_id: client?.e_id,
            clientw_phone: client?.w_phone,
            company_Name: lead?.company_Name || null,
            product_stage: (await ProductStage.findById(lead.product_stage).select('name')).name,
            lead_type: (await LeadType.findById(lead.lead_type).select('name')).name,
            pipeline_id: (await Pipeline.findById(lead.pipeline_id).select('name')).name,
            source: (await Source.findById(lead.source).select('name')).name,
            products: (await Product.findById(lead.products).select('name')).name,
            description: lead.description,
            selected_users: lead.selected_users.map(user => ({ id: user._id.toString(), name: user.name }))
        };

        // Track client updates 
        let clientUpdated = false;

        // Update client details (name, email, phone, etc.)
        if (clientName && client?.name !== clientName) {
            client.name = clientName;
            clientUpdated = true;
        }
        if (clientEmail && client?.email !== clientEmail) {
            client.email = clientEmail;
            clientUpdated = true;
        }
        if (clientPhone && client?.phone !== clientPhone) {
            client.phone = clientPhone;
            clientUpdated = true;
        }
        if (clientw_phone && client?.w_phone !== clientw_phone) {
            client.w_phone = clientw_phone;
            clientUpdated = true;
        }
        if (cliente_id && client?.e_id !== cliente_id) {
            client.e_id = cliente_id;
            clientUpdated = true;
        }

        if (clientUpdated) {
            await client.save();
        }

        // Prepare updates for the lead
        const updates = {
            client: client._id,
            updated_by: req.user._id,
            pipeline_id: pipelineId,
            lead_type: leadTypeId,
            source: sourceId,
            product_stage: productStageId,
            products: productId,
            company_Name,
            description,
        };

        // Update the lead
        const updatedLead = await Lead.findByIdAndUpdate(leadId, updates, { new: true })
            .populate('selected_users', 'name').exec();

        if (!updatedLead) {
            return res.status(404).json({ message: 'Lead not found' });
        }

        // Capture the new state of the lead
        const newState = {
            clientName: (await Client.findById(updatedLead.client)).name,
            clientEmail: (await Client.findById(updatedLead.client)).email,
            clientPhone: (await Client.findById(updatedLead.client)).phone,
            product_stage: (await ProductStage.findById(updatedLead.product_stage).select('name')).name,
            lead_type: (await LeadType.findById(updatedLead.lead_type).select('name')).name,
            pipeline_id: (await Pipeline.findById(updatedLead.pipeline_id).select('name')).name,
            source: (await Source.findById(updatedLead.source).select('name')).name,
            products: (await Product.findById(updatedLead.products).select('name')).name,
            description: updatedLead.description,
            company_Name: updatedLead.company_Name,
        };

        // Prepare the changes for activity log and notification
        const changes = [];
        const notificationChanges = [];

        const checkAndPushChange = (key, prev, current) => {
            if (current !== undefined && current !== null && current !== prev) {
                const changeString = `${key} changed from ${prev || 'null'} to ${current || 'undefined'}`;
                changes.push(changeString);
                notificationChanges.push(changeString);
            }
        };

        checkAndPushChange('clientName', previousState.clientName, clientName);
        checkAndPushChange('clientEmail', previousState.clientEmail, clientEmail);
        checkAndPushChange('clientPhone', previousState.clientPhone, clientPhone);
        checkAndPushChange('company_Name', previousState.company_Name, company_Name);
        checkAndPushChange('cliente_id', previousState.cliente_id, cliente_id);
        checkAndPushChange('product_stage', previousState.product_stage, newState.product_stage);
        checkAndPushChange('lead_type', previousState.lead_type, newState.lead_type);
        checkAndPushChange('pipeline_id', previousState.pipeline_id, newState.pipeline_id);
        checkAndPushChange('source', previousState.source, newState.source);
        checkAndPushChange('products', previousState.products, newState.products);
        checkAndPushChange('description', previousState.description, newState.description);

        // Create activity log only if there are changes
        let activityLog = null;
        if (changes.length > 0) {
            activityLog = new ActivityLog({
                user_id: req.user._id,
                log_type: 'Lead Update',
                remark: `Lead updated: ${changes.join(', ')}`,
                created_at: Date.now(),
                updated_at: Date.now()
            });
            await activityLog.save();
        }

        // Push activity log ID to lead if available
        if (activityLog) {
            updatedLead.activity_logs.push(activityLog._id);
            await updatedLead.save();
        }

        // Emit notifications for affected users
        const io = getIO();
        const notifications = [];
        const usersToNotify = updatedLead.selected_users.filter(user =>
            !['CEO', 'MD', 'Developer', 'Super Admin'].includes(user.role)
        );

        for (const notifiedUser of usersToNotify) {
            // Create notification
            const newNotification = new Notification({
                sender: UserId,
                receiver: notifiedUser._id,
                message: `Lead ${lead.client.name} was updated. ${notificationChanges.length ? notificationChanges.join(', ') : 'No changes'}`,
                reference_id: updatedLead._id,
                notification_type: 'Lead',
                created_at: Date.now(),
            });

            // Fix: Use populate without execPopulate
            await newNotification.populate('sender', 'name image');

            const savedNotification = await newNotification.save();
            notifications.push(savedNotification);

            // Emit notification to user via WebSocket
            io.to(`user_${notifiedUser._id}`).emit('notification', {
                sender: {
                    name: newNotification.sender.name,
                    image: newNotification.sender.image,
                },
                message: newNotification.message,
                referenceId: savedNotification.reference_id,
                notificationType: savedNotification.notification_type,
                notificationId: savedNotification._id,
                createdAt: savedNotification.created_at,
            });
        }

        res.status(200).json({
            message: 'Lead updated successfully, notifications sent',
            lead: updatedLead,
            activity_log: activityLog,
            notifications,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});
module.exports = router;
