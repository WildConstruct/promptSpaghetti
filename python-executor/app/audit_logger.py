"""
Comprehensive Audit Logging System
Story 8.1.3: Security audit logging for sandboxed execution environment
"""

import asyncio
import json
import time
import uuid
from dataclasses import dataclass, field, asdict
from typing import Dict, List, Optional, Any, Union
from enum import Enum
from datetime import datetime, timezone
import structlog

logger = structlog.get_logger()


class AuditEventType(Enum):
    """Types of audit events"""
    EXECUTION_START = "execution_start"
    EXECUTION_END = "execution_end"
    SECURITY_VIOLATION = "security_violation"
    RESOURCE_LIMIT_HIT = "resource_limit_hit"
    CODE_VALIDATION_FAILED = "code_validation_failed"
    AUTHENTICATION_FAILED = "authentication_failed"
    RATE_LIMIT_EXCEEDED = "rate_limit_exceeded"
    CONFIGURATION_CHANGE = "configuration_change"
    SYSTEM_ERROR = "system_error"
    CACHE_ACCESS = "cache_access"
    MODULE_IMPORT = "module_import"
    DANGEROUS_PATTERN_DETECTED = "dangerous_pattern_detected"


class AuditSeverity(Enum):
    """Severity levels for audit events"""
    INFO = "info"
    WARNING = "warning"
    ERROR = "error"
    CRITICAL = "critical"


