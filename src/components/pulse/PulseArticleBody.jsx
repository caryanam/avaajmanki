import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Quote, ExternalLink } from 'lucide-react';

export function PulseArticleBody({ article }) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!article) return null;

  const title = (article.title || '').trim();
  const summary = (article.summary || '').trim();
  const content = (article.content || '').trim();

  // Helper to normalize strings for robust duplicate detection
  const normalize = (str) => str.toLowerCase().replace(/[^\w\s]/g, '').trim();
  const normTitle = normalize(title);
  const normSummary = normalize(summary);

  // Extract raw candidate paragraphs from genuine content
  const rawParagraphs = content
    ? content.split(/\n+/).map((p) => p.trim()).filter(Boolean)
    : [];

  // Data Integrity: Filter out any paragraph that merely repeats the headline or summary
  const distinctParagraphs = rawParagraphs.filter((p) => {
    const normP = normalize(p);
    if (!normP) return false;
    // Don't repeat title
    if (normP === normTitle || normTitle.startsWith(normP) || normP.startsWith(normTitle)) {
      return false;
    }
    // Don't repeat summary
    if (normP === normSummary || normSummary.startsWith(normP) || normP.startsWith(normSummary)) {
      return false;
    }
    return true;
  });

  // Pull Quote: ONLY display if a genuine quoted utterance exists in text or backend quote field
  let pullQuote = (article.quote || '').trim();
  if (!pullQuote) {
    const textToSearch = content || '';
    const quoteMatch = textToSearch.match(/["“]([^"”]{15,200})["”]/);
    if (quoteMatch) {
      pullQuote = `“${quoteMatch[1].trim()}”`;
    }
  }

  // Determine if content is long enough to warrant Read More toggle
  const isLong = distinctParagraphs.length > 3 || distinctParagraphs.join(' ').length > 600;
  const displayedParagraphs = isLong && !isExpanded 
    ? distinctParagraphs.slice(0, 2) 
    : distinctParagraphs;

  const hasBodyContent = distinctParagraphs.length > 0;
  const hasSourceLink = Boolean(article.sourceUrl);

  // If there are no distinct paragraphs, no pull quote, and no source link, render nothing
  if (!hasBodyContent && !pullQuote && !hasSourceLink) {
    return null;
  }

  return (
    <div className="pulse-article-body-section">
      {/* Editorial Content Paragraphs (Never duplicating summary or headline) */}
      {hasBodyContent && (
        <div className="pulse-article-paragraphs">
          {displayedParagraphs.map((para, idx) => (
            <p key={idx} className="pulse-article-p">
              {para}
            </p>
          ))}
        </div>
      )}

      {/* Pull Quote Box - ONLY shown when genuine quote exists */}
      {pullQuote ? (
        <blockquote className="pulse-article-pullquote-box">
          <div className="pulse-pullquote-icon" aria-hidden="true">
            <Quote size={20} className="pulse-quote-glyph" />
          </div>
          <div className="pulse-pullquote-content">
            <p className="pulse-pullquote-text">
              {pullQuote.startsWith('“') ? pullQuote : `“${pullQuote}”`}
            </p>
            {article.quoteAuthor && (
              <cite className="pulse-pullquote-author">
                — {article.quoteAuthor}
              </cite>
            )}
          </div>
        </blockquote>
      ) : null}

      {/* Expanded additional paragraphs */}
      {isLong && isExpanded && distinctParagraphs.length > 2 && (
        <div className="pulse-article-paragraphs expanded">
          {distinctParagraphs.slice(2).map((para, idx) => (
            <p key={`exp-${idx}`} className="pulse-article-p">
              {para}
            </p>
          ))}
        </div>
      )}

      {/* Expand / Collapse Toggle Button */}
      {isLong && (
        <div className="pulse-article-readmore-row">
          <button
            type="button"
            className="pulse-article-readmore-btn"
            onClick={() => setIsExpanded(!isExpanded)}
            aria-expanded={isExpanded}
          >
            <span>{isExpanded ? 'Read less' : 'Read more'}</span>
            {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          </button>
        </div>
      )}

      {/* Publisher attribution & original link if excerpt */}
      {article.sourceUrl && (
        <div className="pulse-article-source-link-row">
          <a
            href={article.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="pulse-article-source-external-link"
          >
            <span>Read full coverage on {article.sourceName || 'source'}</span>
            <ExternalLink size={13} />
          </a>
        </div>
      )}
    </div>
  );
}
