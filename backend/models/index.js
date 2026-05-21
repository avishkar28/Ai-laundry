const Customer = require('./Customer');
const Order = require('./Order');
const OrderItem = require('./OrderItem');
const Staff = require('./Staff');
const StaffAssignment = require('./StaffAssignment');
const WorkflowHistory = require('./WorkflowHistory');

// Define relationships
Customer.hasMany(Order, { foreignKey: 'customerId', as: 'orders' });
Order.belongsTo(Customer, { foreignKey: 'customerId', as: 'customer' });

Order.hasMany(OrderItem, { foreignKey: 'orderId', as: 'items' });
OrderItem.belongsTo(Order, { foreignKey: 'orderId' });

Order.hasMany(StaffAssignment, { foreignKey: 'orderId', as: 'assignments' });
StaffAssignment.belongsTo(Order, { foreignKey: 'orderId' });

Staff.hasMany(StaffAssignment, { foreignKey: 'staffId', as: 'assignments' });
StaffAssignment.belongsTo(Staff, { foreignKey: 'staffId', as: 'staff' });

Order.hasMany(WorkflowHistory, { foreignKey: 'orderId', as: 'history' });
WorkflowHistory.belongsTo(Order, { foreignKey: 'orderId' });

WorkflowHistory.belongsTo(Staff, { foreignKey: 'staffId', as: 'staff' });

module.exports = {
  Customer,
  Order,
  OrderItem,
  Staff,
  StaffAssignment,
  WorkflowHistory
};
