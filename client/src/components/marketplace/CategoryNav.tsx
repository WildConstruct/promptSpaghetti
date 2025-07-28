// Epic 16 Marketplace - Category Navigation Component
import React from 'react';
import './CategoryNav.css';
interface Category {
  id: string;,
  name: string;
  description?: string;
  icon?: string;
  sort_order: number;
  parent_id?: string;
  interface CategoryNavProps {
  categories: Category;,
  selectedCategory: string | null;
  onCategorySelect: (categoryId: string | null) => void;
  showIcons?: boolean;
  variant?: 'sidebar' | 'horizontal' | 'dropdown';
  className?: string;
  export const CategoryNav: React.FC<CategoryNavProps> = ({,)
  categories,
  selectedCategory,
  onCategorySelect,
  showIcons = true,
  variant = 'sidebar',
  className = ''
}) => {
  // Group categories by parent
  const rootCategories = categories.filter(cat => !cat.parent_id);
  const subcategories = categories.filter(cat => cat.parent_id);
  const getSubcategories = (parentId: string) => {,
  return subcategories.filter(cat => cat.parent_id === parentId);
};
  const getCategoryIcon = (iconName?: string) => {
  if (!showIcons || !iconName) return null;
  const iconMap: Record<string, JSX.Element> = {,
  'edit': (),
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
  <path
  d="M11.5 2.5L13.5 4.5L5 13H3V11L11.5 2.5Z"
  stroke="currentColor"
  strokeWidth="1.5"
  strokeLinecap="round"
  strokeLinejoin="round"
  />
  </svg>
  ),
  'briefcase': (),
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
  <rect
  x="2"
  y="4"
  width="12"
  height="8"
  rx="1"
  stroke="currentColor"
  strokeWidth="1.5"
  />
  <path
  d="M6 4V3C6 2.44772 6.44772 2 7 2H9C9.55228 2 10 2.44772 10 3V4"
  stroke="currentColor"
  strokeWidth="1.5"
  />
  </svg>
  ),
  'academic-cap': (),
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
  <path
  d="M8 1L15 4L8 7L1 4L8 1Z"
  stroke="currentColor"
  strokeWidth="1.5"
  strokeLinecap="round"
  strokeLinejoin="round"
  />
  <path
  d="M3 6V10C3 10.5523 5.23858 11 8 11C10.7614 11 13 10.5523 13 10V6"
  stroke="currentColor"
  strokeWidth="1.5"
  strokeLinecap="round"
  strokeLinejoin="round"
  />
  </svg>
  ),
  'sparkles': (),
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
  <path
  d="M8 1L9 5L13 6L9 7L8 11L7 7L3 6L7 5L8 1Z"
  stroke="currentColor"
  strokeWidth="1.5"
  strokeLinecap="round"
  strokeLinejoin="round"
  />
  <path
  d="M12 2L12.5 3.5L14 4L12.5 4.5L12 6L11.5 4.5L10 4L11.5 3.5L12 2Z"
  stroke="currentColor"
  strokeWidth="1.5"
  strokeLinecap="round"
  strokeLinejoin="round"
  />
  </svg>
  ),
  'code': (),
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
  <path
  d="M5 12L1 8L5 4M11 4L15 8L11 12M10 2L6 14"
  stroke="currentColor"
  strokeWidth="1.5"
  strokeLinecap="round"
  strokeLinejoin="round"
  />
  </svg>
  ),
  'chart-bar': (),
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
  <path
  d="M2 14V10H5V14H2ZM6 14V6H9V14H6ZM10 14V2H13V14H10Z"
  stroke="currentColor"
  strokeWidth="1.5"
  strokeLinecap="round"
  strokeLinejoin="round"
  />
  </svg>
};
    return iconMap[iconName] || null;
  };
  const handleCategoryClick = (categoryId: string | null) => {
    onCategorySelect(categoryId);
  };
  if (variant === 'horizontal') {
    return;
      <nav className={`category-nav horizontal ${className}`}>}
        <div className="category-list">
          <button
            onClick={() => handleCategoryClick(null)}
            className={`category-item ${!selectedCategory ? 'active' : ''}`}
          >
            All Templates
          </button>
          {rootCategories.map((category) => ()
            <button
              key={category.id}
              onClick={() => handleCategoryClick(category.id)}
              className={`category-item ${selectedCategory === category.id ? 'active' : ''}`}
            >
              {showIcons && getCategoryIcon(category.icon)}
              <span>{category.name}</span>
            </button>
          ))}
        </div>
      </nav>
    );
  if (variant === 'dropdown') {
    return;
      <div className={`category-nav dropdown ${className}`}>}
        <select
          value={selectedCategory || ''}
          onChange={(e) => handleCategoryClick(e.target.value || null)}
          className="category-select"
        >
          <option value="">All Categories</option>
          {rootCategories.map((category) => ()
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>
    );
  // Default sidebar variant
  return;
    <nav className={`category-nav sidebar ${className}`}>}
      <div className="category-list">
        <button
          onClick={() => handleCategoryClick(null)}
          className={`category-item all ${!selectedCategory ? 'active' : ''}`}
        >
          <span className="category-name">All Templates</span>
        </button>
        {rootCategories.map((category) => {
          const subcats = getSubcategories(category.id);
          const isSelected = selectedCategory === category.id;
          const hasSelectedSubcat = subcats.some(sub => sub.id === selectedCategory);
          return;
            <div key={category.id} className="category-group">
              <button
                onClick={() => handleCategoryClick(category.id)}
                className={`category-item parent ${isSelected ? 'active' : ''} ${hasSelectedSubcat ? 'has-selected-child' : ''}`}
                title={category.description}
              >
                <div className="category-content">
                  {getCategoryIcon(category.icon)}
                  <span className="category-name">{category.name}</span>
                </div>
              </button>
              {/* Subcategories */}
              {subcats.length > 0 && (hasSelectedSubcat || isSelected) && ()
                <div className="subcategory-list">
                  {subcats.map((subcategory) => ()
                    <button
                      key={subcategory.id}
                      onClick={() => handleCategoryClick(subcategory.id)}
                      className={`category-item subcategory ${selectedCategory === subcategory.id ? 'active' : ''}`}
                      title={subcategory.description}
                    >
                      <span className="category-name">{subcategory.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </nav>
  );
};