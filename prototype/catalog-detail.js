"use strict";

(() => {
  const ui = sceneryCatalogUI;
  const { main, root, escape, icon, image } = ui;
  const product = ui.productBySlug.get(ui.slug);
  if (!product) return ui.missing();
  const category = ui.categoryBySlug.get(product.category);
  const labels = { dimensions: "المقاسات", material: "الخامة", colors: "الألوان", extra: "تفاصيل إضافية", capacity: "السعة", finish: "التشطيب", weight: "الوزن" };
  const specIcons = { dimensions: "plan", material: "wood", colors: "cabinet", extra: "armchair", capacity: "armchair", finish: "gear", weight: "plan" };
  const optionLabels = { size: "المقاس", color: "اللون", material: "الخامة" };
  const specs = Object.entries(product.specs || {}).filter(([, value]) => value != null && String(value).trim());
  const matched = sceneryCatalog.products.filter((item) => ui.matchesCategory(item, category.slug)).map((item) => item.slug);
  const related = [...new Set([...(product.related || []), ...matched])]
    .map((slug) => ui.productBySlug.get(slug)).filter((item) => item && item !== product && item.published !== false).slice(0, 8);
  const options = Object.entries(product.options || {}).filter(([, values]) => values.length);
  const optionNames = new Intl.ListFormat("ar").format(options.map(([key]) => optionLabels[key] || key));
  const availableMedia = (product.media || []).filter((item) => item.src && (item.type !== "video" || item.poster));
  const fallbackPhoto = { src: "assets/catalog/placeholder.svg", alt: "لا تتوفر صورة للمنتج" };
  const media = availableMedia.length ? availableMedia : [fallbackPhoto];
  const photos = availableMedia.filter((item) => item.type !== "video");
  const detailPhoto = photos[1] || photos[0];
  const icons = {
    fullscreen: '<path d="M9 3H3v6m12-6h6v6M3 15v6h6m12-6v6h-6"/>',
    share: '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.7 10.5 6.6-4m-6.6 7 6.6 4"/>'
  };
  const draw = (name) => '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true">' + icons[name] + '</svg>';

  function specList(entries) {
    return '<dl class="catalog-specs">' + entries.map(([key, value]) =>
      '<div><dt>' + icon(specIcons[key] || "plan") + escape(labels[key] || key) + '</dt><dd><bdi>' + escape(value) + '</bdi></dd></div>'
    ).join("") + '</dl>';
  }

  function relatedCard(item) {
    const label = ui.categoryBySlug.get(item.category).title;
    return '<article class="detail-related-card"><a class="catalog-card-link" href="' + ui.productUrl(item.slug) + '">' +
      '<div class="detail-related-photo">' + image(item.media?.[0] || fallbackPhoto, { small: true, decorative: true }) + '</div>' +
      '<div class="detail-related-copy"><p class="meta">' + escape(label) + '</p><h3>' + escape(item.title) + '</h3>' +
      '<div class="detail-related-bottom">' + ui.price(item) + '<span aria-hidden="true" class="detail-related-plus">' + icon("plus") + '</span></div></div></a></article>';
  }

  const tabs = [
    product.description && { id: "description", label: "الوصف", heading: "وصف المنتج", content: '<p>' + escape(product.description) + '</p>' },
    specs.length && { id: "specifications", label: "المواصفات الفنية", icon: "gear", heading: "المواصفات الفنية", content: specList(specs) },
    ...[["dimensions", "الأبعاد", "plan", ["dimensions"]], ["materials", "الخامات والتشطيب", "wood", ["material", "finish"]]].map(([id, label, tabIcon, keys]) => {
      const entries = specs.filter(([key]) => keys.includes(key));
      return entries.length && { id, label, icon: tabIcon, heading: label, content: specList(entries) };
    })
  ].filter(Boolean);
  const benefitOrder = ["material", "finish", "dimensions", "capacity", "extra", "colors"];
  const benefits = benefitOrder.flatMap((key) => specs.filter(([name]) => name === key)).slice(0, 4);
  const localLink = new URL(location.protocol === "file:" ? "index.html" : ui.productUrl(product.slug), location.href);
  const publicLink = sceneryCatalog.publicBase ? new URL("products/" + product.slug + "/", sceneryCatalog.publicBase) : null;
  const shareLink = (publicLink || localLink).href;
  const waNumber = sceneryCatalog.whatsappNumber;
  const whatsappUrl = /^[1-9][0-9]{7,14}$/.test(waNumber) ? "https://wa.me/" + waNumber + "?text=" +
    encodeURIComponent("أرغب في الاستفسار عن " + product.title + (publicLink ? " — " + publicLink.href : "")) : "";

  function dialogHeading(id, text) {
    return '<div class="dialog-heading"><h2 id="' + id + '">' + escape(text) +
      '</h2><form method="dialog"><button class="icon-button" aria-label="إغلاق">' + icon("close") + '</button></form></div>';
  }

  function galleryControls() {
    if (media.length < 2) return "";
    return '<div class="catalog-gallery-controls"><button type="button" class="icon-button catalog-previous" data-media-step="-1" aria-label="الوسيط السابق">' +
      icon("arrow") + '</button><p class="meta" data-media-count aria-live="polite"></p><button type="button" class="icon-button" data-media-step="1" aria-label="الوسيط التالي">' +
      icon("arrow") + '</button></div>';
  }

  function field(name, label, attributes, textarea = false) {
    return '<label class="catalog-form-field" for="inquiry-' + name + '">' + label + '</label>' +
      (textarea ? '<textarea rows="4"' : '<input') + ' id="inquiry-' + name + '" name="' + name + '" ' + attributes +
      ' aria-describedby="inquiry-' + name + '-error">' + (textarea ? '</textarea>' : "") +
      '<p class="catalog-field-error" id="inquiry-' + name + '-error" hidden></p>';
  }

  main.innerHTML = `
    <div class="wrap catalog-detail">
      ${ui.breadcrumbs([[ui.catalogUrl, "المنتجات"], [ui.categoryUrl(category.slug), category.title]], product.title)}
      <div class="catalog-detail-layout">
        <section class="catalog-gallery" aria-label="معرض المنتج">
          ${media.length > 1 ? '<div class="catalog-thumbnails" role="group" aria-label="صور وفيديو المنتج">' + media.map((item, index) =>
            '<button type="button" data-media-index="' + index + '" aria-label="' + escape((item.type === "video" ? "فيديو " : "صورة ") + (index + 1) + " · " + item.alt) + '">' +
            image(item.type === "video" ? { src: item.poster, alt: "" } : item, { small: true, decorative: true }) +
            (item.type === "video" ? '<span aria-hidden="true">▶</span>' : "") + '</button>').join("") + '</div>' : ""}
          <div class="detail-viewer">
            <div class="catalog-gallery-stage image-frame" data-stage></div>
            ${galleryControls()}
          </div>
        </section>
        <section class="catalog-product-info" aria-labelledby="product-title">
          <p class="section-kicker">${escape(category.title)}</p>
          <h1 id="product-title">${escape(product.title)}</h1>
          ${product.description ? '<p class="catalog-product-description">' + escape(product.description) + '</p>' : ""}
          ${ui.price(product)}
          <p class="catalog-demo">قطعة توضيحية · الصور والمواصفات والأسعار للمعاينة</p>
          ${specs.length ? specList(specs) : ""}
          ${options.length ? '<details class="detail-options"><summary>' +
            '<span class="detail-options-copy"><strong>خصّص استفسارك</strong><span class="detail-options-meta">' + escape(optionNames) + ' · اختياري</span></span>' +
            '<span class="detail-options-action"><span class="detail-options-show">عرض الخيارات</span><span class="detail-options-hide">إخفاء الخيارات</span></span>' +
            '</summary><p class="detail-options-help">اختَر ما يناسبك لإضافته إلى الاستفسار، أو تابع بدون اختيار.</p>' +
            '<fieldset class="catalog-options"><legend class="sr-only">خيارات التخصيص</legend>' +
            options.map(([key, values]) => '<label>' + escape(optionLabels[key] || key) + '<select data-option="' + escape(key) + '"><option value="">بلا تفضيل</option>' +
              values.map((value) => '<option value="' + escape(value) + '">' + escape(value) + '</option>').join("") + '</select></label>').join("") + '</fieldset></details>' : ""}
          <div class="catalog-product-actions">
            <button class="button button-primary" type="button" id="inquiry-open" aria-haspopup="dialog">${icon("arrow")} ${product.price.mode === "quote" ? "اطلب عرض سعر" : "استفسر عن المنتج"}</button>
            ${whatsappUrl ? '<a class="button button-outline" href="' + escape(whatsappUrl) + '" target="_blank" rel="noopener noreferrer">' + icon("wa") + ' واتساب</a>' : ""}
            <button class="button button-outline" type="button" id="share-open" aria-haspopup="dialog">${draw("share")} مشاركة المنتج</button>
          </div>
        </section>
      </div>
      ${benefits.length ? '<ul class="detail-benefits" aria-label="لمحة عن مواصفات القطعة التوضيحية">' + benefits.map(([key, value]) =>
        '<li>' + icon(specIcons[key] || "plan") + '<bdi>' + escape(value) + '</bdi></li>').join("") + '</ul>' : ""}
      ${tabs.length ? `<section class="detail-editorial${detailPhoto ? "" : " detail-editorial-text"}" aria-label="تفاصيل القطعة">
        <div class="detail-tab-content">
          <div class="detail-tabs" role="tablist" aria-label="معلومات المنتج">${tabs.map((tab, index) =>
            '<button type="button" role="tab" id="tab-' + tab.id + '" aria-controls="panel-' + tab.id + '" aria-selected="' + (index === 0) +
            '" tabindex="' + (index === 0 ? 0 : -1) + '">' + (tab.icon ? icon(tab.icon) : "") + tab.label + '</button>').join("")}</div>
          ${tabs.map((tab, index) => '<div class="detail-tab-panel" role="tabpanel" id="panel-' + tab.id + '" aria-labelledby="tab-' + tab.id +
            '" tabindex="0"' + (index ? ' hidden' : '') + '><h2>' + tab.heading + '</h2>' + tab.content + '</div>').join("")}
        </div>
        ${detailPhoto ? '<figure class="detail-editorial-photo image-frame">' + image(detailPhoto) + '</figure>' : ""}
      </section>` : ""}
      ${related.length ? `<section class="catalog-related detail-related" aria-labelledby="related-heading">
        <div class="detail-related-header"><div><p class="section-kicker">من نفس المجموعة</p><h2 id="related-heading">قد يعجبك أيضًا</h2></div>
          <div class="detail-related-controls" aria-label="التنقل بين المنتجات المشابهة" role="group" hidden>
            <button class="icon-button" type="button" data-related="-1" aria-label="المنتجات السابقة">${icon("arrow")}</button>
            <button class="icon-button" type="button" data-related="1" aria-label="المنتجات التالية">${icon("arrow")}</button>
          </div>
        </div>
        <div class="detail-related-rail" data-count="${Math.min(4, related.length)}">${related.map(relatedCard).join("")}</div>
      </section>` : ""}
    </div>

    <dialog class="preview-dialog catalog-lightbox" id="catalog-lightbox" aria-labelledby="lightbox-title">
      ${dialogHeading("lightbox-title", "معرض " + product.title)}
      <div class="catalog-lightbox-stage" data-stage></div>
      ${galleryControls()}
      <div class="catalog-zoom-controls">
        <button type="button" class="icon-button" data-zoom="-1" aria-label="تصغير الصورة">−</button>
        <p class="meta" id="zoom-level" aria-live="polite">١٠٠٪</p>
        <button type="button" class="icon-button" data-zoom="1" aria-label="تكبير الصورة">+</button>
        <button type="button" class="text-action" data-zoom="reset">الحجم الأصلي</button>
      </div>
      <div class="catalog-pan-controls" role="group" aria-label="تحريك الصورة المكبّرة" hidden>
        <button type="button" class="icon-button" data-pan="right" aria-label="تحريك لليمين">→</button>
        <button type="button" class="icon-button" data-pan="left" aria-label="تحريك لليسار">←</button>
        <button type="button" class="icon-button" data-pan="up" aria-label="تحريك لأعلى">↑</button>
        <button type="button" class="icon-button" data-pan="down" aria-label="تحريك لأسفل">↓</button>
      </div>
    </dialog>

    <dialog class="preview-dialog catalog-dialog" id="catalog-inquiry" aria-labelledby="inquiry-title">
      ${dialogHeading("inquiry-title", "استفسار عن المنتج")}
      <p class="catalog-context"><strong>${escape(product.title)}</strong><span>مرجع القطعة <bdi>${escape(product.id)}</bdi></span><span id="inquiry-options"></span></p>
      <p class="catalog-demo">نموذج معاينة · الحقول المعلّمة مطلوبة</p>
      <form class="catalog-inquiry-form" novalidate>
        <p class="catalog-field-error" id="inquiry-errors" role="alert" tabindex="-1" hidden></p>
        ${field("name", "الاسم (مطلوب)", 'autocomplete="name" required maxlength="120"')}
        ${field("phone", "الهاتف الدولي (مطلوب)", 'type="tel" dir="ltr" autocomplete="tel" inputmode="tel" required maxlength="30" placeholder="+20 100 000 0000"')}
        ${field("country", "الدولة (مطلوبة)", 'autocomplete="country-name" required maxlength="80"')}
        ${field("email", "البريد الإلكتروني (اختياري)", 'type="email" dir="ltr" autocomplete="email" maxlength="160"')}
        ${field("details", "تفاصيل الاستفسار (مطلوبة)", 'required maxlength="1000"', true)}
        <div class="catalog-form-actions">
          <button class="button button-primary" type="submit">تجربة إرسال الاستفسار</button>
          <a class="text-action" href="${root}privacy-policy/index.html">سياسة الخصوصية</a>
          <a class="text-action" href="${root}contact/index.html?type=product&amp;product=${encodeURIComponent(product.slug)}#inquiry">تابع في صفحة التواصل</a>
        </div>
      </form>
      <div class="catalog-inquiry-success" id="inquiry-success" role="status" tabindex="-1" hidden></div>
    </dialog>

    <dialog class="preview-dialog catalog-dialog" id="catalog-share" aria-labelledby="share-title">
      ${dialogHeading("share-title", "مشاركة رابط المنتج")}
      <p>${publicLink ? "يمكنك مشاركة رابط هذه القطعة." : "هذا رابط النسخة المحلية. يمكن نسخه على جهازك، ويحتاج إلى نشر الموقع ليفتح للآخرين."}</p>
      <label class="catalog-share-label">رابط المنتج<input type="url" id="share-url" dir="ltr" value="${escape(shareLink)}" readonly></label>
      <div class="catalog-form-actions">
        <button class="button button-primary" id="share-copy" type="button">نسخ الرابط</button>
        <button class="button button-outline" id="share-native" type="button" hidden>خيارات المشاركة</button>
        ${publicLink ? '<a class="button button-outline" href="https://wa.me/?text=' + encodeURIComponent(shareLink) + '" target="_blank" rel="noopener noreferrer">واتساب</a>' +
          '<a class="button button-outline" href="https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(shareLink) + '" target="_blank" rel="noopener noreferrer">فيسبوك</a>' : ""}
      </div>
      <p id="share-status" class="meta" role="status"></p>
    </dialog>`;

  const tabList = main.querySelector(".detail-tabs");
  if (tabList) {
    const buttons = [...tabList.querySelectorAll('[role="tab"]')];
    function activateTab(current) {
      buttons.forEach((tab) => {
        const selected = tab === current;
        tab.setAttribute("aria-selected", String(selected));
        tab.tabIndex = selected ? 0 : -1;
        document.getElementById(tab.getAttribute("aria-controls")).hidden = !selected;
      });
      scenerySite.refreshClearance();
    }
    buttons.forEach((tab, index) => {
      tab.addEventListener("click", () => activateTab(tab));
      tab.addEventListener("keydown", (event) => {
        const next = { ArrowLeft: (index + 1) % buttons.length, ArrowRight: (index - 1 + buttons.length) % buttons.length, Home: 0, End: buttons.length - 1 }[event.key];
        if (next === undefined) return;
        event.preventDefault();
        activateTab(buttons[next]);
        buttons[next].focus();
      });
    });
  }

  const relatedRail = main.querySelector(".detail-related-rail");
  if (relatedRail) {
    const controls = main.querySelector(".detail-related-controls");
    const [previous, next] = controls.querySelectorAll("button");
    function updateRelated() {
      const remaining = relatedRail.scrollWidth - relatedRail.clientWidth;
      controls.hidden = remaining <= 1;
      previous.setAttribute("aria-disabled", String(relatedRail.scrollLeft >= -3));
      next.setAttribute("aria-disabled", String(-relatedRail.scrollLeft >= remaining - 3));
    }
    controls.addEventListener("click", (event) => {
      const button = event.target.closest("button");
      if (!button || button.getAttribute("aria-disabled") === "true") return;
      const itemWidth = relatedRail.firstElementChild.getBoundingClientRect().width;
      const gap = parseFloat(getComputedStyle(relatedRail).columnGap);
      relatedRail.scrollBy({ left: -Number(button.dataset.related) * (itemWidth + gap) });
    });
    relatedRail.addEventListener("scroll", updateRelated, { passive: true });
    new ResizeObserver(updateRelated).observe(relatedRail);
    updateRelated();
  }

  const gallery = main.querySelector(".catalog-gallery");
  const lightbox = main.querySelector("#catalog-lightbox");
  const zoomControls = lightbox.querySelector(".catalog-zoom-controls");
  const panControls = lightbox.querySelector(".catalog-pan-controls");
  const zoomLevel = lightbox.querySelector("#zoom-level");
  const thumbnailButtons = [...gallery.querySelectorAll("[data-media-index]")];
  const mediaCount = media.length;
  const digits = new Intl.NumberFormat("ar-EG");
  let mediaIndex = 0;
  let zoom = 1;
  let galleryOpener;

  function stopVideo(view) {
    const player = view.querySelector("video");
    if (!player) return;
    player.pause();
    player.removeAttribute("src");
    player.load();
    player.remove();
  }

  function updateZoom() {
    const stage = lightbox.querySelector("[data-stage]");
    stage.style.setProperty("--gallery-zoom", zoom);
    zoomLevel.textContent = digits.format(zoom * 100) + "٪";
    stage.classList.toggle("catalog-zoomed", zoom > 1);
    panControls.hidden = zoom === 1 || zoomControls.hidden;
    lightbox.querySelector('[data-zoom="-1"]').setAttribute("aria-disabled", String(zoom === 1));
    lightbox.querySelector('[data-zoom="1"]').setAttribute("aria-disabled", String(zoom === 3));
    stage.scrollLeft = (stage.scrollWidth - stage.clientWidth) / 2;
    stage.scrollTop = (stage.scrollHeight - stage.clientHeight) / 2;
  }

  function renderMedia(view) {
    const stage = view.querySelector("[data-stage]");
    const item = media[mediaIndex];
    const inLightbox = view === lightbox;
    stopVideo(view);
    if (item.type === "video") {
      stage.innerHTML = '<button class="catalog-media-trigger catalog-video-trigger" type="button" data-play aria-label="تشغيل الفيديو التوضيحي">' +
        image({ src: item.poster, alt: "" }, { priority: true }) + '<span>▶ تشغيل الفيديو</span></button>';
    } else {
      const photo = image(item, { priority: mediaIndex === 0 });
      stage.innerHTML = inLightbox ? '<div class="catalog-zoom-frame">' + photo + '</div>' :
        '<button class="catalog-media-trigger" type="button" data-enlarge aria-label="تكبير الصورة: ' + escape(item.alt) + '">' + photo + '<span class="detail-enlarge-icon">' + draw("fullscreen") + '</span></button>';
    }
    const photoElement = stage.querySelector("img");
    if (photoElement && item.type !== "video" && !inLightbox) {
      if (item.position) photoElement.style.objectPosition = item.position;
      const fit = () => {
        const ratio = photoElement.naturalWidth / photoElement.naturalHeight;
        photoElement.classList.toggle("detail-cover-photo", ratio >= 1.28 && ratio <= 1.82 && !photoElement.hasAttribute("data-image-fallback"));
      };
      photoElement.addEventListener("load", fit);
      if (photoElement.complete) fit();
    }
    const count = view.querySelector("[data-media-count]");
    if (count) {
      count.replaceChildren();
      const display = document.createElement("bdi");
      display.dir = "ltr";
      display.setAttribute("aria-hidden", "true");
      display.textContent = String(mediaIndex + 1).padStart(2, "0") + " / " + String(mediaCount).padStart(2, "0");
      const announcement = document.createElement("span");
      announcement.className = "sr-only";
      announcement.textContent = (item.type === "video" ? "فيديو " : "صورة ") + digits.format(mediaIndex + 1) + " من " + digits.format(mediaCount);
      count.append(display, announcement);
    }
    view.querySelector('[data-media-step="-1"]')?.setAttribute("aria-disabled", String(mediaIndex === 0));
    view.querySelector('[data-media-step="1"]')?.setAttribute("aria-disabled", String(mediaIndex === mediaCount - 1));
    if (inLightbox) {
      zoomControls.hidden = item.type === "video";
      updateZoom();
    }
  }

  function selectMedia(next) {
    if (next < 0 || next >= mediaCount || next === mediaIndex) return;
    const stage = gallery.querySelector("[data-stage]");
    const stageHadFocus = stage.contains(document.activeElement);
    mediaIndex = next;
    zoom = 1;
    renderMedia(gallery);
    if (stageHadFocus) stage.querySelector("button")?.focus({ preventScroll: true });
    if (lightbox.open) renderMedia(lightbox);
    thumbnailButtons.forEach((button, index) => button.setAttribute("aria-pressed", String(index === next)));
  }

  function playVideo(view, trigger) {
    const item = media[mediaIndex];
    const player = document.createElement("video");
    player.controls = true;
    player.playsInline = true;
    player.preload = "none";
    player.poster = root + item.poster;
    player.src = root + item.src;
    player.setAttribute("aria-label", item.alt);
    trigger.replaceWith(player);
    player.addEventListener("error", () => {
      player.replaceWith(scenerySite.paragraph("تعذّر تشغيل الفيديو التوضيحي. اختر صورة أخرى من المعرض.", "catalog-media-error"));
    }, { once: true });
    player.focus({ preventScroll: true });
    player.play().catch(() => { /* Native controls remain available. */ });
  }

  function pan(direction) {
    const stage = lightbox.querySelector("[data-stage]");
    const delta = { left: [-90, 0], right: [90, 0], up: [0, -90], down: [0, 90] }[direction];
    stage.scrollBy(...delta);
  }

  for (const view of [gallery, lightbox]) {
    let touchStart;
    let swiped = false;
    const stage = view.querySelector("[data-stage]");
    view.addEventListener("click", (event) => {
      const button = event.target.closest("button");
      if (!button || button.getAttribute("aria-disabled") === "true") return;
      if (button.hasAttribute("data-media-step")) selectMedia(mediaIndex + Number(button.dataset.mediaStep));
      if (button.hasAttribute("data-media-index")) selectMedia(Number(button.dataset.mediaIndex));
      if (button.hasAttribute("data-play")) playVideo(view, button);
      if (button.hasAttribute("data-enlarge")) {
        galleryOpener = button;
        zoom = 1;
        scenerySite.showDialog(lightbox, button);
        renderMedia(lightbox);
      }
      if (button.hasAttribute("data-zoom")) {
        zoom = button.dataset.zoom === "reset" ? 1 : Math.max(1, Math.min(3, zoom + Number(button.dataset.zoom) * 0.5));
        updateZoom();
      }
      if (button.hasAttribute("data-pan")) pan(button.dataset.pan);
    });
    view.addEventListener("keydown", (event) => {
      if (event.target.closest("video") || !event.key.startsWith("Arrow")) return;
      const direction = event.key.slice(5).toLowerCase();
      if (view === lightbox && zoom > 1 && event.target.closest("[data-stage], .catalog-pan-controls")) {
        event.preventDefault();
        pan(direction);
      } else if (direction === "left" || direction === "right") {
        event.preventDefault();
        selectMedia(mediaIndex + (direction === "left" ? 1 : -1));
      }
    });
    stage.addEventListener("pointerdown", (event) => {
      swiped = false;
      if (event.pointerType !== "touch" || !event.isPrimary || event.target.closest("video") || (view === lightbox && zoom > 1)) return;
      touchStart = { x: event.clientX, y: event.clientY };
    });
    stage.addEventListener("pointerup", (event) => {
      if (!touchStart || event.pointerType !== "touch" || !event.isPrimary) return;
      const dx = event.clientX - touchStart.x;
      const dy = event.clientY - touchStart.y;
      touchStart = undefined;
      if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.4) {
        swiped = true;
        selectMedia(mediaIndex + (dx < 0 ? 1 : -1));
      }
    });
    stage.addEventListener("pointercancel", () => { touchStart = undefined; });
    stage.addEventListener("click", (event) => {
      if (!swiped) return;
      event.stopPropagation();
      swiped = false;
    }, true);
  }

  lightbox.addEventListener("close", () => {
    stopVideo(lightbox);
    if (!galleryOpener?.isConnected) {
      gallery.querySelector("[data-enlarge], [data-play]")?.focus({ preventScroll: true });
    }
  });
  renderMedia(gallery);
  thumbnailButtons[0]?.setAttribute("aria-pressed", "true");
  thumbnailButtons.slice(1).forEach((button) => button.setAttribute("aria-pressed", "false"));

  const inquiry = main.querySelector("#catalog-inquiry");
  const inquiryForm = inquiry.querySelector("form.catalog-inquiry-form");
  const inquiryErrors = inquiry.querySelector("#inquiry-errors");
  const inquirySuccess = inquiry.querySelector("#inquiry-success");
  const inquiryOpener = main.querySelector("#inquiry-open");
  const fields = ["name", "phone", "country", "email", "details"];

  function selectedOptions() {
    return [...main.querySelectorAll("[data-option]")].filter((field) => field.value)
      .map((field) => (optionLabels[field.dataset.option] || field.dataset.option) + ": " + field.value);
  }

  function setError(name, message) {
    const field = inquiryForm.elements[name];
    const line = inquiry.querySelector("#inquiry-" + name + "-error");
    line.textContent = message;
    line.hidden = !message;
    if (message) field.setAttribute("aria-invalid", "true");
    else field.removeAttribute("aria-invalid");
  }

  inquiryOpener.addEventListener("click", () => {
    inquiry.querySelector("#inquiry-options").textContent = selectedOptions().join(" · ") || "بدون خيارات إضافية";
    inquiryForm.hidden = false;
    inquirySuccess.hidden = true;
    inquiryErrors.hidden = true;
    fields.forEach((name) => setError(name, ""));
    scenerySite.showDialog(inquiry, inquiryOpener);
  });

  fields.forEach((name) => inquiryForm.elements[name].addEventListener("input", () => setError(name, "")));
  inquiryForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const form = inquiryForm.elements;
    const phone = scenerySite.normalizePhone(form.phone.value);
    const errors = {
      name: form.name.value.trim() ? "" : "اكتب اسمك.",
      phone: /^\+[1-9][0-9]{6,14}$/.test(phone) ? "" : "أدخل رقمًا دوليًا يبدأ بعلامة + ثم رمز الدولة.",
      country: form.country.value.trim() ? "" : "اكتب الدولة.",
      email: form.email.validity.typeMismatch ? "تحقّق من صيغة البريد الإلكتروني." : "",
      details: form.details.value.trim() ? "" : "اكتب تفاصيل استفسارك."
    };
    fields.forEach((name) => setError(name, errors[name]));
    if (fields.some((name) => errors[name])) {
      inquiryErrors.textContent = "راجع الحقول الموضّحة أدناه.";
      inquiryErrors.hidden = false;
      inquiryErrors.focus();
      return;
    }
    inquiryForm.reset();
    inquiryForm.hidden = true;
    inquirySuccess.replaceChildren(scenerySite.paragraph("هذه تجربة توضيحية، ولم يتم إرسال الاستفسار فعليًا"));
    const selections = selectedOptions();
    if (selections.length) inquirySuccess.append(scenerySite.paragraph("خيارات الاستفسار التجريبي: " + selections.join(" · "), "meta"));
    inquirySuccess.hidden = false;
    inquirySuccess.focus();
  });

  const share = main.querySelector("#catalog-share");
  const shareOpener = main.querySelector("#share-open");
  const shareUrl = share.querySelector("#share-url");
  const shareStatus = share.querySelector("#share-status");
  const nativeShare = share.querySelector("#share-native");
  nativeShare.hidden = !publicLink || typeof navigator.share !== "function";
  shareOpener.addEventListener("click", () => {
    shareStatus.textContent = "";
    scenerySite.showDialog(share, shareOpener);
  });
  share.querySelector("#share-copy").addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
      shareStatus.textContent = "تم نسخ الرابط.";
    } catch {
      shareUrl.focus();
      shareUrl.select();
      shareStatus.textContent = "تم تحديد الرابط للنسخ اليدوي.";
    }
  });
  nativeShare.addEventListener("click", async () => {
    try {
      await navigator.share({ title: product.title, url: shareLink });
    } catch (error) {
      if (error.name !== "AbortError") shareStatus.textContent = "يمكنك نسخ الرابط ومشاركته يدويًا.";
    }
  });
})();
