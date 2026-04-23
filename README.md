Secure Task Management System with RBAC

Description
A scalable RESTful API built with Node.js and a React-based dashboard. This system features Role-Based Access Control, alphanumeric Captcha verification, and a multi-step OTP-based registration flow.

Key Features

-Dual-Role Dashboards: Separate interfaces for Admin and User roles

-Status Cycle Engine: Interactive task cards that cycle status on click

-Admin Oversight: Global task monitoring and user account management

-Identity Protection: OTP email verification and Captcha-secured login

-Profile Management: Comprehensive profile updates with pre-filled data

Tech Stack

-Backend: Node.js, Express, MongoDB, JWT, Bcrypt, Swagger

-Frontend: React.js, Lucide Icons, Axios, React Hot Toast

Installation and Setup

Clone the repository

Backend Setup:

Navigate to /backend

Run: npm install

Create a .env file with: MONGO_URI, JWT_SECRET, EMAIL_USER, EMAIL_PASS

Run: npm start

Frontend Setup:

Navigate to /frontend

Run: npm install

Run: npm start

API Documentation
The interactive Swagger documentation is available at:
http://localhost:8080/api-docs

Scalability Note
To handle production-level traffic, the following architecture is proposed:

Redis Caching: Implement caching on high-traffic routes like getAllTasksAdmin to reduce database latency.

Microservices: Decouple Authentication and Task Management into independent services to allow granular scaling.

Database Optimization: Apply compound indexing on user_id and status fields in MongoDB for optimized query performance.

Load Balancing: Utilize Nginx for round-robin traffic distribution across multiple server instances.

Author
Subhranil Biswas
