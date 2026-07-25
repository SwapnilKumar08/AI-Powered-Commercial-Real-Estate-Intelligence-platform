FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app
COPY services/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt
COPY services ./services

CMD ["python", "-m", "uvicorn", "services.api:app", "--host", "0.0.0.0", "--port", "8080"]

