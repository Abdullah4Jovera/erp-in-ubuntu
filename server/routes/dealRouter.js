// routes/dealRouter.js
const express = require('express');
const router = express.Router(); 
const Deal = require('../models/dealModel'); // Adjust the path to your Deal model
const { isAuth } = require('../utils');
const DealStage = require('../models/dealStageModel');
const DealActivityLog = require('../models/dealActivityLogModel');
const Notification = require('../models/notificationModel');
const { getIO } = require('../socket');
const User = require('../models/userModel');
const path = require('path');


router.get('/get-deals-marketing', async (req, res) => {
  try {
    // Fetch deals where lead_type.name is "Marketing"
    const deals = await Deal.find()
      .populate({
        path: 'lead_type',
        match: { name: 'Marketing' }, // Match only lead types with name 'Marketing'
        select: 'name' // Only select the name field for lead_type
      })
      .populate('client_id', 'name email') // Populate client_id fields
      .populate('created_by', 'name email') // Populate created_by fields
      .populate('pipeline_id', 'name') // Populate pipeline_id fields
      .populate('deal_stage', 'name') // Populate deal_stage fields
      .populate('source_id', 'name') // Populate source_id fields
      .populate('products', 'name') // Populate products fields
      .populate({
        path: 'service_commission_id',
        populate: [
          { path: 'hodsale', select: 'name email' },
          { path: 'salemanager', select: 'name email' },
          { path: 'coordinator', select: 'name email' },
          { path: 'team_leader', select: 'name email' },
          { path: 'salesagent', select: 'name email' },
          { path: 'team_leader_one', select: 'name email' },
          { path: 'sale_agent_one', select: 'name email' },
          { path: 'salemanagerref', select: 'name email' },
          { path: 'agentref', select: 'name email' },
          { path: 'ts_hod', select: 'name email' },
          { path: 'ts_team_leader', select: 'name email' },
          { path: 'tsagent', select: 'name email' },
          { path: 'marketingmanager', select: 'name email' },
        ]
      })
      .populate('activity_logs') // Populate activity logs
      .exec();

    // Filter out deals where lead_type was not populated due to no match
    const filteredDeals = deals.filter(deal => deal.lead_type !== null);

    res.status(200).json(filteredDeals);
  } catch (error) {
    console.error('Error fetching Marketing deals:', error);
    res.status(500).json({ message: 'Error fetching Marketing deals', error });
  }
});

