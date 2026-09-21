import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { apiNotificationService } from '../services/apiNotificationService.js';
import { mapNotification } from '../services/apiMappers.js';
import { useAuth } from './AuthContext.jsx';
import { useToast } from './ToastContext.jsx';
import { playNotificationSound } from '../utils/soundUtil.js';

import { io } from 'socket.io-client';
import { SOCKET_URL } from '../config/env.js';

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const { currentUser } = useAuth();
  const { addToast } = useToast();

  const getUserNotifPrefs = useCallback(() => {
    const userId = currentUser?.id || currentUser?.username || 'guest';
    const raw = localStorage.getItem(`user_notif_prefs_${userId}`);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch (e) {}
    }
    return { chatMessages: true, postLikes: true, comments: true, systemAlerts: true, soundAlerts: true };
  }, [currentUser]);

  const seenNotifIdsRef = React.useRef(new Set());
  const isInitialLoadRef = React.useRef(true);
  const socketConnectedRef = React.useRef(false);
  const requestRef = React.useRef(null);
  const userIdRef = React.useRef(currentUser?.id);
  userIdRef.current = currentUser?.id;

  const refreshNotifications = useCallback(async () => {
    if (!currentUser) { setNotifications([]); return; }
    if (requestRef.current === currentUser.id) return;
    const requestUserId = currentUser.id;
    requestRef.current = requestUserId;
    try {
      const response = await apiNotificationService.getNotifications();
      if (userIdRef.current !== requestUserId) return;
      const fetched = (response.data?.content || []).map(mapNotification);

      // EXCLUDE chat messages/requests from the Bell Icon section
      // Only Post actions (Comments, Likes, Reactions) & System Warnings belong in Bell section
      const postAndSystemNotifs = fetched.filter(n => {
        const type = (n.type || '').toUpperCase();
        return !type.includes('CHAT') && !type.includes('MESSAGE');
      });

      if (isInitialLoadRef.current) {
        // On initial page load/refresh, seed all notification IDs into seen set WITHOUT popping toasts!
        postAndSystemNotifs.forEach((n) => seenNotifIdsRef.current.add(String(n.id)));
        isInitialLoadRef.current = false;
      } else {
        // Subsequent polling: trigger toast ONLY once for new unread notifications that arrive after page load
        postAndSystemNotifs.forEach((n) => {
          const nId = String(n.id);
          if (!seenNotifIdsRef.current.has(nId) && !n.isRead) {
            seenNotifIdsRef.current.add(nId);

            const type = (n.type || '').toUpperCase();
            const sender = n.actorUsername || n.senderUsername || 'Someone';
            const cleanSender = sender.startsWith('@') ? sender : `@${sender}`;

            let toastMsg = '';
            if (type.includes('REPLY')) {
              toastMsg = `Your comment got a reply from ${cleanSender}`;
            } else if (type.includes('COMMENT')) {
              toastMsg = `Your post got a comment from ${cleanSender}`;
            } else if (type.includes('LIKE') || type.includes('RELATE') || type.includes('REACTION')) {
              toastMsg = `Your post got a reaction from ${cleanSender}`;
            } else {
              toastMsg = n.message || n.title || 'You have a new notification';
            }

            // Trigger UI Toast notification WITHOUT sound (silent)
            addToast(toastMsg, 'info', 4000);
          } else {
            seenNotifIdsRef.current.add(nId);
          }
        });
      }

      setNotifications(postAndSystemNotifs);
    } catch (err) {
      // Preserve the last successful result during a temporary outage.
    } finally {
      if (requestRef.current === requestUserId) requestRef.current = null;
    }
  }, [currentUser, addToast]);


  // Socket events keep the list fresh; polling is only a visible-tab fallback.
  useEffect(() => {
    seenNotifIdsRef.current.clear();
    isInitialLoadRef.current = true;
    setNotifications([]);
    refreshNotifications();
    if (!currentUser) return;
    const timer = setInterval(() => {
      if (!socketConnectedRef.current && document.visibilityState === 'visible') refreshNotifications();
    }, 30000);
    const onVisible = () => {
      if (document.visibilityState === 'visible') refreshNotifications();
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [refreshNotifications, currentUser]);

  // Real-time Socket.IO notification listener
  useEffect(() => {
    if (!currentUser || !currentUser.id || window.location.pathname.startsWith('/admin')) return;

    const token = localStorage.getItem('auth_token') || currentUser.token;
    if (!token) return;

    const socket = io(SOCKET_URL, {
      transports: ['polling', 'websocket'],
      query: { token },
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    socket.on('connect', () => {
      socketConnectedRef.current = true;
      socket.emit('join_user_room', String(currentUser.id));
      refreshNotifications();
    });
    socket.on('disconnect', () => { socketConnectedRef.current = false; });

    socket.on('new_notification', (newNotif) => {
      const type = (newNotif?.type || '').toUpperCase();

      // Skip chat messages from Bell notification processing
      if (type.includes('CHAT') || type.includes('MESSAGE')) return;

      const notificationId = newNotif?.id != null ? String(newNotif.id) : null;
      if (notificationId && seenNotifIdsRef.current.has(notificationId)) return;
      if (notificationId) seenNotifIdsRef.current.add(notificationId);
      refreshNotifications();
      const prefs = getUserNotifPrefs();

      if (type.includes('LIKE') || type.includes('RELATE') || type.includes('REACTION')) {
        if (prefs.postLikes === false) return;
      } else if (type.includes('COMMENT')) {
        if (prefs.comments === false) return;
      } else if (type.includes('SYSTEM') || type.includes('WARNING')) {
        if (prefs.systemAlerts === false) return;
      }

      const rawSender = newNotif?.senderUsername || newNotif?.actorUsername || newNotif?.username || 'Someone';
      const cleanSender = rawSender.startsWith('@') ? rawSender : `@${rawSender}`;

      let formattedText = '';
      if (type.includes('RELATE')) {
        formattedText = `${cleanSender} related to your post`;
      } else if (type.includes('SUPPORT')) {
        formattedText = `${cleanSender} supported your post`;
      } else if (type.includes('AGREE')) {
        formattedText = `${cleanSender} agreed with your post`;
      } else if (type.includes('INTERESTING')) {
        formattedText = `${cleanSender} found your post interesting`;
      } else if (type.includes('LIKE')) {
        formattedText = `${cleanSender} reacted to your post`;
      } else if (type.includes('COMMENT')) {
        formattedText = `${cleanSender} commented on your post`;
      } else {
        formattedText = newNotif?.message || newNotif?.content || newNotif?.title || 'You have a new notification';
      }

      addToast(formattedText, 'notification', 4000, {
        label: 'NOTIFICATION',
        senderUsername: cleanSender,
      });

      if (prefs.soundAlerts !== false) {
        playNotificationSound();
      }
    });

    return () => {
      socketConnectedRef.current = false;
      socket.disconnect();
    };
  }, [currentUser, refreshNotifications, addToast, getUserNotifPrefs]);

  const markAsRead = async (id) => {
    await apiNotificationService.markAsRead(id);
    await refreshNotifications();
  };

  const markAllAsRead = async () => {
    if (!currentUser) return;
    await apiNotificationService.markAllAsRead();
    await refreshNotifications();
  };

  const deleteNotification = async (id) => {
    // 1. Immediately remove notification from local UI state for instant response
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    
    // 2. Call backend API to delete from DB
    try {
      await apiNotificationService.deleteNotification(id);
    } catch (e) {
      console.warn('Notice deleting notification from backend:', e);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      refreshNotifications,
      markAsRead,
      markAllAsRead,
      deleteNotification
    }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotifications must be used within NotificationProvider');
  return context;
}
