'use client';

import React from 'react';
import { LayoutDashboard, Dumbbell, Radio, Bot, Settings2 } from 'lucide-react';

interface BottomTabBarProps {
  activeTab: string;
  onChangeTab: (tab: string) => void;
}

export const BottomTabBar: React.FC<BottomTabBarProps> = ({ activeTab, onChangeTab }) => {
  const tabs = [
    { id: 'workbench', label: '工作台', icon: LayoutDashboard, color: 'text-blue-400' },
    { id: 'fitness', label: '铁馆打卡', icon: Dumbbell, color: 'text-rose-400' },
    { id: 'radar', label: '情报雷达', icon: Radio, color: 'text-amber-400' },
    { id: 'aichat', label: 'AI 智囊', icon: Bot, color: 'text-purple-400' },
    { id: 'settings', label: '设置', icon: Settings2, color: 'text-zinc-400' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none pb-[max(12px,env(safe-area-inset-bottom))] px-4">
      <div className="max-w-md mx-auto pointer-events-auto">
        <div className="glass-dock rounded-full px-2.5 py-1.5 flex items-center justify-around">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => onChangeTab(tab.id)}
                className={`relative flex flex-col items-center justify-center py-1.5 px-4 rounded-full transition-all duration-200 active:scale-90 ${
                  isActive ? 'text-white' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {isActive && (
                  <span className="absolute inset-0 bg-white/10 rounded-full -z-10 shadow-inner" />
                )}
                <Icon
                  className={`w-5 h-5 transition-transform duration-200 ${
                    isActive ? `scale-110 ${tab.color}` : 'scale-100'
                  }`}
                />
                <span
                  className={`text-[10px] mt-0.5 font-medium ${
                    isActive ? 'text-zinc-100 font-semibold' : 'text-zinc-400'
                  }`}
                >
                  {tab.label}
                </span>
                {isActive && (
                  <span className="w-1 h-1 rounded-full bg-blue-400 mt-0.5 animate-pulse" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
