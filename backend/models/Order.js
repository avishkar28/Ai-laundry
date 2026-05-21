const { DataTypes } = require('sequelize');
const sequelize = require('../config');

const Order = sequelize.define('Order', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  orderId: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true
  },
  customerId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM(
      'Created', 'Pending Pickup', 'Pickup Assigned', 'Picked Up', 
      'Received At Laundry', 'Sorting', 'Washing', 'Drying', 'Ironing', 
      'Folding', 'Packing', 'Quality Check', 'Out For Delivery', 
      'Delivered', 'Completed'
    ),
    defaultValue: 'Created'
  },
  totalPrice: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  pickupDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  deliveryDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  deliveryAddress: DataTypes.TEXT,
  specialInstructions: DataTypes.TEXT,
  completedAt: DataTypes.DATE
}, {
  tableName: 'orders',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['status'] },
    { fields: ['customerId'] },
    { fields: ['createdAt'] },
    { fields: ['orderId'] }
  ]
});

module.exports = Order;
