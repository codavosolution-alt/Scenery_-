"use strict";

// Shared demo content for the homepage and the projects portfolio.
function projectDetailUrl(id, root = "") {
  return root + "projects/details/index.html?project=" + encodeURIComponent(id);
}

function projectMedia(project) {
  if (project.media?.length) return project.media;
  const photos = project.photos?.length ? project.photos : (project.cover ? [project.cover] : []);
  if (!project.video) return photos;
  return [...photos, {
    type: "video",
    src: project.video.src ?? project.video,
    poster: project.video.poster ?? photos[0]?.src,
    title: project.video.title ?? "فيديو المشروع"
  }];
}

const sceneryContent = {
  slides: [
    {
      title: ["أثاث فاخر", "وحلول خشبية متكاملة"],
      description: "تصميمات تجمع بين جمال الخشب الطبيعي ودقة التنفيذ، لتمنح مساحتك طابعًا عصريًا أنيقًا.",
      image: "assets/reference/hero-living.webp",
      alt: "غرفة معيشة بأريكة فاتحة وطاولة مستديرة وخشب داكن",
      link: "products/",
      action: "استكشف منتجاتنا"
    },
    {
      title: ["مطابخ وخزائن", "بتفاصيل مدروسة"],
      description: "استكشف مثالًا لتكامل واجهات الخشب والتخزين مع الأسطح الحجرية داخل المساحة.",
      image: "assets/reference/kitchen.webp",
      alt: "خزائن خشبية داكنة وجزيرة حجرية في مطبخ توضيحي",
      link: "#projects",
      action: "شاهد المشاريع"
    },
    {
      title: ["تصميم مخصص", "لمساحتك"],
      description: "ابدأ بفكرة ومقاسات تقريبية، وناقش معنا الخامات والتفاصيل المناسبة للقطعة.",
      image: "assets/reference/woodwork.webp",
      alt: "واجهة خشبية ذات شرائح رأسية يصل إليها ضوء الشمس",
      link: "contact/index.html?type=custom#inquiry",
      action: "استكشف التصنيع الخاص"
    }
  ],
  featuredCategories: ["bedrooms", "living", "dining", "kitchens"],
  featuredProducts: ["floating-nightstand", "oak-bed", "green-sofa", "walnut-dining-table"],
  aboutProjects: ["villa-demo", "wood-kitchen"],
  projectTypes: [
    { id: "furniture", title: "أثاث ومفروشات", icon: "armchair", image: "assets/reference/hero-living.webp" },
    { id: "kitchens", title: "مطابخ", icon: "kitchen", image: "assets/reference/kitchen.webp" },
    { id: "storage", title: "الخزائن وغرف الملابس", icon: "cabinet", image: "assets/reference/storage.webp" },
    { id: "woodwork", title: "الديكورات الخشبية", icon: "wood", image: "assets/reference/woodwork.webp" }
  ],
  projects: [
    {
      id: "living-room",
      typeIds: ["furniture", "woodwork"],
      scope: "غرفة معيشة · جلسة · طاولات",
      order: 1,
      featured: true,
      title: "أثاث وديكورات غرفة معيشة",
      summary: "معاينة لتنسيق أثاث المعيشة والأعمال الخشبية في مساحة سكنية، من توزيع الجلسة إلى تفاصيل الطاولات.",
      description: "يعرض هذا المثال توزيع الأثاث داخل غرفة معيشة سكنية. تبرز اللقطات التوضيحية الجلسة والطاولة والخامات المحيطة.",
      types: ["أثاث معيشة", "ديكورات خشبية"],
      works: [
        { title: "أثاث غرفة المعيشة", icon: "armchair" },
        { title: "طاولات الجلسة", icon: "wood" },
        { title: "تنسيق التفاصيل الخشبية", icon: "cabinet" }
      ],
      features: [
        { title: "توزيع الجلسة", detail: "أثاث موزّع حول الطاولة", icon: "armchair" },
        { title: "تباين الخامات", detail: "نسيج فاتح وتفاصيل داكنة", icon: "wood" },
        { title: "تفاصيل الطاولات", detail: "طاولات متداخلة في الوسط", icon: "cabinet" }
      ],
      detailPhoto: 2,
      materials: [
        { title: "أقمشة التنجيد", detail: "درجات محايدة للجلسة", photo: 1 },
        { title: "أسطح الطاولات", detail: "تشطيب داكن", photo: 2 }
      ],
      related: ["wood-kitchen", "oak-bedroom"],
      photos: [
        { src: "assets/images/hero-1500.webp", alt: "غرفة معيشة توضيحية بجلسة فاتحة وطاولات خشبية" },
        { src: "assets/images/hero-1500.webp", alt: "قص توضيحي للجلسة داخل غرفة المعيشة نفسها", position: "22% 65%", zoom: 1.7 },
        { src: "assets/images/hero-1500.webp", alt: "قص توضيحي للطاولات داخل غرفة المعيشة نفسها", position: "65% 74%", zoom: 1.9 },
        { src: "assets/images/hero-1500.webp", alt: "قص توضيحي لجانب غرفة المعيشة نفسها", position: "88% 48%", zoom: 1.7 }
      ]
    },
    {
      id: "wood-kitchen",
      typeIds: ["kitchens", "storage", "woodwork"],
      scope: "خزائن · جزيرة · واجهات خشبية",
      order: 2,
      title: "مطبخ بواجهات خشبية",
      summary: "تكوين توضيحي لخزائن مطبخ وواجهات خشبية منسّقة مع سطح حجري.",
      description: "يركّز المثال على الخزائن والواجهات الخشبية وتفاصيل اتصالها بالسطح الحجري حول الجزيرة.",
      types: ["مطابخ", "خزائن"],
      works: [
        { title: "خزائن مطبخ", icon: "cabinet" },
        { title: "جزيرة بسطح حجري", icon: "kitchen" },
        { title: "واجهات خشبية", icon: "wood" }
      ],
      features: [
        { title: "تخزين مدمج", detail: "خزائن بطول الجدار", icon: "cabinet" },
        { title: "تناغم الخامات", detail: "خشب داكن وسطح حجري", icon: "wood" },
        { title: "جزيرة وسطية", detail: "مساحة للتحضير والجلوس", icon: "kitchen" }
      ],
      detailPhoto: 2,
      materials: [
        { title: "سطح حجري", detail: "سطح الجزيرة", photo: 1 },
        { title: "شرائح خشبية", detail: "تفاصيل الواجهات", photo: 2 },
        { title: "تشطيب الخزائن", detail: "تفاصيل الحواف", photo: 3 }
      ],
      photos: [
        { src: "assets/reference/kitchen.webp", alt: "مطبخ توضيحي بخزائن داكنة وجزيرة حجرية" },
        { src: "assets/reference/detail-stone.webp", alt: "سطح الجزيرة الحجري" },
        { src: "assets/reference/detail-slats.webp", alt: "تفصيل الشرائح الخشبية الرأسية" },
        { src: "assets/reference/detail-cabinet.webp", alt: "حافة خزانة خشبية" }
      ]
    },
    {
      id: "wood-wall",
      typeIds: ["woodwork"],
      scope: "كسوة جدار · شرائح خشبية",
      order: 6,
      title: "كسوة خشبية داخلية",
      summary: "معاينة لطريقة توظيف الشرائح الخشبية في جدار داخلي وتفاعلها مع الضوء.",
      description: "يوضح المثال توزيع الشرائح الخشبية على جدار داخلي، واختلاف مظهر الخامة عند مرور الضوء.",
      types: ["أعمال خشبية", "ديكورات داخلية"],
      detailPhoto: 1,
      materials: [{ title: "شرائح خشبية", detail: "كسوة الجدار التوضيحية", photo: 2 }],
      photos: [
        { src: "assets/reference/woodwork.webp", alt: "شرائح خشبية في جدار داخلي توضيحي" },
        { src: "assets/reference/woodwork.webp", alt: "قص توضيحي للشرائح بجوار الضوء", position: "25% 50%", zoom: 1.6 },
        { src: "assets/reference/woodwork.webp", alt: "قص توضيحي لتفاصيل الجدار نفسه", position: "72% 50%", zoom: 1.65 }
      ]
    },
    {
      id: "oak-bedroom",
      homepage: false,
      order: 3,
      title: "غرفة نوم بتفاصيل خشبية",
      summary: "مثال على تنسيق سرير خشبي ووحدة جانبية داخل غرفة نوم.",
      description: "يستعرض هذا النموذج التجريبي العلاقة بين إطار السرير والوحدة الجانبية. تبرز الصورة حافة الإطار الخشبي إلى جوار التنجيد الفاتح، مع ترك مساحة جانبية للإضاءة والاستخدام اليومي.",
      scope: "إطار سرير · وحدة جانبية",
      types: ["سرير خشبي", "وحدة جانبية"],
      typeIds: ["furniture", "woodwork"],
      works: [
        { title: "إطار السرير الخشبي", icon: "wood" },
        { title: "الوحدة الجانبية", icon: "cabinet" }
      ],
      features: [
        { title: "تجاور الخشب والنسيج", detail: "إطار خشبي بجوار مفروشات فاتحة", icon: "wood" }
      ],
      photos: [{ src: "assets/catalog/bedroom-oak.webp", alt: "سرير بإطار بلوط ووحدة جانبية" }]
    },
    {
      id: "family-dining",
      homepage: false,
      order: 4,
      title: "سفرة عائلية بتصميم متكامل",
      summary: "تكوين توضيحي لطاولة خشبية ومقاعد متناسقة حولها.",
      types: ["طاولة سفرة", "مقاعد خشبية"],
      typeIds: ["furniture"],
      photos: [{ src: "assets/reference/dining.webp", alt: "طاولة سفرة خشبية مستطيلة ومقاعد حولها" }]
    },
    {
      id: "living-storage",
      homepage: false,
      order: 5,
      title: "وحدات تخزين بواجهات خشبية",
      summary: "مثال لوحدة تخزين منخفضة بواجهات خشبية داخل غرفة معيشة.",
      description: "يوضّح هذا المثال التجريبي كيف يمكن لوحدة منخفضة أن تجمع التخزين المغلق وسطح العرض في قطعة واحدة. تُظهر الصورة تتابع الواجهات الخشبية على امتداد الوحدة، مع سطح علوي متصل يترك مساحة للأغراض المعروضة.",
      types: ["وحدة تخزين", "واجهات خشبية"],
      typeIds: ["storage", "woodwork"],
      features: [
        { title: "تخزين مغلق", detail: "واجهات متجاورة في وحدة واحدة", icon: "cabinet" },
        { title: "سطح للعرض", detail: "مساحة ممتدة أعلى الوحدة", icon: "wood" }
      ],
      materials: [{ title: "واجهة بتشطيب خشبي", detail: "وصف بصري للعينة التجريبية" }],
      photos: [{ src: "assets/reference/storage.webp", alt: "وحدة تخزين منخفضة بواجهات خشبية" }]
    },
    {
      id: "villa-demo",
      homepage: false,
      demo: true,
      order: 0,
      title: "فيلا سكنية متكاملة — نموذج تجريبي",
      summary: "نموذج توضيحي لعرض أعمال الأثاث والمطابخ والخزائن والديكورات الخشبية داخل فيلا سكنية، لإبراز إمكانيات Scenery في تقديم المشاريع وعرض تفاصيلها.",
      description: "جولة افتراضية تجمع صورًا تجريبية لست مساحات سكنية. توضّح الأمثلة طرق عرض الأثاث ووحدات التخزين والكسوات الخشبية ضمن ملف مشروع واحد. الصور ومقطع العرض التوضيحي لا توثّق فيلا حقيقية أو أعمالًا منفذة للمصنع.",
      scope: "أثاث المعيشة والسفرة والنوم · المطابخ والخزائن · الكسوات والديكورات الخشبية",
      types: ["أثاث ومفروشات", "مطابخ", "خزائن", "ديكورات خشبية"],
      typeIds: ["furniture", "kitchens", "storage", "woodwork"],
      cover: { src: "assets/reference/hero-living.webp", alt: "معيشة توضيحية بأريكة فاتحة وطاولة خشبية مستديرة" },
      works: [
        { title: "أثاث المعيشة والسفرة", icon: "armchair" },
        { title: "أثاث غرف النوم والوحدات الجانبية", icon: "wood" },
        { title: "مطابخ وخزائن مخصصة", icon: "kitchen" },
        { title: "وحدات التخزين وغرف الملابس", icon: "cabinet" },
        { title: "كسوات وفواصل خشبية", icon: "wood" }
      ],
      features: [
        { title: "توزيع الأثاث", detail: "تكوينات لكل مساحة", icon: "armchair" },
        { title: "تخزين مدمج", detail: "واجهات وأرفف ووحدات", icon: "cabinet" },
        { title: "تفاصيل خشبية", detail: "كسوات وفواصل داخلية", icon: "wood" }
      ],
      detailPhoto: 6,
      materials: [
        { title: "مفروشات فاتحة", detail: "عينة بصرية من غرفة المعيشة", photo: 0 },
        { title: "سطح حجري", detail: "عينة بصرية من المطبخ", photo: 3 },
        { title: "شرائح خشبية", detail: "عينة بصرية من الكسوة", photo: 6 }
      ],
      related: ["living-room", "wood-kitchen", "oak-bedroom"],
      media: [
        { id: "living", type: "image", src: "assets/reference/hero-living.webp", alt: "معيشة توضيحية بأريكة فاتحة وطاولة خشبية مستديرة" },
        { id: "tour", type: "video", src: "assets/projects/villa-tour.mp4", poster: "assets/reference/hero-living.webp", title: "جولة داخل الفيلا التجريبية", description: "عرض مُنشأ من صور النموذج التجريبية، مع صوت خلفي هادئ ودون تعليق صوتي." },
        { id: "dining", type: "image", src: "assets/reference/dining.webp", alt: "طاولة سفرة خشبية ومقاعد في غرفة طعام توضيحية" },
        { id: "bedroom", type: "image", src: "assets/catalog/bedroom-oak.webp", alt: "سرير بإطار خشبي ووحدة جانبية في غرفة نوم توضيحية" },
        { id: "kitchen", type: "image", src: "assets/reference/kitchen.webp", alt: "مطبخ توضيحي بخزائن داكنة وجزيرة حجرية" },
        { id: "storage", type: "image", src: "assets/reference/storage.webp", alt: "نموذج واجهات ووحدات تخزين خشبية" },
        { id: "dressing-detail", type: "image", src: "assets/reference/detail-cabinet.webp", alt: "تفصيل رف وحافة خزانة خشبية توضيحية" },
        { id: "woodwork", type: "image", src: "assets/reference/woodwork.webp", alt: "كسوة جدار بشرائح خشبية في ضوء الشمس" }
      ],
      spaces: [
        { title: "غرفة المعيشة", mediaId: "living", works: ["أثاث الجلسة", "وحدات التلفزيون", "كسوات خشبية", "وحدات تخزين"] },
        { title: "غرفة السفرة", mediaId: "dining", works: ["طاولة سفرة", "كراسي", "بوفيه", "تفاصيل خشبية"] },
        { title: "غرف النوم", mediaId: "bedroom", works: ["أسِرّة", "خزائن", "وحدات جانبية", "أثاث مخصص"] },
        { title: "المطبخ", mediaId: "kitchen", works: ["وحدات مطبخ", "خزائن", "أسطح عمل", "واجهات خشبية"] },
        { title: "غرفة الملابس", mediaId: "dressing-detail", works: ["خزائن مخصصة", "وحدات تخزين", "تفاصيل الأرفف"] },
        { title: "الأعمال الخشبية والديكورات", mediaId: "woodwork", works: ["كسوات الجدران", "فواصل خشبية", "ديكورات", "تخزين مدمج"] }
      ]
    }
  ],
  reviews: [
    "«مثال لطريقة عرض رأي العميل عن الخامة والتفاصيل.»",
    "«مثال لطريقة عرض ملاحظة العميل عن ملاءمة المقاس.»",
    "«مثال لطريقة عرض تعليق العميل على تصميم القطعة.»"
  ]
};
