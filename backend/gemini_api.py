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
            sys_inst = "Talk like a pirate"
        case "/translate":
            sys_inst = "You will be performing translation tasks. Do not repeat the prompt, output the translation only"
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

    try:
        chat
    except:
        start_chat()

    text = request.json["text"]
    target_lang = request.json["target_lang"]

    response = chat.send_message(
        f"""Analyze the following piece of text surrounded by triple backticks 
            and output the most likely language of this piece of text:
            ```Good morning```
            English

            Analyze the following piece of text surrounded by triple backticks 
            and output the most likely language of this piece of text:
            ```发生了什么事？```
            Chinese

            Analyze the following piece of text surrounded by triple backticks 
            and output the most likely language of this piece of text:
            ```Je veux un croissant```
            French

            Analyze the following piece of text surrounded by triple backticks 
            and output the most likely language of this piece of text:
            ```よろしくお願いします```
            Japanese

            Analyze the following piece of text surrounded by triple backticks 
            and output the most likely language of this piece of text:
            ```{text}```
        """,
        generation_config=genai.types.GenerationConfig(
            candidate_count=1,
        ),
    )

    source_lang = response.text

    response = chat.send_message(
        f"""Translate the following piece of text surrounded by triple backticks 
            from English to Japanese:
            ```Good morning```
            おはようございます

            Translate the following piece of text surrounded by triple backticks 
            from Chinese to English:
            ```发生了什么事？```
            What happened?

            Translate the following piece of text surrounded by triple backticks 
            from French to English:
            ```Je veux un croissant```
            I want a croissant

            Translate the following piece of text surrounded by triple backticks 
            from Japanese to Traditional Chinese:
            ```よろしくお願いします```
            請多多指教

            Translate the following piece of text surrounded by triple backticks 
            from {source_lang} to {target_lang}:
            ```{text}```
        """,
        generation_config=genai.types.GenerationConfig(
            candidate_count=1,
        ),
    )

    translation = response.text

    return {"source_lang": source_lang, "translation": translation}


app.run()
