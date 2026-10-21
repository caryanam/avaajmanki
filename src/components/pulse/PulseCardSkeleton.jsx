import React from 'react';

export function PulseCardSkeleton() {
  return (
    <div
      style={{
        width: '350px',
        maxWidth: '85vw',
        background: '#FFFFFF',
        borderRadius: '20px',
        border: '1.5px solid rgba(111, 64, 95, 0.08)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 4px 16px rgba(45, 29, 21, 0.03)',
        animation: 'pulse-glow 1.5s ease-in-out infinite',
      }}
    >
      {/* 16:9 Skeleton Image Header */}
      <div
        style={{
          width: '100%',
          aspectRatio: '16 / 9',
          backgroundColor: '#EAE5E3',
        }}
      />

      <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
            <div style={{ width: '80px', height: '18px', background: '#EAE5E3', borderRadius: '6px' }} />
            <div style={{ width: '60px', height: '14px', background: '#EAE5E3', borderRadius: '4px' }} />
          </div>
          <div style={{ width: '92%', height: '18px', background: '#EAE5E3', borderRadius: '4px', marginBottom: '8px' }} />
          <div style={{ width: '70%', height: '18px', background: '#EAE5E3', borderRadius: '4px', marginBottom: '14px' }} />
          <div style={{ width: '100%', height: '13px', background: '#F2EFEB', borderRadius: '4px', marginBottom: '6px' }} />
          <div style={{ width: '85%', height: '13px', background: '#F2EFEB', borderRadius: '4px' }} />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid rgba(111,64,95,0.06)' }}>
          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ width: '30px', height: '14px', background: '#EAE5E3', borderRadius: '4px' }} />
            <div style={{ width: '50px', height: '14px', background: '#EAE5E3', borderRadius: '4px' }} />
          </div>
          <div style={{ width: '110px', height: '30px', background: '#EAE5E3', borderRadius: '15px' }} />
        </div>
      </div>
    </div>
  );
}
