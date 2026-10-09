import React, { useState } from 'react';
import { AlertTriangle, CheckCircle, XCircle, ArrowRight } from 'lucide-react';
import { PendingAction } from '../../types';
import { LoadingSpinner } from '../common/LoadingSpinner';

interface AgentActionConfirmCardProps {
  pendingAction: PendingAction;
  taskId: string;
  onConfirm: () => Promise<void>;
  onCancel: () => Promise<void>;
}

export const AgentActionConfirmCard: React.FC<AgentActionConfirmCardProps> = ({
  pendingAction,
  taskId,
  onConfirm,
  onCancel,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleConfirm = async () => {
    setIsProcessing(true);
    try {
      await onConfirm();
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancel = async () => {
    setIsProcessing(true);
    try {
      await onCancel();
    } finally {
      setIsProcessing(false);
    }
  };

  const getToolTitle = (toolName: string) => {
    switch (toolName) {
      case 'createBookingRequest':
        return 'Submit Booking Reservation Request';
      case 'cancelEligibleBooking':
        return 'Cancel Existing Booking';
      case 'submitListingForApproval':
        return 'Publish Marketplace Listing';
      case 'respondToBookingRequest':
        return 'Respond to Incoming Booking Request';
      default:
        return `Execute ${toolName}`;
    }
  };

  return (
    <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/80 shadow-sm space-y-3 my-2 animate-in fade-in slide-in-from-bottom-2">
      <div className="flex items-start gap-2.5">
        <div className="p-1.5 rounded-lg bg-amber-100 text-amber-700 flex-shrink-0">
          <AlertTriangle className="w-4 h-4" />
        </div>
        <div>
          <span className="text-[10px] uppercase font-bold tracking-wider text-amber-800 bg-amber-200/60 px-2 py-0.5 rounded">
            Confirmation Required
          </span>
          <h4 className="text-xs font-bold text-slate-900 mt-1">{getToolTitle(pendingAction.toolName)}</h4>
          <p className="text-xs text-slate-700 mt-0.5">{pendingAction.description}</p>
        </div>
      </div>

      {/* Structured Argument Details */}
      {pendingAction.args && Object.keys(pendingAction.args).length > 0 && (
        <div className="p-2.5 bg-white/90 rounded-xl border border-amber-100 text-[11px] font-mono space-y-1">
          {Object.entries(pendingAction.args).map(([k, v]) => (
            <div key={k} className="flex justify-between text-slate-700">
              <span className="font-semibold text-slate-500">{k}:</span>
              <span className="truncate max-w-[200px] text-slate-900">{String(v)}</span>
            </div>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 pt-1">
        <button
          onClick={handleConfirm}
          disabled={isProcessing}
          className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
        >
          {isProcessing ? (
            <LoadingSpinner size="sm" />
          ) : (
            <>
              <CheckCircle className="w-3.5 h-3.5" /> Confirm & Execute
            </>
          )}
        </button>

        <button
          onClick={handleCancel}
          disabled={isProcessing}
          className="py-2 px-3 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-semibold text-xs rounded-xl transition-colors disabled:opacity-50"
        >
          Decline
        </button>
      </div>
    </div>
  );
};
