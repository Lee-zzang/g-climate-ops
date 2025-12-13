// G-Climate Ops 타입 정의 (고도화 버전)

// 4가지 작전 모드
export type OperationMode = 'winter' | 'summer' | 'landslide' | 'heat';

export type RiskStatus = '조치필요' | '조치중' | '완료';

// 모드별 정보
export const MODE_INFO: Record<OperationMode, {
  label: string;
  labelEn: string;
  icon: string;
  color: string;
  bgColor: string;
  description: string;
  vehicle: string;
}> = {
  winter: {
    label: '결빙',
    labelEn: 'Winter',
    icon: '❄️',
    color: 'purple',
    bgColor: 'bg-purple-500',
    description: '태양광(일조량) 및 지형 데이터를 분석하여 블랙아이스 위험 구간 탐지',
    vehicle: '제설차',
  },
  summer: {
    label: '침수',
    labelEn: 'Summer',
    icon: '🌊',
    color: 'blue',
    bgColor: 'bg-blue-500',
    description: '극한호우 및 불투수면 데이터를 분석하여 침수 위험 구간 탐지',
    vehicle: '양수기',
  },
  landslide: {
    label: '산사태',
    labelEn: 'Landslide',
    icon: '⛰️',
    color: 'orange',
    bgColor: 'bg-orange-500',
    description: '산사태 위험등급 및 취약지역 분석하여 붕괴 위험 구간 탐지',
    vehicle: '굴착기',
  },
  heat: {
    label: '폭염',
    labelEn: 'Heatwave',
    icon: '🔥',
    color: 'red',
    bgColor: 'bg-red-500',
    description: '기후취약지역 및 무더위쉼터 분석하여 폭염 대응 지원',
    vehicle: '이동쉼터',
  },
};

export interface RiskZone {
  id: string;
  name: string;
  coordinates: [number, number]; // [lat, lng]
  risk_score: number; // 0-100
  reason: string;
  status: RiskStatus;
  mode: OperationMode;
  source_layer: string; // 데이터 출처 레이어
  details: Record<string, unknown>;
}

export interface AgentMessage {
  id: string;
  timestamp: Date;
  message: string;
  type: 'alert' | 'info' | 'action' | 'success' | 'data';
}

export interface RiskSummary {
  total_zones: number;
  high_risk: number; // >= 80
  medium_risk: number; // 50-79
  low_risk: number; // < 50
  shelters?: number; // 폭염 모드용 쉼터 수
}

export interface RiskAnalysisResponse {
  mode: OperationMode;
  zones: RiskZone[];
  summary: RiskSummary;
  agent_messages: AgentMessage[];
  data_sources: string[]; // 사용된 데이터 소스
  timestamp: string;
}

// API 관련 타입
export interface GeoJSONFeature {
  type: 'Feature';
  id?: string;
  geometry: {
    type: string;
    coordinates: number[] | number[][] | number[][][] | number[][][][];
  };
  properties: Record<string, unknown>;
}

export interface GeoJSONResponse {
  type: 'FeatureCollection';
  totalFeatures: number;
  features: GeoJSONFeature[];
  numberMatched: number;
  numberReturned: number;
}

// 레이어 정보
export interface LayerInfo {
  name: string;
  title: string;
  description: string;
  mode: OperationMode[];
}

export const LAYER_INFO: LayerInfo[] = [
  // 침수 관련
  { name: 'cfm_sgg_41_100yr_1h', title: '도시침수지도 100년빈도', description: '100년 빈도 1시간 강우 침수예측', mode: ['summer'] },
  { name: 'cfm_sgg_41_030yr_1h', title: '도시침수지도 30년빈도', description: '30년 빈도 1시간 강우 침수예측', mode: ['summer'] },
  { name: 'cfm_sgg_41_500yr_1h', title: '도시침수지도 500년빈도', description: '500년 빈도 극한호우 침수예측', mode: ['summer'] },
  { name: 'impvs', title: '비오톱불투수', description: '불투수면 비율 데이터', mode: ['summer'] },
  { name: 'tm_fldn_trce', title: '홍수범람추적', description: '홍수 범람 추적 데이터', mode: ['summer'] },
  { name: 'uj301_41', title: '소하천구역', description: '소하천 구역 데이터', mode: ['summer'] },
  { name: 'ntn_rvr', title: '국가하천망도', description: '국가 하천 네트워크', mode: ['summer'] },

  // 결빙 관련
  { name: 'slop_20_ovr', title: '경사도20도이상', description: '경사도 20도 이상 급경사 지역', mode: ['winter', 'landslide'] },
  { name: 'altd_1000_ovr', title: '고도1000m이상', description: '해발 1000m 이상 고지대', mode: ['winter'] },
  { name: 'sprd_rw_41', title: '도로', description: '경기도 도로 데이터', mode: ['winter'] },
  { name: 'mountdstc_rvr', title: '산지하천', description: '산지하천 데이터 (음지 추정용)', mode: ['winter'] },

  // 산사태 관련
  { name: 'ldsld_grd1', title: '산사태1등급구역', description: '산사태 위험 1등급 지정구역', mode: ['landslide'] },
  { name: 'ldsld_weak_rgn', title: '산사태취약지역', description: '산사태 취약 지역', mode: ['landslide'] },
  { name: 'ldsld_ocrn_prst', title: '산사태이력현황', description: '과거 산사태 발생 이력', mode: ['landslide'] },

  // 폭염 관련
  { name: 'clim_weak_rgn_scr', title: '기후취약지역스코어', description: '기후 취약 지역 점수', mode: ['heat'] },
  { name: 'swtr_rstar', title: '무더위쉼터', description: '무더위 대피소 위치', mode: ['heat'] },

  // 탄소/건물 관련
  { name: 'bldg_elpwr_cbn_ehqty', title: '건물전기탄소배출량', description: '건물 전기 사용 탄소배출량', mode: [] },
  { name: 'bldg_gas_cbn_ehqty', title: '건물가스탄소배출량', description: '건물 가스 사용 탄소배출량', mode: [] },
  { name: 'forest_cbn_abpvl', title: '산림탄소흡수량', description: '산림 탄소 흡수량', mode: [] },
];

// 차량/장비 상태
export interface Vehicle {
  id: string;
  type: string;
  status: '대기' | '출동중' | '작업중' | '복귀중';
  location: [number, number];
  assignedZone?: string;
}
