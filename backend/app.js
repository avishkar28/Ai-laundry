const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const sequelize = require('./config');
const { Customer, Order, OrderItem, Staff, StaffAssignment, WorkflowHistory } = require('./models');
const orderService = require('./services/orderService');
const staffService = require('./services/staffService');

const app = express();

// ─── MIDDLEWARE ────────────────────────────────────────────────────────────

app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── ERROR HANDLING MIDDLEWARE ────────────────────────────────────────────────

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// ─── HEALTH CHECK ────────────────────────────────────────────────────────────

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'FreshFold Backend API running' });
});

// ─── ORDERS ENDPOINTS ────────────────────────────────────────────────────────

/**
 * POST /api/orders
 * Create a new order
 */
app.post('/api/orders', asyncHandler(async (req, res) => {
  const { customerData, items, serviceType, dates, specialInstructions } = req.body;

  if (!customerData || !items || !serviceType || !dates) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const result = await orderService.createOrder(
    customerData,
    items,
    serviceType,
    dates,
    specialInstructions
  );

  if (result.success) {
    res.status(201).json(result);
  } else {
    res.status(400).json(result);
  }
}));

/**
 * GET /api/orders
 * Get all orders with optional filters
 */
app.get('/api/orders', asyncHandler(async (req, res) => {
  const { status, customerId, limit, offset } = req.query;
  
  const filters = {
    status,
    customerId,
    limit: parseInt(limit) || 20,
    offset: parseInt(offset) || 0
  };

  const orders = await orderService.getAllOrders(filters);
  res.json({ success: true, orders });
}));

/**
 * GET /api/orders/:orderId
 * Get order details with full history
 */
app.get('/api/orders/:orderId', asyncHandler(async (req, res) => {
  const order = await orderService.getOrderDetails(req.params.orderId);
  
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }

  res.json({ success: true, order });
}));

/**
 * PUT /api/orders/:orderId/status
 * Update order status
 */
app.put('/api/orders/:orderId/status', asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const { newStatus, staffId, notes } = req.body;

  if (!newStatus) {
    return res.status(400).json({ error: 'newStatus is required' });
  }

  const result = await orderService.updateOrderStatus(orderId, newStatus, staffId, notes);

  if (result.success) {
    res.json(result);
  } else {
    res.status(400).json(result);
  }
}));

/**
 * GET /api/orders/:orderId/timeline
 * Get workflow timeline for order
 */
app.get('/api/orders/:orderId/timeline', asyncHandler(async (req, res) => {
  const timeline = await orderService.getWorkflowTimeline(req.params.orderId);
  res.json({ success: true, timeline });
}));

// ─── STAFF ENDPOINTS ────────────────────────────────────────────────────────

/**
 * GET /api/staff
 * Get all staff with optional filters
 */
app.get('/api/staff', asyncHandler(async (req, res) => {
  const { role, status } = req.query;
  
  const filters = { role, status };
  const staff = await staffService.getAllStaff(filters);
  
  res.json({ success: true, staff });
}));

/**
 * GET /api/staff/:staffId
 * Get staff details and workload
 */
app.get('/api/staff/:staffId', asyncHandler(async (req, res) => {
  const workload = await staffService.getStaffWorkload(req.params.staffId);
  
  if (!workload) {
    return res.status(404).json({ error: 'Staff member not found' });
  }

  res.json({ success: true, ...workload });
}));

/**
 * GET /api/staff/role/:role
 * Get staff by role
 */
app.get('/api/staff/role/:role', asyncHandler(async (req, res) => {
  const staff = await staffService.getStaffByRole(req.params.role);
  res.json({ success: true, staff });
}));

// ─── STAFF ASSIGNMENTS ENDPOINTS ────────────────────────────────────────────

/**
 * POST /api/orders/:orderId/assign
 * Assign staff to order task
 */
app.post('/api/orders/:orderId/assign', asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const { staffId, taskType, notes } = req.body;

  if (!staffId || !taskType) {
    return res.status(400).json({ error: 'staffId and taskType are required' });
  }

  const result = await orderService.assignStaffToTask(orderId, staffId, taskType, notes);

  if (result.success) {
    res.json(result);
  } else {
    res.status(400).json(result);
  }
}));

// ─── CUSTOMERS ENDPOINTS ────────────────────────────────────────────────────

/**
 * GET /api/customers/:phone
 * Search customer by phone
 */
app.get('/api/customers/:phone', asyncHandler(async (req, res) => {
  const customer = await Customer.findOne({
    where: { phone: req.params.phone }
  });

  if (!customer) {
    return res.status(404).json({ error: 'Customer not found' });
  }

  res.json({ success: true, customer });
}));

/**
 * POST /api/customers
 * Create new customer
 */
app.post('/api/customers', asyncHandler(async (req, res) => {
  const { name, phone, email, address, city } = req.body;

  if (!name || !phone) {
    return res.status(400).json({ error: 'name and phone are required' });
  }

  const customer = await Customer.create({
    name,
    phone,
    email,
    address,
    city: city || 'Bangalore'
  });

  res.status(201).json({ success: true, customer });
}));

