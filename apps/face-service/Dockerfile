FROM python:3.10-slim-bookworm

WORKDIR /app

# Install system dependencies for OpenCV and build tools
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    libgl1 \
    libglib2.0-0 \
    libsm6 \
    libxrender1 \
    libxext6 \
    build-essential \
    cmake \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Upgrade pip
RUN pip install --upgrade pip

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY main.py .

EXPOSE 8000

# Model will be downloaded on first request
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
