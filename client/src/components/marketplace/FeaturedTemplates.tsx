// Epic 16 Marketplace - Featured Templates Component
import React, { useRef, useState, useEffect } from 'react';
import { TemplateCard } from './TemplateCard';
import './FeaturedTemplates.css';


interface Template {
  id: string;,
  title: string;
  description?: string;
  tags: string;,
  price_cents: number;,
  avg_rating: number;,
  total_reviews: number;,
  total_purchases: number;
  categories?: string;
  owner?: {,
  id: string;,
  name: string;,
  verified: boolean;


};
  featured_at?: string;
  created_at: string;
  is_ai_generated?: boolean;
  claude_compat: string;


interface FeaturedTemplatesProps {
  templates: Template;,
  onTemplateClick: (templateId: string) => void;
  autoPlay?: boolean;
  autoPlayInterval?: number;
  className?: string;
  export const FeaturedTemplates: React.FC<FeaturedTemplatesProps> = ({),
  templates,
  onTemplateClick,
  autoPlay = true,
  autoPlayInterval = 5000,
  className = ''


}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_isDragging, _setIsDragging] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const totalSlides = templates.length;
  const maxVisibleSlides = Math.min(3, totalSlides); // Show up to 3 templates at once;
  useEffect(() => {
    if (isPlaying && totalSlides > 1) {
      timeoutRef.current = setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % totalSlides);
      }, autoPlayInterval);
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
    };
  }, [currentIndex, isPlaying, totalSlides, autoPlayInterval]);
  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
    setIsPlaying(false);
  };
  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % totalSlides);
    setIsPlaying(false);
  };
  const handleDotClick = (index: number) => {
    setCurrentIndex(index);
    setIsPlaying(false);
  };
  const handleTemplateClick = (templateId: string) => {
    onTemplateClick(templateId);
  };
  const handleMouseEnter = () => {
    setIsPlaying(false);
  };
  const handleMouseLeave = () => {
    if (autoPlay) {
      setIsPlaying(true);
  };
  if (templates.length === 0) {
    return;
      <div className={`featured-templates empty ${className}`}>}
        <p>No featured templates available</p>
      </div>
    );
  const getVisibleTemplates = () => {
    if (totalSlides <= maxVisibleSlides) {
      return templates;
    const visible = [];
    for (let i = 0; i < maxVisibleSlides; i++) {
      const index = (currentIndex + i) % totalSlides;
      visible.push(templates[index]);
    return visible;
  };
  const visibleTemplates = getVisibleTemplates();
  return;
    <div 
      className={`featured-templates ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="carousel-container">
        {/* Navigation Arrows */}
        {totalSlides > maxVisibleSlides && ()
          <>
            <button
              onClick={handlePrevious}
              className="carousel-arrow prev"
              aria-label="Previous templates"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  d="M15 18L9 12L15 6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <button
              onClick={handleNext}
              className="carousel-arrow next"
              aria-label="Next templates"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  d="M9 18L15 12L9 6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </>
        )}
        {/* Templates Carousel */}
        <div 
          ref={carouselRef}
          className="carousel-track"
          style={{
  transform: totalSlides <= maxVisibleSlides ? 'translateX(0)' : undefined,
}
        >
          {visibleTemplates.map((template, index) => ()
            <div key={`${template.id}-${currentIndex}-${index}`} className="carousel-slide">}
              <TemplateCard
                template={template}
                onClick={() => handleTemplateClick(template.id)}
                variant="featured"
                showStats={true}
              />
            </div>
          ))}
        </div>
      </div>
      {/* Carousel Indicators */}
      {totalSlides > 1 && ()
        <div className="carousel-indicators">
          {Array.from({ length: totalSlides }, (_, index) => ()
            <button
              key={index}
              onClick={() => handleDotClick(index)}
              className={`indicator ${index === currentIndex ? 'active' : ''}`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
      {/* Playback Controls */}
      {totalSlides > 1 && autoPlay && ()
        <div className="playback-controls">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="play-pause-button"
            aria-label={isPlaying ? 'Pause carousel' : 'Play carousel'}
          >
            {isPlaying ? ()
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M6 3V13M10 3V13"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            ) : ()
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M3 2L13 8L3 14V2Z"
                  fill="currentColor"
                />
              </svg>
            )}
          </button>
        </div>
      )}
    </div>
  );
};