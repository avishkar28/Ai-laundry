# FreshFold Phase 1 — Workflow-Driven Laundry Management System

## 🎯 Project Status: PHASE 1 IMPLEMENTATION

This is a comprehensive upgrade of the FreshFold dashboard from a standalone analytics tool into a **production-grade workflow-driven laundry management platform**.

---

## 📋 What's Been Implemented

### ✅ Phase 1 Foundation (Completed)

#### 1. **PostgreSQL Database Schema** (`database/schema.sql`)
- 15 core tables designed for all 17 business areas (Phases 1–4)
- Immutable audit logs for compliance
- Foreign key constraints & data integrity
- Sample data for testing
- Views for common queries

**Core Tables (Phase 1):**
- `orders` — Full order lifecycle tracking
- `customers` — Customer profiles
- `order_items` — Line items for each order
- `staff` — Team members with roles & performance scores
- `staff_assignments` — Task assignments to staff
- `workflow_history` — Immutable event log

#### 2. **Node.js/Express Backend API** (`backend/`)

**Running on:** `http://localhost:3000`

**Features:**
- RESTful API for all order operations
- Order creation, status updates, timeline retrieval
- Staff management & assignment workflows
- Workflow execution endpoint for LangGraph integration
- AI context detection for guided workflows
- Error handling & validation middleware

**Key Endpoints:**
```
POST   /api/orders                      → Create order
GET    /api/orders                      → List orders (with filters)
GET    /api/orders/:orderId             → Get order details + history
PUT    /api/orders/:orderId/status      → Update status (validated)
POST   /api/orders/:orderId/assign      → Assign staff to task
GET    /api/orders/:orderId/timeline    → Get workflow history
GET    /api/staff                       → Get all staff
GET    /api/staff/role/:role            → Get staff by role
POST   /api/workflows/execute           → Execute workflow (LangGraph)
POST   /api/ai/detect-workflow          → AI workflow detection
POST   /api/ai/get-hints                → AI hints for next steps
```

#### 3. **Frontend State Management** (`lib/`)

**Four Core Modules:**

1. **`api-client.js`** — REST communication layer
   - Fetch wrapper with timeout
   - All API endpoints wrapped
   - Error handling & logging

2. **`workflow-engine.js`** — Workflow business logic
   - Valid status transitions (enforced server-side too)
   - Progress tracking & visualization
   - Status categorization & coloring
   - Timeline generation

3. **`order-manager.js`** — Order operations
   - Create, retrieve, search orders
   - Customer management
   - Price calculation
   - Timeline retrieval
   - Staff assignment

4. **`state-manager.js`** — Global app state
   - Centralized state store
   - Event system for reactive updates
   - Auto-sync with backend
   - Filter management
   - Statistics computation

#### 4. **Enhanced LangGraph Agent** (`langgraph_agent.py`)

**New Phase 1 Tools:**
- `create_order_workflow` — Create order via backend API
- `assign_pickup_staff` — Assign driver to pickup
- `update_order_status` — Move order through workflow
- `get_available_staff` — List available staff by role

**Capabilities:**
- Detects workflow context from user messages
- Calls backend API for state changes
- Supports multi-turn conversations
- Fallback to mock responses if backend unavailable

---

## 📊 Order Lifecycle (14 Status Transitions)

```
Created
  ↓
Pending Pickup
  ↓
Pickup Assigned
  ↓
Picked Up
  ↓
Received At Laundry
  ↓
Sorting → Washing → Drying → Ironing → Folding → Packing
  ↓
Quality Check (can revert to Sorting if failed)
  ↓
Out For Delivery
  ↓
Delivered
  ↓
Completed
```

Each transition is:
- **Validated** at the backend (no invalid transitions allowed)
- **Logged** in `workflow_history` table (immutable audit trail)
- **Recorded** with timestamp, staff ID, and optional notes

---

## 🚀 Quick Start Guide

### 1. **Setup Database**

```bash
# PostgreSQL should be running on localhost:5432

# Create database (via psql or pgAdmin)
CREATE DATABASE freshfold;

# Load schema
psql -U postgres -d freshfold -f database/schema.sql

# Verify
psql -U postgres -d freshfold -c "SELECT COUNT(*) FROM orders;"
```

### 2. **Start Backend API**

