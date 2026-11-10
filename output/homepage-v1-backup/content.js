"use strict";

// Data kept separate from the homepage templates for a future data source.
const sceneryContent = {
  slides: [
    {
      title: ["أثاث وأعمال خشبية", "لمساحاتك"],
      description: "تصاميم وتنفيذ مخصص للأثاث، المطابخ، الخزائن والديكورات الخشبية بتفاصيل متقنة.",
      image: "assets/reference/hero-living.webp",
      alt: "غرفة معيشة بأريكة فاتحة وطاولة مستديرة وخشب داكن",
      link: "products/",
      action: "استكشف مجموعتنا"
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
      link: "#custom",
      action: "استكشف التصنيع الخاص"
    }
  ],
  products: [
    {
      id: "dining", productSlug: "walnut-dining-table", title: "طاولات سفرة خشبية", image: "assets/reference/dining.webp", width: 324, height: 160,
      alt: "طاولة سفرة خشبية داكنة وقاعدة مضلعة مع كراسٍ فاتحة",
      description: "مثال لطاولة سفرة بسطح خشبي وقاعدة مضلّعة، مع مقاعد فاتحة حولها."
    },
    {
      id: "sideboard", productSlug: "woven-sideboard", anchor: "storage", title: "وحدات تخزين عصرية", image: "assets/reference/storage.webp", width: 275, height: 63,
      alt: "وحدة تخزين خشبية منخفضة بواجهات منسوجة ورفوف مفتوحة",
      description: "وحدة تخزين منخفضة تجمع رفوفًا مفتوحة وواجهات منسوجة."
    },
    {
      id: "sofa", productSlug: "green-sofa", title: "أرائك وكنب", image: "assets/reference/sofa.webp", width: 275, height: 61,
      alt: "أريكة خضراء داكنة بوسائد متناسقة أمام جدار فاتح",
      description: "مثال لأريكة خضراء داكنة ضمن مجموعة أثاث غرفة المعيشة."
    }
  ],
  project: {
    id: "project", title: "مطبخ بواجهات خشبية", image: "assets/reference/kitchen.webp", width: 502, height: 202,
    alt: "مطبخ توضيحي بخزائن خشبية داكنة وجزيرة حجرية وثلاثة مقاعد",
    description: "المثال يركز على الخزائن والواجهات والأجزاء الخشبية المحيطة بالجزيرة، ويشرح طريقة عرض نطاق الأعمال بعد اعتماد المحتوى الحقيقي."
  },
  reviews: [
    "«مثال لطريقة عرض رأي العميل عن الخامة والتفاصيل.»",
    "«مثال لطريقة عرض ملاحظة العميل عن ملاءمة المقاس.»",
    "«مثال لطريقة عرض تعليق العميل على تصميم القطعة.»"
  ]
};
