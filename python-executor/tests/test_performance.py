"""
Performance test suite for Python executor
Epic 8 Story 8.1.5: Comprehensive performance testing and benchmarking
"""

import asyncio
import time
import pytest
import statistics
import json
from typing import List, Dict, Any
from concurrent.futures import ThreadPoolExecutor, as_completed
import aiohttp
import logging

from app.performance_monitor import PerformanceMonitor
from app.performance_optimizer import PerformanceOptimizer, OptimizationStrategy
from app.executor import PythonExecutor
from app.security import SecurityValidator

logger = logging.getLogger(__name__)


class PerformanceBenchmark:
    """Performance benchmarking utilities"""
    
    def __init__(self):
        self.executor = PythonExecutor()
        self.security_validator = SecurityValidator()
        self.performance_monitor = PerformanceMonitor()
        self.performance_optimizer = PerformanceOptimizer()
        self.results = []
    
    async def setup(self):
        """Setup benchmark environment"""
        await self.performance_monitor.start_monitoring()
        await self.performance_optimizer.start_optimization(self.performance_monitor)
    
    async def teardown(self):
        """Teardown benchmark environment"""
        await self.performance_optimizer.stop_optimization()
        await self.performance_monitor.stop_monitoring()
        await self.executor.shutdown()
    
    async def benchmark_execution_time(self, code: str, input_data: Any, iterations: int = 100) -> Dict[str, float]:
        """Benchmark execution time for a piece of code"""
        durations = []
        
        for i in range(iterations):
            start_time = time.time()
            
            try:
                result = await self.executor.execute(
                    code=code,
                    input_data=input_data,
                    timeout=30,
                    memory_limit="128MB",
                    allowed_modules=["json", "math", "datetime"],
                    execution_id=f"benchmark-{i}"
                )
                
                if result.success:
                    duration = time.time() - start_time
                    durations.append(duration)
                    
            except Exception as e:
                logger.error(f"Benchmark execution failed: {e}")
        
        if not durations:
            return {"error": "No successful executions"}
        
        return {
            "mean": statistics.mean(durations),
            "median": statistics.median(durations),
            "std_dev": statistics.stdev(durations) if len(durations) > 1 else 0,
            "min": min(durations),
            "max": max(durations),
            "p95": durations[int(len(durations) * 0.95)] if len(durations) > 1 else durations[0],
            "p99": durations[int(len(durations) * 0.99)] if len(durations) > 1 else durations[0],
            "successful_executions": len(durations),
            "total_iterations": iterations,
        }
    
    async def benchmark_concurrency(self, code: str, input_data: Any, concurrent_requests: int = 10) -> Dict[str, Any]:
        """Benchmark concurrent execution performance"""
        start_time = time.time()
        
        async def execute_single():
            return await self.executor.execute(
                code=code,
                input_data=input_data,
                timeout=30,
                memory_limit="128MB",
                allowed_modules=["json", "math", "datetime"],
                execution_id=f"concurrent-{time.time()}"
            )
        
        # Execute concurrent requests
        tasks = [execute_single() for _ in range(concurrent_requests)]
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        total_time = time.time() - start_time
        
        # Analyze results
        successful = [r for r in results if not isinstance(r, Exception) and r.success]
        failed = [r for r in results if isinstance(r, Exception) or not r.success]
        
        return {
            "concurrent_requests": concurrent_requests,
            "successful_requests": len(successful),
            "failed_requests": len(failed),
            "total_time": total_time,
            "requests_per_second": len(successful) / total_time if total_time > 0 else 0,
            "success_rate": len(successful) / concurrent_requests,
            "average_execution_time": statistics.mean([r.execution_time for r in successful]) if successful else 0,
        }
    
    async def benchmark_memory_usage(self, code: str, input_data: Any, iterations: int = 50) -> Dict[str, Any]:
        """Benchmark memory usage patterns"""
        import psutil
        import gc
        
        memory_usage = []
        
        for i in range(iterations):
            gc.collect()  # Force garbage collection
            
            process = psutil.Process()
            initial_memory = process.memory_info().rss / 1024 / 1024  # MB
            
            try:
                result = await self.executor.execute(
                    code=code,
                    input_data=input_data,
                    timeout=30,
                    memory_limit="256MB",
                    allowed_modules=["json", "math", "datetime"],
                    execution_id=f"memory-benchmark-{i}"
                )
                
                peak_memory = process.memory_info().rss / 1024 / 1024  # MB
                memory_usage.append(peak_memory - initial_memory)
                
            except Exception as e:
                logger.error(f"Memory benchmark execution failed: {e}")
        
        if not memory_usage:
            return {"error": "No successful executions"}
        
        return {
            "mean_memory_mb": statistics.mean(memory_usage),
            "median_memory_mb": statistics.median(memory_usage),
            "max_memory_mb": max(memory_usage),
            "min_memory_mb": min(memory_usage),
            "std_dev_memory_mb": statistics.stdev(memory_usage) if len(memory_usage) > 1 else 0,
            "successful_executions": len(memory_usage),
        }
    
    async def stress_test(self, duration_seconds: int = 60, concurrent_requests: int = 5) -> Dict[str, Any]:
        """Stress test the executor for a specified duration"""
        start_time = time.time()
        end_time = start_time + duration_seconds
        
        total_requests = 0
        successful_requests = 0
        failed_requests = 0
        execution_times = []
        
        # Simple test code
        test_code = """
def transform(input_data):
    import json
    import math
    
    # Simple processing
    result = {"processed": True, "input": input_data}
    
    # Add some computation
    for i in range(100):
        result[f"computed_{i}"] = math.sqrt(i + 1)
    
    return json.dumps(result)
"""
        
        async def execute_request():
            nonlocal total_requests, successful_requests, failed_requests
            
            execution_start = time.time()
            total_requests += 1
            
            try:
                result = await self.executor.execute(
                    code=test_code,
                    input_data={"test": "data", "iteration": total_requests},
                    timeout=30,
                    memory_limit="128MB",
                    allowed_modules=["json", "math"],
                    execution_id=f"stress-{total_requests}"
                )
                
                execution_time = time.time() - execution_start
                execution_times.append(execution_time)
                
                if result.success:
                    successful_requests += 1
                else:
                    failed_requests += 1
                    
            except Exception as e:
                failed_requests += 1
                logger.error(f"Stress test execution failed: {e}")
        
        # Run stress test
        while time.time() < end_time:
            # Create batch of concurrent requests
            tasks = [execute_request() for _ in range(concurrent_requests)]
            await asyncio.gather(*tasks, return_exceptions=True)
            
            # Small delay to prevent overwhelming the system
            await asyncio.sleep(0.1)
        
        actual_duration = time.time() - start_time
        
        return {
            "duration_seconds": actual_duration,
            "total_requests": total_requests,
            "successful_requests": successful_requests,
            "failed_requests": failed_requests,
            "success_rate": successful_requests / total_requests if total_requests > 0 else 0,
            "requests_per_second": total_requests / actual_duration,
            "average_execution_time": statistics.mean(execution_times) if execution_times else 0,
            "p95_execution_time": execution_times[int(len(execution_times) * 0.95)] if execution_times else 0,
            "p99_execution_time": execution_times[int(len(execution_times) * 0.99)] if execution_times else 0,
        }


