"use client";

import { useEffect, useState } from "react";

const THEMES = [
  {
    id: "ocean",
    name: "Ocean Calm",
    icon: "🌊",
    description: "Calm and balanced",
  },
  {
    id: "sage",
    name: "Sage",
    icon: "🌿",
    description: "Natural and peaceful",
  },
  {
    id: "lavender",
    name: "Lavender",
    icon: "🌸",
    description: "Soft and comforting",
  },
  {
    id: "sunset",
    name: "Warm Sunset",
    icon: "🌅",
    description: "Warm and positive",
  },
  {
    id: "midnight",
    name: "Midnight",
    icon: "🌙",
    description: "Dark and relaxing",
  },
  {
    id: "minimal",
    name: "Minimal",
    icon: "🧊",
    description: "Clean and simple",
  },
] as const;

type Theme = (typeof THEMES)[number]["id"];

export function ThemeSelector() {
  const [theme, setTheme] = useState<Theme>("ocean");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("mindease-theme") as Theme | null;

    if (saved && THEMES.some((item) => item.id === saved)) {
      setTheme(saved);
      document.documentElement.dataset.theme = saved;
    }
  }, []);

  const selectTheme = (nextTheme: Theme) => {
    setTheme(nextTheme);
    document.documentElement.dataset.theme = nextTheme;
    localStorage.setItem("mindease-theme", nextTheme);
  };

  const currentTheme = THEMES.find((item) => item.id === theme)!;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed right-4 top-4 z-50 flex items-center gap-2 rounded-full border border-navy-200 bg-surface px-4 py-2 text-sm font-medium text-navy-900 shadow-md"
      >
        <span>{currentTheme.icon}</span>
        <span>Theme</span>
      </button>

      {open ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-3xl bg-surface p-6 shadow-xl">
            <div className="mb-5">
              <h2 className="text-2xl font-semibold text-navy-900">
                Choose your theme
              </h2>

              <p className="muted mt-1 text-sm">
                Pick the look that feels most comfortable for you.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {THEMES.map((item) => {
                const selected = theme === item.id;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => selectTheme(item.id)}
                    className={`rounded-2xl border p-4 text-left transition-all ${
                      selected
                        ? "border-teal-500 bg-teal-50 ring-2 ring-teal-300"
                        : "border-navy-200 bg-surface hover:border-teal-300"
                    }`}
                  >
                    <div className="text-3xl">{item.icon}</div>

                    <p className="mt-2 font-semibold text-navy-900">
                      {item.name}
                    </p>

                    <p className="muted mt-0.5 text-xs">
                      {item.description}
                    </p>
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => setOpen(false)}
              className="mt-5 w-full rounded-xl bg-teal-600 px-4 py-3 font-semibold text-white transition-colors hover:bg-teal-700"
            >
              Continue
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}