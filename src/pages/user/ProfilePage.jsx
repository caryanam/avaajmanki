import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { 
  FileText, MessageSquare, Heart, Bookmark, Hash, Camera, Edit3, 
  Trash2, MoreHorizontal, ArrowRight, Clock, Star, AlertCircle, X, Check,
  Share2, ExternalLink, Copy, Loader2, Sparkles, User as UserIcon
} from 'lucide-react';
import { UserLayout } from '../../components/layout/UserLayout.jsx';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { USER_MODERATION_KEYS } from '../../hooks/useUserModeration.js';
import { apiProfileService } from '../../services/apiProfileService.js';
import { apiPostService } from '../../services/apiPostService.js';
import { apiTopicService } from '../../services/apiTopicService.js';
import { apiCommentService } from '../../services/apiCommentService.js';
import { apiClient } from '../../services/apiClient.js';
import { getMediaUrl } from '../../config/env.js';
import { resolveTopicCover, formatTopicTitle, getCategoryLabel } from '../../components/my-topics/MyTopicRow.jsx';
import heroProfileBanner from '../../assets/profile/hero-profile-banner.png';
import sidebarSunsetCity from '../../assets/home/sidebar-sunset-city.jpg';
import '../../styles/profile.css';

export function ProfilePage({ username, onNavigate }) {
  const { currentUser, updateProfile } = useAuth();
  const { addToast } = useToast();
  const queryClient = useQueryClient();

  // Active activity tab: 'posts' | 'comments' | 'liked' | 'topics' | 'bookmarks'
  const [activeTab, setActiveTab] = useState('posts');
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState(null);

  // Activity data
  const [myPosts, setMyPosts] = useState([]);
  const [myComments, setMyComments] = useState([]);
  const [savedPosts, setSavedPosts] = useState([]);
  const [likedPosts, setLikedPosts] = useState([]);
  const [myTopics, setMyTopics] = useState([]);
  const [allTopics, setAllTopics] = useState([]);
  const [topTopics, setTopTopics] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [statsData, setStatsData] = useState({
    postsCount: 0,
    commentsCount: 0,
    likesCount: 0,
    bookmarksCount: 0,
  });

  // Modals state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFullName, setEditFullName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editAvatarPreview, setEditAvatarPreview] = useState(null);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Delete Post Confirmation state
  const [postToDelete, setPostToDelete] = useState(null);
  const [isDeletingPost, setIsDeletingPost] = useState(false);

  // Active 3-dots menu for posts
  const [openMenuPostId, setOpenMenuPostId] = useState(null);
  const [failedImages, setFailedImages] = useState({});
  const fileInputRef = useRef(null);

  // Fetch all profile and personal activity data from authenticated endpoints
  const fetchAllProfileData = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Fetch authenticated profile details
      try {
        const profRes = await queryClient.ensureQueryData({
          queryKey: [...USER_MODERATION_KEYS.myProfile, currentUser?.id || 'me'],
          queryFn: () => apiProfileService.getMyProfile(),
          staleTime: 5 * 60 * 1000,
        });
        const profileObj = profRes?.data || profRes;
        if (profileObj) {
          setProfileData(profileObj);
          setEditFullName(profileObj.fullName || currentUser?.fullName || currentUser?.name || profileObj.username || '');
          setEditBio((profileObj.bio || '').replace(/\?\?+$/, '❤️'));
        }
      } catch (profErr) {
        console.warn('[ProfilePage] getMyProfile notice:', profErr);
      }

      // 2. Fetch authenticated statistics
      try {
        const statsRes = await apiProfileService.getMyProfileStats();
        if (statsRes?.data) {
          setStatsData(statsRes.data);
        }
      } catch (statsErr) {
        console.warn('[ProfilePage] Stats fetch notice:', statsErr);
      }

      // 3. Fetch authenticated user posts
      try {
        const postsRes = await apiPostService.getMyPosts({ page: 0, size: 20 });
        const postItems = postsRes?.data?.content || postsRes?.content || (Array.isArray(postsRes?.data) ? postsRes.data : []);
        setMyPosts(postItems);
      } catch (postErr) {
        console.warn('[ProfilePage] My posts fetch notice:', postErr);
      }

      // 4. Fetch authenticated user comments and replies
      try {
        const commRes = await apiCommentService.getMyComments({ page: 0, size: 20 });
        const commItems = commRes?.data?.content || commRes?.content || (Array.isArray(commRes?.data) ? commRes.data : []);
        setMyComments(commItems);
      } catch (commErr) {
        console.warn('[ProfilePage] Comments fetch notice:', commErr);
      }

      // 5. Fetch posts liked by authenticated user
      try {
        const likedRes = await apiPostService.getLikedPosts({ page: 0, size: 20 });
        const likedItems = likedRes?.data?.content || likedRes?.content || (Array.isArray(likedRes?.data) ? likedRes.data : []);
        setLikedPosts(likedItems);
      } catch (likedErr) {
        console.warn('[ProfilePage] Liked posts fetch notice:', likedErr);
      }

      // 6. Fetch saved posts
      try {
        const savedRes = await apiPostService.getSavedPosts({ page: 0, size: 20 });
        const savedItems = savedRes?.data?.content || savedRes?.content || (Array.isArray(savedRes?.data) ? savedRes.data : []);
        setSavedPosts(savedItems);
      } catch (savedErr) {
        console.warn('[ProfilePage] Saved posts notice:', savedErr);
      }

      // 7. Fetch topics created by the user
      try {
        const topicsRes = await apiTopicService.getMyTopics({ page: 0, size: 20 });
        const topicItems = Array.isArray(topicsRes) ? topicsRes : (topicsRes?.data || topicsRes?.content || []);
        setMyTopics(topicItems);
      } catch (topicErr) {
        console.warn('[ProfilePage] Topics fetch notice:', topicErr);
      }

      // 8. Fetch user top topics by authored post count
      try {
        const topRes = await apiProfileService.getMyTopTopics();
        setTopTopics(topRes?.data || []);
      } catch (topErr) {
        console.warn('[ProfilePage] Top topics fetch notice:', topErr);
      }

      // 9. Fetch user recent personal activity
      try {
        const actRes = await apiProfileService.getMyRecentActivity();
        setRecentActivities(actRes?.data || []);
      } catch (actErr) {
        console.warn('[ProfilePage] Recent activity fetch notice:', actErr);
      }
    } catch (err) {
      console.error('[ProfilePage] Failed to load profile data:', err);
    } finally {
      setLoading(false);
    }
  }, [currentUser?.username, currentUser?.id, currentUser?.fullName, currentUser?.name]);

  useEffect(() => {
    fetchAllProfileData();
  }, [fetchAllProfileData]);

  // Handle avatar upload via file picker
  const handleAvatarFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      addToast('Image file too large. Please select an image under 5MB.', 'error');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await apiClient.post('/api/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const uploadedUrl = res.data?.data?.imageUrl || res.data?.imageUrl;
      if (!uploadedUrl) {
        throw new Error('Upload failed. No image URL returned.');
      }

      // Update profile backend
      await apiProfileService.updateProfile({
        avatar: uploadedUrl,
        username: profileData?.username || currentUser?.username?.replace(/^@/, ''),
        bio: profileData?.bio || currentUser?.bio || '',
      });

      // Synchronize AuthContext
      if (updateProfile) {
        await updateProfile({ avatar: uploadedUrl });
      }

      setProfileData((prev) => ({ ...prev, avatar: uploadedUrl }));
      addToast('Profile picture updated successfully!', 'success');
    } catch (err) {
      console.error('[ProfilePage] Avatar upload error:', err);
      addToast(err?.message || 'Failed to upload profile picture', 'error');
    }
  };

  // Handle Edit Profile Save
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsSavingProfile(true);
    try {
      const updates = {
        fullName: editFullName.trim(),
        username: profileData?.username || currentUser?.username?.replace(/^@/, ''),
        bio: editBio.trim(),
        avatar: editAvatarPreview || profileData?.avatar || currentUser?.avatar || '',
      };

      const res = await apiProfileService.updateProfile(updates);
      const resData = res?.data || {};

      if (updateProfile) {
        await updateProfile({
          ...updates,
          fullName: resData.fullName || editFullName.trim(),
        });
      }

      setProfileData((prev) => ({
        ...prev,
        fullName: resData.fullName || editFullName.trim(),
        bio: editBio.trim(),
        avatar: updates.avatar,
      }));

      setIsEditModalOpen(false);
      addToast('Profile updated successfully!', 'success');
    } catch (err) {
      console.error('[ProfilePage] Profile update error:', err);
      addToast(err?.message || 'Failed to update profile', 'error');
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Handle Post Deletion Workflow
  const handleConfirmDeletePost = async () => {
    if (!postToDelete) return;
    setIsDeletingPost(true);
    const deleteTargetId = postToDelete.id || postToDelete.postId;
    try {
      await apiPostService.deletePost(deleteTargetId);
      // Remove from myPosts and decrement real count
      setMyPosts((prev) => prev.filter((p) => (p.id || p.postId) !== deleteTargetId));
      setStatsData((prev) => ({ ...prev, postsCount: Math.max(0, prev.postsCount - 1) }));
      setPostToDelete(null);
      setOpenMenuPostId(null);
      addToast('Post deleted successfully', 'success');
    } catch (err) {
      console.error('[ProfilePage] Delete post error:', err);
      addToast(err?.message || 'Failed to delete post. Please try again.', 'error');
    } finally {
      setIsDeletingPost(false);
    }
  };

  // Toggle Save / Bookmark
  const handleToggleSavePost = async (post) => {
    const targetId = post.id || post.postId;
    try {
      const isCurrentlySaved = savedPosts.some((p) => (p.id || p.postId) === targetId);
      if (isCurrentlySaved) {
        await apiPostService.unsavePost(targetId);
        setSavedPosts((prev) => prev.filter((p) => (p.id || p.postId) !== targetId));
        setStatsData((prev) => ({ ...prev, bookmarksCount: Math.max(0, prev.bookmarksCount - 1) }));
        addToast('Post removed from bookmarks', 'info');
      } else {
        await apiPostService.savePost(targetId);
        setSavedPosts((prev) => [{ ...post, isSaved: true }, ...prev]);
        setStatsData((prev) => ({ ...prev, bookmarksCount: prev.bookmarksCount + 1 }));
        addToast('Post saved to bookmarks!', 'success');
      }
    } catch (err) {
      addToast('Bookmark action failed', 'error');
    }
  };

  // Toggle Like Post
  const handleToggleLikePost = async (post) => {
    const targetId = post.id || post.postId;
    try {
      const isLiked = post.isLikedByCurrentUser || likedPosts.some((p) => (p.id || p.postId) === targetId);
      if (isLiked) {
        await apiPostService.unlikePost(targetId);
        setLikedPosts((prev) => prev.filter((p) => (p.id || p.postId) !== targetId));
        setMyPosts((prev) =>
          prev.map((p) => ((p.id || p.postId) === targetId ? { ...p, isLikedByCurrentUser: false, likeCount: Math.max(0, (p.likeCount || 0) - 1) } : p))
        );
        setStatsData((prev) => ({ ...prev, likesCount: Math.max(0, prev.likesCount - 1) }));
        addToast('Post removed from Liked', 'info');
      } else {
        await apiPostService.likePost(targetId);
        setLikedPosts((prev) => [{ ...post, isLikedByCurrentUser: true }, ...prev]);
        setMyPosts((prev) =>
          prev.map((p) => ((p.id || p.postId) === targetId ? { ...p, isLikedByCurrentUser: true, likeCount: (p.likeCount || 0) + 1 } : p))
        );
        setStatsData((prev) => ({ ...prev, likesCount: prev.likesCount + 1 }));
        addToast('Post added to Liked!', 'success');
      }
    } catch {
      addToast('Like action failed', 'error');
    }
  };

  // Real authenticated statistics computation (Zero synthetic multipliers or fake fallbacks)
  const stats = useMemo(() => {
    const formatCount = (num) => {
      if (num === null || num === undefined) return '0';
      if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
      return String(num);
    };

    return {
      postsCount: formatCount(statsData.postsCount),
      commentsCount: formatCount(statsData.commentsCount),
      likesCount: formatCount(statsData.likesCount),
      bookmarksCount: formatCount(statsData.bookmarksCount),
    };
  }, [statsData]);

  // User identity details
  const displayName = currentUser?.fullName || currentUser?.name || 'Aarav';
  const handle = `@${(profileData?.username || currentUser?.username || 'aarav').replace(/^@/, '')}`;
  const rawBio = profileData?.bio || currentUser?.bio || 'Just a person who believes in better conversations, kinder people and a more open world. Here to listen, share and grow. ❤️';
  const bio = (rawBio || '').replace(/\?\?+$/, '❤️');

  // Resolve user avatar image URL
  const rawAvatar = profileData?.avatar || currentUser?.avatar || currentUser?.avatarUrl;
  const resolvedAvatar = (rawAvatar && !rawAvatar.startsWith('#'))
    ? getMediaUrl(rawAvatar)
    : sidebarSunsetCity;

  // Format relative timestamp
  const formatTimeAgo = (dateStr) => {
    if (!dateStr) return 'recently';
    try {
      const diffMs = Date.now() - new Date(dateStr).getTime();
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      if (diffHours < 1) return 'just now';
      if (diffHours < 24) return `${diffHours} hours ago`;
      const diffDays = Math.floor(diffHours / 24);
      if (diffDays === 1) return 'yesterday';
      if (diffDays < 7) return `${diffDays} days ago`;
      const diffWeeks = Math.floor(diffDays / 7);
      return `${diffWeeks} ${diffWeeks === 1 ? 'week' : 'weeks'} ago`;
    } catch {
      return 'recently';
    }
  };

  return (
    <UserLayout activeRoute="/profile" onNavigate={onNavigate} wide={true}>
      <div className="profile-page-grid">
        {/* ── LEFT / CENTER STREAM ── */}
        <section className="profile-center-stream" aria-label="Profile and Activity Stream">
          {/* 1. Profile Hero Card */}
          <div className="profile-hero-card">
            {/* Cinematic Sunset Banner */}
            <div className="profile-cover-wrap">
              <img
                src={heroProfileBanner}
                alt="Profile cover banner"
                className="profile-cover-img"
              />
              <div className="profile-cover-overlay" />

              {/* Decorative flourish text in upper-right of banner */}
              <div className="profile-cover-flourish">
                <div className="profile-flourish-glow" />
                <div className="profile-flourish-content">
                  <span>Your</span>
                  <span>Thoughts</span>
                  <span>Matter</span>
                  <span>Here <span className="profile-flourish-heart">♡</span></span>
                </div>
              </div>

              {/* Elegant Curved Shoulder SVG Transition at bottom of banner */}
              <div className="profile-cover-curve-svg-wrap">
                <svg
                  viewBox="0 0 1000 48"
                  preserveAspectRatio="none"
                  className="profile-cover-curve-svg"
                  aria-hidden="true"
                >
                  <path
                    d="M 0,48 L 0,0 L 530,0 C 565,0 585,46 625,46 L 1000,46 L 1000,48 Z"
                    fill="#FFFFFF"
                  />
                </svg>
              </div>
            </div>

            {/* Overlapping Circular Avatar */}
            <div className="profile-avatar-container">
              <img
                src={resolvedAvatar}
                alt={displayName}
                className="profile-avatar-img"
                onError={(e) => {
                  e.currentTarget.src = sidebarSunsetCity;
                }}
              />
              <button
                type="button"
                className="profile-camera-badge-btn"
                title="Change profile picture"
                aria-label="Upload profile photo"
                onClick={() => fileInputRef.current?.click()}
              >
                <Camera size={15} strokeWidth={2.4} />
              </button>
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                accept="image/png,image/jpeg,image/webp"
                onChange={handleAvatarFileChange}
              />
            </div>

            {/* White Lower Profile Panel */}
            <div className="profile-hero-lower">
              {/* Left: User Identity Info */}
              <div className="profile-identity-info">
                <div className="profile-name-row">
                  <h1 className="profile-display-name">{displayName}</h1>
                  <button
                    type="button"
                    className="profile-edit-btn"
                    onClick={() => setIsEditModalOpen(true)}
                  >
                    <Edit3 size={13} strokeWidth={2.2} />
                    <span>Edit Profile</span>
                  </button>
                </div>
                <span className="profile-handle">{handle}</span>
                <p className="profile-bio-text">{bio}</p>
              </div>

              {/* Right: Four Compact Statistics Grouped Horizontally */}
              <div className="profile-stats-card">
                <div className="profile-stat-col">
                  <FileText size={18} strokeWidth={2.2} style={{ color: '#E11D48' }} />
                  <span className="profile-stat-value">{stats.postsCount}</span>
                  <span className="profile-stat-label">Posts</span>
                </div>

                <div className="profile-stat-col">
                  <MessageSquare size={18} strokeWidth={2.2} style={{ color: '#475569' }} />
                  <span className="profile-stat-value">{stats.commentsCount}</span>
                  <span className="profile-stat-label">Comments</span>
                </div>

                <div className="profile-stat-col">
                  <Heart size={18} strokeWidth={2.2} style={{ color: '#E11D48' }} />
                  <span className="profile-stat-value">{stats.likesCount}</span>
                  <span className="profile-stat-label">Likes</span>
                </div>

                <div className="profile-stat-col">
                  <Bookmark size={18} strokeWidth={2.2} style={{ color: '#475569' }} />
                  <span className="profile-stat-value">{stats.bookmarksCount}</span>
                  <span className="profile-stat-label">Bookmarks</span>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Five Activity Tabs */}
          <nav className="profile-tabs-bar" aria-label="Profile Activity Tabs">
            <button
              type="button"
              className={`profile-tab-button ${activeTab === 'posts' ? 'active' : ''}`}
              onClick={() => setActiveTab('posts')}
            >
              <FileText size={15} strokeWidth={2.2} />
              <span>Posts</span>
            </button>
            <button
              type="button"
              className={`profile-tab-button ${activeTab === 'comments' ? 'active' : ''}`}
              onClick={() => setActiveTab('comments')}
            >
              <MessageSquare size={15} strokeWidth={2.2} />
              <span>Comments</span>
            </button>
            <button
              type="button"
              className={`profile-tab-button ${activeTab === 'liked' ? 'active' : ''}`}
              onClick={() => setActiveTab('liked')}
            >
              <Heart size={15} strokeWidth={2.2} />
              <span>Liked</span>
            </button>
            <button
              type="button"
              className={`profile-tab-button ${activeTab === 'topics' ? 'active' : ''}`}
              onClick={() => setActiveTab('topics')}
            >
              <Hash size={15} strokeWidth={2.2} />
              <span>My Topics</span>
            </button>
            <button
              type="button"
              className={`profile-tab-button ${activeTab === 'bookmarks' ? 'active' : ''}`}
              onClick={() => setActiveTab('bookmarks')}
            >
              <Bookmark size={15} strokeWidth={2.2} />
              <span>Bookmarks</span>
            </button>
          </nav>

          {/* 3. Stream Content Area */}
          {activeTab === 'posts' && (
            <div className="profile-posts-list">
              {loading ? (
                <div className="profile-empty-state-box">
                  <Loader2 size={30} className="spin-animation" style={{ color: '#E11D48' }} />
                </div>
              ) : myPosts.length === 0 ? (
                <div className="profile-empty-state-box">
                  <FileText size={32} strokeWidth={2} style={{ color: '#94A3B8' }} />
                  <h3 className="profile-empty-title">You haven't shared any posts yet.</h3>
                  <p className="profile-empty-desc">
                    Express your genuine thoughts anonymously and connect with compassionate people.
                  </p>
                  <button
                    type="button"
                    className="profile-modal-submit-btn"
                    onClick={() => onNavigate('/create-post')}
                  >
                    Create Post
                  </button>
                </div>
              ) : (
                myPosts.map((post, idx) => {
                  const resolvedPostId = post.id || post.postId || `post-${idx}`;
                  const isSaved = savedPosts.some((p) => (p.id || p.postId) === resolvedPostId);
                  const isLiked = post.isLikedByCurrentUser || likedPosts.some((p) => (p.id || p.postId) === resolvedPostId);
                  const hasImage = Boolean(post.imageUrl);
                  const postImage = hasImage ? getMediaUrl(post.imageUrl) : null;
                  const topicTag = post.topic ? `#${post.topic.replace(/_/g, '')}` : '#Community';
                  const isMenuOpen = Boolean(openMenuPostId) && openMenuPostId === resolvedPostId;

                  return (
                    <article key={resolvedPostId} className="profile-post-card">
                      {/* Post Header */}
                      <div className="profile-post-header">
                        <div className="profile-post-author-wrap">
                          <img
                            src={resolvedAvatar}
                            alt={displayName}
                            className="profile-post-avatar-thumb"
                          />
                          <div className="profile-post-author-meta">
                            <span className="profile-post-author-name">{displayName}</span>
                            <span className="profile-post-author-handle">{handle}</span>
                            <span className="profile-post-bullet">·</span>
                            <span className="profile-post-time">{formatTimeAgo(post.createdAt)}</span>
                          </div>
                        </div>

                        {/* Three-Dot Menu */}
                        <div className="profile-post-dots-menu-wrap">
                          <button
                            type="button"
                            className="profile-post-dots-btn"
                            aria-label="Post options"
                            onClick={() => setOpenMenuPostId(isMenuOpen ? null : resolvedPostId)}
                          >
                            <MoreHorizontal size={18} />
                          </button>

                          {isMenuOpen && (
                            <div className="profile-post-dropdown-menu">
                              <button
                                type="button"
                                className="profile-post-dropdown-item"
                                onClick={() => {
                                  setOpenMenuPostId(null);
                                  onNavigate(`/topic/${post.topic || 'GENERAL'}/discussion/${resolvedPostId}`);
                                }}
                              >
                                <ExternalLink size={14} />
                                <span>View Post</span>
                              </button>
                              <button
                                type="button"
                                className="profile-post-dropdown-item danger"
                                onClick={() => {
                                  setOpenMenuPostId(null);
                                  setPostToDelete({ ...post, id: resolvedPostId });
                                }}
                              >
                                <Trash2 size={14} />
                                <span>Delete Post</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Post Body Row */}
                      <div className="profile-post-body-row">
                        <div className="profile-post-text-side">
                          <span className="profile-post-topic-tag">{topicTag}</span>
                          <p className="profile-post-text-content">
                            {post.content || post.originalContent || post.title || 'Shared a thought with the community.'}
                          </p>

                          {/* Footer Actions */}
                          <div className="profile-post-footer">
                            <button
                              type="button"
                              className={`profile-post-action-btn ${isLiked ? 'liked' : ''}`}
                              onClick={() => handleToggleLikePost(post)}
                            >
                              <Heart size={15} fill={isLiked ? '#E11D48' : 'none'} color={isLiked ? '#E11D48' : 'currentColor'} />
                              <span>{post.likeCount || 0}</span>
                            </button>

                            <button
                              type="button"
                              className="profile-post-action-btn"
                              onClick={() => onNavigate(`/topic/${post.topic || 'GENERAL'}/discussion/${resolvedPostId}`)}
                            >
                              <MessageSquare size={15} />
                              <span>{post.commentCount || 0}</span>
                            </button>

                            <button
                              type="button"
                              className={`profile-post-action-btn ${isSaved ? 'saved' : ''}`}
                              onClick={() => handleToggleSavePost(post)}
                            >
                              <Bookmark size={15} fill={isSaved ? '#0284C7' : 'none'} color={isSaved ? '#0284C7' : 'currentColor'} />
                              <span>{isSaved ? 'Saved' : 'Save'}</span>
                            </button>
                          </div>
                        </div>

                        {/* Optional Right-Aligned Post Thumbnail */}
                        {hasImage && !failedImages[resolvedPostId] && (
                          <div className="profile-post-image-side">
                            <img
                              src={postImage}
                              alt="Post media attachment"
                              className="profile-post-thumb-img"
                              loading="lazy"
                              onError={() => {
                                setFailedImages((prev) => ({ ...prev, [resolvedPostId]: true }));
                              }}
                            />
                          </div>
                        )}
                      </div>
                    </article>
                  );
                })
              )}
            </div>
          )}

          {activeTab === 'comments' && (
            <div className="profile-posts-list">
              {loading ? (
                <div className="profile-empty-state-box">
                  <Loader2 size={30} className="spin-animation" style={{ color: '#E11D48' }} />
                </div>
              ) : myComments.length === 0 ? (
                <div className="profile-empty-state-box">
                  <MessageSquare size={32} strokeWidth={2} style={{ color: '#94A3B8' }} />
                  <h3 className="profile-empty-title">You haven't written any comments yet.</h3>
                  <p className="profile-empty-desc">
                    Join active topic communities and express your perspectives freely.
                  </p>
                  <button
                    type="button"
                    className="profile-modal-submit-btn"
                    onClick={() => onNavigate('/explore')}
                  >
                    Explore Discussions
                  </button>
                </div>
              ) : (
                myComments.map((comment, idx) => {
                  const resolvedCommentId = comment.id || `comment-${idx}`;
                  const parentPostId = comment.postId;
                  const topicSlug = comment.topic || 'GENERAL';
                  const isReply = comment.isReply || Boolean(comment.parentCommentId);
                  const discussionUrl = parentPostId 
                    ? `/topic/${topicSlug}/discussion/${parentPostId}`
                    : (comment.topicId ? `/topic/${comment.topicId}` : '/explore');

                  return (
                    <article key={resolvedCommentId} className="profile-post-card">
                      <div className="profile-post-header">
                        <div className="profile-post-author-wrap">
                          <img
                            src={resolvedAvatar}
                            alt={displayName}
                            className="profile-post-avatar-thumb"
                          />
                          <div className="profile-post-author-meta">
                            <span className="profile-post-author-name">{displayName}</span>
                            <span className="profile-post-author-handle">{handle}</span>
                            <span className="profile-post-bullet">·</span>
                            <span className="profile-post-time">{formatTimeAgo(comment.createdAt)}</span>
                          </div>
                        </div>
                        <span className="profile-post-topic-tag" style={{ background: isReply ? '#F0FDF4' : '#FFF1F2', color: isReply ? '#16A34A' : '#E11D48' }}>
                          {isReply ? 'Reply' : 'Comment'}
                        </span>
                      </div>

                      <div className="profile-post-body-row">
                        <div className="profile-post-text-side">
                          {comment.postTitle && (
                            <p style={{ margin: '0 0 6px', fontSize: 13, color: '#64748B', fontWeight: 500 }}>
                              On: <span style={{ color: '#0F172A', fontWeight: 600 }}>{comment.postTitle}</span>
                            </p>
                          )}
                          <p className="profile-post-text-content">
                            {comment.originalContent || comment.translatedContent || 'Comment text'}
                          </p>

                          <div className="profile-post-footer" style={{ marginTop: 10 }}>
                            <div className="profile-post-action-btn" style={{ cursor: 'default' }}>
                              <Heart size={14} fill="#FFE4E6" color="#E11D48" />
                              <span>{comment.likeCount || 0}</span>
                            </div>

                            <button
                              type="button"
                              className="profile-panel-action-btn"
                              onClick={() => onNavigate(discussionUrl)}
                            >
                              <span>View Discussion</span>
                              <ArrowRight size={13} />
                            </button>
                          </div>
                        </div>

                        {comment.imageUrl && (
                          <div className="profile-post-image-side">
                            <img
                              src={getMediaUrl(comment.imageUrl)}
                              alt="Comment media attachment"
                              className="profile-post-thumb-img"
                              loading="lazy"
                            />
                          </div>
                        )}
                      </div>
                    </article>
                  );
                })
              )}
            </div>
          )}

          {activeTab === 'liked' && (
            <div className="profile-posts-list">
              {likedPosts.length === 0 ? (
                <div className="profile-empty-state-box">
                  <Heart size={32} strokeWidth={2} style={{ color: '#94A3B8' }} />
                  <h3 className="profile-empty-title">No liked posts yet.</h3>
                  <p className="profile-empty-desc">
                    Posts you like or react to will appear here so you can revisit them anytime.
                  </p>
                  <button
                    type="button"
                    className="profile-modal-submit-btn"
                    onClick={() => onNavigate('/explore')}
                  >
                    Browse Feed
                  </button>
                </div>
              ) : (
                likedPosts.map((post, idx) => (
                  <article key={post.id ? `liked-${post.id}` : `liked-idx-${idx}`} className="profile-post-card">
                    <div className="profile-post-header">
                      <span className="profile-post-topic-tag">#{post.topic || 'General'}</span>
                      <span className="profile-post-time">{formatTimeAgo(post.createdAt)}</span>
                    </div>
                    <p className="profile-post-text-content">
                      {post.content || post.originalContent || 'Post content'}
                    </p>
                    <div className="profile-post-footer">
                      <button
                        type="button"
                        className="profile-post-action-btn liked"
                        onClick={() => handleToggleLikePost(post)}
                      >
                        <Heart size={15} fill="#E11D48" color="#E11D48" />
                        <span>Liked</span>
                      </button>
                      <button
                        type="button"
                        className="profile-panel-action-btn"
                        onClick={() => onNavigate(`/topic/${post.topic || 'GENERAL'}/discussion/${post.id}`)}
                      >
                        <span>View Discussion</span>
                        <ArrowRight size={13} />
                      </button>
                    </div>
                  </article>
                ))
              )}
            </div>
          )}

          {activeTab === 'topics' && (
            <div className="profile-posts-list">
              {myTopics.length === 0 ? (
                <div className="profile-empty-state-box">
                  <Hash size={32} strokeWidth={2} style={{ color: '#94A3B8' }} />
                  <h3 className="profile-empty-title">You haven't created any topics yet.</h3>
                  <p className="profile-empty-desc">
                    Build a community around your favorite themes, reflections, and passions.
                  </p>
                  <button
                    type="button"
                    className="profile-modal-submit-btn"
                    onClick={() => onNavigate('/my-posts')}
                  >
                    Go to My Topics
                  </button>
                </div>
              ) : (
                myTopics.map((topic, idx) => {
                  const title = formatTopicTitle(topic);
                  const cover = resolveTopicCover(topic);
                  const category = getCategoryLabel(topic);
                  return (
                    <article key={topic.id ? `topic-${topic.id}` : `topic-idx-${idx}`} className="profile-post-card" style={{ cursor: 'pointer' }} onClick={() => onNavigate(`/topic/${topic.id}`)}>
                      <div className="profile-post-body-row">
                        <div className="profile-post-text-side">
                          <span className="profile-post-topic-tag">{category}</span>
                          <h4 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#0F172A' }}>{title}</h4>
                          <p style={{ margin: 0, fontSize: 13, color: '#64748B' }}>
                            {topic.commentCount || topic.post_count || 0} discussions in this community
                          </p>
                        </div>
                        <div className="profile-post-image-side">
                          <img src={cover} alt={title} className="profile-post-thumb-img" />
                        </div>
                      </div>
                    </article>
                  );
                })
              )}
            </div>
          )}

          {activeTab === 'bookmarks' && (
            <div className="profile-posts-list">
              {savedPosts.length === 0 ? (
                <div className="profile-empty-state-box">
                  <Bookmark size={32} strokeWidth={2} style={{ color: '#94A3B8' }} />
                  <h3 className="profile-empty-title">No saved posts yet.</h3>
                  <p className="profile-empty-desc">
                    Bookmark heartfelt thoughts to keep them safe and return whenever you wish.
                  </p>
                  <button
                    type="button"
                    className="profile-modal-submit-btn"
                    onClick={() => onNavigate('/explore')}
                  >
                    Explore Posts
                  </button>
                </div>
              ) : (
                savedPosts.map((post, idx) => (
                  <article key={post.id ? `saved-${post.id}` : `saved-idx-${idx}`} className="profile-post-card">
                    <div className="profile-post-header">
                      <span className="profile-post-topic-tag">#{post.topic || 'General'}</span>
                      <span className="profile-post-time">{formatTimeAgo(post.createdAt)}</span>
                    </div>
                    <p className="profile-post-text-content">
                      {post.content || post.originalContent || 'Saved thought'}
                    </p>
                    <div className="profile-post-footer">
                      <button
                        type="button"
                        className="profile-post-action-btn saved"
                        onClick={() => handleToggleSavePost(post)}
                      >
                        <Bookmark size={15} fill="#0284C7" color="#0284C7" />
                        <span>Saved</span>
                      </button>
                      <button
                        type="button"
                        className="profile-panel-action-btn"
                        onClick={() => onNavigate(`/topic/${post.topic || 'GENERAL'}/discussion/${post.id}`)}
                      >
                        <span>View Discussion</span>
                        <ArrowRight size={13} />
                      </button>
                    </div>
                  </article>
                ))
              )}
            </div>
          )}
        </section>

        {/* ── RIGHT SIDEBAR ── */}
        <aside className="profile-right-sidebar" aria-label="Profile Details and Shortcuts">
          {/* Panel 1: About Me */}
          <section className="profile-panel-card">
            <div className="profile-panel-header">
              <div className="profile-panel-header-left">
                <UserIcon size={17} style={{ color: '#E11D48' }} />
                <h3 className="profile-panel-title">About Me</h3>
              </div>
              <button
                type="button"
                className="profile-panel-action-btn"
                onClick={() => setIsEditModalOpen(true)}
              >
                <Edit3 size={13} />
                <span>Edit</span>
              </button>
            </div>
            <p className="profile-panel-bio-content">{bio}</p>
          </section>

          {/* Panel 2: My Top Topics */}
          <section className="profile-panel-card">
            <div className="profile-panel-header">
              <div className="profile-panel-header-left">
                <Star size={17} style={{ color: '#E11D48' }} />
                <h3 className="profile-panel-title">My Top Topics</h3>
              </div>
              <button
                type="button"
                className="profile-panel-action-btn"
                onClick={() => onNavigate('/my-topics')}
              >
                <span>View all</span>
                <ArrowRight size={13} />
              </button>
            </div>

            {topTopics && topTopics.length > 0 ? (
              <div className="profile-top-topics-grid">
                {topTopics.map((topic, idx) => {
                  const presets = [
                    { bg: '#FFF1F2', color: '#E11D48', defaultIcon: '🌱' },
                    { bg: '#F0FDF4', color: '#16A34A', defaultIcon: '🌿' },
                    { bg: '#FFFBEB', color: '#D97706', defaultIcon: '☀️' },
                  ];
                  const preset = presets[idx % presets.length];
                  return (
                    <div
                      key={topic.name || idx}
                      className="profile-top-topic-item"
                      onClick={() => onNavigate(topic.targetUrl || `/topic/${topic.slug || topic.name?.toLowerCase()}`)}
                      title={`View ${topic.label || topic.name} discussions`}
                    >
                      <div className="profile-top-topic-icon-wrap" style={{ background: preset.bg, color: preset.color }}>
                        <span>{topic.icon || preset.defaultIcon}</span>
                      </div>
                      <h4 className="profile-top-topic-title">{topic.label || topic.name}</h4>
                      <p className="profile-top-topic-posts">{topic.postCount} {topic.postCount === 1 ? 'post' : 'posts'}</p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="profile-panel-empty-state">
                <p>No published topics yet</p>
              </div>
            )}
          </section>

          {/* Panel 3: Recent Activity */}
          <section className="profile-panel-card">
            <div className="profile-panel-header">
              <div className="profile-panel-header-left">
                <Clock size={17} style={{ color: '#E11D48' }} />
                <h3 className="profile-panel-title">Recent Activity</h3>
              </div>
              <button
                type="button"
                className="profile-panel-action-btn"
                onClick={() => setActiveTab('posts')}
              >
                <span>View all</span>
                <ArrowRight size={13} />
              </button>
            </div>

            {recentActivities && recentActivities.length > 0 ? (
              <div className="profile-recent-activity-list">
                {recentActivities.map((act, idx) => {
                  const getIconAndStyle = () => {
                    switch (act.type) {
                      case 'COMMENT':
                        return { icon: <MessageSquare size={15} />, bg: '#FFF1F2', color: '#E11D48' };
                      case 'LIKE':
                        return { icon: <Heart size={15} fill="#E11D48" />, bg: '#FFE4E6', color: '#E11D48' };
                      case 'BOOKMARK':
                        return { icon: <Bookmark size={15} />, bg: '#E0F2FE', color: '#0284C7' };
                      case 'POST':
                      default:
                        return { icon: <Sparkles size={15} />, bg: '#DCFCE7', color: '#16A34A' };
                    }
                  };
                  const { icon, bg, color } = getIconAndStyle();
                  return (
                    <div
                      key={act.id || idx}
                      className="profile-activity-item"
                      onClick={() => {
                        if (act.type === 'COMMENT') setActiveTab('comments');
                        else if (act.type === 'LIKE') setActiveTab('liked');
                        else if (act.type === 'BOOKMARK') setActiveTab('bookmarks');
                        else setActiveTab('posts');
                      }}
                      title="Click to view activity"
                    >
                      <div className="profile-activity-icon-wrap" style={{ background: bg, color }}>
                        {icon}
                      </div>
                      <div className="profile-activity-details">
                        <h4 className="profile-activity-action-title">{act.actionTitle}</h4>
                        <p className="profile-activity-quote">{act.snippet ? `"${act.snippet}"` : 'No details'}</p>
                      </div>
                      <span className="profile-activity-time">{formatTimeAgo(act.timestamp)}</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="profile-panel-empty-state">
                <p>No recent activity yet</p>
              </div>
            )}
          </section>
        </aside>
      </div>

      {/* ── EDIT PROFILE MODAL ── */}
      {isEditModalOpen && (
        <div className="profile-modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget) setIsEditModalOpen(false); }}>
          <div className="profile-modal-card" role="dialog" aria-modal="true" aria-labelledby="edit-profile-title">
            <div className="profile-modal-header">
              <h2 id="edit-profile-title" className="profile-modal-title">Edit Profile</h2>
              <button
                type="button"
                className="profile-modal-close-btn"
                onClick={() => setIsEditModalOpen(false)}
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="profile-modal-field">
                <label className="profile-modal-label">Display Name</label>
                <input
                  type="text"
                  className="profile-modal-input"
                  value={editFullName}
                  onChange={(e) => setEditFullName(e.target.value)}
                  placeholder="Your display name"
                  maxLength={50}
                  required
                />
              </div>

              <div className="profile-modal-field">
                <label className="profile-modal-label">Bio (max 200 characters)</label>
                <textarea
                  className="profile-modal-textarea"
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  placeholder="Write a few words about yourself..."
                  maxLength={200}
                />
                <span style={{ fontSize: 12, color: '#94A3B8', textAlign: 'right' }}>
                  {editBio.length}/200
                </span>
              </div>

              <div className="profile-modal-actions">
                <button
                  type="button"
                  className="profile-modal-cancel-btn"
                  onClick={() => setIsEditModalOpen(false)}
                  disabled={isSavingProfile}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="profile-modal-submit-btn"
                  disabled={isSavingProfile}
                >
                  {isSavingProfile ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── DELETE POST CONFIRMATION DIALOG ── */}
      {postToDelete && (
        <div className="profile-modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget) setPostToDelete(null); }}>
          <div className="profile-modal-card" role="dialog" aria-modal="true" aria-labelledby="delete-post-title">
            <div className="profile-modal-header">
              <h2 id="delete-post-title" className="profile-modal-title" style={{ color: '#DC2626' }}>Delete Post?</h2>
              <button
                type="button"
                className="profile-modal-close-btn"
                onClick={() => setPostToDelete(null)}
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <p style={{ margin: '4px 0 16px', fontSize: 14, color: '#475569', lineHeight: 1.5 }}>
              Are you sure you want to permanently delete this post? This action cannot be undone.
            </p>

            <div className="profile-modal-actions">
              <button
                type="button"
                className="profile-modal-cancel-btn"
                onClick={() => setPostToDelete(null)}
                disabled={isDeletingPost}
              >
                Cancel
              </button>
              <button
                type="button"
                className="profile-modal-submit-btn danger"
                onClick={handleConfirmDeletePost}
                disabled={isDeletingPost}
              >
                {isDeletingPost ? 'Deleting...' : 'Delete Post'}
              </button>
            </div>
          </div>
        </div>
      )}
    </UserLayout>
  );
}

export default ProfilePage;
