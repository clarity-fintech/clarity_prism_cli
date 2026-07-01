import clsx from "clsx";

export type PrismLogoVariant = "color" | "bw";

interface PrismLogoProps {
  variant?: PrismLogoVariant;
  size?: number;
  showWord?: boolean;
  compact?: boolean;
  className?: string;
}

export default function PrismLogo({
  variant = "color",
  size = 120,
  showWord = true,
  compact = false,
  className,
}: PrismLogoProps) {
  const bw = variant === "bw";
  const gradId = `prismGrad-${variant}`;
  const ditherId = `dither-${variant}`;
  const stroke = bw ? "#ffffff" : "#44d6ff";

  return (
    <div className={clsx("prism-logo-wrap", compact && "prism-logo-compact", className)}>
      <svg
        className={clsx("prism-logo-svg", bw && "prism-logo-svg-bw")}
        width={size}
        height={size}
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
      >
        <defs>
          {!bw && (
            <linearGradient id={gradId} x1="60" y1="8" x2="60" y2="112">
              <stop offset="0%" stopColor="#68dfff" />
              <stop offset="45%" stopColor="#44d6ff" />
              <stop offset="100%" stopColor="#2a5a9e" />
            </linearGradient>
          )}
          <pattern id={ditherId} width="4" height="4" patternUnits="userSpaceOnUse">
            <rect width="2" height="2" fill={bw ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.15)"} />
            <rect x="2" y="2" width="2" height="2" fill={bw ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.15)"} />
          </pattern>
        </defs>
        <polygon
          points="60,12 108,96 12,96"
          stroke={bw ? stroke : `url(#${gradId})`}
          strokeWidth="4"
          fill={bw ? "rgba(255,255,255,0.06)" : `url(#${gradId})`}
          fillOpacity={bw ? 1 : 0.15}
        />
        <line x1="60" y1="12" x2="60" y2="96" stroke={stroke} strokeWidth="2.5" />
        <line x1="60" y1="96" x2="36" y2="54" stroke={stroke} strokeWidth="2" />
        <line x1="60" y1="96" x2="84" y2="54" stroke={stroke} strokeWidth="2" />
        <rect x="8" y="88" width="104" height="20" fill={`url(#${ditherId})`} opacity="0.6" />
      </svg>
      {showWord && (
        <div className="prism-logo-word-wrap">
          {!bw && (
            <span className="prism-word-glow" aria-hidden>
              PRISM
            </span>
          )}
          <div className={clsx("prism-word", bw && "prism-word-bw", compact && "prism-word-compact")}>
            PRISM
          </div>
        </div>
      )}
    </div>
  );
}
