import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const FraudAlert = sequelize.define('FraudAlert', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  type: {
    type: DataTypes.ENUM('spam_reviews', 'login_spikes', 'application_spam', 'duplicate_profile'),
    allowNull: false
  },
  severity: {
    type: DataTypes.ENUM('low', 'medium', 'high'),
    defaultValue: 'low'
  },
  status: {
    type: DataTypes.ENUM('open', 'resolved', 'dismissed'),
    defaultValue: 'open'
  },
  targetUser: {
    type: DataTypes.UUID,
    allowNull: false
  },
  details: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  metadata: {
    type: DataTypes.JSON,
    defaultValue: {}
  },
  resolvedBy: {
    type: DataTypes.UUID,
    allowNull: true
  },
  resolvedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  resolutionNotes: {
    type: DataTypes.TEXT,
    defaultValue: ''
  }
});

export default FraudAlert;
