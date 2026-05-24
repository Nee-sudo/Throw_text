/**
 * Fast bottle/message rendering for the ocean page.
 */
(function (global) {
  "use strict";

  const BOTTLE_W = 50;
  const BOTTLE_H = 80;
  const SLOT_PAD_X = 55;
  const SLOT_PAD_Y = 88;
  const CHUNK_SIZE =
    typeof global.matchMedia === "function" &&
    global.matchMedia("(max-width: 768px)").matches
      ? 15
      : 30;

  const messageStore = new Map();
  let layer = null;
  let host = null;
  let slots = [];
  let slotIndex = 0;

  function measureHost() {
    if (!host) return { w: 0, h: 0 };
    const rect = host.getBoundingClientRect();
    return { w: rect.width, h: rect.height };
  }

  function buildSlots(width, height) {
    const cols = Math.max(1, Math.floor((width - BOTTLE_W) / SLOT_PAD_X));
    const rows = Math.max(1, Math.floor((height - BOTTLE_H) / SLOT_PAD_Y));
    const list = [];

    for (let r = 0; r < rows; r += 1) {
      for (let c = 0; c < cols; c += 1) {
        list.push({
          x: c * SLOT_PAD_X + 8 + ((r + c) % 3) * 4,
          y: r * SLOT_PAD_Y + 8 + ((r * c) % 3) * 3,
        });
      }
    }

    for (let i = list.length - 1; i > 0; i -= 1) {
      const j = (Math.random() * (i + 1)) | 0;
      const tmp = list[i];
      list[i] = list[j];
      list[j] = tmp;
    }

    return list;
  }

  function nextSlot() {
    if (!slots.length) return { x: 8, y: 8 };
    const slot = slots[slotIndex % slots.length];
    slotIndex += 1;
    return slot;
  }

  function buildBottle(msg, index) {
    const id = String(msg._id || `local-${index}-${msg.createdAt || Date.now()}`);
    messageStore.set(id, {
      title: msg.title || "",
      message: msg.message || "",
      createdAt: msg.createdAt,
    });

    const bottle = document.createElement("div");
    bottle.className = "bottle";
    bottle.dataset.bid = id;

    const { x, y } = nextSlot();
    bottle.style.left = `${x}px`;
    bottle.style.top = `${y}px`;

    const titleSpan = document.createElement("span");
    titleSpan.textContent = msg.title || "";
    bottle.appendChild(titleSpan);

    if (msg.country) {
      const flagImg = document.createElement("img");
      flagImg.className = "flag";
      flagImg.alt = "";
      flagImg.loading = "lazy";
      flagImg.decoding = "async";
      flagImg.src = `https://flagcdn.com/20x15/${String(msg.country).toLowerCase()}.png`;
      bottle.appendChild(flagImg);
    }

    return bottle;
  }

  function clearBottles() {
    messageStore.clear();
    slotIndex = 0;
    if (layer) layer.replaceChildren();
  }

  function renderMessages(messages, onDone) {
    if (!layer || !host) return;

    const list = Array.isArray(messages) ? messages : [];
    let dims = measureHost();

    if (dims.w < 1 || dims.h < 1) {
      requestAnimationFrame(() => renderMessages(list, onDone));
      return;
    }

    clearBottles();
    slots = buildSlots(dims.w, dims.h);
    global.__oceanMessagesCache = list.slice();

    let cursor = 0;

    function renderChunk() {
      const end = Math.min(cursor + CHUNK_SIZE, list.length);
      const fragment = document.createDocumentFragment();

      for (; cursor < end; cursor += 1) {
        fragment.appendChild(buildBottle(list[cursor], cursor));
      }

      layer.appendChild(fragment);

      if (cursor < list.length) {
        requestAnimationFrame(renderChunk);
      } else if (typeof onDone === "function") {
        onDone(list.length);
      }
    }

    requestAnimationFrame(renderChunk);
  }

  function handleBottleClick(event) {
    const bottle = event.target.closest(".bottle");
    if (!bottle || !layer || !layer.contains(bottle)) return;

    const data = messageStore.get(bottle.dataset.bid);
    if (!data) return;

    if (typeof global.showMessagePopup === "function") {
      global.showMessagePopup(data.title, data.message, data.createdAt);
    }
  }

  function init(options) {
    host = options.host || document.getElementById("pond");
    layer =
      options.layer ||
      document.getElementById("bottles-layer") ||
      document.getElementById("test");

    if (!layer && host) {
      layer = document.createElement("div");
      layer.id = "bottles-layer";
      layer.className = "bottles-layer";
      host.appendChild(layer);
    }

    if (host && layer) {
      host.addEventListener("click", handleBottleClick);
    }

    return { host, layer };
  }

  function cacheMessage(msg) {
    if (!global.__oceanMessagesCache) {
      global.__oceanMessagesCache = [];
    }
    global.__oceanMessagesCache.unshift(msg);
  }

  function appendBottle(msg) {
    if (!layer || !host) return;

    const dims = measureHost();
    if (!slots.length) slots = buildSlots(dims.w, dims.h);

    const bottle = buildBottle(msg, slotIndex);
    layer.appendChild(bottle);
    cacheMessage(msg);
  }

  global.OceanBottles = {
    init,
    renderMessages,
    appendBottle,
    clearBottles,
    measureHost,
  };
})(window);
