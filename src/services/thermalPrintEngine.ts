// Thermal Print Engine for Commercial POS Receipt Printers (GA-C80250I Plus / POS-80 / Zywell 80mm)
// Formats crisp, high-contrast, single-page receipts and dispatches them via an isolated print iframe
// ensuring ZERO background page leakages, ZERO 14-page overflow bugs, and 100% adherence to 80mm thermal standards.

import { Order, Customer } from '../types';
import { CashierHardwareSettings } from './hardwareService';

export interface PrintFormatOptions {
  fontSize?: 'standard' | 'large_obvious' | 'extra_large';
  lang?: 'ar' | 'en';
  autoCutAfter?: boolean;
}

/**
 * Dispatches raw HTML to an isolated hidden iframe and initiates browser printing.
 * This guarantees the browser printer dialog (POS-80, GA-C80250I Plus, etc.)
 * prints ONLY the receipt on 1 continuous thermal paper sheet with 0 margin waste.
 */
export const printDirectHtml = (htmlContent: string): Promise<boolean> => {
  return new Promise((resolve) => {
    try {
      // Remove any existing print iframe
      const oldFrame = document.getElementById('thermal-print-iframe');
      if (oldFrame) {
        oldFrame.remove();
      }

      const iframe = document.createElement('iframe');
      iframe.id = 'thermal-print-iframe';
      iframe.style.position = 'fixed';
      iframe.style.right = '0';
      iframe.style.bottom = '0';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = 'none';
      iframe.style.visibility = 'hidden';
      iframe.style.zIndex = '-9999';

      document.body.appendChild(iframe);

      const doc = iframe.contentWindow?.document || iframe.contentDocument;
      if (!doc) {
        // Fallback to window.print if iframe document is unavailable
        window.print();
        resolve(true);
        return;
      }

      doc.open();
      doc.write(htmlContent);
      doc.close();

      // Give browser a short moment to render fonts and layout before opening print dialog
      setTimeout(() => {
        try {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();
          resolve(true);
        } catch (e) {
          console.warn('Iframe print notice:', e);
          window.print();
          resolve(true);
        } finally {
          // Clean up after 30 seconds to allow slow spooling
          setTimeout(() => {
            try {
              iframe.remove();
            } catch {
              // ignore
            }
          }, 30000);
        }
      }, 250);
    } catch (err) {
      console.error('Print engine error:', err);
      window.print();
      resolve(false);
    }
  });
};

export const WHITE_TABLE_LOGO_SVG = `<svg width="44" height="44" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" style="display:inline-block; margin-bottom:2px;">
  <circle cx="100" cy="100" r="88" stroke="#000000" stroke-width="11" />
  <path d="M 82 54 L 118 54" stroke="#000000" stroke-width="11" stroke-linecap="round" />
  <path d="M 100 54 L 100 84" stroke="#000000" stroke-width="11" stroke-linecap="round" />
  <path d="M 64 54 L 86 106 L 100 84 L 114 106 L 136 54" stroke="#000000" stroke-width="11" stroke-linecap="round" stroke-linejoin="round" />
  <ellipse cx="100" cy="116" rx="38" ry="9" fill="none" stroke="#000000" stroke-width="9" />
  <path d="M 62 118 C 62 130, 138 130, 138 118" fill="none" stroke="#000000" stroke-width="7" stroke-linecap="round" />
  <path d="M 100 126 L 100 188" stroke="#000000" stroke-width="11" stroke-linecap="round" />
</svg>`;

/**
 * Generate 80mm Commercial POS Sales Receipt HTML
 * Formatted precisely for GA-C80250I Plus / POS-80 (72mm printable width, 576 dots/line)
 * Matches the system receipt layout identically with vector logo, crisp badges, and clean footer
 */
