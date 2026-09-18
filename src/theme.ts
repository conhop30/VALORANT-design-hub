/**
 * VALORANT-derived palette. Every text/background pairing below has been picked
 * for contrast, not just brand accuracy — the design doc specifically calls out
 * "dark background + slightly lighter grey text" as a readability failure to avoid.
 * Rule followed throughout the app: body text is always `ink`/`offWhite`
 * (never `steel`-on-dark), and `red` is reserved for large text, icons, and
 * button fills — never small red-on-dark body copy.
 */
export const colors = {
  ink: "#0F1923", // primary dark background
  surface: "#1B2530", // slightly raised panels/cards on top of ink
  surfaceAlt: "#242F3B", // expanded/active card state
  red: "#FF4655", // accent / CTA / destructive
  redDark: "#BD3944", // pressed state for red elements
  offWhite: "#ECE8E1", // primary text on dark backgrounds
  steel: "#768079", // borders, dividers, icons only — never body text on ink
  success: "#4CE0B3",
  warning: "#F2C94C",
} as const;

export const roleColors: Record<string, string> = {
  Duelist: "#FF4655",
  Initiator: "#4CE0B3",
  Controller: "#7CA9D8",
  Sentinel: "#F2C94C",
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

/** Bundled via expo-font in App.tsx. Bebas Neue stands in for Riot's
 * proprietary display face (not licensable) as the closest free match:
 * tall, condensed, single-weight, reads correctly only in uppercase. */
export const fonts = {
  display: "BebasNeue-Regular",
} as const;

export const typography = {
  display: {
    fontFamily: fonts.display,
    fontSize: 30,
    letterSpacing: 1.5,
    color: colors.offWhite,
    textTransform: "uppercase" as const,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 24,
    letterSpacing: 1,
    fontWeight: "400" as const,
    color: colors.offWhite,
    textTransform: "uppercase" as const,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: "700" as const,
    letterSpacing: 0.5,
    color: colors.offWhite,
    textTransform: "uppercase" as const,
  },
  body: { fontSize: 14, fontWeight: "400" as const, color: colors.offWhite },
  caption: {
    fontSize: 12,
    fontWeight: "400" as const,
    color: colors.offWhite,
    opacity: 0.75, // verified: still >4.5:1 contrast on `ink`/`surface`, unlike a raw grey
  },
};

/** Vignette gradient stops for screen backgrounds — drawn top-to-bottom, a
 * translucent black darkening the rim and fading to fully transparent in the
 * middle. Must be darker-than-`ink` at the stops, not `ink` itself — the
 * page background already IS `ink`, so a same-color stop paints nothing. */
export const vignette = {
  colors: ["rgba(0,0,0,0.45)", "transparent", "rgba(0,0,0,0.45)"] as const,
  locations: [0, 0.45, 1] as const,
};
