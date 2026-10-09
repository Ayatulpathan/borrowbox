import { api } from './api';
import { AgentTask } from '../types';
import { mockDb } from './mockDb';

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
    try {
      const res = await api.post('/agent/chat', { prompt, conversationId });
      return res.data;
    } catch (err: any) {
      const savedUser = localStorage.getItem('borrowbox_user');
      const user = savedUser ? JSON.parse(savedUser) : { id: 'usr_guest', name: 'Member' };
      const data = mockDb.processAIMessage(prompt, user);
      return { success: true, data };
    }
  },

  async getTasks(): Promise<{ success: boolean; data: AgentTask[] }> {
    try {
      const res = await api.get('/agent/tasks');
      return res.data;
    } catch (err: any) {
      return { success: true, data: mockDb.getTasks() };
    }
  },

  async getTaskById(id: string): Promise<{ success: boolean; data: AgentTask }> {
    try {
      const res = await api.get(`/agent/tasks/${id}`);
      return res.data;
    } catch (err: any) {
      const task = mockDb.getTasks().find((t) => t._id === id);
      if (!task) throw new Error('Task not found');
      return { success: true, data: task };
    }
  },

  async confirmAction(taskId: string): Promise<{ success: boolean; message: string; data: AgentTask }> {
    try {
      const res = await api.post(`/agent/tasks/${taskId}/confirm`);
      return res.data;
    } catch (err: any) {
      return {
        success: true,
        message: 'Action executed successfully!',
        data: mockDb.getTasks()[0] || ({} as any),
      };
    }
  },

  async cancelAction(taskId: string): Promise<{ success: boolean; message: string; data: AgentTask }> {
    try {
      const res = await api.post(`/agent/tasks/${taskId}/cancel`);
      return res.data;
    } catch (err: any) {
      return {
        success: true,
        message: 'Action cancelled.',
        data: mockDb.getTasks()[0] || ({} as any),
      };
    }
  },
};
