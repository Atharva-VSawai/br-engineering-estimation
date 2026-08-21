import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type {
  AppPage,
  Project,
  ProjectConfig,
  CommunicationProtocol,
  AdditionalFeature,
  BRProduct,
} from '@/types';
import {
  SAMPLE_PROJECTS,
  SAMPLE_CONFIG,
  DEFAULT_PROTOCOLS,
  DEFAULT_ADDITIONAL_FEATURES,
  BR_PRODUCTS,
} from '@/data';

export interface Notification {
  id: string;
  message: string;
  detail?: string;
  icon?: string;
  color?: string;
  timestamp: number;
  read: boolean;
}

interface AppState {
  // Navigation
  currentPage: AppPage;
  setCurrentPage: (page: AppPage) => void;

  // Wizard
  wizardStep: number;
  setWizardStep: (step: number) => void;
  stepOrder: number[] | null;
  setStepOrder: (order: number[] | null) => void;

  // Projects
  projects: Project[];
  addProject: (project: Project) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  reorderProjects: (fromIndex: number, toIndex: number) => void;

  // Active project tracking
  activeProjectId: string | null;
  nextProjectNumber: number;
  openProject: (projectId: string) => void;
  createNewProject: (name?: string) => string;
  loadSampleProjects: () => void;

  // Current Configuration
  config: ProjectConfig;
  updateConfig: (updates: Partial<ProjectConfig>) => void;
  updateProjectInfo: (updates: Partial<ProjectConfig['project']>) => void;
  updateController: (updates: Partial<ProjectConfig['controller']>) => void;
  updateIO: (updates: Partial<ProjectConfig['io']>) => void;
  updateMotion: (updates: Partial<ProjectConfig['motion']>) => void;
  updateHMI: (updates: Partial<ProjectConfig['hmi']>) => void;
  updateVision: (updates: Partial<ProjectConfig['vision']>) => void;
  updateSafety: (updates: Partial<ProjectConfig['safety']>) => void;
  updateCommunication: (updates: Partial<ProjectConfig['communication']>) => void;
  updateMechatronics: (updates: Partial<ProjectConfig['mechatronics']>) => void;
  updateRobotics: (updates: Partial<ProjectConfig['robotics']>) => void;
  updateIIoT: (updates: Partial<ProjectConfig['iiot']>) => void;
  updateComplexity: (updates: Partial<ProjectConfig['complexity']>) => void;
  updateProtocol: (name: string, updates: Partial<CommunicationProtocol>) => void;
  updateAdditionalFeature: (name: string, updates: Partial<AdditionalFeature>) => void;
  resetConfig: () => void;
  loadSampleConfig: () => void;

  // Undo/Redo
  history: ProjectConfig[];
  historyIndex: number;
  undo: () => void;
  redo: () => void;
  pushHistory: () => void;

  // Notifications
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;

  // Products
  products: BRProduct[];
  toggleProductUsed: (name: string) => void;
}

