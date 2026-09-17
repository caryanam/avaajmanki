import { apiClient } from './apiClient.js';
import { apiProfileService } from './apiProfileService.js';
import { mockAuthService } from './mockAuthService.js';

export const authService = {
  // POST /api/auth/login { identifier, password } → returns user data plus token
  async login(identifier, password, { allowMockFallback = true } = {}) {
    try {
      const cleanIdentifier = (identifier || '').trim();
      const response = await apiClient.post('/api/auth/login', {
        identifier: cleanIdentifier,
        email: cleanIdentifier,
        password,
      });
      const res = response.data;

      if (res && res.success && res.data?.token) {
        localStorage.setItem('auth_token', res.data.token);
        localStorage.setItem('auth_user', JSON.stringify(res.data));

        // Always check profile via GET /api/profile/me (using token)
        let hasProfile = false;
        try {
          const profileRes = await apiProfileService.getMyProfile();
          if (profileRes && profileRes.success && profileRes.data) {
            hasProfile = true;
            localStorage.setItem(`user_profile_${res.data.id}`, JSON.stringify(profileRes.data));
            localStorage.setItem('user_profile', JSON.stringify(profileRes.data));
          }
        } catch (profileErr) {
          if (profileErr.status === 404 || profileErr.response?.status === 404) {
            hasProfile = false;
          }
        }

        const user = {
          id: res.data.id,
          fullName: res.data.fullName,
          email: res.data.email,
          mobileNumber: res.data.mobileNumber,
          role: res.data.role,
          token: res.data.token,
          hasProfile,
        };
        mockAuthService.setCurrentUser(user);
        return { user, hasProfile };
      }
      throw new Error(res?.message || 'Login failed');
    } catch (err) {
      if (err.response?.data) {
        throw err.response.data;
      }
      if (err.isNetworkError || err.code === 'ECONNABORTED' || err.message?.includes('timeout') || err.message?.includes('Network Error') || err.message?.includes('Failed to fetch') || !err.response) {
        if (!allowMockFallback) {
          throw new Error('Admin authentication requires the backend server. Please try again when it is available.');
        }
        console.warn('Backend server offline or timed out. Falling back to mock auth.');
        const mockUser = mockAuthService.login(emailOrMobile, password);
        return { user: mockUser, hasProfile: true };
      }
      throw err;
    }
  },

  // POST /api/auth/register { fullName, email, mobileNumber, password }
  async register(userData) {
    try {
      const payload = {
        fullName: userData.fullName,
        email: userData.email,
        mobileNumber: userData.mobileNumber || userData.mobile,
        password: userData.password,
      };

      const response = await apiClient.post('/api/auth/register', payload);
      const res = response.data;

      if (res && res.success) {
        return res;
      }
      throw new Error(res?.message || 'Registration failed');
    } catch (err) {
      if (err.response?.data) {
        throw err.response.data;
      }
      if (err.isNetworkError || err.message?.includes('Failed to fetch') || !err.response) {
        console.warn('Backend offline. Falling back to mock registration.');
        return { success: true, message: 'Mock registration successful. Please verify email/OTP.' };
      }
      throw err;
    }
  },

  // POST /api/auth/forgot-password { identifier }
  async forgotPassword(identifier) {
    try {
      const response = await apiClient.post('/api/auth/forgot-password', { identifier });
      return response.data;
    } catch (err) {
      if (err.response?.data) throw err.response.data;
      if (err.isNetworkError || err.message?.includes('Failed to fetch') || !err.response) {
        return mockAuthService.forgotPassword(identifier);
      }
      throw err;
    }
  },

  // POST /api/auth/verify-forgot-password-otp { identifier, otp }
  async verifyForgotPasswordOtp(identifier, otp) {
    try {
      const response = await apiClient.post('/api/auth/verify-forgot-password-otp', { identifier, otp });
      return response.data;
    } catch (err) {
      if (err.response?.data) throw err.response.data;
      if (err.isNetworkError || err.message?.includes('Failed to fetch') || !err.response) {
        return mockAuthService.verifyForgotPasswordOtp(identifier, otp);
      }
      throw err;
    }
  },

  // POST /api/auth/reset-password { identifier, otp, newPassword }
  async resetPassword(identifier, otp, newPassword) {
    try {
      const response = await apiClient.post('/api/auth/reset-password', { identifier, otp, newPassword });
      return response.data;
    } catch (err) {
      if (err.response?.data) throw err.response.data;
      if (err.isNetworkError || err.message?.includes('Failed to fetch') || !err.response) {
        return mockAuthService.resetPassword(identifier, otp, newPassword);
      }
      throw err;
    }
  },

  // POST /api/auth/delete-account { email, password }
  async deleteAccount(email, password) {
    try {
      const response = await apiClient.post('/api/auth/delete-account', { email, password });
      return response.data;
    } catch (err) {
      const payload = err.response?.data;
      if (payload) throw new Error(payload.message || 'Unable to delete account.');
      throw new Error('Unable to reach the server. Please try again.');
    }
  },

  // POST /api/auth/verify-email { email, otp }
  async verifyEmail(email, otp) {
    try {
      const response = await apiClient.post('/api/auth/verify-email', { email, otp });
      return response.data;
    } catch (err) {
      if (err.response?.data) throw err.response.data;
      return { success: true, message: 'Mock email verification successful.' };
    }
  },

  // POST /api/auth/resend-email-otp { email }
  async resendEmailOtp(email) {
    try {
      const response = await apiClient.post('/api/auth/resend-email-otp', { email });
      return response.data;
    } catch (err) {
      if (err.response?.data) throw err.response.data;
      return { success: true, message: 'Verification OTP resent.' };
    }
  },

  async resendVerification(email) {
    return this.resendEmailOtp(email);
  },

  // POST /api/auth/verify-mobile { mobileNumber, otp }
  async verifyMobile(mobileNumber, otp) {
    try {
      const response = await apiClient.post('/api/auth/verify-mobile', { mobileNumber, otp });
      return response.data;
    } catch (err) {
      if (err.response?.data) throw err.response.data;
      return { success: true, message: 'Mock mobile verification successful.' };
    }
  },

  // POST /api/auth/resend-mobile-otp { mobileNumber }
  async resendMobileOtp(mobileNumber) {
    try {
      const response = await apiClient.post('/api/auth/resend-mobile-otp', { mobileNumber });
      return response.data;
    } catch (err) {
      if (err.response?.data) throw err.response.data;
      return { success: true, message: 'Mobile OTP resent.' };
    }
  },

  getCurrentUser() {
    const userStr = localStorage.getItem('auth_user');
    if (userStr) {
      try {
        const u = JSON.parse(userStr);
        let profile = null;
        if (u.id) {
          const stored = localStorage.getItem(`user_profile_${u.id}`) || localStorage.getItem('user_profile');
          if (stored) try { profile = JSON.parse(stored); } catch (e) {}
        }
        const uname = u.username || profile?.username;
        const formattedUsername = uname ? (uname.startsWith('@') ? uname : `@${uname}`) : undefined;
        return {
          ...u,
          ...(formattedUsername ? { username: formattedUsername } : {}),
          avatarInitials: u.avatarInitials || (u.fullName || uname || 'AN').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase(),
        };
      } catch (e) { /* fallback */ }
    }
    return mockAuthService.getCurrentUser();
  },

  logout() {
    const userStr = localStorage.getItem('auth_user');
    if (userStr) {
      try {
        const u = JSON.parse(userStr);
        if (u?.id) localStorage.removeItem(`user_profile_${u.id}`);
      } catch (e) {}
    }
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    localStorage.removeItem('user_profile');
    localStorage.removeItem('mka_preferred_language');
    localStorage.removeItem('mka_dynamic_ui');
    mockAuthService.logout();
  },
};
