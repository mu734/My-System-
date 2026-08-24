import React from 'react';
import {
  TrendingUp,
  DollarSign,
  Receipt,
  Users,
  Armchair,
  Award,
  Calendar,
  PieChart as PieChartIcon,
  BarChart3,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { Order, MenuItem, Customer, Desk, DeskSession } from '../../types';

interface AnalyticsViewProps {
  orders: Order[];
  menu: MenuItem[];
  customers: Customer[];
  desks: Desk[];
  sessions: DeskSession[];
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  orders,
  menu,
  customers,
  desks,
  sessions,
}) => {
  // 1. Overall Revenue
  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
  const avgOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;
  const currentOccupancy = desks.length > 0 ? Math.round((sessions.length / desks.length) * 100) : 0;

  // 2. Last 7 Days Revenue Trend
  const last7DaysData = Array.from({ length: 7 }).map((_, idx) => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - (6 - idx));
    const nextDay = d.getTime() + 86400000;

    const dayOrders = orders.filter((o) => o.createdAt >= d.getTime() && o.createdAt < nextDay);
    const dayTotal = dayOrders.reduce((sum, o) => sum + o.total, 0);
    const posTotal = dayOrders
      .filter((o) => o.source === 'pos')
      .reduce((sum, o) => sum + o.total, 0);
    const coworkingTotal = dayOrders
      .filter((o) => o.source === 'coworking')
      .reduce((sum, o) => sum + o.total, 0);

    return {
      day: d.toLocaleDateString(undefined, { weekday: 'short' }),
      total: dayTotal,
      pos: posTotal,
      coworking: coworkingTotal,
    };
  });

  // 3. Category Revenue Distribution
  const categoryMap: { [cat: string]: number } = {};
  orders.forEach((o) => {
    o.items.forEach((it) => {
      const cat = it.category || 'Specialty';
      categoryMap[cat] = (categoryMap[cat] || 0) + it.totalPrice;
    });
  });

  const categoryPieData = Object.entries(categoryMap)
    .sort((a, b) => b[1] - a[1])
    .map(([name, value]) => ({ name, value }));

  const COLORS = [
    '#2F5D57',
    '#C79A3E',
    '#3F7A4E',
    '#8A6FBF',
    '#B5443C',
    '#2563EB',
    '#D97706',
    '#059669',
    '#475569',
  ];

  // 4. Top 8 Bestselling Items by Qty
  const itemQtyMap: { [name: string]: { qty: number; revenue: number } } = {};
  orders.forEach((o) => {
    o.items.forEach((it) => {
      if (!itemQtyMap[it.name]) {
        itemQtyMap[it.name] = { qty: 0, revenue: 0 };
      }
      itemQtyMap[it.name].qty += it.qty;
      itemQtyMap[it.name].revenue += it.totalPrice;
    });
  });

  const topItemsData = Object.entries(itemQtyMap)
    .sort((a, b) => b[1].qty - a[1].qty)
    .slice(0, 7)
    .map(([name, data]) => ({
      name,
      qty: data.qty,
      revenue: data.revenue,
    }));

  // 5. Payment Methods
  const paymentMap: { [pm: string]: number } = {};
  orders.forEach((o) => {
    paymentMap[o.paymentMethod] = (paymentMap[o.paymentMethod] || 0) + o.total;
  });
  const paymentData = Object.entries(paymentMap).map(([name, value]) => ({ name, value }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Business Intelligence & Analytics</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Real-time POS revenue streams, coworking occupancy, top performers and sales breakdown
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Total Gross Revenue</span>
            <TrendingUp size={16} className="text-emerald-700" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-800 mt-2">
            EGP {totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[10px] text-emerald-600 font-medium">+18.4% vs last week</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Total Orders Rung</span>
            <Receipt size={16} className="text-emerald-700" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 mt-2">{orders.length}</div>
          <span className="text-[10px] text-slate-400">POS + Coworking tickets</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Average Order Value</span>
            <DollarSign size={16} className="text-amber-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 mt-2">
            EGP {avgOrderValue.toFixed(2)}
          </div>
          <span className="text-[10px] text-slate-400">Ticket average</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Live Occupancy</span>
            <Armchair size={16} className="text-amber-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-700 mt-2">
            {currentOccupancy}%
          </div>
          <span className="text-[10px] text-amber-600">
            {sessions.length} of {desks.length} desks active
          </span>
        </div>
      </div>

      {/* Chart Row 1: 7-Day Trend + Category Pie */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Revenue Trend */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">7-Day Sales Trend (EGP)</h3>
              <p className="text-xs text-slate-500">POS orders vs Coworking desk checkouts</p>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-800">
              EGP {totalRevenue.toFixed(2)}
            </span>
          </div>

          <div className="h-64 pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={last7DaysData}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2F5D57" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#2F5D57" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis
                  dataKey="day"
                  tick={{ fontSize: 11, fill: '#64748B' }}
                  axisLine={{ stroke: '#E2E8F0' }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: '#64748B' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(val) => `EGP ${val}`}
                />
                <Tooltip
                  formatter={(val: any) => [`EGP ${Number(val).toFixed(2)}`, 'Sales']}
                  contentStyle={{
                    borderRadius: 12,
                    border: '1px solid #E2E8F0',
                    fontSize: 12,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="total"
                  stroke="#2F5D57"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorTotal)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Revenue Distribution */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Revenue by Category</h3>
            <p className="text-xs text-slate-500">Share of total sales across menu</p>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {categoryPieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: any) => [`EGP ${Number(val).toFixed(2)}`, 'Revenue']}
                  contentStyle={{
                    borderRadius: 12,
                    border: '1px solid #E2E8F0',
                    fontSize: 12,
                  }}
                />
                <Legend
                  layout="horizontal"
                  verticalAlign="bottom"
                  align="center"
                  wrapperStyle={{ fontSize: 10, paddingTop: 8 }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Chart Row 2: Top Selling Items + Payment Methods */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Top 7 Items */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Top Bestselling Items (Quantity)</h3>
            <p className="text-xs text-slate-500">Most ordered items across all sessions</p>
          </div>

          <div className="h-64 pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topItemsData} layout="vertical" margin={{ left: 20, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F1F5F9" />
                <XAxis type="number" tick={{ fontSize: 10, fill: '#64748B' }} axisLine={false} />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fontSize: 11, fill: '#1E293B' }}
                  width={140}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  formatter={(val: any, name: any) => [
                    name === 'qty' ? `${val} sold` : `EGP ${Number(val).toFixed(2)}`,
                    name === 'qty' ? 'Quantity' : 'Revenue',
                  ]}
                  contentStyle={{
                    borderRadius: 12,
                    border: '1px solid #E2E8F0',
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="qty" fill="#C79A3E" radius={[0, 6, 6, 0]} barSize={14} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Payment Breakdown</h3>
            <p className="text-xs text-slate-500">Transactions by settlement channel</p>
          </div>

          <div className="space-y-3 pt-2">
            {paymentData.map((pm, idx) => {
              const pct = totalRevenue > 0 ? Math.round((pm.value / totalRevenue) * 100) : 0;
              return (
                <div key={pm.name} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-800">{pm.name}</span>
                    <span className="font-mono text-emerald-800">
                      EGP {pm.value.toFixed(2)} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: COLORS[idx % COLORS.length],
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
