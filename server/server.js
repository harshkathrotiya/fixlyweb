const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Load env vars
dotenv.config();

// Connect to database with error handling
let dbConnected = false;

const initializeDB = async () => {
  try {
    await connectDB();
    dbConnected = true;
  } catch (error) {
    console.error('Failed to connect to database:', error);
    dbConnected = false;
  }
};

// Route files
const routes = require('./routes');

const app = express();

// Body parser
app.use(express.json());

// Cookie parser
app.use(cookieParser());

// Parse URL-encoded bodies (for form data)
app.use(express.urlencoded({ extended: true }));

// Enable CORS with options
const corsOptions = {
  origin: process.env.FRONTEND_URL || ['http://localhost:5173', 'http://localhost:5000', 'https://fixlyhome.vercel.app'],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Add a health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    database: dbConnected ? 'Connected' : 'Disconnected'
  });
});

// Add middleware to check database connection before handling requests
app.use((req, res, next) => {
  if (!dbConnected) {
    return res.status(500).json({
      success: false,
      message: 'Database connection error. Please try again later.'
    });
  }
  next();
});

// Mount routes
app.use(routes);

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  const path = require('path');

  // Set static folder
  const clientBuildPath = path.join(__dirname, '../client/dist');
  app.use(express.static(clientBuildPath));

  // Handle React routing, return all requests to React app
  app.get('*', (req, res) => {
    // Skip API routes
    if (!req.url.startsWith('/api/')) {
      res.sendFile(path.resolve(clientBuildPath, 'index.html'));
    }
  });
}

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Initialize database connection before starting server
const startServer = async () => {
  try {
    await initializeDB();
    
    const server = app.listen(PORT, () => {
      console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
      console.log(`Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (err, promise) => {
      console.log(`Error: ${err.message}`);
      // Close server & exit process
      server.close(() => process.exit(1));
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
