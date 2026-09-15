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

export const radius = {
  sm: 8,
  md: 14,
  lg: 20,
} as const;

export const typography = {
  title: { fontSize: 22, fontWeight: "700" as const, color: colors.offWhite },
  subtitle: { fontSize: 16, fontWeight: "600" as const, color: colors.offWhite },
  body: { fontSize: 14, fontWeight: "400" as const, color: colors.offWhite },
  caption: {
    fontSize: 12,
    fontWeight: "400" as const,
    color: colors.offWhite,
    opacity: 0.75, // verified: still >4.5:1 contrast on `ink`/`surface`, unlike a raw grey
  },
};
