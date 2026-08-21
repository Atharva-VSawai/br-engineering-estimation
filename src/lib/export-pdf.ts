import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { ProjectConfig, ComplexityLevel } from '@/types';
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
  Low: [16, 185, 129],       // emerald
  Medium: [245, 158, 11],    // amber
  High: [249, 115, 22],      // orange
  'Very High': [239, 68, 68], // red
};

// Professional palette for charts
const CHART_COLORS: [number, number, number][] = [
  [59, 130, 246],   // blue
  [139, 92, 246],   // purple
  [249, 115, 22],   // orange
  [239, 68, 68],    // red
  [16, 185, 129],   // emerald
  [245, 158, 11],   // amber
  [236, 72, 153],   // pink
  [14, 165, 233],   // sky
  [168, 85, 247],   // violet
  [34, 197, 94],    // green
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

function getOverallComplexity(config: ProjectConfig): ComplexityLevel {
  const dims = DIMENSIONS.map((d) => config.complexity[d.key]);
  const highCount = dims.filter((x) => x === 'High' || x === 'Very High').length;
  if (highCount >= 5) return 'Very High';
  if (highCount >= 3) return 'High';
  if (highCount >= 1) return 'Medium';
  return 'Low';
}

function calcEffort(config: ProjectConfig) {
  const c = config;
  const hwHours = (c.io.digitalInputs + c.io.digitalOutputs + c.io.analogInputs + c.io.analogOutputs) * 0.5 + c.motion.totalAxes * 4;
  const swHours = c.hmi.screens * 8 + (c.vision.enabled ? c.vision.cameras * 16 : 0) + 40;
  const motionHours = c.motion.totalAxes * 6 + (c.motion.electronicCamming ? 20 : 0) + (c.motion.coordinatedMotion ? 16 : 0);
  const safetyHours = c.safety.enabled ? c.safety.safetyIOCount * 2 + 16 : 0;
  const integrationHours = (hwHours + swHours + motionHours + safetyHours) * 0.3;
  const totalHours = hwHours + swHours + motionHours + safetyHours + integrationHours;
  return { hwHours, swHours, motionHours, safetyHours, integrationHours, totalHours };
}

function calcTimeline(config: ProjectConfig) {
  const eff = calcEffort(config);
  const hwDesignWeeks = 2;
  const swDevWeeks = Math.max(2, Math.ceil(config.hmi.screens / 3));
  const integrationWeeks = Math.max(2, Math.ceil(eff.totalHours / 40));
  const complexityMap: Record<string, number> = { Low: 1, Medium: 2, High: 3, 'Very High': 4 };
  const overall = getOverallComplexity(config);
  const commissionWeeks = complexityMap[overall] || 2;
  const totalWeeks = hwDesignWeeks + swDevWeeks + integrationWeeks + commissionWeeks;
  return [
    { phase: 'Hardware Design', weeks: hwDesignWeeks },
    { phase: 'Software Development', weeks: swDevWeeks },
    { phase: 'Integration & Testing', weeks: integrationWeeks },
    { phase: 'Commissioning', weeks: commissionWeeks },
  ];
}

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

// ── Section header helper ────────────────────────────────────────────────────

function drawSectionTitle(doc: jsPDF, y: number, title: string): number {
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...BR_ORANGE);
  doc.text(title.toUpperCase(), 15, y);
  // underline
  doc.setDrawColor(...BR_ORANGE);
  doc.setLineWidth(0.5);
  doc.line(15, y + 1.5, 195, y + 1.5);
  doc.setDrawColor(0, 0, 0);
  return y + 7;
}

// ── Radar Chart ───────────────────────────────────────────────────────────────

function drawPolygonStroke(doc: jsPDF, pts: [number, number][]): void {
  if (pts.length < 2) return;
  doc.beginPath();
  doc.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) {
    doc.lineTo(pts[i][0], pts[i][1]);
  }
  doc.closePath();
  doc.stroke();
}

function drawPolygonFill(doc: jsPDF, pts: [number, number][]): void {
  if (pts.length < 2) return;
  doc.beginPath();
  doc.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) {
    doc.lineTo(pts[i][0], pts[i][1]);
  }
  doc.closePath();
  doc.fill();
}

