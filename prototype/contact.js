"use strict";

const channels = document.querySelector("#contact-channels");
const settings = sceneryCatalog.contact ?? {};
const instagram = document.querySelector("[data-contact-channel='instagram']");
const whatsapp = sceneryCatalog.whatsappNumber;
const channelLinks = [
  instagram && ["Instagram", "حساب Scenery", instagram.href, "instagram"],
  settings.phone && ["الهاتف", settings.phone, "tel:" + settings.phone.replace(/\s/g, ""), "wa"],
  /^[1-9][0-9]{7,14}$/.test(whatsapp) && ["واتساب", "افتح المحادثة", "https://wa.me/" + whatsapp, "wa"],
  settings.email && ["البريد الإلكتروني", settings.email, "mailto:" + settings.email, "arrow"]
].filter(Boolean);

for (const [title, detail, href, symbol] of channelLinks) {
  const item = document.createElement("li");
  const link = document.createElement("a");
  link.href = href;
  if (link.protocol === "https:") {
    link.target = "_blank";
    link.rel = "noopener noreferrer";
  }
  const icon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  const use = document.createElementNS(icon.namespaceURI, "use");
  use.setAttribute("href", "#icon-" + symbol);
  icon.classList.add("icon");
  icon.setAttribute("aria-hidden", "true");
  icon.append(use);
  const copy = document.createElement("span");
  const name = document.createElement("strong");
  name.textContent = title;
  const sub = document.createElement("bdi");
  sub.textContent = detail;
  copy.append(name, sub);
  link.append(icon, copy);
  item.append(link);
  channels.append(item);
}
if (settings.address) {
  const address = document.createElement("li");
  address.textContent = settings.address;
  channels.append(address);
}
channels.hidden = !channels.children.length;

const form = document.querySelector("#contact-form");
const type = form.elements.type;
const reference = document.querySelector("#contact-reference");
const query = new URLSearchParams(location.search);
const productId = query.get("product");
const projectId = query.get("project");
const product = sceneryCatalog.products.find((item) => item.published !== false && (item.slug === productId || item.id === productId));
const project = sceneryContent.projects.find((item) => item.published !== false && item.id === projectId);
const allowedTypes = [...type.options].map((option) => option.value);
const requestedType = query.get("type");
const initialType = allowedTypes.includes(requestedType) ? requestedType : product ? "product" : project ? "project" : "general";
const conditional = [["custom", document.querySelector("#contact-custom")], ["export", document.querySelector("#contact-export")]];
const success = document.querySelector("#contact-success");
const summary = document.querySelector("#contact-errors");

function updateType() {
  for (const [value, group] of conditional) {
    group.hidden = value !== type.value;
    group.disabled = group.hidden;
  }
  const selected = type.value === "product" ? product : (type.value === "project" || type.value === "custom") ? project : null;
  reference.hidden = !selected;
  reference.textContent = selected ? (selected === product ? "المنتج: " : "المشروع: ") + selected.title : "";
}

const images = document.querySelector("#contact-images");
const imageList = document.querySelector("#contact-file-list");
const imageError = document.querySelector("#contact-files-error");
const imageStatus = document.querySelector("#contact-files-status");
const previews = [];
const allowedImages = new Map([["image/jpeg", "JPG"], ["image/png", "PNG"], ["image/webp", "WebP"]]);
const number = new Intl.NumberFormat("ar-EG", { maximumFractionDigits: 1 });

function reportImages() {
  imageStatus.textContent = "عدد الصور المختارة: " + number.format(previews.length);
}

function fileError(message) {
  imageError.textContent = message;
  imageError.hidden = !message;
}

function removePreview(entry) {
  previews.splice(previews.indexOf(entry), 1);
  URL.revokeObjectURL(entry.url);
  entry.row.remove();
  reportImages();
}