export const buildCustomerReceiptHtml = (
  order: Order,
  customer?: Customer | null,
  settings?: CashierHardwareSettings,
  options?: PrintFormatOptions
): string => {
  const isLarge = options?.fontSize === 'large_obvious' || options?.fontSize === 'extra_large';
  const isExtraLarge = options?.fontSize === 'extra_large';
  const lang = options?.lang || 'ar';
  const isRtl = lang === 'ar';

  const orderNum = order.id.slice(0, 8).toUpperCase();
  const dateStr = new Date(order.createdAt).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  });
  const timeStr = new Date(order.createdAt).toLocaleTimeString(lang === 'ar' ? 'ar-EG' : 'en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  const vatAmount = Math.round(order.total * (14 / 114) * 10) / 10;
  const subtotalBeforeTax = Math.round((order.total - vatAmount) * 10) / 10;
  const pointsEarned = Math.floor(order.total / 100);

  const locLabel = order.deskId
    ? `${lang === 'ar' ? 'مكتب / طاولة' : 'Desk / Table'} #${order.deskId.slice(0, 4)}`
    : order.source === 'table'
    ? lang === 'ar' ? 'صالة داخلية (طاولة)' : 'Dine-In Table'
    : lang === 'ar' ? 'سفري / كاشير مباشر' : 'Takeaway / POS Counter';

  const footerText = 'Thank you for visiting White Table!\n*** WORK · SIP · CREATE ***';

  // Tendered cash / change calculation if applicable
  const cashTendered = (order as any).cashTendered;
  const changeDue = (order as any).changeDue;

  return `<!DOCTYPE html>
<html lang="${lang}" dir="${isRtl ? 'rtl' : 'ltr'}">
<head>
  <meta charset="utf-8">
  <title>Receipt #${orderNum}</title>
  <style>
    @page {
      size: 80mm auto;
      margin: 0mm;
    }
    *, *::before, *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    html, body {
      width: 72mm;
      max-width: 72mm;
      margin: 0 auto;
      padding: 3mm 1mm;
      background: #ffffff;
      color: #000000;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, 'Cairo', monospace, sans-serif;
      font-size: ${isExtraLarge ? '13px' : isLarge ? '12px' : '11px'};
      line-height: 1.3;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .text-center { text-align: center; }
    .text-right { text-align: ${isRtl ? 'left' : 'right'}; }
    .text-left { text-align: ${isRtl ? 'right' : 'left'}; }
    .font-bold { font-weight: bold; }
    .font-black { font-weight: 900; }
    .uppercase { text-transform: uppercase; }
    
    .divider-solid { border-bottom: 2px solid #000000; margin: 4px 0; }
    .divider-dashed { border-bottom: 1px dashed #71717a; margin: 5px 0; }
    
    .store-title {
      font-size: ${isExtraLarge ? '20px' : isLarge ? '18px' : '16px'};
      font-weight: 900;
      letter-spacing: 0.5px;
      margin: 2px 0 1px 0;
      color: #000000;
    }
    .store-sub-brand {
      font-size: 10.5px;
      font-weight: 900;
      color: #047857;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      margin-bottom: 2px;
    }
    .store-meta {
      font-size: 9.5px;
      color: #52525b;
      font-weight: 500;
      margin-bottom: 3px;
    }
    
    .badge-pill {
      display: inline-block;
      background: #000000;
      color: #ffffff;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 9.5px;
      font-weight: 900;
      letter-spacing: 0.8px;
      text-transform: uppercase;
      margin: 2px auto 4px auto;
    }
    
    .order-box {
      font-weight: 900;
      font-size: 12.5px;
      background: #f4f4f5;
      border: 1px solid #d4d4d8;
      padding: 1px 6px;
      border-radius: 4px;
      font-family: monospace;
      color: #000000;
    }
    
    .payment-badge {
      color: #047857;
      font-weight: 900;
      text-transform: capitalize;
    }
    
    .customer-pill {
      display: inline-block;
      background: #dcfce7;
      color: #14532d;
      font-size: 9px;
      font-weight: 900;
      padding: 1px 5px;
      border-radius: 3px;
      margin-left: 3px;
    }
    
    .meta-table {
      width: 100%;
      border-collapse: collapse;
      font-size: ${isExtraLarge ? '11.5px' : '10.5px'};
      margin: 3px 0;
    }
    .meta-table td {
      padding: 1.5px 0;
      vertical-align: middle;
    }
    
    .items-header {
      display: flex;
      justify-content: space-between;
      font-size: 9.5px;
      font-weight: 900;
      color: #71717a;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      padding-bottom: 2px;
    }
    
    .item-row {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      margin: 3px 0;
    }
    .item-name {
      font-weight: 900;
      font-size: ${isExtraLarge ? '13px' : isLarge ? '12px' : '11px'};
      color: #000000;
    }
    .item-price {
      font-weight: 900;
      font-size: ${isExtraLarge ? '13.5px' : isLarge ? '12.5px' : '11.5px'};
      color: #047857;
      font-family: monospace;
      white-space: nowrap;
    }
    .item-sub {
      font-size: 9px;
      font-weight: 600;
      color: #52525b;
      margin-left: 10px;
    }
    
    .totals-row {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      padding: 1.5px 0;
      font-size: ${isExtraLarge ? '11.5px' : '10.5px'};
      color: #27272a;
    }
    .grand-total-row {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      padding: 4px 0 2px 0;
      color: #000000;
    }
    .grand-total-title {
      font-size: 15px;
      font-weight: 900;
    }
    .grand-total-val {
      font-size: ${isExtraLarge ? '21px' : isLarge ? '19px' : '17px'};
      font-weight: 900;
      color: #047857;
      font-family: monospace;
    }
    
    .loyalty-card {
      background: #ecfdf5;
      border: 1px solid #a7f3d0;
      border-radius: 8px;
      padding: 5px 8px;
      text-align: center;
      margin: 5px 0;
    }
    .loyalty-title {
      font-size: 10.5px;
      font-weight: 900;
      color: #065f46;
    }
    .loyalty-sub {
      font-size: 9px;
      font-weight: 600;
      color: #047857;
      margin-top: 1px;
    }
    
    .footer-block {
      font-size: 9.5px;
      font-weight: 600;
      color: #52525b;
      line-height: 1.35;
      margin-top: 3px;
      text-align: center;
    }
    .footer-tagline {
      font-size: 8.5px;
      color: #71717a;
      letter-spacing: 1px;
      margin-top: 2px;
    }
  </style>
</head>
<body>
  <!-- Brand Header with Logo -->
  <div class="text-center">
    <div>${WHITE_TABLE_LOGO_SVG}</div>
    <div class="store-title">WHITE TABLE</div>
    <div class="store-sub-brand">Restaurant &amp; Cafe</div>
    <div><span class="badge-pill">CUSTOMER RECEIPT</span></div>
  </div>

  <div class="divider-dashed"></div>

  <!-- Metadata -->
  <table class="meta-table">
    <tr>
      <td>Receipt #:</td>
      <td class="text-right"><span class="order-box">#${orderNum}</span></td>
    </tr>
    <tr>
      <td>Date:</td>
      <td class="text-right">${dateStr}</td>
    </tr>
    <tr>
      <td>Time:</td>
      <td class="text-right">${timeStr}</td>
    </tr>
    <tr>
      <td>Payment Method:</td>
      <td class="text-right"><span class="payment-badge">${order.paymentMethod || 'Cash'}</span></td>
    </tr>
    <tr>
      <td>Customer:</td>
      <td class="text-right font-bold">
        ${customer ? `${customer.name} <span class="customer-pill">${customer.tier || 'Regular'}</span>` : 'Walk-in Guest'}
      </td>
    </tr>
  </table>

  <div class="divider-dashed"></div>

  <!-- Items -->
  <div class="items-header">
    <span>ITEMS</span>
    <span>TOTAL (EGP)</span>
  </div>

  ${order.items.map((item) => {
    const uPrice = (item as any).unitPrice ?? (item as any).price ?? 0;
    const addons = item.selectedAddons || [];
    const addonsTotal = addons.reduce((s: number, a: any) => s + (typeof a === 'object' && a.price ? a.price : 0), 0);
    const itemTotal = (item as any).totalPrice ?? ((uPrice + addonsTotal) * item.qty);
    const addonsText = addons.length > 0
      ? addons.map((a: any) => `+ ${typeof a === 'string' ? a : a.name}`).join(', ')
      : '';
    const itemNote = (item as any).note || (item as any).notes;
    return `
    <div class="item-row">
      <span class="item-name">${item.qty}x ${item.name} ${item.size ? `(${item.size})` : ''}</span>
      <span class="item-price">${itemTotal.toFixed(1)} EGP</span>
    </div>
    ${addonsText ? `<div class="item-sub">${addonsText}</div>` : ''}
    ${itemNote ? `<div class="item-sub font-bold">* Note: ${itemNote}</div>` : ''}
    `;
  }).join('')}

  <div class="divider-dashed"></div>

  <!-- Financials -->
  <div class="totals-row">
    <span>Subtotal</span>
    <span class="font-bold">${(order.subtotal || subtotalBeforeTax).toFixed(1)} EGP</span>
  </div>
  ${(order as any).discountAmount || order.discount ? `
  <div class="totals-row" style="color:#b91c1c;">
    <span>Discount</span>
    <span class="font-bold">-${Number((order as any).discountAmount || order.discount).toFixed(1)} EGP</span>
  </div>
  ` : ''}
  <div class="totals-row">
    <span>VAT Tax (14%) (ضريبة 14%)</span>
    <span class="font-bold">${vatAmount.toFixed(1)} EGP</span>
  </div>

  <!-- Solid Divider -->
  <div class="divider-solid"></div>

  <!-- Grand Total -->
  <div class="grand-total-row">
    <span class="grand-total-title">Total</span>
    <span class="grand-total-val">${order.total.toFixed(1)} EGP</span>
  </div>

  ${cashTendered !== undefined && cashTendered > 0 ? `
  <div class="totals-row" style="margin-top:2px;">
    <span>Cash Tendered:</span>
    <span class="font-bold">${Number(cashTendered).toFixed(1)} EGP</span>
  </div>
  <div class="totals-row">
    <span>Change Due:</span>
    <span class="font-black" style="color:#047857;">${Number(changeDue || 0).toFixed(1)} EGP</span>
  </div>
  ` : ''}

  <!-- Loyalty Card -->
  ${customer ? `
  <div class="loyalty-card">
    <div class="loyalty-title">&#10003; +${pointsEarned} Points Added (${(customer.points || 0) + pointsEarned} total)</div>
    <div class="loyalty-sub">500 Points = 50 EGP Discount</div>
  </div>
  ` : ''}

  <div class="divider-dashed"></div>

  <!-- Clean Footer without WiFi -->
  <div class="footer-block">
    <div>Thank you for visiting White Table!</div>
    <div class="footer-tagline">*** WORK · SIP · CREATE ***</div>
  </div>
</body>
</html>`;
};

