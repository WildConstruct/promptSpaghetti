"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MarkovPresets = exports.MarkovNode = exports.StandardTransitionMatrix = void 0;
exports.createMarkovNode = createMarkovNode;
exports.createTransitionMatrix = createTransitionMatrix;
const advanced_1 = require("../advanced");
const io_system_1 = require("../io-system");
const seedrandom_1 = __importDefault(require("seedrandom"));
class StandardTransitionMatrix {
    constructor(states, transitions, initialState) {
        this.states = [...states];
        this.transitions = JSON.parse(JSON.stringify(transitions));
        this.initialState = initialState;
        const validation = this.validate();
        if (!validation.valid) {
            throw new Error(`Invalid transition matrix: ${validation.errors.join(', ')}`);
        }
    }
    getInitialState() {
        if (this.initialState && this.states.includes(this.initialState)) {
            return this.initialState;
        }
        return this.states[0] || '';
    }
    transition(currentState, rng) {
        if (!this.states.includes(currentState)) {
            throw new Error(`Invalid current state: ${currentState}`);
        }
        const stateTransitions = this.transitions[currentState];
        if (!stateTransitions || Object.keys(stateTransitions).length === 0) {
            return currentState;
        }
        const totalProbability = Object.values(stateTransitions).reduce((sum, prob) => sum + prob, 0);
        if (totalProbability <= 0) {
            return currentState;
        }
        let randomValue = rng() * totalProbability;
        for (const [nextState, probability] of Object.entries(stateTransitions)) {
            randomValue -= probability;
            if (randomValue <= 0 && this.states.includes(nextState)) {
                return nextState;
            }
        }
        return currentState;
    }
    validate() {
        const errors = [];
        const warnings = [];
        if (this.states.length === 0) {
            errors.push('No states defined in transition matrix');
            return { valid: false, errors, warnings };
        }
        const uniqueStates = new Set(this.states);
        if (uniqueStates.size !== this.states.length) {
            errors.push('Duplicate states found in state list');
        }
        for (const state of this.states) {
            const stateTransitions = this.transitions[state];
            if (!stateTransitions) {
                warnings.push(`No transitions defined for state: ${state}`);
                continue;
            }
            for (const [targetState, probability] of Object.entries(stateTransitions)) {
                if (!this.states.includes(targetState)) {
                    errors.push(`Transition from '${state}' to invalid state '${targetState}'`);
                }
                if (typeof probability !== 'number' || probability < 0) {
                    errors.push(`Invalid probability ${probability} for transition '${state}' -> '${targetState}'`);
                }
            }
            const totalProbability = Object.values(stateTransitions).reduce((sum, prob) => sum + prob, 0);
            if (totalProbability === 0) {
                warnings.push(`State '${state}' has no valid transitions (total probability = 0)`);
            }
            else if (Math.abs(totalProbability - 1.0) > 0.001) {
                warnings.push(`State '${state}' transition probabilities sum to ${totalProbability.toFixed(3)}, not 1.0`);
            }
        }
        if (this.initialState && !this.states.includes(this.initialState)) {
            errors.push(`Initial state '${this.initialState}' is not in states list`);
        }
        return {
            valid: errors.length === 0,
            errors,
            warnings
        };
    }
}
exports.StandardTransitionMatrix = StandardTransitionMatrix;
class MarkovNode extends advanced_1.AdvancedRuntimeNode {
    constructor(id, transitionMatrix, config = {}) {
        const nodeConfig = {
            deterministic: true,
            cacheable: false,
            stateful: true,
            performanceHints: {
                expectedExecutionTime: 'fast',
                memoryUsage: 'low'
            }
        };
        super(id, nodeConfig);
        this.transitionMatrix = transitionMatrix;
        this.markovConfig = {
            maxTransitions: 1000,
            normalizeProbabilities: false,
            terminationStates: [],
            detectLoops: false,
            ...config
        };
        const ioSpec = new io_system_1.IOSpecBuilder()
            .addInput({
            id: 'states',
            label: 'States',
            dataType: 'stringArray',
            required: false,
            defaultValue: [],
            description: 'Array of possible states'
        })
            .addInput({
            id: 'transitions',
            label: 'Transition Matrix',
            dataType: 'object',
            required: false,
            defaultValue: {},
            description: 'Transition probabilities between states'
        })
            .addInput({
            id: 'initialState',
            label: 'Initial State',
            dataType: 'string',
            required: false,
            defaultValue: '',
            description: 'Starting state for the Markov chain'
        })
            .addTextOutput('result', 'Current State')
            .build();
        this.ioHandler = new io_system_1.AdvancedIOHandler(ioSpec);
    }
    run(ctx) {
        ctx.executionMeta.nodeExecutionOrder.push(this.id);
        return this.measureExecution(ctx, 'markov-transition', () => {
            let currentState = this.getState(ctx);
            if (!currentState) {
                const initialState = this.transitionMatrix.getInitialState();
                currentState = {
                    currentState: initialState,
                    history: [],
                    transitionCount: 0,
                    metadata: {}
                };
                this.setState(ctx, currentState);
                return initialState;
            }
            if (this.shouldTerminate(currentState)) {
                return currentState.currentState;
            }
            const rng = (0, seedrandom_1.default)(`${ctx.seed}-${this.id}-${currentState.transitionCount}`);
            const nextState = this.transitionMatrix.transition(currentState.currentState, rng);
            const newState = {
                currentState: nextState,
                history: [...currentState.history, currentState.currentState],
                transitionCount: currentState.transitionCount + 1,
                metadata: currentState.metadata
            };
            this.setState(ctx, newState);
            return nextState;
        });
    }
    validate() {
        const errors = [];
        const warnings = [];
        const matrixValidation = this.transitionMatrix.validate();
        errors.push(...matrixValidation.errors);
        warnings.push(...matrixValidation.warnings);
        if (this.markovConfig.maxTransitions !== undefined && this.markovConfig.maxTransitions <= 0) {
            errors.push('maxTransitions must be positive');
        }
        if (this.markovConfig.terminationStates) {
            for (const state of this.markovConfig.terminationStates) {
                if (!this.transitionMatrix.states.includes(state)) {
                    errors.push(`Termination state '${state}' is not in states list`);
                }
            }
        }
        return {
            valid: errors.length === 0,
            errors,
            warnings
        };
    }
    serialize() {
        return {
            id: this.id,
            type: 'Markov',
            config: this.getConfig(),
            data: {
                states: this.transitionMatrix.states,
                transitions: this.transitionMatrix.transitions,
                initialState: this.transitionMatrix.getInitialState(),
                markovConfig: this.markovConfig
            },
            metadata: {
                version: '1.0.0',
                created: new Date().toISOString()
            }
        };
    }
    getCurrentMarkovState(ctx) {
        return this.getState(ctx) || null;
    }
    resetMarkovState(ctx) {
        const initialState = this.transitionMatrix.getInitialState();
        this.setState(ctx, {
            currentState: initialState,
            history: [],
            transitionCount: 0,
            metadata: {}
        });
    }
    getTransitionHistory(ctx) {
        const state = this.getState(ctx);
        return state ? [...state.history, state.currentState] : [];
    }
    shouldTerminate(state) {
        if (this.markovConfig.maxTransitions && state.transitionCount >= this.markovConfig.maxTransitions) {
            return true;
        }
        if (this.markovConfig.terminationStates && this.markovConfig.terminationStates.includes(state.currentState)) {
            return true;
        }
        if (this.markovConfig.detectLoops && this.detectLoop(state)) {
            return true;
        }
        return false;
    }
    detectLoop(state) {
        const recentHistory = state.history.slice(-10);
        const currentState = state.currentState;
        const occurrences = recentHistory.filter(s => s === currentState).length;
        return occurrences >= 3;
    }
}
exports.MarkovNode = MarkovNode;
function createMarkovNode(id, states, transitions, initialState, config = {}) {
    const matrix = new StandardTransitionMatrix(states, transitions, initialState);
    return new MarkovNode(id, matrix, config);
}
function createTransitionMatrix(config) {
    return new StandardTransitionMatrix(config.states, config.transitions, config.initialState);
}
exports.MarkovPresets = {
    toggle: (state1, state2) => createTransitionMatrix({
        states: [state1, state2],
        transitions: {
            [state1]: { [state2]: 1.0 },
            [state2]: { [state1]: 1.0 }
        }
    }),
    randomWalk: (states) => {
        const prob = 1.0 / states.length;
        const transitions = {};
        for (const state of states) {
            transitions[state] = {};
            for (const targetState of states) {
                transitions[state][targetState] = prob;
            }
        }
        return createTransitionMatrix({ states, transitions });
    },
    linear: (states, cyclic = false) => {
        const transitions = {};
        for (let i = 0; i < states.length; i++) {
            const currentState = states[i];
            const nextIndex = i + 1;
            if (nextIndex < states.length) {
                transitions[currentState] = { [states[nextIndex]]: 1.0 };
            }
            else if (cyclic) {
                transitions[currentState] = { [states[0]]: 1.0 };
            }
            else {
                transitions[currentState] = { [currentState]: 1.0 };
            }
        }
        return createTransitionMatrix({ states, transitions });
    },
    absorbing: (states, absorbingStates) => {
        const transitions = {};
        const normalStates = states.filter(s => !absorbingStates.includes(s));
        for (const state of absorbingStates) {
            transitions[state] = { [state]: 1.0 };
        }
        for (const state of normalStates) {
            const prob = 1.0 / states.length;
            transitions[state] = {};
            for (const targetState of states) {
                transitions[state][targetState] = prob;
            }
        }
        return createTransitionMatrix({ states, transitions });
    }
};
//# sourceMappingURL=Markov.js.map