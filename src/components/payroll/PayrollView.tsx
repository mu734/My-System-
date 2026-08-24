import React, { useState, useMemo } from 'react';
import {
  DollarSign,
  Calendar,
  Search,
  Plus,
  Minus,
  Edit3,
  Trash2,
  FileText,
  Printer,
  Sparkles,
  Users,
  CreditCard,
  Building,
  Banknote,
  Award,
  ChevronRight,
  X,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  UserPlus,
  Briefcase,
} from 'lucide-react';
import { Employee, PayrollRecord, EmployeeRole } from '../../types';
import { useLanguage } from '../../i18n/LanguageContext';

interface PayrollViewProps {
  employees: Employee[];
  payrollRecords: PayrollRecord[];
  onAddEmployee: (emp: Omit<Employee, 'id'>) => void;
  onUpdateEmployee: (emp: Employee) => void;
  onDeleteEmployee: (empId: string) => void;
  onAddPayrollRecord: (rec: Omit<PayrollRecord, 'id'>) => void;
  onUpdatePayrollRecord: (rec: PayrollRecord) => void;
  notify: (title: string, message?: string, type?: 'success' | 'warning' | 'info') => void;
}

const ROLES: EmployeeRole[] = [
  'Head Barista',
  'Barista',
  'Kitchen Chef',
  'Coworking Community Host',
  'Store Manager',
  'Operations & Support',
];

