import React, { useState, useMemo } from 'react';
import {
  Clock,
  Calendar,
  Search,
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
  Timer,
  Check,
  Building,
  Briefcase,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { Employee, AttendanceRecord, ShiftType } from '../../types';
import { ClockInOutModal } from '../employees/ClockInOutModal';
import { ManualPunchModal } from '../employees/ManualPunchModal';
import { useLanguage } from '../../i18n/LanguageContext';

interface AttendanceViewProps {
  employees: Employee[];
  attendanceRecords: AttendanceRecord[];
  onClockIn: (employeeId: string, shiftType?: ShiftType, notes?: string) => void;
  onClockOut: (employeeId: string, notes?: string) => void;
  onAddAttendanceRecord: (record: Omit<AttendanceRecord, 'id'>) => void;
  onUpdateAttendanceRecord: (record: AttendanceRecord) => void;
  onDeleteAttendanceRecord: (recordId: string) => void;
  notify: (title: string, message?: string, type?: 'success' | 'warning' | 'info') => void;
}

export const AttendanceView: React.FC<AttendanceViewProps> = ({
  employees,
  attendanceRecords,
  onClockIn,
  onClockOut,
  onAddAttendanceRecord,
  onUpdateAttendanceRecord,
  onDeleteAttendanceRecord,
  notify,
}) => {
  const { lang, t } = useLanguage();
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [dateMode, setDateMode] = useState<'today' | 'all' | 'custom'>('today');
  const [statusFilter, setStatusFilter] = useState<'all' | 'clocked_in' | 'completed'>('all');
  const [employeeFilter, setEmployeeFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [clockModalData, setClockModalData] = useState<{
    employee: Employee;
    mode: 'clock_in' | 'clock_out';
  } | null>(null);
  const [isManualPunchModalOpen, setIsManualPunchModalOpen] = useState(false);

  // Currently clocked in employees
  const clockedInEmployees = useMemo(() => {
    return employees.filter((e) => e.isClockedIn);
  }, [employees]);

  // Filtered records
  const filteredRecords = useMemo(() => {
    return attendanceRecords.filter((rec) => {
      if (dateMode === 'today' && rec.date !== todayStr) return false;
      if (dateMode === 'custom' && rec.date !== selectedDate) return false;
      if (statusFilter !== 'all' && rec.status !== statusFilter) return false;
      if (employeeFilter !== 'all' && rec.employeeId !== employeeFilter) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = rec.employeeName.toLowerCase().includes(q);
        const matchesRole = rec.role.toLowerCase().includes(q);
        const matchesNotes = rec.notes?.toLowerCase().includes(q);
        const matchesShift = rec.shiftType?.toLowerCase().includes(q);
        if (!matchesName && !matchesRole && !matchesNotes && !matchesShift) return false;
      }
      return true;
    });
  }, [attendanceRecords, dateMode, selectedDate, todayStr, statusFilter, employeeFilter, searchQuery]);

  const totalHoursTracked = useMemo(() => {
    return filteredRecords.reduce((sum, r) => sum + (r.durationHours || 0), 0);
  }, [filteredRecords]);

  const completedShiftsCount = useMemo(() => {
    return filteredRecords.filter((r) => r.status === 'completed').length;
  }, [filteredRecords]);

  const handleExportCSV = () => {
    const headers = ['Employee ID', 'Employee Name', 'Role', 'Date', 'Clock In', 'Clock Out', 'Duration (Hours)', 'Shift Type', 'Status', 'Notes'];
    const rows = filteredRecords.map((r) => [
      r.employeeId,
      r.employeeName,
      r.role,
      r.date,
      new Date(r.clockInTime).toLocaleTimeString(),
      r.clockOutTime ? new Date(r.clockOutTime).toLocaleTimeString() : 'Active',
      r.durationHours ? r.durationHours.toFixed(2) : '0',
      r.shiftType || 'Regular',
      r.status,
      `"${(r.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `WhiteTable_Attendance_${dateMode === 'today' ? todayStr : 'log'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    notify(
      lang === 'ar' ? 'تم تصدير سجل الحضور' : 'Attendance Log Exported',
      lang === 'ar' ? 'تم تنزيل ملف CSV بنجاح' : 'CSV file downloaded successfully',
      'success'
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-600">
              <Clock size={22} />
            </div>
            <div>
              <h2 className="text-xl font-black text-zinc-950 tracking-tight flex items-center gap-2">
                <span>{t.attendance}</span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  {clockedInEmployees.length} {t.onDuty}
                </span>
              </h2>
              <p className="text-xs text-zinc-500 mt-0.5">
                {lang === 'ar'
                  ? 'نظام تسجيل حضور وانصراف الورديات الفوري، متابعة الموظفين النشطين وساعات العمل.'
                  : 'Fast shift check-in / check-out time clock, live on-duty roster, and shift punch history.'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setIsManualPunchModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-zinc-300 bg-white hover:bg-zinc-50 text-zinc-700 text-xs font-bold shadow-2xs transition cursor-pointer"
          >
            <Plus size={14} className="text-emerald-600" />
            <span>{t.missedPunch}</span>
          </button>

          <button
            type="button"
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold shadow-2xs transition cursor-pointer"
          >
            <FileText size={14} />
            <span>{t.export} CSV</span>
          </button>
        </div>
      </div>

      {/* Quick Punch Kiosk (Grid of Team Members for Fast 1-Click Clock In/Out) */}
      <div className="bg-white rounded-3xl p-5 border border-zinc-200 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
          <div>
            <h3 className="text-sm font-black text-zinc-950 flex items-center gap-2">
              <Users size={16} className="text-emerald-600" />
              <span>{lang === 'ar' ? 'محطة تسجيل الحضور والانصراف السريع' : 'Quick Time Clock Punch Kiosk'}</span>
            </h3>
            <p className="text-xs text-zinc-500">
              {lang === 'ar'
                ? 'اضغط على الموظف لتسجيل الحضور أو الانصراف وتحديد نوع الوردية'
                : 'Click any staff member to punch in / out or review active shift timer.'}
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-zinc-500 bg-zinc-100 px-2.5 py-1 rounded-xl">
            {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {employees.map((emp) => {
            const isClocked = emp.isClockedIn;
            const shiftMinutes = emp.clockInTime
              ? Math.floor((Date.now() - emp.clockInTime) / (1000 * 60))
              : 0;
            const shiftHours = Math.floor(shiftMinutes / 60);
            const shiftMins = shiftMinutes % 60;

            return (
              <div
                key={emp.id}
                className={`p-3.5 rounded-2xl border transition flex flex-col justify-between ${
                  isClocked
                    ? 'bg-emerald-50/50 border-emerald-300 ring-1 ring-emerald-500/20'
                    : 'bg-zinc-50/80 border-zinc-200 hover:border-zinc-300'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-9 h-9 rounded-xl font-bold flex items-center justify-center text-xs shrink-0 ${
                          isClocked
                            ? 'bg-emerald-600 text-white shadow-2xs'
                            : 'bg-zinc-200 text-zinc-700'
                        }`}
                      >
                        {emp.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-black text-xs text-zinc-950 truncate max-w-[130px]">
                          {emp.name}
                        </div>
                        <div className="text-[10px] text-zinc-500 font-medium">
                          {emp.role}
                        </div>
                      </div>
                    </div>

                    <span
                      className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0 ${
                        isClocked
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-zinc-200 text-zinc-600'
                      }`}
                    >
                      {isClocked ? t.onDuty : t.offDuty}
                    </span>
                  </div>

                  {/* Shift Time Info if Active */}
                  {isClocked && emp.clockInTime && (
                    <div className="mt-2.5 p-2 rounded-xl bg-white border border-emerald-200 text-[11px] flex items-center justify-between font-mono">
                      <span className="text-zinc-500 flex items-center gap-1">
                        <Timer size={12} className="text-emerald-600 animate-spin" />
                        <span>Duration:</span>
                      </span>
                      <span className="font-bold text-emerald-950">
                        {shiftHours}h {shiftMins}m
                      </span>
                    </div>
                  )}
                </div>

                {/* Clock In / Out Action Button */}
                <div className="mt-3">
                  {isClocked ? (
                    <button
                      type="button"
                      onClick={() => setClockModalData({ employee: emp, mode: 'clock_out' })}
                      className="w-full py-1.5 px-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
                    >
                      <LogOut size={13} />
                      <span>{t.clockOut}</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setClockModalData({ employee: emp, mode: 'clock_in' })}
                      className="w-full py-1.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
                    >
                      <LogIn size={13} />
                      <span>{t.clockIn}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Attendance Log Filter & History Table */}
      <div className="bg-white rounded-3xl p-5 border border-zinc-200 shadow-2xs space-y-4">
        {/* Filter Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-zinc-100">
          <div className="flex items-center gap-1.5 bg-zinc-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setDateMode('today')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                dateMode === 'today'
                  ? 'bg-white text-zinc-950 shadow-xs'
                  : 'text-zinc-500 hover:text-zinc-900'
              }`}
            >
              {lang === 'ar' ? 'اليوم' : 'Today'}
            </button>
            <button
              type="button"
              onClick={() => setDateMode('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                dateMode === 'all'
                  ? 'bg-white text-zinc-950 shadow-xs'
                  : 'text-zinc-500 hover:text-zinc-900'
              }`}
            >
              {lang === 'ar' ? 'كافة السجلات' : 'All History'}
            </button>
            <button
              type="button"
              onClick={() => setDateMode('custom')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                dateMode === 'custom'
                  ? 'bg-white text-zinc-950 shadow-xs'
                  : 'text-zinc-500 hover:text-zinc-900'
              }`}
            >
              {lang === 'ar' ? 'تاريخ محدد' : 'Custom Date'}
            </button>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {dateMode === 'custom' && (
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-2.5 py-1.5 text-xs bg-zinc-50 border border-zinc-200 rounded-xl text-zinc-900 focus:outline-none focus:border-emerald-600 font-medium"
              />
            )}

            <div className="relative">
              <Search size={14} className="absolute start-2.5 top-2.5 text-zinc-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={lang === 'ar' ? 'بحث بالاسم أو الوردية...' : 'Search logs...'}
                className="ps-8 pe-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 focus:outline-none focus:border-emerald-600 font-medium"
              />
            </div>
          </div>
        </div>

        {/* Log Table */}
        <div className="overflow-x-auto rounded-2xl border border-zinc-200">
          <table className="w-full text-xs text-start border-collapse">
            <thead className="bg-zinc-100 text-zinc-600 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-3 text-start">{t.name}</th>
                <th className="p-3 text-start">{t.role}</th>
                <th className="p-3 text-start">{t.date}</th>
                <th className="p-3 text-start">{t.clockIn}</th>
                <th className="p-3 text-start">{t.clockOut}</th>
                <th className="p-3 text-start">{lang === 'ar' ? 'المدة' : 'Duration'}</th>
                <th className="p-3 text-start">{t.shiftType}</th>
                <th className="p-3 text-start">{t.status}</th>
                <th className="p-3 text-start">{t.notes}</th>
                <th className="p-3 text-center">{t.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 bg-white">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={10} className="p-8 text-center text-zinc-400">
                    {lang === 'ar' ? 'لا توجد سجلات حضور مطابقة لهذا الفلتر' : 'No attendance logs found.'}
                  </td>
                </tr>
              ) : (
                filteredRecords.map((rec) => (
                  <tr key={rec.id} className="hover:bg-zinc-50/80 transition">
                    <td className="p-3 font-bold text-zinc-950">{rec.employeeName}</td>
                    <td className="p-3 text-zinc-600">{rec.role}</td>
                    <td className="p-3 font-mono text-zinc-600">{rec.date}</td>
                    <td className="p-3 font-mono text-zinc-900">
                      {new Date(rec.clockInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="p-3 font-mono text-zinc-900">
                      {rec.clockOutTime ? (
                        new Date(rec.clockOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                      ) : (
                        <span className="text-emerald-600 font-bold flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                          {t.active}
                        </span>
                      )}
                    </td>
                    <td className="p-3 font-mono font-bold text-zinc-900">
                      {rec.durationHours ? `${rec.durationHours.toFixed(1)} hrs` : '-'}
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-lg bg-zinc-100 border border-zinc-200 text-[10px] font-semibold text-zinc-700">
                        {rec.shiftType || 'Regular'}
                      </span>
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          rec.status === 'completed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {rec.status === 'completed' ? t.completed : t.active}
                      </span>
                    </td>
                    <td className="p-3 text-zinc-500 truncate max-w-[150px]">{rec.notes || '-'}</td>
                    <td className="p-3 text-center">
                      <button
                        type="button"
                        onClick={() => onDeleteAttendanceRecord(rec.id)}
                        className="p-1.5 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                        title={t.delete}
                      >
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Clock In / Out Modal */}
      {clockModalData && (
        <ClockInOutModal
          employee={clockModalData.employee}
          mode={clockModalData.mode}
          onClose={() => setClockModalData(null)}
          onConfirm={(shiftType, notes) => {
            if (clockModalData.mode === 'clock_in') {
              onClockIn(clockModalData.employee.id, shiftType, notes);
            } else {
              onClockOut(clockModalData.employee.id, notes);
            }
            setClockModalData(null);
          }}
        />
      )}

      {/* Manual Punch Modal */}
      {isManualPunchModalOpen && (
        <ManualPunchModal
          employees={employees}
          onClose={() => setIsManualPunchModalOpen(false)}
          onAddRecord={(rec) => {
            onAddAttendanceRecord(rec);
            setIsManualPunchModalOpen(false);
          }}
        />
      )}
    </div>
  );
};
