import React, { useState } from 'react';
import {
  Terminal,
  X,
  RefreshCw,
  Trash2,
  Database,
  Cpu,
  ShieldAlert,
  Printer,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Code2,
} from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';

interface DevConsoleModalProps {
  onClose: () => void;
  onResetToDefaults: () => void;
  onTriggerTestKOT: () => void;
  appStateCounts: {
    orders: number;
    invoices: number;
    kitchenTickets: number;
    employees: number;
    attendanceRecords: number;
    payrollRecords: number;
    tables: number;
  };
  notify: (title: string, message?: string, type?: 'success' | 'warning' | 'info') => void;
}

export const DevConsoleModal: React.FC<DevConsoleModalProps> = ({
  onClose,
  onResetToDefaults,
  onTriggerTestKOT,
  appStateCounts,
  notify,
}) => {
  const { lang } = useLanguage();
  const [activeTab, setActiveTab] = useState<'diagnostics' | 'storage' | 'hardware'>('diagnostics');

  return (
    <div
      id="dev-console-backdrop"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/85 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div
        id="dev-console-dialog"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl bg-zinc-950 text-zinc-100 rounded-3xl shadow-2xl border border-indigo-500/40 overflow-hidden font-mono text-xs animate-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]"
      >
        {/* Terminal Header */}
        <div className="flex items-center justify-between px-5 py-3 bg-zinc-900 border-b border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
            </div>
            <span className="text-indigo-400 font-bold tracking-wider ms-2 flex items-center gap-1.5">
              <Terminal size={14} />
              <span>SOFTWARE ENGINEER DEBUG CONSOLE & DIAGNOSTICS</span>
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800"
          >
            <X size={16} />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-2 px-5 py-2.5 bg-zinc-900/50 border-b border-zinc-800">
          <button
            type="button"
            onClick={() => setActiveTab('diagnostics')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              activeTab === 'diagnostics'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            System Metrics & Memory
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('storage')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              activeTab === 'storage'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Local Persistence DB
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('hardware')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              activeTab === 'hardware'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Hardware & ESC/POS Spooler
          </button>
        </div>

        {/* Console Content Area */}
        <div className="p-6 space-y-4 overflow-y-auto flex-1 text-zinc-300">
          {activeTab === 'diagnostics' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 font-mono">
                <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800">
                  <span className="text-[10px] text-zinc-500 uppercase block">Total Orders</span>
                  <span className="text-lg font-black text-indigo-400">{appStateCounts.orders}</span>
                </div>
                <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800">
                  <span className="text-[10px] text-zinc-500 uppercase block">KOT Kitchen Tickets</span>
                  <span className="text-lg font-black text-orange-400">{appStateCounts.kitchenTickets}</span>
                </div>
                <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800">
                  <span className="text-[10px] text-zinc-500 uppercase block">Invoices Ledger</span>
                  <span className="text-lg font-black text-emerald-400">{appStateCounts.invoices}</span>
                </div>
                <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800">
                  <span className="text-[10px] text-zinc-500 uppercase block">Attendance Punches</span>
                  <span className="text-lg font-black text-blue-400">{appStateCounts.attendanceRecords}</span>
                </div>
                <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800">
                  <span className="text-[10px] text-zinc-500 uppercase block">Payroll Records</span>
                  <span className="text-lg font-black text-amber-400">{appStateCounts.payrollRecords}</span>
                </div>
                <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800">
                  <span className="text-[10px] text-zinc-500 uppercase block">Coworking Desks</span>
                  <span className="text-lg font-black text-purple-400">{appStateCounts.tables}</span>
                </div>
              </div>

              {/* Dev Quick Trigger Actions */}
              <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-3">
                <span className="text-xs font-bold text-zinc-200 block uppercase tracking-wider">
                  Test Simulation Triggers
                </span>
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => {
                      onTriggerTestKOT();
                      notify('Simulated KOT Generated', 'KOT Ticket sent to Kitchen queue', 'success');
                    }}
                    className="px-3.5 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs flex items-center gap-2 transition cursor-pointer"
                  >
                    <Printer size={14} />
                    <span>Generate Test Kitchen Ticket (KOT)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm('Are you sure you want to reset all data to initial seed records?')) {
                        onResetToDefaults();
                        notify('Database Reset', 'All states restored to default seed', 'info');
                      }
                    }}
                    className="px-3.5 py-2 rounded-xl bg-rose-900/60 hover:bg-rose-800 text-rose-200 border border-rose-700/60 font-bold text-xs flex items-center gap-2 transition cursor-pointer"
                  >
                    <Trash2 size={14} />
                    <span>Reset Database to Seed State</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'storage' && (
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 space-y-2">
                <span className="text-xs font-bold text-emerald-400 block">Active LocalStorage Namespaces:</span>
                <ul className="space-y-1 text-[11px] text-zinc-400 font-mono">
                  <li>• white_table_active_role (Current RBAC context)</li>
                  <li>• white_table_kitchen_tickets (Live KDS Orders)</li>
                  <li>• white_table_attendance_log (Shift Punches)</li>
                  <li>• white_table_payroll_register (Salaries & Bonuses)</li>
                  <li>• white_table_pos_orders (POS ledger)</li>
                  <li>• white_table_invoices (Billing records)</li>
                  <li>• white_table_hardware_config (Printer / ESC-POS baud/port)</li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'hardware' && (
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 space-y-2">
                <span className="text-xs font-bold text-amber-400 block">ESC/POS Thermal Pipeline:</span>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  Direct ESC/POS bytecode generator initialized for 80mm & 58mm thermal rolls.
                  Hex ESC @ (Init), GS V 66 0 (Cut), DLE DC4 (Drawer Kick Pulse pin 2/5).
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-zinc-900 border-t border-zinc-800 flex items-center justify-between text-zinc-500">
          <span>Environment: Production Ready · Build v2.5</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold"
          >
            Close Terminal
          </button>
        </div>
      </div>
    </div>
  );
};
