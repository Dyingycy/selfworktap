'use client';

import React, { useState, useRef, useEffect } from 'react';
import { AiChatMessage } from '@/types';
import { Sparkles, Send, Trash2, Copy, Check, Bot, User, CornerDownLeft } from 'lucide-react';

export const AiChatTab: React.FC = () => {
  const [messages, setMessages] = useState<AiChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  const presetPrompts = [
    { label: '📝 周报润色', prompt: '请帮我把今天的零散工作内容，整理成一份逻辑严谨、条理清晰的周报/日报：\n' },
    { label: '💡 方案头脑风暴', prompt: '针对以下需求，从创新性、可行性与技术实现 3 个维度提供头脑风暴方案：\n' },
    { label: '🔍 大白话拆解', prompt: '请用小学生都能听懂的大白话，通俗生动地拆解以下概念：\n' },
    { label: '💻 代码审查优化', prompt: '请帮我审查并重构以下代码，指出潜在隐患并提供优化后的完整实现：\n' },
    { label: '🌐 专业中英互译', prompt: '请将以下文本翻译为极其符合母语表达习惯的专业中/英文：\n' },
  ];

  useEffect(() => {
    try {
      const saved = localStorage.getItem('techradar_chat_history');
      if (saved) {
        setMessages(JSON.parse(saved));
      } else {
        const welcome: AiChatMessage = {
          id: 'welcome',
          role: 'assistant',
          content:
            '你好！我是你的专属科技工作台随身 AI 智囊，由 Google Gemini 3.8 Flash 强力驱动。\n\n你可以随时向我提问、整理周报、头脑风暴方案或解读复杂技术。请随时告诉我你想做什么！',
          timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages([welcome]);
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const saveMessages = (msgs: AiChatMessage[]) => {
    setMessages(msgs);
    localStorage.setItem('techradar_chat_history', JSON.stringify(msgs));
  };

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || input;
    if (!textToSend.trim() || isLoading) return;

    const userMsg: AiChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
    };

    const newMsgs = [...messages, userMsg];
    saveMessages(newMsgs);
    setInput('');
    setIsLoading(true);

    try {
      const apiKey = typeof window !== 'undefined' ? localStorage.getItem('techradar_gemini_key') || '' : '';
      const res = await fetch('/api/ai/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: '工作台深度问答',
          content: '请作为用户的资深科技助理全面作答。',
          question: textToSend.trim(),
          apiKey,
        }),
      });

      const json = await res.json();
      let answerText = '已完成回复。';
      if (json.success && json.data) {
        answerText = json.data.answer;
        if (json.data.keyPoints && json.data.keyPoints.length > 0) {
          answerText += `\n\n📌 核心要点：\n` + json.data.keyPoints.map((p: string) => `· ${p}`).join('\n');
        }
      } else {
        answerText = `⚠️ 回复出错: ${json.error || '请检查网络或密钥配置'}`;
      }

      const botMsg: AiChatMessage = {
        id: `bot-${Date.now()}`,
        role: 'assistant',
        content: answerText,
        timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      };

      saveMessages([...newMsgs, botMsg]);
    } catch (e: any) {
      const errorMsg: AiChatMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: `请求失败: ${e.message}`,
        timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      };
      saveMessages([...newMsgs, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const handleClear = () => {
    if (confirm('确定要清空所有对话记录吗？')) {
      saveMessages([]);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-145px)] pb-12">
      {/* Header Banner */}
      <div className="glass-card rounded-2xl px-4 py-2.5 mb-3 flex items-center justify-between border border-blue-500/20 bg-gradient-to-r from-blue-950/20 to-purple-950/20">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white">Gemini 3.8 Flash 随身外脑</h3>
          </div>
        </div>

        <button
          onClick={handleClear}
          className="text-zinc-500 hover:text-red-400 p-1 rounded-lg text-xs"
          title="清空聊天记录"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Preset Action Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 mb-2">
        {presetPrompts.map((p, idx) => (
          <button
            key={idx}
            onClick={() => {
              setInput(p.prompt);
            }}
            className="text-xs px-2.5 py-1 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 active:scale-95 text-zinc-300 border border-white/10 whitespace-nowrap transition-all shadow-sm"
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto no-scrollbar space-y-3 pr-1 py-1">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-2.5 ${
              msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'
            }`}
          >
            <div
              className={`w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 text-xs ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-zinc-800 text-purple-400 border border-white/10'
              }`}
            >
              {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            <div
              className={`relative group max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed whitespace-pre-wrap ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white shadow-sm rounded-tr-none'
                  : 'bg-zinc-900/80 border border-white/10 text-zinc-200 rounded-tl-none'
              }`}
            >
              {msg.content}

              <button
                onClick={() => handleCopyMessage(msg.id, msg.content)}
                className="absolute top-2 right-2 p-1 rounded-lg bg-zinc-800/80 text-zinc-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                title="复制内容"
              >
                {copiedId === msg.id ? (
                  <Check className="w-3 h-3 text-emerald-400" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
              </button>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-start gap-2.5">
            <div className="w-7 h-7 rounded-xl bg-zinc-800 text-purple-400 border border-white/10 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-4 h-4 animate-spin text-purple-400" />
            </div>
            <div className="bg-zinc-900/80 border border-white/10 rounded-2xl rounded-tl-none p-3 space-y-1.5 max-w-[85%] animate-pulse">
              <div className="text-xs text-purple-400 font-medium flex items-center gap-1.5">
                <span>Gemini 正在深度推理中...</span>
              </div>
              <div className="h-3 w-40 bg-white/10 rounded shimmer" />
              <div className="h-8 w-60 bg-white/5 rounded shimmer" />
            </div>
          </div>
        )}

        <div ref={chatBottomRef} />
      </div>

      {/* Input Box */}
      <div className="pt-2">
        <div className="flex items-center gap-2 bg-zinc-900/95 border border-white/15 rounded-2xl p-1.5 shadow-lg">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="问问 Gemini... (Enter 发送，Shift+Enter 换行)"
            rows={1}
            className="flex-1 bg-transparent px-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none resize-none max-h-24 no-scrollbar"
          />

          <button
            onClick={() => handleSend()}
            disabled={isLoading || !input.trim()}
            className="p-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 active:scale-95 text-white transition-all shadow-sm"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
