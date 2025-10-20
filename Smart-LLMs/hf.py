# Cell 2: Import libraries
import PyPDF2
import os
from transformers import pipeline
from sentence_transformers import SentenceTransformer
import numpy as np
from typing import List, Dict

# Cell 3: Simple Multimodal RAG without Vector DB
class SimpleMultimodalRAG:
    def __init__(self):
        self.text_chunks = []
        self.images = []  # For image references
        self.text_encoder = None
        self.text_model = None
        self.loaded_documents = []
        
    def load_models(self):
        """Load AI models"""
        print("Loading models...")
        self.text_encoder = SentenceTransformer('all-mpnet-base-v2')
        self.text_model = pipeline("text-generation", model="gpt2", max_new_tokens=200)
        print("✅ Models loaded!")
    
    def extract_text_from_pdf(self, pdf_path):
        """Extract text from PDF"""
        try:
            with open(pdf_path, 'rb') as file:
                reader = PyPDF2.PdfReader(file)
                text = ""
                for page_num, page in enumerate(reader.pages):
                    page_text = page.extract_text()
                    if page_text.strip():
                        text += f"--- Page {page_num + 1} ---\n{page_text}\n\n"
                return text
        except Exception as e:
            return f"Error: {str(e)}"
    
    def chunk_text(self, text, chunk_size=300):
        """Split text into chunks"""
        sentences = text.split('. ')
        chunks = []
        current_chunk = ""
        
        for sentence in sentences:
            if len(current_chunk + sentence) < chunk_size:
                current_chunk += sentence + ". "
            else:
                if current_chunk:
                    chunks.append(current_chunk.strip())
                current_chunk = sentence + ". "
        
        if current_chunk:
            chunks.append(current_chunk.strip())
            
        return chunks
    
    def add_document(self, pdf_path):
        """Add PDF document to storage"""
        print(f"📖 Adding document: {pdf_path}")
        
        # Extract text
        text = self.extract_text_from_pdf(pdf_path)
        if text.startswith("Error"):
            return text
            
        # Create chunks
        chunks = self.chunk_text(text)
        
        # Store with metadata
        doc_data = {
            'path': pdf_path,
            'full_text': text,
            'chunks': chunks,
            'chunk_embeddings': None  # We'll compute on-demand
        }
        
        self.loaded_documents.append(doc_data)
        self.text_chunks.extend(chunks)
        
        print(f"✅ Added {len(chunks)} chunks from {pdf_path}")
        return f"Added document with {len(chunks)} text chunks"
    
    def find_relevant_chunks(self, query, top_k=3):
        """Find relevant chunks using simple similarity search"""
        if not self.text_encoder:
            self.load_models()
        
        # Compute query embedding
        query_embedding = self.text_encoder.encode([query])
        
        relevant_chunks = []
        
        # Search through all documents
        for doc in self.loaded_documents:
            if doc['chunk_embeddings'] is None:
                # Compute embeddings for this document's chunks
                doc['chunk_embeddings'] = self.text_encoder.encode(doc['chunks'])
            
            # Compute similarities
            similarities = np.dot(doc['chunk_embeddings'], query_embedding.T).flatten()
            
            # Get top k chunks from this document
            top_indices = np.argsort(similarities)[-top_k:][::-1]
            
            for idx in top_indices:
                if similarities[idx] > 0.3:  # Similarity threshold
                    relevant_chunks.append({
                        'content': doc['chunks'][idx],
                        'similarity': float(similarities[idx]),
                        'source': doc['path']
                    })
        
        # Sort by similarity and return top k
        relevant_chunks.sort(key=lambda x: x['similarity'], reverse=True)
        return relevant_chunks[:top_k]
    
    def ask(self, query):
        """Ask question - model figures out what to do"""
        if not self.loaded_documents:
            return "Please add documents first using add_document('your_file.pdf')"
        
        # Find relevant context
        relevant_chunks = self.find_relevant_chunks(query)
        
        if not relevant_chunks:
            return "I couldn't find relevant information in the documents."
        
        # Build context
        context = "\n".join([f"[Source: {chunk['source']}] {chunk['content']}" 
                           for chunk in relevant_chunks])
        
        # Let model figure out what to do based on query
        prompt = f"""
        Based on the following document content, respond to the user's request.
        
        DOCUMENT CONTENT:
        {context}
        
        USER REQUEST: {query}
        
        Provide a helpful and accurate response:
        """
        
        try:
            response = self.text_model(
                prompt,
                max_new_tokens=200,
                num_return_sequences=1,
                temperature=0.7,
                do_sample=True
            )
            
            answer = response[0]['generated_text'].split("Provide a helpful and accurate response:")[-1].strip()
            return answer
            
        except Exception as e:
            return f"Error generating response: {str(e)}"
    
    def summarize_document(self, doc_index=0):
        """Summarize a specific document"""
        if not self.loaded_documents:
            return "No documents loaded"
        
        if doc_index >= len(self.loaded_documents):
            return f"Document index {doc_index} not found"
        
        doc = self.loaded_documents[doc_index]
        text_to_summarize = doc['full_text'][:1000]  # First 1000 chars
        
        prompt = f"Summarize this document: {text_to_summarize}"
        
        try:
            response = self.text_model(prompt, max_new_tokens=150, num_return_sequences=1)
            return response[0]['generated_text']
        except:
            # Fallback summary
            sentences = doc['full_text'].split('. ')
            return '. '.join(sentences[:3]) + '.'
    
    def list_documents(self):
        """List all loaded documents"""
        if not self.loaded_documents:
            return "No documents loaded"
        
        result = "📚 Loaded Documents:\n"
        for i, doc in enumerate(self.loaded_documents):
            result += f"{i+1}. {doc['path']} - {len(doc['chunks'])} chunks\n"
        
        return result
    
# Cell 7: Quick start with your files
# SIMPLE USAGE - Just replace the file paths and run this cell

rag = SimpleMultimodalRAG()
rag.load_models()

# Add your PDF files here
your_pdfs = [
    "../notes.pdf"
]

print("📚 Adding your documents...")
for pdf_file in your_pdfs:
    if os.path.exists(pdf_file):
        rag.add_document(pdf_file)
    else:
        print(f"⚠️  Not found: {pdf_file}")

print("\n✅ Ready! Now ask questions:")
print("Examples: 'What is this about?', 'Summarize the content', 'Explain key concepts'")

# Ask questions in a loop
your_questions = [
    "What is the main topic?",
    "Summarize the content",
    "What are the key points?"
]

for question in your_questions:
    print(f"\n❓ {question}")
    answer = rag.ask(question)
    print(f"🤖 {answer}")