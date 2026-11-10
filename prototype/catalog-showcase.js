"use strict";

(() => {
  const { main, escape, icon, image, price, breadcrumbs, productUrl, categoryUrl, primaryCategories, categoryBySlug, matchesCategory, children, normalize } = sceneryCatalogUI;
  const { products, cover, showcaseOrder } = sceneryCatalog;
  const fmt = new Intl.NumberFormat("ar-EG");
  const paths = {
    search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',
    grid: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
    wide: '<rect x="3" y="4" width="8" height="16" rx="1"/><rect x="14" y="4" width="7" height="16" rx="1"/>',
    filter: '<path d="M3 4h18l-7 8v7l-4 2v-9Z"/>',
    heart: '<path d="M20.8 8.7c0 4.1-8.8 9.6-8.8 9.6S3.2 12.8 3.2 8.7a4.5 4.5 0 0 1 8.8-1.4 4.5 4.5 0 0 1 8.8 1.4Z"/>',
    reset: '<path d="M4 11a8 8 0 1 1 2 6M4 5v6h6"/>',
    delivery: '<path d="M2 4h13v13H2zM15 8h4l3 4v5h-7"/><circle cx="6" cy="18" r="2" fill="var(--shop-strip)"/><circle cx="18" cy="18" r="2" fill="var(--shop-strip)"/>',
    shield: '<path d="M12 22c6-3 9-7 9-15l-9-4-9 4c0 8 3 12 9 15Z"/><path d="m8 12 3 3 5-5"/>',
    support: '<path d="M4 13v-2a8 8 0 1 1 16 0v2M4 12h3v7H4a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2Zm16 0h-3v7h3a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2ZM19 19c0 2-3 3-6 3"/>'
  };
  const draw = (name) => '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true">' + paths[name] + '</svg>';
  const order = ["bedrooms", "living", "dining", "kitchens", "storage", "offices"];
  const rank = (item) => (order.indexOf(item.slug) + order.length + 1) % (order.length + 1);
  const categories = [...primaryCategories].sort((a, b) => rank(a) - rank(b));
  const categoryPhoto = (item) => item.slug === "living" ? products.find((p) => p.slug === "green-sofa")?.media[0] || item.cover : item.cover;
  const colors = [
    ["light", "بيج وفاتح", /رملي|بيج|فاتح|ابيض/, "#c1a17a"],
    ["wood", "بني وخشبي", /بني|خشب|بلوط|جوز/, "#855521"],
    ["green", "أخضر", /اخضر/, "#284b39"],
    ["grey", "رمادي", /رمادي/, "#625d58"]
  ];
  const materials = [
    ["wood", "خشب", /خشب|بلوط/], ["board", "لوح هندسي", /لوح هندسي/],
    ["veneer", "قشرة خشبية", /قشره/], ["fabric", "قماش وتنجيد", /قماش|تنجيد|كسوه/],
    ["stone", "حجر", /حجري/]
  ];
  const ready = new Set(["walnut-dining-table", "linen-bed", "floating-nightstand", "dining-chair", "woven-sideboard", "oak-writing-desk"]);
  const stockOf = (item) => ready.has(item.slug) ? "ready" : "order";
  const hasAmount = (item) => item.price.mode === "visible" && item.price.currency === "EGP";
  const limit = Math.max(100, ...products.filter(hasAmount).map((item) => Math.ceil(item.price.amount / 100) * 100));
  const money = (amount) => fmt.format(amount) + " ج.م";
  const pageSize = 15;
  const orderBySlug = new Map(showcaseOrder.map((slug, index) => [slug, index]));
  const desktop = matchMedia("(min-width: 64rem)");
  const params = new URLSearchParams(location.search);
  const listed = (key, list) => list.filter((value) => params.getAll(key).includes(value));
  const bound = (key, fallback) => /^\d+$/.test(params.get(key) || "") ? Math.min(limit, Math.round(Number(params.get(key)) / 100) * 100) : fallback;
  const selectedCategory = listed("category", categories.map((item) => item.slug))[0] || "";
  const defaults = { q: "", category: "", subcategory: "", sort: "curated", color: "", material: [], stock: [], min: 0, max: limit, page: 1 };
  const state = {
    ...defaults, q: (params.get("q") || "").slice(0, 100).trim(), category: selectedCategory,
    subcategory: listed("subcategory", children(selectedCategory).map((item) => item.slug))[0] || "",
    sort: params.get("sort") === "newest" ? "newest" : "curated", color: listed("color", colors.map(([key]) => key))[0] || "",
    material: listed("material", materials.map(([key]) => key)), stock: listed("stock", ["ready", "order"]),
    min: bound("min", 0), max: bound("max", limit), page: Math.max(1, Math.floor(Number(params.get("page"))) || 1)
  };
  if (state.min > state.max) [state.min, state.max] = [state.max, state.min];

  const option = (name, value, label, type = "checkbox") =>
    `<label class="showcase-option"><input type="${type}" name="${name}" value="${value}"><span>${escape(label)}</span></label>`;
  const section = (label, markup) => `<details class="showcase-filter-group" open><summary>${label}</summary><div>${markup}</div></details>`;
  const tiles = [{ slug: "", title: "الكل" }, ...categories].map((item) => `<li><button type="button" data-category="${item.slug}" aria-pressed="false">
    ${item.slug ? image(categoryPhoto(item), { small: true, decorative: true }) : draw("grid")}<span>${escape(item.title)}</span></button></li>`).join("");

  main.innerHTML = `
    <section class="showcase-hero" aria-labelledby="showcase-title">
      <figure class="showcase-hero-image">${image(cover, { priority: true })}</figure>
      <div class="showcase-shell showcase-hero-inner">
        ${breadcrumbs([], "المنتجات")}
        <h1 id="showcase-title">مجموعة الأثاث</h1>
        <p>تشكيلة متنوعة من الأثاث المنزلي بتصاميم عصرية وجودة عالية تناسب مختلف المساحات.</p>
      </div>
    </section>
    <nav class="showcase-shell showcase-categories" aria-label="تصفية الكتالوج بالتصنيف"><ul>${tiles}</ul></nav>
    <div class="showcase-shell showcase-main">
      <aside class="showcase-sidebar" aria-labelledby="showcase-filter-title">
        <h2 id="showcase-filter-title">${draw("filter")} تصفية النتائج</h2><div class="showcase-inline-filters"></div>
      </aside>
      <section class="showcase-results" aria-labelledby="showcase-results-title">
        <h2 class="sr-only" id="showcase-results-title" tabindex="-1">نتائج المنتجات</h2>
        <div class="showcase-toolbar">
          <form class="showcase-search" role="search"><label for="catalog-query" class="sr-only">ابحث باسم المنتج</label>
            ${draw("search")}<input id="catalog-query" type="search" name="q" maxlength="100" placeholder="ابحث عن منتج…">
          </form>
          <p id="catalog-count" role="status"></p>
          <label class="showcase-sort">ترتيب حسب<select name="sort"><option value="curated">ترتيب المجموعة</option><option value="newest">الأحدث</option></select></label>
          <div class="showcase-layout" role="group" aria-label="طريقة عرض المنتجات">
            <button type="button" data-density="grid" aria-label="شبكة مدمجة" aria-pressed="true">${draw("grid")}</button>
            <button type="button" data-density="wide" aria-label="شبكة واسعة" aria-pressed="false">${draw("wide")}</button>
          </div>
          <button class="button button-outline showcase-filter-toggle" type="button" aria-haspopup="dialog">${draw("filter")} الفلاتر</button>
        </div>
        <p class="showcase-demo">نسخة معاينة · الصور والأسعار والتوفر بيانات توضيحية</p>
        <div class="showcase-active" role="group" aria-label="الفلاتر النشطة" hidden></div>
        <div class="showcase-grid catalog-grid"></div>
        <div class="catalog-empty" hidden>
          <h3>لا توجد منتجات مطابقة</h3><p>جرّب اسمًا مختلفًا أو أعد تعيين التصفية.</p>
          <button class="button button-outline" type="button" data-reset>إعادة تعيين التصفية</button>
        </div>
        <nav class="showcase-pages" aria-label="صفحات نتائج المنتجات" hidden></nav>
      </section>
    </div>
    <dialog class="preview-dialog showcase-dialog" aria-labelledby="showcase-dialog-title">
      <div class="dialog-heading"><h2 id="showcase-dialog-title">تصفية النتائج</h2><form method="dialog"><button class="icon-button" aria-label="إغلاق الفلاتر">${icon("close")}</button></form></div>
      <div class="showcase-dialog-filters"></div>
    </dialog>
    <template id="showcase-filter-template">
      <form class="showcase-filters">
        ${section("الفئات", '<fieldset><legend class="sr-only">التصنيف الرئيسي</legend>' +
          option("category", "", "كل الفئات", "radio") + categories.map((item) =>
            option("category", item.slug, item.title + " (" + fmt.format(products.filter((p) => matchesCategory(p, item.slug)).length) + ")", "radio")).join("") +
          '</fieldset><label class="showcase-child" hidden>التصنيف الفرعي<select name="subcategory"></select></label>')}
        ${section("نطاق السعر", `<p class="showcase-price-note">للمنتجات ذات السعر الظاهر</p><div class="showcase-range"><div class="showcase-track" aria-hidden="true"></div>
          <input type="range" name="min" aria-label="الحد الأدنى للسعر" min="0" max="${limit}" step="100">
          <input type="range" name="max" aria-label="الحد الأقصى للسعر" min="0" max="${limit}" step="100"></div>
          <div class="showcase-range-values"><output data-bound="min"></output><output data-bound="max"></output></div>`)}
        ${section("اللون", '<fieldset class="showcase-colors"><legend class="sr-only">اللون</legend>' +
          '<label><input type="radio" name="color" value=""><span>الكل</span></label>' + colors.map(([key, label, , swatch]) =>
            `<label><input type="radio" name="color" value="${key}" aria-label="${label}"><span class="showcase-swatch" style="--swatch:${swatch}" aria-hidden="true"></span></label>`).join("") + '</fieldset>')}
        ${section("الخامة", '<fieldset><legend class="sr-only">الخامات</legend>' + materials.map(([key, label]) => option("material", key, label)).join("") + '</fieldset>')}
        ${section("التوفر", '<fieldset><legend class="sr-only">التوفر التجريبي</legend>' +
          option("stock", "ready", "متوفر للمعاينة (" + fmt.format(products.filter((item) => ready.has(item.slug)).length) + ")") +
          option("stock", "order", "حسب الطلب (" + fmt.format(products.filter((item) => !ready.has(item.slug)).length) + ")") + '</fieldset>')}
        <div class="showcase-filter-actions">
          <button class="button button-primary" type="submit">${draw("filter")} تطبيق التصفية</button>
          <button class="text-action" type="button" data-reset>${draw("reset")} إعادة تعيين التصفية</button>
        </div>
      </form>
    </template>
    <section class="showcase-benefits" aria-label="خدمات Scenery">
      <ul class="showcase-shell">
        <li>${draw("delivery")}<div><strong>خيارات التوصيل</strong><p>اسأل عن التغطية المتاحة</p></div></li>
        <li>${draw("shield")}<div><strong>خامات وتشطيب</strong><p>راجع تفاصيل كل قطعة</p></div></li>
        <li>${icon("plan")}<div><strong>تصميم حسب الطلب</strong><p>قطع تناسب مساحتك</p></div></li>
        <li>${draw("support")}<div><strong>دعم واستفسارات</strong><p>ناقش معنا احتياجاتك</p></div></li>
      </ul>
    </section>`;

  document.querySelector(".footer-brand").append(scenerySite.paragraph("تصاميم أثاث منزلي وأعمال خشبية بمقاسات وخامات تناسب مساحتك."));

  const search = main.querySelector(".showcase-search");
  const searchInput = search.elements.q;
  const sort = main.querySelector(".showcase-sort select");
  const dialog = main.querySelector(".showcase-dialog");
  const toggle = main.querySelector(".showcase-filter-toggle");
  const form = main.querySelector("#showcase-filter-template").content.firstElementChild.cloneNode(true);
  const { min, max, subcategory: child } = form.elements;
  const range = form.querySelector(".showcase-range");
  const count = main.querySelector("#catalog-count");
  const grid = main.querySelector(".showcase-grid");
  const empty = main.querySelector(".catalog-empty");
  const pages = main.querySelector(".showcase-pages");
  const active = main.querySelector(".showcase-active");
  const favoriteKey = "scenery-catalog-favorites";
  let favorites = new Set();
  try {
    const saved = JSON.parse(localStorage.getItem(favoriteKey) || "[]");
    if (Array.isArray(saved)) favorites = new Set(saved);
  } catch {
    // Favorites remain available for this visit when storage is unavailable.
  }

  function updateChildren(category, selected = "") {
    const entries = children(category);
    child.replaceChildren(new Option("كل الأقسام الفرعية", ""), ...entries.map((item) => new Option(item.title, item.slug)));
    child.value = selected;
    child.disabled = !entries.length;
    child.closest("label").hidden = !entries.length;
  }

  function updatePrice(changed) {
    if (Number(min.value) > Number(max.value)) {
      if (changed === min) min.value = max.value;
      else max.value = min.value;
    }
    for (const control of [min, max]) {
      const label = money(Number(control.value));
      form.querySelector(`[data-bound="${control.name}"]`).textContent = (control === min ? "من " : "إلى ") + label;
      control.setAttribute("aria-valuetext", label);
      range.style.setProperty("--" + control.name, Number(control.value) / limit * 100 + "%");
    }
  }

  function syncForm() {
    form.querySelectorAll('input[type="radio"]').forEach((input) => { input.checked = state[input.name] === input.value; });
    form.querySelectorAll('[name="material"], [name="stock"]').forEach((input) => { input.checked = state[input.name].includes(input.value); });
    min.value = state.min;
    max.value = state.max;
    updatePrice();
    updateChildren(state.category, state.subcategory);
  }

  function moveForm() {
    if (dialog.open) dialog.close();
    main.querySelector(desktop.matches ? ".showcase-inline-filters" : ".showcase-dialog-filters").append(form);
    syncForm();
  }

  function writeQuery() {
    if (location.protocol === "file:") return;
    const query = new URLSearchParams();
    for (const key of ["q", "category", "subcategory", "sort", "color", "min", "max", "page"]) {
      if (state[key] !== defaults[key]) query.set(key, state[key]);
    }
    for (const key of ["material", "stock"]) state[key].forEach((value) => query.append(key, value));
    const url = location.pathname + (query.size ? "?" + query : "") + location.hash;
    if (url !== location.pathname + location.search + location.hash) history.replaceState(null, "", url);
  }

  function card(item, index) {
    const title = escape(item.title);
    return `<article class="showcase-card catalog-card">
      <div class="showcase-card-media">
        <a href="${productUrl(item.slug)}" tabindex="-1" aria-hidden="true">${image(item.media[0], { small: true, priority: index < 3, decorative: true })}</a>
        <button type="button" class="showcase-favorite" data-favorite="${item.slug}" aria-pressed="${favorites.has(item.slug)}" aria-label="المفضلة: ${title}">${draw("heart")}</button>
      </div>
      <div class="showcase-card-copy"><h3><a class="catalog-card-link" href="${productUrl(item.slug)}">${title}</a></h3>
        <p class="showcase-description">${escape(item.description)}</p>
        <div class="showcase-card-bottom">${price(item)}<a class="showcase-detail" href="${productUrl(item.slug)}" aria-label="تفاصيل ${title}">${icon("plus")}</a></div>
      </div></article>`;
  }

  const pageButton = (value, content, label, attributes = "") =>
    `<button type="button" data-page-number="${value}" aria-label="${label}"${attributes}>${content}</button>`;

  function render() {
    const term = normalize(state.q);
    const activeColor = colors.find(([key]) => key === state.color);
    const activeMaterials = materials.filter(([key]) => state.material.includes(key));
    const rangeActive = state.min !== 0 || state.max !== limit;
    const result = products.filter((item) =>
      (!state.category || matchesCategory(item, state.category)) &&
      (!state.subcategory || matchesCategory(item, state.subcategory)) &&
      (!term || normalize(item.title).includes(term)) &&
      (!activeColor || activeColor[2].test(normalize(item.specs.colors || ""))) &&
      (!activeMaterials.length || activeMaterials.some((group) => group[2].test(normalize(item.specs.material || "")))) &&
      (!state.stock.length || state.stock.includes(stockOf(item))) &&
      (!rangeActive || (hasAmount(item) && item.price.amount >= state.min && item.price.amount <= state.max))
    );
    if (state.sort === "newest") result.sort((a, b) => b.added.localeCompare(a.added));
    else result.sort((a, b) => (orderBySlug.get(a.slug) ?? showcaseOrder.length) - (orderBySlug.get(b.slug) ?? showcaseOrder.length));
    const totalPages = Math.max(1, Math.ceil(result.length / pageSize));
    state.page = Math.min(state.page, totalPages);
    const offset = (state.page - 1) * pageSize;
    const current = result.slice(offset, offset + pageSize);
    count.textContent = current.length ? "عرض " + fmt.format(offset + 1) + "–" + fmt.format(offset + current.length) + " من " + fmt.format(result.length) + " منتجًا" : "لا توجد نتائج";
    grid.innerHTML = current.map(card).join("");
    empty.hidden = current.length > 0;
    pages.hidden = totalPages < 2;
    pages.innerHTML = totalPages > 1 ? pageButton(state.page - 1, icon("arrow"), "الصفحة السابقة", state.page === 1 ? " disabled" : "") +
      Array.from({ length: totalPages }, (_, i) => pageButton(i + 1, fmt.format(i + 1), "الصفحة " + fmt.format(i + 1), state.page === i + 1 ? ' aria-current="page"' : "")).join("") +
      pageButton(state.page + 1, icon("arrow"), "الصفحة التالية", state.page === totalPages ? " disabled" : "") : "";
    main.querySelectorAll("[data-category]").forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.category === state.category)));
    const labels = [state.category && categoryBySlug.get(state.category).title, state.subcategory && categoryBySlug.get(state.subcategory).title,
      activeColor?.[1], ...activeMaterials.map((group) => group[1]), rangeActive && money(state.min) + " – " + money(state.max),
      ...state.stock.map((value) => value === "ready" ? "متوفر للمعاينة" : "حسب الطلب")].filter(Boolean);
    active.replaceChildren(...labels.map((label) => {
      const chip = document.createElement("span");
      chip.textContent = label;
      return chip;
    }));
    if (state.category) {
      const link = document.createElement("a");
      link.href = categoryUrl(state.subcategory || state.category);
      link.textContent = "فتح صفحة التصنيف";
      active.append(link);
    }
    active.hidden = !labels.length;
    writeQuery();
    scenerySite.refreshClearance();
  }

  function update(next) {
    Object.assign(state, next, { page: 1 });
    render();
  }

  searchInput.value = state.q;
  sort.value = state.sort;
  document.querySelector(".header-search").addEventListener("click", () => searchInput.focus({ preventScroll: true }));
  search.addEventListener("submit", (event) => event.preventDefault());
  searchInput.addEventListener("input", () => update({ q: searchInput.value.trim() }));
  sort.addEventListener("change", () => update({ sort: sort.value }));
  form.addEventListener("change", (event) => {
    if (event.target.name === "category") updateChildren(event.target.value);
  });
  min.addEventListener("input", () => updatePrice(min));
  max.addEventListener("input", () => updatePrice(max));
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const values = new FormData(form);
    update({ category: values.get("category") || "", subcategory: child.value, color: values.get("color") || "",
      material: values.getAll("material"), stock: values.getAll("stock"), min: Number(min.value), max: Number(max.value) });
    if (dialog.open) dialog.close();
  });
  toggle.addEventListener("click", () => {
    syncForm();
    scenerySite.showDialog(dialog, toggle);
  });
  main.addEventListener("click", (event) => {
    const button = event.target.closest("button");
    if (!button) return;
    if (button.matches("[data-category]")) {
      if (button.dataset.category === state.category) return;
      update({ category: button.dataset.category, subcategory: "" });
      syncForm();
    } else if (button.matches("[data-page-number]")) {
      state.page = Number(button.dataset.pageNumber);
      render();
      main.querySelector("#showcase-results-title").focus({ preventScroll: true });
      main.querySelector(".showcase-toolbar").scrollIntoView({ block: "start" });
    } else if (button.matches("[data-density]")) {
      grid.classList.toggle("showcase-wide-grid", button.dataset.density === "wide");
      main.querySelectorAll("[data-density]").forEach((control) => control.setAttribute("aria-pressed", String(control === button)));
      scenerySite.refreshClearance();
    } else if (button.matches("[data-reset]")) {
      const fromEmpty = empty.contains(button);
      searchInput.value = defaults.q;
      sort.value = defaults.sort;
      update(defaults);
      syncForm();
      if (dialog.open) dialog.close();
      if (fromEmpty) searchInput.focus();
    } else if (button.matches("[data-favorite]")) {
      const value = button.dataset.favorite;
      if (favorites.has(value)) favorites.delete(value);
      else favorites.add(value);
      button.setAttribute("aria-pressed", String(favorites.has(value)));
      try {
        localStorage.setItem(favoriteKey, JSON.stringify([...favorites]));
      } catch {
        // Keep the in-memory selection.
      }
    }
  });

  desktop.addEventListener("change", moveForm);
  moveForm();
  render();
})();
