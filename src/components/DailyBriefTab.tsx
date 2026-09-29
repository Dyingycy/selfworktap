'use client';

import React, { useState } from 'react';
import { DailyBriefing } from '@/types';
import { Sparkles, Copy, Check, RefreshCw, Quote, ArrowUpRight, TrendingUp } from 'lucide-react';

interface DailyBriefTabProps {
  briefing: DailyBriefing | null;
  isLoading: boolean;
  onRefresh: (force?: boolean) => void;
  onOpenAskAi: (title: string, content: string) => void;
}

export const DailyBriefTab: React.FC<DailyBriefTabProps> = ({
  briefing,
  isLoading,
  onRefresh,
  onOpenAskAi,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!briefing) return;
    const text = `🌅【今日科技早报】${briefing.date}
${briefing.title}

💡 核心脉络：
${briefing.overview}

🔥 焦点进展：
${briefing.highlights
  .map(
    (h, idx) =>
      `${idx + 1}. ${h.title}\n   · 事实：${h.takeaway}\n   · 影响：${h.impact}`
  )
  .join('\n\n')}

📈 趋势关键词：
${briefing.techTrends.map((t) => `#${t}`).join('  ')}

💬 今日金句：
"${briefing.quoteOfTheDay}"
—— 由 Gemini AI 智能提炼 · 科技热点工作台`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading || !briefing) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="glass-card rounded-2xl p-5 space-y-3">
          <div className="h-4 w-24 bg-white/10 rounded shimmer" />
          <div className="h-7 w-3/4 bg-white/10 rounded shimmer" />
          <div className="h-16 w-full bg-white/5 rounded shimmer" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass-card rounded-2xl p-4 space-y-2">
              <div className="h-5 w-2/3 bg-white/10 rounded shimmer" />
              <div className="h-10 w-full bg-white/5 rounded shimmer" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 pb-6">
      {/* Hero Morning Card */}
      <div className="relative overflow-hidden glass-card rounded-3xl p-5 border border-blue-500/20 shadow-xl bg-gradient-to-b from-blue-950/20 via-zinc-900/60 to-zinc-900/90">
        <div className="absolute top-0 right-0 -mr-12 -mt-12 w-48 h-48 bg-gradient-to-br from-blue-500/15 to-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/25 text-blue-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>AI 科技晨报 · {briefing.date}</span>
          </div>
          <span className="text-[11px] text-zinc-400">提炼于 {briefing.generatedAt}</span>
        </div>

        <h2 className="text-xl font-bold tracking-tight text-white mb-3 leading-snug">
          {briefing.title}
        </h2>

        <p className="text-sm text-zinc-300 leading-relaxed bg-zinc-900/40 p-3.5 rounded-2xl border border-white/5">
          {briefing.overview}
        </p>

        {/* Tech Trends Pills */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <TrendingUp className="w-3.5 h-3.5 text-purple-400" />
          {briefing.techTrends.map((trend, i) => (
            <span
              key={i}
              className="text-xs px-2.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 font-medium"
            >
              #{trend}
            </span>
          ))}
        </div>

        {/* Actions Bar */}
        <div className="mt-5 pt-3.5 border-t border-white/10 flex items-center justify-between">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-zinc-800/80 hover:bg-zinc-700/80 active:scale-95 text-zinc-200 text-xs font-medium border border-white/10 transition-all"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">已复制整篇</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-zinc-400" />
                <span>复制整篇晨报</span>
              </>
            )}
          </button>

          <button
            onClick={() => onRefresh(true)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-blue-600/20 hover:bg-blue-600/30 active:scale-95 text-blue-300 text-xs font-medium border border-blue-500/30 transition-all"
          >
            <RefreshCw className="w-3 h-3" />
            <span>重新归纳</span>
          </button>
        </div>
      </div>

      {/* Focus Highlights */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
            <span className="w-1 h-3 rounded-full bg-blue-500" />
            今日焦点大事件 · 深度拆解
          </h3>
          <span className="text-[11px] text-zinc-500">点击可向 AI 追问</span>
        </div>

        {briefing.highlights.map((item, idx) => (
          <div
            key={idx}
            className="glass-card rounded-2xl p-4 transition-all hover:border-white/20 active:scale-[0.99] space-y-2.5"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-2">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-zinc-800 text-blue-400 text-xs font-bold flex items-center justify-center border border-white/10">
                  {idx + 1}
                </span>
                <h4 className="text-sm font-semibold text-zinc-100 leading-snug">
                  {item.title}
                </h4>
              </div>

              <button
                onClick={() => onOpenAskAi(item.title, `${item.takeaway} ${item.impact}`)}
                className="flex-shrink-0 flex items-center gap-0.5 text-xs text-blue-400 hover:text-blue-300 active:scale-90 px-2 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20"
                title="向 Gemini 提问"
              >
                <Sparkles className="w-3 h-3 text-purple-400" />
                <span>追问</span>
              </button>
            </div>

            <div className="grid grid-cols-1 gap-2 text-xs">
              <div className="bg-zinc-900/50 p-2.5 rounded-xl border border-white/5 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wide text-zinc-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  核心事实
                </span>
                <p className="text-zinc-300 leading-relaxed">{item.takeaway}</p>
              </div>

              <div className="bg-zinc-900/50 p-2.5 rounded-xl border border-white/5 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wide text-zinc-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  深远影响
                </span>
                <p className="text-zinc-300 leading-relaxed">{item.impact}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quote of the Day */}
      {briefing.quoteOfTheDay && (
        <div className="glass-card rounded-2xl p-4 border border-purple-500/15 bg-gradient-to-r from-purple-950/10 to-zinc-900/40 relative">
          <Quote className="w-6 h-6 text-purple-500/30 absolute top-3 right-3 pointer-events-none" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400 block mb-1">
            QUOTE OF THE DAY
          </span>
          <p className="text-xs italic text-zinc-300 leading-relaxed pr-6">
            “{briefing.quoteOfTheDay}”
          </p>
        </div>
      )}
    </div>
  );
};
