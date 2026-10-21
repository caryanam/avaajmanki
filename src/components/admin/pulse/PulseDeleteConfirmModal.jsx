import React, { useState, useEffect } from 'react';
import { Modal } from '../../common/Modal.jsx';
import { Trash2, AlertTriangle, MessageSquare, PenTool, Heart, ShieldAlert } from 'lucide-react';
import { apiAdminPulseService } from '../../../services/apiAdminPulseService.js';
import { useToast } from '../../../context/ToastContext.jsx';

export function PulseDeleteConfirmModal({
  isOpen,
  onClose,
  item,
  onSuccess,
}) {
  const { addToast } = useToast();
  const [reason, setReason] = useState('');
  const [confirmKeyword, setConfirmKeyword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      setReason('');
      setConfirmKeyword('');
      setErrorMsg('');
      setIsSubmitting(false);
    }
  }, [isOpen, item]);

  if (!item) return null;

  const isConfirmed = confirmKeyword.trim() === 'DELETE';
  const hasReason = reason.trim().length > 0;
  const canSubmit = isConfirmed && hasReason && !isSubmitting;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;

    setErrorMsg('');
    setIsSubmitting(true);
    try {
      await apiAdminPulseService.deleteItem(item.id, reason.trim());

      addToast(
        `Discussion #${item.id} ("${item.title.length > 40 ? item.title.slice(0, 37) + '...' : item.title}") was permanently deleted.`,
        'success'
      );
      onSuccess?.(item.id);
      onClose();
    } catch (err) {
      console.error('Failed to delete pulse item permanently:', err);
      const msg = err?.message || err?.error || err?.response?.data?.message || 'Failed to delete discussion permanently.';
      setErrorMsg(msg);
      addToast(msg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const commentCount = item.commentCount ?? 0;
  const takeCount = item.takeCount ?? 0;
  const likeCount = item.likeCount ?? 0;

  return (
    <Modal
      isOpen={isOpen}
      onClose={isSubmitting ? () => {} : onClose}
      title={`Delete Discussion Permanently: #${item.id}`}
      maxWidth="600px"
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Warning Banner */}
        <div
          style={{
            padding: '14px 16px',
            borderRadius: '10px',
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px',
          }}
        >
          <AlertTriangle size={22} color="#dc2626" style={{ marginTop: '2px', flexShrink: 0 }} />
          <div style={{ fontSize: '13px', color: '#991b1b', lineHeight: 1.5 }}>
            <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '3px' }}>
              Permanent Database Deletion Cannot Be Undone
            </div>
            This action physically removes the news discussion record from the database. It will immediately cease to exist in all public feeds, Happening Now, recommendations, and direct article URLs.
          </div>
        </div>

        {/* Discussion Details Card */}
        <div
          style={{
            padding: '12px 14px',
            borderRadius: '8px',
            backgroundColor: 'var(--swiss-coffee, #F8F5F3)',
            border: '1px solid var(--border-light, #E1DCDB)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: '6px',
                backgroundColor: 'rgba(111, 64, 95, 0.1)',
                color: 'var(--brand-plum, #6F405F)',
              }}
            >
              #{item.id} • {item.topic || 'GENERAL'}
            </span>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 600,
                padding: '2px 8px',
                borderRadius: '6px',
                backgroundColor: item.publicationStatus === 'PUBLISHED' ? '#dcfce7' : '#f1f5f9',
                color: item.publicationStatus === 'PUBLISHED' ? '#166534' : '#475569',
              }}
            >
              {item.publicationStatus}
            </span>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 600,
                padding: '2px 8px',
                borderRadius: '6px',
                backgroundColor: '#f3e8ff',
                color: '#6b21a8',
              }}
            >
              {item.placement}
            </span>
          </div>

          <h4
            style={{
              margin: '0 0 6px 0',
              fontSize: '14px',
              fontWeight: 700,
              color: 'var(--eclipse, #2D1D15)',
              lineHeight: 1.4,
            }}
          >
            {item.title}
          </h4>

          {item.sourceName && (
            <div style={{ fontSize: '12px', color: 'var(--hurricane, #887B75)' }}>
              Source: {item.sourceName}
            </div>
          )}
        </div>

        {/* Impact Breakdown */}
        <div>
          <div
            style={{
              fontSize: '12px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              color: 'var(--hurricane, #887B75)',
              marginBottom: '8px',
            }}
          >
            Data Impact & Preservation Policy
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '10px',
            }}
          >
            {/* Comments */}
            <div
              style={{
                padding: '10px',
                borderRadius: '8px',
                border: '1px solid #fee2e2',
                backgroundColor: '#fff5f5',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600, color: '#b91c1c' }}>
                <MessageSquare size={14} />
                <span>Comments ({commentCount})</span>
              </div>
              <div style={{ fontSize: '11px', color: '#7f1d1d' }}>
                Permanently deleted along with child replies.
              </div>
            </div>

            {/* User Takes */}
            <div
              style={{
                padding: '10px',
                borderRadius: '8px',
                border: '1px solid #dcfce7',
                backgroundColor: '#f0fdf4',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600, color: '#15803d' }}>
                <PenTool size={14} />
                <span>User Takes ({takeCount})</span>
              </div>
              <div style={{ fontSize: '11px', color: '#14532d' }}>
                <strong>Preserved</strong> and detached as regular posts.
              </div>
            </div>

            {/* Reactions */}
            <div
              style={{
                padding: '10px',
                borderRadius: '8px',
                border: '1px solid #fef3c7',
                backgroundColor: '#fffbeb',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600, color: '#b45309' }}>
                <Heart size={14} />
                <span>Reactions ({likeCount})</span>
              </div>
              <div style={{ fontSize: '11px', color: '#78350f' }}>
                Reactions removed with the item.
              </div>
            </div>
          </div>
        </div>

        {/* Audit Note & Alternative Reminder */}
        <div
          style={{
            padding: '10px 12px',
            borderRadius: '6px',
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            fontSize: '12px',
            color: '#475569',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <ShieldAlert size={16} color="#64748b" style={{ flexShrink: 0 }} />
          <span>
            An immutable <code>PERMANENT_DELETE</code> audit record will be captured with the administrator's email, timestamp, and impact metrics.
          </span>
        </div>

        {/* Error alert if any */}
        {errorMsg && (
          <div
            style={{
              padding: '10px 14px',
              borderRadius: '8px',
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#dc2626',
              fontSize: '12px',
              fontWeight: 600,
            }}
          >
            {errorMsg}
          </div>
        )}

        {/* Reason Field */}
        <div>
          <label
            htmlFor="delete-reason-input"
            style={{
              display: 'block',
              fontSize: '12px',
              fontWeight: 600,
              color: 'var(--eclipse, #2D1D15)',
              marginBottom: '6px',
            }}
          >
            Deletion Reason (Required for Administrative Audit)*
          </label>
          <textarea
            id="delete-reason-input"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g., Obsolete news item permanently replaced by newer editorial coverage, erroneous duplicate publication, or legal retraction."
            required
            maxLength={500}
            rows={3}
            disabled={isSubmitting}
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

        {/* Confirmation Keyword Input */}
        <div>
          <label
            htmlFor="delete-keyword-input"
            style={{
              display: 'block',
              fontSize: '12px',
              fontWeight: 600,
              color: '#991b1b',
              marginBottom: '6px',
            }}
          >
            Type <code style={{ backgroundColor: '#fee2e2', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>DELETE</code> to confirm permanent removal:*
          </label>
          <input
            id="delete-keyword-input"
            type="text"
            value={confirmKeyword}
            onChange={(e) => setConfirmKeyword(e.target.value)}
            placeholder="Type DELETE"
            disabled={isSubmitting}
            autoComplete="off"
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: '8px',
              border: `1px solid ${confirmKeyword.trim() === 'DELETE' ? '#dc2626' : 'var(--border-light, #E1DCDB)'}`,
              fontSize: '13px',
              fontFamily: 'inherit',
              outline: 'none',
              fontWeight: 600,
            }}
          />
        </div>

        {/* Action Buttons */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '10px',
            borderTop: '1px solid var(--swiss-coffee, #F8F5F3)',
            paddingTop: '14px',
          }}
        >
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="button-secondary"
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              fontSize: '13px',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!canSubmit}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 20px',
              borderRadius: '8px',
              backgroundColor: canSubmit ? '#dc2626' : '#f87171',
              color: '#fff',
              border: 'none',
              fontSize: '13px',
              fontWeight: 700,
              cursor: canSubmit ? 'pointer' : 'not-allowed',
              opacity: canSubmit ? 1 : 0.6,
              transition: 'all 0.15s ease',
            }}
          >
            <Trash2 size={15} />
            {isSubmitting ? 'Deleting Discussion...' : 'Permanently Delete Discussion'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
