const crypto = require('crypto');
const User = require('../models/User');
const asyncHandler = require('express-async-handler');
const sendEmail = require('../utils/sendEmail');
const jwt = require('jsonwebtoken');
const { error } = require('console');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = asyncHandler(async (req, res) => {
  const {
    userType,
    username, // This field is not in the model, we'll ignore it
    password,
    firstName,
    lastName,
    email,
    phone,
    address,
    profilePicture // Add profile picture field
  } = req.body;

  console.log('Registration request received with data:', {
    userType, firstName, lastName, email,
    hasProfilePicture: !!profilePicture,
    profilePictureUrl: profilePicture,
    address
  });

  // Create user
  try{
    // Create a user object with only the fields that exist in the model
    const userData = {
      userType,
      password,
      firstName,
      lastName,
      email,
      phone
    };

    // Handle address field properly
    if (address && typeof address === 'object') {
      // Ensure all address fields are strings
      userData.address = {
        street: address.street || '',
        city: address.city || '',
        state: address.state || '',
        zipCode: address.zipCode || '',
        country: address.country || ''
      };
    } else {
      // Default empty address object
      userData.address = {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: ''
      };
    }

    // Only add profilePicture if it's provided
    if (profilePicture) {
      userData.profilePicture = profilePicture;
      console.log('Setting profile picture URL:', profilePicture);
    }

    const user = await User.create(userData);
    console.log('User created successfully with ID:', user._id);

    sendTokenResponse(user, 201, res);
  } catch(err){
    console.error('Error creating user:', err);
    // Handle specific validation errors
    if (err.name === 'ValidationError') {
      const message = Object.values(err.errors).map(val => val.message).join(', ');
      return res.status(400).json({
        success: false,
        message
      });
    }
    
    // Handle duplicate email error
    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Email already exists'
      });
    }
    
    res.status(500).json({
      success : false,
      message : 'Server error: ' + err.message
    });
  }
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Validate email & password
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Please provide an email and password'
    });
  }

  try {
    // Check for user
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Your account has been deactivated. Please contact support.'
      });
    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    console.error('Login error:', error);
    // Handle database connection errors specifically
    if (error.name === 'MongoNetworkError' || error.name === 'MongooseServerSelectionError') {
      return res.status(500).json({
        success: false,
        message: 'Database connection error. Please try again later.'
      });
    }
    
    return res.status(500).json({
      success: false,
      message: 'Server error during login. Please try again later.'
    });
  }
});

// @desc    Log user out / clear cookie
// @route   GET /api/auth/logout
// @access  Private
exports.logout = asyncHandler(async (req, res) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    Update user details
// @route   PUT /api/auth/updatedetails
// @access  Private
exports.updateDetails = asyncHandler(async (req, res) => {
  const fieldsToUpdate = {
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    phone: req.body.phone,
    address: req.body.address
  };

  const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    Update user profile
// @route   PUT /api/auth/updateprofile
// @access  Private
exports.updateProfile = asyncHandler(async (req, res) => {
  // Create an object with only the fields that are provided in the request
  const fieldsToUpdate = {};

  // Only add fields that are present in the request body
  if (req.body.firstName) fieldsToUpdate.firstName = req.body.firstName;
  if (req.body.lastName) fieldsToUpdate.lastName = req.body.lastName;
  if (req.body.email) fieldsToUpdate.email = req.body.email;
  if (req.body.phone) fieldsToUpdate.phone = req.body.phone;

  // Handle address field - can be either direct or from businessAddress
  if (req.body.address) fieldsToUpdate.address = req.body.address;
  else if (req.body.businessAddress) fieldsToUpdate.address = req.body.businessAddress;

  if (req.body.businessName) fieldsToUpdate.businessName = req.body.businessName;
  if (req.body.description) fieldsToUpdate.description = req.body.description;

  // Add profile picture if it's in the request
  if (req.body.profilePicture) {
    fieldsToUpdate.profilePicture = req.body.profilePicture;
  }

  console.log('Fields to update:', fieldsToUpdate);

  try {
    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
      new: true,
      runValidators: true
    });

    console.log('Updated user:', user);

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating profile',
      error: error.message
    });
  }
});

// @desc    Update password
// @route   PUT /api/auth/updatepassword
// @access  Private
// Update password function
exports.updatePassword = asyncHandler(async (req, res) => {
  // Make sure to include the password field with .select('+password')
  const user = await User.findById(req.user.id).select('+password');

  // Check if user exists and has a password field
  if (!user || !user.password) {
    return res.status(400).json({
      success: false,
      message: 'User not found or password field is missing'
    });
  }

  // Check current password
  if (!(await user.matchPassword(req.body.currentPassword))) {
    return res.status(401).json({
      success: false,
      message: 'Password is incorrect'
    });
  }

  user.password = req.body.newPassword;
  await user.save();

  sendTokenResponse(user, 200, res);
});

