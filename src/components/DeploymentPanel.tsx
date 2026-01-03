'use client';

import { useState } from 'react';
import { OperationMode, MODE_INFO, RiskZone } from '@/types';
import { Vehicle } from '@/types/advisor';
import {
  DeploymentSuggestion,
  DeploymentSummary,
  generateDeploymentSuggestions,
  getDeploymentSummary,
} from '@/lib/ai-advisor';
import {
  Bot,
  MapPin,
  Clock,
  Truck,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  Zap,
  Navigation,
} from 'lucide-react';

interface DeploymentPanelProps {
  mode: OperationMode;
  zones: RiskZone[];
  vehicles: Vehicle[];
  onDispatch?: (suggestion: DeploymentSuggestion) => void;
}

export default function DeploymentPanel({
  mode,
  zones,
  vehicles,
  onDispatch,
}: DeploymentPanelProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const modeInfo = MODE_INFO[mode];

  const suggestions = generateDeploymentSuggestions(mode, zones, vehicles);
  const summary = getDeploymentSummary(mode, zones, vehicles);

  const getModeColor = () => {
    switch (mode) {
      case 'winter': return { main: 'purple', bg: 'bg-purple-500', text: 'text-purple-400', border: 'border-purple-500' };
      case 'summer': return { main: 'blue', bg: 'bg-blue-500', text: 'text-blue-400', border: 'border-blue-500' };
      case 'landslide': return { main: 'orange', bg: 'bg-orange-500', text: 'text-orange-400', border: 'border-orange-500' };
      case 'heat': return { main: 'red', bg: 'bg-red-500', text: 'text-red-400', border: 'border-red-500' };
    }
  };

  const color = getModeColor();

  const getPriorityStyle = (priority: DeploymentSuggestion['priority']) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-500/20 text-red-400 border-red-500/50';
      case 'high':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/50';
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
    }
  };

  const getPriorityLabel = (priority: DeploymentSuggestion['priority']) => {
    switch (priority) {
      case 'critical': return '긴급';
      case 'high': return '높음';
      case 'medium': return '보통';
    }
  };

  return (
    <div className="bg-slate-900/80 backdrop-blur border border-slate-700 rounded-lg overflow-hidden">
      {/* Header */}
      <div className={`p-3 ${color.bg}/10 border-b border-slate-700`}>
        <div className="flex items-center gap-2">
          <Bot className={`w-5 h-5 ${color.text}`} />
          <h3 className={`text-sm font-bold ${color.text}`}>AI 배치 건의</h3>
        </div>
        <p className="text-[10px] text-slate-400 mt-1">
          위험 지역과 장비 위치 분석 기반 최적 배치안
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-2 p-3 border-b border-slate-700">
        <div className="text-center">
          <div className="text-lg font-bold text-white">{summary.criticalZonesCount}</div>
          <div className="text-[10px] text-slate-400">고위험 구역</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-green-400">{summary.availableVehicles}</div>
          <div className="text-[10px] text-slate-400">가용 장비</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-yellow-400">{summary.avgResponseTime}분</div>
          <div className="text-[10px] text-slate-400">평균 대응</div>
        </div>
      </div>

      {/* Suggestions List */}
      <div className="max-h-[300px] overflow-y-auto">
        {suggestions.length === 0 ? (
          <div className="p-4 text-center text-slate-400 text-sm">
            <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-400" />
            <p>현재 긴급 배치가 필요한 구역이 없습니다.</p>
          </div>
        ) : (
          suggestions.map((suggestion, idx) => {
            const isExpanded = expandedId === suggestion.id;
            return (
              <div
                key={suggestion.id}
                className="border-b border-slate-700/50 last:border-0"
              >
                {/* Suggestion Header */}
                <button
                  onClick={() => setExpandedId(isExpanded ? null : suggestion.id)}
                  className="w-full p-3 text-left hover:bg-slate-800/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2">
                      <span className={`flex-shrink-0 w-5 h-5 rounded-full ${color.bg} text-white text-xs flex items-center justify-center font-bold`}>
                        {idx + 1}
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs px-1.5 py-0.5 rounded border ${getPriorityStyle(suggestion.priority)}`}>
                            {getPriorityLabel(suggestion.priority)}
                          </span>
                          <span className="text-xs text-slate-300 font-medium">
                            {suggestion.targetZone.name.slice(0, 15)}
                            {suggestion.targetZone.name.length > 15 ? '...' : ''}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-[10px] text-slate-400">
                          <span className="flex items-center gap-1">
                            <Truck className="w-3 h-3" />
                            {suggestion.vehicle.name}
                          </span>
                          <span className="flex items-center gap-1">
                            <Navigation className="w-3 h-3" />
                            {suggestion.distance}km
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {suggestion.estimatedArrival}분
                          </span>
                        </div>
                      </div>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                </button>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="px-3 pb-3 space-y-3">
                    {/* Reason */}
                    <div className="bg-slate-800/50 rounded p-2 text-xs text-slate-300">
                      <div className="flex items-start gap-2">
                        <Bot className={`w-4 h-4 ${color.text} flex-shrink-0 mt-0.5`} />
                        <p>{suggestion.reason}</p>
                      </div>
                    </div>

                    {/* Alternative Vehicles */}
                    {suggestion.alternativeVehicles && suggestion.alternativeVehicles.length > 0 && (
                      <div className="text-[10px]">
                        <div className="text-slate-500 mb-1">대안 장비:</div>
                        <div className="flex flex-wrap gap-1">
                          {suggestion.alternativeVehicles.map((alt) => (
                            <span
                              key={alt.id}
                              className="px-2 py-0.5 bg-slate-800 rounded text-slate-400"
                            >
                              {alt.name} ({alt.eta}분)
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Dispatch Button */}
                    <button
                      onClick={() => onDispatch?.(suggestion)}
                      className={`w-full py-2 rounded text-sm font-medium ${color.bg} text-white flex items-center justify-center gap-2 hover:opacity-90 transition-opacity`}
                    >
                      <Zap className="w-4 h-4" />
                      {suggestion.vehicle.name} 출동 지시
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* AI Recommendations Footer */}
      {summary.recommendations.length > 0 && (
        <div className="p-3 bg-slate-800/50 border-t border-slate-700">
          <div className="flex items-center gap-1 text-[10px] text-slate-500 mb-2">
            <AlertTriangle className="w-3 h-3" />
            AI 종합 건의
          </div>
          <div className="space-y-1">
            {summary.recommendations.map((rec, idx) => (
              <p key={idx} className="text-[10px] text-slate-400">
                {rec}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
