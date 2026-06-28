import clsx from "clsx";
import { breadcrumbPath, type FunnelId } from "../lib/funnel-config";

interface FunnelNavProps {
  funnelId: FunnelId;
  subLabel?: string;
  onNavigate: (id: FunnelId) => void;
}

export default function FunnelNav({ funnelId, subLabel, onNavigate }: FunnelNavProps) {
  const crumbs: Array<{ id: FunnelId; label: string }> = [{ id: "home", label: "Home" }];
  if (funnelId !== "home") {
    crumbs.push({ id: funnelId, label: breadcrumbPath(funnelId).split(" › ")[0]! });
  }

  return (
    <nav className="funnel-nav" aria-label="Funnel breadcrumb">
      {crumbs.map((crumb, i) => (
        <span key={crumb.id} style={{ display: "contents" }}>
          {i > 0 && <span className="funnel-nav-sep">›</span>}
          <button
            type="button"
            className={clsx(
              "funnel-nav-crumb",
              (crumb.id === funnelId && !subLabel) || (crumb.id === funnelId && funnelId !== "home")
                ? "active"
                : undefined
            )}
            onClick={() => onNavigate(crumb.id)}
          >
            {crumb.label}
          </button>
        </span>
      ))}
      {subLabel && funnelId !== "home" && (
        <>
          <span className="funnel-nav-sep">›</span>
          <span className="funnel-nav-current">{subLabel}</span>
        </>
      )}
    </nav>
  );
}
