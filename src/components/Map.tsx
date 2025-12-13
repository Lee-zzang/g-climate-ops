'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, Polygon } from 'react-leaflet';
import { RiskZone, OperationMode, MODE_INFO } from '@/types';
import 'leaflet/dist/leaflet.css';

interface MapProps {
  zones: RiskZone[];
  mode: OperationMode;
  onZoneClick?: (zone: RiskZone) => void;
}

// 모드별 색상 팔레트
const MODE_COLORS: Record<OperationMode, { high: string; medium: string; low: string; safe: string }> = {
  winter: {
    high: '#a855f7',   // purple-500
    medium: '#c084fc', // purple-400
    low: '#e9d5ff',    // purple-200
    safe: '#22c55e',   // green-500
  },
  summer: {
    high: '#3b82f6',   // blue-500
    medium: '#60a5fa', // blue-400
    low: '#bfdbfe',    // blue-200
    safe: '#22c55e',
  },
  landslide: {
    high: '#f97316',   // orange-500
    medium: '#fb923c', // orange-400
    low: '#fed7aa',    // orange-200
    safe: '#22c55e',
  },
  heat: {
    high: '#ef4444',   // red-500
    medium: '#f87171', // red-400
    low: '#fecaca',    // red-200
    safe: '#06b6d4',   // cyan-500 (쉼터)
  },
};

export default function Map({ zones, mode, onZoneClick }: MapProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="w-full h-full bg-slate-900 flex items-center justify-center">
        <div className="text-slate-400 animate-pulse">지도 로딩 중...</div>
      </div>
    );
  }

  // 경기도 중심 좌표
  const center: [number, number] = [37.4138, 127.0296];

  const getMarkerColor = (riskScore: number, zoneMode: OperationMode) => {
    const colors = MODE_COLORS[zoneMode] || MODE_COLORS[mode];
    if (riskScore >= 80) return colors.high;
    if (riskScore >= 50) return colors.medium;
    if (riskScore < 30) return colors.safe;
    return colors.low;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case '조치필요':
        return 'bg-red-500/20 text-red-400 border-red-500/50';
      case '조치중':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
      case '완료':
        return 'bg-green-500/20 text-green-400 border-green-500/50';
      default:
        return 'bg-slate-500/20 text-slate-400';
    }
  };

  const modeInfo = MODE_INFO[mode];

  return (
    <MapContainer
      center={center}
      zoom={10}
      className="w-full h-full"
      style={{ background: '#0f172a' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://carto.com/">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      />

      {zones.map((zone) => {
        const markerColor = getMarkerColor(zone.risk_score, zone.mode);
        const isShelter = zone.source_layer === 'swtr_rstar';

        return (
          <CircleMarker
            key={zone.id}
            center={zone.coordinates}
            radius={isShelter ? 8 : Math.max(8, zone.risk_score / 6)}
            pathOptions={{
              color: markerColor,
              fillColor: markerColor,
              fillOpacity: isShelter ? 0.8 : 0.5,
              weight: isShelter ? 3 : 2,
            }}
            eventHandlers={{
              click: () => onZoneClick?.(zone),
            }}
          >
            <Popup className="risk-popup">
              <div className="bg-slate-800 text-white p-3 rounded-lg min-w-[280px] -m-3">
                {/* Header */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{modeInfo.icon}</span>
                    <span className="text-xs font-mono text-slate-400">{zone.id}</span>
                  </div>
                  <span
                    className={`text-xs px-2 py-0.5 rounded border ${getStatusBadge(zone.status)}`}
                  >
                    {zone.status}
                  </span>
                </div>

                {/* Name */}
                <h3 className="font-bold text-sm mb-1">{zone.name}</h3>

                {/* Reason */}
                <p className="text-xs text-slate-300 mb-3">{zone.reason}</p>

                {/* Risk Score Bar */}
                {!isShelter && (
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs text-slate-400">위험도</span>
                    <div className="flex-1 bg-slate-700 rounded-full h-2">
                      <div
                        className="h-2 rounded-full transition-all"
                        style={{
                          width: `${zone.risk_score}%`,
                          backgroundColor: markerColor,
                        }}
                      />
                    </div>
                    <span className="text-sm font-bold" style={{ color: markerColor }}>
                      {zone.risk_score}%
                    </span>
                  </div>
                )}

                {/* Details */}
                <div className="text-xs text-slate-400 space-y-1 border-t border-slate-700 pt-2">
                  {zone.details.sgg_nm ? <div>시군구: {String(zone.details.sgg_nm)}</div> : null}
                  {zone.details.grid_code !== undefined ? (
                    <div>침수깊이등급: {String(zone.details.grid_code)}</div>
                  ) : null}
                  {zone.details.impervious_rate !== undefined ? (
                    <div>불투수면율: {String(zone.details.impervious_rate)}%</div>
                  ) : null}
                  {zone.details.slope !== undefined ? (
                    <div>경사도: {String(zone.details.slope)}°</div>
                  ) : null}
                  {zone.details.river_name ? (
                    <div>하천명: {String(zone.details.river_name)}</div>
                  ) : null}
                  {zone.details.emd_nm ? <div>읍면동: {String(zone.details.emd_nm)}</div> : null}
                  {zone.details.climate_score !== undefined ? (
                    <div>기후취약점수: {String(zone.details.climate_score)}</div>
                  ) : null}
                  {zone.details.address ? <div>주소: {String(zone.details.address)}</div> : null}
                  {zone.details.tel ? <div>연락처: {String(zone.details.tel)}</div> : null}
                  {zone.details.capacity !== undefined ? (
                    <div>수용인원: {String(zone.details.capacity)}명</div>
                  ) : null}
                  <div className="text-slate-500 mt-1">
                    출처: {zone.source_layer}
                  </div>
                </div>
              </div>
            </Popup>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
}
