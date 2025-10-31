/* eslint-disable */
/**
 * Interactive Examples Framework for Content Authoring Handbook
 * Epic 8.3.2 - Interactive Examples Development
 */

class InteractiveExample {
  constructor(containerId, options = {}) {
    this.container = document.getElementById(containerId);
    this.options = {
      editorHeight: '300px',
      previewHeight: '200px',
      defaultSeed: '12345',
      autoRun: true,
      syntaxHighlight: true,
      ...options
    };

    this.editor = null;
    this.preview = null;
    this.controls = null;
    this.generatorData = null;

    this.init();
  }

  init() {
    this.createLayout();
    this.setupEditor();
    this.setupControls();
    this.setupPreview();
    this.loadInitialContent();

    if (this.options.autoRun) {
      this.runGenerator();
    }
  }

  createLayout() {
    this.container.innerHTML = `
      <div class="interactive-example">
        <div class="example-header">
          <h4>${this.options.title || 'Interactive Example'}</h4>
          <div class="example-controls">
            <button class="btn-run" title="Run Generator">▶ Run</button>
            <button class="btn-reset" title="Reset to Original">↺ Reset</button>
            <button class="btn-copy" title="Copy Code">📋 Copy</button>
            <button class="btn-download" title="Download JSON">⬇ Download</button>
          </div>
        </div>
        
        <div class="example-body">
          <div class="editor-pane">
            <div class="editor-header">
              <span>Generator JSON</span>
              <span class="editor-status"></span>
            </div>
            <div id="${this.container.id}-editor" class="code-editor"></div>
          </div>
          
          <div class="preview-pane">
            <div class="preview-header">
              <span>Output Preview</span>
              <div class="seed-control">
                <label>Seed:</label>
                <input type="text" class="seed-input" value="${this.options.defaultSeed}">
                <button class="btn-random-seed" title="Random Seed">🎲</button>
              </div>
            </div>
            <div class="preview-content">
              <div class="preview-output"></div>
              <div class="preview-variations"></div>
            </div>
          </div>
        </div>
        
        <div class="example-footer">
          <div class="error-display"></div>
          <div class="example-info">
            <span class="char-count">0 characters</span>
            <span class="exec-time">0ms</span>
          </div>
        </div>
      </div>
    `;
  }

  setupEditor() {
    const editorEl = this.container.querySelector(
      `#${this.container.id}-editor`
    );

    // Use Monaco Editor if available, fallback to textarea
    if (window.monaco) {
      this.editor = monaco.editor.create(editorEl, {
        value: '',
        language: 'json',
        theme: 'vs-light',
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        fontSize: 14,
        lineNumbers: 'on',
        renderWhitespace: 'selection',
        automaticLayout: true
      });

      // Real-time validation
      this.editor.onDidChangeModelContent(() => {
        this.validateJSON();
        if (this.options.autoRun) {
          this.debounceRun();
        }
      });
    } else {
      // Fallback to textarea with basic syntax highlighting
      editorEl.innerHTML = `
        <textarea class="code-textarea" spellcheck="false"></textarea>
      `;

      const textarea = editorEl.querySelector('textarea');
      textarea.addEventListener('input', () => {
        this.validateJSON();
        if (this.options.autoRun) {
          this.debounceRun();
        }
      });

      this.editor = {
        getValue: () => textarea.value,
        setValue: val => {
          textarea.value = val;
        },
        focus: () => textarea.focus()
      };
    }

    editorEl.style.height = this.options.editorHeight;
  }

  setupControls() {
    const controls = this.container.querySelector('.example-controls');

    // Run button
    controls.querySelector('.btn-run').addEventListener('click', () => {
      this.runGenerator();
    });

    // Reset button
    controls.querySelector('.btn-reset').addEventListener('click', () => {
      this.resetContent();
    });

    // Copy button
    controls.querySelector('.btn-copy').addEventListener('click', () => {
      this.copyCode();
    });

    // Download button
    controls.querySelector('.btn-download').addEventListener('click', () => {
      this.downloadJSON();
    });

    // Seed controls
    const seedInput = this.container.querySelector('.seed-input');
    const randomSeedBtn = this.container.querySelector('.btn-random-seed');

    seedInput.addEventListener('change', () => {
      this.runGenerator();
    });

    randomSeedBtn.addEventListener('click', () => {
      seedInput.value = Math.random().toString(36).substr(2, 9);
      this.runGenerator();
    });
  }

  setupPreview() {
    this.preview = {
      output: this.container.querySelector('.preview-output'),
      variations: this.container.querySelector('.preview-variations'),
      error: this.container.querySelector('.error-display')
    };

    const previewContent = this.container.querySelector('.preview-content');
    previewContent.style.height = this.options.previewHeight;
  }

  loadInitialContent() {
    const initialCode = this.options.initialCode || this.getDefaultGenerator();
    this.editor.setValue(initialCode);
    this.originalContent = initialCode;
  }

