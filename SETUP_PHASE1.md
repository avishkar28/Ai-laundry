# FreshFold Phase 1 Setup & Installation Guide

## Prerequisites

- **Node.js** (v16+) for backend API
- **PostgreSQL** (v12+) for database
- **Python 3.9+** for LangGraph agent
- **pgAdmin** (optional, for database GUI management)

## Installation Steps

### 1. PostgreSQL Database Setup

#### On Windows with pgAdmin:

1. **Install PostgreSQL** (if not already installed):
   - Download from https://www.postgresql.org/download/windows/
   - Install with default settings (port 5432)
   - Remember the password you set for `postgres` user

2. **Open pgAdmin**:
   - pgAdmin should be included with PostgreSQL installation
   - Or download from https://www.pgadmin.org/
   - Login with your credentials

3. **Create FreshFold Database**:
   ```sql
   CREATE DATABASE freshfold;
   ```

4. **Run Schema**:
   - In pgAdmin, open Query Tool
   - Copy entire content from `database/schema.sql`
   - Execute the query
   - This creates all tables, indexes, and sample data

#### Using Command Line:

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE freshfold;

# Exit psql
\q

# Load schema (run from database directory)
psql -U postgres -d freshfold -f schema.sql
```

#### Verify Setup:

```sql
-- Connect to freshfold database
psql -U postgres -d freshfold

-- List all tables
\dt

-- Check orders table
SELECT * FROM orders LIMIT 5;

-- Check sample data
SELECT COUNT(*) FROM customers;
SELECT COUNT(*) FROM staff;
```

---

### 2. Backend API Server Setup

#### Installation:

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file (copy from .env.example)
cp .env.example .env

# Edit .env with your database credentials
# DB_HOST=localhost
# DB_PORT=5432
# DB_USER=postgres
# DB_PASSWORD=your_password
# DB_NAME=freshfold
```

#### Configuration (.env):

```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=freshfold
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:8000
LANGGRAPH_AGENT_URL=http://localhost:3001
```

#### Start Backend:

```bash
# Development (with auto-reload)
npm run dev

# Production
npm start

# Expected output:
# ✅ FreshFold Backend API running on http://localhost:3000
```

#### Test API Health:

```bash
# In another terminal
curl http://localhost:3000/health

# Expected response:
# {"status":"ok","message":"FreshFold Backend API running"}
```

---

### 3. Frontend Integration

The frontend (HTML, CSS, JS) already exists in the root directory. It will now use the backend API.

#### Files in `/lib/`:
- `api-client.js` — REST API communication
- `workflow-engine.js` — Workflow state management
- `order-manager.js` — Order business logic
- `state-manager.js` — Global app state

#### Include in HTML:

The files are already structured. To use them in your HTML, ensure they're loaded in order:

```html
<!-- Load library files (add to index.html if not already there) -->
<script src="lib/api-client.js"></script>
<script src="lib/workflow-engine.js"></script>
<script src="lib/order-manager.js"></script>
<script src="lib/state-manager.js"></script>

<!-- Your existing dashboard script -->
<script src="dashboard.js"></script>
```

---

### 4. LangGraph Agent Integration

#### Setup Python Environment:

```bash
# Navigate to project root
cd c:\Users\Avishkar\Desktop\common

# Activate existing Python environment (.venv)
.venv\Scripts\activate

# Install LangGraph & dependencies (if not already installed)
pip install langgraph langchain langchain-community requests

# Ensure Ollama is running (for LLM)
# Download from https://ollama.ai or use existing setup
```

#### Start LangGraph Agent:

```bash
# In separate terminal, from project root
python langgraph_agent.py

# Expected output:
# Server running on http://localhost:8001
```

#### New Phase 1 Tools Available:
- `create_order_workflow` — Create order via backend API
- `assign_pickup_staff` — Assign driver to pickup task
- `update_order_status` — Move order through workflow
- `get_available_staff` — List available staff by role

---

### 5. TTS Server (Voice Output)

#### Start TTS Server:

```bash
# From project root (ensure .venv is activated)
python tts_server.py

# Expected output:
# TTS Server running on http://localhost:3001
```

---

## Workflow: Running All Services

### Terminal 1 — PostgreSQL:
```bash
# Verify PostgreSQL is running
# (Windows: it typically auto-starts)
# (Mac/Linux: sudo systemctl start postgresql)
```

### Terminal 2 — Backend API:
```bash
cd backend
npm run dev
# Listens on http://localhost:3000
```

### Terminal 3 — LangGraph Agent:
```bash
# Ensure .venv is activated
python langgraph_agent.py
# Listens on http://localhost:8001
```

