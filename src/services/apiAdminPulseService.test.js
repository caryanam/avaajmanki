import { test } from 'node:test';
import assert from 'node:assert/strict';
import { apiAdminPulseService } from './apiAdminPulseService.js';
import { apiClient } from './apiClient.js';

test('apiAdminPulseService - Sources Management', async (t) => {
  await t.test('getSources passes correct query params', async () => {
    let capturedUrl = '';
    let capturedConfig = null;

    const originalGet = apiClient.get;
    apiClient.get = async (url, config) => {
      capturedUrl = url;
      capturedConfig = config;
      return { data: { success: true, data: { content: [], totalPages: 1 } } };
    };

    try {
      const res = await apiAdminPulseService.getSources({ isActive: true, page: 2, size: 10 });
      assert.equal(capturedUrl, '/api/v1/admin/pulse/sources');
      assert.deepEqual(capturedConfig.params, { isActive: true, page: 2, size: 10 });
      assert.equal(res.success, true);
    } finally {
      apiClient.get = originalGet;
    }
  });

  await t.test('getSourceById uses path variable', async () => {
    let capturedUrl = '';
    const originalGet = apiClient.get;
    apiClient.get = async (url) => {
      capturedUrl = url;
      return { data: { success: true, data: { id: 42, name: 'Test Feed' } } };
    };

    try {
      const res = await apiAdminPulseService.getSourceById(42);
      assert.equal(capturedUrl, '/api/v1/admin/pulse/sources/42');
      assert.equal(res.data.id, 42);
    } finally {
      apiClient.get = originalGet;
    }
  });

  await t.test('createSource formats and defaults payload correctly', async () => {
    let capturedUrl = '';
    let capturedBody = null;

    const originalPost = apiClient.post;
    apiClient.post = async (url, body) => {
      capturedUrl = url;
      capturedBody = body;
      return { data: { success: true, data: { id: 100, ...body } } };
    };

    try {
      await apiAdminPulseService.createSource({
        name: ' The Hindu ',
        feedUrl: ' https://thehindu.com/rss.xml ',
        siteUrl: ' ',
      });

      assert.equal(capturedUrl, '/api/v1/admin/pulse/sources');
      assert.equal(capturedBody.name, 'The Hindu');
      assert.equal(capturedBody.feedUrl, 'https://thehindu.com/rss.xml');
      assert.equal(capturedBody.siteUrl, null);
      assert.equal(capturedBody.category, 'GENERAL');
      assert.equal(capturedBody.isActive, true);
    } finally {
      apiClient.post = originalPost;
    }
  });

  await t.test('updateSource sends updated metadata', async () => {
    let capturedUrl = '';
    let capturedBody = null;

    const originalPut = apiClient.put;
    apiClient.put = async (url, body) => {
      capturedUrl = url;
      capturedBody = body;
      return { data: { success: true } };
    };

    try {
      await apiAdminPulseService.updateSource(5, {
        name: 'PTI News',
        feedUrl: 'https://ptinews.com/feed.xml',
        category: 'POLITICS',
        isActive: false,
      });

      assert.equal(capturedUrl, '/api/v1/admin/pulse/sources/5');
      assert.equal(capturedBody.name, 'PTI News');
      assert.equal(capturedBody.category, 'POLITICS');
      assert.equal(capturedBody.isActive, false);
    } finally {
      apiClient.put = originalPut;
    }
  });

  await t.test('toggleSourceActive calls PATCH endpoint', async () => {
    let capturedUrl = '';
    const originalPatch = apiClient.patch;
    apiClient.patch = async (url) => {
      capturedUrl = url;
      return { data: { success: true } };
    };

    try {
      await apiAdminPulseService.toggleSourceActive(8);
      assert.equal(capturedUrl, '/api/v1/admin/pulse/sources/8/toggle-active');
    } finally {
      apiClient.patch = originalPatch;
    }
  });

  await t.test('fetchSource calls POST /fetch endpoint', async () => {
    let capturedUrl = '';
    const originalPost = apiClient.post;
    apiClient.post = async (url) => {
      capturedUrl = url;
      return { data: { success: true, data: { sourceId: 12, candidatesImported: 5, duplicatesSkipped: 2, errorCount: 0 } } };
    };

    try {
      const res = await apiAdminPulseService.fetchSource(12);
      assert.equal(capturedUrl, '/api/v1/admin/pulse/sources/12/fetch');
      assert.equal(res.data.candidatesImported, 5);
      assert.equal(res.data.duplicatesSkipped, 2);
    } finally {
      apiClient.post = originalPost;
    }
  });
});

