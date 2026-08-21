'use client';

import React, { useEffect, useRef } from 'react';
import { AlertTriangle, ArrowRight, Check, Minus, Save, FileText, Share2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { SectionCard } from '@/components/br/SectionCard';
import { useAppStore } from '@/store';
import { EFFORT_AREAS } from '@/data';
import { toast } from 'sonner';
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

interface SectionCheck {
  label: string;
  configured: boolean;
}

function checkCompleteness(config: ProjectConfig): SectionCheck[] {
  const ioTotal =
    config.io.digitalInputs + config.io.digitalOutputs +
    config.io.analogInputs + config.io.analogOutputs +
    config.io.safetyIO + config.io.encoderCounterModules +
    config.io.temperatureModules + config.io.communicationIO +
    config.io.specialModules;

  const motionFeatures = [
    config.motion.homingRequired, config.motion.positioning,
    config.motion.velocityControl, config.motion.torqueControl,
    config.motion.synchronization, config.motion.masterSlave,
    config.motion.electronicGearing, config.motion.electronicCamming,
    config.motion.coordinatedMotion, config.motion.interpolation,
    config.motion.complexMotionProfiles, config.motion.axisDiagnostics,
  ].filter(Boolean).length;

  const hmiFeatures = [
    config.hmi.alarmManagement, config.hmi.recipeManagement,
    config.hmi.trendVisualization, config.hmi.userManagement,
    config.hmi.machineDiagnostics, config.hmi.manualMode,
    config.hmi.automaticMode, config.hmi.maintenanceScreens,
    config.hmi.parameterManagement,
  ].filter(Boolean).length;

  const commActive = config.communication.protocols.some((p) => p.enabled);
  const commIntegrations = [
    config.communication.plcToPlc, config.communication.mesIntegration,
    config.communication.scadaIntegration, config.communication.cloudIIoTIntegration,
  ].filter(Boolean).length;

  const iiotFeatures = [
    config.iiot.ipcRequired, config.iiot.iiotRequired,
    config.iiot.iiotConnector, config.iiot.iiotServices,
    config.iiot.iiotEdgeDevice, config.iiot.cloudConnectivity,
    config.iiot.machineDataCollection, config.iiot.remoteMaintenance,
    config.iiot.opcUa, config.iiot.dataLogging, config.iiot.analyticsIntegration,
  ].filter(Boolean).length;

  return [
    {
      label: 'Project',
      configured: !!(config.project.name && config.project.name.trim()),
    },
    {
      label: 'Controller',
      configured: config.controller.quantity > 1 || config.controller.performance !== 'Standard' || !!config.controller.communicationInterfaces,
    },
    {
      label: 'I/O',
      configured: ioTotal > 0,
    },
    {
      label: 'Motion',
      configured: config.motion.totalAxes > 0 || motionFeatures > 0,
    },
    {
      label: 'HMI',
      configured: config.hmi.screens > 0 || hmiFeatures > 0,
    },
    {
      label: 'Vision',
      configured: config.vision.enabled,
    },
    {
      label: 'Safety',
      configured: config.safety.enabled,
    },
    {
      label: 'Communication',
      configured: commActive || commIntegrations > 0,
    },
    {
      label: 'Mechatronics',
      configured: config.mechatronics.type !== 'None' && config.mechatronics.type !== '',
    },
    {
      label: 'Robotics',
      configured: config.robotics.enabled,
    },
    {
      label: 'IIoT',
      configured: iiotFeatures > 0,
    },
  ];
}

export function EstimateSummaryPage() {
  const { config, setCurrentPage, setWizardStep, addProject } = useAppStore();
  const c = config;

  // Determine overall complexity from the assessment
  const allComplexities = [
    c.complexity.hardware, c.complexity.motion, c.complexity.hmi, c.complexity.vision,
    c.complexity.safety, c.complexity.communication, c.complexity.software,
    c.complexity.integration, c.complexity.requirement, c.complexity.testing,
  ];
  const highCount = allComplexities.filter((x) => x === 'High' || x === 'Very High').length;
  const overallComplexity: ComplexityLevel = highCount >= 5 ? 'Very High' : highCount >= 3 ? 'High' : highCount >= 1 ? 'Medium' : 'Low';

  // Map effort areas to complexity from config
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

  // Listen for br:export-pdf event (triggered from header export dropdown)
  const pdfButtonRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const handleExportPdf = () => {
      pdfButtonRef.current?.click();
    };
    window.addEventListener('br:export-pdf', handleExportPdf);
    return () => window.removeEventListener('br:export-pdf', handleExportPdf);
  }, []);

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div>
        <h1 className="text-lg font-bold text-foreground">Prototype Engineering Effort Analysis</h1>
        <p className="text-sm text-muted-foreground">
          Review the engineering complexity assessment for: <span className="font-medium text-foreground">{c.project.name || 'Untitled Project'}</span>
        </p>
      </div>

      {/* Save as New Project */}
      <Button
        className="w-full h-10 bg-primary text-primary-foreground hover:bg-primary/90 gap-2 text-sm font-semibold"
        onClick={() => {
          const now = new Date().toISOString().split('T')[0];
          const project: Project = {
            id: 'proj-' + Date.now(),
            name: c.project.name || 'Untitled Project',
            customer: c.project.customer || 'Unknown',
            machineType: c.project.machineType || 'General',
            industry: c.project.industry || '',
            description: c.project.description || '',
            requirementClarity: c.project.requirementClarity || 'Mostly Clear',
            customerInvolvement: c.project.customerInvolvement || 'Medium',
            projectVariants: c.project.projectVariants || 1,
            machineStations: c.project.machineStations || 1,
            complexity: c.complexity.hardware,
            status: 'Draft',
            createdAt: now,
            updatedAt: now,
            config: JSON.parse(JSON.stringify(c)),
          };
          addProject(project);
          toast('Project saved!', { description: project.name });
          setCurrentPage('projects');
        }}
      >
        <Save className="h-4 w-4" />
        Save as New Project
      </Button>

      {/* Export / Share Buttons */}
      <motion.div
        className="flex gap-2"
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.3 }}
      >
        <Button
          ref={pdfButtonRef}
          variant="outline"
          size="sm"
          className="gap-1.5 text-sm"
          onClick={() => {
            const hwHours = (c.io.digitalInputs + c.io.digitalOutputs + c.io.analogInputs + c.io.analogOutputs) * 0.5 + c.motion.totalAxes * 4;
            const swHours = c.hmi.screens * 8 + (c.vision.enabled ? c.vision.cameras * 16 : 0) + 40;
            const motionHours = c.motion.totalAxes * 6 + (c.motion.electronicCamming ? 20 : 0) + (c.motion.coordinatedMotion ? 16 : 0);
            const safetyHours = c.safety.enabled ? c.safety.safetyIOCount * 2 + 16 : 0;
            const integrationHours = (hwHours + swHours + motionHours + safetyHours) * 0.3;
            const totalHours = hwHours + swHours + motionHours + safetyHours + integrationHours;

            const hwDesignWeeks = 2;
            const swDevWeeks = Math.max(2, Math.ceil(c.hmi.screens / 3));
            const integrationWeeks = Math.max(2, Math.ceil(totalHours / 40));
            const complexityMap: Record<string, number> = { Low: 1, Medium: 2, High: 3, 'Very High': 4 };
            const commissionWeeks = complexityMap[overallComplexity] || 2;
            const totalWeeks = hwDesignWeeks + swDevWeeks + integrationWeeks + commissionWeeks;

            const complexityDims = [
              { label: 'Hardware', value: c.complexity.hardware },
              { label: 'Motion', value: c.complexity.motion },
              { label: 'HMI', value: c.complexity.hmi },
              { label: 'Vision', value: c.complexity.vision },
              { label: 'Safety', value: c.complexity.safety },
              { label: 'Communication', value: c.complexity.communication },
              { label: 'Software', value: c.complexity.software },
              { label: 'Integration', value: c.complexity.integration },
              { label: 'Requirement', value: c.complexity.requirement },
              { label: 'Testing', value: c.complexity.testing },
            ];

            const effortRows = [
              { area: 'Hardware Engineering', hours: hwHours },
              { area: 'Software Development', hours: swHours },
              { area: 'Motion Configuration', hours: motionHours },
              { area: 'Safety Engineering', hours: safetyHours },
              { area: 'Integration & Testing', hours: integrationHours },
            ];

            const timelinePhases = [
              { phase: 'Hardware Design', weeks: hwDesignWeeks },
              { phase: 'Software Development', weeks: swDevWeeks },
              { phase: 'Integration & Testing', weeks: integrationWeeks },
              { phase: 'Commissioning', weeks: commissionWeeks },
            ];

            // --- Build SVG charts ---
            const complexityValueMap: Record<string, number> = { Low: 0.25, Medium: 0.5, High: 0.75, 'Very High': 1 };

            // 1) Radar Chart (400x400)
            const radarCx = 200; const radarCy = 200; const radarMaxR = 160;
            const radarRings = [0.25, 0.5, 0.75, 1];
            let radarRingsSvg = '';
            for (const ring of radarRings) {
              const rr = ring * radarMaxR;
              let pts = '';
              for (let i = 0; i < 10; i++) {
                const angle = i * (2 * Math.PI / 10) - Math.PI / 2;
                const px = radarCx + rr * Math.cos(angle);
                const py = radarCy + rr * Math.sin(angle);
                pts += `${px.toFixed(1)},${py.toFixed(1)} `;
              }
              radarRingsSvg += `<polygon points="${pts.trim()}" fill="none" stroke="#e5e5e5" stroke-width="0.8"/>\n`;
            }
            let radarAxesSvg = '';
            for (let i = 0; i < 10; i++) {
              const angle = i * (2 * Math.PI / 10) - Math.PI / 2;
              const px = radarCx + radarMaxR * Math.cos(angle);
              const py = radarCy + radarMaxR * Math.sin(angle);
              radarAxesSvg += `<line x1="${radarCx}" y1="${radarCy}" x2="${px.toFixed(1)}" y2="${py.toFixed(1)}" stroke="#e5e5e5" stroke-width="0.8"/>\n`;
            }
            let radarDataPts = '';
            let radarLabelsSvg = '';
            for (let i = 0; i < complexityDims.length; i++) {
              const d = complexityDims[i];
              const val = complexityValueMap[d.value] || 0.25;
              const r = val * radarMaxR;
              const angle = i * (2 * Math.PI / 10) - Math.PI / 2;
              const px = radarCx + r * Math.cos(angle);
              const py = radarCy + r * Math.sin(angle);
              radarDataPts += `${px.toFixed(1)},${py.toFixed(1)} `;
              const lx = radarCx + (radarMaxR + 22) * Math.cos(angle);
              const ly = radarCy + (radarMaxR + 22) * Math.sin(angle);
              const anchor = Math.abs(Math.cos(angle)) < 0.1 ? 'middle' : Math.cos(angle) > 0 ? 'start' : 'end';
              const dy = Math.sin(angle) > 0.3 ? 4 : Math.sin(angle) < -0.3 ? -3 : 1;
              radarLabelsSvg += `<text x="${lx.toFixed(1)}" y="${ly.toFixed(1)}" text-anchor="${anchor}" font-size="10" fill="#555" dominant-baseline="middle" dy="${dy}">${d.label}</text>\n`;
            }
            const radarSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">\n${radarRingsSvg}${radarAxesSvg}<polygon points="${radarDataPts.trim()}" fill="oklch(0.55 0.2 35 / 0.2)" stroke="oklch(0.55 0.2 35)" stroke-width="2"/>\n${radarLabelsSvg}</svg>`;

            // 2) Effort Breakdown Bar Chart (500x200)
            const effortColors = ['#3b82f6', '#8b5cf6', '#f97316', '#ef4444', '#10b981'];
            const effortMax = Math.max(...effortRows.map((r) => r.hours), 1);
            let effortBarsSvg = '';
            effortRows.forEach((r, i) => {
              const y = 12 + i * 32;
              const barW = Math.max((r.hours / effortMax) * 300, 4);
              effortBarsSvg += `<text x="148" y="${y + 13}" text-anchor="end" font-size="11" fill="#333">${r.area}</text>\n`;
              effortBarsSvg += `<rect x="155" y="${y}" width="${barW.toFixed(1)}" height="18" rx="3" fill="${effortColors[i]}"/>\n`;
              effortBarsSvg += `<text x="${160 + barW + 6}" y="${y + 13}" font-size="11" font-weight="600" fill="#333">${r.hours.toFixed(1)}h</text>\n`;
            });
            const totalY = 12 + effortRows.length * 32;
            const totalBarW = Math.max((totalHours / effortMax) * 300, 4);
            effortBarsSvg += `<line x1="155" y1="${totalY - 4}" x2="490" y2="${totalY - 4}" stroke="#ddd" stroke-width="0.8"/>\n`;
            effortBarsSvg += `<text x="148" y="${totalY + 13}" text-anchor="end" font-size="11" font-weight="700" fill="#C75B12">TOTAL</text>\n`;
            effortBarsSvg += `<rect x="155" y="${totalY}" width="${totalBarW.toFixed(1)}" height="18" rx="3" fill="#C75B12"/>\n`;
            effortBarsSvg += `<text x="${160 + totalBarW + 6}" y="${totalY + 13}" font-size="11" font-weight="700" fill="#C75B12">${totalHours.toFixed(1)}h</text>\n`;
            const effortSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="500" height="200" viewBox="0 0 500 200">\n${effortBarsSvg}</svg>`;

            // 3) Timeline Gantt Chart (500x120)
            const ganttColors = ['#3b82f6', '#f59e0b', '#f97316', '#10b981'];
            let ganttBarsSvg = '';
            timelinePhases.forEach((p, i) => {
              const y = 8 + i * 28;
              const barW = Math.max((p.weeks / totalWeeks) * 300, 8);
              ganttBarsSvg += `<text x="130" y="${y + 14}" text-anchor="end" font-size="10" fill="#333">${p.phase}</text>\n`;
              ganttBarsSvg += `<circle cx="135" cy="${y + 10}" r="3" fill="${ganttColors[i]}"/>\n`;
              ganttBarsSvg += `<rect x="140" y="${y}" width="${barW.toFixed(1)}" height="18" rx="3" fill="${ganttColors[i]}" opacity="0.85"/>\n`;
              ganttBarsSvg += `<text x="${145 + barW + 6}" y="${y + 13}" font-size="10" fill="#555">${p.weeks} week${p.weeks !== 1 ? 's' : ''}</text>\n`;
            });
            const ganttSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="500" height="120" viewBox="0 0 500 120">\n${ganttBarsSvg}</svg>`;

            // 4) Complexity Profile Bar Chart (500x280)
            const complexityBarColors: Record<string, string> = { Low: '#10b981', Medium: '#f59e0b', High: '#f97316', 'Very High': '#ef4444' };
            let complexityBarsSvg = '';
            complexityDims.forEach((d, i) => {
              const y = 4 + i * 26;
              const val = complexityValueMap[d.value] || 0.25;
              const barW = Math.max(val * 300, 4);
              const color = complexityBarColors[d.value] || '#999';
              complexityBarsSvg += `<text x="108" y="${y + 14}" text-anchor="end" font-size="10" fill="#333">${d.label}</text>\n`;
              complexityBarsSvg += `<rect x="115" y="${y}" width="${barW.toFixed(1)}" height="18" rx="3" fill="${color}" opacity="0.85"/>\n`;
              complexityBarsSvg += `<text x="${120 + barW + 6}" y="${y + 14}" font-size="10" font-weight="600" fill="#333">${d.value}</text>\n`;
            });
            const complexitySvg = `<svg xmlns="http://www.w3.org/2000/svg" width="500" height="280" viewBox="0 0 500 280">\n${complexityBarsSvg}</svg>`;

            // 5) Risk assessment helpers
            const clarity = c.project.requirementClarity || 'Mostly Clear';
            const involvement = c.project.customerInvolvement || 'Medium';
            const clarityColorMap: Record<string, string> = { Clear: '#10b981', 'Mostly Clear': '#f59e0b', 'Partially Clear': '#f97316', Unclear: '#ef4444' };
            const involvementColorMap: Record<string, string> = { Low: '#ef4444', Medium: '#f59e0b', High: '#10b981' };
            const scopeColor = highCount >= 5 ? '#ef4444' : highCount >= 3 ? '#f97316' : highCount >= 1 ? '#f59e0b' : '#10b981';

            // 6) Completeness checks
            const completenessChecks = checkCompleteness(c);

            // 7) Engineering areas table data
            const engAreaRows = EFFORT_AREAS.map((area) => ({
              name: area.name,
              complexity: areaComplexities[area.name] || 'Medium',
              driver: area.driver,
            }));

            // 8) Overall complexity badge color
            const badgeBgMap: Record<ComplexityLevel, string> = { Low: '#ecfdf5', Medium: '#fffbeb', High: '#fff7ed', 'Very High': '#fef2f2' };
            const badgeColorMap: Record<ComplexityLevel, string> = { Low: '#059669', Medium: '#d97706', High: '#ea580c', 'Very High': '#dc2626' };

            const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>B&R Engineering Estimation Report</title>
<style>
@page { margin: 15mm; size: A4; }
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1a1a1a; background: #fff; padding: 24px; font-size: 12px; line-height: 1.6; }
.header { border-bottom: 3px solid #C75B12; padding-bottom: 16px; margin-bottom: 24px; }
.header h1 { font-size: 22px; font-weight: 700; color: #C75B12; margin-bottom: 4px; }
.header .meta { font-size: 12px; color: #666; margin-top: 4px; }
.header .meta strong { color: #333; }
.section { margin-bottom: 24px; page-break-inside: avoid; }
.section h2 { font-size: 13px; font-weight: 700; color: #C75B12; border-bottom: 1px solid #e5e5e5; padding-bottom: 6px; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.5px; }
table { width: 100%; border-collapse: collapse; font-size: 11px; }
th { text-align: left; font-weight: 600; background: #f8f8f8; border: 1px solid #ddd; padding: 8px 10px; color: #444; }
td { border: 1px solid #ddd; padding: 7px 10px; }
tr:last-child td { font-weight: 600; background: #fafafa; }
.complexity-badge { display: inline-block; padding: 2px 10px; border-radius: 4px; font-weight: 600; font-size: 11px; }
.chart-container { display: flex; justify-content: center; margin: 16px 0; }
.risk-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; }
.risk-card { border: 1px solid #ddd; border-radius: 6px; padding: 12px; }
.risk-card .label { font-size: 10px; color: #888; text-transform: uppercase; letter-spacing: 0.3px; margin-bottom: 4px; }
.risk-card .value { font-size: 14px; font-weight: 600; color: #1a1a1a; }
.risk-card .dot { display: inline-block; width: 8px; height: 8px; border-radius: 50%; margin-right: 6px; vertical-align: middle; }
.footer { margin-top: 32px; padding-top: 12px; border-top: 1px solid #e5e5e5; font-size: 10px; color: #999; }
@media print { body { padding: 0; } }
.print-hint { background: #fff8e1; border: 1px solid #ffe082; border-radius: 6px; padding: 10px 14px; margin-bottom: 20px; font-size: 12px; color: #6d4c00; }
.print-hint strong { color: #e65100; }
.completeness-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 6px; }
.completeness-item { display: flex; align-items: center; gap: 6px; font-size: 11px; padding: 4px 0; }
.completeness-icon { width: 14px; height: 14px; display: inline-flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 700; border-radius: 50%; }
.check-yes { background: #ecfdf5; color: #059669; }
.check-no { background: #f3f4f6; color: #9ca3af; }
</style>
</head>
<body>
  <div class="print-hint">
    <strong>Tip:</strong> Use <strong>Ctrl+P</strong> (or Cmd+P on Mac) to save this report as a PDF.
  </div>
  <div class="header">
    <h1>${c.project.name || 'Untitled Project'}</h1>
    <div class="meta">
      <strong>Customer:</strong> ${c.project.customer || 'N/A'} &nbsp;&middot;&nbsp; <strong>Machine Type:</strong> ${c.project.machineType || 'N/A'} &nbsp;&middot;&nbsp; <strong>Industry:</strong> ${c.project.industry || 'N/A'}<br>
      <strong>Date:</strong> ${new Date().toLocaleDateString('de-AT', { year: 'numeric', month: 'long', day: 'numeric' })} &nbsp;&middot;&nbsp; Overall Complexity: <span class="complexity-badge" style="background:${badgeBgMap[overallComplexity]};color:${badgeColorMap[overallComplexity]}">${overallComplexity}</span>
    </div>
  </div>

  <div class="section">
    <h2>Complexity Radar</h2>
    <div class="chart-container">${radarSvg}</div>
    <p style="text-align:center;font-size:11px;color:#888;margin-top:4px;">${highCount} of 10 dimensions rated High or Very High</p>
  </div>

  <div class="section">
    <h2>Effort Breakdown</h2>
    <div class="chart-container">${effortSvg}</div>
  </div>

  <div class="section">
    <h2>Project Timeline</h2>
    <div class="chart-container">${ganttSvg}</div>
  </div>

  <div class="section">
    <h2>Complexity Profile</h2>
    <div class="chart-container">${complexitySvg}</div>
  </div>

  <div class="section">
    <h2>Risk Assessment</h2>
    <div class="risk-grid">
      <div class="risk-card">
        <div class="label">Requirement Clarity</div>
        <div class="value"><span class="dot" style="background:${clarityColorMap[clarity] || '#999'}"></span>${clarity}</div>
      </div>
      <div class="risk-card">
        <div class="label">Customer Involvement</div>
        <div class="value"><span class="dot" style="background:${involvementColorMap[involvement] || '#999'}"></span>${involvement}</div>
      </div>
      <div class="risk-card">
        <div class="label">Scope Complexity</div>
        <div class="value"><span class="dot" style="background:${scopeColor}"></span>${highCount} / 10 dimensions</div>
      </div>
    </div>
  </div>

  <div class="section">
    <h2>Engineering Areas</h2>
    <table>
      <thead><tr><th>Area</th><th>Complexity</th><th>Potential Effort Driver</th></tr></thead>
      <tbody>
        ${engAreaRows.map((r) => `<tr><td>${r.name}</td><td>${r.complexity}</td><td>${r.driver}</td></tr>`).join('\n')}
      </tbody>
    </table>
  </div>

  <div class="section">
    <h2>Configuration Completeness</h2>
    <div class="completeness-grid">
      ${completenessChecks.map((s) => `<div class="completeness-item"><span class="completeness-icon ${s.configured ? 'check-yes' : 'check-no'}">${s.configured ? '\u2713' : '\u2717'}</span><span style="color:${s.configured ? '#1a1a1a' : '#999'}">${s.label}</span></div>`).join('\n')}
    </div>
    <p style="margin-top:8px;font-size:11px;color:#888;">${configuredCount} of ${completenessChecks.length} sections configured</p>
  </div>

  <div class="footer">
    Generated by B&R Engineering Estimation Tool &mdash; ${new Date().toLocaleDateString('de-AT')}
  </div>
</body>
</html>`;

            const blob = new Blob([html], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            window.open(url, '_blank');
            toast('Report opened in new tab \u2014 use Ctrl+P to save as PDF');
          }}
        >
          <FileText className="h-3.5 w-3.5" />
          Export as PDF
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 text-sm"
          onClick={() => {
            const hwHours = (c.io.digitalInputs + c.io.digitalOutputs + c.io.analogInputs + c.io.analogOutputs) * 0.5 + c.motion.totalAxes * 4;
            const swHours = c.hmi.screens * 8 + (c.vision.enabled ? c.vision.cameras * 16 : 0) + 40;
            const motionHours = c.motion.totalAxes * 6 + (c.motion.electronicCamming ? 20 : 0) + (c.motion.coordinatedMotion ? 16 : 0);
            const safetyHours = c.safety.enabled ? c.safety.safetyIOCount * 2 + 16 : 0;
            const integrationHours = (hwHours + swHours + motionHours + safetyHours) * 0.3;
            const totalHours = hwHours + swHours + motionHours + safetyHours + integrationHours;

            const hwDesignWeeks = 2;
            const swDevWeeks = Math.max(2, Math.ceil(c.hmi.screens / 3));
            const integrationWeeks = Math.max(2, Math.ceil(totalHours / 40));
            const complexityMap: Record<string, number> = { Low: 1, Medium: 2, High: 3, 'Very High': 4 };
            const commissionWeeks = complexityMap[overallComplexity] || 2;
            const totalWeeks = hwDesignWeeks + swDevWeeks + integrationWeeks + commissionWeeks;

            const report = [
              `B&R Engineering Estimation Report`,
              `${'='.repeat(50)}`,
              `Project: ${c.project.name || 'Untitled Project'}`,
              `Customer: ${c.project.customer || 'N/A'}`,
              `Machine Type: ${c.project.machineType || 'N/A'}`,
              `Industry: ${c.project.industry || 'N/A'}`,
              `Date: ${new Date().toLocaleDateString()}`,
              ``,
              `COMPLEXITY ASSESSMENT`,
              `${'-'.repeat(50)}`,
              `Overall: ${overallComplexity}`,
              `  ${highCount} of 10 dimensions rated High or Very High`,
              `  Hardware: ${c.complexity.hardware} | Motion: ${c.complexity.motion} | HMI: ${c.complexity.hmi}`,
              `  Vision: ${c.complexity.vision} | Safety: ${c.complexity.safety} | Communication: ${c.complexity.communication}`,
              `  Software: ${c.complexity.software} | Integration: ${c.complexity.integration} | Testing: ${c.complexity.testing}`,
              ``,
              `EFFORT BREAKDOWN (Estimated Hours)`,
              `${'-'.repeat(50)}`,
              `  Hardware Engineering:     ${hwHours.toFixed(1)}h`,
              `  Software Development:     ${swHours.toFixed(1)}h`,
              `  Motion Configuration:     ${motionHours.toFixed(1)}h`,
              `  Safety Engineering:       ${safetyHours.toFixed(1)}h`,
              `  Integration & Testing:    ${integrationHours.toFixed(1)}h`,
              `${'-'.repeat(50)}`,
              `  TOTAL:                    ${totalHours.toFixed(1)}h`,
              ``,
              `TIMELINE SUMMARY`,
              `${'-'.repeat(50)}`,
              `  Hardware Design & Ordering:  ${hwDesignWeeks} weeks`,
              `  Software Development:          ${swDevWeeks} weeks`,
              `  Integration & Testing:         ${integrationWeeks} weeks`,
              `  Commissioning & Handover:      ${commissionWeeks} weeks`,
              `${'-'.repeat(50)}`,
              `  ESTIMATED TOTAL:               ${totalWeeks} weeks`,
              ``,
              `Generated by B&R Engineering Estimation Tool`,
            ].join('\n');

            navigator.clipboard.writeText(report);
            toast('Report copied to clipboard');
          }}
        >
          <Share2 className="h-3.5 w-3.5" />
          Share Report
        </Button>
      </motion.div>

      {/* Overall Complexity */}
      <SectionCard title="Overall Project Complexity">
        <div className="flex items-center gap-4">
          <span className={`text-base font-bold rounded-lg border-2 px-4 py-2 ${COMPLEXITY_COLORS[overallComplexity]} ${overallComplexity === 'Very High' ? 'animate-pulse' : ''}`}>
            {overallComplexity.toUpperCase()}
          </span>
          <div className="text-sm text-muted-foreground leading-relaxed">
            Based on the configured parameters, the overall engineering complexity is assessed as <strong className="text-foreground">{overallComplexity}</strong>.<br />
            {highCount} out of 10 complexity dimensions are rated High or Very High.
          </div>
        </div>
      </SectionCard>

      {/* Configuration Completeness */}
      <SectionCard title="Configuration Completeness" description={`${configuredCount} of ${completeness.length} sections configured`}>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {completeness.map((section) => (
            <div
              key={section.label}
              className="flex items-center gap-2 text-sm"
            >
              {section.configured ? (
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/50">
                  <Check className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                </div>
              ) : (
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-muted">
                  <Minus className="h-3 w-3 text-muted-foreground" />
                </div>
              )}
              <span className={section.configured ? 'font-medium text-foreground' : 'text-muted-foreground'}>
                {section.label}
              </span>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Risk Assessment */}
      <SectionCard title="Risk Assessment" description="Key risk indicators for the current configuration.">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {(() => {
            const clarity = c.project.requirementClarity || 'Mostly Clear';
            const clarityColorMap: Record<string, string> = {
              Clear: 'bg-emerald-500',
              'Mostly Clear': 'bg-amber-500',
              'Partially Clear': 'bg-orange-500',
              Unclear: 'bg-red-500',
            };
            const clarityTextMap: Record<string, string> = {
              Clear: 'text-emerald-600 dark:text-emerald-400',
              'Mostly Clear': 'text-amber-600 dark:text-amber-400',
              'Partially Clear': 'text-orange-600 dark:text-orange-400',
              Unclear: 'text-red-600 dark:text-red-400',
            };
            return (
              <div className="rounded-lg border border-border bg-card p-3">
                <div className="text-sm text-muted-foreground mb-2">Requirement Clarity</div>
                <div className="flex items-center gap-2">
                  <span className={`h-2.5 w-2.5 rounded-full ${clarityColorMap[clarity] || 'bg-muted-foreground'}`} />
                  <span className={`text-sm font-semibold ${clarityTextMap[clarity] || 'text-foreground'}`}>{clarity}</span>
                </div>
              </div>
            );
          })()}
          {(() => {
            const involvement = c.project.customerInvolvement || 'Medium';
            const involvementColorMap: Record<string, string> = {
              Low: 'bg-red-500',
              Medium: 'bg-amber-500',
              High: 'bg-emerald-500',
            };
            const involvementTextMap: Record<string, string> = {
              Low: 'text-red-600 dark:text-red-400',
              Medium: 'text-amber-600 dark:text-amber-400',
              High: 'text-emerald-600 dark:text-emerald-400',
            };
            return (
              <div className="rounded-lg border border-border bg-card p-3">
                <div className="text-sm text-muted-foreground mb-2">Customer Involvement</div>
                <div className="flex items-center gap-2">
                  <span className={`h-2.5 w-2.5 rounded-full ${involvementColorMap[involvement] || 'bg-muted-foreground'}`} />
                  <span className={`text-sm font-semibold ${involvementTextMap[involvement] || 'text-foreground'}`}>{involvement}</span>
                </div>
              </div>
            );
          })()}
          <div className="rounded-lg border border-border bg-card p-3">
            <div className="text-sm text-muted-foreground mb-2">Scope Complexity</div>
            <div className="text-sm font-semibold text-foreground mb-2">{highCount}/10 dimensions</div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className={`h-2 rounded-full transition-all duration-500 ${highCount >= 5 ? 'bg-red-400' : highCount >= 3 ? 'bg-orange-400' : highCount >= 1 ? 'bg-amber-400' : 'bg-emerald-400'}`}
                style={{ width: `${(highCount / 10) * 100}%` }}
              />
            </div>
            <div className="text-sm text-muted-foreground mt-1">High or Very High</div>
          </div>
        </div>
      </SectionCard>

      {/* Complexity Profile */}
      <SectionCard title="Complexity Profile" description="Visual breakdown of complexity across all 10 engineering dimensions.">
        <div className="space-y-2">
          {COMPLEXITY_DIMENSIONS.map((dim, index) => {
            const level = c.complexity[dim.key];
            return (
              <motion.div
                key={dim.key}
                className="flex items-center gap-3"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.04, duration: 0.3 }}
              >
                <div className="w-28 shrink-0 text-sm text-muted-foreground text-right pr-3">
                  {dim.label}
                </div>
                <div className="flex-1 h-5 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-5 rounded-full transition-all duration-500 ${COMPLEXITY_BAR_COLORS[level]}`}
                    style={{ width: COMPLEXITY_WIDTH[level] }}
                  />
                </div>
                <div className={`w-20 shrink-0 text-sm font-semibold ${COMPLEXITY_TEXT_COLORS[level]}`}>
                  {level}
                </div>
              </motion.div>
            );
          })}
        </div>
      </SectionCard>

      {/* Engineering Effort Overview */}
      <SectionCard title="Engineering Effort Overview" description="Estimated engineering hours based on configuration.">
        <div className="space-y-3">
          {(() => {
            const hwHours = (c.io.digitalInputs + c.io.digitalOutputs + c.io.analogInputs + c.io.analogOutputs) * 0.5 + c.motion.totalAxes * 4;
            const swHours = c.hmi.screens * 8 + (c.vision.enabled ? c.vision.cameras * 16 : 0) + 40;
            const motionHours = c.motion.totalAxes * 6 + (c.motion.electronicCamming ? 20 : 0) + (c.motion.coordinatedMotion ? 16 : 0);
            const safetyHours = c.safety.enabled ? c.safety.safetyIOCount * 2 + 16 : 0;
            const integrationHours = (hwHours + swHours + motionHours + safetyHours) * 0.3;
            const totalHours = hwHours + swHours + motionHours + safetyHours + integrationHours;
            const maxHours = Math.max(totalHours, 1);
            const rows = [
              { name: 'Hardware Engineering', hours: hwHours, color: 'bg-blue-400' },
              { name: 'Software Development', hours: swHours, color: 'bg-violet-400' },
              { name: 'Motion Configuration', hours: motionHours, color: 'bg-orange-400' },
              { name: 'Safety Engineering', hours: safetyHours, color: 'bg-red-400' },
              { name: 'Integration & Testing', hours: integrationHours, color: 'bg-emerald-400' },
            ];
            return (
              <>
                {rows.map((row, index) => (
                  <motion.div
                    key={row.name}
                    className="flex items-center gap-3"
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.06, duration: 0.3 }}
                  >
                    <div className="w-40 shrink-0 text-sm text-muted-foreground">{row.name}</div>
                    <div className="flex-1">
                      <div className="h-4 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-4 rounded-full ${row.color} transition-all duration-500`}
                          style={{ width: `${Math.max((row.hours / maxHours) * 100, 2)}%` }}
                        />
                      </div>
                      <div className="h-1.5 bg-muted/50 rounded-full overflow-hidden mt-1">
                        <div
                          className={`h-1.5 rounded-full ${row.color} opacity-60 transition-all duration-500`}
                          style={{ width: `${Math.max((row.hours / maxHours) * 100, 2)}%` }}
                        />
                      </div>
                    </div>
                    <div className="w-16 shrink-0 text-sm font-semibold text-right text-foreground">{row.hours.toFixed(1)}h</div>
                  </motion.div>
                ))}
                <motion.div
                  className="flex items-center gap-3 border-t border-border pt-2 mt-1"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: rows.length * 0.06, duration: 0.3 }}
                >
                  <div className="w-40 shrink-0 text-sm font-bold text-primary">Total</div>
                  <div className="flex-1 h-4 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-4 rounded-full bg-primary transition-all duration-500"
                      style={{ width: '100%' }}
                    />
                  </div>
                  <div className="w-16 shrink-0 text-sm font-bold text-right text-primary">{totalHours.toFixed(1)}h</div>
                </motion.div>
              </>
            );
          })()}
          <p className="text-sm text-muted-foreground mt-2">Estimated engineering hours based on configuration complexity. Actual effort may vary.</p>
        </div>
      </SectionCard>

      {/* Estimated Project Timeline */}
      <SectionCard title="Estimated Project Timeline" description="Gantt-like view of project phases.">
        <div className="space-y-3">
          {(() => {
            const hwHours = (c.io.digitalInputs + c.io.digitalOutputs + c.io.analogInputs + c.io.analogOutputs) * 0.5 + c.motion.totalAxes * 4;
            const swHours = c.hmi.screens * 8 + (c.vision.enabled ? c.vision.cameras * 16 : 0) + 40;
            const motionHours = c.motion.totalAxes * 6 + (c.motion.electronicCamming ? 20 : 0) + (c.motion.coordinatedMotion ? 16 : 0);
            const safetyHours = c.safety.enabled ? c.safety.safetyIOCount * 2 + 16 : 0;
            const totalHours = hwHours + swHours + motionHours + safetyHours + (hwHours + swHours + motionHours + safetyHours) * 0.3;

            const hwDesignWeeks = 2;
            const swDevWeeks = Math.max(2, Math.ceil(c.hmi.screens / 3));
            const integrationWeeks = Math.max(2, Math.ceil(totalHours / 40));
            const complexityMap: Record<string, number> = { Low: 1, Medium: 2, High: 3, 'Very High': 4 };
            const commissionWeeks = complexityMap[overallComplexity] || 2;
            const totalWeeks = hwDesignWeeks + swDevWeeks + integrationWeeks + commissionWeeks;
            const maxWeeks = 8;

            const phases = [
              { name: 'Hardware Design & Ordering', weeks: hwDesignWeeks, color: 'bg-blue-400', dotColor: 'bg-blue-400' },
              { name: 'Software Development', weeks: swDevWeeks, color: 'bg-amber-400', dotColor: 'bg-emerald-400' },
              { name: 'Integration & Testing', weeks: integrationWeeks, color: 'bg-orange-400', dotColor: 'bg-amber-400' },
              { name: 'Commissioning & Handover', weeks: commissionWeeks, color: 'bg-emerald-400', dotColor: 'bg-primary' },
            ];

            return (
              <>
                {phases.map((phase, index) => (
                  <motion.div
                    key={phase.name}
                    className="relative flex items-center gap-3"
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.08, duration: 0.3 }}
                  >
                    {index > 0 && (
                      <span className="absolute -top-2 left-40 text-sm text-muted-foreground/40 leading-none">◆</span>
                    )}
                    <div className="w-36 shrink-0 flex items-center gap-2 text-sm text-muted-foreground">
                      <span className={`w-2 h-2 rounded-full ${phase.dotColor} shrink-0`} />
                      {phase.name}
                    </div>
                    <div className="flex-1 h-5 bg-muted rounded-sm overflow-hidden">
                      <div
                        className={`h-5 rounded-sm ${phase.color} transition-all duration-500`}
                        style={{ width: `${(phase.weeks / maxWeeks) * 100}%` }}
                      />
                    </div>
                    <div className="w-16 shrink-0 text-sm font-medium text-right text-foreground">{phase.weeks} week{phase.weeks !== 1 ? 's' : ''}</div>
                  </motion.div>
                ))}
                <motion.div
                  className="flex items-center gap-3 border-t border-border pt-2 mt-1"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: phases.length * 0.08, duration: 0.3 }}
                >
                  <div className="w-36 shrink-0 text-sm font-bold text-primary">Estimated Total</div>
                  <div className="flex-1" />
                  <div className="w-16 shrink-0 text-sm font-bold text-right text-primary">{totalWeeks} weeks</div>
                </motion.div>
              </>
            );
          })()}
        </div>
      </SectionCard>

      {/* Effort Areas */}
      <SectionCard title="Engineering Areas" description="Potential effort drivers by engineering domain.">
        <div className="overflow-x-auto -mx-4 px-4">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left text-sm font-semibold text-muted-foreground pb-2 pr-4">Area</th>
                <th className="text-left text-sm font-semibold text-muted-foreground pb-2 pr-4">Complexity</th>
                <th className="text-left text-sm font-semibold text-muted-foreground pb-2">Potential Effort Driver</th>
              </tr>
            </thead>
            <tbody>
              {EFFORT_AREAS.map((area) => {
                const complexity = areaComplexities[area.name] || 'Medium';
                return (
                  <tr key={area.name} className="border-b border-border/50 last:border-0">
                    <td className="py-2.5 pr-4 text-sm font-medium text-foreground">{area.name}</td>
                    <td className="py-2.5 pr-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-[2px] h-5 rounded-full ${COMPLEXITY_DOT_COLORS[complexity]}`} />
                        <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold ${COMPLEXITY_COLORS[complexity]}`}>
                          {complexity}
                        </span>
                      </div>
                    </td>
                    <td className="py-2.5 text-sm text-muted-foreground">{area.driver}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </SectionCard>

      {/* Domain Model */}
      <SectionCard title="Product Architecture Flow">
        <div className="flex flex-wrap items-center gap-2">
          {['B&R Product', 'Technology', 'Engineering Function', 'Configuration', 'Programming', 'Integration', 'Testing', 'Commissioning', 'Complexity', 'Engineering Effort'].map((item, idx, arr) => (
            <React.Fragment key={item}>
              <div className="rounded-md border border-border bg-card px-3 py-1.5 text-sm font-medium text-foreground">
                {item}
              </div>
              {idx < arr.length - 1 && <ArrowRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />}
            </React.Fragment>
          ))}
        </div>
      </SectionCard>

      {/* Placeholder Notice */}
      <div className="flex items-start gap-3 rounded-md border border-amber-200 dark:border-amber-900/50 bg-amber-50/50 dark:bg-amber-950/20 p-4">
        <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div className="text-sm text-amber-800 dark:text-amber-200 leading-relaxed space-y-1">
          <p><strong>Engineering effort calculation will be connected to validated company data in a future version.</strong></p>
          <p>This prototype demonstrates technical configuration and complexity assessment. Actual engineering hours require backend integration with historical project data and validated estimation formulas.</p>
        </div>
      </div>

      {/* Version Info */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Current version: technical configuration prototype
        </div>
        <Button
          variant="outline"
          size="sm"
          className="h-9 gap-1.5 text-sm"
          onClick={() => { setWizardStep(13); setCurrentPage('new-estimate'); }}
        >
          Edit Configuration
        </Button>
      </div>
    </motion.div>
  );
}
