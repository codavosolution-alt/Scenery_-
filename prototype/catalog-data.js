"use strict";

const sceneryCatalog = (() => {
  const photo = (file, alt, small = file) => ({
    src: "assets/" + file,
    small: "assets/" + small,
    alt
  });
  const media = {
    bedOak: photo("catalog/bedroom-oak.webp", "سرير خشبي بجوار وحدة جانبية في غرفة بألوان دافئة", "catalog/bedroom-oak-small.webp"),
    bedLinen: photo("catalog/bedroom-linen.webp", "سرير فاتح التنجيد ووحدة جانبية معلقة", "catalog/bedroom-linen-small.webp"),
    dining: photo("images/dining-800.webp", "طاولة سفرة مستطيلة تحيط بها كراسٍ خشبية", "images/dining-400.webp"),
    diningDetail: photo("reference/dining.webp", "مرجع توضيحي لطاولة سفرة بقاعدة خشبية مضلّعة"),
    sofa: photo("images/sofa-800.webp", "أريكة خضراء كاملة بأرجل خشبية", "images/sofa-400.webp"),
    sofaDetail: photo("reference/sofa.webp", "مرجع توضيحي لملمس الكسوة الخضراء ووسائد الأريكة"),
    living: photo("reference/hero-living.webp", "أثاث معيشة بتنجيد فاتح وطاولة خشبية مستديرة"),
    livingAlt: photo("images/hero-800.webp", "مرجع توضيحي لتنسيق الأثاث الفاتح في غرفة معيشة"),
    kitchen: photo("reference/kitchen.webp", "مطبخ بخزائن خشب داكن وجزيرة بسطح حجري"),
    kitchenLight: photo("images/woodwork-960.webp", "واجهات مطبخ خشبية فاتحة ووحدات مدمجة", "images/woodwork-480.webp"),
    stone: photo("reference/detail-stone.webp", "تفصيل الحافة الحجرية لسطح الجزيرة"),
    slats: photo("reference/woodwork.webp", "كسوة خشبية داكنة بشرائح رأسية"),
    slatDetail: photo("reference/detail-slats.webp", "تفصيل الشرائح الخشبية عن قرب"),
    cabinetDetail: photo("reference/detail-cabinet.webp", "تفصيل وصلة خشبية وحافة رف"),
    sideboard: photo("images/sideboard-800.webp", "خزانة جانبية منخفضة بأبواب ورفوف", "images/sideboard-400.webp"),
    sideboardDetail: photo("reference/storage.webp", "مرجع توضيحي للواجهات المنسوجة والرفوف المفتوحة"),
    desk: photo("catalog/desk-oak.webp", "مكتب خشبي وكرسي أمام نافذة", "catalog/desk-oak-small.webp"),
    workspace: photo("catalog/desk-workspace.webp", "سطح مكتب خشبي مهيأ لشاشة وحاسوب", "catalog/desk-workspace-small.webp")
  };

  const categories = [
    { slug: "bedrooms", title: "غرف النوم", icon: "armchair", cover: media.bedOak, description: "أسِرّة ووحدات جانبية تساعدك على ترتيب غرفة النوم بأحجام وخامات تناسب المساحة." },
    { slug: "dining", title: "غرف السفرة", icon: "plan", cover: media.dining, description: "طاولات ومقاعد بتكوينات مختلفة، من ركن طعام صغير إلى غرفة سفرة كاملة." },
    { slug: "living", title: "الأنتريهات", icon: "armchair", cover: media.living, description: "أرائك ومقاعد للمعيشة تجمع الخامات الهادئة والمقاسات القابلة للمقارنة." },
    { slug: "kitchens", title: "المطابخ", icon: "kitchen", cover: media.kitchen, description: "نماذج لوحدات المطابخ والجزُر الخشبية وكيف تتكامل مع الخامات والأسطح." },
    { slug: "storage", title: "الخزائن", icon: "cabinet", cover: media.sideboard, description: "وحدات تخزين جانبية وخزائن مدمجة، بتفاصيل توازن بين الواجهة وسهولة الاستخدام." },
    { slug: "offices", title: "المكاتب", icon: "wood", cover: media.desk, description: "مكاتب للعمل والقراءة بمساحات سطح مختلفة، وخيارات للتخزين وتنظيم الأسلاك." },
    { slug: "beds", parent: "bedrooms", title: "الأسِرّة", description: "أمثلة لأسِرّة خشبية ومنجدة بمقاسات مختلفة." },
    { slug: "bedside", parent: "bedrooms", title: "الوحدات الجانبية", description: "وحدات إلى جوار السرير بمقاسات مدمجة." },
    { slug: "dining-tables", parent: "dining", title: "طاولات السفرة", description: "طاولات مستطيلة تناسب غرف سفرة بأحجام مختلفة." },
    { slug: "dining-seating", parent: "dining", title: "مقاعد السفرة", description: "مقاعد خشبية ومبطنة تكمل طاولة السفرة." },
    { slug: "sofas", parent: "living", title: "الأرائك", description: "أرائك مستقيمة وركنية للمعيشة." },
    { slug: "lounge-chairs", parent: "living", title: "كراسي الاسترخاء", description: "مقاعد منفردة لركن القراءة والمعيشة." },
    { slug: "full-kitchens", parent: "kitchens", title: "وحدات المطابخ", description: "تكوينات لخزائن وواجهات المطبخ." },
    { slug: "islands", parent: "kitchens", title: "جزُر المطابخ", description: "وحدات وسطية بأسطح وتجهيزات متنوعة." },
    { slug: "sideboards", parent: "storage", title: "خزائن جانبية", description: "وحدات منخفضة للسفرة والمعيشة." },
    { slug: "built-in-storage", parent: "storage", title: "خزائن مدمجة", description: "واجهات وتخزين ينسجمان مع الجدار." },
    { slug: "desks", parent: "offices", title: "طاولات المكتب", description: "أسطح للكتابة والقراءة والعمل اليومي." },
    { slug: "workstations", parent: "offices", title: "محطات العمل", description: "تكوينات للعمل مع تنظيم المعدات والأسلاك." }
  ];

  const visible = (amount) => ({ mode: "visible", amount, currency: "EGP" });
  const hidden = { mode: "hidden" };
  const quote = { mode: "quote" };
  const dimensions = (width, depth, height) => width + " × " + depth + " × " + height + " سم";
  const products = [
    {
      id: "SC-101", slug: "walnut-dining-table", title: "طاولة سفرة خشبية", category: "dining", subcategory: "dining-tables",
      description: "طاولة بطول مريح للتجمّعات العائلية، مع سطح خشبي وحواف مدروسة.",
      media: [media.dining, media.diningDetail], specs: { dimensions: dimensions(180, 90, 75), material: "قشرة جوز على لوح هندسي", colors: "جوز دافئ، بلوط طبيعي", extra: "تتسع لستة مقاعد تقريبًا" },
      options: { size: ["160 × 85 سم", "180 × 90 سم", "200 × 95 سم"], color: ["جوز دافئ", "بلوط طبيعي"], material: ["قشرة جوز", "قشرة بلوط"] },
      price: visible(18500), added: "2026-09-13", related: ["compact-dining-table", "dining-chair", "woven-sideboard"]
    },
    {
      id: "SC-102", slug: "green-sofa", title: "أريكة خضراء بأرجل خشبية", category: "living", subcategory: "sofas",
      description: "خط مستقيم وأذرع منخفضة، مع وسائد ظهر منفصلة وكسوة خضراء.",
      media: [media.sofa, media.sofaDetail, { type: "video", src: "assets/catalog/sofa-preview.webm", poster: media.sofa.src, alt: "مقطع توضيحي صامت يعرض صورة الأريكة" }],
      specs: { dimensions: dimensions(220, 88, 80), material: "قماش تنجيد وهيكل خشبي", colors: "أخضر داكن، رمادي دافئ", extra: "وسائد ظهر منفصلة" },
      options: { color: ["أخضر داكن", "رمادي دافئ"], size: ["200 سم", "220 سم"] }, price: quote, added: "2026-09-21", related: ["beige-sectional", "lounge-chair"]
    },
    {
      id: "SC-103", slug: "woven-sideboard", title: "خزانة جانبية بواجهات منسوجة", category: "storage", subcategory: "sideboards", extraCategories: ["dining"],
      description: "وحدة منخفضة للمعيشة أو السفرة، تجمع رفوف العرض والتخزين المغلق.",
      media: [media.sideboard, media.sideboardDetail], specs: { dimensions: dimensions(160, 42, 72), material: "خشب وقشرة طبيعية", colors: "جوز متوسط", extra: "رفوف مفتوحة وأبواب سفلية" },
      price: hidden, added: "2026-09-27", related: ["media-console", "slatted-cabinet", "walnut-dining-table"]
    },
    {
      id: "SC-104", slug: "linen-bed", title: "سرير منجّد بظهر فاتح", category: "bedrooms", subcategory: "beds",
      description: "ظهر منجّد بلون هادئ وقاعدة بخطوط بسيطة، لتنسيق غرفة نوم محايدة.",
      media: [media.bedLinen, media.bedOak], specs: { dimensions: dimensions(172, 215, 112), material: "تنجيد منسوج وقاعدة خشبية", colors: "رملي، بيج فاتح" },
      options: { size: ["مقاس مرتبة 160 × 200 سم", "مقاس مرتبة 180 × 200 سم"] }, price: visible(22400), added: "2026-10-28", related: ["oak-bed", "floating-nightstand"]
    },
    {
      id: "SC-105", slug: "oak-bed", title: "سرير بإطار بلوط", category: "bedrooms", subcategory: "beds",
      description: "إطار خشبي ظاهر وتفاصيل هادئة لسرير مزدوج.",
      media: [media.bedOak, media.cabinetDetail], specs: { dimensions: dimensions(168, 210, 100), material: "بلوط وقاعدة خشبية", colors: "بلوط طبيعي" },
      price: quote, added: "2026-09-07", related: ["linen-bed", "floating-nightstand"]
    },
    {
      id: "SC-106", slug: "floating-nightstand", title: "وحدة جانبية معلّقة", category: "bedrooms", subcategory: "bedside", extraCategories: ["storage"],
      description: "وحدة مدمجة إلى جوار السرير، تترك الأرضية مفتوحة تحتها.",
      media: [media.bedLinen, media.cabinetDetail], specs: { dimensions: dimensions(48, 32, 22), material: "لوح هندسي بواجهة خشبية", colors: "أبيض دافئ، بلوط" },
      price: visible(3900), added: "2026-10-11", related: ["linen-bed", "woven-sideboard"]
    },
    {
      id: "SC-107", slug: "compact-dining-table", title: "طاولة طعام مدمجة", category: "dining", subcategory: "dining-tables",
      description: "تكوين أصغر لركن الطعام أو غرفة سفرة محدودة المساحة.",
      media: [media.diningDetail, media.dining], specs: { dimensions: dimensions(125, 75, 75), material: "قشرة خشبية", colors: "جوز متوسط، بلوط" },
      price: visible(12400), added: "2026-09-25", related: ["walnut-dining-table", "dining-chair"]
    },
    {
      id: "SC-108", slug: "dining-chair", title: "كرسي سفرة مبطّن", category: "dining", subcategory: "dining-seating",
      description: "هيكل خشبي ومقعد مبطّن قابل للتنسيق مع أكثر من طاولة.",
      media: [media.diningDetail], specs: { dimensions: dimensions(50, 53, 87), material: "خشب وقماش", colors: "خشب دافئ، كسوة فاتحة" },
      options: { color: ["بيج فاتح", "رمادي حجري"] }, price: visible(4100), added: "2026-10-09", related: ["compact-dining-table", "walnut-dining-table"]
    },
    {
      id: "SC-109", slug: "beige-sectional", title: "أريكة ركنية رملية", category: "living", subcategory: "sofas",
      description: "تكوين ركني هادئ يحدد منطقة الجلوس في غرفة المعيشة.",
      media: [media.living, media.livingAlt], specs: { dimensions: dimensions(290, 160, 83), material: "قماش منسوج وإسفنج", colors: "رملي" },
      options: { size: ["ركن يمين", "ركن يسار"] }, price: hidden, added: "2026-10-02", related: ["green-sofa", "lounge-chair"]
    },
    {
      id: "SC-110", slug: "lounge-chair", title: "كرسي استرخاء فردي", category: "living", subcategory: "lounge-chairs",
      description: "مقعد منفرد بحجم مريح يكمل ركن القراءة أو غرفة المعيشة.",
      media: [media.living, media.livingAlt], specs: { dimensions: dimensions(76, 83, 84), material: "كسوة قماشية وهيكل خشبي", colors: "بني دافئ، رملي" },
      price: visible(7800), added: "2026-08-26", related: ["green-sofa", "beige-sectional"]
    },
    {
      id: "SC-111", slug: "walnut-kitchen", title: "وحدات مطبخ بجوز داكن", category: "kitchens", subcategory: "full-kitchens", extraCategories: ["storage"],
      description: "واجهات خشبية داكنة وخطوط مستمرة في تكوين مطبخ قابل للتخصيص.",
      media: [media.kitchen, media.stone, media.cabinetDetail], specs: { dimensions: "تحدد حسب المساحة", material: "واجهات بقشرة جوز", colors: "جوز داكن، حجر رمادي" },
      options: { material: ["قشرة جوز", "قشرة بلوط"] }, price: quote, added: "2026-10-20", related: ["oak-kitchen", "stone-island", "slatted-cabinet"]
    },
    {
      id: "SC-112", slug: "oak-kitchen", title: "وحدات مطبخ بواجهات بلوط", category: "kitchens", subcategory: "full-kitchens",
      description: "واجهات فاتحة ومساحات تخزين طويلة لتكوين مطبخ بسيط.",
      media: [media.kitchenLight, media.cabinetDetail], specs: { dimensions: "تحدد حسب المساحة", material: "قشرة بلوط ولوح هندسي", colors: "بلوط فاتح" },
      price: quote, added: "2026-09-16", related: ["walnut-kitchen", "stone-island"]
    },
    {
      id: "SC-113", slug: "stone-island", title: "جزيرة مطبخ بسطح حجري", category: "kitchens", subcategory: "islands",
      description: "وحدة وسطية بواجهة خشبية ومساحة سطح للعمل أو الجلوس.",
      media: [media.kitchen, media.stone], specs: { dimensions: dimensions(200, 90, 92), material: "خشب وسطح حجري", colors: "جوز داكن، رمادي" },
      price: hidden, added: "2026-10-12", related: ["walnut-kitchen", "oak-kitchen"]
    },
    {
      id: "SC-114", slug: "slatted-cabinet", title: "خزانة مدمجة بشرائح خشبية", category: "storage", subcategory: "built-in-storage", extraCategories: ["kitchens"],
      description: "واجهة خشبية رأسية توحّد مظهر الخزانة والجدار المحيط.",
      media: [media.slats, media.slatDetail], specs: { dimensions: "تحدد حسب الجدار", material: "شرائح بقشرة خشبية", colors: "جوز داكن" },
      price: quote, added: "2026-09-30", related: ["woven-sideboard", "media-console", "walnut-kitchen"]
    },
    {
      id: "SC-115", slug: "media-console", title: "وحدة تخزين للمعيشة", category: "storage", subcategory: "sideboards", extraCategories: ["living"],
      description: "وحدة أفقية منخفضة توفّر رفًا للعرض ومساحة للملحقات.",
      media: [media.sideboardDetail, media.sideboard], specs: { dimensions: dimensions(140, 40, 55), material: "قشرة طبيعية", colors: "جوز دافئ", extra: "فتحة خلفية لمرور الأسلاك" },
      price: visible(9600), added: "2026-10-18", related: ["woven-sideboard", "slatted-cabinet", "green-sofa"]
    },
    {
      id: "SC-116", slug: "oak-writing-desk", title: "مكتب كتابة بسطح بلوط", category: "offices", subcategory: "desks",
      description: "سطح كتابة واضح بخطوط خفيفة، مناسب للعمل اليومي أو الدراسة.",
      media: [media.desk, media.workspace], specs: { dimensions: dimensions(120, 58, 75), material: "بلوط وقاعدة خشبية", colors: "بلوط طبيعي" },
      options: { size: ["100 سم", "120 سم", "140 سم"] }, price: visible(8900), added: "2026-10-08", related: ["corner-workstation", "reading-desk"]
    },
    {
      id: "SC-117", slug: "corner-workstation", title: "محطة عمل منزلية", category: "offices", subcategory: "workstations",
      description: "سطح عمل يتسع لشاشة وحاسوب وملحقات المكتب.",
      media: [media.workspace, media.desk], specs: { dimensions: dimensions(145, 65, 75), material: "لوح هندسي بقشرة خشبية", colors: "جوز متوسط", extra: "تنظيم خلفي للأسلاك" },
      price: quote, added: "2026-10-24", related: ["oak-writing-desk", "reading-desk"]
    },
    {
      id: "SC-118", slug: "reading-desk", title: "مكتب قراءة مدمج", category: "offices", subcategory: "desks", extraCategories: ["bedrooms"],
      description: "مكتب قصير مناسب لركن قراءة أو مساحة هادئة داخل الغرفة.",
      media: [media.desk], specs: { dimensions: dimensions(95, 48, 74), material: "قشرة بلوط", colors: "بلوط فاتح" },
      price: hidden, added: "2026-08-17", related: ["oak-writing-desk", "corner-workstation"]
    }
  ];

  const sources = [
    ["غرفة النوم الخشبية", "https://unsplash.com/photos/a-cozy-bedroom-with-a-wooden-bed-and-nightstand-aRi-pNH82rQ"],
    ["غرفة النوم المنجّدة", "https://unsplash.com/photos/modern-bedroom-with-beige-bed-and-floating-white-nightstand-E-z8iE6LSgg"],
    ["مكتب البلوط", "https://unsplash.com/photos/wooden-desk-and-chair-in-workspace-m8N-vHYb_fc"],
    ["محطة العمل", "https://unsplash.com/photos/home-office-workspace-with-wooden-desk-TlRQin0iwjE"],
    ["صورة الأريكة", "https://unsplash.com/photos/green-fabric-sofa-fZuleEfeA1Q"]
  ];

  const showcaseOrder = [
    "walnut-dining-table", "green-sofa", "woven-sideboard", "floating-nightstand", "oak-bed", "linen-bed",
    "beige-sectional", "compact-dining-table", "lounge-chair", "slatted-cabinet", "walnut-kitchen", "oak-kitchen",
    "media-console", "corner-workstation", "oak-writing-desk"
  ];

  return { categories, products, sources, showcaseOrder, cover: media.living, publicBase: "", whatsappNumber: "" };
})();

if (typeof module !== "undefined" && module.exports) module.exports = sceneryCatalog;
