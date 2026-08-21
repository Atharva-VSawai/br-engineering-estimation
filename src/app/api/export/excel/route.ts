import { NextRequest, NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import type { ProjectConfig, ComplexityLevel } from '@/types';
import { calculateEngineeringEffort } from '@/lib/effort-calculation';

// ===== Helpers =====

function bool(val: boolean | undefined | null): string {
  return val ? 'Yes' : 'No';
}

const PROTOCOL_DESCRIPTIONS: Record<string, string> = {
  POWERLINK: 'B&R real-time Ethernet protocol for deterministic communication',
  Ethernet: 'Standard Ethernet for non-time-critical data exchange',
  'OPC UA': 'Open Platform Communications Unified Architecture for interoperability',
  CAN: 'Controller Area Network for embedded and automotive applications',
  'IO-Link': 'Point-to-point communication for smart sensors and actuators',
  PROFIBUS: 'Process Field Bus for factory automation',
  PROFINET: 'Industrial Ethernet standard for automation',
  'EtherNet/IP': 'Industrial protocol using CIP on standard Ethernet',
  'Modbus TCP': 'Simple communication protocol over TCP/IP',
  Other: 'Other communication protocol',
};

function headerStyle(): XLSX.CellStyle {
  return {
    font: { bold: true, color: { rgb: 'FFFFFF' } },
    fill: { fgColor: { rgb: 'C75B12' } },
    alignment: { vertical: 'center', horizontal: 'center' },
    border: { bottom: { style: 'thin', color: { rgb: 'A04510' } } },
  };
}

function labelStyle(): XLSX.CellStyle {
  return { font: { bold: true }, alignment: { vertical: 'center' } };
}

function boldStyle(): XLSX.CellStyle {
  return { font: { bold: true }, alignment: { vertical: 'center' } };
}

function sectionTitleStyle(): XLSX.CellStyle {
  return { font: { bold: true, sz: 12 }, alignment: { vertical: 'center' } };
}

function addSheetHeaders(
  ws: XLSX.WorkSheet,
  headers: string[],
  colWidths?: number[],
  startRow: number = 0,
) {
  const hStyle = headerStyle();
  headers.forEach((h, i) => {
    const cell = XLSX.utils.encode_cell({ r: startRow, c: i });
    if (!ws[cell]) ws[cell] = { v: h, t: 's' };
    ws[cell].v = h;
    ws[cell].t = 's';
    ws[cell].s = hStyle;
  });
  if (colWidths) {
    ws['!cols'] = colWidths.map((w) => ({ wch: w }));
  }
}

function addRow(
  ws: XLSX.WorkSheet,
  row: number,
  values: (string | number | boolean)[],
) {
  values.forEach((v, col) => {
    const cell = XLSX.utils.encode_cell({ r: row, c: col });
    if (typeof v === 'boolean') {
      ws[cell] = { v: bool(v), t: 's' };
    } else if (typeof v === 'number') {
      ws[cell] = { v, t: 'n' };
    } else {
      ws[cell] = { v: v ?? '', t: 's' };
    }
  });
}

function addLabeledRow(
  ws: XLSX.WorkSheet,
  row: number,
  label: string,
  value: string | number | boolean,
) {
  const lStyle = labelStyle();
  const labelCell = XLSX.utils.encode_cell({ r: row, c: 0 });
  ws[labelCell] = { v: label, t: 's', s: lStyle };
  const valCell = XLSX.utils.encode_cell({ r: row, c: 1 });
  if (typeof value === 'boolean') {
    ws[valCell] = { v: bool(value), t: 's' };
  } else if (typeof value === 'number') {
    ws[valCell] = { v: value, t: 'n' };
  } else {
    ws[valCell] = { v: value ?? '', t: 's' };
  }
}

// ===== Configuration Completeness Check =====

function checkCompleteness(config: ProjectConfig): { label: string; configured: boolean; note: string }[] {
  const c = config;
  const ioTotal = c.io.digitalInputs + c.io.digitalOutputs + c.io.analogInputs + c.io.analogOutputs + c.io.safetyIO + c.io.encoderCounterModules + c.io.temperatureModules + c.io.communicationIO + c.io.specialModules;
  const motionFeatures = [c.motion.homingRequired, c.motion.positioning, c.motion.velocityControl, c.motion.torqueControl, c.motion.synchronization, c.motion.masterSlave, c.motion.electronicGearing, c.motion.electronicCamming, c.motion.coordinatedMotion, c.motion.interpolation, c.motion.complexMotionProfiles, c.motion.axisDiagnostics].filter(Boolean).length;
  const hmiFeatures = [c.hmi.alarmManagement, c.hmi.recipeManagement, c.hmi.trendVisualization, c.hmi.userManagement, c.hmi.machineDiagnostics, c.hmi.manualMode, c.hmi.automaticMode, c.hmi.maintenanceScreens, c.hmi.parameterManagement].filter(Boolean).length;
  const commActive = c.communication.protocols.some((p) => p.enabled);
  const commIntegrations = [c.communication.plcToPlc, c.communication.mesIntegration, c.communication.scadaIntegration, c.communication.cloudIIoTIntegration].filter(Boolean).length;
  const iiotFeatures = [c.iiot.ipcRequired, c.iiot.iiotRequired, c.iiot.iiotConnector, c.iiot.iiotServices, c.iiot.iiotEdgeDevice, c.iiot.cloudConnectivity, c.iiot.machineDataCollection, c.iiot.remoteMaintenance, c.iiot.opcUa, c.iiot.dataLogging, c.iiot.analyticsIntegration].filter(Boolean).length;
  return [
    { label: 'Project', configured: !!(c.project.name && c.project.name.trim()), note: c.project.name ? 'Configured' : 'Missing project name' },
    { label: 'Controller', configured: c.controller.quantity > 1 || c.controller.performance !== 'Standard' || !!c.controller.communicationInterfaces, note: `Family: ${c.controller.family}` },
    { label: 'I/O', configured: ioTotal > 0, note: ioTotal > 0 ? `${ioTotal} total I/O points` : 'No I/O configured' },
    { label: 'Motion', configured: c.motion.totalAxes > 0 || motionFeatures > 0, note: c.motion.totalAxes > 0 ? `${c.motion.totalAxes} axes` : 'No axes' },
    { label: 'HMI', configured: c.hmi.screens > 0 || hmiFeatures > 0, note: c.hmi.screens > 0 ? `${c.hmi.screens} screen(s)` : 'No screens' },
    { label: 'Vision', configured: c.vision.enabled, note: c.vision.enabled ? `${c.vision.cameras} camera(s)` : 'Not enabled' },
    { label: 'Safety', configured: c.safety.enabled, note: c.safety.enabled ? `${c.safety.safetyIOCount} safety I/O` : 'Not enabled' },
    { label: 'Communication', configured: commActive || commIntegrations > 0, note: commActive ? 'Protocol(s) active' : 'No protocols' },
    { label: 'Mechatronics', configured: c.mechatronics.type !== 'None' && c.mechatronics.type !== '', note: `Type: ${c.mechatronics.type}` },
    { label: 'Robotics', configured: c.robotics.enabled, note: c.robotics.enabled ? `${c.robotics.quantity} robot(s)` : 'Not enabled' },
    { label: 'IIoT', configured: iiotFeatures > 0, note: iiotFeatures > 0 ? `${iiotFeatures} feature(s)` : 'No features' },
  ];
}

// ===== Sheet Builders =====

// Sheet 1: Project Summary
function buildProjectSummarySheet(
  wb: XLSX.WorkBook,
  config: ProjectConfig,
  result: ReturnType<typeof calculateEngineeringEffort>,
) {
  const ws = XLSX.utils.aoa_to_sheet([['']]);
  ws['!cols'] = [{ wch: 35 }, { wch: 50 }];

  let r = 0;
  addLabeledRow(ws, r++, 'Project Name', config.project.name);
  addLabeledRow(ws, r++, 'Customer', config.project.customer);
  addLabeledRow(ws, r++, 'Machine Type', config.project.machineType);
  addLabeledRow(ws, r++, 'Industry', config.project.industry);
  addLabeledRow(ws, r++, 'Requirement Clarity', config.project.requirementClarity);
  addLabeledRow(ws, r++, 'Customer Involvement', config.project.customerInvolvement);
  addLabeledRow(ws, r++, 'Overall Complexity', result.overallComplexity);
  r++;

  const e = result.effort;
  addLabeledRow(ws, r++, 'Total Engineering Effort (hours)', Math.round(e.totalHours));
  addLabeledRow(ws, r++, 'Total Working Days', Math.round(e.totalDays * 10) / 10);
  addLabeledRow(ws, r++, 'Estimated Timeline (weeks)', Math.round(e.totalWeeks * 10) / 10);
  addLabeledRow(ws, r++, 'Estimated Duration (months)', Math.round(e.totalMonths * 10) / 10);
  r++;
  addLabeledRow(ws, r++, 'Export Date', new Date().toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  }));

  XLSX.utils.book_append_sheet(wb, ws, 'Project Summary');
}

