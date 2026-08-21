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
    <aside className="flex w-60 shrink-0 flex-col border-r border-border bg-gradient-to-b from-sidebar via-sidebar to-sidebar/95 shadow-[inset_-1px_0_0_0_oklch(0.0_0_0/0.05)]">
      {/* B&R brand accent stripe */}
      <div className="h-[3px] bg-gradient-to-r from-primary via-primary/80 to-primary/60" />

      {/* Logo area */}
      <div className="flex h-14 items-center gap-2.5 border-b border-border/80 px-4 bg-gradient-to-r from-primary/[0.03] to-transparent">
        <div className="relative h-4 w-4 shrink-0 flex items-center justify-center">
          <div className="absolute inset-0 rotate-45 rounded-[2px] bg-gradient-to-br from-primary/40 to-primary/15 border border-primary/30" />
          <div className="absolute inset-[3px] rotate-45 rounded-[1px] bg-primary/80" />
        </div>
        <div className="flex flex-col">
          <span className="text-base font-bold tracking-tight text-sidebar-foreground leading-tight">
            B&R Engineering
          </span>
          <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground leading-tight">
            Estimation Tool
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="relative flex-1 overflow-y-auto py-2 px-2" role="navigation" aria-label="Main navigation">
        <span className="px-3 mb-1 block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/50">Navigation</span>
        <TooltipProvider delayDuration={300}>
          <ul className="space-y-0.5">
            {NAV_ITEMS.map(({ page, label, icon: Icon }) => {
              const isActive = currentPage === page;
              return (
                <li key={page} className="relative">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => setCurrentPage(page)}
                        className={`relative flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-left text-sm font-medium transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1
                          ${isActive
                            ? 'bg-gradient-to-r from-primary/10 to-primary/[0.03] text-sidebar-accent-foreground shadow-[inset_3px_0_0_0_oklch(0.55_0.2_35/0.8),0_0_16px_oklch(0.55_0.2_35/0.08)]'
                            : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground hover:translate-x-0.5'
                          }`}
                        aria-current={isActive ? 'page' : undefined}
                      >
                        <Icon className={`h-4 w-4 shrink-0 transition-colors duration-200 ${isActive ? 'text-primary drop-shadow-[0_0_6px_oklch(0.55_0.2_35/0.4)]' : 'group-hover:text-muted-foreground'}`} />
                        {label}
                        {page === 'new-estimate' && currentPage === 'new-estimate' && (
                          <span className="ml-auto rounded-full bg-primary text-primary-foreground text-[11px] font-bold px-1.5 py-0.5 leading-none">
                            {wizardStep + 1}
                          </span>
                        )}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="right" sideOffset={8}>
                      <p className="text-sm font-medium">{label}</p>
                    </TooltipContent>
                  </Tooltip>
                </li>
              );
            })}
          </ul>
        </TooltipProvider>
        {/* Bottom fade gradient for nav scroll */}
        <div className="sticky bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-sidebar to-transparent pointer-events-none z-10" />
      </nav>

      {/* Current Config */}
      <div className="mx-3 border-t border-border/60" />
      {configName && (
        <>
          <div className="px-4 py-2">
            <button
              onClick={() => setCurrentPage('new-estimate')}
              className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left hover:bg-sidebar-accent/50 transition-colors duration-150 group"
            >
              <Pencil className="h-3 w-3 text-muted-foreground/50 group-hover:text-muted-foreground shrink-0" />
              <span className="text-xs text-muted-foreground/70 group-hover:text-muted-foreground truncate font-medium">
                {configName}
              </span>
            </button>
          </div>
        </>
      )}

      {/* Footer */}
      <div className="border-t border-border/60 px-4 py-3 bg-gradient-to-t from-sidebar/80 to-transparent">
        <div className="text-xs text-muted-foreground/60 leading-tight">Engineering Tool</div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground/60 leading-tight">
          <span className="bg-emerald-500 w-1.5 h-1.5 rounded-full inline-block animate-pulse" />
          <span className="bg-gradient-to-r from-primary/15 to-primary/5 rounded-full px-1.5 py-0.5 font-semibold">v1.0</span>
        </div>
      </div>
    </aside>
  );
}
