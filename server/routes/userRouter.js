// routes/userRouter.js
const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const User = require('../models/userModel'); // Adjust the path to your User model
const { generateToken, isAuth, hasRole } = require('../utils');
const Pipeline = require('../models/pipelineModel'); // Adjust the path as needed
const mongoose = require('mongoose'); 
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const rolePermissions = require('../rolePermissions.json');
const Branch = require('../models/branchModel');
const Session = require('../models/sessionModel');
const hasPermission = require('../hasPermission');
const { notifyLogout } = require('../socket');
const leadModel = require('../models/leadModel');
const Product = require('../models/productModel'); // Adjust path as necessary

// Configure multer for file uploads
// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => { 
    const uploadPath = path.join(__dirname, '..', 'images',);

    // Check if the directory exists
    if (!fs.existsSync(uploadPath)) {
      // Create the directory if it doesn't exist
      fs.mkdirSync(uploadPath, { recursive: true });
    } 

    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });
router.get('/get-users-non-operational', async (req, res) => {
  try {
    const users = await User.find({ delstatus: false , role: 'None Operational' }).populate('products') 
    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users with UnActive products:', error);
    res.status(500).json({ message: 'Error fetching users with UnActive products' });
  }
});
router.patch('/resign-user/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    const { replacementUserId } = req.body; // Replacement user ID

    // Find the user who is resigning
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Mark the user as resigned
    user.resigned = true;
    await user.save();

    if (replacementUserId) {
      // Validate the replacement user
      const replacementUser = await User.findById(replacementUserId);
      if (!replacementUser) {
        return res.status(404).json({ message: 'Replacement user not found' });
      }

      // Replace the resigned user with the replacement user in all leads
      const result = await leadModel.updateMany(
        { selected_users: userId },
        { $set: { 'selected_users.$': replacementUserId } } // Directly replace the matched user in the array
      );

      if (result.modifiedCount > 0) {
        return res.status(200).json({
          message: 'User marked as resigned and replaced in selected users in leads.',
          resignedUser: userId,
          replacementUser: replacementUserId,
        });
      } else {
        return res.status(400).json({
          message: 'No leads were updated. Please check if the user is part of selected users in any lead.',
        });
      }
    } else {
      // Remove the resigned user from the selected_users array in all leads
      const result = await leadModel.updateMany(
        { selected_users: userId },
        { $pull: { selected_users: userId } }
      );

      if (result.modifiedCount > 0) {
        return res.status(200).json({
          message: 'User marked as resigned and removed from selected users in leads.',
          resignedUser: userId,
        });
      } else {
        return res.status(400).json({
          message: 'No leads were updated. Please check if the user is part of selected users in any lead.',
        });
      }
    }
  } catch (error) {
    console.error('Error marking user as resigned:', error);
    res.status(500).json({ message: 'Error marking user as resigned' });
  }
});
router.patch('/block-user/:id', isAuth, hasPermission(['app_management']), async (req, res) => {
  try {
    const { block } = req.body; // block should be true to block and false to unblock
    const user = await User.findById(req.params.id);
    
    if (!user) { 
      return res.status(404).json({ message: 'User not found' });
    } 

    user.isBlocked = block;
    await user.save();

    res.status(200).json({ message: `User has been ${block ? 'blocked' : 'unblocked'}` });
  } catch (error) {
    console.error('Error blocking user:', error);
    res.status(500).json({ message: 'Error blocking user' });
  }
});
router.post('/logout', isAuth, async (req, res) => {
  try {
    const userId = req.user._id;

    // Mark all active sessions for this user as inactive by setting logoutTime
    await Session.updateMany(
      { user: userId, logoutTime: null },
      { logoutTime: new Date() }
    );

    // Notify the user if real-time updates are supported
    notifyLogout(userId);

    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Error logging out:', error);
    res.status(500).json({ message: 'Error logging out' });
  }
});
// Logout another user by marking their sessions as inactive
router.post('/logout-user/:id', isAuth, hasPermission(['app_management']), async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Mark all active sessions for this user as inactive
    await Session.updateMany(
      { user: userId, logoutTime: null },
      { logoutTime: new Date() }
    );

    // Notify the user of the forced logout
    notifyLogout(userId);

    res.status(200).json({ message: 'User has been logged out successfully.' });
  } catch (error) {
    console.error('Error logging out user:', error);
    res.status(500).json({ message: 'Error logging out user' });
  }
});
// Get active sessions (with filtering out inactive ones)
router.get('/active-sessions', isAuth, async (req, res) => {
  try {
    const activeSessions = await Session.find({ logoutTime: null })
      .populate('user', 'name email role');
    res.status(200).json(activeSessions);
  } catch (error) {
    console.error('Error retrieving active sessions:', error);
    res.status(500).json({ message: 'Error retrieving active sessions' });
  }
});
router.get('/permissions', isAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('permissions');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Return only the user's permissions
    const permissions = user.permissions || [];
    res.status(200).json( permissions );
  } catch (error) {
    console.error('Error fetching permissions:', error);
    res.status(500).json({ message: 'Error fetching permissions' });
  }
});
// Refresh token
router.post('/refresh-token', isAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const newToken = generateToken(user);
    res.status(200).json({ token: newToken });
  } catch (error) {
    console.error('Error refreshing token:', error);
    res.status(500).json({ message: 'Error refreshing token' });
  }
});
router.get('/get-users-by-branch/:branchId/:productId', async (req, res) => {
  try {
    const { branchId, productId } = req.params; // Get branchId and productId from the URL parameters

    if (!branchId) {
      return res.status(400).json({ message: 'Branch ID is required.' });
    }
    if (!productId) {
      return res.status(400).json({ message: 'Product ID is required.' });
    }

    // Construct the query based on branch, role, and product
    const query = { 
      branch: branchId, 
      role: { $in: ['Sales', 'Team Leader'] }, 
      products: productId 
  };
  

    // Find users by branch, role "Sales", and product filter
    const users = await User.find(query)
      .select('-password')  // Exclude the password field
      .populate('branch')    // Populate the branch field
      .populate('products')  // Populate the product field
      .exec();

    const imagePrefix = 'http://192.168.2.137:2000/images/';

    // Add the image prefix to the user image if it exists
    users.forEach(user => {
      if (user.image) {
        user.image = `${imagePrefix}${user.image}`;
      }
    });

    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users by branch and product:', error);
    res.status(500).json({ message: 'Error fetching users by branch and product' });
  }
});
router.get('/get-users-by-product/:productId',  async (req, res) => {
  try {
    // Get the productId from the URL parameters
    const productId = req.params.productId;
    if (!productId) {
      return res.status(400).json({ message: 'Product ID is required.' });
    }

    // Fetch users who have the specified product
    const users = await User.find({ products: productId })
      .select('-password') // Exclude the password field
      .populate('products') // Populate the products field
      .exec();

    const imagePrefix = 'http://192.168.2.137:2000/images/';

    // Add the image prefix to the user image if it exists
    users.forEach(user => {
      if (user.image) {
        user.image = `${imagePrefix}${user.image}`;
      }
    });

    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users by product:', error);
    res.status(500).json({ message: 'Error fetching users by product' });
  }
});
// GET route to fetch all users based on pipeline 
router.get('/get-users-by-pipeline', isAuth, async (req, res) => {
  try {
    // Check if the pipeline exists in req.user
    if (!req.user || !req.user.pipeline || !Array.isArray(req.user.pipeline)) {
      return res.status(400).json({ message: 'Pipeline is required and should be an array.' });
    }

    const pipelines = req.user.pipeline;

    // Build the query object using $in to match any of the pipelines
    const users = await User.find({ pipeline: { $in: pipelines } })
      .select('-password') // Exclude the password field
      .populate('pipeline') // Populate the pipeline field
      .exec();

    const imagePrefix = 'http://192.168.2.137:4000/images/';

    // Add the image prefix to the user image if it exists
    users.forEach(user => {
      if (user.image) {
        user.image = `${imagePrefix}${user.image}`;
      }
    });

    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users by pipeline:', error);
    res.status(500).json({ message: 'Error fetching users by pipeline' });
  }
});
// GET route to fetch all users
router.get('/get-users', async (req, res) => {
  try {
    const { pipelineId } = req.query; // Get pipelineId from query parameters

    // Build the query object
    const query = { delstatus: false };
    if (pipelineId) {
      query.pipeline = pipelineId; // Filter by pipelineId if provided
    }

    const users = await User.find(query)
      .select('-password') // Exclude the password field
      .populate('pipeline') // Populate the pipeline field
      .populate('branch name') // Populate the pipeline field
      .populate('products') // Populate the pipeline field
      .exec();

    const imagePrefix = 'http://192.168.2.137:4000/images/';

    users.forEach(user => {
      if (user.image) {
        user.image = `${imagePrefix}${user.image}`;
      }
    });

    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Error fetching users' });
  }
});

