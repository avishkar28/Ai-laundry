#!/usr/bin/env node

/**
 * Complete Order Creation Flow Test
 * Demonstrates the full workflow from order creation to status updates
 * Uses mock database for demonstration (works without PostgreSQL)
 */

const path = require('path');
const MockDatabase = require('./mock-database');

const db = new MockDatabase();

console.log('\n🚀 FreshFold Complete Order Creation Flow Test\n');
console.log('=' .repeat(60));

// ============================================================================
// STEP 1: Create Customer
// ============================================================================
console.log('\n📋 STEP 1: CREATE CUSTOMER\n');

const customerData = {
  name: 'Rahul Sharma',
  phone: '9876543210',
  email: 'rahul@example.com',
  address: '123 MG Road',
  city: 'Bangalore',
  pincode: '560001'
};

const customer = db.createCustomer(customerData);

console.log('Request:');
console.log('  POST /api/customers');
console.log('  Body:', JSON.stringify(customerData, null, 4));

console.log('\nResponse (201 Created):');
console.log(JSON.stringify({ success: true, customer }, null, 2));

// ============================================================================
// STEP 2: Create Order
// ============================================================================
console.log('\n' + '='.repeat(60));
console.log('\n📦 STEP 2: CREATE ORDER\n');

const orderData = {
  customerId: customer.id,
  serviceType: 'Wash & Fold',
  totalPrice: 215,
  pickupDate: '2026-05-21',
  deliveryDate: '2026-05-25',
  address: '123 MG Road, Bangalore',
  specialInstructions: 'Gentle wash, no bleach'
};

const order = db.createOrder(orderData);

console.log('Request:');
console.log('  POST /api/orders');
console.log('  Body:', JSON.stringify({
  ...orderData,
  items: [
    { itemType: 'Shirt', quantity: 5, weightKg: 2.5, serviceType: 'Wash & Fold', price: 125 },
    { itemType: 'Pants', quantity: 3, weightKg: 1.8, serviceType: 'Wash & Fold', price: 90 }
  ]
}, null, 4));

console.log('\nResponse (201 Created):');
console.log(JSON.stringify({
  success: true,
  order,
  message: `Order ${order.orderId} created successfully!`
}, null, 2));

// Add items
db.addOrderItem(order.id, {
  itemType: 'Shirt',
  quantity: 5,
  weightKg: 2.5,
  serviceType: 'Wash & Fold',
  price: 125
});

db.addOrderItem(order.id, {
  itemType: 'Pants',
  quantity: 3,
  weightKg: 1.8,
  serviceType: 'Wash & Fold',
  price: 90
});

// ============================================================================
// STEP 3: Retrieve Order Details
// ============================================================================
console.log('\n' + '='.repeat(60));
console.log('\n🔍 STEP 3: RETRIEVE ORDER DETAILS\n');

const completeOrder = db.getCompleteOrder(order.id);

console.log('Request:');
console.log(`  GET /api/orders/${order.id}`);

console.log('\nResponse (200 OK):');
console.log(JSON.stringify({
  success: true,
  order: completeOrder
}, null, 2));

// ============================================================================
// STEP 4: Get Available Drivers
// ============================================================================
console.log('\n' + '='.repeat(60));
console.log('\n👥 STEP 4: GET AVAILABLE DRIVERS\n');

const drivers = db.getStaffByRole('driver');

console.log('Request:');
console.log('  GET /api/staff/role/driver');

console.log('\nResponse (200 OK):');
console.log(JSON.stringify({
  success: true,
  staff: drivers,
  count: drivers.length
}, null, 2));

// ============================================================================
// STEP 5: Assign Pickup Staff
// ============================================================================
console.log('\n' + '='.repeat(60));
console.log('\n🚗 STEP 5: ASSIGN PICKUP STAFF\n');

const driver = drivers[0];
const assignment = db.assignStaff(order.id, driver.id, 'pickup', 'Assigned for pickup at 2PM');

// Update order status
db.updateOrderStatus(order.id, 'Pending Pickup', driver.id, 'Driver assigned');
db.updateOrderStatus(order.id, 'Pickup Assigned', driver.id, '');

console.log('Request:');
console.log(`  POST /api/orders/${order.id}/assign`);
console.log('  Body:', JSON.stringify({
  staffId: driver.id,
  taskType: 'pickup',
  notes: 'Assigned for pickup at 2PM'
}, null, 4));

console.log('\nResponse (201 Created):');
console.log(JSON.stringify({
  success: true,
  assignment,
  orderStatus: 'Pickup Assigned',
  message: `Pickup assigned to ${driver.name}`
}, null, 2));

// ============================================================================
// STEP 6: Move to "Picked Up"
// ============================================================================
console.log('\n' + '='.repeat(60));
console.log('\n✅ STEP 6: MARK PICKED UP\n');

db.updateOrderStatus(order.id, 'Picked Up', driver.id, 'Collected from customer at 2:15 PM');
const updatedOrder = db.getOrder(order.id);

console.log('Request:');
console.log(`  PUT /api/orders/${order.id}/status`);
console.log('  Body:', JSON.stringify({
  newStatus: 'Picked Up',
  staffId: driver.id,
  notes: 'Collected from customer at 2:15 PM'
}, null, 4));

console.log('\nResponse (200 OK):');
console.log(JSON.stringify({
  success: true,
  order: updatedOrder,
  message: `Order ${updatedOrder.orderId} status updated to '${updatedOrder.status}'`
}, null, 2));

// ============================================================================
// STEP 7: Get Workflow Timeline
// ============================================================================
console.log('\n' + '='.repeat(60));
console.log('\n📅 STEP 7: VIEW WORKFLOW TIMELINE\n');

const timeline = db.getWorkflowTimeline(order.id);

console.log('Request:');
console.log(`  GET /api/orders/${order.id}/timeline`);

console.log('\nResponse (200 OK):');
console.log(JSON.stringify({
  success: true,
  timeline
}, null, 2));

// ============================================================================
// DATABASE STATE SUMMARY
// ============================================================================
console.log('\n' + '='.repeat(60));
console.log('\n📊 FINAL DATABASE STATE\n');

console.log('Customers Table:');
console.log(JSON.stringify(completeOrder.customer, null, 2));

console.log('\nOrders Table:');
console.log(JSON.stringify(completeOrder.order, null, 2));

console.log('\nOrder Items Table:');
console.log(JSON.stringify(completeOrder.items, null, 2));

console.log('\nStaff Assignments Table:');
console.log(JSON.stringify(completeOrder.assignments, null, 2));

console.log('\nWorkflow History Table (Immutable Audit Trail):');
console.log(JSON.stringify(
  completeOrder.history.map(h => ({
    eventType: h.eventType,
    statusFrom: h.statusFrom,
    statusTo: h.statusTo,
    staffName: h.staffName,
    notes: h.notes,
    timestamp: h.timestamp
  })),
  null,
  2
));

// ============================================================================
// KEY METRICS
// ============================================================================
console.log('\n' + '='.repeat(60));
console.log('\n📈 KEY METRICS\n');

const statusMap = {
  'Created': 1,
  'Pending Pickup': 2,
  'Pickup Assigned': 3,
  'Picked Up': 4,
  'Received At Laundry': 5,
  'Sorting': 6,
  'Washing': 7,
  'Drying': 8,
  'Ironing': 9,
  'Folding': 10,
  'Packing': 11,
  'Quality Check': 12,
  'Out For Delivery': 13,
  'Delivered': 14,
  'Completed': 15
};

const currentStep = statusMap[updatedOrder.status];
const totalSteps = 15;
const progress = Math.round((currentStep / totalSteps) * 100);

console.log(`Order ID: ${updatedOrder.orderId}`);
console.log(`Customer: ${completeOrder.customer.name}`);
console.log(`Items: ${completeOrder.items.length} (${completeOrder.items.reduce((sum, i) => sum + i.quantity, 0)} total)`);
console.log(`Total Price: ₹${updatedOrder.totalPrice}`);
console.log(`Current Status: ${updatedOrder.status}`);
console.log(`Progress: ${progress}% (${currentStep}/${totalSteps} steps)`);
console.log(`Assigned Staff: ${completeOrder.assignments[0]?.staffId ? driver.name : 'None'} (${driver?.role})`);
console.log(`Timeline Events: ${completeOrder.history.length}`);
console.log(`Pickup Date: ${updatedOrder.pickupDate}`);
console.log(`Delivery Date: ${updatedOrder.deliveryDate}`);

// ============================================================================
// VALIDATION CHECKS
// ============================================================================
console.log('\n' + '='.repeat(60));
console.log('\n✓ VALIDATION CHECKS\n');

const checks = [
  { name: 'Customer created', pass: !!completeOrder.customer },
  { name: 'Order created', pass: !!completeOrder.order },
  { name: 'Order items added', pass: completeOrder.items.length === 2 },
  { name: 'Staff assigned', pass: completeOrder.assignments.length > 0 },
  { name: 'Status transitioned correctly', pass: updatedOrder.status === 'Picked Up' },
  { name: 'Workflow history recorded', pass: completeOrder.history.length > 0 },
  { name: 'Order ID format correct', pass: /^ORD-\d{5}$/.test(updatedOrder.orderId) },
  { name: 'All timestamps present', pass: updatedOrder.createdAt && updatedOrder.updatedAt }
];

checks.forEach(check => {
  console.log(`  ${check.pass ? '✅' : '❌'} ${check.name}`);
});

const allPassed = checks.every(c => c.pass);
console.log(`\n${allPassed ? '✅ All checks passed!' : '❌ Some checks failed'}`);

// ============================================================================
// EXPORT AND SAVE
// ============================================================================
console.log('\n' + '='.repeat(60));
console.log('\n💾 EXPORTING DATA\n');

const exportPath = db.saveToFile(path.join(__dirname, '../mock-db-state.json'));
console.log(`✓ Database state exported to: ${exportPath}`);

console.log('\n' + '='.repeat(60));
console.log('\n✅ TEST COMPLETE - Order Creation Flow Successful!\n');
console.log('📚 This demonstrates:');
console.log('   • Customer registration');
console.log('   • Order creation with items');
console.log('   • Staff assignment for pickup');
console.log('   • Status transitions through workflow');
console.log('   • Complete immutable audit trail');
console.log('   • Data relationships and integrity\n');
