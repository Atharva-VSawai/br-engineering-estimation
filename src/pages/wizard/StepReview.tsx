'use client';

import React, { useMemo, useState } from 'react';
import { Pencil, CheckCircle, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SectionCard } from '@/components/br/SectionCard';
import { useAppStore } from '@/store';
import { toast } from 'sonner';
import { MACHINE_TYPES, INDUSTRIES, CONTROLLER_FAMILIES, HMI_TYPES, SAFETY_CONTROLLERS, ROBOT_TYPES, IPC_MODELS } from '@/data';
import type { ScreenComplexity, ComplexityLevel } from '@/types';

interface SectionReviewItem {
  title: string;
  step: number;
  configured: boolean;
  staticContent: React.ReactNode;
  editFields?: EditFieldDef[];
}

interface EditFieldDef {
  key: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'boolean';
  value: string | number | boolean;
  options?: readonly string[];
  onUpdate: (val: string | number | boolean) => void;
}

const PERFORMANCE_OPTIONS = ['Basic', 'Standard', 'High Performance'] as const;
const SCREEN_COMPLEXITY_OPTIONS: ScreenComplexity[] = ['Basic', 'Moderate', 'Complex'];
const COMPLEXITY_LEVEL_OPTIONS: ComplexityLevel[] = ['Low', 'Medium', 'High', 'Very High'];
const MECHATRONICS_TYPE_OPTIONS = ['None', 'ACOPOStrak', 'ACOPOS 6D', 'SuperTrak'] as const;

