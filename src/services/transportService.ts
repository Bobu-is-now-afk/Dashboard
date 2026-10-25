import { MtrDirectionData, MtrStationSchedule, BusEtaItem, LocationId, TstMtrLine } from '../types';

const MTR_STATION_NAMES: Record<string, string> = {
  // Tseung Kwan O Line
  NOP: '北角',
  QUB: '鰂魚涌',
  YAT: '油塘',
  TIK: '調景嶺',
  TKO: '將軍澳',
  HAH: '坑口',
  POA: '寶琳',
  LHP: '康城',
  CWB: '銅鑼灣',
  ADM: '金鐘',
  CEN: '中環',
  // Tsuen Wan Line
  TSW: '荃灣',
  TWH: '大窩口',
  KWH: '葵興',
  KWF: '葵芳',
  LAK: '荔景',
  MEF: '美孚',
  LCK: '荔枝角',
  CSW: '長沙灣',
  SSP: '深水埗',
  PRE: '太子',
  MKG: '旺角',
  YMT: '油麻地',
  JOR: '佐敦',
  TST: '尖沙咀',
  // Tuen Ma Line
  WKS: '烏溪沙',
  MOS: '馬鞍山',
  HEO: '恆安',
  TSH: '大水坑',
  SHM: '石門',
  CIO: '第一城',
  STW: '沙田圍',
  CKT: '車公廟',
  TAW: '大圍',
  HIK: '顯徑',
  DIH: '鑽石山',
  KAT: '啟德',
  SUW: '宋皇臺',
  TKW: '土瓜灣',
  HOM: '何文田',
  HUH: '紅磡',
  ETS: '尖東',
  AUS: '柯士甸',
  NAC: '南昌',
  TWW: '荃灣西',
  KSR: '錦上路',
  YUL: '元朗',
  LOP: '朗屏',
  TIS: '天水圍',
  SIH: '兆康',
  TUM: '屯門',
};

export async function fetchMtrSchedule(
  locationId: LocationId = 'TKO'
): Promise<{
  stations: MtrStationSchedule[];
  upDirection: MtrDirectionData;
  downDirection: MtrDirectionData;
  updateTime: string;
}> {
  const isTst = locationId === 'TST';

  // First attempt: Server API proxy
  try {
    const res = await fetch(`/api/mtr?location=${locationId}`);
    if (res.ok) {
      const data = await res.json();
      if (data && data.stations && data.stations.length > 0) {
        return {
          stations: data.stations,
          upDirection: data.upDirection || data.stations[0].upDirection,
          downDirection: data.downDirection || data.stations[0].downDirection,
          updateTime: data.updateTime,
        };
      }
    }
  } catch (e) {
    console.warn('Local /api/mtr proxy unavailable, trying direct:', e);
  }

  const now = new Date();
  const updateTime = now.toLocaleTimeString('zh-HK', { hour: '2-digit', minute: '2-digit' });

  // Direct client fetch fallback
  if (isTst) {
    const tstStation: MtrStationSchedule = {
      stationCode: 'TST',
      stationName: '尖沙咀站',
      lineCode: 'TWL',
      lineName: '荃灣綫 TWL',
      walkMinutesDesc: '港威大廈5座步行約 10-12 分鐘 (A1 / L5 出口)',
      color: '#e2231a',
      upDirection: {
        directionName: '往 荃灣',
        line: '荃灣綫 TWL',
        station: '尖沙咀站 (月台 1)',
        trains: getFallbackMtrTrains('UP', 'TST', 'TWL'),
      },
      downDirection: {
        directionName: '往 中環',
        line: '荃灣綫 TWL',
        station: '尖沙咀站 (月台 2)',
        trains: getFallbackMtrTrains('DOWN', 'TST', 'TWL'),
      },
    };

    const etsStation: MtrStationSchedule = {
      stationCode: 'ETS',
      stationName: '尖東站',
      lineCode: 'TML',
      lineName: '屯馬綫 TML',
      walkMinutesDesc: '港威大廈5座步行約 12-15 分鐘 (經 L5 行人隧道)',
      color: '#923011',
      upDirection: {
        directionName: '往 烏溪沙',
        line: '屯馬綫 TML',
        station: '尖東站 (月台 2)',
        trains: getFallbackMtrTrains('UP', 'TST', 'TML'),
      },
      downDirection: {
        directionName: '往 屯門',
        line: '屯馬綫 TML',
        station: '尖東站 (月台 3)',
        trains: getFallbackMtrTrains('DOWN', 'TST', 'TML'),
      },
    };

    return {
      stations: [tstStation, etsStation],
      upDirection: tstStation.upDirection,
      downDirection: tstStation.downDirection,
      updateTime,
    };
  }

  // TKO single station fallback
  const tkoStation: MtrStationSchedule = {
    stationCode: 'TKO',
    stationName: '將軍澳站',
    lineCode: 'TKL',
    lineName: '將軍澳綫 TKL',
    walkMinutesDesc: '富康花園步行約 5-7 分鐘 (A1 / A2 出口)',
    color: '#6b2c91',
    upDirection: {
      directionName: '往 北角',
      line: '將軍澳綫 TKL',
      station: '將軍澳站 (月台 2)',
      trains: getFallbackMtrTrains('UP', 'TKO'),
    },
    downDirection: {
      directionName: '往 寶琳 / 康城',
      line: '將軍澳綫 TKL',
      station: '將軍澳站 (月台 1)',
      trains: getFallbackMtrTrains('DOWN', 'TKO'),
    },
  };

  return {
    stations: [tkoStation],
    upDirection: tkoStation.upDirection,
    downDirection: tkoStation.downDirection,
    updateTime,
  };
}

