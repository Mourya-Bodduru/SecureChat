import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, ArrowRight, ShieldCheck } from 'lucide-react';
import ThreeBackground from './ThreeBackground';

const JoinRoom = ({ onJoin }) => {
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (passcode.length < 6) {
      setError('Passcode must be at least 6 characters for security.');
      return;
    }
    setError('');
    onJoin(passcode);
  };

  const progress = Math.min((passcode.length / 12) * 100, 100);
  let progressColor = 'bg-red-500';
  if (passcode.length >= 6) progressColor = 'bg-yellow-500';
  if (passcode.length >= 12) progressColor = 'bg-green-500';

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-slate-50">
      <ThreeBackground />

      {/* Floating UI overlay */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="glass-panel w-full max-w-md p-10 rounded-3xl relative z-10 shadow-xl border border-gray-100"
      >
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-10"
        >
          <div className="relative w-20 h-20 mx-auto mb-6 flex items-center justify-center">
            {/* Pulsing rings */}
            <motion.div 
              animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.05, 0.2] }}
              transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
              className="absolute inset-0 rounded-full border-2 border-brand/30"
            />
            <motion.div 
              animate={{ scale: [1, 1.5, 1], opacity: [0.1, 0, 0.1] }}
              transition={{ repeat: Infinity, duration: 3, ease: "easeInOut", delay: 0.5 }}
              className="absolute inset-0 rounded-full border-2 border-brand/20"
            />
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center z-10 shadow-[0_0_15px_rgba(59,130,246,0.2)] border border-blue-100">
              <ShieldCheck className="w-8 h-8 text-brand" />
            </div>
          </div>
          <h1 className="text-4xl font-extrabold mb-2 tracking-tight text-gray-900">
            Secure<span className="text-brand">Chat</span>
          </h1>
          <p className="text-gray-500 text-sm font-medium">
            Enter your secret dimension
          </p>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <motion.div 
              animate={{ 
                boxShadow: isFocused ? '0 0 0 4px rgba(59, 130, 246, 0.1)' : '0 0 0px rgba(59, 130, 246, 0)',
                borderColor: isFocused ? '#3b82f6' : '#e2e8f0'
              }}
              className="flex items-center px-4 py-3 bg-white border rounded-2xl transition-colors duration-300"
            >
              <Lock className={`h-5 w-5 transition-colors duration-300 ${isFocused ? 'text-brand' : 'text-gray-400'}`} />
              <input
                type="password"
                value={passcode}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                onChange={(e) => {
                  setPasscode(e.target.value);
                  if (error) setError('');
                }}
                className="w-full bg-transparent border-none text-gray-900 pl-3 outline-none placeholder-gray-400 focus:ring-0 font-mono tracking-widest"
                placeholder="Enter 6+ char secret..."
                autoFocus
              />
            </motion.div>
            
            {/* Passcode strength bar */}
            <div className="h-1 w-full bg-gray-100 rounded-full mt-3 overflow-hidden">
              <motion.div 
                className={`h-full ${progressColor}`}
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>

            <AnimatePresence>
              {error && (
                <motion.p 
                  initial={{ opacity: 0, y: -10 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-3 text-sm text-red-500 text-center font-medium"
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            className="w-full flex items-center justify-center py-4 px-4 rounded-2xl text-sm font-bold text-white bg-brand hover:bg-blue-600 shadow-lg shadow-blue-500/30 transition-all group overflow-hidden relative"
          >
            {/* Shimmer effect */}
            <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            <span className="relative z-10 flex items-center">
              Initialize Connection
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </span>
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
};

export default JoinRoom;
