import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Worker = sequelize.define('Worker', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    unique: true
  },
  headline: {
    type: DataTypes.STRING,
    allowNull: false
  },
  skills: {
    type: DataTypes.JSON, // Array of strings
    defaultValue: []
  },
  experience: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  certifications: {
    type: DataTypes.JSON, // Array of { name, docUrl }
    defaultValue: []
  },
  languages: {
    type: DataTypes.JSON, // Array of strings
    defaultValue: ['English']
  },
  availabilityCalendar: {
    type: DataTypes.JSON, // Array of { day, slots: [] }
    defaultValue: []
  },
  portfolio: {
    type: DataTypes.JSON, // Array of { imageUrl, title }
    defaultValue: []
  },
  verificationStatus: {
    type: DataTypes.ENUM('pending', 'verified', 'rejected'),
    defaultValue: 'pending'
  },
  aiReviewSummary: {
    type: DataTypes.JSON, // { text, generatedAt }
    defaultValue: { text: '', generatedAt: null }
  },
  isDeleted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
});

export default Worker;