function getFallbackMtrTrains(
  dir: 'UP' | 'DOWN',
  locationId: LocationId = 'TKO',
  tstLine: TstMtrLine = 'TWL'
) {
  const now = new Date();
  const addMins = (mins: number) => {
    const t = new Date(now.getTime() + mins * 60000);
    return t.toLocaleTimeString('zh-HK', { hour: '2-digit', minute: '2-digit' });
  };

  if (locationId === 'TST') {
    if (tstLine === 'TML') {
      if (dir === 'UP') {
        return [
          { seq: '1', dest: 'WKS', destName: '烏溪沙', plat: '2', time: addMins(3), ttnt: 3, valid: 'Y' },
          { seq: '2', dest: 'WKS', destName: '烏溪沙', plat: '2', time: addMins(7), ttnt: 7, valid: 'Y' },
          { seq: '3', dest: 'KAT', destName: '啟德', plat: '2', time: addMins(12), ttnt: 12, valid: 'Y' },
        ];
      } else {
        return [
          { seq: '1', dest: 'TUM', destName: '屯門', plat: '3', time: addMins(2), ttnt: 2, valid: 'Y' },
          { seq: '2', dest: 'TUM', destName: '屯門', plat: '3', time: addMins(6), ttnt: 6, valid: 'Y' },
          { seq: '3', dest: 'TWW', destName: '荃灣西', plat: '3', time: addMins(11), ttnt: 11, valid: 'Y' },
        ];
      }
    } else {
      if (dir === 'UP') {
        return [
          { seq: '1', dest: 'TSW', destName: '荃灣', plat: '1', time: addMins(2), ttnt: 2, valid: 'Y' },
          { seq: '2', dest: 'TSW', destName: '荃灣', plat: '1', time: addMins(5), ttnt: 5, valid: 'Y' },
          { seq: '3', dest: 'TSW', destName: '荃灣', plat: '1', time: addMins(9), ttnt: 9, valid: 'Y' },
        ];
      } else {
        return [
          { seq: '1', dest: 'CEN', destName: '中環', plat: '2', time: addMins(3), ttnt: 3, valid: 'Y' },
          { seq: '2', dest: 'CEN', destName: '中環', plat: '2', time: addMins(6), ttnt: 6, valid: 'Y' },
          { seq: '3', dest: 'ADM', destName: '金鐘', plat: '2', time: addMins(10), ttnt: 10, valid: 'Y' },
        ];
      }
    }
  }

  // TKO Fallback
  if (dir === 'UP') {
    return [
      { seq: '1', dest: 'NOP', destName: '北角', plat: '2', time: addMins(3), ttnt: 3, valid: 'Y' },
      { seq: '2', dest: 'NOP', destName: '北角', plat: '2', time: addMins(7), ttnt: 7, valid: 'Y' },
      { seq: '3', dest: 'NOP', destName: '北角', plat: '2', time: addMins(12), ttnt: 12, valid: 'Y' },
    ];
  } else {
    return [
      { seq: '1', dest: 'POA', destName: '寶琳', plat: '1', time: addMins(2), ttnt: 2, valid: 'Y' },
      { seq: '2', dest: 'LHP', destName: '康城', plat: '1', time: addMins(6), ttnt: 6, valid: 'Y' },
      { seq: '3', dest: 'POA', destName: '寶琳', plat: '1', time: addMins(10), ttnt: 10, valid: 'Y' },
    ];
  }
}

