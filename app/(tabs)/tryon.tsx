// app/(tabs)/tryon.tsx
import Slider from "@react-native-community/slider";
import { useFocusEffect } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import * as MediaLibrary from "expo-media-library";
import { useNavigation } from "expo-router";
import * as ScreenOrientation from "expo-screen-orientation";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Dimensions,
  FlatList,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import ViewShot from "react-native-view-shot";

import art1 from "../../assets/art1.jpg";
import art10 from "../../assets/art10.jpg";
import art11 from "../../assets/art11.jpg";
import art12 from "../../assets/art12.jpg";
import art13 from "../../assets/art13.jpg";
import art14 from "../../assets/art14.jpg";
import art15 from "../../assets/art15.jpg";
import art16 from "../../assets/art16.jpg";
import art17 from "../../assets/art17.jpg";
import art18 from "../../assets/art18.jpg";
import art19 from "../../assets/art19.jpg";
import art2 from "../../assets/art2.jpg";
import art3 from "../../assets/art3.jpg";
import art4 from "../../assets/art4.jpg";
import art5 from "../../assets/art5.jpg";
import art6 from "../../assets/art6.jpg";
import art7 from "../../assets/art7.jpg";
import art8 from "../../assets/art8.jpg";
import art9 from "../../assets/art9.jpg";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const IMAGE_SIZE = 80;

// --- тип картинки ---
type ArtItem = {
  id: string;
  title: string;
  uri: string;
  aspectRatio: number; // width / height
};