// Sheet 2: B&R Technical Configuration
function buildTechnicalConfigSheet(
  wb: XLSX.WorkBook,
  config: ProjectConfig,
) {
  const ws = XLSX.utils.aoa_to_sheet([['']]);
  ws['!cols'] = [{ wch: 32 }, { wch: 50 }];

  let r = 0;

  // Controller
  const secCell = XLSX.utils.encode_cell({ r, c: 0 });
  ws[secCell] = { v: 'CONTROLLER', t: 's', s: sectionTitleStyle() };
  r++;
  addLabeledRow(ws, r++, 'Family', config.controller.family);
  addLabeledRow(ws, r++, 'Quantity', config.controller.quantity);
  addLabeledRow(ws, r++, 'Performance', config.controller.performance);
  addLabeledRow(ws, r++, 'Communication Interfaces', config.controller.communicationInterfaces || 'None');
  addLabeledRow(ws, r++, 'Redundancy Required', config.controller.redundancyRequired);
  addLabeledRow(ws, r++, 'Simulation Required', config.controller.simulationRequired);
  addLabeledRow(ws, r++, 'Diagnostics Required', config.controller.diagnosticsRequired);
  r++;

  // I/O
  const secCell2 = XLSX.utils.encode_cell({ r, c: 0 });
  ws[secCell2] = { v: 'I/O', t: 's', s: sectionTitleStyle() };
  r++;
  addLabeledRow(ws, r++, 'Digital Inputs', config.io.digitalInputs);
  addLabeledRow(ws, r++, 'Digital Outputs', config.io.digitalOutputs);
  addLabeledRow(ws, r++, 'Analog Inputs', config.io.analogInputs);
  addLabeledRow(ws, r++, 'Analog Outputs', config.io.analogOutputs);
  addLabeledRow(ws, r++, 'Safety I/O', config.io.safetyIO);
  addLabeledRow(ws, r++, 'Encoder/Counter Modules', config.io.encoderCounterModules);
  addLabeledRow(ws, r++, 'Temperature Modules', config.io.temperatureModules);
  addLabeledRow(ws, r++, 'Communication Modules', config.io.communicationIO);
  addLabeledRow(ws, r++, 'Special Modules', config.io.specialModules);
  r++;

  // Motion
  const secCell3 = XLSX.utils.encode_cell({ r, c: 0 });
  ws[secCell3] = { v: 'MOTION', t: 's', s: sectionTitleStyle() };
  r++;
  addLabeledRow(ws, r++, 'Total Axes', config.motion.totalAxes);
  addLabeledRow(ws, r++, 'Linear Axes', config.motion.linearAxes);
  addLabeledRow(ws, r++, 'Rotary Axes', config.motion.rotaryAxes);
  addLabeledRow(ws, r++, 'Servo Drives', config.motion.servoDrives);
  addLabeledRow(ws, r++, 'Servo Motors', config.motion.servoMotors);
  addLabeledRow(ws, r++, 'Homing', config.motion.homingRequired);
  addLabeledRow(ws, r++, 'Positioning', config.motion.positioning);
  addLabeledRow(ws, r++, 'Velocity Control', config.motion.velocityControl);
  addLabeledRow(ws, r++, 'Torque Control', config.motion.torqueControl);
  addLabeledRow(ws, r++, 'Synchronization', config.motion.synchronization);
  addLabeledRow(ws, r++, 'Master/Slave', config.motion.masterSlave);
  addLabeledRow(ws, r++, 'Electronic Gearing', config.motion.electronicGearing);
  addLabeledRow(ws, r++, 'Electronic Camming', config.motion.electronicCamming);
  addLabeledRow(ws, r++, 'Coordinated Motion', config.motion.coordinatedMotion);
  addLabeledRow(ws, r++, 'Interpolation', config.motion.interpolation);
  addLabeledRow(ws, r++, 'Complex Motion Profiles', config.motion.complexMotionProfiles);
  addLabeledRow(ws, r++, 'Axis Diagnostics', config.motion.axisDiagnostics);
  r++;

  // HMI
  const secCell4 = XLSX.utils.encode_cell({ r, c: 0 });
  ws[secCell4] = { v: 'HMI', t: 's', s: sectionTitleStyle() };
  r++;
  addLabeledRow(ws, r++, 'Type', config.hmi.type);
  addLabeledRow(ws, r++, 'Number of Screens', config.hmi.screens);
  addLabeledRow(ws, r++, 'Screen Complexity', config.hmi.screenComplexity);
  addLabeledRow(ws, r++, 'Alarm Management', config.hmi.alarmManagement);
  addLabeledRow(ws, r++, 'Recipe Management', config.hmi.recipeManagement);
  addLabeledRow(ws, r++, 'Trend Visualization', config.hmi.trendVisualization);
  addLabeledRow(ws, r++, 'User Management', config.hmi.userManagement);
  addLabeledRow(ws, r++, 'Machine Diagnostics', config.hmi.machineDiagnostics);
  addLabeledRow(ws, r++, 'Manual Mode', config.hmi.manualMode);
  addLabeledRow(ws, r++, 'Automatic Mode', config.hmi.automaticMode);
  addLabeledRow(ws, r++, 'Maintenance Screens', config.hmi.maintenanceScreens);
  addLabeledRow(ws, r++, 'Parameter Management', config.hmi.parameterManagement);
  r++;

  // Vision
  const secCell5 = XLSX.utils.encode_cell({ r, c: 0 });
  ws[secCell5] = { v: 'VISION', t: 's', s: sectionTitleStyle() };
  r++;
  addLabeledRow(ws, r++, 'Enabled', config.vision.enabled);
  addLabeledRow(ws, r++, 'Cameras', config.vision.cameras);
  addLabeledRow(ws, r++, 'Lighting Systems', config.vision.lightingSystems);
  addLabeledRow(ws, r++, 'Inspection', config.vision.inspection);
  addLabeledRow(ws, r++, 'Measurement', config.vision.measurement);
  addLabeledRow(ws, r++, 'Detection', config.vision.detection);
  addLabeledRow(ws, r++, 'Identification', config.vision.identification);
  addLabeledRow(ws, r++, 'OCR', config.vision.ocr);
  addLabeledRow(ws, r++, 'Barcode/QR', config.vision.barcodeQR);
  addLabeledRow(ws, r++, 'Pattern Matching', config.vision.patternMatching);
  addLabeledRow(ws, r++, 'Position Detection', config.vision.positionDetection);
  addLabeledRow(ws, r++, 'Quality Control', config.vision.qualityControl);
  addLabeledRow(ws, r++, 'PLC Integration', config.vision.plcIntegration);
  addLabeledRow(ws, r++, 'Motion-Vision Sync', config.vision.motionVisionSync);
  r++;

  // Safety
  const secCell6 = XLSX.utils.encode_cell({ r, c: 0 });
  ws[secCell6] = { v: 'SAFETY', t: 's', s: sectionTitleStyle() };
  r++;
  addLabeledRow(ws, r++, 'Enabled', config.safety.enabled);
  addLabeledRow(ws, r++, 'Controller', config.safety.controller);
  addLabeledRow(ws, r++, 'Safety I/O Count', config.safety.safetyIOCount);
  addLabeledRow(ws, r++, 'Emergency Stops', config.safety.emergencyStops);
  addLabeledRow(ws, r++, 'Safety Doors', config.safety.safetyDoors);
  addLabeledRow(ws, r++, 'Light Curtains', config.safety.lightCurtains);
  addLabeledRow(ws, r++, 'Safe Motion', config.safety.safeMotion);
  addLabeledRow(ws, r++, 'Safety Functions', config.safety.safetyFunctions);
  addLabeledRow(ws, r++, 'Validation Required', config.safety.validationRequired);
  addLabeledRow(ws, r++, 'Testing Required', config.safety.testingRequired);
  addLabeledRow(ws, r++, 'Documentation Required', config.safety.documentationRequired);
  r++;

  // Communication (protocols table + integrations)
  const secCell7 = XLSX.utils.encode_cell({ r, c: 0 });
  ws[secCell7] = { v: 'COMMUNICATION', t: 's', s: sectionTitleStyle() };
  r++;
  // Sub-table for protocols
  addSheetHeaders(ws, ['Protocol', 'Enabled', 'Devices', 'Description'], [20, 12, 12, 50], r);
  r++;
  for (const proto of config.communication.protocols) {
    const desc = PROTOCOL_DESCRIPTIONS[proto.name] || '';
    addRow(ws, r, [proto.name, proto.enabled, proto.devices, desc]);
    r++;
  }
  r++;
  addLabeledRow(ws, r++, 'PLC-to-PLC', config.communication.plcToPlc);
  addLabeledRow(ws, r++, 'MES Integration', config.communication.mesIntegration);
  addLabeledRow(ws, r++, 'SCADA Integration', config.communication.scadaIntegration);
  addLabeledRow(ws, r++, 'Cloud/IIoT Integration', config.communication.cloudIIoTIntegration);
  r++;

  // Mechatronics
  const secCell8 = XLSX.utils.encode_cell({ r, c: 0 });
  ws[secCell8] = { v: 'MECHATRONICS', t: 's', s: sectionTitleStyle() };
  r++;
  addLabeledRow(ws, r++, 'Type', config.mechatronics.type);
  addLabeledRow(ws, r++, 'Movers', config.mechatronics.movers);
  addLabeledRow(ws, r++, 'Processing Stations', config.mechatronics.processingStations);
  addLabeledRow(ws, r++, 'Mover Routing', config.mechatronics.moverRouting);
  addLabeledRow(ws, r++, 'Independent Mover Control', config.mechatronics.independentMoverControl);
  addLabeledRow(ws, r++, 'Synchronization', config.mechatronics.synchronization);
  addLabeledRow(ws, r++, 'Transport Sequences', config.mechatronics.transportSequences);
  addLabeledRow(ws, r++, 'Product Handling', config.mechatronics.productHandling);
  addLabeledRow(ws, r++, 'Vision Integration', config.mechatronics.visionIntegration);
  addLabeledRow(ws, r++, 'HMI Integration', config.mechatronics.hmiIntegration);
  addLabeledRow(ws, r++, 'Safety Integration', config.mechatronics.safetyIntegration);
  addLabeledRow(ws, r++, 'Diagnostics', config.mechatronics.diagnostics);
  r++;

  // Robotics
  const secCell9 = XLSX.utils.encode_cell({ r, c: 0 });
  ws[secCell9] = { v: 'ROBOTICS', t: 's', s: sectionTitleStyle() };
  r++;
  addLabeledRow(ws, r++, 'Enabled', config.robotics.enabled);
  addLabeledRow(ws, r++, 'Robot Type', config.robotics.robotType);
  addLabeledRow(ws, r++, 'Quantity', config.robotics.quantity);
  addLabeledRow(ws, r++, 'Motion Integration', config.robotics.motionIntegration);
  addLabeledRow(ws, r++, 'Vision Integration', config.robotics.visionIntegration);
  addLabeledRow(ws, r++, 'Pick and Place', config.robotics.pickAndPlace);
  addLabeledRow(ws, r++, 'Trajectory Programming', config.robotics.trajectoryProgramming);
  addLabeledRow(ws, r++, 'Synchronization', config.robotics.synchronization);
  addLabeledRow(ws, r++, 'Simulation', config.robotics.simulation);
  addLabeledRow(ws, r++, 'Safety', config.robotics.safety);
  addLabeledRow(ws, r++, 'Robot Diagnostics', config.robotics.robotDiagnostics);
  r++;

  // IIoT
  const secCell10 = XLSX.utils.encode_cell({ r, c: 0 });
  ws[secCell10] = { v: 'IIoT', t: 's', s: sectionTitleStyle() };
  r++;
  addLabeledRow(ws, r++, 'IPC Required', config.iiot.ipcRequired);
  addLabeledRow(ws, r++, 'IPC Model', config.iiot.ipcModel);
  addLabeledRow(ws, r++, 'IIoT Required', config.iiot.iiotRequired);
  addLabeledRow(ws, r++, 'IIoT Connector', config.iiot.iiotConnector);
  addLabeledRow(ws, r++, 'IIoT Services', config.iiot.iiotServices);
  addLabeledRow(ws, r++, 'IIoT Edge Device', config.iiot.iiotEdgeDevice);
  addLabeledRow(ws, r++, 'Cloud Connectivity', config.iiot.cloudConnectivity);
  addLabeledRow(ws, r++, 'Machine Data Collection', config.iiot.machineDataCollection);
  addLabeledRow(ws, r++, 'Remote Maintenance', config.iiot.remoteMaintenance);
  addLabeledRow(ws, r++, 'OPC UA', config.iiot.opcUa);
  addLabeledRow(ws, r++, 'Data Logging', config.iiot.dataLogging);
  addLabeledRow(ws, r++, 'Analytics Integration', config.iiot.analyticsIntegration);

  XLSX.utils.book_append_sheet(wb, ws, 'Technical Configuration');
}

