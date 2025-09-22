document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('crop-form');
    const locationBtn = document.getElementById('location-btn');
    const locationStatus = document.getElementById('location-status');
    const recommendationDiv = document.getElementById('recommendation');

    let latitude = null;
    let longitude = null;

    locationBtn.addEventListener('click', () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    latitude = position.coords.latitude;
                    longitude = position.coords.longitude;
                    locationStatus.textContent = 'Location set';
                    locationStatus.style.color = 'green';
                },
                (error) => {
                    locationStatus.textContent = 'Location denied';
                    locationStatus.style.color = 'red';
                    console.error("Geolocation error:", error);
                }
            );
        } else {
            locationStatus.textContent = 'Geolocation is not supported by this browser.';
        }
    });

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        if (latitude === null || longitude === null) {
            alert('Please allow location access first.');
            return;
        }

        const landArea = document.getElementById('land-area').value;
        const prevCrop = document.getElementById('prev-crop').value;

        const data = {
            latitude: latitude,
            longitude: longitude,
            land_area: parseFloat(landArea),
            prev_crop: prevCrop
        };

        console.log('Sending to backend:', data);
        
        try {
            const response = await fetch('http://127.0.0.1:5000/predict_crop', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            recommendationDiv.textContent = `Recommended Crop: ${result.recommended_crop}`;
        } catch (error) {
            // Display a detailed error and dummy data
            recommendationDiv.innerHTML = `
                <p style="color: red;">Error: Could not get recommendation from server.</p>
                <p>Showing dummy data:</p>
                <p><strong>Recommended Crop: Corn</strong></p>
            `;
            console.error('Fetch error:', error);
        }
    });
});