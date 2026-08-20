'use client';

import React from 'react';
import { Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SectionCard } from '@/components/br/SectionCard';
import { useAppStore } from '@/store';

export function StepReview() {
  const { config, setWizardStep } = useAppStore();
  const c = config;

  const goToStep = (step: number) => setWizardStep(step);

  const yesNo = (v: boolean) => v ? 'Yes' : 'No';
  const listEnabled = (arr: { name: string; enabled: boolean }[]) => arr.filter((x) => x.enabled).map((x) => x.name);

  return (
    <div className="space-y-4">
      <SectionCard title="Engineering Configuration Review" description="Review all configured parameters before generating the estimate summary.">
        <div className="space-y-1">
          {[
            { title: 'Project', step: 0, content: (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-1 text-xs">
                <div><span className="text-muted-foreground">Name:</span> <span className="font-medium text-foreground ml-1">{c.project.name || '—'}</span></div>
                <div><span className="text-muted-foreground">Customer:</span> <span className="font-medium text-foreground ml-1">{c.project.customer || '—'}</span></div>
                <div><span className="text-muted-foreground">Machine Type:</span> <span className="font-medium text-foreground ml-1">{c.project.machineType || '—'}</span></div>
                <div><span className="text-muted-foreground">Industry:</span> <span className="font-medium text-foreground ml-1">{c.project.industry || '—'}</span></div>
                <div><span className="text-muted-foreground">Variants:</span> <span className="font-medium text-foreground ml-1">{c.project.projectVariants}</span></div>
                <div><span className="text-muted-foreground">Stations:</span> <span className="font-medium text-foreground ml-1">{c.project.machineStations}</span></div>
              </div>
            )},
            { title: 'Controller', step: 1, content: (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-1 text-xs">
                <div><span className="text-muted-foreground">Family:</span> <span className="font-medium text-foreground ml-1">{c.controller.family}</span></div>
                <div><span className="text-muted-foreground">Quantity:</span> <span className="font-medium text-foreground ml-1">{c.controller.quantity}</span></div>
                <div><span className="text-muted-foreground">Performance:</span> <span className="font-medium text-foreground ml-1">{c.controller.performance}</span></div>
                <div><span className="text-muted-foreground">Redundancy:</span> <span className="font-medium text-foreground ml-1">{yesNo(c.controller.redundancyRequired)}</span></div>
                <div><span className="text-muted-foreground">Simulation:</span> <span className="font-medium text-foreground ml-1">{yesNo(c.controller.simulationRequired)}</span></div>
              </div>
            )},
            { title: 'I/O', step: 2, content: (
              <div className="grid grid-cols-3 lg:grid-cols-5 gap-x-6 gap-y-1 text-xs">
                <div><span className="text-muted-foreground">DI:</span> <span className="font-medium text-foreground ml-1">{c.io.digitalInputs}</span></div>
                <div><span className="text-muted-foreground">DO:</span> <span className="font-medium text-foreground ml-1">{c.io.digitalOutputs}</span></div>
                <div><span className="text-muted-foreground">AI:</span> <span className="font-medium text-foreground ml-1">{c.io.analogInputs}</span></div>
                <div><span className="text-muted-foreground">AO:</span> <span className="font-medium text-foreground ml-1">{c.io.analogOutputs}</span></div>
                <div><span className="text-muted-foreground">Safety:</span> <span className="font-medium text-foreground ml-1">{c.io.safetyIO}</span></div>
                <div><span className="text-muted-foreground">Enc/Counter:</span> <span className="font-medium text-foreground ml-1">{c.io.encoderCounterModules}</span></div>
                <div><span className="text-muted-foreground">Temp:</span> <span className="font-medium text-foreground ml-1">{c.io.temperatureModules}</span></div>
                <div><span className="text-muted-foreground">Comm:</span> <span className="font-medium text-foreground ml-1">{c.io.communicationIO}</span></div>
                <div><span className="text-muted-foreground">Special:</span> <span className="font-medium text-foreground ml-1">{c.io.specialModules}</span></div>
              </div>
            )},
            { title: 'Motion', step: 3, content: (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-1 text-xs">
                <div><span className="text-muted-foreground">Total Axes:</span> <span className="font-medium text-foreground ml-1">{c.motion.totalAxes}</span></div>
                <div><span className="text-muted-foreground">Linear:</span> <span className="font-medium text-foreground ml-1">{c.motion.linearAxes}</span></div>
                <div><span className="text-muted-foreground">Rotary:</span> <span className="font-medium text-foreground ml-1">{c.motion.rotaryAxes}</span></div>
                <div><span className="text-muted-foreground">Drives:</span> <span className="font-medium text-foreground ml-1">{c.motion.servoDrives}</span></div>
                <div><span className="text-muted-foreground">Motors:</span> <span className="font-medium text-foreground ml-1">{c.motion.servoMotors}</span></div>
                <div><span className="text-muted-foreground">Sync:</span> <span className="font-medium text-foreground ml-1">{yesNo(c.motion.synchronization)}</span></div>
                <div><span className="text-muted-foreground">E-Gearing:</span> <span className="font-medium text-foreground ml-1">{yesNo(c.motion.electronicGearing)}</span></div>
                <div><span className="text-muted-foreground">E-Camming:</span> <span className="font-medium text-foreground ml-1">{yesNo(c.motion.electronicCamming)}</span></div>
              </div>
            )},
            { title: 'HMI', step: 4, content: (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-1 text-xs">
                <div><span className="text-muted-foreground">Type:</span> <span className="font-medium text-foreground ml-1">{c.hmi.type}</span></div>
                <div><span className="text-muted-foreground">Screens:</span> <span className="font-medium text-foreground ml-1">{c.hmi.screens}</span></div>
                <div><span className="text-muted-foreground">Complexity:</span> <span className="font-medium text-foreground ml-1">{c.hmi.screenComplexity}</span></div>
                <div><span className="text-muted-foreground">Alarms:</span> <span className="font-medium text-foreground ml-1">{yesNo(c.hmi.alarmManagement)}</span></div>
                <div><span className="text-muted-foreground">Recipes:</span> <span className="font-medium text-foreground ml-1">{yesNo(c.hmi.recipeManagement)}</span></div>
              </div>
            )},
            { title: 'Vision', step: 5, content: (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-1 text-xs">
                <div><span className="text-muted-foreground">Enabled:</span> <span className="font-medium text-foreground ml-1">{yesNo(c.vision.enabled)}</span></div>
                <div><span className="text-muted-foreground">Cameras:</span> <span className="font-medium text-foreground ml-1">{c.vision.cameras}</span></div>
                <div><span className="text-muted-foreground">Triggering:</span> <span className="font-medium text-foreground ml-1">{c.vision.triggering || '—'}</span></div>
                <div><span className="text-muted-foreground">Inspection:</span> <span className="font-medium text-foreground ml-1">{yesNo(c.vision.inspection)}</span></div>
                <div><span className="text-muted-foreground">Barcode/QR:</span> <span className="font-medium text-foreground ml-1">{yesNo(c.vision.barcodeQR)}</span></div>
              </div>
            )},
            { title: 'Safety', step: 6, content: (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-1 text-xs">
                <div><span className="text-muted-foreground">Enabled:</span> <span className="font-medium text-foreground ml-1">{yesNo(c.safety.enabled)}</span></div>
                <div><span className="text-muted-foreground">Controller:</span> <span className="font-medium text-foreground ml-1">{c.safety.controller}</span></div>
                <div><span className="text-muted-foreground">Safety I/O:</span> <span className="font-medium text-foreground ml-1">{c.safety.safetyIOCount}</span></div>
                <div><span className="text-muted-foreground">E-Stops:</span> <span className="font-medium text-foreground ml-1">{c.safety.emergencyStops}</span></div>
                <div><span className="text-muted-foreground">Doors:</span> <span className="font-medium text-foreground ml-1">{c.safety.safetyDoors}</span></div>
              </div>
            )},
            { title: 'Communication', step: 7, content: (
              <div className="text-xs">
                <span className="text-muted-foreground">Protocols: </span>
                <span className="font-medium text-foreground">{listEnabled(c.communication.protocols).join(', ') || 'None'}</span>
                <span className="text-muted-foreground ml-3">MES: </span>
                <span className="font-medium text-foreground">{yesNo(c.communication.mesIntegration)}</span>
                <span className="text-muted-foreground ml-3">SCADA: </span>
                <span className="font-medium text-foreground">{yesNo(c.communication.scadaIntegration)}</span>
                <span className="text-muted-foreground ml-3">Cloud/IIoT: </span>
                <span className="font-medium text-foreground">{yesNo(c.communication.cloudIIoTIntegration)}</span>
              </div>
            )},
            { title: 'Mechatronics', step: 8, content: (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-1 text-xs">
                <div><span className="text-muted-foreground">Type:</span> <span className="font-medium text-foreground ml-1">{c.mechatronics.type}</span></div>
                {c.mechatronics.type !== 'None' && (
                  <>
                    <div><span className="text-muted-foreground">Movers:</span> <span className="font-medium text-foreground ml-1">{c.mechatronics.movers}</span></div>
                    <div><span className="text-muted-foreground">Stations:</span> <span className="font-medium text-foreground ml-1">{c.mechatronics.processingStations}</span></div>
                  </>
                )}
              </div>
            )},
            { title: 'Robotics', step: 9, content: (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-1 text-xs">
                <div><span className="text-muted-foreground">Enabled:</span> <span className="font-medium text-foreground ml-1">{yesNo(c.robotics.enabled)}</span></div>
                {c.robotics.enabled && (
                  <>
                    <div><span className="text-muted-foreground">Type:</span> <span className="font-medium text-foreground ml-1">{c.robotics.robotType}</span></div>
                    <div><span className="text-muted-foreground">Quantity:</span> <span className="font-medium text-foreground ml-1">{c.robotics.quantity}</span></div>
                  </>
                )}
              </div>
            )},
            { title: 'Industrial PC / IIoT', step: 10, content: (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-1 text-xs">
                <div><span className="text-muted-foreground">IPC:</span> <span className="font-medium text-foreground ml-1">{c.iiot.ipcRequired ? c.iiot.ipcModel : 'Not required'}</span></div>
                <div><span className="text-muted-foreground">IIoT:</span> <span className="font-medium text-foreground ml-1">{yesNo(c.iiot.iiotRequired)}</span></div>
                <div><span className="text-muted-foreground">Cloud:</span> <span className="font-medium text-foreground ml-1">{yesNo(c.iiot.cloudConnectivity)}</span></div>
              </div>
            )},
            { title: 'Additional Features', step: 11, content: (
              <div className="text-xs">
                <span className="text-muted-foreground">Enabled: </span>
                <span className="font-medium text-foreground">{listEnabled(c.additionalFeatures).join(', ') || 'None'}</span>
              </div>
            )},
            { title: 'Complexity', step: 12, content: (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-1 text-xs">
                {(['hardware', 'motion', 'hmi', 'vision', 'safety', 'communication', 'software', 'integration', 'requirement', 'testing'] as const).map((key) => (
                  <div key={key} className="flex justify-between">
                    <span className="text-muted-foreground capitalize">{key}:</span>
                    <span className="font-medium text-foreground ml-1">{c.complexity[key]}</span>
                  </div>
                ))}
              </div>
            )},
          ].map(({ title, step, content }) => (
            <div key={title} className="flex items-start justify-between rounded-md border border-border bg-white p-3">
              <div className="min-w-0 flex-1">
                <div className="text-xs font-semibold text-foreground mb-1.5">{title}</div>
                {content}
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="shrink-0 ml-2 h-7 gap-1 text-[11px] text-muted-foreground hover:text-primary"
                onClick={() => goToStep(step)}
              >
                <Pencil className="h-3 w-3" />
                Edit
              </Button>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
