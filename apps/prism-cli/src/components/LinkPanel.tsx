import { useEffect, useState } from "react";
import { fetchExchangeLinks, type ExchangeLink } from "../lib/prism-bridge";

export default function LinkPanel() {
  const [links, setLinks] = useState<ExchangeLink[]>([]);

  useEffect(() => {
    void fetchExchangeLinks().then(setLinks);
  }, []);

  return (
    <div className="funnel-panel">
      <div className="funnel-panel-title">Exchange deep links</div>
      <div className="funnel-link-row">
        {links.map((link) => (
          <a
            key={link.id}
            className="funnel-link-btn"
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            title={link.description}
          >
            <span>{link.icon}</span>
            <span>{link.label}</span>
          </a>
        ))}
      </div>
    </div>
  );
}