# Test Cases

@pytest.fixture
async def benchmark():
    """Benchmark fixture"""
    benchmark = PerformanceBenchmark()
    await benchmark.setup()
    yield benchmark
    await benchmark.teardown()


@pytest.mark.asyncio
async def test_simple_execution_performance(benchmark):
    """Test performance of simple Python execution"""
    simple_code = """
def transform(input_data):
    return input_data.upper()
"""
    
    result = await benchmark.benchmark_execution_time(
        code=simple_code,
        input_data="hello world",
        iterations=100
    )
    
    assert "mean" in result
    assert result["mean"] < 1.0  # Should execute in less than 1 second
    assert result["successful_executions"] > 90  # At least 90% success rate
    
    print(f"Simple execution benchmark: {result}")


@pytest.mark.asyncio
async def test_json_processing_performance(benchmark):
    """Test performance of JSON processing"""
    json_code = """
def transform(input_data):
    import json
    
    # Parse input JSON
    data = json.loads(input_data)
    
    # Process data
    result = {
        "processed": True,
        "item_count": len(data.get("items", [])),
        "processed_items": []
    }
    
    for item in data.get("items", []):
        result["processed_items"].append({
            "id": item.get("id"),
            "name": item.get("name", "").upper(),
            "processed_at": "2023-01-01T00:00:00Z"
        })
    
    return json.dumps(result)
"""
    
    test_data = {
        "items": [
            {"id": i, "name": f"item_{i}"}
            for i in range(50)
        ]
    }
    
    result = await benchmark.benchmark_execution_time(
        code=json_code,
        input_data=json.dumps(test_data),
        iterations=50
    )
    
    assert "mean" in result
    assert result["mean"] < 2.0  # Should execute in less than 2 seconds
    assert result["successful_executions"] > 45  # At least 90% success rate
    
    print(f"JSON processing benchmark: {result}")


