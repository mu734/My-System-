import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Invoice, Order, MenuItem } from '../types';

export type ReportPeriod = 'daily' | 'weekly' | 'monthly' | 'custom' | 'all';

export interface ReportFilterOptions {
  period: ReportPeriod;
  startDate: number; // timestamp
  endDate: number; // timestamp
  periodLabel: string;
  sourceFilter?: 'all' | 'coworking' | 'pos';
}

export function buildReportOptions(
  period: ReportPeriod,
  customStartDate?: number,
  customEndDate?: number,
  sourceFilter: 'all' | 'coworking' | 'pos' = 'all'
): ReportFilterOptions {
  const now = new Date();

  if (period === 'daily') {
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    const end = new Date(now);
    end.setHours(23, 59, 59, 999);
    return {
      period: 'daily',
      startDate: start.getTime(),
      endDate: end.getTime(),
      periodLabel: `Today (${now.toLocaleDateString('en-GB')})`,
      sourceFilter,
    };
  }

  if (period === 'weekly') {
    const start = new Date(now);
    start.setDate(now.getDate() - 6);
    start.setHours(0, 0, 0, 0);
    const end = new Date(now);
    end.setHours(23, 59, 59, 999);
    return {
      period: 'weekly',
      startDate: start.getTime(),
      endDate: end.getTime(),
      periodLabel: `Last 7 Days (${start.toLocaleDateString('en-GB')} - ${end.toLocaleDateString('en-GB')})`,
      sourceFilter,
    };
  }

  if (period === 'monthly') {
    const start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    return {
      period: 'monthly',
      startDate: start.getTime(),
      endDate: end.getTime(),
      periodLabel: `This Month (${now.toLocaleString('default', { month: 'long', year: 'numeric' })})`,
      sourceFilter,
    };
  }

  if (period === 'custom' && customStartDate && customEndDate) {
    const s = new Date(customStartDate);
    const e = new Date(customEndDate);
    return {
      period: 'custom',
      startDate: customStartDate,
      endDate: customEndDate,
      periodLabel: `Custom (${s.toLocaleDateString('en-GB')} - ${e.toLocaleDateString('en-GB')})`,
      sourceFilter,
    };
  }

  // 'all' or fallback
  return {
    period: 'all',
    startDate: 0,
    endDate: Date.now() + 86400000 * 365,
    periodLabel: 'All Records',
    sourceFilter,
  };
}

export interface FinancialReportData {
  periodLabel: string;
  startDateFormatted: string;
  endDateFormatted: string;
  invoicesCount: number;
  totalSales: number;
  totalSubtotal: number;
  totalTax: number;
  totalDiscounts: number;
  totalPaid: number;
  totalUnpaid: number;
  coworkingIncome: number;
  posSales: number;
  totalCOGS: number;
  netProfit: number;
  netProfitMargin: number;
  paymentBreakdown: Record<string, { total: number; count: number }>;
  detailedInvoices: {
    invoiceNumber: string;
    dateFormatted: string;
    timeFormatted: string;
    customerName: string;
    source: string;
    itemsSummary: string;
    paymentMethod: string;
    total: number;
    cogs: number;
    netProfit: number;
    status: string;
  }[];
}

/**
 * Compute financial metrics from a set of invoices given menu COGS data
 */
