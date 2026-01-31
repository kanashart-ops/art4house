import React from "react";
import {
    Dimensions,
    Image,
    StyleSheet,
    Text,
    View,
    ViewStyle,
} from "react-native";
import { GestureDetector, type GestureType } from "react-native-gesture-handler";
import type { AnimatedStyleProp } from "react-native-reanimated";
import Animated from "react-native-reanimated";
import ViewShot from "react-native-view-shot";

import type { ArtItem } from "../data/assets";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

type TryOnStageProps = {
  backgroundImage: string;
  selectedArt: ArtItem | null;
  isLandscape: boolean;
  artWrapperStyle: AnimatedStyleProp<ViewStyle>;
  wallStyle: AnimatedStyleProp<ViewStyle>;
  combo: GestureType;
  isCapturing: boolean;
  viewShotRef: React.RefObject<ViewShot | null>;
};

export default function TryOnStage({
  backgroundImage,
  selectedArt,
  isLandscape,
  artWrapperStyle,
  wallStyle,
  combo,
  isCapturing,
  viewShotRef,
}: TryOnStageProps) {
  return (
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
                  <Animated.View
                    style={[styles.artBox, artWrapperStyle, { aspectRatio: selectedArt.aspectRatio }]}
                  >
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
}

const styles = StyleSheet.create({
  stage: { width: SCREEN_WIDTH, height: "100%", backgroundColor: "#111" },
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
});
