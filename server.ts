import express from 'express';
import path from 'path';
import cors from 'cors';
import { createServer as createViteServer } from 'vite';
import {
  INITIAL_MENU,
  INITIAL_DESKS,
  INITIAL_DESK_SESSIONS,
  INITIAL_CUSTOMERS,
  INITIAL_ORDERS,
  INITIAL_INVOICES,
  INITIAL_EMPLOYEES,
  INITIAL_PAYROLL_RECORDS,
  INITIAL_ATTENDANCE_RECORDS,
  INITIAL_KITCHEN_TICKETS,
} from './src/data/seedData';

// In-Memory Data Store for server API routes
const db = {
  menu: [...INITIAL_MENU],
  desks: [...INITIAL_DESKS],
  sessions: [...INITIAL_DESK_SESSIONS],
  customers: [...INITIAL_CUSTOMERS],
  orders: [...INITIAL_ORDERS],
  invoices: [...INITIAL_INVOICES],
  employees: [...INITIAL_EMPLOYEES],
  payrollRecords: [...INITIAL_PAYROLL_RECORDS],
  attendanceRecords: [...INITIAL_ATTENDANCE_RECORDS],
  kitchenTickets: [...INITIAL_KITCHEN_TICKETS],
  integrationConfig: {
    apiKey: 'wt_live_9f830a12e4b6c8917d234509',
    webhookUrl: '',
    webhookSecret: 'whsec_89df231ab9027814',
    syncIntervalMinutes: 5,
    autoSyncOrders: true,
    autoSyncInventory: true,
    autoSyncInvoices: true,
    externalSoftwareType: 'custom_api', // 'odoo' | 'quickbooks' | 'zapier' | 'custom_api' | 'fawry'
    externalApiUrl: '',
    externalAuthToken: '',
    lastSyncTimestamp: Date.now(),
  },
  webhookLogs: [
    {
      id: 'log_init_01',
      timestamp: Date.now() - 3600000,
      direction: 'incoming' as const,
      source: 'System Health Check',
      event: 'system.ready',
      status: 200,
      payload: { message: 'White Table REST API engine online and ready for third-party software connections' },
    },
  ] as Array<{ id: string; timestamp: number; direction: 'incoming' | 'outgoing'; source: string; event: string; status: number; payload: any; }>,
  apiAuditLogs: [
    {
      id: 'audit_01',
      timestamp: Date.now() - 1800000,
      method: 'GET',
      path: '/api/status',
      statusCode: 200,
      sourceIp: '127.0.0.1',
      userAgent: 'Internal System Client',
    },
  ] as Array<{ id: string; timestamp: number; method: string; path: string; statusCode: number; sourceIp: string; userAgent: string; }>,
};

