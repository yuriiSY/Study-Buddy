  FROM python:3.11-slim
  WORKDIR /app
  COPY requirements.txt ./
  RUN pip install --no-cache-dir -r requirements.txt || true
  COPY . .
  ENV FLASK_APP=app.py
  EXPOSE 5000
  CMD ["python", "-m", "flask", "run", "--host=0.0.0.0", "--port=5000"]
