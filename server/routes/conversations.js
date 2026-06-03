import express from 'express';
import { Op } from 'sequelize';
import { Conversation, ConversationParticipant, Message, User, Job } from '../models/index.js';
import { protect } from '../middleware/auth.js';
import { emitToUser, emitToConversation } from '../services/socketService.js';

const router = express.Router();

/**
 * @route   GET /api/conversations
 * @desc    Get all conversations for the logged in user
 */
router.get('/', protect, async (req, res, next) => {
  try {
    const userId = req.user.id;

    const conversations = await Conversation.findAll({
      where: { isDeleted: false },
      include: [
        {
          model: User,
          as: 'participants',
          attributes: ['id', 'name', 'photoURL', 'role', 'city'],
          through: { attributes: [] }
        },
        {
          model: ConversationParticipant,
          as: 'conversationParticipants',
          where: { userId },
          attributes: ['unreadCount']
        },
        {
          model: Job,
          as: 'job',
          attributes: ['title', 'serviceType', 'status']
        }
      ],
      order: [['updatedAt', 'DESC']]
    });

    const formatted = conversations.map(c => {
      const convObj = c.toJSON();
      const userParticipant = c.conversationParticipants?.[0];
      convObj.unreadCount = userParticipant ? userParticipant.unreadCount : 0;
      delete convObj.conversationParticipants;
      return convObj;
    });

    return res.json({ success: true, conversations: formatted });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/conversations
 * @desc    Start/Open a new conversation with a worker or homeowner
 */
router.post('/', protect, async (req, res, next) => {
  try {
    const { recipientId, jobId } = req.body;

    if (!recipientId) {
      return res.status(400).json({ success: false, message: 'Recipient ID is required' });
    }

    const recipient = await User.findByPk(recipientId);
    if (!recipient) {
      return res.status(404).json({ success: false, message: 'Recipient user not found' });
    }

    // Check if conversation already exists for this job or general with the exact participant list
    const existing = await Conversation.findOne({
      where: { 
        isDeleted: false,
        jobId: jobId || null 
      },
      include: [
        {
          model: User,
          as: 'participants',
          where: { id: [req.user.id, recipient.id] },
          attributes: ['id']
        }
      ]
    });

    let conversation = null;

    if (existing) {
      conversation = await Conversation.findByPk(existing.id, {
        include: [
          { model: User, as: 'participants', attributes: ['id', 'name', 'photoURL', 'role', 'city'], through: { attributes: [] } },
          { model: Job, as: 'job', attributes: ['title', 'serviceType', 'status'] }
        ]
      });
      
      // Verify it only contains exactly these 2 participants (no group chat leakage)
      if (conversation && conversation.participants.length !== 2) {
        conversation = null;
      }
    }

    if (!conversation) {
      // Create new conversation
      conversation = await Conversation.create({
        jobId: jobId || null
      });

      // Create participation records
      await ConversationParticipant.create({
        conversationId: conversation.id,
        userId: req.user.id,
        unreadCount: 0
      });
      await ConversationParticipant.create({
        conversationId: conversation.id,
        userId: recipient.id,
        unreadCount: 0
      });

      // Reload conversation with complete associations
      conversation = await Conversation.findByPk(conversation.id, {
        include: [
          { model: User, as: 'participants', attributes: ['id', 'name', 'photoURL', 'role', 'city'], through: { attributes: [] } },
          { model: Job, as: 'job', attributes: ['title', 'serviceType', 'status'] }
        ]
      });

      emitToUser(recipientId, 'conversation_created', conversation);
    }

    return res.status(201).json({ success: true, conversation });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/conversations/:id/messages
 * @desc    Load messages in a conversation
 */
router.get('/:id/messages', protect, async (req, res, next) => {
  try {
    const conversationId = req.params.id;
    const userId = req.user.id;

    // Check if user is participant
    const participation = await ConversationParticipant.findOne({
      where: { conversationId, userId }
    });
    if (!participation) {
      return res.status(403).json({ success: false, message: 'Not authorized to view these messages' });
    }

    // Mark messages from other user as read
    await Message.update(
      { readAt: new Date() },
      { 
        where: { 
          conversationId, 
          senderId: { [Op.ne]: userId },
          readAt: null 
        } 
      }
    );

    // Reset unread count for current user
    participation.unreadCount = 0;
    await participation.save();

    const messages = await Message.findAll({
      where: { conversationId, isDeleted: false },
      order: [['createdAt', 'ASC']]
    });

    return res.json({ success: true, messages });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/conversations/:id/messages
 * @desc    Send a message in a conversation
 */
router.post('/:id/messages', protect, async (req, res, next) => {
  try {
    const conversationId = req.params.id;
    const { type, content, mediaUrl } = req.body;
    const senderId = req.user.id;

    // Verify participation
    const senderParticipation = await ConversationParticipant.findOne({
      where: { conversationId, userId: senderId }
    });
    if (!senderParticipation) {
      return res.status(403).json({ success: false, message: 'Not authorized to post to this conversation' });
    }

    const conversation = await Conversation.findByPk(conversationId);

    // Save message
    const message = await Message.create({
      conversationId,
      senderId,
      type: type || 'text',
      content: content || '',
      mediaUrl: mediaUrl || ''
    });

    // Update conversation last message fields
    conversation.lastMessageContent = type === 'text' ? content : `[Sent a ${type}]`;
    conversation.lastMessageSenderId = senderId;
    conversation.lastMessageSentAt = new Date();
    await conversation.save();

    // Increment unread counts for recipient
    const recipientParticipation = await ConversationParticipant.findOne({
      where: { 
        conversationId, 
        userId: { [Op.ne]: senderId } 
      }
    });

    if (recipientParticipation) {
      recipientParticipation.unreadCount += 1;
      await recipientParticipation.save();
      
      // Emit unread count state trigger
      emitToUser(recipientParticipation.userId, 'unread_message_count', {
        conversationId,
        unreadCount: recipientParticipation.unreadCount
      });
    }

    const formattedMessage = message.toJSON();

    // Emit message to conversation socket room
    emitToConversation(conversationId, 'receive_message', formattedMessage);

    return res.status(201).json({ success: true, message: formattedMessage });
  } catch (error) {
    next(error);
  }
});

export default router;
