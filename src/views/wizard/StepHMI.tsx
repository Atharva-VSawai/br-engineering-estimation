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
                  className={`rounded-md border px-3 py-1.5 text-sm font-medium transition-colors ${
                    h.screenComplexity === level
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border bg-card text-muted-foreground hover:border-primary/50'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </ParamRow>
        </div>
      </SectionCard>

      <SectionCard title="Screen Preview" description="Configuration-based HMI screen layout preview">
        <div className="rounded-lg border-2 border-gray-300 bg-gray-50 overflow-hidden aspect-[16/10]">
          {}
          <div className="h-8 bg-primary/90 flex items-center px-3">
            <span className="text-white text-sm font-bold truncate">{config.project.name || 'Untitled Project'}</span>
            <div className="ml-auto flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-400" />
              <span className="text-white text-sm">{h.screens > 0 ? 'Configured' : 'No Screens'}</span>
            </div>
          </div>
          {}
          <div className="flex" style={{ height: 'calc(100% - 2rem)' }}>
            {}
            <div className="w-32 bg-card border-r border-gray-200 p-1.5 shrink-0">
              <div className={`h-5 rounded text-sm flex items-center px-1.5 mb-0.5 bg-primary/10 text-primary`}>Overview</div>
              {activeFeatures.length > 0 ? activeFeatures.map((f) => (
                <div key={f.key} className="h-5 rounded text-sm flex items-center px-1.5 mb-0.5 text-gray-400">
                  {f.label}
                </div>
              )) : (
                <div className="text-xs text-gray-400 px-1.5 mt-1">No features enabled</div>
              )}
            </div>
            {}
            <div className="flex-1 p-3">
              <div className="grid grid-cols-2 gap-2 h-full">
                <div className="rounded border border-gray-200 bg-card p-2">
                  <div className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">HMI Type</div>
                  <div className="text-sm font-bold text-foreground">{h.type}</div>
                </div>
                <div className="rounded border border-gray-200 bg-card p-2">
                  <div className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1">Screens</div>
                  <div className="text-lg font-bold text-foreground leading-none mt-2">{h.screens}</div>
                  <div className="text-sm text-gray-400 mt-0.5">{hmiComplexity} complexity</div>
                </div>
                <div className="rounded border border-gray-200 bg-card p-2">
                  <div className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1">Features</div>
                  <div className="text-sm text-green-600 font-medium mt-1.5">{activeFeatures.length} enabled</div>
                </div>
                <div className="rounded border border-gray-200 bg-card p-2">
                  <div className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1">Config Level</div>
                  <div className="mt-1.5 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(100, (activeFeatures.length / hmiFeatures.length) * 100)}%` }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
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
                const isActive = activeFeatures.some(f => f.label.includes(item.split(' ')[0]));
                return (
                  <div key={item} className="flex items-center gap-2 text-sm">
                    <div className={`h-1.5 w-1.5 rounded-full ${isActive ? 'bg-primary' : 'bg-border'}`} />
                    <span className={isActive ? 'text-foreground font-medium' : 'text-muted-foreground'}>{item}</span>
                  </div>
                );
              })}
            </div>
          </SectionCard>

          <SectionCard title="Estimated HMI Complexity">
            <div className="flex items-center gap-2">
              <span className={`text-sm font-semibold rounded-md px-2 py-0.5 border ${
                hmiComplexity === 'Complex' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                hmiComplexity === 'Moderate' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                'bg-emerald-50 text-emerald-700 border-emerald-200'
              }`}>
                {hmiComplexity}
              </span>
              <span className="text-sm text-muted-foreground">{activeFeatures.length} features active · {h.screens} screens</span>
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
