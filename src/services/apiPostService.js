import { apiClient } from './apiClient.js';
import { mockPostService } from './mockPostService.js';
import { mockAuthService } from './mockAuthService.js';
import { toBackendTopic, toBackendPostType } from '../utils/enumMappers.js';

const isMockMode = () => {
  const token = localStorage.getItem('auth_token');
  return Boolean(token && (token.startsWith('mock') || token === 'mock_token'));
};

export const apiPostService = {
  // GET /api/posts?page=0&size=50&sortBy=createdAt&direction=desc
  async getPosts(params = {}) {
    if (isMockMode()) {
      const mockPosts = mockPostService.getPosts();
      return {
        success: true,
        data: {
          content: mockPosts,
          totalElements: mockPosts.length,
          totalPages: 1,
          number: 0,
          size: mockPosts.length,
        },
      };
    }

    try {
      const queryParams = {
        page: params.page || 0,
        size: params.size || 50,
        sortBy: params.sortBy || 'createdAt',
        direction: params.direction || 'desc',
      };
      if (params.topic && params.topic !== 'ALL' && params.topic !== 'All') {
        queryParams.topic = params.topic;
      }
      if (params.community) {
        queryParams.community = params.community;
      }

      const response = await apiClient.get('/api/posts', { params: queryParams, timeout: 30000 });

      if (response.data && (response.data.data || response.data.content || Array.isArray(response.data))) {
        return response.data;
      }
      
      if (isMockMode()) {
        const mockPosts = mockPostService.getPosts();
        return {
          success: true,
          data: { content: mockPosts, totalElements: mockPosts.length, totalPages: 1, number: 0, size: mockPosts.length },
        };
      }
      return response.data;
    } catch (err) {
      if (isMockMode()) {
        const mockPosts = mockPostService.getPosts();
        return {
          success: true,
          data: {
            content: mockPosts,
            totalElements: mockPosts.length,
            totalPages: 1,
            number: 0,
            size: mockPosts.length,
          },
        };
      }
      throw err;
    }
  },

  // GET /api/posts/{id}
  async getPostById(id) {
    if (!id || String(id).startsWith('post_') || isMockMode()) {
      const post = mockPostService.getPostById(id);
      return { success: true, data: post };
    }
    try {
      const response = await apiClient.get(`/api/posts/${id}`);
      return response.data;
    } catch (err) {
      if (err.response?.data) throw err.response.data;
      throw err;
    }
  },

  // POST /api/posts { content, title, topic, type, imageUrl, originalLanguage }
  async createPost(postData) {
    if (isMockMode()) {
      const currentUser = mockAuthService.getCurrentUser() || JSON.parse(localStorage.getItem('auth_user') || '{}');
      const created = mockPostService.createPost(postData, currentUser);
      return { success: true, data: created };
    }

    try {
      const subtopicTag = (postData.topic || postData.subtopic || 'GENERAL').toUpperCase().replace(/[^A-Z0-9_]/g, '');
      let contentToSubmit = postData.content || '';

      if (subtopicTag !== 'GENERAL' && !contentToSubmit.toUpperCase().includes(`#${subtopicTag}`)) {
        contentToSubmit = `#${subtopicTag}\n${contentToSubmit}`;
      }

      const payload = {
        content: contentToSubmit,
        title: postData.title || '',
        topic: toBackendTopic(subtopicTag),
        type: toBackendPostType(postData.postType || postData.type, Boolean(postData.imageUrl)),
        imageUrl: postData.imageUrl || null,
        movieName: postData.movieName || null,
        movieRating: postData.movieRating || null,
        isSpoiler: Boolean(postData.isSpoiler),
        mood: postData.mood || null,
      };

      const response = await apiClient.post('/api/posts', payload);
      const resData = response.data?.data || response.data || {};

      if (resData.id) {
        try {
          const map = JSON.parse(localStorage.getItem('mka_subtopic_map') || '{}');
          map[String(resData.id)] = subtopicTag;
          localStorage.setItem('mka_subtopic_map', JSON.stringify(map));
        } catch (e) {}
      }

      return response.data;
    } catch (err) {

      if (err.response?.data) throw err.response.data;
      if (isMockMode()) {
        const currentUser = mockAuthService.getCurrentUser() || JSON.parse(localStorage.getItem('auth_user') || '{}');
        const created = mockPostService.createPost(postData, currentUser);
        return { success: true, data: created };
      }
      throw err;
    }
  },

  // PUT /api/posts/{id} { content }
  async updatePost(id, content) {
    try {
      const response = await apiClient.put(`/api/posts/${id}`, { content });
      return response.data;
    } catch (err) {
      if (err.response?.data) throw err.response.data;
      throw err;
    }
  },

  // DELETE /api/posts/{id}
  async deletePost(id) {
    try {
      const response = await apiClient.delete(`/api/posts/${id}`);
      return response.data;
    } catch (err) {
      if (err.response?.data) throw err.response.data;
      throw err;
    }
  },

  // POST /api/posts/{id}/like
  async likePost(id) {
    try {
      const response = await apiClient.post(`/api/posts/${id}/like`);
      return response.data;
    } catch (err) {
      if (err.response?.data) throw err.response.data;
      throw err;
    }
  },

  // DELETE /api/posts/{id}/like
  async unlikePost(id) {
    try {
      const response = await apiClient.delete(`/api/posts/${id}/like`);
      return response.data;
    } catch (err) {
      if (err.response?.data) throw err.response.data;
      throw err;
    }
  },

  // POST /api/posts/{id}/save
  async savePost(id) {
    try {
      const response = await apiClient.post(`/api/posts/${id}/save`);
      return response.data;
    } catch (err) {
      if (err.response?.data) throw err.response.data;
      return { success: true };
    }
  },

  // DELETE /api/posts/{id}/save
  async unsavePost(id) {
    try {
      const response = await apiClient.delete(`/api/posts/${id}/save`);
      return response.data;
    } catch (err) {
      if (err.response?.data) throw err.response.data;
      return { success: true };
    }
  },

  // GET /api/posts/saved
  async getSavedPosts(params = {}) {
    try {
      const response = await apiClient.get('/api/posts/saved', { params });
      return response.data;
    } catch (err) {
      if (err.response?.data) throw err.response.data;
      return { success: true, data: { content: [] } };
    }
  },

  // POST /api/posts/{id}/react { reactionType }
  async reactToPost(id, reactionType) {
    try {
      const response = await apiClient.post(`/api/posts/${id}/react`, { reactionType });
      return response.data;
    } catch (err) {
      if (err.response?.data) throw err.response.data;
      return { success: true };
    }
  },

  // DELETE /api/posts/{id}/react
  async unreactToPost(id) {
    try {
      const response = await apiClient.delete(`/api/posts/${id}/react`);
      return response.data;
    } catch (err) {
      if (err.response?.data) throw err.response.data;
      return { success: true };
    }
  },

  // POST /api/posts/voice-note
  async publishVoiceNote(formData) {
    try {
      const response = await apiClient.post('/api/posts/voice-note', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    } catch (err) {
      if (err.response?.data) throw err.response.data;
      throw err;
    }
  },
};
