import React, { useState, useEffect, useMemo, useRef } from 'react';
import { UserLayout } from '../../components/layout/UserLayout.jsx';
import { InitialAvatar } from '../../components/profile/InitialAvatar.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { usePosts } from '../../context/PostContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { apiProfileService } from '../../services/apiProfileService.js';
import { PostCard } from '../../components/posts/PostCard.jsx';
import { Button } from '../../components/common/Button.jsx';
import { Modal } from '../../components/common/Modal.jsx';
import { useReports } from '../../context/ReportContext.jsx';
import { Edit3, Trash2, Calendar, Globe, Heart, AlertTriangle, Check, Sparkles, Volume2, VolumeX, ShieldOff, Clock, Flame, MessageSquare, RefreshCw, Info, Mic, MicOff, Loader2, Upload, X, ArrowLeft, Image as ImageIcon, EyeOff, Eye, XCircle } from 'lucide-react';
import { apiClient } from '../../services/apiClient.js';

import { formatDate, RealtimeTimestamp } from '../../utils/formatDate.js';

import { generateUsernameSuggestions } from '../../utils/generateUsername.js';
import { validateUsernameString, getSuggestedNumberVariants } from '../../utils/usernameValidation.js';
import { EmptyState } from '../../components/common/EmptyState.jsx';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { LanguageSelectorDropdown } from '../../components/common/LanguageSelectorDropdown.jsx';
import { SleekCommentSidePanel } from '../../components/posts/SleekCommentSidePanel.jsx';
import { editProfileSchema } from '../../utils/validationSchemas.js';
import { TopicBackgroundRotator } from '../../components/topics/TopicBackgroundRotator.jsx';
import { AnimatedTopicActivityPanel } from '../../components/topics/AnimatedTopicActivityPanel.jsx';
import { AvatarStudioModal } from '../../components/avatar/AvatarStudioModal.jsx';
import { AvatarThumbnail } from '../../components/avatar/AvatarThumbnail.jsx';
import { useVoiceRecorder } from '../../hooks/useVoiceRecorder.js';
import { useSpokenLanguage } from '../../hooks/useSpokenLanguage.js';
import { SYSTEM_TOPICS, isTopicName } from '../../utils/topicUtils.js';



const AVATAR_COLORS = [
  { id: 'plum', hex: '#6F405F', name: 'Deep Plum' },
  { id: 'teal', hex: '#3F7772', name: 'Deep Teal' },
  { id: 'terracotta', hex: '#D96C3D', name: 'Terracotta' },
  { id: 'charcoal', hex: '#2D1D15', name: 'Charcoal' },
  { id: 'emerald', hex: '#2E7D52', name: 'Emerald' },
  { id: 'indigo', hex: '#4A3B6F', name: 'Indigo' },
];

