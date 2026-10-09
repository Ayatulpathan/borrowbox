import { api } from './api';
import { AgentTask } from '../types';

export const agentService = {
  async sendMessage(prompt: string, conversationId?: string): Promise<{
    success: boolean;
    data: {
      task: AgentTask;
      response: string;
      pendingAction?: any;
      toolCalls: any[];
    };
  }> {
    const res = await api.post('/agent/chat', { prompt, conversationId });
    return res.data;
  },

  async getTasks(): Promise<{ success: boolean; data: AgentTask[] }> {
    const res = await api.get('/agent/tasks');
    return res.data;
  },

  async getTaskById(id: string): Promise<{ success: boolean; data: AgentTask }> {
    const res = await api.get(`/agent/tasks/${id}`);
    return res.data;
  },

  async confirmAction(taskId: string): Promise<{ success: boolean; message: string; data: AgentTask }> {
    const res = await api.post(`/agent/tasks/${taskId}/confirm`);
    return res.data;
  },

  async cancelAction(taskId: string): Promise<{ success: boolean; message: string; data: AgentTask }> {
    const res = await api.post(`/agent/tasks/${taskId}/cancel`);
    return res.data;
  },
};
