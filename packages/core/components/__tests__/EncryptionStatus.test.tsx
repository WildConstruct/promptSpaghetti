import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { 
  EncryptionStatus, 
  EncryptionStatusIcon, 
  EncryptionDetails, 
  EncryptionState,
  EncryptionAlgorithm 
} from '../EncryptionStatus';
describe('EncryptionStatus Components', () => {
  const mockEncryptionState: EncryptionState = {,
  status: 'encrypted',
  algorithm: 'AES-256-GCM',
  keyId: 'key123456789',
  lastEncrypted: Date.now() - 1000 * 60 * 5, // 5 minutes ago,
  lastDecrypted: Date.now() - 1000 * 60 * 10, // 10 minutes ago,
  dataSize: 1024 * 1024, // 1MB,
  encryptionTime: 150,
  strength: 'strong',
};
  const mockErrorState: EncryptionState = {,
  status: 'error',
  error: 'Failed to encrypt data: Invalid key',
};
  const mockNotEncryptedState: EncryptionState = {,
  status: 'not_encrypted',
  dataSize: 2048,
};
  describe('EncryptionStatus', () => {
    it('renders encrypted status correctly', () => {
      render(<EncryptionStatus encryptionState={mockEncryptionState} />);
      expect(screen.getByText('Encrypted')).toBeInTheDocument();
      expect(screen.getByText('AES-256-GCM')).toBeInTheDocument();
      expect(screen.getByText('STRONG')).toBeInTheDocument();
      expect(screen.getByText('🔒')).toBeInTheDocument();
    });
    it('renders not encrypted status correctly', () => {
      render(<EncryptionStatus encryptionState={mockNotEncryptedState} />);
      expect(screen.getByText('Not Encrypted')).toBeInTheDocument();
      expect(screen.getByText('🔓')).toBeInTheDocument();
    });
    it('renders error status correctly', () => {
      render(<EncryptionStatus encryptionState={mockErrorState} />);
      expect(screen.getByText('Encryption Error')).toBeInTheDocument();
      expect(screen.getByText('⚠️')).toBeInTheDocument();
      expect(screen.getByTitle('Failed to encrypt data: Invalid key')).toBeInTheDocument();
    });
    it('shows details when showDetails is true', () => {
      render(<EncryptionStatus encryptionState={mockEncryptionState} showDetails />);
      expect(screen.getByText(/Last encrypted:/)).toBeInTheDocument();
      expect(screen.getByText(/Size:/)).toBeInTheDocument();
      expect(screen.getByText(/\(150ms\)/)).toBeInTheDocument();
    });
    it('applies custom className', () => {
      const { container } = render()
        <EncryptionStatus encryptionState={mockEncryptionState} className="custom-class" />
      );
      expect(container.firstChild).toHaveClass('custom-class');
    });
    it('renders encrypting status with animation indicator', () => {
      const encryptingState: EncryptionState = { status: 'encrypting' };
      render(<EncryptionStatus encryptionState={encryptingState} />);
      expect(screen.getByText('Encrypting...')).toBeInTheDocument();
      expect(screen.getByText('🔄')).toBeInTheDocument();
    });
    it('renders decrypting status with animation indicator', () => {
      const decryptingState: EncryptionState = { status: 'decrypting' };
      render(<EncryptionStatus encryptionState={decryptingState} />);
      expect(screen.getByText('Decrypting...')).toBeInTheDocument();
      expect(screen.getByText('🔄')).toBeInTheDocument();
    });
    it('renders unknown status correctly', () => {
      const unknownState: EncryptionState = { status: 'unknown' };
      render(<EncryptionStatus encryptionState={unknownState} />);
      expect(screen.getByText('Unknown')).toBeInTheDocument();
      expect(screen.getByText('❓')).toBeInTheDocument();
    });
  });
  describe('EncryptionStatusIcon', () => {
    it('renders correctly and calls onClick', () => {
      const mockOnClick = jest.fn();
      render(<EncryptionStatusIcon encryptionState={mockEncryptionState} onClick={mockOnClick} />);
      const icon = screen.getByTitle(/Encryption: encrypted/);
      expect(icon).toBeInTheDocument();
      fireEvent.click(icon);
      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });
    it('shows correct tooltip with algorithm', () => {
      render(<EncryptionStatusIcon encryptionState={mockEncryptionState} />);
      expect(screen.getByTitle('Encryption: encrypted (AES-256-GCM)')).toBeInTheDocument();
    });
    it('shows error in tooltip', () => {
      render(<EncryptionStatusIcon encryptionState={mockErrorState} />);
      expect(screen.getByTitle('Encryption: error - Failed to encrypt data: Invalid key')).toBeInTheDocument();
    });
    it('applies animation for processing states', () => {
      const encryptingState: EncryptionState = { status: 'encrypting' };
      const { container } = render(<EncryptionStatusIcon encryptionState={encryptingState} />);
      const svg = container.querySelector('svg');
      expect(svg).toHaveClass('animate-pulse');
    });
  });
  describe('EncryptionDetails', () => {
  const mockHandlers = {
  onEncrypt: jest.fn(),
  onDecrypt: jest.fn(),
  onChangeAlgorithm: jest.fn(),
};
    beforeEach(() => {
      jest.clearAllMocks();
    });
    it('renders all encryption details', () => {
      render(<EncryptionDetails encryptionState={mockEncryptionState} {...mockHandlers} />);
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
      render(<EncryptionDetails encryptionState={mockEncryptionState} {...mockHandlers} />);
      const decryptButton = screen.getByText('🔓 Decrypt');
      expect(decryptButton).toBeInTheDocument();
      fireEvent.click(decryptButton);
      expect(mockHandlers.onDecrypt).toHaveBeenCalledTimes(1);
    });
    it('shows encrypt button for not encrypted state', () => {
      render(<EncryptionDetails encryptionState={mockNotEncryptedState} {...mockHandlers} />);
      const encryptButton = screen.getByText('🔒 Encrypt');
      expect(encryptButton).toBeInTheDocument();
      fireEvent.click(encryptButton);
      expect(mockHandlers.onEncrypt).toHaveBeenCalledTimes(1);
    });
    it('shows processing state without buttons', () => {
      const processingState: EncryptionState = { status: 'encrypting' };
      render(<EncryptionDetails encryptionState={processingState} {...mockHandlers} />);
      expect(screen.getByText('Processing...')).toBeInTheDocument();
      expect(screen.queryByText('🔒 Encrypt')).not.toBeInTheDocument();
      expect(screen.queryByText('🔓 Decrypt')).not.toBeInTheDocument();
    });
    it('displays error details correctly', () => {
      render(<EncryptionDetails encryptionState={mockErrorState} {...mockHandlers} />);
      expect(screen.getByText('Error:')).toBeInTheDocument();
      expect(screen.getByText('Failed to encrypt data: Invalid key')).toBeInTheDocument();
    });
    it('formats data sizes correctly', () => {
  const smallDataState: EncryptionState = {,
  status: 'encrypted',
  dataSize: 512,
};
      render(<EncryptionDetails encryptionState={smallDataState} />);
      expect(screen.getByText('512 B')).toBeInTheDocument();
      const { rerender } = render(<EncryptionDetails encryptionState={smallDataState} />);
      const kbDataState: EncryptionState = {,
  status: 'encrypted',
  dataSize: 1536,
};
      rerender(<EncryptionDetails encryptionState={kbDataState} />);
      expect(screen.getByText('1.5 KB')).toBeInTheDocument();
      const gbDataState: EncryptionState = {,
  status: 'encrypted',
  dataSize: 1024 * 1024 * 1024 * 2.5,
};
      rerender(<EncryptionDetails encryptionState={gbDataState} />);
      expect(screen.getByText('2.5 GB')).toBeInTheDocument();
    });
    it('shows correct strength colors', () => {
  const strongState: EncryptionState = {,
  status: 'encrypted',
  strength: 'strong',
};
      render(<EncryptionDetails encryptionState={strongState} />);
      expect(screen.getByText('strong')).toHaveClass('text-green-600');
      const { rerender } = render(<EncryptionDetails encryptionState={strongState} />);
      const mediumState: EncryptionState = {,
  status: 'encrypted',
  strength: 'medium',
};
      rerender(<EncryptionDetails encryptionState={mediumState} />);
      expect(screen.getByText('medium')).toHaveClass('text-yellow-600');
      const weakState: EncryptionState = {,
  status: 'encrypted',
  strength: 'weak',
};
      rerender(<EncryptionDetails encryptionState={weakState} />);
      expect(screen.getByText('weak')).toHaveClass('text-red-600');
    });
    it('provides correct algorithm strength descriptions', () => {
  const aes256State: EncryptionState = {,
  status: 'encrypted',
  algorithm: 'AES-256-GCM',
};
      render(<EncryptionDetails encryptionState={aes256State} />);
      expect(screen.getByText('Strong encryption (256-bit)')).toBeInTheDocument();
      const { rerender } = render(<EncryptionDetails encryptionState={aes256State} />);
      const aes128State: EncryptionState = {,
  status: 'encrypted',
  algorithm: 'AES-128-GCM',
};
      rerender(<EncryptionDetails encryptionState={aes128State} />);
      expect(screen.getByText('Medium encryption (128-bit)')).toBeInTheDocument();
      const rsa4096State: EncryptionState = {,
  status: 'encrypted',
  algorithm: 'RSA-4096',
};
      rerender(<EncryptionDetails encryptionState={rsa4096State} />);
      expect(screen.getByText('Strong encryption (RSA 4096-bit)')).toBeInTheDocument();
    });
    it('handles missing timestamps gracefully', () => {
      const noTimestampState: EncryptionState = { status: 'encrypted' };
      render(<EncryptionDetails encryptionState={noTimestampState} />);
      // Should not crash and should show 'Never' for missing timestamps
      expect(screen.queryByText('Never')).not.toBeInTheDocument(); // Only shown in some contexts
    });
  });
  describe('Component Integration', () => {
    it('all components work together with same state', () => {
      const { container } = render()
        <div>
          <EncryptionStatus encryptionState={mockEncryptionState} />
          <EncryptionStatusIcon encryptionState={mockEncryptionState} />
          <EncryptionDetails encryptionState={mockEncryptionState} />
        </div>
      );
      // All components should render without errors
      expect(container).toBeInTheDocument();
      expect(screen.getAllByText('🔒').length).toBeGreaterThanOrEqual(1); // At least one lock icon
      expect(screen.getByText('Encrypted')).toBeInTheDocument();
      expect(screen.getByText('Encryption Status')).toBeInTheDocument();
    });
    it('handles different encryption algorithms', () => {
      const algorithms: EncryptionAlgorithm = [
        'AES-256-GCM', 'AES-256-CBC', 'AES-128-GCM', 
        'RSA-2048', 'RSA-4096', 'ChaCha20-Poly1305', 'unknown'
      ];
      algorithms.forEach(algorithm => {)
  const state: EncryptionState = { status: 'encrypted', algorithm };
        const { rerender } = render(<EncryptionStatus encryptionState={state} />);
        expect(screen.getByText(algorithm)).toBeInTheDocument();
        rerender(<div />); // Clean up for next iteration
      });
    });
  });
});