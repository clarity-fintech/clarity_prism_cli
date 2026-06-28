import clsx from "clsx";
import { MENU_ITEMS, type MenuId } from "../lib/menu-config";

interface MenuProps {
  activeIndex: number;
  onSelect: (id: MenuId, index: number) => void;
  onActivate?: (id: MenuId) => void;
}

export default function Menu({ activeIndex, onSelect, onActivate }: MenuProps) {
  return (
    <div className="menu-section">
      <div className="menu-prompt">
        ? What would you like to do? <span>(Use arrow keys)</span>
      </div>
      <ul className="menu-list" role="listbox">
        {MENU_ITEMS.map((item, i) => (
          <li
            key={item.id}
            role="option"
            aria-selected={i === activeIndex}
            className={clsx("menu-item", i === activeIndex && "active")}
            onClick={() => {
              onSelect(item.id, i);
              onActivate?.(item.id);
            }}
            onMouseEnter={() => onSelect(item.id, i)}
          >
            <span className="menu-chevron">{i === activeIndex ? ">" : " "}</span>
            <span className="menu-icon">{item.icon}</span>
            <span>{item.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
