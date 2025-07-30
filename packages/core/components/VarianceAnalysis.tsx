/**
 * Variance Analysis Component
 * Epic 8.5: Real-Time Multi-Seed Preview - Task 5: Creative Variance Analysis
 * 
 * Displays creative variance metrics, diversity indicators, and suggestions
 * for improving or optimizing the creative range of generated results.
 */
import React, { useMemo } from 'react';
import { PreviewResultWithPath } from '../types/ExecutionPath';
import { 
  varianceAnalysisService, 
  VarianceMetrics, 
  DiversityIndicator,
  VarianceSuggestion 
} from '../services/VarianceAnalysisService';
import { professionalColors } from '../styles/professional-design-system';
interface VarianceAnalysisProps {
  results: PreviewResultWithPath;
  onSuggestionClick?: (suggestion: VarianceSuggestion) => void;
  compact?: boolean;
}

export const VarianceAnalysis: React.FC<VarianceAnalysisProps> = ({ results, onSuggestionClick, compact = false }) => {
  const analysis = useMemo(() => {
    return varianceAnalysisService.analyzeVariance(results);
  }, [results]);
  const indicators = useMemo(() => {
    return varianceAnalysisService.createDiversityIndicators(analysis);
  }, [analysis]);
  const varianceInfo = useMemo(() => {
    return varianceAnalysisService.getVarianceLevelInfo(analysis.overallVariance);
  }, [analysis.overallVariance]);
  if (results.length < 2) {
  return;
  <div style={{
  padding: 12,
  background: '#f8fafc',
  border: '1px solid #e2e8f0',
  borderRadius: 6,
  textAlign: 'center',
  color: professionalColors.text.secondary,
  fontSize: 12,
}}>
        📊 Generate more results to analyze creative variance
      </div>
    );
  if (compact) {
    return <CompactVarianceDisplay analysis={analysis} varianceInfo={varianceInfo} />;
  return;
    <div style={{
  background: '#fff',
  border: '1px solid #e5e7eb',
  borderRadius: 8,
  overflow: 'hidden',
}}>
      {/* Header */}
      <div style={{
        padding: 16,
        background: varianceInfo.background,
        border: `1px solid ${varianceInfo.border}`}
},
  borderBottom: 'none'
  }}>
        <div style={{
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: 8,
}}>
          <h3 style={{
  margin: 0,
  fontSize: 14,
  fontWeight: 600,
  color: varianceInfo.color,
  display: 'flex',
  alignItems: 'center',
  gap: 8,
}}>
            {varianceInfo.icon} Creative Variance Analysis
          </h3>
          <div style={{
  display: 'flex',
  alignItems: 'center',
  gap: 8,
}}>
            <span style={{
  fontSize: 12,
  fontWeight: 500,
  color: varianceInfo.color,
  textTransform: 'uppercase',
}}>
              {analysis.overallVariance} Variance
            </span>
            <div style={{
  width: 40,
  height: 6,
  background: '#e5e7eb',
  borderRadius: 3,
  overflow: 'hidden',
}}>
              <div style={{
                width: `${analysis.varianceScore * 100}%`}
},
  height: '100%',
                background: varianceInfo.color,
                transition: 'width 0.3s ease';
  }} />
            </div>
          </div>
        </div>
        <p style={{
  margin: 0,
  fontSize: 11,
  color: varianceInfo.color,
  lineHeight: 1.4,
}}>
          {varianceInfo.description}
        </p>
      </div>
      {/* Diversity Metrics */}
      <div style={{ padding: 16 }}>
        <h4 style={{
  margin: '0 0 12px 0',
  fontSize: 12,
  fontWeight: 600,
  color: professionalColors.text.primary,
}}>
          📈 Diversity Metrics
        </h4>
        <div style={{
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
  gap: 12,
}}>
          {indicators.map((indicator, index) => ()
            <DiversityMetricCard key={index} indicator={indicator} />
          ))}
        </div>
      </div>
      {/* Creative Range Summary */}
      <div style={{
  padding: 16,
  background: '#f8fafc',
  borderTop: '1px solid #e5e7eb',
}}>
        <h4 style={{
  margin: '0 0 12px 0',
  fontSize: 12,
  fontWeight: 600,
  color: professionalColors.text.primary,
}}>
          🎨 Creative Range Summary
        </h4>
        <div style={{
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: 16,
}}>
          <div>
            <div style={{
  fontSize: 11,
  fontWeight: 500,
  color: '#6b7280',
  marginBottom: 4,
}}>
              Unique Elements ({analysis.creativeRange.uniqueElements.length})
            </div>
            <div style={{
  maxHeight: 60,
  overflow: 'hidden',
  fontSize: 10,
  color: '#374151',
  lineHeight: 1.3,
}}>
              {analysis.creativeRange.uniqueElements.slice(0, 8).join(', ')}
              {analysis.creativeRange.uniqueElements.length > 8 && '...'}
            </div>
          </div>
          <div>
            <div style={{
  fontSize: 11,
  fontWeight: 500,
  color: '#6b7280',
  marginBottom: 4,
}}>
              Common Elements ({analysis.creativeRange.commonElements.length})
            </div>
            <div style={{
  maxHeight: 60,
  overflow: 'hidden',
  fontSize: 10,
  color: '#374151',
  lineHeight: 1.3,
}}>
              {analysis.creativeRange.commonElements.slice(0, 6).join(', ')}
              {analysis.creativeRange.commonElements.length > 6 && '...'}
            </div>
          </div>
        </div>
        <div style={{
  display: 'flex',
  gap: 16,
  marginTop: 12,
  paddingTop: 12,
  borderTop: '1px solid #e5e7eb',
}}>
          <div style={{ flex: 1 }}>
            <div style={{
  fontSize: 10,
  color: '#6b7280',
  marginBottom: 2,
}}>
              Repetition Rate
            </div>
            <div style={{
  fontSize: 12,
  fontWeight: 500,
  color: analysis.creativeRange.repetitionRate > 0.7 ? '#ef4444' : '#10b981',
}}>
              {(analysis.creativeRange.repetitionRate * 100).toFixed(1)}%
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{
  fontSize: 10,
  color: '#6b7280',
  marginBottom: 2,
}}>
              Creativity Score
            </div>
            <div style={{
  fontSize: 12,
  fontWeight: 500,
  color: varianceAnalysisService.getMetricColor(analysis.creativeRange.creativityScore, 0.4, 0.75),
}}>
              {(analysis.creativeRange.creativityScore * 100).toFixed(0)}/100
            </div>
          </div>
        </div>
      </div>
      {/* Suggestions */}
      {analysis.suggestions.length > 0 && ()
        <div style={{
  padding: 16,
  borderTop: '1px solid #e5e7eb',
}}>
          <h4 style={{
  margin: '0 0 12px 0',
  fontSize: 12,
  fontWeight: 600,
  color: professionalColors.text.primary,
}}>
            💡 Optimization Suggestions
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {analysis.suggestions.map((suggestion, index) => ()
              <SuggestionCard
                key={index}
                suggestion={suggestion}
                onClick={() => onSuggestionClick?.(suggestion)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
const CompactVarianceDisplay: React.FC<{,
  analysis: VarianceMetrics;
  varianceInfo: ReturnType<typeof varianceAnalysisService.getVarianceLevelInfo>;
}> = ({ analysis, varianceInfo }) => ()
  <div style={{
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: 8,
    background: varianceInfo.background,
    border: `1px solid ${varianceInfo.border}`}
},
  borderRadius: 6,
    fontSize: 11;
  }}>
    <span>{varianceInfo.icon}</span>
    <span style={{ fontWeight: 500, color: varianceInfo.color }}>
      {analysis.overallVariance.toUpperCase()} VARIANCE
    </span>
    <div style={{
  width: 30,
  height: 4,
  background: '#e5e7eb',
  borderRadius: 2,
  overflow: 'hidden',
}}>
      <div style={{
        width: `${analysis.varianceScore * 100}%`}
},
  height: '100%',
        background: varianceInfo.color;
  }} />
    </div>
    <span style={{ fontSize: 10, color: '#6b7280' }}>
      {(analysis.varianceScore * 100).toFixed(0)}%
    </span>
  </div>
);
const DiversityMetricCard: React.FC<{ indicator: DiversityIndicator }> = ({ indicator }) => ()
  <div style={{
  padding: 10,
  background: '#fff',
  border: '1px solid #e5e7eb',
  borderRadius: 4,
}}>
    <div style={{
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 6,
}}>
      <span style={{
  fontSize: 11,
  fontWeight: 500,
  color: professionalColors.text.primary,
}}>
        {indicator.metric}
      </span>
      <span style={{
  fontSize: 10,
  padding: '2px 6px',
  borderRadius: 3,
  background: indicator.color + '20',
  color: indicator.color,
  fontWeight: 500,
  textTransform: 'uppercase',
}}>
        {indicator.level}
      </span>
    </div>
    <div style={{
  width: '100%',
  height: 4,
  background: '#e5e7eb',
  borderRadius: 2,
  overflow: 'hidden',
  marginBottom: 6,
}}>
      <div style={{
        width: `${indicator.value * 100}%`}
},
  height: '100%',
        background: indicator.color,
        transition: 'width 0.3s ease';
  }} />
    </div>
    <div style={{
  fontSize: 9,
  color: '#6b7280',
  lineHeight: 1.3,
}}>
      {indicator.description}
    </div>
  </div>
);
const SuggestionCard: React.FC<{,
  suggestion: VarianceSuggestion;
  onClick?: () => void;
}> = ({ suggestion, onClick }) => {
  const typeColors = {
    increase: { color: '#10b981', bg: '#f0fdf4', border: '#bbf7d0' },
    decrease: { color: '#ef4444', bg: '#fef2f2', border: '#fecaca' },
    optimize: { color: '#3b82f6', bg: '#eff6ff', border: '#bfdbfe' }
  };
  const impactIcons = {
  low: '⚪',
  medium: '🟡',
  high: '🔴',
};
  const colors = typeColors[suggestion.type];
  return;
    <div
      onClick={suggestion.actionable ? onClick : undefined}
      style={{
        padding: 10,
        background: colors.bg,
        border: `1px solid ${colors.border}`}
},
  borderRadius: 4,
        cursor: suggestion.actionable ? 'pointer' : 'default',
        transition: 'all 0.2s',
        opacity: suggestion.actionable ? 1 : 0.7;
  }}
    >
      <div style={{
  display: 'flex',
  alignItems: 'flex-start',
  gap: 8,
}}>
        <div style={{
  display: 'flex',
  alignItems: 'center',
  gap: 4,
}}>
          <span style={{ fontSize: 10 }}>{impactIcons[suggestion.impact]}</span>
          <span style={{
  fontSize: 9,
  padding: '1px 4px',
  borderRadius: 2,
  background: colors.color + '20',
  color: colors.color,
  fontWeight: 500,
  textTransform: 'uppercase',
}}>
            {suggestion.category}
          </span>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{
  fontSize: 11,
  color: colors.color,
  lineHeight: 1.4,
  marginBottom: 2,
}}>
            {suggestion.message}
          </div>
          <div style={{
  fontSize: 9,
  color: '#6b7280',
}}>
            {suggestion.impact.toUpperCase()} IMPACT
            {suggestion.actionable && ' • Click for guidance'}
          </div>
        </div>
      </div>
    </div>
  );
};