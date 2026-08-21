'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowRight, Check, Minus, Clock, FileText, Share2, Wrench, Save, Pencil, Zap, Cpu, Bot, Eye, ShieldCheck, Radio, FlaskConical, Rocket, Settings2, Table2, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Button } from '@/components/ui/button';
import { SectionCard } from '@/components/br/SectionCard';
import { StatusBadge } from '@/components/br/ComplexityBadge';
import { useAppStore } from '@/store';
import { EFFORT_AREAS } from '@/data';
import { toast } from 'sonner';
import { calculateEngineeringEffort } from '@/lib/effort-calculation';
import type { ComplexityLevel, ProjectConfig, Project } from '@/types';

const COMPLEXITY_COLORS: Record<ComplexityLevel, string> = {
  Low: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
  Medium: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
  High: 'bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800',
  'Very High': 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800',
};

const COMPLEXITY_DOT_COLORS: Record<ComplexityLevel, string> = {
  Low: 'bg-emerald-500',
  Medium: 'bg-amber-500',
  High: 'bg-orange-500',
  'Very High': 'bg-red-500',
};

const COMPLEXITY_BAR_COLORS: Record<ComplexityLevel, string> = {
  Low: 'bg-emerald-400',
  Medium: 'bg-amber-400',
  High: 'bg-orange-400',
  'Very High': 'bg-red-400',
};

const COMPLEXITY_TEXT_COLORS: Record<ComplexityLevel, string> = {
  Low: 'text-emerald-600',
  Medium: 'text-amber-600',
  High: 'text-orange-600',
  'Very High': 'text-red-600',
};

const COMPLEXITY_WIDTH: Record<ComplexityLevel, string> = {
  Low: '25%',
  Medium: '50%',
  High: '75%',
  'Very High': '100%',
};

const COMPLEXITY_DIMENSIONS: { key: keyof ProjectConfig['complexity']; label: string }[] = [
  { key: 'hardware', label: 'Hardware' },
  { key: 'motion', label: 'Motion' },
  { key: 'hmi', label: 'HMI' },
  { key: 'vision', label: 'Vision' },
  { key: 'safety', label: 'Safety' },
  { key: 'communication', label: 'Communication' },
  { key: 'software', label: 'Software' },
  { key: 'integration', label: 'Integration' },
  { key: 'requirement', label: 'Requirement' },
  { key: 'testing', label: 'Testing' },
];

const EFFORT_BAR_COLORS: Record<string, string> = {
  Hardware: 'bg-blue-400',
  'PLC/Software': 'bg-violet-400',
  Motion: 'bg-orange-400',
  Vision: 'bg-cyan-400',
  Safety: 'bg-red-400',
  'Comm/Integration': 'bg-emerald-400',
  Testing: 'bg-amber-400',
  Commissioning: 'bg-indigo-400',
};

const EFFORT_ICONS: Record<string, React.ElementType> = {
  Hardware: Wrench,
  'PLC/Software': Pencil,
  Motion: Zap,
  Vision: Eye,
  Safety: ShieldCheck,
  'Comm/Integration': Radio,
  Testing: FlaskConical,
  Commissioning: Rocket,
};

interface SectionCheck {
  label: string;
  configured: boolean;
}

