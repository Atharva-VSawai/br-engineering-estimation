import type {
  Project,
  BRProduct,
  EngineeringActivity,
  ProjectConfig,
  CommunicationProtocol,
  AdditionalFeature,
} from '@/types';

// ===== Machine Types =====
export const MACHINE_TYPES = [
  'Packaging',
  'Assembly',
  'Inspection',
  'Material Handling',
  'Printing',
  'Food & Beverage',
  'Pharmaceutical',
  'Automotive',
  'General Automation',
  'Other',
] as const;

// ===== Industries =====
export const INDUSTRIES = [
  'Food & Beverage',
  'Pharmaceutical',
  'Automotive',
  'Consumer Goods',
  'Electronics',
  'Packaging',
  'Chemical',
  'Energy',
  'Logistics',
  'Other',
] as const;

// ===== Controller Families =====
export const CONTROLLER_FAMILIES = [
  'X20',
  'X90',
  'Power Panel',
  'Industrial PC / PC-based Control',
  'Other',
] as const;

// ===== HMI Types =====
export const HMI_TYPES = [
  'Automation Panel',
  'Power Panel',
  'Mobile Panel',
  'Panel PC',
  'Industrial PC Visualization',
  'Web Visualization',
  'Other',
] as const;

// ===== Safety Controllers =====
export const SAFETY_CONTROLLERS = [
  'X20 Safety',
  'X67 Safety',
  'X90 Safety',
  'ACOPOS Safety',
  'Other',
] as const;

// ===== Robot Types =====
export const ROBOT_TYPES = [
  'Delta',
  'SCARA',
  '6-Axis',
  'Open Robot Mechanics',
  'Other',
] as const;

// ===== IPC Models =====
export const IPC_MODELS = [
  'Automation PC 910',
  'Automation PC 2100',
  'Automation PC 2200',
  'Automation PC 2300',
  'Automation PC 3100',
  'Automation PC 3200',
  'Automation PC 4100',
  'Automation PC 50A',
  'Panel PC',
  'Other',
] as const;

// ===== Communication Protocols =====
export const COMMUNICATION_PROTOCOLS = [
  'POWERLINK',
  'Ethernet',
  'OPC UA',
  'CAN',
  'IO-Link',
  'PROFIBUS',
  'PROFINET',
  'EtherNet/IP',
  'Modbus TCP',
  'Other',
] as const;

