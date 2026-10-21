import { apiClient } from './apiClient.js';

export const apiUserService = {
  // GET /api/users/me (Always sends token)
  async getMyUser() {
    try {
      const response = await apiClient.get('/api/users/me');
      return response.data;
    } catch (err) {
      if (err.response?.data) throw err.response.data;
      throw err;
    }
  },

  // GET /api/users/{userId} (Public)
  async getPublicUser(userId) {
    try {
      const response = await apiClient.get(`/api/users/${userId}`);
      return response.data;
    } catch (err) {
      if (err.response?.data) throw err.response.data;
      throw err;
    }
  },

  // PUT /api/users/avatar { avatar }
  async updateAvatar(avatar) {
    try {
      const response = await apiClient.put('/api/users/avatar', { avatar });
      return response.data;
    } catch (err) {
      if (err.response?.data) throw err.response.data;
      throw err;
    }
  },

  // PUT /api/users/language { language } (Values: EN, HI, MR, PA, TA, TE, GU, BN, KN, ML)
  async updateLanguage(language) {
    try {
      const response = await apiClient.put('/api/users/language', { language });
      return response.data;
    } catch (err) {
      if (err.response?.data) throw err.response.data;
      throw err;
    }
  },

  // GET /api/users/me/profile
  async getMyProfile() {
    try {
      const response = await apiClient.get('/api/users/me/profile');
      return response.data;
    } catch (err) {
      if (err.response?.data) throw err.response.data;
      throw err;
    }
  },

  // PUT /api/users/password { currentPassword, newPassword }
  async updatePassword(currentPassword, newPassword) {
    try {
      const payload = typeof currentPassword === 'object' && currentPassword !== null
        ? currentPassword
        : { currentPassword, newPassword };
      const response = await apiClient.put('/api/users/password', payload);
      return response.data;
    } catch (err) {
      if (err.response?.data) throw err.response.data;
      throw err;
    }
  },

  // DELETE /api/users/me
  async deactivateAccount() {
    try {
      const response = await apiClient.delete('/api/users/me');
      return response.data;
    } catch (err) {
      if (err.response?.data) throw err.response.data;
      throw err;
    }
  },

  // POST /api/users/mute/{username}
  async muteUser(username) {
    const clean = (username || '').replace(/^@/, '').trim();
    if (!clean) return null;
    const response = await apiClient.post(`/api/users/mute/${encodeURIComponent(clean)}`);
    return response.data;
  },

  // DELETE /api/users/unmute/{username}
  async unmuteUser(username) {
    const clean = (username || '').replace(/^@/, '').trim();
    if (!clean) return null;
    const response = await apiClient.delete(`/api/users/unmute/${encodeURIComponent(clean)}`);
    return response.data;
  },

  // GET /api/users/muted
  async getMutedUsers() {
    const response = await apiClient.get('/api/users/muted');
    return response.data;
  },

  // POST /api/users/hide-post/{postId}
  async hidePost(postId) {
    try {
      const response = await apiClient.post(`/api/users/hide-post/${postId}`);
      return response.data;
    } catch (err) {
      return { success: true, message: 'Hidden locally' };
    }
  },

  // DELETE /api/users/unhide-post/{postId}
  async unhidePost(postId) {
    try {
      const response = await apiClient.delete(`/api/users/unhide-post/${postId}`);
      return response.data;
    } catch (err) {
      return { success: true, message: 'Unhidden locally' };
    }
  },

  // GET /api/users/hidden-posts
  async getHiddenPosts() {
    try {
      const response = await apiClient.get('/api/users/hidden-posts');
      return response.data;
    } catch (err) {
      return [];
    }
  },

  // POST /api/users/block/{username}
  async blockUser(username) {
    const clean = (username || '').replace(/^@/, '').trim();
    if (!clean) return null;
    const response = await apiClient.post(`/api/users/block/${encodeURIComponent(clean)}`);
    return response.data;
  },

  // DELETE /api/users/unblock/{username}
  async unblockUser(username) {
    const clean = (username || '').replace(/^@/, '').trim();
    if (!clean) return null;
    const response = await apiClient.delete(`/api/users/unblock/${encodeURIComponent(clean)}`);
    return response.data;
  },

  // GET /api/users/blocked
  async getBlockedUsers() {
    try {
      const response = await apiClient.get('/api/users/blocked');
      return response.data;
    } catch (err) {
      return [];
    }
  },
};

