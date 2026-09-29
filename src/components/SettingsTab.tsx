'use client';

import React, { useState, useEffect } from 'react';
import { KeyRound, Smartphone, Check, Trash2, ShieldCheck, ArrowRight, ExternalLink } from 'lucide-react';

interface SettingsTabProps {
  onClearCache: () => void;
}

export const SettingsTab: React.FC<SettingsTabProps> = ({ onClearCache }) => {
  const [apiKey, setApiKey] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [testMessage, setTestMessage] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('techradar_gemini_key') || '';
    setApiKey(saved);
  }, []);

  const handleSaveKey = () => {
    const clean = apiKey.trim().replace(/^[\s"']+|[\s"']+$/g, '');
    setApiKey(clean);
    localStorage.setItem('techradar_gemini_key', clean);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleTestKey = async () => {
    const clean = apiKey.trim().replace(/^[\s"']+|[\s"']+$/g, '');
    if (!clean) {
      setTestStatus('error');
      setTestMessage('请先输入 Gemini API Key');
      return;
    }

    setTestStatus('testing');
    setTestMessage('正在通过云端边缘节点测试连接 Google Gemini API...');

    try {
      const res = await fetch('/api/ai/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: '连接测试',
          content: '这是一次连通性验证。',
          question: '请用5个字回复：连接成功',
          apiKey: clean,
        }),
      });

      const json = await res.json();
      if (json.success && !json.data?.answer?.includes('分析时遇到问题')) {
        setTestStatus('success');
        setTestMessage(`🎉 Gemini API 连接成功！已可正常使用 AI 解读与晨报。`);
      } else {
        setTestStatus('error');
        setTestMessage(`❌ 连接失败: ${json.error || json.data?.answer || '密钥无效'}`);
      }
    } catch (e: any) {
      setTestStatus('error');
      setTestMessage(`❌ 请求出错: ${e.message}`);
    }
  };

  return (
    <div className="space-y-5 pb-6">
      {/* Gemini API Key Card */}
      <div className="glass-card rounded-3xl p-5 space-y-4 border border-blue-500/20 bg-gradient-to-b from-blue-950/20 to-zinc-900/60">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <KeyRound className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Google Gemini API Key</h3>
            <p className="text-[11px] text-zinc-400">驱动每日科技早报与卡片 AI 交互追问</p>
          </div>
        </div>

        <div className="space-y-2">
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="AIzaSy... (粘贴你的 Gemini API Key)"
            className="w-full bg-zinc-900/90 border border-white/10 rounded-2xl px-4 py-2.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-blue-500 transition-all font-mono"
          />

          <div className="flex items-center gap-2">
            <button
              onClick={handleSaveKey}
              className="flex-1 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-95 text-white text-xs font-semibold transition-all flex items-center justify-center gap-1.5 shadow-sm"
            >
              {isSaved ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : null}
              <span>{isSaved ? '已保存到本地' : '保存 API Key'}</span>
            </button>

            <button
              onClick={handleTestKey}
              disabled={testStatus === 'testing'}
              className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 active:scale-95 text-zinc-200 text-xs font-medium border border-white/10 transition-all"
            >
              {testStatus === 'testing' ? '测试中...' : '测试连通'}
            </button>
          </div>

          {testMessage && (
            <div
              className={`p-2.5 rounded-xl text-xs font-medium leading-relaxed ${
                testStatus === 'success'
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : testStatus === 'error'
                  ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                  : 'bg-zinc-800 text-zinc-300'
              }`}
            >
              {testMessage}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between text-[11px] text-zinc-500 pt-2 border-t border-white/5">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>密钥仅保存在您的手机/本地，不上传服务器</span>
          </span>
          <a
            href="https://aistudio.google.com/app/apikey"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:underline flex items-center gap-0.5"
          >
            <span>获取免费 Key</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* iOS PWA Installation Guide */}
      <div className="glass-card rounded-3xl p-5 space-y-3.5 border border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <Smartphone className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">iPhone 添加到主屏幕 (PWA)</h3>
            <p className="text-[11px] text-zinc-400">无需 App Store，获得原生沉浸式独立 App 体验</p>
          </div>
        </div>

        <div className="space-y-2.5 text-xs text-zinc-300">
          <div className="flex items-start gap-2.5 bg-zinc-900/60 p-3 rounded-2xl border border-white/5">
            <span className="w-5 h-5 rounded-full bg-zinc-800 text-blue-400 flex items-center justify-center font-bold text-xs flex-shrink-0">
              1
            </span>
            <p className="leading-relaxed">
              在 iPhone 上使用系统自带的 <strong className="text-white">Safari 浏览器</strong> 打开当前工作台网址。
            </p>
          </div>

          <div className="flex items-start gap-2.5 bg-zinc-900/60 p-3 rounded-2xl border border-white/5">
            <span className="w-5 h-5 rounded-full bg-zinc-800 text-blue-400 flex items-center justify-center font-bold text-xs flex-shrink-0">
              2
            </span>
            <p className="leading-relaxed">
              点击 Safari 底部工具栏正中间的 <strong className="text-white">「分享」</strong> 按钮（方框向上箭头）。
            </p>
          </div>

          <div className="flex items-start gap-2.5 bg-zinc-900/60 p-3 rounded-2xl border border-white/5">
            <span className="w-5 h-5 rounded-full bg-zinc-800 text-blue-400 flex items-center justify-center font-bold text-xs flex-shrink-0">
              3
            </span>
            <p className="leading-relaxed">
              在弹出的选项中向上滑动，找到并轻点 <strong className="text-white">「添加到主屏幕」</strong>。
            </p>
          </div>

          <div className="flex items-start gap-2.5 bg-zinc-900/60 p-3 rounded-2xl border border-white/5">
            <span className="w-5 h-5 rounded-full bg-zinc-800 text-blue-400 flex items-center justify-center font-bold text-xs flex-shrink-0">
              4
            </span>
            <p className="leading-relaxed">
              轻点右上角 <strong className="text-white">「添加」</strong>，手机桌面将生成独立图标，打开即享全屏零干扰体验。
            </p>
          </div>
        </div>
      </div>

      {/* Cache & Maintenance */}
      <div className="glass-card rounded-2xl p-4 flex items-center justify-between border border-white/10">
        <div>
          <h4 className="text-xs font-semibold text-zinc-200">本地离线数据缓存</h4>
          <p className="text-[11px] text-zinc-500">清除本地缓存的新闻和早报快照</p>
        </div>

        <button
          onClick={onClearCache}
          className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-red-500/20 hover:text-red-400 active:scale-95 text-zinc-400 text-xs font-medium border border-white/10 transition-all"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>清除缓存</span>
        </button>
      </div>

      {/* Tech Spec Footer */}
      <div className="text-center text-[11px] text-zinc-600 pt-2 space-y-1">
        <p>个人科技热点工作台 v1.0.0 · iOS PWA Edition</p>
        <p>Powered by Next.js & Google Gemini 3.8 Flash</p>
      </div>
    </div>
  );
};