// helper, чтобы сразу взять uri и пропорции из ассета
function createArt(id: string, title: string, asset: any): ArtItem {
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

const SAMPLE_ARTS: ArtItem[] = [
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

// плавающий таббар (чуть выше системных кнопок) — это стиль "по умолчанию" для возврата назад
const BASE_TABBAR_STYLE = {
  backgroundColor: "#fff",
  borderTopColor: "transparent",
  position: "absolute" as const,
  left: 16,
  right: 16,
  bottom: 18,
  height: 64,
  borderRadius: 16,
  paddingBottom: 10,
  paddingTop: 6,
  elevation: 10,
  shadowColor: "#000",
  shadowOpacity: 0.12,
  shadowRadius: 6,
  shadowOffset: { width: 0, height: 2 },
} as const;

// ✅ круговой список (плюсик как обычный item)
type ArtRow =
  | { kind: "add"; id: string }
  | { kind: "art"; id: string; art: ArtItem };

const LOOP_MULT = 5;
// высота элемента в правом списке (70 + marginBottom 8) => 78
const LOOP_ITEM_H = 78;

export default function TryOn() {
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
  const [selectedArt, setSelectedArt] = useState<ArtItem | null>(null);
  const [activeLayerState, setActiveLayerState] = useState<"art" | "wall">("art");

  // ✅ ориентация только по кнопке
  const [isLandscape, setIsLandscape] = useState(false);

  // портретная нижняя панель
  const [bottomPanelOpen, setBottomPanelOpen] = useState(false);

  // ✅ ВОТ ЭТО ВЕРНУЛ: 3D в портрете (в панели инструментов)
  const [showPerspectivePanelPortrait, setShowPerspectivePanelPortrait] = useState(false);

  // ✅ 3D слева в ландшафте
  const [landscape3DOpen, setLandscape3DOpen] = useState(false);

  const [isCapturing, setIsCapturing] = useState(false);

  // ✅ Список картин в state (чтобы добавлять пользовательские)
  const [arts, setArts] = useState<ArtItem[]>(SAMPLE_ARTS);

  // ✅ значения слайдеров (перспектива) — одни и те же для портрета/ландшафта
  const [perspX, setPerspX] = useState(0); // -0.8..0.8
  const [perspY, setPerspY] = useState(0); // -0.8..0.8

  const navigation = useNavigation();
  const activeLayer = useSharedValue<"art" | "wall">("art");
  const viewShotRef = useRef<ViewShot | null>(null);

  // ✅ круговой список справа (ref)
  const rightListRef = useRef<FlatList<ArtRow> | null>(null);

  // ✅ СКРЫВАЕМ tabBar в примерочной полностью (и возвращаем обратно при уходе)
  useFocusEffect(
    useCallback(() => {
      navigation.setOptions({
        tabBarStyle: { display: "none" },
      });

      return () => {
        navigation.setOptions({
          tabBarStyle: BASE_TABBAR_STYLE,
        });
      };
    }, [navigation])
  );

  // ✅ при входе: жёстко PORTRAIT (чтобы само не вертелось)
  useFocusEffect(
    useCallback(() => {
      (async () => {
        try {
          await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
          setIsLandscape(false);
          setLandscape3DOpen(false);
          setShowPerspectivePanelPortrait(false);
        } catch {}
      })();

      return () => {
        ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.DEFAULT).catch(() => {});
      };
    }, [])
  );

  // трансформации для картины
  const artTranslateX = useSharedValue(0);
  const artTranslateY = useSharedValue(0);
  const artScale = useSharedValue(1);
  const artRotation = useSharedValue(0);

  const artStartX = useSharedValue(0);
  const artStartY = useSharedValue(0);
  const artStartScale = useSharedValue(1);
  const artStartRotation = useSharedValue(0);

  // перспективный наклон картины
  const artRotateX = useSharedValue(0);
  const artRotateY = useSharedValue(0);

  // трансформации для стены
  const wallTranslateX = useSharedValue(0);
  const wallTranslateY = useSharedValue(0);
  const wallScale = useSharedValue(1);
  const wallRotation = useSharedValue(0);

  const wallStartX = useSharedValue(0);
  const wallStartY = useSharedValue(0);
  const wallStartScale = useSharedValue(1);
  const wallStartRotation = useSharedValue(0);

  const resetTransform = () => {
    artTranslateX.value = withTiming(0);
    artTranslateY.value = withTiming(0);
    artScale.value = withTiming(1);
    artRotation.value = withTiming(0);
    artRotateX.value = withTiming(0);
    artRotateY.value = withTiming(0);

    wallTranslateX.value = withTiming(0);
    wallTranslateY.value = withTiming(0);
    wallScale.value = withTiming(1);
    wallRotation.value = withTiming(0);

    setPerspX(0);
    setPerspY(0);
  };

  const toggleOrientation = async () => {
    try {
      if (isLandscape) {
        await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
        setIsLandscape(false);
        setLandscape3DOpen(false);
      } else {
        await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE_RIGHT);
        setIsLandscape(true);
        setLandscape3DOpen(false);
        // портретный 3D-попап в ландшафте не нужен
        setShowPerspectivePanelPortrait(false);
      }
    } catch (e) {
      console.warn(e);
      Alert.alert("Ошибка", "Не удалось сменить ориентацию экрана.");
    }
  };

  // ✅ выбрать фон (галерея/камера)
  const pickBackground = async () => {
    Alert.alert("Фон", "Выбери источник", [
      { text: "Отмена", style: "cancel" },
      {
        text: "Галерея",
        onPress: async () => {
          const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
          if (status !== "granted") {
            Alert.alert("Нет доступа", "Разреши доступ к галерее, чтобы выбрать фото фона.");
            return;
          }

          const mediaType =
            (ImagePicker as any).MediaType?.Images ?? (ImagePicker as any).MediaTypeOptions?.Images;

          const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: mediaType,
            quality: 1,
          });

          if (!result.canceled) {
            setBackgroundImage(result.assets[0].uri);
            resetTransform();
          }
        },
      },
      {
        text: "Камера",
        onPress: async () => {
          const { status } = await ImagePicker.requestCameraPermissionsAsync();
          if (status !== "granted") {
            Alert.alert("Нет доступа", "Разреши доступ к камере, чтобы сфотографировать стену.");
            return;
          }

          const mediaType =
            (ImagePicker as any).MediaType?.Images ?? (ImagePicker as any).MediaTypeOptions?.Images;

          const result = await ImagePicker.launchCameraAsync({
            mediaTypes: mediaType,
            quality: 1,
          });

          if (!result.canceled) {
            setBackgroundImage(result.assets[0].uri);
            resetTransform();
          }
        },
      },
    ]);
  };

  // ✅ добавить пользовательскую картину: crop только при выборе
  const addUserArt = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Нет доступа", "Разреши доступ к галерее, чтобы добавить свою картину.");
      return;
    }

    const mediaType =
      (ImagePicker as any).MediaType?.Images ?? (ImagePicker as any).MediaTypeOptions?.Images;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: mediaType,
      quality: 1,
      allowsEditing: true,
    });

    if (result.canceled) return;

    const uri = result.assets[0]?.uri;
    if (!uri) return;

    Image.getSize(
      uri,
      (w, h) => {
        const ratio = w && h ? w / h : 1;
        const id = `user-${Date.now()}`;
        const newItem: ArtItem = {
          id,
          title: "Моя картина",
          uri,
          aspectRatio: ratio || 1,
        };

        setArts((prev) => [newItem, ...prev]);
        setSelectedArt(newItem);

        artTranslateX.value = withTiming(0);
        artTranslateY.value = withTiming(0);
        artScale.value = withTiming(1);
        artRotation.value = withTiming(0);
        artRotateX.value = withTiming(0);
        artRotateY.value = withTiming(0);

        setPerspX(0);
        setPerspY(0);
      },
      () => {
        const id = `user-${Date.now()}`;
        const newItem: ArtItem = {
          id,
          title: "Моя картина",
          uri,
          aspectRatio: 1,
        };

        setArts((prev) => [newItem, ...prev]);
        setSelectedArt(newItem);

        artTranslateX.value = withTiming(0);
        artTranslateY.value = withTiming(0);
        artScale.value = withTiming(1);
        artRotation.value = withTiming(0);
        artRotateX.value = withTiming(0);
        artRotateY.value = withTiming(0);

        setPerspX(0);
        setPerspY(0);
      }
    );
  };

  const showHelp = () => {
    Alert.alert(
      "Как пользоваться примерочной",
      [
        "1 — двигаешь и масштабируешь картину.",
        "2 — двигаешь и масштабируешь фон (фото).",
        "Одним пальцем — перемещение.",
        "Двумя пальцами — масштаб и поворот.",
        "В вертикальном режиме: 3D внутри панели «Инструменты».",
        "В горизонтальном режиме: 3D слева, картины справа (круговой скролл).",
        "➕ в списке — добавить свою картину (обрезка только при выборе).",
        "Иконка телефона — смена ориентации (только по кнопке).",
        "⬇️ — сохранить результат.",
      ].join("\n\n")
    );
  };

  const exitTryOn = () => {
    (navigation as any).goBack?.();
  };

  const confirmExitLandscape = () => {
    Alert.alert("Выход", "Действительно хотите выйти?", [
      { text: "Нет", style: "cancel" },
      { text: "Да", style: "destructive", onPress: exitTryOn },
    ]);
  };

  // жесты
  const pan = Gesture.Pan()
    .onStart(() => {
      if (activeLayer.value === "art") {
        artStartX.value = artTranslateX.value;
        artStartY.value = artTranslateY.value;
      } else {
        wallStartX.value = wallTranslateX.value;
        wallStartY.value = wallTranslateY.value;
      }
    })
    .onUpdate((e) => {
      if (activeLayer.value === "art") {
        artTranslateX.value = artStartX.value + e.translationX;
        artTranslateY.value = artStartY.value + e.translationY;
      } else {
        wallTranslateX.value = wallStartX.value + e.translationX;
        wallTranslateY.value = wallStartY.value + e.translationY;
      }
    });

  const pinch = Gesture.Pinch()
    .onStart(() => {
      if (activeLayer.value === "art") {
        artStartScale.value = artScale.value;
      } else {
        wallStartScale.value = wallScale.value;
      }
    })
    .onUpdate((e) => {
      const next = e.scale;
      if (activeLayer.value === "art") {
        const v = artStartScale.value * next;
        artScale.value = Math.min(8, Math.max(0.2, v));
      } else {
        const v = wallStartScale.value * next;
        wallScale.value = Math.min(8, Math.max(0.5, v));
      }
    });

  const rotate = Gesture.Rotation()
    .onStart(() => {
      if (activeLayer.value === "art") {
        artStartRotation.value = artRotation.value;
      } else {
        wallStartRotation.value = wallRotation.value;
      }
    })
    .onUpdate((e) => {
      if (activeLayer.value === "art") {
        artRotation.value = artStartRotation.value + e.rotation;
      } else {
        wallRotation.value = wallStartRotation.value + e.rotation;
      }
    });

  const combo = Gesture.Simultaneous(pan, pinch, rotate);

  const artWrapperStyle = useAnimatedStyle(() => ({
    transform: [
      { perspective: 800 },
      { rotateX: `${artRotateX.value}rad` },
      { rotateY: `${artRotateY.value}rad` },
      { translateX: artTranslateX.value },
      { translateY: artTranslateY.value },
      { rotateZ: `${artRotation.value}rad` },
      { scale: artScale.value },
    ],
  }));

  const wallStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: wallTranslateX.value },
      { translateY: wallTranslateY.value },
      { rotateZ: `${wallRotation.value}rad` },
      { scale: wallScale.value },
    ],
  }));

  const saveToGallery = async () => {
    if (!backgroundImage || !selectedArt) {
      Alert.alert("Нет данных", "Сначала выбери фон и картину.");
      return;
    }

    try {
      const perm = await MediaLibrary.requestPermissionsAsync(true);
      if (!perm.granted) {
        Alert.alert("Нет доступа", "Разреши доступ к фото, чтобы я мог сохранить изображение.");
        return;
      }

      if (!viewShotRef.current?.capture) {
        Alert.alert("Ошибка", "ViewShot не готов (нет capture).");
        return;
      }

      setIsCapturing(true);
      await new Promise((r) => setTimeout(r, 150));

      const uri = await viewShotRef.current.capture();
      if (!uri) {
        Alert.alert("Ошибка", "Не удалось сделать снимок (capture вернул пусто).");
        return;
      }

      await MediaLibrary.createAssetAsync(uri);
      Alert.alert("Готово", "Сохранено в галерею.");
    } catch (e: any) {
      console.warn(e);
      Alert.alert("Ошибка", String(e?.message ?? e));
    } finally {
      setIsCapturing(false);
    }
  };

  // ====== UI ======

  const renderLayerMini = () => (
    <View style={styles.layerMiniContainer}>
      <Text style={styles.layerMiniLabel}>Слой</Text>
      <View style={styles.layerMiniButtons}>
        <TouchableOpacity
          style={[
            styles.layerMiniButton,
            activeLayerState === "art" && styles.layerMiniButtonActive,
          ]}
          onPress={() => {
            setActiveLayerState("art");
            activeLayer.value = "art";
          }}
        >
          <Text
            style={[
              styles.layerMiniButtonText,
              activeLayerState === "art" && styles.layerMiniButtonTextActive,
            ]}
          >
            1
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.layerMiniButton,
            activeLayerState === "wall" && styles.layerMiniButtonActive,
          ]}
          onPress={() => {
            setActiveLayerState("wall");
            activeLayer.value = "wall";
          }}
        >
          <Text
            style={[
              styles.layerMiniButtonText,
              activeLayerState === "wall" && styles.layerMiniButtonTextActive,
            ]}
          >
            2
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const OrientationIcon = () => (
    <View style={[styles.phoneIcon, isLandscape && styles.phoneIconLandscape]}>
      <View style={styles.phoneBody} />
      <View style={styles.phoneHome} />
    </View>
  );

  // портрет: плюсик в горизонтальном списке (как было)
  const renderPlusThumbPortrait = () => (
    <TouchableOpacity onPress={addUserArt} style={{ marginRight: 8 }}>
      <View style={styles.plusThumb}>
        <Text style={styles.plusThumbText}>＋</Text>
      </View>
    </TouchableOpacity>
  );

  // ====== КРУГОВОЙ СПИСОК СПРАВА (ЛАНДШАФТ) ======
  const baseRows: ArtRow[] = useMemo(() => {
    return [{ kind: "add", id: "__add__" }, ...arts.map((a) => ({ kind: "art", id: a.id, art: a }))];
  }, [arts]);

  const baseLen = baseRows.length;
  const midStartIndex = baseLen * Math.floor(LOOP_MULT / 2);

  const loopRows: ArtRow[] = useMemo(() => {
    const out: ArtRow[] = [];
    for (let i = 0; i < LOOP_MULT; i++) {
      baseRows.forEach((r) => {
        if (r.kind === "add") out.push({ kind: "add", id: `__add__-${i}` });
        else out.push({ kind: "art", id: `${r.id}-${i}`, art: r.art });
      });
    }
    return out;
  }, [baseRows]);

  // после входа в landscape — ставим скролл в середину, чтобы было “по кругу”
  useEffect(() => {
    if (!isLandscape) return;
    requestAnimationFrame(() => {
      try {
        rightListRef.current?.scrollToIndex({ index: midStartIndex, animated: false });
      } catch {}
    });
  }, [isLandscape, midStartIndex]);

  const normalizeLoopIndex = (rawIndex: number) => {
    if (baseLen <= 0) return 0;
    const m = rawIndex % baseLen;
    return m < 0 ? m + baseLen : m;
  };

  const handleRightListMomentumEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (!isLandscape) return;
    if (baseLen <= 0) return;

    const offsetY = e.nativeEvent.contentOffset.y;
    const rawIndex = Math.round(offsetY / LOOP_ITEM_H);

    const low = baseLen;
    const high = baseLen * (LOOP_MULT - 1);

    if (rawIndex < low || rawIndex > high) {
      const inBase = normalizeLoopIndex(rawIndex);
      const target = midStartIndex + inBase;
      try {
        rightListRef.current?.scrollToIndex({ index: target, animated: false });
      } catch {}
    }
  };

  const renderRightItem = ({ item }: { item: ArtRow }) => {
    if (item.kind === "add") {
      return (
        <TouchableOpacity onPress={addUserArt} style={styles.thumbVerticalItem}>
          <View style={[styles.plusThumb, { width: 70, height: 70, borderRadius: 8 }]}>
            <Text style={styles.plusThumbText}>＋</Text>
          </View>
        </TouchableOpacity>
      );
    }

    const art = item.art;
    const isActive = selectedArt?.id === art.id;

    return (
      <TouchableOpacity
        onPress={() => {
          setSelectedArt(art);

          artTranslateX.value = withTiming(0);
          artTranslateY.value = withTiming(0);
          artScale.value = withTiming(1);
          artRotation.value = withTiming(0);
          artRotateX.value = withTiming(0);
          artRotateY.value = withTiming(0);

          setPerspX(0);
          setPerspY(0);
        }}
        style={styles.thumbVerticalItem}
        activeOpacity={0.85}
      >
        <Image
          source={{ uri: art.uri }}
          style={{
            width: 70,
            height: 70,
            borderRadius: 8,
            borderWidth: isActive ? 2 : 0,
            borderColor: "#007AFF",
          }}
        />
      </TouchableOpacity>
    );
  };

  // ====== ПОРТРЕТ: 3D панель (вернул) ======
  const renderPerspectivePanelPortrait = () => {
    if (!showPerspectivePanelPortrait) return null;

    const MIN = -0.8;
    const MAX = 0.8;

    return (
      <View style={styles.perspPanelPortrait}>
        <View style={styles.perspHeaderRow}>
          <Text style={styles.perspTitle}>Перспектива</Text>

          <TouchableOpacity
            style={styles.perspResetBtn}
            onPress={() => {
              setPerspX(0);
              setPerspY(0);
              artRotateX.value = withTiming(0);
              artRotateY.value = withTiming(0);
            }}
          >
            <Text style={styles.perspResetText}>Сброс</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.perspCloseBtn}
            onPress={() => setShowPerspectivePanelPortrait(false)}
          >
            <Text style={styles.perspCloseText}>✕</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.sliderBlockPortrait}>
          <Text style={styles.sliderLabel}>Наклон вверх/вниз</Text>
          <Slider
            value={perspX}
            minimumValue={MIN}
            maximumValue={MAX}
            step={0.01}
            onValueChange={(v) => {
              setPerspX(v);
              artRotateX.value = v;
            }}
            onSlidingComplete={(v) => {
              artRotateX.value = withTiming(v);
            }}
            minimumTrackTintColor="rgba(0,122,255,0.9)"
            maximumTrackTintColor="rgba(255,255,255,0.25)"
            thumbTintColor="#ffffff"
          />
        </View>

        <View style={styles.sliderBlockPortrait}>
          <Text style={styles.sliderLabel}>Наклон влево/вправо</Text>
          <Slider
            value={perspY}
            minimumValue={MIN}
            maximumValue={MAX}
            step={0.01}
            onValueChange={(v) => {
              setPerspY(v);
              artRotateY.value = v;
            }}
            onSlidingComplete={(v) => {
              artRotateY.value = withTiming(v);
            }}
            minimumTrackTintColor="rgba(0,122,255,0.9)"
            maximumTrackTintColor="rgba(255,255,255,0.25)"
            thumbTintColor="#ffffff"
          />
        </View>
      </View>
    );
  };

  // ====== портрет нижняя панель ======
  const renderBottomPanel = () => {
    if (!bottomPanelOpen) return null;

    return (
      <View style={styles.bottomPanel}>
        <View style={styles.bottomTabsRow}>
          <Text style={styles.bottomTitle}>Инструменты</Text>

          <TouchableOpacity onPress={() => setBottomPanelOpen(false)} style={styles.bottomCloseBtn}>
            <Text style={styles.bottomCloseText}>✕</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.toolsRow}>
          <TouchableOpacity onPress={resetTransform} style={styles.toolsBtn}>
            <Text style={styles.toolsBtnText}>Сброс</Text>
          </TouchableOpacity>

          {/* ✅ ВЕРНУЛИ 3D В ПОРТРЕТНУЮ ПАНЕЛЬ */}
          <TouchableOpacity
            onPress={() => setShowPerspectivePanelPortrait((p) => !p)}
            style={styles.toolsBtn}
          >
            <Text style={styles.toolsBtnText}>3D</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={arts}
          horizontal
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.thumbsContainerPortrait}
          ListHeaderComponent={renderPlusThumbPortrait}
          renderItem={({ item }) => {
            const isActive = selectedArt?.id === item.id;
            return (
              <TouchableOpacity
                onPress={() => {
                  setSelectedArt(item);

                  artTranslateX.value = withTiming(0);
                  artTranslateY.value = withTiming(0);
                  artScale.value = withTiming(1);
                  artRotation.value = withTiming(0);
                  artRotateX.value = withTiming(0);
                  artRotateY.value = withTiming(0);

                  setPerspX(0);
                  setPerspY(0);
                }}
                style={{ marginRight: 8 }}
              >
                <Image
                  source={{ uri: item.uri }}
                  style={{
                    width: IMAGE_SIZE,
                    height: IMAGE_SIZE,
                    borderRadius: 8,
                    borderWidth: isActive ? 2 : 0,
                    borderColor: "#007AFF",
                  }}
                />
              </TouchableOpacity>
            );
          }}
        />
      </View>
    );
  };

  const renderThumbnailsPortrait = () => (
    <>
      <View style={styles.thumbsTitleRow}>
        <TouchableOpacity onPress={() => setBottomPanelOpen((v) => !v)} style={styles.bottomOpenBtn}>
          <Text style={styles.bottomOpenBtnText}>
            {bottomPanelOpen ? "Скрыть панель" : "Картины / Редактирование"}
          </Text>
        </TouchableOpacity>
      </View>

      {renderBottomPanel()}
    </>
  );

  const renderStageContent = () => (
    <ViewShot
      ref={viewShotRef}
      style={isLandscape ? styles.stageLandscape : styles.stage}
      options={{ format: "jpg", quality: 1 }}
    >
      <View style={{ flex: 1 }}>
        {backgroundImage ? (
          <GestureDetector gesture={combo}>
            <View style={StyleSheet.absoluteFillObject}>
              <Animated.Image
                source={{ uri: backgroundImage }}
                style={[styles.wallImage, wallStyle]}
                resizeMode={isLandscape ? "cover" : "contain"}
              />

              {selectedArt && (
                <View style={styles.artOverlayCenter}>
                  <Animated.View style={[styles.artBox, artWrapperStyle, { aspectRatio: selectedArt.aspectRatio }]}>
                    <View style={styles.artFrame3D}>
                      <Image source={{ uri: selectedArt.uri }} style={styles.artImage} resizeMode="contain" />
                    </View>

                    {isCapturing && (
                      <View style={styles.watermarkUnder}>
                        <Text style={styles.watermarkUnderText}>artforhouse.by</Text>
                      </View>
                    )}
                  </Animated.View>
                </View>
              )}
            </View>
          </GestureDetector>
        ) : (
          <View style={styles.emptyStage}>
            <Text style={styles.emptyStageText}>
              Сначала нажмите кнопку «Добавить фон» сверху{"\n"}
              и выберите фото из галереи{"\n"}
              или сфотографируйте свою стену.{"\n\n"}
              Потом выберите картину{"\n"}
              и перетаскивайте/масштабируйте её на фоне.{"\n\n"}
              ➕ в списке — добавить свою картину.
            </Text>
          </View>
        )}
      </View>
    </ViewShot>
  );

  // ====== ЛАНДШАФТ: 3D СЛЕВА, КАРТИНЫ СПРАВА ======
  const renderLandscape3D = () => {
    const MIN = -0.8;
    const MAX = 0.8;

    if (!landscape3DOpen) return null;

    return (
      <View style={styles.landscape3DPanel}>
        <View style={styles.landscape3DHeader}>
          <Text style={styles.landscape3DTitle}>3D</Text>

          <TouchableOpacity
            onPress={() => {
              setPerspX(0);
              setPerspY(0);
              artRotateX.value = withTiming(0);
              artRotateY.value = withTiming(0);
            }}
            style={styles.landscape3DResetBtn}
          >
            <Text style={styles.landscape3DResetText}>Сброс</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.sliderBlock}>
          <Text style={styles.sliderLabel}>Вверх/вниз</Text>
          <Slider
            value={perspX}
            minimumValue={MIN}
            maximumValue={MAX}
            step={0.01}
            onValueChange={(v) => {
              setPerspX(v);
              artRotateX.value = v;
            }}
            onSlidingComplete={(v) => {
              artRotateX.value = withTiming(v);
            }}
            minimumTrackTintColor="rgba(0,122,255,0.9)"
            maximumTrackTintColor="rgba(255,255,255,0.25)"
            thumbTintColor="#ffffff"
          />
        </View>

        <View style={styles.sliderBlock}>
          <Text style={styles.sliderLabel}>Влево/вправо</Text>
          <Slider
            value={perspY}
            minimumValue={MIN}
            maximumValue={MAX}
            step={0.01}
            onValueChange={(v) => {
              setPerspY(v);
              artRotateY.value = v;
            }}
            onSlidingComplete={(v) => {
              artRotateY.value = withTiming(v);
            }}
            minimumTrackTintColor="rgba(0,122,255,0.9)"
            maximumTrackTintColor="rgba(255,255,255,0.25)"
            thumbTintColor="#ffffff"
          />
        </View>

        <TouchableOpacity
          onPress={() => setLandscape3DOpen(false)}
          style={styles.landscape3DCloseBtn}
        >
          <Text style={styles.landscape3DCloseText}>Скрыть 3D</Text>
        </TouchableOpacity>
      </View>
    );
  };

  // ====== РЕНДЕР ======

  if (isLandscape) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.landscapeWrapper}>
          {renderStageContent()}

          {/* справа: круговой список картин */}
          <View style={styles.overlayRightColumn}>
            <FlatList
              ref={(r) => (rightListRef.current = r)}
              data={loopRows}
              keyExtractor={(item) => item.id}
              renderItem={renderRightItem}
              showsVerticalScrollIndicator
              onMomentumScrollEnd={handleRightListMomentumEnd}
              getItemLayout={(_, index) => ({
                length: LOOP_ITEM_H,
                offset: LOOP_ITEM_H * index,
                index,
              })}
              initialScrollIndex={midStartIndex}
              contentContainerStyle={styles.thumbsContainerVertical}
            />
          </View>

          {/* сверху справа: скачать + выход */}
          <View style={styles.landscapeTopRight}>
            <TouchableOpacity onPress={saveToGallery} style={styles.iconButton}>
              <Text style={styles.iconButtonText}>⬇️</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={confirmExitLandscape} style={styles.iconButton}>
              <Text style={styles.iconButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* слева: слой + фон + ориентация + help + сброс + 3D кнопка */}
          <View style={styles.overlayLeftColumn}>
            {renderLayerMini()}

            <TouchableOpacity onPress={pickBackground} style={[styles.iconButton, { marginTop: 12 }]}>
              <Text style={styles.iconButtonText}>📷</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={toggleOrientation} style={[styles.iconButton, { marginTop: 12 }]}>
              <OrientationIcon />
            </TouchableOpacity>

            <TouchableOpacity onPress={showHelp} style={[styles.iconButton, { marginTop: 12 }]}>
              <Text style={styles.iconButtonText}>?</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={resetTransform} style={[styles.secondaryButtonSmall, { marginTop: 14 }]}>
              <Text style={styles.secondaryButtonSmallText}>Сброс</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setLandscape3DOpen((v) => !v)}
              style={[styles.secondaryButtonSmall, { marginTop: 8 }]}
            >
              <Text style={styles.secondaryButtonSmallText}>{landscape3DOpen ? "3D: скрыть" : "3D: открыть"}</Text>
            </TouchableOpacity>
          </View>

          {renderLandscape3D()}
        </View>
      </SafeAreaView>
    );
  }

  // ПОРТРЕТ (вернул 3D в панель + показываем портретную 3D-панель)
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.stageWrapper}>
        {renderStageContent()}

        {/* ✅ портретная панель 3D (появляется по кнопке 3D в инструментах) */}
        {renderPerspectivePanelPortrait()}

        <View style={styles.overlayTopRow}>
          {renderLayerMini()}

          <TouchableOpacity onPress={pickBackground} style={styles.addWallButton}>
            <Text style={styles.addWallButtonText}>Добавить фон</Text>
          </TouchableOpacity>

          <View style={styles.topRightGroup}>
            <TouchableOpacity onPress={toggleOrientation} style={styles.iconButton}>
              <OrientationIcon />
            </TouchableOpacity>

            <TouchableOpacity onPress={showHelp} style={styles.iconButton}>
              <Text style={styles.iconButtonText}>?</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={saveToGallery} style={styles.iconButton}>
              <Text style={styles.iconButtonText}>⬇️</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={exitTryOn} style={styles.iconButton}>
              <Text style={styles.iconButtonText}>✕</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.overlayBottomArea}>{renderThumbnailsPortrait()}</View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },

  // Портрет
  stageWrapper: { flex: 1, position: "relative", alignItems: "center", justifyContent: "center" },
  stage: { width: SCREEN_WIDTH, height: "100%", backgroundColor: "#111" },

  // Горизонт
  landscapeWrapper: { flex: 1, position: "relative", backgroundColor: "#000" },
  stageLandscape: { width: "100%", height: "100%", backgroundColor: "#111" },

  emptyStage: { flex: 1, alignItems: "center", justifyContent: "center" },
  emptyStageText: { color: "#fff", textAlign: "center", paddingHorizontal: 24, fontSize: 14 },

  wallImage: { width: "100%", height: "100%" },

  artOverlayCenter: { ...StyleSheet.absoluteFillObject, alignItems: "center", justifyContent: "center" },

  artBox: { width: 220 },

  artFrame3D: {
    flex: 1,
    borderRadius: 0,
    borderWidth: 1,
    borderTopColor: "rgba(255,255,255,0.8)",
    borderLeftColor: "rgba(255,255,255,0.8)",
    borderRightColor: "rgba(0,0,0,0.7)",
    borderBottomColor: "rgba(0,0,0,0.7)",
    backgroundColor: "#000",
    overflow: "hidden",
  },

  artImage: { flex: 1, width: "100%", height: "100%" },

  watermarkUnder: {
    position: "absolute",
    right: 4,
    bottom: -18,
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 8,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  watermarkUnderText: {
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 1,
    textTransform: "lowercase",
    color: "rgba(255,255,255,0.75)",
  },

  overlayTopRow: {
    position: "absolute",
    top: 8,
    left: 8,
    right: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  topRightGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  overlayBottomArea: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 50,
    paddingBottom: 8,
    paddingTop: 4,
    backgroundColor: "rgba(0,0,0,0.25)",
  },

  overlayLeftColumn: {
    position: "absolute",
    left: 8,
    top: 12,
    bottom: 12,
    justifyContent: "flex-start",
    alignItems: "flex-start",
    zIndex: 50,
  },

  overlayRightColumn: {
    position: "absolute",
    right: 8,
    top: 12,
    bottom: 12,
    width: 92,
    justifyContent: "center",
    zIndex: 40,
  },

  landscapeTopRight: {
    position: "absolute",
    top: 12,
    right: 110,
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
    zIndex: 60,
  },

  layerMiniContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
    paddingHorizontal: 6,
    borderRadius: 999,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  layerMiniLabel: { fontSize: 11, fontWeight: "600", color: "#fff", marginRight: 4 },
  layerMiniButtons: { flexDirection: "row" },
  layerMiniButton: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: "#777",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 3,
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  layerMiniButtonActive: { backgroundColor: "#e0f0ff", borderColor: "#007AFF" },
  layerMiniButtonText: { fontSize: 11, color: "#ddd" },
  layerMiniButtonTextActive: { color: "#007AFF", fontWeight: "700" },

  addWallButton: {
    flexShrink: 1,
    marginHorizontal: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "#007AFF",
    alignItems: "center",
    justifyContent: "center",
  },
  addWallButtonText: { color: "#fff", fontWeight: "600", fontSize: 12 },

  iconButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  iconButtonText: { fontSize: 18, color: "#fff" },

  phoneIcon: { width: 18, height: 30, alignItems: "center", justifyContent: "center" },
  phoneIconLandscape: { transform: [{ rotate: "90deg" }] },
  phoneBody: { width: 14, height: 24, borderRadius: 4, borderWidth: 2, borderColor: "#fff" },
  phoneHome: {
    position: "absolute",
    bottom: 3,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#fff",
  },

  thumbsTitleRow: { paddingHorizontal: 12, marginBottom: 4 },
  thumbsContainerPortrait: { paddingHorizontal: 8, paddingBottom: 4 },

  thumbsContainerVertical: {
    paddingVertical: 8,
    alignItems: "center",
    paddingBottom: 20,
  },
  thumbVerticalItem: {
    marginBottom: 8,
    height: 70,
    width: 70,
  },

  plusThumb: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.25)",
    backgroundColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  plusThumbText: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "800",
    marginTop: -2,
  },

  secondaryButtonSmall: {
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
  },
  secondaryButtonSmallText: { color: "#fff", fontWeight: "700", fontSize: 12 },

  sliderBlock: { marginBottom: 10, width: 250 },
  sliderLabel: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 6,
  },

  bottomOpenBtn: {
    alignSelf: "flex-start",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.14)",
  },
  bottomOpenBtnText: { color: "#fff", fontWeight: "700", fontSize: 12 },

  bottomPanel: {
    marginTop: 8,
    marginHorizontal: 8,
    borderRadius: 14,
    padding: 10,
    backgroundColor: "rgba(0,0,0,0.72)",
  },
  bottomTabsRow: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  bottomTitle: { color: "#fff", fontWeight: "800", fontSize: 12 },

  bottomCloseBtn: {
    marginLeft: "auto",
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "rgba(255,255,255,0.10)",
    alignItems: "center",
    justifyContent: "center",
  },
  bottomCloseText: { color: "#fff", fontSize: 14, fontWeight: "800" },

  toolsRow: { flexDirection: "row", marginBottom: 10, flexWrap: "wrap", gap: 8 },
  toolsBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.10)",
  },
  toolsBtnText: { color: "#fff", fontWeight: "700", fontSize: 12 },

  // ✅ ПОРТРЕТНАЯ 3D ПАНЕЛЬ (вернул)
  perspPanelPortrait: {
    position: "absolute",
    top: 56,
    left: 8,
    right: 8,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 10,
    backgroundColor: "rgba(0,0,0,0.82)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    zIndex: 999,
  },
  perspHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
  },
  perspTitle: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "900",
    flex: 1,
  },
  perspResetBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.10)",
  },
  perspResetText: { color: "#fff", fontSize: 12, fontWeight: "900" },
  perspCloseBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "rgba(255,255,255,0.10)",
    alignItems: "center",
    justifyContent: "center",
  },
  perspCloseText: { color: "#fff", fontSize: 14, fontWeight: "900" },

  sliderBlockPortrait: { marginBottom: 10 },

  // ✅ 3D панель ландшафта (как было)
  landscape3DPanel: {
    position: "absolute",
    left: 72,
    top: 90,
    borderRadius: 14,
    padding: 12,
    backgroundColor: "rgba(0,0,0,0.86)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
    zIndex: 999,
  },
  landscape3DHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  landscape3DTitle: { color: "#fff", fontWeight: "900", fontSize: 13 },
  landscape3DResetBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.10)",
  },
  landscape3DResetText: { color: "#fff", fontWeight: "900", fontSize: 12 },

  landscape3DCloseBtn: {
    marginTop: 4,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.10)",
    alignItems: "center",
  },
  landscape3DCloseText: { color: "#fff", fontWeight: "900", fontSize: 12 },
});