const createDefaultConfig = (): ProjectConfig => ({
  project: {
    name: '',
    customer: '',
    machineType: '',
    industry: '',
    description: '',
    requirementClarity: 'Mostly Clear',
    customerInvolvement: 'Medium',
    projectVariants: 1,
    machineStations: 1,
    complexity: 'Medium',
  },
  controller: {
    family: 'X20',
    quantity: 1,
    performance: 'Standard',
    communicationInterfaces: '',
    redundancyRequired: false,
    simulationRequired: false,
    diagnosticsRequired: false,
  },
  io: {
    digitalInputs: 0,
    digitalOutputs: 0,
    analogInputs: 0,
    analogOutputs: 0,
    safetyIO: 0,
    encoderCounterModules: 0,
    temperatureModules: 0,
    communicationIO: 0,
    specialModules: 0,
  },
  motion: {
    totalAxes: 0,
    linearAxes: 0,
    rotaryAxes: 0,
    servoDrives: 0,
    servoMotors: 0,
    homingRequired: false,
    positioning: false,
    velocityControl: false,
    torqueControl: false,
    synchronization: false,
    masterSlave: false,
    electronicGearing: false,
    electronicCamming: false,
    coordinatedMotion: false,
    interpolation: false,
    complexMotionProfiles: false,
    axisDiagnostics: false,
  },
  hmi: {
    type: 'Automation Panel',
    screens: 0,
    screenComplexity: 'Moderate',
    alarmManagement: false,
    recipeManagement: false,
    trendVisualization: false,
    userManagement: false,
    machineDiagnostics: false,
    manualMode: false,
    automaticMode: false,
    maintenanceScreens: false,
    parameterManagement: false,
  },
  vision: {
    enabled: false,
    cameras: 0,
    lightingSystems: 0,
    inspection: false,
    measurement: false,
    detection: false,
    identification: false,
    ocr: false,
    barcodeQR: false,
    patternMatching: false,
    positionDetection: false,
    qualityControl: false,
    triggering: '',
    plcIntegration: false,
    motionVisionSync: false,
  },
  safety: {
    enabled: false,
    controller: 'X20 Safety',
    safetyIOCount: 0,
    emergencyStops: 0,
    safetyDoors: 0,
    lightCurtains: 0,
    safeMotion: false,
    safetyFunctions: false,
    validationRequired: false,
    testingRequired: false,
    documentationRequired: false,
  },
  communication: {
    protocols: DEFAULT_PROTOCOLS,
    plcToPlc: false,
    mesIntegration: false,
    scadaIntegration: false,
    cloudIIoTIntegration: false,
  },
  mechatronics: {
    type: 'None',
    movers: 0,
    processingStations: 0,
    moverRouting: false,
    independentMoverControl: false,
    synchronization: false,
    transportSequences: false,
    productHandling: false,
    visionIntegration: false,
    hmiIntegration: false,
    safetyIntegration: false,
    diagnostics: false,
  },
  robotics: {
    enabled: false,
    robotType: 'Delta',
    quantity: 0,
    motionIntegration: false,
    visionIntegration: false,
    pickAndPlace: false,
    trajectoryProgramming: false,
    synchronization: false,
    simulation: false,
    safety: false,
    robotDiagnostics: false,
  },
  iiot: {
    ipcRequired: false,
    ipcModel: 'Automation PC 3100',
    iiotRequired: false,
    iiotConnector: false,
    iiotServices: false,
    iiotEdgeDevice: false,
    cloudConnectivity: false,
    machineDataCollection: false,
    remoteMaintenance: false,
    opcUa: false,
    dataLogging: false,
    analyticsIntegration: false,
  },
  additionalFeatures: DEFAULT_ADDITIONAL_FEATURES,
  complexity: {
    hardware: 'Medium',
    motion: 'Medium',
    hmi: 'Medium',
    vision: 'Medium',
    safety: 'Medium',
    communication: 'Medium',
    software: 'Medium',
    integration: 'Medium',
    requirement: 'Medium',
    testing: 'Medium',
    requirementClarity: 'Mostly Clear',
    customerChangeFrequency: 'Medium',
    productVariants: 1,
    machineStations: 1,
    reuseLevel: 'Medium',
  },
});

/** Deep-clone a ProjectConfig */
function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj)) as T;
}

