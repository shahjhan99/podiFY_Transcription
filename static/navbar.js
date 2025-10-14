document.addEventListener("DOMContentLoaded", function () {
    const openPopupBtn = document.getElementById("openPopup");
    const closePopupBtn = document.getElementById("closePopup");
    const popupOverlay = document.getElementById("popupOverlay");
    const homeBtn = document.getElementById("homeBtn");
    const Startingpopup = document.getElementById("Startingpopup");
    const closeStartPopup = document.getElementById("closeStartPopup");
    const transcriptionBtn = document.getElementById("transcriptionBtn");
    const tran_SummaryBtn = document.getElementById("tranSummaryBtn");
    const resultsContainer = document.getElementById("results-container");
    const summaryBox = document.querySelector(".summary-section");
    const fileSend = document.getElementById("file-input");
    const fileNameDisplay = document.getElementById("file-name");
    Startingpopup.style.display = "flex";
    let storedfile = null;

    // ✅ Fetch videos ONCE when page loads
    fetch("/get_videos")
        .then(res => {
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
            return res.json();
        })
        .then(videos => {
            const container = document.getElementById("uploaded-videos");
            container.innerHTML = "";

            if (!videos || videos.length === 0) {
                container.innerHTML = '<p class="no-videos">No videos found</p>';
                return;
            }

            videos.forEach(v => {
                const card = document.createElement("div");
                card.className = "video-card";

                const videoElem = document.createElement("video");
                videoElem.src = v.url;
                videoElem.controls = true;
                videoElem.preload = "metadata";

                const fileNameDiv = document.createElement("div");
                fileNameDiv.className = "file-name";

                const fileNameText = document.createElement("p");
                fileNameText.textContent = v.name;

                const button = document.createElement("button");
                button.textContent = "Process";
                button.className = "select-btn";

                button.onclick = async () => {
                    try {
                        console.log("Processing Video:", v.name);
                        const response = await fetch(v.url);
                        if (!response.ok) throw new Error(`Failed to fetch video: ${response.status}`);
                        
                        const blob = await response.blob();
                        console.log("Video blob created:", blob.size, "bytes");

                        const file = new File([blob], v.name, { type: blob.type });
                        const dataTransfer = new DataTransfer();
                        dataTransfer.items.add(file);

                        if (!fileSend) throw new Error("fileSend element not found");

                        fileSend.files = dataTransfer.files;
                        fileSend.dispatchEvent(new Event("change", { bubbles: true }));
                        console.log("File sent to input:", fileSend.files[0].name);

                        showVideoInPreview(v.url, v.name);
                        popupOverlay.style.display = "none";
                        


                    } catch (error) {
                        console.error("Error processing video:", error);
                        alert(`Error: ${error.message}`);
                    }
                };

                fileNameDiv.appendChild(fileNameText);
                card.appendChild(videoElem);
                card.appendChild(fileNameDiv);
                card.appendChild(button);
                container.appendChild(card);
            });
        })
        .catch(error => {
            console.error("Error fetching videos:", error);
            const container = document.getElementById("uploaded-videos");
            container.innerHTML = `<p class="error">Error loading videos: ${error.message}</p>`;
        });

    // ✅ Open popup (no refetch)
    openPopupBtn.addEventListener("click", function () {
        popupOverlay.style.display = "flex";
    });

    // ✅ Close popup
    closePopupBtn.addEventListener("click", function () {
        popupOverlay.style.display = "none";
    });





   // ✅ Open popup for starting menu
    homeBtn.addEventListener("click", function () {
        //Startingpopup.style.display = "flex";
        window.location.href = '/'; 
    });

    closeStartPopup.addEventListener("click", function () {
        Startingpopup.style.display = "none";
    });





    // ✅ Function to show selected video in media preview
    function showVideoInPreview(videoUrl, videoName) {
        const videoPreview = document.getElementById("videoPreview");
        const audioPreview = document.getElementById("audioPreview");
        const mediaPreviewSection = document.getElementById("media-preview-section");

        audioPreview.style.display = "none";
        videoPreview.style.display = "block";
        videoPreview.src = videoUrl;
        videoPreview.setAttribute('data-filename', videoName);
        mediaPreviewSection.style.display = "block";

        if (fileNameDisplay) fileNameDisplay.textContent = videoUrl;
        console.log("Video preview updated with:", videoUrl);
    }

    // ✅ Resize toggles
    transcriptionBtn.addEventListener("click", function () {
        const box = document.querySelector(".results-container");
        box.classList.toggle("resized");
        Startingpopup.style.display = "none";

        if (summaryBox.style.display === "none" || summaryBox.classList.contains("hidden")) {
            //summaryBox.style.display = "block";
        } else {
            summaryBox.style.display = "none";
        }
    });

    tran_SummaryBtn.addEventListener("click", function () {
        const box2 = document.querySelector(".results-container");
        box2.classList.toggle("resized");
        Startingpopup.style.display = "none";
        if (summaryBox.style.display === "block" || summaryBox.classList.contains("hidden")) {
            //summaryBox.style.display = "none";
        } else {
            summaryBox.style.display = "block";
        }
    });
});
