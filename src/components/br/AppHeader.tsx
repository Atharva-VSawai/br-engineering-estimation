'use client';

import React, { useEffect } from 'react';
import { Save, FileText, FileJson, FileSpreadsheet, Download, ChevronDown, Sun, Moon, ChevronRight, Copy, Bell } from 'lucide-react';
import { useTheme } from 'next-themes';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAppStore } from '@/store';
import { toast } from 'sonner';
import { exportPdf } from '@/lib/export-pdf';
import type { AppPage } from '@/types';
import { NotificationCenter, useNotificationCenter } from '@/components/br/NotificationCenter';

const PAGE_NAMES: Record<AppPage, string> = {
  dashboard: 'Dashboard',
  'new-estimate': 'New Estimate',
  projects: 'Projects',
  'product-explorer': 'B&R Configuration',
  'technical-params': 'Technical Parameters',
  'engineering-activities': 'Engineering Activities',
  complexity: 'Complexity',
  'estimate-summary': 'Estimate Summary',
  compare: 'Compare',
  settings: 'Settings',
};

export function AppHeader() {
  const { config, currentPage, wizardStep, setCurrentPage } = useAppStore();
  const { theme, setTheme } = useTheme();
  const nc = useNotificationCenter();
  const projectName = config.project.name || 'Packaging Machine \u2013 Project 2026';

  const handlePdfExport = () => {
    exportPdf(config);
    window.dispatchEvent(new CustomEvent('br:notification', { detail: { action: 'PDF exported', detail: 'Report downloaded', icon: FileText, color: 'text-red-500' } }));
    toast('PDF exported', { description: 'Report downloaded.' });
  };

  const handleExcelExport = async () => {
    try {
      const res = await fetch('/api/export/excel?XTransformPort=3000', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      if (!res.ok) throw new Error('Export failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `br-estimate-${config.project.name || 'untitled'}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      window.dispatchEvent(new CustomEvent('br:notification', { detail: { action: 'Excel exported', detail: 'Spreadsheet downloaded', icon: FileSpreadsheet, color: 'text-emerald-500' } }));
      toast('Excel exported', { description: 'Spreadsheet file downloaded.' });
    } catch {
      toast.error('Excel export failed');
    }
  };

  const handleJsonExport = () => {
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
    window.dispatchEvent(new CustomEvent('br:notification', { detail: { action: 'Configuration exported', detail: 'JSON file downloaded', icon: FileJson, color: 'text-purple-500' } }));
    toast('Configuration exported', { description: 'JSON file downloaded.' });
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(JSON.stringify(config, null, 2));
    window.dispatchEvent(new CustomEvent('br:notification', { detail: { action: 'Copied to clipboard', detail: 'Configuration JSON copied', icon: Copy, color: 'text-blue-500' } }));
    toast('Copied to clipboard', { description: 'Configuration JSON copied.' });
  };

  const handleSave = () => {
    window.dispatchEvent(new CustomEvent('br:notification', { detail: { action: 'Configuration saved', detail: `Project: ${config.project.name || 'Untitled'}`, icon: Save, color: 'text-emerald-500' } }));
    toast('Configuration saved', { description: 'All changes saved locally.' });
  };

  // Listen for keyboard shortcut custom events
  useEffect(() => {
    const handleDownloadEvent = () => handleJsonExport();
    const handleCopyEvent = () => handleCopy();
    const handlePdfEvent = () => handlePdfExport();
    window.addEventListener('br:download', handleDownloadEvent);
    window.addEventListener('br:copy-config', handleCopyEvent);
    window.addEventListener('br:export-pdf', handlePdfEvent);
    return () => {
      window.removeEventListener('br:download', handleDownloadEvent);
      window.removeEventListener('br:copy-config', handleCopyEvent);
      window.removeEventListener('br:export-pdf', handlePdfEvent);
    };
  }, []);

  return (
    <header className="no-print flex h-14 shrink-0 items-center justify-between border-b border-border/50 bg-background/80 backdrop-blur-sm px-6 shadow-[0_1px_3px_rgba(0,0,0,0.05)] dark:shadow-[0_1px_3px_rgba(0,0,0,0.2)]">
      <div className="flex items-center gap-3">
        {currentPage !== 'new-estimate' ? (
          <div className="flex items-center gap-1.5">
            <span className="text-sm text-muted-foreground">{PAGE_NAMES[currentPage]}</span>
            <ChevronRight className="h-3 w-3 text-muted-foreground/40" />
            <span className="text-sm font-medium text-foreground truncate max-w-[280px]">{projectName}</span>
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
          suppressHydrationWarning
        >
          {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
        <Badge
          variant="outline"
          className={`border-amber-300 bg-amber-50 text-amber-700 text-sm font-medium dark:border-amber-600/40 dark:bg-amber-900/20 dark:text-amber-400 ${currentPage === 'new-estimate' ? 'animate-pulse' : ''}`}
        >
          Draft
        </Badge>
        {currentPage === 'new-estimate' && (() => {
          const pct = Math.round(((wizardStep + 1) / 14) * 100);
          const radius = 10;
          const circumference = 2 * Math.PI * radius;
          const offset = circumference * (1 - pct / 100);
          return (
            <div className="relative flex items-center justify-center" style={{ width: 28, height: 28 }}>
              <svg width="28" height="28" className="-rotate-90">
                <circle
                  cx="14" cy="14" r={radius}
                  fill="none"
                  strokeWidth="2.5"
                  className="stroke-muted"
                />
                <motion.circle
                  cx="14" cy="14" r={radius}
                  fill="none"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  className="stroke-primary"
                  strokeDasharray={circumference}
                  initial={{ strokeDashoffset: circumference }}
                  animate={{ strokeDashoffset: offset }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                />
              </svg>
              <span className="absolute text-[11px] font-bold text-foreground">
                {pct}
              </span>
            </div>
          );
        })()}
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 relative"
          onClick={nc.toggle}
        >
          <Bell className="h-4 w-4" />
          {nc.unreadCount > 0 && (
            <span className="w-2 h-2 rounded-full bg-red-500 absolute -top-0.5 -right-0.5" />
          )}
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-9 gap-1.5 text-sm"
            >
              <Download className="h-3.5 w-3.5" />
              Export
              <ChevronDown className="h-3 w-3 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={handlePdfExport} className="gap-2 cursor-pointer">
              <FileText className="h-4 w-4 text-red-500" />
              <span>Export PDF</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleExcelExport} className="gap-2 cursor-pointer">
              <FileSpreadsheet className="h-4 w-4 text-emerald-500" />
              <span>Export Excel</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleJsonExport} className="gap-2 cursor-pointer">
              <FileJson className="h-4 w-4 text-purple-500" />
              <span>Export JSON</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button
          variant="outline"
          size="sm"
          className="h-9 gap-1.5 text-sm"
          onClick={handleCopy}
        >
          <Copy className="h-3.5 w-3.5" />
          Copy
        </Button>
        <kbd className="hidden lg:inline-flex h-6 items-center gap-1 rounded border border-border bg-muted px-1.5 text-xs font-mono text-muted-foreground">
          &#8984;K
        </kbd>
        <Button
          variant="default"
          size="sm"
          className="h-9 gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90"
          onClick={handleSave}
        >
          <Save className="h-3.5 w-3.5" />
          Save
        </Button>
      </div>
      <NotificationCenter
        open={nc.open}
        onClose={nc.close}
        unreadCount={nc.unreadCount}
        notifications={nc.notifications}
        onMarkAllRead={nc.markAllRead}
      />
    </header>
  );
}
