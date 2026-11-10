"use strict";

const { products, categories } = sceneryCatalog;
const productBySlug = new Map(products.map((item) => [item.slug, item]));
const categoryBySlug = new Map(categories.map((item) => [item.slug, item]));
const featured = [...new Set([...sceneryContent.featuredProducts, ...products.map((item) => item.slug)])]
  .map((slug) => productBySlug.get(slug)).filter((item) => item && item.published !== false);
const featuredRail = document.querySelector(".featured-rail");
const featuredTabs = document.querySelector(".featured-tabs");
const featuredStatus = document.querySelector("#featured-status");
const tileTemplate = document.querySelector("#product-tile");
const productSteps = [...document.querySelectorAll("[data-product-step]")];
const featuredShowcase = featuredRail.closest(".featured-showcase");
const featuredRotation = document.querySelector("#featured-rotation");
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
const productFilters = [{ slug: "", title: "الكل" }, ...sceneryContent.featuredCategories.map((slug) => categoryBySlug.get(slug)).filter(Boolean)];
const featuredRotationDelay = 2000;
let featuredRotationTimer;
let featuredInView = false;
let featuredPaused = false;
let featuredHovered = false;
let featuredTouching = false;

function renderFeatured(category) {
  const matches = featured.filter((item) => !category || [item.category, item.subcategory, ...(item.extraCategories || [])].includes(category));
  const cards = matches.map((item) => {
    const card = tileTemplate.content.firstElementChild.cloneNode(true);
    card.querySelector("a").href = "products/" + item.slug + "/";
    const image = card.querySelector("img");
    image.src = item.media?.[0]?.small || item.media?.[0]?.poster || item.media?.[0]?.src || "assets/catalog/placeholder.svg";
    card.querySelector("h3").textContent = item.title;
    card.querySelector(".featured-category").textContent = categoryBySlug.get(item.category)?.title || "";
    card.querySelector(".featured-description").textContent = item.description;
    const price = card.querySelector(".featured-price");
    price.hidden = item.price.mode === "hidden";
    if (item.price.mode === "quote") price.textContent = "السعر عند الطلب";
    if (item.price.mode === "visible") {
      const amount = document.createElement("bdi");
      amount.textContent = new Intl.NumberFormat("ar-EG", { style: "currency", currency: item.price.currency, maximumFractionDigits: 0 }).format(item.price.amount);
      price.append(amount);
    }
    return card;
  });
  featuredRail.replaceChildren(...cards);
  featuredRail.scrollTo({ left: 0, behavior: "instant" });
  featuredRail.hidden = !cards.length;
  document.querySelector(".featured-empty").hidden = Boolean(cards.length);
  featuredTabs.querySelectorAll("button").forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.category === category)));
  featuredStatus.textContent = matches.length ? "عدد القطع المعروضة " + matches.length : "لا توجد منتجات في هذا التصنيف";
  updateProductSteps();
  refreshFeaturedRotation();
  scenerySite.refreshClearance();
}

function updateProductSteps() {
  const available = featuredRail.scrollWidth - featuredRail.clientWidth;
  productSteps[0].parentElement.hidden = available <= 2;
  productSteps[0].setAttribute("aria-disabled", String(featuredRail.scrollLeft >= -2));
  productSteps[1].setAttribute("aria-disabled", String(-featuredRail.scrollLeft >= available - 2));
}

function moveProducts(direction) {
  const card = featuredRail.firstElementChild;
  if (!card) return;
  const width = card.getBoundingClientRect().width + parseFloat(getComputedStyle(featuredRail).columnGap);
  featuredRail.scrollBy({ left: -direction * width });
}

