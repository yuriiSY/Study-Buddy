FROM python:3.12-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy app files
COPY . .

# Expose port if you want to run a web server later (optional for now)
EXPOSE 8000

# Run the script
CMD ["python", "chatbot.py"]