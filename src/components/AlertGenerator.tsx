'use client';

import { useState } from 'react';
import { EmergencyAlert } from '@/types/advisor';
import { OperationMode, MODE_INFO } from '@/types';
import {
  Bell,
  Send,
  Edit3,
  X,
  CheckCircle,
  AlertTriangle,
  Smartphone,
  Radio,
  Tv,
  Copy,
} from 'lucide-react';

interface AlertGeneratorProps {
  alert: EmergencyAlert | null;
  mode: OperationMode;
  onSend?: (alert: EmergencyAlert) => void;
  onEdit?: (alert: EmergencyAlert) => void;
  onClose?: () => void;
}

export default function AlertGenerator({
  alert,
  mode,
  onSend,
  onEdit,
  onClose,
}: AlertGeneratorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(alert?.content || '');
  const [isCopied, setIsCopied] = useState(false);

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

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'CBS':
      case 'SMS': return <Smartphone className="w-3 h-3" />;
      case 'RADIO': return <Radio className="w-3 h-3" />;
      case 'TV': return <Tv className="w-3 h-3" />;
      default: return <Bell className="w-3 h-3" />;
    }
  };

  const handleCopy = () => {
    if (alert) {
      const fullMessage = `${alert.title}\n\n${alert.content}\n\n[행동요령]\n${alert.actionItems.map((a, i) => `${i + 1}. ${a}`).join('\n')}\n\n문의: ${alert.contactInfo}`;
      navigator.clipboard.writeText(fullMessage);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  if (!alert) {
    return (
      <div className={`bg-slate-900/80 backdrop-blur border ${colors.border} rounded-lg p-4`}>
        <div className="flex items-center gap-2 text-slate-400">
          <Bell className="w-5 h-5" />
          <span className="text-sm">알림 생성 대기중...</span>
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
            <Bell className={`w-5 h-5 ${colors.text}`} />
            <span className={`font-bold ${colors.text}`}>긴급재난문자 초안</span>
            <span className="text-xs px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded">
              AI 생성
            </span>
          </div>
          {onClose && (
            <button onClick={onClose} className="text-slate-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Alert Preview */}
      <div className="p-4 space-y-4">
        {/* 발송 채널 */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">발송채널:</span>
          <div className="flex gap-1">
            {alert.channels.map((channel) => (
              <span
                key={channel}
                className="flex items-center gap-1 px-2 py-0.5 bg-slate-700 rounded text-xs text-slate-300"
              >
                {getChannelIcon(channel)}
                {channel}
              </span>
            ))}
          </div>
        </div>

        {/* 대상 지역 */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">대상지역:</span>
          <span className="text-sm text-white">{alert.targetArea}</span>
        </div>

        {/* 메시지 미리보기 */}
        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <span className="font-bold text-white">{alert.title}</span>
          </div>

          {isEditing ? (
            <textarea
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              className="w-full bg-slate-700 border border-slate-600 rounded p-2 text-sm text-slate-300 min-h-[80px]"
            />
          ) : (
            <p className="text-sm text-slate-300 mb-3">{alert.content}</p>
          )}

          <div className="border-t border-slate-700 pt-3 mt-3">
            <div className="text-xs text-slate-400 mb-2">[행동요령]</div>
            <ul className="space-y-1">
              {alert.actionItems.map((item, idx) => (
                <li key={idx} className="text-xs text-slate-300 flex items-start gap-2">
                  <span className="text-slate-500">{idx + 1}.</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="border-t border-slate-700 pt-3 mt-3 text-xs text-slate-500">
            문의: {alert.contactInfo}
          </div>
        </div>

        {/* 액션 버튼 */}
        <div className="flex gap-2">
          <button
            onClick={handleCopy}
            className="flex-1 flex items-center justify-center gap-2 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded text-sm transition-colors"
          >
            {isCopied ? (
              <>
                <CheckCircle className="w-4 h-4 text-green-400" />
                복사됨
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                복사
              </>
            )}
          </button>

          <button
            onClick={() => {
              if (isEditing) {
                onEdit?.({ ...alert, content: editedContent });
              }
              setIsEditing(!isEditing);
            }}
            className="flex-1 flex items-center justify-center gap-2 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded text-sm transition-colors"
          >
            <Edit3 className="w-4 h-4" />
            {isEditing ? '저장' : '수정'}
          </button>

          <button
            onClick={() => onSend?.(alert)}
            className={`flex-1 flex items-center justify-center gap-2 py-2 ${colors.bg} hover:opacity-90 text-white rounded text-sm font-medium transition-opacity`}
          >
            <Send className="w-4 h-4" />
            발송
          </button>
        </div>
      </div>
    </div>
  );
}
