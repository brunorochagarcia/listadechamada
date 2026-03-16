"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, BookOpen, ClipboardList, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

const links = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/turmas", label: "Turmas", icon: BookOpen },
  { href: "/alunos", label: "Alunos", icon: Users },
  { href: "/presencas", label: "Presenças", icon: ClipboardList },
];

function NavLinks({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return (
    <nav className="flex-1 px-3 py-4 space-y-1">
      {links.map(({ href, label, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          onClick={onNavigate}
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
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Desktop */}
      <aside className="hidden md:flex w-56 shrink-0 bg-white border-r border-gray-200 flex-col min-h-screen">
        <div className="px-6 py-5 border-b border-gray-200">
          <span className="text-base font-semibold text-gray-900">Lista de Chamada</span>
        </div>
        <NavLinks pathname={pathname} />
      </aside>

      {/* Mobile — botão hamburguer no Header (injetado via portal) */}
      <div className="md:hidden">
        <button
          onClick={() => setOpen(true)}
          className="fixed top-3.5 left-4 z-40 p-1.5 rounded-lg text-gray-600 hover:bg-gray-100"
          aria-label="Abrir menu"
        >
          <Menu size={20} />
        </button>

        {/* Overlay */}
        {open && (
          <div
            className="fixed inset-0 z-40 bg-black/30"
            onClick={() => setOpen(false)}
          />
        )}

        {/* Drawer */}
        <aside
          className={cn(
            "fixed top-0 left-0 z-50 h-full w-64 bg-white border-r border-gray-200 flex flex-col transition-transform duration-200",
            open ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200">
            <span className="text-base font-semibold text-gray-900">Lista de Chamada</span>
            <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600">
              <X size={18} />
            </button>
          </div>
          <NavLinks pathname={pathname} onNavigate={() => setOpen(false)} />
        </aside>
      </div>
    </>
  );
}
