import uuid
import subprocess
import tempfile
import io,time
import os
import base64
import random
from datetime import datetime
import uvicorn
import boto3
import fitz
import pdfplumber
from PIL import Image
from docx import Document
from pptx import Presentation
import openpyxl
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter

from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel

from groq import Groq
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_postgres import PGVector
from langchain_text_splitters import RecursiveCharacterTextSplitter
from sentence_transformers import SentenceTransformer
import psycopg2 as db
from dotenv import load_dotenv
from fastapi import Query

# ---------------- ENV & CONFIG ----------------
load_dotenv()

EMBED_MODEL_NAME = "all-MiniLM-L6-v2"
CLIP_MODEL_NAME = "clip-ViT-B-32"
GROQ_API_KEY = os.environ.get("GROQ_API_KEY")
GROQ_MODEL = os.environ.get("GROQ_MODEL", "meta-llama/llama-4-scout-17b-16e-instruct")
TABLE_NAME = "langchain_pg_embedding"

DB_HOST = os.environ.get("DB_HOST")
DB_PORT = os.environ.get("DB_PORT")
DB_NAME = os.environ.get("DB_NAME")
DB_USER = os.environ.get("DB_USER")
DB_PASSWORD = os.environ.get("DB_PASSWORD")

S3_BUCKET_NAME = os.environ.get("S3_BUCKET_NAME")
AWS_REGION = os.environ.get("AWS_REGION")
AWS_ACCESS_KEY_ID = os.environ.get("AWS_ACCESS_KEY_ID")
AWS_SECRET_ACCESS_KEY = os.environ.get("AWS_SECRET_ACCESS_KEY")

