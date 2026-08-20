'use client';

import React from 'react';
import { SectionCard } from '@/components/br/SectionCard';
import { ComplexityBadge } from '@/components/br/ComplexityBadge';
import { ENGINEERING_ACTIVITIES } from '@/data';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export function EngineeringActivitiesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-bold text-foreground">Engineering Activities</h1>
        <p className="text-sm text-muted-foreground">
          Domain model showing engineering activities across technologies.
        </p>
      </div>

      <SectionCard title="Activity Matrix" description="Shows typical engineering activities required per technology. This is a domain model, not an actual estimation.">
        <div className="overflow-x-auto -mx-4 px-4">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-xs font-semibold text-muted-foreground h-9">Technology</TableHead>
                <TableHead className="text-center text-xs font-semibold text-muted-foreground h-9">Config</TableHead>
                <TableHead className="text-center text-xs font-semibold text-muted-foreground h-9">Program</TableHead>
                <TableHead className="text-center text-xs font-semibold text-muted-foreground h-9">Integrate</TableHead>
                <TableHead className="text-center text-xs font-semibold text-muted-foreground h-9">Test</TableHead>
                <TableHead className="text-center text-xs font-semibold text-muted-foreground h-9">Comm.</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground h-9">Potential Complexity</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ENGINEERING_ACTIVITIES.map((row) => (
                <TableRow key={row.technology} className="border-border hover:bg-muted/50">
                  <TableCell className="text-xs font-medium text-foreground py-2.5">{row.technology}</TableCell>
                  {['configuration', 'programming', 'integration', 'testing', 'commissioning'].map((col) => (
                    <TableCell key={col} className="text-center py-2.5">
                      {row[col as keyof typeof row] ? (
                        <span className="inline-flex h-5 w-5 items-center justify-center rounded bg-emerald-100 text-emerald-700 text-xs">✓</span>
                      ) : (
                        <span className="text-border text-xs">—</span>
                      )}
                    </TableCell>
                  ))}
                  <TableCell className="py-2.5">
                    <ComplexityBadge level={row.potentialComplexity} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </SectionCard>

      <SectionCard title="Engineering Lifecycle">
        <div className="flex flex-wrap items-center gap-2">
          {['Configuration', 'Programming', 'Integration', 'Testing', 'Commissioning'].map((phase, idx, arr) => (
            <React.Fragment key={phase}>
              <div className="rounded-md border border-border bg-white px-3 py-1.5 text-xs font-medium text-foreground">
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