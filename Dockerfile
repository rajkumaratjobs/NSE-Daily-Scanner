# Dockerfile for Daily NSE Jewellery Scanner
# Optimized for Google Cloud Run / Containerized Daemon / Replit

FROM python:3.11-slim

# Avoid buffering for immediate container logging
ENV PYTHONUNBUFFERED=1
ENV TZ=Asia/Kolkata

WORKDIR /app

# Install system utilities and timezone data
RUN apt-get update && apt-get install -y --no-install-recommends \
    tzdata \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Set Indian Standard Time
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

# Install Python requirements
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application source files
COPY config.json .
COPY scanner.py .
COPY main.py .
COPY README.md .

# Run daemon by default
CMD ["python", "main.py", "--daemon"]
