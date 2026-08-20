'use client';

import React from 'react';
import {
  LayoutDashboard,
  PlusCircle,
  FolderKanban,
  Cpu,
  SlidersHorizontal,
  Activity,
  Gauge,
  FileBarChart,
  Settings,
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useAppStore } from '@/store';
import type { AppPage } from '@/types';

const NAV_ITEMS: { page: AppPage; label: string; icon: React.ElementType }[] = [
  { page: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { page: 'new-estimate', label: 'New Estimate', icon: PlusCircle },
  { page: 'projects', label: 'Projects', icon: FolderKanban },
  { page: 'product-explorer', label: 'B&R Configuration', icon: Cpu },
  { page: 'technical-params', label: 'Technical Parameters', icon: SlidersHorizontal },
  { page: 'engineering-activities', label: 'Engineering Activities', icon: Activity },
  { page: 'complexity', label: 'Complexity', icon: Gauge },
  { page: 'estimate-summary', label: 'Estimate Summary', icon: FileBarChart },
  { page: 'settings', label: 'Settings', icon: Settings },
];

export function AppSidebar() {
  const { currentPage, setCurrentPage } = useAppStore();

  return (
    <aside className="flex w-56 shrink-0 flex-col border-r border-border bg-sidebar">
      {/* Logo area */}
      <div className="flex h-14 items-center border-b border-border px-4">
        <div className="flex flex-col">
          <span className="text-sm font-bold text-sidebar-foreground leading-tight">
            B&R Engineering
          </span>
          <span className="text-[10px] text-muted-foreground leading-tight">
            Industrial Automation Estimation
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-2 px-2" role="navigation" aria-label="Main navigation">
        <TooltipProvider delayDuration={300}>
          <ul className="space-y-0.5">
            {NAV_ITEMS.map(({ page, label, icon: Icon }) => {
              const isActive = currentPage === page;
              return (
                <li key={page} className="relative">
                  {isActive && (
                    <span className="absolute left-0 top-0 h-full w-[2px] rounded-r bg-primary" />
                  )}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => setCurrentPage(page)}
                        className={`flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-left text-[13px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1
                          ${isActive
                            ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                            : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
                          }`}
                        aria-current={isActive ? 'page' : undefined}
                      >
                        <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-primary' : ''}`} />
                        {label}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="right" sideOffset={8}>
                      <p className="text-xs font-medium">{label}</p>
                    </TooltipContent>
                  </Tooltip>
                </li>
              );
            })}
          </ul>
        </TooltipProvider>
      </nav>

      {/* Footer */}
      <div className="border-t border-sidebar-border px-4 py-3">
        <div className="text-[10px] text-muted-foreground leading-tight">Frontend Prototype</div>
        <div className="text-[10px] text-muted-foreground leading-tight">v0.1</div>
      </div>
    </aside>
  );
}
