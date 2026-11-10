"use strict";

const rootPath = "../../";
const placeholder = rootPath + "assets/catalog/placeholder.svg";
const published = sceneryContent.projects.filter((item) => item.published !== false);
const id = new URLSearchParams(location.search).get("project");
const current = published.find((item) => item.id === id);
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
const number = new Intl.NumberFormat("ar-EG");

function icon(name) {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  const use = document.createElementNS(svg.namespaceURI, "use");
  svg.classList.add("icon");
  svg.setAttribute("aria-hidden", "true");
  use.setAttribute("href", "#" + name);
  svg.append(use);
  return svg;
}

function imageFor(image, photo, { decorative = false, crop = true } = {}) {
  image.alt = decorative ? "" : (photo?.alt ?? "لا تتوفر صورة لهذا المشروع");
  image.style.objectPosition = crop ? (photo?.position ?? "") : "";
  image.style.transformOrigin = image.style.objectPosition;
  image.style.scale = crop ? (photo?.zoom ?? "") : "";
  image.src = photo?.src ? rootPath + photo.src : placeholder;
}

function picture(photo, options) {
  const image = new Image();
  image.loading = "lazy";
  image.decoding = "async";
  imageFor(image, photo, options);
  return image;
}

document.addEventListener("error", (event) => {
  const image = event.target;
  if (!(image instanceof HTMLImageElement) || !image.closest(".project-detail, #pd-lightbox") || image.src.endsWith("/placeholder.svg")) return;
  const decorative = image.alt === "";
  imageFor(image, null, { decorative });
}, true);

scenerySite.registerPreview("credits", (title, content) => {
  title.textContent = "مصادر الصور";
  content.append(scenerySite.paragraph("صور المشاريع من أصول نموذج Scenery التجريبي."));
});

function createVideoPanel(surface) {
  const panel = document.querySelector("#pd-video-template").content.firstElementChild.cloneNode(true);
  const poster = panel.querySelector("img");
  const video = panel.querySelector("video");
  const play = panel.querySelector("button");
  const label = play.querySelector("span");
  const error = panel.querySelector(".pd-video-error");
  let item;
  let attempt = 0;
  surface.prepend(panel);

  function stop() {
    attempt++;
    if (video.hasAttribute("src")) {
      video.pause();
      video.removeAttribute("src");
      video.load();
    }
  }

  function showError() {
    if (!video.hasAttribute("src")) return;
    const restoreFocus = document.activeElement === video;
    stop();
    video.hidden = true;
    poster.hidden = false;
    play.hidden = false;
    label.textContent = "إعادة محاولة التشغيل";
    error.textContent = "تعذّر تحميل الفيديو.";
    error.hidden = false;
    if (restoreFocus) play.focus({ preventScroll: true });
  }

  video.addEventListener("error", showError);
  play.addEventListener("click", () => {
    const request = ++attempt;
    error.hidden = true;
    video.hidden = false;
    poster.hidden = true;
    play.hidden = true;
    video.src = rootPath + item.src;
    video.focus({ preventScroll: true });
    video.play().catch(() => { if (request === attempt) showError(); });
  });

  return {
    set(next) {
      stop();
      item = next;
      panel.hidden = !next;
      if (!next) return;
      const posterPath = next.poster ? rootPath + next.poster : placeholder;
      poster.src = posterPath;
      video.poster = posterPath;
      video.setAttribute("aria-label", next.title);
      label.textContent = "تشغيل الفيديو";
      error.hidden = true;
      poster.hidden = false;
      play.hidden = false;
      video.hidden = true;
    }
  };
}

