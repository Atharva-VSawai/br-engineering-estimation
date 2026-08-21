import { NextRequest, NextResponse } from 'next/server';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { ProjectConfig, ComplexityLevel } from '@/types';
import { calculateEngineeringEffort } from '@/lib/effort-calculation';
import { EFFORT_AREAS } from '@/data';

// B&R orange: #C75B12 => RGB(199, 91, 18)
const BR_ORANGE = [199, 91, 18] as const;

// Complexity value mapping
const COMPLEXITY_VALUE: Record<ComplexityLevel, number> = {
  Low: 0.25,
  Medium: 0.5,
  High: 0.75,
  'Very High': 1.0,
};

// Complexity bar colors (RGB)
const COMPLEXITY_BAR_COLOR: Record<ComplexityLevel, [number, number, number]> = {
  Low: [16, 185, 129],
  Medium: [245, 158, 11],
  High: [249, 115, 22],
  'Very High': [239, 68, 68],
};

// Donut chart palette
const DONUT_COLORS: [number, number, number][] = [
  [59, 130, 246],   // blue
  [139, 92, 246],   // purple
  [249, 115, 22],   // orange
  [6, 182, 212],    // cyan
  [239, 68, 68],    // red
  [16, 185, 129],   // emerald
  [245, 158, 11],   // amber
  [99, 102, 241],   // indigo
];

const DIMENSIONS: { key: keyof ProjectConfig['complexity']; label: string }[] = [
  { key: 'hardware', label: 'Hardware' },
  { key: 'motion', label: 'Motion' },
  { key: 'hmi', label: 'HMI' },
  { key: 'vision', label: 'Vision' },
  { key: 'safety', label: 'Safety' },
  { key: 'communication', label: 'Communication' },
  { key: 'software', label: 'Software' },
  { key: 'integration', label: 'Integration' },
  { key: 'requirement', label: 'Requirement' },
  { key: 'testing', label: 'Testing' },
];

// ── Helpers ──────────────────────────────────────────────────────────────────

function checkCompleteness(config: ProjectConfig): { label: string; configured: boolean }[] {
  const c = config;
  const ioTotal = c.io.digitalInputs + c.io.digitalOutputs + c.io.analogInputs + c.io.analogOutputs + c.io.safetyIO + c.io.encoderCounterModules + c.io.temperatureModules + c.io.communicationIO + c.io.specialModules;
  const motionFeatures = [c.motion.homingRequired, c.motion.positioning, c.motion.velocityControl, c.motion.torqueControl, c.motion.synchronization, c.motion.masterSlave, c.motion.electronicGearing, c.motion.electronicCamming, c.motion.coordinatedMotion, c.motion.interpolation, c.motion.complexMotionProfiles, c.motion.axisDiagnostics].filter(Boolean).length;
  const hmiFeatures = [c.hmi.alarmManagement, c.hmi.recipeManagement, c.hmi.trendVisualization, c.hmi.userManagement, c.hmi.machineDiagnostics, c.hmi.manualMode, c.hmi.automaticMode, c.hmi.maintenanceScreens, c.hmi.parameterManagement].filter(Boolean).length;
  const commActive = c.communication.protocols.some((p) => p.enabled);
  const commIntegrations = [c.communication.plcToPlc, c.communication.mesIntegration, c.communication.scadaIntegration, c.communication.cloudIIoTIntegration].filter(Boolean).length;
  const iiotFeatures = [c.iiot.ipcRequired, c.iiot.iiotRequired, c.iiot.iiotConnector, c.iiot.iiotServices, c.iiot.iiotEdgeDevice, c.iiot.cloudConnectivity, c.iiot.machineDataCollection, c.iiot.remoteMaintenance, c.iiot.opcUa, c.iiot.dataLogging, c.iiot.analyticsIntegration].filter(Boolean).length;
  return [
    { label: 'Project', configured: !!(c.project.name && c.project.name.trim()) },
    { label: 'Controller', configured: c.controller.quantity > 1 || c.controller.performance !== 'Standard' || !!c.controller.communicationInterfaces },
    { label: 'I/O', configured: ioTotal > 0 },
    { label: 'Motion', configured: c.motion.totalAxes > 0 || motionFeatures > 0 },
    { label: 'HMI', configured: c.hmi.screens > 0 || hmiFeatures > 0 },
    { label: 'Vision', configured: c.vision.enabled },
    { label: 'Safety', configured: c.safety.enabled },
    { label: 'Communication', configured: commActive || commIntegrations > 0 },
    { label: 'Mechatronics', configured: c.mechatronics.type !== 'None' && c.mechatronics.type !== '' },
    { label: 'Robotics', configured: c.robotics.enabled },
    { label: 'IIoT', configured: iiotFeatures > 0 },
  ];
}

