"""
Advanced Sandbox Security Monitor
Monitors execution environment for security violations and anomalies
"""

import asyncio
import os
import psutil
import resource
import signal
import time
import threading
from dataclasses import dataclass, field
from typing import Dict, List, Optional, Set, Callable, Any
from enum import Enum
import structlog

logger = structlog.get_logger()


class SecurityLevel(Enum):
    """Security alert levels"""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


@dataclass
class SecurityEvent:
    """Security event data"""
    timestamp: float
    level: SecurityLevel
    event_type: str
    message: str
    execution_id: str
    details: Dict[str, Any] = field(default_factory=dict)
    source: str = "sandbox_monitor"


@dataclass
class ResourceUsage:
    """Resource usage metrics"""
    cpu_percent: float
    memory_bytes: int
    memory_percent: float
    open_files: int
    threads: int
    execution_time: float


class SecurityMonitor:
    """Monitors execution security in real-time"""
    
    def __init__(self):
        self.active_monitors: Dict[str, Dict] = {}
        self.security_events: List[SecurityEvent] = []
        self.event_handlers: List[Callable[[SecurityEvent], None]] = []
        self.monitoring_thread = None
        self.shutdown_event = threading.Event()
        
        # Security thresholds
        self.thresholds = {
            'max_memory_mb': 256,
            'max_cpu_percent': 80,
            'max_open_files': 100,
            'max_threads': 10,
            'max_execution_time': 300,
            'max_memory_growth_rate': 50,  # MB/second
            'max_cpu_spike_duration': 5,   # seconds
        }
        
        # Rate limiting for security events
        self.event_rate_limits = {
            'memory_warning': 1.0,    # max 1 per second
            'cpu_warning': 1.0,       # max 1 per second
            'resource_exhaustion': 0.1,  # max 1 per 10 seconds
        }
        self.last_event_times: Dict[str, float] = {}
        
        logger.info("security_monitor_initialized")
    
    def start_monitoring(self, execution_id: str, process_pid: int, max_execution_time: int = 300):
        """Start monitoring a specific execution"""
        if execution_id in self.active_monitors:
            logger.warning("monitor_already_active", execution_id=execution_id)
            return
        
        try:
            process = psutil.Process(process_pid)
            
            self.active_monitors[execution_id] = {
                'process': process,
                'start_time': time.time(),
                'max_execution_time': max_execution_time,
                'initial_memory': process.memory_info().rss,
                'peak_memory': process.memory_info().rss,
                'cpu_spike_start': None,
                'last_cpu_check': time.time(),
                'last_memory_check': time.time(),
                'violations': []
            }
            
            logger.info(
                "monitoring_started",
                execution_id=execution_id,
                pid=process_pid,
                max_execution_time=max_execution_time
            )
            
            # Start monitoring thread if not already running
            if self.monitoring_thread is None or not self.monitoring_thread.is_alive():
                self.monitoring_thread = threading.Thread(target=self._monitoring_loop)
                self.monitoring_thread.daemon = True
                self.monitoring_thread.start()
                
        except psutil.NoSuchProcess:
            logger.error("process_not_found", execution_id=execution_id, pid=process_pid)
        except Exception as e:
            logger.error("monitoring_start_failed", execution_id=execution_id, error=str(e))
    
    def stop_monitoring(self, execution_id: str):
        """Stop monitoring a specific execution"""
        if execution_id in self.active_monitors:
            monitor_data = self.active_monitors.pop(execution_id)
            
            total_time = time.time() - monitor_data['start_time']
            peak_memory = monitor_data['peak_memory']
            violations = monitor_data['violations']
            
            logger.info(
                "monitoring_stopped",
                execution_id=execution_id,
                total_time=total_time,
                peak_memory_mb=peak_memory // (1024 * 1024),
                violations=len(violations)
            )
            
            # Log summary of violations
            if violations:
                self._emit_security_event(
                    SecurityLevel.MEDIUM,
                    "execution_violations_summary",
                    f"Execution {execution_id} had {len(violations)} security violations",
                    execution_id,
                    {"violations": violations, "total_time": total_time}
                )
    
    def get_current_usage(self, execution_id: str) -> Optional[ResourceUsage]:
        """Get current resource usage for an execution"""
        if execution_id not in self.active_monitors:
            return None
        
        monitor_data = self.active_monitors[execution_id]
        process = monitor_data['process']
        
        try:
            cpu_percent = process.cpu_percent()
            memory_info = process.memory_info()
            memory_percent = process.memory_percent()
            open_files = len(process.open_files())
            threads = process.num_threads()
            execution_time = time.time() - monitor_data['start_time']
            
            return ResourceUsage(
                cpu_percent=cpu_percent,
                memory_bytes=memory_info.rss,
                memory_percent=memory_percent,
                open_files=open_files,
                threads=threads,
                execution_time=execution_time
            )
        except psutil.NoSuchProcess:
            return None
        except Exception as e:
            logger.error("usage_check_failed", execution_id=execution_id, error=str(e))
            return None
    
    def add_event_handler(self, handler: Callable[[SecurityEvent], None]):
        """Add a security event handler"""
        self.event_handlers.append(handler)
    
    def get_recent_events(self, limit: int = 100) -> List[SecurityEvent]:
        """Get recent security events"""
        return self.security_events[-limit:]
    
    def _monitoring_loop(self):
        """Main monitoring loop"""
        while not self.shutdown_event.is_set():
            try:
                current_time = time.time()
                
                # Check each active monitor
                for execution_id in list(self.active_monitors.keys()):
                    self._check_execution_security(execution_id, current_time)
                
                # Clean up old events (keep last 1000)
                if len(self.security_events) > 1000:
                    self.security_events = self.security_events[-1000:]
                
                # Sleep for monitoring interval
                time.sleep(0.5)  # Check every 500ms
                
            except Exception as e:
                logger.error("monitoring_loop_error", error=str(e))
                time.sleep(1)
    
    def _check_execution_security(self, execution_id: str, current_time: float):
        """Check security for a specific execution"""
        monitor_data = self.active_monitors[execution_id]
        process = monitor_data['process']
        
        try:
            # Check if process still exists
            if not process.is_running():
                self.stop_monitoring(execution_id)
                return
            
            # Check execution timeout
            execution_time = current_time - monitor_data['start_time']
            if execution_time > monitor_data['max_execution_time']:
                self._emit_security_event(
                    SecurityLevel.CRITICAL,
                    "execution_timeout",
                    f"Execution exceeded maximum time limit of {monitor_data['max_execution_time']} seconds",
                    execution_id,
                    {"execution_time": execution_time, "limit": monitor_data['max_execution_time']}
                )
                self._terminate_execution(execution_id)
                return
            
            # Get current resource usage
            usage = self.get_current_usage(execution_id)
            if usage is None:
                return
            
            # Check memory usage
            memory_mb = usage.memory_bytes // (1024 * 1024)
            if memory_mb > self.thresholds['max_memory_mb']:
                self._emit_security_event(
                    SecurityLevel.HIGH,
                    "memory_limit_exceeded",
                    f"Memory usage ({memory_mb}MB) exceeded limit ({self.thresholds['max_memory_mb']}MB)",
                    execution_id,
                    {"memory_mb": memory_mb, "limit": self.thresholds['max_memory_mb']}
                )
                self._terminate_execution(execution_id)
                return
            
            # Check memory growth rate
            time_since_last_check = current_time - monitor_data['last_memory_check']
            if time_since_last_check >= 1.0:  # Check every second
                memory_growth = (usage.memory_bytes - monitor_data['peak_memory']) / time_since_last_check
                memory_growth_mb_per_sec = memory_growth / (1024 * 1024)
                
                if memory_growth_mb_per_sec > self.thresholds['max_memory_growth_rate']:
                    self._emit_security_event(
                        SecurityLevel.HIGH,
                        "rapid_memory_growth",
                        f"Memory growing at {memory_growth_mb_per_sec:.1f}MB/s (limit: {self.thresholds['max_memory_growth_rate']}MB/s)",
                        execution_id,
                        {"growth_rate": memory_growth_mb_per_sec, "limit": self.thresholds['max_memory_growth_rate']}
                    )
                
                monitor_data['peak_memory'] = max(monitor_data['peak_memory'], usage.memory_bytes)
                monitor_data['last_memory_check'] = current_time
            
            # Check CPU usage
            if usage.cpu_percent > self.thresholds['max_cpu_percent']:
                if monitor_data['cpu_spike_start'] is None:
                    monitor_data['cpu_spike_start'] = current_time
                elif current_time - monitor_data['cpu_spike_start'] > self.thresholds['max_cpu_spike_duration']:
                    self._emit_security_event(
                        SecurityLevel.MEDIUM,
                        "sustained_high_cpu",
                        f"CPU usage ({usage.cpu_percent:.1f}%) sustained above {self.thresholds['max_cpu_percent']}% for {self.thresholds['max_cpu_spike_duration']}s",
                        execution_id,
                        {"cpu_percent": usage.cpu_percent, "duration": current_time - monitor_data['cpu_spike_start']}
                    )
            else:
                monitor_data['cpu_spike_start'] = None
            
            # Check open files
            if usage.open_files > self.thresholds['max_open_files']:
                self._emit_security_event(
                    SecurityLevel.MEDIUM,
                    "too_many_open_files",
                    f"Open files ({usage.open_files}) exceeded limit ({self.thresholds['max_open_files']})",
                    execution_id,
                    {"open_files": usage.open_files, "limit": self.thresholds['max_open_files']}
                )
            
            # Check thread count
            if usage.threads > self.thresholds['max_threads']:
                self._emit_security_event(
                    SecurityLevel.MEDIUM,
                    "too_many_threads",
                    f"Thread count ({usage.threads}) exceeded limit ({self.thresholds['max_threads']})",
                    execution_id,
                    {"threads": usage.threads, "limit": self.thresholds['max_threads']}
                )
            
        except psutil.NoSuchProcess:
            self.stop_monitoring(execution_id)
        except Exception as e:
            logger.error("security_check_failed", execution_id=execution_id, error=str(e))
    
    def _emit_security_event(self, level: SecurityLevel, event_type: str, message: str, execution_id: str, details: Dict[str, Any] = None):
        """Emit a security event"""
        
        # Rate limiting
        current_time = time.time()
        if event_type in self.event_rate_limits:
            last_time = self.last_event_times.get(event_type, 0)
            if current_time - last_time < self.event_rate_limits[event_type]:
                return  # Rate limited
            self.last_event_times[event_type] = current_time
        
        event = SecurityEvent(
            timestamp=current_time,
            level=level,
            event_type=event_type,
            message=message,
            execution_id=execution_id,
            details=details or {}
        )
        
        self.security_events.append(event)
        
        # Record violation in monitor data
        if execution_id in self.active_monitors:
            self.active_monitors[execution_id]['violations'].append({
                'timestamp': current_time,
                'level': level.value,
                'type': event_type,
                'message': message
            })
        
        # Call event handlers
        for handler in self.event_handlers:
            try:
                handler(event)
            except Exception as e:
                logger.error("event_handler_failed", handler=str(handler), error=str(e))
        
        # Log the event
        logger.warning(
            "security_event",
            level=level.value,
            event_type=event_type,
            message=message,
            execution_id=execution_id,
            details=details
        )
    
    def _terminate_execution(self, execution_id: str):
        """Terminate an execution due to security violation"""
        if execution_id not in self.active_monitors:
            return
        
        monitor_data = self.active_monitors[execution_id]
        process = monitor_data['process']
        
        try:
            logger.warning("terminating_execution", execution_id=execution_id)
            
            # Try graceful termination first
            process.terminate()
            
            # Wait briefly for graceful shutdown
            try:
                process.wait(timeout=5)
            except psutil.TimeoutExpired:
                # Force kill if graceful termination fails
                logger.warning("force_killing_execution", execution_id=execution_id)
                process.kill()
            
            self.stop_monitoring(execution_id)
            
        except psutil.NoSuchProcess:
            # Process already terminated
            self.stop_monitoring(execution_id)
        except Exception as e:
            logger.error("termination_failed", execution_id=execution_id, error=str(e))
    
    def shutdown(self):
        """Shutdown the security monitor"""
        logger.info("security_monitor_shutting_down")
        
        self.shutdown_event.set()
        
        # Wait for monitoring thread to finish
        if self.monitoring_thread and self.monitoring_thread.is_alive():
            self.monitoring_thread.join(timeout=5)
        
        # Clean up any remaining monitors
        for execution_id in list(self.active_monitors.keys()):
            self.stop_monitoring(execution_id)
        
        logger.info("security_monitor_shutdown_complete")


# Global security monitor instance
security_monitor = SecurityMonitor()