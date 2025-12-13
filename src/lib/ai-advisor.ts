/**
 * AI 참모 시스템 - 핵심 로직
 * 재난대응 의사결정 지원 AI Agent
 */

import { OperationMode, RiskZone, MODE_INFO } from '@/types';
import {
  AIBriefing,
  AIRecommendation,
  RiskPrediction,
  EmergencyAlert,
  SituationReport,
  WeatherData,
  HourlyForecast,
  ResourceSummary,
  Vehicle,
  Shelter,
  Personnel,
  VehicleType,
} from '@/types/advisor';

// ============================================
// 모의 자원 데이터
// ============================================

export function getMockResources(mode: OperationMode): ResourceSummary[] {
  const baseResources: Record<OperationMode, ResourceSummary[]> = {
    winter: [
      { type: '제설차', total: 15, available: 8, deployed: 5, maintenance: 2 },
      { type: '구급차', total: 10, available: 7, deployed: 2, maintenance: 1 },
    ],
    summer: [
      { type: '양수기', total: 12, available: 6, deployed: 4, maintenance: 2 },
      { type: '구급차', total: 10, available: 6, deployed: 3, maintenance: 1 },
      { type: '소방차', total: 8, available: 5, deployed: 2, maintenance: 1 },
    ],
    landslide: [
      { type: '굴착기', total: 8, available: 4, deployed: 3, maintenance: 1 },
      { type: '구급차', total: 10, available: 5, deployed: 4, maintenance: 1 },
      { type: '소방차', total: 8, available: 4, deployed: 3, maintenance: 1 },
    ],
    heat: [
      { type: '이동쉼터', total: 10, available: 5, deployed: 4, maintenance: 1 },
      { type: '구급차', total: 10, available: 6, deployed: 3, maintenance: 1 },
    ],
  };

  return baseResources[mode];
}

export function getMockVehicles(mode: OperationMode): Vehicle[] {
  const vehicleType = MODE_INFO[mode].vehicle as VehicleType;
  const baseLocations: [number, number][] = [
    [37.2636, 127.0286],
    [37.3595, 127.1086],
    [37.4292, 126.9876],
    [37.5034, 126.7660],
    [37.3180, 126.8309],
  ];

  return baseLocations.map((loc, idx) => ({
    id: `${vehicleType}-${String(idx + 1).padStart(2, '0')}`,
    type: vehicleType,
    name: `${vehicleType} ${idx + 1}호`,
    status: idx < 2 ? '대기' : idx < 4 ? '출동중' : '작업중',
    location: loc,
    driver: `기사${idx + 1}`,
    eta: idx < 2 ? 0 : Math.floor(Math.random() * 30) + 5,
  }));
}

export function getMockPersonnel(): Personnel {
  return {
    total: 60,
    onDuty: 45,
    deployed: 28,
    available: 17,
  };
}

export function getMockShelters(): Shelter[] {
  return [
    {
      id: 'SH001',
      name: '수원시청 지하대피소',
      address: '수원시 팔달구 효원로 241',
      capacity: 500,
      currentOccupancy: 0,
      location: [37.2636, 127.0286],
      tel: '031-228-2114',
      facilities: ['화장실', '음용수', '의료실', '침구'],
    },
    {
      id: 'SH002',
      name: '영통구민회관',
      address: '수원시 영통구 영통로 396',
      capacity: 300,
      currentOccupancy: 0,
      location: [37.2577, 127.0467],
      tel: '031-228-8500',
      facilities: ['화장실', '음용수', '냉난방'],
    },
    {
      id: 'SH003',
      name: '성남시민체육관',
      address: '성남시 분당구 야탑로 342',
      capacity: 800,
      currentOccupancy: 0,
      location: [37.4108, 127.1278],
      tel: '031-729-2114',
      facilities: ['화장실', '음용수', '의료실', '침구', '샤워실'],
    },
  ];
}

// ============================================
// 기상 데이터 (모의)
// ============================================

