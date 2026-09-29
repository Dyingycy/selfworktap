'use client';

import React, { useState, useEffect } from 'react';
import { QuickLink } from '@/types';
import { Compass, Plus, ExternalLink, Trash2, X } from 'lucide-react';

export const QuickLauncherWidget: React.FC = () => {
  const [links, setLinks] = useState<QuickLink[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newIcon, setNewIcon] = useState('🔗');

  const defaultLinks: QuickLink[] = [
    { id: '1', title: 'GitHub', url: 'https://github.com', icon: '🐙', color: 'bg-zinc-800' },
    { id: '2', title: 'Notion', url: 'https://notion.so', icon: '📓', color: 'bg-zinc-800' },
    { id: '3', title: '少数派', url: 'https://sspai.com', icon: '🔴', color: 'bg-red-950/40' },
    { id: '4', title: 'V2EX', url: 'https://v2ex.com', icon: '💬', color: 'bg-zinc-800' },
    { id: '5', title: 'Bilibili', url: 'https://bilibili.com', icon: '📺', color: 'bg-pink-950/40' },
    { id: '6', title: '掘金', url: 'https://juejin.cn', icon: '⛏️', color: 'bg-blue-950/40' },
    { id: '7', title: 'HackerNews', url: 'https://news.ycombinator.com', icon: '⚡', color: 'bg-orange-950/40' },
    { id: '8', title: 'AI Studio', url: 'https://aistudio.google.com', icon: '✨', color: 'bg-purple-950/40' },
  ];

  useEffect(() => {
    try {
      const saved = localStorage.getItem('techradar_quicklinks');
      if (saved) setLinks(JSON.parse(saved));
      else {
        setLinks(defaultLinks);
        localStorage.setItem('techradar_quicklinks', JSON.stringify(defaultLinks));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const saveLinks = (updated: QuickLink[]) => {
    setLinks(updated);
    localStorage.setItem('techradar_quicklinks', JSON.stringify(updated));
  };

  const handleAddLink = () => {
    if (!newTitle.trim() || !newUrl.trim()) return;
    let url = newUrl.trim();
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }
    const item: QuickLink = {
      id: `link-${Date.now()}`,
      title: newTitle.trim(),
      url,
      icon: newIcon || '🌐',
    };
    saveLinks([...links, item]);
    setNewTitle('');
    setNewUrl('');
    setIsAdding(false);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    saveLinks(links.filter((l) => l.id !== id));
  };

  return (
    <div className="glass-card rounded-3xl p-5 border border-white/10 space-y-3.5 shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">高频常用捷径 Dock</h3>
          </div>
        </div>

        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 font-medium px-2 py-1 rounded-xl bg-blue-500/10 border border-blue-500/20 active:scale-95 transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>添加</span>
        </button>
      </div>

      {/* Add Form */}
      {isAdding && (
        <div className="p-3 bg-zinc-900/90 rounded-2xl border border-white/15 space-y-2.5 animate-in fade-in duration-150">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-200">添加快捷入口</span>
            <button onClick={() => setIsAdding(false)} className="text-zinc-500 hover:text-zinc-300">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="grid grid-cols-4 gap-2">
            <input
              type="text"
              value={newIcon}
              onChange={(e) => setNewIcon(e.target.value)}
              placeholder="图标/Emoji"
              className="col-span-1 bg-zinc-800 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-center text-white"
            />
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="标题名称"
              className="col-span-3 bg-zinc-800 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white"
            />
          </div>
          <input
            type="text"
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            placeholder="网站链接 (如 https://github.com)"
            className="w-full bg-zinc-800 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white"
          />
          <button
            onClick={handleAddLink}
            className="w-full py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold"
          >
            确认添加
          </button>
        </div>
      )}

      {/* Links Grid */}
      <div className="grid grid-cols-4 sm:grid-cols-4 gap-2.5 pt-1">
        {links.map((link) => (
          <a
            key={link.id}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative flex flex-col items-center justify-center p-2.5 rounded-2xl bg-zinc-900/60 hover:bg-zinc-800/80 border border-white/5 hover:border-white/20 transition-all active:scale-95 space-y-1"
          >
            <span className="text-xl group-hover:scale-110 transition-transform">
              {link.icon}
            </span>
            <span className="text-[11px] font-medium text-zinc-300 group-hover:text-white truncate max-w-full">
              {link.title}
            </span>

            <button
              onClick={(e) => handleDelete(link.id, e)}
              className="absolute top-1 right-1 p-0.5 text-zinc-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
              title="删除"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </a>
        ))}
      </div>
    </div>
  );
};
