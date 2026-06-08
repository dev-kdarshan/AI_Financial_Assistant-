# AIFA - AI-Powered Finance Assistant
## Technical Architecture & How It Works

---

## Table of Contents
1. [Project Overview](#project-overview)
2. [System Architecture](#system-architecture)
3. [Technology Stack](#technology-stack)
4. [Frontend Architecture](#frontend-architecture)
5. [Backend Architecture](#backend-architecture)
6. [Microservices Architecture](#microservices-architecture)
7. [Database Schema](#database-schema)
8. [Data Flow](#data-flow)
9. [API Endpoints](#api-endpoints)
10. [Deployment](#deployment)

---

## Project Overview

AIFA is an AI-powered personal finance management application that helps users track expenses, analyze spending patterns, and get intelligent insights. It combines receipt scanning (OCR), Google Pay integration, analytics, and AI-powered chat assistance.

### Key Features:
- Receipt Scanning (OCR Technology)
- Google Pay Integration
- AI Chat Assistant (powered by Groq LLM)
-  Smart Analytics with Predictions
-  PDF Report Generation
-  Email & SMS Notifications

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      CLIENT LAYER                           │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  React 19 + Vite + Tailwind CSS (SPA)                │  │
│  │  - LandingPage, Auth, Dashboard, Expenses            │  │
│  │  - GPay, Analytics, AI Mode, Reports, Notifications  │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────┬──────────────────────────────────┘
                          │
                  HTTP/REST API
                   (Port 5000)
                          │
┌─────────────────────────▼──────────────────────────────────┐
│                    API GATEWAY LAYER                        │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Express.js Backend Server                           │  │
│  │  - Authentication & Authorization                    │  │
│  │  - Route Management                                  │  │
│  │  - Request Validation                                │  │
│  │  - Business Logic                                    │  │
│  └──────────────────────────────────────────────────────┘  │
└──┬─────────┬──────────┬──────────┬──────────┬──────────┬───┘
   │         │          │          │          │          │
   │ (gRPC/HTTP)        │          │          │          │
   │         │          │          │          │          │
┌──▼─┐ ┌────▼──┐ ┌─────▼──┐ ┌────▼──┐ ┌─────▼──┐ ┌────▼──┐
│OCR │ │  AI   │ │Analytics│ │GPay   │ │Report  │ │Notify │
│Svc │ │Service│ │Service  │ │Parser │ │Service │ │Service│
│    │ │       │ │         │ │Service│ │        │ │       │
│(ML)│ │(LLM)  │ │(Data)   │ │(Parse)│ │(PDF)   │ │(Email)│
└────┘ └───────┘ └─────────┘ └───────┘ └────────┘ └───────┘
   │         │          │          │          │          │
└──┬─────────┬──────────┬──────────┬──────────┬──────────┬───┘
   │
   │    PostgreSQL
   │    (Port 5432)
   │
┌──▼──────────────────────────────────────────────────────────┐
│                   DATA PERSISTENCE LAYER                    │
│  ┌───────────────────────────────────────────────────────┐ │
│  │  PostgreSQL Database (Sequelize ORM)                  │ │
│  │  - Users, Expenses, Transactions                      │ │
│  │  - AI Conversations, Notifications                    │ │
│  │  - Reports, Analytics Data                            │ │
│  └───────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│                   EXTERNAL SERVICES                          │
│  ┌──────────────┬──────────────┬──────────────┐            │
│  │   Groq LLM   │ Google OAuth  │  Email/SMS   │            │
│  │  (AI Chat)   │  (Sign-in)    │ (Alerts)     │            │
│  └──────────────┴──────────────┴──────────────┘            │
└──────────────────────────────────────────────────────────────┘
```

---

## Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React 19, Vite, Tailwind CSS | User Interface |
| **Backend** | Express.js, Node.js | API Gateway & Business Logic |
| **Microservices** | Python FastAPI | Specialized Processing |
| **Database** | PostgreSQL + Sequelize | Data Persistence |
| **OCR** | Python (Tesseract/PyTorch) | Receipt Scanning |
| **AI** | Groq LLM (API) | AI Chat Assistant |
| **Auth** | JWT + Passport.js | Authentication |
| **Email** | Nodemailer | Notifications |
| **Task Queue** | Celery | Async Processing |
| **Deployment** | Docker, PM2 | Containerization |

---

## Frontend Architecture

### Project Structure:
```
frontend/
├── src/
│   ├── pages/
│   │   ├── LandingPage.jsx          # Public landing page
│   │   ├── AuthPage.jsx              # Login/Register
│   │   ├── DashboardPage.jsx         # Main dashboard
│   │   ├── ExpensesPage.jsx          # Expense management
│   │   ├── GpayPage.jsx              # GPay import
│   │   ├── AnalyticsPage.jsx         # Charts & insights
│   │   ├── AiModePage.jsx            # Chat interface 
│   │   ├── ReportPage.jsx            # PDF generation 
│   │   └── NotificationsPage.jsx     # Alerts 
│   │
│   ├── components/
│   │   ├── auth/                     # Auth components
│   │   ├── dashboard/                # Dashboard components
│   │   ├── expenses/                 # Expense components
│   │   ├── gpay/                     # GPay components
│   │   ├── analytics/                # Chart components
│   │   ├── ai-mode/                  # Chat components
│   │   └── shared/                   # Reusable components
│   │
│   ├── services/
│   │   ├── api.js                    # Axios instance
│   │   ├── authService.js            # Auth API calls
│   │   ├── expenseService.js         # Expense API calls
│   │   ├── chatService.js            # Chat API calls 
│   │   ├── reportService.js          # Report API calls 
│   │   └── notificationService.js    # Notification API calls 
│   │
│   ├── hooks/
│   │   ├── useAuth.js                # Auth state
│   │   ├── useChat.js                # Chat state 
│   │   ├── useExpenses.js            # Expense state
│   │   └── useToast.js               # Toast notifications
│   │
│   ├── context/
│   │   ├── AuthContext.jsx           # Auth provider
│   │   └── ThemeContext.jsx          # Theme provider
│   │
│   └── utils/
│       ├── formatCurrency.js         # Currency formatting
│       └── dateHelpers.js            # Date utilities
```

### Frontend Pages Overview:

| Page | Purpose | Features |
|------|---------|----------|
| **Landing** | Public entry point | Features showcase, CTA buttons |
| **Auth** | Authentication | Login, Register, Google OAuth, OTP |
| **Dashboard** | Overview | Summary cards, recent activity |
| **Expenses** | Expense Management | Add, edit, list, filter expenses |
| **GPay** | Import transactions | Upload activity.html, parse data |
| **Analytics** | Data visualization | Charts, trends, predictions |
| **AI Mode** | Chat interface | Ask questions, get insights |
| **Report** | PDF generation | Generate & download reports |
| **Notifications** | Alert management | Send & view notifications |

### Frontend Technology Details:
- **State Management**: React Hooks + Context API
- **Routing**: React Router v6
- **API Client**: Axios with interceptors
- **Styling**: Tailwind CSS with custom navy/indigo theme
- **Build Tool**: Vite (fast bundling)
- **Charts**: Recharts v2 (downgraded for stability)

---

## Backend Architecture

### Backend Structure:
```
backend/
├── src/
│   ├── config/
│   │   ├── db.js                    # Database connection
│   │   └── env.js                   # Environment variables
│   │
│   ├── models/
│   │   ├── User.model.js            # User entity
│   │   ├── Expense.model.js         # Expense entity
│   │   ├── Transaction.model.js     # Transaction entity
│   │   ├── AIConversation.model.js  # Chat conversation
│   │   ├── AIMessage.model.js       # Chat messages
│   │   └── NotificationLog.model.js # Notification logs
│   │
│   ├── controllers/
│   │   ├── auth.controller.js       # Auth logic
│   │   ├── user.controller.js       # User logic
│   │   ├── expense.controller.js    # Expense logic
│   │   ├── transaction.controller.js # Transaction logic
│   │   ├── gpay.controller.js       # GPay logic
│   │   ├── analytics.controller.js  # Analytics logic
│   │   ├── chat.controller.js       # Chat logic
│   │   ├── report.controller.js     # Report generation
│   │   └── notification.controller.js # Notifications
│   │
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── user.routes.js
│   │   ├── expense.routes.js
│   │   ├── transaction.routes.js
│   │   ├── gpay.routes.js
│   │   ├── analytics.routes.js
│   │   ├── chat.routes.js
│   │   ├── report.routes.js
│   │   └── notification.routes.js
│   │
│   ├── middlewares/
│   │   ├── auth.middleware.js       # JWT verification
│   │   ├── errorHandler.js          # Global error handler
│   │   └── upload.middleware.js     # File upload handling
│   │
│   ├── services/
│   │   ├── chat.service.js          # Chat service
│   │   ├── gpay.service.js          # GPay parser
│   │   ├── notification.service.js  # Email/SMS service
│   │   ├── ocr.service.js           # OCR handler
│   │   ├── prediction.service.js    # Predictions
│   │   └── report.service.js        # Report generation
│   │
│   └── utils/
│       ├── bcrypt.util.js           # Password hashing
│       ├── jwt.util.js              # Token management
│       └── otp.util.js              # OTP generation
│
├── scripts/
│   └── migrate.sql                  # Database migrations
├── uploads/
│   └── slips/                       # Receipt uploads
├── app.js                           # Express app setup
└── server.js                        # Server entry point
```

### Backend API Endpoints:

```
Authentication:
  POST   /api/auth/register           # Register user
  POST   /api/auth/login              # Login
  POST   /api/auth/google             # Google OAuth
  POST   /api/auth/verify-otp         # Verify OTP
  POST   /api/auth/logout             # Logout

User Management:
  GET    /api/user/profile            # Get user profile
  PUT    /api/user/profile            # Update profile
  GET    /api/user/settings           # Get settings

Expenses:
  GET    /api/expense                 # List expenses
  POST   /api/expense                 # Create expense
  PUT    /api/expense/:id             # Update expense
  DELETE /api/expense/:id             # Delete expense
  POST   /api/expense/upload-slip     # Upload receipt

GPay:
  POST   /api/gpay/import             # Import GPay data
  GET    /api/gpay/transactions       # Get transactions

Transactions:
  GET    /api/transaction             # List all transactions
  GET    /api/transaction/stats       # Get statistics

Analytics:
  GET    /api/analytics/summary       # Summary data
  GET    /api/analytics/breakdown     # Category breakdown
  GET    /api/analytics/predictions   # Future predictions

Chat (AI):
  POST   /api/chat/ask                # Send chat message
  GET    /api/chat/conversations      # List conversations
  GET    /api/chat/conversations/:id/messages  # Get messages

Reports:
  POST   /api/reports/generate        # Generate PDF report
  GET    /api/reports/:id             # Get report

Notifications:
  POST   /api/notifications/send      # Send notification
  GET    /api/notifications/logs      # Get notification logs
```

---

## Microservices Architecture

AIFA uses a **modular microservices architecture** with 6 specialized Python FastAPI services that handle CPU-intensive or specialized tasks independently.

### OCR Service
**Purpose**: Extract text from receipt images using Optical Character Recognition

```
Request:  receipt.jpg
          ↓
      [FastAPI]
          ↓
    [Tesseract OCR]
          ↓
Response: { merchant, amount, date }
```

**Stack**: Python, FastAPI, Tesseract/PyTorch
**Endpoint**: `POST /ocr/extract`
**Input**: Image file
**Output**: JSON with extracted fields

---

### AI Service
**Purpose**: AI chat assistant powered by Groq LLM

```
Request:  "What did I spend most on?"
          ↓
      [FastAPI]
          ↓
    [Vector DB + Groq LLM]
          ↓
Response: "You spent most on Food: ₹12,500"
```

**Stack**: Python, FastAPI, Groq API, ChromaDB (vector store)
**Features**:
- Context-aware responses from Chroma vector database
- LLM integration with Groq for fast inference
- Conversation history management

**Endpoints**:
- `POST /ai/chat` - Send message
- `GET /ai/conversations` - Get chat history

---

### Analytics Service
**Purpose**: Compute analytics, trends, and predictions

```
Request:  user_id
          ↓
      [PostgreSQL Query]
          ↓
    [Statistical Analysis]
          ↓
Response: { categoryBreakdown, trends, predictions }
```

**Stack**: Python, FastAPI, Pandas, Scikit-learn
**Features**:
- Category-wise spending breakdown
- Trend analysis (moving averages)
- Next month predictions (ARIMA/Linear Regression)

**Endpoints**:
- `GET /analytics/breakdown` - Category breakdown
- `GET /analytics/trends` - Spending trends
- `GET /analytics/predictions` - Future predictions

---

### GPay Parser Service
**Purpose**: Parse Google Pay activity.html file and extract transactions

```
Request:  activity.html
          ↓
      [HTML Parser]
          ↓
    [Transaction Extractor]
          ↓
Response: [{ date, merchant, amount }, ...]
```

**Stack**: Python, FastAPI, BeautifulSoup
**Features**:
- Parse Google Pay HTML export
- Extract merchant, amount, timestamp
- Categorize transactions automatically

**Endpoints**:
- `POST /gpay/parse` - Upload and parse activity.html

---

### Report Service
**Purpose**: Generate professional PDF reports with visualizations

```
Request:  { userId, startDate, endDate }
          ↓
      [Data Aggregation]
          ↓
    [PDF Generation + Charts]
          ↓
Response: { report_path, fileName }
```

**Stack**: Python, FastAPI, ReportLab/weasyprint
**Report Contents**:
- Monthly spending summary
- Category breakdown with charts
- AI-powered insights
- Predictions for next month
- Transaction history

**Endpoints**:
- `POST /reports/generate` - Generate PDF

---

### Notification Service
**Purpose**: Send email and SMS notifications

```
Request:  { channel: "email", recipient, subject, message }
          ↓
      [FastAPI]
          ↓
    [Email/SMS Handler]
          ↓
Response: { status: "sent" }
```

**Stack**: Python, FastAPI, Nodemailer (backend), Twilio (SMS)
**Features**:
- Email notifications via Nodemailer
- SMS alerts via Twilio
- Notification logging
- Async processing with Celery

**Endpoints**:
- `POST /notifications/send` - Send notification
- `GET /notifications/logs` - Get notification history

---

## Database Schema

### Database: PostgreSQL

#### User Model
```sql
users {
  id: UUID (PK)
  email: VARCHAR (UNIQUE)
  password: VARCHAR (hashed)
  firstName: VARCHAR
  lastName: VARCHAR
  phoneNumber: VARCHAR
  gpayEmail: VARCHAR
  avatar: VARCHAR
  totalExpenses: DECIMAL
  createdAt: TIMESTAMP
  updatedAt: TIMESTAMP
}
```

#### Expense Model
```sql
expenses {
  id: UUID (PK)
  userId: UUID (FK -> users)
  amount: DECIMAL
  category: VARCHAR (food|transport|shopping|bills|entertainment|health|other)
  description: TEXT
  date: DATE
  source: VARCHAR (manual|gpay|receipt)
  merchant: VARCHAR
  tags: VARCHAR[]
  slipUrl: VARCHAR
  createdAt: TIMESTAMP
  updatedAt: TIMESTAMP
}
```

#### Transaction Model
```sql
transactions {
  id: UUID (PK)
  userId: UUID (FK -> users)
  gpayTransactionId: VARCHAR (UNIQUE)
  amount: DECIMAL
  merchant: VARCHAR
  date: TIMESTAMP
  category: VARCHAR
  description: TEXT
  createdAt: TIMESTAMP
}
```

#### AIConversation Model
```sql
ai_conversations {
  id: UUID (PK)
  userId: UUID (FK -> users)
  title: VARCHAR
  createdAt: TIMESTAMP
  updatedAt: TIMESTAMP
}
```

#### AIMessage Model
```sql
ai_messages {
  id: UUID (PK)
  conversationId: UUID (FK -> ai_conversations)
  userId: UUID (FK -> users)
  role: VARCHAR (user|assistant)
  content: TEXT
  createdAt: TIMESTAMP
}
```

#### NotificationLog Model
```sql
notification_logs {
  id: UUID (PK)
  userId: UUID (FK -> users)
  type: VARCHAR (expense_alert|spending_summary|budget_warning)
  channel: VARCHAR (email|sms)
  recipient: VARCHAR
  subject: VARCHAR
  message: TEXT
  status: VARCHAR (pending|sent|failed)
  createdAt: TIMESTAMP
}
```

### Relationships:
```
User
├── 1:Many ──> Expenses
├── 1:Many ──> Transactions
├── 1:Many ──> AIConversations
│             └── 1:Many ──> AIMessages
└── 1:Many ──> NotificationLogs
```

---

## Data Flow

### 1. User Registration & Authentication Flow
```
Frontend                    Backend                Database
   │                          │                        │
   ├─ Register ──────────────>│                        │
   │                          │                        │
   │                          ├─ Hash Password ───────>│
   │                          │                        │
   │                          │<─ User Created ───────┤
   │                          │                        │
   │<─ JWT Token ─────────────┤                        │
   │                          │                        │
```

### 2. Expense Creation with Receipt OCR Flow
```
Frontend              Backend           OCR Service        Database
   │                    │                     │               │
   ├─ Upload Receipt ──>│                     │               │
   │                    ├─ Call OCR ────────>│               │
   │                    │                     │               │
   │                    │<─ Extract Data ────┤               │
   │                    │ (merchant, amount)  │               │
   │                    │                     │               │
   │                    ├─ Create Expense ───────────────────>│
   │                    │                                     │
   │<─ Success ────────┤<─ Return Expense ──────────────────┤
   │                    │                                     │
```

### 3. Chat (AI) Flow
```
Frontend              Backend           AI Service          ChromaDB
   │                    │                     │               │
   ├─ Send Message ────>│                     │               │
   │                    ├─ Get Context ──────────────────────>│
   │                    │<─ Context ─────────────────────────┤
   │                    │                     │               │
   │                    ├─ Call LLM ────────>│               │
   │                    │  (context + prompt) │               │
   │                    │                     │               │
   │                    │<─ Response ────────┤               │
   │                    │                     │               │
   │<─ AI Response ────┤                     │               │
   │                    │                     │               │
```

### 4. Report Generation Flow
```
Frontend              Backend           Report Service      Database
   │                    │                     │               │
   ├─ Generate ────────>│                     │               │
   │                    ├─ Get Data ────────────────────────>│
   │                    │<─ Data ────────────────────────────┤
   │                    │                     │               │
   │                    ├─ Call Generate ───>│               │
   │                    │                     │               │
   │                    │<─ PDF Path ────────┤               │
   │                    │                     │               │
   │<─ Download URL ───┤                     │               │
   │                    │                     │               │
```

### 5. Notification Flow
```
Frontend              Backend           Notification Service
   │                    │                     │
   ├─ Send ────────────>│                     │
   │                    ├─ Queue Task ───────>│
   │                    │                     │
   │<─ Accepted ────────┤                     │
   │                    │                     ├─ Email
   │                    │                     ├─ SMS
   │                    │                     │
   │                    │<─ Log Status ──────┤
   │                    │                     │
```

---

## API Communication Pattern

### Request Flow:
```
Client Request
    ↓
Express Middleware (CORS, JSON, Authentication)
    ↓
Route Handler
    ↓
Authentication Check (JWT Middleware)
    ↓
Input Validation (express-validator)
    ↓
Controller Logic
    ↓
    ├─ Database Query (Sequelize)
    ├─ External Service Call (if needed)
    └─ Business Logic
    ↓
Response Generation
    ↓
Error Handler (if any error)
    ↓
Client Response (JSON)
```

### Example: Add Expense Endpoint
```javascript
// POST /api/expense
Express Router
  ↓
Auth Middleware (verify JWT)
  ↓
Validate Request (amount, category, date)
  ↓
expenseController.create()
  ├─ Save to Database
  ├─ Call OCR Service (if receipt uploaded)
  ├─ Trigger Analytics Update
  └─ Return Created Expense
  ↓
Client Response: { success: true, expense: {...} }
```

---

## Scalability & Performance

### Optimization Strategies:

| Component | Strategy | Benefit |
|-----------|----------|---------|
| **Database** | Indexing on userId, date | Faster queries |
| **Microservices** | Async with Celery | Non-blocking operations |
| **Caching** | Redis (optional) | Reduce DB load |
| **Frontend** | Code splitting with Vite | Faster load time |
| **API** | Rate limiting | Prevent abuse |
| **Images** | Compress uploads | Reduce bandwidth |

---

## Deployment Architecture

### Development:
```
npm run dev (Frontend on :5173)
nodemon (Backend on :5000)
uvicorn Services:
  - ocr-service on :8001
  - gpay-parser-service on :8002
  - ai-service on :8003
  - analytics-service on :8004
  - notification-service on :8005
  - report-service on :8006
PostgreSQL (Local DB on :5432)
```

### Production:
```
Frontend:    Vercel / Netlify
Backend:     AWS EC2 / Railway / Render
Services:    Docker Containers on AWS ECS
Database:    AWS RDS PostgreSQL
File Storage: AWS S3 / Cloudinary
```

### Docker Compose:
```yaml
version: '3.8'
services:
  postgres:
    image: postgres:15
    ports: ["5432:5432"]
    environment:
      POSTGRES_DB: aifa_db
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
  
  backend:
    build: ./backend
    ports: ["5000:5000"]
    depends_on: [postgres]
    environment:
      - DB_HOST=postgres
      - OCR_SERVICE_URL=http://ocr-service:8000
      - AI_SERVICE_URL=http://ai-service:8000
      - GPAY_SERVICE_URL=http://gpay-service:8000
      - ANALYTICS_SERVICE_URL=http://analytics-service:8000
      - REPORT_SERVICE_URL=http://report-service:8000
      - NOTIFICATION_SERVICE_URL=http://notification-service:8000
  
  ocr-service:
    build: ./services/ocr-service
    ports: ["8001:8000"]
    container_name: ocr-service
  
  gpay-parser-service:
    build: ./services/gpay-parser-service
    ports: ["8002:8000"]
    container_name: gpay-service
  
  ai-service:
    build: ./services/ai-service
    ports: ["8003:8000"]
    container_name: ai-service
  
  analytics-service:
    build: ./services/analytics-service
    ports: ["8004:8000"]
    container_name: analytics-service
  
  notification-service:
    build: ./services/notification-service
    ports: ["8005:8000"]
    container_name: notification-service
  
  report-service:
    build: ./services/report-service
    ports: ["8006:8000"]
    container_name: report-service
```

---

## Security Measures

- **JWT Tokens**: Secure API authentication
- **Password Hashing**: bcryptjs with salt rounds
- **CORS**: Restricted to allowed domains
- **Rate Limiting**: Prevent brute-force attacks
- **Input Validation**: express-validator on all inputs
- **SQL Injection Prevention**: Sequelize ORM (parameterized queries)
- **Environment Variables**: Sensitive data in .env files
- **HTTPS**: TLS/SSL in production
- **File Upload Validation**: Whitelist allowed types and sizes

---

## Environment Variables

### Backend (.env):
```
# Server
PORT=5000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=aifa_db
DB_USER=postgres
DB_PASSWORD=password
DB_DIALECT=postgres

# JWT
JWT_SECRET=your_secret_key
JWT_EXPIRY=7d

# Email
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password

# OAuth
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_secret

# Groq LLM
GROQ_API_KEY=your_groq_key

# Microservices URLs
OCR_SERVICE_URL=http://localhost:8001
GPAY_SERVICE_URL=http://localhost:8002
AI_SERVICE_URL=http://localhost:8003
ANALYTICS_SERVICE_URL=http://localhost:8004
NOTIFICATION_SERVICE_URL=http://localhost:8005
REPORT_SERVICE_URL=http://localhost:8006
```

### Frontend (.env):
```
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=AIFA
```

---

## 🔧 Development Setup

### Prerequisites:
- Node.js 18+
- Python 3.9+
- PostgreSQL 13+
- Git

### Quick Start:

```bash
# Clone repository
git clone <repo-url>
cd AIFA

# Backend Setup
cd backend
npm install
npm run dev

# Frontend Setup (new terminal)
cd frontend
npm install
npm run dev

# Microservices (run each in separate terminal)

# Terminal 1 - OCR Service
cd services/ocr-service
pip install -r requirements.txt
uvicorn app.main:app --port 8001 --reload

# Terminal 2 - GPay Parser Service
cd services/gpay-parser-service
pip install -r requirements.txt
uvicorn app.main:app --port 8002 --reload

# Terminal 3 - AI Service
cd services/ai-service
pip install -r requirements.txt
uvicorn app.main:app --port 8003 --reload

# Terminal 4 - Analytics Service
cd services/analytics-service
pip install -r requirements.txt
uvicorn app.main:app --port 8004 --reload

# Terminal 5 - Notification Service
cd services/notification-service
pip install -r requirements.txt
uvicorn app.main:app --port 8005 --reload

# Terminal 6 - Report Service
cd services/report-service
pip install -r requirements.txt
uvicorn app.main:app --port 8006 --reload

# Database Setup (separate terminal)
# Create PostgreSQL database and run migrations
psql -U postgres -d aifa_db -f backend/scripts/migrate.sql
```

---

## Project Structure Summary

```
AIFA/
├── frontend/                  # React + Vite + Tailwind SPA
│   ├── src/
│   │   ├── pages/            # 9 pages (3 new: AI, Report, Notifications)
│   │   ├── components/       # Reusable React components
│   │   ├── services/         # API client services
│   │   ├── hooks/            # Custom React hooks
│   │   ├── context/          # Global state management
│   │   └── utils/            # Utility functions
│   └── ...config files
│
├── backend/                   # Express.js API Gateway
│   ├── src/
│   │   ├── models/           # Sequelize ORM models (6 models)
│   │   ├── controllers/      # Business logic (9 controllers)
│   │   ├── routes/           # Express routes (9 routes)
│   │   ├── services/         # Helper services
│   │   ├── middlewares/      # Express middlewares
│   │   └── utils/            # Utility functions
│   └── server.js
│
├── services/                  # 6 Microservices
│   ├── ocr-service/          # Receipt scanning
│   ├── ai-service/           # Chat assistant
│   ├── analytics-service/    # Data analysis
│   ├── gpay-parser-service/  # GPay import
│   ├── report-service/       # PDF generation
│   └── notification-service/ # Email & SMS
│
├── public/                    # Public assets
├── Working.md                 # HOW AIFA WORKS
└── README-phae0.md
```

---

## Key Features & Technologies

| Feature | Technology | Service |
|---------|-----------|---------|
| Receipt Scanning | Tesseract OCR + PyTorch | OCR Service |
| Chat Assistance | Groq LLM + ChromaDB | AI Service |
| Expense Tracking | PostgreSQL + Sequelize | Backend |
| Analytics & Predictions | Pandas + Scikit-learn | Analytics Service |
| PDF Reports | ReportLab/weasyprint | Report Service |
| Email/SMS Alerts | Nodemailer + Twilio | Notification Service |
| Authentication | JWT + Passport | Backend |
| Frontend UI | React + Tailwind CSS | Frontend |

---

## API Rate Limits

- **Authentication**: 5 requests/minute
- **Expenses**: 100 requests/minute
- **Chat**: 20 requests/minute
- **Reports**: 10 requests/day
- **Notifications**: 50 requests/day

---

## Error Handling

All errors follow a standard JSON format:

```json
{
  "success": false,
  "message": "Error description",
  "statusCode": 400,
  "details": "Additional error info"
}
```

### HTTP Status Codes Used:
- `200 OK`: Success
- `201 Created`: Resource created
- `400 Bad Request`: Validation error
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Access denied
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error

---

## Performance Metrics

- **Frontend**: LightHouse Score > 80
- **API Response Time**: < 200ms (avg)
- **Database Query Time**: < 100ms (avg)
- **Report Generation**: < 5s
- **Chat Response**: < 2s (LLM dependent)

---

## Future Enhancements

- [ ] Mobile app (React Native)
- [ ] Real-time notifications (WebSocket)
- [ ] Budget alerts with AI recommendations
- [ ] Recurring expense templates
- [ ] Multi-currency support
- [ ] Expense splitting feature
- [ ] Investment tracking
- [ ] Integration with banking APIs

---

## License

This project is proprietary. All rights reserved.

---

## Contributing

For contribution guidelines, please reach out to the development team.

---

**Last Updated**: 2026-06-08  
**Architecture Version**: 2.0 (Microservices)  
**Stability**: Production Ready 

---

## Additional Resources

- [Backend Setup Guide](./backend/README.md)
- [Frontend Setup Guide](./frontend/README.md)
- [API Documentation](./docs/API.md)
- [Database Schema](./backend/scripts/migrate.sql)

