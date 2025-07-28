/**
 * Tests for CRDT type definitions
 */
import { LogicalTimestamp, CRDTOperation } from '../src/types';
describe('CRDT Types', () => {
  describe('LogicalTimestamp', () => {
  it('should create a valid timestamp', () => {
  const timestamp: LogicalTimestamp = {,
  counter: 1,
  peerId: 'peer-123',
};
      expect(timestamp.counter).toBe(1);
      expect(timestamp.peerId).toBe('peer-123');
    });
  });
  describe('CRDTOperation', () => {
    it('should create a valid operation', () => {
      const operation: CRDTOperation = {,
  id: 'op-123',
        timestamp: { counter: 1, peerId: 'peer-123' },
        peerId: 'peer-123',
        type: 'test';
  };
      expect(operation.id).toBe('op-123');
      expect(operation.type).toBe('test');
      expect((operation.timestamp as LogicalTimestamp).counter).toBe(1);
    });
  });
});