"use strict";

const scenerySite = (() => {
  const handlers = new Map();
  const dialogOpeners = new WeakMap();
  const storageKey = "scenery-homepage-whatsapp-hidden";
  const floating = document.querySelector(".floating");
  let clearanceObservers = [];

  // A static server resolves directory links to index.html. A file preview needs the filename.
  function initFileNavigation() {
    const catalogDirectory = /^(?:\.\.\/)*products\/(?:[a-z0-9-]+\/)*(?=[?#]|$)/;
    function updateLink(element) {
      if (!element.matches("a[href]")) return;
      const href = element.getAttribute("href");
      const match = href.match(catalogDirectory);
      if (match) element.setAttribute("href", match[0] + "index.html" + href.slice(match[0].length));
    }

    document.querySelectorAll("a[href]").forEach(updateLink);
    new MutationObserver((changes) => {
      for (const change of changes) {
        if (change.type === "attributes") updateLink(change.target);
        for (const node of change.addedNodes) {
          if (node.nodeType !== Node.ELEMENT_NODE) continue;
          updateLink(node);
          node.querySelectorAll("a[href]").forEach(updateLink);
        }
      }
    }).observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["href"] });
  }

  function showDialog(dialog, opener) {
    dialogOpeners.set(dialog, opener);
    dialog.showModal();
  }

  function paragraph(text, className) {
    const element = document.createElement("p");
    element.textContent = text;
    if (className) element.className = className;
    return element;
  }

  function normalizePhone(value) {
    return value.trim().replace(/[٠-٩]/g, (char) => "٠١٢٣٤٥٦٧٨٩".indexOf(char))
      .replace(/[۰-۹]/g, (char) => "۰۱۲۳۴۵۶۷۸۹".indexOf(char)).replace(/[\s().-]/g, "");
  }

  function watchFloatingClearance() {
    if (!floating || floating.hidden) return;
    clearanceObservers.forEach((observer) => observer.disconnect());
    const actions = document.querySelectorAll(":is(header, main, footer) :is(a[href], button, summary, form)");
    const { top, right, bottom, left } = floating.getBoundingClientRect();
    const { clientWidth, clientHeight } = document.documentElement;
    const offsets = [0, -Math.round(clientHeight / 3)];
    if (document.body.classList.contains("catalog")) offsets.push(-Math.round(clientHeight / 2));
    const blocked = offsets.map(() => null);
    clearanceObservers = offsets.map((offset, index) => {
      const overlapping = new Set();
      const observer = new IntersectionObserver((entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) overlapping.add(entry.target);
          else overlapping.delete(entry.target);
        }
        blocked[index] = overlapping.size > 0;
        if (blocked.includes(null)) return;
        const available = blocked.indexOf(false);
        floating.style.setProperty("--floating-lift", `${offsets[available] || 0}px`);
        floating.classList.toggle("is-raised", available > 0);
        floating.classList.toggle("has-overlap", available < 0);
      }, { rootMargin: `${-top - offset}px ${right - clientWidth}px ${bottom + offset - clientHeight}px ${-left}px` });
      actions.forEach((action) => observer.observe(action));
      return observer;
    });
  }

  function initFloating() {
    const panel = document.querySelector("#floating-panel");
    const dismiss = document.querySelector("#floating-dismiss");
    const restore = document.querySelector("#floating-restore");
    function setState(hidden, moveFocus = false) {
      panel.hidden = hidden;
      restore.hidden = !hidden;
      if (!moveFocus) return;
      try {
        sessionStorage.setItem(storageKey, String(hidden));
      } catch {
        // The controls still work when storage is unavailable.
      }
      (hidden ? restore : panel.firstElementChild).focus({ preventScroll: true });
    }
    let hidden = false;
    try {
      hidden = sessionStorage.getItem(storageKey) === "true";
    } catch {
      // A direct file preview may not allow session storage.
    }
    setState(hidden);
    floating.hidden = false;
    dismiss.addEventListener("click", () => setState(true, true));
    restore.addEventListener("click", () => setState(false, true));
    new ResizeObserver(watchFloatingClearance).observe(floating);
    window.addEventListener("resize", watchFloatingClearance);
  }

  function bindDialog(dialog) {
    let startedOutside = false;
    function outside(event) {
      if (event.target !== dialog) return false;
      const rect = dialog.getBoundingClientRect();
      return event.clientX < rect.left || event.clientX > rect.right ||
        event.clientY < rect.top || event.clientY > rect.bottom;
    }
    dialog.addEventListener("pointerdown", (event) => { startedOutside = outside(event); });
    dialog.addEventListener("click", (event) => {
      if (startedOutside && outside(event)) dialog.close();
      startedOutside = false;
    });
    dialog.addEventListener("close", () => {
      const opener = dialogOpeners.get(dialog);
      if (opener?.getClientRects().length) opener.focus({ preventScroll: true });
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    if (location.protocol === "file:") initFileNavigation();
    const menu = document.querySelector("#mobile-menu");
    const menuToggle = document.querySelector("#menu-toggle");
    const preview = document.querySelector("#preview-dialog");
    const title = document.querySelector("#preview-title");
    const content = document.querySelector("#preview-content");
    const messages = {
      whatsapp: ["واتساب · معاينة", "هذه نافذة تجريبية. ستفتح قناة التواصل المعتمدة عند ربط رقم المصنع.", "لم تُرسل أي رسالة أو بيانات."],
      credits: ["مصادر الصور", "تستخدم الصفحات أصول نموذج Scenery التجريبي. الصور توضيحية."]
    };

    document.querySelectorAll("dialog").forEach(bindDialog);
    document.addEventListener("click", (event) => {
      const trigger = event.target.closest("[data-open]");
      if (!trigger) return;
      const kind = trigger.dataset.open;
      const handler = handlers.get(kind);
      const message = messages[kind];
      if (!handler && !message) return;
      content.replaceChildren();
      if (handler) handler(title, content);
      else {
        title.textContent = message[0];
        content.append(...message.slice(1).map((line) => paragraph(line)));
      }
      showDialog(preview, trigger);
    });

    menuToggle.addEventListener("click", () => showDialog(menu, menuToggle));
    menu.querySelectorAll("nav a").forEach((link) => {
      link.addEventListener("click", (event) => {
        if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
        dialogOpeners.delete(menu);
        menu.close();
        if (!link.getAttribute("href").startsWith("#")) return;
        const target = document.getElementById(link.hash.slice(1));
        const focusTarget = target?.querySelector("h2") ?? target;
        if (focusTarget) {
          focusTarget.setAttribute("tabindex", "-1");
          requestAnimationFrame(() => focusTarget.focus({ preventScroll: true }));
        }
      });
    });
    matchMedia("(min-width: 64rem)").addEventListener("change", ({ matches }) => {
      if (matches && menu.open) {
        dialogOpeners.delete(menu);
        menu.close();
        document.querySelector(".desktop-nav a").focus({ preventScroll: true });
      }
    });
    initFloating();
  });

  return { registerPreview: (name, handler) => handlers.set(name, handler), paragraph, showDialog, normalizePhone, refreshClearance: watchFloatingClearance };
})();
