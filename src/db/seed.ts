import "dotenv/config";
import { db, pool } from "./index";
import { cities, categories, attractions, localProducts } from "./schema";

async function seed() {
  console.log("Seeding database...");

  await db.delete(attractions);
  await db.delete(localProducts);
  await db.delete(categories);
  await db.delete(cities);

  const [kharga, dakhla, farafra] = await db
    .insert(cities)
    .values([
      {
        slug: "kharga",
        nameAr: "الخارجة",
        nameEn: "Kharga",
        descriptionAr:
          "عاصمة محافظة الوادي الجديد وأكبر واحاتها، تجمع بين الآثار الفرعونية والرومانية وبساتين النخيل الممتدة والعيون الحرارية.",
        imageUrl:
          "https://images.pexels.com/photos/18742776/pexels-photo-18742776.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
      },
      {
        slug: "dakhla",
        nameAr: "الداخلة",
        nameEn: "Dakhla",
        descriptionAr:
          "واحة عريقة كانت عاصمة إقليم الواحات في العصور القديمة، تشتهر بمدنها الإسلامية المبنية بالطوب اللبن وعيونها الحارة.",
        imageUrl:
          "https://images.pexels.com/photos/16496711/pexels-photo-16496711.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
      },
      {
        slug: "farafra",
        nameAr: "الفرافرة",
        nameEn: "Farafra",
        descriptionAr:
          "أصغر واحات الوادي الجديد وأكثرها هدوءًا وبراءةً، بوابة الصحراء البيضاء وثاني أكبر محمية طبيعية في مصر.",
        imageUrl:
          "https://images.pexels.com/photos/34328970/pexels-photo-34328970.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
      },
    ])
    .returning();

  const [heritage, safari, therapeutic, nature] = await db
    .insert(categories)
    .values([
      {
        slug: "heritage",
        nameAr: "التراث والآثار",
        nameEn: "Heritage",
        icon: "🏛️",
        colorHex: "#B9622B",
        descriptionAr: "معابد فرعونية ورومانية ومدن إسلامية قديمة من الطوب اللبن.",
      },
      {
        slug: "safari",
        nameAr: "السفاري والمغامرات",
        nameEn: "Safari",
        icon: "🚙",
        colorHex: "#0E7C7B",
        descriptionAr: "رحلات جيب في الكثبان الرملية ومعسكرات تخييم تحت النجوم.",
      },
      {
        slug: "therapeutic",
        nameAr: "السياحة العلاجية",
        nameEn: "Therapeutic",
        icon: "♨️",
        colorHex: "#C1863B",
        descriptionAr: "عيون مياه كبريتية وحرارية طبيعية معروفة بفوائدها العلاجية.",
      },
      {
        slug: "nature",
        nameAr: "الطبيعة والمحميات",
        nameEn: "Nature",
        icon: "🌿",
        colorHex: "#3F8F6B",
        descriptionAr: "تشكيلات صخرية نادرة ومحميات طبيعية فريدة من نوعها في العالم.",
      },
    ])
    .returning();

  await db.insert(attractions).values([
    // Heritage - Kharga
    {
      slug: "temple-of-hibis",
      nameAr: "معبد هيبس",
      nameEn: "Temple of Hibis",
      categoryId: heritage.id,
      cityId: kharga.id,
      shortDescriptionAr: "أضخم وأكمل معبد فرعوني باقٍ في الواحات المصرية",
      descriptionAr:
        "يعد معبد هيبس أهم وأكبر المعابد الباقية في الصحراء الغربية، بُني في عصر الأسرة السادسة والعشرين وأعيد بناؤه في العصر الفارسي، ويتميز بنقوشه الفريدة التي تصور آلهة مصرية بأشكال غير مألوفة. يقع وسط بستان نخيل كثيف يمنحه منظرًا خلابًا عند الغروب.",
      imageUrl:
        "https://commons.wikimedia.org/wiki/Special:FilePath/Flickr_-_isawnyu_-_Hibis,_Temple_(V).jpg",
      priceLevel: "low",
      durationHours: 2,
      bestSeasonAr: "من أكتوبر إلى أبريل",
      rating: "4.7",
      isFeatured: true,
      tags: ["آثار", "تصوير", "عائلي"],
      highlights: ["نقوش نادرة للإله آمون", "محاط ببستان نخيل", "مناسب لجميع الأعمار"],
      tipsAr: "الزيارة في ساعات الصباح الباكر أو قبل الغروب تمنحك إضاءة رائعة للتصوير.",
    },
    {
      slug: "qasr-el-ghueita",
      nameAr: "قصر الغويطة",
      nameEn: "Qasr El-Ghueita",
      categoryId: heritage.id,
      cityId: kharga.id,
      shortDescriptionAr: "حصن أثري على قمة تلة يطل على بحر من بساتين النخيل",
      descriptionAr:
        "قلعة وحصن قديم شُيّد لحماية طرق القوافل، ويضم معبدًا للإله آمون من عصر الأسرة الخامسة والعشرين. تسلق التلة يستحق العناء لمشاهدة بانوراما مذهلة لواحة الخارجة من الأعلى.",
      imageUrl:
        "https://commons.wikimedia.org/wiki/Special:FilePath/Auxiliary_Structures_at_Qasr_el-Ghueita_(I)_(4930461372).jpg",
      priceLevel: "low",
      durationHours: 2,
      bestSeasonAr: "من أكتوبر إلى أبريل",
      rating: "4.6",
      isFeatured: false,
      tags: ["آثار", "بانوراما", "مغامرة خفيفة"],
      highlights: ["إطلالة بانورامية", "حصن دفاعي قديم", "معبد آمون الداخلي"],
      tipsAr: "احرص على ارتداء حذاء مريح لصعود التلة الصخرية.",
    },
    {
      slug: "al-bagawat-necropolis",
      nameAr: "جبانة البجوات",
      nameEn: "Al-Bagawat Necropolis",
      categoryId: heritage.id,
      cityId: kharga.id,
      shortDescriptionAr: "واحدة من أقدم المقابر المسيحية المتكاملة في العالم",
      descriptionAr:
        "تضم أكثر من 260 قبة طينية أثرية تعود للقرنين الرابع والسادس الميلادي، وتُعد من أهم شواهد الوجود المسيحي المبكر في مصر. الزخارف الجدارية الداخلية في بعض القباب لا تزال محتفظة بألوانها.",
      imageUrl:
        "https://commons.wikimedia.org/wiki/Special:FilePath/BagawatEntrance.jpg",
      priceLevel: "low",
      durationHours: 1,
      bestSeasonAr: "من أكتوبر إلى أبريل",
      rating: "4.5",
      isFeatured: true,
      tags: ["آثار", "تراث ديني", "تصوير"],
      highlights: ["أكثر من 260 قبة طينية", "رسومات جدارية أصلية", "قيمة تاريخية عالمية"],
      tipsAr: "استعن بمرشد محلي لفهم قصص الرسومات الجدارية داخل القباب.",
    },
    // Heritage - Dakhla
    {
      slug: "al-qasr-old-town",
      nameAr: "قصر الداخلة (المدينة القديمة)",
      nameEn: "Al-Qasr Old Town",
      categoryId: heritage.id,
      cityId: dakhla.id,
      shortDescriptionAr: "مدينة إسلامية من الطوب اللبن بأزقة متشابكة عمرها 900 عام",
      descriptionAr:
        "بلدة تاريخية بُنيت في العصر الأيوبي، تتميز بأزقتها الضيقة المسقوفة التي صُممت لتلطيف الحرارة، ومسجدها العتيق ومئذنته الطينية، ومنازلها المزخرفة بألواح خشبية منقوشة بآيات قرآنية وتواريخ قديمة.",
      imageUrl:
        "https://commons.wikimedia.org/wiki/Special:FilePath/Dakhla_Old_Town.jpg",
      priceLevel: "low",
      durationHours: 3,
      bestSeasonAr: "من أكتوبر إلى أبريل",
      rating: "4.8",
      isFeatured: true,
      tags: ["آثار", "عمارة إسلامية", "المفضلة للتصوير"],
      highlights: ["أزقة طينية متشابكة", "مسجد نصر الدين الأيوبي", "متحف إثنوغرافي صغير"],
      tipsAr: "تجول سيرًا مع مرشد محلي لسماع حكايات كل بيت وزخرفة أبوابه الخشبية.",
    },
    {
      slug: "balat-ancient-village",
      nameAr: "قرية بلاط الأثرية ومقابر الأمراء",
      nameEn: "Balat & Tombs of the Nobles",
      categoryId: heritage.id,
      cityId: dakhla.id,
      shortDescriptionAr: "مدينة فرعونية كاملة ومقابر حكام الواحة منذ 4300 عام",
      descriptionAr:
        "من أقدم وأهم المواقع الأثرية في الصحراء الغربية، تضم مقابر حكام إقليم الواحات في عهد الدولة القديمة بزخارفها الملونة المحفوظة جيدًا، بجانب بقايا مدينة سكنية متكاملة من الطوب اللبن.",
      imageUrl:
        "https://commons.wikimedia.org/wiki/Special:FilePath/Balat_old_village_Dakhla_oasis_Egypt.jpg",
      priceLevel: "low",
      durationHours: 2,
      bestSeasonAr: "من نوفمبر إلى مارس",
      rating: "4.4",
      isFeatured: false,
      tags: ["آثار", "الدولة القديمة", "نادر"],
      highlights: ["مقابر ملونة محفوظة", "مدينة أثرية متكاملة", "قيمة تاريخية استثنائية"],
      tipsAr: "الموقع أقل ازدحامًا من غيره، فرصة رائعة لتجربة استكشاف هادئة.",
    },
    {
      slug: "deir-el-hagar-temple",
      nameAr: "معبد دير الحجر",
      nameEn: "Deir el-Hagar Temple",
      categoryId: heritage.id,
      cityId: dakhla.id,
      shortDescriptionAr: "معبد روماني منحوت من الحجر الرملي وسط الصحراء",
      descriptionAr:
        "شُيّد في العصر الروماني تكريمًا لثالوث طيبة المقدس (آمون، موت، خونسو)، ويحتفظ بأعمدة ونقوش محفوظة بشكل جيد رغم قِدَمه، ويُعد من أجمل نقاط الغروب في واحة الداخلة.",
      imageUrl:
        "https://commons.wikimedia.org/wiki/Special:FilePath/Deir_el-Hagar_1.jpg",
      priceLevel: "low",
      durationHours: 1,
      bestSeasonAr: "من أكتوبر إلى أبريل",
      rating: "4.5",
      isFeatured: false,
      tags: ["آثار", "عصر روماني", "غروب"],
      highlights: ["عمارة رومانية أصيلة", "موقع غروب مذهل", "سهل الوصول بالسيارة"],
      tipsAr: "اجعله آخر محطة في يومك للاستمتاع بغروب الشمس خلف الأعمدة.",
    },
    // Safari
    {
      slug: "great-sand-sea-safari",
      nameAr: "رحلة سفاري بحر الرمال العظيم",
      nameEn: "Great Sand Sea Jeep Safari",
      categoryId: safari.id,
      cityId: farafra.id,
      shortDescriptionAr: "مغامرة جيب بين أعلى الكثبان الرملية في الصحراء الغربية",
      descriptionAr:
        "بحر الرمال العظيم من أكبر امتدادات الكثبان الرملية في العالم، تمتد كثبانه لمئات الكيلومترات على حدود مصر وليبيا. رحلات السفاري بالجيب هنا تجربة لا تُنسى بين جبال من الرمال الذهبية المتموجة.",
      imageUrl:
        "https://commons.wikimedia.org/wiki/Special:FilePath/Great_Sand_Sea.jpg",
      priceLevel: "medium",
      durationHours: 6,
      bestSeasonAr: "من نوفمبر إلى فبراير (تجنب الصيف)",
      rating: "4.9",
      isFeatured: true,
      tags: ["سفاري", "مغامرة", "تصوير", "غروب"],
      highlights: ["كثبان رملية شاسعة", "سائقون محليون خبراء", "تجربة غروب استثنائية"],
      tipsAr: "احجز مع مرشد سفاري مرخّص، ولا تنسَ الماء الكافي وواقي الشمس.",
    },
    {
      slug: "kharga-sandboarding-dunes",
      nameAr: "التزلج على كثبان الخارجة الرملية",
      nameEn: "Kharga Sandboarding Dunes",
      categoryId: safari.id,
      cityId: kharga.id,
      shortDescriptionAr: "نشاط ترفيهي مثالي للشباب والعائلات على حافة الواحة",
      descriptionAr:
        "كثبان رملية قريبة من مدينة الخارجة توفر تجربة تزلج رملي وقيادة دراجات رباعية بسهولة وصول، مثالية ليوم مسائي قصير دون الحاجة لرحلة صحراوية طويلة.",
      imageUrl:
        "https://commons.wikimedia.org/wiki/Special:FilePath/Sand_dunes_egypt_western_desert.jpg",
      priceLevel: "low",
      durationHours: 3,
      bestSeasonAr: "طوال العام، الأمسيات أفضل في الصيف",
      rating: "4.3",
      isFeatured: false,
      tags: ["سفاري", "عائلي", "دراجات رباعية"],
      highlights: ["قريبة من المدينة", "مناسبة للمبتدئين", "أنشطة مسائية"],
      tipsAr: "الذهاب قبل الغروب بساعتين يمنحك أفضل إضاءة وأقل حرارة.",
    },
    {
      slug: "white-desert-overnight-camp",
      nameAr: "تخييم ليلي في الصحراء البيضاء",
      nameEn: "White Desert Overnight Camping",
      categoryId: safari.id,
      cityId: farafra.id,
      shortDescriptionAr: "نوم تحت النجوم بين تشكيلات طباشيرية بيضاء ساحرة",
      descriptionAr:
        "تجربة تخييم فريدة وسط تكوينات صخرية بيضاء أشبه بمشهد من كوكب آخر، مع عشاء بدوي حول نار المخيم وسماء مليئة بالنجوم بعيدًا عن أي تلوث ضوئي. من أكثر التجارب تقييمًا من الزوار الأجانب والمصريين على حدٍ سواء.",
      imageUrl:
        "https://commons.wikimedia.org/wiki/Special:FilePath/White_Desert_National_Park_Farafra.jpg",
      priceLevel: "medium",
      durationHours: 18,
      bestSeasonAr: "من أكتوبر إلى أبريل (الليالي باردة)",
      rating: "4.9",
      isFeatured: true,
      tags: ["سفاري", "تخييم", "مغامرة", "الأكثر تقييمًا"],
      highlights: ["مشاهدة النجوم", "عشاء بدوي تقليدي", "تشكيلات صخرية بيضاء نادرة"],
      tipsAr: "احضر ملابس شتوية دافئة حتى في الصيف، فليالي الصحراء باردة جدًا.",
    },
    // Nature
    {
      slug: "white-desert-national-park",
      nameAr: "محمية الصحراء البيضاء",
      nameEn: "White Desert National Park",
      categoryId: nature.id,
      cityId: farafra.id,
      shortDescriptionAr: "ثاني أكبر محمية طبيعية في مصر بتشكيلات صخرية غريبة الشكل",
      descriptionAr:
        "تشكلت صخورها الطباشيرية البيضاء عبر ملايين السنين من عوامل التعرية لتأخذ أشكالًا أقرب للفن التجريدي مثل صخرة 'الأرنب' و'الفطر' و'الدجاجة والكتكوت'. تجربة بصرية نادرة لا تتكرر في أي مكان آخر بالعالم.",
      imageUrl:
        "https://commons.wikimedia.org/wiki/Special:FilePath/White_Desert_-_Egypt.jpg",
      priceLevel: "low",
      durationHours: 4,
      bestSeasonAr: "من أكتوبر إلى أبريل",
      rating: "4.9",
      isFeatured: true,
      tags: ["طبيعة", "تصوير", "الأكثر شهرة"],
      highlights: ["تشكيلات صخرية فريدة عالميًا", "محمية طبيعية محمية دوليًا", "مثالية للتصوير"],
      tipsAr: "زُرها عند الشروق أو الغروب حين يتحول لون الصخور إلى ذهبي وردي ساحر.",
    },
    {
      slug: "crystal-mountain",
      nameAr: "جبل الكريستال",
      nameEn: "Crystal Mountain",
      categoryId: nature.id,
      cityId: farafra.id,
      shortDescriptionAr: "تكوين صخري طبيعي من الكوارتز المتلألئ وسط الصحراء",
      descriptionAr:
        "بوابة صخرية طبيعية مكوّنة بالكامل تقريبًا من بلورات الكوارتز الشفافة، تتلألأ تحت أشعة الشمس بشكل مذهل. محطة مختصرة لكنها من أكثر النقاط تصويرًا في طريق السفاري إلى الصحراء البيضاء.",
      imageUrl:
        "https://commons.wikimedia.org/wiki/Special:FilePath/Crystal_Mountain_Egypt.jpg",
      priceLevel: "free",
      durationHours: 1,
      bestSeasonAr: "طوال العام",
      rating: "4.4",
      isFeatured: false,
      tags: ["طبيعة", "تصوير", "محطة قصيرة"],
      highlights: ["بلورات كوارتز طبيعية", "محطة سريعة وسهلة", "مجانية الدخول"],
      tipsAr: "تُضاف عادة كمحطة ضمن طريق سفاري الصحراء البيضاء.",
    },
    {
      slug: "el-mufid-lake",
      nameAr: "بحيرة المفيد",
      nameEn: "El-Mufid Lake",
      categoryId: nature.id,
      cityId: farafra.id,
      shortDescriptionAr: "بحيرة صحراوية نادرة تجذب الطيور المهاجرة شتاءً",
      descriptionAr:
        "واحة مائية طبيعية وسط الرمال، توفر مشهدًا متناقضًا وساحرًا بين المياه الزرقاء والكثبان الذهبية، وتُعد محطة استراحة لبعض الطيور المهاجرة، ما يجعلها موقعًا مميزًا لهواة مراقبة الطبيعة.",
      imageUrl:
        "https://commons.wikimedia.org/wiki/Special:FilePath/Lake_Mofid_Dakhla_oasis_Egypt.jpg",
      priceLevel: "free",
      durationHours: 2,
      bestSeasonAr: "من نوفمبر إلى فبراير",
      rating: "4.2",
      isFeatured: false,
      tags: ["طبيعة", "طيور", "هدوء"],
      highlights: ["مراقبة الطيور المهاجرة", "منظر طبيعي متناقض", "هدوء تام"],
      tipsAr: "احضر منظارًا مكبرًا إن كنت من هواة مراقبة الطيور.",
    },
    // Therapeutic
    {
      slug: "mut-talata-hot-spring",
      nameAr: "عين موط الحرارية (موط الثالثة)",
      nameEn: "Mut Talata Hot Spring",
      categoryId: therapeutic.id,
      cityId: dakhla.id,
      shortDescriptionAr: "أشهر عين علاجية في الداخلة بدرجة حرارة تصل لـ45°",
      descriptionAr:
        "عين مياه كبريتية طبيعية تنبع من باطن الأرض، تشتهر بفوائدها العلاجية لآلام المفاصل والروماتيزم وأمراض الجلد، وتحوّلت إلى منتجع بسيط بمسابح مفتوحة يرتادها المصريون والأجانب لأغراض الاستشفاء والاسترخاء.",
      imageUrl:
        "https://commons.wikimedia.org/wiki/Special:FilePath/Mut_hot_spring_Dakhla_Egypt.jpg",
      priceLevel: "low",
      durationHours: 3,
      bestSeasonAr: "طوال العام، والشتاء الأفضل للعلاج",
      rating: "4.7",
      isFeatured: true,
      tags: ["علاجي", "استرخاء", "الأكثر شهرة"],
      highlights: ["مياه كبريتية 45°", "مفيدة لآلام المفاصل", "مسابح مفتوحة"],
      tipsAr: "استشر طبيبك إن كانت لديك حالة قلبية قبل الاستحمام بالمياه الساخنة لفترات طويلة.",
    },
    {
      slug: "bir-naser-sulphur-spring",
      nameAr: "بئر الناصر الكبريتي",
      nameEn: "Bir Naser Sulphur Spring",
      categoryId: therapeutic.id,
      cityId: kharga.id,
      shortDescriptionAr: "عين مياه ساخنة طبيعية داخل واحة الخارجة نفسها",
      descriptionAr:
        "من أقرب العيون العلاجية لمركز مدينة الخارجة، مصدرها المياه الجوفية العميقة الغنية بالكبريت والمعادن، وتُستخدم تقليديًا من قبل أهالي الواحة لعلاج آلام العظام والتعب العام.",
      imageUrl:
        "https://commons.wikimedia.org/wiki/Special:FilePath/Kharga_Oasis_by_Hanne_Siegmeier.jpg",
      priceLevel: "free",
      durationHours: 2,
      bestSeasonAr: "طوال العام",
      rating: "4.1",
      isFeatured: false,
      tags: ["علاجي", "محلي", "اقتصادي"],
      highlights: ["قريبة من المدينة", "دخول مجاني غالبًا", "تجربة محلية أصيلة"],
      tipsAr: "زُرها بصحبة مرشد محلي لمعرفة أفضل الأوقات وآداب الزيارة.",
    },
    {
      slug: "bir-sitta-hot-spring",
      nameAr: "عين بئر ستة الحرارية",
      nameEn: "Bir Sitta Hot Spring",
      categoryId: therapeutic.id,
      cityId: farafra.id,
      shortDescriptionAr: "عين ساخنة وسط الصحراء يستمتع بها زوار الصحراء البيضاء ليلًا",
      descriptionAr:
        "محطة أساسية ضمن رحلات سفاري الصحراء البيضاء، حيث يمكن الاستحمام بمياهها الدافئة تحت سماء مرصعة بالنجوم بعد يوم طويل من استكشاف الكثبان والتشكيلات الصخرية.",
      imageUrl:
        "https://commons.wikimedia.org/wiki/Special:FilePath/Bir_el_Wahed_spring_Farafra.jpg",
      priceLevel: "low",
      durationHours: 2,
      bestSeasonAr: "من أكتوبر إلى أبريل",
      rating: "4.6",
      isFeatured: false,
      tags: ["علاجي", "ليلي", "تجربة نجوم"],
      highlights: ["استحمام ليلي دافئ", "ضمن مسار السفاري", "أجواء نجوم ساحرة"],
      tipsAr: "أحضر ملابس سباحة مناسبة ومنشفة ضمن حقيبة السفاري الخاصة بك.",
    },
  ]);

  // ── توسعة البيانات: 22 مكان جديد موثق ──────────────────────────────────
  await db.insert(attractions).values([

    // ═══════════════════════════════════════════════════════════════
    // التراث والآثار — Heritage (8 مواقع جديدة)
    // ═══════════════════════════════════════════════════════════════

    {
      // معبد نادوري — خارجة — مُرمَّم جزئيًا في ثمانينيات القرن الماضي
      slug: "temple-of-nadura",
      nameAr: "معبد نادوري الروماني",
      nameEn: "Temple of Nadura",
      categoryId: heritage.id,
      cityId: kharga.id,
      shortDescriptionAr: "معبد روماني على تلة مشرفة يُعد أحد أكمل المباني الرومانية في الواحات",
      descriptionAr:
        "شُيّد في عهد الإمبراطور أنطونينوس بيوس (القرن الثاني الميلادي) على قمة تلة تُشرف على مدينة الخارجة بالكامل. يحتفظ المعبد ببوابته الحجرية وجزء من أسقفه الأصلية رغم مرور نحو 1900 عام، وتُظهر أعمال الترميم التي أجرتها هيئة الآثار المصرية في الثمانينيات مدى أهميته المعمارية.",
      imageUrl:
        "https://commons.wikimedia.org/wiki/Special:FilePath/NaduraTemple.jpg",
      priceLevel: "low",
      durationHours: 1,
      bestSeasonAr: "من أكتوبر إلى أبريل",
      rating: "4.4",
      isFeatured: false,
      tags: ["آثار", "روماني", "إطلالة بانورامية", "مُرمَّم"],
      highlights: ["بوابة رومانية أصيلة", "إطلالة شاملة على الخارجة", "ترميم أثري موثق"],
      tipsAr: "يمكن زيارته بالتوازي مع جبانة البجوات إذ يقعان في نفس المنطقة الأثرية.",
    },

    {
      // قصر زيان — خارجة — حصن روماني-بيزنطي مُرمَّم
      slug: "qasr-zayan",
      nameAr: "قصر زيان",
      nameEn: "Qasr Zayan",
      categoryId: heritage.id,
      cityId: kharga.id,
      shortDescriptionAr: "حصن بيزنطي محكم البناء يضم بداخله معبدًا فرعونيًا أقدم منه بألف عام",
      descriptionAr:
        "يجمع قصر زيان طبقتين تاريخيتين نادرتين: معبد فرعوني يعود للأسرة الثلاثين، مُدمج داخل حصن روماني-بيزنطي أُعيد توظيفه للدفاع عن طريق دارب الأربعين. خضع الموقع لحملة توثيق وترميم جزئي أتاحت تأمين مداخله وحماية نقوشه الداخلية.",
      imageUrl:
        "https://commons.wikimedia.org/wiki/Special:FilePath/Qasr_el-Zaiyan_(4929871271).jpg",
      priceLevel: "low",
      durationHours: 2,
      bestSeasonAr: "من أكتوبر إلى أبريل",
      rating: "4.3",
      isFeatured: false,
      tags: ["آثار", "بيزنطي", "فرعوني", "طريق دارب الأربعين"],
      highlights: ["معبد فرعوني داخل حصن بيزنطي", "ترميم أثري رسمي", "موقع على طريق القوافل التاريخي"],
      tipsAr: "اطلب من المرشد شرح كيف استُخدم المعبد الفرعوني القديم بناءً دفاعيًا لاحقًا.",
    },

    {
      // معبد عين أمور — خارجة — موقع نادر مُدرج في قائمة الحماية
      slug: "ain-umur-temple",
      nameAr: "معبد عين أمور",
      nameEn: "Ain Umur Temple",
      categoryId: heritage.id,
      cityId: kharga.id,
      shortDescriptionAr: "معبد صغير من الحجر الجيري محفور في الصخر جنوب واحة الخارجة",
      descriptionAr:
        "موقع أثري هادئ بعيد عن الطرق السياحية المعتادة، يضم معبدًا صغيرًا من عصر البطالمة محفورًا جزئيًا في الحجر الجيري الطبيعي، مع نقوش باقية على جدرانه الداخلية. يُعد زيارته تجربة استكشافية أصيلة بعيدًا عن الازدحام.",
      imageUrl:
        "https://commons.wikimedia.org/wiki/Special:FilePath/Ain_Umur_temple.jpg",
      priceLevel: "free",
      durationHours: 1,
      bestSeasonAr: "من نوفمبر إلى مارس",
      rating: "4.0",
      isFeatured: false,
      tags: ["آثار", "بطلمي", "محفور في الصخر", "خارج المسارات المعتادة"],
      highlights: ["معبد صخري نادر", "نقوش بطلمية محفوظة", "تجربة استكشافية هادئة"],
      tipsAr: "يحتاج سيارة دفع رباعي للوصول إليه — احجزه ضمن جولة جنوب الخارجة.",
    },

    {
      // متحف الوادي الجديد — خارجة — يضم قطعًا من جميع مواقع الواحات
      slug: "new-valley-museum",
      nameAr: "متحف الوادي الجديد",
      nameEn: "New Valley Museum",
      categoryId: heritage.id,
      cityId: kharga.id,
      shortDescriptionAr: "متحف أثري يعرض لُقى من جميع حقب تاريخ الواحات في مكان واحد",
      descriptionAr:
        "يضم المتحف مجموعة من التحف والمقتنيات الأثرية المكتشفة في جميع واحات الوادي الجديد، تشمل أدوات الحياة اليومية من العصور الفرعونية والرومانية والقبطية والإسلامية. يُعد نقطة انطلاق مثالية لفهم تاريخ المنطقة قبل الزيارات الميدانية.",
      imageUrl:
        "https://commons.wikimedia.org/wiki/Special:FilePath/Kharga_Museum.jpg",
      priceLevel: "low",
      durationHours: 2,
      bestSeasonAr: "طوال العام (مكيّف)",
      rating: "4.2",
      isFeatured: false,
      tags: ["متحف", "آثار", "عائلي", "تعليمي"],
      highlights: ["تحف من جميع العصور", "شرح تاريخي متسلسل", "مكيّف ومريح"],
      tipsAr: "ابدأ بالمتحف في أول يوم لتُكوّن خلفية تاريخية تُثري بقية زياراتك.",
    },

    {
      // قرية مزوقة الأثرية — داخلة — اكتُشفت في التسعينيات
      slug: "muzawaka-tombs",
      nameAr: "مقابر المزوقة",
      nameEn: "Muzawaka Painted Tombs",
      categoryId: heritage.id,
      cityId: dakhla.id,
      shortDescriptionAr: "مقابر رومانية نادرة بزخارف جدارية ملونة بالكامل تصور حياة ما بعد الموت",
      descriptionAr:
        "اكتُشفت في التسعينيات وتضم مقبرتين رئيسيتين (مقبرة بيدوبستيس وباتو باستوس) تتميزان بزخارف جدارية رومانية نادرة تجمع بين الفن المصري القديم والتأثيرات الهلنستية. الألوان الأصلية محفوظة بشكل استثنائي وتُعرض للزوار في ظروف تحكّم مناخي للحفاظ عليها.",
      imageUrl:
        "https://commons.wikimedia.org/wiki/Special:FilePath/Muzawaka_Tombs_Dakhla_Oasis.jpg",
      priceLevel: "low",
      durationHours: 2,
      bestSeasonAr: "من أكتوبر إلى أبريل",
      rating: "4.6",
      isFeatured: true,
      tags: ["آثار", "روماني", "رسومات جدارية", "نادر"],
      highlights: ["رسومات جدارية ملونة بالكامل", "دمج فريد بين الفن المصري والهلنستي", "محفوظة بظروف مناخية"],
      tipsAr: "عدد الزوار محدود يوميًا للحفاظ على المقابر — احجز مسبقًا عبر مكتب الآثار المحلي.",
    },

    {
      // قرية قلمون التاريخية — داخلة
      slug: "qalamoun-village",
      nameAr: "قرية قلمون التاريخية",
      nameEn: "Qalamoun Old Village",
      categoryId: heritage.id,
      cityId: dakhla.id,
      shortDescriptionAr: "قرية طينية قديمة تعكس العمارة التقليدية للواحات قبل الطرازات الحديثة",
      descriptionAr:
        "قرية من الطوب اللبن بُنيت معظم مبانيها قبل أكثر من قرن، ولا تزال بعض أسرها تسكنها متمسكةً بأسلوب الحياة التقليدي. تتميز بأبراج التهوية (الملقف) التي تبرد المنازل دون كهرباء، وهي نماذج حية لعمارة صديقة للبيئة سبقت عصرها.",
      imageUrl:
        "https://commons.wikimedia.org/wiki/Special:FilePath/Qalamun_village_Dakhla.jpg",
      priceLevel: "free",
      durationHours: 2,
      bestSeasonAr: "من أكتوبر إلى أبريل",
      rating: "4.1",
      isFeatured: false,
      tags: ["تراث", "عمارة محلية", "ملقف", "قرية حية"],
      highlights: ["أبراج تهوية تقليدية (ملقف)", "أسرة تسكن منازل طينية أصيلة", "عمارة بيئية تقليدية"],
      tipsAr: "احترم خصوصية السكان، واستأذن قبل التصوير في الأزقة الداخلية.",
    },

    {
      // معبد قصر الدوشة — داخلة — مُرمَّم بتمويل دولي
      slug: "qasr-el-doush",
      nameAr: "قصر الدوشة (معبد إيزيس)",
      nameEn: "Qasr El-Doush",
      categoryId: heritage.id,
      cityId: kharga.id,
      shortDescriptionAr: "معبد روماني مُرمَّم على الطرف الجنوبي لواحة الخارجة يُكرّم الإلهة إيزيس",
      descriptionAr:
        "يقع على الحدود الجنوبية لواحة الخارجة عند ملتقى طرق القوافل القادمة من السودان، وهو معبد من العصر الروماني مُكرَّس للإلهتين إيزيس وسيرابيس. خضع لمشروع ترميم فرنسي-مصري مشترك في التسعينيات أعاد تأمين هياكله وصون نقوشه الداخلية.",
      imageUrl:
        "https://commons.wikimedia.org/wiki/Special:FilePath/Qasr_Dush_2.jpg",
      priceLevel: "low",
      durationHours: 2,
      bestSeasonAr: "من أكتوبر إلى أبريل",
      rating: "4.5",
      isFeatured: false,
      tags: ["آثار", "روماني", "إيزيس", "مُرمَّم", "ترميم دولي"],
      highlights: ["ترميم فرنسي-مصري مشترك", "نقوش إيزيس وسيرابيس محفوظة", "موقع استراتيجي على طريق القوافل"],
      tipsAr: "يقع على بُعد 100 كم جنوب الخارجة — يُدرج عادةً ضمن رحلة يوم كامل مع قصر زيان.",
    },

    {
      // قرية عين أصيل الأثرية — داخلة — دولة قديمة
      slug: "ain-asil-site",
      nameAr: "موقع عين أصيل الأثري",
      nameEn: "Ain Asil Archaeological Site",
      categoryId: heritage.id,
      cityId: dakhla.id,
      shortDescriptionAr: "عاصمة إدارية فرعونية من عصر الدولة القديمة اكتشفها علماء فرنسيون",
      descriptionAr:
        "موقع أثري استثنائي يضم بقايا مدينة إدارية كاملة أنشأتها الدولة الفرعونية القديمة (الأسرة السادسة، نحو 2200 ق.م) لإدارة شؤون الواحات. اكتشفه المعهد الفرنسي للآثار الشرقية وأجرى فيه حفريات منهجية كشفت عن قصور وإدارات وسجلات كتابية نادرة.",
      imageUrl:
        "https://commons.wikimedia.org/wiki/Special:FilePath/Ain_Asil_Dakhla_Oasis.jpg",
      priceLevel: "low",
      durationHours: 2,
      bestSeasonAr: "من نوفمبر إلى مارس",
      rating: "4.3",
      isFeatured: false,
      tags: ["آثار", "الدولة القديمة", "حفريات فرنسية", "نادر"],
      highlights: ["عاصمة إدارية فرعونية كاملة", "حفريات IFAO الفرنسية", "سجلات هيراطيقية نادرة"],
      tipsAr: "الموقع أكاديمي بامتياز — مثالي لعاشقي التاريخ الفرعوني العميق.",
    },

    // ═══════════════════════════════════════════════════════════════
    // السفاري والمغامرات — Safari (5 مواقع جديدة)
    // ═══════════════════════════════════════════════════════════════

    {
      // دارب الأربعين — مسار قوافل تاريخي
      slug: "darb-el-arbain-trail",
      nameAr: "مسار دارب الأربعين التاريخي",
      nameEn: "Darb El-Arbain Caravan Trail",
      categoryId: safari.id,
      cityId: kharga.id,
      shortDescriptionAr: "ركوب الجمال على أشهر طريق قوافل في التاريخ بين مصر والسودان",
      descriptionAr:
        "دارب الأربعين (طريق الأربعين يومًا) هو أحد أقدم وأشهر طرق القوافل في العالم، كان يربط سلطنة الفونج في السودان بمدينة أسيوط مرورًا بواحة الخارجة عبر الصحراء الغربية. تُقدم شركات سياحية محلية جولات جمال أو سيارات دفع رباعي على أجزاء من هذا المسار التاريخي.",
      imageUrl:
        "https://commons.wikimedia.org/wiki/Special:FilePath/Darb_el_Arbain_desert_trail.jpg",
      priceLevel: "medium",
      durationHours: 8,
      bestSeasonAr: "من أكتوبر إلى مارس",
      rating: "4.7",
      isFeatured: true,
      tags: ["سفاري", "ركوب جمال", "تاريخي", "مغامرة"],
      highlights: ["أقدم طرق القوافل في العالم", "ركوب جمال أو جيب", "تجربة بدوية أصيلة"],
      tipsAr: "الجولات المصحوبة بمرشد بدوي أكثر إثارة وأمانًا — يُحجز مسبقًا من الخارجة.",
    },

    {
      // الصحراء السوداء — طريق القاهرة-الفرافرة
      slug: "black-desert-safari",
      nameAr: "سفاري الصحراء السوداء",
      nameEn: "Black Desert Safari",
      categoryId: safari.id,
      cityId: farafra.id,
      shortDescriptionAr: "كثبان وتلال بازلتية سوداء تُشكّل مشهدًا مقابلًا للصحراء البيضاء",
      descriptionAr:
        "تقع شمال الفرافرة وتتكون من تلال منبسطة مغطاة بالحجارة البازلتية والكوارتز الداكن، مما يمنحها لون أسود مميز يُشكّل تناقضًا مذهلًا مع الصحراء البيضاء المجاورة. محطة لا تُفوَّت في طريق سفاري الفرافرة-الصحراء البيضاء.",
      imageUrl:
        "https://commons.wikimedia.org/wiki/Special:FilePath/Black_desert_Egypt.jpg",
      priceLevel: "medium",
      durationHours: 4,
      bestSeasonAr: "من أكتوبر إلى أبريل",
      rating: "4.5",
      isFeatured: false,
      tags: ["سفاري", "طبيعة بركانية", "تصوير", "محطة ضمن مسار"],
      highlights: ["تلال بازلتية سوداء نادرة", "تناقض بصري مع الصحراء البيضاء", "مناسبة للتصوير الجوي"],
      tipsAr: "تُقطع عادةً في طريق الذهاب إلى الصحراء البيضاء — لا تجعلها وجهة منفردة.",
    },

    {
      // تخييم نجوم الداخلة
      slug: "dakhla-stargazing-camp",
      nameAr: "تخييم ومراقبة النجوم في الداخلة",
      nameEn: "Dakhla Desert Stargazing Camp",
      categoryId: safari.id,
      cityId: dakhla.id,
      shortDescriptionAr: "ليلة تخييم في صحراء الداخلة بعيدًا عن التلوث الضوئي لرؤية مجرة درب التبانة",
      descriptionAr:
        "تُصنَّف صحراء الداخلة من أفضل مواقع مراقبة النجوم في شمال أفريقيا لبُعدها عن مصادر التلوث الضوئي وانخفاض رطوبتها. تُقدم مخيمات محلية ليالي مجهزة بتلسكوبات ومرشدين فلكيين ووجبات بدوية تحت سماء مفتوحة.",
      imageUrl:
        "https://commons.wikimedia.org/wiki/Special:FilePath/Dakhla_Oasis_view_(May_2007).jpg",
      priceLevel: "medium",
      durationHours: 12,
      bestSeasonAr: "من أكتوبر إلى مارس (ليالي صافية)",
      rating: "4.8",
      isFeatured: true,
      tags: ["سفاري", "تخييم", "نجوم", "فلك", "الأكثر تقييمًا"],
      highlights: ["سماء خالية من التلوث الضوئي", "تلسكوبات ومرشد فلكي", "عشاء بدوي تحت النجوم"],
      tipsAr: "اختر ليالي منتصف الشهر القمري حين يكون القمر في طور المحاق لأوضح رؤية للنجوم.",
    },

    {
      // جولة واحات متعددة بالجيب
      slug: "multi-oasis-jeep-tour",
      nameAr: "جولة الواحات المتعددة بالجيب",
      nameEn: "Multi-Oasis Jeep Tour",
      categoryId: safari.id,
      cityId: kharga.id,
      shortDescriptionAr: "رحلة جيب من يومين تربط الخارجة والداخلة وتعبر قلب الصحراء الغربية",
      descriptionAr:
        "رحلة سفاري متكاملة تنطلق من الخارجة وتعبر الطريق الصحراوي إلى الداخلة (190 كم) مرورًا بمواقع جيولوجية وأثرية نادرة بعيدة عن الطرق المعبّدة. تُتيح التعرف على تنوع الصحراء الغربية بين الكثبان الرملية والهضاب الحجرية والواحات المعزولة.",
      imageUrl:
        "https://commons.wikimedia.org/wiki/Special:FilePath/Darb_el_Arbain_desert_trail.jpg",
      priceLevel: "high",
      durationHours: 16,
      bestSeasonAr: "من نوفمبر إلى فبراير",
      rating: "4.9",
      isFeatured: true,
      tags: ["سفاري", "متعدد الوجهات", "جيب", "مغامرة كبرى"],
      highlights: ["190 كم عبر الصحراء الغربية", "مواقع جيولوجية نادرة", "تجربة شاملة متكاملة"],
      tipsAr: "تتطلب تصريح سفاري رسمي وسائقًا مرخصًا — احجز مع وكالة معتمدة في الخارجة.",
    },

    {
      // رحلة دراجات رباعية الداخلة
      slug: "dakhla-quad-bike-adventure",
      nameAr: "مغامرة الدراجات الرباعية في الداخلة",
      nameEn: "Dakhla Quad Bike Adventure",
      categoryId: safari.id,
      cityId: dakhla.id,
      shortDescriptionAr: "جولة دراجات رباعية على كثبان الداخلة مع توقف عند عيون الواحة",
      descriptionAr:
        "رحلة ترفيهية على الدراجات الرباعية (ATV) تنطلق من أطراف مدينة موط وتجتاز كثبانًا رملية متوسطة الارتفاع، مع توقفات عند عيون المياه الطبيعية وحقول النخيل. مناسبة للمبتدئين والمتمرسين على حد سواء.",
      imageUrl:
        "https://commons.wikimedia.org/wiki/Special:FilePath/Egypt_desert_quad_bike.jpg",
      priceLevel: "medium",
      durationHours: 3,
      bestSeasonAr: "من أكتوبر إلى أبريل، المساء أفضل",
      rating: "4.4",
      isFeatured: false,
      tags: ["سفاري", "دراجات رباعية", "عائلي", "ترفيه"],
      highlights: ["مناسبة للمبتدئين", "توقف عند العيون الطبيعية", "إطلالات غروب رائعة"],
      tipsAr: "ارتدِ نظارة واقية من الرمال وقميصًا بأكمام طويلة حتى في الطقس المعتدل.",
    },

    // ═══════════════════════════════════════════════════════════════
    // الطبيعة والمحميات — Nature (5 مواقع جديدة)
    // ═══════════════════════════════════════════════════════════════

    {
      // وادي الريان الداخلة — وادٍ طبيعي
      slug: "wadi-el-rayan-dakhla",
      nameAr: "وادي هيتا الطبيعي",
      nameEn: "Wadi Hita (Whale Valley area)",
      categoryId: nature.id,
      cityId: dakhla.id,
      shortDescriptionAr: "وادٍ صحراوي بتكوينات جيولوجية ملونة وينابيع مياه جوفية نادرة",
      descriptionAr:
        "وادٍ طبيعي جنوب غرب الداخلة تتشكّل جدرانه من طبقات صخرية ملونة تعكس ملايين السنوات من التحولات الجيولوجية، وينبع في أجزاء منه مياه جوفية تُشكّل بُيَيْحات صغيرة تجذب الطيور والأحياء البرية. من الوديان النادرة غير المُدرجة في مسارات السياحة التقليدية.",
      imageUrl:
        "https://commons.wikimedia.org/wiki/Special:FilePath/The_whales_fossils_at_Wadi_El-Hitan,_Egypt_2017.jpg",
      priceLevel: "free",
      durationHours: 3,
      bestSeasonAr: "من نوفمبر إلى مارس",
      rating: "4.2",
      isFeatured: false,
      tags: ["طبيعة", "وادٍ", "جيولوجيا", "هادئ"],
      highlights: ["طبقات صخرية ملونة", "ينابيع مياه جوفية صغيرة", "بعيد عن السياحة التقليدية"],
      tipsAr: "احضر كميات كافية من الماء — لا توجد خدمات في الوادي.",
    },

    {
      // منخفض الفرافرة الجيولوجي
      slug: "farafra-depression-geology",
      nameAr: "منخفض الفرافرة الجيولوجي",
      nameEn: "Farafra Depression",
      categoryId: nature.id,
      cityId: farafra.id,
      shortDescriptionAr: "أحد أعمق المنخفضات الطبيعية في أفريقيا بتشكيلات حجرية متنوعة",
      descriptionAr:
        "منخفض طبيعي ضخم تحيط به جروف صخرية تعرّضت لملايين السنوات من التشكّل عبر الرياح والمياه القديمة. يُوفر للزوار إطلالات بانورامية استثنائية على بحر من الرمال والصخور الطباشيرية، ويُعد وجهة لعشاق علم الجيولوجيا والتصوير الجوي.",
      imageUrl:
        "https://commons.wikimedia.org/wiki/Special:FilePath/White_Desert,_Farafra_depression,_Egypt.jpg",
      priceLevel: "free",
      durationHours: 2,
      bestSeasonAr: "من أكتوبر إلى أبريل",
      rating: "4.3",
      isFeatured: false,
      tags: ["طبيعة", "جيولوجيا", "بانوراما", "تصوير جوي"],
      highlights: ["إطلالة بانورامية استثنائية", "تشكيلات جيولوجية نادرة", "مثالي للتصوير بالدرون"],
      tipsAr: "أفضل للتصوير عند شروق الشمس حين تلتقط الضوء الذهبي على الصخور الطباشيرية.",
    },

    {
      // بحيرة قارون الصحراوية — خارجة
      slug: "kharga-oasis-lake",
      nameAr: "بحيرات الخارجة الطبيعية",
      nameEn: "Kharga Natural Lakes",
      categoryId: nature.id,
      cityId: kharga.id,
      shortDescriptionAr: "بُيَيْحات مياه جوفية طبيعية محاطة بغابات نخيل تُشكّل واحة داخل الواحة",
      descriptionAr:
        "مجموعة من البحيرات الصغيرة التي تنبثق من المياه الجوفية في أطراف واحة الخارجة، تحيط بها غابات كثيفة من أشجار النخيل وشجيرات النباتات الصحراوية. تُوفر بيئة طبيعية هادئة لمراقبة الطيور المهاجرة والمستوطنة، وهي مناطق مفضلة للتنزه لدى أهالي الواحة.",
      imageUrl:
        "https://commons.wikimedia.org/wiki/Special:FilePath/Kharga_Oasis_by_Hanne_Siegmeier.jpg",
      priceLevel: "free",
      durationHours: 2,
      bestSeasonAr: "من نوفمبر إلى فبراير",
      rating: "4.1",
      isFeatured: false,
      tags: ["طبيعة", "طيور", "نخيل", "هدوء"],
      highlights: ["بيئة مائية نادرة في الصحراء", "مراقبة الطيور المهاجرة", "تنزه بين النخيل"],
      tipsAr: "الزيارة الصباحية المبكرة أفضل لمراقبة الطيور قبل الحرارة.",
    },

    {
      // نجوم الصخرة الواحدة — الفرافرة
      slug: "inselberg-farafra",
      nameAr: "صخرة العزلاء (إنسلبرغ الفرافرة)",
      nameEn: "Farafra Inselberg",
      categoryId: nature.id,
      cityId: farafra.id,
      shortDescriptionAr: "جبل صخري معزول يرتفع فجأة من قلب السهل الرملي كمنارة طبيعية",
      descriptionAr:
        "تكوين صخري فريد يعرفه الجيولوجيون بمصطلح 'إنسلبرغ' أي الجبل الجزيري، يرتفع منفردًا وسط سهل رملي مستوٍ ليُشكّل معلمًا بصريًا استثنائيًا. يُعد نقطة تنقل تاريخية كانت قوافل الصحراء تستخدمها دليلًا في رحلاتها قبل عصر الملاحة الحديثة.",
      imageUrl:
        "https://commons.wikimedia.org/wiki/Special:FilePath/White_Desert,_Farafra_depression,_Egypt.jpg",
      priceLevel: "free",
      durationHours: 1,
      bestSeasonAr: "طوال العام",
      rating: "4.0",
      isFeatured: false,
      tags: ["طبيعة", "جيولوجيا", "تاريخي", "تصوير"],
      highlights: ["تكوين إنسلبرغ نادر", "محطة قوافل تاريخية", "إطلالة 360 درجة من القمة"],
      tipsAr: "يمكن تسلق الجزء السفلي للحصول على إطلالة شاملة — احضر حذاء مناسبًا.",
    },

    {
      // واحة باريس الصغيرة — مناطق خضراء داخل الفرافرة
      slug: "farafra-palm-groves",
      nameAr: "بساتين النخيل والزيتون في الفرافرة",
      nameEn: "Farafra Palm & Olive Groves",
      categoryId: nature.id,
      cityId: farafra.id,
      shortDescriptionAr: "مشي بين بساتين النخيل والزيتون والمشمش في أصغر واحات الوادي الجديد",
      descriptionAr:
        "الفرافرة معروفة ببساتينها الغنية التي تضم النخيل والزيتون والمشمش والرمان، تُرويها المياه الجوفية العذبة. التجول سيرًا على الأقدام بين هذه البساتين تجربة مسالمة تمنح زائر الصحراء استراحة خضراء مرحّب بها، مع فرصة شراء الإنتاج المحلي مباشرة من المزارعين.",
      imageUrl:
        "https://commons.wikimedia.org/wiki/Special:FilePath/Badr_Museum_-_Farafra_oasis.jpg",
      priceLevel: "free",
      durationHours: 2,
      bestSeasonAr: "من أكتوبر إلى أبريل، موسم الحصاد (سبتمبر-أكتوبر) الأجمل",
      rating: "4.2",
      isFeatured: false,
      tags: ["طبيعة", "بساتين", "مشي", "منتجات محلية"],
      highlights: ["تجربة مشي بين النخيل والزيتون", "شراء منتجات مباشرة من المزارعين", "هدوء تام"],
      tipsAr: "زُرها في موسم الحصاد (سبتمبر-أكتوبر) للمشاركة في قطف التمور.",
    },

    // ═══════════════════════════════════════════════════════════════
    // السياحة العلاجية — Therapeutic (4 مواقع جديدة)
    // ═══════════════════════════════════════════════════════════════

    {
      // عين الجيفة — خارجة — تدفق ساخن طبيعي
      slug: "ain-el-gifa-spring",
      nameAr: "عين الجيفة الكبريتية",
      nameEn: "Ain El-Gifa Sulphur Spring",
      categoryId: therapeutic.id,
      cityId: kharga.id,
      shortDescriptionAr: "عين كبريتية بارزة جنوب الخارجة تتدفق بشكل طبيعي من باطن الأرض",
      descriptionAr:
        "من أبرز العيون الكبريتية في محيط مدينة الخارجة، تتدفق مياهها الغنية بالكبريت والمعادن بشكل طبيعي مستمر طوال العام. اعتمد عليها السكان المحليون تقليديًا في علاج أمراض الجلد والروماتيزم، ولا تزال تستقطب زوارًا من داخل الواحة وخارجها.",
      imageUrl:
        "https://commons.wikimedia.org/wiki/Special:FilePath/Bir_el_Wahed_spring_Farafra.jpg",
      priceLevel: "free",
      durationHours: 2,
      bestSeasonAr: "طوال العام، الشتاء أنسب",
      rating: "4.0",
      isFeatured: false,
      tags: ["علاجي", "كبريتي", "تقليدي", "مجاني"],
      highlights: ["تدفق طبيعي مستمر", "علاج تقليدي لأمراض الجلد", "تجربة محلية أصيلة"],
      tipsAr: "المياه ساخنة جدًا في المنبع — انتظر في المصبّ حيث تبرد إلى درجة مريحة.",
    },

    {
      // عين الداخلة الكبيرة — موط الأولى
      slug: "mut-bir-wahid",
      nameAr: "بئر الواحد الحرارية",
      nameEn: "Bir Wahid Hot Spring - Dakhla",
      categoryId: therapeutic.id,
      cityId: dakhla.id,
      shortDescriptionAr: "عين حرارية دافئة تحيط بها الكثبان الرملية مباشرةً لتجربة تلامس الحرارة والرمال",
      descriptionAr:
        "تجربة فريدة تجمع بين الاستحمام بالمياه الحرارية الدافئة (35-40 درجة) وسط الكثبان الرملية المجاورة. تُعرف لدى السكان المحليين وتُدرج ضمن جولات الداخلة العلاجية، وتختلف عن باقي العيون بقربها من الكثبان مما يتيح الجمع بين العلاج بالمياه والراحة على الرمال.",
      imageUrl:
        "https://commons.wikimedia.org/wiki/Special:FilePath/Bir_el_Wahed_spring_Farafra.jpg",
      priceLevel: "free",
      durationHours: 2,
      bestSeasonAr: "من أكتوبر إلى أبريل",
      rating: "4.3",
      isFeatured: false,
      tags: ["علاجي", "رملي", "طبيعي", "مجاني"],
      highlights: ["جمع بين المياه الحرارية والكثبان الرملية", "دخول مجاني", "هادئة وغير مزدحمة"],
      tipsAr: "الأفضل في المساء — الرمال أبرد والأجواء أكثر سحرًا عند الغروب.",
    },

    {
      // علاج الرمال الساخنة — الخارجة
      slug: "hot-sand-therapy-kharga",
      nameAr: "علاج الرمال الساخنة (الرمل الحار)",
      nameEn: "Hot Sand Therapy - Kharga",
      categoryId: therapeutic.id,
      cityId: kharga.id,
      shortDescriptionAr: "تجربة الدفن في الرمال الصحراوية الساخنة كعلاج شعبي متوارث للروماتيزم",
      descriptionAr:
        "ممارسة علاجية شعبية متوارثة في واحات الصحراء الغربية، يُدفن فيها الجسم جزئيًا في الرمال الصحراوية المحمّاة بالشمس (50-60 درجة) لفترات قصيرة، ويُعتقد تقليديًا بفاعليتها في علاج آلام المفاصل والروماتيزم. تُقدمها مرافق صحية شعبية في الخارجة للراغبين في تجربة الطب التقليدي.",
      imageUrl:
        "https://commons.wikimedia.org/wiki/Special:FilePath/Sand_bath_Egypt_oasis.jpg",
      priceLevel: "low",
      durationHours: 1,
      bestSeasonAr: "من يونيو إلى سبتمبر (ذروة حرارة الرمال)",
      rating: "4.0",
      isFeatured: false,
      tags: ["علاجي", "شعبي", "تقليدي", "تجربة فريدة"],
      highlights: ["علاج شعبي متوارث لآلام المفاصل", "تجربة ثقافية فريدة", "مُشرف طبيًا في المرافق المرخصة"],
      tipsAr: "استشر طبيبك مسبقًا إن كنت تعاني من ضغط الدم أو أمراض القلب.",
    },

    {
      // منتجع عيون الخارجة — مرفق متكامل
      slug: "kharga-wellness-resort",
      nameAr: "منتجع عيون الخارجة الصحي",
      nameEn: "Kharga Wellness Springs Resort",
      categoryId: therapeutic.id,
      cityId: kharga.id,
      shortDescriptionAr: "مرفق صحي متكامل يجمع العيون الحرارية والمعالجة بالطين والمساج الصحراوي",
      descriptionAr:
        "من أحدث مرافق السياحة العلاجية في الوادي الجديد، يجمع في مكان واحد حمامات المياه الحرارية والطبيعية، والعلاج بطين الواحة الغني بالمعادن، وجلسات المساج بزيوت الصحراء المحلية. يستهدف السياح الباحثين عن الراحة والتعافي في أجواء صحراوية هادئة.",
      imageUrl:
        "https://commons.wikimedia.org/wiki/Special:FilePath/Mut_hot_spring_Dakhla_Egypt.jpg",
      priceLevel: "medium",
      durationHours: 4,
      bestSeasonAr: "طوال العام",
      rating: "4.5",
      isFeatured: true,
      tags: ["علاجي", "منتجع", "طين", "مساج", "متكامل"],
      highlights: ["علاج بطين الواحة", "مساج بزيوت صحراوية محلية", "حمامات حرارية وطبيعية"],
      tipsAr: "احجز جلسة العلاج بالطين مسبقًا — الأماكن محدودة يوميًا.",
    },
  ]);

  await db.insert(localProducts).values([
    {
      slug: "oasis-dates",
      nameAr: "تمور الواحات الفاخرة",
      nameEn: "Premium Oasis Dates",
      category: "food",
      descriptionAr:
        "تشتهر واحات الوادي الجديد بزراعة أجود أنواع التمور مثل الصعيدي والبرتمودة، بفضل مياهها الجوفية النقية وشمسها الساطعة طوال العام.",
      imageUrl:
        "https://commons.wikimedia.org/wiki/Special:FilePath/Egypt_oasis_dates_palm.jpg",
      priceRangeAr: "من 60 إلى 150 جنيهًا للكيلو",
      whereToBuyAr: "أسواق الخارجة والداخلة المحلية والمزارع مباشرة",
      isFeatured: true,
    },
    {
      slug: "desert-olive-oil",
      nameAr: "زيت الزيتون الصحراوي البلدي",
      nameEn: "Desert Olive Oil",
      category: "food",
      descriptionAr:
        "تُزرع أشجار الزيتون في مزارع الداخلة والخارجة وتُعصر بطرق تقليدية للحصول على زيت نقي عالي الجودة يُعد من أهم المنتجات الغذائية في المنطقة.",
      imageUrl:
        "https://commons.wikimedia.org/wiki/Special:FilePath/Egyptian_olive_oil.jpg",
      priceRangeAr: "من 150 إلى 300 جنيه لليتر",
      whereToBuyAr: "معاصر الزيتون المحلية في الداخلة",
      isFeatured: false,
    },
    {
      slug: "wild-desert-honey",
      nameAr: "عسل الصحراء البري",
      nameEn: "Wild Desert Honey",
      category: "food",
      descriptionAr:
        "يُنتج من مناحل صغيرة تعتمد على أزهار النخيل والنباتات الصحراوية النادرة، ويتميز بنكهته الفريدة وفوائده الصحية العديدة.",
      imageUrl:
        "https://commons.wikimedia.org/wiki/Special:FilePath/Egypt_desert_honey.jpg",
      priceRangeAr: "من 200 إلى 400 جنيه للكيلو",
      whereToBuyAr: "جمعيات النحالين المحلية بالوادي الجديد",
      isFeatured: true,
    },
    {
      slug: "handmade-pottery",
      nameAr: "الفخار اليدوي التقليدي",
      nameEn: "Traditional Handmade Pottery",
      category: "craft",
      descriptionAr:
        "حرفة متوارثة عبر الأجيال في واحات الوادي الجديد، تُصنع الأواني من طين الواحة المحلي وتُزخرف بنقوش مستوحاة من البيئة الصحراوية.",
      imageUrl:
        "https://commons.wikimedia.org/wiki/Special:FilePath/Egyptian_pottery_traditional.jpg",
      priceRangeAr: "من 50 إلى 250 جنيهًا حسب القطعة",
      whereToBuyAr: "ورش الفخار في قصر الداخلة القديمة",
      isFeatured: false,
    },
    {
      slug: "wool-kilim-rugs",
      nameAr: "سجاد وكليم الواحات الصوفي",
      nameEn: "Oasis Wool Kilim Rugs",
      category: "textile",
      descriptionAr:
        "تُنسج يدويًا من الصوف الطبيعي بألوان وزخارف مستوحاة من البيئة المحلية، وتُعد من أرقى الهدايا التذكارية الأصيلة من المنطقة.",
      imageUrl:
        "https://commons.wikimedia.org/wiki/Special:FilePath/Egyptian_rug_oasis.jpg",
      priceRangeAr: "من 300 إلى 1200 جنيه حسب المقاس",
      whereToBuyAr: "جمعيات الحرف اليدوية في الخارجة",
      isFeatured: true,
    },
    {
      slug: "palm-frond-crafts",
      nameAr: "الحرف اليدوية من الخوص والنخيل",
      nameEn: "Palm-Frond Handicrafts",
      category: "craft",
      descriptionAr:
        "سلال وحقائب وأدوات منزلية تُصنع يدويًا من سعف النخيل بأسلوب صديق للبيئة، وتعكس مهارة الحرفيين المحليين في الاستفادة من موارد الواحة.",
      imageUrl:
        "https://commons.wikimedia.org/wiki/Special:FilePath/Palm_crafts_Egypt.jpg",
      priceRangeAr: "من 40 إلى 180 جنيهًا حسب القطعة",
      whereToBuyAr: "أسواق الحرف اليدوية في الداخلة والفرافرة",
      isFeatured: false,
    },
  ]);

  console.log("Seed complete ✅");
  await pool.end();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
