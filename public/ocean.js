document.addEventListener('DOMContentLoaded', function() {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const pond = document.getElementById('pond');
  const messageInput = document.getElementById('message-input');
  const messageTitle = document.getElementById('message-title');
  const throwButton = document.getElementById('throw-button');
  const statusEl = document.getElementById('ocean-status');
  const statusTitleEl = document.getElementById('ocean-status-title');
  const statusBodyEl = document.getElementById('ocean-status-body');
  const refreshButton = document.getElementById('refresh-button');

  if (window.OceanBottles && pond) {
    window.OceanBottles.init({ host: pond });
  }

  /* ---------------------------------------------------------
     Toast notifications (replaces alert())
     --------------------------------------------------------- */

  function showToast(message, type) {
    const stack = document.getElementById('toast-stack');
    if (!stack) return;

    const toast = document.createElement('div');
    toast.className = 'toast' + (type ? ' toast--' + type : '');
    toast.setAttribute('role', type === 'error' ? 'alert' : 'status');
    toast.textContent = message;
    stack.appendChild(toast);

    const remove = function () {
      toast.classList.add('is-leaving');
      setTimeout(function () {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 200);
    };

    setTimeout(remove, 4000);
  }

  /* ---------------------------------------------------------
     Loading / empty ocean status
     --------------------------------------------------------- */

  function clearStatusButton() {
    if (!statusEl) return;
    const existingButton = statusEl.querySelector('button');
    if (existingButton) existingButton.remove();
  }

  function setOceanStatus(mode) {
    if (!statusEl || !statusTitleEl || !statusBodyEl) return;

    if (mode === 'loading') {
      clearStatusButton();
      statusEl.hidden = false;
      statusTitleEl.textContent = 'Listening to the ocean\u2026';
      statusBodyEl.textContent = '';
      return;
    }

    if (mode === 'empty') {
      clearStatusButton();
      statusEl.hidden = false;
      statusTitleEl.textContent = 'The ocean is quiet.';
      statusBodyEl.textContent = 'Be the first to release a message.';

      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = 'Release a Bottle';
      button.addEventListener('click', function () {
        if (messageTitle) messageTitle.focus();
      });
      statusEl.appendChild(button);
      return;
    }

    clearStatusButton();
    statusEl.hidden = true;
  }

  function loadOceanMessages() {
    if (!window.OceanBottles) return;

    setOceanStatus('loading');

    if (window.OceanCache) {
      window.OceanCache.fetchFresh(100).then(function (messages) {
        window.OceanBottles.renderMessages(messages);
        setOceanStatus(messages && messages.length ? 'hidden' : 'empty');
      });
      return;
    }

    if (window.__oceanMessagesPromise) {
      window.__oceanMessagesPromise.then(function (messages) {
        window.OceanBottles.renderMessages(messages);
        setOceanStatus(messages && messages.length ? 'hidden' : 'empty');
      });
    }
  }

  function refreshOceanAfterThrow() {
    if (window.OceanBottles && window.OceanBottles.reloadFromServer) {
      return window.OceanBottles.reloadFromServer().then(function (messages) {
        setOceanStatus(messages && messages.length ? 'hidden' : 'empty');
        return messages;
      });
    }
    if (window.OceanCache && window.OceanBottles) {
      return window.OceanCache.fetchFresh(100).then(function (messages) {
        window.OceanBottles.renderMessages(messages);
        setOceanStatus(messages && messages.length ? 'hidden' : 'empty');
        return messages;
      });
    }
    return Promise.resolve();
  }

  function refreshOceanManually() {
    if (!window.OceanBottles || !refreshButton) return;

    refreshButton.disabled = true;
    refreshButton.classList.add('is-loading');

    refreshOceanAfterThrow()
      .then(function (messages) {
        const count = Array.isArray(messages) ? messages.length : 0;
        showToast(
          count ? 'Ocean refreshed \u2014 new bottles are in.' : 'Ocean refreshed.',
          'success'
        );
      })
      .catch(function () {
        showToast('Could not refresh the ocean. Please try again.', 'error');
      })
      .finally(function () {
        refreshButton.disabled = false;
        refreshButton.classList.remove('is-loading');
      });
  }

  if (refreshButton) {
    refreshButton.addEventListener('click', refreshOceanManually);
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
        .then(() => {
          showToast('Your message has been released into the ocean.', 'success');
          closeOverlay();
          return refreshOceanAfterThrow();
        })
        .catch((error) => {
          console.error('Error sending data to backend:', error);
          showToast('Unable to release your message. Please try again.', 'error');
        })
        .finally(() => {
          if (throwButton) throwButton.disabled = false;
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
      .then(() => {
        showToast('Your message has been released into the ocean.', 'success');
        closeOverlay();
        return refreshOceanAfterThrow();
      })
      .catch((error) => {
        console.error('Error sending data to backend:', error);
        showToast('Unable to release your message. Please try again.', 'error');
      })
      .finally(() => {
        if (throwButton) throwButton.disabled = false;
      });
  }

  if (throwButton) {
    throwButton.addEventListener('click', () => {
      const title = messageTitle.value.trim();
      const message = messageInput.value.trim();

      if (title !== '' && message !== '') {
        throwButton.disabled = true;

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

  /* ---------------------------------------------------------
     Message popup (accessible modal)
     --------------------------------------------------------- */

  let lastFocusedElement = null;

  window.showMessagePopup = function showMessagePopup(title, message, createdAt, country) {
    lastFocusedElement = document.activeElement;

    const formattedDate = new Date(createdAt).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    const formattedTime = new Date(createdAt).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: 'numeric',
    });

    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop';

    const popup = document.createElement('div');
    popup.classList.add('message-popup');
    popup.setAttribute('role', 'dialog');
    popup.setAttribute('aria-modal', 'true');
    popup.setAttribute('aria-labelledby', 'message-popup-title');

    const closeButton = document.createElement('button');
    closeButton.className = 'close-button';
    closeButton.type = 'button';
    closeButton.setAttribute('aria-label', 'Return to ocean');
    closeButton.textContent = '\u2715';

    const eyebrow = document.createElement('p');
    eyebrow.className = 'popup-eyebrow';
    eyebrow.textContent = 'Message found';

    const h2 = document.createElement('h2');
    h2.id = 'message-popup-title';
    h2.textContent = title;

    const pMsg = document.createElement('p');
    pMsg.className = 'popupMessage';
    pMsg.textContent = message;

    const meta = document.createElement('p');
    meta.className = 'popup-meta';
    meta.textContent = `\uD83C\uDF0A Released ${formattedDate} \u00B7 ${formattedTime}`;

    if (country) {
      const flagImg = document.createElement('img');
      flagImg.alt = '';
      flagImg.loading = 'lazy';
      flagImg.decoding = 'async';
      flagImg.src = `https://flagcdn.com/20x15/${String(country).toLowerCase()}.png`;
      meta.appendChild(flagImg);
    }

    const returnButton = document.createElement('button');
    returnButton.className = 'return-button';
    returnButton.type = 'button';
    returnButton.textContent = 'Return to Ocean';

    popup.append(closeButton, eyebrow, h2, pMsg, meta, returnButton);
    backdrop.appendChild(popup);
    document.body.appendChild(backdrop);

    function close() {
      closeMessagePopup();
    }

    closeButton.addEventListener('click', close);
    returnButton.addEventListener('click', close);

    backdrop.addEventListener('click', (event) => {
      if (event.target === backdrop) close();
    });

    document.addEventListener('keydown', handleModalKeydown);

    closeButton.focus();
  };

  function handleModalKeydown(event) {
    if (event.key === 'Escape') {
      closeMessagePopup();
      return;
    }

    if (event.key === 'Tab') {
      const backdrop = document.querySelector('.modal-backdrop');
      if (!backdrop) return;
      const focusable = backdrop.querySelectorAll('button');
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  }

  function closeMessagePopup() {
    const backdrop = document.querySelector('.modal-backdrop');
    if (backdrop) backdrop.remove();
    document.removeEventListener('keydown', handleModalKeydown);
    if (lastFocusedElement && typeof lastFocusedElement.focus === 'function') {
      lastFocusedElement.focus();
    }
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
            setOceanStatus(list && list.length ? 'hidden' : 'empty');
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
  /* ---------------------------------------------------------
     Generic overlay system (About / Collaborate / Composer)
     --------------------------------------------------------- */

  let activeOverlay = null;
  let overlayLastFocused = null;

  function getFocusable(container) {
    return Array.from(
      container.querySelectorAll(
        'button, [href], input, textarea, select, [tabindex]:not([tabindex="-1"])'
      )
    ).filter((el) => !el.disabled && el.offsetParent !== null);
  }

  function handleOverlayKeydown(event) {
    if (!activeOverlay) return;

    if (event.key === 'Escape') {
      closeOverlay();
      return;
    }

    if (event.key === 'Tab') {
      const focusable = getFocusable(activeOverlay);
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  }

  function openOverlay(overlayId, focusTarget) {
    const overlay = document.getElementById(overlayId);
    if (!overlay) return;

    if (activeOverlay && activeOverlay !== overlay) {
      activeOverlay.hidden = true;
    }

    overlayLastFocused = document.activeElement;
    overlay.hidden = false;
    activeOverlay = overlay;

    document.addEventListener('keydown', handleOverlayKeydown);

    const target = focusTarget || overlay.querySelector('.close-button') || getFocusable(overlay)[0];
    if (target) target.focus();
  }

  function closeOverlay() {
    if (!activeOverlay) return;
    activeOverlay.hidden = true;
    activeOverlay = null;
    document.removeEventListener('keydown', handleOverlayKeydown);
    if (overlayLastFocused && typeof overlayLastFocused.focus === 'function') {
      overlayLastFocused.focus();
    }
  }

  document.querySelectorAll('.modal-backdrop[id]').forEach((backdrop) => {
    backdrop.addEventListener('click', (event) => {
      if (event.target === backdrop) closeOverlay();
    });
  });

  document.querySelectorAll('.overlay-close').forEach((button) => {
    button.addEventListener('click', closeOverlay);
  });

  const aboutButton = document.getElementById('about-button');
  const collabButton = document.getElementById('collab-button');
  const composeTrigger = document.getElementById('compose-trigger');

  if (aboutButton) {
    aboutButton.addEventListener('click', (event) => {
      event.preventDefault();
      openOverlay('about-overlay');
    });
  }

  if (collabButton) {
    collabButton.addEventListener('click', (event) => {
      event.preventDefault();
      openOverlay('collab-overlay');
    });
  }

  if (composeTrigger) {
    composeTrigger.addEventListener('click', () => {
      openOverlay('composer-overlay', messageTitle);
    });
  }
});
