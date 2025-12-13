/**
 * 경기기후플랫폼 API 클라이언트
 * https://climate.gg.go.kr/ols/data/api
 *
 * 실제 WFS API 연동
 */

// API 설정
const API_KEY = "4c58df36-82b2-40b2-b360-6450cca44b1e";
const BASE_URL = "https://climate.gg.go.kr/ols/api/geoserver/wfs";

// ============================================
// 타입 정의
// ============================================

export interface GeoJSONFeature {
  type: "Feature";
  id: string;
  geometry: {
    type: string;
    coordinates: number[] | number[][] | number[][][] | number[][][][];
  };
  properties: Record<string, unknown>;
}

export interface GeoJSONResponse {
  type: "FeatureCollection";
  totalFeatures: number;
  features: GeoJSONFeature[];
  numberMatched: number;
  numberReturned: number;
}

// 레이어별 속성 타입
export interface FloodMapProperties {
  uid?: string;
  gid?: number;
  grid_code?: number; // 침수 깊이 등급
  sgg_cd?: string;
  sgg_nm?: string;
  area?: number;
}

export interface LandslideProperties {
  gid?: number;
  bjcd?: string;
  emd_nm?: string;
  sgg_nm?: string;
  area?: number;
  grade?: number;
  risk_level?: string;
}

export interface SlopeProperties {
  gid?: number;
  slope_deg?: number;
  area?: number;
}

export interface RoadProperties {
  gid?: number;
  rd_nm?: string;
  rd_type?: string;
  length?: number;
}

export interface ImpervProperties {
  gid?: number;
  impvs_rate?: number;
  area?: number;
}

export interface RiverProperties {
  gid?: number;
  river_nm?: string;
  river_type?: string;
}

export interface HeatShelterProperties {
  gid?: number;
  nm?: string;
  addr?: string;
  tel?: string;
  capacity?: number;
}

export interface CarbonProperties {
  gid?: number;
  bldg_nm?: string;
  carbon_amt?: number;
  year?: number;
}

// ============================================
// 기본 API 호출 함수
// ============================================

