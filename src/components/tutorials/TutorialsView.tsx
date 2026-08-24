import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  SkipBack,
  Volume2,
  VolumeX,
  GraduationCap,
  Coffee,
  Armchair,
  ChefHat,
  Boxes,
  Clock,
  Receipt,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  HelpCircle,
  Award,
  Download,
  BookOpen,
  Printer,
  ChevronRight,
  ShieldCheck,
  Zap,
  Flame,
  Check,
  AlertCircle,
  Copy,
  ExternalLink,
} from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { UserAccount } from '../../utils/auth';

export interface TutorialStep {
  id: string;
  stepNumber: number;
  titleEn: string;
  titleAr: string;
  descriptionEn: string;
  descriptionAr: string;
  visualScene: 'pos_order' | 'pos_customizer' | 'pos_checkout' | 'table_timer' | 'wifi_card' | 'table_checkout' | 'kds_tickets' | 'kds_status' | 'stock_deduction' | 'stock_reorder' | 'time_clock' | 'payroll_slip' | 'tax_invoice';
  narrationEn: string;
  narrationAr: string;
  keyTakeawaysEn: string[];
  keyTakeawaysAr: string[];
  practicePromptEn: string;
  practicePromptAr: string;
  interactiveAction?: string;
}

export interface TutorialModule {
  id: string;
  courseNumber: number;
  titleEn: string;
  titleAr: string;
  subtitleEn: string;
  subtitleAr: string;
  icon: any;
  badgeEn: string;
  badgeAr: string;
  color: string;
  durationMinutes: number;
  steps: TutorialStep[];
}

