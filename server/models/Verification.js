import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Verification = sequelize.define('Verification', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  workerId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  documentType: {
    type: DataTypes.ENUM('aadhaar', 'pan', 'voter_id', 'driving_license'),
    allowNull: false
  },
  documentNumber: {
    type: DataTypes.STRING,
    allowNull: false
  },
  fileUrl: {
    type: DataTypes.STRING,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'verified', 'rejected'),
    defaultValue: 'pending'
  },
  rejectionReason: {
    type: DataTypes.STRING,
    defaultValue: ''
  },
  reviewedBy: {
    type: DataTypes.UUID,
    allowNull: true
  },
  reviewedAt: {
    type: DataTypes.DATE,
    allowNull: true
  }
});

export default Verification;
