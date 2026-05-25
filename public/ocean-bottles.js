/**
 * Fast random bottle/message rendering for the ocean page.
 */
(function (global) {
  "use strict";

  const BOTTLE_W = 50;
  const BOTTLE_H = 80;

  const messageStore = new Map();
  const spatialBuckets = new Map();
  let layer = null;
  let host = null;
  let pondWidth = 0;
  let pondHeight = 0;
  let layout = null;

  function isMobileView() {
    return (
      typeof global.matchMedia === "function" &&
      global.matchMedia("(max-width: 768px)").matches
    );
  }

  function getLayout() {
    const mobile = isMobileView();
    return {
      mobile,
      bottleW: mobile ? 44 : BOTTLE_W,
      bottleH: mobile ? 72 : BOTTLE_H,
      padding: mobile ? 20 : 10,
      floatMargin: mobile ? 14 : 8,
      cellSize: mobile ? 76 : 58,
      maxRandomAttempts: mobile ? 200 : 60,
      chunkSize: mobile ? 10 : 30,
    };
  }

  function measureHost() {
    if (!host) return { w: 0, h: 0 };
    const rect = host.getBoundingClientRect();
    pondWidth = rect.width;
    pondHeight = rect.height;
    layout = getLayout();
    return { w: pondWidth, h: pondHeight };
  }

  function collisionRect(x, y) {
    const pad = layout.padding;
    const float = layout.floatMargin;
    return {
      x: x - pad,
      y: y - pad,
      w: layout.bottleW + pad * 2,
      h: layout.bottleH + pad * 2 + float,
    };
  }

  function bucketKey(cx, cy) {
    return `${cx},${cy}`;
  }

  function addToBuckets(rect) {
    const cell = layout.cellSize;
    const x0 = Math.floor(rect.x / cell);
    const y0 = Math.floor(rect.y / cell);
    const x1 = Math.floor((rect.x + rect.w) / cell);
    const y1 = Math.floor((rect.y + rect.h) / cell);

    for (let cx = x0; cx <= x1; cx += 1) {
      for (let cy = y0; cy <= y1; cy += 1) {
        const key = bucketKey(cx, cy);
        if (!spatialBuckets.has(key)) spatialBuckets.set(key, []);
        spatialBuckets.get(key).push(rect);
      }
    }
  }

  function rectsOverlap(a, b) {
    return !(
      a.x + a.w <= b.x ||
      a.x >= b.x + b.w ||
      a.y + a.h <= b.y ||
      a.y >= b.y + b.h
    );
  }

  function hasOverlapAt(x, y) {
    const candidate = collisionRect(x, y);
    const cell = layout.cellSize;
    const cx0 = Math.floor(candidate.x / cell) - 1;
    const cy0 = Math.floor(candidate.y / cell) - 1;
    const cx1 = Math.floor((candidate.x + candidate.w) / cell) + 1;
    const cy1 = Math.floor((candidate.y + candidate.h) / cell) + 1;

    for (let cx = cx0; cx <= cx1; cx += 1) {
      for (let cy = cy0; cy <= cy1; cy += 1) {
        const bucket = spatialBuckets.get(bucketKey(cx, cy));
        if (!bucket) continue;
        for (let i = 0; i < bucket.length; i += 1) {
          if (rectsOverlap(candidate, bucket[i])) return true;
        }
      }
    }
    return false;
  }

  function commitPosition(x, y) {
    const rect = collisionRect(x, y);
    addToBuckets(rect);
    return { x, y };
  }

  function shuffle(list) {
    for (let i = list.length - 1; i > 0; i -= 1) {
      const j = (Math.random() * (i + 1)) | 0;
      const tmp = list[i];
      list[i] = list[j];
      list[j] = tmp;
    }
    return list;
  }

  function randomPosition() {
    if (!layout) layout = getLayout();

    const maxX = Math.max(pondWidth - layout.bottleW, 0);
    const maxY = Math.max(pondHeight - layout.bottleH, 0);

    for (let attempt = 0; attempt < layout.maxRandomAttempts; attempt += 1) {
      const x = Math.random() * maxX;
      const y = Math.random() * maxY;
      if (!hasOverlapAt(x, y)) return commitPosition(x, y);
    }

    return systematicPosition();
  }

  function systematicPosition() {
    const pad = layout.padding;
    const stepX = layout.bottleW + pad * 1.6;
    const stepY = layout.bottleH + layout.floatMargin + pad * 1.4;
    const candidates = [];

    for (let y = pad; y <= pondHeight - layout.bottleH - pad; y += stepY) {
      for (let x = pad; x <= pondWidth - layout.bottleW - pad; x += stepX) {
        candidates.push({
          x: x + Math.random() * Math.min(pad, 10),
          y: y + Math.random() * Math.min(pad, 10),
        });
      }
    }

    shuffle(candidates);

    for (let i = 0; i < candidates.length; i += 1) {
      const { x, y } = candidates[i];
      if (!hasOverlapAt(x, y)) return commitPosition(x, y);
    }

    const inset = layout.mobile ? 8 : 4;
    const fineStepX = layout.mobile ? 28 : 36;
    const fineStepY = layout.mobile ? 40 : 48;

    for (let y = inset; y <= pondHeight - layout.bottleH - inset; y += fineStepY) {
      for (let x = inset; x <= pondWidth - layout.bottleW - inset; x += fineStepX) {
        if (!hasOverlapAt(x, y)) return commitPosition(x, y);
      }
    }

    return null;
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

    const pos = randomPosition();
    if (!pos) return null;

    bottle.style.left = `${pos.x}px`;
    bottle.style.top = `${pos.y}px`;

    const floatDelay = (Math.random() * 3).toFixed(2);
    const waveDelay = (Math.random() * 2).toFixed(2);
    bottle.style.animationDelay = `${floatDelay}s, ${waveDelay}s`;

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
    spatialBuckets.clear();
    if (layer) layer.replaceChildren();
  }

  function renderMessages(messages, onDone) {
    if (!layer || !host) return;

    const list = Array.isArray(messages) ? messages : [];
    const dims = measureHost();

    if (dims.w < 1 || dims.h < 1) {
      requestAnimationFrame(() => renderMessages(list, onDone));
      return;
    }

    clearBottles();
    global.__oceanMessagesCache = list.slice();

    const chunkSize = layout.chunkSize;
    let cursor = 0;

    function renderChunk() {
      const end = Math.min(cursor + chunkSize, list.length);
      const fragment = document.createDocumentFragment();

      for (; cursor < end; cursor += 1) {
        const bottle = buildBottle(list[cursor], cursor);
        if (bottle) fragment.appendChild(bottle);
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

    layout = getLayout();
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

    measureHost();
    const bottle = buildBottle(msg, messageStore.size);
    if (bottle) {
      layer.appendChild(bottle);
      cacheMessage(msg);
    }
  }

  global.OceanBottles = {
    init,
    renderMessages,
    appendBottle,
    clearBottles,
    measureHost,
  };
})(window);
