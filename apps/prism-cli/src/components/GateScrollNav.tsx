import { useCallback, useEffect, useState, type RefObject } from "react";

export const GATE_SECTIONS = [
  { id: "gate-operator", label: "Login" },
  { id: "gate-account", label: "Account" },
  { id: "gate-unlock", label: "Unlock" },
  { id: "gate-contact", label: "Contact" },
] as const;

interface GateScrollNavProps {
  scrollRootRef: RefObject<HTMLElement | null>;
}

export default function GateScrollNav({ scrollRootRef }: GateScrollNavProps) {
  const [active, setActive] = useState<string>(GATE_SECTIONS[0]!.id);

  useEffect(() => {
    const root = scrollRootRef.current;
    if (!root) return;

    const sections = GATE_SECTIONS.map((s) => document.getElementById(s.id)).filter(Boolean) as HTMLElement[];
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]?.target.id) {
          setActive(visible[0].target.id);
        }
      },
      { root, rootMargin: "-20% 0px -55% 0px", threshold: [0, 0.25, 0.5, 0.75, 1] }
    );

    for (const el of sections) observer.observe(el);
    return () => observer.disconnect();
  }, [scrollRootRef]);

  const scrollTo = useCallback(
    (id: string) => {
      const el = document.getElementById(id);
      const root = scrollRootRef.current;
      if (!el || !root) return;
      const top = el.offsetTop - root.offsetTop - 8;
      root.scrollTo({ top, behavior: "smooth" });
      setActive(id);
    },
    [scrollRootRef]
  );

  return (
    <nav className="gate-scroll-nav" aria-label="Gate sections">
      <div className="gate-scroll-nav-hint">Scroll to navigate</div>
      <ul className="gate-scroll-nav-list">
        {GATE_SECTIONS.map((section) => (
          <li key={section.id}>
            <button
              type="button"
              className={`gate-scroll-nav-item${active === section.id ? " active" : ""}`}
              onClick={() => scrollTo(section.id)}
              aria-current={active === section.id ? "true" : undefined}
            >
              <span className="gate-scroll-nav-dot" aria-hidden />
              {section.label}
            </button>
          </li>
        ))}
      </ul>
      <div className="gate-scroll-nav-arrows" aria-hidden>
        <span>↑</span>
        <span>↓</span>
      </div>
    </nav>
  );
}
