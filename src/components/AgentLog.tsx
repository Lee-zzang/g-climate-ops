'use client';

import { useEffect, useState, useRef } from 'react';
import { AgentMessage, OperationMode } from '@/types';
import {
  Terminal,
  AlertTriangle,
  Info,
  Zap,
  CheckCircle,
  Database,
} from 'lucide-react';

interface AgentLogProps {
  messages: AgentMessage[];
  mode: OperationMode;
}

// 모드별 색상
const MODE_ACCENT: Record<OperationMode, { text: string; border: string; bg: string }> = {
  winter: {
    text: 'text-purple-400',
    border: 'border-purple-500/30',
    bg: 'bg-purple-500',
  },
  summer: {
    text: 'text-blue-400',
    border: 'border-blue-500/30',
    bg: 'bg-blue-500',
  },
  landslide: {
    text: 'text-orange-400',
    border: 'border-orange-500/30',
    bg: 'bg-orange-500',
  },
  heat: {
    text: 'text-red-400',
    border: 'border-red-500/30',
    bg: 'bg-red-500',
  },
};

// 타이핑 효과 컴포넌트
function TypewriterText({ text, speed = 25 }: { text: string; speed?: number }) {
  const [displayedText, setDisplayedText] = useState('');
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    setDisplayedText('');
    setIsComplete(false);
    let index = 0;

    const timer = setInterval(() => {
      if (index < text.length) {
        setDisplayedText(text.slice(0, index + 1));
        index++;
      } else {
        setIsComplete(true);
        clearInterval(timer);
      }
    }, speed);

    return () => clearInterval(timer);
  }, [text, speed]);

  return (
    <span>
      {displayedText}
      {!isComplete && <span className="animate-pulse text-green-400">|</span>}
    </span>
  );
}

export default function AgentLog({ messages, mode }: AgentLogProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [visibleMessages, setVisibleMessages] = useState<AgentMessage[]>([]);

  const accent = MODE_ACCENT[mode];

  // 메시지를 순차적으로 표시
  useEffect(() => {
    setVisibleMessages([]);

    messages.forEach((msg, index) => {
      setTimeout(() => {
        setVisibleMessages((prev) => [...prev, msg]);
      }, index * 600);
    });
  }, [messages]);

  // 자동 스크롤
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [visibleMessages]);

  const getIcon = (type: AgentMessage['type']) => {
    switch (type) {
      case 'alert':
        return <AlertTriangle className="w-4 h-4 text-red-400" />;
      case 'info':
        return <Info className="w-4 h-4 text-blue-400" />;
      case 'action':
        return <Zap className="w-4 h-4 text-yellow-400" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'data':
        return <Database className="w-4 h-4 text-cyan-400" />;
      default:
        return <Terminal className="w-4 h-4 text-slate-400" />;
    }
  };

  const getMessageStyle = (type: AgentMessage['type']) => {
    switch (type) {
      case 'alert':
        return 'border-l-red-500 bg-red-500/5';
      case 'info':
        return 'border-l-blue-500 bg-blue-500/5';
      case 'action':
        return 'border-l-yellow-500 bg-yellow-500/5';
      case 'success':
        return 'border-l-green-500 bg-green-500/5';
      case 'data':
        return 'border-l-cyan-500 bg-cyan-500/5';
      default:
        return 'border-l-slate-500';
    }
  };

  return (
    <div
      className={`h-full flex flex-col bg-slate-900/80 backdrop-blur border ${accent.border} rounded-lg overflow-hidden`}
    >
      {/* Header */}
      <div
        className={`flex items-center gap-2 px-4 py-3 border-b ${accent.border} bg-slate-800/50`}
      >
        <Terminal className={`w-5 h-5 ${accent.text}`} />
        <h2 className={`font-mono font-bold ${accent.text}`}>AI AGENT LOG</h2>
        <div className="flex-1" />
        <div className="flex items-center gap-1">
          <span className={`w-2 h-2 ${accent.bg} rounded-full animate-pulse`} />
          <span className={`text-xs ${accent.text} font-mono`}>LIVE</span>
        </div>
      </div>

      {/* Log Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-2 font-mono text-sm"
      >
        {visibleMessages.map((msg, index) => (
          <div
            key={msg.id}
            className={`border-l-2 pl-3 py-2 ${getMessageStyle(msg.type)} transition-all duration-300 rounded-r`}
            style={{
              animation: 'fadeIn 0.3s ease-out',
            }}
          >
            <div className="flex items-start gap-2">
              {getIcon(msg.type)}
              <div className="flex-1 min-w-0">
                <div className="text-slate-500 text-xs mb-1">
                  {msg.timestamp.toLocaleTimeString('ko-KR', {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                  })}
                </div>
                <div className="text-slate-200 break-words">
                  {index === visibleMessages.length - 1 ? (
                    <TypewriterText text={msg.message} speed={15} />
                  ) : (
                    msg.message
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}

        {visibleMessages.length === 0 && (
          <div className="flex items-center justify-center h-full text-slate-500">
            <div className="text-center">
              <Terminal className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>경기기후플랫폼 API 연동 중...</p>
              <p className="text-xs mt-1">실시간 데이터 분석 대기</p>
            </div>
          </div>
        )}
      </div>

      {/* Footer Status */}
      <div
        className={`px-4 py-2 border-t ${accent.border} bg-slate-800/30 text-xs text-slate-500 font-mono`}
      >
        <div className="flex items-center justify-between">
          <span>
            {visibleMessages.length > 0 && (
              <>
                {visibleMessages.length}개 로그 | API: climate.gg.go.kr
              </>
            )}
          </span>
          <span>{new Date().toLocaleTimeString('ko-KR')}</span>
        </div>
      </div>
    </div>
  );
}
