// components/FeedItem.tsx
import { useRouter } from "expo-router";
import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";

export type FeedItemData = {
  id: string;          // здесь у нас slug статьи
  author: string;
  title: string;
  image: string;
  description?: string;
};

export default function FeedItem({ item }: { item: FeedItemData }) {
  const router = useRouter();

  const openArticle = () => {
    // id = slug → переходим на экран статьи внутри приложения
    router.push(`/article/${item.id}`);
  };

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={openArticle}
      style={{
        marginBottom: 16,
        borderRadius: 18,
        backgroundColor: "#f7f7f7",
        overflow: "hidden",
      }}
    >
      {/* Картинка */}
      <View
        style={{
          width: "100%",
          aspectRatio: 4 / 3,
          backgroundColor: "#ddd",
        }}
      >
        <Image
          source={{ uri: item.image }}
          style={{ width: "100%", height: "100%" }}
          resizeMode="cover"
        />
      </View>

      {/* Текстовая часть */}
      <View style={{ padding: 12 }}>
        <Text
          style={{
            fontSize: 11,
            color: "#777",
            marginBottom: 4,
          }}
          numberOfLines={1}
        >
          {item.author}
        </Text>

        <Text
          style={{
            fontSize: 15,
            fontWeight: "700",
            color: "#111",
            marginBottom: 6,
          }}
          numberOfLines={2}
        >
          {item.title}
        </Text>

        {!!item.description && (
          <Text
            style={{
              fontSize: 12,
              color: "#555",
              marginBottom: 8,
            }}
            numberOfLines={3}
          >
            {item.description}
          </Text>
        )}

        <Text
          style={{
            fontSize: 12,
            color: "#007AFF",
            fontWeight: "600",
          }}
        >
          Читать в приложении →
        </Text>
      </View>
    </TouchableOpacity>
  );
}
