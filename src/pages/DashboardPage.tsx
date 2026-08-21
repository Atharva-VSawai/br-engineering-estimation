'use client';

import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { FolderKanban, FileEdit, CheckCircle2, BarChart3, PlusCircle, Download, Info, Cpu, Radio, Bot, ChevronRight, Cable, Zap, Monitor, Shield, Clock, Package, Wrench, ScanSearch, Pencil, Plus, FileJson, Settings2 } from 'lucide-react';
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

export function DashboardPage() {
  const { projects, config, setCurrentPage, loadSampleConfig, resetConfig, updateProjectInfo, updateMotion, updateRobotics, updateVision, updateHMI } = useAppStore();
  const [hourlyRate, setHourlyRate] = useState(85);
  const [contingency, setContingency] = useState(15);

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
    <div className="max-w-[1400px] mx-auto w-full">
      <motion.div
        className="space-y-6"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Welcome Banner */}
        <div className="relative overflow-hidden rounded-xl border border-primary/10 bg-gradient-to-r from-primary/[0.06] via-primary/[0.02] to-transparent p-4">
          <Settings2 className="h-20 w-20 text-primary/[0.06] absolute right-4 top-1/2 -translate-y-1/2" />
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
                <Cpu className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-foreground">Welcome to B&R Engineering Estimation</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Configure your automation project and generate effort estimates</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-muted px-2.5 py-1 text-[10px] font-medium text-muted-foreground">5 Projects</span>
              <span className="rounded-full bg-muted px-2.5 py-1 text-[10px] font-medium text-muted-foreground">3 Config Domains</span>
              <span className="rounded-full bg-muted px-2.5 py-1 text-[10px] font-medium text-muted-foreground">14 Wizard Steps</span>
            </div>
          </div>
        </div>

        {/* Header */}
        <div>
          <h1 className="text-lg font-bold text-foreground">Engineering Estimation Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Configure the B&R automation system and estimate engineering effort.
          </p>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="group-hover:shadow-md transition-shadow duration-300 group">
          <StatCard
            label="Active Projects"
            value={activeProjects}
            icon={<FolderKanban className="h-4 w-4" />}
            accentColor="bg-blue-400"
          />
          </div>
          <div className="group-hover:shadow-md transition-shadow duration-300 group">
          <StatCard
            label="Draft Estimates"
            value={draftEstimates}
            icon={<FileEdit className="h-4 w-4" />}
            accentColor="bg-amber-400"
          />
          </div>
          <div className="group-hover:shadow-md transition-shadow duration-300 group">
          <StatCard
            label="Completed Estimates"
            value={completedEstimates}
            icon={<CheckCircle2 className="h-4 w-4" />}
            accentColor="bg-emerald-400"
          />
          </div>
          <div className="group-hover:shadow-md transition-shadow duration-300 group">
          <div>
            <StatCard
              label="Avg. Project Complexity"
              value={avgComplexityLabel}
              icon={<BarChart3 className="h-4 w-4" />}
              accentColor="bg-orange-400"
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
        </div>

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
                            <span className="text-[11px] text-muted-foreground leading-tight">{stat.label}</span>
                            <span className={`text-sm font-bold leading-tight ${isZero ? 'text-muted-foreground' : 'text-foreground'}`}>
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

        {/* Cost Estimator */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.3 }}
        >
          <SectionCard title="Cost Estimator">
            {(() => {
              const hwHours = (config.io.digitalInputs + config.io.digitalOutputs + config.io.analogInputs + config.io.analogOutputs) * 0.5 + config.motion.totalAxes * 4;
              const swHours = config.hmi.screens * 8 + (config.vision.enabled ? config.vision.cameras * 16 : 0) + 40;
              const msHours = config.motion.totalAxes * 6 + (config.motion.electronicCamming ? 20 : 0) + (config.motion.coordinatedMotion ? 16 : 0) + (config.safety.enabled ? config.safety.safetyIOCount * 2 + 16 : 0);
              const intHours = (hwHours + swHours + msHours) * 0.3;
              const totalHours = hwHours + swHours + msHours + intHours;
              const subtotal = totalHours * hourlyRate;
              const contingencyAmount = subtotal * (contingency / 100);
              const grandTotal = subtotal + contingencyAmount;

              const fmt = (val: number) => val.toLocaleString('de-AT', { style: 'currency', currency: 'EUR' });

              const costCards = [
                { label: 'Hardware Engineering', hours: hwHours, color: 'border-l-blue-400' },
                { label: 'Software Development', hours: swHours, color: 'border-l-violet-400' },
                { label: 'Motion & Safety', hours: msHours, color: 'border-l-orange-400' },
                { label: 'Integration & Testing', hours: intHours, color: 'border-l-emerald-400' },
              ];

              return (
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2">
                      <label className="text-xs text-muted-foreground whitespace-nowrap">Hourly Rate (€)</label>
                      <input
                        type="number"
                        value={hourlyRate}
                        onChange={(e) => setHourlyRate(Number(e.target.value) || 0)}
                        className="h-8 text-sm rounded-md border border-border bg-transparent px-2 w-24"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="text-xs text-muted-foreground whitespace-nowrap">Contingency %</label>
                      <input
                        type="number"
                        value={contingency}
                        min={0}
                        max={50}
                        onChange={(e) => setContingency(Math.min(50, Math.max(0, Number(e.target.value) || 0)))}
                        className="h-8 text-sm rounded-md border border-border bg-transparent px-2 w-20"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {costCards.map((card) => (
                      <div
                        key={card.label}
                        className={`rounded-lg border border-border border-l-2 ${card.color} bg-card p-3`}
                      >
                        <div className="text-xs text-muted-foreground">{card.label}</div>
                        <div className="text-sm font-semibold text-foreground mt-1">{card.hours.toFixed(1)} hours</div>
                        <div className="text-sm font-bold text-foreground mt-0.5">{fmt(card.hours * hourlyRate)}</div>
                      </div>
                    ))}
                  </div>
                  <div className="rounded-lg border border-border bg-card p-3 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Total Hours</span>
                      <span className="font-semibold text-foreground">{totalHours.toFixed(1)} h</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="font-semibold text-foreground">{fmt(subtotal)}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Contingency ({contingency}%)</span>
                      <span className="font-semibold text-foreground">{fmt(contingencyAmount)}</span>
                    </div>
                    <div className="flex items-center justify-between border-t border-border pt-1.5">
                      <span className="text-sm font-semibold text-foreground">Grand Total</span>
                      <span className="text-lg font-bold text-primary">{fmt(grandTotal)}</span>
                    </div>
                  </div>
                </div>
              );
            })()}
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
              <span className="text-[11px] text-muted-foreground">Automated packaging with multi-station layout</span>
              <Button variant="outline" size="sm" className="text-xs mt-auto w-fit">Quick Start</Button>
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
              <span className="text-[11px] text-muted-foreground">Robot-assisted assembly with vision</span>
              <Button variant="outline" size="sm" className="text-xs mt-auto w-fit">Quick Start</Button>
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
              <span className="text-[11px] text-muted-foreground">Quality inspection with camera systems</span>
              <Button variant="outline" size="sm" className="text-xs mt-auto w-fit">Quick Start</Button>
            </div>
          </div>
        </SectionCard>

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
                <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${ACTIVITY_AVATAR_CONFIG[item.type]?.bgLight} ${ACTIVITY_AVATAR_CONFIG[item.type]?.bgDark}`}>
                  {(() => {
                    const avatarCfg = ACTIVITY_AVATAR_CONFIG[item.type];
                    const AvatarIcon = avatarCfg?.icon;
                    return AvatarIcon ? <AvatarIcon className={`h-3 w-3 ${avatarCfg.iconColor}`} /> : null;
                  })()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-foreground">{item.action}</div>
                  <div className="text-[11px] text-muted-foreground truncate">{item.detail}</div>
                </div>
                <span className="text-[11px] font-medium text-muted-foreground ml-auto shrink-0 whitespace-nowrap">{item.time}</span>
              </motion.div>
            ))}
            <div className="group pt-2">
              <button className="flex items-center gap-0.5 text-primary text-[11px] font-medium group-hover:underline">
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
    </div>
  );
}
