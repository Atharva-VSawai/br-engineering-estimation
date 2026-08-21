'use client';

import React from 'react';
import { SectionCard } from '@/components/br/SectionCard';
import { NumberField, CheckboxField } from '@/components/br/ParamRow';
import { useAppStore } from '@/store';

export function StepCommunication() {
  const { config, updateCommunication, updateProtocol } = useAppStore();
  const c = config.communication;

  const activeProtocols = c.protocols.filter((p) => p.enabled);

  const engActivities = [
    'Network Configuration',
    'Device Mapping',
    'Protocol Configuration',
    'Data Exchange',
    'Diagnostics',
    'Troubleshooting',
  ];

  return (
    <div className="space-y-4">
      <SectionCard title="Step 8 — Industrial Communication" description="Configure communication protocols and network integrations.">
        <div className="overflow-x-auto -mx-4 px-4">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left text-sm font-semibold text-muted-foreground pb-2 pr-4">Protocol</th>
                <th className="text-center text-sm font-semibold text-muted-foreground pb-2 px-3">Enable</th>
                <th className="text-left text-sm font-semibold text-muted-foreground pb-2 pl-3">Devices</th>
              </tr>
            </thead>
            <tbody>
              {c.protocols.map((proto) => (
                <tr key={proto.name} className="border-b border-border/50 last:border-0">
                  <td className="py-2 pr-4 text-sm font-medium text-foreground">{proto.name}</td>
                  <td className="py-2 px-3 text-center">
                    <input
                      type="checkbox"
                      checked={proto.enabled}
                      onChange={(e) => updateProtocol(proto.name, { enabled: e.target.checked })}
                      className="h-3.5 w-3.5 rounded border-input text-primary accent-primary cursor-pointer"
                    />
                  </td>
                  <td className="py-2 pl-3">
                    <NumberField
                      value={proto.devices}
                      onChange={(v) => updateProtocol(proto.name, { devices: v })}
                      disabled={!proto.enabled}
                      className="w-20"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SectionCard title="External Systems">
          <div className="space-y-1">
            <CheckboxField label="PLC-to-PLC Communication" checked={c.plcToPlc} onChange={(v) => updateCommunication({ plcToPlc: v })} />
            <CheckboxField label="MES Integration" checked={c.mesIntegration} onChange={(v) => updateCommunication({ mesIntegration: v })} />
            <CheckboxField label="SCADA Integration" checked={c.scadaIntegration} onChange={(v) => updateCommunication({ scadaIntegration: v })} />
            <CheckboxField label="Cloud / IIoT Integration" checked={c.cloudIIoTIntegration} onChange={(v) => updateCommunication({ cloudIIoTIntegration: v })} />
          </div>
        </SectionCard>

        <SectionCard title="Communication Engineering">
          <div className="space-y-2">
            {engActivities.map((item) => {
              const active = activeProtocols.length > 0;
              return (
                <div key={item} className="flex items-center gap-2 text-sm">
                  <div className={`h-1.5 w-1.5 rounded-full ${active ? 'bg-primary' : 'bg-border'}`} />
                  <span className={active ? 'text-foreground font-medium' : 'text-muted-foreground'}>{item}</span>
                </div>
              );
            })}
          </div>
          <div className="mt-3 text-sm text-muted-foreground">
            {activeProtocols.length} protocol(s) active
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
