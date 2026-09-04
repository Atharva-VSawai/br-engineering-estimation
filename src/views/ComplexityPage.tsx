'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { SectionCard } from '@/components/br/SectionCard';
import { useAppStore } from '@/store';
import { ComplexityBadge } from '@/components/br/ComplexityBadge';
import type { ComplexityLevel } from '@/types';

type ComplexityKey = 'hardware' | 'motion' | 'hmi' | 'vision' | 'safety' | 'communication' | 'software' | 'integration' | 'requirement' | 'testing';

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
  Low: 'bg-emerald-100 dark:bg-emerald-900/40',
  Medium: 'bg-amber-100 dark:bg-amber-900/40',
  High: 'bg-orange-100 dark:bg-orange-900/40',
  'Very High': 'bg-red-100 dark:bg-red-900/40',
};

const BORDER_COLORS: Record<ComplexityLevel, string> = {
  Low: 'border-l-emerald-400',
  Medium: 'border-l-amber-400',
  High: 'border-l-orange-400',
  'Very High': 'border-l-red-400',
};

const LEVEL_MAP: Record<ComplexityLevel, number> = {
  Low: 1,
  Medium: 2,
  High: 3,
  'Very High': 4,
};

function getScoreColor(score: number): string {
  if (score <= 25) return '#10b981';
  if (score <= 50) return '#f59e0b';
  if (score <= 75) return '#f97316';
  return '#ef4444';
}

