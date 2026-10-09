import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  X,
  Send,
  RotateCcw,
  CheckCircle2,
  Wrench,
  Bot,
  User as UserIcon,
  ChevronRight,
  HelpCircle,
  ExternalLink,
} from 'lucide-react';
import { AgentMessage, AgentTask } from '../../types';
import { agentService } from '../../services/agentService';
import { useAuth } from '../../context/AuthContext';
import { AgentActionConfirmCard } from './AgentActionConfirmCard';
import { LoadingSpinner } from '../common/LoadingSpinner';

interface AgentChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AgentChatDrawer: React.FC<AgentChatDrawerProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<AgentMessage[]>([
    {
      role: 'model',
      content:
        'Hi there! I am your **BorrowBox AI Rental Assistant**.\n\nI can help you search gear, check live availability, calculate exact rental prices, manage listings, or summarize your bookings.',
      timestamp: new Date().toISOString(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentTask, setCurrentTask] = useState<AgentTask | null>(null);
  const [conversationId, setConversationId] = useState<string>(
    () => 'conv_' + Math.random().toString(36).substring(2, 9)
  );

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isLoading) return;

    if (!user) {
      setMessages((prev) => [
        ...prev,
        { role: 'user', content: text, timestamp: new Date().toISOString() },
        {
          role: 'model',
          content: '⚠️ Please **log in or sign up** first so I can access your marketplace tools and execute tasks securely.',
          timestamp: new Date().toISOString(),
        },
      ]);
      setInputText('');
      return;
    }

    const userMsg: AgentMessage = {
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      const res = await agentService.sendMessage(text, conversationId);
      if (res.success && res.data) {
        setCurrentTask(res.data.task);

        const modelMsg: AgentMessage = {
          role: 'model',
          content: res.data.response,
          timestamp: new Date().toISOString(),
          toolCalls: res.data.toolCalls,
          pendingAction: res.data.pendingAction,
        };

        setMessages((prev) => [...prev, modelMsg]);
      }
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'model',
          content: `❌ ${err.response?.data?.message || err.message || 'Error communicating with AI agent.'}`,
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmPending = async () => {
    if (!currentTask) return;
    try {
      const res = await agentService.confirmAction(currentTask._id);
      if (res.success) {
        setCurrentTask(res.data);
        setMessages((prev) => [
          ...prev,
          {
            role: 'model',
            content: `✅ Action executed successfully! Database records updated.`,
            timestamp: new Date().toISOString(),
          },
        ]);
      }
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'model',
          content: `❌ Execution failed: ${err.response?.data?.message || err.message}`,
          timestamp: new Date().toISOString(),
        },
      ]);
    }
  };

  const handleCancelPending = async () => {
    if (!currentTask) return;
    try {
      const res = await agentService.cancelAction(currentTask._id);
      if (res.success) {
        setCurrentTask(res.data);
        setMessages((prev) => [
          ...prev,
          {
            role: 'model',
            content: `🚫 Action cancelled. No database changes were made.`,
            timestamp: new Date().toISOString(),
          },
        ]);
      }
    } catch (err: any) {
      console.error(err);
    }
  };

  const quickPrompts = [
    'Find Sony cameras under ৳2,000/day in Dhaka',
    'Show my recent bookings and active rentals',
    'Summarize my spending and owner earnings',
    'Help me write a description for my camping tent',
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[480px] bg-white shadow-2xl border-l border-slate-200 flex flex-col animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-brand-600 to-brand-700 text-white flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-white/10 backdrop-blur-md flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-brand-200" />
          </div>
          <div>
            <h3 className="text-sm font-bold flex items-center gap-1.5">
              BorrowBox AI Agent
              <span className="text-[10px] font-semibold bg-emerald-400/20 text-emerald-200 px-1.5 py-0.2 rounded-full border border-emerald-400/30">
                Active
              </span>
            </h3>
            <p className="text-[11px] text-brand-100">Tool execution & rental automation</p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => {
              setMessages([
                {
                  role: 'model',
                  content: 'Session reset. What rental tasks can I help you execute today?',
                  timestamp: new Date().toISOString(),
                },
              ]);
              setConversationId('conv_' + Math.random().toString(36).substring(2, 9));
              setCurrentTask(null);
            }}
            title="Reset Conversation"
            className="p-1.5 text-brand-100 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 text-brand-100 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex items-start gap-2.5 ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
          >
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs flex-shrink-0 ${
                m.role === 'user'
                  ? 'bg-brand-600 text-white'
                  : 'bg-gradient-to-tr from-brand-500 to-brand-400 text-white shadow-sm'
              }`}
            >
              {m.role === 'user' ? <UserIcon className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            <div className={`max-w-[85%] space-y-2`}>
              <div
                className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-brand-600 text-white rounded-tr-none'
                    : 'bg-white text-slate-800 border border-slate-200/80 shadow-soft rounded-tl-none'
                }`}
              >
                <div className="whitespace-pre-line font-normal">{m.content}</div>
              </div>

              {/* Tool Execution Pills */}
              {m.toolCalls && m.toolCalls.length > 0 && (
                <div className="space-y-1">
                  {m.toolCalls.map((tc, tIdx) => (
                    <div
                      key={tIdx}
                      className="flex items-center gap-1.5 text-[10px] text-slate-600 bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-xs"
                    >
                      <Wrench className="w-3 h-3 text-brand-500" />
                      <span className="font-mono font-semibold text-slate-700">{tc.toolName}</span>
                      <span className="text-emerald-600 font-bold ml-auto">✓ verified</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Pending Action Card */}
              {m.pendingAction && (
                <AgentActionConfirmCard
                  pendingAction={m.pendingAction}
                  taskId={currentTask?._id || ''}
                  onConfirm={handleConfirmPending}
                  onCancel={handleCancelPending}
                />
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-slate-500 bg-white p-3 rounded-2xl border border-slate-200 w-fit">
            <LoadingSpinner size="sm" />
            <span>AI Agent is checking database records & planning tools...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompts */}
      {messages.length <= 2 && (
        <div className="p-3 bg-white border-t border-slate-100 flex flex-wrap gap-1.5">
          {quickPrompts.map((qp, qIdx) => (
            <button
              key={qIdx}
              onClick={() => handleSend(qp)}
              className="text-[11px] text-slate-600 hover:text-brand-600 bg-slate-50 hover:bg-brand-50 border border-slate-200 hover:border-brand-200 px-2.5 py-1 rounded-full transition-all text-left"
            >
              {qp}
            </button>
          ))}
        </div>
      )}

      {/* Input Form */}
      <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
        <input
          type="text"
          placeholder="Ask AI to find gear, calculate rates, create listing..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          disabled={isLoading}
          className="flex-1 px-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white text-slate-800"
        />
        <button
          type="submit"
          disabled={!inputText.trim() || isLoading}
          className="p-2.5 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white rounded-xl shadow-sm transition-colors flex-shrink-0"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
