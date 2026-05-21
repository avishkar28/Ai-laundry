const { DataTypes } = require('sequelize');
const sequelize = require('../config');

const StaffAssignment = sequelize.define('StaffAssignment', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  orderId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  staffId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  taskType: {
    type: DataTypes.ENUM(
      'pickup', 'sorting', 'washing', 'drying', 'ironing', 
      'folding', 'packing', 'quality_check', 'delivery'
    ),
    allowNull: false
  },
  completedAt: DataTypes.DATE,
  status: {
    type: DataTypes.ENUM('assigned', 'in_progress', 'completed', 'failed'),
    defaultValue: 'assigned'
  },
  notes: DataTypes.TEXT
}, {
  tableName: 'staff_assignments',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['orderId'] },
    { fields: ['staffId'] },
    { fields: ['taskType'] }
  ]
});

module.exports = StaffAssignment;
