/**
 * Fast random bottle/message rendering for the ocean page.
 */
(function (global) {
  "use strict";

  const BOTTLE_W = 50;
  const BOTTLE_H = 80;

  // Share of the pond's height given to the sky/horizon band (see .horizon-scene
  // in ocean.css). Bottles are only ever placed below this line, in the water.
  const HORIZON_RATIO = 0.32;

  const messageStore = new Map();
  const spatialBuckets = new Map();
  let layer = null;
  let host = null;
  let pondWidth = 0;
  let pondHeight = 0;
  let waterTop = 0;
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
    waterTop = pondHeight * HORIZON_RATIO;
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
    const minY = waterTop;
    const maxY = Math.max(pondHeight - layout.bottleH, minY);

    for (let attempt = 0; attempt < layout.maxRandomAttempts; attempt += 1) {
      const x = Math.random() * maxX;
      const y = minY + Math.random() * (maxY - minY);
      if (!hasOverlapAt(x, y)) return commitPosition(x, y);
    }

    return systematicPosition();
  }

  function systematicPosition() {
    const pad = layout.padding;
    const stepX = layout.bottleW + pad * 1.6;
    const stepY = layout.bottleH + layout.floatMargin + pad * 1.4;
    const candidates = [];
    const yStart = waterTop + pad;

    for (let y = yStart; y <= pondHeight - layout.bottleH - pad; y += stepY) {
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
    const fineYStart = Math.max(inset, waterTop + inset);

    for (let y = fineYStart; y <= pondHeight - layout.bottleH - inset; y += fineStepY) {
      for (let x = inset; x <= pondWidth - layout.bottleW - inset; x += fineStepX) {
        if (!hasOverlapAt(x, y)) return commitPosition(x, y);
      }
    }

    return null;
  }

  // A small set of ocean-glass hue shifts so bottles read as varied without
  // needing separate image assets. Deterministic per message id so a given
  // bottle always renders the same way across reloads.
  const BOTTLE_HUES = [0, -18, 24, -34, 42, -8];

  function pickBottleHue(id) {
    let hash = 0;
    for (let i = 0; i < id.length; i += 1) {
      hash = (hash * 31 + id.charCodeAt(i)) | 0;
    }
    const index = Math.abs(hash) % BOTTLE_HUES.length;
    return BOTTLE_HUES[index];
  }

  function randomBetween(min, max) {
    return min + Math.random() * (max - min);
  }

  function lerp(min, max, t) {
    return min + (max - min) * t;
  }

  function applyFloatingPhysics(bottle, depth) {
    // Randomized-but-bounded timing/amplitude per bottle so a cluster of
    // bottles bobs and rocks out of sync, like real bottles on real waves,
    // instead of moving in perfect unison. Bottles further from the viewer
    // (lower depth) bob with a smaller amplitude, matching how distant
    // motion reads as smaller/slower to the eye.
    const motionScale = lerp(0.5, 1, depth);
    const floatDur = randomBetween(3.6, 5.8).toFixed(2);
    const floatAmp = (randomBetween(7, 14) * motionScale).toFixed(1);
    const floatDelay = randomBetween(0, 3).toFixed(2);
    const waveDur = randomBetween(1.6, 3.2).toFixed(2);
    const waveAmp = (randomBetween(1.4, 3.2) * motionScale).toFixed(2);
    const waveDelay = randomBetween(0, 2).toFixed(2);

    bottle.style.setProperty("--float-dur", `${floatDur}s`);
    bottle.style.setProperty("--float-amp", `${floatAmp}px`);
    bottle.style.setProperty("--float-delay", `${floatDelay}s`);
    bottle.style.setProperty("--wave-dur", `${waveDur}s`);
    bottle.style.setProperty("--wave-amp", `${waveAmp}deg`);
    bottle.style.setProperty("--wave-delay", `${waveDelay}s`);
  }

  function applyDepth(bottle, y) {
    // 0 = right at the horizon (far away), 1 = bottom of the water (closest
    // to the viewer). Drives scale/opacity/blur/saturation so distant
    // bottles read as smaller and hazier, like real atmospheric perspective.
    const range = Math.max(pondHeight - layout.bottleH - waterTop, 1);
    const depth = Math.min(1, Math.max(0, (y - waterTop) / range));

    bottle.style.setProperty("--depth-scale", lerp(0.52, 1.15, depth).toFixed(3));
    bottle.style.setProperty("--depth-opacity", lerp(0.5, 1, depth).toFixed(3));
    bottle.style.setProperty("--depth-saturate", lerp(0.55, 1.05, depth).toFixed(3));
    bottle.style.setProperty("--depth-brightness", lerp(0.82, 1.05, depth).toFixed(3));
    bottle.style.setProperty("--depth-blur", lerp(1.4, 0, depth).toFixed(2) + "px");
    // The label stays legible even far away: only a mild fade, no shrinking
    // or blurring, so a bottle's title/flag can always be read at a glance.
    bottle.style.setProperty("--label-opacity", lerp(0.88, 1, depth).toFixed(3));
    bottle.dataset.depth = depth.toFixed(2);

    return depth;
  }

  function buildBottle(msg, index) {
    const id = String(msg._id || `local-${index}-${msg.createdAt || Date.now()}`);
    messageStore.set(id, {
      title: msg.title || "",
      message: msg.message || "",
      createdAt: msg.createdAt,
      country: msg.country || "",
    });

    const pos = randomPosition();
    if (!pos) return null;

    const bottle = document.createElement("div");
    bottle.className = "bottle";
    bottle.dataset.bid = id;
    bottle.tabIndex = 0;
    bottle.setAttribute("role", "button");
    bottle.setAttribute("aria-label", msg.title ? `Read message: ${msg.title}` : "Read message");
    bottle.style.left = `${pos.x}px`;
    bottle.style.top = `${pos.y}px`;
    bottle.style.setProperty("--bottle-hue", `${pickBottleHue(id)}deg`);

    const depth = applyDepth(bottle, pos.y);
    applyFloatingPhysics(bottle, depth);

    const inner = document.createElement("div");
    inner.className = "bottle-inner";

    const cork = document.createElement("span");
    cork.className = "bottle-cork";

    const neck = document.createElement("span");
    neck.className = "bottle-neck";

    const glass = document.createElement("span");
    glass.className = "bottle-glass";

    const note = document.createElement("span");
    note.className = "bottle-note";
    glass.appendChild(note);

    const shine = document.createElement("span");
    shine.className = "bottle-shine";
    glass.appendChild(shine);

    const titleSpan = document.createElement("span");
    titleSpan.className = "bottle-label";

    if (msg.country) {
      const flagImg = document.createElement("img");
      flagImg.className = "bottle-flag";
      flagImg.alt = "";
      flagImg.loading = "lazy";
      flagImg.decoding = "async";
      flagImg.src = `https://flagcdn.com/24x18/${String(msg.country).toLowerCase()}.png`;
      titleSpan.appendChild(flagImg);
    }

    const titleText = document.createElement("span");
    titleText.className = "bottle-label-text";
    titleText.textContent = msg.title || "Untitled";
    titleSpan.appendChild(titleText);

    inner.append(cork, neck, glass);
    bottle.append(inner, titleSpan);

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
    if (global.OceanCache) {
      global.OceanCache.set(list);
    } else {
      global.__oceanMessagesCache = list.slice();
    }

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

  function openBottle(bottle) {
    const data = messageStore.get(bottle.dataset.bid);
    if (!data) return;

    if (typeof global.showMessagePopup === "function") {
      global.showMessagePopup(data.title, data.message, data.createdAt, data.country);
    }
  }

  function handleBottleClick(event) {
    const bottle = event.target.closest(".bottle");
    if (!bottle || !layer || !layer.contains(bottle)) return;
    openBottle(bottle);
  }

  function handleBottleKeydown(event) {
    if (event.key !== "Enter" && event.key !== " " && event.key !== "Spacebar") return;
    const bottle = event.target.closest(".bottle");
    if (!bottle || !layer || !layer.contains(bottle)) return;
    event.preventDefault();
    openBottle(bottle);
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
      host.addEventListener("keydown", handleBottleKeydown);
    }

    layout = getLayout();
    return { host, layer };
  }

  function appendBottle(msg) {
    if (!layer || !host) return;

    measureHost();
    const bottle = buildBottle(msg, messageStore.size);
    if (bottle) {
      layer.appendChild(bottle);
      if (global.OceanCache) {
        global.OceanCache.add(msg);
      }
    }
  }

  function reloadFromServer() {
    if (!global.OceanCache) return Promise.resolve([]);
    return global.OceanCache.fetchFresh().then(function (messages) {
      renderMessages(messages);
      return messages;
    });
  }

  global.OceanBottles = {
    init,
    renderMessages,
    appendBottle,
    clearBottles,
    measureHost,
    reloadFromServer,
  };
})(window);
