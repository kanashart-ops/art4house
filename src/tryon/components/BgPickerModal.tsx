import React from "react";
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import type { BgItem } from "../data/assets";

type BgPickerModalProps = {
  visible: boolean;
  backgrounds: BgItem[];
  backgroundImage: string;
  onClose: () => void;
  onPickFromGallery: () => void;
  onSelectBackground: (uri: string) => void;
};

export default function BgPickerModal({
  visible,
  backgrounds,
  backgroundImage,
  onClose,
  onPickFromGallery,
  onSelectBackground,
}: BgPickerModalProps) {
  if (!visible) return null;

  return (
    <View style={styles.bgModalBackdrop}>
      <View style={styles.bgModalCard}>
        <View style={styles.bgModalHeader}>
          <Text style={styles.bgModalTitle}>Выберите фон</Text>

          <TouchableOpacity onPress={onPickFromGallery} style={styles.bgModalHeaderBtn}>
            <Text style={styles.bgModalHeaderBtnText}>Галерея/Камера</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={onClose} style={styles.bgModalCloseBtn}>
            <Text style={styles.bgModalCloseText}>✕</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={backgrounds}
          keyExtractor={(item) => item.id}
          numColumns={3}
          contentContainerStyle={styles.bgGrid}
          renderItem={({ item }) => {
            const isActive = backgroundImage === item.uri;
            return (
              <TouchableOpacity
                onPress={() => onSelectBackground(item.uri)}
                style={styles.bgCell}
                activeOpacity={0.85}
              >
                <Image source={{ uri: item.uri }} style={[styles.bgThumb, isActive && styles.bgThumbActive]} />
              </TouchableOpacity>
            );
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bgModalBackdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.65)",
    alignItems: "center",
    justifyContent: "center",
    padding: 14,
    zIndex: 9999,
  },
  bgModalCard: {
    width: "100%",
    maxWidth: 520,
    borderRadius: 14,
    backgroundColor: "rgba(0,0,0,0.92)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
    padding: 12,
  },
  bgModalHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
  },
  bgModalTitle: {
    color: "#fff",
    fontWeight: "900",
    fontSize: 13,
    flex: 1,
  },
  bgModalHeaderBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.10)",
  },
  bgModalHeaderBtnText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 12,
  },
  bgModalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.10)",
    alignItems: "center",
    justifyContent: "center",
  },
  bgModalCloseText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "900",
  },
  bgGrid: {
    paddingBottom: 8,
  },
  bgCell: {
    width: "33.33%",
    padding: 6,
  },
  bgThumb: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
  },
  bgThumbActive: {
    borderColor: "#007AFF",
    borderWidth: 2,
  },
});
