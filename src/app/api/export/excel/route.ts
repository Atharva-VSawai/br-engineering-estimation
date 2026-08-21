import { NextRequest, NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import type { ProjectConfig } from '@/types';
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

/** Build a worksheet from an array of rows. Each row is (string|number|boolean)[] */
function sheetFromRows(
  rows: (string | number | boolean)[][],
  colWidths?: number[],
): XLSX.WorkSheet {
  // Convert booleans to strings for display
  const cleaned = rows.map(row =>
    row.map(v => (typeof v === 'boolean' ? bool(v) : v))
  );
  const ws = XLSX.utils.aoa_to_sheet(cleaned);
  if (colWidths) {
    ws['!cols'] = colWidths.map(w => ({ wch: w }));
  }
  return ws;
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
  const e = result.effort;
  const ws = sheetFromRows(
    [
      ['Project Name', config.project.name || ''],
      ['Customer', config.project.customer || ''],
      ['Machine Type', config.project.machineType || ''],
      ['Industry', config.project.industry || ''],
      ['Requirement Clarity', config.project.requirementClarity || ''],
      ['Customer Involvement', config.project.customerInvolvement || ''],
      ['Overall Complexity', result.overallComplexity],
      [],
      ['Total Engineering Effort (hours)', Math.round(e.totalHours)],
      ['Total Working Days', Math.round(e.totalDays * 10) / 10],
      ['Estimated Timeline (weeks)', Math.round(e.totalWeeks * 10) / 10],
      ['Estimated Duration (months)', Math.round(e.totalMonths * 10) / 10],
      [],
      ['Export Date', new Date().toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric',
      })],
    ],
    [35, 50],
  );
  XLSX.utils.book_append_sheet(wb, ws, 'Project Summary');
}

