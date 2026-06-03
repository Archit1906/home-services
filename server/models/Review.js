import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Review = sequelize.define('Review', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  fromId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  toId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  jobId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  rating: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 5
    }
  },
  text: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  ownerResponse: {
    type: DataTypes.TEXT,
    defaultValue: ''
  },
  helpfulCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  isDeleted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
});

export default Review;
