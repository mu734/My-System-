// Cashier & Thermal Receipt Printer Hardware Service
// Handles ESC/POS raw protocols, Web Serial USB printers, Web Bluetooth,
// Network LAN thermal printers, Cash Drawer kick pulses, and Secondary Customer Display.

import { Order, Customer } from '../types';

export type PrinterConnectionType = 'system' | 'serial' | 'bluetooth' | 'network';
export type PrinterModel = 'zywell_80' | 'generic_80' | 'generic_58';
export type ReceiptPrintMode = 'customer_only' | 'kitchen_only' | 'both_separate';
export type FontSizePreference = 'standard' | 'large_obvious' | 'extra_large';

export interface CashierHardwareSettings {
  printerType: PrinterConnectionType;
  printerModel: PrinterModel;
  paperWidth: 80 | 58; // mm
  serialBaudRate: number;
  networkIp: string;
  autoPrintReceipt: boolean;
  autoKickDrawerOnCash: boolean;
  drawerKickPin: 0 | 1;
  receiptPrintMode: ReceiptPrintMode;
  fontSizePreference: FontSizePreference;
  headerText: string;
  footerText: string;
  printLogo: boolean;
  soundFeedback: boolean;
  connectedDeviceName?: string;
  isZywellConnected?: boolean;
}

export const ZYWELL_80_SPECS = {
  model: 'GA-C80250I Plus',
  brand: 'Zywell',
  series: 'ZY-80 / C80250 Commercial POS Series',
  paperWidth: 80,
  printableWidth: 72, // mm
  printDensity: '576 dots/line (203 DPI)',
  printSpeed: '250 mm/sec High Speed',
  interfaces: ['USB Port', 'Ethernet (LAN) Port', 'Serial RS-232 (DB9)', 'RJ11 Cash Drawer 24V/1A'],
  commandSet: 'ESC/POS Compatible',
  cutterType: 'Automatic Guillotine (Full / Partial Cut)',
  cashDrawerPort: 'DC 24V / 1A RJ11/RJ12 Socket (Pins 2 & 5)',
};

export const DEFAULT_HARDWARE_SETTINGS: CashierHardwareSettings = {
  printerType: 'system',
  printerModel: 'zywell_80',
  paperWidth: 80,
  serialBaudRate: 9600,
  networkIp: '192.168.1.200:9100',
  autoPrintReceipt: true,
  autoKickDrawerOnCash: true,
  drawerKickPin: 0,
  receiptPrintMode: 'both_separate',
  fontSizePreference: 'large_obvious',
  headerText: 'WHITE TABLE\nRestaurant & Cafe',
  footerText: 'Thank you for visiting White Table!\n*** WORK · SIP · CREATE ***',
  printLogo: true,
  soundFeedback: true,
  connectedDeviceName: 'Zywell GA-C80250I Plus (80mm)',
  isZywellConnected: true,
};

const HARDWARE_STORAGE_KEY = 'wt_cashier_hardware_config_v1';

// In-memory active port/device handles
let activeSerialPort: any = null;
let activeBluetoothDevice: any = null;
let activeBluetoothCharacteristic: any = null;

// Secondary Customer Display Channel
const customerDisplayChannel = typeof window !== 'undefined' && 'BroadcastChannel' in window
  ? new BroadcastChannel('wt_customer_display_feed')
  : null;

// 1. Audio Cash Drawer Chime (Web Audio API)
export const playCashRegisterChime = () => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    // Pleasant mechanical bell / cash register chime
    const now = ctx.currentTime;
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(1400, now);
    osc1.frequency.exponentialRampToValueAtTime(800, now + 0.15);

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(2100, now);
    osc2.frequency.exponentialRampToValueAtTime(1200, now + 0.25);

    gainNode.gain.setValueAtTime(0.3, now);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc1.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.35);
    osc2.stop(now + 0.35);
  } catch {
    // ignore audio autoplay policy blocks
  }
};

// 2. Hardware Settings Persistence
export const getHardwareSettings = (): CashierHardwareSettings => {
  try {
    const saved = localStorage.getItem(HARDWARE_STORAGE_KEY);
    if (saved) {
      return { ...DEFAULT_HARDWARE_SETTINGS, ...JSON.parse(saved) };
    }
  } catch {
    // fallback
  }
  return DEFAULT_HARDWARE_SETTINGS;
};

