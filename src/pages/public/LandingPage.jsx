import React, { useState, useEffect, useRef } from 'react';
import {
  ShieldCheck,
  Shield,
  Lock,
  MessageCircle,
  MessagesSquare,
  Mic,
  Bot,
  Users,
  Image,
  Video,
  Smile,
  ArrowUp,
  ArrowRight,
  Check,
  X,
  UserPlus,
  BadgeCheck,
  Globe,
  Zap,
  FileText,
  HelpCircle,
  Mail,
  Phone,
  MapPin,
  Smartphone,
} from 'lucide-react';
import heroBgVideo from '../../assets/Hero2_bg.mp4';
import heroImg from '../../assets/hero.png';
import logoMKA from '../../assets/logo_MKA.png';
import leafImg from '../../assets/leaf.png';
import { Footer } from '../../components/layout/Footer.jsx';

/* ── Decorative Leaf Artwork Component ── */
function BotanicalBranch({ width = 160, height, style = {}, flip = false }) {
  return (
    <img
      src={leafImg}
      alt="Leaf Graphic"
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: height ? (typeof height === 'number' ? `${height}px` : height) : 'auto',
        objectFit: 'contain',
        objectPosition: 'bottom center',
        transform: flip ? 'scaleX(-1)' : 'none',
        pointerEvents: 'none',
        userSelect: 'none',
        opacity: 0.95,
        verticalAlign: 'bottom',
        display: 'block',
        ...style,
      }}
      aria-hidden="true"
    />
  );
}