### Terminal 4 — TTS Server:
```bash
# Ensure .venv is activated
python tts_server.py
# Listens on http://localhost:3001
```

### Terminal 5 — Open Frontend:
```bash
# Start a simple HTTP server (or use Live Server in VS Code)
# Navigate to http://localhost:8000 (or your configured port)
# Open index.html
```

---

## Database Management with pgAdmin

### Access pgAdmin:

1. **Local Installation**: http://localhost:5050
2. **Login** with your configured credentials
3. **Connect to Server**:
   - Right-click "Servers" → "Register" → "Server"
   - Name: `FreshFold`
   - Host: `localhost`
   - Port: `5432`
   - Username: `postgres`
   - Password: (your password)

### Common Tasks:

#### View Orders:
```
FreshFold (database)
  → Schemas
    → public
      → Tables
        → orders
          → View Rows
```

#### Execute Queries:
```
Tools → Query Tool → Type SQL → Execute (F5)
```

#### Backup Database:
```
Right-click database → Backup → Filename → Backup
```

#### Restore Database:
```
Right-click database → Restore → Select backup file
```

---

## Testing API Endpoints

### Create Order:
```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "customerData": {
      "name": "John Doe",
      "phone": "9876543210",
      "address": "123 Main St",
      "city": "Bangalore"
    },
    "items": [{
      "itemType": "Shirt",
      "quantity": 5,
      "weightKg": 2.5,
      "price": 125
    }],
    "serviceType": "Wash & Fold",
    "dates": {
      "pickupDate": "2026-05-21",
      "deliveryDate": "2026-05-25"
    }
  }'
```

### Get All Orders:
```bash
curl http://localhost:3000/api/orders
```

### Get Order by ID:
```bash
curl http://localhost:3000/api/orders/{orderId}
```

### Update Order Status:
```bash
curl -X PUT http://localhost:3000/api/orders/{orderId}/status \
  -H "Content-Type: application/json" \
  -d '{
    "newStatus": "Pending Pickup",
    "notes": "Ready for pickup"
  }'
```

### Get Staff:
```bash
curl http://localhost:3000/api/staff/role/driver
```

---

## Troubleshooting

### PostgreSQL Connection Error:
```
Error: connect ECONNREFUSED 127.0.0.1:5432

Solution:
- Verify PostgreSQL is running: sudo systemctl status postgresql
- Check DB credentials in .env match your setup
- Ensure port 5432 is not blocked by firewall
```

### Backend Won't Start:
```
Error: EADDRINUSE: address already in use :::3000

Solution:
- Kill existing process: lsof -i :3000 | grep LISTEN | awk '{print $2}' | xargs kill -9
- Or change PORT in .env
```

### LangGraph Agent Not Connecting:
```
Error: Cannot reach localhost:3000

Solution:
- Ensure backend is running first
- Check firewall settings
- Verify CORS is enabled in backend
```

### API Client Timeout:
```
Error: request timeout

Solution:
- Check backend logs for errors
- Increase timeout in api-client.js (line ~12)
- Verify database queries are performant
```

---

## Next Steps (Phase 2+)

1. **Create Order UI** — Multi-step form in index.html
2. **Order Details Page** — Timeline + workflow history
3. **Pickup Assignment** — Driver assignment UI
4. **Laundry Processing** — Internal workflow tracking
5. **Quality Check** — QC workflow
6. **Delivery Management** — Delivery staff assignment
7. **Payment Tracking** — Invoice generation
8. **Inventory Management** — Stock tracking
9. **Staff Analytics** — Performance dashboard
10. **Advanced AI** — LangGraph automation in more workflows

---

## Architecture Diagram

```
Frontend (index.html + lib/*.js)
    ↓ REST API calls ↓
    
Backend API (Node.js, Express)
    ↓ SQL queries ↓
    
PostgreSQL Database
    ↓ ↓ ↓
    
AI Services:
- LangGraph Agent (Python) → Backend API
- TTS Server (Piper) → Voice output
```

---

## Production Checklist

- [ ] Database: Regular backups configured
- [ ] Backend: Environment variables in production mode
- [ ] API: Rate limiting enabled
- [ ] Frontend: Assets minified
- [ ] Security: HTTPS certificates configured
- [ ] Monitoring: Error logging set up
- [ ] Scalability: Database indexes verified
- [ ] Testing: Unit & integration tests passing

---

For questions or issues, check logs:
- Backend: `backend/app.js` console output
- Database: PostgreSQL logs
- Frontend: Browser DevTools console
- Agent: Python console output
