import React, { useState } from 'react';
import { X, Star, Phone, Mail, ShoppingBag, Clock, DollarSign, Edit3, UserCheck } from 'lucide-react';
import { Customer, Order } from '../../types';

interface CustomerDetailModalProps {
  customer: Customer;
  orders: Order[];
  onClose: () => void;
  onUpdateCustomer: (updated: Customer) => void;
}

export const CustomerDetailModal: React.FC<CustomerDetailModalProps> = ({
  customer,
  orders,
  onClose,
  onUpdateCustomer,
}) => {
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [notesText, setNotesText] = useState(customer.notes || '');

  const customerOrders = orders.filter((o) => o.customerId === customer.id);

  const handleSaveNotes = () => {
    onUpdateCustomer({ ...customer, notes: notesText.trim() });
    setIsEditingNotes(false);
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in duration-150 flex flex-col max-h-[88vh]"
      >
        {/* Header */}
        <div className="p-6 bg-slate-900 text-white flex items-start justify-between">
          <div className="flex items-center gap-3.5">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg text-white shadow-inner"
              style={{ backgroundColor: customer.avatarColor || '#2F5D57' }}
            >
              {customer.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold tracking-tight">{customer.name}</h3>
                <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  {customer.tier}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5 font-mono">
                {customer.phone || 'No phone recorded'} · {customer.email || 'No email'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Member Metrics */}
        <div className="grid grid-cols-3 gap-3 p-5 bg-slate-50 border-b border-slate-200 text-xs">
          <div className="bg-white p-3 rounded-xl border border-slate-200">
            <span className="text-slate-500 font-semibold text-[11px] block">Loyalty Points</span>
            <div className="flex items-center gap-1.5 mt-1">
              <Star size={16} className="text-amber-500 fill-amber-500" />
              <span className="text-xl font-bold font-mono text-slate-900">{customer.points}</span>
            </div>
          </div>

          <div className="bg-white p-3 rounded-xl border border-slate-200">
            <span className="text-slate-500 font-semibold text-[11px] block">Total Spent</span>
            <div className="text-xl font-bold font-mono text-emerald-800 mt-1">
              EGP {customer.spent.toLocaleString()}
            </div>
          </div>

          <div className="bg-white p-3 rounded-xl border border-slate-200">
            <span className="text-slate-500 font-semibold text-[11px] block">Total Visits</span>
            <div className="text-xl font-bold font-mono text-slate-900 mt-1">
              {customer.visits}
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1 text-xs">
          {/* Member Preferences & Notes */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Dietary Preferences & Notes
              </label>
              {!isEditingNotes && (
                <button
                  type="button"
                  onClick={() => setIsEditingNotes(true)}
                  className="text-emerald-800 hover:text-emerald-950 font-semibold text-[11px] flex items-center gap-1"
                >
                  <Edit3 size={12} /> Edit Notes
                </button>
              )}
            </div>

            {isEditingNotes ? (
              <div className="space-y-2">
                <textarea
                  value={notesText}
                  onChange={(e) => setNotesText(e.target.value)}
                  rows={3}
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:border-emerald-700"
                  placeholder="e.g. Prefers oat milk, sits at Quiet Zone..."
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditingNotes(false)}
                    className="px-3 py-1 text-slate-500 hover:bg-slate-100 rounded-lg font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveNotes}
                    className="px-3 py-1 bg-emerald-800 text-white rounded-lg font-bold"
                  >
                    Save Notes
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 italic">
                {customer.notes ? `"${customer.notes}"` : 'No special notes recorded yet.'}
              </div>
            )}
          </div>

          {/* Recent Orders History */}
          <div className="space-y-2 pt-2">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
              Order & Session History ({customerOrders.length})
            </label>

            <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden max-h-48 overflow-y-auto">
              {customerOrders.length === 0 ? (
                <div className="p-4 text-center text-slate-400">No past orders on record.</div>
              ) : (
                customerOrders.map((ord) => (
                  <div
                    key={ord.id}
                    className="p-3 bg-white hover:bg-slate-50 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-semibold text-slate-900">{ord.label}</div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {new Date(ord.createdAt).toLocaleDateString()} · {ord.paymentMethod}
                      </div>
                    </div>
                    <span className="font-mono font-bold text-slate-900">
                      EGP {ord.total.toFixed(2)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