test('apiAdminPulseService - Candidate Review & Approval', async (t) => {
  await t.test('getCandidates queries with default PENDING_REVIEW', async () => {
    let capturedUrl = '';
    let capturedConfig = null;

    const originalGet = apiClient.get;
    apiClient.get = async (url, config) => {
      capturedUrl = url;
      capturedConfig = config;
      return { data: { success: true, data: { content: [] } } };
    };

    try {
      await apiAdminPulseService.getCandidates({ page: 0, size: 20 });
      assert.equal(capturedUrl, '/api/v1/admin/pulse/candidates');
      assert.equal(capturedConfig.params.status, 'PENDING_REVIEW');
    } finally {
      apiClient.get = originalGet;
    }
  });

  await t.test('getCandidates passes category and sourceId filters', async () => {
    let capturedUrl = '';
    let capturedConfig = null;

    const originalGet = apiClient.get;
    apiClient.get = async (url, config) => {
      capturedUrl = url;
      capturedConfig = config;
      return { data: { success: true, data: { content: [] } } };
    };

    try {
      await apiAdminPulseService.getCandidates({
        status: 'PENDING_REVIEW',
        sourceId: 2,
        category: 'SPORTS',
        page: 1,
        size: 15,
      });
      assert.equal(capturedUrl, '/api/v1/admin/pulse/candidates');
      assert.deepEqual(capturedConfig.params, {
        status: 'PENDING_REVIEW',
        sourceId: 2,
        category: 'SPORTS',
        page: 1,
        size: 15,
      });
    } finally {
      apiClient.get = originalGet;
    }
  });

  await t.test('getCandidateCategoryCounts queries category breakdown endpoint', async () => {
    let capturedUrl = '';
    let capturedConfig = null;

    const originalGet = apiClient.get;
    apiClient.get = async (url, config) => {
      capturedUrl = url;
      capturedConfig = config;
      return {
        data: {
          success: true,
          data: { ALL: 10, GENERAL_NEWS: 5, ENTERTAINMENT: 2, SPORTS: 2, TECHNOLOGY: 1 },
        },
      };
    };

    try {
      const res = await apiAdminPulseService.getCandidateCategoryCounts({
        status: 'PENDING_REVIEW',
        sourceId: 3,
      });
      assert.equal(capturedUrl, '/api/v1/admin/pulse/candidates/counts');
      assert.deepEqual(capturedConfig.params, { status: 'PENDING_REVIEW', sourceId: 3 });
      assert.equal(res.data.SPORTS, 2);
    } finally {
      apiClient.get = originalGet;
    }
  });

  await t.test('approveCandidate maps overrides and defaults', async () => {
    let capturedUrl = '';
    let capturedBody = null;

    const originalPost = apiClient.post;
    apiClient.post = async (url, body) => {
      capturedUrl = url;
      capturedBody = body;
      return { data: { success: true, data: { id: 88 } } };
    };

    try {
      await apiAdminPulseService.approveCandidate(15, {
        title: ' Editorial Headline ',
        category: 'TECHNOLOGY',
        placement: 'FEATURED_PULSE',
        publicationStatus: 'PUBLISHED',
        featuredPriority: 25,
      });

      assert.equal(capturedUrl, '/api/v1/admin/pulse/candidates/15/approve');
      assert.equal(capturedBody.title, 'Editorial Headline');
      assert.equal(capturedBody.category, 'TECHNOLOGY');
      assert.equal(capturedBody.topic, 'TECHNOLOGY');
      assert.equal(capturedBody.placement, 'FEATURED_PULSE');
      assert.equal(capturedBody.publicationStatus, 'PUBLISHED');
      assert.equal(capturedBody.featuredPriority, 25);
    } finally {
      apiClient.post = originalPost;
    }
  });

  await t.test('rejectCandidate sends mandatory reason', async () => {
    let capturedUrl = '';
    let capturedBody = null;

    const originalPost = apiClient.post;
    apiClient.post = async (url, body) => {
      capturedUrl = url;
      capturedBody = body;
      return { data: { success: true } };
    };

    try {
      await apiAdminPulseService.rejectCandidate(15, { reason: 'Duplicate breaking news story' });
      assert.equal(capturedUrl, '/api/v1/admin/pulse/candidates/15/reject');
      assert.equal(capturedBody.reason, 'Duplicate breaking news story');
    } finally {
      apiClient.post = originalPost;
    }
  });
});

