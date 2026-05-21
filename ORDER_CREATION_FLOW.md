# 🚀 Complete Order Creation Flow — Test Walkthrough

## Overview

This document walks through creating a complete order from start to finish, showing:
1. Customer creation
2. Order placement
3. Item assignment
4. Workflow state transition
5. Database verification

---

## 📋 Prerequisites

Before running this flow, ensure:

```bash
# 1. PostgreSQL is running
#    Windows: Services → PostgreSQL (should be running)
#    Linux:   systemctl status postgresql
#    Mac:     brew services list | grep postgres

# 2. Database exists
psql -U postgres -c "CREATE DATABASE freshfold;" 2>/dev/null || true

# 3. Schema loaded
psql -U postgres -d freshfold -f database/schema.sql

# 4. Backend server started
cd backend
npm run dev
# Should output: ✅ FreshFold Backend API running on http://localhost:3000
```

---

## 🔄 Step-by-Step Order Creation Flow

### **STEP 1: Health Check**

**What:** Verify backend API is running

**Request:**
```bash
curl -X GET http://localhost:3000/health
```

**Expected Response (200 OK):**
```json
{
  "status": "ok",
  "timestamp": "2026-05-20T10:30:00Z"
}
```

**What Happens:**
- Backend checks database connection
- Returns status if healthy

---

### **STEP 2: Create Customer (or Use Existing)**

**What:** Register customer for order

**Request:**
```bash
curl -X POST http://localhost:3000/api/customers \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Rahul Sharma",
    "phone": "9876543210",
    "email": "rahul@example.com",
    "address": "123 MG Road",
    "city": "Bangalore",
    "pincode": "560001"
  }'
```

**Expected Response (201 Created):**
```json
{
  "success": true,
  "customer": {
    "id": "a1b2c3d4-e5f6-4g7h-8i9j-0k1l2m3n4o5p",
    "name": "Rahul Sharma",
    "phone": "9876543210",
    "email": "rahul@example.com",
    "address": "123 MG Road",
    "city": "Bangalore",
    "pincode": "560001",
    "createdAt": "2026-05-20T10:30:00Z",
    "updatedAt": "2026-05-20T10:30:00Z"
  }
}
```

**Database Impact:**
```sql
-- Inserted into customers table
INSERT INTO customers 
  (id, name, phone, email, address, city, pincode)
VALUES 
  ('a1b2c3d4-e5f6-4g7h-8i9j-0k1l2m3n4o5p', 'Rahul Sharma', '9876543210', ...);
```

---

### **STEP 3: Create Order**

**What:** Create new order for customer with items and dates

**Request:**
```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "a1b2c3d4-e5f6-4g7h-8i9j-0k1l2m3n4o5p",
    "items": [
      {
        "itemType": "Shirt",
        "quantity": 5,
        "weightKg": 2.5,
        "serviceType": "Wash & Fold",
        "price": 125
      },
      {
        "itemType": "Pants",
        "quantity": 3,
        "weightKg": 1.8,
        "serviceType": "Wash & Fold",
        "price": 90
      }
    ],
    "serviceType": "Wash & Fold",
    "totalPrice": 215,
    "pickupDate": "2026-05-21",
    "deliveryDate": "2026-05-25",
    "address": "123 MG Road, Bangalore",
    "specialInstructions": "Gentle wash, no bleach"
  }'
```

**Expected Response (201 Created):**
```json
{
  "success": true,
  "order": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "orderId": "ORD-50234",
    "customerId": "a1b2c3d4-e5f6-4g7h-8i9j-0k1l2m3n4o5p",
    "status": "Created",
    "totalPrice": 215,
    "pickupDate": "2026-05-21",
    "deliveryDate": "2026-05-25",
    "address": "123 MG Road, Bangalore",
    "specialInstructions": "Gentle wash, no bleach",
    "createdAt": "2026-05-20T10:30:00Z",
    "updatedAt": "2026-05-20T10:30:00Z",
    "completedAt": null
  },
  "message": "Order ORD-50234 created successfully!"
}
```

**Database Impact:**

*Table: orders*
```sql
INSERT INTO orders 
  (id, orderId, customerId, status, totalPrice, pickupDate, deliveryDate, address, specialInstructions, createdAt, updatedAt)
VALUES 
  ('550e8400-e29b-41d4-a716-446655440000', 'ORD-50234', 'a1b2c3d4-e5f6-4g7h-8i9j-0k1l2m3n4o5p', 'Created', 215, '2026-05-21', '2026-05-25', ...);
```

