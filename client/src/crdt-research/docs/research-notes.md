# CRDT Research Notes

## Research Log

### Initial Considerations

#### Graph Structure Challenges

1. **Referential Integrity**: Edges must reference existing nodes
2. **Cascading Deletes**: Removing nodes should handle connected edges
3. **Circular Dependencies**: Prevent cycles in certain graph types
4. **Property Conflicts**: Node/edge data merging strategies

#### CRDT Type Evaluation

##### 1. OR-Set (Observed-Remove Set)

- **Pros**: Good for node/edge collections
- **Cons**: Doesn't handle properties well
- **Use Case**: Managing node/edge existence

##### 2. LWW-Register (Last-Write-Wins Register)

- **Pros**: Simple property updates
- **Cons**: Loses concurrent updates
- **Use Case**: Node/edge property updates

##### 3. MV-Register (Multi-Value Register)

- **Pros**: Preserves all concurrent values
- **Cons**: Requires conflict resolution UI
- **Use Case**: Complex property merging

##### 4. RGA (Replicated Growable Array)

- **Pros**: Ordered collections
- **Cons**: Overhead for simple graphs
- **Use Case**: Ordered node lists

#### Hybrid Approach Proposal

Combine multiple CRDT types:

- OR-Set for node/edge collections
- LWW-Register for simple properties
- Custom CRDT for graph-specific operations

## Implementation Strategy

### Phase 1: Basic CRDT Operations

- [ ] Implement OR-Set for nodes
- [ ] Implement OR-Set for edges
- [ ] Basic add/remove operations
- [ ] Simple conflict resolution

### Phase 2: Property Synchronization

- [ ] LWW-Register for properties
- [ ] Nested property handling
- [ ] Type-safe property updates
- [ ] Property merge strategies

### Phase 3: Advanced Features

- [ ] Causality tracking
- [ ] Garbage collection
- [ ] Compression strategies
- [ ] Partial synchronization

### Phase 4: Integration Design

- [ ] React Flow integration
- [ ] WebSocket protocol
- [ ] State persistence
- [ ] Offline support

## Performance Targets

- Operation latency: <10ms
- Merge complexity: O(n log n)
- Memory overhead: <2x base graph size
- Network efficiency: <1KB per operation

## Open Questions

1. How to handle schema migrations in collaborative sessions?
2. Should we support operation transformation alongside CRDTs?
3. What's the best strategy for large graph synchronization?
4. How to implement access control with CRDTs?

## References

- [Automerge](https://github.com/automerge/automerge)
- [Yjs](https://github.com/yjs/yjs)
- [CRDT.tech](https://crdt.tech/)
- [Local-first software](https://www.inkandswitch.com/local-first/)
