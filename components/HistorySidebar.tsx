'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface Session {
  id: string;
  title: string;
  created_at: string;
}

interface HistorySidebarProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string | null;
  currentSessionId: string | null;
  onSelectSession: (sessionId: string, messages: any[]) => void;
  onNewChat: () => void;
}

export default function HistorySidebar({
  isOpen,
  onClose,
  userId,
  currentSessionId,
  onSelectSession,
  onNewChat,
}: HistorySidebarProps) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (userId && isOpen) {
      fetchSessions();
    }
  }, [userId, isOpen]);

  const fetchSessions = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('sessions')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setSessions(data);
    }
    setLoading(false);
  };

  const handleSelect = async (sessionId: string) => {
    const { data: messages, error } = await supabase
      .from('messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });

    if (!error && messages) {
      onSelectSession(sessionId, messages);
      onClose();
    }
  };

  const handleDelete = async (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation();
    const { error } = await supabase.from('sessions').delete().eq('id', sessionId);
    if (!error) {
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
      if (currentSessionId === sessionId) {
        onNewChat();
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="relative w-80 max-w-[80vw] bg-slate-900 border-r border-slate-800 text-white h-full flex flex-col z-10 shadow-2xl">
        <div className="p-4 border-b border-slate-800 flex justify-between items-center">
          <h2 className="font-semibold text-sm text-slate-200">Saved Sessions</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-sm"
          >
            ✕
          </button>
        </div>

        <div className="p-3 border-b border-slate-800">
          <button
            onClick={() => {
              onNewChat();
              onClose();
            }}
            className="w-full py-2 px-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs font-semibold flex items-center justify-center gap-2 transition"
          >
            <span>+</span> New Document Analysis
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {!userId ? (
            <p className="text-xs text-slate-500 text-center py-4">
              Sign in to access saved cloud history.
            </p>
          ) : loading ? (
            <p className="text-xs text-slate-500 text-center py-4">
              Loading history...
            </p>
          ) : sessions.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-4">
              No saved sessions yet.
            </p>
          ) : (
            sessions.map((session) => (
              <div
                key={session.id}
                onClick={() => handleSelect(session.id)}
                className={`group flex items-center justify-between p-2.5 rounded-lg text-xs cursor-pointer transition ${
                  currentSessionId === session.id
                    ? 'bg-slate-800 text-blue-400 border border-slate-700'
                    : 'hover:bg-slate-800/60 text-slate-300'
                }`}
              >
                <span className="truncate pr-2">{session.title}</span>
                <button
                  onClick={(e) => handleDelete(e, session.id)}
                  className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 text-xs transition"
                  title="Delete session"
                >
                  🗑
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