export const PayrollView: React.FC<PayrollViewProps> = ({
  employees,
  payrollRecords,
  onAddEmployee,
  onUpdateEmployee,
  onDeleteEmployee,
  onAddPayrollRecord,
  onUpdatePayrollRecord,
  notify,
}) => {
  const { lang, t } = useLanguage();
  const [selectedPeriod, setSelectedPeriod] = useState<string>('August 2026');
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('All');

  // Modals
  const [isAddEmployeeModalOpen, setIsAddEmployeeModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [viewingPayslip, setViewingPayslip] = useState<PayrollRecord | null>(null);
  const [bonusDeductionTarget, setBonusDeductionTarget] = useState<{
    employee: Employee;
    type: 'bonus' | 'deduction';
  } | null>(null);
  const [adjustmentAmount, setAdjustmentAmount] = useState<string>('');
  const [adjustmentReason, setAdjustmentReason] = useState<string>('');

  // Form State for Employee Salary Profile
  const [formData, setFormData] = useState<{
    name: string;
    role: EmployeeRole;
    phone: string;
    email: string;
    salaryType: 'monthly' | 'hourly';
    baseSalary: number;
    hoursWorkedThisMonth: number;
    bonus: number;
    deductions: number;
    bankAccountOrInstaPay: string;
    hireDate: string;
    status: 'active' | 'on_leave' | 'inactive';
    shiftsCompleted: number;
  }>({
    name: '',
    role: 'Barista',
    phone: '',
    email: '',
    salaryType: 'monthly',
    baseSalary: 6500,
    hoursWorkedThisMonth: 160,
    bonus: 0,
    deductions: 0,
    bankAccountOrInstaPay: '',
    hireDate: new Date().toISOString().split('T')[0],
    status: 'active',
    shiftsCompleted: 20,
  });

  // Calculate Net Pay for an employee
  const calculateNetPay = (emp: Employee) => {
    let gross = 0;
    if (emp.salaryType === 'monthly') {
      gross = emp.baseSalary;
    } else {
      gross = emp.baseSalary * emp.hoursWorkedThisMonth;
    }
    return Math.max(0, gross + emp.bonus - emp.deductions);
  };

  // Filtered employees
  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      if (roleFilter !== 'All' && emp.role !== roleFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = emp.name.toLowerCase().includes(q);
        const matchesPhone = emp.phone.includes(q);
        const matchesRole = emp.role.toLowerCase().includes(q);
        const matchesInsta = emp.bankAccountOrInstaPay?.toLowerCase().includes(q);
        if (!matchesName && !matchesPhone && !matchesRole && !matchesInsta) return false;
      }
      return true;
    });
  }, [employees, roleFilter, searchQuery]);

  // Aggregate Payroll Metrics
  const totalPayrollBudget = useMemo(() => {
    return employees.reduce((sum, emp) => sum + calculateNetPay(emp), 0);
  }, [employees]);

  const totalBaseSalary = useMemo(() => {
    return employees.reduce((sum, emp) => sum + emp.baseSalary, 0);
  }, [employees]);

  const totalBonuses = useMemo(() => {
    return employees.reduce((sum, emp) => sum + emp.bonus, 0);
  }, [employees]);

  const totalDeductions = useMemo(() => {
    return employees.reduce((sum, emp) => sum + emp.deductions, 0);
  }, [employees]);

  const paidPayrollRecordsCount = useMemo(() => {
    return payrollRecords.filter((p) => p.period === selectedPeriod && p.status === 'paid').length;
  }, [payrollRecords, selectedPeriod]);

  // Handle Bonus or Deduction Submission
  const handleApplyAdjustment = () => {
    if (!bonusDeductionTarget) return;
    const amt = parseFloat(adjustmentAmount);
    if (isNaN(amt) || amt <= 0) {
      notify(
        lang === 'ar' ? 'خطأ في المبلغ' : 'Invalid Amount',
        lang === 'ar' ? 'يرجى إدخال مبلغ صالح أكبر من الصفر' : 'Please enter a valid positive amount',
        'warning'
      );
      return;
    }

    const emp = bonusDeductionTarget.employee;
    const isBonus = bonusDeductionTarget.type === 'bonus';

    const updatedEmp: Employee = {
      ...emp,
      bonus: isBonus ? emp.bonus + amt : emp.bonus,
      deductions: !isBonus ? emp.deductions + amt : emp.deductions,
    };

    onUpdateEmployee(updatedEmp);

    notify(
      isBonus
        ? lang === 'ar' ? 'تمت إضافة المكافأة' : 'Bonus Added'
        : lang === 'ar' ? 'تم تطبيق الخصم' : 'Deduction Applied',
      `${emp.name}: +${amt} ${t.currency} (${adjustmentReason || 'Standard'})`,
      'success'
    );

    setBonusDeductionTarget(null);
    setAdjustmentAmount('');
    setAdjustmentReason('');
  };

  // Handle Mark as Paid
  const handleMarkAsPaid = (emp: Employee) => {
    const net = calculateNetPay(emp);
    const existingRec = payrollRecords.find(
      (p) => p.employeeId === emp.id && p.period === selectedPeriod
    );

    if (existingRec && existingRec.status === 'paid') {
      notify(
        lang === 'ar' ? 'الراتب مدفوع بالفعل' : 'Already Paid',
        `${emp.name} ${selectedPeriod}`,
        'info'
      );
      return;
    }

    const newRecord: Omit<PayrollRecord, 'id'> = {
      employeeId: emp.id,
      employeeName: emp.name,
      period: selectedPeriod,
      baseSalary: emp.baseSalary,
      hoursWorked: emp.hoursWorkedThisMonth,
      bonus: emp.bonus,
      deductions: emp.deductions,
      netSalary: net,
      paymentDate: new Date().toISOString().split('T')[0],
      status: 'paid',
      paymentMethod: emp.bankAccountOrInstaPay ? 'InstaPay / Bank Transfer' : 'Cash',
      notes: `Disbursed for ${selectedPeriod} to ${emp.bankAccountOrInstaPay || 'Cash'}`,
    };

    onAddPayrollRecord(newRecord);

    notify(
      lang === 'ar' ? 'تم صرف الراتب' : 'Salary Disbursed',
      `${emp.name}: ${net.toLocaleString()} ${t.currency}`,
      'success'
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Period Selector */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-600">
              <DollarSign size={22} />
            </div>
            <div>
              <h2 className="text-xl font-black text-zinc-950 tracking-tight flex items-center gap-2">
                <span>{t.payrollTitle}</span>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-rose-100 text-rose-800 border border-rose-200">
                  {lang === 'ar' ? 'إداري خاص' : 'RESTRICTED / CONFIDENTIAL'}
                </span>
              </h2>
              <p className="text-xs text-zinc-500 mt-0.5">{t.payrollSubtitle}</p>
            </div>
          </div>
        </div>

        {/* Period Selector & Add Staff Profile */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center gap-1.5 bg-zinc-100 p-1 rounded-xl">
            {['July 2026', 'August 2026', 'September 2026'].map((period) => (
              <button
                key={period}
                type="button"
                onClick={() => setSelectedPeriod(period)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  selectedPeriod === period
                    ? 'bg-white text-zinc-950 shadow-xs'
                    : 'text-zinc-500 hover:text-zinc-900'
                }`}
              >
                {period}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => {
              setEditingEmployee(null);
              setFormData({
                name: '',
                role: 'Barista',
                phone: '',
                email: '',
                salaryType: 'monthly',
                baseSalary: 6500,
                hoursWorkedThisMonth: 160,
                bonus: 0,
                deductions: 0,
                bankAccountOrInstaPay: '',
                hireDate: new Date().toISOString().split('T')[0],
                status: 'active',
                shiftsCompleted: 20,
              });
              setIsAddEmployeeModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-xs transition cursor-pointer"
          >
            <UserPlus size={14} />
            <span>{lang === 'ar' ? 'إضافة ملف راتب موظف' : 'Add Employee Salary'}</span>
          </button>
        </div>
      </div>

      {/* Financial Payroll Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-white border border-zinc-200 shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block">
            {t.totalPayrollBudget}
          </span>
          <div className="text-2xl font-black text-zinc-950 font-mono mt-1">
            {totalPayrollBudget.toLocaleString()} <span className="text-xs text-zinc-500 font-sans">{t.currency}</span>
          </div>
          <span className="text-[10px] text-zinc-500 mt-1 block">
            {employees.length} {lang === 'ar' ? 'موظف مسجل' : 'Staff Members'}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-zinc-200 shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block">
            {lang === 'ar' ? 'إجمالي الرواتب الأساسية' : 'Total Base Pay'}
          </span>
          <div className="text-2xl font-black text-zinc-800 font-mono mt-1">
            {totalBaseSalary.toLocaleString()} <span className="text-xs text-zinc-500 font-sans">{t.currency}</span>
          </div>
          <span className="text-[10px] text-zinc-500 mt-1 block">
            {lang === 'ar' ? 'قبل الحوافز والخصم' : 'Before Bonuses / Deductions'}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-zinc-200 shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block">
            {lang === 'ar' ? 'إجمالي المكافآت والحوافز' : 'Total Bonuses'}
          </span>
          <div className="text-2xl font-black text-emerald-600 font-mono mt-1">
            +{totalBonuses.toLocaleString()} <span className="text-xs text-zinc-500 font-sans">{t.currency}</span>
          </div>
          <span className="text-[10px] text-emerald-700 mt-1 block">
            {lang === 'ar' ? 'حوافز أداء وتميز' : 'Performance Incentives'}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-zinc-200 shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block">
            {lang === 'ar' ? 'إجمالي الخصومات والتأخيرات' : 'Total Deductions'}
          </span>
          <div className="text-2xl font-black text-rose-600 font-mono mt-1">
            -{totalDeductions.toLocaleString()} <span className="text-xs text-zinc-500 font-sans">{t.currency}</span>
          </div>
          <span className="text-[10px] text-rose-700 mt-1 block">
            {lang === 'ar' ? 'غياب / تأخير ورديات' : 'Absences & Penalties'}
          </span>
        </div>
      </div>

      {/* Employee Compensation Ledger & Table */}
      <div className="bg-white rounded-3xl p-5 border border-zinc-200 shadow-2xs space-y-4">
        {/* Table Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-100">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {['All', ...ROLES].map((role) => (
              <button
                key={role}
                type="button"
                onClick={() => setRoleFilter(role)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                  roleFilter === role
                    ? 'bg-zinc-900 text-white shadow-xs'
                    : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                }`}
              >
                {role}
              </button>
            ))}
          </div>

          <div className="relative">
            <Search size={14} className="absolute start-2.5 top-2.5 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={lang === 'ar' ? 'بحث باسم الموظف أو إنستاباي...' : 'Search staff or InstaPay...'}
              className="ps-8 pe-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 focus:outline-none focus:border-amber-600 font-medium w-full sm:w-64"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-2xl border border-zinc-200">
          <table className="w-full text-xs text-start border-collapse">
            <thead className="bg-zinc-100 text-zinc-600 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-3 text-start">{t.name}</th>
                <th className="p-3 text-start">{t.role}</th>
                <th className="p-3 text-start">{lang === 'ar' ? 'نوع الراتب' : 'Type'}</th>
                <th className="p-3 text-start">{t.monthlyBase}</th>
                <th className="p-3 text-start">{t.loggedHoursThisMonth}</th>
                <th className="p-3 text-start">{t.bonus}</th>
                <th className="p-3 text-start">{t.deductions}</th>
                <th className="p-3 text-start">{t.netPay}</th>
                <th className="p-3 text-start">{lang === 'ar' ? 'حساب الصرف / InstaPay' : 'Disbursement / InstaPay'}</th>
                <th className="p-3 text-center">{t.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 bg-white">
              {filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan={10} className="p-8 text-center text-zinc-400">
                    {lang === 'ar' ? 'لا يوجد موظفون مطابقون' : 'No staff members found.'}
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((emp) => {
                  const net = calculateNetPay(emp);
                  const paidRecord = payrollRecords.find(
                    (p) => p.employeeId === emp.id && p.period === selectedPeriod && p.status === 'paid'
                  );

                  return (
                    <tr key={emp.id} className="hover:bg-zinc-50/80 transition">
                      <td className="p-3">
                        <div className="font-bold text-zinc-950">{emp.name}</div>
                        <div className="text-[10px] text-zinc-400 font-mono">{emp.phone}</div>
                      </td>
                      <td className="p-3 text-zinc-700 font-medium">{emp.role}</td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${
                            emp.salaryType === 'monthly'
                              ? 'bg-blue-50 text-blue-800 border border-blue-200'
                              : 'bg-purple-50 text-purple-800 border border-purple-200'
                          }`}
                        >
                          {emp.salaryType === 'monthly' ? 'Monthly Fixed' : 'Hourly Rate'}
                        </span>
                      </td>
                      <td className="p-3 font-mono font-bold text-zinc-900">
                        {emp.baseSalary.toLocaleString()} {t.currency}
                      </td>
                      <td className="p-3 font-mono text-zinc-800">
                        {emp.hoursWorkedThisMonth} hrs
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-1 font-mono text-emerald-600 font-bold">
                          <span>+{emp.bonus.toLocaleString()}</span>
                          <button
                            type="button"
                            onClick={() => setBonusDeductionTarget({ employee: emp, type: 'bonus' })}
                            className="p-1 hover:bg-emerald-50 rounded text-emerald-700 transition cursor-pointer"
                            title="Add Bonus"
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-1 font-mono text-rose-600 font-bold">
                          <span>-{emp.deductions.toLocaleString()}</span>
                          <button
                            type="button"
                            onClick={() => setBonusDeductionTarget({ employee: emp, type: 'deduction' })}
                            className="p-1 hover:bg-rose-50 rounded text-rose-700 transition cursor-pointer"
                            title="Apply Deduction"
                          >
                            <Minus size={12} />
                          </button>
                        </div>
                      </td>
                      <td className="p-3">
                        <span className="font-mono font-black text-sm text-zinc-950 bg-amber-50 px-2 py-1 rounded-lg border border-amber-200">
                          {net.toLocaleString()} {t.currency}
                        </span>
                      </td>
                      <td className="p-3 font-mono text-zinc-600">
                        {emp.bankAccountOrInstaPay ? (
                          <span className="px-2 py-0.5 rounded bg-zinc-100 border border-zinc-200 text-[10px] font-bold text-zinc-800">
                            {emp.bankAccountOrInstaPay}
                          </span>
                        ) : (
                          <span className="text-zinc-400 text-[10px]">{lang === 'ar' ? 'نقداً (كاش)' : 'Cash in hand'}</span>
                        )}
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Issue / Print Payslip */}
                          <button
                            type="button"
                            onClick={() => {
                              const payRec: PayrollRecord = paidRecord || {
                                id: `payslip-${emp.id}-${Date.now()}`,
                                employeeId: emp.id,
                                employeeName: emp.name,
                                period: selectedPeriod,
                                baseSalary: emp.baseSalary,
                                hoursWorked: emp.hoursWorkedThisMonth,
                                bonus: emp.bonus,
                                deductions: emp.deductions,
                                netSalary: net,
                                paymentDate: new Date().toISOString().split('T')[0],
                                status: paidRecord ? 'paid' : 'pending',
                                paymentMethod: emp.bankAccountOrInstaPay ? 'InstaPay' : 'Cash',
                                notes: `Issued payslip statement for ${emp.name}`,
                              };
                              setViewingPayslip(payRec);
                            }}
                            className="p-1.5 text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100 rounded-lg transition cursor-pointer"
                            title={t.issuePayslip}
                          >
                            <Printer size={14} className="text-amber-600" />
                          </button>

                          {/* Mark Paid Button */}
                          {paidRecord ? (
                            <span className="px-2 py-1 rounded-lg bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center gap-1">
                              <CheckCircle2 size={12} />
                              <span>{t.paid}</span>
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleMarkAsPaid(emp)}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold transition cursor-pointer shadow-2xs"
                            >
                              {lang === 'ar' ? 'صرف الراتب' : 'Disburse'}
                            </button>
                          )}

                          {/* Edit Employee Info */}
                          <button
                            type="button"
                            onClick={() => {
                              setEditingEmployee(emp);
                              setFormData({
                                name: emp.name,
                                role: emp.role,
                                phone: emp.phone,
                                email: emp.email,
                                salaryType: emp.salaryType,
                                baseSalary: emp.baseSalary,
                                hoursWorkedThisMonth: emp.hoursWorkedThisMonth,
                                bonus: emp.bonus,
                                deductions: emp.deductions,
                                bankAccountOrInstaPay: emp.bankAccountOrInstaPay || '',
                                hireDate: emp.hireDate,
                                status: emp.status,
                                shiftsCompleted: emp.shiftsCompleted,
                              });
                              setIsAddEmployeeModalOpen(true);
                            }}
                            className="p-1.5 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded-lg transition cursor-pointer"
                            title={t.edit}
                          >
                            <Edit3 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bonus / Deduction Dialog */}
      {bonusDeductionTarget && (
        <div
          id="bonus-deduction-modal"
          onClick={() => setBonusDeductionTarget(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-xs animate-in fade-in duration-150"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm bg-white rounded-3xl p-5 shadow-2xl border border-zinc-200 space-y-4 animate-in zoom-in-95 duration-150"
          >
            <div className="flex items-center justify-between pb-2 border-b border-zinc-100">
              <h3 className="font-bold text-sm text-zinc-950 flex items-center gap-2">
                {bonusDeductionTarget.type === 'bonus' ? (
                  <Award size={18} className="text-emerald-600" />
                ) : (
                  <Minus size={18} className="text-rose-600" />
                )}
                <span>
                  {bonusDeductionTarget.type === 'bonus'
                    ? lang === 'ar' ? 'إضافة مكافأة مالية' : 'Add Financial Bonus'
                    : lang === 'ar' ? 'تطبيق خصم مالي' : 'Apply Payroll Deduction'}
                </span>
              </h3>
              <button
                type="button"
                onClick={() => setBonusDeductionTarget(null)}
                className="p-1 text-zinc-400 hover:text-zinc-700 rounded-lg"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-3 rounded-2xl bg-zinc-50 border border-zinc-200/70 text-xs">
              <div className="font-bold text-zinc-950">{bonusDeductionTarget.employee.name}</div>
              <div className="text-zinc-500">{bonusDeductionTarget.employee.role}</div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-zinc-700 mb-1">
                  {lang === 'ar' ? 'المبلغ (ج.م)' : 'Amount (EGP)'}
                </label>
                <input
                  type="number"
                  value={adjustmentAmount}
                  onChange={(e) => setAdjustmentAmount(e.target.value)}
                  placeholder="e.g. 500"
                  className="w-full p-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-mono font-bold text-zinc-900 focus:outline-none focus:border-amber-600"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-700 mb-1">
                  {lang === 'ar' ? 'سبب المكافأة أو الخصم' : 'Reason / Note'}
                </label>
                <input
                  type="text"
                  value={adjustmentReason}
                  onChange={(e) => setAdjustmentReason(e.target.value)}
                  placeholder={
                    bonusDeductionTarget.type === 'bonus'
                      ? lang === 'ar' ? 'مكافأة تميز في خدمة العملاء' : 'Excellent performance / shift bonus'
                      : lang === 'ar' ? 'تأخير 3 ساعات عن الوردية' : 'Late arrival / shift penalty'
                  }
                  className="w-full p-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 focus:outline-none focus:border-amber-600"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setBonusDeductionTarget(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-600 hover:bg-zinc-100"
              >
                {t.cancel}
              </button>
              <button
                type="button"
                onClick={handleApplyAdjustment}
                className={`px-4 py-2 rounded-xl text-xs font-bold text-white shadow-2xs ${
                  bonusDeductionTarget.type === 'bonus'
                    ? 'bg-emerald-600 hover:bg-emerald-500'
                    : 'bg-rose-600 hover:bg-rose-500'
                }`}
              >
                {t.save}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Official Payslip Printable Statement Modal */}
      {viewingPayslip && (
        <div
          id="payslip-modal"
          onClick={() => setViewingPayslip(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/85 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-zinc-300 animate-in zoom-in-95 duration-150 flex flex-col my-auto"
          >
            {/* Header controls (hidden on print) */}
            <div className="no-print p-4 bg-zinc-950 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText size={16} className="text-amber-400" />
                <span className="text-xs font-bold tracking-wider uppercase">{t.salarySlipTitle}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Printer size={14} />
                  <span>{t.print}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewingPayslip(null)}
                  className="p-1.5 text-zinc-400 hover:text-white rounded-lg"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Printable Payslip Body */}
            <div id="printable-invoice-document" className="p-6 space-y-4 text-xs font-sans select-text bg-white text-zinc-950">
              {/* Slip Brand Header */}
              <div className="text-center border-b-2 border-zinc-900 pb-3 space-y-1">
                <h2 className="text-base font-black tracking-wider uppercase">WHITE TABLE COWORKING & CAFE</h2>
                <p className="text-[10px] text-zinc-500 font-medium">OFFICIAL MONTHLY SALARY STATEMENT / كشف راتب شهري</p>
                <div className="inline-block font-mono text-[11px] font-bold bg-zinc-100 px-3 py-1 rounded-full border border-zinc-300 mt-1">
                  PERIOD: {viewingPayslip.period}
                </div>
              </div>

              {/* Employee Meta Details */}
              <div className="grid grid-cols-2 gap-3 p-3 bg-zinc-50 rounded-2xl border border-zinc-200 text-[11px]">
                <div>
                  <span className="text-zinc-400 block uppercase font-bold text-[9px]">Employee Name / اسم الموظف:</span>
                  <span className="font-black text-sm text-zinc-900">{viewingPayslip.employeeName}</span>
                </div>
                <div>
                  <span className="text-zinc-400 block uppercase font-bold text-[9px]">Disbursement Method / طريقة الصرف:</span>
                  <span className="font-mono font-bold text-zinc-800">{viewingPayslip.paymentMethod || 'InstaPay'}</span>
                </div>
                <div>
                  <span className="text-zinc-400 block uppercase font-bold text-[9px]">Issue Date / تاريخ الإصدار:</span>
                  <span className="font-mono text-zinc-700">{viewingPayslip.paymentDate}</span>
                </div>
                <div>
                  <span className="text-zinc-400 block uppercase font-bold text-[9px]">Payment Status / حالة الصرف:</span>
                  <span className="font-bold text-emerald-700 uppercase">{viewingPayslip.status}</span>
                </div>
              </div>

              {/* Breakdown Breakdown */}
              <div className="space-y-2 border border-zinc-200 rounded-2xl p-4 bg-white">
                <div className="flex justify-between items-center py-1 border-b border-zinc-100">
                  <span className="text-zinc-600 font-medium">Base Salary Rate:</span>
                  <span className="font-mono font-bold">{viewingPayslip.baseSalary.toLocaleString()} {t.currency}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-zinc-100">
                  <span className="text-zinc-600 font-medium">Logged Working Hours:</span>
                  <span className="font-mono font-bold">{viewingPayslip.hoursWorked} hrs</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-zinc-100 text-emerald-600">
                  <span className="font-medium">+ Performance Bonuses & Overtime:</span>
                  <span className="font-mono font-bold">+{viewingPayslip.bonus.toLocaleString()} {t.currency}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-zinc-100 text-rose-600">
                  <span className="font-medium">- Deductions, Delays & Penalties:</span>
                  <span className="font-mono font-bold">-{viewingPayslip.deductions.toLocaleString()} {t.currency}</span>
                </div>

                <div className="flex justify-between items-center pt-2 text-base font-black text-zinc-950 border-t-2 border-zinc-900">
                  <span>NET PAYABLE AMOUNT / صافي المستحق:</span>
                  <span className="font-mono text-lg text-emerald-700">
                    {viewingPayslip.netSalary.toLocaleString()} {t.currency}
                  </span>
                </div>
              </div>

              {/* Signature section */}
              <div className="grid grid-cols-2 gap-8 pt-4 text-center text-[10px] text-zinc-500">
                <div className="border-t border-zinc-300 pt-2">
                  <span>Authorized Signature / توقيع الإدارة</span>
                </div>
                <div className="border-t border-zinc-300 pt-2">
                  <span>Employee Signature / توقيع المستلم</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Employee Salary Profile Modal */}
      {isAddEmployeeModalOpen && (
        <div
          id="employee-form-modal"
          onClick={() => setIsAddEmployeeModalOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl border border-zinc-200 space-y-4 animate-in zoom-in-95 duration-150 my-auto"
          >
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <h3 className="font-bold text-base text-zinc-950 flex items-center gap-2">
                <Briefcase size={18} className="text-amber-600" />
                <span>
                  {editingEmployee
                    ? lang === 'ar' ? 'تعديل بيانات وراتب الموظف' : 'Edit Employee Salary'
                    : lang === 'ar' ? 'إضافة موظف جديد لجدول الرواتب' : 'Add Employee Salary Profile'}
                </span>
              </h3>
              <button
                type="button"
                onClick={() => setIsAddEmployeeModalOpen(false)}
                className="p-1 text-zinc-400 hover:text-zinc-700 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-[11px] font-bold text-zinc-700 mb-1">{t.name}</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Omar Khaled"
                  className="w-full p-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 focus:outline-none focus:border-amber-600"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-700 mb-1">{t.role}</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as EmployeeRole })}
                  className="w-full p-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 focus:outline-none focus:border-amber-600"
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-700 mb-1">{t.phone}</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="010XXXXXXXX"
                  className="w-full p-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 focus:outline-none focus:border-amber-600"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-700 mb-1">{lang === 'ar' ? 'حساب إنستاباي / IBAN' : 'InstaPay Username / IBAN'}</label>
                <input
                  type="text"
                  value={formData.bankAccountOrInstaPay}
                  onChange={(e) => setFormData({ ...formData, bankAccountOrInstaPay: e.target.value })}
                  placeholder="e.g. omar@instapay"
                  className="w-full p-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 focus:outline-none focus:border-amber-600"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-700 mb-1">{lang === 'ar' ? 'نوع نظام الراتب' : 'Salary System'}</label>
                <select
                  value={formData.salaryType}
                  onChange={(e) => setFormData({ ...formData, salaryType: e.target.value as 'monthly' | 'hourly' })}
                  className="w-full p-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 focus:outline-none focus:border-amber-600"
                >
                  <option value="monthly">Monthly Fixed Base (راتب شهري ثابت)</option>
                  <option value="hourly">Hourly Rate (محاسبة بالساعة)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-700 mb-1">
                  {formData.salaryType === 'monthly' ? t.monthlyBase : t.hourlyRateLabel} ({t.currency})
                </label>
                <input
                  type="number"
                  value={formData.baseSalary}
                  onChange={(e) => setFormData({ ...formData, baseSalary: parseFloat(e.target.value) || 0 })}
                  className="w-full p-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 focus:outline-none focus:border-amber-600 font-mono"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-100">
              <button
                type="button"
                onClick={() => setIsAddEmployeeModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-600 hover:bg-zinc-100"
              >
                {t.cancel}
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!formData.name.trim()) {
                    notify(
                      lang === 'ar' ? 'يرجى إدخال اسم الموظف' : 'Name is required',
                      '',
                      'warning'
                    );
                    return;
                  }

                  if (editingEmployee) {
                    onUpdateEmployee({
                      ...editingEmployee,
                      ...formData,
                    });
                  } else {
                    onAddEmployee({
                      ...formData,
                      isClockedIn: false,
                      clockInTime: undefined,
                    });
                  }

                  setIsAddEmployeeModalOpen(false);
                }}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white shadow-xs"
              >
                {t.save}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