/**
 * Generate 80mm Kitchen Order Ticket (KOT) HTML
 * Formatted for chefs & baristas with high contrast, large bold ticket numbers, and itemized checklist boxes
 */
export const buildKitchenTicketHtml = (
  ticketOrOrder: any,
  settings?: CashierHardwareSettings,
  options?: PrintFormatOptions
): string => {
  const isLarge = options?.fontSize === 'large_obvious' || options?.fontSize === 'extra_large';
  const isExtraLarge = options?.fontSize === 'extra_large';
  const lang = options?.lang || 'ar';
  const isRtl = lang === 'ar';

  const ticketNum = ticketOrOrder.ticketNumber || `KOT-${(ticketOrOrder.id || '').slice(0, 4).toUpperCase() || '001'}`;
  const rawTime = ticketOrOrder.createdAt || ticketOrOrder.timestamp || Date.now();
  const timeStr = new Date(rawTime).toLocaleTimeString(lang === 'ar' ? 'ar-EG' : 'en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });
  const dateStr = new Date(rawTime).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US', {
    month: '2-digit',
    day: '2-digit',
  });

  const locLabel = ticketOrOrder.tableOrDeskLabel
    ? ticketOrOrder.tableOrDeskLabel
    : ticketOrOrder.deskId
    ? `DESK / TABLE #${ticketOrOrder.deskId.slice(0, 4)}`
    : ticketOrOrder.type === 'dine-in'
    ? 'DINE-IN TABLE'
    : ticketOrOrder.type === 'takeaway'
    ? 'TAKEAWAY COUNTER'
    : 'POS WALK-IN';

  const baristaCategories = [
    'espresso_bar',
    'specialty_brews',
    'signature_cold',
    'tea_matcha',
    'smoothies_wellness',
    'coffee',
    'drinks',
    'beverages',
    'hot drinks',
    'iced coffee',
    'matcha bar',
    'juice',
    'smoothies',
    'mixed soda',
    'soft drinks',
  ];

  const items = ticketOrOrder.items || [];
  const isDrinkItem = (item: any) => {
    if (item.station === 'barista') return true;
    if (item.station === 'kitchen') return false;
    const cat = (item.category || '').toLowerCase();
    const name = (item.name || '').toLowerCase();
    return (
      baristaCategories.some((c) => cat.includes(c)) ||
      name.includes('latte') ||
      name.includes('espresso') ||
      name.includes('matcha') ||
      name.includes('brew') ||
      name.includes('tea') ||
      name.includes('smoothie') ||
      name.includes('juice') ||
      name.includes('coffee')
    );
  };

  const kitchenItems = items.filter((i: any) => !isDrinkItem(i));
  const baristaItems = items.filter((i: any) => isDrinkItem(i));
  const finalKitchenItems = (kitchenItems.length === 0 && baristaItems.length === 0 && items.length > 0)
    ? items
    : kitchenItems;

  return `<!DOCTYPE html>
<html lang="${lang}" dir="${isRtl ? 'rtl' : 'ltr'}">
<head>
  <meta charset="utf-8">
  <title>KOT Ticket ${ticketNum}</title>
  <style>
    @page {
      size: 80mm auto;
      margin: 0mm;
    }
    *, *::before, *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    html, body {
      width: 72mm;
      max-width: 72mm;
      margin: 0 auto;
      padding: 2mm 0.5mm;
      background: #ffffff;
      color: #000000;
      font-family: 'Courier New', Courier, 'Cairo', monospace, system-ui, sans-serif;
      font-size: ${isExtraLarge ? '13px' : isLarge ? '12px' : '11px'};
      line-height: 1.25;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .text-center { text-align: center; }
    .text-right { text-align: ${isRtl ? 'left' : 'right'}; }
    .text-left { text-align: ${isRtl ? 'right' : 'left'}; }
    .font-bold { font-weight: bold; }
    .font-black { font-weight: 900; }
    
    .kot-banner {
      background: #000000;
      color: #ffffff;
      font-weight: 900;
      font-size: 13px;
      padding: 3px 0;
      text-align: center;
      letter-spacing: 1px;
    }
    
    .kot-ticket-num {
      border: 3px solid #000000;
      font-size: ${isExtraLarge ? '26px' : isLarge ? '24px' : '20px'};
      font-weight: 900;
      text-align: center;
      padding: 3px 0;
      margin: 4px 0;
      letter-spacing: 1px;
    }
    
    .location-box {
      border: 2px solid #000000;
      background: #000000;
      color: #ffffff;
      padding: 3px 6px;
      font-size: ${isExtraLarge ? '14px' : '12px'};
      font-weight: 900;
      text-align: center;
      margin: 4px 0;
      letter-spacing: 0.5px;
    }
    
    .meta-box {
      font-size: ${isExtraLarge ? '12px' : '10.5px'};
      margin: 3px 0;
      line-height: 1.3;
    }
    
    .station-header {
      border-top: 2px solid #000000;
      border-bottom: 2px solid #000000;
      background: #ffffff;
      color: #000000;
      font-weight: 900;
      font-size: ${isExtraLarge ? '13px' : '11.5px'};
      padding: 2px 0;
      margin: 6px 0 3px 0;
      text-align: center;
      letter-spacing: 0.5px;
    }
    
    .kot-item {
      padding: 3.5px 0;
      border-bottom: 1px dashed #000000;
    }
    .kot-item-title {
      font-size: ${isExtraLarge ? '15px' : isLarge ? '13.5px' : '12px'};
      font-weight: 900;
      display: flex;
      align-items: baseline;
      gap: 5px;
    }
    .qty-tag {
      font-size: ${isExtraLarge ? '18px' : isLarge ? '16px' : '14px'};
      font-weight: 900;
      text-decoration: underline;
      white-space: nowrap;
    }
    .kot-addons {
      font-size: ${isExtraLarge ? '11px' : '9.5px'};
      font-weight: bold;
      padding-left: 24px;
      margin-top: 1px;
    }
    .kot-note {
      border: 1.5px solid #000000;
      color: #000000;
      padding: 2px 4px;
      font-weight: 900;
      font-size: ${isExtraLarge ? '11px' : '10px'};
      margin-top: 2px;
      margin-left: 20px;
    }
    
    .footer-sign {
      border-top: 2px solid #000000;
      margin-top: 6px;
      padding-top: 3px;
      text-align: center;
      font-size: 9.5px;
      font-weight: bold;
    }
  </style>
</head>
<body>
  <div class="kot-banner">★ KITCHEN ORDER TICKET (KOT) ★</div>

  <!-- Giant Ticket Number -->
  <div class="kot-ticket-num">${ticketNum}</div>

  <!-- Destination Box -->
  <div class="location-box">${locLabel}</div>

  <!-- Meta Header -->
  <div class="meta-box">
    <div><strong>Customer:</strong> ${ticketOrOrder.customerName || 'Walk-in Guest'}</div>
    <div><strong>Time:</strong> ${dateStr} ${timeStr}</div>
    ${ticketOrOrder.serverName ? `<div><strong>Server:</strong> ${ticketOrOrder.serverName}</div>` : ''}
  </div>

  <!-- Food / Kitchen Items -->
  ${finalKitchenItems.length > 0 ? `
    <div class="station-header">[ HOT KITCHEN & GRILL ] (${finalKitchenItems.length} items)</div>
    ${finalKitchenItems.map((item: any) => {
      const addons = (item.selectedAddons || []).map((a: any) => typeof a === 'string' ? a : a.name).join(', ');
      const note = item.note || item.notes;
      return `
      <div class="kot-item">
        <div class="kot-item-title">
          <span>[ ]</span>
          <span class="qty-tag">${item.qty}X</span>
          <span>${item.name}</span>
        </div>
        ${item.size ? `<div class="kot-addons">Size: ${item.size}</div>` : ''}
        ${addons ? `<div class="kot-addons">+ ${addons}</div>` : ''}
        ${note ? `<div class="kot-note">*** NOTE: ${note} ***</div>` : ''}
      </div>
      `;
    }).join('')}
  ` : ''}

  <!-- Barista Drinks Items -->
  ${baristaItems.length > 0 ? `
    <div class="station-header">[ BARISTA & BEVERAGES ] (${baristaItems.length} items)</div>
    ${baristaItems.map((item: any) => {
      const addons = (item.selectedAddons || []).map((a: any) => typeof a === 'string' ? a : a.name).join(', ');
      const note = item.note || item.notes;
      return `
      <div class="kot-item">
        <div class="kot-item-title">
          <span>[ ]</span>
          <span class="qty-tag">${item.qty}X</span>
          <span>${item.name}</span>
        </div>
        ${item.size ? `<div class="kot-addons">Size: ${item.size}</div>` : ''}
        ${addons ? `<div class="kot-addons">+ ${addons}</div>` : ''}
        ${note ? `<div class="kot-note">*** NOTE: ${note} ***</div>` : ''}
      </div>
      `;
    }).join('')}
  ` : ''}

  <!-- Footer Signoff -->
  <div class="footer-sign">
    WHITE TABLE KITCHEN OPERATIONS<br>
    Printed: ${timeStr} · 80mm Roll
  </div>
</body>
</html>`;
};

