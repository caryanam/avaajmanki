import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiChatService } from '../services/apiChatService.js';
import { mockChatService } from '../services/mockChatService.js';
import { useAuth } from './AuthContext.jsx';
import { useToast } from './ToastContext.jsx';
import { FloatingChatToast } from '../components/common/FloatingChatToast.jsx';
import { formatLastSeen } from '../utils/formatLastSeen.js';
import { playNotificationSound } from '../utils/soundUtil.js';

import { getOrCreateSocket, getSocket } from '../services/socketService.js';

const ChatContext = createContext(null);

const isMockMode = () => {
  const token = localStorage.getItem('auth_token');
  return !token || token.startsWith('mock') || token === 'mock_token';
};

export function ChatProvider({ children }) {
  const { currentUser } = useAuth();
  const { addToast } = useToast();
  const queryClient = useQueryClient();

  const [activeConversation, setActiveConversation] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState({});
  const [floatingToasts, setFloatingToasts] = useState([]);
  const socketRef = useRef(null);
  const activeConvRef = useRef(activeConversation);
  const prevConvsRef = useRef(null);
  const recentNotifKeysRef = useRef(new Set());

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

  useEffect(() => {
    activeConvRef.current = activeConversation;
  }, [activeConversation]);

  // Background conversations auto-sync (Disabled when chat feature is inactive)
  const { data: conversations = [], refetch: refreshConversations } = useQuery({
    queryKey: ['conversations'],
    queryFn: async () => {
      return [];
    },
    enabled: false,
    staleTime: Infinity,
  });

  const dismissFloatingToast = useCallback((toastId) => {
    setFloatingToasts((prev) => prev.filter((t) => t.toastId !== toastId));
  }, []);

  const addFloatingToast = useCallback((msg) => {
    const toastId = `${msg.id || Date.now()}_${Math.random()}`;
    const newToast = { ...msg, toastId };

    setFloatingToasts((prev) => [newToast, ...prev.filter((t) => t.roomId !== msg.roomId)]);

    setTimeout(() => {
      dismissFloatingToast(toastId);
    }, 6000);
  }, [dismissFloatingToast]);

  // Unified & Deduplicated Notification Trigger
  const notifyNewMessage = useCallback((msgKey, convId, cleanSender, previewText) => {
    if (!msgKey || recentNotifKeysRef.current.has(msgKey)) return;
    recentNotifKeysRef.current.add(msgKey);

    if (recentNotifKeysRef.current.size > 100) {
      const first = recentNotifKeysRef.current.values().next().value;
      recentNotifKeysRef.current.delete(first);
    }

    const prefs = getUserNotifPrefs();
    if (prefs.chatMessages === false) return; // User disabled chat message notifications

    // 1. Single Floating Chat Toast Banner with 4s right-swipe dismissal
    addFloatingToast({
      id: `toast_${convId}_${Date.now()}`,
      roomId: convId,
      senderUsername: cleanSender,
      content: `You've a new msg from ${cleanSender}`,
      previewText: previewText,
      label: 'MESSAGE',
    });

    // 2. Play Sound Chime if enabled
    if (prefs.soundAlerts !== false) {
      playNotificationSound();
    }
  }, [addFloatingToast, getUserNotifPrefs]);

  // Detect newly arrived unread messages from polling or updates
  useEffect(() => {
    if (!conversations || conversations.length === 0 || !currentUser) return;

    if (prevConvsRef.current === null) {
      prevConvsRef.current = conversations;
      return;
    }

    const prevMap = new Map((prevConvsRef.current || []).map((c) => [String(c.id), c]));

    conversations.forEach((conv) => {
      const prev = prevMap.get(String(conv.id));

      const isNewUnread = !prev
        ? (conv.unreadCount > 0 || conv.hasUnread)
        : (
            (conv.unreadCount || 0) > (prev.unreadCount || 0) ||
            (conv.hasUnread && !prev.hasUnread) ||
            (conv.lastMessageTime && conv.lastMessageTime !== prev.lastMessageTime && (conv.unreadCount > 0 || conv.hasUnread))
          );

      if (isNewUnread) {
        const otherName = conv.otherParticipantUsername || conv.participant2Username || 'Someone';
        const cleanSender = otherName.startsWith('@') ? otherName : `@${otherName}`;
        const msgText = conv.lastMessage || 'Sent you a new message';
        const previewText = typeof msgText === 'string'
          ? (msgText.length > 45 ? `${msgText.slice(0, 42)}...` : msgText)
          : 'Sent you a message';

        const cleanSelf = (currentUser.username || '').replace(/^@/, '').toLowerCase();
        const cleanOther = cleanSender.replace(/^@/, '').toLowerCase();

        if (cleanOther !== cleanSelf) {
          const dedupeKey = `poll_${conv.id}_${conv.lastMessageTime || conv.unreadCount}`;
          notifyNewMessage(dedupeKey, conv.id, cleanSender, previewText);
        }
      }
    });

    prevConvsRef.current = conversations;
  }, [conversations, currentUser, notifyNewMessage]);

  // Global Real-time Socket.IO Connection & Presence Heartbeat
  useEffect(() => {
    if (!currentUser || !currentUser.id || isMockMode() || window.location.pathname.startsWith('/admin')) return;

    const token = localStorage.getItem('auth_token') || currentUser.token;
    if (!token) return;

    const socket = getOrCreateSocket(token, currentUser);
    if (!socket) return;

    socketRef.current = socket;

    const sendHeartbeat = () => {
      if (socket.connected && currentUser?.id) {
        socket.emit('presence_heartbeat', {
          userId: currentUser.id,
          username: currentUser.username,
        });
      }
    };

    const handleConnect = () => {
      console.log('[Socket] Connected as', currentUser.username, 'ID:', currentUser.id);
      if (currentUser?.id) {
        socket.emit('join_user_room', String(currentUser.id));
        sendHeartbeat();
      }
    };

    if (socket.connected) {
      handleConnect();
    }

    const handleReceiveMessage = (msg) => {
      console.log('[Socket] Received message:', msg);

      queryClient.invalidateQueries({ queryKey: ['messages', msg.roomId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });

      const senderId = msg.senderId || msg.sender?.id || msg.userId || msg.authorId;
      const currentUserId = currentUser?.id;

      const cleanSelfHandle = (currentUser?.username || '').replace(/^@/, '').toLowerCase();
      const rawSenderHandle = msg.senderUsername || msg.sender?.username || msg.username || '';
      const cleanSenderHandle = rawSenderHandle.replace(/^@/, '').toLowerCase();

      const isFromOther = (senderId && currentUserId)
        ? (String(senderId) !== String(currentUserId))
        : (cleanSenderHandle ? cleanSenderHandle !== cleanSelfHandle : true);

      if (isFromOther) {
        const senderHandle = rawSenderHandle
          ? (rawSenderHandle.startsWith('@') ? rawSenderHandle : `@${rawSenderHandle}`)
          : 'Anonymous Member';
        const msgText = msg.content || msg.text || 'Sent you a message';
        const previewText = msgText.length > 50 ? `${msgText.slice(0, 47)}...` : msgText;

        const dedupeKey = msg.id ? `socket_${msg.id}` : `socket_${msg.roomId}_${msgText}`;
        notifyNewMessage(dedupeKey, msg.roomId, senderHandle, previewText);
      }
    };

    const handlePresence = (presence) => {
      console.log('[Socket] Presence changed:', presence);
      if (presence) {
        const isOnline = Boolean(presence.isOnline || presence.status === 'ONLINE');
        const lastSeen = presence.lastSeen || new Date().toISOString();
        const statusStr = presence.status || (isOnline ? 'ONLINE' : 'OFFLINE');

        const updateData = { isOnline, lastSeen, status: statusStr };

        setOnlineUsers((prev) => {
          const next = { ...prev };
          if (presence.username) {
            const cleanKey = presence.username.toLowerCase().replace('@', '');
            next[cleanKey] = updateData;
          }
          if (presence.userHandle) {
            const cleanKey = presence.userHandle.toLowerCase().replace('@', '');
            next[cleanKey] = updateData;
          }
          if (presence.userId) {
            next[`user_${presence.userId}`] = updateData;
          }
          return next;
        });
      }
    };

    const handleRoomStatusChange = (updatedRoom) => {
      queryClient.invalidateQueries({ queryKey: ['messages', updatedRoom.id] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    };

    socket.on('connect', handleConnect);
    socket.on('receive_message', handleReceiveMessage);
    socket.on('user_presence_changed', handlePresence);
    socket.on('room_status_change', handleRoomStatusChange);

    const heartbeatInterval = setInterval(sendHeartbeat, 25000);

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        sendHeartbeat();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(heartbeatInterval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      socket.off('connect', handleConnect);
      socket.off('receive_message', handleReceiveMessage);
      socket.off('user_presence_changed', handlePresence);
      socket.off('room_status_change', handleRoomStatusChange);
      socketRef.current = null;
    };
  }, [currentUser?.id, currentUser?.username, queryClient, notifyNewMessage]);

  useEffect(() => {
    const socket = socketRef.current || getSocket();
    if (!socket || !activeConversation?.id || isMockMode()) return;

    const roomId = activeConversation.id;
    socket.emit('join_room', String(roomId));

    return () => {
      socket.emit('leave_room', String(roomId));
    };
  }, [activeConversation?.id]);

  const openChatWithUser = useCallback(async (targetUsername) => {
    try {
      const conv = await apiChatService.startConversation(targetUsername);
      setActiveConversation(conv);
      queryClient.invalidateQueries({ queryKey: ['messages', conv.id] });
      await refreshConversations();
      return conv;
    } catch (err) {
      console.error('[ChatContext] Open chat failed:', err);
      const msg = err?.response?.data?.message || err?.response?.data?.error || err?.message || 'Failed to open chat.';
      addToast(msg, 'error');
    }
  }, [refreshConversations, addToast, queryClient]);

  const selectConversation = useCallback(async (convId) => {
    if (!convId) {
      setActiveConversation(null);
      return;
    }
    const conv = conversations.find(c => String(c.id) === String(convId));
    if (conv) {
      setActiveConversation(conv);
      queryClient.invalidateQueries({ queryKey: ['messages', convId] });
    } else {
      setActiveConversation(null);
    }
  }, [conversations, queryClient]);

  const sendMessage = useCallback(async (roomId, content) => {
    try {
      const sent = await apiChatService.sendMessage(roomId, content);
      queryClient.invalidateQueries({ queryKey: ['messages', roomId] });
      await refreshConversations();
      return sent;
    } catch (err) {
      const errorMsg = err?.response?.data?.message || err?.response?.data?.error || err?.message || 'Failed to send message.';
      addToast(errorMsg, 'error');
      throw err;
    }
  }, [refreshConversations, addToast, queryClient]);

  const acceptChatRequest = useCallback(async (roomId) => {
    try {
      const updated = await apiChatService.acceptChatRequest(roomId);
      setActiveConversation(updated);
      await refreshConversations();
      addToast('Chat request accepted.', 'success');
      return updated;
    } catch (err) {
      console.error('[ChatContext] Accept chat request failed:', err);
      const msg = err?.response?.data?.message || err?.message || 'Failed to accept chat request.';
      addToast(msg, 'error');
    }
  }, [refreshConversations, addToast]);

  const declineChatRequest = useCallback(async (roomId) => {
    try {
      await apiChatService.declineChatRequest(roomId);
      setActiveConversation(null);
      await refreshConversations();
      addToast('Chat request declined.', 'info');
    } catch (err) {
      console.error('[ChatContext] Decline chat request failed:', err);
      const msg = err?.response?.data?.message || err?.message || 'Failed to decline chat request.';
      addToast(msg, 'error');
    }
  }, [refreshConversations, addToast]);

  const getUserPresence = useCallback((username, fallbackOnline = true, fallbackLastSeen = null, t = null) => {
    if (!username) return { isOnline: false, statusText: t ? t('offline', 'Offline') : 'Offline' };
    const cleanU = username.trim().toLowerCase().replace('@', '');
    const entry = onlineUsers[cleanU] || onlineUsers[`@${cleanU}`];

    if (entry) {
      return {
        isOnline: entry.isOnline,
        statusText: formatLastSeen(entry, t),
      };
    }

    const presenceObj = {
      isOnline: Boolean(fallbackOnline),
      lastSeen: fallbackLastSeen,
    };
    return {
      isOnline: Boolean(fallbackOnline),
      statusText: formatLastSeen(presenceObj, t),
    };
  }, [onlineUsers]);

  const hasUnreadMessages = conversations.some(conv => {
    const isPrimary = conv.requestStatus === 'ACCEPTED' || (conv.requestStatus === 'PENDING' && conv.requestSender !== currentUser?.username);
    return isPrimary && (conv.unreadCount > 0 || conv.hasUnread);
  });

  const handleViewFloatingToast = useCallback((toastNotif) => {
    dismissFloatingToast(toastNotif.toastId);
    selectConversation(toastNotif.roomId);
    if (window.location.pathname !== '/chat') {
      window.history.pushState({}, '', '/chat');
      window.dispatchEvent(new Event('popstate'));
    }
  }, [dismissFloatingToast, selectConversation]);

  return (
    <ChatContext.Provider value={{
      conversations,
      activeConversation,
      activeMessages: [],
      refreshConversations,
      openChatWithUser,
      selectConversation,
      sendMessage,
      acceptChatRequest,
      declineChatRequest,
      hasUnreadMessages,
      onlineUsers,
      getUserPresence,
    }}>
      {children}
      <FloatingChatToast
        notifications={floatingToasts}
        onDismiss={dismissFloatingToast}
        onView={handleViewFloatingToast}
      />
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) throw new Error('useChat must be used within ChatProvider');
  return context;
}
