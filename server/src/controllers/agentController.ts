import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { GeminiService } from '../services/geminiService.js';
import { AgentTask } from '../models/AgentTask.js';

export const chatWithAgent = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const { prompt, conversationId } = req.body;
    if (!prompt) {
      return res.status(400).json({ success: false, message: 'Prompt message is required.' });
    }

    const result = await GeminiService.processUserMessage({
      userId: req.user._id,
      userRole: req.user.role,
      prompt,
      conversationId,
    });

    res.status(200).json({
      success: true,
      data: {
        task: result.task,
        response: result.response,
        pendingAction: result.pendingAction,
        toolCalls: result.toolCalls,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Agent processing error' });
  }
};

export const getTasks = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const tasks = await AgentTask.find({ user: req.user._id }).sort({ updatedAt: -1 }).limit(20);
    res.status(200).json({ success: true, data: tasks });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getTaskById = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const task = await AgentTask.findById(req.params.id);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found.' });

    if (task.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized to view this task.' });
    }

    res.status(200).json({ success: true, data: task });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const confirmAction = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const updatedTask = await GeminiService.confirmPendingAction(
      req.params.id,
      req.user._id,
      req.user.role
    );

    res.status(200).json({
      success: true,
      message: 'Consequential action confirmed and executed successfully.',
      data: updatedTask,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const cancelAction = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const updatedTask = await GeminiService.cancelPendingAction(
      req.params.id,
      req.user._id,
      req.user.role
    );

    res.status(200).json({
      success: true,
      message: 'Pending action was cancelled.',
      data: updatedTask,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};