function mountGallery(media) {
  const mainGallery = document.querySelector(".pd-main-gallery");
  const stage = mainGallery.querySelector(".pd-stage");
  const mainImage = stage.querySelector("img");
  const loading = stage.querySelector(".pd-loading");
  const thumbs = mainGallery.querySelector(".pd-thumbs");
  const expand = stage.querySelector(".pd-expand");
  const lightbox = document.querySelector("#pd-lightbox");
  const lightStage = lightbox.querySelector(".pd-lightbox-stage");
  const lightImage = lightStage.querySelector("img");
  const zoomControls = lightbox.querySelector(".pd-zoom-controls");
  const caption = mainGallery.querySelector(".pd-media-caption");
  const extra = document.querySelector(".pd-additional");
  const extraPhotos = extra.querySelector(".pd-additional-photos");
  const hasVideo = media.some((item) => item.type === "video");
  const mainVideo = hasVideo ? createVideoPanel(stage) : null;
  const lightVideo = hasVideo ? createVideoPanel(lightStage) : null;
  if (hasVideo) {
    stage.querySelector("#pd-count").setAttribute("aria-label", "رقم الوسيط");
    lightbox.querySelector(".pd-lightbox-nav").setAttribute("aria-label", "التنقل بين الوسائط");
  }
  let selected = 0;
  let zoom = 1;

  function updateZoom(level) {
    zoom = level;
    lightStage.style.setProperty("--pd-zoom", zoom);
    lightStage.classList.toggle("is-zoomed", zoom > 1);
    lightbox.querySelector(".pd-zoom-level").textContent = number.format(zoom * 100) + "٪";
    lightbox.querySelector('[data-zoom="-1"]').setAttribute("aria-disabled", String(zoom === 1));
    lightbox.querySelector('[data-zoom="1"]').setAttribute("aria-disabled", String(zoom === 3));
    lightStage.scrollTo({ left: (lightStage.scrollWidth - lightStage.clientWidth) / 2, top: (lightStage.scrollHeight - lightStage.clientHeight) / 2, behavior: "instant" });
  }

  function show(index, { animate = true } = {}) {
    if (media.length) selected = (index + media.length) % media.length;
    const item = media[selected];
    const isVideo = item?.type === "video";
    mainVideo?.set(isVideo ? item : null);
    mainImage.hidden = isVideo;
    if (!isVideo) imageFor(mainImage, item);
    loading.hidden = isVideo || mainImage.complete;
    stage.classList.toggle("is-video", isVideo);
    expand.setAttribute("aria-label", isVideo ? "فتح الفيديو بالحجم الكبير" : "فتح الصورة بالحجم الكبير");
    caption.textContent = isVideo ? item.description ?? "" : "";
    caption.hidden = !caption.textContent;
    const counter = (media.length ? selected + 1 : 0).toString().padStart(2, "0") + " / " + String(media.length).padStart(2, "0");
    stage.querySelector("#pd-count").textContent = counter;
    lightbox.querySelector(".pd-lightbox-count").textContent = counter;
    thumbs.querySelectorAll("button").forEach((button, i) => {
      button.setAttribute("aria-pressed", String(i === selected));
    });
    const active = thumbs.children[selected];
    if (active) {
      const bounds = thumbs.getBoundingClientRect();
      const item = active.getBoundingClientRect();
      const offset = item.left < bounds.left ? item.left - bounds.left : Math.max(0, item.right - bounds.right);
      if (offset) thumbs.scrollBy({ left: offset, behavior: reducedMotion.matches ? "instant" : "smooth" });
    }
    if (lightbox.open) {
      lightImage.hidden = isVideo;
      zoomControls.hidden = isVideo;
      lightVideo?.set(isVideo ? item : null);
      if (!isVideo) imageFor(lightImage, item, { crop: false });
      updateZoom(1);
      lightbox.querySelector("h2").textContent = isVideo ? item.title : "صورة المشروع بالحجم الكبير";
    }
    mainImage.getAnimations().forEach((animation) => animation.cancel());
    if (!isVideo && animate && !reducedMotion.matches && !lightbox.open) {
      mainImage.animate([{ opacity: .62 }, { opacity: 1 }], { duration: 170, easing: "ease-out" });
    }
  }

  function openLightbox(button, index) {
    scenerySite.showDialog(lightbox, button);
    show(index, { animate: false });
  }

  mainImage.addEventListener("load", () => { loading.hidden = true; });
  expand.hidden = !media.length;
  stage.querySelector(".pd-stage-arrows").hidden = media.length < 2;
  stage.querySelector("#pd-count").hidden = !media.length;
  lightbox.querySelector(".pd-lightbox-nav").hidden = media.length < 2;
  thumbs.hidden = media.length < 2;
  extra.hidden = media.filter((item) => item.type !== "video").length < 2;
  if (media.length < 2) stage.removeAttribute("tabindex");
  expand.addEventListener("click", () => openLightbox(expand, selected));
  lightbox.addEventListener("close", () => lightVideo?.set(null));

  if (media.length > 1) media.forEach((item, index) => {
    const thumb = document.createElement("button");
    thumb.type = "button";
    const video = item.type === "video";
    thumb.setAttribute("aria-label", video ? "عرض فيديو: " + item.title : "عرض " + item.alt);
    thumb.append(picture(video ? { src: item.poster } : item, { decorative: true }));
    if (video) {
      const mark = document.createElement("span");
      mark.className = "pd-thumb-play";
      mark.append(icon("pd-play"));
      thumb.append(mark);
    }
    thumb.addEventListener("click", () => show(index));
    thumbs.append(thumb);
    if (video || extra.hidden) return;
    const detail = document.createElement("button");
    detail.type = "button";
    detail.setAttribute("aria-label", "تكبير " + item.alt);
    detail.setAttribute("aria-haspopup", "dialog");
    detail.append(picture(item, { decorative: true }));
    detail.addEventListener("click", () => openLightbox(detail, index));
    extraPhotos.append(detail);
  });

  for (const container of [mainGallery, lightbox]) {
    container.querySelectorAll("[data-step]").forEach((button) => {
      button.addEventListener("click", () => show(selected + Number(button.dataset.step)));
    });
    container.addEventListener("keydown", (event) => {
      if (event.target.closest("video") || (container === lightbox && zoom > 1 && lightStage.contains(event.target))) return;
      if (media.length < 2 || (event.key !== "ArrowLeft" && event.key !== "ArrowRight")) return;
      event.preventDefault();
      show(selected + (event.key === "ArrowLeft" ? 1 : -1));
      if (thumbs.contains(event.target)) thumbs.children[selected].focus({ preventScroll: true });
    });
  }

  for (const surface of [stage, lightStage]) {
    let start;
    surface.addEventListener("pointerdown", (event) => {
      if (media.length < 2 || event.pointerType !== "touch" || !event.isPrimary || event.target.closest("button, video") ||
        (surface === lightStage && zoom > 1)) return;
      start = { x: event.clientX, y: event.clientY };
      surface.setPointerCapture(event.pointerId);
    });
    surface.addEventListener("pointercancel", () => { start = undefined; });
    surface.addEventListener("pointerup", (event) => {
      if (!start) return;
      const dx = event.clientX - start.x;
      const dy = event.clientY - start.y;
      start = undefined;
      if (Math.abs(dx) > 45 && Math.abs(dx) > 1.35 * Math.abs(dy)) show(selected + (dx < 0 ? 1 : -1));
    });
  }

  lightbox.querySelectorAll("[data-zoom]").forEach((button) => {
    button.addEventListener("click", () => {
      updateZoom(button.dataset.zoom === "reset" ? 1 : Math.max(1, Math.min(3, zoom + Number(button.dataset.zoom) * .5)));
    });
  });
  reducedMotion.addEventListener("change", () => mainImage.getAnimations().forEach((animation) => animation.cancel()));
  show(0, { animate: false });
  return openLightbox;
}

