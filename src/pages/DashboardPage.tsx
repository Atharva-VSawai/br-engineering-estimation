'use client';

import React from 'react';
import { FolderKanban, FileEdit, CheckCircle2, BarChart3 } from 'lucide-react';
import { StatCard } from '@/components/br/StatCard';
import { SectionCard } from '@/components/br/SectionCard';
import { StatusBadge, ComplexityBadge } from '@/components/br/ComplexityBadge';
import { useAppStore } from '@/store';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export function DashboardPage() {
  const { projects, setCurrentPage } = useAppStore();

  const activeProjects = projects.filter((p) => p.status !== 'Completed').length;
  const draftEstimates = projects.filter((p) => p.status === 'Draft').length;
  const completedEstimates = projects.filter((p) => p.status === 'Completed').length;

  return (
    <div className="space-y-6">
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
        <StatCard
          label="Avg. Project Complexity"
          value="Medium"
          icon={<BarChart3 className="h-4 w-4" />}
        />
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

      {/* Info Banner */}
      <SectionCard title="Prototype Information">
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary text-xs font-bold">
            i
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
    </div>
  );
}
