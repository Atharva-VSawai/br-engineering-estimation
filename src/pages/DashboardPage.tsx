'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { FolderKanban, FileEdit, CheckCircle2, BarChart3, PlusCircle, Download, Info } from 'lucide-react';
import { StatCard } from '@/components/br/StatCard';
import { SectionCard } from '@/components/br/SectionCard';
import { StatusBadge, ComplexityBadge } from '@/components/br/ComplexityBadge';
import { useAppStore } from '@/store';
import type { ComplexityLevel } from '@/types';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const COMPLEXITY_COLORS: Record<ComplexityLevel, string> = {
  Low: 'bg-emerald-500',
  Medium: 'bg-amber-500',
  High: 'bg-orange-500',
  'Very High': 'bg-red-500',
};

const COMPLEXITY_TEXT_COLORS: Record<ComplexityLevel, string> = {
  Low: 'text-emerald-600',
  Medium: 'text-amber-600',
  High: 'text-orange-600',
  'Very High': 'text-red-600',
};

const ALL_LEVELS: ComplexityLevel[] = ['Low', 'Medium', 'High', 'Very High'];

const ACTIVITY_DOT_COLORS: Record<string, string> = {
  edit: 'bg-blue-400',
  info: 'bg-amber-400',
  create: 'bg-emerald-400',
  complete: 'bg-emerald-500',
  export: 'bg-purple-400',
};

const recentActivity = [
  { time: '2 hours ago', action: 'Configuration updated', detail: 'Motion axes changed from 6 to 8', type: 'edit' },
  { time: '5 hours ago', action: 'Sample data loaded', detail: 'Automated Packaging Machine configuration', type: 'info' },
  { time: '1 day ago', action: 'New estimate created', detail: 'ACOPOStrak Transport System', type: 'create' },
  { time: '2 days ago', action: 'Estimate completed', detail: 'Bottle Inspection Machine \u2013 Medium complexity', type: 'complete' },
  { time: '3 days ago', action: 'Project exported', detail: 'Servo Press Machine configuration as JSON', type: 'export' },
];

