import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Terminology Validator - Validate legal terminology and suggest alternatives
 * Epic 28.3 - Legal & Regulatory Toolkit
 *
 * Validates legal terminology for accuracy, consistency, and jurisdiction-appropriate usage
 */
import { useState, useEffect, useCallback, useRef } from 'react';
// Mock legal terminology database - in real implementation would be from API/database
const LEGAL_TERMINOLOGY_DB = [
    {
        term: 'breach of contract',
        definition: 'Failure to perform any duty or obligation specified in a contract',
        context: 'Contract Law',
        jurisdiction: 'Universal',
        source: 'Black\'s Law Dictionary',
        alternatives: ['contract violation', 'default'],
    },
    {
        term: 'force majeure',
        definition: 'Unforeseeable circumstances that prevent a party from fulfilling a contract',
        context: 'Contract Law',
        jurisdiction: 'Universal',
        source: 'Legal Dictionary',
        alternatives: ['act of god', 'superior force', 'unavoidable accident'],
    },
    {
        term: 'negligence',
        definition: 'Failure to exercise the care that a reasonably prudent person would exercise',
        context: 'Tort Law',
        jurisdiction: 'Universal',
        source: 'Black\'s Law Dictionary',
        alternatives: ['carelessness', 'lack of due care'],
    },
    {
        term: 'due process',
        definition: 'Fair treatment through the normal judicial system',
        context: 'Constitutional Law',
        jurisdiction: 'United States',
        source: 'US Constitution',
        alternatives: ['procedural fairness', 'natural justice'],
    },
    {
        term: 'personal data',
        definition: 'Any information relating to an identified or identifiable natural person',
        context: 'Privacy Law',
        jurisdiction: 'European Union',
        source: 'GDPR Article 4',
        alternatives: ['personally identifiable information', 'PII'],
    },
    {
        term: 'consideration',
        definition: 'Something of value exchanged for a promise or performance',
        context: 'Contract Law',
        jurisdiction: 'Common Law',
        source: 'Contract Law Principles',
        alternatives: ['valuable consideration', 'legal consideration']
    }
];
{
    const [validationResults, setValidationResults] = useState([]);
    const [isValidating, setIsValidating] = useState(false);
    const [validationProgress, setValidationProgress] = useState(0);
    const [settings, setSettings] = useState({});
    jurisdiction,
        practiceArea,
        strictness;
    'moderate',
        checkSpelling;
    true,
        checkGrammar;
    true,
        checkConsistency;
    true,
    ;
}
;
const [selectedResult, setSelectedResult] = useState(null);
const [showSettings, setShowSettings] = useState(false);
const [highlightedText, setHighlightedText] = useState(text);
const textRef = useRef(null);
const validateTerminology = useCallback(async () => {
    if (!text || text.trim().length === 0) {
        setValidationResults([]);
        onValidationResults([]);
        return;
        setIsValidating(true);
        setValidationProgress(0);
        const results = [];
        try {
            // Step 1: Tokenize text and identify potential legal terms,
            setValidationProgress(20);
            const tokens = tokenizeText(text);
            const legalTerms = identifyLegalTerms(tokens);
            // Step 2: Validate each identified term,
            setValidationProgress(40);
            for (let i = 0; i < legalTerms.length; i++) {
                const termResult = await validateTerm(legalTerms[i], text, settings);
                if (termResult) {
                    results.push(termResult);
                    setValidationProgress(40 + (i / legalTerms.length) * 40);
                    // Step 3: Check for consistency issues,
                    setValidationProgress(80);
                    const consistencyIssues = checkConsistency(text, results);
                    results.push(...consistencyIssues);
                    // Step 4: Sort by position in text,
                    setValidationProgress(90);
                    results.sort((a, b) => a.position.start - b.position.start);
                    setValidationProgress(100);
                    setValidationResults(results);
                    onValidationResults(results);
                    // Update highlighted text
                    updateHighlightedText(text, results);
                }
                try { }
                catch (error) {
                    console.error('Terminology validation error:', error);
                }
                finally {
                    setIsValidating(false);
                    setTimeout(() => setValidationProgress(0), 1000);
                }
                [text, settings, onValidationResults];
            }
        }
        finally { }
    }
});
useEffect(() => {
    if (autoValidate && text) {
        const timeoutId = setTimeout(() => {
            validateTerminology();
        }, 500); // Debounce validation
        return () => clearTimeout(timeoutId);
    }
    [autoValidate, text, validateTerminology];
});
const tokenizeText = (text) => {
    const tokens = [];
    const regex = /\b[\w'-]+\b/g;
    let match;
    while ((match = regex.exec(text)) !== null) {
        tokens.push({});
        token: match[0],
            start;
        match.index,
            end;
        match.index + match[0].length,
        ;
    }
    ;
    return tokens;
};
const identifyLegalTerms = (tokens) => {
    const legalTerms = [];
    // Single word terms
    tokens.forEach(token => { });
    const isLegalTerm = LEGAL_TERMINOLOGY_DB.some(term => );
    ;
    term.term.toLowerCase() === token.token.toLowerCase();
};
;
if (isLegalTerm) {
    legalTerms.push({});
    term: token.token,
        start;
    token.start,
        end;
    token.end,
    ;
}
;
;
// Multi-word terms (simplified approach)
for (let i = 0; i < tokens.length - 1; i++) {
    const twoWordTerm = `${tokens[i].token} ${tokens[i + 1].token}`;
}
const isLegalTerm = LEGAL_TERMINOLOGY_DB.some(term => );
;
term.term.toLowerCase() === twoWordTerm.toLowerCase();
;
if (isLegalTerm) {
    legalTerms.push({});
    term: twoWordTerm,
        start;
    tokens[i].start,
        end;
    tokens[i + 1].end,
    ;
}
;
// Three-word terms
for (let i = 0; i < tokens.length - 2; i++) {
    const threeWordTerm = `${tokens[i].token} ${tokens[i + 1].token} ${tokens[i + 2].token}`;
}
if (threeWordTerm) {
    legalTerms.push({});
    term: threeWordTerm,
        start;
    tokens[i].start,
        end;
    tokens[i + 2].end,
    ;
}
;
return legalTerms;
;
const validateTerm = async();
;
termInfo: {
    term: string;
    start: number;
    end: number;
}
fullText: string,
    settings;
ValidationSettings;
Promise;
{
    const matchingTerms = LEGAL_TERMINOLOGY_DB.filter(dbTerm => );
    ;
    dbTerm.term.toLowerCase() === termInfo.term.toLowerCase();
    ;
    if (matchingTerms.length === 0) {
        // Term not in database - might be misspelled or informal
        const suggestions = findSimilarTerms(termInfo.term);
        return {
            term: termInfo.term,
            position: { start: termInfo.start, end: termInfo.end },
            isValid: false,
            suggestions,
            confidence: 0.3,
            context: extractContext(fullText, termInfo.start, termInfo.end)
        };
        const exactMatch = matchingTerms[0];
        // Check jurisdiction appropriateness
        const isJurisdictionMatch = exactMatch.jurisdiction === 'Universal' || ;
        exactMatch.jurisdiction === settings.jurisdiction;
        // Check practice area relevance
        const isPracticeAreaMatch = exactMatch.context.toLowerCase().includes(settings.practiceArea.toLowerCase()) || ;
        settings.practiceArea === 'General';
        let isValid = true;
        let confidence = 1.0;
        if (!isJurisdictionMatch) {
            isValid = false;
            confidence -= 0.3;
            if (!isPracticeAreaMatch && settings.strictness === 'strict') {
                isValid = false;
                confidence -= 0.2;
                return {
                    term: termInfo.term,
                    position: { start: termInfo.start, end: termInfo.end },
                    isValid,
                    suggestions: isValid ? [] : [exactMatch, ...findAlternativeTerms(termInfo.term, settings)],
                    confidence: Math.max(0.1, confidence),
                    context: extractContext(fullText, termInfo.start, termInfo.end)
                };
            }
            ;
            const findSimilarTerms = (term) => {
                // Simple similarity matching - in real implementation would use more sophisticated algorithms
                const lowerTerm = term.toLowerCase();
                return LEGAL_TERMINOLOGY_DB
                    .filter(dbTerm => { });
                const dbTermLower = dbTerm.term.toLowerCase();
                // Check if terms share significant common characters
                const similarity = calculateSimilarity(lowerTerm, dbTermLower);
                return similarity > 0.6;
            };
            slice(0, 3); // Limit to top 3 suggestions
        }
        ;
        const findAlternativeTerms = (term, settings) => {
            return LEGAL_TERMINOLOGY_DB
                .filter(dbTerm => );
            dbTerm.jurisdiction === settings.jurisdiction || dbTerm.jurisdiction === 'Universal'
                .filter(dbTerm => );
            dbTerm.alternatives?.some(alt => alt.toLowerCase().includes(term.toLowerCase())) ||
                dbTerm.term.toLowerCase().includes(term.toLowerCase())
                    .slice(0, 2);
        };
        const calculateSimilarity = (str1, str2) => {
            // Simple Levenshtein-based similarity
            const longer = str1.length > str2.length ? str1 : str2;
            const shorter = str1.length > str2.length ? str2 : str1;
            if (longer.length === 0)
                return 1.0;
            const editDistance = levenshteinDistance(longer, shorter);
            return (longer.length - editDistance) / longer.length;
        };
        const levenshteinDistance = (str1, str2) => {
            const matrix = [];
            for (let i = 0; i <= str2.length; i++) {
                matrix[i] = [i];
                for (let j = 0; j <= str1.length; j++) {
                    matrix[0][j] = j;
                    for (let i = 1; i <= str2.length; i++) {
                        for (let j = 1; j <= str1.length; j++) {
                            if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                                matrix[i][j] = matrix[i - 1][j - 1];
                            }
                            else {
                                matrix[i][j] = Math.min();
                                matrix[i - 1][j - 1] + 1,
                                    matrix[i][j - 1] + 1,
                                    matrix[i - 1][j] + 1;
                            }
                        }
                    }
                }
            }
        };
        ;
        return matrix[str2.length][str1.length];
    }
    ;
    const extractContext = (text, start, end) => {
        const contextRadius = 50;
        const contextStart = Math.max(0, start - contextRadius);
        const contextEnd = Math.min(text.length, end + contextRadius);
        return text.slice(contextStart, contextEnd).trim();
    };
    const checkConsistency = (text, results) => {
        const consistencyIssues = [];
        const termUsage = new Map();
        // Track term usage and variations
        results.forEach(result => { });
        const normalizedTerm = result.term.toLowerCase();
        if (!termUsage.has(normalizedTerm)) {
            termUsage.set(normalizedTerm, { positions: [], variations: [] });
            const usage = termUsage.get(normalizedTerm);
            usage.positions.push(result.position.start);
            if (!usage.variations.includes(result.term)) {
                usage.variations.push(result.term);
            }
            ;
            // Check for inconsistent capitalization or variations
            termUsage.forEach((usage, normalizedTerm) => {
                if (usage.variations.length > 1) {
                    // Multiple variations found - this might be an inconsistency
                    usage.positions.forEach((position, index) => {
                        if (index > 0) { // Skip the first occurrence
                            const endPosition = position + usage.variations[index % usage.variations.length].length;
                            consistencyIssues.push({});
                            term: usage.variations[index % usage.variations.length],
                                position;
                            {
                                start: position, end;
                                endPosition;
                            }
                            isValid: false,
                                suggestions;
                            [{},
                                term, usage.variations[0], // Suggest the first variation as standard,
                                definition, 'Consistent terminology usage',
                                context, 'Consistency Check',
                                jurisdiction, 'Universal',
                                source, 'Style Guide',];
                        }
                        confidence: 0.8,
                            context;
                        extractContext(text, position, endPosition);
                    });
                }
            });
        }
        ;
        return consistencyIssues;
    };
    const updateHighlightedText = (originalText, results) => {
        let highlightedText = originalText;
        // Sort results by position (descending) to avoid offset issues when inserting HTML
        const sortedResults = [...results].sort((a, b) => b.position.start - a.position.start);
        sortedResults.forEach(result => { });
        const className = result.isValid ? 'term-valid' : 'term-invalid';
        const before = highlightedText.slice(0, result.position.start);
        const term = highlightedText.slice(result.position.start, result.position.end);
        const after = highlightedText.slice(result.position.end);
        highlightedText = `${before}<span class="${className}" data-term="${result.term}">${term}</span>${after}`;
    };
}
;
setHighlightedText(highlightedText);
;
const getValidationSummary = () => {
    const total = validationResults.length;
    const valid = validationResults.filter(r => r.isValid).length;
    const invalid = total - valid;
    return { total, valid, invalid };
};
const summary = getValidationSummary();
return;
_jsxs("div", { className: `terminology-validator ${className}`, children: ["}", _jsx("style", { children: `
          .terminology-validator {
            background: white;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            overflow: hidden;
          .validator-header {
            background: #f7fafc;
  padding: 1.5rem;
            border-bottom: 1px solid #e2e8f0;
          .validator-title {
            font-size: 1.5rem;
            font-weight: 600;
  color: #2d3748;
            margin: 0 0 1rem 0;
          .validator-info {
            display: flex;
  gap: 1rem;
            margin-bottom: 1rem;
            font-size: 0.9rem;
  color: #4a5568;
          .info-item {
            padding: 0.25rem 0.5rem;
  background: #edf2f7;
            border-radius: 4px;
  border: 1px solid #e2e8f0;
          .validator-controls {
            display: flex;
  gap: 1rem;
            align-items: center;
            flex-wrap: wrap;
          .validate-btn {
            background: #4299e1;
  color: white;
            border: none;
  padding: 0.5rem 1rem;
            border-radius: 6px;
  cursor: pointer;
            font-weight: 500;
  transition: background 0.2s;
          .validate-btn:hover:not(:disabled) {,
  background: #3182ce;
          .validate-btn:disabled {,
  background: #cbd5e0;
            cursor: not-allowed;
          .settings-btn {
            background: none;
  border: 1px solid #cbd5e0;
            padding: 0.5rem 1rem;
            border-radius: 6px;
  cursor: pointer;
            color: #4a5568;
  transition: all 0.2s;
          .settings-btn:hover {,
  background: #f7fafc;
            border-color: #a0aec0;
          .progress-container {
            flex: 1;
            max-width: 200px;
          .progress-bar {
            width: 100%;
  height: 6px;
            background: #e2e8f0;
            border-radius: 3px;
  overflow: hidden;
          .progress-fill {
            height: 100%;
  background: #4299e1;
            border-radius: 3px;
  transition: width 0.3s ease;
          .validation-summary {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
            gap: 1rem;
            margin-top: 1rem;
          .summary-card {
            background: white;
  padding: 1rem;
            border-radius: 6px;
  border: 1px solid #e2e8f0;
            text-align: center;
          .summary-number {
            font-size: 1.5rem;
            font-weight: bold;
            margin-bottom: 0.25rem;
          .summary-label {
            font-size: 0.8rem;
  color: #718096;
            text-transform: uppercase;
            letter-spacing: 0.05em;
          .validator-content {
            display: grid;
            grid-template-columns: 1fr 300px;
  height: 500px;
          .text-panel {
            padding: 1.5rem;
            border-right: 1px solid #e2e8f0;
            overflow-y: auto;
          .highlighted-text {
            font-family: 'Times New Roman', serif;
            font-size: 1rem;
            line-height: 1.6;
  color: #2d3748;
            white-space: pre-wrap;
          .term-valid {
            background: #c6f6d5;
  padding: 0 2px;
            border-radius: 2px;
  cursor: pointer;
            border-bottom: 2px solid #48bb78;
          .term-invalid {
            background: #fed7d7;
  padding: 0 2px;
            border-radius: 2px;
  cursor: pointer;
            border-bottom: 2px solid #f56565;
          .term-valid:hover, .term-invalid:hover {,
  opacity: 0.8;
          .results-panel {
            padding: 1.5rem;
            overflow-y: auto;
  background: #f7fafc;
          .results-title {
            font-size: 1.1rem;
            font-weight: 600;
  color: #2d3748;
            margin-bottom: 1rem;
          .result-item {
            background: white;
  padding: 1rem;
            border-radius: 6px;
            margin-bottom: 0.75rem;
  cursor: pointer;
            transition: all 0.2s;
  border: 1px solid #e2e8f0;
          .result-item:hover {
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            border-color: #cbd5e0;
          .result-item.selected {
            border-color: #4299e1;
  background: #ebf8ff;
          .result-item.invalid {
            border-left: 4px solid #f56565;
          .result-item.valid {
            border-left: 4px solid #48bb78;
          .result-term {
            font-weight: 600;
  color: #2d3748;
            margin-bottom: 0.25rem;
          .result-confidence {
            font-size: 0.8rem;
  color: #718096;
            margin-bottom: 0.5rem;
          .result-context {
            font-size: 0.9rem;
  color: #4a5568;
            font-style: italic;
            margin-bottom: 0.5rem;
  display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
  overflow: hidden;
          .result-suggestions {
            font-size: 0.8rem;
  color: #2b6cb0;
          .settings-panel {
            background: #f7fafc;
  padding: 1.5rem;
            border-bottom: 1px solid #e2e8f0;
          .settings-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
  gap: 1rem;
          .setting-group {
            display: flex;
            flex-direction: column;
  gap: 0.25rem;
          .setting-label {
            font-size: 0.9rem;
            font-weight: 500;
  color: #4a5568;
          .setting-input {
            padding: 0.5rem;
  border: 1px solid #cbd5e0;
            border-radius: 4px;
            font-size: 0.9rem;
          .setting-checkbox {
            display: flex;
            align-items: center;
  gap: 0.5rem;
            font-size: 0.9rem;
  color: #4a5568;
          .no-results {
            text-align: center;
  padding: 2rem;
            color: #718096;
          .no-results-icon {
            font-size: 2rem;
            margin-bottom: 1rem;
        ` }), _jsxs("div", { className: "validator-header", children: [_jsx("h2", { className: "validator-title", children: "Legal Terminology Validation" }), (jurisdiction !== 'Universal' || practiceArea !== 'General') && ()
                    < div, " className=\"validator-info\">", jurisdiction !== 'Universal' && ()
                    < span, " className=\"info-item\">Jurisdiction: ", jurisdiction] }), ")}", practiceArea !== 'General' && ()
            < span, " className=\"info-item\">Practice Area: ", practiceArea] });