# ---------------- FASTAPI APP ----------------
app = FastAPI(title="Study Buddy API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# ---------- Connect to hosted PostgreSQL ----------
print("Connecting to hosted PostgreSQL...")
try:
    conn = db.connect(
        host=DB_HOST,
        port=DB_PORT,
        dbname=DB_NAME,
        user=DB_USER,
        password=DB_PASSWORD,
        sslmode="require"
    )
    print("Connected to PostgreSQL!")
except Exception as e:
    print("Failed to connect:", e)
    raise

# Load embedding models
text_embeddings = HuggingFaceEmbeddings(model_name=EMBED_MODEL_NAME)
clip_model = SentenceTransformer('sentence-transformers/clip-ViT-B-32')

EMBED_DIM = len(text_embeddings.embed_query("test"))
CLIP_EMBED_DIM = 512
print(f"Text embedding dimension: {EMBED_DIM}")
print(f"CLIP embedding dimension: {CLIP_EMBED_DIM}")

# ---------------- S3 ----------------
s3 = boto3.client(
    "s3",
    aws_access_key_id=AWS_ACCESS_KEY_ID,
    aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
    region_name=AWS_REGION
)
# ---------- PGVector ----------
vector_store = None
clip_vector_store = None

def get_vector_store():
    global vector_store
    if vector_store is None:
        vector_store = PGVector(
            connection=f"postgresql+psycopg2://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}?sslmode=require",
            collection_name=TABLE_NAME,
            embeddings=text_embeddings,
            distance_strategy="cosine",
            use_jsonb=True,
            pre_delete_collection=False
        )
    return vector_store

# Import Office document libraries
try:
    DOCX_SUPPORT = True
except ImportError:
    DOCX_SUPPORT = False
    print("DOCX support disabled: install python-docx")

try:
    PPTX_SUPPORT = True
except ImportError:
    PPTX_SUPPORT = False
    print("PPTX support disabled: install python-pptx")

try:
    XLSX_SUPPORT = True
except ImportError:
    XLSX_SUPPORT = False
    print("XLSX support disabled: install openpyxl")

# Import PDF processing library
try:
    PDF_SUPPORT = True
except ImportError:
    PDF_SUPPORT = False
    print("PDF support disabled: install pdfplumber")


def get_clip_vector_store():
    global clip_vector_store
    if clip_vector_store is None:
        class ClipEmbeddings:
            def embed_documents(self, texts):
                return [self.embed_query(text) for text in texts]
            
            def embed_query(self, text):
                return clip_model.encode([text])[0].tolist()
        
        clip_embeddings = ClipEmbeddings()
        clip_vector_store = PGVector(
            connection=f"postgresql+psycopg2://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}?sslmode=require",
            collection_name=f"{TABLE_NAME}_clip",
            embeddings=clip_embeddings,
            distance_strategy="cosine",
            use_jsonb=True,
            pre_delete_collection=False,
            embedding_length=512
        )
    return clip_vector_store

def retrieve_by_file_ids(file_ids, query, k=4):
    store = get_vector_store()
    clip_store = get_clip_vector_store()
    
    if not file_ids:
        return [], []
    
    filter_cond = {"file_id": file_ids}
    
    text_docs = store.similarity_search(query, k=k, filter=filter_cond)
    text_results = [doc.page_content for doc in text_docs]
    
    image_docs = clip_store.similarity_search(query, k=2, filter=filter_cond)
    image_results = [doc.page_content for doc in image_docs]
    
    return text_results, image_results


# ---------------- DOCUMENT PROCESSING FUNCTIONS ----------------

def convert_office_to_pdf(file_stream, filename):
    """Convert Office files to PDF using local LibreOffice"""
    try:
        # Save uploaded file to temp location
        with tempfile.NamedTemporaryFile(delete=False, suffix='.tmp') as temp_input:
            file_stream.seek(0)
            temp_input.write(file_stream.read())
            temp_input_path = temp_input.name
        
        # Convert using LibreOffice
        cmd = [
            'libreoffice', '--headless', '--convert-to', 'pdf', 
            '--outdir', '/tmp', temp_input_path
        ]
        
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
        
        if result.returncode == 0:
            # Find the converted PDF
            pdf_path = temp_input_path.replace('.tmp', '.pdf')
            if os.path.exists(pdf_path):
                with open(pdf_path, 'rb') as pdf_file:
                    pdf_data = pdf_file.read()
                
                # Cleanup temporary files
                os.unlink(temp_input_path)
                os.unlink(pdf_path)
                
                return pdf_data, None
        
        return None, f"Conversion failed: {result.stderr}"
        
    except subprocess.TimeoutExpired:
        return None, "Conversion timeout - LibreOffice took too long"
    except Exception as e:
        return None, f"Conversion error: {str(e)}"

def extract_text_from_pdf(file_stream):
    """Extract text from PDF file"""
    text = ""
    try:
        with pdfplumber.open(file_stream) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
        return text.strip()
    except Exception as e:
        print(f"Error extracting PDF text: {e}")
        return ""

def extract_images_from_pdf(file_stream):
    """Extract images from PDF using PyMuPDF"""
    images = []
    try:
        doc = fitz.open(stream=file_stream.read(), filetype="pdf")
        for page_num in range(len(doc)):
            page = doc[page_num]
            image_list = page.get_images()
            
            for img_index, img in enumerate(image_list):
                xref = img[0]
                pix = fitz.Pixmap(doc, xref)
                
                if pix.n - pix.alpha < 4:  # RGB
                    img_data = pix.tobytes("png")
                    img_pil = Image.open(io.BytesIO(img_data))
                    images.append(img_pil)
                
                pix = None
        doc.close()
    except Exception as e:
        print(f"Error extracting images from PDF: {e}")
    return images

def extract_text_from_docx(file_stream):
    """Extract text from Word documents"""
    try:
        doc = Document(file_stream)
        text = ""
        for paragraph in doc.paragraphs:
            if paragraph.text.strip():
                text += paragraph.text + "\n"
        
        # Extract tables
        for table in doc.tables:
            for row in table.rows:
                row_text = " | ".join([cell.text.strip() for cell in row.cells if cell.text.strip()])
                if row_text:
                    text += f"Table: {row_text}\n"
        
        return text.strip()
    except Exception as e:
        print(f"Error extracting DOCX text: {e}")
        return ""

def extract_text_from_pptx(file_stream):
    """Extract text from PowerPoint presentations"""
    try:
        prs = Presentation(file_stream)
        text = ""
        
        for slide_num, slide in enumerate(prs.slides):
            text += f"--- Slide {slide_num + 1} ---\n"
            for shape in slide.shapes:
                if hasattr(shape, "text") and shape.text.strip():
                    text += shape.text + "\n"
        
        return text.strip()
    except Exception as e:
        print(f"Error extracting PPTX text: {e}")
        return ""

def extract_text_from_xlsx(file_stream):
    """Extract text from Excel files"""
    try:
        wb = openpyxl.load_workbook(file_stream)
        text = ""
        
        for sheet_name in wb.sheetnames:
            sheet = wb[sheet_name]
            text += f"--- Sheet: {sheet_name} ---\n"
            
            for row in sheet.iter_rows(values_only=True):
                row_data = [str(cell) if cell is not None else "" for cell in row]
                row_text = " | ".join(row_data)
                if row_text.strip():
                    text += row_text + "\n"
        
        return text.strip()
    except Exception as e:
        print(f"Error extracting XLSX text: {e}")
        return ""

def generate_image_description(image):
    """Generate text description of image using Groq for CLIP indexing"""
    client = Groq(api_key=GROQ_API_KEY)
    
    try:
        img_byte_arr = io.BytesIO()
        image.save(img_byte_arr, format='PNG')
        img_b64 = base64.b64encode(img_byte_arr.getvalue()).decode('utf-8')
        
        response = client.chat.completions.create(
            model=GROQ_MODEL,
            messages=[{
                "role": "user",
                "content": [
                    {"type": "text", "text": "Describe this image in detail for search purposes. Focus on content, objects, text, and visual elements:"},
                    {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{img_b64}"}}
                ]
            }],
            max_tokens=150,
            temperature=0.1
        )
        return response.choices[0].message.content
    except Exception as e:
        print(f"Error generating image description: {e}")
        return "Image content"

def convert_image_or_text_to_pdf(file_stream, filename):
    """
    Converts image or text files to PDF.
    Supported:
    - png, jpg, jpeg, bmp, gif (via PIL image -> PDF)
    - txt (text -> PDF)
    """
    ext = filename.lower().split('.')[-1]

    # IMAGE → PDF
    if ext in ["png", "jpg", "jpeg", "bmp", "gif"]:
        try:
            image = Image.open(file_stream)
            rgb_image = image.convert("RGB")
            pdf_out = io.BytesIO()
            rgb_image.save(pdf_out, format="PDF")
            return pdf_out.getvalue(), None
        except Exception as e:
            return None, f"Image → PDF failed: {e}"

    # TEXT → PDF
    if ext == "txt":
        try:
            text = file_stream.read().decode("utf-8", errors="ignore")
            pdf_out = io.BytesIO()
            c = canvas.Canvas(pdf_out, pagesize=letter)

            y = 750
            for line in text.split("\n"):
                c.drawString(30, y, line)
                y -= 15
                if y < 40:
                    c.showPage()
                    y = 750

            c.save()
            return pdf_out.getvalue(), None
        except Exception as e:
            return None, f"Text → PDF failed: {e}"

    return None, "Unsupported file type for conversion to PDF"

def process_file_content(file, filename):
    """
    Process uploaded file and return:
    - text content
    - error message if any
    - list of images (PIL.Image)
    - PDF bytes (if converted or original PDF)
    """
    file_extension = filename.lower().split('.')[-1] if '.' in filename else ''
    file_bytes = file.read()
    file_stream = io.BytesIO(file_bytes)
    
    # ---------- Office files (convert to PDF first) ----------
    office_types = ['docx', 'pptx', 'xlsx', 'doc', 'ppt', 'xls']
    if file_extension in office_types:
        print(f"Converting {file_extension.upper()} to PDF for full processing...")
        pdf_data, error = convert_office_to_pdf(file_stream, filename)
        if error:
            print(f"Office → PDF failed: {error}, falling back to native extraction...")
            # Fallback text extraction
            try:
                file_stream.seek(0)
                if file_extension == 'docx' and DOCX_SUPPORT:
                    return extract_text_from_docx(file_stream), f"Fallback text only. {error}", [], None
                elif file_extension == 'pptx' and PPTX_SUPPORT:
                    return extract_text_from_pptx(file_stream), f"Fallback text only. {error}", [], None
                elif file_extension == 'xlsx' and XLSX_SUPPORT:
                    return extract_text_from_xlsx(file_stream), f"Fallback text only. {error}", [], None
                else:
                    return None, f"No extraction fallback available. {error}", [], None
            except Exception as e:
                return None, f"Fallback extraction failed: {e}", [], None

        # Success: extract text and images from PDF
        pdf_stream = io.BytesIO(pdf_data)
        text = extract_text_from_pdf(io.BytesIO(pdf_data))
        pdf_stream.seek(0)
        images = extract_images_from_pdf(io.BytesIO(pdf_data))
        return text, None, images, pdf_data

    # ---------- PDF files ----------
    elif file_extension == 'pdf':
        if not PDF_SUPPORT:
            return None, "PDF support not available. Install pdfplumber.", [], None
        
        pdf_bytes = file_bytes
        text = extract_text_from_pdf(io.BytesIO(pdf_bytes))
        images = extract_images_from_pdf(io.BytesIO(pdf_bytes))
        return text, None, images, pdf_bytes

    # ---------- Image or text files → PDF ----------
    elif file_extension in ['png', 'jpg', 'jpeg', 'bmp', 'gif', 'txt']:
        pdf_data, error = convert_image_or_text_to_pdf(io.BytesIO(file_bytes), filename)
        if error:
            return None, error, [], None
        
        # For images, we usually don’t extract again
        text = extract_text_from_pdf(io.BytesIO(pdf_data)) if file_extension == 'txt' else ""
        images = []  # images are embedded in PDF
        return text, None, images, pdf_data

    # ---------- Plain text fallback ----------
    else:
        try:
            return file_bytes.decode("utf-8", errors="ignore"), None, [], None
        except Exception as e:
            return None, f"Unsupported file type: {file_extension}. {e}", [], None


# ---------- LLM (Groq API call) ----------

def groq_chat(context: str, question: str, images: list = None) -> str:
    client = Groq(api_key=GROQ_API_KEY)
    
    messages = [
        {
            "role": "system", 
            "content": "You are a helpful AI using student notes as a context you teach students. Use your knowledge/logic to explain in simple way only if required. Use the provided context to answer questions. never ever answer question unrelated to notes. Always cite your sources."
        }
    ]
    
    user_content = [{"type": "text", "text": f"CONTEXT:\n{context}\n\nQUESTION:\n{question}\n\nAnswer based on the context above. End with: SOURCE: [file(s)]"}]
    
    if images and len(images) > 0:
        for img in images:
            try:
                img_byte_arr = io.BytesIO()
                img.save(img_byte_arr, format='PNG')
                img_b64 = base64.b64encode(img_byte_arr.getvalue()).decode('utf-8')
                user_content.append({
                    "type": "image_url",
                    "image_url": {"url": f"data:image/jpeg;base64,{img_b64}"}
                })
            except Exception as e:
                print(f"Error converting image to base64: {e}")
                continue
    
    messages.append({"role": "user", "content": user_content})
    
    try:
        response = client.chat.completions.create(
            model=GROQ_MODEL,
            messages=messages,
            max_tokens=2048,
            temperature=0.1
        )
        
        content = response.choices[0].message.content
        image_info = f" with {len(images)} images" if images else ""
        print(f"Successfully got response from {GROQ_MODEL}{image_info}")
        return content
        
    except Exception as e:
        error_msg = f"Groq API error: {e}"
        print(error_msg)
        return error_msg
    
# Chat History Functions
def save_chat_history(file_id, question, answer):
    """Save question-answer to chat history"""
    try:
        cur = conn.cursor()
        cur.execute(
            "INSERT INTO chat_history (file_id, question, answer, timestamp) VALUES (%s, %s, %s, %s)",
            (file_id, question, answer, datetime.now())
        )
        conn.commit()
        cur.close()
        print(f"Chat history saved for file: {file_id}")
        return True
    except Exception as e:
        print(f"Error saving chat history: {e}")
        conn.rollback()
        return False

def get_chat_history(file_ids, limit=10):
    """Get recent chat history for given file IDs"""
    try:
        cur = conn.cursor()
        placeholders = ','.join(['%s'] * len(file_ids))
        cur.execute(f"""
            SELECT file_id, question, answer, timestamp 
            FROM chat_history 
            WHERE file_id IN ({placeholders})
            ORDER BY timestamp DESC 
            LIMIT %s
        """, file_ids + [limit])
        
        history = cur.fetchall()
        cur.close()
        
        # Convert to list of dicts
        chat_history = []
        for row in history:
            chat_history.append({
                "file_id": row[0],
                "question": row[1],
                "answer": row[2],
                "timestamp": row[3].isoformat() if row[3] else None
            })
        
        return chat_history
    except Exception as e:
        print(f"Error getting chat history: {e}")
        return []

def groq_chat_with_history(context: str, question: str, chat_history: list, images: list = None) -> str:
    client = Groq(api_key=GROQ_API_KEY)
    
    # Build messages with explicit conversation structure
    messages = [
        {
            "role": "system", 
            "content": "You are an intelligent assistant that answers based on the provided document. "
                "If chat history is available, use it naturally to maintain continuity. "
                "If there is no chat history, simply answer the question directly without "
                "mentioning anything about missing conversation."
        }
    ]
    
    # Add chat history as previous messages
    for chat in chat_history:
        messages.append({"role": "user", "content": chat['question']})
        messages.append({"role": "assistant", "content": chat['answer']})
    
    # Add current context and question
    user_content = [{"type": "text", "text": f"DOCUMENT CONTEXT:\n{context}\n\nCURRENT QUESTION: {question}\n\nPlease reference our previous conversation when answering."}]
    
    if images and len(images) > 0:
        for img in images:
            try:
                img_byte_arr = io.BytesIO()
                img.save(img_byte_arr, format='PNG')
                img_b64 = base64.b64encode(img_byte_arr.getvalue()).decode('utf-8')
                user_content.append({
                    "type": "image_url",
                    "image_url": {"url": f"data:image/jpeg;base64,{img_b64}"}
                })
            except Exception as e:
                print(f"Error converting image to base64: {e}")
                continue
    
    messages.append({"role": "user", "content": user_content})
    
    try:
        response = client.chat.completions.create(
            model=GROQ_MODEL,
            messages=messages,
            max_tokens=2048,
            temperature=0.1
        )
        
        content = response.choices[0].message.content
        return content
        
    except Exception as e:
        error_msg = f"Groq API error: {e}"
        print(error_msg)
        return error_msg
    
def generate_mcq_with_groq(context: str, num_questions: int = 5):
    client = Groq(api_key=GROQ_API_KEY)
    
    prompt = f"""
    CONTENT:
    {context}
    
    Create {num_questions} multiple choice questions with 4 options each.
    
    REQUIREMENTS:
    - Questions should test understanding of key concepts
    - Each question has 4 options (A, B, C, D)
    - Only ONE correct answer per question (either A, B, C, or D)
    - Shuffle Answers like option A,B,C,D , dont always put correct answer at same place
    - Wrong answers should be plausible but incorrect
    - Cover different aspects of the content
    
    FORMAT:
    [
        {{
            "question": "clear question",
            "options": [
                "A. text",
                "B. text", 
                "C. text",
                "D. text"
            ],
            "correct_answer": "A"/"B"/"C"/"D"
        }}
    ]
    
    Return ONLY valid JSON.
    """
    
    try:
        response = client.chat.completions.create(
            model=GROQ_MODEL,
            messages=[
                {
                    "role": "system",
                    "content": "Create high-quality multiple choice questions with 4 options and one correct answer."
                },
                {
                    "role": "user", 
                    "content": prompt
                }
            ],
            max_tokens=2048,
            temperature=0.7
        )
        
        content = response.choices[0].message.content.strip()
        print(f"Raw MCQ response: {content}")
        
        import json
        try:
            mcqs = json.loads(content)
            
            if isinstance(mcqs, list):
                return mcqs
            elif isinstance(mcqs, dict):
                if 'questions' in mcqs:
                    return mcqs['questions']
                else:
                    return [mcqs]
            else:
                return [{"error": "Invalid response format"}]
                
        except json.JSONDecodeError as e:
            print(f"JSON parse error: {e}")
            import re
            json_match = re.search(r'\[.*\]', content, re.DOTALL)
            if json_match:
                try:
                    return json.loads(json_match.group())
                except:
                    pass
            return [{"error": "Could not parse MCQs"}]
        
    except Exception as e:
        print(f"Groq API error: {e}")
        return [{"error": f"MCQ generation failed: {str(e)}"}]
    
#-----------Flashcard Generation with Groq-----------
def generate_flashcards_with_groq(context: str, num_flashcards: int = 5):
    client = Groq(api_key=GROQ_API_KEY)
    
    prompt = f"""
    CONTENT:
    {context}
    
    Create {num_flashcards} flashcards from this content.
    
    CRITICAL: Hints should GUIDE thinking without revealing the answer and don't repeat the question in hint
     guide the user to think towards the answer
    
    FORMAT:
    [
        {{
            "question": "One word question/expression/formulas/equation of graphs,etc",
            "answer": "detailed answer", 
            "hint": "helpful hint"
        }}
    ]        
       example:
    [
        {{
            "question": "Speed",
            "answer": "The distance travelled pe runit time", 
            "hint": "The faster this is, the less time it takes to travel"
        }}
    ]               
    """
    
    try:
        response = client.chat.completions.create(
            model=GROQ_MODEL,
            messages=[
               
                {
                    "role": "user", 
                    "content": prompt
                }
            ],
            max_tokens=2048,
            temperature=0.9
        )
        
        content = response.choices[0].message.content.strip()
        #print(f"Raw Groq response: {content}")
        
        import json
        try:
            flashcards = json.loads(content)
            
            if isinstance(flashcards, list):
                return flashcards
            elif isinstance(flashcards, dict):
                if 'flashcards' in flashcards:
                    return flashcards['flashcards']
                else:
                    return [flashcards]
            else:
                return [{"error": "Invalid response format"}]
                
        except json.JSONDecodeError as e:
            print(f"JSON parse error: {e}")
            import re
            json_match = re.search(r'\[.*\]', content, re.DOTALL)
            if json_match:
                try:
                    return json.loads(json_match.group())
                except:
                    pass
            return [{"error": "Could not parse flashcards"}]
        
    except Exception as e:
        print(f"Groq API error: {e}")
        return [{"error": f"Generation failed: {str(e)}"}]

# ------------------- ENDPOINTS --------------------------------------------------------

@app.get("/")
def health():
    try:
        client = Groq(api_key=GROQ_API_KEY)
        models = client.models.list()
        model_names = [model.id for model in models.data]

        return {
            "status": "ok",
            "groq": "connected",
            "model": GROQ_MODEL,
            "clip_ready": True,
            "office_support": {
                "docx": DOCX_SUPPORT,
                "pptx": PPTX_SUPPORT,
                "xlsx": XLSX_SUPPORT,
                "pdf": PDF_SUPPORT,
                "libreoffice": True
            },
            "available_models": model_names
        }
    except Exception as e:
        return JSONResponse(
            content={"status": "ok", "groq": "disconnected", "error": str(e)},
            status_code=200
        )


@app.post("/upload-files")
async def upload_files(
    files: list[UploadFile] = File(...),
    moduleId: str = Form(None)
):
    results = []
    errors = []

    # Get vector stores
    store = get_vector_store()
    clip_store = get_clip_vector_store()

    for file in files:
        filename = file.filename
        content = await file.read()
        file_stream = io.BytesIO(content)
        # Extract text, images, pdf_data
        text, error, images, pdf_data = process_file_content(file_stream, filename)
        file_id = str(uuid.uuid4())
        timestamp = int(time.time() * 1000)

        # S3 key pattern to match frontend
        s3_key = f"modules/{moduleId}/{timestamp}-{filename}" if moduleId else f"uploads/{file_id}-{filename}"
        s3_url = f"https://{S3_BUCKET_NAME}.s3.{AWS_REGION}.amazonaws.com/{s3_key}"

        # Upload to S3
        try:
            s3.put_object(
                Bucket=S3_BUCKET_NAME,
                Key=s3_key,
                Body=content,
                ContentType=file.content_type
            )
        except Exception as e:
            errors.append({"file_name": filename, "error": f"S3 upload failed: {e}"})
            s3_key = None
            s3_url = None



        chunks = []
        # Store text chunks in vector DB
        if text and text.strip():
            splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
            chunks = splitter.split_text(text)

            texts = chunks
            metadatas = [{
                "file_id": file_id,
                "file_name": filename,
                "chunk_index": i,
                "file_type": filename.lower().split('.')[-1] if '.' in filename else 'unknown',
                "content_type": "text",
                "has_images": len(images) > 0
            } for i in range(len(chunks))]
            ids = [str(uuid.uuid4()) for _ in chunks]
            store.add_texts(texts=texts, metadatas=metadatas, ids=ids)

        # Store image descriptions in CLIP vector store
        if images and len(images) > 0:
            for img_index, img in enumerate(images):
                description = generate_image_description(img)
                clip_store.add_texts(
                    texts=[description],
                    metadatas=[{
                        "file_id": file_id,
                        "file_name": filename,
                        "image_index": img_index,
                        "file_type": "image",
                        "content_type": "image",
                        "original_content": description
                    }],
                    ids=[str(uuid.uuid4())]
                )

        results.append({
            "file_name": filename,
            "file_id": file_id,
            "chunks": len(chunks),
            "images_processed": len(images),
            "file_type": filename.lower().split('.')[-1] if '.' in filename else 'unknown',
            "s3_key": s3_key,
            "s3_url": s3_url,
            "html": None,
            "error": error
        })

    response_data = {"uploaded": results}
    if errors:
        response_data["errors"] = errors

    return JSONResponse(content=response_data, status_code=201)


class AskRequest(BaseModel):
    question: str
    file_ids: list[str]


@app.post("/ask")
def ask(data: AskRequest):
    question = data.question.strip()
    file_ids = data.file_ids

    if not file_ids:
        raise HTTPException(status_code=400, detail="file_ids are required")

    # Get recent chat history
    chat_history = get_chat_history(file_ids, limit=3)

    # Retrieve chunks and images relevant to the query
    text_chunks, image_descriptions = retrieve_by_file_ids(
        file_ids,
        question,
        k=4
    )
    text_context = "\n---\n".join(text_chunks) if text_chunks else ""

    # Generate answer using Groq with chat history
    answer = groq_chat_with_history(
        text_context,
        question,
        chat_history
    )

    # Save updated chat history
    for file_id in file_ids:
        save_chat_history(file_id, question, answer)

    
    return JSONResponse(content={
        "question": question,
        "answer": answer,
        "file_ids_used": file_ids,
        "chat_history": chat_history,
        "text_chunks": len(text_chunks)
    })


@app.get("/file-ids")
def list_file_ids():
    try:
        cur = conn.cursor()
        cur.execute(f"""
            SELECT DISTINCT {TABLE_NAME}.cmetadata->>'file_id' AS file_id,
                            {TABLE_NAME}.cmetadata->>'file_name' AS file_name
            FROM {TABLE_NAME}
            ORDER BY file_name
        """)
        rows = cur.fetchall()
        cur.close()
        conn.commit()

        files = [{"file_id": r[0], "file_name": r[1]} for r in rows]
        return JSONResponse(content={"files": files}, status_code=200)

    except Exception as e:
        conn.rollback()
        return JSONResponse(content={"error": str(e)}, status_code=500)
    
@app.get("/chat-history")
def get_chat_history_endpoint(file_ids: list[str] = Query(...), limit: int = 20):
    if not file_ids:
        raise HTTPException(status_code=400, detail="file_ids are required")

    history = get_chat_history(file_ids, limit)
    return {
        "chat_history": history,
        "file_ids": file_ids,
        "total_messages": len(history)
    }

@app.post("/clear-chat-history")
def clear_chat_history(data: dict):
    file_ids = data.get("file_ids", [])

    try:
        cur = conn.cursor()
        placeholders = ','.join(['%s'] * len(file_ids))
        cur.execute(f"DELETE FROM chat_history WHERE file_id IN ({placeholders})", file_ids)

        conn.commit()
        cur.close()

        return {
            "message": "Chat history cleared successfully",
            "file_ids": file_ids
        }
    except Exception as e:
        conn.rollback()
        return JSONResponse(content={"error": f"Failed to clear history: {str(e)}"}, status_code=500)

@app.post("/generate-flashcards")
def generate_flashcards(data: dict):
    file_ids = data.get("file_ids", [])
    num_flashcards = data.get("num_flashcards", 5)

    search_terms = [
        "key concepts",
        "important information",
        "main topics",
        "detailed explanations",
        "examples and applications",
        "definitions and principles",
        "processes and methods",
        "relationships and connections"
    ]

    random_term = random.choice(search_terms)
    context_chunks, _ = retrieve_by_file_ids(file_ids, random_term, k=6)
    context = "\n---\n".join(context_chunks) if context_chunks else "No content found."

    if not context.strip():
        raise HTTPException(status_code=400, detail="No content found in selected files")

    flashcards = generate_flashcards_with_groq(context, num_flashcards)

    return {
        "flashcards": flashcards,
        "file_ids_used": file_ids,
        "total_generated": len(flashcards)
    }

@app.post("/generate-mcq")
def generate_mcq(data: dict):
    file_ids = data.get("file_ids", [])
    num_questions = data.get("num_questions", 5)

    search_terms = [
        "key concepts and definitions",
        "important principles and theories",
        "formulas and equations",
        "processes and methods",
        "relationships and connections"
    ]

    random_term = random.choice(search_terms)
    context_chunks, _ = retrieve_by_file_ids(file_ids, random_term, k=8)
    context = "\n---\n".join(context_chunks) if context_chunks else "No content found."

    if not context.strip():
        raise HTTPException(status_code=400, detail="No content found in selected files")

    mcqs = generate_mcq_with_groq(context, num_questions)

    return {
        "mcqs": mcqs,
        "file_ids_used": file_ids,
        "total_questions": len(mcqs)
    }

# ---------------- RUN ----------------
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=3000, debug=True)


