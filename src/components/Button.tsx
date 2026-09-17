import React from "react";
import { Pressable, StyleSheet, Text } from "react-native";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { colors, cut, spacing } from "../theme";
import { useClickSound } from "../audio/useClickSound";
import { ClippedSurface } from "./ClippedSurface";

type Variant = "primary" | "secondary" | "danger";

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: Variant;
  disabled?: boolean;
  /** Color behind this button, for the corner-cut mask. Most buttons sit on a card/sheet's `colors.surface`. */
  matte?: string;
}

const FILL: Record<Variant, string> = {
  primary: colors.red,
  secondary: "transparent",
  danger: colors.redDark,
};

export function Button({ label, onPress, variant = "primary", disabled, matte = colors.surface }: ButtonProps) {
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
        <ClippedSurface
          fill={FILL[variant]}
          matte={matte}
          cut={cut.sm}
          borderWidth={variant === "secondary" ? 1 : 0}
          borderColor={variant === "secondary" ? colors.steel : undefined}
          accentColor={variant === "secondary" ? colors.steel : undefined}
          style={styles.base}
        >
          <Text style={[styles.label, variant === "secondary" && styles.labelSecondary]}>{label}</Text>
        </ClippedSurface>
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
