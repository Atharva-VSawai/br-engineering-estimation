'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { SectionCard } from '@/components/br/SectionCard';
import { useAppStore } from '@/store';

const IO_ROWS: { key: keyof import('@/types').IOConfig; label: string; colorClass: string }[] = [
  { key: 'digitalInputs', label: 'Digital Inputs', colorClass: 'bg-primary/80' },
  { key: 'digitalOutputs', label: 'Digital Outputs', colorClass: 'bg-primary/80' },
  { key: 'analogInputs', label: 'Analog Inputs', colorClass: 'bg-blue-400' },
  { key: 'analogOutputs', label: 'Analog Outputs', colorClass: 'bg-blue-400' },
  { key: 'safetyIO', label: 'Safety I/O', colorClass: 'bg-emerald-400' },
  { key: 'encoderCounterModules', label: 'Encoder/Counter', colorClass: 'bg-amber-400' },
  { key: 'temperatureModules', label: 'Temperature', colorClass: 'bg-amber-400' },
  { key: 'communicationIO', label: 'Communication', colorClass: 'bg-amber-400' },
  { key: 'specialModules', label: 'Special', colorClass: 'bg-amber-400' },
];

export function TechnicalParamsPage() {
  const { config } = useAppStore();
  const c = config;

  const totalIO = c.io.digitalInputs + c.io.digitalOutputs + c.io.analogInputs + c.io.analogOutputs +
    c.io.safetyIO + c.io.encoderCounterModules + c.io.temperatureModules + c.io.communicationIO + c.io.specialModules;

  const activeProtocols = c.communication.protocols.filter((p) => p.enabled);
  const enabledFeatures = c.additionalFeatures.filter((f) => f.enabled);

  const { maxValue, ioValues } = useMemo(() => {
    const values = IO_ROWS.map((row) => ({
      ...row,
      value: c.io[row.key] as number,
    }));
    const max = Math.max(...values.filter((v) => v.value > 0).map((v) => v.value), 1);
    return { maxValue: max, ioValues: values };
  }, [c.io]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-bold text-foreground">Technical Parameters</h1>
        <p className="text-sm text-muted-foreground">
          Overview of all configured technical parameters for the current project.
        </p>
      </div>

      <SectionCard title="I/O Summary">
        <div className="space-y-2.5">
          {ioValues.map((row, index) => (
            <motion.div
              key={row.key}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05, duration: 0.25 }}
              className="flex items-center gap-3"
            >
              <div className="w-28 shrink-0 text-xs text-muted-foreground text-right">{row.label}</div>
              <div className="flex-1 h-5 bg-muted rounded-sm overflow-hidden">
                <motion.div
                  className={`h-full rounded-sm ${row.value > 0 ? row.colorClass : 'bg-muted'}`}
                  initial={{ width: 0 }}
                  animate={{ width: row.value > 0 ? `${(row.value / maxValue) * 100}%` : '0%' }}
                  transition={{ delay: index * 0.05 + 0.1, duration: 0.4, ease: 'easeOut' }}
                />
              </div>
              <div className={`w-8 text-xs font-medium text-right ${row.value > 0 ? 'text-foreground' : 'text-muted-foreground'}`}>{row.value}</div>
            </motion.div>
          ))}
        </div>
      </SectionCard>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="rounded-md border border-border bg-card p-3">
          <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Controller</div>
          <div className="text-sm font-bold text-foreground mt-1">{c.controller.family}</div>
          <div className="text-[11px] text-muted-foreground">{c.controller.performance} · {c.controller.quantity}x</div>
        </div>
        <div className="rounded-md border border-border bg-card p-3">
          <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Total I/O</div>
          <div className="text-sm font-bold text-foreground mt-1">{totalIO}</div>
          <div className="text-[11px] text-muted-foreground">DI:{c.io.digitalInputs} DO:{c.io.digitalOutputs} AI:{c.io.analogInputs}</div>
        </div>
        <div className="rounded-md border border-border bg-card p-3">
          <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Motion Axes</div>
          <div className="text-sm font-bold text-foreground mt-1">{c.motion.totalAxes}</div>
          <div className="text-[11px] text-muted-foreground">Linear:{c.motion.linearAxes} Rotary:{c.motion.rotaryAxes}</div>
        </div>
        <div className="rounded-md border border-border bg-card p-3">
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
                  <span key={p.name} className="inline-flex items-center rounded-md border border-border bg-card px-2 py-0.5 text-[11px] font-medium text-foreground">
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
                  <span key={f.name} className="inline-flex items-center rounded-md border border-border bg-card px-2 py-0.5 text-[11px] font-medium text-foreground">
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