*Table: order_items*
```sql
INSERT INTO order_items 
  (id, orderId, itemType, quantity, weightKg, serviceType, price, createdAt, updatedAt)
VALUES 
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'Shirt', 5, 2.5, 'Wash & Fold', 125, ...),
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'Pants', 3, 1.8, 'Wash & Fold', 90, ...);
```

*Table: workflow_history*
```sql
INSERT INTO workflow_history 
  (id, orderId, eventType, statusFrom, statusTo, staffId, notes, aiAction, timestamp)
VALUES 
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'order_created', NULL, 'Created', NULL, 'Order placed', FALSE, '2026-05-20T10:30:00Z');
```

---

### **STEP 4: Retrieve Order Details**

**What:** Fetch complete order with items and history

**Request:**
```bash
curl -X GET http://localhost:3000/api/orders/550e8400-e29b-41d4-a716-446655440000 \
  -H "Content-Type: application/json"
```

**Expected Response (200 OK):**
```json
{
  "success": true,
  "order": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "orderId": "ORD-50234",
    "status": "Created",
    "totalPrice": 215,
    "pickupDate": "2026-05-21",
    "deliveryDate": "2026-05-25",
    "address": "123 MG Road, Bangalore",
    "specialInstructions": "Gentle wash, no bleach",
    "customer": {
      "id": "a1b2c3d4-e5f6-4g7h-8i9j-0k1l2m3n4o5p",
      "name": "Rahul Sharma",
      "phone": "9876543210",
      "email": "rahul@example.com",
      "address": "123 MG Road, Bangalore",
      "city": "Bangalore",
      "pincode": "560001"
    },
    "items": [
      {
        "id": "item-1",
        "itemType": "Shirt",
        "quantity": 5,
        "weightKg": 2.5,
        "serviceType": "Wash & Fold",
        "price": 125
      },
      {
        "id": "item-2",
        "itemType": "Pants",
        "quantity": 3,
        "weightKg": 1.8,
        "serviceType": "Wash & Fold",
        "price": 90
      }
    ],
    "assignments": [],
    "history": [
      {
        "id": "hist-1",
        "eventType": "order_created",
        "statusFrom": null,
        "statusTo": "Created",
        "timestamp": "2026-05-20T10:30:00Z",
        "notes": "Order placed"
      }
    ]
  }
}
```

**What This Shows:**
- ✅ Order is "Created" status
- ✅ 2 items attached (Shirt, Pants)
- ✅ Customer details linked
- ✅ 1 history entry (order creation)
- ✅ No staff assignments yet

---

### **STEP 5: Assign Staff for Pickup**

**What:** Assign driver to pickup task (advances workflow)

**First, get available drivers:**
```bash
curl -X GET http://localhost:3000/api/staff/role/driver \
  -H "Content-Type: application/json"
```

**Response (200 OK):**
```json
{
  "success": true,
  "staff": [
    {
      "id": "driver-uuid-1",
      "name": "Vikram Patel",
      "phone": "9988776655",
      "role": "driver",
      "performanceScore": 4.8,
      "status": "available",
      "assignedArea": "North Bangalore"
    },
    {
      "id": "driver-uuid-2",
      "name": "Anjali Desai",
      "phone": "8877665544",
      "role": "driver",
      "performanceScore": 4.6,
      "status": "available",
      "assignedArea": "South Bangalore"
    }
  ]
}
```

**Assign Vikram to pickup:**
```bash
curl -X POST http://localhost:3000/api/orders/550e8400-e29b-41d4-a716-446655440000/assign \
  -H "Content-Type: application/json" \
  -d '{
    "staffId": "driver-uuid-1",
    "taskType": "pickup",
    "notes": "Assigned for pickup at 2PM"
  }'
```

**Expected Response (201 Created):**
```json
{
  "success": true,
  "assignment": {
    "id": "assign-uuid-1",
    "orderId": "550e8400-e29b-41d4-a716-446655440000",
    "staffId": "driver-uuid-1",
    "taskType": "pickup",
    "status": "assigned",
    "notes": "Assigned for pickup at 2PM",
    "createdAt": "2026-05-20T10:35:00Z"
  },
  "orderStatus": "Pickup Assigned",
  "message": "Pickup assigned to Vikram Patel"
}
```

**Database Impact:**

