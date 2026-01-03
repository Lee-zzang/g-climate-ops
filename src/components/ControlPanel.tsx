'use client';

import { OperationMode, MODE_INFO, RiskSummary } from '@/types';
import {
  Snowflake,
  Waves,
  Mountain,
  Flame,
  AlertTriangle,
  CheckCircle,
  Clock,
  Home,
  Database,
  CloudSun,
  ThermometerSun,
} from 'lucide-react';
import type { WeatherCondition } from '@/lib/weather-api';

interface ControlPanelProps {
  mode: OperationMode;
  onModeChange: (mode: OperationMode) => void;
  summary: RiskSummary;
  isLoading: boolean;
  dataSources?: string[];
  weatherCondition?: WeatherCondition | null;
}

// 모드별 아이콘 컴포넌트
const ModeIcon = ({ mode, className }: { mode: OperationMode; className?: string }) => {
  const icons = {
    winter: Snowflake,
    summer: Waves,
    landslide: Mountain,
    heat: Flame,
  };
  const Icon = icons[mode];
  return <Icon className={className} />;
};

// 모드별 색상 클래스
const getModeColors = (mode: OperationMode, isActive: boolean) => {
  const colors = {
    winter: isActive
      ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/30'
      : 'text-purple-400 hover:text-white hover:bg-purple-500/20',
    summer: isActive
      ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
      : 'text-blue-400 hover:text-white hover:bg-blue-500/20',
    landslide: isActive
      ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30'
      : 'text-orange-400 hover:text-white hover:bg-orange-500/20',
    heat: isActive
      ? 'bg-red-500 text-white shadow-lg shadow-red-500/30'
      : 'text-red-400 hover:text-white hover:bg-red-500/20',
  };
  return colors[mode];
};

const getAccentColor = (mode: OperationMode) => {
  const colors = {
    winter: 'text-purple-400 border-purple-500/30 bg-purple-500/10',
    summer: 'text-blue-400 border-blue-500/30 bg-blue-500/10',
    landslide: 'text-orange-400 border-orange-500/30 bg-orange-500/10',
    heat: 'text-red-400 border-red-500/30 bg-red-500/10',
  };
  return colors[mode];
};

// 모드-날씨 매핑
const modeWeatherMap: Record<OperationMode, keyof WeatherCondition['modeReasons']> = {
  winter: 'winter',
  summer: 'summer',
  landslide: 'landslide',
  heat: 'heat',
};