// @desc    Forgot password
// @route   POST /api/auth/forgotpassword
// @access  Public
exports.forgotPassword = asyncHandler(async (req, res) => {
  console.log('Forgot password request received for email:', req.body.email);

  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    console.log('No user found with email:', req.body.email);
    // For security reasons, we still return success even if user doesn't exist
    return res.status(200).json({
      success: true,
      data: 'If your email is registered with us, you will receive a password reset link shortly.'
    });
  }

  console.log('User found, generating reset token');

  // Ensure address is an object
  if (typeof user.address === 'string' || user.address === null) {
    user.address = {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: ''
    };
  }
  // Get reset token
  const resetToken = user.getResetPasswordToken();
  console.log('Generated reset token:', resetToken);

  try {
    await user.save({ validateBeforeSave: false });
  } catch (err) {
    console.error('Error saving user with reset token:', err);
    return res.status(500).json({
      success: false,
      message: 'Could not save reset token. Please try again later.'
    });
  }

  // Create reset url - point to frontend instead of API
  const frontendUrl = process.env.NODE_ENV === 'production'
    ? process.env.FRONTEND_URL || 'https://fixly-home-service-2vf2.vercel.app'
    : process.env.FRONTEND_URL || 'http://localhost:5173';
  console.log('Using frontend URL for password reset:', frontendUrl);
  const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;

  const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please click on the following link to reset your password: \n\n ${resetUrl}`;

  // Enhanced HTML email template
  const htmlMessage = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password Reset - Fixly</title>
  </head>
  <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f4f4;">
    <div style="background-color: #ffffff; border-radius: 8px; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #3b82f6; margin: 0; font-size: 28px;">Fixly</h1>
        <p style="color: #666; margin: 10px 0 0; font-size: 16px;">Service Marketplace Platform</p>
      </div>
      
      <div style="background-color: #eef2ff; padding: 20px; border-radius: 6px; margin-bottom: 30px;">
        <h2 style="color: #1e40af; margin-top: 0; font-size: 22px;">Password Reset Request</h2>
        <p style="margin: 10px 0;">You are receiving this email because you (or someone else) has requested the reset of a password for your Fixly account.</p>
        <p style="margin: 10px 0;"><strong>This link will expire in 15 minutes.</strong></p>
      </div>
      
      <p style="margin: 20px 0;">To reset your password, click the button below:</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetUrl}" 
           style="background-color: #3b82f6; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block; font-size: 16px;">
          Reset Password
        </a>
      </div>
      
      <p style="margin: 20px 0;">If the button above doesn't work, you can also copy and paste the following link into your browser:</p>
      <div style="background-color: #f1f5f9; padding: 15px; border-radius: 6px; word-break: break-all; font-size: 14px; margin: 20px 0;">
        ${resetUrl}
      </div>
      
      <p style="margin: 20px 0;">If you did not request this, please ignore this email and your password will remain unchanged.</p>
      
      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
      
      <div style="text-align: center; color: #64748b; font-size: 14px;">
        <p style="margin: 5px 0;">This email was sent by Fixly Service Marketplace</p>
        <p style="margin: 5px 0;">© ${new Date().getFullYear()} Fixly. All rights reserved.</p>
      </div>
    </div>
  </body>
  </html>
  `;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Password Reset Request - Fixly',
      message,
      html: htmlMessage
    });

    res.status(200).json({ success: true, data: 'Email sent successfully' });
  } catch (err) {
    console.log('Email sending error:', err);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save({ validateBeforeSave: false });

    // Return error response with more details
    res.status(500).json({ 
      success: false, 
      message: 'Failed to send email. Please check your network connection and try again.',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// @desc    Reset password
// @route   PUT /api/auth/resetpassword/:resettoken
// @access  Public
exports.resetPassword = asyncHandler(async (req, res) => {
  console.log('Reset password request received with token:', req.params.resettoken);

  // Get hashed token
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(req.params.resettoken)
    .digest('hex');

  console.log('Hashed token:', resetPasswordToken);

  // Find user with this token and check if token is still valid
  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() }
  });

  console.log('User found:', user ? 'Yes' : 'No');
  
  // Additional debugging info
  if (!user) {
    // Let's check if token exists but is expired
    const userWithToken = await User.findOne({ resetPasswordToken });
    if (userWithToken) {
      console.log('Token found but expired:', userWithToken.resetPasswordExpire < Date.now());
      console.log('Token expiration time:', userWithToken.resetPasswordExpire);
      console.log('Current time:', Date.now());
    } else {
      console.log('Token not found in database');
    }
  }

  if (!user) {
    return res.status(400).json({
      success: false,
      message: 'Invalid or expired token. Please request a new password reset.'
    });
  }

  // Ensure address is an object
  if (typeof user.address === 'string' || user.address === null) {
    user.address = {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: ''
    };
  }
  // Set new password
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  try {
    await user.save();
  } catch (err) {
    console.error('Error saving user with new password:', err);
    return res.status(500).json({
      success: false,
      message: 'Could not reset password'
    });
  }

  sendTokenResponse(user, 200, res);
});

// Helper function removed - using the more complete version below

// @desc    Get all users
// @route   GET /api/users
// @access  Private (Admin only)
exports.getUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select('-password');
  res.status(200).json({
    success: true,
    count: users.length,
    data: users
  });
});

// @desc    Get single user by ID
// @route   GET /api/users/:id
// @access  Private (Admin only)
exports.getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  res.status(200).json({
    success: true,
    data: user
  });
});

// Generate token
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, userType: user.userType },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE }
  );
};

// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  // Create token
  const token = generateToken(user);

  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true
  };

  if (process.env.NODE_ENV === 'production') {
    options.secure = true;
  }

  res
    .status(statusCode)
    .cookie('token', token, options)
    .json({
      success: true,
      token,
      data: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        userType: user.userType,
        profilePicture: user.profilePicture,
        phone: user.phone,
        address: user.address
      }
    });
};