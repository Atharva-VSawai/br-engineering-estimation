// ===== Core Domain Types =====

export type ComplexityLevel = 'Low' | 'Medium' | 'High' | 'Very High';
export type ProjectStatus = 'Draft' | 'In Review' | 'Completed';
export type ClarityLevel = 'Clear' | 'Mostly Clear' | 'Partially Clear' | 'Unclear';
export type InvolvementLevel = 'Low' | 'Medium' | 'High';
export type ScreenComplexity = 'Basic' | 'Moderate' | 'Complex';
export type FeatureComplexity = 'Basic' | 'Moderate' | 'Complex';
export type PerformanceLevel = 'Basic' | 'Standard' | 'High Performance';
export type ReuseLevel = 'High' | 'Medium' | 'Low';
export type ChangeFrequency = 'Low' | 'Medium' | 'High';

// ===== Page Navigation =====
export type AppPage =
  | 'dashboard'
  | 'new-estimate'
  | 'projects'
  | 'product-explorer'
  | 'technical-params'
  | 'engineering-activities'
  | 'complexity'
  | 'estimate-summary'
  | 'settings';

// ===== Project =====
export interface Project {
  id: string;
  name: string;
  customer: string;
  machineType: string;
  industry: string;
  description: string;
  requirementClarity: ClarityLevel;
  customerInvolvement: InvolvementLevel;
  projectVariants: number;
  machineStations: number;
  status: ProjectStatus;
  complexity: ComplexityLevel;
  createdAt: string;
  updatedAt: string;
}

// ===== Controller =====
export interface ControllerConfig {
  family: string;
  quantity: number;
  performance: PerformanceLevel;
  communicationInterfaces: string;
  redundancyRequired: boolean;
  simulationRequired: boolean;
  diagnosticsRequired: boolean;
}

// ===== I/O =====
export interface IOConfig {
  digitalInputs: number;
  digitalOutputs: number;
  analogInputs: number;
  analogOutputs: number;
  safetyIO: number;
  encoderCounterModules: number;
  temperatureModules: number;
  communicationIO: number;
  specialModules: number;
}

// ===== Motion =====
export interface MotionConfig {
  totalAxes: number;
  linearAxes: number;
  rotaryAxes: number;
  servoDrives: number;
  servoMotors: number;
  homingRequired: boolean;
  positioning: boolean;
  velocityControl: boolean;
  torqueControl: boolean;
  synchronization: boolean;
  masterSlave: boolean;
  electronicGearing: boolean;
  electronicCamming: boolean;
  coordinatedMotion: boolean;
  interpolation: boolean;
  complexMotionProfiles: boolean;
  axisDiagnostics: boolean;
}

// ===== HMI =====
export interface HMIConfig {
  type: string;
  screens: number;
  screenComplexity: ScreenComplexity;
  alarmManagement: boolean;
  recipeManagement: boolean;
  trendVisualization: boolean;
  userManagement: boolean;
  machineDiagnostics: boolean;
  manualMode: boolean;
  automaticMode: boolean;
  maintenanceScreens: boolean;
  parameterManagement: boolean;
}

// ===== Vision =====
export interface VisionConfig {
  enabled: boolean;
  cameras: number;
  lightingSystems: number;
  inspection: boolean;
  measurement: boolean;
  detection: boolean;
  identification: boolean;
  ocr: boolean;
  barcodeQR: boolean;
  patternMatching: boolean;
  positionDetection: boolean;
  qualityControl: boolean;
  triggering: 'Continuous' | 'External Trigger' | 'Motion Synchronized' | '';
  plcIntegration: boolean;
  motionVisionSync: boolean;
}

// ===== Safety =====
export interface SafetyConfig {
  enabled: boolean;
  controller: string;
  safetyIOCount: number;
  emergencyStops: number;
  safetyDoors: number;
  lightCurtains: number;
  safeMotion: boolean;
  safetyFunctions: boolean;
  validationRequired: boolean;
  testingRequired: boolean;
  documentationRequired: boolean;
}

// ===== Communication =====
export interface CommunicationConfig {
  protocols: CommunicationProtocol[];
 plcToPlc: boolean;
  mesIntegration: boolean;
  scadaIntegration: boolean;
  cloudIIoTIntegration: boolean;
}

export interface CommunicationProtocol {
  name: string;
  enabled: boolean;
  devices: number;
}

// ===== Mechatronics =====
export interface MechatronicsConfig {
  type: 'None' | 'ACOPOStrak' | 'ACOPOS 6D' | 'SuperTrak';
  movers: number;
  processingStations: number;
  moverRouting: boolean;
  independentMoverControl: boolean;
  synchronization: boolean;
  transportSequences: boolean;
  productHandling: boolean;
  visionIntegration: boolean;
  hmiIntegration: boolean;
  safetyIntegration: boolean;
  diagnostics: boolean;
}

// ===== Robotics =====
export interface RoboticsConfig {
  enabled: boolean;
  robotType: string;
  quantity: number;
  motionIntegration: boolean;
  visionIntegration: boolean;
  pickAndPlace: boolean;
  trajectoryProgramming: boolean;
  synchronization: boolean;
  simulation: boolean;
  safety: boolean;
  robotDiagnostics: boolean;
}

// ===== IIoT =====
export interface IIoTConfig {
  ipcRequired: boolean;
  ipcModel: string;
  iiotRequired: boolean;
  iiotConnector: boolean;
  iiotServices: boolean;
  iiotEdgeDevice: boolean;
  cloudConnectivity: boolean;
  machineDataCollection: boolean;
  remoteMaintenance: boolean;
  opcUa: boolean;
  dataLogging: boolean;
  analyticsIntegration: boolean;
}

// ===== Additional Features =====
export interface AdditionalFeature {
  name: string;
  enabled: boolean;
  complexity: FeatureComplexity;
}

// ===== Complexity Assessment =====
export interface ComplexityAssessment {
  hardware: ComplexityLevel;
  motion: ComplexityLevel;
  hmi: ComplexityLevel;
  vision: ComplexityLevel;
  safety: ComplexityLevel;
  communication: ComplexityLevel;
  software: ComplexityLevel;
  integration: ComplexityLevel;
  requirement: ComplexityLevel;
  testing: ComplexityLevel;
  requirementClarity: ClarityLevel;
  customerChangeFrequency: ChangeFrequency;
  productVariants: number;
  machineStations: number;
  reuseLevel: ReuseLevel;
}

// ===== Full Project Configuration =====
export interface ProjectConfig {
  project: Omit<Project, 'id' | 'status' | 'createdAt' | 'updatedAt'>;
  controller: ControllerConfig;
  io: IOConfig;
  motion: MotionConfig;
  hmi: HMIConfig;
  vision: VisionConfig;
  safety: SafetyConfig;
  communication: CommunicationConfig;
  mechatronics: MechatronicsConfig;
  robotics: RoboticsConfig;
  iiot: IIoTConfig;
  additionalFeatures: AdditionalFeature[];
  complexity: ComplexityAssessment;
}

// ===== Product Explorer =====
export interface BRProduct {
  name: string;
  category: string;
  description: string;
  engineeringRole: string;
  usedInProject: boolean;
}

// ===== Engineering Activity =====
export interface EngineeringActivity {
  technology: string;
  configuration: boolean;
  programming: boolean;
  integration: boolean;
  testing: boolean;
  commissioning: boolean;
  potentialComplexity: ComplexityLevel;
}