// Sheet 2: B&R Technical Configuration
function buildTechnicalConfigSheet(
  wb: XLSX.WorkBook,
  config: ProjectConfig,
) {
  const c = config;
  const rows: (string | number | boolean)[][] = [
    ['CONTROLLER'],
    ['Family', c.controller.family],
    ['Quantity', c.controller.quantity],
    ['Performance', c.controller.performance],
    ['Communication Interfaces', c.controller.communicationInterfaces || 'None'],
    ['Redundancy Required', c.controller.redundancyRequired],
    ['Simulation Required', c.controller.simulationRequired],
    ['Diagnostics Required', c.controller.diagnosticsRequired],
    [],
    ['I/O'],
    ['Digital Inputs', c.io.digitalInputs],
    ['Digital Outputs', c.io.digitalOutputs],
    ['Analog Inputs', c.io.analogInputs],
    ['Analog Outputs', c.io.analogOutputs],
    ['Safety I/O', c.io.safetyIO],
    ['Encoder/Counter Modules', c.io.encoderCounterModules],
    ['Temperature Modules', c.io.temperatureModules],
    ['Communication Modules', c.io.communicationIO],
    ['Special Modules', c.io.specialModules],
    [],
    ['MOTION'],
    ['Total Axes', c.motion.totalAxes],
    ['Linear Axes', c.motion.linearAxes],
    ['Rotary Axes', c.motion.rotaryAxes],
    ['Servo Drives', c.motion.servoDrives],
    ['Servo Motors', c.motion.servoMotors],
    ['Homing', c.motion.homingRequired],
    ['Positioning', c.motion.positioning],
    ['Velocity Control', c.motion.velocityControl],
    ['Torque Control', c.motion.torqueControl],
    ['Synchronization', c.motion.synchronization],
    ['Master/Slave', c.motion.masterSlave],
    ['Electronic Gearing', c.motion.electronicGearing],
    ['Electronic Camming', c.motion.electronicCamming],
    ['Coordinated Motion', c.motion.coordinatedMotion],
    ['Interpolation', c.motion.interpolation],
    ['Complex Motion Profiles', c.motion.complexMotionProfiles],
    ['Axis Diagnostics', c.motion.axisDiagnostics],
    [],
    ['HMI'],
    ['Type', c.hmi.type],
    ['Number of Screens', c.hmi.screens],
    ['Screen Complexity', c.hmi.screenComplexity],
    ['Alarm Management', c.hmi.alarmManagement],
    ['Recipe Management', c.hmi.recipeManagement],
    ['Trend Visualization', c.hmi.trendVisualization],
    ['User Management', c.hmi.userManagement],
    ['Machine Diagnostics', c.hmi.machineDiagnostics],
    ['Manual Mode', c.hmi.manualMode],
    ['Automatic Mode', c.hmi.automaticMode],
    ['Maintenance Screens', c.hmi.maintenanceScreens],
    ['Parameter Management', c.hmi.parameterManagement],
    [],
    ['VISION'],
    ['Enabled', c.vision.enabled],
    ['Cameras', c.vision.cameras],
    ['Lighting Systems', c.vision.lightingSystems],
    ['Inspection', c.vision.inspection],
    ['Measurement', c.vision.measurement],
    ['Detection', c.vision.detection],
    ['Identification', c.vision.identification],
    ['OCR', c.vision.ocr],
    ['Barcode/QR', c.vision.barcodeQR],
    ['Pattern Matching', c.vision.patternMatching],
    ['Position Detection', c.vision.positionDetection],
    ['Quality Control', c.vision.qualityControl],
    ['PLC Integration', c.vision.plcIntegration],
    ['Motion-Vision Sync', c.vision.motionVisionSync],
    [],
    ['SAFETY'],
    ['Enabled', c.safety.enabled],
    ['Controller', c.safety.controller],
    ['Safety I/O Count', c.safety.safetyIOCount],
    ['Emergency Stops', c.safety.emergencyStops],
    ['Safety Doors', c.safety.safetyDoors],
    ['Light Curtains', c.safety.lightCurtains],
    ['Safe Motion', c.safety.safeMotion],
    ['Safety Functions', Array.isArray(c.safety.safetyFunctions) ? c.safety.safetyFunctions.join(', ') : ''],
    ['Validation Required', c.safety.validationRequired],
    ['Testing Required', c.safety.testingRequired],
    ['Documentation Required', c.safety.documentationRequired],
    [],
    ['COMMUNICATION'],
    ['Protocol', 'Enabled', 'Devices', 'Description'],
  ];

  for (const proto of c.communication.protocols) {
    rows.push([proto.name, proto.enabled, proto.devices, PROTOCOL_DESCRIPTIONS[proto.name] || '']);
  }

  rows.push(
    [],
    ['PLC-to-PLC', c.communication.plcToPlc],
    ['MES Integration', c.communication.mesIntegration],
    ['SCADA Integration', c.communication.scadaIntegration],
    ['Cloud/IIoT Integration', c.communication.cloudIIoTIntegration],
    [],
    ['MECHATRONICS'],
    ['Type', c.mechatronics.type],
    ['Movers', c.mechatronics.movers],
    ['Processing Stations', c.mechatronics.processingStations],
    ['Mover Routing', c.mechatronics.moverRouting],
    ['Independent Mover Control', c.mechatronics.independentMoverControl],
    ['Synchronization', c.mechatronics.synchronization],
    ['Transport Sequences', Array.isArray(c.mechatronics.transportSequences) ? c.mechatronics.transportSequences.join(', ') : ''],
    ['Product Handling', c.mechatronics.productHandling],
    ['Vision Integration', c.mechatronics.visionIntegration],
    ['HMI Integration', c.mechatronics.hmiIntegration],
    ['Safety Integration', c.mechatronics.safetyIntegration],
    ['Diagnostics', c.mechatronics.diagnostics],
    [],
    ['ROBOTICS'],
    ['Enabled', c.robotics.enabled],
    ['Robot Type', c.robotics.robotType],
    ['Quantity', c.robotics.quantity],
    ['Motion Integration', c.robotics.motionIntegration],
    ['Vision Integration', c.robotics.visionIntegration],
    ['Pick and Place', c.robotics.pickAndPlace],
    ['Trajectory Programming', c.robotics.trajectoryProgramming],
    ['Synchronization', c.robotics.synchronization],
    ['Simulation', c.robotics.simulation],
    ['Safety', c.robotics.safety],
    ['Robot Diagnostics', c.robotics.robotDiagnostics],
    [],
    ['IIoT'],
    ['IPC Required', c.iiot.ipcRequired],
    ['IPC Model', c.iiot.ipcModel],
    ['IIoT Required', c.iiot.iiotRequired],
    ['IIoT Connector', c.iiot.iiotConnector],
    ['IIoT Services', c.iiot.iiotServices],
    ['IIoT Edge Device', c.iiot.iiotEdgeDevice],
    ['Cloud Connectivity', c.iiot.cloudConnectivity],
    ['Machine Data Collection', c.iiot.machineDataCollection],
    ['Remote Maintenance', c.iiot.remoteMaintenance],
    ['OPC UA', c.iiot.opcUa],
    ['Data Logging', c.iiot.dataLogging],
    ['Analytics Integration', c.iiot.analyticsIntegration],
  );

  const ws = sheetFromRows(rows, [32, 50]);
  XLSX.utils.book_append_sheet(wb, ws, 'Technical Configuration');
}

