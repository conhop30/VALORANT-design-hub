import React, { useState } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { colors, spacing, typography } from "../theme";
import { Button } from "./Button";

interface ImagePickerFieldProps {
  label: string;
  value?: string;
  onChange: (uri: string | undefined) => void;
  /** Square thumbnail side length, in px. */
  size?: number;
}

export function ImagePickerField({ label, value, onChange, size = 96 }: ImagePickerFieldProps) {
  const [error, setError] = useState<string | null>(null);

  const handlePick = async () => {
    setError(null);
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setError("Photo library access was denied.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images",
      base64: true,
      quality: 0.6,
    });

    if (result.canceled || !result.assets?.[0]?.base64) return;
    onChange(`data:image/jpeg;base64,${result.assets[0].base64}`);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.row}>
        <View style={[styles.thumb, { width: size, height: size }]}>
          {value ? (
            <Image source={{ uri: value }} style={styles.thumbImage} resizeMode="cover" />
          ) : (
            <Text style={styles.thumbPlaceholder}>No image</Text>
          )}
        </View>
        <View style={styles.actions}>
          <Button label={value ? "Change" : "Choose Image"} variant="secondary" onPress={handlePick} />
          {value && <Button label="Remove" variant="secondary" onPress={() => onChange(undefined)} />}
        </View>
      </View>
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.xs,
  },
  label: {
    ...typography.caption,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  thumb: {
    borderWidth: 1,
    borderColor: colors.steel,
    backgroundColor: colors.ink,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  thumbImage: {
    width: "100%",
    height: "100%",
  },
  thumbPlaceholder: {
    ...typography.caption,
    textAlign: "center",
  },
  actions: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  error: {
    ...typography.caption,
    color: colors.warning,
  },
});
