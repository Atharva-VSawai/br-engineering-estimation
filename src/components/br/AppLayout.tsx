'use client';

import React from 'react';
import { AppHeader } from './AppHeader';
import { AppSidebar } from './AppSidebar';

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  return (
    <div className="flex h-screen overflow-hidden app-bg-gradient">
      <AppSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <AppHeader onMenuClick={() => setSidebarOpen(true)} />
        <main className="min-w-0 flex-1 overflow-x-hidden overflow-y-auto p-3 pb-8 sm:p-6 sm:pb-12 lg:p-8">{children}</main>
        <footer className="no-print flex h-9 shrink-0 items-center justify-between border-t border-border bg-background/80 backdrop-blur-sm px-3 sm:px-6 z-10">
          <span className="hidden text-xs text-muted-foreground sm:inline">
            B&R Engineering Estimation Tool v0.9
          </span>
          <span className="text-xs text-muted-foreground">
            Press <kbd className="inline-flex h-5 items-center rounded border border-border bg-muted px-1 text-[11px] font-mono">⌘K</kbd> for shortcuts
          </span>
        </footer>
      </div>
    </div>
  );
}
