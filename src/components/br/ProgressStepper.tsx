'use client';

import React, { useState, useCallback } from 'react';
import { Check, GripVertical } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { DndContext, closestCenter, DragOverlay, useSensor, useSensors, PointerSensor } from '@dnd-kit/core';
import { SortableContext, useSortable, arrayMove, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { WIZARD_STEPS } from '@/data';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/store';
import type { ProjectConfig } from '@/types';

interface ProgressStepperProps {
  currentStep: number;
  onStepClick: (step: number) => void;
}

type ValidationStatus = 'complete' | 'partial' | 'empty';

function SortableStepItem({
  stepIdx,
  label,
  isCompleted,
  isCurrent,
  isFuture,
  isHovered,
  validation,
  onStepClick,
  onHover,
  onLeave,
}: {
  stepIdx: number;
  label: string;
  isCompleted: boolean;
  isCurrent: boolean;
  isFuture: boolean;
  isHovered: boolean;
  validation: ValidationStatus;
  onStepClick: (idx: number) => void;
  onHover: () => void;
  onLeave: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: String(stepIdx) });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
    zIndex: isDragging ? 50 : undefined,
  };
  return (
    <div ref={setNodeRef} style={style} className="relative flex items-center">
      <div className="flex items-center gap-0.5">
        <div
          {...attributes}
          {...listeners}
          className={cn(
            'opacity-0 group-hover/step:opacity-100 transition-opacity cursor-grab active:cursor-grabbing p-0.5',
            isDragging && 'opacity-100'
          )}
        >
          <GripVertical className="h-3 w-3 text-muted-foreground" />
        </div>
        <motion.button
          onClick={() => onStepClick(stepIdx)}
          onMouseEnter={onHover}
          onMouseLeave={onLeave}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
          className={cn(
            'flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium whitespace-nowrap transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            isCompleted && 'bg-emerald-500/10 text-emerald-600',
            isCurrent && 'bg-primary/10 text-primary ring-2 ring-primary/20 shadow-[0_0_8px_oklch(0.55_0.2_35/0.2)]',
            isFuture && 'bg-muted text-muted-foreground hover:bg-muted/80 opacity-60'
          )}
          aria-current={isCurrent ? 'step' : undefined}
        >
          {isCompleted ? (
            <Check className="h-3 w-3" />
          ) : (
            <span
              className={cn(
                'flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold',
                isCurrent && 'bg-primary text-primary-foreground animate-pulse',
                !isCurrent && !isCompleted && 'bg-background text-muted-foreground ring-1 ring-border'
              )}
            >
              {stepIdx + 1}
            </span>
          )}
          <span className="hidden xl:inline">{label}</span>
        </motion.button>
      </div>
      <div className="flex justify-center mt-0.5">
        <div
          className={cn(
            'w-1.5 h-1.5 rounded-full',
            validation === 'complete' && 'bg-emerald-400',
            validation === 'partial' && 'bg-amber-400',
            validation === 'empty' && 'bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600'
          )}
        />
      </div>
      {isHovered && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1.5 z-50 px-2 py-1 rounded-md bg-popover text-popover-foreground text-xs font-medium whitespace-nowrap shadow-md border border-border pointer-events-none xl:hidden">
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 bg-popover border-l border-t border-border" />
          {label}
        </div>
      )}
    </div>
  );
}

function getStepValidationStatus(step: number, config: ProjectConfig): ValidationStatus {
  switch (step) {
    case 0: {
      const nameFilled = !!(config.project.name && config.project.name.trim());
      const anyFilled = !!config.project.name || !!config.project.customer || !!config.project.machineType || !!config.project.industry || !!config.project.description;
      return nameFilled ? 'complete' : anyFilled ? 'partial' : 'empty';
    }
    case 1: {
      return config.controller.family ? 'complete' : config.controller.quantity > 1 ? 'partial' : 'empty';
    }
    case 2: {
      const total = config.io.digitalInputs + config.io.digitalOutputs + config.io.analogInputs + config.io.analogOutputs;
      return total > 0 ? 'complete' : 'empty';
    }
    case 3: {
      return config.motion.totalAxes > 0 ? 'complete' : 'empty';
    }
    case 4: {
      return config.hmi.screens > 0 ? 'complete' : 'empty';
    }
    case 5: {
      if (config.vision.enabled && config.vision.cameras > 0) return 'complete';
      if (config.vision.enabled) return 'partial';
      return 'empty';
    }
    case 6: {
      if (config.safety.enabled && config.safety.safetyIOCount > 0) return 'complete';
      if (config.safety.enabled) return 'partial';
      return 'empty';
    }
    case 7: {
      return config.communication.protocols.some((p) => p.enabled) ? 'complete' : 'empty';
    }
    case 8: {
      return config.mechatronics.type !== 'None' ? 'complete' : 'empty';
    }
    case 9: {
      if (config.robotics.enabled && config.robotics.quantity > 0) return 'complete';
      if (config.robotics.enabled) return 'partial';
      return 'empty';
    }
    case 10: {
      if (config.iiot.ipcRequired) return 'complete';
      if (config.iiot.iiotRequired) return 'partial';
      return 'empty';
    }
    case 11: {
      return config.additionalFeatures.some((f) => f.enabled) ? 'complete' : 'empty';
    }
    case 12:
      return 'complete';
    case 13:
      return 'complete';
    default:
      return 'empty';
  }
}

