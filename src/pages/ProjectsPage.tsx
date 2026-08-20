'use client';

import React, { useState, useMemo } from 'react';
import { PlusCircle, Search, Copy, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SectionCard } from '@/components/br/SectionCard';
import { StatusBadge, ComplexityBadge } from '@/components/br/ComplexityBadge';
import { useAppStore } from '@/store';
import type { Project } from '@/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const STATUS_OPTIONS = ['All', 'Draft', 'In Review', 'Completed'] as const;

type StatusOption = (typeof STATUS_OPTIONS)[number];

export function ProjectsPage() {
  const { projects, setCurrentPage, addProject, deleteProject } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      const matchesSearch =
        searchTerm === '' ||
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.machineType.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === 'All' || p.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [projects, searchTerm, statusFilter]);

  const handleDuplicate = (project: Project) => {
    const newProject: Project = {
      ...project,
      id: 'proj-' + Date.now(),
      name: `${project.name} (Copy)`,
      status: 'Draft',
      createdAt: 'just now',
      updatedAt: 'just now',
    };
    addProject(newProject);
    toast('Project duplicated', {
      description: `Created copy of ${project.name}`,
    });
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Delete "${name}"? This cannot be undone.`)) {
      deleteProject(id);
    }
  };

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

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="relative max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search projects..."
            className="h-9 pl-8 text-sm"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {STATUS_OPTIONS.map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`rounded-md border px-3 py-1.5 text-xs font-medium transition-colors ${
                statusFilter === status
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border bg-white text-muted-foreground hover:border-primary/50'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        Showing {filteredProjects.length} of {projects.length} projects
      </p>

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
                <TableHead className="text-xs font-semibold text-muted-foreground h-9">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProjects.map((p) => (
                <TableRow key={p.id} className="border-border hover:bg-muted/50 cursor-pointer">
                  <TableCell className="text-xs font-mono text-muted-foreground py-2.5">{p.id}</TableCell>
                  <TableCell className="text-sm font-medium text-foreground py-2.5">{p.name}</TableCell>
                  <TableCell className="text-sm text-muted-foreground py-2.5">{p.customer}</TableCell>
                  <TableCell className="text-sm text-muted-foreground py-2.5">{p.machineType}</TableCell>
                  <TableCell className="text-xs text-muted-foreground py-2.5">{p.createdAt}</TableCell>
                  <TableCell className="text-xs text-muted-foreground py-2.5">{p.updatedAt}</TableCell>
                  <TableCell className="py-2.5"><ComplexityBadge level={p.complexity} /></TableCell>
                  <TableCell className="py-2.5"><StatusBadge status={p.status} /></TableCell>
                  <TableCell className='py-2.5'>
                    <div className='flex items-center gap-1'>
                      <Button variant='ghost' size='sm' className='h-7 w-7 p-0 text-muted-foreground hover:text-foreground' onClick={(e) => { e.stopPropagation(); handleDuplicate(p); }}>
                        <Copy className='h-3.5 w-3.5' />
                      </Button>
                      {!p.id.startsWith('sample-') && (
                        <Button variant='ghost' size='sm' className='h-7 w-7 p-0 text-muted-foreground hover:text-destructive' onClick={(e) => { e.stopPropagation(); handleDelete(p.id, p.name); }}>
                          <Trash2 className='h-3.5 w-3.5' />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </SectionCard>
    </div>
  );
}
