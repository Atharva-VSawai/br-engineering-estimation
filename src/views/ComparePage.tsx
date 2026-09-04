'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GitCompareArrows, Check, X as XIcon, Trophy } from 'lucide-react';
import { useAppStore } from '@/store';
import type { Project, ProjectConfig, ComplexityLevel } from '@/types';
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

const COMPLEXITY_LEFT_BORDER: Record<ComplexityLevel, string> = {
  Low: 'border-l-emerald-400',
  Medium: 'border-l-amber-400',
  High: 'border-l-orange-400',
  'Very High': 'border-l-red-400',
};

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

type ComparisonRow = {
  label: string;
  type: 'text' | 'complexity' | 'status' | 'number-best-lowest' | 'number-highest' | 'yes';
  getVal: (project: Project, config: ReturnType<typeof getConfigSummary> | null) => string | number | boolean | null;
};

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

  const comparisonSections = useMemo((): { title: string; rows: ComparisonRow[] }[] => {
    if (selectedProjects.length < 2) return [];
    return [
      {
        title: 'General',
        rows: [
          { label: 'Project Name', type: 'text' as const, getVal: (p: Project) => p.name },
          { label: 'Customer', type: 'text' as const, getVal: (p: Project) => p.customer },
          { label: 'Machine Type', type: 'text' as const, getVal: (p: Project) => p.machineType },
          { label: 'Complexity', type: 'complexity' as const, getVal: (p: Project) => p.complexity },
          { label: 'Status', type: 'status' as const, getVal: (p: Project) => p.status },
        ],
      },
      {
        title: 'I/O Configuration',
        rows: [
          { label: 'I/O Total', type: 'number-best-lowest' as const, getVal: (_p: Project, cfg: ReturnType<typeof getConfigSummary> | null) => cfg?.ioTotal ?? null },
          { label: 'Motion Axes', type: 'number-best-lowest' as const, getVal: (_p: Project, cfg: ReturnType<typeof getConfigSummary> | null) => cfg?.motionAxes ?? null },
          { label: 'HMI Screens', type: 'number-highest' as const, getVal: (_p: Project, cfg: ReturnType<typeof getConfigSummary> | null) => cfg?.hmiScreens ?? null },
        ],
      },
      {
        title: 'System Features',
        rows: [
          { label: 'Vision', type: 'yes' as const, getVal: (_p: Project, cfg: ReturnType<typeof getConfigSummary> | null) => cfg?.vision ?? null },
          { label: 'Safety', type: 'yes' as const, getVal: (_p: Project, cfg: ReturnType<typeof getConfigSummary> | null) => cfg?.safety ?? null },
        ],
      },
      {
        title: 'Controller',
        rows: [
          { label: 'Controller Family', type: 'text' as const, getVal: (_p: Project, cfg: ReturnType<typeof getConfigSummary> | null) => cfg?.controllerFamily ?? null },
        ],
      },
    ];
  }, [selectedProjects.length]);

  const allRows = useMemo(() => comparisonSections.flatMap((s) => s.rows), [comparisonSections]);


  const winnerCounts = useMemo(() => {
    if (selectedProjects.length < 2) return [];
    const counts = new Array(selectedProjects.length).fill(0);
    allRows.forEach((row) => {
      const values = selectedProjects.map((p, i) => {
        const cfg = configs[i];
        return row.getVal(p, cfg);
      });

      let bestIdx = -1;
      if (row.type === 'complexity') {
        const nums = values.map((v) => (typeof v === 'string' ? (COMPLEXITY_ORDER[v] ?? -1) : -1));
        bestIdx = nums.indexOf(Math.min(...nums.filter((n) => n >= 0)));
      } else if (row.type === 'number-highest') {
        bestIdx = getBestIndex(values as (string | number | boolean | null)[], 'highest');
      } else if (row.type === 'number-best-lowest') {
        bestIdx = getBestIndex(values as (string | number | boolean | null)[], 'lowest');
      } else if (row.type === 'yes') {
        bestIdx = getBestIndex(values as (string | number | boolean | null)[], 'yes');
      }
      if (bestIdx >= 0) counts[bestIdx]++;
    });
    return counts;
  }, [selectedProjects, configs, allRows]);

  const maxWinnerCount = Math.max(...winnerCounts, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      {}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <GitCompareArrows className="h-5 w-5 text-primary" />
          <h1 className="text-lg font-semibold text-foreground">Project Comparison</h1>
        </div>
        <p className="text-sm text-muted-foreground">Compare up to 3 projects side by side to evaluate scope, complexity, and technical parameters.</p>
      </div>

      {}
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
                <SelectTrigger className="w-56 h-9 text-sm">
                  <SelectValue placeholder={`Project ${slotIdx + 1}`} />
                </SelectTrigger>
                <SelectContent>
                  {opts.map((p) => (
                    <SelectItem key={p.id} value={p.id} className="text-sm">
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

      {}
      {selectedProjects.length < 2 && (
        <SectionCard title="Comparison">
          <div className="relative flex flex-col items-center justify-center py-16 overflow-hidden">
            {}
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute rounded-full bg-muted-foreground/[0.04] dark:bg-muted-foreground/[0.06]"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{
                  opacity: [0.3, 0.6, 0.3],
                  scale: [0.8, 1.1, 0.8],
                }}
                transition={{
                  duration: 4 + i * 0.8,
                  repeat: Infinity,
                  delay: i * 0.5,
                  ease: 'easeInOut',
                }}
                style={{
                  width: 60 + i * 30,
                  height: 60 + i * 30,
                  top: `${10 + (i % 3) * 30}%`,
                  left: `${15 + (i % 2) * 50}%`,
                }}
              />
            ))}
            <div className="relative z-10 flex flex-col items-center gap-3">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted/50 text-muted-foreground/40">
                <GitCompareArrows className="h-8 w-8" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-muted-foreground">No projects selected for comparison</p>
                <p className="text-sm text-muted-foreground/70 mt-1 max-w-xs">
                  Choose at least 2 projects from the dropdown above. You can compare up to 3 projects side by side to evaluate scope, complexity, and technical parameters.
                </p>
              </div>
            </div>
          </div>
        </SectionCard>
      )}

      {}
      <AnimatePresence>
        {selectedProjects.length >= 2 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
          >
            {}
            <div className="grid gap-3 mb-4" style={{ gridTemplateColumns: `repeat(${selectedProjects.length}, minmax(0, 1fr))` }}>
              {selectedProjects.map((p) => (
                <div
                  key={p.id}
                  className={`rounded-lg border border-border bg-card p-3 border-l-2 ${COMPLEXITY_LEFT_BORDER[p.complexity] || 'border-l-primary'}`}
                >
                  <p className="text-sm font-semibold text-foreground truncate">{p.name}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <ComplexityBadge level={p.complexity} />
                    <StatusBadge status={p.status} />
                  </div>
                </div>
              ))}
            </div>

            <SectionCard title="Comparison Table" description={`${selectedProjects.length} projects selected`}>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/30">
                      <th className="text-left py-2 px-3 font-medium text-muted-foreground w-36">Property</th>
                      {selectedProjects.map((p) => (
                        <th key={p.id} className="text-left py-2 px-3 font-semibold text-foreground">
                          {p.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {comparisonSections.map((section) => (
                      <React.Fragment key={section.title}>
                        <tr className="bg-muted/20">
                          <td colSpan={selectedProjects.length + 1} className="py-1.5 px-3 text-sm font-semibold text-muted-foreground">
                            <span className="flex items-center gap-2">
                              {section.title}
                              <span className="rounded-full bg-muted text-sm px-1.5 py-0.5 font-medium">{section.rows.length}</span>
                            </span>
                          </td>
                        </tr>
                        {section.rows.map((row, rowIdx) => {
                          const values = selectedProjects.map((p, i) => {
                            const cfg = configs[i];
                              return row.getVal(p, cfg);
                          });

                          let bestIdx = -1;
                          if (row.type === 'complexity') {
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
                            <tr
                              key={row.label}
                              className={`border-t border-border/50 hover:bg-primary/[0.03] hover:border-l-2 hover:border-l-primary/30 transition-all duration-150 ${rowIdx % 2 === 1 ? 'bg-muted/20' : ''}`}
                            >
                              <td className="py-2 px-3 font-medium text-muted-foreground whitespace-nowrap">
                                {row.label}
                              </td>
                              {selectedProjects.map((p, i) => {
                                const val = values[i];
                                const isBest = i === bestIdx;
                                return (
                                  <td
                                    key={p.id}
                                    className={`py-2 px-3 ${isBest ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-l-2 border-l-emerald-400' : ''}`}
                                  >
                                    {isBest && <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500 mr-1.5 align-middle" />}
                                    {renderCell(row.type, val)}
                                  </td>
                                );
                              })}
                            </tr>
                          );
                        })}
                      </React.Fragment>
                    ))}

                    {}
                    <tr className="border-t-2 border-border bg-muted/30">
                      <td className="py-2.5 px-3 font-bold text-foreground whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5">
                          <Trophy className="h-3.5 w-3.5 text-amber-500" />
                          Winner
                        </span>
                      </td>
                      {selectedProjects.map((p, i) => {
                        const count = winnerCounts[i] || 0;
                        const isWinner = count === maxWinnerCount && count > 0;
                        return (
                          <td key={p.id} className="py-2.5 px-3">
                            <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-sm font-bold
${isWinner ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300' : 'bg-muted text-muted-foreground'}`}>
                              {count} best
                            </span>
                          </td>
                        );
                      })}
                    </tr>
                  </tbody>
                </table>
              </div>
            </SectionCard>

            {}
            {selectedProjects.length >= 2 && <ComplexityRadar projects={selectedProjects} />}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

const DIMENSIONS = ['hardware','motion','hmi','vision','safety','communication','software','integration','requirement','testing'] as const;

const COMPLEXITY_VALUE: Record<ComplexityLevel, number> = {
  Low: 1,
  Medium: 2,
  High: 3,
  'Very High': 4,
};

const PROJECT_COLORS = [
  { fill: 'rgba(249,115,22,0.2)', stroke: 'rgba(249,115,22,0.8)' },
  { fill: 'rgba(6,182,212,0.2)', stroke: 'rgba(6,182,212,0.8)' },
  { fill: 'rgba(168,85,247,0.2)', stroke: 'rgba(168,85,247,0.8)' },
];

const CX = 150;
const CY = 150;
const MAX_R = 110;

function vertex(i: number, n: number, r: number) {
  const angle = (2 * Math.PI * i) / n - Math.PI / 2;
  return { x: CX + r * Math.cos(angle), y: CY + r * Math.sin(angle) };
}

function polygonPoints(r: number, n: number) {
  return Array.from({ length: n }, (_, i) => {
    const v = vertex(i, n, r);
    return `${v.x},${v.y}`;
  }).join(' ');
}

function ComplexityRadar({ projects }: { projects: Project[] }) {
  const N = DIMENSIONS.length;
  const [tooltip, setTooltip] = useState<{ x: number; y: number; dim: string; value: string; color: string } | null>(null);

  const projectPolygons = useMemo(() => {
    return projects.map((p) => {
      const assessment = p.config?.complexity;
      return DIMENSIONS.map((dim, i) => {
        const level: ComplexityLevel = assessment?.[dim] ?? 'Medium';
        const val = COMPLEXITY_VALUE[level];
        const r = (val / 4) * MAX_R;
        const v = vertex(i, N, r);
        return `${v.x},${v.y}`;
      }).join(' ');
    });
  }, [projects]);

  const ringPoints = useMemo(() => {
    return [0.25, 0.5, 0.75, 1].map((pct) => polygonPoints(MAX_R * pct, N));
  }, []);

  const labelPositions = useMemo(() => {
    return DIMENSIONS.map((dim, i) => {
      const v = vertex(i, N, MAX_R + 14);
      return { dim, x: v.x, y: v.y };
    });
  }, []);

  const axisLines = useMemo(() => {
    return Array.from({ length: N }, (_, i) => {
      const v = vertex(i, N, MAX_R);
      return `${CX},${CY} ${v.x},${v.y}`;
    });
  }, []);

  return (
    <SectionCard title="Complexity Radar" description="Multi-dimensional complexity comparison across engineering disciplines">
      <div className="flex flex-col items-center gap-4">
        <svg viewBox="0 0 300 300" className="w-full max-w-[300px]">
          {}
          {ringPoints.map((pts, idx) => (
            <polygon
              key={`ring-${idx}`}
              points={pts}
              fill="none"
              stroke="currentColor"
              className="text-muted-foreground/20"
              strokeWidth={0.5}
            />
          ))}
          {}
          {axisLines.map((line, idx) => (
            <line
              key={`axis-${idx}`}
              x1={Number(line.split(' ')[0].split(',')[0])}
              y1={Number(line.split(' ')[0].split(',')[1])}
              x2={Number(line.split(' ')[1].split(',')[0])}
              y2={Number(line.split(' ')[1].split(',')[1])}
              stroke="currentColor"
              className="text-muted-foreground/20"
              strokeWidth={0.5}
            />
          ))}
          {}
          {projectPolygons.map((pts, idx) => (
            <polygon
              key={`project-${idx}`}
              points={pts}
              fill={PROJECT_COLORS[idx % PROJECT_COLORS.length].fill}
              stroke={PROJECT_COLORS[idx % PROJECT_COLORS.length].stroke}
              strokeWidth={2}
            />
          ))}
          {}
          {projectPolygons.map((pts, idx) => {
            const points = pts.split(' ');
            return points.map((pt, ptIdx) => {
              const [px, py] = pt.split(',').map(Number);
              const dim = DIMENSIONS[ptIdx];
              const level = projects[idx]?.config?.complexity?.[dim] ?? 'Medium';
              return (
                <circle
                  key={`point-${idx}-${ptIdx}`}
                  cx={px}
                  cy={py}
                  r={4}
                  fill={PROJECT_COLORS[idx % PROJECT_COLORS.length].stroke}
                  stroke="white"
                  strokeWidth={1.5}
                  className="cursor-pointer opacity-0 hover:opacity-100 transition-opacity"
                  onMouseEnter={() => setTooltip({ x: px, y: py, dim: dim.charAt(0).toUpperCase() + dim.slice(1), value: level, color: PROJECT_COLORS[idx % PROJECT_COLORS.length].stroke })}
                  onMouseLeave={() => setTooltip(null)}
                />
              );
            });
          })}
          {tooltip && (
            <g>
              <rect x={tooltip.x - 40} y={tooltip.y - 24} width={80} height={20} rx={4} fill="oklch(0.15 0.01 250)" opacity={0.9} />
              <text x={tooltip.x} y={tooltip.y - 14} textAnchor="middle" fontSize={8} fill="white" fontWeight={600}>
                {tooltip.dim}: {tooltip.value}
              </text>
            </g>
          )}
          {}
          {labelPositions.map(({ dim, x, y }) => (
            <text
              key={dim}
              x={x}
              y={y}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={9}
              className="fill-muted-foreground"
            >
              {dim.charAt(0).toUpperCase() + dim.slice(1)}
            </text>
          ))}
        </svg>
        {}
        <div className="flex flex-wrap justify-center gap-4">
          {projects.map((p, idx) => {
            const c = PROJECT_COLORS[idx % PROJECT_COLORS.length];
            return (
              <div key={p.id} className="flex items-center gap-1.5">
                <div
                  className="h-3 w-3 rounded-full shrink-0"
                  style={{ backgroundColor: c.stroke }}
                />
                <span className="text-sm text-muted-foreground font-medium">{p.name}</span>
              </div>
            );
          })}
        </div>
      </div>
    </SectionCard>
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
