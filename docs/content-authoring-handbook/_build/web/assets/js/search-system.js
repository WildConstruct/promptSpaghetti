/**
 * Search and Navigation System for Content Authoring Handbook
 * Epic 8.3.3 - Search and Navigation System
 */

class HandbookSearchSystem {
  constructor(options = {}) {
    this.options = {
      searchInputId: 'handbook-search',
      resultsContainerId: 'search-results',
      navigationId: 'handbook-nav',
      indexPath: 'assets/data/search-index.json',
      minSearchLength: 2,
      maxResults: 20,
      searchDelay: 300,
      enableSuggestions: true,
      enableFiltering: true,
      ...options
    };

    this.searchIndex = null;
    this.searchInput = null;
    this.resultsContainer = null;
    this.navigationContainer = null;
    this.searchTimeout = null;
    this.currentQuery = '';
    this.filters = {
      type: 'all',
      difficulty: 'all',
      part: 'all'
    };

    this.init();
  }

  async init() {
    this.setupElements();
    this.setupEventListeners();
    await this.loadSearchIndex();
    this.buildNavigation();
    this.setupKeyboardShortcuts();
    this.highlightCurrentPage();
  }

  setupElements() {
    this.searchInput = document.getElementById(this.options.searchInputId);
    this.resultsContainer = document.getElementById(
      this.options.resultsContainerId
    );
    this.navigationContainer = document.getElementById(
      this.options.navigationId
    );

    if (!this.searchInput || !this.resultsContainer) {
      console.warn('Search elements not found, creating fallback');
      this.createFallbackElements();
    }
  }

  createFallbackElements() {
    // Create search interface if not found
    const searchHtml = `
      <div class="handbook-search-container">
        <div class="search-header">
          <input type="text" id="${this.options.searchInputId}" 
                 placeholder="Search handbook..." 
                 class="search-input">
          <button class="search-clear" title="Clear search">×</button>
        </div>
        <div class="search-filters">
          <select class="filter-select" data-filter="type">
            <option value="all">All Types</option>
            <option value="chapter">Chapters</option>
            <option value="example">Examples</option>
            <option value="reference">Reference</option>
          </select>
          <select class="filter-select" data-filter="difficulty">
            <option value="all">All Levels</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
          <select class="filter-select" data-filter="part">
            <option value="all">All Parts</option>
            <option value="part1">Part 1: Foundation</option>
            <option value="part2">Part 2: Content Development</option>
            <option value="part3">Part 3: Engine Reference</option>
            <option value="part4">Part 4: Practical Guides</option>
            <option value="part5">Part 5: Advanced Topics</option>
            <option value="part6">Part 6: Reference Materials</option>
          </select>
        </div>
        <div id="${this.options.resultsContainerId}" class="search-results"></div>
      </div>
    `;

    document.body.insertAdjacentHTML('afterbegin', searchHtml);
    this.searchInput = document.getElementById(this.options.searchInputId);
    this.resultsContainer = document.getElementById(
      this.options.resultsContainerId
    );
  }

