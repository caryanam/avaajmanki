import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  Heart,
  Reply,
  AtSign,
  User,
  Megaphone,
  ChevronRight,
  MoreVertical,
  Check,
  Trash2,
} from 'lucide-react';
import { parseNotification, formatTimeAgo } from '../../utils/notificationHelpers.js';
import { resolveNotificationPath } from '../../utils/notificationNavigation.js';

export function NotificationItemRow({
  item,
  onNavigate,
  onMarkAsRead,
  onDelete,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const {
    category,
    title,
    snippet,
    tag,
    thumbnail,
    actionType,
  } = parseNotification(item);

  const timeAgo = formatTimeAgo(item.createdAt);
  const targetPath = resolveNotificationPath(item);

  // Close dropdown menu on outside click
  useEffect(() => {
    if (!menuOpen) return;
    const handleOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [menuOpen]);

  const handleCardClick = () => {
    if (!item.isRead && onMarkAsRead) {
      onMarkAsRead(item.id);
    }
    if (targetPath && onNavigate) {
      onNavigate(targetPath);
    }
  };

  const handleActionClick = (e) => {
    e.stopPropagation();
    if (!item.isRead && onMarkAsRead) {
      onMarkAsRead(item.id);
    }
    if (actionType === 'follow') {
      // Toggle follow or navigate
      if (onNavigate) onNavigate(targetPath || `/profile/${(item.actorUsername || 'user').replace('@', '')}`);
    } else if (targetPath && onNavigate) {
      onNavigate(targetPath);
    }
  };

  // Render icon based on category
  const renderCategoryIcon = () => {
    switch (category) {
      case 'comments':
        return <MessageSquare size={19} strokeWidth={2.2} />;
      case 'replies':
        return <Reply size={19} strokeWidth={2.2} />;
      case 'likes':
        return <Heart size={19} strokeWidth={2.2} fill="currentColor" />;
      case 'mentions':
        return <AtSign size={19} strokeWidth={2.2} />;
      case 'follows':
        return <User size={19} strokeWidth={2.2} />;
      case 'system':
      default:
        return <Megaphone size={19} strokeWidth={2.2} />;
    }
  };

  return (
    <div
      className={`notif-card ${!item.isRead ? 'unread' : 'read'}`}
      onClick={handleCardClick}
      style={{ cursor: targetPath ? 'pointer' : 'default' }}
    >
      {/* 1. Unread dot indicator */}
      {!item.isRead ? (
        <span className="notif-unread-dot" title="Unread notification" />
      ) : (
        <span className="notif-unread-dot-placeholder" />
      )}

      {/* 2. Main content area */}
      <div className="notif-card-main">
        {/* Category Icon Circle */}
        <div className={`notif-type-icon-circle ${category}`} aria-hidden="true">
          {renderCategoryIcon()}
        </div>

        {/* Text Area */}
        <div className="notif-card-text">
          <div className="notif-card-header-line">
            <span className="notif-card-title">{title}</span>
            <span className="notif-card-time">{timeAgo}</span>
          </div>

          {snippet && <p className="notif-card-snippet">{snippet}</p>}

          {tag && <span className="notif-card-tag">{tag}</span>}
        </div>
      </div>

      {/* 3. Right actions area */}
      <div className="notif-card-actions" onClick={(e) => e.stopPropagation()}>
        {thumbnail && (
          <img
            src={thumbnail}
            alt=""
            className="notif-card-thumb"
            loading="lazy"
            aria-hidden="true"
          />
        )}

        {actionType === 'follow' ? (
          <button
            type="button"
            className="notif-btn-follow"
            onClick={handleActionClick}
          >
            Follow Back
          </button>
        ) : actionType === 'arrow' ? (
          <button
            type="button"
            className="notif-btn-arrow"
            onClick={handleActionClick}
            aria-label="View topic details"
          >
            <ChevronRight size={18} />
          </button>
        ) : (
          <button
            type="button"
            className="notif-btn-view"
            onClick={handleActionClick}
          >
            View
          </button>
        )}

        {/* 3-dots more menu */}
        <div style={{ position: 'relative' }} ref={menuRef}>
          <button
            type="button"
            className="notif-btn-menu"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="More notification options"
          >
            <MoreVertical size={16} />
          </button>

          {menuOpen && (
            <div className="notif-menu-dropdown animate-fade-in">
              {!item.isRead && (
                <button
                  type="button"
                  className="notif-menu-item"
                  onClick={() => {
                    onMarkAsRead(item.id);
                    setMenuOpen(false);
                  }}
                >
                  <Check size={14} />
                  <span>Mark as read</span>
                </button>
              )}
              <button
                type="button"
                className="notif-menu-item danger"
                onClick={() => {
                  onDelete(item.id);
                  setMenuOpen(false);
                }}
              >
                <Trash2 size={14} />
                <span>Delete</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
