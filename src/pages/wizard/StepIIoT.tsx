'use client';

import React from 'react';
import { SectionCard } from '@/components/br/SectionCard';
import { ParamRow, SelectField, CheckboxField } from '@/components/br/ParamRow';
import { useAppStore } from '@/store';
import { IPC_MODELS } from '@/data';

export function StepIIoT() {
  const { config, updateIIoT } = useAppStore();
  const i = config.iiot;

  const iiotFeatures = [
    { label: 'IIoT Connector', key: 'iiotConnector' as const },
    { label: 'IIoT Services', key: 'iiotServices' as const },
    { label: 'IIoT Edge Device', key: 'iiotEdgeDevice' as const },
    { label: 'Cloud Connectivity', key: 'cloudConnectivity' as const },
    { label: 'Machine Data Collection', key: 'machineDataCollection' as const },
    { label: 'Remote Maintenance', key: 'remoteMaintenance' as const },
    { label: 'OPC UA', key: 'opcUa' as const },
    { label: 'Data Logging', key: 'dataLogging' as const },
    { label: 'Analytics Integration', key: 'analyticsIntegration' as const },
  ];

  return (
    <div className="space-y-4">
      <SectionCard title="Step 11 — Industrial Computing & IIoT" description="Configure industrial PC and IIoT capabilities.">
        <div className="mb-4">
          <ParamRow label="Industrial PC Required?">
            <div className="flex gap-2">
              {[true, false].map((val) => (
                <button
                  key={String(val)}
                  onClick={() => updateIIoT({ ipcRequired: val })}
                  className={`rounded-md border px-3 py-1.5 text-xs font-medium transition-colors ${
                    i.ipcRequired === val
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

        {i.ipcRequired && (
          <ParamRow label="Industrial PC Model">
            <SelectField value={i.ipcModel} onChange={(v) => updateIIoT({ ipcModel: v })} options={IPC_MODELS} />
          </ParamRow>
        )}
      </SectionCard>

      <SectionCard title="IIoT Configuration">
        <div className="mb-3">
          <ParamRow label="IIoT Required?">
            <div className="flex gap-2">
              {[true, false].map((val) => (
                <button
                  key={String(val)}
                  onClick={() => updateIIoT({ iiotRequired: val })}
                  className={`rounded-md border px-3 py-1.5 text-xs font-medium transition-colors ${
                    i.iiotRequired === val
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

        {i.iiotRequired && (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-4">
            {iiotFeatures.map(({ label, key }) => (
              <CheckboxField
                key={key}
                label={label}
                checked={i[key]}
                onChange={(v) => updateIIoT({ [key]: v })}
              />
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  );
}
