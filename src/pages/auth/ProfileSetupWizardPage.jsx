import React, { useState, useEffect, useRef } from 'react';
import { z } from 'zod';
import { AuthLayout } from '../../components/layout/AuthLayout.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { apiProfileService } from '../../services/apiProfileService.js';
import { generateUsernameSuggestions } from '../../utils/generateUsername.js';
import { InitialAvatar } from '../../components/profile/InitialAvatar.jsx';
import { RefreshCw, CheckCircle2, ArrowRight, ArrowLeft, Sparkles, Check, Loader2, XCircle, AlertCircle } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { SUPPORTED_LANGUAGES } from '../../utils/translations.js';

const AVATAR_COLORS = [
  { id: 'plum', hex: '#6F405F', name: 'Deep Plum' },
  { id: 'teal', hex: '#3F7772', name: 'Deep Teal' },
  { id: 'terracotta', hex: '#D96C3D', name: 'Terracotta' },
  { id: 'charcoal', hex: '#2D1D15', name: 'Charcoal' },
  { id: 'emerald', hex: '#2E7D52', name: 'Emerald' },
  { id: 'indigo', hex: '#4A3B6F', name: 'Indigo' },
];

import { validateUsernameString } from '../../utils/usernameValidation.js';

// Profile Validation Schema
const profileSchema = z.object({
  username: z.string().min(3, 'Please enter or select a valid handle').max(30, 'Username too long'),
  bio: z.string().min(5, 'Bio must be at least 5 characters').max(250, 'Bio cannot exceed 250 characters'),
  avatar: z.string().optional(),
});

