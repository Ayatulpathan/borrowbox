export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  avatar?: string;
  phone?: string;
  bio?: string;
  location?: {
    city?: string;
    area?: string;
    address?: string;
  };
  isVerified: boolean;
  rating: {
    average: number;
    count: number;
  };
}

export interface Listing {
  _id: string;
  title: string;
  description: string;
  category: string;
  owner: User | { _id: string; name: string; avatar?: string; rating?: { average: number; count: number }; isVerified?: boolean };
  pricing: {
    hourly?: number;
    daily: number;
    weekly?: number;
  };
  securityDeposit: number;
  currency: string;
  images: string[];
  location: {
    city: string;
    area: string;
    address?: string;
    coordinates?: { lat: number; lng: number };
  };
  itemCondition: 'Brand New' | 'Like New' | 'Good' | 'Fair';
  specs: Array<{ key: string; value: string }>;
  includedAccessories: string[];
  rules: string[];
  cancellationPolicy: 'Flexible' | 'Moderate' | 'Strict';
  pickupDelivery: {
    pickup: boolean;
    delivery: boolean;
    deliveryFee?: number;
  };
  status: 'draft' | 'published' | 'paused' | 'archived';
  isFeatured: boolean;
  ratingSummary: {
    average: number;
    count: number;
  };
  totalBookings: number;
  createdAt: string;
  updatedAt: string;
}

export interface PricingBreakdown {
  rateType: 'hourly' | 'daily' | 'weekly';
  unitRate: number;
  durationDays: number;
  durationHours: number;
  subtotal: number;
  securityDeposit: number;
  serviceFee: number;
  deliveryFee: number;
  totalAmount: number;
  currency: string;
  isAvailable?: boolean;
}

export interface Booking {
  _id: string;
  listing: Listing;
  renter: User;
  owner: User;
  startDate: string;
  endDate: string;
  rentalDuration: {
    days: number;
    hours?: number;
  };
  pricingBreakdown: {
    rateType: 'hourly' | 'daily' | 'weekly';
    unitRate: number;
    subtotal: number;
    securityDeposit: number;
    serviceFee: number;
    deliveryFee: number;
    totalAmount: number;
    currency: string;
  };
  deliveryOption: 'pickup' | 'delivery';
  deliveryAddress?: string;
  specialInstructions?: string;
  status: 'pending' | 'approved' | 'active' | 'completed' | 'cancelled' | 'rejected';
  paymentStatus: 'simulated_paid' | 'unpaid' | 'refunded';
  cancellationReason?: string;
  confirmedAt?: string;
  completedAt?: string;
  createdAt: string;
}

export interface Review {
  _id: string;
  booking: string;
  listing: string;
  reviewer: User;
  targetUser: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface NotificationItem {
  _id: string;
  title: string;
  message: string;
  type: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
}

export interface ToolCallRecord {
  toolName: string;
  args: Record<string, any>;
  result?: any;
  status: 'pending' | 'success' | 'failed';
  error?: string;
  timestamp: string;
}

export interface PendingAction {
  toolName: string;
  args: Record<string, any>;
  description: string;
  requiresConfirmation: boolean;
}

export interface AgentMessage {
  role: 'user' | 'model' | 'system';
  content: string;
  timestamp: string;
  toolCalls?: ToolCallRecord[];
  pendingAction?: PendingAction;
}

export interface AgentTask {
  _id: string;
  conversationId: string;
  title: string;
  prompt: string;
  status: 'planning' | 'awaiting_confirmation' | 'executing' | 'completed' | 'failed';
  plan: string[];
  pendingAction?: PendingAction;
  toolCalls: ToolCallRecord[];
  resultSummary?: string;
  messages: AgentMessage[];
  createdAt: string;
  updatedAt: string;
}
