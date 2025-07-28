// packages/core/runtime/nodes/Markov.ts
// Advanced Markov node with state transition matrices
import { AdvancedRuntimeNode } from '../advanced';
import { AdvancedIOHandler, IOSpecBuilder } from '../io-system';
export class StandardTransitionMatrix {
    states;
    transitions;
    initialState;
    states;
    transitions;
    initialState;
}
this.states = [...states]; // Clone to avoid mutations
this.transitions = JSON.parse(JSON.stringify(transitions)); // Deep clone
this.initialState = initialState;
// Validate on construction
const validation = this.validate();
if (!validation.valid) {
    throw new Error(`Invalid transition matrix: ${validation.errors.join(', ')}`);
}
getInitialState();
string;
{
    if (this.initialState && this.states.includes(this.initialState)) {
        return this.initialState;
        return this.states[0] || '';
        transition(currentState, string, rng, () => number);
        string;
        {
            if (!this.states.includes(currentState)) {
                throw new Error(`Invalid current state: ${currentState}`);
            }
            const stateTransitions = this.transitions[currentState];
            if (!stateTransitions || Object.keys(stateTransitions).length === 0) {
                // No transitions defined, stay in current state
                return currentState;
                // Calculate total probability
                const totalProbability = Object.values(stateTransitions).reduce((sum, prob) => sum + prob, 0);
                if (totalProbability <= 0) {
                    // All probabilities are zero or negative, stay in current state
                    return currentState;
                    // Weighted random selection
                    let randomValue = rng() * totalProbability;
                    for (const [nextState, probability] of Object.entries(stateTransitions)) {
                        randomValue -= probability;
                        if (randomValue <= 0 && this.states.includes(nextState)) {
                            return nextState;
                            // Fallback to current state
                            return currentState;
                            validate();
                            ValidationResult;
                            {
                                const errors = [];
                                const warnings = [];
                                // Validate states
                                if (this.states.length === 0) {
                                    errors.push('No states defined in transition matrix');
                                    return { valid: false, errors, warnings };
                                    // Check for duplicate states
                                    const uniqueStates = new Set(this.states);
                                    if (uniqueStates.size !== this.states.length) {
                                        errors.push('Duplicate states found in state list');
                                        // Validate transitions
                                        for (const state of this.states) {
                                            const stateTransitions = this.transitions[state];
                                            if (!stateTransitions) {
                                                warnings.push(`No transitions defined for state: ${state}`);
                                            }
                                            continue;
                                            // Check transition targets exist
                                            for (const [targetState, probability] of Object.entries(stateTransitions)) {
                                                if (!this.states.includes(targetState)) {
                                                    errors.push(`Transition from '${state}' to invalid state '${targetState}'`);
                                                }
                                                if (typeof probability !== 'number' || probability < 0) {
                                                    errors.push(`Invalid probability ${probability} for transition '${state}' -> '${targetState}'`);
                                                }
                                                // Check probability sum
                                                const totalProbability = Object.values(stateTransitions).reduce((sum, prob) => sum + prob, 0);
                                                if (totalProbability === 0) {
                                                    warnings.push(`State '${state}' has no valid transitions (total probability = 0)`);
                                                }
                                            }
                                            if (Math.abs(totalProbability - 1.0) > 0.001) {
                                                warnings.push(`State '${state}' transition probabilities sum to ${totalProbability.toFixed(3)}, not 1.0`);
                                            }
                                            // Validate initial state
                                            if (this.initialState && !this.states.includes(this.initialState)) {
                                                errors.push(`Initial state '${this.initialState}' is not in states list`);
                                            }
                                            return {
                                                valid: errors.length === 0,
                                                errors,
                                                warnings
                                            };
                                            /**
                                             * Advanced Markov node with state transition matrices
                                             * Supports probabilistic state transitions with full determinism
                                             */
                                            export class MarkovNode extends AdvancedRuntimeNode {
                                                ioHandler;
                                                transitionMatrix;
                                                markovConfig;
                                                id;
                                                transitionMatrix;
                                                config = {};
                                                // Configure as deterministic, non-cacheable (stateful), stateful
                                                nodeConfig = {
                                                    deterministic: true,
                                                    cacheable: false, // Don't cache since output depends on state,
                                                    stateful: true, // Maintains state between executions,
                                                    performanceHints: {
                                                        expectedExecutionTime: 'fast',
                                                        memoryUsage: 'low',
                                                    },
                                                    this: .transitionMatrix = transitionMatrix,
                                                    this: .markovConfig = {
                                                        maxTransitions: 1000,
                                                        normalizeProbabilities: false,
                                                        terminationStates: [],
                                                        detectLoops: false,
                                                        ...config
                                                    },
                                                    // Set up I/O specification
                                                    const: ioSpec = new IOSpecBuilder(),
                                                    : 
                                                        .addInput({}),
                                                    id: 'states',
                                                    label: 'States',
                                                    dataType: 'stringArray',
                                                    required: false,
                                                    defaultValue: [],
                                                    description: 'Array of possible states', }
                                                    .addInput({});
                                                id;
                                                label;
                                                dataType;
                                                required;
                                                defaultValue;
                                                description;
                                            }
                                            addInput({});
                                            id: 'initialState',
                                                label;
                                            'Initial State',
                                                dataType;
                                            'string',
                                                required;
                                            false,
                                                defaultValue;
                                            '',
                                                description;
                                            'Starting state for the Markov chain',
                                            ;
                                        }
                                        addTextOutput('result', 'Current State')
                                            .build();
                                        this.ioHandler = new AdvancedIOHandler(ioSpec);
                                        /**
                                         * Execute Markov chain transition
                                         */
                                        run(ctx, AdvancedExecutionContext);
                                        string;
                                        {
                                            // Record this node's execution
                                            ctx.executionMeta.nodeExecutionOrder.push(this.id);
                                            // Use performance tracking for Markov processing
                                            return this.measureExecution(ctx, 'markov-transition', () => {
                                                // Get current state or initialize
                                                let currentState = this.getState(ctx);
                                                if (!currentState) {
                                                    // Initialize new Markov chain
                                                    const initialState = this.transitionMatrix.getInitialState();
                                                    currentState = {
                                                        currentState: initialState,
                                                        history: [],
                                                        transitionCount: 0,
                                                        metadata: {}
                                                    };
                                                    this.setState(ctx, currentState);
                                                    return initialState;
                                                    // Check termination conditions
                                                    if (this.shouldTerminate(currentState)) {
                                                        // Don't transition, return current state
                                                        return currentState.currentState;
                                                        // Create seeded RNG for deterministic transitions
                                                        const rng = seedrandom(`${ctx.seed}-${this.id}-${currentState.transitionCount}`);
                                                    }
                                                    // Perform transition
                                                    const nextState = this.transitionMatrix.transition(currentState.currentState, rng);
                                                    // Update state
                                                    const newState = {
                                                        currentState: nextState,
                                                        history: [...currentState.history, currentState.currentState],
                                                        transitionCount: currentState.transitionCount + 1,
                                                        metadata: currentState.metadata,
                                                    };
                                                    this.setState(ctx, newState);
                                                    return nextState;
                                                }
                                            });
                                            /**
                                             * Comprehensive validation of Markov configuration
                                             */
                                            validate();
                                            ValidationResult;
                                            {
                                                const errors = [];
                                                const warnings = [];
                                                // Validate transition matrix
                                                const matrixValidation = this.transitionMatrix.validate();
                                                errors.push(...matrixValidation.errors);
                                                warnings.push(...matrixValidation.warnings);
                                                // Validate configuration
                                                if (this.markovConfig.maxTransitions !== undefined && this.markovConfig.maxTransitions <= 0) {
                                                    errors.push('maxTransitions must be positive');
                                                    if (this.markovConfig.terminationStates) {
                                                        for (const state of this.markovConfig.terminationStates) {
                                                            if (!this.transitionMatrix.states.includes(state)) {
                                                                errors.push(`Termination state '${state}' is not in states list`);
                                                            }
                                                            return {
                                                                valid: errors.length === 0,
                                                                errors,
                                                                warnings
                                                            };
                                                            /**
                                                             * Serialize node data for persistence
                                                             */
                                                            serialize();
                                                            AdvancedNodeData;
                                                            {
                                                                return {
                                                                    id: this.id,
                                                                    type: 'Markov',
                                                                    config: this.getConfig(),
                                                                    data: {
                                                                        states: this.transitionMatrix.states,
                                                                        transitions: this.transitionMatrix.transitions,
                                                                        initialState: this.transitionMatrix.getInitialState(),
                                                                        markovConfig: this.markovConfig,
                                                                    },
                                                                    metadata: {
                                                                        version: '1.0.0',
                                                                        created: new Date().toISOString(),
                                                                    },
                                                                    /**
                                                                     * Get current Markov state for debugging/inspection
                                                                     */
                                                                    getCurrentMarkovState(ctx) {
                                                                        return this.getState(ctx) || null;
                                                                        /**
                                                                         * Reset Markov chain state (for testing or manual control)
                                                                         */
                                                                        resetMarkovState(ctx, AdvancedExecutionContext);
                                                                        void {
                                                                            const: initialState = this.transitionMatrix.getInitialState(),
                                                                            this: .setState(ctx, {}),
                                                                            currentState: initialState,
                                                                            history: [],
                                                                            transitionCount: 0,
                                                                            metadata: {}
                                                                        };
                                                                        ;
                                                                        /**
                                                                         * Get transition history
                                                                         */
                                                                        getTransitionHistory(ctx, AdvancedExecutionContext);
                                                                        string;
                                                                        {
                                                                            const state = this.getState(ctx);
                                                                            return state ? [...state.history, state.currentState] : [];
                                                                            /**
                                                                             * Check if chain should terminate
                                                                             */
                                                                        }
                                                                        /**
                                                                         * Check if chain should terminate
                                                                         */
                                                                    }
                                                                    /**
                                                                     * Check if chain should terminate
                                                                     */
                                                                    ,
                                                                    /**
                                                                     * Check if chain should terminate
                                                                     */
                                                                    shouldTerminate(state) {
                                                                        // Check max transitions
                                                                        if (this.markovConfig.maxTransitions && state.transitionCount >= this.markovConfig.maxTransitions) {
                                                                            return true;
                                                                            // Check termination states
                                                                            if (this.markovConfig.terminationStates && this.markovConfig.terminationStates.includes(state.currentState)) {
                                                                                return true;
                                                                                // Check for loops if enabled
                                                                                if (this.markovConfig.detectLoops && this.detectLoop(state)) {
                                                                                    return true;
                                                                                    return false;
                                                                                    /**
                                                                                     * Simple loop detection
                                                                                     */
                                                                                }
                                                                                /**
                                                                                 * Simple loop detection
                                                                                 */
                                                                            }
                                                                            /**
                                                                             * Simple loop detection
                                                                             */
                                                                        }
                                                                        /**
                                                                         * Simple loop detection
                                                                         */
                                                                    }
                                                                    /**
                                                                     * Simple loop detection
                                                                     */
                                                                    ,
                                                                    /**
                                                                     * Simple loop detection
                                                                     */
                                                                    detectLoop(state) {
                                                                        const recentHistory = state.history.slice(-10); // Check last 10 states;
                                                                        const currentState = state.currentState;
                                                                        // Look for repeated patterns
                                                                        const occurrences = recentHistory.filter(s => s === currentState).length;
                                                                        return occurrences >= 3; // If current state appeared 3+ times recently
                                                                        states: string,
                                                                            transitions;
                                                                        (Record),
                                                                            initialState ?  : string,
                                                                            config;
                                                                        MarkovConfig = {};
                                                                        MarkovNode;
                                                                        {
                                                                            const matrix = new StandardTransitionMatrix(states, transitions, initialState);
                                                                            return new MarkovNode(id, matrix, config);
                                                                            states: string;
                                                                            transitions: Record;
                                                                            initialState ?  : string;
                                                                        }
                                                                        TransitionMatrix;
                                                                        {
                                                                            return new StandardTransitionMatrix();
                                                                            config.states,
                                                                                config.transitions,
                                                                                config.initialState;
                                                                            ;
                                                                            /**
                                                                             * Common Markov chain presets
                                                                             */
                                                                            export const MarkovPresets = {
                                                                                /** Simple two-state toggle */
                                                                                toggle: (state1, state2) => createTransitionMatrix({}),
                                                                                states: [state1, state2],
                                                                                transitions: {
                                                                                    [state1]: { [state2]: 1.0 },
                                                                                    [state2]: { [state1]: 1.0 }
                                                                                },
                                                                                /** Random walk with equal probabilities */
                                                                                randomWalk: (states) => {
                                                                                    const prob = 1.0 / states.length;
                                                                                    const transitions = {};
                                                                                    for (const state of states) {
                                                                                        transitions[state] = {};
                                                                                        for (const targetState of states) {
                                                                                            transitions[state][targetState] = prob;
                                                                                            return createTransitionMatrix({ states, transitions });
                                                                                        }
                                                                                        /** Linear progression through states */
                                                                                        linear: (states, cyclic = false) => {
                                                                                            const transitions = {};
                                                                                            for (let i = 0; i < states.length; i++) {
                                                                                                const currentState = states[i];
                                                                                                const nextIndex = i + 1;
                                                                                                if (nextIndex < states.length) {
                                                                                                    // Move to next state
                                                                                                    transitions[currentState] = { [states[nextIndex]]: 1.0 };
                                                                                                }
                                                                                                else if (cyclic) {
                                                                                                    // Cycle back to first state
                                                                                                    transitions[currentState] = { [states[0]]: 1.0 };
                                                                                                }
                                                                                                else {
                                                                                                    // Stay in final state
                                                                                                    transitions[currentState] = { [currentState]: 1.0 };
                                                                                                    return createTransitionMatrix({ states, transitions });
                                                                                                }
                                                                                                /** Absorbing states (traps that never transition out) */
                                                                                                absorbing: (states, absorbingStates) => {
                                                                                                    const transitions = {};
                                                                                                    const normalStates = states.filter(s => !absorbingStates.includes(s));
                                                                                                    // Absorbing states stay put
                                                                                                    for (const state of absorbingStates) {
                                                                                                        transitions[state] = { [state]: 1.0 };
                                                                                                        // Normal states transition to other states (including absorbing)
                                                                                                        for (const state of normalStates) {
                                                                                                            const prob = 1.0 / states.length;
                                                                                                            transitions[state] = {};
                                                                                                            for (const targetState of states) {
                                                                                                                transitions[state][targetState] = prob;
                                                                                                                return createTransitionMatrix({ states, transitions });
                                                                                                            }
                                                                                                            as;
                                                                                                            const ;
                                                                                                        }
                                                                                                    }
                                                                                                };
                                                                                            }
                                                                                        };
                                                                                    }
                                                                                }
                                                                            };
                                                                        }
                                                                    }
                                                                };
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