// Sheet 3: Engineering Effort
function buildEffortSheet(
  wb: XLSX.WorkBook,
  result: ReturnType<typeof calculateEngineeringEffort>,
) {
  const e = result.effort;
  const totalH = e.totalHours;

  const rows: (string | number)[][] = [
    ['Engineering Area', 'Estimated Hours', 'Percentage'],
    ['Hardware Engineering', Math.round(e.hardwareHours * 10) / 10, `${totalH > 0 ? Math.round((e.hardwareHours / totalH) * 1000) / 10 : 0}%`],
    ['PLC / Software Engineering', Math.round(e.plcSoftwareHours * 10) / 10, `${totalH > 0 ? Math.round((e.plcSoftwareHours / totalH) * 1000) / 10 : 0}%`],
    ['Motion Engineering', Math.round(e.motionHours * 10) / 10, `${totalH > 0 ? Math.round((e.motionHours / totalH) * 1000) / 10 : 0}%`],
    ['Vision Engineering', Math.round(e.visionHours * 10) / 10, `${totalH > 0 ? Math.round((e.visionHours / totalH) * 1000) / 10 : 0}%`],
    ['Safety Engineering', Math.round(e.safetyHours * 10) / 10, `${totalH > 0 ? Math.round((e.safetyHours / totalH) * 1000) / 10 : 0}%`],
    ['Communication / Integration', Math.round(e.communicationIntegrationHours * 10) / 10, `${totalH > 0 ? Math.round((e.communicationIntegrationHours / totalH) * 1000) / 10 : 0}%`],
    ['Testing', Math.round(e.testingHours * 10) / 10, `${totalH > 0 ? Math.round((e.testingHours / totalH) * 1000) / 10 : 0}%`],
    ['Commissioning', Math.round(e.commissioningHours * 10) / 10, `${totalH > 0 ? Math.round((e.commissioningHours / totalH) * 1000) / 10 : 0}%`],
    [],
    ['TOTAL', Math.round(totalH * 10) / 10, '100%'],
  ];

  const ws = sheetFromRows(rows, [35, 20, 15]);
  XLSX.utils.book_append_sheet(wb, ws, 'Engineering Effort');
}

// Sheet 4: Complexity Assessment
function buildComplexitySheet(
  wb: XLSX.WorkBook,
  config: ProjectConfig,
  result: ReturnType<typeof calculateEngineeringEffort>,
) {
  const c = config;
  const rows: (string | number)[][] = [
    ['Dimension', 'Rating', 'Notes'],
    ['Hardware', c.complexity.hardware, 'I/O modules, controller selection, wiring'],
    ['Motion', c.complexity.motion, `Axes: ${c.motion.totalAxes}, Drives: ${c.motion.servoDrives}`],
    ['HMI', c.complexity.hmi, `${c.hmi.screens} screens (${c.hmi.screenComplexity})`],
    ['Vision', c.complexity.vision, c.vision.enabled ? `${c.vision.cameras} camera(s)` : 'Not enabled'],
    ['Safety', c.complexity.safety, c.safety.enabled ? `${c.safety.safetyIOCount} safety I/O` : 'Not enabled'],
    ['Communication', c.complexity.communication, `${c.communication.protocols.filter((p) => p.enabled).length} protocol(s) active`],
    ['Software', c.complexity.software, `${c.additionalFeatures.filter((f) => f.enabled).length} additional features`],
    ['Integration', c.complexity.integration, `Mechatronics: ${c.mechatronics.type}, Robotics: ${c.robotics.enabled ? 'Yes' : 'No'}`],
    ['Requirement', c.complexity.requirement, `Clarity: ${c.project.requirementClarity}`],
    ['Testing', c.complexity.testing, 'Validation and testing scope'],
    [],
    ['Overall Complexity', result.overallComplexity, ''],
    ['High/Very High Count', `${result.highCount} of 10`, ''],
  ];

  const ws = sheetFromRows(rows, [30, 15, 50]);
  XLSX.utils.book_append_sheet(wb, ws, 'Complexity Assessment');
}

// Sheet 5: Timeline
function buildTimelineSheet(
  wb: XLSX.WorkBook,
  result: ReturnType<typeof calculateEngineeringEffort>,
) {
  const t = result.timeline;
  const rows: (string | number)[][] = [
    ['Phase', 'Duration (weeks)'],
    ['Hardware Design & Ordering', t.hardwareDesignWeeks],
    ['Software Development', t.softwareDevelopmentWeeks],
    ['Integration & Testing', t.integrationTestingWeeks],
    ['Commissioning & Handover', t.commissioningWeeks],
    [],
    ['TOTAL', t.totalWeeks],
  ];

  const ws = sheetFromRows(rows, [40, 20]);
  XLSX.utils.book_append_sheet(wb, ws, 'Timeline');
}

// Sheet 6: Configuration Completeness
function buildCompletenessSheet(
  wb: XLSX.WorkBook,
  config: ProjectConfig,
) {
  const checks = checkCompleteness(config);
  const configuredCount = checks.filter((ch) => ch.configured).length;

  const rows: (string | number)[][] = [
    ['Section', 'Configured', 'Details'],
    ...checks.map(ch => [ch.label, ch.configured ? 'Yes' : 'No', ch.note] as (string | number)[]),
    [],
    ['Configured Sections', `${configuredCount} of ${checks.length}`, ''],
  ];

  const ws = sheetFromRows(rows, [25, 15, 45]);
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