*Table: staff_assignments*
```sql
INSERT INTO staff_assignments 
  (id, orderId, staffId, taskType, status, notes, createdAt, updatedAt)
VALUES 
  ('assign-uuid-1', '550e8400-e29b-41d4-a716-446655440000', 'driver-uuid-1', 'pickup', 'assigned', 'Assigned for pickup at 2PM', ...);
```

*Table: workflow_history*
```sql
INSERT INTO workflow_history 
  (id, orderId, eventType, statusFrom, statusTo, staffId, notes, aiAction, timestamp)
VALUES 
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'status_change', 'Created', 'Pending Pickup', 'driver-uuid-1', 'Driver assigned', FALSE, '2026-05-20T10:35:00Z'),
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'task_assigned', 'Pending Pickup', 'Pickup Assigned', 'driver-uuid-1', 'Pickup task assigned', FALSE, '2026-05-20T10:35:00Z');
```

---

### **STEP 6: Move to Next Status (Picked Up)**

**What:** Driver confirms pickup complete

**Request:**
```bash
curl -X PUT http://localhost:3000/api/orders/550e8400-e29b-41d4-a716-446655440000/status \
  -H "Content-Type: application/json" \
  -d '{
    "newStatus": "Picked Up",
    "staffId": "driver-uuid-1",
    "notes": "Collected from customer at 2:15 PM"
  }'
```

**Expected Response (200 OK):**
```json
{
  "success": true,
  "order": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "orderId": "ORD-50234",
    "status": "Picked Up",
    "totalPrice": 215,
    "pickupDate": "2026-05-21",
    "deliveryDate": "2026-05-25"
  },
  "message": "Order ORD-50234 status updated to 'Picked Up'"
}
```

**Database Impact:**

*Table: orders*
```sql
UPDATE orders 
SET status = 'Picked Up', updatedAt = NOW()
WHERE id = '550e8400-e29b-41d4-a716-446655440000';
```

*Table: workflow_history*
```sql
INSERT INTO workflow_history 
  (id, orderId, eventType, statusFrom, statusTo, staffId, notes, timestamp)
VALUES 
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'status_change', 'Pickup Assigned', 'Picked Up', 'driver-uuid-1', 'Collected from customer at 2:15 PM', ...);
```

---

### **STEP 7: View Complete Workflow Timeline**

**What:** See entire order history

**Request:**
```bash
curl -X GET http://localhost:3000/api/orders/550e8400-e29b-41d4-a716-446655440000/timeline \
  -H "Content-Type: application/json"
```

**Expected Response (200 OK):**
```json
{
  "success": true,
  "timeline": [
    {
      "id": "hist-1",
      "eventType": "order_created",
      "statusFrom": null,
      "statusTo": "Created",
      "staffName": null,
      "notes": "Order placed",
      "timestamp": "2026-05-20T10:30:00Z"
    },
    {
      "id": "hist-2",
      "eventType": "status_change",
      "statusFrom": "Created",
      "statusTo": "Pending Pickup",
      "staffName": "Vikram Patel",
      "notes": "Driver assigned",
      "timestamp": "2026-05-20T10:35:00Z"
    },
    {
      "id": "hist-3",
      "eventType": "task_assigned",
      "statusFrom": "Pending Pickup",
      "statusTo": "Pickup Assigned",
      "staffName": "Vikram Patel",
      "notes": "Pickup task assigned",
      "timestamp": "2026-05-20T10:35:30Z"
    },
    {
      "id": "hist-4",
      "eventType": "status_change",
      "statusFrom": "Pickup Assigned",
      "statusTo": "Picked Up",
      "staffName": "Vikram Patel",
      "notes": "Collected from customer at 2:15 PM",
      "timestamp": "2026-05-20T10:45:00Z"
    }
  ]
}
```

**This Timeline Shows:**
- ✅ Order created at 10:30
- ✅ Driver assigned at 10:35
- ✅ Pickup confirmed at 10:45
- ✅ All staff members tracked
- ✅ Complete audit trail

---

## 🔍 Complete Database State After Flow

After all steps above, here's the final database state:

### **customers table**
```
id                                 | name             | phone         | email                | address               | city       | pincode
a1b2c3d4-e5f6-4g7h-8i9j-0k1l2m3n4o5p | Rahul Sharma   | 9876543210    | rahul@example.com    | 123 MG Road           | Bangalore  | 560001
```