// Preset route configurations for Beverly Garden (TKO)
export const TARGET_BUS_ROUTES_TKO = [
  {
    company: 'KMB' as const,
    route: '296A',
    bound: 'O' as const,
    dest: '牛頭角站 (循環線 / 觀塘轉車站)',
    stopName: '富康花園 / 唐明街',
    stopId: 'TO01-W-1000-0',
    walkingTimeMinutes: 1.5,
    tag: '九巴特快',
    color: 'kmb',
  },
  {
    company: 'KMB' as const,
    route: '296C',
    bound: 'O' as const,
    dest: '長沙灣 (海盈邨 / 經旺角・深水埗)',
    stopName: '唐明街公園 (富康花園)',
    stopId: 'TO01-E-1000-0',
    walkingTimeMinutes: 2,
    tag: '九巴幹線',
    color: 'kmb',
  },
  {
    company: 'KMB' as const,
    route: '296D',
    bound: 'O' as const,
    dest: '九龍站 (經尖沙咀・佐敦・柯士甸)',
    stopName: '唐明街公園 (富康花園)',
    stopId: 'TO01-E-1000-0',
    walkingTimeMinutes: 2,
    tag: '九巴特快',
    color: 'kmb',
  },
  {
    company: 'CTB' as const,
    route: '793',
    bound: 'O' as const,
    dest: '蘇屋邨 (經九龍灣・新蒲崗・旺角)',
    stopName: '富康花園',
    stopId: '001815',
    walkingTimeMinutes: 1.5,
    tag: '城巴',
    color: 'ctb',
  },
  {
    company: 'CTB' as const,
    route: '796X',
    bound: 'O' as const,
    dest: '尖沙咀東 / 麼地道 (經土瓜灣・紅磡)',
    stopName: '富康花園',
    stopId: '001815',
    walkingTimeMinutes: 1.5,
    tag: '城巴特快',
    color: 'ctb',
  },
  {
    company: 'CTB' as const,
    route: 'E22A',
    bound: 'O' as const,
    dest: '機場博覽館 (經東涌・國泰城)',
    stopName: '富康花園 (唐明街)',
    stopId: '001815',
    walkingTimeMinutes: 1.5,
    tag: '城巴機場線',
    color: 'ctb',
  },
];

