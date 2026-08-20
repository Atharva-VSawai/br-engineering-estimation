'use client';

import React, { useEffect } from 'react';
import { Save, FileText, FileJson, Sun, Moon, ChevronRight, Copy } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAppStore } from '@/store';
import { toast } from 'sonner';
import type { AppPage } from '@/types';

const PAGE_NAMES: Record<AppPage, string> = {
  dashboard: 'Dashboard',
  'new-estimate': 'New Estimate',
  projects: 'Projects',
  'product-explorer': 'B&R Configuration',
  'technical-params': 'Technical Parameters',
  'engineering-activities': 'Engineering Activities',
  complexity: 'Complexity',
  'estimate-summary': 'Estimate Summary',
  settings: 'Settings',
};

export function AppHeader() {
  const { config, currentPage } = useAppStore();
  const { theme, setTheme } = useTheme();
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

  const handleCopy = async () => {
    await navigator.clipboard.writeText(JSON.stringify(config, null, 2));
    toast('Copied to clipboard', { description: 'Configuration JSON copied.' });
  };

  const handleSave = () => {
    toast('Configuration saved', { description: 'All changes saved locally.' });
  };

  // Listen for keyboard shortcut custom events
  useEffect(() => {
    const handleDownloadEvent = () => handleDownload();
    const handleCopyEvent = () => handleCopy();
    window.addEventListener('br:download', handleDownloadEvent);
    window.addEventListener('br:copy-config', handleCopyEvent);
    return () => {
      window.removeEventListener('br:download', handleDownloadEvent);
      window.removeEventListener('br:copy-config', handleCopyEvent);
    };
  }, []);

  return (
    <header className="no-print flex h-14 shrink-0 items-center justify-between border-b border-border bg-background/80 backdrop-blur-sm px-6 shadow-sm">
      <div className="flex items-center gap-3">
        {currentPage !== 'new-estimate' ? (
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-muted-foreground">{PAGE_NAMES[currentPage]}</span>
            <ChevronRight className="h-3 w-3 text-muted-foreground/50" />
            <span className="text-xs font-medium text-foreground truncate max-w-[280px]">{projectName}</span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <span className="text-sm font-semibold text-foreground truncate max-w-[280px]">
              {projectName}
            </span>
          </div>
        )}
      </div>
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        >
          {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
        <Badge
          variant="outline"
          className="border-amber-300 bg-amber-50 text-amber-700 text-xs font-medium dark:border-amber-600/40 dark:bg-amber-900/20 dark:text-amber-400"
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
          variant="outline"
          size="sm"
          className="h-8 gap-1.5 text-xs"
          onClick={handleCopy}
        >
          <Copy className="h-3.5 w-3.5" />
          Copy
        </Button>
        <kbd className="hidden lg:inline-flex h-5 items-center gap-1 rounded border border-border bg-muted px-1.5 text-[10px] font-mono text-muted-foreground">
          &#8984;K
        </kbd>
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
