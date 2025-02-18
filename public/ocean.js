document.addEventListener('DOMContentLoaded', function() {





  let oceanFloorContents = document.querySelector(".ocean-floor-contents");
  
        let oceanEl = document.querySelector(".ocean");
  
        function generateSeaWeed(bottom, left, scale) {
  
          let oceanFloor = document.querySelector(".ocean-floor");
  
  
  
          let seaWeedParent = document.createElement("div");
  
          seaWeedParent.className = "seaweed-parent";
  
          for (let i = 0; i < 3; i++) {
  
            let seaweedSection = document.createElement("div");
  
            seaweedSection.className = `seaweed-section seaweed-section-${i + 1}`;
  
            let lastNode;
  
            for (let j = 0; j < 10; j++) {
  
              let seaweed = document.createElement("div");
  
              seaweed.className = `seaweed seaweed-animation-${i + 1}`;
  
  
  
              if (!lastNode) {
  
                console.log("no children!");
  
                seaweedSection.appendChild(seaweed);
  
              } else {
  
                lastNode.appendChild(seaweed);
  
              }
  
              lastNode = seaweed;
  
            }
  
            seaWeedParent.appendChild(seaweedSection);
  
          }
  
          oceanFloorContents.appendChild(seaWeedParent);
  
          seaWeedParent.style.left = left;
  
          seaWeedParent.style.bottom = bottom;
  
          seaWeedParent.style.transform = `rotate(-90deg)scale(${scale})`;
  
        }
  
  
  
        // generateSeaWeed("1rem", "5%", 0.4);
  
        // generateSeaWeed(".85rem", "45%", 0.6);
  
        // generateSeaWeed("1.1rem", "85%", 0.3);
  
  
  
       
  
  
  
  
  
        function generateShells(count) {
  
          for (let i = 0; i < count; i++) {
  
            let shell = document.createElement("div");
  
            shell.className = "shell";
  
            let left = Math.random() * 100;
  
            let bottom = Math.random() * 1;
  
            left = left > 15 ? left : 15;
  
            shell.style.left = `${left}%`;
  
            // shell.style.width = width;
  
            // shell.style.height = height;
  
            shell.style.bottom = `${bottom}rem`;
  
            oceanFloorContents.appendChild(shell);
  
          }
  
        }
  
  
  
        generateShells(4);
  
  
  
        function generateFish(count) {
  
          for (let i = 0; i < count; i++) {
  
            let color = `rgb(${(Math.random() * 255) | 0},${
  
              (Math.random() * 255) | 0
  
            },${(Math.random() * 255) | 0})`;
  
            let fishEl = document.createElement("div");
  
            let bottom = (Math.random() * 100) | 0;
  
            bottom = bottom > 15 ? bottom : 15;
  
            fishEl.className = "fish-body";
  
            fishEl.style.bottom = `${bottom}%`;
  
            fishEl.style.setProperty("--color", color);
  
            let time = (Math.random() * 15) | (0 + 12);
  
            let delay = (Math.random() * 8) | 0;
  
            let animationStyle =
  
              Math.random() > 0.5 ? "cubic-bezier(.2,.4,.8,1.2)" : "linear";
  
  
  
            if (Math.random() > 0.5) {
  
              fishEl.classList.add("fish-swim-left");
  
  
  
              fishEl.style.animation = `fishswimleft ${time}s ${delay}s ${animationStyle} infinite`;
  
            } else {
  
              fishEl.classList.add("fish-swim-right");
  
              let style =
  
                Math.random() > 0.5 ? "cubic-bezier(.2,.4,.8,1.2)" : "linear";
  
              fishEl.style.animation = `fishswimright ${time}s ${delay}s ${animationStyle} infinite`;
  
            }
  
            oceanEl.appendChild(fishEl);
  
          }
  
        }
  
  
  
        generateFish(6);
  
  
  
  
  
  
  
        function generateOctopus() {
  
          let animations = [
  
            "octopus-animation-1",
  
            "octopus-animation-2",
  
            "octopus-animation-3",
  
            // "octopus-animation-4",
  
          ];
  
          let octopus = document.createElement("div");
  
          let octopusHead = document.createElement("div");
  
          let octopusBody = document.createElement("div");
  
          octopus.className = "octopus";
  
          octopusHead.className = "octopus-head";
  
          octopusBody.className = "octopus-body";
  
          octopus.appendChild(octopusHead);
  
          octopus.appendChild(octopusBody);
  
  
  
          oceanEl.appendChild(octopus);
  
          for (let i = 0; i < 8; i++) {
  
            let octopusArm = document.createElement("div");
  
            octopusArm.className = "octopus-arm";
  
            octopusBody.appendChild(octopusArm);
  
            let animation = animations[(Math.random() * animations.length) | 0];
  
            let lastNode;
  
            for (let j = 0; j < 10; j++) {
  
              let armBit = document.createElement("div");
  
              armBit.className = `octopus-tentacle-segment ${animation}`;
  
              if (!lastNode) {
  
                octopusArm.appendChild(armBit);
  
              } else {
  
                lastNode.appendChild(armBit);
  
              }
  
              lastNode = armBit;
  
            }
  
          }
  
        }
  
  
  
        generateOctopus();
  
  
  
        generateShells(4);
  
        generateFish(6);
  
        generateOctopus();
  
  
  
  
  
        const pond = document.getElementById('pond');
  
        const test = document.getElementById('test');
  
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
  
                        sendDataToBackend(title, message, ipAddress , country);
  
                        fetchAndDisplayMessages();
  
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
  
          const apiKey = '032783179f989d'; // Replace with your actual ipinfo.io API key
  
          const apiUrl = `https://ipinfo.io/${ipAddress}?token=${apiKey}`; // ipinfo.io API URL
  
     
  
          fetch(apiUrl)
  
              .then(response => {
  
                  if (!response.ok) {
  
                      return response.text().then(err => {throw new Error(`ipinfo.io API error! status: ${response.status}, message: ${err}`)}); // Include error message
  
                  }
  
                  return response.json();
  
              })
  
              .then(ipinfoData => {
  
                  const country = ipinfoData.country;
  
                  const region = ipinfoData.region;
  
                  const city = ipinfoData.city;
  
     
  
                  return fetch('/api/messages', { // Return the fetch promise
  
                      method: 'POST',
  
                      headers: {
  
                          'Content-Type': 'application/json'
  
                      },
  
                      body: JSON.stringify({ title, message, ipAddress, country, region, city })
  
                  }); // End of the fetch to /api/messages
  
              })
  
              .then(response => {
  
                  if (!response.ok) {
  
                      return response.text().then(err => {throw new Error(`HTTP error! status: ${response.status}, message: ${err}`)});
  
                  }
  
                  return response.json();
  
              })
  
              .then(data => {
  
                  console.log('Data sent to backend:', data);
  
                  createBottle(title, message, data.createdAt); // Pass createdAt
  
                  fetchAndDisplayMessages();
  
              })
  
              .catch(error => {
  
                  console.error('Error sending data to backend:', error);
  
                  alert("There was an error sending your message. Please try again later."); // Or any other user feedback
  
              });
  
      }
  
  
  
      // Store bottle positions
  
  let bottlePositions = [];
  
  
  
  function checkOverlap(newBottle, existingBottle) {
  
      return !(
  
          newBottle.x + newBottle.width < existingBottle.x ||
  
          newBottle.x > existingBottle.x + existingBottle.width ||
  
          newBottle.y + newBottle.height < existingBottle.y ||
  
          newBottle.y > existingBottle.y + existingBottle.height
  
      );
  
  }
  
  
  
  
  
  
  
  
  
  
  
  function createBottle(title, message, createdAt, countryCode) {
  
    const bottle = document.createElement('div');
  
    bottle.classList.add('bottle');
  
  
  
    const bottleWidth = 50; // Adjust as needed
  
    const bottleHeight = 80; // Adjust as needed
  
  
  
    let x, y, overlap;
  
  
  
    do {
  
        x = Math.random() * (pond.offsetWidth - bottleWidth);
  
        y = Math.random() * (pond.offsetHeight - bottleHeight);
  
  
  
        overlap = false;
  
        const newBottle = { x, y, width: bottleWidth, height: bottleHeight };
  
  
  
        for (const existingBottle of bottlePositions) {
  
            if (checkOverlap(newBottle, existingBottle)) {
  
                overlap = true;
  
                break;
  
            }
  
        }
  
    } while (overlap);
  
  
  
    bottle.style.left = x + 'px';
  
    bottle.style.top = y + 'px';
  
  
  
    const titleSpan = document.createElement('span');
  
    titleSpan.textContent = title;
  
    bottle.appendChild(titleSpan);
  
  
  
    if (countryCode) {
  
        const flagImg = document.createElement('img');
  
        flagImg.src = `https://flagcdn.com/20x15/${countryCode.toLowerCase()}.png`;
  
        flagImg.alt = `Flag of ${countryCode}`;
  
        flagImg.classList.add('flag');
  
        bottle.appendChild(flagImg);
  
    }
  
  
  
    bottle.addEventListener('click', () => {
  
        showMessagePopup(title, message, createdAt);
  
    });
  
  
  
    pond.appendChild(bottle);
  
  
  
    // Store the bottle's position
  
    bottlePositions.push({ x, y, width: bottleWidth, height: bottleHeight });
  
  }
  
  
  
    function showMessagePopup(title, message ,createdAt) {
  
      const formattedDate = new Date(createdAt).toLocaleDateString('en-US', { // Format date
  
        year: 'numeric',
  
        month: 'long',
  
        day: 'numeric'
  
    });
  
  
  
    const formattedTime = new Date(createdAt).toLocaleTimeString('en-US', { // Format time
  
        hour: 'numeric',
  
        minute: 'numeric',
  
        second: 'numeric'
  
    });
  
      const popup = document.createElement('div');
  
      popup.classList.add('message-popup');
  
      popup.innerHTML = `<h2>${title}</h2><p class = "popupMessage">${message}</p><p class = "date">Date: ${formattedDate} ${formattedTime}</p><button class="close-button">Close</button>`; // Include date and time
  
      document.body.appendChild(popup);
  
  
  
      // Add event listener to the close button:
  
      const closeButton = popup.querySelector('.close-button'); // Select the button using its class
  
      closeButton.addEventListener('click', closeMessagePopup); // Attach the event listener
  
  
  
  }
  
  
  
  function closeMessagePopup() {
  
    const popup = document.querySelector('.message-popup');
  
    if (popup) { // Check if the popup exists before trying to remove it
  
        popup.remove();
  
    }
  
  }
  
  
  
  function fetchAndDisplayMessages() {
  
    fetch('/api/messages')
  
        .then(response => {
  
            if (!response.ok) {
  
                throw new Error(`HTTP error! status: ${response.status}`);
  
            }
  
            return response.json();
  
        })
  
        .then(messages => {
  
            test.innerHTML = '';
  
            bottlePositions = []; // Clear existing positions
  
            messages.forEach(msg => {
  
                createBottle(msg.title, msg.message, msg.createdAt, msg.country);
  
            });
  
        })
  
        .catch(error => {
  
            console.error("Error fetching messages:", error);
  
        });
  
  }
  
  
  
  setTimeout(() => {
  
    fetchAndDisplayMessages();
  
  }, 100);
  
  
  
  });

  
  // ocean.js

// ocean.js

const aboutButton = document.getElementById('about-button');
const collabButton = document.getElementById('collab-button');
const aboutSection = document.getElementById('about-section');
const collabSection = document.getElementById('collab-section');
const closeButtons = document.querySelectorAll('.close-section');

function hideAllSections() {
    aboutSection.style.display = 'none';
    collabSection.style.display = 'none';
}

aboutButton.addEventListener('click', () => {
    hideAllSections();
    aboutSection.style.display = 'block';
    aboutSection.scrollIntoView({ behavior: 'smooth' });
});

collabButton.addEventListener('click', () => {
    hideAllSections();
    collabSection.style.display = 'block';
    collabSection.scrollIntoView({ behavior: 'smooth' });
});

closeButtons.forEach(button => {
    button.addEventListener('click', () => {
        const sectionId = button.dataset.section;
        const section = document.getElementById(sectionId);
        section.style.display = 'none';
    });
});