import { useEffect } from "react";
import type { Settings } from "../lib/settings";

interface Props {
  settings: Settings;
  update: (p: Partial<Settings>) => void;
  onClose: () => void;
}

function Segmented<T extends string>({ value, options, onChange, label }: { value: T; options: [T, string][]; onChange: (v: T) => void; label: string }) {
  return (
    <div className="seg" role="radiogroup" aria-label={label}>
      {options.map(([v, text]) => (
        <button key={v} role="radio" aria-checked={value === v} className={value === v ? "on" : ""} onClick={() => onChange(v)}>
          {text}
        </button>
      ))}
    </div>
  );
}

function Toggle({ checked, onChange, children }: { checked: boolean; onChange: (v: boolean) => void; children: string }) {
  return (
    <label className="toggle">
      <span>{children}</span>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
    </label>
  );
}

export function SettingsPanel({ settings: s, update, onClose }: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="overlay" onClick={onClose}>
      <div className="sheet settings" role="dialog" aria-label="Reading settings" onClick={(e) => e.stopPropagation()}>
        <h3>Theme</h3>
        <Segmented label="Theme" value={s.theme} onChange={(theme) => update({ theme })} options={[["auto", "Auto"], ["light", "Light"], ["sepia", "Sepia"], ["dark", "Dark"]]} />
        <h3>Text size</h3>
        <div className="size">
          <button aria-label="Smaller text" onClick={() => update({ fontSize: Math.max(14, s.fontSize - 1) })}>
            A−
          </button>
          <span>{s.fontSize}px</span>
          <button aria-label="Larger text" onClick={() => update({ fontSize: Math.min(30, s.fontSize + 1) })}>
            A+
          </button>
        </div>
        <h3>Layout</h3>
        <Segmented label="Layout" value={s.layout} onChange={(layout) => update({ layout })} options={[["paragraph", "Paragraphs"], ["verse", "Verse by verse"]]} />
        <div className="toggles">
          <Toggle checked={s.verseNumbers} onChange={(verseNumbers) => update({ verseNumbers })}>
            Verse numbers
          </Toggle>
          <Toggle checked={s.italics} onChange={(italics) => update({ italics })}>
            Italicize supplied words
          </Toggle>
          <Toggle checked={s.redLetter} onChange={(redLetter) => update({ redLetter })}>
            Words of Jesus in red
          </Toggle>
        </div>
      </div>
    </div>
  );
}
