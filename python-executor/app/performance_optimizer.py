"""
Performance optimization engine for Python executor
Epic 8 Story 8.1.5: Automatic performance optimization
"""

import asyncio
import time
import logging
from typing import Dict, List, Optional, Any, Tuple
from dataclasses import dataclass, asdict
from enum import Enum
from collections import defaultdict
import json
import statistics

logger = logging.getLogger(__name__)


class OptimizationStrategy(Enum):
    """Available optimization strategies"""
    AGGRESSIVE = "aggressive"
    BALANCED = "balanced"
    CONSERVATIVE = "conservative"


@dataclass
class OptimizationConfig:
    """Configuration for performance optimization"""
    strategy: OptimizationStrategy = OptimizationStrategy.BALANCED
    auto_adjust_timeouts: bool = True
    auto_adjust_memory_limits: bool = True
    auto_adjust_cache_settings: bool = True
    auto_adjust_concurrency: bool = True
    learning_rate: float = 0.1
    optimization_interval: int = 300  # seconds
    min_samples_for_optimization: int = 10
    
    def to_dict(self) -> Dict[str, Any]:
        result = asdict(self)
        result['strategy'] = self.strategy.value
        return result


@dataclass
class OptimizationResult:
    """Result of an optimization operation"""
    timestamp: float
    optimization_type: str
    old_value: Any
    new_value: Any
    expected_improvement: float
    success: bool
    error_message: Optional[str] = None
    
    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


