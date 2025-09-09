# Content Authoring Handbook - Build Guide

This guide explains how to build the Content Authoring Handbook in multiple formats using the comprehensive build system.

## Overview

The handbook build system supports four output formats:

- **Web**: Responsive HTML with search and interactive examples
- **PDF**: Professional PDF suitable for printing and distribution
- **EPUB**: E-book format for reading on tablets and e-readers
- **Print**: Print-optimized HTML for browser printing

## Prerequisites

### Required Software

- Node.js 16.0.0 or later
- npm or yarn package manager

### Optional Dependencies

- **Puppeteer**: For PDF generation (installed automatically)
- **Prince**: Alternative PDF generator (install separately)
- **Archiver**: For EPUB packaging (installed automatically)

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Build All Formats

```bash
npm run build
```

### 3. Build Specific Format

```bash
npm run build:web     # Web version only
npm run build:pdf     # PDF version only
npm run build:epub    # EPUB version only
npm run build:print   # Print version only
```

### 4. Development Server

```bash
npm run dev           # Build web version and serve
npm run serve         # Serve existing build
```

## Build System Architecture

### Directory Structure

```
docs/content-authoring-handbook/
├── assets/
│   ├── css/                 # Stylesheets
│   ├── js/                  # JavaScript files
│   ├── data/                # Search index and data
│   ├── templates/           # Output format templates
│   └── tools/               # Build tools
├── part1-foundation/        # Chapter files
├── part2-content-development/
├── part3-engine-reference/
├── part4-practical-guides/
├── part5-advanced-topics/
├── part6-reference-materials/
├── _build/                  # Build output (generated)
├── _temp/                   # Temporary files (generated)
└── BUILD.md                 # This file
```

### Build Tools

#### 1. Main Build System (`assets/tools/build-handbook.js`)

- Comprehensive multi-format builder
- Supports all output formats
- Handles content processing and template rendering
- Generates metadata and statistics

#### 2. Search Index Builder (`assets/tools/build-search-index.js`)

- Automatically scans markdown files
- Generates search index with metadata
- Extracts keywords and classifications
- Optimizes for search performance

### Build Process

1. **Content Discovery**: Scans all markdown files in part directories
2. **Metadata Extraction**: Extracts titles, difficulty levels, and types
3. **Content Processing**: Converts markdown to HTML with proper formatting
4. **Template Processing**: Applies format-specific templates
5. **Asset Handling**: Copies and optimizes assets for each format
6. **Search Index**: Generates searchable content index
7. **Output Generation**: Creates final files in `_build/` directory

## Format-Specific Features

### Web Format

- **Responsive Design**: Works on all devices
- **Interactive Examples**: Live code editors and previews
- **Search Functionality**: Full-text search with filtering
- **Navigation**: Hierarchical navigation with breadcrumbs
- **Progressive Enhancement**: Works without JavaScript

**Output**: `_build/web/`

- Complete website with all pages
- Assets optimized for web delivery
- Search index and interactive features

### PDF Format

- **Professional Layout**: Optimized for printing and reading
- **Page Headers/Footers**: Automatic page numbering
- **Table of Contents**: Linked navigation
- **Print-Friendly**: Optimized typography and spacing
- **Interactive Examples**: Simplified for print

**Output**: `_build/pdf/content-authoring-handbook.pdf`

- Single PDF file with all content
- Professional formatting
- Bookmarks and navigation

**Requirements**: Puppeteer (automatic) or Prince (manual install)

### EPUB Format

- **E-Reader Compatibility**: Works on tablets and e-readers
- **Reflowable Text**: Adapts to screen sizes
- **Chapter Navigation**: Proper e-book structure
- **Metadata**: Complete book information
- **Standards Compliant**: EPUB 3.0 format

**Output**: `_build/epub/content-authoring-handbook.epub`

- Complete e-book file
- Compatible with most e-readers
- Proper metadata and structure

**Requirements**: Archiver package (automatic)

### Print Format

- **Browser Printing**: Optimized for browser print function
- **Print Preview**: Shows how it will look when printed
- **Page Breaks**: Proper chapter and section breaks
- **Typography**: Optimized for paper reading
- **Simplified Examples**: Print-friendly code examples

**Output**: `_build/print/handbook-print.html`

- Single HTML file optimized for printing
- Use browser's print function to generate PDF
- Print preview in browser

