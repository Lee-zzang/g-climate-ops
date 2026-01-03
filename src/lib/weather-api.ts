/**
 * 기상청 API 연동
 * 실시간 기상 데이터 및 기상특보 조회
 */

// 공공데이터포털 기상청 API
const KMA_API_KEY = process.env.NEXT_PUBLIC_KMA_API_KEY || '';
const KMA_BASE_URL = 'https://apis.data.go.kr/1360000';

// 경기도 대표 관측 지점 (수원)
const SUWON_GRID = { nx: 60, ny: 121 }; // 수원 격자 좌표

export interface CurrentWeather {
  temperature: number;      // 현재 기온 (°C)
  humidity: number;         // 습도 (%)
  precipitation: number;    // 강수량 (mm)
  precipitationType: '없음' | '비' | '눈' | '비/눈' | '소나기';
  windSpeed: number;        // 풍속 (m/s)
  sky: '맑음' | '구름많음' | '흐림';
  timestamp: Date;
}

export interface WeatherAlert {
  type: string;             // 특보 종류
  region: string;           // 대상 지역
  severity: 'watch' | 'warning' | 'advisory';
  startTime: Date;
  endTime?: Date;
}

export interface WeatherCondition {
  current: CurrentWeather;
  alerts: WeatherAlert[];
  recommendedMode: 'winter' | 'summer' | 'landslide' | 'heat' | null;
  modeReasons: {
    winter: { active: boolean; reason: string };
    summer: { active: boolean; reason: string };
    landslide: { active: boolean; reason: string };
    heat: { active: boolean; reason: string };
  };
}

/**
 * 기상청 초단기실황 API 호출
 */
async function fetchUltraShortTermForecast(): Promise<CurrentWeather | null> {
  if (!KMA_API_KEY) {
    console.warn('기상청 API 키가 설정되지 않았습니다.');
    return null;
  }

  const now = new Date();
  const baseDate = now.toISOString().slice(0, 10).replace(/-/g, '');

  // 정시 기준 (API는 매시 30분에 업데이트)
  let baseTime = now.getHours();
  if (now.getMinutes() < 30) {
    baseTime = baseTime - 1;
  }
  if (baseTime < 0) baseTime = 23;
  const baseTimeStr = String(baseTime).padStart(2, '0') + '00';

  try {
    const params = new URLSearchParams({
      serviceKey: KMA_API_KEY,
      numOfRows: '10',
      pageNo: '1',
      dataType: 'JSON',
      base_date: baseDate,
      base_time: baseTimeStr,
      nx: String(SUWON_GRID.nx),
      ny: String(SUWON_GRID.ny),
    });

    const response = await fetch(
      `${KMA_BASE_URL}/VilageFcstInfoService_2.0/getUltraSrtNcst?${params}`
    );

    if (!response.ok) {
      throw new Error(`API 호출 실패: ${response.status}`);
    }

    const data = await response.json();
    const items = data.response?.body?.items?.item || [];

    const weather: Partial<CurrentWeather> = {
      timestamp: now,
    };

    items.forEach((item: { category: string; obsrValue: string }) => {
      switch (item.category) {
        case 'T1H': // 기온
          weather.temperature = parseFloat(item.obsrValue);
          break;
        case 'REH': // 습도
          weather.humidity = parseFloat(item.obsrValue);
          break;
        case 'RN1': // 1시간 강수량
          weather.precipitation = parseFloat(item.obsrValue) || 0;
          break;
        case 'PTY': // 강수형태 (0=없음, 1=비, 2=비/눈, 3=눈, 4=소나기)
          const pty = parseInt(item.obsrValue);
          weather.precipitationType =
            pty === 1 ? '비' :
            pty === 2 ? '비/눈' :
            pty === 3 ? '눈' :
            pty === 4 ? '소나기' : '없음';
          break;
        case 'WSD': // 풍속
          weather.windSpeed = parseFloat(item.obsrValue);
          break;
      }
    });

    return weather as CurrentWeather;
  } catch (error) {
    console.error('기상청 API 호출 실패:', error);
    return null;
  }
}

/**
 * 기상특보 조회 (현재 발효 중인 특보)
 */
async function fetchWeatherAlerts(): Promise<WeatherAlert[]> {
  if (!KMA_API_KEY) {
    return [];
  }

  try {
    const params = new URLSearchParams({
      serviceKey: KMA_API_KEY,
      numOfRows: '10',
      pageNo: '1',
      dataType: 'JSON',
      stnId: '108', // 수원 관측소
    });

    const response = await fetch(
      `${KMA_BASE_URL}/WthrWrnInfoService/getWthrWrnList?${params}`
    );

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    const items = data.response?.body?.items?.item || [];

    return items.map((item: { title: string; tmFc: string; tmEf: string }) => ({
      type: item.title,
      region: '경기도',
      severity: item.title.includes('경보') ? 'warning' : 'watch',
      startTime: new Date(item.tmFc),
      endTime: item.tmEf ? new Date(item.tmEf) : undefined,
    }));
  } catch (error) {
    console.error('기상특보 조회 실패:', error);
    return [];
  }
}

