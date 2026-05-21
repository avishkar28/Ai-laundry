const { DataTypes } = require('sequelize');
const sequelize = require('../config');

const Staff = sequelize.define('Staff', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  email: DataTypes.STRING,
  role: {
    type: DataTypes.ENUM(
      'admin', 'manager', 'driver', 'washer', 'ironing_staff', 
      'qc_specialist', 'delivery_staff', 'pickup_staff'
    ),
    allowNull: false
  },
  performanceScore: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 0
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'on_leave'),
    defaultValue: 'active'
  },
  assignedArea: DataTypes.STRING
}, {
  tableName: 'staff',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['role'] },
    { fields: ['status'] }
  ]
});

module.exports = Staff;
