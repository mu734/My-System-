import React, { useState, useMemo } from 'react';
import {
  Coffee,
  Armchair,
  Boxes,
  Receipt,
  Users,
  TrendingUp,
  AlertTriangle,
  Clock,
  ArrowUpRight,
  Plus,
  Play,
  Square,
  Eye,
  CheckCircle2,
  DollarSign,
  UserCheck,
  Award,
  Heart,
  ShoppingBag,
  Sparkles,
  PieChart as PieChartIcon,
  BarChart3,
  Activity,
  Layers,
  Calendar,
  Zap,
  ChevronDown,
  Flame,
  Check,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  ComposedChart,
} from 'recharts';
import { AppTab, Order, MenuItem, Customer, Desk, DeskSession, Invoice } from '../../types';
import { useLanguage } from '../../i18n/LanguageContext';
import { DailyRevenueSummary } from './DailyRevenueSummary';

interface DashboardViewProps {
  orders: Order[];
  menu: MenuItem[];
  customers: Customer[];
  desks: Desk[];
  sessions: DeskSession[];
  invoices: Invoice[];
  onNavigate: (tab: AppTab) => void;
  onEndSession: (sessionId: string) => Order;
  onSelectDeskForSession: (desk: Desk) => void;
  onViewReceipt: (order: Order) => void;
  onRestockItem: (itemId: string, delta: number) => void;
}

const PALETTE = [
  '#059669', // Emerald
  '#D97706', // Amber
  '#2563EB', // Blue
  '#7C3AED', // Violet
  '#E11D48', // Rose
  '#0D9488', // Teal
  '#4F46E5', // Indigo
  '#EA580C', // Orange
];

