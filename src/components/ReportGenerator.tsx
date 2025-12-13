'use client';

import { useState } from 'react';
import { SituationReport } from '@/types/advisor';
import { OperationMode, MODE_INFO } from '@/types';
import {
  FileText,
  Download,
  Send,
  Printer,
  ChevronDown,
  ChevronUp,
  Clock,
  MapPin,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react';

interface ReportGeneratorProps {
  report: SituationReport | null;
  mode: OperationMode;
  onDownload?: () => void;
  onSubmit?: () => void;
}

export default function ReportGenerator({
  report,
  mode,
  onDownload,
  onSubmit,
}: ReportGeneratorProps) {
  const [isExpanded, setIsExpanded] = useState(false);
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

  if (!report) {
    return (
      <div className={`bg-slate-900/80 backdrop-blur border ${colors.border} rounded-lg p-4`}>
        <div className="flex items-center gap-2 text-slate-400">
          <FileText className="w-5 h-5" />
          <span className="text-sm">보고서 생성 대기중...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-slate-900/80 backdrop-blur border ${colors.border} rounded-lg overflow-hidden`}>
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`w-full ${colors.bg}/20 border-b ${colors.border} px-4 py-3`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className={`w-5 h-5 ${colors.text}`} />
            <span className={`font-bold ${colors.text}`}>상황 보고서</span>
            <span className="text-xs px-2 py-0.5 bg-green-500/20 text-green-400 rounded">
              자동 생성
            </span>
          </div>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          )}
        </div>
      </button>

      {/* Preview (Always visible) */}
      <div className="p-4 border-b border-slate-700">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-bold text-white text-sm">{report.title}</h4>
          <span className="text-xs text-slate-500">
            {report.createdAt.toLocaleString('ko-KR')}
          </span>
        </div>
        <p className="text-xs text-slate-400 line-clamp-2">
          {report.executiveSummary}
        </p>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="p-4 space-y-4 text-sm max-h-96 overflow-y-auto">
          {/* 상황 개요 */}
          <section>
            <h5 className="font-medium text-slate-300 mb-2 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-yellow-400" />
              상황 개요
            </h5>
            <div className="bg-slate-800 rounded p-3 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">발생시각</span>
                <span className="text-slate-300">
                  {report.situationOverview.startTime.toLocaleString('ko-KR')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">현재상태</span>
                <span className="text-red-400 font-medium">
                  {report.situationOverview.currentStatus}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">영향지역</span>
                <span className="text-slate-300">
                  {report.situationOverview.affectedAreas.join(', ')}
                </span>
              </div>
            </div>
          </section>

          {/* 대응 현황 */}
          <section>
            <h5 className="font-medium text-slate-300 mb-2 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              대응 현황
            </h5>
            <div className="bg-slate-800 rounded p-3 space-y-3 text-xs">
              <div>
                <div className="text-slate-500 mb-1">완료 조치</div>
                <ul className="space-y-1">
                  {report.responseStatus.completedActions.map((action, idx) => (
                    <li key={idx} className="text-green-400 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      {action}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <div className="text-slate-500 mb-1">진행 중</div>
                <ul className="space-y-1">
                  {report.responseStatus.ongoingActions.map((action, idx) => (
                    <li key={idx} className="text-yellow-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {action}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          {/* 건의사항 */}
          <section>
            <h5 className="font-medium text-slate-300 mb-2">건의사항</h5>
            <ul className="bg-slate-800 rounded p-3 space-y-1 text-xs">
              {report.recommendations.map((rec, idx) => (
                <li key={idx} className="text-slate-300">
                  {idx + 1}. {rec}
                </li>
              ))}
            </ul>
          </section>
        </div>
      )}

      {/* Action Buttons */}
      <div className="p-4 border-t border-slate-700 flex gap-2">
        <button
          onClick={onDownload}
          className="flex-1 flex items-center justify-center gap-2 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded text-xs transition-colors"
        >
          <Download className="w-4 h-4" />
          PDF 다운로드
        </button>
        <button
          onClick={() => window.print()}
          className="flex-1 flex items-center justify-center gap-2 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded text-xs transition-colors"
        >
          <Printer className="w-4 h-4" />
          인쇄
        </button>
        <button
          onClick={onSubmit}
          className={`flex-1 flex items-center justify-center gap-2 py-2 ${colors.bg} hover:opacity-90 text-white rounded text-xs font-medium transition-opacity`}
        >
          <Send className="w-4 h-4" />
          상급기관 보고
        </button>
      </div>
    </div>
  );
}
