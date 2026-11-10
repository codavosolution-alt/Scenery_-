"use strict";

const selected = document.querySelector("#about-selected");
for (const id of sceneryContent.aboutProjects) {
  const project = sceneryContent.projects.find((item) => item.id === id && item.published !== false);
  if (!project) continue;
  const photo = project.cover ?? projectMedia(project).find((item) => item.type !== "video");
  const link = document.createElement("a");
  link.href = projectDetailUrl(project.id, "../");
  const image = new Image();
  image.src = "../" + (photo?.src ?? "assets/catalog/placeholder.svg");
  image.alt = "";
  image.loading = "lazy";
  image.decoding = "async";
  const title = document.createElement("h3");
  title.textContent = project.title;
  link.append(image, title, scenerySite.paragraph(project.types.join(" · ")));
  selected.append(link);
}
