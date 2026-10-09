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
    await new Promise((r) => setTimeout(r, 200));
    const savedUser = localStorage.getItem('borrowbox_user');
    const user = savedUser ? JSON.parse(savedUser) : { id: 'usr_guest', name: 'Member' };
    const data = mockDb.processAIMessage(prompt, user);
    return { success: true, data };
  },

  async getTasks(): Promise<{ success: boolean; data: AgentTask[] }> {
    return { success: true, data: mockDb.getTasks() };
  },

  async getTaskById(id: string): Promise<{ success: boolean; data: AgentTask }> {
    const task = mockDb.getTasks().find((t) => t._id === id);
    if (!task) throw new Error('Task not found');
    return { success: true, data: task };
  },

  async confirmAction(taskId: string): Promise<{ success: boolean; message: string; data: AgentTask }> {
    return {
      success: true,
      message: 'Action executed successfully!',
      data: mockDb.getTasks()[0] || ({} as any),
    };
  },

  async cancelAction(taskId: string): Promise<{ success: boolean; message: string; data: AgentTask }> {
    return {
      success: true,
      message: 'Action cancelled.',
      data: mockDb.getTasks()[0] || ({} as any),
    };
  },
};
