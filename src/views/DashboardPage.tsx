'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FolderKanban, FileEdit, CheckCircle2, BarChart3, PlusCircle, Download, Info, Cpu, Radio, Bot, ChevronRight, Cable, Zap, Monitor, Shield, Clock, Package, Wrench, ScanSearch, Pencil, Plus, FileJson, Settings2, GripVertical, Eye, FileText, Table2, Loader2 } from 'lucide-react';
import { DndContext, closestCenter, DragOverlay, useSensor, useSensors, PointerSensor } from '@dnd-kit/core';
import { SortableContext, useSortable, arrayMove, rectSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { StatCard } from '@/components/br/StatCard';
import { SectionCard } from '@/components/br/SectionCard';
import { StatusBadge, ComplexityBadge } from '@/components/br/ComplexityBadge';
import { useAppStore } from '@/store';
import { toast } from 'sonner';
import type { ComplexityLevel } from '@/types';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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

const COMPLEXITY_LEFT_BORDER: Record<ComplexityLevel, string> = {
  Low: 'border-l-emerald-400',
  Medium: 'border-l-amber-400',
  High: 'border-l-orange-400',
  'Very High': 'border-l-red-400',
};

const ACTIVITY_AVATAR_CONFIG: Record<string, { icon: React.ElementType; iconColor: string; bgLight: string; bgDark: string }> = {
  edit: { icon: Pencil, iconColor: 'text-blue-400', bgLight: 'bg-blue-50', bgDark: 'dark:bg-blue-950/40' },
  info: { icon: Info, iconColor: 'text-amber-400', bgLight: 'bg-amber-50', bgDark: 'dark:bg-amber-950/40' },
  create: { icon: Plus, iconColor: 'text-emerald-400', bgLight: 'bg-emerald-50', bgDark: 'dark:bg-emerald-950/40' },
  complete: { icon: CheckCircle2, iconColor: 'text-emerald-500', bgLight: 'bg-emerald-50', bgDark: 'dark:bg-emerald-950/40' },
  export: { icon: FileJson, iconColor: 'text-purple-400', bgLight: 'bg-purple-50', bgDark: 'dark:bg-purple-950/40' },
};

const ACTIVITY_BORDER_COLORS: Record<string, string> = {
  edit: 'border-l-blue-400',
  info: 'border-l-amber-400',
  create: 'border-l-emerald-400',
  complete: 'border-l-emerald-500',
  export: 'border-l-purple-400',
};

function SortableStatCardWrapper({ id, children, onDragStart }: { id: string; children: React.ReactNode; onDragStart: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };
  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      layout
      className="group-hover:shadow-md transition-shadow duration-300 group relative"
    >
      <div
        {...attributes}
        {...listeners}
        onClick={(e) => e.stopPropagation()}
        onPointerDown={onDragStart}
        className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing"
      >
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </div>
      {children}
    </motion.div>
  );
}

