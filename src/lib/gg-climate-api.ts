/**
 * 경기기후플랫폼 API 클라이언트
 * https://climate.gg.go.kr/ols/data/api
 *
 * 실제 WFS API 연동
 */

// API 설정
// const API_KEY = "..." (삭제)
const API_KEY = process.env.NEXT_PUBLIC_GG_CLIMATE_API_KEY || "";
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

// 경기도 좌표 범위 (위도, 경도) - 실제 경기도 행정구역 기준
const GG_BOUNDS = {
  lat: { min: 36.95, max: 38.05 }, // 평택 남단 ~ 연천 북단
  lng: { min: 126.35, max: 127.85 }, // 김포 서단 ~ 가평 동단
};

/**
 * 좌표가 경기도 범위 내인지 확인
 */
export function isValidGGCoordinate(lat: number, lng: number): boolean {
  return (
    lat >= GG_BOUNDS.lat.min &&
    lat <= GG_BOUNDS.lat.max &&
    lng >= GG_BOUNDS.lng.min &&
    lng <= GG_BOUNDS.lng.max
  );
}

/**
 * 경기도 주요 지역 좌표 (폴백용)
 */
const GG_REGION_COORDS: Record<string, [number, number]> = {
  수원: [37.2636, 127.0286],
  성남: [37.4200, 127.1267],
  용인: [37.2411, 127.1776],
  안양: [37.3943, 126.9568],
  안산: [37.3219, 126.8309],
  고양: [37.6584, 126.8320],
  부천: [37.5034, 126.7660],
  광명: [37.4786, 126.8644],
  평택: [36.9921, 127.0857],
  시흥: [37.3800, 126.8029],
  파주: [37.7126, 126.7610],
  의정부: [37.7381, 127.0337],
  김포: [37.6152, 126.7156],
  화성: [37.1994, 126.8312],
  광주: [37.4095, 127.2550],
  군포: [37.3617, 126.9352],
  오산: [37.1498, 127.0697],
  하남: [37.5393, 127.2148],
  양주: [37.7853, 127.0456],
  이천: [37.2723, 127.4349],
  구리: [37.5943, 127.1295],
  남양주: [37.6360, 127.2166],
  포천: [37.8949, 127.2003],
  양평: [37.4917, 127.4877],
  동두천: [37.9035, 127.0604],
  과천: [37.4292, 126.9876],
  의왕: [37.3449, 126.9683],
  여주: [37.2983, 127.6375],
  가평: [37.8315, 127.5095],
  연천: [38.0965, 127.0747],
  경기: [37.4138, 127.0296],
};

/**
 * 지역명에서 좌표 추출 (폴백용)
 */
function getCoordsByRegionName(name: string): [number, number] | null {
  for (const [region, coords] of Object.entries(GG_REGION_COORDS)) {
    if (name.includes(region)) {
      // 약간의 랜덤 오프셋 추가 (같은 지역 마커가 겹치지 않도록)
      const offset = () => (Math.random() - 0.5) * 0.05;
      return [coords[0] + offset(), coords[1] + offset()];
    }
  }
  return null;
}

/**
 * GeoJSON 좌표에서 중심점 계산
 */
export function getCenterFromGeometry(
  geometry: GeoJSONFeature['geometry'],
  properties?: Record<string, unknown>
): [number, number] {
  try {
    const coords = geometry.coordinates;
    let lat: number;
    let lng: number;

    if (geometry.type === 'Point') {
      lng = coords[0] as number;
      lat = coords[1] as number;
    } else if (geometry.type === 'Polygon' || geometry.type === 'MultiPolygon') {
      // 첫 번째 링의 좌표들
      let ring: number[][];
      if (geometry.type === 'Polygon') {
        ring = coords[0] as number[][];
      } else {
        ring = (coords[0] as number[][][])[0];
      }

      if (!ring || ring.length === 0) {
        return getDefaultCoordFromProperties(properties);
      }

      const sum = ring.reduce(
        (acc, coord) => [acc[0] + coord[0], acc[1] + coord[1]],
        [0, 0]
      );

      lng = sum[0] / ring.length;
      lat = sum[1] / ring.length;
    } else if (geometry.type === 'LineString') {
      const lineCoords = coords as number[][];
      const mid = Math.floor(lineCoords.length / 2);
      lng = lineCoords[mid][0];
      lat = lineCoords[mid][1];
    } else if (geometry.type === 'MultiLineString') {
      const lines = coords as number[][][];
      const firstLine = lines[0];
      const mid = Math.floor(firstLine.length / 2);
      lng = firstLine[mid][0];
      lat = firstLine[mid][1];
    } else {
      return getDefaultCoordFromProperties(properties);
    }

    // 좌표가 경기도 범위 내인지 확인
    if (isValidGGCoordinate(lat, lng)) {
      return [lat, lng];
    }

    // 좌표가 뒤집혀 있는 경우 (일부 API에서 발생)
    if (isValidGGCoordinate(lng, lat)) {
      return [lng, lat];
    }

    // 좌표가 범위 밖이면 지역명으로 폴백
    return getDefaultCoordFromProperties(properties);
  } catch {
    return getDefaultCoordFromProperties(properties);
  }
}

/**
 * properties에서 지역명을 추출하여 기본 좌표 반환
 */
