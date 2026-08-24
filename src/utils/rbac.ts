import { UserRole, AppTab } from '../types';

export interface RoleConfig {
  id: UserRole;
  labelEn: string;
  labelAr: string;
  badgeEn: string;
  badgeAr: string;
  descriptionEn: string;
  descriptionAr: string;
  color: string;
  allowedTabs: AppTab[];
  canManageStock: boolean;
  canViewPayroll: boolean;
  canManagePayroll: boolean;
  canViewFinancialAnalytics: boolean;
  canAccessDevConsole: boolean;
  canDeleteRecords: boolean;
  canApplySpecialDiscount: boolean;
}

export const ROLE_CONFIGS: Record<UserRole, RoleConfig> = {
  owner: {
    id: 'owner',
    labelEn: 'Business Owner',
    labelAr: 'المالك والمؤسس',
    badgeEn: 'Full Authority',
    badgeAr: 'صلاحيات كاملة',
    descriptionEn: 'Unrestricted access across all operational, financial, and administrative systems.',
    descriptionAr: 'وصول شامل لجميع الأنظمة التشغيلية والمالية والإدارية دون أي قيود.',
    color: 'bg-amber-500 text-zinc-950 border-amber-400',
    allowedTabs: [
      'dashboard',
      'pos',
      'coworking',
      'kitchen',
      'stock',
      'invoices',
      'crm',
      'attendance',
      'payroll',
      'analytics',
      'integrations',
      'tutorials',
    ],
    canManageStock: true,
    canViewPayroll: true,
    canManagePayroll: true,
    canViewFinancialAnalytics: true,
    canAccessDevConsole: true,
    canDeleteRecords: true,
    canApplySpecialDiscount: true,
  },
  manager: {
    id: 'manager',
    labelEn: 'System Manager',
    labelAr: 'مدير النظام والعمليات',
    badgeEn: 'Operations & Finance',
    badgeAr: 'إدارة وتشغيل',
    descriptionEn: 'Full operational control over inventory, staff rosters, invoices, orders, and tables.',
    descriptionAr: 'تحكم كامل في المخزون، الحضور، الفواتير، التذاكر، وجداول الرواتب والعمليات.',
    color: 'bg-emerald-600 text-white border-emerald-500',
    allowedTabs: [
      'dashboard',
      'pos',
      'coworking',
      'kitchen',
      'stock',
      'invoices',
      'crm',
      'attendance',
      'payroll',
      'analytics',
      'integrations',
      'tutorials',
    ],
    canManageStock: true,
    canViewPayroll: true,
    canManagePayroll: true,
    canViewFinancialAnalytics: true,
    canAccessDevConsole: true,
    canDeleteRecords: true,
    canApplySpecialDiscount: true,
  },
  software_engineer: {
    id: 'software_engineer',
    labelEn: 'Software Engineer',
    labelAr: 'مهندس البرمجيات (Developer)',
    badgeEn: 'SuperAdmin + Dev Console',
    badgeAr: 'مطور النظام الكامل',
    descriptionEn: 'Lead architect access with raw state diagnostics, database logs, and system inspector tools.',
    descriptionAr: 'صلاحيات المهندس المعماري للنظام مع أدوات تصحيح الأخطاء وفحص البيانات وسجلات الـ KOT.',
    color: 'bg-indigo-600 text-white border-indigo-400',
    allowedTabs: [
      'dashboard',
      'pos',
      'coworking',
      'kitchen',
      'stock',
      'invoices',
      'crm',
      'attendance',
      'payroll',
      'analytics',
      'integrations',
      'tutorials',
    ],
    canManageStock: true,
    canViewPayroll: true,
    canManagePayroll: true,
    canViewFinancialAnalytics: true,
    canAccessDevConsole: true,
    canDeleteRecords: true,
    canApplySpecialDiscount: true,
  },
  cashier: {
    id: 'cashier',
    labelEn: 'Cashier & Front Desk',
    labelAr: 'الكاشير وخدمة العملاء',
    badgeEn: 'Sales & KOT Station',
    badgeAr: 'نقاط البيع والتذاكر',
    descriptionEn: 'Point of sale billing, table coworking sessions, kitchen order routing, invoice receipts, and shift check-in.',
    descriptionAr: 'إصدار الطلبات ونقاط البيع، حجز مساحة العمل، تذاكر المطبخ، طباعة الإيصالات، وتسجيل حضور الورديات.',
    color: 'bg-cyan-600 text-white border-cyan-400',
    allowedTabs: [
      'pos',
      'coworking',
      'kitchen',
      'invoices',
      'crm',
      'attendance',
      'tutorials',
    ],
    canManageStock: false,
    canViewPayroll: false, // EXPLICITLY FORBIDDEN from seeing salaries
    canManagePayroll: false,
    canViewFinancialAnalytics: false,
    canAccessDevConsole: false,
    canDeleteRecords: false,
    canApplySpecialDiscount: false,
  },
  staff: {
    id: 'staff',
    labelEn: 'Staff / Barista / Chef',
    labelAr: 'فريق العمل (باريستا / شيف)',
    badgeEn: 'Kitchen & Time Clock',
    badgeAr: 'المطبخ والباريستا',
    descriptionEn: 'Live kitchen and bar order ticket preparation display and shift time clock.',
    descriptionAr: 'شاشة تحضير طلبات المطبخ والباريستا وتسجيل الحضور والانصراف للوردية.',
    color: 'bg-orange-600 text-white border-orange-400',
    allowedTabs: [
      'kitchen',
      'attendance',
      'tutorials',
    ],
    canManageStock: false,
    canViewPayroll: false,
    canManagePayroll: false,
    canViewFinancialAnalytics: false,
    canAccessDevConsole: false,
    canDeleteRecords: false,
    canApplySpecialDiscount: false,
  },
};

export function canAccessTab(role: UserRole, tab: AppTab): boolean {
  return ROLE_CONFIGS[role]?.allowedTabs.includes(tab) ?? false;
}

export function getDefaultTabForRole(role: UserRole): AppTab {
  const allowed = ROLE_CONFIGS[role]?.allowedTabs || ['pos'];
  return allowed[0] || 'pos';
}
