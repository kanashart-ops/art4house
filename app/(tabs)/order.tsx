// app/(tabs)/order.tsx
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Linking,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function OrderScreen() {
  const openLink = async (url: string) => {
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      Linking.openURL(url);
    }
  };

  const ContactButton = ({
    icon,
    label,
    color,
    backgroundColor,
    onPress,
  }: {
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    color: string;
    backgroundColor: string;
    onPress: () => void;
  }) => (
    <TouchableOpacity
      onPress={onPress}
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 10,
        borderRadius: 999,
        backgroundColor,
        marginBottom: 8,
      }}
    >
      <Ionicons
        name={icon}
        size={18}
        color={color}
        style={{ marginRight: 8 }}
      />
      <Text
        style={{
          color,
          fontWeight: "700",
          fontSize: 13,
        }}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  const Tag = ({ text }: { text: string }) => (
    <View
      style={{
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 999,
        backgroundColor: "#f2f2f2",
        marginRight: 6,
        marginBottom: 6,
      }}
    >
      <Text style={{ fontSize: 11, color: "#444" }}>{text}</Text>
    </View>
  );

  const Step = ({
    index,
    title,
    text,
  }: {
    index: number;
    title: string;
    text: string;
  }) => (
    <View
      style={{
        flexDirection: "row",
        alignItems: "flex-start",
        marginBottom: 12,
      }}
    >
      <View
        style={{
          width: 26,
          height: 26,
          borderRadius: 13,
          backgroundColor: "#111",
          alignItems: "center",
          justifyContent: "center",
          marginRight: 10,
          marginTop: 2,
        }}
      >
        <Text
          style={{
            color: "#fff",
            fontWeight: "700",
            fontSize: 13,
          }}
        >
          {index}
        </Text>
      </View>

      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontSize: 13,
            fontWeight: "700",
            marginBottom: 3,
            color: "#111",
          }}
        >
          {title}
        </Text>
        <Text style={{ fontSize: 12, color: "#555" }}>{text}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 8,
          paddingBottom: 32,
        }}
      >
        {/* Заголовок */}
        <View style={{ marginBottom: 18 }}>
          <Text style={{ fontSize: 24, fontWeight: "700", marginBottom: 4 }}>
            Заказать картину
          </Text>
          <Text style={{ fontSize: 13, color: "#666" }}>
            Напишите мне удобным способом — подберём готовую работу или создадим индивидуальный проект под ваш интерьер.
          </Text>
        </View>

        {/* Как проходит заказ */}
        <View
          style={{
            backgroundColor: "#f7f7f7",
            borderRadius: 16,
            padding: 14,
            marginBottom: 20,
          }}
        >
          <Text
            style={{
              fontSize: 14,
              fontWeight: "700",
              marginBottom: 10,
              color: "#111",
            }}
          >
            Как проходит заказ
          </Text>

          <Step
            index={1}
            title="Связь и фото интерьера"
            text="Вы присылаете фото стены или комнаты и кратко описываете пожелания: размер, настроение, цвета."
          />
          <Step
            index={2}
            title="Подбор идей и эскизы"
            text="Я предлагаю варианты: готовые картины или эскизы под индивидуальный проект."
          />
          <Step
            index={3}
            title="Согласование и создание"
            text="Обсуждаем стоимость, сроки и оформление. После согласования я приступаю к работе."
          />
        </View>

        {/* Идеи */}
        <View
          style={{
            borderRadius: 16,
            padding: 14,
            backgroundColor: "#f9f9f9",
            marginBottom: 20,
          }}
        >
          <Text
            style={{
              fontSize: 14,
              fontWeight: "700",
              marginBottom: 8,
              color: "#111",
            }}
          >
            Идеи для заказа
          </Text>
          <Text
            style={{
              fontSize: 12,
              color: "#666",
              marginBottom: 10,
            }}
          >
            Можно выбрать готовую работу из галереи или заказать картину под конкретное пространство:
          </Text>

          <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
            <Tag text="Картина над диваном" />
            <Tag text="Спальня в спокойных тонах" />
            <Tag text="Акцентная стена" />
            <Tag text="Пара картин в одном стиле" />
            <Tag text="Картина в подарок" />
            <Tag text="Работа в кабинет" />
            <Tag text="Светлые абстракции" />
            <Tag text="Интерьерная роспись" />
          </View>
        </View>

        {/* Контакты */}
        <View
          style={{
            backgroundColor: "#111",
            borderRadius: 18,
            padding: 14,
            marginBottom: 20,
          }}
        >
          <Text
            style={{
              fontSize: 14,
              fontWeight: "700",
              marginBottom: 8,
              color: "#fff",
            }}
          >
            Связаться со мной
          </Text>

          <Text
            style={{
              fontSize: 12,
              color: "#ddd",
              marginBottom: 12,
            }}
          >
            Можно сразу прислать фото стены — так быстрее подберём варианты.
          </Text>

          {/* WhatsApp */}
          <ContactButton
            icon="logo-whatsapp"
            label="Написать в WhatsApp"
            color="#fff"
            backgroundColor="#25D366"
            onPress={() => openLink("https://wa.me/375293517220")}
          />

          {/* Telegram */}
          <ContactButton
            icon="paper-plane-outline"
            label="Написать в Telegram"
            color="#fff"
            backgroundColor="#229ED9"
            onPress={() => openLink("https://t.me/AnnPab")}
          />

          {/* Звонок */}
          <ContactButton
            icon="call-outline"
            label="Позвонить"
            color="#111"
            backgroundColor="#f5f5f5"
            onPress={() => openLink("tel:+375293517220")}
          />

          {/* Instagram */}
          <ContactButton
            icon="logo-instagram"
            label="Instagram портфолио"
            color="#fff"
            backgroundColor="#E1306C"
            onPress={() =>
              openLink("https://www.instagram.com/art_for_house.by?igsh=Y3pzeWl6eXV0aDJo")
            }
          />
        </View>

        {/* Подсказки */}
        <View
          style={{
            borderRadius: 16,
            padding: 14,
            backgroundColor: "#f4f4f4",
          }}
        >
          <Text
            style={{
              fontSize: 14,
              fontWeight: "700",
              marginBottom: 8,
              color: "#111",
            }}
          >
            Подсказки перед заказом
          </Text>

          <Text style={{ fontSize: 12, color: "#555", marginBottom: 6 }}>
            • Сделайте фото стены при дневном освещении — так точнее получится подбор.
          </Text>
          <Text style={{ fontSize: 12, color: "#555", marginBottom: 6 }}>
            • Измерьте примерный размер стены — это помогает выбрать правильный масштаб работы.
          </Text>
          <Text style={{ fontSize: 12, color: "#555" }}>
            • Если сомневаетесь, напишите, какие картины вам нравятся — я предложу похожие идеи.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
