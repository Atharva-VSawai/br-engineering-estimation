'use client';

import React from 'react';
import { PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
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

export function ProjectsPage() {
  const { projects, setCurrentPage } = useAppStore();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-foreground">Projects</h1>
          <p className="text-sm text-muted-foreground">All B&R engineering estimation projects.</p>
        </div>
        <Button
          size="sm"
          className="h-8 gap-1.5 text-xs bg-primary text-primary-foreground hover:bg-primary/90"
          onClick={() => setCurrentPage('new-estimate')}
        >
          <PlusCircle className="h-3.5 w-3.5" />
          New Estimate
        </Button>
      </div>

      <SectionCard title="Project History">
        <div className="overflow-x-auto -mx-4 px-4">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-xs font-semibold text-muted-foreground h-9">Project ID</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground h-9">Project Name</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground h-9">Customer</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground h-9">Machine Type</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground h-9">Created</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground h-9">Updated</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground h-9">Complexity</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground h-9">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects.map((p) => (
                <TableRow key={p.id} className="border-border hover:bg-muted/50 cursor-pointer">
                  <TableCell className="text-xs font-mono text-muted-foreground py-2.5">{p.id}</TableCell>
                  <TableCell className="text-sm font-medium text-foreground py-2.5">{p.name}</TableCell>
                  <TableCell className="text-sm text-muted-foreground py-2.5">{p.customer}</TableCell>
                  <TableCell className="text-sm text-muted-foreground py-2.5">{p.machineType}</TableCell>
                  <TableCell className="text-xs text-muted-foreground py-2.5">{p.createdAt}</TableCell>
                  <TableCell className="text-xs text-muted-foreground py-2.5">{p.updatedAt}</TableCell>
                  <TableCell className="py-2.5"><ComplexityBadge level={p.complexity} /></TableCell>
                  <TableCell className="py-2.5"><StatusBadge status={p.status} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </SectionCard>
    </div>
  );
}