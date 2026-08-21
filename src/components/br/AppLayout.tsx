'use client';

import React from 'react';
import { AppHeader } from './AppHeader';
import { AppSidebar } from './AppSidebar';

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden app-bg-gradient">
      <AppSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <AppHeader />
        <main className="flex-1 overflow-y-auto p-6 pb-12 lg:p-8">{children}</main>
        <footer className="no-print flex h-9 shrink-0 items-center justify-between border-t border-border bg-background/80 backdrop-blur-sm px-6 z-10">
          <span className="text-xs text-muted-foreground">
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