function scheduleFeaturedRotation() {
  clearTimeout(featuredRotationTimer);
  const focus = document.activeElement;
  const browsingWithKeyboard = focus !== featuredRotation &&
    featuredShowcase.contains(focus) && focus.matches(":focus-visible");
  if (featuredRotation.hidden || featuredPaused || !featuredInView || document.hidden ||
    featuredHovered || featuredTouching || browsingWithKeyboard || featuredRail.contains(focus)) return;

  featuredRotationTimer = setTimeout(() => {
    if (!document.querySelector("dialog[open]")) {
      if (productSteps[1].getAttribute("aria-disabled") === "true") {
        featuredRail.scrollTo({ left: 0, behavior: "instant" });
      } else {
        moveProducts(1);
      }
    }
    scheduleFeaturedRotation();
  }, featuredRotationDelay);
}

function refreshFeaturedRotation() {
  featuredRotation.hidden = reducedMotion.matches || productSteps[0].parentElement.hidden;
  scheduleFeaturedRotation();
}

featuredRotation.addEventListener("click", () => {
  featuredPaused = !featuredPaused;
  const label = featuredPaused ? "استئناف التقليب التلقائي للمنتجات" : "إيقاف التقليب التلقائي للمنتجات";
  featuredRotation.setAttribute("aria-label", label);
  featuredRotation.title = label;
  featuredRotation.querySelector("path").setAttribute("d", featuredPaused ? "m9 5 11 7-11 7Z" : "M9 5v14m6-14v14");
  scheduleFeaturedRotation();
});

function updateFeaturedHover(event) {
  if (event.pointerType !== "mouse") return;
  featuredHovered = event.type === "pointerenter";
  scheduleFeaturedRotation();
}

function updateFeaturedTouch(event) {
  featuredTouching = event.touches.length > 0;
  scheduleFeaturedRotation();
}

featuredRail.addEventListener("pointerenter", updateFeaturedHover);
featuredRail.addEventListener("pointerleave", updateFeaturedHover);
["touchstart", "touchend", "touchcancel"].forEach((type) => {
  featuredRail.addEventListener(type, updateFeaturedTouch, { passive: true });
});
featuredRail.addEventListener("wheel", scheduleFeaturedRotation, { passive: true });
featuredShowcase.addEventListener("focusin", scheduleFeaturedRotation);
featuredShowcase.addEventListener("focusout", () => queueMicrotask(scheduleFeaturedRotation));
document.addEventListener("visibilitychange", scheduleFeaturedRotation);
reducedMotion.addEventListener("change", refreshFeaturedRotation);
new IntersectionObserver(([entry]) => {
  featuredInView = entry.intersectionRatio >= 0.2;
  scheduleFeaturedRotation();
}, { threshold: 0.2 }).observe(featuredRail);

productFilters.forEach(({slug, title}) => {
  const button = document.createElement("button");
  button.type = "button";
  button.dataset.category = slug;
  button.textContent = title;
  button.addEventListener("click", () => renderFeatured(slug));
  featuredTabs.append(button);
});
productSteps.forEach((button) => button.addEventListener("click", () => {
  if (button.getAttribute("aria-disabled") !== "true") moveProducts(Number(button.dataset.productStep));
}));
featuredRail.addEventListener("scroll", updateProductSteps, { passive: true });
featuredRail.addEventListener("keydown", (event) => {
  if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
  event.preventDefault();
  moveProducts(event.key === "ArrowLeft" ? 1 : -1);
});
new ResizeObserver(() => {
  updateProductSteps();
  refreshFeaturedRotation();
}).observe(featuredRail);
renderFeatured("");

const hero = document.querySelector(".hero");
const heroImage = document.querySelector("#hero-image");
const heroTitle = document.querySelector("#hero-title");
const heroDescription = document.querySelector("#hero-description");
const heroPrimary = document.querySelector("#hero-primary");
const heroCount = document.querySelector("#hero-count");
const heroStatus = document.querySelector("#hero-status");
const heroIndicators = [...hero.querySelectorAll("[data-hero-index]")];
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

