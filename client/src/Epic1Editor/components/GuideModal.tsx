import React, { useState } from 'react';
import gettingStarted from '../../../../docs/getting-started.md?raw';
import userGuide from '../../../../docs/user-guide.md?raw';

type GuideId = 'getting-started' | 'user-guide';

const DOCS: Record<GuideId, { label: string; md: string }> = {
  'getting-started': { label: 'Getting started', md: gettingStarted },
  'user-guide': { label: 'User guide', md: userGuide }
};

function inline(text: string, keyBase: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  const regex = /(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let k = 0;
  while ((m = regex.exec(text)) !== null) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    const t = m[0];
    if (t.startsWith('**')) {
      parts.push(<strong key={`${keyBase}-${k++}`}>{t.slice(2, -2)}</strong>);
    } else if (t.startsWith('`')) {
      parts.push(<code key={`${keyBase}-${k++}`} className="gm-code">{t.slice(1, -1)}</code>);
    } else {
      const mm = t.match(/\[([^\]]+)\]\(([^)]+)\)/);
      if (mm) parts.push(<code key={`${keyBase}-${k++}`} className="gm-code">{mm[1]}</code>);
    }
    last = regex.lastIndex;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}

function renderMarkdown(md: string): React.ReactNode[] {
  const lines = md.split('\n');
  const out: React.ReactNode[] = [];
  let para: string[] = [];
  let list: string[] = [];
  let key = 0;
  const flushPara = () => {
    if (para.length) { out.push(<p key={key++} className="gm-p">{inline(para.join(' '), `p${key}`)}</p>); para = []; }
  };
  const flushList = () => {
    if (list.length) {
      out.push(<ul key={key++} className="gm-ul">{list.map((t, j) => <li key={j}>{inline(t, `l${key}-${j}`)}</li>)}</ul>);
      list = [];
    }
  };
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (line.startsWith('```')) {
      flushPara(); flushList();
      const code: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith('```')) { code.push(lines[i]); i++; }
      out.push(<pre key={key++} className="gm-pre">{code.join('\n')}</pre>);
      i++; continue;
    }
    const h = line.match(/^(#{1,3})\s+(.*)/);
    if (h) {
      flushPara(); flushList();
      const lvl = h[1].length;
      const content = inline(h[2], `h${key}`);
      out.push(lvl === 1
        ? <h1 key={key++} className="gm-h1">{content}</h1>
        : lvl === 2 ? <h2 key={key++} className="gm-h2">{content}</h2>
          : <h3 key={key++} className="gm-h3">{content}</h3>);
      i++; continue;
    }
    if (/^\s*[-*]\s+/.test(line)) { flushPara(); list.push(line.replace(/^\s*[-*]\s+/, '')); i++; continue; }
    if (/^\s*\d+\.\s+/.test(line)) { flushPara(); list.push(line.replace(/^\s*\d+\.\s+/, '')); i++; continue; }
    if (/^>\s?/.test(line)) { flushPara(); flushList(); out.push(<blockquote key={key++} className="gm-bq">{inline(line.replace(/^>\s?/, ''), `b${key}`)}</blockquote>); i++; continue; }
    if (/^---+$/.test(line.trim())) { flushPara(); flushList(); out.push(<hr key={key++} className="gm-hr" />); i++; continue; }
    if (line.trim() === '') { flushPara(); flushList(); i++; continue; }
    para.push(line); i++;
  }
  flushPara(); flushList();
  return out;
}

export const GuideModal: React.FC<{ isOpen: boolean; onClose: () => void; initial?: GuideId }> = ({ isOpen, onClose, initial = 'getting-started' }) => {
  const [tab, setTab] = useState<GuideId>(initial);
  React.useEffect(() => { if (isOpen) setTab(initial); }, [isOpen, initial]);
  if (!isOpen) return null;
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 9500, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <style>{`
        .gm-body{font-family:system-ui,-apple-system,sans-serif;color:#cfd3da;font-size:14px;line-height:1.65}
        .gm-h1{color:#e6a23c;font-size:22px;font-weight:600;margin:0 0 12px}
        .gm-h2{color:#e6a23c;font-size:17px;font-weight:600;margin:22px 0 8px}
        .gm-h3{color:#f0bd6e;font-size:14px;font-weight:600;margin:16px 0 6px}
        .gm-p{margin:0 0 12px}
        .gm-ul{margin:0 0 12px;padding-left:20px}
        .gm-ul li{margin:4px 0}
        .gm-code{background:#111111;border:1px solid rgba(255,255,255,.08);border-radius:4px;padding:1px 5px;font-family:monospace;font-size:12.5px;color:#e7e9ee}
        .gm-pre{background:#111111;border:1px solid rgba(255,255,255,.08);border-radius:8px;padding:12px;overflow-x:auto;font-family:monospace;font-size:12.5px;color:#cfd3da;margin:0 0 14px}
        .gm-bq{border-left:3px solid #e6a23c;margin:0 0 12px;padding:2px 12px;color:#9aa1ad}
        .gm-hr{border:none;border-top:1px solid rgba(255,255,255,.08);margin:18px 0}
        .gm-body strong{color:#e7e9ee;font-weight:600}
      `}</style>
      <div onClick={e => e.stopPropagation()} style={{ background: '#1b1b1b', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 12, width: '100%', maxWidth: 760, maxHeight: '85vh', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          {(Object.keys(DOCS) as GuideId[]).map(id => (
            <button key={id} onClick={() => setTab(id)} style={{ background: tab === id ? '#2a2713' : '#202020', color: tab === id ? '#f0bd6e' : '#cfd3da', border: tab === id ? '1px solid rgba(230,162,60,0.5)' : '1px solid rgba(255,255,255,0.12)', borderRadius: 7, padding: '6px 12px', fontSize: 13, cursor: 'pointer' }}>
              {DOCS[id].label}
            </button>
          ))}
          <span style={{ flex: 1 }} />
          <button onClick={onClose} aria-label="Close guide" style={{ background: '#202020', color: '#dfe2e8', border: '1px solid rgba(255,255,255,0.14)', borderRadius: 7, padding: '6px 12px', fontSize: 13, cursor: 'pointer' }}>Close</button>
        </div>
        <div className="gm-body" style={{ overflowY: 'auto', padding: '18px 24px' }}>
          {renderMarkdown(DOCS[tab].md)}
        </div>
      </div>
    </div>
  );
};

export default GuideModal;
