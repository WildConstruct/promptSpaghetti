/**
 * CRDT Performance Benchmarks
 * Epic 9.1.1 - Testing CRDT performance with large graphs
 */
import { GraphSyncHandler } from '../src/graph-sync';
import { CRDTNode, CRDTEdge } from '../src/types';


interface BenchmarkResult {
  name: string;,
  operations: number;,
  duration: number;,
  opsPerSecond: number;,
  memoryUsed: number;
  class CRDTBenchmark {
  private results: BenchmarkResult = [];
  /**
  * Run a benchmark and record results
  */
  private async runBenchmark()
  name: string,
  operations: number,
  fn: () => void | Promise<void>): Promise<BenchmarkResult> {,
  // Force garbage collection if available
  if (global.gc) {
  global.gc();
  const memBefore = process.memoryUsage().heapUsed;
  const start = process.hrtime.bigint();
  await fn();
  const end = process.hrtime.bigint();
  const duration = Number(end - start) / 1_000_000; // Convert to milliseconds;
  const memAfter = process.memoryUsage().heapUsed;
  const result: BenchmarkResult = {,
  name,
  operations,
  duration,
  opsPerSecond: (operations / duration) * 1000,
  memoryUsed: memAfter - memBefore,


};
    this.results.push(result);
    return result;
  /**
   * Benchmark single-user node creation
   */
  async benchmarkNodeCreation(nodeCount: number): Promise<BenchmarkResult> {

    return this.runBenchmark()
      `Create ${nodeCount} nodes (single user)`}

      nodeCount,
      () => {
        const sync = new GraphSyncHandler('bench', 'user1');
        const graph = sync.getGraph();
        for (let i = 0; i < nodeCount; i++) {
          const node: CRDTNode = {,
  id: `node${i}`}
},
  type: 'WeightedChoice',
            position: { x: i * 100, y: i * 100 },
            data: {,
  choices: ['Option A', 'Option B', 'Option C'],
  weights: [0.33, 0.33, 0.34],
},
  metadata: {,
  label: `Node ${i}`}
},
  description: `This is test node number ${i}`}
},
  created: Date.now();
  };
          graph.addNode(node);
        sync.destroy();
    );
  /**
   * Benchmark concurrent node creation
   */
  async benchmarkConcurrentNodeCreation(((
    nodeCount: number,
    userCount: number
  ): Promise<BenchmarkResult> {

    const nodesPerUser = Math.floor(nodeCount / userCount);
    return this.runBenchmark()
      `Create ${nodeCount} nodes (${userCount} concurrent users)`}

      nodeCount,
      () => {
        const syncs: GraphSyncHandler = [];
        // Create sync handlers for each user
        for (let u = 0; u < userCount; u++) {
          syncs.push(new GraphSyncHandler('bench', `user${u}`));}
        // Each user creates their nodes
        for (let u = 0; u < userCount; u++) {
          const graph = syncs[u].getGraph();
          const startIdx = u * nodesPerUser;
          for (let i = 0; i < nodesPerUser; i++) {
            const node: CRDTNode = {,
  id: `node${startIdx + i}`}
},
  type: 'WeightedChoice',
              position: { x: i * 100, y: i * 100 },
              data: { choices: ['A', 'B', 'C'] },
              metadata: { creator: `user${u}` }
            };
            graph.addNode(node);
        // Sync all documents
        for (let i = 0; i < syncs.length; i++) {
          for (let j = i + 1; j < syncs.length; j++) {
            const update1 = syncs[i].getStateAsUpdate();
            const update2 = syncs[j].getStateAsUpdate();
            syncs[i].applyUpdate(update2);
            syncs[j].applyUpdate(update1);
        // Cleanup
        syncs.forEach(sync => sync.destroy());
    );
  /**
   * Benchmark edge creation in a large graph
   */
  async benchmarkEdgeCreation(nodeCount: number, edgeCount: number): Promise<BenchmarkResult> {

    return this.runBenchmark()
      `Create ${edgeCount} edges in ${nodeCount} node graph`}

      edgeCount,
      () => {
        const sync = new GraphSyncHandler('bench', 'user1');
        const graph = sync.getGraph();
        // First create nodes
        for (let i = 0; i < nodeCount; i++) {
          const node: CRDTNode = {,
  id: `node${i}`}
},
  type: 'WeightedChoice',
            position: { x: i * 100, y: i * 100 },
            data: {},
            metadata: {}
          };
          graph.addNode(node);
        // Then create edges
        for (let i = 0; i < edgeCount; i++) {
          const source = Math.floor(Math.random() * nodeCount);
          const target = Math.floor(Math.random() * nodeCount);
          if (source !== target) {
            const edge: CRDTEdge = {,
  id: `edge${i}`}
},
  source: `node${source}`}
},
  target: `node${target}`}
},
  sourceHandle: 'output',
              targetHandle: 'input',
              metadata: {}
            };
            graph.addEdge(edge);
        sync.destroy();
    );
  /**
   * Benchmark update operations
   */
  async benchmarkUpdates(nodeCount: number, updateCount: number): Promise<BenchmarkResult> {

    return this.runBenchmark()
      `Perform ${updateCount} updates on ${nodeCount} nodes`}

      updateCount,
      () => {
        const sync = new GraphSyncHandler('bench', 'user1');
        const graph = sync.getGraph();
        // Create initial nodes
        for (let i = 0; i < nodeCount; i++) {
          const node: CRDTNode = {,
  id: `node${i}`}
},
  type: 'WeightedChoice',
            position: { x: i * 100, y: i * 100 },
            data: { counter: 0 },
            metadata: {}
          };
          graph.addNode(node);
        // Perform random updates
        for (let i = 0; i < updateCount; i++) {
          const nodeIdx = Math.floor(Math.random() * nodeCount);
          const nodeId = `node${nodeIdx}`;}
          graph.updateNode(nodeId, {)
  position: {,
  x: Math.random() * 1000,
  y: Math.random() * 1000,
},
  data: { counter: i }
          });
        sync.destroy();
    );
  /**
   * Benchmark document synchronization
   */
  async benchmarkSynchronization(((
    nodeCount: number,
    syncCount: number
  ): Promise<BenchmarkResult> {

    return this.runBenchmark()
      `Sync ${nodeCount} nodes between ${syncCount} users`}

      syncCount * (syncCount - 1) / 2, // Number of sync operations
      () => {
        const syncs: GraphSyncHandler = [];
        // Create sync handlers
        for (let i = 0; i < syncCount; i++) {
          syncs.push(new GraphSyncHandler('bench', `user${i}`));}
        // Each user creates some nodes
        const nodesPerUser = Math.floor(nodeCount / syncCount);
        for (let u = 0; u < syncCount; u++) {
          const graph = syncs[u].getGraph();
          const startIdx = u * nodesPerUser;
          for (let i = 0; i < nodesPerUser; i++) {
            const node: CRDTNode = {,
  id: `node${startIdx + i}`}
},
  type: 'WeightedChoice',
              position: { x: i * 100, y: i * 100 },
              data: {},
              metadata: {}
            };
            graph.addNode(node);
        // Measure sync time
        for (let i = 0; i < syncs.length; i++) {
          for (let j = i + 1; j < syncs.length; j++) {
            const update1 = syncs[i].getStateAsUpdate();
            const update2 = syncs[j].getStateAsUpdate();
            syncs[i].applyUpdate(update2);
            syncs[j].applyUpdate(update1);
        // Cleanup
        syncs.forEach(sync => sync.destroy());
    );
  /**
   * Benchmark snapshot creation and restoration
   */
  async benchmarkSnapshots(nodeCount: number): Promise<BenchmarkResult> {

    let snapshotSize = 0;
    return this.runBenchmark()
      `Create and restore snapshot of ${nodeCount} nodes`}

      2, // Create + restore
      () => {
        const sync1 = new GraphSyncHandler('bench', 'user1');
        const graph1 = sync1.getGraph();
        // Create a complex graph
        for (let i = 0; i < nodeCount; i++) {
          const node: CRDTNode = {,
  id: `node${i}`}
},
  type: 'WeightedChoice',
            position: { x: i * 100, y: i * 100 },
            data: {,
  choices: Array.from({ length: 10 }, (_, j) => `Option ${j}`)}
},
  weights: Array.from({ length: 10 }, () => Math.random())
  },
  metadata: {,
  label: `Node ${i}`}
},
  description: `This is a detailed description for node ${i}`}
},
  tags: ['tag1', 'tag2', 'tag3'],
              created: Date.now();
  };
          graph1.addNode(node);
        // Create edges (roughly 2x nodes)
        for (let i = 0; i < nodeCount * 2; i++) {
          const source = Math.floor(Math.random() * nodeCount);
          const target = Math.floor(Math.random() * nodeCount);
          if (source !== target) {
            const edge: CRDTEdge = {,
  id: `edge${i}`}
},
  source: `node${source}`}
},
  target: `node${target}`}
},
  sourceHandle: 'output',
              targetHandle: 'input',
              metadata: {}
            };
            graph1.addEdge(edge);
        // Create snapshot
        const snapshot = sync1.createSnapshot();
        snapshotSize = snapshot.byteLength;
        // Restore to new document
        const sync2 = new GraphSyncHandler('bench', 'user2');
        sync2.restoreFromSnapshot(snapshot);
        sync1.destroy();
        sync2.destroy();
    );
  /**
   * Print benchmark results
   */
  printResults(): void {
    console.log('\n=== CRDT Performance Benchmark Results ===\n');
    this.results.forEach(result => {)
  console.log(`${result.name}:`);}
      console.log(`  Duration: ${result.duration.toFixed(2)}ms`);}
      console.log(`  Operations/sec: ${result.opsPerSecond.toFixed(2)}`);}
      console.log(`  Memory used: ${(result.memoryUsed / 1024 / 1024).toFixed(2)}MB`);}
      console.log('');
    });
  /**
   * Run all benchmarks
   */
  async runAll(): Promise<void> {

    console.log('Starting CRDT performance benchmarks...\n');
    // Node creation benchmarks
    await this.benchmarkNodeCreation(1000);
    await this.benchmarkNodeCreation(10000);
    // Concurrent editing
    await this.benchmarkConcurrentNodeCreation(1000, 5);
    await this.benchmarkConcurrentNodeCreation(10000, 10);
    // Edge creation
    await this.benchmarkEdgeCreation(100, 200);
    await this.benchmarkEdgeCreation(1000, 2000);
    // Updates
    await this.benchmarkUpdates(1000, 5000);
    await this.benchmarkUpdates(10000, 50000);
    // Synchronization
    await this.benchmarkSynchronization(1000, 5);
    await this.benchmarkSynchronization(5000, 10);
    // Snapshots
    await this.benchmarkSnapshots(1000);
    await this.benchmarkSnapshots(10000);
    this.printResults();

// Run benchmarks if executed directly
if (require.main === module) {
  const benchmark = new CRDTBenchmark();
  benchmark.runAll().catch(console.error);

export { CRDTBenchmark };