export function StepReview() {
  const {
    config, setWizardStep,
    updateProjectInfo, updateController, updateIO, updateMotion,
    updateHMI, updateVision, updateSafety, updateCommunication,
    updateMechatronics, updateRobotics, updateIIoT, updateComplexity,
  } = useAppStore();
  const c = config;

  const [editingSection, setEditingSection] = useState<string | null>(null);

  const goToStep = (step: number) => setWizardStep(step);

  const yesNo = (v: boolean) => v ? 'Yes' : 'No';
  const listEnabled = (arr: { name: string; enabled: boolean }[]) => arr.filter((x) => x.enabled).map((x) => x.name);

  const sections: SectionReviewItem[] = useMemo(() => {
    const ioTotal =
      c.io.digitalInputs + c.io.digitalOutputs +
      c.io.analogInputs + c.io.analogOutputs +
      c.io.safetyIO + c.io.encoderCounterModules +
      c.io.temperatureModules + c.io.communicationIO +
      c.io.specialModules;

    return [
      {
        title: 'Project',
        step: 0,
        configured: !!c.project.name && c.project.name.trim() !== '',
        staticContent: (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-1 text-xs">
            <div><span className="text-muted-foreground">Name:</span> <span className="font-medium text-foreground ml-1">{c.project.name || '—'}</span></div>
            <div><span className="text-muted-foreground">Customer:</span> <span className="font-medium text-foreground ml-1">{c.project.customer || '—'}</span></div>
            <div><span className="text-muted-foreground">Machine Type:</span> <span className="font-medium text-foreground ml-1">{c.project.machineType || '—'}</span></div>
            <div><span className="text-muted-foreground">Industry:</span> <span className="font-medium text-foreground ml-1">{c.project.industry || '—'}</span></div>
            <div><span className="text-muted-foreground">Variants:</span> <span className="font-medium text-foreground ml-1">{c.project.projectVariants}</span></div>
            <div><span className="text-muted-foreground">Stations:</span> <span className="font-medium text-foreground ml-1">{c.project.machineStations}</span></div>
          </div>
        ),
        editFields: [
          { key: 'name', label: 'Name', type: 'text', value: c.project.name || '', onUpdate: (v) => updateProjectInfo({ name: String(v) }) },
          { key: 'customer', label: 'Customer', type: 'text', value: c.project.customer || '', onUpdate: (v) => updateProjectInfo({ customer: String(v) }) },
          { key: 'machineType', label: 'Machine Type', type: 'select', value: c.project.machineType || '', options: MACHINE_TYPES, onUpdate: (v) => updateProjectInfo({ machineType: String(v) }) },
          { key: 'industry', label: 'Industry', type: 'select', value: c.project.industry || '', options: INDUSTRIES, onUpdate: (v) => updateProjectInfo({ industry: String(v) }) },
          { key: 'projectVariants', label: 'Variants', type: 'number', value: c.project.projectVariants, onUpdate: (v) => updateProjectInfo({ projectVariants: Number(v) }) },
        ],
      },
      {
        title: 'Controller',
        step: 1,
        configured: !!c.controller.family && c.controller.family.trim() !== '',
        staticContent: (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-1 text-xs">
            <div><span className="text-muted-foreground">Family:</span> <span className="font-medium text-foreground ml-1">{c.controller.family}</span></div>
            <div><span className="text-muted-foreground">Quantity:</span> <span className="font-medium text-foreground ml-1">{c.controller.quantity}</span></div>
            <div><span className="text-muted-foreground">Performance:</span> <span className="font-medium text-foreground ml-1">{c.controller.performance}</span></div>
            <div><span className="text-muted-foreground">Redundancy:</span> <span className="font-medium text-foreground ml-1">{yesNo(c.controller.redundancyRequired)}</span></div>
            <div><span className="text-muted-foreground">Simulation:</span> <span className="font-medium text-foreground ml-1">{yesNo(c.controller.simulationRequired)}</span></div>
          </div>
        ),
        editFields: [
          { key: 'family', label: 'Family', type: 'select', value: c.controller.family, options: CONTROLLER_FAMILIES, onUpdate: (v) => updateController({ family: String(v) }) },
          { key: 'quantity', label: 'Quantity', type: 'number', value: c.controller.quantity, onUpdate: (v) => updateController({ quantity: Number(v) }) },
          { key: 'performance', label: 'Performance', type: 'select', value: c.controller.performance, options: PERFORMANCE_OPTIONS, onUpdate: (v) => updateController({ performance: String(v) }) },
        ],
      },
      {
        title: 'I/O',
        step: 2,
        configured: ioTotal > 0,
        staticContent: (
          <div className="grid grid-cols-3 lg:grid-cols-5 gap-x-6 gap-y-1 text-xs">
            <div><span className="text-muted-foreground">DI:</span> <span className="font-medium text-foreground ml-1">{c.io.digitalInputs}</span></div>
            <div><span className="text-muted-foreground">DO:</span> <span className="font-medium text-foreground ml-1">{c.io.digitalOutputs}</span></div>
            <div><span className="text-muted-foreground">AI:</span> <span className="font-medium text-foreground ml-1">{c.io.analogInputs}</span></div>
            <div><span className="text-muted-foreground">AO:</span> <span className="font-medium text-foreground ml-1">{c.io.analogOutputs}</span></div>
            <div><span className="text-muted-foreground">Safety:</span> <span className="font-medium text-foreground ml-1">{c.io.safetyIO}</span></div>
            <div><span className="text-muted-foreground">Enc/Counter:</span> <span className="font-medium text-foreground ml-1">{c.io.encoderCounterModules}</span></div>
            <div><span className="text-muted-foreground">Temp:</span> <span className="font-medium text-foreground ml-1">{c.io.temperatureModules}</span></div>
            <div><span className="text-muted-foreground">Comm:</span> <span className="font-medium text-foreground ml-1">{c.io.communicationIO}</span></div>
            <div><span className="text-muted-foreground">Special:</span> <span className="font-medium text-foreground ml-1">{c.io.specialModules}</span></div>
          </div>
        ),
        editFields: [
          { key: 'digitalInputs', label: 'DI', type: 'number', value: c.io.digitalInputs, onUpdate: (v) => updateIO({ digitalInputs: Number(v) }) },
          { key: 'digitalOutputs', label: 'DO', type: 'number', value: c.io.digitalOutputs, onUpdate: (v) => updateIO({ digitalOutputs: Number(v) }) },
          { key: 'analogInputs', label: 'AI', type: 'number', value: c.io.analogInputs, onUpdate: (v) => updateIO({ analogInputs: Number(v) }) },
          { key: 'analogOutputs', label: 'AO', type: 'number', value: c.io.analogOutputs, onUpdate: (v) => updateIO({ analogOutputs: Number(v) }) },
          { key: 'safetyIO', label: 'Safety I/O', type: 'number', value: c.io.safetyIO, onUpdate: (v) => updateIO({ safetyIO: Number(v) }) },
        ],
      },
      {
        title: 'Motion',
        step: 3,
        configured: c.motion.totalAxes > 0,
        staticContent: (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-1 text-xs">
            <div><span className="text-muted-foreground">Total Axes:</span> <span className="font-medium text-foreground ml-1">{c.motion.totalAxes}</span></div>
            <div><span className="text-muted-foreground">Linear:</span> <span className="font-medium text-foreground ml-1">{c.motion.linearAxes}</span></div>
            <div><span className="text-muted-foreground">Rotary:</span> <span className="font-medium text-foreground ml-1">{c.motion.rotaryAxes}</span></div>
            <div><span className="text-muted-foreground">Drives:</span> <span className="font-medium text-foreground ml-1">{c.motion.servoDrives}</span></div>
            <div><span className="text-muted-foreground">Motors:</span> <span className="font-medium text-foreground ml-1">{c.motion.servoMotors}</span></div>
            <div><span className="text-muted-foreground">Sync:</span> <span className="font-medium text-foreground ml-1">{yesNo(c.motion.synchronization)}</span></div>
            <div><span className="text-muted-foreground">E-Gearing:</span> <span className="font-medium text-foreground ml-1">{yesNo(c.motion.electronicGearing)}</span></div>
            <div><span className="text-muted-foreground">E-Camming:</span> <span className="font-medium text-foreground ml-1">{yesNo(c.motion.electronicCamming)}</span></div>
          </div>
        ),
        editFields: [
          { key: 'totalAxes', label: 'Total Axes', type: 'number', value: c.motion.totalAxes, onUpdate: (v) => updateMotion({ totalAxes: Number(v) }) },
          { key: 'linearAxes', label: 'Linear Axes', type: 'number', value: c.motion.linearAxes, onUpdate: (v) => updateMotion({ linearAxes: Number(v) }) },
          { key: 'rotaryAxes', label: 'Rotary Axes', type: 'number', value: c.motion.rotaryAxes, onUpdate: (v) => updateMotion({ rotaryAxes: Number(v) }) },
          { key: 'servoDrives', label: 'Servo Drives', type: 'number', value: c.motion.servoDrives, onUpdate: (v) => updateMotion({ servoDrives: Number(v) }) },
          { key: 'homingRequired', label: 'Homing Required', type: 'boolean', value: c.motion.homingRequired, onUpdate: (v) => updateMotion({ homingRequired: Boolean(v) }) },
        ],
      },
      {
        title: 'HMI',
        step: 4,
        configured: c.hmi.screens > 0,
        staticContent: (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-1 text-xs">
            <div><span className="text-muted-foreground">Type:</span> <span className="font-medium text-foreground ml-1">{c.hmi.type}</span></div>
            <div><span className="text-muted-foreground">Screens:</span> <span className="font-medium text-foreground ml-1">{c.hmi.screens}</span></div>
            <div><span className="text-muted-foreground">Complexity:</span> <span className="font-medium text-foreground ml-1">{c.hmi.screenComplexity}</span></div>
            <div><span className="text-muted-foreground">Alarms:</span> <span className="font-medium text-foreground ml-1">{yesNo(c.hmi.alarmManagement)}</span></div>
            <div><span className="text-muted-foreground">Recipes:</span> <span className="font-medium text-foreground ml-1">{yesNo(c.hmi.recipeManagement)}</span></div>
          </div>
        ),
        editFields: [
          { key: 'type', label: 'Type', type: 'select', value: c.hmi.type, options: HMI_TYPES, onUpdate: (v) => updateHMI({ type: String(v) }) },
          { key: 'screens', label: 'Screens', type: 'number', value: c.hmi.screens, onUpdate: (v) => updateHMI({ screens: Number(v) }) },
          { key: 'screenComplexity', label: 'Complexity', type: 'select', value: c.hmi.screenComplexity, options: SCREEN_COMPLEXITY_OPTIONS, onUpdate: (v) => updateHMI({ screenComplexity: String(v) as ScreenComplexity }) },
        ],
      },
      {
        title: 'Vision',
        step: 5,
        configured: c.vision.enabled,
        staticContent: (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-1 text-xs">
            <div><span className="text-muted-foreground">Enabled:</span> <span className="font-medium text-foreground ml-1">{yesNo(c.vision.enabled)}</span></div>
            <div><span className="text-muted-foreground">Cameras:</span> <span className="font-medium text-foreground ml-1">{c.vision.cameras}</span></div>
            <div><span className="text-muted-foreground">Triggering:</span> <span className="font-medium text-foreground ml-1">{c.vision.triggering || '—'}</span></div>
            <div><span className="text-muted-foreground">Inspection:</span> <span className="font-medium text-foreground ml-1">{yesNo(c.vision.inspection)}</span></div>
            <div><span className="text-muted-foreground">Barcode/QR:</span> <span className="font-medium text-foreground ml-1">{yesNo(c.vision.barcodeQR)}</span></div>
          </div>
        ),
        editFields: [
          { key: 'enabled', label: 'Enabled', type: 'boolean', value: c.vision.enabled, onUpdate: (v) => updateVision({ enabled: Boolean(v) }) },
          { key: 'cameras', label: 'Cameras', type: 'number', value: c.vision.cameras, onUpdate: (v) => updateVision({ cameras: Number(v) }) },
        ],
      },
      {
        title: 'Safety',
        step: 6,
        configured: c.safety.enabled,
        staticContent: (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-1 text-xs">
            <div><span className="text-muted-foreground">Enabled:</span> <span className="font-medium text-foreground ml-1">{yesNo(c.safety.enabled)}</span></div>
            <div><span className="text-muted-foreground">Controller:</span> <span className="font-medium text-foreground ml-1">{c.safety.controller}</span></div>
            <div><span className="text-muted-foreground">Safety I/O:</span> <span className="font-medium text-foreground ml-1">{c.safety.safetyIOCount}</span></div>
            <div><span className="text-muted-foreground">E-Stops:</span> <span className="font-medium text-foreground ml-1">{c.safety.emergencyStops}</span></div>
            <div><span className="text-muted-foreground">Doors:</span> <span className="font-medium text-foreground ml-1">{c.safety.safetyDoors}</span></div>
          </div>
        ),
        editFields: [
          { key: 'enabled', label: 'Enabled', type: 'boolean', value: c.safety.enabled, onUpdate: (v) => updateSafety({ enabled: Boolean(v) }) },
          { key: 'controller', label: 'Controller', type: 'select', value: c.safety.controller, options: SAFETY_CONTROLLERS, onUpdate: (v) => updateSafety({ controller: String(v) }) },
          { key: 'safetyIOCount', label: 'Safety I/O Count', type: 'number', value: c.safety.safetyIOCount, onUpdate: (v) => updateSafety({ safetyIOCount: Number(v) }) },
        ],
      },
      {
        title: 'Communication',
        step: 7,
        configured: c.communication.protocols.some((p) => p.enabled),
        staticContent: (
          <div className="text-xs">
            <span className="text-muted-foreground">Protocols: </span>
            <span className="font-medium text-foreground">{listEnabled(c.communication.protocols).join(', ') || 'None'}</span>
            <span className="text-muted-foreground ml-3">MES: </span>
            <span className="font-medium text-foreground">{yesNo(c.communication.mesIntegration)}</span>
            <span className="text-muted-foreground ml-3">SCADA: </span>
            <span className="font-medium text-foreground">{yesNo(c.communication.scadaIntegration)}</span>
            <span className="text-muted-foreground ml-3">Cloud/IIoT: </span>
            <span className="font-medium text-foreground">{yesNo(c.communication.cloudIIoTIntegration)}</span>
          </div>
        ),
        editFields: [
          { key: 'mesIntegration', label: 'MES Integration', type: 'boolean', value: c.communication.mesIntegration, onUpdate: (v) => updateCommunication({ mesIntegration: Boolean(v) }) },
          { key: 'scadaIntegration', label: 'SCADA Integration', type: 'boolean', value: c.communication.scadaIntegration, onUpdate: (v) => updateCommunication({ scadaIntegration: Boolean(v) }) },
          { key: 'cloudIIoTIntegration', label: 'Cloud/IIoT', type: 'boolean', value: c.communication.cloudIIoTIntegration, onUpdate: (v) => updateCommunication({ cloudIIoTIntegration: Boolean(v) }) },
        ],
      },
      {
        title: 'Mechatronics',
        step: 8,
        configured: c.mechatronics.type !== 'None',
        staticContent: (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-1 text-xs">
            <div><span className="text-muted-foreground">Type:</span> <span className="font-medium text-foreground ml-1">{c.mechatronics.type}</span></div>
            {c.mechatronics.type !== 'None' && (
              <>
                <div><span className="text-muted-foreground">Movers:</span> <span className="font-medium text-foreground ml-1">{c.mechatronics.movers}</span></div>
                <div><span className="text-muted-foreground">Stations:</span> <span className="font-medium text-foreground ml-1">{c.mechatronics.processingStations}</span></div>
              </>
            )}
          </div>
        ),
        editFields: [
          { key: 'type', label: 'Type', type: 'select', value: c.mechatronics.type, options: MECHATRONICS_TYPE_OPTIONS, onUpdate: (v) => updateMechatronics({ type: String(v) as 'None' | 'ACOPOStrak' | 'ACOPOS 6D' | 'SuperTrak' }) },
          { key: 'movers', label: 'Movers', type: 'number', value: c.mechatronics.movers, onUpdate: (v) => updateMechatronics({ movers: Number(v) }) },
        ],
      },
      {
        title: 'Robotics',
        step: 9,
        configured: c.robotics.enabled,
        staticContent: (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-1 text-xs">
            <div><span className="text-muted-foreground">Enabled:</span> <span className="font-medium text-foreground ml-1">{yesNo(c.robotics.enabled)}</span></div>
            {c.robotics.enabled && (
              <>
                <div><span className="text-muted-foreground">Type:</span> <span className="font-medium text-foreground ml-1">{c.robotics.robotType}</span></div>
                <div><span className="text-muted-foreground">Quantity:</span> <span className="font-medium text-foreground ml-1">{c.robotics.quantity}</span></div>
              </>
            )}
          </div>
        ),
        editFields: [
          { key: 'enabled', label: 'Enabled', type: 'boolean', value: c.robotics.enabled, onUpdate: (v) => updateRobotics({ enabled: Boolean(v) }) },
          { key: 'robotType', label: 'Robot Type', type: 'select', value: c.robotics.robotType, options: ROBOT_TYPES, onUpdate: (v) => updateRobotics({ robotType: String(v) }) },
          { key: 'quantity', label: 'Quantity', type: 'number', value: c.robotics.quantity, onUpdate: (v) => updateRobotics({ quantity: Number(v) }) },
        ],
      },
      {
        title: 'Industrial PC / IIoT',
        step: 10,
        configured: c.iiot.ipcRequired || c.iiot.iiotRequired,
        staticContent: (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-1 text-xs">
            <div><span className="text-muted-foreground">IPC:</span> <span className="font-medium text-foreground ml-1">{c.iiot.ipcRequired ? c.iiot.ipcModel : 'Not required'}</span></div>
            <div><span className="text-muted-foreground">IIoT:</span> <span className="font-medium text-foreground ml-1">{yesNo(c.iiot.iiotRequired)}</span></div>
            <div><span className="text-muted-foreground">Cloud:</span> <span className="font-medium text-foreground ml-1">{yesNo(c.iiot.cloudConnectivity)}</span></div>
          </div>
        ),
        editFields: [
          { key: 'ipcRequired', label: 'IPC Required', type: 'boolean', value: c.iiot.ipcRequired, onUpdate: (v) => updateIIoT({ ipcRequired: Boolean(v) }) },
          { key: 'ipcModel', label: 'IPC Model', type: 'select', value: c.iiot.ipcModel, options: IPC_MODELS, onUpdate: (v) => updateIIoT({ ipcModel: String(v) }) },
        ],
      },
      {
        title: 'Additional Features',
        step: 11,
        configured: c.additionalFeatures.some((f) => f.enabled),
        staticContent: (
          <div className="text-xs">
            <span className="text-muted-foreground">Enabled: </span>
            <span className="font-medium text-foreground">{listEnabled(c.additionalFeatures).join(', ') || 'None'}</span>
          </div>
        ),
      },
      {
        title: 'Complexity',
        step: 12,
        configured: true,
        staticContent: (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-1 text-xs">
            {(['hardware', 'motion', 'hmi', 'vision', 'safety', 'communication', 'software', 'integration', 'requirement', 'testing'] as const).map((key) => (
              <div key={key} className="flex justify-between">
                <span className="text-muted-foreground capitalize">{key}:</span>
                <span className="font-medium text-foreground ml-1">{c.complexity[key]}</span>
              </div>
            ))}
          </div>
        ),
        editFields: [
          { key: 'hardware', label: 'Hardware', type: 'select', value: c.complexity.hardware, options: COMPLEXITY_LEVEL_OPTIONS, onUpdate: (v) => updateComplexity({ hardware: String(v) as ComplexityLevel }) },
          { key: 'motion', label: 'Motion', type: 'select', value: c.complexity.motion, options: COMPLEXITY_LEVEL_OPTIONS, onUpdate: (v) => updateComplexity({ motion: String(v) as ComplexityLevel }) },
          { key: 'hmi', label: 'HMI', type: 'select', value: c.complexity.hmi, options: COMPLEXITY_LEVEL_OPTIONS, onUpdate: (v) => updateComplexity({ hmi: String(v) as ComplexityLevel }) },
          { key: 'software', label: 'Software', type: 'select', value: c.complexity.software, options: COMPLEXITY_LEVEL_OPTIONS, onUpdate: (v) => updateComplexity({ software: String(v) as ComplexityLevel }) },
          { key: 'testing', label: 'Testing', type: 'select', value: c.complexity.testing, options: COMPLEXITY_LEVEL_OPTIONS, onUpdate: (v) => updateComplexity({ testing: String(v) as ComplexityLevel }) },
        ],
      },
    ];
  }, [c, updateProjectInfo, updateController, updateIO, updateMotion, updateHMI, updateVision, updateSafety, updateCommunication, updateMechatronics, updateRobotics, updateIIoT, updateComplexity]);

  const configuredCount = sections.filter((s) => s.configured).length;
  const totalCount = sections.length;
  const progressPct = (configuredCount / totalCount) * 100;

  const handleExportReview = () => {
    const c = config;
    const ioTotal = c.io.digitalInputs + c.io.digitalOutputs + c.io.analogInputs + c.io.analogOutputs + c.io.safetyIO;
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Review - ${c.project.name || 'Project'}</title><style>body{font-family:system-ui,sans-serif;max-width:800px;margin:40px auto;padding:0 20px;color:#1a1a1a}h1{color:oklch(0.55 0.2 35);border-bottom:2px solid oklch(0.55 0.2 35);padding-bottom:8px}h2{margin-top:24px;color:#333}table{width:100%;border-collapse:collapse;margin:12px 0}td,th{padding:6px 10px;border:1px solid #ddd;text-align:left;font-size:14px}th{background:#f5f5f5;font-weight:600}.badge{display:inline-block;padding:2px 8px;border-radius:4px;font-size:12px;font-weight:600}</style></head><body><h1>Configuration Review</h1><p>${c.project.name || 'Untitled'} — ${c.project.customer || 'N/A'}</p><h2>Project</h2><table><tr><th>Machine Type</th><td>${c.project.machineType}</td></tr><tr><th>Industry</th><td>${c.project.industry || 'N/A'}</td></tr><tr><th>Clarity</th><td>${c.project.requirementClarity}</td></tr></table><h2>Technical Summary</h2><table><tr><th>Controller</th><td>${c.controller.family} × ${c.controller.quantity}</td></tr><tr><th>Total I/O</th><td>${ioTotal}</td></tr><tr><th>Motion Axes</th><td>${c.motion.totalAxes}</td></tr><tr><th>HMI Screens</th><td>${c.hmi.screens}</td></tr><tr><th>Vision</th><td>${c.vision.enabled ? c.vision.cameras + ' cameras' : 'Not configured'}</td></tr><tr><th>Safety</th><td>${c.safety.enabled ? c.safety.controller + ' (' + c.safety.safetyIOCount + ' I/O)' : 'Not configured'}</td></tr></table><h2>Complexity</h2><table>${Object.entries(c.complexity).map(([k, v]) => `<tr><th>${k.charAt(0).toUpperCase() + k.slice(1)}</th><td><span class="badge" style="background:${v === 'Low' ? '#d1fae5' : v === 'Medium' ? '#fef3c7' : v === 'High' ? '#ffedd5' : '#fee2e2'};color:${v === 'Low' ? '#065f46' : v === 'Medium' ? '#92400e' : v === 'High' ? '#9a3412' : '#991b1b'}">${v}</span></td></tr>`).join('')}</table><p style="margin-top:24px;color:#888;font-size:12px">Generated by B&R Engineering Estimation Tool v0.9</p></body></html>`;
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
    toast('Review exported', { description: 'Opened in new tab' });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-bold text-foreground">Configuration Review</h2>
          <p className="text-xs text-muted-foreground">Review and edit all configured parameters before generating the estimate.</p>
        </div>
        <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs" onClick={handleExportReview}>
          <FileText className="h-3.5 w-3.5" />
          Export Review
        </Button>
      </div>
      <SectionCard title="Engineering Configuration Review" description="Review all configured parameters before generating the estimate summary.">
        {/* Summary Bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-foreground">
              {configuredCount} of {totalCount} sections configured
            </span>
            <span className="text-xs text-muted-foreground">
              {Math.round(progressPct)}%
            </span>
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-1.5 bg-primary rounded-full transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        <div className="space-y-1">
          {sections.map(({ title, step, staticContent, configured, editFields }) => {
            const isEditing = editingSection === title;
            return (
              <div
                key={title}
                className={`flex items-start justify-between rounded-md border bg-card p-3 border-l-2 transition-colors duration-200 ${
                  isEditing
                    ? 'border-l-blue-400 border-blue-200/50'
                    : configured ? 'border-l-emerald-300' : 'border-l-gray-200'
                }`}
              >
                <div className="min-w-0 flex-1 flex items-start gap-2.5">
                  <div className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${configured ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-semibold text-foreground mb-1.5">{title}</div>
                    <AnimatePresence mode="wait">
                      {isEditing && editFields ? (
                        <motion.div
                          key="edit"
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 4 }}
                          transition={{ duration: 0.2 }}
                          className="grid grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-2"
                        >
                          {editFields.map((field) => (
                            <div key={field.key} className="flex flex-col gap-1">
                              <span className="text-[11px] text-muted-foreground">{field.label}</span>
                              {field.type === 'text' && (
                                <Input
                                  className="h-7 text-xs"
                                  defaultValue={String(field.value)}
                                  onBlur={(e) => field.onUpdate(e.target.value)}
                                  onKeyDown={(e) => { if (e.key === 'Enter') field.onUpdate((e.target as HTMLInputElement).value); }}
                                />
                              )}
                              {field.type === 'number' && (
                                <Input
                                  type="number"
                                  className="h-7 text-xs w-24"
                                  defaultValue={Number(field.value)}
                                  onBlur={(e) => field.onUpdate(Number(e.target.value) || 0)}
                                />
                              )}
                              {field.type === 'select' && field.options && (
                                <Select
                                  value={String(field.value)}
                                  onValueChange={field.onUpdate}
                                >
                                  <SelectTrigger size="sm" className="h-7 text-xs w-full">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {field.options.map((opt) => (
                                      <SelectItem key={opt} value={opt} className="text-xs">
                                        {opt}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              )}
                              {field.type === 'boolean' && (
                                <Switch
                                  checked={Boolean(field.value)}
                                  onCheckedChange={field.onUpdate}
                                />
                              )}
                            </div>
                          ))}
                        </motion.div>
                      ) : (
                        <motion.div
                          key="static"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.15 }}
                        >
                          {staticContent}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
                {editFields && (
                  isEditing ? (
                    <Button
                      variant="default"
                      size="sm"
                      className="shrink-0 ml-2 h-7 gap-1 text-xs bg-primary text-primary-foreground"
                      onClick={() => setEditingSection(null)}
                    >
                      <CheckCircle className="h-3 w-3" />
                      Done
                    </Button>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="shrink-0 ml-2 h-7 gap-1 text-[11px] text-muted-foreground hover:text-primary"
                      onClick={() => setEditingSection(title)}
                    >
                      <Pencil className="h-3 w-3" />
                      Edit
                    </Button>
                  )
                )}
              </div>
            );
          })}
        </div>
      </SectionCard>
    </div>
  );
}
