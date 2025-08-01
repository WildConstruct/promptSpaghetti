/**
 * Epic 16 Knowledge Base Article Viewer
 * 
 * Comprehensive article viewing component with table of contents,
 * interactive elements, feedback system, and accessibility features.
 */
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { KnowledgeBaseArticle,
  Epic16KnowledgeBaseService,
  ArticleRating,
  ArticleFeedback,
  FeedbackType,
  SectionType,
  InteractiveElementType }
  AIRecommendation
 from '../../services/Epic16KnowledgeBaseService';


interface KnowledgeBaseArticleViewerProps { article: KnowledgeBaseArticle;
  knowledgeService: Epic16KnowledgeBaseService;
  userId: string;
  onArticleSelect?: (articleId: string) => void;
  onClose?: () => void;
  interface ViewerState {
  loading: boolean;
  error: string | null;
  showTableOfContents: boolean;
  activeSection: string;
  userRating: number;
  userFeedback: string;
  feedbackType: FeedbackType;
  showFeedbackForm: boolean;
  recommendations: AIRecommendation;
  readingProgress: number;
  export const KnowledgeBaseArticleViewer: React.FC<KnowledgeBaseArticleViewerProps> = ({);
  article;
  knowledgeService;
  userId;
  onArticleSelect }
  onClose


}) => { // State management
  const [viewerState, setViewerState] = useState<ViewerState>({)
  loading: false
  error: null
  showTableOfContents: true
  activeSection: ''
  userRating: 0
  userFeedback: ''
  feedbackType: FeedbackType.IMPROVEMENT
  showFeedbackForm: false
  recommendations: []
  readingProgress: 0 }
});
  // Refs
  const contentRef = useRef<HTMLDivElement>(null);
  const sectionsRef = useRef<Map<string, HTMLElement>>(new Map());
  // Load recommendations
  useEffect(() => { const loadRecommendations = async () => {
  try {
  const recommendations = await knowledgeService.getRecommendations({)
  currentArticleId: article.id
  userSearchHistory: []
  viewedArticles: [article.id]
  userRole: 'user'
  userExperience: 'intermediate'
  timestamp: new Date() }
});
        setViewerState(prev => ({ ...prev, recommendations }));
 catch (error) { console.error('Failed to load recommendations:', error) };
    loadRecommendations();
  }, [article.id, knowledgeService]);
  // Track reading progress
  useEffect(() => {
    const handleScroll = () => {
      if (!contentRef.current) return;
      const { scrollTop, scrollHeight, clientHeight } = contentRef.current;
      const progress = Math.min((scrollTop / (scrollHeight - clientHeight)) * 100, 100);
      setViewerState(prev => ({ ...prev, readingProgress: progress }));
      // Update active section
      const sections = Array.from(sectionsRef.current.entries());
      let activeSection = '';
      for (const [sectionId, element] of sections) {
        const rect = element.getBoundingClientRect();
        if (rect.top <= 100 && rect.bottom > 100) {
          activeSection = sectionId;
          break;
      if (activeSection !== viewerState.activeSection) {
        setViewerState(prev => ({ ...prev, activeSection }));
    };
    const contentElement = contentRef.current;
    if (contentElement) { contentElement.addEventListener('scroll', handleScroll);
      return () => contentElement.removeEventListener('scroll', handleScroll) }, [viewerState.activeSection]);
  // Calculate average rating
  const averageRating = useMemo(() => { if (article.ratings.length === 0) return 0;
    return article.ratings.reduce((sum, rating) => sum + rating.rating, 0) / article.ratings.length }, [article.ratings]);
  // Get user's existing rating
  const existingRating = useMemo(() => { return article.ratings.find(rating => rating.userId === userId) }, [article.ratings, userId]);
  // Handle rating submission
  const handleRatingSubmit = useCallback(async (rating: number) => { try {
  await knowledgeService.rateArticle(article.id, {)
  userId,
  rating,
  helpful: rating >= 4 }
});
      setViewerState(prev => ({ ...prev, userRating: rating }));
 catch (error) { setViewerState(prev => ({)
  ...prev,
  error: error instanceof Error ? error.message : 'Failed to submit rating' }
}));
  }, [article.id, knowledgeService, userId]);
  // Handle feedback submission
  const handleFeedbackSubmit = useCallback(async () => {
    if (!viewerState.userFeedback.trim()) return;
    try {
      setViewerState(prev => ({ ...prev, loading: true }));
      await knowledgeService.submitFeedback(article.id, { )
  userId,
  type: viewerState.feedbackType,
  message: viewerState.userFeedback,
  status: 'new' as any }
});
      setViewerState(prev => ({ )
  ...prev,
  loading: false,
  userFeedback: '',
  showFeedbackForm: false }
}));
 catch (error) { setViewerState(prev => ({)
  ...prev,
  loading: false,
  error: error instanceof Error ? error.message : 'Failed to submit feedback' }
}));
  }, [article.id, knowledgeService, userId, viewerState.feedbackType, viewerState.userFeedback]);
  // Handle section navigation
  const scrollToSection = useCallback((sectionId: string) => {
    const element = sectionsRef.current.get(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);
  // Handle helpful vote
  const handleHelpfulVote = useCallback(async (helpful: boolean) => {
    try {
      // In a real implementation, this would call an API
      console.log(`Marked article as ${helpful ? 'helpful' : 'not helpful'}`);}
 catch (error) { console.error('Failed to submit helpful vote:', error) }, []);
  // Format date
  const formatDate = useCallback((date: Date) => { return new Intl.DateTimeFormat('en-US', {)
  year: 'numeric',
  month: 'long',
  day: 'numeric' }
}).format(date);
  }, []);
  // Format category name
  const formatCategoryName = useCallback((category: string) => { return category.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) }, []);
  // Render section content
  const renderSectionContent = useCallback((section: unknown) => { const setSectionRef = (element: HTMLElement | null) => { }
  if (element) { sectionsRef.current.set(section.id, element) };
    switch (section.type) {
    case SectionType.CODE:
      return;
        <div ref={setSectionRef} id={section.anchor} className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">{section.title}</h3>
          <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
            <code>{section.content}</code>
          </pre>
        </div>
      );
    case SectionType.WARNING:
      return;
        <div ref={setSectionRef} id={section.anchor} className="mb-6">
          <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-r-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">{section.title}</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{section.content}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    case SectionType.TIP:
      return;
        <div ref={setSectionRef} id={section.anchor} className="mb-6">
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">{section.title}</h3>
                <div className="mt-2 text-sm text-blue-700">
                  <p>{section.content}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    default:
      return;
        <div ref={setSectionRef} id={section.anchor} className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">{section.title}</h3>
          <div className="prose max-w-none text-gray-700">
            <div dangerouslySetInnerHTML={{ __html: section.content }} />
          </div>
        </div>
      );
  }, []);
  // Render stars
  const renderStars = useCallback((rating: number, interactive = false, onRate?: (rating: number) => void) => {
    return;
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map(star => ()
          <button
            key={star}
            onClick={() => interactive && onRate?.(star)}
            disabled={!interactive}
            className={`${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform`}
          >
            <svg
              className={ `w-5 h-5 ${
  star <= rating ? 'text-yellow-400' : 'text-gray-300' }
`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </button>
        ))}
      </div>
    );
  }, []);
  return;
    <div className="knowledge-base-article-viewer h-full flex bg-gray-50">
      {/* Reading Progress */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-gray-200 z-50">
        <div
          className="h-full bg-blue-600 transition-all duration-150"
          style={{ width: `${viewerState.readingProgress}%` }}
        />
      </div>
      {/* Table of Contents Sidebar */}
      {viewerState.showTableOfContents && ()
        <div className="w-80 bg-white border-r border-gray-200 overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Contents</h3>
              <button
                onClick={() => setViewerState(prev => ({ ...prev, showTableOfContents: false }))}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <nav className="space-y-2">
              {article.sections.map((section, index) => ()
                <button
                  key={section.id}
                  onClick={() => scrollToSection(section.id)}
                  className={ `w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
  viewerState.activeSection === section.id
  ? 'bg-blue-100 text-blue-700 border-l-2 border-blue-500'
  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100' }
`}
                >
                  <span className="text-xs text-gray-400 mr-2">{index + 1}.</span>
                  {section.title}
                </button>
              ))}
            </nav>
            {/* Article metadata */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="space-y-3 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Category:</span>
                  <span className="ml-2 text-gray-600">{formatCategoryName(article.category)}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Reading Time:</span>
                  <span className="ml-2 text-gray-600">{article.estimatedReadTime} minutes</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Last Updated:</span>
                  <span className="ml-2 text-gray-600">{formatDate(article.lastUpdated)}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Views:</span>
                  <span className="ml-2 text-gray-600">{article.views.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-8 py-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              {!viewerState.showTableOfContents && ()
                <button
                  onClick={() => setViewerState(prev => ({ ...prev, showTableOfContents: true }))}
                  className="p-2 text-gray-400 hover:text-gray-600"
                  title="Show table of contents"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              )}
              <div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {formatCategoryName(article.category)}
                </span>
                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  {formatCategoryName(article.type)}
                </span>
              </div>
            </div>
            {onClose && ()
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{article.title}</h1>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6 text-sm text-gray-500">
              <div className="flex items-center">
                <span>By {article.author}</span>
              </div>
              <div className="flex items-center space-x-1">
                {renderStars(averageRating)}
                <span className="ml-1">({article.ratings.length} reviews)</span>
              </div>
              <div>
                Updated {formatDate(article.lastUpdated)}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleHelpfulVote(true)}
                className="inline-flex items-center px-3 py-1 border border-green-300 text-sm leading-4 font-medium rounded-md text-green-700 bg-green-50 hover:bg-green-100"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                </svg>
                Helpful ({article.helpfulVotes})
              </button>
              <button
                onClick={() => handleHelpfulVote(false)}
                className="inline-flex items-center px-3 py-1 border border-red-300 text-sm leading-4 font-medium rounded-md text-red-700 bg-red-50 hover:bg-red-100"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018c.163 0 .326.02.485.06L17 4m-7 10v2a2 2 0 002 2h.095c.5 0 .905-.405.905-.905 0-.714.211-1.412.608-2.006L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5" />
                </svg>
                Not Helpful ({article.unhelpfulVotes})
              </button>
            </div>
          </div>
        </div>
        {/* Article Content */}
        <div
          ref={contentRef}
          className="flex-1 overflow-y-auto px-8 py-6"
        >
          {/* Article excerpt */}
          {article.excerpt && ()
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-8">
              <p className="text-blue-800 font-medium">{article.excerpt}</p>
            </div>
          )}
          {/* Article sections */}
          <div className="max-w-4xl">
            {article.sections.map(section => renderSectionContent(section))}
          </div>
          {/* Code examples */}
          {article.codeExamples.length > 0 && ()
            <div className="mt-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Code Examples</h2>
              <div className="space-y-6">
                {article.codeExamples.map(example => ()
                  <div key={example.id} className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-gray-900">{example.title}</h3>
                        <span className="text-sm text-gray-500">{example.language}</span>
                      </div>
                      {example.description && ()
                        <p className="text-sm text-gray-600 mt-1">{example.description}</p>
                      )}
                    </div>
                    <pre className="bg-gray-900 text-gray-100 p-4 overflow-x-auto">
                      <code>{example.code}</code>
                    </pre>
                    {example.output && ()
                      <div className="bg-gray-50 px-4 py-2 border-t border-gray-200">
                        <div className="text-sm text-gray-600">Output:</div>
                        <pre className="text-sm text-gray-800 mt-1">{example.output}</pre>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          {/* Related articles */}
          {article.relatedArticles.length > 0 && ()
            <div className="mt-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Related Articles</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {article.relatedArticles.slice(0, 4).map(relatedId => ()
                  <button
                    key={relatedId}
                    onClick={() => onArticleSelect?.(relatedId)}
                    className="text-left p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all"
                  >
                    <div className="font-medium text-blue-600 mb-1">Related Article</div>
                    <div className="text-sm text-gray-600">Click to view related content</div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        {/* Footer - Rating and Feedback */}
        <div className="bg-white border-t border-gray-200 px-8 py-6">
          <div className="max-w-4xl">
            {/* Rating Section */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Rate this article</h3>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">Your rating:</span>
                  {renderStars(existingRating?.rating || viewerState.userRating, true, handleRatingSubmit)}
                </div>
                {existingRating && ()
                  <span className="text-sm text-green-600">Thank you for rating!</span>
                )}
              </div>
            </div>
            {/* Feedback Section */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-medium text-gray-900">Feedback</h3>
                <button
                  onClick={() => setViewerState(prev => ({ ...prev, showFeedbackForm: !prev.showFeedbackForm }))}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  {viewerState.showFeedbackForm ? 'Cancel' : 'Leave Feedback'}
                </button>
              </div>
              {viewerState.showFeedbackForm && ()
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Feedback Type
                      </label>
                      <select
                        value={viewerState.feedbackType}
                        onChange={(e) => setViewerState(prev => ({ ...prev, feedbackType: e.target.value as FeedbackType }))}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                      >
                        {Object.values(FeedbackType).map(type => ()
                          <option key={type} value={type}>
                            {formatCategoryName(type)}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Your feedback
                    </label>
                    <textarea
                      value={viewerState.userFeedback}
                      onChange={(e) => setViewerState(prev => ({ ...prev, userFeedback: e.target.value }))}
                      placeholder="Share your thoughts about this article..."
                      rows={3}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    />
                  </div>
                  <div className="flex justify-end">
                    <button
                      onClick={handleFeedbackSubmit}
                      disabled={!viewerState.userFeedback.trim() || viewerState.loading}
                      className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {viewerState.loading ? 'Submitting...' : 'Submit Feedback'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* Recommendations Sidebar */}
      {viewerState.recommendations.length > 0 && ()
        <div className="w-80 bg-white border-l border-gray-200 overflow-y-auto">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recommended for You</h3>
            <div className="space-y-4">
              {viewerState.recommendations.slice(0, 5).map(recommendation => ()
                <button
                  key={recommendation.articleId}
                  onClick={() => onArticleSelect?.(recommendation.articleId)}
                  className="w-full text-left p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-blue-600">Recommended Article</span>
                    <span className="text-xs text-gray-500">{Math.round(recommendation.score * 100)}% match</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    {formatCategoryName(recommendation.reason)}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KnowledgeBaseArticleViewer;