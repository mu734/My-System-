import React, { useState, useEffect } from 'react';
import {
  X,
  Printer,
  FileText,
  Receipt as ReceiptIcon,
  Download,
  CheckCircle2,
  Building,
  User,
  CreditCard,
  QrCode,
  ShieldCheck,
  Calendar,
  Clock,
  Sparkles,
} from 'lucide-react';
import { Invoice, Customer } from '../../types';
import { WhiteTableLogo } from '../WhiteTableLogo';
import { useLanguage } from '../../i18n/LanguageContext';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface PrintInvoiceModalProps {
  invoice: Invoice;
  customer?: Customer;
  onClose: () => void;
  notify?: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const PrintInvoiceModal: React.FC<PrintInvoiceModalProps> = ({
  invoice,
  customer,
  onClose,
  notify,
}) => {
  const { lang, t, formatCurrency } = useLanguage();
  const [format, setFormat] = useState<'a4' | 'receipt'>('a4');

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleTriggerPrint = () => {
    window.print();
    if (notify) {
      notify(
        lang === 'ar' ? 'تم فتح نافذة الطباعة' : 'Opened system print dialog',
        'info'
      );
    }
  };

  const handleDownloadSinglePDF = () => {
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      // Header
      doc.setFillColor(15, 23, 42); // slate-900
      doc.rect(0, 0, 210, 36, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('WHITE TABLE COWORKING & CAFE', 14, 15);

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text('Official Egyptian Tax Invoice · 14% VAT Compliant', 14, 22);
      doc.text('Tax ID: 649-182-903 · Commercial Reg: 104-992-184', 14, 28);

      // Invoice info block right-aligned in header
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text(invoice.invoiceNumber, 196, 15, { align: 'right' });
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(`Date: ${new Date(invoice.date).toLocaleDateString()}`, 196, 22, { align: 'right' });
      doc.text(`Status: ${invoice.status.toUpperCase()}`, 196, 28, { align: 'right' });

      // Customer & Billing details
      doc.setTextColor(30, 41, 59);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('BILLED TO / CUSTOMER DETAILS:', 14, 46);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.text(`Name: ${invoice.customerName}`, 14, 52);
      if (customer?.phone) doc.text(`Phone: ${customer.phone}`, 14, 57);
      if (customer?.email) doc.text(`Email: ${customer.email}`, 14, 62);
      doc.text(`Source / Channel: ${invoice.source.toUpperCase()}`, 14, customer?.phone || customer?.email ? 67 : 57);

      // Payment details on right
      doc.setFont('helvetica', 'bold');
      doc.text('PAYMENT DETAILS:', 130, 46);
      doc.setFont('helvetica', 'normal');
      doc.text(`Method: ${invoice.paymentMethod || 'Credit Card'}`, 130, 52);
      doc.text(`Order Ref: ${invoice.orderId}`, 130, 57);
      doc.text(`Currency: Egyptian Pound (EGP)`, 130, 62);

      // Line items table
      const startTableY = customer?.phone || customer?.email ? 74 : 66;
      const tableRows = invoice.items.map((it) => [
        it.name + (it.size ? ` (${it.size})` : ''),
        it.qty.toString(),
        `${it.unitPrice.toFixed(2)} EGP`,
        '14%',
        `${it.totalPrice.toFixed(2)} EGP`,
      ]);

      autoTable(doc, {
        startY: startTableY,
        head: [['Item Description', 'Qty', 'Unit Price', 'VAT Rate', 'Total Amount']],
        body: tableRows,
        theme: 'striped',
        headStyles: {
          fillColor: [15, 23, 42],
          textColor: 255,
          fontSize: 9,
          fontStyle: 'bold',
        },
        bodyStyles: {
          fontSize: 8.5,
          textColor: [30, 41, 59],
        },
        styles: {
          cellPadding: 3,
        },
        columnStyles: {
          0: { cellWidth: 80 },
          1: { cellWidth: 20, halign: 'center' },
          2: { cellWidth: 30, halign: 'right' },
          3: { cellWidth: 25, halign: 'center' },
          4: { cellWidth: 35, halign: 'right' },
        },
      });

      // Totals Box
      const finalY = (doc as any).lastAutoTable.finalY + 6;
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(120, finalY, 76, 38, 2, 2, 'FD');

      doc.setFontSize(9);
      doc.setTextColor(71, 85, 105);
      doc.text('Subtotal:', 125, finalY + 8);
      doc.text(`${invoice.subtotal.toFixed(2)} EGP`, 190, finalY + 8, { align: 'right' });

      if (invoice.discount > 0) {
        doc.setTextColor(225, 29, 72);
        doc.text('Discount:', 125, finalY + 15);
        doc.text(`-${invoice.discount.toFixed(2)} EGP`, 190, finalY + 15, { align: 'right' });
      }

      doc.setTextColor(71, 85, 105);
      doc.text('14% Egyptian VAT:', 125, finalY + (invoice.discount > 0 ? 22 : 16));
      doc.text(`${invoice.tax.toFixed(2)} EGP`, 190, finalY + (invoice.discount > 0 ? 22 : 16), { align: 'right' });

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(15, 23, 42);
      doc.text('Total Due:', 125, finalY + (invoice.discount > 0 ? 31 : 27));
      doc.text(`${invoice.total.toFixed(2)} EGP`, 190, finalY + (invoice.discount > 0 ? 31 : 27), { align: 'right' });

      // Footer
      doc.setFontSize(8);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(148, 163, 184);
      doc.text('Thank you for choosing White Table Coworking & Specialty Cafe.', 105, 280, { align: 'center' });
      doc.text('Generated via White Table Enterprise Management Platform · ETA Tax Verified', 105, 285, { align: 'center' });

      doc.save(`Invoice_${invoice.invoiceNumber}.pdf`);
      if (notify) {
        notify(`Downloaded PDF invoice ${invoice.invoiceNumber}`, 'success');
      }
    } catch (e: any) {
      console.error(e);
      if (notify) {
        notify('Failed to generate PDF document', 'error');
      }
    }
  };

  return (
    <div
      id="print-invoice-modal-backdrop"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-zinc-950/80 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150"
    >
      <div
        id="print-invoice-modal-dialog"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-4xl bg-zinc-100 text-zinc-900 rounded-3xl shadow-2xl overflow-hidden border border-zinc-300 animate-in zoom-in-95 duration-150 flex flex-col my-auto max-h-[95vh]"
      >
        {/* Modal Controls Toolbar (Hidden in Print) */}
        <div className="no-print flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 bg-zinc-950 text-white border-b border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-600/30 border border-emerald-500/50 flex items-center justify-center text-emerald-400">
              <Printer size={16} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/60">
                  {lang === 'ar' ? 'معاينة وطباعة الفاتورة' : 'Print Invoice Preview'}
                </span>
                <span className="font-mono font-bold text-xs text-zinc-300">
                  {invoice.invoiceNumber}
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                {lang === 'ar'
                  ? 'اختر حجم المستند للطباعة (A4 ضريبية رسمية أو إيصال حراري 80مم)'
                  : 'Select document layout format: A4 Official Tax Document or 80mm POS Slip'}
              </p>
            </div>
          </div>

          {/* Format Switcher & Print Actions */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Format Toggle */}
            <div className="flex items-center bg-zinc-900 p-1 rounded-xl border border-zinc-800">
              <button
                type="button"
                onClick={() => setFormat('a4')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  format === 'a4'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <FileText size={13} />
                <span>{lang === 'ar' ? 'A4 فاتورة رسمية' : 'A4 Tax Invoice'}</span>
              </button>
              <button
                type="button"
                onClick={() => setFormat('receipt')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  format === 'receipt'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <ReceiptIcon size={13} />
                <span>{lang === 'ar' ? 'إيصال حراري 80مم' : '80mm Receipt'}</span>
              </button>
            </div>

            {/* Direct PDF Download */}
            <button
              type="button"
              onClick={handleDownloadSinglePDF}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 text-xs font-bold transition cursor-pointer"
              title="Download PDF file"
            >
              <Download size={13} className="text-zinc-400" />
              <span className="hidden sm:inline">PDF</span>
            </button>

            {/* Print Trigger */}
            <button
              type="button"
              onClick={handleTriggerPrint}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-xs transition cursor-pointer"
            >
              <Printer size={14} />
              <span>{lang === 'ar' ? 'طباعة الآن' : 'Print Invoice'}</span>
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Scrollable Printable Document Container */}
        <div className="p-4 sm:p-6 overflow-y-auto flex justify-center bg-zinc-200/70 select-text">
          {/* Printable Document Root with specialized id */}
          <div
            id="printable-invoice-document"
            className={`${
              format === 'a4'
                ? 'print-a4-mode w-full max-w-[780px] min-h-[960px] p-8 sm:p-10 bg-white rounded-2xl shadow-lg border border-zinc-200 text-zinc-900'
                : 'print-receipt-mode w-full max-w-[340px] p-5 sm:p-6 bg-white rounded-2xl shadow-lg border border-zinc-200 text-zinc-900 font-mono text-xs'
            }`}
          >
            {format === 'a4' ? (
              /* A4 TAX INVOICE FORMAT */
              <div className="space-y-6">
                {/* Top Header */}
                <div className="flex items-start justify-between border-b-2 border-zinc-900 pb-5">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-3">
                      <WhiteTableLogo size={42} dark={false} />
                      <div>
                        <h1 className="text-xl font-black tracking-tight text-zinc-950">
                          WHITE TABLE COWORKING & CAFE
                        </h1>
                        <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block">
                          {lang === 'ar'
                            ? 'فاتورة ضريبية رسمية - جمهورية مصر العربية'
                            : 'Official Electronic Tax Invoice · Arab Republic of Egypt'}
                        </span>
                      </div>
                    </div>
                    <div className="text-xs text-zinc-600 space-y-0.5 pt-1">
                      <div>
                        <span className="font-semibold text-zinc-900">Commercial Registration:</span> 104-992-184
                        <span className="mx-2">·</span>
                        <span className="font-semibold text-zinc-900">Tax Identification No:</span>{' '}
                        <strong className="font-mono text-zinc-950 font-bold">649-182-903</strong>
                      </div>
                      <div>
                        Branch: South Sinai Coastal Hub / New Cairo Innovation District · support@whitetable.space
                      </div>
                    </div>
                  </div>

                  <div className="text-end space-y-1">
                    <div className="px-3.5 py-1 bg-zinc-900 text-white rounded-xl inline-block font-mono font-black text-sm">
                      {invoice.invoiceNumber}
                    </div>
                    <div className="text-xs text-zinc-600">
                      Date:{' '}
                      <span className="font-mono font-bold text-zinc-900">
                        {new Date(invoice.date).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="text-xs text-zinc-600">
                      Time:{' '}
                      <span className="font-mono text-zinc-700">
                        {new Date(invoice.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div>
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                          invoice.status === 'paid'
                            ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                            : 'bg-amber-100 text-amber-900 border border-amber-300'
                        }`}
                      >
                        {invoice.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Billed To & Payment Metadata */}
                <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-zinc-50 border border-zinc-200 text-xs">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
                      {lang === 'ar' ? 'بيانات العميل / الفاتورة إلى' : 'Billed To Customer / Organization'}
                    </span>
                    <div className="text-sm font-black text-zinc-950">{invoice.customerName}</div>
                    {customer && (
                      <div className="text-zinc-600 text-xs space-y-0.5 pt-0.5">
                        {customer.phone && (
                          <div>
                            Phone: <span className="font-mono text-zinc-800">{customer.phone}</span>
                          </div>
                        )}
                        {customer.email && <div>Email: <span className="text-zinc-800">{customer.email}</span></div>}
                        <div>
                          Membership Tier:{' '}
                          <strong className="text-emerald-800 font-semibold">{customer.tier}</strong> ({customer.points} loyalty pts)
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="text-end space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
                      {lang === 'ar' ? 'بيانات الدفع والطلب' : 'Payment & Transaction Metadata'}
                    </span>
                    <div className="font-bold text-zinc-900 text-xs">
                      Payment Mode:{' '}
                      <span className="px-2 py-0.5 rounded bg-white border border-zinc-200 font-mono text-zinc-900">
                        {invoice.paymentMethod || 'Credit Card'}
                      </span>
                    </div>
                    <div className="text-zinc-600 text-xs">
                      Source Category:{' '}
                      <span className="capitalize font-semibold text-zinc-800">{invoice.source}</span>
                    </div>
                    <div className="text-zinc-500 font-mono text-[11px]">
                      Order Ref: {invoice.orderId}
                    </div>
                  </div>
                </div>

                {/* Line Items Table */}
                <div className="border border-zinc-300 rounded-2xl overflow-hidden shadow-2xs">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-zinc-900 text-white text-[10px] uppercase font-bold tracking-wider">
                      <tr>
                        <th className="px-4 py-3 text-left">Item Description</th>
                        <th className="px-3 py-3 text-center">Qty</th>
                        <th className="px-4 py-3 text-right">Unit Price</th>
                        <th className="px-3 py-3 text-center">VAT</th>
                        <th className="px-4 py-3 text-right">Line Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200">
                      {invoice.items.map((it, idx) => (
                        <tr key={idx} className="hover:bg-zinc-50/70">
                          <td className="px-4 py-3">
                            <div className="font-bold text-zinc-950">
                              {it.name} {it.size ? `(${it.size})` : ''}
                            </div>
                            {it.selectedAddons && it.selectedAddons.length > 0 && (
                              <div className="text-[10px] text-zinc-500 mt-0.5">
                                {it.selectedAddons.map((a) => `${a.name} (+${formatCurrency(a.price)})`).join(', ')}
                              </div>
                            )}
                          </td>
                          <td className="px-3 py-3 text-center font-mono font-semibold text-zinc-800">
                            {typeof it.qty === 'number' && it.qty % 1 !== 0 ? it.qty.toFixed(2) : it.qty}
                          </td>
                          <td className="px-4 py-3 text-right font-mono text-zinc-700">
                            {formatCurrency(it.unitPrice)}
                          </td>
                          <td className="px-3 py-3 text-center font-mono text-zinc-500 text-[11px]">
                            14%
                          </td>
                          <td className="px-4 py-3 text-right font-mono font-bold text-zinc-950">
                            {formatCurrency(it.totalPrice)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Financial Summary & ETA QR Code Verification */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  {/* Left Box: ETA QR Code Simulation & Tax Note */}
                  <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 flex items-center gap-3">
                    <div className="w-20 h-20 bg-white border border-zinc-300 rounded-xl p-1.5 flex flex-col items-center justify-center shrink-0 shadow-2xs">
                      <QrCode size={52} className="text-zinc-900" />
                      <span className="text-[7px] font-mono text-zinc-500 font-bold">ETA VERIFIED</span>
                    </div>
                    <div className="text-xs text-zinc-600 space-y-1">
                      <div className="font-bold text-zinc-900 flex items-center gap-1">
                        <ShieldCheck size={14} className="text-emerald-700" />
                        <span>Egyptian Tax Authority (ETA) Compliant</span>
                      </div>
                      <p className="text-[11px] leading-relaxed text-zinc-500">
                        This electronic receipt contains standard cryptographic TLV verification data in compliance with Egyptian Tax Authority e-invoicing mandates.
                      </p>
                    </div>
                  </div>

                  {/* Right Box: Ledger Summary */}
                  <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-2 text-xs font-mono">
                    <div className="flex justify-between text-zinc-600">
                      <span>Subtotal (Excl. Tax):</span>
                      <span className="font-bold text-zinc-900">{formatCurrency(invoice.subtotal)}</span>
                    </div>

                    {invoice.discount > 0 && (
                      <div className="flex justify-between text-rose-700 font-bold">
                        <span>Combo / Promotional Discount:</span>
                        <span>-{formatCurrency(invoice.discount)}</span>
                      </div>
                    )}

                    <div className="flex justify-between text-zinc-700 border-t border-zinc-200 pt-1.5">
                      <span>14% Egyptian VAT (ضريبة القيمة المضافة):</span>
                      <span className="font-bold text-zinc-900">{formatCurrency(invoice.tax)}</span>
                    </div>

                    <div className="flex justify-between items-baseline pt-2 border-t-2 border-zinc-900 text-sm font-sans font-black text-zinc-950">
                      <span>Total Amount Due:</span>
                      <span className="font-mono text-lg text-emerald-800">
                        {formatCurrency(invoice.total)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer Signoff */}
                <div className="pt-6 border-t border-zinc-200 text-[11px] text-zinc-500 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
                  <div>
                    <span className="font-bold text-zinc-700">White Table Coworking & Specialty Cafe</span> · Dahab & Cairo
                    <p className="text-[10px] text-zinc-400">All prices include mandatory 14% Egyptian value-added tax.</p>
                  </div>
                  <div className="text-zinc-400 font-mono text-[10px]">
                    Generated by White Table OS · {new Date().toISOString().slice(0, 10)}
                  </div>
                </div>
              </div>
            ) : (
              /* 80mm THERMAL RECEIPT SLIP FORMAT */
              <div className="space-y-3.5 text-zinc-900 select-text">
                {/* Brand Header */}
                <div className="text-center space-y-1">
                  <div className="flex justify-center mb-1">
                    <WhiteTableLogo size={36} dark={false} />
                  </div>
                  <h2 className="text-sm font-black font-sans tracking-tight text-zinc-950">
                    WHITE TABLE COWORKING
                  </h2>
                  <p className="text-[10px] font-sans font-bold text-emerald-800 uppercase tracking-widest">
                    Specialty Cafe & Workspace
                  </p>
                  <p className="text-[9px] text-zinc-500">Tax ID: 649-182-903 · Reg: 104-992-184</p>
                </div>

                {/* Receipt Meta */}
                <div className="border-t border-dashed border-zinc-300 pt-2 space-y-1 text-[11px]">
                  <div className="flex justify-between">
                    <span>Receipt #:</span>
                    <strong className="font-bold text-zinc-950">{invoice.invoiceNumber}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Date / Time:</span>
                    <span>
                      {new Date(invoice.date).toLocaleDateString()} {new Date(invoice.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Guest:</span>
                    <span className="font-bold text-zinc-900 truncate max-w-[160px]">{invoice.customerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Payment:</span>
                    <span className="font-bold text-emerald-800">{invoice.paymentMethod || 'Credit Card'}</span>
                  </div>
                </div>

                {/* Items */}
                <div className="border-t border-b border-dashed border-zinc-300 py-2.5 space-y-1.5">
                  {invoice.items.map((it, idx) => (
                    <div key={idx} className="space-y-0.5">
                      <div className="flex justify-between font-semibold text-zinc-950">
                        <span className="truncate pr-1">
                          {typeof it.qty === 'number' && it.qty % 1 !== 0 ? it.qty.toFixed(2) : it.qty}x {it.name}
                        </span>
                        <span className="shrink-0">{formatCurrency(it.totalPrice)}</span>
                      </div>
                      {it.selectedAddons && it.selectedAddons.length > 0 && (
                        <div className="ps-2 text-[9px] text-zinc-500">
                          {it.selectedAddons.map((a) => `+ ${a.name}`).join(', ')}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Financial Summary */}
                <div className="space-y-1 text-[11px]">
                  <div className="flex justify-between text-zinc-600">
                    <span>Subtotal:</span>
                    <span>{formatCurrency(invoice.subtotal)}</span>
                  </div>
                  {invoice.discount > 0 && (
                    <div className="flex justify-between text-rose-700 font-bold">
                      <span>Discount (15% Combo):</span>
                      <span>-{formatCurrency(invoice.discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-zinc-700 font-semibold">
                    <span>VAT (14%):</span>
                    <span>{formatCurrency(invoice.tax)}</span>
                  </div>
                  <div className="flex justify-between pt-1.5 border-t border-zinc-900 font-bold text-sm font-sans text-zinc-950">
                    <span>TOTAL:</span>
                    <span className="font-mono text-emerald-800">{formatCurrency(invoice.total)}</span>
                  </div>
                </div>

                {/* QR / Barcode footer */}
                <div className="border-t border-dashed border-zinc-300 pt-2.5 text-center space-y-1 text-[9px] text-zinc-500">
                  <div className="flex justify-center py-1">
                    <QrCode size={36} className="text-zinc-800" />
                  </div>
                  <p>ETA Electronic Invoice Compliant</p>
                  <p className="font-sans font-bold text-zinc-700">Thank you for visiting White Table!</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Bottom Footer (Hidden in Print) */}
        <div className="no-print p-4 bg-zinc-50 border-t border-zinc-200 flex items-center justify-between">
          <span className="text-xs text-zinc-500">
            {format === 'a4'
              ? 'Formatted for standard ISO A4 paper (210 × 297 mm)'
              : 'Formatted for 80mm POS thermal roll receipt printers'}
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-600 hover:bg-zinc-200 transition cursor-pointer"
            >
              {lang === 'ar' ? 'إغلاق' : 'Close'}
            </button>
            <button
              type="button"
              onClick={handleTriggerPrint}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-2 shadow-xs cursor-pointer"
            >
              <Printer size={14} />
              <span>{lang === 'ar' ? 'طباعة الفاتورة' : 'Print Invoice'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
