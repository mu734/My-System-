export type Language = 'en' | 'ar';

export interface Translations {
  // Navigation & Brand
  brandName: string;
  brandSubtitle: string;
  dashboard: string;
  pos: string;
  coworking: string;
  kitchen: string;
  stock: string;
  invoices: string;
  crm: string;
  attendance: string;
  payroll: string;
  employees: string;
  analytics: string;
  integrations: string;
  tutorials: string;

  // Roles & RBAC
  roleOwner: string;
  roleManager: string;
  roleSoftwareEngineer: string;
  roleCashier: string;
  roleStaff: string;
  currentRole: string;
  switchRole: string;
  accessRestricted: string;
  accessRestrictedDesc: string;
  devConsole: string;

  // Kitchen Orders / KOT
  kitchenOrders: string;
  kitchenSubtitle: string;
  stationHotKitchen: string;
  stationBarista: string;
  stationAll: string;
  ticketQueued: string;
  ticketPreparing: string;
  ticketReady: string;
  ticketServed: string;
  printChefTicket: string;
  autoPrintKitchen: string;
  startPrep: string;
  markReady: string;
  markServed: string;
  reprintKOT: string;
  newKitchenTicket: string;

  // Payroll specific
  payrollTitle: string;
  payrollSubtitle: string;
  totalPayrollBudget: string;
  paidSalaries: string;
  pendingSalaries: string;
  issuePayslip: string;
  salarySlipTitle: string;
  salaryPaidSuccess: string;

  // Header & Status
  versionTag: string;
  quickPOS: string;
  kickDrawer: string;
  hardware: string;
  registerActive: string;
  online: string;
  shift: string;
  loggedManager: string;
  language: string;
  switchToAr: string;
  switchToEn: string;
  searchPlaceholder: string;
  currency: string;

  // Common Actions
  add: string;
  save: string;
  cancel: string;
  close: string;
  delete: string;
  edit: string;
  print: string;
  export: string;
  filter: string;
  all: string;
  status: string;
  actions: string;
  view: string;
  paid: string;
  pending: string;
  completed: string;
  active: string;
  inactive: string;
  total: string;
  subtotal: string;
  tax: string;
  discount: string;
  notes: string;
  date: string;
  time: string;
  phone: string;
  email: string;
  name: string;
  role: string;
  category: string;
  price: string;
  qty: string;
  items: string;
  paymentMethod: string;
  cash: string;
  card: string;
  instaPay: string;
  memberTab: string;

  // POS
  searchMenu: string;
  allCategories: string;
  orderCart: string;
  emptyCart: string;
  emptyCartSub: string;
  clearCart: string;
  charge: string;
  checkout: string;
  selectCustomer: string;
  guestWalkIn: string;
  tableOrDesk: string;
  addons: string;
  size: string;
  single: string;
  double: string;
  orderSuccess: string;
  receiptNumber: string;

  // Coworking & Tables
  desksTitle: string;
  tablesTitle: string;
  activeSessions: string;
  availableDesks: string;
  availableTables: string;
  startSession: string;
  endSession: string;
  hourlyRate: string;
  capacity: string;
  duration: string;
  currentBill: string;
  quietZone: string;
  collaborative: string;
  privatePod: string;
  meetingRoom: string;
  outdoorTerrace: string;
  wifiCard: string;
  wifiCardDesc: string;
  wifiPin: string;
  wifiComboBundle: string;
  wifiComboPromoBadge: string;
  combo15Discount: string;
  tablesCount14: string;

  // Staff & Attendance
  staffDirectory: string;
  staffSubtitle: string;
  clockIn: string;
  clockOut: string;
  onDuty: string;
  offDuty: string;
  attendanceLog: string;
  payrollRegister: string;
  activeStaffCount: string;
  loggedHoursThisMonth: string;
  monthlyBase: string;
  hourlyRateLabel: string;
  bonus: string;
  deductions: string;
  netPay: string;
  payslip: string;
  shiftType: string;
  regularShift: string;
  openingShift: string;
  closingShift: string;
  overtime: string;
  weekendShift: string;
  missedPunch: string;
  logPastShift: string;
  clockInSuccess: string;
  clockOutSuccess: string;

  // Inventory
  inventoryTitle: string;
  lowStockAlert: string;
  inStock: string;
  unitCost: string;
  reorderThreshold: string;
  addNewItem: string;

  // Invoices, Reports & CRM
  invoicesTitle: string;
  totalRevenue: string;
  unpaidInvoices: string;
  dailyRevenueSummary: string;
  dailyRevenueSubtitle: string;
  totalDailySales: string;
  coworkingIncome: string;
  posSales: string;
  netProfit: string;
  costOfGoods: string;
  netProfitMargin: string;
  todayInvoicesCount: string;
  reconciliationLedger: string;
  paidCollected: string;
  exportPdfReport: string;
  exportExcelReport: string;
  periodDaily: string;
  periodWeekly: string;
  periodMonthly: string;
  periodCustom: string;
  startDate: string;
  endDate: string;
  filterPeriod: string;
  financialReports: string;
  financialReportsSubtitle: string;
  crmTitle: string;
  loyaltyPoints: string;
  pointsRule: string;
  vipTier: string;
  regularTier: string;
  silverTier: string;
  goldTier: string;
  founderTier: string;
  visits: string;
  totalSpent: string;

