import type { Photo } from "../../domain/catalog";
type PhotoMetadata = Omit<Photo, "generationId">;
type PhotoReference = NonNullable<Photo["reference"]>;
const editorialPhoto = (
  url: string,
  page: string,
  subject: string,
  reference?: PhotoReference,
): PhotoMetadata => ({
  url: `images/${url}`,
  page,
  author: "Редакция BMW Atlas",
  license: "Редакционная визуализация",
  licenseUrl: page,
  subject,
  note: reference
    ? "Редакционная визуализация на основе точного официального пресс-снимка; конструктивные признаки проверены отдельно."
    : "Редакционная визуализация; требуется повторная проверка по точному референсному снимку.",
  reference,
});
const m5References: Record<string, PhotoReference> = {
  e28: {
    publisher: "BMW Group PressClub",
    page: "https://www.press.bmwgroup.com/global/photo/detail/P90560208/",
    imageUrl:
      "https://mediapool.bmwgroup.com/download/edown/pressclub/publicq?actEvent=image&attachment=1&dokNo=P90560208",
    localFile: "references/images/P90560208-bmw-m5-e28.jpg",
    imageId: "P90560208",
    phase: "launch",
    verifiedDetails: [
      "четырёхдверный кузов M5 E28",
      "узкая двойная решётка и четыре круглые фары",
      "тонкие бамперы и чёрные боковые молдинги",
      "короткий передний свес и классическая линия крыши",
      "расширенные арки и многоспицевые колёса",
    ],
  },
  e34: {
    publisher: "BMW Group PressClub",
    page: "https://www.press.bmwgroup.com/global/photo/detail/P90560209/",
    imageUrl:
      "https://mediapool.bmwgroup.com/download/edown/pressclub/publicq?actEvent=image&attachment=1&dokNo=P90560209",
    localFile: "references/images/P90560209-bmw-m5-e34.jpg",
    imageId: "P90560209",
    phase: "launch",
    verifiedDetails: [
      "четырёхдверный кузов M5 E34",
      "узкая двойная решётка и четыре круглые фары",
      "прямоугольные внешние зеркала и чёрные молдинги",
      "характерная линия багажника и тонкие бамперы",
      "пятиспицевые M-колёса и пропорции седана",
    ],
  },
  e39: {
    publisher: "BMW Group PressClub",
    page: "https://www.press.bmwgroup.com/global/photo/detail/P90560210/",
    imageUrl:
      "https://mediapool.bmwgroup.com/download/edown/pressclub/publicq?actEvent=image&attachment=1&dokNo=P90560210",
    localFile: "references/images/P90560210-bmw-m5-e39.jpg",
    imageId: "P90560210",
    phase: "launch",
    verifiedDetails: [
      "четырёхдверный кузов M5 E39",
      "двойная решётка с хромированной окантовкой",
      "четыре круглых модуля фар под прозрачными линзами",
      "M-бамперы, боковые молдинги и расширенные арки",
      "классические многоспицевые M-колёса",
    ],
  },
  e60: {
    publisher: "BMW Group PressClub",
    page: "https://www.press.bmwgroup.com/global/photo/detail/P90560211/",
    imageUrl:
      "https://mediapool.bmwgroup.com/download/edown/pressclub/publicq?actEvent=image&attachment=1&dokNo=P90560211",
    localFile: "references/images/P90560211-bmw-m5-e60.jpg",
    imageId: "P90560211",
    phase: "launch",
    verifiedDetails: [
      "четырёхдверный кузов M5 E60",
      "плавная линия капота и характерная передняя оптика",
      "M-жабер на переднем крыле",
      "широкие арки и боковые юбки",
      "серебристые многоспицевые M-колёса",
    ],
  },
  f10: {
    publisher: "BMW Group PressClub",
    page: "https://www.press.bmwgroup.com/global/photo/detail/P90560212/",
    imageUrl:
      "https://mediapool.bmwgroup.com/download/edown/pressclub/publicq?actEvent=image&attachment=1&dokNo=P90560212",
    localFile: "references/images/P90560212-bmw-m5-f10.jpg",
    imageId: "P90560212",
    phase: "launch",
    verifiedDetails: [
      "четырёхдверный кузов M5 F10",
      "сдвоенная M-решётка и фары с двойными световыми модулями",
      "широкий передний бампер с боковыми воздухозаборниками",
      "M-жабер на переднем крыле",
      "чёрные многоспицевые M-колёса и пропорции седана",
    ],
  },
  f90: {
    publisher: "BMW Group PressClub",
    page: "https://www.press.bmwgroup.com/global/photo/detail/P90560213/",
    imageUrl:
      "https://mediapool.bmwgroup.com/download/edown/pressclub/publicq?actEvent=image&attachment=1&dokNo=P90560213",
    localFile: "references/images/P90560213-bmw-m5-f90.jpg",
    imageId: "P90560213",
    phase: "launch",
    verifiedDetails: [
      "четырёхдверный кузов M5 F90",
      "M-решётка и узкие LED-фары",
      "глубокие воздухозаборники переднего бампера",
      "M-жабер на переднем крыле и широкие арки",
      "чёрные многоспицевые M-колёса",
    ],
  },
  g90: {
    publisher: "BMW Group PressClub",
    page: "https://www.press.bmwgroup.com/global/photo/detail/P90557399/the-all-new-bmw-m5-06/2024",
    imageUrl:
      "https://mediapool.bmwgroup.com/cache/P9/202406/P90557399/P90557399-the-all-new-bmw-m5-06-2024-2250px.jpg",
    localFile: "references/images/P90557399-bmw-m5-g90.jpg",
    imageId: "P90557399",
    phase: "launch",
    verifiedDetails: [
      "четырёхдверный кузов M5 Sedan G90",
      "M-решётка с горизонтальными внутренними планками",
      "форма фар и переднего бампера",
      "широкие передние крылья",
      "зарядный лючок на переднем левом крыле",
      "передние M-колёса и пропорции седана",
    ],
  },
};
const photoByGeneration: Record<string, PhotoMetadata> = {
  ...Object.fromEntries(
    ["e8x", "f20", "f40", "f70"].map((code) => [
      `bmw-1-${code}`,
      editorialPhoto(
        `editorial-bmw-1-${code}.webp`,
        code === "f70"
          ? "https://www.press.bmwgroup.com/global/article/detail/T0442625EN/the-all-new-bmw-1-series?language=en"
          : "https://www.press.bmwgroup.com/global/article/topic/4102/1-series",
        `BMW 1 Series · ${code.toUpperCase()}`,
      ),
    ]),
  ),
  "bmw-e21": {
    url: "images/bmw-e21.jpg",
    page: "https://commons.wikimedia.org/wiki/File:BMW_316-E21_Front-view.JPG",
    author: "Luc106",
    license: "Public domain",
    licenseUrl:
      "https://commons.wikimedia.org/wiki/File:BMW_316-E21_Front-view.JPG#Licensing",
    subject: "BMW 316 E21",
  },
  "bmw-e30": {
    url: "images/bmw-e30.jpg",
    page: "https://commons.wikimedia.org/wiki/File:BMW_E30_Kombi_front_20071001.jpg",
    author: "Rudolf Stricker",
    license: "CC BY-SA 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0/",
    subject: "BMW E30 Touring",
  },
  "bmw-e36": {
    url: "images/bmw-e36.jpg",
    page: "https://commons.wikimedia.org/wiki/File:BMW_E36_front_95.jpg",
    author: "Icantfocus1222",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
    subject: "BMW 325i E36 Cabriolet · 1995",
  },
  "bmw-e46": {
    url: "images/bmw-e46.jpg",
    page: "https://commons.wikimedia.org/wiki/File:E46_BMW_M3_CS_Front.jpg",
    author: "Xboxcarsforza1",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
    subject: "BMW M3 CS E46 · спортивная версия",
  },
  "bmw-e90": {
    url: "images/bmw-e90.jpg",
    page: "https://commons.wikimedia.org/wiki/File:BMW_E90_kallerna.jpg",
    author: "kallerna",
    license: "CC BY-SA 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0",
    subject: "BMW 320i E90 · 2005",
  },
  "bmw-f30": {
    url: "images/bmw-f30.jpg",
    page: "https://commons.wikimedia.org/wiki/File:2016_BMW_320i_(F30_LCI_Indonesia)_looking_from_front.jpg",
    author: "VulcanSphere",
    license: "CC BY 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by/4.0",
    subject: "BMW 320i F30 LCI · Индонезия, 2016",
  },
  "bmw-e12": {
    url: "images/bmw-e12.jpg",
    page: "https://commons.wikimedia.org/wiki/File:BMW-E12-Front.jpg",
    author: "Pierre Scheidegger",
    license: "Public domain",
    licenseUrl:
      "https://commons.wikimedia.org/wiki/File:BMW-E12-Front.jpg#Licensing",
    subject: "BMW E12",
  },
  "bmw-e28": {
    url: "images/bmw-e28.jpg",
    page: "https://commons.wikimedia.org/wiki/File:BMW_E28_front_20071012.jpg",
    author: "Rudolf Stricker",
    license: "CC BY-SA 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0/",
    subject: "BMW E28",
  },
  "bmw-e34": {
    url: "images/bmw-e34.jpg",
    page: "https://commons.wikimedia.org/wiki/File:BMW_E34_front_20071129.jpg",
    author: "Rudolf Stricker",
    license: "CC BY-SA 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0/",
    subject: "BMW E34",
  },
  "bmw-e39": {
    url: "images/bmw-e39.jpg",
    page: "https://commons.wikimedia.org/wiki/File:BMW_E39_front_20081009.jpg",
    author: "Rudolf Stricker",
    license: "Attribution",
    licenseUrl:
      "https://commons.wikimedia.org/wiki/File:BMW_E39_front_20081009.jpg#Licensing",
    subject: "BMW E39",
  },
  "bmw-e60": {
    url: "images/bmw-e60.jpg",
    page: "https://commons.wikimedia.org/wiki/File:BMW_E60_front_20080417.jpg",
    author: "Rudolf Stricker",
    license: "CC BY-SA 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0/",
    subject: "BMW E60",
  },
  "bmw-f10": {
    url: "images/bmw-f10.jpg",
    page: "https://commons.wikimedia.org/wiki/File:White_BMW_5_Series_F10_front_view.jpg",
    author: "Renée Kools",
    license: "CC BY 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by/4.0",
    subject: "BMW F10",
  },
  "bmw-g30": {
    url: "images/bmw-g30.jpg",
    page: "https://commons.wikimedia.org/wiki/File:BMW_523i_Luxury_(G30)_front.jpg",
    author: "Tokumeigakarinoaoshima",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
    subject: "BMW 523i Luxury G30",
  },
  "bmw-neue": {
    url: "images/bmw-neue.jpg",
    page: "https://commons.wikimedia.org/wiki/File:BMW_i3_50_xDrive_First_Edition_(NA0)_%E2%80%93_f2_20082026.jpg",
    author: "© M 93 / Wikimedia Commons",
    license: "CC BY-SA 3.0 de",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0/de/deed.en",
    subject: "BMW i3 50 xDrive First Edition · NA0, 2026",
  },
  "bmw-x5-e53": {
    url: "images/bmw-x5-e53.jpg",
    page: "https://commons.wikimedia.org/wiki/File:2002_BMW_X5_Sport_Automatic_4.4_Front.jpg",
    author: "Vauxford",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
    subject: "BMW X5 4.4 · E53, 2002",
  },
  "bmw-x5-e70": {
    url: "images/bmw-x5-e70.jpg",
    page: "https://commons.wikimedia.org/wiki/File:BMW_X5_E70_FRONT.jpg",
    author: "Asmuelle",
    license: "Public domain",
    licenseUrl:
      "https://commons.wikimedia.org/wiki/File:BMW_X5_E70_FRONT.jpg#Licensing",
    subject: "BMW X5 · E70, 2008",
  },
  "bmw-x5-f15": {
    url: "images/bmw-x5-f15.jpg",
    page: "https://commons.wikimedia.org/wiki/File:BMW-X5-F15_Front.JPG",
    author: "Luc106",
    license: "Public domain",
    licenseUrl:
      "https://commons.wikimedia.org/wiki/File:BMW-X5-F15_Front.JPG#Licensing",
    subject: "BMW X5 · F15, 2013",
  },
  "bmw-x5-g05": {
    url: "images/bmw-x5-g05.jpg",
    page: "https://commons.wikimedia.org/wiki/File:BMW_X5_xDrive35d_(G05)_front.jpg",
    author: "Tokumeigakarinoaoshima",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
    subject: "BMW X5 xDrive35d · G05, 2019",
  },
  "bmw-x5-g65": {
    url: "images/editorial-bmw-x5-g65.webp",
    page: "https://www.press.bmwgroup.com/global/photo/detail/P90646134/BMW-X5-40-xDrive-06-2026",
    author: "BMW Group PressClub",
    license: "Media material",
    licenseUrl:
      "https://www.press.bmwgroup.com/global/photo/detail/P90646134/BMW-X5-40-xDrive-06-2026",
    subject: "BMW X5 40 xDrive · G65, 2026",
    note: "Редакционная визуализация; исходный пресс-снимок сохранён в проекте.",
  },
  ...Object.fromEntries(
    ["e83", "f25", "g01", "g45"].map((code) => [
      `bmw-x3-${code}`,
      editorialPhoto(
        `editorial-bmw-x3-${code}.webp`,
        code === "g45"
          ? "https://www.press.bmwgroup.com/global/article/detail/T0442377EN/the-new-bmw-x3"
          : code === "g01"
            ? "https://www.press.bmwgroup.com/global/article/detail/T0271778EN/the-new-bmw-x3"
            : "https://www.press.bmwgroup.com/global/article/detail/T0194923EN/15-years-of-bmw-x-models",
        `BMW X3 · ${code.toUpperCase()}`,
      ),
    ]),
  ),
  ...Object.fromEntries(
    ["e23", "e32", "e38", "e65", "f01", "g11", "g70"].map((code) => [
      `bmw-7-${code}`,
      editorialPhoto(
        `editorial-bmw-7-${code}.webp`,
        code === "g70"
          ? "https://www.press.bmwgroup.com/global/article/detail/T0380173EN/the-new-bmw-7-series"
          : "https://www.press.bmwgroup.com/global/tv-footage/detail/PF0004456/the-bmw-7-series-1977-2015/3",
        `BMW 7 Series · ${code.toUpperCase()}`,
      ),
    ]),
  ),
  "bmw-m1-e26": editorialPhoto(
    "editorial-bmw-m1.webp",
    "https://www.bmw-m.com/en/topics/magazine-article-pool/bmw-m1-from-procar-to-icon.html",
    "BMW M1 · E26, 1978",
  ),
  "bmw-z3-m-e36": editorialPhoto(
    "editorial-bmw-z3-m-e36.webp",
    "https://www.bmwgroup-classic.com/en/models/bmw-classics/product-description-page.ad-2760-1.bmw-z3-m-roadster-e36.html",
    "BMW Z3 M Roadster · E36/7, 1997",
    {
      publisher: "BMW Group PressClub",
      page: "https://www.press.bmwgroup.com/global/photo/detail/P90497129/BMW-Z3-M-Roadster-Imola-Red-03-2023",
      imageUrl:
        "https://mediapool.bmwgroup.com/download/edown/pressclub/publicq?actEvent=image&attachment=1&dokNo=P90497129",
      localFile: "references/images/P90497129-bmw-z3-m-e36-front.jpg",
      imageId: "P90497129",
      phase: "model-year",
      verifiedDetails: [
        "открытый кузов Z3 M Roadster E36/7",
        "двойная решётка и овальные фары первого Z3",
        "M-жабер на переднем крыле",
        "низкий M-бампер с центральным воздухозаборником",
        "дуги безопасности за сиденьями",
        "расширенные арки и пятиспицевые колёса M",
      ],
    },
  ),
  "bmw-z4-m-e85": editorialPhoto(
    "editorial-bmw-z4-m-e85.webp",
    "https://www.press.bmwgroup.com/usa/article/detail/T0019155EN_US?forceSitePreference=DESKTOP",
    "BMW Z4 M Roadster · E85, 2006",
    {
      publisher: "BMW Group PressClub",
      page: "https://www.press.bmwgroup.com/global/photo/detail/P0026148/bmw-z4-m-roadster-02/2006?language=en",
      imageUrl:
        "https://mediapool.bmwgroup.com/download/edown/pressclub/public?actEvent=zoomImage&dokNo=P0026148&filename=P0026148.JPG",
      localFile: "references/images/P0026148-bmw-z4-m-e85.jpg",
      imageId: "P0026148",
      phase: "launch",
      verifiedDetails: [
        "открытый кузов Z4 M Roadster E85",
        "длинный капот и короткая задняя часть первого Z4",
        "дуги безопасности за сиденьями",
        "M-жабер на переднем крыле",
        "широкие арки и многоспицевые колёса M",
        "четыре патрубка выпускной системы",
      ],
    },
  ),
  "bmw-m2-f87": editorialPhoto(
    "editorial-bmw-m2-f87.webp",
    "https://www.press.bmwgroup.com/global/article/detail/T0238042EN/the-new-bmw-m2-coupe",
    "BMW M2 Coupé · F87, 2016",
    {
      publisher: "BMW Group PressClub",
      page: "https://www.press.bmwgroup.com/global/photo/detail/P90210238/the-new-bmw-m2-coupe-07/2016",
      imageUrl:
        "https://mediapool.bmwgroup.com/download/edown/pressclub/publicq?actEvent=image&attachment=1&dokNo=P90210238",
      localFile: "references/images/P90210238-bmw-m2-f87.jpg",
      imageId: "P90210238",
      phase: "launch",
      verifiedDetails: [
        "двухдверный кузов Coupé F87",
        "раздельные M-решётки с вертикальными планками",
        "круглые световые модули фар",
        "центральная сетка и боковые воздухозаборники переднего бампера",
        "M-жабер на переднем крыле",
        "расширенные арки и штатные M-колёса",
      ],
    },
  ),
  "bmw-m2-g87": editorialPhoto(
    "editorial-bmw-m2-g87.webp",
    "https://www.press.bmwgroup.com/global/article/detail/T0442878EN/the-new-bmw-m2",
    "BMW M2 · G87, обновление 2024",
    {
      publisher: "BMW Group PressClub",
      page: "https://www.press.bmwgroup.com/global/photo/detail/P90553471/the-new-bmw-m2-06/2024",
      imageUrl:
        "https://mediapool.bmwgroup.com/download/edown/pressclub/publicq?actEvent=image&attachment=1&dokNo=P90553471",
      localFile: "references/images/P90553471-bmw-m2-g87-2024.jpg",
      imageId: "P90553471",
      phase: "model-year",
      verifiedDetails: [
        "двухдверный кузов Coupé G87",
        "горизонтальная безрамочная M-решётка",
        "трёхсекционный нижний воздухозаборник",
        "фары с одиночными модулями и U-образными нижними световодами",
        "расширенные колёсные арки и боковые пороги",
        "передние 19-дюймовые и задние 20-дюймовые M-колёса",
      ],
    },
  ),
  "bmw-m4-g82-lci": editorialPhoto(
    "editorial-bmw-m4-g82-lci.webp",
    "https://www.press.bmwgroup.com/global/article/detail/T0439308EN/the-new-bmw-m4-coup%C3%A9-the-new-bmw-m4-convertible",
    "BMW M4 Competition Coupé · G82 LCI, 2024",
    {
      publisher: "BMW Group PressClub",
      page: "https://www.press.bmwgroup.com/global/photo/detail/P90536834/The-new-BMW-M4-Coup%C3%A9-01-24",
      imageUrl:
        "https://mediapool.bmwgroup.com/cache/P9/202401/P90536834/P90536834-the-new-bmw-m4-coup-2000px.jpg",
      localFile: "references/images/P90536834-bmw-m4-g82-lci.jpg",
      imageId: "P90536834",
      phase: "facelift",
      verifiedDetails: [
        "фары LCI 2024 года",
        "вертикальная решётка радиатора",
        "передний бампер и воздухозаборники",
        "боковой M-жабер",
        "штатный рисунок колёс",
        "двухдверный кузов G82",
      ],
    },
  ),
  "bmw-xm-g09": editorialPhoto(
    "editorial-bmw-xm-g09.webp",
    "https://www.press.bmwgroup.com/global/article/detail/T0403971EN/the-first-ever-bmw-xm",
    "BMW XM · G09, 2023",
    {
      publisher: "BMW Group PressClub",
      page: "https://www.press.bmwgroup.com/global/photo/detail/P90498033/the-first-ever-bmw-xm-marina-bay-blue-metallic-on-location-03-2023",
      imageUrl:
        "https://mediapool.bmwgroup.com/cache/P9/202303/P90498033/P90498033-the-first-ever-bmw-xm-marina-bay-blue-metallic-on-location-03-2023-2250px.jpg",
      localFile: "references/images/P90498033-bmw-xm-g09.jpg",
      imageId: "P90498033",
      phase: "launch",
      verifiedDetails: [
        "двухъярусная передняя оптика",
        "контур и внутренние планки решётки",
        "нижние воздухозаборники",
        "золотая оконная и поясная отделка",
        "форма колёсных арок",
        "пропорции кузова G09",
      ],
    },
  ),
  "bmw-i8-i12-lci": editorialPhoto(
    "editorial-bmw-i8-i12-lci.webp",
    "https://www.press.bmwgroup.com/global/article/detail/T0276225EN/the-new-bmw-i8-roadster-the-new-bmw-i8-coupe",
    "BMW i8 Coupé · I12 LCI, 2018",
    {
      publisher: "BMW Group PressClub",
      page: "https://www.press.bmwgroup.com/global/photo/detail/P90285391/the-new-bmw-i8-coupe-11/2017",
      imageUrl:
        "https://mediapool.bmwgroup.com/cache/P9/201711/P90285391/P90285391-the-new-bmw-i8-coupe-11-2017-2250px.jpg",
      localFile: "references/images/P90285391-bmw-i8-i12-lci.jpg",
      imageId: "P90285391",
      phase: "facelift",
      verifiedDetails: [
        "закрытый кузов Coupé I12",
        "фары и передний бампер LCI",
        "линия крыши и задняя стойка",
        "чёрный боковой аэродинамический элемент",
        "скульптура дверей и заднего крыла",
        "штатный рисунок колёс",
      ],
    },
  ),
  "bmw-m6-e24": editorialPhoto(
    "editorial-bmw-m6-e24.webp",
    "https://www.bmw-m.com/en/topics/magazine-article-pool/bmw-m6-coupe-f13.html",
    "BMW M635 CSi · E24",
    {
      publisher: "BMW Group PressClub",
      page: "https://www.press.bmwgroup.com/global/photo/detail/P90095008/bmw-m635csi-05/2012?language=en",
      imageUrl:
        "https://mediapool.bmwgroup.com/download/edown/pressclub/publicq?actEvent=image&attachment=1&dokNo=P90095008",
      localFile: "references/images/P90095008-bmw-m6-e24.jpg",
      imageId: "P90095008",
      phase: "launch",
      verifiedDetails: [
        "двухдверный кузов M635 CSi E24",
        "узкая двойная решётка радиатора",
        "четыре круглые фары в чёрной панели",
        "тонкие хромированные бамперы и оконная окантовка",
        "расширенные арки и классические многоспицевые колёса",
        "длинный капот и короткий задний свес",
      ],
    },
  ),
  "bmw-m6-e63": editorialPhoto(
    "editorial-bmw-m6-e63.webp",
    "https://www.bmw-m.com/en/topics/magazine-article-pool/bmw-m6-coupe-f13.html",
    "BMW M6 Coupé · E63, 2005",
    {
      publisher: "BMW Group PressClub",
      page: "https://www.press.bmwgroup.com/global/photo/detail/P0018078/bmw-m6-03/2005?language=en",
      imageUrl:
        "https://mediapool.bmwgroup.com/download/edown/pressclub/public?actEvent=fourMB&dokNo=P0018078&filename=P0018078.zip",
      localFile: "references/images/P0018078-bmw-m6-e63.jpg",
      imageId: "P0018078",
      phase: "launch",
      verifiedDetails: [
        "двухдверный кузов M6 Coupé E63",
        "длинный капот и ниспадающая линия крыши",
        "M-жабер на переднем крыле",
        "контурная карбоновая крыша",
        "широкие задние арки",
        "четыре патрубка выпускной системы",
      ],
    },
  ),
  "bmw-m6-f13": editorialPhoto(
    "editorial-bmw-m6-f13.webp",
    "https://www.press.bmwgroup.com/global/article/detail/T0124722EN/the-new-bmw-m6-coupe-and-convertible",
    "BMW M6 Coupé · F13, 2012",
    {
      publisher: "BMW Group PressClub",
      page: "https://www.press.bmwgroup.com/global/photo/detail/P90097528/the-new-bmw-m6-coupe-06/2012",
      imageUrl:
        "https://mediapool.bmwgroup.com/download/edown/pressclub/publicq?actEvent=image&attachment=1&dokNo=P90097528",
      localFile: "references/images/P90097528-bmw-m6-f13.jpg",
      imageId: "P90097528",
      phase: "launch",
      verifiedDetails: [
        "двухдверный кузов M6 Coupé F13",
        "двойная M-решётка с вертикальными планками",
        "двойные круглые модули передней оптики",
        "широкий передний бампер с центральной сеткой и боковыми воздухозаборниками",
        "контурная карбоновая крыша",
        "расширенные арки и пропорции купе",
      ],
    },
  ),
  "bmw-m8-f92": editorialPhoto(
    "editorial-bmw-m8-f92.webp",
    "https://www.press.bmwgroup.com/global/article/detail/T0296150EN/the-new-bmw-m8-coupe-and-bmw-m8-competition-coupe-the-new-bmw-m8-convertible-and-bmw-m8-competition-convertible",
    "BMW M8 Competition Coupé · F92, 2019",
    {
      publisher: "BMW Group PressClub",
      page: "https://www.press.bmwgroup.com/global/photo/detail/P90348773/the-all-new-bmw-m8-competition-coupe-06/2019",
      imageUrl:
        "https://mediapool.bmwgroup.com/download/edown/pressclub/publicq?actEvent=image&attachment=1&dokNo=P90348773",
      localFile: "references/images/P90348773-bmw-m8-f92.jpg",
      imageId: "P90348773",
      phase: "launch",
      verifiedDetails: [
        "двухдверный кузов M8 Competition Coupé F92",
        "низкая широкая передняя часть с двойной M-решёткой",
        "узкие угловатые LED-фары",
        "глубокий центральный и боковые воздухозаборники переднего бампера",
        "карбоновые корпуса зеркал",
        "скульптура капота и пропорции купе",
      ],
    },
  ),
  ...Object.fromEntries(
    ["e30", "e36", "e46", "e90", "f80", "g80"].map((code) => [
      `bmw-m3-${code}`,
      editorialPhoto(
        `editorial-bmw-m3-${code}.webp`,
        "https://www.bmw-m.com/en/topics/magazine-article-pool/bmw-m3-generationen.html",
        `BMW M3 · ${code.toUpperCase()}`,
        code === "g80"
          ? {
              publisher: "BMW Group PressClub",
              page: "https://www.press.bmwgroup.com/global/photo/detail/P90551007/the-new-bmw-m3-sedan-05/2024",
              imageUrl:
                "https://mediapool.bmwgroup.com/download/edown/pressclub/publicq?actEvent=image&attachment=1&dokNo=P90551007",
              localFile: "references/images/P90551007-bmw-m3-g80-front.jpg",
              imageId: "P90551007",
              phase: "facelift",
              verifiedDetails: [
                "четырёхдверный кузов M3 Sedan G80",
                "вертикальная M-решётка с горизонтальными двойными планками",
                "фары с двойными световыми модулями",
                "передний бампер с крупными боковыми воздухозаборниками",
                "M-жабер на переднем крыле",
                "расширенные арки и чёрные многоспицевые M-колёса",
              ],
            }
          : undefined,
      ),
    ]),
  ),
  ...Object.fromEntries(
    ["e28", "e34", "e39", "e60", "f10", "f90", "g90"].map((code) => [
      `bmw-m5-${code}`,
      editorialPhoto(
        `editorial-bmw-m5-${code}.webp`,
        "https://www.bmw-m.com/en/topics/magazine-article-pool/the-generations-of-the-bmw-m5-an-overview.html",
        `BMW M5 · ${code.toUpperCase()}`,
        m5References[code],
      ),
    ]),
  ),
  "bmw-r32-1923": editorialPhoto(
    "editorial-bmw-r32-1923.webp",
    "https://www.bmwgroup-classic.com/de/modelle/bmw-motorrad-klassiker/product-description-page.md-569-1.bmw-r-32.html",
    "BMW R 32 · 1923",
  ),
  ...Object.fromEntries(
    ["r80", "r1100", "r1200", "r1250", "r1300"].map((code) => [
      `bmw-gs-${code}`,
      editorialPhoto(
        `editorial-bmw-gs-${code}.webp`,
        code === "r1300"
          ? "https://www.press.bmwgroup.com/global/article/detail/T0437059EN/the-new-bmw-r-1300-gs"
          : code === "r1250"
            ? "https://www.press.bmwgroup.com/global/article/detail/T0421767EN/bmw-motorrad-celebrates-one-millionth-gs-with-boxer-engine"
            : "https://www.bmw-motorrad.com/content/dam/bmwmotorradnsc/common/downloads/gs/BMW_30yearsGS_Magazin.pdf",
        `BMW ${code.replace("r", "R ").toUpperCase()} GS`,
      ),
    ]),
  ),
  "bmw-g20": {
    url: "images/editorial-bmw-g20.webp",
    page: "https://commons.wikimedia.org/wiki/File:BMW_G20_330i_in_blue.jpg",
    author: "Damian B Oh",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
    subject: "BMW G20 330i · 2020",
    note: "Редакционная визуализация; исходный снимок сохранён в проекте.",
  },
  "bmw-g60": {
    url: "images/editorial-bmw-g60.webp",
    page: "https://commons.wikimedia.org/wiki/File:BMW_520i_G60_Oxide_Grey_Metallic_01.jpg",
    author: "Ethan Llamas",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
    subject: "BMW 520i G60 · 2025",
    note: "Редакционная визуализация; исходный снимок сохранён в проекте.",
  },
  "bmw-isetta-family": {
    url: "images/editorial-bmw-isetta.webp",
    page: "https://commons.wikimedia.org/wiki/File:BMW_250-Isetta.JPG",
    author: "Luc106",
    license: "Public domain",
    licenseUrl:
      "https://commons.wikimedia.org/wiki/File:BMW_250-Isetta.JPG#Licensing",
    subject: "BMW Isetta 250 · версия на фотографии; общий обзор семейства",
    note: "Редакционная визуализация; исходная фотография сохранена в проекте.",
  },
};

