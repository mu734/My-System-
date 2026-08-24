import React, { useState, useId } from 'react';
import {
  X,
  Play,
  Clock,
  User,
  Check,
  Plus,
  Wifi,
  Sparkles,
  Zap,
  Percent,
  CreditCard,
  Banknote,
  Smartphone,
  ShieldCheck,
  Receipt,
} from 'lucide-react';
import { Desk, Customer, MenuItem, CartItem, DeskSession } from '../../types';
import { useLanguage } from '../../i18n/LanguageContext';

interface StartSessionModalProps {
  desk: Desk;
  customers: Customer[];
  menu: MenuItem[];
  onClose: () => void;
  onStart: (
    deskId: string,
    customerId: string,
    options?: { hasWifiCombo?: boolean; wifiCardCode?: string; notes?: string }
  ) => void;
  onOpenNewCustomerModal: () => void;
}

export const StartSessionModal: React.FC<StartSessionModalProps> = ({
  desk,
  customers,
  onClose,
  onStart,
  onOpenNewCustomerModal,
}) => {
  const { lang, t, formatCurrency } = useLanguage();
  const [selectedCustomerId, setSelectedCustomerId] = useState(customers[0]?.id || 'c-walkin');
  const [sessionNotes, setSessionNotes] = useState('');
  const [hasWifiCombo, setHasWifiCombo] = useState<boolean>(true); // default to 15% Combo promotion
  const [generatedWifiCode] = useState<string>(
    `WT-5G-${desk.code}-${Math.floor(1000 + Math.random() * 9000)}`
  );

  const customer = customers.find((c) => c.id === selectedCustomerId);

  // Rate calculation preview (100 EGP/hr rate)
  const hourlyRate = desk.rate || 100;
  const wifiPrice = 50;
  const comboExample1HrSubtotal = hourlyRate + (hasWifiCombo ? wifiPrice : 0);
  const comboExample1HrDiscount = hasWifiCombo ? comboExample1HrSubtotal * 0.15 : 0;
  const comboExample1HrTaxable = comboExample1HrSubtotal - comboExample1HrDiscount;
  const comboExample1HrTax = comboExample1HrTaxable * 0.14;
  const comboExample1HrTotal = comboExample1HrTaxable + comboExample1HrTax;

  const handleConfirm = () => {
    onStart(desk.id, selectedCustomerId, {
      hasWifiCombo,
      wifiCardCode: hasWifiCombo ? generatedWifiCode : undefined,
      notes: sessionNotes.trim() || undefined,
    });
    onClose();
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/70 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-zinc-200 animate-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-zinc-100 bg-zinc-50/80">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-2xl bg-emerald-700 text-white font-mono font-bold flex items-center justify-center text-sm shadow-xs">
              {desk.code}
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded-md">
                  {lang === 'ar' ? 'بدء جلسة عمل' : 'Check-in Table'}
                </span>
                <span className="text-xs text-zinc-500 font-medium">· {desk.zone}</span>
              </div>
              <h3 className="text-base font-bold text-zinc-950 mt-0.5">{desk.name}</h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-zinc-700 hover:bg-zinc-200 transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 space-y-4 overflow-y-auto text-xs text-zinc-700">
          {/* Table Rate Badge Card */}
          <div className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                {lang === 'ar' ? 'سعر الطاولة الفردية' : 'Table Standard Rate'}
              </span>
              <div className="text-sm font-bold text-zinc-900">{desk.type}</div>
              <div className="flex gap-1.5 pt-1">
                {desk.features.slice(0, 3).map((f, i) => (
                  <span
                    key={i}
                    className="text-[9px] px-1.5 py-0.5 rounded bg-white border border-zinc-200 text-zinc-500 font-medium"
                  >
                    {f}
                  </span>
                ))}
              </div>
            </div>
            <div className="text-right">
              <div className="text-xl font-mono font-black text-emerald-900">
                {formatCurrency(hourlyRate)}
              </div>
              <span className="text-[10px] font-bold text-zinc-500">{lang === 'ar' ? 'لكل ساعة' : '/ hour'}</span>
            </div>
          </div>

          {/* Customer / Member select */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-zinc-900 flex items-center justify-between">
              <span>{lang === 'ar' ? 'تعيين العضو / العميل' : 'Assign Member / Guest'}</span>
              {customer && customer.id !== 'c-walkin' && (
                <span className="text-[10px] font-semibold text-emerald-700 font-mono">
                  {customer.tier} · {customer.points} pts
                </span>
              )}
            </label>
            <div className="flex gap-2">
              <select
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200 bg-white text-zinc-900 font-medium focus:outline-none focus:border-emerald-700 focus:ring-1 focus:ring-emerald-700/20"
              >
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} — {c.tier} ({c.points} {lang === 'ar' ? 'نقطة' : 'pts'})
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={onOpenNewCustomerModal}
                title="Create New Member"
                className="px-3 py-2 rounded-xl border border-zinc-200 hover:bg-zinc-100 text-zinc-700 shrink-0 font-semibold flex items-center gap-1 cursor-pointer"
              >
                <Plus size={14} />
                <span className="text-[11px] hidden sm:inline">{lang === 'ar' ? 'جديد' : 'New'}</span>
              </button>
            </div>
          </div>

          {/* 15% WiFi + Hourly Table Combo Promotion Box */}
          <div
            onClick={() => setHasWifiCombo(!hasWifiCombo)}
            className={`p-4 rounded-2xl border transition-all cursor-pointer select-none space-y-3 ${
              hasWifiCombo
                ? 'bg-amber-50/80 border-amber-300 ring-2 ring-amber-400/40 shadow-xs'
                : 'bg-white border-zinc-200 hover:border-zinc-300'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    hasWifiCombo
                      ? 'bg-amber-500 text-white shadow-xs'
                      : 'bg-zinc-100 text-zinc-400'
                  }`}
                >
                  <Wifi size={18} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-zinc-950">
                      {lang === 'ar'
                        ? 'عرض الكومبو: بطاقة واي فاي 5GB + خصم 15%'
                        : 'WiFi & Table Combo Package (15% Discount)'}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-amber-200/90 text-amber-950 border border-amber-300">
                      ⚡ 15% OFF
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-600 mt-1 leading-relaxed">
                    {lang === 'ar'
                      ? 'أضف كارت واي فاي 5GB فائق السرعة (50 ج.م) واحصل فوراً على خصم 15% على إجمالي فاتورة الجلسة!'
                      : 'Bundle a 5GB high-speed WiFi Card Voucher (50 EGP) and automatically unlock a 15% instant discount across the whole table session!'}
                  </p>
                </div>
              </div>

              {/* Checkbox circle */}
              <div
                className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                  hasWifiCombo
                    ? 'bg-amber-600 border-amber-600 text-white'
                    : 'border-zinc-300 bg-white'
                }`}
              >
                {hasWifiCombo && <Check size={12} strokeWidth={3} />}
              </div>
            </div>

            {/* If Combo is selected, show Voucher code & calculation preview */}
            {hasWifiCombo && (
              <div className="pt-3 border-t border-amber-200/70 space-y-2.5">
                <div className="flex items-center justify-between bg-white/90 p-2.5 rounded-xl border border-amber-200">
                  <div className="flex items-center gap-2">
                    <Zap size={14} className="text-amber-600" />
                    <div>
                      <span className="text-[10px] uppercase font-bold text-zinc-400 block">
                        {lang === 'ar' ? 'كود قسيمة الواي فاي 5GB' : '5GB WiFi Voucher Passcode'}
                      </span>
                      <span className="font-mono font-bold text-xs text-zinc-900">
                        {generatedWifiCode}
                      </span>
                    </div>
                  </div>
                  <span className="font-mono font-bold text-emerald-800 text-xs bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200">
                    +50 EGP
                  </span>
                </div>

                {/* Calculation breakdown preview */}
                <div className="bg-amber-100/50 p-2.5 rounded-xl text-[11px] space-y-1 font-mono text-zinc-800">
                  <div className="flex justify-between text-zinc-600">
                    <span>1 Hr Table ({formatCurrency(hourlyRate)}) + 5GB WiFi ({formatCurrency(wifiPrice)})</span>
                    <span>{formatCurrency(hourlyRate + wifiPrice)}</span>
                  </div>
                  <div className="flex justify-between text-amber-900 font-bold">
                    <span>⚡ 15% Combo Discount Savings</span>
                    <span>-{formatCurrency(comboExample1HrDiscount)}</span>
                  </div>
                  <div className="flex justify-between text-emerald-900 font-bold border-t border-amber-200/80 pt-1">
                    <span>Net 1st Hour Total (+ 14% VAT)</span>
                    <span>{formatCurrency(comboExample1HrTotal)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Session Notes */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-zinc-900">
              {lang === 'ar' ? 'ملاحظات الطاولة (اختياري)' : 'Table Notes (Optional)'}
            </label>
            <input
              type="text"
              value={sessionNotes}
              onChange={(e) => setSessionNotes(e.target.value)}
              placeholder={
                lang === 'ar'
                  ? 'مثال: اجتماع عمل، طلب شاحن إضافي، كرسي إضافي...'
                  : 'e.g. Needs Type-C charger, quiet interview call at 3 PM...'
              }
              className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200 bg-zinc-50 focus:bg-white focus:outline-none focus:border-emerald-700 focus:ring-1 focus:ring-emerald-700/20"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-zinc-50 border-t border-zinc-200 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-zinc-600 hover:bg-zinc-200 transition cursor-pointer"
          >
            {lang === 'ar' ? 'إلغاء' : 'Cancel'}
          </button>

          <button
            type="button"
            onClick={handleConfirm}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs transition flex items-center gap-2 shadow-xs cursor-pointer ${
              hasWifiCombo
                ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-600/20'
                : 'bg-emerald-800 hover:bg-emerald-900 text-white shadow-emerald-800/20'
            }`}
          >
            <Play size={14} fill="currentColor" />
            <span>
              {hasWifiCombo
                ? lang === 'ar'
                  ? 'بدء جلسة كومبو (خصم 15%)'
                  : 'Start 15% Combo Session'
                : lang === 'ar'
                ? 'بدء الجلسة القياسية (100 ج.م/س)'
                : 'Start Standard Session (100 EGP/hr)'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
