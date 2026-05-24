(function () {
  "use strict";

  const TEXTS_LIMIT = 50;
  let quill = null;
  let textsAbort = null;

  function convertUTCToIST(utcTimestamp) {
    if (!utcTimestamp) return "N/A";
    return new Date(utcTimestamp).toLocaleString("en-IN");
  }

  function schedulePrismHighlight() {
    if (typeof Prism === "undefined") return;
    const run = () => Prism.highlightAll();
    if ("requestIdleCallback" in window) {
      requestIdleCallback(run, { timeout: 1500 });
    } else {
      requestAnimationFrame(run);
    }
  }

  function showLoading() {
    const textList = document.getElementById("formattedContent");
    textList.innerHTML = '<div class="progress-bar" aria-busy="true"></div>';
  }

  function buildTextCard(text, index) {
    const outer = document.createElement("div");
    outer.className = "outer-snippet";
    outer.dataset.textId = text._id;

    const titleBar = document.createElement("div");
    titleBar.className = "title-bar";
    titleBar.innerHTML =
      '<div class="red-dot dot"></div><div class="blue-dot dot"></div><div class="green-dot dot"></div>';

    const countP = document.createElement("p");
    countP.className = "title-meta title-meta--left";
    countP.textContent = `Count: ${index + 1}`;

    const dateP = document.createElement("p");
    dateP.className = "title-meta title-meta--right";
    dateP.textContent = `DateTime: ${convertUTCToIST(text.dateTime)}`;

    titleBar.appendChild(countP);
    titleBar.appendChild(dateP);

    const inner = document.createElement("div");
    inner.className = "inner-snippet";
    inner.innerHTML = text.content;

    const actions = document.createElement("div");
    actions.className = "snippet-actions";

    const copyBtn = document.createElement("button");
    copyBtn.className = "copy";
    copyBtn.type = "button";
    copyBtn.textContent = "Copy";
    copyBtn.dataset.action = "copy";

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "delete";
    deleteBtn.type = "button";
    deleteBtn.textContent = "Delete";
    deleteBtn.dataset.action = "delete";

    actions.appendChild(copyBtn);
    actions.appendChild(deleteBtn);

    outer.appendChild(titleBar);
    outer.appendChild(inner);
    outer.appendChild(actions);

    return outer;
  }

  async function loadTexts() {
    if (textsAbort) textsAbort.abort();
    textsAbort = new AbortController();
    showLoading();

    try {
      const response = await fetch(
        `/api/texts/all?limit=${TEXTS_LIMIT}`,
        { signal: textsAbort.signal }
      );
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const payload = await response.json();
      const texts = Array.isArray(payload)
        ? payload
        : Array.isArray(payload.texts)
          ? payload.texts
          : [];

      texts.sort((a, b) => b.serialNumber - a.serialNumber);

      const textList = document.getElementById("formattedContent");
      const fragment = document.createDocumentFragment();

      texts.forEach((text, index) => {
        const card = buildTextCard(text, index);
        card.style.margin = "30px 0";
        fragment.appendChild(card);
      });

      textList.replaceChildren(fragment);
      schedulePrismHighlight();
    } catch (error) {
      if (error.name === "AbortError") return;
      console.error("Error loading texts:", error);
      document.getElementById("formattedContent").innerHTML =
        '<p class="load-error">Could not load texts. Tap Load Texts to retry.</p>';
    }
  }

  async function saveText() {
    const text = quill.root.innerHTML;
    try {
      const dateTime = new Date().toISOString();
      const serialNumber = Date.now();
      await fetch("/api/texts/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: text, dateTime, serialNumber }),
      });
      quill.setText("");
      loadTexts();
    } catch (error) {
      console.error(error);
    }
  }

  async function deleteText(textId) {
    try {
      await fetch(`/api/texts/${textId}`, { method: "DELETE" });
      loadTexts();
    } catch (error) {
      console.error("Error deleting text:", error);
    }
  }

  async function copyText(textId) {
    try {
      const response = await fetch(`/api/texts/${textId}`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const text = await response.json();
      copyFormattedText(text.content);
    } catch (error) {
      console.error("Error copying text:", error);
    }
  }

  function copyFormattedText(formattedText) {
    const tempElement = document.createElement("div");
    tempElement.innerHTML = formattedText;
    tempElement.style.cssText = "position:absolute;left:-9999px;top:0";
    document.body.appendChild(tempElement);

    const range = document.createRange();
    range.selectNodeContents(tempElement);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);

    try {
      document.execCommand("copy");
    } catch {
      navigator.clipboard.writeText(tempElement.innerText).catch(console.error);
    } finally {
      document.body.removeChild(tempElement);
      selection.removeAllRanges();
    }
  }

  function filterTexts(query) {
    const textList = document.getElementById("formattedContent");
    const items = textList.querySelectorAll(".outer-snippet");
    const q = query.toLowerCase();

    items.forEach((item) => {
      const content = item.querySelector(".inner-snippet");
      const match = content && content.textContent.toLowerCase().includes(q);
      item.style.display = match ? "block" : "none";
    });
  }

  function trackVisitor() {
    fetch("/api/visitors/track-visitor").catch(() => {});
  }

  async function loadVisitorStats() {
    try {
      const response = await fetch("/api/visitors/stats");
      const data = await response.json();
      document.getElementById("unique-visitors").textContent =
        `Unique Visitors: ${data.uniqueVisitors}`;
    } catch (error) {
      console.error("Error loading visitor stats:", error);
    }
  }

  function toggleTheme() {
    const body = document.body;
    const editor = document.getElementById("editor");
    const uniqueVisitors = document.getElementById("unique-visitors");
    const isDarkMode = body.classList.toggle("light-mode");

    localStorage.setItem("theme", isDarkMode ? "dark" : "light");
    editor.style.backgroundColor = isDarkMode ? "#333" : "hsl(0, 0%, 98%)";
    editor.style.color = isDarkMode ? "#fff" : "#000";
    uniqueVisitors.style.color = isDarkMode ? "#fff" : "#333";
  }

  function applySavedTheme() {
    const savedTheme = localStorage.getItem("theme");
    const editor = document.getElementById("editor");
    const uniqueVisitors = document.getElementById("unique-visitors");

    if (!savedTheme || savedTheme === "dark") {
      document.body.classList.remove("light-mode");
      editor.style.backgroundColor = "#333";
      editor.style.color = "#fff";
      uniqueVisitors.style.color = "#fff";
      localStorage.setItem("theme", "dark");
    } else {
      document.body.classList.add("light-mode");
      editor.style.backgroundColor = "hsl(0, 0%, 98%)";
      editor.style.color = "#000";
      uniqueVisitors.style.color = "#333";
    }
  }

  function bindEvents() {
    document.getElementById("saveButton").addEventListener("click", saveText);
    document.getElementById("loadButton").addEventListener("click", loadTexts);
    document.getElementById("themeButton").addEventListener("click", toggleTheme);

    document.getElementById("searchBar").addEventListener("input", (e) => {
      filterTexts(e.target.value);
    });

    document.getElementById("formattedContent").addEventListener("click", (e) => {
      const btn = e.target.closest("button[data-action]");
      if (!btn) return;
      const card = btn.closest(".outer-snippet");
      if (!card) return;
      const id = card.dataset.textId;
      if (!id) return;
      if (btn.dataset.action === "copy") copyText(id);
      if (btn.dataset.action === "delete") deleteText(id);
    });
  }

  function initializeApp() {
    if (typeof Quill === "undefined") {
      console.error("Quill.js failed to load.");
      return;
    }

    quill = new Quill("#editor", { theme: "snow" });
    applySavedTheme();
    bindEvents();

    loadTexts();
    if ("requestIdleCallback" in window) {
      requestIdleCallback(() => {
        trackVisitor();
        loadVisitorStats();
      });
    } else {
      setTimeout(() => {
        trackVisitor();
        loadVisitorStats();
      }, 0);
    }
  }

  window.addEventListener("load", initializeApp);
})();
