import { NextRequest, NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import type { ProjectConfig, ComplexityLevel } from '@/types';

// ===== Helper: Convert boolean to Yes/No =====
function bool(val: boolean | undefined | null): string {
  return val ? 'Yes' : 'No';
}

// ===== Helper: Protocol descriptions =====
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

// ===== Helper: Style helpers =====
function headerStyle(): XLSX.CellStyle {
  return {
    font: { bold: true, color: { rgb: 'FFFFFF' } },
    fill: { fgColor: { rgb: 'C75B12' } }, // B&R orange approximated as hex
    alignment: { vertical: 'center', horizontal: 'center' },
    border: {
      bottom: { style: 'thin', color: { rgb: 'A04510' } },
    },
  };
}

function labelStyle(): XLSX.CellStyle {
  return {
    font: { bold: true },
    alignment: { vertical: 'center' },
  };
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

// ===== Helper: Calculate overall complexity =====
function getOverallComplexity(config: ProjectConfig): ComplexityLevel {
  const allComplexities: ComplexityLevel[] = [
    config.complexity.hardware,
    config.complexity.motion,
    config.complexity.hmi,
    config.complexity.vision,
    config.complexity.safety,
    config.complexity.communication,
    config.complexity.software,
    config.complexity.integration,
    config.complexity.requirement,
    config.complexity.testing,
  ];
  const highCount = allComplexities.filter(
    (x) => x === 'High' || x === 'Very High',
  ).length;
  if (highCount >= 5) return 'Very High';
  if (highCount >= 3) return 'High';
  if (highCount >= 1) return 'Medium';
  return 'Low';
}

// ===== Helper: Calculate effort hours =====
function calculateEffort(config: ProjectConfig) {
  const hwHours =
    (config.io.digitalInputs +
      config.io.digitalOutputs +
      config.io.analogInputs +
      config.io.analogOutputs) *
      0.5 +
    config.motion.totalAxes * 4;
  const swHours =
    config.hmi.screens * 8 +
    (config.vision.enabled ? config.vision.cameras * 16 : 0) +
    40;
  const motionHours =
    config.motion.totalAxes * 6 +
    (config.motion.electronicCamming ? 20 : 0) +
    (config.motion.coordinatedMotion ? 16 : 0);
  const safetyHours = config.safety.enabled
    ? config.safety.safetyIOCount * 2 + 16
    : 0;
  const integrationHours = (hwHours + swHours + motionHours + safetyHours) * 0.3;
  const totalHours = hwHours + swHours + motionHours + safetyHours + integrationHours;

  return [
    { area: 'Hardware Engineering', hours: Math.round(hwHours) },
    { area: 'Software Development', hours: Math.round(swHours) },
    { area: 'Motion Configuration', hours: Math.round(motionHours) },
    { area: 'Safety Engineering', hours: Math.round(safetyHours) },
    { area: 'Integration & Testing', hours: Math.round(integrationHours) },
    { area: 'Total', hours: Math.round(totalHours) },
  ];
}

// ===== Helper: Calculate timeline =====
function calculateTimeline(config: ProjectConfig) {
  const overall = getOverallComplexity(config);
  const complexityMap: Record<string, number> = {
    Low: 1,
    Medium: 2,
    High: 3,
    'Very High': 4,
  };

  const hwDesignWeeks = 2;
  const swDevWeeks = Math.max(2, Math.ceil(config.hmi.screens / 3));
  const effort = calculateEffort(config);
  const totalHours = effort[effort.length - 1].hours;
  const integrationWeeks = Math.max(2, Math.ceil(totalHours / 40));
  const commissionWeeks = complexityMap[overall] || 2;

  return [
    { phase: 'Hardware Design', weeks: hwDesignWeeks },
    { phase: 'Software Development', weeks: swDevWeeks },
    { phase: 'Integration & Testing', weeks: integrationWeeks },
    { phase: 'Commissioning', weeks: commissionWeeks },
  { phase: 'Total', weeks: hwDesignWeeks + swDevWeeks + integrationWeeks + commissionWeeks },
  ];
}

// ===== Sheet Builders =====

function buildProjectInfoSheet(
  wb: XLSX.WorkBook,
  config: ProjectConfig,
) {
  const ws = XLSX.utils.aoa_to_sheet([['']]);
  ws['!cols'] = [{ wch: 30 }, { wch: 50 }];

  let r = 0;
  addLabeledRow(ws, r++, 'Project Name', config.project.name);
  addLabeledRow(ws, r++, 'Customer', config.project.customer);
  addLabeledRow(ws, r++, 'Machine Type', config.project.machineType);
  addLabeledRow(ws, r++, 'Industry', config.project.industry);
  addLabeledRow(ws, r++, 'Description', config.project.description);
  addLabeledRow(ws, r++, 'Requirement Clarity', config.project.requirementClarity);
  addLabeledRow(ws, r++, 'Customer Involvement', config.project.customerInvolvement);
  addLabeledRow(ws, r++, 'Project Variants', config.project.projectVariants);
  addLabeledRow(ws, r++, 'Machine Stations', config.project.machineStations);
  r++; // blank row
  addLabeledRow(ws, r++, 'Export Date', new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }));
  addLabeledRow(ws, r++, 'Overall Complexity', getOverallComplexity(config));

  XLSX.utils.book_append_sheet(wb, ws, 'Project Info');
}

