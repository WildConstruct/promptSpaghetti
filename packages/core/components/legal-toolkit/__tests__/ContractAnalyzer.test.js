import { jsx as _jsx } from "react/jsx-runtime";
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { ContractAnalyzer } from '../ContractAnalyzer';
// Mock data
const mockDocument = {
    id: 'doc-123',
    title: 'Test Contract',
    type: 'contract',
    content: 'This is a comprehensive test contract with various clauses including termination, payment, liability, and confidentiality provisions. The contract establishes terms for services between parties.',
    metadata: {
        jurisdiction: 'US-CA',
        practiceArea: ['contract law', 'commercial law'],
        parties: ['Company A Inc.', 'Service Provider LLC'],
        references: [],
        tags: ['commercial', 'services'],
        confidentialityLevel: 'confidential'
    },
    status: 'draft',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-02'),
    version: '1.0'
};
describe('ContractAnalyzer Component', () => {
    const mockOnClauseIdentified = jest.fn();
    const mockOnAnalysisComplete = jest.fn();
    beforeEach(() => {
        jest.clearAllMocks();
    });
    describe('Initial Rendering', () => {
        it('renders contract analyzer interface', () => {
            render(_jsx(ContractAnalyzer, { document: mockDocument, onClauseIdentified: mockOnClauseIdentified, onAnalysisComplete: mockOnAnalysisComplete }));
            expect(screen.getByText(/Contract Analysis/i)).toBeInTheDocument();
            expect(screen.getByText(/Start Analysis/i)).toBeInTheDocument();
            expect(screen.getByText('Test Contract')).toBeInTheDocument();
        });
        it('displays document information correctly', () => {
            render(_jsx(ContractAnalyzer, { document: mockDocument, onClauseIdentified: mockOnClauseIdentified, onAnalysisComplete: mockOnAnalysisComplete }));
            expect(screen.getByText('Test Contract')).toBeInTheDocument();
            expect(screen.getByText(/contract/i)).toBeInTheDocument();
            expect(screen.getByText('US-CA')).toBeInTheDocument();
            expect(screen.getByText(/Company A Inc./)).toBeInTheDocument();
        });
        it('shows analysis type selection', () => {
            render(_jsx(ContractAnalyzer, { document: mockDocument, onClauseIdentified: mockOnClauseIdentified, onAnalysisComplete: mockOnAnalysisComplete, analysisType: "detailed" }));
            expect(screen.getByDisplayValue('detailed')).toBeInTheDocument();
        });
    });
    describe('Analysis Process', () => {
        it('starts analysis when start button is clicked', async () => {
            const user = userEvent.setup();
            render(_jsx(ContractAnalyzer, { document: mockDocument, onClauseIdentified: mockOnClauseIdentified, onAnalysisComplete: mockOnAnalysisComplete }));
            const startButton = screen.getByText(/Start Analysis/i);
            await user.click(startButton);
            expect(screen.getByText(/Analyzing contract/i)).toBeInTheDocument();
            expect(screen.getByRole('progressbar')).toBeInTheDocument();
        });
        it('shows progress during analysis', async () => {
            const user = userEvent.setup();
            render(_jsx(ContractAnalyzer, { document: mockDocument, onClauseIdentified: mockOnClauseIdentified, onAnalysisComplete: mockOnAnalysisComplete }));
            const startButton = screen.getByText(/Start Analysis/i);
            await user.click(startButton);
            expect(screen.getByText(/Identifying clauses/i)).toBeInTheDocument();
            // Wait for progress to complete
            await waitFor(() => {
                expect(mockOnAnalysisComplete).toHaveBeenCalled();
            }, { timeout: 5000 });
        });
        it('displays identified clauses during analysis', async () => {
            const user = userEvent.setup();
            render(_jsx(ContractAnalyzer, { document: mockDocument, onClauseIdentified: mockOnClauseIdentified, onAnalysisComplete: mockOnAnalysisComplete }));
            const startButton = screen.getByText(/Start Analysis/i);
            await user.click(startButton);
            await waitFor(() => {
                expect(mockOnClauseIdentified).toHaveBeenCalledWith(expect.arrayContaining([
                    expect.objectContaining({
                        type: expect.any(String),
                        title: expect.any(String),
                        category: expect.any(String)
                    })
                ]));
            });
        });
        it('calls onAnalysisComplete when analysis finishes', async () => {
            const user = userEvent.setup();
            render(_jsx(ContractAnalyzer, { document: mockDocument, onClauseIdentified: mockOnClauseIdentified, onAnalysisComplete: mockOnAnalysisComplete }));
            const startButton = screen.getByText(/Start Analysis/i);
            await user.click(startButton);
            await waitFor(() => {
                expect(mockOnAnalysisComplete).toHaveBeenCalledWith(expect.objectContaining({
                    documentId: 'doc-123',
                    clauses: expect.any(Array),
                    riskAssessment: expect.any(Object),
                    recommendations: expect.any(Array),
                    confidence: expect.any(Number)
                }));
            }, { timeout: 5000 });
        });
    });
    describe('Analysis Results Display', () => {
        it('displays analysis results after completion', async () => {
            const user = userEvent.setup();
            render(_jsx(ContractAnalyzer, { document: mockDocument, onClauseIdentified: mockOnClauseIdentified, onAnalysisComplete: mockOnAnalysisComplete }));
            const startButton = screen.getByText(/Start Analysis/i);
            await user.click(startButton);
            await waitFor(() => {
                expect(screen.getByText(/Analysis Results/i)).toBeInTheDocument();
                expect(screen.getByText(/Risk Assessment/i)).toBeInTheDocument();
                expect(screen.getByText(/Identified Clauses/i)).toBeInTheDocument();
            }, { timeout: 5000 });
        });
        it('shows clause details with risk levels', async () => {
            const user = userEvent.setup();
            render(_jsx(ContractAnalyzer, { document: mockDocument, onClauseIdentified: mockOnClauseIdentified, onAnalysisComplete: mockOnAnalysisComplete }));
            const startButton = screen.getByText(/Start Analysis/i);
            await user.click(startButton);
            await waitFor(() => {
                expect(screen.getByText(/Termination Clause/i)).toBeInTheDocument();
                expect(screen.getByText(/Payment Terms/i)).toBeInTheDocument();
                expect(screen.getByText(/MEDIUM/i)).toBeInTheDocument();
                expect(screen.getByText(/LOW/i)).toBeInTheDocument();
            }, { timeout: 5000 });
        });
        it('displays risk assessment summary', async () => {
            const user = userEvent.setup();
            render(_jsx(ContractAnalyzer, { document: mockDocument, onClauseIdentified: mockOnClauseIdentified, onAnalysisComplete: mockOnAnalysisComplete }));
            const startButton = screen.getByText(/Start Analysis/i);
            await user.click(startButton);
            await waitFor(() => {
                expect(screen.getByText(/Overall Risk: MEDIUM/i)).toBeInTheDocument();
                expect(screen.getByText(/Risk Score: 65\/100/i)).toBeInTheDocument();
                expect(screen.getByText(/Confidence: 85%/i)).toBeInTheDocument();
            }, { timeout: 5000 });
        });
        it('shows recommendations', async () => {
            const user = userEvent.setup();
            render(_jsx(ContractAnalyzer, { document: mockDocument, onClauseIdentified: mockOnClauseIdentified, onAnalysisComplete: mockOnAnalysisComplete }));
            const startButton = screen.getByText(/Start Analysis/i);
            await user.click(startButton);
            await waitFor(() => {
                expect(screen.getByText(/Recommendations/i)).toBeInTheDocument();
                expect(screen.getByText(/Review termination clause/i)).toBeInTheDocument();
                expect(screen.getByText(/Consider liability caps/i)).toBeInTheDocument();
            }, { timeout: 5000 });
        });
    });
    describe('Clause Interaction', () => {
        it('allows highlighting clauses in document', async () => {
            const user = userEvent.setup();
            render(_jsx(ContractAnalyzer, { document: mockDocument, onClauseIdentified: mockOnClauseIdentified, onAnalysisComplete: mockOnAnalysisComplete }));
            const startButton = screen.getByText(/Start Analysis/i);
            await user.click(startButton);
            await waitFor(async () => {
                const clauseButton = screen.getByText(/Termination Clause/i);
                await user.click(clauseButton);
                expect(screen.getByText(/highlighted/i)).toBeInTheDocument();
            }, { timeout: 5000 });
        });
        it('shows clause details when clicked', async () => {
            const user = userEvent.setup();
            render(_jsx(ContractAnalyzer, { document: mockDocument, onClauseIdentified: mockOnClauseIdentified, onAnalysisComplete: mockOnAnalysisComplete }));
            const startButton = screen.getByText(/Start Analysis/i);
            await user.click(startButton);
            await waitFor(async () => {
                const clauseButton = screen.getByText(/Termination Clause/i);
                await user.click(clauseButton);
                expect(screen.getByText(/Either party may terminate/i)).toBeInTheDocument();
                expect(screen.getByText(/Risk Level: MEDIUM/i)).toBeInTheDocument();
            }, { timeout: 5000 });
        });
        it('allows filtering clauses by category', async () => {
            const user = userEvent.setup();
            render(_jsx(ContractAnalyzer, { document: mockDocument, onClauseIdentified: mockOnClauseIdentified, onAnalysisComplete: mockOnAnalysisComplete }));
            const startButton = screen.getByText(/Start Analysis/i);
            await user.click(startButton);
            await waitFor(async () => {
                const filterSelect = screen.getByLabelText(/Filter by category/i);
                await user.selectOptions(filterSelect, 'termination');
                expect(screen.getByText(/Termination Clause/i)).toBeInTheDocument();
                expect(screen.queryByText(/Payment Terms/i)).not.toBeInTheDocument();
            }, { timeout: 5000 });
        });
        it('allows filtering clauses by risk level', async () => {
            const user = userEvent.setup();
            render(_jsx(ContractAnalyzer, { document: mockDocument, onClauseIdentified: mockOnClauseIdentified, onAnalysisComplete: mockOnAnalysisComplete }));
            const startButton = screen.getByText(/Start Analysis/i);
            await user.click(startButton);
            await waitFor(async () => {
                const filterSelect = screen.getByLabelText(/Filter by risk/i);
                await user.selectOptions(filterSelect, 'medium');
                expect(screen.getByText(/Termination Clause/i)).toBeInTheDocument();
                expect(screen.queryByText(/Payment Terms/i)).not.toBeInTheDocument();
            }, { timeout: 5000 });
        });
    });
    describe('Analysis Configuration', () => {
        it('handles different analysis types', () => {
            const { rerender } = render(_jsx(ContractAnalyzer, { document: mockDocument, onClauseIdentified: mockOnClauseIdentified, onAnalysisComplete: mockOnAnalysisComplete, analysisType: "basic" }));
            expect(screen.getByDisplayValue('basic')).toBeInTheDocument();
            rerender(_jsx(ContractAnalyzer, { document: mockDocument, onClauseIdentified: mockOnClauseIdentified, onAnalysisComplete: mockOnAnalysisComplete, analysisType: "comprehensive" }));
            expect(screen.getByDisplayValue('comprehensive')).toBeInTheDocument();
        });
        it('changes analysis depth based on type', async () => {
            const user = userEvent.setup();
            render(_jsx(ContractAnalyzer, { document: mockDocument, onClauseIdentified: mockOnClauseIdentified, onAnalysisComplete: mockOnAnalysisComplete, analysisType: "comprehensive" }));
            const startButton = screen.getByText(/Start Analysis/i);
            await user.click(startButton);
            await waitFor(() => {
                expect(screen.getByText(/Comprehensive Analysis/i)).toBeInTheDocument();
            });
        });
    });
    describe('Export Functionality', () => {
        it('allows exporting analysis results', async () => {
            const user = userEvent.setup();
            render(_jsx(ContractAnalyzer, { document: mockDocument, onClauseIdentified: mockOnClauseIdentified, onAnalysisComplete: mockOnAnalysisComplete }));
            const startButton = screen.getByText(/Start Analysis/i);
            await user.click(startButton);
            await waitFor(async () => {
                const exportButton = screen.getByText(/Export Results/i);
                expect(exportButton).toBeInTheDocument();
                await user.click(exportButton);
                expect(screen.getByText(/Export as PDF/i)).toBeInTheDocument();
                expect(screen.getByText(/Export as JSON/i)).toBeInTheDocument();
            }, { timeout: 5000 });
        });
        it('generates analysis report for export', async () => {
            const user = userEvent.setup();
            render(_jsx(ContractAnalyzer, { document: mockDocument, onClauseIdentified: mockOnClauseIdentified, onAnalysisComplete: mockOnAnalysisComplete }));
            const startButton = screen.getByText(/Start Analysis/i);
            await user.click(startButton);
            await waitFor(async () => {
                const exportButton = screen.getByText(/Export Results/i);
                await user.click(exportButton);
                const pdfExport = screen.getByText(/Export as PDF/i);
                await user.click(pdfExport);
                // Would normally check for download trigger
                expect(screen.getByText(/Generating report/i)).toBeInTheDocument();
            }, { timeout: 5000 });
        });
    });
    describe('Error Handling', () => {
        it('handles analysis errors gracefully', async () => {
            const user = userEvent.setup();
            const errorDocument = { ...mockDocument, content: '' };
            render(_jsx(ContractAnalyzer, { document: errorDocument, onClauseIdentified: mockOnClauseIdentified, onAnalysisComplete: mockOnAnalysisComplete }));
            const startButton = screen.getByText(/Start Analysis/i);
            await user.click(startButton);
            await waitFor(() => {
                expect(screen.getByText(/Error analyzing contract/i)).toBeInTheDocument();
                expect(screen.getByText(/Document content is empty/i)).toBeInTheDocument();
            });
        });
        it('handles invalid document gracefully', () => {
            const invalidDocument = { ...mockDocument, type: 'invalid' };
            render(_jsx(ContractAnalyzer, { document: invalidDocument, onClauseIdentified: mockOnClauseIdentified, onAnalysisComplete: mockOnAnalysisComplete }));
            expect(screen.getByText(/Unsupported document type/i)).toBeInTheDocument();
        });
        it('shows retry option on analysis failure', async () => {
            const user = userEvent.setup();
            const errorDocument = { ...mockDocument, content: '' };
            render(_jsx(ContractAnalyzer, { document: errorDocument, onClauseIdentified: mockOnClauseIdentified, onAnalysisComplete: mockOnAnalysisComplete }));
            const startButton = screen.getByText(/Start Analysis/i);
            await user.click(startButton);
            await waitFor(async () => {
                const retryButton = screen.getByText(/Retry Analysis/i);
                expect(retryButton).toBeInTheDocument();
                await user.click(retryButton);
                expect(screen.getByText(/Analyzing contract/i)).toBeInTheDocument();
            });
        });
    });
    describe('Accessibility', () => {
        it('provides proper ARIA labels', () => {
            render(_jsx(ContractAnalyzer, { document: mockDocument, onClauseIdentified: mockOnClauseIdentified, onAnalysisComplete: mockOnAnalysisComplete }));
            expect(screen.getByLabelText(/Analysis type/i)).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /Start Analysis/i })).toBeInTheDocument();
        });
        it('supports keyboard navigation', async () => {
            const user = userEvent.setup();
            render(_jsx(ContractAnalyzer, { document: mockDocument, onClauseIdentified: mockOnClauseIdentified, onAnalysisComplete: mockOnAnalysisComplete }));
            await user.tab();
            expect(screen.getByLabelText(/Analysis type/i)).toHaveFocus();
            await user.tab();
            expect(screen.getByRole('button', { name: /Start Analysis/i })).toHaveFocus();
        });
        it('announces analysis progress to screen readers', async () => {
            const user = userEvent.setup();
            render(_jsx(ContractAnalyzer, { document: mockDocument, onClauseIdentified: mockOnClauseIdentified, onAnalysisComplete: mockOnAnalysisComplete }));
            const startButton = screen.getByText(/Start Analysis/i);
            await user.click(startButton);
            expect(screen.getByRole('status')).toHaveTextContent(/Analyzing contract/i);
        });
    });
    describe('Custom Class Names', () => {
        it('applies custom className correctly', () => {
            const { container } = render(_jsx(ContractAnalyzer, { document: mockDocument, onClauseIdentified: mockOnClauseIdentified, onAnalysisComplete: mockOnAnalysisComplete, className: "custom-analyzer" }));
            const analyzerDiv = container.querySelector('.contract-analyzer');
            expect(analyzerDiv).toHaveClass('contract-analyzer', 'custom-analyzer');
        });
    });
});