// ── Section title helper ────────────────────────────────────────────────────

function drawSectionTitle(doc: jsPDF, y: number, title: string): number {
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...BR_ORANGE);
  doc.text(title.toUpperCase(), 15, y);
  doc.setDrawColor(...BR_ORANGE);
  doc.setLineWidth(0.5);
  doc.line(15, y + 1.5, 195, y + 1.5);
  doc.setDrawColor(0, 0, 0);
  return y + 7;
}

// ── Donut Chart ───────────────────────────────────────────────────────────────

function drawDonutChart(
  doc: jsPDF,
  cx: number,
  cy: number,
  outerR: number,
  innerR: number,
  data: { label: string; value: number }[],
  totalHours: number,
): void {
  let startAngle = -Math.PI / 2;

  for (let i = 0; i < data.length; i++) {
    const item = data[i];
    if (item.value <= 0) continue;
    const sliceAngle = (item.value / totalHours) * 2 * Math.PI;
    const endAngle = startAngle + sliceAngle;
    const color = DONUT_COLORS[i % DONUT_COLORS.length];

    doc.setFillColor(color[0], color[1], color[2]);
    doc.setGState(new (doc as any).GState({ opacity: 0.9 }));

    // Draw filled arc segments using small triangles for approximation
    const steps = Math.max(Math.ceil(sliceAngle / 0.05), 8);
    // Outer arc
    for (let s = 0; s <= steps; s++) {
      const angle = startAngle + (sliceAngle * s) / steps;
      const px = cx + outerR * Math.cos(angle);
      const py = cy + outerR * Math.sin(angle);
      if (s === 0) doc.moveTo(px, py);
      else doc.lineTo(px, py);
    }
    // Inner arc (reverse)
    for (let s = steps; s >= 0; s--) {
      const angle = startAngle + (sliceAngle * s) / steps;
      const px = cx + innerR * Math.cos(angle);
      const py = cy + innerR * Math.sin(angle);
      doc.lineTo(px, py);
    }
    doc.fill();

    doc.setGState(new (doc as any).GState({ opacity: 1 }));

    startAngle = endAngle;
  }

  // Center text
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(50, 50, 50);
  doc.text(`${Math.round(totalHours)}h`, cx, cy + 1, { align: 'center', baseline: 'middle' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(120, 120, 120);
  doc.text('Total Effort', cx, cy + 7, { align: 'center', baseline: 'middle' });

  // Legend (to the right of the donut)
  const legendX = cx + outerR + 10;
  let legendY = cy - (data.length * 5) / 2;

  for (let i = 0; i < data.length; i++) {
    if (data[i].value <= 0) continue;
    const color = DONUT_COLORS[i % DONUT_COLORS.length];
    doc.setFillColor(color[0], color[1], color[2]);
    doc.roundedRect(legendX, legendY - 1.5, 3, 3, 0.5, 0.5, 'F');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(60, 60, 60);
    const pct = totalHours > 0 ? Math.round((data[i].value / totalHours) * 100) : 0;
    doc.text(`${data[i].label} (${pct}%)`, legendX + 5, legendY, { align: 'left', baseline: 'middle' });
    legendY += 5;
  }
}

// ── Horizontal Bar Chart ─────────────────────────────────────────────────────

function drawHorizontalBarChart(
  doc: jsPDF,
  x: number,
  y: number,
  width: number,
  barHeight: number,
  gap: number,
  items: { label: string; value: number; max: number; color: [number, number, number]; valueLabel?: string }[],
  showTotal?: { label: string; value: number; color: [number, number, number] },
): number {
  const labelWidth = 42;
  const barStartX = x + labelWidth + 4;
  const barMaxWidth = width - labelWidth - 30;
  const maxVal = Math.max(...items.map((it) => it.max), 1);
  const labelRightEdge = barStartX - 2; // Right-align labels just before the bar

  let curY = y;

  for (const item of items) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(50, 50, 50);
    doc.text(item.label, labelRightEdge, curY + barHeight / 2 + 1, { align: 'right', baseline: 'middle' });

    const barW = Math.max((item.value / maxVal) * barMaxWidth, 2);
    doc.setFillColor(...item.color);
    doc.roundedRect(barStartX, curY, barW, barHeight, 1.5, 1.5, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(50, 50, 50);
    const vLabel = item.valueLabel ?? `${item.value.toFixed(1)}h`;
    doc.text(vLabel, barStartX + barW + 3, curY + barHeight / 2 + 1, { align: 'left', baseline: 'middle' });

    curY += barHeight + gap;
  }

  if (showTotal) {
    curY -= gap / 2;
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.3);
    doc.line(barStartX, curY, barStartX + barMaxWidth, curY);
    curY += gap / 2;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(...BR_ORANGE);
    doc.text(showTotal.label, labelRightEdge, curY + barHeight / 2 + 1, { align: 'right', baseline: 'middle' });

    const barW = Math.max((showTotal.value / maxVal) * barMaxWidth, 2);
    doc.setFillColor(...showTotal.color);
    doc.roundedRect(barStartX, curY, barW, barHeight, 1.5, 1.5, 'F');

    doc.text(`${showTotal.value.toFixed(1)}h`, barStartX + barW + 3, curY + barHeight / 2 + 1, { align: 'left', baseline: 'middle' });
    curY += barHeight + gap;
  }

  return curY;
}

// ── Complexity Bar Chart ─────────────────────────────────────────────────────

function drawComplexityProfile(
  doc: jsPDF,
  x: number,
  y: number,
  width: number,
  barHeight: number,
  gap: number,
  config: ProjectConfig,
): number {
  const labelWidth = 38;
  const barStartX = x + labelWidth + 4;
  const barMaxWidth = width - labelWidth - 25;
  const labelRightEdge = barStartX - 2; // Right-align labels just before the bar

  let curY = y;

  for (const dim of DIMENSIONS) {
    const level = config.complexity[dim.key];
    const val = COMPLEXITY_VALUE[level] || 0.25;
    const color = COMPLEXITY_BAR_COLOR[level] || [150, 150, 150];

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(50, 50, 50);
    doc.text(dim.label, labelRightEdge, curY + barHeight / 2 + 1, { align: 'right', baseline: 'middle' });

    const barW = Math.max(val * barMaxWidth, 2);
    doc.setFillColor(color[0], color[1], color[2]);
    doc.setGState(new (doc as any).GState({ opacity: 0.85 }));
    doc.roundedRect(barStartX, curY, barW, barHeight, 1.5, 1.5, 'F');
    doc.setGState(new (doc as any).GState({ opacity: 1 }));

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(50, 50, 50);
    doc.text(level, barStartX + barW + 3, curY + barHeight / 2 + 1, { align: 'left', baseline: 'middle' });

    curY += barHeight + gap;
  }

  return curY;
}

// ── Timeline / Gantt Chart ────────────────────────────────────────────────────

function drawTimelineChart(
  doc: jsPDF,
  x: number,
  y: number,
  width: number,
  barHeight: number,
  gap: number,
  phases: { phase: string; weeks: number }[],
  totalWeeks: number,
): number {
  const labelWidth = 55;
  const barStartX = x + labelWidth + 4;
  const barMaxWidth = width - labelWidth - 28;
  const labelRightEdge = barStartX - 2; // Right-align labels just before the bar
  const colors: [number, number, number][] = [
    [59, 130, 246],
    [245, 158, 11],
    [249, 115, 22],
    [16, 185, 129],
  ];

  let curY = y;

  for (let i = 0; i < phases.length; i++) {
    const p = phases[i];
    const color = colors[i % colors.length];

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(50, 50, 50);
    doc.text(p.phase, labelRightEdge, curY + barHeight / 2 + 1, { align: 'right', baseline: 'middle' });

    doc.setFillColor(...color);
    doc.circle(barStartX - 2, curY + barHeight / 2, 1.5, 'F');

    const barW = Math.max((p.weeks / totalWeeks) * barMaxWidth, 6);
    doc.setFillColor(color[0], color[1], color[2]);
    doc.setGState(new (doc as any).GState({ opacity: 0.85 }));
    doc.roundedRect(barStartX, curY, barW, barHeight, 1.5, 1.5, 'F');
    doc.setGState(new (doc as any).GState({ opacity: 1 }));

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(100, 100, 100);
    const weekLabel = `${p.weeks} week${p.weeks !== 1 ? 's' : ''}`;
    doc.text(weekLabel, barStartX + barW + 3, curY + barHeight / 2 + 1, { align: 'left', baseline: 'middle' });

    curY += barHeight + gap;
  }

  return curY;
}

// ── PDF Generation (identical to client-side, returns ArrayBuffer instead of downloading) ──

function generatePdfBuffer(config: ProjectConfig, projectId?: string | null): ArrayBuffer {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageW = 210;
  const margin = 15;
  const contentW = pageW - margin * 2;

  // Use shared calculation
  const result = calculateEngineeringEffort(config);
  const { effort, timeline, overallComplexity, highCount } = result;
  const completeness = checkCompleteness(config);
  const configuredCount = completeness.filter((s) => s.configured).length;

  // Effort items for charts (8 categories, skip hmiHours which is 0)
  const effortData = [
    { label: 'Hardware', value: effort.hardwareHours },
    { label: 'PLC/Software', value: effort.plcSoftwareHours },
    { label: 'Motion', value: effort.motionHours },
    { label: 'Vision', value: effort.visionHours },
    { label: 'Safety', value: effort.safetyHours },
    { label: 'Comm/Integ.', value: effort.communicationIntegrationHours },
    { label: 'Testing', value: effort.testingHours },
    { label: 'Commissioning', value: effort.commissioningHours },
  ];

  const timelinePhases = [
    { phase: 'Hardware Design & Ordering', weeks: timeline.hardwareDesignWeeks },
    { phase: 'Software Development', weeks: timeline.softwareDevelopmentWeeks },
    { phase: 'Integration & Testing', weeks: timeline.integrationTestingWeeks },
    { phase: 'Commissioning & Handover', weeks: timeline.commissioningWeeks },
  ];

  // ══════════════════════════════════════════════════════════════════════════
  // PAGE 1: Report Header, Project Info, Effort Summary, Donut Chart
  // ══════════════════════════════════════════════════════════════════════════

  let y = 12;

  // Report title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(...BR_ORANGE);
  doc.text('B&R Engineering Effort Estimation Report', margin, y);
  y += 10;

  // Project Information
  y = drawSectionTitle(doc, y, 'Project Information');

  const infoRows = [
    ['Project ID', projectId || 'N/A'],
    ['Project Name', config.project.name || 'Untitled'],
    ['Customer', config.project.customer || 'N/A'],
    ['Machine Type', config.project.machineType || 'N/A'],
    ['Industry', config.project.industry || 'N/A'],
    ['Date', new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })],
  ];

  autoTable(doc, {
    startY: y,
    body: infoRows,
    theme: 'plain',
    styles: {
      fontSize: 8,
      cellPadding: 2.5,
      lineColor: [240, 240, 240],
      lineWidth: 0.3,
    },
    columnStyles: {
      0: { cellWidth: 35, fontStyle: 'bold', textColor: [100, 100, 100] },
      1: { cellWidth: 'auto' },
    },
    margin: { left: margin, right: margin },
  });

  y = (doc as any).lastAutoTable?.finalY ?? 60;
  y += 8;

  // Engineering Effort Summary (prominent)
  y = drawSectionTitle(doc, y, 'Engineering Effort Summary');

  // Summary boxes
  const boxW = (contentW - 15) / 4;
  const boxH = 18;
  const summaryItems = [
    { label: 'Total Hours', value: `${Math.round(effort.totalHours)}h` },
    { label: 'Working Days', value: `${(Math.round(effort.totalDays * 10) / 10).toFixed(1)} days` },
    { label: 'Weeks', value: `${effort.totalWeeks} weeks` },
    { label: 'Months', value: `${(Math.round(effort.totalMonths * 10) / 10).toFixed(1)} months` },
  ];

  for (let i = 0; i < summaryItems.length; i++) {
    const bx = margin + i * (boxW + 5);
    const item = summaryItems[i];

    doc.setFillColor(248, 248, 248);
    doc.setDrawColor(230, 230, 230);
    doc.setLineWidth(0.3);
    doc.roundedRect(bx, y, boxW, boxH, 2, 2, 'FD');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(140, 140, 140);
    doc.text(item.label.toUpperCase(), bx + boxW / 2, y + 6, { align: 'center' });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(30, 30, 30);
    doc.text(item.value, bx + boxW / 2, y + 13, { align: 'center' });
  }

  y += boxH + 10;

  // Donut Chart
  y = drawSectionTitle(doc, y, 'Effort Distribution');
  const donutCx = margin + 45;
  const donutCy = y + 30;
  drawDonutChart(doc, donutCx, donutCy, 28, 14, effortData, effort.totalHours);

  // ══════════════════════════════════════════════════════════════════════════
  // PAGE 2: Technical Configuration (brief), Complexity Assessment, Effort Bars
  // ══════════════════════════════════════════════════════════════════════════
  doc.addPage();
  y = 15;

  // Key Technical Parameters (brief table)
  y = drawSectionTitle(doc, y, 'Key Technical Parameters');

  const techRows = [
    ['Controller', `${config.controller.family} x${config.controller.quantity} (${config.controller.performance})`],
    ['I/O Points', `${config.io.digitalInputs + config.io.digitalOutputs + config.io.analogInputs + config.io.analogOutputs} (DI/DO/AI/AO)`],
    ['Motion Axes', `${config.motion.totalAxes} (L:${config.motion.linearAxes} R:${config.motion.rotaryAxes})`],
    ['HMI', `${config.hmi.type} - ${config.hmi.screens} screens`],
    ['Vision', config.vision.enabled ? `${config.vision.cameras} camera(s)` : 'Not enabled'],
    ['Safety', config.safety.enabled ? `${config.safety.controller} - ${config.safety.safetyIOCount} I/O` : 'Not enabled'],
    ['Protocols', `${config.communication.protocols.filter((p) => p.enabled).map((p) => p.name).join(', ') || 'None'}`],
    ['Mechatronics', config.mechatronics.type !== 'None' ? `${config.mechatronics.type} (${config.mechatronics.movers} movers)` : 'None'],
    ['Robotics', config.robotics.enabled ? `${config.robotics.robotType} x${config.robotics.quantity}` : 'Not enabled'],
    ['IIoT', config.iiot.ipcRequired ? config.iiot.ipcModel : 'Not configured'],
  ];

  autoTable(doc, {
    startY: y,
    body: techRows,
    theme: 'plain',
    styles: {
      fontSize: 7.5,
      cellPadding: 2.5,
      lineColor: [240, 240, 240],
      lineWidth: 0.3,
    },
    columnStyles: {
      0: { cellWidth: 28, fontStyle: 'bold', textColor: [100, 100, 100] },
      1: { cellWidth: 'auto' },
    },
    margin: { left: margin, right: margin },
  });

  y = (doc as any).lastAutoTable?.finalY ?? 60;
  y += 8;

  // Complexity Assessment (bar chart)
  y = drawSectionTitle(doc, y, 'Complexity Assessment');
  y = drawComplexityProfile(doc, margin, y, contentW, 4.5, 2, config);
  y += 3;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 100, 100);
  doc.text(`Overall: ${overallComplexity}  |  ${highCount} of 10 dimensions rated High or Very High`, margin, y);
  y += 10;

  // Engineering Effort Breakdown (horizontal bars)
  y = drawSectionTitle(doc, y, 'Engineering Effort Breakdown');

  const effortBarItems = effortData.map((item, i) => ({
    label: item.label,
    value: item.value,
    max: effort.totalHours,
    color: DONUT_COLORS[i % DONUT_COLORS.length],
  }));

  y = drawHorizontalBarChart(doc, margin, y, contentW, 5, 2, effortBarItems, {
    label: 'TOTAL',
    value: effort.totalHours,
    color: BR_ORANGE as unknown as [number, number, number],
  });

  // ══════════════════════════════════════════════════════════════════════════
  // PAGE 3: Detailed Effort Table, Timeline, Completeness, Drivers
  // ══════════════════════════════════════════════════════════════════════════
  doc.addPage();
  y = 15;

  // Effort Distribution Table (autotable)
  y = drawSectionTitle(doc, y, 'Detailed Engineering Effort');

  const effortTableRows = effortData.map((item) => [
    item.label,
    `${item.value.toFixed(1)}h`,
    effort.totalHours > 0 ? `${Math.round((item.value / effort.totalHours) * 100)}%` : '0%',
  ]);
  effortTableRows.push([
    'TOTAL',
    `${effort.totalHours.toFixed(1)}h`,
    '100%',
  ]);

  autoTable(doc, {
    startY: y,
    head: [['Engineering Area', 'Estimated Hours', 'Percentage']],
    body: effortTableRows,
    theme: 'grid',
    styles: {
      fontSize: 8,
      cellPadding: 3,
      lineColor: [220, 220, 220],
      lineWidth: 0.3,
    },
    headStyles: {
      fillColor: [248, 248, 248],
      textColor: [80, 80, 80],
      fontStyle: 'bold',
      halign: 'left',
    },
    columnStyles: {
      0: { cellWidth: 50, fontStyle: 'bold' },
      1: { cellWidth: 35, halign: 'right' },
      2: { cellWidth: 25, halign: 'right' },
    },
    margin: { left: margin, right: margin },
    // Style the last row (TOTAL) as bold
    didParseCell: (data) => {
      if (data.section === 'body' && data.row.index === effortData.length) {
        data.cell.styles.fontStyle = 'bold';
        data.cell.styles.fillColor = [253, 248, 243];
      }
    },
  });

  y = (doc as any).lastAutoTable?.finalY ?? 60;
  y += 8;

  // Timeline (Gantt-like bars)
  y = drawSectionTitle(doc, y, 'Project Timeline');
  y = drawTimelineChart(doc, margin, y, contentW, 6, 3, timelinePhases, timeline.totalWeeks);
  y += 3;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...BR_ORANGE);
  doc.text(`Estimated Total: ${timeline.totalWeeks} weeks`, margin, y);
  y += 10;

  // Configuration Completeness
  y = drawSectionTitle(doc, y, 'Configuration Completeness');

  const cols = 3;
  const colW = contentW / cols;
  for (let i = 0; i < completeness.length; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const cx = margin + col * colW;
    const cy = y + row * 7;

    const configured = completeness[i].configured;
    if (configured) {
      doc.setFillColor(236, 253, 245);
      doc.circle(cx + 3, cy + 2.5, 2.8, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.setTextColor(5, 150, 105);
      doc.text('\u2713', cx + 3, cy + 3.2, { align: 'center', baseline: 'middle' });
    } else {
      doc.setFillColor(243, 244, 246);
      doc.circle(cx + 3, cy + 2.5, 2.8, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.setTextColor(156, 163, 175);
      doc.text('\u2717', cx + 3, cy + 3.2, { align: 'center', baseline: 'middle' });
    }

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(configured ? 30 : 156, configured ? 30 : 163, configured ? 30 : 175);
    doc.text(completeness[i].label, cx + 8, cy + 3.2, { align: 'left', baseline: 'middle' });
  }

  const totalRows = Math.ceil(completeness.length / cols);
  y += totalRows * 7 + 4;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(140, 140, 140);
  doc.text(`${configuredCount} of ${completeness.length} sections configured`, margin, y);
  y += 10;

  // Effort Drivers
  y = drawSectionTitle(doc, y, 'Effort Drivers');

  const driversTableBody = EFFORT_AREAS.map((area) => [
    area.name,
    area.driver,
  ]);

  autoTable(doc, {
    startY: y,
    head: [['Area', 'Potential Effort Driver']],
    body: driversTableBody,
    theme: 'plain',
    styles: {
      fontSize: 7.5,
      cellPadding: 2.5,
      lineColor: [240, 240, 240],
      lineWidth: 0.3,
    },
    headStyles: {
      fillColor: [248, 248, 248],
      textColor: [80, 80, 80],
      fontStyle: 'bold',
      halign: 'left',
    },
    columnStyles: {
      0: { cellWidth: 30, fontStyle: 'bold' },
      1: { cellWidth: 'auto' },
    },
    margin: { left: margin, right: margin },
  });

  // ── Footer on all pages ───────────────────────────────────────────────────
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setDrawColor(230, 230, 230);
    doc.setLineWidth(0.3);
    doc.line(margin, 285, pageW - margin, 285);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(160, 160, 160);
    doc.text('Generated by B&R Engineering Estimation Tool', margin, 289);
    if (projectId) {
      doc.text(`Project: ${projectId}`, pageW / 2, 289, { align: 'center' });
    } else {
      doc.text(`Page ${i} of ${totalPages}`, pageW / 2, 289, { align: 'center' });
    }
    doc.text(`${new Date().toLocaleDateString('en-US')}`, pageW - margin, 289, { align: 'right' });
  }

  // ── Return ArrayBuffer (server-side: no blob URL / anchor click) ──────────
  return doc.output('arraybuffer');
}

// ===== POST Handler =====

export async function POST(request: NextRequest) {
  try {
    const body: ProjectConfig = await request.json();
    const projectId = request.nextUrl.searchParams.get('projectId');

    const buffer = generatePdfBuffer(body, projectId);

    const fileName = `br-estimate-${(body.project.name || 'untitled').replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase()}.pdf`;

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Content-Length': String(buffer.byteLength),
      },
    });
  } catch (error) {
    console.error('[PDF Export] Error generating PDF file:', error);
    return NextResponse.json(
      { error: 'Failed to generate PDF file' },
      { status: 500 },
    );
  }
}
