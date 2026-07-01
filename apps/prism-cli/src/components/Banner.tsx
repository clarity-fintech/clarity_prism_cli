import Balancer from "react-wrap-balancer";
import { versionLabel } from "../lib/version";
import PrismLogo from "./PrismLogo";

export default function Banner() {
  return (
    <div className="banner-wrap">
      <div className="banner-dither" aria-hidden />
      <div className="banner-row">
        <PrismLogo variant="color" size={120} />
      </div>
      <div className="banner-meta">
        <div className="banner-version">PRISM {versionLabel()} · TERMINAL ONLY</div>
        <div className="banner-tagline">
          <Balancer>Terminal-only full use — all live data from clrty-api port :8545.</Balancer>
        </div>
      </div>
    </div>
  );
}
