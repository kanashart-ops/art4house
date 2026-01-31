// app/index.tsx
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  FlatList,
  Image,
  Linking,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import FeedItem from "../components/FeedItem";

// ✅ API галереи (общий модуль)
import { fetchMobileGallery, MobileArtItem } from "../lib/mobileGallery";

// ЛОКАЛЬНЫЕ КАРТИНКИ
import heroLivingroom from "../assets/hero-livingroom.jpg";

const API_BASE_URL = "https://artforhouse.by";
const ARTICLES_URL = `${API_BASE_URL}/api/articles`;

type Article = {
  slug: string;
  title: string;
  excerpt?: string;
  summary?: string;
  coverImage?: string | null;
  createdAt?: string;
};

type ArticlesResponse = {
  articles: Article[];
};

// ✅ Переключатели
const SHOW_ARTICLES_BLOCK = false;

// ✅ РЕАЛЬНЫЕ КАРТИНЫ (assets/art1.jpg ... art19.jpg)
import art1 from "../assets/art1.jpg";
import art10 from "../assets/art10.jpg";
import art11 from "../assets/art11.jpg";
import art12 from "../assets/art12.jpg";
import art13 from "../assets/art13.jpg";
import art14 from "../assets/art14.jpg";
import art15 from "../assets/art15.jpg";
import art16 from "../assets/art16.jpg";
import art17 from "../assets/art17.jpg";
import art18 from "../assets/art18.jpg";
import art19 from "../assets/art19.jpg";
import art2 from "../assets/art2.jpg";
import art3 from "../assets/art3.jpg";
import art4 from "../assets/art4.jpg";
import art5 from "../assets/art5.jpg";
import art6 from "../assets/art6.jpg";
import art7 from "../assets/art7.jpg";
import art8 from "../assets/art8.jpg";
import art9 from "../assets/art9.jpg";

// ✅ РЕАЛЬНЫЕ ФОНЫ (assets/fon (1).jpg ... fon (23).jpg)
import fon1 from "../assets/fon (1).jpg";
import fon10 from "../assets/fon (10).jpg";
import fon11 from "../assets/fon (11).jpg";
import fon12 from "../assets/fon (12).jpg";
import fon13 from "../assets/fon (13).jpg";
import fon14 from "../assets/fon (14).jpg";
import fon15 from "../assets/fon (15).jpg";
import fon16 from "../assets/fon (16).jpg";
import fon17 from "../assets/fon (17).jpg";
import fon18 from "../assets/fon (18).jpg";
import fon19 from "../assets/fon (19).jpg";
import fon2 from "../assets/fon (2).jpg";
import fon20 from "../assets/fon (20).jpg";
import fon21 from "../assets/fon (21).jpg";
import fon22 from "../assets/fon (22).jpg";
import fon23 from "../assets/fon (23).jpg";
import fon3 from "../assets/fon (3).jpg";
import fon4 from "../assets/fon (4).jpg";
import fon5 from "../assets/fon (5).jpg";
import fon6 from "../assets/fon (6).jpg";
import fon7 from "../assets/fon (7).jpg";
import fon8 from "../assets/fon (8).jpg";
import fon9 from "../assets/fon (9).jpg";

const TRYON_PAINTINGS = [
  { id: "art1", src: art1 },
  { id: "art2", src: art2 },
  { id: "art3", src: art3 },
  { id: "art4", src: art4 },
  { id: "art5", src: art5 },
  { id: "art6", src: art6 },
  { id: "art7", src: art7 },
  { id: "art8", src: art8 },
  { id: "art9", src: art9 },
  { id: "art10", src: art10 },
  { id: "art11", src: art11 },
  { id: "art12", src: art12 },
  { id: "art13", src: art13 },
  { id: "art14", src: art14 },
  { id: "art15", src: art15 },
  { id: "art16", src: art16 },
  { id: "art17", src: art17 },
  { id: "art18", src: art18 },
  { id: "art19", src: art19 },
] as const;

