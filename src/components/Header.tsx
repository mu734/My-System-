import React, { useState, useEffect } from 'react';
import {
  Clock,
  Coffee,
  Printer,
  DollarSign,
  Languages,
  Terminal,
  UserCheck,
} from 'lucide-react';
import { AppTab } from '../types';
import { UserAccount } from '../utils/auth';
import { kickCashDrawer } from '../services/hardwareService';
import { useLanguage } from '../i18n/LanguageContext';

interface HeaderProps {
  currentTab: AppTab;
  currentUser: UserAccount;
  onOpenSignInModal: () => void;
  onOpenPOS: () => void;
  onOpenHardwareModal: () => void;
  onOpenDevConsole?: () => void;
  notify: (title: string, message: string, type?: 'success' | 'warning' | 'info') => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  currentUser,
  onOpenSignInModal,
  onOpenPOS,
  onOpenHardwareModal,
  onOpenDevConsole,
  notify,
}) => {
  const [timeStr, setTimeStr] = useState('');
  const [isKickingDrawer, setIsKickingDrawer] = useState(false);
  const { lang, toggleLang, t } = useLanguage();

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString(lang === 'ar' ? 'ar-EG' : 'en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [lang]);

  const handleManualKickDrawer = async () => {
    setIsKickingDrawer(true);
    const res = await kickCashDrawer();
    notify(
      lang === 'ar' ? 'تم فتح الدرج' : 'Cash Drawer Opened',
      lang === 'ar' ? 'تم إرسال إشارة الفتح للدرج (RJ11).' : 'RJ11 kick pulse fired.',
      'success'
    );
    setTimeout(() => setIsKickingDrawer(false), 1000);
  };

  const titles: Record<AppTab, string> = {
    dashboard: t.dashboard,
    pos: t.pos,
    coworking: t.desksTitle,
    kitchen: t.kitchenOrders,
    stock: t.inventoryTitle,
    invoices: t.invoicesTitle,
    crm: t.crmTitle,
    attendance: t.attendance,
    payroll: t.payrollTitle,
    analytics: t.analytics,
    integrations: t.integrations,
    tutorials: t.tutorials,
  };

  return (
    <header className="h-16 bg-white border-b border-zinc-200 px-6 flex items-center justify-between sticky top-0 z-20">
      <div className="flex items-center gap-3">
        <h2 className="text-base font-black text-zinc-950 uppercase tracking-tight font-sans">
          {titles[currentTab]}
        </h2>

        {/* User Account Chip */}
        <button
          type="button"
          onClick={onOpenSignInModal}
          title={lang === 'ar' ? 'تبديل المستخدم أو تسجيل الدخول' : 'Switch user / Sign In'}
          className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 text-xs font-bold transition cursor-pointer text-zinc-800"
        >
          <span
            className="w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-black text-white"
            style={{ backgroundColor: currentUser.avatarColor || '#10B981' }}
          >
            {currentUser.initials}
          </span>
          <span className="font-semibold">{lang === 'ar' ? currentUser.nameAr : currentUser.name}</span>
          <span className="text-[10px] text-zinc-500 font-normal">
            ({lang === 'ar' ? currentUser.roleLabelAr : currentUser.roleLabelEn})
          </span>
          <UserCheck size={12} className="text-emerald-600 ms-0.5" />
        </button>
      </div>

      <div className="flex items-center gap-2.5">
        {/* Developer Console Button for Software Engineer & Owner */}
        {(currentUser.role === 'software_engineer' || currentUser.role === 'owner') && onOpenDevConsole && (
          <button
            type="button"
            onClick={onOpenDevConsole}
            title={t.devConsole}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-xs cursor-pointer"
          >
            <Terminal size={14} />
            <span className="hidden md:inline">{lang === 'ar' ? 'لوحة المطور' : 'Dev Console'}</span>
          </button>
        )}

        {/* Language Switcher Button */}
        <button
          type="button"
          onClick={toggleLang}
          title={lang === 'en' ? 'التبديل إلى العربية' : 'Switch to English'}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-bold border border-zinc-300 transition cursor-pointer"
        >
          <Languages size={14} className="text-emerald-600" />
          <span className="font-semibold">{lang === 'en' ? 'العربية' : 'English'}</span>
          <span className="text-[10px] px-1.5 py-0.2 bg-white rounded text-zinc-600 border border-zinc-200 font-mono uppercase">
            {lang === 'en' ? 'AR' : 'EN'}
          </span>
        </button>

        {/* Live digital clock */}
        <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs font-mono font-semibold text-zinc-800">
          <Clock size={13} className="text-emerald-600" />
          <span>{timeStr}</span>
        </div>

        {/* Cash Drawer Kick Action Button */}
        <button
          type="button"
          onClick={handleManualKickDrawer}
          title={lang === 'ar' ? 'فتح درج النقدية' : 'Trigger Cash Drawer Pulse (RJ11/RJ12)'}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition border cursor-pointer ${
            isKickingDrawer
              ? 'bg-emerald-600 text-white border-emerald-600 animate-pulse'
              : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-800 border-zinc-300'
          }`}
        >
          <DollarSign size={14} className="text-emerald-600" />
          <span className="hidden sm:inline">{t.kickDrawer}</span>
        </button>

        {/* Hardware / Receipt Printer Config Button */}
        <button
          type="button"
          id="btn-header-hardware-modal"
          onClick={onOpenHardwareModal}
          title={lang === 'ar' ? 'إعدادات طابعة زيويل 80 والدرج' : 'Zywell 80 POS Printer & Hardware Settings'}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-bold transition shadow-xs cursor-pointer"
        >
          <Printer size={14} className="text-emerald-400" />
          <span className="hidden sm:inline">Zywell 80</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        </button>

        {/* POS Order button */}
        {currentTab !== 'pos' && (
          <button
            type="button"
            onClick={onOpenPOS}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs cursor-pointer"
          >
            <Coffee size={14} /> {t.quickPOS}
          </button>
        )}
      </div>
    </header>
  );
};
