import React, { useState, useEffect } from 'react';
import {
  X,
  Printer,
  Sliders,
  CheckCircle2,
  RefreshCw,
  Tv,
  Usb,
  Bluetooth,
  Network,
  DollarSign,
  ScanLine,
  Scissors,
  Volume2,
  FileText,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Layers,
  AlertCircle,
  HelpCircle,
  Laptop,
} from 'lucide-react';
import {
  CashierHardwareSettings,
  getHardwareSettings,
  saveHardwareSettings,
  connectSerialPrinter,
  connectBluetoothPrinter,
  kickCashDrawer,
  sendRawBytesToHardware,
  applyZywellPreset,
  buildZywellSelfTestSlip,
  testZywellCutter,
  testZywellFeed,
  testZywellBuzzer,
  ZYWELL_80_SPECS,
  PrinterConnectionType,
} from '../../services/hardwareService';
import {
  printDirectHtml,
  buildZywellTestHtml,
} from '../../services/thermalPrintEngine';
import { useLanguage } from '../../i18n/LanguageContext';

interface CashierHardwareModalProps {
  isOpen?: boolean;
  onClose: () => void;
  notify: (titleOrMsg: string, messageOrType?: any, type?: any) => void;
}

export const CashierHardwareModal: React.FC<CashierHardwareModalProps> = ({
  isOpen = true,
  onClose,
  notify,
}) => {
  const { t, lang, isRTL } = useLanguage();
  const [settings, setSettings] = useState<CashierHardwareSettings>(getHardwareSettings());
  const [isConnecting, setIsConnecting] = useState(false);
  const [testStatus, setTestStatus] = useState<string | null>(null);
  const [drawerKicking, setDrawerKicking] = useState(false);
  const [cutterTesting, setCutterTesting] = useState(false);
  const [buzzerTesting, setBuzzerTesting] = useState(false);
  const [feedTesting, setFeedTesting] = useState(false);
  const [showManualGuide, setShowManualGuide] = useState(false);
  const [activeTab, setActiveTab] = useState<'config' | 'guide'>('config');

  // Close modal on Escape key press
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const emitNotification = (
    titleOrMsg: string,
    messageOrType?: any,
    type?: 'success' | 'warning' | 'info' | 'error'
  ) => {
    if (type !== undefined) {
      notify(
        `${titleOrMsg}: ${messageOrType}`,
        type === 'warning' ? 'error' : (type as any)
      );
    } else if (
      messageOrType === 'success' ||
      messageOrType === 'error' ||
      messageOrType === 'info'
    ) {
      notify(titleOrMsg, messageOrType);
    } else if (messageOrType) {
      notify(`${titleOrMsg}: ${messageOrType}`, 'success');
    } else {
      notify(titleOrMsg);
    }
  };

  const handleSave = () => {
    saveHardwareSettings(settings);
    emitNotification(
      lang === 'ar' ? 'تم حفظ الإعدادات' : 'Hardware Settings Saved',
      lang === 'ar' ? 'تم تحديث خيارات طابعة زيويل 80 والدرج بنجاح.' : 'Zywell 80 hardware & drawer settings updated.',
      'success'
    );
    onClose();
  };

  // 1-Click Quick Connect Zywell 80
  const handleQuickConnectZywell = (preferredMode: PrinterConnectionType = 'system') => {
    const updated = applyZywellPreset(settings, preferredMode);
    setSettings(updated);
    setTestStatus(
      lang === 'ar'
        ? 'تم تفعيل طابعة زيويل 80 (GA-C80250I Plus) بنجاح!'
        : 'Zywell 80 (GA-C80250I Plus) profile activated!'
    );
    emitNotification(
      lang === 'ar' ? 'طابعة زيويل 80 متصلة' : 'Zywell 80 Connected',
      lang === 'ar'
        ? 'تم تفعيل الملف التعريفي لموديل GA-C80250I Plus بعرض 80 مم وقاطع آلي ودرج 24V.'
        : 'Zywell GA-C80250I Plus profile enabled (80mm, ESC/POS, Auto-cutter, 24V RJ11).',
      'success'
    );
  };

  // Connect Serial USB
  const handleConnectSerial = async () => {
    setIsConnecting(true);
    setTestStatus(lang === 'ar' ? 'جاري الاتصال بمنفذ USB...' : 'Requesting USB Serial device...');
    
    // Check if in iframe
    const isInIframe = window.self !== window.top;

    const res = await connectSerialPrinter(settings.serialBaudRate);
    setIsConnecting(false);
    if (res.success) {
      const updated: CashierHardwareSettings = {
        ...settings,
        printerType: 'serial',
        printerModel: 'zywell_80',
        paperWidth: 80,
        connectedDeviceName: `Zywell GA-C80250I Plus (USB: ${res.name})`,
        isZywellConnected: true,
      };
      setSettings(updated);
      saveHardwareSettings(updated);
      emitNotification(
        lang === 'ar' ? 'تم توصيل طابعة USB زيويل' : 'Zywell USB Connected',
        res.name || 'Serial thermal printer active',
        'success'
      );
      setTestStatus(`Connected: ${res.name}`);
    } else {
      // In sandbox/iframe, suggest system print driver or top-level window
      const errMsg = isInIframe
        ? lang === 'ar'
          ? 'تنبيه: منافذ WebSerial المباشرة تتطلب فتح النافذة كاملة، أو يمكنك تفعيل خيار (تعريف ويندوز / طباعة النظام) الذي يعمل بكفاءة 100% دون قيود المتصفح.'
          : 'Notice: Direct WebSerial requires a top-level window. You can also use the "Windows Driver / System Spooler" mode which works seamlessly without browser permission blocks.'
        : res.error || 'Could not connect to serial port';

      emitNotification(
        lang === 'ar' ? 'تنبيه الاتصال المباشر' : 'Connection Notice',
        errMsg,
        'warning'
      );
      setTestStatus(res.error || 'Please use Windows Driver mode or top-level tab');
    }
  };

  // Connect Bluetooth
  const handleConnectBluetooth = async () => {
    setIsConnecting(true);
    setTestStatus(lang === 'ar' ? 'جاري البحث عن أجهزة بلوتوث...' : 'Searching Bluetooth ESC/POS printers...');
    const res = await connectBluetoothPrinter();
    setIsConnecting(false);
    if (res.success) {
      const updated: CashierHardwareSettings = {
        ...settings,
        printerType: 'bluetooth',
        printerModel: 'zywell_80',
        paperWidth: 80,
        connectedDeviceName: `Zywell GA-C80250I Plus (BT: ${res.name})`,
        isZywellConnected: true,
      };
      setSettings(updated);
      saveHardwareSettings(updated);
      emitNotification(
        lang === 'ar' ? 'تم اقتران طابعة زيويل اللاسلكية' : 'Zywell Bluetooth Paired',
        res.name || 'Wireless printer linked',
        'success'
      );
      setTestStatus(`Paired: ${res.name}`);
    } else {
      emitNotification(
        lang === 'ar' ? 'فشل الاقتران' : 'Pairing Failed',
        res.error || 'Bluetooth device not found',
        'warning'
      );
      setTestStatus(res.error || 'Failed');
    }
  };

  // Connect Network LAN
  const handleConnectNetwork = () => {
    const updated: CashierHardwareSettings = {
      ...settings,
      printerType: 'network',
      printerModel: 'zywell_80',
      paperWidth: 80,
      connectedDeviceName: `Zywell GA-C80250I Plus (LAN: ${settings.networkIp})`,
      isZywellConnected: true,
    };
    setSettings(updated);
    saveHardwareSettings(updated);
    emitNotification(
      lang === 'ar' ? 'تم ضبط اتصال الشبكة' : 'Network LAN Configured',
      lang === 'ar'
        ? `تم تعيين طابعة زيويل على عنوان IP: ${settings.networkIp}`
        : `Zywell LAN endpoint set to ${settings.networkIp}`,
      'success'
    );
    setTestStatus(`Network LAN Configured: ${settings.networkIp}`);
  };

  // Set Windows Driver Mode
  const handleSetWindowsDriver = () => {
    const updated: CashierHardwareSettings = {
      ...settings,
      printerType: 'system',
      printerModel: 'zywell_80',
      paperWidth: 80,
      connectedDeviceName: 'Zywell GA-C80250 Series Windows Driver',
      isZywellConnected: true,
    };
    setSettings(updated);
    saveHardwareSettings(updated);
    emitNotification(
      lang === 'ar' ? 'تم تفعيل تعريف زيويل 80' : 'Zywell 80 Driver Active',
      lang === 'ar'
        ? 'تم ضبط نظام الطباعة المباشر بعرض 80 مم لطابعة GA-C80250I Plus.'
        : 'Zywell 80mm driver profile active for Windows & Browser spooler.',
      'success'
    );
    setTestStatus('Windows GA-C80250 Driver Active (80mm Roll)');
  };

  // Send Test Print
  const handleTestPrint = async () => {
    setTestStatus(lang === 'ar' ? 'جاري إرسال إيصال الاختبار...' : 'Dispatching Zywell 80 test receipt...');
    try {
      if (settings.printerType === 'system') {
        const testHtml = buildZywellTestHtml(settings, { lang });
        await printDirectHtml(testHtml);
        setTestStatus(lang === 'ar' ? 'تم فتح نافذة طباعة زيويل 80' : 'Sent to Zywell 80 print spooler');
        emitNotification(
          lang === 'ar' ? 'طباعة تجريبية' : 'Test Print',
          lang === 'ar' ? 'تم إطلاق نافذة طباعة إيصال زيويل 80 مم' : 'Triggered Zywell 80mm thermal print dialog',
          'info'
        );
        return;
      }

      const bytes = buildZywellSelfTestSlip(settings);
      const res = await sendRawBytesToHardware(bytes, settings);
      if (res.success) {
        emitNotification(
          lang === 'ar' ? 'تمت طباعة إيصال زيويل بنجاح' : 'Zywell 80 Test Slip Printed',
          lang === 'ar' ? 'تم إرسال إيصال الاختبار والأوامر لطابعة زيويل 80.' : 'Test slip & barcode dispatched to Zywell 80.',
          'success'
        );
        setTestStatus('Zywell 80 test receipt printed.');
      } else {
        emitNotification(
          lang === 'ar' ? 'تنبيه الطباعة' : 'Print Fallback',
          res.message || 'Triggering print dialog fallback...',
          'info'
        );
        const testHtml = buildZywellTestHtml(settings, { lang });
        await printDirectHtml(testHtml);
      }
    } catch {
      const testHtml = buildZywellTestHtml(settings, { lang });
      await printDirectHtml(testHtml);
    }
  };

  // Test Cash Drawer
  const handleTestKickDrawer = async () => {
    setDrawerKicking(true);
    const res = await kickCashDrawer(settings);
    emitNotification(
      lang === 'ar' ? 'تم فتح درج النقود (RJ11)' : 'Cash Drawer Kicked (24V RJ11)',
      res.message,
      'success'
    );
    setTestStatus('RJ11 24V/1A pulse dispatched.');
    setTimeout(() => setDrawerKicking(false), 1200);
  };

  // Test Auto Cutter
  const handleTestCutter = async () => {
    setCutterTesting(true);
    const res = await testZywellCutter(settings);
    emitNotification(
      lang === 'ar' ? 'قاطع الورق الآلي' : 'Auto-Cutter Test',
      lang === 'ar' ? 'تم إرسال أمر القطع لطابعة زيويل (GS V 66 0)' : 'Cutter command transmitted to Zywell 80.',
      'success'
    );
    setTestStatus('Cutter command sent.');
    setTimeout(() => setCutterTesting(false), 1000);
  };

  // Test Paper Feed
  const handleTestFeed = async () => {
    setFeedTesting(true);
    await testZywellFeed(4, settings);
    emitNotification(
      lang === 'ar' ? 'تغذية الورق' : 'Feed Paper',
      lang === 'ar' ? 'تم تمرير 4 أسطر ورق حراري.' : 'Fed 4 lines on Zywell roll.',
      'info'
    );
    setTestStatus('Fed 4 lines.');
    setTimeout(() => setFeedTesting(false), 800);
  };

  // Test Buzzer
  const handleTestBuzzer = async () => {
    setBuzzerTesting(true);
    await testZywellBuzzer(settings);
    emitNotification(
      lang === 'ar' ? 'جرس التنبيه (Buzzer)' : 'Zywell Beeper Test',
      lang === 'ar' ? 'تم إرسال نغمة التنبيه للطابعة.' : 'Buzzer alert triggered.',
      'info'
    );
    setTestStatus('Buzzer beeper triggered.');
    setTimeout(() => setBuzzerTesting(false), 800);
  };

  // Open Secondary Customer Screen
  const handleOpenCustomerDisplay = () => {
    const width = 1024;
    const height = 768;
    const left = window.screen.width - width;
    const popup = window.open(
      `${window.location.origin}${window.location.pathname}?display=customer`,
      'WhiteTableCustomerDisplay',
      `width=${width},height=${height},left=${left},top=100,toolbar=no,location=no,status=no,menubar=no,scrollbars=no,resizable=yes`
    );
    if (popup) {
      emitNotification(
        lang === 'ar' ? 'تم فتح شاشة العميل' : 'Customer Screen Opened',
        lang === 'ar' ? 'تم إطلاق شاشة العميل التفاعلية بنجاح.' : 'Live customer-facing checkout display launched on secondary screen.',
        'success'
      );
    } else {
      emitNotification(
        lang === 'ar' ? 'تم حظر النوافذ المنبثقة' : 'Popup Blocked',
        lang === 'ar' ? 'يرجى السماح بالنوافذ المنبثقة لفتح شاشة العميل.' : 'Please allow popups to launch secondary customer screen.',
        'warning'
      );
    }
  };

  return (
    <div
      id="cashier-hardware-modal-backdrop"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div
        id="cashier-hardware-modal-container"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-3xl bg-white text-zinc-900 rounded-3xl shadow-2xl overflow-hidden border border-zinc-200 flex flex-col max-h-[92vh]"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-zinc-950 text-white border-b border-zinc-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-600 text-white shadow-md shrink-0">
              <Printer size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black tracking-tight font-sans">
                  {t.zywellModel}
                </h3>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-700 font-mono font-bold">
                  80mm · 250mm/s
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                {lang === 'ar'
                  ? 'إعدادات وربط طابعة الفواتير الحرارية زيويل ودرج النقود 24V RJ11'
                  : 'Zywell GA-C80250I Plus POS Hardware Integration & Cash Drawer Hub'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View Switcher Tabs */}
            <div className="flex p-1 bg-zinc-900 rounded-xl border border-zinc-800">
              <button
                type="button"
                onClick={() => setActiveTab('config')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                  activeTab === 'config'
                    ? 'bg-emerald-600 text-white'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {lang === 'ar' ? 'الإعدادات والربط' : 'Setup & Connect'}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('guide')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                  activeTab === 'guide'
                    ? 'bg-emerald-600 text-white'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <HelpCircle size={13} />
                <span>{lang === 'ar' ? 'دليل الجهاز' : 'User Manual'}</span>
              </button>
            </div>

            <button
              onClick={onClose}
              title={t.close}
              className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5 text-xs text-zinc-800">
          {activeTab === 'config' ? (
            <>
              {/* Top Featured Zywell 80 Hardware Card */}
              <div className="p-4 rounded-2xl bg-linear-to-r from-zinc-950 via-zinc-900 to-zinc-950 text-white border border-zinc-800 shadow-md relative overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-mono font-black uppercase">
                        {ZYWELL_80_SPECS.model}
                      </span>
                      <span className="text-xs text-zinc-300 font-semibold">
                        {ZYWELL_80_SPECS.brand} {ZYWELL_80_SPECS.series}
                      </span>
                    </div>

                    <h4 className="text-base font-black text-white tracking-tight">
                      {lang === 'ar'
                        ? 'طابعة زيويل 80 مم الحرارية التجارية'
                        : 'Zywell 80mm High-Speed Commercial POS Printer'}
                    </h4>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-zinc-300">
                      <span className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        80mm Roll (72mm width)
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        250mm/sec Speed
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        Auto-Cutter & RJ11 24V Drawer
                      </span>
                    </div>
                  </div>

                  {/* 1-Click Fast Connect Button */}
                  <div className="shrink-0 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    <button
                      type="button"
                      id="btn-quick-connect-zywell"
                      onClick={() => handleQuickConnectZywell(settings.printerType)}
                      className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs transition shadow-lg inline-flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                    >
                      <Sparkles size={15} className="text-emerald-200" />
                      <span>{lang === 'ar' ? 'تفعيل طابعة زيويل 80 فوراً' : '1-Click Connect Zywell 80'}</span>
                    </button>
                  </div>
                </div>

                {/* Connection Status Banner */}
                <div className="mt-3 pt-3 border-t border-zinc-800/80 flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-zinc-300 font-semibold">
                      {lang === 'ar' ? 'الحالة الحالية:' : 'Active Status:'}
                    </span>
                    <span className="font-mono text-emerald-300 font-bold">
                      {settings.connectedDeviceName || `${settings.printerType.toUpperCase()} - ${settings.paperWidth}mm`}
                    </span>
                  </div>
                  {testStatus && (
                    <span className="text-[10px] font-mono text-zinc-400 hidden sm:inline truncate max-w-xs">
                      {testStatus}
                    </span>
                  )}
                </div>
              </div>

              {/* Section 1: Connection Interface Selector */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black text-zinc-950 uppercase tracking-wider block">
                    1. {t.printerType}
                  </label>
                  <span className="text-[11px] text-zinc-500 font-medium">
                    {lang === 'ar' ? 'اختر طريقة توصيل طابعة زيويل بحاسوبك' : 'Choose how your Zywell 80 is attached'}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    {
                      id: 'system' as const,
                      name: lang === 'ar' ? 'تعريف ويندوز / النظام' : 'Windows GA-Driver',
                      sub: lang === 'ar' ? 'موصى به لجميع المتصفحات' : '100% Works Everywhere',
                      desc: 'GA-C80250 Series Spooler',
                      icon: Laptop,
                      recommended: true,
                    },
                    {
                      id: 'serial' as const,
                      name: lang === 'ar' ? 'كابل USB مباشر' : 'USB Cable (Serial)',
                      sub: 'WebSerial COM Port',
                      desc: 'Baud 9600 / 115200',
                      icon: Usb,
                    },
                    {
                      id: 'network' as const,
                      name: lang === 'ar' ? 'شبكة إيثرنت LAN' : 'Ethernet / LAN IP',
                      sub: 'Port 9100 TCP',
                      desc: 'Network POS Printer',
                      icon: Network,
                    },
                    {
                      id: 'bluetooth' as const,
                      name: lang === 'ar' ? 'بلوتوث لاسلكي' : 'Bluetooth Wireless',
                      sub: 'ESC/POS BLE',
                      desc: 'Mobile & Tablet POS',
                      icon: Bluetooth,
                    },
                  ].map((item) => {
                    const isSelected = settings.printerType === item.id;
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        id={`btn-select-interface-${item.id}`}
                        onClick={() => {
                          setSettings({ ...settings, printerType: item.id });
                          if (item.id === 'system') {
                            handleSetWindowsDriver();
                          }
                        }}
                        className={`p-3.5 rounded-2xl border text-start transition cursor-pointer flex flex-col justify-between relative ${
                          isSelected
                            ? 'border-emerald-600 bg-emerald-50/70 text-zinc-950 ring-2 ring-emerald-500/20 shadow-sm'
                            : 'border-zinc-200 bg-white hover:border-zinc-300 text-zinc-700 hover:bg-zinc-50'
                        }`}
                      >
                        {item.recommended && (
                          <span className="absolute -top-2 end-3 px-1.5 py-0.2 rounded-md bg-emerald-600 text-[9px] font-black text-white uppercase tracking-wider shadow-xs">
                            {lang === 'ar' ? 'الأسهل' : 'Best'}
                          </span>
                        )}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-emerald-600 text-white' : 'bg-zinc-100 text-zinc-600'}`}>
                              <Icon size={16} />
                            </div>
                            {isSelected && <CheckCircle2 size={16} className="text-emerald-600" />}
                          </div>
                          <div className="font-black text-xs text-zinc-950 leading-tight">{item.name}</div>
                          <div className="text-[10px] text-emerald-700 font-bold mt-0.5">{item.sub}</div>
                        </div>
                        <div className="text-[9px] text-zinc-400 mt-2 font-mono">{item.desc}</div>
                      </button>
                    );
                  })}
                </div>

                {/* Connection Interactive Control Box */}
                <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-3">
                  {/* Mode A: Windows Driver / System Spooler */}
                  {settings.printerType === 'system' && (
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div className="space-y-1">
                        <div className="font-bold text-zinc-950 flex items-center gap-2">
                          <Laptop size={16} className="text-emerald-600" />
                          <span>{lang === 'ar' ? 'تعريف ويندوز لطابعة زيويل (GA-C80250 Series Driver)' : 'Windows GA-C80250 Driver / System Spooler'}</span>
                        </div>
                        <p className="text-[11px] text-zinc-600">
                          {lang === 'ar'
                            ? 'يعمل مباشرة وبكل سلاسة عبر أي متصفح دون الحاجة لأي تصاريح خاصة. يدعم مقاس الورق 80×297 مم وفتح الدرج RJ11.'
                            : 'Prints directly using the installed Zywell Windows driver (80mm width). 100% reliable across all browsers.'}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <button
                          type="button"
                          id="btn-active-system-driver"
                          onClick={handleSetWindowsDriver}
                          className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition inline-flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                        >
                          <CheckCircle2 size={14} />
                          <span>{lang === 'ar' ? 'تعيين كطابعة نشطة' : 'Set as Active'}</span>
                        </button>
                        <button
                          type="button"
                          id="btn-test-system-print"
                          onClick={handleTestPrint}
                          className="flex-1 sm:flex-none px-3 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs transition inline-flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Printer size={14} />
                          <span>{lang === 'ar' ? 'تجربة الطباعة' : 'Test Print'}</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Mode B: Direct USB Serial */}
                  {settings.printerType === 'serial' && (
                    <div className="space-y-3">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div className="space-y-1">
                          <div className="font-bold text-zinc-950 flex items-center gap-2">
                            <Usb size={16} className="text-emerald-600" />
                            <span>{lang === 'ar' ? 'منفذ USB تسلسلي مباشر (WebSerial)' : 'Direct USB Serial (ESC/POS Raw)'}</span>
                          </div>
                          <p className="text-[11px] text-zinc-600">
                            {lang === 'ar'
                              ? 'إرسال أوامر البايت الخام المباشرة لطابعة زيويل عبر كابل USB.'
                              : 'Dispatches raw ESC/POS byte commands directly to the Zywell USB Virtual COM port.'}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 w-full sm:w-auto">
                          {/* Baud Rate Selector */}
                          <div className="flex items-center gap-1.5 bg-white px-2.5 py-1.5 rounded-xl border border-zinc-300">
                            <span className="text-[10px] text-zinc-500 font-bold">{t.baudRate}:</span>
                            <select
                              value={settings.serialBaudRate}
                              onChange={(e) => setSettings({ ...settings, serialBaudRate: Number(e.target.value) })}
                              className="bg-transparent font-mono font-bold text-xs text-zinc-900 focus:outline-none cursor-pointer"
                            >
                              <option value={9600}>9600 (Zywell Default)</option>
                              <option value={19200}>19200</option>
                              <option value={38400}>38400</option>
                              <option value={115200}>115200 (High Speed)</option>
                            </select>
                          </div>

                          <button
                            type="button"
                            id="btn-connect-usb-serial"
                            disabled={isConnecting}
                            onClick={handleConnectSerial}
                            className="px-4 py-2 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white font-bold text-xs transition inline-flex items-center justify-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
                          >
                            {isConnecting ? <RefreshCw size={14} className="animate-spin" /> : <Usb size={14} />}
                            <span>{lang === 'ar' ? 'اختيار منفذ USB وزيويل' : 'Select USB & Connect'}</span>
                          </button>
                        </div>
                      </div>

                      {/* WebSerial Iframe Helper Note */}
                      <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px] flex items-start gap-2">
                        <AlertCircle size={15} className="text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <span>
                            {lang === 'ar'
                              ? 'إذا كنت تشغل النظام داخل معاينة أو إطار، قد يتطلب متصفح كروم فتح التطبيق في تبويب كامل للوصول المباشر لمنفذ USB، أو يمكنك ببساطة استخدام خيار (تعريف ويندوز / النظام) بالأعلى.'
                              : 'Note: WebSerial direct USB requires a top-level browser tab in Chrome/Edge. Alternatively, select "Windows GA-Driver" above for 100% instant printing.'}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Mode C: Network LAN IP */}
                  {settings.printerType === 'network' && (
                    <div className="space-y-3">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div className="space-y-1">
                          <div className="font-bold text-zinc-950 flex items-center gap-2">
                            <Network size={16} className="text-purple-600" />
                            <span>{lang === 'ar' ? 'طابعة زيويل عبر شبكة إيثرنت (Ethernet / LAN)' : 'Zywell Network LAN Printer (Port 9100)'}</span>
                          </div>
                          <p className="text-[11px] text-zinc-600">
                            {lang === 'ar'
                              ? 'اتصال مباشر عبر كابل الشبكة برقم IP الافتراضي للطابعة (مثلاً: 192.168.1.200:9100)'
                              : 'Connect via Ethernet network cable to the Zywell IP address (e.g. 192.168.1.200:9100).'}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 w-full sm:w-auto">
                          <input
                            type="text"
                            value={settings.networkIp}
                            onChange={(e) => setSettings({ ...settings, networkIp: e.target.value })}
                            placeholder="192.168.1.200:9100"
                            className="px-3 py-1.5 rounded-xl border border-zinc-300 font-mono text-xs text-zinc-900 bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none w-44"
                          />
                          <button
                            type="button"
                            id="btn-save-network-ip"
                            onClick={handleConnectNetwork}
                            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs transition inline-flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                          >
                            <CheckCircle2 size={14} />
                            <span>{lang === 'ar' ? 'حفظ والاتصال' : 'Save & Link'}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Mode D: Bluetooth */}
                  {settings.printerType === 'bluetooth' && (
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div className="space-y-1">
                        <div className="font-bold text-zinc-950 flex items-center gap-2">
                          <Bluetooth size={16} className="text-blue-600" />
                          <span>{lang === 'ar' ? 'طابعة زيويل اللاسلكية (Bluetooth ESC/POS)' : 'Zywell Wireless Bluetooth'}</span>
                        </div>
                        <p className="text-[11px] text-zinc-600">
                          {lang === 'ar'
                            ? 'اقتران لاسلكي مباشر مع موديلات زيويل المزودة بالبلوتوث.'
                            : 'Pairs wirelessly with Bluetooth-enabled POS receipt printer models.'}
                        </p>
                      </div>

                      <button
                        type="button"
                        id="btn-pair-bluetooth"
                        disabled={isConnecting}
                        onClick={handleConnectBluetooth}
                        className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition inline-flex items-center justify-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
                      >
                        {isConnecting ? <RefreshCw size={14} className="animate-spin" /> : <Bluetooth size={14} />}
                        <span>{lang === 'ar' ? 'بحث واقتران بلوتوث' : 'Pair Bluetooth Device'}</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Section 2: Paper Width & Cash Drawer Automation */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Paper Width & Visuals */}
                <div className="p-4 rounded-2xl border border-zinc-200 space-y-3 bg-white">
                  <label className="text-xs font-black text-zinc-950 uppercase tracking-wider block">
                    2. {t.thermalWidth} (Zywell GA-C80250)
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      id="btn-paper-80mm"
                      onClick={() => setSettings({ ...settings, paperWidth: 80 })}
                      className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs border text-center transition cursor-pointer flex items-center justify-center gap-1.5 ${
                        settings.paperWidth === 80
                          ? 'bg-zinc-950 text-white border-zinc-950 shadow-xs'
                          : 'bg-white text-zinc-700 border-zinc-200 hover:border-zinc-300'
                      }`}
                    >
                      <CheckCircle2 size={13} className={settings.paperWidth === 80 ? 'text-emerald-400' : 'text-transparent'} />
                      <span>80mm ({lang === 'ar' ? 'عريض - أساسي' : 'Standard Roll'})</span>
                    </button>
                    <button
                      type="button"
                      id="btn-paper-58mm"
                      onClick={() => setSettings({ ...settings, paperWidth: 58 })}
                      className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs border text-center transition cursor-pointer flex items-center justify-center gap-1.5 ${
                        settings.paperWidth === 58
                          ? 'bg-zinc-950 text-white border-zinc-950 shadow-xs'
                          : 'bg-white text-zinc-700 border-zinc-200 hover:border-zinc-300'
                      }`}
                    >
                      <CheckCircle2 size={13} className={settings.paperWidth === 58 ? 'text-emerald-400' : 'text-transparent'} />
                      <span>58mm ({lang === 'ar' ? 'صغير' : 'Compact'})</span>
                    </button>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-zinc-100">
                    {/* Receipt Separation Mode */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-zinc-800 block">
                        {t.receiptPrintMode || (lang === 'ar' ? 'نمط طباعة الإيصالات' : 'Receipt Print Output Mode')}
                      </label>
                      <select
                        id="select-receipt-print-mode"
                        value={settings.receiptPrintMode || 'both_separate'}
                        onChange={(e) => setSettings({ ...settings, receiptPrintMode: e.target.value as any })}
                        className="w-full px-2.5 py-1.5 rounded-xl border border-zinc-300 bg-zinc-50 text-zinc-900 text-xs font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-hidden cursor-pointer"
                      >
                        <option value="both_separate">{t.bothReceiptsSeparate || 'Both Separated (Customer + Kitchen KOT)'}</option>
                        <option value="customer_only">{t.customerReceipt || 'Customer Receipt Only'}</option>
                        <option value="kitchen_only">{t.kitchenReceipt || 'Kitchen Ticket (KOT) Only'}</option>
                      </select>
                    </div>

                    {/* Font Size Preference */}
                    <div className="space-y-1 pt-1">
                      <label className="text-[11px] font-bold text-zinc-800 block">
                        {t.fontSize || (lang === 'ar' ? 'حجم الخط في الطباعة' : 'Font Size Preference')}
                      </label>
                      <select
                        id="select-font-size-pref"
                        value={settings.fontSizePreference || 'large_obvious'}
                        onChange={(e) => setSettings({ ...settings, fontSizePreference: e.target.value as any })}
                        className="w-full px-2.5 py-1.5 rounded-xl border border-zinc-300 bg-zinc-50 text-zinc-900 text-xs font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-hidden cursor-pointer"
                      >
                        <option value="large_obvious">{t.largeObviousFont || 'Large & Obvious (Recommended for 80mm)'}</option>
                        <option value="extra_large">{t.extraLargeFont || 'Extra Large Chef Font'}</option>
                        <option value="standard">{t.standardFont || 'Standard (10pt)'}</option>
                      </select>
                    </div>

                    <label className="flex items-center justify-between cursor-pointer pt-1">
                      <span className="font-semibold text-zinc-800">{t.autoPrintReceipt}</span>
                      <input
                        type="checkbox"
                        checked={settings.autoPrintReceipt}
                        onChange={(e) => setSettings({ ...settings, autoPrintReceipt: e.target.checked })}
                        className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 cursor-pointer"
                      />
                    </label>
                    <label className="flex items-center justify-between cursor-pointer">
                      <span className="font-semibold text-zinc-800">{lang === 'ar' ? 'طباعة شعار وايت تيبل في رأس الفاتورة' : 'Print White Table Brand Logo'}</span>
                      <input
                        type="checkbox"
                        checked={settings.printLogo}
                        onChange={(e) => setSettings({ ...settings, printLogo: e.target.checked })}
                        className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 cursor-pointer"
                      />
                    </label>
                  </div>
                </div>

                {/* Cash Drawer RJ11 24V Settings */}
                <div className="p-4 rounded-2xl border border-zinc-200 space-y-3 bg-white">
                  <label className="text-xs font-black text-zinc-950 uppercase tracking-wider block">
                    3. {t.cashDrawerSettings} (DC 24V/1A)
                  </label>

                  <div className="space-y-2.5">
                    <label className="flex items-center justify-between cursor-pointer">
                      <div>
                        <span className="font-semibold text-zinc-800 block">{t.autoKickOnCash}</span>
                        <span className="text-[10px] text-zinc-400">{lang === 'ar' ? 'إرسال نبضة RJ11 فور تأكيد الدفع النقدي' : 'Triggers RJ11 pin pulse automatically upon cash checkout'}</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.autoKickDrawerOnCash}
                        onChange={(e) => setSettings({ ...settings, autoKickDrawerOnCash: e.target.checked })}
                        className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 cursor-pointer"
                      />
                    </label>

                    <label className="flex items-center justify-between cursor-pointer">
                      <span className="font-semibold text-zinc-800">{lang === 'ar' ? 'صوت جرس الكاشير الميكانيكي' : 'Cash Register Sound Effect'}</span>
                      <input
                        type="checkbox"
                        checked={settings.soundFeedback}
                        onChange={(e) => setSettings({ ...settings, soundFeedback: e.target.checked })}
                        className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 cursor-pointer"
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* Section 3: Diagnostic Hardware Quick Tests */}
              <div className="p-4 rounded-2xl bg-zinc-950 text-white space-y-3 shadow-md">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                    <Sliders size={14} /> {lang === 'ar' ? 'أزرار الاختبار والفحص المباشر لطابعة زيويل والعتاد' : 'Live Hardware Diagnostic & Action Controls'}
                  </span>
                  <span className="text-[10px] text-zinc-400 font-mono">
                    Zywell GA-C80250 Diagnostic Unit
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                  {/* Test 1: Slip Print */}
                  <button
                    type="button"
                    id="btn-test-print-slip"
                    onClick={handleTestPrint}
                    className="p-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-white font-bold text-xs transition flex flex-col items-center justify-center gap-1.5 cursor-pointer text-center"
                  >
                    <Printer size={16} className="text-emerald-400" />
                    <span className="text-[11px] leading-tight">{t.testPrint}</span>
                  </button>

                  {/* Test 2: Cash Drawer */}
                  <button
                    type="button"
                    id="btn-test-cash-drawer"
                    onClick={handleTestKickDrawer}
                    className={`p-2.5 rounded-xl border text-white font-bold text-xs transition flex flex-col items-center justify-center gap-1.5 cursor-pointer text-center ${
                      drawerKicking
                        ? 'bg-emerald-600 border-emerald-500 animate-bounce'
                        : 'bg-zinc-900 hover:bg-zinc-800 border-zinc-800'
                    }`}
                  >
                    <DollarSign size={16} className="text-emerald-400" />
                    <span className="text-[11px] leading-tight">
                      {drawerKicking ? (lang === 'ar' ? 'تم فتح الدرج!' : 'Drawer Open!') : t.testKickDrawer}
                    </span>
                  </button>

                  {/* Test 3: Auto-Cutter */}
                  <button
                    type="button"
                    id="btn-test-auto-cutter"
                    onClick={handleTestCutter}
                    className={`p-2.5 rounded-xl border text-white font-bold text-xs transition flex flex-col items-center justify-center gap-1.5 cursor-pointer text-center ${
                      cutterTesting
                        ? 'bg-amber-600 border-amber-500'
                        : 'bg-zinc-900 hover:bg-zinc-800 border-zinc-800'
                    }`}
                  >
                    <Scissors size={16} className="text-amber-400" />
                    <span className="text-[11px] leading-tight">{t.testCutter}</span>
                  </button>

                  {/* Test 4: Paper Feed */}
                  <button
                    type="button"
                    id="btn-test-paper-feed"
                    onClick={handleTestFeed}
                    className={`p-2.5 rounded-xl border text-white font-bold text-xs transition flex flex-col items-center justify-center gap-1.5 cursor-pointer text-center ${
                      feedTesting
                        ? 'bg-indigo-600 border-indigo-500'
                        : 'bg-zinc-900 hover:bg-zinc-800 border-zinc-800'
                    }`}
                  >
                    <ScanLine size={16} className="text-indigo-400" />
                    <span className="text-[11px] leading-tight">{t.testFeed}</span>
                  </button>

                  {/* Test 5: Buzzer */}
                  <button
                    type="button"
                    id="btn-test-buzzer"
                    onClick={handleTestBuzzer}
                    className={`p-2.5 rounded-xl border text-white font-bold text-xs transition flex flex-col items-center justify-center gap-1.5 cursor-pointer text-center ${
                      buzzerTesting
                        ? 'bg-purple-600 border-purple-500'
                        : 'bg-zinc-900 hover:bg-zinc-800 border-zinc-800'
                    }`}
                  >
                    <Volume2 size={16} className="text-purple-400" />
                    <span className="text-[11px] leading-tight">{lang === 'ar' ? 'جرس التنبيه' : 'Beep Buzzer'}</span>
                  </button>

                  {/* Test 6: Customer Display */}
                  <button
                    type="button"
                    id="btn-open-customer-screen"
                    onClick={handleOpenCustomerDisplay}
                    className="p-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-white font-bold text-xs transition flex flex-col items-center justify-center gap-1.5 cursor-pointer text-center"
                  >
                    <Tv size={16} className="text-emerald-400" />
                    <span className="text-[11px] leading-tight">{lang === 'ar' ? 'شاشة العميل' : 'Customer Display'}</span>
                  </button>
                </div>
              </div>
            </>
          ) : (
            /* Tab 2: Zywell GA-C80250I Plus Step-by-Step Manual & Driver Guide */
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-zinc-900 text-white border border-zinc-800">
                <h4 className="text-sm font-black text-white flex items-center gap-2">
                  <FileText size={16} className="text-emerald-400" />
                  <span>{t.manualGuideTitle}</span>
                </h4>
                <p className="text-xs text-zinc-400 mt-1">
                  {lang === 'ar'
                    ? 'دليل التركيب والتعريف الرسمي المستخرج من دليل المستخدم لطابعة زيويل موديل GA-C80250I Plus'
                    : 'Official hardware setup instructions and driver specifications for Zywell GA-C80250I Plus.'}
                </p>
              </div>

              {/* Steps Accordion / Cards */}
              <div className="space-y-3">
                {/* Step 1: Connecting cables */}
                <div className="p-4 rounded-2xl border border-zinc-200 bg-white space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs">1</span>
                    <h5 className="font-bold text-zinc-950 text-xs">
                      {lang === 'ar' ? 'توصيل الكابلات ومحول الطاقة' : 'Connecting Power & Interface Cables'}
                    </h5>
                  </div>
                  <ul className="list-disc list-inside text-zinc-600 space-y-1 text-[11px] ms-8">
                    <li>{lang === 'ar' ? 'تأكد من إيقاف تشغيل الطابعة (مفتاح الطاقة في وضع OFF).' : 'Ensure the printer is powered OFF before plugging cables.'}</li>
                    <li>{lang === 'ar' ? 'صل محول الطاقة DC 24V/2.5A بمنفذ الطاقة الدائري خلف الطابعة.' : 'Plug the DC 24V/2.5A power adapter into the circular power socket.'}</li>
                    <li>{lang === 'ar' ? 'صل كابل USB أو كابل الشبكة LAN بالمنفذ المخصص خلف الطابعة والحاسوب.' : 'Connect the USB cable or Ethernet LAN cable to the PC / POS terminal.'}</li>
                    <li>{lang === 'ar' ? 'صل كابل درج النقود RJ11 بمنفذ الدرج (DC 24V/1A).' : 'Plug the RJ11 cash drawer cable into the drawer kick port.'}</li>
                  </ul>
                </div>

                {/* Step 2: Paper loading */}
                <div className="p-4 rounded-2xl border border-zinc-200 bg-white space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs">2</span>
                    <h5 className="font-bold text-zinc-950 text-xs">
                      {lang === 'ar' ? 'تركيب بكرة الورق الحراري 80 مم' : 'Loading 80mm Thermal Paper Roll'}
                    </h5>
                  </div>
                  <ul className="list-disc list-inside text-zinc-600 space-y-1 text-[11px] ms-8">
                    <li>{lang === 'ar' ? 'اضغط على زر فتح الغطاء العلوي للطابعة.' : 'Press the cover-open button on the side/top of the printer.'}</li>
                    <li>{lang === 'ar' ? 'ضع بكرة الورق الحراري مقاس 80 مم بحيث يخرج طرف الورق من الأسفل للأعلى.' : 'Insert the 80mm roll in the correct printing direction (thermal side facing print head).'}</li>
                    <li>{lang === 'ar' ? 'اسحب طرف الورق للخارج قليلاً واغلق الغطاء بإحكام حتى تسمع صوت الإغلاق (Click).' : 'Pull a small leader of paper out and press the cover down firmly until it clicks.'}</li>
                  </ul>
                </div>

                {/* Step 3: Windows Driver Installation */}
                <div className="p-4 rounded-2xl border border-zinc-200 bg-white space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs">3</span>
                    <h5 className="font-bold text-zinc-950 text-xs">
                      {lang === 'ar' ? 'تثبيت تعريف ويندوز (GA-Printer Driver v1.1)' : 'Windows Driver Installation (GA-Printer Driver v1.1)'}
                    </h5>
                  </div>
                  <ul className="list-disc list-inside text-zinc-600 space-y-1 text-[11px] ms-8">
                    <li>{lang === 'ar' ? 'شغّل برنامج التثبيت (GA-Printer Driver Setup).' : 'Run the GA-Printer Driver setup on Windows 10/11.'}</li>
                    <li>{lang === 'ar' ? 'اختر نظام التشغيل (Windows 10/11) والموديل (GA-C80250 Series أو POS-80).' : 'Select OS (Windows 10/11) and Model: GA-C80250 Series or POS-80.'}</li>
                    <li>{lang === 'ar' ? 'اختر منفذ الاتصال (USB Port أو COM Virtual Port أو TCP/IP Port).' : 'Select the matching interface port (USB001 / Virtual COM / TCP/IP).'}</li>
                    <li>{lang === 'ar' ? 'في خيارات الطابعة (Printing Preferences)، اضبط مقاس الورق على: 80 x 297 mm وخيار Cutter على Cut Paper.' : 'Under Printing Preferences, set Paper Size to 80x297mm and Auto-Cutter to Enabled.'}</li>
                  </ul>
                </div>

                {/* Step 4: Self Test Slip */}
                <div className="p-4 rounded-2xl border border-zinc-200 bg-white space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs">4</span>
                    <h5 className="font-bold text-zinc-950 text-xs">
                      {lang === 'ar' ? 'طباعة تقرير الفحص الذاتي اليدوي (Self-Test)' : 'Manual Hardware Self-Test Report'}
                    </h5>
                  </div>
                  <p className="text-[11px] text-zinc-600 ms-8">
                    {lang === 'ar'
                      ? 'للتأكد من سلامة الطابعة دون حاسوب: أطفئ الطابعة، ثم اضغط واستمر بالضغط على زر FEED، ثم شغّل زر الطاقة، واترك زر FEED بعد ثانيتين. ستطبع الطابعة تقرير الفحص ومعدل البود وعنوان الـ IP.'
                      : 'To run a standalone hardware self-test: Turn printer OFF, hold the FEED button, switch power ON, and release FEED after 2 seconds. The printer will print its internal IP, baud rate, and firmware status.'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-zinc-50 border-t border-zinc-200 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200 font-bold text-xs transition cursor-pointer"
          >
            {t.cancel}
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              id="btn-save-hardware-settings"
              onClick={handleSave}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs transition shadow-sm inline-flex items-center gap-2 cursor-pointer"
            >
              <CheckCircle2 size={16} /> {t.saveSettings}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
