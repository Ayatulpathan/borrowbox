import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Send,
  RotateCcw,
  Bot,
  User as UserIcon,
  Wrench,
  CheckCircle2,
  Clock,
  History,
  MessageSquare,
  ShieldAlert,
} from 'lucide-react';
import { AgentMessage, AgentTask } from '../types';
import { agentService } from '../services/agentService';
import { useAuth } from '../context/AuthContext';
import { AgentActionConfirmCard } from '../components/agent/AgentActionConfirmCard';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { Link } from 'react-router-dom';

export const AgentPage: React.FC = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<AgentTask[]>([]);
  const [selectedTask, setSelectedTask] = useState<AgentTask | null>(null);
  const [messages, setMessages] = useState<AgentMessage[]>([
    {
      role: 'model',
      content:
        '👋 Welcome to the **BorrowBox AI Rental Operator**!\n\nI am connected to real marketplace databases and can execute rental tasks for you through validated tools:\n\n• 🔍 **Search Listings**: "Find high-end Sony cameras under ৳2,000/day"\n• 📅 **Live Availability**: "Check if the tent is free next weekend"\n• 💰 **Price Calculation**: "Calculate total rental cost for 3 days"\n• 📦 **Listing Drafting**: "Help me write a high-converting description for my drone"\n• 📋 **Booking Management**: "Show my pending booking requests"\n• 📊 **Platform Summary**: "Summarize my active rentals and earnings"',
      timestamp: new Date().toISOString(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string>(
    () => 'agent_' + Math.random().toString(36).substring(2, 9)
  );

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchTasks = async () => {
    if (!user) return;
    try {
      const res = await agentService.getTasks();
      if (res.success) {
        setTasks(res.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isLoading) return;

    if (!user) {
      setMessages((prev) => [
        ...prev,
        { role: 'user', content: text, timestamp: new Date().toISOString() },
        {
          role: 'model',
          content: '⚠️ Please **log in or sign up** first so I can access your authorized marketplace tools.',
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
        setSelectedTask(res.data.task);

        const modelMsg: AgentMessage = {
          role: 'model',
          content: res.data.response,
          timestamp: new Date().toISOString(),
          toolCalls: res.data.toolCalls,
          pendingAction: res.data.pendingAction,
        };

        setMessages((prev) => [...prev, modelMsg]);
        fetchTasks();
      }
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'model',
          content: `❌ ${err.response?.data?.message || err.message || 'Error processing AI task'}`,
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmPending = async () => {
    if (!selectedTask) return;
    try {
      const res = await agentService.confirmAction(selectedTask._id);
      if (res.success) {
        setSelectedTask(res.data);
        setMessages((prev) => [
          ...prev,
          {
            role: 'model',
            content: `✅ Action confirmed and executed! Backend database state updated.`,
            timestamp: new Date().toISOString(),
          },
        ]);
        fetchTasks();
      }
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'model',
          content: `❌ Action failed: ${err.response?.data?.message || err.message}`,
          timestamp: new Date().toISOString(),
        },
      ]);
    }
  };

  const handleCancelPending = async () => {
    if (!selectedTask) return;
    try {
      const res = await agentService.cancelAction(selectedTask._id);
      if (res.success) {
        setSelectedTask(res.data);
        setMessages((prev) => [
          ...prev,
          {
            role: 'model',
            content: `🚫 Action declined. No changes were committed.`,
            timestamp: new Date().toISOString(),
          },
        ]);
        fetchTasks();
      }
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleLoadTask = (task: AgentTask) => {
    setSelectedTask(task);
    setConversationId(task.conversationId);
    if (task.messages && task.messages.length > 0) {
      setMessages(task.messages);
    }
  };

  const handleNewSession = () => {
    setSelectedTask(null);
    setConversationId('agent_' + Math.random().toString(36).substring(2, 9));
    setMessages([
      {
        role: 'model',
        content: 'New session started. What marketplace operations would you like me to execute?',
        timestamp: new Date().toISOString(),
      },
    ]);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 h-[calc(100vh-140px)] flex flex-col">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 h-full min-h-0">
        {/* Left Sidebar: Task History */}
        <div className="hidden lg:flex lg:col-span-4 bg-white rounded-3xl border border-slate-200 p-4 shadow-card flex-col h-full overflow-hidden">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
              <History className="w-4 h-4 text-brand-600" />
              <span>AI Task History</span>
            </div>
            <button
              onClick={handleNewSession}
              className="px-2.5 py-1 bg-brand-50 hover:bg-brand-100 text-brand-700 text-xs font-bold rounded-lg transition-colors"
            >
              + New Task
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 py-3">
            {tasks.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">
                No past tasks. Start chatting with the agent to create automated tasks!
              </div>
            ) : (
              tasks.map((t) => (
                <div
                  key={t._id}
                  onClick={() => handleLoadTask(t)}
                  className={`p-3 rounded-2xl border text-xs cursor-pointer transition-all space-y-1 ${
                    selectedTask?._id === t._id
                      ? 'bg-brand-50/70 border-brand-300 shadow-xs'
                      : 'bg-white border-slate-100 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 truncate max-w-[180px]">
                      {t.title || 'Marketplace Task'}
                    </span>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                        t.status === 'completed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : t.status === 'awaiting_confirmation'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {t.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 truncate">{t.prompt}</p>
                  <div className="flex items-center gap-2 text-[10px] text-slate-400 pt-1">
                    <span>{t.toolCalls?.length || 0} tools executed</span>
                    <span>•</span>
                    <span>{new Date(t.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Safety Notice */}
          <div className="pt-3 border-t border-slate-100 flex items-start gap-2 text-[11px] text-slate-500">
            <ShieldAlert className="w-4 h-4 text-brand-500 flex-shrink-0 mt-0.5" />
            <span>Consequential actions (bookings, cancellations) require your explicit confirmation.</span>
          </div>
        </div>

        {/* Main Conversation Window (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200 shadow-card flex flex-col h-full overflow-hidden">
          {/* Header */}
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-brand-400 flex items-center justify-center text-white shadow-sm">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  BorrowBox Autonomous Assistant
                  <span className="text-[10px] font-semibold bg-brand-100 text-brand-700 px-2 py-0.5 rounded-full">
                    Tool-Calling Engine
                  </span>
                </h3>
                <p className="text-[11px] text-slate-500">Connected to live MongoDB Atlas database</p>
              </div>
            </div>

            <button
              onClick={handleNewSession}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              title="Reset"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-slate-50/60">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex items-start gap-3 ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
              >
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs flex-shrink-0 ${
                    m.role === 'user'
                      ? 'bg-brand-600 text-white'
                      : 'bg-white border border-slate-200 text-brand-600 shadow-xs'
                  }`}
                >
                  {m.role === 'user' ? <UserIcon className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                <div className={`max-w-[80%] space-y-2`}>
                  <div
                    className={`p-4 rounded-2xl text-xs leading-relaxed ${
                      m.role === 'user'
                        ? 'bg-brand-600 text-white rounded-tr-none'
                        : 'bg-white text-slate-800 border border-slate-200 shadow-soft rounded-tl-none'
                    }`}
                  >
                    <div className="whitespace-pre-line">{m.content}</div>
                  </div>

                  {/* Tool Call Badges */}
                  {m.toolCalls && m.toolCalls.length > 0 && (
                    <div className="space-y-1">
                      {m.toolCalls.map((tc, tIdx) => (
                        <div
                          key={tIdx}
                          className="flex items-center gap-2 text-[10px] text-slate-600 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-xs"
                        >
                          <Wrench className="w-3.5 h-3.5 text-brand-500" />
                          <span className="font-mono font-bold text-slate-800">{tc.toolName}</span>
                          <span className="text-emerald-600 font-bold ml-auto flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> verified database state
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Pending Action Approval Card */}
                  {m.pendingAction && (
                    <AgentActionConfirmCard
                      pendingAction={m.pendingAction}
                      taskId={selectedTask?._id || ''}
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
                <span>Executing backend marketplace tools & checking availability...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Box */}
          <div className="p-4 bg-white border-t border-slate-200 space-y-2">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                placeholder="Give instructions (e.g., 'Find camera for 3 days', 'Check my bookings', 'Create a listing draft')..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                disabled={isLoading}
                className="flex-1 px-4 py-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white text-slate-800 font-medium"
              />
              <button
                type="submit"
                disabled={!inputText.trim() || isLoading}
                className="p-3 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white rounded-xl shadow-md transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
