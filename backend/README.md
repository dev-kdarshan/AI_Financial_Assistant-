# AIFA Backend

Express.js backend service providing REST API for the AI-powered financial assistance application. Integrates with PostgreSQL database and six Python microservices for specialized operations.

## Technology Stack

- **Node.js** — JavaScript runtime
- **Express.js** — Web application framework
- **PostgreSQL** — Primary relational database
- **Sequelize** — ORM for database operations and migrations
- **JWT** — Token-based authentication
- **bcryptjs** — Password hashing
- **Nodemailer** — OTP email delivery
- **Multer** — File upload handling (memory storage)
- **axios** — HTTP client for microservice communication
- **form-data** — Multipart file forwarding to Python services

---

## Project Structure
```
backend/
├── scripts/
│   └── migrate.sql               — One-time SQL migration for schema changes
├── src/
│   ├── config/
│   │   ├── db.js                 — PostgreSQL connection via Sequelize
│   │   └── env.js                — Environment variable exports
│   ├── controllers/
│   │   ├── analytics.controller.js     — Fetch expenses, forward to analytics service
│   │   ├── auth.controller.js          — Register, OTP verify, login
│   │   ├── chat.controller.js          — AI conversation management + DB save
│   │   ├── expense.controller.js       — Expense CRUD + OCR + soft delete
│   │   ├── gpay.controller.js          — GPay file import + dual save
│   │   ├── notification.controller.js  — Notification dispatch + logging
│   │   ├── report.controller.js        — Report generation coordination
│   │   ├── transaction.controller.js   — Transaction CRUD + soft delete
│   │   └── user.controller.js          — Profile get and update
│   ├── middlewares/
│   │   ├── auth.middleware.js    — JWT verification, attaches req.user
│   │   ├── errorHandler.js       — Global error handling
│   │   └── upload.middleware.js  — Multer memory storage config
│   ├── models/
│   │   ├── index.js                    — All imports + associations + sync
│   │   ├── AIConversation.model.js     — AI chat sessions
│   │   ├── AIMessage.model.js          — Individual chat messages
│   │   ├── Expense.model.js            — Expense records (ocr, gpay, manual)
│   │   ├── NotificationLog.model.js    — Notification delivery history
│   │   ├── Transaction.model.js        — Raw GPay transaction records
│   │   └── User.model.js               — User accounts and profiles
│   ├── routes/
│   │   ├── analytics.routes.js
│   │   ├── auth.routes.js
│   │   ├── chat.routes.js
│   │   ├── expense.routes.js
│   │   ├── gpay.routes.js
│   │   ├── notification.routes.js
│   │   ├── report.routes.js
│   │   ├── transaction.routes.js
│   │   └── user.routes.js
│   ├── services/
│   │   ├── chat.service.js         — Calls AI service (port 8003)
│   │   ├── gpay.service.js         — Calls GPay parser service (port 8002)
│   │   ├── notification.service.js — Calls notification service (port 8005)
│   │   ├── ocr.service.js          — Calls OCR service (port 8001)
│   │   ├── prediction.service.js   — Calls analytics service (port 8004)
│   │   └── report.service.js       — Calls report service (port 8006)
│   └── utils/
│       ├── bcrypt.util.js    — Password hashing utilities
│       ├── jwt.util.js       — Token generation and verification
│       └── otp.util.js       — OTP generation and validation
├── uploads/
│   └── slips/                — Uploaded receipt images stored here
├── .gitignore
├── README.md
├── app.js                    — Express app setup, middleware, routes
├── package.json
└── server.js                 — DB connect, model sync, server start
```
---

## Prerequisites

- Node.js 18.0.0 or higher
- npm 9.0.0 or higher
- PostgreSQL 13 or higher
- Python 3.8+ with all 6 microservices running

---

## Installation

```bash
npm install
```

---

## Environment Configuration

Your `.env` file must have all of these keys:
```bash
PORT=5000
Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=aifa_db
DB_USER=postgres
DB_PASSWORD=your_password
JWT
JWT_SECRET=your_jwt_secret_key_min_32_chars
JWT_EXPIRE=7d
Email (for OTP delivery)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password
Python Microservices
OCR_SERVICE_URL=http://localhost:8001
GPAY_SERVICE_URL=http://localhost:8002
AI_SERVICE_URL=http://localhost:8003
ANALYTICS_SERVICE_URL=http://localhost:8004
NOTIFICATION_SERVICE_URL=http://localhost:8005
REPORT_SERVICE_URL=http://localhost:8006
```
---

## Database Setup