export const TUTORIAL_MODULES: TutorialModule[] = [
  {
    id: 'pos_masterclass',
    courseNumber: 1,
    titleEn: 'POS & Order Billing Masterclass',
    titleAr: 'دليل الكاشير ونقاط البيع الكامل',
    subtitleEn: 'Order taking, item customizations, combos, split bills, and thermal receipt printing.',
    subtitleAr: 'تسجيل الطلبات، تخصيص المشروبات والمأكولات، الخصومات، تقسيم الفاتورة والطباعة الحرارية.',
    icon: Coffee,
    badgeEn: 'Essential',
    badgeAr: 'أساسي للكاشير',
    color: 'from-emerald-500 to-teal-700',
    durationMinutes: 5,
    steps: [
      {
        id: 'pos-1',
        stepNumber: 1,
        titleEn: '1. Navigating Menu Categories & Instant Search',
        titleAr: '1. تصفح قوائم الطعام والمشروبات والبحث السريع',
        descriptionEn: 'Use the top category tabs or the instant search bar to find beverages, hot food, toasts, bowls, and coworking passes.',
        descriptionAr: 'استخدم تصنيفات القائمة العلوية أو شريط البحث الفوري للوصول السريع إلى المشروبات، المأكولات، والوجبات.',
        visualScene: 'pos_order',
        narrationEn: 'Welcome to White Table POS. Start by tapping any category like Hot Drinks or Burgers, or type the item name directly in the search bar.',
        narrationAr: 'أهلاً بك في نظام وايت تيبل. يمكنك الضغط على أي تصنيف كالمشروبات الساخنة أو البرجر، أو كتابة اسم الصنف في خانة البحث.',
        keyTakeawaysEn: ['Filter by category tab in 1 click', 'Search by English or Arabic name', 'Real-time price & category badges'],
        keyTakeawaysAr: ['فلترة التصنيفات بضغطة واحدة', 'البحث بالاسم العربي أو الإنجليزي', 'عرض الأسعار المحدثة والتصنيفات'],
        practicePromptEn: 'Click on Turkish Coffee or Smashed Burger to test adding to cart.',
        practicePromptAr: 'اضغط على القهوة التركية أو البرجر لتجربة إضافته للسلة.',
      },
      {
        id: 'pos-2',
        stepNumber: 2,
        titleEn: '2. Customizing Sizes, Milks, and Syrups',
        titleAr: '2. تخصيص الأحجام ونوع الحليب والإضافات',
        descriptionEn: 'When clicking on items like Lattes or Matcha, the customization modal opens to select Single/Double size, Oat/Almond milk, and extra flavor shots.',
        descriptionAr: 'عند اختيار أصناف مثل اللاتيه أو الماتشا، تفتح نافذة التخصيص لاختيار الحجم (سنجل/دبل)، نوع الحليب (شوفان/لوز)، والنكهات.',
        visualScene: 'pos_customizer',
        narrationEn: 'Customize the drink: select the portion size, pick alternative milks like Oat or Almond, and tap extra syrup shots. The price updates live.',
        narrationAr: 'خصص المشروب: اختر الحجم المطلوب، حدد نوع الحليب البديل مثل الشوفان أو اللوز، وأضف النكهات. يتحدث الإجمالي فورياً.',
        keyTakeawaysEn: ['Custom size modifiers (+25 EGP)', 'Plant milk add-ons (Oat/Almond)', 'Special chef instructions/notes'],
        keyTakeawaysAr: ['تعديل الأحجام بسهولة', 'إضافة أنواع الحليب النباتي', 'كتابة ملاحظات وتوجيهات خاصة للشيف'],
        practicePromptEn: 'Select "Double Shot" and "Oat Milk (+25 EGP)" then confirm.',
        practicePromptAr: 'اختر "دبل شوت" مع "حليب شوفان (+25 ج.م)" ثم اضغط تأكيد.',
      },
      {
        id: 'pos-3',
        stepNumber: 3,
        titleEn: '3. Discounts, Member CRM & Multi-Payment Checkout',
        titleAr: '3. الخصومات، نقاط ولاء العملاء والدفع المتعدد',
        descriptionEn: 'Apply promotional percentage discounts, look up returning members via phone number to redeem loyalty points, and checkout via Cash, Card, or InstaPay.',
        descriptionAr: 'تطبيق نسب الخصم الترويجية، البحث عن العملاء برقم الهاتف لاستبدال نقاط الولاء، وإتمام الدفع نقداً أو بالفيزا أو عبر إنستاباي.',
        visualScene: 'pos_checkout',
        narrationEn: 'Review the cart, apply discounts if authorized, pick the payment method (Cash, Card, or InstaPay), and click Complete Checkout.',
        narrationAr: 'راجع السلة، طبق الخصم المصرح به، اختر طريقة الدفع (نقدي، بطاقة، أو إنستاباي)، واضغط على إتمام الدفع وإصدار الفاتورة.',
        keyTakeawaysEn: ['Auto 14% VAT calculation', 'InstaPay & Card integration', 'Auto cash drawer trigger & thermal receipt'],
        keyTakeawaysAr: ['حساب ضريبة القيمة المضافة 14% تلقائياً', 'دعم بطاقات الدفع وإنستاباي', 'فتح درج النقدية وطباعة الإيصال فوراً'],
        practicePromptEn: 'Select InstaPay / Cash and click "Complete Order".',
        practicePromptAr: 'اختر طريقة الدفع واضغط على "إتمام الطلب".',
      },
    ],
  },
  {
    id: 'coworking_tables',
    courseNumber: 2,
    titleEn: 'Coworking Tables & 5GB WiFi Passes',
    titleAr: 'إدارة مساحات العمل وبطاقات الواي فاي 5GB',
    subtitleEn: 'Live hourly timer billing, WiFi card dispensing, table transfers, and food+desk combo discounts.',
    subtitleAr: 'الفوترة بالساعة للمكاتب الـ 14، إصدار كروت الواي فاي 5GB، نقل الطاولات، وخصم الكومبو 15%.',
    icon: Armchair,
    badgeEn: 'Specialty',
    badgeAr: 'مساحة العمل',
    color: 'from-blue-600 to-indigo-800',
    durationMinutes: 4,
    steps: [
      {
        id: 'cowork-1',
        stepNumber: 1,
        titleEn: '1. Checking-In Guests & Starting the Live Timer',
        titleAr: '1. تسجيل دخول رواد مساحة العمل وبدء العداد المباشر',
        descriptionEn: 'Click on any available table (Tables 1-14). Enter guest name and start the live 100 EGP/hr timer. Quiet and Social zones are color-coded.',
        descriptionAr: 'اضغط على أي مكتب شاغر (المكاتب من 1 إلى 14). سجل اسم العميل وابدأ عداد الفوترة (100 ج.م/ساعة). المناطق الهادئة والتفاعلية مميزة بالألوان.',
        visualScene: 'table_timer',
        narrationEn: 'To start a session, select an available desk from the floor map, type the customer name, and click Start Session. The real-time timer starts ticking.',
        narrationAr: 'لبدء جلسة، اختر طاولة شاغرة من خريطة الطابق، أدخل اسم العميل، واضغط بدء الجلسة. يبدأ العداد المباشر في احتساب الوقت والمبلغ.',
        keyTakeawaysEn: ['14 dedicated numbered tables', 'Quiet vs. Social zone indicators', 'Live EGP accrued counter per second'],
        keyTakeawaysAr: ['14 طاولة مرقمة مخصصة للعمل', 'تقسيم المناطق الهادئة والاجتماعية', 'احتساب لحظي للمبلغ بالجنيه وفق الدقائق'],
        practicePromptEn: 'Click Table #04 and start a live session for "Karim".',
        practicePromptAr: 'اضغط على طاولة رقم 4 وابدأ جلسة عمل باسم "كريم".',
      },
      {
        id: 'cowork-2',
        stepNumber: 2,
        titleEn: '2. Dispensing 5GB High-Speed WiFi Scratch Cards',
        titleAr: '2. إصدار بطاقات إنترنت فائق السرعة 5GB كود الخدش',
        descriptionEn: 'Dispense 5GB high-speed WiFi scratch cards (50 EGP). Unique PIN is generated and printed on thermal slip for the guest.',
        descriptionAr: 'إصدار كروت الواي فاي عالية السرعة سعة 5GB بسعر 50 ج.م. يتم إنشاء كود مرور PIN فريد وطباعته على الإيصال الحراري للعميل.',
        visualScene: 'wifi_card',
        narrationEn: 'Guests needing ultra-fast internet can purchase a 5GB scratch card for 50 EGP. The system automatically prints the unique PIN voucher.',
        narrationAr: 'للعملاء الراغبين في إنترنت فائق السرعة، يمكنك إضافة كارت 5GB بقيمة 50 ج.م. يقوم النظام بطباعة قسيمة برقم سري فريد.',
        keyTakeawaysEn: ['Fixed 50 EGP per 5GB voucher', 'Auto-generated alphanumeric PIN', 'Thermal printer voucher slip'],
        keyTakeawaysAr: ['سعر ثابت 50 ج.م لكارت 5GB', 'توليد كود مرور PIN مشفر تلقائياً', 'طباعة إيصال القسيمة على الطابعة الحرارية'],
        practicePromptEn: 'Add "5GB High-Speed WiFi Card" to Table #04 tab.',
        practicePromptAr: 'أضف كارت واي فاي 5GB إلى حساب طاولة رقم 4.',
      },
      {
        id: 'cowork-3',
        stepNumber: 3,
        titleEn: '3. Ending Session & 15% Food+Space Combo Discount',
        titleAr: '3. إنهاء الجلسة وتطبيق خصم الكومبو 15% على المأكولات',
        descriptionEn: 'When the guest finishes, click "End Session & Pay". If food or coffee was ordered during the session, an automatic 15% combo discount is applied!',
        descriptionAr: 'عند مغادرة العميل، اضغط على "إنهاء الجلسة والدفع". إذا طلب العميل مشروبات أو مأكولات، يتم تطبيق خصم 15% كومبو تلقائياً!',
        visualScene: 'table_checkout',
        narrationEn: 'Click Checkout on the active desk. The system tallies desk hours plus cafe items, automatically applies the 15 percent combo discount, and prints the summary receipt.',
        narrationAr: 'اضغط على محاسبة الطاولة. يجمع النظام ساعات الجلوس مع طلبات الكافيه، ويطبق خصم 15% كومبو تلقائياً ويطبع الإيصال النهائي.',
        keyTakeawaysEn: ['Auto 15% Food & Desk discount', 'Prorated minute-level billing', 'Complete session duration receipt'],
        keyTakeawaysAr: ['خصم 15% تلقائي عند طلب أكل مع مساحة العمل', 'احتساب دقيق بالدقيقة دون تقريب مجحف', 'إيصال تفصيلي بمدة الجلسة والطلبات'],
        practicePromptEn: 'Click "End Session & Checkout Table #04".',
        practicePromptAr: 'اضغط على "إنهاء ومحاسبة طاولة رقم 4".',
      },
    ],
  },
  {
    id: 'kds_kitchen',
    courseNumber: 3,
    titleEn: 'Kitchen Display (KDS) & Barista Bar Orders',
    titleAr: 'شاشة المطبخ (KDS) وتحضير طلبات الباريستا',
    subtitleEn: 'Live digital KOT display, station filtering, prep timers, and chef ticket thermal printing.',
    subtitleAr: 'استقبال تذاكر الطلبات الفورية، فرز أقسام المطبخ والباريستا، وتحديث مراحل التحضير.',
    icon: ChefHat,
    badgeEn: 'Kitchen & Bar',
    badgeAr: 'المطبخ والبار',
    color: 'from-orange-500 to-amber-700',
    durationMinutes: 3,
    steps: [
      {
        id: 'kds-1',
        stepNumber: 1,
        titleEn: '1. Station Routing & Priority KOT Tickets',
        titleAr: '1. توجيه الطلبات للأقسام وتذاكر الأولوية المستعجلة',
        descriptionEn: 'Orders placed at the POS or tables instantly appear on the KDS. Filter between "Hot Kitchen & Food" and "Barista Bar & Coffee" or view all.',
        descriptionAr: 'تظهر الطلبات المسجلة من الكاشير أو الطاولات فوراً على شاشة المطبخ. يمكنك فرز العرض حسب "المطبخ الساخن" أو "بار القهوة" أو الكل.',
        visualScene: 'kds_tickets',
        narrationEn: 'Every order creates a live Kitchen Order Ticket with the table number, customer name, elapsed timer, and any special chef notes.',
        narrationAr: 'كل طلب ينشئ تذكرة تحضير فورية توضح رقم الطاولة، اسم العميل، عداد وقت الانتظار، وملاحظات الشيف الخاصة.',
        keyTakeawaysEn: ['Instant zero-delay dispatching', 'Rush order visual alerts', 'Special modifications & allergy notes'],
        keyTakeawaysAr: ['إرسال فوري دون أي تأخير', 'تنبيهات بصرية للطلبات المستعجلة VIP', 'إبراز الملاحظات وتعديلات الحساسية'],
        practicePromptEn: 'Switch station filter to "Barista Bar".',
        practicePromptAr: 'قم بتبديل الفلتر إلى "بار القهوة والمشروبات".',
      },
      {
        id: 'kds-2',
        stepNumber: 2,
        titleEn: '2. Progression Stages: Queued -> Preparing -> Ready -> Served',
        titleAr: '2. مراحل التحضير: قيد الانتظار -> جاري التحضير -> جاهز -> تم التقديم',
        descriptionEn: 'Click "Start Prep" when firing the order, "Mark Ready" when plated/brewed, and "Served" when runner delivers to the table.',
        descriptionAr: 'اضغط على "بدء التحضير" عند استلام التذكرة، ثم "جاهز للتقديم" بعد الانتهاء، ثم "تم التقديم" عند تسليم الطلب للعميل.',
        visualScene: 'kds_status',
        narrationEn: 'Keep the kitchen synchronized: advance the ticket from Queued to Preparing, then mark Ready so the server can deliver the fresh order.',
        narrationAr: 'حافظ على تناغم العمل: حول التذكرة من قيد الانتظار إلى جاري التحضير، ثم إلى جاهز ليقوم الويتر بتسليم الطلب ساخناً.',
        keyTakeawaysEn: ['Color-coded status badges', 'Average prep time KPI tracking', 'Reprint KOT to thermal kitchen printer'],
        keyTakeawaysAr: ['حالات ملونة واضحة للشيف', 'قياس متوسط سرعة التحضير', 'إمكانية إعادة طباعة التذكرة حرارياً'],
        practicePromptEn: 'Advance ticket KOT-104 to "Ready for Service".',
        practicePromptAr: 'حول تذكرة KOT-104 إلى "جاهز للتقديم".',
      },
    ],
  },
  {
    id: 'stock_inventory',
    courseNumber: 4,
    titleEn: 'Live Stock & Ingredient Inventory Tracking',
    titleAr: 'إدارة المخزون وخصم المقادير والمكونات',
    subtitleEn: 'Automatic recipe deduction, low stock alerts, supplier receiving, and wastage logging.',
    subtitleAr: 'الخصم التلقائي للمكونات مع كل طلب، تنبيهات نقص المخزون، وتوريدات الموردين.',
    icon: Boxes,
    badgeEn: 'Management',
    badgeAr: 'إدارة المخازن',
    color: 'from-purple-600 to-indigo-900',
    durationMinutes: 3,
    steps: [
      {
        id: 'stock-1',
        stepNumber: 1,
        titleEn: '1. Automatic Recipe Ingredient Deduction',
        titleAr: '1. الخصم التلقائي للمواد الخام والمقادير',
        descriptionEn: 'Selling a Spanish Latte automatically deducts 18g Espresso Beans, 200ml Whole Milk, and 30ml Condensed Milk from stock in real-time.',
        descriptionAr: 'بيع كوب سبانش لاتيه يقوم بخصم 18 جرام بن، 200 مل حليب، و30 مل حليب مكثف فورياً من أرصدة المخزون.',
        visualScene: 'stock_deduction',
        narrationEn: 'White Table features automated recipe mapping. Every POS sale instantly decrements raw ingredients, giving accurate live stock counts.',
        narrationAr: 'يتميز نظام وايت تيبل بربط المقادير بالمنتجات. كل عملية بيع تخصم المواد الخام فورياً بدقة متناهية.',
        keyTakeawaysEn: ['Precise gram & milliliter tracking', 'Zero manual ledger calculations', 'Real-time Cost of Goods Sold (COGS)'],
        keyTakeawaysAr: ['تتبع دقيق بالجرام والمليلتر', 'استغناء تام عن الجرد اليدوي المرهق', 'حساب تكلفة البضاعة المباعة لحظياً'],
        practicePromptEn: 'Inspect "Specialty Coffee Beans (KG)" live stock level.',
        practicePromptAr: 'افحص رصيد "بن القهوة المختصة (كجم)".',
      },
      {
        id: 'stock-2',
        stepNumber: 2,
        titleEn: '2. Threshold Alerts & Quick Stock Replenishment',
        titleAr: '2. تنبيهات الحد الأدنى وإضافة توريدات المخزون',
        descriptionEn: 'When an item falls below its minimum threshold (e.g. < 5 KG beans), a red alert badge appears. Log supplier receipts with 1-click replenish.',
        descriptionAr: 'عند وصول صنف إلى ما دون الحد الأدنى (مثل أقل من 5 كجم بن)، يظهر تنبيه أحمر. يمكنك تسجيل فواتير الموردين وتزويد الرصيد بضغطة زر.',
        visualScene: 'stock_reorder',
        narrationEn: 'Stay ahead of stockouts. Review the low-stock warning list, tap Quick Restock, enter the received quantity, and save.',
        narrationAr: 'تجنب نفاذ البضاعة. راجع قائمة النواقص، اضغط على تزويد المخزون، أدخل الكمية الموردة، واحفظ العملية.',
        keyTakeawaysEn: ['Automated reorder point warnings', 'Supplier unit cost tracking', 'Wastage & spoilage logging'],
        keyTakeawaysAr: ['تنبيهات فورية عند اقتراب النفاذ', 'تسجيل تكلفة شراء الوحدة من المورد', 'تسجيل الهالك والتالف مع ذكر السبب'],
        practicePromptEn: 'Click "+ Restock 10 KG" on Colombian Coffee Beans.',
        practicePromptAr: 'اضغط على "+ توريد 10 كجم" لبن القهوة الكولومبي.',
      },
    ],
  },
  {
    id: 'staff_payroll',
    courseNumber: 5,
    titleEn: 'Staff Time Clock, Attendance & Automated Payroll',
    titleAr: 'تسجيل الحضور والانصراف ومسير الرواتب الآلي',
    subtitleEn: 'Shift clock punches, overtime tracking, Egyptian tax deductions, and printable payslips.',
    subtitleAr: 'تسجيل الحضور بالبصمة/الكود، احتساب الإضافي، استقطاعات التأمينات والضرائب، وطباعة قسائم الرواتب.',
    icon: Clock,
    badgeEn: 'HR & Finance',
    badgeAr: 'الموارد البشرية',
    color: 'from-amber-600 to-rose-700',
    durationMinutes: 3,
    steps: [
      {
        id: 'staff-1',
        stepNumber: 1,
        titleEn: '1. Staff Shift Clock-In / Clock-Out',
        titleAr: '1. تسجيل حضور وانصراف ورديات الموظفين',
        descriptionEn: 'Staff members select their profile and enter their 4-digit PIN to punch in at the start of shift and punch out when closing.',
        descriptionAr: 'يقوم الموظف باختيار اسمه وإدخال رمز المرور PIN المكون من 4 أرقام لتسجيل الحضور في بداية الوردية وتسجيل الانصراف عند المغادرة.',
        visualScene: 'time_clock',
        narrationEn: 'Accurate attendance starts at the time clock. Employees punch in with their PIN code, logging exact shift start and end times.',
        narrationAr: 'يبدأ الانضباط من ساعة تسجيل الحضور. يدخل الموظف رمزه السري لتسجيل أوقات الحضور والانصراف بدقة.',
        keyTakeawaysEn: ['Secure 4-digit PIN authentication', 'Late arrival & break logging', 'Automatic total working hours sum'],
        keyTakeawaysAr: ['تسجيل آمن برمز PIN لكل موظف', 'تسجيل التأخير وفترات الاستراحة', 'تجميع ساعات العمل الفعلية تلقائياً'],
        practicePromptEn: 'Punch in as "Ahmed Barista" with PIN 1234.',
        practicePromptAr: 'سجل حضور كـ "أحمد باريستا" بالرمز 1234.',
      },
      {
        id: 'staff-2',
        stepNumber: 2,
        titleEn: '2. Generating Payslips with Egyptian Tax Deductions',
        titleAr: '2. إصدار قسائم الرواتب مع حساب الاستقطاعات والتأمينات',
        descriptionEn: 'Managers calculate monthly wages based on clocked hours, add performance tips/bonuses, deduct social insurance, and print official salary slips.',
        descriptionAr: 'يقوم المدير باحتساب الرواتب الشهرية وفقاً لساعات العمل، إضافة المكافآت والإكراميات، خصم التأمينات الاجتماعية، وطباعة كشوف المرتبات الرسمية.',
        visualScene: 'payroll_slip',
        narrationEn: 'Review the payroll summary, verify net salaries after taxes and overtime bonuses, and print official stamped payslips for your team.',
        narrationAr: 'راجع ملخص الرواتب، تحقق من صافي الراتب بعد الإضافي والاستقطاعات، واطبع قسائم الرواتب المعتمدة لفريق العمل.',
        keyTakeawaysEn: ['Automated wage calculations', 'Bonuses, tips & deduction breakdowns', 'Printable A4 / Thermal Salary Slip'],
        keyTakeawaysAr: ['حسابات رواتب آلية خالية من الأخطاء', 'تفصيل المكافآت، الإكراميات والخصومات', 'طباعة قسيمة راتب معتمدة'],
        practicePromptEn: 'Click "Issue Payslip" for Cashier Omar.',
        practicePromptAr: 'اضغط على "إصدار قسيمة راتب" للكاشير عمر.',
      },
    ],
  },
  {
    id: 'invoices_tax',
    courseNumber: 6,
    titleEn: 'Egyptian ETA Tax Invoices & Financial Reports',
    titleAr: 'الفواتير الضريبية المعتمدة والتقارير المالية',
    subtitleEn: '14% Egyptian VAT compliance, ETA QR codes, date range filters, and PDF/Excel export.',
    subtitleAr: 'التوافق مع ضريبة القيمة المضافة 14%، رمز الاستجابة السريعة QR للضرائب، وتصدير إكسيل وPDF.',
    icon: Receipt,
    badgeEn: 'Accounting',
    badgeAr: 'الضرائب والمحاسبة',
    color: 'from-emerald-700 to-cyan-900',
    durationMinutes: 3,
    steps: [
      {
        id: 'tax-1',
        stepNumber: 1,
        titleEn: '1. Egyptian Tax Authority (ETA) e-Invoice Compliance',
        titleAr: '1. التوافق مع منظومة الفاتورة الإلكترونية المصرية',
        descriptionEn: 'Every invoice includes mandatory business tax registration number, serial invoice UUID, 14% VAT line item calculation, and verifiable cryptographic QR code.',
        descriptionAr: 'تتضمن كل فاتورة رقم التسجيل الضريبي، الرقم التسلسلي، احتساب ضريبة 14%، ورمز QR المشفر المعتمد لدى مصلحة الضرائب المصرية.',
        visualScene: 'tax_invoice',
        narrationEn: 'All White Table receipts and invoices are fully compliant with Egyptian Tax Authority standards, featuring cryptographic QR codes and VAT breakdowns.',
        narrationAr: 'جميع فواتير وإيصالات وايت تيبل متوافقة كلياً مع معايير مصلحة الضرائب المصرية وتتضمن باركود QR مشفر وتفصيل ضريبة القيمة المضافة.',
        keyTakeawaysEn: ['Mandatory Tax Reg. # 684-219-450', 'Instant A4 Tax Invoice printing', 'Export CSV, Excel & PDF financial ledger'],
        keyTakeawaysAr: ['رقم التسجيل الضريبي 684-219-450', 'طباعة فواتير A4 ضريبية رسمية', 'تصدير التقارير المالية بصيغة Excel وPDF'],
        practicePromptEn: 'Click "Print Official Tax Invoice" on Invoice #INV-2026-089.',
        practicePromptAr: 'اضغط "طباعة فاتورة ضريبية رسمية" للفاتورة رقم 089.',
      },
    ],
  },
];