@pytest.mark.asyncio
async def test_mathematical_computation_performance(benchmark):
    """Test performance of mathematical computations"""
    math_code = """
def transform(input_data):
    import math
    
    n = int(input_data)
    results = []
    
    for i in range(n):
        results.append({
            "index": i,
            "square": i * i,
            "sqrt": math.sqrt(i + 1),
            "log": math.log(i + 1),
            "sin": math.sin(i * 0.1),
            "cos": math.cos(i * 0.1)
        })
    
    return str(len(results))
"""
    
    result = await benchmark.benchmark_execution_time(
        code=math_code,
        input_data="1000",
        iterations=20
    )
    
    assert "mean" in result
    assert result["mean"] < 3.0  # Should execute in less than 3 seconds
    assert result["successful_executions"] > 18  # At least 90% success rate
    
    print(f"Mathematical computation benchmark: {result}")


@pytest.mark.asyncio
async def test_concurrency_performance(benchmark):
    """Test concurrent execution performance"""
    concurrent_code = """
def transform(input_data):
    import json
    import time
    
    # Simulate some processing time
    time.sleep(0.1)
    
    return json.dumps({
        "processed": True,
        "input": input_data,
        "timestamp": time.time()
    })
"""
    
    result = await benchmark.benchmark_concurrency(
        code=concurrent_code,
        input_data="test data",
        concurrent_requests=10
    )
    
    assert result["concurrent_requests"] == 10
    assert result["success_rate"] > 0.8  # At least 80% success rate
    assert result["requests_per_second"] > 1.0  # At least 1 RPS
    
    print(f"Concurrency benchmark: {result}")


@pytest.mark.asyncio
async def test_memory_usage_performance(benchmark):
    """Test memory usage patterns"""
    memory_code = """
def transform(input_data):
    import json
    
    # Create some data structures
    data = []
    for i in range(1000):
        data.append({
            "id": i,
            "data": "x" * 100,  # 100 bytes per item
            "nested": {"value": i * 2}
        })
    
    return json.dumps({"count": len(data)})
"""
    
    result = await benchmark.benchmark_memory_usage(
        code=memory_code,
        input_data="test",
        iterations=20
    )
    
    assert "mean_memory_mb" in result
    assert result["mean_memory_mb"] < 50  # Should use less than 50MB
    assert result["successful_executions"] > 18  # At least 90% success rate
    
    print(f"Memory usage benchmark: {result}")


