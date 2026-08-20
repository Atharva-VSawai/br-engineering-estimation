'use client';

import React from 'react';
import { AlertTriangle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SectionCard } from '@/components/br/SectionCard';
import { useAppStore } from '@/store';
import { EFFORT_AREAS } from '@/data';
import type { ComplexityLevel } from '@/types';

const COMPLEXITY_COLORS: Record<ComplexityLevel, string> = {
  Low: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Medium: 'bg-amber-50 text-amber-700 border-amber-200',
  High: 'bg-orange-50 text-orange-700 border-orange-200',
  'Very High': 'bg-red-50 text-red-700 border-red-200',
};

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

  return (
    <div className="space-y-6">
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
                      <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-semibold ${COMPLEXITY_COLORS[complexity]}`}>
                        {complexity}
                      </span>
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
    </div>
  );
}
