"use strict";

const mosaic = document.querySelector(".mosaic");
const tileTemplate = document.querySelector("#product-tile");
for (const item of sceneryContent.products) {
  const tile = tileTemplate.content.firstElementChild.cloneNode(true);
  tile.href = "products/" + item.productSlug + "/";
  if (item.anchor) tile.id = item.anchor;
  tile.setAttribute("aria-label", "تفاصيل " + item.title);
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
  heroTitle.replaceChildren(slide.title[0], document.createElement("br"), slide.title[1]);
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

scenerySite.registerPreview("project", (title, content) => {
  const project = sceneryContent.project;
  title.textContent = project.title;
  const image = new Image(project.width, project.height);
  image.src = project.image;
  image.alt = project.alt;
  content.append(scenerySite.paragraph("محتوى توضيحي من خارج أعمال المصنع.", "meta"), image, scenerySite.paragraph(project.description));
});

scenerySite.registerPreview("credits", (title, content) => {
  title.textContent = "مصادر الصور التوضيحية";
  const fallback = document.createElement("a");
  fallback.href = "https://unsplash.com/photos/modern-living-room-with-minimalist-furniture-and-decor-e0oJLc5FYsg";
  fallback.textContent = "مصدر صورة العرض البديلة عند تعذّر التحميل";
  content.append(scenerySite.paragraph("الصور المعروضة قصاصات مستقلة من المرجع المرفق للمعاينة فقط. المنتجات والمشاريع ليست أعمالًا منسوبة إلى المصنع."), fallback);
});