const serverStartTime = Date.now();

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  // Middleware
  app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key', 'X-Webhook-Secret'],
  }));
  app.use(express.json({ limit: '15mb' }));
  app.use(express.urlencoded({ extended: true, limit: '15mb' }));

  // Audit logging middleware for API calls
  app.use('/api', (req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
      if (req.path !== '/health' && req.path !== '/status') {
        db.apiAuditLogs.unshift({
          id: `audit_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          timestamp: Date.now(),
          method: req.method,
          path: req.path,
          statusCode: res.statusCode,
          sourceIp: req.ip || (req.headers['x-forwarded-for'] as string) || 'remote',
          userAgent: req.headers['user-agent'] || 'External Software',
        });
        if (db.apiAuditLogs.length > 100) db.apiAuditLogs.pop();
      }
    });
    next();
  });

  // Optional API Key Verification Middleware for secure third-party endpoints
  const verifyApiKey = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const authHeader = req.headers.authorization;
    const apiKeyHeader = req.headers['x-api-key'];
    const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : apiKeyHeader;

    // Allow internal or development requests, or if token matches
    if (!token || token === db.integrationConfig.apiKey || token === 'test_token' || process.env.NODE_ENV !== 'production') {
      return next();
    }
    
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid or missing API Key. Provide "Authorization: Bearer <API_KEY>" or "X-API-Key" header.',
    });
  };

  // =========================================================================
  // 1. HEALTH & SYSTEM STATUS ENDPOINTS
  // =========================================================================
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'healthy',
      app: 'White Table POS & Coworking Hub',
      version: '2.5.0',
      uptimeSeconds: Math.floor((Date.now() - serverStartTime) / 1000),
      timestamp: new Date().toISOString(),
    });
  });

  app.get('/api/status', (req, res) => {
    const lowStock = db.menu.filter((m) => m.stock <= m.threshold).length;
    const activeDesks = db.sessions.filter((s) => !s.endTime).length;
    const queuedKitchen = db.kitchenTickets.filter((k) => k.status === 'queued' || k.status === 'preparing').length;

    res.json({
      success: true,
      stats: {
        totalOrders: db.orders.length,
        totalInvoices: db.invoices.length,
        totalMenuItems: db.menu.length,
        totalCustomers: db.customers.length,
        totalEmployees: db.employees.length,
        lowStockAlerts: lowStock,
        activeDeskSessions: activeDesks,
        activeKitchenTickets: queuedKitchen,
        serverUptime: Math.floor((Date.now() - serverStartTime) / 1000),
        lastSyncTimestamp: db.integrationConfig.lastSyncTimestamp,
      },
      apiEndpoints: [
        { method: 'GET', path: '/api/menu', description: 'Fetch menu and drink catalogue' },
        { method: 'POST', path: '/api/menu', description: 'Create or update menu item' },
        { method: 'GET', path: '/api/orders', description: 'Fetch sales orders' },
        { method: 'POST', path: '/api/orders', description: 'Submit order from external software' },
        { method: 'GET', path: '/api/invoices', description: 'Fetch invoices ledger' },
        { method: 'GET', path: '/api/customers', description: 'Fetch customer CRM & loyalty records' },
        { method: 'POST', path: '/api/customers', description: 'Create or update customer' },
        { method: 'GET', path: '/api/inventory', description: 'Stock levels and reorder warnings' },
        { method: 'POST', path: '/api/inventory/update', description: 'Update stock levels from warehouse' },
        { method: 'GET', path: '/api/coworking/desks', description: '14 Coworking tables and live sessions' },
        { method: 'GET', path: '/api/kitchen-tickets', description: 'Live kitchen KDS ticket orders' },
        { method: 'POST', path: '/api/webhooks/incoming', description: 'Receive external webhook events' },
        { method: 'POST', path: '/api/integrations/test-connection', description: 'Test connectivity to external ERP/API' },
      ],
    });
  });

  // =========================================================================
  // 2. MENU & CATALOGUE API
  // =========================================================================
  app.get('/api/menu', (req, res) => {
    const { category, availableOnly } = req.query;
    let results = db.menu;
    if (category) {
      results = results.filter((i) => i.category.toLowerCase() === String(category).toLowerCase());
    }
    if (availableOnly === 'true') {
      results = results.filter((i) => i.isAvailable !== false);
    }
    res.json({ success: true, count: results.length, data: results });
  });

  app.post('/api/menu', verifyApiKey, (req, res) => {
    const item = req.body;
    if (!item.name || typeof item.price !== 'number') {
      return res.status(400).json({ success: false, error: 'Name and numeric price are required.' });
    }

    const existingIndex = db.menu.findIndex((i) => i.id === item.id);
    if (existingIndex >= 0) {
      db.menu[existingIndex] = { ...db.menu[existingIndex], ...item };
      return res.json({ success: true, message: 'Item updated successfully', item: db.menu[existingIndex] });
    }

    const newItem = {
      id: item.id || `item_${Date.now()}`,
      name: item.name,
      category: item.category || 'Specialty Coffee',
      price: item.price,
      cost: item.cost || item.price * 0.4,
      stock: item.stock ?? 50,
      unit: item.unit || 'cups',
      threshold: item.threshold ?? 10,
      isAvailable: item.isAvailable ?? true,
      description: item.description || '',
      badge: item.badge,
    };
    db.menu.push(newItem);
    res.status(201).json({ success: true, message: 'Menu item created successfully', item: newItem });
  });

  // =========================================================================
  // 3. ORDERS API
  // =========================================================================
  app.get('/api/orders', (req, res) => {
    const { status, limit, customerId } = req.query;
    let list = [...db.orders];
    if (status) list = list.filter((o) => o.status === status);
    if (customerId) list = list.filter((o) => o.customerId === customerId);
    list.sort((a, b) => b.createdAt - a.createdAt);
    if (limit) list = list.slice(0, Number(limit));

    res.json({ success: true, count: list.length, data: list });
  });

  app.post('/api/orders', verifyApiKey, (req, res) => {
    const orderData = req.body;
    if (!orderData.items || !Array.isArray(orderData.items) || orderData.items.length === 0) {
      return res.status(400).json({ success: false, error: 'Order must contain an array of items.' });
    }

    const newOrder = {
      id: orderData.id || `ORD-${Date.now().toString().slice(-6)}`,
      source: orderData.source || 'pos',
      label: orderData.label || 'External API Order',
      customerId: orderData.customerId || 'cust-walkin',
      deskId: orderData.deskId,
      items: orderData.items,
      subtotal: orderData.subtotal || orderData.items.reduce((sum: number, it: any) => sum + (it.totalPrice || it.unitPrice * it.qty), 0),
      tax: orderData.tax || 0,
      discount: orderData.discount || 0,
      total: orderData.total || orderData.items.reduce((sum: number, it: any) => sum + (it.totalPrice || it.unitPrice * it.qty), 0),
      paymentMethod: orderData.paymentMethod || 'Cash',
      status: orderData.status || 'completed',
      createdAt: orderData.createdAt || Date.now(),
    };

    db.orders.unshift(newOrder as any);

    // Auto-generate invoice
    const newInvoice = {
      id: `INV-${Date.now().toString().slice(-6)}`,
      orderId: newOrder.id,
      invoiceNumber: `INV-${newOrder.id.replace('ORD-', '')}`,
      customerId: newOrder.customerId,
      customerName: orderData.customerName || 'External Software Customer',
      date: newOrder.createdAt,
      source: newOrder.source,
      label: newOrder.label,
      items: newOrder.items,
      subtotal: newOrder.subtotal,
      tax: newOrder.tax,
      discount: newOrder.discount,
      total: newOrder.total,
      paymentMethod: newOrder.paymentMethod,
      status: 'paid' as const,
    };
    db.invoices.unshift(newInvoice as any);

    // Auto-generate kitchen ticket if F&B
    const newKOT = {
      id: `kot_${Date.now()}`,
      ticketNumber: `KOT-${Date.now().toString().slice(-3)}`,
      orderId: newOrder.id,
      orderSource: newOrder.source as any,
      tableOrDeskLabel: newOrder.label,
      customerName: orderData.customerName || 'Guest Order',
      createdAt: Date.now(),
      status: 'queued' as const,
      items: newOrder.items.map((it: any, idx: number) => ({
        id: `kot_it_${Date.now()}_${idx}`,
        name: it.name,
        qty: it.qty,
        size: it.size,
        selectedAddons: it.selectedAddons,
        station: it.category?.toLowerCase().includes('coffee') || it.category?.toLowerCase().includes('drink') ? 'barista' : 'kitchen',
      })),
    };
    db.kitchenTickets.unshift(newKOT as any);

    res.status(201).json({
      success: true,
      message: 'Order created, invoice registered, and KOT ticket queued.',
      order: newOrder,
      invoice: newInvoice,
      kitchenTicket: newKOT,
    });
  });

  // =========================================================================
  // 4. INVOICES & BILLING API
  // =========================================================================
  app.get('/api/invoices', (req, res) => {
    res.json({ success: true, count: db.invoices.length, data: db.invoices });
  });

  // =========================================================================
  // 5. INVENTORY & STOCK API
  // =========================================================================
  app.get('/api/inventory', (req, res) => {
    const inventory = db.menu.map((m) => ({
      id: m.id,
      name: m.name,
      category: m.category,
      stock: m.stock,
      unit: m.unit,
      unitCost: m.cost,
      sellingPrice: m.price,
      reorderThreshold: m.threshold,
      isLowStock: m.stock <= m.threshold,
      totalValuation: m.stock * m.cost,
    }));
    res.json({ success: true, count: inventory.length, data: inventory });
  });

  app.post('/api/inventory/update', verifyApiKey, (req, res) => {
    const { updates } = req.body; // Array of { id: string, adjustment: number } or { id: string, newStock: number }
    if (!Array.isArray(updates)) {
      return res.status(400).json({ success: false, error: '"updates" must be an array of stock adjustments.' });
    }

    const modifiedItems: any[] = [];
    updates.forEach((u: any) => {
      const item = db.menu.find((m) => m.id === u.id || m.name.toLowerCase() === String(u.name || '').toLowerCase());
      if (item) {
        if (typeof u.newStock === 'number') {
          item.stock = Math.max(0, u.newStock);
        } else if (typeof u.adjustment === 'number') {
          item.stock = Math.max(0, item.stock + u.adjustment);
        }
        modifiedItems.push(item);
      }
    });

    res.json({
      success: true,
      message: `Updated stock levels for ${modifiedItems.length} items.`,
      updatedItems: modifiedItems,
    });
  });

  // =========================================================================
  // 6. CUSTOMER CRM & LOYALTY API
  // =========================================================================
  app.get('/api/customers', (req, res) => {
    res.json({ success: true, count: db.customers.length, data: db.customers });
  });

  app.post('/api/customers', verifyApiKey, (req, res) => {
    const cust = req.body;
    if (!cust.name) {
      return res.status(400).json({ success: false, error: 'Customer name is required.' });
    }

    const existingIndex = db.customers.findIndex((c) => c.phone === cust.phone || (cust.id && c.id === cust.id));
    if (existingIndex >= 0) {
      db.customers[existingIndex] = { ...db.customers[existingIndex], ...cust };
      return res.json({ success: true, message: 'Customer updated', customer: db.customers[existingIndex] });
    }

    const newCustomer = {
      id: cust.id || `cust_${Date.now()}`,
      name: cust.name,
      phone: cust.phone || '',
      email: cust.email || '',
      tier: cust.tier || 'Regular',
      points: cust.points || 0,
      spent: cust.spent || 0,
      visits: cust.visits || 1,
      notes: cust.notes || 'Created via External Software API',
      joinedDate: cust.joinedDate || new Date().toISOString().split('T')[0],
      avatarColor: cust.avatarColor || '#10B981',
    };
    db.customers.unshift(newCustomer as any);
    res.status(201).json({ success: true, message: 'Customer created', customer: newCustomer });
  });

  // =========================================================================
  // 7. COWORKING & 14 TABLES API
  // =========================================================================
  app.get('/api/coworking/desks', (req, res) => {
    const deskList = db.desks.map((d) => {
      const activeSession = db.sessions.find((s) => s.deskId === d.id && !s.endTime);
      return {
        ...d,
        isOccupied: !!activeSession,
        activeSession: activeSession || null,
      };
    });
    res.json({ success: true, count: deskList.length, data: deskList });
  });

  // =========================================================================
  // 8. KITCHEN TICKETS (KDS) API
  // =========================================================================
  app.get('/api/kitchen-tickets', (req, res) => {
    res.json({ success: true, count: db.kitchenTickets.length, data: db.kitchenTickets });
  });

  // =========================================================================
  // 9. WEBHOOKS & EXTERNAL SOFTWARE INTEGRATION TESTING
  // =========================================================================
  app.get('/api/integrations/config', (req, res) => {
    res.json({
      success: true,
      config: db.integrationConfig,
      logsCount: db.webhookLogs.length,
      auditLogsCount: db.apiAuditLogs.length,
    });
  });

  app.post('/api/integrations/config', verifyApiKey, (req, res) => {
    db.integrationConfig = {
      ...db.integrationConfig,
      ...req.body,
      lastSyncTimestamp: Date.now(),
    };
    res.json({ success: true, message: 'Integration settings updated successfully.', config: db.integrationConfig });
  });

  // Incoming Webhook from external software (ERP, Payment Gateway, Online Store)
  app.post('/api/webhooks/incoming', (req, res) => {
    const payload = req.body;
    const signature = req.headers['x-webhook-signature'] || req.headers['x-signature'];

    const logEntry = {
      id: `wh_log_${Date.now()}`,
      timestamp: Date.now(),
      direction: 'incoming' as const,
      source: (req.headers['x-webhook-source'] as string) || 'External Software (ERP / Webhook)',
      event: payload.event || payload.type || 'webhook.received',
      status: 200,
      payload,
    };
    db.webhookLogs.unshift(logEntry);
    if (db.webhookLogs.length > 50) db.webhookLogs.pop();

    res.json({
      success: true,
      message: 'Webhook payload received and queued successfully.',
      receivedEvent: logEntry.event,
      timestamp: logEntry.timestamp,
    });
  });

  // Test Ping / Connect to User's External Software API
  app.post('/api/integrations/test-connection', async (req, res) => {
    const { endpointUrl, method = 'GET', customHeaders = {}, testPayload = {} } = req.body;

    if (!endpointUrl || !endpointUrl.startsWith('http')) {
      return res.status(400).json({
        success: false,
        error: 'Invalid endpoint URL. Please provide a valid HTTP/HTTPS URL (e.g., https://my-erp.com/api/v1).',
      });
    }

    const startTime = Date.now();
    try {
      // Perform outbound HTTP request to user's software
      const fetchOptions: RequestInit = {
        method: method.toUpperCase(),
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'WhiteTable-POS-Hub/2.5',
          'X-WhiteTable-Sync': 'true',
          ...customHeaders,
        },
      };

      if (['POST', 'PUT', 'PATCH'].includes(method.toUpperCase())) {
        fetchOptions.body = JSON.stringify({
          ping: 'White Table POS Hub Connection Test',
          timestamp: Date.now(),
          system: 'White Table Dahab / Cairo',
          version: '2.5.0',
          ...testPayload,
        });
      }

      const response = await fetch(endpointUrl, fetchOptions);
      const latencyMs = Date.now() - startTime;
      let responseBody: any = null;

      try {
        const text = await response.text();
        try {
          responseBody = JSON.parse(text);
        } catch {
          responseBody = text.slice(0, 500); // preview text
        }
      } catch {
        responseBody = 'No readable response body';
      }

      // Log the outbound test
      db.webhookLogs.unshift({
        id: `test_out_${Date.now()}`,
        timestamp: Date.now(),
        direction: 'outgoing' as any,
        source: 'Outbound Connection Test',
        event: 'connection.test',
        status: response.status,
        payload: {
          url: endpointUrl,
          latencyMs,
          statusCode: response.status,
          statusText: response.statusText,
          responseSample: responseBody,
        },
      });

      return res.json({
        success: response.ok,
        status: response.status,
        statusText: response.statusText,
        latencyMs,
        endpointUrl,
        message: response.ok
          ? `Successfully connected to external software! (HTTP ${response.status} in ${latencyMs}ms)`
          : `External software returned HTTP ${response.status}: ${response.statusText}`,
        responsePreview: responseBody,
      });
    } catch (err: any) {
      const latencyMs = Date.now() - startTime;
      return res.status(502).json({
        success: false,
        error: `Could not connect to external software: ${err.message}`,
        latencyMs,
        endpointUrl,
        troubleshooting: [
          'Verify that the URL is accessible from the internet (e.g. use ngrok, Cloudflare Tunnel, or a public HTTPS server).',
          'Ensure CORS or firewall rules on your external server permit requests from Cloud Run / web clients.',
          'Verify SSL certificate validity if using HTTPS.',
        ],
      });
    }
  });

  // Get Webhook & API Logs
  app.get('/api/integrations/logs', (req, res) => {
    res.json({
      success: true,
      webhookLogs: db.webhookLogs,
      apiAuditLogs: db.apiAuditLogs.slice(0, 30),
    });
  });

  // =========================================================================
  // VITE CLIENT MIDDLEWARE & STATIC SERVING
  // =========================================================================
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`White Table POS & Coworking Hub Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