export function DashboardPage() {
  const { projects, config, activeProjectId, setCurrentPage, setWizardStep, loadSampleConfig, loadSampleProjects, resetConfig, openProject, updateConfig, updateProject, updateProjectInfo, updateMotion, updateRobotics, updateVision, updateHMI } = useAppStore();

  const recentActivity = projects.slice(0, 5).map((p) => ({
    time: p.updatedAt,
    action: p.status === 'Completed' ? 'Estimate completed' : p.status === 'In Review' ? 'Estimate in review' : 'Estimate in progress',
    detail: `${p.name} \u2013 ${p.complexity} complexity${p.machineType ? ` \u00b7 ${p.machineType}` : ''}`,
    type: (p.status === 'Completed' ? 'complete' : 'edit') as 'complete' | 'edit' | 'info' | 'create' | 'export',
  }));


  useEffect(() => {
    if (projects.length === 0) loadSampleProjects();
  }, []);


  const [selectedProjectId, setSelectedProjectId] = useState<string>('all');


  const selectedProject = useMemo(
    () => (selectedProjectId === 'all' ? null : projects.find((p) => p.id === selectedProjectId) ?? null),
    [selectedProjectId, projects]
  );


  const handleProjectSelect = (value: string) => {
    setSelectedProjectId(value);
    if (value === 'all') {

      resetConfig();
      return;
    }
    const project = projects.find((p) => p.id === value);
    if (project?.config) {

      const clonedConfig = JSON.parse(JSON.stringify(project.config));
      updateConfig(clonedConfig);
    }
  };


  const [statOrder, setStatOrder] = useState<number[]>(() => {
    if (typeof window === 'undefined') return [0, 1, 2, 3];
    try {
      const saved = localStorage.getItem('br-dashboard-order');
      return saved ? JSON.parse(saved) : [0, 1, 2, 3];
    } catch {
      return [0, 1, 2, 3];
    }
  });
  const [activeStatId, setActiveStatId] = useState<number | null>(null);
  const statSensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  useEffect(() => {
    try {
      localStorage.setItem('br-dashboard-order', JSON.stringify(statOrder));
    } catch {  }
  }, [statOrder]);

  const activeProjects = projects.filter((p) => p.status !== 'Completed').length;
  const draftEstimates = projects.filter((p) => p.status === 'Draft').length;
  const completedEstimates = projects.filter((p) => p.status === 'Completed').length;


  const complexityDist = useMemo(() => {
    const dist: Record<ComplexityLevel, number> = { Low: 0, Medium: 0, High: 0, 'Very High': 0 };
    projects.forEach((p) => {
      dist[p.complexity]++;
    });
    return dist;
  }, [projects]);

  const totalProjects = projects.length;


  const avgComplexityLabel = useMemo(() => {
    if (totalProjects === 0) return 'N/A';
    const scoreMap: Record<ComplexityLevel, number> = { Low: 1, Medium: 2, High: 3, 'Very High': 4 };
    const avg = projects.reduce((sum, p) => sum + scoreMap[p.complexity], 0) / totalProjects;
    if (avg <= 1.5) return 'Low';
    if (avg <= 2.5) return 'Medium';
    if (avg <= 3.5) return 'High';
    return 'Very High';
  }, [projects, totalProjects]) as ComplexityLevel | 'N/A';

  const statCardsData = [
    { id: 'stat-0', label: 'Active Projects', value: activeProjects, icon: <FolderKanban className="h-4 w-4" />, accentColor: 'bg-blue-400' },
    { id: 'stat-1', label: 'Draft Estimates', value: draftEstimates, icon: <FileEdit className="h-4 w-4" />, accentColor: 'bg-amber-400' },
    { id: 'stat-2', label: 'Completed Estimates', value: completedEstimates, icon: <CheckCircle2 className="h-4 w-4" />, accentColor: 'bg-emerald-400' },
    { id: 'stat-3', label: 'Avg. Project Complexity', value: avgComplexityLabel, icon: <BarChart3 className="h-4 w-4" />, accentColor: 'bg-orange-400' },
  ];

  const handleStatDragEnd = (event: { active: { id: string | number }; over: { id: string | number } | null }) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setStatOrder((prev) => {
      const oldIndex = prev.indexOf(Number(active.id));
      const newIndex = prev.indexOf(Number(over.id));
      return arrayMove(prev, oldIndex, newIndex);
    });
    setActiveStatId(null);
  };

  const activeStatCard = activeStatId !== null ? statCardsData[activeStatId] : null;

  return (
    <div className="max-w-[1400px] mx-auto w-full">
      <motion.div
        className="space-y-6"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="relative overflow-hidden border border-border/80 rounded-xl bg-gradient-to-r from-primary/[0.07] via-primary/[0.03] to-transparent p-6">
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, oklch(0.55 0.2 35) 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
          <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-gradient-to-br from-primary/10 to-transparent blur-2xl" />
          <div className="absolute -right-6 bottom-0 h-24 w-24 rounded-full bg-gradient-to-tl from-primary/5 to-transparent blur-xl" />
          <Settings2 className="h-28 w-28 text-primary/[0.05] absolute right-8 top-1/2 -translate-y-1/2" />
          <div className="relative flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 text-primary shadow-sm ring-1 ring-primary/10">
                <Cpu className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-foreground tracking-tight">B&amp;R Engineering Estimation</h2>
                <p className="text-sm text-muted-foreground mt-0.5">Configure your automation project and generate effort estimates</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-background/90 border border-border/60 px-3 py-1.5 text-sm font-medium text-muted-foreground backdrop-blur-sm shadow-sm">{totalProjects} Projects</span>
              <span className="rounded-full bg-background/90 border border-border/60 px-3 py-1.5 text-sm font-medium text-muted-foreground backdrop-blur-sm shadow-sm">{activeProjects} Active</span>
              <span className="rounded-full bg-background/90 border border-border/60 px-3 py-1.5 text-sm font-medium text-muted-foreground backdrop-blur-sm shadow-sm">{completedEstimates} Completed</span>
            </div>
          </div>
        </div>
        <div className="h-3 -mt-1.5 bg-gradient-to-b from-muted/30 to-transparent rounded-b-lg pointer-events-none" />
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05, duration: 0.25 }}
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="flex items-center gap-2.5 shrink-0">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                <FolderKanban className="h-4 w-4 text-primary" />
              </div>
              <span className="text-sm font-semibold text-foreground">Project Scope</span>
            </div>
            <Select value={selectedProjectId} onValueChange={handleProjectSelect}>
              <SelectTrigger className="w-full sm:w-[320px] h-9 font-medium border-border/80">
                <SelectValue placeholder="Select a project…" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  <span className="flex items-center gap-2">
                    <BarChart3 className="h-3.5 w-3.5 text-muted-foreground" />
                    All Projects (Aggregate View)
                  </span>
                </SelectItem>
                {projects.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    <span className="flex items-center gap-2">
                      <span className={`h-2 w-2 rounded-sm shrink-0 ${COMPLEXITY_COLORS[p.complexity]}`} />
                      <span className="truncate">{p.name}</span>
                      <span className="text-muted-foreground ml-auto text-xs shrink-0">{p.customer}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedProject && (
              <div className="flex items-center gap-3 text-sm animate-in fade-in-0 slide-in-from-bottom-1 duration-200">
                <div className="flex items-center gap-1.5">
                  <span className="text-muted-foreground">Customer:</span>
                  <span className="font-medium text-foreground">{selectedProject.customer}</span>
                </div>
                <span className="h-4 w-px bg-border" />
                <div className="flex items-center gap-1.5">
                  <span className="text-muted-foreground">Machine:</span>
                  <span className="font-medium text-foreground">{selectedProject.machineType}</span>
                </div>
                <span className="h-4 w-px bg-border" />
                <div className="flex items-center gap-1.5">
                  <span className="text-muted-foreground">Status:</span>
                  <StatusBadge status={selectedProject.status} />
                </div>
              </div>
            )}
          </div>
        </motion.div>
        <div>
          <h1 className="text-lg font-bold text-foreground">Engineering Estimation Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Configure the B&R automation system and estimate engineering effort.
          </p>
        </div>
        <DndContext sensors={statSensors} collisionDetection={closestCenter} onDragEnd={handleStatDragEnd}>
          <SortableContext items={statOrder.map((i) => String(i))} strategy={rectSortingStrategy}>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <AnimatePresence mode="popLayout">
                {statOrder.map((idx) => {
                  const card = statCardsData[idx];
                  return (
                    <SortableStatCardWrapper
                      key={card.id}
                      id={card.id}
                      onDragStart={() => setActiveStatId(idx)}
                    >
                      {card.label === 'Avg. Project Complexity' ? (
                        <div>
                          <StatCard
                            label={card.label}
                            value={card.value}
                            icon={card.icon}
                            accentColor={card.accentColor}
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
                      ) : (
                        <StatCard
                          label={card.label}
                          value={card.value}
                          icon={card.icon}
                          accentColor={card.accentColor}
                        />
                      )}
                    </SortableStatCardWrapper>
                  );
                })}
              </AnimatePresence>
            </div>
          </SortableContext>
          <DragOverlay>
            {activeStatCard ? (
              <div className="scale-105 shadow-xl opacity-90">
                <StatCard
                  label={activeStatCard.label}
                  value={activeStatCard.value}
                  icon={activeStatCard.icon}
                  accentColor={activeStatCard.accentColor}
                />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.3 }}
        >
          <SectionCard title={selectedProject ? `Configuration: ${selectedProject.name}` : 'Quick Configuration Overview'} description={selectedProject ? `${selectedProject.customer} · ${selectedProject.machineType}` : 'Current working configuration snapshot'}>
            {!activeProjectId && !selectedProject ? (
              <div className="flex items-center justify-center h-24 text-sm text-muted-foreground">
                Select a project from the table below or create a new estimate
              </div>
            ) : (
            <div className="flex flex-wrap gap-3 justify-center sm:justify-start">
              {(() => {
                const totalIO =
                  config.io.digitalInputs + config.io.digitalOutputs +
                  config.io.analogInputs + config.io.analogOutputs +
                  config.io.safetyIO + config.io.encoderCounterModules +
                  config.io.temperatureModules + config.io.communicationIO +
                  config.io.specialModules;
                const estHours = totalIO * 0.5 + config.motion.totalAxes * 6 + config.hmi.screens * 8 + 40;
                const enabledProtocolCount = config.communication.protocols.filter(p => p.enabled).length;
                const robotCount = config.robotics.enabled ? String(config.robotics.quantity) : '0';
                const quickStats = [
                  { icon: Cable, label: 'Total I/O Points', value: String(totalIO), accent: 'border-l-blue-400', iconBg: 'text-blue-400' },
                  { icon: Zap, label: 'Motion Axes', value: String(config.motion.totalAxes), accent: 'border-l-amber-400', iconBg: 'text-amber-400' },
                  { icon: Monitor, label: 'HMI Screens', value: String(config.hmi.screens), accent: 'border-l-cyan-400', iconBg: 'text-cyan-400' },
                  { icon: Shield, label: 'Safety I/O', value: String(config.safety.safetyIOCount), accent: 'border-l-emerald-400', iconBg: 'text-emerald-400' },
                  { icon: Clock, label: 'Est. Hours', value: estHours.toFixed(1), accent: 'border-l-primary', iconBg: 'text-primary' },
                  { icon: Cpu, label: 'Controller', value: config.controller.family, accent: 'border-l-violet-400', iconBg: 'text-violet-400' },
                  { icon: Radio, label: 'Protocols', value: String(enabledProtocolCount), accent: 'border-l-teal-400', iconBg: 'text-teal-400' },
                  { icon: Bot, label: 'Robots', value: robotCount, accent: 'border-l-rose-400', iconBg: 'text-rose-400' },
                ];
                return (
                  <>
                    {quickStats.map((stat) => {
                      const isZero = stat.value === '0';
                      return (
                        <div
                          key={stat.label}
                          className={`flex items-center gap-3 bg-muted/30 rounded-lg p-3 border-l-2 ${stat.accent}`}
                        >
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-muted">
                            <stat.icon className={`h-3.5 w-3.5 ${stat.iconBg}`} />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm text-muted-foreground leading-tight">{stat.label}</span>
                            <span className={`text-sm font-bold leading-tight tabular-nums ${isZero ? 'text-muted-foreground' : 'text-foreground'}`}>
                              {stat.value}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </>
                );
              })()}
            </div>
            )}
          </SectionCard>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          <SectionCard title="Complexity Distribution" description="Projects by complexity level">
            <div className="space-y-3">
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
                        className={`${COMPLEXITY_COLORS[level]} flex items-center justify-center text-white text-sm font-semibold transition-all duration-300`}
                        style={{ width: `${(count / totalProjects) * 100}%`, minWidth: count > 0 ? '2rem' : 0 }}
                        title={`${level}: ${count} project${count !== 1 ? 's' : ''}`}
                      >
                        {count}
                      </div>
                    );
                  })
                )}
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1.5">
                {ALL_LEVELS.map((level) => (
                  <div key={level} className="flex items-center gap-1.5">
                    <span className={`h-2.5 w-2.5 rounded-sm ${COMPLEXITY_COLORS[level]}`} />
                    <span className={`text-sm font-medium ${COMPLEXITY_TEXT_COLORS[level]}`}>
                      {level}{complexityDist[level] > 0 ? ` (${complexityDist[level]})` : ''}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </SectionCard>
        </div>
        <SectionCard title="Project Templates" description="Start from a pre-configured template">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div
              className="flex flex-col gap-2.5 rounded-lg p-3 text-left hover:bg-muted/50 hover:ring-1 hover:ring-primary/20 transition-all duration-200 cursor-pointer"
              onClick={() => {
                resetConfig();
                loadSampleConfig();
                setCurrentPage('new-estimate');
              }}
            >
              <div className="bg-muted/50 rounded-lg p-2.5 w-fit">
                <Package className="h-5 w-5 text-primary" />
              </div>
              <span className="text-sm font-semibold text-foreground">Packaging Line</span>
              <span className="text-sm text-muted-foreground">Automated packaging with multi-station layout</span>
              <Button variant="outline" size="sm" className="text-sm mt-auto w-fit">Quick Start</Button>
            </div>
            <div
              className="flex flex-col gap-2.5 rounded-lg p-3 text-left hover:bg-muted/50 hover:ring-1 hover:ring-primary/20 transition-all duration-200 cursor-pointer"
              onClick={() => {
                resetConfig();
                updateProjectInfo({ name: 'Assembly Cell', machineType: 'Assembly' });
                updateMotion({ totalAxes: 12 });
                updateRobotics({ enabled: true });
                updateVision({ enabled: true });
                setCurrentPage('new-estimate');
              }}
            >
              <div className="bg-muted/50 rounded-lg p-2.5 w-fit">
                <Wrench className="h-5 w-5 text-primary" />
              </div>
              <span className="text-sm font-semibold text-foreground">Assembly Cell</span>
              <span className="text-sm text-muted-foreground">Robot-assisted assembly with vision</span>
              <Button variant="outline" size="sm" className="text-sm mt-auto w-fit">Quick Start</Button>
            </div>
            <div
              className="flex flex-col gap-2.5 rounded-lg p-3 text-left hover:bg-muted/50 hover:ring-1 hover:ring-primary/20 transition-all duration-200 cursor-pointer"
              onClick={() => {
                resetConfig();
                updateProjectInfo({ name: 'Inspection System', machineType: 'Inspection' });
                updateVision({ enabled: true, cameras: 4 });
                updateHMI({ screens: 3 });
                setCurrentPage('new-estimate');
              }}
            >
              <div className="bg-muted/50 rounded-lg p-2.5 w-fit">
                <ScanSearch className="h-5 w-5 text-primary" />
              </div>
              <span className="text-sm font-semibold text-foreground">Inspection System</span>
              <span className="text-sm text-muted-foreground">Quality inspection with camera systems</span>
              <Button variant="outline" size="sm" className="text-sm mt-auto w-fit">Quick Start</Button>
            </div>
          </div>
        </SectionCard>
        <SectionCard title="Recent Projects" description="All B&R automation estimation projects">
          <div className="overflow-x-auto -mx-4 px-4">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-sm font-semibold text-muted-foreground h-9">Project</TableHead>
                  <TableHead className="text-sm font-semibold text-muted-foreground h-9">Customer</TableHead>
                  <TableHead className="text-sm font-semibold text-muted-foreground h-9">Machine Type</TableHead>
                  <TableHead className="text-sm font-semibold text-muted-foreground h-9 hidden lg:table-cell">B&R Configuration</TableHead>
                  <TableHead className="text-sm font-semibold text-muted-foreground h-9 hidden sm:table-cell">Complexity</TableHead>
                  <TableHead className="text-sm font-semibold text-muted-foreground h-9 hidden md:table-cell">Status</TableHead>
                  <TableHead className="text-sm font-semibold text-muted-foreground h-9 hidden xl:table-cell">Last Updated</TableHead>
                  <TableHead className="text-sm font-semibold text-muted-foreground h-9 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projects.map((p) => (
                  <TableRow
                    key={p.id}
                    className={`border-border transition-colors duration-100 hover:bg-primary/[0.03] border-l-2 ${COMPLEXITY_LEFT_BORDER[p.complexity] || ''}`}
                  >
                    <TableCell className="text-sm font-medium text-foreground py-2.5">{p.name}</TableCell>
                    <TableCell className="text-sm text-muted-foreground py-2.5">{p.customer}</TableCell>
                    <TableCell className="text-sm text-muted-foreground py-2.5">{p.machineType}</TableCell>
                    <TableCell className="text-sm text-muted-foreground py-2.5 hidden lg:table-cell">{p.industry || p.machineType}</TableCell>
                    <TableCell className="py-2.5 hidden sm:table-cell">
                      <ComplexityBadge level={p.complexity} />
                    </TableCell>
                    <TableCell className="py-2.5 hidden md:table-cell">
                      <StatusBadge status={p.status} />
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground py-2.5 hidden xl:table-cell">{p.updatedAt}</TableCell>
                    <TableCell className="py-2.5">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                          title="View Estimate Report"
                          onClick={(e) => { e.stopPropagation(); openProject(p.id); setCurrentPage('estimate-summary'); }}
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                          title="Edit Configuration"
                          onClick={(e) => { e.stopPropagation(); openProject(p.id); setWizardStep(13); setCurrentPage('new-estimate'); }}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                          title="Export PDF"
                          onClick={async (e) => { e.stopPropagation(); if (!p.config) { toast.error('No configuration', { description: 'This project has no saved configuration.' }); return; } try { const r = await fetch(`/api/export/pdf?projectId=${encodeURIComponent(p.id)}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(p.config) }); if (!r.ok) throw new Error(); const b = await r.blob(); const u = URL.createObjectURL(b); const a = document.createElement('a'); a.href = u; a.download = `br-estimate-${p.name.replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase()}.pdf`; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(u); toast.success('PDF exported'); } catch { toast.error('PDF export failed'); } }}
                        >
                          <FileText className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                          title="Export Excel"
                          onClick={async (e) => { e.stopPropagation(); if (!p.config) { toast.error('No configuration', { description: 'This project has no saved configuration.' }); return; } try { const r = await fetch('/api/export/excel', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(p.config) }); if (!r.ok) throw new Error(); const b = await r.blob(); const u = URL.createObjectURL(b); const a = document.createElement('a'); a.href = u; a.download = `br-estimate-${p.name.replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase()}.xlsx`; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(u); toast.success('Excel exported'); } catch { toast.error('Excel export failed'); } }}
                        >
                          <Table2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </SectionCard>
        <SectionCard title="Recent Activity" description="Latest actions and events">
          <div>
            {recentActivity.map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -4 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05, duration: 0.3 }}
                className={`flex items-start gap-2.5 py-1.5 border-l-2 pl-3 ${ACTIVITY_BORDER_COLORS[item.type] || 'border-l-gray-400'} ${idx < recentActivity.length - 1 ? 'border-b border-border/50' : ''}`}
              >
                <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${ACTIVITY_AVATAR_CONFIG[item.type]?.bgLight} ${ACTIVITY_AVATAR_CONFIG[item.type]?.bgDark} relative`}>
                  {(() => {
                    const avatarCfg = ACTIVITY_AVATAR_CONFIG[item.type];
                    const AvatarIcon = avatarCfg?.icon;
                    return AvatarIcon ? <AvatarIcon className={`h-3 w-3 ${avatarCfg.iconColor}`} /> : null;
                  })()}
                  <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full ring-2 ring-card" style={{ backgroundColor: item.type === 'edit' ? 'rgb(96,165,250)' : item.type === 'info' ? 'rgb(251,191,36)' : item.type === 'create' ? 'rgb(52,211,153)' : item.type === 'complete' ? 'rgb(16,185,129)' : 'rgb(168,85,247)' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-foreground">{item.action}</div>
                  <div className="text-sm text-muted-foreground truncate">{item.detail}</div>
                </div>
                <span className="text-sm font-medium text-muted-foreground ml-auto shrink-0 whitespace-nowrap">{item.time}</span>
              </motion.div>
            ))}
            <div className="group pt-2">
              <button className="flex items-center gap-0.5 text-primary text-sm font-medium group-hover:underline">
                View All
                <ChevronRight className="h-3 w-3" />
              </button>
            </div>
          </div>
        </SectionCard>


      </motion.div>
    </div>
  );
}