export function ProgressStepper({ currentStep, onStepClick }: ProgressStepperProps) {
  const [hoveredStep, setHoveredStep] = useState<number | null>(null);
  const [activeStepId, setActiveStepId] = useState<string | null>(null);
  const { config, stepOrder, setStepOrder } = useAppStore();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const displayOrder = stepOrder ?? WIZARD_STEPS.map((_, i) => i);
  const currentDisplayPos = displayOrder.indexOf(currentStep);

  const handleDragEnd = useCallback((event: { active: { id: string | number }; over: { id: string | number } | null }) => {
    const { active, over } = event;
    setActiveStepId(null);
    if (!over || active.id === over.id) return;
    setStepOrder(arrayMove(displayOrder, displayOrder.indexOf(Number(active.id)), displayOrder.indexOf(Number(over.id))));
  }, [displayOrder, setStepOrder]);

  const activeStepLabel = activeStepId !== null ? WIZARD_STEPS[Number(activeStepId)] : null;

  return (
    <div className="mb-6">
      {}
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm text-muted-foreground">
          Project: <span className="font-medium text-foreground">New Estimate</span>
        </div>
        <div className="text-sm text-muted-foreground">
          Progress: <span className="font-medium text-foreground">{currentDisplayPos + 1} / {WIZARD_STEPS.length}</span>
        </div>
      </div>

      {}
      <div className="h-1 rounded-full bg-muted overflow-hidden mb-3">
        <motion.div
          className="h-full bg-primary rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${((currentDisplayPos + 1) / WIZARD_STEPS.length) * 100}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>

      {}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={({ active }) => setActiveStepId(String(active.id))} onDragEnd={handleDragEnd}>
        <SortableContext items={displayOrder.map(String)} strategy={horizontalListSortingStrategy}>
          <div className="group/step flex items-center gap-0 overflow-x-auto pb-2">
            <AnimatePresence>
              {displayOrder.map((stepIdx, displayIdx) => {
                const label = WIZARD_STEPS[stepIdx];
                const isCompleted = displayIdx < currentDisplayPos;
                const isCurrent = stepIdx === currentStep;
                const isFuture = displayIdx > currentDisplayPos;
                const isHovered = hoveredStep === stepIdx;
                const validation = getStepValidationStatus(stepIdx, config);
                return (
                  <React.Fragment key={String(stepIdx)}>
                    {displayIdx > 0 && (
                      <div
                        className={cn(
                          'h-px flex-1 min-w-[12px] transition-colors duration-300',
                          displayIdx <= currentDisplayPos ? 'bg-primary' : 'bg-border'
                        )}
                      />
                    )}
                    <SortableStepItem
                      stepIdx={stepIdx}
                      label={label}
                      isCompleted={isCompleted}
                      isCurrent={isCurrent}
                      isFuture={isFuture}
                      isHovered={isHovered}
                      validation={validation}
                      onStepClick={onStepClick}
                      onHover={() => setHoveredStep(stepIdx)}
                      onLeave={() => setHoveredStep(null)}
                    />
                  </React.Fragment>
                );
              })}
            </AnimatePresence>
          </div>
        </SortableContext>
        <DragOverlay>
          {activeStepLabel ? (
            <div className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium whitespace-nowrap bg-primary/10 text-primary ring-2 ring-primary/20 shadow-lg scale-105">
              <GripVertical className="h-3 w-3" />
              {activeStepLabel}
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {}
      <div className="hidden xl:flex items-center gap-0 mt-0.5">
        {displayOrder.map((stepIdx, displayIdx) => {
          const label = WIZARD_STEPS[stepIdx];
          return (
            <React.Fragment key={String(stepIdx)}>
              {displayIdx > 0 && <div className="flex-1 min-w-[12px]" />}
              <div className={cn(
                'px-2.5 text-[11px] font-medium text-center truncate max-w-[80px]',
                displayIdx <= currentDisplayPos ? 'text-foreground' : 'text-muted-foreground/60'
              )}>
                {label}
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
