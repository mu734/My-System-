import React, { useState, useMemo } from 'react';
import {
  Receipt,
  Search,
  CheckCircle2,
  Clock,
  Printer,
  ChevronRight,
  Eye,
  Filter,
  DollarSign,
  Download,
  AlertCircle,
  UserCheck,
  Building,
  Percent,
  FileDown,
  FileSpreadsheet,
} from 'lucide-react';
import { Invoice, Customer, MenuItem } from '../../types';
import { ReceiptModal } from '../pos/ReceiptModal';
import { PrintInvoiceModal } from './PrintInvoiceModal';
import { useLanguage } from '../../i18n/LanguageContext';
import {
  computeFinancialReport,
  exportReportToPDF,
  exportReportToExcel,
  buildReportOptions,
} from '../../services/reportExportService';

interface InvoicesViewProps {
  invoices: Invoice[];
  customers: Customer[];
  menu?: MenuItem[];
  onUpdateInvoiceStatus: (invoiceId: string, status: 'paid' | 'unpaid' | 'void') => void;
  notify: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const InvoicesView: React.FC<InvoicesViewProps> = ({
  invoices,
  customers,
  menu = [],
  onUpdateInvoiceStatus,
  notify,
}) => {
  const { lang, t, formatCurrency } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'unpaid' | 'void'>('all');
  const [selectedInvoiceForReceipt, setSelectedInvoiceForReceipt] = useState<Invoice | null>(null);
  const [selectedInvoiceForPrint, setSelectedInvoiceForPrint] = useState<Invoice | null>(null);


  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      const matchesSearch =
        inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inv.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inv.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inv.items.some((it) => it.name.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesStatus = statusFilter === 'all' || inv.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [invoices, searchQuery, statusFilter]);

  const totalBilled = invoices.reduce((sum, inv) => sum + (inv.status !== 'void' ? inv.total : 0), 0);
  const totalPaid = invoices
    .filter((inv) => inv.status === 'paid')
    .reduce((sum, inv) => sum + inv.total, 0);
  const totalUnpaid = invoices
    .filter((inv) => inv.status === 'unpaid')
    .reduce((sum, inv) => sum + inv.total, 0);
  const totalVAT14 = invoices
    .filter((inv) => inv.status !== 'void')
    .reduce((sum, inv) => sum + inv.tax, 0);

  const handleToggleStatus = (inv: Invoice) => {
    const nextStatus = inv.status === 'paid' ? 'unpaid' : 'paid';
    onUpdateInvoiceStatus(inv.id, nextStatus);
    notify(`Invoice ${inv.invoiceNumber} marked as ${nextStatus.toUpperCase()}`, 'info');
  };

  const handleExportPDF = () => {
    const options = buildReportOptions('all');
    const reportData = computeFinancialReport(invoices, menu, options);
    exportReportToPDF(reportData, 'WhiteTable_Invoices_Report');
  };

  const handleExportExcel = () => {
    const options = buildReportOptions('all');
    const reportData = computeFinancialReport(invoices, menu, options);
    exportReportToExcel(reportData, 'WhiteTable_Invoices_Report');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-zinc-950 tracking-tight">{t.invoicesTitle}</h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            Auto-archived tax invoices generated upon checkout with 14% Egyptian VAT breakdown and guest purchase tracking
          </p>
        </div>

        {/* Export and Print Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {invoices.length > 0 && (
            <button
              type="button"
              onClick={() => setSelectedInvoiceForPrint(invoices[0])}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-900 bg-zinc-900 hover:bg-emerald-700 text-white font-bold text-xs transition cursor-pointer shadow-2xs"
              title="Print latest generated tax invoice"
            >
              <Printer size={14} className="text-zinc-200" />
              <span>{lang === 'ar' ? 'طباعة آخر فاتورة' : 'Print Latest Invoice'}</span>
            </button>
          )}
          <button
            type="button"
            onClick={handleExportPDF}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-900 font-bold text-xs transition cursor-pointer shadow-2xs"
          >
            <FileDown size={14} className="text-rose-700" />
            <span>{t.exportPdfReport}</span>
          </button>
          <button
            type="button"
            onClick={handleExportExcel}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 font-bold text-xs transition cursor-pointer shadow-2xs"
          >
            <FileSpreadsheet size={14} className="text-emerald-700" />
            <span>{t.exportExcelReport}</span>
          </button>
        </div>
      </div>

      {/* KPI Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500">Total Invoiced Amount</span>
          <div className="text-2xl font-bold font-mono text-slate-900 mt-1">
            EGP {totalBilled.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[10px] text-slate-400">{invoices.length} archived invoices</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
          <span className="text-xs font-semibold text-emerald-800">Collected Revenue (Paid)</span>
          <div className="text-2xl font-bold font-mono text-emerald-700 mt-1">
            EGP {totalPaid.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[10px] text-emerald-600">Settled receipts</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
          <span className="text-xs font-semibold text-amber-800">Pending / Unpaid Tabs</span>
          <div className="text-2xl font-bold font-mono text-amber-700 mt-1">
            EGP {totalUnpaid.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[10px] text-amber-600">Active member tabs</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
          <span className="text-xs font-semibold text-slate-700">14% VAT Collected</span>
          <div className="text-2xl font-bold font-mono text-slate-900 mt-1">
            EGP {totalVAT14.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[10px] text-slate-400">ضريبة القيمة المضافة</span>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200">
        <div className="relative flex-1 max-w-md">
          <Search size={15} className="absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search invoice number, guest name, or ordered items..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-700"
          />
        </div>

        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 self-start sm:self-auto">
          {(['all', 'paid', 'unpaid', 'void'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold uppercase transition ${
                statusFilter === st
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-500 tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-5 py-3.5">Invoice #</th>
                <th className="px-4 py-3.5">Customer & Loyalty Status</th>
                <th className="px-4 py-3.5">Itemized Order Details</th>
                <th className="px-4 py-3.5">Date & Time</th>
                <th className="px-4 py-3.5">Payment Method</th>
                <th className="px-4 py-3.5">Subtotal</th>
                <th className="px-4 py-3.5">14% VAT</th>
                <th className="px-4 py-3.5">Total (EGP)</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5 text-right">View / Print</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredInvoices.map((inv) => {
                const customer = customers.find((c) => c.id === inv.customerId);
                const isRepeat = customer && customer.visits > 1;

                return (
                  <tr key={inv.id} className="hover:bg-slate-50/80 transition">
                    <td className="px-5 py-3.5 font-mono font-bold text-slate-900">
                      {inv.invoiceNumber}
                    </td>

                    {/* Customer + Repeat status badge */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900">{inv.customerName}</span>
                        {isRepeat ? (
                          <span className="inline-flex items-center gap-0.5 px-2 py-0.2 rounded-full bg-emerald-100 text-emerald-900 font-bold text-[9px] border border-emerald-200 whitespace-nowrap">
                            <UserCheck size={9} /> Repeat ({customer.visits}v)
                          </span>
                        ) : customer ? (
                          <span className="px-1.5 py-0.2 rounded text-[9px] bg-slate-100 text-slate-600">
                            New Member
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.2 rounded text-[9px] bg-slate-100 text-slate-500">
                            Walk-in
                          </span>
                        )}
                      </div>
                      {customer && (
                        <span className="text-[10px] text-amber-700 font-medium block mt-0.5">
                          {customer.tier}
                        </span>
                      )}
                    </td>

                    {/* Itemized Order Details preview */}
                    <td className="px-4 py-3.5 text-slate-600">
                      <div className="font-medium text-slate-900 flex items-center gap-1.5">
                        <span className="px-1.5 py-0.5 rounded bg-slate-100 font-mono text-[9px] uppercase">
                          {inv.source}
                        </span>
                        <span className="truncate max-w-xs">{inv.label}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5 truncate max-w-xs">
                        {inv.items.map((it) => `${it.qty}x ${it.name}`).join(', ')}
                      </div>
                    </td>

                    {/* Date & Time */}
                    <td className="px-4 py-3.5 font-mono text-slate-500">
                      <div>{new Date(inv.date).toLocaleDateString()}</div>
                      <div className="text-[10px] text-slate-400">
                        {new Date(inv.date).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </td>

                    {/* Payment Method */}
                    <td className="px-4 py-3.5 text-slate-700 font-medium">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-[11px]">
                        {inv.paymentMethod || 'Credit Card'}
                      </span>
                    </td>

                    {/* Subtotal */}
                    <td className="px-4 py-3.5 font-mono text-slate-600">
                      EGP {inv.subtotal.toFixed(2)}
                    </td>

                    {/* 14% VAT */}
                    <td className="px-4 py-3.5 font-mono font-medium text-slate-700">
                      EGP {inv.tax.toFixed(2)}
                    </td>

                    {/* Total */}
                    <td className="px-4 py-3.5 font-mono font-bold text-emerald-800 text-sm">
                      EGP {inv.total.toFixed(2)}
                    </td>

                    {/* Status Toggle */}
                    <td className="px-4 py-3.5">
                      <button
                        onClick={() => handleToggleStatus(inv)}
                        className={`px-2.5 py-1 text-[10px] font-bold rounded-full uppercase tracking-wider transition ${
                          inv.status === 'paid'
                            ? 'bg-emerald-100 text-emerald-900 border border-emerald-200 hover:bg-emerald-200'
                            : inv.status === 'unpaid'
                            ? 'bg-amber-100 text-amber-900 border border-amber-300 hover:bg-amber-200'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                        title="Click to toggle Paid/Unpaid status"
                      >
                        {inv.status}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setSelectedInvoiceForPrint(inv)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-emerald-700 text-white font-bold text-[11px] transition shadow-2xs cursor-pointer"
                          title="Print formatted A4 Tax Invoice or 80mm Receipt"
                        >
                          <Printer size={12} />
                          <span>{lang === 'ar' ? 'طباعة' : 'Print Invoice'}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedInvoiceForReceipt(inv)}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-[11px] transition shadow-2xs cursor-pointer"
                          title="View Details"
                        >
                          <Eye size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredInvoices.length === 0 && (
          <div className="p-10 text-center text-slate-400">
            <Receipt size={28} className="mx-auto text-slate-300 stroke-1 mb-2" />
            <p className="font-semibold text-xs text-slate-600">No invoices match your search</p>
          </div>
        )}
      </div>

      {/* Printable Invoice Modal (A4 & 80mm Receipt) */}
      {selectedInvoiceForPrint && (
        <PrintInvoiceModal
          invoice={selectedInvoiceForPrint}
          customer={customers.find((c) => c.id === selectedInvoiceForPrint.customerId)}
          onClose={() => setSelectedInvoiceForPrint(null)}
          notify={notify}
        />
      )}

      {/* Thermal Receipt & Tax Invoice Modal */}
      {selectedInvoiceForReceipt && (
        <ReceiptModal
          order={{
            id: selectedInvoiceForReceipt.orderId,
            source: selectedInvoiceForReceipt.source as any,
            label: selectedInvoiceForReceipt.label,
            customerId: selectedInvoiceForReceipt.customerId,
            items: selectedInvoiceForReceipt.items,
            subtotal: selectedInvoiceForReceipt.subtotal,
            tax: selectedInvoiceForReceipt.tax,
            discount: selectedInvoiceForReceipt.discount,
            total: selectedInvoiceForReceipt.total,
            paymentMethod: selectedInvoiceForReceipt.paymentMethod as any,
            status: 'completed',
            createdAt: selectedInvoiceForReceipt.date,
          }}
          customer={customers.find((c) => c.id === selectedInvoiceForReceipt.customerId)}
          onClose={() => setSelectedInvoiceForReceipt(null)}
        />
      )}
    </div>
  );
};

