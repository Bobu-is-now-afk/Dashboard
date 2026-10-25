export type LocationId = 'TKO' | 'TST';
export type TstMtrLine = 'TWL' | 'TML';

export interface LocationConfig {
  id: LocationId;
  name: string;
  estateName: string;
  address: string;
  weatherPlace: string;
  mtrStation: string;
  mtrCode: string;
  mtrLine: string;
  mtrLineCode: string;
  mtrWalk: string;
  busStopDesc: string;
}

export interface WeatherData {
  temperature: number;
  place: string;
  humidity: number;
  rainfall: number;
  weatherDescription: string;
  iconId: number;
  todayMinTemp: number;
  todayMaxTemp: number;
  psr: string; // Probability of Significant Rain: 低, 中低, 中, 中高, 高
  uvIndex?: number;
  uvLevel?: string;
  aqhi?: {
    index: number;
    level: string; // 低, 中, 高, 甚高, 嚴重
    station: string;
  };
  warnings: Array<{
    type: string;
    code: string;
    name: string;
    actionPrompt?: string;
  }>;
  specialTips?: string;
  hourlyForecast: Array<{
    time: string;
    temp: number;
    iconId: number;
    pop?: number;
  }>;
  nineDayForecast: Array<{
    date: string;
    week: string;
    minTemp: number;
    maxTemp: number;
    weather: string;
    iconId: number;
    psr: string;
  }>;
  updateTime: string;
}

export interface MtrScheduleItem {
  seq: string;
  dest: string;
  destName: string;
  plat: string;
  time: string;
  ttnt: number; // Time to next train in minutes
  valid: string;
}

export interface MtrDirectionData {
  directionName: string;
  line: string;
  station: string;
  trains: MtrScheduleItem[];
  statusMessage?: string;
}

export interface MtrStationSchedule {
  stationCode: string;
  stationName: string;
  lineCode: string;
  lineName: string;
  walkMinutesDesc: string;
  color: string;
  upDirection: MtrDirectionData;
  downDirection: MtrDirectionData;
}

export interface BusEtaItem {
  company: 'KMB' | 'CTB';
  route: string;
  bound: 'O' | 'I' | '1' | '2';
  dest: string;
  stopName: string;
  stopId: string;
  seq: number;
  etaTime: string | null; // HH:mm format
  etaTimestamp: string | null; // ISO string
  diffMinutes: number; // minutes from now
  remarks: string;
  subsequentEtas: Array<{
    time: string;
    diffMinutes: number;
    remarks: string;
  }>;
  isRealTime: boolean;
  walkingTimeMinutes: number;
}

export interface RadioStation {
  id: string;
  name: string;
  shortName: string;
  freq: string;
  streamUrl: string;
  fallbackUrl?: string;
  category: string;
  color: string;
}