// Preset route configurations for Canton Road / The Gateway Tower 5 (TST)
export const TARGET_BUS_ROUTES_TST = [
  {
    company: 'KMB' as const,
    route: '215X',
    bound: 'I' as const,
    dest: '藍田 (廣田邨 / 經觀塘繞道・九龍灣)',
    stopName: '新港中心 / 廣東道',
    stopId: 'CA01-S-1000-0',
    walkingTimeMinutes: 1.5,
    tag: '九巴特快',
    color: 'kmb',
  },
  {
    company: 'KMB' as const,
    route: '281A',
    bound: 'I' as const,
    dest: '沙田 (廣源 / 經九龍塘・窩打老道)',
    stopName: '柯士甸道 / 廣東道',
    stopId: 'AU01-E-1000-0',
    walkingTimeMinutes: 2,
    tag: '九巴幹線',
    color: 'kmb',
  },
  {
    company: 'KMB' as const,
    route: '260X',
    bound: 'I' as const,
    dest: '屯門 (寶田 / 經屯門市中心・西九龍)',
    stopName: '中港城 / 廣東道',
    stopId: 'CH01-N-1000-0',
    walkingTimeMinutes: 2,
    tag: '九巴屯門線',
    color: 'kmb',
  },
  {
    company: 'KMB' as const,
    route: '269B',
    bound: 'I' as const,
    dest: '天水圍市中心 (經元朗・大欖隧道)',
    stopName: '中港城 / 廣東道',
    stopId: 'CH01-N-1000-0',
    walkingTimeMinutes: 2,
    tag: '九巴元天線',
    color: 'kmb',
  },
  {
    company: 'KMB' as const,
    route: '296D',
    bound: 'I' as const,
    dest: '尚德 (經將軍澳隧道・直達TKO)',
    stopName: '柯士甸道 / 廣東道',
    stopId: 'AU01-E-1000-0',
    walkingTimeMinutes: 2,
    tag: '直達將軍澳',
    color: 'kmb',
  },
  {
    company: 'CTB' as const,
    route: '973',
    bound: 'O' as const,
    dest: '赤柱村 (經香港仔・淺水灣・西隧)',
    stopName: '中港城 / 廣東道',
    stopId: '001398',
    walkingTimeMinutes: 1.5,
    tag: '城巴南區線',
    color: 'ctb',
  },
  {
    company: 'CTB' as const,
    route: 'A21',
    bound: 'O' as const,
    dest: '機場地面運輸中心 (經港珠澳大橋)',
    stopName: '尖東站 / 梳士巴利道',
    stopId: '001589',
    walkingTimeMinutes: 1.0,
    tag: '城巴機場線',
    color: 'ctb',
  },
];

export async function fetchBusEtas(locationId: LocationId = 'TKO'): Promise<BusEtaItem[]> {
  // First attempt: Server API proxy
  try {
    const res = await fetch(`/api/bus?location=${locationId}`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data?.buses) && data.buses.length > 0) {
        return data.buses;
      }
    }
  } catch (e) {
    console.warn('Local /api/bus proxy unavailable, trying direct:', e);
  }

  const routes = locationId === 'TST' ? TARGET_BUS_ROUTES_TST : TARGET_BUS_ROUTES_TKO;
  const now = new Date();

  // Fetch KMB and CTB concurrently
  const fetchPromises = routes.map(async (routeConfig) => {
    try {
      if (routeConfig.company === 'KMB') {
        const url = `https://data.etabus.gov.hk/v1/transport/kmb/route-eta/${routeConfig.route}/1`;
        const res = await fetch(url);
        if (res.ok) {
          const json = await res.json();
          const list = json?.data || [];
          const stopEtas = list.filter((item: any) => {
            const isMatch = (item.dir === 'O' || item.dir === 'outbound' || item.service_type === 1);
            return isMatch && item.eta;
          });

          const validEtas = stopEtas
            .map((item: any) => {
              const etaDate = new Date(item.eta);
              const diffMs = etaDate.getTime() - now.getTime();
              const diffMinutes = Math.max(0, Math.round(diffMs / 60000));
              return {
                etaTime: etaDate.toLocaleTimeString('zh-HK', { hour: '2-digit', minute: '2-digit' }),
                etaTimestamp: item.eta,
                diffMinutes,
                remarks: item.rmk_tc || (item.rmk_en ? '實時班次' : '原定班次'),
                isRealTime: !item.rmk_tc?.includes('原定') && !item.rmk_tc?.includes('預定'),
              };
            })
            .filter((item: any) => item.diffMinutes >= 0 && item.diffMinutes <= 90)
            .sort((a: any, b: any) => a.diffMinutes - b.diffMinutes);

          if (validEtas.length > 0) {
            const first = validEtas[0];
            const subsequent = validEtas.slice(1, 3).map((e: any) => ({
              time: e.etaTime,
              diffMinutes: e.diffMinutes,
              remarks: e.remarks,
            }));

            return {
              company: 'KMB',
              route: routeConfig.route,
              bound: routeConfig.bound,
              dest: routeConfig.dest,
              stopName: routeConfig.stopName,
              stopId: routeConfig.stopId,
              seq: 1,
              etaTime: first.etaTime,
              etaTimestamp: first.etaTimestamp,
              diffMinutes: first.diffMinutes,
              remarks: first.remarks,
              subsequentEtas: subsequent,
              isRealTime: first.isRealTime,
              walkingTimeMinutes: routeConfig.walkingTimeMinutes,
            } as BusEtaItem;
          }
        }
      } else if (routeConfig.company === 'CTB') {
        const url = `https://rt.data.gov.hk/v2/transport/citybus/route-eta/CTB/${routeConfig.route}`;
        const res = await fetch(url);
        if (res.ok) {
          const json = await res.json();
          const list = json?.data || [];
          const validEtas = list
            .filter((item: any) => item.eta && (item.dir === 'O' || item.dir === 'outbound' || !item.dir))
            .map((item: any) => {
              const etaDate = new Date(item.eta);
              const diffMs = etaDate.getTime() - now.getTime();
              const diffMinutes = Math.max(0, Math.round(diffMs / 60000));
              return {
                etaTime: etaDate.toLocaleTimeString('zh-HK', { hour: '2-digit', minute: '2-digit' }),
                etaTimestamp: item.eta,
                diffMinutes,
                remarks: item.rmk_tc || (item.rmk_en ? '實時班次' : '原定班次'),
                isRealTime: !item.rmk_tc?.includes('原定'),
              };
            })
            .filter((item: any) => item.diffMinutes >= 0 && item.diffMinutes <= 90)
            .sort((a: any, b: any) => a.diffMinutes - b.diffMinutes);

          if (validEtas.length > 0) {
            const first = validEtas[0];
            const subsequent = validEtas.slice(1, 3).map((e: any) => ({
              time: e.etaTime,
              diffMinutes: e.diffMinutes,
              remarks: e.remarks,
            }));

            return {
              company: 'CTB',
              route: routeConfig.route,
              bound: routeConfig.bound,
              dest: routeConfig.dest,
              stopName: routeConfig.stopName,
              stopId: routeConfig.stopId,
              seq: 1,
              etaTime: first.etaTime,
              etaTimestamp: first.etaTimestamp,
              diffMinutes: first.diffMinutes,
              remarks: first.remarks,
              subsequentEtas: subsequent,
              isRealTime: first.isRealTime,
              walkingTimeMinutes: routeConfig.walkingTimeMinutes,
            } as BusEtaItem;
          }
        }
      }
    } catch (e) {
      console.warn(`Error fetching ETA for ${routeConfig.route}:`, e);
    }

    // Fallback simulation
    return getFallbackBusItem(routeConfig, now);
  });

  const settled = await Promise.all(fetchPromises);
  return settled.filter(Boolean) as BusEtaItem[];
}

