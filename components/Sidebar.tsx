"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, BookOpen, ClipboardList } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/turmas", label: "Turmas", icon: BookOpen },
  { href: "/alunos", label: "Alunos", icon: Users },
  { href: "/presencas", label: "Presenças", icon: ClipboardList },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-56 shrink-0 bg-white border-r border-gray-200 flex flex-col min-h-screen">
      <div className="px-6 py-5 border-b border-gray-200">
        <span className="text-base font-semibold text-gray-900">Lista de Chamada</span>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {links.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              pathname.startsWith(href)
                ? "bg-blue-50 text-blue-700"
                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            )}
          >
            <Icon size={18} />
            {label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
