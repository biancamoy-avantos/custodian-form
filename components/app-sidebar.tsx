"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Blocks,
  FileText,
  Server,
  Code2,
  FileDown,
  Settings,
  User,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const navItems = [
  { label: "Action Blueprints", icon: Blocks, href: "/blueprints" },
  { label: "Forms", icon: FileText, href: "/" },
  { label: "Services", icon: Server, href: "/services" },
  { label: "JS Functions", icon: Code2, href: "/functions" },
  { label: "PDFs", icon: FileDown, href: "/pdfs" },
  { label: "Administration", icon: Settings, href: "/administration" },
];

const bottomNav = [
  { label: "Profile", icon: User, href: "/profile" },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-[200px] shrink-0 bg-white border-r border-gray-200 flex flex-col h-screen">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M8 2L14 5.5V10.5L8 14L2 10.5V5.5L8 2Z"
                stroke="white"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
              <path
                d="M8 6L11 7.75V11.25L8 13L5 11.25V7.75L8 6Z"
                fill="white"
                fillOpacity="0.6"
              />
            </svg>
          </div>
          <div>
            <span className="text-[11px] font-medium text-gray-400 uppercase tracking-wider block leading-none">
              Avantos
            </span>
            <span className="text-sm font-semibold text-gray-900 leading-tight">
              Journey Builder
            </span>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 py-3 px-2.5 space-y-0.5">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Tooltip key={item.href}>
              <TooltipTrigger asChild>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm transition-colors",
                    isActive
                      ? "bg-gray-100 text-gray-900 font-medium"
                      : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                  )}
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right" className="text-xs">
                {item.label}
              </TooltipContent>
            </Tooltip>
          );
        })}
      </nav>

      {/* Bottom Navigation */}
      <div className="py-3 px-2.5 border-t border-gray-100 space-y-0.5">
        {bottomNav.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Tooltip key={item.href}>
              <TooltipTrigger asChild>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm transition-colors",
                    isActive
                      ? "bg-gray-100 text-gray-900 font-medium"
                      : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                  )}
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right" className="text-xs">
                {item.label}
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </aside>
  );
}