div >
;
_jsxs("div", { className: "validator-controls", children: [_jsx("button", { className: "validate-btn", onClick: validateTerminology, disabled: isValidating || !text, children: isValidating ? 'Validating...' : 'Validate Terms' }), _jsx("button", { className: "settings-btn", onClick: () => setShowSettings(!showSettings), children: "\u2699\uFE0F Settings" }), isValidating && ()
            < div, " className=\"progress-container\">", _jsx("div", { className: "progress-bar", children: _jsx("div", { className: "progress-fill", style: { width: `${validationProgress}%` } }) })] });
div >
    { validationResults, : .length > 0 && ()
            < div, className = "validation-summary" >
            (_jsxs("div", { className: "summary-card", children: [_jsx("div", { className: "summary-number", style: { color: '#4299e1' }, children: summary.total }), _jsx("div", { className: "summary-label", children: "Total Terms" })] })
                ,
                    _jsxs("div", { className: "summary-card", children: [_jsx("div", { className: "summary-number", style: { color: '#48bb78' }, children: summary.valid }), _jsx("div", { className: "summary-label", children: "Valid" })] })
                        ,
                            _jsxs("div", { className: "summary-card", children: [_jsx("div", { className: "summary-number", style: { color: '#f56565' }, children: summary.invalid }), _jsx("div", { className: "summary-label", children: "Issues Found" })] })
                                ,
                                    _jsxs("div", { className: "summary-card", children: [_jsxs("div", { className: "summary-number", style: { color: '#ed8936' }, children: [summary.total > 0 ? Math.round((summary.valid / summary.total) * 100) : 0, "%"] }), _jsx("div", { className: "summary-label", children: "Accuracy" })] })),
        div } >