export function computeFinancialReport(
  invoices: Invoice[],
  menu: MenuItem[],
  options: ReportFilterOptions
): FinancialReportData {
  // 1. Filter invoices within date range
  const filteredInvoices = invoices.filter((inv) => {
    const isWithinRange = inv.date >= options.startDate && inv.date <= options.endDate;
    if (!isWithinRange) return false;
    if (inv.status === 'void') return false;
    if (options.sourceFilter && options.sourceFilter !== 'all') {
      const isCoworking =
        inv.source === 'coworking' ||
        inv.items.some((it) => it.category === 'Coworking' || it.category === 'Tables' || it.itemId.startsWith('d-') || it.name.toLowerCase().includes('table') || it.name.toLowerCase().includes('desk'));
      if (options.sourceFilter === 'coworking' && !isCoworking) return false;
      if (options.sourceFilter === 'pos' && isCoworking) return false;
    }
    return true;
  });

  // 2. Build cost map
  const menuCostMap = new Map<string, number>();
  menu.forEach((m) => {
    menuCostMap.set(m.id, m.cost);
    menuCostMap.set(m.name.toLowerCase().trim(), m.cost);
  });

  let totalSales = 0;
  let totalSubtotal = 0;
  let totalTax = 0;
  let totalDiscounts = 0;
  let totalPaid = 0;
  let totalUnpaid = 0;
  let coworkingIncome = 0;
  let totalCOGS = 0;

  const paymentBreakdown: Record<string, { total: number; count: number }> = {
    'Cash': { total: 0, count: 0 },
    'Credit Card': { total: 0, count: 0 },
    'InstaPay / Wallet': { total: 0, count: 0 },
    'Member Tab': { total: 0, count: 0 },
  };

  const detailedInvoices = filteredInvoices.map((inv) => {
    totalSales += inv.total;
    totalSubtotal += inv.subtotal;
    totalTax += inv.tax;
    totalDiscounts += inv.discount;

    if (inv.status === 'paid') totalPaid += inv.total;
    else if (inv.status === 'unpaid') totalUnpaid += inv.total;

    const pm = inv.paymentMethod || 'Cash';
    if (!paymentBreakdown[pm]) {
      paymentBreakdown[pm] = { total: 0, count: 0 };
    }
    paymentBreakdown[pm].total += inv.total;
    paymentBreakdown[pm].count += 1;

    let invCoworking = 0;
    let invCOGS = 0;

    inv.items.forEach((it) => {
      const isTableItem =
        it.category === 'Coworking' ||
        it.category === 'Tables' ||
        it.category === 'Services & WiFi' ||
        it.itemId.startsWith('d-') ||
        it.name.toLowerCase().includes('table') ||
        it.name.toLowerCase().includes('desk') ||
        it.name.toLowerCase().includes('wifi');

      if (isTableItem) {
        invCoworking += it.totalPrice;
      } else {
        const unitCost =
          menuCostMap.get(it.itemId) ??
          menuCostMap.get(it.name.toLowerCase().trim()) ??
          it.unitPrice * 0.32;
        invCOGS += unitCost * (it.qty || 1);
      }
    });

    if (inv.source === 'coworking' && invCoworking === 0) {
      invCoworking = inv.total;
    }

    coworkingIncome += invCoworking;
    totalCOGS += invCOGS;

    const invNetRev = Math.max(0, inv.subtotal - inv.discount);
    const invNetProfit = Math.max(0, invNetRev - invCOGS);

    const d = new Date(inv.date);
    return {
      invoiceNumber: inv.invoiceNumber,
      dateFormatted: d.toLocaleDateString('en-GB'),
      timeFormatted: d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      customerName: inv.customerName || 'Walk-in Guest',
      source: inv.source === 'coworking' || invCoworking > 0 ? 'Table / Coworking' : 'POS Counter',
      itemsSummary: inv.items.map((i) => `${i.name} (${i.qty}x)`).join(', '),
      paymentMethod: inv.paymentMethod || 'Cash',
      total: inv.total,
      cogs: invCOGS,
      netProfit: invNetProfit,
      status: inv.status.toUpperCase(),
    };
  });

  const posSales = Math.max(0, totalSales - coworkingIncome);
  const netRevenue = Math.max(0, totalSubtotal - totalDiscounts);
  const netProfit = Math.max(0, netRevenue - totalCOGS);
  const netProfitMargin = totalSales > 0 ? (netProfit / totalSales) * 100 : 0;

  return {
    periodLabel: options.periodLabel,
    startDateFormatted: new Date(options.startDate).toLocaleDateString('en-GB'),
    endDateFormatted: new Date(options.endDate).toLocaleDateString('en-GB'),
    invoicesCount: filteredInvoices.length,
    totalSales,
    totalSubtotal,
    totalTax,
    totalDiscounts,
    totalPaid,
    totalUnpaid,
    coworkingIncome,
    posSales,
    totalCOGS,
    netProfit,
    netProfitMargin,
    paymentBreakdown,
    detailedInvoices,
  };
}

/**
 * Generate a PDF Financial Report using jsPDF and jspdf-autotable
 */
