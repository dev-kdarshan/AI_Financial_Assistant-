# AIFA API Documentation

Complete REST API reference for the AIFA backend service.

## Base URL
http://localhost:5000/api

## Authentication

All endpoints except `/auth/register`, `/auth/verify-otp`, and `/auth/login` require JWT token in Authorization header:
Authorization: Bearer <jwt_token>

Token is obtained from the login endpoint and is valid for 7 days.

## Standard Response Format

Success:
```json
{
  "success": true,
  "data": {},
  "message": "string",
  "count": 0
}
```

Error:
```json
{
  "success": false,
  "message": "string"
}
```

## Status Codes

- `200` Success
- `201` Created
- `400` Bad Request
- `401` Unauthorized
- `404` Not Found
- `500` Internal Server Error

---

# Authentication Endpoints

## Register User

**POST** `/auth/register`

Create a new user account. Returns an OTP for email verification.

Request:
```json
{
  "name": "Alex Lever",
  "email": "alex@gmail.com",
  "password": "alex1234",
  "phone": "9999999999"
}
```

Response (200):
```json
{
  "message": "User registered. Verify OTP.",
  "otp": "210752"
}
```

Note: In production OTP is sent via email. In development it is returned directly in the response.

---

## Verify OTP

**POST** `/auth/verify-otp`

Verify the OTP sent after registration. Must be called before login.

Request:
```json
{
  "email": "alex@gmail.com",
  "otp": "210752"
}
```

Response (200):
```json
{
  "message": "Account verified successfully"
}
```

---

## Login

**POST** `/auth/login`

Authenticate user and receive JWT token.

Request:
```json
{
  "email": "alex@gmail.com",
  "password": "alex1234"
}
```

Response (200):
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

Note: Token is returned at root level, not inside a data object. Store this token in localStorage and attach it to every subsequent request.

---

# User Endpoints

## Get User Profile

**GET** `/user/profile`

Headers: `Authorization: Bearer <token>`

Response (200):
```json
{
  "success": true,
  "data": {
    "id": "cccf689f-d87d-4b2f-9cbf-39b21f0387ea",
    "name": "Alex Lever",
    "email": "alex@gmail.com",
    "phone": "9999999999",
    "salary": 50000,
    "googleId": null,
    "isVerified": true,
    "createdAt": "2025-01-01T10:00:00Z",
    "updatedAt": "2025-01-01T10:00:00Z"
  }
}
```

---

## Update User Profile

**PUT** `/user/profile`

Headers: `Authorization: Bearer <token>`

Request:
```json
{
  "name": "Alex Lever",
  "phone": "9999999999",
  "salary": 50000
}
```

Response (200):
```json
{
  "success": true,
  "data": {
    "id": "cccf689f-d87d-4b2f-9cbf-39b21f0387ea",
    "name": "Alex Lever",
    "phone": "9999999999",
    "salary": 50000,
    "updatedAt": "2025-01-01T11:00:00Z"
  }
}
```

---

# Expense Endpoints

## Get All Expenses

**GET** `/expense`

Returns all non-deleted expenses for the logged in user, sorted by date descending.

Headers: `Authorization: Bearer <token>`

Response (200):
```json
{
  "success": true,
  "count": 48,
  "data": [
    {
      "id": "uuid",
      "userId": "uuid",
      "amount": 450.00,
      "category": "food",
      "date": "2025-01-29T00:00:00Z",
      "merchantName": "Zomato",
      "description": "Dinner order",
      "source": "manual",
      "slipUrl": null,
      "transactionId": null,
      "isAiSuggested": false,
      "deletedAt": null,
      "createdAt": "2025-01-29T00:00:00Z",
      "updatedAt": "2025-01-29T00:00:00Z"
    }
  ]
}
```

---

## Get Expense By ID

**GET** `/expense/:id`

Headers: `Authorization: Bearer <token>`

Response (200):
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "userId": "uuid",
    "amount": 450.00,
    "category": "food",
    "date": "2025-01-29T00:00:00Z",
    "merchantName": "Zomato",
    "description": "Dinner order",
    "source": "manual",
    "slipUrl": null,
    "transactionId": null,
    "isAiSuggested": false,
    "deletedAt": null,
    "createdAt": "2025-01-29T00:00:00Z",
    "updatedAt": "2025-01-29T00:00:00Z"
  }
}
```

Response (404):
```json
{
  "success": false,
  "message": "Expense not found"
}
```

---

## Add Manual Expense

**POST** `/expense`

Headers: `Authorization: Bearer <token>`

Request:
```json
{
  "amount": 450,
  "category": "food",
  "date": "2025-01-29",
  "merchantName": "Zomato",
  "description": "Dinner order"
}
```

Response (201):
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "userId": "uuid",
    "amount": 450,
    "category": "food",
    "date": "2025-01-29T00:00:00Z",
    "merchantName": "Zomato",
    "description": "Dinner order",
    "source": "manual",
    "slipUrl": null,
    "transactionId": null,
    "isAiSuggested": false,
    "deletedAt": null,
    "createdAt": "2025-01-29T00:00:00Z",
    "updatedAt": "2025-01-29T00:00:00Z"
  }
}
```

