'use client';

import React from 'react';
import { SectionCard } from '@/components/br/SectionCard';
import { ParamRow, NumberField, CheckboxField, SelectField } from '@/components/br/ParamRow';
import { useAppStore } from '@/store';
import { ArrowDown } from 'lucide-react';

export function StepVision() {
  const { config, updateVision } = useAppStore();
  const v = config.vision;

  const visionFunctions = [
    { label: 'Inspection', key: 'inspection' as const },
    { label: 'Measurement', key: 'measurement' as const },
    { label: 'Detection', key: 'detection' as const },
    { label: 'Identification', key: 'identification' as const },
    { label: 'OCR', key: 'ocr' as const },
    { label: 'Barcode / QR', key: 'barcodeQR' as const },
    { label: 'Pattern Matching', key: 'patternMatching' as const },
    { label: 'Position Detection', key: 'positionDetection' as const },
    { label: 'Quality Control', key: 'qualityControl' as const },
  ];

  const activeFunctions = visionFunctions.filter((f) => v[f.key]);
  const visionComplexity = !v.enabled ? 'N/A' : activeFunctions.length >= 5 ? 'High' : activeFunctions.length >= 3 ? 'Medium' : 'Low';

  return (
    <div className="space-y-4">
      <SectionCard title="Step 6 — Machine Vision" description="Configure vision system for inspection and quality control.">
        <div className="mb-4">
          <ParamRow label="Vision Required?">
            <div className="flex gap-2">
              {[true, false].map((val) => (
                <button
                  key={String(val)}
                  onClick={() => updateVision({ enabled: val })}
                  className={`rounded-md border px-3 py-1.5 text-xs font-medium transition-colors ${
                    v.enabled === val
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border bg-white text-muted-foreground hover:border-primary/50'
                  }`}
                >
                  {val ? 'Yes' : 'No'}
                </button>
              ))}
            </div>
          </ParamRow>
        </div>

        {v.enabled && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-x-8 gap-y-1">
            <ParamRow label="Number of Cameras">
              <NumberField value={v.cameras} onChange={(val) => updateVision({ cameras: val })} />
            </ParamRow>
            <ParamRow label="Lighting Systems">
              <NumberField value={v.lightingSystems} onChange={(val) => updateVision({ lightingSystems: val })} />
            </ParamRow>
            <ParamRow label="Triggering">
              <SelectField
                value={v.triggering}
                onChange={(val) => updateVision({ triggering: val as typeof v.triggering })}
                options={['Continuous', 'External Trigger', 'Motion Synchronized']}
                placeholder="Select trigger mode"
              />
            </ParamRow>
          </div>
        )}
      </SectionCard>

      {v.enabled && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <SectionCard title="Vision Functions">
            <div className="grid grid-cols-2 gap-x-4">
              {visionFunctions.map(({ label, key }) => (
                <CheckboxField
                  key={key}
                  label={label}
                  checked={v[key]}
                  onChange={(val) => updateVision({ [key]: val })}
                />
              ))}
            </div>
          </SectionCard>

          <div className="space-y-4">
            <SectionCard title="Vision Architecture" noPadding>
              <div className="flex flex-col items-center gap-0 py-3 px-4">
                {['Camera', 'Image Acquisition', 'Image Processing', 'Inspection Result', 'PLC', 'Machine Action'].map((item, idx, arr) => (
                  <React.Fragment key={item}>
                    <div className="rounded-md border border-border bg-white px-4 py-1.5 text-xs font-medium text-foreground">
                      {item}
                    </div>
                    {idx < arr.length - 1 && <ArrowDown className="h-4 w-4 text-muted-foreground" />}
                  </React.Fragment>
                ))}
              </div>
            </SectionCard>

            <SectionCard title="Integration">
              <CheckboxField label="Vision-PLC Integration" checked={v.plcIntegration} onChange={(val) => updateVision({ plcIntegration: val })} />
              <CheckboxField label="Motion-Vision Synchronization" checked={v.motionVisionSync} onChange={(val) => updateVision({ motionVisionSync: val })} />
            </SectionCard>
          </div>
        </div>
      )}

      <div className="flex items-center gap-3">
        <span className="text-xs text-muted-foreground">Vision Complexity:</span>
        <span className={`text-xs font-semibold rounded-md px-2 py-0.5 border ${
          visionComplexity === 'High' ? 'bg-orange-50 text-orange-700 border-orange-200' :
          visionComplexity === 'Medium' ? 'bg-amber-50 text-amber-700 border-amber-200' :
          visionComplexity === 'Low' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
          'bg-gray-50 text-gray-500 border-gray-200'
        }`}>
          {visionComplexity}
        </span>
      </div>
    </div>
  );
}
