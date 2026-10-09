import { GoogleGenerativeAI, FunctionDeclaration, SchemaType } from '@google/generative-ai';
import { config } from '../config/env.js';
import { AI_TOOLS, ToolContext } from './aiToolRegistry.js';
import { AgentTask, IAgentTask, IToolCallRecord } from '../models/AgentTask.js';
import mongoose from 'mongoose';

export class GeminiService {
  private static genAI = config.GEMINI_API_KEY ? new GoogleGenerativeAI(config.GEMINI_API_KEY) : null;

  /**
   * Process a user prompt, plan workflow, call read-only tools or pause for confirmation on consequential tools.
   */
  static async processUserMessage(params: {
    userId: mongoose.Types.ObjectId;
    userRole: string;
    prompt: string;
    conversationId?: string;
  }): Promise<{
    task: IAgentTask;
    response: string;
    pendingAction?: any;
    toolCalls: IToolCallRecord[];
  }> {
    const { userId, userRole, prompt, conversationId = new mongoose.Types.ObjectId().toString() } = params;

    // Retrieve or create AgentTask
    let task = await AgentTask.findOne({ conversationId });
    if (!task) {
      task = new AgentTask({
        user: userId,
        conversationId,
        title: prompt.slice(0, 50),
        prompt,
        status: 'planning',
        plan: [],
        toolCalls: [],
        messages: [],
      });
    }

    // Add user message
    task.messages.push({
      role: 'user',
      content: prompt,
      timestamp: new Date(),
    });

    const context: ToolContext = {
      userId,
      userRole,
    };

    // If Gemini API Key is configured, run Gemini generative model with tools
    if (this.genAI && config.GEMINI_API_KEY) {
      return this.runWithGemini(task, prompt, context);
    } else {
      // Intelligent deterministic fallback agent
      return this.runWithFallbackAgent(task, prompt, context);
    }
  }

  /**
   * Gemini SDK Function Calling loop with Human-In-The-Loop Confirmation
   */
  private static async runWithGemini(
    task: IAgentTask,
    prompt: string,
    context: ToolContext
  ): Promise<{ task: IAgentTask; response: string; pendingAction?: any; toolCalls: IToolCallRecord[] }> {
    try {
      const functionDeclarations: FunctionDeclaration[] = Object.values(AI_TOOLS).map((tool) => ({
        name: tool.name,
        description: tool.description,
        parameters: {
          type: SchemaType.OBJECT,
          properties: Object.entries(tool.parameters.properties).reduce((acc, [k, v]) => {
            acc[k] = {
              type: v.type === 'NUMBER' ? SchemaType.NUMBER : SchemaType.STRING,
              description: v.description,
            };
            return acc;
          }, {} as any),
          required: tool.parameters.required || [],
        },
      }));

      const model = this.genAI!.getGenerativeModel({
        model: config.GEMINI_MODEL || 'gemini-1.5-flash',
        systemInstruction: `You are the BorrowBox AI Rental Assistant, an autonomous operator for a peer-to-peer rental marketplace.
Your goal is to help users find items to rent, check live calendar availability, calculate exact rental costs, manage listing drafts, and handle booking requests.
Rules:
1. Always use real marketplace tools to fetch real database data. Never hallucinate products, prices, or availability.
2. For consequential actions (booking requests, cancelling bookings, publishing listings, approving/rejecting booking requests), ALWAYS verify details first and explain that you are preparing the action for user confirmation.
3. Be clear, concise, and courteous. Present currency amounts in BDT (৳) or USD ($).`,
        tools: [{ functionDeclarations }],
      });

      const history = task.messages.slice(-8, -1).map((m) => ({
        role: m.role === 'model' ? 'model' : 'user',
        parts: [{ text: m.content }],
      }));

      const chat = model.startChat({ history });
      const result = await chat.sendMessage(prompt);
      const functionCalls = result.response.functionCalls();

      const toolCallRecords: IToolCallRecord[] = [];
      let pendingAction: any = undefined;
      let finalAnswer = result.response.text() || '';

      if (functionCalls && functionCalls.length > 0) {
        for (const call of functionCalls) {
          const tool = AI_TOOLS[call.name];
          if (!tool) continue;

          if (tool.requiresConfirmation) {
            // Consequential operation: pause and request user confirmation
            pendingAction = {
              toolName: tool.name,
              args: call.args as Record<string, any>,
              description: `Are you sure you want to execute ${tool.name} with parameters: ${JSON.stringify(call.args)}?`,
              requiresConfirmation: true,
            };
            task.status = 'awaiting_confirmation';
            task.pendingAction = pendingAction;
            finalAnswer = `I have prepared the action for you. Please confirm below to proceed with executing: **${tool.name}**.`;
          } else {
            // Execute read-only tool
            try {
              const execResult = await tool.execute(call.args, context);
              const record: IToolCallRecord = {
                toolName: tool.name,
                args: call.args as Record<string, any>,
                result: execResult,
                status: 'success',
                timestamp: new Date(),
              };
              toolCallRecords.push(record);
              task.toolCalls.push(record);

              const followUp = await chat.sendMessage([
                {
                  functionResponse: {
                    name: call.name,
                    response: { name: call.name, content: execResult },
                  },
                },
              ]);
              finalAnswer = followUp.response.text() || JSON.stringify(execResult);
            } catch (err: any) {
              const record: IToolCallRecord = {
                toolName: tool.name,
                args: call.args as Record<string, any>,
                error: err.message,
                status: 'failed',
                timestamp: new Date(),
              };
              toolCallRecords.push(record);
              task.toolCalls.push(record);
              finalAnswer = `Error executing tool ${tool.name}: ${err.message}`;
            }
          }
        }
      }

      task.messages.push({
        role: 'model',
        content: finalAnswer,
        timestamp: new Date(),
        toolCalls: toolCallRecords,
        pendingAction,
      });

      if (!pendingAction) {
        task.status = 'completed';
      }

      await task.save();
      return { task, response: finalAnswer, pendingAction, toolCalls: toolCallRecords };
    } catch (error) {
      console.warn('Gemini API call encountered error, falling back to deterministic agent:', error);
      return this.runWithFallbackAgent(task, prompt, context);
    }
  }

