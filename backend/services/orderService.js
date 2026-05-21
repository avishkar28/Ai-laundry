const { v4: uuidv4 } = require('uuid');
const { Order, OrderItem, Customer, WorkflowHistory, StaffAssignment } = require('../models');

// Generate unique order ID (ORD-XXXXX format)
function generateOrderId() {
  const randomNum = Math.floor(Math.random() * 90000) + 10000; // 10000-99999
  return `ORD-${randomNum}`;
}

// Create new order with items
async function createOrder(customerData, items, serviceType, dates, specialInstructions) {
  try {
    // Find or create customer
    let customer = await Customer.findOne({ where: { phone: customerData.phone } });
    
    if (!customer) {
      customer = await Customer.create({
        name: customerData.name,
        phone: customerData.phone,
        email: customerData.email || null,
        address: customerData.address,
        city: customerData.city || 'Bangalore'
      });
    }

    // Calculate total price
    let totalPrice = 0;
    items.forEach(item => {
      totalPrice += item.price;
    });

    // Create order
    const orderId = generateOrderId();
    const order = await Order.create({
      orderId,
      customerId: customer.id,
      status: 'Created',
      totalPrice,
      pickupDate: dates.pickupDate,
      deliveryDate: dates.deliveryDate,
      specialInstructions,
      deliveryAddress: customerData.address
    });

    // Create order items
    for (const item of items) {
      await OrderItem.create({
        orderId: order.id,
        itemType: item.itemType,
        quantity: item.quantity,
        weightKg: item.weightKg || null,
        serviceType,
        price: item.price
      });
    }

    // Create workflow history entry (order creation)
    await WorkflowHistory.create({
      orderId: order.id,
      eventType: 'order_created',
      statusFrom: null,
      statusTo: 'Created',
      notes: 'Order created successfully'
    });

    return {
      success: true,
      order: await getOrderDetails(order.id),
      message: `Order ${orderId} created successfully`
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Get order details with all relationships
async function getOrderDetails(orderId) {
  try {
    const order = await Order.findByPk(orderId, {
      include: [
        { association: 'customer', attributes: ['id', 'name', 'phone', 'email', 'address'] },
        { association: 'items' },
        { 
          association: 'assignments',
          include: [{ association: 'staff', attributes: ['id', 'name', 'role', 'phone'] }]
        },
        {
          association: 'history',
          include: [{ association: 'staff', attributes: ['id', 'name', 'role'] }],
          order: [['timestamp', 'ASC']]
        }
      ]
    });

    return order;
  } catch (error) {
    throw new Error(`Failed to get order details: ${error.message}`);
  }
}

// Get all orders with filters
async function getAllOrders(filters = {}) {
  try {
    const where = {};
    
    if (filters.status) where.status = filters.status;
    if (filters.customerId) where.customerId = filters.customerId;
    if (filters.dateFrom) where.createdAt = { $gte: filters.dateFrom };

    const orders = await Order.findAll({
      where,
      include: [
        { association: 'customer', attributes: ['name', 'phone'] },
        { association: 'items', attributes: ['itemType', 'quantity', 'serviceType', 'price'] }
      ],
      limit: filters.limit || 20,
      offset: filters.offset || 0,
      order: [['createdAt', 'DESC']]
    });

    return orders;
  } catch (error) {
    throw new Error(`Failed to get orders: ${error.message}`);
  }
}

// Valid status transitions
const VALID_TRANSITIONS = {
  'Created': ['Pending Pickup'],
  'Pending Pickup': ['Pickup Assigned'],
  'Pickup Assigned': ['Picked Up'],
  'Picked Up': ['Received At Laundry'],
  'Received At Laundry': ['Sorting'],
  'Sorting': ['Washing'],
  'Washing': ['Drying'],
  'Drying': ['Ironing'],
  'Ironing': ['Folding'],
  'Folding': ['Packing'],
  'Packing': ['Quality Check'],
  'Quality Check': ['Out For Delivery', 'Sorting'], // Can go back if failed
  'Out For Delivery': ['Delivered'],
  'Delivered': ['Completed']
};

// Update order status with validation
async function updateOrderStatus(orderId, newStatus, staffId = null, notes = '') {
  try {
    const order = await Order.findByPk(orderId);
    
    if (!order) {
      return { success: false, error: 'Order not found' };
    }

    const currentStatus = order.status;
    const validNextStatuses = VALID_TRANSITIONS[currentStatus];

    if (!validNextStatuses || !validNextStatuses.includes(newStatus)) {
      return { 
        success: false, 
        error: `Cannot transition from ${currentStatus} to ${newStatus}. Valid transitions: ${validNextStatuses?.join(', ')}` 
      };
    }

    // Update order
    await order.update({
      status: newStatus,
      updatedAt: new Date(),
      completedAt: newStatus === 'Completed' ? new Date() : order.completedAt
    });

    // Record in workflow history
    await WorkflowHistory.create({
      orderId: order.id,
      eventType: 'status_changed',
      statusFrom: currentStatus,
      statusTo: newStatus,
      staffId,
      notes,
      aiAction: false
    });

    return {
      success: true,
      order: await getOrderDetails(orderId),
      message: `Order status updated to ${newStatus}`
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Assign staff to order task
async function assignStaffToTask(orderId, staffId, taskType, notes = '') {
  try {
    const order = await Order.findByPk(orderId);
    if (!order) return { success: false, error: 'Order not found' };

    // Create staff assignment
    const assignment = await StaffAssignment.create({
      orderId,
      staffId,
      taskType,
      status: 'assigned',
      notes
    });

    // Record in workflow history
    await WorkflowHistory.create({
      orderId,
      eventType: 'staff_assigned',
      statusFrom: null,
      statusTo: `${taskType}_assigned`,
      staffId,
      notes: `Assigned ${taskType} to staff member`
    });

    return {
      success: true,
      assignment,
      message: `Staff assigned to ${taskType} task`
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Get workflow timeline for order
async function getWorkflowTimeline(orderId) {
  try {
    const history = await WorkflowHistory.findAll({
      where: { orderId },
      include: [{ association: 'staff', attributes: ['name', 'role'] }],
      order: [['timestamp', 'ASC']]
    });

    return history;
  } catch (error) {
    throw new Error(`Failed to get workflow timeline: ${error.message}`);
  }
}

module.exports = {
  createOrder,
  getOrderDetails,
  getAllOrders,
  updateOrderStatus,
  assignStaffToTask,
  getWorkflowTimeline,
  VALID_TRANSITIONS,
  generateOrderId
};
