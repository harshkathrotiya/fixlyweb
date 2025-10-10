const Razorpay = require('razorpay');

// Initialize Razorpay instance only if environment variables are set
let razorpay = null;

if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
  });
} else {
  console.warn('Razorpay configuration not found. Payment processing will be disabled.');
}

module.exports = razorpay;