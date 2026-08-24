import React, { useState, useMemo } from 'react';
import {
  Clock,
  Calendar,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  LogIn,
  LogOut,
  Plus,
  Trash2,
  Edit3,
  FileText,
  Printer,
  Sparkles,
  Users,
  DollarSign,
  TrendingUp,
} from 'lucide-react';
import { Employee, AttendanceRecord } from '../../types';

interface AttendanceLogTabProps {
  employees: Employee[];
  attendanceRecords: AttendanceRecord[];
  onClockIn: (employeeId: string) => void;
  onClockOut: (employeeId: string, notes?: string) => void;
  onOpenManualPunchModal: () => void;
  onDeleteRecord: (recordId: string) => void;
  notify: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const AttendanceLogTab: React.FC<AttendanceLogTabProps> = ({
  employees,
  attendanceRecords,
  onClockIn,
  onClockOut,
  onOpenManualPunchModal,
  onDeleteRecord,
  notify,
}) => {
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [dateMode, setDateMode] = useState<'today' | 'all' | 'custom'>('today');
  const [statusFilter, setStatusFilter] = useState<'all' | 'clocked_in' | 'completed'>('all');
  const [employeeFilter, setEmployeeFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Currently clocked in employees
  const clockedInEmployees = useMemo(() => {
    return employees.filter((e) => e.isClockedIn);
  }, [employees]);

  // Filtered records
  const filteredRecords = useMemo(() => {
    return attendanceRecords.filter((rec) => {
      // Date filter
      if (dateMode === 'today' && rec.date !== todayStr) return false;
      if (dateMode === 'custom' && rec.date !== selectedDate) return false;

      // Status filter
      if (statusFilter !== 'all' && rec.status !== statusFilter) return false;

      // Employee filter
      if (employeeFilter !== 'all' && rec.employeeId !== employeeFilter) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = rec.employeeName.toLowerCase().includes(q);
        const matchesRole = rec.role.toLowerCase().includes(q);
        const matchesNotes = rec.notes?.toLowerCase().includes(q);
        const matchesShiftType = rec.shiftType?.toLowerCase().includes(q);
        if (!matchesName && !matchesRole && !matchesNotes && !matchesShiftType) {
          return false;
        }
      }

      return true;
    });
  }, [attendanceRecords, dateMode, selectedDate, todayStr, statusFilter, employeeFilter, searchQuery]);

  // Aggregate Metrics for currently viewed date/filter
  const totalHoursTracked = useMemo(() => {
    return filteredRecords.reduce((sum, r) => sum + (r.durationHours || 0), 0);
  }, [filteredRecords]);

  const completedShiftsCount = useMemo(() => {
    return filteredRecords.filter((r) => r.status === 'completed').length;
  }, [filteredRecords]);

  const activeShiftsCount = useMemo(() => {
    return filteredRecords.filter((r) => r.status === 'clocked_in').length;
  }, [filteredRecords]);

  // Estimated labor cost for filtered records
  const estimatedLaborCost = useMemo(() => {
    return filteredRecords.reduce((sum, r) => {
      const emp = employees.find((e) => e.id === r.employeeId);
      if (!emp) return sum;
      if (emp.salaryType === 'hourly') {
        return sum + (r.durationHours || 0) * emp.baseSalary;
      } else {
        // Daily prorated cost: (Monthly / 22 days / 8 hrs) * duration
        const hourlyEquivalent = emp.baseSalary / (22 * 8);
        return sum + (r.durationHours || 8) * hourlyEquivalent;
      }
    }, 0);
  }, [filteredRecords, employees]);

  const formatTime = (timestamp?: number) => {
    if (!timestamp) return '—';
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-5">
      {/* Top Attendance Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {/* On Duty Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Currently On Duty</span>
            <div className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-600"></span>
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-800 mt-2">
            {clockedInEmployees.length} Staff
          </div>
          <span className="text-[10px] text-emerald-700 font-medium">
            Active clock-ins on floor
          </span>
        </div>

        {/* Total Hours Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Hours Logged</span>
            <Clock size={16} className="text-emerald-700" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 mt-2">
            {totalHoursTracked.toFixed(1)} hrs
          </div>
          <span className="text-[10px] text-slate-400">
            {dateMode === 'today' ? "Today's completed shifts" : 'Across filtered entries'}
          </span>
        </div>

        {/* Shifts Count Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Shifts Logged</span>
            <CheckCircle2 size={16} className="text-emerald-700" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 mt-2">
            {completedShiftsCount + activeShiftsCount}
          </div>
          <span className="text-[10px] text-slate-500 font-medium">
            {completedShiftsCount} completed • {activeShiftsCount} in progress
          </span>
        </div>

        {/* Est. Labor Cost Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Payroll Accrual</span>
            <DollarSign size={16} className="text-emerald-700" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-800 mt-2">
            EGP {Math.round(estimatedLaborCost).toLocaleString()}
          </div>
          <span className="text-[10px] text-emerald-700 font-medium">
            Auto-linked to payroll register
          </span>
        </div>
      </div>

      {/* Filter & Date Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Date Selector buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto">
            <button
              onClick={() => setDateMode('today')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                dateMode === 'today'
                  ? 'bg-emerald-800 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Today ({todayStr})
            </button>
            <button
              onClick={() => setDateMode('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                dateMode === 'all'
                  ? 'bg-emerald-800 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Attendance History
            </button>
            <div className="flex items-center gap-1 bg-slate-100 px-2 py-1 rounded-xl border border-slate-200">
              <span className="text-[11px] text-slate-500 font-semibold">Custom:</span>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  setDateMode('custom');
                }}
                className="text-xs bg-white px-2 py-0.5 rounded-lg border border-slate-200 font-mono text-slate-800 focus:outline-none focus:border-emerald-700"
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 self-start lg:self-auto">
            <button
              onClick={onOpenManualPunchModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition shadow-2xs"
            >
              <Plus size={13} /> Log Missed Punch
            </button>
            <button
              onClick={() => {
                notify('Daily attendance roster sent to print / export queue', 'success');
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs transition shadow-2xs"
            >
              <Printer size={13} /> Export Log
            </button>
          </div>
        </div>

        {/* Secondary filters: Status, Employee, Search */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-slate-100">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search employee, role, or notes..."
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-emerald-700"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-semibold whitespace-nowrap">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-emerald-700"
            >
              <option value="all">All Statuses ({attendanceRecords.length})</option>
              <option value="clocked_in">Clocked In Only ({clockedInEmployees.length})</option>
              <option value="completed">Completed Shifts Only</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-semibold whitespace-nowrap">Staff:</span>
            <select
              value={employeeFilter}
              onChange={(e) => setEmployeeFilter(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-emerald-700"
            >
              <option value="all">All Staff Members</option>
              {employees.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.name} ({e.role})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-slate-900 text-sm">
              Daily Attendance & Shift Records
            </h3>
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 text-[10px] font-bold">
              {filteredRecords.length} records
            </span>
          </div>
          <span className="text-xs text-slate-500">
            Automatically linked to August 2026 Payroll
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-100/70 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px] font-bold">
              <tr>
                <th className="py-3 px-4">Staff Member</th>
                <th className="py-3 px-4">Shift Date</th>
                <th className="py-3 px-4">Shift Type</th>
                <th className="py-3 px-4">Clock In</th>
                <th className="py-3 px-4">Clock Out</th>
                <th className="py-3 px-4 text-right">Duration</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Notes</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {filteredRecords.map((rec) => {
                const emp = employees.find((e) => e.id === rec.employeeId);
                const isCurrentlyActive = rec.status === 'clocked_in';

                return (
                  <tr
                    key={rec.id}
                    className={`hover:bg-slate-50/80 transition ${
                      isCurrentlyActive ? 'bg-emerald-50/30' : ''
                    }`}
                  >
                    {/* Employee Info */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-white text-[11px] shrink-0"
                          style={{ backgroundColor: emp?.avatarColor || '#0f766e' }}
                        >
                          {rec.employeeName.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 block leading-tight">
                            {rec.employeeName}
                          </span>
                          <span className="text-[10px] text-slate-500 font-medium">
                            {rec.role}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Date */}
                    <td className="py-3 px-4 font-mono font-medium text-slate-700">
                      {rec.date}
                    </td>

                    {/* Shift Type */}
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 font-medium text-[11px] border border-slate-200">
                        {rec.shiftType || 'Regular Shift'}
                      </span>
                    </td>

                    {/* Clock In */}
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      <span className="inline-flex items-center gap-1 text-emerald-800">
                        <LogIn size={11} className="text-emerald-700" />
                        {formatTime(rec.clockInTime)}
                      </span>
                    </td>

                    {/* Clock Out */}
                    <td className="py-3 px-4 font-mono font-bold">
                      {isCurrentlyActive ? (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold animate-pulse">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                          In Progress
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-slate-700">
                          <LogOut size={11} className="text-slate-400" />
                          {formatTime(rec.clockOutTime)}
                        </span>
                      )}
                    </td>

                    {/* Duration */}
                    <td className="py-3 px-4 font-mono text-right font-bold text-slate-900 text-sm">
                      {rec.durationHours ? (
                        <span className="text-emerald-800">{rec.durationHours} hrs</span>
                      ) : isCurrentlyActive ? (
                        <span className="text-xs text-amber-700 font-normal italic">Active</span>
                      ) : (
                        '—'
                      )}
                    </td>

                    {/* Status Badge */}
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isCurrentlyActive
                            ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                            : 'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}
                      >
                        {isCurrentlyActive ? (
                          <>
                            <Clock size={10} className="text-emerald-700" /> Clocked In
                          </>
                        ) : (
                          <>
                            <CheckCircle2 size={10} className="text-slate-500" /> Completed
                          </>
                        )}
                      </span>
                    </td>

                    {/* Notes */}
                    <td className="py-3 px-4 text-slate-500 text-[11px] max-w-xs truncate">
                      {rec.notes || '—'}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {isCurrentlyActive ? (
                          <button
                            type="button"
                            onClick={() => onClockOut(rec.employeeId)}
                            className="px-2.5 py-1 rounded-lg bg-rose-700 hover:bg-rose-800 text-white font-bold text-[11px] transition flex items-center gap-1 shadow-2xs"
                            title="Clock Out this employee"
                          >
                            <LogOut size={11} /> Clock Out
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => onDeleteRecord(rec.id)}
                            className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                            title="Delete record"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filteredRecords.length === 0 && (
            <div className="p-12 text-center text-slate-400 text-xs">
              <Clock size={28} className="mx-auto mb-2 text-slate-300" />
              <p className="font-semibold text-slate-600">No attendance entries found</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Staff members who clock in or manual shift logs will appear here.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
