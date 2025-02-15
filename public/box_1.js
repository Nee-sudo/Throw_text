// ... (Existing code for generating seaweed, shells, fish, octopus) ...

const pond = document.getElementById('pond');
const messageInput = document.getElementById('message-input');
const messageTitle = document.getElementById('message-title');
const throwButton = document.getElementById('throw-button');

throwButton.addEventListener('click', () => {
    const title = messageTitle.value.trim();
    const message = messageInput.value.trim();

    if (title !== "" && message !== "") {
        // Get IP address (using a free service for demonstration)
        fetch('https://api.ipify.org?format=json') // or a better IP geolocation service
            .then(response => response.json())
            .then(data => {
                const ipAddress = data.ip;
                sendDataToBackend(title, message, ipAddress);
            })
            .catch(error => {
                console.error("Error getting IP address:", error);
                // Handle the error appropriately, perhaps use a default IP or don't send IP
                sendDataToBackend(title, message, "IP address not found"); // Example: send "not found"
            });


        messageInput.value = "";
        messageTitle.value = "";
    }
});

function sendDataToBackend(title, message, ipAddress) {
    fetch('/api/messages', { // Replace with your backend endpoint
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ title, message, ipAddress })
    })
    .then(response => response.json())
    .then(data => {
        console.log('Data sent to backend:', data);
        createBottle(title, message); // Create the bottle after successful send
        fetchAndDisplayMessages();      // Update the display with all messages
    })
    .catch(error => {
        console.error('Error sending data to backend:', error);
    });
}


function createBottle(title, message) {  // No changes here
    // ... (Your existing createBottle function)
}

function showMessagePopup(title, message) { // No changes here
    // ... (Your existing showMessagePopup function)
}

function closeMessagePopup() { // No changes here
    // ... (Your existing closeMessagePopup function)
}

function fetchAndDisplayMessages() {
    fetch('/api/messages') // Get all messages from the backend
        .then(response => response.json())
        .then(messages => {
            pond.innerHTML = ''; // Clear existing bottles
            messages.forEach(msg => {
                createBottle(msg.title, msg.message);
            });
        })
        .catch(error => {
            console.error("Error fetching messages:", error);
        });
}

// Call this function initially to display any existing messages
fetchAndDisplayMessages();

function createBottle(title, message) {
    const bottleContainer = document.createElement('div');
    bottleContainer.classList.add('bottle-container');

    const bottle = document.createElement('div');
    bottle.classList.add('bottle');

    // ... (rest of your bottle creation code)

    bottleContainer.appendChild(bottle); // Append bottle to container
    pond.appendChild(bottleContainer); // Append container to pond
}

function sendDataToBackend(title, message, ipAddress) {
    const apiKey = 'YOUR_IPINFO_API_KEY'; // Replace with your actual ipinfo.io API key
    const apiUrl = `https://ipinfo.io/${ipAddress}?token=${apiKey}`; // ipinfo.io API URL

    fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error(`ipinfo.io API error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(ipinfoData => {
            const country = ipinfoData.country; // Get the country code (e.g., "US", "IN")
            const region = ipinfoData.region; // You can also get the region
            const city = ipinfoData.city;

            fetch('/api/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ title, message, ipAddress, country, region, city }) // Include country, region and city
            })
            .then(response => { // ... (rest of your fetch code) })
            .catch(error => { // ... (error handling) });
        })
        .catch(error => {
            console.error('Error getting IP info:', error);
            const country = "Unknown"; // Handle error, default unknown
            const region = "Unknown"; // Handle error, default unknown
            const city = "Unknown";
            fetch('/api/messages', { // Still send the message even if geolocation fails
                // ... (headers)
                body: JSON.stringify({ title, message, ipAddress, country, region, city }) // Include country even on error

            })
             // ... (rest of the then and catch part of fetch)
        });
});