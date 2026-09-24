import { apiClient } from './apiClient.js';
import { mockAuthService } from './mockAuthService.js';
import { isTopicName } from '../utils/topicUtils.js';

export const apiProfileService = {
  // GET /api/profile/me
  async getMyProfile() {
    const isAdminRoute = typeof window !== 'undefined' && window.location.pathname.startsWith('/admin');
    const isAdminUser = typeof localStorage !== 'undefined' && (localStorage.getItem('admin_token') || localStorage.getItem('is_admin'));
    if (isAdminRoute || isAdminUser) {
      return { success: true, data: null };
    }

    const token = localStorage.getItem('auth_token');
    const isMock = !token || token.startsWith('mock') || token === 'mock_token';
    if (isMock) {
      const u = mockAuthService.getCurrentUser();
      const stored = u?.id ? (localStorage.getItem(`user_profile_${u.id}`) || localStorage.getItem('user_profile')) : localStorage.getItem('user_profile');
      if (stored) {
        try { return { success: true, data: JSON.parse(stored) }; } catch (e) {}
      }
      return { success: true, data: u };
    }

    try {
      const response = await apiClient.get('/api/profile/me');
      return response.data;
    } catch (err) {
      if (err.response?.status === 401) throw err;
      const u = mockAuthService.getCurrentUser();
      const stored = u?.id ? (localStorage.getItem(`user_profile_${u.id}`) || localStorage.getItem('user_profile')) : localStorage.getItem('user_profile');
      if (stored) {
        try { return { success: true, data: JSON.parse(stored) }; } catch (e) {}
      }
      return { success: true, data: u };
    }
  },

  // GET /api/profile/check-username
  async checkUsername(username) {
    try {
      const cleanUsername = username ? (username.startsWith('@') ? username.slice(1) : username) : '';
      const response = await apiClient.get('/api/profile/check-username', {
        params: { username: cleanUsername },
      });
      return response.data;
    } catch (err) {
      if (err.response?.data) {
        throw err.response.data;
      }
      throw err;
    }
  },

  // POST /api/profile
  async createProfile(data) {
    try {
      const cleanData = {
        ...data,
        username: data?.username ? (data.username.startsWith('@') ? data.username.slice(1) : data.username) : data?.username,
      };
      const response = await apiClient.post('/api/profile', cleanData);
      return response.data;
    } catch (err) {
      if (err.response?.data) {
        throw err.response.data;
      }
      throw err;
    }
  },

  // PUT /api/profile
  async updateProfile(data) {
    try {
      const cleanData = {
        ...data,
        username: data?.username ? (data.username.startsWith('@') ? data.username.slice(1) : data.username) : data?.username,
      };
      const response = await apiClient.put('/api/profile', cleanData);
      return response.data;
    } catch (err) {
      if (err.response?.data) {
        throw err.response.data;
      }
      throw err;
    }
  },

  // GET /api/profile/:username
  async getPublicProfile(username) {
    const token = localStorage.getItem('auth_token');
    const isMock = !token || token.startsWith('mock') || token === 'mock_token';
    const cleanUsername = username ? (username.startsWith('@') ? username.slice(1) : username) : 'anonymous';

    if (isMock || cleanUsername === 'anonymous') {
      const stored = localStorage.getItem(`user_profile_${cleanUsername}`);
      if (stored) {
        try { return { success: true, data: JSON.parse(stored) }; } catch (e) {}
      }
      return {
        success: true,
        data: {
          username: `@${cleanUsername}`,
          fullName: 'Anonymous Author',
          bio: `Anonymous author on Man Ki Aavaj`,
          joinedDate: new Date().toISOString(),
        },
      };
    }

    try {
      const response = await apiClient.get(`/api/profile/${cleanUsername}`);
      return response.data;
    } catch (err) {
      const stored = localStorage.getItem(`user_profile_${cleanUsername}`);
      if (stored) {
        try { return { success: true, data: JSON.parse(stored) }; } catch (e) {}
      }
      return {
        success: true,
        data: {
          username: `@${cleanUsername}`,
          fullName: 'Anonymous Author',
          bio: `Anonymous author on Man Ki Aavaj`,
          joinedDate: new Date().toISOString(),
        },
      };
    }
  },

  // DELETE /api/profile
  async deleteProfile() {
    try {
      const response = await apiClient.delete('/api/profile');
      return response.data;
    } catch (err) {
      if (err.response) {
        throw err.response.data;
      }
      throw err;
    }
  },
};