---

## Add Expense via OCR (Slip Scan)

**POST** `/expense/ocr`

Upload a receipt image. OCR service extracts merchant, amount, date and category automatically.

Headers:
- `Authorization: Bearer <token>`
- `Content-Type: multipart/form-data`

Form Data:
- `slip`: image file (JPG, PNG, JPEG)

Response (201):
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "userId": "uuid",
    "amount": 250.50,
    "category": "food",
    "date": "2025-01-29T00:00:00Z",
    "merchantName": "Store Name",
    "description": "raw extracted text from receipt",
    "source": "ocr",
    "slipUrl": "receipt.jpg",
    "transactionId": null,
    "isAiSuggested": false,
    "deletedAt": null,
    "createdAt": "2025-01-29T00:00:00Z",
    "updatedAt": "2025-01-29T00:00:00Z"
  },
  "ocr_raw": {
    "merchant": "Store Name",
    "amount": 250.50,
    "date": "2025-01-29",
    "category": "food",
    "raw_text": "full extracted text from receipt image"
  }
}
```

---

## Soft Delete Expense

**DELETE** `/expense/:id`

Marks expense as deleted. Does not remove from database. Deleted expenses are excluded from all queries, analytics and AI context.

Headers: `Authorization: Bearer <token>`

Response (200):
```json
{
  "success": true,
  "message": "Expense removed successfully"
}
```

Response (404):
```json
{
  "success": false,
  "message": "Expense not found"
}
```

---

# Transaction Endpoints

## Get All Transactions

**GET** `/transaction`

Returns all non-deleted transactions for the logged in user, sorted by date descending.

Headers: `Authorization: Bearer <token>`

Response (200):
```json
{
  "success": true,
  "count": 21,
  "data": [
    {
      "id": "uuid",
      "userId": "uuid",
      "amount": 50000.00,
      "type": "credit",
      "recipient": "Salary Credit",
      "description": "Monthly salary",
      "date": "2025-01-31T00:00:00Z",
      "source": "gpay",
      "deletedAt": null,
      "createdAt": "2025-01-31T00:00:00Z",
      "updatedAt": "2025-01-31T00:00:00Z"
    }
  ]
}
```

---

## Get Transactions by Date Range

**GET** `/transaction/range?startDate=2025-01-01&endDate=2025-01-31`

Headers: `Authorization: Bearer <token>`

Query Parameters:
- `startDate`: ISO date string (required)
- `endDate`: ISO date string (required)

Response (200):
```json
{
  "success": true,
  "count": 10,
  "data": [...]
}
```

---

## Add Manual Transaction

**POST** `/transaction`

Headers: `Authorization: Bearer <token>`

Request:
```json
{
  "amount": 500,
  "type": "debit",
  "recipient": "Amazon",
  "description": "Online purchase",
  "date": "2025-01-29"
}
```

Response (201):
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "userId": "uuid",
    "amount": 500,
    "type": "debit",
    "recipient": "Amazon",
    "description": "Online purchase",
    "date": "2025-01-29T00:00:00Z",
    "source": "manual",
    "deletedAt": null,
    "createdAt": "2025-01-29T00:00:00Z",
    "updatedAt": "2025-01-29T00:00:00Z"
  }
}
```

---

## Soft Delete Transaction

**DELETE** `/transaction/:id`

Headers: `Authorization: Bearer <token>`

Response (200):
```json
{
  "success": true,
  "message": "Transaction removed successfully"
}
```

---

# GPay Endpoints

## Import GPay Activity File

**POST** `/gpay/import`

Upload Google Pay activity.html file. Parses all transactions and saves each one to both the transactions table and expenses table automatically.

Headers:
- `Authorization: Bearer <token>`
- `Content-Type: multipart/form-data`

Form Data:
- `file`: activity.html file exported from Google Pay

How to export from Google Pay:
1. Open Google Pay app
2. Go to Profile → Privacy and Security → Download your data
3. Download and extract the ZIP
4. Find activity.html inside the extracted folder
5. Upload that file here

