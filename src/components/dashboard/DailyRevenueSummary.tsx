import React, { useState, useMemo } from 'react';
import {
  DollarSign,
  Receipt,
  Armchair,
  Coffee,
  TrendingUp,
  Percent,
  Boxes,
  ArrowUpRight,
  Eye,
  CheckCircle2,
  Clock,
  Filter,
  CreditCard,
  Wallet,
  Banknote,
  Sparkles,
  PieChart,
  ShieldCheck,
  ChevronRight,
  FileDown,
  FileSpreadsheet,
  Calendar,
  Layers,
  Wifi,
} from 'lucide-react';
import { Invoice, Order, MenuItem, AppTab } from '../../types';
import { useLanguage } from '../../i18n/LanguageContext';
import {
  computeFinancialReport,
  exportReportToPDF,
  exportReportToExcel,
  ReportPeriod,
  buildReportOptions,
} from '../../services/reportExportService';

interface DailyRevenueSummaryProps {
  invoices: Invoice[];
  orders: Order[];
  menu: MenuItem[];
  onNavigate: (tab: AppTab) => void;
  onViewReceipt: (order: Order) => void;
}

export const DailyRevenueSummary: React.FC<DailyRevenueSummaryProps> = ({
  invoices,
  orders,
  menu,
  onNavigate,
  onViewReceipt,
}) => {
  const { lang, t, formatCurrency } = useLanguage();
  const [timeframe, setTimeframe] = useState<ReportPeriod>('daily');
  const [filterSource, setFilterSource] = useState<'all' | 'coworking' | 'pos' | 'paid' | 'unpaid'>('all');
  
  // Custom Date Range state (defaults to today and 7 days ago)
  const [startDateStr, setStartDateStr] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() - 6);
    return d.toISOString().split('T')[0];
  });
  const [endDateStr, setEndDateStr] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });

  const [isExporting, setIsExporting] = useState<'pdf' | 'excel' | null>(null);

  // Compute financial report utilizing the centralized report service
  const reportData = useMemo(() => {
    const customStart = timeframe === 'custom' && startDateStr ? new Date(`${startDateStr}T00:00:00`).getTime() : undefined;
    const customEnd = timeframe === 'custom' && endDateStr ? new Date(`${endDateStr}T23:59:59.999`).getTime() : undefined;

    const options = buildReportOptions(timeframe, customStart, customEnd, 'all');
    return computeFinancialReport(invoices, menu, options);
  }, [invoices, menu, timeframe, startDateStr, endDateStr]);

  const coworkingSharePercent = reportData.totalSales > 0 ? (reportData.coworkingIncome / reportData.totalSales) * 100 : 0;
  const posSharePercent = reportData.totalSales > 0 ? (reportData.posSales / reportData.totalSales) * 100 : 0;
  const cogsSharePercent = reportData.totalSales > 0 ? (reportData.totalCOGS / reportData.totalSales) * 100 : 0;

  // Filter detailed items for the reconciliation ledger table based on sub-tab
  const filteredInvoiceRecords = useMemo(() => {
    return reportData.detailedInvoices.filter((item) => {
      const isCoworking = item.source.toLowerCase().includes('coworking') || item.source.toLowerCase().includes('table');
      if (filterSource === 'coworking') return isCoworking;
      if (filterSource === 'pos') return !isCoworking;
      if (filterSource === 'paid') return item.status === 'PAID';
      if (filterSource === 'unpaid') return item.status === 'UNPAID';
      return true;
    });
  }, [reportData.detailedInvoices, filterSource]);

  const handleExportPDF = () => {
    setIsExporting('pdf');
    try {
      exportReportToPDF(reportData, 'WhiteTable_Revenue_Report');
    } catch (e) {
      console.error('PDF Export Error:', e);
    } finally {
      setIsExporting(null);
    }
  };

  const handleExportExcel = () => {
    setIsExporting('excel');
    try {
      exportReportToExcel(reportData, 'WhiteTable_Revenue_Report');
    } catch (e) {
      console.error('Excel Export Error:', e);
    } finally {
      setIsExporting(null);
    }
  };

  const handleViewReceiptFromInvoiceNumber = (invNum: string) => {
    const rawInv = invoices.find((i) => i.invoiceNumber === invNum);
    if (!rawInv) return;
    const matchedOrder = orders.find((o) => o.id === rawInv.orderId);
    if (matchedOrder) {
      onViewReceipt(matchedOrder);
    } else {
      const fallbackOrder: Order = {
        id: rawInv.orderId || rawInv.id,
        source: rawInv.source === 'coworking' ? 'coworking' : 'pos',
        label: rawInv.label || 'Customer Invoice',
        customerId: rawInv.customerId,
        items: rawInv.items,
        subtotal: rawInv.subtotal,
        tax: rawInv.tax,
        discount: rawInv.discount,
        total: rawInv.total,
        paymentMethod: (rawInv.paymentMethod as any) || 'Cash',
        status: 'completed',
        createdAt: rawInv.date,
      };
      onViewReceipt(fallbackOrder);
    }
  };

  const handleViewReceiptFromInvoice = (inv: Invoice) => {
    const matchedOrder = orders.find((o) => o.id === inv.orderId);
    if (matchedOrder) {
      onViewReceipt(matchedOrder);
    } else {
      const fallbackOrder: Order = {
        id: inv.orderId || inv.id,
        source: inv.source === 'coworking' ? 'coworking' : 'pos',
        label: inv.label || 'Customer Invoice',
        customerId: inv.customerId,
        items: inv.items,
        subtotal: inv.subtotal,
        tax: inv.tax,
        discount: inv.discount,
        total: inv.total,
        paymentMethod: (inv.paymentMethod as any) || 'Cash',
        status: 'completed',
        createdAt: inv.date,
      };
      onViewReceipt(fallbackOrder);
    }
  };

  return (
    <div className="bg-white border border-zinc-200/90 rounded-2xl p-5 sm:p-6 shadow-2xs space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-zinc-100">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200/80 shadow-2xs">
            <DollarSign size={22} className="stroke-[2.2]" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-lg font-bold text-zinc-950 tracking-tight">
                {t.dailyRevenueSummary}
              </h3>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                {lang === 'ar' ? '14 طاولة + كافيه' : '14 Tables & Cafe'}
              </span>
              <span className="text-[11px] font-semibold text-zinc-500 font-mono">
                [{reportData.periodLabel}]
              </span>
            </div>
            <p className="text-xs text-zinc-500 mt-0.5">
              {t.dailyRevenueSubtitle}
            </p>
          </div>
        </div>

        {/* Action Controls: Timeframe Pills & Export Buttons */}
        <div className="flex flex-wrap items-center gap-2 self-start lg:self-auto">
          {/* Timeframe selector */}
          <div className="inline-flex items-center p-1 bg-zinc-100 rounded-xl border border-zinc-200/80 text-xs font-semibold">
            {(
              [
                { id: 'daily', label: t.periodDaily },
                { id: 'weekly', label: t.periodWeekly },
                { id: 'monthly', label: t.periodMonthly },
                { id: 'custom', label: t.periodCustom },
              ] as { id: ReportPeriod; label: string }[]
            ).map((tf) => (
              <button
                key={tf.id}
                type="button"
                onClick={() => setTimeframe(tf.id)}
                className={`px-2.5 py-1.5 rounded-lg transition cursor-pointer ${
                  timeframe === tf.id
                    ? 'bg-white text-emerald-950 shadow-2xs font-bold'
                    : 'text-zinc-600 hover:text-zinc-950'
                }`}
              >
                {tf.label}
              </button>
            ))}
          </div>

          {/* PDF Export Button */}
          <button
            type="button"
            onClick={handleExportPDF}
            disabled={isExporting !== null || reportData.invoicesCount === 0}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-900 font-bold text-xs transition cursor-pointer shadow-2xs disabled:opacity-50"
            title="Download PDF Financial Report"
          >
            <FileDown size={14} className="text-rose-700" />
            <span>{t.exportPdfReport}</span>
          </button>

          {/* Excel Export Button */}
          <button
            type="button"
            onClick={handleExportExcel}
            disabled={isExporting !== null || reportData.invoicesCount === 0}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 font-bold text-xs transition cursor-pointer shadow-2xs disabled:opacity-50"
            title="Download Excel / CSV Spreadsheet"
          >
            <FileSpreadsheet size={14} className="text-emerald-700" />
            <span>{t.exportExcelReport}</span>
          </button>

          {/* Invoices View Link */}
          <button
            type="button"
            onClick={() => onNavigate('invoices')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 text-zinc-700 font-semibold text-xs transition cursor-pointer"
          >
            <Receipt size={13} />
            <span>{t.invoicesTitle}</span>
            <ArrowUpRight size={12} className="text-zinc-400" />
          </button>
        </div>
      </div>

      {/* Custom Date Range Picker Bar (Shown when timeframe === 'custom') */}
      {timeframe === 'custom' && (
        <div className="p-3.5 bg-zinc-50 rounded-xl border border-zinc-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-zinc-700 font-bold">
            <Calendar size={15} className="text-emerald-700" />
            <span>{lang === 'ar' ? 'تحديد الفترة الزمنية للتقرير المخصص:' : 'Select Custom Date Range for Report:'}</span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5">
              <label className="text-zinc-500 font-medium text-[11px]">{t.startDate}:</label>
              <input
                type="date"
                value={startDateStr}
                onChange={(e) => setStartDateStr(e.target.value)}
                className="px-2.5 py-1 bg-white border border-zinc-300 rounded-lg text-xs font-mono font-bold text-zinc-900 focus:outline-none focus:border-emerald-600"
              />
            </div>

            <div className="flex items-center gap-1.5">
              <label className="text-zinc-500 font-medium text-[11px]">{t.endDate}:</label>
              <input
                type="date"
                value={endDateStr}
                onChange={(e) => setEndDateStr(e.target.value)}
                className="px-2.5 py-1 bg-white border border-zinc-300 rounded-lg text-xs font-mono font-bold text-zinc-900 focus:outline-none focus:border-emerald-600"
              />
            </div>

            <span className="text-[11px] text-zinc-500 font-mono">
              ({reportData.invoicesCount} {lang === 'ar' ? 'فواتير في هذه الفترة' : 'invoices in range'})
            </span>
          </div>
        </div>
      )}

      {/* Main 4 KPI Highlight Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Total Sales */}
        <div className="bg-gradient-to-br from-emerald-50/70 via-white to-white border border-emerald-200/80 rounded-2xl p-4 sm:p-5 shadow-2xs relative overflow-hidden">
          <div className="flex items-center justify-between text-xs font-semibold text-emerald-900">
            <span className="flex items-center gap-1.5">
              <Receipt size={15} className="text-emerald-700" />
              {t.totalDailySales}
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-200/60 text-emerald-950 font-mono">
              {reportData.invoicesCount} {lang === 'ar' ? 'فاتورة' : 'inv'}
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-emerald-900 mt-2.5 tracking-tight">
            {formatCurrency(reportData.totalSales)}
          </div>
          <div className="flex flex-col gap-1 mt-2.5 pt-2.5 border-t border-emerald-100 text-[11px] text-emerald-800/90">
            <div className="flex items-center justify-between">
              <span className="text-zinc-500">{lang === 'ar' ? 'المحصل والمدفوع' : 'Paid & Collected'}:</span>
              <span className="font-mono font-bold text-emerald-900">{formatCurrency(reportData.totalPaid)}</span>
            </div>
            {reportData.totalUnpaid > 0 && (
              <div className="flex items-center justify-between text-amber-700">
                <span>{lang === 'ar' ? 'معلق / غير مسدد' : 'Unpaid Tabs'}:</span>
                <span className="font-mono font-bold">{formatCurrency(reportData.totalUnpaid)}</span>
              </div>
            )}
            <div className="flex items-center justify-between text-[10px] text-zinc-400">
              <span>14% VAT: {formatCurrency(reportData.totalTax)}</span>
              <span>{lang === 'ar' ? 'الخصومات' : 'Disc'}: {formatCurrency(reportData.totalDiscounts)}</span>
            </div>
          </div>
        </div>

        {/* 2. Total Coworking Tables Income (100 EGP/hr across 14 tables) */}
        <div className="bg-gradient-to-br from-amber-50/70 via-white to-white border border-amber-200/80 rounded-2xl p-4 sm:p-5 shadow-2xs">
          <div className="flex items-center justify-between text-xs font-semibold text-amber-950">
            <span className="flex items-center gap-1.5">
              <Armchair size={15} className="text-amber-600" />
              {t.coworkingIncome}
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 font-mono">
              {coworkingSharePercent.toFixed(0)}% {lang === 'ar' ? 'من الإجمالي' : 'share'}
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-amber-900 mt-2.5 tracking-tight">
            {formatCurrency(reportData.coworkingIncome)}
          </div>
          <div className="flex flex-col gap-1 mt-2.5 pt-2.5 border-t border-amber-100 text-[11px] text-amber-900/80">
            <div className="flex items-center justify-between">
              <span className="text-zinc-500">{lang === 'ar' ? '14 طاولة عمل (100 ج.م/س)' : '14 Work Tables'}:</span>
              <span className="font-mono font-bold text-amber-900">
                {reportData.detailedInvoices.filter((d) => d.source.toLowerCase().includes('coworking') || d.source.toLowerCase().includes('table')).length} {lang === 'ar' ? 'جلسة' : 'sessions'}
              </span>
            </div>
            <div className="flex items-center justify-between text-[10px] text-zinc-400">
              <span>{lang === 'ar' ? 'طاولات العمل وغرف الاجتماعات' : 'Tables T-01 to T-14'}</span>
              <span className="font-semibold text-emerald-700">100% Margin</span>
            </div>
          </div>
        </div>

        {/* 3. Total F&B / POS Sales */}
        <div className="bg-gradient-to-br from-blue-50/60 via-white to-white border border-blue-200/80 rounded-2xl p-4 sm:p-5 shadow-2xs">
          <div className="flex items-center justify-between text-xs font-semibold text-blue-950">
            <span className="flex items-center gap-1.5">
              <Coffee size={15} className="text-blue-600" />
              {t.posSales}
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-900 font-mono">
              {posSharePercent.toFixed(0)}% {lang === 'ar' ? 'من الإجمالي' : 'share'}
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-blue-900 mt-2.5 tracking-tight">
            {formatCurrency(reportData.posSales)}
          </div>
          <div className="flex flex-col gap-1 mt-2.5 pt-2.5 border-t border-blue-100 text-[11px] text-blue-900/80">
            <div className="flex items-center justify-between">
              <span className="text-zinc-500">{t.costOfGoods}:</span>
              <span className="font-mono font-bold text-rose-700">{formatCurrency(reportData.totalCOGS)}</span>
            </div>
            <div className="flex items-center justify-between text-[10px] text-zinc-400">
              <span>{lang === 'ar' ? 'القهوة المختصة والمأكولات وباقات WiFi' : 'Specialty Coffee, WiFi Cards & Kitchen'}</span>
              <span>{cogsSharePercent.toFixed(0)}% COGS</span>
            </div>
          </div>
        </div>

        {/* 4. Calculated Net Profit */}
        <div className="bg-gradient-to-br from-purple-50/70 via-white to-white border border-purple-200/80 rounded-2xl p-4 sm:p-5 shadow-2xs">
          <div className="flex items-center justify-between text-xs font-semibold text-purple-950">
            <span className="flex items-center gap-1.5">
              <TrendingUp size={15} className="text-purple-600" />
              {t.netProfit}
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-900 font-mono">
              {reportData.netProfitMargin.toFixed(1)}% {lang === 'ar' ? 'صافي' : 'Margin'}
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-purple-950 mt-2.5 tracking-tight">
            {formatCurrency(reportData.netProfit)}
          </div>
          <div className="flex flex-col gap-1 mt-2.5 pt-2.5 border-t border-purple-100 text-[11px] text-purple-900/80">
            <div className="flex items-center justify-between">
              <span className="text-zinc-500">{lang === 'ar' ? 'الإيرادات بعد الخصم' : 'Net Sales Revenue'}:</span>
              <span className="font-mono font-bold text-zinc-800">
                {formatCurrency(reportData.totalSubtotal - reportData.totalDiscounts)}
              </span>
            </div>
            <div className="flex items-center justify-between text-[10px] text-zinc-400">
              <span>{lang === 'ar' ? 'مخصوم منها تكاليف المخزون' : 'Less direct ingredient COGS'}</span>
              <span className="font-mono text-emerald-700 font-bold">+{reportData.netProfitMargin.toFixed(0)}% ROI</span>
            </div>
          </div>
        </div>
      </div>

      {/* Visual Revenue Composition Bar & Payment Split Strip */}
      <div className="bg-zinc-50/80 border border-zinc-200/80 rounded-xl p-4 space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <span className="font-bold text-zinc-800 flex items-center gap-1.5">
            <PieChart size={14} className="text-emerald-700" />
            {lang === 'ar' ? 'توزيع مصادر الدخل وطرق الدفع' : 'Revenue Stream & Payment Channels Distribution'}
          </span>
          <span className="text-[11px] text-zinc-500 font-mono">
            {lang === 'ar' ? 'إجمالي الدخل للفترة' : 'Gross Period Sales'}: <strong className="text-zinc-900">{formatCurrency(reportData.totalSales)}</strong>
          </span>
        </div>

        {/* Stacked Progress Bar */}
        <div className="space-y-1.5">
          <div className="w-full h-3.5 bg-zinc-200 rounded-full overflow-hidden flex shadow-inner">
            {coworkingSharePercent > 0 && (
              <div
                style={{ width: `${coworkingSharePercent}%` }}
                className="bg-amber-500 h-full transition-all duration-500 relative group cursor-pointer"
                title={`Coworking Tables: ${formatCurrency(reportData.coworkingIncome)} (${coworkingSharePercent.toFixed(1)}%)`}
              />
            )}
            {posSharePercent > 0 && (
              <div
                style={{ width: `${posSharePercent}%` }}
                className="bg-emerald-600 h-full transition-all duration-500 relative group cursor-pointer"
                title={`POS / F&B / WiFi: ${formatCurrency(reportData.posSales)} (${posSharePercent.toFixed(1)}%)`}
              />
            )}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-zinc-600 pt-0.5">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span>{t.coworkingIncome}: <strong className="font-mono text-zinc-900">{formatCurrency(reportData.coworkingIncome)}</strong> ({coworkingSharePercent.toFixed(0)}%)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                <span>{t.posSales}: <strong className="font-mono text-zinc-900">{formatCurrency(reportData.posSales)}</strong> ({posSharePercent.toFixed(0)}%)</span>
              </div>
            </div>

            <div className="flex items-center gap-3 text-[11px] text-zinc-500">
              <span className="text-rose-600 font-medium">COGS: {formatCurrency(reportData.totalCOGS)} ({cogsSharePercent.toFixed(0)}%)</span>
              <span className="text-purple-700 font-bold">{t.netProfit}: {formatCurrency(reportData.netProfit)} ({reportData.netProfitMargin.toFixed(0)}%)</span>
            </div>
          </div>
        </div>

        {/* Payment Channels Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-zinc-200/60">
          {(Object.entries(reportData.paymentBreakdown) as [string, { total: number; count: number }][]).map(([pm, data]) => {
            const getIcon = () => {
              if (pm === 'Cash') return <Banknote size={14} className="text-emerald-700" />;
              if (pm === 'Credit Card') return <CreditCard size={14} className="text-blue-700" />;
              if (pm.includes('InstaPay')) return <Wallet size={14} className="text-purple-700" />;
              return <CheckCircle2 size={14} className="text-amber-700" />;
            };

            return (
              <div key={pm} className="bg-white px-3 py-2 rounded-lg border border-zinc-200/80 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  {getIcon()}
                  <div>
                    <span className="text-[10px] text-zinc-500 block truncate max-w-[85px]">{pm}</span>
                    <span className="font-mono font-bold text-zinc-900 text-[11px]">{formatCurrency(data.total)}</span>
                  </div>
                </div>
                <span className="text-[10px] font-mono font-semibold text-zinc-400 bg-zinc-100 px-1.5 py-0.5 rounded">
                  {data.count}x
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Itemized Invoices Profitability Ledger */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-bold text-zinc-950">
              {t.reconciliationLedger}
            </h4>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-zinc-100 text-zinc-700 font-mono">
              {filteredInvoiceRecords.length} {lang === 'ar' ? 'فاتورة معروضة' : 'records'}
            </span>
          </div>

          {/* Ledger Filter Tabs */}
          <div className="flex flex-wrap items-center gap-1 bg-zinc-100 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setFilterSource('all')}
              className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                filterSource === 'all'
                  ? 'bg-white text-zinc-950 shadow-2xs font-bold'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              {t.all} ({reportData.invoicesCount})
            </button>
            <button
              onClick={() => setFilterSource('coworking')}
              className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                filterSource === 'coworking'
                  ? 'bg-white text-amber-950 shadow-2xs font-bold'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              {t.coworking} ({reportData.detailedInvoices.filter((d) => d.source.toLowerCase().includes('coworking') || d.source.toLowerCase().includes('table')).length})
            </button>
            <button
              onClick={() => setFilterSource('pos')}
              className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                filterSource === 'pos'
                  ? 'bg-white text-emerald-950 shadow-2xs font-bold'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              {t.pos} ({reportData.detailedInvoices.filter((d) => !d.source.toLowerCase().includes('coworking') && !d.source.toLowerCase().includes('table')).length})
            </button>
            <button
              onClick={() => setFilterSource('paid')}
              className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                filterSource === 'paid'
                  ? 'bg-white text-emerald-950 shadow-2xs font-bold'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              {t.paid}
            </button>
            <button
              onClick={() => setFilterSource('unpaid')}
              className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                filterSource === 'unpaid'
                  ? 'bg-white text-rose-950 shadow-2xs font-bold'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              {t.pending}
            </button>
          </div>
        </div>

        {/* Invoices List / Table */}
        {filteredInvoiceRecords.length === 0 ? (
          <div className="py-8 px-4 text-center bg-zinc-50/60 rounded-xl border border-zinc-200 border-dashed">
            <Receipt size={24} className="mx-auto text-zinc-400 mb-1.5" />
            <p className="font-semibold text-xs text-zinc-700">
              {lang === 'ar' ? 'لا توجد فواتير تطابق التحديد حالياً' : 'No invoices found matching current filter'}
            </p>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              {lang === 'ar' ? 'قم بإجراء عمليات بيع في الكاشير أو إنهاء جلسات طاولات العمل' : 'Place new orders in POS or complete table sessions to populate data'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto border border-zinc-200/80 rounded-xl">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 text-[10px] font-bold uppercase tracking-wider">
                  <th className="py-2.5 px-3">{lang === 'ar' ? 'رقم الفاتورة والتاريخ' : 'Invoice & Date'}</th>
                  <th className="py-2.5 px-3">{lang === 'ar' ? 'العميل والمصدر' : 'Customer / Source'}</th>
                  <th className="py-2.5 px-3">{lang === 'ar' ? 'المنتجات والخدمات' : 'Items & Services'}</th>
                  <th className="py-2.5 px-3">{lang === 'ar' ? 'طريقة الدفع' : 'Payment'}</th>
                  <th className="py-2.5 px-3 text-right">{lang === 'ar' ? 'الإجمالي' : 'Total Billed'}</th>
                  <th className="py-2.5 px-3 text-right">{lang === 'ar' ? 'التكلفة' : 'COGS'}</th>
                  <th className="py-2.5 px-3 text-right">{lang === 'ar' ? 'صافي الربح' : 'Net Profit'}</th>
                  <th className="py-2.5 px-3 text-center">{lang === 'ar' ? 'الحالة' : 'Status'}</th>
                  <th className="py-2.5 px-3 text-center">{lang === 'ar' ? 'إجراء' : 'Receipt'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 bg-white">
                {filteredInvoiceRecords.map((item) => {
                  const isCoworking = item.source.toLowerCase().includes('coworking') || item.source.toLowerCase().includes('table');
                  const marginPct = item.total > 0 ? ((item.netProfit / item.total) * 100).toFixed(0) : '0';

                  return (
                    <tr key={item.invoiceNumber} className="hover:bg-zinc-50/70 transition">
                      {/* Invoice # & Time */}
                      <td className="py-2.5 px-3">
                        <div className="font-mono font-bold text-zinc-900 text-xs">
                          {item.invoiceNumber}
                        </div>
                        <span className="text-[10px] text-zinc-400 flex items-center gap-1">
                          <Clock size={10} /> {item.dateFormatted} · {item.timeFormatted}
                        </span>
                      </td>

                      {/* Customer / Source */}
                      <td className="py-2.5 px-3">
                        <div className="font-semibold text-zinc-900 text-xs truncate max-w-[120px]">
                          {item.customerName || 'Walk-in Guest'}
                        </div>
                        <span
                          className={`inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[9px] font-bold ${
                            isCoworking
                              ? 'bg-amber-100 text-amber-900'
                              : 'bg-emerald-100 text-emerald-900'
                          }`}
                        >
                          {isCoworking ? (
                            <>
                              <Armchair size={9} /> Coworking Table
                            </>
                          ) : (
                            <>
                              <Coffee size={9} /> POS Counter
                            </>
                          )}
                        </span>
                      </td>

                      {/* Items */}
                      <td className="py-2.5 px-3 text-[11px] text-zinc-600 max-w-[180px]">
                        <div className="truncate" title={item.itemsSummary}>
                          {item.itemsSummary}
                        </div>
                      </td>

                      {/* Payment */}
                      <td className="py-2.5 px-3 text-[11px]">
                        <span className="font-medium text-zinc-700 bg-zinc-100 px-2 py-0.5 rounded-md text-[10px]">
                          {item.paymentMethod}
                        </span>
                      </td>

                      {/* Total Billed */}
                      <td className="py-2.5 px-3 text-right">
                        <span className="font-mono font-bold text-zinc-950 text-xs">
                          {formatCurrency(item.total)}
                        </span>
                      </td>

                      {/* COGS */}
                      <td className="py-2.5 px-3 text-right">
                        <span className="font-mono text-zinc-500 text-xs">
                          {item.cogs > 0 ? formatCurrency(item.cogs) : '—'}
                        </span>
                      </td>

                      {/* Net Profit */}
                      <td className="py-2.5 px-3 text-right">
                        <div className="font-mono font-bold text-emerald-800 text-xs">
                          {formatCurrency(item.netProfit)}
                        </div>
                        <span className="text-[9px] font-mono font-semibold text-emerald-600">
                          {marginPct}% margin
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-2.5 px-3 text-center">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                            item.status === 'PAID'
                              ? 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                              : 'bg-amber-100 text-amber-900 border border-amber-200'
                          }`}
                        >
                          {item.status === 'PAID' ? t.paid : t.pending}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="py-2.5 px-3 text-center">
                        <button
                          onClick={() => handleViewReceiptFromInvoiceNumber(item.invoiceNumber)}
                          className="p-1 rounded-lg hover:bg-zinc-200 text-zinc-500 hover:text-zinc-900 transition cursor-pointer"
                          title={t.print}
                        >
                          <Eye size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

