import React, { useState } from 'react';
import { MtrDirectionData, MtrStationSchedule, BusEtaItem, LocationId } from '../types';

interface TransportCardProps {
  mtrUp: MtrDirectionData | null;
  mtrDown: MtrDirectionData | null;
  stations?: MtrStationSchedule[];
  buses: BusEtaItem[];
  loading: boolean;
  nightMode: boolean;
  selectedLocation: LocationId;
}

export const TransportCard: React.FC<TransportCardProps> = ({
  mtrUp,
  mtrDown,
  stations = [],
  buses,
  loading,
  nightMode,
  selectedLocation,
}) => {
  const [filterTab, setFilterTab] = useState<'all' | 'mtr' | 'bus' | 'kmb' | 'ctb'>('all');

  const filteredBuses = buses.filter((bus) => {
    if (filterTab === 'mtr') return false;
    if (filterTab === 'kmb') return bus.company === 'KMB';
    if (filterTab === 'ctb') return bus.company === 'CTB';
    return true;
  });

  const showMtr = filterTab === 'all' || filterTab === 'mtr';
  const showBus = filterTab !== 'mtr';

  const isTst = selectedLocation === 'TST';

  if (loading && !mtrUp && buses.length === 0 && stations.length === 0) {
    return (
      <div className="h-full flex flex-col gap-2.5 animate-pulse">
        <div className={`rounded-[20px] p-4 h-44 border ${nightMode ? 'bg-stone-900 border-stone-800' : 'bg-white border-[#efeeec]'}`} />
        <div className={`rounded-[20px] p-4 flex-1 border ${nightMode ? 'bg-stone-900 border-stone-800' : 'bg-white border-[#efeeec]'}`} />
      </div>
    );
  }

  // TKO single station data fallback
  const tkoUpFirst = mtrUp?.trains[0];
  const tkoUpSecond = mtrUp?.trains[1];
  const tkoDownFirst = mtrDown?.trains[0];
  const tkoDownSecond = mtrDown?.trains[1];

  // Helper renderer for a single direction track inside an MTR card
  const renderTrackItem = (
    dir: 'UP' | 'DOWN',
    directionName: string,
    destName: string,
    plat: string,
    firstTrain: any,
    secondTrain: any,
    lineColor: string,
    digitColor: string
  ) => {
    const isArriving = firstTrain?.ttnt === 0;

    return (
      <div
        className={`flex items-center justify-between p-1.5 sm:p-2 rounded-xl border transition-all ${
          nightMode ? 'bg-stone-800/80 border-stone-700/80' : 'bg-[#fcfaf9] border-[#e8e2de]'
        }`}
      >
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
          <div
            className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-white text-[10px] sm:text-[11px] font-bold shrink-0 shadow-xs ${lineColor}`}
          >
            往
          </div>
          <div className="min-w-0">
            <div className={`text-xs sm:text-[13px] font-bold truncate leading-tight ${nightMode ? 'text-white' : 'text-black'}`}>
              {destName}
            </div>
            <div className={`text-[10px] font-semibold ${nightMode ? 'text-stone-300' : 'text-stone-600'}`}>
              月台 {plat}
            </div>
          </div>
        </div>

        <div className="text-right shrink-0 ml-1.5">
          <div className="flex items-baseline justify-end gap-0.5 font-digits leading-none">
            {isArriving ? (
              <span className="text-xs sm:text-[13px] font-bold text-emerald-600 dark:text-emerald-400">
                即將到達
              </span>
            ) : (
              <>
                <span className={`text-lg sm:text-xl font-light ${digitColor}`}>
                  {firstTrain?.ttnt ?? '--'}
                </span>
                <span className={`text-[10px] font-sans ml-0.5 font-bold ${nightMode ? 'text-stone-300' : 'text-stone-700'}`}>
                  分
                </span>
              </>
            )}
          </div>
          {secondTrain && (
            <div className={`text-[9px] sm:text-[10px] font-bold font-digits mt-0.5 ${nightMode ? 'text-stone-300' : 'text-stone-700'}`}>
              下班: {secondTrain.ttnt}分 ({secondTrain.time})
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col justify-between gap-2 overflow-hidden">
      {/* 1. MTR Schedules Section */}
      {showMtr && (
        <div id="mtr-schedules-container" className="shrink-0 flex flex-col gap-1.5">
          {isTst ? (
            /* 方案 B: TST (荃灣綫) on Top, ETS (屯馬綫) Below */
            <>
              {/* TOP: TST 尖沙咀站 (荃灣綫 TWL) */}
              {(() => {
                const tstSta = stations.find((s) => s.stationCode === 'TST');
                const upTrain1 = tstSta?.upDirection.trains[0] || mtrUp?.trains[0];
                const upTrain2 = tstSta?.upDirection.trains[1] || mtrUp?.trains[1];
                const downTrain1 = tstSta?.downDirection.trains[0] || mtrDown?.trains[0];
                const downTrain2 = tstSta?.downDirection.trains[1] || mtrDown?.trains[1];

                return (
                  <div
                    id="mtr-card-tst"
                    className={`rounded-[16px] sm:rounded-[18px] p-2 sm:p-2.5 border shadow-organic-sm transition-all duration-300 ${
                      nightMode
                        ? 'bg-stone-900 border-stone-800 text-stone-100'
                        : 'bg-white border-[#efeeec] text-black'
                    }`}
                  >
                    {/* Header */}
                    <div className="flex justify-between items-center mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-3.5 rounded-full bg-[#e2231a]"></div>
                        <div className="flex items-center gap-1.5">
                          <h3 className={`text-xs sm:text-sm font-bold ${nightMode ? 'text-white' : 'text-black'}`}>
                            港鐵 尖沙咀站 (TST)
                          </h3>
                          <span className="text-[10px] px-1.5 py-0.2 rounded font-bold bg-red-500/10 text-[#e2231a] dark:text-red-300">
                            荃灣綫 TWL
                          </span>
                        </div>
                      </div>
                      <span className={`text-[10px] font-semibold ${nightMode ? 'text-stone-400' : 'text-stone-600'}`}>
                        港威大廈5座 步行約 10-12 分鐘 (A1 / L5 出口)
                      </span>
                    </div>

                    {/* 2 Directions Grid */}
                    <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
                      {renderTrackItem(
                        'UP',
                        '往 荃灣',
                        upTrain1?.destName || '荃灣',
                        upTrain1?.plat || '1',
                        upTrain1,
                        upTrain2,
                        'bg-[#e2231a]',
                        'text-[#e2231a] dark:text-red-400'
                      )}
                      {renderTrackItem(
                        'DOWN',
                        '往 中環',
                        downTrain1?.destName || '中環',
                        downTrain1?.plat || '2',
                        downTrain1,
                        downTrain2,
                        'bg-[#e2231a]',
                        'text-[#e2231a] dark:text-red-400'
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* BOTTOM: ETS 尖東站 (屯馬綫 TML) */}
              {(() => {
                const etsSta = stations.find((s) => s.stationCode === 'ETS');
                const upTrain1 = etsSta?.upDirection.trains[0];
                const upTrain2 = etsSta?.upDirection.trains[1];
                const downTrain1 = etsSta?.downDirection.trains[0];
                const downTrain2 = etsSta?.downDirection.trains[1];

                return (
                  <div
                    id="mtr-card-ets"
                    className={`rounded-[16px] sm:rounded-[18px] p-2 sm:p-2.5 border shadow-organic-sm transition-all duration-300 ${
                      nightMode
                        ? 'bg-stone-900 border-stone-800 text-stone-100'
                        : 'bg-white border-[#efeeec] text-black'
                    }`}
                  >
                    {/* Header */}
                    <div className="flex justify-between items-center mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-3.5 rounded-full bg-[#923011]"></div>
                        <div className="flex items-center gap-1.5">
                          <h3 className={`text-xs sm:text-sm font-bold ${nightMode ? 'text-white' : 'text-black'}`}>
                            港鐵 尖東站 (ETS)
                          </h3>
                          <span className="text-[10px] px-1.5 py-0.2 rounded font-bold bg-amber-900/10 text-[#923011] dark:text-amber-400">
                            屯馬綫 TML
                          </span>
                        </div>
                      </div>
                      <span className={`text-[10px] font-semibold ${nightMode ? 'text-stone-400' : 'text-stone-600'}`}>
                        港威大廈5座 步行約 12-15 分鐘 (經 L5 行人隧道)
                      </span>
                    </div>

                    {/* 2 Directions Grid */}
                    <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
                      {renderTrackItem(
                        'UP',
                        '往 烏溪沙',
                        upTrain1?.destName || '烏溪沙',
                        upTrain1?.plat || '2',
                        upTrain1,
                        upTrain2,
                        'bg-[#923011]',
                        'text-[#923011] dark:text-amber-400'
                      )}
                      {renderTrackItem(
                        'DOWN',
                        '往 屯門',
                        downTrain1?.destName || '屯門',
                        downTrain1?.plat || '3',
                        downTrain1,
                        downTrain2,
                        'bg-[#923011]',
                        'text-[#923011] dark:text-amber-400'
                      )}
                    </div>
                  </div>
                );
              })()}
            </>
          ) : (
            /* TKO: Single Tseung Kwan O Station Card */
            <div
              id="mtr-schedule-card-tko"
              className={`rounded-[18px] sm:rounded-[20px] p-2.5 sm:p-3 border shadow-organic-sm transition-all duration-300 ${
                nightMode
                  ? 'bg-stone-900 border-stone-800 text-stone-100'
                  : 'bg-white border-[#efeeec] text-black'
              }`}
            >
              {/* Header */}
              <div className="flex justify-between items-center mb-1.5 sm:mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-4 rounded-full bg-[#6b2c91]"></div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className={`text-sm sm:text-base font-bold ${nightMode ? 'text-white' : 'text-black'}`}>
                        港鐵 將軍澳站 (TKO)
                      </h3>
                      <span className="text-[10px] px-1.5 py-0.2 rounded font-bold bg-[#6b2c91]/10 text-[#6b2c91] dark:text-purple-300">
                        將軍澳綫 TKL
                      </span>
                    </div>
                    <p className={`text-[11px] font-semibold ${nightMode ? 'text-stone-400' : 'text-stone-700'}`}>
                      富康花園步行約 5-7 分鐘 (A1 / A2 出口)
                    </p>
                  </div>
                </div>
                <div className="text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider bg-purple-100 text-[#6b2c91] dark:bg-purple-950/70 dark:text-purple-300">
                  即時班次
                </div>
              </div>

              {/* TKO Routes Grid */}
              <div className="grid grid-cols-2 gap-2">
                {renderTrackItem(
                  'UP',
                  '往 北角',
                  tkoUpFirst?.destName || '北角',
                  tkoUpFirst?.plat || '2',
                  tkoUpFirst,
                  tkoUpSecond,
                  'bg-[#6b2c91]',
                  'text-[#6b2c91] dark:text-purple-300'
                )}
                {renderTrackItem(
                  'DOWN',
                  '往 寶琳 / 康城',
                  tkoDownFirst?.destName || '寶琳 / 康城',
                  tkoDownFirst?.plat || '1',
                  tkoDownFirst,
                  tkoDownSecond,
                  'bg-[#6b2c91]',
                  'text-[#6b2c91] dark:text-purple-300'
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 2. Bus Arrival ETA Card */}
      {showBus && (
        <div
          id="bus-schedule-card"
          className={`flex-1 min-h-0 rounded-[18px] sm:rounded-[20px] p-2.5 sm:p-3 border shadow-organic-sm transition-all duration-300 flex flex-col justify-between overflow-hidden ${
            nightMode
              ? 'bg-stone-900 border-stone-800 text-stone-100'
              : 'bg-white border-[#efeeec] text-black'
          }`}
        >
          <div className="flex flex-col h-full justify-between min-h-0">
            {/* Header */}
            <div className="flex justify-between items-center mb-1 shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-3.5 bg-[#d97736] rounded-full"></div>
                <div>
                  <h3 className={`text-xs sm:text-sm font-bold ${nightMode ? 'text-white' : 'text-black'}`}>
                    巴士即時抵站 (ETA)
                  </h3>
                  <p className={`text-[10px] sm:text-[11px] font-semibold ${nightMode ? 'text-stone-400' : 'text-stone-600'}`}>
                    {isTst
                      ? '廣東道 / 新港中心 / 中港城站 (步行 1-2 分鐘)'
                      : '富康花園 / 唐明街公園站 (步行 1-2 分鐘)'}
                  </p>
                </div>
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center gap-1">
                {[
                  { id: 'all', label: '全部' },
                  { id: 'kmb', label: '九巴' },
                  { id: 'ctb', label: '城巴' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setFilterTab(tab.id as any)}
                    className={`px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold transition-colors ${
                      filterTab === tab.id
                        ? nightMode
                          ? 'bg-stone-100 text-stone-900 shadow-xs'
                          : 'bg-black text-white shadow-xs'
                        : nightMode
                        ? 'text-stone-300 hover:bg-stone-800'
                        : 'text-stone-700 hover:bg-stone-200'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Bus Routes Grid - Optimized for Compact Display */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 sm:gap-1.5 flex-1 min-h-0 overflow-y-auto pr-0.5">
              {filteredBuses.map((bus, i) => {
                const isKmb = bus.company === 'KMB';
                const badgeColor = isKmb ? 'bg-[#d92121]' : 'bg-[#1a6fb3]';
                const isArrivingSoon = bus.diffMinutes === 0;

                return (
                  <div
                    key={`${bus.route}-${i}`}
                    className={`border rounded-xl p-1.5 sm:p-2 flex justify-between items-center transition-all ${
                      isArrivingSoon
                        ? 'border-amber-400 bg-amber-50/70 dark:bg-amber-950/30 shadow-2xs'
                        : nightMode
                        ? 'bg-stone-800/80 border-stone-700/80 hover:bg-stone-800'
                        : 'bg-[#fcfaf9] border-[#e8e2de] hover:border-stone-400'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                      <div
                        className={`w-10 sm:w-11 text-center font-bold font-digits text-xs sm:text-[13px] py-0.5 text-white rounded-lg shadow-2xs shrink-0 ${badgeColor}`}
                      >
                        {bus.route}
                      </div>
                      <div className="min-w-0">
                        <div className={`text-xs sm:text-[13px] font-bold truncate leading-tight ${nightMode ? 'text-white' : 'text-black'}`}>
                          {bus.dest.replace(/^往\s*/, '往 ')}
                        </div>
                        <div className={`text-[10px] font-semibold truncate ${nightMode ? 'text-stone-400' : 'text-stone-600'}`}>
                          {bus.stopName}
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0 ml-1.5">
                      <div className="flex items-baseline justify-end gap-0.5 font-digits leading-none">
                        {isArrivingSoon ? (
                          <span className="text-xs sm:text-[13px] font-bold text-amber-600 dark:text-amber-400 animate-pulse-warm">
                            即將抵站
                          </span>
                        ) : (
                          <>
                            <span
                              className={`text-base sm:text-lg font-light ${
                                isKmb
                                  ? nightMode
                                    ? 'text-red-400'
                                    : 'text-[#d92121]'
                                  : nightMode
                                  ? 'text-blue-400'
                                  : 'text-[#1a6fb3]'
                              }`}
                            >
                              {bus.diffMinutes}
                            </span>
                            <span className={`text-[10px] font-sans font-bold ${nightMode ? 'text-stone-300' : 'text-stone-700'}`}>
                              分
                            </span>
                          </>
                        )}
                      </div>
                      <div className={`text-[9px] sm:text-[10px] font-bold font-digits mt-0.5 ${nightMode ? 'text-stone-300' : 'text-stone-700'}`}>
                        {bus.etaTime}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