Response (201):
```json
{
  "success": true,
  "message": "Imported 21 transactions successfully",
  "data": {
    "transactions": [
      {
        "id": "uuid",
        "userId": "uuid",
        "amount": 500,
        "type": "debit",
        "recipient": "Amazon",
        "description": null,
        "date": "2025-01-07T00:00:00Z",
        "source": "gpay",
        "deletedAt": null,
        "createdAt": "2025-01-07T00:00:00Z",
        "updatedAt": "2025-01-07T00:00:00Z"
      }
    ],
    "expenses": [
      {
        "id": "uuid",
        "userId": "uuid",
        "amount": 500,
        "category": "other",
        "date": "2025-01-07T00:00:00Z",
        "merchantName": "Amazon",
        "description": null,
        "source": "gpay",
        "transactionId": "uuid",
        "isAiSuggested": false,
        "deletedAt": null,
        "createdAt": "2025-01-07T00:00:00Z",
        "updatedAt": "2025-01-07T00:00:00Z"
      }
    ]
  }
}
```

Note: GPay imported expenses get category set to "other" by default. User can update the category manually after review.

---

# Analytics Endpoints

## Get Analytics

**GET** `/analytics`

Fetches all non-deleted expenses from DB and forwards to the Python analytics service. Returns category breakdown, total, next month prediction and AI insights.

Headers: `Authorization: Bearer <token>`

Response (200) — when expenses exist:
```json
{
  "success": true,
  "data": {
    "total": 7950,
    "breakdown": {
      "food": 1250,
      "transport": 1200,
      "shopping": 3500,
      "bills": 2000
    },
    "prediction": 8500,
    "insights": [
      "Your shopping expenses increased by 40% compared to last month.",
      "Food spending is within healthy limits at 15% of total.",
      "Consider reviewing your bills category for potential savings."
    ]
  }
}
```

Response (200) — when no expenses:
```json
{
  "success": true,
  "message": "No expenses found to analyze",
  "data": null
}
```

---

# AI Chat Endpoints

## Ask AI

**POST** `/chat/ask`

Send a question to the AI assistant. Fetches user expenses from DB automatically and forwards to the AI Python service with RAG context. Saves conversation and messages to DB.

Headers: `Authorization: Bearer <token>`

Request — new conversation:
```json
{
  "question": "What am I spending the most on this month?"
}
```

Request — continue existing conversation:
```json
{
  "question": "How can I reduce that?",
  "conversationId": "uuid-of-existing-conversation"
}
```

Response (200):
```json
{
  "success": true,
  "data": {
    "conversationId": "uuid",
    "question": "What am I spending the most on this month?",
    "answer": "Based on your expenses, you are spending the most on Shopping at approximately ₹24,400. Your top merchants include Apple Store, Flipkart, and Amazon."
  }
}
```

---

## Get All Conversations

**GET** `/chat/conversations`

Returns all non-deleted conversations for the logged in user, sorted by last updated descending.

Headers: `Authorization: Bearer <token>`

Response (200):
```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "id": "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
      "title": "What am I spending the most on?",
      "messageCount": 4,
      "createdAt": "2025-01-20T00:00:00Z",
      "updatedAt": "2025-01-20T00:00:00Z"
    }
  ]
}
```

---

## Get Conversation Messages

**GET** `/chat/conversations/:conversationId/messages`

Returns all messages in a conversation sorted by createdAt ascending.

Headers: `Authorization: Bearer <token>`

