# AI Document Q&A System

A Flask-based API that uses Ollama with Llava model to answer questions from uploaded PDF documents.

## Setup Instructions

### Prerequisites
- Docker
- PostgreSQL database

### Quick Start

1. **Go to flask-endpoints**
   ```bash
   cd flask-endpoints
   ```

2. **Update environment variables**
   Edit `docker-compose.yml` with database credentials: (for now, I have provided already)
   ```yaml
   environment:
     DB_HOST: "your_db_host"
     DB_NAME: "your_db_name" 
     DB_USER: "admin"
     DB_PASSWORD: "your_password"
   ```

4. **Deploy the application**
   ```bash
   docker-compose up --build -d
   ```

5. **Wait for services to start** 


6. **Install the model**
   ```bash
   docker-compose exec ollama ollama pull llama3
   ```

7. **Verify deployment**
   ```bash
   # Check health
   curl http://localhost:3000/
   
   # Check available models
   curl http://localhost:11434/api/tags
   ```

### API Usage

Once deployed, access the API at `http://localhost:3000`

**Endpoints:**
- `POST /upload-files` - Upload PDF files
- `POST /ask` - Ask questions about uploaded content
- `GET /file-ids` - List uploaded files
- `GET /` - Health check

### Management Commands

**Check status:**
```bash
docker-compose ps
```

**View logs:**
```bash
docker-compose logs ollama
docker-compose logs flask-api
```

**Stop services:**
```bash
docker-compose down
```

## File Structure
```
├── Dockerfile
├── docker-compose.yml
├── requirements.txt
└── main.py
```
