'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { SectionCard } from '@/components/br/SectionCard';

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

function ArchBlockItem({ item, index }: { item: ArchBlock; index: number }) {
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
      }`}
    >
      {item.isController && (
        <>
          <div className="relative z-10">Controller</div>
          <div className="absolute inset-0 rounded-md bg-primary/5 dark:bg-primary/10 animate-pulse" />
        </>
      )}
      {!item.isController && item.label}
      <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-muted text-[9px] font-bold text-muted-foreground">
        {index + 1}
      </span>
    </motion.div>
  );
}

function ConnectingLine({ index }: { index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2, delay: index * 0.05 + 0.1 }}
      className="border-l-2 border-border h-3"
    />
  );
}

export function ArchitecturePage() {
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
          <div className="flex flex-col items-center gap-1.5 text-xs">
            {/* Row 1: HMI (index 0) */}
            <ArchBlockItem item={ARCH_ITEMS[0]} index={0} />
            <ConnectingLine index={0} />

            {/* Row 2: Vision - Controller - Safety (index 1, 2, 3) */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 1 * 0.05 }}
              className="flex items-center gap-8"
            >
              <ArchBlockItem item={ARCH_ITEMS[1]} index={1} />
              <div className="text-muted-foreground font-mono">──▶</div>
              <ArchBlockItem item={ARCH_ITEMS[2]} index={2} />
              <div className="text-muted-foreground font-mono">──▶</div>
              <ArchBlockItem item={ARCH_ITEMS[3]} index={3} />
            </motion.div>
            <ConnectingLine index={3} />

            {/* Row 3: I/O, Motion, Communication (index 4, 5, 6) */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 4 * 0.05 }}
              className="flex items-center gap-8"
            >
              <ArchBlockItem item={ARCH_ITEMS[4]} index={4} />
              <ArchBlockItem item={ARCH_ITEMS[5]} index={5} />
              <ArchBlockItem item={ARCH_ITEMS[6]} index={6} />
            </motion.div>
            <ConnectingLine index={6} />

            {/* Row 4: Drives (index 7) */}
            <ArchBlockItem item={ARCH_ITEMS[7]} index={7} />
            <ConnectingLine index={7} />

            {/* Row 5: Motors (index 8) */}
            <ArchBlockItem item={ARCH_ITEMS[8]} index={8} />
            <ConnectingLine index={8} />

            {/* Row 6: Machine Mechanics (index 9) */}
            <ArchBlockItem item={ARCH_ITEMS[9]} index={9} />
          </div>
        </div>
      </SectionCard>

      {/* Connected Components */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'ACOPOStrak', desc: 'Linear transport system with independent movers', color: 'border-orange-200 dark:border-orange-700/40 bg-orange-50/50 dark:bg-orange-950/30' },
          { label: 'Robotics', desc: 'Delta, SCARA, 6-Axis robot integration', color: 'border-blue-200 dark:border-blue-700/40 bg-blue-50/50 dark:bg-blue-950/30' },
          { label: 'Industrial PC', desc: 'Automation PC for edge computing and IIoT', color: 'border-purple-200 dark:border-purple-700/40 bg-purple-50/50 dark:bg-purple-950/30' },
          { label: 'IIoT', desc: 'Cloud connectivity, data collection, analytics', color: 'border-teal-200 dark:border-teal-700/40 bg-teal-50/50 dark:bg-teal-950/30' },
        ].map((item) => (
          <div key={item.label} className={`rounded-md border p-3 hover:bg-muted/50 hover:border-primary/20 hover:shadow-sm transition-all duration-150 ${item.color}`}>
            <div className="text-xs font-semibold text-foreground">{item.label}</div>
            <div className="text-[11px] text-muted-foreground/80 mt-1">{item.desc}</div>
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