// Sheet 3: Engineering Effort
function buildEffortSheet(
  wb: XLSX.WorkBook,
  result: ReturnType<typeof calculateEngineeringEffort>,
) {
  const ws = XLSX.utils.aoa_to_sheet([['']]);
  ws['!cols'] = [{ wch: 35 }, { wch: 20 }, { wch: 15 }];

  const e = result.effort;
  const totalH = e.totalHours;

  const rows = [
    { area: 'Hardware Engineering', hours: e.hardwareHours },
    { area: 'PLC / Software Engineering', hours: e.plcSoftwareHours },
    { area: 'Motion Engineering', hours: e.motionHours },
    { area: 'Vision Engineering', hours: e.visionHours },
    { area: 'Safety Engineering', hours: e.safetyHours },
    { area: 'Communication / Integration', hours: e.communicationIntegrationHours },
    { area: 'Testing', hours: e.testingHours },
    { area: 'Commissioning', hours: e.commissioningHours },
  ];

  let r = 0;
  addSheetHeaders(ws, ['Engineering Area', 'Estimated Hours', 'Percentage'], undefined, r);
  r++;

  for (const row of rows) {
    const pct = totalH > 0 ? Math.round((row.hours / totalH) * 1000) / 10 : 0;
    const areaCell = XLSX.utils.encode_cell({ r, c: 0 });
    ws[areaCell] = { v: row.area, t: 's' };
    const hoursCell = XLSX.utils.encode_cell({ r, c: 1 });
    ws[hoursCell] = { v: Math.round(row.hours * 10) / 10, t: 'n' };
    const pctCell = XLSX.utils.encode_cell({ r, c: 2 });
    ws[pctCell] = { v: `${pct}%`, t: 's' };
    r++;
  }

  // Total row
  r++;
  const tlCell = XLSX.utils.encode_cell({ r, c: 0 });
  ws[tlCell] = { v: 'TOTAL', t: 's', s: boldStyle() };
  const thCell = XLSX.utils.encode_cell({ r, c: 1 });
  ws[thCell] = { v: Math.round(totalH * 10) / 10, t: 'n', s: boldStyle() };
  const tpCell = XLSX.utils.encode_cell({ r, c: 2 });
  ws[tpCell] = { v: '100%', t: 's', s: boldStyle() };

  XLSX.utils.book_append_sheet(wb, ws, 'Engineering Effort');
}

