import React from 'react';
import logoMKA from '../../assets/logo_MKA.png';
import { Mail, Phone, MapPin } from 'lucide-react';

export function Footer({ onNavigate }) {
  const handleScrollTopNav = (path) => {
    if (onNavigate) onNavigate(path);
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    setTimeout(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }, 100);
  };

  const scrollToSection = (sectionId) => {
    if (sectionId === 'hero') {
      const heroEl = document.getElementById('hero');
      if (heroEl) {
        heroEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
      document.documentElement.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
      return;
    }
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    }
  };

  const handleQuickLinkScroll = (sectionId) => {
    if (window.location.pathname !== '/' && window.location.pathname !== '/index.html') {
      if (onNavigate) onNavigate('/');
      let attempts = 0;
      const interval = setInterval(() => {
        attempts++;
        const el = document.getElementById(sectionId);
        if (el) {
          clearInterval(interval);
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          if (sectionId === 'hero') {
            window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
          }
        } else if (sectionId === 'hero') {
          clearInterval(interval);
          window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
        } else if (attempts > 15) {
          clearInterval(interval);
        }
      }, 50);
    } else {
      scrollToSection(sectionId);
    }
  };




  return (
    <footer id="about" style={{ backgroundColor: '#0B0D1B', color: '#FFFFFF', paddingTop: '68px', paddingBottom: '32px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
      <style>{`
        .footer-link {
          color: #A0A5BD;
          text-decoration: none;
          font-size: 14px;
          transition: color 0.2s ease;
          cursor: pointer;
        }
        .footer-link:hover {
          color: #F2B08D !important;
        }
      `}</style>
      <div className="section-container" style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '44px', paddingBottom: '52px' }}>
          
          {/* Column 1: Logo & Narrative */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '300px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => handleScrollTopNav('/')}>
              <img
                src={logoMKA}
                alt="Aawaj Man Ki Logo"
                style={{
                  width: '36px',
                  height: '36px',
                  objectFit: 'contain',
                  borderRadius: '8px',
                }}
              />
              <span className="font-playfair" style={{ fontSize: '22px', fontWeight: 700, color: '#FFF8F2' }}>Aawaj Man Ki</span>
            </div>
            <p style={{ fontSize: '13.5px', color: '#A0A5BD', lineHeight: 1.6, margin: 0 }}>
              Your trusted platform for anonymous, safe, and judgment-free conversations. AI-powered moderation keeps discussions respectful and toxicity-free.
            </p>
          </div>

          {/* Column 2: Quick Links (Smooth Scroll to Landing Page Sections) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h4 style={{ fontSize: '16px', fontWeight: 700, color: '#FFFFFF', margin: 0 }}>Quick Links</h4>
            <span onClick={() => handleQuickLinkScroll('hero')} className="footer-link" style={{ color: '#A0A5BD', cursor: 'pointer', fontSize: '14px' }}>Home</span>
            <span onClick={() => handleQuickLinkScroll('why-man-ki-aawaj')} className="footer-link" style={{ color: '#A0A5BD', cursor: 'pointer', fontSize: '14px' }}>Features</span>
            <span onClick={() => handleQuickLinkScroll('features')} className="footer-link" style={{ color: '#A0A5BD', cursor: 'pointer', fontSize: '14px' }}>How It Works</span>
            <span onClick={() => handleScrollTopNav('/about')} className="footer-link" style={{ color: '#A0A5BD', cursor: 'pointer', fontSize: '14px' }}>About Us</span>
            <a
              href="https://github.com/caryanam/mann-ki-awaj-apk/releases/download/New/AwaajManki.apk"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-link"
              style={{ color: '#A0A5BD', cursor: 'pointer', fontSize: '14px', textDecoration: 'none' }}
            >
              Download Apk
            </a>
          </div>


          {/* Column 3: Resources (Scroll to top on page open) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h4 style={{ fontSize: '16px', fontWeight: 700, color: '#FFFFFF', margin: 0 }}>Resources</h4>
            <span onClick={() => handleScrollTopNav('/faq')} className="footer-link" style={{ color: '#A0A5BD', cursor: 'pointer', fontSize: '14px' }}>FAQs</span>
            <span onClick={() => handleScrollTopNav('/privacy-policy')} className="footer-link" style={{ color: '#A0A5BD', cursor: 'pointer', fontSize: '14px' }}>Privacy Policy</span>
            <span onClick={() => handleScrollTopNav('/community-guidelines')} className="footer-link" style={{ color: '#A0A5BD', cursor: 'pointer', fontSize: '14px' }}>Community Guidelines</span>
            <span onClick={() => handleScrollTopNav('/delete-account')} className="footer-link" style={{ color: '#A0A5BD', cursor: 'pointer', fontSize: '14px' }}>Delete User Account</span>
          </div>

          {/* Column 4: Contact Us */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h4 style={{ fontSize: '16px', fontWeight: 700, color: '#FFFFFF', margin: 0 }}>Contact Us</h4>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13.5px', color: '#A0A5BD' }}>
              <Mail size={16} color="#F2B08D" />
              <span>support@awaazmanki.com</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13.5px', color: '#A0A5BD' }}>
              <Phone size={16} color="#F2B08D" />
              <span>+91 99999 99999</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13.5px', color: '#A0A5BD' }}>
              <MapPin size={16} color="#F2B08D" />
              <span>Pune, Maharashtra</span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <span style={{ fontSize: '13.5px', color: '#A0A5BD' }}>
            © 2026 Aawaj Man Ki. All rights reserved by Caryanamindia Pvt Ltd
          </span>
        </div>
      </div>
    </footer>
  );
}