export default function ControlPanel({
  mode,
  onModeChange,
  summary,
  isLoading,
  dataSources = [],
  weatherCondition,
}: ControlPanelProps) {
  const modeInfo = MODE_INFO[mode];
  const modes: OperationMode[] = ['winter', 'summer', 'landslide', 'heat'];

  // 현재 날씨 정보
  const currentTemp = weatherCondition?.current?.temperature;
  const currentSky = weatherCondition?.current?.sky;
  const currentPrecipType = weatherCondition?.current?.precipitationType;

  return (
    <div className="bg-slate-900/90 backdrop-blur border-b border-slate-700/50 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Logo & Title */}
        <div className="flex items-center gap-4">
          <div className={`p-2 rounded-lg ${getAccentColor(mode).split(' ')[2]}`}>
            <ModeIcon mode={mode} className={`w-8 h-8 ${getAccentColor(mode).split(' ')[0]}`} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">G-Climate Ops</h1>
            <p className="text-sm text-slate-400">기후 재난 작전 통제실</p>
          </div>
        </div>

        {/* Mode Switch - 4 Modes */}
        <div className="flex items-center gap-1 bg-slate-800 rounded-lg p-1">
          {modes.map((m) => {
            const info = MODE_INFO[m];
            const isActive = mode === m;
            const weatherKey = modeWeatherMap[m];
            const modeReason = weatherCondition?.modeReasons?.[weatherKey];
            const isWeatherActive = modeReason?.active ?? false;

            return (
              <button
                key={m}
                onClick={() => onModeChange(m)}
                className={`relative flex items-center gap-2 px-3 py-2 rounded-md transition-all ${getModeColors(m, isActive)}`}
                title={modeReason?.reason || '날씨 정보 없음'}
              >
                <ModeIcon mode={m} className="w-4 h-4" />
                <span className="font-medium text-sm">{info.labelEn}</span>
                <span className="text-xs opacity-70 hidden lg:inline">{info.label}</span>

                {/* 날씨 조건 상태 표시 */}
                {weatherCondition && (
                  <span
                    className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-slate-800 ${
                      isWeatherActive ? 'bg-green-500' : 'bg-slate-500'
                    }`}
                    title={isWeatherActive ? '현재 조건 충족' : '조건 미충족'}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Stats */}
        <div className="flex items-center gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-white">
              {isLoading ? '...' : summary.total_zones}
            </div>
            <div className="text-xs text-slate-400">탐지 구간</div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              <div>
                <div className="text-lg font-bold text-red-400">
                  {isLoading ? '-' : summary.high_risk}
                </div>
                <div className="text-xs text-slate-500">위험</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-yellow-400" />
              <div>
                <div className="text-lg font-bold text-yellow-400">
                  {isLoading ? '-' : summary.medium_risk}
                </div>
                <div className="text-xs text-slate-500">주의</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <div>
                <div className="text-lg font-bold text-green-400">
                  {isLoading ? '-' : summary.low_risk}
                </div>
                <div className="text-xs text-slate-500">안전</div>
              </div>
            </div>

            {/* 폭염 모드에서 쉼터 표시 */}
            {mode === 'heat' && summary.shelters !== undefined && (
              <div className="flex items-center gap-2 border-l border-slate-700 pl-4">
                <Home className="w-4 h-4 text-cyan-400" />
                <div>
                  <div className="text-lg font-bold text-cyan-400">
                    {isLoading ? '-' : summary.shelters}
                  </div>
                  <div className="text-xs text-slate-500">쉼터</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sub Header - Operation Mode Description */}
      <div className={`mt-4 p-3 rounded-lg border ${getAccentColor(mode)}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`w-2 h-2 rounded-full animate-pulse`}
              style={{
                backgroundColor:
                  mode === 'winter'
                    ? '#a855f7'
                    : mode === 'summer'
                    ? '#3b82f6'
                    : mode === 'landslide'
                    ? '#f97316'
                    : '#ef4444',
              }}
            />
            <span className={`text-sm font-medium ${getAccentColor(mode).split(' ')[0]}`}>
              <strong>작전 목표:</strong> {modeInfo.description} → {modeInfo.vehicle} 배치
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* 현재 날씨 표시 */}
            {weatherCondition && (
              <div className="flex items-center gap-3 px-3 py-1 bg-slate-800/50 rounded-lg">
                <ThermometerSun className="w-4 h-4 text-slate-400" />
                <span className="text-sm text-slate-300">
                  {currentTemp !== undefined ? `${currentTemp.toFixed(1)}°C` : '--'}
                </span>
                <span className="text-xs text-slate-500">
                  {currentSky || ''} {currentPrecipType !== '없음' ? `/ ${currentPrecipType}` : ''}
                </span>

                {/* 현재 모드 조건 충족 여부 */}
                {weatherCondition.modeReasons[modeWeatherMap[mode]] && (
                  <span
                    className={`ml-2 px-2 py-0.5 rounded text-xs font-medium ${
                      weatherCondition.modeReasons[modeWeatherMap[mode]].active
                        ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                        : 'bg-slate-600/30 text-slate-400 border border-slate-600/30'
                    }`}
                  >
                    {weatherCondition.modeReasons[modeWeatherMap[mode]].active
                      ? '⚡ 조건 충족'
                      : '조건 미충족'}
                  </span>
                )}
              </div>
            )}

            {/* 데이터 소스 표시 */}
            {dataSources.length > 0 && (
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Database className="w-3 h-3" />
                <span>
                  {dataSources.slice(0, 2).join(', ')}
                  {dataSources.length > 2 && ` 외 ${dataSources.length - 2}개`}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* 현재 모드 조건 상세 설명 */}
        {weatherCondition?.modeReasons[modeWeatherMap[mode]] && (
          <div className="mt-2 text-xs text-slate-400">
            <CloudSun className="w-3 h-3 inline mr-1" />
            {weatherCondition.modeReasons[modeWeatherMap[mode]].reason}
          </div>
        )}
      </div>
    </div>
  );
}
