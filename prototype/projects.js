"use strict";

const projectTypeList = sceneryContent.projectTypes;
const portfolioProjects = sceneryContent.projects.filter((project) => project.published !== false);
const feature = portfolioProjects.find((project) => project.featured && project.photos?.length);
const filters = document.querySelector("#portfolio-filters");
const listing = document.querySelector("#portfolio-grid");
const catalog = document.querySelector("#project-catalog");
const cardTemplate = document.querySelector("#portfolio-card");
const typeTemplate = document.querySelector("#portfolio-type");
const requestedType = new URLSearchParams(location.search).get("type");
const state = { type: projectTypeList.some((item) => item.id === requestedType) ? requestedType : "", view: "grid" };
const number = new Intl.NumberFormat("ar");
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
let photoIndex = 0;

function setProjectImage(image, photo, decorative = false) {
  image.alt = decorative ? "" : (photo?.alt ?? "لا تتوفر صورة لهذا المشروع");
  image.style.objectPosition = photo?.position ?? "";
  image.style.transformOrigin = photo?.position ?? "";
  image.style.scale = photo?.zoom ?? "";
  image.src = photo?.src ? "../" + photo.src : "../assets/catalog/placeholder.svg";
}

function orderedProjects() {
  const displayOrder = (item) => Number.isFinite(item.order) ? item.order : Number.MAX_SAFE_INTEGER;
  return portfolioProjects
    .filter((project) => !state.type || project.typeIds?.includes(state.type))
    .sort((a, b) => displayOrder(a) - displayOrder(b));
}

function renderProjects() {
  const matches = orderedProjects();
  const cards = matches.map((project) => {
    const card = cardTemplate.content.firstElementChild.cloneNode(true);
    const media = projectMedia(project);
    setProjectImage(card.querySelector("img"), project.cover ?? media.find((item) => item.type !== "video"));
    card.querySelector(".portfolio-demo-badge").hidden = !project.demo;
    if (media.some((item) => item.type === "video")) {
      const mark = card.querySelector(".portfolio-media-icon");
      mark.removeAttribute("aria-hidden");
      mark.querySelector("use").setAttribute("href", "#portfolio-play");
      mark.querySelector(".sr-only").textContent = "يتضمن فيديو";
    }
    card.querySelector("h3").textContent = project.title;
    card.querySelector("p").textContent = project.types?.join(" · ") || project.summary;
    const action = card.querySelector("[data-project-link]");
    action.dataset.projectId = project.id;
    action.href = projectDetailUrl(project.id, "../");
    action.setAttribute("aria-label", "عرض المشروع: " + project.title);
    return card;
  });
  listing.replaceChildren(...cards);
  document.querySelector("#portfolio-empty").hidden = matches.length > 0;
  document.querySelector("#portfolio-count").textContent = "عدد المشاريع المعروضة: " + number.format(matches.length);
  filters.querySelectorAll("button").forEach((button) => {
    button.setAttribute("aria-pressed", String(button.dataset.type === state.type));
  });
  scenerySite.refreshClearance();
}

function setType(id) {
  state.type = id;
  renderProjects();
}

for (const type of [{ id: "", title: "الكل" }, ...projectTypeList]) {
  const filter = document.createElement("button");
  filter.type = "button";
  filter.dataset.type = type.id;
  filter.textContent = type.title;
  filter.addEventListener("click", () => setType(type.id));
  filters.append(filter);
}

const views = [...document.querySelectorAll(".portfolio-views button")];
views.forEach((view) => view.addEventListener("click", () => {
  state.view = view.dataset.view;
  listing.classList.toggle("portfolio-list-view", state.view === "list");
  views.forEach((button) => button.setAttribute("aria-pressed", String(button === view)));
  scenerySite.refreshClearance();
}));

document.querySelector("#portfolio-empty button").addEventListener("click", () => {
  setType("");
  filters.firstElementChild.focus();
});

const typeCards = document.querySelector("#portfolio-type-cards");
for (const type of projectTypeList) {
  const card = typeTemplate.content.firstElementChild.cloneNode(true);
  setProjectImage(card.querySelector("img"), { src: type.image }, true);
  card.querySelector("use").setAttribute("href", "#icon-" + type.icon);
  card.querySelector("strong").textContent = type.title;
  card.addEventListener("click", () => {
    setType(type.id);
    catalog.querySelector("h2").focus({ preventScroll: true });
    catalog.scrollIntoView({ block: "start" });
  });
  typeCards.append(card);
}

