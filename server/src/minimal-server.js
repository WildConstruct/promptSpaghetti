const express = require('express');
const cors = require('cors');
const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Preview endpoint
app.post('/preview', (req, res) => {
  const { nodes = [], edges = [], seeds = [1234], maxLength = 1000 } = req.body;

  // Return empty result for now - just to keep the app functional
  const results = seeds.map(seed => ({
    seed,
    output: '',
    error: null,
    duration: 0
  }));

  res.json({ results });
});

// Export endpoint
app.post('/export', (req, res) => {
  const { graph } = req.body;
  res.json({
    version: '1.0.0',
    graph: graph || { nodes: [], edges: [] }
  });
});

// Start server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Minimal server running on http://localhost:${PORT}`);
});