  /**
   * Deterministic NLP rule-based engine when Gemini API is unconfigured or in offline test mode
   */
  private static async runWithFallbackAgent(
    task: IAgentTask,
    prompt: string,
    context: ToolContext
  ): Promise<{ task: IAgentTask; response: string; pendingAction?: any; toolCalls: IToolCallRecord[] }> {
    const lower = prompt.toLowerCase();
    const toolCallRecords: IToolCallRecord[] = [];
    let responseText = '';
    let pendingAction: any = undefined;

    if (lower.includes('find') || lower.includes('search') || lower.includes('camera') || lower.includes('rent') || lower.includes('show')) {
      let query = '';
      if (lower.includes('camera') || lower.includes('sony') || lower.includes('canon')) query = 'camera';
      if (lower.includes('tent') || lower.includes('camping')) query = 'camping';
      if (lower.includes('drill') || lower.includes('tool')) query = 'tool';
      if (lower.includes('laptop') || lower.includes('macbook')) query = 'laptop';
      if (lower.includes('projector')) query = 'projector';

      const result = await AI_TOOLS.searchListings.execute({ query }, context);
      const record: IToolCallRecord = {
        toolName: 'searchListings',
        args: { query },
        result,
        status: 'success',
        timestamp: new Date(),
      };
      toolCallRecords.push(record);
      task.toolCalls.push(record);

      if (result.results && result.results.length > 0) {
        responseText = `I found **${result.results.length} available items** matching your query on BorrowBox:\n\n` +
          result.results.map((r: any) => `• **${r.title}** (${r.category}) — ৳${r.dailyPrice}/day | ${r.city} | Rating: ⭐ ${r.rating}`).join('\n') +
          `\n\nWould you like me to check availability, calculate rental cost, or prepare a booking for any of these?`;
      } else {
        responseText = `I searched the marketplace but couldn't find exact matches for "${query || prompt}". Try searching across our main categories like Cameras, Electronics, Tools, or Camping gear!`;
      }
    } else if (lower.includes('my booking') || lower.includes('my rentals')) {
      const result = await AI_TOOLS.getMyBookings.execute({}, context);
      const record: IToolCallRecord = {
        toolName: 'getMyBookings',
        args: {},
        result,
        status: 'success',
        timestamp: new Date(),
      };
      toolCallRecords.push(record);
      task.toolCalls.push(record);

      if (result.bookings && result.bookings.length > 0) {
        responseText = `Here are your recent bookings:\n\n` +
          result.bookings.map((b: any) => `• **${b.itemTitle}** (${b.status.toUpperCase()}) — ${new Date(b.startDate).toLocaleDateString()} to ${new Date(b.endDate).toLocaleDateString()} (Total: ৳${b.totalAmount})`).join('\n');
      } else {
        responseText = `You don't have any active or past bookings yet. You can browse the marketplace to find items you need!`;
      }
    } else if (lower.includes('summary') || lower.includes('earnings') || lower.includes('spending')) {
      const result = await AI_TOOLS.generateRentalSummary.execute({}, context);
      const record: IToolCallRecord = {
        toolName: 'generateRentalSummary',
        args: {},
        result,
        status: 'success',
        timestamp: new Date(),
      };
      toolCallRecords.push(record);
      task.toolCalls.push(record);

      responseText = `📊 **Your BorrowBox Rental Summary**:\n\n` +
        `**As Renter:**\n- Active Rentals: ${result.renterSummary.activeRentalsCount}\n- Pending Requests: ${result.renterSummary.pendingRequestsCount}\n- Total Spent: ৳${result.renterSummary.totalSpentBDT}\n\n` +
        `**As Lender / Owner:**\n- Pending Requests to Respond: ${result.ownerSummary.pendingRequestsToRespond}\n- Active Lends: ${result.ownerSummary.activeLendsCount}\n- Total Earned: ৳${result.ownerSummary.totalEarnedBDT}`;
    } else if (lower.includes('cancel booking') || lower.includes('cancel my')) {
      const match = prompt.match(/[0-9a-fA-F]{24}/);
      const bookingId = match ? match[0] : '';
      if (bookingId) {
        pendingAction = {
          toolName: 'cancelEligibleBooking',
          args: { bookingId, reason: 'User requested cancellation via AI' },
          description: `Cancel booking ID #${bookingId}`,
          requiresConfirmation: true,
        };
        task.status = 'awaiting_confirmation';
        task.pendingAction = pendingAction;
        responseText = `⚠️ **Cancellation Confirmation Required**: Are you sure you want to cancel booking **#${bookingId}**? Please click confirm below to proceed.`;
      } else {
        responseText = `Please provide the Booking ID you would like to cancel. You can check your booking IDs by asking "Show my bookings".`;
      }
    } else if (lower.includes('help me create a listing') || lower.includes('describe') || lower.includes('draft')) {
      const result = await AI_TOOLS.generateListingDescription.execute({ itemName: prompt.slice(0, 40) }, context);
      const record: IToolCallRecord = {
        toolName: 'generateListingDescription',
        args: { itemName: prompt },
        result,
        status: 'success',
        timestamp: new Date(),
      };
      toolCallRecords.push(record);
      task.toolCalls.push(record);

      responseText = `✨ **Here is a draft listing description generated for your item:**\n\n` +
        `**Title:** ${result.suggestedTitle}\n\n` +
        `**Description:**\n${result.suggestedDescription}\n\n` +
        `**Recommended Rules:**\n` + result.suggestedRules.map((r: string) => `- ${r}`).join('\n') +
        `\n\nWould you like me to save this draft to your listings?`;
    } else {
      responseText = `Hello! I am your BorrowBox AI Rental Assistant. I can help you with:\n\n` +
        `🔍 **Find gear**: *"Find a Sony camera under ৳1,500/day in Dhaka"*\n` +
        `📅 **Check availability**: *"Is the Canon R5 available next Friday?"*\n` +
        `💰 **Cost calculation**: *"Calculate rental cost for 4 days"*\n` +
        `📦 **Manage listings**: *"Help me write a description for my camping tent"*\n` +
        `📋 **Check bookings**: *"Show my pending booking requests"*\n` +
        `📊 **Rental summary**: *"Summarize my spending and active rentals"*`;
    }

    task.messages.push({
      role: 'model',
      content: responseText,
      timestamp: new Date(),
      toolCalls: toolCallRecords,
      pendingAction,
    });

    if (!pendingAction) {
      task.status = 'completed';
    }

    await task.save();
    return { task, response: responseText, pendingAction, toolCalls: toolCallRecords };
  }