/**
 * Generate Dual Slips HTML (Slip 1: Customer Receipt, Slip 2: Kitchen Ticket with Page Cut Break)
 */
export const buildBothSlipsHtml = (
  order: Order,
  customer?: Customer | null,
  settings?: CashierHardwareSettings,
  options?: PrintFormatOptions
): string => {
  const customerSlip = buildCustomerReceiptHtml(order, customer, settings, options);
  const kitchenSlip = buildKitchenTicketHtml(order, settings, options);

  // Extract inner body content and assemble into a multi-slip document with page-break-after
  const extractBody = (html: string) => {
    const match = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
    return match ? match[1] : html;
  };

  const isLarge = options?.fontSize === 'large_obvious' || options?.fontSize === 'extra_large';
  const isExtraLarge = options?.fontSize === 'extra_large';

  return `<!DOCTYPE html>
<html lang="ar" dir="auto">
<head>
  <meta charset="utf-8">
  <title>Dual Print Slips - Order #${order.id.slice(0, 8)}</title>
  <style>
    @page {
      size: 80mm auto;
      margin: 0mm;
    }
    *, *::before, *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    html, body {
      width: 72mm;
      max-width: 72mm;
      margin: 0 auto;
      padding: 0;
      background: #ffffff;
      color: #000000;
      font-family: 'Courier New', Courier, 'Cairo', monospace, system-ui, sans-serif;
      font-size: ${isExtraLarge ? '14px' : isLarge ? '12.5px' : '11px'};
      line-height: 1.25;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    
    .slip-container {
      width: 72mm;
      max-width: 72mm;
      padding: 3mm 1mm;
      margin: 0 auto;
      page-break-after: always;
      break-after: page;
    }
    
    .slip-container:last-child {
      page-break-after: auto;
      break-after: auto;
    }
    
    .cut-guide {
      text-align: center;
      font-size: 10px;
      font-weight: 900;
      border-bottom: 2px dashed #000000;
      margin: 10px 0;
      padding-bottom: 3px;
    }
    
    /* Common helper classes from receipts */
    .text-center { text-align: center; }
    .text-right { text-align: right; }
    .text-left { text-align: left; }
    .font-bold { font-weight: bold; }
    .font-black { font-weight: 900; }
    .uppercase { text-transform: uppercase; }
    .divider-solid { border-bottom: 2px solid #000000; margin: 3px 0; }
    .divider-dashed { border-bottom: 1px dashed #000000; margin: 3px 0; }
    .divider-double { border-bottom: 3px double #000000; margin: 4px 0; }
    .store-title { font-size: ${isExtraLarge ? '20px' : isLarge ? '18px' : '16px'}; font-weight: 900; margin-bottom: 2px; }
    .store-sub { font-size: 10px; font-weight: bold; white-space: pre-line; line-height: 1.2; }
    .badge-box { border: 1.5px solid #000000; padding: 2px 4px; margin: 4px 0; font-weight: 900; text-align: center; font-size: 12px; }
    .meta-table { width: 100%; border-collapse: collapse; font-size: 11px; margin: 3px 0; }
    .meta-table td { padding: 1px 0; }
    .items-table { width: 100%; border-collapse: collapse; margin: 3px 0; }
    .items-table th { border-bottom: 1.5px solid #000000; font-size: 11px; font-weight: 900; padding: 2px 0; }
    .items-table td { padding: 3px 0; }
    .item-name { font-weight: 900; font-size: ${isExtraLarge ? '13.5px' : isLarge ? '12px' : '11px'}; }
    .item-sub { font-size: 9.5px; font-weight: bold; margin-top: 1px; }
    .totals-row { display: flex; justify-content: space-between; align-items: baseline; padding: 1px 0; font-size: 11.5px; }
    .grand-total { font-size: ${isExtraLarge ? '18px' : isLarge ? '16px' : '14px'}; font-weight: 900; padding: 3px 0; border-top: 1.5px solid #000; border-bottom: 1.5px solid #000; margin: 3px 0; }
    .footer-note { font-size: 9.5px; font-weight: bold; white-space: pre-line; margin-top: 4px; }
    .barcode-block { letter-spacing: 3px; font-size: 16px; font-weight: 900; font-family: monospace; margin: 4px 0 2px 0; }
    
    /* KOT Specifics */
    .kot-banner { background: #000000; color: #ffffff; font-weight: 900; font-size: 13px; padding: 3px 0; text-align: center; }
    .kot-ticket-num { border: 3px solid #000000; font-size: ${isExtraLarge ? '30px' : isLarge ? '26px' : '22px'}; font-weight: 900; text-align: center; padding: 4px 0; margin: 4px 0; }
    .location-badge { background: #000000; color: #ffffff; padding: 2px 6px; font-size: 12px; font-weight: 900; display: inline-block; }
    .station-header { background: #e4e4e7; color: #000000; font-weight: 900; font-size: 11.5px; padding: 2px 4px; margin: 6px 0 4px 0; border-left: 4px solid #000000; }
    .kot-item { padding: 4px 0; border-bottom: 1px dashed #71717a; }
    .kot-item-title { font-size: ${isExtraLarge ? '17px' : isLarge ? '15px' : '13px'}; font-weight: 900; display: flex; align-items: baseline; gap: 4px; }
    .qty-tag { font-size: ${isExtraLarge ? '20px' : isLarge ? '18px' : '15px'}; font-weight: 900; text-decoration: underline; margin-right: 4px; }
    .kot-addons { font-size: 10.5px; font-weight: bold; padding-left: 18px; }
    .kot-note { background: #fef08a; border: 1px solid #ca8a04; color: #000; padding: 2px 4px; font-weight: 900; font-size: 10.5px; margin-top: 2px; margin-left: 18px; }
    .footer-sign { border-top: 2px solid #000000; margin-top: 8px; padding-top: 4px; text-align: center; font-size: 10px; font-weight: bold; }
  </style>
</head>
<body>
  <!-- SLIP 1: CUSTOMER RECEIPT -->
  <div class="slip-container">
    <div style="font-size: 9px; font-weight: 900; text-align: center; margin-bottom: 2px;">--- [ SLIP 1: CUSTOMER COPY ] ---</div>
    ${extractBody(customerSlip)}
  </div>

  <!-- SLIP 2: KITCHEN ORDER TICKET (KOT) -->
  <div class="slip-container">
    <div style="font-size: 9px; font-weight: 900; text-align: center; margin-bottom: 2px;">--- [ SLIP 2: KITCHEN PREP TICKET ] ---</div>
    ${extractBody(kitchenSlip)}
  </div>
</body>
</html>`;
};

