import React, { useState, useEffect } from 'react';
import { Modal } from '../../common/Modal.jsx';
import { Layers, Star, CheckCircle } from 'lucide-react';
import { apiAdminPulseService } from '../../../services/apiAdminPulseService.js';
import { useToast } from '../../../context/ToastContext.jsx';

export function PulsePlacementModal({
  isOpen,
  onClose,
  item,
  onSuccess,
}) {
  const { addToast } = useToast();
  const [placement, setPlacement] = useState('FEATURED_PULSE');
  const [featuredPriority, setFeaturedPriority] = useState(10);
  const [promotionEndTime, setPromotionEndTime] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (item) {
      setPlacement(item.placement || 'FEATURED_PULSE');
      setFeaturedPriority(item.featuredPriority ?? 10);
      setPromotionEndTime(
        item.promotionEndTime
          ? new Date(item.promotionEndTime).toISOString().slice(0, 16)
          : ''
      );
    }
  }, [item, isOpen]);

  if (!item) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await apiAdminPulseService.updatePlacement(item.id, {
        placement,
        featuredPriority: Number(featuredPriority) || 0,
        promotionEndTime: promotionEndTime ? new Date(promotionEndTime).toISOString() : null,
      });

      addToast(`Placement updated to ${placement} for #${item.id}.`, 'success');
      onSuccess?.();
      onClose();
    } catch (err) {
      const msg = err?.message || err?.error || 'Failed to update placement.';
      addToast(msg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Update Placement: #${item.id}`}
      maxWidth="540px"
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ fontSize: '13px', color: 'var(--hurricane, #887B75)', lineHeight: 1.5 }}>
          Adjust feed placement and prominence for <strong>{item.title}</strong>. This updates the placement in place without duplicating records.
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--eclipse, #2D1D15)', marginBottom: '6px' }}>
            Placement Strategy *
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[
              {
                id: 'FEATURED_PULSE',
                title: 'Featured Discussion (FEATURED_PULSE)',
                desc: 'Promoted in the top Happening Now carousel and prominent feed card.',
              },
              {
                id: 'NORMAL_FEED',
                title: 'Mixed Timeline (NORMAL_FEED)',
                desc: 'Integrated chronologically in the community feed alongside regular posts.',
              },
              {
                id: 'UNLISTED',
                title: 'Unlisted (UNLISTED)',
                desc: 'Hidden from discovery feeds; accessible only via direct discussion link.',
              },
            ].map((opt) => (
              <label
                key={opt.id}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  padding: '12px 14px',
                  borderRadius: '10px',
                  border: `1px solid ${placement === opt.id ? 'var(--brand-plum, #6F405F)' : 'var(--border-light, #E1DCDB)'}`,
                  backgroundColor: placement === opt.id ? 'rgba(111, 64, 95, 0.05)' : '#fff',
                  cursor: 'pointer',
                }}
              >
                <input
                  type="radio"
                  name="placement"
                  value={opt.id}
                  checked={placement === opt.id}
                  onChange={() => setPlacement(opt.id)}
                  style={{ marginTop: '3px' }}
                />
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--eclipse, #2D1D15)' }}>
                    {opt.title}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--hurricane, #887B75)', marginTop: '2px' }}>
                    {opt.desc}
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {placement === 'FEATURED_PULSE' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', backgroundColor: 'var(--soft-white, #F8F5F3)', padding: '14px', borderRadius: '10px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--eclipse, #2D1D15)', marginBottom: '4px' }}>
                Priority (0 - 100)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={featuredPriority}
                onChange={(e) => setFeaturedPriority(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: '6px',
                  border: '1px solid var(--border-light, #E1DCDB)',
                  fontSize: '13px',
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--eclipse, #2D1D15)', marginBottom: '4px' }}>
                Promotion End Time
              </label>
              <input
                type="datetime-local"
                value={promotionEndTime}
                onChange={(e) => setPromotionEndTime(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: '6px',
                  border: '1px solid var(--border-light, #E1DCDB)',
                  fontSize: '13px',
                }}
              />
            </div>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px', borderTop: '1px solid var(--swiss-coffee, #F8F5F3)', paddingTop: '14px' }}>
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
            disabled={isSubmitting}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 18px',
              borderRadius: '8px',
              backgroundColor: 'var(--brand-plum, #6F405F)',
              color: '#fff',
              border: 'none',
              fontSize: '13px',
              fontWeight: 600,
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
            }}
          >
            <CheckCircle size={15} />
            {isSubmitting ? 'Updating...' : 'Save Placement'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