// Sheet 4: Complexity Assessment
function buildComplexitySheet(
  wb: XLSX.WorkBook,
  config: ProjectConfig,
  result: ReturnType<typeof calculateEngineeringEffort>,
) {
  const ws = XLSX.utils.aoa_to_sheet([['']]);
  ws['!cols'] = [{ wch: 30 }, { wch: 15 }, { wch: 50 }];

  const dimensions: { key: keyof ProjectConfig['complexity']; label: string; note: string }[] = [
    { key: 'hardware', label: 'Hardware', note: 'I/O modules, controller selection, wiring' },
    { key: 'motion', label: 'Motion', note: `Axes: ${config.motion.totalAxes}, Drives: ${config.motion.servoDrives}` },
    { key: 'hmi', label: 'HMI', note: `${config.hmi.screens} screens (${config.hmi.screenComplexity})` },
    { key: 'vision', label: 'Vision', note: config.vision.enabled ? `${config.vision.cameras} camera(s)` : 'Not enabled' },
    { key: 'safety', label: 'Safety', note: config.safety.enabled ? `${config.safety.safetyIOCount} safety I/O` : 'Not enabled' },
    { key: 'communication', label: 'Communication', note: `${config.communication.protocols.filter((p) => p.enabled).length} protocol(s) active` },
    { key: 'software', label: 'Software', note: `${config.additionalFeatures.filter((f) => f.enabled).length} additional features` },
    { key: 'integration', label: 'Integration', note: `Mechatronics: ${config.mechatronics.type}, Robotics: ${config.robotics.enabled ? 'Yes' : 'No'}` },
    { key: 'requirement', label: 'Requirement', note: `Clarity: ${config.project.requirementClarity}` },
    { key: 'testing', label: 'Testing', note: 'Validation and testing scope' },
  ];

  let r = 0;
  addSheetHeaders(ws, ['Dimension', 'Rating', 'Notes'], undefined, r);
  r++;

  for (const dim of dimensions) {
    addRow(ws, r, [dim.label, config.complexity[dim.key], dim.note]);
    r++;
  }

  r++;
  addLabeledRow(ws, r++, 'Overall Complexity', result.overallComplexity);
  addLabeledRow(ws, r++, 'High/Very High Count', `${result.highCount} of 10`);

  XLSX.utils.book_append_sheet(wb, ws, 'Complexity Assessment');
}