/**
 * 현재 날씨 기반 추천 모드 판단
 */
function determineRecommendedMode(
  weather: CurrentWeather,
  alerts: WeatherAlert[]
): WeatherCondition['modeReasons'] {
  const temp = weather.temperature;
  const precip = weather.precipitation;
  const precipType = weather.precipitationType;

  const modeReasons: WeatherCondition['modeReasons'] = {
    winter: { active: false, reason: '' },
    summer: { active: false, reason: '' },
    landslide: { active: false, reason: '' },
    heat: { active: false, reason: '' },
  };

  // 결빙 조건: 기온 3도 이하 또는 눈
  if (temp <= 3 || precipType === '눈' || precipType === '비/눈') {
    modeReasons.winter.active = true;
    modeReasons.winter.reason =
      temp <= 0
        ? `현재 기온 ${temp}°C로 결빙 위험. 블랙아이스 주의.`
        : `현재 기온 ${temp}°C, ${precipType} 예상. 결빙 가능성 있음.`;
  } else {
    modeReasons.winter.reason = `현재 기온 ${temp}°C로 결빙 조건 미충족`;
  }

  // 침수 조건: 시간당 강수량 10mm 이상 또는 호우특보
  const hasRainAlert = alerts.some(a =>
    a.type.includes('호우') || a.type.includes('대설')
  );
  if (precip >= 10 || hasRainAlert) {
    modeReasons.summer.active = true;
    modeReasons.summer.reason =
      precip >= 30
        ? `시간당 ${precip}mm 폭우. 저지대 침수 위험.`
        : `시간당 ${precip}mm 강우 중. 침수 대비 필요.`;
  } else if (precipType === '비' || precipType === '소나기') {
    modeReasons.summer.reason = `현재 ${precipType}, 강수량 ${precip}mm로 침수 위험 낮음`;
  } else {
    modeReasons.summer.reason = '강수 없음, 침수 조건 미충족';
  }

  // 산사태 조건: 누적 강수량 많거나 산사태 특보
  const hasLandslideAlert = alerts.some(a => a.type.includes('산사태'));
  if (hasLandslideAlert || precip >= 20) {
    modeReasons.landslide.active = true;
    modeReasons.landslide.reason = '집중호우로 산사태 위험 증가';
  } else {
    modeReasons.landslide.reason = '산사태 조건 미충족';
  }

  // 폭염 조건: 기온 33도 이상 또는 폭염특보
  const hasHeatAlert = alerts.some(a => a.type.includes('폭염'));
  if (temp >= 33 || hasHeatAlert) {
    modeReasons.heat.active = true;
    modeReasons.heat.reason =
      temp >= 35
        ? `현재 기온 ${temp}°C 폭염. 온열질환 주의.`
        : `현재 기온 ${temp}°C. 폭염 주의.`;
  } else {
    modeReasons.heat.reason = `현재 기온 ${temp}°C로 폭염 조건 미충족`;
  }

  return modeReasons;
}

/**
 * 현재 기상 조건 조회 (메인 함수)
 */
export async function getCurrentWeatherCondition(): Promise<WeatherCondition> {
  // API 호출
  const weather = await fetchUltraShortTermForecast();
  const alerts = await fetchWeatherAlerts();

  // API 실패 시 현재 날짜 기반 Mock 데이터 사용
  const now = new Date();
  const month = now.getMonth() + 1;

  const mockWeather: CurrentWeather = weather || {
    temperature: month >= 12 || month <= 2 ? -3 : month >= 6 && month <= 8 ? 32 : 15,
    humidity: 50,
    precipitation: 0,
    precipitationType: '없음',
    windSpeed: 3,
    sky: '맑음',
    timestamp: now,
  };

  // 현재 1월이면 겨울 날씨로 Mock
  if (!weather && (month === 12 || month === 1 || month === 2)) {
    mockWeather.temperature = -3 + Math.random() * 5 - 2; // -5 ~ 0도
    mockWeather.precipitationType = Math.random() > 0.7 ? '눈' : '없음';
  }

  const modeReasons = determineRecommendedMode(mockWeather, alerts);

  // 우선순위: 산사태 > 침수 > 폭염 > 결빙
  let recommendedMode: WeatherCondition['recommendedMode'] = null;
  if (modeReasons.landslide.active) recommendedMode = 'landslide';
  else if (modeReasons.summer.active) recommendedMode = 'summer';
  else if (modeReasons.heat.active) recommendedMode = 'heat';
  else if (modeReasons.winter.active) recommendedMode = 'winter';

  return {
    current: mockWeather,
    alerts,
    recommendedMode,
    modeReasons,
  };
}

/**
 * 특정 모드가 현재 날씨 조건에 맞는지 확인
 */
export function isModeActiveForWeather(
  mode: 'winter' | 'summer' | 'landslide' | 'heat',
  condition: WeatherCondition
): boolean {
  return condition.modeReasons[mode].active;
}
