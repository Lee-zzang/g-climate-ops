'use client';

import { WeatherData, RiskPrediction } from '@/types/advisor';
import { OperationMode, MODE_INFO } from '@/types';
import {
  Cloud,
  Thermometer,
  Wind,
  Droplets,
  Eye,
  Sun,
  AlertTriangle,
  TrendingUp,
  Clock,
} from 'lucide-react';

interface WeatherPanelProps {
  weather: WeatherData | null;
  predictions: RiskPrediction[];
  mode: OperationMode;
}

export default function WeatherPanel({
  weather,
  predictions,
  mode,
}: WeatherPanelProps) {
  const modeInfo = MODE_INFO[mode];

  const getModeColors = () => {
    switch (mode) {
      case 'winter': return { bg: 'bg-purple-500', text: 'text-purple-400', border: 'border-purple-500/30' };
      case 'summer': return { bg: 'bg-blue-500', text: 'text-blue-400', border: 'border-blue-500/30' };
      case 'landslide': return { bg: 'bg-orange-500', text: 'text-orange-400', border: 'border-orange-500/30' };
      case 'heat': return { bg: 'bg-red-500', text: 'text-red-400', border: 'border-red-500/30' };
    }
  };

  const colors = getModeColors();

  if (!weather) {
    return (
      <div className={`bg-slate-900/80 backdrop-blur border ${colors.border} rounded-lg p-4`}>
        <div className="flex items-center gap-2 text-slate-400">
          <Cloud className="w-5 h-5 animate-pulse" />
          <span className="text-sm">기상 데이터 로딩중...</span>
        </div>
      </div>
    );
  }

  const maxPrediction = Math.max(...predictions.map(p => p.riskLevel));
  const peakHour = predictions.find(p => p.riskLevel === maxPrediction)?.hour || 0;

  return (
    <div className={`bg-slate-900/80 backdrop-blur border ${colors.border} rounded-lg overflow-hidden`}>
      {/* Header */}
      <div className={`${colors.bg}/20 border-b ${colors.border} px-4 py-3`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cloud className={`w-5 h-5 ${colors.text}`} />
            <span className={`font-bold ${colors.text}`}>기상 현황</span>
          </div>
          <span className="text-xs text-slate-500">{weather.location}</span>
        </div>
      </div>

      {/* Current Weather */}
      <div className="p-4 grid grid-cols-2 gap-3">
        <div className="bg-slate-800 rounded-lg p-3">
          <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
            <Thermometer className="w-3 h-3" />
            기온
          </div>
          <div className="text-2xl font-bold text-white">
            {weather.current.temperature}°C
          </div>
          <div className="text-xs text-slate-500">
            체감 {weather.current.feelsLike}°C
          </div>
        </div>

        <div className="bg-slate-800 rounded-lg p-3">
          <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
            <Droplets className="w-3 h-3" />
            {weather.current.precipitationType === '없음' ? '습도' : '강수'}
          </div>
          <div className="text-2xl font-bold text-white">
            {weather.current.precipitationType === '없음'
              ? `${weather.current.humidity}%`
              : `${weather.current.precipitation}mm`}
          </div>
          <div className="text-xs text-slate-500">
            {weather.current.precipitationType}
          </div>
        </div>

        <div className="bg-slate-800 rounded-lg p-3">
          <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
            <Wind className="w-3 h-3" />
            바람
          </div>
          <div className="text-lg font-bold text-white">
            {weather.current.windSpeed}m/s
          </div>
          <div className="text-xs text-slate-500">
            {weather.current.windDirection}
          </div>
        </div>

        <div className="bg-slate-800 rounded-lg p-3">
          <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
            <Eye className="w-3 h-3" />
            시정
          </div>
          <div className="text-lg font-bold text-white">
            {weather.current.visibility >= 1000
              ? `${(weather.current.visibility / 1000).toFixed(0)}km`
              : `${weather.current.visibility}m`}
          </div>
        </div>
      </div>

      {/* Weather Alert */}
      {weather.alerts.length > 0 && (
        <div className="px-4 pb-3">
          {weather.alerts.map((alert, idx) => (
            <div
              key={idx}
              className={`flex items-center gap-2 p-2 rounded text-xs ${
                alert.severity === 'emergency'
                  ? 'bg-red-500/20 text-red-400'
                  : alert.severity === 'warning'
                  ? 'bg-orange-500/20 text-orange-400'
                  : 'bg-yellow-500/20 text-yellow-400'
              }`}
            >
              <AlertTriangle className="w-4 h-4" />
              <span className="font-medium">{alert.title}</span>
            </div>
          ))}
        </div>
      )}

      {/* Risk Prediction Chart */}
      <div className="border-t border-slate-700 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className={`w-4 h-4 ${colors.text}`} />
            <span className="text-xs font-medium text-slate-400">위험도 예측</span>
          </div>
          <span className="text-xs text-slate-500">향후 6시간</span>
        </div>

        {/* Simple Bar Chart */}
        <div className="flex items-end gap-1 h-20 mb-2">
          {predictions.map((pred, idx) => {
            const height = (pred.riskLevel / 100) * 100;
            const isMax = pred.riskLevel === maxPrediction;
            return (
              <div
                key={idx}
                className="flex-1 flex flex-col items-center gap-1"
              >
                <div
                  className={`w-full rounded-t transition-all ${
                    isMax ? colors.bg : 'bg-slate-600'
                  }`}
                  style={{ height: `${height}%` }}
                />
              </div>
            );
          })}
        </div>

        {/* Time Labels */}
        <div className="flex gap-1 text-[10px] text-slate-500">
          {predictions.map((pred, idx) => (
            <div key={idx} className="flex-1 text-center">
              {idx === 0 ? '현재' : `+${pred.hour}h`}
            </div>
          ))}
        </div>

        {/* Peak Warning */}
        {peakHour > 0 && (
          <div className={`mt-3 flex items-center gap-2 p-2 rounded text-xs ${colors.bg}/20 ${colors.text}`}>
            <Clock className="w-3 h-3" />
            <span>
              {peakHour}시간 후 위험도 피크 예상 ({maxPrediction.toFixed(0)}%)
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
