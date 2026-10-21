import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { Globe, ChevronDown, Check } from 'lucide-react';

export function LanguageSelectorDropdown({ 
  compact = false, 
  inline = false,
  isOpen: controlledIsOpen,
  onClose,
  showTrigger = true,
  onSelect,
}) {
  const { currentLanguage, changeLanguage, supportedLanguages, isTranslating, t } = useLanguage();
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const isControlled = controlledIsOpen !== undefined;
  const isOpen = isControlled ? controlledIsOpen : internalIsOpen;

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        if (onClose) {
          onClose();
        } else {
          setInternalIsOpen(false);
        }
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  const currentLangObj = supportedLanguages?.find(
    (l) => l.label.toLowerCase() === (currentLanguage || 'English').toLowerCase() || 
           l.code.toLowerCase() === (currentLanguage || 'EN').toLowerCase()
  ) || { code: 'EN', label: 'English', native: 'English' };

  const handleSelectLanguage = async (code) => {
    try {
      await changeLanguage(code);
      if (onSelect) onSelect(code);
      if (onClose) {
        onClose();
      } else {
        setInternalIsOpen(false);
      }
    } catch (err) {
      console.error('Failed to change language:', err);
    }
  };

  return (
    <div 
      ref={dropdownRef} 
      style={{ 
        position: 'relative', 
        display: inline ? 'block' : 'inline-block', 
        width: inline ? '100%' : 'auto' 
      }}
    >
      {showTrigger && (
        <button
          type="button"
          onClick={() => {
            if (isControlled && onClose && isOpen) {
              onClose();
            } else {
              setInternalIsOpen(!internalIsOpen);
            }
          }}
          title={t('nav.selectLanguage', 'Select Application Language')}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '6px',
            padding: compact ? '5px 10px' : '8px 14px',
            borderRadius: '20px',
            background: 'linear-gradient(135deg, #FAF7F5 0%, #F5EFEF 100%)',
            border: '1.5px solid #E2D7D7',
            color: '#2D1D15',
            fontSize: compact ? '12px' : '13px',
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(45,29,21,0.05)',
            transition: 'all 0.2s ease',
            outline: 'none',
            width: inline ? '100%' : 'auto',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#e11d48';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(225,29,72,0.12)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = '#E2D7D7';
            e.currentTarget.style.boxShadow = '0 2px 8px rgba(45,29,21,0.05)';
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Globe size={15} style={{ color: '#e11d48' }} />
            <span>{currentLangObj.native || currentLangObj.label}</span>
            <span style={{ fontSize: '11px', color: '#8C8385', fontWeight: 600 }}>({currentLangObj.label})</span>
          </div>
          <ChevronDown
            size={14}
            style={{
              color: '#e11d48',
              transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s ease',
              marginLeft: '4px',
            }}
          />
        </button>
      )}

      {isOpen && (
        <div
          style={{
            position: inline ? 'static' : 'absolute',
            top: inline ? 'auto' : 'calc(100% + 6px)',
            right: inline ? 'auto' : 0,
            width: inline ? '100%' : '260px',
            maxHeight: inline ? '360px' : '280px',
            overflowY: 'auto',
            background: '#FFFFFF',
            borderRadius: inline ? '12px' : '16px',
            border: inline ? '1px solid #f1f5f9' : '1.5px solid #EAE4E4',
            boxShadow: inline ? 'none' : '0 12px 36px rgba(45,29,21,0.16)',
            padding: '6px',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            gap: '3px',
            marginTop: inline && showTrigger ? '6px' : '0',
            boxSizing: 'border-box',
          }}
        >
          <div style={{ padding: '6px 10px 4px', fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Select Preferred Language ({supportedLanguages?.length || 18})
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: inline ? 'repeat(auto-fill, minmax(180px, 1fr))' : '1fr',
              gap: '4px',
            }}
          >
            {supportedLanguages?.map((lang) => {
              const isSelected =
                (currentLanguage || '').toLowerCase() === lang.label.toLowerCase() ||
                (currentLanguage || '').toLowerCase() === lang.code.toLowerCase();

              return (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => handleSelectLanguage(lang.code)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '10px',
                    border: isSelected ? '1px solid #fecdd3' : '1px solid transparent',
                    background: isSelected ? '#fff1f2' : 'transparent',
                    color: isSelected ? '#e11d48' : '#0f172a',
                    fontSize: '13px',
                    fontWeight: isSelected ? 700 : 500,
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.15s ease',
                    boxSizing: 'border-box',
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.background = '#f8fafc';
                      e.currentTarget.style.borderColor = '#e2e8f0';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.borderColor = 'transparent';
                    }
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '13.5px', fontWeight: 700 }}>{lang.native}</span>
                    <span style={{ fontSize: '11.5px', color: isSelected ? '#e11d48' : '#64748b' }}>
                      ({lang.label})
                    </span>
                  </div>
                  {isSelected && <Check size={16} style={{ color: '#e11d48', flexShrink: 0 }} />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
