'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { SectionCard } from '@/components/br/SectionCard';
import { useAppStore } from '@/store';
import { ComplexityBadge } from '@/components/br/ComplexityBadge';

type ComplexityKey = 'hardware' | 'motion' | 'hmi' | 'vision' | 'safety' | 'communication' | 'software' | 'integration' | 'requirement' | 'testing';

type ComplexityLevel = 'Low' | 'Medium' | 'High' | 'Very High';

const HEATMAP_ITEMS: { key: ComplexityKey; short: string; label: string }[] = [
  { key: 'hardware', short: 'HW', label: 'Hardware' },
  { key: 'motion', short: 'MOT', label: 'Motion' },
  { key: 'hmi', short: 'HMI', label: 'HMI' },
  { key: 'vision', short: 'VIS', label: 'Vision' },
  { key: 'safety', short: 'SAFE', label: 'Safety' },
  { key: 'communication', short: 'COMM', label: 'Communication' },
  { key: 'software', short: 'SW', label: 'Software' },
  { key: 'integration', short: 'INT', label: 'Integration' },
  { key: 'requirement', short: 'REQ', label: 'Requirement' },
  { key: 'testing', short: 'TEST', label: 'Testing' },
];

const BG_COLORS: Record<ComplexityLevel, string> = {
  Low: 'bg-emerald-100',
  Medium: 'bg-amber-100',
  High: 'bg-orange-100',
  'Very High': 'bg-red-100',
};

const BORDER_COLORS: Record<ComplexityLevel, string> = {
  Low: 'border-l-emerald-400',
  Medium: 'border-l-amber-400',
  High: 'border-l-orange-400',
  'Very High': 'border-l-red-400',
};

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

      <SectionCard title="Complexity Heatmap">
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-2">
          {HEATMAP_ITEMS.map((item, index) => {
            const level = c[item.key] as ComplexityLevel;
            return (
              <motion.div
                key={item.key}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.03, duration: 0.2 }}
                className={`rounded-md p-2.5 border-l-[3px] ${BG_COLORS[level]} ${BORDER_COLORS[level]} hover:shadow-sm transition-shadow cursor-default`}
              >
                <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{item.short}</div>
                <div className="text-xs font-bold mt-1">{level}</div>
              </motion.div>
            );
          })}
        </div>
      </SectionCard>

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
