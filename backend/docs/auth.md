
Authentication API Documentation
================================

This document explains how to use the authentication endpoints for user registration and login. 
It includes the request format, response structure, and error codes.

Base URL:
---------
/api/auth

---------------------------------
1. Register User
---------------------------------
Endpoint:
POST /api/auth/register

Description:
Creates a new user account with a unique email, username, and phone number.

Request Body (JSON):
--------------------
| Field     | Type   | Required | Description            |
|-----------|--------|----------|------------------------|
| email     | string | Yes      | User's email address   |
| password  | string | Yes      | Plain text password    |
| username  | string | Yes      | Unique username        |
| phone     | string | Yes      | User's phone number    |

Example:
{
  "email": "testuser@example.com",
  "password": "mypassword123",
  "username": "testuser",
  "phone": "9876543210"
}

Successful Response:
--------------------
Status Code: 201 (Created)
{
  "message": "User registered successfully",
  "data": {
    "_id": "6509f95d8eab84c123456789",
    "email": "testuser@example.com",
    "username": "testuser",
    "phone": "9876543210",
    "password": "<hashed_password>"
  }
}

Error Responses:
----------------
400 - Validation failed due to incorrect input format (Zod validation error).
Example:
{
  "message": "Invalid input format",
  "error": [
    {
      "path": ["email"],
      "message": "Invalid email"
    }
  ]
}

409 - A user with the provided email, username, or phone already exists.
Example:
{
  "message": "User with these credentials already exists"
}

500 - Unexpected server error.
Example:
{
  "message": "Server error",
  "error": "Error details"
}

---------------------------------
2. Login User
---------------------------------
Endpoint:
POST /api/auth/login

Description:
Authenticates an existing user and returns a JWT token for accessing protected resources.

Request Body (JSON):
--------------------
| Field     | Type   | Required | Description           |
|-----------|--------|----------|-----------------------|
| email     | string | Yes      | Registered email ID   |
| password  | string | Yes      | User's password       |

Example:
{
  "email": "testuser@example.com",
  "password": "mypassword123"
}

Successful Response:
--------------------
Status Code: 200 (OK)
{
  "message": "User login successful",
  "token": "<jwt_generated_token>"
}

Error Responses:
----------------
400 - Validation failed due to incorrect input format (Zod validation error).

401 - Wrong password entered.
Example:
{
  "message": "Invalid credentials"
}

404 - Email not found in the database.
Example:
{
  "message": "User not found"
}

500 - Unexpected server error.
Example:
{
  "message": "Server error",
  "error": "Error details"
}

---------------------------------
Summary of Status Codes
---------------------------------
| Status Code | Description |
|-------------|-------------|
| 200         | Successful login |
| 201         | Successful registration |
| 400         | Validation error in request body |
| 401         | Wrong password during login |
| 404         | Email not found during login |
| 409         | Duplicate email, username, or phone during registration |
| 500         | Unexpected server error |

Notes:
------
1. All requests must include the header:
   Content-Type: application/json

2. Use the JWT token returned from the login endpoint in the Authorization header for protected routes:
   Authorization: Bearer <jwt_generated_token>

3. Passwords are hashed securely using bcrypt before storing in the database.

4. The saltRounds value for password hashing is configured in the .env file.

