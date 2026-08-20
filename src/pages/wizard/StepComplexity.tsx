'use client';

import React from 'react';
import { SectionCard } from '@/components/br/SectionCard';
import { useAppStore } from '@/store';
import type { ComplexityLevel } from '@/types';

const COMPLEXITY_LEVELS: ComplexityLevel[] = ['Low', 'Medium', 'High', 'Very High'];

export function StepComplexity() {
  const { config, updateComplexity } = useAppStore();
  const c = config.complexity;

  const categories = [
    { key: 'hardware' as const, label: 'Hardware Complexity' },
    { key: 'motion' as const, label: 'Motion Complexity' },
    { key: 'hmi' as const, label: 'HMI Complexity' },
    { key: 'vision' as const, label: 'Vision Complexity' },
    { key: 'safety' as const, label: 'Safety Complexity' },
    { key: 'communication' as const, label: 'Communication Complexity' },
    { key: 'software' as const, label: 'Software Complexity' },
    { key: 'integration' as const, label: 'Integration Complexity' },
    { key: 'requirement' as const, label: 'Requirement Complexity' },
    { key: 'testing' as const, label: 'Testing Complexity' },
  ];

  return (
    <div className="space-y-4">
      <SectionCard title="Step 13 — Complexity Assessment" description="Assess engineering complexity across all domains.">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8">
          {categories.map(({ key, label }) => (
            <div key={key} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
              <span className="text-xs font-medium text-foreground">{label}</span>
              <div className="flex gap-1">
                {COMPLEXITY_LEVELS.map((level) => (
                  <button
                    key={level}
                    onClick={() => updateComplexity({ [key]: level })}
                    className={`rounded border px-2 py-0.5 text-[11px] font-medium transition-colors ${
                      c[key] === level
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border bg-card text-muted-foreground hover:border-primary/50'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SectionCard title="Project Context">
          <div className="space-y-3">
            <div>
              <div className="text-xs font-medium text-foreground mb-1.5">Requirement Clarity</div>
              <div className="flex gap-1.5">
                {(['Clear', 'Mostly Clear', 'Partially Clear', 'Unclear'] as const).map((level) => (
                  <button
                    key={level}
                    onClick={() => updateComplexity({ requirementClarity: level })}
                    className={`rounded border px-2 py-0.5 text-[11px] font-medium transition-colors ${
                      c.requirementClarity === level
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border bg-card text-muted-foreground hover:border-primary/50'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="text-xs font-medium text-foreground mb-1.5">Customer Change Frequency</div>
              <div className="flex gap-1.5">
                {(['Low', 'Medium', 'High'] as const).map((level) => (
                  <button
                    key={level}
                    onClick={() => updateComplexity({ customerChangeFrequency: level })}
                    className={`rounded border px-2 py-0.5 text-[11px] font-medium transition-colors ${
                      c.customerChangeFrequency === level
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border bg-card text-muted-foreground hover:border-primary/50'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="text-xs font-medium text-foreground mb-1.5">Reuse Level</div>
              <div className="flex gap-1.5">
                {(['High', 'Medium', 'Low'] as const).map((level) => (
                  <button
                    key={level}
                    onClick={() => updateComplexity({ reuseLevel: level })}
                    className={`rounded border px-2 py-0.5 text-[11px] font-medium transition-colors ${
                      c.reuseLevel === level
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border bg-card text-muted-foreground hover:border-primary/50'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Scope Metrics">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-foreground">Product Variants</span>
              <span className="text-sm font-bold text-foreground">{c.productVariants}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-foreground">Machine Stations</span>
              <span className="text-sm font-bold text-foreground">{c.machineStations}</span>
            </div>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
