import clsx from "clsx";
import {
  funnelNavItems,
  getFunnel,
  type FunnelCommand,
  type FunnelId,
} from "../lib/funnel-config";

interface SubMenuProps {
  funnelId: FunnelId;
  activeIndex: number;
  onSelect: (index: number) => void;
  onActivate: (command: FunnelCommand | null, funnelTarget?: FunnelId) => void;
}

export default function SubMenu({ funnelId, activeIndex, onSelect, onActivate }: SubMenuProps) {
  const isHome = funnelId === "home";
  const items = isHome
    ? funnelNavItems().map((f) => ({
        key: f.id,
        label: f.label,
        hint: f.description,
        funnelTarget: f.id as FunnelId,
      }))
    : getFunnel(funnelId).commands.map((c) => ({ ...c, funnelTarget: undefined as FunnelId | undefined }));

  return (
    <div className="menu-section">
      <div className="menu-prompt">
        {isHome ? (
          <>? Select a funnel <span>(Use arrow keys)</span></>
        ) : (
          <>
            ? {getFunnel(funnelId).icon} {getFunnel(funnelId).label}{" "}
            <span>(Use arrow keys)</span>
          </>
        )}
      </div>
      {!isHome && (
        <div className="menu-prompt" style={{ fontSize: 13, marginBottom: 10, color: "var(--muted)" }}>
          {getFunnel(funnelId).description}
        </div>
      )}
      <ul className="menu-list" role="listbox">
        {items.map((item, i) => (
          <li
            key={item.key}
            role="option"
            aria-selected={i === activeIndex}
            className={clsx("menu-item", i === activeIndex && "active")}
            onClick={() => {
              onSelect(i);
              if (isHome && item.funnelTarget) {
                onActivate(null, item.funnelTarget);
              } else {
                onActivate({ key: item.key, label: item.label, hint: item.hint });
              }
            }}
            onMouseEnter={() => onSelect(i)}
          >
            <span className="menu-chevron">{i === activeIndex ? ">" : " "}</span>
            {isHome && (
              <span className="menu-icon">{getFunnel(item.funnelTarget!).icon}</span>
            )}
            <span>{item.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
