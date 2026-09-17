import React from "react";
import { Pressable, StyleSheet, Text } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { colors, radius, spacing } from "../theme";
import { useClickSound } from "../audio/useClickSound";

type Variant = "primary" | "secondary" | "danger";

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: Variant;
  disabled?: boolean;
}

export function Button({ label, onPress, variant = "primary", disabled }: ButtonProps) {
  const playClick = useClickSound();
  const scale = useSharedValue(1);
  const scaleStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Animated.View style={scaleStyle}>
      <Pressable
        onPress={() => {
          playClick();
          onPress();
        }}
        onPressIn={() => {
          scale.value = withTiming(0.96, { duration: 80 });
        }}
        onPressOut={() => {
          scale.value = withTiming(1, { duration: 120 });
        }}
        disabled={disabled}
        style={({ pressed }) => [
          styles.base,
          variant === "primary" && styles.primary,
          variant === "secondary" && styles.secondary,
          variant === "danger" && styles.danger,
          pressed && !disabled && styles.pressed,
          disabled && styles.disabled,
        ]}
      >
        <Text
          style={[
            styles.label,
            variant === "secondary" && styles.labelSecondary,
          ]}
        >
          {label}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  primary: {
    backgroundColor: colors.red,
  },
  secondary: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: colors.steel,
  },
  danger: {
    backgroundColor: colors.redDark,
  },
  pressed: {
    opacity: 0.8,
  },
  disabled: {
    opacity: 0.4,
  },
  label: {
    color: colors.ink,
    fontWeight: "700",
    fontSize: 14,
  },
  labelSecondary: {
    color: colors.offWhite,
  },
});