function buildIOSheet(wb: XLSX.WorkBook, config: ProjectConfig) {
  const ws = XLSX.utils.aoa_to_sheet([['']]);
  ws['!cols'] = [{ wch: 30 }, { wch: 15 }];

  let r = 0;
  addLabeledRow(ws, r++, 'Digital Inputs', config.io.digitalInputs);
  addLabeledRow(ws, r++, 'Digital Outputs', config.io.digitalOutputs);
  addLabeledRow(ws, r++, 'Analog Inputs', config.io.analogInputs);
  addLabeledRow(ws, r++, 'Analog Outputs', config.io.analogOutputs);
  addLabeledRow(ws, r++, 'Safety I/O', config.io.safetyIO);
  addLabeledRow(ws, r++, 'Encoder/Counter Modules', config.io.encoderCounterModules);
  addLabeledRow(ws, r++, 'Temperature Modules', config.io.temperatureModules);
  addLabeledRow(ws, r++, 'Communication Modules', config.io.communicationIO);
  addLabeledRow(ws, r++, 'Special Modules', config.io.specialModules);
  r++; // blank row

  const total =
    config.io.digitalInputs +
    config.io.digitalOutputs +
    config.io.analogInputs +
    config.io.analogOutputs +
    config.io.safetyIO +
    config.io.encoderCounterModules +
    config.io.temperatureModules +
    config.io.communicationIO +
    config.io.specialModules;
  const tStyle: XLSX.CellStyle = {
    font: { bold: true },
    alignment: { vertical: 'center' },
  };
  const totalLabel = XLSX.utils.encode_cell({ r, c: 0 });
  ws[totalLabel] = { v: 'Total I/O Count', t: 's', s: tStyle };
  const totalVal = XLSX.utils.encode_cell({ r, c: 1 });
  ws[totalVal] = { v: total, t: 'n', s: tStyle };

  XLSX.utils.book_append_sheet(wb, ws, 'IO Configuration');
}

function buildMotionSheet(wb: XLSX.WorkBook, config: ProjectConfig) {
  const ws = XLSX.utils.aoa_to_sheet([['']]);
  ws['!cols'] = [{ wch: 30 }, { wch: 15 }];

  let r = 0;
  addLabeledRow(ws, r++, 'Total Axes', config.motion.totalAxes);
  addLabeledRow(ws, r++, 'Linear Axes', config.motion.linearAxes);
  addLabeledRow(ws, r++, 'Rotary Axes', config.motion.rotaryAxes);
  addLabeledRow(ws, r++, 'Servo Drives', config.motion.servoDrives);
  addLabeledRow(ws, r++, 'Servo Motors', config.motion.servoMotors);
  r++; // blank row
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

  XLSX.utils.book_append_sheet(wb, ws, 'Motion Control');
}

