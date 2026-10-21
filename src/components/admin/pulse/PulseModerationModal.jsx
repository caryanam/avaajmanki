import React, { useState, useEffect } from 'react';
import { Modal } from '../../common/Modal.jsx';
import { EyeOff, Eye, AlertTriangle, CheckCircle } from 'lucide-react';
import { apiAdminPulseService } from '../../../services/apiAdminPulseService.js';
import { useToast } from '../../../context/ToastContext.jsx';

export function PulseModerationModal({
  isOpen,
  onClose,
  item,
  onSuccess,
}) {
  const { addToast } = useToast();
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setReason('');
  }, [item, isOpen]);

  if (!item) return null;

  const isHidden = item.moderationStatus === 'HIDDEN';
  const targetStatus = isHidden ? 'VISIBLE' : 'HIDDEN';

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isHidden && !reason.trim()) {
      addToast('A reason is required to hide a discussion item.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      await apiAdminPulseService.updateModerationStatus(item.id, {
        moderationStatus: targetStatus,
        reason: reason.trim() || undefined,
      });

      addToast(
        isHidden
          ? `Discussion #${item.id} restored to public visibility.`
          : `Discussion #${item.id} hidden from public discovery.`,
        'success'
      );
      onSuccess?.();
      onClose();
    } catch (err) {
      const msg = err?.message || err?.error || 'Failed to update moderation status.';
      addToast(msg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isHidden ? `Restore Discussion: #${item.id}` : `Hide Discussion: #${item.id}`}
      maxWidth="540px"
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div
          style={{
            padding: '12px 14px',
            borderRadius: '10px',
            backgroundColor: isHidden ? '#eff6ff' : '#fef2f2',
            border: `1px solid ${isHidden ? '#bfdbfe' : '#fecaca'}`,
            display: 'flex',
            alignItems: 'flex-start',
            gap: '10px',
          }}
        >
          {isHidden ? (
            <Eye size={20} color="#1d4ed8" style={{ marginTop: '2px', flexShrink: 0 }} />
          ) : (
            <AlertTriangle size={20} color="#b91c1c" style={{ marginTop: '2px', flexShrink: 0 }} />
          )}
          <div style={{ fontSize: '13px', color: isHidden ? '#1e3a8a' : '#7f1d1d', lineHeight: 1.5 }}>
            {isHidden ? (
              <span>
                You are about to restore <strong>{item.title}</strong> to public view. Its publication status (
                <code>{item.publicationStatus}</code>) and placement (<code>{item.placement}</code>) will be honored.
              </span>
            ) : (
              <span>
                Hiding will immediately remove <strong>{item.title}</strong> from all community feeds, Happening Now, and search queries. All associated comments and takes are preserved in the database.
              </span>
            )}
          </div>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--eclipse, #2D1D15)', marginBottom: '6px' }}>
            {isHidden ? 'Restoration Audit Note (Optional)' : 'Moderation Reason (Required)*'}
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={
              isHidden
                ? 'e.g. Investigation completed; content complies with guidelines...'
                : 'e.g. Misinformation, unverified source claims, violation of community guidelines...'
            }
            required={!isHidden}
            maxLength={500}
            rows={3}
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

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', borderTop: '1px solid var(--swiss-coffee, #F8F5F3)', paddingTop: '14px' }}>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="button-secondary"
            style={{ padding: '8px 16px', borderRadius: '8px', fontSize: '13px', cursor: 'pointer' }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || (!isHidden && !reason.trim())}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 18px',
              borderRadius: '8px',
              backgroundColor: isHidden ? '#2563eb' : '#dc2626',
              color: '#fff',
              border: 'none',
              fontSize: '13px',
              fontWeight: 600,
              cursor: isSubmitting || (!isHidden && !reason.trim()) ? 'not-allowed' : 'pointer',
              opacity: isSubmitting || (!isHidden && !reason.trim()) ? 0.6 : 1,
            }}
          >
            {isHidden ? <Eye size={15} /> : <EyeOff size={15} />}
            {isSubmitting ? 'Processing...' : isHidden ? 'Confirm Restore' : 'Confirm Hide'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
