import React, { useState } from 'react';
import { ModerationIndicator } from '../common/ModerationIndicator.jsx';
import { Smile, AlertCircle, ImagePlus, Mic, MicOff, Loader2, X, Send } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { useComments } from '../../context/CommentContext.jsx';
import { useVoiceRecorder } from '../../hooks/useVoiceRecorder.js';
import { useSpokenLanguage } from '../../hooks/useSpokenLanguage.js';
import { moderationCheck } from '../../utils/moderationCheck.js';
import { apiClient } from '../../services/apiClient.js';
import { getMediaUrl } from '../../config/env.js';

// WhatsApp-style categorized emoji collection
const EMOJI_CATEGORIES = [
  {
    name: 'Popular',
    icon: '🔥',
    emojis: ['😊', '❤️', '🔥', '👍', '🙏', '💡', '🤝', '💯', '🌸', '✨', '👏', '😍', '🤣', '🎉', '🚀', '🙌'],
  },
  {
    name: 'Smileys',
    icon: '😀',
    emojis: [
      '😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '😉', '😊', '😇',
      '🥰', '😍', '🤩', '😘', '😗', '😚', '😋', '😛', '😜', '🤪', '😝', '🤑',
      '🤗', '🤭', '🤫', '🤔', '🤐', '🤨', '😐', '😑', '😶', '😏', '😒', '🙄',
      '😬', '<ctrl42>', '😌', '😔', '😪', '😴', '😷', '🤒', '🤕', '<ctrl42>', '🤮', '😎',
      '🥳', '🥸', '🤓', '🧐'
    ],
  },
  {
    name: 'Gestures',
    icon: '👍',
    emojis: [
      '👋', '🤚', '🖐️', '✋', '🖖', '👌', '🤌', '🤏', '✌️', '🤞', '🤟', '🤘',
      '🤙', '👈', '👉', '👆', '👇', '☝️', '👍', '👎', '✊', '👊', '🤛', '🤜',
      '👏', '🙌', '👐', '🤲', '🤝', '🙏', '✍️', '💅', '<ctrl42>', '💪'
    ],
  },
  {
    name: 'Hearts',
    icon: '❤️',
    emojis: [
      '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '<ctrl42>', '💔', '❣️', '<ctrl42>',
      '<ctrl42>', '💓', '💗', '💖', '💘', '💝', '<ctrl42>', '💌', '😍', '🥰', '😘', '💋'
    ],
  },
  {
    name: 'Party & Objects',
    icon: '🎉',
    emojis: [
      '✨', '🔥', '🎉', '<ctrl42>', '🎁', '🎈', '⭐', '🌟', '💫', '💥', '💯', '🚀',
      '🏆', '<ctrl42>', '🎯', '💡', '📚', '☕', '🍰', '🍕', '🌸', '🌹', '🌺', '🌱'
    ],
  },
];

