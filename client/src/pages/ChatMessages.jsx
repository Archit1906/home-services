import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Paperclip, Mic, X, Image, FileText, CheckCheck, Smile, Phone, ArrowLeft, SendHorizontal } from 'lucide-react';
import { useAuthStore } from '../store/authStore.js';
import { useToastStore } from '../store/toastStore.js';
import { useChatStore } from '../store/chatStore.js';
import Card from '../components/ui/Card.jsx';
import Button from '../components/ui/Button.jsx';
import Avatar from '../components/ui/Avatar.jsx';
import Badge from '../components/ui/Badge.jsx';

export default function ChatMessages() {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { addToast } = useToastStore();
  
  const {
    conversations,
    activeConversation,
    messages,
    fetchConversations,
    setActiveConversation,
    sendMessage,
    socket
  } = useChatStore();

  const [inputText, setInputText] = useState('');
  const [typing, setTyping] = useState(false);
  const [partnerTyping, setPartnerTyping] = useState(false);
  
  // Attachment Simulation
  const [attachment, setAttachment] = useState(null);
  const [showAttachmentsMenu, setShowAttachmentsMenu] = useState(false);

  // Audio Recording Simulation
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const recordingTimer = useRef(null);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (conversationId && conversations.length > 0) {
      const active = conversations.find(c => c.id === conversationId);
      if (active) {
        setActiveConversation(active);
      }
    }
  }, [conversationId, conversations]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Typing indicators
  useEffect(() => {
    if (socket && activeConversation) {
      socket.on('typing', ({ conversationId: cId, userId }) => {
        if (cId === activeConversation.id && userId !== user.id) {
          setPartnerTyping(true);
        }
      });
      socket.on('stop_typing', ({ conversationId: cId, userId }) => {
        if (cId === activeConversation.id && userId !== user.id) {
          setPartnerTyping(false);
        }
      });
      return () => {
        socket.off('typing');
        socket.off('stop_typing');
      };
    }
  }, [socket, activeConversation]);

  const handleInputChange = (e) => {
    setInputText(e.target.value);
    
    if (socket && activeConversation) {
      if (!typing && e.target.value.length > 0) {
        setTyping(true);
        socket.emit('typing', { conversationId: activeConversation.id, userId: user.id, userName: user.name });
      } else if (typing && e.target.value.length === 0) {
        setTyping(false);
        socket.emit('stop_typing', { conversationId: activeConversation.id, userId: user.id });
      }
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputText.trim() && !attachment) return;

    if (socket && activeConversation && typing) {
      setTyping(false);
      socket.emit('stop_typing', { conversationId: activeConversation.id, userId: user.id });
    }

    try {
      let content = inputText;
      let type = 'text';

      if (attachment) {
        type = attachment.type;
        content = attachment.name + (inputText ? `: ${inputText}` : '');
      }

      await sendMessage(activeConversation.id, content, type);
      setInputText('');
      setAttachment(null);
    } catch (err) {
      addToast('Failed to dispatch message', 'error');
    }
  };

  // Simulated recording hooks
  const startRecordingSim = () => {
    setIsRecording(true);
    setRecordingSeconds(0);
    recordingTimer.current = setInterval(() => {
      setRecordingSeconds(prev => prev + 1);
    }, 1000);
  };

  const stopRecordingSim = async (shouldSend = true) => {
    clearInterval(recordingTimer.current);
    setIsRecording(false);
    if (shouldSend && recordingSeconds > 0) {
      try {
        await sendMessage(activeConversation.id, `Simulated Audio Voice Note (${recordingSeconds}s)`, 'audio');
        addToast('Voice clip sent!', 'success');
      } catch (err) {
        addToast('Failed to dispatch audio clip', 'error');
      }
    }
    setRecordingSeconds(0);
  };

  const triggerMockAttachment = (type, name) => {
    setAttachment({ type, name });
    setShowAttachmentsMenu(false);
    addToast(`${name} attachment preview loaded!`, 'info');
  };

  // Find chat partner profile
  const partner = activeConversation?.participants?.find(p => p.id !== user?.id);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-text-primary dark:text-text-darkPrimary p-4 md:p-6 flex flex-col md:flex-row gap-6 h-[90vh]">
      
      {/* Conversation Sidebar */}
      <Card className="w-full md:w-80 flex flex-col p-4 border border-border/10 bg-white/70 dark:bg-slate-900/70 overflow-hidden h-full">
        <div className="flex items-center gap-2 mb-4">
          <button onClick={() => navigate(-1)} className="md:hidden text-text-secondary mr-2">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h2 className="text-lg font-display font-black">Conversations</h2>
        </div>

        <div className="flex-grow overflow-y-auto space-y-2 pr-1">
          {conversations.length === 0 ? (
            <p className="text-xs text-text-secondary text-center py-12">No active messages yet.</p>
          ) : (
            conversations.map((conv) => {
              const other = conv.participants?.find(p => p.id !== user?.id);
              const isActive = activeConversation?.id === conv.id;

              return (
                <div
                  key={conv.id}
                  onClick={() => {
                    navigate(`/messages/${conv.id}`);
                  }}
                  className={`flex items-center justify-between p-3 rounded-2xl cursor-pointer border transition-all ${
                    isActive 
                      ? 'bg-primary-light border-primary/20 text-text-primary dark:bg-slate-800/80 dark:border-primary/25' 
                      : 'border-transparent hover:bg-slate-100/50 dark:hover:bg-slate-800/30'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Avatar src={other?.photoURL} name={other?.name} size="sm" />
                    <div className="space-y-1">
                      <h4 className="font-bold text-xs leading-none">{other?.name}</h4>
                      <p className="text-[10px] text-text-secondary font-medium line-clamp-1 max-w-[120px]">
                        {conv.lastMessageContent || 'No messages yet'}
                      </p>
                    </div>
                  </div>

                  {conv.unreadCount > 0 && (
                    <span className="h-5 min-w-[20px] bg-rose-500 text-white rounded-full flex items-center justify-center font-bold text-[10px] px-1 animate-pulse">
                      {conv.unreadCount}
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>
      </Card>

      {/* Main Messaging Interface */}
      <Card className="flex-grow flex flex-col p-0 border border-border/10 bg-white/70 dark:bg-slate-900/70 overflow-hidden h-full relative">
        {activeConversation ? (
          <>
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border/20 bg-slate-50/40 dark:bg-slate-900/40">
              <div className="flex items-center gap-3">
                <Avatar src={partner?.photoURL} name={partner?.name} size="md" />
                <div>
                  <h3 className="font-bold text-sm leading-tight">{partner?.name}</h3>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold tracking-wide flex items-center gap-1">
                    <span className="h-2 w-2 bg-emerald-500 rounded-full block animate-ping" /> Online &bull; Active
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                {activeConversation.job && (
                  <Badge variant="primary" className="text-[10px]">
                    Job: {activeConversation.job.title}
                  </Badge>
                )}
              </div>
            </div>

            {/* Chat Thread */}
            <div className="flex-grow overflow-y-auto p-6 space-y-4">
              {messages.length === 0 ? (
                <div className="text-center py-20 text-xs text-text-secondary font-medium">
                  Start of conversation. Type below to write a message.
                </div>
              ) : (
                messages.map((msg) => {
                  const isMine = msg.senderId === user.id;

                  return (
                    <div
                      key={msg.id}
                      className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className="space-y-1 max-w-[70%]">
                        <div
                          className={`rounded-2xl p-3.5 text-sm ${
                            isMine
                              ? 'bg-primary text-white rounded-tr-none'
                              : 'bg-slate-100 dark:bg-slate-800 text-text-primary dark:text-text-darkPrimary rounded-tl-none border border-border/5'
                          }`}
                        >
                          {/* Render files/attachments uniquely */}
                          {msg.type === 'image' && (
                            <div className="rounded-xl overflow-hidden mb-2 max-w-[200px] border border-black/10">
                              <div className="aspect-square bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                                <Image className="h-10 w-10 text-text-secondary" />
                              </div>
                            </div>
                          )}
                          {msg.type === 'document' && (
                            <div className="flex items-center gap-2 bg-black/15 p-2 rounded-xl text-xs mb-2">
                              <FileText className="h-4 w-4" /> [Doc: {msg.content.split(':')[0]}]
                            </div>
                          )}
                          
                          <span>{msg.content}</span>
                        </div>
                        <div
                          className={`text-[9px] text-text-secondary flex items-center gap-1 ${
                            isMine ? 'justify-end' : 'justify-start'
                          }`}
                        >
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          {isMine && <CheckCheck className="h-3.5 w-3.5 text-primary" />}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              
              {/* Partner typing state */}
              {partnerTyping && (
                <div className="flex justify-start">
                  <div className="bg-slate-100 dark:bg-slate-800 rounded-2xl rounded-tl-none py-2.5 px-4 text-xs font-semibold text-text-secondary border border-border/5 animate-pulse">
                    {partner?.name} is typing...
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Simulated Attachment Preview Bar */}
            {attachment && (
              <div className="mx-6 p-3.5 bg-slate-100 dark:bg-slate-800 border border-border/10 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-semibold">
                  {attachment.type === 'image' ? <Image className="h-4 w-4 text-primary" /> : <FileText className="h-4 w-4 text-primary" />}
                  <span>Pending Attachment: {attachment.name}</span>
                </div>
                <button onClick={() => setAttachment(null)} className="text-text-secondary hover:text-text-primary">
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            {/* Input Composer Panel */}
            <div className="p-4 border-t border-border/20 bg-slate-50/40 dark:bg-slate-900/40 relative">
              
              {/* Attachment selector popup */}
              <AnimatePresence>
                {showAttachmentsMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute bottom-20 left-4 bg-white dark:bg-slate-900 border border-border/25 rounded-card p-3 shadow-elevated z-10 space-y-1 w-44"
                  >
                    <button
                      type="button"
                      onClick={() => triggerMockAttachment('image', 'work_proof.png')}
                      className="w-full flex items-center gap-2.5 text-left text-xs font-bold text-text-secondary hover:text-text-primary hover:bg-slate-100/50 dark:hover:bg-slate-800 p-2 rounded-xl transition-all"
                    >
                      <Image className="h-4 w-4 text-sky-500" /> Upload Photo
                    </button>
                    <button
                      type="button"
                      onClick={() => triggerMockAttachment('document', 'invoice.pdf')}
                      className="w-full flex items-center gap-2.5 text-left text-xs font-bold text-text-secondary hover:text-text-primary hover:bg-slate-100/50 dark:hover:bg-slate-800 p-2 rounded-xl transition-all"
                    >
                      <FileText className="h-4 w-4 text-emerald-500" /> Send Document
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              {isRecording ? (
                <div className="flex items-center justify-between bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/30 rounded-full py-2.5 px-6 animate-pulse">
                  <div className="flex items-center gap-3 text-xs font-bold text-rose-800 dark:text-rose-300">
                    <span className="h-2.5 w-2.5 bg-rose-600 rounded-full block animate-ping" />
                    <span>Recording Voice Clip: 0:{recordingSeconds < 10 ? `0${recordingSeconds}` : recordingSeconds}s</span>
                    
                    {/* Microphone animated soundwave grid */}
                    <div className="flex items-end gap-0.5 h-4 ml-2">
                      <span className="w-0.5 bg-rose-600 h-2.5 rounded-full animate-wave-bar" />
                      <span className="w-0.5 bg-rose-600 h-4 rounded-full animate-wave-bar-fast" />
                      <span className="w-0.5 bg-rose-600 h-1.5 rounded-full animate-wave-bar-slow" />
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => stopRecordingSim(false)}
                      className="text-xs font-bold text-text-secondary hover:text-rose-600"
                    >
                      Discard
                    </button>
                    <button
                      type="button"
                      onClick={() => stopRecordingSim(true)}
                      className="text-xs font-bold text-primary hover:underline"
                    >
                      Send Recording
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSend} className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setShowAttachmentsMenu(!showAttachmentsMenu)}
                    className="p-3 text-text-secondary hover:text-text-primary hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
                  >
                    <Paperclip className="h-5 w-5" />
                  </button>

                  <input
                    type="text"
                    placeholder="Type your message requirement..."
                    value={inputText}
                    onChange={handleInputChange}
                    className="flex-grow bg-white dark:bg-slate-900 border border-border dark:border-border-dark py-3 px-5 text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all text-text-primary dark:text-text-darkPrimary placeholder-text-secondary/55"
                  />

                  <button
                    type="button"
                    onClick={startRecordingSim}
                    className="p-3 text-text-secondary hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-full transition-colors"
                    title="Press to record voice clip"
                  >
                    <Mic className="h-5 w-5" />
                  </button>

                  <Button
                    type="submit"
                    variant="primary"
                    className="rounded-full p-3.5 px-4 h-auto min-w-0"
                    disabled={!inputText.trim() && !attachment}
                  >
                    <SendHorizontal className="h-5 w-5" />
                  </Button>
                </form>
              )}
            </div>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 gap-4">
            <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-full text-text-secondary">
              <MessageSquare className="h-8 w-8" />
            </div>
            <div>
              <h3 className="font-bold text-lg mb-1">Select a conversation</h3>
              <p className="text-sm text-text-secondary max-w-sm">
                Choose a client or service pro from the left sidebar panel to coordinate schedules or ask questions.
              </p>
            </div>
          </div>
        )}
      </Card>

    </div>
  );
}
export { ChatMessages };
