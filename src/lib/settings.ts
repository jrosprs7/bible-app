import { useCallback, useEffect, useState } from "react";
import { readJson, writeJson } from "./storage";

export interface Settings {
  theme: "auto" | "light" | "sepia" | "dark";
  fontSize: number; // px
  layout: "paragraph" | "verse";
  verseNumbers: boolean;
  redLetter: boolean;
  italics: boolean;
}

export const DEFAULT_SETTINGS: Settings = {
  theme: "auto",
  fontSize: 19,
  layout: "paragraph",
  verseNumbers: true,
  redLetter: false,
  italics: true,
};

const KEY = "bible.settings.v1";

export function useSettings(): [Settings, (patch: Partial<Settings>) => void] {
  const [settings, setSettings] = useState<Settings>(() => ({ ...DEFAULT_SETTINGS, ...readJson<Partial<Settings>>(KEY) }));
  useEffect(() => {
    writeJson(KEY, settings);
    const root = document.documentElement;
    root.dataset.theme = settings.theme;
    root.style.setProperty("--fs", `${settings.fontSize}px`);
  }, [settings]);
  const update = useCallback((patch: Partial<Settings>) => setSettings((s) => ({ ...s, ...patch })), []);
  return [settings, update];
}