// ─── WORKFLOW ENDPOINTS ────────────────────────────────────────────────────

/**
 * GET /api/workflows/:orderId
 * Get current workflow state
 */
app.get('/api/workflows/:orderId', asyncHandler(async (req, res) => {
  const order = await Order.findByPk(req.params.orderId, {
    attributes: ['id', 'orderId', 'status', 'createdAt', 'updatedAt']
  });

  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }

  const validTransitions = orderService.VALID_TRANSITIONS[order.status] || [];

  res.json({
    success: true,
    currentStatus: order.status,
    validNextStatuses: validTransitions,
    order
  });
}));

/**
 * POST /api/workflows/execute
 * Execute workflow step (called by LangGraph agent)
 */
app.post('/api/workflows/execute', asyncHandler(async (req, res) => {
  const { orderId, action, staffId, notes } = req.body;

  if (!orderId || !action) {
    return res.status(400).json({ error: 'orderId and action are required' });
  }

  const order = await Order.findByPk(orderId);
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }

  // Execute action based on type
  let result;
  switch (action.type) {
    case 'update_status':
      result = await orderService.updateOrderStatus(orderId, action.newStatus, staffId, notes);
      break;
    case 'assign_staff':
      result = await orderService.assignStaffToTask(orderId, staffId, action.taskType, notes);
      break;
    default:
      return res.status(400).json({ error: 'Unknown action type' });
  }

  if (result.success) {
    res.json(result);
  } else {
    res.status(400).json(result);
  }
}));

// ─── AI ENDPOINTS (Integration with LangGraph) ────────────────────────────────

/**
 * POST /api/ai/detect-workflow
 * Detect current workflow context
 */
app.post('/api/ai/detect-workflow', asyncHandler(async (req, res) => {
  const { orderId, currentPage } = req.body;

  let workflowContext = {
    page: currentPage,
    detectedWorkflow: null,
    suggestedAction: null
  };

  if (orderId) {
    const order = await Order.findByPk(orderId);
    if (order) {
      workflowContext.currentStatus = order.status;
      workflowContext.detectedWorkflow = determineWorkflow(order.status);
      workflowContext.suggestedAction = getNextAction(order.status);
    }
  }

  res.json({ success: true, workflowContext });
}));

/**
 * POST /api/ai/get-hints
 * Get AI hints for next steps
 */
app.post('/api/ai/get-hints', asyncHandler(async (req, res) => {
  const { orderId, currentStep } = req.body;

  const order = await Order.findByPk(orderId, {
    include: [
      { association: 'customer' },
      { association: 'assignments' }
    ]
  });

  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }

  const hints = generateHints(order, currentStep);

  res.json({ success: true, hints });
}));

// ─── HELPER FUNCTIONS ────────────────────────────────────────────────────────

function determineWorkflow(status) {
  if (status === 'Created' || status === 'Pending Pickup') return 'create_order';
  if (status === 'Pending Pickup' || status === 'Pickup Assigned') return 'assign_pickup';
  if (status === 'Picked Up' || status === 'Received At Laundry') return 'receiving';
  if (status === 'Sorting' || status === 'Washing' || status === 'Drying' || 
      status === 'Ironing' || status === 'Folding') return 'processing';
  if (status === 'Packing' || status === 'Quality Check') return 'packing_qc';
  if (status === 'Out For Delivery' || status === 'Delivered') return 'delivery';
  return 'general';
}

function getNextAction(status) {
  const nextStatuses = orderService.VALID_TRANSITIONS[status];
  if (!nextStatuses || nextStatuses.length === 0) return null;
  return nextStatuses[0];
}

function generateHints(order, currentStep) {
  const statusHints = {
    'Pending Pickup': 'Assign a pickup driver to collect the laundry from the customer.',
    'Pickup Assigned': 'Confirm pickup has been completed by marking "Picked Up".',
    'Received At Laundry': 'Sort items and begin washing process.',
    'Sorting': 'Separate items by type and color, then move to washing station.',
    'Washing': 'Run wash cycle based on item types.',
    'Drying': 'Transfer washed items to drying machines.',
    'Ironing': 'Iron pressed items as required by service type.',
    'Folding': 'Fold items neatly and prepare for packing.',
    'Packing': 'Pack items in clean bags and prepare for QC.',
    'Quality Check': 'Perform quality verification before marking for delivery.'
  };

  return {
    currentStatus: order.status,
    hint: statusHints[order.status] || 'Proceed to next stage in workflow.',
    suggestedDuration: '15-30 minutes',
    nextSteps: orderService.VALID_TRANSITIONS[order.status] || []
  };
}

// ─── ERROR HANDLING ────────────────────────────────────────────────────────

app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ─── START SERVER ────────────────────────────────────────────────────────

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    // Sync database (comment out in production to avoid dropping tables)
    // await sequelize.sync({ alter: true });
    
    app.listen(PORT, () => {
      console.log(`✅ FreshFold Backend API running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

module.exports = app;
