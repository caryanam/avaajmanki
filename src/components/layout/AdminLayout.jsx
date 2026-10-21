import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Shield, LayoutDashboard, Flag, FileCheck, ShieldAlert, Users, BarChart3, Settings, FileText, LogOut, Bell, ChevronDown, RefreshCw, AlertTriangle, CheckCircle, Clock, Menu, X, Inbox, Music2, Radio } from 'lucide-react';
import logoMKA from '../../assets/logo_MKA.png';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { apiAdminService } from '../../services/apiAdminService.js';
import { playNotificationSound } from '../../utils/soundUtil.js';

export function AdminLayout({ children, activeRoute, onNavigate, onRefresh, refreshing = false }) {
  const { currentUser, adminLogout } = useAuth();
  const { addToast } = useToast();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifMenuOpen, setNotifMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);


  const prevCountRef = useRef(0);

  const adminDisplayName = currentUser?.fullName || (
    currentUser?.email ? currentUser.email.split('@')[0] : (currentUser?.username ? currentUser.username.replace('@', '') : 'Admin User')
  );
  const adminInitial = adminDisplayName.charAt(0).toUpperCase();

  const navGroups = [
    {
      title: 'MODERATION & OPS',
      items: [
        { label: 'Dashboard', icon: LayoutDashboard, route: '/admin/dashboard' },
        { label: 'Reports Queue', icon: Flag, route: '/admin/reports' },
        { label: 'Content Review', icon: FileCheck, route: '/admin/content-review' },
        { label: 'Blocked Footprints', icon: ShieldAlert, route: '/admin/blocked-content' },
        { label: 'User Enquiries', icon: Inbox, route: '/admin/enquiries' },
      ],
    },
    {
      title: 'EDITORIAL & PULSE',
      items: [
        { label: 'Pulse Editorial Hub', icon: Radio, route: '/admin/pulse' },
      ],
    },
    {
      title: 'PLATFORM',
      items: [
        { label: 'Users', icon: Users, route: '/admin/users' },
        { label: 'Analytics', icon: BarChart3, route: '/admin/analytics' },
        { label: 'Music Management', icon: Music2, route: '/admin/music' },
      ],
    },
  ];

  // Fetch admin notifications in real-time and alert on new reports
  const fetchAdminNotifs = useCallback(async () => {
    try {
      const [reportsRes, blockedRes] = await Promise.allSettled([
        apiAdminService.getReports({ page: 0, size: 6 }),
        apiAdminService.getBlockedContent({ page: 0, size: 6 }),
      ]);

      const list = [];
      if (reportsRes.status === 'fulfilled' && reportsRes.value) {
        const raw = reportsRes.value.data || reportsRes.value;
        const content = raw?.content || (Array.isArray(raw) ? raw : []);
        content.forEach((r) => {
          const rawUser = r.reporterUsername || 'Member';
          const cleanUser = rawUser.includes('@') ? rawUser.split('@')[0] : rawUser;
          list.push({
            id: `report-${r.id}`,
            title: `New User Report Submitted`,
            desc: `Report #${r.id} (${r.reason || 'Violation'}) by ${cleanUser}`,
            time: r.createdAt ? new Date(r.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recently',
            route: `/admin/reports`,
            icon: AlertTriangle,
            color: '#eab308',
          });
        });
      }

      if (blockedRes.status === 'fulfilled' && blockedRes.value) {
        const raw = blockedRes.value.data || blockedRes.value;
        const content = raw?.content || (Array.isArray(raw) ? raw : []);
        content.forEach((b) => {
          const rawUser = b.authorUsername || 'Member';
          const cleanUser = rawUser.includes('@') ? rawUser.split('@')[0] : rawUser;
          const cType = (b.contentType || 'Content').toUpperCase();
          list.push({
            id: `blocked-${b.id}`,
            title: `AI Blocked ${cType}`,
            desc: `User @${cleanUser}: ${b.flaggedReason || 'Rule violation'}`,
            time: b.blockedAt ? new Date(b.blockedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recently',
            route: '/admin/blocked-content',
            icon: ShieldAlert,
            color: '#ef4444',
          });
        });
      }

      setNotifications(list.slice(0, 8));
      setUnreadCount(list.length);

      if (prevCountRef.current > 0 && list.length > prevCountRef.current) {
        const newest = list[0];
        addToast(`[ADMIN ALERT] ${newest.title}: ${newest.desc}`, 'info', 6000);
        playNotificationSound();
      }
      prevCountRef.current = list.length;
    } catch (e) {
      console.warn('Failed to load admin notifications:', e);
    }
  }, [addToast]);

  useEffect(() => {
    fetchAdminNotifs();
    const interval = setInterval(fetchAdminNotifs, 10000);
    return () => clearInterval(interval);
  }, [fetchAdminNotifs]);

  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        backgroundColor: 'var(--warm-off-white, #F8F5F3)',
        fontFamily: 'var(--font-sans, system-ui, -apple-system, sans-serif)',
        color: '#2D1D15',
        position: 'relative',
      }}
    >
      {/* ── MOBILE OVERLAY (closes sidebar on tap) ── */}
      {isSidebarOpen && (
        <div
          className="admin-overlay"
          onClick={() => setIsSidebarOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.45)',
            zIndex: 999,
          }}
        />
      )}

      {/* ── 1. SIDEBAR ─────────────────────────────────────────── */}
      <aside
        className={`admin-sidebar${isSidebarOpen ? ' open' : ''}`}
        style={{
          width: '260px',
          flexShrink: 0,
          backgroundColor: '#2D1D15',
          color: '#ffffff',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          height: '100vh',
          boxShadow: '4px 0 24px rgba(0, 0, 0, 0.12)',
          zIndex: 100,
          overflowY: 'auto',
        }}
      >

        <div style={{ padding: '24px 20px 16px 20px' }}>
          {/* Brand Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px' }}>
            <img
              src={logoMKA}
              alt="Aawaj Man Ki Logo"
              style={{
                width: '38px',
                height: '38px',
                objectFit: 'contain',
                borderRadius: '10px',
              }}
            />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span className="font-heading" style={{ fontSize: '18px', fontWeight: 700, color: '#ffffff', lineHeight: 1.1 }}>
                Aawaj Man Ki
              </span>
              <span style={{ fontSize: '9.5px', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#E1DCDB', opacity: 0.8, fontWeight: 700, marginTop: '2px' }}>
                ADMINISTRATION & OPERATIONS
              </span>
            </div>
          </div>

          {/* Navigation Groups */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
            {navGroups.map((group, gIdx) => (
              <div key={gIdx} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <span
                  style={{
                    fontSize: '10.5px',
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: '#9F9794',
                    paddingLeft: '12px',
                    marginBottom: '4px',
                  }}
                >
                  {group.title}
                </span>

                {group.items.map((item, iIdx) => {
                  const Icon = item.icon;
                  const isActive = activeRoute === item.route;

                  return (
                    <button
                      key={iIdx}
                      type="button"
                      onClick={() => onNavigate && onNavigate(item.route)}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '10px 14px',
                        borderRadius: '12px',
                        border: 'none',
                        fontSize: '13.5px',
                        fontWeight: isActive ? 700 : 500,
                        color: isActive ? '#ffffff' : 'rgba(255, 255, 255, 0.75)',
                        backgroundColor: isActive ? '#6F405F' : 'transparent',
                        boxShadow: isActive ? '0 4px 12px rgba(111, 64, 95, 0.4)' : 'none',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <Icon size={18} style={{ color: isActive ? '#ffffff' : 'rgba(255, 255, 255, 0.6)' }} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* ── SIDEBAR FOOTER: AUTHENTICATED ADMIN USER ────────────────────────── */}
        <div style={{ padding: '16px 20px 24px 20px', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <div
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 12px',
              borderRadius: '12px',
              backgroundColor: 'rgba(255, 255, 255, 0.06)',
              cursor: 'pointer',
              userSelect: 'none',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '50%',
                  backgroundColor: '#6F405F',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '14px',
                }}
              >
                {adminInitial}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#ffffff', lineHeight: 1.2 }}>
                  {adminDisplayName}
                </span>
                <span style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.6)' }}>
                  Super Admin
                </span>
              </div>
            </div>
            <ChevronDown size={16} style={{ color: 'rgba(255, 255, 255, 0.6)' }} />
          </div>

          {userMenuOpen && (
            <div style={{ marginTop: '8px', padding: '6px', borderRadius: '10px', backgroundColor: '#3A271C' }}>
              <button
                type="button"
                onClick={() => {
                  adminLogout();
                  onNavigate('/login');
                }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: 'transparent',
                  color: '#ef4444',
                  fontSize: '12.5px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <LogOut size={14} /> Exit Admin Session
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* ── 2. MAIN CONTENT AREA WITH TOP HEADER ───────────────────────────── */}
      <div className="admin-main" style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Top Header */}
        <header
          className="admin-header"
          style={{
            height: '72px',
            backgroundColor: '#ffffff',
            borderBottom: '1px solid #E1DCDB',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 36px',
            position: 'sticky',
            top: 0,
            zIndex: 90,
          }}
        >
          {/* Hamburger + Title row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Hamburger — hidden on desktop via CSS */}
            <button
              type="button"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="mobile-only"
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '6px',
                borderRadius: '8px',
                color: '#2D1D15',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              {isSidebarOpen ? <X size={22} /> : <Menu size={22} />}
            </button>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 800, color: '#2D1D15', lineHeight: 1.1 }}>
                Dashboard Overview
              </h2>
              <span style={{ fontSize: '12.5px', color: '#9F9794', marginTop: '2px' }}>
                Real-time moderation & intelligence monitoring
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', position: 'relative' }}>
            <button
              type="button"
              onClick={onRefresh}
              disabled={refreshing}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '9px 16px',
                borderRadius: '10px',
                border: '1px solid #E1DCDB',
                backgroundColor: '#F8F5F3',
                color: '#2D1D15',
                fontSize: '13px',
                fontWeight: 600,
                cursor: refreshing ? 'not-allowed' : 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <RefreshCw size={15} className={refreshing ? 'animate-spin' : ''} style={{ color: '#6F405F' }} />
              <span>{refreshing ? 'Refreshing...' : 'Refresh Intelligence'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                adminLogout();
                onNavigate('/login');
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '9px 16px',
                borderRadius: '10px',
                border: 'none',
                backgroundColor: '#6F405F',
                color: '#ffffff',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <LogOut size={15} />
              <span>Exit Admin</span>
            </button>

            {/* Bell Icon Notification Button */}
            <div style={{ position: 'relative' }}>
              <div
                onClick={() => setNotifMenuOpen(!notifMenuOpen)}
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  backgroundColor: '#F8F5F3',
                  border: '1px solid #E1DCDB',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#2D1D15',
                  position: 'relative',
                  cursor: 'pointer',
                }}
                title="Moderation Notifications"
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span
                    style={{
                      position: 'absolute',
                      top: '2px',
                      right: '2px',
                      minWidth: '18px',
                      height: '18px',
                      padding: '0 4px',
                      borderRadius: '10px',
                      backgroundColor: '#ef4444',
                      color: '#ffffff',
                      fontSize: '10px',
                      fontWeight: 800,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '2px solid #ffffff',
                    }}
                  >
                    {unreadCount}
                  </span>
                )}
              </div>

              {/* Admin Notifications Dropdown Menu */}
              {notifMenuOpen && (
                <div
                  style={{
                    position: 'absolute',
                    top: '48px',
                    right: '0',
                    width: '340px',
                    backgroundColor: '#ffffff',
                    borderRadius: '16px',
                    boxShadow: '0 8px 32px rgba(45, 29, 21, 0.15)',
                    border: '1px solid #E1DCDB',
                    padding: '16px',
                    zIndex: 200,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #F8F5F3', paddingBottom: '8px' }}>
                    <span style={{ fontSize: '14px', fontWeight: 800, color: '#2D1D15' }}>Moderation Alerts ({unreadCount})</span>
                    <button
                      onClick={() => setUnreadCount(0)}
                      style={{ background: 'none', border: 'none', fontSize: '11px', color: '#6F405F', fontWeight: 700, cursor: 'pointer' }}
                    >
                      Clear Badges
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '280px', overflowY: 'auto' }}>
                    {notifications.length === 0 ? (
                      <span style={{ fontSize: '12.5px', color: '#9F9794', textAlign: 'center', padding: '16px 0' }}>No pending moderation notifications.</span>
                    ) : (
                      notifications.map((n) => {
                        const Icon = n.icon;
                        return (
                          <div
                            key={n.id}
                            onClick={() => {
                              setNotifMenuOpen(false);
                              onNavigate && onNavigate(n.route);
                            }}
                            style={{
                              display: 'flex',
                              alignItems: 'flex-start',
                              gap: '10px',
                              padding: '10px',
                              borderRadius: '10px',
                              backgroundColor: '#F8F5F3',
                              cursor: 'pointer',
                            }}
                          >
                            <Icon size={16} style={{ color: n.color, marginTop: '2px', flexShrink: 0 }} />
                            <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                              <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#2D1D15' }}>{n.title}</span>
                              <span style={{ fontSize: '11.5px', color: '#9F9794' }}>{n.desc}</span>
                              <span style={{ fontSize: '10px', color: '#9F9794', marginTop: '4px' }}>{n.time}</span>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Top Right Admin Avatar Circle */}
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                backgroundColor: '#2D1D15',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '14px',
              }}
            >
              {adminInitial}
            </div>
          </div>
        </header>

        {/* Scrollable Page Viewport */}
        <main className="admin-content" style={{ flex: 1, padding: '32px 36px', overflowY: 'auto' }}>
          {children}
        </main>
      </div>
    </div>
  );
}