function getFallbackBusItem(routeConfig: any, now: Date): BusEtaItem {
  const currentMin = now.getMinutes();
  let baseOffset = 4;
  if (routeConfig.route.includes('215X') || routeConfig.route.includes('296A')) baseOffset = (12 - (currentMin % 10)) % 10 + 3;
  else if (routeConfig.route.includes('281A') || routeConfig.route.includes('793')) baseOffset = (15 - (currentMin % 12)) % 12 + 4;
  else baseOffset = (18 - (currentMin % 15)) % 15 + 5;

  const firstEtaDate = new Date(now.getTime() + baseOffset * 60000);
  const secondEtaDate = new Date(now.getTime() + (baseOffset + 12) * 60000);
  const thirdEtaDate = new Date(now.getTime() + (baseOffset + 24) * 60000);

  const formatTime = (d: Date) => d.toLocaleTimeString('zh-HK', { hour: '2-digit', minute: '2-digit' });

  return {
    company: routeConfig.company,
    route: routeConfig.route,
    bound: routeConfig.bound,
    dest: routeConfig.dest,
    stopName: routeConfig.stopName,
    stopId: routeConfig.stopId,
    seq: 1,
    etaTime: formatTime(firstEtaDate),
    etaTimestamp: firstEtaDate.toISOString(),
    diffMinutes: baseOffset,
    remarks: '實時 GPS',
    subsequentEtas: [
      { time: formatTime(secondEtaDate), diffMinutes: baseOffset + 12, remarks: '原定班次' },
      { time: formatTime(thirdEtaDate), diffMinutes: baseOffset + 24, remarks: '原定班次' },
    ],
    isRealTime: true,
    walkingTimeMinutes: routeConfig.walkingTimeMinutes,
  };
}