async function fetchWFS<T = GeoJSONResponse>(
  typeName: string,
  maxFeatures: number = 100,
  additionalParams: Record<string, string> = {}
): Promise<T> {
  const params = new URLSearchParams({
    apiKey: API_KEY,
    service: "WFS",
    version: "1.1.0",
    request: "GetFeature",
    typeName,
    outputFormat: "application/json",
    maxFeatures: String(maxFeatures),
    srsName: "EPSG:4326", // WGS84로 변환 요청
    ...additionalParams,
  });

  const response = await fetch(`${BASE_URL}?${params}`);

  if (!response.ok) {
    throw new Error(`API 호출 실패: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

// CQL 필터를 사용한 조회
async function fetchWFSWithFilter<T = GeoJSONResponse>(
  typeName: string,
  cqlFilter: string,
  maxFeatures: number = 100
): Promise<T> {
  return fetchWFS<T>(typeName, maxFeatures, { CQL_FILTER: cqlFilter });
}

// ============================================
// 침수 관련 API
// ============================================

/**
 * 도시침수지도 조회
 * @param returnPeriod 재현빈도 (30, 50, 80, 100, 500년)
 * @param duration 지속시간 (1, 2, 3시간)
 */
export async function getFloodMap(
  returnPeriod: 30 | 50 | 80 | 100 | 500 = 100,
  duration: 1 | 2 | 3 = 1,
  maxFeatures: number = 500
): Promise<GeoJSONResponse> {
  const paddedPeriod = String(returnPeriod).padStart(3, '0');
  const layerName = `cfm_sgg_41_${paddedPeriod}yr_${duration}h`;
  return fetchWFS(layerName, maxFeatures);
}

/**
 * 홍수범람추적 데이터
 */
export async function getFloodTrace(maxFeatures: number = 200): Promise<GeoJSONResponse> {
  return fetchWFS("tm_fldn_trce", maxFeatures);
}

/**
 * 불투수면 데이터
 */
export async function getImperviousSurface(maxFeatures: number = 300): Promise<GeoJSONResponse> {
  return fetchWFS("impvs", maxFeatures);
}

/**
 * 소하천구역 데이터
 */
export async function getSmallRivers(maxFeatures: number = 200): Promise<GeoJSONResponse> {
  return fetchWFS("uj301_41", maxFeatures);
}

/**
 * 국가하천망 데이터
 */
export async function getNationalRivers(maxFeatures: number = 200): Promise<GeoJSONResponse> {
  return fetchWFS("ntn_rvr", maxFeatures);
}

// ============================================
// 산사태 관련 API
// ============================================

/**
 * 산사태 1등급 구역
 */
export async function getLandslideGrade1(maxFeatures: number = 300): Promise<GeoJSONResponse> {
  return fetchWFS("ldsld_grd1", maxFeatures);
}

/**
 * 산사태 취약지역
 */
export async function getLandslideWeakRegion(maxFeatures: number = 300): Promise<GeoJSONResponse> {
  return fetchWFS("ldsld_weak_rgn", maxFeatures);
}

/**
 * 산사태 이력현황
 */
export async function getLandslideHistory(maxFeatures: number = 200): Promise<GeoJSONResponse> {
  return fetchWFS("ldsld_ocrn_prst", maxFeatures);
}

// ============================================
// 결빙 관련 API (간접 데이터)
// ============================================

/**
 * 경사도 20도 이상 지역
 */
export async function getSteepSlope(maxFeatures: number = 300): Promise<GeoJSONResponse> {
  return fetchWFS("slop_20_ovr", maxFeatures);
}

/**
 * 고도 1000m 이상 지역
 */
export async function getHighAltitude(maxFeatures: number = 200): Promise<GeoJSONResponse> {
  return fetchWFS("altd_1000_ovr", maxFeatures);
}

/**
 * 도로 데이터
 */
export async function getRoads(maxFeatures: number = 500): Promise<GeoJSONResponse> {
  return fetchWFS("sprd_rw_41", maxFeatures);
}

/**
 * 산지하천 (음지 추정용)
 */
export async function getMountainRivers(maxFeatures: number = 200): Promise<GeoJSONResponse> {
  return fetchWFS("mountdstc_rvr", maxFeatures);
}

// ============================================
// 폭염 관련 API
// ============================================

/**
 * 기후취약지역 스코어
 */
export async function getClimateWeakRegion(maxFeatures: number = 300): Promise<GeoJSONResponse> {
  return fetchWFS("clim_weak_rgn_scr", maxFeatures);
}

/**
 * 무더위쉼터 데이터
 */
export async function getHeatShelters(maxFeatures: number = 500): Promise<GeoJSONResponse> {
  return fetchWFS("swtr_rstar", maxFeatures);
}

// ============================================
// 탄소/건물 관련 API
// ============================================

/**
 * 건물 전기 탄소배출량
 */
export async function getBuildingElecCarbon(maxFeatures: number = 300): Promise<GeoJSONResponse> {
  return fetchWFS("bldg_elpwr_cbn_ehqty", maxFeatures);
}

/**
 * 건물 가스 탄소배출량
 */
export async function getBuildingGasCarbon(maxFeatures: number = 300): Promise<GeoJSONResponse> {
  return fetchWFS("bldg_gas_cbn_ehqty", maxFeatures);
}

/**
 * 건물 난방 탄소배출량
 */
export async function getBuildingHeatingCarbon(maxFeatures: number = 300): Promise<GeoJSONResponse> {
  return fetchWFS("bldg_hetng_cbn_ehqty", maxFeatures);
}

/**
 * 산림 탄소흡수량
 */
export async function getForestCarbonAbsorption(maxFeatures: number = 200): Promise<GeoJSONResponse> {
  return fetchWFS("forest_cbn_abpvl", maxFeatures);
}

// ============================================
// 생태/환경 관련 API
// ============================================

/**
 * 비오톱 유형 평가 (5등급)
 */
export async function getBiotopType5(maxFeatures: number = 300): Promise<GeoJSONResponse> {
  return fetchWFS("biotop_type_evl_5grd", maxFeatures);
}

/**
 * 비오톱 유형 평가 (7등급)
 */
export async function getBiotopType7(maxFeatures: number = 300): Promise<GeoJSONResponse> {
  return fetchWFS("biotop_type_evl_7grd", maxFeatures);
}

/**
 * 생태계서비스 스코어
 */
export async function getEcosystemServiceScore(maxFeatures: number = 200): Promise<GeoJSONResponse> {
  return fetchWFS("ecosys_srvc_scr", maxFeatures);
}

/**
 * 생태자연도 1등급 및 별도관리지역
 */
export async function getEcoGrade1(maxFeatures: number = 200): Promise<GeoJSONResponse> {
  return fetchWFS("eco1_mgmt_area", maxFeatures);
}

// ============================================
// 범용 레이어 조회
// ============================================

/**
 * 레이어명으로 직접 조회
 */
export async function getLayer(
  layerName: string,
  maxFeatures: number = 100
): Promise<GeoJSONResponse> {
  return fetchWFS(layerName, maxFeatures);
}

/**
 * CQL 필터로 레이어 조회
 */
export async function getLayerWithFilter(
  layerName: string,
  cqlFilter: string,
  maxFeatures: number = 100
): Promise<GeoJSONResponse> {
  return fetchWFSWithFilter(layerName, cqlFilter, maxFeatures);
}

// ============================================
// 유틸리티 함수
// ============================================

/**
 * GeoJSON 좌표에서 중심점 계산
 */
export function getCenterFromGeometry(geometry: GeoJSONFeature['geometry']): [number, number] {
  try {
    const coords = geometry.coordinates;

    if (geometry.type === 'Point') {
      return [coords[1] as number, coords[0] as number]; // [lat, lng]
    }

    if (geometry.type === 'Polygon' || geometry.type === 'MultiPolygon') {
      // 첫 번째 링의 좌표들
      let ring: number[][];
      if (geometry.type === 'Polygon') {
        ring = coords[0] as number[][];
      } else {
        ring = (coords[0] as number[][][])[0];
      }

      if (!ring || ring.length === 0) return [37.4, 127.0];

      const sum = ring.reduce(
        (acc, coord) => [acc[0] + coord[0], acc[1] + coord[1]],
        [0, 0]
      );

      return [sum[1] / ring.length, sum[0] / ring.length]; // [lat, lng]
    }

    if (geometry.type === 'LineString') {
      const lineCoords = coords as number[][];
      const mid = Math.floor(lineCoords.length / 2);
      return [lineCoords[mid][1], lineCoords[mid][0]];
    }

    return [37.4, 127.0]; // 경기도 중심 기본값
  } catch {
    return [37.4, 127.0];
  }
}

/**
 * 폴리곤 면적 계산 (간단한 근사)
 */
export function calculateArea(geometry: GeoJSONFeature['geometry']): number {
  try {
    if (geometry.type !== 'Polygon' && geometry.type !== 'MultiPolygon') {
      return 0;
    }

    // 속성에서 면적이 있으면 그걸 사용
    return 0;
  } catch {
    return 0;
  }
}

/**
 * 위험도 점수 계산 (레이어별 커스텀 로직)
 */
export function calculateRiskScore(
  feature: GeoJSONFeature,
  layerType: 'flood' | 'landslide' | 'ice' | 'heat'
): number {
  const props = feature.properties;

  switch (layerType) {
    case 'flood':
      // 침수 깊이 등급 기반
      const gridCode = props.grid_code as number || props.GRID_CODE as number || 0;
      if (gridCode >= 4) return 95;
      if (gridCode >= 3) return 85;
      if (gridCode >= 2) return 70;
      return 50;

    case 'landslide':
      // 등급 기반
      const grade = props.grade as number || props.GRADE as number || 1;
      if (grade === 1) return 95;
      if (grade === 2) return 80;
      return 60;

    case 'ice':
      // 경사도 기반
      const slope = props.slope_deg as number || props.SLOPE_DEG as number || 20;
      if (slope >= 30) return 95;
      if (slope >= 25) return 85;
      if (slope >= 20) return 75;
      return 60;

    case 'heat':
      // 취약 점수 기반
      const score = props.score as number || props.SCORE as number || 50;
      return Math.min(100, score);

    default:
      return 50;
  }
}

// ============================================
// 데이터 조합 함수
// ============================================

export interface RiskAnalysisResult {
  id: string;
  name: string;
  coordinates: [number, number];
  risk_score: number;
  reason: string;
  status: '조치필요' | '조치중' | '완료';
  mode: 'winter' | 'summer' | 'landslide' | 'heat';
  source_layer: string;
  details: Record<string, unknown>;
  raw_feature?: GeoJSONFeature;
}

/**
 * 여름 모드 위험 분석 (침수)
 */
export async function analyzeSummerRisks(): Promise<RiskAnalysisResult[]> {
  const results: RiskAnalysisResult[] = [];

  try {
    // 1. 도시침수지도 100년빈도 조회
    const floodData = await getFloodMap(100, 1, 200);

    floodData.features.forEach((feature, idx) => {
      const center = getCenterFromGeometry(feature.geometry);
      const riskScore = calculateRiskScore(feature, 'flood');
      const props = feature.properties;

      if (riskScore >= 50) {
        results.push({
          id: `FLOOD-${feature.id || idx}`,
          name: `${props.sgg_nm || props.SGG_NM || '경기도'} 침수위험구역`,
          coordinates: center,
          risk_score: riskScore,
          reason: `100년빈도 호우 시 침수예상지역 (깊이등급: ${props.grid_code || props.GRID_CODE || 'N/A'})`,
          status: riskScore >= 80 ? '조치필요' : '조치중',
          mode: 'summer',
          source_layer: 'cfm_sgg_41_100yr_1h',
          details: {
            grid_code: props.grid_code || props.GRID_CODE,
            area: props.area || props.AREA,
            sgg_nm: props.sgg_nm || props.SGG_NM,
          },
        });
      }
    });
  } catch (error) {
    console.error('침수 데이터 조회 실패:', error);
  }

  try {
    // 2. 불투수면 데이터 조회
    const impervData = await getImperviousSurface(100);

    impervData.features.forEach((feature, idx) => {
      const center = getCenterFromGeometry(feature.geometry);
      const props = feature.properties;
      const impvRate = (props.impvs_rate as number) || (props.IMPVS_RATE as number) || 0;

      if (impvRate >= 80) {
        results.push({
          id: `IMPERV-${feature.id || idx}`,
          name: `불투수면 밀집구역`,
          coordinates: center,
          risk_score: Math.min(95, 50 + impvRate * 0.5),
          reason: `불투수면 비율 ${impvRate}% - 배수 불량 예상`,
          status: impvRate >= 90 ? '조치필요' : '조치중',
          mode: 'summer',
          source_layer: 'impvs',
          details: {
            impervious_rate: impvRate,
          },
        });
      }
    });
  } catch (error) {
    console.error('불투수면 데이터 조회 실패:', error);
  }

  return results.slice(0, 20); // 상위 20개
}

/**
 * 겨울 모드 위험 분석 (결빙)
 */
export async function analyzeWinterRisks(): Promise<RiskAnalysisResult[]> {
  const results: RiskAnalysisResult[] = [];

  try {
    // 1. 경사도 20도 이상 지역
    const slopeData = await getSteepSlope(200);

    slopeData.features.forEach((feature, idx) => {
      const center = getCenterFromGeometry(feature.geometry);
      const riskScore = calculateRiskScore(feature, 'ice');
      const props = feature.properties;

      results.push({
        id: `ICE-SLOPE-${feature.id || idx}`,
        name: `급경사 결빙위험구간`,
        coordinates: center,
        risk_score: riskScore,
        reason: `경사도 20도 이상 급경사 구간 - 결빙 시 미끄러짐 위험`,
        status: riskScore >= 80 ? '조치필요' : '조치중',
        mode: 'winter',
        source_layer: 'slop_20_ovr',
        details: {
          slope: props.slope_deg || props.SLOPE_DEG || 20,
          area: props.area || props.AREA,
        },
      });
    });
  } catch (error) {
    console.error('경사도 데이터 조회 실패:', error);
  }

  try {
    // 2. 고도 1000m 이상 지역 (고지대 결빙)
    const altitudeData = await getHighAltitude(150);

    altitudeData.features.forEach((feature, idx) => {
      const center = getCenterFromGeometry(feature.geometry);
      const props = feature.properties;

      results.push({
        id: `ICE-ALT-${feature.id || idx}`,
        name: `고지대 결빙위험구역`,
        coordinates: center,
        risk_score: 88,
        reason: `고도 1000m 이상 고지대 - 기온 저하로 결빙 위험 높음`,
        status: '조치필요',
        mode: 'winter',
        source_layer: 'altd_1000_ovr',
        details: {
          altitude: props.altitude || props.ALTITUDE || 1000,
          area: props.area || props.AREA,
        },
      });
    });
  } catch (error) {
    console.error('고도 데이터 조회 실패:', error);
  }

  try {
    // 3. 산지하천 인접 (음지 추정)
    const riverData = await getMountainRivers(100);

    riverData.features.forEach((feature, idx) => {
      const center = getCenterFromGeometry(feature.geometry);
      const props = feature.properties;

      results.push({
        id: `ICE-RIVER-${feature.id || idx}`,
        name: `산지하천 인접 음지구간`,
        coordinates: center,
        risk_score: 78,
        reason: `산지하천 인접 - 습기 및 그늘로 결빙 위험`,
        status: '조치중',
        mode: 'winter',
        source_layer: 'mountdstc_rvr',
        details: {
          river_name: props.river_nm || props.RIVER_NM,
        },
      });
    });
  } catch (error) {
    console.error('산지하천 데이터 조회 실패:', error);
  }

  try {
    // 4. 주요 도로 (결빙 관리 대상)
    const roadData = await getRoads(100);

    roadData.features.forEach((feature, idx) => {
      const center = getCenterFromGeometry(feature.geometry);
      const props = feature.properties;
      const rdType = props.rd_type || props.RD_TYPE || '';

      // 고속도로, 국도만 필터링
      if (rdType.includes('고속') || rdType.includes('국도')) {
        results.push({
          id: `ICE-ROAD-${feature.id || idx}`,
          name: `${props.rd_nm || props.RD_NM || '주요도로'} 결빙주의`,
          coordinates: center,
          risk_score: 72,
          reason: `주요 간선도로 - 교통량 많아 결빙 시 대형사고 위험`,
          status: '조치중',
          mode: 'winter',
          source_layer: 'sprd_rw_41',
          details: {
            road_name: props.rd_nm || props.RD_NM,
            road_type: rdType,
            length: props.length || props.LENGTH,
          },
        });
      }
    });
  } catch (error) {
    console.error('도로 데이터 조회 실패:', error);
  }

  return results.slice(0, 25);
}

/**
 * 산사태 모드 위험 분석
 */
export async function analyzeLandslideRisks(): Promise<RiskAnalysisResult[]> {
  const results: RiskAnalysisResult[] = [];

  try {
    // 1. 산사태 1등급 구역
    const grade1Data = await getLandslideGrade1(200);

    grade1Data.features.forEach((feature, idx) => {
      const center = getCenterFromGeometry(feature.geometry);
      const props = feature.properties;

      results.push({
        id: `LANDSLIDE-G1-${feature.id || idx}`,
        name: `${props.sgg_nm || props.SGG_NM || ''} 산사태 1등급구역`,
        coordinates: center,
        risk_score: 95,
        reason: `산사태 위험 1등급 지정구역 - 최우선 경계 대상`,
        status: '조치필요',
        mode: 'landslide',
        source_layer: 'ldsld_grd1',
        details: {
          sgg_nm: props.sgg_nm || props.SGG_NM,
          emd_nm: props.emd_nm || props.EMD_NM,
        },
      });
    });
  } catch (error) {
    console.error('산사태 1등급 데이터 조회 실패:', error);
  }

  try {
    // 2. 산사태 취약지역
    const weakData = await getLandslideWeakRegion(100);

    weakData.features.forEach((feature, idx) => {
      const center = getCenterFromGeometry(feature.geometry);
      const props = feature.properties;

      results.push({
        id: `LANDSLIDE-WEAK-${feature.id || idx}`,
        name: `산사태 취약지역`,
        coordinates: center,
        risk_score: 82,
        reason: `산사태 취약지역 지정 - 집중호우 시 주의`,
        status: '조치중',
        mode: 'landslide',
        source_layer: 'ldsld_weak_rgn',
        details: props,
      });
    });
  } catch (error) {
    console.error('산사태 취약지역 데이터 조회 실패:', error);
  }

  return results.slice(0, 20);
}

/**
 * 폭염 모드 위험 분석
 */
export async function analyzeHeatRisks(): Promise<RiskAnalysisResult[]> {
  const results: RiskAnalysisResult[] = [];

  try {
    // 1. 기후취약지역 스코어
    const climateData = await getClimateWeakRegion(200);

    climateData.features.forEach((feature, idx) => {
      const center = getCenterFromGeometry(feature.geometry);
      const props = feature.properties;
      const score = (props.score as number) || (props.SCORE as number) || 50;

      if (score >= 60) {
        results.push({
          id: `HEAT-WEAK-${feature.id || idx}`,
          name: `기후취약지역`,
          coordinates: center,
          risk_score: Math.min(95, score),
          reason: `기후취약 점수 ${score}점 - 폭염 시 취약계층 주의`,
          status: score >= 80 ? '조치필요' : '조치중',
          mode: 'heat',
          source_layer: 'clim_weak_rgn_scr',
          details: {
            climate_score: score,
          },
        });
      }
    });
  } catch (error) {
    console.error('기후취약지역 데이터 조회 실패:', error);
  }

  try {
    // 2. 무더위쉼터 (대피소)
    const shelterData = await getHeatShelters(300);

    shelterData.features.forEach((feature, idx) => {
      const center = getCenterFromGeometry(feature.geometry);
      const props = feature.properties;

      results.push({
        id: `SHELTER-${feature.id || idx}`,
        name: props.nm as string || props.NM as string || '무더위쉼터',
        coordinates: center,
        risk_score: 20, // 쉼터는 안전지역
        reason: `무더위 대피소 - 주소: ${props.addr || props.ADDR || '정보없음'}`,
        status: '완료',
        mode: 'heat',
        source_layer: 'swtr_rstar',
        details: {
          name: props.nm || props.NM,
          address: props.addr || props.ADDR,
          tel: props.tel || props.TEL,
          capacity: props.capacity || props.CAPACITY,
        },
      });
    });
  } catch (error) {
    console.error('무더위쉼터 데이터 조회 실패:', error);
  }

  return results.slice(0, 30);
}
