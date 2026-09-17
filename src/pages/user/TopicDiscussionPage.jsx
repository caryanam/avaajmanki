import React, { useEffect, useRef, useState } from 'react';
import { Clock, Flame } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { UserLayout } from '../../components/layout/UserLayout.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { apiTopicService } from '../../services/apiTopicService.js';
import { apiCommentService } from '../../services/apiCommentService.js';
import { mapComment } from '../../services/apiMappers.js';
import { useLanguage, getLanguageCode } from '../../context/LanguageContext.jsx';
import { InitialAvatar } from '../../components/profile/InitialAvatar.jsx';
import { TopicBackgroundRotator } from '../../components/topics/TopicBackgroundRotator.jsx';
import { CommentComposer } from '../../components/comments/CommentComposer.jsx';
import { CommentCard } from '../../components/comments/CommentCard.jsx';
import { useComments } from '../../context/CommentContext.jsx';

export function TopicDiscussionPage({ topicId, onNavigate }) {
  const { addToast } = useToast();
  const { t, currentLanguage, translateTextAsync } = useLanguage();
  const { activeReplyCommentId } = useComments();
  const [topic, setTopic] = useState(null);
  const [translatedTopic, setTranslatedTopic] = useState('');
  const commentStreamRef = useRef(null);

  // TanStack Query for Topic Discussion Comments with 3-second refetchInterval
  const commentsQuery = useQuery({
    queryKey: ['topic-comments', topicId],
    queryFn: async () => {
      const topics = await apiTopicService.getTopics();
      let matchedTopic = topics.find((item) => String(item.id) === String(topicId));
      if (!matchedTopic && isNaN(Number(topicId))) {
        matchedTopic = topics.find((item) => String(item.name || '').toUpperCase() === String(topicId || '').toUpperCase());
      }
      if (matchedTopic) setTopic(matchedTopic);
      const targetNumericId = matchedTopic?.id || (isNaN(Number(topicId)) ? null : Number(topicId));
      if (!targetNumericId) return [];

      const response = await apiCommentService.getCommentsByTopicId(targetNumericId);
      const raw = response?.data?.content || response?.data || [];
      return Array.isArray(raw) ? [...raw].sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0)) : [];
    },
    refetchInterval: 3000,
    staleTime: 1000,
  });

  const comments = commentsQuery.data || [];
  const loading = commentsQuery.isLoading && comments.length === 0;

  useEffect(() => {
    const source = topic?.label || topic?.name || '';
    let active = true;
    if (!source) return;
    setTranslatedTopic(source);
    if (currentLanguage !== 'English') translateTextAsync(source, currentLanguage).then((value) => active && setTranslatedTopic(value || source)).catch(() => {});
    return () => { active = false; };
  }, [topic, currentLanguage, translateTextAsync]);

  useEffect(() => {
    if (commentStreamRef.current) commentStreamRef.current.scrollTop = commentStreamRef.current.scrollHeight;
  }, [comments.length]);

  const submit = async (content, attachedImageUrl) => {
    const targetNumericId = topic?.id || (isNaN(Number(topicId)) ? null : Number(topicId));
    if (!targetNumericId) {
      addToast('Invalid topic discussion.', 'error');
      return;
    }
    try {
      await apiCommentService.createTopicComment(targetNumericId, content, getLanguageCode(currentLanguage), attachedImageUrl);
      await commentsQuery.refetch();
    } catch (error) {
      addToast(error?.response?.data?.message || 'Unable to add your opinion.', 'error');
    }
  };

  const submitReply = async (commentId, content) => {
    try {
      await apiCommentService.replyToComment(commentId, content, getLanguageCode(currentLanguage));
      await commentsQuery.refetch();
    } catch (error) { addToast(error?.response?.data?.message || t('replyFailed', 'Unable to add your reply.'), 'error'); }
  };

  const normalizeComment = (comment) => mapComment(comment);

  return <UserLayout activeRoute="/home" onNavigate={onNavigate} wide>
    <TopicBackgroundRotator topicName={topic?.name || 'GENERAL'}>
    <div style={{ width: '100%', maxWidth: 1200, height: 'calc(100vh - 92px)', margin: '0 auto', padding: '8px 0 16px', display: 'flex', flexDirection: 'column' }}>
      <section style={{ background: 'linear-gradient(135deg, #432E27 0%, #34231E 100%)', borderRadius: '18px 18px 0 0', padding: '18px 26px', color: '#fff', boxShadow: '0 8px 24px rgba(45,29,21,.18)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <InitialAvatar username={translatedTopic || topic?.name || 'TOPIC'} size={68} />
          <div className="flex-col gap-xs">
            <div className="flex-row gap-sm" style={{ alignItems: 'center', flexWrap: 'wrap' }}>
              <h1 style={{ color: '#fff', fontSize: 28, margin: 0 }}>#{translatedTopic || t('topicDiscussion', 'Topic discussion')}</h1>
              <span style={{ background: '#D96C3D', padding: '4px 12px', borderRadius: 14, fontSize: 12, fontWeight: 800 }}>{t('trendingTopic', 'Trending Topic')}</span>
            </div>
            <div className="flex-row gap-md" style={{ color: 'rgba(255,255,255,.9)', flexWrap: 'wrap' }}>
              <span className="flex-row gap-xs" style={{ alignItems: 'center' }}><Clock size={15} />{t('recentlyUpdated', 'Recently updated')}</span>
              <span className="flex-row gap-xs" style={{ alignItems: 'center' }}><Flame size={15} />{comments.length} {t('opinionsShared', 'Opinions shared')}</span>
            </div>
          </div>
        </div>
      </section>

      <section style={{ minHeight: 0, flex: 1, display: 'flex', flexDirection: 'column', background: 'rgba(255,255,255,.96)', border: '1px solid rgba(111,64,95,.12)', borderTop: 0, borderRadius: '0 0 18px 18px', overflow: 'hidden' }}>
        <div style={{ padding: '10px 20px', color: '#6F405F', fontWeight: 800, borderBottom: '1px solid #EAE2E0', flexShrink: 0 }}>{t('comments', 'Comments')} ({comments.length})</div>
        <div ref={commentStreamRef} className="hide-scrollbar" style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '14px 22px' }}>
          {loading ? <div>{t('loadingOpinions', 'Loading opinions...')}</div> : comments.map((comment) =>
            <div key={comment.id} style={{ padding: '10px 0', borderBottom: '1px solid #EEE8E6' }}><CommentCard comment={normalizeComment(comment)} postId={null} onNavigate={onNavigate} onReplySubmit={submitReply} /></div>)}
          {!loading && comments.length === 0 && <div style={{ textAlign: 'center', color: '#8C8385', padding: 30 }}>{t('noOpinionsYet', 'No opinions yet. Start the discussion.')}</div>}
        </div>
        {!activeReplyCommentId && (
          <div style={{ padding: '10px 16px', borderTop: '1px solid #E5DFDE', background: '#fff', flexShrink: 0 }}>
            <CommentComposer onSubmit={submit} enableImage placeholder={t('writeCommentPlaceholder', 'Write a comment...')} onNavigate={onNavigate} />
          </div>
        )}
      </section>
    </div>
    </TopicBackgroundRotator>
  </UserLayout>;
}
