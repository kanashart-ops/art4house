// app/(tabs)/gallery.tsx
import { useFocusEffect } from "@react-navigation/native";
import { useNavigation } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  BackHandler,
  FlatList,
  Image,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDecay,
  withSpring,
  withTiming,
} from "react-native-reanimated";

import * as FileSystem from "expo-file-system/legacy";
import * as MediaLibrary from "expo-media-library";

const API_BASE_URL = "https://artforhouse.by";
const GALLERY_URL = `${API_BASE_URL}/api/mobile-gallery`;

type MobileArtItem = {
  id: string;
  title: string;
  imageUrl: string;
  category: string;
};

const TOP_BAR_HEIGHT = 64;

const MIN_SCALE = 1;
const MAX_SCALE = 4;
const DOUBLE_TAP_SCALE = 2.5;

const RUBBER_BAND = 0.35;
const SPRING = { damping: 18, stiffness: 220, mass: 0.9 };

function clamp(n: number, min: number, max: number) {
  "worklet";
  return Math.max(min, Math.min(max, n));
}

function rubberClamp(value: number, min: number, max: number) {
  "worklet";
  if (value < min) return min + (value - min) * RUBBER_BAND;
  if (value > max) return max + (value - max) * RUBBER_BAND;
  return value;
}

export default function GalleryScreen() {
  const navigation = useNavigation();

  // ✅ актуальные размеры экрана (меняются при повороте)
  const { width: W, height: H } = useWindowDimensions();
  const isLandscape = W > H;

  // ✅ сетка: в портрете 2 колонки, в ландшафте 3 (можешь поставить 2 если хочешь)
  const NUM_COLS = isLandscape ? 3 : 2;

  const [items, setItems] = useState<MobileArtItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedCategory, setSelectedCategory] = useState<string>("Все");

  // fullscreen
  const [fullscreenIndex, setFullscreenIndex] = useState<number | null>(null);

  // ✅ scrollEnabled для FlatList в fullscreen
  const [isZoomed, setIsZoomed] = useState(false);

  // ✅ истинный источник (UI thread)
  const zoomedSV = useSharedValue(0);

  const setZoomed = useCallback((v: boolean) => {
    setIsZoomed(v);
  }, []);

  // ✅ СКРЫВАЕМ TAB BAR В FULLSCREEN
  useFocusEffect(
    useCallback(() => {
      if (fullscreenIndex !== null) {
        navigation.setOptions({
          tabBarStyle: { display: "none" },
        });
      } else {
        navigation.setOptions({
          tabBarStyle: undefined,
        });
      }

      return () => {
        navigation.setOptions({
          tabBarStyle: undefined,
        });
      };
    }, [fullscreenIndex, navigation])
  );

  // shared values for zoom/pan
  const scale = useSharedValue(1);
  const startScale = useSharedValue(1);

  const tx = useSharedValue(0);
  const ty = useSharedValue(0);

  const startX = useSharedValue(0);
  const startY = useSharedValue(0);

  const pinchStartX = useSharedValue(0);
  const pinchStartY = useSharedValue(0);

  // ✅ область изображения в fullscreen: ширина экрана, высота под картинку
  // В ландшафте можно чуть больше высоты отдать под картинку.
  const viewW = W;
  const viewH = isLandscape ? H * 0.82 : H * 0.75;

  const getBounds = (s: number) => {
    "worklet";
    const maxX = ((s - 1) * viewW) / 2;
    const maxY = ((s - 1) * viewH) / 2;
    return { maxX, maxY };
  };

  const resetTransform = useCallback(() => {
    zoomedSV.value = 0;
    setIsZoomed(false);

    scale.value = withTiming(1);
    tx.value = withTiming(0);
    ty.value = withTiming(0);
  }, [scale, tx, ty, zoomedSV]);

  const loadGallery = useCallback(async () => {
    try {
      setError(null);
      const res = await fetch(GALLERY_URL);
      if (!res.ok) throw new Error(`Status ${res.status}`);
      const data = (await res.json()) as MobileArtItem[];
      setItems(data);
    } catch (e) {
      console.warn(e);
      setError("Не удалось загрузить галерею.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadGallery();
  }, [loadGallery]);

  const onRefresh = () => {
    setRefreshing(true);
    loadGallery();
  };

  const categories = useMemo(() => {
    const set = new Set<string>();
    items.forEach((it) => it.category && set.add(it.category));
    return ["Все", ...Array.from(set)];
  }, [items]);

  const filteredItems = useMemo(() => {
    if (selectedCategory === "Все") return items;
    return items.filter((it) => it.category === selectedCategory);
  }, [items, selectedCategory]);

  const handleOpenFullscreen = (index: number) => {
    resetTransform();
    setFullscreenIndex(index);
  };

  const handleCloseFullscreen = useCallback(() => {
    resetTransform();
    setFullscreenIndex(null);
  }, [resetTransform]);

  const handleFullscreenScrollEnd = (e: any, total: number) => {
    // ✅ страница = текущая ширина W
    const nextIndex = Math.round(e.nativeEvent.contentOffset.x / W);
    if (!Number.isNaN(nextIndex) && nextIndex >= 0 && nextIndex < total) {
      resetTransform();
      setFullscreenIndex(nextIndex);
    }
  };

  // ✅ Android back — закрывает фото
  useEffect(() => {
    if (fullscreenIndex === null) return;

    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      handleCloseFullscreen();
      return true;
    });

    return () => sub.remove();
  }, [fullscreenIndex, handleCloseFullscreen]);

  const getCurrentItem = (): MobileArtItem | null => {
    if (fullscreenIndex === null) return null;
    return filteredItems[fullscreenIndex] ?? null;
  };

  const downloadCurrent = useCallback(async () => {
    try {
      const current = getCurrentItem();
      if (!current?.imageUrl) return;

      const { status } = await MediaLibrary.requestPermissionsAsync(true);
      if (status !== "granted") {
        Alert.alert("Нет доступа", "Разреши доступ к фото, чтобы я мог сохранить изображение.");
        return;
      }

      const extFromUrl =
        (current.imageUrl.split("?")[0].split(".").pop() || "jpg").toLowerCase();
      const safeExt =
        extFromUrl === "jpeg" || extFromUrl === "jpg" || extFromUrl === "png" ? extFromUrl : "jpg";

      const fileName = `artforhouse_${Date.now()}.${safeExt}`;
      const localUri = `${FileSystem.cacheDirectory}${fileName}`;

      const dl = await FileSystem.downloadAsync(current.imageUrl, localUri);
      const asset = await MediaLibrary.createAssetAsync(dl.uri);

      // альбом ArtForHouse (опционально)
      try {
        const albumName = "ArtForHouse";
        const album = await MediaLibrary.getAlbumAsync(albumName);
        if (!album) {
          await MediaLibrary.createAlbumAsync(albumName, asset, false);
        } else {
          await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
        }
      } catch {}

      Alert.alert("Готово", "Картинка сохранена в галерею.");
    } catch (e) {
      console.warn(e);
      Alert.alert("Ошибка", "Не удалось скачать/сохранить изображение.");
    }
  }, [filteredItems, fullscreenIndex]);

  // ======= Gestures =======

  // ✅ pinch в точку фокуса (между пальцами)
  const pinchGesture = Gesture.Pinch()
    .onBegin(() => {
      startScale.value = scale.value;
      pinchStartX.value = tx.value;
      pinchStartY.value = ty.value;
    })
    .onUpdate((e) => {
      const nextScale = clamp(startScale.value * e.scale, MIN_SCALE, MAX_SCALE);
      scale.value = nextScale;

      // включаем/выключаем zoom state (один раз при смене)
      if (nextScale > 1.01 && zoomedSV.value === 0) {
        zoomedSV.value = 1;
        runOnJS(setZoomed)(true);
      }
      if (nextScale <= 1.01 && zoomedSV.value === 1) {
        zoomedSV.value = 0;
        runOnJS(setZoomed)(false);
      }

      // фокус относительно центра области картинки
      const qx = e.focalX - viewW / 2;
      const qy = e.focalY - viewH / 2;

      const k = nextScale / startScale.value;

      // держим точку под пальцами
      const rawX = pinchStartX.value * k + qx * (1 - k);
      const rawY = pinchStartY.value * k + qy * (1 - k);

      const { maxX, maxY } = getBounds(nextScale);
      tx.value = rubberClamp(rawX, -maxX, maxX);
      ty.value = rubberClamp(rawY, -maxY, maxY);
    })
    .onEnd(() => {
      if (scale.value <= 1.01) {
        zoomedSV.value = 0;
        runOnJS(setZoomed)(false);

        scale.value = withTiming(1);
        tx.value = withTiming(0);
        ty.value = withTiming(0);
      } else {
        const { maxX, maxY } = getBounds(scale.value);
        const cx = clamp(tx.value, -maxX, maxX);
        const cy = clamp(ty.value, -maxY, maxY);
        if (cx !== tx.value) tx.value = withSpring(cx, SPRING);
        if (cy !== ty.value) ty.value = withSpring(cy, SPRING);
      }
    });

  // pan — только когда zoomed
  const panGesture = Gesture.Pan()
    .enabled(isZoomed)
    .minDistance(2)
    .onBegin(() => {
      startX.value = tx.value;
      startY.value = ty.value;
    })
    .onUpdate((e) => {
      const { maxX, maxY } = getBounds(scale.value);

      const nextX = startX.value + e.translationX;
      const nextY = startY.value + e.translationY;

      tx.value = rubberClamp(nextX, -maxX, maxX);
      ty.value = rubberClamp(nextY, -maxY, maxY);
    })
    .onEnd((e) => {
      const { maxX, maxY } = getBounds(scale.value);

      const cx = clamp(tx.value, -maxX, maxX);
      const cy = clamp(ty.value, -maxY, maxY);

      const outX = cx !== tx.value;
      const outY = cy !== ty.value;

      if (outX) tx.value = withSpring(cx, SPRING);
      else tx.value = withDecay({ velocity: e.velocityX, clamp: [-maxX, maxX] });

      if (outY) ty.value = withSpring(cy, SPRING);
      else ty.value = withDecay({ velocity: e.velocityY, clamp: [-maxY, maxY] });
    });

  // double tap — зум в точку тапа
  const doubleTapGesture = Gesture.Tap()
    .numberOfTaps(2)
    .maxDelay(250)
    .onEnd((e) => {
      const oldS = scale.value;
      const newS = oldS > 1.01 ? 1 : DOUBLE_TAP_SCALE;

      if (newS === 1) {
        zoomedSV.value = 0;
        runOnJS(setZoomed)(false);

        scale.value = withTiming(1);
        tx.value = withTiming(0);
        ty.value = withTiming(0);
        return;
      }

      zoomedSV.value = 1;
      runOnJS(setZoomed)(true);

      const qx = e.x - viewW / 2;
      const qy = e.y - viewH / 2;

      const k = newS / oldS;

      const nextTx = tx.value * k + qx * (1 - k);
      const nextTy = ty.value * k + qy * (1 - k);

      const { maxX, maxY } = getBounds(newS);

      scale.value = withTiming(newS);
      tx.value = withTiming(clamp(nextTx, -maxX, maxX));
      ty.value = withTiming(clamp(nextTy, -maxY, maxY));
    });

  const composedGesture = Gesture.Simultaneous(
    doubleTapGesture,
    Gesture.Simultaneous(pinchGesture, panGesture)
  );

  const animatedImageStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: tx.value }, { translateY: ty.value }, { scale: scale.value }],
  }));

  // ======= UI =======

  const renderItem = ({ item, index }: { item: MobileArtItem; index: number }) => (
    <TouchableOpacity
      style={{
        flex: 1,
        margin: 6,
        borderRadius: 16,
        backgroundColor: "#f7f7f7",
        overflow: "hidden",
      }}
      activeOpacity={0.8}
      onPress={() => handleOpenFullscreen(index)}
    >
      <View style={{ aspectRatio: 4 / 5, backgroundColor: "#ddd" }}>
        <Image source={{ uri: item.imageUrl }} style={{ width: "100%", height: "100%" }} resizeMode="cover" />
      </View>
      <View style={{ paddingHorizontal: 10, paddingVertical: 8 }}>
        <Text style={{ fontSize: 12, color: "#777" }} numberOfLines={1}>
          {item.category}
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (loading && !refreshing) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: "#fff",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={{ marginTop: 8, color: "#555" }}>Загружаем галерею…</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      {/* Ошибка */}
      {error && (
        <View style={{ paddingHorizontal: 16, paddingVertical: 8, backgroundColor: "#fee" }}>
          <Text style={{ color: "#b00020", fontSize: 12 }}>{error}</Text>
          <TouchableOpacity onPress={loadGallery}>
            <Text style={{ color: "#007AFF", fontSize: 12, marginTop: 4, fontWeight: "600" }}>
              Повторить попытку
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Категории */}
      <View style={{ paddingHorizontal: 8, paddingTop: 8, paddingBottom: 4 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 4 }}>
          {categories.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <TouchableOpacity
                key={cat}
                onPress={() => setSelectedCategory(cat)}
                style={{
                  paddingHorizontal: 14,
                  paddingVertical: 6,
                  borderRadius: 999,
                  borderWidth: 1,
                  borderColor: isActive ? "#111" : "#ccc",
                  backgroundColor: isActive ? "#111" : "#fff",
                  marginRight: 8,
                }}
              >
                <Text style={{ fontSize: 12, fontWeight: "600", color: isActive ? "#fff" : "#333" }}>
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <Text style={{ marginTop: 6, marginLeft: 4, fontSize: 12, color: "#777" }}>
          Найдено: {filteredItems.length}
        </Text>
      </View>

      {/* Сетка */}
      <FlatList
        data={filteredItems}
        key={`${NUM_COLS}-${isLandscape ? "land" : "port"}`} // ✅ форс-ререндер сетки при повороте
        keyExtractor={(item) => item.id}
        numColumns={NUM_COLS}
        contentContainerStyle={{ padding: 8, paddingBottom: 24 }}
        renderItem={renderItem}
        columnWrapperStyle={NUM_COLS > 1 ? { justifyContent: "space-between" } : undefined}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          !loading ? (
            <View style={{ alignItems: "center", justifyContent: "center", padding: 32 }}>
              <Text style={{ color: "#555", marginBottom: 6 }}>Пока здесь пусто.</Text>
              <Text style={{ color: "#999", fontSize: 12, textAlign: "center" }}>
                Добавь работы на сайте, и они появятся в приложении.
              </Text>
            </View>
          ) : null
        }
      />

      {/* FULLSCREEN */}
      {fullscreenIndex !== null && (
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.97)",
            zIndex: 999,
          }}
        >
          {/* TOP BAR overlay */}
          <SafeAreaView
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              zIndex: 1000,
              paddingHorizontal: 16,
              paddingTop: 8,
              height: TOP_BAR_HEIGHT,
              justifyContent: "center",
            }}
          >
            <View style={{ height: 52, justifyContent: "center" }}>
              {/* слева: категория */}
              <View style={{ position: "absolute", left: 0, right: 120 }}>
                <Text style={{ color: "#fff", fontSize: 14 }} numberOfLines={1}>
                  {filteredItems[fullscreenIndex]?.category}
                </Text>
              </View>

              {/* центр: скачать */}
              <TouchableOpacity
                onPress={downloadCurrent}
                activeOpacity={0.85}
                style={{
                  alignSelf: "center",
                  paddingHorizontal: 14,
                  paddingVertical: 8,
                  borderRadius: 999,
                  backgroundColor: "rgba(255,255,255,0.12)",
                  borderWidth: 1,
                  borderColor: "rgba(255,255,255,0.25)",
                }}
              >
                <Text style={{ color: "#fff", fontSize: 13, fontWeight: "700" }}>Скачать</Text>
              </TouchableOpacity>

              {/* справа: крест */}
              <TouchableOpacity
                onPress={handleCloseFullscreen}
                hitSlop={14}
                style={{
                  position: "absolute",
                  right: 0,
                  width: 52,
                  height: 52,
                  borderRadius: 26,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text style={{ color: "#fff", fontSize: 40, fontWeight: "700", marginTop: -4 }}>
                  ×
                </Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>

          <FlatList
            data={filteredItems}
            key={`fs-${W}-${H}`} // ✅ форс-ререндер пейджинга при повороте
            keyExtractor={(item) => item.id}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(e) => handleFullscreenScrollEnd(e, filteredItems.length)}
            // ✅ листаем только когда не увеличено
            scrollEnabled={!isZoomed}
            // ✅ делаем “1 экран = 1 item” по текущей ширине
            getItemLayout={(_, index) => ({
              length: W,
              offset: W * index,
              index,
            })}
            // ✅ в RN initialScrollIndex иногда не срабатывает корректно при смене размеров,
            // поэтому используем offset
            initialScrollIndex={undefined as any}
            initialScrollOffset={W * fullscreenIndex}
            extraData={`${W}-${H}-${fullscreenIndex}-${isZoomed}`} // обновлять рендер при повороте/изменениях
            renderItem={({ item }) => (
              <View
                style={{
                  width: W,
                  height: H,
                  alignItems: "center",
                  justifyContent: "center",
                  paddingTop: TOP_BAR_HEIGHT,
                  paddingBottom: 16,
                }}
              >
                <GestureDetector gesture={composedGesture}>
                  <Animated.Image
                    source={{ uri: item.imageUrl }}
                    style={[{ width: viewW, height: viewH }, animatedImageStyle]}
                    resizeMode="contain"
                  />
                </GestureDetector>
              </View>
            )}
          />
        </View>
      )}
    </SafeAreaView>
  );
}
