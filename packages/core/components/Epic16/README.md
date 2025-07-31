# Epic 16 UI Components - Design Pattern Library

A comprehensive collection of React components for the Epic 16 marketplace and community ecosystem, designed with consistent patterns, accessibility, and modern UI/UX principles.

## Overview

The Epic 16 component library provides a complete set of UI components for building marketplace and community features including:

- **Marketplace Components**: Template discovery, search, preview, and purchase flows
- **Community Components**: Forum posts, discussions, and user engagement
- **Integration Components**: Ticket management and support systems

## Components

### Marketplace Components

#### MarketplaceCard

Display marketplace templates with consistent design patterns.

```tsx
import { MarketplaceCard, MarketplaceTemplate } from '@/components/Epic16';

const template: MarketplaceTemplate = {
  id: 'template-1',
  title: 'Story Writing Assistant',
  description: 'Generate engaging stories with character development...',
  price: 999, // $9.99 in cents
  currency: 'USD',
  rating: 4.8,
  reviewCount: 156,
  // ... other properties
};

<MarketplaceCard
  template={template}
  variant="grid" // 'grid' | 'list' | 'featured'
  onPreview={template => console.log('Preview:', template)}
  onPurchase={template => console.log('Purchase:', template)}
/>;
```

**Props:**

- `template: MarketplaceTemplate` - Template data
- `variant?: 'grid' | 'list' | 'featured'` - Display variant
- `showActions?: boolean` - Show action buttons
- `onPreview?: (template) => void` - Preview callback
- `onPurchase?: (template) => void` - Purchase callback
- `onLike?: (template) => void` - Like callback
- `onShare?: (template) => void` - Share callback

#### TemplatePreviewModal

Modal for previewing templates with Claude integration.

```tsx
import { TemplatePreviewModal } from '@/components/Epic16';

<TemplatePreviewModal
  template={template}
  isOpen={isPreviewOpen}
  onClose={() => setIsPreviewOpen(false)}
  onPurchase={handlePurchase}
  onPreviewGenerate={async (template, input, model) => {
    // Call Claude API for preview
    return {
      output: 'Generated content...',
      cost: 0.0023,
      qualityScore: 4.5,
      tokens: 150,
      model: 'claude-3-haiku',
      executionTime: 1200,
    };
  }}
  isPurchased={false}
  currentUser={{ id: 'user-1', name: 'John Doe', tier: 'pro' }}
/>;
```

**Features:**

- Live Claude preview with sandboxed content protection
- Model selection and rate limiting
- Tabbed interface (Preview, Details, Reviews)
- Purchase flow integration
- Cost and performance metrics

#### MarketplaceSearch

Advanced search with autocomplete and filters.

```tsx
import { MarketplaceSearch, SearchFilters } from '@/components/Epic16';

const handleSearch = (query: string, filters: SearchFilters) => {
  // Perform search with query and filters
  console.log('Search:', query, filters);
};

<MarketplaceSearch
  onSearch={handleSearch}
  availableTags={['story', 'business', 'creative']}
  availableCreators={[{ id: 'creator-1', name: 'John Smith', templateCount: 15 }]}
  searchSuggestions={[
    { text: 'story prompts', type: 'query', count: 42 },
    { text: 'creative writing', type: 'tag', count: 28 },
  ]}
  isLoading={false}
  resultCount={156}
/>;
```

**Features:**

- Real-time autocomplete suggestions
- Advanced filter panel (price, rating, compatibility, content type)
- Sort options (relevance, price, rating, downloads, date)
- Active filter display with removal
- Responsive design

### Community Components

#### CommunityForumCard

Display forum posts and discussions.

```tsx
import { CommunityForumCard, ForumPost } from '@/components/Epic16';

const post: ForumPost = {
  id: 'post-1',
  title: 'Best practices for prompt engineering',
  content: 'Full post content...',
  contentPreview: 'Truncated preview...',
  author: {
    id: 'user-1',
    name: 'Jane Doe',
    reputation: 1250,
    badges: ['Expert', 'Helper'],
    isVerified: true,
    isModerator: false,
  },
  likes: 45,
  replies: 12,
  views: 890,
  // ... other properties
};

<CommunityForumCard
  post={post}
  variant="detailed" // 'compact' | 'detailed' | 'featured'
  currentUser={currentUser}
  onLike={postId => console.log('Like post:', postId)}
  onReply={postId => console.log('Reply to:', postId)}
  onClick={post => console.log('View post:', post)}
/>;
```

**Features:**

- Multiple display variants (compact, detailed, featured)
- User badges and verification status
- Engagement actions (like, dislike, bookmark, reply)
- Moderation controls for privileged users
- Content preview with tags and attachments
- Report system integration

### Integration Components

#### Epic16TicketIntegration

Complete ticket management system.

