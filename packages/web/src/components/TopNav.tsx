"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";

const navItems = [
  { href: "/", label: "Dashboard" },
  { href: "/join", label: "Join" },
  { href: "/create", label: "Create" },
  { href: "/game-modes", label: "Game Modes" },
  { href: "/how-it-works", label: "How It Works" },
  { href: "/admin", label: "Admin" },
];

export function TopNav() {
  const pathname = usePathname();
  const [clock, setClock] = useState("--:--:--");

  useEffect(() => {
    const tick = () => setClock(new Date().toLocaleTimeString());
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <aside className="brutal-sidebar brutal-panel">
      <div className="brutal-brand">
        <div className="brutal-badge">YAP</div>
        <div>
          <h1>YAPROOM</h1>
          <p>Neubrutal control interface</p>
        </div>
      </div>

      <div className="brutal-status-card">
        <div className="brutal-dot" />
        <div>
          <p className="brutal-small-label">SYSTEM STATUS</p>
          <div className="brutal-status-value">LIVE</div>
        </div>
      </div>

      <nav className="brutal-nav">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(pathname === item.href && "active")}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="brutal-sidebar-footer">
        <span className="brutal-small-label">LIVE CLOCK</span>
        <div className="brutal-clock">{clock}</div>
        <div className="brutal-subtle">Unified frontend visual shell</div>
      </div>
    </aside>
  );
}
