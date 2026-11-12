"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";

export function MobileMenu({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="mobile-nav-panel"
        aria-label={open ? "Close menu" : "Open menu"}
        className="inline-flex sm:hidden items-center justify-center rounded-lg p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
      >
        {open ? <X className="h-5 w-5" aria-hidden /> : <Menu className="h-5 w-5" aria-hidden />}
      </button>

      <nav
        className="hidden sm:flex flex-wrap items-center gap-1 text-sm"
        aria-label="Primary"
      >
        {children}
      </nav>

      {open && (
        <nav
          id="mobile-nav-panel"
          aria-label="Primary"
          className="absolute left-0 top-full z-40 flex w-full flex-col gap-1 border-b border-gray-200 bg-white p-3 shadow-lg sm:hidden"
          onClick={() => setOpen(false)}
        >
          {children}
        </nav>
      )}
    </>
  );
}