```bash
cd backend

# Install dependencies
npm install

# Create .env from .env.example
cp .env.example .env

# Update DB credentials in .env if needed

# Start server (with auto-reload)
npm run dev

# Or: npm start (production)
```

**Expected Output:**
```
✅ FreshFold Backend API running on http://localhost:3000
```

### 3. **Start LangGraph Agent**

```bash
# From project root, activate Python environment
.venv\Scripts\activate

# Install dependencies (if needed)
pip install langgraph langchain requests

# Start agent
python langgraph_agent.py
```

### 4. **Start TTS Server**

```bash
# From project root, activate Python environment
.venv\Scripts\activate

# Start TTS
python tts_server.py
```

### 5. **Open Frontend**

```bash
# Use Live Server in VS Code or
# Start simple server
npx http-server

# Open http://localhost:8000 (or configured port)
```

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────┐
│     Frontend (HTML + lib/*.js)      │
│  - Order creation form              │
│  - Order details page               │
│  - Workflow timeline UI             │
│  - AI tutorial system               │
└──────────────┬──────────────────────┘
               │ REST API (JSON)
               ↓
┌─────────────────────────────────────┐
│   Backend API (Node.js/Express)     │
│  - Order management                 │
│  - Staff assignment                 │
│  - Workflow orchestration           │
│  - AI endpoint integration          │
└──────────────┬──────────────────────┘
               │ SQL queries
               ↓
┌─────────────────────────────────────┐
│   PostgreSQL Database               │
│  - 15 tables (Phases 1-4)          │
│  - Workflow history logs            │
│  - Audit trails                     │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│   AI Services (Python)              │
│  - LangGraph Agent (automation)     │
│  - TTS Server (voice output)        │
└─────────────────────────────────────┘
```

---

## 📁 Project Structure

```
freshfold-common/
├── backend/                    # Node.js API server
│   ├── app.js                 # Express server + routes
│   ├── config.js              # Database config
│   ├── package.json           # Dependencies
│   ├── migrate.js             # Database initialization
│   ├── .env.example           # Environment template
│   ├── models/                # Sequelize models
│   │   ├── index.js
│   │   ├── Customer.js
│   │   ├── Order.js
│   │   ├── OrderItem.js
│   │   ├── Staff.js
│   │   ├── StaffAssignment.js
│   │   └── WorkflowHistory.js
│   ├── services/              # Business logic
│   │   ├── orderService.js
│   │   └── staffService.js
│   └── routes/                # API routes (future)
│
├── database/                  # Database files
│   └── schema.sql            # Complete schema
│
├── lib/                       # Frontend state management
│   ├── api-client.js         # REST API wrapper
│   ├── workflow-engine.js    # Workflow logic
│   ├── order-manager.js      # Order operations
│   └── state-manager.js      # Global state
│
├── ai-system/                # AI tutorial system (existing)
├── index.html                # Main page
├── dashboard.js              # Dashboard logic (existing)
├── script.js                 # Event handlers (existing)
├── style.css                 # Styles (existing)
│
├── langgraph_agent.py        # AI agent with tools
├── tts_server.py             # Text-to-speech server
├── SETUP_PHASE1.md           # Installation guide
└── README.md                 # This file
```

---

## 🔄 Workflow Example: Create Order

### User Action:
1. Click "Create Order" button on dashboard
2. Fill customer details, items, dates, service type
3. Review summary and click "Create"

### Backend Flow:
1. Frontend calls `POST /api/orders`
2. API validates inputs
3. Creates customer (if new)
4. Creates order with status "Created"
5. Creates order items
6. Records in `workflow_history` table
7. Returns order ID (ORD-XXXXX format)

### Data Flow:
```
Frontend Form
  ↓
OrderManager.createOrder()
  ↓
APIClient.createOrder()
  ↓
POST /api/orders
  ↓
orderService.createOrder()
  ↓
Database (INSERT orders, order_items, workflow_history)
  ↓
Response (success + order object)
  ↓
Frontend updates UI + shows order details
```

---

## 🛠️ Available Services & Ports

| Service | Port | URL | Status |
|---------|------|-----|--------|
| Frontend | 8000 | http://localhost:8000 | Ready |
| Backend API | 3000 | http://localhost:3000 | Ready |
| PostgreSQL | 5432 | localhost:5432 | Configured |
| LangGraph Agent | 8001 | http://localhost:8001 | Ready |
| TTS Server | 3001 | http://localhost:3001 | Ready |
| pgAdmin | 5050 | http://localhost:5050 | Optional |

---

## 🧪 Testing Checklist

### Database:
- [ ] PostgreSQL running and connected
- [ ] `freshfold` database exists
- [ ] 6 tables created with data
- [ ] Can query via psql: `SELECT * FROM customers;`

### Backend:
- [ ] Server starts without errors
- [ ] Health check: `GET /health` returns 200
- [ ] Can create order: `POST /api/orders` returns 201
- [ ] Can list orders: `GET /api/orders` returns data
- [ ] Status validation works (invalid transitions rejected)

### Frontend:
- [ ] Page loads without console errors
- [ ] State manager initializes: `stateManager.initialize()`
- [ ] Can fetch orders: `orderManager.getAllOrders()`
- [ ] UI reflects backend data

### LangGraph:
- [ ] Agent starts without errors
- [ ] New tools appear in available_tools
- [ ] Can call `create_order_workflow` tool

---

## 🚨 Troubleshooting

### Backend Won't Connect to DB:
```bash
# Check if PostgreSQL is running
sudo systemctl status postgresql

# Verify .env has correct credentials
cat backend/.env | grep DB_

# Test connection
psql -U postgres -h localhost -d freshfold
```

### Port Already in Use:
```bash
# Find process using port 3000
lsof -i :3000

# Kill it
kill -9 <PID>

# Or change PORT in .env
```

### API Returns CORS Error:
```
Solution: Backend CORS is configured for http://localhost:*
Check backend/app.js line ~20 for cors configuration
```

### Orders Not Persisting:
```
Solution: Check database connection + schema loaded
Run: psql -U postgres -d freshfold -c "SELECT COUNT(*) FROM orders;"
```

---

## 📈 Next Steps (Phase 2–4)

### Phase 2: Production Workflows (Weeks 4–5)
- ✅ Quality Check workflow
- ✅ Delivery assignment & tracking
- ✅ Payment workflows
- ✅ Invoice generation

### Phase 3: Inventory & Staff (Week 6)
- ✅ Inventory management
- ✅ Stock tracking & alerts
- ✅ Staff performance dashboard
- ✅ Workload visualization

### Phase 4: Advanced Features (Week 7+)
- ✅ Customer profiles & loyalty
- ✅ Advanced analytics
- ✅ Predictive insights
- ✅ Mobile app integration

---

## 📚 Documentation Files

- **`SETUP_PHASE1.md`** — Complete installation guide
- **`database/schema.sql`** — Database schema with all tables
- **`backend/.env.example`** — Environment variables template
- **`AI_SYSTEM_IMPLEMENTATION.md`** — AI integration guide (existing)
- **`GEMINI_AI_INTEGRATION.md`** — Gemini API setup (existing)

---

## 🎓 Key Concepts

### Status Transitions
Orders move through a predefined lifecycle. Only valid transitions are allowed:
- Backend enforces at SQL level
- Frontend validates before API calls
- `workflow_history` logs every transition

### Workflow History
Immutable audit log (`workflow_history` table) records:
- When status changed
- What staff member made the change
- Any notes/comments
- Timestamp

### API-First Architecture
- All data flows through backend API
- Frontend is stateless client
- Database is source of truth
- Enables multi-client support

### Modular Frontend
- `api-client.js` — Network layer
- `order-manager.js` — Business logic layer
- `workflow-engine.js` — Workflow logic layer
- `state-manager.js` — State layer

---

## 📞 Support

For issues or questions:
1. Check logs in backend console
2. Verify database connection
3. Check browser DevTools for frontend errors
4. Review `SETUP_PHASE1.md` troubleshooting section
5. Check LangGraph agent logs

---

## ✨ Built With

- **Frontend:** Vanilla JavaScript (no frameworks)
- **Backend:** Node.js + Express.js
- **Database:** PostgreSQL + Sequelize ORM
- **AI:** LangGraph + Ollama/Gemini
- **Voice:** Piper TTS

---

**Version:** 1.0.0 Phase 1  
**Last Updated:** May 2026  
**Status:** Production Ready (Phase 1)