// Sheet 5: Timeline
function buildTimelineSheet(
  wb: XLSX.WorkBook,
  result: ReturnType<typeof calculateEngineeringEffort>,
) {
  const ws = XLSX.utils.aoa_to_sheet([['']]);
  ws['!cols'] = [{ wch: 40 }, { wch: 20 }];

  const t = result.timeline;

  let r = 0;
  addSheetHeaders(ws, ['Phase', 'Duration (weeks)'], undefined, r);
  r++;

  const phases = [
    { phase: 'Hardware Design & Ordering', weeks: t.hardwareDesignWeeks },
    { phase: 'Software Development', weeks: t.softwareDevelopmentWeeks },
    { phase: 'Integration & Testing', weeks: t.integrationTestingWeeks },
    { phase: 'Commissioning & Handover', weeks: t.commissioningWeeks },
  ];

  for (const p of phases) {
    const phaseCell = XLSX.utils.encode_cell({ r, c: 0 });
    ws[phaseCell] = { v: p.phase, t: 's' };
    const weeksCell = XLSX.utils.encode_cell({ r, c: 1 });
    ws[weeksCell] = { v: p.weeks, t: 'n' };
    r++;
  }

  r++;
  const tlCell = XLSX.utils.encode_cell({ r, c: 0 });
  ws[tlCell] = { v: 'TOTAL', t: 's', s: boldStyle() };
  const twCell = XLSX.utils.encode_cell({ r, c: 1 });
  ws[twCell] = { v: t.totalWeeks, t: 'n', s: boldStyle() };

  XLSX.utils.book_append_sheet(wb, ws, 'Timeline');
}

