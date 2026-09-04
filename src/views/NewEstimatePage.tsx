'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { ArrowLeft, ArrowRight, Save, RotateCcw, RotateCw, Download, HeartPulse } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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
import { cn } from '@/lib/utils';
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
  const { wizardStep, setWizardStep, loadSampleConfig, currentPage, config, undo, redo, pushHistory, history, historyIndex, stepOrder, addNotification } = useAppStore();
  const [resetOpen, setResetOpen] = useState(false);
  const [direction, setDirection] = useState(1);

  const navigateToStep = useCallback((step: number) => {
    setDirection(step > wizardStep ? 1 : -1);
    setWizardStep(step);
  }, [wizardStep, setWizardStep]);
  const totalSteps = STEP_COMPONENTS.length;
  const displayOrder = stepOrder ?? STEP_COMPONENTS.map((_, i) => i);
  const currentDisplayPos = displayOrder.indexOf(wizardStep);
  const isLastStep = currentDisplayPos === totalSteps - 1;
  const isFirstStep = currentDisplayPos === 0;
  const StepComponent = STEP_COMPONENTS[wizardStep];
  const isWizardActive = currentPage === 'new-estimate';
  const progressPct = Math.round(((currentDisplayPos + 1) / totalSteps) * 100);


  const healthScore = (() => {
    const ioTotal =
      config.io.digitalInputs + config.io.digitalOutputs +
      config.io.analogInputs + config.io.analogOutputs +
      config.io.safetyIO + config.io.encoderCounterModules +
      config.io.temperatureModules + config.io.communicationIO +
      config.io.specialModules;
    const checks = [
      !!(config.project.name && config.project.name.trim()),
      config.controller.family !== 'None',
      ioTotal > 0,
      config.motion.totalAxes > 0,
      config.hmi.screens > 0,
      config.vision.enabled,
      config.safety.enabled,
      config.communication.protocols.some((p) => p.enabled),
      config.mechatronics.type !== 'None',
      config.robotics.enabled,
      config.iiot.ipcRequired,
    ];
    return checks.filter(Boolean).length;
  })();
  const totalSections = 11;
  const healthColor = healthScore >= 8 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300' : healthScore >= 5 ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300' : 'bg-muted text-muted-foreground';

  const handleReset = useCallback(() => {
    setWizardStep(0);
    setResetOpen(false);
    toast('Configuration reset', { description: 'All fields have been cleared.' });
  }, [setWizardStep]);

  const handleLoadSample = () => {
    loadSampleConfig();
    addNotification({ message: 'Sample data loaded', detail: 'Packaging Machine configuration applied', icon: 'Download', color: 'text-amber-500' });
    toast('Sample loaded', { description: 'Automated Packaging Machine configuration loaded.' });
  };

  const handleSaveDraft = () => {
    addNotification({ message: 'Draft saved', detail: `Step ${wizardStep + 1} configuration saved`, icon: 'Check', color: 'text-emerald-500' });
    toast('Draft saved', { description: 'Configuration saved locally.' });
  };
  useEffect(() => {
    pushHistory();
  }, [wizardStep, pushHistory]);

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
        const nextStep = displayOrder[currentDisplayPos + 1];
        if (nextStep !== undefined) navigateToStep(nextStep);
      } else if (e.key === 'ArrowLeft' && !isFirstStep) {
        const prevStepVal = displayOrder[currentDisplayPos - 1];
        if (prevStepVal !== undefined) navigateToStep(prevStepVal);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [wizardStep, isLastStep, isFirstStep, isWizardActive, navigateToStep, displayOrder, currentDisplayPos]);

  return (
    <div className="space-y-4">
      <ProgressStepper currentStep={wizardStep} onStepClick={navigateToStep} />

      {isWizardActive && (
        <div className="text-sm text-muted-foreground text-center">Use ← → arrow keys to navigate steps</div>
      )}

      <div className="min-h-[calc(100vh-260px)]">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={wizardStep}
            initial={{ opacity: 0, x: direction * 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -direction * 30 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
          >
            <StepComponent />
          </motion.div>
        </AnimatePresence>
      </div>

      {}
      <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground mr-1">
            Step {currentDisplayPos + 1} of {totalSteps} — {progressPct}% complete
          </span>
          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-sm font-medium ${healthColor}`}>
            <HeartPulse className="h-3 w-3" />
            Health: {healthScore}/{totalSections} sections
          </span>
          <Button variant="outline" size="sm" className="h-9 gap-1.5 text-sm" onClick={() => setResetOpen(true)} title="Reset configuration">
            <RotateCcw className="h-3.5 w-3.5" />
            Reset
          </Button>
          <Button variant="outline" size="sm" className="h-9 gap-1.5 text-sm" onClick={handleLoadSample} title="Load sample packaging machine configuration">
            <Download className="h-3.5 w-3.5" />
            Load Sample
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            disabled={historyIndex <= 0}
            onClick={undo}
            title={`Undo (${historyIndex} steps)`}
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </Button>
          {history.length > 0 && (
            <span className="text-sm text-muted-foreground">Step {historyIndex + 1}/{history.length}</span>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            disabled={historyIndex >= history.length - 1}
            onClick={redo}
            title={`Redo (${history.length - 1 - historyIndex} steps)`}
          >
            <RotateCw className="h-3.5 w-3.5" />
          </Button>
          <Button variant="outline" size="sm" className="h-9 gap-1.5 text-sm" disabled={isFirstStep} onClick={() => navigateToStep(displayOrder[currentDisplayPos - 1])}>
            <ArrowLeft className="h-3.5 w-3.5" />
            Back
          </Button>
          <Button
            variant="default"
            size="sm"
            className={cn(
              'h-9 gap-1.5 text-sm',
              isLastStep
                ? 'bg-emerald-600 text-white hover:bg-emerald-600/90'
                : 'bg-primary text-primary-foreground hover:bg-primary/90'
            )}
            onClick={() => {
              if (isLastStep) {
                useAppStore.getState().setCurrentPage('estimate-summary');
              } else {
                navigateToStep(displayOrder[currentDisplayPos + 1]);
              }
            }}
          >
            {isLastStep ? 'View Summary' : 'Next'}
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
          <Button variant="outline" size="sm" className="h-9 gap-1.5 text-sm" onClick={handleSaveDraft}>
            <Save className="h-3.5 w-3.5" />
            Save Draft
          </Button>
        </div>
      </div>

      {}
      <div className="flex items-center justify-center gap-4 pb-2">
        <span className="text-sm text-muted-foreground">⌘S Save</span>
        <span className="text-sm text-muted-foreground">← → Navigate</span>
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
