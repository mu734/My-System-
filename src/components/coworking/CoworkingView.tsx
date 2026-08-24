import React, { useState, useEffect, useMemo } from 'react';
import {
  Armchair,
  Clock,
  Play,
  Square,
  Plus,
  Coffee,
  CheckCircle2,
  Users,
  User,
  Wifi,
  Sparkles,
  Search,
  Filter,
  CreditCard,
  MessageSquare,
  Zap,
  Check,
  Copy,
  Receipt,
  Layers,
  Flame,
} from 'lucide-react';
import { Desk, DeskSession, Customer, MenuItem, Order, CartItem } from '../../types';
import { StartSessionModal } from './DeskSessionModal';
import { CheckoutSessionModal } from './CheckoutSessionModal';
import { useLanguage } from '../../i18n/LanguageContext';

interface CoworkingViewProps {
  desks: Desk[];
  sessions: DeskSession[];
  customers: Customer[];
  menu: MenuItem[];
  onStartSession: (
    deskId: string,
    customerId: string,
    options?: { hasWifiCombo?: boolean; wifiCardCode?: string; notes?: string }
  ) => void;
  onEndSession: (
    sessionId: string,
    paymentMethod?: 'Cash' | 'Credit Card' | 'InstaPay / Wallet' | 'Member Tab'
  ) => Order;
  onToggleWifiCombo?: (sessionId: string) => void;
  onOpenNewCustomerModal: () => void;
  notify: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const CoworkingView: React.FC<CoworkingViewProps> = ({
  desks,
  sessions,
  customers,
  menu,
  onStartSession,
  onEndSession,
  onToggleWifiCombo,
  onOpenNewCustomerModal,
  notify,
}) => {
  const { lang, t, formatCurrency } = useLanguage();
  const [selectedZone, setSelectedZone] = useState<string>('All');
  const [filterStatus, setFilterStatus] = useState<'All' | 'Available' | 'Occupied' | 'Combo'>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeModalDesk, setActiveModalDesk] = useState<Desk | null>(null);
  const [checkoutSessionData, setCheckoutSessionData] = useState<{
    desk: Desk;
    session: DeskSession;
  } | null>(null);
  const [copiedWifiCode, setCopiedWifiCode] = useState<string | null>(null);