// ===== B&R Products =====
export const BR_PRODUCTS: BRProduct[] = [
  // Industrial PCs
  { name: 'Automation PC 910', category: 'Industrial PCs', description: 'Compact industrial PC for basic automation tasks', engineeringRole: 'Lightweight control and HMI', usedInProject: false },
  { name: 'Automation PC 2100', category: 'Industrial PCs', description: 'Entry-level industrial PC with scalable performance', engineeringRole: 'Basic machine control, data logging', usedInProject: false },
  { name: 'Automation PC 2200', category: 'Industrial PCs', description: 'Industrial PC with integrated display interface', engineeringRole: 'Visualisation and control', usedInProject: false },
  { name: 'Automation PC 2300', category: 'Industrial PCs', description: 'Industrial PC with multi-core processor', engineeringRole: 'Complex machine control, vision processing', usedInProject: false },
  { name: 'Automation PC 3100', category: 'Industrial PCs', description: 'High-performance industrial PC', engineeringRole: 'High-end automation, robotics, vision', usedInProject: false },
  { name: 'Automation PC 3200', category: 'Industrial PCs', description: 'Premium industrial PC with maximum performance', engineeringRole: 'Demanding applications, AI/ML at edge', usedInProject: false },
  { name: 'Automation PC 4100', category: 'Industrial PCs', description: 'Rack-mounted industrial PC for control cabinet', engineeringRole: 'Central control, SCADA server', usedInProject: false },
  { name: 'Automation PC 50A', category: 'Industrial PCs', description: 'Fanless industrial PC with highest computing power', engineeringRole: 'High-performance computing, digital twin', usedInProject: false },
  // HMI
  { name: 'Automation Panel', category: 'HMI', description: 'Multipurpose HMI panel with touch screen', engineeringRole: 'Operator interface, machine visualization', usedInProject: false },
  { name: 'Power Panel', category: 'HMI', description: 'HMI panel with integrated controller', engineeringRole: 'Combined control and visualization', usedInProject: false },
  { name: 'Mobile Panel', category: 'HMI', description: 'Wireless handheld HMI panel', engineeringRole: 'Mobile operation, maintenance', usedInProject: false },
  // PLC Systems
  { name: 'X20 System', category: 'PLC Systems', description: 'Modular control system for industrial automation', engineeringRole: 'Standard machine control', usedInProject: false },
  { name: 'X90 System', category: 'PLC Systems', description: 'Compact control system for distributed automation', engineeringRole: 'Compact machine control', usedInProject: false },
  // I/O Systems
  { name: 'X20 I/O', category: 'I/O Systems', description: 'Modular I/O system with digital, analog and special modules', engineeringRole: 'Signal acquisition and actuation', usedInProject: false },
  { name: 'X67 I/O', category: 'I/O Systems', description: 'IP67 protected I/O modules for field use', engineeringRole: 'Harsh environment I/O', usedInProject: false },
  { name: 'XV I/O', category: 'I/O Systems', description: 'Valve terminal I/O system', engineeringRole: 'Pneumatic valve control', usedInProject: false },
  // Vision Systems
  { name: 'CX Series', category: 'Vision Systems', description: 'Smart camera series for industrial inspection', engineeringRole: 'Quality inspection, part verification', usedInProject: false },
  // Safety Technology
  { name: 'X20 SafeIO', category: 'Safety Technology', description: 'Safety I/O modules for X20 system', engineeringRole: 'Safety signal processing', usedInProject: false },
  { name: 'SafeDESIGNER', category: 'Safety Technology', description: 'Safety configuration software', engineeringRole: 'Safety program development', usedInProject: false },
  // Motion Control
  { name: 'ACOPOSmicro', category: 'Motion Control', description: 'Compact servo drive for simple motion tasks', engineeringRole: 'Basic positioning, conveyor control', usedInProject: false },
  { name: 'ACOPOS X', category: 'Motion Control', description: 'Multi-axis servo drive system', engineeringRole: 'Multi-axis coordinated motion', usedInProject: false },
  { name: 'ACOPOS M4', category: 'Motion Control', description: '4-axis servo drive with integrated safety', engineeringRole: 'Compact multi-axis applications', usedInProject: false },
  { name: 'ACOPOS', category: 'Motion Control', description: 'Standard servo drive for industrial applications', engineeringRole: 'General servo motion', usedInProject: false },
  { name: 'ACOPOS P3', category: 'Motion Control', description: '3-phase servo drive for high-dynamic applications', engineeringRole: 'High-performance motion', usedInProject: false },
  { name: 'ACOPOSmulti', category: 'Motion Control', description: 'Multi-axis drive system in compact housing', engineeringRole: 'Space-saving multi-axis', usedInProject: false },
  { name: 'ACOPOSremote', category: 'Motion Control', description: 'Decentralized servo drive for field installation', engineeringRole: 'Distributed drive applications', usedInProject: false },
  { name: 'ACOPOSmotor', category: 'Motion Control', description: 'B&R servo motor portfolio', engineeringRole: 'Servo actuation', usedInProject: false },
  { name: 'VFD', category: 'Motion Control', description: 'Variable frequency drives for standard motors', engineeringRole: 'Fan, pump, conveyor control', usedInProject: false },
  // Mechatronic Systems
  { name: 'ACOPOStrak', category: 'Mechatronic Systems', description: 'Linear motor transport system with shuttles', engineeringRole: 'Product transport, flexible routing', usedInProject: false },
  { name: 'ACOPOS 6D', category: 'Mechatronic Systems', description: 'Planar levitation-based transport system', engineeringRole: 'Planar product handling, assembly', usedInProject: false },
  { name: 'SuperTrak', category: 'Mechatronic Systems', description: 'High-speed linear transport system', engineeringRole: 'High-speed product transport', usedInProject: false },
  // Robotics
  { name: 'Codian Delta', category: 'Robotics', description: 'Delta robot for high-speed pick and place', engineeringRole: 'High-speed picking, packaging', usedInProject: false },
  { name: 'Codian SCARA', category: 'Robotics', description: 'SCARA robot for assembly and handling', engineeringRole: 'Assembly, material handling', usedInProject: false },
  { name: 'Codian 6-Axis', category: 'Robotics', description: '6-axis industrial robot', engineeringRole: 'Complex manipulation, welding', usedInProject: false },
  { name: 'Open Robot Mechanics', category: 'Robotics', description: 'Robot mechanics for custom robot integration', engineeringRole: 'Custom automation solutions', usedInProject: false },
  // Network & Fieldbus
  { name: 'POWERLINK', category: 'Network & Fieldbus', description: 'Real-time Ethernet protocol', engineeringRole: 'Deterministic communication', usedInProject: false },
  { name: 'OPC UA', category: 'Network & Fieldbus', description: 'Open platform communication unified architecture', engineeringRole: 'Standardized data exchange', usedInProject: false },
  { name: 'IO-Link', category: 'Network & Fieldbus', description: 'Point-to-point communication for sensors', engineeringRole: 'Smart sensor integration', usedInProject: false },
  // Industrial IoT
  { name: 'IIoT Connector', category: 'Industrial IoT', description: 'Edge connectivity for cloud integration', engineeringRole: 'Cloud data transfer', usedInProject: false },
  { name: 'IIoT Services', category: 'Industrial IoT', description: 'Cloud-based IIoT services', engineeringRole: 'Remote monitoring, analytics', usedInProject: false },
  // Software
  { name: 'Automation Studio', category: 'Software', description: 'Integrated development environment for B&R automation', engineeringRole: 'PLC programming, configuration', usedInProject: false },
  { name: 'Automation Runtime', category: 'Software', description: 'Real-time operating system for B&R controllers', engineeringRole: 'Controller runtime environment', usedInProject: false },
  { name: 'mapp Technology', category: 'Software', description: 'Pre-engineered software components for automation', engineeringRole: 'Rapid application development', usedInProject: false },
  { name: 'Modeling and Simulation', category: 'Software', description: 'Machine simulation and modeling tools', engineeringRole: 'Virtual commissioning', usedInProject: false },
  { name: 'Remote Maintenance', category: 'Software', description: 'Remote access and maintenance tools', engineeringRole: 'Service and support', usedInProject: false },
  // Process Control
  { name: 'APROL', category: 'Process Control', description: 'Process control system for continuous and batch processes', engineeringRole: 'Process automation', usedInProject: false },
  // Accessories
  { name: 'Cables & Connectors', category: 'Accessories', description: 'Industrial-grade cables and connectors', engineeringRole: 'System wiring', usedInProject: false },
  { name: 'Power Supplies', category: 'Accessories', description: 'DIN-rail and panel-mount power supplies', engineeringRole: 'System power distribution', usedInProject: false },
  { name: 'Enclosures', category: 'Accessories', description: 'Industrial enclosures and mounting hardware', engineeringRole: 'Physical installation', usedInProject: false },
];