Response (200):
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "conversationId": "uuid",
      "userId": "uuid",
      "role": "user",
      "content": "What am I spending the most on?",
      "contextUsed": null,
      "tokensUsed": null,
      "createdAt": "2025-01-20T10:00:00Z",
      "updatedAt": "2025-01-20T10:00:00Z"
    },
    {
      "id": "uuid",
      "conversationId": "uuid",
      "userId": "uuid",
      "role": "assistant",
      "content": "Based on your expense history, you are spending the most on Shopping...",
      "contextUsed": null,
      "tokensUsed": 150,
      "createdAt": "2025-01-20T10:00:05Z",
      "updatedAt": "2025-01-20T10:00:05Z"
    }
  ]
}
```

---

# Report Endpoints

## Generate Report

**POST** `/reports/generate`

Fetches user expenses and salary from DB, builds monthly trend data, and forwards to the Python report service which generates a branded PDF with charts and AI insights.

Headers: `Authorization: Bearer <token>`

No request body required. All data is fetched from DB automatically using the logged in user.

Response (200):
```json
{
  "success": true,
  "data": {
    "report_path": "/path/to/generated/report.pdf"
  }
}
```

Response (400) — when no expenses:
```json
{
  "success": false,
  "message": "No expenses found to generate report"
}
```

---

# Notification Endpoints

## Send Notification

**POST** `/notifications/send`

Sends an email or SMS notification. Recipient is fetched automatically from the user's profile (email for email channel, phone for sms channel). Do not pass recipient in the request body.

Headers: `Authorization: Bearer <token>`

Request for email:
```json
{
  "type": "email",
  "channel": "email",
  "subject": "Monthly Spending Summary",
  "message": "Your total spending this month was ₹15,000."
}
```

Request for SMS:
```json
{
  "type": "sms",
  "channel": "sms",
  "subject": null,
  "message": "AIFA: Your spending this month was ₹15,000."
}
```

Response (200):
```json
{
  "success": true,
  "message": "Notification sent successfully",
  "data": {
    "logId": "uuid",
    "taskId": "celery-task-id",
    "status": "sent"
  }
}
```

Response (502) — when notification service is down:
```json
{
  "success": false,
  "message": "Notification service failed",
  "error": "error message from service"
}
```

---

## Get Notification Logs

**GET** `/notifications/logs`

Returns all notification logs for the logged in user, sorted by createdAt descending.

Headers: `Authorization: Bearer <token>`

Response (200):
```json
{
  "success": true,
  "count": 6,
  "data": [
    {
      "id": "uuid",
      "userId": "uuid",
      "type": "email",
      "channel": "email",
      "recipient": "alex@gmail.com",
      "subject": "Monthly Spending Summary - November 2024",
      "status": "sent",
      "taskId": "celery-task-001",
      "createdAt": "2024-11-30T00:00:00Z",
      "updatedAt": "2024-11-30T00:00:00Z"
    },
    {
      "id": "uuid",
      "userId": "uuid",
      "type": "sms",
      "channel": "sms",
      "recipient": "9999999999",
      "subject": null,
      "status": "sent",
      "taskId": "celery-task-002",
      "createdAt": "2024-12-01T00:00:00Z",
      "updatedAt": "2024-12-01T00:00:00Z"
    }
  ]
}
```

---

# Data Models Reference

## Expense object
id            UUID
userId        UUID (FK to users)
amount        FLOAT
category      STRING (food|transport|shopping|bills|entertainment|health|other)
date          DATE
merchantName  STRING nullable
description   STRING nullable
source        ENUM (ocr|gpay|manual)
slipUrl       STRING nullable
transactionId UUID nullable (FK to transactions)
isAiSuggested BOOLEAN default false
deletedAt     TIMESTAMP nullable (soft delete)
createdAt     TIMESTAMP
updatedAt     TIMESTAMP

## Transaction object
id          UUID
userId      UUID (FK to users)
amount      FLOAT
type        ENUM (debit|credit)
recipient   STRING nullable
description STRING nullable
date        DATE
source      ENUM (gpay|manual)
deletedAt   TIMESTAMP nullable (soft delete)
createdAt   TIMESTAMP
updatedAt   TIMESTAMP

## AIConversation object
id           UUID
userId       UUID (FK to users)
title        STRING nullable
context      TEXT nullable
messageCount INTEGER default 0
deletedAt    TIMESTAMP nullable
createdAt    TIMESTAMP
updatedAt    TIMESTAMP

## AIMessage object
id             UUID
conversationId UUID (FK to ai_conversations)
userId         UUID (FK to users)
role           ENUM (user|assistant)
content        TEXT
contextUsed    TEXT nullable
tokensUsed     INTEGER nullable
createdAt      TIMESTAMP
updatedAt      TIMESTAMP

## NotificationLog object
id        UUID
userId    UUID (FK to users)
type      ENUM (email|sms|reminder|monthly-report)
channel   ENUM (email|sms)
recipient STRING
subject   STRING nullable
status    ENUM (sent|failed|pending)
taskId    STRING nullable
createdAt TIMESTAMP
updatedAt TIMESTAMP

## User object
id         UUID
name       STRING
email      STRING unique
password   STRING nullable
phone      STRING nullable
salary     FLOAT nullable
googleId   STRING nullable
isVerified BOOLEAN default false
createdAt  TIMESTAMP
updatedAt  TIMESTAMP

---

# Important Notes for Frontend Integration

1. Token is at root level in login response — `response.token` not `response.data.token`
2. All list responses have `data` as an array directly — `response.data` is the array
3. Expense field is `merchantName` not `merchant`
4. User name is a single `name` field not `firstName` + `lastName`
5. Soft delete means records stay in DB — just `deletedAt` gets set
6. GPay import saves to both transactions AND expenses automatically
7. Analytics, AI, and Report endpoints fetch data from DB themselves — frontend only needs to call the endpoint with a token, no need to pass expenses in body
8. Notification recipient is fetched from user profile automatically — do not pass it from frontend
9. All amounts are in Indian Rupees (INR)
10. All dates are returned as ISO 8601 strings