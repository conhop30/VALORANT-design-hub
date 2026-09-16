import React from "react";
import { Image, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { SlideInRight, SlideOutRight } from "react-native-reanimated";
import { colors } from "../theme";

interface HeroBackdropProps {
  uri: string;
}

/**
 * Ambient background flourish shown behind the whole screen while an agent
 * with a hero image is expanded — not inside the card. Every card and piece
 * of text sits in its own opaque box on top of this, so legibility never
 * depends on how bright/busy the source image is; this only shows through
 * in the gaps (margins, empty space below the list).
 */
export function HeroBackdrop({ uri }: HeroBackdropProps) {
  return (
    <Animated.View
      entering={SlideInRight.duration(450)}
      exiting={SlideOutRight.duration(300)}
      style={StyleSheet.absoluteFill}
      pointerEvents="none"
    >
      <Image source={{ uri }} style={StyleSheet.absoluteFill} resizeMode="cover" blurRadius={2} />
      <LinearGradient
        colors={["rgba(15,25,35,0.55)", colors.ink]}
        locations={[0, 0.85]}
        style={StyleSheet.absoluteFill}
      />
    </Animated.View>
  );
}
