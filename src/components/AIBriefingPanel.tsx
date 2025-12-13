'use client';

import { useState, useEffect } from 'react';
import { AIBriefing, AIRecommendation } from '@/types/advisor';
import { OperationMode, MODE_INFO } from '@/types';
import {
  Brain,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Minus,
  Zap,
  ChevronRight,
  Users,
  MapPin,
  Clock,
  CheckCircle,
} from 'lucide-react';

interface AIBriefingPanelProps {
  briefing: AIBriefing | null;
  mode: OperationMode;
  onExecuteRecommendation?: (rec: AIRecommendation) => void;
  isLoading?: boolean;
}

// 타이핑 효과
function TypewriterText({ text, speed = 20 }: { text: string; speed?: number }) {
  const [displayed, setDisplayed] = useState('');

  useEffect(() => {
    setDisplayed('');
    let i = 0;
    const timer = setInterval(() => {
      if (i < text.length) {
        setDisplayed(text.slice(0, i + 1));
        i++;
      } else {
        clearInterval(timer);
      }
    }, speed);
    return () => clearInterval(timer);
  }, [text, speed]);

  return <>{displayed}</>;
}

export default function AIBriefingPanel({
  briefing,
  mode,
  onExecuteRecommendation,
  isLoading,
}: AIBriefingPanelProps) {
  const modeInfo = MODE_INFO[mode];
  const [expandedRec, setExpandedRec] = useState<string | null>(null);

  const getModeColors = () => {
    switch (mode) {
      case 'winter': return { accent: 'purple', bg: 'bg-purple-500', text: 'text-purple-400', border: 'border-purple-500/30' };
      case 'summer': return { accent: 'blue', bg: 'bg-blue-500', text: 'text-blue-400', border: 'border-blue-500/30' };
      case 'landslide': return { accent: 'orange', bg: 'bg-orange-500', text: 'text-orange-400', border: 'border-orange-500/30' };
      case 'heat': return { accent: 'red', bg: 'bg-red-500', text: 'text-red-400', border: 'border-red-500/30' };
    }
  };

  const colors = getModeColors();

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'worsening': return <TrendingUp className="w-4 h-4 text-red-400" />;
      case 'improving': return <TrendingDown className="w-4 h-4 text-green-400" />;
      default: return <Minus className="w-4 h-4 text-yellow-400" />;
    }
  };

  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500/20 border-red-500/50 text-red-400';
      case 'high': return 'bg-orange-500/20 border-orange-500/50 text-orange-400';
      case 'medium': return 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400';
      default: return 'bg-slate-500/20 border-slate-500/50 text-slate-400';
    }
  };

  if (isLoading || !briefing) {
    return (
      <div className={`bg-slate-900/80 backdrop-blur border ${colors.border} rounded-lg p-4`}>
        <div className="flex items-center gap-2 mb-4">
          <Brain className={`w-5 h-5 ${colors.text} animate-pulse`} />
          <span className={`font-bold ${colors.text}`}>AI 참모 분석 중...</span>
        </div>
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-4 bg-slate-700 rounded animate-pulse" style={{ width: `${100 - i * 20}%` }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-slate-900/80 backdrop-blur border ${colors.border} rounded-lg overflow-hidden`}>
      {/* Header */}
      <div className={`${colors.bg}/20 border-b ${colors.border} px-4 py-3`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className={`w-5 h-5 ${colors.text}`} />
            <span className={`font-bold ${colors.text}`}>AI 참모 브리핑</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Clock className="w-3 h-3" />
            {briefing.timestamp.toLocaleTimeString('ko-KR')}
          </div>
        </div>
      </div>

      {/* 상황 요약 */}
      <div className="p-4 border-b border-slate-700">
        <p className="text-sm text-slate-300 leading-relaxed">
          <TypewriterText text={briefing.situationSummary} speed={15} />
        </p>
      </div>

      {/* 핵심 지표 */}
      <div className="grid grid-cols-4 gap-2 p-4 border-b border-slate-700 bg-slate-800/30">
        <div className="text-center">
          <div className="text-xl font-bold text-white">{briefing.keyMetrics.totalRiskZones}</div>
          <div className="text-[10px] text-slate-500">탐지 구간</div>
        </div>
        <div className="text-center">
          <div className="text-xl font-bold text-red-400">{briefing.keyMetrics.criticalZones}</div>
          <div className="text-[10px] text-slate-500">고위험</div>
        </div>
        <div className="text-center">
          <div className="text-xl font-bold text-yellow-400">{briefing.keyMetrics.deployedResources}</div>
          <div className="text-[10px] text-slate-500">투입 장비</div>
        </div>
        <div className="text-center">
          <div className="text-xl font-bold text-cyan-400">
            {(briefing.keyMetrics.estimatedAffectedPopulation / 1000).toFixed(0)}K
          </div>
          <div className="text-[10px] text-slate-500">영향 인구</div>
        </div>
      </div>

      {/* 예상 시나리오 */}
      <div className="p-4 border-b border-slate-700">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-medium text-slate-400">예측 시나리오</span>
          <div className="flex items-center gap-1">
            {getTrendIcon(briefing.forecast.trend)}
            <span className={`text-xs ${
              briefing.forecast.trend === 'worsening' ? 'text-red-400' :
              briefing.forecast.trend === 'improving' ? 'text-green-400' : 'text-yellow-400'
            }`}>
              {briefing.forecast.trend === 'worsening' ? '악화 예상' :
               briefing.forecast.trend === 'improving' ? '호전 예상' : '현상 유지'}
            </span>
          </div>
        </div>
        <div className="space-y-2 text-xs">
          <div className="flex gap-2">
            <span className="text-slate-500 w-16 shrink-0">단기</span>
            <span className="text-slate-300">{briefing.forecast.shortTerm}</span>
          </div>
          <div className="flex gap-2">
            <span className="text-slate-500 w-16 shrink-0">중기</span>
            <span className="text-slate-300">{briefing.forecast.midTerm}</span>
          </div>
        </div>
      </div>

      {/* AI 추천 조치 */}
      <div className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Zap className={`w-4 h-4 ${colors.text}`} />
          <span className="text-xs font-medium text-slate-400">AI 추천 조치</span>
        </div>
        <div className="space-y-2">
          {briefing.recommendations.map((rec, idx) => (
            <div
              key={rec.id}
              className={`border rounded-lg overflow-hidden transition-all ${getPriorityStyle(rec.priority)}`}
            >
              <button
                onClick={() => setExpandedRec(expandedRec === rec.id ? null : rec.id)}
                className="w-full flex items-center gap-2 p-2 text-left"
              >
                <span className="text-xs font-bold w-5">{idx + 1}</span>
                <span className="flex-1 text-xs">{rec.action}</span>
                <ChevronRight
                  className={`w-4 h-4 transition-transform ${
                    expandedRec === rec.id ? 'rotate-90' : ''
                  }`}
                />
              </button>

              {expandedRec === rec.id && (
                <div className="px-3 pb-3 space-y-2 text-xs border-t border-slate-600/50 pt-2">
                  <div className="text-slate-400">
                    <strong>근거:</strong> {rec.reason}
                  </div>
                  {rec.resourceType && (
                    <div className="text-slate-400">
                      <strong>투입:</strong> {rec.resourceType} {rec.resourceCount}대
                    </div>
                  )}
                  <div className="text-green-400">
                    <strong>예상 효과:</strong> {rec.estimatedImpact}
                  </div>
                  <button
                    onClick={() => onExecuteRecommendation?.(rec)}
                    className={`w-full mt-2 py-2 rounded ${colors.bg} text-white text-xs font-medium hover:opacity-90 transition-opacity`}
                  >
                    <CheckCircle className="w-3 h-3 inline mr-1" />
                    실행
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