  // Hardware Modal
  hardwareTitle: string;
  hardwareSubtitle: string;
  printerSettings: string;
  cashDrawerSettings: string;
  customerDisplaySettings: string;
  thermalWidth: string;
  printerType: string;
  systemSpooler: string;
  usbSerial: string;
  bluetooth: string;
  testPrint: string;
  testKickDrawer: string;
  openCustomerScreen: string;
  autoKickOnCash: string;
  autoPrintReceipt: string;
  saveSettings: string;

  // Zywell 80 Thermal Printer Support
  zywellModel: string;
  zywellPresetApplied: string;
  zywellProfileDesc: string;
  connectZywell: string;
  zywellUsbDirect: string;
  zywellNetworkLan: string;
  zywellWindowsDriver: string;
  zywellBluetooth: string;
  testCutter: string;
  testFeed: string;
  printerStatusConnected: string;
  printerStatusDisconnected: string;
  printerIpAddress: string;
  baudRate: string;
  manualGuideTitle: string;

  // Receipt & Kitchen Separation & Font Sizing
  customerReceipt: string;
  kitchenReceipt: string;
  bothReceiptsSeparate: string;
  printCustomerReceipt: string;
  printKitchenReceipt: string;
  printBothSeparate: string;
  receiptType: string;
  fontSize: string;
  standardFont: string;
  largeObviousFont: string;
  extraLargeFont: string;
  kitchenOrderTicket: string;
  kitchenTicketSubtitle: string;
  kotStationHotKitchen: string;
  stationBaristaBar: string;
  orderNumberLarge: string;
  destinationLocation: string;
  itemQuantitiesLarge: string;
  specialInstructions: string;
  cutSlipBetween: string;

  // Integrations & Software Sync
  integrationsTitle: string;
  integrationsSubtitle: string;
  apiDocs: string;
  testConnection: string;
  apiKeyLabel: string;
  webhookUrlLabel: string;
  testPingSuccess: string;
  syncNow: string;
  liveEndpoints: string;
  codeSnippets: string;

  // Visual Dashboard Charts
  visualDashboard: string;
  revenueTrajectory: string;
  categoryMix: string;
  peakHoursFlow: string;
  topProductsChart: string;
  zoneUtilizationChart: string;
  paymentMethodsChart: string;
  visualInsights: string;
  timeframe7D: string;
  timeframe30D: string;
  timeframeToday: string;
  totalSalesStream: string;
  coworkingSalesStream: string;
  netProfitStream: string;
  orderVolume: string;
  unitsSold: string;
  revenueGenerated: string;
}

