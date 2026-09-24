import React from 'react';
import { ArrowLeft } from 'lucide-react';
import loginBg from '../../assets/login_bg.png';
import logoMKA from '../../assets/logo_MKA.png';

export function AuthLayout({ children, onNavigate }) {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundImage: `url(${loginBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'left center',
        backgroundRepeat: 'no-repeat',
        backgroundColor: '#EBE4DE',
        position: 'relative',
      }}
    >
      {/* Top Navbar */}
      <header
        style={{
          padding: '16px 28px',
          background: 'transparent',
          borderBottom: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'relative',
          zIndex: 50,
        }}
      >
        {/* Brand Logo */}
        <button
          onClick={() => onNavigate('/')}
          style={{
            background: 'none',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            cursor: 'pointer',
            padding: 0,
          }}
        >
          <img
            src={logoMKA}
            alt="AwajManki Logo"
            style={{
              width: '36px',
              height: '36px',
              objectFit: 'contain',
              borderRadius: '9px',
              flexShrink: 0,
            }}
          />
          <span
            style={{
              fontFamily: 'var(--font-serif, Georgia, serif)',
              fontSize: '20px',
              fontWeight: 800,
              color: '#2B1B17',
              letterSpacing: '-0.01em',
            }}
          >
            AwajManki
          </span>
        </button>

        {/* Home Navigation Button */}
        <button
          onClick={() => onNavigate('/')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: '#FFFFFF',
            color: '#2B1B17',
            border: '1.5px solid rgba(0, 0, 0, 0.1)',
            padding: '7px 18px',
            borderRadius: '24px',
            fontSize: '13px',
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 2px 6px rgba(0, 0, 0, 0.03)',
            transition: 'all 0.18s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#2B1B17';
            e.currentTarget.style.color = '#FFFFFF';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#FFFFFF';
            e.currentTarget.style.color = '#2B1B17';
          }}
        >
          <ArrowLeft size={14} />
          Home
        </button>
      </header>

      {/* Main Content Area */}
      <main
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          padding: '20px 6% 40px 24px',
          boxSizing: 'border-box',
        }}
      >
        {/* RIGHT SIDE: White Input Card Box */}
        <div
          style={{
            width: '100%',
            maxWidth: '460px',
            background: '#FFFFFF',
            borderRadius: '28px',
            padding: '36px 32px',
            boxShadow: '0 20px 50px rgba(43, 27, 23, 0.12), 0 4px 12px rgba(0, 0, 0, 0.04)',
            border: '1px solid rgba(255, 255, 255, 0.8)',
            boxSizing: 'border-box',
            zIndex: 10,
          }}
        >
          {children}
        </div>
      </main>
    </div>
  );
}
