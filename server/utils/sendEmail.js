const nodemailer = require('nodemailer');

/**
 * Send email utility
 * @param {Object} options - Email options
 * @param {string} options.email - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.message - Plain text message (used if html is not provided)
 * @param {string} options.html - HTML content for the email (optional)
 * @returns {Promise} - Nodemailer send result
 */
const sendEmail = async (options) => {
  // Check if email configuration exists
  if (!process.env.SMTP_HOST || !process.env.SMTP_PORT || !process.env.SMTP_EMAIL || !process.env.SMTP_PASSWORD) {
    throw new Error('Email service not properly configured. Missing SMTP credentials.');
  }

  // Create a transporter with timeout configuration
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASSWORD
    },
    // Add timeout configuration
    tls: {
      rejectUnauthorized: false
    },
    connectionTimeout: 30000, // 30 seconds
    greetingTimeout: 30000,   // 30 seconds
    socketTimeout: 30000      // 30 seconds
  });

  // Define email options
  const mailOptions = {
    from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
    to: options.email,
    subject: options.subject,
    text: options.message
  };

  // Add HTML content if provided
  if (options.html) {
    mailOptions.html = options.html;
  }

  // Send email
  try {
    console.log('Sending email to:', options.email);
    console.log('SMTP Host:', process.env.SMTP_HOST);
    console.log('SMTP Port:', process.env.SMTP_PORT);
    
    const result = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully to:', options.email);
    return result;
  } catch (error) {
    console.error('Email sending failed:', error);
    // Provide more detailed error information
    throw new Error(`Failed to send email: ${error.message}. Please check your SMTP configuration and network connection.`);
  }
};

module.exports = sendEmail;