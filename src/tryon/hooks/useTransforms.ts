import { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";

export const useTransforms = () => {
  const artTranslateX = useSharedValue(0);
  const artTranslateY = useSharedValue(0);
  const artScale = useSharedValue(1);
  const artRotation = useSharedValue(0);

  const artStartX = useSharedValue(0);
  const artStartY = useSharedValue(0);
  const artStartScale = useSharedValue(1);
  const artStartRotation = useSharedValue(0);

  const artRotateX = useSharedValue(0);
  const artRotateY = useSharedValue(0);

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
  };

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

  return {
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
  };
};
