# Multi-stage Dockerfile for HAI-Sentinel
FROM python:3.11-slim as backend

WORKDIR /app

# Install system build dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy and install python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy source code and models
COPY backend/ ./backend/
COPY ml/ ./ml/
COPY data/ ./data/
COPY models/ ./models/
COPY pytest.ini .
COPY README.md .

# Train ML models and seed initial SQLite database
RUN python -m ml.train && \
    python -m backend.database_seeder

EXPOSE 8000

ENV PORT=8000
ENV ENVIRONMENT=production

CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
