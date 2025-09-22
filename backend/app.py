from flask import Flask, request, jsonify
from flask_cors import CORS
import whisper

app = Flask(__name__)
CORS(app)  # Allow cross-origin requests from frontend

# Load Whisper model once at server start
model = whisper.load_model("base")  # Can use "small", "medium", "large"

@app.route("/transcribe_audio", methods=["POST"])
def transcribe_audio():
    if "audio" not in request.files:
        return jsonify({"error": "No audio file provided"}), 400

    audio_file = request.files["audio"]
    audio_path = f"temp_audio.wav"
    audio_file.save(audio_path)

    # Use Whisper to transcribe
    result = model.transcribe(audio_path)
    transcript = result["text"]

    return jsonify({"transcript": transcript})