// POST route to create a new user
router.post(
  '/create-user',
  upload.single('image'),
  isAuth,
  hasRole(['Super Admin', 'Developer']),
  async (req, res) => {
    try {
      const {
        name,
        pipeline,
        email,
        password,
        role,
        branch,
        permissions,
        delStatus,
        verified,
        phone,
        products,
        target,
      } = req.body;

      // Validate required fields
      if (!name || !email || !role) {
        return res.status(400).json({ message: 'Missing required fields: name, email, or role' });
      }

      // Check if the email is already registered
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'Email already registered' });
      }

      // Hash the password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Get the uploaded file name
      const image = req.file ? req.file.filename : null;

      // Helper function to validate and resolve ObjectIds
      const resolveIds = async (items, Model, fieldName) => {
        if (!items) return [];
        const array = Array.isArray(items) ? items : [items];
        const validIds = await Promise.all(
          array.map(async (item) => {
            if (mongoose.Types.ObjectId.isValid(item)) {
              return item;
            } else {
              const foundItem = await Model.findOne({ name: item });
              return foundItem ? foundItem._id : null;
            }
          })
        );
        return validIds.filter((id) => id !== null);
      };

      // Validate and resolve ObjectIds for pipeline, branch, and products
      const validPipelines = await resolveIds(pipeline, Pipeline, 'pipeline');
      const validBranches = await resolveIds(branch, Branch, 'branch');
      const validProducts = await resolveIds(products, Product, 'products');

      // Create a new user
      const newUser = new User({
        name,
        pipeline: validPipelines,
        email,
        password: hashedPassword,
        image,
        role,
        branch: validBranches,
        permissions: permissions || [],
        products: validProducts,
        target: target || 0,
        delstatus: delStatus || false,
        verified: verified || false,
        phone,
      });

      // Save the new user to the database
      await newUser.save();

      // Respond with the created user
      res.status(201).json(newUser);
    } catch (error) {
      console.error('Error creating user:', error);
      res.status(500).json({ message: 'Error creating user', error: error.message });
    }
  }
);


