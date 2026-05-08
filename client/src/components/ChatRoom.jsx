import React, { useState, useEffect, useRef, useMemo, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Lock, LogOut, ShieldAlert } from 'lucide-react';
import { io } from 'socket.io-client';
import { v4 as uuidv4 } from 'uuid';
import { generateRoomHash, encryptMessage, decryptMessage } from '../utils/crypto';

const SOCKET_URL = import.meta.env.VITE_BACKEND_URL || 'https://secure-chat-xyz.vercel.app/';

const formatDateSeparator = (timestamp) => {
  const date = new Date(timestamp);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) {
    return 'Today';
  } else if (date.toDateString() === yesterday.toDateString()) {
    return 'Yesterday';
  } else {
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  }
};

const MessageBubble = memo(({ msg, isOwn, showDateSeparator }) => {
  return (
    <>
      {showDateSeparator && (
        <div className="flex justify-center my-6">
          <span className="bg-gray-100 text-gray-500 text-xs font-semibold px-4 py-1.5 rounded-full border border-gray-200 shadow-sm">
            {formatDateSeparator(msg.timestamp)}
          </span>
        </div>
      )}
      <motion.div 
        initial={{ opacity: 0, y: 10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="flex flex-col w-full mb-4 items-start"
      >
        <div 
          className={`relative max-w-[85%] md:max-w-[70%] px-4 py-3 shadow-sm border ${
            isOwn 
              ? 'bg-blue-50/80 border-blue-200 text-gray-900 rounded-2xl rounded-tl-sm' 
              : 'bg-white border-gray-200 text-gray-900 rounded-2xl rounded-tl-sm'
          }`}
        >
          <p className="text-[15px] leading-relaxed whitespace-pre-wrap break-words">{msg.text}</p>
          <div className="text-[10px] mt-1.5 flex items-center gap-1 text-gray-400 justify-start">
            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </motion.div>
    </>
  );
});

const ChatRoom = ({ passcode, onLeave }) => {
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  
  const messagesEndRef = useRef(null);
  
  const sessionId = useMemo(() => {
    let stored = localStorage.getItem('securechat_anon_id');
    if (!stored) {
      stored = uuidv4();
      localStorage.setItem('securechat_anon_id', stored);
    }
    return stored;
  }, []);

  const roomHash = useMemo(() => generateRoomHash(passcode), [passcode]);

  useEffect(() => {
    const newSocket = io(SOCKET_URL);
    setSocket(newSocket);

    newSocket.on('connect', () => {
      setIsConnected(true);
      newSocket.emit('join_room', { roomHash });
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
    });

    newSocket.on('room_history', (historyMessages) => {
      const decryptedHistory = historyMessages.map(msg => ({
        ...msg,
        text: decryptMessage(msg.cipherText, passcode)
      })).filter(msg => msg.text);
      setMessages(decryptedHistory);
    });

    newSocket.on('receive_message', (msg) => {
      const decryptedText = decryptMessage(msg.cipherText, passcode);
      if (decryptedText) {
        setMessages(prev => [...prev, { ...msg, text: decryptedText }]);
      }
    });

    return () => {
      newSocket.disconnect();
    };
  }, [roomHash, passcode]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !socket) return;

    const cipherText = encryptMessage(newMessage, passcode);
    
    socket.emit('send_message', {
      roomHash,
      cipherText,
      senderId: sessionId
    });

    setNewMessage('');
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-slate-50 md:p-6">
      {/* Soft Light Background Blurs */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-200/40 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-100/40 rounded-full blur-[100px] pointer-events-none" />

      {/* Main Chat Container with Border */}
      <div className="w-full h-full md:h-[90vh] md:max-h-[900px] md:max-w-4xl bg-white/90 backdrop-blur-xl border-0 md:border border-gray-200 rounded-none md:rounded-3xl shadow-none md:shadow-2xl flex flex-col relative z-10 overflow-hidden">
        
        {/* Floating Leave Button */}
        <button 
          onClick={onLeave}
          title="Destroy Session"
          className="absolute top-4 right-4 z-50 p-2.5 text-gray-400 hover:text-white bg-gray-100 hover:bg-red-500 border border-transparent rounded-xl transition-all duration-300 shadow-sm"
        >
          <LogOut className="w-4 h-4" />
        </button>

        {/* Messages Area */}
        <main className="flex-1 overflow-y-auto px-4 py-6 md:px-6 space-y-1 scrollbar-hide pt-16">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400">
              <motion.div 
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              >
                <Lock className="w-16 h-16 mb-6 text-blue-200" />
              </motion.div>
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500 animate-pulse'}`} />
                <p className="text-lg font-medium text-gray-600">Secure Connection Established</p>
              </div>
              <p className="text-sm max-w-sm text-center">Your messages are encrypted before leaving your device. Only people with the exact passcode can read them.</p>
            </div>
          ) : (
            messages.map((msg, index) => {
              let showDateSeparator = false;
              if (index === 0) {
                showDateSeparator = true;
              } else {
                const prevDate = new Date(messages[index - 1].timestamp).toDateString();
                const currDate = new Date(msg.timestamp).toDateString();
                if (prevDate !== currDate) {
                  showDateSeparator = true;
                }
              }

              return (
                <MessageBubble 
                  key={msg._id} 
                  msg={msg} 
                  isOwn={msg.senderId === sessionId} 
                  showDateSeparator={showDateSeparator}
                />
              );
            })
          )}
          <div ref={messagesEndRef} className="h-4" />
        </main>

        {/* Input Area */}
        <footer className="p-4 md:p-5 bg-gray-50/80 border-t border-gray-100 shrink-0">
          <form onSubmit={handleSendMessage} className="max-w-full mx-auto relative flex items-end gap-3">
            <div className="flex-1 relative bg-white border border-gray-200 rounded-2xl overflow-hidden focus-within:border-brand focus-within:ring-4 focus-within:ring-blue-100 transition-all duration-300 shadow-sm hover:border-gray-300">
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage(e);
                  }
                }}
                placeholder="Type your encrypted payload..."
                className="w-full bg-transparent border-none focus:ring-0 resize-none px-5 py-4 max-h-32 min-h-[56px] text-[15px] outline-none scrollbar-hide text-gray-900 placeholder-gray-400"
                rows={1}
                autoFocus
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              disabled={!newMessage.trim() || !isConnected}
              className="bg-brand text-white p-4 rounded-2xl hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shrink-0 shadow-md shadow-blue-500/20"
            >
              <Send className="w-6 h-6" />
            </motion.button>
          </form>
        </footer>
      </div>
    </div>
  );
};

export default ChatRoom;
