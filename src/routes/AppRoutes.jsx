import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';

// Pages
const LandingPage = React.lazy(() => import('../pages/public/LandingPage.jsx').then(module => ({ default: module.LandingPage })));
const AboutPage = React.lazy(() => import('../pages/public/AboutPage.jsx').then(module => ({ default: module.AboutPage })));
const PrivacyPolicyPage = React.lazy(() => import('../pages/public/PrivacyPolicyPage.jsx').then(module => ({ default: module.PrivacyPolicyPage })));
const CommunityGuidelinesPage = React.lazy(() => import('../pages/public/CommunityGuidelinesPage.jsx').then(module => ({ default: module.CommunityGuidelinesPage })));
const ContactPage = React.lazy(() => import('../pages/public/ContactPage.jsx').then(module => ({ default: module.ContactPage })));
const FaqPage = React.lazy(() => import('../pages/public/FaqPage.jsx').then(module => ({ default: module.FaqPage })));
const DeleteAccountPage = React.lazy(() => import('../pages/public/DeleteAccountPage.jsx').then(module => ({ default: module.DeleteAccountPage })));

const LoginPage = React.lazy(() => import('../pages/auth/LoginPage.jsx').then(module => ({ default: module.LoginPage })));
const RegisterPage = React.lazy(() => import('../pages/auth/RegisterPage.jsx').then(module => ({ default: module.RegisterPage })));
const ForgotPasswordPage = React.lazy(() => import('../pages/auth/ForgotPasswordPage.jsx').then(module => ({ default: module.ForgotPasswordPage })));
const ProfileSetupWizardPage = React.lazy(() => import('../pages/auth/ProfileSetupWizardPage.jsx').then(module => ({ default: module.ProfileSetupWizardPage })));
const OnboardingPage = React.lazy(() => import('../pages/onboarding/OnboardingPage.jsx').then(module => ({ default: module.OnboardingPage })));

const DashboardPage = React.lazy(() => import('../pages/user/DashboardPage.jsx').then(module => ({ default: module.DashboardPage })));
const HomePage = React.lazy(() => import('../pages/user/HomePage.jsx').then(module => ({ default: module.HomePage })));
const ExplorePage = React.lazy(() => import('../pages/user/ExplorePage.jsx').then(module => ({ default: module.ExplorePage })));
const CreatePostPage = React.lazy(() => import('../pages/user/CreatePostPage.jsx').then(module => ({ default: module.CreatePostPage })));
const TopicDiscussionPage = React.lazy(() => import('../pages/user/TopicDiscussionPage.jsx').then(module => ({ default: module.TopicDiscussionPage })));
const PostDetailsPage = React.lazy(() => import('../pages/user/PostDetailsPage.jsx').then(module => ({ default: module.PostDetailsPage })));
const NotificationsPage = React.lazy(() => import('../pages/user/NotificationsPage.jsx').then(module => ({ default: module.NotificationsPage })));
const SavedPostsPage = React.lazy(() => import('../pages/user/SavedPostsPage.jsx').then(module => ({ default: module.SavedPostsPage })));
const MyPostsPage = React.lazy(() => import('../pages/user/MyPostsPage.jsx').then(module => ({ default: module.MyPostsPage })));
const MyReportsPage = React.lazy(() => import('../pages/user/MyReportsPage.jsx').then(module => ({ default: module.MyReportsPage })));
const ProfilePage = React.lazy(() => import('../pages/user/ProfilePage.jsx').then(module => ({ default: module.ProfilePage })));
const EditProfilePage = React.lazy(() => import('../pages/user/EditProfilePage.jsx').then(module => ({ default: module.EditProfilePage })));
const SettingsPage = React.lazy(() => import('../pages/user/SettingsPage.jsx').then(module => ({ default: module.SettingsPage })));
const PrivacySettingsPage = React.lazy(() => import('../pages/user/PrivacySettingsPage.jsx').then(module => ({ default: module.PrivacySettingsPage })));
const AccountSettingsPage = React.lazy(() => import('../pages/user/AccountSettingsPage.jsx').then(module => ({ default: module.AccountSettingsPage })));
const NotificationSettingsPage = React.lazy(() => import('../pages/user/NotificationSettingsPage.jsx').then(module => ({ default: module.NotificationSettingsPage })));
const SafetyModerationPage = React.lazy(() => import('../pages/user/SafetyModerationPage.jsx').then(module => ({ default: module.SafetyModerationPage })));
const HelpSupportPage = React.lazy(() => import('../pages/user/HelpSupportPage.jsx').then(module => ({ default: module.HelpSupportPage })));
const MusicPage = React.lazy(() => import('../pages/user/MusicPage.jsx').then(module => ({ default: module.MusicPage })));

