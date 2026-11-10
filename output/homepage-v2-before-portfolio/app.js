"use strict";

const navExtras = document.querySelector("#home-nav-extras").content.cloneNode(true);
const nav = document.querySelector(".nav-links");
const navLinks = [...nav.children];
nav.replaceChildren(navLinks[0], navLinks[1], navLinks[3], navExtras.querySelector("li"), navLinks[5]);
document.querySelector(".header-contact").before(navExtras.querySelector(".home-search"));

const mosaic = document.querySelector(".mosaic");
const tileTemplate = document.querySelector("#product-tile");
for (const item of sceneryContent.collections) {
  const tile = tileTemplate.content.firstElementChild.cloneNode(true);
  tile.querySelector(".product-tile").href = "products/category/" + item.category + "/";
  const preview = tile.querySelector(".collection-preview");
  preview.href = "products/" + item.product + "/";
  preview.setAttribute("aria-label", "عاين قطعة من " + item.title);
  const image = tile.querySelector("img");
  image.src = item.image;
  image.width = item.width;
  image.height = item.height;
  tile.querySelector(".tile-label span").textContent = item.title;
  mosaic.append(tile);
}

const hero = document.querySelector(".hero");
const heroImage = document.querySelector("#hero-image");
const heroTitle = document.querySelector("#hero-title");
const heroDescription = document.querySelector("#hero-description");
const heroPrimary = document.querySelector("#hero-primary");
const heroCount = document.querySelector("#hero-count");
const heroStatus = document.querySelector("#hero-status");
const heroIndicators = [...hero.querySelectorAll("[data-hero-index]")];
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
let heroIndex = 0;

function stopHeroAnimation() {
  heroImage.getAnimations().forEach((animation) => animation.cancel());
}

reducedMotion.addEventListener("change", ({ matches }) => {
  if (matches) stopHeroAnimation();
});

function showSlide(index) {
  const total = sceneryContent.slides.length;
  const next = (index + total) % total;
  if (next === heroIndex) return;
  heroIndex = next;
  const slide = sceneryContent.slides[next];
  heroImage.src = slide.image;
  heroImage.alt = slide.alt;
  heroTitle.replaceChildren(...slide.title.flatMap((line, i) => i ? [document.createElement("br"), line] : [line]));
  heroDescription.textContent = slide.description;
  heroPrimary.href = slide.link;
  heroPrimary.querySelector("span").textContent = slide.action;
  heroCount.textContent = String(next + 1).padStart(2, "0") + " / " + String(total).padStart(2, "0");
  heroStatus.textContent = "الشريحة " + (next + 1) + " من " + total + " · " + slide.title.join(" ");
  heroIndicators.forEach((button, i) => {
    if (i === next) button.setAttribute("aria-current", "true");
    else button.removeAttribute("aria-current");
  });
  stopHeroAnimation();
  if (!reducedMotion.matches) {
    heroImage.animate([{ opacity: 0.45 }, { opacity: 1 }], { duration: 240, easing: "ease-out" });
  }
}

hero.querySelectorAll("[data-hero-step]").forEach((button) => {
  button.addEventListener("click", () => showSlide(heroIndex + Number(button.dataset.heroStep)));
});
heroIndicators.forEach((button, index) => {
  button.addEventListener("click", () => showSlide(index));
});
hero.querySelector(".hero-navigation").addEventListener("keydown", (event) => {
  if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
  event.preventDefault();
  showSlide(heroIndex + (event.key === "ArrowLeft" ? 1 : -1));
});

let swipeStart;
hero.addEventListener("pointerdown", (event) => {
  if (event.pointerType === "touch" && event.isPrimary && !event.target.closest("button, a")) {
    swipeStart = { x: event.clientX, y: event.clientY };
  }
});
hero.addEventListener("pointerup", (event) => {
  if (!swipeStart || event.pointerType !== "touch" || !event.isPrimary) return;
  const dx = event.clientX - swipeStart.x;
  const dy = event.clientY - swipeStart.y;
  swipeStart = undefined;
  if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy) * 1.35) showSlide(heroIndex + (dx < 0 ? 1 : -1));
});
hero.addEventListener("pointercancel", () => { swipeStart = undefined; });
function useHeroFallback() {
  const fallback = "assets/images/hero-800.webp";
  if (heroImage.getAttribute("src") !== fallback) heroImage.src = fallback;
}
heroImage.addEventListener("error", useHeroFallback);
if (heroImage.complete && !heroImage.naturalWidth) useHeroFallback();

