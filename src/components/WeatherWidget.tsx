'use client';

import React, { useState, useEffect } from 'react';
import { WeatherData, DailyForecast } from '@/types';
import { CITY_PRESETS, CityPreset, DEFAULT_CITY } from '@/lib/services/weatherService';
import {
  MapPin,
  RefreshCw,
  Sun,
  CloudSun,
  Cloud,
  CloudRain,
  CloudDrizzle,
  CloudFog,
  CloudLightning,
  Snowflake,
  Droplets,
  Wind,
  Thermometer,
  Umbrella,
  Compass,
  ChevronDown,
  Navigation,
  Shirt
} from 'lucide-react';

interface WeatherWidgetProps {
  compact?: boolean;
}

export const WeatherWidget: React.FC<WeatherWidgetProps> = ({ compact = false }) => {
  const [selectedCity, setSelectedCity] = useState<CityPreset>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('personal_os_preferred_city');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          return CITY_PRESETS.find(p => p.name === parsed.name) || DEFAULT_CITY;
        } catch (e) {
          // ignore
        }
      }
    }
    return DEFAULT_CITY;
  });

  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false);

  const fetchWeather = async (cityPreset: CityPreset = selectedCity) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/weather?city=${encodeURIComponent(cityPreset.name)}&lat=${cityPreset.lat}&lon=${cityPreset.lon}&district=${encodeURIComponent(cityPreset.district)}`);
      const json = await res.json();
      if (json.success && json.data) {
        setWeather(json.data);
      } else {
        throw new Error(json.error || '获取天气失败');
      }
    } catch (err: any) {
      console.error('Weather widget fetch error:', err);
      setError('无法获取实时天气');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather(selectedCity);
  }, [selectedCity]);

  const handleSelectCity = (preset: CityPreset) => {
    setSelectedCity(preset);
    setIsCityDropdownOpen(false);
    if (typeof window !== 'undefined') {
      localStorage.setItem('personal_os_preferred_city', JSON.stringify(preset));
    }
  };

  // Helper to render weather icon
  const renderWeatherIcon = (code: number, className: string = 'w-6 h-6') => {
    if (code === 0) return <Sun className={`${className} text-amber-400 animate-spin-slow`} />;
    if (code === 1 || code === 2) return <CloudSun className={`${className} text-amber-300`} />;
    if (code === 3) return <Cloud className={`${className} text-slate-300`} />;
    if (code === 45 || code === 48) return <CloudFog className={`${className} text-teal-300`} />;
    if (code === 51 || code === 53 || code === 55) return <CloudDrizzle className={`${className} text-blue-300`} />;
    if ([61, 63, 65, 80, 81, 82].includes(code)) return <CloudRain className={`${className} text-blue-400`} />;
    if ([71, 73, 75, 77, 85, 86].includes(code)) return <Snowflake className={`${className} text-cyan-200`} />;
    if ([95, 96, 99].includes(code)) return <CloudLightning className={`${className} text-purple-400`} />;
    return <CloudSun className={`${className} text-blue-300`} />;
  };

  // Atmospheric gradient styling based on condition
  const getAtmosphericBg = () => {
    if (!weather) return 'from-blue-950/30 via-zinc-900/60 to-purple-950/20';
    const code = weather.weatherCode;
    if (code === 0) return 'from-amber-950/30 via-zinc-900/70 to-blue-950/30 border-amber-500/20';
    if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) return 'from-sky-950/40 via-zinc-900/80 to-blue-950/30 border-sky-500/20';
    if ([95, 96, 99].includes(code)) return 'from-purple-950/40 via-zinc-900/80 to-indigo-950/30 border-purple-500/20';
    return 'from-blue-950/30 via-zinc-900/70 to-zinc-900/90 border-blue-500/20';
  };

  return (
    <div className={`glass-card rounded-3xl p-5 border shadow-xl relative overflow-hidden transition-all bg-gradient-to-br ${getAtmosphericBg()}`}>
      {/* Background soft ambient blur */}
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Bar: Location Switcher & Refresh */}
      <div className="flex items-center justify-between relative z-10 mb-4">
        {/* City Selector */}
        <div className="relative">
          <button
            onClick={() => setIsCityDropdownOpen(!isCityDropdownOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 active:scale-95 transition-all text-xs font-semibold text-white group"
          >
            <MapPin className="w-3.5 h-3.5 text-blue-400 group-hover:text-blue-300" />
            <span>{selectedCity.name}</span>
            <ChevronDown className={`w-3.5 h-3.5 text-zinc-400 transition-transform ${isCityDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* City Selection Popover */}
          {isCityDropdownOpen && (
            <div className="absolute left-0 top-full mt-2 w-56 rounded-2xl bg-zinc-900/95 backdrop-blur-xl border border-white/15 p-2 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-2 py-1 text-[11px] font-semibold text-zinc-400">选择常驻城市 / 辖区</div>
              <div className="max-h-56 overflow-y-auto space-y-1">
                {CITY_PRESETS.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => handleSelectCity(preset)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors ${
                      selectedCity.name === preset.name
                        ? 'bg-blue-600/30 text-blue-300 font-semibold border border-blue-500/30'
                        : 'text-zinc-300 hover:bg-white/5'
                    }`}
                  >
                    <span>{preset.name}</span>
                    {preset.name.includes('重庆') && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 font-normal">
                        山城
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Live sync & status */}
        <div className="flex items-center gap-2">
          {weather && (
            <span className="text-[11px] text-zinc-400">
              {weather.updatedAt} 更新
            </span>
          )}
          <button
            onClick={() => fetchWeather(selectedCity)}
            disabled={loading}
            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-all disabled:opacity-50"
            title="刷新天气"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-blue-400' : ''}`} />
          </button>
        </div>
      </div>

      {loading && !weather ? (
        <div className="py-8 flex flex-col items-center justify-center gap-2 text-zinc-400">
          <RefreshCw className="w-6 h-6 animate-spin text-blue-400" />
          <span className="text-xs">正在连接重庆实时气象台...</span>
        </div>
      ) : error && !weather ? (
        <div className="py-6 text-center text-xs text-red-400">
          <p>{error}</p>
          <button
            onClick={() => fetchWeather(selectedCity)}
            className="mt-2 text-xs text-blue-400 underline"
          >
            重试
          </button>
        </div>
      ) : weather ? (
        <div className="space-y-4 relative z-10">
          {/* Main Temp & Condition Hero Bar */}
          <div className="flex items-center justify-between">
            <div className="flex items-baseline gap-2">
              <span className="text-4xl sm:text-5xl font-black tracking-tight text-white font-mono">
                {Math.round(weather.temperature)}°
              </span>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  {renderWeatherIcon(weather.weatherCode, 'w-4 h-4')}
                  <span className="text-sm font-bold text-zinc-100">{weather.condition}</span>
                </div>
                <span className="text-[11px] text-zinc-400">
                  ↑{weather.tempMax}° / ↓{weather.tempMin}°
                </span>
              </div>
            </div>

            {/* Quick Metrics Badges */}
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="px-2.5 py-1.5 rounded-xl bg-white/5 border border-white/5 flex items-center gap-1.5 text-zinc-300">
                <Thermometer className="w-3.5 h-3.5 text-amber-400" />
                <span>体感 {Math.round(weather.apparentTemperature)}°</span>
              </div>
              <div className="px-2.5 py-1.5 rounded-xl bg-white/5 border border-white/5 flex items-center gap-1.5 text-zinc-300">
                <Droplets className="w-3.5 h-3.5 text-blue-400" />
                <span>湿度 {weather.humidity}%</span>
              </div>
              <div className="px-2.5 py-1.5 rounded-xl bg-white/5 border border-white/5 flex items-center gap-1.5 text-zinc-300">
                <Umbrella className="w-3.5 h-3.5 text-indigo-400" />
                <span>降水 {weather.precipProb}%</span>
              </div>
              <div className="px-2.5 py-1.5 rounded-xl bg-white/5 border border-white/5 flex items-center gap-1.5 text-zinc-300">
                <Wind className="w-3.5 h-3.5 text-emerald-400" />
                <span>风速 {weather.windSpeed}km/h</span>
              </div>
            </div>
          </div>

          {/* Smart Commute & Clothing Banner */}
          <div className="rounded-2xl p-3 bg-white/[0.04] border border-white/10 space-y-2">
            <div className="flex items-start gap-2.5">
              <span className="w-6 h-6 rounded-lg bg-blue-500/20 text-blue-300 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Navigation className="w-3.5 h-3.5 text-blue-400" />
              </span>
              <div className="text-xs">
                <span className="font-semibold text-blue-300 mr-1.5">山城通勤出行:</span>
                <span className="text-zinc-200">{weather.advice.commute}</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <span className="w-6 h-6 rounded-lg bg-purple-500/20 text-purple-300 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Shirt className="w-3.5 h-3.5 text-purple-400" />
              </span>
              <div className="text-xs">
                <span className="font-semibold text-purple-300 mr-1.5">穿衣与体感:</span>
                <span className="text-zinc-200">{weather.advice.clothing}</span>
                <span className="ml-2 px-2 py-0.5 rounded-full bg-white/5 text-[10px] text-zinc-400">
                  {weather.advice.brief}
                </span>
              </div>
            </div>
          </div>

          {/* 5-Day Forecast Row */}
          {!compact && weather.daily && weather.daily.length > 0 && (
            <div className="pt-1 border-t border-white/5">
              <div className="flex items-center justify-between gap-1 overflow-x-auto no-scrollbar py-1">
                {weather.daily.map((item, idx) => (
                  <div
                    key={item.date}
                    className={`flex-1 min-w-[58px] p-2 rounded-xl flex flex-col items-center gap-1.5 text-center transition-all ${
                      idx === 0 ? 'bg-white/10 border border-white/15' : 'bg-transparent hover:bg-white/5'
                    }`}
                  >
                    <span className={`text-[11px] font-medium ${idx === 0 ? 'text-blue-300 font-bold' : 'text-zinc-400'}`}>
                      {item.dayName}
                    </span>
                    <div className="my-0.5">
                      {renderWeatherIcon(item.weatherCode, 'w-4 h-4')}
                    </div>
                    <span className="text-[10px] text-zinc-300 truncate w-full">
                      {item.condition}
                    </span>
                    <span className="text-[11px] font-mono font-semibold text-zinc-200">
                      {item.tempMax}° / {item.tempMin}°
                    </span>
                    {item.precipProb > 30 && (
                      <span className="text-[9px] text-sky-400 font-mono">
                        {item.precipProb}%雨
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
};
