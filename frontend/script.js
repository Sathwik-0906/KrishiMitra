document.addEventListener('DOMContentLoaded', () => {
    // Check which page is loaded and run the correct initialization function
    if (document.querySelector('.dashboard-grid')) {
        initDashboard();
    } else if (document.getElementById('text-form')) {
        initTextPage();
    } else if (document.getElementById('voice-form')) {
        initVoicePage();
    }
});

// Translations
const translations = {
    en: {
        title: "KrishiMitra",
        dashboard: "Dashboard",
        crop_recommendation: "Crop Recommendation",
        market_prices: "Market Prices",
        community_forum: "Community Forum",
        settings: "Settings",
        logout: "Log Out",
        paddy_rice: "Paddy (Rice)",
        paddy_rice_subtext: "This crop is highly recommended based on your local soil and climate data.",
        sowing_season: "Sowing Season",
        kharif: "Kharif",
        growth_duration: "Growth Duration",
        "120_days": "120 Days",
        expected_yield: "Expected Yield",
        yield_value: "4-5 tons/ha",
        new_recommendation: "Get New Recommendation",
        tomato: "Tomato",
        onion: "Onion",
        potato: "Potato",
        cotton: "Cotton",
        maize: "Maize",
        wheat: "Wheat",
    },
    hi: {
        title: "कृषि मित्र",
        dashboard: "डैशबोर्ड",
        crop_recommendation: "फसल सिफारिश",
        market_prices: "बाजार मूल्य",
        community_forum: "सामुदायिक मंच",
        settings: "सेटिंग्स",
        logout: "लॉग आउट",
        paddy_rice: "धान (चावल)",
        paddy_rice_subtext: "यह फसल आपके स्थानीय मिट्टी और जलवायु डेटा के आधार पर अत्यधिक अनुशंसित है।",
        sowing_season: "बुवाई का मौसम",
        kharif: "खरीफ",
        growth_duration: "विकास की अवधि",
        "120_days": "120 दिन",
        expected_yield: "अपेक्षित उपज",
        yield_value: "4-5 टन/हेक्टेयर",
        new_recommendation: "नई सिफारिश प्राप्त करें",
        tomato: "टमाटर",
        onion: "प्याज",
        potato: "आलू",
        cotton: "कपास",
        maize: "मक्का",
        wheat: "गेहूँ",
    },
    te: {
        title: "కృషి మిత్ర",
        dashboard: "డాష్బోర్డ్",
        crop_recommendation: "పంట సిఫార్సు",
        market_prices: "మార్కెట్ ధరలు",
        community_forum: "సంఘ వేదిక",
        settings: "సెట్టింగులు",
        logout: "లాగ్ అవుట్",
        paddy_rice: "వరి (బియ్యం)",
        paddy_rice_subtext: "ఈ పంట మీ స్థానిక నేల మరియు వాతావరణ సమాచారం ఆధారంగా చాలా సిఫార్సు చేయబడింది.",
        sowing_season: "విత్తే కాలం",
        kharif: "ఖరీఫ్",
        growth_duration: "పెరుగుదల కాలం",
        "120_days": "120 రోజులు",
        expected_yield: "ఆశించిన దిగుబడి",
        yield_value: "4-5 టన్నులు/హెక్టారుకు",
        new_recommendation: "క్రొత్త సిఫార్సును పొందండి",
        tomato: "టమోటా",
        onion: "ఉల్లిపాయ",
        potato: "బంగాళదుంప",
        cotton: "పత్తి",
        maize: "మొక్కజొన్న",
        wheat: "గోధుమ",
    },
};


