import React, { useState, useEffect, useMemo } from 'react';
import { 
  Image as ImageIcon, Mic, Compass, Smile, ArrowRight, VenetianMask, X, ChevronDown 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { usePosts } from '../../context/PostContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { apiClient } from '../../services/apiClient.js';
import { apiTopicService } from '../../services/apiTopicService.js';
import { getMediaUrl } from '../../config/env.js';
import avatarSilhouette from '../../assets/home/avatar-silhouette.jpg';

export function PostComposer({ onNavigate, defaultTopic = 'GENERAL' }) {
  const { currentUser } = useAuth();
  const { createPost } = usePosts();
  const { addToast } = useToast();
  const { t } = useLanguage();

  const [isExpanded, setIsExpanded] = useState(false);
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [selectedTopic, setSelectedTopic] = useState(defaultTopic);
  const [imageUrl, setImageUrl] = useState('');
  const [selectedMood, setSelectedMood] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customTopics, setCustomTopics] = useState([]);

  useEffect(() => {
    let mounted = true;
    apiTopicService.getTopics()
      .then((items) => {
        if (mounted && Array.isArray(items)) {
          setCustomTopics(items);
        }
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  const TOPIC_OPTIONS = useMemo(() => {
    const base = [
      'GENERAL', 'LIFE_WORK', 'FEELINGS', 'SOCIETY_POLITICS', 
      'ENTERTAINMENT', 'SPORTS', 'SHAYARI', 'LOVE', 'MOTIVATION', 'MENTAL_HEALTH'
    ];
    const baseSet = new Set(base);
    const customNames = customTopics
      .map((ct) => String(ct.name || '').toUpperCase().trim())
      .filter((name) => name && !baseSet.has(name));
    return [...base, ...customNames];
  }, [customTopics]);

  const MOOD_OPTIONS = ['😊 Happy', '🌿 Peaceful', '🔥 Energized', '💔 Reflective', '☕ Chill'];

  const handleOpenComposer = () => {
    if (!currentUser) {
      addToast(t('toast.pleaseLoginToShare', 'Please login to share your thoughts anonymously.'), 'info');
      onNavigate('/login');
      return;
    }
    setIsExpanded(true);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await apiClient.post('/api/upload/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data?.success && res.data?.data?.imageUrl) {
        setImageUrl(res.data.data.imageUrl);
        addToast(t('toast.imageAttached', 'Image attached!'), 'success');
      } else if (res.data?.imageUrl) {
        setImageUrl(res.data.imageUrl);
        addToast(t('toast.imageAttached', 'Image attached!'), 'success');
      }
    } catch (err) {
      console.error('Image upload failed:', err);
      addToast(t('toast.imageUploadFailed', 'Failed to upload image. Please try again.'), 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() && !imageUrl) {
      addToast(t('toast.pleaseWriteSomething', 'Please write something or attach an image.'), 'error');
      return;
    }
    if (!currentUser) {
      onNavigate('/login');
      return;
    }

    setIsSubmitting(true);
    try {
      await createPost({
        title: title.trim() || undefined,
        content: content.trim(),
        topic: selectedTopic,
        imageUrl: imageUrl || undefined,
        postType: imageUrl ? 'IMAGE' : 'TEXT',
      });
      setContent('');
      setTitle('');
      setImageUrl('');
      setSelectedMood('');
      setIsExpanded(false);
    } catch (err) {
      console.error('Post creation error:', err);
      addToast(err?.message || t('toast.couldNotPublish', 'Could not publish post.'), 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="post-composer-card">
      {/* Top Input Row */}
      <div className="composer-top-row">
        <div className="composer-avatar">
          <img 
            src={currentUser?.avatarUrl ? getMediaUrl(currentUser.avatarUrl) : avatarSilhouette} 
            alt="User Avatar" 
            onError={(e) => { e.currentTarget.src = avatarSilhouette; }}
          />
        </div>

        {!isExpanded ? (
          <button
            type="button"
            className="composer-input-trigger" data-testid="post-composer-trigger"
            onClick={handleOpenComposer}
          >
            {t('post.whatsOnYourMind', "What's on your mind today?")}
          </button>
        ) : (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <input
              type="text"
              placeholder={t('post.titleOptional', 'Title (optional)...')}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 14px',
                borderRadius: '10px',
                border: '1.5px solid var(--border-color)',
                fontSize: '13.5px',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
            <textarea
              rows={3}
              placeholder={t('post.whatsOnYourMindPlaceholder', "What's on your mind today? Write freely and anonymously...")}
              data-testid="post-composer-input"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              autoFocus
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '12px',
                border: '1.5px solid var(--border-color)',
                fontSize: '14px',
                outline: 'none',
                resize: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>
        )}

        <div className="composer-anon-pill" title={t('post.postedAnonymously', 'Posted Anonymously')}>
          <VenetianMask size={14} color="#0F172A" />
          <span>{t('post.anonymous', 'Anonymous')}</span>
          <ChevronDown size={12} color="#64748B" />
        </div>
      </div>

      {/* Expanded Attachment Previews */}
      {isExpanded && (
        <>
          {/* Attached Image Preview */}
          {imageUrl && (
            <div style={{ position: 'relative', width: 'fit-content' }}>
              <img
                src={getMediaUrl(imageUrl)}
                alt="Attached Preview"
                style={{ height: '90px', borderRadius: '10px', objectFit: 'cover', border: '1px solid var(--border-color)' }}
              />
              <button
                type="button"
                onClick={() => setImageUrl('')}
                style={{
                  position: 'absolute', top: -6, right: -6,
                  background: '#EF4444', color: '#FFF', border: 'none',
                  borderRadius: '50%', width: '20px', height: '20px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                <X size={12} />
              </button>
            </div>
          )}

          {/* Topic & Mood Selectors */}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
            <select
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              style={{
                padding: '6px 12px',
                borderRadius: '12px',
                border: '1px solid var(--border-color)',
                fontSize: '12.5px',
                background: '#F8FAFC',
                fontWeight: 600,
                color: 'var(--text-primary)',
              }}
            >
              {TOPIC_OPTIONS.map((t) => (
                <option key={t} value={t}>#{t}</option>
              ))}
            </select>

            <select
              value={selectedMood}
              onChange={(e) => setSelectedMood(e.target.value)}
              style={{
                padding: '6px 12px',
                borderRadius: '12px',
                border: '1px solid var(--border-color)',
                fontSize: '12.5px',
                background: '#F8FAFC',
                color: 'var(--text-secondary)',
              }}
            >
              <option value="">{t('post.moodNone', 'Mood: None')}</option>
              {MOOD_OPTIONS.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
        </>
      )}

      {/* Bottom Action Buttons */}
      <div className="composer-bottom-actions">
        <div className="composer-tools-group">
          {/* Add Photo */}
          <label className="composer-tool-btn" style={{ margin: 0 }}>
            <ImageIcon size={16} color="#3B82F6" />
            <span>{isUploading ? t('post.uploading', 'Uploading...') : t('post.addPhoto', 'Add Photo')}</span>
            <input
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleImageUpload}
              disabled={isUploading}
            />
          </label>

          {/* Voice Note */}
          <button
            type="button"
            className="composer-tool-btn"
            onClick={() => {
              handleOpenComposer();
              addToast('Voice Note recorder activated. Type or speak your thoughts.', 'info');
            }}
          >
            <Mic size={16} color="#EC4899" />
            <span>{t('post.voiceNote', 'Voice Note')}</span>
          </button>

          {/* Choose Topic */}
          <button
            type="button"
            className="composer-tool-btn"
            onClick={handleOpenComposer}
          >
            <Compass size={16} color="#10B981" />
            <span>{t('post.chooseTopic', 'Choose Topic')}</span>
          </button>

          {/* Add Mood */}
          <button
            type="button"
            className="composer-tool-btn"
            onClick={handleOpenComposer}
          >
            <Smile size={16} color="#F59E0B" />
            <span>{t('post.addMood', 'Add Mood')}</span>
          </button>
        </div>

        {/* Post Submit Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {isExpanded && (
            <button
              type="button"
              onClick={() => setIsExpanded(false)}
              style={{
                background: 'none', border: 'none', color: 'var(--text-muted)',
                fontSize: '12.5px', cursor: 'pointer', padding: '6px 10px',
              }}
            >
              {t('post.cancel', 'Cancel')}
            </button>
          )}

          <button
            type="button"
            className="composer-submit-btn" data-testid="post-submit"
            onClick={isExpanded ? handleSubmit : handleOpenComposer}
            disabled={isSubmitting}
          >
            <span>{isSubmitting ? t('post.posting', 'Posting...') : t('post.post', 'Post')}</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
