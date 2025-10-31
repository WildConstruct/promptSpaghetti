// Auto-dismiss flash banner after save
document.addEventListener('DOMContentLoaded', function () {
  const banner = document.querySelector('.banner');
  if (banner) {
    setTimeout(() => {
      if (banner && banner.parentElement) {
        banner.parentElement.removeChild(banner);
      }
    }, 2500);
  }
});

function switchTab(tabName) {
  document.querySelectorAll('.tab-content').forEach(content => {
    content.classList.remove('active');
  });
  document.querySelectorAll('.tab').forEach(tab => {
    tab.classList.remove('active');
  });
  document.getElementById(tabName).classList.add('active');
  const btn = document.querySelector(`[data-tab="${tabName}"]`);
  if (btn) {
    btn.classList.add('active');
  }
}

function selectModel(modelId) {
  const input = document.getElementById('selected_model');
  if (input) {
    input.value = modelId;
  }
  document.querySelectorAll('.model-card').forEach(card => card.classList.remove('selected'));
  const el = document.querySelector(`[data-model="${modelId}"]`);
  if (el) {
    el.classList.add('selected');
  }
}

// Helper functions for better UX
function getAdminPassword() {
  const input = document.createElement('input');
  input.type = 'password';
  input.placeholder = 'Enter admin password';
  input.style.cssText = 'margin: 8px 0; padding: 4px; width: 200px;';
  
  const form = document.createElement('div');
  form.style.cssText = 'position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: white; padding: 20px; border: 1px solid #ccc; box-shadow: 0 2px 10px rgba(0,0,0,0.1); z-index: 1000;';
  form.innerHTML = '<div style="margin-bottom: 10px;">Admin Password Required:</div>';
  form.appendChild(input);
  
  const button = document.createElement('button');
  button.textContent = 'Submit';
  button.style.cssText = 'margin-left: 8px; padding: 4px 8px;';
  button.onclick = () => {
    document.body.removeChild(form);
  };
  form.appendChild(button);
  
  document.body.appendChild(form);
  input.focus();
  
  return new Promise((resolve) => {
    button.onclick = () => {
      resolve(input.value);
      document.body.removeChild(form);
    };
    input.onkeypress = (e) => {
      if (e.key === 'Enter') {
        resolve(input.value);
        document.body.removeChild(form);
      }
    };
  });
}

function showErrorMessage(message) {
  const div = document.createElement('div');
  div.style.cssText = 'position: fixed; top: 20px; right: 20px; background: #f44336; color: white; padding: 12px; border-radius: 4px; z-index: 1000; max-width: 300px;';
  div.textContent = message;
  document.body.appendChild(div);
  
  setTimeout(() => {
    if (div.parentElement) {
      document.body.removeChild(div);
    }
  }, 5000);
}

async function testLLM() {
  const button = document.getElementById('test-button');
  const resultDiv = document.getElementById('test-result');
  if (!button || !resultDiv) {
    return;
  }
  button.disabled = true;
  button.textContent = 'Testing...';
  resultDiv.innerHTML = 'Running test...';
  try {
    const pw = await getAdminPassword();
    const promptField = document.getElementById('test-prompt');
    const modelField = document.getElementById('test-model');
    const promptValue =
      promptField && 'value' in promptField ? String(promptField.value) : '';
    const modelValue =
      modelField && 'value' in modelField ? String(modelField.value) : '';
    const response = await fetch('/admin/test-llm', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Basic ' + btoa(`admin:${pw || ''}`)
      },
      body: JSON.stringify({
        prompt: promptValue,
        model: modelValue
      })
    });
    const result = await response.json();
    resultDiv.innerHTML = '<pre>' + JSON.stringify(result, null, 2) + '</pre>';
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    resultDiv.innerHTML = '<div class="error">Test failed: ' + message + '</div>';
  } finally {
    button.disabled = false;
    button.textContent = 'Run Test';
  }
}

async function testFeature(name) {
  console.warn('Not implemented: ' + name);
  showErrorMessage('Feature not implemented: ' + name);
}

window.onload = function() { switchTab('config'); };