export const PRODUCT_CATEGORIES = [
  'Industrial PCs',
  'HMI',
  'PLC Systems',
  'I/O Systems',
  'Vision Systems',
  'Safety Technology',
  'Motion Control',
  'Mechatronic Systems',
  'Robotics',
  'Mobile Automation',
  'Network & Fieldbus',
  'Industrial IoT',
  'Software',
  'Process Control',
  'Accessories',
] as const;

// ===== Engineering Activities =====
export const ENGINEERING_ACTIVITIES: EngineeringActivity[] = [
  { technology: 'Motion', configuration: true, programming: true, integration: true, testing: true, commissioning: true, potentialComplexity: 'High', estimatedHours: 24 },
  { technology: 'HMI', configuration: true, programming: true, integration: true, testing: true, commissioning: true, potentialComplexity: 'Medium', estimatedHours: 16 },
  { technology: 'Vision', configuration: true, programming: true, integration: true, testing: true, commissioning: true, potentialComplexity: 'High', estimatedHours: 20 },
  { technology: 'Safety', configuration: true, programming: true, integration: true, testing: true, commissioning: true, potentialComplexity: 'Very High', estimatedHours: 32 },
  { technology: 'I/O', configuration: true, programming: true, integration: true, testing: true, commissioning: false, potentialComplexity: 'Low', estimatedHours: 4 },
  { technology: 'Communication', configuration: true, programming: true, integration: true, testing: true, commissioning: true, potentialComplexity: 'Medium', estimatedHours: 12 },
  { technology: 'Mechatronics', configuration: true, programming: true, integration: true, testing: true, commissioning: true, potentialComplexity: 'High', estimatedHours: 24 },
  { technology: 'Robotics', configuration: true, programming: true, integration: true, testing: true, commissioning: true, potentialComplexity: 'High', estimatedHours: 20 },
  { technology: 'IIoT', configuration: true, programming: true, integration: true, testing: true, commissioning: true, potentialComplexity: 'Medium', estimatedHours: 12 },
  { technology: 'PLC Logic', configuration: true, programming: true, integration: true, testing: true, commissioning: true, potentialComplexity: 'Medium', estimatedHours: 16 },
  { technology: 'Alarm Mgmt', configuration: true, programming: true, integration: false, testing: true, commissioning: false, potentialComplexity: 'Low', estimatedHours: 3 },
  { technology: 'Recipe Mgmt', configuration: true, programming: true, integration: false, testing: true, commissioning: false, potentialComplexity: 'Low', estimatedHours: 3 },
  { technology: 'Data Logging', configuration: true, programming: true, integration: true, testing: true, commissioning: false, potentialComplexity: 'Low', estimatedHours: 2 },
];