function drawPolygonFillStroke(doc: jsPDF, pts: [number, number][]): void {
  if (pts.length < 2) return;
  doc.beginPath();
  doc.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) {
    doc.lineTo(pts[i][0], pts[i][1]);
  }
  doc.closePath();
  doc.fill();
  doc.stroke();
}

function drawRadarChart(doc: jsPDF, cx: number, cy: number, maxR: number, config: ProjectConfig): void {
  const n = DIMENSIONS.length;
  const angleStep = (2 * Math.PI) / n;

  // Draw concentric rings (25%, 50%, 75%, 100%)
  for (const ring of [0.25, 0.5, 0.75, 1.0]) {
    const r = ring * maxR;
    const pts: [number, number][] = [];
    for (let i = 0; i < n; i++) {
      const angle = i * angleStep - Math.PI / 2;
      pts.push([cx + r * Math.cos(angle), cy + r * Math.sin(angle)]);
    }
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.3);
    drawPolygonStroke(doc, pts);
  }

  // Draw axis lines
  for (let i = 0; i < n; i++) {
    const angle = i * angleStep - Math.PI / 2;
    const px = cx + maxR * Math.cos(angle);
    const py = cy + maxR * Math.sin(angle);
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.3);
    doc.line(cx, cy, px, py);
  }

  // Draw data polygon
  const dataPts: [number, number][] = [];
  for (let i = 0; i < n; i++) {
    const dim = DIMENSIONS[i];
    const val = COMPLEXITY_VALUE[config.complexity[dim.key]] || 0.25;
    const r = val * maxR;
    const angle = i * angleStep - Math.PI / 2;
    dataPts.push([cx + r * Math.cos(angle), cy + r * Math.sin(angle)]);
  }

  // Filled polygon with semi-transparent orange
  doc.setFillColor(199, 91, 18);
  doc.setGState(new (doc as any).GState({ opacity: 0.2 }));
  drawPolygonFill(doc, dataPts);
  doc.setGState(new (doc as any).GState({ opacity: 1 }));
  // Stroke polygon
  doc.setDrawColor(...BR_ORANGE);
  doc.setLineWidth(1.2);
  drawPolygonStroke(doc, dataPts);

  // Labels
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(80, 80, 80);
  for (let i = 0; i < n; i++) {
    const angle = i * angleStep - Math.PI / 2;
    const lx = cx + (maxR + 5) * Math.cos(angle);
    const ly = cy + (maxR + 5) * Math.sin(angle);
    const label = DIMENSIONS[i].label;
    if (Math.abs(Math.cos(angle)) < 0.15) {
      doc.text(label, lx, ly, { align: 'center', baseline: 'middle' });
    } else if (Math.cos(angle) > 0) {
      doc.text(label, lx, ly, { align: 'left', baseline: 'middle' });
    } else {
      doc.text(label, lx, ly, { align: 'right', baseline: 'middle' });
    }
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
  const labelWidth = 38;
  const barStartX = x + labelWidth + 4;
  const barMaxWidth = width - labelWidth - 30;
  const maxVal = Math.max(...items.map((it) => it.max), 1);

  let curY = y;

  for (const item of items) {
    // Label
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(50, 50, 50);
    doc.text(item.label, x, curY + barHeight / 2 + 1, { align: 'right', baseline: 'middle' });

    // Bar
    const barW = Math.max((item.value / maxVal) * barMaxWidth, 2);
    doc.setFillColor(...item.color);
    doc.roundedRect(barStartX, curY, barW, barHeight, 1.5, 1.5, 'F');

    // Value label
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(50, 50, 50);
    const vLabel = item.valueLabel ?? `${item.value.toFixed(1)}h`;
    doc.text(vLabel, barStartX + barW + 3, curY + barHeight / 2 + 1, { align: 'left', baseline: 'middle' });

    curY += barHeight + gap;
  }

  // Optional total row
  if (showTotal) {
    // Separator line
    curY -= gap / 2;
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.3);
    doc.line(barStartX, curY, barStartX + barMaxWidth, curY);
    curY += gap / 2;

    // Label
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(...BR_ORANGE);
    doc.text(showTotal.label, x, curY + barHeight / 2 + 1, { align: 'right', baseline: 'middle' });

    // Bar
    const barW = Math.max((showTotal.value / maxVal) * barMaxWidth, 2);
    doc.setFillColor(...showTotal.color);
    doc.roundedRect(barStartX, curY, barW, barHeight, 1.5, 1.5, 'F');

    // Value
    doc.text(`${showTotal.value.toFixed(1)}h`, barStartX + barW + 3, curY + barHeight / 2 + 1, { align: 'left', baseline: 'middle' });
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
  const labelWidth = 40;
  const barStartX = x + labelWidth + 4;
  const barMaxWidth = width - labelWidth - 28;
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

    // Label
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(50, 50, 50);
    doc.text(p.phase, x, curY + barHeight / 2 + 1, { align: 'right', baseline: 'middle' });

    // Dot
    doc.setFillColor(...color);
    doc.circle(barStartX - 2, curY + barHeight / 2, 1.5, 'F');

    // Bar
    const barW = Math.max((p.weeks / totalWeeks) * barMaxWidth, 6);
    doc.setFillColor(color[0], color[1], color[2]);
    doc.setGState(new (doc as any).GState({ opacity: 0.85 }));
    doc.roundedRect(barStartX, curY, barW, barHeight, 1.5, 1.5, 'F');
    doc.setGState(new (doc as any).GState({ opacity: 1 }));

    // Value
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(100, 100, 100);
    const weekLabel = `${p.weeks} week${p.weeks !== 1 ? 's' : ''}`;
    doc.text(weekLabel, barStartX + barW + 3, curY + barHeight / 2 + 1, { align: 'left', baseline: 'middle' });

    curY += barHeight + gap;
  }

  return curY;
}