### Step 1 — Create the database

```bash
psql -U postgres -c "CREATE DATABASE aifa_db;"
```

### Step 2 — Run the one-time migration script

This handles all column renames, new columns, enum type fixes, and creates the three new tables. Run this once before starting Node for the first time:

```bash
psql -U postgres -d aifa_db -f scripts/migrate.sql
```

### Step 3 — Start the server

Sequelize will auto-sync any remaining model changes on startup:

```bash
npm run dev
```

---

## Running the Application

### Development

```bash
npm run dev
```

Uses nodemon for auto-restart. Runs on port 5000. CORS enabled for all origins in development.

### Production

```bash
npm start
```

---

## Database Schema

### users
```bash
id          UUID PK
name        STRING NOT NULL
email       STRING UNIQUE NOT NULL
password    STRING nullable (null for Google OAuth users)
phone       STRING nullable
salary      FLOAT nullable
googleId    STRING nullable
isVerified  BOOLEAN default false
createdAt   TIMESTAMP
updatedAt   TIMESTAMP
```

### expenses
```bash
id             UUID PK
userId         UUID FK → users (CASCADE)
amount         FLOAT NOT NULL
category       STRING NOT NULL
date           DATE NOT NULL
merchantName   STRING nullable
description    STRING nullable
source         ENUM (ocr | gpay | manual) NOT NULL
slipUrl        STRING nullable
transactionId  UUID FK → transactions nullable (SET NULL)
isAiSuggested  BOOLEAN default false
deletedAt      TIMESTAMP nullable  ← soft delete
createdAt      TIMESTAMP
updatedAt      TIMESTAMP
```

### transactions
```bash
id          UUID PK
userId      UUID FK → users (CASCADE)
amount      FLOAT NOT NULL
type        ENUM (debit | credit) nullable
recipient   STRING nullable
description STRING nullable
date        DATE NOT NULL
source      ENUM (gpay | manual) NOT NULL
deletedAt   TIMESTAMP nullable  ← soft delete
createdAt   TIMESTAMP
updatedAt   TIMESTAMP
```

### ai_conversations
```bash
id           UUID PK
userId       UUID FK → users (CASCADE)
title        STRING nullable
context      TEXT nullable  ← JSON snapshot of expenses at time of chat
messageCount INTEGER default 0
deletedAt    TIMESTAMP nullable  ← soft delete
createdAt    TIMESTAMP
updatedAt    TIMESTAMP
```

### ai_messages
```bash
id             UUID PK
conversationId UUID FK → ai_conversations (CASCADE)
userId         UUID FK → users (CASCADE)
role           ENUM (user | assistant) NOT NULL
content        TEXT NOT NULL
contextUsed    TEXT nullable  ← RAG chunks used for this response
tokensUsed     INTEGER nullable
createdAt      TIMESTAMP
updatedAt      TIMESTAMP
```

### notification_logs
```bash
id        UUID PK
userId    UUID FK → users (CASCADE)
type      ENUM (email | sms | reminder | monthly-report) NOT NULL
channel   ENUM (email | sms) NOT NULL
recipient STRING NOT NULL  ← email or phone, fetched from user profile
subject   STRING nullable
status    ENUM (sent | failed | pending) default pending
taskId    STRING nullable  ← Celery task ID from notification service
createdAt TIMESTAMP
updatedAt TIMESTAMP
```

---

## API Routes Summary

All routes are prefixed with `/api`.

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | /auth/register | No | Register new user, returns OTP |
| POST | /auth/verify-otp | No | Verify OTP to activate account |
| POST | /auth/login | No | Login, returns JWT token |
| GET | /user/profile | Yes | Get logged in user profile |
| PUT | /user/profile | Yes | Update name, phone, salary |
| GET | /expense | Yes | Get all expenses (soft delete filtered) |
| GET | /expense/:id | Yes | Get single expense |
| POST | /expense | Yes | Add manual expense |
| POST | /expense/ocr | Yes | Upload receipt image, OCR extracts data |
| DELETE | /expense/:id | Yes | Soft delete expense |
| GET | /transaction | Yes | Get all transactions |
| GET | /transaction/range | Yes | Get transactions by date range |
| POST | /transaction | Yes | Add manual transaction |
| DELETE | /transaction/:id | Yes | Soft delete transaction |
| POST | /gpay/import | Yes | Upload activity.html, dual-save to transactions + expenses |
| GET | /analytics | Yes | Fetch expenses from DB, forward to analytics service |
| POST | /chat/ask | Yes | Ask AI, saves conversation + messages to DB |
| GET | /chat/conversations | Yes | Get all conversations |
| GET | /chat/conversations/:id/messages | Yes | Get all messages in a conversation |
| POST | /reports/generate | Yes | Fetch data from DB, generate PDF via report service |
| POST | /notifications/send | Yes | Send email or SMS, log result |
| GET | /notifications/logs | Yes | Get notification history |