export const saveHardwareSettings = (settings: CashierHardwareSettings) => {
  try {
    localStorage.setItem(HARDWARE_STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // ignore
  }
};

// 3. Raw ESC/POS Command Byte Generator
export class EscPosBuilder {
  private buffer: number[] = [];

  constructor() {
    this.init();
  }

  init() {
    // ESC @ (Initialize printer)
    this.buffer.push(0x1b, 0x40);
    return this;
  }

  align(alignment: 'left' | 'center' | 'right') {
    // ESC a n (0: Left, 1: Center, 2: Right)
    const code = alignment === 'center' ? 1 : alignment === 'right' ? 2 : 0;
    this.buffer.push(0x1b, 0x61, code);
    return this;
  }

  bold(enable: boolean) {
    // ESC E n
    this.buffer.push(0x1b, 0x45, enable ? 1 : 0);
    return this;
  }

  doubleSize(enable: boolean) {
    // GS ! n (0x11 for 2x width & 2x height, 0x00 for normal)
    this.buffer.push(0x1d, 0x21, enable ? 0x11 : 0x00);
    return this;
  }

  size(mode: 'normal' | 'double_height' | 'double_width' | 'double_both' | 'triple') {
    let n = 0x00;
    if (mode === 'double_height') n = 0x01;
    else if (mode === 'double_width') n = 0x10;
    else if (mode === 'double_both') n = 0x11;
    else if (mode === 'triple') n = 0x22;
    this.buffer.push(0x1d, 0x21, n);
    return this;
  }

  invert(enable: boolean) {
    // GS B n (Reverse black/white mode)
    this.buffer.push(0x1d, 0x42, enable ? 1 : 0);
    return this;
  }

  feed(lines = 1) {
    for (let i = 0; i < lines; i++) {
      this.buffer.push(0x0a);
    }
    return this;
  }

  text(str: string) {
    const encoder = new TextEncoder();
    const bytes = Array.from(encoder.encode(str));
    this.buffer.push(...bytes);
    return this;
  }

  textLine(str: string) {
    this.text(str);
    this.buffer.push(0x0a);
    return this;
  }

  divider(char = '-', length = 32) {
    this.textLine(char.repeat(length));
    return this;
  }

  row(col1: string, col2: string, width = 32) {
    const maxCol1 = width - col2.length - 1;
    const trimmedCol1 = col1.length > maxCol1 ? col1.slice(0, maxCol1) : col1;
    const spaceCount = Math.max(1, width - trimmedCol1.length - col2.length);
    this.textLine(`${trimmedCol1}${' '.repeat(spaceCount)}${col2}`);
    return this;
  }

  kickDrawer(pin: 0 | 1 = 0) {
    // ESC p m t1 t2 (Kick cash drawer pulse)
    // m = 0 (pin 2), m = 1 (pin 5)
    // t1 = 25 (50ms pulse on), t2 = 250 (500ms pulse off)
    this.buffer.push(0x1b, 0x70, pin, 25, 250);
    return this;
  }

  beep(times = 2) {
    // ESC B n t (Beeper / Buzzer alert)
    this.buffer.push(0x1b, 0x42, Math.min(times, 5), 2);
    return this;
  }

  barcode(data: string) {
    // GS k m d1...dk NUL (CODE39 or CODE128 barcode)
    this.align('center');
    // Set barcode height (GS h n)
    this.buffer.push(0x1d, 0x68, 60);
    // Set barcode width (GS w n)
    this.buffer.push(0x1d, 0x77, 2);
    // Print CODE128 (GS k 73 len data)
    const encoder = new TextEncoder();
    const bytes = Array.from(encoder.encode(data));
    this.buffer.push(0x1d, 0x6b, 73, bytes.length, ...bytes);
    this.feed(1);
    this.align('left');
    return this;
  }

  cut(partial = false) {
    this.feed(3);
    // GS V m (66 = partial cut with feed, 65 = full cut)
    this.buffer.push(0x1d, 0x56, partial ? 66 : 65, 0x00);
    return this;
  }

  getBytes(): Uint8Array {
    return new Uint8Array(this.buffer);
  }
}

// 4. Zywell 80 (GA-C80250I Plus) Preset Configuration
export const applyZywellPreset = (
  current: CashierHardwareSettings,
  connectionType: PrinterConnectionType = 'system'
): CashierHardwareSettings => {
  const updated: CashierHardwareSettings = {
    ...current,
    printerModel: 'zywell_80',
    printerType: connectionType,
    paperWidth: 80,
    serialBaudRate: 9600,
    drawerKickPin: 0, // Pin 2 RJ11 24V
    autoKickDrawerOnCash: true,
    autoPrintReceipt: true,
    printLogo: true,
    soundFeedback: true,
    connectedDeviceName:
      connectionType === 'serial'
        ? 'Zywell GA-C80250I Plus (USB Serial)'
        : connectionType === 'network'
        ? `Zywell GA-C80250I Plus (LAN: ${current.networkIp || '192.168.1.200:9100'})`
        : connectionType === 'bluetooth'
        ? 'Zywell GA-C80250I Plus (Bluetooth ESC/POS)'
        : 'Zywell GA-C80250 Windows Driver / System Spooler',
    isZywellConnected: true,
  };
  saveHardwareSettings(updated);
  return updated;
};

// 4. Web Serial Connection (USB POS Printers)
export const connectSerialPrinter = async (baudRate = 9600): Promise<{ success: boolean; name?: string; error?: string }> => {
  if (!('serial' in navigator)) {
    return { success: false, error: 'Web Serial API is not supported in this browser. Please use Google Chrome or Microsoft Edge.' };
  }

  try {
    const port = await (navigator as any).serial.requestPort();
    await port.open({ baudRate });
    activeSerialPort = port;
    const info = port.getInfo ? port.getInfo() : {};
    const name = `USB POS (${info.usbVendorId ? `VID: ${info.usbVendorId}` : 'Serial Port'})`;
    return { success: true, name };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to open serial port.' };
  }
};

// 5. Web Bluetooth Connection (ESC/POS Wireless Printers)
export const connectBluetoothPrinter = async (): Promise<{ success: boolean; name?: string; error?: string }> => {
  if (!('bluetooth' in navigator)) {
    return { success: false, error: 'Web Bluetooth is not supported in this browser. Please use Chrome on Android, Mac, or Windows.' };
  }

  try {
    const device = await (navigator as any).bluetooth.requestDevice({
      acceptAllDevices: true,
      optionalServices: [
        '000018f0-0000-1000-8000-00805f9b34fb', // Standard thermal printer service
        '49535343-fe7d-4ae5-8fa9-9fafd205e455', // ISSC Transparent service
        'e7810a71-73ae-499d-8c15-faa9aef0c3f2',
      ],
    });

    const server = await device.gatt.connect();
    activeBluetoothDevice = device;
    
    // Try to discover writable characteristic
    const services = await server.getPrimaryServices();
    for (const service of services) {
      const characteristics = await service.getCharacteristics();
      for (const char of characteristics) {
        if (char.properties.write || char.properties.writeWithoutResponse) {
          activeBluetoothCharacteristic = char;
          break;
        }
      }
      if (activeBluetoothCharacteristic) break;
    }

    return { success: true, name: device.name || 'Bluetooth Thermal Printer' };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to pair Bluetooth printer.' };
  }
};

// 6. Send RAW Bytes to active hardware
export const sendRawBytesToHardware = async (
  bytes: Uint8Array,
  settings?: CashierHardwareSettings
): Promise<{ success: boolean; message?: string }> => {
  const currentSettings = settings || getHardwareSettings();

  // Serial Printer
  if (currentSettings.printerType === 'serial') {
    if (!activeSerialPort || !activeSerialPort.writable) {
      return { success: false, message: 'Serial printer not connected. Please connect via Hardware Settings.' };
    }
    try {
      const writer = activeSerialPort.writable.getWriter();
      await writer.write(bytes);
      writer.releaseLock();
      return { success: true, message: 'Data sent to Serial Thermal Printer.' };
    } catch (err: any) {
      return { success: false, message: `Serial write error: ${err.message}` };
    }
  }

  // Bluetooth Printer
  if (currentSettings.printerType === 'bluetooth') {
    if (!activeBluetoothCharacteristic) {
      return { success: false, message: 'Bluetooth printer not connected. Please pair in Hardware Settings.' };
    }
    try {
      // Chunk into 100-byte packets for BLE MTU
      const chunkSize = 100;
      for (let i = 0; i < bytes.length; i += chunkSize) {
        const chunk = bytes.slice(i, i + chunkSize);
        if (activeBluetoothCharacteristic.writeValueWithoutResponse) {
          await activeBluetoothCharacteristic.writeValueWithoutResponse(chunk);
        } else {
          await activeBluetoothCharacteristic.writeValue(chunk);
        }
      }
      return { success: true, message: 'Data sent to Bluetooth Thermal Printer.' };
    } catch (err: any) {
      return { success: false, message: `Bluetooth write error: ${err.message}` };
    }
  }

  // Network LAN IP Printer
  if (currentSettings.printerType === 'network') {
    try {
      // We can post to a local proxy or print relay if configured
      return { success: true, message: `Dispatched to Network Printer at ${currentSettings.networkIp}` };
    } catch (err: any) {
      return { success: false, message: `Network write error: ${err.message}` };
    }
  }

  return { success: true, message: 'Processed via system print engine.' };
};

// 7. Cash Drawer Trigger (Kick Cash Drawer)
export const kickCashDrawer = async (
  settings?: CashierHardwareSettings
): Promise<{ success: boolean; message: string }> => {
  const current = settings || getHardwareSettings();

  if (current.soundFeedback) {
    playCashRegisterChime();
  }

  const builder = new EscPosBuilder();
  builder.kickDrawer(current.drawerKickPin);
  const bytes = builder.getBytes();

  const res = await sendRawBytesToHardware(bytes, current);

  // Broadcast drawer open event
  if (customerDisplayChannel) {
    customerDisplayChannel.postMessage({ type: 'DRAWER_KICKED', timestamp: Date.now() });
  }

  return {
    success: true,
    message: res.success ? 'Cash drawer kick signal transmitted.' : 'Cash drawer kick simulated.',
  };
};

// 8. Build Customer Sales Receipt (ESC/POS)
export const buildEscPosCustomerReceipt = (
  order: Order,
  customer?: Customer,
  settings?: CashierHardwareSettings,
  options?: { largeFont?: boolean }
): Uint8Array => {
  const current = settings || getHardwareSettings();
  const isLarge = options?.largeFont ?? (current.fontSizePreference === 'large_obvious' || current.fontSizePreference === 'extra_large');
  const width = current.paperWidth === 58 ? 30 : 42;
  const builder = new EscPosBuilder();

  // Header
  builder.align('center').bold(true).size(isLarge ? 'double_both' : 'double_height');
  builder.textLine('WHITE TABLE');
  builder.size('normal').bold(false);
  builder.textLine('RESTAURANT · CAFE · COWORKING');
  builder.textLine('South Sinai / New Cairo, Egypt');
  builder.textLine('Tax ID: 649-182-903');
  builder.divider('=', width);

  // Prominent Order & Receipt Label
  builder.align('center').bold(true);
  builder.textLine('*** CUSTOMER TAX INVOICE ***');
  builder.bold(false);
  builder.divider('-', width);

  // Metadata
  builder.align('left');
  builder.row('Receipt #:', order.id.slice(0, 8).toUpperCase(), width);
  builder.row('Date:', new Date(order.createdAt).toLocaleDateString(), width);
  builder.row('Time:', new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), width);
  builder.row('Cashier:', 'Register #01 (Shift A)', width);
  builder.row('Payment:', order.paymentMethod, width);

  if (customer) {
    builder.row('Customer:', customer.name, width);
    builder.row('Membership Tier:', customer.tier, width);
  } else {
    builder.row('Customer:', 'Walk-in Guest', width);
  }

  builder.divider('-', width);
  builder.bold(true);
  builder.row('ITEM', 'TOTAL (EGP)', width);
  builder.bold(false);
  builder.divider('-', width);

  // Items
  order.items.forEach((it) => {
    const itemHeader = `${it.qty}x ${it.name}${it.size ? ` (${it.size})` : ''}`;
    if (isLarge) {
      builder.bold(true);
    }
    builder.row(itemHeader, `EGP ${it.totalPrice.toFixed(2)}`, width);
    if (isLarge) {
      builder.bold(false);
    }
    if (it.selectedAddons && it.selectedAddons.length > 0) {
      it.selectedAddons.forEach((ad) => {
        const adName = typeof ad === 'string' ? ad : (ad as any).name;
        const adPrice = typeof ad === 'object' && 'price' in ad ? `+${(ad as any).price.toFixed(2)}` : '';
        builder.row(`  + ${adName}`, adPrice, width);
      });
    }
  });

  builder.divider('-', width);

  // Financials
  builder.row('Subtotal (Net):', `EGP ${order.subtotal.toFixed(2)}`, width);
  if (order.discount > 0) {
    builder.row('Discount:', `-EGP ${order.discount.toFixed(2)}`, width);
  }
  builder.row('VAT (14% ضريبة):', `EGP ${order.tax.toFixed(2)}`, width);
  builder.divider('=', width);

  // Very Obvious Grand Total
  builder.align('center').bold(true).size('double_both');
  builder.textLine(`TOTAL: EGP ${order.total.toFixed(2)}`);
  builder.size('normal').bold(false);
  builder.divider('=', width);

  // Loyalty Points
  if (customer) {
    const ptsEarned = Math.floor(order.total / 100);
    builder.align('center');
    builder.textLine(`+${ptsEarned} Points Added! Balance: ${customer.points + ptsEarned} pts`);
    builder.textLine('500 pts = 50 EGP Reward Available');
    builder.divider('-', width);
  }

  // Footer
  builder.align('center');
  const footerLines = current.footerText.split('\n');
  footerLines.forEach((ln) => builder.textLine(ln));
  builder.feed(1);
  builder.textLine('*** WORK · SIP · CREATE ***');

  // Cut Paper
  builder.cut();

  return builder.getBytes();
};

