"use strict";

const sceneryCatalogUI = (() => {
  const { categories, products, sources } = sceneryCatalog;
  const { page, slug, root } = document.documentElement.dataset;
  const main = document.querySelector("main");
  const categoryBySlug = new Map(categories.map((item) => [item.slug, item]));
  const productBySlug = new Map(products.map((item) => [item.slug, item]));
  const primaryCategories = categories.filter((item) => !item.parent);
  const escape = (value) => String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
  const icon = (name) => '<svg class="icon" aria-hidden="true"><use href="#icon-' + name + '"></use></svg>';
  const catalogUrl = root + "products/";
  const categoryUrl = (value) => catalogUrl + "category/" + value + "/";
  const productUrl = (value) => catalogUrl + value + "/";
  const placeholder = root + "assets/catalog/placeholder.svg";
  const children = (parent) => categories.filter((item) => item.parent === parent);
  const normalize = (text) => text.normalize("NFKC").replace(/[\u0640\u064b-\u065f\u0670]/g, "").replace(/[أإآٱ]/g, "ا").replace(/ى/g, "ي").replace(/ة/g, "ه").toLowerCase();

  function matchesCategory(product, value) {
    return [product.category, product.subcategory, ...(product.extraCategories || [])].some(
      (item) => item === value || categoryBySlug.get(item)?.parent === value
    );
  }

  function image(photo, { small = false, priority = false, decorative = false } = {}) {
    const file = small ? photo.small || photo.src : photo.src || photo.poster;
    return '<img data-catalog-image src="' + escape(root + file) + '" alt="' + escape(decorative ? "" : photo.alt) + '" decoding="async"' +
      (priority ? ' fetchpriority="high"' : ' loading="lazy"') + '>';
  }

  document.addEventListener("error", (event) => {
    const item = event.target;
    if (!(item instanceof HTMLImageElement) || !item.hasAttribute("data-catalog-image") || item.hasAttribute("data-image-fallback")) return;
    item.setAttribute("data-image-fallback", "");
    if (item.alt) item.alt = "الصورة غير متاحة";
    item.src = placeholder;
  }, true);

  function price(product) {
    if (product.price.mode === "hidden") return "";
    if (product.price.mode === "quote") return '<p class="catalog-price">السعر عند الطلب</p>';
    const amount = new Intl.NumberFormat("ar-EG", {
      style: "currency", currency: product.price.currency, maximumFractionDigits: 0
    }).format(product.price.amount);
    return '<p class="catalog-price"><bdi>' + escape(amount) + '</bdi> <span>سعر توضيحي</span></p>';
  }

  function breadcrumbs(links, current) {
    const all = [[root + "index.html", "الرئيسية"], ...links];
    return '<nav class="catalog-breadcrumb" aria-label="مسار الصفحة"><ol>' +
      all.map(([href, label]) => '<li><a href="' + escape(href) + '">' + escape(label) + '</a></li>').join("") +
      '<li aria-current="page">' + escape(current) + '</li></ol></nav>';
  }

  function card(product, index) {
    const category = categoryBySlug.get(product.category);
    return '<article class="catalog-card"><a class="catalog-card-link" href="' + productUrl(product.slug) + '" aria-labelledby="name-' + product.slug + '">' +
      '<div class="catalog-card-photo image-frame">' + image(product.media[0], { small: true, priority: index < 2, decorative: true }) + '</div>' +
      '<div class="catalog-card-body"><p class="meta">' + escape(category.title) + '</p><h3 id="name-' + product.slug + '">' + escape(product.title) +
      '</h3><p class="catalog-card-description">' + escape(product.description) + '</p>' + price(product) +
      '<span class="catalog-card-action" aria-hidden="true">عرض التفاصيل ' + icon("arrow") + '</span></div></a></article>';
  }

  scenerySite.registerPreview("credits", (title, content) => {
    title.textContent = "مصادر الصور التوضيحية";
    content.append(scenerySite.paragraph("تجمع المعاينة بين قصاصات المرجع المرفق وصور توضيحية مرخّصة. المنتجات والصور والمقاسات والأسعار أمثلة لتجربة الكتالوج."));
    const list = document.createElement("ul");
    for (const [label, url] of [...sources, ["ترخيص Unsplash", "https://unsplash.com/license"]]) {
      const item = document.createElement("li");
      const link = document.createElement("a");
      link.textContent = label;
      link.href = url;
      item.append(link);
      list.append(item);
    }
    content.append(list);
  });

  function missing() {
    main.innerHTML = '<section class="wrap catalog-empty"><h1>هذه الصفحة غير متاحة</h1><p>يمكنك متابعة تصفح القطع في الكتالوج.</p><a class="button button-outline" href="' + catalogUrl + '">العودة للمنتجات</a></section>';
  }

  function categoryRail(current) {
    const activeParent = current?.parent || current?.slug;
    const categoryIcons = {
      bedrooms: '<path d="M3 18v3m18-3v3M3 14V7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v7M3 14a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v4H3zm0 1h18M12 7v4"/>',
      offices: '<rect x="3" y="7" width="18" height="14" rx="2"/><path d="M8 7V4h8v3M3 12h18M10 12v3h4v-3"/>'
    };
    return '<nav class="catalog-category-nav" aria-label="تصنيفات الأثاث"><ul>' +
      primaryCategories.map((item) => {
        const artwork = categoryIcons[item.slug];
        const categoryIcon = artwork ? '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true">' + artwork + '</svg>' : icon(item.icon);
        return '<li><a href="' + categoryUrl(item.slug) + '"' + (item.slug === activeParent ? ' aria-current="true"' : "") + '>' + categoryIcon + '<span>' + escape(item.title) + '</span></a></li>';
      }).join("") +
      '</ul></nav>';
  }

  function subcategoryRail(current) {
    if (!current) return "";
    const parent = categoryBySlug.get(current.parent) || current;
    const nested = children(parent.slug);
    if (!nested.length) return "";
    const link = (item, label) => '<li><a href="' + categoryUrl(item.slug) + '"' + (current.slug === item.slug ? ' aria-current="page"' : "") + '>' + escape(label) + '</a></li>';
    return '<nav class="catalog-subcategories" aria-label="أقسام ' + escape(parent.title) + '"><ul>' +
      link(parent, "كل " + parent.title) + nested.map((item) => link(item, item.title)).join("") + '</ul></nav>';
  }

  function renderListing() {
    const current = categoryBySlug.get(slug);
    if (!current) return missing();
    const parent = current.parent ? categoryBySlug.get(current.parent) : null;
    const heroPhoto = current.cover || parent?.cover;
    const trail = [[catalogUrl, "المنتجات"], ...(parent ? [[categoryUrl(parent.slug), parent.title]] : [])];
    const searchIcon = '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/></svg>';
    main.innerHTML = `
      <div class="catalog-mast">
        <div class="wrap">
          ${breadcrumbs(trail, current.title)}
          <div class="catalog-intro${heroPhoto ? "" : " catalog-intro-text"}">
            <div>
              <p class="section-kicker">تصنيفات الأثاث</p>
              <h1>${escape(current.title)}</h1>
              ${current.description ? '<p>' + escape(current.description) + '</p>' : ""}
              <p class="catalog-demo">نسخة معاينة · المنتجات والصور والأسعار توضيحية</p>
            </div>
            ${heroPhoto ? '<figure class="image-frame catalog-intro-photo">' + image(heroPhoto, { priority: true }) + '</figure>' : ""}
          </div>
          ${categoryRail(current)}
        </div>
      </div>
      <section class="wrap catalog-results" aria-labelledby="results-heading">
        ${subcategoryRail(current)}
        <h2 class="catalog-results-heading" id="results-heading">منتجات القسم</h2>
        <div class="catalog-toolbar">
          <form class="catalog-search" role="search">
            <label for="catalog-query">ابحث باسم المنتج</label>
            <div class="category-search-field"><input id="catalog-query" name="q" type="search" maxlength="100" placeholder="مثل طاولة سفرة أو أريكة">${searchIcon}</div>
          </form>
          <button type="button" class="button button-outline catalog-filter-toggle" aria-haspopup="dialog">الفلاتر والترتيب</button>
        </div>
        <div class="catalog-inline-filters"></div>
        <dialog class="preview-dialog catalog-dialog" id="filter-dialog" aria-labelledby="filter-title">
          <div class="dialog-heading">
            <h2 id="filter-title">الفلاتر والترتيب</h2>
            <form method="dialog"><button class="icon-button" aria-label="إغلاق الفلاتر">${icon("close")}</button></form>
          </div>
          <div class="catalog-dialog-filters"></div>
        </dialog>
        <template id="catalog-filter-template">
          <form class="catalog-filters">
            <label ${current ? "hidden" : ""}>التصنيف الرئيسي<select name="category"></select></label>
            <label class="catalog-child-field" ${parent ? "hidden" : ""}>التصنيف الفرعي<select name="subcategory"></select></label>
            <label>الترتيب<select name="sort"><option value="curated">ترتيب المجموعة</option><option value="newest">الأحدث أولًا</option></select></label>
            <button type="submit" class="button button-outline">تطبيق</button>
          </form>
        </template>
        <div class="catalog-results-meta">
          <p id="catalog-count" role="status"></p>
          <button class="text-action catalog-clear" type="button" hidden>إلغاء الفلاتر</button>
        </div>
        <div class="catalog-active-filters" role="group" aria-label="الفلاتر النشطة"></div>
        <div class="catalog-grid"></div>
        <div class="catalog-empty" hidden>
          <h3>لا توجد منتجات مطابقة</h3>
          <p>جرّب اسمًا مختلفًا أو ألغِ الفلاتر للعودة إلى مجموعة المنتجات.</p>
          <button type="button" class="button button-outline catalog-empty-reset">إلغاء الفلاتر</button>
        </div>
      </section>`;
    const rail = main.querySelector(".catalog-category-nav ul");
    const activeLink = rail.querySelector("[aria-current]");
    if (activeLink) {
      const railBounds = rail.getBoundingClientRect();
      const activeBounds = activeLink.getBoundingClientRect();
      if (activeBounds.left < railBounds.left) {
        rail.scrollBy({ left: activeBounds.left - railBounds.left, behavior: "instant" });
      }
    }
    bindListing(current);
  }

  function bindListing(current) {
    const search = main.querySelector(".catalog-search");
    const searchInput = search.elements.q;
    const filters = main.querySelector("#catalog-filter-template").content.firstElementChild.cloneNode(true);
    const { category, subcategory, sort } = filters.elements;
    const dialog = main.querySelector("#filter-dialog");
    const filterToggle = main.querySelector(".catalog-filter-toggle");
    const wide = matchMedia("(min-width: 48rem)");
    const count = main.querySelector("#catalog-count");
    const grid = main.querySelector(".catalog-grid");
    const empty = main.querySelector(".catalog-empty");
    const clear = main.querySelector(".catalog-clear");
    const chips = main.querySelector(".catalog-active-filters");
    const params = new URLSearchParams(location.search);
    const fixedParent = current?.parent || current?.slug || "";
    const requestedCategory = params.get("category");
    const initialCategory = fixedParent || (primaryCategories.some((item) => item.slug === requestedCategory) ? requestedCategory : "");
    const requestedChild = params.get("subcategory");
    const initialChild = children(initialCategory).some((item) => item.slug === requestedChild) ? requestedChild : "";
    const state = { q: (params.get("q") || "").slice(0, 100), category: initialCategory, subcategory: current?.parent ? "" : initialChild, sort: params.get("sort") === "newest" ? "newest" : "curated" };
    const numbers = new Intl.NumberFormat("ar-EG");

    category.replaceChildren(new Option("كل التصنيفات", ""), ...primaryCategories.map((item) => new Option(item.title, item.slug)));
    searchInput.value = state.q;

    function updateChildren(value, selected = "") {
      const available = value ? children(value) : [];
      subcategory.replaceChildren(new Option("كل الأقسام الفرعية", ""), ...available.map((item) => new Option(item.title, item.slug)));
      subcategory.value = selected;
      subcategory.disabled = !available.length || Boolean(current?.parent);
      subcategory.closest("label").hidden = subcategory.disabled;
    }

    function syncFilters() {
      category.value = state.category;
      sort.value = state.sort;
      updateChildren(state.category, state.subcategory);
    }

    function moveFilters() {
      if (dialog.open) dialog.close();
      main.querySelector(wide.matches ? ".catalog-inline-filters" : ".catalog-dialog-filters").append(filters);
      syncFilters();
    }

    function replaceQuery() {
      if (location.protocol === "file:") return;
      const query = new URLSearchParams();
      if (state.q.trim()) query.set("q", state.q.trim());
      if (state.category && !current) query.set("category", state.category);
      if (state.subcategory) query.set("subcategory", state.subcategory);
      if (state.sort !== "curated") query.set("sort", state.sort);
      const url = location.pathname + (query.size ? "?" + query : "") + location.hash;
      if (url !== location.pathname + location.search + location.hash) history.replaceState(null, "", url);
    }

    function addChip(key, label) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "catalog-chip";
      button.textContent = label + " ×";
      button.setAttribute("aria-label", "إزالة " + label);
      button.addEventListener("click", () => {
        if (key === "q") searchInput.value = state.q = "";
        if (key === "category") state.category = state.subcategory = "";
        if (key === "subcategory") state.subcategory = "";
        if (key === "sort") state.sort = "curated";
        syncFilters();
        render();
        searchInput.focus({ preventScroll: true });
      });
      chips.append(button);
    }

    function render() {
      const query = normalize(state.q.trim());
      const result = products.filter((item) =>
        (!current || matchesCategory(item, current.slug)) &&
        (!state.category || matchesCategory(item, state.category)) &&
        (!state.subcategory || matchesCategory(item, state.subcategory)) &&
        (!query || normalize(item.title).includes(query))
      );
      if (state.sort === "newest") result.sort((a, b) => b.added.localeCompare(a.added));
      count.textContent = numbers.format(result.length) + " منتج مطابق";
      grid.innerHTML = result.map(card).join("");
      empty.hidden = Boolean(result.length);
      chips.replaceChildren();
      if (state.q.trim()) addChip("q", "بحث: " + state.q.trim());
      if (state.category && !current) addChip("category", categoryBySlug.get(state.category).title);
      if (state.subcategory) addChip("subcategory", categoryBySlug.get(state.subcategory).title);
      if (state.sort === "newest") addChip("sort", "الأحدث أولًا");
      clear.hidden = !chips.childElementCount;
      replaceQuery();
      scenerySite.refreshClearance();
    }

    function reset() {
      searchInput.value = "";
      Object.assign(state, { q: "", category: fixedParent, subcategory: "", sort: "curated" });
      syncFilters();
      render();
      searchInput.focus({ preventScroll: true });
    }

    search.addEventListener("submit", (event) => event.preventDefault());
    searchInput.addEventListener("input", () => { state.q = searchInput.value; render(); });
    category.addEventListener("change", () => updateChildren(category.value));
    filters.addEventListener("submit", (event) => {
      event.preventDefault();
      Object.assign(state, { category: fixedParent || category.value, subcategory: subcategory.value, sort: sort.value });
      if (dialog.open) dialog.close();
      render();
    });
    filterToggle.addEventListener("click", () => {
      syncFilters();
      scenerySite.showDialog(dialog, filterToggle);
    });
    clear.addEventListener("click", reset);
    main.querySelector(".catalog-empty-reset").addEventListener("click", reset);
    wide.addEventListener("change", moveFilters);
    moveFilters();
    render();
  }

  if (page === "category") renderListing();
  return { main, root, slug, escape, icon, image, price, card, breadcrumbs, catalogUrl, categoryUrl, productUrl, categoryBySlug, productBySlug, matchesCategory, children, primaryCategories, normalize, missing };
})();
