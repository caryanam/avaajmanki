import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { apiReportService } from '../services/apiReportService.js';
import { apiAdminService } from '../services/apiAdminService.js';
import { apiUserService } from '../services/apiUserService.js';
import { useAuth } from './AuthContext.jsx';
import { useToast } from './ToastContext.jsx';
import { 
  useMutedUsers, 
  useBlockedUsers, 
  useHiddenPosts, 
  useMyProfile,
  USER_MODERATION_KEYS 
} from '../hooks/useUserModeration.js';

export { useMutedUsers, useBlockedUsers, useHiddenPosts, useMyProfile };

const ReportContext = createContext(null);

export function ReportProvider({ children }) {
  const [myReports, setMyReports] = useState([]);
  const [adminQueue, setAdminQueue] = useState([]);

  const { currentUser } = useAuth();
  const { addToast } = useToast();
  const queryClient = useQueryClient();

  // Shared TanStack Query hooks (5 min staleTime, O(1) Sets, deduplicated requests)
  const { mutedUsers, mutedSet, isMuted } = useMutedUsers();
  const { blockedUsers, blockedSet, isBlocked } = useBlockedUsers();
  const { hiddenPosts, hiddenSet, isHidden } = useHiddenPosts();

  const refreshReports = useCallback(async () => {
    const token = localStorage.getItem('auth_token');
    if (!currentUser || !token) { 
      setMyReports([]); 
      setAdminQueue([]); 
      return; 
    }

    if (currentUser.role === 'ADMIN') {
      try {
        const response = await apiAdminService.getReports();
        const raw = response.data?.content || (Array.isArray(response.data) ? response.data : (response.data || response.content || []));
        const list = Array.isArray(raw) ? raw : [];
        setAdminQueue(list);
      } catch (err) {
        console.warn('Failed to fetch admin report queue:', err?.message || err);
        setAdminQueue([]);
      }
    }
  }, [currentUser]);

  useEffect(() => {
    refreshReports();
  }, [refreshReports]);

  const submitReport = async (reportData) => {
    if (!currentUser) throw new Error('Must be logged in to report content.');
    try {
      const { contentType, targetId, reason, explanation } = reportData;
      const response = contentType === 'COMMENT'
        ? await apiReportService.reportComment(targetId, reason, explanation)
        : await apiReportService.reportPost(targetId, reason, explanation);
      const report = response.data;
      setMyReports((previous) => [report, ...previous]);
      addToast(`Report submitted successfully. Reference ID: #${report.id || 'SUBMITTED'}`, 'success');
      refreshReports();
      return report;
    } catch (err) {
      addToast(err.message || 'Failed to submit report', 'error');
      throw err;
    }
  };

  const blockUser = useCallback(async (username) => {
    if (!username) return;
    const rawClean = String(username).replace(/^@/, '').trim();
    if (!rawClean) return;

    addToast(`Blocked @${rawClean}. Their thoughts and comments are now hidden.`, 'info');

    try {
      if (apiUserService?.blockUser) await apiUserService.blockUser(rawClean);
    } catch (err) {
      console.warn('[ReportContext] Block user API notice:', err?.message || err);
    } finally {
      queryClient.invalidateQueries({ queryKey: USER_MODERATION_KEYS.blocked });
    }
  }, [addToast, queryClient]);

  const unblockUser = useCallback(async (username) => {
    if (!username) return;
    const rawClean = String(username).replace(/^@/, '').toLowerCase().trim();

    addToast(`Unblocked @${rawClean}. Their thoughts and comments are visible again.`, 'success');

    try {
      if (apiUserService?.unblockUser) await apiUserService.unblockUser(rawClean);
    } catch (err) {
      console.warn('[ReportContext] Unblock user API notice:', err?.message || err);
    } finally {
      queryClient.invalidateQueries({ queryKey: USER_MODERATION_KEYS.blocked });
    }
  }, [addToast, queryClient]);

  const muteUser = useCallback(async (username) => {
    if (!username) return;
    const rawClean = String(username).replace(/^@/, '').trim();
    if (!rawClean) return;

    addToast(`Muted @${rawClean}. Their posts are now hidden from your feed.`, 'info');

    try {
      if (apiUserService?.muteUser) await apiUserService.muteUser(rawClean);
    } catch (err) {
      console.warn('[ReportContext] Mute user API notice:', err?.message || err);
    } finally {
      queryClient.invalidateQueries({ queryKey: USER_MODERATION_KEYS.muted });
    }
  }, [addToast, queryClient]);

  const unmuteUser = useCallback(async (username) => {
    if (!username) return;
    const rawClean = String(username).replace(/^@/, '').toLowerCase().trim();

    addToast(`Unmuted @${rawClean}. Their posts are visible again.`, 'success');

    try {
      if (apiUserService?.unmuteUser) await apiUserService.unmuteUser(rawClean);
    } catch (err) {
      console.warn('[ReportContext] Unmute user API notice:', err?.message || err);
    } finally {
      queryClient.invalidateQueries({ queryKey: USER_MODERATION_KEYS.muted });
    }
  }, [addToast, queryClient]);

  const hidePost = useCallback(async (postId, postData = {}) => {
    if (!postId) return;

    addToast('Post hidden. You can unhide it anytime from Profile / Safety Settings.', 'info');

    try {
      if (apiUserService?.hidePost) {
        await apiUserService.hidePost(postId);
      }
    } catch (e) {
      console.warn('[ReportContext] Hide post API notice:', e?.message || e);
    } finally {
      queryClient.invalidateQueries({ queryKey: USER_MODERATION_KEYS.hiddenPosts });
    }
  }, [addToast, queryClient]);

  const unhidePost = useCallback(async (postId) => {
    if (!postId) return;

    addToast('Post unhidden! It is now visible in your feed again.', 'success');

    try {
      if (apiUserService?.unhidePost) {
        await apiUserService.unhidePost(postId);
      }
    } catch (e) {
      console.warn('[ReportContext] Unhide post API notice:', e?.message || e);
    } finally {
      queryClient.invalidateQueries({ queryKey: USER_MODERATION_KEYS.hiddenPosts });
    }
  }, [addToast, queryClient]);

  const performAdminAction = async (reportId, actionType, actionReason) => {
    try {
      if (actionType === 'Dismiss' || actionType === 'Mark No Violation') await apiAdminService.rejectReport(reportId);
      else await apiAdminService.resolveReport(reportId);
      await refreshReports();
      addToast(`Admin action '${actionType}' applied to report #${reportId}.`, 'success');
      return true;
    } catch (err) {
      addToast(err.message || 'Action failed', 'error');
      throw err;
    }
  };

  return (
    <ReportContext.Provider value={{
      myReports,
      adminQueue,
      blockedUsers,
      mutedUsers,
      hiddenPosts,
      blockedSet,
      mutedSet,
      hiddenSet,
      isMuted,
      isBlocked,
      isHidden,
      refreshReports,
      refreshMutedUsers: () => queryClient.invalidateQueries({ queryKey: USER_MODERATION_KEYS.muted }),
      refreshBlockedUsers: () => queryClient.invalidateQueries({ queryKey: USER_MODERATION_KEYS.blocked }),
      refreshHiddenPosts: () => queryClient.invalidateQueries({ queryKey: USER_MODERATION_KEYS.hiddenPosts }),
      submitReport,
      blockUser,
      unblockUser,
      muteUser,
      unmuteUser,
      hidePost,
      unhidePost,
      performAdminAction
    }}>
      {children}
    </ReportContext.Provider>
  );
}

export function useReports() {
  const context = useContext(ReportContext);
  if (!context) throw new Error('useReports must be used within ReportProvider');
  return context;
}