// ── Complexity Profile Bars ───────────────────────────────────────────────────

function drawComplexityProfile(
  doc: jsPDF,
  x: number,
  y: number,
  width: number,
  barHeight: number,
  gap: number,
  config: ProjectConfig,
): number {
  const labelWidth = 30;
  const barStartX = x + labelWidth + 4;
  const barMaxWidth = width - labelWidth - 25;

  let curY = y;

  for (const dim of DIMENSIONS) {
    const level = config.complexity[dim.key];
    const val = COMPLEXITY_VALUE[level] || 0.25;
    const color = COMPLEXITY_BAR_COLOR[level] || [150, 150, 150];

    // Label
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(50, 50, 50);
    doc.text(dim.label, x, curY + barHeight / 2 + 1, { align: 'right', baseline: 'middle' });

    // Bar
    const barW = Math.max(val * barMaxWidth, 2);
    doc.setFillColor(color[0], color[1], color[2]);
    doc.setGState(new (doc as any).GState({ opacity: 0.85 }));
    doc.roundedRect(barStartX, curY, barW, barHeight, 1.5, 1.5, 'F');
    doc.setGState(new (doc as any).GState({ opacity: 1 }));

    // Level label
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(50, 50, 50);
    doc.text(level, barStartX + barW + 3, curY + barHeight / 2 + 1, { align: 'left', baseline: 'middle' });

    curY += barHeight + gap;
  }

  return curY;
}

// ── Risk Assessment Cards ─────────────────────────────────────────────────────

function drawRiskAssessment(doc: jsPDF, y: number, config: ProjectConfig, highCount: number): number {
  const clarity = config.project.requirementClarity || 'Mostly Clear';
  const involvement = config.project.customerInvolvement || 'Medium';

  const clarityColorMap: Record<string, [number, number, number]> = {
    Clear: [16, 185, 129],
    'Mostly Clear': [245, 158, 11],
    'Partially Clear': [249, 115, 22],
    Unclear: [239, 68, 68],
  };
  const involvementColorMap: Record<string, [number, number, number]> = {
    Low: [239, 68, 68],
    Medium: [245, 158, 11],
    High: [16, 185, 129],
  };
  const scopeColor: [number, number, number] =
    highCount >= 5 ? [239, 68, 68] : highCount >= 3 ? [249, 115, 22] : highCount >= 1 ? [245, 158, 11] : [16, 185, 129];

  const cardW = 55;
  const cardH = 22;
  const gap = 5;
  const startX = 15;

  const cards = [
    { label: 'Requirement Clarity', value: clarity, color: clarityColorMap[clarity] || [150, 150, 150] },
    { label: 'Customer Involvement', value: involvement, color: involvementColorMap[involvement] || [150, 150, 150] },
    { label: 'Scope Complexity', value: `${highCount} / 10 dimensions`, color: scopeColor },
  ];

  for (let i = 0; i < cards.length; i++) {
    const cx = startX + i * (cardW + gap);
    const card = cards[i];

    // Card background
    doc.setFillColor(248, 248, 248);
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.3);
    doc.roundedRect(cx, y, cardW, cardH, 2, 2, 'FD');

    // Label
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6);
    doc.setTextColor(130, 130, 130);
    doc.text(card.label.toUpperCase(), cx + 3, y + 6);

    // Color dot
    doc.setFillColor(...card.color);
    doc.circle(cx + 5, y + 14, 2, 'F');

    // Value
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(30, 30, 30);
    doc.text(card.value, cx + 9, y + 15.5);
  }

  return y + cardH + 4;
}

