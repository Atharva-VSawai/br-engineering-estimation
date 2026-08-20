'use client';

import React from 'react';
import { Save, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAppStore } from '@/store';

export function AppHeader() {
  const { config, currentPage } = useAppStore();
  const projectName = config.project.name || 'Packaging Machine – Project 2026';

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-white px-6">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          <span className="text-sm font-semibold text-foreground">
            {projectName}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Badge
          variant="outline"
          className="border-amber-300 bg-amber-50 text-amber-700 text-xs font-medium"
        >
          Draft
        </Badge>
        <Button
          variant="default"
          size="sm"
          className="h-8 gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <Save className="h-3.5 w-3.5" />
          Save
        </Button>
      </div>
    </header>
  );
}
