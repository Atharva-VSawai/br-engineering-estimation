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
        <main className="flex-1 overflow-y-auto p-6 pb-12">{children}</main>
        <footer className="no-print flex h-8 shrink-0 items-center justify-between border-t border-border/60 bg-background/80 backdrop-blur-sm px-6 z-10">
          <span className="text-[10px] text-muted-foreground">
            B&R Engineering Estimation Tool v0.8
          </span>
          <span className="text-[10px] text-muted-foreground">
            Press <kbd className="inline-flex h-4 items-center rounded border border-border bg-muted px-1 text-[9px] font-mono">⌘K</kbd> for shortcuts
          </span>
        </footer>
      </div>
    </div>
  );
}