export const CERTIFICATION_QUIZ = [
  {
    id: 'q1',
    questionEn: 'How much does 1 hour of Coworking Table access cost, and what discount applies if food is ordered?',
    questionAr: 'كم تبلغ تكلفة ساعة استخدام طاولة مساحة العمل، وما نسبة الخصم المطبقة عند طلب مأكولات؟',
    optionsEn: [
      '50 EGP/hr with no discount',
      '100 EGP/hr with an automatic 15% Food+Space Combo discount',
      '200 EGP/hr with 5% discount',
      'Free with any coffee purchase',
    ],
    optionsAr: [
      '50 ج.م/ساعة بدون أي خصومات',
      '100 ج.م/ساعة مع خصم كومبو تلقائي 15% على المأكولات ومساحة العمل',
      '200 ج.م/ساعة مع خصم 5%',
      'مجاناً مع أي طلب قهوة',
    ],
    correctIndex: 1,
    explanationEn: 'Coworking tables bill at 100 EGP/hr. When a guest orders cafe food/drinks during the session, the system automatically awards a 15% combo discount!',
    explanationAr: 'تكلفة طاولة العمل 100 ج.م/ساعة. وعند طلب العميل لأي مأكولات أو مشروبات يطبق النظام خصم كومبو 15% تلقائياً!',
  },
  {
    id: 'q2',
    questionEn: 'What is the price and data quota for the High-Speed Coworking WiFi Scratch Card?',
    questionAr: 'ما هي سعة وسعر بطاقة الواي فاي عالية السرعة لمساحة العمل؟',
    optionsEn: [
      '1GB for 20 EGP',
      '5GB for 50 EGP with auto-generated thermal PIN slip',
      '10GB for 150 EGP',
      'Unlimited for 500 EGP',
    ],
    optionsAr: [
      '1 جيجا بسعر 20 ج.م',
      '5 جيجابايت بسعر 50 ج.م مع طباعة كود المرور PIN على إيصال حراري',
      '10 جيجا بسعر 150 ج.م',
      'غير محدود بسعر 500 ج.م',
    ],
    correctIndex: 1,
    explanationEn: 'White Table offers 5GB high-speed vouchers for 50 EGP with instantaneous thermal PIN printing for easy customer access.',
    explanationAr: 'توفر وايت تيبل كروت إنترنت فائق السرعة سعة 5GB بسعر 50 ج.م فقط مع طباعة كود الدخول فوراً على الطابعة الحرارية.',
  },
  {
    id: 'q3',
    questionEn: 'When an order is placed for Turkish Coffee or Smashed Burgers, what happens to the Kitchen Display System (KDS)?',
    questionAr: 'عند تسجيل طلب قهوة تركية أو برجر على الكاشير، ماذا يحدث على شاشة المطبخ (KDS)؟',
    optionsEn: [
      'Nothing until manual entry',
      'A digital KOT ticket appears instantly at the respective station (Kitchen / Barista) with audio alert and table label',
      'It sends an SMS to the chef',
      'It prints on regular A4 paper only',
    ],
    optionsAr: [
      'لا شيء حتى يتم كتابتها يدوياً',
      'تظهر تذكرة KOT فورية في القسم المختص (مطبخ ساخن أو بار القهوة) مع تنبيه ورقم الطاولة',
      'يرسل رسالة نصية للشيف',
      'تطبع على ورق A4 فقط',
    ],
    correctIndex: 1,
    explanationEn: 'The KDS receives instant live tickets routed to either Hot Kitchen or Barista Bar with live timers and status workflow.',
    explanationAr: 'يستقبل نظام KDS التذاكر فورياً ويوزعها تلقائياً على المطبخ الساخن أو بار القهوة مع عدادات وقت الانتظار.',
  },
  {
    id: 'q4',
    questionEn: 'How does White Table POS handle Egyptian VAT compliance on invoices?',
    questionAr: 'كيف يتعامل نظام وايت تيبل مع ضريبة القيمة المضافة والفاتورة الضريبية المصرية؟',
    optionsEn: [
      'It ignores tax completely',
      'It automatically calculates 14% VAT, displays Tax Reg #, and generates a valid cryptographic QR code',
      'Tax is added manually by calculator',
      'Only applies to foreign credit cards',
    ],
    optionsAr: [
      'يتجاهل الضرائب كلياً',
      'يحسب ضريبة القيمة المضافة 14% تلقائياً، ويعرض رقم التسجيل الضريبي، وينشئ رمز QR مشفر معتمد',
      'تضاف الضريبة يدوياً بالآلة الحاسبة',
      'تطبق فقط على البطاقات الأجنبية',
    ],
    correctIndex: 1,
    explanationEn: 'White Table is 100% compliant with Egyptian Tax Authority (ETA) requirements, calculating 14% VAT and printing verified QR codes.',
    explanationAr: 'النظام متوافق كلياً مع متطلبات مصلحة الضرائب المصرية ويحسب 14% ضريبة ويطبع رمز QR المشفر المعتمد.',
  },
  {
    id: 'q5',
    questionEn: 'When a staff member finishes their shift, what is the correct operational procedure?',
    questionAr: 'عند انتهاء وردية عمل الموظف، ما هو الإجراء التشغيلي الصحيح؟',
    optionsEn: [
      'Leave without notice',
      'Punch out on the Time Clock module with their secure PIN code and reconcile cash drawer float if Cashier',
      'Ask the customer for confirmation',
      'Turn off the main electrical breaker',
    ],
    optionsAr: [
      'المغادرة دون تسجيل',
      'تسجيل الانصراف في قسم الحضور والانصراف بالرمز السري PIN ومطابقة رصيد الدرج للكاشير',
      'أخذ موافقة من العميل',
      'فصل قاطع الكهرباء الرئيسي',
    ],
    correctIndex: 1,
    explanationEn: 'Staff punch out securely using their 4-digit PIN code, ensuring payroll hours and overtime are accurately credited.',
    explanationAr: 'يقوم الموظف بتسجيل الانصراف بالرمز السري لضمان احتساب ساعات العمل والأجر الإضافي بدقة ومطابقة العهدة النقدية.',
  },
];

