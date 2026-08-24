import React, { useState } from 'react';
import { Clock, Calendar, Briefcase, X, FileText, CheckCircle2 } from 'lucide-react';
import { Employee, AttendanceRecord, ShiftType } from '../../types';

interface ManualPunchModalProps {
  isOpen: boolean;
  onClose: () => void;
  employees: Employee[];
  onAddRecord: (record: Omit<AttendanceRecord, 'id'>) => void;
  notify: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

const SHIFT_TYPES: ShiftType[] = [
  'Regular Shift',
  'Opening Shift',
  'Closing Shift',
  'Overtime',
  'Weekend Shift',
];

export const ManualPunchModal: React.FC<ManualPunchModalProps> = ({
  isOpen,
  onClose,
  employees,
  onAddRecord,
  notify,
}) => {
  const [selectedEmpId, setSelectedEmpId] = useState(employees[0]?.id || '');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [shiftType, setShiftType] = useState<ShiftType>('Regular Shift');
  const [clockInTimeStr, setClockInTimeStr] = useState('09:00');
  const [clockOutTimeStr, setClockOutTimeStr] = useState('17:00');
  const [notes, setNotes] = useState('');
  const [isCurrentlyClockedIn, setIsCurrentlyClockedIn] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const emp = employees.find((e) => e.id === selectedEmpId);
    if (!emp) {
      notify('Please select a valid employee', 'error');
      return;
    }

    // Convert date + time to timestamp
    const [inHours, inMins] = clockInTimeStr.split(':').map(Number);
    const inDate = new Date(date);
    inDate.setHours(inHours || 0, inMins || 0, 0, 0);
    const clockInTimestamp = inDate.getTime();

    let clockOutTimestamp: number | undefined = undefined;
    let durationHours: number | undefined = undefined;

    if (!isCurrentlyClockedIn) {
      const [outHours, outMins] = clockOutTimeStr.split(':').map(Number);
      const outDate = new Date(date);
      outDate.setHours(outHours || 0, outMins || 0, 0, 0);

      // If out time is earlier than in time, assume next day or reject
      if (outDate.getTime() <= inDate.getTime()) {
        outDate.setDate(outDate.getDate() + 1);
      }

      clockOutTimestamp = outDate.getTime();
      const diffMs = clockOutTimestamp - clockInTimestamp;
      durationHours = Math.max(0.25, Math.round((diffMs / 3600000) * 100) / 100);
    }

    onAddRecord({
      employeeId: emp.id,
      employeeName: emp.name,
      role: emp.role,
      date,
      clockInTime: clockInTimestamp,
      clockOutTime: clockOutTimestamp,
      durationHours,
      status: isCurrentlyClockedIn ? 'clocked_in' : 'completed',
      shiftType,
      notes: notes.trim() ? notes.trim() : undefined,
    });

    notify(
      `Added attendance entry for ${emp.name} (${durationHours ? `${durationHours} hrs` : 'Clocked in'})`,
      'success'
    );
    onClose();
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150 text-xs"
      >
        {/* Modal Header */}
        <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-800 text-white">
              <Clock size={18} />
            </div>
            <div>
              <h3 className="font-bold text-base font-sans">
                Manual Attendance Punch
              </h3>
              <p className="text-xs text-slate-300 font-sans">
                Log past shifts, missed punches & hours for payroll
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

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              Select Staff Member *
            </label>
            <select
              value={selectedEmpId}
              onChange={(e) => setSelectedEmpId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold focus:outline-none focus:border-emerald-700"
            >
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.name} ({emp.role}) - {emp.salaryType === 'monthly' ? 'Monthly' : 'Hourly'}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Date *
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono focus:outline-none focus:border-emerald-700"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Shift Type
              </label>
              <select
                value={shiftType}
                onChange={(e) => setShiftType(e.target.value as ShiftType)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-emerald-700"
              >
                {SHIFT_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-800">Shift Timings</span>
              <label className="flex items-center gap-1.5 cursor-pointer text-[11px] text-slate-600">
                <input
                  type="checkbox"
                  checked={isCurrentlyClockedIn}
                  onChange={(e) => setIsCurrentlyClockedIn(e.target.checked)}
                  className="rounded text-emerald-700 focus:ring-emerald-700"
                />
                <span>Still In Progress (Clocked In)</span>
              </label>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-600 text-[11px] mb-1">
                  Clock In Time *
                </label>
                <input
                  type="time"
                  required
                  value={clockInTimeStr}
                  onChange={(e) => setClockInTimeStr(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-900 font-mono font-bold focus:outline-none focus:border-emerald-700"
                />
              </div>

              {!isCurrentlyClockedIn && (
                <div>
                  <label className="block text-slate-600 text-[11px] mb-1">
                    Clock Out Time *
                  </label>
                  <input
                    type="time"
                    required
                    value={clockOutTimeStr}
                    onChange={(e) => setClockOutTimeStr(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-900 font-mono font-bold focus:outline-none focus:border-emerald-700"
                  />
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              Shift Notes / Reason for Manual Punch
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Forgot to clock out / Offsite coffee catering"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-emerald-700"
            />
          </div>

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
              className="px-5 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold transition shadow-xs flex items-center gap-1.5"
            >
              <CheckCircle2 size={13} /> Save Attendance Record
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
