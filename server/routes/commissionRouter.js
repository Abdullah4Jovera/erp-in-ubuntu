const express = require('express');
const CommissionPayment = require('../models/commissionPaymentModel');
const Deal = require('../models/dealModel');
const User = require('../models/userModel');
const router = express.Router();


router.get('/highest-finance-amount-pipeline', async (req, res) => {
    try {
        // Get the first and last day of the current month
        const startOfMonth = new Date(new Date().setDate(1));
        const endOfMonth = new Date(new Date(startOfMonth).setMonth(startOfMonth.getMonth() + 1));

        // Aggregate deals to calculate the total finance amount per pipeline
        const pipelineData = await Deal.aggregate([
            {
                $match: {
                    created_at: { $gte: startOfMonth, $lt: endOfMonth },
                    is_reject: false, // Only include non-rejected deals
                },
            },
            {
                $lookup: {
                    from: 'servicecommissions', // Assuming the collection is named 'servicecommissions'
                    localField: 'service_commission_id',
                    foreignField: '_id',
                    as: 'service_commission',
                },
            },
            {
                $unwind: '$service_commission',
            },
            {
                $group: {
                    _id: '$pipeline_id',
                    totalFinanceAmount: { $sum: '$service_commission.finance_amount' },
                    dealIds: { $addToSet: '$_id' },
                },
            },
            {
                $sort: { totalFinanceAmount: -1 },
            },
            { $limit: 1 }, // Get the pipeline with the highest finance amount
        ]);

        if (!pipelineData.length) {
            return res.status(404).json({ message: 'No pipeline data found for the current month' });
        }

        const highestFinancePipeline = pipelineData[0];

        // Fetch deals and users associated with the highest-finance pipeline
        const deals = await Deal.find({ _id: { $in: highestFinancePipeline.dealIds } })
            .populate({
                path: 'pipeline_id',
                select: 'name', // Populate pipeline name only
            })
            .populate({
                path: 'selected_users',
                select: 'name image role', // Populate user name, image, and role
            });

        // Extract unique users excluding certain roles
        const users = [...new Map(
            deals.flatMap(deal => deal.selected_users)
                .filter(user => !['CEO', 'MD', 'Super Admin', 'Admin','Marketing'].includes(user.role))
                .map(user => [user._id.toString(), { name: user.name, image: user.image, role: user.role }])
        ).values()];

        return res.status(200).json({
            message: 'Highest finance amount pipeline fetched successfully',
            pipeline: deals.length ? deals[0].pipeline_id : null, // Send populated pipeline info
            totalFinanceAmount: highestFinancePipeline.totalFinanceAmount,
            users,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
});



// Route to store commission payments when collection_status is 100%
router.post('/store-commissions', async (req, res) => { 
    const { dealId, commissionData } = req.body;
 
    try {
        const deal = await Deal.findById(dealId);
        if (!deal) {
            return res.status(400).json({ message: 'Deal not found' });
        }

        const commissionPayments = [];

        for (const { userId, commission } of commissionData) {
            if (commission > 0) { // Only process commissions > 0
                const user = await User.findById(userId);
                if (!user) {
                    return res.status(404).json({ message: `User with ID ${userId} not found` });
                }

                const commissionPayment = new CommissionPayment({
                    dealId,
                    userId,
                    totalCommission: commission,
                    paidCommission: 0,
                    remainingCommission: commission,
                });

                await commissionPayment.save();
                commissionPayments.push(commissionPayment);

                user.commission -= commission; // Deduct the commission from user's balance
                await user.save();
            }
        }

        deal.is_report_generated = true;
        await deal.save();

        return res.status(200).json({
            message: 'Commission payments stored successfully',
            commissionPayments,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
});

 
 
// New route to allow user to pay their commission
router.put('/commissions/pay', async (req, res) => {
    const { userId, dealId, paymentAmount } = req.body;

    try {
        // Validate paymentAmount is a valid number
        if (isNaN(paymentAmount) || paymentAmount <= 0) {
            return res.status(400).json({ message: 'Invalid payment amount' });
        }

        // Find the commission payment for this user and deal
        const commissionPayment = await CommissionPayment.findOne({ userId, dealId });

        if (!commissionPayment) {
            return res.status(404).json({ message: 'No commission record found for this user and deal' });
        }

        // Validate remainingCommission is a valid number
        if (isNaN(commissionPayment.remainingCommission)) {
            return res.status(400).json({ message: 'Invalid remaining commission' });
        }

        // Check if the payment exceeds the remaining commission
        if (paymentAmount > commissionPayment.remainingCommission) {
            return res.status(400).json({ message: 'Payment amount exceeds remaining commission' });
        }

        // Update the paidCommission and remainingCommission
        commissionPayment.paidCommission += paymentAmount;
        commissionPayment.remainingCommission -= paymentAmount;

        // Ensure paidCommission does not exceed totalCommission
        if (commissionPayment.paidCommission > commissionPayment.totalCommission) {
            return res.status(400).json({ message: 'Paid commission exceeds total commission' });
        }

        // Ensure that paidCommission and remainingCommission are valid numbers
        if (isNaN(commissionPayment.paidCommission) || isNaN(commissionPayment.remainingCommission)) {
            return res.status(400).json({ message: 'Invalid commission values' });
        }

        // Save the updated commission payment
        await commissionPayment.save();

        return res.status(200).json({
            message: 'Commission payment updated successfully',
            commissionPayment
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
});

// Route to get all commission payments with populated deal, client, and user details
router.get('/commissions', async (req, res) => { 
    try {
        const commissions = await CommissionPayment.find()
            .populate({
                path: 'dealId',
                select: 'status client_id', // Include client_id in the population
                populate: {
                    path: 'client_id', // Populate the client_id field from the Deal model
                    select: 'name email' // Specify the fields to return from the Client model
                }
            })
            .populate('userId', 'name email'); // Populate user details from the User model

        return res.status(200).json({ commissions });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
});

// Route to get commission payments by deal ID with populated deal, client, and user details
router.get('/commissions/deal/:dealId', async (req, res) => {
    const { dealId } = req.params;

    try {
        const commissions = await CommissionPayment.find({ dealId })
            .populate({
                path: 'dealId',
                select: 'status client_id', // Include client_id in the population
                populate: {
                    path: 'client_id', // Populate the client_id field from the Deal model
                    select: 'name email' // Specify the fields to return from the Client model
                }
            })
            .populate('userId', 'name email'); // Populate user details from the User model

        if (commissions.length === 0) {
            return res.status(404).json({ message: 'No commissions found for this deal' });
        }

        return res.status(200).json({ commissions });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
});

// Route to get commission payments by user ID with populated deal, client, and user details
router.get('/commissions/user/:userId', async (req, res) => {
    const { userId } = req.params;

    try {
        const commissions = await CommissionPayment.find({ userId })
            .populate({
                path: 'dealId',
                select: 'status client_id', // Include client_id in the population
                populate: {
                    path: 'client_id', // Populate the client_id field from the Deal model
                    select: 'name email' // Specify the fields to return from the Client model
                }
            })
            .populate('userId', 'name email'); // Populate user details from the User model

        if (commissions.length === 0) {
            return res.status(404).json({ message: 'No commissions found for this user' });
        }

        return res.status(200).json({ commissions });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
});


module.exports = router;
