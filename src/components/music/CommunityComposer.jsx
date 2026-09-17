import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Trash2, Music, Send, LoaderCircle, CheckCircle2, AlertCircle } from 'lucide-react';
import { encodeAudioBufferToWav } from '../../utils/wavEncoder.js';
import { apiPostService } from '../../services/apiPostService.js';
import { WaveformPlayer } from './WaveformPlayer.jsx';
import { InitialAvatar } from './InitialAvatar.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

function formatTimer(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
}

export function CommunityComposer({ onPostPublished, onOpenSongUpload }) {
  const { currentUser } = useAuth();
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [voiceBlob, setVoiceBlob] = useState(null);
  const [voiceUrl, setVoiceUrl] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerIntervalRef = useRef(null);
  const audioContextRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (voiceUrl) URL.revokeObjectURL(voiceUrl);
      if (audioContextRef.current) audioContextRef.current.close();
    };
  }, [voiceUrl]);

  // Start Voice Recording
  const startRecording = async () => {
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());
        const rawBlob = new Blob(audioChunksRef.current, { type: mediaRecorder.mimeType || 'audio/webm' });

        try {
          // Decode raw audio & convert to standard PCM WAV binary
          const arrayBuffer = await rawBlob.arrayBuffer();
          const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
          audioContextRef.current = audioCtx;
          const decodedAudio = await audioCtx.decodeAudioData(arrayBuffer);
          const wavBlob = encodeAudioBufferToWav(decodedAudio);
          const wavFileUrl = URL.createObjectURL(wavBlob);

          setVoiceBlob(wavBlob);
          setVoiceUrl(wavFileUrl);
        } catch (err) {
          console.warn('WAV conversion fallback, using raw blob:', err);
          setVoiceBlob(rawBlob);
          setVoiceUrl(URL.createObjectURL(rawBlob));
        }
      };

      mediaRecorder.start(100);
      setIsRecording(true);
      setRecordSeconds(0);

      timerIntervalRef.current = setInterval(() => {
        setRecordSeconds((prev) => {
          if (prev >= 299) {
            stopRecording();
            return 300;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (err) {
      setErrorMessage('Microphone access denied or audio recording failed.');
    }
  };

  // Stop Voice Recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    }
  };

  // Discard Recorded Voice Note
  const discardRecording = () => {
    if (voiceUrl) URL.revokeObjectURL(voiceUrl);
    setVoiceBlob(null);
    setVoiceUrl(null);
    setRecordSeconds(0);
  };

  // Submit Post or Voice Note
  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!voiceBlob) {
      setErrorMessage('Music community accepts voice notes and songs only. Please record a voice note or use Upload Song.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      // Publish Voice Note Post
      const formData = new FormData();
      const file = new File([voiceBlob], 'recording.wav', { type: 'audio/wav' });
      formData.append('file', file);
      if (title.trim()) formData.append('title', title.trim());
      if (content.trim()) formData.append('caption', content.trim());
      formData.append('topic', 'MUSIC');
      formData.append('mood', 'NEUTRAL');
      formData.append('isMusicCommunity', 'true');

      await apiPostService.publishVoiceNote(formData);
      setSuccessMessage('Voice note published successfully!');

      setContent('');
      setTitle('');
      discardRecording();
      if (onPostPublished) onPostPublished();
    } catch (err) {
      const message = err?.message || err?.userMessage || 'Failed to publish voice note. Please try again.';
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="community-composer-card">
      <form onSubmit={handleSubmit}>
        <div className="composer-input-wrapper">
          <InitialAvatar
            className="composer-author-avatar"
            name={currentUser?.username || currentUser?.fullName}
            src={currentUser?.avatarUrl || currentUser?.avatar}
          />
          <textarea
            className="composer-textarea"
            rows={2}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Record a voice note or add a caption for your music..."
            disabled={isSubmitting}
          />
        </div>

        {/* Live Recording Counter Bar */}
        {isRecording && (
          <div className="composer-recording-bar">
            <div className="recording-pulse" />
            <span className="recording-timer">Recording: {formatTimer(recordSeconds)}</span>
            <button className="composer-stop-btn" type="button" onClick={stopRecording}>
              <Square size={14} fill="currentColor" /> Stop
            </button>
          </div>
        )}

        {/* Recorded Voice Preview */}
        {voiceBlob && (
          <div className="composer-voice-preview">
            <WaveformPlayer audioUrl={voiceUrl} durationSeconds={recordSeconds} title={title || 'Voice Note Preview'} />
            <button className="composer-discard-btn" type="button" onClick={discardRecording} title="Discard recording">
              <Trash2 size={16} />
            </button>
          </div>
        )}

        {/* Error / Success Notifications */}
        {errorMessage && (
          <div className="composer-alert composer-alert-error">
            <AlertCircle size={16} /> {errorMessage}
          </div>
        )}
        {successMessage && (
          <div className="composer-alert composer-alert-success">
            <CheckCircle2 size={16} /> {successMessage}
          </div>
        )}

        {/* Action Controls Footer */}
        <div className="composer-actions-bar">
          <div className="composer-actions-left">
            {!isRecording && !voiceBlob && (
              <button
                className="composer-tool-btn active-tool"
                type="button"
                onClick={startRecording}
                disabled={isSubmitting}
                title="Record voice note"
              >
                <Mic size={18} /> Record Voice Note
              </button>
            )}

            <button
              className="composer-tool-btn"
              type="button"
              onClick={onOpenSongUpload}
              disabled={isSubmitting || Boolean(voiceBlob)}
              title={voiceBlob ? 'Cannot attach song upload and voice note simultaneously' : 'Upload community song'}
            >
              <Music size={18} /> Upload Song
            </button>
          </div>

          <button
            className="composer-submit-btn"
            type="submit"
            disabled={isSubmitting || isRecording || !voiceBlob}
          >
            {isSubmitting ? (
              <>
                <LoaderCircle className="music-spin" size={16} /> Publishing...
              </>
            ) : (
              <>
                <Send size={16} /> Publish Voice Note
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
