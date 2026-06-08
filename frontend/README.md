# AIFA Frontend

AI-powered financial assistance application frontend built with React, Vite, and Tailwind CSS.

## Technology Stack

- **React 19** — UI library
- **Vite** — Build tool and development server
- **Tailwind CSS v3** — Utility-first CSS framework
- **React Router v6** — Client-side routing
- **Axios** — HTTP client with JWT interceptor
- **Recharts** — Data visualization charts
- **Context API** — Auth state management

---

## Project Structure
frontend/
├── public/
│   ├── favicon.svg
│   └── icons.svg
├── src/
│   ├── assets/
│   │   ├── AIFA-logo.png
│   │   ├── hero.png
│   │   ├── react.svg
│   │   └── vite.svg
│   ├── components/
│   │   ├── ai-mode/
│   │   │   ├── AiModePanel.jsx       — Chat window with message bubbles
│   │   │   ├── ChatBubble.jsx        — Individual message bubble component
│   │   │   └── ChatInput.jsx         — Message input bar with send button
│   │   ├── analytics/
│   │   │   ├── BarChart.jsx          — Monthly spending bar chart (Recharts)
│   │   │   ├── FuturePredictions.jsx — Next month prediction card
│   │   │   ├── LineChart.jsx         — Spending trend line chart (Recharts)
│   │   │   ├── PaymentHistory.jsx    — Recent transactions table
│   │   │   └── PieChart.jsx          — Category breakdown pie chart (Recharts)
│   │   ├── auth/
│   │   │   ├── ConsentForm.jsx       — Terms consent form
│   │   │   ├── GoogleSignIn.jsx      — Google OAuth button
│   │   │   ├── LoginForm.jsx         — Email and password login form
│   │   │   ├── OtpVerify.jsx         — 6-digit OTP input screen
│   │   │   └── RegisterForm.jsx      — Registration form
│   │   ├── dashboard/
│   │   │   ├── DashboardHome.jsx     — Main dashboard content
│   │   │   └── SummaryCards.jsx      — Top stat cards (total, category, budget)
│   │   ├── expenses/
│   │   │   ├── AddOfflineExpense.jsx — Manual expense form
│   │   │   ├── AddOnlineExpense.jsx  — OCR prefilled expense form
│   │   │   ├── ExpenseFilter.jsx     — Category and date range filters
│   │   │   ├── ExpenseList.jsx       — Expense history list with soft delete
│   │   │   └── SlipUploader.jsx      — Receipt image upload zone
│   │   ├── gpay/
│   │   │   ├── GpayImport.jsx        — activity.html upload zone + review table
│   │   │   ├── GpaySetup.jsx         — GPay import instructions
│   │   │   └── GpayTransactions.jsx  — Imported transaction history table
│   │   └── shared/
│   │       ├── BottomTabBar.jsx      — Mobile bottom navigation bar
│   │       ├── Loader.jsx            — Spinning ring loader component
│   │       ├── Navbar.jsx            — Fixed top navbar with avatar dropdown
│   │       ├── NotificationBadge.jsx — Bell icon with unread count badge
│   │       ├── ProtectedRoute.jsx    — Redirects to /auth if no token
│   │       ├── Sidebar.jsx           — Fixed left sidebar with nav links
│   │       └── Toast.jsx             — Slide-in toast notification
│   ├── context/
│   │   ├── AuthContext.jsx           — Auth state provider (user, login, logout)
│   │   └── ThemeContext.jsx          — Theme state provider
│   ├── hooks/
│   │   ├── useAuth.js                — Auth state and actions
│   │   ├── useChat.js                — AI chat state (conversations, messages, send)
│   │   ├── useExpenses.js            — Expense state (fetch, add, delete)
│   │   └── useToast.js               — Toast show and hide state
│   ├── layouts/
│   │   └── AppLayout.jsx             — Sidebar + Navbar + main content wrapper
│   ├── pages/
│   │   ├── AiModePage.jsx            — AI chat interface (two panel layout)
│   │   ├── AnalyticsPage.jsx         — Charts, predictions, AI insights
│   │   ├── AuthPage.jsx              — Login, Register, OTP (single page, state toggled)
│   │   ├── DashboardPage.jsx         — Summary cards + recent expenses + quick actions
│   │   ├── ExpensesPage.jsx          — Manual input, scan slip, history tabs
│   │   ├── GpayPage.jsx              — GPay import + transaction history
│   │   ├── LandingPage.jsx           — Public landing page (hero, features, how it works)
│   │   ├── NotificationsPage.jsx     — Send notification form + log table
│   │   └── ReportPage.jsx            — Generate and download PDF report
│   ├── services/
│   │   ├── analyticsService.js       — GET /api/analytics
│   │   ├── api.js                    — Axios instance with JWT interceptor
│   │   ├── authService.js            — Register, verifyOTP, login, logout
│   │   ├── chatService.js            — sendMessage, getConversations, getMessages
│   │   ├── expenseService.js         — getAll, addManual, addFromOCR, softDelete
│   │   ├── gpayService.js            — importFile, getTransactions, softDelete
│   │   ├── notificationService.js    — send, getLogs
│   │   └── reportService.js          — generateReport
│   ├── utils/
│   │   ├── dateHelpers.js            — formatDate, formatMonth, isThisMonth
│   │   └── formatCurrency.js         — formatCurrency, formatCompact
│   ├── App.css
│   ├── App.jsx                       — Routes, ProtectedRoute, AuthProvider
│   ├── index.css                     — Tailwind directives + Google Fonts import
│   └── main.jsx
├── .gitignore
├── README.md
├── eslint.config.js
├── index.html
├── package.json
├── postcss.config.cjs                — PostCSS config for Tailwind
├── tailwind.config.cjs               — Tailwind theme (colors, fonts, borderRadius)
└── vite.config.js

