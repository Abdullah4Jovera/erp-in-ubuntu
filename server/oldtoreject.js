const mongoose = require('mongoose');
const Lead = require('./models/leadModel'); // Adjust the path to your Lead model

// MongoDB connection URL
const MONGODB_URI = 'mongodb://localhost:27017/crm'; // Replace with your actual connection string

const updateOldLeads = async (monthsAgo = 6) => { // Default to 6 months, can be adjusted
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    // Calculate the date 'monthsAgo' months ago
    const monthsBackDate = new Date();
    monthsBackDate.setMonth(monthsBackDate.getMonth() - monthsAgo);

    // Count the total number of leads already marked as rejected
    const initialRejectedCount = await Lead.countDocuments({ is_reject: true });

    console.log(`Initial rejected leads: ${initialRejectedCount}`);

    // Count leads eligible for update
    const eligibleLeadsCount = await Lead.countDocuments({
      updated_at: { $lt: monthsBackDate },
      is_reject: false,
    });

    console.log(`Total leads eligible for rejection (not updated in last ${monthsAgo} months): ${eligibleLeadsCount}`);

    // Find and update all leads not updated since 'monthsAgo' months ago
    const result = await Lead.updateMany(
      { updated_at: { $lt: monthsBackDate }, is_reject: false }, // Only update non-rejected leads
      { $set: { is_reject: true } }                               // Set is_reject to true
    );

    // Count the total number of leads marked as rejected after the update
    const finalRejectedCount = await Lead.countDocuments({ is_reject: true });

    console.log(`Updated ${result.nModified} leads to rejected status.`);
    console.log(`Total rejected leads after update: ${finalRejectedCount}`);
  } catch (error) {
    console.error('Error updating leads:', error);
  } finally {
    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

// Run the script, you can change monthsAgo to any number of months (e.g., 6, 12, etc.)
updateOldLeads(6); // Update leads not modified in the last 6 months
