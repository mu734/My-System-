import React from 'react';
import {
  LayoutGrid,
  Coffee,
  Armchair,
  Boxes,
  Receipt,
  Users,
  Clock,
  DollarSign,
  BarChart3,
  Printer,
  Languages,
  ChefHat,
  Terminal,
  LogOut,
  UserCheck,
  GraduationCap,
  Cable,
} from 'lucide-react';
import { AppTab, UserRole } from '../types';
import { UserAccount } from '../utils/auth';
import { WhiteTableLogo } from './WhiteTableLogo';
import { useLanguage } from '../i18n/LanguageContext';
import { canAccessTab } from '../utils/rbac';

interface SidebarProps {
  currentTab: AppTab;
  onTabChange: (tab: AppTab) => void;
  currentUser: UserAccount;
  onOpenSignInModal: () => void;
  lowStockCount: number;
  activeSessionsCount: number;
  queuedKitchenTicketsCount: number;
  onOpenHardwareModal: () => void;
  onOpenDevConsole?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onTabChange,
  currentUser,
  onOpenSignInModal,
  lowStockCount,
  activeSessionsCount,
  queuedKitchenTicketsCount,
  onOpenHardwareModal,
  onOpenDevConsole,
}) => {
  const { lang, toggleLang, t } = useLanguage();

  const allNavItems = [
    { id: 'dashboard' as AppTab, label: t.dashboard, icon: LayoutGrid },
    { id: 'pos' as AppTab, label: t.pos, icon: Coffee },
    {
      id: 'coworking' as AppTab,
      label: t.coworking,
      icon: Armchair,
      badge: activeSessionsCount > 0 ? activeSessionsCount : undefined,
      badgeColor: 'bg-emerald-600 text-white',
    },
    {
      id: 'kitchen' as AppTab,
      label: t.kitchen,
      icon: ChefHat,
      badge: queuedKitchenTicketsCount > 0 ? queuedKitchenTicketsCount : undefined,
      badgeColor: 'bg-orange-600 text-white animate-pulse',
    },
    {
      id: 'stock' as AppTab,
      label: t.stock,
      icon: Boxes,
      badge: lowStockCount > 0 ? lowStockCount : undefined,
      badgeColor: 'bg-rose-600 text-white',
    },
    { id: 'invoices' as AppTab, label: t.invoices, icon: Receipt },
    { id: 'crm' as AppTab, label: t.crm, icon: Users },
    { id: 'attendance' as AppTab, label: t.attendance, icon: Clock },
    { id: 'payroll' as AppTab, label: t.payroll, icon: DollarSign },
    { id: 'analytics' as AppTab, label: t.analytics, icon: BarChart3 },
    {
      id: 'integrations' as AppTab,
      label: t.integrations,
      icon: Cable,
      badge: 'API',
      badgeColor: 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/40',
    },
    {
      id: 'tutorials' as AppTab,
      label: t.tutorials,
      icon: GraduationCap,
      badge: 'PRO',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
    },
  ];

  // Filter navigation items by active user role permissions
  const visibleNavItems = allNavItems.filter((item) => canAccessTab(currentUser.role, item.id));

  return (
    <aside className="w-64 bg-zinc-950 border-r border-zinc-800/80 text-zinc-100 flex flex-col justify-between shrink-0 h-screen sticky top-0 select-none overflow-y-auto">
      <div className="p-4">
        {/* Brand Header with Logo */}
        <div className="flex items-center gap-2.5 mb-4 pb-3.5 border-b border-zinc-800">
          <div className="p-2 rounded-xl bg-white text-black shadow-md flex items-center justify-center shrink-0">
            <WhiteTableLogo size={28} dark={false} />
          </div>
          <div className="min-w-0">
            <h1 className="text-sm font-black tracking-tight text-white uppercase leading-none font-sans truncate">
              {t.brandName}
            </h1>
            <p className="text-[9px] text-emerald-400 font-bold tracking-wider uppercase mt-1">
              {t.brandSubtitle}
            </p>
          </div>
        </div>

        {/* Active Logged-In User Profile Card */}
        <div className="mb-3.5 p-2.5 rounded-xl bg-zinc-900/90 border border-zinc-800 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-[11px] font-black text-white shrink-0 shadow-sm"
              style={{ backgroundColor: currentUser.avatarColor || '#10B981' }}
            >
              {currentUser.initials}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-white truncate leading-tight">
                {lang === 'ar' ? currentUser.nameAr : currentUser.name}
              </div>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="text-[9px] font-semibold text-emerald-400 px-1.5 py-0.2 rounded bg-emerald-950/60 border border-emerald-800/50 truncate">
                  {lang === 'ar' ? currentUser.roleLabelAr : currentUser.roleLabelEn}
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenSignInModal}
            title={lang === 'ar' ? 'تبديل المستخدم / تسجيل الخروج' : 'Switch User / Sign In'}
            className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition cursor-pointer shrink-0"
          >
            <UserCheck size={14} className="text-emerald-400" />
          </button>
        </div>

        {/* Section Navigation Items (Slightly smaller, sleek and perfectly proportioned) */}
        <nav className="space-y-1">
          {visibleNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all duration-150 cursor-pointer ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/40 ring-1 ring-emerald-400/30 font-extrabold translate-x-0.5'
                    : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`p-1 rounded-lg transition ${
                      isActive ? 'bg-white/20 text-white' : 'text-zinc-400'
                    }`}
                  >
                    <Icon size={16} strokeWidth={isActive ? 2.5 : 2} />
                  </div>
                  <span className="tracking-tight text-xs font-semibold truncate">{item.label}</span>
                </div>

                {item.badge !== undefined && (
                  <span
                    className={`px-2 py-0.5 text-[10px] font-black rounded-full font-mono shrink-0 ms-1.5 ${item.badgeColor}`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Cashier & Hardware Quick Access Footer */}
      <div className="p-2.5 m-3 bg-zinc-900/90 rounded-xl border border-zinc-800/80 space-y-1.5">
        {/* Developer Console trigger if Software Engineer or Owner */}
        {(currentUser.role === 'software_engineer' || currentUser.role === 'owner') && onOpenDevConsole && (
          <button
            type="button"
            onClick={onOpenDevConsole}
            className="w-full flex items-center justify-between p-2 rounded-lg bg-indigo-950/60 hover:bg-indigo-900/80 border border-indigo-800/60 text-xs text-indigo-300 hover:text-white transition font-bold cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Terminal size={14} className="text-indigo-400" />
              <span className="text-[11px]">{lang === 'ar' ? 'لوحة المطور' : 'Dev Console'}</span>
            </div>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          </button>
        )}

        {/* Hardware settings button */}
        <button
          type="button"
          id="btn-sidebar-hardware-modal"
          onClick={onOpenHardwareModal}
          className="w-full flex items-center justify-between p-2 rounded-lg bg-zinc-800/80 hover:bg-zinc-800 border border-zinc-700/60 text-xs text-zinc-300 hover:text-white transition font-medium cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Printer size={14} className="text-emerald-400" />
            <span className="text-[11px] font-bold">Zywell 80 POS</span>
          </div>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        </button>

        {/* Language quick switcher */}
        <button
          type="button"
          onClick={toggleLang}
          className="w-full flex items-center justify-between p-2 rounded-lg bg-zinc-800/80 hover:bg-zinc-800 border border-zinc-700/60 text-xs text-zinc-300 hover:text-white transition font-medium cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Languages size={14} className="text-emerald-400" />
            <span className="text-[11px]">{lang === 'en' ? 'English' : 'العربية'}</span>
          </div>
          <span className="text-[9px] uppercase font-bold text-zinc-400 px-1 py-0.2 rounded bg-zinc-700">
            {lang === 'en' ? 'AR' : 'EN'}
          </span>
        </button>

        {/* Sign Out / Switch User Action */}
        <button
          type="button"
          onClick={onOpenSignInModal}
          className="w-full flex items-center justify-between p-2 rounded-lg bg-zinc-950 hover:bg-zinc-800/90 border border-zinc-800 text-xs text-zinc-400 hover:text-rose-400 transition font-medium cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <LogOut size={14} />
            <span className="text-[11px]">{lang === 'ar' ? 'تبديل الحساب' : 'Switch Account'}</span>
          </div>
          <span className="text-[10px] text-zinc-500 font-mono">@{currentUser.username}</span>
        </button>
      </div>
    </aside>
  );
};
