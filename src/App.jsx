import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastProvider } from './context/ToastContext.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { LanguageProvider } from './context/LanguageContext.jsx';
import { PostProvider } from './context/PostContext.jsx';
import { CommentProvider } from './context/CommentContext.jsx';
import { NotificationProvider } from './context/NotificationContext.jsx';
import { ReportProvider } from './context/ReportContext.jsx';
import { ChatProvider } from './context/ChatContext.jsx';
import { MoodMusicProvider } from './context/MoodMusicContext.jsx';
import { AppRoutes } from './routes/AppRoutes.jsx';
import { ToastContainer } from './components/common/Toast.jsx';
import { GlobalTranslationOverlay } from './components/common/GlobalTranslationOverlay.jsx';
import './styles/global.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 3,
      refetchOnWindowFocus: false,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <AuthProvider>
          <LanguageProvider>
            <MoodMusicProvider>
              <PostProvider>
                <CommentProvider>
                  <NotificationProvider>
                    <ReportProvider>
                      <ChatProvider>
                        <React.Suspense fallback={<div role="status" style={{ padding: '32px', textAlign: 'center' }}>Loading…</div>}>
                          <AppRoutes />
                        </React.Suspense>
                        <ToastContainer />
                        <GlobalTranslationOverlay />
                      </ChatProvider>
                    </ReportProvider>
                  </NotificationProvider>
                </CommentProvider>
              </PostProvider>
            </MoodMusicProvider>
          </LanguageProvider>
        </AuthProvider>
      </ToastProvider>
    </QueryClientProvider>
  );
}
