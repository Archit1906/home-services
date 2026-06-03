import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Job = sequelize.define('Job', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  serviceType: {
    type: DataTypes.STRING,
    allowNull: false
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  budget: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 0
    }
  },
  hours: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  experience: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  gender: {
    type: DataTypes.STRING,
    defaultValue: 'Any'
  },
  language: {
    type: DataTypes.JSON, // Array of strings
    defaultValue: []
  },
  startDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  address: {
    type: DataTypes.STRING,
    allowNull: false
  },
  lat: {
    type: DataTypes.DOUBLE,
    allowNull: false
  },
  lng: {
    type: DataTypes.DOUBLE,
    allowNull: false
  },
  radius: {
    type: DataTypes.INTEGER,
    defaultValue: 10
  },
  isEmergency: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  status: {
    type: DataTypes.ENUM('open', 'closed', 'assigned'),
    defaultValue: 'open'
  },
  aiMatchCache: {
    type: DataTypes.JSON, // Array of { workerId, score, explanation }
    defaultValue: []
  },
  isDeleted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
});

export default Job;
