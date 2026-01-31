import { Gesture } from "react-native-gesture-handler";
import type { SharedValue } from "react-native-reanimated";

export type ActiveLayer = "art" | "wall";

type UseGesturesParams = {
  activeLayer: SharedValue<ActiveLayer>;
  artRotation: SharedValue<number>;
  artScale: SharedValue<number>;
  artStartRotation: SharedValue<number>;
  artStartScale: SharedValue<number>;
  artStartX: SharedValue<number>;
  artStartY: SharedValue<number>;
  artTranslateX: SharedValue<number>;
  artTranslateY: SharedValue<number>;
  wallRotation: SharedValue<number>;
  wallScale: SharedValue<number>;
  wallStartRotation: SharedValue<number>;
  wallStartScale: SharedValue<number>;
  wallStartX: SharedValue<number>;
  wallStartY: SharedValue<number>;
  wallTranslateX: SharedValue<number>;
  wallTranslateY: SharedValue<number>;
};

export const useGestures = ({
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
}: UseGesturesParams) => {
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

  return { combo };
};
