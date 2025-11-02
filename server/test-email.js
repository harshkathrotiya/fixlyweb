/**
 * Test script for email functionality
 */

// Load environment variables from .env file
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const sendEmail = require('./utils/sendEmail');

// Log email configuration for debugging
console.log('Email configuration check:');
console.log('========================');

// Check if required environment variables are set
const requiredVars = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_EMAIL', 'SMTP_PASSWORD', 'FROM_EMAIL'];
const missingVars = requiredVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error(`⚠️ Missing required environment variables: ${missingVars.join(', ')}`);
  console.error('Please check your .env file and ensure all required variables are set.');
  process.exit(1);
}

console.log('✅ All required email configuration variables are present');
console.log('SMTP Host:', process.env.SMTP_HOST);
console.log('SMTP Port:', process.env.SMTP_PORT);
console.log('SMTP Email:', process.env.SMTP_EMAIL);
console.log('From Email:', process.env.FROM_EMAIL);
console.log('From Name:', process.env.FROM_NAME || 'Not set');

// Get test email address from command line argument or use default
const testEmail = process.argv[2] || process.env.SMTP_EMAIL;

console.log(`\nTesting email sending to: ${testEmail}`);

// Test email sending function
async function runTestEmail() {
  try {
    console.log('\nTesting email sending...');
    
    const result = await sendEmail({
      email: testEmail,
      subject: 'Fixly Email Test',
      message: 'This is a test email from Fixly to verify email sending functionality.',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #3b82f6;">Fixly Email Test</h1>
          <p>This is a test email from Fixly to verify email sending functionality.</p>
          <p>If you received this email, it means the email configuration is working correctly.</p>
          <div style="background-color: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
            <p><strong>Time sent:</strong> ${new Date().toLocaleString()}</p>
            <p><strong>Server:</strong> ${process.env.SMTP_HOST}:${process.env.SMTP_PORT}</p>
          </div>
          <p style="color: #6b7280; font-size: 14px;">
            This is an automated test message. You can safely ignore or delete this email.
          </p>
        </div>
      `
    });

    console.log('✅ Email sent successfully!');
    console.log('Message ID:', result.messageId);
  } catch (err) {
    console.error('❌ Error sending email:', err.message);
    
    if (err.message.includes('EAUTH')) {
      console.error('\nAuthentication failed. Please check:');
      console.error('- SMTP email address is correct');
      console.error('- SMTP password is correct (use App Password for Gmail/Yahoo)');
      console.error('- Account has SMTP access enabled');
    } else if (err.message.includes('ENOTFOUND')) {
      console.error('\nConnection failed. Please check:');
      console.error('- SMTP host is correct');
      console.error('- Internet connection is working');
    } else if (err.message.includes('ECONNREFUSED')) {
      console.error('\nConnection refused. Please check:');
      console.error('- SMTP host and port are correct');
      console.error('- SMTP server is accessible');
    }
  }
}

// Run the test
runTestEmail();