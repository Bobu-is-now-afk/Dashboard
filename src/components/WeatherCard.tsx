import React, { useState } from 'react';
import { WeatherData } from '../types';
import { getHkoIconUrl, HKO_ICON_MAP } from '../services/weatherService';
import { Droplets, Umbrella, AlertTriangle, Sun, CloudRain, Wind, Thermometer, Calendar } from 'lucide-react';

interface WeatherCardProps {
  weather: WeatherData | null;
  loading: boolean;
  nightMode: boolean;
}

export const WeatherCard: React.FC<WeatherCardProps> = ({ weather, loading, nightMode }) => {
  const [viewMode, setViewMode] = useState<'hourly' | '9day'>('hourly');

  if (loading && !weather) {
    return (
      <div
        id="weather-card-loading"
        className={`h-full min-h-[440px] rounded-[32px] p-8 flex flex-col items-center justify-center animate-pulse border shadow-organic-sm ${
          nightMode ? 'bg-stone-900 border-stone-800' : 'bg-white border-[#efeeec]'
        }`}
      >
        <div className="w-12 h-12 rounded-full bg-stone-200 dark:bg-stone-800 animate-spin mb-4" />
        <p className="text-[#a89d96] font-medium text-sm">載入香港天文台即時天氣中...</p>
      </div>
    );
  }

  const data = weather || {
    temperature: 26,
    place: '將軍澳',
    humidity: 72,
    rainfall: 0,
    weatherDescription: '大致多雲，日間部分時間有陽光，天氣炎熱。',
    iconId: 53,
    todayMinTemp: 24,
    todayMaxTemp: 29,
    psr: '中',
    uvIndex: 6,
    uvLevel: '中等',
    warnings: [],
    hourlyForecast: [],
    nineDayForecast: [],
    updateTime: '08:24',
  };

  const psrPercentage =
    data.psr === '高' ? '80%' : data.psr === '中高' ? '60%' : data.psr === '中' ? '40%' : '15%';

  return (
    <div
      id="weather-main-card"
      className={`h-full rounded-[22px] sm:rounded-[26px] p-3.5 sm:p-4 lg:p-5 flex flex-col justify-between transition-all duration-300 border shadow-organic-sm overflow-hidden ${
        nightMode
          ? 'bg-stone-900 border-stone-800 text-stone-100'
          : 'bg-white border-[#efeeec] text-black'
      }`}
    >
      <div className="flex-1 flex flex-col justify-between min-h-0">
        {/* Header: 將軍澳即時天氣 + Weather Icon */}
        <div className="flex justify-between items-start mb-2 shrink-0">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className={`text-sm sm:text-base font-bold ${nightMode ? 'text-white' : 'text-black'}`}>
                {data.place || '將軍澳'}即時天氣
              </span>
              <button
                id="weather-view-mode-btn"
                onClick={() => setViewMode((prev) => (prev === 'hourly' ? '9day' : 'hourly'))}
                className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border transition-colors ${
                  nightMode
                    ? 'bg-stone-800 border-stone-700 text-stone-200 hover:bg-stone-700'
                    : 'bg-[#fcfaf9] border-[#e8e2de] text-black hover:bg-[#f5ede8]'
                }`}
              >
                {viewMode === 'hourly' ? '逐時 ▾' : '七日 ▾'}
              </button>
            </div>

            <h2
              id="main-temperature-value"
              className={`text-4xl sm:text-5xl lg:text-6xl font-light font-digits mt-0.5 tracking-tighter leading-none ${
                nightMode ? 'text-stone-100' : 'text-black'
              }`}
            >
              {data.temperature}
              <span className="text-2xl sm:text-3xl opacity-75 ml-0.5">°C</span>
            </h2>
          </div>

          {/* Golden Sun/Weather Icon Graphic */}
          <div className="flex flex-col items-center">
            <img
              src={getHkoIconUrl(data.iconId)}
              alt="HKO Weather Icon"
              className="w-12 h-12 sm:w-14 sm:h-14 object-contain drop-shadow-sm transition-transform hover:scale-105"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            <span className={`text-[11px] font-bold mt-0.5 ${nightMode ? 'text-stone-300' : 'text-black'}`}>
              {HKO_ICON_MAP[data.iconId] || '天文台即時'}
            </span>
          </div>
        </div>

        {/* Warning messages if active */}
        {data.warnings && data.warnings.length > 0 && (
          <div className="mb-2 space-y-1 shrink-0">
            {data.warnings.map((warn, idx) => (
              <div
                key={idx}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 text-xs font-bold animate-pulse-warm"
              >
                <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-amber-600 dark:text-amber-400" />
                <span className="truncate">{warn.name}</span>
              </div>
            ))}
          </div>
        )}

        {/* 3-Grid Stat Pills: [濕度] [降雨機率] [空氣質素 AQHI] */}
        <div className="grid grid-cols-3 gap-2 mb-2 shrink-0">
          <div
            id="humidity-stat-pill"
            className={`p-2 sm:p-2.5 rounded-xl border transition-all ${
              nightMode
                ? 'bg-stone-800/80 border-stone-700 text-stone-200'
                : 'bg-[#fcfaf9] border-[#e8e2de] text-black'
            }`}
          >
            <div className={`text-[11px] font-semibold ${nightMode ? 'text-stone-400' : 'text-stone-700'}`}>相對濕度</div>
            <div className={`text-sm sm:text-base font-bold font-digits mt-0.5 ${nightMode ? 'text-white' : 'text-black'}`}>
              {data.humidity}%
            </div>
          </div>

          <div
            id="rainfall-stat-pill"
            className={`p-2 sm:p-2.5 rounded-xl border transition-all ${
              nightMode
                ? 'bg-stone-800/80 border-stone-700 text-stone-200'
                : 'bg-[#fcfaf9] border-[#e8e2de] text-black'
            }`}
          >
            <div className={`text-[11px] font-semibold ${nightMode ? 'text-stone-400' : 'text-stone-700'}`}>降雨機率</div>
            <div className={`text-sm sm:text-base font-bold mt-0.5 ${nightMode ? 'text-white' : 'text-black'}`}>
              {data.psr} <span className={`text-[10px] font-semibold ${nightMode ? 'text-stone-400' : 'text-stone-600'}`}>({psrPercentage})</span>
            </div>
          </div>

          <div
            id="aqhi-stat-pill"
            className={`p-2 sm:p-2.5 rounded-xl border transition-all ${
              nightMode
                ? 'bg-stone-800/80 border-stone-700 text-stone-200'
                : 'bg-[#fcfaf9] border-[#e8e2de] text-black'
            }`}
          >
            <div className={`text-[11px] font-semibold ${nightMode ? 'text-stone-400' : 'text-stone-700'}`}>空氣質素 (AQHI)</div>
            <div className="text-sm sm:text-base font-bold font-digits mt-0.5 text-emerald-600 dark:text-emerald-400">
              {data.aqhi?.index || 3} <span className={`text-[10px] font-sans font-bold ${nightMode ? 'text-emerald-400' : 'text-emerald-700'}`}>{data.aqhi?.level || '低'}</span>
            </div>
          </div>
        </div>

        {/* Detailed Rows with subtle border dividers */}
        <div className="space-y-1 shrink-0">
          <div
            className={`flex items-center justify-between py-1 px-2 border-b text-xs ${
              nightMode ? 'border-stone-800' : 'border-[#f0edeb]'
            }`}
          >
            <span className={`font-semibold ${nightMode ? 'text-stone-400' : 'text-stone-700'}`}>今日氣溫預測</span>
            <span className={`font-bold font-digits ${nightMode ? 'text-white' : 'text-black'}`}>
              {data.todayMinTemp}°C - {data.todayMaxTemp}°C
            </span>
          </div>

          <div
            className={`flex items-center justify-between py-1 px-2 border-b text-xs ${
              nightMode ? 'border-stone-800' : 'border-[#f0edeb]'
            }`}
          >
            <span className={`font-semibold ${nightMode ? 'text-stone-400' : 'text-stone-700'}`}>紫外線指數 (UV)</span>
            <span className="font-bold text-amber-600 dark:text-amber-400">
              {data.uvIndex !== undefined ? `UV ${data.uvIndex}` : 'UV 5'} · {data.uvLevel || '中等'}
            </span>
          </div>

          <div
            className={`flex items-center justify-between py-1 px-2 text-xs`}
          >
            <span className={`font-semibold ${nightMode ? 'text-stone-400' : 'text-stone-700'}`}>天氣概況</span>
            <span className={`font-bold max-w-[200px] truncate text-right ${nightMode ? 'text-white' : 'text-black'}`}>
              {data.weatherDescription}
            </span>
          </div>
        </div>
      </div>

      {/* Hourly / 9-Day Forecast Timeline */}
      <div
        className={`mt-2 pt-1.5 border-t shrink-0 ${
          nightMode ? 'border-stone-800' : 'border-[#f0edeb]'
        }`}
      >
        <div className={`flex items-center justify-between text-[11px] font-semibold mb-1.5 ${nightMode ? 'text-stone-400' : 'text-stone-700'}`}>
          <span>{viewMode === 'hourly' ? '每小時氣溫預測' : '未來七日預報'}</span>
          <span>{viewMode === 'hourly' ? '逐時趨勢' : '未來一週'}</span>
        </div>

        {viewMode === 'hourly' ? (
          <div className="grid grid-cols-6 gap-1.5 text-center">
            {data.hourlyForecast.slice(0, 6).map((hf, i) => (
              <div
                key={i}
                className={`py-1.5 px-0.5 rounded-lg transition-all ${
                  nightMode ? 'bg-stone-800/70 border border-stone-700' : 'bg-[#fcfaf9] border border-[#e8e2de]'
                }`}
              >
                <div className={`text-[10px] font-mono font-semibold ${nightMode ? 'text-stone-400' : 'text-stone-700'}`}>{hf.time}</div>
                <div className={`text-xs font-digits font-bold my-0.5 ${nightMode ? 'text-white' : 'text-black'}`}>
                  {hf.temp}°
                </div>
                <div className={`text-[9px] font-bold font-mono ${nightMode ? 'text-stone-400' : 'text-stone-700'}`}>
                  {hf.pop || 20}%
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex gap-1.5 overflow-x-auto pb-0.5">
            {data.nineDayForecast.slice(0, 6).map((df, i) => (
              <div
                key={i}
                className={`flex-1 min-w-[44px] py-1 px-0.5 rounded-lg text-center shrink-0 ${
                  nightMode ? 'bg-stone-800/70 border border-stone-700' : 'bg-[#fcfaf9] border border-[#e8e2de]'
                }`}
              >
                <div className={`text-[9px] font-semibold ${nightMode ? 'text-stone-400' : 'text-stone-700'}`}>{df.date}</div>
                <div className={`text-[9px] font-bold ${nightMode ? 'text-white' : 'text-black'}`}>{df.week}</div>
                <img
                  src={getHkoIconUrl(df.iconId)}
                  alt=""
                  className="w-3.5 h-3.5 mx-auto my-0.5"
                />
                <div className={`text-[10px] font-digits font-bold ${nightMode ? 'text-white' : 'text-black'}`}>
                  {df.minTemp}-{df.maxTemp}°
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