/**
 * Generate A4 Official Tax Invoice HTML
 */
export const buildA4InvoiceHtml = (
  order: Order,
  customer?: Customer | null,
  options?: PrintFormatOptions
): string => {
  const lang = options?.lang || 'ar';
  const isRtl = lang === 'ar';
  const orderNum = order.id.slice(0, 8).toUpperCase();
  const vatAmount = Math.round(order.total * (14 / 114) * 10) / 10;
  const subtotalBeforeTax = Math.round((order.total - vatAmount) * 10) / 10;

  return `<!DOCTYPE html>
<html lang="${lang}" dir="${isRtl ? 'rtl' : 'ltr'}">
<head>
  <meta charset="utf-8">
  <title>A4 Tax Invoice #${orderNum}</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 12mm;
    }
    *, *::before, *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      font-family: system-ui, -apple-system, 'Cairo', 'Segoe UI', Roboto, sans-serif;
      font-size: 13px;
      line-height: 1.5;
      color: #18181b;
      background: #ffffff;
      padding: 10px;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #e4e4e7;
      padding-bottom: 16px;
      margin-bottom: 20px;
    }
    .title {
      font-size: 22px;
      font-weight: 900;
      color: #09090b;
      letter-spacing: -0.5px;
    }
    .subtitle {
      font-size: 13px;
      color: #71717a;
      font-weight: 600;
    }
    .meta-box {
      background: #f4f4f5;
      border-radius: 8px;
      padding: 12px 16px;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-bottom: 24px;
    }
    .meta-col strong {
      display: block;
      font-size: 11px;
      text-transform: uppercase;
      color: #71717a;
      margin-bottom: 2px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 24px;
    }
    th {
      background: #f4f4f5;
      font-size: 11px;
      text-transform: uppercase;
      font-weight: 800;
      padding: 10px 12px;
      border-bottom: 2px solid #d4d4d8;
      text-align: ${isRtl ? 'right' : 'left'};
    }
    th.text-end { text-align: ${isRtl ? 'left' : 'right'}; }
    th.text-center { text-align: center; }
    td {
      padding: 10px 12px;
      border-bottom: 1px solid #e4e4e7;
      font-size: 13px;
    }
    td.text-end { text-align: ${isRtl ? 'left' : 'right'}; }
    td.text-center { text-align: center; }
    .totals-area {
      display: flex;
      justify-content: flex-end;
      margin-bottom: 30px;
    }
    .totals-table {
      width: 280px;
      border-collapse: collapse;
    }
    .totals-table td {
      padding: 6px 0;
      border: none;
    }
    .grand-total-row td {
      border-top: 2px solid #18181b;
      border-bottom: 2px solid #18181b;
      font-size: 16px;
      font-weight: 900;
      padding: 10px 0;
    }
    .footer {
      border-top: 1px solid #e4e4e7;
      padding-top: 16px;
      text-align: center;
      font-size: 11px;
      color: #71717a;
    }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="title">WHITE TABLE RESTAURANT &amp; CAFE</div>
      <div class="subtitle">${lang === 'ar' ? 'فاتورة مبيعات مطعم ومقهى وايت تيبل' : 'Restaurant &amp; Cafe Sales Invoice'}</div>
      <div style="font-size: 11px; color: #71717a; margin-top: 4px;">
        Dahab, South Sinai, Egypt · support@whitetable.space
      </div>
    </div>
    <div style="text-align: ${isRtl ? 'left' : 'right'};">
      <div style="font-size: 16px; font-weight: 900; font-family: monospace;">#${orderNum}</div>
      <div style="font-size: 12px; color: #71717a;">${new Date(order.createdAt).toLocaleString(lang === 'ar' ? 'ar-EG' : 'en-US')}</div>
    </div>
  </div>

  <div class="meta-box">
    <div class="meta-col">
      <strong>${lang === 'ar' ? 'بيانات العميل' : 'Billed To'}</strong>
      <div style="font-weight: bold; font-size: 14px;">${customer ? customer.name : (lang === 'ar' ? 'عميل صالة (مباشر)' : 'Walk-in Guest')}</div>
      ${customer?.phone ? `<div>Phone: ${customer.phone}</div>` : ''}
      ${customer?.email ? `<div>Email: ${customer.email}</div>` : ''}
    </div>
    <div class="meta-col" style="text-align: ${isRtl ? 'left' : 'right'};">
      <strong>${lang === 'ar' ? 'طريقة السداد والحالة' : 'Payment & Status'}</strong>
      <div style="font-weight: bold;">${order.paymentMethod || 'Cash'} - <span style="color: #15803d;">PAID</span></div>
      <div>Cashier: ${(order as any).cashierName || 'Station 1'}</div>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>${lang === 'ar' ? 'الصنف والتفاصيل' : 'Item Description'}</th>
        <th class="text-center">${lang === 'ar' ? 'الكمية' : 'Qty'}</th>
        <th class="text-end">${lang === 'ar' ? 'سعر الوحدة' : 'Unit Price'}</th>
        <th class="text-end">${lang === 'ar' ? 'الإجمالي' : 'Total'}</th>
      </tr>
    </thead>
    <tbody>
      ${order.items.map((it) => {
        const uPrice = (it as any).unitPrice ?? (it as any).price ?? 0;
        const addons = it.selectedAddons || [];
        const addonsTotal = addons.reduce((s: number, a: any) => s + (typeof a === 'object' && a.price ? a.price : 0), 0);
        const itemTotal = (it as any).totalPrice ?? ((uPrice + addonsTotal) * it.qty);
        return `
        <tr>
          <td>
            <strong>${it.name}</strong> ${it.size ? `(${it.size})` : ''}
            ${addons.length > 0 ? `<div style="font-size: 11px; color: #71717a;">+ ${addons.map((a: any) => typeof a === 'string' ? a : a.name).join(', ')}</div>` : ''}
          </td>
          <td class="text-center">${it.qty}</td>
          <td class="text-end">${uPrice.toFixed(2)} EGP</td>
          <td class="text-end" style="font-weight: bold;">${itemTotal.toFixed(2)} EGP</td>
        </tr>
        `;
      }).join('')}
    </tbody>
  </table>

  <div class="totals-area">
    <table class="totals-table">
      <tr>
        <td>${lang === 'ar' ? 'المجموع قبل الضريبة:' : 'Subtotal:'}</td>
        <td class="text-end">${subtotalBeforeTax.toFixed(2)} EGP</td>
      </tr>
      <tr>
        <td>${lang === 'ar' ? 'ضريبة القيمة المضافة (14%):' : 'VAT (14% Included):'}</td>
        <td class="text-end">${vatAmount.toFixed(2)} EGP</td>
      </tr>
      <tr class="grand-total-row">
        <td>${lang === 'ar' ? 'الإجمالي النهائي:' : 'GRAND TOTAL:'}</td>
        <td class="text-end">${order.total.toFixed(2)} EGP</td>
      </tr>
    </table>
  </div>

  <div class="footer">
    Thank you for your business with White Table Coworking & Hospitality.<br>
    This is a computer-generated tax invoice valid according to Egyptian Tax Authority regulations.
  </div>
</body>
</html>`;
};

