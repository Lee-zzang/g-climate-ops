// 경기도 기후 재난 Mock Data
// 경기기후플랫폼 API(WFS) 구조와 유사한 GeoJSON 데이터

import { RiskZone, AgentMessage, OperationMode } from '@/types';

// ============================================
// 겨울 모드: 블랙아이스 위험 구간 (음지 급경사 도로)
// ============================================
export const winterRiskZones: RiskZone[] = [
  {
    id: 'W001',
    name: '수원시 영통구 1번국도 A구간',
    coordinates: [37.2636, 127.0286],
    risk_score: 95,
    reason: '음지 급경사 구간 - 태양광 잠재량 최하위',
    status: '조치필요',
    mode: 'winter',
    source_layer: 'slop_20_ovr',
    details: {
      temperature: -2,
      slope: 12.5,
      sunlight: '일일 일조량 2시간 미만 (음지)',
    },
  },
  {
    id: 'W002',
    name: '용인시 처인구 산악도로 B구간',
    coordinates: [37.2341, 127.2017],
    risk_score: 88,
    reason: '북향 경사면 - 결빙 잔존 시간 최장',
    status: '조치필요',
    mode: 'winter',
    source_layer: 'slop_20_ovr',
    details: {
      temperature: -3,
      slope: 15.2,
      sunlight: '일일 일조량 3시간 미만',
    },
  },
  {
    id: 'W003',
    name: '성남시 분당구 고가도로 하부',
    coordinates: [37.3595, 127.1086],
    risk_score: 82,
    reason: '고가 그늘 구간 - 상시 음지',
    status: '조치중',
    mode: 'winter',
    source_layer: 'sprd_rw_41',
    details: {
      temperature: -1,
      slope: 3.5,
      sunlight: '고가 차폐로 일조량 0',
    },
  },
  {
    id: 'W004',
    name: '과천시 관악산 진입로',
    coordinates: [37.4292, 126.9876],
    risk_score: 91,
    reason: '산악 음지 + 급경사 복합 위험',
    status: '조치필요',
    mode: 'winter',
    source_layer: 'mountdstc_rvr',
    details: {
      temperature: -4,
      slope: 18.7,
      sunlight: '산 그림자 영향 일조량 1시간',
    },
  },
  {
    id: 'W005',
    name: '안양시 만안구 터널 출구',
    coordinates: [37.3943, 126.9568],
    risk_score: 78,
    reason: '터널 출구 급격한 온도차',
    status: '조치중',
    mode: 'winter',
    source_layer: 'sprd_rw_41',
    details: {
      temperature: -2,
      slope: 5.2,
      sunlight: '터널 내외부 온도차 8도',
    },
  },
  {
    id: 'W006',
    name: '의왕시 백운호수 주변 도로',
    coordinates: [37.3447, 126.9683],
    risk_score: 85,
    reason: '호수 인접 습기 + 음지',
    status: '조치필요',
    mode: 'winter',
    source_layer: 'sprd_rw_41',
    details: {
      temperature: -3,
      slope: 7.8,
      sunlight: '수면 반사 습기로 결빙 촉진',
    },
  },
  {
    id: 'W007',
    name: '광명시 철산동 육교 하부',
    coordinates: [37.4786, 126.8656],
    risk_score: 72,
    reason: '육교 그늘 + 교통량 적어 제설 지연',
    status: '완료',
    mode: 'winter',
    source_layer: 'sprd_rw_41',
    details: {
      temperature: -1,
      slope: 2.1,
      sunlight: '육교 차폐 구간',
    },
  },
];

