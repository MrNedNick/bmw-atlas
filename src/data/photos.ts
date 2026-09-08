import type { Photo } from "../domain/catalog";
const editorialPhoto = (url: string, page: string, subject: string): Photo => ({
  url: `images/${url}`,
  page,
  author: "Редакция BMW Atlas",
  license: "Редакционная визуализация",
  licenseUrl: page,
  subject,
  note: "Редакционная визуализация модели; форма сверена с официальной историей BMW.",
});
export const photoByGeneration: Record<string, Photo> = {
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
  ...Object.fromEntries(
    ["e30", "e36", "e46", "e90", "f80", "g80"].map((code) => [
      `bmw-m3-${code}`,
      editorialPhoto(
        `editorial-bmw-m3-${code}.webp`,
        "https://www.bmw-m.com/en/topics/magazine-article-pool/bmw-m3-generationen.html",
        `BMW M3 · ${code.toUpperCase()}`,
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
      ),
    ]),
  ),
};

for (const [generationId, photo] of Object.entries(photoByGeneration)) {
  if (
    generationId === "bmw-x5-g65" ||
    generationId.startsWith("bmw-m") ||
    generationId.startsWith("bmw-7-") ||
    generationId.startsWith("bmw-1-")
  )
    continue;

  photo.url = `images/editorial-${generationId}.webp`;
  photo.note =
    "Редакционная визуализация; исходная фотография сохранена в проекте.";
}
