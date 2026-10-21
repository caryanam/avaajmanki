import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, MoreVertical, Check, Copy, Share2, Shield, Flag } from 'lucide-react';
import { useToast } from '../../context/ToastContext.jsx';

export function TopicDiscussionHeader({
  topicName = 'Mental Health',
  topicIcon = '🌱',
  badgeBg = '#DCFCE7',
  discussionCount = '8.1K',
  topicId = 'MENTAL_HEALTH',
  onNavigate,
}) {
  const { addToast } = useToast();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isJoined, setIsJoined] = useState(false);
  const menuRef = useRef(null);

  // Load client-side topic membership state from localStorage
  useEffect(() => {
    try {
      const joinedList = JSON.parse(localStorage.getItem('mka_joined_topics') || '[]');
      setIsJoined(joinedList.includes(topicId) || joinedList.includes(topicName));
    } catch {
      setIsJoined(false);
    }
  }, [topicId, topicName]);

  // Close menu on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [menuOpen]);

  const handleToggleJoin = () => {
    try {
      const raw = localStorage.getItem('mka_joined_topics');
      let joinedList = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(joinedList)) joinedList = [];

      const identifier = topicId || topicName;
      if (isJoined) {
        joinedList = joinedList.filter((item) => item !== identifier && item !== topicName);
        localStorage.setItem('mka_joined_topics', JSON.stringify(joinedList));
        setIsJoined(false);
        addToast(`Left ${topicName} topic.`, 'info');
      } else {
        if (!joinedList.includes(identifier)) {
          joinedList.push(identifier);
        }
        localStorage.setItem('mka_joined_topics', JSON.stringify(joinedList));
        setIsJoined(true);
        addToast(`Joined ${topicName}! You'll see more discussions from this topic.`, 'success');
      }
    } catch (e) {
      setIsJoined(!isJoined);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard?.writeText?.(window.location.href);
    addToast('Topic link copied to clipboard!', 'success');
    setMenuOpen(false);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${topicName} Discussions - AwaajManKi`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      handleCopyLink();
    }
    setMenuOpen(false);
  };

  return (
    <div className="topic-discussion-header-card">
      {/* Left: Back Arrow + Square Icon Badge + Topic Name & Discussion Count */}
      <div className="topic-header-left">
        <button
          type="button"
          className="topic-header-back-btn"
          onClick={() => {
            if (window.history.length > 1) {
              window.history.back();
            } else if (onNavigate) {
              onNavigate('/explore');
            } else {
              window.location.href = '/explore';
            }
          }}
          aria-label="Go back"
        >
          <ArrowLeft size={16} />
        </button>

        <div
          className="topic-header-icon-badge"
          style={{ backgroundColor: badgeBg }}
          aria-hidden="true"
        >
          {topicIcon}
        </div>

        <div className="topic-header-info">
          <h1 className="topic-header-title">{topicName}</h1>
          <span className="topic-header-count">
            {discussionCount} {String(discussionCount).toLowerCase().includes('discussion') ? '' : 'discussions'}
          </span>
        </div>
      </div>

      {/* Right: Join Topic Button + Context Menu */}
      <div className="topic-header-actions" ref={menuRef}>
        <button
          type="button"
          className={`topic-header-join-btn ${isJoined ? 'joined' : ''}`}
          onClick={handleToggleJoin}
          aria-pressed={isJoined}
        >
          {isJoined ? (
            <>
              <Check size={14} className="join-check-icon" />
              <span>Joined</span>
            </>
          ) : (
            'Join Topic'
          )}
        </button>

        <div className="topic-header-menu-container">
          <button
            type="button"
            className="topic-header-menu-trigger"
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-label="More options"
            aria-expanded={menuOpen}
          >
            <MoreVertical size={18} />
          </button>

          {menuOpen && (
            <div className="topic-header-dropdown-menu">
              <button type="button" className="topic-dropdown-item" onClick={handleCopyLink}>
                <Copy size={14} />
                <span>Copy Link</span>
              </button>
              <button type="button" className="topic-dropdown-item" onClick={handleShare}>
                <Share2 size={14} />
                <span>Share Topic</span>
              </button>
              <button
                type="button"
                className="topic-dropdown-item"
                onClick={() => {
                  setMenuOpen(false);
                  addToast('Please follow our Community Guidelines to keep conversations constructive and safe.', 'info');
                }}
              >
                <Shield size={14} />
                <span>Topic Guidelines</span>
              </button>
              <button
                type="button"
                className="topic-dropdown-item"
                onClick={() => {
                  setMenuOpen(false);
                  addToast('Topic reported to moderators for review.', 'info');
                }}
              >
                <Flag size={14} />
                <span>Report Topic</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