```tsx
import { Epic16TicketIntegration } from '@/components/Epic16';

<Epic16TicketIntegration
  userId="user-123"
  userRole="agent" // 'user' | 'agent' | 'admin'
  config={{
    enabled: true,
    autoAssignment: true,
    slaTracking: true,
  }}
  onConfigChange={config => console.log('Config updated:', config)}
/>;
```

**Features:**

- Dashboard view with ticket overview
- Detailed ticket management
- Real-time notifications
- Admin settings panel
- Help and documentation system

## Design System

### Theme Configuration

```tsx
import { Epic16ComponentTheme, defaultEpic16Theme } from '@/components/Epic16';

const customTheme: Epic16ComponentTheme = {
  ...defaultEpic16Theme,
  primary: '#7c3aed', // Custom primary color
  accent: '#f59e0b', // Custom accent color
};

// Apply theme via CSS custom properties or styled-components
```

### Design Tokens

```tsx
import { Epic16DesignTokens } from '@/components/Epic16';

const spacing = Epic16DesignTokens.spacing.md; // '1rem'
const fontSize = Epic16DesignTokens.fontSize.lg; // '1.125rem'
const shadow = Epic16DesignTokens.boxShadow.md;
```

## Accessibility

All components follow WCAG 2.1 AA guidelines:

- **Keyboard Navigation**: Full keyboard support with logical tab order
- **Screen Reader Support**: Proper ARIA labels and semantic markup
- **Color Contrast**: Minimum 4.5:1 contrast ratio for all text
- **Focus Management**: Clear focus indicators and modal focus trapping
- **Responsive Design**: Mobile-first responsive layouts

## Best Practices

### Performance

- Components use React.memo() for performance optimization
- Large lists should implement virtualization
- Images use lazy loading and proper sizing
- Search implements debouncing to reduce API calls

### Error Handling

- All async operations include error boundaries
- Graceful degradation for missing data
- User-friendly error messages
- Retry mechanisms for failed operations

### Security

- Input sanitization for user-generated content
- XSS protection for rendered HTML
- Rate limiting integration for API calls
- Content Security Policy compliance

## Integration Examples

### Basic Marketplace Page

```tsx
import React, { useState } from 'react';
import { MarketplaceSearch, MarketplaceCard, TemplatePreviewModal, SearchFilters } from '@/components/Epic16';

export const MarketplacePage = () => {
  const [templates, setTemplates] = useState([]);
  const [previewTemplate, setPreviewTemplate] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async (query: string, filters: SearchFilters) => {
    setIsLoading(true);
    try {
      const results = await searchTemplates(query, filters);
      setTemplates(results);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <MarketplaceSearch onSearch={handleSearch} isLoading={isLoading} resultCount={templates.length} />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map(template => (
            <MarketplaceCard
              key={template.id}
              template={template}
              onPreview={setPreviewTemplate}
              onPurchase={handlePurchase}
            />
          ))}
        </div>
      </div>

      {previewTemplate && (
        <TemplatePreviewModal
          template={previewTemplate}
          isOpen={!!previewTemplate}
          onClose={() => setPreviewTemplate(null)}
          onPurchase={handlePurchase}
          onPreviewGenerate={generatePreview}
        />
      )}
    </div>
  );
};
```

### Community Forum Integration

```tsx
import React, { useState, useEffect } from 'react';
import { CommunityForumCard, ForumPost } from '@/components/Epic16';

export const ForumPage = () => {
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [currentUser, setCurrentUser] = useState(null);

  const handlePostInteraction = async (postId: string, action: string) => {
    // Handle post interactions (like, reply, etc.)
    await performPostAction(postId, action);
    // Refresh posts or update local state
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="space-y-6">
        {posts.map(post => (
          <CommunityForumCard
            key={post.id}
            post={post}
            variant="detailed"
            currentUser={currentUser}
            onLike={id => handlePostInteraction(id, 'like')}
            onReply={id => handlePostInteraction(id, 'reply')}
            onClick={post => navigateToPost(post.id)}
          />
        ))}
      </div>
    </div>
  );
};
```

## Testing

Components include comprehensive test coverage:

```bash
# Run all Epic 16 component tests
npm test components/Epic16

# Run specific component tests
npm test MarketplaceCard.test.tsx
npm test TemplatePreviewModal.test.tsx
```

## Contributing

When adding new components:

1. Follow the established TypeScript patterns
2. Include comprehensive prop documentation
3. Implement accessibility features
4. Add unit and integration tests
5. Update this README with usage examples

## Dependencies

Core dependencies used by Epic 16 components:

- React 18+
- TypeScript 4.5+
- Tailwind CSS 3.0+
- Headless UI (for accessible components)
- React Hook Form (for form handling)
- Date-fns (for date formatting)

Optional dependencies for enhanced features:

- Framer Motion (for animations)
- React Virtualized (for large lists)
- React Query (for data fetching)
