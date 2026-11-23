import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { X, Mic, Lock, User as UserIcon, Phone, CheckCircle, Loader2 } from 'lucide-react';

interface Props {
  onClose: () => void;
}

export const AuthModal: React.FC<Props> = ({ onClose }) => {
  const { login, requestArtisanOtp, verifyArtisanOtp } = useAuth();
  const { language } = useLanguage();
  const [tab, setTab] = useState<'customer' | 'artisan'>('customer');

  // Customer Login State
  const [identifier, setIdentifier] = useState('arjun.connoisseur@gmail.com');
  const [password, setPassword] = useState('password123');

  // Artisan OTP State
  const [phone, setPhone] = useState('+919876543201'); // Dipankar Kundu
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [testOtpNotice, setTestOtpNotice] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleCustomerLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    try {
      await login(identifier, password);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Invalid login credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleSendArtisanOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await requestArtisanOtp(phone, language);
      setOtpSent(true);
      if (res.testOtp) {
        setTestOtpNotice(`Verification Code Sent: ${res.testOtp}`);
        setOtp(res.testOtp);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to request OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyArtisanOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    try {
      await verifyArtisanOtp({ phoneNumber: phone, otp });
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Invalid OTP code');
    } finally {
      setLoading(false);
    }
  };

  const setAdminDemo = () => {
    setTab('customer');
    setIdentifier('admin@kalasetu.org');
    setPassword('admin123456');
  };

  const setCustomerDemo = () => {
    setTab('customer');
    setIdentifier('arjun.connoisseur@gmail.com');
    setPassword('password123');
  };

  const setArtisanDemo = () => {
    setTab('artisan');
    setPhone('+919876543201');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-fade-in text-xs">
      <div className="bg-white rounded-2xl max-w-md w-full border border-clayborder shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-stone-900 text-white p-5 flex items-center justify-between">
          <div>
            <h3 className="font-heritage font-bold text-lg">
              Sign In to KalaSetu
            </h3>
            <p className="text-stone-400 text-xs">
              Direct-to-Connoisseur Fair-Trade Portal
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-white p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-stone-200">
          <button
            type="button"
            onClick={() => {
              setTab('customer');
              setErrorMsg(null);
            }}
            className={`flex-1 py-3 text-center font-bold text-xs flex items-center justify-center space-x-1.5 transition-colors ${
              tab === 'customer'
                ? 'border-b-2 border-terracotta-600 text-terracotta-700 bg-stone-50'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <UserIcon className="w-3.5 h-3.5" />
            <span>Patron / Customer</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setTab('artisan');
              setErrorMsg(null);
            }}
            className={`flex-1 py-3 text-center font-bold text-xs flex items-center justify-center space-x-1.5 transition-colors ${
              tab === 'artisan'
                ? 'border-b-2 border-amber-600 text-amber-700 bg-amber-50/50'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <Mic className="w-3.5 h-3.5" />
            <span>Master Artisan (Phone/OTP)</span>
          </button>
        </div>

        {errorMsg && (
          <div className="m-4 bg-red-50 text-red-700 border border-red-200 p-3 rounded-xl text-center">
            {errorMsg}
          </div>
        )}

        {/* Tab 1: Customer / Admin Login */}
        {tab === 'customer' && (
          <form onSubmit={handleCustomerLogin} className="p-6 space-y-4">
            <div>
              <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1">
                Email Address or Phone
              </label>
              <input
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-stone-300 text-xs text-stone-900"
              />
            </div>

            <div>
              <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-stone-300 text-xs text-stone-900"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-terracotta-600 hover:bg-terracotta-700 text-white font-bold transition-all shadow-md flex items-center justify-center space-x-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Sign In as Patron</span>}
            </button>

            {/* Quick Demo Credentials */}
            <div className="pt-2 border-t border-stone-100 flex justify-center space-x-2 text-[11px]">
              <button
                type="button"
                onClick={setCustomerDemo}
                className="text-stone-500 hover:text-stone-900 underline"
              >
                Use Patron Demo
              </button>
              <span className="text-stone-300">•</span>
              <button
                type="button"
                onClick={setAdminDemo}
                className="text-stone-500 hover:text-stone-900 underline"
              >
                Use Admin Demo
              </button>
            </div>
          </form>
        )}

        {/* Tab 2: Artisan OTP Login */}
        {tab === 'artisan' && (
          <div className="p-6 space-y-4">
            <p className="text-stone-600 leading-relaxed text-[11px]">
              Designed for craftspeople with limited digital literacy. Log in with your mobile number to receive a vernacular verification code.
            </p>

            {testOtpNotice && (
              <div className="bg-amber-50 text-amber-900 border border-amber-300 p-2.5 rounded-xl font-bold text-center">
                {testOtpNotice}
              </div>
            )}

            {!otpSent ? (
              <form onSubmit={handleSendArtisanOtp} className="space-y-4">
                <div>
                  <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Artisan Mobile Number
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+919876543201"
                      className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-stone-300 font-mono text-xs text-stone-900"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold transition-all shadow-md flex items-center justify-center space-x-2"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Send OTP to Mobile</span>}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyArtisanOtp} className="space-y-4">
                <div>
                  <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Enter 6-Digit Verification Code
                  </label>
                  <input
                    type="text"
                    required
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="123456"
                    className="w-full p-2.5 rounded-lg border border-stone-300 font-mono text-center text-lg font-bold tracking-widest text-stone-900"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold transition-all shadow-md flex items-center justify-center space-x-2"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Verify & Open Artisan Studio</span>}
                </button>

                <button
                  type="button"
                  onClick={() => setOtpSent(false)}
                  className="w-full text-center text-stone-500 hover:text-stone-800 text-[11px] underline"
                >
                  Change Mobile Number
                </button>
              </form>
            )}

            <div className="pt-2 border-t border-stone-100 text-center">
              <button
                type="button"
                onClick={setArtisanDemo}
                className="text-stone-500 hover:text-stone-900 underline text-[11px]"
              >
                Prefill Dipankar Kundu (Terracotta Lineage)
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
