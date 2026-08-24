import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  AppTab,
  UserRole,
  MenuItem,
  MenuItemAddon,
  Desk,
  DeskSession,
  Customer,
  Order,
  Invoice,
  CartItem,
  Employee,
  PayrollRecord,
  AttendanceRecord,
  ShiftType,
  OrderItemRecord,
  KitchenTicket,
  KitchenTicketItem,
  KitchenStation,
} from './types';
import {
  INITIAL_MENU,
  ADDONS_DATA,
  INITIAL_DESKS,
  INITIAL_DESK_SESSIONS,
  INITIAL_CUSTOMERS,
  INITIAL_ORDERS,
  INITIAL_INVOICES,
  INITIAL_EMPLOYEES,
  INITIAL_PAYROLL_RECORDS,
  INITIAL_ATTENDANCE_RECORDS,
  INITIAL_KITCHEN_TICKETS,
} from './data/seedData';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardView } from './components/dashboard/DashboardView';
import { POSView } from './components/pos/POSView';
import { CoworkingView } from './components/coworking/CoworkingView';
import { KitchenOrdersView } from './components/kitchen/KitchenOrdersView';
import { StockView } from './components/stock/StockView';
import { InvoicesView } from './components/invoices/InvoicesView';
import { CRMView } from './components/crm/CRMView';
import { AttendanceView } from './components/attendance/AttendanceView';
import { PayrollView } from './components/payroll/PayrollView';
import { AnalyticsView } from './components/analytics/AnalyticsView';
import { IntegrationsView } from './components/integrations/IntegrationsView';
import { TutorialsView } from './components/tutorials/TutorialsView';
import { ReceiptModal } from './components/pos/ReceiptModal';
import { KitchenTicketModal } from './components/kitchen/KitchenTicketModal';
import { CashierHardwareModal } from './components/hardware/CashierHardwareModal';
import { DevConsoleModal } from './components/dev/DevConsoleModal';
import { CustomerDisplayView } from './components/pos/CustomerDisplayView';
import { SignInModal } from './components/auth/SignInModal';
import { CheckCircle2, AlertCircle, Info, X, ShieldAlert } from 'lucide-react';
import { canAccessTab, ROLE_CONFIGS } from './utils/rbac';
import { useLanguage } from './i18n/LanguageContext';
import { getStoredUser, saveStoredUser, UserAccount } from './utils/auth';

const STORAGE_KEY = 'white-table-hub-pos-v4';
const ROLE_STORAGE_KEY = 'white_table_active_role';
const KOT_STORAGE_KEY = 'white_table_kitchen_tickets';

