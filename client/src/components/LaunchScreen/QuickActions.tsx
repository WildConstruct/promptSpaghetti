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
  icon: string;
}

const templates: Template[] = [
  {
    id: 'character',
    title: 'Character Generator',
    description: 'Create varied character descriptions',
    prompt: 'A warrior or mage, wearing armor or robes, carrying a sword or staff, with blonde or dark hair',
    icon: '⚔️',
  },
  {
    id: 'scene',
    title: 'Scene Description',
    description: 'Build dynamic scene variations',
    prompt: 'A forest or desert landscape, during day or night, with mountains or rivers in the background, peaceful or stormy weather',
    icon: '🏞️',
  },
  {
    id: 'story',
    title: 'Story Prompt',
    description: 'Generate story beginnings',
    prompt: 'Once upon a time, in a kingdom or village, there lived a prince or peasant, who discovered a treasure or curse',
    icon: '📖',
  },
  {
    id: 'product',
    title: 'Product Description',
    description: 'Create product variations',
    prompt: 'A modern or vintage style chair, made of wood or metal, in red or blue color, for indoor or outdoor use',
    icon: '🛋️',
  },
  {
    id: 'art',
    title: 'Art Prompt',
    description: 'Generate art descriptions',
    prompt: 'Abstract or realistic painting, with warm or cool colors, featuring geometric or organic shapes, minimalist or detailed style',
    icon: '🎨',
  },
  {
    id: 'food',
    title: 'Recipe Generator',
    description: 'Create recipe variations',
    prompt: 'A sweet or savory dish, with chicken or tofu, seasoned with herbs or spices, served hot or cold',
    icon: '🍳',
  },
];

export const QuickActions: React.FC<QuickActionsProps> = ({ onSelectTemplate }) => {
  return (
    <div className="quick-actions">
      <div className="template-grid">
        {templates.map((template) => (
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
        <p className="hint">Click any template to load it into the prompt editor</p>
      </div>
    </div>
  );
};