import React, { useState, useEffect } from 'react';
import {
  Cable,
  Server,
  Zap,
  Globe,
  Key,
  Webhook,
  Code2,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Copy,
  ExternalLink,
  Send,
  Sliders,
  Terminal,
  Activity,
  Layers,
  Database,
  ArrowUpRight,
  Sparkles,
  Play,
  FileCode,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { SoftwareIntegrationConfig } from '../../types';
import {
  getStoredIntegrationConfig,
  saveStoredIntegrationConfig,
  testExternalSoftwareConnection,
  testInternalEndpoint,
  fetchSystemStatus,
  fetchIntegrationLogs,
} from '../../services/apiSyncService';

interface IntegrationsViewProps {
  notify: (title: string, message?: string, type?: 'success' | 'warning' | 'info') => void;
}

export const IntegrationsView: React.FC<IntegrationsViewProps> = ({ notify }) => {
  const { lang, t } = useLanguage();
  const [config, setConfig] = useState<SoftwareIntegrationConfig>(getStoredIntegrationConfig());
  const [activeTab, setActiveTab] = useState<'quick_connect' | 'api_explorer' | 'code_examples' | 'webhooks' | 'audit_logs'>('quick_connect');
  
  // External software test state
  const [targetSoftwareType, setTargetSoftwareType] = useState<'custom_api' | 'odoo' | 'quickbooks' | 'zapier' | 'fawry' | 'excel_sync'>(config.externalSoftwareType || 'custom_api');
  const [testUrl, setTestUrl] = useState(config.externalApiUrl || 'https://webhook.site/demo-wh-whitetable');
  const [testMethod, setTestMethod] = useState<'GET' | 'POST'>('GET');
  const [testAuthToken, setTestAuthToken] = useState(config.externalAuthToken || '');
  const [isTestingExternal, setIsTestingExternal] = useState(false);
  const [externalTestResult, setExternalTestResult] = useState<any>(null);

  // Internal endpoint tester state
  const [selectedEndpoint, setSelectedEndpoint] = useState('/api/orders');
  const [selectedMethod, setSelectedMethod] = useState<'GET' | 'POST'>('GET');
  const [customRequestBody, setCustomRequestBody] = useState(
    JSON.stringify(
      {
        label: 'External Online Order #849',
        customerName: 'Karim Mansour',
        items: [
          { itemId: 'item_1', name: 'Spanish Latte (Single)', qty: 2, unitPrice: 85, totalPrice: 170 },
          { itemId: 'item_3', name: 'Salted Caramel Brownie', qty: 1, unitPrice: 75, totalPrice: 75 },
        ],
        subtotal: 245,
        total: 245,
        paymentMethod: 'InstaPay / Wallet',
      },
      null,
      2
    )
  );
  const [isTestingInternal, setIsTestingInternal] = useState(false);
  const [internalTestResponse, setInternalTestResponse] = useState<any>(null);

  // Code snippets language state
  const [codeLang, setCodeLang] = useState<'curl' | 'javascript' | 'python' | 'php' | 'csharp'>('javascript');
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedSnippet, setCopiedSnippet] = useState(false);

  // Real-time server status & logs
  const [systemStats, setSystemStats] = useState<any>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [isRefreshingStats, setIsRefreshingStats] = useState(false);

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://ais-dev-whitetable.run.app';

  const loadData = async () => {
    setIsRefreshingStats(true);
    const stats = await fetchSystemStatus();
    setSystemStats(stats);
    const logsData = await fetchIntegrationLogs();
    if (logsData.webhookLogs) {
      setLogs([...logsData.webhookLogs, ...(logsData.apiAuditLogs || [])]);
    }
    setIsRefreshingStats(false);
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleSaveConfig = () => {
    const updated = {
      ...config,
      externalSoftwareType: targetSoftwareType,
      externalApiUrl: testUrl,
      externalAuthToken: testAuthToken,
      lastSyncTimestamp: Date.now(),
    };
    setConfig(updated);
    saveStoredIntegrationConfig(updated);
    notify(
      lang === 'ar' ? 'تم حفظ إعدادات الربط' : 'Integration Settings Saved',
      lang === 'ar' ? 'تم تحديث مفاتيح الـ API وإعدادات المزامنة بنجاح.' : 'API tokens and webhook preferences updated.',
      'success'
    );
  };

  const handleRunExternalTest = async () => {
    if (!testUrl || !testUrl.startsWith('http')) {
      notify(
        lang === 'ar' ? 'رابط غير صالح' : 'Invalid URL',
        lang === 'ar' ? 'يرجى إدخال رابط يبدأ بـ http:// أو https://' : 'Please provide a valid HTTP/HTTPS endpoint URL.',
        'warning'
      );
      return;
    }

    setIsTestingExternal(true);
    setExternalTestResult(null);

    const headers: Record<string, string> = {};
    if (testAuthToken.trim()) {
      headers['Authorization'] = testAuthToken.startsWith('Bearer ') ? testAuthToken : `Bearer ${testAuthToken}`;
    }

    const res = await testExternalSoftwareConnection(testUrl, testMethod, headers, {
      testMessage: 'White Table POS Handshake Ping',
      source: 'White Table POS & Coworking Hub',
    });

    setIsTestingExternal(false);
    setExternalTestResult(res);

    if (res.success) {
      notify(
        lang === 'ar' ? 'نجح الاتصال بالبرنامج' : 'Software Connected Successfully',
        res.message || `HTTP ${res.status} OK in ${res.latencyMs}ms`,
        'success'
      );
    } else {
      notify(
        lang === 'ar' ? 'فشل الاتصال بالبرنامج' : 'Connection Failed',
        res.error || res.message,
        'warning'
      );
    }
  };

  const handleRunInternalEndpointTest = async () => {
    setIsTestingInternal(true);
    let parsedBody: any = undefined;
    if (selectedMethod === 'POST') {
      try {
        parsedBody = JSON.parse(customRequestBody);
      } catch (err) {
        notify(
          lang === 'ar' ? 'خطأ في صيغة JSON' : 'Invalid JSON Body',
          'Please ensure request body is valid JSON format.',
          'warning'
        );
        setIsTestingInternal(false);
        return;
      }
    }

    const res = await testInternalEndpoint(selectedEndpoint, selectedMethod, config.apiKey, parsedBody);
    setIsTestingInternal(false);
    setInternalTestResponse(res);

    if (res.success) {
      notify(
        lang === 'ar' ? 'تم استدعاء الـ API بنجاح' : 'API Request Succeeded',
        `${selectedMethod} ${selectedEndpoint} (${res.statusCode}) in ${res.latencyMs}ms`,
        'success'
      );
    } else {
      notify(
        lang === 'ar' ? 'استجابة الـ API' : 'API Response',
        `Returned HTTP ${res.statusCode}`,
        'info'
      );
    }
  };

  const handleCopy = (text: string, type: 'key' | 'url' | 'snippet') => {
    navigator.clipboard.writeText(text);
    if (type === 'key') {
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
    } else if (type === 'url') {
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    } else {
      setCopiedSnippet(true);
      setTimeout(() => setCopiedSnippet(false), 2000);
    }
    notify(
      lang === 'ar' ? 'تم النسخ إلى الحافظة' : 'Copied to Clipboard',
      lang === 'ar' ? 'النص جاهز للصق في برنامجك الخارجي.' : 'Ready to paste into your external application.',
      'info'
    );
  };

  const getCodeSnippet = () => {
    const apiEndpoint = `${baseUrl}/api/orders`;
    const token = config.apiKey;

    if (codeLang === 'curl') {
      return `# 1. Fetch Orders from White Table POS
curl -X GET "${apiEndpoint}" \\
  -H "Authorization: Bearer ${token}" \\
  -H "Content-Type: application/json"

# 2. Push New Order to White Table POS from your software
curl -X POST "${apiEndpoint}" \\
  -H "Authorization: Bearer ${token}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "label": "Online Web Order #1042",
    "customerName": "Ahmed Hassan",
    "items": [
      { "itemId": "item_1", "name": "V60 Drip Coffee", "qty": 1, "unitPrice": 95, "totalPrice": 95 }
    ],
    "subtotal": 95,
    "total": 95,
    "paymentMethod": "InstaPay / Wallet"
  }'`;
    }

    if (codeLang === 'javascript') {
      return `// JavaScript / Node.js Integration Example
async function sendOrderToWhiteTable() {
  const response = await fetch('${baseUrl}/api/orders', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ${token}',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      label: 'Website Order #1042',
      customerName: 'Nour El-Din',
      items: [
        { itemId: 'item_1', name: 'Cold Brew Coffee', qty: 2, unitPrice: 90, totalPrice: 180 }
      ],
      total: 180,
      paymentMethod: 'Credit Card'
    })
  });

  const data = await response.json();
  console.log('Order registered in White Table POS:', data);
}

// Fetch Inventory Stock Levels
async function getLiveStock() {
  const res = await fetch('${baseUrl}/api/inventory', {
    headers: { 'Authorization': 'Bearer ${token}' }
  });
  const { data } = await res.json();
  console.log('Current Inventory:', data);
}`;
    }

    if (codeLang === 'python') {
      return `# Python Integration Example
import requests

API_URL = "${baseUrl}/api"
API_KEY = "${token}"

headers = {
    "Authorization": f"Bearer {API_KEY}",
    "Content-Type": "application/json"
}

# 1. Fetch live menu items
menu_response = requests.get(f"{API_URL}/menu", headers=headers)
print("Menu Items:", menu_response.json())

# 2. Sync / Post an order from your ERP or Website
order_payload = {
    "label": "ERP Sync Order #991",
    "customerName": "Laila Mahmoud",
    "items": [
        {"name": "Flat White (Double)", "qty": 1, "unitPrice": 85, "totalPrice": 85}
    ],
    "total": 85,
    "paymentMethod": "Cash"
}

order_response = requests.post(f"{API_URL}/orders", json=order_payload, headers=headers)
print("Order synced:", order_response.status_code, order_response.json())`;
    }

    if (codeLang === 'php') {
      return `<?php
// PHP Integration Example (cURL)
$apiKey = "${token}";
$apiUrl = "${baseUrl}/api/orders";

$ch = curl_init($apiUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    "Authorization: Bearer " . $apiKey,
    "Content-Type: application/json"
]);

// Fetch recent sales orders
$response = curl_exec($ch);
curl_close($ch);

$orders = json_decode($response, true);
print_r($orders);
?>`;
    }

    return `// C# / .NET HttpClient Integration Example
using System;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Threading.Tasks;

public class WhiteTableSync
{
    private static readonly HttpClient client = new HttpClient();

    public static async Task SyncOrderAsync()
    {
        client.DefaultRequestHeaders.Authorization = 
            new AuthenticationHeaderValue("Bearer", "${token}");

        string jsonPayload = @"{
            ""label"": ""C# Desktop App Order"",
            ""customerName"": ""Tarek Zaki"",
            ""items"": [{ ""name"": ""Iced Americano"", ""qty"": 1, ""unitPrice"": 75, ""totalPrice"": 75 }],
            ""total"": 75,
            ""paymentMethod"": ""Cash""
        }";

        var content = new StringContent(jsonPayload, Encoding.UTF8, "application/json");
        var response = await client.PostAsync("${baseUrl}/api/orders", content);
        string result = await response.Content.ReadAsStringAsync();
        Console.WriteLine(result);
    }
}`;
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto text-zinc-900 pb-16">
      {/* Top Banner & Active Server Status */}
      <div className="p-6 rounded-3xl bg-zinc-950 text-white shadow-xl border border-zinc-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Cable size={220} />
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="p-2.5 rounded-2xl bg-emerald-600/30 text-emerald-400 border border-emerald-500/40 inline-flex items-center justify-center">
                <Cable size={22} />
              </span>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white uppercase font-sans">
                {t.integrationsTitle}
              </h1>
              <span className="px-3 py-1 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 text-[11px] font-mono font-bold flex items-center gap-1.5 shadow-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                REST API v2.5 ACTIVE
              </span>
            </div>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-3xl leading-relaxed">
              {t.integrationsSubtitle}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={loadData}
              disabled={isRefreshingStats}
              className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs font-bold text-zinc-200 transition flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <RefreshCw size={14} className={isRefreshingStats ? 'animate-spin text-emerald-400' : 'text-zinc-400'} />
              <span>{lang === 'ar' ? 'تحديث الحالة' : 'Refresh Metrics'}</span>
            </button>

            <button
              type="button"
              onClick={handleSaveConfig}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black transition flex items-center gap-2 cursor-pointer shadow-lg shadow-emerald-950/40"
            >
              <CheckCircle2 size={16} />
              <span>{lang === 'ar' ? 'حفظ إعدادات الربط' : 'Save Connection'}</span>
            </button>
          </div>
        </div>

        {/* Live URL & Key Bar */}
        <div className="mt-6 pt-5 border-t border-zinc-800/80 grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="p-3.5 rounded-2xl bg-zinc-900/90 border border-zinc-800 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider block">
                {lang === 'ar' ? 'رابط الـ API الأساسي (Base URL)' : 'Base REST API Endpoint'}
              </span>
              <div className="font-mono text-xs text-emerald-400 font-bold truncate mt-0.5">
                {baseUrl}/api
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleCopy(`${baseUrl}/api`, 'url')}
              className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shrink-0"
            >
              {copiedUrl ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
              <span>{copiedUrl ? (lang === 'ar' ? 'تم النسخ' : 'Copied') : (lang === 'ar' ? 'نسخ الرابط' : 'Copy URL')}</span>
            </button>
          </div>

          <div className="p-3.5 rounded-2xl bg-zinc-900/90 border border-zinc-800 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider block">
                {t.apiKeyLabel}
              </span>
              <div className="font-mono text-xs text-amber-300 font-bold truncate mt-0.5">
                {config.apiKey.slice(0, 10)}••••••••••••••••{config.apiKey.slice(-4)}
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleCopy(config.apiKey, 'key')}
              className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shrink-0"
            >
              {copiedKey ? <Check size={13} className="text-emerald-400" /> : <Key size={13} />}
              <span>{copiedKey ? (lang === 'ar' ? 'تم النسخ' : 'Copied') : (lang === 'ar' ? 'نسخ المفتاح' : 'Copy Key')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-zinc-200 overflow-x-auto pb-2">
        {[
          { id: 'quick_connect' as const, label: lang === 'ar' ? 'الاتصال ببرنامجي (Connect My Software)' : 'Connect My Software', icon: Cable },
          { id: 'api_explorer' as const, label: lang === 'ar' ? 'مستكشف الـ API المباشر' : 'Live API Explorer', icon: Terminal },
          { id: 'code_examples' as const, label: lang === 'ar' ? 'أكواد الربط الجاهزة' : 'Code Snippets', icon: Code2 },
          { id: 'webhooks' as const, label: lang === 'ar' ? 'الويب هوك والإشعارات' : 'Webhooks & Events', icon: Webhook },
          { id: 'audit_logs' as const, label: lang === 'ar' ? 'سجل الطلبات المتزامنة' : 'Sync Audit Logs', icon: Activity },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs transition flex items-center gap-2 cursor-pointer shrink-0 ${
                isActive
                  ? 'bg-zinc-950 text-white shadow-md'
                  : 'bg-white text-zinc-600 hover:bg-zinc-100 border border-zinc-200'
              }`}
            >
              <Icon size={15} className={isActive ? 'text-emerald-400' : 'text-zinc-500'} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: QUICK CONNECT TO MY SOFTWARE */}
      {activeTab === 'quick_connect' && (
        <div className="space-y-6">
          {/* Software Type Selector */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { id: 'custom_api' as const, name: 'Custom App / API', desc: 'Node, Python, PHP, C#', icon: Globe },
              { id: 'odoo' as const, name: 'Odoo / ERPNext', desc: 'Stock & Invoices', icon: Layers },
              { id: 'quickbooks' as const, name: 'QuickBooks / Xero', desc: 'Accounting Sync', icon: Database },
              { id: 'zapier' as const, name: 'Zapier / Make', desc: 'No-Code Automation', icon: Zap },
              { id: 'fawry' as const, name: 'InstaPay / Fawry', desc: 'Payment Gateway', icon: ShieldCheck },
              { id: 'excel_sync' as const, name: 'Excel / Sheets', desc: 'Live CSV/JSON Feed', icon: FileCode },
            ].map((soft) => {
              const isSelected = targetSoftwareType === soft.id;
              const Icon = soft.icon;
              return (
                <button
                  key={soft.id}
                  type="button"
                  onClick={() => setTargetSoftwareType(soft.id)}
                  className={`p-3.5 rounded-2xl border text-start transition cursor-pointer ${
                    isSelected
                      ? 'border-emerald-600 bg-emerald-50 text-zinc-950 ring-2 ring-emerald-500/20 shadow-sm'
                      : 'border-zinc-200 bg-white hover:border-zinc-300 text-zinc-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <Icon size={20} className={isSelected ? 'text-emerald-600' : 'text-zinc-500'} />
                    {isSelected && <CheckCircle2 size={16} className="text-emerald-600" />}
                  </div>
                  <div className="font-bold text-xs">{soft.name}</div>
                  <div className="text-[10px] text-zinc-500 mt-0.5">{soft.desc}</div>
                </button>
              );
            })}
          </div>

          {/* Connection Test Box */}
          <div className="p-6 rounded-3xl bg-white border border-zinc-200 shadow-sm space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-zinc-950">
                  {lang === 'ar' ? 'اختبار الاتصال ببرنامجك الخارجي (Ping Test)' : 'Test Connection to Your Software'}
                </h3>
                <p className="text-xs text-zinc-500 mt-0.5">
                  {lang === 'ar'
                    ? 'أدخل رابط الـ API أو الويب هوك الخاص ببرنامجك وسيقوم النظام بإرسال اختبار اتصال فوري للتحقق من الاستجابة.'
                    : 'Enter your external software API URL or webhook to send a live test payload and inspect response.'}
                </p>
              </div>
              <span className="px-3 py-1 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200 font-bold text-xs">
                Bi-Directional Ping
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div className="md:col-span-1">
                <label className="text-xs font-bold text-zinc-700 block mb-1">HTTP Method</label>
                <select
                  value={testMethod}
                  onChange={(e) => setTestMethod(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 bg-zinc-50 text-xs font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-hidden cursor-pointer"
                >
                  <option value="GET">GET (Ping Query)</option>
                  <option value="POST">POST (Test Payload)</option>
                </select>
              </div>

              <div className="md:col-span-3">
                <label className="text-xs font-bold text-zinc-700 block mb-1">
                  {lang === 'ar' ? 'رابط الـ Endpoint لبرنامجك' : 'Your Software Endpoint URL'}
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={testUrl}
                    onChange={(e) => setTestUrl(e.target.value)}
                    placeholder="https://my-erp.com/api/v1/pos-sync or https://webhook.site/..."
                    className="flex-1 px-3.5 py-2.5 rounded-xl border border-zinc-300 text-xs font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                  <button
                    type="button"
                    disabled={isTestingExternal}
                    onClick={handleRunExternalTest}
                    className="px-5 py-2.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-black transition flex items-center gap-2 shrink-0 cursor-pointer shadow-sm"
                  >
                    {isTestingExternal ? <RefreshCw size={14} className="animate-spin text-emerald-400" /> : <Play size={14} className="text-emerald-400" />}
                    <span>{lang === 'ar' ? 'اختبار الاتصال الآن' : 'Test Ping'}</span>
                  </button>
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-700 block mb-1">
                {lang === 'ar' ? 'رمز المصادقة / توكن برنامجك (Optional Auth Token / Bearer)' : 'Optional Authorization Header / API Key for your software'}
              </label>
              <input
                type="text"
                value={testAuthToken}
                onChange={(e) => setTestAuthToken(e.target.value)}
                placeholder="Bearer eyJhbGciOi... or API_KEY_HERE"
                className="w-full px-3.5 py-2 rounded-xl border border-zinc-300 text-xs font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>

            {/* Test Results Inspector */}
            {externalTestResult && (
              <div
                className={`p-4 rounded-2xl border ${
                  externalTestResult.success
                    ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950'
                    : 'bg-rose-50/70 border-rose-300 text-rose-950'
                } space-y-3 animate-in fade-in duration-150`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-xs">
                    {externalTestResult.success ? (
                      <CheckCircle2 size={16} className="text-emerald-600" />
                    ) : (
                      <AlertCircle size={16} className="text-rose-600" />
                    )}
                    <span>{externalTestResult.message}</span>
                  </div>
                  {externalTestResult.latencyMs !== undefined && (
                    <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded-md bg-white/80 border border-zinc-200">
                      {externalTestResult.latencyMs} ms
                    </span>
                  )}
                </div>

                {externalTestResult.responsePreview && (
                  <div className="p-3 rounded-xl bg-zinc-950 text-zinc-100 font-mono text-[11px] overflow-x-auto max-h-48">
                    <pre>{typeof externalTestResult.responsePreview === 'object' ? JSON.stringify(externalTestResult.responsePreview, null, 2) : String(externalTestResult.responsePreview)}</pre>
                  </div>
                )}

                {externalTestResult.troubleshooting && (
                  <div className="text-xs space-y-1 text-zinc-700">
                    <span className="font-bold block">Troubleshooting steps:</span>
                    <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                      {externalTestResult.troubleshooting.map((step: string, i: number) => (
                        <li key={i}>{step}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Quick Integration Guidance Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-white border border-zinc-200 shadow-xs space-y-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                1
              </div>
              <h4 className="font-bold text-xs text-zinc-950">
                {lang === 'ar' ? 'استيراد المنيو والأسعار' : '1. Pull Menu & Pricing'}
              </h4>
              <p className="text-[11px] text-zinc-500 leading-relaxed">
                {lang === 'ar'
                  ? 'برنامجك يمكنه استدعاء GET /api/menu لجلب قائمة المشروبات والمأكولات بالأسعار الحالية.'
                  : 'Your website or mobile app can call GET /api/menu to fetch drinks, food, and categories in real-time.'}
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-zinc-200 shadow-xs space-y-2">
              <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold">
                2
              </div>
              <h4 className="font-bold text-xs text-zinc-950">
                {lang === 'ar' ? 'إرسال الطلبات تلقائياً' : '2. Push Orders & KOT'}
              </h4>
              <p className="text-[11px] text-zinc-500 leading-relaxed">
                {lang === 'ar'
                  ? 'أي طلب يتم في برنامجك يُرسل بـ POST /api/orders ليظهر فوراً في الكاشير وتذكرة المطبخ KOT.'
                  : 'Orders placed on your app are posted to POST /api/orders, auto-creating receipts and printing to kitchen chefs.'}
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-zinc-200 shadow-xs space-y-2">
              <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center font-bold">
                3
              </div>
              <h4 className="font-bold text-xs text-zinc-950">
                {lang === 'ar' ? 'مزامنة المخزون والحسابات' : '3. Sync Stock & Invoices'}
              </h4>
              <p className="text-[11px] text-zinc-500 leading-relaxed">
                {lang === 'ar'
                  ? 'ربط تلقائي مع Odoo و QuickBooks لمزامنة أرصدة المستودع وقيود اليومية المحاسبية.'
                  : 'Two-way synchronization for stock levels via POST /api/inventory/update and accounting ledger via /api/invoices.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: LIVE REST API EXPLORER */}
      {activeTab === 'api_explorer' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-white border border-zinc-200 shadow-sm space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-zinc-950">
                  {lang === 'ar' ? 'المستكشف التفاعلي للـ API' : 'Interactive REST API Explorer'}
                </h3>
                <p className="text-xs text-zinc-500 mt-0.5">
                  {lang === 'ar'
                    ? 'اختبر جميع مسارات الـ API مباشرة واستعرض نتائج الـ JSON والبيانات الحية.'
                    : 'Execute live queries against your White Table Hub endpoints with authenticated headers.'}
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-600 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200">
                Live Data Sandbox
              </span>
            </div>

            {/* Quick Endpoint Preset Buttons */}
            <div className="flex flex-wrap gap-2">
              {[
                { label: 'GET /api/menu', path: '/api/menu', method: 'GET' as const },
                { label: 'GET /api/orders', path: '/api/orders', method: 'GET' as const },
                { label: 'POST /api/orders', path: '/api/orders', method: 'POST' as const },
                { label: 'GET /api/inventory', path: '/api/inventory', method: 'GET' as const },
                { label: 'GET /api/customers', path: '/api/customers', method: 'GET' as const },
                { label: 'GET /api/coworking/desks', path: '/api/coworking/desks', method: 'GET' as const },
                { label: 'GET /api/kitchen-tickets', path: '/api/kitchen-tickets', method: 'GET' as const },
                { label: 'GET /api/invoices', path: '/api/invoices', method: 'GET' as const },
              ].map((ep) => (
                <button
                  key={`${ep.method}-${ep.path}`}
                  type="button"
                  onClick={() => {
                    setSelectedEndpoint(ep.path);
                    setSelectedMethod(ep.method);
                  }}
                  className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold transition cursor-pointer ${
                    selectedEndpoint === ep.path && selectedMethod === ep.method
                      ? 'bg-zinc-950 text-emerald-400 shadow-sm'
                      : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700'
                  }`}
                >
                  <span className={ep.method === 'GET' ? 'text-blue-500' : 'text-emerald-500'}>{ep.method}</span> {ep.path}
                </button>
              ))}
            </div>

            {/* URL bar & Send Button */}
            <div className="flex gap-2">
              <span className="px-3.5 py-2.5 rounded-xl bg-zinc-900 text-emerald-400 font-mono font-bold text-xs flex items-center">
                {selectedMethod}
              </span>
              <input
                type="text"
                value={selectedEndpoint}
                onChange={(e) => setSelectedEndpoint(e.target.value)}
                className="flex-1 px-3.5 py-2.5 rounded-xl border border-zinc-300 font-mono text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
              <button
                type="button"
                disabled={isTestingInternal}
                onClick={handleRunInternalEndpointTest}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs transition flex items-center gap-2 cursor-pointer shadow-sm shrink-0"
              >
                {isTestingInternal ? <RefreshCw size={14} className="animate-spin" /> : <Send size={14} />}
                <span>{lang === 'ar' ? 'إرسال الطلب' : 'Send Request'}</span>
              </button>
            </div>

            {/* POST Request Body Editor */}
            {selectedMethod === 'POST' && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-700 block">JSON Request Body Payload</label>
                <textarea
                  rows={6}
                  value={customRequestBody}
                  onChange={(e) => setCustomRequestBody(e.target.value)}
                  className="w-full p-3.5 rounded-2xl bg-zinc-950 text-emerald-400 font-mono text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden border border-zinc-800"
                />
              </div>
            )}

            {/* Response Output Viewer */}
            {internalTestResponse && (
              <div className="space-y-2 pt-2 border-t border-zinc-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-zinc-700">Response Payload</span>
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md ${
                        internalTestResponse.statusCode >= 200 && internalTestResponse.statusCode < 300
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-rose-100 text-rose-800 border border-rose-300'
                      }`}
                    >
                      HTTP {internalTestResponse.statusCode}
                    </span>
                    <span className="text-[10px] font-mono text-zinc-400">{internalTestResponse.latencyMs}ms</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleCopy(JSON.stringify(internalTestResponse.data, null, 2), 'snippet')}
                    className="text-xs text-zinc-500 hover:text-zinc-900 font-medium flex items-center gap-1 cursor-pointer"
                  >
                    <Copy size={12} />
                    <span>Copy JSON</span>
                  </button>
                </div>

                <div className="p-4 rounded-2xl bg-zinc-950 text-zinc-100 font-mono text-xs max-h-80 overflow-y-auto border border-zinc-800">
                  <pre>{JSON.stringify(internalTestResponse.data, null, 2)}</pre>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: CODE SNIPPETS (Python, cURL, JS, PHP, C#) */}
      {activeTab === 'code_examples' && (
        <div className="p-6 rounded-3xl bg-zinc-950 text-white border border-zinc-800 shadow-xl space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Code2 size={18} className="text-emerald-400" />
                <span>{t.codeSnippets}</span>
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                {lang === 'ar'
                  ? 'أكواد برمجية جاهزة للنسخ المباشر في برنامجك الخارجي أو موقعك أو تطبيقك.'
                  : 'Ready-to-use boilerplate scripts with your live host URL and API key pre-filled.'}
              </p>
            </div>

            <div className="flex items-center gap-2">
              {(['javascript', 'python', 'curl', 'php', 'csharp'] as const).map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setCodeLang(l)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase transition cursor-pointer ${
                    codeLang === l
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-zinc-900 text-zinc-400 hover:text-white'
                  }`}
                >
                  {l === 'csharp' ? 'C# (.NET)' : l}
                </button>
              ))}
            </div>
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => handleCopy(getCodeSnippet(), 'snippet')}
              className="absolute top-3 right-3 px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer border border-zinc-700 shadow-md z-10"
            >
              {copiedSnippet ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
              <span>{copiedSnippet ? (lang === 'ar' ? 'تم النسخ!' : 'Copied!') : (lang === 'ar' ? 'نسخ الكود' : 'Copy Code')}</span>
            </button>

            <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 font-mono text-xs text-emerald-300 overflow-x-auto leading-relaxed max-h-[500px]">
              <pre>{getCodeSnippet()}</pre>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: WEBHOOKS & REAL-TIME EVENT STREAM */}
      {activeTab === 'webhooks' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-white border border-zinc-200 shadow-sm space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-zinc-950">
                  {lang === 'ar' ? 'إعدادات الويب هوك والإشعارات الفورية' : 'Outgoing Webhooks & Event Triggers'}
                </h3>
                <p className="text-xs text-zinc-500 mt-0.5">
                  {lang === 'ar'
                    ? 'أرسل تنبيهات فورية لبرنامجك عند تسجيل طلب جديد، إنهاء حجز طاولة، أو دفع فاتورة.'
                    : 'White Table dispatches instant HTTP POST payloads to your software whenever POS events happen.'}
                </p>
              </div>
              <Webhook size={22} className="text-emerald-600" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-zinc-700 block mb-1">
                  {t.webhookUrlLabel}
                </label>
                <input
                  type="url"
                  value={config.webhookUrl}
                  onChange={(e) => setConfig({ ...config, webhookUrl: e.target.value })}
                  placeholder="https://my-backend.com/webhooks/whitetable"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 text-xs font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-700 block mb-1">
                  Webhook Signature Secret (HMAC SHA-256)
                </label>
                <input
                  type="text"
                  value={config.webhookSecret}
                  onChange={(e) => setConfig({ ...config, webhookSecret: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 text-xs font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>
            </div>

            {/* Event Triggers Checkbox Matrix */}
            <div className="space-y-2 pt-3 border-t border-zinc-100">
              <span className="text-xs font-bold text-zinc-800 block">Subscribed Event Triggers</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                  { id: 'order.created', label: 'order.created (New Sales Order)', active: config.autoSyncOrders },
                  { id: 'invoice.paid', label: 'invoice.paid (Revenue & Tax)', active: config.autoSyncInvoices },
                  { id: 'inventory.low', label: 'inventory.low_stock (Reorder Alert)', active: config.autoSyncInventory },
                  { id: 'coworking.session', label: 'coworking.session_closed (Table Checkout)', active: true },
                ].map((ev) => (
                  <div key={ev.id} className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 flex items-center justify-between">
                    <span className="text-xs font-mono font-medium text-zinc-800">{ev.label}</span>
                    <input
                      type="checkbox"
                      defaultChecked={ev.active}
                      className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 cursor-pointer"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Incoming Webhook Endpoint */}
            <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200 space-y-1">
              <span className="text-xs font-bold text-indigo-950 block">
                {lang === 'ar' ? 'رابط استقبال الويب هوك من برنامجك إلى وايت تيبل (Incoming Webhook)' : 'Incoming Webhook Endpoint for your software:'}
              </span>
              <div className="font-mono text-xs text-indigo-700 font-bold">
                POST {baseUrl}/api/webhooks/incoming
              </div>
              <p className="text-[11px] text-indigo-900/80">
                Your ERP or payment gateway can post event notifications here.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: SYNC AUDIT LOGS */}
      {activeTab === 'audit_logs' && (
        <div className="p-6 rounded-3xl bg-white border border-zinc-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-zinc-950">
                {lang === 'ar' ? 'سجل طلبات الربط والمزامنة الحية' : 'Live Sync & API Audit Logs'}
              </h3>
              <p className="text-xs text-zinc-500 mt-0.5">
                Real-time stream of incoming REST requests and outgoing webhook transmissions.
              </p>
            </div>
            <button
              type="button"
              onClick={loadData}
              className="p-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw size={13} className={isRefreshingStats ? 'animate-spin' : ''} />
              <span>Refresh</span>
            </button>
          </div>

          <div className="space-y-2">
            {logs.length === 0 ? (
              <div className="p-8 text-center text-zinc-400 text-xs font-mono">
                No external API requests logged yet. Trigger an endpoint in the API Explorer to view logs.
              </div>
            ) : (
              logs.map((log: any, idx: number) => (
                <div
                  key={log.id || idx}
                  className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                        (log.statusCode || log.status) < 300
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      HTTP {log.statusCode || log.status || 200}
                    </span>
                    <span className="font-bold text-zinc-900">{log.method || log.event || 'REST_CALL'}</span>
                    <span className="text-zinc-500 truncate max-w-xs sm:max-w-md">{log.path || log.source || '/api'}</span>
                  </div>
                  <span className="text-[10px] text-zinc-400 shrink-0">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
