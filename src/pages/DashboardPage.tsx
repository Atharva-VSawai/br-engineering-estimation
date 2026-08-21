'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FolderKanban, FileEdit, CheckCircle2, BarChart3, PlusCircle, Download, Info, Cpu, Radio, Bot, ChevronRight, Cable, Zap, Monitor, Shield, Clock, Package, Wrench, ScanSearch, Pencil, Plus, FileJson, Settings2, GripVertical } from 'lucide-react';
import { DndContext, closestCenter, DragOverlay, useSensor, useSensors, PointerSensor } from '@dnd-kit/core';
import { SortableContext, useSortable, arrayMove, rectSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
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

const recentActivity = [
  { time: '2 hours ago', action: 'Configuration updated', detail: 'Motion axes changed from 6 to 8', type: 'edit' },
  { time: '5 hours ago', action: 'Sample data loaded', detail: 'Automated Packaging Machine configuration', type: 'info' },
  { time: '1 day ago', action: 'New estimate created', detail: 'ACOPOStrak Transport System', type: 'create' },
  { time: '2 days ago', action: 'Estimate completed', detail: 'Bottle Inspection Machine \u2013 Medium complexity', type: 'complete' },
  { time: '3 days ago', action: 'Project exported', detail: 'Servo Press Machine configuration as JSON', type: 'export' },
];

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
  const { projects, config, setCurrentPage, loadSampleConfig, resetConfig, updateProjectInfo, updateMotion, updateRobotics, updateVision, updateHMI } = useAppStore();


  // Stat card drag-and-drop order
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
    } catch { /* noop */ }
  }, [statOrder]);

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
        {/* Welcome Banner */}
        <div className="relative overflow-hidden border border-border bg-gradient-to-r from-muted/80 via-muted/40 to-muted/20 p-5"
        >
          <Settings2 className="h-24 w-24 text-muted-foreground/[0.06] absolute right-6 top-1/2 -translate-y-1/2" />
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Cpu className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-foreground">B&R Engineering Estimation</h2>
                <p className="text-sm text-muted-foreground mt-0.5">Configure your automation project and generate effort estimates</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-background/80 border border-border px-2.5 py-1 text-sm font-medium text-muted-foreground">5 Projects</span>
              <span className="rounded-full bg-background/80 border border-border px-2.5 py-1 text-sm font-medium text-muted-foreground">3 Config Domains</span>
              <span className="rounded-full bg-background/80 border border-border px-2.5 py-1 text-sm font-medium text-muted-foreground">14 Wizard Steps</span>
            </div>
          </div>
        </div>
        {/* Bottom gradient shadow below welcome banner */}
        <div className="h-3 -mt-1.5 bg-gradient-to-b from-muted/30 to-transparent rounded-b-lg pointer-events-none" />

        {/* Header */}
        <div>
          <h1 className="text-lg font-bold text-foreground">Engineering Estimation Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Configure the B&R automation system and estimate engineering effort.
          </p>
        </div>

        {/* Stat Cards - Draggable */}
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

        {/* Quick Stats Row */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.3 }}
        >
          <SectionCard title="Quick Configuration Overview">
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
          </SectionCard>
        </motion.div>


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
              {/* Legend */}
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

        {/* Project Templates */}
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

        {/* Recent Projects Table */}
        <SectionCard title="Recent Projects" description="All B&R automation estimation projects">
          <div className="overflow-x-auto -mx-4 px-4">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-sm font-semibold text-muted-foreground h-9">Project</TableHead>
                  <TableHead className="text-sm font-semibold text-muted-foreground h-9">Customer</TableHead>
                  <TableHead className="text-sm font-semibold text-muted-foreground h-9">Machine Type</TableHead>
                  <TableHead className="text-sm font-semibold text-muted-foreground h-9">B&R Configuration</TableHead>
                  <TableHead className="text-sm font-semibold text-muted-foreground h-9">Complexity</TableHead>
                  <TableHead className="text-sm font-semibold text-muted-foreground h-9">Status</TableHead>
                  <TableHead className="text-sm font-semibold text-muted-foreground h-9">Last Updated</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projects.map((p) => (
                  <TableRow
                    key={p.id}
                    className={`border-border cursor-pointer transition-colors duration-100 hover:bg-primary/[0.03] active:bg-primary/[0.06] border-l-2 ${COMPLEXITY_LEFT_BORDER[p.complexity] || ''}`}
                    onClick={() => setCurrentPage('projects')}
                  >
                    <TableCell className="text-sm font-medium text-foreground py-2.5">{p.name}</TableCell>
                    <TableCell className="text-sm text-muted-foreground py-2.5">{p.customer}</TableCell>
                    <TableCell className="text-sm text-muted-foreground py-2.5">{p.machineType}</TableCell>
                    <TableCell className="text-sm text-muted-foreground py-2.5">{p.industry || p.machineType}</TableCell>
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

        {/* Prototype Information */}
        <SectionCard title={<span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-primary animate-pulse" />Prototype Information</span>}>
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Info className="h-4 w-4" />
            </div>
            <div className="text-sm text-muted-foreground leading-relaxed space-y-1">
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
    </div>
  );
}
