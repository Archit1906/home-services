import User from './User.js';
import Worker from './Worker.js';
import Job from './Job.js';
import Application from './Application.js';
import Conversation from './Conversation.js';
import ConversationParticipant from './ConversationParticipant.js';
import Message from './Message.js';
import Review from './Review.js';
import Verification from './Verification.js';
import FraudAlert from './FraudAlert.js';

// Setup associations

// User <-> Worker (One-to-One)
User.hasOne(Worker, { foreignKey: 'userId', as: 'worker' });
Worker.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// User <-> Job (One-to-Many)
User.hasMany(Job, { foreignKey: 'userId', as: 'jobs' });
Job.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Job <-> Application (One-to-Many)
Job.hasMany(Application, { foreignKey: 'jobId', as: 'applications' });
Application.belongsTo(Job, { foreignKey: 'jobId', as: 'job' });

// Worker <-> Application (One-to-Many)
Worker.hasMany(Application, { foreignKey: 'workerId', as: 'applications' });
Application.belongsTo(Worker, { foreignKey: 'workerId', as: 'worker' });

// User <-> Conversation (Many-to-Many through ConversationParticipant)
Conversation.belongsToMany(User, { through: ConversationParticipant, foreignKey: 'conversationId', as: 'participants' });
User.belongsToMany(Conversation, { through: ConversationParticipant, foreignKey: 'userId', as: 'conversations' });

// Conversation <-> ConversationParticipant (One-to-Many)
Conversation.hasMany(ConversationParticipant, { foreignKey: 'conversationId', as: 'conversationParticipants' });
ConversationParticipant.belongsTo(Conversation, { foreignKey: 'conversationId' });

// User <-> ConversationParticipant (One-to-Many)
User.hasMany(ConversationParticipant, { foreignKey: 'userId', as: 'userConversations' });
ConversationParticipant.belongsTo(User, { foreignKey: 'userId' });

// Job <-> Conversation (One-to-Many)
Job.hasMany(Conversation, { foreignKey: 'jobId', as: 'conversations' });
Conversation.belongsTo(Job, { foreignKey: 'jobId', as: 'job' });

// Conversation <-> Message (One-to-Many)
Conversation.hasMany(Message, { foreignKey: 'conversationId', as: 'messages' });
Message.belongsTo(Conversation, { foreignKey: 'conversationId', as: 'conversation' });

// User <-> Message (One-to-Many)
User.hasMany(Message, { foreignKey: 'senderId', as: 'sentMessages' });
Message.belongsTo(User, { foreignKey: 'senderId', as: 'sender' });

// User <-> Review (One-to-Many, from homeowner)
User.hasMany(Review, { foreignKey: 'fromId', as: 'reviewsGiven' });
Review.belongsTo(User, { foreignKey: 'fromId', as: 'reviewer' });

// Worker <-> Review (One-to-Many, to worker)
Worker.hasMany(Review, { foreignKey: 'toId', as: 'reviews' });
Review.belongsTo(Worker, { foreignKey: 'toId', as: 'worker' });

// Job <-> Review (One-to-Many)
Job.hasMany(Review, { foreignKey: 'jobId', as: 'reviews' });
Review.belongsTo(Job, { foreignKey: 'jobId', as: 'job' });

// Worker <-> Verification (One-to-Many)
Worker.hasMany(Verification, { foreignKey: 'workerId', as: 'verifications' });
Verification.belongsTo(Worker, { foreignKey: 'workerId', as: 'worker' });

// User <-> Verification (One-to-Many, reviewer admin)
User.hasMany(Verification, { foreignKey: 'reviewedBy', as: 'reviewedVerifications' });
Verification.belongsTo(User, { foreignKey: 'reviewedBy', as: 'reviewer' });

// User <-> FraudAlert (One-to-Many, target user)
User.hasMany(FraudAlert, { foreignKey: 'targetUser', as: 'fraudAlerts' });
FraudAlert.belongsTo(User, { foreignKey: 'targetUser', as: 'user' });

// User <-> FraudAlert (One-to-Many, resolver admin)
User.hasMany(FraudAlert, { foreignKey: 'resolvedBy', as: 'resolvedAlerts' });
FraudAlert.belongsTo(User, { foreignKey: 'resolvedBy', as: 'resolver' });

export {
  User,
  Worker,
  Job,
  Application,
  Conversation,
  ConversationParticipant,
  Message,
  Review,
  Verification,
  FraudAlert
};
