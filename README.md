
# 🎧 Podify Transcription

**Podify Transcription** is an AI-powered web app that lets you upload, trim, and process **audio or video files** directly in your browser.  
It automatically **extracts speech**, **generates transcripts**, and even **summarizes content** — perfect for podcasters, journalists, researchers, and content creators.

---

## 🚀 Features

- 🎵 **Audio & Video Uploads**
  - Supports direct upload or file selection from your computer.
  - Handles formats like `.mp3`, `.wav`, `.mp4`, and `.mkv`.

- ✂️ **Audio Trimming**
  - Choose start and end points before transcription to save time and resources.

- 🧠 **AI Transcription**
  - Powered by **OpenAI Whisper** or **Groq Whisper API** for fast and accurate multilingual speech-to-text.

- 🗒️ **Smart Summarization**
  - Uses **Groq LLMs** to generate summaries of transcripts — turning long recordings into clear notes.

- 🔊 **Waveform Visualization**
  - Real-time waveform display using JavaScript canvas for precise trimming and playback.

- 📁 **Upload Management**
  - Uploaded files are saved temporarily and auto-cleaned after processing.

- 🌐 **Modern Interface**
  - Responsive front-end built with **HTML, CSS, and JS**.
  - Clean design with progress indicators, preview panels, and interactive buttons.

---

## 🧩 Tech Stack

| Component | Technology |
|------------|-------------|
| **Backend** | Flask (Python) |
| **Frontend** | HTML, CSS, JavaScript |
| **AI Engine** | Groq Whisper + LLMs |
| **Audio Tools** | FFmpeg |
| **Visualization** | Canvas API / Waveform.js |
| **Deployment** | AWS Free Tier / GitHub Actions |
| **Secrets Management** | GitHub Secrets + `.env` file |

---

## 🗂️ Project Structure

```

Podify_Transcription/
├── app.py                # Flask main app
├── waveform.py           # Audio waveform generation
├── templates/
│   └── index.html        # Main UI page
├── static/
│   ├── icons/            # UI icons and graphics
│   ├── css/              # Stylesheets
│   └── js/               # Client-side scripts
├── uploads/              # Temporary upload storage
├── requirements.txt      # Dependencies
├── .env.example          # Example environment variables
└── README.md             # Project documentation

````

---

## ⚙️ Installation & Setup

### 1️⃣ Clone the repository
```bash
git clone https://github.com/shahjhan99/podiFY_Transcription.git
cd podiFY_Transcription
````

### 2️⃣ Create a virtual environment

```bash
python -m venv venv
source venv/bin/activate   # (on Windows: venv\Scripts\activate)
```

### 3️⃣ Install dependencies

```bash
pip install -r requirements.txt
```

### 4️⃣ Set up environment variables

Create a `.env` file in your project root:

```
GROQ_API_KEY=your_actual_groq_api_key_here
```

*(The `.env` file is ignored by Git to keep your secrets safe.)*

### 5️⃣ Run the Flask app

```bash
python app.py
```

Then open your browser at 👉 [http://127.0.0.1:5000](http://127.0.0.1:5000)

---

## 🧠 How It Works

1. User uploads a **video or audio** file.
2. Flask automatically extracts **audio from video** (if needed).
3. The waveform is generated and displayed on the webpage.
4. Whisper model (via **Groq API**) transcribes the audio to text.
5. Groq LLM generates an **optional summary** of the transcript.
6. The UI displays:

   * Trimmed waveform
   * Transcript
   * Summary text

---

## 🔒 Security

* API keys are stored securely in environment variables or **GitHub Secrets**.
* All uploaded media files are stored in a local `/uploads` folder and automatically deleted after processing.
* No user data is permanently stored.

---

## 📦 Deployment Notes

If deploying on **AWS EC2, Render, or any Flask-compatible host**:

* Ensure `GROQ_API_KEY` is added in environment variables (e.g., via `export` or platform secrets).
* Keep `/uploads` writable.
* Install `ffmpeg` in your instance:

  ```bash
  sudo apt install ffmpeg
  ```

---

## 🧩 Example Output

**Input:** `podcast_clip.mp4`
**Output:**

* Transcript → `"Welcome to our weekly AI show..."`
* Summary → `"The episode discusses the rise of AI assistants in 2025."`

---

## 🪪 License

This project is licensed under the **MIT License** — you’re free to use, modify, and distribute it with attribution.

---

## 💡 Author

**👨‍💻 M. Shahjhan Gondal**
AI/ML Developer | Flask Enthusiast | Whisper + Groq Integrator
🔗 [GitHub Profile](https://github.com/shahjhan99)

---

## ⭐ Future Improvements

* Speaker diarization (who said what)
* Live audio recording & transcription
* Multi-language translation
* PDF/Docx export of transcripts

---

> “Podify Transcription — Turn your voice into insight.”

```