// This function is still here for your other pages
async function fetchAddress(lat, long) {
    const stateInput = document.getElementById('state');
    const districtInput = document.getElementById('district');
    const apiUrl = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${long}`;

    try {
        const response = await fetch(apiUrl);
        const data = await response.json();

        if (data && data.address) {
            const address = data.address;
            stateInput.value = address.state || 'Not found';
            districtInput.value = address.state_district || address.county || 'Not found';
        } else {
            stateInput.value = 'Could not determine';
            districtInput.value = 'Could not determine';
        }

    } catch (error) {
        console.error("Reverse geocoding error:", error);
        stateInput.value = 'API error';
        districtInput.value = 'API error';
    }
}

/**
 * DASHBOARD PAGE LOGIC
 */
function initDashboard() {
    console.log("Final Dashboard Loaded.");
    const languageSwitcher = document.getElementById('language-switcher');
    const translatableElements = document.querySelectorAll('[data-key]');

    function translatePage(language) {
        translatableElements.forEach(element => {
            const key = element.getAttribute('data-key');
            element.textContent = translations[language][key];
        });
    }

    languageSwitcher.addEventListener('change', (event) => {
        translatePage(event.target.value);
    });

    // Initial translation
    translatePage('en');
}


/**
 * TEXT INPUT PAGE LOGIC (Your original code - Unchanged)
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
            state: document.getElementById('state').value,
            district: document.getElementById('district').value,
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
                    const lat = position.coords.latitude;
                    const long = position.coords.longitude;
                    latInput.value = lat.toFixed(6);
                    longInput.value = long.toFixed(6);
                    fetchAddress(lat, long);
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
 * VOICE INPUT PAGE LOGIC (Your original code - Unchanged)
 */
function initVoicePage() {
    const form = document.getElementById('voice-form');
    const startListeningBtn = document.getElementById('start-listening');
    const getLocationBtn = document.getElementById('get-location');
    const statusBox = document.getElementById('status');
    const landAreaInput = document.getElementById('land-area');
    const prevCropInput = document.getElementById('prev-crop');
    const latInput = document.getElementById('latitude');
    const longInput = document.getElementById('longitude');
    const stateInput = document.getElementById('state');
    const districtInput = document.getElementById('district');

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        alert('Your browser does not support Speech Recognition. Please try Chrome or Firefox.');
        return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.lang = 'en-US';
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    let isListening = false;
    let finalTranscript = '';

    startListeningBtn.addEventListener('click', () => {
        if (isListening) {
            recognition.stop();
            return;
        }
        recognition.start();
    });

    getLocationBtn.addEventListener('click', () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const lat = position.coords.latitude;
                    const long = position.coords.longitude;
                    latInput.value = lat.toFixed(6);
                    longInput.value = long.toFixed(6);
                    fetchAddress(lat, long);
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

    recognition.onstart = () => {
        isListening = true;
        startListeningBtn.textContent = 'Stop Listening';
        statusBox.innerHTML = 'Listening... Speak now.<br><small>Say "stop listening" to finish.</small>';
        statusBox.style.display = 'block';
    };

    recognition.onend = () => {
        isListening = false;
        startListeningBtn.textContent = 'Start Listening';
        statusBox.style.display = 'none';
        parseVoiceCommand(finalTranscript);
        finalTranscript = '';
    };

    recognition.onerror = (event) => {
        alert('Speech recognition error: ' + event.error);
        statusBox.textContent = 'Error: ' + event.error;
    };

    recognition.onresult = (event) => {
        let interimTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
                finalTranscript += event.results[i][0].transcript;
            } else {
                interimTranscript += event.results[i][0].transcript;
            }
        }
        
        statusBox.innerHTML = `Listening...<br><small>${interimTranscript}</small>`;
        
        if (finalTranscript.toLowerCase().includes('stop listening')) {
            recognition.stop();
        }
    };
    
    function parseVoiceCommand(transcript) {
        const commands = [
            { keyword: 'land area', input: landAreaInput },
            { keyword: 'previous crop', input: prevCropInput },
            { keyword: 'latitude', input: latInput },
            { keyword: 'longitude', input: longInput },
            { keyword: 'state', input: stateInput },
            { keyword: 'district', input: districtInput },
        ];

        commands.forEach(command => {
            const regex = new RegExp(command.keyword + '\\s*(is|was|to)?\\s*([\\w\\s\\d.-]+)', 'i');
            const match = transcript.match(regex);
            if (match && match[2]) {
                let value = match[2].trim();
                const nextKeywordIndex = transcript.indexOf(match[0]) + match[0].length;
                const remainingTranscript = transcript.substring(nextKeywordIndex);
                
                let endOfValue = remainingTranscript.length;
                commands.forEach(nextCmd => {
                    if (remainingTranscript.includes(nextCmd.keyword)) {
                        endOfValue = Math.min(endOfValue, remainingTranscript.indexOf(nextCmd.keyword));
                    }
                });
                
                value = remainingTranscript.substring(0, endOfValue).trim();
                command.input.value = value;
            }
        });
    }

    form.addEventListener('submit', (event) => {
        event.preventDefault();
        const data = {
            landArea: landAreaInput.value,
            previousCrop: prevCropInput.value,
            latitude: latInput.value,
            longitude: longInput.value,
            state: stateInput.value,
            district: districtInput.value,
        };
        const outputElement = document.getElementById('json-output');
        const resultContainer = document.getElementById('result-container');
        outputElement.textContent = JSON.stringify(data, null, 2);
        resultContainer.style.display = 'block';
    });
}