export function getMockWeather(mode: OperationMode): WeatherData {
  const now = new Date();

  const weatherByMode: Record<OperationMode, Partial<WeatherData['current']>> = {
    winter: {
      temperature: -3,
      feelsLike: -8,
      humidity: 45,
      precipitation: 2,
      precipitationType: '눈',
      windSpeed: 12,
    },
    summer: {
      temperature: 28,
      feelsLike: 32,
      humidity: 85,
      precipitation: 45,
      precipitationType: '비',
      windSpeed: 8,
    },
    landslide: {
      temperature: 22,
      feelsLike: 24,
      humidity: 90,
      precipitation: 60,
      precipitationType: '비',
      windSpeed: 15,
    },
    heat: {
      temperature: 36,
      feelsLike: 42,
      humidity: 70,
      precipitation: 0,
      precipitationType: '없음',
      windSpeed: 3,
    },
  };

  const current = weatherByMode[mode];

  // 시간대별 예보 생성
  const hourlyForecast: HourlyForecast[] = [];
  for (let i = 0; i <= 6; i++) {
    const tempDelta = mode === 'heat' ? i * 0.5 : mode === 'winter' ? -i * 0.3 : 0;
    hourlyForecast.push({
      hour: i,
      temperature: (current.temperature || 20) + tempDelta,
      precipitation: Math.max(0, (current.precipitation || 0) + (Math.random() - 0.3) * 20),
      precipitationProbability: mode === 'heat' ? 10 : 70 + Math.random() * 20,
      windSpeed: (current.windSpeed || 5) + Math.random() * 5,
      condition: mode === 'winter' ? '눈' : mode === 'heat' ? '맑음' : '비',
    });
  }

  return {
    timestamp: now,
    location: '경기도',
    current: {
      temperature: current.temperature || 20,
      feelsLike: current.feelsLike || 20,
      humidity: current.humidity || 50,
      windSpeed: current.windSpeed || 5,
      windDirection: '북서',
      precipitation: current.precipitation || 0,
      precipitationType: current.precipitationType || '없음',
      visibility: mode === 'winter' ? 500 : 10000,
      uvIndex: mode === 'heat' ? 11 : 3,
    },
    alerts: mode !== 'heat' ? [{
      type: MODE_INFO[mode].label + ' 주의보',
      severity: 'warning',
      title: `${MODE_INFO[mode].label} 주의보 발령`,
      description: `경기도 전역에 ${MODE_INFO[mode].label} 주의보가 발령되었습니다.`,
      startTime: new Date(now.getTime() - 3600000),
      endTime: new Date(now.getTime() + 7200000),
    }] : [{
      type: '폭염경보',
      severity: 'emergency',
      title: '폭염경보 발령',
      description: '경기도 전역에 폭염경보가 발령되었습니다. 야외활동을 자제해주세요.',
      startTime: new Date(now.getTime() - 7200000),
      endTime: new Date(now.getTime() + 14400000),
    }],
    hourlyForecast,
  };
}

// ============================================
// AI 브리핑 생성
// ============================================

export function generateAIBriefing(
  mode: OperationMode,
  zones: RiskZone[],
  weather: WeatherData
): AIBriefing {
  const modeInfo = MODE_INFO[mode];
  const criticalZones = zones.filter(z => z.risk_score >= 80);
  const now = new Date();

  // 상황 요약 생성
  const situationSummary = generateSituationSummary(mode, zones, weather);

  // AI 추천 생성
  const recommendations = generateRecommendations(mode, zones, weather);

  // 위험도 예측 생성
  const riskPrediction = generateRiskPrediction(mode, zones, weather);

  // 예상 시나리오
  const forecast = generateForecast(mode, weather, riskPrediction);

  return {
    id: `BRIEF-${Date.now()}`,
    timestamp: now,
    mode,
    situationSummary,
    keyMetrics: {
      totalRiskZones: zones.length,
      criticalZones: criticalZones.length,
      deployedResources: Math.floor(zones.length * 0.6),
      estimatedAffectedPopulation: criticalZones.length * 15000,
    },
    recommendations,
    forecast,
    riskPrediction,
  };
}