// ============================================
// 여름 모드: 침수 위험 구간 (불투수면 저지대)
// ============================================
export const summerRiskZones: RiskZone[] = [
  {
    id: 'S001',
    name: '수원시 권선구 B교차로',
    coordinates: [37.2577, 127.0286],
    risk_score: 88,
    reason: '배수 불량 + 불투수면 밀집 저지대',
    status: '조치필요',
    mode: 'summer',
    source_layer: 'impvs',
    details: {
      rainfall: 50,
      impervious_rate: 92,
      elevation: 15,
    },
  },
  {
    id: 'S002',
    name: '부천시 원미구 지하차도',
    coordinates: [37.5034, 126.7660],
    risk_score: 95,
    reason: '지하차도 구조 + 집중호우 시 급속 침수',
    status: '조치필요',
    mode: 'summer',
    source_layer: 'cfm_sgg_41_100yr_1h',
    details: {
      rainfall: 60,
      impervious_rate: 100,
      elevation: -5,
    },
  },
  {
    id: 'S003',
    name: '안산시 단원구 저지대 상가',
    coordinates: [37.3180, 126.8309],
    risk_score: 82,
    reason: '해안 저지대 + 배수 시설 노후',
    status: '조치중',
    mode: 'summer',
    source_layer: 'cfm_sgg_41_100yr_1h',
    details: {
      rainfall: 45,
      impervious_rate: 88,
      elevation: 8,
    },
  },
  {
    id: 'S004',
    name: '시흥시 정왕동 산업단지',
    coordinates: [37.3459, 126.7380],
    risk_score: 79,
    reason: '대규모 불투수면 + 우수관 용량 부족',
    status: '조치필요',
    mode: 'summer',
    source_layer: 'impvs',
    details: {
      rainfall: 55,
      impervious_rate: 95,
      elevation: 12,
    },
  },
  {
    id: 'S005',
    name: '평택시 팽성읍 농경지 인접 도로',
    coordinates: [37.0052, 127.0286],
    risk_score: 75,
    reason: '농경지 유출수 집중 구간',
    status: '조치중',
    mode: 'summer',
    source_layer: 'tm_fldn_trce',
    details: {
      rainfall: 70,
      impervious_rate: 45,
      elevation: 5,
    },
  },
  {
    id: 'S006',
    name: '고양시 일산동구 호수공원 주변',
    coordinates: [37.6584, 126.7742],
    risk_score: 68,
    reason: '호수 범람 위험 + 저지대',
    status: '완료',
    mode: 'summer',
    source_layer: 'tm_fldn_trce',
    details: {
      rainfall: 40,
      impervious_rate: 60,
      elevation: 18,
    },
  },
  {
    id: 'S007',
    name: '파주시 금촌동 하천 인접 도로',
    coordinates: [37.7628, 126.7810],
    risk_score: 86,
    reason: '하천 범람 위험 + 배수 불량',
    status: '조치필요',
    mode: 'summer',
    source_layer: 'ntn_rvr',
    details: {
      rainfall: 65,
      impervious_rate: 78,
      elevation: 10,
    },
  },
];

// ============================================
// AI Agent 메시지 생성 함수
// ============================================
export function generateAgentMessages(
  mode: OperationMode,
  zones: RiskZone[]
): AgentMessage[] {
  const highRiskZones = zones.filter((z) => z.risk_score >= 80);
  const messages: AgentMessage[] = [];
  const now = new Date();

  if (mode === 'winter') {
    messages.push({
      id: `msg-${Date.now()}-1`,
      timestamp: new Date(now.getTime() - 5000),
      message: '🛰️ [시스템] 경기도 전역 기상 데이터 수신 완료. 분석 시작.',
      type: 'info',
    });

    messages.push({
      id: `msg-${Date.now()}-2`,
      timestamp: new Date(now.getTime() - 4000),
      message: `❄️ [기상분석] 현재 기온 영하 2~4도. 블랙아이스 형성 조건 충족.`,
      type: 'alert',
    });

    highRiskZones.forEach((zone, idx) => {
      messages.push({
        id: `msg-${Date.now()}-${idx + 3}`,
        timestamp: new Date(now.getTime() - 3000 + idx * 500),
        message: `⚠️ [위험감지] ${zone.name} - ${zone.reason}. 위험도 ${zone.risk_score}%`,
        type: 'alert',
      });
    });

    messages.push({
      id: `msg-${Date.now()}-action`,
      timestamp: now,
      message: `🚛 [작전명령] 제설차 ${highRiskZones.length}대 선제 배치 요망. 우선순위: ${highRiskZones[0]?.name || 'N/A'}`,
      type: 'action',
    });
  } else {
    messages.push({
      id: `msg-${Date.now()}-1`,
      timestamp: new Date(now.getTime() - 5000),
      message: '🛰️ [시스템] 기상청 강수 예보 데이터 연동 완료.',
      type: 'info',
    });

    messages.push({
      id: `msg-${Date.now()}-2`,
      timestamp: new Date(now.getTime() - 4000),
      message: `🌧️ [기상분석] 시간당 50~70mm 극한호우 예상. 침수 경보 발령.`,
      type: 'alert',
    });

    highRiskZones.forEach((zone, idx) => {
      messages.push({
        id: `msg-${Date.now()}-${idx + 3}`,
        timestamp: new Date(now.getTime() - 3000 + idx * 500),
        message: `⚠️ [위험감지] ${zone.name} - ${zone.reason}. 침수확률 ${zone.risk_score}%`,
        type: 'alert',
      });
    });

    messages.push({
      id: `msg-${Date.now()}-action`,
      timestamp: now,
      message: `🚒 [작전명령] 양수기 ${highRiskZones.length}대 전진 배치 요망. 최우선: ${highRiskZones[0]?.name || 'N/A'}`,
      type: 'action',
    });
  }

  return messages;
}

// ============================================
// 데이터 조회 함수
// ============================================
export function getRiskZones(mode: OperationMode): RiskZone[] {
  return mode === 'winter' ? winterRiskZones : summerRiskZones;
}

export function getRiskSummary(zones: RiskZone[]) {
  return {
    total_zones: zones.length,
    high_risk: zones.filter((z) => z.risk_score >= 80).length,
    medium_risk: zones.filter((z) => z.risk_score >= 50 && z.risk_score < 80).length,
    low_risk: zones.filter((z) => z.risk_score < 50).length,
  };
}
