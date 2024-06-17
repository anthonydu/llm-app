import pathlib
import google.generativeai as genai
import os
from dotenv import load_dotenv
from flask import Flask, request
from flask_cors import CORS, cross_origin
from urllib.parse import urlparse

app = Flask(__name__)
CORS(app)

load_dotenv(f"{pathlib.Path(__file__).parent.resolve()}/.env.local")

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

global chat


@app.route("/start_chat", methods=["POST"])
@cross_origin()
def start_chat():
    global chat

    try:
        url = urlparse(request.json["url"])
    except:
        url = urlparse("")

    match url.path:
        case "/pirate":
            sys_inst = "Talk like a pirate."
        case "/translate":
            sys_inst = None
        case _:
            sys_inst = None

    model = genai.GenerativeModel(
        "gemini-1.5-flash",
        system_instruction=sys_inst,
        # system_instruction="""
        # You are a friendly personal assistant.
        # Whenever the user infer or explicitly state that the current conversation is over,
        # ask if there's anything else you can help them with and if they respond with something similar to "no" or "bye",
        # respond with the exact string "Thanks for chatting with me! Come back any time!" without the quotation marks
        # """,
    )

    chat = model.start_chat()

    return "Chat session started!", 200


@app.route("/rewind", methods=["GET"])
def rewind():
    global chat
    chat.rewind()
    return "Rewind success!", 200


@app.route("/send_message", methods=["POST"])
@cross_origin()
def send_message():
    global chat

    try:
        chat
    except:
        start_chat()

    message = request.json["message"]
    response = chat.send_message(
        message,
        generation_config=genai.types.GenerationConfig(
            candidate_count=1,
        ),
        stream=True,
    )

    def stream():
        for chunk in response:
            yield chunk.text

    return stream(), 200


@app.route("/translate", methods=["POST"])
@cross_origin()
def get_lang():
    global chat

    start_chat()

    text = request.json["text"]
    target_lang = request.json["target_lang"]

    response = chat.send_message(
        f"""What is the language of the following piece of text, output the language name only:
            ```{text}```
        """,
        generation_config=genai.types.GenerationConfig(
            candidate_count=1, temperature=0
        ),
    )

    source_lang = response.text.strip()

    response = chat.send_message(
        f"""
            Translate the following piece of text from {source_lang} to {target_lang}, output the translated text only without quotation marks, do not change formatting:
            ```{text}```
        """,
        generation_config=genai.types.GenerationConfig(
            candidate_count=1, temperature=0
        ),
    )

    translation = response.text.strip()

    return {"source_lang": source_lang, "translation": translation}, 200


app.run()
