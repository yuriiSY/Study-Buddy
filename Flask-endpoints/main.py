from flask import Flask, request, jsonify
import psycopg2
from psycopg2.extras import Json
from dotenv import load_dotenv
import os

app = Flask(__name__)

# Load environment variables
load_dotenv()

# Database configuration
db_config = {
    'dbname': os.getenv('DB_NAME'),
    'user': os.getenv('DB_USER'),
    'password': os.getenv('DB_PASSWORD'),
    'host': os.getenv('DB_HOST'),
    'port': int(os.getenv('DB_PORT'))
}

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

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=3000)