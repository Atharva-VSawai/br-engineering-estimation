'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { SectionCard } from '@/components/br/SectionCard';
import { ParamRow, NumberField, CheckboxField } from '@/components/br/ParamRow';
import { useAppStore } from '@/store';
import { ArrowDown } from 'lucide-react';

export function StepMotion() {
  const { config, updateMotion } = useAppStore();
  const m = config.motion;

  const motionFunctions = [
    { label: 'Homing Required', key: 'homingRequired' as const },
    { label: 'Positioning', key: 'positioning' as const },
    { label: 'Velocity Control', key: 'velocityControl' as const },
    { label: 'Torque Control', key: 'torqueControl' as const },
    { label: 'Synchronization', key: 'synchronization' as const },
    { label: 'Master / Slave', key: 'masterSlave' as const },
    { label: 'Electronic Gearing', key: 'electronicGearing' as const },
    { label: 'Electronic Camming', key: 'electronicCamming' as const },
    { label: 'Coordinated Motion', key: 'coordinatedMotion' as const },
    { label: 'Interpolation', key: 'interpolation' as const },
    { label: 'Complex Motion Profiles', key: 'complexMotionProfiles' as const },
    { label: 'Axis Diagnostics', key: 'axisDiagnostics' as const },
  ];

  const engActivities = [
    'Axis Configuration',
    'Drive Configuration',
    'Motor Configuration',
    'Feedback Configuration',
    'Motion Programming',
    'Homing',
    'Synchronization',
    'Testing',
    'Commissioning',
  ];

  const activeFunctions = motionFunctions.filter((f) => m[f.key]);
  const motionComplexity = activeFunctions.length >= 8 ? 'High' : activeFunctions.length >= 4 ? 'Medium' : 'Low';

  const totalAxes = m.totalAxes;
  const linearAxes = m.linearAxes;
  const rotaryAxes = m.rotaryAxes;

  const getAxisType = (index: number) => {
    const num = index + 1;
    if (num <= linearAxes) return 'linear';
    if (num <= linearAxes + rotaryAxes) return 'rotary';
    return 'generic';
  };

  return (
    <div className="space-y-4">
      {}
      {totalAxes > 0 && (
        <div className="rounded-md border border-border bg-muted/30 p-3">
          <div className="text-sm text-muted-foreground uppercase tracking-wide mb-2">Axis Overview</div>
          <div className="flex gap-2 flex-wrap">
            {Array.from({ length: Math.min(totalAxes, 8) }).map((_, i) => {
              const axisType = getAxisType(i);
              return (
                <div key={i} className="rounded-md border border-border p-2 w-16 shrink-0">
                  <div className="text-sm font-semibold text-foreground">A{i + 1}</div>
                  <div className="mt-0.5">
                    <span className={`text-[8px] rounded px-1 inline-block ${
                      axisType === 'linear' ? 'bg-blue-50 text-blue-600' :
                      axisType === 'rotary' ? 'bg-purple-50 text-purple-600' :
                      'bg-gray-50 text-gray-600'
                    }`}>
                      {axisType === 'linear' ? 'LINEAR' : axisType === 'rotary' ? 'ROTARY' : 'GENERIC'}
                    </span>
                  </div>
                </div>
              );
            })}
            {totalAxes > 8 && (
              <div className="rounded-md border border-border p-2 w-16 shrink-0 flex items-center justify-center">
                <span className="text-sm text-muted-foreground font-medium">+{totalAxes - 8} more</span>
              </div>
            )}
          </div>
        </div>
      )}

      <SectionCard title="Step 4 — Motion & Axis Configuration" description="Configure motion axes, drives, and motion functions.">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-x-6 gap-y-1">
          <ParamRow label="Total Motion Axes">
            <NumberField value={m.totalAxes} onChange={(v) => updateMotion({ totalAxes: v })} />
          </ParamRow>
          <ParamRow label="Linear Axes">
            <NumberField value={m.linearAxes} onChange={(v) => updateMotion({ linearAxes: v })} />
          </ParamRow>
          <ParamRow label="Rotary Axes">
            <NumberField value={m.rotaryAxes} onChange={(v) => updateMotion({ rotaryAxes: v })} />
          </ParamRow>
          <ParamRow label="Servo Drives">
            <NumberField value={m.servoDrives} onChange={(v) => updateMotion({ servoDrives: v })} />
          </ParamRow>
          <ParamRow label="Servo Motors">
            <NumberField value={m.servoMotors} onChange={(v) => updateMotion({ servoMotors: v })} />
          </ParamRow>
        </div>
      </SectionCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SectionCard title="Motion Functions">
          <div className="grid grid-cols-2 gap-x-4">
            {motionFunctions.map(({ label, key }) => (
              <CheckboxField
                key={key}
                label={label}
                checked={m[key]}
                onChange={(v) => updateMotion({ [key]: v })}
              />
            ))}
          </div>
        </SectionCard>

        <div className="space-y-4">
          {}
          <SectionCard title="Motion Architecture" noPadding>
            <div className="flex flex-col items-center gap-0 py-3 px-4">
              {['Controller', 'Motion Control', 'Axis', 'Drive', 'Motor', 'Mechanical System'].map((item, idx, arr) => (
                <React.Fragment key={item}>
                  <div className="rounded-md border border-border bg-card px-4 py-1.5 text-sm font-medium text-foreground">
                    {item}
                  </div>
                  {idx < arr.length - 1 && (
                    <ArrowDown className="h-4 w-4 text-muted-foreground" />
                  )}
                </React.Fragment>
              ))}
            </div>
          </SectionCard>

          <SectionCard title="Motion Complexity">
            <div className="flex items-center gap-2">
              <span className={`text-sm font-semibold rounded-md px-2 py-0.5 border ${
                motionComplexity === 'High' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                motionComplexity === 'Medium' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                'bg-emerald-50 text-emerald-700 border-emerald-200'
              }`}>
                {motionComplexity}
              </span>
              <span className="text-sm text-muted-foreground">{activeFunctions.length} motion functions active</span>
            </div>
          </SectionCard>
        </div>
      </div>

      <SectionCard title="Axis Overview" description="Visual overview of configured motion axes">
        {totalAxes === 0 ? (
          <div className="text-sm text-muted-foreground text-center py-6">
            No axes configured. Set the Total Motion Axes above.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
            {Array.from({ length: totalAxes }).map((_, i) => {
              const axisType = getAxisType(i);
              const barWidth = 70 + ((i + 1) * 13 % 30);
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04, duration: 0.3 }}
                  className="rounded-md border border-border bg-card p-2.5 w-full"
                >
                  <div className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                    Axis {i + 1}
                  </div>
                  <div className="mt-1.5">
                    {axisType === 'linear' && (
                      <span className="text-sm text-blue-600 bg-blue-50 rounded px-1.5 py-0.5 inline-block">
                        LINEAR
                      </span>
                    )}
                    {axisType === 'rotary' && (
                      <span className="text-sm text-purple-600 bg-purple-50 rounded px-1.5 py-0.5 inline-block">
                        ROTARY
                      </span>
                    )}
                    {axisType === 'generic' && (
                      <span className="text-sm text-gray-600 bg-gray-50 rounded px-1.5 py-0.5 inline-block">
                        GENERIC
                      </span>
                    )}
                  </div>
                  <div className="mt-2">
                    <div
                      className="h-1 rounded-full bg-primary/60"
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </SectionCard>

      <SectionCard title="Motion Engineering Activities">
        <div className="flex flex-wrap gap-2">
          {engActivities.map((activity) => {
            const isActive = totalAxes > 0 && (
              activity === 'Axis Configuration' ||
              (activity === 'Drive Configuration' && m.servoDrives > 0) ||
              (activity === 'Motor Configuration' && m.servoMotors > 0) ||
              (activity === 'Motion Programming' && m.positioning) ||
              (activity === 'Homing' && m.homingRequired) ||
              (activity === 'Synchronization' && (m.synchronization || m.masterSlave)) ||
              activity === 'Testing' ||
              activity === 'Commissioning'
            );
            return (
              <span
                key={activity}
                className={`inline-flex items-center rounded-md border px-2.5 py-1 text-sm font-medium ${
                  isActive
                    ? 'border-primary/30 bg-primary/10 text-primary'
                    : 'border-border bg-card text-muted-foreground'
                }`}
              >
                {isActive && <span className="mr-1">✓</span>}{activity}
              </span>
            );
          })}
        </div>
      </SectionCard>
    </div>
  );
}