  // Live timer tick every 10 seconds for real-time calculations
  const [currentTime, setCurrentTime] = useState(Date.now());
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(Date.now()), 10000);
    return () => clearInterval(timer);
  }, []);

  const zones = ['All', 'Quiet Zone', 'Collaborative', 'Private Pod', 'Meeting Room', 'Outdoor Terrace'];

  // Filter 14 Tables
  const filteredDesks = useMemo(() => {
    return desks.filter((desk) => {
      const session = sessions.find((s) => s.deskId === desk.id);
      const matchesZone = selectedZone === 'All' || desk.zone === selectedZone;

      let matchesStatus = true;
      if (filterStatus === 'Available') matchesStatus = !session;
      if (filterStatus === 'Occupied') matchesStatus = !!session;
      if (filterStatus === 'Combo') matchesStatus = !!session?.hasWifiCombo;

      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        desk.code.toLowerCase().includes(q) ||
        desk.name.toLowerCase().includes(q) ||
        desk.type.toLowerCase().includes(q) ||
        desk.zone.toLowerCase().includes(q);

      return matchesZone && matchesStatus && matchesSearch;
    });
  }, [desks, sessions, selectedZone, filterStatus, searchQuery]);

  const totalTables = desks.length;
  const occupiedCount = sessions.length;
  const occupancyRate = totalTables > 0 ? Math.round((occupiedCount / totalTables) * 100) : 0;
  const comboCount = sessions.filter((s) => s.hasWifiCombo).length;

  // Calculate live accrued totals
  const totalAccruedRevenue = useMemo(() => {
    return sessions.reduce((sum, s) => {
      const desk = desks.find((d) => d.id === s.deskId);
      const rate = s.hourlyRate || desk?.rate || 100;
      const diffMs = Math.max(0, currentTime - s.startTime);
      const mins = Math.floor(diffMs / 60000);
      const totalHours = Math.max(0.25, Math.ceil((mins / 60) * 4) / 4);
      let sub = totalHours * rate + (s.hasWifiCombo ? 50 : 0);
      if (s.hasWifiCombo) {
        sub = sub * 0.85; // 15% discount
      }
      return sum + sub;
    }, 0);
  }, [sessions, desks, currentTime]);

  const calculateDuration = (startTime: number) => {
    const diffMs = Math.max(0, currentTime - startTime);
    const mins = Math.floor(diffMs / 60000);
    const hrs = Math.floor(mins / 60);
    const remMins = mins % 60;
    const totalHoursFraction = Math.max(0.25, Math.ceil((mins / 60) * 4) / 4); // rounded to 15m
    return { hrs, remMins, totalHoursFraction, totalMinutes: mins };
  };

  const handleCopyWifi = (code: string) => {
    navigator.clipboard?.writeText(code);
    setCopiedWifiCode(code);
    notify(`Copied WiFi Passcode: ${code}`, 'info');
    setTimeout(() => setCopiedWifiCode(null), 2500);
  };

  const handleCheckoutConfirm = (
    paymentMethod: 'Cash' | 'Credit Card' | 'InstaPay / Wallet' | 'Member Tab'
  ) => {
    if (!checkoutSessionData) return;
    const { session, desk } = checkoutSessionData;
    const order = onEndSession(session.id, paymentMethod);
    setCheckoutSessionData(null);
    notify(
      `Closed session on ${desk.code} (${desk.name}) — Charged ${formatCurrency(order.total)} via ${paymentMethod}`,
      'success'
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: 14 Unique Numbered Tables & 100 EGP/hr Rate + 15% Combo Overview */}
      <div className="bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 text-white rounded-3xl p-6 border border-zinc-800 shadow-xl relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="px-3 py-1 rounded-full bg-emerald-950 border border-emerald-500/40 text-emerald-400 text-[11px] font-bold tracking-wide uppercase flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                {lang === 'ar' ? 'إدارة 14 طاولة عمل مرقمة' : '14 Unique Numbered Tables'}
              </span>
              <span className="px-3 py-1 rounded-full bg-amber-950 border border-amber-500/40 text-amber-300 text-[11px] font-black tracking-wide uppercase flex items-center gap-1.5">
                <Flame size={13} className="text-amber-400" />
                {lang === 'ar' ? 'سعر موحد: 100 ج.م/ساعة' : '100 EGP / Hour Combined Rate'}
              </span>
              <span className="px-3 py-1 rounded-full bg-amber-400/15 border border-amber-400/40 text-amber-200 text-[11px] font-black tracking-wide uppercase">
                ⚡ {lang === 'ar' ? 'خصم 15% كومبو الواي فاي' : '15% WiFi/Hourly Combo Discount'}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              {lang === 'ar' ? 'شبكة مساحات العمل الحية' : 'Coworking Floor Management'}
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl leading-relaxed">
              {lang === 'ar'
                ? 'متابعة لحظية لـ 14 طاولة عمل مستقلة (T-01 إلى T-14) بسعر 100 ج.م/ساعة مع نظام قسائم الواي فاي 5GB وخصم 15% الفوري على باقات الكومبو.'
                : 'Real-time monitoring across 14 dedicated numbered tables (T-01 to T-14) at 100 EGP/hr with high-speed 5GB WiFi cards and automatic 15% combo discounts.'}
            </p>
          </div>

          {/* Metric Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-zinc-800/80 border border-zinc-700/80 rounded-2xl p-3.5 flex flex-col justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                {lang === 'ar' ? 'إجمالي الطاولات' : 'Total Tables'}
              </span>
              <div className="text-xl font-mono font-black text-white mt-1">
                14 <span className="text-xs font-sans text-zinc-400 font-normal">T-01 to T-14</span>
              </div>
            </div>

            <div className="bg-zinc-800/80 border border-zinc-700/80 rounded-2xl p-3.5 flex flex-col justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                {lang === 'ar' ? 'نسبة الإشغال' : 'Occupancy Rate'}
              </span>
              <div className="text-xl font-mono font-black text-emerald-400 mt-1">
                {occupancyRate}%
                <span className="text-xs text-zinc-400 font-normal ms-1">
                  ({occupiedCount}/14)
                </span>
              </div>
            </div>

            <div className="bg-zinc-800/80 border border-amber-500/30 rounded-2xl p-3.5 flex flex-col justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                {lang === 'ar' ? 'جلسات كومبو (15% خصم)' : '15% Combos Active'}
              </span>
              <div className="text-xl font-mono font-black text-amber-300 mt-1 flex items-center gap-1">
                <Zap size={16} className="text-amber-400 fill-amber-400" />
                {comboCount}
              </div>
            </div>

            <div className="bg-zinc-800/80 border border-zinc-700/80 rounded-2xl p-3.5 flex flex-col justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                {lang === 'ar' ? 'الإيراد المكتسب الحي' : 'Live Accrued'}
              </span>
              <div className="text-xl font-mono font-black text-white mt-1">
                {formatCurrency(totalAccruedRevenue)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-zinc-200 shadow-2xs">
        {/* Search */}
        <div className="relative flex-1 max-w-xs">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={lang === 'ar' ? 'بحث برقم الطاولة (مثال T-04)...' : 'Search table (e.g. T-04, Booth)...'}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-zinc-200 bg-zinc-50 focus:bg-white focus:outline-none focus:border-emerald-700 font-medium"
          />
        </div>

        {/* Zone Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {zones.map((zone) => {
            const isSelected = selectedZone === zone;
            return (
              <button
                key={zone}
                onClick={() => setSelectedZone(zone)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition border cursor-pointer ${
                  isSelected
                    ? 'bg-zinc-900 border-zinc-900 text-white shadow-xs'
                    : 'bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50'
                }`}
              >
                {zone}
              </button>
            );
          })}
        </div>

        {/* Status toggle */}
        <div className="flex items-center gap-1 bg-zinc-100 p-1 rounded-xl border border-zinc-200 shrink-0 self-start md:self-auto">
          {[
            { id: 'All', label: `All (${totalTables})` },
            { id: 'Available', label: `Available (${totalTables - occupiedCount})` },
            { id: 'Occupied', label: `Occupied (${occupiedCount})` },
            { id: 'Combo', label: `15% Combo (${comboCount})` },
          ].map((st) => (
            <button
              key={st.id}
              onClick={() => setFilterStatus(st.id as any)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                filterStatus === st.id
                  ? 'bg-white text-zinc-950 shadow-xs'
                  : 'text-zinc-500 hover:text-zinc-900'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>

      {/* Desks Grid: 14 Unique Numbered Tables */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredDesks.map((desk) => {
          const session = sessions.find((s) => s.deskId === desk.id);
          const isOccupied = !!session;
          const customer = isOccupied
            ? customers.find((c) => c.id === session.customerId)
            : null;

          const duration = isOccupied ? calculateDuration(session.startTime) : null;
          const hourlyRate = session?.hourlyRate || desk.rate || 100;
          
          // Accrued calculation
          const tableAccrued = duration ? duration.totalHoursFraction * hourlyRate : 0;
          const wifiAccrued = session?.hasWifiCombo ? (session.wifiCardPrice || 50) : 0;
          const rawAccruedSubtotal = tableAccrued + wifiAccrued;
          const comboDiscountAmount = session?.hasWifiCombo ? rawAccruedSubtotal * 0.15 : 0;
          const currentAccruedNet = rawAccruedSubtotal - comboDiscountAmount;
          const currentAccruedWithTax = currentAccruedNet * 1.14;

          return (
            <div
              key={desk.id}
              className={`bg-white border rounded-3xl p-5 transition-all flex flex-col justify-between space-y-4 shadow-2xs relative ${
                isOccupied
                  ? session?.hasWifiCombo
                    ? 'border-amber-400 ring-2 ring-amber-400/30 bg-gradient-to-b from-amber-50/20 to-white'
                    : 'border-emerald-300 ring-2 ring-emerald-400/20 bg-gradient-to-b from-emerald-50/15 to-white'
                  : 'border-zinc-200 hover:border-zinc-300'
              }`}
            >
              <div>
                {/* Header: Table Code (T-01 .. T-14), Zone, Status */}
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-black px-2.5 py-1 rounded-xl bg-zinc-900 text-white shadow-xs">
                        {desk.code}
                      </span>
                      <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">
                        {desk.zone}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-zinc-950 mt-1">{desk.name}</h4>
                    <p className="text-[11px] text-zinc-500">{desk.type}</p>
                  </div>

                  {/* Status pill */}
                  <div className="flex flex-col items-end gap-1">
                    <span
                      className={`px-2.5 py-1 text-[10px] font-black rounded-full uppercase tracking-wider ${
                        isOccupied
                          ? session?.hasWifiCombo
                            ? 'bg-amber-100 text-amber-950 border border-amber-300'
                            : 'bg-emerald-100 text-emerald-950 border border-emerald-300'
                          : 'bg-zinc-100 text-zinc-600 border border-zinc-200'
                      }`}
                    >
                      {isOccupied
                        ? session?.hasWifiCombo
                          ? '⚡ 15% Combo'
                          : 'Occupied'
                        : 'Available'}
                    </span>
                    <span className="text-[10px] font-bold text-zinc-400">
                      {desk.capacity} {lang === 'ar' ? 'مقاعد' : 'seats'}
                    </span>
                  </div>
                </div>

                {/* Rate and Features */}
                <div className="mt-3.5 pt-3 border-t border-zinc-100 space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-500">{lang === 'ar' ? 'السعر بالساعة' : 'Hourly Rate'}</span>
                    <span className="font-mono font-bold text-zinc-950 bg-zinc-100 px-2 py-0.5 rounded-md">
                      {formatCurrency(hourlyRate)}/hr
                    </span>
                  </div>

                  {/* Feature tags */}
                  <div className="flex flex-wrap gap-1 pt-1">
                    {desk.features.slice(0, 3).map((f, i) => (
                      <span
                        key={i}
                        className="px-1.5 py-0.5 text-[9px] rounded bg-zinc-50 text-zinc-500 border border-zinc-200 font-medium"
                      >
                        {f}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Live Occupied Session Box */}
                {isOccupied && duration && (
                  <div
                    className={`mt-3.5 p-3.5 rounded-2xl border space-y-2.5 text-xs ${
                      session.hasWifiCombo
                        ? 'bg-amber-50/80 border-amber-200/90'
                        : 'bg-emerald-50/60 border-emerald-200/80'
                    }`}
                  >
                    {/* Time & Accrued */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 font-bold text-zinc-900">
                        <Clock
                          size={14}
                          className={`animate-pulse ${
                            session.hasWifiCombo ? 'text-amber-600' : 'text-emerald-700'
                          }`}
                        />
                        <span>
                          {duration.hrs}h {duration.remMins}m
                        </span>
                        <span className="text-[10px] text-zinc-500 font-normal">
                          ({duration.totalHoursFraction.toFixed(2)}h)
                        </span>
                      </div>

                      <div className="text-right">
                        <div className="font-mono font-black text-sm text-zinc-950">
                          {formatCurrency(currentAccruedNet)}
                        </div>
                        <span className="text-[9px] text-zinc-400 block font-mono">
                          +{formatCurrency(currentAccruedWithTax - currentAccruedNet)} VAT
                        </span>
                      </div>
                    </div>

                    {/* Guest info */}
                    <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-zinc-200/60">
                      <div className="flex items-center gap-1.5 truncate">
                        <User size={12} className="text-zinc-400 shrink-0" />
                        <span className="font-bold text-zinc-900 truncate">
                          {customer?.name || 'Walk-in Guest'}
                        </span>
                      </div>
                      <span className="text-[10px] font-semibold text-emerald-800 shrink-0">
                        {customer?.tier || 'Regular'}
                      </span>
                    </div>

                    {/* WiFi Combo details if active */}
                    {session.hasWifiCombo && (
                      <div className="bg-white/90 p-2 rounded-xl border border-amber-300/80 space-y-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1 text-[10px] font-black text-amber-900 uppercase tracking-wider">
                            <Zap size={12} className="text-amber-600" />
                            <span>15% WiFi Combo Active</span>
                          </div>
                          <span className="text-[9px] font-bold text-amber-900 bg-amber-100 px-1.5 py-0.2 rounded font-mono">
                            -15% Saved
                          </span>
                        </div>

                        {session.wifiCardCode && (
                          <div className="flex items-center justify-between text-[11px] pt-0.5">
                            <span className="font-mono font-bold text-zinc-700 text-[10px]">
                              {session.wifiCardCode}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleCopyWifi(session.wifiCardCode!)}
                              className="text-[10px] font-semibold text-zinc-500 hover:text-zinc-900 flex items-center gap-0.5 cursor-pointer"
                            >
                              {copiedWifiCode === session.wifiCardCode ? (
                                <Check size={11} className="text-emerald-700" />
                              ) : (
                                <Copy size={11} />
                              )}
                              <span>
                                {copiedWifiCode === session.wifiCardCode ? 'Copied' : 'Copy'}
                              </span>
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* If NOT combo, allow instant 15% WiFi Combo upgrade */}
                    {!session.hasWifiCombo && onToggleWifiCombo && (
                      <button
                        type="button"
                        onClick={() => onToggleWifiCombo(session.id)}
                        className="w-full py-1.5 px-2 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-950 font-bold text-[10px] transition flex items-center justify-center gap-1 border border-amber-300 cursor-pointer"
                      >
                        <Zap size={12} className="text-amber-700" />
                        <span>{lang === 'ar' ? '+ تفعيل كومبو الواي فاي (خصم 15%)' : '+ Add 5GB WiFi (15% Off)'}</span>
                      </button>
                    )}

                    {session.notes && (
                      <p className="text-[10px] text-zinc-500 italic truncate pt-0.5">
                        "{session.notes}"
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-2">
                {isOccupied ? (
                  <button
                    type="button"
                    onClick={() => setCheckoutSessionData({ desk, session })}
                    className="w-full py-2.5 px-3 rounded-2xl bg-rose-700 hover:bg-rose-800 text-white font-bold text-xs transition flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                  >
                    <Receipt size={14} />
                    <span>
                      {lang === 'ar' ? 'إنهاء وحساب' : 'Check Out & Bill'}{' '}
                      {formatCurrency(currentAccruedWithTax)}
                    </span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setActiveModalDesk(desk)}
                    className="w-full py-2.5 px-3 rounded-2xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs transition flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                  >
                    <Play size={13} fill="currentColor" />
                    <span>{lang === 'ar' ? 'تسجيل دخول طاولة' : 'Check-in Member'}</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Start Session Check-in Modal */}
      {activeModalDesk && (
        <StartSessionModal
          desk={activeModalDesk}
          customers={customers}
          menu={menu}
          onClose={() => setActiveModalDesk(null)}
          onStart={onStartSession}
          onOpenNewCustomerModal={onOpenNewCustomerModal}
        />
      )}

      {/* End Session Checkout Settlement Modal */}
      {checkoutSessionData && (
        <CheckoutSessionModal
          desk={checkoutSessionData.desk}
          session={checkoutSessionData.session}
          customer={customers.find((c) => c.id === checkoutSessionData.session.customerId)}
          menu={menu}
          onClose={() => setCheckoutSessionData(null)}
          onConfirmCheckout={handleCheckoutConfirm}
          onToggleWifiCombo={(sessionId) => {
            if (onToggleWifiCombo) {
              onToggleWifiCombo(sessionId);
              // Update local state if active
              setCheckoutSessionData((prev) =>
                prev
                  ? {
                      ...prev,
                      session: {
                        ...prev.session,
                        hasWifiCombo: !prev.session.hasWifiCombo,
                        wifiCardPrice: 50,
                        wifiCardCode:
                          prev.session.wifiCardCode ||
                          `WT-5G-${prev.desk.code}-${Math.floor(1000 + Math.random() * 9000)}`,
                      },
                    }
                  : null
              );
            }
          }}
        />
      )}
    </div>
  );
};
