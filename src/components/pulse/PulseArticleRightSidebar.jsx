import React from 'react';
import { 
  ArrowRight, 
  Newspaper,
  Layers,
  Compass,
  Clock,
  MapPin,
  ShieldCheck
} from 'lucide-react';
import { formatDate } from '../../utils/formatDate.js';
import { getMediaUrl } from '../../config/env.js';
import thumbFallback from '../../assets/home/news-thumb-india-gate.jpg';

function formatTopicLabel(topic) {
  if (!topic) return 'General News';
  const clean = String(topic).replace(/_/g, ' ').toLowerCase();
  return clean
    .split(' ')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

// Data Integrity: ONLY extract genuine highlights from structured article fields or explicit bullet lists
function extractVerifiedHighlights(article) {
  if (!article) return [];
  if (Array.isArray(article.highlights) && article.highlights.length > 0) {
    return article.highlights.filter(Boolean);
  }

  // Parse explicit bullet points if written in content (e.g. lines starting with • or - or *)
  const content = (article.content || '').trim();
  const bulletLines = content
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => /^[-•*]\s+/.test(line))
    .map((line) => line.replace(/^[-•*]\s+/, '').trim())
    .filter((line) => line.length > 15 && line.length < 150);

  if (bulletLines.length >= 2) {
    return bulletLines.slice(0, 5);
  }

  // NEVER synthesize generic or unrelated highlights! Return empty so section is hidden.
  return [];
}

const HIGHLIGHT_ICONS = [
  <Layers size={14} key="1" style={{ color: '#E11D48' }} />,
  <Compass size={14} key="2" style={{ color: '#0284C7' }} />,
  <Clock size={14} key="3" style={{ color: '#EA580C' }} />,
  <MapPin size={14} key="4" style={{ color: '#7C3AED' }} />,
  <ShieldCheck size={14} key="5" style={{ color: '#16A34A' }} />,
];

export function PulseArticleRightSidebar({
  currentArticle,
  relatedArticles = [],
  onNavigate,
}) {
  const highlights = extractVerifiedHighlights(currentArticle);

  // Check if topic is genuinely Mumbai-focused for contextual discovery
  const isMumbaiStory = Boolean(
    (currentArticle?.title || '').toLowerCase().includes('mumbai') ||
    (currentArticle?.summary || '').toLowerCase().includes('mumbai')
  );

  return (
    <aside className="pulse-article-right-sidebar" aria-label="Related stories and highlights">
      {/* ── WIDGET 1: RELATED STORIES (Always genuinely relevant) ── */}
      <div className="pulse-sidebar-widget pulse-related-stories-card">
        <div className="pulse-widget-header-row">
          <h3 className="pulse-widget-title">Related Stories</h3>
          <button
            type="button"
            className="pulse-widget-link-btn"
            onClick={() => onNavigate('/pulse')}
            title="Browse all Pulse stories"
          >
            <span>View all</span>
            <ArrowRight size={13} />
          </button>
        </div>

        <div className="pulse-related-stories-list">
          {relatedArticles.length === 0 ? (
            <p className="pulse-related-empty">No additional related stories yet.</p>
          ) : (
            relatedArticles.slice(0, 4).map((story) => {
              const thumbSrc = story.imageUrl ? getMediaUrl(story.imageUrl) : thumbFallback;
              const topicStr = formatTopicLabel(story.topic);

              return (
                <div
                  key={story.id}
                  className="pulse-related-story-item"
                  onClick={() => onNavigate(`/pulse/${story.id}`)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && onNavigate(`/pulse/${story.id}`)}
                >
                  <div className="pulse-related-thumb-wrap">
                    <img
                      src={thumbSrc}
                      alt={story.title}
                      className="pulse-related-thumb-img"
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.src = thumbFallback;
                      }}
                    />
                  </div>

                  <div className="pulse-related-content">
                    <h4 className="pulse-related-headline">
                      {story.title}
                    </h4>
                    <div className="pulse-related-meta">
                      <span className="pulse-related-category">{topicStr}</span>
                      <span className="pulse-related-dot">•</span>
                      <span>{formatDate(story.publishedAt || story.createdAt)}</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ── WIDGET 2: KEY HIGHLIGHTS (Rendered ONLY when verified highlights exist) ── */}
      {highlights.length > 0 && (
        <div className="pulse-sidebar-widget pulse-key-highlights-card">
          <div className="pulse-highlights-header">
            <Newspaper size={16} className="pulse-highlights-icon" />
            <h3 className="pulse-highlights-title">Key Highlights</h3>
          </div>

          <ul className="pulse-highlights-list">
            {highlights.map((item, index) => {
              const icon = HIGHLIGHT_ICONS[index % HIGHLIGHT_ICONS.length];
              return (
                <li key={index} className="pulse-highlight-item">
                  <span className="pulse-highlight-icon-box">{icon}</span>
                  <span className="pulse-highlight-text">{item}</span>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* ── WIDGET 3: CONTEXTUAL DISCOVERY CARD (Rendered ONLY if relevant to the article's location/context) ── */}
      {isMumbaiStory && (
        <div className="pulse-sidebar-widget pulse-context-discovery-card">
          <div className="pulse-discovery-banner-wrap">
            <div className="pulse-discovery-overlay" />
          </div>

          <div className="pulse-discovery-body">
            <h4 className="pulse-discovery-title">Mumbai Transit & Urban Updates</h4>
            <p className="pulse-discovery-subtitle">
              Follow regional developments and public infrastructure projects.
            </p>
            <button
              type="button"
              className="pulse-discovery-btn"
              onClick={() => onNavigate('/pulse')}
            >
              <span>Explore Updates</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}
