import React, { useState, useMemo, useEffect } from 'react';
import {
  Search,
  Plus,
  Minus,
  Trash2,
  Receipt as ReceiptIcon,
  User,
  CreditCard,
  Banknote,
  Smartphone,
  Wallet,
  Sparkles,
  AlertTriangle,
  Armchair,
  CheckCircle2,
  Tag,
  Star,
  Gift,
  DollarSign,
  Printer,
  ArrowLeft,
  ArrowRight,
  ChevronRight,
  ChevronLeft,
  LayoutGrid,
  ListFilter,
  Zap,
  Clock,
  Layers,
  ShoppingBag,
} from 'lucide-react';
import { MenuItem, MenuItemAddon, CartItem, Customer, Desk, Order } from '../../types';
import { ALL_CATEGORIES } from '../../data/seedData';
import { CategoryIcon } from '../CategoryIcon';
import { ItemCustomizerModal } from './ItemCustomizerModal';
import { ReceiptModal } from './ReceiptModal';
import { getProductImage } from '../../utils/productImages';
import {
  getHardwareSettings,
  sendRawBytesToHardware,
  buildEscPosCustomerReceipt,
  buildEscPosKitchenTicket,
  buildEscPosBothTickets,
  kickCashDrawer,
  broadcastCustomerDisplay,
} from '../../services/hardwareService';
import {
  printDirectHtml,
  buildCustomerReceiptHtml,
} from '../../services/thermalPrintEngine';
import confetti from 'canvas-confetti';
import { useLanguage } from '../../i18n/LanguageContext';

interface POSViewProps {
  menu: MenuItem[];
  addons: MenuItemAddon[];
  customers: Customer[];
  desks: Desk[];
  onPlaceOrder: (orderData: {
    items: CartItem[];
    customerId: string;
    deskId?: string;
    discountPercent: number;
    pointsRedeemed?: number;
    pointsDiscountEGP?: number;
    paymentMethod: 'Cash' | 'Credit Card' | 'InstaPay / Wallet' | 'Member Tab';
    cashTendered?: number;
    changeDue?: number;
  }) => Order;
  onOpenNewCustomerModal: () => void;
  notify: (title: string, message?: string, type?: 'success' | 'warning' | 'info') => void;
}