See `docs/API.md` for full request and response shapes.

---

## Microservices

All 6 Python FastAPI services must be running before using related features.

| Service | Port | Called by | Python endpoint |
|---------|------|-----------|-----------------|
| OCR | 8001 | ocr.service.js | POST /ocr/extract |
| GPay Parser | 8002 | gpay.service.js | POST /gpay/parse |
| AI / RAG | 8003 | chat.service.js | POST /ai/ask |
| Analytics | 8004 | prediction.service.js | POST /analytics/analyze |
| Notification | 8005 | notification.service.js | POST /notify/email, POST /notify/sms |
| Report | 8006 | report.service.js | POST /generate-report |

Start each service in its own terminal:

```bash
# OCR service
cd ocr-service && uvicorn app.main:app --port 8001 --reload

# GPay service
cd gpay-service && uvicorn app.main:app --port 8002 --reload

# AI service
cd ai-service && uvicorn app.main:app --port 8003 --reload

# Analytics service
cd analytics-service && uvicorn app.main:app --port 8004 --reload

# Notification service
cd notification-service && uvicorn app.main:app --port 8005 --reload

# Report service
cd report-service && uvicorn app.main:app --port 8006 --reload
```

Verify each service is running:

```bash
curl http://localhost:8001/
curl http://localhost:8002/
curl http://localhost:8003/
curl http://localhost:8004/
curl http://localhost:8005/
curl http://localhost:8006/
```

Each should return a JSON message confirming the service is running.

---

## Authentication Flow

1. User calls `POST /api/auth/register` with name, email, password, phone
2. Backend creates user with `isVerified: false`, generates OTP, sends via email
3. In development OTP is returned directly in the response body
4. User calls `POST /api/auth/verify-otp` with email and OTP
5. Backend sets `isVerified: true`
6. User calls `POST /api/auth/login` with email and password
7. Backend returns JWT token at root level: `{ message, token }`
8. Frontend stores token in `localStorage`
9. All subsequent requests include `Authorization: Bearer <token>`
10. `auth.middleware.js` verifies token and attaches `req.user` to every protected request

---

## Soft Delete

Expenses, Transactions, and AIConversations support soft delete via a `deletedAt` timestamp column.

- Deleting sets `deletedAt = NOW()` instead of removing the row
- All queries automatically filter `WHERE deletedAt IS NULL`
- Deleted records are excluded from analytics, AI context, and reports
- Data is never permanently lost from the database

---

## Key Design Decisions

- **Single expenses table** for all input types. The `source` column (ocr, gpay, manual) identifies the origin.
- **GPay import dual-saves** — every parsed transaction saves to both `transactions` (raw record) and `expenses` (linked via transactionId, category set to "other" for user review).
- **Node owns all DB operations** — Python services never touch the database. Node fetches data, passes it to the service, and saves results back.
- **JWT payload** contains `{ id, email }`. All controllers use `req.user.id` to scope every query to the logged in user.
- **Notification recipient** is fetched from user profile automatically. Frontend only passes type, channel, subject, and message.
- **Analytics, AI, and Report** endpoints fetch all required data from the DB themselves. Frontend only needs to call the endpoint with a valid token.

---

## Error Handling

All errors return consistent format:

```json
{
  "success": false,
  "message": "Human readable error message"
}
```

Global error handler in `errorHandler.js` catches all unhandled exceptions and returns 500.

---

## Troubleshooting

**Database connection error**
- Verify PostgreSQL is running
- Check DB credentials in `.env`
- Confirm `aifa_db` database exists

**Models sync error on startup**
- Run `scripts/migrate.sql` first before starting Node
- If you see ENUM cast errors run the enum fix SQL documented in the migration notes

**Microservice connection refused**
- Verify all 6 Python services are running on their correct ports
- Run `curl http://localhost:800X/` to confirm each is responding

**Invalid or expired token**
- Token expires after 7 days
- Clear localStorage and login again to get a fresh token

**form-data module not found**
- Run `npm install form-data` in the backend folder
- Required for OCR and GPay multipart file forwarding to Python services

**Port 5000 already in use on Windows**
- Run `netstat -ano | findstr :5000`
- Then `taskkill /PID <pid> /F`