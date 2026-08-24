import React, { useState, useMemo } from 'react';
import {
  ChefHat,
  Coffee,
  Printer,
  Clock,
  CheckCircle2,
  AlertCircle,
  Flame,
  Search,
  Filter,
  Plus,
  ArrowRight,
  Sparkles,
  Volume2,
  VolumeX,
  RefreshCw,
  BellRing,
  Eye,
  Check,
} from 'lucide-react';
import { KitchenTicket, KitchenStation, KitchenTicketStatus } from '../../types';
import { KitchenTicketModal } from './KitchenTicketModal';
import { useLanguage } from '../../i18n/LanguageContext';

interface KitchenOrdersViewProps {
  tickets: KitchenTicket[];
  onUpdateTicketStatus: (ticketId: string, status: KitchenTicketStatus) => void;
  onCreateTicket?: (ticket: Omit<KitchenTicket, 'id' | 'ticketNumber' | 'createdAt'>) => void;
  autoPrintEnabled: boolean;
  onToggleAutoPrint: () => void;
  notify: (title: string, message?: string, type?: 'success' | 'warning' | 'info') => void;
}

export const KitchenOrdersView: React.FC<KitchenOrdersViewProps> = ({
  tickets,
  onUpdateTicketStatus,
  onCreateTicket,
  autoPrintEnabled,
  onToggleAutoPrint,
  notify,
}) => {
  const { lang, t } = useLanguage();
  const [stationFilter, setStationFilter] = useState<KitchenStation>('all');
  const [statusFilter, setStatusFilter] = useState<'active' | 'ready' | 'served' | 'all'>('active');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTicketForPrint, setSelectedTicketForPrint] = useState<KitchenTicket | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Time elapsed calculator helper
  const getElapsedMinutes = (timestamp: number) => {
    const diffMs = Date.now() - timestamp;
    return Math.floor(diffMs / (1000 * 60));
  };

  // Filtered tickets
  const filteredTickets = useMemo(() => {
    return tickets.filter((tk) => {
      // Station filter
      if (stationFilter === 'hot_kitchen') {
        const hasKitchenItems = tk.items.some((i) => i.station === 'kitchen');
        if (!hasKitchenItems) return false;
      } else if (stationFilter === 'barista_bar') {
        const hasBaristaItems = tk.items.some((i) => i.station === 'barista');
        if (!hasBaristaItems) return false;
      }

      // Status filter
      if (statusFilter === 'active') {
        if (tk.status !== 'queued' && tk.status !== 'preparing') return false;
      } else if (statusFilter === 'ready') {
        if (tk.status !== 'ready') return false;
      } else if (statusFilter === 'served') {
        if (tk.status !== 'served') return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesNum = tk.ticketNumber.toLowerCase().includes(q);
        const matchesCust = tk.customerName.toLowerCase().includes(q);
        const matchesTable = tk.tableOrDeskLabel.toLowerCase().includes(q);
        const matchesItem = tk.items.some((i) => i.name.toLowerCase().includes(q));
        if (!matchesNum && !matchesCust && !matchesTable && !matchesItem) return false;
      }

      return true;
    });
  }, [tickets, stationFilter, statusFilter, searchQuery]);

  // Counts for quick metrics
  const activeCount = tickets.filter((t) => t.status === 'queued' || t.status === 'preparing').length;
  const queuedCount = tickets.filter((t) => t.status === 'queued').length;
  const preparingCount = tickets.filter((t) => t.status === 'preparing').length;
  const readyCount = tickets.filter((t) => t.status === 'ready').length;
  const servedTodayCount = tickets.filter((t) => t.status === 'served').length;

  const handleQuickStatus = (ticketId: string, newStatus: KitchenTicketStatus) => {
    onUpdateTicketStatus(ticketId, newStatus);
    const label =
      newStatus === 'preparing'
        ? lang === 'ar' ? 'بدأ الشيف في التحضير' : 'Started preparation'
        : newStatus === 'ready'
        ? lang === 'ar' ? 'الطلب جاهز للاستلام والتسليم' : 'Order ready for service'
        : lang === 'ar' ? 'تم تسليم الطلب' : 'Order completed & served';

    notify(
      lang === 'ar' ? 'تحديث حالة تذكرة المطبخ' : 'Kitchen Ticket Updated',
      label,
      'success'
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Kitchen Metrics */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-orange-600/10 border border-orange-500/30 flex items-center justify-center text-orange-600">
              <ChefHat size={22} />
            </div>
            <div>
              <h2 className="text-xl font-black text-zinc-950 tracking-tight flex items-center gap-2">
                <span>{t.kitchenOrders}</span>
                {queuedCount > 0 && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-600 text-white animate-pulse">
                    {queuedCount} {lang === 'ar' ? 'جديد' : 'NEW'}
                  </span>
                )}
              </h2>
              <p className="text-xs text-zinc-500 mt-0.5">{t.kitchenSubtitle}</p>
            </div>
          </div>
        </div>

        {/* Toolbar Controls */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Auto-Print Toggle Switch */}
          <button
            type="button"
            onClick={onToggleAutoPrint}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
              autoPrintEnabled
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-2xs'
                : 'bg-zinc-100 text-zinc-600 border-zinc-200 hover:bg-zinc-200'
            }`}
            title="Automatically send new tickets to 80mm kitchen printer"
          >
            <Printer size={14} className={autoPrintEnabled ? 'text-emerald-600' : 'text-zinc-400'} />
            <span>{t.autoPrintKitchen}</span>
            <span
              className={`w-2 h-2 rounded-full ${
                autoPrintEnabled ? 'bg-emerald-500 animate-ping' : 'bg-zinc-400'
              }`}
            />
          </button>

          {/* Sound alert toggle */}
          <button
            type="button"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-100 text-zinc-700 transition cursor-pointer"
            title={soundEnabled ? 'Kitchen Bell Sound ON' : 'Kitchen Bell Sound OFF'}
          >
            {soundEnabled ? (
              <Volume2 size={16} className="text-orange-600" />
            ) : (
              <VolumeX size={16} className="text-zinc-400" />
            )}
          </button>
        </div>
      </div>

      {/* Metric Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-white border border-zinc-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block">
              {lang === 'ar' ? 'في الانتظار' : 'Queued'}
            </span>
            <div className="text-2xl font-black text-rose-600 font-mono mt-0.5">{queuedCount}</div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600">
            <BellRing size={18} />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-zinc-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block">
              {lang === 'ar' ? 'قيد التحضير' : 'In Prep'}
            </span>
            <div className="text-2xl font-black text-amber-600 font-mono mt-0.5">{preparingCount}</div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
            <Flame size={18} />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-zinc-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block">
              {lang === 'ar' ? 'جاهز للتسليم' : 'Ready to Serve'}
            </span>
            <div className="text-2xl font-black text-emerald-600 font-mono mt-0.5">{readyCount}</div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
            <CheckCircle2 size={18} />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-zinc-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block">
              {lang === 'ar' ? 'تم التسليم اليوم' : 'Served Today'}
            </span>
            <div className="text-2xl font-black text-zinc-900 font-mono mt-0.5">{servedTodayCount}</div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-700">
            <Coffee size={18} />
          </div>
        </div>
      </div>

      {/* Station & Status Filters */}
      <div className="p-3 bg-white rounded-2xl border border-zinc-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Station Segmented Control */}
        <div className="flex items-center gap-1.5 p-1 bg-zinc-100 rounded-xl">
          <button
            type="button"
            onClick={() => setStationFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              stationFilter === 'all'
                ? 'bg-white text-zinc-950 shadow-xs'
                : 'text-zinc-500 hover:text-zinc-900'
            }`}
          >
            {t.stationAll}
          </button>
          <button
            type="button"
            onClick={() => setStationFilter('hot_kitchen')}
            className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              stationFilter === 'hot_kitchen'
                ? 'bg-orange-600 text-white shadow-xs'
                : 'text-zinc-500 hover:text-zinc-900'
            }`}
          >
            <ChefHat size={13} />
            <span>{t.stationHotKitchen}</span>
          </button>
          <button
            type="button"
            onClick={() => setStationFilter('barista_bar')}
            className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              stationFilter === 'barista_bar'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-zinc-500 hover:text-zinc-900'
            }`}
          >
            <Coffee size={13} />
            <span>{t.stationBarista}</span>
          </button>
        </div>

        {/* Status Filter Tabs & Search */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 bg-zinc-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setStatusFilter('active')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                statusFilter === 'active'
                  ? 'bg-zinc-900 text-white shadow-xs'
                  : 'text-zinc-500 hover:text-zinc-900'
              }`}
            >
              {lang === 'ar' ? 'النشطة' : 'Active Orders'} ({activeCount})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('ready')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                statusFilter === 'ready'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-zinc-500 hover:text-zinc-900'
              }`}
            >
              {lang === 'ar' ? 'جاهز' : 'Ready'} ({readyCount})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('served')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                statusFilter === 'served'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-zinc-500 hover:text-zinc-900'
              }`}
            >
              {lang === 'ar' ? 'مكتمل' : 'History'}
            </button>
          </div>

          <div className="relative">
            <Search size={14} className="absolute start-2.5 top-2.5 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={lang === 'ar' ? 'بحث برقم التذكرة أو الصنف...' : 'Search tickets or items...'}
              className="ps-8 pe-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 focus:outline-none focus:border-emerald-600 font-medium"
            />
          </div>
        </div>
      </div>

      {/* Ticket Grid / KDS Cards */}
      {filteredTickets.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-dashed border-zinc-300 space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-orange-50 border border-orange-200 flex items-center justify-center text-orange-600 mx-auto">
            <ChefHat size={28} />
          </div>
          <h3 className="text-base font-bold text-zinc-900">
            {lang === 'ar' ? 'لا توجد طلبات مطبخ حالياً' : 'All Clear! No Kitchen Tickets in this Queue'}
          </h3>
          <p className="text-xs text-zinc-500 max-w-md mx-auto">
            {lang === 'ar'
              ? 'عند تسجيل أي طلب من الكاشير أو طاولات مساحة العمل يحتوي على مأكولات أو مشروبات، سيظهر مباشرة هنا ويتم إرساله للطباعة.'
              : 'When food or drinks are ordered via POS or Coworking desks, live chef tickets will stream here automatically.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredTickets.map((ticket) => {
            const elapsed = getElapsedMinutes(ticket.createdAt);
            const isUrgent = elapsed > 15 && ticket.status !== 'served';
            const isWarning = elapsed > 8 && elapsed <= 15 && ticket.status !== 'served';

            return (
              <div
                key={ticket.id}
                className={`bg-white rounded-2xl shadow-2xs border overflow-hidden transition flex flex-col justify-between ${
                  ticket.status === 'queued'
                    ? 'border-rose-300 ring-2 ring-rose-500/20'
                    : ticket.status === 'preparing'
                    ? 'border-amber-300 ring-1 ring-amber-500/20'
                    : ticket.status === 'ready'
                    ? 'border-emerald-300 bg-emerald-50/20'
                    : 'border-zinc-200 opacity-80'
                }`}
              >
                {/* Ticket Top Banner */}
                <div
                  className={`p-3.5 flex items-center justify-between border-b ${
                    ticket.status === 'queued'
                      ? 'bg-rose-50/80 border-rose-200 text-rose-950'
                      : ticket.status === 'preparing'
                      ? 'bg-amber-50/80 border-amber-200 text-amber-950'
                      : ticket.status === 'ready'
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                      : 'bg-zinc-100 border-zinc-200 text-zinc-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-black text-sm">{ticket.ticketNumber}</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/80 border border-current font-sans">
                      {ticket.status === 'queued'
                        ? t.ticketQueued
                        : ticket.status === 'preparing'
                        ? t.ticketPreparing
                        : ticket.status === 'ready'
                        ? t.ticketReady
                        : t.ticketServed}
                    </span>
                  </div>

                  {/* Elapsed Timer */}
                  <div
                    className={`flex items-center gap-1 text-xs font-mono font-bold px-2 py-0.5 rounded-lg ${
                      isUrgent
                        ? 'bg-rose-600 text-white animate-pulse'
                        : isWarning
                        ? 'bg-amber-500 text-white'
                        : 'bg-zinc-200/80 text-zinc-800'
                    }`}
                  >
                    <Clock size={12} />
                    <span>{elapsed}m ago</span>
                  </div>
                </div>

                {/* Ticket Location & Guest */}
                <div className="p-4 space-y-3 flex-1">
                  <div className="flex items-center justify-between text-xs pb-2 border-b border-zinc-100">
                    <div className="font-bold text-zinc-950 bg-zinc-100 px-2.5 py-1 rounded-lg">
                      {ticket.tableOrDeskLabel}
                    </div>
                    <div className="text-zinc-600 font-medium truncate max-w-[140px]">
                      {ticket.customerName}
                    </div>
                  </div>

                  {/* Ticket Items */}
                  <div className="space-y-2">
                    {ticket.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-2 rounded-xl bg-zinc-50 border border-zinc-200/70 space-y-0.5"
                      >
                        <div className="flex items-start justify-between">
                          <div className="font-black text-sm text-zinc-950 flex items-center gap-2">
                            <span className="px-1.5 py-0.2 rounded bg-zinc-900 text-white text-xs font-mono">
                              {item.qty}x
                            </span>
                            <span>{item.name}</span>
                          </div>
                          <span
                            className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                              item.station === 'kitchen'
                                ? 'bg-orange-100 text-orange-900 border border-orange-200'
                                : 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                            }`}
                          >
                            {item.station === 'kitchen' ? 'Kitchen' : 'Barista'}
                          </span>
                        </div>

                        {item.size && (
                          <div className="text-[11px] font-bold text-zinc-600 ps-7">
                            Size: {item.size}
                          </div>
                        )}

                        {item.selectedAddons && item.selectedAddons.length > 0 && (
                          <div className="ps-7 text-[10px] text-zinc-500 font-semibold">
                            {item.selectedAddons.map((a) => `+ ${a.name}`).join(', ')}
                          </div>
                        )}

                        {item.note && (
                          <div className="ps-7 text-[10px] font-black text-amber-800 bg-amber-50 p-1 rounded mt-1 border border-amber-200">
                            NOTE: {item.note}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Chef Notes if any */}
                  {ticket.chefNotes && (
                    <div className="p-2 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 font-semibold">
                      <span className="font-bold block text-[10px] uppercase tracking-wider text-amber-700">
                        Chef Note:
                      </span>
                      {ticket.chefNotes}
                    </div>
                  )}
                </div>

                {/* Ticket Bottom Actions */}
                <div className="p-3 bg-zinc-50 border-t border-zinc-200 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedTicketForPrint(ticket)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-300 bg-white hover:bg-zinc-100 text-zinc-700 text-xs font-bold transition cursor-pointer shadow-2xs"
                    title="Print 80mm Kitchen Slip for Chef"
                  >
                    <Printer size={13} className="text-orange-600" />
                    <span>{lang === 'ar' ? 'طباعة' : 'Print'}</span>
                  </button>

                  <div className="flex items-center gap-1.5">
                    {ticket.status === 'queued' && (
                      <button
                        type="button"
                        onClick={() => handleQuickStatus(ticket.id, 'preparing')}
                        className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition cursor-pointer shadow-2xs"
                      >
                        {t.startPrep}
                      </button>
                    )}

                    {ticket.status === 'preparing' && (
                      <button
                        type="button"
                        onClick={() => handleQuickStatus(ticket.id, 'ready')}
                        className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition cursor-pointer shadow-2xs flex items-center gap-1"
                      >
                        <Check size={13} />
                        <span>{t.markReady}</span>
                      </button>
                    )}

                    {ticket.status === 'ready' && (
                      <button
                        type="button"
                        onClick={() => handleQuickStatus(ticket.id, 'served')}
                        className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition cursor-pointer shadow-2xs"
                      >
                        {t.markServed}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Printable Kitchen Ticket Modal */}
      {selectedTicketForPrint && (
        <KitchenTicketModal
          ticket={selectedTicketForPrint}
          onClose={() => setSelectedTicketForPrint(null)}
          onStatusChange={onUpdateTicketStatus}
          notify={notify}
        />
      )}
    </div>
  );
};
