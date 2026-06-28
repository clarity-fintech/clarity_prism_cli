interface StatusBarProps {
  contextLeft?: number;
  sandbox?: boolean;
}

export default function StatusBar({ contextLeft = 100, sandbox = false }: StatusBarProps) {
  return (
    <footer className="statusbar">
      <div className="statusbar-left">~</div>
      <div className="statusbar-center">
        <span className={sandbox ? "" : "warn"}>{sandbox ? "sandbox" : "no"}</span> sandbox{" "}
        <span>(see /docs)</span>
      </div>
      <div className="statusbar-right">
        prism-cli v1.0.0 ({contextLeft}% context left)
      </div>
    </footer>
  );
}