### **orders table**
```
id                                  | orderId   | customerId                         | status     | totalPrice | pickupDate  | deliveryDate | address
550e8400-e29b-41d4-a716-446655440000 | ORD-50234 | a1b2c3d4-e5f6-4g7h-8i9j-0k1l2m3n4o5p | Picked Up | 215        | 2026-05-21  | 2026-05-25   | 123 MG Road
```

### **order_items table**
```
id     | orderId                                | itemType | quantity | weightKg | serviceType | price
item-1 | 550e8400-e29b-41d4-a716-446655440000 | Shirt    | 5        | 2.5      | Wash & Fold | 125
item-2 | 550e8400-e29b-41d4-a716-446655440000 | Pants    | 3        | 1.8      | Wash & Fold | 90
```

### **staff_assignments table**
```
id            | orderId                                | staffId      | taskType | status   | notes
assign-uuid-1 | 550e8400-e29b-41d4-a716-446655440000 | driver-uuid-1 | pickup   | assigned | Assigned for pickup at 2PM
```

### **workflow_history table (Immutable Audit Trail)**
```
id      | orderId                                | eventType      | statusFrom      | statusTo        | staffId       | notes                          | timestamp
hist-1  | 550e8400-e29b-41d4-a716-446655440000 | order_created  | NULL            | Created         | NULL          | Order placed                   | 2026-05-20 10:30:00
hist-2  | 550e8400-e29b-41d4-a716-446655440000 | status_change  | Created         | Pending Pickup  | driver-uuid-1 | Driver assigned                | 2026-05-20 10:35:00
hist-3  | 550e8400-e29b-41d4-a716-446655440000 | task_assigned  | Pending Pickup  | Pickup Assigned | driver-uuid-1 | Pickup task assigned           | 2026-05-20 10:35:30
hist-4  | 550e8400-e29b-41d4-a716-446655440000 | status_change  | Pickup Assigned | Picked Up       | driver-uuid-1 | Collected at 2:15 PM           | 2026-05-20 10:45:00
```

---

## 🚨 State Machine Validation

The entire flow respects the valid transitions state machine:

```
Created
  ✅ Can transition to: "Pending Pickup"
  ❌ Cannot transition to: "Drying", "Delivered", etc.
  
Pending Pickup
  ✅ Can transition to: "Pickup Assigned"
  ❌ Cannot transition to: "Created", "Washing", etc.

Pickup Assigned
  ✅ Can transition to: "Picked Up"
  ❌ Cannot transition to: "Pending Pickup", "Completed", etc.

Picked Up
  ✅ Can transition to: "Received At Laundry"
  ❌ Cannot transition to: "Created", "Packing", etc.
```

**If you tried:**
```bash
# Invalid: Trying to jump from "Picked Up" directly to "Completed"
curl -X PUT http://localhost:3000/api/orders/ORD-50234/status \
  -H "Content-Type: application/json" \
  -d '{ "newStatus": "Completed", ... }'
```

**Response (400 Bad Request):**
```json
{
  "success": false,
  "error": "Invalid status transition: Cannot transition from 'Picked Up' to 'Completed'. Valid transitions: ['Received At Laundry']"
}
```

---

## 📊 Frontend Integration Example

After completing this flow, the frontend would display:

**Page: Order Details for ORD-50234**

```
┌─────────────────────────────────────────────┐
│ Order: ORD-50234                    📦      │
├─────────────────────────────────────────────┤
│                                             │
│ Customer: Rahul Sharma                      │
│ Phone: 9876543210                           │
│ Address: 123 MG Road, Bangalore             │
│                                             │
│ Items:                                      │
│   - Shirt × 5 (2.5 kg) - ₹125              │
│   - Pants × 3 (1.8 kg) - ₹90               │
│ Total: ₹215                                 │
│                                             │
│ Status: Picked Up (3/14)                    │
│ ████░░░░░░░░░░░░░░░░░░ 21% Complete       │
│                                             │
│ Timeline:                                   │
│ ✅ Created (10:30 AM)                      │
│ ✅ Pending Pickup (10:35 AM)               │
│ ✅ Pickup Assigned (10:35 AM)              │
│ ✅ Picked Up (10:45 AM)                    │
│    Vikram Patel: "Collected at 2:15 PM"   │
│ ⏳ Received At Laundry (pending)           │
│ ⏳ Sorting → Washing → ... → Completed    │
│                                             │
│ Assigned Staff:                             │
│ 👤 Vikram Patel (Driver)                   │
│    Performance: 4.8/5.0                     │
│    Area: North Bangalore                    │
│                                             │
└─────────────────────────────────────────────┘
```

