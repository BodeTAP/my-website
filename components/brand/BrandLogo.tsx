import React from "react";

export interface BrandLogoIconProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  variant?: "light" | "dark" | "adaptive";
  className?: string;
}

/**
 * Minimalist Viewport Icon (MFWEB Concept 02)
 *
 * Modern squircle viewport with crisp geometric 'M' and titanium status dot.
 * - `adaptive`: Uses currentColor for the stroke, transparent fill, adapts to text color.
 * - `light`: Deep obsidian (#18181B) stroke with white fill, titanium (#71717A) dot.
 * - `dark`: Crisp white (#FFFFFF) stroke with dark (#18181B) fill, silver (#A1A1AA) dot.
 */
export function BrandLogoIcon({
  size = 32,
  variant = "adaptive",
  className = "",
  style,
  ...props
}: BrandLogoIconProps) {
  const isLight = variant === "light";
  const isDark = variant === "dark";

  const strokeColor = isLight ? "#18181B" : isDark ? "#FFFFFF" : "currentColor";
  const fillColor = isLight ? "#FFFFFF" : isDark ? "#18181B" : "transparent";
  const dotColor = isLight ? "#71717A" : isDark ? "#A1A1AA" : "#71717A";

  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ width: size, height: size, ...style }}
      aria-hidden="true"
      {...props}
    >
      <rect
        x="7"
        y="7"
        width="34"
        height="34"
        rx="10"
        stroke={strokeColor}
        strokeWidth="3"
        fill={fillColor}
      />
      <path
        d="M14 31L20 19L24 25L28 19L34 31"
        stroke={strokeColor}
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="34" cy="16" r="2.5" fill={dotColor} />
    </svg>
  );
}

export interface BrandLogoProps {
  className?: string;
  iconClassName?: string;
  textClassName?: string;
  variant?: "light" | "dark" | "adaptive";
  size?: number;
  showSubtitle?: boolean;
  subtitle?: string;
}

/**
 * Full Brand Lockup: Logo Mark + Typography
 * Follows the White-Grey / Monochrome aesthetic:
 * - "MF" in solid primary
 * - "WEB" in titanium grey (zinc-500)
 */
export function BrandLogo({
  className = "flex items-center gap-2.5 group",
  iconClassName = "shrink-0",
  textClassName = "text-lg font-black tracking-tight",
  variant = "adaptive",
  size = 32,
  showSubtitle = false,
  subtitle = "Website & Business Tools",
}: BrandLogoProps) {
  const isDark = variant === "dark";

  return (
    <div className={className}>
      <BrandLogoIcon size={size} variant={variant} className={iconClassName} />
      <div className="flex flex-col">
        <span className={textClassName}>
          <span className={isDark ? "text-white" : "text-zinc-950"}>MF</span>
          <span className={isDark ? "text-zinc-400" : "text-zinc-500"}>WEB</span>
        </span>
        {showSubtitle && (
          <span className="text-[9px] font-semibold uppercase tracking-[0.2em] text-zinc-400 mt-0.5">
            {subtitle}
          </span>
        )}
      </div>
    </div>
  );
}

export default BrandLogo;
