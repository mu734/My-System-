import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Users,
  UserPlus,
  Search,
  Star,
  Phone,
  Mail,
  ChevronRight,
  TrendingUp,
  Award,
  Crown,
  HeartHandshake,
  X,
  MoreVertical,
  Edit3,
  Check,
  Plus,
  Minus,
  UserCheck,
  Calendar,
  Sparkles,
  MessageSquarePlus,
  Coffee,
  ShoppingBag,
  ExternalLink,
  Tag,
} from 'lucide-react';
import { Customer, Order } from '../../types';
import { CustomerDetailModal } from './CustomerDetailModal';

interface CRMViewProps {
  customers: Customer[];
  orders: Order[];
  onAddCustomer: (customer: Omit<Customer, 'id' | 'points' | 'spent' | 'visits'>) => void;
  onUpdateCustomer: (updated: Customer) => void;
  notify: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

const COMMON_NOTE_TAGS = [
  'Prefers Oat Milk',
  'Gluten-Free',
  'Decaf Coffee Only',
  'Quiet Pod Regular',
  'Double Espresso Lover',
  'Meeting Room Booker',
];

export const CRMView: React.FC<CRMViewProps> = ({
  customers,
  orders,
  onAddCustomer,
  onUpdateCustomer,
  notify,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [tierFilter, setTierFilter] = useState<string>('All');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Quick Action Menu State
  const [activeMenuCustomerId, setActiveMenuCustomerId] = useState<string | null>(null);
  const [editingNoteCustomerId, setEditingNoteCustomerId] = useState<string | null>(null);
  const [noteDraftText, setNoteDraftText] = useState<string>('');
  const [quickVisitsCustomerId, setQuickVisitsCustomerId] = useState<string | null>(null);
  const [expandedHistoryCustomerId, setExpandedHistoryCustomerId] = useState<string | null>(null);

  const menuRef = useRef<HTMLDivElement | null>(null);

  // Close menus on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenuCustomerId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // New Customer Form State
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newTier, setNewTier] = useState<Customer['tier']>('Regular');
  const [newNotes, setNewNotes] = useState('');

  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      const matchesSearch =
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.phone.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.notes.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesTier = tierFilter === 'All' || c.tier === tierFilter;

      return matchesSearch && matchesTier;
    });
  }, [customers, searchQuery, tierFilter]);

  const totalPoints = customers.reduce((sum, c) => sum + c.points, 0);
  const totalCustomerSpend = customers.reduce((sum, c) => sum + c.spent, 0);
  const vipCount = customers.filter(
    (c) => c.tier === 'Founder / VIP' || c.tier === 'Gold VIP'
  ).length;

  const handleCreateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const colors = ['#2F5D57', '#C79A3E', '#8A6FBF', '#3F7A4E', '#B5443C', '#2563EB'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    onAddCustomer({
      name: newName.trim(),
      phone: newPhone.trim(),
      email: newEmail.trim(),
      tier: newTier,
      notes: newNotes.trim(),
      avatarColor: randomColor,
      joinedDate: new Date().toISOString().split('T')[0],
    });

    notify(`Added member ${newName.trim()} to CRM`, 'success');
    setNewName('');
    setNewPhone('');
    setNewEmail('');
    setNewNotes('');
    setNewTier('Regular');
    setIsAddModalOpen(false);
  };

  // Quick Action Handlers (without modal)
  const handleQuickLogVisit = (customer: Customer, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const updated = {
      ...customer,
      visits: (customer.visits || 0) + 1,
    };
    onUpdateCustomer(updated);
    notify(`Logged +1 visit for ${customer.name} (Total: ${updated.visits} visits)`, 'success');
    setActiveMenuCustomerId(null);
  };

  const handleRedeemLoyaltyPoints = (customer: Customer, pointsToRedeem = 500, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (customer.points < pointsToRedeem) {
      notify(`${customer.name} only has ${customer.points} points. 500 points required for 50 EGP reward.`, 'error');
      return;
    }
    const egpValue = (pointsToRedeem / 500) * 50;
    const updated = {
      ...customer,
      points: customer.points - pointsToRedeem,
    };
    onUpdateCustomer(updated);
    notify(`Redeemed ${pointsToRedeem} points for ${customer.name} (-${egpValue} EGP credit applied)`, 'success');
    setActiveMenuCustomerId(null);
  };

  const handleAwardLoyaltyPoints = (customer: Customer, pointsToAdd = 100, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const updated = {
      ...customer,
      points: customer.points + pointsToAdd,
    };
    onUpdateCustomer(updated);
    notify(`Awarded +${pointsToAdd} loyalty points to ${customer.name}`, 'success');
    setActiveMenuCustomerId(null);
  };

  const handleAdjustVisits = (customer: Customer, delta: number, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const nextVisits = Math.max(0, (customer.visits || 0) + delta);
    const updated = {
      ...customer,
      visits: nextVisits,
    };
    onUpdateCustomer(updated);
    notify(`Updated ${customer.name}'s visits to ${nextVisits}`, 'info');
  };

  const handleStartEditingNote = (customer: Customer, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setEditingNoteCustomerId(customer.id);
    setNoteDraftText(customer.notes || '');
    setActiveMenuCustomerId(null);
  };

  const handleSaveNote = (customer: Customer, e?: React.MouseEvent | React.FormEvent) => {
    e?.stopPropagation();
    if (e && 'preventDefault' in e) e.preventDefault();
    const updated = {
      ...customer,
      notes: noteDraftText.trim(),
    };
    onUpdateCustomer(updated);
    setEditingNoteCustomerId(null);
    notify(`Updated notes for ${customer.name}`, 'success');
  };

  const handleAppendNoteTag = (tag: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setNoteDraftText((prev) => (prev ? `${prev}, ${tag}` : tag));
  };

  const handleQuickAppendTagToCustomer = (customer: Customer, tag: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const currentNotes = customer.notes ? customer.notes.trim() : '';
    const newNotesVal = currentNotes ? `${currentNotes}, ${tag}` : tag;
    const updated = {
      ...customer,
      notes: newNotesVal,
    };
    onUpdateCustomer(updated);
    notify(`Added "${tag}" to ${customer.name}'s preferences`, 'success');
    setActiveMenuCustomerId(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Customer CRM & Loyalty Hub</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Member profiles, quick action notes, instant visit logging, and loyalty rewards
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs transition shadow-xs self-start sm:self-auto"
        >
          <UserPlus size={14} /> Add New Member
        </button>
      </div>

      {/* KPI Cards & Loyalty Program Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Total Registered Members</span>
            <Users size={16} className="text-emerald-700" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 mt-2">{customers.length}</div>
          <span className="text-[10px] text-slate-400">Regulars & Coworkers</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>VIP & Gold Members</span>
            <Crown size={16} className="text-amber-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-700 mt-2">{vipCount}</div>
          <span className="text-[10px] text-amber-600">Top frequency tier</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Active Loyalty Bank</span>
            <Star size={16} className="text-amber-500 fill-amber-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-800 mt-2">
            {totalPoints.toLocaleString()} <span className="text-xs font-sans text-slate-500">pts</span>
          </div>
          <div className="text-[10px] text-amber-700 font-semibold flex items-center gap-1 mt-0.5">
            <Sparkles size={11} /> Worth EGP {(totalPoints * 0.1).toLocaleString()} (500 pts = 50 EGP)
          </div>
        </div>
      </div>

      {/* Loyalty Program Rules Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 rounded-2xl p-4 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm border border-emerald-800">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black text-lg shrink-0 shadow-md">
            ★
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-300">White Table Loyalty Program</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-800/80 text-[10px] font-bold text-emerald-200 border border-emerald-600/50">Active Rule</span>
            </div>
            <p className="text-sm font-semibold text-white mt-0.5">
              500 Points = 50 EGP Store Credit (1 pt = 0.10 EGP)
            </p>
            <p className="text-xs text-emerald-200/80 mt-0.5">
              Members earn 1 pt for every 100 EGP spent. Points can be redeemed in 500-pt blocks (-50 EGP) at POS checkout or directly in CRM.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-stretch md:self-auto justify-end">
          <div className="px-3.5 py-1.5 rounded-xl bg-white/10 border border-white/15 text-center">
            <span className="text-[10px] text-emerald-200 uppercase block font-bold">Exchange Rate</span>
            <span className="text-xs font-bold font-mono text-amber-300">500 pts ➔ 50 EGP</span>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200">
        <div className="relative flex-1 max-w-md">
          <Search size={15} className="absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search member name, phone, preferences..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-700"
          />
        </div>

        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 self-start sm:self-auto overflow-x-auto">
          {['All', 'Founder / VIP', 'Gold VIP', 'Silver Member', 'Regular'].map((tier) => (
            <button
              key={tier}
              onClick={() => setTierFilter(tier)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition whitespace-nowrap ${
                tierFilter === tier
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {tier}
            </button>
          ))}
        </div>
      </div>

      {/* Members Grid / Cards with Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCustomers.map((customer) => {
          const isMenuOpen = activeMenuCustomerId === customer.id;
          const isEditingNote = editingNoteCustomerId === customer.id;
          const isQuickVisitsOpen = quickVisitsCustomerId === customer.id;
          const isHistoryExpanded = expandedHistoryCustomerId === customer.id;

          const customerOrders = orders.filter((o) => o.customerId === customer.id);

          return (
            <div
              key={customer.id}
              onClick={() => setSelectedCustomer(customer)}
              className="bg-white border border-slate-200 hover:border-emerald-700/60 rounded-2xl p-5 transition-all duration-150 cursor-pointer shadow-2xs flex flex-col justify-between space-y-4 hover:shadow-md relative group"
            >
              <div>
                {/* Top row: Avatar, Name, Tier, and Quick Actions Trigger */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white text-sm shrink-0 shadow-2xs"
                      style={{ backgroundColor: customer.avatarColor || '#2F5D57' }}
                    >
                      {customer.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm leading-snug flex items-center gap-1.5">
                        <span>{customer.name}</span>
                        {customer.visits > 3 && (
                          <span
                            title={`Frequent visitor: ${customer.visits} visits`}
                            className="text-emerald-700 inline-flex"
                          >
                            <UserCheck size={13} />
                          </span>
                        )}
                      </h4>
                      <span className="text-[11px] text-slate-400 font-mono block">
                        {customer.phone || customer.email || 'No contact on file'}
                      </span>
                    </div>
                  </div>

                  {/* Tier Badge & Quick Actions Menu Trigger */}
                  <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-50 text-amber-900 border border-amber-200">
                      {customer.tier}
                    </span>

                    {/* Quick Actions Button */}
                    <div className="relative" ref={isMenuOpen ? menuRef : null}>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMenuCustomerId(isMenuOpen ? null : customer.id);
                        }}
                        className={`p-1.5 rounded-lg border transition ${
                          isMenuOpen
                            ? 'bg-emerald-800 text-white border-emerald-800'
                            : 'border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                        }`}
                        title="Quick Actions Menu (Add note, log visit, etc.)"
                      >
                        <MoreVertical size={14} />
                      </button>

                      {/* Dropdown Menu */}
                      {isMenuOpen && (
                        <div
                          className="absolute right-0 top-full mt-1.5 w-60 bg-white rounded-xl shadow-xl border border-slate-200 z-30 p-1.5 text-xs text-slate-800 animate-in fade-in zoom-in duration-100"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="px-2.5 py-1.5 border-b border-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                            <span>Quick Actions</span>
                            <span className="font-mono text-slate-600 font-semibold">{customer.name.split(' ')[0]}</span>
                          </div>

                          {/* Quick Log Visit */}
                          <button
                            type="button"
                            onClick={(e) => handleQuickLogVisit(customer, e)}
                            className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg hover:bg-emerald-50 hover:text-emerald-900 transition text-left text-slate-700 font-medium"
                          >
                            <Calendar size={13} className="text-emerald-700" />
                            <span>Log +1 Visit Today</span>
                            <span className="ml-auto font-mono text-[10px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded">
                              Now: {customer.visits}
                            </span>
                          </button>

                          {/* Quick Note Edit */}
                          <button
                            type="button"
                            onClick={(e) => handleStartEditingNote(customer, e)}
                            className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg hover:bg-slate-100 transition text-left text-slate-700 font-medium"
                          >
                            <MessageSquarePlus size={13} className="text-amber-600" />
                            <span>{customer.notes ? 'Edit Member Notes' : 'Add Quick Note'}</span>
                          </button>

                          {/* Quick Append Tags */}
                          <div className="pt-1.5 pb-1 border-t border-slate-100 mt-1">
                            <span className="px-2.5 text-[9px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                              Quick Add Preference:
                            </span>
                            <div className="grid grid-cols-2 gap-1 px-1">
                              {['Oat Milk', 'Quiet Pod', 'Matcha Lover', 'VIP Service'].map((tag) => (
                                <button
                                  key={tag}
                                  type="button"
                                  onClick={(e) => handleQuickAppendTagToCustomer(customer, tag, e)}
                                  className="px-2 py-1 bg-slate-50 hover:bg-emerald-50 hover:text-emerald-900 hover:border-emerald-300 border border-slate-200 rounded text-[10px] text-slate-600 font-medium text-left truncate transition"
                                >
                                  + {tag}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Quick Loyalty Points Actions (500 pts = 50 EGP) */}
                          <div className="pt-1.5 pb-1 border-t border-slate-100 mt-1">
                            <span className="px-2.5 text-[9px] font-bold uppercase tracking-wider text-amber-800 block mb-1">
                              Loyalty Actions (500 pts = 50 EGP):
                            </span>
                            <div className="space-y-1 px-1">
                              <button
                                type="button"
                                onClick={(e) => handleRedeemLoyaltyPoints(customer, 500, e)}
                                disabled={customer.points < 500}
                                className="w-full flex items-center justify-between px-2 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-950 text-[11px] font-bold border border-amber-200 disabled:opacity-40 disabled:pointer-events-none transition"
                              >
                                <span className="flex items-center gap-1.5">
                                  <Star size={12} className="text-amber-600 fill-amber-500" />
                                  Redeem 500 pts
                                </span>
                                <span className="font-mono text-emerald-800">-50 EGP</span>
                              </button>

                              <button
                                type="button"
                                onClick={(e) => handleAwardLoyaltyPoints(customer, 100, e)}
                                className="w-full flex items-center justify-between px-2 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-800 text-[11px] font-medium border border-slate-200 transition"
                              >
                                <span>+ Award 100 Points</span>
                                <span className="font-mono text-amber-600 font-bold">+10 EGP val</span>
                              </button>
                            </div>
                          </div>

                          {/* Order History Summary Toggle */}
                          <div className="pt-1.5 border-t border-slate-100 mt-1">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setExpandedHistoryCustomerId(isHistoryExpanded ? null : customer.id);
                                setActiveMenuCustomerId(null);
                              }}
                              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-slate-100 transition text-left text-slate-700 text-[11px]"
                            >
                              <ShoppingBag size={12} className="text-slate-500" />
                              <span>
                                {isHistoryExpanded ? 'Hide' : 'Quick View'} Orders ({customerOrders.length})
                              </span>
                            </button>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedCustomer(customer);
                                setActiveMenuCustomerId(null);
                              }}
                              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-slate-100 transition text-left text-slate-700 text-[11px]"
                            >
                              <ExternalLink size={12} className="text-slate-500" />
                              <span>Open Full Profile Modal</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Notes Section & Inline Editor without modal */}
                <div className="mt-3" onClick={(e) => e.stopPropagation()}>
                  {isEditingNote ? (
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-emerald-600 shadow-2xs space-y-2">
                      <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                        <span className="flex items-center gap-1">
                          <Edit3 size={11} /> Inline Notes Editor
                        </span>
                        <button
                          type="button"
                          onClick={() => setEditingNoteCustomerId(null)}
                          className="text-slate-400 hover:text-slate-600"
                        >
                          <X size={13} />
                        </button>
                      </div>

                      <textarea
                        autoFocus
                        rows={2}
                        value={noteDraftText}
                        onChange={(e) => setNoteDraftText(e.target.value)}
                        placeholder="Add dietary preferences, work habits, favorite drink..."
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-700"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                            handleSaveNote(customer, e);
                          }
                          if (e.key === 'Escape') {
                            setEditingNoteCustomerId(null);
                          }
                        }}
                      />

                      {/* Quick Tag Chips */}
                      <div className="flex flex-wrap gap-1">
                        {COMMON_NOTE_TAGS.slice(0, 4).map((tag) => (
                          <button
                            key={tag}
                            type="button"
                            onClick={(e) => handleAppendNoteTag(tag, e)}
                            className="px-1.5 py-0.5 rounded bg-white hover:bg-emerald-50 text-[10px] text-slate-600 border border-slate-200 hover:border-emerald-400 transition"
                          >
                            + {tag}
                          </button>
                        ))}
                      </div>

                      {/* Save & Cancel */}
                      <div className="flex items-center justify-end gap-1.5 pt-1">
                        <button
                          type="button"
                          onClick={() => setEditingNoteCustomerId(null)}
                          className="px-2.5 py-1 rounded-lg text-[11px] font-semibold text-slate-500 hover:bg-slate-200 transition"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleSaveNote(customer, e)}
                          className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-[11px] transition shadow-2xs"
                        >
                          <Check size={11} /> Save Note
                        </button>
                      </div>
                    </div>
                  ) : customer.notes ? (
                    <div
                      onClick={(e) => handleStartEditingNote(customer, e)}
                      title="Click to edit note directly"
                      className="group/note text-[11px] text-slate-600 italic bg-slate-50 hover:bg-amber-50/60 p-2.5 rounded-xl border border-slate-100 hover:border-amber-300 transition cursor-text relative"
                    >
                      <p className="line-clamp-2">"{customer.notes}"</p>
                      <span className="text-[9px] text-amber-800 font-sans font-bold opacity-0 group-hover/note:opacity-100 transition absolute right-2 bottom-1.5 flex items-center gap-0.5">
                        <Edit3 size={10} /> Edit
                      </span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={(e) => handleStartEditingNote(customer, e)}
                      className="w-full text-left text-[11px] text-slate-400 hover:text-emerald-800 bg-slate-50/50 hover:bg-emerald-50/50 p-2 rounded-xl border border-dashed border-slate-200 hover:border-emerald-300 transition flex items-center gap-1.5"
                    >
                      <Plus size={11} /> <span>Add customer preference or note...</span>
                    </button>
                  )}
                </div>

                {/* Inline Quick Orders History Preview (if expanded) */}
                {isHistoryExpanded && (
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="mt-3 p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      <span>Recent Orders ({customerOrders.length})</span>
                      <button
                        onClick={() => setExpandedHistoryCustomerId(null)}
                        className="text-slate-400 hover:text-slate-600"
                      >
                        <X size={11} />
                      </button>
                    </div>
                    {customerOrders.length > 0 ? (
                      <div className="space-y-1 max-h-24 overflow-y-auto pr-1">
                        {customerOrders.slice(0, 3).map((ord) => (
                          <div
                            key={ord.id}
                            className="flex items-center justify-between text-[11px] bg-white p-1.5 rounded border border-slate-200/60"
                          >
                            <span className="font-medium text-slate-800 truncate max-w-[130px]">
                              {ord.label}
                            </span>
                            <span className="font-mono font-bold text-emerald-800">
                              EGP {ord.total.toFixed(0)}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[10px] text-slate-400 italic">No orders logged yet for this member</p>
                    )}
                  </div>
                )}
              </div>

              {/* Bottom Row Stats with Quick Increment / Adjustment Actions */}
              <div
                className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs"
                onClick={(e) => e.stopPropagation()}
              >
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Spent</span>
                  <span className="font-mono font-bold text-emerald-800">
                    EGP {customer.spent.toLocaleString()}
                  </span>
                </div>

                {/* Interactive Visits Counter with Quick Log Button */}
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Visits</span>
                    <button
                      type="button"
                      onClick={(e) => handleQuickLogVisit(customer, e)}
                      title="Log +1 visit right now"
                      className="px-1 py-0.2 rounded bg-emerald-100 hover:bg-emerald-200 text-emerald-900 font-bold font-mono text-[9px] border border-emerald-300 transition"
                    >
                      +1 Log
                    </button>
                  </div>

                  <div className="flex items-center gap-1 mt-0.5">
                    <button
                      type="button"
                      onClick={(e) => handleAdjustVisits(customer, -1, e)}
                      title="Decrement 1 visit"
                      className="p-0.5 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                    >
                      <Minus size={10} />
                    </button>
                    <span className="font-mono font-bold text-slate-800 text-xs px-1">
                      {customer.visits}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => handleAdjustVisits(customer, 1, e)}
                      title="Increment 1 visit"
                      className="p-0.5 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                    >
                      <Plus size={10} />
                    </button>
                  </div>
                </div>

                <div className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Loyalty</span>
                    {customer.points >= 500 && (
                      <button
                        type="button"
                        onClick={(e) => handleRedeemLoyaltyPoints(customer, 500, e)}
                        title="Redeem 500 pts for 50 EGP credit now"
                        className="px-1 py-0.2 rounded bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold font-mono text-[9px] border border-amber-300 transition"
                      >
                        -50 EGP
                      </button>
                    )}
                  </div>
                  <span className="font-mono font-bold text-amber-700 flex items-center justify-end gap-1">
                    <Star size={11} className="fill-amber-500 text-amber-500" /> {customer.points} <span className="text-[10px] text-slate-400 font-normal">pts</span>
                  </span>
                  <span className="text-[9px] text-slate-400 block font-mono">
                    ≈ {(customer.points * 0.1).toFixed(0)} EGP
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredCustomers.length === 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-400">
          <Users size={32} className="mx-auto text-slate-300 stroke-1 mb-2" />
          <p className="text-xs font-semibold text-slate-600">No members match the query</p>
        </div>
      )}

      {/* Customer Detail Profile Modal (Opens when user wants full deep-dive) */}
      {selectedCustomer && (
        <CustomerDetailModal
          customer={selectedCustomer}
          orders={orders}
          onClose={() => setSelectedCustomer(null)}
          onUpdateCustomer={(upd) => {
            onUpdateCustomer(upd);
            setSelectedCustomer(upd);
          }}
        />
      )}

      {/* New Customer Modal */}
      {isAddModalOpen && (
        <div
          onClick={() => setIsAddModalOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in duration-150"
          >
            <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50">
              <h3 className="text-base font-bold text-slate-900">Add New Member</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateCustomer} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-600 block mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Tarek Mansour"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:border-emerald-700 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-600 block mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="+20 100..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:border-emerald-700 font-mono"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-600 block mb-1">
                    Tier
                  </label>
                  <select
                    value={newTier}
                    onChange={(e) => setNewTier(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:border-emerald-700 font-medium"
                  >
                    <option value="Regular">Regular</option>
                    <option value="Silver Member">Silver Member</option>
                    <option value="Gold VIP">Gold VIP</option>
                    <option value="Founder / VIP">Founder / VIP</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-600 block mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="tarek@example.com"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:border-emerald-700"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-600 block mb-1">
                  Preferences / Dietary Notes
                </label>
                <input
                  type="text"
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="e.g. Loves iced matcha, works in Meeting Room..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:border-emerald-700"
                />
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-200 -mx-5 -mb-5 mt-5 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs transition shadow-sm"
                >
                  Save Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

