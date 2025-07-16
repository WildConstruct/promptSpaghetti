"""
JWT Authentication module for Python Executor Service
Handles token verification from the main application
"""

import jwt
import time
from typing import Dict, Any, Optional
from functools import wraps

import structlog

logger = structlog.get_logger()

# JWT configuration - in production, these would come from environment variables
JWT_SECRET_KEY = "your-secret-key-here"  # Should be same as main app
JWT_ALGORITHM = "HS256"
JWT_ISSUER = "promptspaghetti-main"
JWT_AUDIENCE = "python-executor"


class AuthenticationError(Exception):
    """Raised when authentication fails"""
    pass


def verify_jwt_token(token: str) -> Dict[str, Any]:
    """
    Verify JWT token from main application
    
    Args:
        token: JWT token string
        
    Returns:
        Dict containing user payload from token
        
    Raises:
        AuthenticationError: If token is invalid or expired
    """
    
    try:
        # Decode and verify token
        payload = jwt.decode(
            token,
            JWT_SECRET_KEY,
            algorithms=[JWT_ALGORITHM],
            issuer=JWT_ISSUER,
            audience=JWT_AUDIENCE,
            options={
                "verify_signature": True,
                "verify_exp": True,
                "verify_iat": True,
                "verify_iss": True,
                "verify_aud": True
            }
        )
        
        # Additional validation
        current_time = time.time()
        
        # Check if token is expired
        if payload.get('exp', 0) < current_time:
            raise AuthenticationError("Token expired")
        
        # Check if token is issued in the future (clock skew tolerance)
        if payload.get('iat', 0) > current_time + 30:  # 30 second tolerance
            raise AuthenticationError("Token issued in the future")
        
        # Check required claims
        required_claims = ['user_id', 'sub', 'iat', 'exp']
        for claim in required_claims:
            if claim not in payload:
                raise AuthenticationError(f"Missing required claim: {claim}")
        
        logger.info(
            "token_verified",
            user_id=payload.get('user_id'),
            sub=payload.get('sub'),
            exp=payload.get('exp')
        )
        
        return payload
        
    except jwt.ExpiredSignatureError:
        logger.warning("token_expired")
        raise AuthenticationError("Token expired")
    
    except jwt.InvalidTokenError as e:
        logger.warning("token_invalid", error=str(e))
        raise AuthenticationError(f"Invalid token: {str(e)}")
    
    except Exception as e:
        logger.error("token_verification_error", error=str(e))
        raise AuthenticationError(f"Token verification failed: {str(e)}")


def create_service_token(user_id: str, duration_seconds: int = 3600) -> str:
    """
    Create a service token for testing purposes
    In production, tokens would be created by the main application
    
    Args:
        user_id: User identifier
        duration_seconds: Token validity duration
        
    Returns:
        JWT token string
    """
    
    current_time = time.time()
    
    payload = {
        'user_id': user_id,
        'sub': user_id,
        'iat': current_time,
        'exp': current_time + duration_seconds,
        'iss': JWT_ISSUER,
        'aud': JWT_AUDIENCE,
        'scope': 'python-executor',
        'role': 'user'
    }
    
    token = jwt.encode(payload, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)
    
    logger.info("service_token_created", user_id=user_id, duration=duration_seconds)
    
    return token


def extract_user_context(payload: Dict[str, Any]) -> Dict[str, Any]:
    """
    Extract user context information from JWT payload
    
    Args:
        payload: Decoded JWT payload
        
    Returns:
        Dict containing user context for execution
    """
    
    return {
        'user_id': payload.get('user_id'),
        'username': payload.get('username'),
        'role': payload.get('role', 'user'),
        'permissions': payload.get('permissions', []),
        'tenant_id': payload.get('tenant_id'),
        'session_id': payload.get('session_id'),
        'ip_address': payload.get('ip_address'),
        'user_agent': payload.get('user_agent')
    }


def require_permission(permission: str):
    """
    Decorator to require specific permission for endpoint access
    
    Args:
        permission: Required permission string
    """
    
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            # Get user from kwargs (injected by FastAPI dependency)
            user = kwargs.get('user', {})
            user_permissions = user.get('permissions', [])
            
            if permission not in user_permissions:
                logger.warning(
                    "permission_denied",
                    user_id=user.get('user_id'),
                    required_permission=permission,
                    user_permissions=user_permissions
                )
                raise AuthenticationError(f"Permission denied: {permission}")
            
            return func(*args, **kwargs)
        return wrapper
    return decorator


def get_rate_limit_key(user_payload: Dict[str, Any]) -> str:
    """
    Generate rate limiting key based on user context
    
    Args:
        user_payload: JWT payload containing user info
        
    Returns:
        Rate limiting key string
    """
    
    # Use user_id for authenticated rate limiting
    # This allows different limits per user vs IP
    user_id = user_payload.get('user_id', 'anonymous')
    return f"user:{user_id}"


class TokenManager:
    """Manages token validation and user context extraction"""
    
    def __init__(self):
        self.token_cache = {}  # Simple in-memory cache
        self.cache_ttl = 300   # 5 minutes
        
        logger.info("token_manager_initialized")
    
    def verify_and_cache_token(self, token: str) -> Dict[str, Any]:
        """
        Verify token with caching for performance
        
        Args:
            token: JWT token string
            
        Returns:
            Dict containing user payload
        """
        
        # Check cache first
        cache_key = f"token:{hash(token)}"
        cached_result = self.token_cache.get(cache_key)
        
        if cached_result:
            # Check if cache entry is still valid
            if time.time() < cached_result['cached_until']:
                logger.debug("token_cache_hit")
                return cached_result['payload']
            else:
                # Remove expired cache entry
                del self.token_cache[cache_key]
        
        # Verify token
        payload = verify_jwt_token(token)
        
        # Cache result (but not for too long in case of revocation)
        cache_expiry = min(
            time.time() + self.cache_ttl,
            payload.get('exp', time.time() + self.cache_ttl)
        )
        
        self.token_cache[cache_key] = {
            'payload': payload,
            'cached_until': cache_expiry
        }
        
        # Clean up old cache entries periodically
        if len(self.token_cache) > 1000:
            self._cleanup_cache()
        
        logger.debug("token_verified_and_cached")
        return payload
    
    def _cleanup_cache(self):
        """Remove expired entries from token cache"""
        current_time = time.time()
        expired_keys = [
            key for key, value in self.token_cache.items()
            if value['cached_until'] < current_time
        ]
        
        for key in expired_keys:
            del self.token_cache[key]
        
        logger.info("token_cache_cleaned", removed_entries=len(expired_keys))


# Global token manager instance
token_manager = TokenManager()