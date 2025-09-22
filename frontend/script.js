document.addEventListener('DOMContentLoaded', () => {
    // Detect page type
    if (document.getElementById('text-form')) {
        initTextPage();
    } else if (document.getElementById('start-voice-btn')) {
        initVoicePage();
    }
});

/**
 * TEXT INPUT PAGE LOGIC
 */
function initTextPage() {
    const form = document.getElementById('text-form');
    const getLocationBtn = document.getElementById('get-location');
    const latInput = document.getElementById('latitude');
    const longInput = document.getElementById('longitude');

    form.addEventListener('submit', (event) => {
        event.preventDefault();
        
        const data = {
            landArea: document.getElementById('land-area').value,
            previousCrop: document.getElementById('prev-crop').value,
            latitude: latInput.value,
            longitude: longInput.value,
        };

        const outputElement = document.getElementById('json-output');
        const resultContainer = document.getElementById('result-container');
        outputElement.textContent = JSON.stringify(data, null, 2);
        resultContainer.style.display = 'block';
    });

    getLocationBtn.addEventListener('click', () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    latInput.value = position.coords.latitude.toFixed(6);
                    longInput.value = position.coords.longitude.toFixed(6);
                },
                (error) => {
                    alert('Could not get your location. Please enter it manually.');
                    console.error("Geolocation error:", error);
                }
            );
        } else {
            alert('Geolocation is not supported by your browser.');
        }
    });
}

/**
 * VOICE INPUT PAGE LOGIC (Whisper Integration)
 */
function initVoicePage() {
    const startBtn = document.getElementById('start-voice-btn');
    const statusDiv = document.getElementById('voice-status');
    const transcriptOutput = document.getElementById('transcript-output');
    const resultContainer = document.getElementById('result-container');
    const jsonOutput = document.getElementById('json-output');

    const questions = [
        "What is the total land area in acres?",
        "What was the last crop you cultivated?",
        "What is the name of your state or province?"
    ];

    let currentQuestionIndex = 0;
    const answers = {};

    startBtn.addEventListener('click', () => {
        startBtn.disabled = true;
        askQuestion();
    });

    function askQuestion() {
        if (currentQuestionIndex < questions.length) {
            const question = questions[currentQuestionIndex];
            speak(question, async () => {
                await recordAndTranscribe(question);
            });
            statusDiv.innerHTML = `<p><strong>Asking:</strong> ${question}</p>`;
        } else {
            speak("Thank you. I have all the information.", () => {
                statusDiv.innerHTML = "<p>All questions answered. Processing...</p>";
                displayFinalResults();
            });
        }
    }

    function speak(text, onEndCallback) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.onend = onEndCallback;
        window.speechSynthesis.speak(utterance);
    }

    async function recordAndTranscribe(question) {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            const audioChunks = [];

            mediaRecorder.ondataavailable = event => {
                if (event.data.size > 0) audioChunks.push(event.data);
            };

            mediaRecorder.start();
            statusDiv.innerHTML = "<p>Recording... Speak now!</p>";

            // Record for 5 seconds (adjust if needed)
            await new Promise(resolve => setTimeout(resolve, 5000));
            mediaRecorder.stop();

            await new Promise(resolve => {
                mediaRecorder.onstop = resolve;
            });

            const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });

            // Send audio to backend Whisper route
            const formData = new FormData();
            formData.append("audio", audioBlob, "answer.wav");

            const response = await fetch("http://localhost:5000/transcribe_audio", {
                method: "POST",
                body: formData
            });

            const data = await response.json();
            const transcript = data.transcript || "No transcription received";

            transcriptOutput.textContent += `Q: ${question}\nA: ${transcript}\n\n`;

            // Save answer in JSON object
            const key = `answer${currentQuestionIndex + 1}`;
            answers[key] = transcript;

            currentQuestionIndex++;
            askQuestion();
        } catch (err) {
            statusDiv.innerHTML = "<p>Error recording or transcribing audio. Please try again.</p>";
            console.error(err);
            startBtn.disabled = false;
        }
    }

    function displayFinalResults() {
        jsonOutput.textContent = JSON.stringify(answers, null, 2);
        resultContainer.style.display = 'block';
        document.getElementById('transcript-container').style.display = 'block';
        startBtn.disabled = false;
    }
}