export const POSView: React.FC<POSViewProps> = ({
  menu,
  addons,
  customers,
  desks,
  onPlaceOrder,
  onOpenNewCustomerModal,
  notify,
}) => {
  const { lang, t, formatCurrency } = useLanguage();
  const isRtl = lang === 'ar';

  // Navigation & Category Workflow State
  // 'categories_hub': Step 1 - Browse all sections / category cards
  // 'section_items': Step 2 - Showing items within the chosen category section
  // 'flat_catalog': Flat list of all items with top filters
  const [navMode, setNavMode] = useState<'categories_hub' | 'section_items' | 'flat_catalog'>('categories_hub');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Cart & Checkout State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState(customers[0]?.id || 'c-walkin');
  const [selectedDeskId, setSelectedDeskId] = useState<string>('');
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [redeemedPointsBlocks, setRedeemedPointsBlocks] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Credit Card' | 'InstaPay / Wallet' | 'Member Tab'>('Cash');
  const [customCashTendered, setCustomCashTendered] = useState<number | null>(null);
  const [customizingItem, setCustomizingItem] = useState<MenuItem | null>(null);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [isFastCheckingOut, setIsFastCheckingOut] = useState(false);

  const currentCustomer = customers.find((c) => c.id === selectedCustomerId);
  const availablePoints = currentCustomer?.points || 0;
  const maxRedeemableBlocks = Math.floor(availablePoints / 500);

  // Category translation and description helper
  const getCategoryMeta = (cat: string) => {
    const arMap: Record<string, { label: string; sub: string; color: string }> = {
      'All': { label: 'كل المنتجات', sub: 'عرض كامل القائمة', color: 'emerald' },
      'Hot Drinks': { label: 'مشروبات ساخنة', sub: 'قهوة مختصة، تركي، وإسبريسو', color: 'amber' },
      'Iced Coffee': { label: 'قهوة مثلجة وباردة', sub: 'آيس كراميل، كولد برو، وسبانش', color: 'blue' },
      'Matcha Bar': { label: 'ماتشا وشاي فاخر', sub: 'ماتشا يابانية عضوية وشاي عالي الجودة', color: 'emerald' },
      'More Hot Drinks': { label: 'مشروبات دافئة وأعشاب', sub: 'هوت شوكليت وأعشاب مريحة', color: 'orange' },
      'Kombucha & Kefir': { label: 'كمبوتشا وكفير صحي', sub: 'مشروبات مخمرة معززة للمناعة', color: 'teal' },
      'Juice': { label: 'عصائر طازجة', sub: 'عصائر فريش وطبيعية 100%', color: 'yellow' },
      'Smoothie Bowls': { label: 'أطباق سموذي وبولز', sub: 'بولز أساي وفواكه غنية بالطاقة', color: 'purple' },
      'Smoothies': { label: 'سموذي منعش', sub: 'ميكسات فواكه وزبادي لذيذة', color: 'pink' },
      'Mixed Soda': { label: 'صودا وموخيتو', sub: 'مشروبات منعشة بنكهات مبتكرة', color: 'cyan' },
      'Soft Drinks': { label: 'مشروبات غازية ومياه', sub: 'مياه معدنية ومشروبات معلبة', color: 'zinc' },
      'Omelette & Scramble': { label: 'أومليت وبيض مخفوق', sub: 'إفطار بروتين ساخن وطازج', color: 'amber' },
      'Bowls & Plates': { label: 'أطباق وبولز رئيسية', sub: 'وجبات غنية ومغذية متوازنة', color: 'emerald' },
      'Breakfast Toasts': { label: 'توست وساندوتش فطور', sub: 'أفوكادو توست وتوست مقرمش', color: 'lime' },
      'Benedicts & Eggs': { label: 'بيض بينديكت مميز', sub: 'إفطار كلاسيكي مع صوص هولنديز', color: 'yellow' },
      'Appetizers': { label: 'مقبلات وسناكس', sub: 'بطاطس مقرمشة، ناتشوز وموزاريلا', color: 'rose' },
      'Salad': { label: 'سلطات صحية وطازجة', sub: 'سيزر وخضار طازج بصوصات خفيفة', color: 'green' },
      'Fajita': { label: 'فاهيتا ساخنة', sub: 'فاهيتا لحم ودجاج مع توابل مكسيكية', color: 'red' },
      'Burgers': { label: 'برجر وسماش سبيشيال', sub: 'برجر لحم بلدي بخبز بريوش طازج', color: 'amber' },
      'Quesadillas': { label: 'كاساديا مكسيكية', sub: 'تورتيلا محشوة جبن ومشاوي', color: 'orange' },
      'Tacos': { label: 'تاكو بيريا مكسيكي', sub: 'تاكو مقرمش مع لحم مطهو ببطء', color: 'red' },
      'Specialty Coffee': { label: 'قهوة مختصة', sub: 'محاصيل مختارة وتحضير يدوي', color: 'amber' },
      'Signature Burgers': { label: 'برجر مميز', sub: 'سماش وبريوش فاخر', color: 'orange' },
      'Birria Tacos': { label: 'تاكو بيريا', sub: 'لحم مطهو بالبهارات المكسيكية', color: 'red' },
      'Bakery & Dessert': { label: 'مخبوزات وحلويات', sub: 'كرواسون، كوكيز وكيك طازج', color: 'amber' },
      'Breakfast & Bowls': { label: 'فطور وبولز', sub: 'وجبات بداية اليوم المتكاملة', color: 'yellow' },
      'Coworking Passes': { label: 'باقات مساحة العمل', sub: 'باقات يومية وشهرية مريحة', color: 'indigo' },
    };

    const enMap: Record<string, { label: string; sub: string; color: string }> = {
      'All': { label: 'All Menu Items', sub: 'Browse complete catalog', color: 'emerald' },
      'Hot Drinks': { label: 'Hot Drinks', sub: 'Specialty espresso, Turkish & brews', color: 'amber' },
      'Iced Coffee': { label: 'Iced & Cold Brew', sub: 'Iced lattes, cold brews & frappes', color: 'blue' },
      'Matcha Bar': { label: 'Matcha Bar & Tea', sub: 'Ceremonial grade matcha & blends', color: 'emerald' },
      'More Hot Drinks': { label: 'More Warm Drinks', sub: 'Hot chocolate & herbal teas', color: 'orange' },
      'Kombucha & Kefir': { label: 'Kombucha & Kefir', sub: 'Probiotic wellness drinks', color: 'teal' },
      'Juice': { label: 'Fresh Juices', sub: '100% freshly pressed fruits', color: 'yellow' },
      'Smoothie Bowls': { label: 'Smoothie Bowls', sub: 'Acai & nutrient power bowls', color: 'purple' },
      'Smoothies': { label: 'Fresh Smoothies', sub: 'Real fruit & yogurt blends', color: 'pink' },
      'Mixed Soda': { label: 'Mixed Soda & Mojitos', sub: 'Sparkling fruit coolers', color: 'cyan' },
      'Soft Drinks': { label: 'Soft Drinks & Water', sub: 'Mineral water & canned beverages', color: 'zinc' },
      'Omelette & Scramble': { label: 'Omelette & Scrambled', sub: 'Fresh organic egg skillets', color: 'amber' },
      'Bowls & Plates': { label: 'Bowls & Mains', sub: 'Hearty protein bowls & plates', color: 'emerald' },
      'Breakfast Toasts': { label: 'Breakfast Toasts', sub: 'Artisan sourdough & avocado toasts', color: 'lime' },
      'Benedicts & Eggs': { label: 'Benedicts & Eggs', sub: 'Poached eggs & hollandaise', color: 'yellow' },
      'Appetizers': { label: 'Appetizers & Snacks', sub: 'Crispy fries, nachos & dips', color: 'rose' },
      'Salad': { label: 'Fresh Salads', sub: 'Organic farm-fresh bowls', color: 'green' },
      'Fajita': { label: 'Sizzling Fajitas', sub: 'Grilled meats with peppers & dip', color: 'red' },
      'Burgers': { label: 'Signature Burgers', sub: 'Fresh smashed patties on brioche', color: 'amber' },
      'Quesadillas': { label: 'Mexican Quesadillas', sub: 'Toasted tortillas with melted cheese', color: 'orange' },
      'Tacos': { label: 'Artisan Tacos', sub: 'Birria beef & crispy chicken tacos', color: 'red' },
    };

    if (lang === 'ar') {
      return arMap[cat] || { label: cat, sub: 'تشكيلة مميزة من الأصناف', color: 'emerald' };
    }
    return enMap[cat] || { label: cat, sub: 'Curated selection of items', color: 'emerald' };
  };

  // Group real categories from seed/menu (excluding 'All')
  const categoriesList = useMemo(() => {
    const cats = ALL_CATEGORIES.filter((c) => c !== 'All');
    return cats.map((cat) => {
      const itemsInCat = menu.filter((m) => m.category === cat);
      const minPrice = itemsInCat.length > 0 ? Math.min(...itemsInCat.map((i) => i.price)) : 0;
      return {
        name: cat,
        meta: getCategoryMeta(cat),
        count: itemsInCat.length,
        minPrice,
      };
    });
  }, [menu, lang]);

  // Filtered menu items
  const filteredItems = useMemo(() => {
    return menu.filter((item) => {
      // If user typed a search query, search globally or in current category
      const matchesSearch =
        !searchQuery ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.ingredients && item.ingredients.toLowerCase().includes(searchQuery.toLowerCase()));

      if (searchQuery) {
        return matchesSearch;
      }

      if (navMode === 'flat_catalog') {
        return selectedCategory === 'All' || item.category === selectedCategory;
      }

      // In section_items mode
      return item.category === selectedCategory;
    });
  }, [menu, selectedCategory, searchQuery, navMode]);

  // Calculations
  const subtotal = cart.reduce((sum, item) => {
    const addonsSum = item.selectedAddons.reduce((s, a) => s + a.price, 0);
    return sum + (item.unitPrice + addonsSum) * item.qty;
  }, 0);

  const percentDiscountAmount = (subtotal * discountPercent) / 100;
  const actualRedeemedBlocks = Math.min(redeemedPointsBlocks, maxRedeemableBlocks);
  const loyaltyPointsUsed = actualRedeemedBlocks * 500;
  const loyaltyDiscountEGP = actualRedeemedBlocks * 50;

  const totalDiscount = percentDiscountAmount + loyaltyDiscountEGP;
  const taxableAmount = Math.max(0, subtotal - totalDiscount);
  const tax = taxableAmount * 0.14; // 14% Egyptian VAT
  const grandTotal = taxableAmount + tax;

  // Effective cash tendered and change calculation
  const effectiveCashTendered = customCashTendered !== null ? customCashTendered : Math.ceil(grandTotal);
  const changeDue = Math.max(0, effectiveCashTendered - grandTotal);

  // Broadcast to Customer-Facing Display whenever cart changes
  useEffect(() => {
    if (cart.length === 0) {
      broadcastCustomerDisplay({ type: 'IDLE' });
    } else {
      broadcastCustomerDisplay({
        type: 'CART_UPDATE',
        items: cart.map((i) => {
          const addonsSum = i.selectedAddons.reduce((s, a) => s + a.price, 0);
          return {
            name: `${i.name}${i.size ? ` (${i.size})` : ''}`,
            qty: i.qty,
            price: (i.unitPrice + addonsSum) * i.qty,
          };
        }),
        subtotal,
        discount: totalDiscount,
        tax,
        total: grandTotal,
      });
    }
  }, [cart, subtotal, totalDiscount, tax, grandTotal]);

  // Click category in Step 1 to enter Step 2
  const handleSelectCategory = (catName: string) => {
    setSelectedCategory(catName);
    setNavMode('section_items');
    setSearchQuery('');
  };

  // Back to Step 1 (Categories Hub)
  const handleBackToCategories = () => {
    setNavMode('categories_hub');
    setSelectedCategory('All');
    setSearchQuery('');
  };

  // Click on an item in the menu
  const handleItemClick = (item: MenuItem) => {
    if (item.stock <= 0) {
      notify(
        lang === 'ar' ? 'نفد من المخزون' : 'Out of Stock',
        `${item.name} ${lang === 'ar' ? 'غير متوفر حالياً.' : 'is currently out of stock.'}`,
        'warning'
      );
      return;
    }

    // If item has sizes or applicable addons, open customizer modal
    if (
      item.hasSizes ||
      item.category.includes('Burger') ||
      item.category.includes('Taco') ||
      item.category.includes('Quesadilla') ||
      item.category.includes('Drinks') ||
      item.category.includes('Coffee') ||
      item.category.includes('Matcha')
    ) {
      setCustomizingItem(item);
    } else {
      // Direct quick add
      addToCart({
        cartId: Math.random().toString(36).slice(2, 10),
        itemId: item.id,
        name: item.name,
        category: item.category,
        unitPrice: item.price,
        qty: 1,
        selectedAddons: [],
      });
    }
  };

  // Quick 1-tap add without modal (single size/base)
  const handleQuickAdd = (e: React.MouseEvent, item: MenuItem) => {
    e.stopPropagation();
    if (item.stock <= 0) return;
    addToCart({
      cartId: Math.random().toString(36).slice(2, 10),
      itemId: item.id,
      name: item.name,
      category: item.category,
      unitPrice: item.price,
      qty: 1,
      selectedAddons: [],
    });
  };

  const addToCart = (cartItem: CartItem) => {
    setCart((prev) => {
      const existingIndex = prev.findIndex(
        (i) =>
          i.itemId === cartItem.itemId &&
          i.size === cartItem.size &&
          i.note === cartItem.note &&
          JSON.stringify(i.selectedAddons) === JSON.stringify(cartItem.selectedAddons)
      );

      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].qty += cartItem.qty;
        return updated;
      }
      return [...prev, cartItem];
    });

    notify(lang === 'ar' ? 'أضيف إلى السلة' : 'Added to Order', cartItem.name, 'success');
  };

  const updateQuantity = (cartId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.cartId === cartId) {
            const newQty = item.qty + delta;
            return newQty > 0 ? { ...item, qty: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const removeItem = (cartId: string) => {
    setCart((prev) => prev.filter((i) => i.cartId !== cartId));
  };

  const clearCart = () => {
    setCart([]);
    setRedeemedPointsBlocks(0);
    setCustomCashTendered(null);
  };

  // Standard checkout that opens the receipt modal
  const handleCheckout = async () => {
    if (cart.length === 0) return;

    try {
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.7 },
      });
    } catch {
      // ignore
    }

    const order = onPlaceOrder({
      items: cart,
      customerId: selectedCustomerId,
      deskId: selectedDeskId || undefined,
      discountPercent,
      pointsRedeemed: loyaltyPointsUsed,
      pointsDiscountEGP: loyaltyDiscountEGP,
      paymentMethod,
      cashTendered: paymentMethod === 'Cash' ? effectiveCashTendered : undefined,
      changeDue: paymentMethod === 'Cash' ? changeDue : undefined,
    });

    const hardwareSettings = getHardwareSettings();

    // Broadcast completed order to customer display
    broadcastCustomerDisplay({
      type: 'ORDER_COMPLETE',
      total: order.total,
      orderNumber: order.id.slice(0, 8).toUpperCase(),
      pointsEarned: Math.floor(order.total / 100),
    });

    // Auto kick cash drawer if enabled and paying in Cash
    if (hardwareSettings.autoKickDrawerOnCash && paymentMethod === 'Cash') {
      kickCashDrawer(hardwareSettings);
    }

    // Auto print ESC/POS receipts based on receiptPrintMode
    if (hardwareSettings.autoPrintReceipt && hardwareSettings.printerType !== 'system') {
      try {
        let rawBytes: Uint8Array;
        if (hardwareSettings.receiptPrintMode === 'both_separate') {
          rawBytes = buildEscPosBothTickets(order, currentCustomer, hardwareSettings);
        } else if (hardwareSettings.receiptPrintMode === 'kitchen_only') {
          rawBytes = buildEscPosKitchenTicket(order, hardwareSettings);
        } else {
          rawBytes = buildEscPosCustomerReceipt(order, currentCustomer, hardwareSettings);
        }
        sendRawBytesToHardware(rawBytes, hardwareSettings);
      } catch (e) {
        console.warn('Auto thermal print notice:', e);
      }
    }

    setCompletedOrder(order);
    setCart([]);
    setRedeemedPointsBlocks(0);
    setCustomCashTendered(null);
    notify(
      lang === 'ar' ? 'تم تأكيد الطلب' : 'Order Settled',
      `${lang === 'ar' ? 'طلب رقم' : 'Order'} #${order.id.slice(0, 6)} - ${paymentMethod}`,
      'success'
    );
  };

  // 1-Click Fast Pay & 80mm Print
  const handleFastPayAndPrint = async () => {
    if (cart.length === 0 || isFastCheckingOut) return;
    setIsFastCheckingOut(true);

    try {
      const order = onPlaceOrder({
        items: cart,
        customerId: selectedCustomerId,
        deskId: selectedDeskId || undefined,
        discountPercent,
        pointsRedeemed: loyaltyPointsUsed,
        pointsDiscountEGP: loyaltyDiscountEGP,
        paymentMethod,
        cashTendered: paymentMethod === 'Cash' ? effectiveCashTendered : undefined,
        changeDue: paymentMethod === 'Cash' ? changeDue : undefined,
      });

      const hardwareSettings = getHardwareSettings();

      if (hardwareSettings.autoKickDrawerOnCash && paymentMethod === 'Cash') {
        kickCashDrawer(hardwareSettings);
      }

      // Dispatch 80mm thermal receipt directly
      const html = buildCustomerReceiptHtml(order, currentCustomer, hardwareSettings, {
        fontSize: hardwareSettings.fontSizePreference || 'large_obvious',
        lang,
      });
      await printDirectHtml(html);

      setCart([]);
      setRedeemedPointsBlocks(0);
      setCustomCashTendered(null);

      notify(
        lang === 'ar' ? 'تم السداد والطباعة الفورية (80mm)' : 'Settled & Printed (80mm)',
        `#${order.id.slice(0, 6)} · ${formatCurrency(order.total)}`,
        'success'
      );
    } catch (err) {
      console.error('Fast checkout error:', err);
    } finally {
      setIsFastCheckingOut(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Top Header & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-zinc-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black text-zinc-950 tracking-tight flex items-center gap-2">
              <ShoppingBag size={20} className="text-emerald-600" />
              {t.pos}
            </h2>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
              {lang === 'ar' ? 'طابعة 80mm جاهزة' : '80mm Thermal Ready'}
            </span>
          </div>
          <p className="text-xs text-zinc-500 mt-0.5">
            {lang === 'ar'
              ? 'تصفح الأقسام خطوة بخطوة، مع كاش سريع وحساب الفكة التلقائي وطباعة 80 مم فورية'
              : 'Browse sections step-by-step with instant change calculator & 1-click 80mm thermal print'}
          </p>
        </div>

        {/* Search & Navigation Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Mode Switcher */}
          <div className="flex items-center bg-zinc-100 p-1 rounded-xl border border-zinc-200">
            <button
              onClick={() => {
                setNavMode('categories_hub');
                setSelectedCategory('All');
                setSearchQuery('');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                navMode === 'categories_hub' || navMode === 'section_items'
                  ? 'bg-white text-zinc-950 shadow-2xs'
                  : 'text-zinc-500 hover:text-zinc-900'
              }`}
            >
              <Layers size={13} />
              <span>{lang === 'ar' ? 'الأقسام (خطوة بخطوة)' : 'Category Hub'}</span>
            </button>

            <button
              onClick={() => {
                setNavMode('flat_catalog');
                setSelectedCategory('All');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                navMode === 'flat_catalog'
                  ? 'bg-white text-zinc-950 shadow-2xs'
                  : 'text-zinc-500 hover:text-zinc-900'
              }`}
            >
              <LayoutGrid size={13} />
              <span>{lang === 'ar' ? 'كل الأصناف' : 'All Items'}</span>
            </button>
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-64">
            <Search size={15} className="absolute start-3 top-2.5 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (e.target.value && navMode === 'categories_hub') {
                  setNavMode('section_items');
                }
              }}
              placeholder={lang === 'ar' ? 'ابحث عن أي صنف أو مشروب...' : t.searchMenu}
              className="w-full ps-9 pe-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-emerald-600 focus:bg-white focus:ring-1 focus:ring-emerald-600 transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute end-2.5 top-2.5 text-xs text-zinc-400 hover:text-zinc-600 cursor-pointer"
              >
                {lang === 'ar' ? 'مسح' : 'Clear'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* STEP 1: CATEGORY SECTIONS HUB (The requested section workflow) */}
      {navMode === 'categories_hub' && !searchQuery && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-black">1</span>
              <h3 className="text-sm font-bold text-zinc-950">
                {lang === 'ar' ? 'اختر قسم القائمة (الخطوة الأولى)' : 'Select Menu Section (Step 1)'}
              </h3>
            </div>
            <span className="text-xs text-zinc-400 font-medium">
              {categoriesList.length} {lang === 'ar' ? 'قسم متاح' : 'sections available'}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3.5">
            {categoriesList.map((cat) => {
              return (
                <div
                  key={cat.name}
                  onClick={() => handleSelectCategory(cat.name)}
                  className="group relative bg-white hover:bg-emerald-50/40 border border-zinc-200 hover:border-emerald-500 rounded-2xl p-4 transition-all duration-150 flex flex-col justify-between shadow-2xs hover:shadow-md cursor-pointer text-start"
                >
                  <div className="space-y-2.5">
                    {/* Top Icon Badge */}
                    <div className="w-10 h-10 rounded-xl bg-zinc-100 group-hover:bg-emerald-600 group-hover:text-white text-zinc-800 flex items-center justify-center transition-colors">
                      <CategoryIcon category={cat.name} size={20} />
                    </div>

                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-zinc-950 group-hover:text-emerald-950 leading-tight">
                        {cat.meta.label}
                      </h4>
                      <p className="text-[10px] text-zinc-500 line-clamp-2 mt-1 leading-snug">
                        {cat.meta.sub}
                      </p>
                    </div>
                  </div>

                  {/* Bottom Stats */}
                  <div className="mt-3 pt-2.5 border-t border-zinc-100 flex items-center justify-between text-[10px]">
                    <span className="font-bold text-zinc-600 bg-zinc-100 group-hover:bg-emerald-100 group-hover:text-emerald-800 px-2 py-0.5 rounded-md transition">
                      {cat.count} {lang === 'ar' ? 'أصناف' : 'items'}
                    </span>
                    {cat.minPrice > 0 && (
                      <span className="font-mono text-zinc-400 group-hover:text-emerald-700 font-semibold">
                        {lang === 'ar' ? `من ${cat.minPrice}` : `From ${cat.minPrice}`} EGP
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* STEP 2: SECTION ITEMS OR FLAT CATALOG & CART GRID */}
      {(navMode === 'section_items' || navMode === 'flat_catalog' || searchQuery) && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Section Header & Menu Items Grid */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-4">
            {/* Step 2 Section Header & Quick Switcher Strip */}
            <div className="bg-white border border-zinc-200 rounded-2xl p-4 shadow-2xs space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                {/* Back to Categories Button */}
                {navMode === 'section_items' && (
                  <button
                    onClick={handleBackToCategories}
                    className="px-3 py-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border border-zinc-200 shadow-2xs"
                  >
                    {isRtl ? <ArrowRight size={14} /> : <ArrowLeft size={14} />}
                    <span>{lang === 'ar' ? 'الرجوع للأقسام' : 'All Sections'}</span>
                  </button>
                )}

                {/* Current Section Title */}
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-emerald-600 text-white">
                    <CategoryIcon category={selectedCategory} size={15} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-zinc-950">
                      {searchQuery
                        ? `${lang === 'ar' ? 'نتائج البحث عن:' : 'Search results for:'} "${searchQuery}"`
                        : getCategoryMeta(selectedCategory).label}
                    </h3>
                    <span className="text-[10px] text-zinc-500">
                      {filteredItems.length} {lang === 'ar' ? 'صنف متاح' : 'items available'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Fast Horizontal Category Switcher Strip */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 scrollbar-none border-t border-zinc-100">
                <button
                  onClick={() => {
                    setSelectedCategory('All');
                    if (navMode === 'section_items') setNavMode('flat_catalog');
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition border cursor-pointer ${
                    selectedCategory === 'All'
                      ? 'bg-emerald-600 border-emerald-600 text-white shadow-2xs'
                      : 'bg-zinc-50 border-zinc-200 text-zinc-700 hover:bg-zinc-100'
                  }`}
                >
                  {t.allCategories}
                </button>
                {ALL_CATEGORIES.filter((c) => c !== 'All').map((cat) => {
                  const isSelected = selectedCategory === cat;
                  return (
                    <button
                      key={cat}
                      onClick={() => {
                        setSelectedCategory(cat);
                        setNavMode('section_items');
                        setSearchQuery('');
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 border cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-600 border-emerald-600 text-white shadow-2xs'
                          : 'bg-zinc-50 border-zinc-200 text-zinc-700 hover:bg-zinc-100'
                      }`}
                    >
                      <CategoryIcon category={cat} size={13} />
                      <span>{getCategoryMeta(cat).label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Menu Items Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3.5">
              {filteredItems.map((item) => {
                const isLowStock = item.stock <= item.threshold;
                const isOutOfStock = item.stock <= 0;
                const itemImage = getProductImage(item);

                return (
                  <div
                    key={item.id}
                    onClick={() => handleItemClick(item)}
                    className={`group relative bg-white border border-zinc-200 rounded-2xl overflow-hidden transition-all duration-150 flex flex-col justify-between hover:border-emerald-600 hover:shadow-md cursor-pointer ${
                      isOutOfStock ? 'opacity-40 pointer-events-none' : ''
                    }`}
                  >
                    {/* Top Product Picture */}
                    <div className="relative h-28 sm:h-32 w-full overflow-hidden bg-zinc-100">
                      <img
                        src={itemImage}
                        alt={item.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

                      {/* Category Icon & Badges Floating Over Photo */}
                      <div className="absolute top-2 start-2 flex items-center gap-1">
                        <div className="p-1 rounded-lg bg-black/75 text-white backdrop-blur-xs">
                          <CategoryIcon category={item.category} size={12} />
                        </div>
                        {item.badge && (
                          <span className="px-1.5 py-0.5 text-[9px] font-bold rounded-md bg-emerald-500 text-white shadow-xs">
                            {item.badge}
                          </span>
                        )}
                      </div>

                      <div className="absolute top-2 end-2 flex items-center gap-1">
                        {item.hasSizes && (
                          <span className="px-1.5 py-0.5 text-[9px] font-bold rounded-md bg-black/80 text-white backdrop-blur-xs">
                            {t.size}
                          </span>
                        )}
                        {isLowStock && (
                          <span className="px-1.5 py-0.5 text-[9px] font-bold rounded-md bg-rose-600 text-white flex items-center gap-0.5">
                            <AlertTriangle size={10} /> {lang === 'ar' ? 'منخفض' : 'Low'}
                          </span>
                        )}
                      </div>

                      {/* 1-Tap Quick Add Button on Hover/Mobile */}
                      <button
                        type="button"
                        onClick={(e) => handleQuickAdd(e, item)}
                        title="Quick Add"
                        className="absolute bottom-2 end-2 w-7 h-7 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center shadow-md transition-transform active:scale-95 cursor-pointer z-10"
                      >
                        <Plus size={15} />
                      </button>
                    </div>

                    {/* Card Content */}
                    <div className="p-3 flex-1 flex flex-col justify-between">
                      <div>
                        <span className="text-[9px] uppercase font-bold text-zinc-400 tracking-wider block truncate">
                          {getCategoryMeta(item.category).label}
                        </span>
                        <h4 className="text-xs sm:text-sm font-bold text-zinc-950 group-hover:text-emerald-700 transition leading-snug line-clamp-1 mt-0.5">
                          {item.name}
                        </h4>
                      </div>

                      {/* Bottom Row: Price + Stock */}
                      <div className="mt-2 pt-2 border-t border-zinc-100 flex items-center justify-between">
                        <div>
                          <span className="text-xs sm:text-sm font-bold font-mono text-emerald-700">
                            {formatCurrency(item.price)}
                          </span>
                          {item.doublePrice && (
                            <span className="text-[10px] font-mono text-zinc-400 ms-1">
                              / {formatCurrency(item.doublePrice)}
                            </span>
                          )}
                        </div>

                        <span className="text-[10px] font-mono text-zinc-400">
                          {item.stock} {item.unit}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {filteredItems.length === 0 && (
              <div className="bg-white rounded-2xl border border-zinc-200 p-12 text-center text-zinc-500">
                <p className="text-sm font-semibold">
                  {lang === 'ar' ? 'لا توجد منتجات تطابق هذا القسم أو البحث' : 'No menu items match your search or filter.'}
                </p>
                <button
                  onClick={handleBackToCategories}
                  className="mt-3 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition cursor-pointer"
                >
                  {lang === 'ar' ? 'الرجوع لجميع الأقسام' : 'Browse All Sections'}
                </button>
              </div>
            )}
          </div>

          {/* Right Column: Order Ticket & Fast Checkout Panel */}
          <div className="lg:col-span-5 xl:col-span-4 bg-white border border-zinc-200 rounded-2xl p-5 shadow-xs sticky top-4 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-zinc-950">{t.orderCart}</h3>
                <p className="text-[11px] text-zinc-400 font-mono">
                  {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
              {cart.length > 0 && (
                <button
                  onClick={clearCart}
                  className="text-xs text-rose-600 hover:text-rose-800 font-semibold transition cursor-pointer"
                >
                  {t.clearCart}
                </button>
              )}
            </div>

            {/* Customer & Desk Selector */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block mb-1">
                  {t.selectCustomer}
                </label>
                <div className="flex gap-1">
                  <select
                    value={selectedCustomerId}
                    onChange={(e) => {
                      setSelectedCustomerId(e.target.value);
                      setRedeemedPointsBlocks(0);
                    }}
                    className="w-full px-2 py-1.5 rounded-lg border border-zinc-200 bg-zinc-50 text-zinc-900 font-medium focus:outline-none focus:border-emerald-600 text-xs truncate"
                  >
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.points} {lang === 'ar' ? 'نقطة' : 'pts'})
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={onOpenNewCustomerModal}
                    title="Add New Member"
                    className="p-1.5 rounded-lg border border-zinc-200 hover:bg-zinc-100 text-zinc-600 shrink-0 cursor-pointer"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block mb-1">
                  {t.tableOrDesk}
                </label>
                <select
                  value={selectedDeskId}
                  onChange={(e) => setSelectedDeskId(e.target.value)}
                  className="w-full px-2 py-1.5 rounded-lg border border-zinc-200 bg-zinc-50 text-zinc-900 font-medium focus:outline-none focus:border-emerald-600 text-xs truncate"
                >
                  <option value="">{lang === 'ar' ? 'سفري / استلام مباشر' : 'Takeaway / Counter'}</option>
                  {desks.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.code} - {d.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Customer Loyalty Points Summary in POS */}
            {currentCustomer && currentCustomer.id !== 'c-walkin' && (
              <div className="p-2.5 rounded-xl bg-emerald-50/80 border border-emerald-200/80 text-xs flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Star size={14} className="text-emerald-600 fill-emerald-500" />
                  <div>
                    <span className="font-bold text-emerald-950 block leading-tight">
                      {currentCustomer.points} {t.loyaltyPoints}
                    </span>
                    <span className="text-[10px] text-emerald-800">
                      {lang === 'ar'
                        ? `تعادل ${formatCurrency(currentCustomer.points * 0.1)} (500 نقطة = 50 ج.م)`
                        : `Worth ${formatCurrency(currentCustomer.points * 0.1)} (500 pts = 50 EGP)`}
                    </span>
                  </div>
                </div>

                {maxRedeemableBlocks > 0 && cart.length > 0 && (
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() =>
                        setRedeemedPointsBlocks((prev) =>
                          prev === maxRedeemableBlocks ? 0 : maxRedeemableBlocks
                        )
                      }
                      className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition cursor-pointer ${
                        redeemedPointsBlocks > 0
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-white text-emerald-900 border-emerald-300 hover:bg-emerald-100'
                      }`}
                    >
                      {redeemedPointsBlocks > 0
                        ? `${lang === 'ar' ? 'خصم مفعّل' : 'Applied'} -${formatCurrency(loyaltyDiscountEGP)}`
                        : `${lang === 'ar' ? 'استبدال نقاط' : 'Redeem 500+ pts'}`}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Cart Item Rows */}
            <div className="divide-y divide-zinc-100 max-h-[220px] overflow-y-auto pe-1">
              {cart.length === 0 ? (
                <div className="py-8 text-center text-zinc-400 space-y-2">
                  <ReceiptIcon size={28} className="mx-auto text-zinc-300 stroke-1" />
                  <p className="text-xs font-semibold">{t.emptyCart}</p>
                  <p className="text-[11px] text-zinc-400">{t.emptyCartSub}</p>
                </div>
              ) : (
                cart.map((item) => {
                  const addonsPrice = item.selectedAddons.reduce((s, a) => s + a.price, 0);
                  const itemTotal = (item.unitPrice + addonsPrice) * item.qty;

                  return (
                    <div key={item.cartId} className="py-2 space-y-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-bold text-zinc-950 truncate">
                            {item.name}
                            {item.size && (
                              <span className="text-[10px] font-semibold text-emerald-700 ms-1">
                                ({item.size})
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] font-mono text-zinc-500">
                            {formatCurrency(item.unitPrice)} {lang === 'ar' ? 'للوحدة' : 'ea'}
                          </div>
                        </div>
                        <span className="text-xs font-bold font-mono text-zinc-950">
                          {formatCurrency(itemTotal)}
                        </span>
                      </div>

                      {/* Addons preview */}
                      {item.selectedAddons.length > 0 && (
                        <div className="ps-2 border-s-2 border-zinc-200 text-[10px] text-zinc-500 space-y-0.5">
                          {item.selectedAddons.map((ad, idx) => (
                            <div key={idx} className="flex justify-between">
                              <span>+ {ad.name}</span>
                              <span>+{formatCurrency(ad.price)}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Special instruction note */}
                      {item.note && (
                        <div className="text-[10px] text-emerald-800 italic bg-emerald-50/80 px-2 py-0.5 rounded">
                          {t.notes}: {item.note}
                        </div>
                      )}

                      {/* Quantity controls */}
                      <div className="flex items-center justify-between pt-1">
                        <div className="flex items-center border border-zinc-200 rounded-lg bg-zinc-50 p-0.5">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.cartId, -1)}
                            className="p-1 rounded text-zinc-600 hover:bg-zinc-200 cursor-pointer"
                          >
                            <Minus size={11} />
                          </button>
                          <span className="w-6 text-center text-xs font-bold font-mono text-zinc-900">
                            {item.qty}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.cartId, 1)}
                            className="p-1 rounded text-zinc-600 hover:bg-zinc-200 cursor-pointer"
                          >
                            <Plus size={11} />
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeItem(item.cartId)}
                          className="text-zinc-400 hover:text-rose-600 p-1 transition cursor-pointer"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Discount and Payment Method Selection */}
            {cart.length > 0 && (
              <div className="space-y-3 pt-3 border-t border-zinc-100 text-xs">
                {/* Discount selection */}
                <div>
                  <div className="flex items-center justify-between text-zinc-600 mb-1">
                    <span className="text-[11px] font-semibold flex items-center gap-1">
                      <Tag size={12} /> {t.discount}
                    </span>
                    <span className="text-[10px] font-mono text-zinc-400">
                      {discountPercent > 0 ? `${discountPercent}% ${lang === 'ar' ? 'مطبّق' : 'Applied'}` : (lang === 'ar' ? 'بدون' : 'None')}
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[0, 5, 10, 15].map((pct) => (
                      <button
                        key={pct}
                        type="button"
                        onClick={() => setDiscountPercent(pct)}
                        className={`py-1 text-center rounded-lg border font-bold transition cursor-pointer ${
                          discountPercent === pct
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : 'bg-zinc-50 text-zinc-700 border-zinc-200 hover:bg-zinc-100'
                        }`}
                      >
                        {pct === 0 ? '0%' : `${pct}%`}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Payment Method Tabs */}
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block mb-1">
                    {t.paymentMethod}
                  </label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {[
                      { id: 'Cash', label: t.cash, icon: Banknote },
                      { id: 'Credit Card', label: t.card, icon: CreditCard },
                      { id: 'InstaPay / Wallet', label: t.instaPay, icon: Smartphone },
                      { id: 'Member Tab', label: t.memberTab, icon: Wallet },
                    ].map((pm) => {
                      const Icon = pm.icon;
                      const isSelected = paymentMethod === pm.id;
                      return (
                        <button
                          key={pm.id}
                          type="button"
                          onClick={() =>
                            setPaymentMethod(
                              pm.id as 'Cash' | 'Credit Card' | 'InstaPay / Wallet' | 'Member Tab'
                            )
                          }
                          className={`p-2 rounded-xl border text-start flex items-center gap-2 transition cursor-pointer ${
                            isSelected
                              ? 'bg-zinc-950 text-white border-zinc-950 font-bold'
                              : 'bg-zinc-50 text-zinc-800 border-zinc-200 hover:bg-zinc-100'
                          }`}
                        >
                          <Icon size={14} className={isSelected ? 'text-emerald-400' : 'text-zinc-500'} />
                          <span className="text-[11px] truncate">{pm.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Quick Cash Payment & Change Calculator (if Cash selected) */}
                {paymentMethod === 'Cash' && (
                  <div className="p-2.5 bg-amber-50/70 border border-amber-200 rounded-xl space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-bold text-amber-950">
                      <span>{lang === 'ar' ? 'فئات النقد السريع والمتبقي (الفكة):' : 'Quick Cash & Change Due:'}</span>
                      <span className="font-mono text-emerald-800 font-black">
                        {changeDue > 0 ? `${lang === 'ar' ? 'المتبقي:' : 'Change:'} ${formatCurrency(changeDue)}` : ''}
                      </span>
                    </div>

                    <div className="grid grid-cols-5 gap-1">
                      {[
                        { label: lang === 'ar' ? 'بالضبط' : 'Exact', val: Math.ceil(grandTotal) },
                        { label: '50', val: 50 },
                        { label: '100', val: 100 },
                        { label: '200', val: 200 },
                        { label: '500', val: 500 },
                      ].map((item) => (
                        <button
                          key={item.label}
                          type="button"
                          onClick={() => setCustomCashTendered(item.val)}
                          className={`py-1 text-center rounded-lg border text-[10px] font-mono font-bold transition cursor-pointer ${
                            effectiveCashTendered === item.val
                              ? 'bg-amber-600 text-white border-amber-600'
                              : 'bg-white text-zinc-800 border-amber-200 hover:bg-amber-100'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Subtotal, VAT, Grand Total */}
                <div className="pt-2 border-t border-zinc-100 space-y-1 font-mono text-[11px]">
                  <div className="flex justify-between text-zinc-600">
                    <span>{t.subtotal}</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>
                  {percentDiscountAmount > 0 && (
                    <div className="flex justify-between text-rose-600">
                      <span>{t.discount} ({discountPercent}%)</span>
                      <span>- {formatCurrency(percentDiscountAmount)}</span>
                    </div>
                  )}
                  {loyaltyDiscountEGP > 0 && (
                    <div className="flex justify-between text-emerald-700 font-semibold">
                      <span>{lang === 'ar' ? `مكافأة ولاء (${loyaltyPointsUsed} نقطة)` : `Loyalty Reward (${loyaltyPointsUsed} pts)`}</span>
                      <span>- {formatCurrency(loyaltyDiscountEGP)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-zinc-600">
                    <span>{t.tax} (14%)</span>
                    <span>{formatCurrency(tax)}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-zinc-200 text-base font-bold text-zinc-950 font-sans">
                    <span>{t.total}</span>
                    <span className="text-emerald-700 font-mono font-bold text-lg">
                      {formatCurrency(grandTotal)}
                    </span>
                  </div>
                </div>

                {/* Dual Action Buttons: 1-Click Fast Pay & 80mm Print OR Review Order */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleFastPayAndPrint}
                    disabled={cart.length === 0 || isFastCheckingOut}
                    className="py-3 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50 cursor-pointer"
                  >
                    <Zap size={14} className="fill-current text-amber-300" />
                    <span>{lang === 'ar' ? 'سداد وطباعة فورية' : 'Fast Pay & Print (80mm)'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleCheckout}
                    disabled={cart.length === 0}
                    className="py-3 px-3 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50 cursor-pointer"
                  >
                    <ReceiptIcon size={14} />
                    <span>{lang === 'ar' ? 'مراجعة وتأكيد الطلب' : 'Settle & Receipt'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Item Customizer Modal */}
      {customizingItem && (
        <ItemCustomizerModal
          item={customizingItem}
          addonsList={addons}
          onClose={() => setCustomizingItem(null)}
          onAddToCart={addToCart}
        />
      )}

      {/* Completed Order Receipt Modal */}
      {completedOrder && (
        <ReceiptModal
          order={completedOrder}
          customer={customers.find((c) => c.id === completedOrder.customerId)}
          onClose={() => setCompletedOrder(null)}
          notify={notify}
        />
      )}
    </div>
  );
};