export function ProfilePage({ username, onNavigate }) {
  const { currentUser, updateProfile, deleteAccount, logout } = useAuth();
  const { posts, createPost } = usePosts();
  const { addToast } = useToast();
  const { mutedUsers = [], unmuteUser, blockedUsers = [], unblockUser, hiddenPosts = [], unhidePost } = useReports();
  const { t } = useLanguage();
  const [spokenLanguage] = useSpokenLanguage();

  const [activeTab, setActiveTab] = useState('Posts');
  const [profileData, setProfileData] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  // Topic Create Post Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [postTitle, setPostTitle] = useState('');
  const [postContent, setPostContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [submittingPost, setSubmittingPost] = useState(false);

  const { isRecording, isTranscribing, bindMicProps } = useVoiceRecorder((transcribedText) => {
    setPostContent((prev) => (prev ? `${prev} ${transcribedText}` : transcribedText));
  }, spokenLanguage);


  // Edit Profile Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editUsername, setEditUsername] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editAvatar, setEditAvatar] = useState('');
  const [editAvatarConfig, setEditAvatarConfig] = useState(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [editErrors, setEditErrors] = useState({});
  const [editAvailabilityStatus, setEditAvailabilityStatus] = useState('idle'); // 'idle' | 'checking' | 'available' | 'taken' | 'invalid' | 'error'
  const [editAvailabilityMessage, setEditAvailabilityMessage] = useState('');
  const [editServerSuggestions, setEditServerSuggestions] = useState([]);
  const editCheckIdRef = useRef(0);

  // Avatar Studio Modal State
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);

  // Delete Account Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingProfile, setDeletingProfile] = useState(false);

  // Side Panel Comments State
  const [activeCommentsPost, setActiveCommentsPost] = useState(null);
  const [isSidebarHovered, setIsSidebarHovered] = useState(false);

  const targetUsername = username || currentUser?.username?.replace(/^@/, '');
  const cleanTargetUname = targetUsername?.toLowerCase().replace(/^@/, '');
  const cleanCurrentUserUname = currentUser?.username?.toLowerCase().replace(/^@/, '');

  // Route is self if username is omitted or matches the current user's profile handle
  const isSelf = !username || (Boolean(cleanTargetUname) && Boolean(cleanCurrentUserUname) && cleanTargetUname === cleanCurrentUserUname);
  // Route is a topic route ONLY if it is not self AND matches a valid topic/subtopic name
  const isTopicRoute = !isSelf && Boolean(username) && isTopicName(username);

  const uniqueMutedHandles = useMemo(() => {
    const map = new Map();
    (mutedUsers || []).forEach((u) => {
      if (!u) return;
      const clean = String(u).toLowerCase().replace(/^@/, '').trim();
      if (clean && !map.has(clean)) {
        map.set(clean, `@${clean}`);
      }
    });
    return Array.from(map.values());
  }, [mutedUsers]);

  const uniqueBlockedHandles = useMemo(() => {
    const map = new Map();
    (blockedUsers || []).forEach((u) => {
      if (!u) return;
      const clean = String(u).toLowerCase().replace(/^@/, '').trim();
      if (clean && !map.has(clean)) {
        map.set(clean, `@${clean}`);
      }
    });
    return Array.from(map.values());
  }, [blockedUsers]);




  useEffect(() => {
    window.scrollTo(0, 0);
    let isMounted = true;
    async function loadProfile() {
      setLoadingProfile(true);

      try {
        if (isSelf) {
          if (currentUser) {
            setProfileData({
              username: currentUser.username ? (currentUser.username.startsWith('@') ? currentUser.username : `@${currentUser.username}`) : '@user',
              fullName: currentUser.fullName || 'Private User',
              bio: currentUser.bio || 'Anonymous author on Man Ki Aavaj',
              joinedDate: currentUser.createdAt || new Date().toISOString(),
              avatar: currentUser.avatar || AVATAR_COLORS[0].hex,
              avatarConfig: currentUser.avatarConfig || null,
            });
            setEditUsername(currentUser.username ? currentUser.username.replace(/^@/, '') : '');
            setEditBio(currentUser.bio || '');
            setEditAvatar(currentUser.avatar || AVATAR_COLORS[0].hex);
            setEditAvatarConfig(currentUser.avatarConfig || null);
          } else {
            setProfileData({
              username: currentUser?.username || '@user',
              fullName: currentUser?.fullName || 'Private User',
              bio: currentUser?.bio || 'Anonymous author on Man Ki Aavaj',
              joinedDate: new Date().toISOString(),
              avatar: AVATAR_COLORS[0].hex,
            });
            setEditUsername(currentUser?.username || '');
            setEditBio(currentUser?.bio || '');
          }
        } else if (targetUsername) {
          const isTopicChannel = isTopicName(targetUsername);
          if (isTopicChannel) {
            if (isMounted) {
              setProfileData({
                username: `#${targetUsername.toUpperCase()}`,
                fullName: `${targetUsername.toUpperCase()} Stream`,
                bio: 'Topic discussion stream on Man Ki Aavaj',
                joinedDate: new Date().toISOString(),
                avatar: AVATAR_COLORS[0].hex,
              });
            }
          } else {

            const res = await apiProfileService.getPublicProfile(targetUsername).catch(() => null);
            if (isMounted && res?.data) {
              setProfileData(res.data);
            } else if (isMounted) {
              setProfileData({
                username: `@${targetUsername}`,
                fullName: 'Public Profile',
                bio: 'Member profile on Man Ki Aavaj',
                joinedDate: new Date().toISOString(),
                avatar: AVATAR_COLORS[0].hex,
              });
            }
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (isMounted) {
          setLoadingProfile(false);
          window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
        }
      }
    }
    loadProfile();
    return () => { isMounted = false; };
  }, [username, currentUser, isSelf, targetUsername]);


  const cleanProfileUname = profileData?.username?.toLowerCase().replace(/^@/, '');

  // Filter posts matching topic name or user username
  const userPosts = posts.filter((p) => {

    if (p.status !== 'PUBLISHED' && p.status !== 'ACTIVE') return false;

    // If viewing a Topic Channel Route (e.g. /profile/shayari, /profile/love, /profile/cricket)
    if (isTopicRoute) {
      const pTopic = (p.topic || '').toLowerCase();
      const pSubtopic = (p.subtopic || '').toLowerCase();
      return Boolean(cleanTargetUname && (pTopic === cleanTargetUname || pSubtopic === cleanTargetUname));
    }

    // If viewing a User Profile Page (e.g. /profile/purushottam)
    if (isSelf && currentUser?.id && (p.userId === currentUser.id || String(p.userId) === String(currentUser.id))) {
      return true;
    }
    const pAuthor = (p.username || p.authorUsername || p.handle || '').toLowerCase().replace(/^@/, '');
    const pTopic = (p.topic || '').toLowerCase();
    const pSubtopic = (p.subtopic || '').toLowerCase();

    if (cleanTargetUname && (pAuthor === cleanTargetUname || pTopic === cleanTargetUname || pSubtopic === cleanTargetUname)) {
      return true;
    }
    if (cleanProfileUname && (pAuthor === cleanProfileUname || pTopic === cleanProfileUname || pSubtopic === cleanProfileUname)) {
      return true;
    }
    return false;
  });


  const lastPostTime = userPosts.length > 0 && userPosts[0].createdAt
    ? formatDate(userPosts[0].createdAt)
    : 'Recently updated';

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

  // Real-time Debounced Availability Check for Profile Edit Modal
  useEffect(() => {
    if (!isEditModalOpen) {
      setEditAvailabilityStatus('idle');
      setEditAvailabilityMessage('');
      setEditServerSuggestions([]);
      return;
    }

    const cleanNew = editUsername ? editUsername.trim().replace(/^@/, '') : '';
    const cleanOld = currentUser?.username ? currentUser.username.trim().replace(/^@/, '') : '';

    if (!cleanNew) {
      setEditAvailabilityStatus('idle');
      setEditAvailabilityMessage('');
      setEditServerSuggestions([]);
      return;
    }

    if (cleanNew.toLowerCase() === cleanOld.toLowerCase()) {
      setEditAvailabilityStatus('available');
      setEditAvailabilityMessage('Your current handle');
      setEditServerSuggestions([]);
      return;
    }

    const localErr = validateUsernameString(cleanNew, currentUser?.fullName);
    if (localErr) {
      setEditAvailabilityStatus('invalid');
      setEditAvailabilityMessage(localErr);
      setEditServerSuggestions([]);
      return;
    }

    const checkId = ++editCheckIdRef.current;
    setEditAvailabilityStatus('checking');
    setEditAvailabilityMessage('Checking username...');

    const timer = setTimeout(async () => {
      try {
        const res = await apiProfileService.checkUsername(cleanNew);
        if (editCheckIdRef.current !== checkId) return;

        if (res?.data?.available) {
          setEditAvailabilityStatus('available');
          setEditAvailabilityMessage('✓ Username available');
          setEditServerSuggestions([]);
        } else {
          setEditAvailabilityStatus('taken');
          setEditAvailabilityMessage(res?.data?.message ? `❌ ${res.data.message}` : '❌ Username already taken');
          setEditServerSuggestions(res?.data?.suggestions || []);
        }
      } catch (err) {
        if (editCheckIdRef.current !== checkId) return;
        setEditAvailabilityStatus('error');
        setEditAvailabilityMessage(err?.message || 'Unable to check username availability.');
        setEditServerSuggestions([]);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [editUsername, isEditModalOpen, currentUser?.username, currentUser?.fullName]);

  const handleSaveEdit = async (e) => {
    e.preventDefault();

    const result = editProfileSchema.safeParse({
      username: editUsername,
      bio: editBio,
    });

    if (!result.success) {
      const fieldErrors = {};
      result.error.issues.forEach((issue) => {
        if (issue.path[0]) {
          fieldErrors[issue.path[0]] = issue.message;
        }
      });
      setEditErrors(fieldErrors);
      return;
    }

    const cleanNewUsername = editUsername.trim().replace(/^@/, '');
    const cleanOldUsername = currentUser?.username ? currentUser.username.replace(/^@/, '') : '';

    // Enforce 14-Day Username Change Timer Constraint
    if (cleanNewUsername.toLowerCase() !== cleanOldUsername.toLowerCase()) {
      if (daysLeftForChange > 0) {
        const errMsg = `Username can only be changed once every 14 days. Please wait ${daysLeftForChange} day(s).`;
        setEditErrors({ username: errMsg });
        addToast(errMsg, 'error');
        return;
      }
      if (editAvailabilityStatus === 'taken') {
        const errMsg = 'Username already taken. Please choose another.';
        setEditErrors({ username: errMsg });
        addToast(errMsg, 'error');
        return;
      }
      if (editAvailabilityStatus === 'checking') {
        addToast('Please wait while we verify handle availability.', 'info');
        return;
      }
    }

    setEditErrors({});
    setSavingEdit(true);

    try {
      const updatedUser = await updateProfile({
        username: cleanNewUsername,
        bio: editBio.trim(),
        avatar: editAvatar,
        avatarConfig: editAvatarConfig,
      });

      if (cleanNewUsername.toLowerCase() !== cleanOldUsername.toLowerCase()) {
        const userId = currentUser?.id || currentUser?.userId || 'me';
        localStorage.setItem(`last_username_change_${userId}`, new Date().toISOString());
      }

      const formattedHandle = `@${updatedUser.username ? updatedUser.username.replace(/^@/, '') : cleanNewUsername}`;

      setProfileData((prev) => ({
        ...prev,
        username: formattedHandle,
        bio: updatedUser.bio,
        avatar: updatedUser.avatar,
        avatarConfig: updatedUser.avatarConfig,
      }));

      setIsEditModalOpen(false);
      addToast('Profile details updated successfully.', 'success');

      // Update UI immediately & navigate to new profile route without manual page refresh
      if (cleanNewUsername.toLowerCase() !== cleanOldUsername.toLowerCase() && onNavigate) {
        onNavigate(`/profile/${cleanNewUsername}`);
      }
    } catch (err) {
      console.error(err);
      const errMsg = err?.response?.data?.message || err?.message || 'Failed to update profile.';
      if (err?.response?.status === 409 || errMsg.toLowerCase().includes('already taken') || errMsg.toLowerCase().includes('already exists')) {
        setEditErrors((prev) => ({ ...prev, username: 'Username already taken. Please choose another.' }));
        setEditAvailabilityStatus('taken');
        setEditAvailabilityMessage('❌ Username already taken');
      }
      addToast(errMsg, 'error');
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDeleteProfile = async () => {
    setDeletingProfile(true);
    try {
      await deleteAccount();
      addToast('Profile deleted successfully.', 'success');
      onNavigate('/login');
    } catch (err) {
      console.error(err);
      addToast('Profile deleted.', 'info');
      logout();
      onNavigate('/login');
    } finally {
      setDeletingProfile(false);
      setIsDeleteModalOpen(false);
    }
  };

  return (
    <UserLayout activeRoute={`/profile/${targetUsername}`} onNavigate={onNavigate} wide={true}>
      <TopicBackgroundRotator topicName={targetUsername || 'GENERAL'}>
        <div className="flex-col gap-md" style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>

          {/* ── BACK TO HOME NAVIGATION BUTTON ── */}
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <button
              type="button"
              onClick={() => onNavigate && onNavigate('/home')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 18px',
                borderRadius: '20px',
                background: 'rgba(255, 255, 255, 0.95)',
                color: '#6F405F',
                border: '1.5px solid rgba(111, 64, 95, 0.25)',
                fontSize: '13px',
                fontWeight: 800,
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(45,29,21,0.08)',
                transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateX(-3px)';
                e.currentTarget.style.background = '#FFFFFF';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateX(0)';
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.95)';
              }}
            >
              <ArrowLeft size={16} color="#6F405F" />
              <span>{t('backToHome', '← Back to Home')}</span>
            </button>
          </div>

          {/* ── 1. TOPIC OR USER PROFILE DETAIL BANNER ── */}
          <div

            style={{
              padding: '24px 20px',
              backgroundColor: '#3D2B24',
              color: '#FFFFFF',
              borderRadius: '16px',
              border: '1px solid #4D3830',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '16px',
              boxShadow: '0 8px 30px rgba(0,0,0,0.18)',
              width: '100%',
              boxSizing: 'border-box',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <InitialAvatar
                username={targetUsername || 'USER'}
                avatarConfig={profileData?.avatarConfig}
                size={68}
              />

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h1 style={{ fontSize: '26px', fontWeight: 800, margin: 0, color: '#FFFFFF', letterSpacing: '0.02em' }}>
                    {isTopicRoute
                      ? `#${t((targetUsername || 'GENERAL').toUpperCase(), (targetUsername || 'GENERAL').toUpperCase())}`
                      : (targetUsername ? `@${targetUsername.replace(/^@/, '')}` : '@user')}
                  </h1>
                  <span style={{ fontSize: '11px', fontWeight: 800, padding: '3px 10px', borderRadius: '12px', background: isTopicRoute ? '#D96C3D' : '#3F7772', color: '#FFFFFF', textTransform: 'uppercase' }}>
                    {isTopicRoute ? t('trendingTopic', 'Trending Topic') : t('authorProfile', 'Author Profile')}
                  </span>
                </div>

                {!isTopicRoute && profileData?.bio && (
                  <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.85)', margin: 0 }}>
                    {profileData.bio}
                  </p>
                )}

                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '13px', color: 'rgba(255,255,255,0.92)', marginTop: '2px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <Clock size={14} />
                    <span>{t('lastPost', 'Last post')} {lastPostTime}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <Flame size={14} />
                    <span>{userPosts.length} {t('thoughtsShared', 'Thoughts shared')}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons: Topic Create button for Topics, Edit/Mute buttons for User Profiles */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {isTopicRoute ? null : (
                isSelf ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <LanguageSelectorDropdown compact={false} />
                    <button
                      type="button"
                      onClick={() => {
                        setEditUsername(currentUser?.username ? currentUser.username.replace(/^@/, '') : '');
                        setEditBio(currentUser?.bio || '');
                        setEditErrors({});
                        setEditAvailabilityStatus('available');
                        setEditAvailabilityMessage('Your current handle');
                        setIsEditModalOpen(true);
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '8px 18px',
                        borderRadius: '20px',
                        background: '#FFFFFF',
                        color: '#6F405F',
                        fontSize: '13px',
                        fontWeight: 700,
                        border: 'none',
                        boxShadow: '0 4px 14px rgba(0,0,0,0.18)',
                        cursor: 'pointer',
                        transition: 'transform 0.15s ease',
                      }}
                    >
                      <Edit3 size={15} />
                      <span>{t('editProfile', 'Edit Profile')}</span>
                    </button>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addToast(`Muted posts from @${targetUsername}`, 'info')}
                    style={{ borderColor: 'rgba(255,255,255,0.4)', color: '#FFF' }}
                  >
                    Mute Handle
                  </Button>
                )
              )}
            </div>
          </div>

          {/* ── 2. FULL-WIDTH POSTS FEED (RIGHT SIDE COMMENT BOX & EXTRA TOPICS STREAM REMOVED) ── */}
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Navigation Tabs */}
            <div
              style={{
                display: 'flex',
                gap: '8px',
                borderBottom: '1.5px solid #EDE8E6',
                paddingBottom: '2px',
                height: '38px',
                alignItems: 'center',
              }}
            >
              <button
                onClick={() => setActiveTab('Posts')}
                style={{
                  padding: '8px 16px',
                  fontSize: '14px',
                  fontWeight: activeTab === 'Posts' ? 700 : 500,
                  color: activeTab === 'Posts' ? '#6F405F' : '#6E625F',
                  borderTop: 'none',
                  borderLeft: 'none',
                  borderRight: 'none',
                  borderBottom: activeTab === 'Posts' ? '2.5px solid #6F405F' : '2.5px solid transparent',
                  background: 'none',
                  outline: 'none',
                  cursor: 'pointer',
                }}
              >
                {isTopicRoute ? `${t('topicPosts', 'Topic Posts')} (${userPosts.length})` : `${t('myPosts', 'User Thoughts')} (${userPosts.length})`}
              </button>

              {isSelf && (
                <>
                  <button
                    onClick={() => setActiveTab('Muted')}
                    style={{
                      padding: '8px 16px',
                      fontSize: '14px',
                      fontWeight: activeTab === 'Muted' ? 700 : 500,
                      color: activeTab === 'Muted' ? '#6F405F' : '#6E625F',
                      borderTop: 'none',
                      borderLeft: 'none',
                      borderRight: 'none',
                      borderBottom: activeTab === 'Muted' ? '2.5px solid #6F405F' : '2.5px solid transparent',
                      background: 'none',
                      outline: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    {t('mutedHandles', 'Muted Handles')} ({uniqueMutedHandles.length})
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('Blocked')}
                    style={{
                      padding: '8px 16px',
                      fontSize: '14px',
                      fontWeight: activeTab === 'Blocked' ? 700 : 500,
                      color: activeTab === 'Blocked' ? '#6F405F' : '#6E625F',
                      borderTop: 'none',
                      borderLeft: 'none',
                      borderRight: 'none',
                      borderBottom: activeTab === 'Blocked' ? '2.5px solid #6F405F' : '2.5px solid transparent',
                      background: 'none',
                      outline: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    {t('blockedUsers', 'Blocked Users')} ({uniqueBlockedHandles.length})
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('Hidden')}
                    style={{
                      padding: '8px 16px',
                      fontSize: '14px',
                      fontWeight: activeTab === 'Hidden' ? 700 : 500,
                      color: activeTab === 'Hidden' ? '#6F405F' : '#6E625F',
                      borderTop: 'none',
                      borderLeft: 'none',
                      borderRight: 'none',
                      borderBottom: activeTab === 'Hidden' ? '2.5px solid #6F405F' : '2.5px solid transparent',
                      background: 'none',
                      outline: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    {t('hiddenThoughts', 'Hidden Thoughts')} ({hiddenPosts.length})
                  </button>
                </>
              )}

          </div>

          {/* Tab Content: Posts Stream */}
          {activeTab === 'Posts' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
              {userPosts.length === 0 ? (
                <EmptyState
                  title={t('noThoughtsTopicYet', 'No thoughts under this topic yet')}
                  description={t('beFirstAuthor', 'Be the first author to post a thought under this topic category.')}
                  icon={Calendar}
                />
              ) : (
                userPosts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    onNavigate={onNavigate}
                    onToggleComments={() => {
                      if (activeCommentsPost?.id === post.id) setActiveCommentsPost(null);
                      else setActiveCommentsPost(post);
                    }}
                    activeCommentsPostId={activeCommentsPost?.id}
                  />
                ))
              )}
            </div>
          )}

          {activeTab === 'Muted' && isSelf && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
              {uniqueMutedHandles.length === 0 ? (
                <EmptyState title="No muted handles" description="Handles you mute will appear here." icon={VolumeX} />
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: '10px' }}>
                  {uniqueMutedHandles.map((handle) => (
                    <div
                      key={handle}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 14px',
                        borderRadius: '12px',
                        backgroundColor: '#FFFFFF',
                        border: '1.5px solid #EAE4E4',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                      }}
                    >
                      <span style={{ fontSize: '13.5px', fontWeight: 700, color: '#2D1D15' }}>
                        {handle}
                      </span>
                      <button
                        type="button"
                        onClick={() => unmuteUser(handle)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '4px 10px',
                          borderRadius: '8px',
                          background: 'rgba(111,64,95,0.1)',
                          color: 'var(--deep-plum)',
                          border: '1px solid rgba(111,64,95,0.2)',
                          fontSize: '11.5px',
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        <Volume2 size={13} />
                        <span>Unmute</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'Blocked' && isSelf && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
              {uniqueBlockedHandles.length === 0 ? (
                <EmptyState title="No blocked users" description="Users you block will appear here so you can unblock them anytime." icon={ShieldOff} />
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: '10px' }}>
                  {uniqueBlockedHandles.map((handle) => (
                    <div
                      key={handle}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 14px',
                        borderRadius: '12px',
                        backgroundColor: '#FFFFFF',
                        border: '1.5px solid #EAE4E4',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                      }}
                    >
                      <span style={{ fontSize: '13.5px', fontWeight: 700, color: '#2D1D15' }}>
                        {handle}
                      </span>
                      <button
                        type="button"
                        onClick={() => unblockUser(handle)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '4px 10px',
                          borderRadius: '8px',
                          background: 'rgba(198,40,40,0.1)',
                          color: '#C62828',
                          border: '1px solid rgba(198,40,40,0.2)',
                          fontSize: '11.5px',
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        <ShieldOff size={13} />
                        <span>Unblock</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab Content: Hidden Thoughts Stream */}
          {activeTab === 'Hidden' && isSelf && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
              {hiddenPosts.length === 0 ? (
                <EmptyState title="No hidden thoughts" description="Thoughts you hide using post options (...) will appear here so you can unhide them anytime." icon={EyeOff} />
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px' }}>
                  {hiddenPosts.map((item) => {
                    const id = typeof item === 'object' ? item.id : item;
                    const title = typeof item === 'object' ? (item.title || item.content || `Thought #${id}`) : `Thought #${id}`;
                    const author = typeof item === 'object' ? (item.username || '@anonymous') : '@author';
                    const fullPost = posts.find(p => String(p.id) === String(id));
                    const imageUrl = fullPost?.imageUrl || (typeof item === 'object' ? item.imageUrl : null);
                    const displayTitle = fullPost?.title || title;
                    const displayContent = fullPost?.originalContent || fullPost?.content || (typeof item === 'object' ? item.content : '');

                    return (
                      <div
                        key={id}
                        style={{
                          aspectRatio: '1 / 1',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          padding: '16px',
                          borderRadius: '16px',
                          backgroundColor: '#FFFFFF',
                          border: '1.5px solid #EAE4E4',
                          boxShadow: '0 4px 14px rgba(0,0,0,0.04)',
                          position: 'relative',
                          overflow: 'hidden',
                          transition: 'all 0.2s ease',
                        }}
                      >
                        {/* Image background thumbnail if post has image */}
                        {imageUrl && (
                          <div
                            style={{
                              position: 'absolute',
                              inset: 0,
                              backgroundImage: `url(${imageUrl})`,
                              backgroundSize: 'cover',
                              backgroundPosition: 'center',
                              opacity: 0.12,
                              filter: 'blur(1px)',
                              pointerEvents: 'none',
                            }}
                          />
                        )}

                        <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: '8px', overflow: 'hidden' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
                            <span style={{ fontSize: '11.5px', fontWeight: 800, color: '#6F405F', background: 'rgba(111,64,95,0.1)', padding: '3px 9px', borderRadius: '10px' }}>
                              {author.startsWith('@') ? author : `@${author}`}
                            </span>
                            <span style={{ fontSize: '11px', fontWeight: 700, color: '#8C8385' }}>
                              #{id}
                            </span>
                          </div>

                          <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#2D1D15', margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', textOverflow: 'ellipsis', lineHeight: '1.3' }}>
                            {displayTitle}
                          </h4>

                          {displayContent && displayContent !== displayTitle && (
                            <p style={{ fontSize: '12px', color: '#6E625F', margin: 0, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', textOverflow: 'ellipsis', lineHeight: '1.4' }}>
                              {displayContent}
                            </p>
                          )}
                        </div>

                        <div style={{ position: 'relative', zIndex: 1, marginTop: '12px', paddingTop: '10px', borderTop: '1px solid #F0ECEB' }}>
                          <button
                            type="button"
                            onClick={() => unhidePost(id)}
                            style={{
                              width: '100%',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '6px',
                              padding: '8px 12px',
                              borderRadius: '12px',
                              background: 'linear-gradient(135deg, #2E7D32 0%, #1B5E20 100%)',
                              color: '#FFFFFF',
                              border: 'none',
                              fontSize: '12.5px',
                              fontWeight: 800,
                              cursor: 'pointer',
                              boxShadow: '0 2px 8px rgba(46,125,50,0.25)',
                              transition: 'all 0.15s ease',
                            }}
                          >
                            <Eye size={14} />
                            <span>Unhide Thought</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}



          </div>
        </div>
      </TopicBackgroundRotator>


      {/* Edit Profile Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Profile">
        <form onSubmit={handleSaveEdit} className="flex-col gap-md">
          <div>
            <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--eclipse)', display: 'block', marginBottom: '6px' }}>
              Anonymous Handle (Editable Input Field)
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                  <span style={{
                    position: 'absolute',
                    left: '12px',
                    top: '10px',
                    fontSize: '14px',
                    fontWeight: 800,
                    color: (editErrors.username || editAvailabilityStatus === 'taken' || editAvailabilityStatus === 'error')
                      ? '#B33A3A'
                      : editAvailabilityStatus === 'available' && editUsername.trim().toLowerCase() !== (currentUser?.username || '').replace(/^@/, '').toLowerCase()
                      ? '#2E7D52'
                      : '#6F405F'
                  }}>@</span>
                  <input
                    type="text"
                    value={editUsername}
                    disabled={daysLeftForChange > 0}
                    onChange={(e) => {
                      const val = e.target.value.replace(/^@/, '');
                      setEditUsername(val);
                      const err = validateUsernameString(val, currentUser?.fullName);
                      setEditErrors((prev) => ({ ...prev, username: err }));
                    }}
                    placeholder="captainamerica or cyberninja"
                    style={{
                      width: '100%',
                      padding: '8px 12px 8px 28px',
                      borderRadius: '10px',
                      border: (editErrors.username || editAvailabilityStatus === 'taken' || editAvailabilityStatus === 'error')
                        ? '1.5px solid #B33A3A'
                        : editAvailabilityStatus === 'available' && editUsername.trim().toLowerCase() !== (currentUser?.username || '').replace(/^@/, '').toLowerCase()
                        ? '1.5px solid #2E7D52'
                        : '1.5px solid #6F405F',
                      fontSize: '14px',
                      fontWeight: 700,
                      outline: 'none',
                      backgroundColor: daysLeftForChange > 0 ? '#F5EFF3' : '#FFFFFF',
                      color: daysLeftForChange > 0 ? '#8C8385' : '#2D1D15',
                      cursor: daysLeftForChange > 0 ? 'not-allowed' : 'text',
                    }}
                  />
                </div>
                <button
                  type="button"
                  disabled={daysLeftForChange > 0}
                  onClick={() => {
                    if (daysLeftForChange > 0) {
                      addToast(`Handle can only be changed once every 14 days. Available in ${daysLeftForChange} days.`, 'info');
                      return;
                    }
                    const newSuggestions = generateUsernameSuggestions(1);
                    if (newSuggestions.length > 0) {
                      const uname = newSuggestions[0].replace('@', '');
                      setEditUsername(uname);
                      setEditErrors((prev) => ({ ...prev, username: null }));
                    }
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 12px',
                    borderRadius: '10px',
                    background: daysLeftForChange > 0 ? '#C4B9BE' : '#6F405F',
                    color: '#FFFFFF',
                    border: 'none',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: daysLeftForChange > 0 ? 'not-allowed' : 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <RefreshCw size={13} />
                  <span>Shuffle</span>
                </button>
              </div>

              {/* Status and Availability Feedback */}
              {editErrors.username ? (
                <div style={{ fontSize: '11.5px', color: '#B33A3A', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <AlertTriangle size={13} color="#B33A3A" />
                  <span>{editErrors.username}</span>
                </div>
              ) : editAvailabilityStatus === 'checking' ? (
                <div style={{ fontSize: '11.5px', color: '#6F405F', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Loader2 size={13} className="spin-animation" />
                  <span>Checking username...</span>
                </div>
              ) : editAvailabilityStatus === 'available' && editUsername.trim().toLowerCase() !== (currentUser?.username || '').replace(/^@/, '').toLowerCase() ? (
                <div style={{ fontSize: '11.5px', color: '#2E7D52', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Check size={13} color="#2E7D52" />
                  <span>{editAvailabilityMessage || '✓ Username available'}</span>
                </div>
              ) : editAvailabilityStatus === 'taken' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ fontSize: '11.5px', color: '#B33A3A', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <XCircle size={13} color="#B33A3A" />
                    <span>{editAvailabilityMessage || '❌ Username already taken'}</span>
                  </div>
                  {editServerSuggestions && editServerSuggestions.length > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginTop: '2px' }}>
                      <span style={{ fontSize: '11px', color: '#6F405F', fontWeight: 700 }}>Available alternatives:</span>
                      {editServerSuggestions.map((sug) => (
                        <button
                          key={sug}
                          type="button"
                          disabled={daysLeftForChange > 0}
                          onClick={() => {
                            setEditUsername(sug);
                            setEditErrors((prev) => ({ ...prev, username: null }));
                          }}
                          style={{
                            padding: '3px 9px',
                            borderRadius: '12px',
                            fontSize: '11px',
                            fontWeight: 700,
                            color: '#6F405F',
                            background: '#F3EBF0',
                            border: '1px solid rgba(111, 64, 95, 0.25)',
                            cursor: daysLeftForChange > 0 ? 'not-allowed' : 'pointer',
                          }}
                        >
                          @{sug}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : null}

              {/* Fallback Suggested Number Variants Pills when no server suggestions are active */}
              {editUsername && editAvailabilityStatus !== 'taken' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginTop: '2px' }}>
                  <span style={{ fontSize: '11px', color: '#6F405F', fontWeight: 700 }}>Suggestions:</span>
                  {getSuggestedNumberVariants(editUsername, 3).map((numSug) => (
                    <button
                      key={numSug}
                      type="button"
                      disabled={daysLeftForChange > 0}
                      onClick={() => {
                        setEditUsername(numSug);
                        setEditErrors((prev) => ({ ...prev, username: null }));
                      }}
                      style={{
                        padding: '3px 9px',
                        borderRadius: '12px',
                        fontSize: '11px',
                        fontWeight: 700,
                        color: '#6F405F',
                        background: '#F3EBF0',
                        border: '1px solid rgba(111, 64, 95, 0.25)',
                        cursor: daysLeftForChange > 0 ? 'not-allowed' : 'pointer',
                      }}
                    >
                      @{numSug}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 14-Day Cooldown Note */}
            <div style={{ marginTop: '8px', fontSize: '11.5px', color: daysLeftForChange > 0 ? '#B33A3A' : '#6E625F', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Info size={13} style={{ color: daysLeftForChange > 0 ? '#B33A3A' : '#6F405F', flexShrink: 0 }} />
              <span>
                {daysLeftForChange > 0
                  ? t('usernameCooldownLeft', `Note: Anonymous handle can only be updated once every 14 days. Next change available in ${daysLeftForChange} days.`)
                  : t('usernameCooldownNote', 'Note: You get 1 free edit after onboarding. Subsequent edits require a 14-day wait.')}
              </span>
            </div>
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--eclipse)', display: 'block', marginBottom: '4px' }}>
              Bio / Tagline
            </label>
            <textarea
              rows={3}
              value={editBio}
              onChange={(e) => setEditBio(e.target.value)}
              style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #D4CECC', fontSize: '13px' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '8px' }}>
            <Button type="button" variant="secondary" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={
                savingEdit ||
                Boolean(editErrors.username) ||
                editAvailabilityStatus === 'taken' ||
                editAvailabilityStatus === 'checking' ||
                (daysLeftForChange > 0 && editUsername !== profileData?.username?.replace(/^@/, ''))
              }
            >
              {savingEdit ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Avatar Studio Modal */}
      {isAvatarModalOpen && (
        <AvatarStudioModal
          isOpen={isAvatarModalOpen}
          onClose={() => setIsAvatarModalOpen(false)}
          currentUsername={currentUser?.username || '@user'}
          currentConfig={currentUser?.avatarConfig}
          onSave={async (newConfig) => {
            await updateProfile({ avatarConfig: newConfig });
            setEditAvatarConfig(newConfig);
            setProfileData((prev) => ({ ...prev, avatarConfig: newConfig }));
            setIsAvatarModalOpen(false);
          }}
        />
      )}

      {/* ── CREATE THOUGHT ON TOPIC MODAL OVERLAY ── */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title={`Create Anonymous Thought in #${(targetUsername || 'GENERAL').toUpperCase()}`}
      >
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            if (!postContent.trim() || submittingPost) return;
            setSubmittingPost(true);
            try {
              const targetTopic = (targetUsername || 'GENERAL').toUpperCase();
              await createPost({
                title: postTitle.trim(),
                content: postContent.trim(),
                topic: targetTopic,
                imageUrl,
              });

              addToast(`Thought published under #${targetTopic}!`, 'success');
              setPostTitle('');
              setPostContent('');
              setImageUrl('');
              setIsCreateModalOpen(false);
            } catch (err) {
              console.error(err);
              addToast(err?.message || 'Failed to publish thought.', 'error');
            } finally {
              setSubmittingPost(false);
            }
          }}
          style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}
        >
          <div style={{ borderBottom: '1px solid #E1DCDB', paddingBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AvatarThumbnail
              username={currentUser?.username || '@writer'}
              initials={currentUser?.avatarInitials || 'AN'}
              config={currentUser?.avatarConfig}
              size={32}
            />
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#2D1D15' }}>
              Posting as <span style={{ color: '#6F405F' }}>{currentUser?.username || '@anonymous'}</span> under <span style={{ color: '#D96C3D', fontWeight: 800 }}>#{(targetUsername || 'GENERAL').toUpperCase()}</span>
            </span>
          </div>

          <input
            type="text"
            placeholder={t('titlePlaceholder', 'Title / Headline (optional)...')}
            value={postTitle}
            onChange={(e) => setPostTitle(e.target.value)}
            style={{
              padding: '10px 14px',
              borderRadius: '10px',
              border: '1px solid #D4CECC',
              fontSize: '14px',
              outline: 'none',
            }}
          />

          <div style={{ position: 'relative', width: '100%' }}>
            <textarea
              rows={4}
              placeholder={t('shareThoughtsFreely', "What's on your mind? Share your unspoken thoughts anonymously...")}
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 42px 12px 14px',
                borderRadius: '12px',
                border: '1px solid #D4CECC',
                fontSize: '14px',
                outline: 'none',
                resize: 'vertical',
              }}
            />

            <button
              type="button"
              {...bindMicProps}
              title={isRecording ? 'Release mic to transcribe' : 'Press & Hold mic to record voice'}
              style={{
                position: 'absolute',
                right: '12px',
                bottom: '16px',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: isRecording ? '#B33A3A' : 'rgba(111,64,95,0.12)',
                color: isRecording ? '#FFFFFF' : '#6F405F',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              {isTranscribing ? <Loader2 size={16} className="spin-animation" /> : isRecording ? <MicOff size={16} /> : <Mic size={16} />}
            </button>
          </div>

          {/* ── IMAGE ATTACHMENT INPUT FIELD (FILE UPLOAD ONLY) ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label
              style={{
                padding: '10px 16px',
                borderRadius: '12px',
                background: imageUrl ? 'rgba(111,64,95,0.08)' : 'rgba(111,64,95,0.12)',
                color: 'var(--deep-plum)',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                border: '1.5px dashed rgba(111,64,95,0.3)',
                transition: 'all 0.2s ease',
                width: '100%',
              }}
            >
              <Upload size={16} />
              <span>{imageUrl ? t('changeImage', 'Change Attached Image') : t('uploadImageFile', '📷 Attach Image File')}</span>
              <input
                type="file"
                accept="image/*"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  try {
                    const formData = new FormData();
                    formData.append('file', file);
                    const res = await apiClient.post('/api/upload/image', formData, {
                      headers: { 'Content-Type': 'multipart/form-data' },
                    });
                    if (res.data?.success && res.data?.data?.imageUrl) {
                      setImageUrl(res.data.data.imageUrl);
                      addToast('Image attached successfully!', 'success');
                    }
                  } catch (err) {
                    addToast('Failed to upload image.', 'error');
                  }
                }}
                style={{ display: 'none' }}
              />
            </label>

            {imageUrl && (
              <div style={{ position: 'relative', marginTop: '4px', width: 'fit-content' }}>
                <img src={imageUrl} alt="Attached Preview" style={{ height: '76px', borderRadius: '10px', border: '1px solid #D4CECC', objectFit: 'cover' }} />
                <button
                  type="button"
                  onClick={() => setImageUrl('')}
                  style={{
                    position: 'absolute',
                    top: '-6px',
                    right: '-6px',
                    background: '#FF4D4F',
                    color: '#FFF',
                    border: 'none',
                    borderRadius: '50%',
                    width: '20px',
                    height: '20px',
                    fontSize: '11px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                  }}
                >
                  ✕
                </button>
              </div>
            )}
          </div>


          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>

            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #D4CECC', background: '#FFF', fontSize: '13px' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submittingPost || !postContent.trim()}
              style={{
                padding: '8px 20px',
                borderRadius: '8px',
                border: 'none',
                background: 'var(--deep-plum)',
                color: '#FFF',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              {submittingPost ? t('publishing', 'Publishing...') : t('publishThought', 'Publish Thought')}
            </button>
          </div>
        </form>
      </Modal>
    </UserLayout>
  );
}