/** Generate the next sequential project ID: BR-2026-NNN */
function generateProjectId(nextNum: number): string {
  return `BR-2026-${String(nextNum).padStart(3, '0')}`;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // ===== Navigation =====
      currentPage: 'dashboard',
      setCurrentPage: (page) => set({ currentPage: page, wizardStep: 0 }),

      // ===== Wizard =====
      wizardStep: 0,
      setWizardStep: (step) => set({ wizardStep: step }),

      stepOrder: null,
      setStepOrder: (order) => set({ stepOrder: order }),

      // ===== Projects =====
      projects: [],
      addProject: (project) =>
        set((state) => ({ projects: [project, ...state.projects] })),
      updateProject: (id, updates) =>
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === id
              ? { ...p, ...updates, updatedAt: new Date().toLocaleDateString() }
              : p
          ),
        })),
      deleteProject: (id) =>
        set((state) => ({
          projects: state.projects.filter((p) => p.id !== id),
          // Clear activeProjectId if the deleted project was active
          activeProjectId:
            state.activeProjectId === id ? null : state.activeProjectId,
          // Reset config if the active project was deleted
          config:
            state.activeProjectId === id
              ? createDefaultConfig()
              : state.config,
        })),
      reorderProjects: (fromIndex, toIndex) =>
        set((state) => {
          const newProjects = [...state.projects];
          const [moved] = newProjects.splice(fromIndex, 1);
          newProjects.splice(toIndex, 0, moved);
          return { projects: newProjects };
        }),

      // ===== Active Project Tracking =====
      activeProjectId: null,
      nextProjectNumber: 6, // Sample projects end at BR-2026-005

      openProject: (projectId) =>
        set((state) => {
          const project = state.projects.find((p) => p.id === projectId);
          if (!project) return state;
          const config = project.config
            ? deepClone(project.config)
            : createDefaultConfig();
          return { activeProjectId: projectId, config };
        }),

      createNewProject: (name) => {
        const state = get();
        const id = generateProjectId(state.nextProjectNumber);
        const now = new Date().toISOString().split('T')[0];
        const newConfig = createDefaultConfig();
        if (name) {
          newConfig.project.name = name;
        }
        const project: Project = {
          id,
          name: name || 'New Project',
          customer: '',
          machineType: '',
          industry: '',
          description: '',
          requirementClarity: 'Mostly Clear',
          customerInvolvement: 'Medium',
          projectVariants: 1,
          machineStations: 1,
          status: 'Draft',
          complexity: 'Medium',
          createdAt: now,
          updatedAt: now,
          config: deepClone(newConfig),
        };
        set({
          projects: [project, ...state.projects],
          activeProjectId: id,
          config: newConfig,
          nextProjectNumber: state.nextProjectNumber + 1,
          history: [],
          historyIndex: -1,
        });
        return id;
      },

      loadSampleProjects: () =>
        set((state) => {
          // Only add samples that are not already present
          const existingIds = new Set(state.projects.map((p) => p.id));
          const toAdd = SAMPLE_PROJECTS.filter(
            (sp) => !existingIds.has(sp.id),
          );
          if (toAdd.length === 0) return state;
          return { projects: [...toAdd, ...state.projects] };
        }),

      // ===== Current Configuration =====
      config: createDefaultConfig(),
      updateConfig: (updates) =>
        set((state) => ({ config: { ...state.config, ...updates } })),
      updateProjectInfo: (updates) =>
        set((state) => ({
          config: { ...state.config, project: { ...state.config.project, ...updates } },
        })),
      updateController: (updates) =>
        set((state) => ({
          config: { ...state.config, controller: { ...state.config.controller, ...updates } },
        })),
      updateIO: (updates) =>
        set((state) => ({
          config: { ...state.config, io: { ...state.config.io, ...updates } },
        })),
      updateMotion: (updates) =>
        set((state) => ({
          config: { ...state.config, motion: { ...state.config.motion, ...updates } },
        })),
      updateHMI: (updates) =>
        set((state) => ({
          config: { ...state.config, hmi: { ...state.config.hmi, ...updates } },
        })),
      updateVision: (updates) =>
        set((state) => ({
          config: { ...state.config, vision: { ...state.config.vision, ...updates } },
        })),
      updateSafety: (updates) =>
        set((state) => ({
          config: { ...state.config, safety: { ...state.config.safety, ...updates } },
        })),
      updateCommunication: (updates) =>
        set((state) => ({
          config: { ...state.config, communication: { ...state.config.communication, ...updates } },
        })),
      updateMechatronics: (updates) =>
        set((state) => ({
          config: { ...state.config, mechatronics: { ...state.config.mechatronics, ...updates } },
        })),
      updateRobotics: (updates) =>
        set((state) => ({
          config: { ...state.config, robotics: { ...state.config.robotics, ...updates } },
        })),
      updateIIoT: (updates) =>
        set((state) => ({
          config: { ...state.config, iiot: { ...state.config.iiot, ...updates } },
        })),
      updateComplexity: (updates) =>
        set((state) => ({
          config: { ...state.config, complexity: { ...state.config.complexity, ...updates } },
        })),
      updateProtocol: (name, updates) =>
        set((state) => ({
          config: {
            ...state.config,
            communication: {
              ...state.config.communication,
              protocols: state.config.communication.protocols.map((p) =>
                p.name === name ? { ...p, ...updates } : p
              ),
            },
          },
        })),
      updateAdditionalFeature: (name, updates) =>
        set((state) => ({
          config: {
            ...state.config,
            additionalFeatures: state.config.additionalFeatures.map((f) =>
              f.name === name ? { ...f, ...updates } : f
            ),
          },
        })),
      resetConfig: () =>
        set({
          config: createDefaultConfig(),
          activeProjectId: null,
          wizardStep: 0,
        }),
      loadSampleConfig: () => set({ config: deepClone(SAMPLE_CONFIG) }),

      // ===== Undo/Redo =====
      history: [],
      historyIndex: -1,
      pushHistory: () =>
        set((state) => {
          const snapshot = deepClone(state.config);
          const newHistory = [...state.history.slice(0, state.historyIndex + 1), snapshot];
          let newIndex = newHistory.length - 1;
          if (newHistory.length > 50) {
            newHistory.shift();
            newIndex--;
          }
          return { history: newHistory, historyIndex: newIndex };
        }),
      undo: () =>
        set((state) => {
          if (state.historyIndex <= 0) return state;
          const newIndex = state.historyIndex - 1;
          return {
            historyIndex: newIndex,
            config: deepClone(state.history[newIndex]),
          };
        }),
      redo: () =>
        set((state) => {
          if (state.historyIndex >= state.history.length - 1) return state;
          const newIndex = state.historyIndex + 1;
          return {
            historyIndex: newIndex,
            config: deepClone(state.history[newIndex]),
          };
        }),

      // ===== Notifications =====
      notifications: [] as Notification[],
      addNotification: (notification) =>
        set((state) => ({
          notifications: [
            {
              ...notification,
              id: 'n-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7),
              timestamp: Date.now(),
              read: false,
            },
            ...state.notifications,
          ].slice(0, 50),
        })),
      markNotificationRead: (id) =>
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          ),
        })),
      markAllNotificationsRead: () =>
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, read: true })),
        })),

      // ===== Products =====
      products: BR_PRODUCTS.map((p) => ({ ...p })),
      toggleProductUsed: (name) =>
        set((state) => ({
          products: state.products.map((p) =>
            p.name === name ? { ...p, usedInProject: !p.usedInProject } : p
          ),
        })),
    }),
    {
      name: 'br-estimation-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        projects: state.projects,
        activeProjectId: state.activeProjectId,
        nextProjectNumber: state.nextProjectNumber,
        // Do NOT persist config — it is derived from activeProjectId
      }),
    },
  ),
);