export default function App() {
  const { lang, t } = useLanguage();
  const [tab, setTab] = useState<AppTab>('dashboard');
  const [isLoaded, setIsLoaded] = useState(false);
  const [isCustomerDisplayMode, setIsCustomerDisplayMode] = useState(false);

  // Authenticated User & Role state (Each user has username, password & authorized role)
  const [currentUser, setCurrentUser] = useState<UserAccount>(() => getStoredUser());
  const [isSignInModalOpen, setIsSignInModalOpen] = useState(false);

  const userRole = currentUser.role;

  // Core application state
  const [menu, setMenu] = useState<MenuItem[]>(INITIAL_MENU);
  const [addons] = useState<MenuItemAddon[]>(ADDONS_DATA);
  const [desks, setDesks] = useState<Desk[]>(INITIAL_DESKS);
  const [sessions, setSessions] = useState<DeskSession[]>(INITIAL_DESK_SESSIONS);
  const [customers, setCustomers] = useState<Customer[]>(INITIAL_CUSTOMERS);
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [invoices, setInvoices] = useState<Invoice[]>(INITIAL_INVOICES);
  const [employees, setEmployees] = useState<Employee[]>(INITIAL_EMPLOYEES);
  const [payrollRecords, setPayrollRecords] = useState<PayrollRecord[]>(INITIAL_PAYROLL_RECORDS);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(INITIAL_ATTENDANCE_RECORDS);
  const [kitchenTickets, setKitchenTickets] = useState<KitchenTicket[]>(INITIAL_KITCHEN_TICKETS);
  const [autoPrintKOT, setAutoPrintKOT] = useState(true);

  // Modal / Toast states
  const [toast, setToast] = useState<{
    msg: string;
    type: 'success' | 'error' | 'info';
    id: string;
  } | null>(null);
  const [selectedReceiptOrder, setSelectedReceiptOrder] = useState<Order | null>(null);
  const [activePrintKitchenTicket, setActivePrintKitchenTicket] = useState<KitchenTicket | null>(null);
  const [isNewCustomerModalOpen, setIsNewCustomerModalOpen] = useState(false);
  const [isHardwareModalOpen, setIsHardwareModalOpen] = useState(false);
  const [isDevConsoleOpen, setIsDevConsoleOpen] = useState(false);

  // Check customer display URL query
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('display') === 'customer') {
        setIsCustomerDisplayMode(true);
      }
    }
  }, []);

  // New Customer Form State for modal
  const [newCustName, setNewCustName] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');
  const [newCustEmail, setNewCustEmail] = useState('');
  const [newCustTier, setNewCustTier] = useState<Customer['tier']>('Regular');
  const [newCustNotes, setNewCustNotes] = useState('');

  const notify = useCallback((msg: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ msg, type, id: Math.random().toString(36).slice(2, 9) });
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(timer);
  }, [toast]);

  // Load from local storage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.menu?.length) setMenu(parsed.menu);
        if (parsed.desks?.length === 14) {
          setDesks(parsed.desks.map((d: Desk) => ({ ...d, rate: 100 })));
        } else {
          setDesks(INITIAL_DESKS);
        }
        if (parsed.sessions?.length) setSessions(parsed.sessions);
        if (parsed.customers?.length) setCustomers(parsed.customers);
        if (parsed.orders?.length) setOrders(parsed.orders);
        if (parsed.invoices?.length) setInvoices(parsed.invoices);
        if (parsed.employees?.length) setEmployees(parsed.employees);
        if (parsed.payrollRecords?.length) setPayrollRecords(parsed.payrollRecords);
        if (parsed.attendanceRecords?.length) setAttendanceRecords(parsed.attendanceRecords);
      }

      const savedKOT = localStorage.getItem(KOT_STORAGE_KEY);
      if (savedKOT) {
        const parsedKOT = JSON.parse(savedKOT);
        if (parsedKOT?.length) setKitchenTickets(parsedKOT);
      }
    } catch {
      // ignore
    }
    setIsLoaded(true);
  }, []);

  // Save to local storage on changes
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          menu,
          desks,
          sessions,
          customers,
          orders,
          invoices,
          employees,
          payrollRecords,
          attendanceRecords,
        })
      );
      localStorage.setItem(KOT_STORAGE_KEY, JSON.stringify(kitchenTickets));
      localStorage.setItem(ROLE_STORAGE_KEY, userRole);
    } catch {
      // ignore
    }
  }, [
    isLoaded,
    menu,
    desks,
    sessions,
    customers,
    orders,
    invoices,
    employees,
    payrollRecords,
    attendanceRecords,
    kitchenTickets,
    userRole,
  ]);

  // Handle User Login & Role Switching
  const handleLoginSuccess = useCallback(
    (authenticatedUser: UserAccount) => {
      setCurrentUser(authenticatedUser);
      saveStoredUser(authenticatedUser.id);
      setIsSignInModalOpen(false);

      const conf = ROLE_CONFIGS[authenticatedUser.role];
      notify(
        lang === 'ar'
          ? `تم تسجيل الدخول: ${authenticatedUser.nameAr} (${authenticatedUser.roleLabelAr})`
          : `Signed in as: ${authenticatedUser.name} (${authenticatedUser.roleLabelEn})`,
        'success'
      );

      // If new role cannot access current tab, switch to first allowed tab
      if (!canAccessTab(authenticatedUser.role, tab)) {
        const fallbackTab = conf.allowedTabs[0] || 'dashboard';
        setTab(fallbackTab);
      }
    },
    [tab, lang, notify]
  );

  // Helper to determine if an item category goes to Kitchen or Barista
  const getStationForCategory = (category: string): KitchenStation => {
    const kitchenCategories = [
      'Signature Burgers',
      'Burgers',
      'Birria Tacos',
      'Tacos',
      'Quesadillas',
      'Breakfast & Bowls',
      'Bowls & Plates',
      'Breakfast Toasts',
      'Benedicts & Eggs',
      'Appetizers',
      'Salad',
      'Fajita',
      'Omelette & Scramble',
    ];
    return kitchenCategories.includes(category) ? 'kitchen' : 'barista';
  };

  // Helper to create and queue automatic Kitchen Tickets (KOT)
  const generateKitchenTickets = useCallback(
    (
      order: Order,
      cartItems: CartItem[],
      customerName: string,
      deskCode?: string
    ): KitchenTicket[] => {
      const ticketsCreated: KitchenTicket[] = [];
      const ticketNumBase = kitchenTickets.length + 45;
      const now = Date.now();
      const locLabel = deskCode
        ? `Desk / Table #${deskCode}`
        : order.source === 'table'
        ? 'Dine-In Table'
        : 'POS Walk-in / Counter';

      // Group items by station (kitchen vs barista)
      const kitchenItems: CartItem[] = [];
      const baristaItems: CartItem[] = [];

      cartItems.forEach((it) => {
        const station = getStationForCategory(it.category);
        if (station === 'kitchen') {
          kitchenItems.push(it);
        } else {
          baristaItems.push(it);
        }
      });

      // 1. Generate Kitchen Food Ticket if food items exist
      if (kitchenItems.length > 0) {
        const foodTicket: KitchenTicket = {
          id: `kot-k-${now}`,
          orderId: order.id,
          ticketNumber: `KOT-${String(ticketNumBase).padStart(3, '0')}`,
          timestamp: now,
          createdAt: now,
          station: 'kitchen',
          status: 'queued',
          type: deskCode ? 'dine-in' : 'takeaway',
          tableNumber: deskCode,
          tableOrDeskLabel: locLabel,
          customerName,
          serverName: userRole === 'cashier' ? 'Cashier Station 1' : 'White Table POS',
          notes: 'Auto-dispatched from POS checkout',
          items: kitchenItems.map((ki, idx) => ({
            id: `ki-k-${idx}-${now}`,
            name: ki.name,
            qty: ki.qty,
            size: ki.size,
            category: ki.category,
            station: 'kitchen',
            note: ki.note,
            notes: ki.note,
            selectedAddons: ki.selectedAddons.map((a) => a.name),
            isDone: false,
          })),
        };
        ticketsCreated.push(foodTicket);
      }

      // 2. Generate Barista Drinks Ticket if beverage items exist
      if (baristaItems.length > 0) {
        const baristaTicket: KitchenTicket = {
          id: `kot-b-${now + 1}`,
          orderId: order.id,
          ticketNumber: `KOT-${String(ticketNumBase + (kitchenItems.length > 0 ? 1 : 0)).padStart(3, '0')}`,
          timestamp: now,
          createdAt: now,
          station: 'barista',
          status: 'queued',
          type: deskCode ? 'dine-in' : 'takeaway',
          tableNumber: deskCode,
          tableOrDeskLabel: locLabel,
          customerName,
          serverName: userRole === 'cashier' ? 'Cashier Station 1' : 'White Table POS',
          notes: 'Barista queue instant dispatch',
          items: baristaItems.map((bi, idx) => ({
            id: `ki-b-${idx}-${now}`,
            name: bi.name,
            qty: bi.qty,
            size: bi.size,
            category: bi.category,
            station: 'barista',
            note: bi.note,
            notes: bi.note,
            selectedAddons: bi.selectedAddons.map((a) => a.name),
            isDone: false,
          })),
        };
        ticketsCreated.push(baristaTicket);
      }

      return ticketsCreated;
    },
    [kitchenTickets.length, userRole]
  );

  // 1. Place POS Order handler
  const handlePlacePOSOrder = useCallback(
    (orderData: {
      items: CartItem[];
      customerId: string;
      deskId?: string;
      discountPercent: number;
      pointsRedeemed?: number;
      pointsDiscountEGP?: number;
      paymentMethod: 'Cash' | 'Credit Card' | 'InstaPay / Wallet' | 'Member Tab';
    }): Order => {
      const subtotal = orderData.items.reduce((sum, it) => {
        const adSum = it.selectedAddons.reduce((s, a) => s + a.price, 0);
        return sum + (it.unitPrice + adSum) * it.qty;
      }, 0);

      const percentDiscount = (subtotal * orderData.discountPercent) / 100;
      const loyaltyDiscount = orderData.pointsDiscountEGP || 0;
      const totalDiscount = percentDiscount + loyaltyDiscount;

      const taxable = Math.max(0, subtotal - totalDiscount);
      const tax = taxable * 0.14;
      const total = taxable + tax;

      const orderItems = orderData.items.map((it) => {
        const adSum = it.selectedAddons.reduce((s, a) => s + a.price, 0);
        return {
          itemId: it.itemId,
          name: it.name,
          category: it.category,
          size: it.size,
          unitPrice: it.unitPrice,
          qty: it.qty,
          selectedAddons: it.selectedAddons,
          totalPrice: (it.unitPrice + adSum) * it.qty,
        };
      });

      const customer = customers.find((c) => c.id === orderData.customerId);
      const customerName = customer ? customer.name : 'Walk-in Guest';
      const desk = desks.find((d) => d.id === orderData.deskId);
      const deskCode = desk ? desk.code : undefined;

      const newOrder: Order = {
        id: `ord-${Date.now()}`,
        source: 'pos',
        label: deskCode ? `POS Order (Table ${deskCode})` : 'POS Counter Order',
        customerId: orderData.customerId,
        deskId: orderData.deskId,
        items: orderItems,
        subtotal,
        discount: totalDiscount,
        tax,
        total,
        paymentMethod: orderData.paymentMethod,
        status: 'completed',
        createdAt: Date.now(),
      };

      const newInvoice: Invoice = {
        id: `inv-${Date.now()}`,
        orderId: newOrder.id,
        invoiceNumber: `WT-${new Date().getFullYear()}-${String(invoices.length + 44).padStart(4, '0')}`,
        customerId: orderData.customerId,
        customerName,
        date: Date.now(),
        source: 'pos',
        label: newOrder.label,
        items: orderItems,
        subtotal,
        discount: totalDiscount,
        tax,
        total,
        paymentMethod: orderData.paymentMethod,
        status: 'paid',
      };

      // Deduct stock
      setMenu((prev) =>
        prev.map((mi) => {
          const matchedItem = orderData.items.find((it) => it.itemId === mi.id);
          if (matchedItem) {
            return { ...mi, stock: Math.max(0, mi.stock - matchedItem.qty) };
          }
          return mi;
        })
      );

      // Accumulate customer spend & adjust loyalty points
      const pointsEarned = Math.floor(total / 100);
      const pointsUsed = orderData.pointsRedeemed || 0;

      setCustomers((prev) =>
        prev.map((c) =>
          c.id === orderData.customerId
            ? {
                ...c,
                spent: c.spent + total,
                visits: c.visits + 1,
                points: Math.max(0, c.points - pointsUsed + pointsEarned),
              }
            : c
        )
      );

      // ─── Generate Kitchen Order Tickets (KOT) for chef/barista ───
      const generatedKOTs = generateKitchenTickets(
        newOrder,
        orderData.items,
        customerName,
        deskCode
      );

      if (generatedKOTs.length > 0) {
        setKitchenTickets((prev) => [...generatedKOTs, ...prev]);

        // Auto print KOT ticket for the chef if enabled
        if (autoPrintKOT) {
          setActivePrintKitchenTicket(generatedKOTs[0]);
        }
      }

      setOrders((prev) => [newOrder, ...prev]);
      setInvoices((prev) => [newInvoice, ...prev]);

      return newOrder;
    },
    [customers, desks, invoices.length, generateKitchenTickets, autoPrintKOT]
  );

  // 2. Coworking desk session handlers
  const handleStartDeskSession = useCallback(
    (
      deskId: string,
      customerId: string,
      options?: { hasWifiCombo?: boolean; wifiCardCode?: string; notes?: string }
    ) => {
      const desk = desks.find((d) => d.id === deskId);
      if (!desk) return;

      const customer = customers.find((c) => c.id === customerId);
      const customerName = customer ? customer.name : 'Guest';

      const newSession: DeskSession = {
        id: `sess-${Date.now()}`,
        deskId,
        customerId,
        customerName,
        startTime: Date.now(),
        hourlyRate: desk.rate || 100,
        hasWifiCombo: options?.hasWifiCombo || false,
        wifiCardCode: options?.wifiCardCode || undefined,
        comboDiscountPercent: 15,
        notes: options?.notes,
      };

      setSessions((prev) => [...prev.filter((s) => s.deskId !== deskId), newSession]);
      notify(`Session started for ${customerName} at ${desk.code}`, 'success');
    },
    [desks, customers, notify]
  );

  const handleToggleWifiCombo = useCallback((sessionId: string) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === sessionId ? { ...s, hasWifiCombo: !s.hasWifiCombo } : s))
    );
  }, []);

  const handleEndDeskSession = useCallback(
    (
      sessionId: string,
      paymentMethod: 'Cash' | 'Credit Card' | 'InstaPay / Wallet' | 'Member Tab' = 'Credit Card'
    ): Order => {
      const session = sessions.find((s) => s.id === sessionId);
      if (!session) throw new Error('Session not found');

      const desk = desks.find((d) => d.id === session.deskId);
      const customer = customers.find((c) => c.id === session.customerId);
      const customerName = customer ? customer.name : session.customerName || 'Guest';

      const durationMs = Date.now() - session.startTime;
      const durationHours = durationMs / (1000 * 60 * 60);
      const totalHours = Math.max(0.25, Math.ceil(durationHours * 4) / 4);

      const hourlyRate = session.hourlyRate || desk?.rate || 100;
      const deskFee = totalHours * hourlyRate;
      const wifiFee = session.hasWifiCombo ? 50 : 0;

      const items: OrderItemRecord[] = [
        {
          itemId: `desk-${desk?.id || 'd'}`,
          name: `Coworking Desk ${desk?.code || ''} (${desk?.name || 'Workspace'})`,
          category: 'Coworking Passes',
          unitPrice: hourlyRate,
          qty: totalHours,
          totalPrice: deskFee,
        },
      ];

      if (session.hasWifiCombo) {
        items.push({
          itemId: 'wifi-card-5gb',
          name: `High-Speed 5GB WiFi Pass (${session.wifiCardCode || 'WT-WIFI'})`,
          category: 'Coworking Passes',
          unitPrice: 50,
          qty: 1,
          totalPrice: 50,
        });
      }

      const subtotal = deskFee + wifiFee;
      const discount = session.hasWifiCombo
        ? subtotal * ((session.comboDiscountPercent || 15) / 100)
        : 0;

      const taxable = Math.max(0, subtotal - discount);
      const tax = taxable * 0.14;
      const total = taxable + tax;

      const label = session.hasWifiCombo
        ? `Coworking ${desk?.code || desk?.name} Session + 5GB WiFi Combo (15% Off)`
        : `Coworking ${desk?.code || desk?.name} Session (${totalHours.toFixed(2)} hrs)`;

      const newOrder: Order = {
        id: `ord-${Date.now()}`,
        source: 'coworking',
        label,
        customerId: session.customerId,
        deskId: session.deskId,
        items,
        subtotal,
        discount,
        tax,
        total,
        paymentMethod,
        status: 'completed',
        createdAt: Date.now(),
      };

      const newInvoice: Invoice = {
        id: `inv-${Date.now()}`,
        orderId: newOrder.id,
        invoiceNumber: `WT-${new Date().getFullYear()}-${String(invoices.length + 44).padStart(4, '0')}`,
        customerId: session.customerId,
        customerName,
        date: Date.now(),
        source: 'coworking',
        label: newOrder.label,
        items,
        subtotal,
        discount,
        tax,
        total,
        paymentMethod,
        status: 'paid',
      };

      const pointsEarned = Math.floor(total / 100);
      setCustomers((prev) =>
        prev.map((c) =>
          c.id === session.customerId
            ? {
                ...c,
                spent: c.spent + total,
                visits: c.visits + 1,
                points: c.points + pointsEarned,
              }
            : c
        )
      );

      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
      setOrders((prev) => [newOrder, ...prev]);
      setInvoices((prev) => [newInvoice, ...prev]);

      return newOrder;
    },
    [sessions, desks, customers, invoices.length]
  );

  // 3. Stock management
  const handleUpdateStock = useCallback((itemId: string, newStock: number) => {
    setMenu((prev) => prev.map((it) => (it.id === itemId ? { ...it, stock: newStock } : it)));
  }, []);

  const handleSaveItem = useCallback(
    (itemData: Partial<MenuItem>) => {
      setMenu((prev) => {
        const exists = prev.some((it) => it.id === itemData.id);
        if (exists) {
          return prev.map((it) => (it.id === itemData.id ? ({ ...it, ...itemData } as MenuItem) : it));
        }
        return [itemData as MenuItem, ...prev];
      });
      notify(`Item ${itemData.name} saved successfully`, 'success');
    },
    [notify]
  );

  // 4. Invoices
  const handleUpdateInvoiceStatus = useCallback(
    (invoiceId: string, status: 'paid' | 'unpaid' | 'void') => {
      setInvoices((prev) => prev.map((inv) => (inv.id === invoiceId ? { ...inv, status } : inv)));
    },
    []
  );

  // 5. CRM
  const handleAddCustomer = useCallback(
    (newCust: Omit<Customer, 'id' | 'points' | 'spent' | 'visits'>) => {
      const cust: Customer = {
        ...newCust,
        id: `c-${Date.now()}`,
        points: 0,
        spent: 0,
        visits: 0,
      };
      setCustomers((prev) => [cust, ...prev]);
    },
    []
  );

  const handleUpdateCustomer = useCallback(
    (updated: Customer) => {
      setCustomers((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
      notify(`Updated profile for ${updated.name}`, 'info');
    },
    [notify]
  );

  // 6. Attendance Time Clock Handlers (Decoupled from Payroll)
  const handleClockIn = useCallback(
    (employeeId: string, shiftType: ShiftType, notes?: string) => {
      const emp = employees.find((e) => e.id === employeeId);
      if (!emp) return;

      const newRecord: AttendanceRecord = {
        id: `att-${Date.now()}`,
        employeeId,
        employeeName: emp.name,
        role: emp.role,
        date: new Date().toISOString().split('T')[0],
        clockInTime: Date.now(),
        status: 'active',
        shiftType,
        notes: notes || 'Punched via Terminal',
      };

      setAttendanceRecords((prev) => [newRecord, ...prev]);
      notify(
        lang === 'ar'
          ? `تم تسجيل حضور ${emp.name} بنجاح`
          : `Clock-in recorded for ${emp.name}`,
        'success'
      );
    },
    [employees, lang, notify]
  );

  const handleClockOut = useCallback(
    (attendanceId: string, notes?: string) => {
      const now = Date.now();
      setAttendanceRecords((prev) =>
        prev.map((rec) => {
          if (rec.id === attendanceId) {
            const durationMs = Math.max(0, now - rec.clockInTime);
            const durationHours = Math.round((durationMs / 3600000) * 10) / 10;
            return {
              ...rec,
              clockOutTime: now,
              durationHours,
              status: 'completed',
              notes: notes || rec.notes,
            };
          }
          return rec;
        })
      );
      notify(
        lang === 'ar' ? 'تم تسجيل الانصراف بنجاح' : 'Clock-out punch recorded successfully',
        'success'
      );
    },
    [lang, notify]
  );

  const handleAddAttendanceRecord = useCallback(
    (record: Omit<AttendanceRecord, 'id'>) => {
      const newRec: AttendanceRecord = {
        ...record,
        id: `att-${Date.now()}`,
      };
      setAttendanceRecords((prev) => [newRec, ...prev]);
      notify(
        lang === 'ar' ? 'تمت إضافة سجل الحضور' : 'Attendance record created',
        'success'
      );
    },
    [lang, notify]
  );

  const handleUpdateAttendanceRecord = useCallback(
    (updated: AttendanceRecord) => {
      setAttendanceRecords((prev) =>
        prev.map((r) => (r.id === updated.id ? updated : r))
      );
      notify(
        lang === 'ar' ? 'تم تحديث سجل الحضور' : 'Attendance log updated',
        'info'
      );
    },
    [lang, notify]
  );

  const handleDeleteAttendanceRecord = useCallback(
    (id: string) => {
      setAttendanceRecords((prev) => prev.filter((r) => r.id !== id));
      notify(
        lang === 'ar' ? 'تم حذف السجل' : 'Record deleted',
        'info'
      );
    },
    [lang, notify]
  );

  // 7. Payroll Handlers (Protected & Decoupled)
  const handleAddPayrollRecord = useCallback(
    (record: Omit<PayrollRecord, 'id'>) => {
      const newRec: PayrollRecord = {
        ...record,
        id: `pay-${Date.now()}`,
      };
      setPayrollRecords((prev) => [newRec, ...prev]);
      notify(
        lang === 'ar' ? 'تم تسجيل كشف الراتب' : 'Payroll statement generated',
        'success'
      );
    },
    [lang, notify]
  );

  const handleUpdatePayrollRecord = useCallback(
    (updated: PayrollRecord) => {
      setPayrollRecords((prev) =>
        prev.map((r) => (r.id === updated.id ? updated : r))
      );
      notify(
        lang === 'ar' ? 'تم تحديث سجل المرتبات' : 'Payroll record updated',
        'info'
      );
    },
    [lang, notify]
  );

  const handleGenerateMonthlyPayroll = useCallback(
    (month: string) => {
      // Auto-calculate net salary based on baseSalary + attendance hours / shifts
      const newRecords: PayrollRecord[] = employees
        .filter((emp) => emp.status === 'Active')
        .map((emp) => {
          const empAttendance = attendanceRecords.filter(
            (a) => a.employeeId === emp.id && a.date.startsWith(month)
          );
          const totalHours = empAttendance.reduce(
            (sum, a) => sum + (a.durationHours || 0),
            0
          );
          const hourlyOvertime = Math.max(0, totalHours - 160) * 80;

          return {
            id: `pay-${month}-${emp.id}`,
            employeeId: emp.id,
            employeeName: emp.name,
            role: emp.role,
            month,
            baseSalary: emp.baseSalary,
            bonus: hourlyOvertime,
            deductions: 0,
            netSalary: emp.baseSalary + hourlyOvertime,
            status: 'Pending',
            notes: `Auto generated for ${month} (${totalHours.toFixed(1)} hrs worked)`,
          };
        });

      setPayrollRecords((prev) => {
        // Keep existing from other months
        const otherMonths = prev.filter((p) => p.month !== month);
        return [...newRecords, ...otherMonths];
      });

      notify(
        lang === 'ar'
          ? `تم إنشاء مسير رواتب شهر ${month} لـ ${employees.length} موظف`
          : `Generated ${month} payroll cycle for ${employees.length} employees`,
        'success'
      );
    },
    [employees, attendanceRecords, lang, notify]
  );

  // 8. Employees Directory Handlers
  const handleAddEmployee = useCallback(
    (empData: Omit<Employee, 'id'>) => {
      const newEmp: Employee = {
        ...empData,
        id: `emp-${Date.now()}`,
      };
      setEmployees((prev) => [...prev, newEmp]);
      notify(
        lang === 'ar' ? `تمت إضافة الموظف ${newEmp.name}` : `Added ${newEmp.name} to directory`,
        'success'
      );
    },
    [lang, notify]
  );

  const handleUpdateEmployee = useCallback(
    (updated: Employee) => {
      setEmployees((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
      notify(
        lang === 'ar' ? `تم تحديث بيانات ${updated.name}` : `Updated ${updated.name}`,
        'info'
      );
    },
    [lang, notify]
  );

  const handleDeleteEmployee = useCallback(
    (id: string) => {
      setEmployees((prev) => prev.filter((e) => e.id !== id));
      notify(lang === 'ar' ? 'تم حذف الموظف' : 'Employee removed', 'info');
    },
    [lang, notify]
  );

  // 9. Kitchen Display System (KDS) Status & Item toggles
  const handleUpdateKitchenTicketStatus = useCallback(
    (ticketId: string, status: KitchenTicket['status']) => {
      setKitchenTickets((prev) =>
        prev.map((t) => (t.id === ticketId ? { ...t, status } : t))
      );
    },
    []
  );

  const handleToggleKitchenItemDone = useCallback(
    (ticketId: string, itemId: string) => {
      setKitchenTickets((prev) =>
        prev.map((t) => {
          if (t.id === ticketId) {
            const updatedItems = t.items.map((it) =>
              it.id === itemId ? { ...it, isDone: !it.isDone } : it
            );
            // If all items done, auto-mark ready
            const allDone = updatedItems.every((it) => it.isDone);
            return {
              ...t,
              items: updatedItems,
              status: allDone ? 'ready' : t.status === 'ready' ? 'preparing' : t.status,
            };
          }
          return t;
        })
      );
    },
    []
  );

  // Modal customer form save
  const handleQuickCreateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustName.trim()) return;

    const colors = ['#2F5D57', '#C79A3E', '#8A6FBF', '#3F7A4E', '#B5443C', '#2563EB'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    handleAddCustomer({
      name: newCustName.trim(),
      phone: newCustPhone.trim(),
      email: newCustEmail.trim(),
      tier: newCustTier,
      notes: newCustNotes.trim(),
      avatarColor: randomColor,
      joinedDate: new Date().toISOString().split('T')[0],
    });

    notify(`Created customer ${newCustName.trim()}`, 'success');
    setNewCustName('');
    setNewCustPhone('');
    setNewCustEmail('');
    setNewCustNotes('');
    setNewCustTier('Regular');
    setIsNewCustomerModalOpen(false);
  };

  const lowStockCount = useMemo(() => menu.filter((m) => m.stock <= m.threshold).length, [menu]);
  const queuedKitchenTicketsCount = useMemo(
    () => kitchenTickets.filter((t) => t.status === 'queued' || t.status === 'preparing').length,
    [kitchenTickets]
  );

  // Software Engineer Test Trigger for KOT
  const handleTriggerTestKOT = useCallback(() => {
    const now = Date.now();
    const testKOT: KitchenTicket = {
      id: `kot-test-${now}`,
      orderId: `ord-test-${now}`,
      ticketNumber: `KOT-${String(kitchenTickets.length + 50).padStart(3, '0')}`,
      timestamp: now,
      createdAt: now,
      station: 'kitchen',
      status: 'queued',
      type: 'dine-in',
      tableNumber: 'T02',
      tableOrDeskLabel: 'Table #02 (Main Hall)',
      customerName: 'Software Engineer (Test Punch)',
      serverName: 'Dev Console Spooler',
      notes: 'Test Esc/Pos kitchen slip formatting & latency benchmark',
      items: [
        {
          id: `t-item-1`,
          name: 'The White Table Special Burger (200g)',
          qty: 1,
          category: 'mains',
          station: 'kitchen',
          notes: 'Test extra cheese & medium well',
          note: 'Test extra cheese & medium well',
          selectedAddons: ['Extra Melted Cheese', 'Make it Double Patty (150g)'],
          isDone: false,
        },
        {
          id: `t-item-2`,
          name: 'Ceremonial Matcha Cloud Latte',
          qty: 2,
          category: 'tea_matcha',
          station: 'barista',
          size: 'Double Shot',
          notes: 'Test oat milk & less sweet',
          note: 'Test oat milk & less sweet',
          selectedAddons: ['Vegan Oat / Almond Milk'],
          isDone: false,
        },
      ],
    };
    setKitchenTickets((prev) => [testKOT, ...prev]);
    setActivePrintKitchenTicket(testKOT);
  }, [kitchenTickets.length]);

  const handleResetToDefaults = useCallback(() => {
    setMenu(INITIAL_MENU);
    setDesks(INITIAL_DESKS);
    setSessions(INITIAL_DESK_SESSIONS);
    setCustomers(INITIAL_CUSTOMERS);
    setOrders(INITIAL_ORDERS);
    setInvoices(INITIAL_INVOICES);
    setEmployees(INITIAL_EMPLOYEES);
    setPayrollRecords(INITIAL_PAYROLL_RECORDS);
    setAttendanceRecords(INITIAL_ATTENDANCE_RECORDS);
    setKitchenTickets(INITIAL_KITCHEN_TICKETS);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(KOT_STORAGE_KEY);
  }, []);

  if (isCustomerDisplayMode) {
    return (
      <CustomerDisplayView
        onExit={() => {
          setIsCustomerDisplayMode(false);
          if (typeof window !== 'undefined') {
            const url = new URL(window.location.href);
            url.searchParams.delete('display');
            url.searchParams.delete('view');
            window.history.replaceState({}, '', url.pathname);
          }
        }}
      />
    );
  }

  // Access Permission Check for the current active tab
  const hasAccessToCurrentTab = canAccessTab(userRole, tab);

  return (
    <div className="flex min-h-screen bg-zinc-100 text-zinc-900 font-sans antialiased selection:bg-emerald-600 selection:text-white">
      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={tab}
        onTabChange={setTab}
        currentUser={currentUser}
        onOpenSignInModal={() => setIsSignInModalOpen(true)}
        lowStockCount={lowStockCount}
        activeSessionsCount={sessions.length}
        queuedKitchenTicketsCount={queuedKitchenTicketsCount}
        onOpenHardwareModal={() => setIsHardwareModalOpen(true)}
        onOpenDevConsole={() => setIsDevConsoleOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          currentTab={tab}
          currentUser={currentUser}
          onOpenSignInModal={() => setIsSignInModalOpen(true)}
          onOpenPOS={() => setTab('pos')}
          onOpenHardwareModal={() => setIsHardwareModalOpen(true)}
          onOpenDevConsole={() => setIsDevConsoleOpen(true)}
          notify={notify}
        />

        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto overflow-y-auto">
          {/* If Role is restricted from viewing the current tab */}
          {!hasAccessToCurrentTab ? (
            <div className="p-8 rounded-3xl bg-white border border-rose-200 shadow-sm text-center max-w-xl mx-auto my-12 space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-200">
                <ShieldAlert size={28} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-zinc-950">
                  {lang === 'ar' ? 'غير مصرح بالوصول لهذا القسم' : 'Access Restricted for This Role'}
                </h3>
                <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
                  {lang === 'ar'
                    ? `دور (${ROLE_CONFIGS[userRole]?.labelAr}) لا يملك صلاحية عرض هذا القسم. يرجى التبديل لدور المالك أو المدير أو مهندس البرمجيات.`
                    : `The current role (${ROLE_CONFIGS[userRole]?.labelEn}) does not have permission to view this view. Please switch to Owner, Manager, or Software Engineer.`}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setTab('pos')}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition cursor-pointer"
              >
                {lang === 'ar' ? 'الذهاب إلى نقطة البيع (POS)' : 'Go to POS Register'}
              </button>
            </div>
          ) : (
            <>
              {tab === 'dashboard' && (
                <DashboardView
                  orders={orders}
                  menu={menu}
                  customers={customers}
                  desks={desks}
                  sessions={sessions}
                  invoices={invoices}
                  onNavigate={setTab}
                  onEndSession={handleEndDeskSession}
                  onSelectDeskForSession={(desk) => {
                    setTab('coworking');
                  }}
                  onViewReceipt={setSelectedReceiptOrder}
                  onRestockItem={(id, delta) => {
                    const it = menu.find((m) => m.id === id);
                    if (it) handleUpdateStock(id, it.stock + delta);
                  }}
                />
              )}

              {tab === 'pos' && (
                <POSView
                  menu={menu}
                  addons={addons}
                  customers={customers}
                  desks={desks}
                  onPlaceOrder={handlePlacePOSOrder}
                  onOpenNewCustomerModal={() => setIsNewCustomerModalOpen(true)}
                  notify={notify}
                />
              )}

              {tab === 'coworking' && (
                <CoworkingView
                  desks={desks}
                  sessions={sessions}
                  customers={customers}
                  menu={menu}
                  onStartSession={handleStartDeskSession}
                  onEndSession={handleEndDeskSession}
                  onToggleWifiCombo={handleToggleWifiCombo}
                  onOpenNewCustomerModal={() => setIsNewCustomerModalOpen(true)}
                  notify={notify}
                />
              )}

              {tab === 'kitchen' && (
                <KitchenOrdersView
                  tickets={kitchenTickets}
                  onUpdateTicketStatus={handleUpdateKitchenTicketStatus}
                  autoPrintEnabled={autoPrintKOT}
                  onToggleAutoPrint={() => setAutoPrintKOT((prev) => !prev)}
                  notify={(title, msg, type) => notify(title + (msg ? `: ${msg}` : ''), type || 'info')}
                />
              )}

              {tab === 'stock' && (
                <StockView
                  menu={menu}
                  onUpdateStock={handleUpdateStock}
                  onSaveItem={handleSaveItem}
                  notify={notify}
                />
              )}

              {tab === 'invoices' && (
                <InvoicesView
                  invoices={invoices}
                  customers={customers}
                  menu={menu}
                  onUpdateInvoiceStatus={handleUpdateInvoiceStatus}
                  notify={notify}
                />
              )}

              {tab === 'crm' && (
                <CRMView
                  customers={customers}
                  orders={orders}
                  onAddCustomer={handleAddCustomer}
                  onUpdateCustomer={handleUpdateCustomer}
                  notify={notify}
                />
              )}

              {tab === 'attendance' && (
                <AttendanceView
                  employees={employees}
                  attendanceRecords={attendanceRecords}
                  onClockIn={(empId, shift, notes) => handleClockIn(empId, shift || 'Regular Shift', notes)}
                  onClockOut={handleClockOut}
                  onAddAttendanceRecord={handleAddAttendanceRecord}
                  onUpdateAttendanceRecord={handleUpdateAttendanceRecord}
                  onDeleteAttendanceRecord={handleDeleteAttendanceRecord}
                  notify={(title, msg, type) => notify(title + (msg ? `: ${msg}` : ''), type || 'info')}
                />
              )}

              {tab === 'payroll' && (
                <PayrollView
                  employees={employees}
                  payrollRecords={payrollRecords}
                  onAddPayrollRecord={handleAddPayrollRecord}
                  onUpdatePayrollRecord={handleUpdatePayrollRecord}
                  onAddEmployee={handleAddEmployee}
                  onUpdateEmployee={handleUpdateEmployee}
                  onDeleteEmployee={handleDeleteEmployee}
                  notify={(title, msg, type) => notify(title + (msg ? `: ${msg}` : ''), type || 'info')}
                />
              )}


              {tab === 'analytics' && (
                <AnalyticsView
                  orders={orders}
                  menu={menu}
                  customers={customers}
                  desks={desks}
                  sessions={sessions}
                />
              )}

              {tab === 'integrations' && (
                <IntegrationsView
                  notify={notify}
                />
              )}

              {tab === 'tutorials' && (
                <TutorialsView
                  currentUser={currentUser}
                  onNavigateTab={(targetTab) => setTab(targetTab as AppTab)}
                />
              )}
            </>
          )}
        </main>
      </div>

      {/* Cashier Hardware & ESC/POS Printer Modal */}
      {isHardwareModalOpen && (
        <CashierHardwareModal
          isOpen={isHardwareModalOpen}
          onClose={() => setIsHardwareModalOpen(false)}
          notify={notify}
        />
      )}

      {/* Software Engineer Developer Console Modal */}
      {isDevConsoleOpen && (
        <DevConsoleModal
          onClose={() => setIsDevConsoleOpen(false)}
          onResetToDefaults={handleResetToDefaults}
          onTriggerTestKOT={handleTriggerTestKOT}
          appStateCounts={{
            orders: orders.length,
            invoices: invoices.length,
            kitchenTickets: kitchenTickets.length,
            employees: employees.length,
            attendanceRecords: attendanceRecords.length,
            payrollRecords: payrollRecords.length,
            tables: desks.length,
          }}
          notify={notify}
        />
      )}

      {/* Global Receipt Viewer Modal */}
      {selectedReceiptOrder && (
        <ReceiptModal
          order={selectedReceiptOrder}
          customer={customers.find((c) => c.id === selectedReceiptOrder.customerId)}
          onClose={() => setSelectedReceiptOrder(null)}
          notify={notify}
        />
      )}

      {/* Kitchen Order Ticket (KOT) Chef Thermal Slip Modal */}
      {activePrintKitchenTicket && (
        <KitchenTicketModal
          ticket={activePrintKitchenTicket}
          onClose={() => setActivePrintKitchenTicket(null)}
          notify={notify}
        />
      )}

      {/* Quick Customer Creation Modal */}
      {isNewCustomerModalOpen && (
        <div
          onClick={() => setIsNewCustomerModalOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-zinc-200 animate-in fade-in zoom-in duration-150"
          >
            <div className="flex items-center justify-between p-5 border-b border-zinc-100 bg-zinc-50">
              <h3 className="text-base font-bold text-zinc-950">Add Customer / Member</h3>
              <button
                type="button"
                onClick={() => setIsNewCustomerModalOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-200 transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleQuickCreateCustomer} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-600 block mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={newCustName}
                  onChange={(e) => setNewCustName(e.target.value)}
                  placeholder="e.g. Karim Nabil"
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 bg-zinc-50 focus:outline-none focus:border-emerald-600 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-600 block mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={newCustPhone}
                    onChange={(e) => setNewCustPhone(e.target.value)}
                    placeholder="+20 100..."
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200 bg-zinc-50 focus:outline-none focus:border-emerald-600 font-mono"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-600 block mb-1">
                    Tier
                  </label>
                  <select
                    value={newCustTier}
                    onChange={(e) => setNewCustTier(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200 bg-zinc-50 focus:outline-none focus:border-emerald-600 font-medium"
                  >
                    <option value="Regular">Regular</option>
                    <option value="Silver Member">Silver Member</option>
                    <option value="Gold VIP">Gold VIP</option>
                    <option value="Founder / VIP">Founder / VIP</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-600 block mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={newCustEmail}
                  onChange={(e) => setNewCustEmail(e.target.value)}
                  placeholder="karim@example.com"
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 bg-zinc-50 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-600 block mb-1">
                  Dietary / Coffee Preferences
                </label>
                <input
                  type="text"
                  value={newCustNotes}
                  onChange={(e) => setNewCustNotes(e.target.value)}
                  placeholder="e.g. Prefers Turkish Coffee double, almond milk..."
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 bg-zinc-50 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="p-4 bg-zinc-50 border-t border-zinc-200 -mx-5 -mb-5 mt-5 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewCustomerModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-600 hover:bg-zinc-200 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition shadow-sm cursor-pointer"
                >
                  Create Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Staff Sign In / Account Switcher Modal */}
      <SignInModal
        isOpen={isSignInModalOpen}
        currentUser={currentUser}
        onLoginSuccess={handleLoginSuccess}
        onClose={() => setIsSignInModalOpen(false)}
        canDismiss={true}
      />

      {/* Floating Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-xl border text-xs font-bold animate-in fade-in slide-in-from-bottom-3 duration-200 ${
            toast.type === 'error'
              ? 'bg-rose-50 border-rose-200 text-rose-900'
              : toast.type === 'info'
              ? 'bg-zinc-900 border-zinc-700 text-zinc-100'
              : 'bg-zinc-950 border-emerald-600 text-white'
          }`}
        >
          {toast.type === 'error' ? (
            <AlertCircle size={16} className="text-rose-600" />
          ) : toast.type === 'info' ? (
            <Info size={16} className="text-zinc-400" />
          ) : (
            <CheckCircle2 size={16} className="text-emerald-400" />
          )}
          <span>{toast.msg}</span>
        </div>
      )}
    </div>
  );
}