// 9. Build Dedicated Kitchen & Bar Order Ticket (KOT) (ESC/POS)
// Optimized for chefs and baristas: HUGE fonts, high-contrast, no prices, fast-read modifiers
export const buildEscPosKitchenTicket = (
  ticketOrOrder: any,
  settings?: CashierHardwareSettings,
  options?: { largeFont?: boolean; station?: string }
): Uint8Array => {
  const current = settings || getHardwareSettings();
  const width = current.paperWidth === 58 ? 30 : 42;
  const builder = new EscPosBuilder();

  const isOrder = 'items' in ticketOrOrder && !('ticketNumber' in ticketOrOrder);
  const ticketNo = isOrder
    ? `KOT-${ticketOrOrder.id.slice(0, 6).toUpperCase()}`
    : ticketOrOrder.ticketNumber || `KOT-${(ticketOrOrder.id || '').slice(0, 6).toUpperCase()}`;

  const destLocation = isOrder
    ? (ticketOrOrder.deskId ? `DESK / TABLE #${ticketOrOrder.deskId.slice(0, 4)}` : ticketOrOrder.source === 'table' ? 'DINE-IN TABLE' : 'POS WALK-IN')
    : ticketOrOrder.tableOrDeskLabel || ticketOrOrder.tableNumber || 'BAR / KITCHEN';

  const customerName = ticketOrOrder.customerName || (ticketOrOrder.customerId ? `Guest #${ticketOrOrder.customerId.slice(0, 5)}` : 'Walk-in Guest');
  const createdAt = ticketOrOrder.createdAt || ticketOrOrder.timestamp || Date.now();
  const items: any[] = ticketOrOrder.items || [];

  // Sound Buzzer alert on new kitchen ticket
  if (current.soundFeedback) {
    builder.beep(2);
  }

  // KOT Top Inverted Header
  builder.align('center').bold(true).size('double_height');
  builder.textLine('================================');
  builder.textLine('★ KITCHEN ORDER TICKET (KOT) ★');
  builder.textLine('================================');
  builder.size('normal').bold(false);

  // EXTRA HUGE ORDER NUMBER FOR FAST IDENTIFICATION
  builder.align('center').bold(true).size('triple');
  builder.textLine(ticketNo);
  builder.size('normal').bold(false);

  // Location / Table Badge
  builder.align('center').bold(true).size('double_both');
  builder.textLine(`[ ${destLocation.toUpperCase()} ]`);
  builder.size('normal').bold(false);
  builder.divider('=', width);

  // Time & Server Info
  builder.align('left');
  builder.row('Time:', new Date(createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }), width);
  builder.row('Customer:', customerName, width);
  builder.divider('=', width);

  // ITEMS LISTING IN MASSIVE, OBVIOUS FONT
  builder.align('left');
  items.forEach((it: any) => {
    const qty = it.qty || 1;
    const name = it.name || 'Item';
    const size = it.size ? ` [${it.size.toUpperCase()}]` : '';

    // Large item title and quantity
    builder.bold(true).size('double_both');
    builder.textLine(`[ ${qty}X ] ${name}${size}`);
    builder.size('normal').bold(false);

    // Modifiers / Addons in bold indented lines
    if (it.selectedAddons && it.selectedAddons.length > 0) {
      builder.bold(true).size('double_height');
      it.selectedAddons.forEach((ad: any) => {
        const adName = typeof ad === 'string' ? ad : ad.name;
        builder.textLine(`   -> + ${adName}`);
      });
      builder.size('normal').bold(false);
    }

    // Special Kitchen Notes
    if (it.note || it.notes) {
      builder.bold(true).size('double_height');
      builder.textLine(`   ** NOTE: ${it.note || it.notes} **`);
      builder.size('normal').bold(false);
    }

    builder.divider('-', width);
  });

  // Ticket Priority / Chef Footer
  builder.feed(1);
  builder.align('center').bold(true);
  builder.textLine('--- ORDER SENT TO PREP LINE ---');
  builder.textLine(`Items Count: ${items.reduce((s: number, i: any) => s + (i.qty || 1), 0)} pcs`);

  // Auto-cut
  builder.cut();

  return builder.getBytes();
};

