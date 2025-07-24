#!/usr/bin/env node

/**
 * Multi-Format Handbook Builder
 * Epic 8.3.4 - Multiple Format Publishing
 * 
 * Builds the handbook in multiple formats: Web, PDF, EPUB, and Print
 * Usage: node build-handbook.js [format] [options]
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const crypto = require('crypto');

class HandbookBuilder {
  constructor(options = {}) {
    this.options = {
      inputDir: path.join(__dirname, '../..'),
      outputDir: path.join(__dirname, '../../_build'),
      tempDir: path.join(__dirname, '../../_temp'),
      assetsDir: path.join(__dirname, '../'),
      formats: ['web', 'pdf', 'epub', 'print'],
      title: 'Content Authoring Handbook',
      author: 'Prompt Spaghetti Team',
      version: '1.0.0',
      baseUrl: '',
      githubUrl: 'https://github.com/your-org/prompt-spaghetti',
      ...options
    };

    this.chapters = [];
    this.toc = [];
    this.metadata = {
      title: this.options.title,
      author: this.options.author,
      version: this.options.version,
      generated: new Date().toISOString(),
      formats: {}
    };

    this.templates = {
      web: path.join(__dirname, '../templates/handbook-template.html'),
      pdf: path.join(__dirname, '../templates/pdf-template.html'),
      epub: path.join(__dirname, '../templates/epub-template.html'),
      print: path.join(__dirname, '../templates/print-template.html')
    };
  }

  async build(format = 'all') {
    console.log(`📚 Building Content Authoring Handbook (${format})...`);
    
    try {
      await this.setupDirectories();
      await this.loadChapters();
      await this.generateTableOfContents();
      
      const formats = format === 'all' ? this.options.formats : [format];
      
      for (const fmt of formats) {
        console.log(`\n🔄 Building ${fmt.toUpperCase()} format...`);
        await this.buildFormat(fmt);
      }
      
      await this.generateMetadata();
      await this.cleanup();
      
      console.log('\n✅ Handbook build completed successfully!');
      console.log(`📁 Output directory: ${this.options.outputDir}`);
      
    } catch (error) {
      console.error('❌ Build failed:', error);
      process.exit(1);
    }
  }

  async setupDirectories() {
    const dirs = [this.options.outputDir, this.options.tempDir];
    
    for (const dir of dirs) {
      if (fs.existsSync(dir)) {
        fs.rmSync(dir, { recursive: true, force: true });
      }
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  async loadChapters() {
    console.log('📖 Loading chapters...');
    
    const parts = [
      { id: 'part1', title: 'Part 1: Foundation', dir: 'part1-foundation' },
      { id: 'part2', title: 'Part 2: Content Development', dir: 'part2-content-development' },
      { id: 'part3', title: 'Part 3: Engine Reference', dir: 'part3-engine-reference' },
      { id: 'part4', title: 'Part 4: Practical Guides', dir: 'part4-practical-guides' },
      { id: 'part5', title: 'Part 5: Advanced Topics', dir: 'part5-advanced-topics' },
      { id: 'part6', title: 'Part 6: Reference Materials', dir: 'part6-reference-materials' }
    ];

    for (const part of parts) {
      const partDir = path.join(this.options.inputDir, part.dir);
      
      if (fs.existsSync(partDir)) {
        const files = fs.readdirSync(partDir)
          .filter(file => file.endsWith('.md'))
          .sort();
        
        for (const file of files) {
          const filePath = path.join(partDir, file);
          const content = fs.readFileSync(filePath, 'utf8');
          
          const chapter = {
            id: this.generateChapterId(file),
            title: this.extractTitle(content),
            content: content,
            file: file,
            path: filePath,
            url: `${part.dir}/${file.replace('.md', '.html')}`,
            part: part,
            order: this.extractOrder(file),
            difficulty: this.extractDifficulty(content),
            type: this.extractType(content, file)
          };
          
          this.chapters.push(chapter);
        }
      }
    }
    
    console.log(`📚 Loaded ${this.chapters.length} chapters`);
  }

  generateChapterId(filename) {
    return crypto.createHash('md5')
      .update(filename)
      .digest('hex')
      .substring(0, 8);
  }

  extractTitle(content) {
    const match = content.match(/^#\s+(.+)$/m);
    return match ? match[1].trim() : 'Untitled';
  }

  extractOrder(filename) {
    const match = filename.match(/^(\d+)/);
    return match ? parseInt(match[1]) : 999;
  }

  extractDifficulty(content) {
    const contentLower = content.toLowerCase();
    if (contentLower.includes('beginner') || contentLower.includes('basic') || contentLower.includes('introduction')) {
      return 'beginner';
    }
    if (contentLower.includes('advanced') || contentLower.includes('expert')) {
      return 'advanced';
    }
    return 'intermediate';
  }

  extractType(content, filename) {
    const contentLower = content.toLowerCase();
    const filenameLower = filename.toLowerCase();
    
    if (contentLower.includes('reference') || filenameLower.includes('reference')) {
      return 'reference';
    }
    if (contentLower.includes('tutorial') || filenameLower.includes('tutorial')) {
      return 'tutorial';
    }
    if (contentLower.includes('example') || filenameLower.includes('example')) {
      return 'example';
    }
    return 'chapter';
  }

  async generateTableOfContents() {
    console.log('📋 Generating table of contents...');
    
    const parts = {};
    
    this.chapters.forEach(chapter => {
      const partId = chapter.part.id;
      if (!parts[partId]) {
        parts[partId] = {
          title: chapter.part.title,
          chapters: []
        };
      }
      parts[partId].chapters.push(chapter);
    });
    
    // Sort chapters within each part
    Object.values(parts).forEach(part => {
      part.chapters.sort((a, b) => a.order - b.order);
    });
    
    this.toc = parts;
  }

  async buildFormat(format) {
    switch (format) {
    case 'web':
      await this.buildWeb();
      break;
    case 'pdf':
      await this.buildPDF();
      break;
    case 'epub':
      await this.buildEPUB();
      break;
    case 'print':
      await this.buildPrint();
      break;
    default:
      throw new Error(`Unknown format: ${format}`);
    }
  }

  async buildWeb() {
    console.log('🌐 Building web version...');
    
    const webDir = path.join(this.options.outputDir, 'web');
    fs.mkdirSync(webDir, { recursive: true });
    
    // Copy assets
    await this.copyAssets(webDir);
    
    // Generate index page
    await this.generateWebIndex(webDir);
    
    // Generate individual pages
    for (const chapter of this.chapters) {
      await this.generateWebPage(chapter, webDir);
    }
    
    // Generate search index
    await this.generateSearchIndex(webDir);
    
    console.log('✅ Web version complete');
  }

  async buildPDF() {
    console.log('📄 Building PDF version...');
    
    const pdfDir = path.join(this.options.outputDir, 'pdf');
    fs.mkdirSync(pdfDir, { recursive: true });
    
    // Generate combined HTML for PDF
    const htmlContent = await this.generatePDFHTML();
    const htmlFile = path.join(this.options.tempDir, 'handbook.html');
    fs.writeFileSync(htmlFile, htmlContent);
    
    // Generate PDF using Puppeteer or Prince
    const pdfFile = path.join(pdfDir, 'content-authoring-handbook.pdf');
    await this.generatePDFFromHTML(htmlFile, pdfFile);
    
    console.log('✅ PDF version complete');
  }

  async buildEPUB() {
    console.log('📱 Building EPUB version...');
    
    const epubDir = path.join(this.options.outputDir, 'epub');
    fs.mkdirSync(epubDir, { recursive: true });
    
    // Generate EPUB structure
    await this.generateEPUBStructure(epubDir);
    
    // Package EPUB
    const epubFile = path.join(epubDir, 'content-authoring-handbook.epub');
    await this.packageEPUB(epubDir, epubFile);
    
    console.log('✅ EPUB version complete');
  }

  async buildPrint() {
    console.log('🖨️ Building print version...');
    
    const printDir = path.join(this.options.outputDir, 'print');
    fs.mkdirSync(printDir, { recursive: true });
    
    // Generate print-optimized HTML
    const printHTML = await this.generatePrintHTML();
    const printFile = path.join(printDir, 'handbook-print.html');
    fs.writeFileSync(printFile, printHTML);
    
    // Copy print-specific assets
    await this.copyPrintAssets(printDir);
    
    console.log('✅ Print version complete');
  }

  async copyAssets(targetDir) {
    const assetsTargetDir = path.join(targetDir, 'assets');
    
    if (fs.existsSync(this.options.assetsDir)) {
      fs.cpSync(this.options.assetsDir, assetsTargetDir, { recursive: true });
    }
  }

  async generateWebIndex(webDir) {
    const template = fs.readFileSync(this.templates.web, 'utf8');
    
    const tocHTML = this.generateTOCHTML();
    const breadcrumbs = '<span class="breadcrumb-current">Home</span>';
    
    const indexContent = `
      <div class="handbook-intro">
        <h1>Content Authoring Handbook</h1>
        <p>A comprehensive guide to creating and managing content with the Prompt Spaghetti system.</p>
        
        <div class="quick-start">
          <h2>Quick Start</h2>
          <div class="quick-start-grid">
            <a href="part1-foundation/01-introduction.html" class="quick-start-card">
              <h3>📖 New to Prompt Spaghetti?</h3>
              <p>Start with the introduction to understand the basics</p>
            </a>
            <a href="part4-practical-guides/14-interactive-tutorial.html" class="quick-start-card">
              <h3>🎯 Hands-On Learning</h3>
              <p>Jump into the interactive tutorial</p>
            </a>
            <a href="part6-reference-materials/22-quick-reference.html" class="quick-start-card">
              <h3>⚡ Quick Reference</h3>
              <p>Find what you need fast</p>
            </a>
          </div>
        </div>
        
        <div class="handbook-toc">
          <h2>Table of Contents</h2>
          ${tocHTML}
        </div>
      </div>
    `;
    
    const html = this.processTemplate(template, {
      PAGE_TITLE: 'Home',
      PAGE_DESCRIPTION: 'Content Authoring Handbook for Prompt Spaghetti',
      PAGE_TYPE: 'index',
      PAGE_DIFFICULTY: 'all',
      PAGE_PART: 'home',
      BREADCRUMB_ITEMS: breadcrumbs,
      CONTENT: indexContent
    });
    
    fs.writeFileSync(path.join(webDir, 'index.html'), html);
  }

  async generateWebPage(chapter, webDir) {
    const template = fs.readFileSync(this.templates.web, 'utf8');
    
    // Process markdown content
    const htmlContent = await this.processMarkdown(chapter.content);
    
    // Generate breadcrumbs
    const breadcrumbs = this.generateBreadcrumbs(chapter);
    
    // Find prev/next pages
    const navigation = this.generatePageNavigation(chapter);
    
    const html = this.processTemplate(template, {
      PAGE_TITLE: chapter.title,
      PAGE_DESCRIPTION: `${chapter.title} - Content Authoring Handbook`,
      PAGE_TYPE: chapter.type,
      PAGE_DIFFICULTY: chapter.difficulty,
      PAGE_PART: chapter.part.id,
      BREADCRUMB_ITEMS: breadcrumbs,
      CONTENT: htmlContent,
      PREV_PAGE: navigation.prev,
      NEXT_PAGE: navigation.next
    });
    
    // Ensure directory exists
    const pageDir = path.join(webDir, chapter.part.dir);
    fs.mkdirSync(pageDir, { recursive: true });
    
    const filename = chapter.file.replace('.md', '.html');
    fs.writeFileSync(path.join(pageDir, filename), html);
  }

  async generatePDFHTML() {
    const template = fs.readFileSync(this.templates.pdf, 'utf8');
    
    let combinedContent = '';
    
    // Add title page
    combinedContent += this.generateTitlePage();
    
    // Add table of contents
    combinedContent += this.generateTOCPage();
    
    // Add chapters
    for (const chapter of this.chapters) {
      const content = await this.processMarkdown(chapter.content);
      combinedContent += `
        <div class="chapter-page">
          <h1 class="chapter-title">${chapter.title}</h1>
          <div class="chapter-content">${content}</div>
        </div>
      `;
    }
    
    return this.processTemplate(template, {
      TITLE: this.options.title,
      AUTHOR: this.options.author,
      VERSION: this.options.version,
      CONTENT: combinedContent
    });
  }

  async generatePDFFromHTML(htmlFile, pdfFile) {
    try {
      // Try using Puppeteer first
      const puppeteer = require('puppeteer-core');
      const possiblePaths = [
        process.env.CHROME_PATH,
        '/usr/bin/google-chrome',
        '/usr/bin/chromium-browser',
        '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
      ];
      const executablePath = possiblePaths.find((p) => p && fs.existsSync(p));
      const browser = await puppeteer.launch({
        executablePath,
        headless: 'new'
      });
      const page = await browser.newPage();
      
      await page.goto(`file://${htmlFile}`, { waitUntil: 'networkidle0' });
      
      await page.pdf({
        path: pdfFile,
        format: 'A4',
        printBackground: true,
        margin: {
          top: '20mm',
          right: '20mm',
          bottom: '20mm',
          left: '20mm'
        }
      });
      
      await browser.close();
      
    } catch (error) {
      // Fallback to Prince or other PDF generator
      console.warn('Puppeteer not available, trying Prince...');
      
      try {
        execSync(`prince "${htmlFile}" -o "${pdfFile}"`, { stdio: 'inherit' });
      } catch (princeError) {
        console.warn('Prince not available, creating placeholder PDF...');
        
        // Create a simple PDF placeholder
        const placeholderHTML = `
          <html>
          <head><title>PDF Generation Error</title></head>
          <body>
            <h1>PDF Generation Not Available</h1>
            <p>Please install Puppeteer or Prince to generate PDFs.</p>
            <p>Alternative: Use the web version and print to PDF from your browser.</p>
          </body>
          </html>
        `;
        
        fs.writeFileSync(pdfFile.replace('.pdf', '.html'), placeholderHTML);
      }
    }
  }

  async generateEPUBStructure(epubDir) {
    const epubTempDir = path.join(this.options.tempDir, 'epub');
    fs.mkdirSync(epubTempDir, { recursive: true });
    
    // Create EPUB structure
    const structure = {
      'META-INF/container.xml': this.generateContainerXML(),
      'OEBPS/content.opf': this.generateContentOPF(),
      'OEBPS/toc.ncx': this.generateTOCNCX(),
      'OEBPS/nav.xhtml': this.generateNavXHTML(),
      'OEBPS/styles.css': this.generateEPUBStyles()
    };
    
    // Write structure files
    for (const [filePath, content] of Object.entries(structure)) {
      const fullPath = path.join(epubTempDir, filePath);
      fs.mkdirSync(path.dirname(fullPath), { recursive: true });
      fs.writeFileSync(fullPath, content);
    }
    
    // Generate chapter files
    for (const chapter of this.chapters) {
      const content = await this.processMarkdown(chapter.content);
      const chapterHTML = this.generateEPUBChapter(chapter, content);
      const filename = `chapter-${chapter.id}.xhtml`;
      
      fs.writeFileSync(path.join(epubTempDir, 'OEBPS', filename), chapterHTML);
    }
    
    return epubTempDir;
  }

  async packageEPUB(epubDir, epubFile) {
    // This would typically use a library like archiver
    // For now, create a ZIP file with proper EPUB structure
    
    try {
      const archiver = require('archiver');
      const output = fs.createWriteStream(epubFile);
      const archive = archiver('zip', { zlib: { level: 9 } });
      
      output.on('close', () => {
        console.log(`EPUB created: ${archive.pointer()} bytes`);
      });
      
      archive.on('error', (err) => {
        throw err;
      });
      
      archive.pipe(output);
      
      // Add mimetype first (uncompressed)
      archive.append('application/epub+zip', { name: 'mimetype', store: true });
      
      // Add the rest of the files
      archive.directory(path.join(this.options.tempDir, 'epub'), false);
      
      await archive.finalize();
      
    } catch (error) {
      console.warn('EPUB packaging failed, creating placeholder...');
      
      const placeholder = `
        EPUB Generation Not Available
        
        Please install the 'archiver' package to generate EPUB files.
        Alternative: Use the web version for online reading.
      `;
      
      fs.writeFileSync(epubFile.replace('.epub', '.txt'), placeholder);
    }
  }

  async generatePrintHTML() {
    const template = fs.readFileSync(this.templates.print, 'utf8');
    
    let content = '';
    
    // Add print-specific content
    content += this.generatePrintCover();
    content += this.generatePrintTOC();
    
    for (const chapter of this.chapters) {
      const chapterContent = await this.processMarkdown(chapter.content);
      content += `
        <div class="print-chapter">
          <h1 class="print-chapter-title">${chapter.title}</h1>
          <div class="print-chapter-content">${chapterContent}</div>
        </div>
      `;
    }
    
    return this.processTemplate(template, {
      TITLE: this.options.title,
      CONTENT: content
    });
  }

  async copyPrintAssets(printDir) {
    const printAssetsDir = path.join(printDir, 'assets');
    fs.mkdirSync(printAssetsDir, { recursive: true });
    
    // Copy only print-relevant assets
    const printCSS = fs.readFileSync(
      path.join(this.options.assetsDir, 'css/print.css'),
      'utf8'
    );
    
    fs.writeFileSync(
      path.join(printAssetsDir, 'print.css'),
      printCSS
    );
  }

  processTemplate(template, variables) {
    let processed = template;
    
    // Replace simple variables
    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`{{${key}}}`, 'g');
      processed = processed.replace(regex, value || '');
    }
    
    // Set default values
    const defaults = {
      BASE_URL: this.options.baseUrl,
      ASSETS_PATH: './assets',
      GITHUB_EDIT_URL: `${this.options.githubUrl}/edit/main/docs/content-authoring-handbook`
    };
    
    for (const [key, value] of Object.entries(defaults)) {
      const regex = new RegExp(`{{${key}}}`, 'g');
      processed = processed.replace(regex, value);
    }
    
    return processed;
  }

  async processMarkdown(content) {
    // Simple markdown to HTML conversion
    // In production, use a proper markdown processor like marked
    
    let html = content
      .replace(/^#{6}\s+(.+)$/gm, '<h6>$1</h6>')
      .replace(/^#{5}\s+(.+)$/gm, '<h5>$1</h5>')
      .replace(/^#{4}\s+(.+)$/gm, '<h4>$1</h4>')
      .replace(/^#{3}\s+(.+)$/gm, '<h3>$1</h3>')
      .replace(/^#{2}\s+(.+)$/gm, '<h2>$1</h2>')
      .replace(/^#{1}\s+(.+)$/gm, '<h1>$1</h1>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/^\s*[-*+]\s+(.+)$/gm, '<li>$1</li>')
      .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
      .replace(/\n\s*\n/g, '</p><p>')
      .replace(/^(.+)$/gm, '<p>$1</p>');
    
    // Clean up nested paragraphs
    html = html.replace(/<p><([^>]+)>/g, '<$1>');
    html = html.replace(/<\/([^>]+)><\/p>/g, '</$1>');
    
    return html;
  }

  generateTOCHTML() {
    let html = '';
    
    for (const [partId, part] of Object.entries(this.toc)) {
      html += `
        <div class="toc-part">
          <h3>${part.title}</h3>
          <ul>
      `;
      
      for (const chapter of part.chapters) {
        html += `
          <li><a href="${chapter.url}">${chapter.title}</a></li>
        `;
      }
      
      html += `
          </ul>
        </div>
      `;
    }
    
    return html;
  }

  generateBreadcrumbs(chapter) {
    return `
      <div class="breadcrumb-item">
        <a href="../index.html" class="breadcrumb-link">Home</a>
      </div>
      <div class="breadcrumb-item">
        <a href="#" class="breadcrumb-link">${chapter.part.title}</a>
      </div>
      <div class="breadcrumb-item">
        <span class="breadcrumb-current">${chapter.title}</span>
      </div>
    `;
  }

  generatePageNavigation(chapter) {
    const allChapters = this.chapters.sort((a, b) => {
      if (a.part.id === b.part.id) {
        return a.order - b.order;
      }
      return a.part.id.localeCompare(b.part.id);
    });
    
    const currentIndex = allChapters.findIndex(c => c.id === chapter.id);
    
    return {
      prev: currentIndex > 0 ? allChapters[currentIndex - 1] : null,
      next: currentIndex < allChapters.length - 1 ? allChapters[currentIndex + 1] : null
    };
  }

  generateTitlePage() {
    return `
      <div class="title-page">
        <h1>${this.options.title}</h1>
        <p class="subtitle">A comprehensive guide to content generation</p>
        <p class="author">By ${this.options.author}</p>
        <p class="version">Version ${this.options.version}</p>
        <p class="date">Generated ${new Date().toLocaleDateString()}</p>
      </div>
    `;
  }

  generateTOCPage() {
    return `
      <div class="toc-page">
        <h1>Table of Contents</h1>
        ${this.generateTOCHTML()}
      </div>
    `;
  }

  generateSearchIndex(webDir) {
    const searchIndexBuilder = require('./build-search-index');
    const builder = new searchIndexBuilder({
      outputPath: path.join(webDir, 'assets/data/search-index.json')
    });
    
    return builder.build();
  }

  async generateMetadata() {
    this.metadata.formats = {
      web: { path: 'web/', size: await this.getDirectorySize(path.join(this.options.outputDir, 'web')) },
      pdf: { path: 'pdf/', size: await this.getFileSize(path.join(this.options.outputDir, 'pdf/content-authoring-handbook.pdf')) },
      epub: { path: 'epub/', size: await this.getFileSize(path.join(this.options.outputDir, 'epub/content-authoring-handbook.epub')) },
      print: { path: 'print/', size: await this.getFileSize(path.join(this.options.outputDir, 'print/handbook-print.html')) }
    };
    
    const metadataPath = path.join(this.options.outputDir, 'metadata.json');
    fs.writeFileSync(metadataPath, JSON.stringify(this.metadata, null, 2));
  }

  async getDirectorySize(dir) {
    if (!fs.existsSync(dir)) return 0;
    
    let size = 0;
    const files = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const file of files) {
      const filePath = path.join(dir, file.name);
      
      if (file.isDirectory()) {
        size += await this.getDirectorySize(filePath);
      } else {
        size += fs.statSync(filePath).size;
      }
    }
    
    return size;
  }

  async getFileSize(filePath) {
    if (!fs.existsSync(filePath)) return 0;
    return fs.statSync(filePath).size;
  }

  // EPUB-specific generators
  generateContainerXML() {
    return `<?xml version="1.0" encoding="UTF-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles>
    <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
  </rootfiles>
</container>`;
  }

  generateContentOPF() {
    const chapters = this.chapters.map(c => 
      `<item id="chapter-${c.id}" href="chapter-${c.id}.xhtml" media-type="application/xhtml+xml"/>`
    ).join('\n    ');
    
    const spine = this.chapters.map(c => 
      `<itemref idref="chapter-${c.id}"/>`
    ).join('\n    ');
    
    return `<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="uid">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:identifier id="uid">${this.generateEPUBId()}</dc:identifier>
    <dc:title>${this.options.title}</dc:title>
    <dc:creator>${this.options.author}</dc:creator>
    <dc:language>en</dc:language>
    <meta property="dcterms:modified">${new Date().toISOString()}</meta>
  </metadata>
  
  <manifest>
    <item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>
    <item id="ncx" href="toc.ncx" media-type="application/x-dtbncx+xml"/>
    <item id="css" href="styles.css" media-type="text/css"/>
    ${chapters}
  </manifest>
  
  <spine toc="ncx">
    <itemref idref="nav"/>
    ${spine}
  </spine>
</package>`;
  }

  generateTOCNCX() {
    const navPoints = this.chapters.map((c, i) => 
      `<navPoint id="navpoint-${i + 1}" playOrder="${i + 1}">
        <navLabel><text>${c.title}</text></navLabel>
        <content src="chapter-${c.id}.xhtml"/>
      </navPoint>`
    ).join('\n    ');
    
    return `<?xml version="1.0" encoding="UTF-8"?>
<ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2005-1">
  <head>
    <meta name="dtb:uid" content="${this.generateEPUBId()}"/>
    <meta name="dtb:depth" content="1"/>
    <meta name="dtb:totalPageCount" content="0"/>
    <meta name="dtb:maxPageNumber" content="0"/>
  </head>
  
  <docTitle>
    <text>${this.options.title}</text>
  </docTitle>
  
  <navMap>
    ${navPoints}
  </navMap>
</ncx>`;
  }

  generateNavXHTML() {
    const navItems = this.chapters.map(c => 
      `<li><a href="chapter-${c.id}.xhtml">${c.title}</a></li>`
    ).join('\n        ');
    
    return `<?xml version="1.0" encoding="UTF-8"?>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops">
  <head>
    <title>Navigation</title>
    <link rel="stylesheet" type="text/css" href="styles.css"/>
  </head>
  <body>
    <nav epub:type="toc" id="toc">
      <h1>Table of Contents</h1>
      <ol>
        ${navItems}
      </ol>
    </nav>
  </body>
</html>`;
  }

  generateEPUBStyles() {
    return `
body {
  font-family: serif;
  line-height: 1.6;
  margin: 1em;
}

h1, h2, h3, h4, h5, h6 {
  font-weight: bold;
  margin-top: 1em;
  margin-bottom: 0.5em;
}

h1 { font-size: 2em; }
h2 { font-size: 1.5em; }
h3 { font-size: 1.2em; }

p {
  margin-bottom: 1em;
  text-align: justify;
}

code {
  font-family: monospace;
  background: #f5f5f5;
  padding: 2px 4px;
  border-radius: 3px;
}

pre {
  background: #f5f5f5;
  padding: 1em;
  border-radius: 5px;
  overflow-x: auto;
}

ul, ol {
  margin-bottom: 1em;
  padding-left: 2em;
}

li {
  margin-bottom: 0.5em;
}

a {
  color: #0969da;
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}
`;
  }

  generateEPUBChapter(chapter, content) {
    return `<?xml version="1.0" encoding="UTF-8"?>
<html xmlns="http://www.w3.org/1999/xhtml">
  <head>
    <title>${chapter.title}</title>
    <link rel="stylesheet" type="text/css" href="styles.css"/>
  </head>
  <body>
    <h1>${chapter.title}</h1>
    ${content}
  </body>
</html>`;
  }

  generateEPUBId() {
    return `handbook-${Date.now()}`;
  }

  generatePrintCover() {
    return `
      <div class="print-cover">
        <div class="print-title">
          <h1>${this.options.title}</h1>
          <p class="print-subtitle">A comprehensive guide to content generation</p>
        </div>
        <div class="print-author">
          <p>By ${this.options.author}</p>
          <p>Version ${this.options.version}</p>
        </div>
      </div>
    `;
  }

  generatePrintTOC() {
    return `
      <div class="print-toc">
        <h2>Table of Contents</h2>
        ${this.generateTOCHTML()}
      </div>
    `;
  }

  async cleanup() {
    if (fs.existsSync(this.options.tempDir)) {
      fs.rmSync(this.options.tempDir, { recursive: true, force: true });
    }
  }
}

// Command line interface
if (require.main === module) {
  const args = process.argv.slice(2);
  const format = args[0] || 'all';
  
  const options = {};
  
  // Parse additional options
  for (let i = 1; i < args.length; i += 2) {
    const key = args[i].replace('--', '');
    const value = args[i + 1];
    options[key] = value;
  }
  
  const builder = new HandbookBuilder(options);
  builder.build(format);
}

module.exports = HandbookBuilder;