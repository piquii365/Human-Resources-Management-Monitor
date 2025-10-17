# HR Monitoring and Evaluation System

## Project Overview

A Web-Based Monitoring and Evaluation System for the Department of Human Resources Management at the Ministry of Local Government and Public Works (Zimbabwe). This system centralizes HR data management, performance tracking, recruitment monitoring, and training evaluation.

## Tech Stack

### Frontend (Client)

- **Framework**: React 19 + TypeScript
- **Build Tool**: Vite (Rolldown)
- **Styling**: Tailwind CSS v4
- **Routing**: React Router v7
- **HTTP Client**: Axios
- **Authentication**: Firebase Auth

### Backend (Server)

- **Runtime**: Node.js 20
- **Framework**: Express.js 5
- **Language**: TypeScript
- **Database**: MySQL 8
- **Authentication**: Firebase Admin + JWT
- **Security**: Helmet, CORS, bcrypt

## Project Structure

```
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── config/        # Firebase and route config
│   │   ├── contexts/      # React contexts (Auth)
│   │   └── api.ts         # API client configuration
│   └── package.json
│
├── server/                 # Backend Express application
│   ├── src/
│   │   ├── config/        # Database configuration
│   │   ├── controllers/   # Route controllers
│   │   ├── middleware/    # Auth & validation middleware
│   │   ├── routes/        # API routes
│   │   └── index.ts       # Server entry point
│   ├── sequelize.sql      # Complete database schema
│   └── package.json
│
└── start.sh               # Startup script for both services
```

## Authentication Flow (3-Way Firebase Auth)

The system implements a secure 3-way authentication flow:

1. **Client Registration/Login** (Firebase):

   - User registers/logs in through Firebase Auth
   - Supports: Email/Password, Google OAuth
   - Firebase returns user details and ID token

2. **Server Registration**:

   - Client sends Firebase user details to backend `/api/auth/register`
   - Server stores user data in database
   - Creates employee record linked to user account

3. **Protected Routes**:
   - Client includes Firebase ID token in request headers
   - Server middleware validates token against Firebase
   - Compares client-issued JWT with Firebase for verification
   - Grants access to protected resources

## Database Setup (REQUIRED)

### Current Status

⚠️ **Action Required**: The application requires a MySQL database to function properly.

### Database Setup Steps

1. **Create a MySQL 8 database** on your chosen provider

2. **Run the schema**:

   - Use the complete schema in `server/sequelize.sql`
   - This includes tables, views, stored procedures, and functions
   - Connect to your database and execute the entire SQL file

3. **Update Environment Variables**:
   Edit `server/.env` with your database credentials:

   ```env
   DB_HOST=your-database-host.com
   DB_USER=your-database-username
   DB_PASSWORD=your-database-password
   DB_NAME=hr_management
   PORT=3800
   NODE_ENV=development
   ```

4. **Restart the application**:
   - The workflow will automatically restart
   - Check logs to ensure database connection is successful

### Database Schema Overview

The system includes:

- **Core Tables**: departments, employees, performance_evaluations, recruitment, applications, training_programs, training_enrollments
- **Views**: employees_by_department, open_recruitments, top_performers
- **Stored Procedures**: CRUD operations for all entities
- **Functions**: Employee name formatting, performance calculations

## Core Features

Based on the dissertation proposal, the system includes:

### 1. Employee Management

- Employee records and profiles
- Department assignment
- Position and salary tracking
- Employment status monitoring

### 2. Performance Evaluation

- Regular performance assessments
- Multi-criteria evaluation (technical skills, communication, teamwork, leadership, punctuality)
- Performance score tracking
- Goals and achievements monitoring

### 3. Recruitment & Applications

- Job posting management
- Application tracking
- Interview scheduling
- Candidate status management
- Hiring workflow

### 4. Training & Development

- Training program management
- Employee enrollment
- Attendance tracking
- Certificate issuance
- Feedback collection

### 5. Reporting & Analytics

- Calendar events (interviews, training)
- Performance reports
- Department analytics
- Employee metrics

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register user with Firebase details
- `POST /api/auth/login` - Login (handled by Firebase client-side)

### Employees

- `GET /api/employees` - List all employees
- `GET /api/employees/:id` - Get employee details
- `POST /api/employees` - Create employee
- `PUT /api/employees/:id` - Update employee
- `DELETE /api/employees/:id` - Delete employee

### Departments

- `GET /api/departments` - List departments
- `POST /api/departments` - Create department
- `PUT /api/departments/:id` - Update department
- `DELETE /api/departments/:id` - Delete department

### Recruitment

- `GET /api/recruitment` - List job postings
- `POST /api/recruitment` - Create job posting
- `GET /api/recruitment/:id/applications` - Get applications
- `POST /api/recruitment/:id/applications` - Submit application

### Training

- `GET /api/training` - List training programs
- `GET /api/training/:id/enrollments` - Get enrollments

### Calendar

- `GET /api/calendar/events?from=YYYY-MM-DD&to=YYYY-MM-DD` - Get calendar events

## Development

### Local Development

```bash
# Install dependencies
cd client && npm install
cd ../server && npm install

# Start both services
bash start.sh
```

### Environment Variables

**Client**: No environment file needed (Firebase config is in code)

**Server** (`server/.env`):

```env
DB_HOST=your-mysql-host
DB_USER=your-mysql-user
DB_PASSWORD=your-mysql-password
DB_NAME=hr_management
PORT=3800
NODE_ENV=development
```

### Ports

- **Frontend**: 5173 (default vite port)
- **Backend**: 3800

## Firebase Configuration

The project uses Firebase for authentication. Current configuration is in `client/src/config/firebase-config.ts`:

- Project: hr-management-monitor
- Authentication methods: Email/Password, Google OAuth

## User Preferences

- **Database**: MySQL 8 (external managed instance required)
- **Auth Flow**: Firebase 3-way authentication with server JWT validation
- **Deployment**: Replit platform with autoscale deployment

## Next Steps

1. ✅ Set up external MySQL database
2. ✅ Update server/.env with database credentials
3. ✅ Run schema from server/sequelize.sql
4. ✅ Test authentication flow
5. ✅ Verify all CRUD operations
6. ✅ Configure deployment settings

## Support

For questions about the system or implementation, refer to:

- Dissertation proposal document
- Firebase documentation for auth setup
- MySQL documentation for database management