function generateSituationSummary(
  mode: OperationMode,
  zones: RiskZone[],
  weather: WeatherData
): string {
  const modeInfo = MODE_INFO[mode];
  const criticalCount = zones.filter(z => z.risk_score >= 80).length;
  const warningCount = zones.filter(z => z.risk_score >= 50 && z.risk_score < 80).length;

  const summaries: Record<OperationMode, string> = {
    winter: `현재 기온 ${weather.current.temperature}°C, 체감온도 ${weather.current.feelsLike}°C로 결빙 조건이 충족되었습니다. 경기도 내 ${zones.length}개 구간에서 블랙아이스 위험이 탐지되었으며, 이 중 ${criticalCount}개 구간이 즉각 조치가 필요한 고위험 상태입니다. 시간당 ${weather.current.precipitation}mm의 강설이 예상되어 도로 상황이 악화될 수 있습니다.`,

    summer: `현재 시간당 ${weather.current.precipitation}mm의 강우가 진행 중이며, 경기도 내 ${zones.length}개 구간에서 침수 위험이 탐지되었습니다. ${criticalCount}개 고위험 구간에 대한 양수기 배치가 시급합니다. 향후 2-3시간 동안 강우 강도가 증가할 것으로 예상됩니다.`,

    landslide: `집중호우로 인해 경기도 산악 지역 ${zones.length}개소에서 산사태 위험 징후가 감지되었습니다. 특히 ${criticalCount}개 1등급 위험구역에 대한 긴급 대피 조치가 필요합니다. 토양 포화도가 임계치에 근접하고 있어 추가 강우 시 붕괴 위험이 급증할 수 있습니다.`,

    heat: `현재 기온 ${weather.current.temperature}°C, 체감온도 ${weather.current.feelsLike}°C로 폭염경보 수준입니다. ${zones.length}개 기후취약지역에서 온열질환 위험이 높으며, ${criticalCount}개 지역은 독거노인 밀집 구역으로 긴급 순찰이 필요합니다. 가용 무더위쉼터는 ${warningCount}개소입니다.`,
  };

  return summaries[mode];
}

function generateRecommendations(
  mode: OperationMode,
  zones: RiskZone[],
  weather: WeatherData
): AIRecommendation[] {
  const modeInfo = MODE_INFO[mode];
  const criticalZones = zones.filter(z => z.risk_score >= 80);
  const topZone = criticalZones[0];

  const recommendations: AIRecommendation[] = [];

  // 1순위: 가장 위험한 구역 대응
  if (topZone) {
    recommendations.push({
      id: 'REC-001',
      priority: 'critical',
      action: `${topZone.name}에 ${modeInfo.vehicle} 즉시 배치`,
      reason: `위험도 ${topZone.risk_score}%로 최우선 대응 필요. ${topZone.reason}`,
      targetZone: topZone.id,
      resourceType: modeInfo.vehicle as VehicleType,
      resourceCount: 2,
      estimatedImpact: '해당 구역 위험도 30% 감소 예상',
    });
  }

  // 2순위: 선제적 배치
  if (criticalZones.length > 1) {
    recommendations.push({
      id: 'REC-002',
      priority: 'high',
      action: `고위험 ${criticalZones.length}개 구역에 순차 배치`,
      reason: `현재 ${criticalZones.length}개 구역이 위험도 80% 이상. 동시다발적 상황 발생 대비 필요`,
      resourceType: modeInfo.vehicle as VehicleType,
      resourceCount: Math.min(criticalZones.length, 5),
      estimatedImpact: `전체 고위험 구역 대응 시간 40% 단축`,
    });
  }

  // 3순위: 주민 알림
  recommendations.push({
    id: 'REC-003',
    priority: 'high',
    action: '긴급재난문자 발송',
    reason: `${criticalZones.length}개 고위험 구역 주민 대상 사전 경보 필요`,
    estimatedImpact: '예상 피해 인원 50% 감소',
  });

  // 4순위: 모드별 특수 조치
  const specialRecommendations: Record<OperationMode, AIRecommendation> = {
    winter: {
      id: 'REC-004',
      priority: 'medium',
      action: '염화칼슘 살포 지점 확대',
      reason: `기온 하강 추세로 결빙 구역 확대 예상`,
      estimatedImpact: '결빙 사고 예방률 25% 향상',
    },
    summer: {
      id: 'REC-004',
      priority: 'medium',
      action: '지하차도 통제 사전 준비',
      reason: '강우 강도 증가 예상, 지하차도 침수 위험',
      estimatedImpact: '차량 고립 사고 예방',
    },
    landslide: {
      id: 'REC-004',
      priority: 'critical',
      action: '위험구역 주민 사전 대피 권고',
      reason: '토양 포화도 임계치 도달 예상',
      estimatedImpact: '인명피해 최소화',
    },
    heat: {
      id: 'REC-004',
      priority: 'high',
      action: '독거노인 가구 긴급 순찰',
      reason: '열사병 취약계층 집중 관리 필요',
      estimatedImpact: '온열질환 사망률 60% 감소',
    },
  };

  recommendations.push(specialRecommendations[mode]);

  return recommendations;
}

