import type { Photo } from "../domain/catalog";
import { atelierPhotos } from "./atelier-photos";
import type { MessageKey } from "../i18n";
export interface AtelierCar {
  id: string;
  manufacturer: "ALPINA";
  name: string;
  baseFamilyId: string;
  code: string;
  body: "sedan" | "touring";
  phase: "launch" | "facelift" | "limited";
  asOf: string;
  powerKw: number;
  powerPs: number;
  torqueNm: number;
  topSpeedKmh: number;
  zeroTo100: number;
  engine: string;
  story: MessageKey;
  source: string;
  photoBrief: MessageKey;
  outputFile: string;
  photo: Photo;
  editionLimit?: number;
  editionScope?: string;
}
export const atelierCars: AtelierCar[] = [
  {
    id: "alpina-b3-sedan-launch",
    photo: atelierPhotos["alpina-b3-sedan-launch"],
    manufacturer: "ALPINA",
    name: "B3 Sedan",
    baseFamilyId: "bmw-3-series",
    code: "G20",
    body: "sedan",
    phase: "launch",
    asOf: "2020-09-30",
    powerKw: 340,
    powerPs: 462,
    torqueNm: 700,
    topSpeedKmh: 303,
    zeroTo100: 3.8,
    engine: "3.0 I6 Bi-Turbo",
    story: "atelier.cars.b3.early",
    source: "alpina-b3-sedan-2020",
    photoBrief: "alpina-b3-sedan-launch.photo",
    outputFile: "public/images/editorial-alpina-b3-sedan-launch.webp",
  },
  {
    id: "alpina-b3-touring-launch",
    photo: atelierPhotos["alpina-b3-touring-launch"],
    manufacturer: "ALPINA",
    name: "B3 Touring",
    baseFamilyId: "bmw-3-series",
    code: "G21",
    body: "touring",
    phase: "launch",
    asOf: "2020-09-30",
    powerKw: 340,
    powerPs: 462,
    torqueNm: 700,
    topSpeedKmh: 300,
    zeroTo100: 3.9,
    engine: "3.0 I6 Bi-Turbo",
    story: "atelier.cars.b3.early",
    source: "alpina-b3-touring-2020",
    photoBrief: "alpina-b3-touring-launch.photo",
    outputFile: "public/images/editorial-alpina-b3-touring-launch.webp",
  },
  {
    id: "alpina-b3-sedan-facelift",
    photo: atelierPhotos["alpina-b3-sedan-facelift"],
    manufacturer: "ALPINA",
    name: "B3 Sedan",
    baseFamilyId: "bmw-3-series",
    code: "G20",
    body: "sedan",
    phase: "facelift",
    asOf: "2022-05-25",
    powerKw: 364,
    powerPs: 495,
    torqueNm: 730,
    topSpeedKmh: 305,
    zeroTo100: 3.6,
    engine: "3.0 I6 Bi-Turbo",
    story: "atelier.cars.b3.lci",
    source: "alpina-b3-update-2022",
    photoBrief: "alpina-b3-sedan-facelift.photo",
    outputFile: "public/images/editorial-alpina-b3-sedan-facelift.webp",
  },
  {
    id: "alpina-b3-touring-facelift",
    photo: atelierPhotos["alpina-b3-touring-facelift"],
    manufacturer: "ALPINA",
    name: "B3 Touring",
    baseFamilyId: "bmw-3-series",
    code: "G21",
    body: "touring",
    phase: "facelift",
    asOf: "2022-05-25",
    powerKw: 364,
    powerPs: 495,
    torqueNm: 730,
    topSpeedKmh: 302,
    zeroTo100: 3.7,
    engine: "3.0 I6 Bi-Turbo",
    story: "atelier.cars.b3.lci",
    source: "alpina-b3-update-2022",
    photoBrief: "alpina-b3-touring-facelift.photo",
    outputFile: "public/images/editorial-alpina-b3-touring-facelift.webp",
  },
  {
    id: "alpina-b5-gt-sedan-limited",
    photo: atelierPhotos["alpina-b5-gt-sedan-limited"],
    manufacturer: "ALPINA",
    name: "B5 GT Sedan",
    baseFamilyId: "bmw-5-series",
    code: "G30",
    body: "sedan",
    phase: "limited",
    asOf: "2023-01-23",
    powerKw: 466,
    powerPs: 634,
    torqueNm: 850,
    topSpeedKmh: 330,
    zeroTo100: 3.4,
    engine: "4.4 V8 Bi-Turbo",
    story: "atelier.cars.b5.gt",
    source: "alpina-b5-gt-2023",
    photoBrief: "alpina-b5-gt-sedan-limited.photo",
    outputFile: "public/images/editorial-alpina-b5-gt-sedan-limited.webp",
    editionLimit: 250,
    editionScope: "b5-gt-all-bodies",
  },
  {
    id: "alpina-b5-gt-touring-limited",
    photo: atelierPhotos["alpina-b5-gt-touring-limited"],
    manufacturer: "ALPINA",
    name: "B5 GT Touring",
    baseFamilyId: "bmw-5-series",
    code: "G31",
    body: "touring",
    phase: "limited",
    asOf: "2023-01-23",
    powerKw: 466,
    powerPs: 634,
    torqueNm: 850,
    topSpeedKmh: 322,
    zeroTo100: 3.6,
    engine: "4.4 V8 Bi-Turbo",
    story: "atelier.cars.b5.gt",
    source: "alpina-b5-gt-2023",
    photoBrief: "alpina-b5-gt-touring-limited.photo",
    outputFile: "public/images/editorial-alpina-b5-gt-touring-limited.webp",
    editionLimit: 250,
    editionScope: "b5-gt-all-bodies",
  },
];
