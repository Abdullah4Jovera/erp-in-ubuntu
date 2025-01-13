const express = require('express');
const CommissionPayment = require('../models/commissionPaymentModel');
const User = require('../models/userModel');
const leadModel = require('../models/leadModel');
const { isAuth } = require('../utils'); 
const contractModel = require('../models/contractModel');
const dealModel = require('../models/dealModel');
const Deal = require('../models/dealModel');
const router = express.Router();
const mongoose = require('mongoose');
const Pipeline = require('../models/pipelineModel');
const DealStage = require('../models/dealStageModel');
const ObjectId = mongoose.Types.ObjectId;  
             
////CEO Dashboard APIS
router.get('/all-pipelines-commission', async (req, res) => {
    try {
        const startOfMonth = new Date(new Date().setDate(1)); // First day of the current month
        const endOfMonth = new Date(new Date(startOfMonth).setMonth(startOfMonth.getMonth() + 1)); // First day of the next month

        // Fetch all pipelines
        const allPipelines = await Pipeline.find({}, { _id: 1, name: 1 });

        // Helper function to calculate months range for the last 12 months
        const getLast12Months = () => {
            const months = [];
            const today = new Date();
            for (let i = 11; i >= 0; i--) {
                const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
                const start = new Date(date.getFullYear(), date.getMonth(), 1);
                const end = new Date(date.getFullYear(), date.getMonth() + 1, 1);
                months.push({ start, end, label: `${start.toLocaleString('default', { month: 'short' })} ${start.getFullYear()}` });
            }
            return months;
        };

        const last12Months = getLast12Months();

        // Aggregate deals for all commission data
        const commissionData = await Deal.aggregate([
            {
                $match: {
                    is_reject: false, // Exclude rejected deals
                    delstatus: false, // Exclude deleted deals
                },
            },
            {
                $lookup: {
                    from: 'servicecommissions', // Assuming the collection is 'servicecommissions'
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
                    totalAllTimeCommission: { $sum: '$service_commission.without_vat_commission' },
                    currentMonthCommission: {
                        $sum: {
                            $cond: [
                                { $and: [{ $gte: ['$created_at', startOfMonth] }, { $lt: ['$created_at', endOfMonth] }] },
                                '$service_commission.without_vat_commission',
                                0,
                            ],
                        },
                    },
                    monthlyCommissions: {
                        $push: {
                            createdAt: '$created_at',
                            commission: '$service_commission.without_vat_commission',
                        },
                    },
                },
            },
        ]);

        // Map commission data to pipelines
        const commissionDataMap = commissionData.reduce((acc, item) => {
            acc[item._id.toString()] = {
                totalAllTimeCommission: item.totalAllTimeCommission || 0,
                currentMonthCommission: item.currentMonthCommission || 0,
                monthlyCommissions: item.monthlyCommissions || [],
            };
            return acc;
        }, {});

        // Process data for all pipelines
        const pipelinesWithCommission = allPipelines.map((pipeline) => {
            const data = commissionDataMap[pipeline._id.toString()] || {
                totalAllTimeCommission: 0,
                currentMonthCommission: 0,
                monthlyCommissions: [],
            };

            // Calculate last 12 months' commissions
            const last12MonthsCommissions = last12Months.map((month) => {
                const total = data.monthlyCommissions
                    .filter((item) => item.createdAt >= month.start && item.createdAt < month.end)
                    .reduce((sum, item) => sum + item.commission, 0);
                return { label: month.label, total };
            });

            return {
                _id: pipeline._id,
                pipelineName: pipeline.name,
                totalAllTimeCommission: data.totalAllTimeCommission,
                currentMonthCommission: data.currentMonthCommission,
                last12MonthsCommissions,
            };
        });

        // Sort by total all-time commission
        pipelinesWithCommission.sort((a, b) => b.totalAllTimeCommission - a.totalAllTimeCommission);

        return res.status(200).json({
            message: 'Commission data fetched successfully',
            pipelines: pipelinesWithCommission,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
});

router.get('/all-commission-status',  async (req, res) => {
    try {
        const aggregateData = async (model, match, groupFields) => {
            const data = await model.aggregate([
                { $match: match },
                { $group: groupFields },
                { $project: { _id: 0 } },
            ]);
            return data.length > 0 ? data[0] : { totalPaidCommission: 0, totalRemainingCommission: 0, totalCommission: 0 };
        };

        const allTimeCommissionSummary = await aggregateData(
            CommissionPayment,
            {}, // No userId filter here
            {
                _id: null,
                totalPaidCommission: { $sum: "$paidCommission" },
                totalRemainingCommission: { $sum: "$remainingCommission" },
                totalCommission: { $sum: "$totalCommission" },
            }
        );

        const startOfCurrentMonth = new Date(new Date().setDate(1));
        const endOfCurrentMonth = new Date(new Date(startOfCurrentMonth).setMonth(startOfCurrentMonth.getMonth() + 1));

        const currentMonthCommissionSummary = await aggregateData(
            CommissionPayment,
            { createdAt: { $gte: startOfCurrentMonth, $lt: endOfCurrentMonth } }, // No userId filter
            {
                _id: null,
                totalPaidCommission: { $sum: "$paidCommission" },
                totalRemainingCommission: { $sum: "$remainingCommission" },
                totalCommission: { $sum: "$totalCommission" },
            }
        );

        const monthWiseStats = [];
        const currentDate = new Date();

        for (let i = 0; i < 12; i++) {
            const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
            const endOfMonth = new Date(new Date(startOfMonth).setMonth(startOfMonth.getMonth() + 1));

            const stats = await aggregateData(
                CommissionPayment,
                { createdAt: { $gte: startOfMonth, $lt: endOfMonth } }, // No userId filter
                {
                    _id: null,
                    totalPaidCommission: { $sum: "$paidCommission" },
                    totalRemainingCommission: { $sum: "$remainingCommission" },
                    totalCommission: { $sum: "$totalCommission" },
                }
            );

            const monthString = `${(startOfMonth.getMonth() + 1).toString().padStart(2, '0')}-${startOfMonth.getFullYear()}`;
            monthWiseStats.unshift({ month: monthString, ...stats });
        }

        return res.status(200).json({
            message: 'All commission stats fetched successfully',
            allTimeStats: allTimeCommissionSummary,
            currentMonthStats: currentMonthCommissionSummary,
            monthWiseStats,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
});

router.get('/dashboard-status-users-by-pipeline', isAuth, async (req, res) => {
    try {
        const pipelineIds = req.user.pipeline.map(pipeline => new ObjectId(pipeline._id));

        if (!pipelineIds || pipelineIds.length === 0) {
            return res.status(400).json({ message: 'No pipelines associated with the user' });
        }

        // Helper to get the start and end dates for a month
        const getMonthlyDateRange = (date) => {
            const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
            const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59); // Last day of the month
            return { startOfMonth, endOfMonth };
        };

        // Helper to calculate stats for the last 12 months
        const getLast12MonthsStats = async (model, userId, pipelineId) => {
            const monthlyStats = [];
            const currentDate = new Date();

            for (let i = 0; i < 12; i++) {
                const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
                const { startOfMonth, endOfMonth } = getMonthlyDateRange(date);

                const total = await model.countDocuments({
                    created_by: userId,
                    pipeline_id: pipelineId,
                    created_at: { $gte: startOfMonth, $lt: endOfMonth },
                });

                const rejected = await model.countDocuments({
                    created_by: userId,
                    pipeline_id: pipelineId,
                    created_at: { $gte: startOfMonth, $lt: endOfMonth },
                    is_reject: true,
                });

                monthlyStats.unshift({
                    month: `${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getFullYear()}`, // MM-YYYY format
                    total,
                    rejected,
                });
            }
            return monthlyStats;
        };

        // Utility function to create match filters for finance stats
        const matchFilter = (userId, pipelineId, additionalFilters = {}) => ({
            created_by: userId,
            pipeline_id: pipelineId,
            is_converted: false,
            is_reject: false,
            ...additionalFilters,
        });

        // Utility function to aggregate finance data for users
        const aggregateUserFinanceData = async (userId, pipelineId, dateFilter = {}) => {
            const financeData = await dealModel.aggregate([
                { $match: { ...matchFilter(userId, pipelineId, dateFilter) } },
                {
                    $lookup: {
                        from: "servicecommissions",
                        localField: "service_commission_id",
                        foreignField: "_id",
                        as: "serviceCommission",
                    },
                },
                { $unwind: "$serviceCommission" },
                {
                    $group: {
                        _id: null,
                        totalFinanceAmount: { $sum: "$serviceCommission.finance_amount" },
                    },
                },
                {
                    $project: {
                        _id: 0,
                        totalFinanceAmount: 1,
                    },
                },
            ]);
            return financeData.length > 0 ? financeData[0].totalFinanceAmount : 0;
        };

        // Function to get month-wise finance stats for a user, including their target
        const getMonthWiseStats = async (userId, pipelineId) => {
            const monthWiseStats = [];
            const currentDate = new Date();

            // Fetch the user's target from the User model
            const user = await User.findById(userId).select('target');

            for (let i = 0; i < 12; i++) {
                const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
                const { startOfMonth, endOfMonth } = getMonthlyDateRange(date);

                const financeAmount = await aggregateUserFinanceData(userId, pipelineId, {
                    created_at: { $gte: startOfMonth, $lt: endOfMonth },
                });

                const monthString = `${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getFullYear()}`; // Format as MM-YYYY
                monthWiseStats.unshift({
                    month: monthString,
                    financeAmount,
                    target: user.target, // Include the user's target for each month
                });
            }
            return monthWiseStats;
        };

        // Fetch pipelines
        const pipelines = await Pipeline.find({ _id: { $in: pipelineIds } }, { name: 1 });

        // Fetch stats for each pipeline and its users, excluding specific roles
        const pipelineStats = await Promise.all(
            pipelines.map(async ({ _id: pipelineId, name: pipelineName }) => {
                // Fetch users associated with the pipeline, excluding specific roles
                const excludedRoles = [
                    "TS Agent",
                    "TS Team Leader",
                    "CEO",
                    "MD",
                    "Super Admin",
                    "Developer",
                    "Marketing",
                    "Manager",
                    "HOM",
                    "HOD"
                ];

                const users = await User.find(
                    {
                        pipeline: pipelineId,
                        role: { $nin: excludedRoles }, // Exclude specified roles
                    },
                    { name: 1, target: 1 }
                );

                const userStats = await Promise.all(
                    users.map(async ({ _id: userId, name: userName, target }) => {
                        // All-time stats for leads, contracts, and deals
                        const totalLeads = await leadModel.countDocuments({ created_by: userId, pipeline_id: pipelineId });
                        const totalContracts = await contractModel.countDocuments({ created_by: userId, pipeline_id: pipelineId });
                        const totalDeals = await dealModel.countDocuments({ created_by: userId, pipeline_id: pipelineId });

                        const rejectedLeads = await leadModel.countDocuments({
                            created_by: userId,
                            pipeline_id: pipelineId,
                            is_reject: true,
                        });
                        const rejectedContracts = await contractModel.countDocuments({
                            created_by: userId,
                            pipeline_id: pipelineId,
                            is_reject: true,
                        });
                        const rejectedDeals = await dealModel.countDocuments({
                            created_by: userId,
                            pipeline_id: pipelineId,
                            is_reject: true,
                        });

                        // Finance stats for the user
                        const allTimeFinanceSummary = await aggregateUserFinanceData(userId, pipelineId);
                        const monthWiseFinanceStats = await getMonthWiseStats(userId, pipelineId);

                        // Last 12 months stats for leads, contracts, and deals
                        const monthlyLeads = await getLast12MonthsStats(leadModel, userId, pipelineId);
                        const monthlyContracts = await getLast12MonthsStats(contractModel, userId, pipelineId);
                        const monthlyDeals = await getLast12MonthsStats(dealModel, userId, pipelineId);

                        return {
                            userId,
                            userName,
                            target, // Include target here
                            stats: {
                                totalLeads,
                                rejectedLeads,
                                totalContracts,
                                rejectedContracts,
                                totalDeals,
                                rejectedDeals,
                            },
                            financeStats: {
                                allTimeFinanceAmount: allTimeFinanceSummary,
                                monthWiseFinanceStats: monthWiseFinanceStats,
                            },
                            monthlyStats: {
                                leads: monthlyLeads,
                                contracts: monthlyContracts,
                                deals: monthlyDeals,
                            },
                        };
                    })
                );

                return {
                    pipelineId,
                    pipelineName,
                    userStats,
                };
            })
        );

        return res.status(200).json({
            message: 'Dashboard status by pipeline with finance stats fetched successfully',
            pipelineStats,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
});

router.get('/dashboard-status-by-product', isAuth, async (req, res) => {
    try {
        const { products } = req.user; // Get the product string from req.user

        if (!products) {
            return res.status(400).json({ message: 'Product ID is required' });
        }

        const productArray = [products]; // Convert the product string into an array

        // Helper function for aggregate queries
        const matchFilter = (productId, additionalFilters = {}) => ({
            products: productId,
            is_converted: false,
            is_reject: false,
            ...additionalFilters,
        });

        // Function to get stats for a given product and month
        const getProductStats = async (productId, month) => {
            const startOfMonth = new Date(new Date().setMonth(month, 1));
            const endOfMonth = new Date(new Date(startOfMonth).setMonth(startOfMonth.getMonth() + 1));

            const stats = {
                totalContracts: await contractModel.countDocuments(matchFilter(productId, { updated_at: { $gte: startOfMonth, $lt: endOfMonth } })),
                rejectedContracts: await contractModel.countDocuments({ 
                    products: productId,
                    is_reject: true, 
                    updated_at: { $gte: startOfMonth, $lt: endOfMonth } 
                }),
                totalLeads: await leadModel.countDocuments(matchFilter(productId, { created_at: { $gte: startOfMonth, $lt: endOfMonth } })),
                rejectedLeads: await leadModel.countDocuments({ 
                    products: productId,
                    is_reject: true, 
                    created_at: { $gte: startOfMonth, $lt: endOfMonth } 
                }),
                totalDeals: await dealModel.countDocuments(matchFilter(productId, { created_at: { $gte: startOfMonth, $lt: endOfMonth } })),
                rejectedDeals: await dealModel.countDocuments({ 
                    products: productId,
                    is_reject: true, 
                    created_at: { $gte: startOfMonth, $lt: endOfMonth } 
                })
            };

            return stats;
        };

        const monthWiseStats = [];

        // Fetch statistics for each product and each month of the current year
        for (const productId of productArray) {
            const productStats = [];

            for (let month = 0; month < 12; month++) {
                const stats = await getProductStats(productId, month);
                const monthString = `${(month + 1).toString().padStart(2, '0')}-${new Date().getFullYear()}`; // Format month as MM-YYYY

                productStats.push({
                    month: monthString,
                    stats
                });
            }

            monthWiseStats.push({ productId, productStats });
        }

        // Get current month stats for each product
        const startOfMonth = new Date(new Date().setDate(1));
        const endOfMonth = new Date(new Date(startOfMonth).setMonth(startOfMonth.getMonth() + 1));

        const currentMonthStats = await Promise.all(
            productArray.map(async (productId) => ({
                productId,
                stats: {
                    totalContracts: await contractModel.countDocuments(matchFilter(productId, { updated_at: { $gte: startOfMonth, $lt: endOfMonth } })),
                    totalLeads: await leadModel.countDocuments(matchFilter(productId, { created_at: { $gte: startOfMonth, $lt: endOfMonth } })),
                    totalDeals: await dealModel.countDocuments(matchFilter(productId, { created_at: { $gte: startOfMonth, $lt: endOfMonth } })),
                    rejectedContracts: await contractModel.countDocuments({ products: productId, is_reject: true, updated_at: { $gte: startOfMonth, $lt: endOfMonth } }),
                    rejectedLeads: await leadModel.countDocuments({ products: productId, is_reject: true, created_at: { $gte: startOfMonth, $lt: endOfMonth } }),
                    rejectedDeals: await dealModel.countDocuments({ products: productId, is_reject: true, created_at: { $gte: startOfMonth, $lt: endOfMonth } })
                }
            }))
        );

        return res.status(200).json({
            message: 'Product dashboard stats fetched successfully',
            currentMonthStats, // Returns stats for the current month for each product
            monthWiseStats // Returns stats for each product for each month
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
});
router.get('/dashboard-status-by-pipeline', isAuth, async (req, res) => {
    try {
        const pipelineIds = req.user.pipeline.map(pipeline => new ObjectId(pipeline._id));

        if (!pipelineIds || pipelineIds.length === 0) {
            return res.status(400).json({ message: 'No pipelines associated with the user' });
        }

        const userProducts = req.user.products && req.user.products.length > 0 ? req.user.products : null;

        // Helper to get the start and end dates for a month
        const getMonthlyDateRange = (date) => {
            const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
            const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59); // Last day of the month
            return { startOfMonth, endOfMonth };
        };

        // Helper to calculate stats for the last 12 months
        const getLast12MonthsStats = async (model, pipelineId, userProducts) => {
            const monthlyStats = [];
            const currentDate = new Date();

            for (let i = 0; i < 12; i++) {
                const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
                const { startOfMonth, endOfMonth } = getMonthlyDateRange(date);

                const filterCriteria = {
                    pipeline_id: pipelineId,
                    created_at: { $gte: startOfMonth, $lt: endOfMonth },
                };

                if (userProducts) {
                    filterCriteria.products = { $in: userProducts }; // Filter by products
                }

                const total = await model.countDocuments(filterCriteria);

                const rejected = await model.countDocuments({
                    ...filterCriteria,
                    is_reject: true,
                });

                monthlyStats.unshift({
                    month: `${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getFullYear()}`, // MM-YYYY format
                    total,
                    rejected,
                });
            }
            return monthlyStats;
        };

        // Fetch pipelines
        const pipelines = await Pipeline.find({ _id: { $in: pipelineIds } }, { name: 1 });

        // Fetch stats for each pipeline
        const pipelineStats = await Promise.all(
            pipelines.map(async ({ _id: pipelineId, name: pipelineName }) => {
                // All-time stats
                const filterCriteria = { pipeline_id: pipelineId };
                if (userProducts) {
                    filterCriteria.products = { $in: userProducts }; // Filter by products
                }

                const totalLeads = await leadModel.countDocuments(filterCriteria);
                const totalContracts = await contractModel.countDocuments(filterCriteria);
                const totalDeals = await dealModel.countDocuments(filterCriteria);

                const rejectedLeads = await leadModel.countDocuments({
                    ...filterCriteria,
                    is_reject: true,
                });
                const rejectedContracts = await contractModel.countDocuments({
                    ...filterCriteria,
                    is_reject: true,
                });
                const rejectedDeals = await dealModel.countDocuments({
                    ...filterCriteria,
                    is_reject: true,
                });

                // Last 12 months stats
                const monthlyLeads = await getLast12MonthsStats(leadModel, pipelineId, userProducts);
                const monthlyContracts = await getLast12MonthsStats(contractModel, pipelineId, userProducts);
                const monthlyDeals = await getLast12MonthsStats(dealModel, pipelineId, userProducts);

                return {
                    pipelineId,
                    pipelineName,
                    stats: {
                        totalLeads,
                        rejectedLeads,
                        totalContracts,
                        rejectedContracts,
                        totalDeals,
                        rejectedDeals,
                    },
                    monthlyStats: {
                        leads: monthlyLeads,
                        contracts: monthlyContracts,
                        deals: monthlyDeals,
                    },
                };
            })
        );

        return res.status(200).json({
            message: 'Dashboard status by pipeline fetched successfully',
            pipelineStats,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
});
router.get('/finance-status-by-pipeline', isAuth, async (req, res) => {
    try {
        const pipelineIds = req.user.pipeline.map(pipeline => new ObjectId(pipeline._id));

        if (!pipelineIds || pipelineIds.length === 0) {
            return res.status(400).json({ message: 'No pipelines associated with the user' });
        }

        // Helper to get the start and end dates for a month
        const getMonthlyDateRange = (date) => {
            const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
            const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59); // Last day of the month
            return { startOfMonth, endOfMonth };
        };

        // Helper to calculate stats for the last 12 months
        const getLast12MonthsFinanceStats = async (pipelineId) => {
            const monthlyStats = [];
            const currentDate = new Date();

            for (let i = 0; i < 12; i++) {
                const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
                const { startOfMonth, endOfMonth } = getMonthlyDateRange(date);

                const financeData = await dealModel.aggregate([
                    { $match: {
                        pipeline_id: pipelineId,
                        is_converted: false,
                        is_reject: false,
                        created_at: { $gte: startOfMonth, $lt: endOfMonth },
                    } },
                    {
                        $lookup: {
                            from: "servicecommissions",
                            localField: "service_commission_id",
                            foreignField: "_id",
                            as: "serviceCommission",
                        },
                    },
                    { $unwind: "$serviceCommission" },
                    {
                        $group: {
                            _id: null,
                            totalFinanceAmount: { $sum: "$serviceCommission.finance_amount" },
                        },
                    },
                    {
                        $project: {
                            _id: 0,
                            totalFinanceAmount: 1,
                        },
                    },
                ]);

                monthlyStats.unshift({
                    month: `${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getFullYear()}`,
                    financeAmount: financeData.length > 0 ? financeData[0].totalFinanceAmount : 0,
                });
            }

            return monthlyStats;
        };

        // Fetch pipelines
        const pipelines = await Pipeline.find({ _id: { $in: pipelineIds } }, { name: 1, target: 1 });

        // Fetch finance data for each pipeline
        const pipelineStats = await Promise.all(
            pipelines.map(async ({ _id: pipelineId, name, target }) => {
                // All-time finance summary
                const allTimeFinanceSummary = await dealModel.aggregate([
                    { $match: { pipeline_id: pipelineId, is_converted: false, is_reject: false } },
                    {
                        $lookup: {
                            from: "servicecommissions",
                            localField: "service_commission_id",
                            foreignField: "_id",
                            as: "serviceCommission",
                        },
                    },
                    { $unwind: "$serviceCommission" },
                    {
                        $group: {
                            _id: null,
                            totalFinanceAmount: { $sum: "$serviceCommission.finance_amount" },
                        },
                    },
                    {
                        $project: {
                            _id: 0,
                            totalFinanceAmount: 1,
                        },
                    },
                ]);

                // Current month finance summary
                const currentDate = new Date();
                const { startOfMonth, endOfMonth } = getMonthlyDateRange(currentDate);
                const currentMonthFinanceSummary = await dealModel.aggregate([
                    { $match: { pipeline_id: pipelineId, is_converted: false, is_reject: false, created_at: { $gte: startOfMonth, $lt: endOfMonth } } },
                    {
                        $lookup: {
                            from: "servicecommissions",
                            localField: "service_commission_id",
                            foreignField: "_id",
                            as: "serviceCommission",
                        },
                    },
                    { $unwind: "$serviceCommission" },
                    {
                        $group: {
                            _id: null,
                            totalFinanceAmount: { $sum: "$serviceCommission.finance_amount" },
                        },
                    },
                    {
                        $project: {
                            _id: 0,
                            totalFinanceAmount: 1,
                        },
                    },
                ]);

                // Last 12 months stats
                const monthlyStats = await getLast12MonthsFinanceStats(pipelineId);

                return {
                    pipelineId,
                    pipelineName: name,
                    pipelineTarget: target,
                    allTimeStats: {
                        totalFinanceAmount: allTimeFinanceSummary.length > 0 ? allTimeFinanceSummary[0].totalFinanceAmount : 0,
                    },
                    currentMonthStats: {
                        totalFinanceAmount: currentMonthFinanceSummary.length > 0 ? currentMonthFinanceSummary[0].totalFinanceAmount : 0,
                    },
                    monthlyStats,
                };
            })
        );

        return res.status(200).json({
            message: 'Dashboard stats fetched successfully',
            pipelineStats,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
});
// Improved Finance Status Router
router.get('/finance-status', isAuth, async (req, res) => {
    try {
        const userId = req.user._id;

        const matchFilter = (additionalFilters = {}) => ({
            selected_users: { $in: [new ObjectId(userId)] },
            is_converted: false,
            is_reject: false,
            ...additionalFilters,
        });

        const aggregateFinanceData = async (dateFilter = {}) => {
            const financeData = await dealModel.aggregate([
                { $match: { ...matchFilter(dateFilter) } },
                {
                    $lookup: {
                        from: "servicecommissions",
                        localField: "service_commission_id",
                        foreignField: "_id",
                        as: "serviceCommission",
                    },
                },
                { $unwind: "$serviceCommission" },
                {
                    $group: {
                        _id: null,
                        totalFinanceAmount: { $sum: "$serviceCommission.finance_amount" },
                    },
                },
                {
                    $project: {
                        _id: 0,
                        totalFinanceAmount: 1,
                    },
                },
            ]);
            return financeData.length > 0 ? financeData[0].totalFinanceAmount : 0;
        };

        const allTimeFinanceSummary = await aggregateFinanceData();

        const startOfCurrentMonth = new Date(new Date().setDate(1));
        const endOfCurrentMonth = new Date(new Date(startOfCurrentMonth).setMonth(startOfCurrentMonth.getMonth() + 1));

        const currentMonthFinanceSummary = await aggregateFinanceData({
            created_at: { $gte: startOfCurrentMonth, $lt: endOfCurrentMonth },
        });

        const monthWiseStats = [];
        const currentDate = new Date();

        for (let i = 0; i < 12; i++) {
            const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
            const endOfMonth = new Date(new Date(startOfMonth).setMonth(startOfMonth.getMonth() + 1));

            const financeAmount = await aggregateFinanceData({
                created_at: { $gte: startOfMonth, $lt: endOfMonth },
            });

            const monthString = `${(startOfMonth.getMonth() + 1).toString().padStart(2, '0')}-${startOfMonth.getFullYear()}`;
            monthWiseStats.unshift({
                month: monthString,
                financeAmount,
            });
        }

        return res.status(200).json({
            message: 'Dashboard stats fetched successfully',
            allTimeStats: {
                totalFinanceAmount: allTimeFinanceSummary,
            },
            currentMonthStats: {
                totalFinanceAmount: currentMonthFinanceSummary,
            },
            monthWiseStats,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
});
// Improved Commission Status Router
router.get('/commission-status', isAuth, async (req, res) => {
    try {
        const userId = req.user._id;

        const matchFilter = (userId, additionalFilters = {}) => ({
            userId: new ObjectId(userId),
            ...additionalFilters,
        });

        const aggregateData = async (model, match, groupFields) => {
            const data = await model.aggregate([
                { $match: match },
                { $group: groupFields },
                { $project: { _id: 0 } },
            ]);
            return data.length > 0 ? data[0] : { totalPaidCommission: 0, totalRemainingCommission: 0, totalCommission: 0 };
        };

        const allTimeCommissionSummary = await aggregateData(
            CommissionPayment,
            matchFilter(userId),
            {
                _id: null,
                totalPaidCommission: { $sum: "$paidCommission" },
                totalRemainingCommission: { $sum: "$remainingCommission" },
                totalCommission: { $sum: "$totalCommission" },
            }
        );

        const startOfCurrentMonth = new Date(new Date().setDate(1));
        const endOfCurrentMonth = new Date(new Date(startOfCurrentMonth).setMonth(startOfCurrentMonth.getMonth() + 1));

        const currentMonthCommissionSummary = await aggregateData(
            CommissionPayment,
            matchFilter(userId, { createdAt: { $gte: startOfCurrentMonth, $lt: endOfCurrentMonth } }),
            {
                _id: null,
                totalPaidCommission: { $sum: "$paidCommission" },
                totalRemainingCommission: { $sum: "$remainingCommission" },
                totalCommission: { $sum: "$totalCommission" },
            }
        );

        const monthWiseStats = [];
        const currentDate = new Date();

        for (let i = 0; i < 12; i++) {
            const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
            const endOfMonth = new Date(new Date(startOfMonth).setMonth(startOfMonth.getMonth() + 1));

            const stats = await aggregateData(
                CommissionPayment,
                matchFilter(userId, { createdAt: { $gte: startOfMonth, $lt: endOfMonth } }),
                {
                    _id: null,
                    totalPaidCommission: { $sum: "$paidCommission" },
                    totalRemainingCommission: { $sum: "$remainingCommission" },
                    totalCommission: { $sum: "$totalCommission" },
                }
            );

            const monthString = `${(startOfMonth.getMonth() + 1).toString().padStart(2, '0')}-${startOfMonth.getFullYear()}`;
            monthWiseStats.unshift({ month: monthString, ...stats });
        }

        return res.status(200).json({
            message: 'Commission stats fetched successfully',
            allTimeStats: allTimeCommissionSummary,
            currentMonthStats: currentMonthCommissionSummary,
            monthWiseStats,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
});
router.get('/dashboard-status', isAuth, async (req, res) => {
    try {
        const userId = req.user._id; // Get the user ID from the request

        // Get the first and last day of the current month
        const startOfMonth = new Date(new Date().setDate(1));
        const endOfMonth = new Date(new Date(startOfMonth).setMonth(startOfMonth.getMonth() + 1));

        // Helper function for aggregate queries
        const matchFilter = (additionalFilters = {}) => ({
            selected_users: userId,
            is_converted: false,
            is_reject: false,
            ...additionalFilters,
        });

        // Function to get stats for a given month
        const getMonthStats = async (startOfMonth, endOfMonth) => {
            const stats = {
                totalContracts: await contractModel.countDocuments(matchFilter({ updated_at: { $gte: startOfMonth, $lt: endOfMonth } })),
                rejectedContracts: await contractModel.countDocuments({ selected_users: userId, is_reject: true, updated_at: { $gte: startOfMonth, $lt: endOfMonth } }),
                totalLeads: await leadModel.countDocuments(matchFilter({ created_at: { $gte: startOfMonth, $lt: endOfMonth } })),
                rejectedLeads: await leadModel.countDocuments({ selected_users: userId, is_reject: true, created_at: { $gte: startOfMonth, $lt: endOfMonth } }),
                totalDeals: await dealModel.countDocuments(matchFilter({ created_at: { $gte: startOfMonth, $lt: endOfMonth } })),
                rejectedDeals: await dealModel.countDocuments({ selected_users: userId, is_reject: true, created_at: { $gte: startOfMonth, $lt: endOfMonth } })
            };
            return stats;
        };

        // Fetch statistics for the current month and the last 11 previous months
        const monthWiseStats = [];
        const currentDate = new Date();
        for (let i = 0; i < 12; i++) {
            const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
            const endOfMonth = new Date(new Date(startOfMonth).setMonth(startOfMonth.getMonth() + 1));

            const stats = await getMonthStats(startOfMonth, endOfMonth);
            const monthString = `${(startOfMonth.getMonth() + 1).toString().padStart(2, '0')}-${startOfMonth.getFullYear()}`; // Format as MM-YYYY
            monthWiseStats.unshift({
                month: monthString,
                stats
            });
        }

        // Get current month stats (already fetched earlier)
        const currentMonthStats = {
            totalContracts: await contractModel.countDocuments(matchFilter({ updated_at: { $gte: startOfMonth, $lt: endOfMonth } })),
            totalLeads: await leadModel.countDocuments(matchFilter({ created_at: { $gte: startOfMonth, $lt: endOfMonth } })),
            totalDeals: await dealModel.countDocuments(matchFilter({ created_at: { $gte: startOfMonth, $lt: endOfMonth } })),
            rejectedContracts: await contractModel.countDocuments({ selected_users: userId, is_reject: true, updated_at: { $gte: startOfMonth, $lt: endOfMonth } }),
            rejectedLeads: await leadModel.countDocuments({ selected_users: userId, is_reject: true, created_at: { $gte: startOfMonth, $lt: endOfMonth } }),
            rejectedDeals: await dealModel.countDocuments({ selected_users: userId, is_reject: true, created_at: { $gte: startOfMonth, $lt: endOfMonth } })
        };

        return res.status(200).json({
            message: 'Dashboard stats fetched successfully',
            monthWiseStats, // Returns stats for the current and last 11 months
            currentMonthStats, // Returns stats for the current month
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
});
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
                    delstatus: false, // Exclude deleted deals
                },
            },
            {
                $lookup: {
                    from: 'dealstages', // Assuming the collection for deal stages is 'dealstages'
                    localField: 'deal_stage',
                    foreignField: '_id',
                    as: 'deal_stage_info',
                },
            },
            {
                $unwind: '$deal_stage_info',
            },
            {
                $match: {
                    'deal_stage_info.name': 'Collected', // Only deals with stage name "Collected"
                },
            },
            {
                $lookup: {
                    from: 'servicecommissions', // Assuming the collection is 'servicecommissions'
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

        // Fetch all deals associated with the highest-finance pipeline
        const deals = await Deal.find({ _id: { $in: highestFinancePipeline.dealIds } })
            .populate({
                path: 'pipeline_id',
                select: 'name', // Populate pipeline name only
            })
            .populate({
                path: 'deal_stage',
                select: 'name', // Populate deal stage name
            });

        // Fetch all users related to the highest-finance pipeline
        const users = await User.find({
            pipeline: highestFinancePipeline._id, // Assuming User has a reference to pipeline_id
            role: { $nin: ['CEO', 'MD', 'Super Admin', 'Admin', 'Marketing'] }, // Exclude certain roles
        }).select('name image role');

        return res.status(200).json({
            message: 'Highest finance amount pipeline fetched successfully',
            pipeline: deals.length ? deals[0].pipeline_id : null, // Send populated pipeline info
            totalFinanceAmount: highestFinancePipeline.totalFinanceAmount,
            users,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error', error: error.message });
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
 
router.put('/commissions/pay', async (req, res) => {
    const { userId, dealId, paymentAmount } = req.body;

    try {
        // Convert paymentAmount to a number
        const payment = Number(paymentAmount);

        // Validate paymentAmount
        if (!payment || isNaN(payment) || payment <= 0) {
            return res.status(400).json({ message: 'Invalid payment amount. It must be a positive number.' });
        }

        // Fetch the commission record
        const commissionPayment = await CommissionPayment.findOne({ userId, dealId });

        if (!commissionPayment) {
            return res.status(404).json({ message: 'No commission record found for this user and deal.' });
        }

        const { paidCommission = 0, remainingCommission, totalCommission } = commissionPayment;

        // Validate commission data consistency
        if (
            isNaN(paidCommission) ||
            isNaN(remainingCommission) ||
            isNaN(totalCommission) ||
            remainingCommission + paidCommission !== totalCommission
        ) {
            return res.status(400).json({ message: 'Commission data is inconsistent. Please verify the records.' });
        }

        // Ensure the payment does not exceed the remaining commission
        if (payment > remainingCommission) {
            return res.status(400).json({
                message: `Payment amount exceeds the remaining commission. Remaining: ${remainingCommission}`,
            });
        }

        // Update the commission data
        commissionPayment.paidCommission += payment;
        commissionPayment.remainingCommission -= payment;

        // Save the updated commission payment
        await commissionPayment.save();

        return res.status(200).json({
            message: 'Commission payment updated successfully.',
            updatedCommission: commissionPayment,
        });
    } catch (error) {
        console.error('Error updating commission payment:', error);
        return res.status(500).json({ message: 'Server error occurred while updating the commission payment.' });
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

router.get('/collected', isAuth, async (req, res) => {
    try {
        // Find the DealStage ID for "Collected"
        const collectedStage = await DealStage.findOne({ name: 'Collected', delStatus: false });
        if (!collectedStage) {
            return res.status(404).json({ message: 'Collected deal stage not found' });
        }

        // Get the start date for the last 12 months
        const startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 12);
        startDate.setDate(1); // Set to the first day of the month
        startDate.setHours(0, 0, 0, 0);

        // Calculate the last 12 months from the current month
        const monthsArray = [];
        for (let i = 0; i < 12; i++) {
            const month = new Date();
            month.setMonth(month.getMonth() - i);
            monthsArray.push({
                year: month.getFullYear(),
                month: month.getMonth() + 1, // month is 0-indexed
            });
        }

        // Aggregate deals grouped by month
        const deals = await Deal.aggregate([
            // Match deals with "Collected" deal stage and within the last 12 months
            {
                $match: {
                    deal_stage: collectedStage._id,
                    delstatus: false,
                    updated_at: { $gte: startDate }
                }
            },
            // Add fields for year and month
            {
                $addFields: {
                    year: { $year: '$updated_at' },
                    month: { $month: '$updated_at' }
                }
            },
            // Look up the service_commission_id and bring in the without_vat_commission field
            {
                $lookup: {
                    from: 'servicecommissions', // Assuming this is the name of the collection
                    localField: 'service_commission_id',
                    foreignField: '_id',
                    as: 'service_commission'
                }
            },
            // Unwind to simplify the service_commission array
            {
                $unwind: {
                    path: '$service_commission',
                    preserveNullAndEmptyArrays: true // Handle cases where there might be no service_commission
                }
            },
            // Group deals by year and month and sum the 'without_vat_commission'
            {
                $group: {
                    _id: { year: '$year', month: '$month' },
                    total_without_vat_commission: { $sum: '$service_commission.without_vat_commission' }
                }
            },
            // Sort groups by year and month in descending order
            { $sort: { '_id.year': -1, '_id.month': -1 } }
        ]);

        // Map the aggregated data into a dictionary for quick lookup by year and month
        const dealData = {};
        let totalAllTimeCommission = 0; // Variable for sum of all-time commissions
        let totalCurrentMonthCommission = 0; // Variable for current month's commission

        deals.forEach(deal => {
            const monthKey = `${deal._id.year}-${deal._id.month}`;
            dealData[monthKey] = deal.total_without_vat_commission || 0;

            // Add to the total commission for all time
            totalAllTimeCommission += deal.total_without_vat_commission || 0;

            // Check if it's the current month and add to current month's total
            const currentMonthKey = `${new Date().getFullYear()}-${new Date().getMonth() + 1}`;
            if (monthKey === currentMonthKey) {
                totalCurrentMonthCommission = deal.total_without_vat_commission || 0;
            }
        });

        // Create the final response by filling in all 12 months
        const formattedDeals = monthsArray.map(month => {
            const monthKey = `${month.year}-${month.month}`;
            return {
                year: month.year,
                month: month.month,
                totalCommission: dealData[monthKey] || 0
            };
        });

        // Prepare the stats data
        const allTimeStats = {
           
            totalCommission: totalAllTimeCommission
        };

        const currentMonthStats = {
           
            totalCommission: totalCurrentMonthCommission
        };

        // Prepare the response object
        const response = {
            success: true,
            allTimeStats,
            currentMonthStats,
            monthWiseStats: formattedDeals
        };

        // Send the response
        res.status(200).json(response);
    } catch (error) {
        console.error('Error fetching collected deals:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
});
router.get('/rejected', isAuth, async (req, res) => {
    try { 
      
        // Get the start date for the last 12 months
        const startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 12);
        startDate.setDate(1); // Set to the first day of the month
        startDate.setHours(0, 0, 0, 0);

        // Calculate the last 12 months from the current month
        const monthsArray = [];
        for (let i = 0; i < 12; i++) {
            const month = new Date();
            month.setMonth(month.getMonth() - i);
            monthsArray.push({
                year: month.getFullYear(),
                month: month.getMonth() + 1, // month is 0-indexed
            });
        }

        // Aggregate deals grouped by month
        const deals = await Deal.aggregate([
            // Match deals with "Collected" deal stage and within the last 12 months
            {
                $match: {
                    is_reject: true,
                    delstatus: false,
                    updated_at: { $gte: startDate }
                }
            },
            // Add fields for year and month
            {
                $addFields: {
                    year: { $year: '$updated_at' },
                    month: { $month: '$updated_at' }
                }
            },
            // Look up the service_commission_id and bring in the without_vat_commission field
            {
                $lookup: {
                    from: 'servicecommissions', // Assuming this is the name of the collection
                    localField: 'service_commission_id',
                    foreignField: '_id',
                    as: 'service_commission'
                }
            },
            // Unwind to simplify the service_commission array
            {
                $unwind: {
                    path: '$service_commission',
                    preserveNullAndEmptyArrays: true // Handle cases where there might be no service_commission
                }
            },
            // Group deals by year and month and sum the 'without_vat_commission'
            {
                $group: {
                    _id: { year: '$year', month: '$month' },
                    total_without_vat_commission: { $sum: '$service_commission.without_vat_commission' }
                }
            },
            // Sort groups by year and month in descending order
            { $sort: { '_id.year': -1, '_id.month': -1 } }
        ]);

        // Map the aggregated data into a dictionary for quick lookup by year and month
        const dealData = {};
        let totalAllTimeCommission = 0; // Variable for sum of all-time commissions
        let totalCurrentMonthCommission = 0; // Variable for current month's commission

        deals.forEach(deal => {
            const monthKey = `${deal._id.year}-${deal._id.month}`;
            dealData[monthKey] = deal.total_without_vat_commission || 0;

            // Add to the total commission for all time
            totalAllTimeCommission += deal.total_without_vat_commission || 0;

            // Check if it's the current month and add to current month's total
            const currentMonthKey = `${new Date().getFullYear()}-${new Date().getMonth() + 1}`;
            if (monthKey === currentMonthKey) {
                totalCurrentMonthCommission = deal.total_without_vat_commission || 0;
            }
        });

        // Create the final response by filling in all 12 months
        const formattedDeals = monthsArray.map(month => {
            const monthKey = `${month.year}-${month.month}`;
            return {
                year: month.year,
                month: month.month,
                totalCommission: dealData[monthKey] || 0
            };
        });

        // Prepare the stats data
        const allTimeStats = {
           
            totalCommission: totalAllTimeCommission
        };

        const currentMonthStats = {
           
            totalCommission: totalCurrentMonthCommission
        };

        // Prepare the response object
        const response = {
            success: true,
            allTimeStats,
            currentMonthStats,
            monthWiseStats: formattedDeals
        };

        // Send the response
        res.status(200).json(response);
    } catch (error) {
        console.error('Error fetching collected deals:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
});

module.exports = router;
