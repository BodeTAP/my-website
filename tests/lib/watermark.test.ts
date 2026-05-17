import { describe, it, expect } from "vitest";
import {
  shouldAddWatermark,
  getWatermarkConfig,
  WatermarkOverlay,
} from "@/lib/watermark";
import type { WatermarkOptions } from "@/lib/watermark";

describe("shouldAddWatermark()", () => {
  it("returns true when user is NOT authenticated (free tier)", () => {
    expect(shouldAddWatermark(false)).toBe(true);
  });

  it("returns false when user IS authenticated (paid tier)", () => {
    expect(shouldAddWatermark(true)).toBe(false);
  });
});

describe("getWatermarkConfig()", () => {
  it("returns correct watermark text", () => {
    const config = getWatermarkConfig();
    expect(config.text).toBe("Dibuat dengan MFWEB - mfweb.maffisorp.id");
  });

  it("returns opacity of 0.08", () => {
    const config = getWatermarkConfig();
    expect(config.opacity).toBe(0.08);
  });

  it("returns angle of -45 degrees", () => {
    const config = getWatermarkConfig();
    expect(config.angle).toBe(-45);
  });

  it("returns fontSize of 48", () => {
    const config = getWatermarkConfig();
    expect(config.fontSize).toBe(48);
  });

  it("returns a complete WatermarkOptions object", () => {
    const config: WatermarkOptions = getWatermarkConfig();
    expect(config).toEqual({
      text: "Dibuat dengan MFWEB - mfweb.maffisorp.id",
      opacity: 0.08,
      angle: -45,
      fontSize: 48,
    });
  });
});

describe("WatermarkOverlay", () => {
  it("is exported as a function (React component)", () => {
    expect(typeof WatermarkOverlay).toBe("function");
  });
});
