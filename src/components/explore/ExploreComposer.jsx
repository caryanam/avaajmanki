import React, { useState, useRef } from 'react';
import { Image as ImageIcon, Send, X, VenetianMask, User, PenSquare } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { usePosts } from '../../context/PostContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { apiClient } from '../../services/apiClient.js';
import { getMediaUrl } from '../../config/env.js';

export function ExploreComposer({ onNavigate, defaultTopic = 'GENERAL' }) {
  const { currentUser } = useAuth();
  const { createPost } = usePosts();
  const { addToast } = useToast();
  const fileInputRef = useRef(null);

  const [isExpanded, setIsExpanded] = useState(false);
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [selectedTopic, setSelectedTopic] = useState(defaultTopic);
  const [imageUrl, setImageUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const TOPIC_OPTIONS = [
    { id: 'GENERAL', label: 'General' },
    { id: 'LOVE', label: 'Love' },
    { id: 'RELATIONSHIPS', label: 'Relationships' },
    { id: 'LIFE_WORK', label: 'Life & Work' },
    { id: 'MENTAL_HEALTH', label: 'Mental Health' },
    { id: 'FAMILY', label: 'Family' },
    { id: 'PERSONAL_GROWTH', label: 'Personal Growth' },
    { id: 'EDUCATION', label: 'Education' },
    { id: 'FEELINGS', label: 'Feelings' },
    { id: 'SHAYARI', label: 'Shayari & Poetry' },
  ];

  const handleOpenComposer = () => {
    if (!currentUser) {
      addToast('Please login to share your thoughts anonymously.', 'info');
      onNavigate ? onNavigate('/login') : (window.location.href = '/login');
      return;
    }
    setIsExpanded(true);
  };

  const handleTriggerImageClick = (e) => {
    e.stopPropagation();
    if (!currentUser) {
      addToast('Please login to share an image.', 'info');
      onNavigate ? onNavigate('/login') : (window.location.href = '/login');
      return;
    }
    setIsExpanded(true);
    setTimeout(() => {
      fileInputRef.current?.click();
    }, 100);
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
        addToast('Image attached!', 'success');
      } else if (res.data?.imageUrl) {
        setImageUrl(res.data.imageUrl);
        addToast('Image attached!', 'success');
      }
    } catch (err) {
      console.error('Image upload failed:', err);
      addToast('Failed to upload image. Please try again.', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() && !imageUrl) {
      addToast('Please write something or attach an image.', 'error');
      return;
    }
    if (!currentUser) {
      onNavigate ? onNavigate('/login') : (window.location.href = '/login');
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
      setIsExpanded(false);
    } catch (err) {
      console.error('Post creation error:', err);
      addToast(err?.message || 'Could not publish thought.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`explore-quick-composer-card ${isExpanded ? 'expanded' : ''}`}>
      {!isExpanded ? (
        <div
          className="explore-composer-collapsed"
          onClick={handleOpenComposer}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleOpenComposer();
            }
          }}
        >
          {/* Left Avatar Circle */}
          <div className="explore-composer-avatar">
            {currentUser?.avatarUrl ? (
              <img
                src={getMediaUrl(currentUser.avatarUrl)}
                alt="User Avatar"
                className="explore-composer-avatar-img"
              />
            ) : (
              <User size={18} color="#E11D48" />
            )}
          </div>

          {/* Prompt Text Column */}
          <div className="explore-composer-text-block">
            <span className="explore-composer-title">What's on your mind?</span>
            <span className="explore-composer-desc">
              Share your thoughts, ask a question or start a conversation anonymously...
            </span>
          </div>

          {/* Right Action Pills & Send Button */}
          <div className="explore-composer-actions-row">
            <button
              type="button"
              className="explore-composer-pill-btn pill-text"
              onClick={(e) => {
                e.stopPropagation();
                handleOpenComposer();
              }}
              title="Write a text thought"
            >
              <PenSquare size={14} color="#E11D48" />
              <span>Text</span>
            </button>

            <button
              type="button"
              className="explore-composer-pill-btn pill-image"
              onClick={handleTriggerImageClick}
              title="Attach an image"
            >
              <ImageIcon size={14} color="#475569" />
              <span>Image</span>
            </button>

            <button
              type="button"
              className="explore-composer-send-btn"
              onClick={(e) => {
                e.stopPropagation();
                handleOpenComposer();
              }}
              title="Share anonymously"
            >
              <Send size={15} color="#FFFFFF" />
            </button>
          </div>
        </div>
      ) : (
          <form onSubmit={handleSubmit} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Give your thought a headline (optional)..."
              maxLength={120}
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: '10px',
                border: '1px solid #E1DCDB',
                fontSize: '13.5px',
                fontWeight: 600,
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />

            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your thought freely and anonymously..."
              rows={3}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '10px',
                border: '1px solid #E1DCDB',
                fontSize: '13.5px',
                outline: 'none',
                resize: 'vertical',
                boxSizing: 'border-box',
                fontFamily: 'inherit',
              }}
              autoFocus
            />

            {imageUrl && (
              <div style={{ position: 'relative', width: 'fit-content' }}>
                <img
                  src={getMediaUrl(imageUrl)}
                  alt="Attachment preview"
                  style={{ width: '120px', height: '80px', objectFit: 'cover', borderRadius: '10px' }}
                />
                <button
                  type="button"
                  onClick={() => setImageUrl('')}
                  style={{
                    position: 'absolute',
                    top: '-6px',
                    right: '-6px',
                    borderRadius: '50%',
                    background: '#2D1D15',
                    color: '#fff',
                    border: 'none',
                    width: '20px',
                    height: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                  }}
                >
                  <X size={12} />
                </button>
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', paddingTop: '4px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <label
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    cursor: isUploading ? 'wait' : 'pointer',
                    color: 'var(--deep-plum, #6F405F)',
                    fontSize: '12.5px',
                    fontWeight: 700,
                  }}
                >
                  <ImageIcon size={16} />
                  <span>{isUploading ? 'Uploading...' : 'Add Image'}</span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    hidden
                    disabled={isUploading}
                    onChange={handleImageUpload}
                  />
                </label>

                <select
                  value={selectedTopic}
                  onChange={(e) => setSelectedTopic(e.target.value)}
                  style={{
                    padding: '5px 10px',
                    borderRadius: '8px',
                    border: '1px solid #E1DCDB',
                    fontSize: '12px',
                    background: '#FFFFFF',
                    color: '#2D1D15',
                  }}
                >
                  {TOPIC_OPTIONS.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      #{opt.label}
                    </option>
                  ))}
                </select>

                <span style={{ fontSize: '11px', color: '#8C8385', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <VenetianMask size={13} /> Anonymous
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => {
                    setIsExpanded(false);
                    setContent('');
                    setTitle('');
                    setImageUrl('');
                  }}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '9999px',
                    border: '1px solid #CEC7C5',
                    background: 'transparent',
                    fontSize: '12.5px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    color: '#8C8385',
                  }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting || isUploading || (!content.trim() && !imageUrl)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 18px',
                    borderRadius: '9999px',
                    border: 'none',
                    background: 'var(--deep-plum, #6F405F)',
                    color: '#FFFFFF',
                    fontSize: '12.5px',
                    fontWeight: 700,
                    cursor: isSubmitting || (!content.trim() && !imageUrl) ? 'not-allowed' : 'pointer',
                    opacity: isSubmitting || (!content.trim() && !imageUrl) ? 0.6 : 1,
                  }}
                >
                  <Send size={13} />
                  <span>{isSubmitting ? 'Posting...' : 'Post Thought'}</span>
                </button>
              </div>
            </div>
          </form>
        )}
    </div>
  );
}