export function DashboardPage() {
  const { projects, setCurrentPage, loadSampleConfig } = useAppStore();

  const activeProjects = projects.filter((p) => p.status !== 'Completed').length;
  const draftEstimates = projects.filter((p) => p.status === 'Draft').length;
  const completedEstimates = projects.filter((p) => p.status === 'Completed').length;

  // Complexity distribution
  const complexityDist = useMemo(() => {
    const dist: Record<ComplexityLevel, number> = { Low: 0, Medium: 0, High: 0, 'Very High': 0 };
    projects.forEach((p) => {
      dist[p.complexity]++;
    });
    return dist;
  }, [projects]);

  const totalProjects = projects.length;

  // Average complexity label
  const avgComplexityLabel = useMemo(() => {
    if (totalProjects === 0) return 'N/A';
    const scoreMap: Record<ComplexityLevel, number> = { Low: 1, Medium: 2, High: 3, 'Very High': 4 };
    const avg = projects.reduce((sum, p) => sum + scoreMap[p.complexity], 0) / totalProjects;
    if (avg <= 1.5) return 'Low';
    if (avg <= 2.5) return 'Medium';
    if (avg <= 3.5) return 'High';
    return 'Very High';
  }, [projects, totalProjects]) as ComplexityLevel | 'N/A';

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div>
        <h1 className="text-lg font-bold text-foreground">Engineering Estimation Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Configure the B&R automation system and estimate engineering effort.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Active Projects"
          value={activeProjects}
          icon={<FolderKanban className="h-4 w-4" />}
        />
        <StatCard
          label="Draft Estimates"
          value={draftEstimates}
          icon={<FileEdit className="h-4 w-4" />}
        />
        <StatCard
          label="Completed Estimates"
          value={completedEstimates}
          icon={<CheckCircle2 className="h-4 w-4" />}
        />
        <div>
          <StatCard
            label="Avg. Project Complexity"
            value={avgComplexityLabel}
            icon={<BarChart3 className="h-4 w-4" />}
          />
          {totalProjects > 0 && (
            <div className="flex h-1.5 rounded-full overflow-hidden mt-1 mx-4 mb-2">
              {ALL_LEVELS.map((level) => {
                const count = complexityDist[level];
                if (count === 0) return null;
                return (
                  <div
                    key={level}
                    className={`${COMPLEXITY_COLORS[level]} transition-all duration-300`}
                    style={{ width: `${(count / totalProjects) * 100}%` }}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions & Complexity Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Quick Actions */}
        <SectionCard title="Quick Actions" description="Get started with your engineering estimate">
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={() => setCurrentPage('new-estimate')}
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              New Estimate
            </Button>
            <Button
              variant="outline"
              className="flex-1 border-border"
              onClick={() => loadSampleConfig()}
            >
              <Download className="h-4 w-4 mr-2" />
              Load Sample Data
            </Button>
          </div>
        </SectionCard>

        {/* Complexity Distribution */}
        <SectionCard title="Complexity Distribution" description="Projects by complexity level">
          <div className="space-y-3">
            {/* Stacked bar */}
            <div className="flex h-8 rounded-md overflow-hidden">
              {totalProjects === 0 ? (
                <div className="flex-1 flex items-center justify-center text-xs text-muted-foreground bg-muted">
                  No projects yet
                </div>
              ) : (
                ALL_LEVELS.map((level) => {
                  const count = complexityDist[level];
                  if (count === 0) return null;
                  return (
                    <div
                      key={level}
                      className={`${COMPLEXITY_COLORS[level]} flex items-center justify-center text-white text-xs font-semibold transition-all duration-300`}
                      style={{ width: `${(count / totalProjects) * 100}%`, minWidth: count > 0 ? '2rem' : 0 }}
                      title={`${level}: ${count} project${count !== 1 ? 's' : ''}`}
                    >
                      {count}
                    </div>
                  );
                })
              )}
            </div>
            {/* Legend */}
            <div className="flex flex-wrap gap-x-4 gap-y-1.5">
              {ALL_LEVELS.map((level) => (
                <div key={level} className="flex items-center gap-1.5">
                  <span className={`h-2.5 w-2.5 rounded-sm ${COMPLEXITY_COLORS[level]}`} />
                  <span className={`text-xs font-medium ${COMPLEXITY_TEXT_COLORS[level]}`}> 
                    {level}{complexityDist[level] > 0 ? ` (${complexityDist[level]})` : ''}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </SectionCard>
      </div>

      {/* Recent Projects Table */}
      <SectionCard title="Recent Projects" description="All B&R automation estimation projects">
        <div className="overflow-x-auto -mx-4 px-4">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-xs font-semibold text-muted-foreground h-9">Project</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground h-9">Customer</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground h-9">Machine Type</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground h-9">B&R Configuration</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground h-9">Complexity</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground h-9">Status</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground h-9">Last Updated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects.map((p) => (
                <TableRow
                  key={p.id}
                  className="border-border cursor-pointer hover:bg-muted/50"
                  onClick={() => setCurrentPage('projects')}
                >
                  <TableCell className="text-sm font-medium text-foreground py-2.5">{p.name}</TableCell>
                  <TableCell className="text-sm text-muted-foreground py-2.5">{p.customer}</TableCell>
                  <TableCell className="text-sm text-muted-foreground py-2.5">{p.machineType}</TableCell>
                  <TableCell className="text-sm text-muted-foreground py-2.5">X20, ACOPOStrak, ACOPOS</TableCell>
                  <TableCell className="py-2.5">
                    <ComplexityBadge level={p.complexity} />
                  </TableCell>
                  <TableCell className="py-2.5">
                    <StatusBadge status={p.status} />
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground py-2.5">{p.updatedAt}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </SectionCard>

      {/* Recent Activity */}
      <SectionCard title="Recent Activity" description="Latest actions and events">
        <div>
          {recentActivity.map((item, idx) => (
            <div
              key={idx}
              className={`flex items-start gap-3 py-2 ${idx < recentActivity.length - 1 ? 'border-b border-border/50' : ''}`}
            >
              <span className={`w-2 h-2 rounded-full mt-1 shrink-0 ${ACTIVITY_DOT_COLORS[item.type] || 'bg-gray-400'}`} />
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium text-foreground">{item.action}</div>
                <div className="text-[11px] text-muted-foreground truncate">{item.detail}</div>
              </div>
              <span className="text-[11px] text-muted-foreground ml-auto shrink-0 whitespace-nowrap">{item.time}</span>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Prototype Information */}
      <SectionCard title="Prototype Information">
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Info className="h-4 w-4" />
          </div>
          <div className="text-xs text-muted-foreground leading-relaxed space-y-1">
            <p>
              <strong className="text-foreground">Current version:</strong> Technical configuration prototype (frontend only)
            </p>
            <p>
              <strong className="text-foreground">Effort estimation engine</strong> — planned for future integration with validated company data.
            </p>
            <p>
              This tool demonstrates how an engineer enters technical requirements of a B&R industrial automation project to assess engineering complexity and prepare for effort estimation.
            </p>
          </div>
        </div>
      </SectionCard>
    </motion.div>
  );
}
