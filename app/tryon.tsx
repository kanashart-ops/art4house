// app/tryon.tsx
import Slider from "@react-native-community/slider";
import { useFocusEffect } from "@react-navigation/native";
import { useLocalSearchParams, useNavigation } from "expo-router";
import * as ScreenOrientation from "expo-screen-orientation";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSharedValue, withTiming } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import ViewShot from "react-native-view-shot";

import BgPickerModal from "../src/tryon/components/BgPickerModal";
import BottomPanel from "../src/tryon/components/BottomPanel";
import LandscapeUI from "../src/tryon/components/LandscapeUI";
import TryOnStage from "../src/tryon/components/TryOnStage";
import { DEFAULT_BG_URI, SAMPLE_ARTS, SAMPLE_FONS, type ArtItem } from "../src/tryon/data/assets";
import { useGestures } from "../src/tryon/hooks/useGestures";
import { useMedia } from "../src/tryon/hooks/useMedia";
import { useTransforms } from "../src/tryon/hooks/useTransforms";

export default function TryOn() {
  const [backgroundImage, setBackgroundImage] = useState<string>(DEFAULT_BG_URI);
  const [selectedArt, setSelectedArt] = useState<ArtItem | null>(null);
  const [bgPickerOpen, setBgPickerOpen] = useState(false);

  const [activeLayerState, setActiveLayerState] = useState<"art" | "wall">("art");
  const [isLandscape, setIsLandscape] = useState(false);
  const [panelMode, setPanelMode] = useState<"arts" | "bg">("arts");
  const [bottomPanelOpen, setBottomPanelOpen] = useState(false);
  const [showPerspectivePanelPortrait, setShowPerspectivePanelPortrait] = useState(false);
  const [landscape3DOpen, setLandscape3DOpen] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [arts, setArts] = useState<ArtItem[]>(SAMPLE_ARTS);
  const [perspX, setPerspX] = useState(0);
  const [perspY, setPerspY] = useState(0);

  const navigation = useNavigation();
  const viewShotRef = useRef<ViewShot | null>(null);

  const {
    artRotateX,
    artRotateY,
    artRotation,
    artScale,
    artStartRotation,
    artStartScale,
    artStartX,
    artStartY,
    artTranslateX,
    artTranslateY,
    artWrapperStyle,
    resetTransform,
    wallRotation,
    wallScale,
    wallStartRotation,
    wallStartScale,
    wallStartX,
    wallStartY,
    wallStyle,
    wallTranslateX,
    wallTranslateY,
  } = useTransforms();

  const activeLayer = useSharedValue<"art" | "wall">("art");

  const { combo } = useGestures({
    activeLayer,
    artRotation,
    artScale,
    artStartRotation,
    artStartScale,
    artStartX,
    artStartY,
    artTranslateX,
    artTranslateY,
    wallRotation,
    wallScale,
    wallStartRotation,
    wallStartScale,
    wallStartX,
    wallStartY,
    wallTranslateX,
    wallTranslateY,
  });

  const { addUserArt, pickBackground, saveToGallery } = useMedia({
    backgroundImage,
    selectedArt,
    setBackgroundImage,
    setSelectedArt,
    setArts,
    resetTransform,
    setPerspX,
    setPerspY,
    artTranslateX,
    artTranslateY,
    artScale,
    artRotation,
    artRotateX,
    artRotateY,
    viewShotRef,
    setIsCapturing,
  });

  const params = useLocalSearchParams<{ paintingId?: string; bgId?: string }>();

  const normalizeArtId = (id?: string) => {
    if (!id) return undefined;
    const m = String(id).match(/\d+/);
    return m ? m[0] : String(id);
  };

  const normalizeBgId = (id?: string) => {
    if (!id) return undefined;
    const m = String(id).match(/\d+/);
    return m ? m[0] : String(id);
  };

  useEffect(() => {
    const bgKey = normalizeBgId(params.bgId);
    const artKey = normalizeArtId(params.paintingId);

    if (bgKey) {
      const bg = SAMPLE_FONS.find((b) => b.id === bgKey);
      if (bg) setBackgroundImage(bg.uri);
      else setBackgroundImage(DEFAULT_BG_URI);
    } else {
      setBackgroundImage(DEFAULT_BG_URI);
    }

    if (artKey) {
      const art = SAMPLE_ARTS.find((a) => a.id === artKey);
      if (art) setSelectedArt(art);
    }
  }, [params.bgId, params.paintingId]);

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

  const resetAllTransforms = () => {
    resetTransform();
    setPerspX(0);
    setPerspY(0);
  };

  const resetArtTransform = () => {
    artTranslateX.value = withTiming(0);
    artTranslateY.value = withTiming(0);
    artScale.value = withTiming(1);
    artRotation.value = withTiming(0);
    artRotateX.value = withTiming(0);
    artRotateY.value = withTiming(0);
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
        setShowPerspectivePanelPortrait(false);
      }
    } catch (e) {
      console.warn(e);
      Alert.alert("Ошибка", "Не удалось сменить ориентацию экрана.");
    }
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

  const handleSelectArt = (art: ArtItem) => {
    setSelectedArt(art);
    resetArtTransform();
  };

  const handleSelectBackground = (uri: string) => {
    setBackgroundImage(uri);
    resetAllTransforms();
  };

  const handleResetPerspective = () => {
    setPerspX(0);
    setPerspY(0);
    artRotateX.value = withTiming(0);
    artRotateY.value = withTiming(0);
  };

  const renderLayerMini = () => (
    <View style={styles.layerMiniContainer}>
      <Text style={styles.layerMiniLabel}>Слой</Text>
      <View style={styles.layerMiniButtons}>
        <TouchableOpacity
          style={[styles.layerMiniButton, activeLayerState === "art" && styles.layerMiniButtonActive]}
          onPress={() => {
            setActiveLayerState("art");
            activeLayer.value = "art";
          }}
        >
          <Text style={[styles.layerMiniButtonText, activeLayerState === "art" && styles.layerMiniButtonTextActive]}>
            1
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.layerMiniButton, activeLayerState === "wall" && styles.layerMiniButtonActive]}
          onPress={() => {
            setActiveLayerState("wall");
            activeLayer.value = "wall";
          }}
        >
          <Text style={[styles.layerMiniButtonText, activeLayerState === "wall" && styles.layerMiniButtonTextActive]}>
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

  const renderPerspectivePanelPortrait = () => {
    if (!showPerspectivePanelPortrait) return null;

    const MIN = -0.8;
    const MAX = 0.8;

    return (
      <View style={styles.perspPanelPortrait}>
        <View style={styles.perspHeaderRow}>
          <Text style={styles.perspTitle}>Перспектива</Text>

          <TouchableOpacity style={styles.perspResetBtn} onPress={handleResetPerspective}>
            <Text style={styles.perspResetText}>Сброс</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.perspCloseBtn} onPress={() => setShowPerspectivePanelPortrait(false)}>
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

  // ====== РЕНДЕР ======

  if (isLandscape) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.landscapeWrapper}>
          <TryOnStage
            backgroundImage={backgroundImage}
            selectedArt={selectedArt}
            isLandscape
            artWrapperStyle={artWrapperStyle}
            wallStyle={wallStyle}
            combo={combo}
            isCapturing={isCapturing}
            viewShotRef={viewShotRef}
          />

          <BgPickerModal
            visible={bgPickerOpen}
            backgrounds={SAMPLE_FONS}
            backgroundImage={backgroundImage}
            onClose={() => setBgPickerOpen(false)}
            onPickFromGallery={() => {
              setBgPickerOpen(false);
              pickBackground();
            }}
            onSelectBackground={(uri) => {
              handleSelectBackground(uri);
              setBgPickerOpen(false);
            }}
          />

          <LandscapeUI
            arts={arts}
            selectedArt={selectedArt}
            onSelectArt={handleSelectArt}
            onAddUserArt={addUserArt}
            onSave={saveToGallery}
            onExit={confirmExitLandscape}
            onPickBackground={() => setBgPickerOpen(true)}
            onToggleOrientation={toggleOrientation}
            onShowHelp={showHelp}
            onReset={resetAllTransforms}
            landscape3DOpen={landscape3DOpen}
            onToggleLandscape3D={() => setLandscape3DOpen((v) => !v)}
            perspX={perspX}
            perspY={perspY}
            onChangePerspX={(v) => {
              setPerspX(v);
              artRotateX.value = v;
            }}
            onChangePerspY={(v) => {
              setPerspY(v);
              artRotateY.value = v;
            }}
            onCompletePerspX={(v) => {
              artRotateX.value = withTiming(v);
            }}
            onCompletePerspY={(v) => {
              artRotateY.value = withTiming(v);
            }}
            onResetPerspective={handleResetPerspective}
            layerMini={renderLayerMini()}
            orientationIcon={<OrientationIcon />}
          />
        </View>
      </SafeAreaView>
    );
  }

  // ====== ПОРТРЕТ ======
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.stageWrapper}>
        <TryOnStage
          backgroundImage={backgroundImage}
          selectedArt={selectedArt}
          isLandscape={false}
          artWrapperStyle={artWrapperStyle}
          wallStyle={wallStyle}
          combo={combo}
          isCapturing={isCapturing}
          viewShotRef={viewShotRef}
        />

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

        <View style={styles.overlayBottomArea}>
          <View style={styles.thumbsTitleRow}>
            <TouchableOpacity onPress={() => setBottomPanelOpen((v) => !v)} style={styles.bottomOpenBtn}>
              <Text style={styles.bottomOpenBtnText}>
                {bottomPanelOpen ? "Скрыть панель" : "Картины / Редактирование"}
              </Text>
            </TouchableOpacity>
          </View>

          <BottomPanel
            open={bottomPanelOpen}
            panelMode={panelMode}
            arts={arts}
            backgrounds={SAMPLE_FONS}
            selectedArt={selectedArt}
            backgroundImage={backgroundImage}
            onSelectArt={handleSelectArt}
            onSelectBackground={handleSelectBackground}
            onAddUserArt={addUserArt}
            onClose={() => setBottomPanelOpen(false)}
            onSetPanelMode={setPanelMode}
            onTogglePerspective={() => setShowPerspectivePanelPortrait((p) => !p)}
            onReset={resetAllTransforms}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },

  stageWrapper: { flex: 1, position: "relative", alignItems: "center", justifyContent: "center" },
  landscapeWrapper: { flex: 1, position: "relative", backgroundColor: "#000" },

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

  thumbsTitleRow: { paddingHorizontal: 12, marginBottom: 4 },

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

  bottomOpenBtn: {
    alignSelf: "flex-start",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.14)",
  },
  bottomOpenBtnText: { color: "#fff", fontWeight: "700", fontSize: 12 },

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

  sliderLabel: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 6,
  },
});
