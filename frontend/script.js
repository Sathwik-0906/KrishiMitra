// This function runs automatically after the entire HTML page has finished loading.
document.addEventListener('DOMContentLoaded', () => {
    // This will now only run the code for the text input page.
    initTextPage();
});




/**
 * TEXT INPUT PAGE LOGIC
 * This section controls all functionality for the text_input.html page.
 */
function initTextPage() {
    // Get references to the important HTML elements we need to work with.
    const form = document.getElementById('text-form');
    const getLocationBtn = document.getElementById('get-location');
    const latInput = document.getElementById('latitude');
    const longInput = document.getElementById('longitude');
    const stateInput = document.getElementById('state');
    const districtInput = document.getElementById('district');


    // Add an event listener to the form for when the user clicks the "Submit" button.
    form.addEventListener('submit', (event) => {
        // This command prevents the browser from its default behavior of reloading the page on form submission.
        event.preventDefault();
       
        // Create a JavaScript object to hold all the form data.
        const data = {
            landArea: document.getElementById('land-area').value,
            previousCrop: document.getElementById('prev-crop').value,
            latitude: latInput.value,
            longitude: longInput.value,
            state: stateInput.value,
            district: districtInput.value,
        };


        // Get the HTML element where we want to display the results.
        const outputElement = document.getElementById('json-output');
        const resultContainer = document.getElementById('result-container');


        // Convert the JavaScript 'data' object into a clean, formatted string (JSON format).
        // This string is then placed inside the <pre> tag on the HTML page for the user to see.
        outputElement.textContent = JSON.stringify(data, null, 2);


        // Make the hidden result container visible.
        resultContainer.style.display = 'block';
    });


    // Add an event listener for when the user clicks the "Use My GPS Location" button.
    getLocationBtn.addEventListener('click', () => {
        // Check if the user's browser supports the Geolocation API.
        if (navigator.geolocation) {
            // Ask the browser for the user's current position.
            navigator.geolocation.getCurrentPosition(
                // This is the "success" function, which runs if the user allows the location request.
                (position) => {
                    const lat = position.coords.latitude;
                    const long = position.coords.longitude;


                    // Update the latitude and longitude input fields with the new coordinates.
                    latInput.value = lat.toFixed(6);
                    longInput.value = long.toFixed(6);


                    // Call our custom function to get the State and District from these coordinates.
                    fetchAddress(lat, long);
                },
                // This is the "error" function, which runs if the user denies the request or an error occurs.
                (error) => {
                    alert('Could not get your location. Please enter it manually.');
                    console.error("Geolocation error:", error);
                }
            );
        } else {
            // Alert the user if their browser is too old to support geolocation.
            alert('Geolocation is not supported by your browser.');
        }
    });


    // This function sends GPS coordinates to an external service to get address information.
    async function fetchAddress(lat, long) {
        // Using the free OpenStreetMap (Nominatim) API for reverse geocoding.
        const apiUrl = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${long}`;


        try {
            // Fetch the data from the API.
            const response = await fetch(apiUrl);
            // Parse the JSON response from the API into a JavaScript object.
            const data = await response.json();


            // Check if the API returned a valid address.
            if (data && data.address) {
                const address = data.address;
                // Update the State and District input fields with the address information.
                // It checks for different possible field names like 'state_district' or 'county'.
                stateInput.value = address.state || 'Not found';
                districtInput.value = address.state_district || address.county || 'Not found';
            } else {
                // Handle cases where the API doesn't find an address.
                stateInput.value = 'Could not determine';
                districtInput.value = 'Could not determine';
            }
        } catch (error) {
            // Handle network errors or problems with the API call itself.
            console.error("Reverse geocoding error:", error);
            stateInput.value = 'API error';
            districtInput.value = 'API error';
        }
    }
}
