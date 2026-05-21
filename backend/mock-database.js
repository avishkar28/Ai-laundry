/**
 * Mock Database System
 * Simulates PostgreSQL for demonstration purposes
 * Stores all data in memory and can export to JSON
 */

const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

class MockDatabase {
  constructor() {
    this.customers = new Map();
    this.orders = new Map();
    this.orderItems = new Map();
    this.staff = new Map();
    this.staffAssignments = new Map();
    this.workflowHistory = new Map();
    
    this.idCounters = {
      orders: 50000
    };
    
    this.initSampleData();
  }

  initSampleData() {
    // Add sample staff
    const staffData = [
      { name: 'Vikram Patel', phone: '9988776655', role: 'driver', performanceScore: 4.8, assignedArea: 'North Bangalore' },
      { name: 'Anjali Desai', phone: '8877665544', role: 'driver', performanceScore: 4.6, assignedArea: 'South Bangalore' },
      { name: 'Rajesh Kumar', phone: '7766554433', role: 'washer', performanceScore: 4.9, assignedArea: 'Central' },
      { name: 'Priya Singh', phone: '6655443322', role: 'qc_specialist', performanceScore: 4.7, assignedArea: 'All' },
      { name: 'Amit Sharma', phone: '5544332211', role: 'folder', performanceScore: 4.5, assignedArea: 'East Bangalore' },
      { name: 'Maya Verma', phone: '4433221100', role: 'ironer', performanceScore: 4.8, assignedArea: 'West Bangalore' }
    ];

    staffData.forEach(staff => {
      const id = uuidv4();
      this.staff.set(id, {
        id,
        ...staff,
        status: 'available',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    });
  }

  // ============= CUSTOMERS =============
  createCustomer(data) {
    const id = uuidv4();
    const customer = {
      id,
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.customers.set(id, customer);
    return customer;
  }

  searchCustomerByPhone(phone) {
    for (const customer of this.customers.values()) {
      if (customer.phone === phone) return customer;
    }
    return null;
  }

  // ============= ORDERS =============
  createOrder(data) {
    const id = uuidv4();
    this.idCounters.orders++;
    const orderId = `ORD-${this.idCounters.orders}`;

    const order = {
      id,
      orderId,
      status: 'Created',
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      completedAt: null
    };

    this.orders.set(id, order);

    // Record in workflow history
    this.recordWorkflowEvent(id, 'order_created', null, 'Created', null, 'Order placed');

    return order;
  }

  getOrder(orderId) {
    return this.orders.get(orderId);
  }

  updateOrderStatus(orderId, newStatus, staffId, notes) {
    const order = this.orders.get(orderId);
    if (!order) return null;

    const oldStatus = order.status;
    order.status = newStatus;
    order.updatedAt = new Date().toISOString();

    if (newStatus === 'Completed') {
      order.completedAt = new Date().toISOString();
    }

    this.recordWorkflowEvent(orderId, 'status_change', oldStatus, newStatus, staffId, notes);
    return order;
  }

  getAllOrders() {
    return Array.from(this.orders.values());
  }

  // ============= ORDER ITEMS =============
  addOrderItem(orderId, itemData) {
    const id = uuidv4();
    const item = {
      id,
      orderId,
      ...itemData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.orderItems.set(id, item);
    return item;
  }

  getOrderItems(orderId) {
    return Array.from(this.orderItems.values()).filter(item => item.orderId === orderId);
  }

  // ============= STAFF ASSIGNMENTS =============
  assignStaff(orderId, staffId, taskType, notes) {
    const id = uuidv4();
    const assignment = {
      id,
      orderId,
      staffId,
      taskType,
      status: 'assigned',
      notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.staffAssignments.set(id, assignment);

    // Also record in workflow history
    const staff = this.staff.get(staffId);
    this.recordWorkflowEvent(orderId, 'task_assigned', null, null, staffId, `${taskType} assigned to ${staff.name}`);

    return assignment;
  }

  getStaffAssignments(orderId) {
    return Array.from(this.staffAssignments.values()).filter(a => a.orderId === orderId);
  }

  getStaffByRole(role) {
    return Array.from(this.staff.values()).filter(s => s.role === role);
  }

  // ============= WORKFLOW HISTORY =============
  recordWorkflowEvent(orderId, eventType, statusFrom, statusTo, staffId, notes) {
    const id = uuidv4();
    const event = {
      id,
      orderId,
      eventType,
      statusFrom,
      statusTo,
      staffId,
      notes,
      timestamp: new Date().toISOString()
    };
    this.workflowHistory.set(id, event);
    return event;
  }

  getWorkflowTimeline(orderId) {
    const events = Array.from(this.workflowHistory.values())
      .filter(e => e.orderId === orderId)
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    // Enrich with staff names
    return events.map(e => ({
      ...e,
      staffName: e.staffId ? this.staff.get(e.staffId)?.name : null
    }));
  }

  // ============= COMPLETE ORDER VIEW =============
  getCompleteOrder(orderId) {
    const order = this.getOrder(orderId);
    if (!order) return null;

    const customer = this.customers.get(order.customerId);
    const items = this.getOrderItems(orderId);
    const assignments = this.getStaffAssignments(orderId);
    const history = this.getWorkflowTimeline(orderId);

    return {
      order,
      customer,
      items,
      assignments,
      history
    };
  }

  // ============= EXPORT =============
  exportToJSON() {
    return {
      timestamp: new Date().toISOString(),
      customers: Array.from(this.customers.values()),
      orders: Array.from(this.orders.values()),
      orderItems: Array.from(this.orderItems.values()),
      staff: Array.from(this.staff.values()),
      staffAssignments: Array.from(this.staffAssignments.values()),
      workflowHistory: Array.from(this.workflowHistory.values())
    };
  }

  saveToFile(filename = 'mock-db-export.json') {
    const data = this.exportToJSON();
    fs.writeFileSync(filename, JSON.stringify(data, null, 2));
    return filename;
  }
}

module.exports = MockDatabase;
