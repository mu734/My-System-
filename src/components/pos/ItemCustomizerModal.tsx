import React, { useState } from 'react';
import { X, Plus, Minus, Check, Sparkles } from 'lucide-react';
import { MenuItem, MenuItemAddon, CartItem } from '../../types';
import { CategoryIcon } from '../CategoryIcon';
import { getProductImage } from '../../utils/productImages';
import { useLanguage } from '../../i18n/LanguageContext';

interface ItemCustomizerModalProps {
  item: MenuItem;
  addonsList: MenuItemAddon[];
  onClose: () => void;
  onAddToCart: (cartItem: CartItem) => void;
}

export const ItemCustomizerModal: React.FC<ItemCustomizerModalProps> = ({
  item,
  addonsList,
  onClose,
  onAddToCart,
}) => {
  const { lang, t, formatCurrency } = useLanguage();
  const [selectedSize, setSelectedSize] = useState<'Single' | 'Double' | 'Glass' | 'Bottle' | 'Standard'>(
    item.hasSizes ? (item.sizeLabelSingle === 'Glass' ? 'Glass' : 'Single') : 'Standard'
  );
  const [qty, setQty] = useState(1);
  const [selectedAddonIds, setSelectedAddonIds] = useState<string[]>([]);
  const [specialNote, setSpecialNote] = useState('');

  const productImage = getProductImage(item);

  // Determine applicable addons by category
  const applicableAddons = addonsList.filter((addon) => {
    const itemCat = item.category.toLowerCase();
    const addonCat = addon.category.toLowerCase();

    if (
      (itemCat.includes('drink') || itemCat.includes('coffee') || itemCat.includes('tea') || itemCat.includes('matcha')) &&
      addonCat.includes('drink')
    ) {
      return true;
    }
    if (itemCat.includes('burger') && addonCat.includes('burger')) {
      return true;
    }
    if (
      (itemCat.includes('taco') || itemCat.includes('quesadilla') || itemCat.includes('appetizer') || itemCat.includes('fajita')) &&
      addonCat.includes('quesadilla')
    ) {
      return true;
    }
    return false;
  });

  // Calculate unit price based on size
  let basePrice = item.price;
  if (selectedSize === 'Double' && item.doublePrice) {
    basePrice = item.doublePrice;
  } else if (selectedSize === 'Bottle' && item.bottlePrice) {
    basePrice = item.bottlePrice;
  }

  const addonsTotal = selectedAddonIds.reduce((sum, id) => {
    const ad = addonsList.find((a) => a.id === id);
    return sum + (ad ? ad.price : 0);
  }, 0);

  const unitTotal = basePrice + addonsTotal;
  const grandTotal = unitTotal * qty;

  const toggleAddon = (id: string) => {
    setSelectedAddonIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleConfirm = () => {
    const selectedAddons = selectedAddonIds
      .map((id) => addonsList.find((a) => a.id === id))
      .filter(Boolean)
      .map((a) => ({ name: a!.name, price: a!.price }));

    onAddToCart({
      cartId: Math.random().toString(36).slice(2, 10),
      itemId: item.id,
      name: item.name,
      category: item.category,
      size: item.hasSizes ? selectedSize : undefined,
      unitPrice: basePrice,
      qty,
      selectedAddons,
      note: specialNote.trim() || undefined,
    });
    onClose();
  };

  return (
    <div
      id="item-customizer-backdrop"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/70 backdrop-blur-xs"
    >
      <div
        id="item-customizer-card"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden border border-zinc-200 animate-in fade-in zoom-in duration-150 flex flex-col max-h-[90vh]"
      >
        {/* Header with Product Picture */}
        <div className="relative bg-zinc-900">
          <div className="h-40 w-full overflow-hidden relative">
            <img
              src={productImage}
              alt={item.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover opacity-85"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />
            <button
              onClick={onClose}
              className="absolute end-3 top-3 p-1.5 rounded-full bg-zinc-900/80 text-white hover:bg-zinc-900 transition z-10 cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="absolute bottom-3 start-4 end-4 text-white">
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-700/90 text-white text-[10px] font-bold uppercase tracking-wider">
                  {item.category}
                </span>
                {item.badge && (
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-400 text-zinc-950">
                    {item.badge}
                  </span>
                )}
                {item.hasSizes && (
                  <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-white/20 text-white backdrop-blur-xs">
                    {lang === 'ar' ? 'أحجام متعددة' : 'Multiple Sizes'}
                  </span>
                )}
              </div>
              <h3 className="text-xl font-bold text-white tracking-tight">{item.name}</h3>
            </div>
          </div>
        </div>

        {/* Scrollable Customizer Body */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1">
          {/* Size / Portion Selection */}
          {item.hasSizes && (
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-700 block mb-2">
                {t.size}
              </label>
              <div className="grid grid-cols-2 gap-3">
                {/* Single / Glass */}
                <button
                  type="button"
                  onClick={() =>
                    setSelectedSize(item.sizeLabelSingle === 'Glass' ? 'Glass' : 'Single')
                  }
                  className={`p-3 rounded-xl border text-start transition flex items-center justify-between cursor-pointer ${
                    selectedSize === 'Single' || selectedSize === 'Glass'
                      ? 'border-emerald-700 bg-emerald-50/60 ring-2 ring-emerald-700/20'
                      : 'border-zinc-200 hover:border-zinc-300 bg-white'
                  }`}
                >
                  <div>
                    <div className="text-sm font-bold text-zinc-900">
                      {item.sizeLabelSingle || t.single}
                    </div>
                    <div className="text-xs text-zinc-500">{lang === 'ar' ? 'حجم قياسي' : 'Standard serving'}</div>
                  </div>
                  <span className="text-sm font-semibold font-mono text-emerald-800">
                    {formatCurrency(item.price)}
                  </span>
                </button>

                {/* Double / Bottle */}
                {(item.doublePrice || item.bottlePrice) && (
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedSize(item.sizeLabelDouble === 'Bottle' ? 'Bottle' : 'Double')
                    }
                    className={`p-3 rounded-xl border text-start transition flex items-center justify-between cursor-pointer ${
                      selectedSize === 'Double' || selectedSize === 'Bottle'
                        ? 'border-emerald-700 bg-emerald-50/60 ring-2 ring-emerald-700/20'
                        : 'border-zinc-200 hover:border-zinc-300 bg-white'
                    }`}
                  >
                    <div>
                      <div className="text-sm font-bold text-zinc-900">
                        {item.sizeLabelDouble || t.double}
                      </div>
                      <div className="text-xs text-zinc-500">{lang === 'ar' ? 'حجم مضاعف / كبير' : 'Large / double dose'}</div>
                    </div>
                    <span className="text-sm font-semibold font-mono text-emerald-800">
                      {formatCurrency(item.doublePrice || item.bottlePrice || 0)}
                    </span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Add-ons & Modifiers */}
          {applicableAddons.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-700 flex items-center gap-1.5">
                  <Sparkles size={13} className="text-amber-600" />
                  {t.addons}
                </label>
                <span className="text-[11px] text-zinc-500">{lang === 'ar' ? 'اختياري' : 'Optional'}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {applicableAddons.map((addon) => {
                  const isChecked = selectedAddonIds.includes(addon.id);
                  return (
                    <button
                      key={addon.id}
                      type="button"
                      onClick={() => toggleAddon(addon.id)}
                      className={`p-2.5 rounded-xl border text-start text-xs transition flex items-center justify-between cursor-pointer ${
                        isChecked
                          ? 'border-emerald-700 bg-emerald-50/70 text-emerald-950 font-medium'
                          : 'border-zinc-200 hover:border-zinc-300 bg-white text-zinc-700'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-4 h-4 rounded flex items-center justify-center border ${
                            isChecked
                              ? 'bg-emerald-700 border-emerald-700 text-white'
                              : 'border-zinc-300 bg-white'
                          }`}
                        >
                          {isChecked && <Check size={11} strokeWidth={3} />}
                        </div>
                        <span>{addon.name}</span>
                      </div>
                      <span className="font-mono text-zinc-600 font-semibold text-[11px]">
                        +{formatCurrency(addon.price)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Barista / Kitchen Notes */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-700 block mb-1.5">
              {t.notes}
            </label>
            <input
              type="text"
              value={specialNote}
              onChange={(e) => setSpecialNote(e.target.value)}
              placeholder={lang === 'ar' ? 'مثال: ساخن جداً، بدون صوص، حليب شوفان...' : 'e.g. Extra hot, no dressing, oat milk, iced in cup...'}
              className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200 focus:outline-none focus:border-emerald-700 focus:ring-1 focus:ring-emerald-700 bg-zinc-50"
            />
          </div>
        </div>

        {/* Footer with Quantity Counter & Confirm Button */}
        <div className="p-4 bg-zinc-50 border-t border-zinc-200 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-zinc-600">{t.qty}:</span>
            <div className="flex items-center border border-zinc-300 rounded-xl bg-white p-0.5">
              <button
                type="button"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="p-1.5 rounded-lg text-zinc-600 hover:bg-zinc-100 transition cursor-pointer"
              >
                <Minus size={14} />
              </button>
              <span className="w-8 text-center text-sm font-bold font-mono text-zinc-900">
                {qty}
              </span>
              <button
                type="button"
                onClick={() => setQty((q) => q + 1)}
                className="p-1.5 rounded-lg text-zinc-600 hover:bg-zinc-100 transition cursor-pointer"
              >
                <Plus size={14} />
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={handleConfirm}
            className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs transition flex items-center justify-between shadow-sm cursor-pointer"
          >
            <span>{lang === 'ar' ? 'إضافة إلى الطلب' : 'Add to Order'}</span>
            <span className="font-mono text-emerald-100 font-bold">
              {formatCurrency(grandTotal)}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