function getScoreLabel(score: number): string {
  if (score <= 25) return 'Low';
  if (score <= 50) return 'Moderate';
  if (score <= 75) return 'High';
  return 'Critical';
}

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

  const { overallScore, highestDim, lowestDim } = useMemo(() => {
    const values = categories.map((cat) => ({
      label: cat.label.replace(' Complexity', ''),
      level: c[cat.key] as ComplexityLevel,
      numeric: LEVEL_MAP[c[cat.key] as ComplexityLevel],
    }));

    const avg = values.reduce((sum, v) => sum + v.numeric, 0) / values.length;
    const score = Math.round(avg * 25);

    const sorted = [...values].sort((a, b) => b.numeric - a.numeric);
    return {
      overallScore: score,
      highestDim: sorted[0],
      lowestDim: sorted[sorted.length - 1],
    };
  }, [c, categories]);

  const scoreColor = getScoreColor(overallScore);
  const scoreLabel = getScoreLabel(overallScore);


  const startAngle = 150;
  const endAngle = 390;
  const sweepAngle = endAngle - startAngle;
  const scoreAngle = startAngle + (overallScore / 100) * sweepAngle;


  const polarToCartesian = (cx: number, cy: number, r: number, angleDeg: number) => {
    const rad = ((angleDeg - 90) * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  };

  const radius = 54;
  const cx = 70;
  const cy = 70;
  const strokeW = 10;

  const bgStart = polarToCartesian(cx, cy, radius, startAngle);
  const bgEnd = polarToCartesian(cx, cy, radius, endAngle);
  const largeArcBg = sweepAngle > 180 ? 1 : 0;
  const bgPath = `M ${bgStart.x} ${bgStart.y} A ${radius} ${radius} 0 ${largeArcBg} 1 ${bgEnd.x} ${bgEnd.y}`;

  const fgEnd = polarToCartesian(cx, cy, radius, scoreAngle);
  const fgSweep = scoreAngle - startAngle;
  const largeArcFg = fgSweep > 180 ? 1 : 0;
  const fgPath = fgSweep > 0.5
    ? `M ${bgStart.x} ${bgStart.y} A ${radius} ${radius} 0 ${largeArcFg} 1 ${fgEnd.x} ${fgEnd.y}`
    : '';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-bold text-foreground">Complexity Overview</h1>
        <p className="text-sm text-muted-foreground">
          Engineering complexity assessment across all domains.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="rounded-md border border-border bg-card p-3 text-center">
          <div className="text-sm text-muted-foreground uppercase tracking-wide">Dimensions</div>
          <div className="text-xl font-bold text-foreground mt-1">10</div>
        </div>
        <div className="rounded-md border border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-950/20 p-3 text-center">
          <div className="text-sm text-red-600 dark:text-red-400 uppercase tracking-wide">High / Very High</div>
          <div className="text-xl font-bold text-red-700 dark:text-red-300 mt-1">{highCount}</div>
        </div>
        <div className="rounded-md border border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20 p-3 text-center">
          <div className="text-sm text-amber-600 dark:text-amber-400 uppercase tracking-wide">Medium</div>
          <div className="text-xl font-bold text-amber-700 dark:text-amber-300 mt-1">{allComplexities.filter((x) => x === 'Medium').length}</div>
        </div>
        <div className="rounded-md border border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20 p-3 text-center">
          <div className="text-sm text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">Low</div>
          <div className="text-xl font-bold text-emerald-700 dark:text-emerald-300 mt-1">{allComplexities.filter((x) => x === 'Low').length}</div>
        </div>
        <div className="rounded-md border border-border bg-card p-3 text-center">
          <div className="text-sm text-muted-foreground uppercase tracking-wide">Requirement Clarity</div>
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
                <div className="text-sm uppercase tracking-wide text-muted-foreground">{item.short}</div>
                <div className="text-sm font-bold mt-1">{level}</div>
                <div className="mt-1.5 h-1 rounded-full bg-black/5 dark:bg-white/5 overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${LEVEL_MAP[level] * 25}%`,
                      backgroundColor: level === 'Low' ? '#10b981' : level === 'Medium' ? '#f59e0b' : level === 'High' ? '#f97316' : '#ef4444',
                    }}
                  />
                </div>
              </motion.div>
            );
          })}
        </div>
      </SectionCard>

      <SectionCard title="Overall Complexity Assessment">
        <div className="flex flex-col sm:flex-row items-center gap-8">
          <div className="flex flex-col items-center shrink-0">
            <div className="relative">
              <svg width={140} height={140} viewBox="0 0 140 140">
                <path
                  d={bgPath}
                  fill="none"
                  stroke="hsl(var(--muted))"
                  strokeWidth={strokeW}
                  strokeLinecap="round"
                />
                {fgPath && (
                  <motion.path
                    d={fgPath}
                    fill="none"
                    stroke={scoreColor}
                    strokeWidth={strokeW}
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                  />
                )}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <motion.div
                  className="text-2xl font-bold text-foreground"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.3 }}
                >
                  {overallScore}
                </motion.div>
                <div className="text-sm text-muted-foreground">Complexity Score</div>
              </div>
            </div>
            <div
              className="mt-2 rounded-full px-3 py-0.5 text-sm font-medium"
              style={{ backgroundColor: scoreColor + '18', color: scoreColor }}
            >
              {scoreLabel}
            </div>
          </div>
          <div className="flex-1 w-full">
            <div className="rounded-md border border-border overflow-hidden">
              <table className="w-full">
                <tbody>
                  <tr className="border-b border-border">
                    <td className="text-sm text-muted-foreground py-2.5 px-3 bg-muted/30 font-medium">Highest Complexity</td>
                    <td className="text-sm font-semibold text-foreground py-2.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <span>{highestDim.label}</span>
                        <ComplexityBadge level={highestDim.level} />
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td className="text-sm text-muted-foreground py-2.5 px-3 bg-muted/30 font-medium">Lowest Complexity</td>
                    <td className="text-sm font-semibold text-foreground py-2.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <span>{lowestDim.label}</span>
                        <ComplexityBadge level={lowestDim.level} />
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Complexity Dimensions">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8">
          {categories.map((cat, index) => (
            <div key={cat.key} className={`flex items-center justify-between py-2 border-b border-border/50 last:border-0 ${index % 2 === 0 ? 'bg-muted/20 -mx-4 px-4' : '-mx-4 px-4'}`}>
              <div>
                <div className="text-sm font-medium text-foreground">{cat.label}</div>
                <div className="text-sm text-muted-foreground">{cat.description}</div>
              </div>
              <ComplexityBadge level={c[cat.key]} />
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Project Context">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <div className="text-sm text-muted-foreground uppercase tracking-wide">Reuse Level</div>
            <div className="text-sm font-bold text-foreground mt-1">{c.reuseLevel}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground uppercase tracking-wide">Change Frequency</div>
            <div className="text-sm font-bold text-foreground mt-1">{c.customerChangeFrequency}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground uppercase tracking-wide">Product Variants</div>
            <div className="text-sm font-bold text-foreground mt-1">{c.productVariants}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground uppercase tracking-wide">Machine Stations</div>
            <div className="text-sm font-bold text-foreground mt-1">{c.machineStations}</div>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}