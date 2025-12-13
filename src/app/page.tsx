'use client';

import { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { ControlPanel, AgentLog } from '@/components';
import AIBriefingPanel from '@/components/AIBriefingPanel';
import ResourceDashboard from '@/components/ResourceDashboard';
import AlertGenerator from '@/components/AlertGenerator';
import ReportGenerator from '@/components/ReportGenerator';
import WeatherPanel from '@/components/WeatherPanel';
import {
  OperationMode,
  RiskZone,
  AgentMessage,
  RiskAnalysisResponse,
  RiskSummary,
  MODE_INFO,
} from '@/types';
import {
  AIBriefing,
  EmergencyAlert,
  SituationReport,
  WeatherData,
  ResourceSummary,
  Vehicle,
  Personnel,
  AIRecommendation,
} from '@/types/advisor';
import {
  generateAIBriefing,
  generateEmergencyAlert,
  generateSituationReport,
  getMockResources,
  getMockVehicles,
  getMockPersonnel,
  getMockWeather,
} from '@/lib/ai-advisor';
import {
  PanelLeftClose,
  PanelLeftOpen,
  Bell,
  FileText,
  LogOut,
  User,
} from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';

// SSR 방지를 위한 dynamic import
const Map = dynamic(() => import('@/components/Map'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-slate-900 flex items-center justify-center">
      <div className="text-slate-400 animate-pulse flex flex-col items-center gap-2">
        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
        <span>지도 초기화 중...</span>
      </div>
    </div>
  ),
});

const DEFAULT_SUMMARY: RiskSummary = {
  total_zones: 0,
  high_risk: 0,
  medium_risk: 0,
  low_risk: 0,
};

