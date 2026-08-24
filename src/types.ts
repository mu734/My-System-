export type UserRole = 'owner' | 'manager' | 'software_engineer' | 'cashier' | 'staff';

export type AppTab =
  | 'dashboard'
  | 'pos'
  | 'coworking'
  | 'kitchen'
  | 'stock'
  | 'invoices'
  | 'crm'
  | 'attendance'
  | 'payroll'
  | 'analytics'
  | 'integrations'
  | 'tutorials';

export interface SoftwareIntegrationConfig {
  apiKey: string;
  webhookUrl: string;
  webhookSecret: string;
  syncIntervalMinutes: number;
  autoSyncOrders: boolean;
  autoSyncInventory: boolean;
  autoSyncInvoices: boolean;
  externalSoftwareType: 'custom_api' | 'odoo' | 'quickbooks' | 'zapier' | 'fawry' | 'excel_sync';
  externalApiUrl: string;
  externalAuthToken: string;
  lastSyncTimestamp?: number;
}

export interface WebhookLog {
  id: string;
  timestamp: number;
  direction: 'incoming' | 'outgoing';
  source: string;
  event: string;
  status: number;
  payload: any;
}

export type KitchenTicketStatus = 'queued' | 'preparing' | 'ready' | 'served' | 'cancelled';
export type KitchenStation = 'all' | 'hot_kitchen' | 'barista_bar' | 'kitchen' | 'barista';

export interface KitchenTicketItem {
  id: string;
  name: string;
  category?: string;
  qty: number;
  size?: string;
  selectedAddons?: { name: string; price: number }[] | string[];
  note?: string;
  notes?: string;
  station?: 'kitchen' | 'barista';
  completed?: boolean;
  isDone?: boolean;
}

export interface KitchenTicket {
  id: string;
  ticketNumber: string; // e.g. "KOT-101"
  orderId: string;
  orderSource?: 'pos' | 'coworking' | 'table';
  type?: 'dine-in' | 'takeaway' | 'delivery';
  tableOrDeskLabel?: string; // e.g. "Table #04 (Quiet Zone)" or "POS Walk-in"
  tableNumber?: string;
  customerName: string;
  serverName?: string;
  timestamp?: number;
  createdAt?: number;
  items: KitchenTicketItem[];
  status: KitchenTicketStatus;
  priority?: 'normal' | 'rush' | 'vip';
  chefNotes?: string;
  notes?: string;
  station?: 'kitchen' | 'barista';
  completedAt?: number;
  autoPrinted?: boolean;
}



export interface MenuItemAddon {
  id: string;
  name: string;
  price: number;
  category: string;
}

export interface MenuItem {
  id: string;
  name: string;
  category: string;
  price: number;
  doublePrice?: number; // for items with single/double
  bottlePrice?: number; // for kombucha/kefir glass vs bottle
  cost: number;
  stock: number;
  unit: string;
  threshold: number;
  image?: string;
  description?: string;
  ingredients?: string;
  isAvailable?: boolean;
  hasSizes?: boolean;
  sizeLabelSingle?: string;
  sizeLabelDouble?: string;
  availableAddons?: string[]; // categories of add-ons that apply
  badge?: string;
}

export interface CartItem {
  cartId: string;
  itemId: string;
  name: string;
  category: string;
  size?: 'Single' | 'Double' | 'Glass' | 'Bottle' | 'Standard';
  unitPrice: number;
  qty: number;
  selectedAddons: { name: string; price: number }[];
  note?: string;
}

export interface Desk {
  id: string;
  code: string;
  name: string;
  zone: 'Quiet Zone' | 'Collaborative' | 'Private Pod' | 'Meeting Room' | 'Outdoor Terrace';
  type: string;
  rate: number; // EGP / hr
  capacity: number;
  features: string[];
}

export interface DeskSession {
  id: string;
  deskId: string;
  customerId: string;
  customerName?: string;
  startTime: number;
  endTime?: number;
  hourlyRate: number; // 100 EGP / hr
  hasWifiCombo?: boolean; // 15% Combo bundle active
  wifiCardCode?: string; // e.g. "WT-5G-T01-8492"
  wifiCardPrice?: number; // 50 EGP
  comboDiscountPercent?: number; // 15%
  notes?: string;
  tableOrders?: CartItem[];
  paymentMethod?: 'Cash' | 'Credit Card' | 'InstaPay / Wallet' | 'Member Tab';
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  tier: 'Regular' | 'Silver Member' | 'Gold VIP' | 'Founder / VIP';
  points: number;
  spent: number;
  visits: number;
  notes: string;
  avatarColor?: string;
  joinedDate?: string;
}

export interface OrderItemRecord {
  itemId: string;
  name: string;
  category: string;
  size?: string;
  unitPrice: number;
  qty: number;
  selectedAddons?: { name: string; price: number }[];
  totalPrice: number;
}

export interface Order {
  id: string;
  source: 'pos' | 'coworking' | 'table';
  label: string;
  customerId: string;
  deskId?: string;
  items: OrderItemRecord[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  paymentMethod: 'Cash' | 'Credit Card' | 'InstaPay / Wallet' | 'Member Tab';
  status: 'completed' | 'refunded';
  createdAt: number;
}

export interface Invoice {
  id: string;
  orderId: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  date: number;
  source: string;
  label: string;
  items: OrderItemRecord[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  paymentMethod: string;
  status: 'paid' | 'unpaid' | 'void';
}

export type EmployeeRole =
  | 'Head Barista'
  | 'Barista'
  | 'Kitchen Chef'
  | 'Coworking Community Host'
  | 'Store Manager'
  | 'Operations & Support';

export interface Employee {
  id: string;
  name: string;
  role: EmployeeRole;
  phone: string;
  email: string;
  salaryType: 'monthly' | 'hourly';
  baseSalary: number; // monthly fixed EGP or hourly rate in EGP
  hoursWorkedThisMonth: number;
  bonus: number; // in EGP
  deductions: number; // in EGP
  bankAccountOrInstaPay?: string;
  hireDate: string;
  status: 'active' | 'on_leave' | 'inactive' | 'Active';
  avatarColor?: string;
  shiftsCompleted: number;
  notes?: string;
  isClockedIn?: boolean;
  currentClockInTime?: number; // timestamp in ms
}

export type ShiftType = 'Regular Shift' | 'Opening Shift' | 'Closing Shift' | 'Overtime' | 'Weekend Shift';

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  role: EmployeeRole;
  date: string; // YYYY-MM-DD
  clockInTime: number; // timestamp ms
  clockOutTime?: number; // timestamp ms
  durationHours?: number; // calculated hours
  status: 'clocked_in' | 'completed' | 'active';
  shiftType?: ShiftType;
  notes?: string;
}

export interface PayrollRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  role?: EmployeeRole;
  period?: string; // e.g. "August 2026"
  month?: string; // e.g. "2026-08"
  salaryType?: 'monthly' | 'hourly';
  baseSalary?: number;
  baseAmount?: number;
  hoursWorked?: number;
  bonus: number;
  deductions: number;
  netSalary?: number;
  netPay?: number;
  paidAt?: number;
  paymentDate?: string;
  paymentMethod: 'InstaPay' | 'Bank Transfer' | 'Cash' | 'InstaPay / Bank Transfer';
  status: 'paid' | 'pending' | 'Pending' | 'Paid';
  receiptNumber?: string;
  notes?: string;
  attendanceShiftsCount?: number;
}



