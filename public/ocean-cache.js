/**
 * Ocean messages cache — always clear old data before storing fresh data.
 */
(function (global) {
  "use strict";

  const STORAGE_KEY = "throw_text_ocean_messages";
  const DEFAULT_LIMIT = 100;

  function clearCache() {
    global.__oceanMessagesCache = null;
    global.__oceanMessagesPromise = null;

    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch (_) {
      /* ignore private mode / quota errors */
    }
  }

  function normalizeList(messages) {
    return Array.isArray(messages) ? messages.slice() : [];
  }

  function setCache(messages) {
    clearCache();
    const list = normalizeList(messages);

    global.__oceanMessagesCache = list;

    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch (_) {
      /* ignore */
    }

    global.__oceanMessagesPromise = Promise.resolve(list);
    return list;
  }

  function getCache() {
    if (global.__oceanMessagesCache) {
      return global.__oceanMessagesCache.slice();
    }

    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        global.__oceanMessagesCache = normalizeList(parsed);
        return global.__oceanMessagesCache.slice();
      }
    } catch (_) {
      /* ignore corrupt storage */
    }

    return [];
  }

  function fetchFresh(limit) {
    const max = limit || DEFAULT_LIMIT;
    clearCache();

    global.__oceanMessagesPromise = fetch(`/api/messages?limit=${max}`, {
      cache: "no-store",
      headers: {
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
      },
    })
      .then(function (response) {
        if (!response.ok) {
          throw new Error("messages " + response.status);
        }
        return response.json();
      })
      .then(function (messages) {
        return setCache(messages);
      })
      .catch(function () {
        return setCache([]);
      });

    return global.__oceanMessagesPromise;
  }

  function addToCache(message) {
    if (!message) return getCache();

    const list = getCache();
    list.unshift(message);
    return setCache(list);
  }

  global.OceanCache = {
    clear: clearCache,
    set: setCache,
    get: getCache,
    fetchFresh: fetchFresh,
    refresh: fetchFresh,
    add: addToCache,
  };
})(window);
