import React, { forwardRef, type HTMLAttributes } from "react";
import cx from "classnames";

export type GlassMaterial = "clear" | "subtle" | "frosted" | "liquid" | "refractive";
export interface GlassSurfaceProps extends HTMLAttributes<HTMLDivElement> {
  /** Refractive currently falls back to liquid; no distortion engine is loaded. */
  material?: GlassMaterial;
}

/** A decorative surface, with no invented interaction semantics or clipping. */
export const GlassSurface = forwardRef<HTMLDivElement, GlassSurfaceProps>(
  ({ material = "subtle", className, ...props }, ref) => (
    <div {...props} ref={ref} className={cx("vibe-prism-glass", className)} data-material={material} />
  )
);
GlassSurface.displayName = "GlassSurface";

export interface PrismThemeProps extends HTMLAttributes<HTMLDivElement> {
  mode?: "light" | "dark";
  transparency?: "full" | "reduced";
}

/** Scoped, controlled and SSR safe: no document mutation or hydration guessing. */
export const PrismTheme = forwardRef<HTMLDivElement, PrismThemeProps>(
  ({ mode = "light", transparency = "full", ...props }, ref) => (
    <div {...props} ref={ref} data-vibe-prism={mode} data-transparency={transparency} />
  )
);
PrismTheme.displayName = "PrismTheme";