  setupEventListeners() {
    // Search input
    this.searchInput.addEventListener('input', e => {
      this.handleSearch(e.target.value);
    });

    // Search clear button
    const clearBtn = document.querySelector('.search-clear');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        this.clearSearch();
      });
    }

    // Filter selects
    document.querySelectorAll('.filter-select').forEach(select => {
      select.addEventListener('change', e => {
        this.filters[e.target.dataset.filter] = e.target.value;
        this.handleSearch(this.currentQuery);
      });
    });

    // Results container
    this.resultsContainer.addEventListener('click', e => {
      if (e.target.classList.contains('search-result-link')) {
        this.trackSearchClick(e.target);
      }
    });

    // Close search on outside click
    document.addEventListener('click', e => {
      if (!e.target.closest('.handbook-search-container')) {
        this.hideResults();
      }
    });
  }

  async loadSearchIndex() {
    try {
      const response = await fetch(this.options.indexPath);
      if (!response.ok) {
        throw new Error(`Failed to load search index: ${response.status}`);
      }
      this.searchIndex = await response.json();
      console.log(
        `Loaded search index with ${this.searchIndex.length} entries`
      );
    } catch (error) {
      console.error('Error loading search index:', error);
      this.searchIndex = this.generateFallbackIndex();
    }
  }

  generateFallbackIndex() {
    // Generate a basic search index from current page content
    const pages = [
      {
        title: 'Introduction & Overview',
        url: 'part1-foundation/01-introduction.html',
        content: 'Introduction to Prompt Spaghetti content authoring system',
        type: 'chapter',
        difficulty: 'beginner',
        part: 'part1',
        keywords: ['introduction', 'overview', 'getting started']
      },
      {
        title: 'Architecture & Core Concepts',
        url: 'part1-foundation/02-architecture.html',
        content: 'System architecture and core concepts',
        type: 'chapter',
        difficulty: 'intermediate',
        part: 'part1',
        keywords: ['architecture', 'concepts', 'engine']
      },
      {
        title: 'Generator JSON Schema Reference',
        url: 'part1-foundation/03-schema-reference.html',
        content: 'Complete reference for generator JSON format',
        type: 'reference',
        difficulty: 'intermediate',
        part: 'part1',
        keywords: ['schema', 'json', 'reference', 'format']
      },
      {
        title: 'Basic Generator Creation',
        url: 'part2-content-development/04-basic-generator.html',
        content: 'Learn to create your first generators',
        type: 'chapter',
        difficulty: 'beginner',
        part: 'part2',
        keywords: ['basic', 'generator', 'creation', 'tutorial']
      },
      {
        title: 'Interactive Tutorial',
        url: 'part4-practical-guides/14-interactive-tutorial.html',
        content: 'Hands-on tutorial with live examples',
        type: 'example',
        difficulty: 'beginner',
        part: 'part4',
        keywords: ['tutorial', 'interactive', 'examples', 'hands-on']
      },
      {
        title: 'Expansion Recipes for LLMs',
        url: 'part4-practical-guides/15-expansion-recipes.html',
        content: 'Patterns for LLM-assisted content expansion',
        type: 'chapter',
        difficulty: 'advanced',
        part: 'part4',
        keywords: ['llm', 'expansion', 'recipes', 'patterns']
      },
      {
        title: 'Quick Reference Tables',
        url: 'part6-reference-materials/22-quick-reference.html',
        content: 'Quick lookup tables for common tasks',
        type: 'reference',
        difficulty: 'all',
        part: 'part6',
        keywords: ['reference', 'tables', 'quick', 'lookup']
      }
    ];

    return pages;
  }

  handleSearch(query) {
    this.currentQuery = query.trim();

    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      this.performSearch(this.currentQuery);
    }, this.options.searchDelay);
  }

  performSearch(query) {
    if (!query || query.length < this.options.minSearchLength) {
      this.hideResults();
      return;
    }

    const results = this.searchContent(query);
    this.displayResults(results, query);
  }

  searchContent(query) {
    if (!this.searchIndex) return [];

    const queryLower = query.toLowerCase();
    const queryTerms = queryLower.split(/\s+/);

    let results = this.searchIndex.map(item => {
      let score = 0;
      let matches = [];

      // Title matches (highest weight)
      const titleScore = this.calculateTextScore(item.title, queryTerms, 10);
      score += titleScore.score;
      matches.push(...titleScore.matches);

      // Content matches
      const contentScore = this.calculateTextScore(item.content, queryTerms, 5);
      score += contentScore.score;
      matches.push(...contentScore.matches);

      // Keywords matches
      const keywordScore = this.calculateKeywordScore(
        item.keywords || [],
        queryTerms,
        8
      );
      score += keywordScore.score;
      matches.push(...keywordScore.matches);

      // Exact phrase bonus
      if (item.title.toLowerCase().includes(queryLower)) {
        score += 15;
      }
      if (item.content.toLowerCase().includes(queryLower)) {
        score += 10;
      }

      return {
        ...item,
        score,
        matches: [...new Set(matches)],
        snippet: this.generateSnippet(item.content, queryTerms)
      };
    });

    // Filter by current filters
    results = results.filter(item => {
      if (this.filters.type !== 'all' && item.type !== this.filters.type)
        return false;
      if (
        this.filters.difficulty !== 'all' &&
        item.difficulty !== this.filters.difficulty
      )
        return false;
      if (this.filters.part !== 'all' && item.part !== this.filters.part)
        return false;
      return true;
    });

    // Sort by score and return top results
    return results
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, this.options.maxResults);
  }

  calculateTextScore(text, queryTerms, weight) {
    const textLower = text.toLowerCase();
    let score = 0;
    let matches = [];

    queryTerms.forEach(term => {
      const termCount = (textLower.match(new RegExp(term, 'g')) || []).length;
      if (termCount > 0) {
        score += termCount * weight;
        matches.push(term);
      }
    });

    return { score, matches };
  }

  calculateKeywordScore(keywords, queryTerms, weight) {
    let score = 0;
    let matches = [];

    keywords.forEach(keyword => {
      const keywordLower = keyword.toLowerCase();
      queryTerms.forEach(term => {
        if (keywordLower.includes(term)) {
          score += weight;
          matches.push(term);
        }
      });
    });

    return { score, matches };
  }

  generateSnippet(content, queryTerms, maxLength = 150) {
    const contentLower = content.toLowerCase();
    let bestStart = 0;
    let bestScore = 0;

    // Find the best position to start the snippet
    for (let i = 0; i < content.length - maxLength; i += 10) {
      const section = contentLower.substring(i, i + maxLength);
      let score = 0;

      queryTerms.forEach(term => {
        const matches = (section.match(new RegExp(term, 'g')) || []).length;
        score += matches;
      });

      if (score > bestScore) {
        bestScore = score;
        bestStart = i;
      }
    }

    let snippet = content.substring(bestStart, bestStart + maxLength);

    // Clean up snippet
    if (bestStart > 0) snippet = '...' + snippet;
    if (bestStart + maxLength < content.length) snippet += '...';

    // Highlight query terms
    queryTerms.forEach(term => {
      const regex = new RegExp(`(${term})`, 'gi');
      snippet = snippet.replace(regex, '<mark>$1</mark>');
    });

    return snippet;
  }

  displayResults(results, query) {
    if (results.length === 0) {
      this.resultsContainer.innerHTML = `
        <div class="search-no-results">
          <p>No results found for "${query}"</p>
          <div class="search-suggestions">
            <p>Try:</p>
            <ul>
              <li>Different keywords</li>
              <li>Removing filters</li>
              <li>Checking spelling</li>
            </ul>
          </div>
        </div>
      `;
    } else {
      const resultsHtml = results
        .map(
          result => `
        <div class="search-result">
          <a href="${result.url}" class="search-result-link">
            <h3 class="search-result-title">${this.highlightText(result.title, query)}</h3>
            <p class="search-result-snippet">${result.snippet}</p>
            <div class="search-result-meta">
              <span class="result-type">${result.type}</span>
              <span class="result-difficulty">${result.difficulty}</span>
              <span class="result-part">${result.part}</span>
            </div>
          </a>
        </div>
      `
        )
        .join('');

      this.resultsContainer.innerHTML = `
        <div class="search-results-header">
          <span class="results-count">${results.length} results for "${query}"</span>
        </div>
        ${resultsHtml}
      `;
    }

    this.showResults();
  }

  highlightText(text, query) {
    const queryTerms = query.toLowerCase().split(/\s+/);
    let highlightedText = text;

    queryTerms.forEach(term => {
      const regex = new RegExp(`(${term})`, 'gi');
      highlightedText = highlightedText.replace(regex, '<mark>$1</mark>');
    });

    return highlightedText;
  }

  showResults() {
    this.resultsContainer.style.display = 'block';
    this.resultsContainer.classList.add('show');
  }

  hideResults() {
    this.resultsContainer.style.display = 'none';
    this.resultsContainer.classList.remove('show');
  }

  clearSearch() {
    this.searchInput.value = '';
    this.currentQuery = '';
    this.hideResults();
    this.searchInput.focus();
  }

  buildNavigation() {
    const navigationStructure = {
      'Part 1: Foundation': [
        {
          title: 'Introduction & Overview',
          url: 'part1-foundation/01-introduction.html'
        },
        {
          title: 'Architecture & Core Concepts',
          url: 'part1-foundation/02-architecture.html'
        },
        {
          title: 'Generator JSON Schema Reference',
          url: 'part1-foundation/03-schema-reference.html'
        }
      ],
      'Part 2: Content Development': [
        {
          title: 'Basic Generator Creation',
          url: 'part2-content-development/04-basic-generator.html'
        },
        {
          title: 'Advanced Rule Syntax',
          url: 'part2-content-development/05-advanced-rules.html'
        },
        {
          title: 'Modularization & Organization',
          url: 'part2-content-development/06-modularization.html'
        }
      ],
      'Part 3: Engine Reference': [
        {
          title: 'Engine API Documentation',
          url: 'part3-engine-reference/09-api-documentation.html'
        },
        {
          title: 'Modifier System',
          url: 'part3-engine-reference/10-modifier-system.html'
        },
        {
          title: 'Variable System',
          url: 'part3-engine-reference/11-variable-system.html'
        }
      ],
      'Part 4: Practical Guides': [
        {
          title: 'Interactive Tutorial',
          url: 'part4-practical-guides/14-interactive-tutorial.html'
        },
        {
          title: 'Expansion Recipes for LLMs',
          url: 'part4-practical-guides/15-expansion-recipes.html'
        },
        {
          title: 'Testing & Quality Assurance',
          url: 'part4-practical-guides/16-testing-qa.html'
        }
      ],
      'Part 5: Advanced Topics': [
        {
          title: 'Custom Extensions',
          url: 'part5-advanced-topics/18-custom-extensions.html'
        },
        {
          title: 'Security Best Practices',
          url: 'part5-advanced-topics/19-security.html'
        },
        {
          title: 'Integration Patterns',
          url: 'part5-advanced-topics/20-integration.html'
        }
      ],
      'Part 6: Reference Materials': [
        {
          title: 'Quick Reference Tables',
          url: 'part6-reference-materials/22-quick-reference.html'
        },
        {
          title: 'Templates & Boilerplates',
          url: 'part6-reference-materials/23-templates.html'
        },
        {
          title: 'Common Pitfalls & Solutions',
          url: 'part6-reference-materials/24-pitfalls.html'
        }
      ]
    };

    if (this.navigationContainer) {
      const navHtml = this.buildNavigationHTML(navigationStructure);
      this.navigationContainer.innerHTML = navHtml;
    }
  }

  buildNavigationHTML(structure) {
    return Object.entries(structure)
      .map(
        ([section, items]) => `
      <div class="nav-section">
        <h3 class="nav-section-title">${section}</h3>
        <ul class="nav-section-items">
          ${items
            .map(
              item => `
            <li class="nav-item">
              <a href="${item.url}" class="nav-link">${item.title}</a>
            </li>
          `
            )
            .join('')}
        </ul>
      </div>
    `
      )
      .join('');
  }

  setupKeyboardShortcuts() {
    document.addEventListener('keydown', e => {
      // Ctrl/Cmd + K to focus search
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        this.searchInput.focus();
      }

      // Escape to clear search
      if (e.key === 'Escape') {
        this.clearSearch();
      }
    });
  }

  highlightCurrentPage() {
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav-link');

    navLinks.forEach(link => {
      if (link.getAttribute('href') === currentPath) {
        link.classList.add('current-page');
      }
    });
  }

  trackSearchClick(link) {
    // Track search result clicks for analytics
    const data = {
      query: this.currentQuery,
      url: link.href,
      title: link.querySelector('.search-result-title').textContent,
      position: Array.from(link.parentNode.parentNode.children).indexOf(
        link.parentNode
      )
    };

    // Send to analytics if available
    if (window.gtag) {
      window.gtag('event', 'search_result_click', data);
    }

    console.log('Search click tracked:', data);
  }
}

// Initialize search system when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.handbookSearch = new HandbookSearchSystem();
});

// Export for manual initialization
window.HandbookSearchSystem = HandbookSearchSystem;