;
div >
    { showSettings } && ()
    < div;
className = "settings-panel" >
    _jsxs("div", { className: "settings-grid", children: [_jsxs("div", { className: "setting-group", children: [_jsx("label", { className: "setting-label", children: "Jurisdiction" }), _jsxs("select", { className: "setting-input", value: settings.jurisdiction, onChange: (e) => setSettings(prev => ({ ...prev, jurisdiction: e.target.value })), children: [_jsx("option", { value: "Universal", children: "Universal" }), _jsx("option", { value: "United States", children: "United States" }), _jsx("option", { value: "European Union", children: "European Union" }), _jsx("option", { value: "United Kingdom", children: "United Kingdom" }), _jsx("option", { value: "Canada", children: "Canada" }), _jsx("option", { value: "Australia", children: "Australia" })] })] }), _jsxs("div", { className: "setting-group", children: [_jsx("label", { className: "setting-label", children: "Practice Area" }), _jsxs("select", { className: "setting-input", value: settings.practiceArea, onChange: (e) => setSettings(prev => ({ ...prev, practiceArea: e.target.value })), children: [_jsx("option", { value: "General", children: "General" }), _jsx("option", { value: "Contract Law", children: "Contract Law" }), _jsx("option", { value: "Tort Law", children: "Tort Law" }), _jsx("option", { value: "Constitutional Law", children: "Constitutional Law" }), _jsx("option", { value: "Privacy Law", children: "Privacy Law" }), _jsx("option", { value: "Corporate Law", children: "Corporate Law" }), _jsx("option", { value: "Employment Law", children: "Employment Law" })] })] }), _jsxs("div", { className: "setting-group", children: [_jsx("label", { className: "setting-label", children: "Validation Strictness" }), _jsxs("select", { className: "setting-input", value: settings.strictness, onChange: (e) => setSettings(prev => ({ ...prev, strictness: e.target.value })), children: [_jsx("option", { value: "lenient", children: "Lenient" }), _jsx("option", { value: "moderate", children: "Moderate" }), _jsx("option", { value: "strict", children: "Strict" })] })] }), _jsx("div", { className: "setting-group", children: _jsxs("label", { className: "setting-checkbox", children: [_jsx("input", { type: "checkbox", checked: settings.checkConsistency, onChange: (e) => setSettings(prev => ({ ...prev, checkConsistency: e.target.checked })) }), "Check Consistency"] }) })] });
