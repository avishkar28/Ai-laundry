const { DataTypes } = require('sequelize');
const sequelize = require('../config');

const WorkflowHistory = sequelize.define('WorkflowHistory', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  orderId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  eventType: {
    type: DataTypes.STRING,
    allowNull: false
  },
  statusFrom: DataTypes.STRING,
  statusTo: {
    type: DataTypes.STRING,
    allowNull: false
  },
  staffId: DataTypes.UUID,
  notes: DataTypes.TEXT,
  aiAction: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  timestamp: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'workflow_history',
  timestamps: false,
  underscored: true,
  indexes: [
    { fields: ['orderId'] },
    { fields: ['timestamp'] },
    { fields: ['eventType'] }
  ]
});

module.exports = WorkflowHistory;
