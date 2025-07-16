# Multi-stage Docker build for Python Executor Service

# Build stage
FROM python:3.11-slim as builder

# Set build arguments
ARG BUILD_DATE
ARG VERSION=1.0.0
ARG VCS_REF

# Set metadata labels
LABEL org.opencontainers.image.title="Python Executor Service"
LABEL org.opencontainers.image.description="Secure Python code execution service for prompt-spaghetti"
LABEL org.opencontainers.image.version=${VERSION}
LABEL org.opencontainers.image.created=${BUILD_DATE}
LABEL org.opencontainers.image.revision=${VCS_REF}
LABEL org.opencontainers.image.vendor="PromptSpaghetti"
LABEL org.opencontainers.image.licenses="MIT"

# Install system dependencies for building
RUN apt-get update && apt-get install -y \
    build-essential \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Create virtual environment
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Production stage
FROM python:3.11-slim as production

# Install runtime system dependencies
RUN apt-get update && apt-get install -y \
    procps \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Create non-root user for security
RUN groupadd -r executor && useradd -r -g executor executor

# Copy virtual environment from builder stage
COPY --from=builder /opt/venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Set working directory
WORKDIR /app

# Copy application code
COPY app/ ./app/
COPY openapi.yaml ./

# Create necessary directories with proper permissions
RUN mkdir -p /app/logs /app/cache && \
    chown -R executor:executor /app

# Set environment variables
ENV PYTHONPATH=/app
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PORT=8001
ENV WORKERS=1
ENV LOG_LEVEL=info
ENV MAX_MEMORY_MB=512
ENV MAX_EXECUTION_TIME=300

# Security settings
ENV PYTHONSAFEPATH=1
ENV PYTHONHASHSEED=random

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:${PORT}/health || exit 1

# Switch to non-root user
USER executor

# Expose port
EXPOSE ${PORT}

# Start command
CMD ["sh", "-c", "gunicorn app.main:app -w ${WORKERS} -k uvicorn.workers.UvicornWorker -b 0.0.0.0:${PORT} --log-level ${LOG_LEVEL} --timeout 120 --keep-alive 5 --max-requests 1000 --max-requests-jitter 100"]

# Development stage (optional)
FROM production as development

# Switch back to root for development dependencies
USER root

# Install development tools
RUN pip install --no-cache-dir \
    pytest \
    pytest-asyncio \
    pytest-cov \
    black \
    isort \
    flake8 \
    mypy

# Create development entrypoint
RUN echo '#!/bin/bash\nset -e\nif [ "$1" = "dev" ]; then\n    uvicorn app.main:app --host 0.0.0.0 --port ${PORT} --reload\nelif [ "$1" = "test" ]; then\n    pytest\nelse\n    exec "$@"\nfi' > /entrypoint.sh && \
    chmod +x /entrypoint.sh

# Switch back to executor user
USER executor

ENTRYPOINT ["/entrypoint.sh"]
CMD ["dev"]