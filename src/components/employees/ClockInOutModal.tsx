import React, { useState, useEffect } from 'react';
import { Clock, LogIn, LogOut, X, Sparkles, CheckCircle2, User, AlertCircle } from 'lucide-react';
import { Employee, ShiftType } from '../../types';

interface ClockInOutModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: Employee | null;
  mode: 'clock_in' | 'clock_out';
  onClockIn: (employeeId: string, shiftType: ShiftType, notes?: string) => void;
  onClockOut: (employeeId: string, notes?: string) => void;
  notify: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

const SHIFT_TYPES: ShiftType[] = [
  'Regular Shift',
  'Opening Shift',
  'Closing Shift',
  'Overtime',
  'Weekend Shift',
];

export const ClockInOutModal: React.FC<ClockInOutModalProps> = ({
  isOpen,
  onClose,
  employee,
  mode,
  onClockIn,
  onClockOut,
}) => {
  const [shiftType, setShiftType] = useState<ShiftType>('Regular Shift');
  const [notes, setNotes] = useState('');
  const [elapsedString, setElapsedString] = useState('');

  // Live timer for elapsed shift duration if clocking out
  useEffect(() => {
    if (!isOpen || !employee || mode !== 'clock_out' || !employee.currentClockInTime) {
      return;
    }

    const updateTimer = () => {
      const diffMs = Math.max(0, Date.now() - (employee.currentClockInTime || Date.now()));
      const totalMinutes = Math.floor(diffMs / 60000);
      const hours = Math.floor(totalMinutes / 60);
      const mins = totalMinutes % 60;
      setElapsedString(`${hours}h ${mins}m`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 10000);
    return () => clearInterval(interval);
  }, [isOpen, employee, mode]);

  if (!isOpen || !employee) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'clock_in') {
      onClockIn(employee.id, shiftType, notes.trim() || undefined);
    } else {
      onClockOut(employee.id, notes.trim() || undefined);
    }
    setNotes('');
    onClose();
  };

  const isClockIn = mode === 'clock_in';

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150 text-xs"
      >
        {/* Header */}
        <div
          className={`p-5 text-white flex items-center justify-between ${
            isClockIn ? 'bg-emerald-950' : 'bg-slate-900'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-xl text-white ${
                isClockIn ? 'bg-emerald-700' : 'bg-rose-700'
              }`}
            >
              {isClockIn ? <LogIn size={18} /> : <LogOut size={18} />}
            </div>
            <div>
              <h3 className="font-bold text-base font-sans">
                {isClockIn ? 'Staff Clock In' : 'Staff Clock Out'}
              </h3>
              <p className="text-xs text-slate-300 font-sans">
                {isClockIn ? 'Start active work shift' : 'End shift & update payroll balance'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Employee Summary Card */}
          <div className="flex items-center gap-3 p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white text-sm shrink-0"
              style={{ backgroundColor: employee.avatarColor || '#0f766e' }}
            >
              {employee.name.slice(0, 2).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-slate-900 text-sm truncate">
                {employee.name}
              </h4>
              <div className="flex items-center gap-2 text-slate-500 text-[11px]">
                <span className="font-medium">{employee.role}</span>
                <span>•</span>
                <span className="font-semibold text-emerald-800">
                  {employee.salaryType === 'monthly'
                    ? `Monthly (EGP ${employee.baseSalary.toLocaleString()})`
                    : `Hourly (EGP ${employee.baseSalary}/hr)`}
                </span>
              </div>
            </div>
          </div>

          {/* Clock In options */}
          {isClockIn && (
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Select Shift Type
              </label>
              <div className="grid grid-cols-2 gap-2">
                {SHIFT_TYPES.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setShiftType(t)}
                    className={`py-2 px-3 rounded-xl text-left font-semibold text-xs border transition ${
                      shiftType === t
                        ? 'bg-emerald-50 border-emerald-700 text-emerald-900 shadow-2xs'
                        : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Clock Out Summary */}
          {!isClockIn && (
            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl space-y-2 text-amber-950">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="flex items-center gap-1.5 text-amber-900">
                  <Clock size={14} className="text-amber-700" /> Shift Duration:
                </span>
                <span className="font-mono text-sm font-bold text-amber-950">
                  {elapsedString || 'In progress'}
                </span>
              </div>
              {employee.currentClockInTime && (
                <div className="text-[11px] text-amber-800">
                  Clocked in today at:{' '}
                  <strong>
                    {new Date(employee.currentClockInTime).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </strong>
                </div>
              )}
              <p className="text-[11px] text-amber-800 pt-1 border-t border-amber-200/60">
                Clocking out will automatically credit this shift's hours to{' '}
                <strong>{employee.name}'s</strong> monthly payroll record.
              </p>
            </div>
          )}

          {/* Optional Notes */}
          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              Shift Notes / Tasks Handled (Optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={
                isClockIn
                  ? 'e.g. Opening espresso bar calibration, pastry prep'
                  : 'e.g. Cleaned bar, restocked beans, finished register closing'
              }
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-emerald-700"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-5 py-2.5 rounded-xl font-bold text-white transition shadow-xs flex items-center gap-1.5 ${
                isClockIn
                  ? 'bg-emerald-800 hover:bg-emerald-900'
                  : 'bg-rose-700 hover:bg-rose-800'
              }`}
            >
              {isClockIn ? (
                <>
                  <LogIn size={14} /> Confirm Clock In
                </>
              ) : (
                <>
                  <LogOut size={14} /> Confirm Clock Out & Sync Payroll
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
