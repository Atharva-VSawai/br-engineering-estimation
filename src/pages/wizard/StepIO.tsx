'use client';

import React, { useMemo } from 'react';
import { SectionCard } from '@/components/br/SectionCard';
import { ParamRow, NumberField } from '@/components/br/ParamRow';
import { useAppStore } from '@/store';
import { Info } from 'lucide-react';

const IO_BAR_COLORS = [
  'bg-blue-gray-400/70',  // Digital Inputs - blue-gray
  'bg-slate-400/70',       // Digital Outputs - slate
  'bg-teal-400/70',       // Analog Inputs - teal
  'bg-cyan-400/70',       // Analog Outputs - cyan
  'bg-red-400/30',        // Safety I/O - red
  'bg-purple-400/70',     // Encoder/Counter - purple
  'bg-amber-400/70',      // Temperature - amber
  'bg-indigo-400/70',     // Communication - indigo
  'bg-rose-400/70',       // Special - rose
] as const;

// Tailwind doesn't have blue-gray, so we use inline styles for that one
const IO_BAR_STYLES = [
  'bg-[#8b9cb5]',   // Digital Inputs - blue-gray (muted)
  'bg-slate-400',   // Digital Outputs - slate
  'bg-teal-400',    // Analog Inputs - teal
  'bg-cyan-400',    // Analog Outputs - cyan
  'bg-red-400/30',  // Safety I/O - red-400/30
  'bg-purple-400',  // Encoder/Counter - purple
  'bg-amber-400',   // Temperature - amber
  'bg-indigo-400',  // Communication - indigo
  'bg-rose-400',    // Special - rose
] as const;

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
    { label: 'Encoder / Counter', key: 'encoderCounterModules' as const, value: io.encoderCounterModules },
    { label: 'Temperature', key: 'temperatureModules' as const, value: io.temperatureModules },
    { label: 'Communication', key: 'communicationIO' as const, value: io.communicationIO },
    { label: 'Special', key: 'specialModules' as const, value: io.specialModules },
  ];

  const maxValue = useMemo(() => {
    const vals = ioItems.map(item => item.value);
    const max = Math.max(...vals, 1);
    return max;
  }, [ioItems]);

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

        {/* I/O Breakdown Bar Chart */}
        <div className="mt-6 rounded-lg bg-muted/30 p-4 space-y-2.5">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">I/O Breakdown</h4>
          {ioItems.map((item, index) => (
            <div key={item.key} className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground w-28 shrink-0 text-right truncate">
                {item.label}
              </span>
              <div className="flex-1 h-5 rounded-sm bg-muted/50 overflow-hidden relative">
                <div
                  className={`h-full rounded-sm transition-all duration-300 ${IO_BAR_STYLES[index]}`}
                  style={{ width: `${maxValue > 0 ? (item.value / maxValue) * 100 : 0}%`, minWidth: item.value > 0 ? '4px' : '0' }}
                />
              </div>
              <span className="text-xs font-medium text-foreground w-10 text-right tabular-nums">
                {item.value}
              </span>
            </div>
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