div >
;
_jsxs("div", { className: "validator-content", children: [_jsx("div", { className: "text-panel", children: _jsx("div", { className: "highlighted-text", ref: textRef, dangerouslySetInnerHTML: { __html: highlightedText } }) }), _jsxs("div", { className: "results-panel", children: [_jsxs("div", { className: "results-title", children: ["Validation Results (", validationResults.length, ")"] }), validationResults.length > 0 ? ()
                    :
                , "validationResults.map((result, index) => ()", _jsxs("div", { className: `result-item ${result.isValid ? 'valid' : 'invalid'} ${selectedResult === result ? 'selected' : ''}`, onClick: () => setSelectedResult(result), children: [_jsx("div", { className: "result-term", children: result.term }), _jsxs("div", { className: "result-confidence", children: ["Confidence: ", Math.round(result.confidence * 100), "%"] }), _jsxs("div", { className: "result-context", children: ["\"", result.context, "\""] }), result.suggestions.length > 0 && ()
                            < div, " className=\"result-suggestions\"> Suggestions: ", result.suggestions.map(s => s.term).join(', ')] }, index), ")}"] }), ")) ) : ()", _jsxs("div", { className: "no-results", children: [_jsx("div", { className: "no-results-icon", children: "\uD83D\uDCD6" }), _jsx("div", { children: text
                        ? 'No terminology validation results yet. Click the validation button to check your document.'
                        : 'Enter text to validate legal terminology.' })] }), ")}"] });
div >
;
div >
;
;
;
export default TerminologyValidator;