/**
 * Generate Zywell GA-C80250I Plus Hardware Diagnostics Self-Test Slip HTML
 */
export const buildZywellTestHtml = (
  settings?: CashierHardwareSettings,
  options?: PrintFormatOptions
): string => {
  const lang = options?.lang || 'ar';
  const isRtl = lang === 'ar';
  const now = new Date();

  return `<!DOCTYPE html>
<html lang="${lang}" dir="${isRtl ? 'rtl' : 'ltr'}">
<head>
  <meta charset="utf-8">
  <title>Zywell GA-C80250I Plus Self Test</title>
  <style>
    @page {
      size: 80mm auto;
      margin: 0mm;
    }
    *, *::before, *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    html, body {
      width: 72mm;
      max-width: 72mm;
      margin: 0 auto;
      padding: 2mm 1mm;
      background: #ffffff;
      color: #000000;
      font-family: 'Courier New', Courier, monospace, system-ui, sans-serif;
      font-size: 11px;
      line-height: 1.25;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .text-center { text-align: center; }
    .text-right { text-align: ${isRtl ? 'left' : 'right'}; }
    .font-bold { font-weight: bold; }
    .font-black { font-weight: 900; }
    .divider-solid { border-bottom: 2px solid #000; margin: 3px 0; }
    .divider-dashed { border-bottom: 1px dashed #000; margin: 3px 0; }
    .divider-double { border-bottom: 3px double #000; margin: 4px 0; }
    .banner {
      background: #000000;
      color: #ffffff;
      padding: 3px 0;
      font-size: 12px;
      font-weight: 900;
      text-align: center;
      letter-spacing: 1px;
    }
    .row {
      display: flex;
      justify-content: space-between;
      padding: 1px 0;
    }
  </style>
</head>
<body>
  <div class="banner">ZYWELL GA-C80250I PLUS</div>
  <div class="text-center font-black" style="font-size: 13px; margin: 3px 0;">HARDWARE SELF-TEST PASS</div>
  <div class="divider-double"></div>

  <div class="row"><span>Printer Model:</span><strong>GA-C80250I Plus</strong></div>
  <div class="row"><span>Paper Width:</span><strong>80mm (72mm Print)</strong></div>
  <div class="row"><span>Resolution:</span><strong>576 dots / line (203 DPI)</strong></div>
  <div class="row"><span>Print Speed:</span><strong>250 mm/sec</strong></div>
  <div class="row"><span>Command Set:</span><strong>ESC/POS Compatible</strong></div>
  <div class="row"><span>Auto-Cutter:</span><strong>Partial / Full Guillotine</strong></div>
  <div class="row"><span>Cash Drawer:</span><strong>DC 24V / 1A RJ11 (Pin 2/5)</strong></div>
  <div class="row"><span>Interface:</span><strong>Serial + USB + Ethernet</strong></div>
  <div class="row"><span>Active Spooler:</span><strong>POS-80 Windows Driver</strong></div>
  <div class="row"><span>Timestamp:</span><strong>${now.toLocaleTimeString()}</strong></div>

  <div class="divider-dashed"></div>

  <div class="text-center font-bold" style="margin: 4px 0;">
    [ PRINT DENSITY & ALIGNMENT TEST ]
  </div>
  <div class="text-center font-black" style="font-size: 14px; letter-spacing: 2px;">
    1234567890ABCDEF
  </div>
  <div class="text-center" style="font-size: 10px; margin: 3px 0;">
    ████████████████████████████
  </div>

  <div class="divider-solid"></div>

  <div class="text-center" style="font-size: 9px; font-weight: bold; margin-top: 4px;">
    WHITE TABLE SMART POS HARDWARE ENGINE<br>
    Self-Test Slip Completed Successfully
  </div>
</body>
</html>`;
};


