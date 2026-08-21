'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { ClipboardList, AlertTriangle, Zap } from 'lucide-react';
import { SectionCard } from '@/components/br/SectionCard';
import { ComplexityBadge } from '@/components/br/ComplexityBadge';
import { ENGINEERING_ACTIVITIES } from '@/data';
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export function EngineeringActivitiesPage() {
  const effortData = useMemo(
    () => [
      { name: 'PLC Programming', hours: 120, color: '#f97316' },
      { name: 'HMI Development', hours: 80, color: '#06b6d4' },
      { name: 'Motion Setup', hours: 60, color: '#8b5cf6' },
      { name: 'Safety Engineering', hours: 40, color: '#10b981' },
      { name: 'Vision Integration', hours: 30, color: '#ec4899' },
      { name: 'Commissioning', hours: 50, color: '#eab308' },
      { name: 'Testing & QA', hours: 35, color: '#3b82f6' },
    ],
    []
  );

  const totalActivities = ENGINEERING_ACTIVITIES.length;
  const highImpactCount = ENGINEERING_ACTIVITIES.filter((a) => a.estimatedHours >= 16).length;
  const quickWinsCount = ENGINEERING_ACTIVITIES.filter((a) => a.estimatedHours < 4).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-bold text-foreground">Engineering Activities</h1>
        <p className="text-sm text-muted-foreground">
          Domain model showing engineering activities across technologies.
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <SectionCard title="Engineering Effort Overview">
          <div className="grid grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
                <ClipboardList className="h-4 w-4 text-foreground" />
              </div>
              <div>
                <div className="text-xl font-bold text-foreground">{totalActivities}</div>
                <div className="text-[11px] text-muted-foreground">Total Activities</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
                <AlertTriangle className="h-4 w-4 text-orange-500" />
              </div>
              <div>
                <div className="text-xl font-bold text-orange-500">{highImpactCount}</div>
                <div className="text-[11px] text-muted-foreground">High Impact</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
                <Zap className="h-4 w-4 text-emerald-500" />
              </div>
              <div>
                <div className="text-xl font-bold text-emerald-500">{quickWinsCount}</div>
                <div className="text-[11px] text-muted-foreground">Quick Wins</div>
              </div>
            </div>
          </div>
        </SectionCard>
      </motion.div>

      <SectionCard title="Activity Matrix" description="Shows typical engineering activities required per technology. This is a domain model, not an actual estimation.">
        <div className="overflow-x-auto -mx-4 px-4">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent bg-muted/30">
                <TableHead className="text-xs font-semibold text-muted-foreground h-9">Technology</TableHead>
                <TableHead className="text-center text-xs font-semibold text-muted-foreground h-9">Config</TableHead>
                <TableHead className="text-center text-xs font-semibold text-muted-foreground h-9">Program</TableHead>
                <TableHead className="text-center text-xs font-semibold text-muted-foreground h-9">Integrate</TableHead>
                <TableHead className="text-center text-xs font-semibold text-muted-foreground h-9">Test</TableHead>
                <TableHead className="text-center text-xs font-semibold text-muted-foreground h-9">Comm.</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground h-9">Est. Hours</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground h-9">Potential Complexity</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ENGINEERING_ACTIVITIES.map((row, rowIdx) => (
                <TableRow key={row.technology} className={`border-border hover:bg-muted/50 ${rowIdx % 2 === 1 ? 'bg-muted/20' : ''}`}>
                  <TableCell className="text-xs font-medium text-foreground py-2.5">{row.technology}</TableCell>
                  {['configuration', 'programming', 'integration', 'testing', 'commissioning'].map((col) => (
                    <TableCell key={col} className="text-center py-2.5">
                      {row[col as keyof typeof row] ? (
                        <span className="inline-flex h-5 w-5 items-center justify-center rounded bg-emerald-100 text-emerald-500 text-xs">✓</span>
                      ) : (
                        <span className="text-border text-xs">—</span>
                      )}
                    </TableCell>
                  ))}
                  <TableCell className="text-xs font-medium text-foreground py-2.5">{row.estimatedHours}h</TableCell>
                  <TableCell className="py-2.5">
                    <ComplexityBadge level={row.potentialComplexity} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter>
              <TableRow className="border-border hover:bg-transparent">
                <TableCell className="text-xs font-bold text-primary py-2.5">Total Hours</TableCell>
                <TableCell colSpan={5} />
                <TableCell className="text-xs font-bold text-primary py-2.5">{ENGINEERING_ACTIVITIES.reduce((sum, a) => sum + a.estimatedHours, 0)}h</TableCell>
                <TableCell />
              </TableRow>
            </TableFooter>
          </Table>
        </div>
      </SectionCard>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <SectionCard title="Effort Allocation Overview" description="Estimated effort distribution across engineering disciplines">
          {(() => {
            const totalHours = effortData.reduce((sum, c) => sum + c.hours, 0);
            return (
              <div className="space-y-4">
                {/* Stacked bar */}
                <div className="h-8 rounded-md overflow-hidden flex">
                  {effortData.map((cat) => {
                    const pct = totalHours > 0 ? (cat.hours / totalHours) * 100 : 0;
                    return (
                      <div
                        key={cat.name}
                        style={{
                          width: `${pct}%`,
                          backgroundColor: cat.color,
                          minWidth: pct > 0 ? '2px' : '0px',
                        }}
                        title={`${cat.name}: ${cat.hours}h (${pct.toFixed(1)}%)`}
                      />
                    );
                  })}
                </div>
                {/* Legend grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {effortData.map((cat) => {
                    const pct = totalHours > 0 ? ((cat.hours / totalHours) * 100).toFixed(1) : '0.0';
                    return (
                      <div key={cat.name} className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-sm shrink-0"
                          style={{ backgroundColor: cat.color }}
                        />
                        <span className="text-xs text-muted-foreground">
                          {cat.name} <span className="font-medium text-foreground">{cat.hours}h ({pct}%)</span>
                        </span>
                      </div>
                    );
                  })}
                </div>
                {/* Total */}
                <p className="text-sm font-semibold text-foreground">
                  Total Estimated Effort: {totalHours} hours
                </p>
              </div>
            );
          })()}
        </SectionCard>
      </motion.div>

      <SectionCard title="Engineering Lifecycle">
        <div className="flex flex-wrap items-center gap-2">
          {['Configuration', 'Programming', 'Integration', 'Testing', 'Commissioning'].map((phase, idx, arr) => (
            <React.Fragment key={phase}>
              <div className="rounded-md border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground">
                {phase}
              </div>
              {idx < arr.length - 1 && (
                <span className="text-muted-foreground text-xs">→</span>
              )}
            </React.Fragment>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}