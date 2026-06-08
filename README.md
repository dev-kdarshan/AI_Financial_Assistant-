# structure - of new project

# File Tree: AIFA_NEW

**Generated:** 5/5/2026, 9:50:46 AM
**Root Path:** `c:\Users\Darshan\OneDrive\Desktop\projects\AIFA_reframing\AIFA_NEW`

```
└── AIFA
    │
    ├── frontend                          # React + Vite
    │   ├── public
    │   │   ├── favicon.svg
    │   │   └── icons.svg
    │   ├── src
    │   │   ├── assets
    │   │   │   ├── hero.png
    │   │   │   ├── react.svg
    │   │   │   └── vite.svg
    │   │   │
    │   │   ├── components
    │   │   │   ├── auth
    │   │   │   │   ├── LoginForm.jsx
    │   │   │   │   ├── RegisterForm.jsx
    │   │   │   │   ├── GoogleSignIn.jsx
    │   │   │   │   ├── OtpVerify.jsx
    │   │   │   │   └── ConsentForm.jsx
    │   │   │   ├── dashboard
    │   │   │   │   ├── DashboardHome.jsx
    │   │   │   │   └── SummaryCards.jsx
    │   │   │   ├── expenses
    │   │   │   │   ├── AddOnlineExpense.jsx
    │   │   │   │   ├── AddOfflineExpense.jsx
    │   │   │   │   ├── ExpenseList.jsx
    │   │   │   │   ├── ExpenseFilter.jsx
    │   │   │   │   └── SlipUploader.jsx
    │   │   │   ├── gpay
    │   │   │   │   ├── GpaySetup.jsx
    │   │   │   │   ├── GpayImport.jsx
    │   │   │   │   └── GpayTransactions.jsx
    │   │   │   ├── analytics
    │   │   │   │   ├── PieChart.jsx
    │   │   │   │   ├── LineChart.jsx
    │   │   │   │   ├── BarChart.jsx
    │   │   │   │   ├── PaymentHistory.jsx
    │   │   │   │   └── FuturePredictions.jsx
    │   │   │   ├── ai-mode
    │   │   │   │   ├── AiModePanel.jsx
    │   │   │   │   ├── ChatBubble.jsx
    │   │   │   │   └── ChatInput.jsx
    │   │   │   └── shared
    │   │   │       ├── Navbar.jsx
    │   │   │       ├── Sidebar.jsx
    │   │   │       ├── Loader.jsx
    │   │   │       └── NotificationBadge.jsx
    │   │   │
    │   │   ├── pages
    │   │   │   ├── AuthPage.jsx
    │   │   │   ├── DashboardPage.jsx
    │   │   │   ├── ExpensesPage.jsx
    │   │   │   ├── AnalyticsPage.jsx
    │   │   │   ├── GpayPage.jsx
    │   │   │   └── AiModePage.jsx
    │   │   │
    │   │   ├── hooks
    │   │   │   ├── useAuth.js
    │   │   │   ├── useExpenses.js
    │   │   │   └── useChat.js
    │   │   │
    │   │   ├── context
    │   │   │   ├── AuthContext.jsx
    │   │   │   └── ThemeContext.jsx
    │   │   │
    │   │   ├── services                  # axios API wrappers
    │   │   │   ├── api.js
    │   │   │   ├── authService.js
    │   │   │   ├── expenseService.js
    │   │   │   └── chatService.js
    │   │   │
    │   │   ├── utils
    │   │   │   ├── formatCurrency.js
    │   │   │   └── dateHelpers.js
    │   │   │
    │   │   ├── App.jsx
    │   │   ├── App.css
    │   │   ├── index.css
    │   │   └── main.jsx
    │   │
    │   ├── .env
    │   ├── .gitignore
    │   ├── index.html
    │   ├── package.json
    │   ├── package-lock.json
    │   ├── vite.config.js
    │   └── eslint.config.js
    │
    ├── backend                           # Node.js + Express (API Gateway)
    │   ├── src
    │   │   ├── config
    │   │   │   ├── db.js
    │   │   │   └── env.js
    │   │   ├── routes
    │   │   │   ├── auth.routes.js
    │   │   │   ├── user.routes.js
    │   │   │   ├── expense.routes.js
    │   │   │   ├── gpay.routes.js
    │   │   │   ├── analytics.routes.js
    │   │   │   └── chat.routes.js
    │   │   ├── controllers
    │   │   │   ├── auth.controller.js
    │   │   │   ├── user.controller.js
    │   │   │   ├── expense.controller.js
    │   │   │   ├── gpay.controller.js
    │   │   │   └── analytics.controller.js
    │   │   ├── models                    # Mongoose schemas
    │   │   │   ├── User.model.js
    │   │   │   ├── Expense.model.js
    │   │   │   └── Transaction.model.js
    │   │   ├── middlewares
    │   │   │   ├── auth.middleware.js
    │   │   │   ├── upload.middleware.js
    │   │   │   └── errorHandler.js
    │   │   ├── services                  # calls Python microservices
    │   │   │   ├── ocr.service.js
    │   │   │   ├── notification.service.js
    │   │   │   ├── report.service.js
    │   │   │   └── prediction.service.js
    │   │   └── utils
    │   │       ├── bcrypt.util.js
    │   │       ├── jwt.util.js
    │   │       └── otp.util.js
    │   ├── app.js
    │   ├── server.js
    │   ├── .env
    │   ├── .gitignore
    │   └── package.json
    │
    └── services                          # Python Microservices (FastAPI)
        │
        ├── ocr-service                   # Payment slip OCR
        │   ├── app
        │   │   ├── main.py
        │   │   ├── routes.py
        │   │   ├── ocr_engine.py
        │   │   ├── parser.py
        │   │   └── schemas.py
        │   ├── requirements.txt
        │   └── .env
        │
        ├── gpay-parser-service           # Google Takeout parser
        │   ├── app
        │   │   ├── main.py
        │   │   ├── routes.py
        │   │   ├── html_parser.py
        │   │   ├── drive_watcher.py
        │   │   └── schemas.py
        │   ├── requirements.txt
        │   └── .env
        │
        ├── ai-service                    # RAG chatbot (LangChain)
        │   ├── app
        │   │   ├── main.py
        │   │   ├── routes.py
        │   │   ├── rag_pipeline.py
        │   │   ├── vector_store.py
        │   │   ├── embeddings.py
        │   │   ├── llm_client.py
        │   │   └── schemas.py
        │   ├── requirements.txt
        │   └── .env
        │
        ├── analytics-service             # Predictions + insights
        │   ├── app
        │   │   ├── main.py
        │   │   ├── routes.py
        │   │   ├── predictor.py
        │   │   ├── trend_analyzer.py
        │   │   ├── category_classifier.py
        │   │   └── schemas.py
        │   ├── requirements.txt
        │   └── .env
        │
        ├── notification-service          # Email + SMS scheduler (Celery)
        │   ├── app
        │   │   ├── main.py
        │   │   ├── routes.py
        │   │   ├── scheduler.py
        │   │   ├── email_sender.py
        │   │   ├── sms_sender.py
        │   │   └── tasks.py
        │   ├── requirements.txt
        │   └── .env
        │
        └── report-service                # Monthly PDF report
            ├── app
            │   ├── main.py
            │   ├── routes.py
            │   ├── pdf_generator.py
            │   ├── chart_renderer.py
            │   └── templates
            │       └── report_template.html
            ├── requirements.txt
            └── .env
```

---

**Stack summary:**
- `frontend/` — React 18 + Vite + Axios
- `backend/` — Node.js + Express + MongoDB (Mongoose) + JWT + Bcrypt
- `services/ocr-service/` — FastAPI + Tesseract / EasyOCR
- `services/gpay-parser-service/` — FastAPI + BeautifulSoup
- `services/ai-service/` — FastAPI + LangChain + FAISS / Chroma
- `services/analytics-service/` — FastAPI + Pandas + Scikit-learn
- `services/notification-service/` — FastAPI + Celery + Redis + SendGrid / Twilio
- `services/report-service/` — FastAPI + ReportLab / WeasyPrint + Matplotlib

---
*Generated by FileTree Pro Extension · Updated by AIFA project plan*