---

## 🔌 Using Frontend Libraries

In the browser console:

```javascript
// Initialize state manager
await stateManager.initialize();

// Get order details
const order = await orderManager.getOrder('550e8400-e29b-41d4-a716-446655440000');
console.log(order);

// Get workflow info
const workflow = workflowEngine.generateSummary(order);
console.log(workflow);
// Output:
// {
//   currentStatus: "Picked Up",
//   currentStep: 3,
//   totalSteps: 14,
//   progress: 21,
//   label: "Picked Up",
//   icon: "fa-box-open",
//   color: "#4F46E5",
//   category: "receiving",
//   isComplete: false,
//   nextStatus: "Received At Laundry",
//   validTransitions: ["Received At Laundry"],
//   completedStatuses: ["Created", "Pending Pickup", "Pickup Assigned", "Picked Up"],
//   remainingStatuses: ["Received At Laundry", "Sorting", "Washing", ...]
// }

// Get timeline
const timeline = await orderManager.getTimeline('550e8400-e29b-41d4-a716-446655440000');
console.log(timeline);
// Shows all 4 history entries with timestamps

// Listen for changes
stateManager.on('orderSelected', (orderData) => {
  console.log('Order updated:', orderData);
  renderOrderDetails(orderData);
});

// Advance workflow
await workflowEngine.transitionOrder(
  '550e8400-e29b-41d4-a716-446655440000',
  'Received At Laundry',
  null,
  'Arrived at facility'
);
```

---

## 🐛 Troubleshooting Common Issues

### **Issue: "Connection refused"**
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```
**Solution:**
- PostgreSQL not running
- Check: `pg_isready -h localhost -p 5432`
- Start: Windows → Services → PostgreSQL Start

### **Issue: "password authentication failed"**
```
Error: password authentication failed for user "postgres"
```
**Solution:**
- Update `backend/.env` with correct password
- Default is usually: `postgres`
- Or reset: `ALTER USER postgres PASSWORD 'newpassword';`

### **Issue: "FATAL: database does not exist"**
```
Error: FATAL: database "freshfold" does not exist
```
**Solution:**
- Create database: `psql -U postgres -c "CREATE DATABASE freshfold;"`
- Load schema: `psql -U postgres -d freshfold -f database/schema.sql`

### **Issue: "Port 3000 in use"**
```
Error: listen EADDRINUSE: address already in use :::3000
```
**Solution:**
- Kill existing: `lsof -i :3000` then `kill -9 <PID>`
- Or change port in `.env`: `PORT=3001`

---

## ✅ What This Flow Demonstrates

✅ **Complete order creation** from customer registration to pickup  
✅ **Data integrity** with foreign keys and relationships  
✅ **State machine validation** (only valid transitions allowed)  
✅ **Audit trail** (immutable workflow history)  
✅ **Staff management** (assigned, tracked, linked to order)  
✅ **API contracts** (all endpoints with request/response examples)  
✅ **Database normalization** (no data duplication)  
✅ **Timestamps** (exact when everything happened)  
✅ **Error handling** (validation, constraints, responses)  
✅ **Frontend integration** (ready for UI components)  

---

## 🎯 Next Steps

1. **Fix PostgreSQL Connection**
   - Verify credentials in `.env`
   - Test: `node backend/migrate.js`
   - Should see: "✅ Database initialized successfully"

2. **Run Backend Server**
   - `npm run dev` from backend folder
   - Test: `curl http://localhost:3000/health`

3. **Test API Manually**
   - Use curl commands above
   - Or use Postman collection (to be created)
   - Verify responses match expected format

4. **Build UI Components** (Phase 2)
   - Create Order form
   - Order Details page
   - Workflow timeline display
   - Staff assignment interface

5. **Test Frontend Integration**
   - Initialize state manager
   - Create order via form
   - Watch workflow advance
   - View timeline in UI

---

## 📚 Related Documentation

- `SETUP_PHASE1.md` — Database & environment setup
- `PHASE1_README.md` — Architecture overview
- `backend/app.js` — API implementation (line-by-line commented)
- `backend/services/orderService.js` — Business logic
- `lib/workflow-engine.js` — Frontend workflow validation

---

**Status:** Complete order creation flow documented with all database queries, API responses, and integration examples.

**Ready to:** Execute API calls, verify database state, build UI components.