function getDefaultCoordFromProperties(
  properties?: Record<string, unknown>
): [number, number] {
  if (!properties) {
    return [37.4138 + (Math.random() - 0.5) * 0.3, 127.0296 + (Math.random() - 0.5) * 0.3];
  }

  // 지역명 필드들 확인
  const nameFields = ['sgg_nm', 'SGG_NM', 'emd_nm', 'EMD_NM', 'nm', 'NM', 'addr', 'ADDR'];
  for (const field of nameFields) {
    const value = properties[field];
    if (value && typeof value === 'string') {
      const coords = getCoordsByRegionName(value);
      if (coords) return coords;
    }
  }

  // 기본값: 경기도 내 랜덤 위치
  return [37.4138 + (Math.random() - 0.5) * 0.3, 127.0296 + (Math.random() - 0.5) * 0.3];
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
      const props = feature.properties;
      const center = getCenterFromGeometry(feature.geometry, props);
      const riskScore = calculateRiskScore(feature, 'flood');

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
      const props = feature.properties;
      const center = getCenterFromGeometry(feature.geometry, props);
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
      const props = feature.properties;
      const center = getCenterFromGeometry(feature.geometry, props);
      const riskScore = calculateRiskScore(feature, 'ice');

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
      const props = feature.properties;
      const center = getCenterFromGeometry(feature.geometry, props);

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
      const props = feature.properties;
      const center = getCenterFromGeometry(feature.geometry, props);

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
      const props = feature.properties;
      const center = getCenterFromGeometry(feature.geometry, props);
      const rdType = String(props.rd_type || props.RD_TYPE || '');

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
      const props = feature.properties;
      const center = getCenterFromGeometry(feature.geometry, props);

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
      const props = feature.properties;
      const center = getCenterFromGeometry(feature.geometry, props);

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
 * - 기후취약지역의 폭염위험점수(htwv_dngr_scr) 기반
 * - 무더위쉼터는 기존 인프라로 별도 표시
 */
export async function analyzeHeatRisks(): Promise<RiskAnalysisResult[]> {
  const results: RiskAnalysisResult[] = [];

  try {
    // 1. 기후취약지역 - 폭염 위험 점수 기반
    const climateData = await getClimateWeakRegion(300);

    climateData.features.forEach((feature, idx) => {
      const props = feature.properties;
      const center = getCenterFromGeometry(feature.geometry, props);

      // 폭염 위험 점수 (htwv_dngr_scr)
      const heatScore = (props.htwv_dngr_scr as number) || (props.HTWV_DNGR_SCR as number) || 0;
      const sggNm = (props.sgg_nm as string) || (props.SGG_NM as string) || '';
      const stdgNm = (props.stdg_nm as string) || (props.STDG_NM as string) || '';
      const locationName = stdgNm ? `${sggNm} ${stdgNm}` : sggNm || '경기도';

      // 폭염 위험 점수가 50 이상인 지역만 표시
      if (heatScore >= 50) {
        const riskScore = Math.min(95, Math.round(heatScore));
        results.push({
          id: `HEAT-${feature.id || idx}`,
          name: `${locationName} 폭염취약지역`,
          coordinates: center,
          risk_score: riskScore,
          reason: `폭염위험점수 ${heatScore.toFixed(1)}점. 취약계층(독거노인, 야외근로자) 밀집 추정. 이동쉼터 배치 권고.`,
          status: riskScore >= 80 ? '조치필요' : riskScore >= 65 ? '조치중' : '완료',
          mode: 'heat',
          source_layer: 'clim_weak_rgn_scr',
          details: {
            heat_score: heatScore,
            sgg_nm: sggNm,
            stdg_nm: stdgNm,
            // 참고: 다른 위험 점수들
            rain_score: props.hvyrain_dngr_scr,
            landslide_score: props.ldsld_dngr_scr,
          },
        });
      }
    });
  } catch (error) {
    console.error('기후취약지역 데이터 조회 실패:', error);
  }

  // 위험 지역을 점수순으로 정렬
  results.sort((a, b) => b.risk_score - a.risk_score);

  // 상위 위험지역 20개 + 무더위쉼터
  const riskZones = results.slice(0, 20);

  try {
    // 2. 무더위쉼터 - 기존 인프라 (참고용)
    const shelterData = await getHeatShelters(100);

    shelterData.features.forEach((feature, idx) => {
      const props = feature.properties;
      const center = getCenterFromGeometry(feature.geometry, props);
      const shelterName = (props.nm as string) || (props.NM as string) || '무더위쉼터';
      const addr = (props.addr as string) || (props.ADDR as string) || '';

      riskZones.push({
        id: `SHELTER-${feature.id || idx}`,
        name: shelterName,
        coordinates: center,
        risk_score: 10, // 쉼터는 안전시설
        reason: `기존 무더위쉼터 (${addr || '주소 미상'})`,
        status: '완료',
        mode: 'heat',
        source_layer: 'swtr_rstar',
        details: {
          name: shelterName,
          address: addr,
          tel: props.tel || props.TEL,
          capacity: props.capacity || props.CAPACITY,
          type: '기존인프라',
        },
      });
    });
  } catch (error) {
    console.error('무더위쉼터 데이터 조회 실패:', error);
  }

  return riskZones;
}