function buildHMISheet(wb: XLSX.WorkBook, config: ProjectConfig) {
  const ws = XLSX.utils.aoa_to_sheet([['']]);
  ws['!cols'] = [{ wch: 30 }, { wch: 15 }];

  let r = 0;
  addLabeledRow(ws, r++, 'HMI Type', config.hmi.type);
  addLabeledRow(ws, r++, 'Number of Screens', config.hmi.screens);
  addLabeledRow(ws, r++, 'Screen Complexity', config.hmi.screenComplexity);
  r++; // blank row
  addLabeledRow(ws, r++, 'Alarm Management', config.hmi.alarmManagement);
  addLabeledRow(ws, r++, 'Recipe Management', config.hmi.recipeManagement);
  addLabeledRow(ws, r++, 'Trend Visualization', config.hmi.trendVisualization);
  addLabeledRow(ws, r++, 'User Management', config.hmi.userManagement);
  addLabeledRow(ws, r++, 'Machine Diagnostics', config.hmi.machineDiagnostics);
  addLabeledRow(ws, r++, 'Manual Mode', config.hmi.manualMode);
  addLabeledRow(ws, r++, 'Automatic Mode', config.hmi.automaticMode);
  addLabeledRow(ws, r++, 'Maintenance Screens', config.hmi.maintenanceScreens);
  addLabeledRow(ws, r++, 'Parameter Management', config.hmi.parameterManagement);

  XLSX.utils.book_append_sheet(wb, ws, 'HMI');
}

function buildVisionSheet(wb: XLSX.WorkBook, config: ProjectConfig) {
  const ws = XLSX.utils.aoa_to_sheet([['']]);
  ws['!cols'] = [{ wch: 30 }, { wch: 15 }];

  let r = 0;
  addLabeledRow(ws, r++, 'Vision Enabled', config.vision.enabled);
  addLabeledRow(ws, r++, 'Number of Cameras', config.vision.cameras);
  addLabeledRow(ws, r++, 'Lighting Systems', config.vision.lightingSystems);
  r++; // blank row
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

  XLSX.utils.book_append_sheet(wb, ws, 'Vision');
}

function buildSafetySheet(wb: XLSX.WorkBook, config: ProjectConfig) {
  const ws = XLSX.utils.aoa_to_sheet([['']]);
  ws['!cols'] = [{ wch: 30 }, { wch: 15 }];

  let r = 0;
  addLabeledRow(ws, r++, 'Safety Enabled', config.safety.enabled);
  addLabeledRow(ws, r++, 'Safety Controller', config.safety.controller);
  addLabeledRow(ws, r++, 'Safety I/O Count', config.safety.safetyIOCount);
  addLabeledRow(ws, r++, 'Emergency Stops', config.safety.emergencyStops);
  addLabeledRow(ws, r++, 'Safety Doors', config.safety.safetyDoors);
  addLabeledRow(ws, r++, 'Light Curtains', config.safety.lightCurtains);
  r++; // blank row
  addLabeledRow(ws, r++, 'Safe Motion', config.safety.safeMotion);
  addLabeledRow(ws, r++, 'Safety Functions', config.safety.safetyFunctions);
  addLabeledRow(ws, r++, 'Validation Required', config.safety.validationRequired);
  addLabeledRow(ws, r++, 'Testing Required', config.safety.testingRequired);
  addLabeledRow(ws, r++, 'Documentation Required', config.safety.documentationRequired);

  XLSX.utils.book_append_sheet(wb, ws, 'Safety');
}

