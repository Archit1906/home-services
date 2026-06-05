import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, Phone, MapPin, Shield, CheckCircle, ArrowLeft } from 'lucide-react';
import { useAuthStore } from '../store/authStore.js';
import { useToastStore } from '../store/toastStore.js';
import Button from '../components/ui/Button.jsx';
import Input from '../components/ui/Input.jsx';
import Card from '../components/ui/Card.jsx';
import Modal from '../components/ui/Modal.jsx';

export default function AuthPage() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const { login, register, sendOtp, verifyOtp, loading } = useAuthStore();
  const { addToast } = useToastStore();

  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState('user'); // Default to homeowner

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);

  // OTP flow states
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpSentCode, setOtpSentCode] = useState(''); // Simulated code from API for easy copy-paste
  const [otpLoading, setOtpLoading] = useState(false);

  useEffect(() => {
    if (location.state?.selectedRole) {
      setRole(location.state.selectedRole);
      setIsLogin(false); // Go directly to signup
    }
  }, [location.state]);

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    if (isLogin) {
      // Login flow
      try {
        await login(email, password);
        addToast('Welcome back to HomeConnect!', 'success');
        navigate('/dashboard/home');
      } catch (err) {
        addToast(err.message || 'Invalid email or password', 'error');
      }
    } else {
      // Register validation
      if (!name || !email || !password || !phone || !city) {
        addToast('Please fill out all fields', 'warning');
        return;
      }
      if (!agreeTerms) {
        addToast('You must agree to the Terms of Service', 'warning');
        return;
      }

      // Step 1: Send mock OTP to phone
      setOtpLoading(true);
      try {
        const res = await sendOtp(phone);
        setOtpSentCode(res.otp || ''); // Keep the simulated code
        addToast('OTP sent successfully (Simulated)', 'info');
        setShowOtpModal(true);
      } catch (err) {
        addToast(err.message || 'Failed to send OTP code', 'error');
      } finally {
        setOtpLoading(false);
      }
    }
  };

  const handleOtpVerify = async (e) => {
    e.preventDefault();
    if (!otpCode || otpCode.length !== 6) {
      addToast('Please enter a valid 6-digit OTP', 'warning');
      return;
    }

    setOtpLoading(true);
    try {
      // Verify simulated OTP
      await verifyOtp(phone, otpCode);
      addToast('OTP verified! Finalizing registration...', 'success');
      
      // Step 2: Register user with mock data
      await register({
        name,
        email,
        password,
        phone,
        city,
        role
      });

      setShowOtpModal(false);
      addToast('Registration complete. Welcome!', 'success');
      navigate('/dashboard/home');
    } catch (err) {
      addToast(err.message || 'Incorrect OTP code', 'error');
    } finally {
      setOtpLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-6 relative overflow-hidden">
      {/* Decorative Blur Backgrounds */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-secondary/10 rounded-full blur-3xl -z-10" />

      {/* Floating Back CTA */}
      <button
        onClick={() => navigate('/')}
        className="absolute top-8 left-8 flex items-center gap-2 text-text-secondary hover:text-text-primary text-sm font-bold transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Home
      </button>

      <Card className="w-full max-w-lg shadow-elevated p-8 relative">
        <h2 className="text-3xl font-display font-black text-center mb-1">
          {isLogin ? 'Welcome Back' : 'Create Account'}
        </h2>
        <p className="text-text-secondary dark:text-text-darkSecondary text-sm font-semibold text-center mb-8 uppercase tracking-wider">
          {isLogin ? 'Log in to continue your journey' : 'Join our neighborhood network'}
        </p>

        <form onSubmit={handleAuthSubmit} className="space-y-5">
          {/* Dual Toggle for Login vs Register */}
          <div className="flex bg-slate-200/50 dark:bg-slate-900/50 p-1 rounded-xl mb-6">
            <button
              type="button"
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
                isLogin ? 'bg-white dark:bg-slate-800 text-text-primary shadow-default' : 'text-text-secondary'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
                !isLogin ? 'bg-white dark:bg-slate-800 text-text-primary shadow-default' : 'text-text-secondary'
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Account Role Selector (Sign up only) */}
          {!isLogin && (
            <div className="space-y-1">
              <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                Select Profile Role
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('user')}
                  className={`py-3 px-4 border rounded-input font-bold text-sm transition-all ${
                    role === 'user'
                      ? 'border-primary bg-primary-light text-primary shadow-sm'
                      : 'border-border dark:border-border-dark bg-white dark:bg-slate-900 text-text-secondary'
                  }`}
                >
                  Homeowner
                </button>
                <button
                  type="button"
                  onClick={() => setRole('worker')}
                  className={`py-3 px-4 border rounded-input font-bold text-sm transition-all ${
                    role === 'worker'
                      ? 'border-accent bg-emerald-50 text-accent dark:bg-emerald-950/20 dark:text-emerald-300 shadow-sm'
                      : 'border-border dark:border-border-dark bg-white dark:bg-slate-900 text-text-secondary'
                  }`}
                >
                  Service Pro
                </button>
              </div>
            </div>
          )}

          {/* Signup Specific Fields */}
          {!isLogin && (
            <Input
              label="Full Name"
              id="name"
              placeholder="e.g. John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              icon={<User className="h-5 w-5" />}
              required
            />
          )}

          <Input
            label="Email Address"
            id="email"
            type="email"
            placeholder="e.g. email@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            icon={<Mail className="h-5 w-5" />}
            required
          />

          <Input
            label="Password"
            id="password"
            type="password"
            placeholder="Password (min 6 characters)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            icon={<Lock className="h-5 w-5" />}
            required
          />

          {/* Signup Specific Fields */}
          {!isLogin && (
            <>
              <Input
                label="Phone Number"
                id="phone"
                type="tel"
                placeholder="e.g. +1 555-0199"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                icon={<Phone className="h-5 w-5" />}
                required
              />

              <Input
                label="City / Region"
                id="city"
                placeholder="e.g. New York"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                icon={<MapPin className="h-5 w-5" />}
                required
              />

              {/* Terms Checkbox */}
              <label className="flex items-start gap-3 cursor-pointer select-none py-1 ml-1">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="rounded border-border text-primary focus:ring-primary/20 h-4 w-4 mt-0.5"
                />
                <span className="text-xs text-text-secondary leading-normal">
                  I agree to the <span className="text-primary font-semibold hover:underline">Terms of Service</span> and <span className="text-primary font-semibold hover:underline">Privacy Policy</span>.
                </span>
              </label>
            </>
          )}

          <Button
            type="submit"
            variant={isLogin ? 'primary' : 'primary'}
            className="w-full mt-4"
            loading={loading || otpLoading}
          >
            {isLogin ? 'Log In' : 'Proceed with Phone Verification'}
          </Button>
        </form>
      </Card>

      {/* OTP Code Entry Modal */}
      <Modal
        isOpen={showOtpModal}
        onClose={() => setShowOtpModal(false)}
        title="Phone Verification"
      >
        <form onSubmit={handleOtpVerify} className="space-y-4">
          <div className="flex flex-col items-center text-center gap-2 py-4">
            <div className="p-4 bg-primary/10 rounded-full text-primary">
              <Shield className="h-8 w-8" />
            </div>
            <h4 className="font-bold text-base">We sent an verification code</h4>
            <p className="text-xs text-text-secondary max-w-xs leading-relaxed">
              Enter the 6-digit verification code sent to your phone number <strong>{phone}</strong>.
            </p>
          </div>

          {otpSentCode && (
            <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 p-3 rounded-lg text-center text-xs text-amber-800 dark:text-amber-300 font-semibold mb-4">
              [Simulated SMS] Code: <span className="underline select-all">{otpSentCode}</span>
            </div>
          )}

          <Input
            label="6-Digit OTP Code"
            id="otpCode"
            placeholder="XXXXXX"
            maxLength={6}
            value={otpCode}
            onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
            className="text-center font-display tracking-widest text-lg"
            required
          />

          <div className="flex gap-3 mt-6">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setShowOtpModal(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              className="flex-1 animate-pulse"
              loading={otpLoading}
            >
              Verify Code
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
export { AuthPage };
