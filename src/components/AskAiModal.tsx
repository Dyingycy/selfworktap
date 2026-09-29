'use client';

import React, { useState } from 'react';
import { X, Sparkles, Send, CheckCircle2, AlertCircle } from 'lucide-react';

interface AskAiModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  content: string;
}

export const AskAiModal: React.FC<AskAiModalProps> = ({ isOpen, onClose, title, content }) => {
  const [question, setQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [answerData, setAnswerData] = useState<{ answer: string; keyPoints: string[] } | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const quickPrompts = [
    '用大白话通俗解释这个新闻',
    '这会对行业和普通人产生什么影响？',
    '提炼3个关键事实与后续看点',
    '从商业和技术视角深入评析',
  ];

  const handleAsk = async (queryText: string) => {
    if (!queryText.trim()) return;
    setIsLoading(true);
    setErrorMsg('');
    setAnswerData(null);

    try {
      const apiKey = typeof window !== 'undefined' ? localStorage.getItem('techradar_gemini_key') || '' : '';
      const res = await fetch('/api/ai/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          content,
          question: queryText,
          apiKey,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setAnswerData(json.data);
      } else {
        setErrorMsg(json.error || '提问失败，请稍后重试');
      }
    } catch (e: any) {
      setErrorMsg(e.message || '网络连接异常');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-zinc-900 border-t border-white/15 rounded-t-[32px] p-5 max-h-[85vh] flex flex-col shadow-2xl safe-bottom">
        {/* iOS Handle bar */}
        <div className="w-12 h-1 bg-zinc-600 rounded-full mx-auto mb-3" />

        {/* Modal Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 text-xs text-blue-400 font-semibold mb-1">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>Gemini 深度追问</span>
            </div>
            <h3 className="text-sm font-bold text-white leading-snug line-clamp-2">
              {title}
            </h3>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-zinc-800 text-zinc-400 hover:text-white active:scale-90"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Prompts Carousel */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 mb-3">
          {quickPrompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => {
                setQuestion(p);
                handleAsk(p);
              }}
              className="text-xs px-3 py-1.5 rounded-xl bg-zinc-800/90 hover:bg-zinc-700 active:scale-95 text-zinc-300 border border-white/10 whitespace-nowrap transition-all"
            >
              {p}
            </button>
          ))}
        </div>

        {/* Answer Content Area */}
        <div className="flex-1 overflow-y-auto no-scrollbar space-y-3 pr-1 py-1">
          {isLoading && (
            <div className="bg-zinc-800/60 rounded-2xl p-4 border border-white/5 space-y-2 animate-pulse">
              <div className="flex items-center gap-2 text-xs text-purple-400">
                <Sparkles className="w-3.5 h-3.5 animate-spin" />
                <span>Gemini 正在深入思考中...</span>
              </div>
              <div className="h-4 w-3/4 bg-white/10 rounded shimmer" />
              <div className="h-12 w-full bg-white/5 rounded shimmer" />
            </div>
          )}

          {errorMsg && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl p-3 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {answerData && (
            <div className="bg-gradient-to-b from-blue-950/20 to-zinc-800/60 rounded-2xl p-4 border border-blue-500/20 space-y-3">
              <div className="text-xs text-zinc-200 leading-relaxed whitespace-pre-wrap">
                {answerData.answer}
              </div>

              {answerData.keyPoints && answerData.keyPoints.length > 0 && (
                <div className="pt-2.5 border-t border-white/10 space-y-1.5">
                  <span className="text-[11px] font-bold text-blue-400 uppercase tracking-wide">
                    核心事实与脉络：
                  </span>
                  {answerData.keyPoints.map((point, i) => (
                    <div key={i} className="flex items-start gap-1.5 text-xs text-zinc-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 flex-shrink-0 mt-0.5" />
                      <span>{point}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {!isLoading && !answerData && !errorMsg && (
            <div className="text-center py-8 text-zinc-500 text-xs">
              点击上方快捷标签，或在下方输入你想了解的具体问题
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="mt-3 pt-2 border-t border-white/10 flex items-center gap-2">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAsk(question);
            }}
            placeholder="问问 Gemini 关于此事件的细节..."
            className="flex-1 bg-zinc-800/90 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500"
          />
          <button
            onClick={() => handleAsk(question)}
            disabled={isLoading || !question.trim()}
            className="p-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 active:scale-95 text-white transition-all"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
