### Table of Contents

*   [Features](#features)
*   [Tech Stack](#tech-stack)
*   [Getting Started](#getting-started)
*   [Security Model](#security-model)
*   [API Endpoints](#api-endpoints)
    *   [Authentication](#authentication)
    *   [MFA Management](#mfa-management)
*   [Usage Examples](#usage-examples)
*   [Deployment](#deployment)
*   [Postman Collection](#postman-collection)

Reauth-Stamp
===============

A RESTful API service for managing Multi-Factor Authentication (MFA) codes, similar to popular commercial tools like 1Password or Okta. This service allows you to securely store and retrieve TOTP tokens for various services via API calls.

Features
--------

*   **Secure API Token Authentication**: Role-based access with master tokens
*   **TOTP Code Generation**: Compatible with standard MFA apps
*   **Flexible MFA Secret Format**: Automatically handles spaces and formatting in MFA secrets
*   **RESTful API Design**: Easy to integrate with other services
*   **MongoDB Storage**: Scalable and efficient data storage

Tech Stack
----------

*   **Node.js**: Server runtime
*   **TypeScript**: Type-safe code
*   **Express.js**: Web framework
*   **MongoDB**: Document database
*   **OTPLib**: TOTP generation library

Getting Started
---------------

### Prerequisites

*   Node.js 14+
*   MongoDB 4.4+
*   npm or yarn

### MongoDB Installation

#### macOS (with Homebrew)

    # Update Homebrew
    brew update
    
    # Install MongoDB Community Edition
    brew tap mongodb/brew
    brew install mongodb-community
    
    # Start MongoDB as a service
    brew services start mongodb-community

#### Ubuntu/Debian

    # Import MongoDB public GPG key
    wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
    
    # Create list file for MongoDB
    echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu $(lsb_release -cs)/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
    
    # Reload package database
    sudo apt-get update
    
    # Install MongoDB
    sudo apt-get install -y mongodb-org
    
    # Start MongoDB
    sudo systemctl start mongod

### Installation

1.  Clone the repository and `cd` into it.
    
2.  Install dependencies
    
        npm install
    
3.  Configure environment variables in `.env` file. You will need to generate/create these.
    
        PORT=3000
        MONGO_URI=mongodb://localhost:27017/mfa_service
        NODE_ENV=development
        ENCRYPTION_KEY=your-secure-encryption-key
        ENCRYPTION_IV=your-secure-iv
    
4.  Start the development server
    
        npm run dev
    
5.  Build for production
    
        npm run build
        npm start
    

Security Model
--------------

This service uses a "master token" system:

*   Master tokens never expire and are used to manage other tokens
*   Regular API tokens can be configured to expire or never expire
*   Only requests authenticated with a master token can create new API tokens
*   A master token is a special API token with elevated privileges
*   Regular API tokens can only access MFA functionality
*   If a master token is compromised, it can be reset with a new value using another master token

### Creating a Master Token

To create the initial master token:

    npm run init-master-token

This will output a token that should be saved securely. This token will be used to create all other tokens.

API Documentation
-----------------

All API requests expect and return JSON. Authentication is performed via Bearer token.

### Authentication Header

    Authorization: Bearer YOUR_API_TOKEN

### Authentication Endpoints

#### POST /api/auth/tokens

**Description:** Create a new API token (requires master token)

**Request Body:**
```json
{
  "name": "Token Name",
  "userId": "user123",
  "expiresInDays": 30  // Optional - if omitted, token never expires
}
```

**Response:**

    {
      "success": true,
      "data": {
        "id": "tokenId",
        "name": "Token Name",
        "token": "generated-uuid-token",
        "expiresAt": "2023-07-15T00:00:00.000Z", // Will be null if token never expires
        "createdAt": "2023-06-15T00:00:00.000Z"
      }
    }

#### GET/api/auth/tokens/:userId

**Description:** List all tokens for a user

**Response:**

    {
      "success": true,
      "data": [
        {
          "id": "tokenId",
          "name": "Token Name",
          "lastUsed": "2023-06-15T00:00:00.000Z",
          "expiresAt": "2023-07-15T00:00:00.000Z",
          "createdAt": "2023-06-15T00:00:00.000Z",
          "isActive": true
        }
      ]
    }

#### POST/api/auth/tokens/:id/revoke

**Description:** Revoke a token

**Response:**

    {
      "success": true,
      "message": "Token revoked successfully"
    }

#### GET/api/auth/validate

**Description:** Validate a token

**Response:**

    {
      "success": true,
      "data": {
        "id": "tokenId",
        "userId": "user123",
        "name": "Token Name",
        "expiresAt": "2023-07-15T00:00:00.000Z"
      }
    }

#### POST/api/auth/tokens/:id/reset-master

**Description:** Reset a master token with a new token value (requires master token)

**Response:**

```json
{
  "success": true,
  "message": "Master token reset successfully",
  "data": {
    "id": "masterTokenId",
    "name": "Master Token",
    "token": "new-token-value",
    "createdAt": "2023-06-15T00:00:00.000Z"
  }
}
```

### MFA Endpoints

#### POST /api/mfa

**Description:** Create a new MFA secret

**Request Body:**

```json
{
  "name": "Google Account",
  "initialAuth": "JBSW Y3DP EHPK 3PXP"  // Spaces are automatically removed
}
```

**Response:**

    {
      "success": true,
      "data": {
        "id": "mfaSecretId",
        "name": "Google Account",
        "createdAt": "2023-06-15T00:00:00.000Z"
      }
    }

#### GET/api/mfa/:id/code

**Description:** Get current TOTP code for a specific MFA secret

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "mfaSecretId",
    "name": "Google Account",
    "code": "123456",
    "validUntil": "2023-06-15T00:00:30.000Z",
    "secondsRemaining": 18
  }
}
```

#### GET/api/mfa

**Description:** List all MFA secrets

**Response:**

    {
      "success": true,
      "data": [
        {
          "_id": "mfaSecretId",
          "name": "Google Account",
          "createdAt": "2023-06-15T00:00:00.000Z",
          "updatedAt": "2023-06-15T00:00:00.000Z"
        }
      ]
    }

#### DELETE/api/mfa/:id

**Description:** Delete an MFA secret

**Response:**

    {
      "success": true,
      "message": "MFA secret deleted successfully"
    }

Usage Examples
--------------

### Creating an MFA Entry

```bash
# Spaces in the secret are handled automatically
curl -X POST http://localhost:3000/api/mfa \
  -H "Authorization: Bearer YOUR_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"My Google Account", "initialAuth":"JBSW Y3DP EHPK 3PXP"}'
```

### Getting an MFA Code

    curl -X GET http://localhost:3000/api/mfa/mfaSecretId/code \
      -H "Authorization: Bearer YOUR_API_TOKEN"

### Creating a Regular API Token (requires master token)

```bash
# Create a token that expires in 30 days
curl -X POST http://localhost:3000/api/auth/tokens \
  -H "Authorization: Bearer YOUR_MASTER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"App Token", "userId":"user123", "expiresInDays":30}'

# Create a token that never expires
curl -X POST http://localhost:3000/api/auth/tokens \
  -H "Authorization: Bearer YOUR_MASTER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Permanent Token", "userId":"user123"}'
```

#### Handling Shell Quoting Issues

If you encounter quote-related errors in your shell, try one of these approaches:

**Option 1:** Escape the inner quotes

    curl -X POST http://localhost:3000/api/auth/tokens \
      -H "Authorization: Bearer YOUR_MASTER_TOKEN" \
      -H "Content-Type: application/json" \
      -d "{\"name\":\"App Token\",\"userId\":\"user123\",\"expiresInDays\":30}"

**Option 2:** Use a JSON file

Create a file named `payload.json`:

    {
      "name": "App Token",
      "userId": "user123",
      "expiresInDays": 30
    }

Then use:

    curl -X POST http://localhost:3000/api/auth/tokens \
      -H "Authorization: Bearer YOUR_MASTER_TOKEN" \
      -H "Content-Type: application/json" \
      -d @payload.json

Deployment
----------

For production deployment:

1.  Set up a production MongoDB instance
2.  Configure proper environment variables
3.  Build the TypeScript code: `npm run build`
4.  Run with a process manager like PM2: `pm2 start dist/app.js`
5.  Set up proper HTTPS with a reverse proxy like Nginx or use a service like Heroku

## Postman Collection

A complete Postman collection is included for easier API testing and integration.

### Importing the Collection

1. Download [Postman](https://www.postman.com/downloads/) if you don't already have it
2. Open Postman and click **Import** in the top-left corner
3. Choose **File** > **Upload Files** and select `postman.json` from the project root
4. Click **Import** to finish

### Setting Up Environment Variables

1. Click on **Environments** in the left sidebar
2. Click **Add** to create a new environment (e.g., "ReAuth-Stamp Local")
3. Add the following variables:

| Variable      | Initial Value               | Description                               |
|---------------|----------------------------|-------------------------------------------|
| baseUrl       | http://localhost:3000      | The base URL of your API                  |
| masterToken   | (Your master token)        | Master token from init-master-token script |
| apiToken      | (Leave empty)              | Will be auto-filled when created          |
| userId        | user123                    | User ID for operations                    |
| tokenId       | (Leave empty)              | Will be auto-filled when needed           |
| mfaSecretId   | (Leave empty)              | Will be auto-filled when needed           |

4. Click **Save**
5. Select your environment from the environment dropdown in the top-right corner

### Using the Collection

The collection is organized into logical sections:

1. **Authentication**: API token management operations
   - Create API Token (requires master token)
   - List User Tokens
   - Revoke Token
   - Validate Token

2. **MFA Management**: MFA secret operations
   - Create MFA Secret
   - Get MFA Code
   - List MFA Secrets
   - Delete MFA Secret

3. **Health Check**: Simple API health check

The collection includes automatic tests that will:
- Validate successful responses
- Automatically capture IDs and tokens from responses
- Set environment variables for subsequent requests

### Workflow Example

1. Run the "Health Check" request to verify the API is running
2. Create a new API token using the "Create API Token" request (requires master token)
3. The token will automatically be saved to the `apiToken` environment variable
4. Use that token to create an MFA secret with "Create MFA Secret"
5. Get the current code with "Get MFA Code" whenever needed

* * *