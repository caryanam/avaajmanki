import React, { useState } from 'react';
import { AuthLayout } from '../../components/layout/AuthLayout.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { authService } from '../../services/authService.js';
import { Modal } from '../../components/common/Modal.jsx';
import {
  Eye, EyeOff, CheckCircle2,
  Mic2, ArrowLeft, Check, KeyRound, Mail
} from 'lucide-react';
import { validateStandardPassword, getPasswordStrengthChecks } from '../../utils/passwordValidation.js';

/* ─── Palette ──────────────────────────────────────────── */
const C = {
  bg: '#E1DCDB',
  card: '#F7F4F3',
  eclipse: '#2D1D15',
  zorba: '#9F9794',
  hurricane: '#8C8385',
  plum: '#6F405F',
  plumDark: '#5A3350',
  plumLight: 'rgba(111,64,95,0.08)',
  border: '#D4CECC',
  success: '#2E7D52',
  error: '#B33A3A',
};

/* ─── Shared input style ────────────────────────────────── */
const inp = (focused, error) => ({
  width: '100%',
  padding: '9px 12px',
  borderRadius: '8px',
  border: `1.5px solid ${error ? C.error : focused ? C.eclipse : C.border}`,
  background: '#fff',
  fontSize: '13px',
  color: C.eclipse,
  outline: 'none',
  boxSizing: 'border-box',
  fontFamily: 'inherit',
  transition: 'border-color 0.18s',
});

/* ─── Small label ───────────────────────────────────────── */
function Label({ children, required }) {
  return (
    <span style={{ fontSize: '11.5px', fontWeight: 600, color: C.eclipse, letterSpacing: '0.02em' }}>
      {children}
      {required && <span style={{ color: C.error, marginLeft: 2 }}>*</span>}
    </span>
  );
}

