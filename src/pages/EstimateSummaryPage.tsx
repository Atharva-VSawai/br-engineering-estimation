'use client';

import React from 'react';
import { AlertTriangle, ArrowRight, Check, Minus } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { SectionCard } from '@/components/br/SectionCard';
import { useAppStore } from '@/store';
import { EFFORT_AREAS } from '@/data';
import type { ComplexityLevel, ProjectConfig } from '@/types';

const COMPLEXITY_COLORS: Record<ComplexityLevel, string> = {
  Low: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Medium: 'bg-amber-50 text-amber-700 border-amber-200',
  High: 'bg-orange-50 text-orange-700 border-orange-200',
  'Very High': 'bg-red-50 text-red-700 border-red-200',
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
  const { config, setCurrentPage, setWizardStep } = useAppStore();
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

      {/* Overall Complexity */}
      <SectionCard title="Overall Project Complexity">
        <div className="flex items-center gap-4">
          <span className={`text-base font-bold rounded-lg border-2 px-4 py-2 ${COMPLEXITY_COLORS[overallComplexity]}`}>
            {overallComplexity.toUpperCase()}
          </span>
          <div className="text-xs text-muted-foreground leading-relaxed">
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
              className="flex items-center gap-2 text-xs"
            >
              {section.configured ? (
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100">
                  <Check className="h-3 w-3 text-emerald-600" />
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
                <div className="w-28 shrink-0 text-xs text-muted-foreground text-right pr-3">
                  {dim.label}
                </div>
                <div className="flex-1 h-5 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-5 rounded-full transition-all duration-500 ${COMPLEXITY_BAR_COLORS[level]}`}
                    style={{ width: COMPLEXITY_WIDTH[level] }}
                  />
                </div>
                <div className={`w-20 shrink-0 text-xs font-semibold ${COMPLEXITY_TEXT_COLORS[level]}`}>
                  {level}
                </div>
              </motion.div>
            );
          })}
        </div>
      </SectionCard>

      {/* Effort Areas */}
      <SectionCard title="Engineering Areas" description="Potential effort drivers by engineering domain.">
        <div className="overflow-x-auto -mx-4 px-4">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left text-xs font-semibold text-muted-foreground pb-2 pr-4">Area</th>
                <th className="text-left text-xs font-semibold text-muted-foreground pb-2 pr-4">Complexity</th>
                <th className="text-left text-xs font-semibold text-muted-foreground pb-2">Potential Effort Driver</th>
              </tr>
            </thead>
            <tbody>
              {EFFORT_AREAS.map((area) => {
                const complexity = areaComplexities[area.name] || 'Medium';
                return (
                  <tr key={area.name} className="border-b border-border/50 last:border-0">
                    <td className="py-2.5 pr-4 text-xs font-medium text-foreground">{area.name}</td>
                    <td className="py-2.5 pr-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-[2px] h-5 rounded-full ${COMPLEXITY_DOT_COLORS[complexity]}`} />
                        <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-semibold ${COMPLEXITY_COLORS[complexity]}`}>
                          {complexity}
                        </span>
                      </div>
                    </td>
                    <td className="py-2.5 text-xs text-muted-foreground">{area.driver}</td>
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
              <div className="rounded-md border border-border bg-white px-3 py-1.5 text-[11px] font-medium text-foreground">
                {item}
              </div>
              {idx < arr.length - 1 && <ArrowRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />}
            </React.Fragment>
          ))}
        </div>
      </SectionCard>

      {/* Placeholder Notice */}
      <div className="flex items-start gap-3 rounded-md border border-amber-200 bg-amber-50/50 p-4">
        <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-800 leading-relaxed space-y-1">
          <p><strong>Engineering effort calculation will be connected to validated company data in a future version.</strong></p>
          <p>This prototype demonstrates technical configuration and complexity assessment. Actual engineering hours require backend integration with historical project data and validated estimation formulas.</p>
        </div>
      </div>

      {/* Version Info */}
      <div className="flex items-center justify-between">
        <div className="text-xs text-muted-foreground">
          Current version: technical configuration prototype
        </div>
        <Button
          variant="outline"
          size="sm"
          className="h-8 gap-1.5 text-xs"
          onClick={() => { setWizardStep(13); setCurrentPage('new-estimate'); }}
        >
          Edit Configuration
        </Button>
      </div>
    </motion.div>
  );
}
