'use client';

import React from 'react';
import { SectionCard } from '@/components/br/SectionCard';
import { ParamRow, NumberField, SelectField, CheckboxField } from '@/components/br/ParamRow';
import { useAppStore } from '@/store';
import { SAFETY_CONTROLLERS } from '@/data';
import { ArrowDown } from 'lucide-react';

export function StepSafety() {
  const { config, updateSafety } = useAppStore();
  const s = config.safety;

  const safetyComplexity = !s.enabled ? 'N/A' :
    s.validationRequired && s.testingRequired && s.documentationRequired ? 'High' :
    s.validationRequired || s.testingRequired ? 'Medium' : 'Low';

  return (
    <div className="space-y-4">
      <SectionCard title="Step 7 — Safety Engineering" description="Configure safety system and safety functions.">
        <div className="mb-4">
          <ParamRow label="Safety Required?">
            <div className="flex gap-2">
              {[true, false].map((val) => (
                <button
                  key={String(val)}
                  onClick={() => updateSafety({ enabled: val })}
                  className={`rounded-md border px-3 py-1.5 text-sm font-medium transition-colors ${
                    s.enabled === val
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

        {s.enabled && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-1">
            <ParamRow label="Safety Controller">
              <SelectField value={s.controller} onChange={(v) => updateSafety({ controller: v })} options={SAFETY_CONTROLLERS} />
            </ParamRow>
            <ParamRow label="Safety I/O Count">
              <NumberField value={s.safetyIOCount} onChange={(v) => updateSafety({ safetyIOCount: v })} />
            </ParamRow>
            <ParamRow label="Emergency Stops">
              <NumberField value={s.emergencyStops} onChange={(v) => updateSafety({ emergencyStops: v })} />
            </ParamRow>
            <ParamRow label="Safety Doors">
              <NumberField value={s.safetyDoors} onChange={(v) => updateSafety({ safetyDoors: v })} />
            </ParamRow>
            <ParamRow label="Light Curtains">
              <NumberField value={s.lightCurtains} onChange={(v) => updateSafety({ lightCurtains: v })} />
            </ParamRow>
          </div>
        )}
      </SectionCard>

      {s.enabled && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <SectionCard title="Safety Functions">
            <div className="space-y-1">
              <CheckboxField label="Safe Motion" checked={s.safeMotion} onChange={(v) => updateSafety({ safeMotion: v })} />
              <CheckboxField label="Safety Functions" checked={s.safetyFunctions} onChange={(v) => updateSafety({ safetyFunctions: v })} />
              <CheckboxField label="Validation Required" checked={s.validationRequired} onChange={(v) => updateSafety({ validationRequired: v })} />
              <CheckboxField label="Testing Required" checked={s.testingRequired} onChange={(v) => updateSafety({ testingRequired: v })} />
              <CheckboxField label="Documentation Required" checked={s.documentationRequired} onChange={(v) => updateSafety({ documentationRequired: v })} />
            </div>
          </SectionCard>

          <div className="space-y-4">
            <SectionCard title="Safety Lifecycle" noPadding>
              <div className="flex flex-col items-center gap-0 py-3 px-4">
                {['Safety Design', 'Configuration', 'Programming', 'Validation', 'Testing', 'Commissioning'].map((item, idx, arr) => (
                  <React.Fragment key={item}>
                    <div className="rounded-md border border-border bg-card px-4 py-1.5 text-sm font-medium text-foreground">
                      {item}
                    </div>
                    {idx < arr.length - 1 && <ArrowDown className="h-4 w-4 text-muted-foreground" />}
                  </React.Fragment>
                ))}
              </div>
            </SectionCard>

            <SectionCard title="Safety Complexity">
              <div className="flex items-center gap-2">
                <span className={`text-sm font-semibold rounded-md px-2 py-0.5 border ${
                  safetyComplexity === 'High' ? 'bg-red-50 text-red-700 border-red-200' :
                  safetyComplexity === 'Medium' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                  safetyComplexity === 'Low' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                  'bg-gray-50 text-gray-500 border-gray-200'
                }`}>
                  {safetyComplexity}
                </span>
              </div>
            </SectionCard>
          </div>
        </div>
      )}
    </div>
  );
}