const TRYON_BACKGROUNDS = [
  { id: "fon1", src: fon1 },
  { id: "fon2", src: fon2 },
  { id: "fon3", src: fon3 },
  { id: "fon4", src: fon4 },
  { id: "fon5", src: fon5 },
  { id: "fon6", src: fon6 },
  { id: "fon7", src: fon7 },
  { id: "fon8", src: fon8 },
  { id: "fon9", src: fon9 },
  { id: "fon10", src: fon10 },
  { id: "fon11", src: fon11 },
  { id: "fon12", src: fon12 },
  { id: "fon13", src: fon13 },
  { id: "fon14", src: fon14 },
  { id: "fon15", src: fon15 },
  { id: "fon16", src: fon16 },
  { id: "fon17", src: fon17 },
  { id: "fon18", src: fon18 },
  { id: "fon19", src: fon19 },
  { id: "fon20", src: fon20 },
  { id: "fon21", src: fon21 },
  { id: "fon22", src: fon22 },
  { id: "fon23", src: fon23 },
] as const;

export default function Home() {
  const router = useRouter();

  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ✅ третья карусель: мини-превью из API-галереи
  const [galleryItems, setGalleryItems] = useState<MobileArtItem[]>([]);
  const [galleryLoading, setGalleryLoading] = useState(true);

  const openLink = (url: string) => {
    Linking.openURL(url).catch(() => {});
  };

  const openInAppBrowser = async (url: string) => {
    try {
      await WebBrowser.openBrowserAsync(url);
    } catch (e) {
      console.warn(e);
    }
  };

  const loadArticles = useCallback(async () => {
    try {
      setError(null);
      const res = await fetch(`${ARTICLES_URL}?limit=3`);
      if (!res.ok) throw new Error(`Status ${res.status}`);
      const json = (await res.json()) as ArticlesResponse;
      setArticles(json.articles ?? []);
    } catch (e) {
      console.warn(e);
      setError("Не удалось загрузить статьи.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // ✅ грузим мини-галерею для 3-й карусели
  const loadMobileGalleryPreview = useCallback(async () => {
    try {
      setGalleryLoading(true);
      const data = await fetchMobileGallery();
      // на главной нам много не надо
      setGalleryItems((data ?? []).slice(0, 15));
    } catch (e) {
      console.warn(e);
      setGalleryItems([]);
    } finally {
      setGalleryLoading(false);
    }
  }, []);

  useEffect(() => {
    if (SHOW_ARTICLES_BLOCK) loadArticles();
    else {
      setLoading(false);
      setRefreshing(false);
    }

    loadMobileGalleryPreview();
  }, [loadArticles, loadMobileGalleryPreview]);

  const posts = useMemo(
    () =>
      articles.map((a) => ({
        id: a.slug,
        author: "Anna · ArtForHouse",
        title: a.title,
        image: a.coverImage || "https://artforhouse.by/og-image.jpg",
        description: a.excerpt || a.summary || "",
      })),
    [articles]
  );

  // ✅ ВАЖНО: всегда передаём bgId, чтобы в tryon не показывалось "Фон или картина"
  // Если нажали на картину — передаем paintingId + фон по умолчанию fon1
  // Если нажали на фон — передаем только bgId (картина не выбирается)
  const goTryon = (opts: { paintingId?: string; bgId?: string } = {}) => {
    router.push({
      pathname: "/tryon",
      params: {
        ...opts,
        bgId: opts.bgId ?? "fon1", // ✅ фон по умолчанию всегда fon1
      },
    });
  };

  // ✅ Третья карусель: ведёт ТОЛЬКО в /gallery
  const goGallery = () => router.push("/gallery");

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <StatusBar barStyle="dark-content" />

      <FlatList
        data={SHOW_ARTICLES_BLOCK ? posts : []}
        keyExtractor={(item) => item.id}
        renderItem={
          SHOW_ARTICLES_BLOCK ? ({ item }) => <FeedItem item={item} /> : undefined
        }
        contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
        ListHeaderComponent={
          <>
            {/* HEADER */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 24, fontWeight: "700" }}>ArtForHouse</Text>
                <Text style={{ fontSize: 12, color: "#666", marginTop: 2 }}>
                  Картины для интерьера
                </Text>
              </View>

              {/* КНОПКА ЗАКАЗАТЬ */}
              <TouchableOpacity
                onPress={() => router.push("/order")}
                style={{
                  paddingHorizontal: 14,
                  paddingVertical: 8,
                  borderRadius: 999,
                  backgroundColor: "#111",
                  marginRight: 12,
                }}
              >
                <Text style={{ color: "#fff", fontSize: 12, fontWeight: "700" }}>
                  Заказать
                </Text>
              </TouchableOpacity>

              {/* СОЦСЕТИ */}
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <TouchableOpacity
                  onPress={() =>
                    openLink(
                      "https://www.instagram.com/art_for_house.by?igsh=Y3pzeWl6eXV0aDJo"
                    )
                  }
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 999,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "#FFE7F0",
                  }}
                >
                  <Ionicons name="logo-instagram" size={18} color="#E1306C" />
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() =>
                    openLink("https://www.tiktok.com/@artforhouse?_t=ZM-8zoHlBlwoHV&_r=1")
                  }
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 999,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "#F2F2F2",
                    marginLeft: 10,
                  }}
                >
                  <Ionicons name="logo-tiktok" size={18} color="#000" />
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => openLink("https://t.me/AnnPab")}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 999,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "#E3F4FF",
                    marginLeft: 10,
                  }}
                >
                  <Ionicons name="paper-plane-outline" size={18} color="#229ED9" />
                </TouchableOpacity>
              </View>
            </View>

            {/* HERO */}
            <View
              style={{
                borderRadius: 18,
                overflow: "hidden",
                backgroundColor: "#111",
                marginBottom: 18,
              }}
            >
              <Image source={heroLivingroom} style={{ width: "100%", height: 190 }} />
              <View style={{ position: "absolute", left: 16, right: 16, bottom: 16 }}>
                <Text
                  style={{
                    color: "#fff",
                    fontSize: 20,
                    fontWeight: "700",
                    marginBottom: 4,
                  }}
                >
                  Картины, которые меняют интерьер
                </Text>
                <Text style={{ color: "#f5f5f5", fontSize: 13, marginBottom: 10 }}>
                  Примерьте работы в своей комнате и подберите идеальную атмосферу для дома.
                </Text>

                <View style={{ flexDirection: "row", gap: 8 }}>
                  <TouchableOpacity
                    onPress={() => goTryon({ bgId: "fon1" })}
                    style={{
                      backgroundColor: "#007AFF",
                      paddingHorizontal: 16,
                      paddingVertical: 8,
                      borderRadius: 999,
                    }}
                  >
                    <Text style={{ color: "#fff", fontWeight: "700", fontSize: 13 }}>
                      Примерить картину
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={goGallery}
                    style={{
                      backgroundColor: "rgba(0,0,0,0.6)",
                      paddingHorizontal: 14,
                      paddingVertical: 8,
                      borderRadius: 999,
                      borderWidth: 1,
                      borderColor: "rgba(255,255,255,0.4)",
                    }}
                  >
                    <Text style={{ color: "#fff", fontWeight: "600", fontSize: 13 }}>
                      Смотреть галерею
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* 1) КАРТИНЫ */}
            <View style={{ marginBottom: 16 }}>
              <Text style={{ fontSize: 16, fontWeight: "700", marginBottom: 8 }}>
                Картины для примерки
              </Text>

              <FlatList
                horizontal
                showsHorizontalScrollIndicator={false}
                data={TRYON_PAINTINGS}
                keyExtractor={(it) => it.id}
                contentContainerStyle={{ gap: 12 }}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    onPress={() => goTryon({ paintingId: item.id, bgId: "fon1" })}
                    style={{
                      width: 176,
                      height: 240,
                      borderRadius: 16,
                      backgroundColor: "#fff",
                      borderWidth: 1,
                      borderColor: "rgba(0,0,0,0.08)",
                      overflow: "hidden",
                    }}
                  >
                    <Image
                      source={item.src}
                      style={{ width: "100%", height: "100%" }}
                      resizeMode="contain"
                    />
                  </TouchableOpacity>
                )}
              />
            </View>

            {/* 2) ФОНЫ */}
            <View style={{ marginBottom: 18 }}>
              <Text style={{ fontSize: 16, fontWeight: "700", marginBottom: 8 }}>
                Фоны
              </Text>

              <FlatList
                horizontal
                showsHorizontalScrollIndicator={false}
                data={TRYON_BACKGROUNDS}
                keyExtractor={(it) => it.id}
                contentContainerStyle={{ gap: 12 }}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    onPress={() => goTryon({ bgId: item.id })}
                    style={{
                      width: 176,
                      height: 240,
                      borderRadius: 16,
                      backgroundColor: "#fff",
                      borderWidth: 1,
                      borderColor: "rgba(0,0,0,0.08)",
                      overflow: "hidden",
                    }}
                  >
                    <Image
                      source={item.src}
                      style={{ width: "100%", height: "100%" }}
                      resizeMode="contain"
                    />
                  </TouchableOpacity>
                )}
              />
            </View>

            {/* 3) ГАЛЕРЕЯ (API) — НЕ ВЕДЁТ В TRYON, только /gallery */}
            <View style={{ marginBottom: 18 }}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 8,
                }}
              >
                <Text style={{ fontSize: 16, fontWeight: "700" }}>Галерея</Text>

                <TouchableOpacity onPress={goGallery} activeOpacity={0.8}>
                  <Text style={{ fontSize: 12, fontWeight: "700", color: "#007AFF" }}>
                    Открыть →
                  </Text>
                </TouchableOpacity>
              </View>

              <FlatList
                horizontal
                showsHorizontalScrollIndicator={false}
                data={galleryItems}
                keyExtractor={(it) => it.id}
                contentContainerStyle={{ gap: 12 }}
                ListEmptyComponent={
                  galleryLoading ? (
                    <View
                      style={{
                        width: 176,
                        height: 240,
                        borderRadius: 16,
                        backgroundColor: "#f2f2f2",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Text style={{ color: "#777", fontSize: 12 }}>Загрузка…</Text>
                    </View>
                  ) : (
                    <TouchableOpacity
                      onPress={goGallery}
                      activeOpacity={0.85}
                      style={{
                        width: 176,
                        height: 240,
                        borderRadius: 16,
                        backgroundColor: "#f2f2f2",
                        alignItems: "center",
                        justifyContent: "center",
                        borderWidth: 1,
                        borderColor: "rgba(0,0,0,0.06)",
                      }}
                    >
                      <Text style={{ color: "#111", fontWeight: "800", fontSize: 13 }}>
                        Открыть галерею
                      </Text>
                    </TouchableOpacity>
                  )
                }
                renderItem={({ item }) => (
                  <TouchableOpacity
                    onPress={goGallery} // ✅ всегда только /gallery
                    activeOpacity={0.85}
                    style={{
                      width: 176,
                      height: 240,
                      borderRadius: 16,
                      backgroundColor: "#fff",
                      borderWidth: 1,
                      borderColor: "rgba(0,0,0,0.08)",
                      overflow: "hidden",
                    }}
                  >
                    <Image
                      source={{ uri: item.imageUrl }}
                      style={{ width: "100%", height: "100%" }}
                      resizeMode="cover"
                    />

                    {/* лёгкая подпись (не мешает) */}
                    <View
                      style={{
                        position: "absolute",
                        left: 10,
                        right: 10,
                        bottom: 10,
                        paddingVertical: 6,
                        paddingHorizontal: 10,
                        borderRadius: 12,
                        backgroundColor: "rgba(0,0,0,0.45)",
                      }}
                    >
                      <Text style={{ color: "#fff", fontSize: 12, fontWeight: "700" }} numberOfLines={1}>
                        {item.category || "Галерея"}
                      </Text>
                    </View>
                  </TouchableOpacity>
                )}
              />
            </View>
          </>
        }
      />
    </SafeAreaView>
  );
}
