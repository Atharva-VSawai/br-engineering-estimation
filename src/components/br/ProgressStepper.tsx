'use client';

import React, { useState } from 'react';
import { Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { WIZARD_STEPS } from '@/data';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/store';
import type { ProjectConfig } from '@/types';

interface ProgressStepperProps {
  currentStep: number;
  onStepClick: (step: number) => void;
}

type ValidationStatus = 'complete' | 'partial' | 'empty';

function getStepValidationStatus(step: number, config: ProjectConfig): ValidationStatus {
  switch (step) {
    case 0: { // Project
      const nameFilled = !!(config.project.name && config.project.name.trim());
      const anyFilled = !!config.project.name || !!config.project.customer || !!config.project.machineType || !!config.project.industry || !!config.project.description;
      return nameFilled ? 'complete' : anyFilled ? 'partial' : 'empty';
    }
    case 1: { // Controller
      return config.controller.family ? 'complete' : config.controller.quantity > 1 ? 'partial' : 'empty';
    }
    case 2: { // I/O
      const total = config.io.digitalInputs + config.io.digitalOutputs + config.io.analogInputs + config.io.analogOutputs;
      return total > 0 ? 'complete' : 'empty';
    }
    case 3: { // Motion
      return config.motion.totalAxes > 0 ? 'complete' : 'empty';
    }
    case 4: { // HMI
      return config.hmi.screens > 0 ? 'complete' : 'empty';
    }
    case 5: { // Vision
      if (config.vision.enabled && config.vision.cameras > 0) return 'complete';
      if (config.vision.enabled) return 'partial';
      return 'empty';
    }
    case 6: { // Safety
      if (config.safety.enabled && config.safety.safetyIOCount > 0) return 'complete';
      if (config.safety.enabled) return 'partial';
      return 'empty';
    }
    case 7: { // Communication
      return config.communication.protocols.some((p) => p.enabled) ? 'complete' : 'empty';
    }
    case 8: { // Mechatronics
      return config.mechatronics.type !== 'None' ? 'complete' : 'empty';
    }
    case 9: { // Robotics
      if (config.robotics.enabled && config.robotics.quantity > 0) return 'complete';
      if (config.robotics.enabled) return 'partial';
      return 'empty';
    }
    case 10: { // IIoT
      if (config.iiot.ipcRequired) return 'complete';
      if (config.iiot.iiotRequired) return 'partial';
      return 'empty';
    }
    case 11: { // Additional Features
      return config.additionalFeatures.some((f) => f.enabled) ? 'complete' : 'empty';
    }
    case 12: // Complexity - always complete
      return 'complete';
    case 13: // Review - always complete
      return 'complete';
    default:
      return 'empty';
  }
}

export function ProgressStepper({ currentStep, onStepClick }: ProgressStepperProps) {
  const [hoveredStep, setHoveredStep] = useState<number | null>(null);
  const { config } = useAppStore();

  return (
    <div className="mb-6">
      {/* Progress text */}
      <div className="flex items-center justify-between mb-3">
        <div className="text-xs text-muted-foreground">
          Project: <span className="font-medium text-foreground">New Estimate</span>
        </div>
        <div className="text-xs text-muted-foreground">
          Progress: <span className="font-medium text-foreground">{currentStep + 1} / {WIZARD_STEPS.length}</span>
        </div>
      </div>

      {/* Overall progress bar */}
      <div className="h-1 rounded-full bg-muted overflow-hidden mb-3">
        <motion.div
          className="h-full bg-primary rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${((currentStep + 1) / WIZARD_STEPS.length) * 100}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>

      {/* Step indicators */}
      <div className="flex items-center gap-0 overflow-x-auto pb-2">
        {WIZARD_STEPS.map((label, idx) => {
          const isCompleted = idx < currentStep;
          const isCurrent = idx === currentStep;
          const isFuture = idx > currentStep;
          const isHovered = hoveredStep === idx;
          const validation = getStepValidationStatus(idx, config);

          return (
            <React.Fragment key={label}>
              {idx > 0 && (
                <div
                  className={cn(
                    'h-px flex-1 min-w-[12px] transition-colors duration-300',
                    idx <= currentStep ? 'bg-primary' : 'bg-border'
                  )}
                />
              )}
              <div className="relative">
                <motion.button
                  onClick={() => onStepClick(idx)}
                  onMouseEnter={() => setHoveredStep(idx)}
                  onMouseLeave={() => setHoveredStep(null)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.97 }}
                  className={cn(
                    'flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[11px] font-medium whitespace-nowrap transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                    isCompleted && 'bg-emerald-500/10 text-emerald-600',
                    isCurrent && 'bg-primary/10 text-primary ring-2 ring-primary/20 shadow-sm',
                    isFuture && 'bg-muted text-muted-foreground hover:bg-muted/80 opacity-60'
                  )}
                  aria-current={isCurrent ? 'step' : undefined}
                >
                  {isCompleted ? (
                    <Check className="h-3 w-3" />
                  ) : (
                    <span
                      className={cn(
                        'flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold',
                        isCurrent && 'bg-primary text-primary-foreground animate-pulse',
                        !isCurrent && !isCompleted && 'bg-background text-muted-foreground ring-1 ring-border'
                      )}
                    >
                      {idx + 1}
                    </span>
                  )}
                  <span className="hidden xl:inline">{label}</span>
                </motion.button>
                {/* Validation indicator dot */}
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
                {/* Tooltip for small screens */}
                {isHovered && (
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1.5 z-50 px-2 py-1 rounded-md bg-popover text-popover-foreground text-[10px] font-medium whitespace-nowrap shadow-md border border-border pointer-events-none xl:hidden">
                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 bg-popover border-l border-t border-border" />
                    {label}
                  </div>
                )}
              </div>
            </React.Fragment>
          );
        })}
      </div>

      {/* Step labels below on larger screens */}
      <div className="hidden xl:flex items-center gap-0 mt-0.5">
        {WIZARD_STEPS.map((label, idx) => (
          <React.Fragment key={label}>
            {idx > 0 && <div className="flex-1 min-w-[12px]" />}
            <div className={cn(
              'px-2.5 text-[9px] font-medium text-center truncate max-w-[80px]',
              idx <= currentStep ? 'text-foreground' : 'text-muted-foreground/60'
            )}>
              {label}
            </div>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
