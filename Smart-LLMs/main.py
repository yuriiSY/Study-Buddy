from flask import Flask, request, jsonify
import psycopg2
from psycopg2.extras import Json
from dotenv import load_dotenv
import os
import requests
import openai

app = Flask(__name__)

# Load environment variables
load_dotenv()

# Load OpenAI API key from environment variables
openai.api_key = os.getenv('OPENAI_API_KEY')

# Database configuration
db_config = {
    'dbname': os.getenv('DB_NAME'),
    'user': os.getenv('DB_USER'),
    'password': os.getenv('DB_PASSWORD'),
    'host': os.getenv('DB_HOST'),
    'port': int(os.getenv('DB_PORT'))
}


#------------------Get file data from postgres------------------#













# Route to insert embeddings
@app.route('/insert-embedding', methods=['POST'])
def insert_embedding():
    try:
        # Parse request data
        data = request.get_json()
        vector = data.get('vector')
        metadata = data.get('metadata', {})

        if not vector:
            return jsonify({'error': 'Vector is required'}), 400

        # Connect to the database
        conn = psycopg2.connect(**db_config)
        cursor = conn.cursor()

        # Insert the embedding
        cursor.execute(
            """
            INSERT INTO embeddings (vector, metadata)
            VALUES (%s, %s)
            """,
            (vector, Json(metadata))
        )

        # Commit and close
        conn.commit()
        cursor.close()
        conn.close()

        return jsonify({'message': 'Embedding inserted successfully'}), 201

    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Route to insert a fixed embedding
@app.route('/insert-fixed-embedding', methods=['POST'])
def insert_fixed_embedding():
    try:
        # Fixed embedding and metadata
        vector = [0.1] * 1536  # Create a vector with 1536 dimensions
        metadata = {"example_key": "example_value"}

        # Connect to the database
        conn = psycopg2.connect(**db_config)
        cursor = conn.cursor()

        # Insert the fixed embedding
        cursor.execute(
            """
            INSERT INTO embeddings (vector, metadata)
            VALUES (%s, %s)
            """,
            (vector, Json(metadata))
        )

        # Commit and close
        conn.commit()
        cursor.close()
        conn.close()

        return jsonify({'message': 'Fixed embedding inserted successfully'}), 201

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/get-file-from-onedrive', methods=['POST'])
def get_file_from_onedrive():
    try:
        # Get the fileId from the request body
        data = request.get_json()
        file_id = data.get('fileId')

        if not file_id:
            return jsonify({"error": "fileId is required"}), 400

        # Construct the OneDrive file URL dynamically
        file_url = f"https://graph.microsoft.com/v1.0/me/drive/items/{file_id}/content"

        # Fetch the file from OneDrive
        response = requests.get(file_url, headers={
            "Authorization": f"Bearer {os.getenv('ONEDRIVE_ACCESS_TOKEN')}"
        })
        response.raise_for_status()

        # Extract file content (assuming text content for simplicity)
        file_content = response.text

        # Generate embeddings using OpenAI
        embedding_response = openai.Embedding.create(
            input=file_content,
            model="text-embedding-ada-002"
        )
        embedding = embedding_response['data'][0]['embedding']

        # Save the embedding to the database
        conn = psycopg2.connect(**db_config)
        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT INTO embeddings (vector, metadata)
            VALUES (%s, %s)
            """,
            (embedding, Json({"fileId": file_id}))
        )
        conn.commit()
        cursor.close()
        conn.close()

        return jsonify({"message": "File processed and embedding saved successfully"}), 200

    except requests.exceptions.RequestException as e:
        return jsonify({"error": str(e)}), 500
    except openai.error.OpenAIError as e:
        return jsonify({"error": f"OpenAI API error: {str(e)}"}), 500
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=3000)