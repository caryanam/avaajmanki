import React, { useState, useEffect } from 'react';
import { Modal } from '../../common/Modal.jsx';
import { Sparkles, Calendar, Image as ImageIcon, Save, CheckCircle, Clock } from 'lucide-react';
import { apiAdminPulseService } from '../../../services/apiAdminPulseService.js';
import { useToast } from '../../../context/ToastContext.jsx';

const TOPIC_OPTIONS = [
  'GENERAL',
  'POLITICS',
  'TECHNOLOGY',
  'ECONOMY',
  'CULTURE',
  'SCIENCE',
  'WORLD',
  'LOCAL',
  'ENTERTAINMENT',
  'SPORTS',
];

export function PulseItemEditorModal({
  isOpen,
  onClose,
  itemToEdit = null,
  onSuccess,
}) {
  const { addToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form Fields
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [topic, setTopic] = useState('GENERAL');
  const [subtopic, setSubtopic] = useState('');
  const [sourceName, setSourceName] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [placement, setPlacement] = useState('FEATURED_PULSE');
  const [publicationStatus, setPublicationStatus] = useState('PUBLISHED');
  const [scheduledTime, setScheduledTime] = useState('');
  const [featuredPriority, setFeaturedPriority] = useState(10);
  const [promotionEndTime, setPromotionEndTime] = useState('');

  const isEditing = Boolean(itemToEdit && itemToEdit.id);

  useEffect(() => {
    if (itemToEdit) {
      setTitle(itemToEdit.title || '');
      setSummary(itemToEdit.summary || '');
      setContent(itemToEdit.content || '');
      setTopic(itemToEdit.topic || 'GENERAL');
      setSubtopic(itemToEdit.subtopic || '');
      setSourceName(itemToEdit.sourceName || '');
      setSourceUrl(itemToEdit.sourceUrl || '');
      setImageUrl(itemToEdit.imageUrl || '');
      setPlacement(itemToEdit.placement || 'FEATURED_PULSE');
      setPublicationStatus(itemToEdit.publicationStatus || 'PUBLISHED');
      setFeaturedPriority(itemToEdit.featuredPriority ?? 10);
      setScheduledTime(
        itemToEdit.publicationStatus === 'SCHEDULED' && itemToEdit.publishedAt
          ? new Date(itemToEdit.publishedAt).toISOString().slice(0, 16)
          : ''
      );
      setPromotionEndTime(
        itemToEdit.promotionEndTime
          ? new Date(itemToEdit.promotionEndTime).toISOString().slice(0, 16)
          : ''
      );
    } else {
      // Defaults for new item
      setTitle('');
      setSummary('');
      setContent('');
      setTopic('GENERAL');
      setSubtopic('');
      setSourceName('Mann Ki Aawaj Editorial');
      setSourceUrl('');
      setImageUrl('');
      setPlacement('FEATURED_PULSE');
      setPublicationStatus('PUBLISHED');
      setScheduledTime('');
      setFeaturedPriority(10);
      setPromotionEndTime('');
    }
  }, [itemToEdit, isOpen]);

  const handleSubmit = async (submitStatusOverride) => {
    const finalPublicationStatus = submitStatusOverride || publicationStatus;

    if (!title.trim()) {
      addToast('Headline title is required.', 'error');
      return;
    }
    if (finalPublicationStatus === 'SCHEDULED' && !scheduledTime) {
      addToast('Please specify a scheduled publication date and time.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      if (isEditing) {
        // 1. Update content attributes
        const updatePayload = {
          title: title.trim(),
          summary: summary.trim() || null,
          content: content.trim() || null,
          sourceName: sourceName.trim() || null,
          sourceUrl: sourceUrl.trim() || null,
          imageUrl: imageUrl.trim() || null,
          topic: topic.trim() || 'GENERAL',
          subtopic: subtopic.trim() || null,
        };
        await apiAdminPulseService.updateItem(itemToEdit.id, updatePayload);

        // 2. Update publication status if changed
        if (finalPublicationStatus !== itemToEdit.publicationStatus || scheduledTime) {
          await apiAdminPulseService.updatePublicationStatus(itemToEdit.id, {
            publicationStatus: finalPublicationStatus,
            publishedAt: scheduledTime ? new Date(scheduledTime).toISOString() : null,
          });
        }

        // 3. Update placement if changed
        if (
          placement !== itemToEdit.placement ||
          featuredPriority !== itemToEdit.featuredPriority ||
          promotionEndTime
        ) {
          await apiAdminPulseService.updatePlacement(itemToEdit.id, {
            placement,
            featuredPriority: Number(featuredPriority) || 0,
            promotionEndTime: promotionEndTime ? new Date(promotionEndTime).toISOString() : null,
          });
        }

        addToast('Pulse discussion updated successfully.', 'success');
      } else {
        // Create new item
        const createPayload = {
          title: title.trim(),
          summary: summary.trim() || null,
          content: content.trim() || null,
          sourceName: sourceName.trim() || null,
          sourceUrl: sourceUrl.trim() || null,
          imageUrl: imageUrl.trim() || null,
          topic: topic.trim() || 'GENERAL',
          subtopic: subtopic.trim() || null,
          publicationStatus: finalPublicationStatus,
          placement,
          moderationStatus: 'VISIBLE',
          featuredPriority: Number(featuredPriority) || 0,
          publishedAt: scheduledTime ? new Date(scheduledTime).toISOString() : null,
          promotionEndTime: promotionEndTime ? new Date(promotionEndTime).toISOString() : null,
        };
        await apiAdminPulseService.createItem(createPayload);
        addToast(
          finalPublicationStatus === 'DRAFT'
            ? 'Pulse draft saved successfully.'
            : finalPublicationStatus === 'SCHEDULED'
            ? 'Pulse discussion scheduled for publication.'
            : 'Pulse discussion published to community successfully.',
          'success'
        );
      }

      onSuccess?.();
      onClose();
    } catch (err) {
      const msg = err?.message || err?.error || 'Failed to save Pulse discussion. Please check inputs.';
      addToast(msg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? `Edit Discussion: #${itemToEdit.id}` : 'Create New Pulse Discussion'}
      maxWidth="860px"
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
        style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}
      >
        {/* Title */}
        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--eclipse, #2D1D15)', marginBottom: '4px' }}>
            Discussion Headline *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Major Renewable Energy Bill Passed in Parliament"
            maxLength={500}
            required
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: '8px',
              border: '1px solid var(--border-light, #E1DCDB)',
              fontSize: '14px',
              fontWeight: 600,
            }}
          />
        </div>

        {/* Summary (Seed for Takes & Discussion) */}
        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--eclipse, #2D1D15)', marginBottom: '4px' }}>
            Summary / Discussion Prompt
          </label>
          <textarea
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            rows={3}
            placeholder="Concise overview or editorial context prompting opinions..."
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: '8px',
              border: '1px solid var(--border-light, #E1DCDB)',
              fontSize: '13px',
              fontFamily: 'inherit',
              resize: 'vertical',
            }}
          />
        </div>

        {/* Extended Content / Article Body */}
        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--eclipse, #2D1D15)', marginBottom: '4px' }}>
            Extended Editorial Content (Optional)
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={4}
            placeholder="Additional context, bullet points, key facts, or questions for readers..."
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: '8px',
              border: '1px solid var(--border-light, #E1DCDB)',
              fontSize: '13px',
              fontFamily: 'inherit',
              resize: 'vertical',
            }}
          />
        </div>

        {/* Topic & Subtopic */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--eclipse, #2D1D15)', marginBottom: '4px' }}>
              Primary Topic *
            </label>
            <select
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: '8px',
                border: '1px solid var(--border-light, #E1DCDB)',
                fontSize: '13px',
                backgroundColor: '#fff',
              }}
            >
              {TOPIC_OPTIONS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--eclipse, #2D1D15)', marginBottom: '4px' }}>
              Subtopic / Custom Tag
            </label>
            <input
              type="text"
              value={subtopic}
              onChange={(e) => setSubtopic(e.target.value)}
              placeholder="e.g. Energy Transition"
              maxLength={100}
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: '8px',
                border: '1px solid var(--border-light, #E1DCDB)',
                fontSize: '13px',
              }}
            />
          </div>
        </div>

        {/* Source Attribution */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--eclipse, #2D1D15)', marginBottom: '4px' }}>
              Source / News Outlet Name
            </label>
            <input
              type="text"
              value={sourceName}
              onChange={(e) => setSourceName(e.target.value)}
              placeholder="e.g. The Hindu, PTI, Mann Ki Aawaj"
              maxLength={100}
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: '8px',
                border: '1px solid var(--border-light, #E1DCDB)',
                fontSize: '13px',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--eclipse, #2D1D15)', marginBottom: '4px' }}>
              Original Source URL
            </label>
            <input
              type="url"
              value={sourceUrl}
              onChange={(e) => setSourceUrl(e.target.value)}
              placeholder="https://..."
              maxLength={1000}
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: '8px',
                border: '1px solid var(--border-light, #E1DCDB)',
                fontSize: '13px',
              }}
            />
          </div>
        </div>

        {/* Image URL & Thumbnail Preview */}
        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--eclipse, #2D1D15)', marginBottom: '4px' }}>
            Featured Image URL
          </label>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://..."
              maxLength={1000}
              style={{
                flex: 1,
                padding: '9px 12px',
                borderRadius: '8px',
                border: '1px solid var(--border-light, #E1DCDB)',
                fontSize: '13px',
              }}
            />
            {imageUrl ? (
              <img
                src={imageUrl}
                alt="Thumbnail"
                onError={(e) => { e.target.style.display = 'none'; }}
                style={{ width: '42px', height: '42px', borderRadius: '8px', objectFit: 'cover', border: '1px solid var(--border-light, #E1DCDB)' }}
              />
            ) : (
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '8px',
                  backgroundColor: 'var(--soft-white, #F8F5F3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--hurricane, #887B75)',
                }}
              >
                <ImageIcon size={18} />
              </div>
            )}
          </div>
        </div>

        {/* Placement & Status Options */}
        <div style={{ borderTop: '1px solid var(--swiss-coffee, #F8F5F3)', paddingTop: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--eclipse, #2D1D15)', marginBottom: '4px' }}>
                Feed Placement Strategy
              </label>
              <select
                value={placement}
                onChange={(e) => setPlacement(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-light, #E1DCDB)',
                  fontSize: '13px',
                  backgroundColor: '#fff',
                }}
              >
                <option value="FEATURED_PULSE">FEATURED_PULSE (Happening Now carousel)</option>
                <option value="NORMAL_FEED">NORMAL_FEED (Standard timeline)</option>
                <option value="UNLISTED">UNLISTED (Direct URL only)</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--eclipse, #2D1D15)', marginBottom: '4px' }}>
                Publication Status
              </label>
              <select
                value={publicationStatus}
                onChange={(e) => setPublicationStatus(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-light, #E1DCDB)',
                  fontSize: '13px',
                  backgroundColor: '#fff',
                }}
              >
                <option value="PUBLISHED">PUBLISHED (Live)</option>
                <option value="DRAFT">DRAFT (Saved in editorial staging)</option>
                <option value="SCHEDULED">SCHEDULED (Timed release)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Timed Scheduling */}
        {publicationStatus === 'SCHEDULED' && (
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--brand-plum, #6F405F)', marginBottom: '4px' }}>
              Scheduled Release Time *
            </label>
            <input
              type="datetime-local"
              value={scheduledTime}
              onChange={(e) => setScheduledTime(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: '8px',
                border: '1px solid var(--border-light, #E1DCDB)',
                fontSize: '13px',
              }}
            />
          </div>
        )}

        {/* Featured Priority & Expiry */}
        {placement === 'FEATURED_PULSE' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--eclipse, #2D1D15)', marginBottom: '4px' }}>
                Featured Priority (0-100)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={featuredPriority}
                onChange={(e) => setFeaturedPriority(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-light, #E1DCDB)',
                  fontSize: '13px',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--eclipse, #2D1D15)', marginBottom: '4px' }}>
                Promotion End Time (Optional)
              </label>
              <input
                type="datetime-local"
                value={promotionEndTime}
                onChange={(e) => setPromotionEndTime(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-light, #E1DCDB)',
                  fontSize: '13px',
                }}
              />
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '12px',
            borderTop: '1px solid var(--swiss-coffee, #F8F5F3)',
            paddingTop: '16px',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="button-secondary"
            style={{ padding: '9px 16px', borderRadius: '8px', fontSize: '13px', cursor: 'pointer' }}
          >
            Cancel
          </button>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {/* Save as Draft Shortcut Button (when creating or editing draft) */}
            {!isEditing && (
              <button
                type="button"
                onClick={() => handleSubmit('DRAFT')}
                disabled={isSubmitting}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '9px 16px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-light, #E1DCDB)',
                  backgroundColor: '#fff',
                  color: 'var(--eclipse, #2D1D15)',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                }}
              >
                <Save size={15} />
                Save Draft
              </button>
            )}

            {/* Schedule Button */}
            {!isEditing && (
              <button
                type="button"
                onClick={() => {
                  setPublicationStatus('SCHEDULED');
                  if (!scheduledTime) {
                    addToast('Please set the scheduled date & time below.', 'info');
                  } else {
                    handleSubmit('SCHEDULED');
                  }
                }}
                disabled={isSubmitting}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '9px 16px',
                  borderRadius: '8px',
                  border: '1px solid #bfdbfe',
                  backgroundColor: '#eff6ff',
                  color: '#1d4ed8',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                }}
              >
                <Clock size={15} />
                Schedule
              </button>
            )}

            {/* Primary Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '9px 20px',
                borderRadius: '8px',
                backgroundColor: 'var(--brand-plum, #6F405F)',
                color: '#fff',
                border: 'none',
                fontSize: '13px',
                fontWeight: 600,
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                opacity: isSubmitting ? 0.7 : 1,
              }}
            >
              <CheckCircle size={16} />
              {isSubmitting
                ? 'Saving...'
                : isEditing
                ? 'Save Changes'
                : 'Publish Discussion'}
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
