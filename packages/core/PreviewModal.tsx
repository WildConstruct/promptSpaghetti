import React from "react";

interface PreviewResult {
  seed: number;
  output?: string;
  error?: string;
}

interface PreviewModalProps {
  open: boolean;
  loading: boolean;
  error: string | null;
  results: PreviewResult[];
  onClose: () => void;
  onCancel?: () => void;
  onResultHover?: (index: number) => void;
}

export const PreviewModal: React.FC<PreviewModalProps> = ({ open, loading, error, results, onClose, onCancel, onResultHover }) => {
  if (!open) return null;
  return (
    <div role="dialog" aria-modal="true" style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", background: "rgba(0,0,0,0.4)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "#fff", borderRadius: 8, padding: 24, minWidth: 400, maxWidth: 600 }}>
        <h2>Preview 5 Results</h2>
        {loading && <div style={{marginBottom:12}}>Loading...</div>}
        {error && <div style={{ color: "#c00" }}>Error: {error}</div>}
        {!loading && !error && (
          <ul style={{ padding: 0, listStyle: "none" }}>
            {results.map((res, i) => (
              <li key={i} onMouseEnter={() => onResultHover?.(i)} style={{ marginBottom: 16, padding: 8, border: "1px solid #eee", borderRadius: 4, position:"relative", cursor:'pointer' }}>
                <span style={{
                  position:"absolute",
                  top:-10,
                  left:-10,
                  background: res.error ? "#c00" : "#4d7cff",
                  color:"#fff",
                  fontSize:10,
                  padding:"2px 6px",
                  borderRadius:12,
                  fontWeight:600
                }}>{res.seed}</span>
                {res.error ? (
                  <div style={{ color: "#c00" }}>{res.error}</div>
                ) : (
                  <div style={{ fontFamily: "monospace", whiteSpace:"pre-wrap" }}>{res.output}</div>
                )}
              </li>
            ))}
          </ul>
        )}
        <button onClick={onClose} style={{ marginTop: 16 }}>Close</button>
      </div>
    </div>
  );
};
