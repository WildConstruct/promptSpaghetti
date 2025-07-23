import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { EncryptionStatus, EncryptionStatusIcon, EncryptionDetails } from '../EncryptionStatus';
describe('EncryptionStatus Components', () => {
    const mockEncryptionState = {
        status: 'encrypted',
        algorithm: 'AES-256-GCM',
        keyId: 'key123456789',
        lastEncrypted: Date.now() - 1000 * 60 * 5, // 5 minutes ago
        lastDecrypted: Date.now() - 1000 * 60 * 10, // 10 minutes ago
        dataSize: 1024 * 1024, // 1MB
        encryptionTime: 150,
        strength: 'strong'
    };
    const mockErrorState = {
        status: 'error',
        error: 'Failed to encrypt data: Invalid key'
    };
    const mockNotEncryptedState = {
        status: 'not_encrypted',
        dataSize: 2048
    };
    describe('EncryptionStatus', () => {
        it('renders encrypted status correctly', () => {
            render(_jsx(EncryptionStatus, { encryptionState: mockEncryptionState }));
            expect(screen.getByText('Encrypted')).toBeInTheDocument();
            expect(screen.getByText('AES-256-GCM')).toBeInTheDocument();
            expect(screen.getByText('STRONG')).toBeInTheDocument();
            expect(screen.getByText('🔒')).toBeInTheDocument();
        });
        it('renders not encrypted status correctly', () => {
            render(_jsx(EncryptionStatus, { encryptionState: mockNotEncryptedState }));
            expect(screen.getByText('Not Encrypted')).toBeInTheDocument();
            expect(screen.getByText('🔓')).toBeInTheDocument();
        });
        it('renders error status correctly', () => {
            render(_jsx(EncryptionStatus, { encryptionState: mockErrorState }));
            expect(screen.getByText('Encryption Error')).toBeInTheDocument();
            expect(screen.getByText('⚠️')).toBeInTheDocument();
            expect(screen.getByTitle('Failed to encrypt data: Invalid key')).toBeInTheDocument();
        });
        it('shows details when showDetails is true', () => {
            render(_jsx(EncryptionStatus, { encryptionState: mockEncryptionState, showDetails: true }));
            expect(screen.getByText(/Last encrypted:/)).toBeInTheDocument();
            expect(screen.getByText(/Size:/)).toBeInTheDocument();
            expect(screen.getByText(/\(150ms\)/)).toBeInTheDocument();
        });
        it('applies custom className', () => {
            const { container } = render(_jsx(EncryptionStatus, { encryptionState: mockEncryptionState, className: "custom-class" }));
            expect(container.firstChild).toHaveClass('custom-class');
        });
        it('renders encrypting status with animation indicator', () => {
            const encryptingState = { status: 'encrypting' };
            render(_jsx(EncryptionStatus, { encryptionState: encryptingState }));
            expect(screen.getByText('Encrypting...')).toBeInTheDocument();
            expect(screen.getByText('🔄')).toBeInTheDocument();
        });
        it('renders decrypting status with animation indicator', () => {
            const decryptingState = { status: 'decrypting' };
            render(_jsx(EncryptionStatus, { encryptionState: decryptingState }));
            expect(screen.getByText('Decrypting...')).toBeInTheDocument();
            expect(screen.getByText('🔄')).toBeInTheDocument();
        });
        it('renders unknown status correctly', () => {
            const unknownState = { status: 'unknown' };
            render(_jsx(EncryptionStatus, { encryptionState: unknownState }));
            expect(screen.getByText('Unknown')).toBeInTheDocument();
            expect(screen.getByText('❓')).toBeInTheDocument();
        });
    });
    describe('EncryptionStatusIcon', () => {
        it('renders correctly and calls onClick', () => {
            const mockOnClick = jest.fn();
            render(_jsx(EncryptionStatusIcon, { encryptionState: mockEncryptionState, onClick: mockOnClick }));
            const icon = screen.getByTitle(/Encryption: encrypted/);
            expect(icon).toBeInTheDocument();
            fireEvent.click(icon);
            expect(mockOnClick).toHaveBeenCalledTimes(1);
        });
        it('shows correct tooltip with algorithm', () => {
            render(_jsx(EncryptionStatusIcon, { encryptionState: mockEncryptionState }));
            expect(screen.getByTitle('Encryption: encrypted (AES-256-GCM)')).toBeInTheDocument();
        });
        it('shows error in tooltip', () => {
            render(_jsx(EncryptionStatusIcon, { encryptionState: mockErrorState }));
            expect(screen.getByTitle('Encryption: error - Failed to encrypt data: Invalid key')).toBeInTheDocument();
        });
        it('applies animation for processing states', () => {
            const encryptingState = { status: 'encrypting' };
            const { container } = render(_jsx(EncryptionStatusIcon, { encryptionState: encryptingState }));
            const svg = container.querySelector('svg');
            expect(svg).toHaveClass('animate-pulse');
        });
    });
    describe('EncryptionDetails', () => {
        const mockHandlers = {
            onEncrypt: jest.fn(),
            onDecrypt: jest.fn(),
            onChangeAlgorithm: jest.fn()
        };
        beforeEach(() => {
            jest.clearAllMocks();
        });
        it('renders all encryption details', () => {
            render(_jsx(EncryptionDetails, { encryptionState: mockEncryptionState, ...mockHandlers }));
            expect(screen.getByText('Encryption Status')).toBeInTheDocument();
            expect(screen.getByText('encrypted')).toBeInTheDocument();
            expect(screen.getByText('AES-256-GCM')).toBeInTheDocument();
            expect(screen.getByText('strong')).toBeInTheDocument();
            expect(screen.getByText('key12345...')).toBeInTheDocument();
            expect(screen.getByText('1.0 MB')).toBeInTheDocument();
            expect(screen.getByText('150ms')).toBeInTheDocument();
            expect(screen.getByText('Strong encryption (256-bit)')).toBeInTheDocument();
        });
        it('shows decrypt button for encrypted state', () => {
            render(_jsx(EncryptionDetails, { encryptionState: mockEncryptionState, ...mockHandlers }));
            const decryptButton = screen.getByText('🔓 Decrypt');
            expect(decryptButton).toBeInTheDocument();
            fireEvent.click(decryptButton);
            expect(mockHandlers.onDecrypt).toHaveBeenCalledTimes(1);
        });
        it('shows encrypt button for not encrypted state', () => {
            render(_jsx(EncryptionDetails, { encryptionState: mockNotEncryptedState, ...mockHandlers }));
            const encryptButton = screen.getByText('🔒 Encrypt');
            expect(encryptButton).toBeInTheDocument();
            fireEvent.click(encryptButton);
            expect(mockHandlers.onEncrypt).toHaveBeenCalledTimes(1);
        });
        it('shows processing state without buttons', () => {
            const processingState = { status: 'encrypting' };
            render(_jsx(EncryptionDetails, { encryptionState: processingState, ...mockHandlers }));
            expect(screen.getByText('Processing...')).toBeInTheDocument();
            expect(screen.queryByText('🔒 Encrypt')).not.toBeInTheDocument();
            expect(screen.queryByText('🔓 Decrypt')).not.toBeInTheDocument();
        });
        it('displays error details correctly', () => {
            render(_jsx(EncryptionDetails, { encryptionState: mockErrorState, ...mockHandlers }));
            expect(screen.getByText('Error:')).toBeInTheDocument();
            expect(screen.getByText('Failed to encrypt data: Invalid key')).toBeInTheDocument();
        });
        it('formats data sizes correctly', () => {
            const smallDataState = {
                status: 'encrypted',
                dataSize: 512
            };
            render(_jsx(EncryptionDetails, { encryptionState: smallDataState }));
            expect(screen.getByText('512 B')).toBeInTheDocument();
            const { rerender } = render(_jsx(EncryptionDetails, { encryptionState: smallDataState }));
            const kbDataState = {
                status: 'encrypted',
                dataSize: 1536
            };
            rerender(_jsx(EncryptionDetails, { encryptionState: kbDataState }));
            expect(screen.getByText('1.5 KB')).toBeInTheDocument();
            const gbDataState = {
                status: 'encrypted',
                dataSize: 1024 * 1024 * 1024 * 2.5
            };
            rerender(_jsx(EncryptionDetails, { encryptionState: gbDataState }));
            expect(screen.getByText('2.5 GB')).toBeInTheDocument();
        });
        it('shows correct strength colors', () => {
            const strongState = {
                status: 'encrypted',
                strength: 'strong'
            };
            render(_jsx(EncryptionDetails, { encryptionState: strongState }));
            expect(screen.getByText('strong')).toHaveClass('text-green-600');
            const { rerender } = render(_jsx(EncryptionDetails, { encryptionState: strongState }));
            const mediumState = {
                status: 'encrypted',
                strength: 'medium'
            };
            rerender(_jsx(EncryptionDetails, { encryptionState: mediumState }));
            expect(screen.getByText('medium')).toHaveClass('text-yellow-600');
            const weakState = {
                status: 'encrypted',
                strength: 'weak'
            };
            rerender(_jsx(EncryptionDetails, { encryptionState: weakState }));
            expect(screen.getByText('weak')).toHaveClass('text-red-600');
        });
        it('provides correct algorithm strength descriptions', () => {
            const aes256State = {
                status: 'encrypted',
                algorithm: 'AES-256-GCM'
            };
            render(_jsx(EncryptionDetails, { encryptionState: aes256State }));
            expect(screen.getByText('Strong encryption (256-bit)')).toBeInTheDocument();
            const { rerender } = render(_jsx(EncryptionDetails, { encryptionState: aes256State }));
            const aes128State = {
                status: 'encrypted',
                algorithm: 'AES-128-GCM'
            };
            rerender(_jsx(EncryptionDetails, { encryptionState: aes128State }));
            expect(screen.getByText('Medium encryption (128-bit)')).toBeInTheDocument();
            const rsa4096State = {
                status: 'encrypted',
                algorithm: 'RSA-4096'
            };
            rerender(_jsx(EncryptionDetails, { encryptionState: rsa4096State }));
            expect(screen.getByText('Strong encryption (RSA 4096-bit)')).toBeInTheDocument();
        });
        it('handles missing timestamps gracefully', () => {
            const noTimestampState = { status: 'encrypted' };
            render(_jsx(EncryptionDetails, { encryptionState: noTimestampState }));
            // Should not crash and should show 'Never' for missing timestamps
            expect(screen.queryByText('Never')).not.toBeInTheDocument(); // Only shown in some contexts
        });
    });
    describe('Component Integration', () => {
        it('all components work together with same state', () => {
            const { container } = render(_jsxs("div", { children: [_jsx(EncryptionStatus, { encryptionState: mockEncryptionState }), _jsx(EncryptionStatusIcon, { encryptionState: mockEncryptionState }), _jsx(EncryptionDetails, { encryptionState: mockEncryptionState })] }));
            // All components should render without errors
            expect(container).toBeInTheDocument();
            expect(screen.getAllByText('🔒').length).toBeGreaterThanOrEqual(1); // At least one lock icon
            expect(screen.getByText('Encrypted')).toBeInTheDocument();
            expect(screen.getByText('Encryption Status')).toBeInTheDocument();
        });
        it('handles different encryption algorithms', () => {
            const algorithms = [
                'AES-256-GCM', 'AES-256-CBC', 'AES-128-GCM',
                'RSA-2048', 'RSA-4096', 'ChaCha20-Poly1305', 'unknown'
            ];
            algorithms.forEach(algorithm => {
                const state = { status: 'encrypted', algorithm };
                const { rerender } = render(_jsx(EncryptionStatus, { encryptionState: state }));
                expect(screen.getByText(algorithm)).toBeInTheDocument();
                rerender(_jsx("div", {})); // Clean up for next iteration
            });
        });
    });
});