function generateRiskPrediction(
  mode: OperationMode,
  zones: RiskZone[],
  weather: WeatherData
): RiskPrediction[] {
  const currentRisk = zones.length > 0
    ? zones.reduce((sum, z) => sum + z.risk_score, 0) / zones.length
    : 30;

  const predictions: RiskPrediction[] = [];

  // 모드별 위험도 변화 패턴
  const patterns: Record<OperationMode, number[]> = {
    winter: [0, 5, 10, 15, 12, 8, 5], // 밤에 증가
    summer: [0, 8, 15, 20, 18, 10, 5], // 강우 시 급증
    landslide: [0, 10, 20, 25, 22, 15, 10], // 누적 강우로 증가
    heat: [0, 5, 10, 15, 18, 15, 10], // 오후 피크
  };

  const pattern = patterns[mode];

  for (let i = 0; i <= 6; i++) {
    const riskLevel = Math.min(100, currentRisk + pattern[i]);
    const factors: string[] = [];

    if (mode === 'winter') {
      if (i >= 2) factors.push('야간 기온 하강');
      if (weather.current.precipitation > 0) factors.push('강설 지속');
    } else if (mode === 'summer') {
      if (weather.current.precipitation > 30) factors.push('강우 강도 증가');
      factors.push('배수 용량 한계');
    } else if (mode === 'landslide') {
      factors.push('누적 강우량 증가');
      if (i >= 3) factors.push('토양 포화');
    } else {
      if (i >= 2 && i <= 4) factors.push('일사량 최대');
      factors.push('도심 열섬 효과');
    }

    predictions.push({
      hour: i,
      riskLevel,
      factors,
    });
  }

  return predictions;
}

function generateForecast(
  mode: OperationMode,
  weather: WeatherData,
  predictions: RiskPrediction[]
): AIBriefing['forecast'] {
  const maxRisk = Math.max(...predictions.map(p => p.riskLevel));
  const currentRisk = predictions[0].riskLevel;
  const trend = maxRisk > currentRisk + 10 ? 'worsening' : maxRisk < currentRisk - 10 ? 'improving' : 'stable';

  const forecasts: Record<OperationMode, { shortTerm: string; midTerm: string }> = {
    winter: {
      shortTerm: '향후 1-2시간: 기온 하강 지속, 결빙 구역 확대 예상. 주요 도로 중심 선제 대응 필요.',
      midTerm: '향후 3-6시간: 새벽 시간대 최저 기온 도달, 결빙 위험 피크. 출근 시간대 교통 혼잡 예상.',
    },
    summer: {
      shortTerm: '향후 1-2시간: 강우 강도 증가, 저지대 침수 시작 예상. 펌프 가동 준비.',
      midTerm: '향후 3-6시간: 강우 피크 후 점진적 감소. 배수 완료까지 교통 통제 유지.',
    },
    landslide: {
      shortTerm: '향후 1-2시간: 토양 수분 포화 임계점 도달 예상. 위험구역 대피 완료 필요.',
      midTerm: '향후 3-6시간: 추가 강우 시 소규모 붕괴 가능성. 모니터링 강화.',
    },
    heat: {
      shortTerm: '향후 1-2시간: 최고 기온 도달, 온열질환 위험 피크. 야외활동 자제 권고.',
      midTerm: '향후 3-6시간: 일몰 후 기온 하강, 열대야 가능성. 야간 순찰 유지.',
    },
  };

  return {
    ...forecasts[mode],
    trend,
  };
}

// ============================================
// 긴급재난문자 생성
// ============================================

