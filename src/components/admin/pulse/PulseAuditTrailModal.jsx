import React, { useState, useEffect, useCallback } from 'react';
import { Modal } from '../../common/Modal.jsx';
import { History, Shield, User, Clock, AlertCircle } from 'lucide-react';
import { apiAdminPulseService } from '../../../services/apiAdminPulseService.js';

export function PulseAuditTrailModal({
  isOpen,
  onClose,
  item,
}) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchLogs = useCallback(async () => {
    if (!item?.id) return;
    setLoading(true);
    setError(null);
    try {
      const res = await apiAdminPulseService.getAuditLogs(item.id);
      const data = res?.data || (Array.isArray(res) ? res : []);
      setLogs(data);
    } catch (err) {
      console.error('Failed to load audit logs:', err);
      setError('Unable to load audit history trail.');
    } finally {
      setLoading(false);
    }
  }, [item?.id]);

  useEffect(() => {
    if (isOpen && item?.id) {
      fetchLogs();
    }
  }, [isOpen, item?.id, fetchLogs]);

  if (!item) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Editorial Audit History: #${item.id}`}
      maxWidth="620px"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ fontSize: '13px', color: 'var(--hurricane, #887B75)', lineHeight: 1.4 }}>
          Audit trail for <strong>{item.title}</strong>. Immutable editorial and moderation log entries.
        </div>

        {loading ? (
          <div style={{ padding: '32px', textAlign: 'center', color: 'var(--hurricane, #887B75)', fontSize: '13px' }}>
            Loading audit events...
          </div>
        ) : error ? (
          <div
            style={{
              padding: '16px',
              borderRadius: '8px',
              backgroundColor: '#fef2f2',
              color: '#b91c1c',
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        ) : logs.length === 0 ? (
          <div
            style={{
              padding: '32px',
              textAlign: 'center',
              backgroundColor: 'var(--soft-white, #F8F5F3)',
              borderRadius: '12px',
              color: 'var(--hurricane, #887B75)',
              fontSize: '13px',
            }}
          >
            No recorded audit actions yet for this item.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '420px', overflowY: 'auto' }}>
            {logs.map((log) => (
              <div
                key={log.id}
                style={{
                  padding: '14px',
                  borderRadius: '10px',
                  border: '1px solid var(--border-light, #E1DCDB)',
                  backgroundColor: '#fff',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span
                      style={{
                        padding: '3px 8px',
                        borderRadius: '6px',
                        backgroundColor: 'var(--brand-plum, #6F405F)15',
                        color: 'var(--brand-plum, #6F405F)',
                        fontSize: '11px',
                        fontWeight: 700,
                        letterSpacing: '0.04em',
                      }}
                    >
                      {log.action}
                    </span>
                    <span style={{ fontSize: '12px', color: 'var(--eclipse, #2D1D15)', fontWeight: 500 }}>
                      {log.adminEmail || 'SYSTEM'}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--hurricane, #887B75)' }}>
                    <Clock size={12} />
                    <span>
                      {log.createdAt ? new Date(log.createdAt).toLocaleString() : 'Date N/A'}
                    </span>
                  </div>
                </div>

                {log.details && (
                  <div style={{ fontSize: '12px', color: 'var(--hurricane, #887B75)', lineHeight: 1.4, marginTop: '2px' }}>
                    {log.details}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--swiss-coffee, #F8F5F3)', paddingTop: '12px' }}>
          <button
            type="button"
            onClick={onClose}
            className="button-secondary"
            style={{ padding: '8px 16px', borderRadius: '8px', fontSize: '13px', cursor: 'pointer' }}
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
}
