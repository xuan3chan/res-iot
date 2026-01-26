# Face Service

Python microservice for face embedding extraction using InsightFace.

## Endpoints

- `GET /health` - Health check
- `POST /extract-vector` - Extract face embedding from image
- `POST /compare-vectors` - Compare two face vectors

## Local Development

```bash
pip install -r requirements.txt
python main.py
```

## Docker

```bash
docker build -t face-service .
docker run -p 8000:8000 face-service
```
