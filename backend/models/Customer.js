const { DataTypes } = require('sequelize');
const sequelize = require('../config');

const Customer = sequelize.define('Customer', {
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
  address: DataTypes.TEXT,
  city: {
    type: DataTypes.STRING,
    defaultValue: 'Bangalore'
  },
  pincode: DataTypes.STRING,
  preferredDeliveryTime: DataTypes.STRING
}, {
  tableName: 'customers',
  timestamps: true,
  underscored: true
});

module.exports = Customer;
