// app/(tabs)/index.tsx
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  FlatList,
  Image,
  Linking,
  RefreshControl,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import FeedItem from "../../components/FeedItem";

// ЛОКАЛЬНЫЕ КАРТИНКИ (положи файлы в assets с такими именами)
import annaAvatar from "../../assets/anna-avatar.jpg";
import heroLivingroom from "../../assets/hero-livingroom.jpg";

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

export default function Home() {
  const router = useRouter();

  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // обычные внешние ссылки (соцсети и т.п.) — через системный браузер
  const openLink = (url: string) => {
    Linking.openURL(url).catch(() => {});
  };

  // встроенный браузер для архива статей
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
      if (!res.ok) {
        throw new Error(`Status ${res.status}`);
      }
      const json = (await res.json()) as ArticlesResponse;

      setArticles(json.articles ?? []);
    } catch (e) {
      console.warn(e);
      setError("Не удалось загрузить статьи. Попробуйте обновить позже.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadArticles();
  }, [loadArticles]);

  const onRefresh = () => {
    setRefreshing(true);
    loadArticles();
  };

  // Мапим статьи из API в формат, который понимает FeedItem
  const posts = useMemo(
    () =>
      articles.map((a) => ({
        id: a.slug,
        author: "Anna · ArtForHouse",
        title: a.title,
        image:
          a.coverImage ||
          "https://artforhouse.by/og-image.jpg", // запасной вариант, если нет обложки
        description: a.excerpt || a.summary || "",
      })),
    [articles]
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <StatusBar barStyle="dark-content" />

      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <FeedItem item={item} />}
        contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListHeaderComponent={
          <>
            {/* HEADER */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <View>
                <Text style={{ fontSize: 24, fontWeight: "700" }}>
                  ArtForHouse
                </Text>
                <Text
                  style={{
                    fontSize: 12,
                    color: "#666",
                    marginTop: 2,
                  }}
                >
                  Картины для интерьера
                </Text>
              </View>

              {/* соцсети в один горизонтальный ряд */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                {/* Instagram */}
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
                    marginLeft: 0,
                  }}
                >
                  <Ionicons name="logo-instagram" size={18} color="#E1306C" />
                </TouchableOpacity>

                {/* TikTok */}
                <TouchableOpacity
                  onPress={() =>
                    openLink(
                      "https://www.tiktok.com/@artforhouse?_t=ZM-8zoHlBlwoHV&_r=1"
                    )
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

                {/* Telegram */}
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
                  <Ionicons
                    name="paper-plane-outline"
                    size={18}
                    color="#229ED9"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* HERO-БЛОК с реальной квартирой */}
            <View
              style={{
                borderRadius: 18,
                overflow: "hidden",
                backgroundColor: "#111",
                marginBottom: 18,
              }}
            >
              <Image
                source={heroLivingroom}
                style={{ width: "100%", height: 190 }}
              />
              <View
                style={{
                  position: "absolute",
                  left: 16,
                  right: 16,
                  bottom: 16,
                }}
              >
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
                <Text
                  style={{
                    color: "#f5f5f5",
                    fontSize: 13,
                    marginBottom: 10,
                  }}
                >
                  Примерьте работы в своей комнате и подберите идеальную
                  атмосферу для дома.
                </Text>
                <View
                  style={{
                    flexDirection: "row",
                    gap: 8,
                  }}
                >
                  <TouchableOpacity
                    onPress={() => router.push("/tryon")}
                    style={{
                      backgroundColor: "#007AFF",
                      paddingHorizontal: 16,
                      paddingVertical: 8,
                      borderRadius: 999,
                    }}
                  >
                    <Text
                      style={{ color: "#fff", fontWeight: "700", fontSize: 13 }}
                    >
                      Примерить картину
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => router.push("/gallery")}
                    style={{
                      backgroundColor: "rgba(0,0,0,0.6)",
                      paddingHorizontal: 14,
                      paddingVertical: 8,
                      borderRadius: 999,
                      borderWidth: 1,
                      borderColor: "rgba(255,255,255,0.4)",
                    }}
                  >
                    <Text
                      style={{ color: "#fff", fontWeight: "600", fontSize: 13 }}
                    >
                      Смотреть галерею
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* О ХУДОЖНИКЕ с реальной аватаркой */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: "#f4f4f4",
                borderRadius: 18,
                padding: 12,
                marginBottom: 18,
              }}
            >
              <View
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 999,
                  overflow: "hidden",
                  marginRight: 12,
                  backgroundColor: "#ddd",
                }}
              >
                <Image
                  source={annaAvatar}
                  style={{ width: "100%", height: "100%" }}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={{ fontSize: 15, fontWeight: "700", marginBottom: 2 }}
                >
                  Anna · ArtForHouse
                </Text>
                <Text
                  style={{ fontSize: 12, color: "#555", marginBottom: 4 }}
                >
                  Пишу картины маслом и акрилом для современных интерьеров.
                  Люблю свет, воздух и спокойные сочетания цвета.
                </Text>
                <TouchableOpacity onPress={() => router.push("/order")}>
                  <Text
                    style={{
                      fontSize: 12,
                      color: "#007AFF",
                      fontWeight: "600",
                    }}
                  >
                    Заказать индивидуальную картину →
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Ошибка загрузки статей, если есть */}
            {error && (
              <View
                style={{
                  backgroundColor: "#FEE2E2",
                  borderRadius: 12,
                  padding: 10,
                  marginBottom: 10,
                }}
              >
                <Text
                  style={{
                    color: "#B91C1C",
                    fontSize: 12,
                    marginBottom: 4,
                  }}
                >
                  {error}
                </Text>
                <TouchableOpacity onPress={loadArticles}>
                  <Text
                    style={{
                      color: "#007AFF",
                      fontSize: 12,
                      fontWeight: "600",
                    }}
                  >
                    Повторить загрузку
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* ЗАГОЛОВОК ДЛЯ ЛЕНТЫ */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 4,
              }}
            >
              <View>
                <Text
                  style={{ fontSize: 16, fontWeight: "700", color: "#111" }}
                >
                  Полезные статьи
                </Text>
                <Text style={{ fontSize: 11, color: "#777" }}>
                  выбор · уход · атмосфера
                </Text>
              </View>

              {/* Кнопка архива на сайте — через встроенный браузер */}
              <TouchableOpacity
                onPress={() => openInAppBrowser(`${API_BASE_URL}/articles`)}
              >
                <Text
                  style={{
                    fontSize: 11,
                    color: "#007AFF",
                    fontWeight: "600",
                  }}
                >
                  Архив статей →
                </Text>
              </TouchableOpacity>
            </View>
          </>
        }
        ListEmptyComponent={
          !loading && posts.length === 0 ? (
            <View
              style={{
                paddingVertical: 24,
              }}
            >
              <Text
                style={{
                  fontSize: 13,
                  color: "#777",
                  textAlign: "center",
                }}
              >
                Пока нет опубликованных статей.
              </Text>
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
}