const AdminLoginPage = React.lazy(() => import('../pages/admin/AdminLoginPage.jsx').then(module => ({ default: module.AdminLoginPage })));
const AdminDashboardPage = React.lazy(() => import('../pages/admin/AdminDashboardPage.jsx').then(module => ({ default: module.AdminDashboardPage })));
const AdminReportsPage = React.lazy(() => import('../pages/admin/AdminReportsPage.jsx').then(module => ({ default: module.AdminReportsPage })));
const AdminReportDetailsPage = React.lazy(() => import('../pages/admin/AdminReportDetailsPage.jsx').then(module => ({ default: module.AdminReportDetailsPage })));
const AdminContentReviewPage = React.lazy(() => import('../pages/admin/AdminContentReviewPage.jsx').then(module => ({ default: module.AdminContentReviewPage })));
const AdminBlockedContentPage = React.lazy(() => import('../pages/admin/AdminBlockedContentPage.jsx').then(module => ({ default: module.AdminBlockedContentPage })));
const AdminUsersPage = React.lazy(() => import('../pages/admin/AdminUsersPage.jsx').then(module => ({ default: module.AdminUsersPage })));
const AdminAnalyticsPage = React.lazy(() => import('../pages/admin/AdminAnalyticsPage.jsx').then(module => ({ default: module.AdminAnalyticsPage })));
const AdminEnquiriesPage = React.lazy(() => import('../pages/admin/AdminEnquiriesPage.jsx').then(module => ({ default: module.AdminEnquiriesPage })));
const AdminMusicPage = React.lazy(() => import('../pages/admin/AdminMusicPage.jsx').then(module => ({ default: module.AdminMusicPage })));