function buildCommunicationSheet(wb: XLSX.WorkBook, config: ProjectConfig) {
  const ws = XLSX.utils.aoa_to_sheet([['']]);
  ws['!cols'] = [{ wch: 20 }, { wch: 12 }, { wch: 15 }, { wch: 55 }];

  // Protocols table
  let r = 0;
  addSheetHeaders(ws, ['Protocol', 'Enabled', 'Devices', 'Description'], [20, 12, 15, 55]);
  r = 1;

  for (const proto of config.communication.protocols) {
    const desc = PROTOCOL_DESCRIPTIONS[proto.name] || '';
    addRow(ws, r, [proto.name, proto.enabled, proto.devices, desc]);
    r++;
  }

  r++; // blank row

  // Integrations section
  const intStyle: XLSX.CellStyle = {
    font: { bold: true, sz: 12 },
    alignment: { vertical: 'center' },
  };
  const sectionCell = XLSX.utils.encode_cell({ r, c: 0 });
  ws[sectionCell] = { v: 'System Integrations', t: 's', s: intStyle };
  r++;

  addLabeledRow(ws, r++, 'PLC-to-PLC', config.communication.plcToPlc);
  addLabeledRow(ws, r++, 'MES Integration', config.communication.mesIntegration);
  addLabeledRow(ws, r++, 'SCADA Integration', config.communication.scadaIntegration);
  addLabeledRow(ws, r++, 'Cloud/IIoT Integration', config.communication.cloudIIoTIntegration);

  XLSX.utils.book_append_sheet(wb, ws, 'Communication');
}

function buildMechatronicsSheet(wb: XLSX.WorkBook, config: ProjectConfig) {
  const ws = XLSX.utils.aoa_to_sheet([['']]);
  ws['!cols'] = [{ wch: 30 }, { wch: 15 }];

  let r = 0;
  addLabeledRow(ws, r++, 'Mechatronics Type', config.mechatronics.type);
  addLabeledRow(ws, r++, 'Movers', config.mechatronics.movers);
  addLabeledRow(ws, r++, 'Processing Stations', config.mechatronics.processingStations);
  r++; // blank row
  addLabeledRow(ws, r++, 'Mover Routing', config.mechatronics.moverRouting);
  addLabeledRow(ws, r++, 'Independent Mover Control', config.mechatronics.independentMoverControl);
  addLabeledRow(ws, r++, 'Synchronization', config.mechatronics.synchronization);
  addLabeledRow(ws, r++, 'Transport Sequences', config.mechatronics.transportSequences);
  addLabeledRow(ws, r++, 'Product Handling', config.mechatronics.productHandling);
  addLabeledRow(ws, r++, 'Vision Integration', config.mechatronics.visionIntegration);
  addLabeledRow(ws, r++, 'HMI Integration', config.mechatronics.hmiIntegration);
  addLabeledRow(ws, r++, 'Safety Integration', config.mechatronics.safetyIntegration);
  addLabeledRow(ws, r++, 'Diagnostics', config.mechatronics.diagnostics);

  XLSX.utils.book_append_sheet(wb, ws, 'Mechatronics');
}

function buildRoboticsSheet(wb: XLSX.WorkBook, config: ProjectConfig) {
  const ws = XLSX.utils.aoa_to_sheet([['']]);
  ws['!cols'] = [{ wch: 30 }, { wch: 15 }];

  let r = 0;
  addLabeledRow(ws, r++, 'Robotics Enabled', config.robotics.enabled);
  addLabeledRow(ws, r++, 'Robot Type', config.robotics.robotType);
  addLabeledRow(ws, r++, 'Quantity', config.robotics.quantity);
  r++; // blank row
  addLabeledRow(ws, r++, 'Motion Integration', config.robotics.motionIntegration);
  addLabeledRow(ws, r++, 'Vision Integration', config.robotics.visionIntegration);
  addLabeledRow(ws, r++, 'Pick and Place', config.robotics.pickAndPlace);
  addLabeledRow(ws, r++, 'Trajectory Programming', config.robotics.trajectoryProgramming);
  addLabeledRow(ws, r++, 'Synchronization', config.robotics.synchronization);
  addLabeledRow(ws, r++, 'Simulation', config.robotics.simulation);
  addLabeledRow(ws, r++, 'Safety', config.robotics.safety);
  addLabeledRow(ws, r++, 'Robot Diagnostics', config.robotics.robotDiagnostics);

  XLSX.utils.book_append_sheet(wb, ws, 'Robotics');
}

