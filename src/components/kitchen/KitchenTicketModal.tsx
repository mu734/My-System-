import React, { useState, useEffect } from 'react';
import {
  X,
  Printer,
  ChefHat,
  Coffee,
  Clock,
  MapPin,
  User,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Flame,
  BellRing,
  Type,
  Maximize2,
} from 'lucide-react';
import { KitchenTicket } from '../../types';
import { useLanguage } from '../../i18n/LanguageContext';
import {
  getHardwareSettings,
  sendRawBytesToHardware,
  buildEscPosKitchenTicket,
  FontSizePreference,
} from '../../services/hardwareService';

interface KitchenTicketModalProps {
  ticket: KitchenTicket;
  onClose: () => void;
  onStatusChange?: (ticketId: string, status: KitchenTicket['status']) => void;
  notify?: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const KitchenTicketModal: React.FC<KitchenTicketModalProps> = ({
  ticket,
  onClose,
  onStatusChange,
  notify,
}) => {
  const { lang, t } = useLanguage();
  const hardwareSettings = getHardwareSettings();
  const [fontSize, setFontSize] = useState<FontSizePreference>(hardwareSettings.fontSizePreference || 'large_obvious');
  const [isPrintingRaw, setIsPrintingRaw] = useState(false);
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const toggleItem = (key: string) => {
    setCheckedItems((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const isLarge = fontSize === 'large_obvious' || fontSize === 'extra_large';
  const isExtraLarge = fontSize === 'extra_large';

  // Safe Date Formatting
  const getTicketTime = () => {
    const raw = ticket.createdAt || ticket.timestamp;
    if (!raw) {
      return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    }
    const d = new Date(typeof raw === 'number' ? raw : isNaN(Number(raw)) ? raw : Number(raw));
    if (isNaN(d.getTime())) {
      return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    }
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  // Safe Location String
  const getLocationLabel = () => {
    if (ticket.tableOrDeskLabel && ticket.tableOrDeskLabel.trim()) return ticket.tableOrDeskLabel;
    if (ticket.tableNumber && ticket.tableNumber.trim()) return `TABLE #${ticket.tableNumber}`;
    if (ticket.type === 'dine-in') return 'DINE-IN TABLE';
    if (ticket.type === 'takeaway') return 'TAKEAWAY COUNTER';
    return 'POS WALK-IN / COUNTER';
  };

  const handlePrint = async () => {
    if (hardwareSettings.printerType !== 'system') {
      setIsPrintingRaw(true);
      try {
        const rawBytes = buildEscPosKitchenTicket(ticket, hardwareSettings, { largeFont: isLarge });
        const res = await sendRawBytesToHardware(rawBytes, hardwareSettings);
        if (res.success) {
          if (notify) {
            notify(
              lang === 'ar' ? 'تمت طباعة بون المطبخ بنجاح' : 'Kitchen KOT Ticket Printed',
              'success'
            );
          }
          return;
        } else {
          if (notify) {
            notify(res.message || (lang === 'ar' ? 'فتح معاينة الطباعة...' : 'Opening print preview...'), 'info');
          }
        }
      } catch {
        // Fallback to CSS print
      } finally {
        setIsPrintingRaw(false);
      }
    }

    // Pure CSS-based print layout: renders immediately from the active DOM
    window.print();
  };

  // Categorize items with fallback intelligence
  const baristaCategories = [
    'espresso_bar',
    'specialty_brews',
    'signature_cold',
    'tea_matcha',
    'smoothies_wellness',
    'coffee',
    'drinks',
    'beverages',
  ];

  const isDrinkItem = (item: any) => {
    if (item.station === 'barista') return true;
    if (item.station === 'kitchen') return false;
    const cat = (item.category || '').toLowerCase();
    const name = (item.name || '').toLowerCase();
    return (
      baristaCategories.includes(cat) ||
      name.includes('latte') ||
      name.includes('espresso') ||
      name.includes('matcha') ||
      name.includes('brew') ||
      name.includes('tea') ||
      name.includes('smoothie') ||
      name.includes('juice') ||
      name.includes('coffee') ||
      name.includes('cappuccino') ||
      name.includes('flat white') ||
      name.includes('americano') ||
      name.includes('cortado')
    );
  };

  const allItems = ticket.items || [];
  const kitchenItems = allItems.filter((i) => !isDrinkItem(i));
  const baristaItems = allItems.filter((i) => isDrinkItem(i));

  // Fallback: If both stations ended up empty but allItems has content, assign all to kitchen so nothing is lost
  const finalKitchenItems = (kitchenItems.length === 0 && baristaItems.length === 0 && allItems.length > 0)
    ? allItems
    : kitchenItems;

  return (
    <div
      id="kitchen-ticket-modal-backdrop"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-zinc-950/85 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150"
    >
      <div
        id="kitchen-ticket-modal-dialog"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-zinc-900 text-zinc-100 rounded-3xl shadow-2xl overflow-hidden border border-zinc-700 animate-in zoom-in-95 duration-150 flex flex-col my-auto max-h-[95vh]"
      >
        {/* Controls Toolbar (Hidden in Print) */}
        <div className="no-print p-4 bg-zinc-950 border-b border-zinc-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-orange-600/30 border border-orange-500/50 flex items-center justify-center text-orange-400">
                <ChefHat size={16} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-orange-400 bg-orange-950/80 px-2 py-0.5 rounded border border-orange-800/60">
                    {lang === 'ar' ? 'بون المطبخ والبار (KOT)' : 'Kitchen Order Ticket'}
                  </span>
                  <span className="font-mono font-black text-sm text-zinc-200">
                    {ticket.ticketNumber}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrint}
                disabled={isPrintingRaw}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-black shadow-sm transition cursor-pointer"
              >
                <Printer size={14} />
                <span>{isPrintingRaw ? (lang === 'ar' ? 'جاري الإرسال...' : 'Printing...') : (lang === 'ar' ? 'طباعة للشيف' : 'Print KOT')}</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Font Size Selector for Kitchen Line */}
          <div className="flex items-center justify-between gap-2 pt-2 border-t border-zinc-800/70 text-xs">
            <span className="text-[11px] font-bold text-zinc-400 flex items-center gap-1">
              <Type size={12} className="text-orange-400" />
              <span>{t.fontSize || 'Font Size'}:</span>
            </span>

            <div className="flex items-center gap-1 bg-zinc-900 p-1 rounded-xl border border-zinc-800">
              <button
                type="button"
                onClick={() => setFontSize('standard')}
                className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition cursor-pointer ${
                  fontSize === 'standard'
                    ? 'bg-zinc-700 text-white shadow-xs'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {t.standardFont || 'Standard'}
              </button>
              <button
                type="button"
                onClick={() => setFontSize('large_obvious')}
                className={`px-2.5 py-0.5 rounded-lg text-[10px] font-black transition cursor-pointer flex items-center gap-1 ${
                  fontSize === 'large_obvious'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Sparkles size={10} />
                <span>{t.largeObviousFont || 'Large & Obvious'}</span>
              </button>
              <button
                type="button"
                onClick={() => setFontSize('extra_large')}
                className={`px-2.5 py-0.5 rounded-lg text-[10px] font-black transition cursor-pointer flex items-center gap-1 ${
                  fontSize === 'extra_large'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Maximize2 size={10} />
                <span>{t.extraLargeFont || 'Extra Large Chef'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Printable Ticket Container */}
        <div className="p-4 sm:p-6 overflow-y-auto flex justify-center bg-zinc-950 select-text">
          {/* Printable 80mm KOT Document with specialized ID for CSS print isolation */}
          <div
            id="printable-kitchen-ticket"
            className={`w-full max-w-[360px] p-5 bg-white text-black rounded-2xl shadow-xl border-2 border-black font-cairo select-text space-y-3.5 ${
              isExtraLarge ? 'kot-large-font text-base' : isLarge ? 'kot-large-font text-sm' : 'text-xs'
            }`}
          >
            {/* Ticket Header */}
            <div className="text-center border-b-2 border-black pb-2 space-y-1 font-cairo">
              <div className="text-xs font-black tracking-widest uppercase bg-black text-white py-1 px-2 rounded flex items-center justify-center gap-1">
                <ChefHat size={14} />
                <span>★ KITCHEN ORDER TICKET ★</span>
              </div>
              <div className="kot-order-num text-3xl font-black tracking-tight text-black bg-zinc-100 py-1.5 rounded-lg border-2 border-black">
                {ticket.ticketNumber}
              </div>
              {ticket.priority === 'rush' && (
                <div className="bg-red-600 text-white text-xs font-black py-1 px-2 rounded uppercase tracking-wider animate-pulse">
                  ⚡ RUSH ORDER / عاجل ⚡
                </div>
              )}
            </div>

            {/* Destination & Meta */}
            <div className="border-b-2 border-dashed border-black pb-2 space-y-1 text-xs font-bold text-black font-cairo">
              <div className="flex justify-between items-baseline">
                <span className="font-extrabold">LOCATION:</span>
                <span className="kot-location font-black text-sm bg-black text-white px-2 py-0.5 rounded">
                  {getLocationLabel()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-extrabold">Guest:</span>
                <span className="font-black truncate max-w-[170px]">{ticket.customerName || 'Walk-in Guest'}</span>
              </div>
              <div className="flex justify-between text-black">
                <span className="font-extrabold">Time:</span>
                <span className="font-bold">
                  {getTicketTime()}
                </span>
              </div>
            </div>

            {/* Kitchen Items (Food / Grill) */}
            {finalKitchenItems.length > 0 && (
              <div className="space-y-2 pt-1 border-b-2 border-dashed border-black pb-2.5 font-cairo">
                <div className="text-[11px] font-black uppercase tracking-wider bg-zinc-200 px-2 py-0.5 rounded flex items-center justify-between text-black">
                  <span className="flex items-center gap-1">
                    <Flame size={12} className="text-black" />
                    <span>[ HOT KITCHEN & GRILL ]</span>
                  </span>
                  <span>({finalKitchenItems.length} items)</span>
                </div>
                <div className="space-y-2">
                  {finalKitchenItems.map((item, idx) => {
                    const k = `k-${idx}`;
                    const isChecked = !!checkedItems[k];
                    const itemNote = item.note || item.notes;
                    return (
                      <div
                        key={idx}
                        onClick={() => toggleItem(k)}
                        className={`p-2 rounded-xl border-2 transition cursor-pointer select-none ${
                          isChecked
                            ? 'bg-zinc-100 border-zinc-400 opacity-50 line-through text-zinc-500'
                            : 'bg-zinc-50 border-black text-black'
                        }`}
                      >
                        <div className="flex items-start justify-between font-black">
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
                            {item.selectedAddons.map((a, aidx) => (
                              <div key={aidx} className="flex items-center gap-1 text-black">
                                <span>→</span>
                                <span>+ {typeof a === 'string' ? a : (a as any)?.name}</span>
                              </div>
                            ))}
                          </div>
                        )}
                        {itemNote && (
                          <div className="ps-8 text-xs font-black text-black bg-amber-200 p-1 rounded mt-1 border border-black">
                            * NOTE: {itemNote}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Barista Items (Coffee / Drinks) */}
            {baristaItems.length > 0 && (
              <div className="space-y-2 pt-1 border-b-2 border-dashed border-black pb-2.5 font-cairo">
                <div className="text-[11px] font-black uppercase tracking-wider bg-zinc-200 px-2 py-0.5 rounded flex items-center justify-between text-black">
                  <span className="flex items-center gap-1">
                    <Coffee size={12} className="text-black" />
                    <span>[ BARISTA & DRINKS ]</span>
                  </span>
                  <span>({baristaItems.length} drinks)</span>
                </div>
                <div className="space-y-2">
                  {baristaItems.map((item, idx) => {
                    const k = `b-${idx}`;
                    const isChecked = !!checkedItems[k];
                    const itemNote = item.note || item.notes;
                    return (
                      <div
                        key={idx}
                        onClick={() => toggleItem(k)}
                        className={`p-2 rounded-xl border-2 transition cursor-pointer select-none ${
                          isChecked
                            ? 'bg-zinc-100 border-zinc-400 opacity-50 line-through text-zinc-500'
                            : 'bg-zinc-50 border-black text-black'
                        }`}
                      >
                        <div className="flex items-start justify-between font-black">
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
                            {item.selectedAddons.map((a, aidx) => (
                              <div key={aidx} className="flex items-center gap-1 text-black">
                                <span>→</span>
                                <span>+ {typeof a === 'string' ? a : (a as any)?.name}</span>
                              </div>
                            ))}
                          </div>
                        )}
                        {itemNote && (
                          <div className="ps-8 text-xs font-black text-black bg-amber-200 p-1 rounded mt-1 border border-black">
                            * NOTE: {itemNote}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Chef Global Notes */}
            {ticket.chefNotes && (
              <div className="p-2 rounded-lg bg-zinc-100 border-2 border-black text-xs font-bold text-black font-cairo">
                <span className="text-black uppercase block font-black">SPECIAL CHEF INSTRUCTIONS:</span>
                <span>{ticket.chefNotes}</span>
              </div>
            )}

            {/* Ticket Footer */}
            <div className="pt-1 text-center text-xs text-black font-bold space-y-0.5 font-cairo">
              <p className="uppercase tracking-wider font-extrabold">White Table Kitchen Operations</p>
              <p>Printed: {new Date().toLocaleTimeString()}</p>
            </div>
          </div>
        </div>

        {/* Modal Footer with Status Actions */}
        <div className="no-print p-4 bg-zinc-950 border-t border-zinc-800 flex items-center justify-between flex-wrap gap-2">
          {onStatusChange && (
            <div className="flex items-center gap-1.5">
              {ticket.status === 'queued' && (
                <button
                  type="button"
                  onClick={() => onStatusChange(ticket.id, 'preparing')}
                  className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition cursor-pointer"
                >
                  {t.startPrep}
                </button>
              )}
              {(ticket.status === 'queued' || ticket.status === 'preparing') && (
                <button
                  type="button"
                  onClick={() => onStatusChange(ticket.id, 'ready')}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition cursor-pointer"
                >
                  {t.markReady}
                </button>
              )}
              {ticket.status === 'ready' && (
                <button
                  type="button"
                  onClick={() => onStatusChange(ticket.id, 'served')}
                  className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition cursor-pointer"
                >
                  {t.markServed}
                </button>
              )}
            </div>
          )}

          <div className="flex items-center gap-2 ms-auto">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white hover:bg-zinc-800 transition cursor-pointer"
            >
              {t.close}
            </button>
            <button
              type="button"
              onClick={handlePrint}
              disabled={isPrintingRaw}
              className="px-4 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-black transition flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Printer size={14} />
              <span>{isPrintingRaw ? (lang === 'ar' ? 'جاري الطباعة...' : 'Printing...') : t.printChefTicket}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
