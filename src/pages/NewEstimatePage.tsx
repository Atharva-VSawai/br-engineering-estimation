'use client';

import React from 'react';
import { ArrowLeft, ArrowRight, Save, RotateCcw, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
  const { wizardStep, setWizardStep, loadSampleConfig } = useAppStore();
  const totalSteps = STEP_COMPONENTS.length;
  const isLastStep = wizardStep === totalSteps - 1;
  const isFirstStep = wizardStep === 0;
  const StepComponent = STEP_COMPONENTS[wizardStep];

  return (
    <div className="space-y-4">
      <ProgressStepper currentStep={wizardStep} onStepClick={setWizardStep} />

      <div className="min-h-[calc(100vh-260px)]">
        <StepComponent />
      </div>

      <div className="flex items-center justify-between border-t border-border pt-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs" onClick={() => setWizardStep(0)} title="Reset configuration">
            <RotateCcw className="h-3.5 w-3.5" />
            Reset
          </Button>
          <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs" onClick={loadSampleConfig} title="Load sample packaging machine configuration">
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
          <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
            <Save className="h-3.5 w-3.5" />
            Save Draft
          </Button>
        </div>
      </div>
    </div>
  );
}
