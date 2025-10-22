
## Install one by ine in bash
```bash
docker exec -it ollama-chatbot ollama pull llama3.2:3b
docker exec -it ollama-chatbot ollama list  # Should list llama3.2:3b
docker compose up

```
## Run in other terminal

```bash
pip install -r requirements.txt
python embeddings.py # create vectors.json from ur file
python chatbot.py
```