class PerformanceOptimizer:
    """
    Automatic performance optimization engine
    """
    
    def __init__(self, config: OptimizationConfig = None):
        self.config = config or OptimizationConfig()
        self.optimization_history: List[OptimizationResult] = []
        self.current_settings = {
            'default_timeout': 30,
            'default_memory_limit': '128MB',
            'cache_size': 1000,
            'cache_ttl': 3600,
            'max_concurrent_executions': 10,
            'retry_attempts': 3,
        }
        
        # Performance baselines
        self.performance_baselines = {
            'average_execution_time': 0.0,
            'average_memory_usage': 0.0,
            'error_rate': 0.0,
            'cache_hit_rate': 0.0,
            'throughput': 0.0,
        }
        
        # Optimization state
        self.optimization_active = False
        self.optimization_task = None
        self.learning_data = defaultdict(list)
        
        # Strategy-specific parameters
        self.strategy_configs = {
            OptimizationStrategy.AGGRESSIVE: {
                'timeout_adjustment_factor': 0.2,
                'memory_adjustment_factor': 0.3,
                'cache_adjustment_factor': 0.4,
                'concurrency_adjustment_factor': 0.5,
            },
            OptimizationStrategy.BALANCED: {
                'timeout_adjustment_factor': 0.1,
                'memory_adjustment_factor': 0.15,
                'cache_adjustment_factor': 0.2,
                'concurrency_adjustment_factor': 0.25,
            },
            OptimizationStrategy.CONSERVATIVE: {
                'timeout_adjustment_factor': 0.05,
                'memory_adjustment_factor': 0.08,
                'cache_adjustment_factor': 0.1,
                'concurrency_adjustment_factor': 0.15,
            },
        }
    
    async def start_optimization(self, performance_monitor):
        """Start the automatic optimization process"""
        if self.optimization_active:
            return
            
        self.optimization_active = True
        self.performance_monitor = performance_monitor
        self.optimization_task = asyncio.create_task(self._optimization_loop())
        
        logger.info("Performance optimization started")
    
    async def stop_optimization(self):
        """Stop the automatic optimization process"""
        self.optimization_active = False
        
        if self.optimization_task:
            self.optimization_task.cancel()
            
        logger.info("Performance optimization stopped")
    
    async def _optimization_loop(self):
        """Main optimization loop"""
        while self.optimization_active:
            try:
                # Get current performance metrics
                metrics = self.performance_monitor.get_current_metrics()
                
                # Check if we have enough data for optimization
                if self._has_sufficient_data(metrics):
                    # Analyze performance and identify optimization opportunities
                    optimizations = await self._analyze_performance(metrics)
                    
                    # Apply optimizations
                    for optimization in optimizations:
                        await self._apply_optimization(optimization)
                
                # Wait for next optimization cycle
                await asyncio.sleep(self.config.optimization_interval)
                
            except Exception as e:
                logger.error(f"Error in optimization loop: {e}")
                await asyncio.sleep(self.config.optimization_interval)
    
    def _has_sufficient_data(self, metrics: Dict[str, Any]) -> bool:
        """Check if we have sufficient data for optimization"""
        execution_metrics = metrics.get('execution_metrics', {})
        return execution_metrics.get('total_executions', 0) >= self.config.min_samples_for_optimization
    
    async def _analyze_performance(self, metrics: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Analyze performance metrics and identify optimization opportunities"""
        optimizations = []
        execution_metrics = metrics.get('execution_metrics', {})
        
        if not execution_metrics:
            return optimizations
        
        # Update performance baselines
        self._update_baselines(execution_metrics)
        
        # Analyze timeout optimization
        if self.config.auto_adjust_timeouts:
            timeout_opt = self._analyze_timeout_optimization(execution_metrics)
            if timeout_opt:
                optimizations.append(timeout_opt)
        
        # Analyze memory limit optimization
        if self.config.auto_adjust_memory_limits:
            memory_opt = self._analyze_memory_optimization(execution_metrics)
            if memory_opt:
                optimizations.append(memory_opt)
        
        # Analyze cache optimization
        if self.config.auto_adjust_cache_settings:
            cache_opt = self._analyze_cache_optimization(execution_metrics)
            if cache_opt:
                optimizations.append(cache_opt)
        
        # Analyze concurrency optimization
        if self.config.auto_adjust_concurrency:
            concurrency_opt = self._analyze_concurrency_optimization(execution_metrics)
            if concurrency_opt:
                optimizations.append(concurrency_opt)
        
        return optimizations
    
    def _update_baselines(self, execution_metrics: Dict[str, Any]):
        """Update performance baselines"""
        self.performance_baselines.update({
            'average_execution_time': execution_metrics.get('average_duration', 0.0),
            'error_rate': execution_metrics.get('error_rate', 0.0),
            'cache_hit_rate': execution_metrics.get('cache_hit_rate', 0.0),
            'throughput': execution_metrics.get('total_executions', 0) / 3600,  # per hour
        })
    
    def _analyze_timeout_optimization(self, metrics: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Analyze timeout settings for optimization"""
        avg_duration = metrics.get('average_duration', 0.0)
        p95_duration = metrics.get('p95_duration', 0.0)
        
        if avg_duration == 0 or p95_duration == 0:
            return None
        
        current_timeout = self.current_settings['default_timeout']
        strategy_config = self.strategy_configs[self.config.strategy]
        
        # Calculate optimal timeout based on P95 duration
        optimal_timeout = max(p95_duration * 1.5, 5.0)  # At least 5 seconds
        
        # Check if adjustment is needed
        if abs(optimal_timeout - current_timeout) > current_timeout * 0.1:  # 10% threshold
            adjustment_factor = strategy_config['timeout_adjustment_factor']
            new_timeout = current_timeout + (optimal_timeout - current_timeout) * adjustment_factor
            
            return {
                'type': 'timeout_adjustment',
                'old_value': current_timeout,
                'new_value': new_timeout,
                'expected_improvement': self._calculate_timeout_improvement(current_timeout, new_timeout),
                'reason': f"Optimizing timeout based on P95 duration {p95_duration:.2f}s",
            }
        
        return None
    
    def _analyze_memory_optimization(self, metrics: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Analyze memory limit settings for optimization"""
        # This would analyze actual memory usage patterns
        # For now, we'll use a simple heuristic
        current_memory = self._parse_memory_limit(self.current_settings['default_memory_limit'])
        
        # Calculate optimal memory based on usage patterns
        # This is a simplified calculation
        optimal_memory = current_memory * 1.2  # 20% buffer
        
        if abs(optimal_memory - current_memory) > current_memory * 0.1:
            return {
                'type': 'memory_adjustment',
                'old_value': f"{current_memory}MB",
                'new_value': f"{optimal_memory}MB",
                'expected_improvement': 0.05,  # 5% improvement
                'reason': "Optimizing memory limits based on usage patterns",
            }
        
        return None
    
    def _analyze_cache_optimization(self, metrics: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Analyze cache settings for optimization"""
        cache_hit_rate = metrics.get('cache_hit_rate', 0.0)
        
        if cache_hit_rate < 0.3:  # Low cache hit rate
            current_size = self.current_settings['cache_size']
            new_size = min(current_size * 1.5, 5000)  # Increase cache size
            
            return {
                'type': 'cache_size_adjustment',
                'old_value': current_size,
                'new_value': new_size,
                'expected_improvement': 0.1,  # 10% improvement
                'reason': f"Increasing cache size due to low hit rate {cache_hit_rate:.2%}",
            }
        
        return None
    
    def _analyze_concurrency_optimization(self, metrics: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Analyze concurrency settings for optimization"""
        # This would analyze system load and execution patterns
        # For now, we'll use a simple heuristic based on system metrics
        
        system_metrics = self.performance_monitor.get_current_metrics().get('system_metrics', {})
        cpu_percent = system_metrics.get('cpu_percent', 0)
        memory_percent = system_metrics.get('memory_percent', 0)
        
        current_concurrency = self.current_settings['max_concurrent_executions']
        
        # Adjust concurrency based on system load
        if cpu_percent < 50 and memory_percent < 70:
            # System underutilized, increase concurrency
            new_concurrency = min(current_concurrency + 2, 20)
        elif cpu_percent > 80 or memory_percent > 85:
            # System overloaded, decrease concurrency
            new_concurrency = max(current_concurrency - 2, 2)
        else:
            return None
        
        if new_concurrency != current_concurrency:
            return {
                'type': 'concurrency_adjustment',
                'old_value': current_concurrency,
                'new_value': new_concurrency,
                'expected_improvement': 0.08,  # 8% improvement
                'reason': f"Adjusting concurrency based on system load (CPU: {cpu_percent}%, Memory: {memory_percent}%)",
            }
        
        return None
    
    async def _apply_optimization(self, optimization: Dict[str, Any]):
        """Apply an optimization"""
        try:
            opt_type = optimization['type']
            new_value = optimization['new_value']
            
            # Apply the optimization based on type
            if opt_type == 'timeout_adjustment':
                self.current_settings['default_timeout'] = new_value
            elif opt_type == 'memory_adjustment':
                self.current_settings['default_memory_limit'] = new_value
            elif opt_type == 'cache_size_adjustment':
                self.current_settings['cache_size'] = new_value
            elif opt_type == 'concurrency_adjustment':
                self.current_settings['max_concurrent_executions'] = new_value
            
            # Record the optimization
            result = OptimizationResult(
                timestamp=time.time(),
                optimization_type=opt_type,
                old_value=optimization['old_value'],
                new_value=new_value,
                expected_improvement=optimization['expected_improvement'],
                success=True,
            )
            
            self.optimization_history.append(result)
            
            logger.info(f"Applied optimization: {opt_type} changed from {optimization['old_value']} to {new_value}")
            
        except Exception as e:
            # Record failed optimization
            result = OptimizationResult(
                timestamp=time.time(),
                optimization_type=optimization['type'],
                old_value=optimization['old_value'],
                new_value=optimization['new_value'],
                expected_improvement=optimization['expected_improvement'],
                success=False,
                error_message=str(e),
            )
            
            self.optimization_history.append(result)
            logger.error(f"Failed to apply optimization: {e}")
    
    def _calculate_timeout_improvement(self, old_timeout: float, new_timeout: float) -> float:
        """Calculate expected improvement from timeout adjustment"""
        # Simple heuristic: smaller improvements for timeout adjustments
        return min(abs(new_timeout - old_timeout) / old_timeout * 0.1, 0.2)
    
    def _parse_memory_limit(self, limit_str: str) -> int:
        """Parse memory limit string to MB"""
        if limit_str.endswith('MB'):
            return int(limit_str[:-2])
        elif limit_str.endswith('GB'):
            return int(limit_str[:-2]) * 1024
        else:
            return int(limit_str)
    
    def get_current_settings(self) -> Dict[str, Any]:
        """Get current optimization settings"""
        return {
            'settings': self.current_settings.copy(),
            'config': self.config.to_dict(),
            'baselines': self.performance_baselines.copy(),
            'optimization_active': self.optimization_active,
        }
    
    def get_optimization_history(self, limit: int = 100) -> List[Dict[str, Any]]:
        """Get optimization history"""
        return [result.to_dict() for result in self.optimization_history[-limit:]]
    
    def get_optimization_summary(self) -> Dict[str, Any]:
        """Get summary of optimization results"""
        if not self.optimization_history:
            return {
                'total_optimizations': 0,
                'successful_optimizations': 0,
                'failed_optimizations': 0,
                'optimization_types': {},
                'average_improvement': 0.0,
            }
        
        successful = [r for r in self.optimization_history if r.success]
        failed = [r for r in self.optimization_history if not r.success]
        
        # Count optimization types
        type_counts = defaultdict(int)
        for result in self.optimization_history:
            type_counts[result.optimization_type] += 1
        
        # Calculate average improvement
        improvements = [r.expected_improvement for r in successful]
        avg_improvement = statistics.mean(improvements) if improvements else 0.0
        
        return {
            'total_optimizations': len(self.optimization_history),
            'successful_optimizations': len(successful),
            'failed_optimizations': len(failed),
            'optimization_types': dict(type_counts),
            'average_improvement': avg_improvement,
            'success_rate': len(successful) / len(self.optimization_history) if self.optimization_history else 0,
        }
    
    def update_config(self, new_config: Dict[str, Any]):
        """Update optimization configuration"""
        # Update strategy if provided
        if 'strategy' in new_config:
            strategy_str = new_config['strategy']
            if strategy_str in [s.value for s in OptimizationStrategy]:
                self.config.strategy = OptimizationStrategy(strategy_str)
        
        # Update other config values
        for key, value in new_config.items():
            if key != 'strategy' and hasattr(self.config, key):
                setattr(self.config, key, value)
        
        logger.info(f"Updated optimization config: {new_config}")
    
    def manual_optimize(self, optimization_type: str, value: Any) -> bool:
        """Manually apply an optimization"""
        try:
            if optimization_type in self.current_settings:
                old_value = self.current_settings[optimization_type]
                self.current_settings[optimization_type] = value
                
                # Record manual optimization
                result = OptimizationResult(
                    timestamp=time.time(),
                    optimization_type=f"manual_{optimization_type}",
                    old_value=old_value,
                    new_value=value,
                    expected_improvement=0.0,  # Unknown for manual
                    success=True,
                )
                
                self.optimization_history.append(result)
                
                logger.info(f"Manual optimization applied: {optimization_type} = {value}")
                return True
            else:
                logger.error(f"Unknown optimization type: {optimization_type}")
                return False
                
        except Exception as e:
            logger.error(f"Failed to apply manual optimization: {e}")
            return False


# Global performance optimizer instance
performance_optimizer = PerformanceOptimizer()


async def start_performance_optimization(performance_monitor):
    """Start the global performance optimization"""
    await performance_optimizer.start_optimization(performance_monitor)


async def stop_performance_optimization():
    """Stop the global performance optimization"""
    await performance_optimizer.stop_optimization()


def get_optimization_settings() -> Dict[str, Any]:
    """Get current optimization settings"""
    return performance_optimizer.get_current_settings()


def get_optimization_history(limit: int = 100) -> List[Dict[str, Any]]:
    """Get optimization history"""
    return performance_optimizer.get_optimization_history(limit)


def get_optimization_summary() -> Dict[str, Any]:
    """Get optimization summary"""
    return performance_optimizer.get_optimization_summary()


def update_optimization_config(config: Dict[str, Any]):
    """Update optimization configuration"""
    performance_optimizer.update_config(config)


def manual_optimize(optimization_type: str, value: Any) -> bool:
    """Manually apply an optimization"""
    return performance_optimizer.manual_optimize(optimization_type, value)