// Sheet 6: Configuration Completeness
function buildCompletenessSheet(
  wb: XLSX.WorkBook,
  config: ProjectConfig,
) {
  const ws = XLSX.utils.aoa_to_sheet([['']]);
  ws['!cols'] = [{ wch: 25 }, { wch: 15 }, { wch: 45 }];

  const checks = checkCompleteness(config);

  let r = 0;
  addSheetHeaders(ws, ['Section', 'Configured', 'Details'], undefined, r);
  r++;

  for (const check of checks) {
    const secCell = XLSX.utils.encode_cell({ r, c: 0 });
    ws[secCell] = { v: check.label, t: 's' };
    const confCell = XLSX.utils.encode_cell({ r, c: 1 });
    ws[confCell] = { v: check.configured ? 'Yes' : 'No', t: 's' };
    const detCell = XLSX.utils.encode_cell({ r, c: 2 });
    ws[detCell] = { v: check.note, t: 's' };
    r++;
  }

  r++;
  const configuredCount = checks.filter((c) => c.configured).length;
  const sumCell = XLSX.utils.encode_cell({ r, c: 0 });
  ws[sumCell] = { v: 'Configured Sections', t: 's', s: boldStyle() };
  const sumValCell = XLSX.utils.encode_cell({ r, c: 1 });
  ws[sumValCell] = { v: `${configuredCount} of ${checks.length}`, t: 's', s: boldStyle() };

  XLSX.utils.book_append_sheet(wb, ws, 'Configuration Completeness');
}

// ===== POST Handler =====
export async function POST(request: NextRequest) {
  try {
    const body: ProjectConfig = await request.json();

    const result = calculateEngineeringEffort(body);

    const wb = XLSX.utils.book_new();

    buildProjectSummarySheet(wb, body, result);
    buildTechnicalConfigSheet(wb, body);
    buildEffortSheet(wb, result);
    buildComplexitySheet(wb, body, result);
    buildTimelineSheet(wb, result);
    buildCompletenessSheet(wb, body);

    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    const fileName = `br-estimate-${(body.project.name || 'untitled').replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase()}.xlsx`;

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${fileName}"`,
      },
    });
  } catch (error) {
    console.error('[Excel Export] Error generating Excel file:', error);
    return NextResponse.json(
      { error: 'Failed to generate Excel file' },
      { status: 500 },
    );
  }
}
