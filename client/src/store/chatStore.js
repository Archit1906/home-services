import { create } from 'zustand';
import { io } from 'socket.io-client';

const API_BASE = '/api';

export const useChatStore = create((set, get) => ({
  conversations: [],
  activeConversation: null,
  messages: [],
  socket: null,
  loading: false,
  error: null,

  initSocket: (userId) => {
    if (get().socket) return;

    const socket = io({
      query: { userId }
    });

    socket.on('connect', () => {
      console.log('Socket connected successfully');
    });

    socket.on('receive_message', (message) => {
      const active = get().activeConversation;
      if (active && active.id === message.conversationId) {
        set((state) => ({
          messages: [...state.messages, message]
        }));
      }
      // Refresh conversations list to show last message updates
      get().fetchConversations();
    });

    socket.on('conversation_created', (conversation) => {
      set((state) => ({
        conversations: [conversation, ...state.conversations]
      }));
    });

    socket.on('unread_message_count', ({ conversationId, unreadCount }) => {
      set((state) => ({
        conversations: state.conversations.map((c) =>
          c.id === conversationId ? { ...c, unreadCount } : c
        )
      }));
    });

    set({ socket });
  },

  disconnectSocket: () => {
    const { socket } = get();
    if (socket) {
      socket.disconnect();
      set({ socket: null });
    }
  },

  fetchConversations: async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    set({ loading: true });
    try {
      const res = await fetch(`${API_BASE}/conversations`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to fetch conversations');
      set({ conversations: data.conversations, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  fetchMessages: async (conversationId) => {
    const token = localStorage.getItem('token');
    if (!token) return;
    set({ loading: true });
    try {
      const res = await fetch(`${API_BASE}/conversations/${conversationId}/messages`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to fetch messages');

      // Join the conversation socket room
      const { socket } = get();
      if (socket) {
        socket.emit('join_conversation', conversationId);
      }

      set({ messages: data.messages, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  sendMessage: async (conversationId, content, type = 'text') => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/conversations/${conversationId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ type, content })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to send message');
      
      // Update local messages array immediately
      set((state) => ({
        messages: [...state.messages, data.message]
      }));
      // Update conversations list for last message
      get().fetchConversations();
      return data.message;
    } catch (err) {
      set({ error: err.message });
      throw err;
    }
  },

  startConversation: async (recipientId, jobId = null) => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/conversations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ recipientId, jobId })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to start conversation');

      set({ activeConversation: data.conversation });
      get().fetchConversations();
      return data.conversation;
    } catch (err) {
      set({ error: err.message });
      throw err;
    }
  },

  setActiveConversation: (conversation) => {
    const previous = get().activeConversation;
    const { socket } = get();
    if (socket && previous) {
      socket.emit('leave_conversation', previous.id);
    }
    set({ activeConversation: conversation });
    if (conversation) {
      get().fetchMessages(conversation.id);
    } else {
      set({ messages: [] });
    }
  }
}));
