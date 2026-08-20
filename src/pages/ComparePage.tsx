'use client';

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { GitCompareArrows, Check, X as XIcon } from 'lucide-react';
import { useAppStore } from '@/store';
import type { Project, ProjectConfig } from '@/types';
import { SectionCard } from '@/components/br/SectionCard';
import { ComplexityBadge } from '@/components/br/ComplexityBadge';
import { StatusBadge } from '@/components/br/ComplexityBadge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';

const COMPLEXITY_ORDER: Record<string, number> = { Low: 0, Medium: 1, High: 2, 'Very High': 3 };

function getConfigSummary(cfg: ProjectConfig) {
  const ioTotal =
    cfg.io.digitalInputs + cfg.io.digitalOutputs + cfg.io.analogInputs +
    cfg.io.analogOutputs + cfg.io.safetyIO + cfg.io.encoderCounterModules +
    cfg.io.temperatureModules + cfg.io.communicationIO + cfg.io.specialModules;
  return {
    controllerFamily: cfg.controller.family,
    ioTotal,
    motionAxes: cfg.motion.totalAxes,
    hmiScreens: cfg.hmi.screens,
    vision: cfg.vision.enabled,
    safety: cfg.safety.enabled,
  };
}

function getBestIndex(values: (string | number | boolean | null)[], type: 'highest' | 'lowest' | 'yes') {
  if (values.every((v) => v === null || v === undefined || v === '')) return -1;
  if (type === 'yes') {
    const idx = values.findIndex((v) => v === true);
    return idx;
  }
  if (type === 'highest') {
    let bestIdx = -1;
    let bestVal = -Infinity;
    values.forEach((v, i) => {
      if (typeof v === 'number' && v > bestVal) { bestVal = v; bestIdx = i; }
    });
    return bestIdx;
  }
  if (type === 'lowest') {
    let bestIdx = -1;
    let bestVal = Infinity;
    values.forEach((v, i) => {
      if (typeof v === 'number' && v < bestVal) { bestVal = v; bestIdx = i; }
    });
    return bestIdx;
  }
  return -1;
}

