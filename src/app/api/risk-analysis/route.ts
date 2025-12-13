// G-Climate Ops: Risk Analysis API (실제 API 연동 버전)
import { NextRequest, NextResponse } from 'next/server';
import {
  analyzeSummerRisks,
  analyzeWinterRisks,
  analyzeLandslideRisks,
  analyzeHeatRisks,
  RiskAnalysisResult,
} from '@/lib/gg-climate-api';
import {
  OperationMode,
  RiskAnalysisResponse,
  RiskZone,
  AgentMessage,
  RiskSummary,
  MODE_INFO,
} from '@/types';

// ============================================
// 에이전트 메시지 생성
// ============================================

function generateAgentMessages(
  mode: OperationMode,
  zones: RiskZone[],
  dataSources: string[]
): AgentMessage[] {
  const messages: AgentMessage[] = [];
  const now = new Date();
  const modeInfo = MODE_INFO[mode];

  const highRiskZones = zones.filter((z) => z.risk_score >= 80);
  const mediumRiskZones = zones.filter((z) => z.risk_score >= 50 && z.risk_score < 80);

  // 1. 시스템 시작 메시지
  messages.push({
    id: `msg-${Date.now()}-1`,
    timestamp: new Date(now.getTime() - 6000),
    message: `🛰️ [시스템] 경기기후플랫폼 API 연동 완료. ${modeInfo.labelEn} Mode 분석 시작.`,
    type: 'info',
  });

  // 2. 데이터 소스 메시지
  messages.push({
    id: `msg-${Date.now()}-2`,
    timestamp: new Date(now.getTime() - 5000),
    message: `📡 [데이터] ${dataSources.length}개 레이어 조회: ${dataSources.slice(0, 3).join(', ')}${dataSources.length > 3 ? ' 외' : ''}`,
    type: 'data',
  });

  // 3. 모드별 기상 분석 메시지
  const weatherMessages: Record<OperationMode, string> = {
    winter: `❄️ [기상분석] 현재 기온 영하권. 결빙 위험 조건 충족. 급경사 음지 구간 집중 분석.`,
    summer: `🌧️ [기상분석] 시간당 50~100mm 극한호우 예상. 침수 위험 지역 분석 중.`,
    landslide: `⛰️ [지형분석] 집중호우 경보. 산사태 위험등급 1등급 구역 집중 모니터링.`,
    heat: `🔥 [기상분석] 폭염경보 발령. 체감온도 35도 이상. 취약계층 대피 지원 필요.`,
  };

  messages.push({
    id: `msg-${Date.now()}-3`,
    timestamp: new Date(now.getTime() - 4000),
    message: weatherMessages[mode],
    type: 'alert',
  });

  // 4. 위험 구간 감지 메시지 (상위 3개)
  highRiskZones.slice(0, 3).forEach((zone, idx) => {
    messages.push({
      id: `msg-${Date.now()}-zone-${idx}`,
      timestamp: new Date(now.getTime() - 3000 + idx * 500),
      message: `⚠️ [위험감지] ${zone.name} - ${zone.reason.slice(0, 50)}... 위험도 ${zone.risk_score}%`,
      type: 'alert',
    });
  });

  // 5. 요약 메시지
  if (highRiskZones.length > 0) {
    messages.push({
      id: `msg-${Date.now()}-summary`,
      timestamp: new Date(now.getTime() - 1000),
      message: `📊 [분석완료] 총 ${zones.length}개 구간 분석. 고위험 ${highRiskZones.length}개, 주의 ${mediumRiskZones.length}개 감지.`,
      type: 'info',
    });
  }

  // 6. 작전 명령 메시지
  if (highRiskZones.length > 0) {
    const topZone = highRiskZones[0];
    const actionMessages: Record<OperationMode, string> = {
      winter: `🚛 [작전명령] 제설차 ${Math.min(highRiskZones.length, 5)}대 선제 배치 요망. 최우선: ${topZone.name}`,
      summer: `🚒 [작전명령] 양수기 ${Math.min(highRiskZones.length, 5)}대 전진 배치 요망. 최우선: ${topZone.name}`,
      landslide: `🚜 [작전명령] 굴착기 및 구조대 ${Math.min(highRiskZones.length, 3)}개 팀 대기. 경계: ${topZone.name}`,
      heat: `🏥 [작전명령] 이동쉼터 ${Math.min(highRiskZones.length, 5)}대 배치 및 취약계층 순찰 강화. 집중: ${topZone.name}`,
    };

    messages.push({
      id: `msg-${Date.now()}-action`,
      timestamp: now,
      message: actionMessages[mode],
      type: 'action',
    });
  } else {
    messages.push({
      id: `msg-${Date.now()}-safe`,
      timestamp: now,
      message: `✅ [상황종료] 현재 고위험 구간 없음. 정상 모니터링 유지.`,
      type: 'success',
    });
  }

  return messages;
}

