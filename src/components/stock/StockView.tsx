import React, { useState, useMemo } from 'react';
import {
  Boxes,
  Plus,
  Minus,
  Search,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  DollarSign,
  Edit2,
  Sparkles,
  RefreshCw,
  SlidersHorizontal,
  PackageCheck,
  ShoppingCart,
  FileSpreadsheet,
} from 'lucide-react';
import { MenuItem } from '../../types';
import { ALL_CATEGORIES } from '../../data/seedData';
import { CategoryIcon } from '../CategoryIcon';
import { ItemEditModal } from './ItemEditModal';

interface StockViewProps {
  menu: MenuItem[];
  onUpdateStock: (itemId: string, newStock: number) => void;
  onSaveItem: (itemData: Partial<MenuItem>) => void;
  notify: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const StockView: React.FC<StockViewProps> = ({
  menu,
  onUpdateStock,
  onSaveItem,
  notify,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Reorder' | 'Low' | 'Out' | 'InStock'>('All');
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [editingThresholdId, setEditingThresholdId] = useState<string | null>(null);
  const [tempThreshold, setTempThreshold] = useState<number>(0);
  const [editingStockId, setEditingStockId] = useState<string | null>(null);
  const [tempStock, setTempStock] = useState<number>(0);

  // Filtered menu items
  const filteredItems = useMemo(() => {
    return menu.filter((item) => {
      const matchesCategory =
        selectedCategory === 'All' || item.category === selectedCategory;
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase());

      const isLow = item.stock <= item.threshold && item.stock > 0;
      const isOut = item.stock <= 0;
      const isFlaggedForReorder = item.stock <= item.threshold;
      const isInStock = item.stock > item.threshold;

      const matchesStatus =
        statusFilter === 'All' ||
        (statusFilter === 'Reorder' && isFlaggedForReorder) ||
        (statusFilter === 'Low' && isLow) ||
        (statusFilter === 'Out' && isOut) ||
        (statusFilter === 'InStock' && isInStock);

      return matchesCategory && matchesSearch && matchesStatus;
    });
  }, [menu, selectedCategory, searchQuery, statusFilter]);

  // High level inventory calculations
  const totalSKUs = menu.length;
  const itemsFlaggedForReorder = useMemo(
    () => menu.filter((m) => m.stock <= m.threshold),
    [menu]
  );
  const lowStockCount = menu.filter((m) => m.stock <= m.threshold && m.stock > 0).length;
  const outOfStockCount = menu.filter((m) => m.stock <= 0).length;
  const totalInventoryValue = menu.reduce((sum, m) => sum + m.stock * m.cost, 0);

  // Estimated cost to restock flagged items to 4x threshold
  const totalReorderEstimatedCost = useMemo(() => {
    return itemsFlaggedForReorder.reduce((sum, item) => {
      const targetStock = Math.max(item.threshold * 4, 20);
      const unitsNeeded = Math.max(0, targetStock - item.stock);
      return sum + unitsNeeded * item.cost;
    }, 0);
  }, [itemsFlaggedForReorder]);

  const handleAdjustStock = (item: MenuItem, delta: number) => {
    const nextStock = Math.max(0, item.stock + delta);
    onUpdateStock(item.id, nextStock);
    notify(`Updated ${item.name} stock to ${nextStock} ${item.unit}`, 'info');
  };

  const handleSaveInlineStock = (item: MenuItem) => {
    const val = Math.max(0, Number(tempStock) || 0);
    onUpdateStock(item.id, val);
    setEditingStockId(null);
    notify(`Updated ${item.name} count to ${val} ${item.unit}`, 'success');
  };

  const handleSaveInlineThreshold = (item: MenuItem) => {
    const val = Math.max(0, Number(tempThreshold) || 0);
    onSaveItem({ ...item, threshold: val });
    setEditingThresholdId(null);
    notify(`Updated reorder threshold for ${item.name} to ${val} ${item.unit}`, 'success');
  };

  const handleRestockSingleItem = (item: MenuItem) => {
    const target = Math.max(item.threshold * 4, 25);
    onUpdateStock(item.id, target);
    notify(`Restocked ${item.name} to standard stock of ${target} ${item.unit}`, 'success');
  };

  const handleRestockAllFlagged = () => {
    let count = 0;
    menu.forEach((item) => {
      if (item.stock <= item.threshold) {
        const target = Math.max(item.threshold * 4, 25);
        onUpdateStock(item.id, target);
        count++;
      }
    });
    notify(`Restocked ${count} flagged items to healthy operational levels`, 'success');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Stock & Inventory Management</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor stock levels, set low-stock reorder thresholds, and restock items
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {itemsFlaggedForReorder.length > 0 && (
            <button
              onClick={handleRestockAllFlagged}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs transition shadow-xs"
            >
              <RefreshCw size={13} /> Restock All Flagged Items ({itemsFlaggedForReorder.length})
            </button>
          )}
          <button
            onClick={() => setIsCreatingNew(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs transition shadow-xs"
          >
            <Plus size={14} /> Add New SKU / Item
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Total Menu SKUs</span>
            <Boxes size={16} className="text-emerald-700" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 mt-2">{totalSKUs}</div>
          <span className="text-[10px] text-slate-400">All café & kitchen items</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Flagged for Reorder</span>
            <AlertTriangle size={16} className="text-amber-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-700 mt-2">
            {itemsFlaggedForReorder.length}
          </div>
          <span className="text-[10px] text-amber-700 font-medium">Below minimum threshold</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Out of Stock</span>
            <AlertTriangle size={16} className="text-rose-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-rose-700 mt-2">{outOfStockCount}</div>
          <span className="text-[10px] text-slate-400">Unavailable for POS</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Total Stock Asset Value</span>
            <TrendingUp size={16} className="text-emerald-700" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-800 mt-2">
            EGP {totalInventoryValue.toLocaleString()}
          </div>
          <span className="text-[10px] text-slate-400">Cost-basis valuation</span>
        </div>
      </div>

      {/* Flagged for Reorder Alert Banner */}
      {itemsFlaggedForReorder.length > 0 && (
        <div className="bg-amber-50/80 border border-amber-300 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-2xs">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-amber-200/80 text-amber-900 shrink-0">
              <AlertTriangle size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-amber-950 text-sm">
                  {itemsFlaggedForReorder.length} Items Flagged Below Minimum Threshold
                </h4>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-200 text-amber-900 uppercase">
                  Action Required
                </span>
              </div>
              <p className="text-xs text-amber-800 mt-1">
                Estimated replenishment cost to reach healthy buffer levels: <strong className="font-mono text-amber-950">EGP {totalReorderEstimatedCost.toFixed(2)}</strong>.
              </p>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {itemsFlaggedForReorder.slice(0, 5).map((it) => (
                  <span
                    key={it.id}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white border border-amber-300 text-[11px] text-amber-900 font-medium"
                  >
                    <span>{it.name}:</span>
                    <strong className="text-rose-700 font-mono">{it.stock}</strong>
                    <span className="text-slate-400 text-[10px]">/ min {it.threshold}</span>
                  </span>
                ))}
                {itemsFlaggedForReorder.length > 5 && (
                  <span className="text-xs text-amber-700 font-semibold self-center">
                    +{itemsFlaggedForReorder.length - 5} more
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setStatusFilter('Reorder')}
              className="px-3.5 py-2 rounded-xl bg-white hover:bg-amber-100 text-amber-900 font-bold text-xs border border-amber-300 transition"
            >
              Filter Reorder Items
            </button>
            <button
              onClick={handleRestockAllFlagged}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs transition shadow-2xs flex items-center gap-1.5"
            >
              <PackageCheck size={14} /> Quick Restock All
            </button>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200">
        <div className="flex flex-1 items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search size={15} className="absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or category..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-700"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium text-slate-700 focus:outline-none focus:border-emerald-700"
          >
            {ALL_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Status filters */}
        <div className="flex flex-wrap items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 self-start md:self-auto">
          {[
            { key: 'All', label: 'All SKUs' },
            { key: 'Reorder', label: `Flagged (${itemsFlaggedForReorder.length})` },
            { key: 'Low', label: `Low (${lowStockCount})` },
            { key: 'Out', label: `Out (${outOfStockCount})` },
            { key: 'InStock', label: 'In Stock' },
          ].map((st) => (
            <button
              key={st.key}
              onClick={() => setStatusFilter(st.key as any)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                statusFilter === st.key
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stock Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-500 tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-5 py-3.5">Item & Category</th>
                <th className="px-4 py-3.5">Current Stock Level</th>
                <th className="px-4 py-3.5">Low-Stock Threshold</th>
                <th className="px-4 py-3.5">Quick Count Adjustment</th>
                <th className="px-4 py-3.5">Selling Price</th>
                <th className="px-4 py-3.5">Cost Basis</th>
                <th className="px-4 py-3.5">Gross Margin</th>
                <th className="px-4 py-3.5">Inventory Status</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {filteredItems.map((item) => {
                const isBelowThreshold = item.stock <= item.threshold;
                const isOut = item.stock <= 0;
                const isLow = isBelowThreshold && !isOut;
                const margin =
                  item.price > 0 ? Math.round(((item.price - item.cost) / item.price) * 100) : 0;

                const isEditingThisStock = editingStockId === item.id;
                const isEditingThisThreshold = editingThresholdId === item.id;

                return (
                  <tr
                    key={item.id}
                    className={`transition ${
                      isOut
                        ? 'bg-rose-50/40 hover:bg-rose-50/70'
                        : isLow
                        ? 'bg-amber-50/40 hover:bg-amber-50/70'
                        : 'hover:bg-slate-50/80'
                    }`}
                  >
                    {/* Item and category */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-slate-100 text-slate-700 shrink-0">
                          <CategoryIcon category={item.category} size={15} />
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 flex items-center gap-1.5">
                            <span>{item.name}</span>
                            {item.badge && (
                              <span className="px-1.5 py-0.2 text-[9px] font-semibold rounded bg-amber-100 text-amber-900">
                                {item.badge}
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-400">{item.category}</span>
                        </div>
                      </div>
                    </td>

                    {/* Stock level with inline click-to-edit */}
                    <td className="px-4 py-3.5">
                      {isEditingThisStock ? (
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            autoFocus
                            min={0}
                            value={tempStock}
                            onChange={(e) => setTempStock(Number(e.target.value))}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSaveInlineStock(item);
                              if (e.key === 'Escape') setEditingStockId(null);
                            }}
                            className="w-16 px-1.5 py-1 text-xs font-mono font-bold bg-white border border-emerald-700 rounded-lg focus:outline-none"
                          />
                          <button
                            onClick={() => handleSaveInlineStock(item)}
                            className="px-1.5 py-1 bg-emerald-800 text-white rounded-lg text-[10px] font-bold"
                          >
                            Save
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setEditingStockId(item.id);
                            setTempStock(item.stock);
                          }}
                          className="group text-left"
                          title="Click to edit stock quantity directly"
                        >
                          <div className="font-mono font-bold text-slate-900 text-sm flex items-center gap-1.5 group-hover:text-emerald-800">
                            <span className={item.stock <= item.threshold ? 'text-rose-700 font-black' : ''}>
                              {item.stock}
                            </span>
                            <span className="text-slate-400 font-sans text-xs font-normal">
                              {item.unit}
                            </span>
                            <Edit2 size={11} className="opacity-0 group-hover:opacity-100 text-slate-400 transition" />
                          </div>
                          <span className="text-[10px] text-slate-400 block group-hover:underline">
                            Click to edit count
                          </span>
                        </button>
                      )}
                    </td>

                    {/* Low-stock threshold with inline click-to-edit */}
                    <td className="px-4 py-3.5">
                      {isEditingThisThreshold ? (
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            autoFocus
                            min={0}
                            value={tempThreshold}
                            onChange={(e) => setTempThreshold(Number(e.target.value))}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSaveInlineThreshold(item);
                              if (e.key === 'Escape') setEditingThresholdId(null);
                            }}
                            className="w-16 px-1.5 py-1 text-xs font-mono font-bold bg-white border border-amber-600 rounded-lg focus:outline-none"
                          />
                          <button
                            onClick={() => handleSaveInlineThreshold(item)}
                            className="px-1.5 py-1 bg-amber-600 text-white rounded-lg text-[10px] font-bold"
                          >
                            Save
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setEditingThresholdId(item.id);
                            setTempThreshold(item.threshold);
                          }}
                          className="group text-left"
                          title="Click to change minimum reorder threshold"
                        >
                          <div className="font-mono font-bold text-slate-700 text-xs flex items-center gap-1 group-hover:text-amber-800">
                            <span>Min {item.threshold}</span>
                            <span className="text-slate-400 font-sans text-[11px] font-normal">{item.unit}</span>
                            <Edit2 size={10} className="opacity-0 group-hover:opacity-100 text-slate-400 transition" />
                          </div>
                          <span className="text-[10px] text-slate-400 block group-hover:underline">
                            Set min threshold
                          </span>
                        </button>
                      )}
                    </td>

                    {/* Quick Adjust Buttons */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleAdjustStock(item, -5)}
                          className="px-1.5 py-0.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 font-mono text-[10px]"
                          title="Reduce 5"
                        >
                          -5
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAdjustStock(item, -1)}
                          className="p-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-600"
                          title="Reduce 1"
                        >
                          <Minus size={12} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAdjustStock(item, 1)}
                          className="p-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-600"
                          title="Add 1"
                        >
                          <Plus size={12} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAdjustStock(item, 5)}
                          className="px-1.5 py-0.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold font-mono text-[10px]"
                          title="Restock 5"
                        >
                          +5
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAdjustStock(item, 10)}
                          className="px-1.5 py-0.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold font-mono text-[10px]"
                          title="Restock 10"
                        >
                          +10
                        </button>
                      </div>
                    </td>

                    {/* Selling price */}
                    <td className="px-4 py-3.5 font-mono font-bold text-slate-900">
                      EGP {item.price.toFixed(2)}
                    </td>

                    {/* Cost basis */}
                    <td className="px-4 py-3.5 font-mono text-slate-500">
                      EGP {item.cost.toFixed(2)}
                    </td>

                    {/* Margin */}
                    <td className="px-4 py-3.5">
                      <span
                        className={`font-mono font-bold ${
                          margin >= 60
                            ? 'text-emerald-700'
                            : margin >= 40
                            ? 'text-amber-700'
                            : 'text-slate-600'
                        }`}
                      >
                        {margin}%
                      </span>
                    </td>

                    {/* Status badge & Reorder Flag */}
                    <td className="px-4 py-3.5">
                      {isOut ? (
                        <div className="space-y-0.5">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-rose-100 text-rose-800 border border-rose-200">
                            <AlertTriangle size={10} /> Out of Stock
                          </span>
                          <span className="block text-[9px] text-rose-600 font-medium">
                            Flagged for Reorder
                          </span>
                        </div>
                      ) : isLow ? (
                        <div className="space-y-0.5">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                            <AlertTriangle size={10} /> Below Minimum
                          </span>
                          <span className="block text-[9px] text-amber-700 font-medium">
                            Reorder {item.threshold * 4 - item.stock} {item.unit}
                          </span>
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-emerald-100 text-emerald-900 border border-emerald-200">
                          <CheckCircle2 size={10} /> In Stock
                        </span>
                      )}
                    </td>

                    {/* Edit & Restock button */}
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {isBelowThreshold && (
                          <button
                            type="button"
                            onClick={() => handleRestockSingleItem(item)}
                            className="px-2 py-1 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-[10px] border border-amber-300"
                            title="Restock to healthy buffer"
                          >
                            Restock
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setEditingItem(item)}
                          className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-emerald-800 hover:bg-emerald-50 transition"
                          title="Edit All Item Details"
                        >
                          <Edit2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredItems.length === 0 && (
          <div className="p-10 text-center text-slate-400">
            <Boxes size={28} className="mx-auto text-slate-300 stroke-1 mb-2" />
            <p className="font-semibold text-xs text-slate-600">No stock items found</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Try adjusting your filters or add a new SKU</p>
          </div>
        )}
      </div>

      {/* Edit / Create Item Modal */}
      {(editingItem || isCreatingNew) && (
        <ItemEditModal
          item={editingItem}
          onClose={() => {
            setEditingItem(null);
            setIsCreatingNew(false);
          }}
          onSave={onSaveItem}
        />
      )}
    </div>
  );
};

