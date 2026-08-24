import React, { useState } from 'react';
import {
  Lock,
  User,
  KeyRound,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  X,
} from 'lucide-react';
import { WhiteTableLogo } from '../WhiteTableLogo';
import { SYSTEM_USERS, UserAccount, authenticateUser } from '../../utils/auth';
import { useLanguage } from '../../i18n/LanguageContext';

interface SignInModalProps {
  isOpen: boolean;
  currentUser: UserAccount;
  onLoginSuccess: (user: UserAccount) => void;
  onClose?: () => void;
  canDismiss?: boolean;
}

export const SignInModal: React.FC<SignInModalProps> = ({
  isOpen,
  currentUser,
  onLoginSuccess,
  onClose,
  canDismiss = true,
}) => {
  const { lang, t } = useLanguage();
  const [username, setUsername] = useState(currentUser.username || 'cashier');
  const [password, setPassword] = useState('123');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);

    setTimeout(() => {
      const authenticated = authenticateUser(username, password);
      if (authenticated) {
        onLoginSuccess(authenticated);
      } else {
        setErrorMsg(
          lang === 'ar'
            ? 'اسم المستخدم أو كلمة المرور غير صحيحة (رمز المرور الافتراضي: 123)'
            : 'Invalid username or password. (Default passcode: 123)'
        );
      }
      setIsSubmitting(false);
    }, 200);
  };

  const handleQuickSelectUser = (user: UserAccount) => {
    setUsername(user.username);
    setPassword(user.password);
    setErrorMsg('');
  };

  const handleInstantLogin = (user: UserAccount) => {
    onLoginSuccess(user);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-zinc-200 text-zinc-900 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="bg-zinc-950 p-6 text-white text-center relative">
          {canDismiss && onClose && (
            <button
              type="button"
              onClick={onClose}
              className="absolute top-4 end-4 p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition cursor-pointer"
            >
              <X size={18} />
            </button>
          )}

          <div className="inline-flex p-3 rounded-2xl bg-white text-black shadow-lg mb-3">
            <WhiteTableLogo size={36} dark={false} />
          </div>

          <h2 className="text-lg font-black tracking-tight uppercase font-sans">
            {lang === 'ar' ? 'تسجيل الدخول للنظام' : 'System Sign In'}
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            {lang === 'ar'
              ? 'يرجى تسجيل الدخول باستخدام اسم المستخدم وكلمة المرور الخاصة بحسابك'
              : 'Sign in with your assigned staff credentials to access authorized tools'}
          </p>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-5">
          {/* Quick User Selector Chips for Seamless Handover & Testing */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
              <span className="flex items-center gap-1.5">
                <Sparkles size={13} className="text-amber-500" />
                {lang === 'ar' ? 'اختيار حساب سريع (نقرة واحدة)' : 'Quick 1-Click User Profiles'}
              </span>
              <span className="text-[10px] text-zinc-400 font-normal lowercase">
                pass: 123
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {SYSTEM_USERS.map((u) => {
                const isSelected = username.toLowerCase() === u.username.toLowerCase();
                return (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => handleInstantLogin(u)}
                    className={`p-2.5 rounded-2xl border text-start transition flex flex-col justify-between gap-1 cursor-pointer ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50/70 ring-2 ring-emerald-600/20'
                        : 'border-zinc-200 bg-zinc-50/80 hover:bg-zinc-100 hover:border-zinc-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className="w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black text-white"
                        style={{ backgroundColor: u.avatarColor }}
                      >
                        {u.initials}
                      </span>
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-zinc-200 text-zinc-700">
                        {lang === 'ar' ? u.badgeAr : u.badgeEn}
                      </span>
                    </div>
                    <div>
                      <div className="text-xs font-bold text-zinc-900 truncate">
                        {lang === 'ar' ? u.nameAr : u.name}
                      </div>
                      <div className="text-[10px] text-zinc-500 font-mono">
                        @{u.username}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-zinc-200"></div>
            <span className="flex-shrink mx-3 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
              {lang === 'ar' ? 'أو أدخل بيانات الدخول' : 'Or enter credentials'}
            </span>
            <div className="flex-grow border-t border-zinc-200"></div>
          </div>

          {/* Form inputs */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {errorMsg && (
              <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
                <AlertCircle size={16} className="text-rose-600 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-600 block mb-1">
                {lang === 'ar' ? 'اسم المستخدم' : 'Username'}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 start-0 ps-3.5 flex items-center pointer-events-none text-zinc-400">
                  <User size={16} />
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. cashier, manager, owner..."
                  className="w-full ps-10 pe-4 py-2.5 rounded-2xl border border-zinc-200 bg-zinc-50 focus:bg-white focus:outline-none focus:border-emerald-600 focus:ring-3 focus:ring-emerald-500/10 text-xs font-medium transition"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-600 block mb-1">
                {lang === 'ar' ? 'كلمة المرور / الرمز السري' : 'Password / Passcode'}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 start-0 ps-3.5 flex items-center pointer-events-none text-zinc-400">
                  <KeyRound size={16} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••"
                  className="w-full ps-10 pe-11 py-2.5 rounded-2xl border border-zinc-200 bg-zinc-50 focus:bg-white focus:outline-none focus:border-emerald-600 focus:ring-3 focus:ring-emerald-500/10 text-xs font-mono font-medium transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 end-0 pe-3.5 flex items-center text-zinc-400 hover:text-zinc-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-bold text-xs transition shadow-md flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              <ShieldCheck size={16} />
              <span>
                {isSubmitting
                  ? lang === 'ar'
                    ? 'جاري التحقق...'
                    : 'Authenticating...'
                  : lang === 'ar'
                  ? 'تسجيل الدخول ومتابعة العمل'
                  : 'Sign In & Launch POS'}
              </span>
              <ArrowRight size={14} className={lang === 'ar' ? 'rotate-180' : ''} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