router.get('/rejected-deals', isAuth, async (req, res) => {
  try {
    const userId = req.user._id;
    const userPipeline = req.user.pipeline || []; // Ensure pipeline is an array even if undefined

    // Build the query condition
    const query = { is_reject: true, selected_users: userId };

    // If userPipeline is not empty, add it to the query condition
    if (userPipeline.length > 0) {
      query.pipeline_id = { $in: userPipeline }; // Match pipelines in the user's pipeline array
    }

    // Fetch rejected deals
    const deals = await Deal.find(query)
      .populate({
        path: 'pipeline_id',
        select: 'name',
      })
      .populate({
        path: 'deal_stage',
        select: 'name',
      })
      .populate({
        path: 'products',
        select: 'name',
      })
      .populate({
        path: 'client_id',
        select: 'name email phone',
      })
      .populate({
        path: 'source_id',
        select: 'name',
      })
      .populate({
        path: 'branch',
        select: 'name',
      })
      .select(
        '_id pipeline_id deal_stage products client_id source_id reject_reason company_name branch'
      ); // Select necessary fields

    // Return 404 if no deals are found
    if (deals.length === 0) {
      return res.status(404).json({ message: 'No rejected deals found' });
    }

    // Map through deals to create a response object
    const dealDetails = deals.map((deal) => ({
      id: deal._id,
      pipelineName: deal.pipeline_id?.name || null,
      dealStage: deal.deal_stage?.name || null,
      productId: deal.products?._id || null,
      productName: deal.products?.name || null,
      clientName: deal.client_id?.name || null,
      clientEmail: deal.client_id?.email || null,
      phone: deal.client_id?.phone || null,
      sourceName: deal.source_id?.name || null,
      companyName: deal.company_name || null,
      rejectReason: deal.reject_reason || null,
      branchName: deal.branch?.name || null,
    }));

    // Send the response
    res.status(200).json({ dealDetails });
  } catch (error) {
    console.error('Error fetching rejected deals:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


// Reject deal router
router.put('/reject-deal/:id', isAuth , async (req, res) => {
  try {
      const { reject_reason } = req.body;

      // Validate reject_reason
      if (!reject_reason || reject_reason.trim().length === 0) {
          return res.status(400).json({ message: 'Please enter the rejection reason' });
      }

      // Find the deal
      const deal = await Deal.findById(req.params.id).populate('selected_users');
      if (!deal) {
          return res.status(404).json({ message: 'Deal not found' });
      }

      // Update rejection fields
      deal.is_reject = true;
      deal.reject_reason = reject_reason;
      deal.updated_at = new Date();

      // Save the updated deal
      const updatedDeal = await deal.save();

      // Fetch the sender's details
      const sender = await User.findById(req.user._id);
      if (!sender) {
          return res.status(404).json({ error: 'Sender not found' });
      }

      // Create an activity log
      const activityLog = new DealActivityLog({
          user_id: sender._id,
          deal_id: deal._id,
          log_type: 'Deal Rejection',
          remark: `Deal rejected with reason: '${reject_reason}'`,
          created_at: Date.now(),
      });

      const savedActivityLog = await activityLog.save();

      // Push the activity log ID into the deal's activity_logs array
      deal.deal_activity_logs.push(savedActivityLog._id);
      await deal.save();

      // Notification and Socket.IO logic
      const io = getIO();

      // Filter users to notify based on roles (e.g., Manager, HOD, MD, CEO)
      const rolesToNotify = ['Manager', 'HOD', 'MD', 'CEO'];
      const usersToNotify = deal.selected_users.filter(user =>
          rolesToNotify.includes(user.role)
      );

      const notificationPromises = usersToNotify.map(async (user) => {
          // Create a notification
          const notification = new Notification({
              sender: sender._id,
              receiver: user._id,
              message: `${sender.name} rejected the deal with reason: '${reject_reason}'`,
              reference_id: deal._id,
              notification_type: 'Deal',
              created_at: Date.now(),
          });

          const savedNotification = await notification.save();

          // Emit the notification to the user's socket room
          io.to(`user_${user._id}`).emit('notification', {
              message: notification.message,
              referenceId: savedNotification.reference_id,
              notificationType: savedNotification.notification_type,
              notificationId: savedNotification._id,
              sender: {
                  name: sender.name,
                  image: sender.image,
              },
              createdAt: savedNotification.created_at,
          });

          return savedNotification;
      });

      // Wait for all notifications to be created and sent
      await Promise.all(notificationPromises);

      res.status(200).json({
          message: 'Deal rejected successfully',
          deal: updatedDeal,
          activity_log: savedActivityLog,
      });
  } catch (error) {
      console.error('Error rejecting deal:', error);
      res.status(500).json({ message: 'Error rejecting deal' });
  }
});


// Route to get a single deal by ID
router.get('/get-single-deal/:id', async (req, res) => {
  const { id } = req.params; 
  try {
    const deal = await Deal.findById(id)
      .populate('lead_type', 'name')
      .populate('client_id', 'name email phone e_id') 
      .populate('created_by', 'name email')
      .populate('pipeline_id', 'name')
      .populate('deal_stage', 'name')
      .populate('source_id', 'name')
      .populate('products', 'name')
      .populate({
        path: 'selected_users',
        select: 'name image role',
        populate: {
            path: 'branch', // Assuming the field name for branch in selected_users is "branch"
            select: 'name ' // Replace with the fields you want from the branch
        }
    })
      .populate({
        path: 'lead_id',
        populate: {
          path: 'labels',
          select: 'name color',
        }
      })
      .populate({ 
        path: 'service_commission_id',
        select: '-__v',
        populate: [
            { path: 'hod', select: 'name  role image' },
            { path: 'hom', select: 'name  role image' },
            { path: 'sale_manager', select: 'name  role image' },
            { path: 'ajman_manager', select: 'name  role image ' },
            { path: 'ajman_coordinator', select: 'name  role image' },
            { path: 'ajman_team_leader', select: 'name  role image' },
            { path: 'dubai_manager', select: 'name  role image' },
            { path: 'dubai_coordinator', select: 'name  role image' },
            { path: 'dubaiteam_leader', select: 'name  role image' },
            { path: 'dubaisale_agent', select: 'name  role image' },
            { path: 'ajman_sale_agent', select: 'name  role image' },
            { path: 'coordinator', select: 'name  role image' },
            { path: 'team_leader', select: 'name  role image' },
            { path: 'sales_agent', select: 'name  role image' },
            { path: 'team_leader_one', select: 'name  role image' },
            { path: 'sales_agent_one', select: 'name  role image' },
            { path: 'ts_hod', select: 'name  role image' },
            { path: 'ts_team_leader', select: 'name  role image' },
            { path: 'ts_agent', select: 'name  role image' },
            { path: 'marketing_one', select: 'name  role image' },
            { path: 'marketing_two', select: 'name  role image' },
            { path: 'ref_hod', select: 'name  role image' },
            { path: 'ref_manager', select: 'name  role image' },
            { path: 'ref_hom', select: 'name  role image' },



            { path: 'marketing_three', select: 'name  role image' },
            { path: 'marketing_four', select: 'name  role image' },
            { path: 'developer_one', select: 'name  role image' },
            { path: 'developer_two', select: 'name  role image' },
            { path: 'developerthree', select: 'name  role image' },

            { path: 'developer_four', select: 'name  role image' },
            { path: 'lead_created_by', select: 'name  role image' },
            { path: 'created_by', select: 'name  role image' },

           
        ]
    })

      .populate('deal_activity_logs')
      .populate({
        path: 'lead_id',
        populate: [
            { path: 'client', select: 'name' },
            { path: 'created_by', select: 'name' },
            // { path: 'ref_user', select: 'name' },
            { path: 'selected_users', select: 'name' },
            { path: 'pipeline_id', select: 'name' },
            { path: 'stage', select: 'name' },
            { path: 'product_stage', select: 'name' },
            { path: 'lead_type', select: 'name' }, 
            { path: 'source', select: 'name' },
            { path: 'branch', select: 'name' },
            { path: 'files', select: 'file_path file_name' },
            { 
                path: 'discussions',
                populate: { path: 'created_by', select: 'name' }
            },
            { 
                path: 'activity_logs',
                populate: { path: 'user_id', select: 'name image' }
            }
        ]
    })
    .populate({
      path: 'contract_id', 
      populate: [
          // { path: 'client', select: 'name' }, 
          // { path: 'created_by', select: 'name' },
          // { path: 'ref_user', select: 'name' },
          // { path: 'selected_users', select: 'name' },
          // { path: 'pipeline_id', select: 'name' },
          // { path: 'stage', select: 'name' },
          // { path: 'product_stage', select: 'name' },
          // { path: 'lead_type', select: 'name' }, 
          // { path: 'source', select: 'name' },
          // { path: 'branch', select: 'name' }, 
          // { path: 'files', select: 'file_path file_name' },
          // { 
          //     path: 'discussions',
          //     populate: { path: 'created_by', select: 'name' }
          // },
          { 
              path: 'contract_activity_logs',
              populate: { path: 'user_id', select: 'name image' }
          }
      ]
  });
     

    if (!deal) {
      return res.status(404).json({ message: 'Deal not found' });
    }

    res.status(200).json(deal);
  } catch (error) {
    console.error('Error fetching the deal:', error);
    res.status(500).json({ message: 'Error fetching the deal', error });
  }
});

router.get('/get-deals', isAuth, async (req, res) => {
 
  try {
    // Ensure req.user exists and contains _id (e.g., middleware for authentication)
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const userId = req.user._id; // Get the user ID from the request
    const pipelineId = req.user.pipeline; // Get the pipeline ID from the user

    // Build the filter conditions dynamically based on the presence of pipelineId
    const matchFilter = (additionalFilters = {}) => {
      const filter = {
          selected_users: userId,
          is_converted: false,
          is_reject: false,
          ...additionalFilters,
      };
      // Include pipelineId filter if it's not an empty array
      if (pipelineId && pipelineId.length > 0) {
          filter.pipeline_id = { $in: pipelineId }; // Match any pipeline ID in the array
      }
      return filter;
  };


    
    // Fetch deals with the dynamic filter
    const deals = await Deal.find(matchFilter())
      .populate('client_id', 'name email')
      .populate('created_by', 'name email')
      .populate('pipeline_id', 'name')
      .populate('lead_type', 'name') 
      .populate('deal_stage', 'name')
      .populate('source_id', 'name') 
      .populate('products', 'name') 
      .populate('branch', 'name')
      .populate('selected_users', 'name role image') // Populate selected_users
      .populate({
        path: 'lead_id',
        select: 'labels',
        populate: {
          path: 'labels',
          select: 'name color',
        }
      })
      .populate({
        path: 'service_commission_id',
        // select: 'commission_rate commission_details', // Add fields as per requirement
      })
      .populate('deal_activity_logs');

    res.status(200).json(deals);
  } catch (error) {
    console.error('Error fetching deals:', error);
    res.status(500).json({ message: 'Error fetching deals' });
  }
});



// Update deal stage
router.put('/update-deal-stage/:id', isAuth, async (req, res) => {
  try {
      const { id } = req.params;
      const { deal_stage } = req.body;

      // Validate input
      if (!deal_stage) {
          return res.status(400).json({ error: 'Deal stage is required' });
      }

      // Find the deal and populate necessary fields
      const deal = await Deal.findById(id).populate('deal_stage client_id selected_users');
      if (!deal) {
          return res.status(404).json({ error: 'Deal not found' });
      }

      // Store the previous stage name for logging
      const previousStageName = deal.deal_stage ? deal.deal_stage.name : 'Unknown';

      // Update the deal stage
      deal.deal_stage = deal_stage; // Assume deal_stage is passed as an ObjectId
      deal.updated_at = new Date();
      await deal.save();

      // Fetch the updated deal with the new stage name
      const updatedDeal = await Deal.findById(id).populate('deal_stage');
      const newStageName = updatedDeal.deal_stage ? updatedDeal.deal_stage.name : 'Unknown';

      // Fetch the sender's details
      const sender = await User.findById(req.user._id);
      if (!sender) {
          return res.status(404).json({ error: 'Sender not found' });
      }

      // Create a new activity log entry
      const activityLog = new DealActivityLog({ 
          user_id: sender._id,
          deal_id: deal._id,
          log_type: 'Stage Update',
          remark: `Deal stage changed from '${previousStageName}' to '${newStageName}'`,
          created_at: Date.now(),
      });

      const savedActivityLog = await activityLog.save();

      // Push the activity log ID into the deal's activity_logs array
      deal.deal_activity_logs.push(savedActivityLog._id);
      await deal.save();

      // Notification and Socket.IO logic
      const io = getIO();

      // Filter users with roles Manager, HOD, MD, or CEO
      const rolesToNotify = ['Manager', 'HOD', 'MD', 'CEO'];
      const usersToNotify = deal.selected_users.filter(user =>
          rolesToNotify.includes(user.role)
      );

      const notificationPromises = usersToNotify.map(async (user) => {
          // Create a new notification
          const notification = new Notification({
              sender: sender._id,
              receiver: user._id,
              message: `${sender.name} updated the deal stage from '${previousStageName}' to '${newStageName}'`,
              reference_id: deal._id,
              notification_type: 'Deal',
              created_at: Date.now(),
          });

          const savedNotification = await notification.save();

          // Emit the notification to the user's socket room
          io.to(`user_${user._id}`).emit('notification', {
              message: notification.message,
              referenceId: savedNotification.reference_id,
              notificationType: savedNotification.notification_type,
              notificationId: savedNotification._id,
              sender: {
                  name: sender.name, // Sender's name
                  image: sender.image, // Sender's image
              },
              createdAt: savedNotification.created_at,
          });

          return savedNotification;
      });

      // Wait for all notifications to be created and sent
      await Promise.all(notificationPromises);

      res.status(200).json({
          message: 'Deal stage updated successfully',
          deal: updatedDeal,
          activity_log: savedActivityLog,
      });
  } catch (error) {
      console.error('Error updating deal stage:', error);
      res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/update-collection-status/:id', async (req, res) => {
  try {
      const { collection_status } = req.body;

      // Validate collection_status
      const validStatuses = ['10%', '0%', '50%', '100%'];
      if (!validStatuses.includes(collection_status)) {
          return res.status(400).json({ message: 'Invalid collection status' });
      }

      // Find the deal
      const deal = await Deal.findById(req.params.id).populate('selected_users');
      if (!deal) {
          return res.status(404).json({ message: 'Deal not found' });
      }

      // Store previous collection status for logging
      const previousStatus = deal.collection_status || 'N/A';

      // Update the collection status
      deal.collection_status = collection_status;
      deal.updated_at = new Date(); // Update the timestamp

      // Save the updated deal
      const updatedDeal = await deal.save();

      // Fetch the sender's details
      const sender = await User.findById(req.user._id);
      if (!sender) {
          return res.status(404).json({ error: 'Sender not found' });
      }

      // Create an activity log
      const activityLog = new DealActivityLog({
          user_id: sender._id,
          deal_id: deal._id,
          log_type: 'Collection Status Update',
          remark: `Collection status updated from '${previousStatus}' to '${collection_status}'`,
          created_at: Date.now(),
      });

      const savedActivityLog = await activityLog.save();

      // Push the activity log ID into the deal's activity_logs array
      deal.activity_logs.push(savedActivityLog._id);
      await deal.save();

      // Notification and Socket.IO logic
      const io = getIO();

      // Filter users to notify based on roles (e.g., Manager, HOD, MD, CEO)
      const rolesToNotify = ['Manager', 'HOD', 'MD', 'CEO'];
      const usersToNotify = deal.selected_users.filter(user =>
          rolesToNotify.includes(user.role)
      );

      const notificationPromises = usersToNotify.map(async (user) => {
          // Create a notification
          const notification = new Notification({
              sender: sender._id,
              receiver: user._id,
              message: `${sender.name} updated the collection status from '${previousStatus}' to '${collection_status}'`,
              reference_id: deal._id,
              notification_type: 'Collection',
              created_at: Date.now(),
          });

          const savedNotification = await notification.save();

          // Emit the notification to the user's socket room
          io.to(`user_${user._id}`).emit('notification', {
              message: notification.message,
              referenceId: savedNotification.reference_id,
              notificationType: savedNotification.notification_type,
              notificationId: savedNotification._id,
              sender: {
                  name: sender.name,
                  image: sender.image,
              },
              createdAt: savedNotification.created_at,
          });

          return savedNotification;
      });

      // Wait for all notifications to be created and sent
      await Promise.all(notificationPromises);

      res.status(200).json({
          message: 'Collection status updated successfully',
          deal: updatedDeal,
          activity_log: savedActivityLog,
      });
  } catch (error) {
      console.error('Error updating collection status:', error);
      res.status(500).json({ message: 'Error updating collection status' });
  }
});

module.exports = router;
