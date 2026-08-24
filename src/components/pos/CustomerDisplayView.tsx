import React, { useState, useEffect } from 'react';
import { Coffee, Wifi, Sparkles, CheckCircle2, QrCode, Clock, ArrowLeft } from 'lucide-react';
import { WhiteTableLogo } from '../WhiteTableLogo';

interface CustomerDisplayViewProps {
  onExit?: () => void;
}

export const CustomerDisplayView: React.FC<CustomerDisplayViewProps> = ({ onExit }) => {
  const [displayState, setDisplayState] = useState<{
    status: 'idle' | 'cart' | 'completed';
    items: Array<{ name: string; qty: number; price: number }>;
    subtotal: number;
    discount: number;
    tax: number;
    total: number;
    orderNumber?: string;
    pointsEarned?: number;
  }>({
    status: 'idle',
    items: [],
    subtotal: 0,
    discount: 0,
    tax: 0,
    total: 0,
  });

  const [timeStr, setTimeStr] = useState('');

  useEffect(() => {
    const updateTime = () => {
      setTimeStr(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || !('BroadcastChannel' in window)) return;
    const channel = new BroadcastChannel('wt_customer_display_feed');

    channel.onmessage = (event) => {
      const data = event.data;
      if (data.type === 'CART_UPDATE') {
        setDisplayState({
          status: data.items && data.items.length > 0 ? 'cart' : 'idle',
          items: data.items || [],
          subtotal: data.subtotal || 0,
          discount: data.discount || 0,
          tax: data.tax || 0,
          total: data.total || 0,
        });
      } else if (data.type === 'ORDER_COMPLETE') {
        setDisplayState((prev) => ({
          ...prev,
          status: 'completed',
          total: data.total || prev.total,
          orderNumber: data.orderNumber,
          pointsEarned: data.pointsEarned,
        }));
        setTimeout(() => {
          setDisplayState({
            status: 'idle',
            items: [],
            subtotal: 0,
            discount: 0,
            tax: 0,
            total: 0,
          });
        }, 8000);
      } else if (data.type === 'IDLE') {
        setDisplayState({
          status: 'idle',
          items: [],
          subtotal: 0,
          discount: 0,
          tax: 0,
          total: 0,
        });
      }
    };

    return () => {
      channel.close();
    };
  }, []);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col justify-between p-8 select-none font-sans">
      {/* Top Header */}
      <header className="flex items-center justify-between pb-6 border-b border-zinc-800">
        <div className="flex items-center gap-4">
          <div className="p-2 rounded-2xl bg-white text-black shadow-lg">
            <WhiteTableLogo size={42} dark={false} />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white uppercase">WHITE TABLE</h1>
            <p className="text-xs text-emerald-400 font-semibold tracking-widest uppercase">
              Café · Coworking Hub · Restaurant
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {onExit && (
            <button
              onClick={onExit}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs font-semibold text-zinc-300 hover:text-white transition"
              title="Return to Main POS & Management System"
            >
              <ArrowLeft size={14} />
              <span>Back to POS</span>
            </button>
          )}
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-sm font-mono text-emerald-400">
            <Clock size={16} />
            <span>{timeStr}</span>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-xs text-zinc-400">
            <Wifi size={14} className="text-emerald-500" />
            <span>Guest WiFi: <strong className="text-white">WhiteTable_Guest</strong></span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {displayState.status === 'idle' && (
          <div className="lg:col-span-12 text-center py-16 space-y-6">
            <div className="w-24 h-24 mx-auto rounded-full bg-zinc-900 border-2 border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-2xl">
              <WhiteTableLogo size={64} dark={true} />
            </div>
            <div className="space-y-2">
              <h2 className="text-4xl font-extrabold text-white tracking-tight">Welcome to White Table</h2>
              <p className="text-zinc-400 text-base max-w-md mx-auto">
                Specialty single-origin coffee, handcrafted breakfast toasts, and peaceful coworking space.
              </p>
            </div>
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-sm font-bold">
              <Sparkles size={16} /> Ready for your order at Register #01
            </div>
          </div>
        )}

        {displayState.status === 'completed' && (
          <div className="lg:col-span-12 text-center py-12 space-y-6 animate-in zoom-in-95 duration-200">
            <div className="w-20 h-20 mx-auto rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-xl shadow-emerald-900/40">
              <CheckCircle2 size={44} />
            </div>
            <div className="space-y-2">
              <h2 className="text-4xl font-black text-white">Payment Received!</h2>
              <p className="text-zinc-400 text-base">
                Your order is being handcrafted at the barista & kitchen station.
              </p>
            </div>
            <div className="inline-block p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-2">
              <div className="text-xs text-zinc-400 uppercase tracking-wider">Total Paid</div>
              <div className="text-3xl font-black font-mono text-emerald-400">
                EGP {displayState.total.toFixed(2)}
              </div>
              {displayState.pointsEarned && (
                <div className="text-xs text-emerald-300 font-bold">
                  +{displayState.pointsEarned} Loyalty Points Added
                </div>
              )}
            </div>
          </div>
        )}

        {displayState.status === 'cart' && (
          <>
            {/* Live Cart Item List */}
            <div className="lg:col-span-7 bg-zinc-950 rounded-2xl border border-zinc-800 p-6 space-y-4 max-h-[500px] overflow-y-auto">
              <div className="text-xs font-bold uppercase tracking-wider text-zinc-400 pb-2 border-b border-zinc-800">
                Current Order Details ({displayState.items.reduce((s, i) => s + i.qty, 0)} Items)
              </div>
              <div className="space-y-3">
                {displayState.items.map((it, idx) => (
                  <div key={idx} className="flex items-center justify-between py-2 border-b border-zinc-900">
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-emerald-400 font-mono font-bold text-sm">
                        {it.qty}x
                      </span>
                      <span className="text-base font-semibold text-zinc-100">{it.name}</span>
                    </div>
                    <span className="text-base font-mono font-bold text-white">
                      EGP {it.price.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Financial Summary & InstaPay QR */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-zinc-950 rounded-2xl border border-zinc-800 p-6 space-y-3">
                <div className="flex justify-between text-sm text-zinc-400">
                  <span>Subtotal</span>
                  <span className="font-mono text-zinc-200">EGP {displayState.subtotal.toFixed(2)}</span>
                </div>
                {displayState.discount > 0 && (
                  <div className="flex justify-between text-sm text-rose-400">
                    <span>Discount</span>
                    <span className="font-mono">-EGP {displayState.discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm text-zinc-400">
                  <span>14% VAT (ضريبة القيمة المضافة)</span>
                  <span className="font-mono text-zinc-200">EGP {displayState.tax.toFixed(2)}</span>
                </div>
                <div className="pt-3 border-t border-zinc-800 flex justify-between items-baseline">
                  <span className="text-lg font-bold text-white">Amount Due</span>
                  <span className="text-3xl font-black font-mono text-emerald-400">
                    EGP {displayState.total.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* InstaPay QR Code Quick Pay */}
              <div className="bg-emerald-950/40 rounded-2xl border border-emerald-500/30 p-5 flex items-center gap-4">
                <div className="p-3 bg-white rounded-xl shrink-0 text-black">
                  <QrCode size={48} />
                </div>
                <div className="space-y-1">
                  <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                    Instant Bank / InstaPay
                  </div>
                  <div className="text-sm font-semibold text-white">whitetable@instapay</div>
                  <div className="text-[11px] text-zinc-400">Scan QR to pay directly from your mobile banking app</div>
                </div>
              </div>
            </div>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="pt-6 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-500">
        <div>White Table POS · Register #01 · Dahab / New Cairo</div>
        <div className="text-emerald-400 font-semibold">14% VAT Included on All Tax Invoices</div>
      </footer>
    </div>
  );
};
