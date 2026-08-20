'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { ArrowLeft, ArrowRight, Save, RotateCcw, Download } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useAppStore } from '@/store';
import { ProgressStepper } from '@/components/br/ProgressStepper';
import { StepProject } from './wizard/StepProject';
import { StepController } from './wizard/StepController';
import { StepIO } from './wizard/StepIO';
import { StepMotion } from './wizard/StepMotion';
import { StepHMI } from './wizard/StepHMI';
import { StepVision } from './wizard/StepVision';
import { StepSafety } from './wizard/StepSafety';
import { StepCommunication } from './wizard/StepCommunication';
import { StepMechatronics } from './wizard/StepMechatronics';
import { StepRobotics } from './wizard/StepRobotics';
import { StepIIoT } from './wizard/StepIIoT';
import { StepAdditionalFeatures } from './wizard/StepAdditionalFeatures';
import { StepComplexity } from './wizard/StepComplexity';
import { StepReview } from './wizard/StepReview';

const STEP_COMPONENTS = [
  StepProject,
  StepController,
  StepIO,
  StepMotion,
  StepHMI,
  StepVision,
  StepSafety,
  StepCommunication,
  StepMechatronics,
  StepRobotics,
  StepIIoT,
  StepAdditionalFeatures,
  StepComplexity,
  StepReview,
];

export function NewEstimatePage() {
  const { wizardStep, setWizardStep, loadSampleConfig, currentPage } = useAppStore();
  const [resetOpen, setResetOpen] = useState(false);
  const totalSteps = STEP_COMPONENTS.length;
  const isLastStep = wizardStep === totalSteps - 1;
  const isFirstStep = wizardStep === 0;
  const StepComponent = STEP_COMPONENTS[wizardStep];
  const isWizardActive = currentPage === 'new-estimate';

  const handleReset = useCallback(() => {
    setWizardStep(0);
    setResetOpen(false);
    toast('Configuration reset', { description: 'All fields have been cleared.' });
  }, [setWizardStep]);

  const handleLoadSample = () => {
    loadSampleConfig();
    toast('Sample loaded', { description: 'Automated Packaging Machine configuration loaded.' });
  };

  const handleSaveDraft = () => {
    toast('Draft saved', { description: 'Configuration saved locally.' });
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isWizardActive) return;
      const target = e.target;
      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLSelectElement
      ) {
        return;
      }
      if (e.key === 'ArrowRight' && !isLastStep) {
        setWizardStep(wizardStep + 1);
      } else if (e.key === 'ArrowLeft' && !isFirstStep) {
        setWizardStep(wizardStep - 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [wizardStep, isLastStep, isFirstStep, isWizardActive, setWizardStep]);

  return (
    <div className="space-y-4">
      <ProgressStepper currentStep={wizardStep} onStepClick={setWizardStep} />

      {isWizardActive && (
        <div className="text-[10px] text-muted-foreground text-center">Use ← → arrow keys to navigate steps</div>
      )}

      <div className="min-h-[calc(100vh-260px)]">
        <StepComponent />
      </div>

      <div className="flex items-center justify-between border-t border-border pt-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs" onClick={() => setResetOpen(true)} title="Reset configuration">
            <RotateCcw className="h-3.5 w-3.5" />
            Reset
          </Button>
          <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs" onClick={handleLoadSample} title="Load sample packaging machine configuration">
            <Download className="h-3.5 w-3.5" />
            Load Sample
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs" disabled={isFirstStep} onClick={() => setWizardStep(wizardStep - 1)}>
            <ArrowLeft className="h-3.5 w-3.5" />
            Back
          </Button>
          <Button variant="default" size="sm" className="h-8 gap-1.5 text-xs bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => {
            if (isLastStep) {
              useAppStore.getState().setCurrentPage('estimate-summary');
            } else {
              setWizardStep(wizardStep + 1);
            }
          }}>
            {isLastStep ? 'View Summary' : 'Next'}
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
          <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs" onClick={handleSaveDraft}>
            <Save className="h-3.5 w-3.5" />
            Save Draft
          </Button>
        </div>
      </div>

      <AlertDialog open={resetOpen} onOpenChange={setResetOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset Configuration</AlertDialogTitle>
            <AlertDialogDescription>
              This will clear all fields and return to step 1. Continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60" onClick={handleReset}>
              Reset
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