const reviewText = document.querySelector("#review-text");
const reviewIndicators = [...document.querySelectorAll("[data-review-index]")];
let reviewIndex = 0;

function showReview(index) {
  const total = sceneryContent.reviews.length;
  reviewIndex = (index + total) % total;
  reviewText.textContent = sceneryContent.reviews[reviewIndex];
  reviewIndicators.forEach((button, i) => {
    if (i === reviewIndex) button.setAttribute("aria-current", "true");
    else button.removeAttribute("aria-current");
  });
}
reviewText.setAttribute("aria-live", "polite");
reviewIndicators.forEach((button, index) => button.addEventListener("click", () => showReview(index)));
document.querySelectorAll("[data-review-step]").forEach((button) => {
  button.addEventListener("click", () => showReview(reviewIndex + Number(button.dataset.reviewStep)));
});

const project = sceneryContent.project;
const projectGallery = document.querySelector(".project-gallery");
const projectImage = document.querySelector("#project-image");
const projectCount = document.querySelector("#project-count");
const projectDetails = document.querySelector(".project-details");
let projectIndex = 0;

document.querySelector("#project-name").textContent = project.title;
document.querySelector("#project-description").textContent = project.summary;

const projectThumbnails = project.photos.slice(1).map((photo, i) => {
  const button = document.createElement("button");
  button.type = "button";
  button.setAttribute("aria-label", "عرض " + photo.alt);
  button.setAttribute("aria-pressed", "false");
  const image = new Image(photo.width, photo.height);
  image.src = photo.src;
  image.alt = "";
  image.loading = "lazy";
  image.decoding = "async";
  button.append(image);
  button.addEventListener("click", () => showProjectPhoto(i + 1));
  projectDetails.append(button);
  return button;
});

function showProjectPhoto(index) {
  const total = project.photos.length;
  projectIndex = (index + total) % total;
  const photo = project.photos[projectIndex];
  projectImage.src = photo.src;
  projectImage.alt = photo.alt;
  projectCount.textContent = String(projectIndex + 1).padStart(2, "0") + " / " + String(total).padStart(2, "0");
  projectThumbnails.forEach((button, i) => button.setAttribute("aria-pressed", String(projectIndex === i + 1)));
}

projectGallery.querySelectorAll("[data-project-step]").forEach((button) => {
  button.addEventListener("click", () => showProjectPhoto(projectIndex + Number(button.dataset.projectStep)));
});
projectGallery.addEventListener("keydown", (event) => {
  if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
  event.preventDefault();
  showProjectPhoto(projectIndex + (event.key === "ArrowLeft" ? 1 : -1));
});

scenerySite.registerPreview("project", (title, content) => {
  const photo = project.photos[projectIndex];
  title.textContent = project.title;
  const image = new Image(photo.width, photo.height);
  image.src = photo.src;
  image.alt = photo.alt;
  content.append(scenerySite.paragraph("محتوى توضيحي من خارج أعمال المصنع.", "meta"), image, scenerySite.paragraph(project.description));
});

scenerySite.registerPreview("credits", (title, content) => {
  title.textContent = "مصادر الصور التوضيحية";
  const fallback = document.createElement("a");
  fallback.href = "https://unsplash.com/photos/modern-living-room-with-minimalist-furniture-and-decor-e0oJLc5FYsg";
  fallback.textContent = "مصدر صورة العرض البديلة عند تعذّر التحميل";
  content.append(scenerySite.paragraph("الصور من المرجع المرفق وأصول المعاينة الموجودة في المشروع. المنتجات والمشاريع أمثلة توضيحية."), fallback);
});