export function CommentComposer({
  postId,
  postAuthorUsername,
  onSubmit,
  onCancel,
  initialText = '',
  placeholder = 'Write a comment...',
  onNavigate,
  autoFocus = false,
  enableImage = false,
}) {
  const [text, setText] = useState(initialText);
  const [submitting, setSubmitting] = useState(false);
  const [showEmojis, setShowEmojis] = useState(false);
  const [activeCategoryIndex, setActiveCategoryIndex] = useState(0);
  const [imageUrl, setImageUrl] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const { currentUser } = useAuth();
  const { addToast } = useToast();
  const { currentLanguage, t } = useLanguage();
  const { activeReplyCommentId } = useComments();
  const [spokenLanguage] = useSpokenLanguage();
  const inputRef = React.useRef(null);

  if (activeReplyCommentId) {
    return null;
  }



  React.useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  const baseTextRef = React.useRef(null);

  const handleVoiceTranscription = React.useCallback((transcribedText) => {
    if (baseTextRef.current === null) {
      baseTextRef.current = text;
    }
    const base = baseTextRef.current;
    setText(base ? `${base} ${transcribedText}` : transcribedText);
  }, [text]);

  const { isRecording, isTranscribing, bindMicProps } = useVoiceRecorder(handleVoiceTranscription, spokenLanguage);

  React.useEffect(() => {
    if (!isRecording && !isTranscribing) {
      baseTextRef.current = null;
    }
  }, [isRecording, isTranscribing]);

  const minLength = 2;
  const maxLength = 1000;
  const hasValidText = text.trim().length >= minLength && text.length <= maxLength;
  const isValid = hasValidText || (enableImage && Boolean(imageUrl));

  const modCheck = moderationCheck(text);
  const isBlocked = modCheck.status === 'BLOCKED';

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!isValid || isBlocked || submitting) return;

    if (currentUser?.status === 'COMMENT_RESTRICTED') {
      addToast(`Comment restricted: ${currentUser.restrictionReason || 'Account restricted.'}`, 'error');
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit(text.trim(), imageUrl || null);
      setText('');
      setImageUrl('');
      setShowEmojis(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEmojiClick = (emoji) => {
    setText((prev) => prev + emoji);
  };

  const handleImage = async (file) => {
    if (!file) return;
    setUploadingImage(true);
    try {
      const body = new FormData();
      body.append('file', file);
      const response = await apiClient.post('/api/upload/image', body, { headers: { 'Content-Type': 'multipart/form-data' } });
      setImageUrl(response.data?.data?.imageUrl || '');
    } catch (error) {
      addToast(error?.response?.data?.message || t('imageUploadFailed', 'Failed to upload image.'), 'error');
    } finally { setUploadingImage(false); }
  };

  return (
    <form onSubmit={handleSubmit} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '6px' }}>
      {currentUser?.status === 'COMMENT_RESTRICTED' && (
        <div
          style={{
            background: 'var(--warning-bg)',
            color: 'var(--warning)',
            borderRadius: '8px',
            padding: '8px 12px',
            fontSize: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <AlertCircle size={15} />
          <span>Account Restricted: {currentUser.restrictionReason || 'Community violation'}.</span>
        </div>
      )}

      {/* Multiline comment composer. Posting is intentionally limited to the send button. */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          backgroundColor: '#FFFFFF',
          borderRadius: '24px',
          border: isBlocked ? '1.5px solid var(--error)' : '1.5px solid #6F405F',
          padding: '4px 6px 4px 12px',
          boxShadow: '0 2px 10px rgba(111, 64, 95, 0.08)',
          transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
        }}
      >
        {/* Left Icon: Emoji Trigger Button */}
        <button
          type="button"
          onClick={() => setShowEmojis(!showEmojis)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '4px',
            color: showEmojis ? '#6F405F' : '#8C8385',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
          title="Choose Emoji"
        >
          <Smile size={18} />
        </button>

        {/* Middle: Multiline Text Field */}
        <textarea
          ref={inputRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={t('writeCommentPlaceholder', placeholder)}
          maxLength={maxLength}
          rows={1}
          disabled={submitting || currentUser?.status === 'COMMENT_RESTRICTED'}
          style={{
            flex: 1,
            minWidth: 0,
            minHeight: '24px',
            maxHeight: '120px',
            border: 'none',
            background: 'transparent',
            fontSize: '13.5px',
            color: '#2D1D15',
            outline: 'none',
            fontFamily: 'var(--font-sans)',
            lineHeight: 1.45,
            resize: 'vertical',
            padding: '3px 0',
          }}
        />

        {/* Right Icons: Mic + Circular Send Arrow Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
          {enableImage && <label title={t('attachImage', 'Attach image')} style={{ background: 'transparent', border: 'none', cursor: uploadingImage ? 'wait' : 'pointer', padding: 6, color: imageUrl ? '#D96C3D' : '#6F405F', display: 'flex', borderRadius: '50%' }}>
            {uploadingImage ? <Loader2 size={16} className="spin-animation" /> : <ImagePlus size={17} />}
            <input type="file" accept="image/*" hidden disabled={uploadingImage} onChange={(event) => handleImage(event.target.files?.[0])} />
          </label>}
          {/* Microphone Button */}
          <button
            type="button"
            {...bindMicProps}
            disabled={isTranscribing || currentUser?.status === 'COMMENT_RESTRICTED'}
            title={isRecording ? 'Release or click to finish' : 'Tap or hold microphone to speak'}
            style={{
              background: isRecording ? '#FFEBEB' : 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '50%',
              color: isRecording ? '#B33A3A' : '#6F405F',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {isTranscribing ? <Loader2 size={16} className="spin-animation" /> : isRecording ? <MicOff size={16} /> : <Mic size={16} />}
          </button>

          {/* Send Arrow Button */}
          <button
            type="submit"
            disabled={!isValid || isBlocked || submitting || uploadingImage || currentUser?.status === 'COMMENT_RESTRICTED'}
            title="Post comment"
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: (!isValid || isBlocked || submitting || currentUser?.status === 'COMMENT_RESTRICTED') ? '#E5E0DF' : '#6F405F',
              color: (!isValid || isBlocked || submitting || currentUser?.status === 'COMMENT_RESTRICTED') ? '#A59B98' : '#FFFFFF',
              border: 'none',
              cursor: (!isValid || isBlocked || submitting || currentUser?.status === 'COMMENT_RESTRICTED') ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.15s ease',
              boxShadow: isValid ? '0 2px 8px rgba(111,64,95,0.25)' : 'none',
            }}
          >
            {submitting ? <Loader2 size={14} className="spin-animation" /> : <Send size={14} />}
          </button>
        </div>
      </div>

      {enableImage && imageUrl && <div style={{ position: 'relative', width: 86, marginLeft: 12 }}><img src={getMediaUrl(imageUrl)} alt={t('imagePreview', 'Image preview')} style={{ width: 86, height: 62, objectFit: 'cover', borderRadius: 9 }} /><button type="button" onClick={() => setImageUrl('')} aria-label={t('removeImage', 'Remove image')} style={{ position: 'absolute', right: -6, top: -6, border: 0, borderRadius: '50%', background: '#2D1D15', color: '#fff', display: 'flex', padding: 3 }}><X size={12} /></button></div>}

      {/* Moderation Warning Indicator */}
      <ModerationIndicator text={text} />

      {/* WhatsApp-Style Rich Categorized Emoji Picker */}
      {showEmojis && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            padding: '8px',
            background: '#FFFFFF',
            borderRadius: '12px',
            border: '1.5px solid #E5E0DF',
            boxShadow: '0 4px 16px rgba(45,29,21,0.08)',
          }}
        >
          {/* Category Tabs */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #EDE8E6', paddingBottom: '6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', overflowX: 'auto' }}>
              {EMOJI_CATEGORIES.map((cat, idx) => (
                <button
                  key={cat.name}
                  type="button"
                  onClick={() => setActiveCategoryIndex(idx)}
                  style={{
                    padding: '3px 6px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    background: activeCategoryIndex === idx ? 'rgba(111,64,95,0.12)' : 'transparent',
                    border: activeCategoryIndex === idx ? '1px solid #6F405F' : 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                  title={cat.name}
                >
                  <span>{cat.icon}</span>
                  <span style={{ fontSize: '11px', fontWeight: activeCategoryIndex === idx ? 700 : 500, color: activeCategoryIndex === idx ? '#6F405F' : '#6E625F' }}>
                    {cat.name}
                  </span>
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setShowEmojis(false)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', color: '#8C8385' }}
            >
              <X size={16} />
            </button>
          </div>

          {/* Emoji Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(28px, 1fr))',
              gap: '4px',
              maxHeight: '130px',
              overflowY: 'auto',
              padding: '4px 0',
            }}
          >
            {EMOJI_CATEGORIES[activeCategoryIndex].emojis.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => handleEmojiClick(emoji)}
                style={{
                  fontSize: '17px',
                  padding: '3px',
                  borderRadius: '6px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'transform 0.1s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.25)')}
                onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}
    </form>
  );
}
