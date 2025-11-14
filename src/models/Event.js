const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Event = sequelize.define('Event', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  appId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'apps',
      key: 'id'
    }
  },
  event: {
    type: DataTypes.STRING,
    allowNull: false
  },
  url: {
    type: DataTypes.TEXT
  },
  referrer: {
    type: DataTypes.TEXT
  },
  device: {
    type: DataTypes.STRING
  },
  ipAddress: {
    type: DataTypes.STRING
  },
  userId: {
    type: DataTypes.STRING,
    allowNull: true
  },
  metadata: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  timestamp: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'events',
  timestamps: true,
  indexes: [
    { fields: ['appId'] },
    { fields: ['event'] },
    { fields: ['timestamp'] },
    { fields: ['userId'] },
    { fields: ['appId', 'event', 'timestamp'] }
  ]
});

module.exports = Event;