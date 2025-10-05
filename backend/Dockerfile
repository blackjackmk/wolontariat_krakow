# Backend Dockerfile
FROM python:3.12-slim

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Install fonts with full Polish glyph support (DejaVu / Liberation)
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
       fonts-dejavu-core fonts-liberation \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["gunicorn", "wolontariat_krakow.wsgi:application", "--bind", "0.0.0.0:8000"]