// POST route for user login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate request body
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find the user by email and populate pipeline, products, and branch
    const user = await User.findOne({ email })
      .populate('pipeline', 'name') // Replace 'name' with relevant fields from the Pipeline model
      .populate('products', 'name') // Replace 'name price' with relevant fields from the Product model
      .populate('branch', 'name'); // Replace 'name location' with relevant fields from the Branch model

    if (!user || user.isBlocked) { // Check if user is blocked
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check if the user is resigned
    if (user.resigned) {
      return res.status(403).json({ message: 'Account has been resigned. Please contact support.' });
    }

    // Check if password matches
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Generate a token
    const token = generateToken(user);

    // Get the IP address
    const ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    // Create a session for the user, including the IP address
    const session = new Session({
      user: user._id,
      token: token,
      loginTime: new Date(),
      ipAddress: ipAddress,
    });
    await session.save(); // Save the session to the database

    // Respond with user details, token, and session ID
    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      pipeline: user.pipeline, // Populated pipeline details
      branch: user.branch, // Populated branch details
      role: user.role,
      image: user.image,
      permissions: user.permissions,
      products: user.products, // Populated product details
      target: user.target,
      token,
      sessionId: session._id, // Send the session ID in the response
      ipAddress: ipAddress, // Optionally send IP address in the response
    });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ message: 'Error logging in' });
  }
});
 
