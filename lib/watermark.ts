"use client";

import React from "react";
import { View, Text, StyleSheet } from "@react-pdf/renderer";

// ─── Types ───────────────────────────────────────────────────────────────────

export type WatermarkOptions = {
  text: string;
  opacity: number;
  angle: number;
  fontSize: number;
};

// ─── Functions ───────────────────────────────────────────────────────────────

/**
 * Returns true if watermark should be added (free-tier / unauthenticated users).
 */
export function shouldAddWatermark(isAuthenticated: boolean): boolean {
  return !isAuthenticated;
}

/**
 * Returns the default watermark configuration for free-tier PDFs.
 */
export function getWatermarkConfig(): WatermarkOptions {
  return {
    text: "Dibuat dengan MFWEB - mfweb.maffisorp.id",
    opacity: 0.08,
    angle: -45,
    fontSize: 48,
  };
}

// ─── WatermarkOverlay Component ──────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    width: "200%",
    marginLeft: "-50%",
  },
  text: {
    color: "#000000",
    opacity: 0.08,
    fontSize: 48,
    transform: "rotate(-45deg)",
    textAlign: "center",
    padding: 60,
  },
});

/**
 * WatermarkOverlay renders a semi-transparent diagonal text overlay
 * across the full PDF page. Place inside a <Page> component.
 *
 * Uses @react-pdf/renderer View and Text components.
 */
export function WatermarkOverlay() {
  const config = getWatermarkConfig();

  // Create multiple rows of watermark text for full page coverage
  const rows = Array.from({ length: 6 }, (_, i) => i);

  return React.createElement(
    View,
    { style: styles.container, fixed: true },
    rows.map((rowIndex) =>
      React.createElement(
        View,
        { key: rowIndex, style: styles.row },
        React.createElement(
          Text,
          { style: styles.text },
          config.text
        ),
        React.createElement(
          Text,
          { style: styles.text },
          config.text
        )
      )
    )
  );
}
