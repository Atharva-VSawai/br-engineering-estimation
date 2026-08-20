'use client';

import React from 'react';
import { SectionCard } from '@/components/br/SectionCard';

export function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-bold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Application settings and configuration. Backend-connected settings will be available in future versions.
        </p>
      </div>

      <SectionCard title="Application Info">
        <div className="space-y-2 text-xs">
          <div className="flex justify-between py-1.5 border-b border-border/50">
            <span className="text-muted-foreground">Application</span>
            <span className="font-medium text-foreground">B&R Engineering Estimation Tool</span>
          </div>
          <div className="flex justify-between py-1.5 border-b border-border/50">
            <span className="text-muted-foreground">Version</span>
            <span className="font-medium text-foreground">v0.1 (Frontend Prototype)</span>
          </div>
          <div className="flex justify-between py-1.5 border-b border-border/50">
            <span className="text-muted-foreground">Technology</span>
            <span className="font-medium text-foreground">Next.js, React, TypeScript, Tailwind CSS</span>
          </div>
          <div className="flex justify-between py-1.5 border-b border-border/50">
            <span className="text-muted-foreground">Data Storage</span>
            <span className="font-medium text-foreground">Local (client-side state)</span>
          </div>
          <div className="flex justify-between py-1.5">
            <span className="text-muted-foreground">Backend</span>
            <span className="font-medium text-foreground">Not connected (planned)</span>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Planned Integrations">
        <div className="space-y-2 text-xs">
          {[
            { name: 'Excel Export', status: 'Planned' },
            { name: 'Jira Integration', status: 'Planned' },
            { name: 'ML-based Estimation', status: 'Planned' },
            { name: 'Historical Data', status: 'Planned' },
            { name: 'User Authentication', status: 'Planned' },
            { name: 'Database Storage', status: 'Planned' },
          ].map((item) => (
            <div key={item.name} className="flex items-center justify-between py-1.5 border-b border-border/50 last:border-0">
              <span className="text-foreground">{item.name}</span>
              <span className="text-muted-foreground">{item.status}</span>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Data Management">
        <div className="text-xs text-muted-foreground leading-relaxed">
          All project configurations are currently stored in the browser&apos;s client-side state (Zustand).
          Data will be lost on page refresh. Future versions will persist data to a backend database.
        </div>
      </SectionCard>
    </div>
  );
}