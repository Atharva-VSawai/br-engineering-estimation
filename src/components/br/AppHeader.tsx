'use client';

import React from 'react';
import { Save, FileText, FileJson } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAppStore } from '@/store';
import { toast } from 'sonner';

export function AppHeader() {
  const { config } = useAppStore();
  const projectName = config.project.name || 'Packaging Machine \u2013 Project 2026';

  const handleDownload = () => {
    const json = JSON.stringify(config, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `br-estimate-${config.project.name || 'untitled'}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast('Configuration exported', { description: 'JSON file downloaded.' });
  };

  const handleSave = () => {
    toast('Configuration saved', { description: 'All changes saved locally.' });
  };

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-white px-6 shadow-sm">
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
          variant="outline"
          size="sm"
          className="h-8 gap-1.5 text-xs"
          onClick={handleDownload}
        >
          <FileJson className="h-3.5 w-3.5" />
          Download
        </Button>
        <Button
          variant="default"
          size="sm"
          className="h-8 gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90"
          onClick={handleSave}
        >
          <Save className="h-3.5 w-3.5" />
          Save
        </Button>
      </div>
    </header>
  );
}