export function ProfileSetupWizardPage({ onNavigate }) {
  const { currentUser, updateProfile } = useAuth();
  const { addToast } = useToast();
  const { changeLanguage } = useLanguage();

  const [step, setStep] = useState(2); // 1: Avatar (skipped), 2: Username, 3: Bio

  // Form State
  const [selectedColor, setSelectedColor] = useState(AVATAR_COLORS[0].hex);
  const [username, setUsername] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [spinning, setSpinning] = useState(false);
  const [bio, setBio] = useState('');
  const [selectedTopics, setSelectedTopics] = useState(['GENERAL']);
  const [preferredLanguage, setPreferredLanguage] = useState('EN');
  const [submitting, setSubmitting] = useState(false);

  // Field validation & Availability state
  const [errors, setErrors] = useState({});
  const [availabilityStatus, setAvailabilityStatus] = useState('idle'); // 'idle' | 'checking' | 'available' | 'taken' | 'invalid' | 'error'
  const [availabilityMessage, setAvailabilityMessage] = useState('');
  const [serverSuggestions, setServerSuggestions] = useState([]);
  const latestCheckIdRef = useRef(0);

  // Compute initials from current user's name
  const getInitials = () => {
    if (!currentUser?.fullName) return 'AN';
    const parts = currentUser.fullName.trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return parts[0].slice(0, 2).toUpperCase();
  };

  const initials = getInitials();

  // Load 4 unique non-repeating username suggestions
  const refreshSuggestions = () => {
    setSpinning(true);
    setTimeout(() => setSpinning(false), 400);
    const list = generateUsernameSuggestions(4);
    setSuggestions(list);
    if (!username && list[0]) {
      setUsername(list[0]);
    }
  };

  useEffect(() => {
    refreshSuggestions();
  }, []);

  // Debounced Username Availability Check with Async Race Condition Protection
  useEffect(() => {
    if (!username || !username.trim()) {
      setAvailabilityStatus('idle');
      setAvailabilityMessage('');
      setServerSuggestions([]);
      return;
    }

    const clean = username.trim().startsWith('@') ? username.trim().slice(1) : username.trim();
    const localErr = validateUsernameString(clean, currentUser?.fullName);
    if (localErr) {
      setAvailabilityStatus('invalid');
      setAvailabilityMessage(localErr);
      setServerSuggestions([]);
      return;
    }

    const checkId = ++latestCheckIdRef.current;
    setAvailabilityStatus('checking');
    setAvailabilityMessage('Checking username...');

    const timer = setTimeout(async () => {
      try {
        const res = await apiProfileService.checkUsername(clean);
        // Stale response protection
        if (latestCheckIdRef.current !== checkId) return;

        if (res?.data?.available) {
          setAvailabilityStatus('available');
          setAvailabilityMessage('✓ Username available');
          setServerSuggestions([]);
        } else {
          setAvailabilityStatus('taken');
          setAvailabilityMessage(res?.data?.message ? `❌ ${res.data.message}` : '❌ Username already taken');
          setServerSuggestions(res?.data?.suggestions || []);
        }
      } catch (err) {
        if (latestCheckIdRef.current !== checkId) return;
        setAvailabilityStatus('error');
        setAvailabilityMessage(err?.message || 'Unable to check username availability.');
        setServerSuggestions([]);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [username, currentUser?.fullName]);

  // Step 1 -> Step 2
  const handleNextStep1 = () => {
    setStep(2);
  };

  // Step 2 -> Step 3
  const handleNextStep2 = () => {
    if (!username || !username.trim()) {
      addToast('Please enter or select an anonymous handle.', 'error');
      setErrors({ username: 'Please enter or select a handle' });
      return;
    }
    const cleanUname = username.trim().startsWith('@') ? username.trim().slice(1) : username.trim();

    // Anonymity validation against real names & user's own full name
    const validationError = validateUsernameString(cleanUname, currentUser?.fullName);
    if (validationError) {
      setErrors({ username: validationError });
      addToast(validationError, 'error');
      return;
    }

    if (availabilityStatus === 'checking') {
      addToast('Checking username availability... Please wait.', 'info');
      return;
    }

    if (availabilityStatus === 'taken') {
      addToast('Username already taken. Please choose another.', 'error');
      return;
    }

    if (availabilityStatus !== 'available') {
      addToast(availabilityMessage || 'Please choose an available handle.', 'error');
      return;
    }

    setErrors({});
    setStep(3);
  };

  // Step 3 Submit -> POST /api/profile
  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanUname = username.startsWith('@') ? username.slice(1) : username;

    // Validate full profile with Zod
    const result = profileSchema.safeParse({
      username: cleanUname,
      bio: bio.trim(),
      avatar: selectedColor,
    });

    if (!result.success) {
      const errMap = {};
      const issues = result.error?.issues || result.error?.errors || [];
      issues.forEach((err) => {
        if (err.path && err.path[0]) errMap[err.path[0]] = err.message;
      });
      setErrors(errMap);
      addToast('Please correct validation errors before submitting.', 'error');
      return;
    }

    setErrors({});
    setSubmitting(true);

    try {
      const payload = {
        username: cleanUname,
        bio: bio.trim(),
        avatar: selectedColor,
        preferredLanguage: preferredLanguage,
      };

      // Call POST /api/profile - NO false success fallback!
      const res = await apiProfileService.createProfile(payload);

      // Instantly change active UI translation
      if (changeLanguage) {
        await changeLanguage(preferredLanguage);
      }

      const profileData = res?.data || payload;
      const formattedUsername = cleanUname.startsWith('@') ? cleanUname : `@${cleanUname}`;
      const fullProfileData = { ...profileData, username: formattedUsername };

      if (currentUser?.id) {
        localStorage.setItem(`user_profile_${currentUser.id}`, JSON.stringify(fullProfileData));
      }
      localStorage.setItem('user_profile', JSON.stringify(fullProfileData));

      // Update auth_user in localStorage
      const authUserStr = localStorage.getItem('auth_user');
      if (authUserStr) {
        try {
          const authUser = JSON.parse(authUserStr);
          authUser.username = formattedUsername;
          localStorage.setItem('auth_user', JSON.stringify(authUser));
        } catch (e) {}
      }

      try {
        if (updateProfile) {
          await updateProfile({ username: formattedUsername, avatarConfig: selectedColor, bio: bio.trim() });
        }
      } catch (e) {}

      addToast('Profile setup complete! Welcome to Man Ki Aavaj.', 'success');
      onNavigate('/home');
    } catch (err) {
      console.error('[ProfileSetup] Create profile failed:', err);
      const isTaken = err?.status === 409 || err?.message?.toLowerCase()?.includes('already taken');
      const msg = isTaken ? 'Username already taken' : (err?.message || 'Failed to create profile. Please try again.');
      addToast(msg, 'error');
      setErrors((prev) => ({ ...prev, username: msg }));
      if (isTaken) {
        setStep(2);
        setAvailabilityStatus('taken');
        setAvailabilityMessage('❌ Username already taken');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout title="Profile Setup" subtitle="Share your thoughts, not your identity">
      <div className="mka-card" style={{ padding: '24px 18px', width: '100%', maxWidth: '520px', borderRadius: '20px', boxSizing: 'border-box' }}>

        {/* Wizard Stepper Progress Bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <div>
            <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--deep-plum)' }}>
              FIRST-TIME SETUP • STEP {step - 1} OF 2
            </span>
          </div>
          <div style={{ display: 'flex', gap: '6px' }}>
            {[2, 3].map((i) => (
              <div
                key={i}
                style={{
                  width: i === step ? '28px' : '10px',
                  height: '6px',
                  borderRadius: '3px',
                  background: i === step ? 'var(--deep-plum)' : i < step ? 'var(--zorba)' : 'var(--border-light)',
                  transition: 'all 0.25s ease',
                }}
              />
            ))}
          </div>
        </div>

        {/* ── STEP 1: AVATAR COLOR SELECTOR ──────────────────────── */}
        {step === 1 && (
          <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--eclipse)', margin: 0 }}>
              Choose Avatar Color Accent
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--hurricane)', margin: 0 }}>
              Your initials <strong style={{ color: 'var(--eclipse)' }}>({initials})</strong> will represent you across the platform anonymously.
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', padding: '16px 0' }}>
              <div style={{ position: 'relative' }}>
                <InitialAvatar username={currentUser?.fullName || 'User'} initials={initials} size={88} />
                <div
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    width: '26px',
                    height: '26px',
                    borderRadius: '50%',
                    background: selectedColor,
                    border: '2px solid #FFFFFF',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
              {AVATAR_COLORS.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelectedColor(c.hex)}
                  style={{
                    padding: '10px',
                    borderRadius: '10px',
                    border: `2px solid ${selectedColor === c.hex ? 'var(--deep-plum)' : 'var(--border-light)'}`,
                    background: selectedColor === c.hex ? 'rgba(111,64,95,0.06)' : 'var(--pure-white)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: c.hex }} />
                  <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--eclipse)' }}>{c.name}</span>
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={handleNextStep1}
              style={{
                padding: '12px',
                borderRadius: '8px',
                background: 'var(--eclipse)',
                color: 'var(--pure-white)',
                fontSize: '14px',
                fontWeight: 700,
                cursor: 'pointer',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                marginTop: '10px',
              }}
            >
              Next: Pick Handle <ArrowRight size={16} />
            </button>
          </div>
        )}

        {/* ── STEP 2: USERNAME SELECTION & ANONYMOUS HANDLE INPUT ── */}
        {step === 2 && (
          <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--eclipse)', margin: 0 }}>
                Select or Type Your Anonymous Handle
              </h2>
              <p style={{ fontSize: '13px', color: 'var(--hurricane)', margin: '4px 0 0 0' }}>
                Type a custom handle below or pick one of the unique suggestions. Real human names are blocked to preserve anonymity.
              </p>
            </div>

            {/* Custom Handle Input Field with Realtime Anonymity Validation */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--eclipse)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Custom Anonymous Handle:
              </label>

              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <span
                  style={{
                    position: 'absolute',
                    left: '16px',
                    fontSize: '16px',
                    fontWeight: 800,
                    color: errors.username ? '#D93838' : 'var(--deep-plum)',
                  }}
                >
                  @
                </span>
                <input
                  type="text"
                  value={username ? username.replace(/^@/, '') : ''}
                  onChange={(e) => {
                    const rawVal = e.target.value;
                    const cleanVal = rawVal.trim().replace(/^@/, '');
                    const formatted = cleanVal ? `@${cleanVal}` : '';
                    setUsername(formatted);
                    if (cleanVal) {
                      const err = validateUsernameString(cleanVal, currentUser?.fullName);
                      setErrors(err ? { username: err } : {});
                    } else {
                      setErrors({});
                    }
                  }}
                  placeholder="e.g. hiddenchapter14, quietvoice99"
                  style={{
                    width: '100%',
                    padding: '12px 16px 12px 34px',
                    borderRadius: '12px',
                    border: (errors.username || availabilityStatus === 'taken' || availabilityStatus === 'error')
                      ? '2px solid #D93838'
                      : availabilityStatus === 'available'
                      ? '2px solid #2E7D52'
                      : '2px solid var(--deep-plum)',
                    backgroundColor: (errors.username || availabilityStatus === 'taken' || availabilityStatus === 'error')
                      ? 'rgba(217, 56, 56, 0.04)'
                      : availabilityStatus === 'available'
                      ? 'rgba(46, 125, 82, 0.04)'
                      : 'rgba(111, 64, 95, 0.04)',
                    fontSize: '15px',
                    fontWeight: 700,
                    color: 'var(--eclipse)',
                    outline: 'none',
                    boxSizing: 'border-box',
                    transition: 'all 0.2s ease',
                  }}
                />
              </div>

              {/* Status & Availability Indicator */}
              {errors.username ? (
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#D93838', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <AlertCircle size={14} /> {errors.username}
                </span>
              ) : availabilityStatus === 'checking' ? (
                <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--deep-plum)', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                  <Loader2 size={14} className="spin-animation" /> Checking username...
                </span>
              ) : availabilityStatus === 'available' ? (
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#2E7D52', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                  <Check size={15} strokeWidth={2.5} /> {availabilityMessage || '✓ Username available'}
                </span>
              ) : availabilityStatus === 'taken' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '2px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#D93838', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <XCircle size={15} /> {availabilityMessage || '❌ Username already taken'}
                  </span>
                  {serverSuggestions && serverSuggestions.length > 0 && (
                    <div style={{ marginTop: '4px' }}>
                      <span style={{ fontSize: '11.5px', fontWeight: 600, color: 'var(--hurricane)' }}>
                        Suggested available handles:
                      </span>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '4px' }}>
                        {serverSuggestions.map((sug) => (
                          <button
                            key={sug}
                            type="button"
                            onClick={() => {
                              setUsername(`@${sug}`);
                              setErrors({});
                            }}
                            style={{
                              padding: '4px 10px',
                              borderRadius: '6px',
                              border: '1px solid var(--deep-plum)',
                              backgroundColor: 'rgba(111, 64, 95, 0.08)',
                              color: 'var(--deep-plum)',
                              fontSize: '12px',
                              fontWeight: 700,
                              cursor: 'pointer',
                            }}
                          >
                            @{sug}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : availabilityStatus === 'error' ? (
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#D93838', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                  <AlertCircle size={14} /> {availabilityMessage}
                </span>
              ) : null}
            </div>

            {/* Suggestions Grid */}
            <div style={{ padding: '16px', borderRadius: '12px', background: 'var(--soft-white)', border: '1px solid var(--border-light)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <span style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--eclipse)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Sparkles size={15} color="var(--deep-plum)" /> Available Unique Handles
                </span>
                <button
                  type="button"
                  onClick={refreshSuggestions}
                  style={{
                    fontSize: '12px',
                    color: 'var(--deep-plum)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    fontWeight: 700,
                  }}
                >
                  <RefreshCw size={13} className={spinning ? 'spin-animation' : ''} /> Suggest More
                </button>
              </div>

              {/* 2x2 Cards Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {suggestions.map((sug) => {
                  const isSelected = username === sug;
                  return (
                    <button
                      key={sug}
                      type="button"
                      onClick={() => {
                        setUsername(sug);
                        setErrors({});
                      }}
                      style={{
                        padding: '12px 14px',
                        borderRadius: '10px',
                        border: isSelected ? '2px solid var(--deep-plum)' : '1.5px solid var(--border-light)',
                        background: isSelected ? 'rgba(111,64,95,0.12)' : 'var(--pure-white)',
                        color: isSelected ? 'var(--deep-plum)' : 'var(--eclipse)',
                        fontSize: '13.5px',
                        fontWeight: 800,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <span>{sug}</span>
                      {isSelected && <Check size={16} color="var(--deep-plum)" strokeWidth={3} />}
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
              <button
                type="button"
                onClick={handleNextStep2}
                disabled={availabilityStatus !== 'available' || !!errors.username}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '8px',
                  background: (availabilityStatus !== 'available' || !!errors.username) ? 'var(--hurricane, #888)' : 'var(--eclipse)',
                  color: 'var(--pure-white)',
                  fontSize: '14px',
                  fontWeight: 700,
                  cursor: (availabilityStatus !== 'available' || !!errors.username) ? 'not-allowed' : 'pointer',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  opacity: (availabilityStatus !== 'available' || !!errors.username) ? 0.6 : 1,
                }}
              >
                Next: Add Bio <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 3: BIO TEXT BOX ─────────────────────────── */}
        {step === 3 && (
          <form onSubmit={handleSubmit} className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--eclipse)', margin: 0 }}>
              Write Your Anonymous Bio
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--hurricane)', margin: 0 }}>
              Describe your interests, perspective, or thoughts without sharing personal identity details.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--eclipse)' }}>
                  Anonymous Bio *
                </label>
                <span style={{ fontSize: '11.5px', fontWeight: 600, color: bio.trim().length >= 5 ? 'var(--success)' : 'var(--hurricane)' }}>
                  {bio.length} / 250 chars
                </span>
              </div>

              <textarea
                rows={4}
                value={bio}
                onChange={(e) => {
                  setBio(e.target.value);
                  setErrors({});
                }}
                placeholder="Share your perspective, values, or topics you like discussing..."
                maxLength={250}
                required
                style={{
                  padding: '12px 14px',
                  borderRadius: '8px',
                  border: `1.5px solid ${errors.bio ? 'var(--error)' : 'var(--border-light)'}`,
                  fontSize: '13.5px',
                  color: 'var(--eclipse)',
                  outline: 'none',
                  resize: 'vertical',
                }}
              />
              {errors.bio && (
                <span style={{ fontSize: '11px', color: 'var(--error)' }}>{errors.bio}</span>
              )}
            </div>

            {/* Preferred Topics Picklist (New Modern Premium Look - Separate from Bio) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--eclipse)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Preferred Topics (Select 2-4 topics)
                </label>
                <span style={{ fontSize: '11px', color: '#6F405F', fontWeight: 700 }}>
                  {selectedTopics.length} Selected
                </span>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '2px' }}>
                {['BOLLYWOOD', 'CRICKET', 'TECHNOLOGY', 'POLITICS', 'LIFESTYLE', 'ENTERTAINMENT', 'SPORTS', 'NEWS', 'GENERAL'].map((topic) => {
                  const isSelected = selectedTopics.includes(topic);
                  return (
                    <button
                      key={topic}
                      type="button"
                      onClick={() => {
                        if (isSelected) {
                          if (selectedTopics.length > 1) {
                            setSelectedTopics(selectedTopics.filter((t) => t !== topic));
                          }
                        } else {
                          setSelectedTopics([...selectedTopics, topic]);
                        }
                      }}
                      style={{
                        padding: '8px 14px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: 800,
                        border: isSelected ? '1.5px solid #6F405F' : '1.5px solid #E8E2E0',
                        background: isSelected ? 'linear-gradient(135deg, #6F405F 0%, #3D2334 100%)' : '#FFFFFF',
                        color: isSelected ? '#FFFFFF' : '#2D1D15',
                        boxShadow: isSelected ? '0 4px 12px rgba(111,64,95,0.22)' : 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                      }}
                    >
                      <span>#{topic}</span>
                      {isSelected ? <Check size={13} color="#FFFFFF" strokeWidth={3} /> : <span style={{ opacity: 0.5 }}>+</span>}
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--eclipse)' }}>
                Preferred Language *
              </label>
              <select
                value={SUPPORTED_LANGUAGES.find(l => l.label.toLowerCase() === (preferredLanguage || '').toLowerCase() || l.code.toLowerCase() === (preferredLanguage || '').toLowerCase())?.code || 'EN'}
                onChange={(e) => setPreferredLanguage(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1.5px solid var(--border-light)',
                  fontSize: '13.5px',
                  color: 'var(--eclipse)',
                  background: 'var(--pure-white)',
                  outline: 'none',
                  cursor: 'pointer',
                }}
              >
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.native} ({lang.label || lang.code})
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setStep(2)}
                style={{
                  padding: '12px 18px',
                  borderRadius: '8px',
                  border: '1.5px solid var(--border-light)',
                  background: 'var(--pure-white)',
                  color: 'var(--eclipse)',
                  fontSize: '13.5px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <ArrowLeft size={15} /> Back
              </button>
              <button
                type="submit"
                disabled={submitting || bio.trim().length < 5}
                style={{
                  flex: 1,
                  padding: '13px',
                  borderRadius: '8px',
                  border: 'none',
                  background: (submitting || bio.trim().length < 5) ? 'var(--zorba)' : 'var(--deep-plum)',
                  color: 'var(--pure-white)',
                  fontSize: '14px',
                  fontWeight: 700,
                  cursor: (submitting || bio.trim().length < 5) ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                }}
              >
                {submitting ? 'Saving Profile...' : 'Complete Profile & Finish'}
              </button>
            </div>
          </form>
        )}

      </div>
    </AuthLayout>
  );
}
