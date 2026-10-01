# Finlytics AI — Python FastAPI Backend

Enterprise-grade Python FastAPI backend serving the Finlytics AI Client Portal.

---

## 🚀 Quick Start

### 1. Requirements
- Python 3.10+
- Virtualenv / PIP

### 2. Run Backend Locally
```bash
# Start server with Uvicorn (0.0.0.0 allows mobile app on same Wi-Fi to connect)
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

- **Interactive Swagger Documentation**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- **ReDoc Documentation**: [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)
- **Health Check**: [http://127.0.0.1:8000/health](http://127.0.0.1:8000/health)

---

## 🐘 PostgreSQL Connection Guide

By default, the backend runs instantly on SQLite for zero-setup local execution.
**To switch to PostgreSQL, simply set the `DATABASE_URL` environment variable:**

### In `.env` or system environment:
```env
DATABASE_URL=postgresql://<username>:<password>@<host>:<port>/<database_name>
```

**Example:**
```env
DATABASE_URL=postgresql://postgres:mysecretpassword@localhost:5432/finlytics_db
```

The database tables will be **automatically created** upon startup using SQLAlchemy!

---

## 🔐 Demo Accounts (Pre-Seeded)

| Account Type | Email | Password | Role / Behavior |
|---|---|---|---|
| **Normal Client** | `darlene@meridiangroup.com` | `Password123!` | Directly enters dashboard |
| **First-Time Client** | `marcus@brodyenterprises.io` | `TempPass123!` | Triggers `/change-password` redirection |

---

## 📡 API Endpoints Overview

| Module | Method | Endpoint | Description |
|---|---|---|---|
| **Auth** | `POST` | `/api/auth/login` | Returns JWT & `is_first_time_login` |
| **Auth** | `POST` | `/api/auth/forgot-password` | Simulates password reset email |
| **Auth** | `POST` | `/api/auth/change-password` | Updates password & clears first-time flag |
| **Dashboard**| `GET` | `/api/dashboard/overview` | 4 KPI cards, chart bars, category breakdown, health score |
| **Documents**| `POST`| `/api/documents/upload` | Multipart file upload (5 allowed types) + auto transaction extraction |
| **Documents**| `GET` | `/api/documents` | Upload history with month, type, and status filters |
| **Documents**| `GET` | `/api/documents/{id}/transactions`| Drill-down into line items extracted from document |
| **Reports**  | `GET` | `/api/reports` | **Approved reports only** (drafts strictly excluded) |
| **Reports**  | `GET` | `/api/reports/{id}` | Full P&L, Cash Flow, Growth Analysis, Action items |
| **Reports**  | `PATCH`| `/api/reports/{id}/actions/{action_id}` | Update action status (`done` / `dismissed`) |
| **Chat**     | `GET` | `/api/chat/conversations` | Conversation history list |
| **Chat**     | `POST`| `/api/chat/message` | **Grounded AI financial advisor** (strictly answers from ledger) |
| **Ledger**   | `GET` | `/api/transactions` | Filter, sort, pagination |
| **Ledger**   | `GET` | `/api/transactions/export-csv` | Streams formatted `.csv` file |
| **Settings** | `GET` | `/api/settings/profile` | Business profile details |
| **Settings** | `PUT` | `/api/settings/profile` | Update company name, industry, fiscal year, currency |
| **Settings** | `PUT` | `/api/settings/notifications` | Toggle 4 notification preferences |
