import clsx from "clsx";
import { portFeedLabel, isPortFed } from "../lib/port-backed";
import { isLocalTerminal } from "../lib/local-mode";

export default function PortFeedBanner() {
  if (isLocalTerminal()) return null;

  const live = isPortFed();

  return (
    <div className={clsx("port-feed-banner", live ? "port-feed-live" : "port-feed-offline")}>
      <span className="port-feed-pill">{live ? "PORT-FED" : "NO PORT"}</span>
      <span>{portFeedLabel()}</span>
      {!live && (
        <span className="port-feed-hint">
          Terminal-only full use · start backend: <code>cargo run -p clrty-api</code>
        </span>
      )}
    </div>
  );
}
