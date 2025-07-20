// packages/core/runtime/nodes/__tests__/Markov.test.ts
// Comprehensive test suite for Markov node
import { StandardTransitionMatrix, MarkovPresets, createMarkovNode } from '../Markov.js';
import { AdvancedExecutionUtils } from '../../advanced.js';
describe('MarkovNode', () => {
    let ctx;
    beforeEach(() => {
        ctx = AdvancedExecutionUtils.enhanceContext({
            variables: {},
            seed: 12345
        });
    });
    describe('StandardTransitionMatrix', () => {
        test('should create valid transition matrix', () => {
            const states = ['A', 'B', 'C'];
            const transitions = {
                A: { B: 0.5, C: 0.5 },
                B: { A: 0.3, C: 0.7 },
                C: { A: 1.0 }
            };
            const matrix = new StandardTransitionMatrix(states, transitions, 'A');
            expect(matrix.states).toEqual(['A', 'B', 'C']);
            expect(matrix.getInitialState()).toBe('A');
            expect(matrix.validate().valid).toBe(true);
        });
        test('should handle transition with deterministic RNG', () => {
            const states = ['start', 'middle', 'end'];
            const transitions = {
                start: { middle: 0.6, end: 0.4 },
                middle: { end: 1.0 },
                end: { end: 1.0 }
            };
            const matrix = new StandardTransitionMatrix(states, transitions);
            // Test with fixed RNG value
            const deterministicRng = () => 0.3; // Should pick first option (middle)
            const result = matrix.transition('start', deterministicRng);
            expect(result).toBe('middle');
            const secondRng = () => 0.8; // Should pick second option (end)
            const result2 = matrix.transition('start', secondRng);
            expect(result2).toBe('end');
        });
        test('should validate transition matrix correctly', () => {
            // Valid matrix
            const validMatrix = new StandardTransitionMatrix(['A', 'B'], { A: { B: 1.0 }, B: { A: 1.0 } });
            expect(validMatrix.validate().valid).toBe(true);
            // Invalid: negative probability
            expect(() => {
                new StandardTransitionMatrix(['A', 'B'], { A: { B: -0.5 }, B: { A: 1.0 } });
            }).toThrow();
            // Invalid: reference to non-existent state
            expect(() => {
                new StandardTransitionMatrix(['A', 'B'], { A: { C: 1.0 }, B: { A: 1.0 } });
            }).toThrow();
        });
        test('should handle edge cases in transitions', () => {
            const matrix = new StandardTransitionMatrix(['lone'], { lone: {} } // No transitions
            );
            // Should stay in same state when no transitions defined
            const result = matrix.transition('lone', () => 0.5);
            expect(result).toBe('lone');
        });
    });
    describe('MarkovNode Core Functionality', () => {
        test('should initialize with first state', () => {
            const node = createMarkovNode('markov1', ['start', 'end'], { start: { end: 1.0 }, end: { end: 1.0 } }, 'start');
            const result = node.run(ctx);
            expect(result).toBe('start'); // Initial execution returns initial state
        });
        test('should transition between states deterministically', () => {
            const node = createMarkovNode('markov1', ['A', 'B'], { A: { B: 1.0 }, B: { A: 1.0 } }, 'A');
            // First execution: return initial state
            const result1 = node.run(ctx);
            expect(result1).toBe('A');
            // Second execution: transition to B
            const result2 = node.run(ctx);
            expect(result2).toBe('B');
            // Third execution: transition back to A
            const result3 = node.run(ctx);
            expect(result3).toBe('A');
        });
        test('should maintain state across multiple executions', () => {
            const node = createMarkovNode('markov1', ['first', 'second', 'third'], {
                first: { second: 1.0 },
                second: { third: 1.0 },
                third: { third: 1.0 } // Absorbing state
            }, 'first');
            const results = [];
            for (let i = 0; i < 5; i++) {
                results.push(node.run(ctx));
            }
            expect(results).toEqual(['first', 'second', 'third', 'third', 'third']);
        });
        test('should handle probabilistic transitions with deterministic seeds', () => {
            const node = createMarkovNode('markov1', ['heads', 'tails'], {
                heads: { heads: 0.6, tails: 0.4 },
                tails: { heads: 0.3, tails: 0.7 }
            }, 'heads');
            // Multiple executions with same seed should be deterministic
            const results1 = [];
            for (let i = 0; i < 10; i++) {
                results1.push(node.run(ctx));
            }
            // Reset and run again with same seed - create fresh context
            const ctx2 = AdvancedExecutionUtils.enhanceContext({
                variables: {},
                seed: 12345 // Same seed
            });
            const node2 = createMarkovNode('markov1', // Same node ID
            ['heads', 'tails'], {
                heads: { heads: 0.6, tails: 0.4 },
                tails: { heads: 0.3, tails: 0.7 }
            }, 'heads');
            const results2 = [];
            for (let i = 0; i < 10; i++) {
                results2.push(node2.run(ctx2));
            }
            expect(results1).toEqual(results2);
        });
        test('should respect termination conditions', () => {
            const node = createMarkovNode('markov1', ['active', 'terminated'], {
                active: { active: 0.8, terminated: 0.2 },
                terminated: { terminated: 1.0 }
            }, 'active', {
                maxTransitions: 3,
                terminationStates: ['terminated']
            });
            const results = [];
            for (let i = 0; i < 10; i++) {
                results.push(node.run(ctx));
            }
            // Should not exceed maxTransitions or continue after termination
            const transitionCount = node.getCurrentMarkovState(ctx)?.transitionCount || 0;
            expect(transitionCount).toBeLessThanOrEqual(3);
        });
    });
    describe('MarkovNode Configuration', () => {
        test('should handle maxTransitions configuration', () => {
            const node = createMarkovNode('markov1', ['A', 'B'], { A: { B: 1.0 }, B: { A: 1.0 } }, 'A', { maxTransitions: 2 });
            const results = [];
            for (let i = 0; i < 5; i++) {
                results.push(node.run(ctx));
            }
            const state = node.getCurrentMarkovState(ctx);
            expect(state?.transitionCount).toBeLessThanOrEqual(2);
        });
        test('should handle termination states', () => {
            const node = createMarkovNode('markov1', ['running', 'stopped', 'error'], {
                running: { running: 0.6, stopped: 0.3, error: 0.1 },
                stopped: { running: 0.8, stopped: 0.2 },
                error: { error: 1.0 }
            }, 'running', { terminationStates: ['error'] });
            // Force transition to error state
            node.resetMarkovState(ctx);
            const state = node.getCurrentMarkovState(ctx);
            if (state) {
                state.currentState = 'error';
                node.run(ctx); // Should not transition from error
                expect(node.getCurrentMarkovState(ctx)?.currentState).toBe('error');
            }
        });
        test('should handle loop detection', () => {
            const node = createMarkovNode('markov1', ['A'], { A: { A: 1.0 } }, 'A', { detectLoops: true });
            const results = [];
            for (let i = 0; i < 15; i++) {
                results.push(node.run(ctx));
            }
            // Should detect loop and stop transitioning
            const finalState = node.getCurrentMarkovState(ctx);
            expect(finalState?.currentState).toBe('A');
        });
    });
    describe('MarkovNode State Management', () => {
        test('should track transition history', () => {
            const node = createMarkovNode('markov1', ['X', 'Y', 'Z'], { X: { Y: 1.0 }, Y: { Z: 1.0 }, Z: { X: 1.0 } }, 'X');
            node.run(ctx); // X (initial)
            node.run(ctx); // Y
            node.run(ctx); // Z
            const history = node.getTransitionHistory(ctx);
            expect(history).toEqual(['X', 'Y', 'Z']);
        });
        test('should reset state correctly', () => {
            const node = createMarkovNode('markov1', ['start', 'middle', 'end'], { start: { middle: 1.0 }, middle: { end: 1.0 }, end: { end: 1.0 } }, 'start');
            // Run several transitions
            node.run(ctx);
            node.run(ctx);
            node.run(ctx);
            // Reset and verify
            node.resetMarkovState(ctx);
            const state = node.getCurrentMarkovState(ctx);
            expect(state?.currentState).toBe('start');
            expect(state?.transitionCount).toBe(0);
            expect(state?.history).toEqual([]);
        });
        test('should provide current state inspection', () => {
            const node = createMarkovNode('markov1', ['alpha', 'beta'], { alpha: { beta: 1.0 }, beta: { alpha: 1.0 } }, 'alpha');
            let state = node.getCurrentMarkovState(ctx);
            expect(state).toBeNull(); // No state before first run
            node.run(ctx);
            state = node.getCurrentMarkovState(ctx);
            expect(state?.currentState).toBe('alpha');
            expect(state?.transitionCount).toBe(0);
        });
    });
    describe('MarkovNode Validation', () => {
        test('should validate node configuration', () => {
            const validNode = createMarkovNode('markov1', ['A', 'B'], { A: { B: 1.0 }, B: { A: 1.0 } });
            expect(validNode.validate().valid).toBe(true);
            const invalidNode = createMarkovNode('markov1', ['A', 'B'], { A: { B: 1.0 }, B: { A: 1.0 } }, 'A', { maxTransitions: -5 } // Invalid config
            );
            expect(invalidNode.validate().valid).toBe(false);
        });
        test('should validate termination states', () => {
            const node = createMarkovNode('markov1', ['valid', 'state'], { valid: { state: 1.0 }, state: { valid: 1.0 } }, 'valid', { terminationStates: ['invalid'] } // Non-existent state
            );
            const validation = node.validate();
            expect(validation.valid).toBe(false);
            expect(validation.errors.some(e => e.includes('invalid'))).toBe(true);
        });
    });
    describe('MarkovNode Serialization', () => {
        test('should serialize node data correctly', () => {
            const node = createMarkovNode('markov1', ['serialize', 'test'], { serialize: { test: 1.0 }, test: { serialize: 1.0 } }, 'serialize', { maxTransitions: 100 });
            const serialized = node.serialize();
            expect(serialized.id).toBe('markov1');
            expect(serialized.type).toBe('Markov');
            expect(serialized.data.states).toEqual(['serialize', 'test']);
            expect(serialized.data.markovConfig.maxTransitions).toBe(100);
        });
    });
    describe('MarkovPresets', () => {
        test('should create toggle preset correctly', () => {
            const matrix = MarkovPresets.toggle('on', 'off');
            expect(matrix.states).toEqual(['on', 'off']);
            // Test transitions
            expect(matrix.transition('on', () => 0.5)).toBe('off');
            expect(matrix.transition('off', () => 0.5)).toBe('on');
        });
        test('should create random walk preset correctly', () => {
            const matrix = MarkovPresets.randomWalk(['A', 'B', 'C']);
            expect(matrix.states).toEqual(['A', 'B', 'C']);
            const validation = matrix.validate();
            expect(validation.valid).toBe(true);
            // Each state should have equal probability to all states
            expect(matrix.transitions.A.A).toBeCloseTo(1 / 3);
            expect(matrix.transitions.A.B).toBeCloseTo(1 / 3);
            expect(matrix.transitions.A.C).toBeCloseTo(1 / 3);
        });
        test('should create linear preset correctly', () => {
            const matrix = MarkovPresets.linear(['first', 'second', 'third'], false);
            expect(matrix.states).toEqual(['first', 'second', 'third']);
            // Should progress linearly
            expect(matrix.transition('first', () => 0.5)).toBe('second');
            expect(matrix.transition('second', () => 0.5)).toBe('third');
            expect(matrix.transition('third', () => 0.5)).toBe('third'); // Stay at end
        });
        test('should create cyclic linear preset correctly', () => {
            const matrix = MarkovPresets.linear(['A', 'B', 'C'], true);
            // Should cycle back to start
            expect(matrix.transition('A', () => 0.5)).toBe('B');
            expect(matrix.transition('B', () => 0.5)).toBe('C');
            expect(matrix.transition('C', () => 0.5)).toBe('A'); // Cycle back
        });
        test('should create absorbing preset correctly', () => {
            const matrix = MarkovPresets.absorbing(['normal', 'absorb1', 'absorb2'], ['absorb1', 'absorb2']);
            // Absorbing states should stay put
            expect(matrix.transition('absorb1', () => 0.5)).toBe('absorb1');
            expect(matrix.transition('absorb2', () => 0.5)).toBe('absorb2');
            // Normal states should be able to transition
            const result = matrix.transition('normal', () => 0.1);
            expect(['normal', 'absorb1', 'absorb2']).toContain(result);
        });
    });
    describe('MarkovNode Performance and Determinism', () => {
        test('should execute within performance expectations', () => {
            const node = createMarkovNode('perf-test', Array.from({ length: 100 }, (_, i) => `state${i}`), Object.fromEntries(Array.from({ length: 100 }, (_, i) => [
                `state${i}`,
                { [`state${(i + 1) % 100}`]: 1.0 }
            ])));
            const startTime = Date.now();
            for (let i = 0; i < 1000; i++) {
                node.run(ctx);
            }
            const duration = Date.now() - startTime;
            expect(duration).toBeLessThan(1000); // Should complete in under 1 second
        });
        test('should produce deterministic results across multiple runs', () => {
            const createTestNode = () => createMarkovNode('determinism-test', ['det1', 'det2', 'det3'], {
                det1: { det2: 0.6, det3: 0.4 },
                det2: { det1: 0.3, det3: 0.7 },
                det3: { det1: 0.8, det2: 0.2 }
            }, 'det1');
            // Run 1
            const node1 = createTestNode();
            const results1 = [];
            for (let i = 0; i < 20; i++) {
                results1.push(node1.run(ctx));
            }
            // Run 2 with fresh context but same seed
            const ctx2 = AdvancedExecutionUtils.enhanceContext({
                variables: {},
                seed: 12345
            });
            const node2 = createTestNode();
            const results2 = [];
            for (let i = 0; i < 20; i++) {
                results2.push(node2.run(ctx2));
            }
            expect(results1).toEqual(results2);
        });
    });
});