function checkCompleteness(config: ProjectConfig): SectionCheck[] {
  const ioTotal = config.io.digitalInputs + config.io.digitalOutputs + config.io.analogInputs + config.io.analogOutputs + config.io.safetyIO + config.io.encoderCounterModules + config.io.temperatureModules + config.io.communicationIO + config.io.specialModules;
  const motionFeatures = [config.motion.homingRequired, config.motion.positioning, config.motion.velocityControl, config.motion.torqueControl, config.motion.synchronization, config.motion.masterSlave, config.motion.electronicGearing, config.motion.electronicCamming, config.motion.coordinatedMotion, config.motion.interpolation, config.motion.complexMotionProfiles, config.motion.axisDiagnostics].filter(Boolean).length;
  const hmiFeatures = [config.hmi.alarmManagement, config.hmi.recipeManagement, config.hmi.trendVisualization, config.hmi.userManagement, config.hmi.machineDiagnostics, config.hmi.manualMode, config.hmi.automaticMode, config.hmi.maintenanceScreens, config.hmi.parameterManagement].filter(Boolean).length;
  const commActive = config.communication.protocols.some((p) => p.enabled);
  const commIntegrations = [config.communication.plcToPlc, config.communication.mesIntegration, config.communication.scadaIntegration, config.communication.cloudIIoTIntegration].filter(Boolean).length;
  const iiotFeatures = [config.iiot.ipcRequired, config.iiot.iiotRequired, config.iiot.iiotConnector, config.iiot.iiotServices, config.iiot.iiotEdgeDevice, config.iiot.cloudConnectivity, config.iiot.machineDataCollection, config.iiot.remoteMaintenance, config.iiot.opcUa, config.iiot.dataLogging, config.iiot.analyticsIntegration].filter(Boolean).length;
  return [
    { label: 'Project', configured: !!(config.project.name && config.project.name.trim()) },
    { label: 'Controller', configured: config.controller.quantity > 1 || config.controller.performance !== 'Standard' || !!config.controller.communicationInterfaces },
    { label: 'I/O', configured: ioTotal > 0 },
    { label: 'Motion', configured: config.motion.totalAxes > 0 || motionFeatures > 0 },
    { label: 'HMI', configured: config.hmi.screens > 0 || hmiFeatures > 0 },
    { label: 'Vision', configured: config.vision.enabled },
    { label: 'Safety', configured: config.safety.enabled },
    { label: 'Communication', configured: commActive || commIntegrations > 0 },
    { label: 'Mechatronics', configured: config.mechatronics.type !== 'None' && config.mechatronics.type !== '' },
    { label: 'Robotics', configured: config.robotics.enabled },
    { label: 'IIoT', configured: iiotFeatures > 0 },
  ];
}

function getEffortDrivers(c: ProjectConfig): string[] {
  const drivers: string[] = [];
  if (c.motion.totalAxes > 0) drivers.push(`${c.motion.totalAxes} motion axes`);
  if (c.motion.electronicCamming) drivers.push('Electronic camming');
  if (c.motion.coordinatedMotion) drivers.push('Coordinated motion');
  if (c.motion.interpolation) drivers.push('Multi-axis interpolation');
  if (c.motion.complexMotionProfiles) drivers.push('Complex motion profiles');
  if (c.mechatronics.type !== 'None') drivers.push(`${c.mechatronics.type} mechatronics`);
  if (c.robotics.enabled) drivers.push(`${c.robotics.quantity} robot(s)`);
  if (c.vision.enabled) drivers.push(`${c.vision.cameras} camera(s)`);
  if (c.safety.enabled) drivers.push(`Safety system (${c.safety.safetyIOCount} I/O)`);
  if (c.hmi.screens > 0) drivers.push(`${c.hmi.screens} HMI screen(s)`);
  const enabledProtocols = c.communication.protocols.filter((p) => p.enabled);
  if (enabledProtocols.length > 0) drivers.push(`${enabledProtocols.length} communication protocol(s)`);
  if (c.communication.mesIntegration) drivers.push('MES integration');
  if (c.communication.scadaIntegration) drivers.push('SCADA integration');
  if (c.iiot.ipcRequired) drivers.push(`IPC (${c.iiot.ipcModel})`);
  if (c.iiot.cloudConnectivity) drivers.push('Cloud/IIoT connectivity');
  const totalIO = c.io.digitalInputs + c.io.digitalOutputs + c.io.analogInputs + c.io.analogOutputs;
  if (totalIO > 100) drivers.push(`${totalIO} I/O points`);
  if (c.project.machineStations > 1) drivers.push(`${c.project.machineStations} machine stations`);
  if (c.project.projectVariants > 1) drivers.push(`${c.project.projectVariants} product variants`);
  return drivers;
}

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload || payload.length === 0) return null;
  const d = payload[0];
  return (
    <div className="rounded-lg border border-border bg-background px-3 py-2 shadow-md text-sm">
      <div className="flex items-center gap-2 mb-1">
        <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: d.payload.color }} />
        <span className="font-medium text-foreground">{d.name}</span>
      </div>
      <div className="text-muted-foreground tabular-nums">{d.value.toFixed(1)} hours</div>
    </div>
  );
};

