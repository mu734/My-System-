import React, { useState } from 'react';
import {
  X,
  Clock,
  User,
  Wifi,
  Sparkles,
  CreditCard,
  Banknote,
  Smartphone,
  Wallet,
  Receipt,
  CheckCircle2,
  Percent,
  Plus,
  Coffee,
} from 'lucide-react';
import { Desk, DeskSession, Customer, MenuItem, Order, CartItem } from '../../types';
import { useLanguage } from '../../i18n/LanguageContext';

interface CheckoutSessionModalProps {
  desk: Desk;
  session: DeskSession;
  customer?: Customer;
  menu: MenuItem[];
  onClose: () => void;
  onConfirmCheckout: (paymentMethod: 'Cash' | 'Credit Card' | 'InstaPay / Wallet' | 'Member Tab') => void;
  onToggleWifiCombo: (sessionId: string) => void;
}

export const CheckoutSessionModal: React.FC<CheckoutSessionModalProps> = ({
  desk,
  session,
  customer,
  menu,
  onClose,
  onConfirmCheckout,
  onToggleWifiCombo,
}) => {
  const { lang, t, formatCurrency } = useLanguage();
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Credit Card' | 'InstaPay / Wallet' | 'Member Tab'>('Credit Card');

  // Compute live duration
  const diffMs = Math.max(0, Date.now() - session.startTime);
  const mins = Math.floor(diffMs / 60000);
  const hrs = Math.floor(mins / 60);
  const remMins = mins % 60;
  const totalHours = Math.max(0.25, Math.ceil((mins / 60) * 4) / 4); // rounded to 15m intervals

  const hourlyRate = session.hourlyRate || desk.rate || 100;
  const tableCharge = totalHours * hourlyRate;
  const wifiCharge = session.hasWifiCombo ? (session.wifiCardPrice || 50) : 0;

  // Add-on table orders (if any food/drinks ordered during session)
  const ordersSubtotal = (session.tableOrders || []).reduce((sum, it) => {
    const addons = it.selectedAddons.reduce((s, a) => s + a.price, 0);
    return sum + (it.unitPrice + addons) * it.qty;
  }, 0);

  const subtotalBeforeDiscount = tableCharge + wifiCharge + ordersSubtotal;
  
  // 15% Combo discount applies to the combined table & wifi combo bill
  const comboDiscount = session.hasWifiCombo
    ? subtotalBeforeDiscount * ((session.comboDiscountPercent || 15) / 100)
    : 0;

  const taxableAmount = Math.max(0, subtotalBeforeDiscount - comboDiscount);
  const tax = taxableAmount * 0.14; // 14% Egyptian VAT
  const total = taxableAmount + tax;
  const pointsEarned = Math.floor(total / 100);

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/75 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-zinc-200 animate-in zoom-in-95 duration-150 flex flex-col max-h-[92vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-zinc-100 bg-zinc-50/90">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-2xl bg-zinc-900 text-white font-mono font-bold flex items-center justify-center text-sm shadow-xs">
              {desk.code}
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-800 bg-rose-100 px-2 py-0.5 rounded-md">
                  {lang === 'ar' ? 'إنهاء الجلسة والدفع' : 'Checkout & Settlement'}
                </span>
                {session.hasWifiCombo && (
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-900 bg-amber-100 px-2 py-0.5 rounded-md border border-amber-300">
                    ⚡ 15% Combo
                  </span>
                )}
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
          {/* Guest & Time Card */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-0.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                {lang === 'ar' ? 'العميل / العضو' : 'Customer / Member'}
              </span>
              <div className="font-bold text-zinc-900 truncate">
                {customer?.name || 'Walk-in Guest'}
              </div>
              <span className="text-[10px] text-emerald-800 font-semibold block">
                {customer?.tier || 'Regular'} · {customer?.points || 0} pts
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-0.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                {lang === 'ar' ? 'مدة الجلسة' : 'Duration Billed'}
              </span>
              <div className="font-mono font-bold text-zinc-900 flex items-center gap-1">
                <Clock size={14} className="text-zinc-500" />
                <span>
                  {hrs}h {remMins}m ({totalHours.toFixed(2)} hrs)
                </span>
              </div>
              <span className="text-[10px] text-zinc-500 block">
                @ {formatCurrency(hourlyRate)}/hr
              </span>
            </div>
          </div>

          {/* Itemized Receipt Ledger */}
          <div className="rounded-2xl border border-zinc-200 overflow-hidden">
            <div className="bg-zinc-100/80 px-3.5 py-2 text-[10px] font-bold uppercase tracking-wider text-zinc-500 border-b border-zinc-200 flex justify-between">
              <span>{lang === 'ar' ? 'تفاصيل بنود الجلسة' : 'Session Line Items'}</span>
              <span>{lang === 'ar' ? 'المبلغ' : 'Amount'}</span>
            </div>

            <div className="divide-y divide-zinc-100 p-3 space-y-2 text-xs">
              {/* Table Hourly Line */}
              <div className="flex items-center justify-between pt-1">
                <div>
                  <div className="font-bold text-zinc-900">
                    {desk.code} · {desk.type}
                  </div>
                  <span className="text-[11px] text-zinc-500 font-mono">
                    {totalHours.toFixed(2)} hrs × {formatCurrency(hourlyRate)}/hr
                  </span>
                </div>
                <div className="font-mono font-bold text-zinc-900">
                  {formatCurrency(tableCharge)}
                </div>
              </div>

              {/* 5GB WiFi Card line if combo */}
              {session.hasWifiCombo ? (
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-2">
                    <Wifi size={14} className="text-amber-600 shrink-0" />
                    <div>
                      <div className="font-bold text-amber-950 flex items-center gap-1.5">
                        <span>5GB High-Speed WiFi Voucher</span>
                        <span className="text-[9px] bg-amber-200 text-amber-950 px-1.5 py-0.2 rounded font-black uppercase">
                          Combo
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-zinc-500">
                        Code: {session.wifiCardCode || 'WT-5GB-COWORK'}
                      </span>
                    </div>
                  </div>
                  <div className="font-mono font-bold text-zinc-900">
                    {formatCurrency(wifiCharge)}
                  </div>
                </div>
              ) : (
                <div className="pt-2 flex items-center justify-between bg-amber-50/60 p-2 rounded-xl border border-dashed border-amber-300">
                  <div className="text-[11px] text-amber-900">
                    {lang === 'ar'
                      ? 'هل يرغب العميل في إضافة بطاقة WiFi 5GB وتفعيل خصم 15%؟'
                      : 'Add 5GB WiFi voucher and activate the 15% Combo Discount?'}
                  </div>
                  <button
                    type="button"
                    onClick={() => onToggleWifiCombo(session.id)}
                    className="px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-[10px] transition shrink-0 cursor-pointer"
                  >
                    + Add WiFi (15% Off)
                  </button>
                </div>
              )}

              {/* Table Orders (if any) */}
              {session.tableOrders && session.tableOrders.length > 0 && (
                <div className="pt-2 space-y-1">
                  <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                    {lang === 'ar' ? 'طلبات الكافيه على الطاولة' : 'Café & Kitchen Table Orders'}
                  </div>
                  {session.tableOrders.map((ord, i) => (
                    <div key={i} className="flex justify-between text-[11px] text-zinc-600">
                      <span>
                        {ord.qty}x {ord.name} {ord.size ? `(${ord.size})` : ''}
                      </span>
                      <span className="font-mono">{formatCurrency(ord.unitPrice * ord.qty)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Financial Summary & 15% Discount Banner */}
            <div className="bg-zinc-50 p-3.5 border-t border-zinc-200 space-y-1.5 text-xs font-mono">
              <div className="flex justify-between text-zinc-600">
                <span>{lang === 'ar' ? 'المجموع الفرعي' : 'Subtotal'}</span>
                <span>{formatCurrency(subtotalBeforeDiscount)}</span>
              </div>

              {session.hasWifiCombo && comboDiscount > 0 && (
                <div className="flex justify-between text-amber-900 font-bold bg-amber-100/80 px-2 py-1 rounded-lg border border-amber-300/80">
                  <span className="flex items-center gap-1">
                    <Sparkles size={13} className="text-amber-700" />
                    <span>{lang === 'ar' ? 'خصم كومبو مساحة العمل (15%)' : 'WiFi/Hourly Combo Discount (15%)'}</span>
                  </span>
                  <span>-{formatCurrency(comboDiscount)}</span>
                </div>
              )}

              <div className="flex justify-between text-zinc-600">
                <span>{lang === 'ar' ? 'ضريبة القيمة المضافة (14%)' : 'VAT Tax (14%)'}</span>
                <span>{formatCurrency(tax)}</span>
              </div>

              <div className="flex justify-between text-base font-black text-zinc-950 pt-2 border-t border-zinc-200">
                <span>{lang === 'ar' ? 'المجموع النهائي' : 'Total Due'}</span>
                <span className="text-emerald-950 font-mono">{formatCurrency(total)}</span>
              </div>

              <div className="text-[10px] text-emerald-800 font-sans font-semibold pt-1 flex items-center justify-between">
                <span>Loyalty Points to Earn:</span>
                <span className="font-bold font-mono">+{pointsEarned} pts</span>
              </div>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-zinc-900 block">
              {lang === 'ar' ? 'طريقة الدفع' : 'Payment Method'}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'Credit Card', label: 'Credit Card', icon: CreditCard },
                { id: 'Cash', label: 'Cash', icon: Banknote },
                { id: 'InstaPay / Wallet', label: 'InstaPay', icon: Smartphone },
                { id: 'Member Tab', label: 'Member Tab', icon: Wallet },
              ].map((m) => {
                const Icon = m.icon;
                const isSelected = paymentMethod === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setPaymentMethod(m.id as any)}
                    className={`p-2.5 rounded-xl border font-bold text-xs flex flex-col items-center gap-1.5 transition cursor-pointer ${
                      isSelected
                        ? 'bg-zinc-900 border-zinc-900 text-white shadow-xs'
                        : 'bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50'
                    }`}
                  >
                    <Icon size={16} />
                    <span className="text-[10px] truncate">{m.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-zinc-50 border-t border-zinc-200 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-zinc-600 hover:bg-zinc-200 transition cursor-pointer"
          >
            {lang === 'ar' ? 'رجوع' : 'Back'}
          </button>

          <button
            type="button"
            onClick={() => onConfirmCheckout(paymentMethod)}
            className="px-6 py-2.5 rounded-xl bg-rose-700 hover:bg-rose-800 text-white font-bold text-xs transition flex items-center gap-2 shadow-xs cursor-pointer"
          >
            <Receipt size={15} />
            <span>
              {lang === 'ar'
                ? `تحصيل ${formatCurrency(total)} وإنهاء الجلسة`
                : `Settle ${formatCurrency(total)} & Close Session`}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