// ── Main export function ──────────────────────────────────────────────────────

export function exportPdf(config: ProjectConfig): void {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageW = 210;
  const margin = 15;
  const contentW = pageW - margin * 2;

  const overall = getOverallComplexity(config);
  const allComplexities = DIMENSIONS.map((d) => config.complexity[d.key]);
  const highCount = allComplexities.filter((x) => x === 'High' || x === 'Very High').length;
  const effort = calcEffort(config);
  const phases = calcTimeline(config);
  const totalWeeks = phases.reduce((s, p) => s + p.weeks, 0);
  const completeness = checkCompleteness(config);
  const configuredCount = completeness.filter((s) => s.configured).length;

  // Area complexities for table
  const areaComplexities: Record<string, ComplexityLevel> = {
    Motion: config.complexity.motion,
    HMI: config.complexity.hmi,
    'I/O': config.io.digitalInputs + config.io.digitalOutputs > 200 ? 'High' : 'Medium',
    Vision: config.vision.enabled ? config.complexity.vision : 'Low',
    Safety: config.safety.enabled ? config.complexity.safety : 'Low',
    Communication: config.complexity.communication,
    Software: config.complexity.software,
    Integration: config.complexity.integration,
    Testing: config.complexity.testing,
    Commissioning: config.complexity.testing,
  };

  // ══════════════════════════════════════════════════════════════════════════
  // PAGE 1: Header, Radar, Effort Breakdown
  // ══════════════════════════════════════════════════════════════════════════

  let y = 12;

  // Header - Project title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(...BR_ORANGE);
  doc.text(config.project.name || 'Untitled Project', margin, y);
  y += 8;

  // Meta info
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 100, 100);
  doc.text(
    `Customer: ${config.project.customer || 'N/A'}   |   Machine Type: ${config.project.machineType || 'N/A'}   |   Industry: ${config.project.industry || 'N/A'}`,
    margin, y,
  );
  y += 5;
  doc.text(
    `Date: ${new Date().toLocaleDateString('de-AT', { year: 'numeric', month: 'long', day: 'numeric' })}   |   Overall Complexity: ${overall}`,
    margin, y,
  );
  y += 3;

  // Orange accent line
  doc.setDrawColor(...BR_ORANGE);
  doc.setLineWidth(1);
  doc.line(margin, y, pageW - margin, y);
  y += 10;

  // ── Complexity Radar ──────────────────────────────────────────────────────
  y = drawSectionTitle(doc, y, 'Complexity Radar');
  const radarSize = 55;
  const radarCx = pageW / 2;
  const radarCy = y + radarSize + 2;
  drawRadarChart(doc, radarCx, radarCy, radarSize, config);
  y = radarCy + radarSize + 8;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(140, 140, 140);
  doc.text(`${highCount} of 10 dimensions rated High or Very High`, pageW / 2, y, { align: 'center' });
  y += 10;

  // ── Effort Breakdown ──────────────────────────────────────────────────────
  y = drawSectionTitle(doc, y, 'Effort Breakdown (Estimated Hours)');

  const effortItems = [
    { label: 'Hardware Eng.', value: effort.hwHours, max: effort.totalHours, color: CHART_COLORS[0] },
    { label: 'Software Dev.', value: effort.swHours, max: effort.totalHours, color: CHART_COLORS[1] },
    { label: 'Motion Config.', value: effort.motionHours, max: effort.totalHours, color: CHART_COLORS[2] },
    { label: 'Safety Eng.', value: effort.safetyHours, max: effort.totalHours, color: CHART_COLORS[3] },
    { label: 'Integration', value: effort.integrationHours, max: effort.totalHours, color: CHART_COLORS[4] },
  ];

  y = drawHorizontalBarChart(doc, margin, y, contentW, 6, 3, effortItems, {
    label: 'TOTAL',
    value: effort.totalHours,
    color: BR_ORANGE as unknown as [number, number, number],
  });

  // ══════════════════════════════════════════════════════════════════════════
  // PAGE 2: Timeline, Complexity Profile, Risk Assessment
  // ══════════════════════════════════════════════════════════════════════════
  doc.addPage();
  y = 15;

  // ── Timeline ──────────────────────────────────────────────────────────────
  y = drawSectionTitle(doc, y, 'Project Timeline');
  y = drawTimelineChart(doc, margin, y, contentW, 6, 3, phases, totalWeeks);
  y += 3;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...BR_ORANGE);
  doc.text(`Estimated Total: ${totalWeeks} weeks`, margin, y);
  y += 12;

  // ── Complexity Profile ────────────────────────────────────────────────────
  y = drawSectionTitle(doc, y, 'Complexity Profile');
  y = drawComplexityProfile(doc, margin, y, contentW, 5.5, 2.5, config);
  y += 10;

  // ── Risk Assessment ───────────────────────────────────────────────────────
  y = drawSectionTitle(doc, y, 'Risk Assessment');
  y = drawRiskAssessment(doc, y, config, highCount);

  // ══════════════════════════════════════════════════════════════════════════
  // PAGE 3: Engineering Areas Table, Completeness
  // ══════════════════════════════════════════════════════════════════════════
  doc.addPage();
  y = 15;

  // ── Engineering Areas Table ───────────────────────────────────────────────
  y = drawSectionTitle(doc, y, 'Engineering Areas');

  const tableData = EFFORT_AREAS.map((area) => [
    area.name,
    areaComplexities[area.name] || 'Medium',
    area.driver,
  ]);

  autoTable(doc, {
    startY: y,
    head: [['Area', 'Complexity', 'Potential Effort Driver']],
    body: tableData,
    theme: 'grid',
    styles: {
      fontSize: 7.5,
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
      0: { cellWidth: 28, fontStyle: 'bold' },
      1: { cellWidth: 22 },
      2: { cellWidth: 'auto' },
    },
    margin: { left: margin, right: margin },
  });

  // Get position after table
  const finalY = (doc as any).lastAutoTable?.finalY ?? 120;
  y = finalY + 12;

  // ── Configuration Completeness ────────────────────────────────────────────
  y = drawSectionTitle(doc, y, 'Configuration Completeness');

  const cols = 3;
  const colW = contentW / cols;
  for (let i = 0; i < completeness.length; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const cx = margin + col * colW;
    const cy = y + row * 7;

    // Check icon (circle with check or X)
    const configured = completeness[i].configured;
    if (configured) {
      doc.setFillColor(236, 253, 245);
      doc.circle(cx + 3, cy + 2.5, 2.8, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.setTextColor(5, 150, 105);
      doc.text('✓', cx + 3, cy + 3.2, { align: 'center', baseline: 'middle' });
    } else {
      doc.setFillColor(243, 244, 246);
      doc.circle(cx + 3, cy + 2.5, 2.8, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.setTextColor(156, 163, 175);
      doc.text('✗', cx + 3, cy + 3.2, { align: 'center', baseline: 'middle' });
    }

    // Label
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

  // ── Footer on all pages ───────────────────────────────────────────────────
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    // Footer line
    doc.setDrawColor(230, 230, 230);
    doc.setLineWidth(0.3);
    doc.line(margin, 285, pageW - margin, 285);
    // Footer text
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(160, 160, 160);
    doc.text('Generated by B&R Engineering Estimation Tool', margin, 289);
    doc.text(`${new Date().toLocaleDateString('de-AT')}`, pageW - margin, 289, { align: 'right' });
    // Page number
    doc.text(`Page ${i} of ${totalPages}`, pageW / 2, 289, { align: 'center' });
  }

  // ── Download ──────────────────────────────────────────────────────────────
  const filename = `br-estimate-${(config.project.name || 'untitled').replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf`;
  doc.save(filename);
}
