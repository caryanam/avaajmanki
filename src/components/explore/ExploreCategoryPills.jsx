import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

export const PRIMARY_CATEGORIES = [
  { id: 'All', label: 'All Topics' },
  { id: 'Relationships', label: 'Relationships' },
  { id: 'Life & Work', label: 'Life & Work' },
  { id: 'Mental Health', label: 'Mental Health' },
  { id: 'Family', label: 'Family' },
  { id: 'Personal Growth', label: 'Personal Growth' },
  { id: 'Education', label: 'Education' },
];

export const MORE_CATEGORIES = [
  { id: 'Society & Politics', label: 'Society & Politics' },
  { id: 'Entertainment', label: 'Entertainment' },
  { id: 'Sports', label: 'Sports' },
  { id: 'Technology', label: 'Technology' },
  { id: 'Feelings', label: 'Feelings' },
  { id: 'Expression', label: 'Shayari & Poetry' },
];

export function ExploreCategoryPills({ activeCategory, onSelectCategory }) {
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const moreRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (moreRef.current && !moreRef.current.contains(e.target)) {
        setIsMoreOpen(false);
      }
    };
    if (isMoreOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isMoreOpen]);

  const isMoreActive = MORE_CATEGORIES.some((c) => c.id === activeCategory);
  const activeMoreCategory = MORE_CATEGORIES.find((c) => c.id === activeCategory);

  return (
    <div className="explore-category-pills-row" role="tablist" aria-label="Topic categories">
      {PRIMARY_CATEGORIES.map((cat) => {
        const isActive = activeCategory === cat.id;

        return (
          <button
            key={cat.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            className={`explore-category-pill ${isActive ? 'active' : ''}`}
            onClick={() => {
              setIsMoreOpen(false);
              onSelectCategory(cat.id);
            }}
          >
            <span>{cat.label}</span>
          </button>
        );
      })}

      {/* More Dropdown Pill */}
      <div className="explore-more-pills-wrap" ref={moreRef}>
        <button
          type="button"
          className={`explore-category-pill more-pill ${isMoreActive ? 'active' : ''}`}
          onClick={() => setIsMoreOpen((prev) => !prev)}
          aria-haspopup="true"
          aria-expanded={isMoreOpen}
        >
          <span>{isMoreActive ? activeMoreCategory?.label : 'More'}</span>
          <ChevronDown size={14} className={`more-chevron ${isMoreOpen ? 'open' : ''}`} />
        </button>

        {isMoreOpen && (
          <div className="explore-more-dropdown-menu" role="menu">
            {MORE_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                role="menuitem"
                className={`explore-more-item ${activeCategory === cat.id ? 'active' : ''}`}
                onClick={() => {
                  onSelectCategory(cat.id);
                  setIsMoreOpen(false);
                }}
              >
                {cat.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
