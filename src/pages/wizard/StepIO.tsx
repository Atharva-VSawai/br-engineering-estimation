'use client';

import React, { useMemo } from 'react';
import { SectionCard } from '@/components/br/SectionCard';
import { ParamRow, NumberField } from '@/components/br/ParamRow';
import { useAppStore } from '@/store';
import { Info } from 'lucide-react';

export function StepIO() {
  const { config, updateIO } = useAppStore();
  const io = config.io;

  const totalIO = useMemo(() => {
    return io.digitalInputs + io.digitalOutputs + io.analogInputs + io.analogOutputs +
      io.safetyIO + io.encoderCounterModules + io.temperatureModules + io.communicationIO + io.specialModules;
  }, [io]);

  const ioComplexity = useMemo(() => {
    if (totalIO > 500) return 'Complex';
    if (totalIO > 200) return 'Moderate';
    return 'Simple';
  }, [totalIO]);

  const ioItems = [
    { label: 'Digital Inputs', key: 'digitalInputs' as const, value: io.digitalInputs },
    { label: 'Digital Outputs', key: 'digitalOutputs' as const, value: io.digitalOutputs },
    { label: 'Analog Inputs', key: 'analogInputs' as const, value: io.analogInputs },
    { label: 'Analog Outputs', key: 'analogOutputs' as const, value: io.analogOutputs },
    { label: 'Safety I/O', key: 'safetyIO' as const, value: io.safetyIO },
    { label: 'Encoder / Counter Modules', key: 'encoderCounterModules' as const, value: io.encoderCounterModules },
    { label: 'Temperature Modules', key: 'temperatureModules' as const, value: io.temperatureModules },
    { label: 'Communication I/O', key: 'communicationIO' as const, value: io.communicationIO },
    { label: 'Special Modules', key: 'specialModules' as const, value: io.specialModules },
  ];

  return (
    <div className="space-y-4">
      <SectionCard title="Step 3 — I/O Configuration" description="Configure digital, analog, and special I/O modules.">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-1">
          {ioItems.map(({ label, key, value }) => (
            <ParamRow key={key} label={label}>
              <NumberField value={value} onChange={(v) => updateIO({ [key]: v })} />
            </ParamRow>
          ))}
        </div>
      </SectionCard>

      {/* I/O Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SectionCard title="I/O Complexity Preview">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Total I/O Points</span>
              <span className="text-sm font-bold text-foreground">{totalIO}</span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all"
                style={{ width: `${Math.min(100, (totalIO / 500) * 100)}%` }}
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">I/O Complexity:</span>
              <span className={`text-xs font-semibold rounded-md px-2 py-0.5 border ${
                ioComplexity === 'Simple' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                ioComplexity === 'Moderate' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                'bg-red-50 text-red-700 border-red-200'
              }`}>
                {ioComplexity}
              </span>
            </div>
          </div>
        </SectionCard>

        <div className="flex items-start gap-2.5 rounded-md border border-amber-200 bg-amber-50/50 p-3 self-start">
          <Info className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-800 leading-relaxed">
            Raw I/O count is not the only factor. Signal type, special modules, safety requirements, scaling and device integration can affect engineering complexity.
          </p>
        </div>
      </div>
    </div>
  );
}
