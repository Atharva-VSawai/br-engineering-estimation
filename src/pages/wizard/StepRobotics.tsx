'use client';

import React from 'react';
import { SectionCard } from '@/components/br/SectionCard';
import { ParamRow, NumberField, SelectField, CheckboxField } from '@/components/br/ParamRow';
import { useAppStore } from '@/store';
import { ROBOT_TYPES } from '@/data';
import { ArrowDown } from 'lucide-react';

export function StepRobotics() {
  const { config, updateRobotics } = useAppStore();
  const r = config.robotics;

  const robotFeatures = [
    { label: 'Motion Integration', key: 'motionIntegration' as const },
    { label: 'Vision Integration', key: 'visionIntegration' as const },
    { label: 'Pick & Place', key: 'pickAndPlace' as const },
    { label: 'Trajectory Programming', key: 'trajectoryProgramming' as const },
    { label: 'Synchronization', key: 'synchronization' as const },
    { label: 'Simulation', key: 'simulation' as const },
    { label: 'Safety', key: 'safety' as const },
    { label: 'Robot Diagnostics', key: 'robotDiagnostics' as const },
  ];

  return (
    <div className="space-y-4">
      <SectionCard title="Step 10 — Robotics" description="Configure robot integration.">
        <div className="mb-4">
          <ParamRow label="Robot Required?">
            <div className="flex gap-2">
              {[true, false].map((val) => (
                <button
                  key={String(val)}
                  onClick={() => updateRobotics({ enabled: val })}
                  className={`rounded-md border px-3 py-1.5 text-xs font-medium transition-colors ${
                    r.enabled === val
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border bg-card text-muted-foreground hover:border-primary/50'
                  }`}
                >
                  {val ? 'Yes' : 'No'}
                </button>
              ))}
            </div>
          </ParamRow>
        </div>

        {r.enabled && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-x-8 gap-y-1">
            <ParamRow label="Robot Type">
              <SelectField value={r.robotType} onChange={(v) => updateRobotics({ robotType: v })} options={ROBOT_TYPES} />
            </ParamRow>
            <ParamRow label="Robot Quantity">
              <NumberField value={r.quantity} onChange={(v) => updateRobotics({ quantity: v })} min={1} />
            </ParamRow>
          </div>
        )}
      </SectionCard>

      {r.enabled && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <SectionCard title="Robot Features">
            <div className="grid grid-cols-2 gap-x-4">
              {robotFeatures.map(({ label, key }) => (
                <CheckboxField
                  key={key}
                  label={label}
                  checked={r[key]}
                  onChange={(v) => updateRobotics({ [key]: v })}
                />
              ))}
            </div>
          </SectionCard>

          <SectionCard title="Integration Architecture" noPadding>
            <div className="flex flex-col items-center gap-0 py-3 px-4">
              {['Robot', 'Motion', 'Controller', 'Machine Sequence'].map((item, idx, arr) => (
                <React.Fragment key={item}>
                  <div className="rounded-md border border-border bg-card px-4 py-1.5 text-xs font-medium text-foreground">
                    {item}
                  </div>
                  {idx < arr.length - 1 && <ArrowDown className="h-4 w-4 text-muted-foreground" />}
                </React.Fragment>
              ))}
            </div>
          </SectionCard>
        </div>
      )}
    </div>
  );
}
