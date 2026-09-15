import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors, radius, spacing } from "../theme";

interface BadgeProps {
  label: string;
  color?: string;
  muted?: boolean;
}

export function Badge({ label, color = colors.red, muted }: BadgeProps) {
  return (
    <View
      style={[
        styles.badge,
        { borderColor: color },
        muted && styles.muted,
      ]}
    >
      <Text style={[styles.label, { color: muted ? colors.steel : color }]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.sm,
    borderWidth: 1,
    alignSelf: "flex-start",
  },
  muted: {
    borderColor: colors.steel,
  },
  label: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
  },
});
