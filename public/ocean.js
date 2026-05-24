document.addEventListener('DOMContentLoaded', function() {
  const isMobile = window.matchMedia('(max-width: 768px)').matches;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const pond = document.getElementById('pond');
  const messageInput = document.getElementById('message-input');
  const messageTitle = document.getElementById('message-title');
  const throwButton = document.getElementById('throw-button');

  if (window.OceanBottles && pond) {
    window.OceanBottles.init({ host: pond });
  }

  if (window.__oceanMessagesPromise && window.OceanBottles) {
    window.__oceanMessagesPromise.then(function (messages) {
      window.OceanBottles.renderMessages(messages);
    });
  }

  function runDecorations() {





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
  
  
  
      const decorCount = isMobile ? 2 : 4;
      generateShells(decorCount);

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

      if (!isMobile && !prefersReducedMotion) {
        generateFish(6);
      }




  
  
  
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
  
  
  
      if (!isMobile && !prefersReducedMotion) {
        generateOctopus();
      }
  }

  if ("requestIdleCallback" in window) {
    requestIdleCallback(runDecorations, { timeout: 1200 });
  } else {
    setTimeout(runDecorations, 0);
  }

  if (throwButton) {
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
  
       
  
// Inside the sendDataToBackend function:
function sendDataToBackend(title, message, ipAddress) {
    if (ipAddress == null){
        fetch('/api/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ title, message, ipAddress: null, country: null, region: null, city: null })
        })
        .then(response => {
            if (!response.ok) {
                return response.text().then(err => {throw new Error(`HTTP error! status: ${response.status}, message: ${err}`)});
            }
            return response.json();
        })
        .then(data => {
            if (window.OceanBottles) {
              window.OceanBottles.appendBottle({
                title,
                message,
                createdAt: data.createdAt,
                country: data.country,
                _id: data._id,
              });
            }
        })
        .catch(error => {
            console.error('Error sending data to backend:', error);
            alert("There was an error sending your message. Please try again later.");
        });
        return;
    }
    const apiKey = '032783179f989d';
    const apiUrl = `https://ipinfo.io/${ipAddress}?token=${apiKey}`;

    fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
                return response.text().then(err => {throw new Error(`ipinfo.io API error! status: ${response.status}, message: ${err}`)});
            }
            return response.json();
        })
        .then(ipinfoData => {
            const country = ipinfoData.country;
            const region = ipinfoData.region;
            const city = ipinfoData.city;

            return fetch('/api/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ title, message, ipAddress, country, region, city })
            });
        })
        .then(response => {
            if (!response.ok) {
                return response.text().then(err => {throw new Error(`HTTP error! status: ${response.status}, message: ${err}`)});
            }
            return response.json();
        })
        .then(data => {
            if (window.OceanBottles) {
              window.OceanBottles.appendBottle({
                title,
                message,
                createdAt: data.createdAt,
                country: data.country,
                _id: data._id,
              });
            }
        })
        .catch(error => {
            console.error('Error sending data to backend:', error);
            alert("There was an error sending your message. Please try again later.");
        });
}

  window.showMessagePopup = function showMessagePopup(title, message, createdAt) {
  
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
  
      const h2 = document.createElement("h2");
    h2.textContent = title;
    const pMsg = document.createElement("p");
    pMsg.className = "popupMessage";
    pMsg.textContent = message;
    const pDate = document.createElement("p");
    pDate.className = "date";
    pDate.textContent = `Date: ${formattedDate} ${formattedTime}`;
    const closeButton = document.createElement("button");
    closeButton.className = "close-button";
    closeButton.type = "button";
    closeButton.textContent = "Close";
    popup.append(h2, pMsg, pDate, closeButton);
      document.body.appendChild(popup);
      closeButton.addEventListener('click', closeMessagePopup);
  };

  function closeMessagePopup() {
  
    const popup = document.querySelector('.message-popup');
  
    if (popup) { // Check if the popup exists before trying to remove it
  
        popup.remove();
  
    }
  
  }

  const oceanVideo = document.querySelector('.ocean-video');
  if (oceanVideo && isMobile) {
    oceanVideo.removeAttribute('autoplay');
    oceanVideo.pause();
  } else if (oceanVideo && !isMobile) {
    oceanVideo.setAttribute('preload', 'metadata');
  }

  const oceanSound = document.getElementById('ocean-sound');
  if (oceanSound && !isMobile) {
    oceanSound.play().catch(() => {});
  }

  let resizeTimer = null;
  window.addEventListener(
    "resize",
    function () {
      if (!window.OceanBottles || !window.__oceanMessagesPromise) return;
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        const messages =
          window.__oceanMessagesCache ||
          (window.__oceanMessagesPromise
            ? null
            : []);
        if (messages) {
          window.OceanBottles.renderMessages(messages);
          return;
        }
        window.__oceanMessagesPromise.then(function (list) {
          window.OceanBottles.renderMessages(list);
        });
      }, 200);
    },
    { passive: true }
  );
  });

  
  // ocean.js

// ocean.js

document.addEventListener('DOMContentLoaded', () => {
  const aboutButton = document.getElementById('about-button');
  const collabButton = document.getElementById('collab-button');
  const aboutSection = document.getElementById('about-section');
  const collabSection = document.getElementById('collab-section');
  const closeButtons = document.querySelectorAll('.close-section');
  if (!aboutButton || !collabButton) return;

  function hideAllSections() {
    aboutSection.style.display = 'none';
    collabSection.style.display = 'none';
  }

  aboutButton.addEventListener('click', (e) => {
    e.preventDefault();
    hideAllSections();
    aboutSection.style.display = 'block';
    aboutSection.scrollIntoView({ behavior: 'smooth' });
  });

  collabButton.addEventListener('click', (e) => {
    e.preventDefault();
    hideAllSections();
    collabSection.style.display = 'block';
    collabSection.scrollIntoView({ behavior: 'smooth' });
  });

  closeButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const sectionId = button.dataset.section;
      const section = document.getElementById(sectionId);
      if (section) section.style.display = 'none';
    });
  });
});