export type BuildingTypology = 
  | 'StiltApartment' 
  | 'IndianApartment' 
  | 'KutchaHouse' 
  | 'ModernHighRise' 
  | 'Temple' 
  | 'IndustrialShed'
  | 'IndependentHouse';

export interface BuildingParams {
  year: number;
  typology: BuildingTypology;
  material: 'Concrete' | 'Steel' | 'Masonry' | 'Timber' | 'MudMortar' | 'Stone';
  floors: number;
  seismicZone: 'Zone II' | 'Zone III' | 'Zone IV' | 'Zone V';
  occupancy: 'Residential' | 'Commercial' | 'Industrial' | 'Religious' | 'Institutional';
  lastInspection: string;
  // Advanced Material Properties
  concreteStrength?: number; // psi (for Concrete)
  steelGrade?: number; // ksi (for Steel)
  elasticityModulus?: number; // GPa
}

export interface SensorData {
  time: string;
  vibration: number;
  stress: number;
  temperature: number;
  humidity: number;
}

export interface RetrofitOption {
  id: string;
  name: string;
  description: string;
  costEstimate: string;
  roi: number;
  riskReduction: number; // 0-100
  type: 'bracing' | 'isolation' | 'jacketing' | 'damping';
}

export interface AnalysisResult {
  vulnerabilityScore: number; // 0-100 (100 is bad)
  summary: string;
  criticalZones: string[];
  recommendations: RetrofitOption[];
}

export type ViewMode = 'dashboard' | 'profile' | 'reports' | 'vulnerability';

export enum RiskLevel {
  SAFE = 'SAFE',
  MODERATE = 'MODERATE',
  CRITICAL = 'CRITICAL'
}