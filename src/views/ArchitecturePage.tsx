'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { SectionCard } from '@/components/br/SectionCard';
import { useAppStore } from '@/store';

interface ArchBlock {
  label: string;
  isPrimary?: boolean;
  isSecondary?: boolean;
  isController?: boolean;
}

const ARCH_ITEMS: ArchBlock[] = [
  { label: 'HMI', isPrimary: true },
  { label: 'Vision' },
  { label: 'Controller', isController: true },
  { label: 'Safety' },
  { label: 'I/O' },
  { label: 'Motion', isSecondary: true },
  { label: 'Communication' },
  { label: 'Drives' },
  { label: 'Motors' },
  { label: 'Machine Mechanics' },
];

function ArchBlockItem({ item, index, isActive }: { item: ArchBlock; index: number; isActive?: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className={`relative rounded-md px-6 py-2 pr-8 font-sans text-sm ${
        item.isController
          ? 'border-2 border-primary/40 bg-primary/10 font-semibold text-primary'
          : item.isPrimary
          ? 'border-2 border-primary/40 bg-primary/10 font-semibold text-primary'
          : item.isSecondary
          ? 'border border-primary/30 bg-card font-medium text-foreground ring-1 ring-primary/20'
          : 'border border-border bg-card text-foreground'
      } ${isActive ? 'ring-2 ring-emerald-400/50 shadow-sm shadow-emerald-400/10' : ''}`}
    >
      {item.isController && (
        <>
          <div className="relative z-10">Controller</div>
          <div className="absolute inset-0 rounded-md bg-primary/5 dark:bg-primary/10 animate-pulse" />
        </>
      )}
      {!item.isController && item.label}
      <span className={`absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full text-sm font-bold ${isActive ? 'bg-emerald-500 text-white' : 'bg-muted text-muted-foreground'}`}>
        {index + 1}
      </span>
    </motion.div>
  );
}

function ConnectingLine({ index, isActive }: { index: number; isActive?: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2, delay: index * 0.05 + 0.1 }}
      className={`border-l-2 h-3 ${isActive ? 'border-l-primary/40' : 'border-border'}`}
    />
  );
}

export function ArchitecturePage() {
  const { config } = useAppStore();

  const activeMap: Record<string, boolean> = {
    HMI: config.hmi.screens > 0,
    Vision: config.vision.enabled,
    Controller: true,
    Safety: config.safety.enabled,
    'I/O': (config.io.digitalInputs + config.io.digitalOutputs + config.io.analogInputs + config.io.analogOutputs) > 0,
    Motion: config.motion.totalAxes > 0,
    Communication: config.communication.protocols.some(p => p.enabled),
    Drives: config.motion.totalAxes > 0,
    Motors: config.motion.totalAxes > 0,
    'Machine Mechanics': config.motion.totalAxes > 0,
  };

  const mechatronicsActive = config.mechatronics.type !== 'None';
  const roboticsActive = config.robotics.enabled;
  const ipcActive = config.iiot.ipcRequired;

  return (
    <div className="bg-gradient-to-br from-background via-background to-muted/20">
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-bold text-foreground">Machine Architecture</h1>
        <p className="text-sm text-muted-foreground">
          Visualize the system architecture of a typical B&R automation machine.
        </p>
      </div>

      <SectionCard title="System Architecture Diagram" noPadding>
        <div className="py-8 px-4">
          <div className="flex flex-col items-center gap-1.5 text-sm">
            {}
            <ArchBlockItem item={ARCH_ITEMS[0]} index={0} isActive={activeMap['HMI']} />
            <ConnectingLine index={0} isActive={activeMap['HMI']} />

            {}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 1 * 0.05 }}
              className="flex items-center gap-8"
            >
              <ArchBlockItem item={ARCH_ITEMS[1]} index={1} isActive={activeMap['Vision']} />
              <div className="text-muted-foreground font-mono">──▶</div>
              <ArchBlockItem item={ARCH_ITEMS[2]} index={2} isActive={activeMap['Controller']} />
              <div className="text-muted-foreground font-mono">──▶</div>
              <ArchBlockItem item={ARCH_ITEMS[3]} index={3} isActive={activeMap['Safety']} />
            </motion.div>
            <ConnectingLine index={3} isActive={activeMap['Safety']} />

            {}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 4 * 0.05 }}
              className="flex items-center gap-8"
            >
              <ArchBlockItem item={ARCH_ITEMS[4]} index={4} isActive={activeMap['I/O']} />
              <ArchBlockItem item={ARCH_ITEMS[5]} index={5} isActive={activeMap['Motion']} />
              <ArchBlockItem item={ARCH_ITEMS[6]} index={6} isActive={activeMap['Communication']} />
            </motion.div>
            <ConnectingLine index={6} isActive={activeMap['Communication']} />

            {}
            <ArchBlockItem item={ARCH_ITEMS[7]} index={7} isActive={activeMap['Drives']} />
            <ConnectingLine index={7} isActive={activeMap['Drives']} />

            {}
            <ArchBlockItem item={ARCH_ITEMS[8]} index={8} isActive={activeMap['Motors']} />
            <ConnectingLine index={8} isActive={activeMap['Motors']} />

            {}
            <ArchBlockItem item={ARCH_ITEMS[9]} index={9} isActive={activeMap['Machine Mechanics']} />
          </div>
        </div>
      </SectionCard>

      {}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'ACOPOStrak', desc: 'Linear transport system with independent movers', color: 'border-orange-200 dark:border-orange-700/40 bg-orange-50/50 dark:bg-orange-950/30', active: mechatronicsActive },
          { label: 'Robotics', desc: 'Delta, SCARA, 6-Axis robot integration', color: 'border-blue-200 dark:border-blue-700/40 bg-blue-50/50 dark:bg-blue-950/30', active: roboticsActive },
          { label: 'Industrial PC', desc: 'Automation PC for edge computing and IIoT', color: 'border-purple-200 dark:border-purple-700/40 bg-purple-50/50 dark:bg-purple-950/30', active: ipcActive },
          { label: 'IIoT', desc: 'Cloud connectivity, data collection, analytics', color: 'border-teal-200 dark:border-teal-700/40 bg-teal-50/50 dark:bg-teal-950/30', active: ipcActive },
        ].map((item) => (
          <div key={item.label} className={`relative rounded-md border p-3 hover:bg-muted/50 hover:border-primary/20 hover:shadow-sm transition-all duration-150 ${item.color}`}>
            <div className={`absolute top-2 right-2 h-2 w-2 rounded-full ${item.active ? 'bg-emerald-400' : 'bg-muted-foreground/20'}`} />
            <div className="text-sm font-semibold text-foreground">{item.label}</div>
            <div className="text-sm text-muted-foreground/80 mt-1">{item.desc}</div>
          </div>
        ))}
      </div>

      <SectionCard title="B&R Product to Engineering Effort">
        <div className="flex flex-wrap items-center gap-1.5">
          {['B&R Product', '→', 'Technology', '→', 'Engineering Function', '→', 'Configuration', '→', 'Programming', '→', 'Integration', '→', 'Testing', '→', 'Commissioning', '→', 'Complexity', '→', 'Engineering Effort'].map((item, idx) => (
            <span
              key={idx}
              className={`px-2 py-1 text-sm rounded ${
                item === '→' ? 'text-muted-foreground' :
                item === 'B&R Product' || item === 'Engineering Effort' ? 'bg-primary/10 text-primary font-semibold' :
                'bg-card border border-border text-foreground'
              }`}
            >
              {item}
            </span>
          ))}
        </div>
      </SectionCard>
    </div>
    </div>
  );
}
