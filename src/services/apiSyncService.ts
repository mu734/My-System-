// Software Integrations & REST API Client Service
// Facilitates bi-directional sync, test pings, webhook simulations, and external ERP integration.

import { SoftwareIntegrationConfig, WebhookLog } from '../types';

export const DEFAULT_INTEGRATION_CONFIG: SoftwareIntegrationConfig = {
  apiKey: 'wt_live_9f830a12e4b6c8917d234509',
  webhookUrl: 'https://webhook.site/demo-wh-whitetable',
  webhookSecret: 'whsec_89df231ab9027814',
  syncIntervalMinutes: 5,
  autoSyncOrders: true,
  autoSyncInventory: true,
  autoSyncInvoices: true,
  externalSoftwareType: 'custom_api',
  externalApiUrl: 'https://api.my-business.com/v1',
  externalAuthToken: '',
  lastSyncTimestamp: Date.now(),
};

const STORAGE_KEY = 'wt_software_integration_settings_v1';

export const getStoredIntegrationConfig = (): SoftwareIntegrationConfig => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return { ...DEFAULT_INTEGRATION_CONFIG, ...JSON.parse(saved) };
    }
  } catch {
    // fallback
  }
  return DEFAULT_INTEGRATION_CONFIG;
};

export const saveStoredIntegrationConfig = (config: SoftwareIntegrationConfig) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch {
    // ignore
  }
};

// 1. Fetch Server System & API Status
export const fetchSystemStatus = async () => {
  try {
    const res = await fetch('/api/status');
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // fallback
  }
  return {
    success: true,
    stats: {
      totalOrders: 12,
      totalInvoices: 12,
      totalMenuItems: 48,
      totalCustomers: 8,
      totalEmployees: 6,
      lowStockAlerts: 3,
      activeDeskSessions: 4,
      activeKitchenTickets: 2,
      serverUptime: 120,
    },
  };
};

// 2. Test Connection to External Software Endpoint
export const testExternalSoftwareConnection = async (
  endpointUrl: string,
  method = 'GET',
  customHeaders: Record<string, string> = {},
  testPayload?: any
): Promise<{
  success: boolean;
  status?: number;
  statusText?: string;
  latencyMs?: number;
  message: string;
  responsePreview?: any;
  error?: string;
}> => {
  try {
    const res = await fetch('/api/integrations/test-connection', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        endpointUrl,
        method,
        customHeaders,
        testPayload,
      }),
    });

    const data = await res.json();
    return data;
  } catch (err: any) {
    return {
      success: false,
      message: err.message || 'Failed to dispatch test connection request.',
      error: err.message,
    };
  }
};

// 3. Test Internal Endpoint Call
export const testInternalEndpoint = async (
  endpoint: string,
  method = 'GET',
  apiKey = 'wt_live_9f830a12e4b6c8917d234509',
  bodyPayload?: any
) => {
  const startTime = Date.now();
  try {
    const options: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
    };
    if (bodyPayload && ['POST', 'PUT', 'PATCH'].includes(method)) {
      options.body = JSON.stringify(bodyPayload);
    }

    const res = await fetch(endpoint, options);
    const latencyMs = Date.now() - startTime;
    const data = await res.json().catch(() => ({ raw: 'Non-JSON response' }));

    return {
      success: res.ok,
      statusCode: res.status,
      latencyMs,
      data,
    };
  } catch (err: any) {
    return {
      success: false,
      statusCode: 500,
      latencyMs: Date.now() - startTime,
      data: { error: err.message },
    };
  }
};

// 4. Fetch Webhook & API Logs
export const fetchIntegrationLogs = async () => {
  try {
    const res = await fetch('/api/integrations/logs');
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // fallback
  }
  return {
    success: true,
    webhookLogs: [],
    apiAuditLogs: [],
  };
};
