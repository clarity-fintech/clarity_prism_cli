import Balancer from "react-wrap-balancer";

export default function Banner() {
  return (
    <div className="banner-wrap">
      <div className="banner-dither" aria-hidden />
      <div className="banner-row">
        <svg
          className="prism-logo-svg"
          viewBox="0 0 120 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden
        >
          <defs>
            <linearGradient id="prismGrad" x1="60" y1="8" x2="60" y2="112">
              <stop offset="0%" stopColor="#68dfff" />
              <stop offset="45%" stopColor="#44d6ff" />
              <stop offset="100%" stopColor="#2a5a9e" />
            </linearGradient>
            <pattern id="dither" width="4" height="4" patternUnits="userSpaceOnUse">
              <rect width="2" height="2" fill="rgba(0,0,0,0.15)" />
              <rect x="2" y="2" width="2" height="2" fill="rgba(0,0,0,0.15)" />
            </pattern>
          </defs>
          <polygon
            points="60,12 108,96 12,96"
            stroke="url(#prismGrad)"
            strokeWidth="4"
            fill="url(#prismGrad)"
            fillOpacity="0.15"
          />
          <line x1="60" y1="12" x2="60" y2="96" stroke="#44d6ff" strokeWidth="2.5" />
          <line x1="60" y1="96" x2="36" y2="54" stroke="#44d6ff" strokeWidth="2" />
          <line x1="60" y1="96" x2="84" y2="54" stroke="#44d6ff" strokeWidth="2" />
          <rect x="8" y="88" width="104" height="20" fill="url(#dither)" opacity="0.6" />
        </svg>
        <div style={{ position: "relative" }}>
          <span className="prism-word-glow" aria-hidden>
            PRISM
          </span>
          <div className="prism-word">PRISM</div>
        </div>
      </div>
      <div className="banner-meta">
        <div className="banner-version">PRISM CLI v1.0.0</div>
        <div className="banner-tagline">
          <Balancer>The intelligent assistant for developers.</Balancer>
        </div>
      </div>
    </div>
  );
}