export function EstimateSummaryPage() {
  const { config: c, activeProjectId, projects, setCurrentPage, setWizardStep, addProject } = useAppStore();
  const currentProject = activeProjectId ? projects.find((p) => p.id === activeProjectId) : null;

  const { effort, timeline, overallComplexity, highCount } = useMemo(
    () => calculateEngineeringEffort(c),
    [c],
  );

  const areaComplexities: Record<string, ComplexityLevel> = {
    Motion: c.complexity.motion,
    HMI: c.complexity.hmi,
    'I/O': c.io.digitalInputs + c.io.digitalOutputs > 200 ? 'High' : 'Medium',
    Vision: c.vision.enabled ? c.complexity.vision : 'Low',
    Safety: c.safety.enabled ? c.complexity.safety : 'Low',
    Communication: c.complexity.communication,
    Software: c.complexity.software,
    Integration: c.complexity.integration,
    Testing: c.complexity.testing,
    Commissioning: c.complexity.testing,
  };

  const completeness = checkCompleteness(c);
  const configuredCount = completeness.filter((s) => s.configured).length;
  const drivers = useMemo(() => getEffortDrivers(c), [c]);

  // Donut chart data
  const effortChartData = [
    { name: 'Hardware', value: effort.hardwareHours, color: '#3b82f6' },
    { name: 'PLC/Software', value: effort.plcSoftwareHours, color: '#8b5cf6' },
    { name: 'Motion', value: effort.motionHours, color: '#f97316' },
    { name: 'Vision', value: effort.visionHours, color: '#06b6d4' },
    { name: 'Safety', value: effort.safetyHours, color: '#ef4444' },
    { name: 'Comm/Integration', value: effort.communicationIntegrationHours, color: '#10b981' },
    { name: 'Testing', value: effort.testingHours, color: '#f59e0b' },
    { name: 'Commissioning', value: effort.commissioningHours, color: '#6366f1' },
  ];
  const chartData = effortChartData.filter((d) => d.value > 0);

  const effortRows = [
    { name: 'Hardware', hours: effort.hardwareHours, color: EFFORT_BAR_COLORS['Hardware'], icon: EFFORT_ICONS['Hardware'] },
    { name: 'PLC/Software', hours: effort.plcSoftwareHours, color: EFFORT_BAR_COLORS['PLC/Software'], icon: EFFORT_ICONS['PLC/Software'] },
    { name: 'Motion', hours: effort.motionHours, color: EFFORT_BAR_COLORS['Motion'], icon: EFFORT_ICONS['Motion'] },
    { name: 'Vision', hours: effort.visionHours, color: EFFORT_BAR_COLORS['Vision'], icon: EFFORT_ICONS['Vision'] },
    { name: 'Safety', hours: effort.safetyHours, color: EFFORT_BAR_COLORS['Safety'], icon: EFFORT_ICONS['Safety'] },
    { name: 'Comm/Integration', hours: effort.communicationIntegrationHours, color: EFFORT_BAR_COLORS['Comm/Integration'], icon: EFFORT_ICONS['Comm/Integration'] },
    { name: 'Testing', hours: effort.testingHours, color: EFFORT_BAR_COLORS['Testing'], icon: EFFORT_ICONS['Testing'] },
    { name: 'Commissioning', hours: effort.commissioningHours, color: EFFORT_BAR_COLORS['Commissioning'], icon: EFFORT_ICONS['Commissioning'] },
  ];

  const [exporting, setExporting] = useState<'pdf' | 'excel' | null>(null);

  const handleExportPdf = useCallback(async () => {
    try {
      setExporting('pdf');
      const params = activeProjectId ? `?projectId=${encodeURIComponent(activeProjectId)}` : '';
      const res = await fetch(`/api/export/pdf${params}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(c),
      });
      if (!res.ok) throw new Error(`Server returned ${res.status}`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `br-estimate-${(c.project.name || 'untitled').replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase()}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast.success('PDF downloaded', { description: 'Report saved as PDF file.' });
    } catch (err) {
      console.error('PDF export error:', err);
      toast.error('PDF export failed', { description: 'Could not generate the PDF report.' });
    } finally {
      setExporting(null);
    }
  }, [c, activeProjectId]);

  const handleExportExcel = useCallback(async () => {
    try {
      setExporting('excel');
      const res = await fetch('/api/export/excel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(c),
      });
      if (!res.ok) throw new Error(`Server returned ${res.status}`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `br-estimate-${(c.project.name || 'untitled').replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase()}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast.success('Excel downloaded', { description: 'Spreadsheet saved as XLSX file.' });
    } catch (err) {
      console.error('Excel export error:', err);
      toast.error('Excel export failed', { description: 'Could not generate the Excel file.' });
    } finally {
      setExporting(null);
    }
  }, [c]);



  return (
    <motion.div className="space-y-6" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-lg font-bold text-foreground">Engineering Effort Summary</h1>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-0.5 flex-wrap">
            {activeProjectId && <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">{activeProjectId}</span>}
            <span>{c.project.name || 'Untitled Project'}</span>
            {c.project.customer && <span>&middot; {c.project.customer}</span>}
            {currentProject && <StatusBadge status={currentProject.status} />}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-9 gap-1.5 text-sm" disabled={exporting === 'pdf'} onClick={handleExportPdf}>{exporting === 'pdf' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FileText className="h-3.5 w-3.5" />} PDF</Button>
          <Button variant="outline" size="sm" className="h-9 gap-1.5 text-sm" disabled={exporting === 'excel'} onClick={handleExportExcel}>{exporting === 'excel' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Table2 className="h-3.5 w-3.5" />} Excel</Button>
          <Button variant="outline" size="sm" className="h-9 gap-1.5 text-sm" onClick={() => {
            const report = [`B&R Engineering Effort Report`, `Project: ${activeProjectId || 'N/A'}`, `Name: ${c.project.name || 'N/A'}`, `Customer: ${c.project.customer || 'N/A'}`, `Machine Type: ${c.project.machineType || 'N/A'}`, ``, `TOTAL ENGINEERING EFFORT`, `  ${effort.totalHours.toFixed(1)} hours | ${effort.totalDays} days | ${timeline.totalWeeks} weeks | ${effort.totalMonths} months`, ``, `BREAKDOWN:`, `  Hardware: ${effort.hardwareHours.toFixed(1)}h`, `  PLC/Software: ${effort.plcSoftwareHours.toFixed(1)}h`, `  Motion: ${effort.motionHours.toFixed(1)}h`, `  Vision: ${effort.visionHours.toFixed(1)}h`, `  Safety: ${effort.safetyHours.toFixed(1)}h`, `  Comm/Integration: ${effort.communicationIntegrationHours.toFixed(1)}h`, `  Testing: ${effort.testingHours.toFixed(1)}h`, `  Commissioning: ${effort.commissioningHours.toFixed(1)}h`, ``, `OVERALL COMPLEXITY: ${overallComplexity} (${highCount}/10 High or Very High)`, ``, `Generated by B&R Engineering Estimation Tool`].join('\n');
            navigator.clipboard.writeText(report); toast('Report copied to clipboard');
          }}><Share2 className="h-3.5 w-3.5" /> Copy Report</Button>
          <Button size="sm" className="h-9 gap-1.5 text-sm bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => { setWizardStep(13); setCurrentPage('new-estimate'); }}><Pencil className="h-3.5 w-3.5" /> Edit</Button>
          <Button size="sm" className="h-9 gap-1.5 text-sm" variant="outline" onClick={() => {
            const now = new Date().toISOString().split('T')[0];
            const project: Project = { id: 'proj-' + Date.now(), name: c.project.name || 'Untitled Project', customer: c.project.customer || 'Unknown', machineType: c.project.machineType || 'General', industry: c.project.industry || '', description: c.project.description || '', requirementClarity: c.project.requirementClarity || 'Mostly Clear', customerInvolvement: c.project.customerInvolvement || 'Medium', projectVariants: c.project.projectVariants || 1, machineStations: c.project.machineStations || 1, complexity: overallComplexity, status: 'Draft', createdAt: now, updatedAt: now, config: JSON.parse(JSON.stringify(c)) };
            addProject(project); toast('Project saved!', { description: project.name });
          }}><Save className="h-3.5 w-3.5" /> Save</Button>
        </div>
      </div>

      {/* === TOTAL ENGINEERING EFFORT HERO CARD === */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05, duration: 0.4 }} className="relative overflow-hidden rounded-xl border border-primary/20 bg-gradient-to-br from-primary/[0.08] via-primary/[0.03] to-transparent">
        <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-primary/[0.06] blur-2xl" />
        <div className="p-6 relative">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-8 w-8 rounded-lg bg-primary/15 flex items-center justify-center"><Clock className="h-4 w-4 text-primary" /></div>
            <span className="text-sm font-semibold uppercase tracking-wider text-primary">Total Engineering Effort</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="rounded-lg bg-background/80 border border-border p-4 text-center">
              <div className="text-3xl font-extrabold text-primary tabular-nums">{effort.totalHours.toFixed(0)}</div>
              <div className="text-sm font-medium text-muted-foreground mt-1">Hours</div>
            </div>
            <div className="rounded-lg bg-background/80 border border-border p-4 text-center">
              <div className="text-3xl font-extrabold text-foreground tabular-nums">{Math.ceil(effort.totalDays)}</div>
              <div className="text-sm font-medium text-muted-foreground mt-1">Working Days</div>
            </div>
            <div className="rounded-lg bg-background/80 border border-border p-4 text-center">
              <div className="text-3xl font-extrabold text-foreground tabular-nums">{timeline.totalWeeks}</div>
              <div className="text-sm font-medium text-muted-foreground mt-1">Weeks</div>
            </div>
            <div className="rounded-lg bg-background/80 border border-border p-4 text-center">
              <div className="text-3xl font-extrabold text-foreground tabular-nums">{effort.totalMonths}</div>
              <div className="text-sm font-medium text-muted-foreground mt-1">Months (est.)</div>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-3 flex-wrap">
            <span className={`text-sm font-bold rounded-lg border-2 px-3 py-1.5 ${COMPLEXITY_COLORS[overallComplexity]}`}>{overallComplexity.toUpperCase()} COMPLEXITY</span>
            <span className="text-sm text-muted-foreground">{highCount} of 10 dimensions rated High or Very High</span>
            <span className="text-sm text-muted-foreground">&middot;</span>
            <span className="text-sm text-muted-foreground">{configuredCount} of {completeness.length} sections configured</span>
          </div>
        </div>
      </motion.div>

      {/* Effort Breakdown with Donut Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Donut Chart */}
        <SectionCard title="Effort Distribution" description="Hours by engineering domain" className="lg:col-span-2">
          {effort.totalHours === 0 ? (
            <div className="flex items-center justify-center h-56 text-sm text-muted-foreground">
              No engineering effort calculated yet.
            </div>
          ) : (
            <div>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={2}
                      dataKey="value"
                      stroke="none"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-2 space-y-1.5">
                {chartData.map((d) => {
                  const pct = effort.totalHours > 0 ? (d.value / effort.totalHours) * 100 : 0;
                  return (
                    <div key={d.name} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-sm shrink-0" style={{ backgroundColor: d.color }} />
                        <span className="text-muted-foreground">{d.name}</span>
                      </div>
                      <div className="flex items-center gap-3 tabular-nums">
                        <span className="text-foreground font-medium">{d.value.toFixed(1)}h</span>
                        <span className="text-muted-foreground text-xs w-12 text-right">{pct.toFixed(0)}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </SectionCard>

        {/* Effort Bars */}
        <SectionCard title="Effort Breakdown" description="Estimated engineering hours by domain" className="lg:col-span-3">
          <div className="space-y-3">
            {effortRows.map((row, index) => (
              <motion.div key={row.name} className="flex items-center gap-3" initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.06, duration: 0.3 }}>
                <div className="w-40 shrink-0 text-sm text-muted-foreground">{row.name}</div>
                <div className="flex-1">
                  <div className="h-4 bg-muted rounded-full overflow-hidden">
                    <div className={`h-4 rounded-full ${row.color} transition-all duration-500`} style={{ width: `${Math.max((row.hours / Math.max(effort.totalHours, 1)) * 100, 2)}%` }} />
                  </div>
                </div>
                <div className="w-20 shrink-0 text-sm font-semibold text-right text-foreground">{row.hours.toFixed(1)}h</div>
                <div className="w-16 shrink-0 text-sm text-right text-muted-foreground">{(row.hours / 8).toFixed(1)}d</div>
              </motion.div>
            ))}
            <div className="flex items-center gap-3 border-t border-border pt-2 mt-1">
              <div className="w-40 shrink-0 text-sm font-bold text-primary">Total</div>
              <div className="flex-1 h-4 bg-muted rounded-full overflow-hidden">
                <div className="h-4 rounded-full bg-primary transition-all duration-500" style={{ width: '100%' }} />
              </div>
              <div className="w-20 shrink-0 text-sm font-bold text-right text-primary">{effort.totalHours.toFixed(1)}h</div>
              <div className="w-16 shrink-0 text-sm font-bold text-right text-primary">{Math.ceil(effort.totalDays)}d</div>
            </div>
          </div>
        </SectionCard>
      </div>

      {/* Major Effort Drivers */}
      {drivers.length > 0 && (
        <SectionCard title="Major Effort Drivers" description="Configuration items contributing most to engineering effort">
          <div className="flex flex-wrap gap-2">
            {drivers.map((driver, idx) => (
              <motion.span
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.04, duration: 0.2 }}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-muted/50 px-3 py-1.5 text-sm font-medium text-foreground"
              >
                <Cpu className="h-3 w-3 text-primary" />
                {driver}
              </motion.span>
            ))}
          </div>
        </SectionCard>
      )}

      {/* Timeline */}
      <SectionCard title="Estimated Timeline" description={`Total: ${timeline.totalWeeks} weeks`}>
        <div className="space-y-3">
          {[
            { name: 'Hardware Design & Ordering', weeks: timeline.hardwareDesignWeeks, color: 'bg-blue-400' },
            { name: 'Software Development', weeks: timeline.softwareDevelopmentWeeks, color: 'bg-amber-400' },
            { name: 'Integration & Testing', weeks: timeline.integrationTestingWeeks, color: 'bg-orange-400' },
            { name: 'Commissioning & Handover', weeks: timeline.commissioningWeeks, color: 'bg-emerald-400' },
          ].map((phase, index) => {
            const barWidth = `${(phase.weeks / Math.max(timeline.totalWeeks, 1)) * 100}%`;
            return (
              <motion.div key={phase.name} className="relative flex items-center gap-3" initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.08, duration: 0.3 }}>
                <div className="w-40 shrink-0 flex items-center gap-2 text-sm text-muted-foreground">
                  <span className={`w-2 h-2 rounded-full ${phase.color} shrink-0`} />
                  {phase.name}
                </div>
                <div className="flex-1 h-5 bg-muted rounded-sm overflow-hidden">
                  <div className={`h-5 rounded-sm ${phase.color} transition-all duration-500`} style={{ width: barWidth }} />
                </div>
                <div className="w-20 shrink-0 text-sm font-medium text-right text-foreground">{phase.weeks}w</div>
              </motion.div>
            );
          })}
        </div>
      </SectionCard>

      {/* Risk Assessment */}
      <SectionCard title="Risk Assessment" description="Key risk indicators">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {(() => {
            const clarity = c.project.requirementClarity || 'Mostly Clear';
            const clrMap: Record<string, string> = { Clear: 'bg-emerald-500', 'Mostly Clear': 'bg-amber-500', 'Partially Clear': 'bg-orange-500', Unclear: 'bg-red-500' };
            const txtMap: Record<string, string> = { Clear: 'text-emerald-600 dark:text-emerald-400', 'Mostly Clear': 'text-amber-600 dark:text-amber-400', 'Partially Clear': 'text-orange-600 dark:text-orange-400', Unclear: 'text-red-600 dark:text-red-400' };
            return (<div className="rounded-lg border border-border bg-card p-3"><div className="text-sm text-muted-foreground mb-2">Requirement Clarity</div><div className="flex items-center gap-2"><span className={`h-2.5 w-2.5 rounded-full ${clrMap[clarity] || 'bg-muted-foreground'}`} /><span className={`text-sm font-semibold ${txtMap[clarity] || 'text-foreground'}`}>{clarity}</span></div></div>);
          })()}
          {(() => {
            const inv = c.project.customerInvolvement || 'Medium';
            const invMap: Record<string, string> = { Low: 'bg-red-500', Medium: 'bg-amber-500', High: 'bg-emerald-500' };
            const invTxt: Record<string, string> = { Low: 'text-red-600 dark:text-red-400', Medium: 'text-amber-600 dark:text-amber-400', High: 'text-emerald-600 dark:text-emerald-400' };
            return (<div className="rounded-lg border border-border bg-card p-3"><div className="text-sm text-muted-foreground mb-2">Customer Involvement</div><div className="flex items-center gap-2"><span className={`h-2.5 w-2.5 rounded-full ${invMap[inv] || 'bg-muted-foreground'}`} /><span className={`text-sm font-semibold ${invTxt[inv] || 'text-foreground'}`}>{inv}</span></div></div>);
          })()}
          <div className="rounded-lg border border-border bg-card p-3">
            <div className="text-sm text-muted-foreground mb-2">Scope Complexity</div>
            <div className="text-sm font-semibold text-foreground mb-2">{highCount}/10 dimensions</div>
            <div className="h-2 bg-muted rounded-full overflow-hidden"><div className={`h-2 rounded-full transition-all duration-500 ${highCount >= 5 ? 'bg-red-400' : highCount >= 3 ? 'bg-orange-400' : highCount >= 1 ? 'bg-amber-400' : 'bg-emerald-400'}`} style={{ width: `${(highCount / 10) * 100}%` }} /></div>
          </div>
        </div>
      </SectionCard>

      {/* Complexity Profile */}
      <SectionCard title="Complexity Profile" description="All 10 engineering dimensions">
        <div className="space-y-2">
          {COMPLEXITY_DIMENSIONS.map((dim, index) => {
            const level = c.complexity[dim.key];
            return (
              <motion.div key={dim.key} className="flex items-center gap-3" initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.04, duration: 0.3 }}>
                <div className="w-28 shrink-0 text-sm text-muted-foreground text-right pr-3">{dim.label}</div>
                <div className="flex-1 h-5 bg-muted rounded-full overflow-hidden"><div className={`h-5 rounded-full transition-all duration-500 ${COMPLEXITY_BAR_COLORS[level]}`} style={{ width: COMPLEXITY_WIDTH[level] }} /></div>
                <div className={`w-20 shrink-0 text-sm font-semibold ${COMPLEXITY_TEXT_COLORS[level]}`}>{level}</div>
              </motion.div>
            );
          })}
        </div>
      </SectionCard>

      {/* Engineering Areas */}
      <SectionCard title="Engineering Areas" description="Potential effort drivers by domain">
        <div className="overflow-x-auto -mx-4 px-4">
          <table className="w-full">
            <thead><tr className="border-b border-border"><th className="text-left text-sm font-semibold text-muted-foreground pb-2 pr-4">Area</th><th className="text-left text-sm font-semibold text-muted-foreground pb-2 pr-4">Complexity</th><th className="text-left text-sm font-semibold text-muted-foreground pb-2">Potential Effort Driver</th></tr></thead>
            <tbody>{EFFORT_AREAS.map((area) => {
              const complexity = areaComplexities[area.name] || 'Medium';
              return (<tr key={area.name} className="border-b border-border/50 last:border-0"><td className="py-2.5 pr-4 text-sm font-medium text-foreground">{area.name}</td><td className="py-2.5 pr-4"><div className="flex items-center gap-2"><div className={`w-[2px] h-5 rounded-full ${COMPLEXITY_DOT_COLORS[complexity]}`} /><span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold ${COMPLEXITY_COLORS[complexity]}`}>{complexity}</span></div></td><td className="py-2.5 text-sm text-muted-foreground">{area.driver}</td></tr>);
            })}</tbody>
          </table>
        </div>
      </SectionCard>

      {/* Configuration Completeness */}
      <SectionCard title="Configuration Completeness" description={`${configuredCount} of ${completeness.length} sections configured`}>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">{completeness.map((section) => (
          <div key={section.label} className="flex items-center gap-2 text-sm">
            {section.configured ? (<div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/50"><Check className="h-3 w-3 text-emerald-600 dark:text-emerald-400" /></div>) : (<div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-muted"><Minus className="h-3 w-3 text-muted-foreground" /></div>)}
            <span className={section.configured ? 'font-medium text-foreground' : 'text-muted-foreground'}>{section.label}</span>
          </div>
        ))}</div>
      </SectionCard>

      {/* Product Flow */}
      <SectionCard title="Product Architecture Flow">
        <div className="flex flex-wrap items-center gap-2">{['B&R Product', 'Technology', 'Engineering Function', 'Configuration', 'Programming', 'Integration', 'Testing', 'Commissioning', 'Complexity', 'Engineering Effort'].map((item, idx, arr) => (
          <React.Fragment key={item}><div className="rounded-md border border-border bg-card px-3 py-1.5 text-sm font-medium text-foreground">{item}</div>{idx < arr.length - 1 && <ArrowRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />}</React.Fragment>
        ))}</div>
      </SectionCard>
    </motion.div>
  );
}
