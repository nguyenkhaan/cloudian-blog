import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import {
  createChatSessionApi,
  getSessionMessagesApi,
  sendChatMessageApi
} from '../api/chat';
import type { ChatMessage } from '../types/chat';
import { Button } from './ui/button';
import {
  MessageSquare,
  X,
  Send,
  RefreshCw,
  Sparkles,
  LogIn,
  AlertCircle,
  Loader2,
  Bot
} from 'lucide-react';

export const ChatWidget: React.FC = () => {
  const { isAuthenticated, openLoginModal } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [sessionCode, setSessionCode] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  
  const [isInitializing, setIsInitializing] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSystemEnabled, setIsSystemEnabled] = useState(() => {
    return localStorage.getItem('chatbot_enabled_system') !== 'false';
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleToggle = () => {
      const val = localStorage.getItem('chatbot_enabled_system') !== 'false';
      setIsSystemEnabled(val);
      if (!val) {
        setIsOpen(false);
      }
    };
    window.addEventListener('chatbot-toggle', handleToggle);
    return () => window.removeEventListener('chatbot-toggle', handleToggle);
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      setSessionCode(null);
      setMessages([]);
      return;
    }

    const initSession = async () => {
      const storedCode = localStorage.getItem('chatSessionCode');
      if (storedCode) {
        setSessionCode(storedCode);
        loadHistory(storedCode);
      } else {
        await startNewSession();
      }
    };

    if (isOpen) {
      initSession();
    }
  }, [isAuthenticated, isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  const loadHistory = async (code: string) => {
    setIsInitializing(true);
    setError(null);
    try {
      const history = await getSessionMessagesApi(code);
      setMessages(history);
    } catch (err) {
      console.warn('Failed to load chat history, creating new session:', err);
      await startNewSession();
    } finally {
      setIsInitializing(false);
    }
  };

  const startNewSession = async () => {
    setIsInitializing(true);
    setError(null);
    try {
      const res = await createChatSessionApi();
      localStorage.setItem('chatSessionCode', res.code);
      setSessionCode(res.code);
      setMessages([]);
    } catch (err) {
      setError('Failed to start a new session. Please try again.');
    } finally {
      setIsInitializing(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isThinking || !sessionCode) return;

    const userMessageContent = inputValue.trim();
    setInputValue('');
    setError(null);

    const activePostId = (window as any).__activePostId;

    const tempUserMsg: ChatMessage = {
      id: Math.random().toString(),
      content: userMessageContent,
      role: 'user',
      createdAt: new Date(),
    };
    setMessages((prev) => [...prev, tempUserMsg]);
    setIsThinking(true);

    try {
      const response = await sendChatMessageApi({
        sessionCode,
        content: userMessageContent,
        activePostId: activePostId ? Number(activePostId) : undefined,
      });

      setMessages((prev) => {
        const filtered = prev.filter((m) => m.id !== tempUserMsg.id);
        return [...filtered, response.userMessage, response.assistantMessage];
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'An error occurred while sending message.');
    } finally {
      setIsThinking(false);
    }
  };

  if (!isSystemEnabled) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      
      {isOpen && (
        <div className="w-[380px] h-[520px] max-w-[calc(100vw-32px)] bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden flex flex-col mb-4 transition-all duration-300 transform scale-100 origin-bottom-right">
          
          <div className="bg-primary text-white px-5 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5 animate-pulse" />
              <div>
                <h4 className="font-bold text-base leading-none">Cloudian Assistant</h4>
              </div>
            </div>
            
            <div className="flex items-center gap-1.5">
              {isAuthenticated && (
                <button
                  onClick={startNewSession}
                  title="Start new chat session"
                  disabled={isInitializing || isThinking}
                  className="p-1.5 rounded-lg hover:bg-white/10 active:scale-95 text-white/90 hover:text-white transition-all disabled:opacity-50 cursor-pointer border-0 bg-transparent"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg hover:bg-white/10 active:scale-95 text-white/90 hover:text-white transition-all cursor-pointer border-0 bg-transparent"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 bg-slate-50/50 space-y-4">
            
            {!isAuthenticated ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shadow-inner">
                  <Sparkles className="w-6 h-6 animate-pulse" />
                </div>
                <div className="space-y-1.5">
                  <p className="font-bold text-slate-800 text-lg">Chat with AI Assistant</p>
                  <p className="text-[14px] text-slate-500 leading-relaxed max-w-[240px]">
                    Please sign in with Google to ask questions about blogs, get helpful insights, and analyze source code.
                  </p>
                </div>
                <div className="w-full pt-2">
                  <Button 
                    onClick={openLoginModal}
                    className="w-full py-2.5 rounded-xl bg-primary hover:opacity-90 text-white font-semibold flex items-center justify-center gap-1.5 shadow-md shadow-primary/10 cursor-pointer text-sm"
                  >
                    <LogIn className="w-4 h-4" /> Sign in with Google
                  </Button>
                </div>
              </div>
            ) : isInitializing ? (
              <div className="h-full flex flex-col items-center justify-center gap-2">
                <Loader2 className="w-6 h-6 text-primary animate-spin" />
                <span className="text-sm text-slate-500 font-semibold">Preparing assistant...</span>
              </div>
            ) : (
              <>
                {messages.length === 0 && (
                  <div className="text-center py-6 px-4 space-y-3">
                    <Bot className="w-8 h-8 text-primary/80 mx-auto" />
                    <p className="text-sm font-semibold text-slate-500 leading-relaxed">
                      Hello! I can help you with questions about the blogs, code analysis, or explanations of technologies mentioned. Feel free to ask me anything!
                    </p>
                  </div>
                )}

                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-[15px] shadow-sm transition-all ${
                        msg.role === 'user'
                          ? 'bg-primary text-white rounded-br-none'
                          : 'bg-white text-slate-800 border border-slate-150 rounded-bl-none'
                      }`}
                    >
                      <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                    </div>
                  </div>
                ))}

                {isThinking && (
                  <div className="flex justify-start">
                    <div className="bg-white text-slate-800 border border-slate-150 rounded-2xl rounded-bl-none px-4 py-3 flex items-center gap-1.5 shadow-sm">
                      <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0ms', animationDuration: '1.2s' }}></span>
                      <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" style={{ animationDelay: '200ms', animationDuration: '1.2s' }}></span>
                      <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" style={{ animationDelay: '400ms', animationDuration: '1.2s' }}></span>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-100 text-red-650 text-sm font-medium flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {isAuthenticated && !isInitializing && (
            <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-150 bg-white flex items-center gap-2">
              <input
                type="text"
                placeholder="Ask AI assistant..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                disabled={isThinking}
                className="flex-1 px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-base text-slate-900 placeholder-slate-400 transition-all disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!inputValue.trim() || isThinking}
                className="w-9 h-9 rounded-xl bg-primary hover:opacity-90 text-white flex items-center justify-center transition-all disabled:opacity-40 active:scale-95"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full bg-primary hover:opacity-90 text-white flex items-center justify-center shadow-lg hover:shadow-primary/20 transition-all duration-300 hover:scale-105 active:scale-95 relative group"
      >
        {isOpen ? (
          <X className="w-6 h-6 transition-transform duration-300 rotate-90" />
        ) : (
          <>
            <MessageSquare className="w-6 h-6 transition-transform duration-300 group-hover:rotate-6" />
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full animate-ping"></span>
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></span>
          </>
        )}
      </button>
    </div>
  );
};
