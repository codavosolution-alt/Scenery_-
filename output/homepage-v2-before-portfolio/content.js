"use strict";

// Data kept separate from the homepage templates for a future data source.
const sceneryContent = {
  slides: [
    {
      title: ["أثاث صُنع ليشبهك"],
      description: "تصاميم تجمع بين أصالة الخشب وأناقة التفاصيل، صُنعت لتمنح مساحتك طابعًا خاصًا.",
      image: "assets/reference/hero-living.webp",
      alt: "غرفة معيشة بأريكة فاتحة وطاولة مستديرة وخشب داكن",
      link: "products/",
      action: "اكتشف مجموعتنا"
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
  collections: [
    { category: "dining", product: "walnut-dining-table", title: "سفر الطعام", image: "assets/reference/dining.webp", width: 324, height: 160 },
    { category: "bedrooms", product: "linen-bed", title: "غرف النوم", image: "assets/catalog/bedroom-linen.webp", width: 1200, height: 900 },
    { category: "living", product: "green-sofa", title: "غرف المعيشة", image: "assets/reference/sofa.webp", width: 275, height: 61 }
  ],
  project: {
    title: "مشروع مطبخ متكامل",
    summary: "مثال توضيحي لخزائن المطبخ والواجهات الخشبية، وتكاملها مع السطح الحجري.",
    description: "المثال يركز على الخزائن والواجهات والأجزاء الخشبية المحيطة بالجزيرة، ويشرح طريقة عرض نطاق الأعمال بعد اعتماد المحتوى الحقيقي.",
    photos: [
      { src: "assets/reference/kitchen.webp", width: 502, height: 202, alt: "مطبخ توضيحي بخزائن داكنة وجزيرة حجرية" },
      { src: "assets/reference/detail-stone.webp", width: 107, height: 77, alt: "سطح الجزيرة الحجري" },
      { src: "assets/reference/detail-slats.webp", width: 106, height: 77, alt: "تفصيل الشرائح الخشبية الرأسية" },
      { src: "assets/reference/detail-cabinet.webp", width: 109, height: 77, alt: "حافة خزانة خشبية" }
    ]
  },
  reviews: [
    "«مثال لطريقة عرض رأي العميل عن الخامة والتفاصيل.»",
    "«مثال لطريقة عرض ملاحظة العميل عن ملاءمة المقاس.»",
    "«مثال لطريقة عرض تعليق العميل على تصميم القطعة.»"
  ]
};
