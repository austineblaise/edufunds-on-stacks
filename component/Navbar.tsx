"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex h-16 items-center justify-between">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-lg font-extrabold bg-gradient-to-r from-emerald-500 to-sky-500 bg-clip-text text-transparent">
              EduFunds
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
            {[
              { name: "Home", href: "/" },
              { name: "Parent", href: "/parent" },
              { name: "Student", href: "/student" },
            ].map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`relative transition-colors ${
                  isActive(item.href)
                    ? "text-emerald-600"
                    : "text-slate-700 hover:text-slate-900"
                }`}
              >
                {item.name}
                {isActive(item.href) && (
                  <span className="absolute -bottom-2 left-0 h-0.5 w-full rounded-full bg-emerald-500" />
                )}
              </Link>
            ))}
          </nav>

          {/* Mobile toggle */}
          <button
            onClick={() => setOpen((s) => !s)}
            aria-label="Toggle menu"
            className="md:hidden rounded-lg p-2 text-slate-700 hover:bg-slate-100 transition"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile menu */}
        {open && (
          <div className="md:hidden pb-4">
            <div className="mt-2 flex flex-col gap-1 rounded-2xl bg-white p-2 shadow-lg ring-1 ring-black/5">
              {[
                { name: "Home", href: "/" },
                { name: "Parent", href: "/parent" },
                { name: "Student", href: "/student" },
              ].map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`rounded-xl px-4 py-3 text-sm font-medium transition ${
                    isActive(item.href)
                      ? "bg-emerald-50 text-emerald-700"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