export default function Home() {
  const { data: session } = useSession();

  // 기존 상태
  const [mode, setMode] = useState<OperationMode>('winter');
  const [zones, setZones] = useState<RiskZone[]>([]);
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [summary, setSummary] = useState<RiskSummary>(DEFAULT_SUMMARY);
  const [dataSources, setDataSources] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedZone, setSelectedZone] = useState<RiskZone | null>(null);
  const [error, setError] = useState<string | null>(null);

  // AI 참모 상태
  const [briefing, setBriefing] = useState<AIBriefing | null>(null);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [resources, setResources] = useState<ResourceSummary[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [personnel, setPersonnel] = useState<Personnel>({ total: 0, onDuty: 0, deployed: 0, available: 0 });
  const [alert, setAlert] = useState<EmergencyAlert | null>(null);
  const [report, setReport] = useState<SituationReport | null>(null);

  // UI 상태
  const [showLeftPanel, setShowLeftPanel] = useState(true);
  const [showAlert, setShowAlert] = useState(false);
  const [showReport, setShowReport] = useState(false);

  const fetchRiskData = useCallback(async (operationMode: OperationMode) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/risk-analysis?mode=${operationMode}`);

      if (!response.ok) {
        throw new Error(`API 오류: ${response.status}`);
      }

      const data: RiskAnalysisResponse = await response.json();

      setZones(data.zones);
      setSummary(data.summary);
      setDataSources(data.data_sources || []);

      // 타임스탬프를 Date 객체로 변환
      const messagesWithDates = data.agent_messages.map((msg) => ({
        ...msg,
        timestamp: new Date(msg.timestamp),
      }));
      setMessages(messagesWithDates);

      // AI 참모 데이터 생성
      const weatherData = getMockWeather(operationMode);
      setWeather(weatherData);

      const briefingData = generateAIBriefing(operationMode, data.zones, weatherData);
      setBriefing(briefingData);

      const resourceData = getMockResources(operationMode);
      setResources(resourceData);

      setVehicles(getMockVehicles(operationMode));
      setPersonnel(getMockPersonnel());

      // 알림 및 보고서 생성
      setAlert(generateEmergencyAlert(operationMode, data.zones, weatherData));
      setReport(generateSituationReport(operationMode, data.zones, weatherData, resourceData));

    } catch (err) {
      console.error('Failed to fetch risk data:', err);
      setError(err instanceof Error ? err.message : '데이터 로딩 실패');
      setZones([]);
      setSummary(DEFAULT_SUMMARY);
      setMessages([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRiskData(mode);
  }, [mode, fetchRiskData]);

  const handleModeChange = (newMode: OperationMode) => {
    setMode(newMode);
    setSelectedZone(null);
    setShowAlert(false);
    setShowReport(false);
  };

  const handleZoneClick = (zone: RiskZone) => {
    setSelectedZone(zone);
  };

  const handleExecuteRecommendation = (rec: AIRecommendation) => {
    // 추천 실행 로직 (데모용)
    const newMessage: AgentMessage = {
      id: `exec-${Date.now()}`,
      timestamp: new Date(),
      message: `✅ [실행완료] ${rec.action} - ${rec.estimatedImpact}`,
      type: 'success',
    };
    setMessages((prev) => [...prev, newMessage]);
  };

  const handleSendAlert = (sentAlert: EmergencyAlert) => {
    const newMessage: AgentMessage = {
      id: `alert-${Date.now()}`,
      timestamp: new Date(),
      message: `📢 [발송완료] ${sentAlert.type} - ${sentAlert.targetArea} 대상 발송`,
      type: 'action',
    };
    setMessages((prev) => [...prev, newMessage]);
    setShowAlert(false);
  };

  const modeInfo = MODE_INFO[mode];

  const getAccentClass = () => {
    switch (mode) {
      case 'winter': return 'border-purple-500 bg-purple-500';
      case 'summer': return 'border-blue-500 bg-blue-500';
      case 'landslide': return 'border-orange-500 bg-orange-500';
      case 'heat': return 'border-red-500 bg-red-500';
    }
  };

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/login' });
  };

  return (
    <div className="h-screen flex flex-col bg-slate-950 overflow-hidden">
      {/* Control Panel Header */}
      <div className="relative">
        <ControlPanel
          mode={mode}
          onModeChange={handleModeChange}
          summary={summary}
          isLoading={isLoading}
          dataSources={dataSources}
        />

        {/* User Info & Logout */}
        <div className="absolute top-4 right-6 flex items-center gap-3 z-50">
          <div className="flex items-center gap-2 px-3 py-2 bg-slate-800/90 backdrop-blur border border-slate-700 rounded-lg text-sm">
            <User className="w-4 h-4 text-purple-400" />
            <span className="text-slate-300">{session?.user?.name}</span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-2 bg-slate-800/90 hover:bg-red-500/20 backdrop-blur border border-slate-700 hover:border-red-500 rounded-lg text-sm text-slate-300 hover:text-red-400 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>로그아웃</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - AI 참모 */}
        {showLeftPanel && (
          <div className="w-80 flex flex-col gap-3 p-3 overflow-y-auto border-r border-slate-800">
            {/* AI 브리핑 */}
            <AIBriefingPanel
              briefing={briefing}
              mode={mode}
              onExecuteRecommendation={handleExecuteRecommendation}
              isLoading={isLoading}
            />

            {/* 기상/예측 */}
            <WeatherPanel
              weather={weather}
              predictions={briefing?.riskPrediction || []}
              mode={mode}
            />

            {/* 자원 현황 */}
            <ResourceDashboard
              mode={mode}
              resources={resources}
              personnel={personnel}
              vehicles={vehicles}
            />
          </div>
        )}

        {/* Toggle Left Panel */}
        <button
          onClick={() => setShowLeftPanel(!showLeftPanel)}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-slate-800 hover:bg-slate-700 p-2 rounded-r-lg border border-l-0 border-slate-700"
          style={{ left: showLeftPanel ? '320px' : '0' }}
        >
          {showLeftPanel ? (
            <PanelLeftClose className="w-4 h-4 text-slate-400" />
          ) : (
            <PanelLeftOpen className="w-4 h-4 text-slate-400" />
          )}
        </button>

        {/* Map Area */}
        <div className="flex-1 relative">
          <Map zones={zones} mode={mode} onZoneClick={handleZoneClick} />

          {/* Quick Actions */}
          <div className="absolute top-4 right-4 flex gap-2 z-[500]">
            <button
              onClick={() => setShowAlert(!showAlert)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                showAlert
                  ? `${getAccentClass()} text-white`
                  : 'bg-slate-800/90 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Bell className="w-4 h-4" />
              재난문자
            </button>
            <button
              onClick={() => setShowReport(!showReport)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                showReport
                  ? `${getAccentClass()} text-white`
                  : 'bg-slate-800/90 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <FileText className="w-4 h-4" />
              보고서
            </button>
          </div>

          {/* Alert Generator Modal */}
          {showAlert && (
            <div className="absolute top-16 right-4 w-96 z-[1000]">
              <AlertGenerator
                alert={alert}
                mode={mode}
                onSend={handleSendAlert}
                onClose={() => setShowAlert(false)}
              />
            </div>
          )}

          {/* Report Generator Modal */}
          {showReport && (
            <div className="absolute top-16 right-4 w-96 z-[1000]">
              <ReportGenerator
                report={report}
                mode={mode}
                onDownload={() => {
                  const newMsg: AgentMessage = {
                    id: `dl-${Date.now()}`,
                    timestamp: new Date(),
                    message: '📄 [다운로드] 상황보고서 PDF 생성 완료',
                    type: 'info',
                  };
                  setMessages((prev) => [...prev, newMsg]);
                }}
              />
            </div>
          )}

          {/* Selected Zone Info */}
          {selectedZone && (
            <div className="absolute bottom-4 left-4 bg-slate-900/95 backdrop-blur border border-slate-700 rounded-lg p-4 max-w-sm z-[1000]">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{modeInfo.icon}</span>
                  <span className="text-xs font-mono text-slate-400">{selectedZone.id}</span>
                </div>
                <button
                  onClick={() => setSelectedZone(null)}
                  className="text-slate-400 hover:text-white text-xl"
                >
                  &times;
                </button>
              </div>
              <h3 className="font-bold text-white mb-1">{selectedZone.name}</h3>
              <p className="text-sm text-slate-300 mb-3">{selectedZone.reason}</p>

              {selectedZone.source_layer !== 'swtr_rstar' && (
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs text-slate-400">위험도</span>
                  <div className="flex-1 bg-slate-700 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full ${getAccentClass()}`}
                      style={{ width: `${selectedZone.risk_score}%` }}
                    />
                  </div>
                  <span className="text-lg font-bold" style={{
                    color: mode === 'winter' ? '#a855f7' : mode === 'summer' ? '#3b82f6' : mode === 'landslide' ? '#f97316' : '#ef4444'
                  }}>
                    {selectedZone.risk_score}%
                  </span>
                </div>
              )}

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    handleExecuteRecommendation({
                      id: 'quick',
                      priority: 'high',
                      action: `${selectedZone.name}에 ${modeInfo.vehicle} 배치`,
                      reason: selectedZone.reason,
                      estimatedImpact: '위험도 30% 감소',
                    });
                  }}
                  className={`flex-1 py-2 rounded text-sm font-medium ${getAccentClass()} text-white`}
                >
                  {modeInfo.vehicle} 배치
                </button>
              </div>
            </div>
          )}

          {/* Loading */}
          {isLoading && (
            <div className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm flex items-center justify-center z-[1000]">
              <div className="text-center">
                <div className={`w-12 h-12 border-3 ${getAccentClass().split(' ')[0]} border-t-transparent rounded-full animate-spin mx-auto mb-4`} />
                <p className="text-slate-300">AI 참모 분석 중...</p>
              </div>
            </div>
          )}
        </div>

        {/* Right Panel - Agent Log */}
        <div className="w-80 p-3">
          <AgentLog messages={messages} mode={mode} />
        </div>
      </div>

      {/* Footer */}
      <div className="bg-slate-900 border-t border-slate-800 px-6 py-2 flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-4">
          <span className="font-semibold text-slate-400">G-Climate Ops v3.0</span>
          <span className="text-slate-700">|</span>
          <span>AI 재난대응 참모 시스템</span>
          <span className="text-slate-700">|</span>
          <span>경기기후플랫폼 API 연동</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <span className={`w-2 h-2 rounded-full ${error ? 'bg-red-500' : 'bg-green-500'}`} />
            {error ? 'API 오류' : 'AI Agent 활성'}
          </span>
          <span>{new Date().toLocaleString('ko-KR')}</span>
        </div>
      </div>
    </div>
  );
}
