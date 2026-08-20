'use client';

import React from 'react';
import { Check } from 'lucide-react';
import { WIZARD_STEPS } from '@/data';
import { cn } from '@/lib/utils';

interface ProgressStepperProps {
  currentStep: number;
  onStepClick: (step: number) => void;
}

export function ProgressStepper({ currentStep, onStepClick }: ProgressStepperProps) {
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

      {/* Step indicators */}
      <div className="flex items-center gap-0.5 overflow-x-auto pb-2">
        {WIZARD_STEPS.map((label, idx) => {
          const isCompleted = idx < currentStep;
          const isCurrent = idx === currentStep;

          return (
            <React.Fragment key={label}>
              {idx > 0 && (
                <div
                  className={cn(
                    'h-px flex-1 min-w-[12px] transition-colors',
                    idx <= currentStep ? 'bg-primary' : 'bg-border'
                  )}
                />
              )}
              <button
                onClick={() => onStepClick(idx)}
                className={cn(
                  'flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[11px] font-medium whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  isCompleted && 'bg-primary text-primary-foreground',
                  isCurrent && 'bg-primary/10 text-primary ring-1 ring-primary/30',
                  !isCompleted && !isCurrent && 'bg-muted text-muted-foreground hover:bg-muted/80'
                )}
                aria-current={isCurrent ? 'step' : undefined}
              >
                {isCompleted ? (
                  <Check className="h-3 w-3" />
                ) : (
                  <span
                    className={cn(
                      'flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold',
                      isCurrent ? 'bg-primary text-primary-foreground' : 'bg-background text-muted-foreground ring-1 ring-border'
                    )}
                  >
                    {idx + 1}
                  </span>
                )}
                <span className="hidden xl:inline">{label}</span>
              </button>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
