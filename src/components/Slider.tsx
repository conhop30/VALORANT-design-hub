import React, { useCallback, useRef, useState } from "react";
import { GestureResponderEvent, LayoutChangeEvent, PanResponder, StyleSheet, View } from "react-native";
import { colors } from "../theme";

interface SliderProps {
  /** 0..1 */
  value: number;
  onChange: (value: number) => void;
}

const THUMB_SIZE = 18;
const TRACK_HEIGHT = 6;

function clamp01(n: number) {
  return Math.min(1, Math.max(0, n));
}

/** Minimal 0..1 slider — track + fill + thumb, drag or tap-to-seek. No external dependency needed for a single continuous value. */
export function Slider({ value, onChange }: SliderProps) {
  const [trackWidth, setTrackWidth] = useState(0);
  const trackWidthRef = useRef(0);

  const handleLayout = useCallback((e: LayoutChangeEvent) => {
    trackWidthRef.current = e.nativeEvent.layout.width;
    setTrackWidth(e.nativeEvent.layout.width);
  }, []);

  const updateFromLocationX = useCallback(
    (locationX: number) => {
      if (trackWidthRef.current <= 0) return;
      onChange(clamp01(locationX / trackWidthRef.current));
    },
    [onChange]
  );

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (e: GestureResponderEvent) => updateFromLocationX(e.nativeEvent.locationX),
      onPanResponderMove: (e: GestureResponderEvent) => updateFromLocationX(e.nativeEvent.locationX),
    })
  ).current;

  const thumbLeft = clamp01(value) * trackWidth;

  return (
    <View style={styles.wrapper} onLayout={handleLayout} {...panResponder.panHandlers}>
      <View style={styles.track}>
        <View style={[styles.fill, { width: thumbLeft }]} />
      </View>
      <View style={[styles.thumb, { left: thumbLeft - THUMB_SIZE / 2 }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    height: 24,
    justifyContent: "center",
    // Generous hit area beyond the visual track, since the thumb itself is small.
    paddingVertical: 9,
  },
  track: {
    height: TRACK_HEIGHT,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.steel,
  },
  fill: {
    height: TRACK_HEIGHT,
    backgroundColor: colors.red,
  },
  thumb: {
    position: "absolute",
    top: 3,
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    backgroundColor: colors.offWhite,
    borderWidth: 2,
    borderColor: colors.red,
    transform: [{ rotate: "45deg" }],
  },
});
