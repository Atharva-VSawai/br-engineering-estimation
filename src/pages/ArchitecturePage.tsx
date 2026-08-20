'use client';

import React from 'react';
import { SectionCard } from '@/components/br/SectionCard';

export function ArchitecturePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-bold text-foreground">Machine Architecture</h1>
        <p className="text-sm text-muted-foreground">
          Visualize the system architecture of a typical B&R automation machine.
        </p>
      </div>

      <SectionCard title="System Architecture Diagram" noPadding>
        <div className="py-8 px-4">
          {/* ASCII-style architecture diagram using flex/grid */}
          <div className="flex flex-col items-center gap-1.5 font-mono text-xs">
            {/* Row 1: HMI */}
            <div className="rounded-md border-2 border-primary/40 bg-primary/5 px-6 py-2 font-sans font-semibold text-primary text-sm">
              HMI
            </div>
            <div className="text-muted-foreground">│</div>

            {/* Row 2: Vision - Controller - Safety */}
            <div className="flex items-center gap-8">
              <div className="rounded-md border border-border bg-white px-4 py-2 font-sans text-foreground">Vision</div>
              <div className="text-muted-foreground">──▶</div>
              <div className="rounded-md border-2 border-primary/40 bg-primary/5 px-6 py-2 font-sans font-semibold text-primary text-sm">
                Controller
              </div>
              <div className="text-muted-foreground">──▶</div>
              <div className="rounded-md border border-border bg-white px-4 py-2 font-sans text-foreground">Safety</div>
            </div>
            <div className="text-muted-foreground">│</div>

            {/* Row 3: I/O, Motion, Communication */}
            <div className="flex items-center gap-8">
              <div className="rounded-md border border-border bg-white px-4 py-2 font-sans text-foreground">I/O</div>
              <div className="rounded-md border border-primary/30 bg-white px-4 py-2 font-sans font-medium text-foreground ring-1 ring-primary/20">Motion</div>
              <div className="rounded-md border border-border bg-white px-4 py-2 font-sans text-foreground">Communication</div>
            </div>
            <div className="text-muted-foreground">│</div>

            {/* Row 4: Drives */}
            <div className="rounded-md border border-border bg-white px-4 py-2 font-sans text-foreground">Drives</div>
            <div className="text-muted-foreground">│</div>

            {/* Row 5: Motors */}
            <div className="rounded-md border border-border bg-white px-4 py-2 font-sans text-foreground">Motors</div>
            <div className="text-muted-foreground">│</div>

            {/* Row 6: Mechanics */}
            <div className="rounded-md border border-border bg-white px-4 py-2 font-sans text-foreground">Machine Mechanics</div>
          </div>
        </div>
      </SectionCard>

      {/* Connected Components */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'ACOPOStrak', desc: 'Linear transport system with independent movers', color: 'border-orange-200 bg-orange-50/50' },
          { label: 'Robotics', desc: 'Delta, SCARA, 6-Axis robot integration', color: 'border-blue-200 bg-blue-50/50' },
          { label: 'Industrial PC', desc: 'Automation PC for edge computing and IIoT', color: 'border-purple-200 bg-purple-50/50' },
          { label: 'IIoT', desc: 'Cloud connectivity, data collection, analytics', color: 'border-teal-200 bg-teal-50/50' },
        ].map((item) => (
          <div key={item.label} className={`rounded-md border p-3 ${item.color}`}>
            <div className="text-xs font-semibold text-foreground">{item.label}</div>
            <div className="text-[11px] text-muted-foreground mt-1">{item.desc}</div>
          </div>
        ))}
      </div>

      <SectionCard title="B&R Product to Engineering Effort">
        <div className="flex flex-wrap items-center gap-1.5">
          {['B&R Product', '→', 'Technology', '→', 'Engineering Function', '→', 'Configuration', '→', 'Programming', '→', 'Integration', '→', 'Testing', '→', 'Commissioning', '→', 'Complexity', '→', 'Engineering Effort'].map((item, idx) => (
            <span
              key={idx}
              className={`px-2 py-1 text-[11px] rounded ${
                item === '→' ? 'text-muted-foreground' :
                item === 'B&R Product' || item === 'Engineering Effort' ? 'bg-primary/10 text-primary font-semibold' :
                'bg-white border border-border text-foreground'
              }`}
            >
              {item}
            </span>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}