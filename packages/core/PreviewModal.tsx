import React from "react";

interface PreviewResult {
  output: string;
  seed: number;
}

interface PreviewModalProps {
  open: boolean;
  loading: boolean;
  error: string | null;
  results: PreviewResult[];
  onClose: () => void;
}

export const PreviewModal: React.FC<PreviewModalProps> = ({ open, loading, error, results, onClose }) => {
  if (!open) return null;
  return (
    <div role="dialog" aria-modal="true" style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", background: "rgba(0,0,0,0.4)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "#fff", borderRadius: 8, padding: 24, minWidth: 400, maxWidth: 600 }}>
        <h2>Preview 5 Results</h2>
        {loading && <div>Loading...</div>}
        {error && <div style={{ color: "#c00" }}>Error: {error}</div>}
        {!loading && !error && (
          <ul style={{ padding: 0, listStyle: "none" }}>
            {results.map((res, i) => (
              <li key={i} style={{ marginBottom: 16, padding: 8, border: "1px solid #eee", borderRadius: 4 }}>
                <div style={{ fontFamily: "monospace", marginBottom: 4 }}>{res.output}</div>
                <div style={{ fontSize: 12, color: "#888" }}>Seed: {res.seed}</div>
              </li>
            ))}
          </ul>
        )}
        <button onClick={onClose} style={{ marginTop: 16 }}>Close</button>
      </div>
    </div>
  );
};
