import React, { useEffect, useState } from 'react';
import { RefreshCw, Moon, Sun, MonitorUp, Eye, EyeOff, MapPin, Building2 } from 'lucide-react';
import { Solar, Lunar } from 'lunar-javascript';
import { LocationId } from '../types';

interface HeaderProps {
  weatherUpdateTime: string;
  transportUpdateTime: string;
  isRefreshing: boolean;
  onRefresh: () => void;
  nightMode: boolean;
  onToggleNightMode: () => void;
  isWakeLocked: boolean;
  onToggleWakeLock: () => void;
  japaneseDateFormat: boolean;
  onToggleDateFormat: () => void;
  hasError?: boolean;
  errorMessage?: string;
  countdownSeconds?: number;
  selectedLocation: LocationId;
  onSelectLocation: (loc: LocationId) => void;
}

const CHINESE_WEEKDAYS = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];

// Get accurate Hong Kong local time regardless of user's browser/system timezone
function getHongKongDate(): Date {
  try {
    const now = new Date();
    const hktString = now.toLocaleString('en-US', { timeZone: 'Asia/Hong_Kong' });
    return new Date(hktString);
  } catch (e) {
    return new Date();
  }
}

// Generate rich Chinese & Lunar date representation using lunar-javascript
function getCulturalDateDetails(date: Date) {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const weekday = date.getDay();
  const weekdayStr = CHINESE_WEEKDAYS[weekday];

  let lunarStr = '';
  let jieqiStr = '';
  let ganzhiStr = '';

  try {
    const solar = Solar.fromDate(date);
    const lunar = solar.getLunar();
    const ganzhiYear = lunar.getYearInGanZhi();
    const shengxiao = lunar.getYearShengXiao();
    const lunarMonth = lunar.getMonthInChinese();
    const lunarDay = lunar.getDayInChinese();
    const jieqi = lunar.getJieQi();

    ganzhiStr = `${ganzhiYear}年【${shengxiao}年】`;
    lunarStr = `農曆 ${lunarMonth}月${lunarDay}`;
    if (jieqi) {
      jieqiStr = `節氣 · ${jieqi}`;
    } else {
      const prevJie = lunar.getPrevJieQi(true);
      if (prevJie) {
        jieqiStr = `節氣 · ${prevJie.getName()}`;
      }
    }
  } catch (err) {
    lunarStr = '農曆七月十六';
    jieqiStr = '處暑節氣';
  }

  return {
    solarDateStr: `${year}年${month}月${day}日 ${weekdayStr}`,
    lunarStr,
    jieqiStr,
    ganzhiStr,
  };
}

