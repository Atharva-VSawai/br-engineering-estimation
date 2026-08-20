'use client';

import React from 'react';
import { SectionCard } from '@/components/br/SectionCard';
import { useAppStore } from '@/store';

export function StepAdditionalFeatures() {
  const { config, updateAdditionalFeature } = useAppStore();
  const features = config.additionalFeatures;

  return (
    <div className="space-y-4">
      <SectionCard title="Step 12 — Additional Automation Features" description="Select additional automation functions and their complexity.">
        <div className="overflow-x-auto -mx-4 px-4">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left text-xs font-semibold text-muted-foreground pb-2 pr-4">Feature</th>
                <th className="text-center text-xs font-semibold text-muted-foreground pb-2 px-3">Enable</th>
                <th className="text-left text-xs font-semibold text-muted-foreground pb-2 pl-3">Complexity</th>
              </tr>
            </thead>
            <tbody>
              {features.map((f) => (
                <tr key={f.name} className="border-b border-border/50 last:border-0">
                  <td className="py-2 pr-4 text-xs font-medium text-foreground">{f.name}</td>
                  <td className="py-2 px-3 text-center">
                    <input
                      type="checkbox"
                      checked={f.enabled}
                      onChange={(e) => updateAdditionalFeature(f.name, { enabled: e.target.checked })}
                      className="h-3.5 w-3.5 rounded border-input text-primary accent-primary cursor-pointer"
                    />
                  </td>
                  <td className="py-2 pl-3">
                    <div className="flex gap-1.5">
                      {(['Basic', 'Moderate', 'Complex'] as const).map((level) => (
                        <button
                          key={level}
                          disabled={!f.enabled}
                          onClick={() => updateAdditionalFeature(f.name, { complexity: level })}
                          className={`rounded border px-2 py-0.5 text-[11px] font-medium transition-colors disabled:opacity-40 ${
                            f.complexity === level
                              ? 'border-primary bg-primary/10 text-primary'
                              : 'border-border bg-white text-muted-foreground hover:border-primary/50'
                          }`}
                        >
                          {level}
                        </button>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
}
