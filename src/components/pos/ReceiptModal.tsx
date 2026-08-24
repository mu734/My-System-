import React, { useState, useEffect } from 'react';
import {
  X,
  Printer,
  CheckCircle2,
  FileText,
  Receipt as ReceiptIcon,
  UserCheck,
  DollarSign,
  ChefHat,
  Coffee,
  Split,
  Type,
  Maximize2,
  Flame,
  CheckSquare,
  Square,
  Sparkles,
} from 'lucide-react';
import { Order, Customer, KitchenTicket } from '../../types';
import { WhiteTableLogo } from '../WhiteTableLogo';
import {
  getHardwareSettings,
  sendRawBytesToHardware,
  buildEscPosCustomerReceipt,
  buildEscPosKitchenTicket,
  buildEscPosBothTickets,
  kickCashDrawer,
  FontSizePreference,
} from '../../services/hardwareService';
import { useLanguage } from '../../i18n/LanguageContext';

export type ReceiptViewMode = 'customer' | 'kitchen' | 'both_split' | 'tax_invoice';

interface ReceiptModalProps {
  order: Order;
  customer?: Customer;
  kitchenTicket?: KitchenTicket;
  onClose: () => void;
  notify?: (titleOrMsg: string, messageOrType?: any, type?: any) => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  order,
  customer,
  kitchenTicket,
  onClose,
  notify,
}) => {
  const { lang, t, formatCurrency } = useLanguage();
  const hardwareSettings = getHardwareSettings();

  const [viewMode, setViewMode] = useState<ReceiptViewMode>('customer');
  const [fontSize, setFontSize] = useState<FontSizePreference>(hardwareSettings.fontSizePreference || 'large_obvious');
  const [isPrintingRaw, setIsPrintingRaw] = useState(false);
  const [isKicking, setIsKicking] = useState(false);
  const [checkedItems, setCheckedItems] = useState<Record<number, boolean>>({});

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const emitNotification = (
    titleOrMsg: string,
    messageOrType?: any,
    type?: 'success' | 'warning' | 'info' | 'error'
  ) => {
    if (!notify) return;
    if (type !== undefined) {
      notify(
        `${titleOrMsg}: ${messageOrType}`,
        type === 'warning' ? 'error' : (type as any)
      );
    } else if (
      messageOrType === 'success' ||
      messageOrType === 'error' ||
      messageOrType === 'info'
    ) {
      notify(titleOrMsg, messageOrType);
    } else if (messageOrType) {
      notify(`${titleOrMsg}: ${messageOrType}`, 'success');
    } else {
      notify(titleOrMsg);
    }
  };

  const toggleItemCheck = (idx: number) => {
    setCheckedItems((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  // Group items by station for the kitchen ticket
  const baristaCategories = ['espresso_bar', 'specialty_brews', 'signature_cold', 'tea_matcha', 'smoothies_wellness', 'coffee', 'drinks', 'beverages'];
  const drinkItems = order.items.filter((i) => baristaCategories.includes((i.category || '').toLowerCase()));
  const kitchenFoodItems = order.items.filter((i) => !baristaCategories.includes((i.category || '').toLowerCase()));

  const ticketOrderNum = order.id.slice(0, 8).toUpperCase();
  const destLocation = order.deskId
    ? `DESK / TABLE #${order.deskId.slice(0, 4)}`
    : order.source === 'table'
    ? 'DINE-IN TABLE'
    : 'POS WALK-IN';

  const isLarge = fontSize === 'large_obvious' || fontSize === 'extra_large';
  const isExtraLarge = fontSize === 'extra_large';

  // 1. Print Customer Receipt Only
  const handlePrintCustomer = async () => {
    if (hardwareSettings.printerType !== 'system') {
      setIsPrintingRaw(true);
      try {
        const rawBytes = buildEscPosCustomerReceipt(order, customer, hardwareSettings, { largeFont: isLarge });
        const res = await sendRawBytesToHardware(rawBytes, hardwareSettings);
        if (res.success) {
          emitNotification(
            lang === 'ar' ? 'تمت طباعة فاتورة العميل' : 'Customer Receipt Printed',
            res.message || 'Dispatched to Zywell 80 Thermal Printer.',
            'success'
          );
          return;
        } else {
          emitNotification(
            lang === 'ar' ? 'تنبيه الطابعة' : 'Printer Notice',
            res.message || 'Opening system print preview...',
            'info'
          );
        }
      } catch {
        // Fallback to CSS print
      } finally {
        setIsPrintingRaw(false);
      }
    }

    if (viewMode !== 'customer') {
      setViewMode('customer');
      requestAnimationFrame(() => {
        window.print();
      });
    } else {
      window.print();
    }
  };

  // 2. Print Kitchen Ticket Only
  const handlePrintKitchen = async () => {
    if (hardwareSettings.printerType !== 'system') {
      setIsPrintingRaw(true);
      try {
        const rawBytes = buildEscPosKitchenTicket(kitchenTicket || order, hardwareSettings, { largeFont: isLarge });
        const res = await sendRawBytesToHardware(rawBytes, hardwareSettings);
        if (res.success) {
          emitNotification(
            lang === 'ar' ? 'تم إرسال بون المطبخ للطابعة' : 'Kitchen KOT Dispatched',
            res.message || 'Dispatched KOT slip to line cooks/baristas.',
            'success'
          );
          return;
        } else {
          emitNotification(
            lang === 'ar' ? 'تنبيه الطابعة' : 'Printer Notice',
            res.message || 'Opening system print preview...',
            'info'
          );
        }
      } catch {
        // Fallback to CSS print
      } finally {
        setIsPrintingRaw(false);
      }
    }

    if (viewMode !== 'kitchen') {
      setViewMode('kitchen');
      requestAnimationFrame(() => {
        window.print();
      });
    } else {
      window.print();
    }
  };

  // 3. Print Both Separated (Customer Receipt -> Auto Cut -> Kitchen Ticket -> Auto Cut)
  const handlePrintBoth = async () => {
    if (hardwareSettings.printerType !== 'system') {
      setIsPrintingRaw(true);
      try {
        const rawBytes = buildEscPosBothTickets(order, customer, hardwareSettings, { largeFont: isLarge });
        const res = await sendRawBytesToHardware(rawBytes, hardwareSettings);
        if (res.success) {
          emitNotification(
            lang === 'ar' ? 'تمت طباعة الفاتورة وبون المطبخ مع القاطع الآلي' : 'Printed Both Slips (With Auto-Cut)',
            res.message || 'Customer invoice and kitchen ticket printed separately.',
            'success'
          );
          return;
        } else {
          emitNotification(
            lang === 'ar' ? 'تنبيه الطابعة' : 'Printer Notice',
            res.message || 'Opening system print preview...',
            'info'
          );
        }
      } catch {
        // Fallback to CSS print
      } finally {
        setIsPrintingRaw(false);
      }
    }

    if (viewMode !== 'both_split') {
      setViewMode('both_split');
      requestAnimationFrame(() => {
        window.print();
      });
    } else {
      window.print();
    }
  };

  // General print button handler depending on active tab
  const handleGeneralPrint = () => {
    if (hardwareSettings.printerType !== 'system') {
      if (viewMode === 'customer') handlePrintCustomer();
      else if (viewMode === 'kitchen') handlePrintKitchen();
      else if (viewMode === 'both_split') handlePrintBoth();
      else window.print();
    } else {
      window.print();
    }
  };

  const handleKickDrawer = async () => {
    setIsKicking(true);
    await kickCashDrawer(hardwareSettings);
    emitNotification(
      lang === 'ar' ? 'درج النقدية' : 'Cash Drawer',
      lang === 'ar' ? 'تم إرسال إشارة فتح الدرج بنجاح.' : 'Drawer kick pulse triggered.',
      'success'
    );
    setTimeout(() => setIsKicking(false), 800);
  };

  const pointsEarned = Math.floor(order.total / 100);
  const isRepeatCustomer = customer && customer.visits > 1;

  return (
    <div
      id="receipt-modal-backdrop"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs overflow-y-auto"
    >
      <div
        id="receipt-modal-container"
        onClick={(e) => e.stopPropagation()}
        className={`w-full ${
          viewMode === 'tax_invoice' || viewMode === 'both_split'
            ? 'max-w-4xl'
            : 'max-w-xl'
        } bg-white text-zinc-900 rounded-3xl shadow-2xl overflow-hidden border border-zinc-200 animate-in fade-in zoom-in-95 duration-150 transition-all flex flex-col my-auto max-h-[95vh]`}
      >
        {/* Top Header Actions & View Mode Selector (Hidden in Print) */}
        <div className="no-print p-4 bg-zinc-950 text-white border-b border-zinc-800 space-y-3">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            {/* Tab Selection */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                type="button"
                onClick={() => setViewMode('customer')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer ${
                  viewMode === 'customer'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                }`}
              >
                <ReceiptIcon size={14} />
                <span>{t.customerReceipt || 'Customer Receipt'}</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode('kitchen')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer ${
                  viewMode === 'kitchen'
                    ? 'bg-amber-600 text-white shadow-md'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                }`}
              >
                <ChefHat size={14} />
                <span>{t.kitchenReceipt || 'Kitchen Ticket (KOT)'}</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode('both_split')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer ${
                  viewMode === 'both_split'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                }`}
              >
                <Split size={14} />
                <span>{t.bothReceiptsSeparate || 'Both (Separate Slips)'}</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode('tax_invoice')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer ${
                  viewMode === 'tax_invoice'
                    ? 'bg-zinc-700 text-white shadow-md'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                }`}
              >
                <FileText size={14} />
                <span>{lang === 'ar' ? 'فاتورة A4' : 'A4 Invoice'}</span>
              </button>
            </div>

            {/* Quick Actions & Close */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                title={lang === 'ar' ? 'فتح درج النقدية' : 'Pop Cash Drawer (RJ11)'}
                onClick={handleKickDrawer}
                className={`p-2 rounded-xl border text-xs font-bold transition cursor-pointer ${
                  isKicking
                    ? 'bg-emerald-600 border-emerald-500 text-white'
                    : 'border-zinc-700 bg-zinc-900 text-zinc-300 hover:text-white'
                }`}
              >
                <DollarSign size={15} className="text-emerald-400" />
              </button>

              <button
                type="button"
                onClick={onClose}
                title={t.close}
                className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Sub-bar: Obvious Font Size Selector & Direct Print Buttons */}
          <div className="flex items-center justify-between gap-3 pt-2 border-t border-zinc-800/80 flex-wrap text-xs">
            {/* Font Size Selector */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-zinc-400 flex items-center gap-1">
                <Type size={13} className="text-emerald-400" />
                <span>{t.fontSize || 'Font Size'}:</span>
              </span>
              <div className="flex items-center gap-1 bg-zinc-900 p-1 rounded-xl border border-zinc-800">
                <button
                  type="button"
                  onClick={() => setFontSize('standard')}
                  className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition cursor-pointer ${
                    fontSize === 'standard'
                      ? 'bg-zinc-700 text-white shadow-xs'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {t.standardFont || 'Standard (10pt)'}
                </button>
                <button
                  type="button"
                  onClick={() => setFontSize('large_obvious')}
                  className={`px-2.5 py-1 rounded-lg font-black text-[11px] transition cursor-pointer flex items-center gap-1 ${
                    fontSize === 'large_obvious'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <Sparkles size={11} />
                  <span>{t.largeObviousFont || 'Large & Obvious'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFontSize('extra_large')}
                  className={`px-2.5 py-1 rounded-lg font-black text-[11px] transition cursor-pointer flex items-center gap-1 ${
                    fontSize === 'extra_large'
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <Maximize2 size={11} />
                  <span>{t.extraLargeFont || 'Extra Large Chef'}</span>
                </button>
              </div>
            </div>

            {/* Direct Print Actions */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                type="button"
                onClick={handlePrintCustomer}
                disabled={isPrintingRaw}
                className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-emerald-400 border border-zinc-700 font-bold text-xs transition inline-flex items-center gap-1.5 cursor-pointer"
              >
                <ReceiptIcon size={13} />
                <span>{lang === 'ar' ? 'طباعة العميل' : 'Print Customer'}</span>
              </button>

              <button
                type="button"
                onClick={handlePrintKitchen}
                disabled={isPrintingRaw}
                className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-amber-400 border border-zinc-700 font-bold text-xs transition inline-flex items-center gap-1.5 cursor-pointer"
              >
                <ChefHat size={13} />
                <span>{lang === 'ar' ? 'طباعة المطبخ' : 'Print Kitchen'}</span>
              </button>

              <button
                type="button"
                onClick={handlePrintBoth}
                disabled={isPrintingRaw}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs transition inline-flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <Printer size={13} />
                <span>{lang === 'ar' ? 'طباعة الاثنين (منفصلين)' : 'Print Both (With Cut)'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-4 sm:p-6 overflow-y-auto max-h-[72vh] bg-zinc-100/70 select-text flex justify-center">
          {/* VIEW 1: CUSTOMER RECEIPT */}
          {viewMode === 'customer' && (
            <div
              id="printable-customer-receipt"
              className="w-full max-w-[360px] bg-white text-black rounded-2xl shadow-xl border-2 border-black p-5 space-y-3 font-cairo select-text text-xs font-bold"
            >
              {/* Receipt Brand Header */}
              <div className="text-center space-y-1 pb-1">
                <h2 className="font-black tracking-wider font-cairo text-black text-xl uppercase">
                  WHITE TABLE
                </h2>
                <p className="text-[11px] font-cairo font-black tracking-widest text-black uppercase">
                  {lang === 'ar' ? 'مطعم وكافيه' : 'RESTAURANT & CAFE'}
                </p>
                <div className="pt-1">
                  <span className="inline-block px-3 py-0.5 rounded bg-black text-white font-cairo text-[11px] font-black uppercase tracking-wider">
                    {lang === 'ar' ? 'فاتورة العميل' : 'CUSTOMER RECEIPT'}
                  </span>
                </div>
              </div>

              {/* Order Metadata */}
              <div className="border-t border-dashed border-black pt-2 pb-1 space-y-1 text-xs font-bold text-black font-cairo">
                <div className="flex justify-between items-baseline">
                  <span className="font-extrabold">{lang === 'ar' ? 'الطلب' : 'Order'}</span>
                  <span className="font-black text-sm">#{ticketOrderNum}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-extrabold">{lang === 'ar' ? 'النوع' : 'Type'}</span>
                  <span className="font-black uppercase">
                    {order.orderType === 'dine_in'
                      ? (lang === 'ar' ? 'صالة / داخلي' : 'DINE IN')
                      : order.orderType === 'takeaway'
                      ? (lang === 'ar' ? 'سفري / تيك أواي' : 'TAKEAWAY')
                      : order.orderType === 'delivery'
                      ? (lang === 'ar' ? 'توصيل' : 'DELIVERY')
                      : (lang === 'ar' ? 'مساحة العمل' : 'CO-WORKING')}
                  </span>
                </div>
                {(order.tableNumber || order.deskNumber) && (
                  <div className="flex justify-between">
                    <span className="font-extrabold">{lang === 'ar' ? 'الطاولة' : 'Table'}</span>
                    <span className="font-black">{order.tableNumber || order.deskNumber}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="font-extrabold">{lang === 'ar' ? 'التاريخ' : 'Date'}</span>
                  <span className="font-bold">
                    {new Date(order.createdAt).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US')}{' '}
                    {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                {customer && (
                  <div className="flex justify-between">
                    <span className="font-extrabold">{lang === 'ar' ? 'العميل' : 'Customer'}</span>
                    <span className="font-bold">{customer.name}</span>
                  </div>
                )}
              </div>

              {/* Items List */}
              <div className="border-t border-dashed border-black py-2 space-y-2 font-cairo">
                {order.items.map((item, idx) => (
                  <div key={idx} className="space-y-0.5">
                    <div className="flex justify-between items-start font-black text-black leading-snug text-xs">
                      <span className="font-black text-black">
                        {item.qty} x {item.name} {item.size ? `(${item.size})` : ''}
                      </span>
                      <span className="shrink-0 ms-2 font-black text-black">
                        {formatCurrency(item.totalPrice)}
                      </span>
                    </div>
                    {item.selectedAddons && item.selectedAddons.length > 0 && (
                      <div className="ps-3 space-y-0.5 text-[11px] text-black font-bold">
                        {item.selectedAddons.map((ad, adIdx) => {
                          const adName = typeof ad === 'string' ? ad : ad.name;
                          const adPrice = typeof ad === 'object' && 'price' in ad ? (ad as any).price : 0;
                          return (
                            <div key={adIdx} className="flex justify-between text-black">
                              <span>+ {adName}</span>
                              {adPrice > 0 && <span>+{formatCurrency(adPrice)}</span>}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Financial Breakdown */}
              <div className="border-t border-dashed border-black pt-2 pb-1 space-y-1 text-xs font-bold text-black font-cairo">
                <div className="flex justify-between text-black">
                  <span className="font-extrabold">{lang === 'ar' ? 'المجموع الفرعي' : 'Subtotal'}</span>
                  <span className="font-black">{formatCurrency(order.subtotal)}</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-black">
                    <span className="font-extrabold">{lang === 'ar' ? 'الخصم' : 'Discount'}</span>
                    <span className="font-black">- {formatCurrency(order.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-black">
                  <span className="font-extrabold">{lang === 'ar' ? 'الضريبة (14%)' : 'Tax (14%)'}</span>
                  <span className="font-black">{formatCurrency(order.tax)}</span>
                </div>
              </div>

              {/* Grand Total */}
              <div className="border-t border-dashed border-black pt-2 pb-1 space-y-1 text-black font-cairo">
                <div className="flex justify-between items-center font-black">
                  <span className="text-base uppercase tracking-wider">{lang === 'ar' ? 'الإجمالي' : 'TOTAL'}</span>
                  <span className="text-xl font-black text-black">
                    {formatCurrency(order.total)}
                  </span>
                </div>
                <div className="flex justify-between text-xs font-bold text-black pt-0.5">
                  <span className="font-extrabold">{lang === 'ar' ? 'طريقة الدفع' : 'Paid via'}</span>
                  <span className="font-black uppercase">{order.paymentMethod}</span>
                </div>
              </div>

              {/* Footer */}
              <div className="text-center text-xs text-black pt-2 font-cairo font-bold">
                <p className="font-black text-black">
                  {lang === 'ar' ? 'شكراً لزيارتكم وايت تيبل ✦' : 'Thank you for visiting White Table ✦'}
                </p>
              </div>
            </div>
          )}

          {/* VIEW 2: KITCHEN ORDER TICKET (KOT) */}
          {viewMode === 'kitchen' && (
            <div
              id="printable-kitchen-ticket"
              className={`w-full max-w-[360px] bg-white text-black rounded-2xl shadow-xl border-2 border-black p-5 space-y-3.5 font-cairo select-text ${
                isExtraLarge ? 'kot-large-font text-base' : isLarge ? 'kot-large-font text-sm' : 'text-xs'
              }`}
            >
              {/* KOT Prominent Header */}
              <div className="text-center border-b-2 border-black pb-2 space-y-1 font-cairo">
                <div className="text-xs sm:text-sm font-black tracking-widest uppercase bg-black text-white py-1 px-2 rounded flex items-center justify-center gap-1.5">
                  <ChefHat size={15} />
                  <span>★ KITCHEN ORDER TICKET ★</span>
                </div>

                {/* MASSIVE ORDER NUMBER FOR KITCHEN READABILITY */}
                <div className="kot-order-num text-3xl font-black tracking-tight text-black bg-zinc-100 py-1.5 rounded-lg border-2 border-black">
                  #{ticketOrderNum}
                </div>

                {/* Prominent Location Badge */}
                <div className="kot-location text-base font-black bg-black text-white py-1 px-2 rounded-lg">
                  [ {destLocation} ]
                </div>
              </div>

              {/* Kitchen Metadata */}
              <div className="border-b-2 border-dashed border-black pb-2 space-y-1 text-xs font-bold text-black font-cairo">
                <div className="flex justify-between">
                  <span className="font-extrabold">Guest:</span>
                  <span className="font-black">{customer ? customer.name : 'Walk-in Guest'}</span>
                </div>
                <div className="flex justify-between text-black">
                  <span className="font-extrabold">Order Time:</span>
                  <span className="font-bold">
                    {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                </div>
                <div className="flex justify-between text-black">
                  <span className="font-extrabold">Total Items:</span>
                  <span className="font-black text-black">
                    {order.items.reduce((s, i) => s + i.qty, 0)} items
                  </span>
                </div>
              </div>

              {/* Food / Hot Kitchen Section */}
              {kitchenFoodItems.length > 0 && (
                <div className="space-y-2 border-b-2 border-dashed border-black pb-3 font-cairo">
                  <div className="text-[11px] font-black uppercase tracking-wider bg-zinc-200 px-2 py-0.5 rounded flex items-center justify-between text-black">
                    <span className="flex items-center gap-1">
                      <Flame size={12} className="text-black" />
                      <span>[ HOT KITCHEN & FOOD ]</span>
                    </span>
                    <span>({kitchenFoodItems.length})</span>
                  </div>

                  <div className="space-y-2.5">
                    {kitchenFoodItems.map((item, idx) => {
                      const isChecked = !!checkedItems[idx];
                      return (
                        <div
                          key={idx}
                          onClick={() => toggleItemCheck(idx)}
                          className={`p-2 rounded-xl border-2 transition cursor-pointer select-none ${
                            isChecked
                              ? 'bg-zinc-100 border-zinc-400 opacity-60 line-through text-zinc-500'
                              : 'bg-zinc-50 border-black text-black'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2 font-black">
                            <div className="flex items-start gap-2">
                              <span className="kot-qty-badge inline-flex items-center justify-center px-1.5 py-0.5 rounded bg-black text-white text-sm font-black shrink-0">
                                {item.qty}X
                              </span>
                              <span className="kot-item-title text-sm sm:text-base font-black text-black leading-tight">
                                {item.name}
                              </span>
                            </div>
                            {item.size && (
                              <span className="text-[11px] font-black bg-zinc-200 text-black px-1.5 py-0.5 rounded shrink-0 uppercase border border-black">
                                {item.size}
                              </span>
                            )}
                          </div>

                          {item.selectedAddons && item.selectedAddons.length > 0 && (
                            <div className="ps-8 text-xs font-bold text-black space-y-0.5 mt-1 kot-addon-note">
                              {item.selectedAddons.map((ad, aidx) => {
                                const adName = typeof ad === 'string' ? ad : ad.name;
                                return (
                                  <div key={aidx} className="flex items-center gap-1 text-black">
                                    <span>→</span>
                                    <span>+ {adName}</span>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Barista & Drinks Section */}
              {drinkItems.length > 0 && (
                <div className="space-y-2 border-b-2 border-dashed border-black pb-3 font-cairo">
                  <div className="text-[11px] font-black uppercase tracking-wider bg-zinc-200 px-2 py-0.5 rounded flex items-center justify-between text-black">
                    <span className="flex items-center gap-1">
                      <Coffee size={12} className="text-black" />
                      <span>[ BARISTA & DRINKS ]</span>
                    </span>
                    <span>({drinkItems.length})</span>
                  </div>

                  <div className="space-y-2.5">
                    {drinkItems.map((item, idx) => {
                      const globalIdx = kitchenFoodItems.length + idx;
                      const isChecked = !!checkedItems[globalIdx];
                      return (
                        <div
                          key={globalIdx}
                          onClick={() => toggleItemCheck(globalIdx)}
                          className={`p-2 rounded-xl border-2 transition cursor-pointer select-none ${
                            isChecked
                              ? 'bg-zinc-100 border-zinc-400 opacity-60 line-through text-zinc-500'
                              : 'bg-zinc-50 border-black text-black'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2 font-black">
                            <div className="flex items-start gap-2">
                              <span className="kot-qty-badge inline-flex items-center justify-center px-1.5 py-0.5 rounded bg-black text-white text-sm font-black shrink-0">
                                {item.qty}X
                              </span>
                              <span className="kot-item-title text-sm sm:text-base font-black text-black leading-tight">
                                {item.name}
                              </span>
                            </div>
                            {item.size && (
                              <span className="text-[11px] font-black bg-zinc-200 text-black px-1.5 py-0.5 rounded shrink-0 uppercase border border-black">
                                {item.size}
                              </span>
                            )}
                          </div>

                          {item.selectedAddons && item.selectedAddons.length > 0 && (
                            <div className="ps-8 text-xs font-bold text-black space-y-0.5 mt-1 kot-addon-note">
                              {item.selectedAddons.map((ad, aidx) => {
                                const adName = typeof ad === 'string' ? ad : ad.name;
                                return (
                                  <div key={aidx} className="flex items-center gap-1 text-black">
                                    <span>→</span>
                                    <span>+ {adName}</span>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Ticket Footer */}
              <div className="pt-1 text-center text-xs text-black font-bold space-y-0.5 font-cairo">
                <p className="uppercase tracking-wider font-extrabold">White Table Kitchen Operations</p>
                <p>Printed: {new Date().toLocaleTimeString()}</p>
              </div>
            </div>
          )}

          {/* VIEW 3: BOTH SEPARATED (SIDE-BY-SIDE / DUAL SLIP PREVIEW) */}
          {viewMode === 'both_split' && (
            <div id="printable-both-receipts" className="w-full flex flex-col md:flex-row items-center md:items-start justify-center gap-6 select-text font-cairo">
              {/* Slip 1: Customer Receipt */}
              <div className="w-full max-w-[340px] bg-white text-black rounded-2xl shadow-xl border-2 border-black p-4 space-y-3 font-cairo text-xs page-break-after-slip">
                <div className="text-center space-y-0.5">
                  <h3 className="font-black text-base text-black font-cairo uppercase">WHITE TABLE</h3>
                  <p className="text-[10px] text-black font-extrabold uppercase">Restaurant &amp; Cafe</p>
                </div>

                <div className="border-t-2 border-dashed border-black pt-2 space-y-1 text-xs font-bold text-black">
                  <div className="flex justify-between">
                    <span className="font-extrabold">Receipt #:</span>
                    <span className="font-black">#{ticketOrderNum}</span>
                  </div>
                  <div className="flex justify-between text-black">
                    <span>Date / Time:</span>
                    <span>{new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Payment:</span>
                    <span className="font-black uppercase">{order.paymentMethod}</span>
                  </div>
                </div>

                <div className="border-t-2 border-b-2 border-dashed border-black py-2 space-y-1.5 font-cairo">
                  {order.items.map((it, idx) => (
                    <div key={idx} className="flex justify-between font-bold text-black">
                      <span className="font-extrabold">{it.qty}x {it.name}</span>
                      <span className="font-black">{formatCurrency(it.totalPrice)}</span>
                    </div>
                  ))}
                </div>

                <div className="space-y-1 text-xs font-bold text-black font-cairo">
                  <div className="flex justify-between">
                    <span>{t.subtotal}:</span>
                    <span className="font-black">{formatCurrency(order.subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>VAT (14%):</span>
                    <span className="font-black">{formatCurrency(order.tax)}</span>
                  </div>
                  <div className="flex justify-between font-black text-sm text-black pt-1 border-t-2 border-dashed border-black">
                    <span className="uppercase">{t.total}:</span>
                    <span className="text-black font-black text-base">{formatCurrency(order.total)}</span>
                  </div>
                </div>

                <div className="text-center text-[10px] text-black font-bold pt-1 border-t-2 border-dashed border-black">
                  <p>*** WORK · SIP · CREATE ***</p>
                  <p className="text-[9px] mt-0.5 text-zinc-600">[ SLIP 1: CUSTOMER COPY ]</p>
                </div>
              </div>

              {/* Visual Cut Indicator on Screen */}
              <div className="no-print hidden md:flex flex-col items-center justify-center self-center py-4 text-zinc-400 font-cairo text-[10px] text-center">
                <div className="h-12 w-0.5 border-l-2 border-dashed border-zinc-400 mb-2" />
                <span className="bg-zinc-800 text-white px-2 py-1 rounded-full font-bold shadow-xs">
                  ✂️ {lang === 'ar' ? 'قاطع آلي' : 'Auto Cut'}
                </span>
                <div className="h-12 w-0.5 border-l-2 border-dashed border-zinc-400 mt-2" />
              </div>

              {/* Slip 2: Kitchen Ticket (KOT) */}
              <div className="w-full max-w-[340px] bg-white text-black rounded-2xl shadow-xl border-2 border-black p-4 space-y-3 font-cairo text-xs">
                <div className="text-center border-b-2 border-black pb-1.5 space-y-0.5">
                  <div className="text-[11px] font-black uppercase tracking-wider bg-black text-white py-0.5 rounded">
                    ★ KITCHEN ORDER TICKET (KOT) ★
                  </div>
                  <div className="text-2xl font-black text-black">
                    #{ticketOrderNum}
                  </div>
                  <div className="text-xs font-black bg-black text-white py-0.5 rounded">
                    [ {destLocation} ]
                  </div>
                </div>

                <div className="border-b-2 border-dashed border-black pb-1.5 space-y-0.5 text-xs font-bold text-black">
                  <div className="flex justify-between">
                    <span>Time:</span>
                    <span>{new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Guest:</span>
                    <span>{customer ? customer.name : 'Walk-in'}</span>
                  </div>
                </div>

                <div className="space-y-2 py-1 font-cairo">
                  {order.items.map((it, idx) => (
                    <div key={idx} className="p-1.5 rounded-lg border-2 border-black bg-zinc-50 font-black text-black">
                      <div className="flex items-center gap-1.5 text-sm">
                        <span className="bg-black text-white px-1.5 py-0.2 rounded font-black text-xs">
                          {it.qty}X
                        </span>
                        <span>{it.name} {it.size ? `(${it.size})` : ''}</span>
                      </div>
                      {it.selectedAddons && it.selectedAddons.length > 0 && (
                        <div className="ps-6 text-xs text-black font-bold mt-0.5">
                          {it.selectedAddons.map((a, aidx) => (
                            <div key={aidx}>+ {typeof a === 'string' ? a : a.name}</div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="text-center text-[10px] text-black font-bold pt-1 border-t-2 border-dashed border-black">
                  <p>White Table Kitchen Prep Slip</p>
                  <p className="text-[9px] text-zinc-600">[ SLIP 2: KITCHEN COPY ]</p>
                </div>
              </div>
            </div>
          )}

          {/* VIEW 4: OFFICIAL A4 TAX INVOICE */}
          {viewMode === 'tax_invoice' && (
            <div
              id="printable-invoice-document"
              className="w-full max-w-3xl bg-white text-zinc-900 rounded-2xl shadow-xl border border-zinc-300 p-6 md:p-8 space-y-5 text-xs font-sans select-text"
            >
              {/* Header with Organization Details */}
              <div className="flex items-start justify-between border-b border-zinc-200 pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5">
                    <WhiteTableLogo size={38} dark={false} />
                    <div>
                      <h2 className="text-base font-black tracking-tight text-zinc-950">
                        WHITE TABLE RESTAURANT &amp; CAFE
                      </h2>
                      <p className="text-[11px] text-zinc-500 font-semibold">
                        {lang === 'ar' ? 'فاتورة مبيعات مطعم ومقهى وايت تيبل' : 'Restaurant & Cafe Sales Invoice'}
                      </p>
                    </div>
                  </div>
                  <div className="text-[11px] text-zinc-500 pt-1 space-y-0.5">
                    <div>Dahab, South Sinai, Egypt · support@whitetable.space</div>
                  </div>
                </div>

                <div className="text-end space-y-1">
                  <div className="px-3 py-1 bg-emerald-50 border border-emerald-200 rounded-lg inline-block text-emerald-900 font-mono font-black text-xs">
                    #{ticketOrderNum}
                  </div>
                  <div className="text-[11px] text-zinc-500">
                    {t.date}: <span className="font-mono text-zinc-800">{new Date(order.createdAt).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US')}</span>
                  </div>
                  <div className="text-[11px] text-zinc-500">
                    {t.time}: <span className="font-mono text-zinc-800">{new Date(order.createdAt).toLocaleTimeString()}</span>
                  </div>
                </div>
              </div>

              {/* Bill To Details */}
              <div className="grid grid-cols-2 gap-4 p-3.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-1">
                    {lang === 'ar' ? 'بيانات العميل / الفاتورة إلى' : 'Billed To / Guest Information'}
                  </span>
                  <div className="font-bold text-zinc-950 text-sm">
                    {customer ? customer.name : t.guestWalkIn}
                  </div>
                  {customer && (
                    <div className="text-[11px] text-zinc-600 mt-1 space-y-0.5">
                      <div>{t.phone}: <span className="font-mono">{customer.phone || 'N/A'}</span></div>
                      <div>{t.email}: <span>{customer.email || 'N/A'}</span></div>
                    </div>
                  )}
                </div>

                <div className="text-end">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-1">
                    {t.paymentMethod}
                  </span>
                  <div className="font-bold text-zinc-950">{order.paymentMethod}</div>
                  <div className="text-[11px] text-zinc-500 mt-1">{t.status}: <strong className="text-emerald-700">{t.paid}</strong></div>
                </div>
              </div>

              {/* Line Items Table */}
              <div className="border border-zinc-200 rounded-xl overflow-hidden">
                <table className="w-full text-start text-xs">
                  <thead className="bg-zinc-100 text-[10px] uppercase font-bold text-zinc-600 border-b border-zinc-200">
                    <tr>
                      <th className="px-4 py-2 text-start">{t.items}</th>
                      <th className="px-3 py-2 text-center">{t.qty}</th>
                      <th className="px-3 py-2 text-end">{t.price}</th>
                      <th className="px-3 py-2 text-end">{t.tax}</th>
                      <th className="px-4 py-2 text-end">{t.total}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {order.items.map((it, idx) => (
                      <tr key={idx} className="hover:bg-zinc-50/50">
                        <td className="px-4 py-2.5">
                          <div className="font-bold text-zinc-950">
                            {it.name} {it.size ? `(${it.size})` : ''}
                          </div>
                          {it.selectedAddons && it.selectedAddons.length > 0 && (
                            <div className="text-[10px] text-zinc-500">
                              {it.selectedAddons.map((a) => {
                                const adName = typeof a === 'string' ? a : a.name;
                                const adPrice = typeof a === 'object' && 'price' in a ? (a as any).price : 0;
                                return `${adName} (+${formatCurrency(adPrice)})`;
                              }).join(', ')}
                            </div>
                          )}
                        </td>
                        <td className="px-3 py-2.5 text-center font-mono">{it.qty}</td>
                        <td className="px-3 py-2.5 text-end font-mono">{formatCurrency(it.unitPrice)}</td>
                        <td className="px-3 py-2.5 text-end font-mono text-zinc-500">14%</td>
                        <td className="px-4 py-2.5 text-end font-mono font-bold text-zinc-950">
                          {formatCurrency(it.totalPrice)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals */}
              <div className="flex justify-end">
                <div className="w-64 space-y-1.5 text-xs bg-zinc-50 p-3.5 rounded-xl border border-zinc-200">
                  <div className="flex justify-between text-zinc-600">
                    <span>{t.subtotal}</span>
                    <span className="font-mono">{formatCurrency(order.subtotal)}</span>
                  </div>
                  {order.discount > 0 && (
                    <div className="flex justify-between text-rose-600">
                      <span>{t.discount}</span>
                      <span className="font-mono">- {formatCurrency(order.discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-zinc-700 font-semibold border-t border-zinc-200 pt-1.5">
                    <span>{t.tax} (14%)</span>
                    <span className="font-mono">{formatCurrency(order.tax)}</span>
                  </div>
                  <div className="flex justify-between text-zinc-950 font-black text-sm border-t border-zinc-300 pt-1.5">
                    <span>{t.total}</span>
                    <span className="font-mono text-emerald-700">{formatCurrency(order.total)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer with quick primary action buttons */}
        <div className="no-print p-4 bg-zinc-900 border-t border-zinc-800 flex items-center justify-between gap-3 flex-wrap font-cairo">
          <div className="flex items-center gap-2 text-xs text-zinc-300 font-bold truncate">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shrink-0 shadow-xs animate-pulse" />
            <span className="truncate">
              {hardwareSettings.connectedDeviceName || `Zywell GA-C80250I Plus (${hardwareSettings.paperWidth}mm)`} · Cairo Bold Font
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            <button
              id="btn-receipt-quick-print-kot"
              type="button"
              onClick={handlePrintKitchen}
              disabled={isPrintingRaw}
              className="py-2.5 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-amber-300 border border-zinc-700 font-black text-xs transition inline-flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <ChefHat size={15} />
              <span>{lang === 'ar' ? 'طباعة بون المطبخ' : 'Print KOT'}</span>
            </button>

            <button
              id="btn-receipt-quick-print-receipt"
              type="button"
              onClick={handlePrintCustomer}
              disabled={isPrintingRaw}
              className="py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs transition inline-flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <Printer size={15} />
              <span>{lang === 'ar' ? 'طباعة الفاتورة' : 'Print Receipt'}</span>
            </button>

            <button
              id="btn-receipt-new-order"
              type="button"
              onClick={onClose}
              className="py-2.5 px-4 rounded-xl bg-white hover:bg-zinc-100 text-black font-black text-xs transition cursor-pointer border border-white shadow-sm"
            >
              {lang === 'ar' ? 'طلب جديد / إغلاق' : 'New Order'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