interface TutorialsViewProps {
  currentUser: UserAccount;
  onNavigateTab?: (tab: string) => void;
}

export const TutorialsView: React.FC<TutorialsViewProps> = ({ currentUser, onNavigateTab }) => {
  const { lang, isRTL, t } = useLanguage();

  const [activeModuleId, setActiveModuleId] = useState<string>('pos_masterclass');
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(false);
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [completedStepIds, setCompletedStepIds] = useState<Record<string, boolean>>({ 'pos-1': true });

  // Interactive Simulation Sandbox State
  const [simCartItems, setSimCartItems] = useState<{ name: string; price: number; qty: number }[]>([]);
  const [simTableActive, setSimTableActive] = useState<boolean>(false);
  const [simTableSeconds, setSimTableSeconds] = useState<number>(142);
  const [simKdsStatus, setSimKdsStatus] = useState<'queued' | 'preparing' | 'ready' | 'served'>('queued');
  const [simFeedbackMessage, setSimFeedbackMessage] = useState<string | null>(null);

  // Certification Quiz State
  const [isQuizModalOpen, setIsQuizModalOpen] = useState<boolean>(false);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);
  const [quizScore, setQuizScore] = useState<number>(0);

  // Printable SOP Guide Modal State
  const [isSopModalOpen, setIsSopModalOpen] = useState<boolean>(false);

  const activeModule = useMemo(() => {
    return TUTORIAL_MODULES.find((m) => m.id === activeModuleId) || TUTORIAL_MODULES[0];
  }, [activeModuleId]);

  const activeStep = useMemo(() => {
    return activeModule.steps[activeStepIndex] || activeModule.steps[0];
  }, [activeModule, activeStepIndex]);

  // Video Step Auto-advance simulation timer
  useEffect(() => {
    let timer: any;
    if (isPlaying) {
      const stepDurationMs = 12000 / playbackSpeed;
      const intervalMs = 100;
      const stepIncrement = (intervalMs / stepDurationMs) * 100;

      timer = setInterval(() => {
        setProgressPercent((prev) => {
          if (prev >= 100) {
            // Step finished, advance or pause
            if (activeStepIndex < activeModule.steps.length - 1) {
              setCompletedStepIds((c) => ({ ...c, [activeStep.id]: true }));
              setActiveStepIndex((idx) => idx + 1);
              return 0;
            } else {
              setCompletedStepIds((c) => ({ ...c, [activeStep.id]: true }));
              setIsPlaying(false);
              return 100;
            }
          }
          return prev + stepIncrement;
        });
      }, intervalMs);
    }
    return () => clearInterval(timer);
  }, [isPlaying, playbackSpeed, activeStepIndex, activeModule, activeStep]);

  // Reset step progress on step switch
  const handleSelectStep = (index: number) => {
    setActiveStepIndex(index);
    setProgressPercent(0);
    setIsPlaying(true);
    setSimFeedbackMessage(null);
  };

  const handleSelectModule = (moduleId: string) => {
    setActiveModuleId(moduleId);
    setActiveStepIndex(0);
    setProgressPercent(0);
    setIsPlaying(true);
    setSimFeedbackMessage(null);
  };

  const handleNextStep = () => {
    if (activeStepIndex < activeModule.steps.length - 1) {
      setCompletedStepIds((c) => ({ ...c, [activeStep.id]: true }));
      setActiveStepIndex((idx) => idx + 1);
      setProgressPercent(0);
      setIsPlaying(true);
      setSimFeedbackMessage(null);
    }
  };

  const handlePrevStep = () => {
    if (activeStepIndex > 0) {
      setActiveStepIndex((idx) => idx - 1);
      setProgressPercent(0);
      setIsPlaying(true);
      setSimFeedbackMessage(null);
    }
  };

  // Interactive Sandbox Handlers
  const handleAddSimItem = (name: string, price: number) => {
    setSimCartItems((prev) => {
      const existing = prev.find((i) => i.name === name);
      if (existing) {
        return prev.map((i) => (i.name === name ? { ...i, qty: i.qty + 1 } : i));
      }
      return [...prev, { name, price, qty: 1 }];
    });
    setSimFeedbackMessage(
      lang === 'ar'
        ? `✅ تم إضافة ${name} إلى سلة الطلبات التجريبية!`
        : `✅ Added ${name} to practice cart!`
    );
  };

  const handleClearSimCart = () => {
    setSimCartItems([]);
    setSimFeedbackMessage(lang === 'ar' ? 'تم إفراغ السلة التجريبية' : 'Practice cart cleared');
  };

  const handleToggleSimTable = () => {
    setSimTableActive((prev) => !prev);
    setSimFeedbackMessage(
      !simTableActive
        ? lang === 'ar'
          ? '⏱️ تم بدء عداد طاولة رقم 4 (100 ج.م/ساعة)'
          : '⏱️ Started live timer for Table #04 (100 EGP/hr)'
        : lang === 'ar'
        ? '💵 تم إنهاء جلسة الطاولة وتطبيق خصم الكومبو 15%'
        : '💵 Session completed with 15% Food+Space combo discount'
    );
  };

  const handleAdvanceSimKds = () => {
    const nextStatusMap: Record<string, 'queued' | 'preparing' | 'ready' | 'served'> = {
      queued: 'preparing',
      preparing: 'ready',
      ready: 'served',
      served: 'queued',
    };
    const next = nextStatusMap[simKdsStatus] || 'queued';
    setSimKdsStatus(next);
    setSimFeedbackMessage(
      lang === 'ar'
        ? `👨‍🍳 تم تحديث حالة تذكرة المطبخ إلى: ${next.toUpperCase()}`
        : `👨‍🍳 Updated KOT status to: ${next.toUpperCase()}`
    );
  };

  // Quiz Handling
  const handleSelectQuizAnswer = (qId: string, optionIndex: number) => {
    if (quizSubmitted) return;
    setQuizAnswers((prev) => ({ ...prev, [qId]: optionIndex }));
  };

  const handleSubmitQuiz = () => {
    let score = 0;
    CERTIFICATION_QUIZ.forEach((q) => {
      if (quizAnswers[q.id] === q.correctIndex) {
        score += 1;
      }
    });
    setQuizScore(score);
    setQuizSubmitted(true);
  };

  const handleResetQuiz = () => {
    setQuizAnswers({});
    setQuizSubmitted(false);
    setQuizScore(0);
  };

  return (
    <div className="flex-1 bg-zinc-900/40 min-h-screen p-4 md:p-6 overflow-y-auto font-sans">
      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6 bg-zinc-950 border border-zinc-800 p-5 rounded-2xl shadow-xl">
        <div className="flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-lg shadow-emerald-950/50 shrink-0">
            <GraduationCap size={32} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl md:text-2xl font-black text-white uppercase tracking-tight">
                {lang === 'ar' ? 'أكاديمية التدريب وشروحات الفيديو' : 'White Table Training & Video Academy'}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                HD Interactive 2026
              </span>
            </div>
            <p className="text-xs md:text-sm text-zinc-400 mt-1">
              {lang === 'ar'
                ? 'فيديوهات تدريبية تفاعلية خطوة بخطوة للكاشير، الباريستا، الشيف، وإدارة مساحة العمل والمخزون.'
                : 'Step-by-step interactive simulated training videos for Cashiers, Baristas, Chefs, and Managers.'}
            </p>
          </div>
        </div>

        {/* Quick Action Badges */}
        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          <button
            type="button"
            onClick={() => setIsSopModalOpen(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 text-xs font-bold border border-zinc-700 transition cursor-pointer shadow-xs"
          >
            <BookOpen size={15} className="text-emerald-400" />
            <span>{lang === 'ar' ? 'دليل الإجراءات SOP للطباعة' : 'Printable SOP Cheat Sheet'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setIsQuizModalOpen(true);
              handleResetQuiz();
            }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-black transition cursor-pointer shadow-lg shadow-emerald-950/40"
          >
            <Award size={16} />
            <span>{lang === 'ar' ? 'اختبار شهادة الاعتماد' : 'Take Staff Certification Quiz'}</span>
          </button>
        </div>
      </div>

      {/* Module Selector Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 mb-6">
        {TUTORIAL_MODULES.map((module) => {
          const Icon = module.icon;
          const isSelected = module.id === activeModuleId;
          const completedCount = module.steps.filter((s) => completedStepIds[s.id]).length;
          const isAllCompleted = completedCount === module.steps.length;

          return (
            <button
              key={module.id}
              type="button"
              onClick={() => handleSelectModule(module.id)}
              className={`p-3 rounded-2xl border text-left transition-all duration-150 cursor-pointer flex flex-col justify-between relative overflow-hidden ${
                isSelected
                  ? 'bg-zinc-900 border-emerald-500 shadow-lg shadow-emerald-950/40 ring-1 ring-emerald-500'
                  : 'bg-zinc-950/90 border-zinc-800 hover:bg-zinc-900 hover:border-zinc-700 text-zinc-400'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div
                    className={`p-2 rounded-xl text-white bg-gradient-to-tr ${module.color} shadow-xs`}
                  >
                    <Icon size={16} />
                  </div>
                  <span
                    className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded ${
                      isSelected
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : 'bg-zinc-800 text-zinc-400'
                    }`}
                  >
                    {module.durationMinutes}m
                  </span>
                </div>
                <div className="text-xs font-bold text-white line-clamp-2 leading-snug">
                  {lang === 'ar' ? module.titleAr : module.titleEn}
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between text-[10px] text-zinc-400 border-t border-zinc-800/80 pt-2">
                <span>
                  {completedCount}/{module.steps.length} {lang === 'ar' ? 'خطوات' : 'steps'}
                </span>
                {isAllCompleted ? (
                  <CheckCircle2 size={12} className="text-emerald-400" />
                ) : (
                  <span className="w-1.5 h-1.5 rounded-full bg-zinc-600" />
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Video & Interactive Training Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left / Center 8 Cols: Video Player & Animated Visual Scene */}
        <div className="lg:col-span-8 space-y-4">
          {/* Simulated 1080p Video Screen */}
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl relative flex flex-col">
            {/* Top Video Overlay Bar */}
            <div className="bg-zinc-900/90 px-4 py-2.5 border-b border-zinc-800 flex items-center justify-between text-xs z-10">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
                <span className="text-zinc-300 font-bold truncate">
                  {lang === 'ar' ? activeStep.titleAr : activeStep.titleEn}
                </span>
              </div>
              <div className="flex items-center gap-3 text-zinc-400 font-mono text-[11px] shrink-0">
                <span className="px-2 py-0.5 rounded bg-zinc-800 text-emerald-400 font-bold">
                  {lang === 'ar' ? 'فيديو تدريبي عالي الدقة' : '1080p Interactive Sim'}
                </span>
                <span>
                  {activeStepIndex + 1} / {activeModule.steps.length}
                </span>
              </div>
            </div>

            {/* Simulated Animated Visual Canvas */}
            <div className="relative aspect-video w-full bg-gradient-to-br from-zinc-950 via-zinc-900 to-black p-4 sm:p-6 flex flex-col justify-between overflow-hidden select-none">
              {/* Subtle Grid Lines & Watermark */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

              {/* Top Scene Watermark */}
              <div className="flex items-center justify-between text-zinc-400 text-xs z-10">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span className="font-mono text-[11px] uppercase tracking-wider text-emerald-400">
                    WHITE TABLE POS SYSTEM • SIMULATION ACTIVE
                  </span>
                </div>
                <span className="text-[10px] bg-zinc-900/80 px-2 py-1 rounded border border-zinc-800 font-mono">
                  {activeStep.visualScene}
                </span>
              </div>

              {/* Central Interactive Animated Scene Render */}
              <div className="my-auto py-2 z-10 flex items-center justify-center">
                {activeStep.visualScene === 'pos_order' && (
                  <div className="w-full max-w-lg bg-zinc-900/90 border border-zinc-700/80 rounded-xl p-4 shadow-2xl space-y-3">
                    <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                      <div className="flex items-center gap-2">
                        <Coffee size={18} className="text-emerald-400" />
                        <span className="text-xs font-bold text-white uppercase">POS Menu Selector</span>
                      </div>
                      <span className="text-[10px] text-zinc-400 font-mono">Walk-in Customer</span>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div className="p-2.5 rounded-lg bg-zinc-800/90 border border-emerald-500/50 flex flex-col items-center justify-center text-center animate-pulse">
                        <span className="text-xs font-bold text-white">Turkish Coffee</span>
                        <span className="text-[10px] text-emerald-400 font-mono">55 EGP</span>
                        <span className="text-[9px] text-zinc-400">Single / Double</span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-zinc-800/60 border border-zinc-700 flex flex-col items-center justify-center text-center">
                        <span className="text-xs font-bold text-white">Spanish Latte</span>
                        <span className="text-[10px] text-emerald-400 font-mono">95 EGP</span>
                        <span className="text-[9px] text-zinc-400">Iced / Hot</span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-zinc-800/60 border border-zinc-700 flex flex-col items-center justify-center text-center">
                        <span className="text-xs font-bold text-white">Smashed Burger</span>
                        <span className="text-[10px] text-emerald-400 font-mono">220 EGP</span>
                        <span className="text-[9px] text-zinc-400">Angus Beef</span>
                      </div>
                    </div>

                    <div className="bg-emerald-950/40 border border-emerald-800/50 p-2.5 rounded-lg flex items-center justify-between text-xs text-emerald-300">
                      <span>💡 Simulated Action: Tap product to add to cart & open modifiers</span>
                      <ArrowRight size={14} />
                    </div>
                  </div>
                )}

                {activeStep.visualScene === 'pos_customizer' && (
                  <div className="w-full max-w-lg bg-zinc-900 border border-zinc-700 rounded-xl p-4 shadow-2xl space-y-3">
                    <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                      <span className="text-xs font-bold text-white">Item Modifiers: Spanish Latte</span>
                      <span className="text-[10px] font-mono text-emerald-400">Total: 120 EGP</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2 rounded bg-emerald-950/80 border border-emerald-600 text-emerald-300 font-bold flex items-center justify-between">
                        <span>Double Shot (+25 EGP)</span>
                        <Check size={14} />
                      </div>
                      <div className="p-2 rounded bg-emerald-950/80 border border-emerald-600 text-emerald-300 font-bold flex items-center justify-between">
                        <span>Oat Milk (+25 EGP)</span>
                        <Check size={14} />
                      </div>
                    </div>
                    <div className="p-2 rounded bg-zinc-800 text-[11px] text-zinc-300 font-mono">
                      Special Note: "Extra hot, no caramel drizzle"
                    </div>
                  </div>
                )}

                {activeStep.visualScene === 'pos_checkout' && (
                  <div className="w-full max-w-md bg-zinc-900 border border-emerald-500/80 rounded-xl p-4 shadow-2xl space-y-2.5 text-center">
                    <div className="inline-flex p-2 rounded-full bg-emerald-500/20 text-emerald-400 mb-1">
                      <Receipt size={24} />
                    </div>
                    <div className="text-sm font-black text-white">14% VAT Egyptian Invoice Generated</div>
                    <div className="text-xs text-zinc-400 font-mono">Total Paid: 245.00 EGP via InstaPay</div>
                    <div className="flex items-center justify-center gap-2 pt-2">
                      <span className="px-2.5 py-1 rounded bg-zinc-800 text-[10px] text-emerald-400 font-bold">
                        🖨️ Thermal Receipt Printed
                      </span>
                      <span className="px-2.5 py-1 rounded bg-zinc-800 text-[10px] text-indigo-400 font-bold">
                        🚪 Cash Drawer Fired
                      </span>
                    </div>
                  </div>
                )}

                {activeStep.visualScene === 'table_timer' && (
                  <div className="w-full max-w-lg bg-zinc-900 border border-blue-500/60 rounded-xl p-4 shadow-2xl space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">Table #04 (Quiet Work Zone)</span>
                      <span className="px-2 py-0.5 rounded bg-emerald-500 text-zinc-950 text-[10px] font-black">
                        ACTIVE SESSION
                      </span>
                    </div>
                    <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-between">
                      <div>
                        <div className="text-[10px] text-zinc-400">Guest Name</div>
                        <div className="text-xs font-bold text-white">Karim Mansour</div>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] text-zinc-400">Live Timer (100 EGP/hr)</div>
                        <div className="text-sm font-black text-emerald-400 font-mono">01:42:15 • 170.42 EGP</div>
                      </div>
                    </div>
                  </div>
                )}

                {activeStep.visualScene === 'wifi_card' && (
                  <div className="w-full max-w-md bg-gradient-to-r from-blue-950 to-indigo-950 border border-blue-500/80 rounded-xl p-4 shadow-2xl text-center space-y-2">
                    <div className="text-xs font-black text-blue-300 uppercase tracking-wider">
                      5GB High-Speed WiFi Voucher Pass
                    </div>
                    <div className="p-2.5 rounded-lg bg-zinc-950/80 border border-blue-400/50 font-mono text-sm font-black text-emerald-400 tracking-widest">
                      PIN: WT-8492-5GB
                    </div>
                    <div className="text-[10px] text-zinc-400">
                      Speed: 100 Mbps Dedicated • Price: 50 EGP (Added to table tab)
                    </div>
                  </div>
                )}

                {activeStep.visualScene === 'table_checkout' && (
                  <div className="w-full max-w-md bg-zinc-900 border border-emerald-500 rounded-xl p-4 shadow-2xl space-y-2">
                    <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                      <span className="text-xs font-bold text-white">Table #04 Final Settlement</span>
                      <span className="px-2 py-0.5 rounded bg-emerald-500 text-zinc-950 text-[10px] font-black">
                        15% COMBO DISCOUNT APPLIED
                      </span>
                    </div>
                    <div className="text-xs space-y-1 text-zinc-300 font-mono">
                      <div className="flex justify-between">
                        <span>Desk Time (1h 42m):</span>
                        <span>170.00 EGP</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Turkish Coffee + 5GB WiFi:</span>
                        <span>105.00 EGP</span>
                      </div>
                      <div className="flex justify-between text-emerald-400 font-bold border-t border-zinc-800 pt-1">
                        <span>Total with 15% Combo:</span>
                        <span>233.75 EGP</span>
                      </div>
                    </div>
                  </div>
                )}

                {activeStep.visualScene === 'kds_tickets' && (
                  <div className="w-full max-w-lg bg-zinc-900 border border-orange-500/80 rounded-xl p-4 shadow-2xl space-y-2.5">
                    <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                      <div className="flex items-center gap-2">
                        <ChefHat size={16} className="text-orange-400" />
                        <span className="text-xs font-bold text-white font-mono">KOT #104 • TABLE #04</span>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-orange-600 text-white text-[10px] font-black animate-pulse">
                        QUEUED
                      </span>
                    </div>
                    <div className="text-xs text-zinc-300 space-y-1">
                      <div className="font-bold">• 1x Turkish Coffee (Double, Extra Foam)</div>
                      <div className="font-bold">• 1x Smashed Angus Burger (Medium Well)</div>
                    </div>
                    <div className="text-[10px] text-zinc-400 font-mono">Chef Note: "No Pickles on Burger"</div>
                  </div>
                )}

                {activeStep.visualScene === 'kds_status' && (
                  <div className="w-full max-w-lg bg-zinc-900 border border-emerald-500 rounded-xl p-4 shadow-2xl text-center space-y-2">
                    <div className="text-xs font-bold text-white">Kitchen Order Ticket Lifecycle</div>
                    <div className="flex items-center justify-center gap-2 text-[10px] font-bold">
                      <span className="px-2 py-1 rounded bg-zinc-800 text-zinc-400">1. Queued</span>
                      <span className="text-zinc-600">→</span>
                      <span className="px-2 py-1 rounded bg-amber-950 text-amber-300 border border-amber-600">2. Preparing</span>
                      <span className="text-zinc-600">→</span>
                      <span className="px-2 py-1 rounded bg-emerald-600 text-white font-black">3. Ready</span>
                      <span className="text-zinc-600">→</span>
                      <span className="px-2 py-1 rounded bg-zinc-800 text-zinc-400">4. Served</span>
                    </div>
                  </div>
                )}

                {activeStep.visualScene === 'stock_deduction' && (
                  <div className="w-full max-w-md bg-zinc-900 border border-purple-500/80 rounded-xl p-4 shadow-2xl space-y-2">
                    <div className="text-xs font-bold text-white flex items-center gap-2">
                      <Boxes size={16} className="text-purple-400" />
                      <span>Automated Recipe Stock Deduction</span>
                    </div>
                    <div className="text-xs space-y-1.5 text-zinc-300 font-mono">
                      <div className="flex justify-between bg-zinc-950 p-1.5 rounded">
                        <span>Espresso Beans:</span>
                        <span className="text-rose-400">-18g (Remaining: 14.82 KG)</span>
                      </div>
                      <div className="flex justify-between bg-zinc-950 p-1.5 rounded">
                        <span>Oat Milk:</span>
                        <span className="text-rose-400">-200ml (Remaining: 8.4 Liters)</span>
                      </div>
                    </div>
                  </div>
                )}

                {activeStep.visualScene === 'stock_reorder' && (
                  <div className="w-full max-w-md bg-zinc-900 border border-rose-500 rounded-xl p-4 shadow-2xl space-y-2 text-center">
                    <div className="text-xs font-black text-rose-400 flex items-center justify-center gap-1.5">
                      <AlertCircle size={15} />
                      <span>LOW STOCK THRESHOLD WARNING</span>
                    </div>
                    <div className="text-xs text-zinc-300 font-mono">Specialty Coffee Beans below 5.0 KG</div>
                    <div className="pt-1">
                      <span className="px-3 py-1 rounded bg-emerald-600 text-white text-xs font-bold">
                        + Restock 10 KG from Supplier
                      </span>
                    </div>
                  </div>
                )}

                {activeStep.visualScene === 'time_clock' && (
                  <div className="w-full max-w-md bg-zinc-900 border border-amber-500 rounded-xl p-4 shadow-2xl space-y-2.5 text-center">
                    <div className="text-xs font-bold text-white">Staff Shift Punch Clock</div>
                    <div className="p-2 rounded bg-zinc-950 font-mono text-sm text-emerald-400 font-black">
                      AHMED BARISTA • PIN: **** • SHIFT START: 09:00 AM
                    </div>
                    <span className="inline-block px-2.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                      Fingerprint / PIN Verified
                    </span>
                  </div>
                )}

                {activeStep.visualScene === 'payroll_slip' && (
                  <div className="w-full max-w-md bg-zinc-900 border border-zinc-700 rounded-xl p-3.5 shadow-2xl space-y-1.5 text-xs font-mono">
                    <div className="flex justify-between font-bold text-white border-b border-zinc-800 pb-1">
                      <span>Monthly Payslip (Omar Cashier)</span>
                      <span className="text-emerald-400">NET: 7,450 EGP</span>
                    </div>
                    <div className="text-[11px] text-zinc-400 space-y-0.5">
                      <div className="flex justify-between">
                        <span>Base Hours (176 hrs):</span>
                        <span>6,000 EGP</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Overtime (14 hrs):</span>
                        <span>+750 EGP</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Bonus & Performance Tips:</span>
                        <span>+1,000 EGP</span>
                      </div>
                      <div className="flex justify-between text-rose-400">
                        <span>Social Insurance (11%):</span>
                        <span>-300 EGP</span>
                      </div>
                    </div>
                  </div>
                )}

                {activeStep.visualScene === 'tax_invoice' && (
                  <div className="w-full max-w-md bg-zinc-900 border border-cyan-500 rounded-xl p-4 shadow-2xl space-y-2 text-center">
                    <div className="text-xs font-bold text-cyan-300">
                      Official ETA Tax Invoice #INV-2026-089
                    </div>
                    <div className="text-[11px] text-zinc-300 font-mono">
                      Tax Reg #: 684-219-450 • 14% Egyptian VAT Included
                    </div>
                    <div className="inline-block p-1.5 bg-white rounded-lg text-black font-mono text-[9px] font-black">
                      [ETA Cryptographic QR Verified]
                    </div>
                  </div>
                )}
              </div>

              {/* Subtitles & Audio Narration Overlay */}
              <div className="bg-zinc-950/90 border border-zinc-800/80 p-3 rounded-xl backdrop-blur-md z-10">
                <div className="flex items-start gap-2.5">
                  <div className="p-1 rounded bg-emerald-500/20 text-emerald-400 shrink-0 mt-0.5">
                    {isAudioMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-white">
                      {lang === 'ar' ? activeStep.narrationAr : activeStep.narrationEn}
                    </div>
                    <div className="text-[11px] text-zinc-400 mt-0.5">
                      {lang === 'ar' ? activeStep.descriptionAr : activeStep.descriptionEn}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Video Player Control Bar */}
            <div className="bg-zinc-900 p-3 border-t border-zinc-800 flex flex-col gap-2">
              {/* Progress Slider */}
              <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden relative cursor-pointer">
                <div
                  className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full transition-all duration-100"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    disabled={activeStepIndex === 0}
                    className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 disabled:opacity-30 text-white transition cursor-pointer"
                  >
                    <SkipBack size={14} />
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    {isPlaying ? <Pause size={14} /> : <Play size={14} />}
                    <span>{isPlaying ? (lang === 'ar' ? 'إيقاف' : 'Pause') : (lang === 'ar' ? 'تشغيل' : 'Play')}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleNextStep}
                    disabled={activeStepIndex === activeModule.steps.length - 1}
                    className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 disabled:opacity-30 text-white transition cursor-pointer"
                  >
                    <SkipForward size={14} />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setProgressPercent(0);
                      setIsPlaying(true);
                    }}
                    title={lang === 'ar' ? 'إعادة تشغيل الخطوة' : 'Replay Step'}
                    className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition cursor-pointer"
                  >
                    <RotateCcw size={14} />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  {/* Speed selector */}
                  <div className="flex items-center bg-zinc-800 rounded-lg p-0.5 border border-zinc-700 text-[10px] font-mono">
                    {[1, 1.25, 1.5].map((speed) => (
                      <button
                        key={speed}
                        type="button"
                        onClick={() => setPlaybackSpeed(speed)}
                        className={`px-2 py-0.5 rounded cursor-pointer transition ${
                          playbackSpeed === speed
                            ? 'bg-emerald-600 text-white font-bold'
                            : 'text-zinc-400 hover:text-white'
                        }`}
                      >
                        {speed}x
                      </button>
                    ))}
                  </div>

                  {/* Audio Mute Toggle */}
                  <button
                    type="button"
                    onClick={() => setIsAudioMuted(!isAudioMuted)}
                    className={`p-1.5 rounded-lg border transition cursor-pointer ${
                      isAudioMuted
                        ? 'bg-zinc-800 border-zinc-700 text-zinc-500'
                        : 'bg-zinc-800 border-zinc-700 text-emerald-400'
                    }`}
                  >
                    {isAudioMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Hands-On Practice Sandbox */}
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
                  <Zap size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-tight">
                    {lang === 'ar' ? 'التطبيق العملي التفاعلي (Hands-On Practice)' : 'Hands-On Practice Sandbox'}
                  </h3>
                  <p className="text-xs text-zinc-400">
                    {lang === 'ar' ? activeStep.practicePromptAr : activeStep.practicePromptEn}
                  </p>
                </div>
              </div>

              {simFeedbackMessage && (
                <span className="text-xs font-bold text-emerald-400 animate-pulse bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-800/60">
                  {simFeedbackMessage}
                </span>
              )}
            </div>

            {/* Clickable Practice Sandbox Controls based on course */}
            {activeModule.id === 'pos_masterclass' && (
              <div className="space-y-3">
                <div className="text-xs font-bold text-zinc-300">
                  {lang === 'ar' ? '1. انقر على الأصناف لإضافتها للسلة التجريبية:' : '1. Click items to add to simulated cart:'}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => handleAddSimItem('Turkish Coffee', 55)}
                    className="p-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-left cursor-pointer transition flex flex-col justify-between"
                  >
                    <span className="text-xs font-bold text-white">Turkish Coffee</span>
                    <span className="text-[11px] text-emerald-400 font-mono font-bold mt-1">55 EGP</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleAddSimItem('Spanish Latte', 95)}
                    className="p-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-left cursor-pointer transition flex flex-col justify-between"
                  >
                    <span className="text-xs font-bold text-white">Spanish Latte</span>
                    <span className="text-[11px] text-emerald-400 font-mono font-bold mt-1">95 EGP</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleAddSimItem('Smashed Burger', 220)}
                    className="p-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-left cursor-pointer transition flex flex-col justify-between"
                  >
                    <span className="text-xs font-bold text-white">Smashed Burger</span>
                    <span className="text-[11px] text-emerald-400 font-mono font-bold mt-1">220 EGP</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleAddSimItem('5GB WiFi Pass', 50)}
                    className="p-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-blue-500/60 text-left cursor-pointer transition flex flex-col justify-between"
                  >
                    <span className="text-xs font-bold text-blue-300">5GB WiFi Pass</span>
                    <span className="text-[11px] text-blue-400 font-mono font-bold mt-1">50 EGP</span>
                  </button>
                </div>

                {/* Simulated Cart Display */}
                {simCartItems.length > 0 && (
                  <div className="p-3 bg-zinc-900 rounded-xl border border-zinc-800 flex items-center justify-between">
                    <div className="flex items-center gap-3 text-xs">
                      <span className="font-bold text-white">
                        {simCartItems.length} {lang === 'ar' ? 'أصناف بالسلة' : 'Items in Cart'}:
                      </span>
                      <span className="text-zinc-400">
                        {simCartItems.map((i) => `${i.name} (x${i.qty})`).join(', ')}
                      </span>
                      <span className="text-emerald-400 font-mono font-bold">
                        Total: {simCartItems.reduce((sum, i) => sum + i.price * i.qty, 0)} EGP
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleClearSimCart}
                        className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-[11px] text-zinc-300 cursor-pointer"
                      >
                        {lang === 'ar' ? 'مسح' : 'Clear'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setSimFeedbackMessage(
                            lang === 'ar'
                              ? '🎉 أحسنت! تم إتمام عملية البيع وطباعة الإيصال الضريبي بنجاح!'
                              : '🎉 Great job! Order settled & thermal tax invoice printed!'
                          );
                          setSimCartItems([]);
                        }}
                        className="px-3.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black cursor-pointer shadow-xs"
                      >
                        {lang === 'ar' ? 'محاسبة وطباعة' : 'Checkout & Print'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeModule.id === 'coworking_tables' && (
              <div className="space-y-3">
                <div className="p-3 bg-zinc-900 rounded-xl border border-zinc-800 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-white">Table #04 (Quiet Work Zone)</div>
                    <div className="text-[11px] text-zinc-400 font-mono">
                      Rate: 100 EGP/hr • Status: {simTableActive ? 'Occupied (Running)' : 'Available'}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleToggleSimTable}
                    className={`px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer shadow-xs ${
                      simTableActive
                        ? 'bg-rose-600 hover:bg-rose-500 text-white'
                        : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                    }`}
                  >
                    {simTableActive
                      ? lang === 'ar'
                        ? 'إنهاء الجلسة ومحاسبة الخصم 15%'
                        : 'End Session & Settle 15% Combo'
                      : lang === 'ar'
                      ? 'بدء جلسة عمل جديدة'
                      : 'Start Table Session'}
                  </button>
                </div>
              </div>
            )}

            {activeModule.id === 'kds_kitchen' && (
              <div className="space-y-3">
                <div className="p-3 bg-zinc-900 rounded-xl border border-zinc-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="px-2 py-1 rounded bg-orange-600 text-white text-xs font-bold">
                      KOT #104
                    </span>
                    <span className="text-xs text-zinc-300 font-mono">
                      1x Turkish Coffee + 1x Angus Burger (Status: {simKdsStatus.toUpperCase()})
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleAdvanceSimKds}
                    className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-black transition cursor-pointer shadow-xs"
                  >
                    {lang === 'ar' ? 'تحديث المرحلة التالية' : 'Advance Next Stage'}
                  </button>
                </div>
              </div>
            )}

            {(activeModule.id === 'stock_inventory' ||
              activeModule.id === 'staff_payroll' ||
              activeModule.id === 'invoices_tax') && (
              <div className="p-3 bg-zinc-900 rounded-xl border border-zinc-800 flex items-center justify-between text-xs">
                <span className="text-zinc-300 font-mono">
                  {lang === 'ar'
                    ? 'محاكاة الوظائف الحقيقية متاحة مباشرة في أقسام النظام المعنية.'
                    : 'Interactive simulations are fully linked with the live modules.'}
                </span>
                {onNavigateTab && (
                  <button
                    type="button"
                    onClick={() => {
                      const tabMap: Record<string, string> = {
                        stock_inventory: 'stock',
                        staff_payroll: 'payroll',
                        invoices_tax: 'invoices',
                      };
                      onNavigateTab(tabMap[activeModule.id] || 'pos');
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold cursor-pointer"
                  >
                    <span>{lang === 'ar' ? 'الانتقال للقسم المباشر' : 'Open Live Module'}</span>
                    <ExternalLink size={12} />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right 4 Cols: Step Directory, Key Takeaways & Fast Track Certifications */}
        <div className="lg:col-span-4 space-y-4">
          {/* Chapter Step List */}
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 shadow-xl space-y-3">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5">
              <span className="text-xs font-black text-white uppercase tracking-tight">
                {lang === 'ar' ? 'خطوات الفيديو التدريبي' : 'Video Tutorial Steps'}
              </span>
              <span className="text-[10px] text-emerald-400 font-bold font-mono">
                {activeModule.steps.length} {lang === 'ar' ? 'خطوات' : 'Chapters'}
              </span>
            </div>

            <div className="space-y-1.5">
              {activeModule.steps.map((step, idx) => {
                const isActive = idx === activeStepIndex;
                const isDone = completedStepIds[step.id];

                return (
                  <button
                    key={step.id}
                    type="button"
                    onClick={() => handleSelectStep(idx)}
                    className={`w-full p-2.5 rounded-xl text-left transition-all duration-150 cursor-pointer flex items-center justify-between ${
                      isActive
                        ? 'bg-emerald-600 text-white font-bold shadow-md shadow-emerald-950/40'
                        : 'bg-zinc-900/80 hover:bg-zinc-800/80 text-zinc-300 border border-zinc-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ${
                          isActive
                            ? 'bg-white text-emerald-700'
                            : isDone
                            ? 'bg-emerald-500 text-zinc-950'
                            : 'bg-zinc-800 text-zinc-400'
                        }`}
                      >
                        {isDone ? <Check size={11} strokeWidth={3} /> : idx + 1}
                      </div>
                      <span className="text-xs truncate">
                        {lang === 'ar' ? step.titleAr : step.titleEn}
                      </span>
                    </div>

                    <ChevronRight size={14} className={isActive ? 'text-white' : 'text-zinc-500'} />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Key Takeaways Card */}
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 shadow-xl space-y-3">
            <div className="flex items-center gap-2 text-xs font-black text-emerald-400 uppercase tracking-tight">
              <Sparkles size={16} />
              <span>{lang === 'ar' ? 'النقاط الجوهرية للخطوة' : 'Key Operational Takeaways'}</span>
            </div>

            <ul className="space-y-2 text-xs text-zinc-300">
              {(lang === 'ar' ? activeStep.keyTakeawaysAr : activeStep.keyTakeawaysEn).map(
                (point, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                    <span>{point}</span>
                  </li>
                )
              )}
            </ul>
          </div>

          {/* Quick Staff Fast-Track Certifications */}
          <div className="bg-gradient-to-br from-zinc-950 to-zinc-900 border border-zinc-800 rounded-2xl p-4 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-white uppercase tracking-tight">
                {lang === 'ar' ? 'مسارات التأهيل الوظيفي' : 'Staff Onboarding Paths'}
              </span>
              <Award size={16} className="text-amber-400" />
            </div>

            <div className="space-y-2">
              <div className="p-2.5 rounded-xl bg-zinc-900/90 border border-zinc-800 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white">Cashier & Front Desk</div>
                  <div className="text-[10px] text-zinc-400">Courses 1, 2, and 6</div>
                </div>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                  Recommended
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-zinc-900/90 border border-zinc-800 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white">Barista & Kitchen Chef</div>
                  <div className="text-[10px] text-zinc-400">Courses 3 and 4</div>
                </div>
                <span className="px-2 py-0.5 rounded bg-orange-500/20 text-orange-300 text-[10px] font-bold">
                  Kitchen
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-zinc-900/90 border border-zinc-800 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white">Store Manager & Owner</div>
                  <div className="text-[10px] text-zinc-400">All 6 Courses + Payroll</div>
                </div>
                <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 text-[10px] font-bold">
                  Complete
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Certification Quiz Modal */}
      {isQuizModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="bg-zinc-950 border border-zinc-800 w-full max-w-2xl rounded-2xl p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-500 text-zinc-950 font-black">
                  <Award size={22} />
                </div>
                <div>
                  <h3 className="text-base font-black text-white uppercase">
                    {lang === 'ar'
                      ? 'اختبار الاعتماد الوظيفي لنظام وايت تيبل'
                      : 'White Table Staff Certification Quiz'}
                  </h3>
                  <p className="text-xs text-zinc-400">
                    {lang === 'ar'
                      ? 'أجب على الأسئلة التشغيلية للحصول على شهادة المشغل المعتمد.'
                      : 'Answer 5 operational scenarios to earn your Certified Operator Badge.'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsQuizModalOpen(false)}
                className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Quiz Questions List */}
            <div className="space-y-4">
              {CERTIFICATION_QUIZ.map((q, qIndex) => {
                const selectedOption = quizAnswers[q.id];
                const isCorrect = selectedOption === q.correctIndex;

                return (
                  <div
                    key={q.id}
                    className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-3"
                  >
                    <div className="text-xs font-bold text-white flex items-start gap-2">
                      <span className="px-2 py-0.5 rounded bg-zinc-800 text-emerald-400 font-mono">
                        Q{qIndex + 1}
                      </span>
                      <span>{lang === 'ar' ? q.questionAr : q.questionEn}</span>
                    </div>

                    <div className="space-y-1.5">
                      {(lang === 'ar' ? q.optionsAr : q.optionsEn).map((opt, optIndex) => {
                        const isChosen = selectedOption === optIndex;
                        let optionStyle = 'bg-zinc-950 border-zinc-800 text-zinc-300 hover:bg-zinc-800';

                        if (quizSubmitted) {
                          if (optIndex === q.correctIndex) {
                            optionStyle = 'bg-emerald-950 border-emerald-500 text-emerald-200 font-bold';
                          } else if (isChosen && !isCorrect) {
                            optionStyle = 'bg-rose-950 border-rose-500 text-rose-200';
                          }
                        } else if (isChosen) {
                          optionStyle = 'bg-emerald-600 text-white font-bold border-emerald-500';
                        }

                        return (
                          <button
                            key={optIndex}
                            type="button"
                            onClick={() => handleSelectQuizAnswer(q.id, optIndex)}
                            className={`w-full p-2.5 rounded-lg border text-left text-xs transition cursor-pointer flex items-center justify-between ${optionStyle}`}
                          >
                            <span>{opt}</span>
                            {isChosen && <Check size={14} />}
                          </button>
                        );
                      })}
                    </div>

                    {quizSubmitted && (
                      <div className="text-[11px] text-zinc-400 bg-zinc-950 p-2.5 rounded-lg border border-zinc-800">
                        <span className="font-bold text-emerald-400">
                          {lang === 'ar' ? 'التفسير التشغيلي:' : 'Operational Explanation:'}
                        </span>{' '}
                        {lang === 'ar' ? q.explanationAr : q.explanationEn}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Quiz Result Banner */}
            {quizSubmitted && (
              <div
                className={`p-4 rounded-xl text-center space-y-1 border ${
                  quizScore >= 4
                    ? 'bg-emerald-950/80 border-emerald-500 text-emerald-200'
                    : 'bg-amber-950/80 border-amber-500 text-amber-200'
                }`}
              >
                <div className="text-sm font-black">
                  {quizScore >= 4
                    ? lang === 'ar'
                      ? `🎉 مبروك! اجتزت الاختبار بنجاح بدرجة ${quizScore} من 5!`
                      : `🎉 Congratulations! You passed with ${quizScore}/5!`
                    : lang === 'ar'
                    ? `حصلت على ${quizScore} من 5. يرجى مراجعة الخطوات والمحاولة مرة أخرى.`
                    : `Score: ${quizScore}/5. Review the tutorials and try again.`}
                </div>
                <div className="text-xs">
                  {quizScore >= 4
                    ? lang === 'ar'
                      ? 'تم اعتماد حسابك كمشغل رسمي لنظام وايت تيبل.'
                      : 'You are now certified as a White Table POS & Coworking Operator.'
                    : ''}
                </div>
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              {!quizSubmitted ? (
                <button
                  type="button"
                  onClick={handleSubmitQuiz}
                  disabled={Object.keys(quizAnswers).length < CERTIFICATION_QUIZ.length}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white text-xs font-black transition cursor-pointer shadow-lg shadow-emerald-950/40"
                >
                  {lang === 'ar' ? 'تسليم الإجابات وتقييم النتيجة' : 'Submit Answers'}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleResetQuiz}
                  className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold transition cursor-pointer"
                >
                  {lang === 'ar' ? 'إعادة الاختبار' : 'Retake Quiz'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Printable SOP Cheat Sheet Modal */}
      {isSopModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="bg-zinc-950 border border-zinc-800 w-full max-w-3xl rounded-2xl p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-zinc-800 text-emerald-400">
                  <Printer size={22} />
                </div>
                <div>
                  <h3 className="text-base font-black text-white uppercase">
                    {lang === 'ar' ? 'دليل الإجراءات القياسية السريعة (SOP)' : 'Standard Operating Procedures (SOP)'}
                  </h3>
                  <p className="text-xs text-zinc-400">
                    {lang === 'ar'
                      ? 'ملخص تشغيلي رسمي لطاقم العمل والكاشير للرجوع الفوري والطباعة.'
                      : 'Quick-reference guide for daily cash drawer, table booking, and kitchen ops.'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition cursor-pointer"
                >
                  <Printer size={14} />
                  <span>{lang === 'ar' ? 'طباعة' : 'Print SOP'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsSopModalOpen(false)}
                  className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* SOP Content Table */}
            <div className="space-y-4 text-xs">
              <div className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 space-y-2">
                <div className="font-bold text-emerald-400 uppercase">
                  1. POS Cashier Opening & Shift Rules
                </div>
                <p className="text-zinc-300 leading-relaxed">
                  • Verify 500 EGP starting cash float in the RJ11 register drawer before first order.
                  <br />• Every customer must receive a printed thermal slip with 14% VAT details.
                  <br />• For InstaPay transactions, verify transfer confirmation before closing ticket.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 space-y-2">
                <div className="font-bold text-blue-400 uppercase">
                  2. Coworking Desks (Tables 1-14) Rules
                </div>
                <p className="text-zinc-300 leading-relaxed">
                  • Hourly billing rate is strictly 100 EGP/hour.
                  <br />• 5GB High-Speed WiFi Cards are priced at 50 EGP and generate a unique PIN.
                  <br />• Automatic 15% Combo Discount is applied whenever a member orders cafe food.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 space-y-2">
                <div className="font-bold text-orange-400 uppercase">
                  3. Kitchen & Barista KDS Protocols
                </div>
                <p className="text-zinc-300 leading-relaxed">
                  • Advance tickets to "Preparing" within 60 seconds of receipt.
                  <br />• Beverage target preparation time is 3–5 minutes; Food target is 10–12 minutes.
                  <br />• Mark tickets "Ready" immediately to alert servers for table delivery.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
