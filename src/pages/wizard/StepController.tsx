'use client';

import React from 'react';
import { Info } from 'lucide-react';
import { SectionCard } from '@/components/br/SectionCard';
import { ParamRow, SelectField, NumberField, ToggleField } from '@/components/br/ParamRow';
import { useAppStore } from '@/store';
import { CONTROLLER_FAMILIES } from '@/data';

export function StepController() {
  const { config, updateController } = useAppStore();
  const c = config.controller;

  const activeFeatures = [
    c.redundancyRequired && 'Redundancy',
    c.simulationRequired && 'Simulation',
    c.diagnosticsRequired && 'Diagnostics',
  ].filter(Boolean);

  return (
    <div className="space-y-4">
      <SectionCard title="Step 2 — Controller / PLC Configuration" description="Select the B&R controller platform and configuration.">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-1">
          <ParamRow label="Controller Family">
            <SelectField value={c.family} onChange={(v) => updateController({ family: v })} options={CONTROLLER_FAMILIES} valid={true} />
          </ParamRow>
          <ParamRow label="CPU / Controller Configuration">
            <div className="flex flex-wrap gap-2">
              {(['Basic', 'Standard', 'High Performance'] as const).map((level) => (
                <button
                  key={level}
                  onClick={() => updateController({ performance: level })}
                  className={`rounded-md border px-3 py-1.5 text-sm font-medium transition-colors ${
                    c.performance === level
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border bg-card text-muted-foreground hover:border-primary/50'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </ParamRow>
          <ParamRow label="Controller Count">
            <NumberField value={c.quantity} onChange={(v) => updateController({ quantity: v })} min={1} max={20} />
          </ParamRow>
          <ParamRow label="Communication Interfaces">
            <input
              type="text"
              value={c.communicationInterfaces}
              onChange={(e) => updateController({ communicationInterfaces: e.target.value })}
              placeholder="e.g. POWERLINK, Ethernet, OPC UA"
              className="h-9 w-full max-w-xs rounded-md border border-input bg-background px-3 text-sm"
            />
          </ParamRow>
        </div>
      </SectionCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SectionCard title="Controller Options">
          <div className="space-y-3">
            <ToggleField checked={c.redundancyRequired} onChange={(v) => updateController({ redundancyRequired: v })} description="Redundancy required for high-availability" />
            <ToggleField checked={c.simulationRequired} onChange={(v) => updateController({ simulationRequired: v })} description="Simulation / virtual commissioning" />
            <ToggleField checked={c.diagnosticsRequired} onChange={(v) => updateController({ diagnosticsRequired: v })} description="Advanced diagnostics & monitoring" />
          </div>
        </SectionCard>

        <SectionCard title="Engineering Indicators">
          <div className="space-y-2">
            {['Hardware Configuration', 'PLC Configuration', 'Communication Configuration', 'Diagnostics'].map((item) => (
              <div key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className={`h-1.5 w-1.5 rounded-full ${activeFeatures.includes(item.replace(' Configuration', '')) || item === 'Hardware Configuration' ? 'bg-primary' : 'bg-border'}`} />
                {item}
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      {/* Info panel */}
      <div className="flex items-start gap-2.5 rounded-md border border-amber-200 bg-amber-50/50 p-3">
        <Info className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
        <p className="text-sm text-amber-800 leading-relaxed">
          Controller selection affects hardware configuration, application architecture and integration requirements.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-sm text-muted-foreground">Potential Complexity:</span>
        <span className="text-sm font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-2 py-0.5">Medium</span>
      </div>
    </div>
  );
}
