import React, { useState } from 'react';
import { X, Plus, Save } from 'lucide-react';
import { MenuItem } from '../../types';
import { ALL_CATEGORIES } from '../../data/seedData';

interface ItemEditModalProps {
  item?: MenuItem | null;
  onClose: () => void;
  onSave: (itemData: Partial<MenuItem>) => void;
}

export const ItemEditModal: React.FC<ItemEditModalProps> = ({ item, onClose, onSave }) => {
  const isEditing = !!item;

  const [name, setName] = useState(item?.name || '');
  const [category, setCategory] = useState(item?.category || 'Hot Drinks');
  const [price, setPrice] = useState<number | string>(item?.price ?? 50);
  const [doublePrice, setDoublePrice] = useState<number | string>(item?.doublePrice ?? '');
  const [cost, setCost] = useState<number | string>(item?.cost ?? 18);
  const [stock, setStock] = useState<number | string>(item?.stock ?? 100);
  const [unit, setUnit] = useState(item?.unit || 'cups');
  const [threshold, setThreshold] = useState<number | string>(item?.threshold ?? 15);
  const [description, setDescription] = useState(item?.description || '');
  const [ingredients, setIngredients] = useState(item?.ingredients || '');
  const [badge, setBadge] = useState(item?.badge || '');
  const [hasSizes, setHasSizes] = useState(item?.hasSizes || false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSave({
      id: item?.id || `item-${Date.now()}`,
      name: name.trim(),
      category,
      price: Number(price),
      doublePrice: doublePrice ? Number(doublePrice) : undefined,
      cost: Number(cost),
      stock: Number(stock),
      unit,
      threshold: Number(threshold),
      description: description.trim() || undefined,
      ingredients: ingredients.trim() || undefined,
      badge: badge.trim() || undefined,
      hasSizes,
    });
    onClose();
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in duration-150 flex flex-col max-h-[90vh]"
      >
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
              {isEditing ? 'Edit Inventory Item' : 'New Menu / Stock Item'}
            </span>
            <h3 className="text-base font-bold text-slate-900 mt-0.5">
              {isEditing ? item.name : 'Create SKU'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 text-xs">
          {/* Item Name */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-600 block mb-1">
              Item Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Spanish Latte, Smash Burger..."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-700 font-medium text-slate-900"
            />
          </div>

          {/* Category */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-600 block mb-1">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-emerald-700 font-medium text-slate-800"
              >
                {ALL_CATEGORIES.filter((c) => c !== 'All').map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-600 block mb-1">
                Badge / Tag (Optional)
              </label>
              <input
                type="text"
                value={badge}
                onChange={(e) => setBadge(e.target.value)}
                placeholder="e.g. Bestseller, Signature..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-700"
              />
            </div>
          </div>

          {/* Pricing & Cost */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-600 block mb-1">
                Selling Price (EGP) *
              </label>
              <input
                type="number"
                step="any"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-700 font-mono font-semibold"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-600 block mb-1">
                Double / Large (EGP)
              </label>
              <input
                type="number"
                step="any"
                value={doublePrice}
                onChange={(e) => setDoublePrice(e.target.value)}
                placeholder="Optional"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-700 font-mono"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-600 block mb-1">
                Unit Cost (EGP)
              </label>
              <input
                type="number"
                step="any"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-700 font-mono"
              />
            </div>
          </div>

          {/* Stock, Unit, Threshold */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-600 block mb-1">
                Current Stock *
              </label>
              <input
                type="number"
                required
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-700 font-mono font-semibold"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-600 block mb-1">
                Unit
              </label>
              <input
                type="text"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="cups, plates, pcs"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-700"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-600 block mb-1">
                Low Stock Threshold
              </label>
              <input
                type="number"
                value={threshold}
                onChange={(e) => setThreshold(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-700 font-mono"
              />
            </div>
          </div>

          {/* Description & Ingredients */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-600 block mb-1">
              Short Description
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Flavor notes, roast profile, or kitchen summary..."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-700"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-600 block mb-1">
              Ingredients
            </label>
            <input
              type="text"
              value={ingredients}
              onChange={(e) => setIngredients(e.target.value)}
              placeholder="e.g. Sourdough, eggs, avocado, pickled cucumber..."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-700"
            />
          </div>

          <div className="p-4 bg-slate-50 border-t border-slate-200 -mx-5 -mb-5 mt-5 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs transition flex items-center gap-1.5 shadow-sm"
            >
              <Save size={13} /> Save Item
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
