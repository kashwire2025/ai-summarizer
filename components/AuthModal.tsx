'use client';

import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (email: string) => void;
}

export default function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  if (!isOpen) return null;

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true }
    });

    setLoading(false);
    if (error) {
      setMessage(`Error: ${error.message}`);
    } else {
      setStep('otp');
      setMessage('A 6-digit code has been sent to your email.');
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: 'email'
    });

    setLoading(false);
    if (error) {
      setMessage(`Invalid code: ${error.message}`);
    } else if (data.session) {
      onSuccess(email);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 w-full max-w-md text-white shadow-2xl relative">
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-slate-400 hover:text-white"
        >
          ✕
        </button>

        <h2 className="text-xl font-bold mb-2">
          {step === 'email' ? 'Sign in to Sync History' : 'Enter 6-Digit Code'}
        </h2>
        <p className="text-sm text-slate-400 mb-4">
          {step === 'email' 
            ? 'Access your saved documents and chat history across all your devices.' 
            : `Code sent to ${email}`}
        </p>

        {message && (
          <div className="mb-4 text-xs p-2.5 rounded bg-blue-950/60 border border-blue-800 text-blue-200">
            {message}
          </div>
        )}

        {step === 'email' ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <input
              type="email"
              required
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 font-semibold text-white transition disabled:opacity-50"
            >
              {loading ? 'Sending Code...' : 'Send Magic Code'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <input
              type="text"
              required
              maxLength={6}
              placeholder="123456"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full text-center text-2xl tracking-widest px-4 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-blue-500"
            />
            <button
              type="submit"
              disabled={loading || otp.length < 6}
              className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 font-semibold text-white transition disabled:opacity-50"
            >
              {loading ? 'Verifying...' : 'Verify & Sign In'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