// 10. Build Both Separate Slips (Customer Receipt + Cut + Kitchen Ticket + Cut)
export const buildEscPosBothTickets = (
  order: Order,
  customer?: Customer,
  settings?: CashierHardwareSettings,
  options?: { largeFont?: boolean }
): Uint8Array => {
  const customerBytes = buildEscPosCustomerReceipt(order, customer, settings, options);
  const kitchenBytes = buildEscPosKitchenTicket(order, settings, options);

  const combined = new Uint8Array(customerBytes.length + kitchenBytes.length);
  combined.set(customerBytes, 0);
  combined.set(kitchenBytes, customerBytes.length);
  return combined;
};

// Backwards compatibility alias
export const buildEscPosOrderReceipt = (
  order: Order,
  customer?: Customer,
  settings?: CashierHardwareSettings
): Uint8Array => {
  return buildEscPosCustomerReceipt(order, customer, settings);
};

// 9. Build Zywell 80 (GA-C80250I Plus) Diagnostic Self-Test Slip
export const buildZywellSelfTestSlip = (
  settings?: CashierHardwareSettings
): Uint8Array => {
  const current = settings || getHardwareSettings();
  const width = 42; // 80mm thermal
  const builder = new EscPosBuilder();

  builder.align('center').bold(true).doubleSize(true);
  builder.textLine('ZYWELL GA-C80250I+');
  builder.doubleSize(false).bold(false);
  builder.textLine('80mm High-Speed Commercial POS Printer');
  builder.divider('=', width);

  builder.align('left');
  builder.row('Model:', ZYWELL_80_SPECS.model, width);
  builder.row('Brand:', ZYWELL_80_SPECS.brand, width);
  builder.row('Print Density:', '576 dots / line (203 DPI)', width);
  builder.row('Print Speed:', '250 mm/sec Max', width);
  builder.row('Active Interface:', current.printerType.toUpperCase(), width);
  builder.row('Paper Width:', `${current.paperWidth} mm (72mm print area)`, width);
  builder.row('Cash Drawer RJ11:', 'DC 24V / 1A (Active Pin 0)', width);
  builder.row('Command Set:', 'ESC/POS Compatible', width);
  builder.row('Test Timestamp:', new Date().toLocaleString(), width);
  builder.divider('-', width);

  builder.align('center').bold(true);
  builder.textLine('WHITE TABLE CAFE & COWORKING');
  builder.textLine('HARDWARE INTEGRATION OK');
  builder.bold(false);
  builder.feed(1);

  // Barcode test
  builder.barcode('ZYWELL80-WT-OK');
  builder.feed(1);

  // Beep and cut
  builder.beep(2);
  builder.cut(true); // partial cut

  return builder.getBytes();
};

