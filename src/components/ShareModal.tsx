'use client';

import React, { useState } from 'react';
import { X, Copy, Check, Share2 } from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  summary: string;
  url: string;
  source: string;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  title,
  summary,
  url,
  source,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const shareText = `【科技热点分享 · ${source}】
📌 ${title}

💡 核心要点：
${summary}

🔗 原文链接：
${url}

—— 分享自 TechRadar 科技热点工作台`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-sm glass-card rounded-3xl p-5 border border-white/15 space-y-4 shadow-2xl bg-zinc-900/95">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Share2 className="w-3.5 h-3.5" />
            </div>
            <h3 className="text-sm font-bold text-white">一键分享资讯卡片</h3>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-full bg-zinc-800 text-zinc-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Preview Container */}
        <div className="bg-zinc-950 p-3.5 rounded-2xl border border-white/10 text-xs text-zinc-300 font-mono space-y-2 whitespace-pre-wrap leading-relaxed max-h-56 overflow-y-auto no-scrollbar">
          {shareText}
        </div>

        <button
          onClick={handleCopy}
          className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-95 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-md"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 text-emerald-300" />
              <span>已复制到剪贴板！可直接粘贴</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              <span>复制格式化文本 (微信/朋友圈)</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