---

## Prerequisites

- Node.js 18.0.0 or higher
- npm 9.0.0 or higher
- AIFA backend running on port 5000

---

## Installation

```bash
npm install
```

---

## Environment Configuration

Create `.env` in the frontend root directory:
VITE_API_URL=http://localhost:5000/api
VITE_GOOGLE_CLIENT_ID=your_google_client_id

Note: All API calls go through the Node.js backend on port 5000. The frontend never calls Python services directly.

---

## Running the Application

### Development

```bash
npm run dev
```

Available at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

Generates optimized bundle in `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

### Lint

```bash
npm run lint
```

---

## Pages and Routes

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

Unauthenticated users accessing protected routes are redirected to `/auth` by `ProtectedRoute`.

---

## Authentication Flow

1. User visits `/auth`
2. Register form submits to backend — OTP returned in dev mode
3. OTP screen auto-focuses each digit box, advances on input
4. After OTP verify — user is redirected to login
5. Login stores JWT token in `localStorage` key `token` and user object in `localStorage` key `user`
6. All axios requests attach token via request interceptor in `api.js`
7. 401 response triggers interceptor — clears localStorage and redirects to `/auth`
8. Logout clears localStorage and redirects to `/auth`

---

## State Management

- **AuthContext** — user object, login function, logout function, isAuthenticated check
- **useExpenses** — expenses array, loading, addExpense, addFromOCR, deleteExpense, refetch
- **useChat** — conversations, activeConversation, messages, sending state, sendMessage, openConversation, newConversation
- **useToast** — toast object, showToast, hideToast

No Redux or Zustand. All state is React Context + custom hooks.

---

## API Integration

All API calls go through `src/services/api.js` which is an axios instance pointing to `http://localhost:5000/api`.

| Service file | Backend route | Purpose |
|---|---|---|
| authService.js | /auth/* | Register, OTP, Login |
| expenseService.js | /expense/* | Expense CRUD and OCR |
| gpayService.js | /gpay/import, /transaction/* | GPay import and transactions |
| analyticsService.js | /analytics | Analytics data |
| chatService.js | /chat/* | AI conversations |
| reportService.js | /reports/generate | PDF generation |
| notificationService.js | /notifications/* | Send and log notifications |

Frontend never calls Python microservices directly. All service communication is handled by the Node.js backend.

---

## Color Palette

Defined in `tailwind.config.cjs`:
Background primary:   #07080F  (navy-950)
Background cards:     #0D0E1A  (navy-900)
Background elevated:  #12141F  (navy-800)
Border:               #1A1D2E  (navy-700)
Accent primary:       #6366F1  (indigo-500)
Accent success:       #10B981  (emerald-500)
Accent danger:        #F43F5E  (rose-500)
Accent warning:       #FBBF24  (amber-400)
Text primary:         #F0F0FF
Text muted:           #94A3B8  (slate-400)

---

## Category Colors

Used in badges and pie chart:
food:          amber-400   #FBBF24
transport:     indigo-400  #818CF8
shopping:      rose-400    #FB7185
bills:         emerald-400 #34D399
entertainment: purple-400  #C084FC
health:        cyan-400    #22D3EE
other:         slate-400   #94A3B8

---

## Responsive Breakpoints
Mobile:   < 1024px  — sidebar hidden, bottom tab bar shown
Desktop:  ≥ 1024px  — full sidebar with labels visible

Bottom tab bar shows 5 key routes: Dashboard, Expenses, GPay, Analytics, AI.

---

## Troubleshooting

**Blank page on npm run dev**
- Clear node_modules: `rm -rf node_modules && npm install`
- Check browser console for import errors
- Verify `tailwind.config.cjs` exists (not `.js`)

**Tailwind styles not applying**
- Confirm `postcss.config.cjs` exists with tailwindcss and autoprefixer plugins
- Check `index.css` has all three `@tailwind` directives
- Restart dev server after config changes

**API calls failing**
- Verify backend is running on port 5000
- Check `VITE_API_URL` in `.env` is `http://localhost:5000/api`
- Open browser devtools Network tab to see actual request and response

**Token not attaching to requests**
- Check `localStorage` has key `token` in browser devtools Application tab
- Verify `api.js` interceptor reads from `localStorage.getItem("token")`

**Charts not rendering**
- Confirm `npm install recharts` was run
- Wrap chart components in `ResponsiveContainer` with `width="100%"`

**Redirected to /auth on every page load**
- Check token exists in localStorage
- Token may be expired — login again to get a fresh one
- Verify `ProtectedRoute` reads from `localStorage.getItem("token")`