// Expose for inline HTML to call (already referenced)
// @ts-ignore
window.switchTab = switchTab;
// @ts-ignore
window.selectModel = selectModel;
// @ts-ignore
window.testLLM = testLLM;
// @ts-ignore
window.testFeature = testFeature;

// Ensure containers exist inside Metrics tab
function ensureAnalyticsContainers() {
  const metricsTab = document.getElementById('metrics');
  if (!metricsTab) {
    return;
  }
  if (!document.getElementById('analytics-cards')) {
    const section1 = document.createElement('div');
    section1.className = 'section';
    section1.innerHTML = '<h2>Traffic Overview</h2><div id="analytics-cards" class="metrics"></div>';
    metricsTab.appendChild(section1);
  }
  if (!document.getElementById('analytics-sparkline')) {
    const section2 = document.createElement('div');
    section2.className = 'section';
    section2.innerHTML = '<h2>Requests Per Minute (last 60m)</h2><div id="analytics-sparkline" class="code"></div>';
    metricsTab.appendChild(section2);
  }
  if (!document.getElementById('analytics-footer')) {
    const footer = document.createElement('div');
    footer.className = 'section';
    footer.innerHTML = '<h2>Runtime</h2><div id="analytics-footer" class="code"></div>';
    metricsTab.appendChild(footer);
  }
}

// Analytics: fetch metrics and render simple cards + sparkline
async function loadAnalytics() {
  try {
    const res = await fetch('/api/admin/metrics', { credentials: 'include' });
    if (!res.ok) {
      return;
    }
    const data = await res.json();
    const cards = document.getElementById('analytics-cards');
    const spark = document.getElementById('analytics-sparkline');
    const foot = document.getElementById('analytics-footer');
    if (!cards || !spark) {
      return;
    }

    const t = (k) => data.totals?.[k] || 0;
    const e = (k) => data.errors?.[k] || 0;

    cards.innerHTML = `
      <div class="metric"><div class="metric-value">${t('llm.complete')}</div><div class="metric-label">LLM Completes</div></div>
      <div class="metric"><div class="metric-value">${t('llm.parse')}</div><div class="metric-label">LLM Parses</div></div>
      <div class="metric"><div class="metric-value">${t('files.upload')}</div><div class="metric-label">Uploads</div></div>
      <div class="metric"><div class="metric-value">${t('preview.request')}</div><div class="metric-label">Previews</div></div>
      <div class="metric"><div class="metric-value">${e('llm.timeout')}</div><div class="metric-label">LLM Timeouts</div></div>
    `;

    // Sparkline SVG
    const w = 600, h = 80, pad = 6;
    const series = Array.isArray(data.perMinute) ? data.perMinute : [];
    const max = Math.max(1, ...series.map(p => p.count));
    const step = (w - pad * 2) / Math.max(1, series.length - 1);
    const points = series.map((p, i) => {
      const x = pad + i * step;
      const y = h - pad - (p.count / max) * (h - pad * 2);
      return `${x},${y}`;
    }).join(' ');
    spark.innerHTML = `<svg width="${w}" height="${h}"><polyline fill="none" stroke="#10b981" stroke-width="2" points="${points}" /></svg>`;

    if (foot) {
      const fmt = (sec) => {
        sec = Number(sec||0);
        const h = Math.floor(sec/3600); const m = Math.floor((sec%3600)/60); const s = Math.floor(sec%60);
        return `${h}h ${m}m ${s}s`;
      };
      const t = (k) => data.totals?.[k] || 0;
      foot.innerHTML = `
        <div>Uptime: <strong>${fmt(data.uptimeSec)}</strong></div>
        <div>Started: <code>${data.startedAt || ''}</code></div>
        <div style="margin-top:6px">Totals since start:
          <code>llm.complete=${t('llm.complete')}</code>,
          <code>llm.parse=${t('llm.parse')}</code>,
          <code>files.upload=${t('files.upload')}</code>,
          <code>preview.request=${t('preview.request')}</code>
        </div>
      `;
    }
  } catch (error) {
    console.error('Analytics loading failed:', error);
  }
}

setInterval(loadAnalytics, 5000);
document.addEventListener('DOMContentLoaded', () => {
  ensureAnalyticsContainers();
  loadAnalytics();
});