export const DashboardView: React.FC<DashboardViewProps> = ({
  orders,
  menu,
  customers,
  desks,
  sessions,
  invoices,
  onNavigate,
  onEndSession,
  onSelectDeskForSession,
  onViewReceipt,
  onRestockItem,
}) => {
  const { lang, t, formatCurrency } = useLanguage();
  const [timeframe, setTimeframe] = useState<'7d' | '30d' | 'today'>('7d');
  const [streamFilter, setStreamFilter] = useState<'all' | 'pos' | 'coworking'>('all');
  const [showLedgerSection, setShowLedgerSection] = useState(false);

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const todayOrders = useMemo(
    () => orders.filter((o) => o.createdAt >= today.getTime()),
    [orders, today]
  );
  const todayRevenue = useMemo(
    () => todayOrders.reduce((sum, o) => sum + o.total, 0),
    [todayOrders]
  );
  const totalRevenue = useMemo(
    () => orders.reduce((sum, o) => sum + o.total, 0),
    [orders]
  );
  const avgOrder = todayOrders.length > 0 ? todayRevenue / todayOrders.length : 0;
  const lowStockItems = useMemo(
    () => menu.filter((m) => m.stock <= m.threshold),
    [menu]
  );
  const occupancyRate = desks.length > 0 ? Math.round((sessions.length / desks.length) * 100) : 0;

  // 1. REVENUE TRAJECTORY CHART DATA (7 Days, 30 Days, or Today Hourly)
  const trajectoryData = useMemo(() => {
    if (timeframe === 'today') {
      // 24 hours buckets or operating hours 08:00 - 23:00
      const hours = Array.from({ length: 16 }).map((_, i) => i + 8); // 8 AM to 23 PM
      return hours.map((hour) => {
        const start = new Date(today);
        start.setHours(hour, 0, 0, 0);
        const end = new Date(today);
        end.setHours(hour, 59, 59, 999);

        const hOrders = orders.filter((o) => o.createdAt >= start.getTime() && o.createdAt <= end.getTime());
        const pos = hOrders.filter((o) => o.source === 'pos').reduce((s, o) => s + o.total, 0);
        const coworking = hOrders.filter((o) => o.source === 'coworking').reduce((s, o) => s + o.total, 0);
        const total = pos + coworking;
        const margin = total * 0.65; // ~65% gross margin

        return {
          label: `${hour}:00`,
          total,
          pos,
          coworking,
          margin,
          orderCount: hOrders.length,
        };
      });
    }

    const numDays = timeframe === '30d' ? 30 : 7;
    return Array.from({ length: numDays }).map((_, idx) => {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() - (numDays - 1 - idx));
      const nextDay = d.getTime() + 86400000;

      const dayOrders = orders.filter((o) => o.createdAt >= d.getTime() && o.createdAt < nextDay);
      const pos = dayOrders.filter((o) => o.source === 'pos').reduce((sum, o) => sum + o.total, 0);
      const coworking = dayOrders.filter((o) => o.source === 'coworking').reduce((sum, o) => sum + o.total, 0);
      const total = pos + coworking;
      const margin = total * 0.68;

      return {
        label: d.toLocaleDateString(lang === 'ar' ? 'ar-EG' : undefined, {
          weekday: numDays === 7 ? 'short' : undefined,
          month: numDays === 30 ? 'numeric' : undefined,
          day: 'numeric',
        }),
        total,
        pos,
        coworking,
        margin,
        orderCount: dayOrders.length,
      };
    });
  }, [timeframe, orders, today, lang]);

  // Mini sparkline for KPI
  const sparklineData = useMemo(() => {
    return Array.from({ length: 7 }).map((_, idx) => {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() - (6 - idx));
      const nextDay = d.getTime() + 86400000;
      const dayTotal = orders
        .filter((o) => o.createdAt >= d.getTime() && o.createdAt < nextDay)
        .reduce((sum, o) => sum + o.total, 0);
      return { val: dayTotal };
    });
  }, [orders]);

  // 2. CATEGORY SHARE (Donut Chart)
  const categoryChartData = useMemo(() => {
    const map: Record<string, number> = {};
    orders.forEach((o) => {
      o.items.forEach((it) => {
        const cat = it.category || 'Specialty Coffee';
        map[cat] = (map[cat] || 0) + it.totalPrice;
      });
    });

    const totalCatRevenue = Object.values(map).reduce((s, v) => s + v, 0) || 1;
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .map(([name, value], i) => ({
        name,
        value,
        percentage: Math.round((value / totalCatRevenue) * 100),
        color: PALETTE[i % PALETTE.length],
      }));
  }, [orders]);

  // 3. HOURLY FOOTFALL & RUSH VELOCITY
  const hourlyRushData = useMemo(() => {
    const hours = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23];
    return hours.map((h) => {
      let count = 0;
      let rev = 0;
      orders.forEach((o) => {
        const orderHour = new Date(o.createdAt).getHours();
        if (orderHour === h) {
          count += 1;
          rev += o.total;
        }
      });

      const isPeak = count >= 4 || h === 10 || h === 11 || h === 18 || h === 19;
      return {
        hour: `${h}:00`,
        orders: count,
        revenue: rev,
        isPeak,
      };
    });
  }, [orders]);

  // 4. TOP 7 BESTSELLING ITEMS (Horizontal Bar Chart)
  const topProductsData = useMemo(() => {
    const itemMap: Record<string, { qty: number; revenue: number; category: string }> = {};
    orders.forEach((o) => {
      o.items.forEach((it) => {
        if (!itemMap[it.name]) {
          itemMap[it.name] = { qty: 0, revenue: 0, category: it.category || 'Beverage' };
        }
        itemMap[it.name].qty += it.qty;
        itemMap[it.name].revenue += it.totalPrice;
      });
    });

    return Object.entries(itemMap)
      .sort((a, b) => b[1].qty - a[1].qty)
      .slice(0, 7)
      .map(([name, stat], idx) => ({
        rank: idx + 1,
        name: name.length > 20 ? `${name.slice(0, 18)}...` : name,
        fullName: name,
        qty: stat.qty,
        revenue: stat.revenue,
        category: stat.category,
      }));
  }, [orders]);

  // 5. COWORKING ZONE OCCUPANCY & UTILIZATION
  const zoneOccupancyData = useMemo(() => {
    const zones: Record<string, { total: number; occupied: number }> = {};
    desks.forEach((d) => {
      const z = d.zone || 'Quiet Zone';
      if (!zones[z]) zones[z] = { total: 0, occupied: 0 };
      zones[z].total += 1;
      const isOcc = sessions.some((s) => s.deskId === d.id && !s.endTime);
      if (isOcc) zones[z].occupied += 1;
    });

    return Object.entries(zones).map(([zone, stats]) => ({
      zone: zone.replace('Zone', '').trim(),
      fullZone: zone,
      total: stats.total,
      occupied: stats.occupied,
      free: stats.total - stats.occupied,
      rate: stats.total > 0 ? Math.round((stats.occupied / stats.total) * 100) : 0,
    }));
  }, [desks, sessions]);

  // 6. PAYMENT METHODS SHARE
  const paymentMethodData = useMemo(() => {
    const map: Record<string, number> = {};
    orders.forEach((o) => {
      const method = o.paymentMethod || 'Cash';
      map[method] = (map[method] || 0) + o.total;
    });
    const total = Object.values(map).reduce((s, v) => s + v, 0) || 1;

    return Object.entries(map).map(([name, value], i) => ({
      name,
      value,
      percentage: Math.round((value / total) * 100),
      color: PALETTE[(i + 2) % PALETTE.length],
    }));
  }, [orders]);

  return (
    <div className="space-y-6 text-zinc-900 pb-16">
      {/* Top Banner & Quick Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-3xl border border-zinc-200 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="p-2 rounded-xl bg-emerald-100 text-emerald-800">
              <BarChart3 size={20} />
            </span>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-zinc-950">
              {t.visualDashboard}
            </h1>
            <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-mono font-bold flex items-center gap-1.5 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              LIVE TELEMETRY
            </span>
          </div>
          <p className="text-xs text-zinc-500">
            {lang === 'ar'
              ? 'مخططات بيانية تفاعلية لمتابعة المبيعات، ساعات الذروة، حركة مساحات العمل، والأصناف الأكثر طلباً.'
              : 'Visual business intelligence, real-time sales curves, rush velocity, and coworking load analytics.'}
          </p>
        </div>

        {/* Timeframe selector and action buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="inline-flex p-1 rounded-2xl bg-zinc-100 border border-zinc-200 shadow-inner">
            <button
              type="button"
              onClick={() => setTimeframe('today')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                timeframe === 'today'
                  ? 'bg-white text-zinc-950 shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-800'
              }`}
            >
              {t.timeframeToday}
            </button>
            <button
              type="button"
              onClick={() => setTimeframe('7d')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                timeframe === '7d'
                  ? 'bg-white text-zinc-950 shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-800'
              }`}
            >
              {t.timeframe7D}
            </button>
            <button
              type="button"
              onClick={() => setTimeframe('30d')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                timeframe === '30d'
                  ? 'bg-white text-zinc-950 shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-800'
              }`}
            >
              {t.timeframe30D}
            </button>
          </div>

          <button
            type="button"
            onClick={() => onNavigate('pos')}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition shadow-sm cursor-pointer"
          >
            <Coffee size={14} /> {lang === 'ar' ? 'الكاشير السريع' : 'New POS Order'}
          </button>
          <button
            type="button"
            onClick={() => onNavigate('coworking')}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs transition shadow-sm cursor-pointer"
          >
            <Armchair size={14} /> {lang === 'ar' ? 'مخطط المكاتب' : '14 Tables Grid'}
          </button>
        </div>
      </div>

      {/* KPI Visual Metric Cards (with integrated sparkline charts & gauges) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Today's Revenue + Sparkline Area */}
        <div className="bg-white border border-zinc-200 rounded-3xl p-5 shadow-xs space-y-2 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
              {lang === 'ar' ? 'مبيعات اليوم' : "Today's Revenue"}
            </span>
            <span className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
              <TrendingUp size={16} />
            </span>
          </div>

          <div className="flex items-baseline justify-between gap-2">
            <div className="text-2xl font-black font-mono text-zinc-950">
              {formatCurrency(todayRevenue)}
            </div>
            <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold">
              {todayOrders.length} orders
            </span>
          </div>

          {/* Mini Sparkline Chart */}
          <div className="h-10 w-full pt-1">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sparklineData}>
                <defs>
                  <linearGradient id="kpiSpark" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#059669" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="#059669" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="val"
                  stroke="#059669"
                  strokeWidth={2}
                  fill="url(#kpiSpark)"
                  dot={false}
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <span className="text-[10px] text-zinc-400 block">7-day continuous trajectory</span>
        </div>

        {/* Metric 2: Desk Occupancy Radial Gauge */}
        <div className="bg-white border border-zinc-200 rounded-3xl p-5 shadow-xs flex items-center justify-between gap-3">
          <div className="space-y-1">
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider block">
              {lang === 'ar' ? 'إشغال المكاتب' : 'Desk Occupancy'}
            </span>
            <div className="text-2xl font-black font-mono text-zinc-950">
              {occupancyRate}%
            </div>
            <span className="text-[11px] text-zinc-500 block">
              {sessions.length} / {desks.length} {lang === 'ar' ? 'طاولة مشغولة' : 'tables active'}
            </span>
          </div>

          {/* Visual Circular Ring */}
          <div className="relative w-16 h-16 shrink-0 flex items-center justify-center">
            <svg className="w-16 h-16 -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-zinc-100"
                strokeWidth="3.8"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-amber-500 transition-all duration-700 ease-out"
                strokeDasharray={`${occupancyRate}, 100`}
                strokeWidth="3.8"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <Armchair size={18} className="absolute text-amber-600" />
          </div>
        </div>

        {/* Metric 3: Average Ticket & Product Mix */}
        <div className="bg-white border border-zinc-200 rounded-3xl p-5 shadow-xs space-y-2 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
              {lang === 'ar' ? 'متوسط الفاتورة' : 'Average Ticket'}
            </span>
            <span className="p-2 rounded-xl bg-blue-50 text-blue-700">
              <Receipt size={16} />
            </span>
          </div>

          <div className="text-2xl font-black font-mono text-zinc-950">
            {formatCurrency(avgOrder)}
          </div>

          {/* Visual Dual Progress Bar (POS vs Coworking) */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[10px] font-bold text-zinc-500">
              <span>POS F&B: 70%</span>
              <span>Coworking: 30%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-zinc-100 flex overflow-hidden">
              <div className="bg-emerald-500 h-full w-[70%]" />
              <div className="bg-amber-500 h-full w-[30%]" />
            </div>
          </div>
        </div>

        {/* Metric 4: Inventory Health Index */}
        <div className="bg-white border border-zinc-200 rounded-3xl p-5 shadow-xs space-y-2 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
              {lang === 'ar' ? 'حالة المخزون' : 'Inventory Health'}
            </span>
            <span
              className={`p-2 rounded-xl ${
                lowStockItems.length > 0
                  ? 'bg-rose-50 text-rose-700'
                  : 'bg-emerald-50 text-emerald-700'
              }`}
            >
              <Boxes size={16} />
            </span>
          </div>

          <div className="flex items-baseline justify-between gap-2">
            <div className="text-2xl font-black font-mono text-zinc-950">
              {menu.length - lowStockItems.length} / {menu.length}
            </div>
            <span
              className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                lowStockItems.length > 0
                  ? 'bg-rose-100 text-rose-800'
                  : 'bg-emerald-100 text-emerald-800'
              }`}
            >
              {lowStockItems.length > 0 ? `${lowStockItems.length} Low` : 'Optimal'}
            </span>
          </div>

          {/* Visual Health Gauge */}
          <div className="w-full h-2 rounded-full bg-zinc-100 overflow-hidden">
            <div
              className={`h-full ${
                lowStockItems.length > 0 ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
              style={{
                width: `${Math.round(((menu.length - lowStockItems.length) / (menu.length || 1)) * 100)}%`,
              }}
            />
          </div>
          <span className="text-[10px] text-zinc-400 block">
            {lowStockItems.length === 0
              ? 'All items above safety threshold'
              : 'Reorder alerts highlighted below'}
          </span>
        </div>
      </div>

      {/* CORE CHART 1: Full-Width Composed Revenue Trajectory & Stream Mix */}
      <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-zinc-950 flex items-center gap-2">
              <Activity size={18} className="text-emerald-600" />
              <span>{t.revenueTrajectory}</span>
            </h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              {lang === 'ar'
                ? 'مقارنة تدفق الإيرادات بين مبيعات القهوة والأطعمة ومساحة العمل المشتركة مع هامش الربح التقديري.'
                : 'Dual-stream breakdown: Coffee & Kitchen POS sales vs Co-Working Space & estimated gross margin.'}
            </p>
          </div>

          {/* Stream Filter Pills */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setStreamFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                streamFilter === 'all'
                  ? 'bg-zinc-950 text-white'
                  : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-600'
              }`}
            >
              {lang === 'ar' ? 'جميع المصادر' : 'All Streams'}
            </button>
            <button
              type="button"
              onClick={() => setStreamFilter('pos')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                streamFilter === 'pos'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
              }`}
            >
              {t.totalSalesStream}
            </button>
            <button
              type="button"
              onClick={() => setStreamFilter('coworking')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                streamFilter === 'coworking'
                  ? 'bg-amber-600 text-white'
                  : 'bg-amber-50 text-amber-900 hover:bg-amber-100'
              }`}
            >
              {t.coworkingSalesStream}
            </button>
          </div>
        </div>

        {/* Large Interactive Chart Container */}
        <div className="h-72 sm:h-80 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={trajectoryData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorPos" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#059669" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#059669" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorCoworking" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#D97706" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#D97706" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorMargin" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563EB" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#2563EB" stopOpacity={0.0} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: '#64748B' }}
                axisLine={{ stroke: '#E2E8F0' }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#64748B' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(val) => `${val}`}
              />
              <Tooltip
                formatter={(value: any, name: any) => [
                  `EGP ${Number(value).toFixed(2)}`,
                  name === 'pos'
                    ? (lang === 'ar' ? 'مبيعات الكاشير والمشروبات' : 'POS F&B Sales')
                    : name === 'coworking'
                    ? (lang === 'ar' ? 'مساحة العمل المشتركة' : 'Co-Working Space')
                    : name === 'margin'
                    ? (lang === 'ar' ? 'هامش الربح التقديري' : 'Est. Gross Margin')
                    : (lang === 'ar' ? 'إجمالي الإيرادات' : 'Total Revenue'),
                ]}
                contentStyle={{
                  borderRadius: 16,
                  border: '1px solid #E2E8F0',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                  fontSize: 12,
                  fontWeight: 600,
                }}
              />
              <Legend
                verticalAlign="top"
                align="right"
                iconType="circle"
                wrapperStyle={{ fontSize: 11, paddingBottom: 8 }}
              />

              {(streamFilter === 'all' || streamFilter === 'pos') && (
                <Bar
                  dataKey="pos"
                  name={t.totalSalesStream}
                  fill="#059669"
                  radius={[6, 6, 0, 0]}
                  barSize={18}
                />
              )}

              {(streamFilter === 'all' || streamFilter === 'coworking') && (
                <Bar
                  dataKey="coworking"
                  name={t.coworkingSalesStream}
                  fill="#D97706"
                  radius={[6, 6, 0, 0]}
                  barSize={18}
                />
              )}

              {streamFilter === 'all' && (
                <Area
                  type="monotone"
                  dataKey="total"
                  name={lang === 'ar' ? 'إجمالي المبيعات' : 'Total Revenue'}
                  stroke="#1E293B"
                  strokeWidth={2.5}
                  fill="url(#colorMargin)"
                />
              )}

              <Line
                type="monotone"
                dataKey="margin"
                name={t.netProfitStream}
                stroke="#2563EB"
                strokeWidth={2}
                strokeDasharray="4 4"
                dot={{ r: 3, fill: '#2563EB' }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ROW 2: CATEGORY DONUT CHART & HOURLY RUSH BAR CHART */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Donut Chart: Menu Category Revenue Mix (5 cols) */}
        <div className="lg:col-span-5 bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-zinc-950 flex items-center gap-2">
                <PieChartIcon size={16} className="text-emerald-600" />
                <span>{t.categoryMix}</span>
              </h3>
              <p className="text-xs text-zinc-500">Revenue split across F&B catalogues</p>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-600">
              {categoryChartData.length} Categories
            </span>
          </div>

          <div className="h-56 relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {categoryChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: any) => [`EGP ${Number(val).toFixed(2)}`, 'Sales']}
                  contentStyle={{
                    borderRadius: 12,
                    border: '1px solid #E2E8F0',
                    fontSize: 11,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* Centered Total Readout */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[10px] uppercase font-bold text-zinc-400">Total F&B</span>
              <span className="text-sm font-black font-mono text-zinc-900">
                EGP {categoryChartData.reduce((s, c) => s + c.value, 0).toFixed(0)}
              </span>
            </div>
          </div>

          {/* Interactive Legend List */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-zinc-100 text-xs">
            {categoryChartData.slice(0, 4).map((cat, idx) => (
              <div key={idx} className="flex items-center justify-between p-2 rounded-xl bg-zinc-50 border border-zinc-100">
                <div className="flex items-center gap-1.5 truncate">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                  <span className="truncate text-zinc-700 font-medium">{cat.name}</span>
                </div>
                <span className="font-mono font-bold text-zinc-900 shrink-0">{cat.percentage}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bar Chart: Peak Hours Footfall Velocity (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-zinc-950 flex items-center gap-2">
                <Flame size={16} className="text-amber-500" />
                <span>{t.peakHoursFlow}</span>
              </h3>
              <p className="text-xs text-zinc-500">Order traffic & rush velocity across daily operating hours</p>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-bold">
              <span className="flex items-center gap-1 text-amber-700">
                <span className="w-2 h-2 rounded-full bg-amber-500" /> Rush Hours
              </span>
              <span className="flex items-center gap-1 text-emerald-700">
                <span className="w-2 h-2 rounded-full bg-emerald-500" /> Regular
              </span>
            </div>
          </div>

          <div className="h-60 w-full pt-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hourlyRushData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis
                  dataKey="hour"
                  tick={{ fontSize: 10, fill: '#64748B' }}
                  axisLine={{ stroke: '#E2E8F0' }}
                  tickLine={false}
                />
                <YAxis tick={{ fontSize: 10, fill: '#64748B' }} axisLine={false} tickLine={false} />
                <Tooltip
                  formatter={(val: any, name: any) => [
                    name === 'orders' ? `${val} orders` : `EGP ${Number(val).toFixed(2)}`,
                    name === 'orders' ? 'Order Volume' : 'Revenue',
                  ]}
                  contentStyle={{
                    borderRadius: 12,
                    border: '1px solid #E2E8F0',
                    fontSize: 11,
                  }}
                />
                <Bar dataKey="orders" name={t.orderVolume} radius={[6, 6, 0, 0]}>
                  {hourlyRushData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.isPeak ? '#D97706' : '#059669'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs text-amber-950 flex items-center justify-between">
            <span className="font-bold">Peak Rush Window: 10:00 - 11:30 & 18:00 - 20:00</span>
            <span className="text-[11px] font-mono text-amber-800">Recommend +1 Barista scheduled</span>
          </div>
        </div>
      </div>

      {/* ROW 3: TOP 7 PRODUCTS HORIZONTAL CHART & COWORKING ZONE LOAD */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Horizontal Bar Chart: Top 7 Menu Performers (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-zinc-950 flex items-center gap-2">
                <Award size={16} className="text-amber-500" />
                <span>{t.topProductsChart}</span>
              </h3>
              <p className="text-xs text-zinc-500">Ranked by volume sold and revenue generated</p>
            </div>
            <button
              onClick={() => onNavigate('pos')}
              className="text-xs text-emerald-700 hover:text-emerald-900 font-bold flex items-center gap-1 cursor-pointer"
            >
              Menu <ArrowUpRight size={13} />
            </button>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={topProductsData}
                margin={{ top: 5, right: 20, left: 40, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10, fill: '#64748B' }} axisLine={false} tickLine={false} />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fontSize: 11, fill: '#1E293B', fontWeight: 600 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  formatter={(val: any, name: any) => [
                    name === 'qty' ? `${val} cups/items` : `EGP ${Number(val).toFixed(2)}`,
                    name === 'qty' ? 'Units Sold' : 'Gross Revenue',
                  ]}
                  contentStyle={{
                    borderRadius: 12,
                    border: '1px solid #E2E8F0',
                    fontSize: 11,
                  }}
                />
                <Bar dataKey="qty" name={t.unitsSold} fill="#059669" radius={[0, 6, 6, 0]} barSize={14} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Coworking Zone Utilization & Capacity (5 cols) */}
        <div className="lg:col-span-5 bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-zinc-950 flex items-center gap-2">
                <Armchair size={16} className="text-amber-600" />
                <span>{t.zoneUtilizationChart}</span>
              </h3>
              <p className="text-xs text-zinc-500">Occupancy rate across 14 tables</p>
            </div>
            <button
              onClick={() => onNavigate('coworking')}
              className="text-xs text-emerald-700 hover:text-emerald-900 font-bold flex items-center gap-1 cursor-pointer"
            >
              Floor Plan <ArrowUpRight size={13} />
            </button>
          </div>

          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={zoneOccupancyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="zone" tick={{ fontSize: 10, fill: '#64748B' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#64748B' }} axisLine={false} tickLine={false} />
                <Tooltip
                  formatter={(val: any, name: any) => [
                    `${val} desks`,
                    name === 'occupied' ? 'Occupied' : 'Free Capacity',
                  ]}
                  contentStyle={{ borderRadius: 12, border: '1px solid #E2E8F0', fontSize: 11 }}
                />
                <Bar dataKey="occupied" name="Occupied" stackId="a" fill="#D97706" />
                <Bar dataKey="free" name="Available" stackId="a" fill="#E2E8F0" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2 pt-2 border-t border-zinc-100 text-xs">
            {zoneOccupancyData.map((z, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <span className="font-semibold text-zinc-700">{z.fullZone}</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-zinc-500">{z.occupied}/{z.total} occupied</span>
                  <span className="font-mono font-bold text-amber-700 px-1.5 py-0.5 rounded bg-amber-50 border border-amber-200 text-[10px]">
                    {z.rate}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ROW 4: PAYMENT METHODS SHARE + LIVE DESK OPERATION STATUS CARDS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Payment Methods Chart (4 cols) */}
        <div className="lg:col-span-4 bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-zinc-950 flex items-center gap-2">
              <DollarSign size={16} className="text-emerald-600" />
              <span>{t.paymentMethodsChart}</span>
            </h3>
            <p className="text-xs text-zinc-500">Digital Wallet vs Cash settlement share</p>
          </div>

          <div className="h-44 relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={paymentMethodData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={65}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {paymentMethodData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: any) => [`EGP ${Number(val).toFixed(2)}`, 'Collected']}
                  contentStyle={{ borderRadius: 12, border: '1px solid #E2E8F0', fontSize: 11 }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1.5 pt-2 border-t border-zinc-100">
            {paymentMethodData.map((pm, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: pm.color }} />
                  <span className="text-zinc-700 font-medium">{pm.name}</span>
                </div>
                <span className="font-mono font-bold text-zinc-900">{pm.percentage}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Live Coworking Desks Floor Snapshot (8 cols) */}
        <div className="lg:col-span-8 bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-zinc-950 flex items-center gap-2">
                <Armchair size={16} className="text-amber-500" />
                <span>{t.visualInsights}</span>
              </h3>
              <p className="text-xs text-zinc-500">Live table sessions, timers & instant billing</p>
            </div>
            <button
              onClick={() => onNavigate('coworking')}
              className="text-xs text-emerald-700 hover:text-emerald-900 font-bold flex items-center gap-1 cursor-pointer"
            >
              All 14 Tables <ArrowUpRight size={13} />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {desks.slice(0, 4).map((desk) => {
              const session = sessions.find((s) => s.deskId === desk.id && !s.endTime);
              const isOccupied = !!session;
              const customer = isOccupied ? customers.find((c) => c.id === session.customerId) : null;
              const mins = session ? Math.floor((Date.now() - session.startTime) / 60000) : 0;
              const hrs = Math.floor(mins / 60);
              const remMins = mins % 60;

              return (
                <div
                  key={desk.id}
                  className={`p-3.5 rounded-2xl border transition flex flex-col justify-between space-y-2.5 text-xs ${
                    isOccupied
                      ? 'bg-amber-50/70 border-amber-300 ring-1 ring-amber-400/20'
                      : 'bg-zinc-50 border-zinc-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-bold text-zinc-900 flex items-center gap-1.5">
                        <span className="font-mono text-[10px] text-zinc-400">{desk.code}</span>
                        <span className="truncate max-w-[90px]">{desk.name}</span>
                      </div>
                      <span className="text-[10px] text-zinc-500">{desk.zone}</span>
                    </div>
                    <span
                      className={`px-2 py-0.5 text-[9px] font-bold rounded-full uppercase ${
                        isOccupied ? 'bg-amber-200 text-amber-900' : 'bg-emerald-100 text-emerald-900'
                      }`}
                    >
                      {isOccupied ? 'Active' : 'Free'}
                    </span>
                  </div>

                  {isOccupied ? (
                    <div className="pt-2 border-t border-amber-200/80 space-y-1.5">
                      <div className="text-[11px] text-zinc-700 font-semibold truncate">
                        {customer?.name || 'Patron'}
                      </div>
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="font-mono text-amber-900 font-bold">{hrs}h {remMins}m</span>
                        <button
                          type="button"
                          onClick={() => session && onEndSession(session.id)}
                          className="px-2 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-[10px] cursor-pointer"
                        >
                          Checkout
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="pt-2 border-t border-zinc-200 flex items-center justify-between">
                      <span className="font-mono text-[11px] text-zinc-500">EGP {desk.rate}/hr</span>
                      <button
                        type="button"
                        onClick={() => onSelectDeskForSession(desk)}
                        className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] cursor-pointer"
                      >
                        Check-in
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* OPTIONAL EXPANDABLE FINANCIAL LEDGER & AUDIT SUMMARY */}
      <div className="border border-zinc-200 rounded-3xl bg-white overflow-hidden shadow-xs">
        <button
          type="button"
          onClick={() => setShowLedgerSection(!showLedgerSection)}
          className="w-full p-5 flex items-center justify-between bg-zinc-50/80 hover:bg-zinc-100 transition cursor-pointer text-start"
        >
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-xl bg-zinc-900 text-white">
              <Receipt size={16} />
            </span>
            <div>
              <h3 className="text-sm font-bold text-zinc-950">
                {lang === 'ar' ? 'ملخص الإيرادات والمطابقة المالية التفصيلية (PDF / Excel)' : 'Detailed Financial Ledger & Export Center'}
              </h3>
              <p className="text-xs text-zinc-500">
                {lang === 'ar'
                  ? 'عرض جداول الفواتير التفصيلية، حساب التكاليف والأرباح الصافية، وتصدير التقارير.'
                  : 'Reconciliation tables, tax summaries, cost of goods sold, and certified export reports.'}
              </p>
            </div>
          </div>
          <ChevronDown
            size={18}
            className={`text-zinc-500 transition-transform duration-200 ${showLedgerSection ? 'rotate-180' : ''}`}
          />
        </button>

        {showLedgerSection && (
          <div className="p-6 border-t border-zinc-200">
            <DailyRevenueSummary
              invoices={invoices}
              orders={orders}
              menu={menu}
              onNavigate={onNavigate}
              onViewReceipt={onViewReceipt}
            />
          </div>
        )}
      </div>
    </div>
  );
};