@pytest.mark.asyncio
async def test_stress_test_performance(benchmark):
    """Test system performance under stress"""
    result = await benchmark.stress_test(
        duration_seconds=30,
        concurrent_requests=3
    )
    
    assert result["duration_seconds"] >= 25  # Should run for at least 25 seconds
    assert result["total_requests"] > 50  # Should handle at least 50 requests
    assert result["success_rate"] > 0.8  # At least 80% success rate
    assert result["requests_per_second"] > 1.0  # At least 1 RPS
    
    print(f"Stress test benchmark: {result}")


@pytest.mark.asyncio
async def test_performance_monitoring_integration():
    """Test performance monitoring integration"""
    monitor = PerformanceMonitor()
    await monitor.start_monitoring()
    
    try:
        # Simulate some executions
        async with monitor.measure_execution("test-1", "def transform(x): return x", "test") as metrics:
            await asyncio.sleep(0.1)  # Simulate execution time
            metrics.output_size_bytes = 100
        
        async with monitor.measure_execution("test-2", "def transform(x): return x", "test") as metrics:
            await asyncio.sleep(0.2)  # Simulate execution time
            metrics.output_size_bytes = 200
        
        # Get metrics
        current_metrics = monitor.get_current_metrics()
        
        assert current_metrics["execution_metrics"]["total_executions"] >= 2
        assert current_metrics["monitoring_active"] is True
        
        print(f"Performance monitoring integration: {current_metrics}")
        
    finally:
        await monitor.stop_monitoring()


@pytest.mark.asyncio
async def test_performance_optimization_integration():
    """Test performance optimization integration"""
    monitor = PerformanceMonitor()
    optimizer = PerformanceOptimizer()
    
    await monitor.start_monitoring()
    await optimizer.start_optimization(monitor)
    
    try:
        # Simulate some executions with different performance characteristics
        for i in range(20):
            async with monitor.measure_execution(f"test-{i}", "def transform(x): return x", "test") as metrics:
                await asyncio.sleep(0.05)  # Fast execution
                metrics.output_size_bytes = 50
        
        # Wait for optimization to potentially kick in
        await asyncio.sleep(1)
        
        # Get optimization data
        settings = optimizer.get_current_settings()
        summary = optimizer.get_optimization_summary()
        
        assert settings["optimization_active"] is True
        assert "settings" in settings
        
        print(f"Performance optimization integration: {summary}")
        
    finally:
        await optimizer.stop_optimization()
        await monitor.stop_monitoring()


def run_benchmarks():
    """Run all performance benchmarks"""
    import asyncio
    
    async def run_all():
        benchmark = PerformanceBenchmark()
        await benchmark.setup()
        
        try:
            print("Running Performance Benchmarks...")
            print("=" * 50)
            
            # Run benchmarks
            results = {}
            
            print("1. Simple Execution Performance...")
            results['simple'] = await benchmark.benchmark_execution_time(
                "def transform(x): return x.upper()",
                "hello world",
                100
            )
            
            print("2. JSON Processing Performance...")
            results['json'] = await benchmark.benchmark_execution_time(
                """
def transform(input_data):
    import json
    data = json.loads(input_data)
    return json.dumps({"processed": True, "data": data})
                """,
                '{"test": "data"}',
                50
            )
            
            print("3. Concurrency Performance...")
            results['concurrency'] = await benchmark.benchmark_concurrency(
                "def transform(x): return x",
                "test",
                10
            )
            
            print("4. Memory Usage Performance...")
            results['memory'] = await benchmark.benchmark_memory_usage(
                """
def transform(input_data):
    data = [i for i in range(1000)]
    return str(len(data))
                """,
                "test",
                20
            )
            
            print("5. Stress Test...")
            results['stress'] = await benchmark.stress_test(30, 3)
            
            print("\nBenchmark Results:")
            print("=" * 50)
            for name, result in results.items():
                print(f"{name.title()}: {result}")
            
            return results
            
        finally:
            await benchmark.teardown()
    
    return asyncio.run(run_all())


if __name__ == "__main__":
    # Run benchmarks if executed directly
    run_benchmarks()