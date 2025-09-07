JobTracker Backend
Node.js backend API for JobTracker application using Express.js, MongoDB, and JWT authentication.

Quick Setup
Install dependencies:
npm install express mongoose bcryptjs jsonwebtoken cors dotenv joi
npm install --save-dev nodemon
Set up environment variables in .env:
Start development server:
npm run dev
Project Structure
src/ ├── config/ │ └── database.js ├── lib/ │ └── redis.js  │ └── cron.js ├── controllers/ │ ├── authController.js │ ├── userController.js │ └── jobController.js ├── middleware/ │ ├── authMiddlewares.js │ └── validationMiddlewares.js ├── models/ │ ├── userModels.js │ └── jobModels.js ├── routes/ │ ├── authRoutes.js │ ├── userRoutes.js │ └── jobRoutes.js └── app.js

API Endpoints
## API Endpoints Auth POST /api/auth/signup Description: Registers a new user.

Request Body:

json Copy Edit { "fullName": "...", "email": "...", "password": "..." } Response (201 Created):

json Copy Edit { "token": "...", "user": { "id": "...", "fullName": "...", "email": "..." } } POST /api/auth/login Description: Authenticates an existing user.

Request Body:

json Copy Edit { "email": "...", "password": "..." } Response (200 OK):

json Copy Edit { "token": "...", "user": { "id": "...", "fullName": "...", "email": "..." } } User Profile (/api/users) GET /api/users/me Description: Gets the profile information for the currently authenticated user.

Request Body: None

Response (200 OK):

json Copy Edit { "id": "...", "fullName": "...", "email": "...", "createdAt": "..." } PUT /api/users/me Description: Updates the profile information (name, email) for the authenticated user.

Request Body:

json Copy Edit { "fullName": "...", "email": "..." } Response (200 OK):

json Copy Edit { "id": "...", "fullName": "...", "email": "..." } PUT /api/users/me/password Description: Changes the password for the authenticated user.

Request Body:

json Copy Edit { "currentPassword": "...", "newPassword": "..." } Response (204 No Content): No content.

Logic: The server must first verify that currentPassword is correct before hashing and saving the newPassword.

Jobs (/api/jobs) GET /api/jobs Description: Fetches all job applications for the authenticated user.

Response (200 OK):

json Copy Edit [ { "id": "...", "title": "...", "company": "...", "status": "...", "createdAt": "..." } ] POST /api/jobs Description: Creates a new job application.

Request Body:

json Copy Edit { "title": "...", "company": "...", "status": "...", "description": "..." } Response (201 Created):

json Copy Edit { "id": "...", "title": "...", "company": "...", "status": "...", "description": "..." } PUT /api/jobs/:jobId Description: Updates an existing job application.

Request Body:

json Copy Edit { "title": "...", "company": "...", "status": "...", "description": "..." } Response (200 OK):

json Copy Edit { "id": "...", "title": "...", "company": "...", "status": "...", "description": "..." } DELETE /api/jobs/:jobId Description: Deletes a job application.

Response (204 No Content): No content.

## Security & Middleware JWT Authentication to protect routes

Password Hashing using bcryptjs

Request Validation using Joi

CORS Enabled for frontend access

## Authentication All protected routes require a JWT in the Authorization header:

makefile Copy Edit Authorization: Bearer yaml Copy Edit

Security & Middleware
JWT Authentication: Protects all routes except auth endpoints
Password Hashing: bcryptjs with strong hashing
Input Validation: Joi validation on all request bodies
CORS: Cross-Origin Resource Sharing enabled
Authentication
POST /api/auth/signup - Register new user
POST /api/auth/login - Login user
User Profile (Protected)
GET /api/users/me - Get user profile
PUT /api/users/me - Update profile
PUT /api/users/me/password - Change password
Jobs (Protected)
GET /api/jobs - Get all jobs
POST /api/jobs - Create new job
PUT /api/jobs/:jobId - Update job
DELETE /api/jobs/:jobId - Delete job
Authentication
All protected routes require JWT token in Authorization header:

Authorization: Bearer <your-token>
Contribution Guide

Contributing to This Project
Thank you for considering contributing! We welcome all improvements, bug fixes, and ideas.
Please take a moment to read this guide to ensure a smooth contribution process.

## Prerequisites
Before contributing, make sure you have:

Git installed
A GitHub account
The repository forked to your account
Required dependencies installed (see README.md)
## How to Contribute
1. Fork the Repository
Click the Fork button at the top-right of this page to create your own copy.

2. Clone Your Fork
git clone https://github.com/<your-username>/<repo-name>.git
cd <repo-name>
3. Create a New Branch
Use a descriptive branch name:

git checkout -b feature/add-new-component
4. Make Your Changes
Follow the coding style and conventions in this repo.
Keep commits focused and clear.
Write descriptive commit messages:
git commit -m "Add user profile component"
5. Run Tests (If Applicable)
Make sure all tests pass before submitting:

npm test
# or
yarn test
6. Push Your Branch
git push origin feature/add-new-component
7. Open a Pull Request (PR)
Go to your fork on GitHub.
Click Compare & pull request.
Fill in the PR template with:
Description of changes
Issue(s) linked
Steps to test
## Coding Guidelines
Code Style: Follow the existing code style and formatting rules.
Linting: Run npm run lint (or equivalent) before committing.
Tests: Add/update tests for any new or changed functionality.
Commits: Use meaningful commit messages:
feat: add new booking API
fix: correct date parsing in calendar
docs: update API usage section
## Reporting Bugs
If you find a bug:

Check if it’s already reported in Issues.
Open a new issue with:
Steps to reproduce
Expected vs. actual results
Screenshots or error logs (if applicable)
## Suggesting Features
For new ideas or enhancements:

Open a Feature Request.
Explain the motivation and proposed solution.
## License
By contributing, you agree that your contributions will be licensed under the repository's license.

Thank you for helping improve this project! 