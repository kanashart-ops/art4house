import { Image } from "react-native";

import art1 from "../../../assets/art1.jpg";
import art10 from "../../../assets/art10.jpg";
import art11 from "../../../assets/art11.jpg";
import art12 from "../../../assets/art12.jpg";
import art13 from "../../../assets/art13.jpg";
import art14 from "../../../assets/art14.jpg";
import art15 from "../../../assets/art15.jpg";
import art16 from "../../../assets/art16.jpg";
import art17 from "../../../assets/art17.jpg";
import art18 from "../../../assets/art18.jpg";
import art19 from "../../../assets/art19.jpg";
import art2 from "../../../assets/art2.jpg";
import art3 from "../../../assets/art3.jpg";
import art4 from "../../../assets/art4.jpg";
import art5 from "../../../assets/art5.jpg";
import art6 from "../../../assets/art6.jpg";
import art7 from "../../../assets/art7.jpg";
import art8 from "../../../assets/art8.jpg";
import art9 from "../../../assets/art9.jpg";
import fon1 from "../../../assets/fon (1).jpg";
import fon10 from "../../../assets/fon (10).jpg";
import fon11 from "../../../assets/fon (11).jpg";
import fon12 from "../../../assets/fon (12).jpg";
import fon13 from "../../../assets/fon (13).jpg";
import fon14 from "../../../assets/fon (14).jpg";
import fon15 from "../../../assets/fon (15).jpg";
import fon16 from "../../../assets/fon (16).jpg";
import fon17 from "../../../assets/fon (17).jpg";
import fon18 from "../../../assets/fon (18).jpg";
import fon19 from "../../../assets/fon (19).jpg";
import fon2 from "../../../assets/fon (2).jpg";
import fon20 from "../../../assets/fon (20).jpg";
import fon21 from "../../../assets/fon (21).jpg";
import fon22 from "../../../assets/fon (22).jpg";
import fon23 from "../../../assets/fon (23).jpg";
import fon3 from "../../../assets/fon (3).jpg";
import fon4 from "../../../assets/fon (4).jpg";
import fon5 from "../../../assets/fon (5).jpg";
import fon6 from "../../../assets/fon (6).jpg";
import fon7 from "../../../assets/fon (7).jpg";
import fon8 from "../../../assets/fon (8).jpg";
import fon9 from "../../../assets/fon (9).jpg";

export type ArtItem = {
  id: string;
  title: string;
  uri: string;
  aspectRatio: number;
};

export type BgItem = {
  id: string;
  title: string;
  uri: string;
};

export function createArt(id: string, title: string, asset: number): ArtItem {
  const src = Image.resolveAssetSource(asset);
  const ratio =
    src && typeof src.width === "number" && typeof src.height === "number"
      ? src.width / src.height
      : 1;
  return {
    id,
    title,
    uri: src.uri,
    aspectRatio: ratio || 1,
  };
}

export function createBg(id: string, title: string, asset: number): BgItem {
  const src = Image.resolveAssetSource(asset);
  return { id, title, uri: src.uri };
}

export const SAMPLE_ARTS: ArtItem[] = [
  createArt("1", "Картина 1", art1),
  createArt("2", "Картина 2", art2),
  createArt("3", "Картина 3", art3),
  createArt("4", "Картина 4", art4),
  createArt("5", "Картина 5", art5),
  createArt("6", "Картина 6", art6),
  createArt("7", "Картина 7", art7),
  createArt("8", "Картина 8", art8),
  createArt("9", "Картина 9", art9),
  createArt("10", "Картина 10", art10),
  createArt("11", "Картина 11", art11),
  createArt("12", "Картина 12", art12),
  createArt("13", "Картина 13", art13),
  createArt("14", "Картина 14", art14),
  createArt("15", "Картина 15", art15),
  createArt("16", "Картина 16", art16),
  createArt("17", "Картина 17", art17),
  createArt("18", "Картина 18", art18),
  createArt("19", "Картина 19", art19),
];

export const SAMPLE_FONS: BgItem[] = [
  createBg("1", "Фон 1", fon1),
  createBg("2", "Фон 2", fon2),
  createBg("3", "Фон 3", fon3),
  createBg("4", "Фон 4", fon4),
  createBg("5", "Фон 5", fon5),
  createBg("6", "Фон 6", fon6),
  createBg("7", "Фон 7", fon7),
  createBg("8", "Фон 8", fon8),
  createBg("9", "Фон 9", fon9),
  createBg("10", "Фон 10", fon10),
  createBg("11", "Фон 11", fon11),
  createBg("12", "Фон 12", fon12),
  createBg("13", "Фон 13", fon13),
  createBg("14", "Фон 14", fon14),
  createBg("15", "Фон 15", fon15),
  createBg("16", "Фон 16", fon16),
  createBg("17", "Фон 17", fon17),
  createBg("18", "Фон 18", fon18),
  createBg("19", "Фон 19", fon19),
  createBg("20", "Фон 20", fon20),
  createBg("21", "Фон 21", fon21),
  createBg("22", "Фон 22", fon22),
  createBg("23", "Фон 23", fon23),
];

export const DEFAULT_BG_URI = Image.resolveAssetSource(fon1).uri;
