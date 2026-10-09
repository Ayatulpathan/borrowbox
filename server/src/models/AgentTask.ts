import mongoose, { Document, Schema } from 'mongoose';

export interface IToolCallRecord {
  toolName: string;
  args: Record<string, any>;
  result?: any;
  status: 'pending' | 'success' | 'failed';
  error?: string;
  timestamp: Date;
}

export interface IPendingAction {
  toolName: string;
  args: Record<string, any>;
  description: string;
  requiresConfirmation: boolean;
}

export interface IAgentMessage {
  role: 'user' | 'model' | 'system';
  content: string;
  timestamp: Date;
  toolCalls?: IToolCallRecord[];
  pendingAction?: IPendingAction;
}

export interface IAgentTask extends Document {
  _id: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  conversationId: string;
  title: string;
  prompt: string;
  status: 'planning' | 'awaiting_confirmation' | 'executing' | 'completed' | 'failed';
  plan: string[];
  pendingAction?: IPendingAction;
  toolCalls: IToolCallRecord[];
  resultSummary?: string;
  messages: IAgentMessage[];
  createdAt: Date;
  updatedAt: Date;
}

const AgentTaskSchema = new Schema<IAgentTask>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    conversationId: {
      type: String,
      required: true,
      index: true,
    },
    title: {
      type: String,
      default: 'Rental Assistance Task',
    },
    prompt: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['planning', 'awaiting_confirmation', 'executing', 'completed', 'failed'],
      default: 'planning',
      index: true,
    },
    plan: {
      type: [String],
      default: [],
    },
    pendingAction: {
      toolName: { type: String },
      args: { type: Schema.Types.Mixed },
      description: { type: String },
      requiresConfirmation: { type: Boolean, default: false },
    },
    toolCalls: [
      {
        toolName: { type: String, required: true },
        args: { type: Schema.Types.Mixed, default: {} },
        result: { type: Schema.Types.Mixed },
        status: { type: String, enum: ['pending', 'success', 'failed'], default: 'pending' },
        error: { type: String },
        timestamp: { type: Date, default: Date.now },
      },
    ],
    resultSummary: {
      type: String,
    },
    messages: [
      {
        role: { type: String, enum: ['user', 'model', 'system'], required: true },
        content: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
        toolCalls: { type: Schema.Types.Mixed },
        pendingAction: { type: Schema.Types.Mixed },
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const AgentTask = mongoose.model<IAgentTask>('AgentTask', AgentTaskSchema);
