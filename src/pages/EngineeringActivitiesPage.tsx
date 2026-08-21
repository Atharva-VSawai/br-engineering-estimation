'use client';

import React, { useMemo, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ClipboardList, AlertTriangle, Zap, GripVertical } from 'lucide-react';
import { DndContext, closestCenter, DragOverlay, useSensor, useSensors, PointerSensor } from '@dnd-kit/core';
import { SortableContext, useSortable, arrayMove, rectSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { SectionCard } from '@/components/br/SectionCard';
import { ComplexityBadge } from '@/components/br/ComplexityBadge';
import { ENGINEERING_ACTIVITIES } from '@/data';
import { useAppStore } from '@/store';
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

function SortableEffortItem({ id, children, onDragStart }: { id: string; children: React.ReactNode; onDragStart: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  };
  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      layout
      className="flex items-center gap-2 group/effort relative"
    >
      <div
        {...attributes}
        {...listeners}
        onPointerDown={onDragStart}
        className="opacity-0 group-hover/effort:opacity-100 transition-opacity cursor-grab active:cursor-grabbing p-0.5 shrink-0"
      >
        <GripVertical className="h-3 w-3 text-muted-foreground" />
      </div>
      {children}
    </motion.div>
  );
}

export function EngineeringActivitiesPage() {
  const { config } = useAppStore();
  const c = config;

  // Effort allocation drag order
  const [effortOrder, setEffortOrder] = useState<number[]>(() => {
    if (typeof window === 'undefined') return [0, 1, 2, 3, 4, 5, 6];
    try {
      const saved = localStorage.getItem('br-activities-order');
      return saved ? JSON.parse(saved) : [0, 1, 2, 3, 4, 5, 6];
    } catch {
      return [0, 1, 2, 3, 4, 5, 6];
    }
  });
  const [activeEffortId, setActiveEffortId] = useState<number | null>(null);
  const effortSensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  useEffect(() => {
    try {
      localStorage.setItem('br-activities-order', JSON.stringify(effortOrder));
    } catch { /* noop */ }
  }, [effortOrder]);

  const effortData = useMemo(() => {
    const ioTotal = c.io.digitalInputs + c.io.digitalOutputs + c.io.analogInputs + c.io.analogOutputs;
    const motionFeatures = [c.motion.electronicCamming, c.motion.coordinatedMotion, c.motion.synchronization].filter(Boolean).length;
    const visionFunctions = [c.vision.inspection, c.vision.measurement, c.vision.detection, c.vision.identification, c.vision.ocr, c.vision.barcodeQR, c.vision.patternMatching, c.vision.positionDetection, c.vision.qualityControl].filter(Boolean).length;
    return [
      { name: 'PLC Programming', hours: Math.round(ioTotal * 0.4 + 20), color: '#f97316' },
      { name: 'HMI Development', hours: Math.round(c.hmi.screens * 8 + (c.hmi.alarmManagement ? 8 : 0) + (c.hmi.recipeManagement ? 6 : 0) + 4), color: '#06b6d4' },
      { name: 'Motion Setup', hours: Math.round(c.motion.totalAxes * 4 + (c.motion.electronicCamming ? 20 : 0) + (c.motion.coordinatedMotion ? 16 : 0) + motionFeatures * 4), color: '#8b5cf6' },
      { name: 'Safety Engineering', hours: c.safety.enabled ? Math.round(c.safety.safetyIOCount * 2 + 16) : 0, color: '#10b981' },
      { name: 'Vision Integration', hours: c.vision.enabled ? Math.round(c.vision.cameras * 16 + visionFunctions * 4) : 0, color: '#ec4899' },
      { name: 'Commissioning', hours: Math.round(ioTotal * 0.1 + c.motion.totalAxes * 2 + 8), color: '#eab308' },
      { name: 'Testing & QA', hours: Math.round((ioTotal + c.motion.totalAxes * 4) * 0.15 + 10), color: '#3b82f6' },
    ];
  }, [c]);

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
                <div className="text-sm text-muted-foreground">Total Activities</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
                <AlertTriangle className="h-4 w-4 text-orange-500" />
              </div>
              <div>
                <div className="text-xl font-bold text-orange-500">{highImpactCount}</div>
                <div className="text-sm text-muted-foreground">High Impact</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
                <Zap className="h-4 w-4 text-emerald-500" />
              </div>
              <div>
                <div className="text-xl font-bold text-emerald-500">{quickWinsCount}</div>
                <div className="text-sm text-muted-foreground">Quick Wins</div>
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
                <TableHead className="text-sm font-semibold text-muted-foreground h-9">Technology</TableHead>
                <TableHead className="text-center text-sm font-semibold text-muted-foreground h-9">Config</TableHead>
                <TableHead className="text-center text-sm font-semibold text-muted-foreground h-9">Program</TableHead>
                <TableHead className="text-center text-sm font-semibold text-muted-foreground h-9">Integrate</TableHead>
                <TableHead className="text-center text-sm font-semibold text-muted-foreground h-9">Test</TableHead>
                <TableHead className="text-center text-sm font-semibold text-muted-foreground h-9">Comm.</TableHead>
                <TableHead className="text-sm font-semibold text-muted-foreground h-9">Est. Hours</TableHead>
                <TableHead className="text-sm font-semibold text-muted-foreground h-9">Potential Complexity</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ENGINEERING_ACTIVITIES.map((row, rowIdx) => (
                <TableRow key={row.technology} className={`border-border hover:bg-muted/50 ${rowIdx % 2 === 1 ? 'bg-muted/20' : ''}`}>
                  <TableCell className="text-sm font-medium text-foreground py-2.5">{row.technology}</TableCell>
                  {['configuration', 'programming', 'integration', 'testing', 'commissioning'].map((col) => (
                    <TableCell key={col} className="text-center py-2.5">
                      {row[col as keyof typeof row] ? (
                        <span className="inline-flex h-5 w-5 items-center justify-center rounded bg-emerald-100 text-emerald-500 text-sm">✓</span>
                      ) : (
                        <span className="text-border text-sm">—</span>
                      )}
                    </TableCell>
                  ))}
                  <TableCell className="text-sm font-medium text-foreground py-2.5">{row.estimatedHours}h</TableCell>
                  <TableCell className="py-2.5">
                    <ComplexityBadge level={row.potentialComplexity} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter>
              <TableRow className="border-border hover:bg-transparent">
                <TableCell className="text-sm font-bold text-primary py-2.5">Total Hours</TableCell>
                <TableCell colSpan={5} />
                <TableCell className="text-sm font-bold text-primary py-2.5">{ENGINEERING_ACTIVITIES.reduce((sum, a) => sum + a.estimatedHours, 0)}h</TableCell>
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
            const orderedEffort = effortOrder.map((i) => effortData[i]);
            const totalHours = effortData.reduce((sum, cat) => sum + cat.hours, 0);
            const handleEffortDragEnd = (event: { active: { id: string | number }; over: { id: string | number } | null }) => {
              const { active, over } = event;
              setActiveEffortId(null);
              if (!over || active.id === over.id) return;
              setEffortOrder((prev) => arrayMove(prev, prev.indexOf(Number(active.id)), prev.indexOf(Number(over.id))));
            };
            const activeEffortItem = activeEffortId !== null ? effortData[activeEffortId] : null;
            return (
              <DndContext sensors={effortSensors} collisionDetection={closestCenter} onDragStart={({ active }) => setActiveEffortId(Number(active.id))} onDragEnd={handleEffortDragEnd}>
                <div className="space-y-4">
                  {/* Stacked bar */}
                  <div className="h-8 rounded-md overflow-hidden flex">
                    {orderedEffort.map((cat) => {
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
                  {/* Legend grid - draggable */}
                  <SortableContext items={effortOrder.map(String)} strategy={rectSortingStrategy}>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <AnimatePresence mode="popLayout">
                        {effortOrder.map((idx) => {
                          const cat = effortData[idx];
                          const pct = totalHours > 0 ? ((cat.hours / totalHours) * 100).toFixed(1) : '0.0';
                          return (
                            <SortableEffortItem
                              key={String(idx)}
                              id={String(idx)}
                              onDragStart={() => setActiveEffortId(idx)}
                            >
                              <div
                                className="w-3 h-3 rounded-sm shrink-0"
                                style={{ backgroundColor: cat.color }}
                              />
                              <span className="text-sm text-muted-foreground">
                                {cat.name} <span className="font-medium text-foreground">{cat.hours}h ({pct}%)</span>
                              </span>
                            </SortableEffortItem>
                          );
                        })}
                      </AnimatePresence>
                    </div>
                  </SortableContext>
                  <DragOverlay>
                    {activeEffortItem ? (
                      <div className="flex items-center gap-2 rounded-lg bg-card border border-border p-2 shadow-xl scale-105">
                        <GripVertical className="h-3 w-3 text-muted-foreground" />
                        <div
                          className="w-3 h-3 rounded-sm shrink-0"
                          style={{ backgroundColor: activeEffortItem.color }}
                        />
                        <span className="text-sm font-medium text-foreground">{activeEffortItem.name} {activeEffortItem.hours}h</span>
                      </div>
                    ) : null}
                  </DragOverlay>
                  {/* Total */}
                  <p className="text-sm font-semibold text-foreground">
                    Total Estimated Effort: {totalHours} hours
                  </p>
                </div>
              </DndContext>
            );
          })()}
        </SectionCard>
      </motion.div>

      <SectionCard title="Engineering Lifecycle">
        <div className="flex flex-wrap items-center gap-2">
          {['Configuration', 'Programming', 'Integration', 'Testing', 'Commissioning'].map((phase, idx, arr) => (
            <React.Fragment key={phase}>
              <div className="rounded-md border border-border bg-card px-3 py-1.5 text-sm font-medium text-foreground">
                {phase}
              </div>
              {idx < arr.length - 1 && (
                <span className="text-muted-foreground text-sm">→</span>
              )}
            </React.Fragment>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}