// ===== Additional Features List =====
export const ADDITIONAL_FEATURE_OPTIONS = [
  'Recipe Management',
  'Alarm Management',
  'Machine Sequencing',
  'State Machine',
  'Diagnostics',
  'Data Logging',
  'Remote Maintenance',
  'Simulation',
  'Digital Twin / Modeling',
  'Energy Monitoring',
  'Predictive Maintenance',
  'MES Integration',
  'SCADA Integration',
  'ERP Integration',
  'Barcode Integration',
  'RFID',
  'External Device Integration',
] as const;

// ===== Wizard Step Labels =====
export const WIZARD_STEPS = [
  'Project',
  'Controller',
  'I/O',
  'Motion',
  'HMI',
  'Vision',
  'Safety',
  'Communication',
  'Mechatronics',
  'Robotics',
  'Industrial PC / IIoT',
  'Additional Features',
  'Complexity',
  'Review',
] as const;

// ===== Sample Projects =====
export const SAMPLE_PROJECTS: Project[] = [
  {
    id: 'BR-2026-001',
    name: 'Packaging Line A',
    customer: 'Customer A',
    machineType: 'Packaging',
    industry: 'Consumer Goods',
    description: 'High-speed packaging line with vision inspection and ACOPOStrak transport',
    requirementClarity: 'Mostly Clear',
    customerInvolvement: 'Medium',
    projectVariants: 3,
    machineStations: 4,
    status: 'Draft',
    complexity: 'High',
    createdAt: '2025-12-15',
    updatedAt: '2026-01-10',
  },
  {
    id: 'BR-2026-002',
    name: 'Automated Assembly Cell',
    customer: 'Customer B',
    machineType: 'Assembly',
    industry: 'Automotive',
    description: 'Multi-robot assembly cell with SCARA and 6-axis robots',
    requirementClarity: 'Clear',
    customerInvolvement: 'High',
    projectVariants: 2,
    machineStations: 6,
    status: 'In Review',
    complexity: 'Very High',
    createdAt: '2025-11-20',
    updatedAt: '2026-01-08',
  },
  {
    id: 'BR-2026-003',
    name: 'Bottle Inspection Machine',
    customer: 'Customer C',
    machineType: 'Inspection',
    industry: 'Pharmaceutical',
    description: 'Automated bottle inspection with multiple camera systems',
    requirementClarity: 'Clear',
    customerInvolvement: 'Medium',
    projectVariants: 1,
    machineStations: 3,
    status: 'Completed',
    complexity: 'Medium',
    createdAt: '2025-09-10',
    updatedAt: '2025-12-20',
  },
  {
    id: 'BR-2026-004',
    name: 'Servo Press Machine',
    customer: 'Customer D',
    machineType: 'General Automation',
    industry: 'Automotive',
    description: 'Precision servo press with complex motion profiles and force control',
    requirementClarity: 'Mostly Clear',
    customerInvolvement: 'Low',
    projectVariants: 2,
    machineStations: 2,
    status: 'Completed',
    complexity: 'High',
    createdAt: '2025-08-01',
    updatedAt: '2025-11-15',
  },
  {
    id: 'BR-2026-005',
    name: 'ACOPOStrak Transport System',
    customer: 'Customer E',
    machineType: 'Material Handling',
    industry: 'Food & Beverage',
    description: 'Flexible transport system with 12 movers and vision-guided routing',
    requirementClarity: 'Partially Clear',
    customerInvolvement: 'Medium',
    projectVariants: 4,
    machineStations: 8,
    status: 'Draft',
    complexity: 'Very High',
    createdAt: '2026-01-05',
    updatedAt: '2026-01-12',
  },
];