const projects = sceneryContent.projects.filter((item) => item.homepage !== false && item.photos?.length);
const projectGallery = document.querySelector(".project-gallery");
const projectImage = document.querySelector("#project-image");
const projectCount = document.querySelector("#project-count");
const projectDetails = document.querySelector(".project-details");
const projectDots = document.querySelector(".project-dots");
const projectButton = document.querySelector(".project-image-trigger");
const projectSteps = [...document.querySelectorAll("[data-project-step]")];
let projectIndex = 0;
let projectPhotoIndex = 0;

function usePhoto(image, photo) {
  image.src = photo.src;
  image.alt = photo.alt;
  image.style.objectPosition = photo.position || "";
  image.style.transformOrigin = photo.position || "";
  image.style.scale = photo.zoom || "";
}

function showProjectPhoto(index) {
  const photo = projects[projectIndex].photos[index];
  if (!photo) return;
  projectPhotoIndex = index;
  usePhoto(projectImage, photo);
  projectDetails.querySelectorAll("button").forEach((button, i) => button.setAttribute("aria-pressed", String(index === i + 1)));
}

const projectIndicators = projects.map((project, index) => {
  const button = document.createElement("button");
  button.type = "button";
  button.setAttribute("aria-label", project.title);
  button.addEventListener("click", () => showProject(index));
  projectDots.append(button);
  return button;
});

function showProject(index) {
  if (!projects.length) return;
  projectIndex = (index + projects.length) % projects.length;
  const project = projects[projectIndex];
  document.querySelector("#project-name").textContent = project.title;
  document.querySelector("#project-description").textContent = project.summary;
  document.querySelector("#project-types").textContent = (project.types || []).join(" · ");
  const location = document.querySelector("#project-location");
  location.textContent = project.location || "";
  location.hidden = !project.location;
  projectButton.setAttribute("aria-label", "معاينة " + project.title);
  projectCount.textContent = String(projectIndex + 1).padStart(2, "0") + " / " + String(projects.length).padStart(2, "0");
  projectIndicators.forEach((button, i) => {
    if (i === projectIndex) button.setAttribute("aria-current", "true");
    else button.removeAttribute("aria-current");
  });
  projectDetails.replaceChildren(...project.photos.slice(1).map((photo, i) => {
    const button = document.createElement("button");
    button.type = "button";
    button.setAttribute("aria-label", "عرض " + photo.alt);
    const image = new Image();
    image.loading = "lazy";
    image.decoding = "async";
    usePhoto(image, photo);
    image.alt = "";
    button.append(image);
    button.addEventListener("click", () => showProjectPhoto(i + 1));
    return button;
  }));
  projectDetails.hidden = project.photos.length < 2;
  showProjectPhoto(0);
  document.querySelector("#project-status").textContent = "المشروع " + (projectIndex + 1) + " من " + projects.length + " · " + project.title;
  if (!reducedMotion.matches) {
    projectImage.getAnimations().forEach((animation) => animation.cancel());
    projectImage.animate([{ opacity: .6 }, { opacity: 1 }], { duration: 200, easing: "ease-out" });
  }
  scenerySite.refreshClearance();
}

projectGallery.hidden = !projects.length;
projectDots.hidden = projects.length < 2;
document.querySelector(".project-empty").hidden = Boolean(projects.length);
document.querySelector('[data-open="project-list"]').hidden = !projects.length;
projectSteps.forEach((button) => {
  button.hidden = projects.length < 2;
  button.addEventListener("click", () => showProject(projectIndex + Number(button.dataset.projectStep)));
});
projectGallery.addEventListener("keydown", (event) => {
  if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
  if (projectDetails.contains(event.target)) {
    event.preventDefault();
    const buttons = [...projectDetails.querySelectorAll("button")];
    const next = buttons.indexOf(event.target) + (event.key === "ArrowLeft" ? 1 : -1);
    if (buttons[next]) {
      buttons[next].focus();
      showProjectPhoto(next + 1);
    }
    return;
  }
  if (projects.length < 2) return;
  event.preventDefault();
  showProject(projectIndex + (event.key === "ArrowLeft" ? 1 : -1));
});