export function LandingPage({ onNavigate }) {
  const [scrolled, setScrolled] = useState(false);
  const [vsInView, setVsInView] = useState(false);
  const [appInView, setAppInView] = useState(false);
  const vsRef = useRef(null);
  const appRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // IntersectionObserver for VS section coming together animation
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVsInView(true);
        }
      },
      { threshold: 0.25 }
    );
    if (vsRef.current) observer.observe(vsRef.current);
    return () => observer.disconnect();
  }, []);

  // IntersectionObserver for Mobile App section slide-in animation
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setAppInView(true);
        }
      },
      { threshold: 0.2 }
    );
    if (appRef.current) observer.observe(appRef.current);
    return () => observer.disconnect();
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div
      style={{
        fontFamily: '"Inter", -apple-system, sans-serif',
        backgroundColor: '#FFF8F2',
        color: '#17151A',
        overflowX: 'hidden',
        minHeight: '100vh',
      }}
    >
      <style>{`
        .font-playfair {
          font-family: "Playfair Display", Georgia, serif;
          font-weight: 700;
          letter-spacing: -0.03em;
          line-height: 1.05;
        }

        .font-inter {
          font-family: "Inter", sans-serif;
        }

        .btn-accent {
          background-color: #F2B08D;
          color: #17151A;
          font-weight: 700;
          padding: 12px 28px;
          border-radius: 6px;
          border: none;
          cursor: pointer;
          font-size: 14.5px;
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-family: "Inter", sans-serif;
        }
        .btn-accent:hover {
          background-color: #E29F7C;
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(242, 176, 141, 0.35);
        }

        .btn-outline {
          background: transparent;
          color: #FFF8F2;
          border: 1px solid rgba(242, 176, 141, 0.4);
          font-weight: 600;
          padding: 12px 26px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14.5px;
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
          font-family: "Inter", sans-serif;
        }
        .btn-outline:hover {
          background: rgba(242, 176, 141, 0.12);
          border-color: rgba(242, 176, 141, 0.7);
          transform: translateY(-2px);
        }

        .nav-item {
          color: #F4EDE8;
          font-size: 13.5px;
          font-weight: 500;
          text-decoration: none;
          transition: color 0.2s ease;
          cursor: pointer;
        }
        .nav-item:hover {
          color: #F2B08D;
        }

        .section-container {
          max-width: 1240px;
          margin: 0 auto;
          padding: 0 32px;
        }

        .section-space {
          padding: 88px 0;
        }

        @keyframes floatSlow {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }

        .animate-float {
          animation: floatSlow 6s ease-in-out infinite;
        }

        /* ── HOVER EFFECTS FOR "WHAT MAKES US DIFFERENT" ── */
        .diff-card {
          background: rgba(255, 255, 255, 0.75);
          backdrop-filter: blur(12px);
          border: 1px solid #E9DDD3;
          border-radius: 18px;
          padding: 36px 26px;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 16px;
          box-shadow: 0 4px 18px rgba(48, 31, 25, 0.04);
          transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
          position: relative;
          overflow: hidden;
        }

        .diff-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3.5px;
          background: linear-gradient(90deg, #F2B08D 0%, #63344F 100%);
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .diff-card:hover {
          transform: translateY(-8px) scale(1.02);
          box-shadow: 0 20px 40px rgba(99, 52, 79, 0.12);
          border-color: rgba(242, 176, 141, 0.6);
          background: #FFFDFC;
        }

        .diff-card:hover::before {
          opacity: 1;
        }

        .diff-icon-box {
          width: 82px;
          height: 82px;
          border-radius: 50%;
          background-color: #FFF8F2;
          display: grid;
          place-items: center;
          box-shadow: 0 6px 18px rgba(99, 52, 79, 0.08);
          transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .diff-card:hover .diff-icon-box {
          transform: scale(1.08) rotate(-5deg);
          background-color: #63344F;
          box-shadow: 0 10px 24px rgba(99, 52, 79, 0.22);
        }

        .diff-card:hover .diff-icon-box svg {
          stroke: #F2B08D !important;
        }

        .learn-more-link {
          background: none;
          border: none;
          color: #63344F;
          font-weight: 700;
          font-size: 13px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 4px;
          margin-top: 4px;
          transition: all 0.25s ease;
        }

        .diff-card:hover .learn-more-link {
          color: #F2B08D;
          transform: translateX(5px);
        }

        /* ── HOVER EFFECTS FOR "BUILT FOR EVERY VOICE" ── */
        .voice-chip {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 18px;
          border-radius: 12px;
          background-color: #FFFDFC;
          border: 1px solid #E8DDD5;
          font-size: 14.5px;
          font-weight: 600;
          color: #332821;
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
          cursor: default;
        }

        .voice-chip:hover {
          background-color: #63344F;
          color: #FFF8F2;
          border-color: #63344F;
          transform: translateY(-3px) scale(1.03);
          box-shadow: 0 8px 20px rgba(99, 52, 79, 0.18);
        }

        .voice-chip:hover svg {
          stroke: #F2B08D !important;
        }

        .sanctuary-card {
          width: 100%;
          border-radius: 24px;
          background: linear-gradient(135deg, #63344F 0%, #4A243A 100%);
          padding: 50px 38px;
          color: #FFF8F2;
          box-shadow: 0 16px 36px rgba(99, 52, 79, 0.15);
          display: flex;
          flex-direction: column;
          gap: 20px;
          position: relative;
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          overflow: hidden;
        }

        .sanctuary-card:hover {
          transform: translateY(-6px) scale(1.01);
          box-shadow: 0 28px 56px rgba(99, 52, 79, 0.28);
        }

        /* ── COMPACT 4-STEP HOW IT WORKS CARD HOVER ── */
        .step-card {
          background-color: #FFFDFC;
          border: 1px solid #E8DDD5;
          border-radius: 18px;
          padding: 32px 22px;
          display: flex;
          flexDirection: column;
          align-items: center;
          text-align: center;
          gap: 14px;
          position: relative;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 0 4px 14px rgba(70, 45, 35, 0.03);
        }
        .step-card:hover {
          transform: translateY(-6px);
          border-color: #F2B08D;
          box-shadow: 0 16px 32px rgba(99, 52, 79, 0.1);
        }

        /* ── FOOTER STYLING ── */
        .footer-link {
          color: #A0A5BD;
          text-decoration: none;
          font-size: 14px;
          transition: color 0.2s ease;
          cursor: pointer;
        }
        .footer-link:hover {
          color: #F2B08D;
        }
      `}</style>

      {/* ── STICKY NAVBAR OVER HERO ── */}
      <nav
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          padding: '14px 0',
          transition: 'all 0.3s ease',
          backgroundColor: scrolled ? '#080A18' : 'transparent',
          backdropFilter: scrolled ? 'blur(16px)' : 'none',
          borderBottom: scrolled ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid transparent',
          boxShadow: scrolled ? '0 4px 20px rgba(0, 0, 0, 0.4)' : 'none',
        }}
      >
        <div className="section-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Logo */}
          <div
            onClick={() => onNavigate('/')}
            style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
          >
            <img
              src={logoMKA}
              alt="Aawaj Man Ki Logo"
              style={{
                width: '48px',
                height: '48px',
                objectFit: 'contain',
                borderRadius: '10px',
              }}
            />
            <span
              className="font-playfair"
              style={{ fontSize: '24px', fontWeight: 700, color: '#FFF8F2', letterSpacing: '-0.02em' }}
            >
              Aawaj Man Ki
            </span>
          </div>

          {/* Menu Items */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }} className="hidden-mobile">
            <span className="nav-item" style={{ color: '#FFF8F2', position: 'relative' }} onClick={() => onNavigate('/')}>
              Home
              <span style={{ position: 'absolute', bottom: '-4px', left: '0', width: '16px', height: '2px', backgroundColor: '#F2B08D', borderRadius: '1px' }} />
            </span>
            <a href="#features" className="nav-item">Features</a>
            <a href="#how-it-works" className="nav-item">How It Works</a>
            <a href="#about" className="nav-item">About Us</a>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button
              type="button"
              onClick={() => onNavigate('/login')}
              style={{
                background: 'none',
                border: 'none',
                color: '#F4EDE8',
                fontSize: '14px',
                fontWeight: 500,
                cursor: 'pointer',
                padding: '8px 12px',
              }}
            >
              Login
            </button>
            <button
              type="button"
              className="btn-accent"
              style={{ padding: '8px 20px', fontSize: '13.5px' }}
              onClick={() => onNavigate('/register')}
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* ── 1. MODE A: HERO SECTION (VIDEO BACKGROUND) ── */}
      <section
        id="hero"
        style={{
          backgroundColor: '#080A18',
          color: '#FFF8F2',
          paddingTop: '120px',
          paddingBottom: '90px',
          position: 'relative',
          minHeight: '660px',
          display: 'flex',
          alignItems: 'center',
          overflow: 'hidden',
        }}
      >
        {/* Muted Autoplay Video Background (Shifted 25px Right) */}
        <video
          autoPlay
          loop
          muted
          playsInline
          style={{
            position: 'absolute',
            top: 0,
            left: '25px',
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'calc(50% + 25px) center',
            transform: 'translateX(25px)',
            zIndex: 0,
            pointerEvents: 'none',
          }}
        >
          <source src={heroBgVideo} type="video/mp4" />
        </video>

        {/* (No dark overlay above background video) */}

        <div className="section-container" style={{ position: 'relative', zIndex: 2, width: '100%', display: 'flex', flexDirection: 'column', gap: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '40px', flexWrap: 'wrap' }}>
            
            {/* Left Column */}
            <div style={{ flex: '1 1 480px', maxWidth: '560px', display: 'flex', flexDirection: 'column', gap: '22px' }}>
              
              {/* Top Shield Badge */}
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '6px 14px',
                  borderRadius: '20px',
                  backgroundColor: 'rgba(41, 32, 58, 0.7)',
                  border: '1px solid rgba(242, 176, 141, 0.25)',
                  width: 'fit-content',
                  backdropFilter: 'blur(8px)',
                }}
              >
                <ShieldCheck strokeWidth={1.8} size={16} color="#F2B08D" />
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#F4EDE8', letterSpacing: '0.02em' }}>
                  मनातलं बोला… ओळख सुरक्षित ठेवा.
                </span>
              </div>

              {/* Headline */}
              <h1
                className="font-playfair"
                style={{
                  fontSize: 'clamp(46px, 5.8vw, 64px)',
                  lineHeight: 1.02,
                  fontWeight: 700,
                  color: '#FFF8F2',
                  margin: 0,
                }}
              >
                Where Thoughts<br />
                <span style={{ color: '#F2B08D' }}>Matter More</span><br />
                Than Identity.
              </h1>

              {/* Description Paragraph */}
              <p
                className="font-inter"
                style={{
                  fontSize: '15.5px',
                  lineHeight: 1.6,
                  color: '#DDD5D0',
                  margin: 0,
                  fontWeight: 400,
                  maxWidth: '520px',
                }}
              >
                Share your thoughts, opinions, experiences and emotions freely without revealing who you are. AI-powered moderation keeps conversations respectful, meaningful and safe.
              </p>

              {/* CTA Buttons */}
              <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', paddingTop: '4px' }}>
                <button
                  type="button"
                  className="btn-accent"
                  onClick={() => onNavigate('/register')}
                >
                  Get Started
                </button>
                <button
                  type="button"
                  className="btn-outline"
                  onClick={() => {
                    const el = document.getElementById('features');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  Explore Features
                </button>
              </div>
            </div>

            {/* Right Side Column (Artwork Space) */}
            <div style={{ flex: '1 1 480px', minHeight: '320px' }} />
          </div>

          {/* Single Horizontal Row Indicators */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '40px',
              flexWrap: 'nowrap',
              paddingTop: '24px',
              borderTop: '1px solid rgba(255, 255, 255, 0.12)',
              whiteSpace: 'nowrap',
              overflowX: 'auto',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13.5px', color: '#F4EDE8', fontWeight: 600 }}>
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#F2B08D" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 12c0 5.5 4.5 10 10 10s10-4.5 10-10S17.5 2 12 2 2 6.5 2 12z"></path>
                <path d="M7 10c1-1 3-1 4 0"></path>
                <path d="M13 10c1-1 3-1 4 0"></path>
                <path d="M9 16s1.5 1.5 3 1.5 3-1.5 3-1.5"></path>
              </svg>
              <span>Anonymous by Design</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13.5px', color: '#F4EDE8', fontWeight: 600 }}>
              <ShieldCheck strokeWidth={1.8} size={18} color="#F2B08D" />
              <span>AI Moderated</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13.5px', color: '#F4EDE8', fontWeight: 600 }}>
              <Mic strokeWidth={1.8} size={18} color="#F2B08D" />
              <span>Voice-to-Text</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13.5px', color: '#F4EDE8', fontWeight: 600 }}>
              <Globe strokeWidth={1.8} size={18} color="#F2B08D" />
              <span>Indian Languages</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. MODE B: WHY AAWAJ MAN KI? (SCROLL CONVERGENCE ANIMATION) ── */}
      <section id="why-man-ki-aawaj" ref={vsRef} className="section-space" style={{ backgroundColor: '#FFF8F2', position: 'relative', overflow: 'hidden' }}>

        <div className="section-container">
          <div style={{ display: 'flex', gap: '50px', alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Left Column Narrative */}
            <div style={{ flex: '1 1 420px', display: 'flex', flexDirection: 'column', gap: '20px', position: 'relative' }}>
              <div>
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#63344F', letterSpacing: '0.04em' }}>
                  Why Aawaj Man Ki?
                </span>
                <div style={{ width: '28px', height: '2px', backgroundColor: '#F2B08D', borderRadius: '1px', marginTop: '4px' }} />
              </div>

              <h2 className="font-playfair" style={{ fontSize: '42px', lineHeight: 1.1, color: '#17151A', margin: 0 }}>
                Social media is<br />
                built for followers.<br />
                <span style={{ color: '#63344F' }}>We are built<br />for conversations.</span>
              </h2>

              <p style={{ fontSize: '14.5px', color: '#766D68', lineHeight: 1.6, margin: 0, maxWidth: '380px' }}>
                A calm, judgment-free space designed for ideas, empathy, and your authentic voice.
              </p>

              {/* Botanical Branch 1 */}
              <div style={{ marginTop: 'auto', paddingTop: '16px', display: 'flex', alignItems: 'flex-end' }}>
                <BotanicalBranch width={160} style={{ marginBottom: '-90px' }} />
              </div>
            </div>

            {/* Right Column: Side-by-Side VS Comparison Cards */}
            <div style={{ flex: '1 1 540px', position: 'relative' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', position: 'relative' }}>
                
                {/* Floating VS Circle Badge */}
                <div
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: vsInView ? 'translate(-50%, -50%) scale(1)' : 'translate(-50%, -50%) scale(0.2)',
                    opacity: vsInView ? 1 : 0,
                    transition: 'transform 1.4s cubic-bezier(0.22, 1, 0.36, 1) 0.4s, opacity 1.2s ease 0.4s',
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    backgroundColor: '#FFFDFC',
                    border: '1.5px solid #F2B08D',
                    boxShadow: '0 6px 18px rgba(99, 52, 79, 0.18)',
                    display: 'grid',
                    placeItems: 'center',
                    fontWeight: 800,
                    fontSize: '13.5px',
                    color: '#63344F',
                    zIndex: 10,
                  }}
                >
                  VS
                </div>

                {/* Left Card: Traditional Social Media */}
                <div
                  style={{
                    backgroundColor: '#FFFDFC',
                    border: '1px solid #E8DDD5',
                    borderRadius: '16px',
                    padding: '28px 20px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px',
                    transform: vsInView ? 'translateX(0)' : 'translateX(-80px)',
                    opacity: vsInView ? 1 : 0,
                    transition: 'transform 1.6s cubic-bezier(0.16, 1, 0.3, 1), opacity 1.6s ease',
                    boxShadow: vsInView ? '0 8px 24px rgba(70, 45, 35, 0.06)' : 'none',
                  }}
                >
                  <div style={{ fontSize: '14.5px', fontWeight: 700, color: '#332821', textAlign: 'center', borderBottom: '1px solid #F0E7E0', paddingBottom: '12px' }}>
                    Traditional Social Media
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {['Followers', 'Likes', 'Personal Branding', 'Identity', 'Popularity', 'Toxicity & Hate'].map((item, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13.5px', color: '#766D68' }}>
                        <div style={{ width: '17px', height: '17px', borderRadius: '50%', backgroundColor: '#D94B48', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                          <X size={11} color="#FFFFFF" strokeWidth={2.5} />
                        </div>
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right Card: Aawaj Man Ki */}
                <div
                  style={{
                    backgroundColor: '#FFFDFC',
                    border: '1px solid #E8DDD5',
                    borderRadius: '16px',
                    padding: '28px 20px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px',
                    transform: vsInView ? 'translateX(0)' : 'translateX(80px)',
                    opacity: vsInView ? 1 : 0,
                    transition: 'transform 1.6s cubic-bezier(0.16, 1, 0.3, 1) 0.2s, opacity 1.6s ease 0.2s',
                    boxShadow: vsInView ? '0 12px 30px rgba(99, 52, 79, 0.12)' : 'none',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '14.5px', fontWeight: 700, color: '#332821', borderBottom: '1px solid #F0E7E0', paddingBottom: '12px' }}>
                    <img src={logoMKA} alt="Logo" style={{ width: '22px', height: '22px', objectFit: 'contain', borderRadius: '5px' }} />
                    <span>Aawaj Man Ki</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {['Anonymous', 'Respectful', 'Ideas First', 'AI Moderated', 'Meaningful Discussions', 'Toxicity Free'].map((item, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13.5px', color: '#17151A', fontWeight: 600 }}>
                        <div style={{ width: '17px', height: '17px', borderRadius: '50%', backgroundColor: '#29965A', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                          <Check size={11} color="#FFFFFF" strokeWidth={2.5} />
                        </div>
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. WHAT MAKES US DIFFERENT ── */}
      <section id="features" className="section-space" style={{ backgroundColor: '#F2E8DF', borderTop: '1px solid #E9DDD3', borderBottom: '1px solid #E9DDD3' }}>
        <div className="section-container" style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>
          <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto' }}>
            <h2 className="font-playfair" style={{ fontSize: '40px', color: '#17151A', margin: 0 }}>
              What Makes Us Different
            </h2>
            <div style={{ width: '28px', height: '2px', backgroundColor: '#F2B08D', borderRadius: '1px', margin: '12px auto 0 auto' }} />
          </div>

          {/* Top 3 Featured Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
            <div className="diff-card">
              <div className="diff-icon-box">
                <Lock strokeWidth={1.75} size={38} color="#63344F" />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#63344F', margin: 0 }}>Anonymous by Design</h3>
              <p style={{ fontSize: '13.5px', color: '#766D68', lineHeight: 1.5, margin: 0 }}>
                No real names. No public profiles. Pure text & voice expression.
              </p>
              <button
                type="button"
                className="learn-more-link"
                onClick={() => onNavigate('/register')}
              >
                Learn More <ArrowRight size={13} />
              </button>
            </div>

            <div className="diff-card">
              <div className="diff-icon-box">
                <ShieldCheck strokeWidth={1.75} size={38} color="#63344F" />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#63344F', margin: 0 }}>AI-Powered Safety</h3>
              <p style={{ fontSize: '13.5px', color: '#766D68', lineHeight: 1.5, margin: 0 }}>
                Detects hate speech. Filters abuse. Protects conversations.
              </p>
              <button
                type="button"
                className="learn-more-link"
                onClick={() => onNavigate('/register')}
              >
                Learn More <ArrowRight size={13} />
              </button>
            </div>

            <div className="diff-card">
              <div className="diff-icon-box">
                <Mic strokeWidth={1.75} size={38} color="#63344F" />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#63344F', margin: 0 }}>Voice-to-Text</h3>
              <p style={{ fontSize: '13.5px', color: '#766D68', lineHeight: 1.5, margin: 0 }}>
                Speak naturally. Supports Indian languages. Audio deleted after processing.
              </p>
              <button
                type="button"
                className="learn-more-link"
                onClick={() => onNavigate('/register')}
              >
                Learn More <ArrowRight size={13} />
              </button>
            </div>
          </div>

          {/* Bottom Row Items */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '32px', paddingTop: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', backgroundColor: '#FFF8F2', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                <MessageCircle strokeWidth={1.75} size={22} color="#63344F" />
              </div>
              <div>
                <h4 style={{ fontSize: '16px', fontWeight: 700, color: '#63344F', margin: '0 0 4px 0' }}>Discussion First</h4>
                <p style={{ fontSize: '13.5px', color: '#766D68', lineHeight: 1.5, margin: 0 }}>
                  Ideas over popularity. Quality conversations that matter.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', backgroundColor: '#FFF8F2', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                <Lock strokeWidth={1.75} size={22} color="#63344F" />
              </div>
              <div>
                <h4 style={{ fontSize: '16px', fontWeight: 700, color: '#63344F', margin: '0 0 4px 0' }}>Privacy First</h4>
                <p style={{ fontSize: '13.5px', color: '#766D68', lineHeight: 1.5, margin: 0 }}>
                  No identity exposure. No follower counts. Privacy by default.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', backgroundColor: '#FFF8F2', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                <Users strokeWidth={1.75} size={22} color="#63344F" />
              </div>
              <div>
                <h4 style={{ fontSize: '16px', fontWeight: 700, color: '#63344F', margin: '0 0 4px 0' }}>Community Moderation</h4>
                <p style={{ fontSize: '13.5px', color: '#766D68', lineHeight: 1.5, margin: 0 }}>
                  Report harmful content. Human + AI review for healthy discussions.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. BUILT FOR EVERY VOICE ── */}
      <section className="section-space" style={{ backgroundColor: '#FFF8F2', position: 'relative', overflow: 'hidden' }}>
        <div className="section-container">
          <div style={{ display: 'flex', gap: '60px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 420px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <h2 className="font-playfair" style={{ fontSize: '42px', color: '#17151A', margin: 0 }}>
                  Built for Every Voice
                </h2>
                <div style={{ width: '28px', height: '2px', backgroundColor: '#F2B08D', borderRadius: '1px', marginTop: '6px' }} />
              </div>

              <p style={{ fontSize: '16px', color: '#766D68', lineHeight: 1.6, margin: 0 }}>
                A space for every Indian who wants to share, listen and connect.
              </p>

              {/* Interactive Voice Chips */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px', paddingTop: '10px' }}>
                {['Students', 'Young Professionals', 'Creators', 'Thinkers', 'Dreamers', 'Parents', 'Professionals', 'Anyone'].map((item, i) => (
                  <div key={i} className="voice-chip">
                    <Check strokeWidth={2.2} size={15} color="#29965A" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ flex: '1 1 520px', display: 'flex', justifyContent: 'center', position: 'relative' }}>
              {/* Botanical Branch 2 */}
              <BotanicalBranch
                width={160}
                flip={true}
                style={{ position: 'absolute', right: '-15px', bottom: '0px', zIndex: 1 }}
              />

              <div className="sanctuary-card" style={{ zIndex: 2 }}>
                <span style={{ fontSize: '12.5px', fontWeight: 700, textTransform: 'uppercase', color: '#F7D7C4', letterSpacing: '0.04em' }}>
                  A Sanctuary For All
                </span>
                <h3 className="font-playfair" style={{ fontSize: '28px', fontWeight: 700, margin: 0, lineHeight: 1.25 }}>
                  "Finally a platform where my thoughts matter more than my job title or social standing."
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.18)' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#FFF8F2', color: '#63344F', display: 'grid', placeItems: 'center', fontWeight: 800 }}>
                    AN
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 5. RE-DESIGNED APP INTRO & SHOWCASE (WITH SLIDE ANIMATIONS & UNIQUE SCREEN) ── */}
      <section id="how-it-works" ref={appRef} className="section-space" style={{ backgroundColor: '#F2E8DF', borderTop: '1px solid #E9DDD3', borderBottom: '1px solid #E9DDD3', position: 'relative', overflow: 'hidden' }}>
        <div className="section-container">
          <div style={{ display: 'flex', gap: '56px', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'space-between' }}>
            
            {/* Left Column: Realistic Smartphone Mockup (SLIDES IN FROM LEFT) */}
            <div
              style={{
                flex: '0 1 360px',
                display: 'flex',
                justifyContent: 'center',
                position: 'relative',
                margin: '0 auto',
                transform: appInView ? 'translateX(0)' : 'translateX(-80px)',
                opacity: appInView ? 1 : 0,
                transition: 'transform 1.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 1.4s ease',
              }}
            >
              {/* Botanical Branch Accent */}
              <BotanicalBranch
                width={160}
                style={{ position: 'absolute', right: '-25px', bottom: '0px', zIndex: 1 }}
              />

              <div
                style={{
                  width: '320px',
                  borderRadius: '42px',
                  background: '#080A18',
                  padding: '14px',
                  boxShadow: '0 28px 70px rgba(45, 29, 21, 0.22), 0 8px 20px rgba(0,0,0,0.15)',
                  border: '3.5px solid #F2B08D',
                  position: 'relative',
                  zIndex: 2,
                }}
              >
                {/* Top Notch & Status Bar */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '2px 14px 10px 14px', color: '#8C8385', fontSize: '11px', fontWeight: 600 }}>
                  <span>9:41</span>
                  <div style={{ width: '80px', height: '14px', backgroundColor: '#080A18', borderRadius: '0 0 10px 10px' }} />
                  <span>5G 🔋</span>
                </div>

                {/* Mobile App Unique Screen Content */}
                <div
                  style={{
                    borderRadius: '28px',
                    background: '#FFF8F2',
                    padding: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '14px',
                    minHeight: '450px',
                    overflow: 'hidden',
                  }}
                >
                  {/* App Screen Header with Logo & Brand Name */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '10px 14px',
                      backgroundColor: '#63344F',
                      borderRadius: '16px',
                      color: '#FFFFFF',
                      boxShadow: '0 4px 14px rgba(99, 52, 79, 0.22)',
                    }}
                  >
                    <img
                      src={logoMKA}
                      alt="Logo"
                      style={{ width: '28px', height: '28px', objectFit: 'contain', borderRadius: '6px', backgroundColor: '#FFF' }}
                    />
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '14px', fontWeight: 700, color: '#FFFFFF', lineHeight: 1.1 }}>
                        Aawaj Man Ki
                      </span>
                      <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.85)' }}>
                        Anonymous Social App
                      </span>
                    </div>
                  </div>

                  {/* Looping / Animated Screen Features Showcase */}
                  <div
                    style={{
                      backgroundColor: '#FFFDFC',
                      border: '1.5px solid #E8DDD5',
                      borderRadius: '18px',
                      padding: '16px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px',
                      boxShadow: '0 4px 14px rgba(0,0,0,0.04)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '11px', fontWeight: 800, color: '#F2B08D', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        Live Voice Thought 🎙️
                      </span>
                      <span style={{ fontSize: '10.5px', color: '#29965A', fontWeight: 700 }}>● 22 Languages</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#63344F', color: '#FFF', display: 'grid', placeItems: 'center', fontSize: '12px', fontWeight: 800 }}>
                        MS
                      </div>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 700, color: '#17151A' }}>@mindful_soul</div>
                        <div style={{ fontSize: '10.5px', color: '#766D68' }}>Topic: Mental Wellness</div>
                      </div>
                    </div>

                    {/* Sample Voice Waveform Card */}
                    <div
                      style={{
                        backgroundColor: '#F7F2EE',
                        border: '1px solid #E8DDD5',
                        borderRadius: '12px',
                        padding: '12px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px',
                      }}
                    >
                      <div style={{ fontSize: '12px', color: '#332821', lineHeight: 1.45 }}>
                        "Expressing unspoken thoughts without fear of judgment changes everything."
                      </div>
                      
                      {/* Simulated Audio Waveform */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', paddingTop: '4px' }}>
                        <span style={{ fontSize: '11px', fontWeight: 700, color: '#63344F' }}>▶️ 0:14</span>
                        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '2px', height: '14px' }}>
                          {[60, 90, 40, 100, 70, 30, 85, 95, 50, 75, 40, 90, 60, 100, 45, 80].map((h, i) => (
                            <div key={i} style={{ flex: 1, height: `${h}%`, backgroundColor: '#63344F', borderRadius: '2px' }} />
                          ))}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', fontSize: '10.5px', color: '#63344F', fontWeight: 700 }}>
                      <span style={{ backgroundColor: '#FFF8F2', padding: '4px 8px', borderRadius: '12px', border: '1px solid #E8DDD5' }}>
                        ❤️ 28 Relate
                      </span>
                      <span style={{ backgroundColor: '#FFF8F2', padding: '4px 8px', borderRadius: '12px', border: '1px solid #E8DDD5' }}>
                        💡 19 Well Said
                      </span>
                    </div>
                  </div>

                  {/* Mic Voice Action Bar */}
                  <button
                    type="button"
                    style={{
                      marginTop: 'auto',
                      width: '100%',
                      padding: '12px',
                      borderRadius: '18px',
                      backgroundColor: '#63344F',
                      color: '#FFFFFF',
                      border: 'none',
                      fontSize: '12.5px',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      boxShadow: '0 4px 14px rgba(99, 52, 79, 0.25)',
                    }}
                  >
                    <Mic size={16} /> Tap Mic to Speak Thought
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column: Title, Subtitle, Bullet Checklist & Store Buttons (SLIDES IN FROM RIGHT) */}
            <div
              style={{
                flex: '1 1 480px',
                display: 'flex',
                flexDirection: 'column',
                gap: '22px',
                maxWidth: '580px',
                transform: appInView ? 'translateX(0)' : 'translateX(80px)',
                opacity: appInView ? 1 : 0,
                transition: 'transform 1.4s cubic-bezier(0.16, 1, 0.3, 1) 0.15s, opacity 1.4s ease 0.15s',
              }}
            >
              <div>
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#63344F', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Mobile App Experience
                </span>
                <h2 className="font-playfair" style={{ fontSize: 'clamp(32px, 4.2vw, 44px)', color: '#17151A', margin: '8px 0 0 0', lineHeight: 1.15 }}>
                  Share Your Voice<br />
                  <span style={{ color: '#63344F' }}>Anytime, Anywhere</span>
                </h2>
                <div style={{ width: '36px', height: '2.5px', backgroundColor: '#F2B08D', borderRadius: '2px', marginTop: '12px' }} />
              </div>

              <p style={{ fontSize: '15.5px', color: '#766D68', lineHeight: 1.6, margin: 0 }}>
                Download our mobile app to share anonymous thoughts, join live discussions in 22 Indian languages, compare topic streams, and manage your private chat conversations right from your smartphone.
              </p>

              {/* Bullet Points Checklist */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', paddingTop: '4px' }}>
                {[
                  'Real-time anonymous thought stream & discussions',
                  'AI Voice-to-Text in 22 Indian languages',
                  'Instant 1-on-1 private chat requests & alerts',
                  'Absolute identity protection & zero data tracking',
                ].map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div
                      style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        backgroundColor: 'rgba(41, 150, 90, 0.15)',
                        border: '1.5px solid #29965A',
                        display: 'grid',
                        placeItems: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <Check size={13} color="#29965A" strokeWidth={3} />
                    </div>
                    <span style={{ fontSize: '14.5px', fontWeight: 600, color: '#332821' }}>{item}</span>
                  </div>
                ))}
              </div>

              {/* Play Store Download Button */}
              <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', paddingTop: '12px' }}>
                <a
                  href="https://github.com/caryanam/mann-ki-awaj-apk/releases/download/New/AwaajManki.apk"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '12px 24px',
                    borderRadius: '28px',
                    backgroundColor: '#17151A',
                    color: '#FFFFFF',
                    border: 'none',
                    fontSize: '14px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    textDecoration: 'none',
                    boxShadow: '0 6px 20px rgba(23, 21, 26, 0.2)',
                    transition: 'transform 0.2s ease',
                  }}
                >
                  {/* Android Play Store Icon */}
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3 20.5v-17c0-.83.67-1.5 1.5-1.5.34 0 .65.11.91.31l12.5 8.5c.67.45.85 1.36.4 2.03-.1.15-.22.28-.36.38l-12.5 8.5c-.26.2-.57.31-.91.31-.83 0-1.5-.67-1.5-1.5z"></path>
                  </svg>
                  <span>Play Store</span>
                </a>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* ── 7. CTA SECTION (SHORT & SWEET BANNER) ── */}
      <section style={{ backgroundColor: '#FCE9DD', padding: '54px 0', textAlign: 'center', borderTop: '1px solid #F2D7C7', borderBottom: '1px solid #F2D7C7', position: 'relative', overflow: 'hidden' }}>
        {/* Botanical Branch Accent */}
        <BotanicalBranch
          width={150}
          style={{ position: 'absolute', left: '20px', bottom: '0px', zIndex: 1 }}
        />

        <div className="section-container" style={{ maxWidth: '620px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '14px', alignItems: 'center', position: 'relative', zIndex: 2 }}>
          <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#63344F', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Authentic Expression
          </span>
          <h2 className="font-playfair" style={{ fontSize: 'clamp(28px, 3.5vw, 36px)', color: '#332821', margin: 0, lineHeight: 1.2 }}>
            Ready to Share Your Unspoken Thoughts?
          </h2>
          <p style={{ fontSize: '14.5px', color: '#766D68', margin: 0 }}>
            Join India's safest anonymous discussion platform today.
          </p>

          <div style={{ paddingTop: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              className="btn-accent"
              style={{ fontSize: '14px', padding: '12px 28px', backgroundColor: '#63344F', color: '#FFF8F2', borderRadius: '24px', boxShadow: '0 6px 20px rgba(99, 52, 79, 0.2)' }}
              onClick={() => onNavigate('/register')}
            >
              Get Started Now <ArrowRight size={15} />
            </button>
            <span style={{ fontSize: '12px', color: '#766D68', fontWeight: 500 }}>
              Free to use · No identity required
            </span>
          </div>
        </div>
      </section>

      {/* ── 8. UNIFIED FOOTER ── */}
      <Footer onNavigate={onNavigate} />

      {/* ── FLOATING SCROLL TO TOP BUTTON ── */}
      {scrolled && (
        <button
          type="button"
          onClick={scrollToTop}
          style={{
            position: 'fixed',
            bottom: '30px',
            right: '30px',
            width: '46px',
            height: '46px',
            borderRadius: '50%',
            backgroundColor: '#63344F',
            color: '#FFF8F2',
            border: '1.5px solid #F2B08D',
            boxShadow: '0 6px 22px rgba(99, 52, 79, 0.35)',
            display: 'grid',
            placeItems: 'center',
            cursor: 'pointer',
            zIndex: 999,
            transition: 'all 0.3s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#F2B08D';
            e.currentTarget.style.color = '#17151A';
            e.currentTarget.style.transform = 'scale(1.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#63344F';
            e.currentTarget.style.color = '#FFF8F2';
            e.currentTarget.style.transform = 'scale(1)';
          }}
          title="Scroll to top"
        >
          <ArrowUp size={20} strokeWidth={2.5} />
        </button>
      )}
    </div>
  );
}
