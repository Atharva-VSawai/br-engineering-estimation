'use client';

import React from 'react';
import { SectionCard } from '@/components/br/SectionCard';
import { ParamRow, NumberField, CheckboxField } from '@/components/br/ParamRow';
import { useAppStore } from '@/store';
import { Info } from 'lucide-react';

export function StepMechatronics() {
  const { config, updateMechatronics } = useAppStore();
  const m = config.mechatronics;

  const mechatronicsFeatures = [
    { label: 'Mover Routing', key: 'moverRouting' as const },
    { label: 'Independent Mover Control', key: 'independentMoverControl' as const },
    { label: 'Synchronization', key: 'synchronization' as const },
    { label: 'Transport Sequences', key: 'transportSequences' as const },
    { label: 'Product Handling', key: 'productHandling' as const },
    { label: 'Vision Integration', key: 'visionIntegration' as const },
    { label: 'HMI Integration', key: 'hmiIntegration' as const },
    { label: 'Safety Integration', key: 'safetyIntegration' as const },
    { label: 'Diagnostics', key: 'diagnostics' as const },
  ];

  return (
    <div className="space-y-4">
      <SectionCard title="Step 9 — Mechatronic Systems" description="Configure B&R mechatronic transport systems.">
        <ParamRow label="System Type">
          <div className="flex gap-2">
            {(['None', 'ACOPOStrak', 'ACOPOS 6D', 'SuperTrak'] as const).map((type) => (
              <button
                key={type}
                onClick={() => updateMechatronics({ type })}
                className={`rounded-md border px-3 py-1.5 text-xs font-medium transition-colors ${
                  m.type === type
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border bg-white text-muted-foreground hover:border-primary/50'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </ParamRow>
      </SectionCard>

      {m.type !== 'None' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <SectionCard title="Track Configuration">
            <ParamRow label="Number of Movers">
              <NumberField value={m.movers} onChange={(v) => updateMechatronics({ movers: v })} />
            </ParamRow>
            <ParamRow label="Number of Processing Stations">
              <NumberField value={m.processingStations} onChange={(v) => updateMechatronics({ processingStations: v })} />
            </ParamRow>
          </SectionCard>

          <SectionCard title="Track Architecture" noPadding>
            <div className="py-3 px-4 font-mono text-xs text-muted-foreground leading-relaxed">
              <div>Track</div>
              <div className="ml-4">
                {Array.from({ length: Math.min(4, Math.max(m.movers, 1)) }).map((_, i) => (
                  <div key={i}>├── Mover {String.fromCharCode(65 + i)}</div>
                ))}
                {m.movers > 4 && <div>└── ... ({m.movers - 4} more)</div>}
              </div>
            </div>
          </SectionCard>
        </div>
      )}

      {m.type !== 'None' && (
        <SectionCard title="Mechatronics Features">
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-4">
            {mechatronicsFeatures.map(({ label, key }) => (
              <CheckboxField
                key={key}
                label={label}
                checked={m[key]}
                onChange={(v) => updateMechatronics({ [key]: v })}
              />
            ))}
          </div>
        </SectionCard>
      )}

      {m.type !== 'None' && (
        <div className="flex items-start gap-2.5 rounded-md border border-amber-200 bg-amber-50/50 p-3">
          <Info className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-800 leading-relaxed">
            Mechatronic transport systems introduce engineering considerations beyond conventional conveyor systems, including mover control, routing, synchronization and station interaction.
          </p>
        </div>
      )}
    </div>
  );
}
