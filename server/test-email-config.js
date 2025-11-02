/**
 * Test script for email configuration
 * This script tests the email configuration without actually sending an email
 */

// Load environment variables from .env file
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

// Log email configuration for debugging (masking sensitive data)
console.log('Email Configuration Check:');
console.log('========================');

const config = {
  SMTP_HOST: process.env.SMTP_HOST,
  SMTP_PORT: process.env.SMTP_PORT,
  SMTP_EMAIL: process.env.SMTP_EMAIL,
  SMTP_PASSWORD: process.env.SMTP_PASSWORD ? '********' : 'NOT SET',
  FROM_EMAIL: process.env.FROM_EMAIL,
  FROM_NAME: process.env.FROM_NAME
};

// Check each configuration value
Object.entries(config).forEach(([key, value]) => {
  if (!value || value === 'NOT SET') {
    console.log(`❌ ${key}: MISSING`);
  } else {
    console.log(`✅ ${key}: ${value}`);
  }
});

// Check for missing required fields
const requiredFields = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_EMAIL', 'SMTP_PASSWORD', 'FROM_EMAIL'];
const missingFields = requiredFields.filter(field => !process.env[field]);

if (missingFields.length > 0) {
  console.log('\n⚠️  Missing Required Configuration:');
  missingFields.forEach(field => console.log(`   - ${field}`));
  console.log('\nPlease update your .env file with the correct values.');
} else {
  console.log('\n✅ All required email configuration fields are present.');
  console.log('\nNote: This only verifies that the configuration values exist.');
  console.log('To test actual email sending, run: node test-email.js');
}