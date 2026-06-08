# AIFA — AI-Powered Finance Assistant
## Technical Architecture & How It Works

---

## Table of Contents
1. [Project Overview](#project-overview)
2. [System Architecture](#system-architecture)
3. [Technology Stack](#technology-stack)
4. [Project Structure](#project-structure)
5. [Frontend Architecture](#frontend-architecture)
6. [Backend Architecture](#backend-architecture)
7. [Microservices Architecture](#microservices-architecture)
8. [Database Schema](#database-schema)
9. [Data Flow](#data-flow)
10. [Development Setup](#development-setup)
11. [Environment Variables](#environment-variables)
12. [Additional Resources](#additional-resources)

---

## Project Overview

AIFA is an AI-powered personal finance management web application. It helps users track expenses, analyze spending patterns, and get intelligent insights using a combination of OCR, Google Pay integration, analytics predictions, and an AI chat assistant powered by Groq LLM.

### Key Features

- **Receipt Scanning** — Upload payment slips, OCR extracts merchant, amount, and date automatically
- **Google Pay Import** — Upload `activity.html` exported from Google Pay, all transactions parsed and saved
- **Manual Expense Entry** — Add expenses directly with category, date, merchant, and description
- **AI Chat Assistant** — Ask questions about your spending, powered by Groq LLM with RAG context from ChromaDB
- **Smart Analytics** — Category breakdown, monthly trends, next month spending prediction, AI insights
- **PDF Report Generation** — Professional branded PDF with charts and AI-powered insights
- **Email and SMS Notifications** — Spending alerts and monthly summaries via SendGrid and Twilio
- **Soft Delete** — All deletions are reversible, data is never permanently lost

---

## System Architecture
┌─────────────────────────────────────────────────────────────┐
│                      CLIENT LAYER                           │
│                                                             │
│   React 19 + Vite + Tailwind CSS                           │
│                                                             │
│   Pages: Landing, Auth, Dashboard, Expenses,               │
│          GPay, Analytics, AI Chat, Report, Notifications    │
│                                                             │
│   Services: api.js (axios + JWT interceptor)               │
│             authService, expenseService, gpayService,      │
│             analyticsService, chatService,                  │
│             reportService, notificationService              │
└─────────────────────────┬───────────────────────────────────┘
│
HTTP REST API
Port 5000
│
┌─────────────────────────▼───────────────────────────────────┐
│                   API GATEWAY LAYER                         │
│                                                             │
│   Express.js Backend Server                                 │
│                                                             │
│   Responsibilities:                                         │
│   - JWT authentication (all protected routes)              │
│   - Request validation                                      │
│   - Fetch user data from PostgreSQL                        │
│   - Forward to correct Python microservice                  │
│   - Save results back to PostgreSQL                        │
│   - Return JSON response to frontend                       │
│                                                             │
│   Controllers: auth, user, expense, transaction,           │
│                gpay, analytics, chat, report,              │
│                notification                                 │
└───┬────────┬────────┬────────┬────────┬────────┬───────────┘
│        │        │        │        │        │
│        │        │        │        │        │
▼        ▼        ▼        ▼        ▼        ▼
┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐
│ OCR  │ │ GPay │ │  AI  │ │Analy-│ │Report│ │Notif-│
│ Svc  │ │ Svc  │ │ Svc  │ │tics  │ │ Svc  │ │ ication│
│      │ │      │ │      │ │ Svc  │ │      │ │ Svc  │
│:8001 │ │:8002 │ │:8003 │ │:8004 │ │:8006 │ │:8005 │
│      │ │      │ │      │ │      │ │      │ │      │
│Easy  │ │Beau- │ │Groq  │ │Groq  │ │Report│ │Send- │
│OCR   │ │tiful │ │LLM + │ │+     │ │Lab + │ │Grid +│
│      │ │Soup  │ │Chroma│ │NumPy │ │Matpl.│ │Twilio│
└──────┘ └──────┘ └──────┘ └──────┘ └──────┘ └──────┘
│
│
▼
┌─────────────────────────────────────────────────────────────┐
│                  DATA PERSISTENCE LAYER                     │
│                                                             │
│   PostgreSQL Database (Port 5432)                          │
│   Sequelize ORM                                             │
│                                                             │
│   Tables: Users, Expenses, Transactions,                   │
│           AIConversations, AIMessages, NotificationLogs     │
│                                                             │
│   All tables support soft delete via deletedAt column      │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│                   EXTERNAL SERVICES                         │
│                                                             │
│   Groq LLM (AI Chat + Insights)                            │
│   Google OAuth (Sign in with Google)                       │
│   SendGrid (Email notifications)                           │
│   Twilio (SMS notifications)                               │
│   Celery + Redis (Async task queue for notifications)      │
└─────────────────────────────────────────────────────────────┘

---

## Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | React 19, Vite, Tailwind CSS v3 | User interface |
| Routing | React Router v6 | Client-side routing |
| HTTP Client | Axios | API calls with JWT interceptor |
| Charts | Recharts v2 | Analytics visualizations |
| Backend | Express.js, Node.js | API gateway and business logic |
| ORM | Sequelize | PostgreSQL operations |
| Auth | JWT, bcryptjs | Authentication and password hashing |
| Email (OTP) | Nodemailer | OTP delivery during registration |
| File Upload | Multer (memory storage) | Receipt and HTML file handling |
| Service Comm | axios + form-data | Node to Python HTTP calls |
| Microservices | Python FastAPI | Specialized processing |
| OCR | EasyOCR | Receipt text extraction |
| AI | Groq LLM + ChromaDB + SentenceTransformers | RAG-powered chat |
| Analytics | Groq + NumPy | Predictions and AI insights |
| PDF | ReportLab + Matplotlib | Report generation |
| Notifications | SendGrid + Twilio + Celery | Email and SMS delivery |
| HTML Parsing | BeautifulSoup | GPay activity.html parsing |
| Database | PostgreSQL 13+ | Primary data store |
| Task Queue | Celery + Redis | Async notification processing |

---

## Project Structure
AIFA/
├── backend/                          — Express.js API gateway
│   ├── scripts/
│   │   └── migrate.sql               — One-time DB migration script
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js                 — Sequelize + PostgreSQL connection
│   │   │   └── env.js                — Environment variable exports
│   │   ├── controllers/
│   │   │   ├── analytics.controller.js
│   │   │   ├── auth.controller.js
│   │   │   ├── chat.controller.js
│   │   │   ├── expense.controller.js
│   │   │   ├── gpay.controller.js
│   │   │   ├── notification.controller.js
│   │   │   ├── report.controller.js
│   │   │   ├── transaction.controller.js
│   │   │   └── user.controller.js
│   │   ├── middlewares/
│   │   │   ├── auth.middleware.js    — JWT verify, attaches req.user
│   │   │   ├── errorHandler.js       — Global error handler
│   │   │   └── upload.middleware.js  — Multer memory storage
│   │   ├── models/
│   │   │   ├── index.js              — All models + associations + sync
│   │   │   ├── AIConversation.model.js
│   │   │   ├── AIMessage.model.js
│   │   │   ├── Expense.model.js
│   │   │   ├── NotificationLog.model.js
│   │   │   ├── Transaction.model.js
│   │   │   └── User.model.js
│   │   ├── routes/
│   │   │   ├── analytics.routes.js
│   │   │   ├── auth.routes.js
│   │   │   ├── chat.routes.js
│   │   │   ├── expense.routes.js
│   │   │   ├── gpay.routes.js
│   │   │   ├── notification.routes.js
│   │   │   ├── report.routes.js
│   │   │   ├── transaction.routes.js
│   │   │   └── user.routes.js
│   │   ├── services/
│   │   │   ├── chat.service.js       — Calls AI service :8003
│   │   │   ├── gpay.service.js       — Calls GPay service :8002
│   │   │   ├── notification.service.js — Calls notification service :8005
│   │   │   ├── ocr.service.js        — Calls OCR service :8001
│   │   │   ├── prediction.service.js — Calls analytics service :8004
│   │   │   └── report.service.js     — Calls report service :8006
│   │   └── utils/
│   │       ├── bcrypt.util.js
│   │       ├── jwt.util.js
│   │       └── otp.util.js
│   ├── uploads/
│   │   └── slips/                    — Uploaded receipt images
│   ├── app.js                        — Express setup, routes, middleware
│   ├── server.js                     — DB connect, sync, server start
│   └── package.json
│
├── frontend/                         — React + Vite + Tailwind SPA
│   ├── public/
│   │   ├── favicon.svg
│   │   └── icons.svg
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── ai-mode/              — Chat bubbles, input bar, panel
│   │   │   ├── analytics/            — Bar, pie, line charts, predictions
│   │   │   ├── auth/                 — Login, register, OTP forms
│   │   │   ├── dashboard/            — Summary cards, home
│   │   │   ├── expenses/             — Manual form, OCR uploader, list
│   │   │   ├── gpay/                 — Import zone, setup, transactions
│   │   │   └── shared/               — Navbar, Sidebar, BottomTabBar,
│   │   │                               Loader, Toast, ProtectedRoute,
│   │   │                               NotificationBadge
│   │   ├── context/
│   │   │   ├── AuthContext.jsx
│   │   │   └── ThemeContext.jsx
│   │   ├── hooks/
│   │   │   ├── useAuth.js
│   │   │   ├── useChat.js
│   │   │   ├── useExpenses.js
│   │   │   └── useToast.js
│   │   ├── layouts/
│   │   │   └── AppLayout.jsx         — Sidebar + Navbar + content wrapper
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx
│   │   │   ├── AuthPage.jsx
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── ExpensesPage.jsx
│   │   │   ├── GpayPage.jsx
│   │   │   ├── AnalyticsPage.jsx
│   │   │   ├── AiModePage.jsx
│   │   │   ├── ReportPage.jsx
│   │   │   └── NotificationsPage.jsx
│   │   ├── services/
│   │   │   ├── api.js                — Axios instance + JWT interceptor
│   │   │   ├── analyticsService.js
│   │   │   ├── authService.js
│   │   │   ├── chatService.js
│   │   │   ├── expenseService.js
│   │   │   ├── gpayService.js
│   │   │   ├── notificationService.js
│   │   │   └── reportService.js
│   │   ├── utils/
│   │   │   ├── dateHelpers.js
│   │   │   └── formatCurrency.js
│   │   ├── App.jsx                   — Routes + ProtectedRoute + AuthProvider
│   │   └── index.css                 — Tailwind directives + Google Fonts
│   ├── tailwind.config.cjs
│   ├── postcss.config.cjs
│   └── package.json
│
├── services/                         — 6 Python FastAPI microservices
│   ├── ai-service/                   — Groq LLM + ChromaDB RAG (port 8003)
│   │   └── app/
│   │       ├── main.py
│   │       ├── routes.py
│   │       ├── schemas.py
│   │       ├── rag_pipeline.py
│   │       ├── vector_store.py
│   │       ├── embeddings.py
│   │       └── llm_client.py
│   ├── analytics-service/            — Groq + NumPy analytics (port 8004)
│   │   └── app/
│   │       ├── main.py
│   │       ├── routes.py
│   │       ├── schemas.py
│   │       ├── ai_insights.py
│   │       ├── category_classifier.py
│   │       ├── predictor.py
│   │       └── trend_analyzer.py
│   ├── gpay-parser-service/          — BeautifulSoup HTML parser (port 8002)
│   │   └── app/
│   │       ├── main.py
│   │       ├── routes.py
│   │       ├── schemas.py
│   │       └── html_parser.py
│   ├── notification-service/         — SendGrid + Twilio + Celery (port 8005)
│   │   └── app/
│   │       ├── main.py
│   │       ├── routes.py
│   │       ├── tasks.py
│   │       ├── email_sender.py
│   │       ├── sms_sender.py
│   │       └── scheduler.py
│   ├── ocr-service/                  — EasyOCR receipt scanner (port 8001)
│   │   └── app/
│   │       ├── main.py
│   │       ├── routes.py
│   │       ├── schemas.py
│   │       ├── ocr_engine.py
│   │       └── parser.py
│   └── report-service/               — ReportLab + Matplotlib PDF (port 8006)
│       └── app/
│           ├── main.py
│           ├── routes.py
│           ├── pdf_generator.py
│           ├── chart_renderer.py
│           ├── ai_insights.py
│           └── utils.py
│
├── docs/
│   └── API.md                        — Complete API reference
└── README.md                         — This file

---

## Frontend Architecture

### Routes

| Route | Page | Auth Required |
|-------|------|---------------|
| / | LandingPage | No |
| /auth | AuthPage | No |
| /dashboard | DashboardPage | Yes |
| /expenses | ExpensesPage | Yes |
| /gpay | GpayPage | Yes |
| /analytics | AnalyticsPage | Yes |
| /ai | AiModePage | Yes |
| /report | ReportPage | Yes |
| /notifications | NotificationsPage | Yes |

### State Management

- **AuthContext** — user object, login, logout, isAuthenticated
- **useExpenses** — expenses array, loading, addExpense, addFromOCR, deleteExpense
- **useChat** — conversations, messages, sending state, sendMessage, openConversation
- **useToast** — toast message, type, showToast, hideToast

### API Communication

All calls go through `src/services/api.js` — an axios instance pointed at `http://localhost:5000/api`. JWT token is attached via request interceptor. 401 responses trigger automatic logout and redirect to `/auth`.

Frontend never calls Python microservices directly. All service communication is handled by the Node.js backend.

### Color Palette
Background primary:   #07080F  navy-950
Background cards:     #0D0E1A  navy-900
Background elevated:  #12141F  navy-800
Border:               #1A1D2E  navy-700
Accent primary:       #6366F1  indigo-500
Accent success:       #10B981  emerald-500
Accent danger:        #F43F5E  rose-500
Accent warning:       #FBBF24  amber-400
Text primary:         #F0F0FF
Text muted:           #94A3B8  slate-400

---

## Backend Architecture

### Request Flow
Frontend Request
↓
Express Middleware (CORS, JSON parse, Morgan logging)
↓
Route Handler
↓
JWT Auth Middleware (verify token, attach req.user)
↓
Controller
↓
├── Fetch user/expenses from PostgreSQL (Sequelize)
├── Forward to Python microservice (axios)
└── Save result back to PostgreSQL
↓
JSON Response to Frontend
↓
Global Error Handler (if any error thrown)

### Key Design Rules

- **Node owns all DB operations** — Python services never touch PostgreSQL
- **Single expenses table** — OCR, GPay, and manual entries all go here. `source` column identifies origin
- **GPay dual-save** — every parsed transaction saves to both `transactions` (raw) and `expenses` (linked via `transactionId`)
- **Soft delete everywhere** — `deletedAt` timestamp on expenses, transactions, conversations. Never hard delete
- **Notification recipient from DB** — Node fetches email/phone from user profile. Frontend never passes recipient

---

## Microservices Architecture

All 6 services are Python FastAPI apps. Node.js calls them over HTTP. They do one job each and return JSON.

### OCR Service — Port 8001
Node receives: receipt image file (multipart)
↓
Node calls: POST /ocr/extract (multipart file)
↓
Python: EasyOCR reads image → regex extracts fields
↓
Returns: { merchant, amount, date, category, raw_text }
↓
Node: creates Expense row with source: "ocr"

### GPay Parser Service — Port 8002
Node receives: activity.html file (multipart)
↓
Node calls: POST /gpay/parse (multipart file)
↓
Python: BeautifulSoup parses HTML → extracts transactions
↓
Returns: { transactions: [{ amount, type, recipient, datetime, status }] }
↓
Node: saves each to Transactions table AND Expenses table
(dual-save, expenses get source: "gpay", category: "other")

### AI Service — Port 8003
Node receives: { question } from frontend
↓
Node: fetches user's expenses from PostgreSQL
↓
Node calls: POST /ai/ask with { user_id, question, expenses[] }
↓
Python: embeds expenses → stores in ChromaDB per user
semantic search for relevant context
sends context + question to Groq LLM
↓
Returns: { response: "AI answer text" }
↓
Node: saves AIConversation + 2 AIMessage rows (user + assistant)
returns answer to frontend

### Analytics Service — Port 8004
Node receives: GET /analytics request
↓
Node: fetches user's expenses from PostgreSQL
↓
Node calls: POST /analytics/analyze with { expenses[] }
↓
Python: category classification via Groq
spending breakdown and totals
next month prediction via NumPy
3 AI insight bullets via Groq
↓
Returns: { total, breakdown, prediction, insights[] }
↓
Node: returns directly to frontend

### Notification Service — Port 8005
Node receives: { type, channel, subject, message }
↓
Node: fetches recipient (email or phone) from user profile
creates NotificationLog row with status: "pending"
↓
Node calls: POST /notify/email  →  { to_email, subject, content }
or POST /notify/sms    →  { to_phone, message }
↓
Python: Celery queues async task
SendGrid sends email / Twilio sends SMS
↓
Returns: { success, task_id }
↓
Node: updates NotificationLog status to "sent" or "failed"

### Report Service — Port 8006
Node receives: POST /reports/generate
↓
Node: fetches expenses + salary from PostgreSQL
builds monthly trend data
↓
Node calls: POST /generate-report
with { user_id, monthly_income, expenses[], monthly_trend[] }
↓
Python: Matplotlib generates bar + pie charts
Groq generates AI insights JSON
ReportLab assembles branded 3-page PDF
↓
Returns: { report_path }
↓
Node: returns path to frontend for download

---

## Database Schema

### Complete Schema
users
id            UUID PK
name          STRING NOT NULL
email         STRING UNIQUE NOT NULL
password      STRING nullable
phone         STRING nullable
salary        FLOAT nullable
googleId      STRING nullable
isVerified    BOOLEAN default false
createdAt     TIMESTAMP
updatedAt     TIMESTAMP
expenses
id            UUID PK
userId        UUID FK → users CASCADE
amount        FLOAT NOT NULL
category      STRING NOT NULL
date          DATE NOT NULL
merchantName  STRING nullable
description   STRING nullable
source        ENUM (ocr | gpay | manual) NOT NULL
slipUrl       STRING nullable
transactionId UUID FK → transactions SET NULL nullable
isAiSuggested BOOLEAN default false
deletedAt     TIMESTAMP nullable  ← soft delete
createdAt     TIMESTAMP
updatedAt     TIMESTAMP
transactions
id          UUID PK
userId      UUID FK → users CASCADE
amount      FLOAT NOT NULL
type        ENUM (debit | credit) nullable
recipient   STRING nullable
description STRING nullable
date        DATE NOT NULL
source      ENUM (gpay | manual) NOT NULL
deletedAt   TIMESTAMP nullable  ← soft delete
createdAt   TIMESTAMP
updatedAt   TIMESTAMP
ai_conversations
id           UUID PK
userId       UUID FK → users CASCADE
title        STRING nullable
context      TEXT nullable  ← JSON snapshot of expenses at chat time
messageCount INTEGER default 0
deletedAt    TIMESTAMP nullable  ← soft delete
createdAt    TIMESTAMP
updatedAt    TIMESTAMP
ai_messages
id             UUID PK
conversationId UUID FK → ai_conversations CASCADE
userId         UUID FK → users CASCADE
role           ENUM (user | assistant) NOT NULL
content        TEXT NOT NULL
contextUsed    TEXT nullable  ← RAG chunks used
tokensUsed     INTEGER nullable
createdAt      TIMESTAMP
updatedAt      TIMESTAMP
notification_logs
id        UUID PK
userId    UUID FK → users CASCADE
type      ENUM (email | sms | reminder | monthly-report) NOT NULL
channel   ENUM (email | sms) NOT NULL
recipient STRING NOT NULL
subject   STRING nullable
status    ENUM (sent | failed | pending) default pending
taskId    STRING nullable  ← Celery task ID
createdAt TIMESTAMP
updatedAt TIMESTAMP

### Relationships
User
├── 1:Many ──> Expenses       (userId FK, CASCADE delete)
├── 1:Many ──> Transactions   (userId FK, CASCADE delete)
├── 1:Many ──> AIConversations (userId FK, CASCADE delete)
│             └── 1:Many ──> AIMessages (conversationId FK, CASCADE delete)
│             AIMessages also have direct userId FK → users
└── 1:Many ──> NotificationLogs (userId FK, CASCADE delete)
Transaction
└── 1:Many ──> Expenses (transactionId FK, SET NULL on delete)

---

## Data Flow

### 1. Registration and Login
Frontend                  Backend                  Database
│                        │                         │
├─ POST /auth/register ─>│                         │
│  { name, email,        │                         │
│    password, phone }   ├─ hash password ────────>│
│                        ├─ create user            │
│                        │  isVerified: false      │
│                        ├─ generate OTP           │
│<─ { message, otp } ───┤                         │
│                        │                         │
├─ POST /auth/verify-otp>│                         │
│  { email, otp }        ├─ verify OTP ───────────>│
│                        ├─ set isVerified: true   │
│<─ { message } ────────┤                         │
│                        │                         │
├─ POST /auth/login ────>│                         │
│  { email, password }   ├─ verify password ──────>│
│                        ├─ generate JWT           │
│<─ { message, token } ─┤                         │
│                        │                         │
Store token in           │                         │
localStorage             │                         │

### 2. Expense via OCR (Slip Scan)
Frontend           Backend           OCR Service        Database
│                  │                   │                │
├─ POST /expense/  │                   │                │
│   ocr            │                   │                │
│  (image file) ──>│                   │                │
│                  ├─ POST /ocr/extract│                │
│                  │  (multipart) ────>│                │
│                  │                   ├─ EasyOCR       │
│                  │                   ├─ regex parse   │
│                  │<─ { merchant,     │                │
│                  │    amount, date } │                │
│                  ├─ create Expense ──────────────────>│
│                  │  source: "ocr"    │                │
│<─ { data, ocr_raw} ──────────────────────────────────┤

### 3. GPay Import (Dual Save)
Frontend           Backend           GPay Service       Database
│                  │                   │                │
├─ POST /gpay/     │                   │                │
│   import         │                   │                │
│  (activity.html)>│                   │                │
│                  ├─ POST /gpay/parse │                │
│                  │  (multipart) ────>│                │
│                  │                   ├─ BeautifulSoup │
│                  │                   ├─ extract txns  │
│                  │<─ { transactions[]│                │
│                  │                   │                │
│                  ├─ for each txn:    │                │
│                  │  save Transaction ────────────────>│
│                  │  save Expense ─────────────────────>│
│                  │  (source: "gpay", │                │
│                  │   category: "other")               │
│<─ { transactions,│                                    │
│     expenses } ──┤                                    │

### 4. AI Chat
Frontend        Backend            AI Service          Database
│               │                    │                 │
├─ POST         │                    │                 │
│  /chat/ask ──>│                    │                 │
│  { question } │                    │                 │
│               ├─ fetch expenses ──────────────────>  │
│               │<─ expenses[] ──────────────────────  │
│               │                    │                 │
│               ├─ POST /ai/ask ────>│                 │
│               │  { user_id,        │                 │
│               │    question,       ├─ embed expenses │
│               │    expenses[] }    ├─ ChromaDB store │
│               │                    ├─ semantic search│
│               │                    ├─ Groq LLM call  │
│               │<─ { response } ───┤                 │
│               │                    │                 │
│               ├─ save AIConversation ──────────────> │
│               ├─ save user AIMessage ──────────────> │
│               ├─ save assistant AIMessage ─────────> │
│               │                                      │
│<─ { answer,   │                                      │
│  conversationId } ──────────────────────────────────┤

### 5. Analytics
Frontend        Backend            Analytics Service
│               │                    │
├─ GET          │                    │
│  /analytics ─>│                    │
│               ├─ fetch expenses ─> DB
│               │<─ expenses[]       │
│               │                    │
│               ├─ POST /analytics/  │
│               │   analyze ────────>│
│               │  { expenses[] }    ├─ category classify
│               │                    ├─ breakdown totals
│               │                    ├─ NumPy prediction
│               │                    ├─ Groq insights
│               │<─ { total,         │
│               │    breakdown,      │
│               │    prediction,     │
│               │    insights[] }    │
│<─ { data } ───┤                    │

### 6. Report Generation
Frontend        Backend            Report Service
│               │                    │
├─ POST         │                    │
│  /reports/    │                    │
│  generate ───>│                    │
│               ├─ fetch expenses ─> DB
│               ├─ fetch salary ──── DB
│               ├─ build trend data  │
│               │                    │
│               ├─ POST /generate-   │
│               │   report ─────────>│
│               │  { user_id,        ├─ Matplotlib charts
│               │    monthly_income, ├─ Groq AI insights
│               │    expenses[],     ├─ ReportLab PDF
│               │    monthly_trend[]}│
│               │<─ { report_path } ┤
│<─ { data } ───┤                    │

### 7. Notification
Frontend        Backend            Notification Service
│               │                    │
├─ POST         │                    │
│  /notifications│                   │
│  /send ───────>│                   │
│  { type,       │                   │
│    channel,    │                   │
│    subject,    │                   │
│    message }   │                   │
│               ├─ fetch user ──────> DB
│               │  (get email/phone) │
│               ├─ create log row    │
│               │  status: pending ─> DB
│               │                    │
│               ├─ POST /notify/     │
│               │   email or sms ───>│
│               │  { to_email/phone, ├─ Celery queue
│               │    subject,        ├─ SendGrid / Twilio
│               │    content/message}│
│               │<─ { task_id } ────┤
│               │                    │
│               ├─ update log ──────> DB
│               │  status: sent      │
│<─ { logId,    │                    │
│    taskId,    │                    │
│    status } ──┤                    │

---

## Development Setup

### Prerequisites

- Node.js 18+
- Python 3.9+
- PostgreSQL 13+
- Redis (required for notification service Celery)

### Step 1 — Database

```bash
psql -U postgres -c "CREATE DATABASE aifa_db;"
psql -U postgres -d aifa_db -f backend/scripts/migrate.sql
```

### Step 2 — Backend

```bash
cd backend
npm install
npm run dev
```

Backend runs on `http://localhost:5000`

### Step 3 — Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`

### Step 4 — Python Microservices

Run each in a separate terminal from the `services/` directory:

```bash
# Terminal 1
cd services/ocr-service
pip install -r requirements.txt
uvicorn app.main:app --port 8001 --reload

# Terminal 2
cd services/gpay-parser-service
pip install -r requirements.txt
uvicorn app.main:app --port 8002 --reload

# Terminal 3
cd services/ai-service
pip install -r requirements.txt
uvicorn app.main:app --port 8003 --reload

# Terminal 4
cd services/analytics-service
pip install -r requirements.txt
uvicorn app.main:app --port 8004 --reload

# Terminal 5
cd services/notification-service
pip install -r requirements.txt
uvicorn app.main:app --port 8005 --reload

# Terminal 6
cd services/report-service
pip install -r requirements.txt
uvicorn app.main:app --port 8006 --reload
```

### Step 5 — Verify All Services

```bash
curl http://localhost:5000/
curl http://localhost:8001/
curl http://localhost:8002/
curl http://localhost:8003/
curl http://localhost:8004/
curl http://localhost:8005/
curl http://localhost:8006/
```

All should return a JSON message confirming the service is running.

---

## Environment Variables

### Backend `.env`
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=aifa_db
DB_USER=postgres
DB_PASSWORD=your_password
JWT_SECRET=your_jwt_secret_min_32_chars
JWT_EXPIRE=7d
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GROQ_API_KEY=your_groq_api_key
OCR_SERVICE_URL=http://localhost:8001
GPAY_SERVICE_URL=http://localhost:8002
AI_SERVICE_URL=http://localhost:8003
ANALYTICS_SERVICE_URL=http://localhost:8004
NOTIFICATION_SERVICE_URL=http://localhost:8005
REPORT_SERVICE_URL=http://localhost:8006

### Frontend `.env`
VITE_API_URL=http://localhost:5000/api
VITE_GOOGLE_CLIENT_ID=your_google_client_id

---

## Additional Resources

- [Backend README](./backend/README.md) — Backend setup, models, routes, troubleshooting
- [Frontend README](./frontend/README.md) — Frontend setup, pages, services, troubleshooting
- [API Documentation](./docs/API.md) — Complete REST API reference with request and response shapes
- [Migration Script](./backend/scripts/migrate.sql) — Database schema creation and column changes