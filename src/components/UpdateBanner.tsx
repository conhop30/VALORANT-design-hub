import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors, spacing, typography } from "../theme";
import { Button } from "./Button";

interface UpdateBannerProps {
  version: string;
  onDownload: () => void;
  onDismiss: () => void;
}

export function UpdateBanner({ version, onDownload, onDismiss }: UpdateBannerProps) {
  return (
    <View style={styles.banner}>
      <View style={styles.text}>
        <Text style={typography.subtitle}>Update available</Text>
        <Text style={typography.caption}>Version {version} is out. Download it to update.</Text>
      </View>
      <View style={styles.actions}>
        <Button label="Later" variant="secondary" onPress={onDismiss} />
        <Button label="Download" onPress={onDownload} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
    padding: spacing.md,
    marginBottom: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.steel,
    borderLeftWidth: 3,
    borderLeftColor: colors.red,
  },
  text: {
    flexShrink: 1,
    minWidth: 180,
  },
  actions: {
    flexDirection: "row",
    gap: spacing.sm,
  },
});