// ===== Default Protocols =====
export const DEFAULT_PROTOCOLS: CommunicationProtocol[] = COMMUNICATION_PROTOCOLS.map((name) => ({
  name,
  enabled: false,
  devices: 0,
}));

// ===== Default Additional Features =====
export const DEFAULT_ADDITIONAL_FEATURES: AdditionalFeature[] = ADDITIONAL_FEATURE_OPTIONS.map((name) => ({
  name,
  enabled: false,
  complexity: 'Basic' as const,
}));

// ===== Sample Project Configuration =====
export const SAMPLE_CONFIG: ProjectConfig = {
  project: {
    name: 'Automated Packaging Machine',
    customer: 'Customer A',
    machineType: 'Packaging',
    industry: 'Consumer Goods',
    description: 'High-speed automated packaging machine with ACOPOStrak transport, vision inspection, and delta robot pick-and-place. Multiple product variants with recipe management.',
    requirementClarity: 'Mostly Clear',
    customerInvolvement: 'Medium',
    projectVariants: 3,
    machineStations: 4,
    complexity: 'High',
  },
  controller: {
    family: 'X20',
    quantity: 1,
    performance: 'High Performance',
    communicationInterfaces: 'POWERLINK, Ethernet, OPC UA',
    redundancyRequired: false,
    simulationRequired: true,
    diagnosticsRequired: true,
  },
  io: {
    digitalInputs: 64,
    digitalOutputs: 48,
    analogInputs: 8,
    analogOutputs: 4,
    safetyIO: 12,
    encoderCounterModules: 3,
    temperatureModules: 2,
    communicationIO: 4,
    specialModules: 3,
  },
  motion: {
    totalAxes: 8,
    linearAxes: 5,
    rotaryAxes: 3,
    servoDrives: 8,
    servoMotors: 8,
    homingRequired: true,
    positioning: true,
    velocityControl: true,
    torqueControl: false,
    synchronization: true,
    masterSlave: true,
    electronicGearing: true,
    electronicCamming: false,
    coordinatedMotion: true,
    interpolation: false,
    complexMotionProfiles: true,
    axisDiagnostics: true,
  },
  hmi: {
    type: 'Automation Panel',
    screens: 15,
    screenComplexity: 'Moderate',
    alarmManagement: true,
    recipeManagement: true,
    trendVisualization: true,
    userManagement: true,
    machineDiagnostics: true,
    manualMode: true,
    automaticMode: true,
    maintenanceScreens: true,
    parameterManagement: true,
  },
  vision: {
    enabled: true,
    cameras: 2,
    lightingSystems: 2,
    inspection: true,
    measurement: false,
    detection: true,
    identification: true,
    ocr: false,
    barcodeQR: true,
    patternMatching: true,
    positionDetection: true,
    qualityControl: true,
    triggering: 'External Trigger',
    plcIntegration: true,
    motionVisionSync: true,
  },
  safety: {
    enabled: true,
    controller: 'X20 Safety',
    safetyIOCount: 12,
    emergencyStops: 6,
    safetyDoors: 4,
    lightCurtains: 2,
    safeMotion: true,
    safetyFunctions: true,
    validationRequired: true,
    testingRequired: true,
    documentationRequired: true,
  },
  communication: {
    protocols: DEFAULT_PROTOCOLS.map((p) => ({
      ...p,
      enabled: p.name === 'POWERLINK' || p.name === 'OPC UA',
      devices: p.name === 'POWERLINK' ? 8 : p.name === 'OPC UA' ? 2 : 0,
    })),
    plcToPlc: false,
    mesIntegration: true,
    scadaIntegration: false,
    cloudIIoTIntegration: true,
  },
  mechatronics: {
    type: 'ACOPOStrak',
    movers: 8,
    processingStations: 4,
    moverRouting: true,
    independentMoverControl: true,
    synchronization: true,
    transportSequences: true,
    productHandling: true,
    visionIntegration: true,
    hmiIntegration: true,
    safetyIntegration: true,
    diagnostics: true,
  },
  robotics: {
    enabled: true,
    robotType: 'Delta',
    quantity: 1,
    motionIntegration: true,
    visionIntegration: true,
    pickAndPlace: true,
    trajectoryProgramming: true,
    synchronization: true,
    simulation: true,
    safety: true,
    robotDiagnostics: true,
  },
  iiot: {
    ipcRequired: true,
    ipcModel: 'Automation PC 3100',
    iiotRequired: true,
    iiotConnector: true,
    iiotServices: true,
    iiotEdgeDevice: false,
    cloudConnectivity: true,
    machineDataCollection: true,
    remoteMaintenance: true,
    opcUa: true,
    dataLogging: true,
    analyticsIntegration: true,
  },
  additionalFeatures: DEFAULT_ADDITIONAL_FEATURES.map((f) => {
    if (['Recipe Management', 'Alarm Management', 'Diagnostics', 'Data Logging', 'Simulation', 'MES Integration'].includes(f.name)) {
      return { ...f, enabled: true, complexity: 'Moderate' as const };
    }
    return f;
  }),
  complexity: {
    hardware: 'High',
    motion: 'High',
    hmi: 'Medium',
    vision: 'Medium',
    safety: 'High',
    communication: 'Medium',
    software: 'High',
    integration: 'High',
    requirement: 'Medium',
    testing: 'High',
    requirementClarity: 'Mostly Clear',
    customerChangeFrequency: 'Medium',
    productVariants: 3,
    machineStations: 4,
    reuseLevel: 'Medium',
  },
};

// ===== Effort Areas for Summary =====
export const EFFORT_AREAS = [
  { name: 'Motion', driver: 'Number of axes, synchronization requirements' },
  { name: 'HMI', driver: 'Number of screens, complexity level' },
  { name: 'I/O', driver: 'Total I/O count, special modules' },
  { name: 'Vision', driver: 'Number of cameras, inspection functions' },
  { name: 'Safety', driver: 'Safety functions, validation requirements' },
  { name: 'Communication', driver: 'Number of protocols, external integrations' },
  { name: 'Software', driver: 'Additional features, state machines' },
  { name: 'Integration', driver: 'Mechatronics, robotics, IIoT integration' },
  { name: 'Testing', driver: 'Safety validation, commissioning scope' },
  { name: 'Commissioning', driver: 'System complexity, customer involvement' },
] as const;
