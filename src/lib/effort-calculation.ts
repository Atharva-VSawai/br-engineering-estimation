import type { ProjectConfig, ComplexityLevel } from '@/types';



export interface EffortResult {
  hardwareHours: number;
  plcSoftwareHours: number;
  motionHours: number;
  hmiHours: number;
  visionHours: number;
  safetyHours: number;
  communicationIntegrationHours: number;
  testingHours: number;
  commissioningHours: number;
  totalHours: number;
  totalDays: number;
  totalWeeks: number;
  totalMonths: number;
}

export interface TimelineResult {
  hardwareDesignWeeks: number;
  softwareDevelopmentWeeks: number;
  integrationTestingWeeks: number;
  commissioningWeeks: number;
  totalWeeks: number;
}

export interface OverallResult {
  effort: EffortResult;
  timeline: TimelineResult;
  overallComplexity: ComplexityLevel;
  highCount: number;
}



const COMPLEXITY_WEEKS_MAP: Record<ComplexityLevel, number> = {
  Low: 1,
  Medium: 2,
  High: 3,
  'Very High': 4,
};




export function getOverallComplexity(
  config: ProjectConfig,
): { complexity: ComplexityLevel; highCount: number } {
  const dimensions: ComplexityLevel[] = [
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
  const highCount = dimensions.filter(
    (x) => x === 'High' || x === 'Very High',
  ).length;

  let complexity: ComplexityLevel;
  if (highCount >= 5) complexity = 'Very High';
  else if (highCount >= 3) complexity = 'High';
  else if (highCount >= 1) complexity = 'Medium';
  else complexity = 'Low';

  return { complexity, highCount };
}


export function calculateEngineeringEffort(config: ProjectConfig): OverallResult {
  const { complexity: overallComplexity, highCount } = getOverallComplexity(config);


  const hwHours =
    (config.io.digitalInputs +
      config.io.digitalOutputs +
      config.io.analogInputs +
      config.io.analogOutputs) *
      0.5 +
    config.motion.totalAxes * 4;

  const visionHours = config.vision.enabled
    ? config.vision.cameras * 16
    : 0;


  const plcSoftwareHours = config.hmi.screens * 8 + 40;


  const swHours = plcSoftwareHours + visionHours;

  const motionHours =
    config.motion.totalAxes * 6 +
    (config.motion.electronicCamming ? 20 : 0) +
    (config.motion.coordinatedMotion ? 16 : 0);

  const safetyHours = config.safety.enabled
    ? config.safety.safetyIOCount * 2 + 16
    : 0;


  const baseHours = hwHours + swHours + motionHours + safetyHours;
  const oldIntegrationHours = baseHours * 0.3;
  const communicationIntegrationHours = oldIntegrationHours * 0.6;
  const testingHours = oldIntegrationHours * 0.4;


  const complexityWeeks = COMPLEXITY_WEEKS_MAP[overallComplexity] ?? 2;
  const commissioningHours = complexityWeeks * 40;


  const totalHours =
    hwHours +
    plcSoftwareHours +
    motionHours +
    0 +
    visionHours +
    safetyHours +
    communicationIntegrationHours +
    testingHours +
    commissioningHours;

  const totalDays = totalHours / 8;
  const totalMonths = totalHours / (8 * 20);


  const hardwareDesignWeeks = 2;
  const softwareDevelopmentWeeks = Math.max(
    2,
    Math.ceil(config.hmi.screens / 3),
  );
  const integrationTestingWeeks = Math.max(
    2,
    Math.ceil(totalHours / 40),
  );
  const commissioningWeeks = complexityWeeks;
  const totalWeeks =
    hardwareDesignWeeks +
    softwareDevelopmentWeeks +
    integrationTestingWeeks +
    commissioningWeeks;

  return {
    effort: {
      hardwareHours: hwHours,
      plcSoftwareHours,
      motionHours,
      hmiHours: 0,
      visionHours,
      safetyHours,
      communicationIntegrationHours,
      testingHours,
      commissioningHours,
      totalHours,
      totalDays,
      totalWeeks,
      totalMonths,
    },
    timeline: {
      hardwareDesignWeeks,
      softwareDevelopmentWeeks,
      integrationTestingWeeks,
      commissioningWeeks,
      totalWeeks,
    },
    overallComplexity,
    highCount,
  };
}
