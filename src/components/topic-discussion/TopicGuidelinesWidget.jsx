import React from 'react';
import { FileText, CheckCircle2 } from 'lucide-react';
import { STANDARD_COMMUNITY_GUIDELINES } from '../../utils/topicMetadata.js';

export function TopicGuidelinesWidget({ guidelines = STANDARD_COMMUNITY_GUIDELINES }) {
  return (
    <div className="topic-guidelines-widget-card" aria-label="Topic Guidelines">
      {/* Widget Header */}
      <div className="guidelines-header-row">
        <div className="guidelines-icon-wrap" aria-hidden="true">
          <FileText size={16} className="guidelines-file-icon" />
        </div>
        <h3 className="guidelines-title">Topic Guidelines</h3>
      </div>

      {/* Guidelines List */}
      <ul className="guidelines-items-list">
        {guidelines.map((rule, idx) => (
          <li key={idx} className="guideline-item">
            <span className="guideline-check-icon-wrap" aria-hidden="true">
              <CheckCircle2 size={15} className="guideline-check-icon" />
            </span>
            <span className="guideline-text">{rule}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