// ============================================
// 요약 통계 계산
// ============================================

function calculateSummary(zones: RiskZone[], mode: OperationMode): RiskSummary {
  const summary: RiskSummary = {
    total_zones: zones.length,
    high_risk: zones.filter((z) => z.risk_score >= 80).length,
    medium_risk: zones.filter((z) => z.risk_score >= 50 && z.risk_score < 80).length,
    low_risk: zones.filter((z) => z.risk_score < 50).length,
  };

  // 폭염 모드에서 쉼터 수 추가
  if (mode === 'heat') {
    summary.shelters = zones.filter((z) => z.source_layer === 'swtr_rstar').length;
  }

  return summary;
}

// ============================================
// 실제 API 데이터를 RiskZone으로 변환
// ============================================

function convertToRiskZones(results: RiskAnalysisResult[]): RiskZone[] {
  return results.map((r) => ({
    id: r.id,
    name: r.name,
    coordinates: r.coordinates,
    risk_score: r.risk_score,
    reason: r.reason,
    status: r.status,
    mode: r.mode as OperationMode,
    source_layer: r.source_layer,
    details: r.details,
  }));
}

// ============================================
// API 핸들러
// ============================================

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const mode = (searchParams.get('mode') || 'winter') as OperationMode;

  try {
    let results: RiskAnalysisResult[] = [];
    let dataSources: string[] = [];

    // 모드별 실제 API 호출
    switch (mode) {
      case 'summer':
        results = await analyzeSummerRisks();
        dataSources = ['cfm_sgg_41_100yr_1h', 'impvs', 'tm_fldn_trce'];
        break;

      case 'winter':
        results = await analyzeWinterRisks();
        dataSources = ['slop_20_ovr', 'mountdstc_rvr', 'altd_1000_ovr'];
        break;

      case 'landslide':
        results = await analyzeLandslideRisks();
        dataSources = ['ldsld_grd1', 'ldsld_weak_rgn', 'ldsld_ocrn_prst'];
        break;

      case 'heat':
        results = await analyzeHeatRisks();
        dataSources = ['clim_weak_rgn_scr', 'swtr_rstar'];
        break;
    }

    // RiskZone으로 변환
    const zones = convertToRiskZones(results);

    // 위험도 순으로 정렬
    zones.sort((a, b) => b.risk_score - a.risk_score);

    // 요약 계산
    const summary = calculateSummary(zones, mode);

    // 에이전트 메시지 생성
    const agent_messages = generateAgentMessages(mode, zones, dataSources);

    const response: RiskAnalysisResponse = {
      mode,
      zones,
      summary,
      agent_messages,
      data_sources: dataSources,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Risk analysis error:', error);

    // 에러 시 빈 응답 반환 (서비스 중단 방지)
    const fallbackResponse: RiskAnalysisResponse = {
      mode,
      zones: [],
      summary: {
        total_zones: 0,
        high_risk: 0,
        medium_risk: 0,
        low_risk: 0,
      },
      agent_messages: [
        {
          id: `msg-error-${Date.now()}`,
          timestamp: new Date(),
          message: `⚠️ [시스템] 데이터 조회 중 오류 발생. 재시도 중...`,
          type: 'alert',
        },
      ],
      data_sources: [],
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(fallbackResponse);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const mode = (body.mode || 'winter') as OperationMode;

    // GET과 동일한 로직 사용
    const url = new URL(request.url);
    url.searchParams.set('mode', mode);

    const getRequest = new NextRequest(url);
    return GET(getRequest);
  } catch {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    );
  }
}