test('apiAdminPulseService - Pulse Items Editorial Lifecycle', async (t) => {
  await t.test('getItems filters by publication, placement, and moderation', async () => {
    let capturedUrl = '';
    let capturedConfig = null;

    const originalGet = apiClient.get;
    apiClient.get = async (url, config) => {
      capturedUrl = url;
      capturedConfig = config;
      return { data: { success: true, data: { content: [] } } };
    };

    try {
      await apiAdminPulseService.getItems({
        publicationStatus: 'PUBLISHED',
        placement: 'FEATURED_PULSE',
        moderationStatus: 'VISIBLE',
        topic: 'POLITICS',
        page: 0,
        size: 10,
      });

      assert.equal(capturedUrl, '/api/v1/admin/pulse/items');
      assert.deepEqual(capturedConfig.params, {
        publicationStatus: 'PUBLISHED',
        placement: 'FEATURED_PULSE',
        moderationStatus: 'VISIBLE',
        topic: 'POLITICS',
        page: 0,
        size: 10,
      });
    } finally {
      apiClient.get = originalGet;
    }
  });

  await t.test('createItem formats full authoring payload', async () => {
    let capturedUrl = '';
    let capturedBody = null;

    const originalPost = apiClient.post;
    apiClient.post = async (url, body) => {
      capturedUrl = url;
      capturedBody = body;
      return { data: { success: true, data: { id: 200 } } };
    };

    try {
      await apiAdminPulseService.createItem({
        title: ' New Discussion ',
        topic: 'ECONOMY',
        placement: 'NORMAL_FEED',
        publicationStatus: 'DRAFT',
      });

      assert.equal(capturedUrl, '/api/v1/admin/pulse/items');
      assert.equal(capturedBody.title, 'New Discussion');
      assert.equal(capturedBody.topic, 'ECONOMY');
      assert.equal(capturedBody.placement, 'NORMAL_FEED');
      assert.equal(capturedBody.publicationStatus, 'DRAFT');
      assert.equal(capturedBody.moderationStatus, 'VISIBLE');
    } finally {
      apiClient.post = originalPost;
    }
  });

  await t.test('updatePublicationStatus transitions lifecycle correctly', async () => {
    let capturedUrl = '';
    let capturedBody = null;

    const originalPut = apiClient.put;
    apiClient.put = async (url, body) => {
      capturedUrl = url;
      capturedBody = body;
      return { data: { success: true } };
    };

    try {
      await apiAdminPulseService.updatePublicationStatus(25, {
        publicationStatus: 'SCHEDULED',
        publishedAt: '2026-10-15T12:00:00Z',
      });

      assert.equal(capturedUrl, '/api/v1/admin/pulse/items/25/publication-status');
      assert.equal(capturedBody.publicationStatus, 'SCHEDULED');
      assert.equal(capturedBody.publishedAt, '2026-10-15T12:00:00Z');
    } finally {
      apiClient.put = originalPut;
    }
  });

  await t.test('updatePlacement adjusts placement without duplication', async () => {
    let capturedUrl = '';
    let capturedBody = null;

    const originalPut = apiClient.put;
    apiClient.put = async (url, body) => {
      capturedUrl = url;
      capturedBody = body;
      return { data: { success: true } };
    };

    try {
      await apiAdminPulseService.updatePlacement(30, {
        placement: 'FEATURED_PULSE',
        featuredPriority: 50,
      });

      assert.equal(capturedUrl, '/api/v1/admin/pulse/items/30/placement');
      assert.equal(capturedBody.placement, 'FEATURED_PULSE');
      assert.equal(capturedBody.featuredPriority, 50);
    } finally {
      apiClient.put = originalPut;
    }
  });

  await t.test('updateModerationStatus hides or restores with reason', async () => {
    let capturedUrl = '';
    let capturedBody = null;

    const originalPut = apiClient.put;
    apiClient.put = async (url, body) => {
      capturedUrl = url;
      capturedBody = body;
      return { data: { success: true } };
    };

    try {
      await apiAdminPulseService.updateModerationStatus(30, {
        moderationStatus: 'HIDDEN',
        reason: 'Under investigation for misleading headline',
      });

      assert.equal(capturedUrl, '/api/v1/admin/pulse/items/30/moderation-status');
      assert.equal(capturedBody.moderationStatus, 'HIDDEN');
      assert.equal(capturedBody.reason, 'Under investigation for misleading headline');
    } finally {
      apiClient.put = originalPut;
    }
  });

  await t.test('getAuditLogs fetches audit history list', async () => {
    let capturedUrl = '';
    const originalGet = apiClient.get;
    apiClient.get = async (url) => {
      capturedUrl = url;
      return { data: { success: true, data: [{ id: 1, action: 'CREATED' }] } };
    };

    try {
      const res = await apiAdminPulseService.getAuditLogs(30);
      assert.equal(capturedUrl, '/api/v1/admin/pulse/items/30/audit-logs');
      assert.equal(res.data.length, 1);
    } finally {
      apiClient.get = originalGet;
    }
  });

  await t.test('deleteItem sends DELETE request with reason in payload and params', async () => {
    let capturedUrl = '';
    let capturedConfig = null;

    const originalDelete = apiClient.delete;
    apiClient.delete = async (url, config) => {
      capturedUrl = url;
      capturedConfig = config;
      return { data: { success: true, message: 'Pulse item deleted successfully' } };
    };

    try {
      const res = await apiAdminPulseService.deleteItem(42, 'Obsolete breaking news replaced by newer coverage');
      assert.equal(capturedUrl, '/api/v1/admin/pulse/items/42');
      assert.deepEqual(capturedConfig.data, { reason: 'Obsolete breaking news replaced by newer coverage' });
      assert.deepEqual(capturedConfig.params, { reason: 'Obsolete breaking news replaced by newer coverage' });
      assert.equal(res.success, true);
    } finally {
      apiClient.delete = originalDelete;
    }
  });

  await t.test('deleteItem rejects null or whitespace reason', async () => {
    await assert.rejects(
      async () => {
        await apiAdminPulseService.deleteItem(42, '   ');
      },
      (err) => {
        assert.equal(err.message, 'Deletion reason is required');
        return true;
      }
    );
  });

  await t.test('unwraps server errors from response data', async () => {
    const originalGet = apiClient.get;
    apiClient.get = async () => {
      const err = new Error('Request failed');
      err.response = { data: { success: false, message: 'Source not found' } };
      throw err;
    };

    try {
      await assert.rejects(
        async () => {
          await apiAdminPulseService.getSourceById(999);
        },
        (thrown) => {
          assert.equal(thrown.message, 'Source not found');
          return true;
        }
      );
    } finally {
      apiClient.get = originalGet;
    }
  });
});
