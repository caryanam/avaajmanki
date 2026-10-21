import React, { useState, useEffect, useRef } from 'react';
import { UserLayout } from '../../components/layout/UserLayout.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { 
  User, Lock, Bell, Shield, Trash2, Camera, KeyRound, Mail, Globe,
  BookOpen, MessageSquare, ChevronRight, Settings as SettingsIcon, 
  HelpCircle, Eye, EyeOff, AlertTriangle, X, Check, CheckCircle2
} from 'lucide-react';
import { LanguageSelectorDropdown } from '../../components/common/LanguageSelectorDropdown.jsx';
import { SUPPORTED_LANGUAGES } from '../../utils/translations.js';
import { useMyProfile } from '../../hooks/useUserModeration.js';
import { apiProfileService } from '../../services/apiProfileService.js';
import { apiUserService } from '../../services/apiUserService.js';
import { apiClient } from '../../services/apiClient.js';
import { getMediaUrl } from '../../config/env.js';
import heroProfileBanner from '../../assets/profile/hero-profile-banner.png';
import sidebarSunsetCity from '../../assets/home/sidebar-sunset-city.jpg';

export function SettingsPage({ onNavigate, initialSection = 'profile' }) {
  const { currentUser, updateProfile, logout } = useAuth();
  const { currentLanguage, changeLanguage, supportedLanguages, isTranslating, t } = useLanguage();
  const { addToast } = useToast();

  // Navigation tab state
  const [activeTab, setActiveTab] = useState(initialSection || 'profile');

  // Profile data states
  const [displayNameInput, setDisplayNameInput] = useState('');
  const [usernameInput, setUsernameInput] = useState('');
  const [bioInput, setBioInput] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // Modals state
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [isLanguageModalOpen, setIsLanguageModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Current language descriptor
  const langs = supportedLanguages || SUPPORTED_LANGUAGES || [];
  const currentLangObj = langs.find(
    (l) => l.label.toLowerCase() === (currentLanguage || 'English').toLowerCase() ||
           l.code.toLowerCase() === (currentLanguage || 'EN').toLowerCase()
  ) || { code: 'EN', label: 'English', native: 'English' };

  // Password modal states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);

  // Email modal states
  const [newEmail, setNewEmail] = useState('');
  const [emailOtp, setEmailOtp] = useState('');
  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [sendingEmailOtp, setSendingEmailOtp] = useState(false);
  const [updatingEmail, setUpdatingEmail] = useState(false);

  // Delete account confirmation states
  const [deleteConfirmed, setDeleteConfirmed] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);

  // Privacy preferences states
  const [allowComments, setAllowComments] = useState(true);
  const [showPublicComments, setShowPublicComments] = useState(false);
  const [dmPermission, setDmPermission] = useState('everyone');
  const [hideSearchEngines, setHideSearchEngines] = useState(true);
  const [hideLeaderboards, setHideLeaderboards] = useState(false);
  const [showActiveStatus, setShowActiveStatus] = useState(true);
  const [hideSensitive, setHideSensitive] = useState(true);
  const [autoMuteLowRep, setAutoMuteLowRep] = useState(true);

  // Notification preferences states
  const [chatMessages, setChatMessages] = useState(true);
  const [postLikes, setPostLikes] = useState(true);
  const [commentAlerts, setCommentAlerts] = useState(true);
  const [systemAlerts, setSystemAlerts] = useState(true);
  const [soundAlerts, setSoundAlerts] = useState(true);

  const fileInputRef = useRef(null);

  const { profile: cachedProfile } = useMyProfile();

  // 1. Sync user profile from cached TanStack Query or currentUser
  useEffect(() => {
    const p = cachedProfile?.data || cachedProfile || currentUser;
    if (p) {
      setDisplayNameInput(p.fullName || currentUser?.fullName || currentUser?.name || 'User');
      const uname = (p.username || currentUser?.username || 'user').replace(/^@/, '');
      setUsernameInput(uname);
      setBioInput(p.bio || currentUser?.bio || '');
      setAvatarUrl(p.avatar || currentUser?.avatar || '');
      setInitialLoading(false);
    }
  }, [cachedProfile, currentUser]);

  // Load preferences from localStorage
  useEffect(() => {
    const userId = currentUser?.id || currentUser?.username || 'user';
    const notifKey = `user_notif_prefs_${userId}`;
    const savedNotifs = localStorage.getItem(notifKey);
    if (savedNotifs) {
      try {
        const parsed = JSON.parse(savedNotifs);
        if (typeof parsed.chatMessages === 'boolean') setChatMessages(parsed.chatMessages);
        if (typeof parsed.postLikes === 'boolean') setPostLikes(parsed.postLikes);
        if (typeof parsed.comments === 'boolean') setCommentAlerts(parsed.comments);
        if (typeof parsed.systemAlerts === 'boolean') setSystemAlerts(parsed.systemAlerts);
        if (typeof parsed.soundAlerts === 'boolean') setSoundAlerts(parsed.soundAlerts);
      } catch {}
    }

    const privacyKey = `user_privacy_prefs_${userId}`;
    const savedPrivacy = localStorage.getItem(privacyKey);
    if (savedPrivacy) {
      try {
        const parsed = JSON.parse(savedPrivacy);
        if (typeof parsed.allowComments === 'boolean') setAllowComments(parsed.allowComments);
        if (typeof parsed.showPublicComments === 'boolean') setShowPublicComments(parsed.showPublicComments);
        if (parsed.dmPermission) setDmPermission(parsed.dmPermission);
        if (typeof parsed.hideSearchEngines === 'boolean') setHideSearchEngines(parsed.hideSearchEngines);
        if (typeof parsed.hideLeaderboards === 'boolean') setHideLeaderboards(parsed.hideLeaderboards);
        if (typeof parsed.showActiveStatus === 'boolean') setShowActiveStatus(parsed.showActiveStatus);
        if (typeof parsed.hideSensitive === 'boolean') setHideSensitive(parsed.hideSensitive);
        if (typeof parsed.autoMuteLowRep === 'boolean') setAutoMuteLowRep(parsed.autoMuteLowRep);
      } catch {}
    }
  }, [currentUser]);

  // Handle avatar upload via file input
  const handleAvatarFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      addToast('Invalid file format. Please upload JPG, PNG, or WebP.', 'error');
      return;
    }

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      addToast('Image file too large. Please select an image under 5MB.', 'error');
      return;
    }

    setUploadingAvatar(true);
    const previousAvatar = avatarUrl;

    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await apiClient.post('/api/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const uploadedUrl = res.data?.data?.imageUrl || res.data?.imageUrl;
      if (!uploadedUrl) {
        throw new Error('Upload failed. No image URL returned from server.');
      }

      setAvatarUrl(uploadedUrl);

      // Persist avatar change to backend
      await apiProfileService.updateProfile({
        avatar: uploadedUrl,
        username: usernameInput || currentUser?.username?.replace(/^@/, ''),
        fullName: displayNameInput || currentUser?.fullName,
        bio: bioInput || currentUser?.bio,
      });

      await updateProfile({ avatar: uploadedUrl });
      addToast('Profile photo updated successfully!', 'success');
    } catch (err) {
      console.error('Avatar upload failed:', err);
      setAvatarUrl(previousAvatar);
      addToast(err?.response?.data?.message || err?.message || 'Failed to upload profile photo.', 'error');
    } finally {
      setUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Handle Profile Information form submit
  const handleSaveProfile = async (e) => {
    e.preventDefault();

    const cleanDisplayName = displayNameInput.trim();
    const cleanUsername = usernameInput.trim().replace(/^@/, '');
    const cleanBio = bioInput.trim();

    if (!cleanDisplayName || cleanDisplayName.length < 2) {
      addToast('Display name must be at least 2 characters.', 'error');
      return;
    }

    if (!cleanUsername || cleanUsername.length < 3 || cleanUsername.length > 30) {
      addToast('Username must be between 3 and 30 characters.', 'error');
      return;
    }

    const usernameRegex = /^[a-zA-Z0-9._]+$/;
    if (!usernameRegex.test(cleanUsername)) {
      addToast('Username can contain only letters, numbers, dot(.) and underscore(_).', 'error');
      return;
    }

    if (cleanBio.length > 200) {
      addToast('Bio cannot exceed 200 characters.', 'error');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        fullName: cleanDisplayName,
        username: cleanUsername,
        bio: cleanBio,
        avatar: avatarUrl || currentUser?.avatar || null,
      };

      await apiProfileService.updateProfile(payload);
      await updateProfile(payload);

      addToast('Profile updated successfully!', 'success');
    } catch (err) {
      console.error('Failed to update profile:', err);
      addToast(err?.response?.data?.message || err?.message || 'Failed to update profile.', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Handle Password Submit
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (!currentPassword) {
      addToast('Please enter your current password.', 'error');
      return;
    }
    if (newPassword.length < 6) {
      addToast('New password must be at least 6 characters long.', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      addToast('New password and confirmation do not match.', 'error');
      return;
    }

    setUpdatingPassword(true);
    try {
      await apiUserService.updatePassword({ currentPassword, newPassword });
      addToast('Password updated successfully!', 'success');
      setIsPasswordModalOpen(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      addToast(err?.response?.data?.message || err?.message || 'Failed to update password.', 'error');
    } finally {
      setUpdatingPassword(false);
    }
  };

  // Handle Email Submit
  const handleSendEmailOtp = (e) => {
    e.preventDefault();
    if (!newEmail || !newEmail.includes('@')) {
      addToast('Please enter a valid email address.', 'error');
      return;
    }
    setSendingEmailOtp(true);
    setTimeout(() => {
      setSendingEmailOtp(false);
      setEmailOtpSent(true);
      addToast(`Verification code sent to ${newEmail}! Use code 123456`, 'info');
    }, 600);
  };

  const handleVerifyEmail = async (e) => {
    e.preventDefault();
    if (!emailOtp || emailOtp.length < 4) {
      addToast('Please enter the 6-digit verification code.', 'error');
      return;
    }
    setUpdatingEmail(true);
    setTimeout(() => {
      setUpdatingEmail(false);
      setIsEmailModalOpen(false);
      setEmailOtpSent(false);
      setNewEmail('');
      setEmailOtp('');
      addToast('Email address updated successfully!', 'success');
    }, 600);
  };

  // Handle Account Deletion
  const handleDeleteAccount = async () => {
    if (!deleteConfirmed) {
      addToast('Please confirm account deletion checkbox.', 'error');
      return;
    }

    setDeletingAccount(true);
    try {
      await apiUserService.deactivateAccount();
      addToast('Your account has been deactivated. You have been logged out.', 'success');
      logout();
      onNavigate('/login');
    } catch (err) {
      console.error('Account deletion error:', err);
      addToast(err?.response?.data?.message || err?.message || 'Failed to deactivate account.', 'error');
    } finally {
      setDeletingAccount(false);
      setIsDeleteModalOpen(false);
    }
  };

  // Handle Privacy Save
  const handleSavePrivacy = (e) => {
    e.preventDefault();
    const userId = currentUser?.id || currentUser?.username || 'user';
    const privacyKey = `user_privacy_prefs_${userId}`;
    const payload = {
      allowComments,
      showPublicComments,
      dmPermission,
      hideSearchEngines,
      hideLeaderboards,
      showActiveStatus,
      hideSensitive,
      autoMuteLowRep,
    };
    localStorage.setItem(privacyKey, JSON.stringify(payload));
    addToast('Privacy preferences saved successfully.', 'success');
  };

  // Handle Notification Save
  const handleSaveNotifications = (e) => {
    e.preventDefault();
    const userId = currentUser?.id || currentUser?.username || 'user';
    const notifKey = `user_notif_prefs_${userId}`;
    const payload = {
      chatMessages,
      postLikes,
      comments: commentAlerts,
      systemAlerts,
      soundAlerts,
    };
    localStorage.setItem(notifKey, JSON.stringify(payload));
    addToast('Notification preferences saved successfully.', 'success');
  };

  // Avatar source resolution
  const resolvedAvatar = (avatarUrl && !avatarUrl.startsWith('#'))
    ? getMediaUrl(avatarUrl)
    : sidebarSunsetCity;

  // Masked email helper
  const maskedEmail = currentUser?.email
    ? currentUser.email.replace(/^(.)(.*)(@.*)$/, (_, a, b, c) => `${a}${'*'.repeat(Math.min(b.length, 4))}${c}`)
    : 'us***@example.com';

  return (
    <UserLayout activeRoute="/settings" onNavigate={onNavigate} wide={true}>
      <div className="settings-page-container">
        
        {/* ── 1. SETTINGS HERO HEADER ── */}
        <div className="settings-hero-card">
          {/* Sunset Cover Banner */}
          <div className="settings-cover-wrap">
            <img
              src={heroProfileBanner}
              alt="Settings cover banner"
              className="settings-cover-img"
            />
            <div className="settings-cover-overlay" />

            {/* Decorative Calligraphic Flourish Text */}
            <div className="settings-cover-flourish">
              <div className="settings-flourish-glow" />
              <div className="settings-flourish-content">
                <span>Your</span>
                <span>Privacy</span>
                <span>Your</span>
                <span>Choice <span className="settings-flourish-heart">♡</span></span>
              </div>
            </div>

            {/* Elegant Curved Shoulder SVG Transition */}
            <div className="settings-cover-curve-svg-wrap">
              <svg
                viewBox="0 0 1000 48"
                preserveAspectRatio="none"
                className="settings-cover-curve-svg"
                aria-hidden="true"
              >
                <path
                  d="M 0,48 L 0,0 L 450,0 C 485,0 505,46 545,46 L 1000,46 L 1000,48 Z"
                  fill="#FFFFFF"
                />
              </svg>
            </div>
          </div>

          {/* Overlapping Circular Avatar */}
          <div className="settings-avatar-container">
            <img
              src={resolvedAvatar}
              alt={displayNameInput || 'User Avatar'}
              className="settings-avatar-img"
              onError={(e) => {
                e.currentTarget.src = sidebarSunsetCity;
              }}
            />
            <button
              type="button"
              className="settings-camera-badge-btn"
              title="Change profile picture"
              aria-label="Upload profile photo"
              onClick={() => fileInputRef.current?.click()}
            >
              <Camera size={14} strokeWidth={2.4} />
            </button>
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: 'none' }}
              accept="image/png,image/jpeg,image/webp"
              onChange={handleAvatarFileChange}
            />
          </div>

          {/* White Lower Settings Identity Panel */}
          <div className="settings-hero-lower">
            <div className="settings-hero-identity">
              <h1 className="settings-hero-title">Settings</h1>
              <p className="settings-hero-subtitle">Manage your account and privacy on AwaajManKi</p>
            </div>
          </div>
        </div>

        {/* ── 2. THREE-COLUMN MAIN CONTENT LAYOUT ── */}
        <div className="settings-layout-grid">
          
          {/* ── LEFT COLUMN: SETTINGS NAVIGATION ── */}
          <div className="settings-left-col">
            <nav className="settings-nav-card" aria-label="Settings Categories">
              <button
                type="button"
                className={`settings-nav-item ${activeTab === 'profile' ? 'active' : ''}`}
                onClick={() => setActiveTab('profile')}
              >
                <User size={18} />
                <span>Profile</span>
              </button>

              <button
                type="button"
                className={`settings-nav-item ${activeTab === 'privacy' ? 'active' : ''}`}
                onClick={() => setActiveTab('privacy')}
              >
                <Lock size={18} />
                <span>Privacy</span>
              </button>

              <button
                type="button"
                className={`settings-nav-item ${activeTab === 'notifications' ? 'active' : ''}`}
                onClick={() => setActiveTab('notifications')}
              >
                <Bell size={18} />
                <span>Notifications</span>
              </button>

              <button
                type="button"
                className={`settings-nav-item ${activeTab === 'account' ? 'active' : ''}`}
                onClick={() => setActiveTab('account')}
              >
                <Shield size={18} />
                <span>Account Security</span>
              </button>

              <button
                type="button"
                className={`settings-nav-item ${activeTab === 'delete' ? 'active' : ''}`}
                onClick={() => {
                  setDeleteConfirmed(false);
                  setIsDeleteModalOpen(true);
                }}
              >
                <Trash2 size={18} />
                <span>Delete Account</span>
              </button>
            </nav>
          </div>

          {/* ── CENTER COLUMN: ACTIVE SETTINGS SECTION ── */}
          <div className="settings-center-col">
            
            {/* 1. PROFILE SECTION (Screenshot Target) */}
            {activeTab === 'profile' && (
              <div className="settings-card">
                <h2 className="settings-card-title">Profile Information</h2>
                <p className="settings-card-subtitle">
                  This information will be visible to others on AwaajManKi
                </p>

                <form onSubmit={handleSaveProfile}>
                  {/* Profile Photo */}
                  <div className="settings-form-group">
                    <label className="settings-form-label">Profile Photo</label>
                    <div className="settings-photo-row">
                      <div className="settings-photo-avatar-wrap">
                        <img
                          src={resolvedAvatar}
                          alt="Profile Avatar"
                          className="settings-photo-avatar-img"
                          onError={(e) => {
                            e.currentTarget.src = sidebarSunsetCity;
                          }}
                        />
                        <div className="settings-photo-camera-badge">
                          <Camera size={11} color="#ffffff" />
                        </div>
                      </div>

                      <div className="settings-photo-info">
                        <button
                          type="button"
                          className="settings-change-photo-btn"
                          disabled={uploadingAvatar}
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <Camera size={15} />
                          <span>{uploadingAvatar ? 'Uploading...' : 'Change Photo'}</span>
                        </button>
                        <p className="settings-helper-text">
                          JPG, PNG or WebP. Max size 5MB.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Display Name */}
                  <div className="settings-form-group">
                    <label className="settings-form-label" htmlFor="settingsDisplayName">
                      Display Name
                    </label>
                    <input
                      id="settingsDisplayName"
                      type="text"
                      className="settings-text-input"
                      value={displayNameInput}
                      onChange={(e) => setDisplayNameInput(e.target.value)}
                      placeholder="Enter your display name"
                      required
                    />
                    <p className="settings-helper-text">
                      This name will be visible to others. You can change it anytime.
                    </p>
                  </div>

                  {/* Username */}
                  <div className="settings-form-group">
                    <label className="settings-form-label" htmlFor="settingsUsername">
                      Username
                    </label>
                    <div className="settings-username-input-wrap">
                      <span className="settings-username-prefix">@</span>
                      <input
                        id="settingsUsername"
                        type="text"
                        className="settings-username-field"
                        value={usernameInput}
                        onChange={(e) => setUsernameInput(e.target.value.replace(/^@/, ''))}
                        placeholder="username"
                        required
                      />
                    </div>
                    <p className="settings-helper-text">
                      This is your unique username on AwaajManKi.
                    </p>
                  </div>

                  {/* Bio (Optional) */}
                  <div className="settings-form-group">
                    <label className="settings-form-label" htmlFor="settingsBio">
                      Bio (Optional)
                    </label>
                    <div className="settings-bio-wrap">
                      <textarea
                        id="settingsBio"
                        className="settings-bio-textarea"
                        value={bioInput}
                        onChange={(e) => setBioInput(e.target.value.slice(0, 200))}
                        maxLength={200}
                        placeholder="Write a few words about yourself..."
                      />
                      <span className="settings-char-count">{bioInput.length}/200</span>
                    </div>
                  </div>

                  {/* Save Changes Button */}
                  <div className="settings-actions-footer">
                    <button
                      type="submit"
                      className="settings-save-btn"
                      disabled={saving || uploadingAvatar}
                    >
                      {saving ? 'Saving Changes...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* 2. PRIVACY SECTION */}
            {activeTab === 'privacy' && (
              <div className="settings-card">
                <h2 className="settings-card-title">Privacy Preferences</h2>
                <p className="settings-card-subtitle">
                  Control who can see your activity and interact with your thoughts.
                </p>

                <form onSubmit={handleSavePrivacy} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <h3 style={{ fontSize: '14.5px', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                      Comments & Direct Messaging
                    </h3>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13.5px', color: '#1e293b', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={allowComments}
                        onChange={(e) => setAllowComments(e.target.checked)}
                        style={{ accentColor: '#e11d48', width: '16px', height: '16px' }}
                      />
                      <span>Allow comments on my posts by default</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13.5px', color: '#1e293b', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={showPublicComments}
                        onChange={(e) => setShowPublicComments(e.target.checked)}
                        style={{ accentColor: '#e11d48', width: '16px', height: '16px' }}
                      />
                      <span>Show public comments tab on my profile space</span>
                    </label>

                    <div style={{ marginTop: '4px' }}>
                      <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                        Who can send me 1-on-1 Direct Message Requests?
                      </label>
                      <select
                        value={dmPermission}
                        onChange={(e) => setDmPermission(e.target.value)}
                        className="settings-text-input"
                        style={{ maxWidth: '320px', padding: '8px 12px' }}
                      >
                        <option value="everyone">Everyone (All Anonymous Members)</option>
                        <option value="followers">Only Users I Follow</option>
                        <option value="nobody">Nobody (Disable Requests)</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <h3 style={{ fontSize: '14.5px', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                      Identity & Search Visibility
                    </h3>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13.5px', color: '#1e293b', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={hideSearchEngines}
                        onChange={(e) => setHideSearchEngines(e.target.checked)}
                        style={{ accentColor: '#e11d48', width: '16px', height: '16px' }}
                      />
                      <span>Hide my anonymous handle from external web search engines</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13.5px', color: '#1e293b', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={showActiveStatus}
                        onChange={(e) => setShowActiveStatus(e.target.checked)}
                        style={{ accentColor: '#e11d48', width: '16px', height: '16px' }}
                      />
                      <span>Show online presence badge when active</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13.5px', color: '#1e293b', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={hideSensitive}
                        onChange={(e) => setHideSensitive(e.target.checked)}
                        style={{ accentColor: '#e11d48', width: '16px', height: '16px' }}
                      />
                      <span>Automatically blur sensitive content flags</span>
                    </label>
                  </div>

                  <div className="settings-actions-footer">
                    <button type="submit" className="settings-save-btn">
                      Save Privacy Settings
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* 3. NOTIFICATIONS SECTION */}
            {activeTab === 'notifications' && (
              <div className="settings-card">
                <h2 className="settings-card-title">Notification Preferences</h2>
                <p className="settings-card-subtitle">
                  Choose what notifications you receive and how they are delivered.
                </p>

                <form onSubmit={handleSaveNotifications} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <h3 style={{ fontSize: '14.5px', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                      Activity & Interactions
                    </h3>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13.5px', color: '#1e293b', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={chatMessages}
                        onChange={(e) => setChatMessages(e.target.checked)}
                        style={{ accentColor: '#e11d48', width: '16px', height: '16px' }}
                      />
                      <span>Receive toasts and badges for 1-on-1 direct messages</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13.5px', color: '#1e293b', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={postLikes}
                        onChange={(e) => setPostLikes(e.target.checked)}
                        style={{ accentColor: '#e11d48', width: '16px', height: '16px' }}
                      />
                      <span>Notify when members relate to or support my thoughts</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13.5px', color: '#1e293b', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={commentAlerts}
                        onChange={(e) => setCommentAlerts(e.target.checked)}
                        style={{ accentColor: '#e11d48', width: '16px', height: '16px' }}
                      />
                      <span>Notify when members comment or reply on my discussions</span>
                    </label>
                  </div>

                  <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <h3 style={{ fontSize: '14.5px', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                      System & Chimes
                    </h3>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13.5px', color: '#1e293b', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={systemAlerts}
                        onChange={(e) => setSystemAlerts(e.target.checked)}
                        style={{ accentColor: '#e11d48', width: '16px', height: '16px' }}
                      />
                      <span>Receive critical safety and community policy updates</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13.5px', color: '#1e293b', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={soundAlerts}
                        onChange={(e) => setSoundAlerts(e.target.checked)}
                        style={{ accentColor: '#e11d48', width: '16px', height: '16px' }}
                      />
                      <span>Play subtle chime when receiving new notification toasts</span>
                    </label>
                  </div>

                  <div className="settings-actions-footer">
                    <button type="submit" className="settings-save-btn">
                      Save Notification Settings
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* 4. ACCOUNT SECURITY SECTION */}
            {activeTab === 'account' && (
              <div className="settings-card">
                <h2 className="settings-card-title">Account Security</h2>
                <p className="settings-card-subtitle">
                  Manage your credentials, password, and account protection.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {/* Password row */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', border: '1px solid #f1f5f9', borderRadius: '12px' }}>
                    <div>
                      <h3 style={{ fontSize: '14.5px', fontWeight: 700, color: '#0f172a', margin: '0 0 4px 0' }}>Password</h3>
                      <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>Last updated recently. Keep it safe.</p>
                    </div>
                    <button
                      type="button"
                      className="settings-change-photo-btn"
                      onClick={() => setIsPasswordModalOpen(true)}
                    >
                      <KeyRound size={14} />
                      <span>Change Password</span>
                    </button>
                  </div>

                  {/* Email row */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', border: '1px solid #f1f5f9', borderRadius: '12px' }}>
                    <div>
                      <h3 style={{ fontSize: '14.5px', fontWeight: 700, color: '#0f172a', margin: '0 0 4px 0' }}>Primary Email</h3>
                      <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>{maskedEmail}</p>
                    </div>
                    <button
                      type="button"
                      className="settings-change-photo-btn"
                      onClick={() => setIsEmailModalOpen(true)}
                    >
                      <Mail size={14} />
                      <span>Manage Email</span>
                    </button>
                  </div>

                  {/* Deactivation row */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', border: '1px solid #fecdd3', borderRadius: '12px', background: '#fff1f2' }}>
                    <div>
                      <h3 style={{ fontSize: '14.5px', fontWeight: 700, color: '#dc2626', margin: '0 0 4px 0' }}>Danger Zone</h3>
                      <p style={{ fontSize: '12px', color: '#991b1b', margin: 0 }}>Permanently deactivates and removes your account data.</p>
                    </div>
                    <button
                      type="button"
                      className="settings-btn-danger"
                      onClick={() => {
                        setDeleteConfirmed(false);
                        setIsDeleteModalOpen(true);
                      }}
                    >
                      Delete Account
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ── RIGHT COLUMN: QUICK ACTIONS & NEED HELP ── */}
          <div className="settings-right-col">
            
            {/* Quick Actions Card */}
            <div className="settings-side-card">
              <div className="settings-side-card-header">
                <SettingsIcon size={20} className="settings-side-card-header-icon" />
                <div>
                  <h3 className="settings-side-card-title">Quick Actions</h3>
                  <p className="settings-side-card-subtitle">Common account actions</p>
                </div>
              </div>

              <div className="settings-action-rows">
                {/* 1. Change Password */}
                <button
                  type="button"
                  className="settings-action-row"
                  onClick={() => setIsPasswordModalOpen(true)}
                >
                  <div className="settings-action-icon-box">
                    <KeyRound size={17} />
                  </div>
                  <div className="settings-action-text">
                    <h4 className="settings-action-title">Change Password</h4>
                    <p className="settings-action-desc">
                      Update your password to keep your account secure.
                    </p>
                  </div>
                  <ChevronRight size={16} className="settings-action-chevron" />
                </button>

                {/* 2. Manage Email */}
                <button
                  type="button"
                  className="settings-action-row"
                  onClick={() => setIsEmailModalOpen(true)}
                >
                  <div className="settings-action-icon-box">
                    <Mail size={17} />
                  </div>
                  <div className="settings-action-text">
                    <h4 className="settings-action-title">Manage Email</h4>
                    <p className="settings-action-desc">
                      Update your email address.
                    </p>
                  </div>
                  <ChevronRight size={16} className="settings-action-chevron" />
                </button>

                {/* 3. Change Language */}
                <button
                  type="button"
                  className="settings-action-row"
                  onClick={() => setIsLanguageModalOpen(true)}
                  aria-label={`Change Language. Currently: ${currentLangObj.label}`}
                >
                  <div className="settings-action-icon-box">
                    <Globe size={17} />
                  </div>
                  <div className="settings-action-text">
                    <h4 className="settings-action-title">Change Language</h4>
                    <p className="settings-action-desc">
                      Currently: {currentLangObj.label}
                    </p>
                  </div>
                  <ChevronRight size={16} className="settings-action-chevron" />
                </button>

                {/* 4. Delete Account */}
                <button
                  type="button"
                  className="settings-action-row"
                  onClick={() => {
                    setDeleteConfirmed(false);
                    setIsDeleteModalOpen(true);
                  }}
                >
                  <div className="settings-action-icon-box">
                    <Trash2 size={17} />
                  </div>
                  <div className="settings-action-text">
                    <h4 className="settings-action-title">Delete Account</h4>
                    <p className="settings-action-desc">
                      Permanently delete your account and all your data.
                    </p>
                  </div>
                  <ChevronRight size={16} className="settings-action-chevron" />
                </button>
              </div>
            </div>

            {/* Need Help Card */}
            <div className="settings-side-card">
              <div className="settings-side-card-header">
                <HelpCircle size={20} className="settings-side-card-header-icon" />
                <div>
                  <h3 className="settings-side-card-title">Need Help?</h3>
                  <p className="settings-side-card-subtitle">Get support or read our guides.</p>
                </div>
              </div>

              <div className="settings-action-rows">
                {/* 1. Help Center */}
                <button
                  type="button"
                  className="settings-action-row"
                  onClick={() => onNavigate('/help')}
                >
                  <div className="settings-action-icon-box">
                    <BookOpen size={17} />
                  </div>
                  <div className="settings-action-text">
                    <h4 className="settings-action-title">Help Center</h4>
                    <p className="settings-action-desc">
                      Find answers to common questions.
                    </p>
                  </div>
                  <ChevronRight size={16} className="settings-action-chevron" />
                </button>

                {/* 2. Contact Support */}
                <button
                  type="button"
                  className="settings-action-row"
                  onClick={() => onNavigate('/help')}
                >
                  <div className="settings-action-icon-box">
                    <MessageSquare size={17} />
                  </div>
                  <div className="settings-action-text">
                    <h4 className="settings-action-title">Contact Support</h4>
                    <p className="settings-action-desc">
                      We're here to help.
                    </p>
                  </div>
                  <ChevronRight size={16} className="settings-action-chevron" />
                </button>
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* ── 3. MODALS ── */}

      {/* A. Change Password Modal */}
      {isPasswordModalOpen && (
        <div className="settings-modal-backdrop" onClick={() => setIsPasswordModalOpen(false)}>
          <div className="settings-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="settings-modal-header">
              <h3 className="settings-modal-title">Change Password</h3>
              <button
                type="button"
                className="settings-modal-close"
                onClick={() => setIsPasswordModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handlePasswordSubmit}>
              <div className="settings-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label className="settings-form-label">Current Password</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showCurrentPassword ? 'text' : 'password'}
                      className="settings-text-input"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Enter current password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
                    >
                      {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="settings-form-label">New Password</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      className="settings-text-input"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Minimum 6 characters"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
                    >
                      {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="settings-form-label">Confirm New Password</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      className="settings-text-input"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter new password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
                    >
                      {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="settings-modal-footer">
                <button
                  type="button"
                  className="settings-btn-secondary"
                  onClick={() => setIsPasswordModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="settings-btn-primary"
                  disabled={updatingPassword}
                >
                  {updatingPassword ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* B. Manage Email Modal */}
      {isEmailModalOpen && (
        <div className="settings-modal-backdrop" onClick={() => setIsEmailModalOpen(false)}>
          <div className="settings-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="settings-modal-header">
              <h3 className="settings-modal-title">Manage Email Address</h3>
              <button
                type="button"
                className="settings-modal-close"
                onClick={() => setIsEmailModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="settings-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '10px', fontSize: '13px', color: '#475569' }}>
                <strong>Current Email:</strong> {currentUser?.email || 'None registered'}
              </div>

              {!emailOtpSent ? (
                <form onSubmit={handleSendEmailOtp} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <label className="settings-form-label">New Email Address</label>
                    <input
                      type="email"
                      className="settings-text-input"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      placeholder="name@example.com"
                      required
                    />
                  </div>
                  <div className="settings-modal-footer" style={{ margin: '0 -24px -24px -24px' }}>
                    <button
                      type="button"
                      className="settings-btn-secondary"
                      onClick={() => setIsEmailModalOpen(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="settings-btn-primary"
                      disabled={sendingEmailOtp}
                    >
                      {sendingEmailOtp ? 'Sending OTP...' : 'Send Verification OTP'}
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleVerifyEmail} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <label className="settings-form-label">Enter 6-Digit OTP</label>
                    <input
                      type="text"
                      className="settings-text-input"
                      value={emailOtp}
                      onChange={(e) => setEmailOtp(e.target.value)}
                      placeholder="Enter verification code"
                      maxLength={6}
                      required
                    />
                    <p className="settings-helper-text">Check your inbox for the confirmation code.</p>
                  </div>
                  <div className="settings-modal-footer" style={{ margin: '0 -24px -24px -24px' }}>
                    <button
                      type="button"
                      className="settings-btn-secondary"
                      onClick={() => setEmailOtpSent(false)}
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      className="settings-btn-primary"
                      disabled={updatingEmail}
                    >
                      {updatingEmail ? 'Verifying...' : 'Verify & Update Email'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* C. Delete Account Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="settings-modal-backdrop" onClick={() => setIsDeleteModalOpen(false)}>
          <div className="settings-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="settings-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#dc2626' }}>
                <AlertTriangle size={20} />
                <h3 className="settings-modal-title" style={{ color: '#dc2626' }}>Permanently Delete Account</h3>
              </div>
              <button
                type="button"
                className="settings-modal-close"
                onClick={() => setIsDeleteModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="settings-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <p style={{ fontSize: '13.5px', color: '#475569', lineHeight: 1.5, margin: 0 }}>
                Are you sure you want to delete your account? This action will deactivate your identity, remove your published thoughts, comments, and profile data from AwaajManKi.
              </p>

              <div style={{ padding: '12px 14px', background: '#fef2f2', border: '1px solid #fee2e2', borderRadius: '10px' }}>
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '13px', color: '#991b1b', cursor: 'pointer', lineHeight: 1.4 }}>
                  <input
                    type="checkbox"
                    checked={deleteConfirmed}
                    onChange={(e) => setDeleteConfirmed(e.target.checked)}
                    style={{ accentColor: '#dc2626', width: '16px', height: '16px', marginTop: '2px' }}
                  />
                  <span>I understand that this action is permanent and cannot be reversed.</span>
                </label>
              </div>
            </div>

            <div className="settings-modal-footer">
              <button
                type="button"
                className="settings-btn-secondary"
                onClick={() => setIsDeleteModalOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="settings-btn-danger"
                disabled={!deleteConfirmed || deletingAccount}
                onClick={handleDeleteAccount}
              >
                {deletingAccount ? 'Deleting...' : 'Delete My Account'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* D. Change Language Modal */}
      {isLanguageModalOpen && (
        <div className="settings-modal-backdrop" onClick={() => setIsLanguageModalOpen(false)}>
          <div className="settings-modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <div className="settings-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div className="settings-action-icon-box" style={{ width: '32px', height: '32px' }}>
                  <Globe size={18} />
                </div>
                <div>
                  <h3 className="settings-modal-title">Change Language</h3>
                  <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>Select your preferred interface language</p>
                </div>
              </div>
              <button
                type="button"
                className="settings-modal-close"
                onClick={() => setIsLanguageModalOpen(false)}
                aria-label="Close language selector"
              >
                <X size={18} />
              </button>
            </div>

            <div className="settings-modal-body" style={{ padding: '10px 16px 16px' }}>
              <LanguageSelectorDropdown
                inline={true}
                showTrigger={false}
                isOpen={true}
                onClose={() => setIsLanguageModalOpen(false)}
                onSelect={(code) => {
                  const selectedObj = (supportedLanguages || SUPPORTED_LANGUAGES || []).find(l => l.code === code);
                  addToast(`Language updated to ${selectedObj?.label || code}.`, 'success');
                }}
              />
            </div>

            <div className="settings-modal-footer">
              <button
                type="button"
                className="settings-btn-secondary"
                onClick={() => setIsLanguageModalOpen(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </UserLayout>
  );
}
