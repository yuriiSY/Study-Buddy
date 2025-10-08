from flask import Flask, render_template, request
from dotenv import load_dotenv
import os
from openai import OpenAI

load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

app = Flask(__name__)

@app.route('/', methods=['GET', 'POST'])
def home():
    response = ""
    if request.method == 'POST':
        user_input = request.form.get("userInput", "")
        if user_input:
            completion = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are a learning assistant for students"},
                    {"role": "user", "content": user_input}
                ]
            )
            response = completion.choices[0].message.content
    # IMPORTANT: always return a response (GET and POST)
    return render_template('ai-test.html', response=response)

if __name__ == "__main__":
    app.run(debug=True)