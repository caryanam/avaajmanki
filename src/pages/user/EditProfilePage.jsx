import React, { useState } from 'react';
import { UserLayout } from '../../components/layout/UserLayout.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { Textarea } from '../../components/common/Textarea.jsx';
import { Button } from '../../components/common/Button.jsx';
import { ArrowLeft, Save, Globe, RefreshCw, Info } from 'lucide-react';
import { ModerationIndicator } from '../../components/common/ModerationIndicator.jsx';
import { moderationCheck } from '../../utils/moderationCheck.js';
import { generateUsernameSuggestions } from '../../utils/generateUsername.js';
import { useToast } from '../../context/ToastContext.jsx';

export function EditProfilePage({ onNavigate }) {
  const { currentUser, updateProfile } = useAuth();
  const { currentLanguage, changeLanguage, supportedLanguages, t } = useLanguage();
  const { addToast } = useToast();

  const [currentUsername, setCurrentUsername] = useState(currentUser?.username || '@user');
  const [bio, setBio] = useState(currentUser?.bio || '');
  const [preferredLang, setPreferredLang] = useState(currentUser?.preferredLanguage || currentLanguage || 'English');
  const [submitting, setSubmitting] = useState(false);

  const modResult = moderationCheck(bio);
  const isBlocked = modResult.status === 'BLOCKED';

  const getDaysLeftForChange = () => {
    const userId = currentUser?.id || currentUser?.userId;
    const lastChangeStr = currentUser?.lastUsernameChangeDate || (userId ? localStorage.getItem(`last_username_change_${userId}`) : null);
    if (!lastChangeStr) return 0;
    const lastChange = new Date(lastChangeStr).getTime();
    if (isNaN(lastChange)) return 0;
    const elapsedDays = (Date.now() - lastChange) / (1000 * 60 * 60 * 24);
    const daysLeft = Math.ceil(14 - elapsedDays);
    return daysLeft > 0 ? daysLeft : 0;
  };

  const daysLeftForChange = getDaysLeftForChange();

  const handleShuffleUsername = () => {
    if (daysLeftForChange > 0) {
      addToast(`Handle can only be changed once every 14 days. Available in ${daysLeftForChange} days.`, 'info');
      return;
    }
    const newSuggestions = generateUsernameSuggestions(1);
    if (newSuggestions.length > 0) {
      setCurrentUsername(newSuggestions[0]);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (isBlocked) return;

    setSubmitting(true);
    try {
      changeLanguage(preferredLang);
      
      if (currentUsername.trim() !== (currentUser?.username || '')) {
        const userId = currentUser?.id || currentUser?.userId;
        if (userId) {
          localStorage.setItem(`last_username_change_${userId}`, new Date().toISOString());
        }
      }

      await updateProfile({
        username: currentUsername.replace('@', ''),
        bio: bio.trim(),
        preferredLanguage: preferredLang,
      });
      onNavigate(`/profile/${currentUsername.replace('@', '')}`);
    } catch (err) {
      console.error('Error saving profile settings:', err);
      addToast(err?.response?.data?.message || err?.message || 'Failed to save profile settings.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <UserLayout activeRoute="/edit-profile" onNavigate={onNavigate}>
      <div className="flex-col gap-md">
        <div className="flex-row items-center gap-sm">
          <Button variant="secondary" size="sm" onClick={() => onNavigate('/settings')} icon={ArrowLeft}>
            Back
          </Button>
          <h1 className="page-heading">Edit Profile</h1>
        </div>

        <form onSubmit={handleSave} className="mka-card flex-col gap-md">
          <div className="mka-panel flex-col gap-xs" style={{ padding: '12px 16px' }}>
            <div className="flex-row justify-between items-center" style={{ width: '100%' }}>
              <div>
                <span className="caption-text bold">Platform Username (Anonymous):</span>
                <p className="bold" style={{ fontSize: '16px', marginTop: '2px', color: '#6F405F' }}>{currentUsername}</p>
              </div>
              <button
                type="button"
                disabled={daysLeftForChange > 0}
                onClick={handleShuffleUsername}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 14px',
                  borderRadius: '16px',
                  background: daysLeftForChange > 0 ? '#C4B9BE' : '#6F405F',
                  color: '#FFFFFF',
                  border: 'none',
                  fontSize: '12.5px',
                  fontWeight: 700,
                  cursor: daysLeftForChange > 0 ? 'not-allowed' : 'pointer',
                }}
              >
                <RefreshCw size={14} />
                <span>Shuffle Handle</span>
              </button>
            </div>

            {/* 14-Day Restriction Note */}
            <div style={{ marginTop: '6px', fontSize: '11.5px', color: daysLeftForChange > 0 ? '#B33A3A' : '#6E625F', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Info size={13} style={{ color: daysLeftForChange > 0 ? '#B33A3A' : '#6F405F', flexShrink: 0 }} />
              <span>
                {daysLeftForChange > 0
                  ? t('usernameCooldownLeft', `Note: Anonymous handle can only be changed once every 14 days. Next change available in ${daysLeftForChange} days.`)
                  : t('usernameCooldownNote', 'Note: Anonymous handles can only be changed once every 14 days.')}
              </span>
            </div>
          </div>

          {/* Preferred Language Selector */}
          <div className="flex-col gap-xs">
            <label style={{ fontSize: '14px', fontWeight: 600 }} className="flex-row items-center gap-xs">
              <Globe size={16} style={{ color: 'var(--deep-plum)' }} />
              <span>Preferred Native Language</span>
            </label>
            <select
              value={supportedLanguages.find(l => l.label.toLowerCase() === (preferredLang || '').toLowerCase() || l.code.toLowerCase() === (preferredLang || '').toLowerCase())?.code || 'EN'}
              onChange={(e) => setPreferredLang(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-light)',
                fontSize: '15px',
                background: 'var(--pure-white)',
              }}
            >
              {supportedLanguages.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.native} ({lang.label})
                </option>
              ))}
            </select>
            <span className="caption-text">Posts, comments, messages, and UI text will automatically adapt to your chosen language.</span>
          </div>

          <div className="flex-col gap-xs">
            <Textarea
              label="Bio"
              placeholder="Write a short anonymous bio..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={4}
              maxLength={200}
              showCounter
            />
            <ModerationIndicator text={bio} />
          </div>

          <div className="flex-row justify-end gap-sm" style={{ borderTop: '1px solid var(--border-light)', paddingTop: '16px' }}>
            <Button type="button" variant="secondary" onClick={() => onNavigate('/settings')}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={isBlocked || submitting} icon={Save}>
              {submitting ? 'Saving...' : 'Save Profile'}
            </Button>
          </div>
        </form>
      </div>
    </UserLayout>
  );
}
