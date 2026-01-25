import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo } from "react";
import {
  ActivityIndicator,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";

const SITE_BASE_URL = "https://artforhouse.by";

export default function ArticleScreen() {
  const params = useLocalSearchParams<{ slug?: string | string[] }>();
  const router = useRouter();

  // slug может прийти как string или как string[]
  const slug = useMemo(() => {
    const s = params.slug;
    return Array.isArray(s) ? s[0] : s;
  }, [params.slug]);

  // ✅ лог только внутри компонента, после вычисления slug
  //console.log("OPEN /article/[slug]  slug =", slug);

  if (!slug || typeof slug !== "string") {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: "#fff",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text style={{ color: "#333" }}>Не удалось открыть статью.</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={{ marginTop: 8, color: "#007AFF", fontWeight: "600" }}>
            Назад
          </Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const url = `${SITE_BASE_URL}/articles/${slug}?app=1`;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      {/* Свой верхний бар */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 12,
          paddingVertical: 8,
          borderBottomWidth: 0.5,
          borderBottomColor: "#e5e5e5",
        }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ padding: 6, marginRight: 6, borderRadius: 999 }}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="chevron-back" size={20} color="#111" />
        </TouchableOpacity>

        <View style={{ flex: 1 }}>
          <Text
            style={{ fontSize: 15, fontWeight: "600", color: "#111" }}
            numberOfLines={1}
          >
            Статья ArtForHouse
          </Text>
          <Text style={{ fontSize: 11, color: "#777" }}>artforhouse.by</Text>
        </View>
      </View>
<WebView
  source={{ uri: url }}
  startInLoadingState
  renderLoading={() => (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <ActivityIndicator size="large" color="#007AFF" />
      <Text style={{ marginTop: 8, color: "#555", fontSize: 12 }}>
        Загружаем статью…
      </Text>
    </View>
  )}
 injectedJavaScript={`
  (function () {
    function hideTop() {
      const selectors = [
        'header',
        'nav',
        '.breadcrumb',
        '.breadcrumbs',
        '.article-header',
        '.page-header',
        '.site-header'
      ];

      selectors.forEach(sel => {
        document.querySelectorAll(sel).forEach(el => {
          el.style.display = 'none';
        });
      });

      document.body.style.paddingTop = '0px';
      document.body.style.marginTop = '0px';
    }

    hideTop();

    const observer = new MutationObserver(hideTop);
    observer.observe(document.body, { childList: true, subtree: true });
  })();
  true;
`}
/>
    </SafeAreaView>
  );
}
