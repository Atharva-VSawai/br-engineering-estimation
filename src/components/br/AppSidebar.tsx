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
  GitCompareArrows,
  Settings,
  Pencil,
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
  { page: 'compare', label: 'Compare', icon: GitCompareArrows },
  { page: 'settings', label: 'Settings', icon: Settings },
];

export function AppSidebar() {
  const { currentPage, setCurrentPage, config, wizardStep } = useAppStore();
  const configName = config.project.name || '';

  return (
    <aside className="flex w-56 shrink-0 flex-col border-r border-border bg-sidebar">
      {/* B&R brand accent stripe */}
      <div className="h-[3px] bg-primary" />

      {/* Logo area */}
      <div className="flex h-14 items-center gap-2.5 border-b border-border px-4">
        <div className="h-3 w-3 shrink-0 rotate-45 rounded-[2px] bg-primary/20 border border-primary/40" />
        <div className="flex flex-col">
          <span className="text-sm font-bold tracking-tight text-sidebar-foreground leading-tight">
            B&R Engineering
          </span>
          <span className="text-[9px] font-semibold uppercase tracking-[0.15em] text-muted-foreground leading-tight">
            Estimation Tool
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
                        className={`relative flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-left text-[13px] font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1
                          ${isActive
                            ? 'bg-gradient-to-r from-primary/8 to-transparent text-sidebar-accent-foreground after:content-[\'\'] after:absolute after:bottom-0 after:left-2 after:right-2 after:h-[3px] after:rounded-full after:bg-primary'
                            : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
                          }`}
                        aria-current={isActive ? 'page' : undefined}
                      >
                        <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-primary drop-shadow-[0_0_4px_oklch(0.55_0.2_35/0.3)]' : ''}`} />
                        {label}
                        {page === 'new-estimate' && currentPage === 'new-estimate' && (
                          <span className="ml-auto rounded-full bg-primary text-primary-foreground text-[9px] font-bold px-1.5 py-0.5 leading-none">
                            {wizardStep + 1}
                          </span>
                        )}
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

      {/* Current Config */}
      {configName && (
        <>
          <div className="border-t border-border" />
          <div className="px-4 py-2">
            <button
              onClick={() => setCurrentPage('new-estimate')}
              className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left hover:bg-sidebar-accent/50 transition-colors duration-150 group"
            >
              <Pencil className="h-3 w-3 text-muted-foreground/50 group-hover:text-muted-foreground shrink-0" />
              <span className="text-[11px] text-muted-foreground/70 group-hover:text-muted-foreground truncate font-medium">
                {configName}
              </span>
            </button>
          </div>
        </>
      )}

      {/* Footer */}
      <div className="border-t border-border px-4 py-3">
        <div className="text-[10px] text-muted-foreground/60 leading-tight">Frontend Prototype</div>
        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground/60 leading-tight">
          <span className="bg-emerald-500 w-1.5 h-1.5 rounded-full inline-block" />
          <span className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-full px-1.5 py-0.5 font-semibold">v0.7</span>
        </div>
      </div>
    </aside>
  );
}