for (const [generationId, photo] of Object.entries(photoByGeneration)) {
  if (
    generationId === "bmw-x5-g65" ||
    generationId.startsWith("bmw-m") ||
    generationId.startsWith("bmw-7-") ||
    generationId.startsWith("bmw-1-") ||
    generationId.startsWith("bmw-x3-") ||
    generationId === "bmw-r32-1923" ||
    generationId.startsWith("bmw-gs-") ||
    generationId === "bmw-isetta-family"
  )
    continue;

  photo.url = `images/editorial-${generationId}.webp`;
  photo.note =
    "Редакционная визуализация; исходная фотография сохранена в проекте.";
}

export const assetByGeneration: Record<string, Photo> = Object.fromEntries(
  Object.entries(photoByGeneration).map(([generationId, photo]) => [
    generationId,
    { generationId, ...photo },
  ]),
);

export function validateAssetRegistry(
  assets: Record<string, Photo>,
  generationIds: readonly string[],
) {
  const errors: string[] = [];
  const allowed = new Set(generationIds);
  for (const [generationId, asset] of Object.entries(assets)) {
    if (!allowed.has(generationId))
      errors.push(`orphan asset: ${generationId}`);
    if (asset.generationId !== generationId)
      errors.push(`asset generation mismatch: ${generationId}`);
    if (
      !asset.url.startsWith("images/") ||
      !/\.(webp|jpe?g|png)$/i.test(asset.url)
    )
      errors.push(`invalid local asset: ${generationId}`);
    if (
      !asset.author.trim() ||
      !asset.license.trim() ||
      !asset.subject.trim() ||
      !asset.page.startsWith("https://") ||
      !asset.licenseUrl.startsWith("https://")
    )
      errors.push(`incomplete attribution: ${generationId}`);
    if (asset.reference) {
      if (
        !asset.reference.publisher.trim() ||
        !asset.reference.page.startsWith("https://") ||
        !asset.reference.imageUrl.startsWith("https://") ||
        !asset.reference.localFile.startsWith("references/images/") ||
        !asset.reference.imageId.trim() ||
        asset.reference.verifiedDetails.length < 5 ||
        asset.reference.verifiedDetails.some((detail) => !detail.trim())
      )
        errors.push(`incomplete visual reference: ${generationId}`);
    }
  }
  return errors;
}
