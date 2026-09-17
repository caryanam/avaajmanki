import React, { useState, useRef, useEffect } from 'react';
import { ModerationIndicator } from '../common/ModerationIndicator.jsx';
import { Smile, Mic, MicOff, Loader2, Send, X } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { useSpokenLanguage } from '../../hooks/useSpokenLanguage.js';
import { useVoiceRecorder } from '../../hooks/useVoiceRecorder.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { moderationCheck } from '../../utils/moderationCheck.js';

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
      '😬', '😌', '😔', '😪', '😴', '😷', '🤒', '🤕', '🤮', '😎',
      '🥳', '🥸', '🤓', '🧐'
    ],
  },
  {
    name: 'Gestures',
    icon: '👍',
    emojis: [
      '👋', '🤚', '🖐️', '✋', '🖖', '👌', '🤌', '✌️', '🤞', '🤟', '🤘',
      '🤙', '👈', '👉', '👆', '👇', '☝️', '👍', '👎', '✊', '👊', '🤛', '🤜',
      '👏', '🙌', '👐', '🤲', '🤝', '🙏', '✍️', '💅', '💪'
    ],
  },
  {
    name: 'Hearts',
    icon: '❤️',
    emojis: [
      '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '💔', '❣️',
      '💓', '💗', '💖', '💘', '💝', '💌', '😍', '🥰', '😘', '💋'
    ],
  },
];

export function ReplyComposer({ commentId, postId, targetUsername, onSubmit, onCancel }) {
  const { currentLanguage, t } = useLanguage();
  const { currentUser } = useAuth();
  const [spokenLanguage] = useSpokenLanguage();
  const initialTag = targetUsername ? (targetUsername.startsWith('@') ? `${targetUsername} ` : `@${targetUsername} `) : '';
  const [text, setText] = useState(initialTag);
  const [submitting, setSubmitting] = useState(false);
  const [showEmojis, setShowEmojis] = useState(false);
  const [activeCategory, setActiveCategory] = useState(0);
  const inputRef = useRef(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
      const len = inputRef.current.value.length;
      inputRef.current.setSelectionRange(len, len);
    }
  }, []);

  const baseTextRef = useRef(null);

  const handleVoiceTranscription = React.useCallback((transcribedText) => {
    if (baseTextRef.current === null) {
      baseTextRef.current = text;
    }
    const base = baseTextRef.current;
    setText(base ? `${base} ${transcribedText}` : transcribedText);
  }, [text]);

  const { isRecording, isTranscribing, bindMicProps } = useVoiceRecorder(handleVoiceTranscription, spokenLanguage);

  useEffect(() => {
    if (!isRecording && !isTranscribing) {
      baseTextRef.current = null;
    }
  }, [isRecording, isTranscribing]);

  const minLength = 2;
  const maxLength = 1000;
  const isValid = text.trim().length >= minLength && text.length <= maxLength;
  const modCheck = moderationCheck(text);
  const isBlocked = modCheck.status === 'BLOCKED';

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!isValid || isBlocked || submitting) return;

    setSubmitting(true);
    try {
      await onSubmit(text.trim());
      setText('');
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

  return (
    <form onSubmit={handleSubmit} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '4px', position: 'relative' }}>
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
        {/* Left Emoji Trigger Button */}
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

        {/* Multiline Text Field */}
        <textarea
          ref={inputRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={t('writeReplyPlaceholder', 'Write a reply...')}
          maxLength={maxLength}
          rows={1}
          disabled={submitting}
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

        {/* Right Icons: Cancel X + Mic (Press & Hold) + Send Arrow */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              title="Cancel reply"
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: '4px',
                borderRadius: '50%',
                color: '#8C8385',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <X size={16} />
            </button>
          )}

          <button
            type="button"
            {...bindMicProps}
            disabled={isTranscribing}
            title={isRecording ? 'Release to stop recording' : 'Hold microphone to speak'}
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

          <button
            type="submit"
            disabled={!isValid || isBlocked || submitting}
            title="Post reply"
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: (!isValid || isBlocked || submitting) ? '#E5E0DF' : '#6F405F',
              color: (!isValid || isBlocked || submitting) ? '#A59B98' : '#FFFFFF',
              border: 'none',
              cursor: (!isValid || isBlocked || submitting) ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.15s ease',
              boxShadow: isValid ? '0 2px 8px rgba(111,64,95,0.25)' : 'none',
            }}
          >
            {submitting ? <Loader2 size={15} className="spin-animation" /> : <Send size={15} style={{ marginLeft: '1px' }} />}
          </button>
        </div>
      </div>

      {/* Emoji Picker Popover */}
      {showEmojis && (
        <div
          style={{
            position: 'absolute',
            bottom: '46px',
            left: '12px',
            zIndex: 100,
            background: '#FFFFFF',
            borderRadius: '16px',
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.18)',
            border: '1.5px solid #EAE4E4',
            padding: '10px',
            width: '280px',
            animation: 'fadeIn 0.15s ease',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #EAE4E4', paddingBottom: '6px', marginBottom: '8px' }}>
            <div style={{ display: 'flex', gap: '4px' }}>
              {EMOJI_CATEGORIES.map((cat, idx) => (
                <button
                  key={cat.name}
                  type="button"
                  onClick={() => setActiveCategory(idx)}
                  style={{
                    background: activeCategory === idx ? '#F3EBF0' : 'transparent',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '4px 6px',
                    cursor: 'pointer',
                    fontSize: '14px',
                  }}
                >
                  {cat.icon}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setShowEmojis(false)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8C8385', padding: '2px' }}
            >
              <X size={14} />
            </button>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              gap: '4px',
              maxHeight: '160px',
              overflowY: 'auto',
            }}
          >
            {EMOJI_CATEGORIES[activeCategory].emojis.map((emoji, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleEmojiClick(emoji)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '18px',
                  cursor: 'pointer',
                  padding: '4px',
                  borderRadius: '6px',
                  transition: 'transform 0.1s ease, background-color 0.1s ease',
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F3EBF0'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
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