function mountProject(project) {
  const summary = project.summary?.trim() ?? "";
  const description = project.description?.trim() ?? "";
  const hasSeparateDescription = Boolean(description && description !== summary);
  document.title = project.title + " | Scenery";
  if (summary || description) document.querySelector('meta[name="description"]').content = summary || description;
  document.querySelector(".pd-breadcrumb [aria-current]").textContent = project.title;
  document.querySelector("#pd-title").textContent = project.title;
  document.querySelector("#pd-label").textContent = project.featured ? "مشروع مميز" : "مشروع تجريبي";
  const intro = document.querySelector("#pd-summary");
  intro.textContent = summary;
  intro.hidden = !summary;
  const body = document.querySelector("#pd-description");
  body.textContent = description;
  body.hidden = !hasSeparateDescription;
  const mediaItems = projectMedia(project);
  const photos = mediaItems.filter((item) => item.type !== "video");
  const date = Date.parse(project.completedAt);
  for (const [label, value, symbol] of [
    ["نوع الأعمال", project.types?.join(" · "), "layers"],
    ["الموقع", project.location, "pin"],
    ["النطاق", project.scope, "scope"],
    ["تاريخ التنفيذ", Number.isFinite(date) ? new Intl.DateTimeFormat("ar-EG", { month: "long", year: "numeric", timeZone: "UTC" }).format(date) : "", "calendar"]
  ]) {
    if (!value) continue;
    const row = document.createElement("div");
    const term = document.createElement("dt");
    const detail = document.createElement("dd");
    term.append(icon("pd-" + symbol), label);
    detail.textContent = value;
    row.append(term, detail);
    document.querySelector("#pd-overview").append(row);
  }
  document.querySelector("#pd-overview").hidden = !document.querySelector("#pd-overview").children.length;

  const works = document.querySelector(".pd-works");
  for (const item of project.works ?? project.types?.map((title) => ({ title, icon: "wood" })) ?? []) {
    const row = document.createElement("li");
    row.append(icon("icon-" + item.icon), item.title);
    works.querySelector("ul").append(row);
  }
  works.hidden = !works.querySelector("ul").children.length;
  const features = document.querySelector(".pd-features");
  for (const item of project.features ?? []) {
    const row = document.createElement("li");
    const label = document.createElement("strong");
    label.textContent = item.title;
    row.append(icon("icon-" + item.icon), label);
    if (item.detail) row.append(scenerySite.paragraph(item.detail));
    features.append(row);
  }
  const narrative = document.querySelector(".pd-narrative");
  narrative.hidden = !hasSeparateDescription && !features.children.length;
  const detail = document.querySelector(".pd-detail-photo");
  if (photos[project.detailPhoto]) {
    imageFor(detail.querySelector("img"), photos[project.detailPhoto]);
    detail.hidden = false;
  }
  document.querySelector(".pd-story").hidden = narrative.hidden && works.hidden && detail.hidden;
  const materials = document.querySelector(".pd-materials");
  for (const item of project.materials ?? []) {
    const sample = document.createElement("figure");
    const caption = document.createElement("figcaption");
    const label = document.createElement("strong");
    label.textContent = item.title;
    caption.append(label);
    if (item.detail) caption.append(scenerySite.paragraph(item.detail));
    const samplePhoto = photos[item.photo];
    if (samplePhoto) {
      const swatch = document.createElement("div");
      swatch.className = "pd-swatch";
      swatch.append(picture(samplePhoto, { decorative: true }));
      sample.append(swatch);
    }
    sample.append(caption);
    materials.querySelector(".pd-material-grid").append(sample);
  }
  materials.hidden = !materials.querySelector(".pd-material-grid").children.length;

  const related = document.querySelector(".pd-related");
  const types = project.typeIds ?? [];
  const suggestions = new Map();
  for (const id of project.related ?? []) {
    const match = published.find((item) => item.id === id && item.id !== project.id);
    if (match) suggestions.set(id, match);
  }
  const similarity = (item) => item.typeIds?.filter((type) => types.includes(type)).length ?? 0;
  for (const item of published.filter((item) => item.id !== project.id && similarity(item)).sort((a, b) => similarity(b) - similarity(a))) {
    if (!suggestions.has(item.id)) suggestions.set(item.id, item);
  }
  for (const item of [...suggestions.values()].slice(0, 3)) {
    const card = document.createElement("a");
    card.className = "portfolio-card pd-related-card";
    card.href = projectDetailUrl(item.id, rootPath);
    const media = document.createElement("div");
    media.className = "portfolio-card-media";
    media.append(picture(item.cover ?? item.photos?.[0], { decorative: true }));
    const copy = document.createElement("div");
    copy.className = "portfolio-card-copy";
    const title = document.createElement("h3");
    title.textContent = item.title;
    copy.append(title, scenerySite.paragraph(item.types?.join(" · ") || item.summary));
    card.append(media, copy);
    related.querySelector(".portfolio-grid").append(card);
  }
  related.hidden = !suggestions.size;

  document.querySelector("#pd-content").hidden = false;
  const openLightbox = mountGallery(mediaItems);
  const spaces = document.querySelector(".pd-spaces");
  const spaceGrid = spaces.querySelector(".pd-spaces-grid");
  for (const space of project.spaces ?? []) {
    const article = document.createElement("article");
    article.className = "portfolio-card";
    const index = mediaItems.findIndex((item) => item.id === space.mediaId && item.type !== "video");
    if (index >= 0) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "portfolio-card-media pd-space-photo";
      button.setAttribute("aria-label", "تكبير صورة " + space.title);
      button.setAttribute("aria-haspopup", "dialog");
      button.append(picture(mediaItems[index], { decorative: true }));
      button.addEventListener("click", () => openLightbox(button, index));
      article.append(button);
    }
    const copy = document.createElement("div");
    copy.className = "portfolio-card-copy";
    const title = document.createElement("h3");
    title.textContent = space.title;
    copy.append(title, scenerySite.paragraph(space.works.join(" · ")));
    article.append(copy);
    spaceGrid.append(article);
  }
  spaces.hidden = !spaceGrid.children.length;
  mountInquiry(project);
}

