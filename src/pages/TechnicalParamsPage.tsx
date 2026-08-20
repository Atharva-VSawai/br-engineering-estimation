'use client';

import React from 'react';
import { SectionCard } from '@/components/br/SectionCard';
import { useAppStore } from '@/store';

export function TechnicalParamsPage() {
  const { config } = useAppStore();
  const c = config;

  const totalIO = c.io.digitalInputs + c.io.digitalOutputs + c.io.analogInputs + c.io.analogOutputs +
    c.io.safetyIO + c.io.encoderCounterModules + c.io.temperatureModules + c.io.communicationIO + c.io.specialModules;

  const activeProtocols = c.communication.protocols.filter((p) => p.enabled);
  const enabledFeatures = c.additionalFeatures.filter((f) => f.enabled);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-bold text-foreground">Technical Parameters</h1>
        <p className="text-sm text-muted-foreground">
          Overview of all configured technical parameters for the current project.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="rounded-md border border-border bg-white p-3">
          <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Controller</div>
          <div className="text-sm font-bold text-foreground mt-1">{c.controller.family}</div>
          <div className="text-[11px] text-muted-foreground">{c.controller.performance} · {c.controller.quantity}x</div>
        </div>
        <div className="rounded-md border border-border bg-white p-3">
          <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Total I/O</div>
          <div className="text-sm font-bold text-foreground mt-1">{totalIO}</div>
          <div className="text-[11px] text-muted-foreground">DI:{c.io.digitalInputs} DO:{c.io.digitalOutputs} AI:{c.io.analogInputs}</div>
        </div>
        <div className="rounded-md border border-border bg-white p-3">
          <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Motion Axes</div>
          <div className="text-sm font-bold text-foreground mt-1">{c.motion.totalAxes}</div>
          <div className="text-[11px] text-muted-foreground">Linear:{c.motion.linearAxes} Rotary:{c.motion.rotaryAxes}</div>
        </div>
        <div className="rounded-md border border-border bg-white p-3">
          <div className="text-[10px] text-muted-foreground uppercase tracking-wide">HMI</div>
          <div className="text-sm font-bold text-foreground mt-1">{c.hmi.type}</div>
          <div className="text-[11px] text-muted-foreground">{c.hmi.screens} screens · {c.hmi.screenComplexity}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SectionCard title="System Components">
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between"><span className="text-muted-foreground">Vision</span><span className="text-foreground font-medium">{c.vision.enabled ? `${c.vision.cameras} camera(s)` : 'Not configured'}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Safety</span><span className="text-foreground font-medium">{c.safety.enabled ? `${c.safety.controller} (${c.safety.safetyIOCount} I/O)` : 'Not configured'}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Mechatronics</span><span className="text-foreground font-medium">{c.mechatronics.type !== 'None' ? `${c.mechatronics.type} (${c.mechatronics.movers} movers)` : 'None'}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Robotics</span><span className="text-foreground font-medium">{c.robotics.enabled ? `${c.robotics.robotType} x${c.robotics.quantity}` : 'Not configured'}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Industrial PC</span><span className="text-foreground font-medium">{c.iiot.ipcRequired ? c.iiot.ipcModel : 'Not configured'}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">IIoT</span><span className="text-foreground font-medium">{c.iiot.iiotRequired ? 'Enabled' : 'Not configured'}</span></div>
          </div>
        </SectionCard>

        <SectionCard title="Communication & Features">
          <div className="space-y-3">
            <div>
              <div className="text-xs font-medium text-foreground mb-1">Protocols</div>
              <div className="flex flex-wrap gap-1.5">
                {activeProtocols.length > 0 ? activeProtocols.map((p) => (
                  <span key={p.name} className="inline-flex items-center rounded-md border border-border bg-white px-2 py-0.5 text-[11px] font-medium text-foreground">
                    {p.name} ({p.devices})
                  </span>
                )) : (
                  <span className="text-xs text-muted-foreground">None configured</span>
                )}
              </div>
            </div>
            <div>
              <div className="text-xs font-medium text-foreground mb-1">Additional Features</div>
              <div className="flex flex-wrap gap-1.5">
                {enabledFeatures.length > 0 ? enabledFeatures.map((f) => (
                  <span key={f.name} className="inline-flex items-center rounded-md border border-border bg-white px-2 py-0.5 text-[11px] font-medium text-foreground">
                    {f.name}
                  </span>
                )) : (
                  <span className="text-xs text-muted-foreground">None configured</span>
                )}
              </div>
            </div>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}