# Flask Endpoints Setup Guide

1. **Install Dependencies**:
   Install the required Python packages using `pip`:
   ```bash
   pip install -r requirements.txt
   ```

2. **Set Up Environment Variables**:
   Create a `.env` file in the `Flask-endpoints` directory and add the following:
   ```env
   API_KEY=your_gemini_api_key
   ```
   Replace the placeholders with your actual credentials.
   You can create an API key from [Google AI Studio](https://aistudio.google.com/api-keys)

3. **Run the Flask Application**:
   Start the Flask server:
   ```bash
   python main.py
   ```

---

## Basic Information About Flask Endpoints

### Available Endpoints

1. **Upload file**:
   - **URL**: `/upload`
   - **Method**: `POST`
   - **Description**: Upload file type '.pdf' , '.docx' or '.pptx'.
   - **Request Body (form-data)**:
        | Key  | Type | Description         | Example Value   |
        |------|------|---------------------|-----------------|
        | file | File | The file to upload. | `your_file.pdf` |

2. **Chat from uploaded file**:
   - **URL**: `/ask`
   - **Method**: `POST`
   - **Description**: Answers the question provided by the user.
   - **Request Body**:
     ```json
     {
       "question": "your question"
     }
     ```

3. **Explain deep concepts**:
   - **URL**: `/explain`
   - **Method**: `POST`
   - **Description**: Explains the concept in a deeper and practical way.
   - **Request Body**:
     ```json
     {
       "concept": "concept name"
     }
     ```

4. **Health Check**:
   - **URL**: `/analyze_notes`
   - **Method**: `GET`
   - **Description**: Gives an outline of your notes.

---