export function ComparePage() {
  const { projects } = useAppStore();
  const [selectedIds, setSelectedIds] = useState<(string | null)[]>([null, null, null]);

  const selectedProjects = useMemo(() => {
    return selectedIds
      .map((id) => (id ? projects.find((p) => p.id === id) || null : null))
      .filter(Boolean) as Project[];
  }, [selectedIds, projects]);

  const configs = useMemo(() => {
    return selectedProjects.map((p) => (p.config ? getConfigSummary(p.config) : null));
  }, [selectedProjects]);

  const handleSelect = (slotIndex: number, id: string) => {
    const newIds = [...selectedIds];
    newIds[slotIndex] = id;
    setSelectedIds(newIds);
  };

  const handleClear = (slotIndex: number) => {
    const newIds = [...selectedIds];
    newIds[slotIndex] = null;
    setSelectedIds(newIds);
  };

  const availableOptions = (slotIndex: number) => {
    const usedIds = selectedIds.filter((id, i) => id !== null && i !== slotIndex);
    return projects.filter((p) => !usedIds.includes(p.id));
  };

  const rows = useMemo(() => {
    if (selectedProjects.length < 2) return [];
    return [
      { label: 'Project Name', type: 'text' as const, getVal: (p: Project) => p.name },
      { label: 'Customer', type: 'text' as const, getVal: (p: Project) => p.customer },
      { label: 'Machine Type', type: 'text' as const, getVal: (p: Project) => p.machineType },
      { label: 'Complexity', type: 'complexity' as const, getVal: (p: Project) => p.complexity },
      { label: 'Status', type: 'status' as const, getVal: (p: Project) => p.status },
      { label: 'I/O Total', type: 'number-best-lowest' as const, getVal: (p: Project, cfg: ReturnType<typeof getConfigSummary> | null) => cfg?.ioTotal ?? null },
      { label: 'Motion Axes', type: 'number-best-lowest' as const, getVal: (p: Project, cfg: ReturnType<typeof getConfigSummary> | null) => cfg?.motionAxes ?? null },
      { label: 'HMI Screens', type: 'number-highest' as const, getVal: (p: Project, cfg: ReturnType<typeof getConfigSummary> | null) => cfg?.hmiScreens ?? null },
      { label: 'Vision', type: 'yes' as const, getVal: (p: Project, cfg: ReturnType<typeof getConfigSummary> | null) => cfg?.vision ?? null },
      { label: 'Safety', type: 'yes' as const, getVal: (p: Project, cfg: ReturnType<typeof getConfigSummary> | null) => cfg?.safety ?? null },
      { label: 'Controller Family', type: 'text' as const, getVal: (p: Project, cfg: ReturnType<typeof getConfigSummary> | null) => cfg?.controllerFamily ?? null },
    ];
  }, [selectedProjects.length]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <GitCompareArrows className="h-5 w-5 text-primary" />
          <h1 className="text-lg font-semibold text-foreground">Project Comparison</h1>
        </div>
        <p className="text-xs text-muted-foreground">Compare up to 3 projects side by side to evaluate scope, complexity, and technical parameters.</p>
      </div>

      {/* Selector Row */}
      <div className="flex flex-wrap gap-3">
        {selectedIds.map((id, slotIdx) => {
          const opts = availableOptions(slotIdx);
          const isFilled = id !== null;
          return (
            <div key={slotIdx} className="flex items-center gap-2">
              <Select
                value={id || ''}
                onValueChange={(v) => handleSelect(slotIdx, v)}
              >
                <SelectTrigger className="w-56 h-8 text-xs">
                  <SelectValue placeholder={`Project ${slotIdx + 1}`} />
                </SelectTrigger>
                <SelectContent>
                  {opts.map((p) => (
                    <SelectItem key={p.id} value={p.id} className="text-xs">
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {isFilled && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => handleClear(slotIdx)}
                >
                  <XIcon className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          );
        })}
      </div>

      {/* Empty state */}
      {selectedProjects.length < 2 && (
        <SectionCard>
          <div className="flex flex-col items-center justify-center py-12">
            <GitCompareArrows className="h-10 w-10 text-muted-foreground/30 mb-3" />
            <p className="text-sm text-muted-foreground">Select at least 2 projects to compare</p>
          </div>
        </SectionCard>
      )}

      {/* Comparison table */}
      {selectedProjects.length >= 2 && (
        <SectionCard title="Comparison Table" description={`${selectedProjects.length} projects selected`}>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr>
                  <th className="text-left py-2 px-3 font-medium text-muted-foreground w-36">Property</th>
                  {selectedProjects.map((p) => (
                    <th key={p.id} className="text-left py-2 px-3 font-semibold text-foreground">
                      {p.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => {
                  const values = selectedProjects.map((p, i) => {
                    const cfg = configs[i];
                    if (row.getVal.length === 1) return row.getVal(p);
                    return row.getVal(p, cfg);
                  });

                  let bestIdx = -1;
                  if (row.type === 'complexity') {
                    // For complexity, highest is the worst - highlight the lowest
                    const nums = values.map((v) => (typeof v === 'string' ? (COMPLEXITY_ORDER[v] ?? -1) : -1));
                    bestIdx = nums.indexOf(Math.min(...nums.filter((n) => n >= 0)));
                  } else if (row.type === 'number-highest') {
                    bestIdx = getBestIndex(values as (string | number | boolean | null)[], 'highest');
                  } else if (row.type === 'number-best-lowest') {
                    bestIdx = getBestIndex(values as (string | number | boolean | null)[], 'lowest');
                  } else if (row.type === 'yes') {
                    bestIdx = getBestIndex(values as (string | number | boolean | null)[], 'yes');
                  }

                  return (
                    <tr key={row.label} className="border-t border-border/50">
                      <td className="py-2 px-3 font-medium text-muted-foreground whitespace-nowrap">
                        {row.label}
                      </td>
                      {selectedProjects.map((p, i) => {
                        const val = values[i];
                        const isBest = i === bestIdx;
                        return (
                          <td
                            key={p.id}
                            className={`py-2 px-3 ${isBest ? 'bg-emerald-50/50 dark:bg-emerald-950/20' : ''}`}
                          >
                            {renderCell(row.type, val)}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </SectionCard>
      )}
    </motion.div>
  );
}

function renderCell(type: string, val: string | number | boolean | null) {
  if (val === null || val === undefined || val === '') {
    return <span className="text-muted-foreground">—</span>;
  }
  if (type === 'complexity') {
    return <ComplexityBadge level={val as import('@/types').ComplexityLevel} />;
  }
  if (type === 'status') {
    return <StatusBadge status={val as string} />;
  }
  if (type === 'yes') {
    if (val === true) {
      return (
        <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
          <Check className="h-3 w-3" /> Yes
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-red-400 dark:text-red-500 font-medium">
        <XIcon className="h-3 w-3" /> No
      </span>
    );
  }
  if (typeof val === 'number') {
    return <span className="font-medium text-foreground">{val}</span>;
  }
  return <span className="text-foreground">{String(val)}</span>;
}
