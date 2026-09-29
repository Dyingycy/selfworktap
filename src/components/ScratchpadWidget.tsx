'use client';

import React, { useState, useEffect } from 'react';
import { FileEdit, Sparkles, Copy, Trash2, Check, RefreshCw } from 'lucide-react';

export const ScratchpadWidget: React.FC = () => {
  const [content, setContent] = useState('');
  const [copied, setCopied] = useState(false);
  const [isOrganizing, setIsOrganizing] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('techradar_scratchpad');
      if (saved) setContent(saved);
      else setContent('');
    } catch (e) {
      console.error(e);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setContent(val);
    localStorage.setItem('techradar_scratchpad', val);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    if (confirm('确定要清空闪念草稿吗？')) {
      setContent('');
      localStorage.setItem('techradar_scratchpad', '');
    }
  };

  const handleAiOrganize = async () => {
    if (!content.trim()) return;
    setIsOrganizing(true);
    try {
      const apiKey = typeof window !== 'undefined' ? localStorage.getItem('techradar_gemini_key') || '' : '';
      const res = await fetch('/api/ai/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: '随手草稿整理',
          content: content,
          question: '请将上述混乱杂散的备忘内容，整理成排版规整、分点清晰的 Markdown 格式笔记。',
          apiKey,
        }),
      });

      const json = await res.json();
      if (json.success && json.data?.answer) {
        const organized = json.data.answer;
        setContent(organized);
        localStorage.setItem('techradar_scratchpad', organized);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsOrganizing(false);
    }
  };

  return (
    <div className="glass-card rounded-3xl p-5 border border-white/10 space-y-3 flex flex-col h-full shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <FileEdit className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">闪念草稿纸</h3>
          </div>
        </div>

        <span className="text-[11px] text-zinc-500 font-mono">
          {content.length} 字
        </span>
      </div>

      {/* Editor area */}
      <div className="flex-1 min-h-[140px] relative">
        <textarea
          value={content}
          onChange={handleChange}
          placeholder="开会灵感、临时链接、待记录代码片段..."
          className="w-full h-full min-h-[130px] bg-zinc-900/80 border border-white/10 rounded-2xl p-3 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500/50 resize-none font-sans leading-relaxed"
        />
      </div>

      {/* Action Footer */}
      <div className="flex items-center justify-between pt-1 text-xs">
        <button
          onClick={handleAiOrganize}
          disabled={isOrganizing || !content.trim()}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-600/20 to-purple-600/20 hover:from-blue-600/30 hover:to-purple-600/30 text-blue-300 border border-blue-500/30 active:scale-95 transition-all font-medium disabled:opacity-50"
        >
          <Sparkles className={`w-3.5 h-3.5 text-purple-400 ${isOrganizing ? 'animate-spin' : ''}`} />
          <span>{isOrganizing ? 'AI 整理中...' : 'AI 智能排版'}</span>
        </button>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handleCopy}
            className="p-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-white/10 active:scale-95 transition-all"
            title="复制全文"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={handleClear}
            className="p-1.5 rounded-xl bg-zinc-800 hover:bg-red-500/20 hover:text-red-400 text-zinc-400 border border-white/10 active:scale-95 transition-all"
            title="清空"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