export function AppRoutes() {

  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const { currentUser, isAdminLoggedIn } = useAuth();

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    const timer = setTimeout(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }, 50);
    return () => clearTimeout(timer);
  }, [currentPath]);

  const navigate = (path) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  };


  // Clean path normalization (strip trailing slashes, query params, hash)
  const normalizedPath = (currentPath ? currentPath.split('?')[0].split('#')[0].replace(/\/+$/, '') : '') || '/';

  // 1. Root Landing Page: ALWAYS renders LandingPage regardless of auth status
  if (normalizedPath === '/' || normalizedPath === '/index.html') {
    return <LandingPage onNavigate={navigate} />;
  }

  // 2. Public Informational Routes
  if (normalizedPath === '/about') {
    return <AboutPage onNavigate={navigate} />;
  }
  if (normalizedPath === '/privacy-policy') {
    return <PrivacyPolicyPage onNavigate={navigate} />;
  }
  if (normalizedPath === '/community-guidelines') {
    return <CommunityGuidelinesPage onNavigate={navigate} />;
  }
  if (normalizedPath === '/contact') {
    return <ContactPage onNavigate={navigate} />;
  }
  if (normalizedPath === '/faq') {
    return <FaqPage onNavigate={navigate} />;
  }
  if (normalizedPath === '/delete-account') {
    return <DeleteAccountPage onNavigate={navigate} />;
  }

  // 3. Auth Routes: /login, /register, /forgot-password, /onboarding, /setup-profile
  if (normalizedPath === '/login') {
    return <LoginPage onNavigate={navigate} />;
  }
  if (normalizedPath === '/register') {
    return <RegisterPage onNavigate={navigate} />;
  }
  if (normalizedPath === '/forgot-password') {
    return <ForgotPasswordPage onNavigate={navigate} />;
  }
  if (normalizedPath === '/onboarding') {
    return <OnboardingPage onNavigate={navigate} />;
  }
  if (normalizedPath === '/setup-profile' || normalizedPath === '/profile-setup') {
    return <ProfileSetupWizardPage onNavigate={navigate} />;
  }

  // 4. Admin Routes
  if (normalizedPath === '/admin/login') {
    return <AdminLoginPage onNavigate={navigate} />;
  }
  if (normalizedPath.startsWith('/admin/') && (!isAdminLoggedIn || currentUser?.role !== 'ADMIN')) {
    return <AdminLoginPage onNavigate={navigate} />;
  }
  if (normalizedPath === '/admin/dashboard') {
    return <AdminDashboardPage onNavigate={navigate} />;
  }
  if (normalizedPath === '/admin/reports') {
    return <AdminReportsPage onNavigate={navigate} />;
  }
  if (normalizedPath.startsWith('/admin/reports/')) {
    const reportId = normalizedPath.split('/admin/reports/')[1];
    return <AdminReportDetailsPage reportId={reportId} onNavigate={navigate} />;
  }
  if (normalizedPath === '/admin/content-review') {
    return <AdminContentReviewPage onNavigate={navigate} />;
  }
  if (normalizedPath === '/admin/blocked-content') {
    return <AdminBlockedContentPage onNavigate={navigate} />;
  }
  if (normalizedPath === '/admin/enquiries') {
    return <AdminEnquiriesPage onNavigate={navigate} />;
  }
  if (normalizedPath === '/admin/users') {

    return <AdminUsersPage onNavigate={navigate} />;
  }
  if (normalizedPath === '/admin/analytics') {
    return <AdminAnalyticsPage onNavigate={navigate} />;
  }
  if (normalizedPath === '/admin/music') {
    return <AdminMusicPage onNavigate={navigate} />;
  }
  if (normalizedPath === '/admin/settings') {
    return <AdminDashboardPage onNavigate={navigate} />;
  }
  if (normalizedPath === '/admin/system-logs') {
    return <AdminBlockedContentPage onNavigate={navigate} />;
  }

  // 5. User App Protected Routes (redirect to /login if not logged in)
  if (!currentUser) {
    return <LoginPage onNavigate={navigate} />;
  }

  if (normalizedPath === '/dashboard') {
    return <DashboardPage onNavigate={navigate} />;
  }
  if (normalizedPath === '/home') {
    return <HomePage onNavigate={navigate} />;
  }
  if (normalizedPath.startsWith('/explore')) {
    return <ExplorePage onNavigate={navigate} />;
  }
  if (normalizedPath === '/music') {
    return <MusicPage onNavigate={navigate} />;
  }
  if (normalizedPath === '/create-post') {
    return <CreatePostPage onNavigate={navigate} />;
  }
  if (normalizedPath.startsWith('/topic/')) {
    const topicId = normalizedPath.split('/topic/')[1];
    return <TopicDiscussionPage topicId={topicId} onNavigate={navigate} />;
  }
  if (normalizedPath.startsWith('/post/')) {
    const postId = normalizedPath.split('/post/')[1];
    return <PostDetailsPage postId={postId} onNavigate={navigate} />;
  }
  // 1-on-1 Direct Chat route disabled as per topic-based platform requirements
  // if (normalizedPath.startsWith('/chat')) {
  //   const usernameParam = normalizedPath.startsWith('/chat/') ? normalizedPath.split('/chat/')[1] : null;
  //   return <ChatPage targetUsername={usernameParam} onNavigate={navigate} />;
  // }
  if (normalizedPath === '/notifications') {
    return <NotificationsPage onNavigate={navigate} />;
  }
  if (normalizedPath === '/saved') {
    return <SavedPostsPage onNavigate={navigate} />;
  }
  if (normalizedPath === '/my-posts') {
    return <MyPostsPage onNavigate={navigate} />;
  }
  if (normalizedPath === '/my-reports') {
    return <MyReportsPage onNavigate={navigate} />;
  }
  if (normalizedPath === '/profile' || normalizedPath === '/profile/me' || normalizedPath.startsWith('/profile/')) {
    let handle = null;
    if (normalizedPath === '/profile/me') {
      handle = null; // represents self
    } else if (normalizedPath.startsWith('/profile/')) {
      handle = normalizedPath.split('/profile/')[1];
    }
    return <ProfilePage username={handle} onNavigate={navigate} />;
  }
  if (normalizedPath === '/edit-profile') {
    return <EditProfilePage onNavigate={navigate} />;
  }
  if (normalizedPath === '/settings') {
    return <SettingsPage onNavigate={navigate} />;
  }
  if (normalizedPath === '/settings/privacy') {
    return <PrivacySettingsPage onNavigate={navigate} />;
  }
  if (normalizedPath === '/settings/account') {
    return <AccountSettingsPage onNavigate={navigate} />;
  }
  if (normalizedPath === '/settings/notifications') {
    return <NotificationSettingsPage onNavigate={navigate} />;
  }
  if (normalizedPath === '/settings/safety') {
    return <SafetyModerationPage onNavigate={navigate} />;
  }
  if (normalizedPath === '/help') {
    return <HelpSupportPage onNavigate={navigate} />;
  }

  // Fallback for unhandled routes
  return currentUser ? <HomePage onNavigate={navigate} /> : <LandingPage onNavigate={navigate} />;
}
