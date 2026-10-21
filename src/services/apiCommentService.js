import { apiClient } from './apiClient.js';
import { mockCommentService } from './mockCommentService.js';

export const apiCommentService = {
  async getCommentsByTopicId(topicId, params = {}) {
    const response = await apiClient.get(`/api/topics/${topicId}/comments`, {
      params: { page: params.page || 0, size: params.size || 20 },
    });
    return response.data;
  },

  async createTopicComment(topicId, content, originalLanguage = 'EN', imageUrl = null) {
    const response = await apiClient.post(`/api/topics/${topicId}/comments`, { content, originalLanguage, imageUrl });
    return response.data;
  },

  // GET /api/comments/me?page=0&size=20
  async getMyComments(params = {}) {
    try {
      const response = await apiClient.get('/api/comments/me', {
        params: { page: params.page || 0, size: params.size || 20 },
      });
      return response.data;
    } catch (err) {
      if (err.response?.data) throw err.response.data;
      return { success: true, data: { content: [] } };
    }
  },

  // GET /api/posts/{postId}/comments?page=0&size=20
  async getCommentsByPostId(postId, params = {}) {
    const strId = String(postId || '');
    if (!postId || strId.startsWith('post_') || strId.startsWith('TOPIC_OPINION_') || (isNaN(Number(postId)) && !strId.toUpperCase().startsWith('PULSE_'))) {
      if (strId.startsWith('TOPIC_OPINION_') || (isNaN(Number(postId)) && !strId.toUpperCase().startsWith('PULSE_'))) {
        return {
          success: true,
          data: {
            content: [],
            totalElements: 0,
            totalPages: 0,
            number: 0,
            size: params.size || 20,
          },
        };
      }
      const mockComments = mockCommentService.getCommentsByPostId(postId);
      return {
        success: true,
        data: {
          content: mockComments,
          totalElements: mockComments.length,
          totalPages: 1,
          number: 0,
          size: mockComments.length,
        },
      };
    }

    try {
      const response = await apiClient.get(`/api/posts/${postId}/comments`, {
        params: {
          page: params.page || 0,
          size: params.size || 20,
          ...params,
        },
      });
      return response.data;
    } catch (err) {
      throw err;
    }
  },

  // POST /api/posts/{postId}/comments { content, originalLanguage?, imageUrl? }
  async createComment(postId, payloadOrContent, originalLanguage = 'EN', imageUrl = null) {
    let payload = {
      content: '',
      originalLanguage: 'EN',
      imageUrl: null,
    };

    if (typeof payloadOrContent === 'object' && payloadOrContent !== null) {
      payload.content = payloadOrContent.content || '';
      payload.originalLanguage = payloadOrContent.originalLanguage || originalLanguage || 'EN';
      payload.imageUrl = payloadOrContent.imageUrl || null;
    } else {
      payload.content = payloadOrContent || '';
      payload.originalLanguage = originalLanguage || 'EN';
      payload.imageUrl = imageUrl || null;
    }

    const strId = String(postId || '');
    if (strId.toUpperCase().startsWith('PULSE_')) {
      const pulseNumericId = strId.substring(6);
      const response = await apiClient.post(`/api/v1/pulse/${pulseNumericId}/comments`, payload);
      return response.data;
    }
    if (!postId || strId.startsWith('post_') || strId.startsWith('discussion_') || strId.startsWith('temp_') || (isNaN(Number(postId)) && !strId.toUpperCase().startsWith('PULSE_'))) {
      const fallback = mockCommentService.createComment(postId, payload.content, { username: '@anonymous' });
      return { success: true, data: fallback.comment };
    }

    try {
      const response = await apiClient.post(`/api/posts/${postId}/comments`, payload);
      return response.data;
    } catch (err) {
      if (err.response?.data) throw err.response.data;
      const fallback = mockCommentService.createComment(postId, payload.content, { username: '@anonymous' });
      return { success: true, data: fallback.comment };
    }
  },

  // POST /api/comments/{commentId}/replies { content, originalLanguage?, imageUrl? }
  async replyToComment(commentId, payloadOrContent, originalLanguage = 'EN', imageUrl = null) {
    let payload = {
      content: '',
      originalLanguage: 'EN',
      imageUrl: null,
    };

    if (typeof payloadOrContent === 'object' && payloadOrContent !== null) {
      payload.content = payloadOrContent.content || '';
      payload.originalLanguage = payloadOrContent.originalLanguage || originalLanguage || 'EN';
      payload.imageUrl = payloadOrContent.imageUrl || null;
    } else {
      payload.content = payloadOrContent || '';
      payload.originalLanguage = originalLanguage || 'EN';
      payload.imageUrl = imageUrl || null;
    }

    if (!commentId || String(commentId).startsWith('comment_')) {
      const fallback = mockCommentService.replyToComment(commentId, payload.content, { username: '@anonymous' });
      return { success: true, data: fallback };
    }

    try {
      const response = await apiClient.post(`/api/comments/${commentId}/replies`, payload);
      return response.data;
    } catch (err) {
      if (err.response?.data) throw err.response.data;
      const fallback = mockCommentService.replyToComment(commentId, payload.content, { username: '@anonymous' });
      return { success: true, data: fallback };
    }
  },

  // PUT /api/comments/{commentId} { content }
  async updateComment(commentId, content) {
    if (!commentId || String(commentId).startsWith('comment_')) {
      return { success: true, data: { id: commentId, content } };
    }

    try {
      const response = await apiClient.put(`/api/comments/${commentId}`, { content });
      return response.data;
    } catch (err) {
      if (err.response?.data) throw err.response.data;
      throw err;
    }
  },

  // DELETE /api/comments/{commentId}
  async deleteComment(commentId) {
    if (!commentId || String(commentId).startsWith('comment_')) {
      mockCommentService.deleteComment(commentId);
      return { success: true };
    }

    const response = await apiClient.delete(`/api/comments/${commentId}`);
    return response.data;
  },

  // POST /api/comments/{commentId}/like
  async likeComment(commentId) {
    if (!commentId || String(commentId).startsWith('comment_')) {
      return { success: true };
    }

    try {
      const response = await apiClient.post(`/api/comments/${commentId}/like`);
      return response.data;
    } catch (err) {
      return { success: true };
    }
  },

  // DELETE /api/comments/{commentId}/like
  async unlikeComment(commentId) {
    if (!commentId || String(commentId).startsWith('comment_')) {
      return { success: true };
    }

    try {
      const response = await apiClient.delete(`/api/comments/${commentId}/like`);
      return response.data;
    } catch (err) {
      return { success: true };
    }
  },

  // POST /api/comments/{id}/react { reactionType }
  async reactToComment(id, reactionType) {
    if (!id || String(id).startsWith('comment_')) {
      return { success: true };
    }

    try {
      const response = await apiClient.post(`/api/comments/${id}/react`, { reactionType });
      return response.data;
    } catch (err) {
      return { success: true };
    }
  },

  // DELETE /api/comments/{id}/react
  async unreactToComment(id) {
    if (!id || String(id).startsWith('comment_')) {
      return { success: true };
    }

    try {
      const response = await apiClient.delete(`/api/comments/${id}/react`);
      return response.data;
    } catch (err) {
      return { success: true };
    }
  },
};
