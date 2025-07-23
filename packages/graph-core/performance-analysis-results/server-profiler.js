
const { PerformanceProfiler } = require('./server/src/performance/PerformanceProfiler.ts');

const profiler = new PerformanceProfiler({
  sampleInterval: 1000,
  outputDirectory: './performance-analysis-results/server-profiles',
  alertThresholds: {'cpuUsage':80,'memoryUsage':85,'responseTime':2000,'errorRate':5}
});

profiler.startProfiling();

// Keep process alive for profiling duration
setTimeout(() => {
  profiler.stopProfiling().then(() => {
    process.exit(0);
  });
}, 300000);

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  await profiler.stopProfiling();
  process.exit(0);
});