function addPreview(file) {
  const row = document.createElement("li");
  const entry = { file, url: URL.createObjectURL(file), row };
  const image = new Image();
  image.alt = "";
  image.addEventListener("error", () => {
    if (!previews.includes(entry)) return;
    removePreview(entry);
    fileError("تعذّرت معاينة الصورة: " + file.name);
  }, { once: true });
  const copy = document.createElement("span");
  const name = document.createElement("bdi");
  name.textContent = file.name;
  const size = file.size < 1024 * 1024 ? number.format(file.size / 1024) + " كيلوبايت" : number.format(file.size / 1024 ** 2) + " ميغابايت";
  copy.append(name, scenerySite.paragraph(allowedImages.get(file.type) + " · " + size));
  const remove = document.createElement("button");
  remove.type = "button";
  remove.className = "text-action";
  remove.textContent = "إزالة";
  remove.setAttribute("aria-label", "إزالة " + file.name);
  remove.addEventListener("click", () => {
    const next = row.nextElementSibling || row.previousElementSibling;
    removePreview(entry);
    (next?.querySelector("button") || images).focus();
  });
  previews.push(entry);
  row.append(image, copy, remove);
  imageList.append(row);
  image.src = entry.url;
}

images.addEventListener("change", () => {
  const rejected = new Set();
  for (const file of images.files) {
    if (!allowedImages.has(file.type)) rejected.add("اختر صور JPG أو PNG أو WebP فقط.");
    else if (!file.size || file.size > 5 * 1024 ** 2) rejected.add("اختر صورًا صالحة بحجم لا يتجاوز ٥ ميغابايت للصورة.");
    else if (previews.some(({ file: other }) => other.name === file.name && other.size === file.size && other.lastModified === file.lastModified)) continue;
    else if (previews.length >= 3) rejected.add("يمكن معاينة ٣ صور بحد أقصى.");
    else addPreview(file);
  }
  images.value = "";
  fileError([...rejected].join(" "));
  reportImages();
});

function setFieldError(name, message) {
  const field = form.elements[name];
  const error = document.querySelector("#contact-" + name + "-error");
  if (message) field.setAttribute("aria-invalid", "true");
  else field.removeAttribute("aria-invalid");
  error.textContent = message;
  error.hidden = !message;
}

const validated = ["name", "phone", "country", "email", "details"];
validated.forEach((name) => form.elements[name].addEventListener("input", () => setFieldError(name, "")));
type.addEventListener("change", updateType);
form.addEventListener("input", () => { success.hidden = true; summary.hidden = true; });
form.addEventListener("submit", (event) => {
  event.preventDefault();
  const fields = form.elements;
  const phone = scenerySite.normalizePhone(fields.phone.value).replace(/^00/, "+");
  const errors = {
    name: fields.name.value.trim() ? "" : "اكتب اسمك الكامل.",
    phone: /^\+[1-9][0-9]{6,14}$/.test(phone) ? "" : "اكتب الرقم الدولي مع رمز الدولة باستخدام + أو 00.",
    country: fields.country.value.trim() ? "" : "اكتب اسم الدولة.",
    email: fields.email.validity.typeMismatch ? "تحقّق من صيغة البريد الإلكتروني." : "",
    details: fields.details.value.trim() ? "" : "اكتب تفاصيل الاستفسار."
  };
  validated.forEach((name) => setFieldError(name, errors[name]));
  if (Object.values(errors).some(Boolean)) {
    summary.textContent = "راجع الحقول الموضّحة أدناه.";
    summary.hidden = false;
    summary.focus();
    return;
  }
  form.reset();
  while (previews.length) removePreview(previews[0]);
  fileError("");
  type.value = initialType;
  updateType();
  success.textContent = "تم اختبار النموذج بنجاح. هذه نسخة تجريبية، ولم يتم إرسال طلبك فعليًا.";
  success.hidden = false;
  success.focus();
});
type.value = initialType;
updateType();
form.hidden = false;