export function exportReportToPDF(reportData: FinancialReportData, filenamePrefix = 'WhiteTable_Financial_Report') {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const primaryColor: [number, number, number] = [22, 101, 52]; // Emerald 800
  const secondaryColor: [number, number, number] = [217, 119, 6]; // Amber 600
  const darkText: [number, number, number] = [24, 24, 27]; // Zinc 900
  const mutedText: [number, number, number] = [113, 113, 122]; // Zinc 500

  // 1. Header Banner
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, 210, 26, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('WHITE TABLE HUB · FINANCIAL REVENUE REPORT', 14, 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('POS & 14-Table Coworking Management System · Cairo, Egypt', 14, 18);

  doc.setFontSize(8);
  doc.text(`Generated: ${new Date().toLocaleString('en-GB')}`, 145, 18);

  // 2. Report Overview Box
  doc.setTextColor(...darkText);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text(`Period: ${reportData.periodLabel}`, 14, 34);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...mutedText);
  doc.text(`Date Range: ${reportData.startDateFormatted} - ${reportData.endDateFormatted} · Total Invoices: ${reportData.invoicesCount}`, 14, 40);

  // 3. Executive KPI Summary Table
  const formatEGP = (val: number) => `EGP ${val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const summaryData = [
    [
      { content: 'Total Gross Sales', styles: { fontStyle: 'bold' as const } },
      formatEGP(reportData.totalSales),
      { content: 'Coworking / Tables Income (100 EGP/hr)', styles: { fontStyle: 'bold' as const } },
      formatEGP(reportData.coworkingIncome),
    ],
    [
      { content: 'Food & Beverage / POS Sales', styles: { fontStyle: 'bold' as const } },
      formatEGP(reportData.posSales),
      { content: 'Cost of Goods Sold (COGS)', styles: { fontStyle: 'bold' as const } },
      formatEGP(reportData.totalCOGS),
    ],
    [
      { content: 'Total Discounts (incl. 15% WiFi Promo)', styles: { fontStyle: 'bold' as const } },
      formatEGP(reportData.totalDiscounts),
      { content: '14% Egyptian VAT', styles: { fontStyle: 'bold' as const } },
      formatEGP(reportData.totalTax),
    ],
    [
      { content: 'Net Profit (Net Sales - COGS)', styles: { fontStyle: 'bold' as const, fillColor: [236, 253, 245] as [number, number, number], textColor: primaryColor } },
      { content: formatEGP(reportData.netProfit), styles: { fontStyle: 'bold' as const, fillColor: [236, 253, 245] as [number, number, number], textColor: primaryColor } },
      { content: 'Net Profit Margin %', styles: { fontStyle: 'bold' as const, fillColor: [236, 253, 245] as [number, number, number], textColor: primaryColor } },
      { content: `${reportData.netProfitMargin.toFixed(1)}%`, styles: { fontStyle: 'bold' as const, fillColor: [236, 253, 245] as [number, number, number], textColor: primaryColor } },
    ],
  ];

  autoTable(doc, {
    startY: 44,
    head: [['Financial Metric', 'Amount', 'Operational Metric', 'Amount']],
    body: summaryData,
    theme: 'grid',
    headStyles: {
      fillColor: primaryColor,
      textColor: [255, 255, 255],
      fontSize: 8,
      fontStyle: 'bold',
    },
    styles: {
      fontSize: 8,
      cellPadding: 2.2,
      textColor: darkText,
    },
    columnStyles: {
      0: { cellWidth: 50 },
      1: { cellWidth: 45, fontStyle: 'bold' },
      2: { cellWidth: 55 },
      3: { cellWidth: 40, fontStyle: 'bold' },
    },
  });

  // 4. Payment Methods Distribution Table
  const finalY1 = (doc as any).lastAutoTable.finalY || 80;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...darkText);
  doc.text('Payment Methods Breakdown', 14, finalY1 + 8);

  const paymentRows = Object.entries(reportData.paymentBreakdown).map(([method, data]) => {
    const pct = reportData.totalSales > 0 ? ((data.total / reportData.totalSales) * 100).toFixed(1) : '0.0';
    return [method, `${data.count} txns`, formatEGP(data.total), `${pct}%`];
  });

  autoTable(doc, {
    startY: finalY1 + 11,
    head: [['Payment Channel', 'Transactions', 'Total Volume', 'Share %']],
    body: paymentRows,
    theme: 'striped',
    headStyles: {
      fillColor: [71, 85, 105],
      textColor: [255, 255, 255],
      fontSize: 8,
      fontStyle: 'bold',
    },
    styles: {
      fontSize: 7.5,
      cellPadding: 1.8,
    },
  });

  // 5. Invoices Transaction Ledger Table
  const finalY2 = (doc as any).lastAutoTable.finalY || 120;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...darkText);
  doc.text('Invoices & Transaction Ledger', 14, finalY2 + 8);

  const invoiceRows = reportData.detailedInvoices.map((inv) => [
    inv.invoiceNumber,
    `${inv.dateFormatted} ${inv.timeFormatted}`,
    inv.customerName,
    inv.source,
    inv.paymentMethod,
    formatEGP(inv.total),
    inv.cogs > 0 ? formatEGP(inv.cogs) : '—',
    formatEGP(inv.netProfit),
    inv.status,
  ]);

  autoTable(doc, {
    startY: finalY2 + 11,
    head: [['Invoice #', 'Date/Time', 'Customer', 'Source', 'Payment', 'Total', 'COGS', 'Profit', 'Status']],
    body: invoiceRows,
    theme: 'grid',
    headStyles: {
      fillColor: [24, 24, 27],
      textColor: [255, 255, 255],
      fontSize: 7,
      fontStyle: 'bold',
    },
    styles: {
      fontSize: 6.5,
      cellPadding: 1.6,
      overflow: 'linebreak',
    },
    columnStyles: {
      0: { cellWidth: 20, fontStyle: 'bold' },
      1: { cellWidth: 22 },
      2: { cellWidth: 25 },
      3: { cellWidth: 22 },
      4: { cellWidth: 18 },
      5: { cellWidth: 22, halign: 'right', fontStyle: 'bold' },
      6: { cellWidth: 18, halign: 'right' },
      7: { cellWidth: 20, halign: 'right', fontStyle: 'bold' },
      8: { cellWidth: 15, halign: 'center' },
    },
  });

  // Footer page numbers
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(...mutedText);
    doc.text(
      `White Table Hub · Daily, Weekly & Monthly Financial Report · Page ${i} of ${pageCount}`,
      105,
      290,
      { align: 'center' }
    );
  }

  // Save the PDF
  const cleanPeriod = reportData.periodLabel.toLowerCase().replace(/[^a-z0-9]/g, '_');
  doc.save(`${filenamePrefix}_${cleanPeriod}_${new Date().toISOString().slice(0, 10)}.pdf`);
}

/**
 * Generate Excel / CSV File with proper UTF-8 BOM for Microsoft Excel & Arabic support
 */
export function exportReportToExcel(reportData: FinancialReportData, filenamePrefix = 'WhiteTable_Financial_Report') {
  const lines: string[] = [];

  // UTF-8 BOM so Excel opens it with perfect character encoding
  const BOM = '\uFEFF';

  // Title Block
  lines.push('WHITE TABLE HUB - FINANCIAL REVENUE REPORT');
  lines.push(`Period: ${reportData.periodLabel}`);
  lines.push(`Date Range: ${reportData.startDateFormatted} to ${reportData.endDateFormatted}`);
  lines.push(`Exported On: ${new Date().toLocaleString()}`);
  lines.push('');

  // Summary Metrics Section
  lines.push('EXECUTIVE FINANCIAL SUMMARY');
  lines.push(`Total Gross Sales (EGP),${reportData.totalSales.toFixed(2)}`);
  lines.push(`Coworking & Tables Income (EGP),${reportData.coworkingIncome.toFixed(2)}`);
  lines.push(`Food & Beverage POS Sales (EGP),${reportData.posSales.toFixed(2)}`);
  lines.push(`Total Cost of Goods Sold COGS (EGP),${reportData.totalCOGS.toFixed(2)}`);
  lines.push(`Total Discounts (incl 15% WiFi Promo) (EGP),${reportData.totalDiscounts.toFixed(2)}`);
  lines.push(`14% Egyptian VAT (EGP),${reportData.totalTax.toFixed(2)}`);
  lines.push(`Total Net Profit (EGP),${reportData.netProfit.toFixed(2)}`);
  lines.push(`Net Profit Margin (%),${reportData.netProfitMargin.toFixed(2)}%`);
  lines.push(`Total Paid/Collected (EGP),${reportData.totalPaid.toFixed(2)}`);
  lines.push(`Total Unpaid/Pending (EGP),${reportData.totalUnpaid.toFixed(2)}`);
  lines.push('');

  // Payment Breakdown Section
  lines.push('PAYMENT CHANNELS BREAKDOWN');
  lines.push('Payment Method,Transactions Count,Total Amount (EGP),Share (%)');
  Object.entries(reportData.paymentBreakdown).forEach(([method, data]) => {
    const pct = reportData.totalSales > 0 ? ((data.total / reportData.totalSales) * 100).toFixed(1) : '0';
    lines.push(`"${method}",${data.count},${data.total.toFixed(2)},${pct}%`);
  });
  lines.push('');

  // Invoices Ledger Section
  lines.push('DETAILED INVOICES & REVENUE LEDGER');
  lines.push('Invoice Number,Date,Time,Customer Name,Source / Table,Items Ordered,Payment Method,Total Billed (EGP),COGS (EGP),Net Profit (EGP),Status');
  reportData.detailedInvoices.forEach((inv) => {
    const escapedCustomer = `"${inv.customerName.replace(/"/g, '""')}"`;
    const escapedItems = `"${inv.itemsSummary.replace(/"/g, '""')}"`;
    lines.push(
      `${inv.invoiceNumber},${inv.dateFormatted},${inv.timeFormatted},${escapedCustomer},"${inv.source}",${escapedItems},"${inv.paymentMethod}",${inv.total.toFixed(2)},${inv.cogs.toFixed(2)},${inv.netProfit.toFixed(2)},${inv.status}`
    );
  });

  const csvContent = BOM + lines.join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  const cleanPeriod = reportData.periodLabel.toLowerCase().replace(/[^a-z0-9]/g, '_');
  link.setAttribute('download', `${filenamePrefix}_${cleanPeriod}_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
