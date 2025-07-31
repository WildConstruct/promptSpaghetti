/**
 * WebAdapter tests
 */

import { WebAdapter } from '../../src/adapters/WebAdapter';

describe('WebAdapter', () => {
  let adapter: WebAdapter;

  beforeEach(() => {
    adapter = new WebAdapter();
  });

  describe('Event handling', () => {
    it('handles press events', () => {
      const callback = jest.fn();
      const pressHandler = adapter.handlePress(callback);

      expect(pressHandler).toHaveProperty('onClick');
      expect(pressHandler).toHaveProperty('onKeyDown');

      // Test click
      pressHandler.onClick();
      expect(callback).toHaveBeenCalledTimes(1);

      // Test Enter key
      pressHandler.onKeyDown({ key: 'Enter', preventDefault: jest.fn() } as any);
      expect(callback).toHaveBeenCalledTimes(2);

      // Test Space key
      pressHandler.onKeyDown({ key: ' ', preventDefault: jest.fn() } as any);
      expect(callback).toHaveBeenCalledTimes(3);
    });

    it('handles long press events', () => {
      const callback = jest.fn();
      const longPressHandler = adapter.handleLongPress(callback);

      expect(longPressHandler).toHaveProperty('onMouseDown');
      expect(longPressHandler).toHaveProperty('onMouseUp');
      expect(longPressHandler).toHaveProperty('onMouseLeave');

      // Test long press
      longPressHandler.onMouseDown();

      // Fast-forward time to trigger callback
      jest.advanceTimersByTime(500);
      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('handles hover events', () => {
      const callback = jest.fn();
      const hoverHandler = adapter.handleHover(callback);

      expect(hoverHandler).toHaveProperty('onMouseEnter');
      hoverHandler.onMouseEnter();
      expect(callback).toHaveBeenCalledTimes(1);
    });
  });

  describe('Styling', () => {
    it('creates stylesheet', () => {
      const styles = { button: { color: 'red' } };
      const result = adapter.createStyleSheet(styles);
      expect(result).toBe(styles);
    });

    it('resolves styles', () => {
      const singleStyle = { color: 'red' };
      expect(adapter.resolveStyle(singleStyle)).toBe(singleStyle);

      const arrayStyles = [{ color: 'red' }, { fontSize: '16px' }];
      const resolved = adapter.resolveStyle(arrayStyles);
      expect(resolved).toEqual({ color: 'red', fontSize: '16px' });
    });
  });

  describe('Navigation', () => {
    it('opens URLs', () => {
      const mockOpen = jest.spyOn(window, 'open').mockImplementation();
      adapter.openUrl('https://example.com');
      expect(mockOpen).toHaveBeenCalledWith('https://example.com', '_blank', 'noopener,noreferrer');
      mockOpen.mockRestore();
    });

    it('goes back', () => {
      const mockBack = jest.spyOn(window.history, 'back').mockImplementation();
      Object.defineProperty(window.history, 'length', { value: 2 });

      adapter.goBack();
      expect(mockBack).toHaveBeenCalled();
      mockBack.mockRestore();
    });
  });

  describe('Storage', () => {
    it('gets storage items', async () => {
      localStorage.getItem = jest.fn().mockReturnValue('test-value');
      const result = await adapter.getStorageItem('test-key');
      expect(result).toBe('test-value');
      expect(localStorage.getItem).toHaveBeenCalledWith('test-key');
    });

    it('sets storage items', async () => {
      localStorage.setItem = jest.fn();
      await adapter.setStorageItem('test-key', 'test-value');
      expect(localStorage.setItem).toHaveBeenCalledWith('test-key', 'test-value');
    });

    it('removes storage items', async () => {
      localStorage.removeItem = jest.fn();
      await adapter.removeStorageItem('test-key');
      expect(localStorage.removeItem).toHaveBeenCalledWith('test-key');
    });
  });

  describe('Device features', () => {
    it('provides haptic feedback', () => {
      navigator.vibrate = jest.fn();
      adapter.hapticFeedback('medium');
      expect(navigator.vibrate).toHaveBeenCalledWith(20);
    });

    it('copies to clipboard', async () => {
      navigator.clipboard.writeText = jest.fn().mockResolvedValue(undefined);
      await adapter.copyToClipboard('test text');
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('test text');
    });

    it('shares content', async () => {
      navigator.share = jest.fn().mockResolvedValue(undefined);
      const content = { title: 'Test', text: 'Test content' };

      await adapter.shareContent(content);
      expect(navigator.share).toHaveBeenCalledWith(content);
    });

    it('falls back to clipboard for sharing when share API unavailable', async () => {
      navigator.share = undefined;
      navigator.clipboard.writeText = jest.fn().mockResolvedValue(undefined);

      const content = { title: 'Test', text: 'Test content', url: 'https://example.com' };
      await adapter.shareContent(content);

      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('Test\nTest content\nhttps://example.com');
    });
  });

  describe('Layout measurements', () => {
    it('measures elements', async () => {
      const mockElement = {
        getBoundingClientRect: jest.fn().mockReturnValue({
          width: 100,
          height: 50,
          left: 10,
          top: 20,
        }),
      };

      const result = await adapter.measureElement(mockElement as any);
      expect(result).toEqual({ width: 100, height: 50, x: 10, y: 20 });
    });
  });

  describe('Animation', () => {
    it('creates animations', () => {
      const config = { duration: 500, easing: 'ease-in-out' };
      const animation = adapter.createAnimation(config);

      expect(animation).toEqual({
        duration: 500,
        easing: 'ease-in-out',
        fill: 'forwards',
      });
    });
  });

  describe('File system', () => {
    it('reads files', async () => {
      const mockFile = new File(['test content'], 'test.txt', { type: 'text/plain' });
      const result = await adapter.readFile(mockFile as any);
      expect(result).toBe('test content');
    });

    it('writes files', async () => {
      const mockCreateObjectURL = jest.spyOn(URL, 'createObjectURL').mockReturnValue('mock-url');
      const mockRevokeObjectURL = jest.spyOn(URL, 'revokeObjectURL').mockImplementation();

      const mockLink = {
        href: '',
        download: '',
        click: jest.fn(),
      };
      const mockCreateElement = jest.spyOn(document, 'createElement').mockReturnValue(mockLink as any);
      const mockAppendChild = jest.spyOn(document.body, 'appendChild').mockImplementation();
      const mockRemoveChild = jest.spyOn(document.body, 'removeChild').mockImplementation();

      await adapter.writeFile('test.txt', 'test content');

      expect(mockCreateElement).toHaveBeenCalledWith('a');
      expect(mockLink.download).toBe('test.txt');
      expect(mockLink.click).toHaveBeenCalled();

      mockCreateObjectURL.mockRestore();
      mockRevokeObjectURL.mockRestore();
      mockCreateElement.mockRestore();
      mockAppendChild.mockRestore();
      mockRemoveChild.mockRestore();
    });
  });

  describe('Platform info', () => {
    it('gets device info', () => {
      const info = adapter.getDeviceInfo();
      expect(info).toHaveProperty('model');
      expect(info).toHaveProperty('brand', 'Web');
      expect(info).toHaveProperty('osVersion');
      expect(info).toHaveProperty('appVersion');
    });
  });
});