## Advanced Usage

### Custom Build Options

#### Command Line Options

```bash
# Build specific format with custom options
node assets/tools/build-handbook.js pdf --title "Custom Title" --author "Your Name"

# Build with custom output directory
node assets/tools/build-handbook.js web --outputDir ./custom-build

# Build with custom base URL
node assets/tools/build-handbook.js web --baseUrl "https://your-domain.com"
```

#### Programmatic Usage

```javascript
const HandbookBuilder = require('./assets/tools/build-handbook');

const builder = new HandbookBuilder({
  title: 'Custom Handbook',
  author: 'Your Name',
  version: '2.0.0',
  outputDir: './custom-build',
  baseUrl: 'https://your-domain.com'
});

await builder.build('web');
```

### Custom Templates

Create custom templates for different output formats:

1. **Copy existing template**:

   ```bash
   cp assets/templates/web-template.html assets/templates/custom-template.html
   ```

2. **Modify template**: Edit the HTML and CSS as needed

3. **Use custom template**:
   ```javascript
   const builder = new HandbookBuilder({
     templates: {
       web: './assets/templates/custom-template.html'
     }
   });
   ```

### Content Organization

#### Chapter Structure

Each chapter should follow this structure:

```markdown
# Chapter Title

Brief introduction to the chapter.

## Section 1

Content for section 1.

### Subsection 1.1

Detailed content.

## Section 2

More content.
```

#### Metadata Extraction

The build system automatically extracts:

- **Title**: From first H1 heading
- **Difficulty**: From content keywords (beginner, intermediate, advanced)
- **Type**: From filename and content (chapter, reference, example)
- **Keywords**: From content analysis

#### Interactive Examples

Include interactive examples using this format:

```html
<div
  id="example-1"
  data-interactive-example
  data-title="Example Title"
  data-variations="true"
  data-code='{"grammar":{"start":"Hello world"}}'
></div>
```

## Troubleshooting

### Common Issues

#### 1. Build Fails with "Module not found"

```bash
# Solution: Install dependencies
npm install
```

#### 2. PDF Generation Fails

```bash
# Solution: Install Puppeteer or Prince
npm install puppeteer
# OR
brew install prince  # macOS
```

#### 3. EPUB Generation Fails

```bash
# Solution: Install archiver
npm install archiver
```

#### 4. Interactive Examples Not Working

- Check that JavaScript is enabled
- Verify Monaco Editor is loading
- Check browser console for errors

### Debug Mode

Enable debug mode for detailed build information:

```bash
DEBUG=handbook:* npm run build
```

### Performance Optimization

#### Large Handbooks

For handbooks with many chapters:

- Use `--parallel` flag for parallel processing
- Optimize images before building
- Consider splitting into multiple volumes

#### Build Speed

- Use `npm run build:web` for fastest builds
- Skip unused formats during development
- Use `--incremental` for changed files only

## Deployment

### Web Deployment

```bash
# Build web version
npm run build:web

# Deploy to web server
rsync -av _build/web/ user@server:/path/to/webroot/
```

### GitHub Pages

```bash
# Build and deploy to gh-pages branch
npm run build:web
git subtree push --prefix _build/web origin gh-pages
```

### CDN Deployment

```bash
# Build and upload to CDN
npm run build:web
aws s3 sync _build/web/ s3://your-bucket/handbook/
```

## Maintenance

### Regular Tasks

1. **Update content**: Edit markdown files in part directories
2. **Rebuild search index**: `npm run build:search`
3. **Test all formats**: `npm run build && npm run serve`
4. **Update dependencies**: `npm update`

### Content Updates

1. Edit markdown files
2. Run `npm run build:web` for quick testing
3. Run `npm run build` for production
4. Deploy updated files

### Version Management

Update version in:

- `package.json`
- Build system options
- Templates (if hardcoded)

## Contributing

### Adding New Formats

1. Create new template in `assets/templates/`
2. Add format-specific styles
3. Extend build system in `build-handbook.js`
4. Update documentation

### Improving Build System

1. Fork repository
2. Make changes to build tools
3. Test with existing content
4. Submit pull request

## Support

For build system issues:

- Check this documentation
- Review build logs
- Search existing issues
- Create new issue with details

---

**Build System Version**: 1.0.0  
**Last Updated**: 2025-01-16  
**Dependencies**: Node.js 16+, npm 7+
