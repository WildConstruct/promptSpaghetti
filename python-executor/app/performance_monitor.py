"""
Performance monitoring system for Python executor
Epic 8 Story 8.1.5: Performance monitoring and optimization
"""

import time
import psutil
import asyncio
from typing import Dict, List, Optional, Any
from dataclasses import dataclass, asdict
from datetime import datetime, timedelta
from collections import defaultdict, deque
import json
import logging
from contextlib import asynccontextmanager

logger = logging.getLogger(__name__)


@dataclass
class ExecutionMetrics:
    """Metrics for a single execution"""
    execution_id: str
    start_time: float
    end_time: float
    duration: float
    cpu_usage_percent: float
    memory_usage_mb: float
    memory_peak_mb: float
    success: bool
    error_type: Optional[str] = None
    code_length: int = 0
    input_size_bytes: int = 0
    output_size_bytes: int = 0
    compile_time: float = 0.0
    validation_time: float = 0.0
    cache_hit: bool = False
    
    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


@dataclass
class AggregateMetrics:
    """Aggregate metrics over a time period"""
    total_executions: int = 0
    successful_executions: int = 0
    failed_executions: int = 0
    average_duration: float = 0.0
    median_duration: float = 0.0
    p95_duration: float = 0.0
    p99_duration: float = 0.0
    average_cpu_usage: float = 0.0
    average_memory_usage: float = 0.0
    peak_memory_usage: float = 0.0
    cache_hit_rate: float = 0.0
    error_rate: float = 0.0
    throughput_per_second: float = 0.0
    
    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


@dataclass
class SystemMetrics:
    """System-level metrics"""
    timestamp: float
    cpu_percent: float
    memory_percent: float
    memory_used_mb: float
    memory_available_mb: float
    disk_usage_percent: float
    network_bytes_sent: int
    network_bytes_recv: int
    active_connections: int
    
    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


