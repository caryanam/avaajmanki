import React, { useState, useEffect } from 'react';
import { Modal } from '../../common/Modal.jsx';
import { Rss, CheckCircle, ExternalLink } from 'lucide-react';
import { apiAdminPulseService } from '../../../services/apiAdminPulseService.js';
import { useToast } from '../../../context/ToastContext.jsx';

const CATEGORIES = [
  { value: 'GENERAL_NEWS', label: 'General News' },
  { value: 'ENTERTAINMENT', label: 'Entertainment' },
  { value: 'SPORTS', label: 'Sports' },
  { value: 'TECHNOLOGY', label: 'Technology' },
];

export function PulseSourceModal({
  isOpen,
  onClose,
  sourceToEdit = null,
  onSuccess,
}) {
  const { addToast } = useToast();
  const [name, setName] = useState('');
  const [feedUrl, setFeedUrl] = useState('');
  const [siteUrl, setSiteUrl] = useState('');
  const [category, setCategory] = useState('GENERAL_NEWS');
  const [isActive, setIsActive] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditing = Boolean(sourceToEdit && sourceToEdit.id);

  useEffect(() => {
    if (sourceToEdit) {
      setName(sourceToEdit.name || '');
      setFeedUrl(sourceToEdit.feedUrl || '');
      setSiteUrl(sourceToEdit.siteUrl || '');
      setCategory(sourceToEdit.category || 'GENERAL_NEWS');
      setIsActive(sourceToEdit.isActive !== undefined ? sourceToEdit.isActive : true);
    } else {
      setName('');
      setFeedUrl('');
      setSiteUrl('');
      setCategory('GENERAL_NEWS');
      setIsActive(true);
    }
  }, [sourceToEdit, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      addToast('Source name is required.', 'error');
      return;
    }
    if (!feedUrl.trim()) {
      addToast('Feed URL is required.', 'error');
      return;
    }

    // Basic format check
    if (!feedUrl.startsWith('http://') && !feedUrl.startsWith('https://')) {
      addToast('Feed URL must start with http:// or https://', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      if (isEditing) {
        await apiAdminPulseService.updateSource(sourceToEdit.id, {
          name: name.trim(),
          feedUrl: feedUrl.trim(),
          siteUrl: siteUrl.trim() || null,
          category: category.trim() || 'GENERAL_NEWS',
          isActive,
        });
        addToast(`Source "${name}" updated successfully.`, 'success');
      } else {
        await apiAdminPulseService.createSource({
          name: name.trim(),
          feedUrl: feedUrl.trim(),
          siteUrl: siteUrl.trim() || null,
          category: category.trim() || 'GENERAL_NEWS',
          isActive,
        });
        addToast(`Source "${name}" registered successfully.`, 'success');
      }

      onSuccess?.();
      onClose();
    } catch (err) {
      const msg = err?.message || err?.error || 'Failed to save source.';
      addToast(msg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? `Edit Source: ${sourceToEdit.name}` : 'Register New News / RSS Source'}
      maxWidth="560px"
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ fontSize: '13px', color: 'var(--hurricane, #887B75)', lineHeight: 1.5 }}>
          Registered sources feed into the editorial candidate review queue. Ingestion strictly rejects internal IPs and untrusted hosts.
        </div>

        {/* Source Name */}
        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--eclipse, #2D1D15)', marginBottom: '4px' }}>
            Source Name *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. The Hindu, Indian Express, BBC News"
            maxLength={100}
            required
            style={{
              width: '100%',
              padding: '9px 12px',
              borderRadius: '8px',
              border: '1px solid var(--border-light, #E1DCDB)',
              fontSize: '13px',
              fontWeight: 500,
            }}
          />
        </div>

        {/* Feed URL */}
        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--eclipse, #2D1D15)', marginBottom: '4px' }}>
            RSS / Atom Feed URL *
          </label>
          <input
            type="url"
            value={feedUrl}
            onChange={(e) => setFeedUrl(e.target.value)}
            placeholder="https://example.com/rss/news.xml"
            maxLength={500}
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

        {/* Site URL */}
        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--eclipse, #2D1D15)', marginBottom: '4px' }}>
            Website Homepage URL (Optional)
          </label>
          <input
            type="url"
            value={siteUrl}
            onChange={(e) => setSiteUrl(e.target.value)}
            placeholder="https://example.com"
            maxLength={500}
            style={{
              width: '100%',
              padding: '9px 12px',
              borderRadius: '8px',
              border: '1px solid var(--border-light, #E1DCDB)',
              fontSize: '13px',
            }}
          />
        </div>

        {/* Category & Status */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', alignItems: 'center' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--eclipse, #2D1D15)', marginBottom: '4px' }}>
              Editorial Category
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
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          <div style={{ paddingTop: '20px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 600, color: 'var(--eclipse, #2D1D15)' }}>
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                style={{ width: '16px', height: '16px', accentColor: 'var(--brand-plum, #6F405F)' }}
              />
              Source Active for Ingestion
            </label>
          </div>
        </div>

        {/* Buttons */}
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
            {isSubmitting ? 'Saving...' : isEditing ? 'Save Changes' : 'Register Source'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
