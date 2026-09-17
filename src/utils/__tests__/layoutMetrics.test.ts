import { getContentLayoutMetrics } from "../layoutMetrics";
import { spacing } from "../../theme";

describe("getContentLayoutMetrics", () => {
  it("uses the base band below the first breakpoint", () => {
    expect(getContentLayoutMetrics(800)).toEqual({ maxWidth: 640, gutter: spacing.md });
  });

  it("stays on the base band just under the 1024 breakpoint", () => {
    expect(getContentLayoutMetrics(1023)).toEqual({ maxWidth: 640, gutter: spacing.md });
  });

  it("switches band exactly at the 1024 breakpoint (Electron 'compact')", () => {
    expect(getContentLayoutMetrics(1024)).toEqual({ maxWidth: 760, gutter: spacing.lg });
  });

  it("stays on the middle band at the 'standard' preset width", () => {
    expect(getContentLayoutMetrics(1279)).toEqual({ maxWidth: 760, gutter: spacing.lg });
  });

  it("stays on the middle band just under the 1440 breakpoint", () => {
    expect(getContentLayoutMetrics(1439)).toEqual({ maxWidth: 760, gutter: spacing.lg });
  });

  it("switches band exactly at the 1440 breakpoint", () => {
    expect(getContentLayoutMetrics(1440)).toEqual({ maxWidth: 880, gutter: spacing.xl });
  });

  it("stays on the widest band just under the 'large' preset width", () => {
    expect(getContentLayoutMetrics(1599)).toEqual({ maxWidth: 880, gutter: spacing.xl });
  });

  it("stays on the widest band at the 'large' preset width and beyond", () => {
    expect(getContentLayoutMetrics(1600)).toEqual({ maxWidth: 880, gutter: spacing.xl });
    expect(getContentLayoutMetrics(1920)).toEqual({ maxWidth: 880, gutter: spacing.xl });
  });
});