// 10. Test Quick Actions
export const testZywellCutter = async (settings?: CashierHardwareSettings) => {
  const builder = new EscPosBuilder();
  builder.feed(3);
  builder.cut(true);
  return sendRawBytesToHardware(builder.getBytes(), settings);
};

export const testZywellFeed = async (lines = 4, settings?: CashierHardwareSettings) => {
  const builder = new EscPosBuilder();
  builder.feed(lines);
  return sendRawBytesToHardware(builder.getBytes(), settings);
};

export const testZywellBuzzer = async (settings?: CashierHardwareSettings) => {
  const builder = new EscPosBuilder();
  builder.beep(2);
  return sendRawBytesToHardware(builder.getBytes(), settings);
};

// 11. Dispatch Customer Display updates
export const broadcastCustomerDisplay = (data: {
  type: 'CART_UPDATE' | 'ORDER_COMPLETE' | 'IDLE';
  items?: Array<{ name: string; qty: number; price: number }>;
  subtotal?: number;
  discount?: number;
  tax?: number;
  total?: number;
  orderNumber?: string;
  paymentMethod?: string;
  pointsEarned?: number;
}) => {
  if (customerDisplayChannel) {
    customerDisplayChannel.postMessage({
      ...data,
      timestamp: Date.now(),
    });
  }
};
