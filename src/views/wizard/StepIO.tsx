'use client';

import React, { useMemo } from 'react';
import { SectionCard } from '@/components/br/SectionCard';
import { ParamRow, NumberField } from '@/components/br/ParamRow';
import { useAppStore } from '@/store';
import { Info } from 'lucide-react';

// Tailwind bar styles for I/O breakdown chart
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

  // Inline I/O summary bars (DI, DO, AI, AO, Safety)
  const summaryBars = [
    { label: 'DI', value: io.digitalInputs, fillClass: 'bg-primary/70' },
    { label: 'DO', value: io.digitalOutputs, fillClass: 'bg-primary/70' },
    { label: 'AI', value: io.analogInputs, fillClass: 'bg-blue-400' },
    { label: 'AO', value: io.analogOutputs, fillClass: 'bg-blue-400' },
    { label: 'Safety', value: io.safetyIO, fillClass: 'bg-emerald-400' },
  ];
  const summaryMax = Math.max(...summaryBars.map(b => b.value), 1);

  return (
    <div className="space-y-4">
      {/* Inline I/O Bar Summary */}
      <div className="rounded-md border border-border bg-muted/30 p-3">
        <div className="flex gap-4 items-end">
          {summaryBars.map((bar) => (
            <div key={bar.label} className="flex-1 min-w-0">
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${bar.fillClass}`}
                  style={{ width: `${(bar.value / summaryMax) * 100}%`, minWidth: bar.value > 0 ? '4px' : '0' }}
                />
              </div>
              <div className="mt-1 flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{bar.label}</span>
                <span className="text-sm font-medium text-foreground tabular-nums">{bar.value}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

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
          <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">I/O Breakdown</h4>
          {ioItems.map((item, index) => (
            <div key={item.key} className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground w-28 shrink-0 text-right truncate">
                {item.label}
              </span>
              <div className="flex-1 h-5 rounded-sm bg-muted/50 overflow-hidden relative">
                <div
                  className={`h-full rounded-sm transition-all duration-300 ${IO_BAR_STYLES[index]}`}
                  style={{ width: `${maxValue > 0 ? (item.value / maxValue) * 100 : 0}%`, minWidth: item.value > 0 ? '4px' : '0' }}
                />
              </div>
              <span className="text-sm font-medium text-foreground w-10 text-right tabular-nums">
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
              <span className="text-sm text-muted-foreground">Total I/O Points</span>
              <span className="text-sm font-bold text-foreground">{totalIO}</span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all"
                style={{ width: `${Math.min(100, (totalIO / 500) * 100)}%` }}
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">I/O Complexity:</span>
              <span className={`text-sm font-semibold rounded-md px-2 py-0.5 border ${
                ioComplexity === 'Simple' ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800' :
                ioComplexity === 'Moderate' ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800' :
                'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800'
              }`}>
                {ioComplexity}
              </span>
            </div>
          </div>
        </SectionCard>

        <div className="flex items-start gap-2.5 rounded-md border border-amber-200 dark:border-amber-800/50 bg-amber-50/50 dark:bg-amber-950/20 p-3 self-start">
          <Info className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <p className="text-sm text-amber-800 dark:text-amber-200 leading-relaxed">
            Raw I/O count is not the only factor. Signal type, special modules, safety requirements, scaling and device integration can affect engineering complexity.
          </p>
        </div>
      </div>
    </div>
  );
}