function buildIIoTSheet(wb: XLSX.WorkBook, config: ProjectConfig) {
  const ws = XLSX.utils.aoa_to_sheet([['']]);
  ws['!cols'] = [{ wch: 30 }, { wch: 15 }];

  let r = 0;
  addLabeledRow(ws, r++, 'IPC Required', config.iiot.ipcRequired);
  addLabeledRow(ws, r++, 'IPC Model', config.iiot.ipcModel);
  addLabeledRow(ws, r++, 'IIoT Required', config.iiot.iiotRequired);
  addLabeledRow(ws, r++, 'IIoT Connector', config.iiot.iiotConnector);
  addLabeledRow(ws, r++, 'IIoT Services', config.iiot.iiotServices);
  addLabeledRow(ws, r++, 'IIoT Edge Device', config.iiot.iiotEdgeDevice);
  addLabeledRow(ws, r++, 'Cloud Connectivity', config.iiot.cloudConnectivity);
  r++; // blank row
  addLabeledRow(ws, r++, 'Machine Data Collection', config.iiot.machineDataCollection);
  addLabeledRow(ws, r++, 'Remote Maintenance', config.iiot.remoteMaintenance);
  addLabeledRow(ws, r++, 'OPC UA', config.iiot.opcUa);
  addLabeledRow(ws, r++, 'Data Logging', config.iiot.dataLogging);
  addLabeledRow(ws, r++, 'Analytics Integration', config.iiot.analyticsIntegration);

  XLSX.utils.book_append_sheet(wb, ws, 'IIoT');
}

function buildComplexitySheet(wb: XLSX.WorkBook, config: ProjectConfig) {
  const ws = XLSX.utils.aoa_to_sheet([['']]);
  ws['!cols'] = [{ wch: 30 }, { wch: 15 }, { wch: 40 }];

  // Table header
  let r = 0;
  addSheetHeaders(ws, ['Dimension', 'Rating', 'Notes'], [30, 15, 40]);
  r = 1;

  const dimensions: { key: keyof ProjectConfig['complexity']; label: string; note: string }[] = [
    { key: 'hardware', label: 'Hardware', note: `I/O modules, controller selection, wiring` },
    { key: 'motion', label: 'Motion', note: `Axes: ${config.motion.totalAxes}, Drives: ${config.motion.servoDrives}` },
    { key: 'hmi', label: 'HMI', note: `${config.hmi.screens} screens (${config.hmi.screenComplexity})` },
    { key: 'vision', label: 'Vision', note: config.vision.enabled ? `${config.vision.cameras} camera(s)` : 'Not enabled' },
    { key: 'safety', label: 'Safety', note: config.safety.enabled ? `${config.safety.safetyIOCount} safety I/O` : 'Not enabled' },
    { key: 'communication', label: 'Communication', note: `${config.communication.protocols.filter((p) => p.enabled).length} protocol(s) active` },
    { key: 'software', label: 'Software', note: `${config.additionalFeatures.filter((f) => f.enabled).length} additional features` },
    { key: 'integration', label: 'Integration', note: `Mechatronics: ${config.mechatronics.type}, Robotics: ${config.robotics.enabled ? 'Yes' : 'No'}` },
    { key: 'requirement', label: 'Requirement', note: `Clarity: ${config.project.requirementClarity}` },
    { key: 'testing', label: 'Testing', note: `Validation: ${bool(config.safety.validationRequired)}` },
    { key: 'testing', label: 'Commissioning (derived)', note: `Customer involvement: ${config.project.customerInvolvement}` },
  ];

  for (const dim of dimensions) {
    addRow(ws, r, [dim.label, config.complexity[dim.key], dim.note]);
    r++;
  }

  // Blank row + overall
  r++;
  const overall = getOverallComplexity(config);
  const oStyle: XLSX.CellStyle = {
    font: { bold: true },
    alignment: { vertical: 'center' },
  };
  const olCell = XLSX.utils.encode_cell({ r, c: 0 });
  ws[olCell] = { v: 'Overall Complexity', t: 's', s: oStyle };
  const orCell = XLSX.utils.encode_cell({ r, c: 1 });
  ws[orCell] = { v: overall, t: 's', s: oStyle };

  XLSX.utils.book_append_sheet(wb, ws, 'Complexity Assessment');
}

