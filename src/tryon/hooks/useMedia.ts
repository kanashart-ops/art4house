import * as ImagePicker from "expo-image-picker";
import * as MediaLibrary from "expo-media-library";
import React from "react";
import { Alert, Image } from "react-native";
import type { SharedValue } from "react-native-reanimated";
import { withTiming } from "react-native-reanimated";
import type ViewShot from "react-native-view-shot";

import type { ArtItem } from "../data/assets";

type UseMediaParams = {
  backgroundImage: string;
  selectedArt: ArtItem | null;
  setBackgroundImage: React.Dispatch<React.SetStateAction<string>>;
  setSelectedArt: React.Dispatch<React.SetStateAction<ArtItem | null>>;
  setArts: React.Dispatch<React.SetStateAction<ArtItem[]>>;
  resetTransform: () => void;
  setPerspX: React.Dispatch<React.SetStateAction<number>>;
  setPerspY: React.Dispatch<React.SetStateAction<number>>;
  artTranslateX: SharedValue<number>;
  artTranslateY: SharedValue<number>;
  artScale: SharedValue<number>;
  artRotation: SharedValue<number>;
  artRotateX: SharedValue<number>;
  artRotateY: SharedValue<number>;
  viewShotRef: React.RefObject<ViewShot | null>;
  setIsCapturing: React.Dispatch<React.SetStateAction<boolean>>;
};

export const useMedia = ({
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
}: UseMediaParams) => {
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

  return { addUserArt, pickBackground, saveToGallery };
};
