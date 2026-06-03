import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Conversation = sequelize.define('Conversation', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  jobId: {
    type: DataTypes.UUID,
    allowNull: true
  },
  lastMessageContent: {
    type: DataTypes.TEXT,
    defaultValue: ''
  },
  lastMessageSenderId: {
    type: DataTypes.UUID,
    allowNull: true
  },
  lastMessageSentAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  isDeleted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
});

export default Conversation;
