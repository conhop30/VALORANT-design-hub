import React, { useEffect, useRef, useState } from "react";
import { LayoutChangeEvent, Pressable, StyleSheet, Text, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { colors, radius, spacing } from "../theme";
import { useClickSound } from "../audio/useClickSound";

interface SegmentedTabsProps<T extends string> {
  options: { key: T; label: string }[];
  value: T;
  onChange: (key: T) => void;
}

interface TabLayout {
  x: number;
  width: number;
}

export function SegmentedTabs<T extends string>({
  options,
  value,
  onChange,
}: SegmentedTabsProps<T>) {
  const playClick = useClickSound();
  const [tabLayouts, setTabLayouts] = useState<Partial<Record<T, TabLayout>>>({});
  const hasPositioned = useRef(false);
  const indicatorX = useSharedValue(0);
  const indicatorWidth = useSharedValue(0);
  const indicatorReady = useSharedValue(0);

  const handleTabLayout = (key: T, e: LayoutChangeEvent) => {
    const { x, width } = e.nativeEvent.layout;
    setTabLayouts((prev) => ({ ...prev, [key]: { x, width } }));
  };

  const activeLayout = tabLayouts[value];

  // Move the indicator to the active tab's measured position whenever it
  // changes — because `value` changed, or a resize moved/resized the tab.
  // The very first time a position is available (mount), snap instead of
  // animating in from (0, 0); every time after that, animate.
  useEffect(() => {
    if (!activeLayout) return;
    if (!hasPositioned.current) {
      indicatorX.value = activeLayout.x;
      indicatorWidth.value = activeLayout.width;
      indicatorReady.value = 1;
      hasPositioned.current = true;
      return;
    }
    indicatorX.value = withTiming(activeLayout.x, { duration: 200 });
    indicatorWidth.value = withTiming(activeLayout.width, { duration: 200 });
  }, [value, activeLayout?.x, activeLayout?.width]);

  const indicatorStyle = useAnimatedStyle(() => ({
    opacity: indicatorReady.value,
    transform: [{ translateX: indicatorX.value }],
    width: indicatorWidth.value,
  }));

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.indicator, indicatorStyle]} />
      {options.map((opt) => {
        const active = opt.key === value;
        return (
          <Pressable
            key={opt.key}
            onPress={() => {
              playClick();
              onChange(opt.key);
            }}
            onLayout={(e) => handleTabLayout(opt.key, e)}
            style={styles.tab}
            hitSlop={8}
          >
            <Text style={[styles.label, active && styles.labelActive]}>
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.xs,
    gap: spacing.xs,
  },
  indicator: {
    position: "absolute",
    top: spacing.xs,
    bottom: spacing.xs,
    left: 0,
    backgroundColor: colors.red,
    borderRadius: radius.sm,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: radius.sm,
    alignItems: "center",
  },
  label: {
    color: colors.offWhite,
    fontWeight: "600",
    fontSize: 14,
  },
  labelActive: {
    color: colors.ink,
  },
});
