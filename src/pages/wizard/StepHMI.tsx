'use client';

import React from 'react';
import { SectionCard } from '@/components/br/SectionCard';
import { ParamRow, SelectField, NumberField, CheckboxField } from '@/components/br/ParamRow';
import { useAppStore } from '@/store';
import { HMI_TYPES } from '@/data';

export function StepHMI() {
  const { config, updateHMI } = useAppStore();
  const h = config.hmi;

  const hmiFeatures = [
    { label: 'Alarm Management', key: 'alarmManagement' as const },
    { label: 'Recipe Management', key: 'recipeManagement' as const },
    { label: 'Trend Visualization', key: 'trendVisualization' as const },
    { label: 'User Management', key: 'userManagement' as const },
    { label: 'Machine Diagnostics', key: 'machineDiagnostics' as const },
    { label: 'Manual Mode', key: 'manualMode' as const },
    { label: 'Automatic Mode', key: 'automaticMode' as const },
    { label: 'Maintenance Screens', key: 'maintenanceScreens' as const },
    { label: 'Parameter Management', key: 'parameterManagement' as const },
  ];

  const activeFeatures = hmiFeatures.filter((f) => h[f.key]);
  const hmiComplexity = h.screenComplexity;

  const engPreview = [
    'UI Development',
    'PLC Tag Integration',
    'Alarm Configuration',
    'Recipe Integration',
    'User Management',
    'Testing',
  ];

  return (
    <div className="space-y-4">
      <SectionCard title="Step 5 — HMI / Visualization" description="Configure the operator interface and visualization.">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-x-8 gap-y-1">
          <ParamRow label="HMI Type">
            <SelectField value={h.type} onChange={(v) => updateHMI({ type: v })} options={HMI_TYPES} />
          </ParamRow>
          <ParamRow label="Number of HMI Screens">
            <NumberField value={h.screens} onChange={(v) => updateHMI({ screens: v })} />
          </ParamRow>
          <ParamRow label="Screen Complexity">
            <div className="flex gap-2">
              {(['Basic', 'Moderate', 'Complex'] as const).map((level) => (
                <button
                  key={level}
                  onClick={() => updateHMI({ screenComplexity: level })}
                  className={`rounded-md border px-3 py-1.5 text-xs font-medium transition-colors ${
                    h.screenComplexity === level
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border bg-white text-muted-foreground hover:border-primary/50'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </ParamRow>
        </div>
      </SectionCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SectionCard title="HMI Features">
          <div className="grid grid-cols-2 gap-x-4">
            {hmiFeatures.map(({ label, key }) => (
              <CheckboxField
                key={key}
                label={label}
                checked={h[key]}
                onChange={(v) => updateHMI({ [key]: v })}
              />
            ))}
          </div>
        </SectionCard>

        <div className="space-y-4">
          <SectionCard title="HMI Engineering Preview">
            <div className="space-y-2">
              {engPreview.map((item) => {
                const active = item === 'UI Development' || item === 'PLC Tag Integration' || item === 'Testing';
                return (
                  <div key={item} className="flex items-center gap-2 text-xs">
                    <div className={`h-1.5 w-1.5 rounded-full ${active ? 'bg-primary' : 'bg-border'}`} />
                    <span className={active ? 'text-foreground font-medium' : 'text-muted-foreground'}>{item}</span>
                  </div>
                );
              })}
            </div>
          </SectionCard>

          <SectionCard title="Estimated HMI Complexity">
            <div className="flex items-center gap-2">
              <span className={`text-xs font-semibold rounded-md px-2 py-0.5 border ${
                hmiComplexity === 'Complex' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                hmiComplexity === 'Moderate' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                'bg-emerald-50 text-emerald-700 border-emerald-200'
              }`}>
                {hmiComplexity}
              </span>
              <span className="text-xs text-muted-foreground">{activeFeatures.length} features active · {h.screens} screens</span>
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