  /**
   * User confirms a pending consequential action -> Agent executes the tool and records result.
   */
  static async confirmPendingAction(taskId: string, userId: mongoose.Types.ObjectId, userRole: string): Promise<IAgentTask> {
    const task = await AgentTask.findById(taskId);
    if (!task) {
      throw new Error('Agent task not found.');
    }

    if (task.user.toString() !== userId.toString() && userRole !== 'admin') {
      throw new Error('Unauthorized to confirm this action.');
    }

    if (!task.pendingAction) {
      throw new Error('No pending action awaiting confirmation on this task.');
    }

    const { toolName, args } = task.pendingAction;
    const tool = AI_TOOLS[toolName];
    if (!tool) {
      throw new Error(`Tool ${toolName} not found in registry.`);
    }

    try {
      task.status = 'executing';
      const result = await tool.execute(args, { userId, userRole });
      const record: IToolCallRecord = {
        toolName,
        args,
        result,
        status: 'success',
        timestamp: new Date(),
      };
      task.toolCalls.push(record);
      task.status = 'completed';
      task.pendingAction = undefined;

      const successMsg = `✅ **Action Confirmed & Executed**: ${result.message || 'Operation succeeded!'}`;
      task.messages.push({
        role: 'model',
        content: successMsg,
        timestamp: new Date(),
        toolCalls: [record],
      });

      await task.save();
      return task;
    } catch (err: any) {
      task.status = 'failed';
      const record: IToolCallRecord = {
        toolName,
        args,
        error: err.message,
        status: 'failed',
        timestamp: new Date(),
      };
      task.toolCalls.push(record);
      task.messages.push({
        role: 'model',
        content: `❌ **Action Failed**: ${err.message}`,
        timestamp: new Date(),
        toolCalls: [record],
      });
      await task.save();
      throw err;
    }
  }

  /**
   * User rejects/cancels a pending consequential action.
   */
  static async cancelPendingAction(taskId: string, userId: mongoose.Types.ObjectId, userRole: string): Promise<IAgentTask> {
    const task = await AgentTask.findById(taskId);
    if (!task) throw new Error('Agent task not found.');
    if (task.user.toString() !== userId.toString() && userRole !== 'admin') {
      throw new Error('Unauthorized.');
    }

    task.status = 'completed';
    task.pendingAction = undefined;
    task.messages.push({
      role: 'model',
      content: '🚫 The pending action was cancelled. No changes were made to the database.',
      timestamp: new Date(),
    });
    await task.save();
    return task;
  }
}
