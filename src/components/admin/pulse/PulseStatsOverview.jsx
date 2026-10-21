import React from 'react';
import { Radio, Newspaper, Star, Calendar, EyeOff, Rss } from 'lucide-react';

export function PulseStatsOverview({ stats, loading = false }) {
  const cards = [
    {
      title: 'Review Queue',
      value: stats?.pendingCandidates ?? 0,
      icon: Newspaper,
      color: '#eab308',
      subtitle: 'Pending editorial review',
    },
    {
      title: 'Published Items',
      value: stats?.publishedCount ?? 0,
      icon: Radio,
      color: '#10b981',
      subtitle: 'Live public discussions',
    },
    {
      title: 'Featured Discussions',
      value: stats?.featuredCount ?? 0,
      icon: Star,
      color: '#6F405F',
      subtitle: 'Top carousel & priority',
    },
    {
      title: 'Scheduled Releases',
      value: stats?.scheduledCount ?? 0,
      icon: Calendar,
      color: '#3b82f6',
      subtitle: 'Queued publication times',
    },
    {
      title: 'Hidden / Moderated',
      value: stats?.hiddenCount ?? 0,
      icon: EyeOff,
      color: '#ef4444',
      subtitle: 'Moderated or held items',
    },
    {
      title: 'Active Sources',
      value: stats?.activeSources ?? 0,
      icon: Rss,
      color: '#8b5cf6',
      subtitle: 'Configured RSS feeds',
    },
  ];

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '16px',
        marginBottom: '24px',
      }}
    >
      {cards.map((c) => {
        const Icon = c.icon;
        return (
          <div
            key={c.title}
            style={{
              borderRadius: '16px',
              border: '1px solid var(--border-light, #E1DCDB)',
              backgroundColor: 'var(--pure-white, #ffffff)',
              padding: '18px 20px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: '120px',
              boxShadow: '0 2px 10px rgba(45, 29, 21, 0.03)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--hurricane, #887B75)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {c.title}
              </span>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '10px',
                  backgroundColor: `${c.color}18`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: c.color,
                }}
              >
                <Icon size={18} />
              </div>
            </div>

            <div>
              <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--eclipse, #2D1D15)' }}>
                {loading ? '...' : c.value}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--hurricane, #887B75)', marginTop: '2px' }}>
                {c.subtitle}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
