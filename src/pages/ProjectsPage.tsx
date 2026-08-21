'use client';

import React, { useState, useMemo } from 'react';
import { PlusCircle, Search, Copy, Trash2, FolderOpen } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { SectionCard } from '@/components/br/SectionCard';
import { ComplexityBadge } from '@/components/br/ComplexityBadge';
import { useAppStore } from '@/store';
import type { Project, ComplexityLevel } from '@/types';
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

const COMPLEXITY_BORDER: Record<ComplexityLevel, string> = {
  Low: 'border-l-emerald-400',
  Medium: 'border-l-amber-400',
  High: 'border-l-orange-400',
  'Very High': 'border-l-red-400',
};

export function ProjectsPage() {
  const { projects, setCurrentPage, addProject, deleteProject, updateProject, updateConfig } = useAppStore();
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
    if (project.config) {
      updateConfig(project.config);
    }
    setCurrentPage('new-estimate');
    toast('Project duplicated', {
      description: `Created copy of ${project.name} — editing in wizard`,
    });
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Delete "${name}"? This cannot be undone.`)) {
      deleteProject(id);
    }
  };

  const isSearching = searchTerm !== '' || statusFilter !== 'All';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-foreground">Projects<span className="ml-2 inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">{projects.length}</span></h1>
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
        <motion.div className="flex flex-wrap gap-2" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.2 }}>
          {STATUS_OPTIONS.map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`rounded-md border px-3 py-1.5 text-xs font-medium transition-colors ${
                statusFilter === status
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border bg-card text-muted-foreground hover:border-primary/50'
              }`}
            >
              {status}
            </button>
          ))}
        </motion.div>
      </div>

      {filteredProjects.length > 0 && (
        <p className="text-xs text-muted-foreground">
          Showing {filteredProjects.length} of {projects.length} projects
        </p>
      )}

      {filteredProjects.length === 0 ? (
        <SectionCard title="Project History">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center justify-center py-16"
          >
            <FolderOpen className="h-12 w-12 text-muted-foreground/30" />
            <h3 className="text-sm font-medium text-foreground mt-4">No projects found</h3>
            <p className="text-xs text-muted-foreground mt-1">
              {isSearching
                ? 'Try adjusting your search or filter'
                : 'Create your first estimate to get started'}
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-3 text-xs"
              onClick={() => setCurrentPage('new-estimate')}
            >
              <PlusCircle className="h-3.5 w-3.5 mr-1.5" />
              New Estimate
            </Button>
          </motion.div>
        </SectionCard>
      ) : (
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
                  <TableRow key={p.id} className={cn("border-border hover:bg-muted/50 cursor-pointer border-l-2", COMPLEXITY_BORDER[p.complexity as ComplexityLevel])}>
                    <TableCell className="text-xs font-mono text-muted-foreground py-2.5">{p.id}</TableCell>
                    <TableCell className="text-sm font-medium text-foreground py-2.5">{p.name}</TableCell>
                    <TableCell className="text-sm text-muted-foreground py-2.5">{p.customer}</TableCell>
                    <TableCell className="text-sm text-muted-foreground py-2.5">{p.machineType}</TableCell>
                    <TableCell className="text-xs text-muted-foreground py-2.5">{p.createdAt}</TableCell>
                    <TableCell className="text-xs text-muted-foreground py-2.5">{p.updatedAt}</TableCell>
                    <TableCell className="py-2.5"><ComplexityBadge level={p.complexity} /></TableCell>
                    <TableCell className="py-2.5">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={cn(
                            'inline-block h-2 w-2 rounded-full shrink-0',
                            p.status === 'Draft' && 'bg-amber-500',
                            p.status === 'In Review' && 'bg-blue-500',
                            p.status === 'Completed' && 'bg-emerald-500'
                          )}
                        />
                        <Select
                          value={p.status}
                          onValueChange={(value) => {
                            updateProject(p.id, { status: value as 'Draft' | 'In Review' | 'Completed' });
                            toast('Status updated', { description: `Project status changed to ${value}` });
                          }}
                        >
                          <SelectTrigger className="h-7 text-xs w-[120px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Draft">Draft</SelectItem>
                            <SelectItem value="In Review">In Review</SelectItem>
                            <SelectItem value="Completed">Completed</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </TableCell>
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
      )}
    </div>
  );
}
