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
import type { AppPage } from '@/types';
import { NotificationCenter } from '@/components/br/NotificationCenter';

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


const PROJECT_CONTEXT_PAGES: AppPage[] = ['new-estimate', 'estimate-summary', 'product-explorer', 'technical-params', 'engineering-activities', 'complexity', 'compare'];

export function AppHeader() {
  const { config, currentPage, wizardStep, activeProjectId, projects, setCurrentPage, notifications, addNotification, markAllNotificationsRead, updateProject, createNewProject } = useAppStore();
  const { theme, setTheme } = useTheme();
  const [ncOpen, setNcOpen] = React.useState(false);
  const unreadCount = notifications.filter((n) => !n.read).length;
  const activeProject = activeProjectId ? projects.find((p) => p.id === activeProjectId) : null;
  const projectName = activeProject?.name || config.project.name;
  const showProjectName = activeProjectId && projectName && PROJECT_CONTEXT_PAGES.includes(currentPage);

  const handlePdfExport = async () => {
    try {
      const params = activeProjectId ? `?projectId=${encodeURIComponent(activeProjectId)}` : '';
      const res = await fetch(`/api/export/pdf${params}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      if (!res.ok) throw new Error(`Server returned ${res.status}`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `br-estimate-${(config.project.name || 'untitled').replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase()}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      addNotification({ message: 'PDF exported', detail: 'Report downloaded', icon: 'FileText', color: 'text-red-500' });
      toast('PDF exported', { description: 'Report downloaded.' });
    } catch {
      toast.error('PDF export failed');
    }
  };

  const handleExcelExport = async () => {
    try {
      const res = await fetch('/api/export/excel', {
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
      addNotification({ message: 'Excel exported', detail: 'Spreadsheet downloaded', icon: 'Download', color: 'text-emerald-500' });
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
    addNotification({ message: 'Configuration exported', detail: 'JSON file downloaded', icon: 'File', color: 'text-purple-500' });
    toast('Configuration exported', { description: 'JSON file downloaded.' });
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(JSON.stringify(config, null, 2));
    addNotification({ message: 'Copied to clipboard', detail: 'Configuration JSON copied', icon: 'Copy', color: 'text-blue-500' });
    toast('Copied to clipboard', { description: 'Configuration JSON copied.' });
  };

  const handleSave = () => {
    if (activeProjectId) {
      const clonedConfig = JSON.parse(JSON.stringify(config)) as typeof config;
      updateProject(activeProjectId, {
        config: clonedConfig,
        name: config.project.name || activeProject?.name,
        customer: config.project.customer || activeProject?.customer,
        machineType: config.project.machineType || activeProject?.machineType,
        industry: config.project.industry || activeProject?.industry,
        complexity: config.project.complexity || activeProject?.complexity,
      });
      addNotification({ message: 'Project saved', detail: `${config.project.name || activeProject?.name || 'Untitled'} configuration saved`, icon: 'Check', color: 'text-emerald-500' });
      toast('Project saved', { description: `${config.project.name || activeProject?.name || 'Untitled'} \u2014 all changes persisted.` });
    } else if (config.project.name?.trim()) {
      const id = createNewProject(config.project.name);
      const clonedConfig = JSON.parse(JSON.stringify(config)) as typeof config;
      updateProject(id, {
        config: clonedConfig,
        name: config.project.name,
        customer: config.project.customer,
        machineType: config.project.machineType,
        industry: config.project.industry,
      });
      addNotification({ message: 'Project created & saved', detail: config.project.name, icon: 'Check', color: 'text-emerald-500' });
      toast('Project created & saved', { description: `${config.project.name} \u2014 saved as new project.` });
    } else {
      toast.error('Nothing to save', { description: 'Enter a project name first.' });
    }
  };

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
  }, [config, activeProjectId]);

  return (
    <header className="no-print flex h-14 shrink-0 items-center justify-between border-b border-border/50 bg-background/80 backdrop-blur-sm px-6 shadow-[0_1px_3px_rgba(0,0,0,0.05)] dark:shadow-[0_1px_3px_rgba(0,0,0,0.2)]">
      <div className="flex items-center gap-3">
        {currentPage === 'new-estimate' ? (
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <span className="text-sm font-semibold text-foreground truncate max-w-[280px]">
              {projectName || 'New Estimate'}
            </span>
          </div>
        ) : showProjectName ? (
          <div className="flex items-center gap-1.5">
            <span className="text-sm text-muted-foreground">{PAGE_NAMES[currentPage]}</span>
            <ChevronRight className="h-3 w-3 text-muted-foreground/40" />
            <span className="text-sm font-medium text-foreground truncate max-w-[280px]">{projectName}</span>
          </div>
        ) : (
          <span className="text-sm font-semibold text-foreground">{PAGE_NAMES[currentPage]}</span>
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
        {currentPage !== 'dashboard' && currentPage !== 'settings' && (
          <Badge
            variant="outline"
            className={`border-amber-300 bg-amber-50 text-amber-700 text-sm font-medium dark:border-amber-600/40 dark:bg-amber-900/20 dark:text-amber-400 ${currentPage === 'new-estimate' ? 'animate-pulse' : ''}`}
          >
            Draft
          </Badge>
        )}
        {currentPage === 'new-estimate' && (() => {
          const pct = Math.round(((wizardStep + 1) / 14) * 100);
          const radius = 10;
          const circumference = 2 * Math.PI * radius;
          const offset = circumference * (1 - pct / 100);
          return (
            <div className="relative flex items-center justify-center" style={{ width: 28, height: 28 }}>
              <svg width="28" height="28" className="-rotate-90">
                <circle cx="14" cy="14" r={radius} fill="none" strokeWidth="2.5" className="stroke-muted" />
                <motion.circle cx="14" cy="14" r={radius} fill="none" strokeWidth="2.5" strokeLinecap="round" className="stroke-primary" strokeDasharray={circumference} initial={{ strokeDashoffset: circumference }} animate={{ strokeDashoffset: offset }} transition={{ duration: 0.5, ease: 'easeOut' }} />
              </svg>
              <span className="absolute text-[11px] font-bold text-foreground">{pct}</span>
            </div>
          );
        })()}
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 relative" onClick={() => setNcOpen((prev) => !prev)}>
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && <span className="w-2 h-2 rounded-full bg-red-500 absolute -top-0.5 -right-0.5" />}
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-9 gap-1.5 text-sm">
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
        <Button variant="outline" size="sm" className="h-9 gap-1.5 text-sm" onClick={handleCopy}>
          <Copy className="h-3.5 w-3.5" />
          Copy
        </Button>
        <kbd className="hidden lg:inline-flex h-6 items-center gap-1 rounded border border-border bg-muted px-1.5 text-xs font-mono text-muted-foreground">
          &#8984;K
        </kbd>
        <Button variant="default" size="sm" className="h-9 gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90" onClick={handleSave}>
          <Save className="h-3.5 w-3.5" />
          Save
        </Button>
      </div>
      <NotificationCenter open={ncOpen} onClose={() => setNcOpen(false)} unreadCount={unreadCount} notifications={notifications} onMarkAllRead={markAllNotificationsRead} />
    </header>
  );
}