function mountInquiry(project) {
  const dialog = document.querySelector("#pd-inquiry");
  const form = dialog.querySelector("form.pd-inquiry-form");
  const status = dialog.querySelector("#pd-inquiry-status");
  form.dataset.projectId = project.id;
  dialog.querySelector("#pd-inquiry-reference").textContent = "المشروع: " + project.title;
  document.querySelectorAll("[data-inquiry]").forEach((button) => button.addEventListener("click", () => {
    form.dataset.intent = button.dataset.inquiry;
    const query = new URLSearchParams({ type: button.dataset.inquiry === "similar" ? "custom" : "project", project: project.id });
    dialog.querySelector("#pd-contact-link").href = rootPath + "contact/index.html?" + query + "#inquiry";
    dialog.querySelector("h2").textContent = button.dataset.inquiry === "similar" ? "اطلب تنفيذ مشروع مشابه" : "استفسر عن المشروع";
    status.textContent = "";
    scenerySite.showDialog(dialog, button);
  }));
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    form.reset();
    status.textContent = "هذه تجربة توضيحية، ولم يتم إرسال الاستفسار فعليًا.";
    status.focus();
  });
  dialog.addEventListener("close", () => form.reset());
}

if (current) {
  mountProject(current);
} else {
  document.title = "المشروع غير موجود | Scenery";
  document.querySelector("#pd-missing").hidden = false;
}