  getDefaultGenerator() {
    return JSON.stringify(
      {
        meta: {
          name: 'Example Generator',
          version: '1.0.0'
        },
        grammar: {
          start: 'Hello, [subject]!',
          subject: ['world', 'friend', 'there']
        }
      },
      null,
      2
    );
  }

  validateJSON() {
    const statusEl = this.container.querySelector('.editor-status');

    try {
      const content = this.editor.getValue();
      JSON.parse(content);
      statusEl.textContent = '✓ Valid JSON';
      statusEl.className = 'editor-status valid';
      this.preview.error.textContent = '';
      return true;
    } catch (e) {
      statusEl.textContent = '✗ Invalid JSON';
      statusEl.className = 'editor-status invalid';
      this.preview.error.textContent = `JSON Error: ${e.message}`;
      return false;
    }
  }

  async runGenerator() {
    if (!this.validateJSON()) return;

    const startTime = performance.now();

    try {
      const generatorJSON = JSON.parse(this.editor.getValue());
      const seed = this.container.querySelector('.seed-input').value;

      // Simulate generator execution (replace with actual engine call)
      const result = await this.executeGenerator(generatorJSON, seed);

      // Display main output
      this.preview.output.innerHTML = `
        <div class="output-text">${this.escapeHtml(result.output)}</div>
        <div class="output-path">Path: ${result.path || 'start'}</div>
      `;

      // Show variations with different seeds
      if (this.options.showVariations) {
        this.showVariations(generatorJSON);
      }

      // Update stats
      const execTime = Math.round(performance.now() - startTime);
      this.updateStats(result.output.length, execTime);
    } catch (e) {
      this.preview.error.textContent = `Execution Error: ${e.message}`;
      this.preview.output.textContent = '';
    }
  }

  async executeGenerator(generatorJSON, seed) {
    // This is a simplified mock execution
    // In production, this would call the actual Prompt Spaghetti engine

    if (!generatorJSON.grammar || !generatorJSON.grammar.start) {
      throw new Error('Generator must have grammar.start');
    }

    // Simple mock execution
    const start = generatorJSON.grammar.start;
    let output = start;

    if (Array.isArray(start)) {
      // Random selection based on seed
      const index = this.seedRandom(seed) % start.length;
      output = start[index];
    }

    // Simple reference expansion
    output = output.replace(/\[(\w+)\]/g, (match, ruleName) => {
      const rule = generatorJSON.grammar[ruleName];
      if (Array.isArray(rule)) {
        const index = this.seedRandom(seed + ruleName) % rule.length;
        return rule[index];
      }
      return rule || match;
    });

    return {
      output,
      path: 'start',
      seed
    };
  }

  seedRandom(seed) {
    // Simple seed-based pseudo-random
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = (hash << 5) - hash + seed.charCodeAt(i);
      hash = hash & hash;
    }
    return Math.abs(hash);
  }

  showVariations(generatorJSON) {
    const variations = [];
    const seeds = ['abc', '123', 'xyz', 'test', 'demo'];

    seeds.forEach(seed => {
      this.executeGenerator(generatorJSON, seed).then(result => {
        variations.push(
          `<div class="variation"><span class="seed">${seed}:</span> ${this.escapeHtml(result.output)}</div>`
        );

        if (variations.length === seeds.length) {
          this.preview.variations.innerHTML = `
            <div class="variations-header">Other variations:</div>
            ${variations.join('')}
          `;
        }
      });
    });
  }

  resetContent() {
    this.editor.setValue(this.originalContent);
    this.runGenerator();
  }

  copyCode() {
    const code = this.editor.getValue();
    navigator.clipboard.writeText(code).then(() => {
      this.showToast('Copied to clipboard!');
    });
  }

  downloadJSON() {
    const code = this.editor.getValue();
    const blob = new Blob([code], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'generator.json';
    a.click();
    URL.revokeObjectURL(url);
    this.showToast('Download started!');
  }

  updateStats(charCount, execTime) {
    this.container.querySelector('.char-count').textContent =
      `${charCount} characters`;
    this.container.querySelector('.exec-time').textContent = `${execTime}ms`;
  }

  showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast-message';
    toast.textContent = message;
    this.container.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('show');
    }, 10);

    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 2000);
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  debounceRun() {
    clearTimeout(this.runTimeout);
    this.runTimeout = setTimeout(() => {
      this.runGenerator();
    }, 500);
  }
}

// Export for use in handbook pages
window.InteractiveExample = InteractiveExample;

// Auto-initialize examples on page load
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-interactive-example]').forEach(el => {
    const options = {
      title: el.dataset.title,
      initialCode: el.dataset.code,
      showVariations: el.dataset.variations === 'true',
      ...JSON.parse(el.dataset.options || '{}')
    };

    new InteractiveExample(el.id, options);
  });
});
