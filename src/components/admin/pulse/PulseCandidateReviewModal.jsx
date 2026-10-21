import React, { useState, useEffect } from 'react';
import { Modal } from '../../common/Modal.jsx';
import { ExternalLink, CheckCircle, XCircle, AlertTriangle, Image as ImageIcon, Calendar, Sparkles } from 'lucide-react';
import { apiAdminPulseService } from '../../../services/apiAdminPulseService.js';
import { useToast } from '../../../context/ToastContext.jsx';

const CATEGORY_OPTIONS = [
  { value: 'GENERAL_NEWS', label: 'General News' },
  { value: 'ENTERTAINMENT', label: 'Entertainment' },
  { value: 'SPORTS', label: 'Sports' },
  { value: 'TECHNOLOGY', label: 'Technology' },
];

export function PulseCandidateReviewModal({
  isOpen,
  onClose,
  candidate,
  onSuccess,
}) {
  const { addToast } = useToast();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rejectMode, setRejectMode] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  // Editorial overrides form
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('GENERAL_NEWS');
  const [subtopic, setSubtopic] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [placement, setPlacement] = useState('FEATURED_PULSE');
  const [publicationStatus, setPublicationStatus] = useState('PUBLISHED');
  const [scheduledTime, setScheduledTime] = useState('');
  const [featuredPriority, setFeaturedPriority] = useState(10);
  const [promotionEndTime, setPromotionEndTime] = useState('');

  useEffect(() => {
    if (candidate) {
      setTitle(candidate.title || '');
      setSummary(candidate.summary || '');
      setContent(candidate.content || candidate.summary || '');
      setCategory(candidate.category || candidate.topic || 'GENERAL_NEWS');
      setSubtopic('');
      setImageUrl(candidate.imageUrl || '');
      setPlacement('FEATURED_PULSE');
      setPublicationStatus('PUBLISHED');
      setScheduledTime('');
      setFeaturedPriority(10);
      setPromotionEndTime('');
      setRejectMode(false);
      setRejectReason('');
    }
  }, [candidate]);

  if (!candidate) return null;

  const isAlreadyProcessed = candidate.status && candidate.status !== 'PENDING_REVIEW';

  const handleApprove = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      addToast('A valid headline title is required to approve.', 'error');
      return;
    }
    if (publicationStatus === 'SCHEDULED' && !scheduledTime) {
      addToast('Please specify a scheduled publication date and time.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const overrides = {
        title: title.trim(),
        summary: summary.trim() || undefined,
        content: content.trim() || undefined,
        category: category.trim() || 'GENERAL_NEWS',
        topic: category.trim() || 'GENERAL_NEWS',
        subtopic: subtopic.trim() || undefined,
        imageUrl: imageUrl.trim() || undefined,
        placement,
        publicationStatus,
        scheduledTime: scheduledTime ? new Date(scheduledTime).toISOString() : undefined,
        featuredPriority: Number(featuredPriority) || 0,
        promotionEndTime: promotionEndTime ? new Date(promotionEndTime).toISOString() : undefined,
      };

      const res = await apiAdminPulseService.approveCandidate(candidate.id, overrides);
      addToast('Candidate approved into Awaaj Pulse successfully.', 'success');
      onSuccess?.(res?.data || res);
      onClose();
    } catch (err) {
      const msg = err?.message || err?.error || 'Failed to approve candidate. Please verify inputs.';
      addToast(msg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async (e) => {
    e.preventDefault();
    if (!rejectReason.trim()) {
      addToast('A mandatory rejection reason is required.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      await apiAdminPulseService.rejectCandidate(candidate.id, { reason: rejectReason.trim() });
      addToast('Candidate rejected from editorial consideration.', 'info');
      onSuccess?.();
      onClose();
    } catch (err) {
      const msg = err?.message || err?.error || 'Failed to reject candidate.';
      addToast(msg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Editorial Candidate Review"
      maxWidth="840px"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Warning if already processed */}
        {isAlreadyProcessed && (
          <div
            style={{
              padding: '12px 16px',
              borderRadius: '12px',
              backgroundColor: 'rgba(234, 179, 8, 0.1)',
              border: '1px solid rgba(234, 179, 8, 0.3)',
              color: '#92400e',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontSize: '13px',
            }}
          >
            <AlertTriangle size={18} />
            <span>
              This candidate was already marked as <strong>{candidate.status}</strong>. Re-approving or modifying may result in duplicate records.
            </span>
          </div>
        )}

        {/* Source Attribution & Raw Metadata */}
        <div
          style={{
            backgroundColor: 'var(--soft-white, #F8F5F3)',
            borderRadius: '14px',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            border: '1px solid var(--border-light, #E1DCDB)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span
                style={{
                  padding: '4px 10px',
                  borderRadius: '20px',
                  backgroundColor: 'var(--eclipse, #2D1D15)',
                  color: '#fff',
                  fontSize: '12px',
                  fontWeight: 600,
                }}
              >
                {candidate.sourceName || 'Ingested Feed'}
              </span>
              {candidate.sourceUrl && (
                <a
                  href={candidate.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '12px',
                    color: 'var(--brand-plum, #6F405F)',
                    textDecoration: 'none',
                    fontWeight: 500,
                  }}
                >
                  Source Link <ExternalLink size={12} />
                </a>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--hurricane, #887B75)' }}>
              <Calendar size={13} />
              <span>
                {candidate.publishedAt ? new Date(candidate.publishedAt).toLocaleString() : 'Date N/A'}
              </span>
            </div>
          </div>

          <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--eclipse, #2D1D15)' }}>
            {candidate.title}
          </div>

          {candidate.summary && (
            <div style={{ fontSize: '13px', color: 'var(--hurricane, #887B75)', lineHeight: 1.5, maxHeight: '80px', overflowY: 'auto' }}>
              {candidate.summary}
            </div>
          )}
        </div>

        {/* Rejection Mode View */}
        {rejectMode ? (
          <form onSubmit={handleReject} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ padding: '16px', borderRadius: '12px', border: '1px solid #fee2e2', backgroundColor: '#fef2f2' }}>
              <h4 style={{ margin: '0 0 8px 0', color: '#991b1b', fontSize: '14px', fontWeight: 600 }}>
                Reject News Candidate
              </h4>
              <p style={{ margin: '0 0 12px 0', fontSize: '12px', color: '#b91c1c' }}>
                Please provide an audit rationale. The candidate will remain archived as REJECTED and won&apos;t appear in discovery.
              </p>

              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                Rejection Reason (Mandatory)*
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g. Low relevance, duplicate story, paywalled content, clickbait..."
                maxLength={500}
                rows={3}
                required
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1px solid #d1d5db',
                  fontSize: '13px',
                  fontFamily: 'inherit',
                  resize: 'vertical',
                }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button
                type="button"
                onClick={() => setRejectMode(false)}
                disabled={isSubmitting}
                className="button-secondary"
                style={{ padding: '8px 16px', borderRadius: '8px', fontSize: '13px', cursor: 'pointer' }}
              >
                Back to Review
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !rejectReason.trim()}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: 600,
                  backgroundColor: '#dc2626',
                  color: '#fff',
                  border: 'none',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  opacity: isSubmitting ? 0.7 : 1,
                }}
              >
                {isSubmitting ? 'Rejecting...' : 'Confirm Rejection'}
              </button>
            </div>
          </form>
        ) : (
          /* Editorial Overrides Form */
          <form onSubmit={handleApprove} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--swiss-coffee, #F8F5F3)', paddingBottom: '8px' }}>
              <Sparkles size={16} color="var(--brand-plum, #6F405F)" />
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--eclipse, #2D1D15)' }}>
                Editorial Overrides & Publication Options
              </span>
            </div>

            {/* Editable Title */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--eclipse, #2D1D15)', marginBottom: '4px' }}>
                Curated Title / Headline *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={500}
                required
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-light, #E1DCDB)',
                  fontSize: '14px',
                  fontWeight: 500,
                }}
              />
            </div>

            {/* Editable Summary */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--eclipse, #2D1D15)', marginBottom: '4px' }}>
                Editorial Summary / Discussion Seed
              </label>
              <textarea
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                rows={3}
                placeholder="Brief takeaway prompting community opinion..."
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-light, #E1DCDB)',
                  fontSize: '13px',
                  fontFamily: 'inherit',
                  resize: 'vertical',
                }}
              />
            </div>

            {/* Detailed Editorial Context */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px', flexWrap: 'wrap', gap: '8px' }}>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--eclipse, #2D1D15)' }}>
                  Detailed Editorial Context / In-Depth Background (Optional)
                </label>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={() => {
                      const template = `📌 WHAT HAPPENED:\n[Provide a clear, factual overview of the event or announcement]\n\n🔍 BACKGROUND & KEY DEVELOPMENTS:\n[Historical context, timeline, preceding events, or verified background]\n\n💡 WHY IT MATTERS:\n[Societal, economic, or community implications; explain the broader importance]\n\n❓ QUESTIONS FOR DISCUSSION:\n- What are your thoughts on this development?\n- How might this impact citizens and policy going forward?`;
                      setContent(template);
                    }}
                    style={{
                      fontSize: '11px',
                      padding: '3px 8px',
                      borderRadius: '6px',
                      border: '1px solid var(--brand-plum, #6F405F)',
                      background: 'rgba(111, 64, 95, 0.08)',
                      color: 'var(--brand-plum, #6F405F)',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    + Full Template
                  </button>
                  <button
                    type="button"
                    onClick={() => setContent((prev) => {
                      const t = (prev || '').trim();
                      const item = '📌 WHAT HAPPENED:\n[Provide a clear factual summary]';
                      return t ? `${t}\n\n${item}` : item;
                    })}
                    style={{
                      fontSize: '11px',
                      padding: '3px 8px',
                      borderRadius: '6px',
                      border: '1px solid var(--border-light, #E1DCDB)',
                      background: '#fff',
                      color: 'var(--eclipse, #2D1D15)',
                      cursor: 'pointer',
                    }}
                  >
                    + What Happened
                  </button>
                  <button
                    type="button"
                    onClick={() => setContent((prev) => {
                      const t = (prev || '').trim();
                      const item = '🔍 BACKGROUND & KEY DEVELOPMENTS:\n[Historical context & developments]';
                      return t ? `${t}\n\n${item}` : item;
                    })}
                    style={{
                      fontSize: '11px',
                      padding: '3px 8px',
                      borderRadius: '6px',
                      border: '1px solid var(--border-light, #E1DCDB)',
                      background: '#fff',
                      color: 'var(--eclipse, #2D1D15)',
                      cursor: 'pointer',
                    }}
                  >
                    + Background
                  </button>
                  <button
                    type="button"
                    onClick={() => setContent((prev) => {
                      const t = (prev || '').trim();
                      const item = '💡 WHY IT MATTERS:\n[Societal or economic implications]';
                      return t ? `${t}\n\n${item}` : item;
                    })}
                    style={{
                      fontSize: '11px',
                      padding: '3px 8px',
                      borderRadius: '6px',
                      border: '1px solid var(--border-light, #E1DCDB)',
                      background: '#fff',
                      color: 'var(--eclipse, #2D1D15)',
                      cursor: 'pointer',
                    }}
                  >
                    + Why It Matters
                  </button>
                  <button
                    type="button"
                    onClick={() => setContent((prev) => {
                      const t = (prev || '').trim();
                      const item = '❓ QUESTIONS FOR DISCUSSION:\n- What are your thoughts on this?\n- How should policy respond?';
                      return t ? `${t}\n\n${item}` : item;
                    })}
                    style={{
                      fontSize: '11px',
                      padding: '3px 8px',
                      borderRadius: '6px',
                      border: '1px solid var(--border-light, #E1DCDB)',
                      background: '#fff',
                      color: 'var(--eclipse, #2D1D15)',
                      cursor: 'pointer',
                    }}
                  >
                    + Discussion Qs
                  </button>
                </div>
              </div>

              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={6}
                placeholder="Expand with rich factual background, timeline, significance, or community discussion seeds. Distinguish confirmed facts from unverified claims..."
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-light, #E1DCDB)',
                  fontSize: '13px',
                  fontFamily: 'inherit',
                  lineHeight: 1.5,
                  resize: 'vertical',
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px', fontSize: '11px', color: 'var(--hurricane, #887B75)' }}>
                <span>Distinguish confirmed facts from unverified claims. Preserves paragraphs &amp; line breaks.</span>
                <span>{content.length} characters</span>
              </div>
            </div>

            {/* Topic & Subtopic */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--eclipse, #2D1D15)', marginBottom: '4px' }}>
                  Editorial Category *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-light, #E1DCDB)',
                    fontSize: '13px',
                    backgroundColor: '#fff',
                  }}
                >
                  {CATEGORY_OPTIONS.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--eclipse, #2D1D15)', marginBottom: '4px' }}>
                  Subtopic / Tag (Optional)
                </label>
                <input
                  type="text"
                  value={subtopic}
                  onChange={(e) => setSubtopic(e.target.value)}
                  maxLength={100}
                  placeholder="e.g. AI Ethics, Elections, Markets"
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

            {/* Image URL & Preview */}
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
                    alt="Preview"
                    onError={(e) => { e.target.style.display = 'none'; }}
                    style={{ width: '40px', height: '40px', borderRadius: '6px', objectFit: 'cover', border: '1px solid var(--border-light, #E1DCDB)' }}
                  />
                ) : (
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '6px',
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

            {/* Placement & Publication Status */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--eclipse, #2D1D15)', marginBottom: '4px' }}>
                  Feed Placement
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
                  <option value="FEATURED_PULSE">FEATURED_PULSE (Top Carousel)</option>
                  <option value="NORMAL_FEED">NORMAL_FEED (Mixed Stream)</option>
                  <option value="UNLISTED">UNLISTED (Direct Link Only)</option>
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
                  <option value="PUBLISHED">PUBLISHED (Go Live Immediately)</option>
                  <option value="DRAFT">DRAFT (Keep in Editorial Staging)</option>
                  <option value="SCHEDULED">SCHEDULED (Timed Release)</option>
                </select>
              </div>
            </div>

            {/* Scheduled Release Date if SCHEDULED */}
            {publicationStatus === 'SCHEDULED' && (
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--brand-plum, #6F405F)', marginBottom: '4px' }}>
                  Scheduled Release Date & Time *
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

            {/* Featured Priority if FEATURED_PULSE */}
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
              }}
            >
              <button
                type="button"
                onClick={() => setRejectMode(true)}
                disabled={isSubmitting || isAlreadyProcessed}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '9px 16px',
                  borderRadius: '8px',
                  border: '1px solid #fee2e2',
                  backgroundColor: '#fff',
                  color: '#dc2626',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: isSubmitting || isAlreadyProcessed ? 'not-allowed' : 'pointer',
                  opacity: isSubmitting || isAlreadyProcessed ? 0.6 : 1,
                }}
              >
                <XCircle size={16} />
                Reject Candidate
              </button>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="button-secondary"
                  style={{ padding: '9px 16px', borderRadius: '8px', fontSize: '13px', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || isAlreadyProcessed}
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
                    cursor: isSubmitting || isAlreadyProcessed ? 'not-allowed' : 'pointer',
                    opacity: isSubmitting || isAlreadyProcessed ? 0.6 : 1,
                  }}
                >
                  <CheckCircle size={16} />
                  {isSubmitting ? 'Approving...' : 'Approve & Create Discussion'}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
}
