import os
import time
import logging
from flask import Flask, render_template, request
from openai import OpenAI, RateLimitError
from dotenv import load_dotenv
# ---------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------
load_dotenv()  # load environment variables from .env if available

# DEMO_MODE is True by default (can be overridden via environment variable)
DEMO_MODE = os.getenv("DEMO_MODE", "true").lower() == "true"
# To get live API responses, set DEMO_MODE to "false" and ensure OPENAI_API_KEY is set.
# Initialize Flask
app = Flask(__name__)

# Initialize OpenAI client only if not in demo mode
api_key = os.getenv("OPENAI_API_KEY")
client = None
if not DEMO_MODE and api_key:
    client = OpenAI(api_key=api_key)
else:
    app.logger.warning("Running in DEMO_MODE or missing API key — no real API calls will be made.")

# ---------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------
@app.route("/", methods=["GET", "POST"])
def home():
    response = ""

    if request.method == "POST":
        user_input = request.form.get("userInput", "").strip()

        if user_input:
            if DEMO_MODE:
                response = (
                    f"(Demo Mode Active) You said: '{user_input}'. "
                    "In live mode, this would be answered by the AI model."
                )
            else:
                try:
                    completion = client.chat.completions.create(
                        model="gpt-3.5-turbo",
                        messages=[
                            {"role": "system", "content": "You are a learning assistant for students."},
                            {"role": "user", "content": user_input},
                        ],
                        timeout=30,
                    )
                    response = completion.choices[0].message.content
                except Exception as e:
                    response = (
                        f"API error: {e}\n\n"
                        f"(Demo fallback) You said: '{user_input}'."
                    )

    # Pass demo_mode flag into template
    return render_template("ai-test.html", response=response, demo_mode=DEMO_MODE)


# ---------------------------------------------------------------------
# App Entry Point
# ---------------------------------------------------------------------
if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    app.logger.info(f"DEMO_MODE = {DEMO_MODE}")
    app.run(debug=True)