let projectSwipe;
let ignoreProjectClick = false;
projectButton.addEventListener("pointerdown", (event) => {
  ignoreProjectClick = false;
  if (event.pointerType === "touch" && event.isPrimary) projectSwipe = [event.clientX, event.clientY];
});
projectButton.addEventListener("pointercancel", () => { projectSwipe = undefined; });
projectButton.addEventListener("pointerup", (event) => {
  if (!projectSwipe) return;
  const [x, y] = projectSwipe;
  projectSwipe = undefined;
  const dx = event.clientX - x;
  if (projects.length > 1 && Math.abs(dx) > 45 && Math.abs(dx) > 1.35 * Math.abs(event.clientY - y)) {
    ignoreProjectClick = true;
    showProject(projectIndex + (dx < 0 ? 1 : -1));
  }
});
projectButton.addEventListener("click", (event) => {
  if (ignoreProjectClick && event.detail) event.stopPropagation();
  ignoreProjectClick = false;
});

const previewDialog = document.querySelector("#preview-dialog");
scenerySite.registerPreview("project", (title, content) => {
  const project = projects[projectIndex];
  const photo = project.photos[projectPhotoIndex];
  title.textContent = project.title;
  const image = new Image();
  image.src = photo.src;
  image.alt = photo.alt;
  content.append(scenerySite.paragraph("محتوى توضيحي للمعاينة.", "meta"), image, scenerySite.paragraph(project.description));
  const detailLink = document.createElement("a");
  detailLink.className = "text-action";
  detailLink.href = projectDetailUrl(project.id);
  detailLink.textContent = "عرض تفاصيل المشروع";
  content.append(detailLink);
  if (project.video) {
    const video = document.createElement("video");
    video.src = project.video;
    video.preload = "none";
    video.controls = true;
    video.playsInline = true;
    video.setAttribute("aria-label", "فيديو " + project.title);
    content.append(video);
  }
});
previewDialog.addEventListener("close", () => previewDialog.querySelector("video")?.pause());
scenerySite.registerPreview("project-list", (title, content) => {
  title.textContent = "المشاريع التوضيحية";
  const list = document.createElement("ul");
  list.className = "project-preview-list";
  projects.forEach((project, index) => {
    const item = document.createElement("li");
    const button = document.createElement("button");
    button.type = "button";
    button.className = "button button-outline";
    button.textContent = project.title;
    button.addEventListener("click", () => {
      showProject(index);
      previewDialog.close();
      requestAnimationFrame(() => projectButton.focus());
    });
    item.append(button);
    list.append(item);
  });
  content.append(list);
  const portfolioLink = document.createElement("a");
  portfolioLink.className = "text-action";
  portfolioLink.href = "projects/index.html";
  portfolioLink.textContent = "افتح صفحة مشاريعنا";
  content.append(portfolioLink);
});

document.addEventListener("error", (event) => {
  const image = event.target;
  if (image instanceof HTMLImageElement && image.closest(".featured-rail, .project-gallery, #preview-content") &&
      !image.src.endsWith("/placeholder.svg")) {
    image.src = "assets/catalog/placeholder.svg";
    image.style.scale = "";
  }
}, true);
showProject(0);

scenerySite.registerPreview("credits", (title, content) => {
  title.textContent = "مصادر الصور التوضيحية";
  const fallback = document.createElement("a");
  fallback.href = "https://unsplash.com/photos/modern-living-room-with-minimalist-furniture-and-decor-e0oJLc5FYsg";
  fallback.textContent = "مصدر صورة العرض البديلة عند تعذّر التحميل";
  content.append(scenerySite.paragraph("الصور من المرجع المرفق وأصول المعاينة الموجودة في المشروع. المنتجات والمشاريع أمثلة توضيحية."), fallback);
});