export const Header: React.FC<HeaderProps> = ({
  weatherUpdateTime,
  transportUpdateTime,
  isRefreshing,
  onRefresh,
  nightMode,
  onToggleNightMode,
  isWakeLocked,
  onToggleWakeLock,
  japaneseDateFormat,
  onToggleDateFormat,
  hasError = false,
  errorMessage,
  countdownSeconds = 20,
  selectedLocation,
  onSelectLocation,
}) => {
  const [time, setTime] = useState<Date>(() => getHongKongDate());
  const [countdown, setCountdown] = useState<number>(countdownSeconds);

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(getHongKongDate());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    setCountdown(countdownSeconds);
  }, [countdownSeconds, isRefreshing]);

  useEffect(() => {
    const countdownTimer = setInterval(() => {
      setCountdown((prev) => (prev <= 1 ? countdownSeconds : prev - 1));
    }, 1000);
    return () => clearInterval(countdownTimer);
  }, [countdownSeconds]);

  const hours = time.getHours().toString().padStart(2, '0');
  const minutes = time.getMinutes().toString().padStart(2, '0');
  const seconds = time.getSeconds().toString().padStart(2, '0');

  const { solarDateStr, lunarStr, jieqiStr, ganzhiStr } = getCulturalDateDetails(time);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  return (
    <header
      id="dashboard-header"
      className="w-full flex flex-row justify-between items-center gap-2 sm:gap-3 mb-1.5 sm:mb-2.5 transition-colors duration-300 shrink-0"
    >
      {/* Left: Real-time Live Clock & Location Switcher */}
      <div className="flex flex-col">
        <div className="flex items-baseline gap-2 sm:gap-3">
          <h1
            id="main-clock"
            className={`text-3xl sm:text-5xl lg:text-6xl font-light tracking-tighter font-digits leading-none flex items-baseline select-none ${
              nightMode ? 'text-[#f5ede8]' : 'text-black'
            }`}
          >
            <span>{hours}:{minutes}</span>
            <span className={`text-xl sm:text-3xl lg:text-4xl ml-1 sm:ml-1.5 font-normal ${nightMode ? 'opacity-40' : 'text-stone-500'}`}>
              :{seconds}
            </span>
          </h1>

          {/* Location Switcher Pills (TKO / TST) */}
          <div
            id="location-switcher"
            className={`flex items-center p-0.5 sm:p-1 rounded-xl sm:rounded-2xl border backdrop-blur-sm transition-all shadow-sm ${
              nightMode
                ? 'bg-stone-800/90 border-stone-700'
                : 'bg-[#f7f4f2] border-[#e8e2de]'
            }`}
          >
            <button
              id="loc-tko-btn"
              onClick={() => onSelectLocation('TKO')}
              className={`px-2 sm:px-3 py-1 rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1 sm:gap-1.5 transition-all ${
                selectedLocation === 'TKO'
                  ? nightMode
                    ? 'bg-amber-500/20 border border-amber-400/40 text-amber-300 shadow-sm'
                    : 'bg-black text-white shadow-sm'
                  : nightMode
                  ? 'text-stone-400 hover:text-stone-200'
                  : 'text-stone-600 hover:text-black'
              }`}
            >
              <MapPin className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
              <span>將軍澳</span>
              <span className="text-[10px] hidden md:inline font-normal opacity-80">(富康花園)</span>
            </button>

            <button
              id="loc-tst-btn"
              onClick={() => onSelectLocation('TST')}
              className={`px-2 sm:px-3 py-1 rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1 sm:gap-1.5 transition-all ${
                selectedLocation === 'TST'
                  ? nightMode
                    ? 'bg-amber-500/20 border border-amber-400/40 text-amber-300 shadow-sm'
                    : 'bg-black text-white shadow-sm'
                  : nightMode
                  ? 'text-stone-400 hover:text-stone-200'
                  : 'text-stone-600 hover:text-black'
              }`}
            >
              <Building2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
              <span>尖沙咀</span>
              <span className="text-[10px] hidden md:inline font-normal opacity-80">(港威大廈5座)</span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 mt-0.5 sm:mt-1 flex-wrap">
          {/* Chinese Gregorian Date */}
          <span
            id="current-gregorian-date"
            className={`text-[11px] sm:text-xs lg:text-sm font-bold tracking-wide ${
              nightMode ? 'text-[#f5ede8]' : 'text-black'
            }`}
          >
            {solarDateStr}
          </span>

          <span className={nightMode ? 'text-stone-600' : 'text-stone-400'}>·</span>

          {/* Lunar Date & Solar Term */}
          <span
            id="current-lunar-date"
            className={`text-[11px] sm:text-xs font-serif font-bold ${
              nightMode ? 'text-amber-300/90' : 'text-[#8b4513]'
            }`}
          >
            {lunarStr}
          </span>

          {jieqiStr && (
            <span
              id="current-jieqi"
              className={`text-[10px] sm:text-[11px] px-1.5 py-0.2 rounded border font-serif font-bold ${
                nightMode
                  ? 'bg-amber-950/40 border-amber-800/60 text-amber-300'
                  : 'bg-[#fbf5f2] border-[#e8d7cf] text-[#8b4513]'
              }`}
            >
              {jieqiStr}
            </span>
          )}

          {/* Location Full Address Badge */}
          <span
            id="location-badge"
            className={`text-[10px] sm:text-[11px] px-2 py-0.2 rounded-full border font-bold ${
              nightMode
                ? 'bg-stone-800/80 border-stone-700 text-[#b0a59e]'
                : 'bg-[#fcfaf9] border-[#e8e2de] text-stone-800'
            }`}
          >
            {selectedLocation === 'TST'
              ? '九龍 尖沙咀 廣東道15號 港威大廈第5座'
              : '將軍澳 唐明街 富康花園'}
          </span>
        </div>
      </div>

      {/* Right: System Status & Action Controls */}
      <div className="flex items-center gap-2 shrink-0">
        <div
          id="system-status-card"
          className={`backdrop-blur-md rounded-2xl p-1.5 sm:p-2.5 flex flex-col items-end border shadow-organic-sm transition-all ${
            hasError
              ? 'bg-red-50/90 border-red-200 text-red-700'
              : nightMode
              ? 'bg-stone-900/80 border-stone-700/80 text-stone-200'
              : 'bg-white border-[#e8e2de] text-black'
          }`}
        >
          <div className="flex items-center justify-between w-full gap-2 sm:gap-3 mb-0.5">
            <span className={`text-[10px] uppercase tracking-widest font-bold ${nightMode ? 'text-stone-400' : 'text-stone-600'}`}>
              STATUS
            </span>
            <div className={`flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-[11px] font-mono font-bold ${nightMode ? 'text-stone-300' : 'text-stone-700'}`}>
              <span>🌦️ {weatherUpdateTime || '--:--'}</span>
              <span>🚇 {transportUpdateTime || '--:--'}</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Status indicator badge */}
            <div className="flex items-center gap-1.5">
              {hasError ? (
                <>
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-ping"></div>
                  <span className="text-[10px] sm:text-xs font-bold text-red-600">
                    重試連線中
                  </span>
                </>
              ) : (
                <>
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse-warm"></div>
                  <span className={`text-[10px] sm:text-xs font-bold ${nightMode ? 'text-stone-200' : 'text-black'}`}>連線正常</span>
                </>
              )}
            </div>

            {/* Utility buttons */}
            <div className="flex items-center gap-1 ml-1 sm:ml-1.5 pl-1 sm:pl-1.5 border-l border-[#e8e2de] dark:border-stone-700">
              {/* Screen Wake Lock */}
              <button
                id="toggle-wakelock-btn"
                onClick={onToggleWakeLock}
                title={isWakeLocked ? '螢幕恆亮已開啟' : '點擊開啟螢幕恆亮 (iPad Kiosk模式)'}
                className={`p-1 sm:p-1.5 rounded-xl text-xs transition-colors ${
                  isWakeLocked
                    ? 'bg-emerald-500 text-white'
                    : nightMode
                    ? 'text-stone-400 hover:bg-stone-800'
                    : 'text-stone-600 hover:bg-stone-200'
                }`}
              >
                {isWakeLocked ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              </button>

              {/* Night Mode */}
              <button
                id="toggle-night-mode-btn"
                onClick={onToggleNightMode}
                title={nightMode ? '切換自然暖光' : '切換柔和夜間模式'}
                className={`p-1 sm:p-1.5 rounded-xl text-xs transition-colors ${
                  nightMode
                    ? 'text-amber-300 hover:bg-stone-800'
                    : 'text-stone-600 hover:bg-stone-200'
                }`}
              >
                {nightMode ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
              </button>

              {/* Fullscreen */}
              <button
                id="fullscreen-toggle-btn"
                onClick={toggleFullscreen}
                title="全螢幕 Kiosk 模式"
                className={`p-1 sm:p-1.5 rounded-xl text-xs transition-colors hidden sm:block ${
                  nightMode ? 'text-stone-400 hover:bg-stone-800' : 'text-stone-600 hover:bg-stone-200'
                }`}
              >
                <MonitorUp className="w-3.5 h-3.5" />
              </button>

              {/* Refresh Button with 20s Polling Countdown */}
              <button
                id="manual-refresh-btn"
                onClick={onRefresh}
                disabled={isRefreshing}
                className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 rounded-xl text-[11px] sm:text-xs font-semibold tracking-wide transition-all active:scale-95 shadow-organic-sm ${
                  nightMode
                    ? 'bg-stone-800 text-stone-100 hover:bg-stone-700 border border-stone-600'
                    : 'bg-black text-white hover:bg-stone-800'
                }`}
              >
                <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span>更新</span>
                <span className="opacity-60 text-[10px]">({countdown}s)</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
