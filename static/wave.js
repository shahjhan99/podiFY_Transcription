


document.addEventListener('DOMContentLoaded', function() {
    const fileInput = document.getElementById('file-input');
    const fileName = document.getElementById('file-name');
    const loading = document.getElementById('loading');
    const error = document.getElementById('error');
    const success = document.getElementById('success');
    const zoomInBtn = document.getElementById('zoom-in');
    const zoomOutBtn = document.getElementById('zoom-out');
    const resetZoomBtn = document.getElementById('reset-zoom');
    const button = document.getElementById("processBtn");
    const summary = document.getElementById("summary");
    const transcription = document.getElementById("transcription");
    const starttime = document.getElementById("starttime");
    const endtime = document.getElementById("endtime");
    const getDurationBtn = document.getElementById("getDurationBtn");
    const duration = document.getElementById("fileDuration");
    
    // Media preview elements
    const mediaPreviewSection = document.getElementById("media-preview-section");
    const videoPreview = document.getElementById("videoPreview");
    const audioPreview = document.getElementById("audioPreview");
    
    

    
    getDurationBtn.addEventListener("click", async function() {
        if(!fileInput.files.length){
            alert("Upload the file first");
            return;
        }
        const formData = new FormData();
        formData.append("file", fileInput.files[0]);

        try{
            const response = await fetch("/file_duration", {
                method: 'POST',
                body: formData
            });

            const data = await response.json();
            endtime.value = data.duration;
            duration.innerText = "File Full Duration : "+data.duration + " s";
        } catch(error) {
            console.error("Error:", error);
            duration.innerText = "Error occurred!";
        }
    });







    










    // SINGLE file input change event listener
    fileInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (!file) return;
          // Clear previous media sources
        if (videoPreview.src) {
            videoPreview.src = '';
            videoPreview.load(); // Reset the video element
        }
        if (audioPreview.src) {
            audioPreview.src = '';
            audioPreview.load(); // Reset the audio element
      }
        // Media preview functionality
        const fileURL = URL.createObjectURL(file);
        const fileType = file.type;
        
        // Show media preview section
        mediaPreviewSection.style.display = 'block';



        if (fileType.includes('video')) {
            // It's a video file
            videoPreview.src = fileURL;
            videoPreview.style.display = 'block';
            audioPreview.style.display = 'none';
            
            // Load video metadata to handle potential issues
            videoPreview.onloadedmetadata = function() {
                console.log("Video loaded successfully");
            };
            
            videoPreview.onerror = function() {
                console.error("Error loading video");
                videoPreview.style.display = 'none';
                // Show message about video format issues
                //alert("This video format may not be fully supported in your browser. The audio will still be processed.");
            };
        } else if (fileType.includes('audio')) {
            // It's an audio file
            audioPreview.src = '';
            const audioBlob = new Blob([file], { type: file.type || 'audio/wav' });
            const safeURL = URL.createObjectURL(audioBlob);
            audioPreview.src = safeURL;

            audioPreview.style.display = 'block';
            videoPreview.style.display = 'none';
        } else {
            // Unsupported file type for preview
            videoPreview.style.display = 'none';
            audioPreview.style.display = 'none';
        }
        
        // File upload processing
        fileName.textContent = `Selected file: ${file.name} (${formatFileSize(file.size)})`;
        
        error.style.display = 'none';
        success.style.display = 'none';
        loading.style.display = 'block';    
        
        const formData = new FormData();
        formData.append('file', file, file.name || 'audio_upload.wav');

        
        fetch('/upload', {
            method: 'POST',
            body: formData
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => { throw new Error(err.error || 'Upload failed') });
            }
            return response.json();
        })
        .then(data => {
            loading.style.display = 'none';
            
            if (data.error) {
                showError(data.error);
                return;
            }
            
            showSuccess('File processed successfully!');
            
            displayWaveform(data);
            
            zoomInBtn.disabled = false;
            zoomOutBtn.disabled = false;
            resetZoomBtn.disabled = false;
        })
        .catch(err => {
            loading.style.display = 'none';
            showError(err.message || 'An error occurred while processing the file');
        });
    });



    





   




    button.addEventListener("click", async function() {
        if(!fileInput.files.length) {
            alert("Kindly Upload the file");
            return;
        }
        if(starttime.value >= endtime.value || starttime.value < 0) {
            alert("End Time must be greater than the StartTime");
            return;
        }

        const formData = new FormData();
        formData.append("file", fileInput.files[0]);
        formData.append("starttime", starttime.value);
        formData.append("endtime", endtime.value);

        try {
            // Show loading state
            loading.style.display = 'block';
            
            // Send POST request to Flask
            const response = await fetch("/process", {
                method: "POST",
                body: formData
            });
    
            const data = await response.json();
            summary.innerText = data.summary;
            transcription.innerText = data.transcription;
            
            // Hide loading state
            loading.style.display = 'none';
            showSuccess('Processing completed successfully!');
        } catch (error) {
            console.error("Error:", error);
            summary.innerText = "Error occurred!";
            transcription.innerText = "";
            
            // Hide loading state and show error
            loading.style.display = 'none';
            showError('An error occurred during processing');
        }
    });
    
    zoomInBtn.addEventListener('click', () => {
        if (waveformChart) {
            waveformChart.zoom(1.1);
        }
    });
    
    zoomOutBtn.addEventListener('click', () => {
        if (waveformChart) {
            waveformChart.zoom(0.9);
        }
    });
    
    resetZoomBtn.addEventListener('click', () => {
        if (waveformChart) {
            waveformChart.resetZoom();
        }
    });
    
    function formatFileSize(bytes) {
        if (bytes < 1024) return bytes + ' bytes';
        else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
        else return (bytes / 1048576).toFixed(1) + ' MB';
    }
    
    function showError(message) {
        error.textContent = message;
        error.style.display = 'block';
    }
    
    function showSuccess(message) {
        success.textContent = message;
        success.style.display = 'block';
        
        setTimeout(() => {
            success.style.display = 'none';
        }, 3000);
    }
    
    
    let waveformChart = null;
    const ctx = document.getElementById('waveform-chart').getContext('2d');
    
    function displayWaveform(data) {
        // Round the amplitude values to 4 decimal places BEFORE creating the chart
        const time = data.time;
        const amplitude = data.amplitude.map(value => parseFloat(value.toFixed(4)));
        
        if (waveformChart) {
            waveformChart.destroy();
        }
        
        waveformChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: time,
                datasets: [{
                    label: 'Amplitude',
                    data: amplitude,
                    borderColor: '#4b6cb7',
                    backgroundColor: 'rgba(14, 186, 230, 0.29)',
                    borderWidth: 1.5,
                    fill: true,
                    pointRadius: 0,
                    tension: 0.1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Time (seconds)',
                            font: {
                                weight: 'bold'
                            }
                        },
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        },
                        ticks: {
                            callback: function(value) {
                                return this.getLabelForValue(value).toFixed(6);
                            }
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Amplitude',
                            font: {
                                weight: 'bold'
                            }
                        },
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        },
                        ticks: {
                            callback: function(value) {
                                return value.toFixed(4);
                            }
                        }
                    }
                },
                plugins: {
                    zoom: {
                        zoom: {
                            wheel: { enabled: true },
                            pinch: { enabled: true },
                            mode: 'x'
                        },
                        pan: {
                            enabled: true,
                            mode: 'x'
                        }
                    },
                    title: {
                        display: true,
                        text: 'Audio Waveform',
                        font: {
                            size: 18,
                            weight: 'bold'
                        }
                    },
                    legend: {
                        display: false
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        callbacks: {
                            label: function(context) {
                                return `Amplitude: ${context.parsed.y.toFixed(4)}`;
                            },
                            title: function(context) {
                                return `Time: ${context[0].parsed.x.toFixed(2)}s`;
                            }
                        }
                    }
                },
                interaction: {
                    mode: 'index',
                    intersect: false
                }
            }
        });
    }
    
    // Initial message on the waveform canvas
    ctx.font = "16px Arial";
    ctx.fillStyle = "#999";
    ctx.textAlign = "center";
    ctx.fillText("Upload a file to see the waveform", ctx.canvas.width / 2, ctx.canvas.height / 2);
});



    // Copy text to clipboard
function copyText(elementId) {
        const text = document.getElementById(elementId).innerText;
        navigator.clipboard.writeText(text).then(() => {
            alert("Copied to clipboard!");
        }).catch(err => {
            console.error("Failed to copy: ", err);
        });
    }




    // Download as .txt file
function downloadText(elementId, filename) {
        const text = document.getElementById(elementId).innerText;
        const blob = new Blob([text], { type: "text/plain" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        link.click();
        URL.revokeObjectURL(link.href);
    }
copyTransBtn.addEventListener("click", () => copyText("transcription"));
downloadTransBtn.addEventListener("click", () => downloadText("transcription", "transcription.txt"));
copySummaryBtn.addEventListener("click", () => copyText("summary"));
downloadSummaryBtn.addEventListener("click", () => downloadText("summary", "summary.txt"));


chrome.runtime.onInstalled.addListener(async () => {
  // Re-inject the content script into all active tabs
  for (const cs of chrome.runtime.getManifest().content_scripts) {
    for (const tab of await chrome.tabs.query({url: cs.matches})) {
      chrome.scripting.executeScript({
        target: {tabId: tab.id},
        files: cs.js,
      });
    }
  }
});