export const translations: Record<Language, Translations> = {
  en: {
    brandName: 'WHITE TABLE',
    brandSubtitle: 'Restaurant & Cafe',
    dashboard: 'Dashboard',
    pos: 'Point of Sale (POS)',
    coworking: 'Co-Working Space',
    kitchen: 'Kitchen Tickets (KOT)',
    stock: 'Inventory / Stock',
    invoices: 'Invoices & Billing',
    crm: 'Customer CRM',
    attendance: 'Time Clock & Attendance',
    payroll: 'Payroll & Compensation',
    employees: 'Staff & Payroll',
    analytics: 'Analytics',
    integrations: 'Software Integrations & API',
    tutorials: 'Training & Video Guides',

    // Roles & RBAC
    roleOwner: 'Business Owner',
    roleManager: 'System Manager',
    roleSoftwareEngineer: 'Software Engineer',
    roleCashier: 'Cashier',
    roleStaff: 'Staff / Barista / Chef',
    currentRole: 'Active Role',
    switchRole: 'Switch Role',
    accessRestricted: 'Access Restricted',
    accessRestrictedDesc: 'You do not have administrative clearance for this section. Please switch role or contact management.',
    devConsole: 'Developer Console & System Inspector',

    // Kitchen Orders / KOT
    kitchenOrders: 'Kitchen & Bar Order Tickets',
    kitchenSubtitle: 'Live Kitchen Display System (KDS) with automatic thermal ticket printing for chefs.',
    stationHotKitchen: 'Hot Kitchen & Food',
    stationBarista: 'Barista Bar & Coffee',
    stationAll: 'All Stations',
    ticketQueued: 'Queued',
    ticketPreparing: 'Preparing',
    ticketReady: 'Ready for Service',
    ticketServed: 'Served / Done',
    printChefTicket: 'Print Chef Ticket (KOT)',
    autoPrintKitchen: 'Auto-Print KOT to Kitchen Printer',
    startPrep: 'Start Prep',
    markReady: 'Mark Ready',
    markServed: 'Served & Closed',
    reprintKOT: 'Reprint Ticket',
    newKitchenTicket: 'Manual Kitchen Ticket',

    // Payroll specific
    payrollTitle: 'Employee Payroll & Compensation',
    payrollSubtitle: 'Calculate monthly wages, track hours from clock punches, manage bonuses/deductions, and issue payslips.',
    totalPayrollBudget: 'Total Monthly Payroll',
    paidSalaries: 'Salaries Paid',
    pendingSalaries: 'Pending Disbursement',
    issuePayslip: 'Print Payslip',
    salarySlipTitle: 'Official Employee Salary Slip',
    salaryPaidSuccess: 'Salary marked as paid via InstaPay / Bank Transfer',

    versionTag: 'White Table v2.5',
    quickPOS: 'Quick POS',
    kickDrawer: 'Kick Drawer',
    hardware: 'Hardware',
    registerActive: 'Register #01 Active',
    online: 'ONLINE',
    shift: 'Shift',
    loggedManager: 'Logged: Manager',
    language: 'Language',
    switchToAr: 'العربية',
    switchToEn: 'English',
    searchPlaceholder: 'Search anything...',
    currency: 'EGP',

    add: 'Add',
    save: 'Save',
    cancel: 'Cancel',
    close: 'Close',
    delete: 'Delete',
    edit: 'Edit',
    print: 'Print Receipt',
    export: 'Export',
    filter: 'Filter',
    all: 'All',
    status: 'Status',
    actions: 'Actions',
    view: 'View',
    paid: 'Paid',
    pending: 'Pending',
    completed: 'Completed',
    active: 'Active',
    inactive: 'Inactive',
    total: 'Total',
    subtotal: 'Subtotal',
    tax: 'VAT Tax',
    discount: 'Discount',
    notes: 'Notes',
    date: 'Date',
    time: 'Time',
    phone: 'Phone',
    email: 'Email',
    name: 'Name',
    role: 'Role',
    category: 'Category',
    price: 'Price',
    qty: 'Qty',
    items: 'Items',
    paymentMethod: 'Payment Method',
    cash: 'Cash',
    card: 'Credit Card',
    instaPay: 'InstaPay / Wallet',
    memberTab: 'Member Tab',

    searchMenu: 'Search menu items (drinks, food, beans)...',
    allCategories: 'All Categories',
    orderCart: 'Order Cart',
    emptyCart: 'Cart is empty',
    emptyCartSub: 'Select items from the menu to start order',
    clearCart: 'Clear',
    charge: 'Charge',
    checkout: 'Checkout & Pay',
    selectCustomer: 'Select Customer',
    guestWalkIn: 'Guest / Walk-In',
    tableOrDesk: 'Table / Desk',
    addons: 'Add-ons',
    size: 'Size',
    single: 'Single',
    double: 'Double',
    orderSuccess: 'Order Placed Successfully',
    receiptNumber: 'Receipt #',

    desksTitle: '14 Coworking Tables Management',
    tablesTitle: '14 Coworking Tables',
    activeSessions: 'Active Table Sessions',
    availableDesks: 'Available Tables',
    availableTables: 'Available Tables',
    startSession: 'Open Table Session',
    endSession: 'Check Out Table',
    hourlyRate: 'Hourly Rate (100 EGP/hr)',
    capacity: 'Capacity',
    duration: 'Duration',
    currentBill: 'Current Bill',
    quietZone: 'Quiet Focus Tables',
    collaborative: 'Collaborative Tables',
    privatePod: 'Private Work Booths',
    meetingRoom: 'Conference Tables',
    outdoorTerrace: 'Terrace Garden Tables',
    wifiCard: '5GB WiFi Voucher Card',
    wifiCardDesc: 'High-Speed 5G WiFi Scratch Card (50 EGP · 5 GB)',
    wifiPin: 'WiFi PIN',
    wifiComboBundle: 'Table + 5GB WiFi Combo Special',
    wifiComboPromoBadge: '15% OFF Receipt',
    combo15Discount: '15% Table + WiFi Bundle Discount',
    tablesCount14: '14 Work Tables Ready',

    staffDirectory: 'Staff Directory & Attendance',
    staffSubtitle: 'Manage team roster, 1-click shift clock-in / out, and simple payroll calculation.',
    clockIn: 'Clock In',
    clockOut: 'Clock Out',
    onDuty: 'On Duty',
    offDuty: 'Off Duty',
    attendanceLog: 'Daily Attendance Log',
    payrollRegister: 'Monthly Payroll Register',
    activeStaffCount: 'Active On-Duty Staff',
    loggedHoursThisMonth: 'Logged Hours (This Month)',
    monthlyBase: 'Monthly Base',
    hourlyRateLabel: 'Hourly Rate',
    bonus: 'Bonus',
    deductions: 'Deductions',
    netPay: 'Net Pay',
    payslip: 'Payslip',
    shiftType: 'Shift Type',
    regularShift: 'Regular Shift',
    openingShift: 'Opening Shift',
    closingShift: 'Closing Shift',
    overtime: 'Overtime',
    weekendShift: 'Weekend Shift',
    missedPunch: 'Log Past Shift',
    logPastShift: 'Record Missed Shift Punch',
    clockInSuccess: 'Clocked In Successfully',
    clockOutSuccess: 'Clocked Out Successfully',

    inventoryTitle: 'Stock & Inventory Control',
    lowStockAlert: 'Low Stock Alerts',
    inStock: 'In Stock',
    unitCost: 'Unit Cost',
    reorderThreshold: 'Reorder Level',
    addNewItem: 'Add New Item',

    invoicesTitle: 'Billing & Invoices Ledger',
    totalRevenue: 'Total Revenue',
    unpaidInvoices: 'Unpaid Invoices',
    dailyRevenueSummary: 'Daily Revenue Summary',
    dailyRevenueSubtitle: "Automated sales, coworking billing, and net profit calculated from today's invoices",
    totalDailySales: 'Total Daily Sales',
    coworkingIncome: 'Coworking Income',
    posSales: 'F&B / POS Sales',
    netProfit: 'Net Profit',
    costOfGoods: 'Cost of Goods (COGS)',
    netProfitMargin: 'Net Profit Margin',
    todayInvoicesCount: "Today's Invoices",
    reconciliationLedger: "Today's Invoice Breakdown & Profit Ledger",
    paidCollected: 'Collected & Paid',
    exportPdfReport: 'Export PDF Report',
    exportExcelReport: 'Export Excel (CSV)',
    periodDaily: 'Daily (Today)',
    periodWeekly: 'Weekly (Last 7 Days)',
    periodMonthly: 'Monthly (This Month)',
    periodCustom: 'Custom Date Range',
    startDate: 'Start Date',
    endDate: 'End Date',
    filterPeriod: 'Report Timeframe',
    financialReports: 'Financial Reports & Exports',
    financialReportsSubtitle: 'Export customized daily, weekly, monthly and date-range P&L statements to PDF and Excel.',
    crmTitle: 'Customer Loyalty & CRM',
    loyaltyPoints: 'Loyalty Points',
    pointsRule: '500 Points = 50 EGP Discount',
    vipTier: 'VIP Tier',
    regularTier: 'Regular',
    silverTier: 'Silver Member',
    goldTier: 'Gold VIP',
    founderTier: 'Founder / VIP',
    visits: 'Visits',
    totalSpent: 'Total Spent',

    hardwareTitle: 'Receipt Printer & Cashier Hardware',
    hardwareSubtitle: 'ESC/POS thermal printer roll (58mm/80mm), cash drawer RJ11 pulse, and dual customer display.',
    printerSettings: 'Thermal Receipt Printer',
    cashDrawerSettings: 'Cash Drawer (RJ11/RJ12)',
    customerDisplaySettings: 'Customer-Facing Secondary Display',
    thermalWidth: 'Thermal Paper Width',
    printerType: 'Connection Type',
    systemSpooler: 'System / Browser Print Spooler',
    usbSerial: 'Direct USB / Web Serial Port',
    bluetooth: 'Bluetooth ESC/POS Thermal',
    testPrint: 'Print Test Slip',
    testKickDrawer: 'Test Kick Cash Drawer',
    openCustomerScreen: 'Open Secondary Customer Screen',
    autoKickOnCash: 'Auto-kick cash drawer on Cash payments',
    autoPrintReceipt: 'Auto-print receipt upon checkout completion',
    saveSettings: 'Save Hardware Settings',

    // Zywell 80 Thermal Printer Support
    zywellModel: 'Zywell 80 (GA-C80250I Plus)',
    zywellPresetApplied: 'Zywell 80 Hardware Profile Applied',
    zywellProfileDesc: 'Commercial 80mm Direct Thermal POS Receipt Printer (250mm/s, ESC/POS, Auto-Cutter, RJ11 24V Cash Drawer).',
    connectZywell: 'Connect Zywell 80',
    zywellUsbDirect: 'USB Cable (Direct Port)',
    zywellNetworkLan: 'Ethernet / LAN IP (Port 9100)',
    zywellWindowsDriver: 'Windows Driver (GA-C80250) / Spooler',
    zywellBluetooth: 'Bluetooth Wireless',
    testCutter: 'Test Auto-Cutter',
    testFeed: 'Feed Paper (3 lines)',
    printerStatusConnected: 'Online & Ready',
    printerStatusDisconnected: 'Standby / Ready to Connect',
    printerIpAddress: 'Printer IP Address & Port',
    baudRate: 'Baud Rate',
    manualGuideTitle: 'Zywell GA-C80250I Plus Quick Guide',

    // Receipt & Kitchen Separation & Font Sizing
    customerReceipt: 'Customer Receipt',
    kitchenReceipt: 'Kitchen & Bar Ticket (KOT)',
    bothReceiptsSeparate: 'Both (Separate Slips)',
    printCustomerReceipt: 'Print Customer Receipt',
    printKitchenReceipt: 'Print Kitchen Ticket',
    printBothSeparate: 'Print Both (With Auto-Cut)',
    receiptType: 'Receipt Format',
    fontSize: 'Font Size',
    standardFont: 'Standard Font',
    largeObviousFont: 'Large & Obvious Font',
    extraLargeFont: 'Extra Large Chef Font',
    kitchenOrderTicket: 'Kitchen Order Ticket (KOT)',
    kitchenTicketSubtitle: 'High-contrast preparation ticket for baristas & line chefs',
    kotStationHotKitchen: 'Hot Kitchen',
    stationBaristaBar: 'Barista Bar',
    orderNumberLarge: 'Order Number',
    destinationLocation: 'Table / Location',
    itemQuantitiesLarge: 'Item & Quantity',
    specialInstructions: 'Special Notes & Modifiers',
    cutSlipBetween: 'Automatic paper cut between customer and kitchen slips',

    // Integrations & Software Sync
    integrationsTitle: 'Software Integrations & REST API Hub',
    integrationsSubtitle: 'Connect external ERPs (Odoo, SAP, QuickBooks), custom backend software, webhooks, and mobile applications directly to White Table.',
    apiDocs: 'REST API Documentation & Explorer',
    testConnection: 'Test External Connection',
    apiKeyLabel: 'Secret API Access Token (Bearer)',
    webhookUrlLabel: 'Outgoing Webhook Notification URL',
    testPingSuccess: 'Connection to external software verified successfully!',
    syncNow: 'Trigger Immediate Sync',
    liveEndpoints: 'Live Production Endpoints',
    codeSnippets: 'Integration Code Examples (Python, cURL, Node.js)',

    // Visual Dashboard Charts
    visualDashboard: 'Visual Operations & Charts Dashboard',
    revenueTrajectory: 'Revenue Trajectory & Stream Mix',
    categoryMix: 'Menu Category Distribution',
    peakHoursFlow: 'Hourly Rush & Peak Customer Velocity',
    topProductsChart: 'Top Performing Menu Items',
    zoneUtilizationChart: 'Coworking Zone Occupancy',
    paymentMethodsChart: 'Payment Method Breakdown',
    visualInsights: 'Live Visual Insights & Floor Map',
    timeframe7D: '7 Days',
    timeframe30D: '30 Days',
    timeframeToday: 'Today (Hourly)',
    totalSalesStream: 'POS & Food Sales',
    coworkingSalesStream: 'Coworking & Tables',
    netProfitStream: 'Estimated Gross Margin',
    orderVolume: 'Orders Count',
    unitsSold: 'Units Sold',
    revenueGenerated: 'Revenue (EGP)',
  },
  ar: {
    brandName: 'وايت تيبل',
    brandSubtitle: 'مطعم ومقهى وايت تيبل',
    dashboard: 'لوحة التحكم',
    pos: 'نقطة البيع (الكاشير)',
    coworking: 'مساحة العمل المشتركة',
    kitchen: 'تذاكر المطبخ (KOT)',
    stock: 'المخزون والمستودع',
    invoices: 'الفواتير والمبيعات',
    crm: 'العملاء ونقاط الولاء',
    attendance: 'تسجيل الحضور والانصراف',
    payroll: 'مسير الرواتب والمستحقات',
    employees: 'الموظفين والحضور والرواتب',
    analytics: 'التقارير والإحصائيات',
    integrations: 'الربط البرمجي والـ API',
    tutorials: 'التدريب وشروحات الفيديو',

    // Roles & RBAC
    roleOwner: 'المالك والمؤسس',
    roleManager: 'مدير النظام والتشغيل',
    roleSoftwareEngineer: 'مهندس البرمجيات (Developer)',
    roleCashier: 'الكاشير وخدمة العملاء',
    roleStaff: 'فريق العمل (باريستا / شيف)',
    currentRole: 'الدور النشط',
    switchRole: 'تبديل الصلاحية',
    accessRestricted: 'قسم محظور الوصول',
    accessRestrictedDesc: 'لا تملك صلاحيات كافية للوصول لهذا القسم. يرجى التبديل لدور المالك أو مدير النظام.',
    devConsole: 'لوحة المطور وفحص سجلات النظام',

    // Kitchen Orders / KOT
    kitchenOrders: 'تذاكر وإشعارات المطبخ والباريستا',
    kitchenSubtitle: 'شاشة تحضير الطلبات الفورية (KDS) مع الطباعة الحرارية التلقائية لتذاكر الشيف والباريستا.',
    stationHotKitchen: 'المطبخ الساخن والمأكولات',
    stationBarista: 'بار القهوة والمشروبات',
    stationAll: 'كافة الأقسام',
    ticketQueued: 'في الانتظار',
    ticketPreparing: 'قيد التحضير',
    ticketReady: 'جاهز للتقديم',
    ticketServed: 'تم التسليم والإنهاء',
    printChefTicket: 'طباعة تذكرة الشيف (KOT)',
    autoPrintKitchen: 'طباعة تذكرة المطبخ تلقائياً عند الطلب',
    startPrep: 'بدء التحضير',
    markReady: 'جاهز للاستلام',
    markServed: 'تم التسليم',
    reprintKOT: 'إعادة طباعة التذكرة',
    newKitchenTicket: 'إصدار تذكرة مطبخ يدوية',

    // Payroll specific
    payrollTitle: 'مسير الرواتب ومستحقات الموظفين',
    payrollSubtitle: 'حساب تلقائي لصافي الرواتب حسب ساعات الحضور الفعلية، إضافة المكافآت والخصومات وإصدار قسائم الرواتب.',
    totalPayrollBudget: 'إجمالي ميزانية الرواتب',
    paidSalaries: 'الرواتب المسددة',
    pendingSalaries: 'الرواتب المستحقة للصرف',
    issuePayslip: 'طباعة قسيمة الراتب',
    salarySlipTitle: 'قسيمة راتب رسمية - وايت تيبل',
    salaryPaidSuccess: 'تم تسليم الراتب بنجاح عبر إنستاباي / نقداً',

    versionTag: 'وايت تيبل إصدار 2.5',
    quickPOS: 'كاشير سريع',
    kickDrawer: 'فتح الدرج',
    hardware: 'إعدادات الطابعة',
    registerActive: 'نقطة البيع #01 نشطة',
    online: 'متصل',
    shift: 'الوردية',
    loggedManager: 'المستخدم: المدير',
    language: 'اللغة',
    switchToAr: 'العربية',
    switchToEn: 'English',
    searchPlaceholder: 'بحث في النظام...',
    currency: 'ج.م',

    add: 'إضافة',
    save: 'حفظ',
    cancel: 'إلغاء',
    close: 'إغلاق',
    delete: 'حذف',
    edit: 'تعديل',
    print: 'طباعة الإيصال',
    export: 'تصدير',
    filter: 'تصفية',
    all: 'الكل',
    status: 'الحالة',
    actions: 'الإجراءات',
    view: 'عرض',
    paid: 'مدفوع',
    pending: 'معلق',
    completed: 'مكتمل',
    active: 'نشط',
    inactive: 'غير نشط',
    total: 'الإجمالي',
    subtotal: 'المجموع الفرعي',
    tax: 'ضريبة القيمة المضافة',
    discount: 'الخصم',
    notes: 'ملاحظات',
    date: 'التاريخ',
    time: 'الوقت',
    phone: 'رقم الهاتف',
    email: 'البريد الإلكتروني',
    name: 'الاسم',
    role: 'المسمى الوظيفي',
    category: 'القسم / الصنف',
    price: 'السعر',
    qty: 'الكمية',
    items: 'المنتجات',
    paymentMethod: 'طريقة الدفع',
    cash: 'نقداً (كاش)',
    card: 'بطاقة بنكية',
    instaPay: 'إنستاباي / محفظة',
    memberTab: 'حساب العضوية',

    searchMenu: 'ابحث في قائمة المشروبات والمأكولات...',
    allCategories: 'جميع الأقسام',
    orderCart: 'سلة الطلب',
    emptyCart: 'السلة فارغة',
    emptyCartSub: 'اختر منتجات من القائمة لبدء الطلب',
    clearCart: 'مسح السلة',
    charge: 'تحصيل',
    checkout: 'الدفع وإصدار الفاتورة',
    selectCustomer: 'اختيار العميل',
    guestWalkIn: 'عميل عام / زائر',
    tableOrDesk: 'الطاولة / المكتب',
    addons: 'الإضافات',
    size: 'الحجم',
    single: 'سينجل',
    double: 'دبل',
    orderSuccess: 'تم تسجيل الطلب بنجاح',
    receiptNumber: 'رقم الإيصال #',

    desksTitle: 'إدارة 14 طاولة عمل ومساحة كوووركينج',
    tablesTitle: '14 طاولة عمل',
    activeSessions: 'الجلسات النشطة',
    availableDesks: 'الطاولات المتاحة',
    availableTables: 'الطاولات المتاحة',
    startSession: 'بدء جلسة عمل على الطاولة',
    endSession: 'إنهاء الجلسة والدفع',
    hourlyRate: 'سعر الساعة (100 ج.م / ساعة)',
    capacity: 'السعة',
    duration: 'المدة',
    currentBill: 'الفاتورة الحالية',
    quietZone: 'طاولات التركيز والهدوء',
    collaborative: 'طاولات العمل التشاركي',
    privatePod: 'كبائن العمل الفردية',
    meetingRoom: 'طاولات الاجتماعات',
    outdoorTerrace: 'طاولات الشرفة الخارجية',
    wifiCard: 'كارت باقة واي فاي 5 جيجا',
    wifiCardDesc: 'كارت شحن إنترنت فائق السرعة 5G (50 ج.م · 5 جيجا)',
    wifiPin: 'كود الواي فاي PIN',
    wifiComboBundle: 'عرض باقة طاولة العمل + كارت 5 جيجا واي فاي',
    wifiComboPromoBadge: 'خصم 15% على الفاتورة',
    combo15Discount: 'خصم 15% لعرض الطاولة والواي فاي',
    tablesCount14: '14 طاولة عمل مجهزة',

    staffDirectory: 'فريق العمل وسجل الحضور',
    staffSubtitle: 'تسجيل الحضور والانصراف بضغطة زر، متابعة الورديات وحساب الرواتب التلقائي.',
    clockIn: 'تسجيل حضور',
    clockOut: 'تسجيل انصراف',
    onDuty: 'على رأس العمل',
    offDuty: 'خارج الوردية',
    attendanceLog: 'سجل الحضور اليومي',
    payrollRegister: 'مسير الرواتب الشهري',
    activeStaffCount: 'الموظفون في العمل الآن',
    loggedHoursThisMonth: 'الساعات المسجلة (هذا الشهر)',
    monthlyBase: 'الراتب الأساسي',
    hourlyRateLabel: 'سعر الساعة',
    bonus: 'مكافآت',
    deductions: 'خصومات',
    netPay: 'صافي الراتب',
    payslip: 'قسيمة الراتب',
    shiftType: 'نوع الوردية',
    regularShift: 'وردية عادية',
    openingShift: 'وردية افتتاح',
    closingShift: 'وردية إغلاق',
    overtime: 'ساعات إضافية',
    weekendShift: 'وردية عطلة',
    missedPunch: 'تسجيل وردية سابقة',
    logPastShift: 'تسجيل حضور يدوي / فائت',
    clockInSuccess: 'تم تسجيل الحضور بنجاح',
    clockOutSuccess: 'تم تسجيل الانصراف وتحديث الساعات',

    inventoryTitle: 'المخزون وإدارة المستودع',
    lowStockAlert: 'تنبيهات انخفاض المخزون',
    inStock: 'المتوفر بالمخزن',
    unitCost: 'سعر التكلفة',
    reorderThreshold: 'حد إعادة الطلب',
    addNewItem: 'إضافة صنف جديد',

    invoicesTitle: 'دفتر الفواتير والمبيعات',
    totalRevenue: 'إجمالي الإيرادات',
    unpaidInvoices: 'الفواتير غير المسددة',
    dailyRevenueSummary: 'ملخص الإيرادات المالية',
    dailyRevenueSubtitle: 'حساب تلقائي للمبيعات، إيرادات الطاولات، وصافي الأرباح مع تصدير PDF وإكسيل',
    totalDailySales: 'إجمالي المبيعات',
    coworkingIncome: 'إيرادات طاولات العمل (100 ج.م/س)',
    posSales: 'مبيعات الكاشير والأغذية',
    netProfit: 'صافي الربح',
    costOfGoods: 'تكلفة البضاعة المباعة (COGS)',
    netProfitMargin: 'هامش الربح الصافي',
    todayInvoicesCount: 'عدد الفواتير',
    reconciliationLedger: 'تفاصيل الفواتير وهوامش الربح',
    paidCollected: 'المحصل والمدفوع',
    exportPdfReport: 'تصدير تقرير PDF',
    exportExcelReport: 'تصدير إكسيل (CSV)',
    periodDaily: 'يومي (اليوم)',
    periodWeekly: 'أسبوعي (آخر 7 أيام)',
    periodMonthly: 'شهري (هذا الشهر)',
    periodCustom: 'تحديد فترة مخصصة',
    startDate: 'من تاريخ',
    endDate: 'إلى تاريخ',
    filterPeriod: 'الفترة الزمنية',
    financialReports: 'التقارير المالية والتصدير',
    financialReportsSubtitle: 'تصدير تقارير الأرباح والخسائر اليومية، الأسبوعية، الشهرية والمخصصة بصيغة PDF وإكسيل.',
    crmTitle: 'إدارة العملاء وبرنامج الولاء',
    loyaltyPoints: 'نقاط الولاء',
    pointsRule: 'كل 500 نقطة = 50 ج.م خصم',
    vipTier: 'فئة العضوية',
    regularTier: 'عميل عادي',
    silverTier: 'عضوية فضية',
    goldTier: 'عضوية ذهبية VIP',
    founderTier: 'مؤسس / VIP دائم',
    visits: 'الزيارات',
    totalSpent: 'إجمالي المشتريات',

    hardwareTitle: 'إعدادات الطابعة الحرارية والدرج',
    hardwareSubtitle: 'طابعات الفواتير الحرارية ESC/POS (58مم / 80مم)، نبض فتح الدرج RJ11 وشاشة العميل.',
    printerSettings: 'طابعة الإيصالات الحرارية',
    cashDrawerSettings: 'درج النقود (RJ11/RJ12)',
    customerDisplaySettings: 'شاشة العميل التفاعلية',
    thermalWidth: 'عرض ورق الطباعة',
    printerType: 'طريقة الاتصال',
    systemSpooler: 'طابعة النظام عبر المتصفح',
    usbSerial: 'منفذ USB / تسلسلي مباشر',
    bluetooth: 'بلوتوث لاسلكي ESC/POS',
    testPrint: 'طباعة إيصال تجريبي',
    testKickDrawer: 'تجربة فتح درج النقود',
    openCustomerScreen: 'فتح شاشة العميل على شاشة ثانية',
    autoKickOnCash: 'فتح الدرج تلقائياً عند الدفع نقداً',
    autoPrintReceipt: 'طباعة الإيصال تلقائياً بعد إتمام الدفع',
    saveSettings: 'حفظ الإعدادات',

    // Zywell 80 Thermal Printer Support
    zywellModel: 'طابعة زيويل Zywell 80 (موديل GA-C80250I Plus)',
    zywellPresetApplied: 'تم تفعيل الملف التعريفي لطابعة زيويل 80',
    zywellProfileDesc: 'طابعة فواتير حرارية تجارية مقاس 80 مم (سرعة 250 مم/ث، أوامر ESC/POS، قاطع آلي، درج نقود 24V RJ11).',
    connectZywell: 'اتصال فوري بطابعة زيويل 80',
    zywellUsbDirect: 'كابل USB (منفذ تسلسلي مباشر)',
    zywellNetworkLan: 'شبكة إيثرنت / LAN IP (منفذ 9100)',
    zywellWindowsDriver: 'تعريف ويندوز (GA-C80250) / طباعة النظام',
    zywellBluetooth: 'اتصال لاسلكي بلوتوث',
    testCutter: 'تجربة القاطع الآلي',
    testFeed: 'تغذية الورق (3 أسطر)',
    printerStatusConnected: 'متصلة وجاهزة للطباعة',
    printerStatusDisconnected: 'في وضع الاستعداد / جاهزة للربط',
    printerIpAddress: 'عنوان الـ IP ورقم المنفذ للطابعة',
    baudRate: 'معدل البود (Baud Rate)',
    manualGuideTitle: 'دليل ربط وتشغيل طابعة زيويل Zywell GA-C80250I Plus',

    // Receipt & Kitchen Separation & Font Sizing
    customerReceipt: 'فاتورة العميل',
    kitchenReceipt: 'بون تحضير المطبخ والبار (KOT)',
    bothReceiptsSeparate: 'الفاتورة وبون المطبخ (منفصلين)',
    printCustomerReceipt: 'طباعة فاتورة العميل فقط',
    printKitchenReceipt: 'طباعة بون المطبخ فقط',
    printBothSeparate: 'طباعة الاثنين (مع قاطع تلقائي)',
    receiptType: 'نوع الإيصال',
    fontSize: 'حجم الخط',
    standardFont: 'خط قياسي',
    largeObviousFont: 'خط كبير وواضح جداً',
    extraLargeFont: 'خط شيف عريض (أقصى وضوح)',
    kitchenOrderTicket: 'بون تحضير المطبخ (KOT)',
    kitchenTicketSubtitle: 'تذكرة طلب واضحة ومباشرة للباريستا والشيف بدون تعقيدات مالية',
    kotStationHotKitchen: 'المطبخ الساخن',
    stationBaristaBar: 'بار المشروبات والباريستا',
    orderNumberLarge: 'رقم الطلب',
    destinationLocation: 'الطاولة / جهة الطلب',
    itemQuantitiesLarge: 'الصنف والكمية',
    specialInstructions: 'ملاحظات وإضافات خاصة',
    cutSlipBetween: 'قاطع آلي يفصل بين فاتورة العميل وبون المطبخ تلقائياً',

    // Integrations & Software Sync
    integrationsTitle: 'بوابة الربط البرمجي وتكامل البرامج الخارجية (API Hub)',
    integrationsSubtitle: 'ربط برامج الحسابات و ERP (أودو، كويك بوكس، ساب)، المتاجر الإلكترونية، وتطبيقات الجوال مباشرة بنظام وايت تيبل.',
    apiDocs: 'مستكشف وتوثيق الـ REST API',
    testConnection: 'اختبار الاتصال بالبرنامج الخارجي',
    apiKeyLabel: 'مفتاح الـ API السري (Bearer Token)',
    webhookUrlLabel: 'رابط إشعارات الويب هوك (Webhook URL)',
    testPingSuccess: 'تم التحقق من الاتصال بالبرنامج الخارجي بنجاح!',
    syncNow: 'مزامنة فورية الآن',
    liveEndpoints: 'نقاط النهاية البرمجية المباشرة (Endpoints)',
    codeSnippets: 'أكواد الربط الجاهزة (Python, cURL, Node.js)',

    // Visual Dashboard Charts
    visualDashboard: 'لوحة التحكم البيانية والمؤشرات المرئية',
    revenueTrajectory: 'مسار الإيرادات وتوزيع مصادر الدخل',
    categoryMix: 'توزيع المبيعات حسب الأصناف والمشروبات',
    peakHoursFlow: 'ساعات الذروة وكثافة تدفق الزوار',
    topProductsChart: 'الأصناف الأكثر مبيعاً وتحقيقاً للأرباح',
    zoneUtilizationChart: 'نسبة إشغال مناطق ومساحات العمل',
    paymentMethodsChart: 'توزيع طرق الدفع والنقد الإلكتروني',
    visualInsights: 'مخطط المكاتب الحي والمؤشرات التشغيلية',
    timeframe7D: 'آخر 7 أيام',
    timeframe30D: 'آخر 30 يوماً',
    timeframeToday: 'اليوم (بالساعات)',
    totalSalesStream: 'مبيعات الكاشير والأغذية',
    coworkingSalesStream: 'إيراد المكاتب ومساحات العمل',
    netProfitStream: 'هامش الربح التقديري',
    orderVolume: 'عدد الطلبات',
    unitsSold: 'الكمية المباعة',
    revenueGenerated: 'الإيراد المحقق (ج.م)',
  },
};
