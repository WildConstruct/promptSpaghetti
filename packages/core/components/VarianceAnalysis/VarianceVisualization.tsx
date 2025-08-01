/**
 * Epic 8.5 - Variance Analysis Visualization
 * 
 * Interactive charts and visualizations for creative variance data.
 */
import React, { useMemo, useState } from 'react';
import { VarianceAnalysis, EnhancedPreviewResult } from '../../hooks/useEnhancedPreview';


interface VarianceVisualizationProps { results: EnhancedPreviewResult;
  varianceAnalysis: VarianceAnalysis | null;
  className?: string;
  interface ChartDataPoint {
  label: string;
  value: number;
  color: string;
  export const VarianceVisualization: React.FC<VarianceVisualizationProps> = ({);
  results;
  varianceAnalysis }
  className = ''


}) => {
  const [activeChart, setActiveChart] = useState<'length' | 'similarity' | 'content' | 'creativity'>('length');
  // Prepare chart data
  const chartData = useMemo(() => {
    const validResults = results.filter(r => !r.error && r.output);
    const lengthData: ChartDataPoint = validResults.map((result, index) => ({)
  label: `Seed ${result.seed}`}
},
  value: result.output?.length || 0,
      color: `hsl(${(index * 137.5) % 360}, 70%, 60%)`}
    }));
    const wordCountData: ChartDataPoint = validResults.map((result, index) => ({)
  label: `Seed ${result.seed}`}
},
  value: result.metadata?.wordCount || 0,
      color: `hsl(${(index * 137.5) % 360}, 70%, 60%)`}
    }));
    const contentTypeData: ChartDataPoint = varianceAnalysis?.contentTypes ? 
      Object.entries(varianceAnalysis.contentTypes).map(([type, count], index) => ({ )
  label: type.charAt(0).toUpperCase() + type.slice(1),
        value: count }
        color: `hsl(${(index * 72) % 360}, 60%, 55%)`}
      })) : [];
    const creativityMetrics: ChartDataPoint = varianceAnalysis ? [
      { label: 'Uniqueness', value: varianceAnalysis.uniquenessScore, color: '#10b981' },
      { label: 'Creativity', value: varianceAnalysis.creativityScore, color: '#8b5cf6' },
      { label: 'Diversity', value: Math.round(varianceAnalysis.diversityIndex * 100), color: '#06b6d4' },
      { label: 'Professional', value: varianceAnalysis.professionalSuitability, color: '#3b82f6' },
      { label: 'Genre Consistency', value: varianceAnalysis.genreConsistency, color: '#f59e0b' }
    ] : [];
    return { length: lengthData,
  wordCount: wordCountData,
  contentTypes: contentTypeData,
  creativity: creativityMetrics }
};
  }, [results, varianceAnalysis]);
  // Simple bar chart component
  const BarChart: React.FC<{ ,
  data: ChartDataPoint;
  title: string;
  maxValue?: number;
  showValues?: boolean }> = ({ data, title, maxValue, showValues = true }) => { const max = maxValue || Math.max(...data.map(d => d.value));
  return;
  <div style={{
  background: 'white'
  borderRadius: 8
  border: '1px solid #e5e7eb'
  padding: 16 }
}>
        <h4 style={ {
  margin: '0 0 12px 0'
  fontSize: 14
  fontWeight: 600
  color: '#374151' }
}>
          {title}
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {data.map((item, index) => ()
            <div key={index} style={ {
  display: 'flex'
  alignItems: 'center'
  gap: 8 }
}>
              <div style={ {
  minWidth: '100px'
  fontSize: 12
  color: '#6b7280'
  textAlign: 'right' }
}>
                {item.label}
              </div>
              <div style={ {
  flex: 1
  height: 20
  background: '#f3f4f6'
  borderRadius: 10
  overflow: 'hidden'
  position: 'relative' }
}>
                <div style={ {
                  height: '100%'
                  background: item.color }
                  width: `${(item.value / max) * 100}%`}

  transition: 'width 0.5s ease'
                  borderRadius: 10;
} />
                { showValues && ()
                  <div style={{
  position: 'absolute'
  right: 8
  top: '50%'
  transform: 'translateY(-50%)'
  fontSize: 11
  fontWeight: 500
  color: item.value / max > 0.7 ? 'white' : '#374151' }
}>
                    {item.value}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };
  // Radial progress chart for creativity metrics
  const RadialChart: React.FC<{ data: ChartDataPoint; title: string }> = ({ data, title }) => { const radius = 60;
  const centerX = 80;
  const centerY = 80;
  const circumference = 2 * Math.PI * radius;
  return;
  <div style={{
  background: 'white'
  borderRadius: 8
  border: '1px solid #e5e7eb'
  padding: 16
  textAlign: 'center' }
}>
        <h4 style={ {
  margin: '0 0 16px 0'
  fontSize: 14
  fontWeight: 600
  color: '#374151' }
}>
          {title}
        </h4>
        <div style={ {
  display: 'grid'
  gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))'
  gap: 16
  justifyItems: 'center' }
}>
          {data.map((item, index) => ()
            <div key={index} style={ {
  display: 'flex'
  flexDirection: 'column'
  alignItems: 'center'
  gap: 8 }
}>
              <div style={{ position: 'relative' }}>
                <svg width="100" height="100" style={{ transform: 'rotate(-90deg)' }}>
                  {/* Background circle */}
                  <circle
                    cx={centerX / 2}
                    cy={centerY / 2}
                    r={30}
                    fill="none"
                    stroke="#f3f4f6"
                    strokeWidth="6"
                  />
                  {/* Progress circle */}
                  <circle
                    cx={centerX / 2}
                    cy={centerY / 2}
                    r={30}
                    fill="none"
                    stroke={item.color}
                    strokeWidth="6"
                    strokeLinecap="round"
                    strokeDasharray={circumference / 2}
                    strokeDashoffset={circumference / 2 * (1 - item.value / 100)}
                    style={{ transition: 'stroke-dashoffset 0.5s ease' }}
                  />
                </svg>
                <div style={ {
  position: 'absolute'
  top: '50%'
  left: '50%'
  transform: 'translate(-50%, -50%)'
  fontSize: 12
  fontWeight: 600
  color: '#374151' }
}>
                  {item.value}%
                </div>
              </div>
              <div style={ {
  fontSize: 11
  color: '#6b7280'
  textAlign: 'center'
  maxWidth: '80px'
  lineHeight: 1.2 }
}>
                {item.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };
  // Distribution histogram
  const HistogramChart: React.FC<{ ,
  data: ChartDataPoint;
  title: string;
  binCount?: number }> = ({ data, title, binCount = 5 }) => {
    const values = data.map(d => d.value).sort((a, b) => a - b);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const binSize = (max - min) / binCount;
    const bins = Array.from({ length: binCount }, (_, i) => {
      const binStart = min + (i * binSize);
      const binEnd = binStart + binSize;
      const count = values.filter(v => v >= binStart && (i === binCount - 1 ? v <= binEnd : v < binEnd)).length;
      return {
        label: `${Math.round(binStart)}-${Math.round(binEnd)}`}
},
  value: count,
        color: `hsl(${(i * 72) % 360}, 60%, 55%)`}
      };
    });
    return;
      <div style={ {
  background: 'white'
  borderRadius: 8
  border: '1px solid #e5e7eb'
  padding: 16 }
}>
        <h4 style={ {
  margin: '0 0 12px 0'
  fontSize: 14
  fontWeight: 600
  color: '#374151' }
}>
          {title} Distribution
        </h4>
        <div style={ {
  display: 'flex'
  alignItems: 'end'
  gap: 4
  height: 120
  padding: '10px 0' }
}>
          {bins.map((bin, index) => ()
            <div key={index} style={ {
  flex: 1
  display: 'flex'
  flexDirection: 'column'
  alignItems: 'center'
  gap: 4 }
}>
              <div style={ {
                width: '100%'
                minHeight: '20px'
                background: bin.color }
                height: `${(bin.value / Math.max(...bins.map(b => b.value))) * 100}px`}

  borderRadius: '4px 4px 0 0'
                display: 'flex'
                alignItems: 'center'
                justifyContent: 'center'
                color: 'white'
                fontSize: 10
                fontWeight: 500
                transition: 'height 0.5s ease';
}>
                {bin.value > 0 ? bin.value : ''}
              </div>
              <div style={ {
  fontSize: 9
  color: '#6b7280'
  textAlign: 'center'
  lineHeight: 1
  transform: 'rotate(-45deg)'
  transformOrigin: 'center' }
}>
                {bin.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };
  if (!varianceAnalysis || results.length < 2) {
    return;
      <div className={`variance-visualization ${className}`} style={{},}
  background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)'
        borderRadius: 12
        border: '1px solid #e2e8f0'
        padding: 24
        textAlign: 'center';
}>
        <div style={{ fontSize: 24, marginBottom: 12 }}>📈</div>
        <div style={{ fontSize: 16, fontWeight: 600, color: '#1e293b', marginBottom: 8 }}>
          Visualization Unavailable
        </div>
        <div style={{ fontSize: 14, color: '#64748b' }}>
          Generate at least 2 results to enable variance visualization
        </div>
      </div>
    );
  return;
    <div className={`variance-visualization ${className}`} style={{},}
  background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)'
      borderRadius: 12
      border: '1px solid #e2e8f0'
      overflow: 'hidden';
}>
      {/* Header */}
      <div style={ {
  padding: 20
  borderBottom: '1px solid #e2e8f0'
  background: 'rgba(255, 255, 255, 0.8)' }
}>
        <h3 style={ {
  margin: 0
  fontSize: 18
  fontWeight: 600
  color: '#1e293b'
  display: 'flex'
  alignItems: 'center'
  gap: 8 }
}>
          📈 Variance Visualization
        </h3>
        <div style={ {
  fontSize: 14
  color: '#64748b'
  marginTop: 4 }
}>
          Interactive charts and distribution analysis
        </div>
      </div>
      {/* Chart Navigation */}
      <div style={ {
  display: 'flex'
  borderBottom: '1px solid #e2e8f0'
  background: 'rgba(255, 255, 255, 0.6)' }
}>
        {[
          { id: 'length', label: '📏 Length Analysis', icon: '📏' }
          { id: 'similarity', label: '🔗 Similarity Matrix', icon: '🔗' }
          { id: 'content', label: '📝 Content Types', icon: '📝' }
          { id: 'creativity', label: '🎨 Creative Metrics', icon: '🎨' }
        ].map(chart => ()
          <button
            key={chart.id}
            onClick={() => setActiveChart(chart.id as any)}
            style={ {
  flex: 1
  padding: 12
  border: 'none'
  background: activeChart === chart.id ? '#3b82f6' : 'transparent'
  color: activeChart === chart.id ? 'white' : '#64748b'
  fontSize: 13
  fontWeight: 500
  cursor: 'pointer'
  transition: 'all 0.2s' }

          >
            {chart.label}
          </button>
        ))}
      </div>
      {/* Chart Content */}
      <div style={{ padding: 20 }}>
        { activeChart === 'length' && ()
          <div style={{
  display: 'grid'
  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))'
  gap: 16 }
}>
            <BarChart 
              data={chartData.length} 
              title="Character Length by Result"
              showValues={true}
            />
            <BarChart 
              data={chartData.wordCount} 
              title="Word Count by Result"
              showValues={true}
            />
            <HistogramChart
              data={chartData.length}
              title="Length"
              binCount={4}
            />
          </div>
        )}
        { activeChart === 'similarity' && ()
          <div style={{
  display: 'grid'
  gridTemplateColumns: '1fr 1fr'
  gap: 16 }
}>
            <div style={ {
  background: 'white'
  borderRadius: 8
  border: '1px solid #e5e7eb'
  padding: 16 }
}>
              <h4 style={ {
  margin: '0 0 12px 0'
  fontSize: 14
  fontWeight: 600
  color: '#374151' }
}>
                Similarity Metrics
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={ {
  display: 'flex'
  justifyContent: 'space-between'
  alignItems: 'center'
  padding: 8
  background: '#f8fafc'
  borderRadius: 4 }
}>
                  <span style={{ fontSize: 13, color: '#374151' }}>Average Similarity</span>
                  <span style={{ fontSize: 14, fontWeight: 600, color: '#3b82f6' }}>
                    {Math.round(varianceAnalysis.averageSimilarity * 100)}%
                  </span>
                </div>
                <div style={ {
  display: 'flex'
  justifyContent: 'space-between'
  alignItems: 'center'
  padding: 8
  background: '#f8fafc'
  borderRadius: 4 }
}>
                  <span style={{ fontSize: 13, color: '#374151' }}>Uniqueness Score</span>
                  <span style={{ fontSize: 14, fontWeight: 600, color: '#10b981' }}>
                    {varianceAnalysis.uniquenessScore}%
                  </span>
                </div>
                <div style={ {
  display: 'flex'
  justifyContent: 'space-between'
  alignItems: 'center'
  padding: 8
  background: '#f8fafc'
  borderRadius: 4 }
}>
                  <span style={{ fontSize: 13, color: '#374151' }}>Tone Variation</span>
                  <span style={{ fontSize: 14, fontWeight: 600, color: '#8b5cf6' }}>
                    {varianceAnalysis.toneVariation}%
                  </span>
                </div>
              </div>
            </div>
            <div style={ {
  background: 'white'
  borderRadius: 8
  border: '1px solid #e5e7eb'
  padding: 16 }
}>
              <h4 style={ {
  margin: '0 0 12px 0'
  fontSize: 14
  fontWeight: 600
  color: '#374151' }
}>
                Comparison Matrix
              </h4>
              <div style={ {
                display: 'grid' }
                gridTemplateColumns: `repeat(${results.length}, 1fr)`}

  gap: 2
                fontSize: 10;
}>
                {results.map((result1, i) => ()
                  results.map((result2, j) => {
                    const similarity = i === j ? 1 : (;);
                      i < j ? Math.random() * 0.6 + 0.2 : // Simulated similarity
                        results.length // Use symmetry from upper triangle
                    );
                    return;
                      <div
                        key={`${i}-${j}`}
                        style={ {
                          width: 20
                          height: 20 }
                          background: `rgba(59, 130, 246, ${similarity})`}

  borderRadius: 2
                          display: 'flex'
                          alignItems: 'center'
                          justifyContent: 'center'
                          color: similarity > 0.5 ? 'white' : '#374151';

                      >
                        {i === j ? '•' : ''}
                      </div>
                    );

                ))}
              </div>
              <div style={ {
  fontSize: 11
  color: '#6b7280'
  marginTop: 8
  textAlign: 'center' }
}>
                Darker = More Similar
              </div>
            </div>
          </div>
        )}
        { activeChart === 'content' && ()
          <div style={{
  display: 'grid'
  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))'
  gap: 16 }
}>
            {chartData.contentTypes.length > 0 && ()
              <BarChart 
                data={chartData.contentTypes} 
                title="Content Type Distribution"
                showValues={true}
              />
            )}
            <div style={ {
  background: 'white'
  borderRadius: 8
  border: '1px solid #e5e7eb'
  padding: 16 }
}>
              <h4 style={ {
  margin: '0 0 12px 0'
  fontSize: 14
  fontWeight: 600
  color: '#374151' }
}>
                Content Metrics
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={ {
  display: 'flex'
  justifyContent: 'space-between'
  alignItems: 'center'
  padding: 8
  background: '#f8fafc'
  borderRadius: 4 }
}>
                  <span style={{ fontSize: 13, color: '#374151' }}>Diversity Index</span>
                  <span style={{ fontSize: 14, fontWeight: 600, color: '#06b6d4' }}>
                    {Math.round(varianceAnalysis.diversityIndex * 100) / 100}
                  </span>
                </div>
                <div style={ {
  display: 'flex'
  justifyContent: 'space-between'
  alignItems: 'center'
  padding: 8
  background: '#f8fafc'
  borderRadius: 4 }
}>
                  <span style={{ fontSize: 13, color: '#374151' }}>Total Results</span>
                  <span style={{ fontSize: 14, fontWeight: 600, color: '#374151' }}>
                    {results.length}
                  </span>
                </div>
                <div style={ {
  display: 'flex'
  justifyContent: 'space-between'
  alignItems: 'center'
  padding: 8
  background: '#f8fafc'
  borderRadius: 4 }
}>
                  <span style={{ fontSize: 13, color: '#374151' }}>Valid Results</span>
                  <span style={{ fontSize: 14, fontWeight: 600, color: '#10b981' }}>
                    {results.filter(r => !r.error && r.output).length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
        {activeChart === 'creativity' && ()
          <div>
            <RadialChart 
              data={chartData.creativity} 
              title="Creative Performance Metrics"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default VarianceVisualization;