@dataclass
class AuditEvent:
    """Comprehensive audit event data structure"""
    event_id: str
    timestamp: str
    event_type: AuditEventType
    severity: AuditSeverity
    execution_id: Optional[str]
    user_id: Optional[str]
    source_ip: Optional[str]
    user_agent: Optional[str]
    message: str
    details: Dict[str, Any] = field(default_factory=dict)
    
    # Security-specific fields
    security_violation: Optional[str] = None
    threat_level: Optional[str] = None
    mitigation_action: Optional[str] = None
    
    # Resource-specific fields
    resource_usage: Dict[str, Any] = field(default_factory=dict)
    limits_exceeded: List[str] = field(default_factory=list)
    
    # Code-specific fields
    code_hash: Optional[str] = None
    code_length: Optional[int] = None
    dangerous_patterns: List[str] = field(default_factory=list)
    
    # System context
    system_info: Dict[str, Any] = field(default_factory=dict)
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for serialization"""
        result = asdict(self)
        # Convert enums to strings
        result['event_type'] = self.event_type.value
        result['severity'] = self.severity.value
        return result
    
    def to_json(self) -> str:
        """Convert to JSON string"""
        return json.dumps(self.to_dict(), default=str)


class AuditLogger:
    """Comprehensive audit logging system"""
    
    def __init__(self, max_events: int = 10000):
        self.max_events = max_events
        self.events: List[AuditEvent] = []
        self.event_handlers: List[callable] = []
        self.session_id = str(uuid.uuid4())
        self.startup_time = time.time()
        
        # Statistics
        self.stats = {
            'total_events': 0,
            'events_by_type': {},
            'events_by_severity': {},
            'last_event_time': None,
            'security_violations': 0,
            'resource_violations': 0,
        }
        
        logger.info("audit_logger_initialized", session_id=self.session_id)
    
    def log_event(
        self,
        event_type: AuditEventType,
        severity: AuditSeverity,
        message: str,
        execution_id: Optional[str] = None,
        user_id: Optional[str] = None,
        source_ip: Optional[str] = None,
        user_agent: Optional[str] = None,
        details: Optional[Dict[str, Any]] = None,
        **kwargs
    ):
        """Log a comprehensive audit event"""
        
        event_id = str(uuid.uuid4())
        timestamp = datetime.now(timezone.utc).isoformat()
        
        # Gather system information
        system_info = {
            'session_id': self.session_id,
            'uptime_seconds': time.time() - self.startup_time,
            'total_events': self.stats['total_events'],
        }
        
        # Create audit event
        event = AuditEvent(
            event_id=event_id,
            timestamp=timestamp,
            event_type=event_type,
            severity=severity,
            execution_id=execution_id,
            user_id=user_id,
            source_ip=source_ip,
            user_agent=user_agent,
            message=message,
            details=details or {},
            system_info=system_info,
            **kwargs
        )
        
        # Add to events list
        self.events.append(event)
        
        # Maintain size limit
        if len(self.events) > self.max_events:
            self.events = self.events[-self.max_events:]
        
        # Update statistics
        self._update_stats(event)
        
        # Call event handlers
        for handler in self.event_handlers:
            try:
                handler(event)
            except Exception as e:
                logger.error("audit_handler_failed", error=str(e))
        
        # Log to structured logger
        self._log_to_structlog(event)
    
    def log_execution_start(
        self,
        execution_id: str,
        user_id: Optional[str] = None,
        source_ip: Optional[str] = None,
        code_hash: Optional[str] = None,
        code_length: Optional[int] = None,
        timeout: Optional[int] = None,
        memory_limit: Optional[str] = None,
        allowed_modules: Optional[List[str]] = None
    ):
        """Log execution start event"""
        details = {
            'timeout': timeout,
            'memory_limit': memory_limit,
            'allowed_modules': allowed_modules,
        }
        
        self.log_event(
            event_type=AuditEventType.EXECUTION_START,
            severity=AuditSeverity.INFO,
            message=f"Code execution started: {execution_id}",
            execution_id=execution_id,
            user_id=user_id,
            source_ip=source_ip,
            details=details,
            code_hash=code_hash,
            code_length=code_length
        )
    
    def log_execution_end(
        self,
        execution_id: str,
        success: bool,
        execution_time: float,
        memory_used: str,
        cpu_usage: float,
        security_violations: int = 0,
        error_type: Optional[str] = None,
        error_message: Optional[str] = None
    ):
        """Log execution end event"""
        severity = AuditSeverity.INFO if success else AuditSeverity.ERROR
        
        details = {
            'success': success,
            'execution_time': execution_time,
            'memory_used': memory_used,
            'cpu_usage': cpu_usage,
            'security_violations': security_violations,
            'error_type': error_type,
            'error_message': error_message,
        }
        
        resource_usage = {
            'execution_time': execution_time,
            'memory_used': memory_used,
            'cpu_usage': cpu_usage,
        }
        
        message = f"Code execution completed: {execution_id}"
        if not success:
            message += f" with error: {error_type}"
        
        self.log_event(
            event_type=AuditEventType.EXECUTION_END,
            severity=severity,
            message=message,
            execution_id=execution_id,
            details=details,
            resource_usage=resource_usage
        )
    
    def log_security_violation(
        self,
        execution_id: str,
        violation_type: str,
        threat_level: str,
        violation_details: str,
        mitigation_action: str,
        user_id: Optional[str] = None,
        source_ip: Optional[str] = None
    ):
        """Log security violation event"""
        details = {
            'violation_type': violation_type,
            'violation_details': violation_details,
            'threat_level': threat_level,
            'mitigation_action': mitigation_action,
        }
        
        severity = AuditSeverity.CRITICAL if threat_level == 'high' else AuditSeverity.ERROR
        
        self.log_event(
            event_type=AuditEventType.SECURITY_VIOLATION,
            severity=severity,
            message=f"Security violation detected: {violation_type}",
            execution_id=execution_id,
            user_id=user_id,
            source_ip=source_ip,
            details=details,
            security_violation=violation_type,
            threat_level=threat_level,
            mitigation_action=mitigation_action
        )
    
    def log_resource_limit_hit(
        self,
        execution_id: str,
        resource_type: str,
        limit_value: str,
        current_value: str,
        action_taken: str
    ):
        """Log resource limit violation"""
        details = {
            'resource_type': resource_type,
            'limit_value': limit_value,
            'current_value': current_value,
            'action_taken': action_taken,
        }
        
        self.log_event(
            event_type=AuditEventType.RESOURCE_LIMIT_HIT,
            severity=AuditSeverity.WARNING,
            message=f"Resource limit exceeded: {resource_type}",
            execution_id=execution_id,
            details=details,
            limits_exceeded=[resource_type]
        )
    
    def log_code_validation_failed(
        self,
        execution_id: str,
        validation_errors: List[str],
        dangerous_patterns: List[str],
        code_hash: Optional[str] = None,
        user_id: Optional[str] = None,
        source_ip: Optional[str] = None
    ):
        """Log code validation failure"""
        details = {
            'validation_errors': validation_errors,
            'dangerous_patterns': dangerous_patterns,
            'error_count': len(validation_errors),
            'pattern_count': len(dangerous_patterns),
        }
        
        self.log_event(
            event_type=AuditEventType.CODE_VALIDATION_FAILED,
            severity=AuditSeverity.ERROR,
            message=f"Code validation failed: {len(validation_errors)} errors",
            execution_id=execution_id,
            user_id=user_id,
            source_ip=source_ip,
            details=details,
            code_hash=code_hash,
            dangerous_patterns=dangerous_patterns
        )
    
    def log_authentication_failed(
        self,
        user_id: Optional[str],
        source_ip: Optional[str],
        failure_reason: str,
        user_agent: Optional[str] = None
    ):
        """Log authentication failure"""
        details = {
            'failure_reason': failure_reason,
            'timestamp': time.time(),
        }
        
        self.log_event(
            event_type=AuditEventType.AUTHENTICATION_FAILED,
            severity=AuditSeverity.ERROR,
            message=f"Authentication failed: {failure_reason}",
            user_id=user_id,
            source_ip=source_ip,
            user_agent=user_agent,
            details=details
        )
    
    def log_rate_limit_exceeded(
        self,
        user_id: Optional[str],
        source_ip: Optional[str],
        endpoint: str,
        limit_type: str,
        current_rate: str,
        limit_value: str
    ):
        """Log rate limit exceeded"""
        details = {
            'endpoint': endpoint,
            'limit_type': limit_type,
            'current_rate': current_rate,
            'limit_value': limit_value,
        }
        
        self.log_event(
            event_type=AuditEventType.RATE_LIMIT_EXCEEDED,
            severity=AuditSeverity.WARNING,
            message=f"Rate limit exceeded: {limit_type} for {endpoint}",
            user_id=user_id,
            source_ip=source_ip,
            details=details
        )
    
    def log_dangerous_pattern_detected(
        self,
        execution_id: str,
        pattern: str,
        pattern_type: str,
        code_context: str,
        action_taken: str
    ):
        """Log dangerous pattern detection"""
        details = {
            'pattern': pattern,
            'pattern_type': pattern_type,
            'code_context': code_context,
            'action_taken': action_taken,
        }
        
        self.log_event(
            event_type=AuditEventType.DANGEROUS_PATTERN_DETECTED,
            severity=AuditSeverity.WARNING,
            message=f"Dangerous pattern detected: {pattern_type}",
            execution_id=execution_id,
            details=details,
            dangerous_patterns=[pattern]
        )
    
    def add_event_handler(self, handler: callable):
        """Add an event handler"""
        self.event_handlers.append(handler)
    
    def remove_event_handler(self, handler: callable):
        """Remove an event handler"""
        if handler in self.event_handlers:
            self.event_handlers.remove(handler)
    
    def get_events(
        self,
        event_type: Optional[AuditEventType] = None,
        severity: Optional[AuditSeverity] = None,
        execution_id: Optional[str] = None,
        user_id: Optional[str] = None,
        limit: int = 100,
        since: Optional[str] = None
    ) -> List[AuditEvent]:
        """Get filtered audit events"""
        events = self.events
        
        # Apply filters
        if event_type:
            events = [e for e in events if e.event_type == event_type]
        
        if severity:
            events = [e for e in events if e.severity == severity]
        
        if execution_id:
            events = [e for e in events if e.execution_id == execution_id]
        
        if user_id:
            events = [e for e in events if e.user_id == user_id]
        
        if since:
            events = [e for e in events if e.timestamp >= since]
        
        # Sort by timestamp (newest first) and limit
        events.sort(key=lambda x: x.timestamp, reverse=True)
        return events[:limit]
    
    def get_statistics(self) -> Dict[str, Any]:
        """Get audit statistics"""
        return {
            'session_id': self.session_id,
            'startup_time': self.startup_time,
            'uptime_seconds': time.time() - self.startup_time,
            'total_events': self.stats['total_events'],
            'events_by_type': self.stats['events_by_type'],
            'events_by_severity': self.stats['events_by_severity'],
            'security_violations': self.stats['security_violations'],
            'resource_violations': self.stats['resource_violations'],
            'last_event_time': self.stats['last_event_time'],
            'current_event_count': len(self.events),
        }
    
    def export_events(
        self,
        format: str = 'json',
        event_type: Optional[AuditEventType] = None,
        since: Optional[str] = None
    ) -> str:
        """Export audit events in specified format"""
        events = self.get_events(event_type=event_type, since=since, limit=None)
        
        if format == 'json':
            return json.dumps([event.to_dict() for event in events], indent=2, default=str)
        elif format == 'csv':
            # Simple CSV format
            lines = ['event_id,timestamp,event_type,severity,execution_id,message']
            for event in events:
                lines.append(f"{event.event_id},{event.timestamp},{event.event_type.value},{event.severity.value},{event.execution_id or ''},{event.message}")
            return '\n'.join(lines)
        else:
            raise ValueError(f"Unsupported format: {format}")
    
    def _update_stats(self, event: AuditEvent):
        """Update internal statistics"""
        self.stats['total_events'] += 1
        self.stats['last_event_time'] = event.timestamp
        
        # Update by type
        event_type = event.event_type.value
        self.stats['events_by_type'][event_type] = self.stats['events_by_type'].get(event_type, 0) + 1
        
        # Update by severity
        severity = event.severity.value
        self.stats['events_by_severity'][severity] = self.stats['events_by_severity'].get(severity, 0) + 1
        
        # Update violation counts
        if event.event_type == AuditEventType.SECURITY_VIOLATION:
            self.stats['security_violations'] += 1
        elif event.event_type == AuditEventType.RESOURCE_LIMIT_HIT:
            self.stats['resource_violations'] += 1
    
    def _log_to_structlog(self, event: AuditEvent):
        """Log event to structured logger"""
        log_data = {
            'event_id': event.event_id,
            'audit_event_type': event.event_type.value,
            'audit_severity': event.severity.value,
            'execution_id': event.execution_id,
            'user_id': event.user_id,
            'source_ip': event.source_ip,
            'message': event.message,
        }
        
        # Add details if present
        if event.details:
            log_data.update(event.details)
        
        # Choose log level based on severity
        if event.severity == AuditSeverity.INFO:
            logger.info("audit_event", **log_data)
        elif event.severity == AuditSeverity.WARNING:
            logger.warning("audit_event", **log_data)
        elif event.severity == AuditSeverity.ERROR:
            logger.error("audit_event", **log_data)
        elif event.severity == AuditSeverity.CRITICAL:
            logger.critical("audit_event", **log_data)
    
    def clear_events(self):
        """Clear all audit events"""
        logger.warning("audit_events_cleared", event_count=len(self.events))
        self.events.clear()
        
        # Reset statistics
        self.stats = {
            'total_events': 0,
            'events_by_type': {},
            'events_by_severity': {},
            'last_event_time': None,
            'security_violations': 0,
            'resource_violations': 0,
        }


# Global audit logger instance
audit_logger = AuditLogger()