function mountFeaturedGallery(project) {
  const section = document.querySelector("#portfolio-feature");
  const gallery = section.querySelector(".portfolio-gallery");
  const stage = section.querySelector(".portfolio-stage");
  const image = section.querySelector("#portfolio-feature-image");
  const thumbnails = section.querySelector("#portfolio-thumbs");
  const controls = section.querySelector(".portfolio-gallery-controls");
  const status = section.querySelector("#portfolio-photo-status");
  const { photos } = project;
  const multiple = photos.length > 1;
  section.querySelector("#portfolio-feature-title").textContent = project.title;
  section.querySelector("#portfolio-feature-summary").textContent = project.summary;
  section.querySelector("[data-project-link]").href = projectDetailUrl(project.id, "../");
  const meta = section.querySelector("#portfolio-feature-meta");
  for (const [label, value, icon] of [
    ["نوع الأعمال", project.types?.join(" · "), "layers"],
    ["الموقع", project.location, "pin"],
    ["النطاق", project.scope, "scope"]
  ]) {
    if (!value) continue;
    const row = document.createElement("div");
    row.innerHTML = '<dt><svg class="icon" aria-hidden="true"><use href="#portfolio-' + icon + '"></use></svg>' + label + '</dt><dd></dd>';
    row.querySelector("dd").textContent = value;
    meta.append(row);
  }

  function showPhoto(index) {
    const next = (index + photos.length) % photos.length;
    const changed = photoIndex !== next;
    photoIndex = next;
    setProjectImage(image, photos[photoIndex]);
    if (changed && !reducedMotion.matches) {
      image.getAnimations().forEach((animation) => animation.cancel());
      image.animate([{ opacity: .72 }, { opacity: 1 }], { duration: 180, easing: "ease-out" });
    }
    thumbnails.querySelectorAll("button").forEach((button, position) => {
      button.setAttribute("aria-pressed", String(position === photoIndex));
    });
    status.textContent = "الصورة " + number.format(photoIndex + 1) + " من " + number.format(photos.length);
  }

  thumbnails.hidden = !multiple;
  controls.hidden = !multiple;
  if (multiple) {
    photos.forEach((photo, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.setAttribute("aria-label", "عرض " + photo.alt);
      const thumb = new Image();
      thumb.loading = "lazy";
      thumb.decoding = "async";
      setProjectImage(thumb, photo, true);
      button.append(thumb);
      button.addEventListener("click", () => showPhoto(index));
      thumbnails.append(button);
    });
    controls.querySelectorAll("button").forEach((button) => {
      button.addEventListener("click", () => showPhoto(photoIndex + Number(button.dataset.photoStep)));
    });
    gallery.addEventListener("keydown", (event) => {
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
      event.preventDefault();
      showPhoto(photoIndex + (event.key === "ArrowLeft" ? 1 : -1));
      if (thumbnails.contains(event.target)) thumbnails.children[photoIndex].focus();
    });

    let swipeStart;
    stage.addEventListener("pointerdown", (event) => {
      if (event.pointerType === "touch" && event.isPrimary && !event.target.closest("button")) {
        swipeStart = { x: event.clientX, y: event.clientY };
        stage.setPointerCapture(event.pointerId);
      }
    });
    stage.addEventListener("pointercancel", () => { swipeStart = undefined; });
    stage.addEventListener("pointerup", (event) => {
      if (!swipeStart) return;
      const dx = event.clientX - swipeStart.x;
      const dy = event.clientY - swipeStart.y;
      swipeStart = undefined;
      if (Math.abs(dx) > 45 && Math.abs(dx) > 1.35 * Math.abs(dy)) showPhoto(photoIndex + (dx < 0 ? 1 : -1));
    });
  } else {
    stage.removeAttribute("tabindex");
  }
  showPhoto(0);
  section.hidden = false;
}

scenerySite.registerPreview("credits", (title, content) => {
  title.textContent = "مصادر الصور";
  content.append(scenerySite.paragraph("صور هذه الصفحة من أصول نموذج Scenery التجريبي. تُستبدل بصور الأعمال المعتمدة عند تجهيز المحتوى للنشر."));
});

document.addEventListener("error", (event) => {
  const image = event.target;
  if (image instanceof HTMLImageElement && image.closest("main, #preview-content") && !image.src.endsWith("/placeholder.svg")) {
    setProjectImage(image);
  }
}, true);

reducedMotion.addEventListener("change", () => {
  document.querySelector("#portfolio-feature-image").getAnimations().forEach((animation) => animation.cancel());
});

if (feature) mountFeaturedGallery(feature);
renderProjects();
