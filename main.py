


from flask import jsonify, send_from_directory
from flask import Flask, render_template, request, jsonify
import tempfile
import numpy as np
import soundfile as sf
from moviepy import VideoFileClip
import os
from flask_cors import CORS
from flask import Flask, render_template, request, jsonify
from moviepy import VideoFileClip, AudioFileClip
from groq import Groq
from faster_whisper import WhisperModel
import os
import tempfile
import librosa
import librosa.display
import matplotlib.pyplot as plt
import numpy as np
import soundfile as sf
import tempfile
import plotly.graph_objects as go
import urllib.parse
from flask import Flask, jsonify, send_from_directory
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)


# -----------------------------
# Groq API setup
# -----------------------------
#GROQ_API_KEY = ""
#groq_client = Groq(api_key=GROQ_API_KEY)


GROQ_API_KEY = os.getenv("GROQ_API_KEY")

if not GROQ_API_KEY:
    raise ValueError("❌ GROQ_API_KEY not found! Please set it in GitHub Secrets or .env file.")

# Initialize client securely
groq_client = Groq(api_key=GROQ_API_KEY)











# -----------------------------
# Faster Whisper setup
# -----------------------------
UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
#model = WhisperModel("small")  # choose tiny, small, medium, large
model = WhisperModel("tiny", device="cpu", compute_type="int8")



@app.route('/') 
def index(): 
    return render_template('wave.html')


UPLOAD_FOLDER = "uploads"

@app.route("/get_videos")
def get_videos():
    videos = []
    for f in os.listdir(UPLOAD_FOLDER):
        if f.lower().endswith((".mp4", ".mkv", ".avi", ".mov",".mp3",".wav")):
            encoded_name = urllib.parse.quote(f)
            videos.append({
                "name": f,
                "url": f"/uploads/{encoded_name}"
            })
    return jsonify(videos)

@app.route("/uploads/<path:filename>")
def serve_file(filename):
    return send_from_directory(UPLOAD_FOLDER, filename)



    
@app.route('/file_duration', methods =['POST'])
def file_duration():
    file = request.files.get('file')
    # Save the file Temporarily

    with tempfile.NamedTemporaryFile(delete=False, suffix = ".mp4") as tempFile:
        file.save(tempFile.name)
        temp_path = tempFile.name
    
    try :
        video_clip=VideoFileClip(temp_path)
        duration_of_file = video_clip.duration
        video_clip.close()
    except Exception:
        audio_clip= AudioFileClip(temp_path)
        duration_of_file =audio_clip.duration
        audio_clip.close()


    return jsonify(
        {"duration":duration_of_file}
        )


def trim_media_file(filepath, start, end, upload_folder):
    filename = os.path.basename(filepath)
    name, ext = os.path.splitext(filename)
    trimmed_path = ""

    try:
        if ext.lower() in [".mp4", ".mov", ".avi", ".mkv"]:
            # 🎥 Trim video file
            clip = VideoFileClip(filepath).subclipped(start, end)
            trimmed_path = os.path.join(upload_folder, f"trimmed_{name}.mp4")
            clip.write_videofile(trimmed_path, codec="libx264", audio_codec="aac")
            clip.close()

        elif ext.lower() in [".mp3", ".wav", ".m4a"]:
            # 🎧 Trim audio file
            clip = AudioFileClip(filepath).subclipped(start, end)
            trimmed_path = os.path.join(upload_folder, f"trimmed_{name}.mp3")
            clip.write_audiofile(trimmed_path, codec="libmp3lame")
            clip.close()

        else:
            raise ValueError("Unsupported file type")

        return trimmed_path

    except Exception as e:
        print(f"Error trimming file: {e}")
        return None



@app.route('/process', methods=['POST'])
def process_file():
    start = float(request.form.get('starttime'))
    end = float(request.form.get('endtime'))
    file = request.files.get('file')

    if not file:
        return jsonify({"summary": "", "transcription": "No file uploaded."})

    filepath = os.path.join(UPLOAD_FOLDER, file.filename)
    file.save(filepath)

    # 🧩 Trim video or audio
    trimmed_path = trim_media_file(filepath, start, end, UPLOAD_FOLDER)

    if not trimmed_path:
        return jsonify({"error": "Failed to trim media file."}), 500

    # 🧠 Transcribe trimmed file
    segments, _ = model.transcribe(trimmed_path)
    transcription = " ".join([segment.text for segment in segments])

    prompt = f"You are a summary generator Agent. Suggest a title first, then generate a summary for the text: {transcription}"

    try:
        chat_completion = groq_client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model="llama-3.3-70b-versatile"
        )
        summary = chat_completion.choices[0].message.content
    except Exception:
        summary = "Hello! Welcome to our transcription demo."

    print(f"[SUMMARY]: {summary}")
    print(f"[TRANSCRIPTION]: {transcription}")

    return jsonify({
        "summary": summary,
        "transcription": transcription,
        "trimmed_file": f"/uploads/{os.path.basename(trimmed_path)}"
    })
def extract_audio_if_video(file_path):
    video_exts = [".mp4", ".mov", ".avi", ".mkv"]
    if any(file_path.lower().endswith(ext) for ext in video_exts):
        audio_path = tempfile.mktemp(suffix=".wav")
        clip = VideoFileClip(file_path)
        clip.audio.write_audiofile(audio_path, codec="pcm_s16le", logger=None)
        clip.close()
        return audio_path
    return file_path

def generate_waveform_data(audio_path):
    try:
        data, samplerate = sf.read(audio_path)
        if data.ndim > 1:
            data = np.mean(data, axis=1)

        time = np.arange(len(data)) / samplerate

        max_points = 5000
        if len(time) > max_points:
            idx = np.linspace(0, len(time) - 1, max_points).astype(int)
            time = time[idx]
            data = data[idx]

        waveform_data = {
            "time": time.tolist(),
            "amplitude": data.tolist(),
            "samplerate": samplerate
        }
        
        return waveform_data
    except Exception as e:
        print(f"Error creating waveform: {str(e)}")
        return None



@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
    
    suffix = file.filename.split(".")[-1]
    with tempfile.NamedTemporaryFile(delete=False, suffix=f".{suffix}") as tmp:
        file.save(tmp.name)
        file_path = tmp.name

    try:
        audio_path = extract_audio_if_video(file_path)
        
        waveform_data = generate_waveform_data(audio_path)
        
        if waveform_data:
            os.unlink(file_path)
            if audio_path != file_path:
                os.unlink(audio_path)
                
            return jsonify(waveform_data)
        else:
            return jsonify({'error': 'Failed to process audio file'}), 500
            
    except Exception as e:
        if os.path.exists(file_path):
            os.unlink(file_path)
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