/* ═══════════════════════════════════════════════════════════
   REGISTER PAGE
═══════════════════════════════════════════════════════════ */
export function RegisterPage({ onNavigate }) {
  const { register, login } = useAuth();
  const { addToast } = useToast();

  const [fullName, setFullName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [pwFocused, setPwFocused] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const [confirm18, setConfirm18] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [acceptGuidelines, setAcceptGuidelines] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [fieldErrors, setFieldErrors] = useState({});

  // Email Verification Modal State
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpErr, setOtpErr] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);

  const canSubmit = fullName.trim() && mobile && email && password
    && confirm18 && acceptTerms && acceptGuidelines && !submitting;

  // Step 1: Submit Registration Form (POST /api/auth/register)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFieldErrors({});

    // Validate mobile number: support +91, 0, or 10 digits starting with 6-9
    let cleanMobile = mobile.replace(/[\s\-()]/g, '').trim();
    if (cleanMobile.startsWith('+91')) {
      cleanMobile = cleanMobile.substring(3);
    } else if (cleanMobile.startsWith('0091')) {
      cleanMobile = cleanMobile.substring(4);
    } else if (cleanMobile.startsWith('91') && cleanMobile.length === 12 && ['6','7','8','9'].includes(cleanMobile[2])) {
      cleanMobile = cleanMobile.substring(2);
    } else if (cleanMobile.startsWith('0') && cleanMobile.length === 11 && ['6','7','8','9'].includes(cleanMobile[1])) {
      cleanMobile = cleanMobile.substring(1);
    }

    if (!/^[6-9]\d{9}$/.test(cleanMobile)) {
      setFieldErrors(p => ({ ...p, mobile: 'Please enter a valid 10-digit Indian mobile number starting with 6-9' }));
      addToast('Invalid mobile number format. Must be a valid Indian mobile number', 'error');
      return;
    }

    // Validate standard password rules (OWASP)
    const pwError = validateStandardPassword(password);
    if (pwError) {
      setFieldErrors(p => ({ ...p, password: pwError }));
      addToast(pwError, 'error');
      return;
    }

    if (!canSubmit) {
      addToast('Please fill all fields and confirm agreements.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      // 1. Call POST /api/auth/register
      await register({
        fullName: fullName.trim(),
        mobileNumber: cleanMobile,
        email: email.trim(),
        password,
      });

      addToast('Account created! Opening email OTP verification...', 'info');
      
      // 2. Open OTP verification modal step
      setIsVerifyModalOpen(true);
      setOtp('');
      setOtpErr('');
    } catch (err) {
      const errMsg = err?.message || (err?.errors ? Object.values(err.errors).join(', ') : 'Registration failed.');
      addToast(errMsg, 'error');
      if (err?.errors && typeof err.errors === 'object') {
        setFieldErrors(err.errors);
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Step 2: Confirm Email OTP (POST /api/auth/verify-email)
  const handleConfirmOtp = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) {
      setOtpErr('Please enter the 6-digit OTP code.');
      return;
    }

    setVerifying(true);
    setOtpErr('');
    try {
      // 1. Call POST /api/auth/verify-email { email, otp }
      await authService.verifyEmail(email.trim(), otp);
      addToast('Email verified successfully! Logging you in...', 'success');

      // 2. Complete verification by calling login
      try {
        await login(email.trim(), password);
        onNavigate('/profile-setup');
      } catch (loginErr) {
        addToast('Verification complete. Please log in.', 'success');
        onNavigate('/login');
      }
    } catch (err) {
      console.error(err);
      const msg = err?.message || 'Invalid or expired OTP. Please check and try again.';
      setOtpErr(msg);
      addToast(msg, 'error');
    } finally {
      setVerifying(false);
    }
  };

  // Resend Email OTP (POST /api/auth/resend-verification)
  const handleResendOtp = async () => {
    setResending(true);
    setOtpErr('');
    try {
      await authService.resendVerification(email.trim());
      addToast(`New verification OTP sent to ${email.trim()}`, 'success');
    } catch (err) {
      console.error(err);
      addToast(err?.message || 'Failed to resend verification OTP.', 'error');
    } finally {
      setResending(false);
    }
  };

  /* ── Checkbox row ──────────────────────────────────────── */
  const CheckRow = ({ id, checked, onChange, children }) => (
    <label htmlFor={id} style={{
      display: 'flex', alignItems: 'flex-start', gap: 8, cursor: 'pointer',
      fontSize: 12, color: C.eclipse, lineHeight: 1.45,
    }}>
      <div
        onClick={onChange}
        style={{
          flexShrink: 0,
          marginTop: 1,
          width: 15, height: 15,
          borderRadius: 4,
          border: `1.5px solid ${checked ? C.plum : C.zorba}`,
          background: checked ? C.plum : '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.15s', cursor: 'pointer',
        }}
      >
        {checked && <Check size={9} color="#fff" strokeWidth={3} />}
      </div>
      <span>{children}</span>
    </label>
  );

  return (
    <AuthLayout onNavigate={onNavigate}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* ── Header ────────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
            <div style={{
              width: 30, height: 30, borderRadius: 8,
              background: C.eclipse,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Mic2 size={15} color={C.bg} />
            </div>
            <span style={{ fontSize: 15, fontWeight: 700, color: C.eclipse, letterSpacing: '-0.01em' }}>
              Man Ki Aavaj
            </span>
          </div>

          <h1 style={{ fontSize: 22, fontWeight: 700, color: C.eclipse, margin: 0, letterSpacing: '-0.02em', lineHeight: 1.2 }}>
            Create Anonymous Account
          </h1>
          <p style={{ fontSize: 13, color: C.hurricane, margin: 0 }}>
            Your identity stays private. Your voice matters.
          </p>

          {/* Privacy badges */}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 2 }}>
            {[
              { icon: '🔒', text: 'Real name never shown publicly' },
              { icon: '🎭', text: 'Only username visible to others' },
            ].map(b => (
              <span key={b.text} style={{
                display: 'flex', alignItems: 'center', gap: 5,
                fontSize: 11, fontWeight: 500, color: C.hurricane,
                background: 'rgba(45,29,21,0.06)',
                padding: '3px 9px', borderRadius: 20,
              }}>
                {b.icon} {b.text}
              </span>
            ))}
          </div>
        </div>

        {/* ── FORM ──────────────────────────────────────── */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>

          {/* Full Name */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <Label required>Full Name</Label>
            <input
              type="text"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              placeholder="Your real name (kept private)"
              required
              style={inp(false, !!fieldErrors.fullName)}
            />
          </div>

          {/* Mobile & Email — 2 columns */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <Label required>Mobile Number</Label>
              <input
                type="tel"
                value={mobile}
                onChange={e => setMobile(e.target.value)}
                placeholder="e.g. 9876543210 or +91..."
                required
                style={inp(false, !!fieldErrors.mobile)}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <Label required>Email Address</Label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Enter e-mail id"
                required
                style={inp(false, !!fieldErrors.email)}
              />
            </div>
          </div>

          {/* Password */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <Label required>Password</Label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                onFocus={() => setPwFocused(true)}
                onBlur={() => setPwFocused(false)}
                placeholder="Create a strong password"
                required
                style={{ ...inp(pwFocused, !!fieldErrors.password), paddingRight: 38 }}
              />
              <button
                type="button"
                onClick={() => setShowPw(p => !p)}
                style={{
                  position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', color: C.zorba,
                  display: 'flex', alignItems: 'center',
                }}
              >
                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>

            {/* Realtime Password Strength Requirements Checklist */}
            {password && (
              <div style={{ marginTop: '6px', padding: '8px 12px', borderRadius: '8px', background: 'rgba(111,64,95,0.04)', border: '1px solid #E1DCDB', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: C.eclipse, marginBottom: '2px' }}>
                  Password Requirements:
                </span>
                {[
                  { key: 'length', text: 'At least 8 characters' },
                  { key: 'hasUpper', text: 'At least 1 uppercase letter (A-Z)' },
                  { key: 'hasLower', text: 'At least 1 lowercase letter (a-z)' },
                  { key: 'hasNumber', text: 'At least 1 number (0-9)' },
                  { key: 'hasSpecial', text: 'At least 1 special character (@, $, #, !, %, &...)' },
                ].map((req) => {
                  const passed = getPasswordStrengthChecks(password)[req.key];
                  return (
                    <div key={req.key} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: passed ? '#2E7D52' : '#8C8385', fontWeight: passed ? 700 : 500 }}>
                      <Check size={12} color={passed ? '#2E7D52' : '#D4CECC'} strokeWidth={3} />
                      <span>{req.text}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Divider */}
          <div style={{ height: 1, background: C.border, margin: '2px 0' }} />

          {/* Checkboxes */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <CheckRow checked={confirm18} onChange={() => setConfirm18(p => !p)}>
              I confirm I am <strong>&nbsp;18 years or older</strong>
            </CheckRow>
            <CheckRow checked={acceptTerms} onChange={() => setAcceptTerms(p => !p)}>
              I accept the <span style={{ color: C.plum, textDecoration: 'underline', cursor: 'pointer' }}>Terms &amp; Conditions</span>
            </CheckRow>
            <CheckRow checked={acceptGuidelines} onChange={() => setAcceptGuidelines(p => !p)}>
              I agree to <span style={{ color: C.plum, textDecoration: 'underline', cursor: 'pointer' }}>Community Guidelines</span> and Hate Speech Policy
            </CheckRow>
          </div>

          {/* CTA Button */}
          <button
            type="submit"
            disabled={!canSubmit}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: 10,
              background: canSubmit ? C.plum : C.zorba,
              color: '#fff',
              fontSize: 14,
              fontWeight: 700,
              cursor: canSubmit ? 'pointer' : 'not-allowed',
              letterSpacing: '0.01em',
              transition: 'background 0.2s, transform 0.15s',
              border: 'none',
            }}
            onMouseEnter={e => { if (canSubmit) e.currentTarget.style.background = C.plumDark; }}
            onMouseLeave={e => { if (canSubmit) e.currentTarget.style.background = C.plum; }}
          >
            {submitting ? 'Creating Account…' : 'Create Account'}
          </button>

          {/* Footer */}
          <p style={{ textAlign: 'center', fontSize: 12.5, color: C.hurricane, margin: 0 }}>
            Already have an account?{' '}
            <button
              type="button"
              onClick={() => onNavigate('/login')}
              style={{ color: C.plum, fontWeight: 700, textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer', fontSize: 12.5 }}
            >
              Login
            </button>
          </p>

        </form>
      </div>

      {/* ── EMAIL OTP VERIFICATION MODAL ── */}
      <Modal
        isOpen={isVerifyModalOpen}
        onClose={() => setIsVerifyModalOpen(false)}
        title="Verify Your Email Address"
      >
        <form onSubmit={handleConfirmOtp} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 8, backgroundColor: 'rgba(111,64,95,0.06)', border: '1px solid rgba(111,64,95,0.15)' }}>
            <Mail size={20} color={C.plum} />
            <div style={{ fontSize: 12.5, color: C.eclipse }}>
              An OTP has been sent to <strong style={{ color: C.plum }}>{email}</strong>.
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <Label required>Enter 6-Digit Verification Code</Label>
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={otp}
              onChange={e => { setOtp(e.target.value.replace(/\D/g, '').slice(0, 6)); setOtpErr(''); }}
              placeholder="••••••"
              style={{
                ...inp(true, !!otpErr),
                letterSpacing: '0.3em',
                fontSize: 18,
                fontWeight: 700,
                textAlign: 'center',
                padding: '12px',
              }}
              autoFocus
              required
            />
            {otpErr && <span style={{ fontSize: 11, color: C.error, marginTop: 2 }}>{otpErr}</span>}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <button
              type="button"
              onClick={handleResendOtp}
              disabled={resending}
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: C.plum,
                background: 'none',
                border: 'none',
                cursor: resending ? 'default' : 'pointer',
                textDecoration: 'underline',
              }}
            >
              {resending ? 'Sending...' : 'Resend OTP'}
            </button>

            <button
              type="submit"
              disabled={verifying || otp.length !== 6}
              style={{
                padding: '10px 20px',
                borderRadius: 8,
                backgroundColor: (verifying || otp.length !== 6) ? C.zorba : C.plum,
                color: '#FFFFFF',
                fontSize: 13,
                fontWeight: 700,
                border: 'none',
                cursor: (verifying || otp.length !== 6) ? 'not-allowed' : 'pointer',
              }}
            >
              {verifying ? 'Verifying...' : 'Verify & Continue'}
            </button>
          </div>
        </form>
      </Modal>
    </AuthLayout>
  );
}