export function generateEmergencyAlert(
  mode: OperationMode,
  zones: RiskZone[],
  weather: WeatherData
): EmergencyAlert {
  const modeInfo = MODE_INFO[mode];
  const criticalZones = zones.filter(z => z.risk_score >= 80);
  const topZones = criticalZones.slice(0, 3);
  const now = new Date();

  const templates: Record<OperationMode, { title: string; content: string; actions: string[] }> = {
    winter: {
      title: `[긴급] 결빙 주의`,
      content: `경기도 ${topZones.map(z => z.name.split(' ')[0]).join(', ')} 지역에 블랙아이스 위험 경보가 발령되었습니다. 현재 기온 ${weather.current.temperature}°C, 도로 결빙이 예상됩니다.`,
      actions: [
        '급제동·급출발 자제',
        '안전거리 2배 확보',
        '대중교통 이용 권장',
        '불필요한 외출 자제',
      ],
    },
    summer: {
      title: `[긴급] 침수 주의`,
      content: `경기도 ${topZones.map(z => z.name.split(' ')[0]).join(', ')} 지역에 침수 위험 경보가 발령되었습니다. 시간당 ${weather.current.precipitation}mm 이상의 폭우가 예상됩니다.`,
      actions: [
        '저지대·지하차도 진입 금지',
        '하천 접근 금지',
        '침수 시 차량 탈출',
        '높은 곳으로 대피',
      ],
    },
    landslide: {
      title: `[긴급] 산사태 위험`,
      content: `경기도 ${topZones.map(z => z.name.split(' ')[0]).join(', ')} 지역에 산사태 위험 경보가 발령되었습니다. 산지 인근 주민은 즉시 대피하시기 바랍니다.`,
      actions: [
        '산지·계곡 접근 금지',
        '대피소로 즉시 이동',
        '119 신고 (이상 징후 시)',
        '대피 경로 확인',
      ],
    },
    heat: {
      title: `[긴급] 폭염 경보`,
      content: `경기도 전역에 폭염경보가 발령되었습니다. 현재 기온 ${weather.current.temperature}°C, 체감온도 ${weather.current.feelsLike}°C입니다.`,
      actions: [
        '야외활동 자제 (11-17시)',
        '충분한 수분 섭취',
        '무더위쉼터 이용',
        '독거어르신 안부 확인',
      ],
    },
  };

  const template = templates[mode];

  return {
    id: `ALERT-${Date.now()}`,
    type: criticalZones.length >= 3 ? '긴급재난문자' : '안전안내문자',
    channels: ['CBS', 'SMS'],
    targetArea: '경기도 ' + topZones.map(z => z.name.split(' ')[0]).join(', '),
    title: template.title,
    content: template.content,
    actionItems: template.actions,
    contactInfo: '경기도 재난안전대책본부 031-120',
    timestamp: now,
    status: 'draft',
    generatedBy: 'AI',
    basedOnZones: topZones.map(z => z.id),
  };
}

// ============================================
// 상황보고서 생성
// ============================================

export function generateSituationReport(
  mode: OperationMode,
  zones: RiskZone[],
  weather: WeatherData,
  resources: ResourceSummary[]
): SituationReport {
  const modeInfo = MODE_INFO[mode];
  const now = new Date();
  const criticalZones = zones.filter(z => z.risk_score >= 80);

  return {
    id: `RPT-${Date.now()}`,
    title: `${modeInfo.label} 대응 상황보고서`,
    reportType: '상황보고',
    createdAt: now,
    mode,

    executiveSummary: `${now.toLocaleDateString('ko-KR')} ${now.toLocaleTimeString('ko-KR')} 현재, 경기도 내 ${zones.length}개 ${modeInfo.label} 위험구간이 탐지되었으며, 이 중 ${criticalZones.length}개 구간에서 고위험 상황이 진행 중입니다. ${resources.reduce((sum, r) => sum + r.deployed, 0)}대의 장비가 현장에 투입되어 대응 중입니다.`,

    situationOverview: {
      startTime: new Date(now.getTime() - 3600000 * 3),
      currentStatus: criticalZones.length > 3 ? '비상 3단계' : criticalZones.length > 0 ? '비상 2단계' : '주의',
      affectedAreas: [...new Set(zones.map(z => z.name.split(' ')[0]))],
      estimatedDamage: criticalZones.length > 0 ? '산정 중' : '없음',
    },

    responseStatus: {
      deployedResources: resources,
      completedActions: [
        '재난안전대책본부 가동',
        '유관기관 상황 공유',
        '초동대응팀 현장 파견',
      ],
      ongoingActions: [
        `${modeInfo.vehicle} 현장 배치 (${resources[0]?.deployed || 0}대)`,
        '위험구역 모니터링',
        '주민 대피 안내',
      ],
      plannedActions: [
        '추가 자원 동원 검토',
        '피해 복구 계획 수립',
        '상황 종료 시 정상화 절차',
      ],
    },

    damageAssessment: {
      casualties: 0,
      displaced: 0,
      propertyDamage: '집계 중',
    },

    recommendations: [
      `고위험 구역 ${criticalZones.length}개소에 대한 집중 대응`,
      '예비 자원 확보 및 대기',
      '주민 대피 완료 확인',
      '유관기관 협조 체계 유지',
    ],

    attachments: [],
  };
}