///update User
router.put(
  '/update-user/:id',
  upload.single('image'),
  isAuth,
  hasRole(['Super Admin', 'Developer']),
  async (req, res) => {
    try {
      const { id } = req.params;
      const {
        name,
        pipeline,
        email,
        password,
        role,
        branch,
        delstatus,
        verified,
        products,
        phone,
        target,
      } = req.body;

      // Find the user by ID
      const user = await User.findById(id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Update user fields
      if (name) user.name = name;

      // Update pipelines, ensuring valid ObjectIds
      if (pipeline) {
        const validPipelines = await Promise.all(
          pipeline.map(async (pipe) => {
            if (mongoose.Types.ObjectId.isValid(pipe)) {
              return pipe;
            } else {
              const foundPipeline = await Pipeline.findOne({ name: pipe });
              return foundPipeline ? foundPipeline._id : null;
            }
          })
        );
        user.pipeline = validPipelines.filter((pipe) => pipe !== null);
      }

      // Update branches, ensuring valid ObjectIds
      if (branch) {
        const validBranches = await Promise.all(
          branch.map(async (br) => {
            if (mongoose.Types.ObjectId.isValid(br)) {
              return br;
            } else {
              const foundBranch = await Branch.findOne({ name: br });
              return foundBranch ? foundBranch._id : null;
            }
          })
        );
        user.branch = validBranches.filter((br) => br !== null);
      }

      // Update products, ensuring valid ObjectIds
      if (products) {
        const validProducts = await Promise.all(
          products.map(async (prod) => {
            if (mongoose.Types.ObjectId.isValid(prod)) {
              return prod;
            } else {
              const foundProduct = await Product.findOne({ name: prod });
              return foundProduct ? foundProduct._id : null;
            }
          })
        );
        user.products = validProducts.filter((prod) => prod !== null);
      }

      // Update email
      if (email) user.email = email;

      // Update and hash password if provided
      if (password) {
        const saltRounds = 10;
        user.password = await bcrypt.hash(password, saltRounds);
      }

      // Handle image file upload
      if (req.file) {
        user.image = req.file.filename; // Save the image filename
      }

      // Update role and permissions if role is changed
      if (role && role !== user.role) {
        user.role = role;

        // Get permissions based on role
        const newPermissions = rolePermissions[role];
        if (newPermissions) {
          user.permissions = newPermissions;
        } else {
          return res.status(400).json({ message: 'Invalid role provided' });
        }
      }

      // Update other fields
      if (target !== undefined) user.target = target === null ? null : target;
      if (phone !== undefined) user.phone = phone === null ? null : phone;
      if (delstatus !== undefined) user.delstatus = delstatus;
      if (verified !== undefined) user.verified = verified;

      // Save the updated user to the database
      await user.save();

      // Respond with the updated user
      res.status(200).json(user);
    } catch (error) {
      console.error('Error updating user:', error);
      res.status(500).json({ message: 'Error updating user' });
    }
  }
);

 
/// delete User
router.put('/delete-user/:id', isAuth,hasRole(['Super Admin', 'Developer']),async (req, res) => {
  try {
    const { id } = req.params;

    // Find the user by ID
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Set delstatus to true
    user.delstatus = true;

    // Save the updated user
    await user.save();

    // Respond with the updated user
    res.status(200).json(user);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Error updating user' });
  }
});

/// Reset Password
router.put('/reset-password/:id', isAuth,hasRole(['Super Admin', 'Developer']), async (req, res) => {
  try {
    const { password } = req.body;
    const userId = req.params.id; // Get user ID from request parameters

    // Find the user by their ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if a new password is provided
    if (password) {
      const saltRounds = 10;
      user.password = await bcrypt.hash(password, saltRounds);
    }

    // Save the updated user
    await user.save();

    res.status(200).json({ message: 'Password updated successfully', user });
  } catch (error) {
    console.error('Error updating password:', error);
    res.status(500).json({ message: 'Error updating password' });
  }
});


module.exports = router;
