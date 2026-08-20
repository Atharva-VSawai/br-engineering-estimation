'use client';

import React from 'react';
import { SectionCard } from '@/components/br/SectionCard';
import { useAppStore } from '@/store';
import { ComplexityBadge } from '@/components/br/ComplexityBadge';

type ComplexityKey = 'hardware' | 'motion' | 'hmi' | 'vision' | 'safety' | 'communication' | 'software' | 'integration' | 'requirement' | 'testing';

export function ComplexityPage() {
  const { config } = useAppStore();
  const c = config.complexity;

  const categories: { key: ComplexityKey; label: string; description: string }[] = [
    { key: 'hardware', label: 'Hardware Complexity', description: 'Controller, I/O, drives, motors, mechatronics' },
    { key: 'motion', label: 'Motion Complexity', description: 'Axes, synchronization, camming, coordinated motion' },
    { key: 'hmi', label: 'HMI Complexity', description: 'Screens, features, user management' },
    { key: 'vision', label: 'Vision Complexity', description: 'Cameras, functions, integration' },
    { key: 'safety', label: 'Safety Complexity', description: 'Safety functions, validation, documentation' },
    { key: 'communication', label: 'Communication Complexity', description: 'Protocols, external integrations' },
    { key: 'software', label: 'Software Complexity', description: 'Additional features, state machines, logic' },
    { key: 'integration', label: 'Integration Complexity', description: 'System-wide integration and testing' },
    { key: 'requirement', label: 'Requirement Complexity', description: 'Clarity, variants, change frequency' },
    { key: 'testing', label: 'Testing Complexity', description: 'Testing scope, commissioning requirements' },
  ];

  const allComplexities = categories.map((cat) => c[cat.key]);
  const highCount = allComplexities.filter((x) => x === 'High' || x === 'Very High').length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-bold text-foreground">Complexity Overview</h1>
        <p className="text-sm text-muted-foreground">
          Engineering complexity assessment across all domains.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="rounded-md border border-border bg-white p-3 text-center">
          <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Dimensions</div>
          <div className="text-xl font-bold text-foreground mt-1">10</div>
        </div>
        <div className="rounded-md border border-red-200 bg-red-50/50 p-3 text-center">
          <div className="text-[10px] text-red-600 uppercase tracking-wide">High / Very High</div>
          <div className="text-xl font-bold text-red-700 mt-1">{highCount}</div>
        </div>
        <div className="rounded-md border border-amber-200 bg-amber-50/50 p-3 text-center">
          <div className="text-[10px] text-amber-600 uppercase tracking-wide">Medium</div>
          <div className="text-xl font-bold text-amber-700 mt-1">{allComplexities.filter((x) => x === 'Medium').length}</div>
        </div>
        <div className="rounded-md border border-emerald-200 bg-emerald-50/50 p-3 text-center">
          <div className="text-[10px] text-emerald-600 uppercase tracking-wide">Low</div>
          <div className="text-xl font-bold text-emerald-700 mt-1">{allComplexities.filter((x) => x === 'Low').length}</div>
        </div>
        <div className="rounded-md border border-border bg-white p-3 text-center">
          <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Requirement Clarity</div>
          <div className="text-sm font-bold text-foreground mt-1">{c.requirementClarity}</div>
        </div>
      </div>

      <SectionCard title="Complexity Dimensions">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8">
          {categories.map((cat) => (
            <div key={cat.key} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
              <div>
                <div className="text-xs font-medium text-foreground">{cat.label}</div>
                <div className="text-[11px] text-muted-foreground">{cat.description}</div>
              </div>
              <ComplexityBadge level={c[cat.key]} />
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Project Context">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Reuse Level</div>
            <div className="text-sm font-bold text-foreground mt-1">{c.reuseLevel}</div>
          </div>
          <div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Change Frequency</div>
            <div className="text-sm font-bold text-foreground mt-1">{c.customerChangeFrequency}</div>
          </div>
          <div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Product Variants</div>
            <div className="text-sm font-bold text-foreground mt-1">{c.productVariants}</div>
          </div>
          <div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Machine Stations</div>
            <div className="text-sm font-bold text-foreground mt-1">{c.machineStations}</div>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}