class PerformanceMonitor:
    """
    Comprehensive performance monitoring system
    """
    
    def __init__(self, retention_hours: int = 24, sample_interval: int = 60):
        self.retention_hours = retention_hours
        self.sample_interval = sample_interval
        
        # Storage for metrics
        self.execution_metrics: deque = deque(maxlen=10000)
        self.system_metrics: deque = deque(maxlen=1440)  # 24 hours at 1-minute intervals
        self.error_counts: defaultdict = defaultdict(int)
        self.performance_alerts: List[Dict] = []
        
        # Performance thresholds
        self.thresholds = {
            'max_execution_time': 30.0,  # seconds
            'max_memory_usage': 512,      # MB
            'max_cpu_usage': 80,          # percent
            'max_error_rate': 0.05,       # 5%
            'min_cache_hit_rate': 0.3,    # 30%
        }
        
        # Monitoring state
        self.monitoring_active = False
        self.system_monitoring_task = None
        self.cleanup_task = None
        
        # Performance optimization flags
        self.optimization_enabled = True
        self.auto_scaling_enabled = False
        
    async def start_monitoring(self):
        """Start the performance monitoring system"""
        if self.monitoring_active:
            return
            
        self.monitoring_active = True
        self.system_monitoring_task = asyncio.create_task(self._system_monitoring_loop())
        self.cleanup_task = asyncio.create_task(self._cleanup_loop())
        
        logger.info("Performance monitoring started")
    
    async def stop_monitoring(self):
        """Stop the performance monitoring system"""
        self.monitoring_active = False
        
        if self.system_monitoring_task:
            self.system_monitoring_task.cancel()
        if self.cleanup_task:
            self.cleanup_task.cancel()
            
        logger.info("Performance monitoring stopped")
    
    @asynccontextmanager
    async def measure_execution(self, execution_id: str, code: str, input_data: Any):
        """Context manager for measuring execution performance"""
        start_time = time.time()
        start_cpu = psutil.cpu_percent()
        process = psutil.Process()
        start_memory = process.memory_info().rss / 1024 / 1024  # MB
        
        metrics = ExecutionMetrics(
            execution_id=execution_id,
            start_time=start_time,
            end_time=0,
            duration=0,
            cpu_usage_percent=0,
            memory_usage_mb=start_memory,
            memory_peak_mb=start_memory,
            success=False,
            code_length=len(code),
            input_size_bytes=len(str(input_data).encode('utf-8')),
            output_size_bytes=0,
        )
        
        try:
            yield metrics
            metrics.success = True
        except Exception as e:
            metrics.success = False
            metrics.error_type = type(e).__name__
            self.error_counts[metrics.error_type] += 1
            raise
        finally:
            end_time = time.time()
            end_cpu = psutil.cpu_percent()
            end_memory = process.memory_info().rss / 1024 / 1024  # MB
            
            metrics.end_time = end_time
            metrics.duration = end_time - start_time
            metrics.cpu_usage_percent = max(start_cpu, end_cpu)
            metrics.memory_peak_mb = max(start_memory, end_memory)
            
            # Store metrics
            self.execution_metrics.append(metrics)
            
            # Check for performance alerts
            await self._check_performance_alerts(metrics)
            
            logger.debug(f"Execution {execution_id} completed in {metrics.duration:.3f}s")
    
    async def _system_monitoring_loop(self):
        """Background task for system-level monitoring"""
        while self.monitoring_active:
            try:
                # Collect system metrics
                cpu_percent = psutil.cpu_percent()
                memory = psutil.virtual_memory()
                disk = psutil.disk_usage('/')
                net_io = psutil.net_io_counters()
                
                # Count active connections (approximate)
                active_connections = len(psutil.net_connections())
                
                system_metrics = SystemMetrics(
                    timestamp=time.time(),
                    cpu_percent=cpu_percent,
                    memory_percent=memory.percent,
                    memory_used_mb=memory.used / 1024 / 1024,
                    memory_available_mb=memory.available / 1024 / 1024,
                    disk_usage_percent=disk.percent,
                    network_bytes_sent=net_io.bytes_sent,
                    network_bytes_recv=net_io.bytes_recv,
                    active_connections=active_connections,
                )
                
                self.system_metrics.append(system_metrics)
                
                # Check system-level alerts
                await self._check_system_alerts(system_metrics)
                
                await asyncio.sleep(self.sample_interval)
                
            except Exception as e:
                logger.error(f"Error in system monitoring: {e}")
                await asyncio.sleep(self.sample_interval)
    
    async def _cleanup_loop(self):
        """Background task for cleaning up old metrics"""
        while self.monitoring_active:
            try:
                cutoff_time = time.time() - (self.retention_hours * 3600)
                
                # Clean up old execution metrics
                while (self.execution_metrics and 
                       self.execution_metrics[0].start_time < cutoff_time):
                    self.execution_metrics.popleft()
                
                # Clean up old system metrics
                while (self.system_metrics and 
                       self.system_metrics[0].timestamp < cutoff_time):
                    self.system_metrics.popleft()
                
                # Clean up old alerts
                self.performance_alerts = [
                    alert for alert in self.performance_alerts
                    if alert['timestamp'] > cutoff_time
                ]
                
                await asyncio.sleep(3600)  # Clean up every hour
                
            except Exception as e:
                logger.error(f"Error in cleanup: {e}")
                await asyncio.sleep(3600)
    
    async def _check_performance_alerts(self, metrics: ExecutionMetrics):
        """Check for performance alerts based on execution metrics"""
        alerts = []
        
        # Check execution time
        if metrics.duration > self.thresholds['max_execution_time']:
            alerts.append({
                'type': 'slow_execution',
                'severity': 'warning',
                'message': f"Execution {metrics.execution_id} took {metrics.duration:.2f}s",
                'threshold': self.thresholds['max_execution_time'],
                'actual': metrics.duration,
            })
        
        # Check memory usage
        if metrics.memory_peak_mb > self.thresholds['max_memory_usage']:
            alerts.append({
                'type': 'high_memory',
                'severity': 'warning',
                'message': f"Execution {metrics.execution_id} used {metrics.memory_peak_mb:.1f}MB",
                'threshold': self.thresholds['max_memory_usage'],
                'actual': metrics.memory_peak_mb,
            })
        
        # Store alerts
        for alert in alerts:
            alert['timestamp'] = time.time()
            alert['execution_id'] = metrics.execution_id
            self.performance_alerts.append(alert)
            
            logger.warning(f"Performance alert: {alert['message']}")
    
    async def _check_system_alerts(self, metrics: SystemMetrics):
        """Check for system-level performance alerts"""
        alerts = []
        
        # Check CPU usage
        if metrics.cpu_percent > self.thresholds['max_cpu_usage']:
            alerts.append({
                'type': 'high_cpu',
                'severity': 'warning',
                'message': f"System CPU usage at {metrics.cpu_percent:.1f}%",
                'threshold': self.thresholds['max_cpu_usage'],
                'actual': metrics.cpu_percent,
            })
        
        # Check memory usage
        if metrics.memory_percent > 85:
            alerts.append({
                'type': 'high_system_memory',
                'severity': 'critical',
                'message': f"System memory usage at {metrics.memory_percent:.1f}%",
                'threshold': 85,
                'actual': metrics.memory_percent,
            })
        
        # Store alerts
        for alert in alerts:
            alert['timestamp'] = time.time()
            self.performance_alerts.append(alert)
            
            logger.warning(f"System alert: {alert['message']}")
    
    def get_current_metrics(self) -> Dict[str, Any]:
        """Get current performance metrics"""
        if not self.execution_metrics:
            return {
                'execution_metrics': {},
                'system_metrics': {},
                'error_counts': dict(self.error_counts),
                'recent_alerts': []
            }
        
        # Calculate execution metrics
        recent_executions = [
            m for m in self.execution_metrics
            if m.start_time > time.time() - 3600  # Last hour
        ]
        
        if recent_executions:
            durations = [m.duration for m in recent_executions]
            durations.sort()
            
            successful = [m for m in recent_executions if m.success]
            failed = [m for m in recent_executions if not m.success]
            
            execution_stats = {
                'total_executions': len(recent_executions),
                'successful_executions': len(successful),
                'failed_executions': len(failed),
                'error_rate': len(failed) / len(recent_executions) if recent_executions else 0,
                'average_duration': sum(durations) / len(durations) if durations else 0,
                'median_duration': durations[len(durations) // 2] if durations else 0,
                'p95_duration': durations[int(len(durations) * 0.95)] if durations else 0,
                'p99_duration': durations[int(len(durations) * 0.99)] if durations else 0,
                'cache_hit_rate': sum(1 for m in recent_executions if m.cache_hit) / len(recent_executions) if recent_executions else 0,
            }
        else:
            execution_stats = {}
        
        # Get latest system metrics
        system_stats = {}
        if self.system_metrics:
            latest_system = self.system_metrics[-1]
            system_stats = latest_system.to_dict()
        
        # Get recent alerts
        recent_alerts = [
            alert for alert in self.performance_alerts
            if alert['timestamp'] > time.time() - 3600
        ]
        
        return {
            'execution_metrics': execution_stats,
            'system_metrics': system_stats,
            'error_counts': dict(self.error_counts),
            'recent_alerts': recent_alerts,
            'monitoring_active': self.monitoring_active,
            'thresholds': self.thresholds,
        }
    
    def get_historical_metrics(self, hours: int = 24) -> Dict[str, Any]:
        """Get historical performance metrics"""
        cutoff_time = time.time() - (hours * 3600)
        
        # Filter historical data
        historical_executions = [
            m for m in self.execution_metrics
            if m.start_time > cutoff_time
        ]
        
        historical_system = [
            m for m in self.system_metrics
            if m.timestamp > cutoff_time
        ]
        
        return {
            'execution_metrics': [m.to_dict() for m in historical_executions],
            'system_metrics': [m.to_dict() for m in historical_system],
            'time_range_hours': hours,
            'data_points': {
                'executions': len(historical_executions),
                'system_samples': len(historical_system),
            }
        }
    
    def get_performance_trends(self, hours: int = 24) -> Dict[str, Any]:
        """Analyze performance trends over time"""
        cutoff_time = time.time() - (hours * 3600)
        
        # Group executions by hour
        hourly_stats = defaultdict(list)
        
        for metrics in self.execution_metrics:
            if metrics.start_time > cutoff_time:
                hour = int(metrics.start_time // 3600)
                hourly_stats[hour].append(metrics)
        
        # Calculate trends
        trends = {}
        for hour, executions in hourly_stats.items():
            if executions:
                durations = [m.duration for m in executions]
                memory_usage = [m.memory_peak_mb for m in executions]
                success_rate = sum(1 for m in executions if m.success) / len(executions)
                
                trends[hour] = {
                    'timestamp': hour * 3600,
                    'execution_count': len(executions),
                    'average_duration': sum(durations) / len(durations),
                    'average_memory': sum(memory_usage) / len(memory_usage),
                    'success_rate': success_rate,
                }
        
        return {
            'hourly_trends': trends,
            'time_range_hours': hours,
        }
    
    def update_thresholds(self, new_thresholds: Dict[str, float]):
        """Update performance thresholds"""
        self.thresholds.update(new_thresholds)
        logger.info(f"Updated performance thresholds: {new_thresholds}")
    
    def get_optimization_recommendations(self) -> List[Dict[str, Any]]:
        """Get performance optimization recommendations"""
        recommendations = []
        
        if not self.execution_metrics:
            return recommendations
        
        # Analyze recent performance
        recent_executions = [
            m for m in self.execution_metrics
            if m.start_time > time.time() - 3600
        ]
        
        if not recent_executions:
            return recommendations
        
        # Check error rate
        error_rate = sum(1 for m in recent_executions if not m.success) / len(recent_executions)
        if error_rate > self.thresholds['max_error_rate']:
            recommendations.append({
                'type': 'high_error_rate',
                'severity': 'high',
                'message': f"Error rate is {error_rate:.2%}, consider improving error handling",
                'action': 'Review error patterns and add validation',
            })
        
        # Check cache hit rate
        cache_hit_rate = sum(1 for m in recent_executions if m.cache_hit) / len(recent_executions)
        if cache_hit_rate < self.thresholds['min_cache_hit_rate']:
            recommendations.append({
                'type': 'low_cache_hit_rate',
                'severity': 'medium',
                'message': f"Cache hit rate is {cache_hit_rate:.2%}, consider optimizing caching strategy",
                'action': 'Review cache configuration and key generation',
            })
        
        # Check execution time trends
        durations = [m.duration for m in recent_executions]
        if durations:
            avg_duration = sum(durations) / len(durations)
            slow_executions = [d for d in durations if d > self.thresholds['max_execution_time']]
            
            if len(slow_executions) > len(durations) * 0.1:  # More than 10% slow
                recommendations.append({
                    'type': 'slow_executions',
                    'severity': 'medium',
                    'message': f"Average execution time is {avg_duration:.2f}s with {len(slow_executions)} slow executions",
                    'action': 'Profile slow executions and optimize bottlenecks',
                })
        
        # Check memory usage
        memory_usage = [m.memory_peak_mb for m in recent_executions]
        if memory_usage:
            avg_memory = sum(memory_usage) / len(memory_usage)
            high_memory = [m for m in memory_usage if m > self.thresholds['max_memory_usage']]
            
            if len(high_memory) > len(memory_usage) * 0.1:  # More than 10% high memory
                recommendations.append({
                    'type': 'high_memory_usage',
                    'severity': 'medium',
                    'message': f"Average memory usage is {avg_memory:.1f}MB with {len(high_memory)} high-memory executions",
                    'action': 'Review memory usage patterns and optimize data structures',
                })
        
        return recommendations


# Global performance monitor instance
performance_monitor = PerformanceMonitor()


async def start_performance_monitoring():
    """Start the global performance monitoring"""
    await performance_monitor.start_monitoring()


async def stop_performance_monitoring():
    """Stop the global performance monitoring"""
    await performance_monitor.stop_monitoring()


def get_performance_metrics() -> Dict[str, Any]:
    """Get current performance metrics"""
    return performance_monitor.get_current_metrics()


def get_historical_performance_metrics(hours: int = 24) -> Dict[str, Any]:
    """Get historical performance metrics"""
    return performance_monitor.get_historical_metrics(hours)


def get_performance_trends(hours: int = 24) -> Dict[str, Any]:
    """Get performance trends"""
    return performance_monitor.get_performance_trends(hours)


def get_optimization_recommendations() -> List[Dict[str, Any]]:
    """Get performance optimization recommendations"""
    return performance_monitor.get_optimization_recommendations()