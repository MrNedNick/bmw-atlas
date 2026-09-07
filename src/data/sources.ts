import type { Source } from "../domain/catalog";
export const sources: Source[] = [
  {
    id: "bmw-isetta-history",
    title: "BMW Isetta · архив семейства",
    publisher: "BMW Group Classic",
    date: "проверено 2026-09-07",
    scope:
      "Общий период март 1955 — май 1962 и выпуск семейства; не разбивка по версиям",
    url: "https://www.bmwgroup-classic.com/en/models/bmw-classics/product-description-page.ad-1181-1.bmw-isetta-model-series.html",
  },
  {
    id: "bmw-production",
    title: "50 лет производства BMW 3 Series",
    publisher: "BMW Group PressClub",
    date: "2025-12-11",
    scope:
      "Производственная история, все перечисленные кузова и полные заводы; исторический срез",
    url: "https://www.press.bmwgroup.com/global/article/detail/T0454448EN/50-years-of-bmw-3-series-production-%E2%80%93-an-international-success-story",
  },
  {
    id: "bmw-history",
    title: "50 лет BMW 3 Series",
    publisher: "BMW Group",
    date: "2025",
    scope: "Поколения, кузовные коды и обновление 2022",
    url: "https://www.bmwgroup.com/en/news/general/2025/50-years-BMW-3-series.html",
  },
  {
    id: "bmw-2024",
    title: "BMW 3 Series · обновление 2024",
    publisher: "BMW Group UK",
    date: "2024-05-29",
    scope:
      "Рынок Великобритании, Sedan/Touring; мощность сохранена в единице hp исходного материала",
    url: "https://www.press.bmwgroup.com/united-kingdom/article/detail/T0442576EN_GB/the-new-bmw-3-series-saloon-and-the-new-bmw-3-series-touring",
  },
  {
    id: "bmw-i3",
    title: "Новый i3 · Neue Klasse",
    publisher: "BMW Group",
    date: "2026-03-19",
    scope:
      "Отдельная электрическая ветвь; дальность и зарядка в материале предварительные и сюда не импортированы",
    url: "https://www.bmwgroup.com/en/news/general/2026/bmwi3.html",
  },
  {
    id: "bmw-i3-production",
    title: "Старт серийного производства BMW i3",
    publisher: "BMW Group",
    date: "2026-08",
    scope: "Новый i3 на заводе в Мюнхене; не I01 и не китайский i3",
    url: "https://www.bmwgroup.com/en/news/general/2026/series-production-of-the-bmw-i3.html",
  },
  {
    id: "vpic",
    title: "NHTSA vPIC · реестр моделей",
    publisher: "NHTSA",
    date: "2026-09-06",
    scope:
      "Названия из регуляторного каталога vPIC; только названия BMW; не полный исторический каталог марки",
    url: "https://vpic.nhtsa.dot.gov/api/",
  },
  {
    id: "bmw-5-history",
    title: "История BMW 5 Series: первые пять поколений",
    publisher: "BMW Group PressClub",
    date: "2010-04-12",
    scope:
      "Ретроспектива E12–E60/E61: продажи и производственные вехи в Дингольфинге по состоянию на апрель 2010",
    url: "https://www.press.bmwgroup.com/usa/article/detail/T0079416EN_US/five-times-around-history-of-the-bmw-5-series",
  },
  {
    id: "bmw-5-f10-milestone",
    title: "BMW 5 Series (F10/F11/F07) · два миллиона продаж",
    publisher: "BMW Group PressClub",
    date: "2016-04-11",
    scope:
      "Шестое поколение, мировые продажи по состоянию на апрель 2016; сравнение с пятым поколением",
    url: "https://www.press.bmwgroup.com/global/article/detail/T0259054EN/two-million-vehicles-sold:-the-bmw-5-series-is-the-world%E2%80%99s-most-successful-business-car-bestseller-for-six-years-and-regular-winner-of-reader-and-expert-polls?language=en",
  },
  {
    id: "bmw-5-g30-launch",
    title: "Новый BMW 5 Series (G30) · старт седьмого поколения",
    publisher: "BMW Group PressClub",
    date: "2016-12-01",
    scope:
      "Технические данные 530i/540i и суммарные продажи первых шести поколений на декабрь 2016",
    url: "https://www.press.bmwgroup.com/global/article/detail/T0264349EN/the-new-bmw-5-series-sedan?language=en",
  },
  {
    id: "bmw-5-i5-premiere",
    title: "Новый BMW 5 Series и BMW i5 · премьера восьмого поколения",
    publisher: "BMW Group PressClub USA",
    date: "2023-05-24",
    scope:
      "Рынок США: 530i, 540i xDrive, i5 eDrive40, i5 M60 xDrive; мощность и момент в источнике указаны в hp/lb-ft",
    url: "https://www.press.bmwgroup.com/usa/article/detail/T0418778EN_US/the-all-new-2024-bmw-5-series?language=en_US",
  },
  {
    id: "bmw-5-dingolfing",
    title: "Старт производства BMW 5 Series (G60) в Дингольфинге",
    publisher: "BMW Group PressClub",
    date: "2023-07-21",
    scope:
      "50 лет производства в Дингольфинге; восемь из примерно двенадцати миллионов автомобилей завода — модели 5 Series",
    url: "https://www.press.bmwgroup.com/global/article/detail/T0424419EN/%E2%80%9Ceight-times-five-is-50%E2%80%9D:-plant-dingolfing-celebrates-start-of-bmw-i5-production-during-anniversary-year?language=en",
  },
];
export const sourceById = Object.fromEntries(sources.map((s) => [s.id, s]));
