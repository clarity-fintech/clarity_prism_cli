import { forwardRef } from "react";

interface PromptProps {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  placeholder?: string;
  showCursor?: boolean;
}

const Prompt = forwardRef<HTMLInputElement, PromptProps>(function Prompt(
  { value, onChange, onSubmit, placeholder, showCursor = true },
  ref
) {
  return (
    <div className="prompt-wrap">
      <div className="prompt-box">
        <span className="prompt-chevron">&gt;</span>
        <input
          ref={ref}
          className="prompt-input"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              onSubmit();
            }
          }}
          placeholder={placeholder ?? "Type your message or @path/to/file"}
          spellCheck={false}
          autoComplete="off"
        />
        {showCursor && !value && <span className="prompt-cursor" aria-hidden />}
      </div>
    </div>
  );
});

export default Prompt;
