import React from "react";
import { StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { Easing, SlideInRight, SlideOutRight } from "react-native-reanimated";
import { colors } from "../theme";
import { CoverImage, ImageFocal } from "./CoverImage";

interface HeroPanelProps {
  uri: string;
  focal?: ImageFocal;
}

/**
 * Showcase panel for an expanded agent's hero image, docked to the right
 * side of the screen while the rest of the app sits in its own column to
 * the left — a deliberate, framed image rather than a full-bleed backdrop
 * sitting behind the content. The left edge fades to transparent so the
 * image blends into the page instead of ending in a hard vertical line.
 * `focal` is whatever the agent's hero image was centered on in the editor
 * (see HeroImagePositioner) so cropping here matches that preview.
 */
export function HeroPanel({ uri, focal }: HeroPanelProps) {
  return (
    <Animated.View
      entering={SlideInRight.duration(320).easing(Easing.out(Easing.cubic))}
      exiting={SlideOutRight.duration(200).easing(Easing.in(Easing.cubic))}
      style={styles.wrap}
      pointerEvents="none"
    >
      <CoverImage uri={uri} focal={focal} style={styles.image} />
      <LinearGradient
        colors={[colors.ink, "transparent"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        locations={[0, 0.5]}
        style={styles.leftFade}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    overflow: "hidden",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.steel,
    borderLeftWidth: 0,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  leftFade: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: "45%",
  },
});
