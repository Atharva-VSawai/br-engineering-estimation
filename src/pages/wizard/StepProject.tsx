'use client';

import React from 'react';
import { SectionCard } from '@/components/br/SectionCard';
import { ParamRow, TextField, SelectField, TextAreaField, NumberField } from '@/components/br/ParamRow';
import { useAppStore } from '@/store';
import { MACHINE_TYPES, INDUSTRIES } from '@/data';

export function StepProject() {
  const { config, updateProjectInfo } = useAppStore();
  const p = config.project;

  return (
    <div className="space-y-4">
      <SectionCard title="Step 1 — Project Information" description="Enter the basic project details and scope.">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-1">
          <ParamRow label="Project Name *">
            <TextField value={p.name} onChange={(v) => updateProjectInfo({ name: v })} placeholder="e.g. Automated Packaging Machine" className="w-full max-w-md" valid={p.name.trim().length > 0} />
          </ParamRow>
          <ParamRow label="Customer">
            <TextField value={p.customer} onChange={(v) => updateProjectInfo({ customer: v })} placeholder="Customer name" className="w-full max-w-md" valid={p.customer.trim().length > 0} />
          </ParamRow>
          <ParamRow label="Machine Type *">
            <SelectField value={p.machineType} onChange={(v) => updateProjectInfo({ machineType: v })} options={MACHINE_TYPES} placeholder="Select machine type" valid={p.machineType !== ''} />
          </ParamRow>
          <ParamRow label="Industry">
            <SelectField value={p.industry} onChange={(v) => updateProjectInfo({ industry: v })} options={INDUSTRIES} placeholder="Select industry" />
          </ParamRow>
        </div>
        <div className="mt-2">
          <ParamRow label="Project Description">
            <TextAreaField value={p.description} onChange={(v) => updateProjectInfo({ description: v })} placeholder="Describe the machine, scope, and key requirements..." className="w-full max-w-2xl" />
          </ParamRow>
        </div>
      </SectionCard>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <SectionCard title="Requirement Clarity">
          <div className="flex flex-wrap gap-2">
            {(['Clear', 'Mostly Clear', 'Partially Clear', 'Unclear'] as const).map((level) => (
              <button
                key={level}
                onClick={() => updateProjectInfo({ requirementClarity: level })}
                className={`rounded-md border px-3 py-1.5 text-xs font-medium transition-colors ${
                  p.requirementClarity === level
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border bg-card text-muted-foreground hover:border-primary/50'
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Customer Involvement">
          <div className="flex flex-wrap gap-2">
            {(['Low', 'Medium', 'High'] as const).map((level) => (
              <button
                key={level}
                onClick={() => updateProjectInfo({ customerInvolvement: level })}
                className={`rounded-md border px-3 py-1.5 text-xs font-medium transition-colors ${
                  p.customerInvolvement === level
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border bg-card text-muted-foreground hover:border-primary/50'
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Project Scope">
          <ParamRow label="Expected Project Variants">
            <NumberField value={p.projectVariants} onChange={(v) => updateProjectInfo({ projectVariants: v })} min={1} max={100} />
          </ParamRow>
          <ParamRow label="Number of Machine Stations">
            <NumberField value={p.machineStations} onChange={(v) => updateProjectInfo({ machineStations: v })} min={1} max={100} />
          </ParamRow>
        </SectionCard>
      </div>
    </div>
  );
}
