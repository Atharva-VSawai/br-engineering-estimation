'use client';

import React, { useState } from 'react';
import { SectionCard } from '@/components/br/SectionCard';
import { useTheme } from 'next-themes';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Sun,
  Moon,
  Keyboard,
  Info,
  Palette,
  Code2,
  Cpu,
} from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  React.useEffect(() => {

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const isDark = theme === 'dark';

  const handleThemeToggle = (checked: boolean) => {
    setTheme(checked ? 'dark' : 'light');
    toast.success(checked ? 'Dark mode enabled' : 'Light mode enabled');
  };

  const shortcuts = [
    { key: '⌘K', desc: 'Shortcuts' },
    { key: '⌘S', desc: 'Save' },
    { key: '⌘D', desc: 'Download JSON' },
    { key: '⌘⇧C', desc: 'Copy Config' },
    { key: '←→', desc: 'Wizard Nav' },
    { key: 'Alt+1-9', desc: 'Page Switch' },
  ];

  const infoRows = [
    { label: 'Application', value: 'B&R Engineering Estimation Tool' },
    { label: 'Version', value: 'v0.9' },
    { label: 'Technology', value: 'Next.js, React, TypeScript, Tailwind CSS' },
    { label: 'Data Storage', value: 'Local (client-side state)' },
    { label: 'Backend', value: 'Not connected (planned)' },
    { label: 'UI Framework', value: 'shadcn/ui + Tailwind CSS 4' },
    { label: 'State Management', value: 'Zustand' },
    { label: 'Animations', value: 'Framer Motion' },
    { label: 'Theme System', value: 'next-themes (Light/Dark)' },
  ];

  const plannedIntegrations = [
    { name: 'Theme System (Light/Dark)', status: 'Completed' as const },
    { name: 'Keyboard Shortcuts System', status: 'Completed' as const },
    { name: 'Project Save & Duplicate', status: 'Completed' as const },
    { name: 'Clipboard & JSON Export', status: 'Completed' as const },
    { name: 'Engineering Effort Estimation', status: 'Completed' as const },
    { name: 'Project Timeline Generator', status: 'Completed' as const },
    { name: 'Step Validation Indicators', status: 'Completed' as const },
    { name: 'I/O Summary Visualization', status: 'Completed' as const },
    { name: 'Complexity Gauge (SVG)', status: 'Completed' as const },
    { name: 'Animated Counters', status: 'Completed' as const },
    { name: 'Dark Mode Full Support', status: 'Completed' as const },
    { name: 'Project Templates', status: 'Completed' as const },
    { name: 'Configuration Health Score', status: 'Completed' as const },
    { name: 'Project Comparison (Winner Row)', status: 'Completed' as const },
    { name: 'Effort Overview Panel', status: 'Completed' as const },
    { name: 'HTML Report Export (Print PDF)', status: 'Completed' as const },
    { name: 'Wizard Undo/Redo History', status: 'Completed' as const },
    { name: 'Project Status Workflow', status: 'Completed' as const },
    { name: 'Risk Assessment Panel', status: 'Completed' as const },
    { name: 'Complexity Radar Chart', status: 'Completed' as const },
    { name: 'Effort Allocation Bars', status: 'Completed' as const },
    { name: 'Wizard Step Jump (Alt+Keys)', status: 'Completed' as const },
    { name: 'Enhanced Quick Stats (8 metrics)', status: 'Completed' as const },
    { name: 'Config-Driven Architecture Diagram', status: 'Completed' as const },
    { name: 'Dynamic Effort Allocation', status: 'Completed' as const },
    { name: 'Live Notification Events', status: 'Completed' as const },
    { name: 'Review Step HTML Export', status: 'Completed' as const },
    { name: 'Excel Export', status: 'Planned' as const },
    { name: 'Jira Integration', status: 'Planned' as const },
    { name: 'ML-based Estimation', status: 'Planned' as const },
    { name: 'Historical Data', status: 'Planned' as const },
    { name: 'User Authentication', status: 'Planned' as const },
    { name: 'Database Storage (Prisma)', status: 'Planned' as const },
  ];

  const techBadges = [
    'Next.js 16',
    'React 19',
    'TypeScript',
    'Tailwind CSS 4',
    'shadcn/ui',
    'Zustand',
    'Framer Motion',
  ];

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      <div>
        <h1 className="text-lg font-bold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Customize your estimation workspace
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {}
        <SectionCard
          title="Appearance"
          action={<Palette className="h-4 w-4 text-muted-foreground" />}
        >
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="dark-mode" className="text-sm font-medium">
                Dark Mode
              </Label>
              <p className="text-sm text-muted-foreground">
                Switch between light and dark themes
              </p>
            </div>
            <div className="flex items-center gap-2">
              {mounted && (
                <span className="text-muted-foreground">
                  {isDark ? (
                    <Moon className="h-4 w-4" />
                  ) : (
                    <Sun className="h-4 w-4" />
                  )}
                </span>
              )}
              <Switch
                id="dark-mode"
                checked={mounted ? isDark : false}
                onCheckedChange={handleThemeToggle}
              />
            </div>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            Theme preference is saved in your browser
          </p>
        </SectionCard>

        {}
        <SectionCard
          title="Keyboard Shortcuts"
          description="Use keyboard shortcuts for faster navigation"
          action={<Keyboard className="h-4 w-4 text-muted-foreground" />}
        >
          <div className="grid grid-cols-2 gap-2">
            {shortcuts.map((s) => (
              <div key={s.key} className="flex items-center gap-2">
                <kbd className="inline-flex h-6 min-w-[24px] items-center justify-center rounded border border-border bg-muted px-1.5 text-sm font-mono text-muted-foreground">
                  {s.key}
                </kbd>
                <span className="text-sm text-muted-foreground truncate">
                  {s.desc}
                </span>
              </div>
            ))}
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            Press ⌘K anywhere to see all shortcuts
          </p>
        </SectionCard>

        {}
        <SectionCard
          title="Application Info"
          action={<Info className="h-4 w-4 text-muted-foreground" />}
        >
          <div className="space-y-0 text-sm">
            {infoRows.map((row) => (
              <div
                key={row.label}
                className="flex justify-between py-1.5 border-b border-border/50 last:border-0"
              >
                <span className="text-muted-foreground">{row.label}</span>
                <span className="font-medium text-foreground text-right max-w-[60%]">
                  {row.value}
                </span>
              </div>
            ))}
          </div>
        </SectionCard>

        {}
        <SectionCard
          title="Planned Integrations"
          action={<Code2 className="h-4 w-4 text-muted-foreground" />}
        >
          <div className="space-y-0 text-sm">
            {plannedIntegrations.map((item) => (
              <div
                key={item.name}
                className="flex items-center justify-between py-1.5 border-b border-border/50 last:border-0"
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      item.status === 'Completed'
                        ? 'bg-emerald-500'
                        : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  />
                  <span className="text-foreground">{item.name}</span>
                </div>
                <span className="text-muted-foreground">{item.status}</span>
              </div>
            ))}
          </div>
        </SectionCard>

        {}
        <SectionCard
          title="About B&R Engineering Estimation Tool"
          className="md:col-span-2"
          noPadding
        >
          <div className="px-4 pb-4 flex flex-col items-center text-center space-y-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Cpu className="h-6 w-6 text-primary" />
            </div>
            <div className="space-y-1">
              <h2 className="text-sm font-semibold text-foreground">
                B&R Engineering Estimation Tool
              </h2>
              <span className="inline-block rounded-full bg-muted px-2 py-0.5 text-sm text-muted-foreground">
                v1.0 — Engineering Effort Estimation
              </span>
            </div>
            <p className="text-sm text-muted-foreground max-w-lg leading-relaxed">
              A comprehensive estimation tool designed for B&R Industrial Automation
              engineers. Configure controller hardware, I/O modules, motion systems,
              HMI panels, safety components, and more. Generate detailed effort
              estimates with complexity analysis to streamline project planning and
              resource allocation.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-1.5">
              {techBadges.map((badge) => (
                <span
                  key={badge}
                  className="rounded-full bg-muted px-2 py-0.5 text-sm text-muted-foreground"
                >
                  {badge}
                </span>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              Built for B&R Industrial Automation engineers
            </p>
          </div>
        </SectionCard>
      </div>
    </motion.div>
  );
}
