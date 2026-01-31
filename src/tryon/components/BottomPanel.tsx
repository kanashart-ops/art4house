import React from "react";
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import type { ArtItem, BgItem } from "../data/assets";

const IMAGE_SIZE = 80;

type BottomPanelProps = {
  open: boolean;
  panelMode: "arts" | "bg";
  arts: ArtItem[];
  backgrounds: BgItem[];
  selectedArt: ArtItem | null;
  backgroundImage: string;
  onSelectArt: (art: ArtItem) => void;
  onSelectBackground: (uri: string) => void;
  onAddUserArt: () => void;
  onClose: () => void;
  onSetPanelMode: (mode: "arts" | "bg") => void;
  onTogglePerspective: () => void;
  onReset: () => void;
};

export default function BottomPanel({
  open,
  panelMode,
  arts,
  backgrounds,
  selectedArt,
  backgroundImage,
  onSelectArt,
  onSelectBackground,
  onAddUserArt,
  onClose,
  onSetPanelMode,
  onTogglePerspective,
  onReset,
}: BottomPanelProps) {
  if (!open) return null;

  const renderPlusThumbPortrait = () => (
    <TouchableOpacity onPress={onAddUserArt} style={{ marginRight: 8 }}>
      <View style={styles.plusThumb}>
        <Text style={styles.plusThumbText}>＋</Text>
      </View>
    </TouchableOpacity>
  );

  const renderArtsList = () => (
    <FlatList
      data={arts}
      horizontal
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.thumbsContainerPortrait}
      ListHeaderComponent={renderPlusThumbPortrait}
      renderItem={({ item }) => {
        const isActive = selectedArt?.id === item.id;
        return (
          <TouchableOpacity onPress={() => onSelectArt(item)} style={{ marginRight: 8 }}>
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
  );

  const renderBgList = () => (
    <FlatList
      data={backgrounds}
      horizontal
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.thumbsContainerPortrait}
      renderItem={({ item }) => {
        const isActive = backgroundImage === item.uri;
        return (
          <TouchableOpacity
            onPress={() => onSelectBackground(item.uri)}
            style={{ marginRight: 8 }}
            activeOpacity={0.85}
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
  );

  return (
    <View style={styles.bottomPanel}>
      <View style={styles.bottomTabsRow}>
        <Text style={styles.bottomTitle}>Инструменты</Text>

        <TouchableOpacity onPress={onClose} style={styles.bottomCloseBtn}>
          <Text style={styles.bottomCloseText}>✕</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.toolsRow}>
        <TouchableOpacity
          onPress={() => onSetPanelMode("arts")}
          style={[styles.toolsBtn, panelMode === "arts" && styles.toolsBtnActive]}
        >
          <Text style={styles.toolsBtnText}>Картины</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => onSetPanelMode("bg")}
          style={[styles.toolsBtn, panelMode === "bg" && styles.toolsBtnActive]}
        >
          <Text style={styles.toolsBtnText}>Фоны</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={onTogglePerspective} style={styles.toolsBtn}>
          <Text style={styles.toolsBtnText}>3D</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={onReset} style={styles.toolsBtn}>
          <Text style={styles.toolsBtnText}>Сброс</Text>
        </TouchableOpacity>
      </View>

      {panelMode === "arts" ? renderArtsList() : renderBgList()}
    </View>
  );
}

const styles = StyleSheet.create({
  thumbsContainerPortrait: { paddingHorizontal: 8, paddingBottom: 4 },
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
  toolsBtnActive: { backgroundColor: "rgba(0,122,255,0.35)" },
  toolsBtnText: { color: "#fff", fontWeight: "700", fontSize: 12 },
});
