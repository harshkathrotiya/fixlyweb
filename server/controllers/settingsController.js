const asyncHandler = require('../utils/asyncHandler');
const Settings = require('../models/Settings');
const { cloudinary } = require('../config/cloudinary');

// @desc    Get all settings
// @route   GET /api/admin/settings
// @access  Private/Admin
const getSettings = asyncHandler(async (req, res) => {
  const settings = await Settings.getOrCreate();
  res.status(200).json({
    success: true,
    data: settings
  });
});

// @desc    Update general settings
// @route   PUT /api/admin/settings/general
// @access  Private/Admin
const updateGeneralSettings = asyncHandler(async (req, res) => {
  const settings = await Settings.getOrCreate();
  
  // Update general settings
  settings.general.siteName = req.body.siteName || settings.general.siteName;
  settings.general.siteDescription = req.body.siteDescription || settings.general.siteDescription;
  settings.general.contactEmail = req.body.contactEmail || settings.general.contactEmail;
  settings.general.contactPhone = req.body.contactPhone || settings.general.contactPhone;
  
  // Handle logo upload if provided
  if (req.file) {
    // Use the secure_url from the file uploaded by the middleware
    settings.general.logo = req.file.secure_url;
  }
  
  await settings.save();
  
  res.status(200).json({
    success: true,
    data: settings,
    message: 'General settings updated successfully'
  });
});

// @desc    Update commission settings
// @route   PUT /api/admin/settings/commission
// @access  Private/Admin
const updateCommissionSettings = asyncHandler(async (req, res) => {
  const settings = await Settings.getOrCreate();
  
  // Update commission settings
  if (req.body.rate !== undefined) {
    settings.commission.rate = req.body.rate;
  }
  if (req.body.minimumPayout !== undefined) {
    settings.commission.minimumPayout = req.body.minimumPayout;
  }
  if (req.body.payoutSchedule !== undefined) {
    settings.commission.payoutSchedule = req.body.payoutSchedule;
  }
  
  await settings.save();
  
  res.status(200).json({
    success: true,
    data: settings,
    message: 'Commission settings updated successfully'
  });
});

// @desc    Update notification settings
// @route   PUT /api/admin/settings/notifications
// @access  Private/Admin
const updateNotificationSettings = asyncHandler(async (req, res) => {
  const settings = await Settings.getOrCreate();
  
  // Update notification settings
  if (req.body.email !== undefined) {
    settings.notifications.email = req.body.email;
  }
  if (req.body.sms !== undefined) {
    settings.notifications.sms = req.body.sms;
  }
  if (req.body.push !== undefined) {
    settings.notifications.push = req.body.push;
  }
  
  await settings.save();
  
  res.status(200).json({
    success: true,
    data: settings,
    message: 'Notification settings updated successfully'
  });
});

// @desc    Update security settings
// @route   PUT /api/admin/settings/security
// @access  Private/Admin
const updateSecuritySettings = asyncHandler(async (req, res) => {
  const settings = await Settings.getOrCreate();
  
  // Update security settings
  if (req.body.requireEmailVerification !== undefined) {
    settings.security.requireEmailVerification = req.body.requireEmailVerification;
  }
  if (req.body.requirePhoneVerification !== undefined) {
    settings.security.requirePhoneVerification = req.body.requirePhoneVerification;
  }
  if (req.body.requireProviderDocuments !== undefined) {
    settings.security.requireProviderDocuments = req.body.requireProviderDocuments;
  }
  if (req.body.maintenanceMode !== undefined) {
    settings.security.maintenanceMode = req.body.maintenanceMode;
  }
  
  await settings.save();
  
  res.status(200).json({
    success: true,
    data: settings,
    message: 'Security settings updated successfully'
  });
});

module.exports = {
  getSettings,
  updateGeneralSettings,
  updateCommissionSettings,
  updateNotificationSettings,
  updateSecuritySettings
};