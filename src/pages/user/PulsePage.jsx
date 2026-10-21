import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AppHeader } from '../../components/layout/AppHeader.jsx';
import { DesktopSidebar } from '../../components/layout/DesktopSidebar.jsx';
import { MobileNavigation } from '../../components/layout/MobileNavigation.jsx';
import { PulseHeader } from '../../components/pulse/PulseHeader.jsx';
import { PulseFeaturedHero } from '../../components/pulse/PulseFeaturedHero.jsx';
import { PulseSecondaryCards } from '../../components/pulse/PulseSecondaryCards.jsx';
import { PulseConversationPreview } from '../../components/pulse/PulseConversationPreview.jsx';
import { PulseLatestNewsGrid } from '../../components/pulse/PulseLatestNewsGrid.jsx';
import { PulseTrendingNow } from '../../components/pulse/PulseTrendingNow.jsx';
import { PulseTechnologySpotlight } from '../../components/pulse/PulseTechnologySpotlight.jsx';
import { PulseCommunityCTA } from '../../components/pulse/PulseCommunityCTA.jsx';
import { apiPulseService } from '../../services/apiPulseService.js';

export function PulsePage({ onNavigate }) {
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [page, setPage] = useState(0);

  // 1. Fetch Featured Pulse Editorial Stories
  const { data: featuredStories = [] } = useQuery({
    queryKey: ['pulse-featured-editorial'],
    queryFn: async () => {
      try {
        const res = await apiPulseService.getFeaturedPulseItems(10);
        return Array.isArray(res) ? res : [];
      } catch (err) {
        console.error('Failed to fetch featured pulse items:', err);
        return [];
      }
    },
    staleTime: 60000,
  });

  // 2. Fetch Public Pulse Articles by Topic with Pagination
  const {
    data: articlesData,
    isLoading: isArticlesLoading,
  } = useQuery({
    queryKey: ['pulse-public-items', selectedCategory, page],
    queryFn: async () => {
      try {
        const queryTopic = selectedCategory === 'ALL' ? null : selectedCategory;
        const res = await apiPulseService.getPulseItems({
          topic: queryTopic,
          page,
          size: 24, // Sufficient pool for responsive 3-column grid & client sorting
        });
        return res || { content: [], totalPages: 1 };
      } catch (err) {
        console.error('Failed to fetch pulse articles:', err);
        return { content: [], totalPages: 1 };
      }
    },
    staleTime: 30000,
  });

  const articlesList = articlesData?.content || [];
  const totalPages = articlesData?.totalPages || 1;

  // Combine active stories to power trending calculations and sidebar metrics
  const allLoadedArticles = [...featuredStories, ...articlesList].reduce((acc, current) => {
    const x = acc.find((item) => item.id === current.id);
    if (!x) {
      return acc.concat([current]);
    }
    return acc;
  }, []);

  const handleSelectCategory = (catId) => {
    setSelectedCategory(catId);
    setPage(0);
  };

  // Active discussion story: select story with live discussions if available, or top featured story
  const discussionStory = allLoadedArticles.find(
    (item) => (Number(item.commentCount || 0) + Number(item.takeCount || 0)) > 0
  ) || featuredStories[0] || articlesList[0] || null;

  const discussionStoryId = discussionStory?.id || null;

  // Secondary news cards display top 2 articles
  const secondaryArticles = articlesList.length >= 2
    ? articlesList.slice(0, 2)
    : (featuredStories.length > 2 ? featuredStories.slice(1, 3) : articlesList);

  // Latest stories grid displays remaining items on page 0 to avoid duplicate cards
  const latestArticles = (page === 0 && articlesList.length > 2)
    ? articlesList.slice(2)
    : articlesList;

  return (
    <div className="pulse-dashboard-root">
      {/* ── TOP APPLICATION HEADER ── */}
      <AppHeader onNavigate={onNavigate} />

      {/* ── THREE-COLUMN DESKTOP GRID ── */}
      <div className="pulse-desktop-grid">
        {/* Column 1: Left Navigation & Promo Sidebar */}
        <DesktopSidebar
          activeRoute="/pulse"
          onNavigate={onNavigate}
        />

        {/* Column 2: Central News Content Area */}
        <main className="pulse-center-stream" id="pulse-main-content">
          {/* A. Awaaj Pulse Header */}
          <PulseHeader
            selectedCategory={selectedCategory}
            onSelectCategory={handleSelectCategory}
          />

          {/* B. Featured News Hero Carousel */}
          <PulseFeaturedHero
            featuredStories={featuredStories}
            onNavigate={onNavigate}
          />

          {/* C. Secondary News Cards */}
          <PulseSecondaryCards
            articles={secondaryArticles}
            onNavigate={onNavigate}
          />

          {/* D. The Conversation */}
          <PulseConversationPreview
            featuredStoryId={discussionStoryId}
            featuredStory={discussionStory}
            onNavigate={onNavigate}
          />

          {/* E. Latest Stories */}
          <PulseLatestNewsGrid
            articles={latestArticles}
            isLoading={isArticlesLoading}
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
            onNavigate={onNavigate}
          />
        </main>

        {/* Column 3: Right Information Sidebar */}
        <aside className="pulse-right-sidebar" aria-label="Pulse News Insights">
          {/* A. Trending Now */}
          <PulseTrendingNow
            articles={allLoadedArticles}
            onNavigate={onNavigate}
          />

          {/* B. Technology Spotlight Carousel */}
          <PulseTechnologySpotlight
            onSelectCategory={handleSelectCategory}
            onNavigate={onNavigate}
          />

          {/* C. Community Discussion CTA */}
          <PulseCommunityCTA
            featuredStoryId={discussionStoryId}
            onNavigate={onNavigate}
          />
        </aside>
      </div>

      {/* Mobile Navigation Bar for Viewports < 768px */}
      <MobileNavigation activeRoute="/pulse" onNavigate={onNavigate} />
    </div>
  );
}


