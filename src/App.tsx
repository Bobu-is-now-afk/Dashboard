import React, { useEffect, useState, useCallback } from 'react';
import { Header } from './components/Header';
import { WeatherCard } from './components/WeatherCard';
import { TransportCard } from './components/TransportCard';
import { RotatePrompt } from './components/RotatePrompt';
import { fetchHkoWeather } from './services/weatherService';
import { fetchMtrSchedule, fetchBusEtas } from './services/transportService';
import { WeatherData, MtrDirectionData, MtrStationSchedule, BusEtaItem, LocationId } from './types';

export default function App() {
  const [selectedLocation, setSelectedLocation] = useState<LocationId>(() => {
    const saved = localStorage.getItem('beverly_location');
    return (saved === 'TST' || saved === 'TKO') ? saved : 'TKO';
  });

  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [weatherLoading, setWeatherLoading] = useState<boolean>(true);
  const [weatherUpdateTime, setWeatherUpdateTime] = useState<string>('');

  const [mtrStations, setMtrStations] = useState<MtrStationSchedule[]>([]);
  const [mtrUp, setMtrUp] = useState<MtrDirectionData | null>(null);
  const [mtrDown, setMtrDown] = useState<MtrDirectionData | null>(null);
  const [buses, setBuses] = useState<BusEtaItem[]>([]);
  const [transportLoading, setTransportLoading] = useState<boolean>(true);
  const [transportUpdateTime, setTransportUpdateTime] = useState<string>('');

  const [hasApiError, setHasApiError] = useState<boolean>(false);
  const [apiErrorMessage, setApiErrorMessage] = useState<string>('');

  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [nightMode, setNightMode] = useState<boolean>(() => {
    return localStorage.getItem('beverly_night_mode') === 'true';
  });
  const [isWakeLocked, setIsWakeLocked] = useState<boolean>(false);
  const [wakeLockSentinel, setWakeLockSentinel] = useState<any>(null);
  const [japaneseDateFormat, setJapaneseDateFormat] = useState<boolean>(() => {
    return localStorage.getItem('beverly_jp_date') !== 'false';
  });

  // Device orientation state: true when device is held in portrait mode
  const [isPortrait, setIsPortrait] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.innerHeight > window.innerWidth;
  });

  useEffect(() => {
    const handleResizeOrOrientation = () => {
      setIsPortrait(window.innerHeight > window.innerWidth);
    };

    window.addEventListener('resize', handleResizeOrOrientation);
    window.addEventListener('orientationchange', handleResizeOrOrientation);

    return () => {
      window.removeEventListener('resize', handleResizeOrOrientation);
      window.removeEventListener('orientationchange', handleResizeOrOrientation);
    };
  }, []);

  // Load weather data
  const loadWeather = useCallback(async (loc: LocationId = selectedLocation) => {
    try {
      const data = await fetchHkoWeather(loc);
      setWeather(data);
      setWeatherUpdateTime(data.updateTime);
      setHasApiError(false);
    } catch (err) {
      console.warn('Weather fetch encountered issue:', err);
    } finally {
      setWeatherLoading(false);
    }
  }, [selectedLocation]);

  // Load transport data (MTR & Bus)
  const loadTransport = useCallback(
    async (loc: LocationId = selectedLocation) => {
      try {
        const [mtrRes, busRes] = await Promise.allSettled([
          fetchMtrSchedule(loc),
          fetchBusEtas(loc),
        ]);

        let errorCount = 0;

        if (mtrRes.status === 'fulfilled') {
          setMtrStations(mtrRes.value.stations || []);
          setMtrUp(mtrRes.value.upDirection);
          setMtrDown(mtrRes.value.downDirection);
          setTransportUpdateTime(mtrRes.value.updateTime);
        } else {
          errorCount++;
        }

        if (busRes.status === 'fulfilled') {
          setBuses(busRes.value);
        } else {
          errorCount++;
        }

        if (errorCount > 1) {
          setHasApiError(true);
          setApiErrorMessage('部分交通 API 回應超時，正在自動重試');
        } else {
          setHasApiError(false);
        }
      } catch (err) {
        console.warn('Transport fetch encountered issue:', err);
        setHasApiError(true);
      } finally {
        setTransportLoading(false);
      }
    },
    [selectedLocation]
  );

  // Handle Location Switch
  const handleSelectLocation = (loc: LocationId) => {
    if (loc === selectedLocation) return;
    setSelectedLocation(loc);
    localStorage.setItem('beverly_location', loc);
    setWeatherLoading(true);
    setTransportLoading(true);
    loadWeather(loc);
    loadTransport(loc);
  };

  // Manual refresh all data
  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([loadWeather(selectedLocation), loadTransport(selectedLocation)]);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 500);
  };

  // Toggle Night Mode
  const handleToggleNightMode = () => {
    setNightMode((prev) => {
      const next = !prev;
      localStorage.setItem('beverly_night_mode', String(next));
      return next;
    });
  };

  // Toggle Date Format
  const handleToggleDateFormat = () => {
    setJapaneseDateFormat((prev) => {
      const next = !prev;
      localStorage.setItem('beverly_jp_date', String(next));
      return next;
    });
  };

  // Handle Screen Wake Lock for iPad Mini / Kiosk
  const handleToggleWakeLock = async () => {
    if ('wakeLock' in navigator) {
      if (!isWakeLocked) {
        try {
          const sentinel = await (navigator as any).wakeLock.request('screen');
          setWakeLockSentinel(sentinel);
          setIsWakeLocked(true);
          sentinel.addEventListener('release', () => {
            setIsWakeLocked(false);
            setWakeLockSentinel(null);
          });
        } catch (err) {
          console.warn('Wake Lock request failed:', err);
        }
      } else if (wakeLockSentinel) {
        await wakeLockSentinel.release();
        setWakeLockSentinel(null);
        setIsWakeLocked(false);
      }
    }
  };

  // Sync dark class to <html> element
  useEffect(() => {
    if (nightMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [nightMode]);

  // Initial load & periodic polling (MTR 20s, Weather 5min)
  useEffect(() => {
    loadWeather(selectedLocation);
    loadTransport(selectedLocation);

    // Auto refresh transport every 20 seconds
    const transportInterval = setInterval(() => {
      loadTransport(selectedLocation);
    }, 20000);

    // Auto refresh weather every 5 minutes
    const weatherInterval = setInterval(() => {
      loadWeather(selectedLocation);
    }, 300000);

    return () => {
      clearInterval(transportInterval);
      clearInterval(weatherInterval);
    };
  }, [selectedLocation, loadWeather, loadTransport]);

  // If in portrait mode, force user to rotate device to landscape
  if (isPortrait) {
    return <RotatePrompt nightMode={nightMode} />;
  }

  return (
    <main
      id="dashboard-root-container"
      className={`h-screen max-h-screen w-full transition-colors duration-500 flex flex-col justify-between p-2.5 sm:p-3 lg:p-4 overflow-hidden select-none ${
        nightMode ? 'bg-stone-950 text-stone-100' : 'bg-[#faf7f5] text-stone-900'
      }`}
    >
      <div className="w-full h-full mx-auto flex flex-col justify-between gap-2 sm:gap-2.5 overflow-hidden">
        {/* Top Header: Clock, Cultural Date, Location Switcher, Status Controls */}
        <div className="shrink-0">
          <Header
            weatherUpdateTime={weatherUpdateTime}
            transportUpdateTime={transportUpdateTime}
            isRefreshing={isRefreshing}
            onRefresh={handleManualRefresh}
            nightMode={nightMode}
            onToggleNightMode={handleToggleNightMode}
            isWakeLocked={isWakeLocked}
            onToggleWakeLock={handleToggleWakeLock}
            japaneseDateFormat={japaneseDateFormat}
            onToggleDateFormat={handleToggleDateFormat}
            hasError={hasApiError}
            errorMessage={apiErrorMessage}
            countdownSeconds={20}
            selectedLocation={selectedLocation}
            onSelectLocation={handleSelectLocation}
          />
        </div>

        {/* Middle Area: Left WeatherCard + Right TransportCard (Fits 100% of remaining screen height) */}
        <div className="grid grid-cols-12 gap-2.5 sm:gap-3 flex-1 min-h-0 overflow-hidden items-stretch">
          {/* Left: WeatherCard (5 cols) */}
          <div className="col-span-5 h-full min-h-0 overflow-hidden">
            <WeatherCard
              weather={weather}
              loading={weatherLoading}
              nightMode={nightMode}
            />
          </div>

          {/* Right: TransportCard (7 cols) */}
          <div className="col-span-7 h-full min-h-0 overflow-hidden">
            <TransportCard
              mtrUp={mtrUp}
              mtrDown={mtrDown}
              stations={mtrStations}
              buses={buses}
              loading={transportLoading}
              nightMode={nightMode}
              selectedLocation={selectedLocation}
            />
          </div>
        </div>
      </div>
    </main>
  );
}

