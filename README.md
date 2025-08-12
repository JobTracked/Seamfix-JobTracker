# JobTracker Backend

Node.js backend API for JobTracker application using Express.js, MongoDB, and JWT authentication.

## Quick Setup

1. **Install dependencies:**
```bash
npm install express mongoose bcryptjs jsonwebtoken cors dotenv joi
npm install --save-dev nodemon
```

2. **Set up environment variables in .env:**
```env
```

3. **Start development server:**
```bash
npm run dev
```

## Project Structure
src/
├── config/
│   └── database.js
├── controllers/
│   ├── authController.js
│   ├── userController.js
│   └── jobController.js
├── middleware/
│   ├── authMiddlewares.js
│   └── validationMiddlewares.js
├── models/
│   ├── userModels.js
│   └── jobModels.js
├── routes/
│   ├── authRoutes.js
│   ├── userRoutes.js
│   └── jobRoutes.js
└── app.js


## API Endpoints

🔑 API Endpoints
Auth
POST /api/auth/signup
Description: Registers a new user.

Request Body:

json
Copy
Edit
{
  "fullName": "...",
  "email": "...",
  "password": "..."
}
Response (201 Created):

json
Copy
Edit
{
  "token": "...",
  "user": {
    "id": "...",
    "fullName": "...",
    "email": "..."
  }
}
POST /api/auth/login
Description: Authenticates an existing user.

Request Body:

json
Copy
Edit
{
  "email": "...",
  "password": "..."
}
Response (200 OK):

json
Copy
Edit
{
  "token": "...",
  "user": {
    "id": "...",
    "fullName": "...",
    "email": "..."
  }
}
User Profile (/api/users)
GET /api/users/me
Description: Gets the profile information for the currently authenticated user.

Request Body: None

Response (200 OK):

json
Copy
Edit
{
  "id": "...",
  "fullName": "...",
  "email": "...",
  "createdAt": "..."
}
PUT /api/users/me
Description: Updates the profile information (name, email) for the authenticated user.

Request Body:

json
Copy
Edit
{
  "fullName": "...",
  "email": "..."
}
Response (200 OK):

json
Copy
Edit
{
  "id": "...",
  "fullName": "...",
  "email": "..."
}
PUT /api/users/me/password
Description: Changes the password for the authenticated user.

Request Body:

json
Copy
Edit
{
  "currentPassword": "...",
  "newPassword": "..."
}
Response (204 No Content): No content.

Logic: The server must first verify that currentPassword is correct before hashing and saving the newPassword.

Jobs (/api/jobs)
GET /api/jobs
Description: Fetches all job applications for the authenticated user.

Response (200 OK):

json
Copy
Edit
[
  {
    "id": "...",
    "title": "...",
    "company": "...",
    "status": "...",
    "createdAt": "..."
  }
]
POST /api/jobs
Description: Creates a new job application.

Request Body:

json
Copy
Edit
{
  "title": "...",
  "company": "...",
  "status": "...",
  "description": "..."
}
Response (201 Created):

json
Copy
Edit
{
  "id": "...",
  "title": "...",
  "company": "...",
  "status": "...",
  "description": "..."
}
PUT /api/jobs/:jobId
Description: Updates an existing job application.

Request Body:

json
Copy
Edit
{
  "title": "...",
  "company": "...",
  "status": "...",
  "description": "..."
}
Response (200 OK):

json
Copy
Edit
{
  "id": "...",
  "title": "...",
  "company": "...",
  "status": "...",
  "description": "..."
}
DELETE /api/jobs/:jobId
Description: Deletes a job application.

Response (204 No Content): No content.

🛡️ Security & Middleware
JWT Authentication to protect routes

Password Hashing using bcryptjs

Request Validation using Joi

CORS Enabled for frontend access

🔐 Authentication
All protected routes require a JWT in the Authorization header:

makefile
Copy
Edit
Authorization: Bearer <your-token>
yaml
Copy
Edit


### Security & Middleware
- **JWT Authentication**: Protects all routes except auth endpoints
- **Password Hashing**: bcryptjs with strong hashing
- **Input Validation**: Joi validation on all request bodies  
- **CORS**: Cross-Origin Resource Sharing enabled

## Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user

### User Profile (Protected)
- `GET /api/users/me` - Get user profile
- `PUT /api/users/me` - Update profile
- `PUT /api/users/me/password` - Change password

### Jobs (Protected)
- `GET /api/jobs` - Get all jobs
- `POST /api/jobs` - Create new job
- `PUT /api/jobs/:jobId` - Update job
- `DELETE /api/jobs/:jobId` - Delete job

## Authentication
All protected routes require JWT token in Authorization header:
```
Authorization: Bearer <your-token>
```