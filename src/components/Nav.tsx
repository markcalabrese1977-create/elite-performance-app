// src/components/Nav.tsx
'use client';
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { BarChart3, Bot } from "lucide-react"; // ← ADDED Bot HERE

export function Nav() {
  const pathname = usePathname();

  const links = [
    { href: "/log", label: "Log" },
    { href: "/programs", label: "Programs" },
    { href: "/coach", label: "Coach", icon: Bot }, // ← ADDED ICON HERE
    { href: "/history", label: "History" },
    { href: "/progress", label: "Progress", icon: BarChart3 },
    { href: "/settings", label: "Settings" },
  ];

  return (
    <nav className="border-b bg-background">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <ul className="flex gap-6 text-sm">
          {links.map(({ href, label, icon: Icon }) => (
            <li key={href}>
              <Link
                href={href}
                className={cn(
                  "flex items-center gap-2 font-medium transition-colors hover:text-primary",
                  pathname === href ? "text-primary" : "text-muted-foreground"
                )}
              >
                {Icon && <Icon className="h-4 w-4" />}
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}