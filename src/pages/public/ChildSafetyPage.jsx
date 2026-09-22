import React, { useLayoutEffect } from 'react';
import { PublicLayout } from '../../components/layout/PublicLayout.jsx';
import { ShieldAlert, AlertTriangle, Mail, ShieldCheck, FileText, ArrowLeft, HeartHandshake, CheckCircle2 } from 'lucide-react';

export function ChildSafetyPage({ onNavigate }) {
  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, []);

  return (
    <PublicLayout activeRoute="/child-safety" onNavigate={onNavigate}>
      <div style={{ backgroundColor: '#FFF8F2', minHeight: '100vh', paddingBottom: '70px' }}>
        
        {/* Page Header */}
        <div style={{ backgroundColor: '#080A18', color: '#FFF8F2', padding: '60px 20px', textAlign: 'center', position: 'relative' }}>
          <div style={{ maxWidth: '760px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '14px', alignItems: 'center' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 16px', borderRadius: '20px', backgroundColor: 'rgba(242, 176, 141, 0.15)', border: '1px solid #F2B08D' }}>
              <ShieldAlert size={16} color="#F2B08D" />
              <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#F2B08D', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Child Protection & Safety Standards
              </span>
            </div>
            <h1 className="font-playfair" style={{ color: '#FFFFFF', fontSize: 'clamp(30px, 4.5vw, 44px)', margin: 0, lineHeight: 1.15 }}>
              Child Safety Standards – AawazManki
            </h1>
            <div style={{ display: 'inline-block', backgroundColor: 'rgba(255, 255, 255, 0.08)', padding: '4px 14px', borderRadius: '12px', fontSize: '13px', color: '#F2B08D', fontWeight: 600 }}>
              Last Updated: 22 September 2026
            </div>
            <p style={{ fontSize: '15.5px', color: '#A0A5BD', lineHeight: 1.6, margin: 0, maxWidth: '640px' }}>
              AawazManki is committed to maintaining a safe and respectful environment for all users, including children and minors.
            </p>
          </div>
        </div>

        {/* Content Container */}
        <div style={{ maxWidth: '860px', margin: '-30px auto 0 auto', padding: '0 20px', position: 'relative', zIndex: 10 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

            {/* Card 1: Zero Tolerance for CSAE & CSAM */}
            <div style={{ backgroundColor: '#FFFDFC', border: '2px solid #D94B48', borderRadius: '20px', padding: '32px', boxShadow: '0 8px 30px rgba(217, 75, 72, 0.08)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '12px', backgroundColor: '#FDF0F0', border: '1.5px solid #D94B48', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                  <AlertTriangle size={24} color="#D94B48" />
                </div>
                <div>
                  <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#17151A', margin: 0 }}>
                    Zero Tolerance for Child Sexual Abuse and Exploitation (CSAE)
                  </h2>
                  <span style={{ fontSize: '12.5px', color: '#D94B48', fontWeight: 700 }}>Strict Prohibition & Immediate Action</span>
                </div>
              </div>
              
              <p style={{ fontSize: '15px', color: '#332821', lineHeight: 1.65, margin: 0 }}>
                AawazManki strictly prohibits Child Sexual Abuse and Exploitation (CSAE), Child Sexual Abuse Material (CSAM), and any form of sexual exploitation, abuse, grooming, or endangerment of children.
              </p>

              <div style={{ backgroundColor: '#FDF0F0', border: '1px solid #F87171', borderRadius: '14px', padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ fontSize: '14px', fontWeight: 800, color: '#D94B48' }}>
                  🚫 Strict User Prohibitions:
                </div>
                <p style={{ fontSize: '13.5px', color: '#571B1B', margin: 0, lineHeight: 1.6 }}>
                  Users are strictly prohibited from creating, uploading, sharing, requesting, distributing, or promoting any content involving the sexual abuse or exploitation of children through AawazManki.
                </p>
              </div>

              <p style={{ fontSize: '14px', color: '#524741', lineHeight: 1.6, margin: 0 }}>
                Any content or activity that violates these Child Safety Standards may be removed, and appropriate action may be taken against the responsible account in accordance with applicable laws and policies.
              </p>
            </div>

            {/* Card 2: Reporting Child Safety Concerns */}
            <div style={{ backgroundColor: '#FFFDFC', border: '1.5px solid #E8DDD5', borderRadius: '20px', padding: '32px', boxShadow: '0 8px 30px rgba(70,45,35,0.06)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '12px', backgroundColor: '#F5ECE5', border: '1px solid #E8DDD5', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                  <Mail size={22} color="#63344F" />
                </div>
                <div>
                  <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#17151A', margin: 0 }}>
                    Reporting Child Safety Concerns
                  </h2>
                  <span style={{ fontSize: '12.5px', color: '#766D68' }}>Dedicated support & response team</span>
                </div>
              </div>

              <p style={{ fontSize: '14.5px', color: '#332821', lineHeight: 1.6, margin: 0 }}>
                If you become aware of any content or activity on AawazManki that may involve child sexual abuse or exploitation, please report it to our Child Safety Team immediately.
              </p>

              {/* Contact Box */}
              <div style={{ backgroundColor: '#0B0D1B', borderRadius: '16px', padding: '20px 24px', color: '#FFFFFF', display: 'flex', flexDirection: 'column', gap: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#F2B08D', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Child Safety Contact
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <span style={{ fontSize: '16px', fontWeight: 700, color: '#FFF8F2' }}>AawazManki Child Safety Team</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Mail size={16} color="#F2B08D" />
                    <a
                      href="mailto:support@awaazmanki.com?subject=Child%20Safety%20Concern"
                      style={{ color: '#F2B08D', fontSize: '15px', fontWeight: 600, textDecoration: 'none' }}
                      className="footer-link"
                    >
                      support@awaazmanki.com
                    </a>
                  </div>
                </div>
              </div>

              <div style={{ backgroundColor: '#FFF8F2', border: '1px solid #E8DDD5', borderRadius: '14px', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#63344F' }}>
                  📋 When reporting a child safety concern:
                </div>
                <p style={{ fontSize: '13.5px', color: '#766D68', margin: 0, lineHeight: 1.6 }}>
                  Please provide enough information to help us identify and review the reported content or activity (such as usernames, dates, links, or context).
                </p>
              </div>

              {/* Crucial CSAM Prohibition Notice */}
              <div style={{ backgroundColor: '#FFF4E5', border: '1.5px solid #F59E0B', borderRadius: '14px', padding: '16px 20px', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <AlertTriangle size={20} color="#D97706" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <div style={{ fontSize: '13.5px', fontWeight: 800, color: '#B45309' }}>
                    Critical Reporting Notice:
                  </div>
                  <p style={{ fontSize: '13.5px', color: '#78350F', margin: '4px 0 0 0', lineHeight: 1.55 }}>
                    <strong>Please do not send, upload, or redistribute suspected child sexual abuse material.</strong> Never include or forward violating media attachments in your reports.
                  </p>
                </div>
              </div>
            </div>

            {/* Card 3: Our Commitment */}
            <div style={{ backgroundColor: '#FFFDFC', border: '1.5px solid #E8DDD5', borderRadius: '20px', padding: '32px', boxShadow: '0 8px 30px rgba(70,45,35,0.06)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '12px', backgroundColor: '#F5ECE5', border: '1px solid #E8DDD5', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                  <ShieldCheck size={22} color="#63344F" />
                </div>
                <div>
                  <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#17151A', margin: 0 }}>
                    Our Commitment
                  </h2>
                  <span style={{ fontSize: '12.5px', color: '#766D68' }}>Rigorous enforcement & regulatory compliance</span>
                </div>
              </div>

              <p style={{ fontSize: '14.5px', color: '#332821', lineHeight: 1.6, margin: 0 }}>
                AawazManki takes child safety concerns seriously. We will review reported concerns and take appropriate action in accordance with applicable laws, regulations, and platform policies.
              </p>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', backgroundColor: '#F5ECE5', borderRadius: '12px', padding: '14px 18px' }}>
                <CheckCircle2 size={18} color="#63344F" style={{ flexShrink: 0, marginTop: '2px' }} />
                <p style={{ fontSize: '13.5px', color: '#4A3B32', margin: 0, lineHeight: 1.55 }}>
                  Where appropriate and legally required, AawazManki may cooperate with relevant authorities regarding child safety concerns.
                </p>
              </div>
            </div>

            {/* Card 4: App Information & Worldwide Availability */}
            <div style={{ backgroundColor: '#FFFDFC', border: '1.5px solid #E8DDD5', borderRadius: '20px', padding: '32px', boxShadow: '0 8px 30px rgba(70,45,35,0.06)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '12px', backgroundColor: '#F5ECE5', border: '1px solid #E8DDD5', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                  <FileText size={22} color="#63344F" />
                </div>
                <div>
                  <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#17151A', margin: 0 }}>
                    App Information
                  </h2>
                  <span style={{ fontSize: '12.5px', color: '#766D68' }}>Official platform credentials & global scope</span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
                <div style={{ backgroundColor: '#FFF8F2', border: '1px solid #E8DDD5', borderRadius: '12px', padding: '14px 18px' }}>
                  <div style={{ fontSize: '12px', color: '#766D68', fontWeight: 600, textTransform: 'uppercase' }}>App Name</div>
                  <div style={{ fontSize: '15px', color: '#17151A', fontWeight: 700, marginTop: '4px' }}>AawazManki</div>
                </div>

                <div style={{ backgroundColor: '#FFF8F2', border: '1px solid #E8DDD5', borderRadius: '12px', padding: '14px 18px' }}>
                  <div style={{ fontSize: '12px', color: '#766D68', fontWeight: 600, textTransform: 'uppercase' }}>Child Safety Team</div>
                  <div style={{ fontSize: '15px', color: '#17151A', fontWeight: 700, marginTop: '4px' }}>AawazManki Child Safety Team</div>
                </div>

                <div style={{ backgroundColor: '#FFF8F2', border: '1px solid #E8DDD5', borderRadius: '12px', padding: '14px 18px' }}>
                  <div style={{ fontSize: '12px', color: '#766D68', fontWeight: 600, textTransform: 'uppercase' }}>Child Safety Contact</div>
                  <div style={{ fontSize: '15px', color: '#63344F', fontWeight: 700, marginTop: '4px' }}>support@awaazmanki.com</div>
                </div>
              </div>

              <p style={{ fontSize: '13.5px', color: '#766D68', lineHeight: 1.6, margin: 0, fontStyle: 'italic' }}>
                These Child Safety Standards apply to AawazManki and are publicly available to users worldwide.
              </p>
            </div>

            {/* Navigation & Action Buttons */}
            <div style={{ textAlign: 'center', paddingTop: '12px', display: 'flex', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => onNavigate('/')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 28px',
                  borderRadius: '24px',
                  backgroundColor: '#63344F',
                  color: '#FFF8F2',
                  border: 'none',
                  fontSize: '14px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 6px 20px rgba(99, 52, 79, 0.2)',
                }}
              >
                <ArrowLeft size={16} /> Back to Home Page
              </button>

              <a
                href="mailto:support@awaazmanki.com?subject=Child%20Safety%20Inquiry"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 28px',
                  borderRadius: '24px',
                  backgroundColor: '#FFFDFC',
                  color: '#63344F',
                  border: '1.5px solid #63344F',
                  fontSize: '14px',
                  fontWeight: 700,
                  textDecoration: 'none',
                  cursor: 'pointer',
                }}
              >
                <Mail size={16} /> Contact Child Safety Team
              </a>
            </div>

          </div>
        </div>

      </div>
    </PublicLayout>
  );
}
