import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { colors, spacing } from "../theme";
import { useClickSound } from "../audio/useClickSound";

type Variant = "primary" | "secondary" | "danger";

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: Variant;
  disabled?: boolean;
}

const FILL: Record<Variant, string> = {
  primary: colors.red,
  secondary: "transparent",
  danger: colors.redDark,
};

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
          scale.value = withTiming(0.96, { duration: 70, easing: Easing.out(Easing.quad) });
        }}
        onPressOut={() => {
          scale.value = withTiming(1, { duration: 90, easing: Easing.out(Easing.quad) });
        }}
        disabled={disabled}
        style={({ pressed }) => [pressed && !disabled && styles.pressed, disabled && styles.disabled]}
      >
        <View
          style={[
            styles.base,
            { backgroundColor: FILL[variant] },
            variant === "secondary" && styles.secondary,
          ]}
        >
          <Text style={[styles.label, variant === "secondary" && styles.labelSecondary]}>{label}</Text>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    alignItems: "center",
    justifyContent: "center",
  },
  secondary: {
    borderWidth: 1,
    borderColor: colors.steel,
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
    fontSize: 13,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  labelSecondary: {
    color: colors.offWhite,
  },
});
