'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { useAppStore } from '@/store';
import { toast } from 'sonner';
import type { AppPage } from '@/types';

// ===== Hook =====

export function useKeyboardShortcuts() {
  const [open, setOpen] = useState(false);
  const toggle = useCallback(() => setOpen((prev) => !prev), []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const tag = target.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

      const isMeta = e.metaKey || e.ctrlKey;

      // ⌘K / Ctrl+K → toggle dialog
      if (isMeta && e.key === 'k') {
        e.preventDefault();
        toggle();
        return;
      }

      // ⌘S / Ctrl+S → save toast
      if (isMeta && e.key === 's') {
        e.preventDefault();
        toast('Configuration saved', { description: 'All changes saved locally.' });
        return;
      }

      // ⌘D / Ctrl+D → download config
      if (isMeta && e.key === 'd') {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent('br:download'));
        return;
      }

      // ⌘Shift+C / Ctrl+Shift+C → copy config
      if (isMeta && e.shiftKey && e.key === 'C') {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent('br:copy-config'));
        return;
      }

      // Alt+1-9 → navigate pages
      if (e.altKey) {
        const pageMap: Record<string, AppPage> = {
          '1': 'dashboard',
          '2': 'new-estimate',
          '3': 'projects',
          '4': 'product-explorer',
          '5': 'technical-params',
          '6': 'engineering-activities',
          '7': 'complexity',
          '8': 'estimate-summary',
          '9': 'settings',
        };
        const page = pageMap[e.key];
        if (page) {
          e.preventDefault();
          useAppStore.getState().setCurrentPage(page);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggle]);

  return { open, setOpen, toggle };
}

// ===== Component =====

interface KeyboardShortcutsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type ShortcutItem = {
  keys: string[];
  description: string;
};

type ShortcutCategory = {
  title: string;
  items: ShortcutItem[];
};

const SHORTCUTS: ShortcutCategory[] = [
  {
    title: 'Navigation',
    items: [
      { keys: ['⌘K'], description: 'Open shortcuts' },
      { keys: ['Alt+1'], description: 'Dashboard' },
      { keys: ['Alt+2'], description: 'New Estimate' },
      { keys: ['Alt+3'], description: 'Projects' },
      { keys: ['Alt+4'], description: 'B&R Configuration' },
      { keys: ['Alt+5'], description: 'Technical Parameters' },
      { keys: ['Alt+6'], description: 'Engineering Activities' },
      { keys: ['Alt+7'], description: 'Complexity' },
      { keys: ['Alt+8'], description: 'Estimate Summary' },
      { keys: ['Alt+9'], description: 'Settings' },
    ],
  },
  {
    title: 'Wizard',
    items: [
      { keys: ['←', '→'], description: 'Previous / Next step' },
      { keys: ['Enter'], description: 'Next step' },
    ],
  },
  {
    title: 'General',
    items: [
      { keys: ['⌘S'], description: 'Save configuration' },
      { keys: ['⌘D'], description: 'Download JSON' },
      { keys: ['⌘⇧C'], description: 'Copy to clipboard' },
    ],
  },
];

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="inline-flex h-6 min-w-[24px] items-center justify-center rounded border border-border bg-muted px-1.5 text-[11px] font-mono text-muted-foreground">
      {children}
    </kbd>
  );
}

export function KeyboardShortcutsDialog({
  open,
  onOpenChange,
}: KeyboardShortcutsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Keyboard Shortcuts</DialogTitle>
          <DialogDescription>
            Quick actions to navigate and manage your estimation.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {SHORTCUTS.map((category) => (
            <div key={category.title}>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {category.title}
              </h3>
              <div className="grid grid-cols-2 gap-x-6 gap-y-1.5">
                {category.items.map((item) => (
                  <div
                    key={item.description}
                    className="flex items-center justify-between gap-2 rounded-md px-2 py-1.5 hover:bg-muted/50"
                  >
                    <span className="text-xs text-foreground truncate">
                      {item.description}
                    </span>
                    <span className="flex shrink-0 items-center gap-0.5">
                      {item.keys.map((key, i) => (
                        <React.Fragment key={i}>
                          {i > 0 && (
                            <span className="text-[10px] text-muted-foreground/60">
                              +
                            </span>
                          )}
                          <Kbd>{key}</Kbd>
                        </React.Fragment>
                      ))}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <p className="text-[10px] text-muted-foreground">
          Shortcuts work when not focused on input fields
        </p>
      </DialogContent>
    </Dialog>
  );
}
