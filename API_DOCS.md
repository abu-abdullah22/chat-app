# Chat API Documentation

Base URL: `https://frontend-task-chatapp.onrender.com/api`

## System

### GET `/health`
Health check endpoint to verify the API is running. 

> [!WARNING]
> **API Bug / Inconsistency Noted**: The Swagger documentation lists the global base URL as `/api` for all endpoints. However, hitting `/api/health` returns a `404 Not Found`. You must hit the root URL `https://frontend-task-chatapp.onrender.com/health` directly to get a successful response.

**Success Response** (200 OK)
```json
{
  "status": "ok",
  "timestamp": "2026-08-21T11:34:58.337Z",
  "version": "1.0.0"
}
```

## Authentication

All protected endpoints require a Bearer token in the Authorization header: `Authorization: Bearer <token>`

---

### POST `/auth/login`
Logs in an existing user or registers a new user if the phone number does not exist.

**Request Body** (application/json)
```json
{
  "phone": "+15551234567",
  "name": "Ada Lovelace"
}
```

**Success Response** (200 OK)
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5c...",
  "user": {
    "_id": "6a882468e5d6aac97521e25e",
    "name": "Ada Lovelace",
    "phone": "+15551234567",
    "createdAt": "2026-08-21T10:11:52.529Z"
  }
}
```

---

### GET `/auth/me`
Fetches the current authenticated user's profile.

**Success Response** (200 OK)
```json
{
  "_id": "6a882468e5d6aac97521e25e",
  "name": "Ada Lovelace",
  "phone": "+15551234567",
  "createdAt": "2026-08-21T10:11:52.529Z"
}
```

---

## Users

### GET `/users/search`
Searches for users by name or phone number.

**Query Parameters**
- `q` (string, required): Search term

**Success Response** (200 OK)
```json
[
  {
    "_id": "6a8827c4e5d6aac97521e3ec",
    "name": "Ada Probe",
    "phone": "+15550001001"
  }
]
```

---

## Conversations

### GET `/conversations`
Lists all conversations (both direct and group) for the current user.

**Success Response** (200 OK)
```json
{
  "data": [
    {
      "_id": "6a88385de5d6aac97521fc71",
      "type": "group",
      "lastMessage": {},
      "updatedAt": "2026-08-21T11:37:01.991Z",
      "name": "API Test Group",
      "createdBy": "6a883858e5d6aac97521fc57",
      "admins": [
        "6a883858e5d6aac97521fc57"
      ],
      "participants": [
        {
          "_id": "6a883858e5d6aac97521fc57",
          "name": "Alice",
          "phone": "+15550004187"
        },
        {
          "_id": "6a883859e5d6aac97521fc5b",
          "name": "Bob",
          "phone": "+15550002916"
        }
      ]
    },
    {
      "_id": "6a88385de5d6aac97521fc6c",
      "type": "direct",
      "lastMessage": {},
      "updatedAt": "2026-08-21T11:37:01.028Z",
      "participant": {
        "_id": "6a883859e5d6aac97521fc5b",
        "name": "Bob",
        "phone": "+15550002916"
      }
    }
  ]
}
```

---

### POST `/conversations`
Starts a new direct conversation.

**Request Body** (application/json)
```json
{
  "userId": "665f0c2a9b1e4a0012ab34cd"
}
```
**Success Response** (200 OK)
```json
{
  "_id": "6a88385de5d6aac97521fc6c",
  "participants": [
    "6a883858e5d6aac97521fc57",
    "6a883859e5d6aac97521fc5b"
  ],
  "createdAt": "2026-08-21T11:37:01.028Z"
}
```

---

### POST `/conversations/group`
Creates a new group conversation (requires at least 3 members total including the creator).

**Request Body** (application/json)
```json
{
  "name": "Project Team",
  "participantIds": [
    "6a883859e5d6aac97521fc5b",
    "6a88385ae5d6aac97521fc5e"
  ]
}
```

**Success Response** (201 Created)
```json
{
  "_id": "6a88385de5d6aac97521fc71",
  "type": "group",
  "name": "API Test Group",
  "createdBy": "6a883858e5d6aac97521fc57",
  "admins": [
    "6a883858e5d6aac97521fc57"
  ],
  "participants": [
    {
      "_id": "6a883858e5d6aac97521fc57",
      "name": "Alice",
      "phone": "+15550004187"
    },
    {
      "_id": "6a883859e5d6aac97521fc5b",
      "name": "Bob",
      "phone": "+15550002916"
    },
    {
      "_id": "6a88385ae5d6aac97521fc5e",
      "name": "Charlie",
      "phone": "+15550001481"
    }
  ],
  "createdAt": "2026-08-21T11:37:01.991Z",
  "updatedAt": "2026-08-21T11:37:01.991Z"
}
```

---

### GET `/conversations/{id}/messages`
Retrieves the message history for a specific conversation.

**Query Parameters**
- `limit` (integer, optional)
- `before` (string, optional)

**Success Response** (200 OK)
```json
{
  "messages": [
    {
      "_id": "6a883860e5d6aac97521fc7c",
      "conversation": "6a88385de5d6aac97521fc6c",
      "sender": "6a883858e5d6aac97521fc57",
      "text": "Hello from Alice to Bob!",
      "createdAt": "2026-08-21T11:37:04.140Z"
    }
  ],
  "hasMore": false
}
```

---

## Group Management Endpoints

All endpoints below return the updated group conversation object (similar to `POST /conversations/group` success response) upon success with a `200 OK` status code.

### POST `/conversations/{id}/participants`
Adds members to a group (admins only).

**Request Body**
```json
{
  "userIds": ["6a88385ae5d6aac97521fc5e"]
}
```

### DELETE `/conversations/{id}/participants/{userId}`
Removes a member from a group (admins only) or leaves the group. No request body needed.

### POST `/conversations/{id}/admins`
Promotes a member to an admin (admins only).

**Request Body**
```json
{
  "userId": "6a883859e5d6aac97521fc5b"
}
```

### PATCH `/conversations/{id}`
Renames a group (admins only).

**Request Body**
```json
{
  "name": "New Team Name"
}
```

---

## Messages

### POST `/messages`
Sends a message to a conversation.

**Request Body**
```json
{
  "conversationId": "6a88385de5d6aac97521fc6c",
  "text": "Hello from Alice to Bob!"
}
```

**Success Response** (200 OK)
```json
{
  "_id": "6a883860e5d6aac97521fc7c",
  "conversation": "6a88385de5d6aac97521fc6c",
  "sender": "6a883858e5d6aac97521fc57",
  "text": "Hello from Alice to Bob!",
  "createdAt": "2026-08-21T11:37:04.140Z"
}
```
