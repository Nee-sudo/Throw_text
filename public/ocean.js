document.addEventListener('DOMContentLoaded', function() {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const pond = document.getElementById('pond');
  const messageInput = document.getElementById('message-input');
  const messageTitle = document.getElementById('message-title');
  const throwButton = document.getElementById('throw-button');

  if (window.OceanBottles && pond) {
    window.OceanBottles.init({ host: pond });
  }

  function loadOceanMessages() {
    if (!window.OceanBottles) return;

    if (window.OceanCache) {
      window.OceanCache.fetchFresh(100).then(function (messages) {
        window.OceanBottles.renderMessages(messages);
      });
      return;
    }

    if (window.__oceanMessagesPromise) {
      window.__oceanMessagesPromise.then(function (messages) {
        window.OceanBottles.renderMessages(messages);
      });
    }
  }

  function refreshOceanAfterThrow() {
    if (window.OceanBottles && window.OceanBottles.reloadFromServer) {
      return window.OceanBottles.reloadFromServer();
    }
    if (window.OceanCache && window.OceanBottles) {
      return window.OceanCache.fetchFresh(100).then(function (messages) {
        window.OceanBottles.renderMessages(messages);
      });
    }
    return Promise.resolve();
  }

  loadOceanMessages();

  function runDecorations() {
    const oceanFloorContents = document.querySelector('.ocean-floor-contents');
    const oceanEl = document.querySelector('.ocean');
    if (!oceanFloorContents || !oceanEl) return;

    function generateSeaWeed(bottom, left, scale) {
      const seaWeedParent = document.createElement('div');
      seaWeedParent.className = 'seaweed-parent';

      for (let i = 0; i < 3; i++) {
        const seaweedSection = document.createElement('div');
        seaweedSection.className = `seaweed-section seaweed-section-${i + 1}`;

        let lastNode;
        for (let j = 0; j < 10; j++) {
          const seaweed = document.createElement('div');
          seaweed.className = `seaweed seaweed-animation-${i + 1}`;

          if (!lastNode) {
            seaweedSection.appendChild(seaweed);
          } else {
            lastNode.appendChild(seaweed);
          }
          lastNode = seaweed;
        }

        seaWeedParent.appendChild(seaweedSection);
      }

      seaWeedParent.style.left = left;
      seaWeedParent.style.bottom = bottom;
      seaWeedParent.style.transform = `rotate(-90deg)scale(${scale})`;
      oceanFloorContents.appendChild(seaWeedParent);
    }

    function generateShells(count) {
      for (let i = 0; i < count; i++) {
        const shell = document.createElement('div');
        shell.className = 'shell';

        let left = Math.random() * 100;
        const bottom = Math.random() * 1;
        left = left > 15 ? left : 15;

        shell.style.left = `${left}%`;
        shell.style.bottom = `${bottom}rem`;
        oceanFloorContents.appendChild(shell);
      }
    }

    generateShells(4);

    function generateFish(count) {
      for (let i = 0; i < count; i++) {
        const color = `rgb(${(Math.random() * 255) | 0},${(Math.random() * 255) | 0},${(Math.random() * 255) | 0})`;
        const fishEl = document.createElement('div');

        let bottom = (Math.random() * 100) | 0;
        bottom = bottom > 15 ? bottom : 15;

        fishEl.className = 'fish-body';
        fishEl.style.bottom = `${bottom}%`;
        fishEl.style.setProperty('--color', color);

        const time = ((Math.random() * 15) | 0) + 12;
        const delay = (Math.random() * 8) | 0;
        const animationStyle = Math.random() > 0.5 ? 'cubic-bezier(.2,.4,.8,1.2)' : 'linear';

        if (Math.random() > 0.5) {
          fishEl.classList.add('fish-swim-left');
          fishEl.style.animation = `fishswimleft ${time}s ${delay}s ${animationStyle} infinite`;
        } else {
          fishEl.classList.add('fish-swim-right');
          fishEl.style.animation = `fishswimright ${time}s ${delay}s ${animationStyle} infinite`;
        }

        oceanEl.appendChild(fishEl);
      }
    }

    if (!prefersReducedMotion) {
      generateFish(6);
    }

    function generateOctopus() {
      const animations = ['octopus-animation-1', 'octopus-animation-2', 'octopus-animation-3'];

      const octopus = document.createElement('div');
      const octopusHead = document.createElement('div');
      const octopusBody = document.createElement('div');

      octopus.className = 'octopus';
      octopusHead.className = 'octopus-head';
      octopusBody.className = 'octopus-body';

      octopus.appendChild(octopusHead);
      octopus.appendChild(octopusBody);
      oceanEl.appendChild(octopus);

      for (let i = 0; i < 8; i++) {
        const octopusArm = document.createElement('div');
        octopusArm.className = 'octopus-arm';
        octopusBody.appendChild(octopusArm);

        const animation = animations[(Math.random() * animations.length) | 0];

        let lastNode;
        for (let j = 0; j < 10; j++) {
          const armBit = document.createElement('div');
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

    if (!prefersReducedMotion) {
      generateOctopus();
    }
  }

  runDecorations();

  function sendDataToBackend(title, message, ipAddress) {
    if (ipAddress == null) {
      fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          message,
          ipAddress: null,
          country: null,
          region: null,
          city: null,
        }),
      })
        .then((response) => {
          if (!response.ok) {
            return response.text().then((err) => {
              throw new Error(`HTTP error! status: ${response.status}, message: ${err}`);
            });
          }
          return response.json();
        })
        .then(() => refreshOceanAfterThrow())
        .catch((error) => {
          console.error('Error sending data to backend:', error);
          alert('There was an error sending your message. Please try again later.');
        });
      return;
    }

    const apiKey = '032783179f989d';
    const apiUrl = `https://ipinfo.io/${ipAddress}?token=${apiKey}`;

    fetch(apiUrl)
      .then((response) => {
        if (!response.ok) {
          return response.text().then((err) => {
            throw new Error(`ipinfo.io API error! status: ${response.status}, message: ${err}`);
          });
        }
        return response.json();
      })
      .then((ipinfoData) => {
        const { country, region, city } = ipinfoData;
        return fetch('/api/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, message, ipAddress, country, region, city }),
        });
      })
      .then((response) => {
        if (!response.ok) {
          return response.text().then((err) => {
            throw new Error(`HTTP error! status: ${response.status}, message: ${err}`);
          });
        }
        return response.json();
      })
      .then(() => refreshOceanAfterThrow())
      .catch((error) => {
        console.error('Error sending data to backend:', error);
        alert('There was an error sending your message. Please try again later.');
      });
  }

  if (throwButton) {
    throwButton.addEventListener('click', () => {
      const title = messageTitle.value.trim();
      const message = messageInput.value.trim();

      if (title !== '' && message !== '') {
        fetch('https://api.ipify.org?format=json')
          .then((response) => response.json())
          .then((data) => {
            const ipAddress = data.ip;
            sendDataToBackend(title, message, ipAddress);
          })
          .catch((error) => {
            console.error('Error getting IP address:', error);
            sendDataToBackend(title, message, 'IP address not found');
          });

        messageInput.value = '';
        messageTitle.value = '';
      }
    });
  }

  window.showMessagePopup = function showMessagePopup(title, message, createdAt) {
    const formattedDate = new Date(createdAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const formattedTime = new Date(createdAt).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
    });

    const popup = document.createElement('div');
    popup.classList.add('message-popup');

    const h2 = document.createElement('h2');
    h2.textContent = title;

    const pMsg = document.createElement('p');
    pMsg.className = 'popupMessage';
    pMsg.textContent = message;

    const pDate = document.createElement('p');
    pDate.className = 'date';
    pDate.textContent = `Date: ${formattedDate} ${formattedTime}`;

    const closeButton = document.createElement('button');
    closeButton.className = 'close-button';
    closeButton.type = 'button';
    closeButton.textContent = 'Close';

    popup.append(h2, pMsg, pDate, closeButton);
    document.body.appendChild(popup);

    closeButton.addEventListener('click', closeMessagePopup);
  };

  function closeMessagePopup() {
    const popup = document.querySelector('.message-popup');
    if (popup) popup.remove();
  }

  const oceanVideo = document.querySelector('.ocean-video');
  if (oceanVideo) {
    oceanVideo.setAttribute('preload', 'metadata');
    oceanVideo.play().catch(() => {});
  }

  const oceanSound = document.getElementById('ocean-sound');
  if (oceanSound) {
    oceanSound.play().catch(() => {});
  }

  let resizeTimer = null;
  window.addEventListener(
    'resize',
    function () {
      if (!window.OceanBottles) return;
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        if (window.OceanCache) {
          window.OceanCache.fetchFresh(100).then(function (list) {
            window.OceanBottles.renderMessages(list);
          });
          return;
        }
        const messages = window.__oceanMessagesCache;
        if (messages && messages.length) {
          window.OceanBottles.renderMessages(messages);
        }
      }, 250);
    },
    { passive: true }
  );
});

// ocean.js (about/collab section)
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

