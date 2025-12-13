// AI Agent 참모 시스템 타입 정의

import { OperationMode, RiskZone } from './index';

// ============================================
// 자원 관리
// ============================================

export type VehicleType = '제설차' | '양수기' | '굴착기' | '이동쉼터' | '구급차' | '소방차';
export type VehicleStatus = '대기' | '출동중' | '작업중' | '복귀중' | '정비중';

export interface Vehicle {
  id: string;
  type: VehicleType;
  name: string;
  status: VehicleStatus;
  location: [number, number];
  assignedZone?: string;
  driver?: string;
  eta?: number; // 도착 예상 시간 (분)
}

export interface ResourceSummary {
  type: VehicleType;
  total: number;
  available: number;
  deployed: number;
  maintenance: number;
}

export interface Shelter {
  id: string;
  name: string;
  address: string;
  capacity: number;
  currentOccupancy: number;
  location: [number, number];
  tel?: string;
  facilities: string[];
}

export interface Personnel {
  total: number;
  onDuty: number;
  deployed: number;
  available: number;
}

// ============================================
// AI 참모 브리핑
// ============================================

export interface AIBriefing {
  id: string;
  timestamp: Date;
  mode: OperationMode;

  // 현재 상황 요약
  situationSummary: string;

  // 핵심 지표
  keyMetrics: {
    totalRiskZones: number;
    criticalZones: number;
    deployedResources: number;
    estimatedAffectedPopulation: number;
  };

  // AI 추천 조치
  recommendations: AIRecommendation[];

  // 예상 시나리오
  forecast: {
    shortTerm: string; // 1-2시간
    midTerm: string;   // 3-6시간
    trend: 'improving' | 'stable' | 'worsening';
  };

  // 위험도 변화 예측
  riskPrediction: RiskPrediction[];
}

export interface AIRecommendation {
  id: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  action: string;
  reason: string;
  targetZone?: string;
  resourceType?: VehicleType;
  resourceCount?: number;
  estimatedImpact: string;
}

export interface RiskPrediction {
  hour: number; // 0 = 현재, 1 = +1시간, ...
  riskLevel: number; // 0-100
  factors: string[];
}

// ============================================
// 주민 알림
// ============================================

export type AlertType = '긴급재난문자' | '안전안내문자' | '예비특보' | '주의보' | '경보';
export type AlertChannel = 'CBS' | 'SMS' | 'APP' | 'TV' | 'RADIO';

export interface EmergencyAlert {
  id: string;
  type: AlertType;
  channels: AlertChannel[];
  targetArea: string;
  title: string;
  content: string;
  actionItems: string[];
  contactInfo: string;
  timestamp: Date;
  status: 'draft' | 'pending' | 'sent';

  // 자동 생성 정보
  generatedBy: 'AI' | 'manual';
  basedOnZones: string[];
}

// ============================================
// 상황 보고서
// ============================================

export interface SituationReport {
  id: string;
  title: string;
  reportType: '일일보고' | '상황보고' | '긴급보고' | '종결보고';
  createdAt: Date;
  mode: OperationMode;

  // 요약
  executiveSummary: string;

  // 상황 개요
  situationOverview: {
    startTime: Date;
    currentStatus: string;
    affectedAreas: string[];
    estimatedDamage: string;
  };

  // 대응 현황
  responseStatus: {
    deployedResources: ResourceSummary[];
    completedActions: string[];
    ongoingActions: string[];
    plannedActions: string[];
  };

  // 피해 현황
  damageAssessment: {
    casualties: number;
    displaced: number;
    propertyDamage: string;
  };

  // 건의 사항
  recommendations: string[];

  // 첨부
  attachments: string[];
}

// ============================================
// 기상 데이터
// ============================================

export interface WeatherData {
  timestamp: Date;
  location: string;

  current: {
    temperature: number;
    feelsLike: number;
    humidity: number;
    windSpeed: number;
    windDirection: string;
    precipitation: number;
    precipitationType: '없음' | '비' | '눈' | '진눈깨비';
    visibility: number;
    uvIndex: number;
  };

  alerts: WeatherAlert[];

  hourlyForecast: HourlyForecast[];
}

export interface WeatherAlert {
  type: string;
  severity: 'watch' | 'warning' | 'emergency';
  title: string;
  description: string;
  startTime: Date;
  endTime: Date;
}

export interface HourlyForecast {
  hour: number;
  temperature: number;
  precipitation: number;
  precipitationProbability: number;
  windSpeed: number;
  condition: string;
}

// ============================================
// AI Agent 상태
// ============================================

export interface AIAgentState {
  isProcessing: boolean;
  lastUpdate: Date;
  currentBriefing: AIBriefing | null;
  pendingAlerts: EmergencyAlert[];
  pendingReports: SituationReport[];
  conversationHistory: AIConversation[];
}

export interface AIConversation {
  id: string;
  timestamp: Date;
  role: 'user' | 'agent';
  message: string;
  relatedActions?: string[];
}
