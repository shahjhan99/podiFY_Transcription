// Preview uploaded video/audio
const fileInput = document.getElementById("fileInput");
const videoPreview = document.getElementById("videoPreview");

fileInput.addEventListener("change", (event) => {
  const file = event.target.files[0];
  if (file) {
    const url = URL.createObjectURL(file);
    videoPreview.src = url;
  }
});

// Handle Process button
document.getElementById("processBtn").addEventListener("click", async () => {
  if (!fileInput.files.length) {
    alert("Please upload a file first.");
    return;
  }

  const formData = new FormData();  
  formData.append("file", fileInput.files[0]);

  try {
    const res = await fetch("http://127.0.0.1:5000/process", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    document.getElementById("transcription").innerText = data.transcription;
    document.getElementById("summary").innerText = data.summary;
  } catch (err) {
    console.error("Error:", err);
    alert("Error processing file.");
  }
});

// Handle Wave Analysis button
document.getElementById("waveBtn").addEventListener("click", async () => {
  if (!fileInput.files.length) {
    alert("Please upload a file first.");
    return;
  }

  const formData = new FormData();
  formData.append("file", fileInput.files[0]);

  try {
    const res = await fetch("http://127.0.0.1:5000/waveform", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    if (data.plot_html) {
      document.getElementById("waveformContainer").innerHTML = data.plot_html;
    }
  } catch (err) {
    console.error("Error:", err);
    alert("Error generating waveform.");
  }
});
