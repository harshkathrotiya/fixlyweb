# Fixly - Service Marketplace Platform

## Overview
Fixly is a modern service marketplace platform that connects customers with verified service providers. Built with a robust tech stack including Node.js, Express.js, MongoDB, and React, Fixly offers a seamless experience for both service seekers and providers.

## Table of Contents
- [Business Process Overview](#business-process-overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Key Features](#key-features)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Running the Application](#running-the-application)
- [Testing](#testing)
- [API Documentation](#api-documentation)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

## Business Process Overview

### Core Business Model
Fixly operates as a two-sided marketplace where customers can discover, book, and pay for various services from verified service providers. The platform generates revenue through service commissions (10-15% on each successful booking).

### Key Business Processes

#### 1. User Registration & Authentication
- Users can register as customers or service providers
- Secure authentication with JWT tokens and cookie sessions
- Password reset functionality via email verification
- Role-based access control (Customer, Provider, Admin)

#### 2. Service Category Management
- Admins can create, edit, and delete service categories
- Categories help organize services for easier discovery
- Each category can have a name, description, and associated image

#### 3. Service Provider Onboarding
- Service providers can create detailed profiles
- Providers can list their services with descriptions, pricing, and availability
- Profile verification process to ensure quality and trust

#### 4. Service Discovery & Booking
- Customers can browse and search for services by category, price, rating, or location
- Detailed service listings with descriptions, images, and provider information
- Booking system with date/time selection and special instructions
- Real-time availability checking to prevent double bookings

#### 5. Payment Processing
- Secure payment gateway integration for processing bookings
- Automatic commission calculation and deduction
- Support for major payment methods
- Payment status tracking and history

#### 6. Review & Rating System
- Customers can rate services (1-5 stars) after completion
- Detailed review functionality with text feedback
- Average ratings displayed on service listings
- Review moderation capabilities for admins

#### 7. Admin Platform Management
- User account management and monitoring
- Service listing approval and quality control
- Commission tracking and financial reporting
- Dispute resolution and customer support
- Platform analytics and business intelligence dashboard

## Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens) with secure cookie sessions
- **Image Management**: Cloudinary for cloud-based image storage and processing
- **Email Service**: Nodemailer for transactional emails
- **Payment Processing**: Razorpay integration
- **Middleware**:
  - bcryptjs for password hashing
  - cookie-parser for cookie management
  - cors for Cross-Origin Resource Sharing
  - morgan for HTTP request logging
  - multer for file uploads
  - dotenv for environment variable management
  - express-async-handler for simplified async error handling

### Frontend (Client)
- **Framework**: React 18+
- **Build Tool**: Vite
- **Routing**: React Router DOM
- **Styling**: Tailwind CSS
- **UI Components**: 
  - React Toastify for notifications
  - Framer Motion for animations
  - React Chart.js 2 for data visualization
  - Flickity for carousel components
- **HTTP Client**: Axios for API requests
- **State Management**: Built-in React hooks and Context API
- **Authentication**: JWT decode for token handling

### Development & Testing
- **Package Management**: npm
- **Development Server**: Nodemon for auto-reloading
- **Testing**: Jest for unit testing, Supertest for API testing
- **Code Quality**: ESLint for linting

### Infrastructure & Deployment
- **Database Hosting**: MongoDB Atlas
- **Image Storage**: Cloudinary
- **Email Service**: SMTP-compatible email providers (Gmail configured)
- **Frontend Deployment**: Vercel
- **Backend Deployment**: Render (Docker)
- **CI/CD**: GitHub Actions for automated testing

## Project Structure

```
Fixly/
├── client/                 # React frontend application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API service calls
│   │   ├── context/        # React context providers
│   │   ├── hooks/          # Custom React hooks
│   │   ├── utils/          # Utility functions
│   │   ├── constants/      # Application constants
│   │   ├── config/         # Configuration files
│   │   ├── styles/         # Global styles
│   │   ├── App.jsx         # Main app component
│   │   └── main.jsx        # Entry point
│   └── public/             # Static assets
├── server/                 # Node.js backend application
│   ├── controllers/        # Request handlers
│   ├── models/             # Database models
│   ├── routes/             # API route definitions
│   ├── middleware/         # Custom middleware
│   ├── config/             # Configuration files
│   ├── utils/              # Utility functions
│   ├── tests/              # Test files
│   └── server.js           # Entry point
├── Documentation/          # Project documentation
└── ProductDetails/         # Product requirement documents
```

## Key Features

### User Management
- Multi-role authentication (Customer, Service Provider, Admin)
- Secure password hashing with bcrypt
- JWT-based session management
- Profile management with image upload
- Account verification and password reset

### Service Management
- Category-based service organization
- Detailed service listings with images
- Service search and filtering capabilities
- Provider ratings and reviews

### Booking System
- Real-time availability checking
- Date/time selection interface
- Booking confirmation and status tracking
- Special instructions for service providers

### Payment Integration
- Secure Razorpay payment processing
- Automatic commission calculation
- Transaction history tracking
- Refund management

### Admin Dashboard
- User and provider management
- Service listing approval
- Financial reporting and analytics
- Commission tracking
- Dispute resolution tools

### Communication
- Email notifications for key events
- Contact forms for customer support
- Automated booking confirmations

## Installation

### Prerequisites
- Node.js (v16 or higher)
- MongoDB database (local or Atlas)
- Cloudinary account
- Email service credentials (Gmail recommended)
- Razorpay account for payment processing

### Backend Setup
1. Clone the repository
2. Navigate to the server directory: `cd server`
3. Install dependencies: `npm install`
4. Create a `.env` file based on `.env.example`
5. Configure environment variables (see below)

### Frontend Setup
1. Navigate to the client directory: `cd client`
2. Install dependencies: `npm install`
3. Create a `.env` file if needed for frontend-specific variables

## Environment Variables

Create a `.env` file in the `server` directory with the following variables:

```
# Database
MONGO_URI=your_mongodb_connection_string

# JWT
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=30d
JWT_COOKIE_EXPIRE=30

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Email Service
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_EMAIL=your_email@gmail.com
SMTP_PASSWORD=your_app_password
FROM_NAME=Fixly
FROM_EMAIL=your_email@gmail.com

# Razorpay
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# Frontend URL
FRONTEND_URL=http://localhost:5173

# Node Environment
NODE_ENV=development
```

## Running the Application

### Development Mode

**Backend:**
```bash
cd server
npm run dev
```

**Frontend:**
```bash
cd client
npm run dev
```

### Production Mode

**Backend:**
```bash
cd server
npm start
```

**Frontend:**
```bash
cd client
npm run build
npm run preview
```

## Testing

### Backend Testing
Run the full test suite:
```bash
cd server
npm test
```

Run tests in watch mode:
```bash
cd server
npm run test:watch
```

### Frontend Testing
Frontend testing setup (add details based on your testing framework)

## API Documentation

Detailed API documentation is available in the following locations:
- [Image Management API Documentation](code_docs/imageManagementAPI.md)
- Individual controller files contain route documentation
- Postman collection available in Documentation/API/

## Deployment

### Backend Deployment (Render)
1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Set build command: `npm install`
4. Set start command: `npm start`
5. Add environment variables from your `.env` file
6. Deploy!

### Frontend Deployment (Vercel)
1. Create a new project on Vercel
2. Connect your GitHub repository
3. Set root directory to `client`
4. Add environment variables if needed
5. Deploy!

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

Please ensure your code follows the existing style and includes appropriate tests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