function buildEffortSheet(wb: XLSX.WorkBook, config: ProjectConfig) {
  const ws = XLSX.utils.aoa_to_sheet([['']]);
  ws['!cols'] = [{ wch: 30 }, { wch: 20 }];

  let r = 0;

  const sectionStyle: XLSX.CellStyle = {
    font: { bold: true, sz: 12 },
    alignment: { vertical: 'center' },
  };
  const tStyle: XLSX.CellStyle = {
    font: { bold: true },
    alignment: { vertical: 'center' },
  };

  // === Effort Breakdown ===
  const secCell = XLSX.utils.encode_cell({ r, c: 0 });
  ws[secCell] = { v: 'Effort Breakdown', t: 's', s: sectionStyle };
  r++;
  addSheetHeaders(ws, ['Area', 'Estimated Hours'], undefined, r);
  r++;

  const effort = calculateEffort(config);
  for (let i = 0; i < effort.length; i++) {
    const e = effort[i];
    const aCell = XLSX.utils.encode_cell({ r, c: 0 });
    ws[aCell] = { v: e.area, t: 's', s: i === effort.length - 1 ? tStyle : undefined };
    const hCell = XLSX.utils.encode_cell({ r, c: 1 });
    ws[hCell] = { v: e.hours, t: 'n', s: i === effort.length - 1 ? tStyle : undefined };
    r++;
  }

  r++; // blank row

  // === Timeline ===
  const secCell2 = XLSX.utils.encode_cell({ r, c: 0 });
  ws[secCell2] = { v: 'Timeline (Weeks)', t: 's', s: sectionStyle };
  r++;
  addSheetHeaders(ws, ['Phase', 'Duration (weeks)'], undefined, r);
  r++;

  const timeline = calculateTimeline(config);
  for (let i = 0; i < timeline.length; i++) {
    const t = timeline[i];
    const pCell = XLSX.utils.encode_cell({ r, c: 0 });
    ws[pCell] = { v: t.phase, t: 's', s: i === timeline.length - 1 ? tStyle : undefined };
    const wCell = XLSX.utils.encode_cell({ r, c: 1 });
    ws[wCell] = { v: t.weeks, t: 'n', s: i === timeline.length - 1 ? tStyle : undefined };
    r++;
  }

  r++; // blank row

  // === Risk Indicators ===
  const secCell3 = XLSX.utils.encode_cell({ r, c: 0 });
  ws[secCell3] = { v: 'Risk Indicators', t: 's', s: sectionStyle };
  r++;
  addSheetHeaders(ws, ['Indicator', 'Value'], undefined, r);
  r++;

  const highComplexityCount = [
    config.complexity.hardware, config.complexity.motion, config.complexity.hmi,
    config.complexity.vision, config.complexity.safety, config.complexity.communication,
    config.complexity.software, config.complexity.integration, config.complexity.requirement,
    config.complexity.testing,
  ].filter((x) => x === 'High' || x === 'Very High').length;

  addLabeledRow(ws, r++, 'Requirement Clarity', config.project.requirementClarity);
  addLabeledRow(ws, r++, 'Customer Involvement', config.project.customerInvolvement);
  addLabeledRow(ws, r++, 'High-Complexity Dimensions', highComplexityCount);

  XLSX.utils.book_append_sheet(wb, ws, 'Effort Summary');
}

// ===== POST Handler =====
export async function POST(request: NextRequest) {
  try {
    const body: ProjectConfig = await request.json();

    const wb = XLSX.utils.book_new();

    buildProjectInfoSheet(wb, body);
    buildIOSheet(wb, body);
    buildMotionSheet(wb, body);
    buildHMISheet(wb, body);
    buildVisionSheet(wb, body);
    buildSafetySheet(wb, body);
    buildCommunicationSheet(wb, body);
    buildMechatronicsSheet(wb, body);
    buildRoboticsSheet(wb, body);
    buildIIoTSheet(wb, body);
    buildComplexitySheet(wb, body);
    buildEffortSheet(wb, body);

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
