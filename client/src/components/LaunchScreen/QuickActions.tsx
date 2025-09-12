import React from 'react';
import './QuickActions.css';

interface QuickActionsProps {
  onSelectTemplate: (templateId: string) => void;
}

interface Template {
  id: string;
  title: string;
  description: string;
  prompt: string;
  icon: React.ReactNode;
}

// SVG Icons for consistent palette
const CharacterIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const SceneIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M8 21h8M12 21V3M4 7h16M4 12h16" />
  </svg>
);

const StoryIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
  </svg>
);

const ProductIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
    <line x1="8" y1="21" x2="16" y2="21" />
    <line x1="12" y1="17" x2="12" y2="21" />
  </svg>
);

const ArtIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
);

const RecipeIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M6 2L3 6v14c0 1.1.9 2 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <path d="M16 10a4 4 0 0 1-8 0" />
  </svg>
);

const templates: Template[] = [
  {
    id: 'character',
    title: 'Character Generator',
    description: 'Create varied character descriptions',
    prompt:
      'A warrior or mage, wearing armor or robes, carrying a sword or staff, with blonde or dark hair',
    icon: <CharacterIcon />
  },
  {
    id: 'scene',
    title: 'Scene Description',
    description: 'Build dynamic scene variations',
    prompt:
      'A forest or desert landscape, during day or night, with mountains or rivers in the background, peaceful or stormy weather',
    icon: <SceneIcon />
  },
  {
    id: 'story',
    title: 'Story Prompt',
    description: 'Generate story beginnings',
    prompt:
      'Once upon a time, in a kingdom or village, there lived a prince or peasant, who discovered a treasure or curse',
    icon: <StoryIcon />
  },
  {
    id: 'product',
    title: 'Product Description',
    description: 'Create product variations',
    prompt:
      'A modern or vintage style chair, made of wood or metal, in red or blue color, for indoor or outdoor use',
    icon: <ProductIcon />
  },
  {
    id: 'art',
    title: 'Art Prompt',
    description: 'Generate art descriptions',
    prompt:
      'Abstract or realistic painting, with warm or cool colors, featuring geometric or organic shapes, minimalist or detailed style',
    icon: <ArtIcon />
  },
  {
    id: 'food',
    title: 'Recipe Generator',
    description: 'Create recipe variations',
    prompt:
      'A sweet or savory dish, with chicken or tofu, seasoned with herbs or spices, served hot or cold',
    icon: <RecipeIcon />
  }
];

export const QuickActions: React.FC<QuickActionsProps> = ({
  onSelectTemplate
}) => {
  return (
    <div className="quick-actions">
      <div className="template-grid">
        {templates.map(template => (
          <button
            key={template.id}
            className="template-card"
            onClick={() => onSelectTemplate(template.id)}
            title={template.prompt}
          >
            <span className="template-icon">{template.icon}</span>
            <span className="template-title">{template.title}</span>
            <span className="template-description">{template.description}</span>
          </button>
        ))}
      </div>

      <div className="quick-actions-footer">
        <p className="hint">
          Click any template to load it into the prompt editor
        </p>
      </div>
    </div>
  );
};
