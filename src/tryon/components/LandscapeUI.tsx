import Slider from "@react-native-community/slider";
import React, { useEffect, useMemo, useRef } from "react";
import {
    FlatList,
    Image,
    NativeScrollEvent,
    NativeSyntheticEvent,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

import type { ArtItem } from "../data/assets";

const LOOP_MULT = 5;
const LOOP_ITEM_H = 78;

type ArtRow =
  | { kind: "add"; id: string }
  | { kind: "art"; id: string; art: ArtItem };

type LandscapeUIProps = {
  arts: ArtItem[];
  selectedArt: ArtItem | null;
  onSelectArt: (art: ArtItem) => void;
  onAddUserArt: () => void;
  onSave: () => void;
  onExit: () => void;
  onPickBackground: () => void;
  onToggleOrientation: () => void;
  onShowHelp: () => void;
  onReset: () => void;
  landscape3DOpen: boolean;
  onToggleLandscape3D: () => void;
  perspX: number;
  perspY: number;
  onChangePerspX: (value: number) => void;
  onChangePerspY: (value: number) => void;
  onCompletePerspX: (value: number) => void;
  onCompletePerspY: (value: number) => void;
  onResetPerspective: () => void;
  layerMini: React.ReactNode;
  orientationIcon: React.ReactNode;
};

export default function LandscapeUI({
  arts,
  selectedArt,
  onSelectArt,
  onAddUserArt,
  onSave,
  onExit,
  onPickBackground,
  onToggleOrientation,
  onShowHelp,
  onReset,
  landscape3DOpen,
  onToggleLandscape3D,
  perspX,
  perspY,
  onChangePerspX,
  onChangePerspY,
  onCompletePerspX,
  onCompletePerspY,
  onResetPerspective,
  layerMini,
  orientationIcon,
}: LandscapeUIProps) {
  const rightListRef = useRef<FlatList<ArtRow> | null>(null);

  const baseRows: ArtRow[] = useMemo(() => {
    return [{ kind: "add", id: "__add__" }, ...arts.map((a) => ({ kind: "art", id: a.id, art: a }))];
  }, [arts]);

  const baseLen = baseRows.length;
  const midStartIndex = baseLen * Math.floor(LOOP_MULT / 2);

  const loopRows: ArtRow[] = useMemo(() => {
    const out: ArtRow[] = [];
    for (let i = 0; i < LOOP_MULT; i += 1) {
      baseRows.forEach((r) => {
        if (r.kind === "add") out.push({ kind: "add", id: `__add__-${i}` });
        else out.push({ kind: "art", id: `${r.id}-${i}`, art: r.art });
      });
    }
    return out;
  }, [baseRows]);

  useEffect(() => {
    requestAnimationFrame(() => {
      try {
        rightListRef.current?.scrollToIndex({ index: midStartIndex, animated: false });
      } catch {}
    });
  }, [midStartIndex]);

  const normalizeLoopIndex = (rawIndex: number) => {
    if (baseLen <= 0) return 0;
    const m = rawIndex % baseLen;
    return m < 0 ? m + baseLen : m;
  };

  const handleRightListMomentumEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
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
        <TouchableOpacity onPress={onAddUserArt} style={styles.thumbVerticalItem}>
          <View style={[styles.plusThumb, { width: 70, height: 70, borderRadius: 8 }]}> 
            <Text style={styles.plusThumbText}>＋</Text>
          </View>
        </TouchableOpacity>
      );
    }

    const art = item.art;
    const isActive = selectedArt?.id === art.id;

    return (
      <TouchableOpacity onPress={() => onSelectArt(art)} style={styles.thumbVerticalItem} activeOpacity={0.85}>
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

  return (
    <>
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

      <View style={styles.landscapeTopRight}>
        <TouchableOpacity onPress={onSave} style={styles.iconButton}>
          <Text style={styles.iconButtonText}>⬇️</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={onExit} style={styles.iconButton}>
          <Text style={styles.iconButtonText}>✕</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.overlayLeftColumn}>
        {layerMini}

        <TouchableOpacity onPress={onPickBackground} style={[styles.iconButton, { marginTop: 12 }]}> 
          <Text style={styles.iconButtonText}>📷</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={onToggleOrientation} style={[styles.iconButton, { marginTop: 12 }]}> 
          {orientationIcon}
        </TouchableOpacity>

        <TouchableOpacity onPress={onShowHelp} style={[styles.iconButton, { marginTop: 12 }]}> 
          <Text style={styles.iconButtonText}>?</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={onReset} style={[styles.secondaryButtonSmall, { marginTop: 14 }]}> 
          <Text style={styles.secondaryButtonSmallText}>Сброс</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onToggleLandscape3D}
          style={[styles.secondaryButtonSmall, { marginTop: 8 }]}
        >
          <Text style={styles.secondaryButtonSmallText}>{landscape3DOpen ? "3D: скрыть" : "3D: открыть"}</Text>
        </TouchableOpacity>
      </View>

      {landscape3DOpen && (
        <View style={styles.landscape3DPanel}>
          <View style={styles.landscape3DHeader}>
            <Text style={styles.landscape3DTitle}>3D</Text>

            <TouchableOpacity onPress={onResetPerspective} style={styles.landscape3DResetBtn}>
              <Text style={styles.landscape3DResetText}>Сброс</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.sliderBlock}>
            <Text style={styles.sliderLabel}>Вверх/вниз</Text>
            <Slider
              value={perspX}
              minimumValue={-0.8}
              maximumValue={0.8}
              step={0.01}
              onValueChange={onChangePerspX}
              onSlidingComplete={onCompletePerspX}
              minimumTrackTintColor="rgba(0,122,255,0.9)"
              maximumTrackTintColor="rgba(255,255,255,0.25)"
              thumbTintColor="#ffffff"
            />
          </View>

          <View style={styles.sliderBlock}>
            <Text style={styles.sliderLabel}>Влево/вправо</Text>
            <Slider
              value={perspY}
              minimumValue={-0.8}
              maximumValue={0.8}
              step={0.01}
              onValueChange={onChangePerspY}
              onSlidingComplete={onCompletePerspY}
              minimumTrackTintColor="rgba(0,122,255,0.9)"
              maximumTrackTintColor="rgba(255,255,255,0.25)"
              thumbTintColor="#ffffff"
            />
          </View>

          <TouchableOpacity onPress={onToggleLandscape3D} style={styles.landscape3DCloseBtn}>
            <Text style={styles.landscape3DCloseText}>Скрыть 3D</Text>
          </TouchableOpacity>
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
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
    width: 70,
    height: 70,
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
  iconButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  iconButtonText: { fontSize: 18, color: "#fff" },
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
