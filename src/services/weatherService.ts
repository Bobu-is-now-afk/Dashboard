import { WeatherData, LocationId } from '../types';

export const HKO_ICON_MAP: Record<number, string> = {
  50: '☀️ 晴朗',
  51: '🌤️ 陽光充沛',
  52: '⛅ 初時陽光',
  53: '🌤️ 部分時間有陽光',
  54: '🌤️ 短暫陽光',
  60: '☁️ 多雲',
  61: '⛅ 陰天',
  62: '🌧️ 微雨',
  63: '🌧️ 驟雨',
  64: '⛈️ 大雨',
  65: '⛈️ 雷暴',
  70: '🌦️ 局部短暫陽光',
  71: '🌦️ 局部地區驟雨',
  72: '🌦️ 零散驟雨',
  73: '🌦️ 局部雷暴',
  74: '🌧️ 驟雨較多',
  75: '🌦️ 驟雨初時雷暴',
  76: '🌧️ 局部大驟雨',
  77: '⛈️ 狂風雷暴',
  80: '💨 有風',
  81: '🌫️ 潮濕',
  82: '🌫️ 薄霧',
  83: '🌫️ 霧',
  84: '🌫️ 煙霧',
  85: '🌫️ 煙霞',
  90: '🔥 酷熱',
  91: '🔥 暖和',
  92: '❄️ 寒冷',
  93: '❄️ 清涼',
};

// Weather icon image URL from HKO
export function getHkoIconUrl(iconId: number): string {
  if (!iconId) return 'https://www.hko.gov.hk/images/HKOWxIcon_v2/pic50.png';
  return `https://www.hko.gov.hk/images/HKOWxIcon_v2/pic${iconId}.png`;
}

export async function fetchHkoWeather(locationId: LocationId = 'TKO'): Promise<WeatherData> {
  // First attempt: Server API proxy (no CORS issues, real-time HKO data)
  try {
    const apiRes = await fetch(`/api/weather?location=${locationId}`);
    if (apiRes.ok) {
      const data = await apiRes.json();
      if (data && typeof data.temperature === 'number') {
        return data;
      }
    }
  } catch (e) {
    console.warn('Local /api/weather proxy unavailable, trying direct HKO fetch:', e);
  }

  const isTst = locationId === 'TST';
  const now = new Date();
  const currentHour = now.getHours();

  try {
    const [rhrRes, fndRes, flwRes, aqhiRes] = await Promise.allSettled([
      fetch('https://data.weather.gov.hk/weatherAPI/opendata/weather.php?dataType=rhrread&lang=tc'),
      fetch('https://data.weather.gov.hk/weatherAPI/opendata/weather.php?dataType=fnd&lang=tc'),
      fetch('https://data.weather.gov.hk/weatherAPI/opendata/weather.php?dataType=flw&lang=tc'),
      fetch('https://dashboard.data.gov.hk/api/aqhi-individual?format=json'),
    ]);

    let rhrData: any = null;
    let fndData: any = null;
    let flwData: any = null;
    let aqhiData: any = null;

    if (rhrRes.status === 'fulfilled' && rhrRes.value.ok) {
      rhrData = await rhrRes.value.json();
    }
    if (fndRes.status === 'fulfilled' && fndRes.value.ok) {
      fndData = await fndRes.value.json();
    }
    if (flwRes.status === 'fulfilled' && flwRes.value.ok) {
      flwData = await flwRes.value.json();
    }
    if (aqhiRes.status === 'fulfilled' && aqhiRes.value.ok) {
      try {
        aqhiData = await aqhiRes.value.json();
      } catch (_) {}
    }

    // Extract temperature based on location
    let temp = 28;
    let place = isTst ? '尖沙咀' : '將軍澳';
    if (rhrData?.temperature?.data) {
      if (isTst) {
        const tstTemp = rhrData.temperature.data.find(
          (d: any) => d.place === '香港天文台' || d.place === '京士柏' || d.place === '九龍城' || d.place === '尖沙咀'
        );
        if (tstTemp && typeof tstTemp.value === 'number') {
          temp = tstTemp.value;
          place = '尖沙咀';
        }
      } else {
        const tkoTemp = rhrData.temperature.data.find(
          (d: any) => d.place === '將軍澳' || d.place === 'Tseung Kwan O'
        );
        if (tkoTemp && typeof tkoTemp.value === 'number') {
          temp = tkoTemp.value;
          place = '將軍澳';
        } else {
          const fallbackStations = ['觀塘', '京士柏', '香港天文台', '啟德跑道公園'];
          for (const stationName of fallbackStations) {
            const found = rhrData.temperature.data.find((d: any) => d.place === stationName);
            if (found && typeof found.value === 'number') {
              temp = found.value;
              place = found.place;
              break;
            }
          }
        }
      }

      if (!temp && rhrData.temperature.data[0]?.value) {
        temp = rhrData.temperature.data[0].value;
        place = rhrData.temperature.data[0].place || '香港';
      }
    }

    // Humidity
    let humidity = 76;
    if (rhrData?.humidity?.data?.[0]?.value) {
      humidity = rhrData.humidity.data[0].value;
    }

    // Rainfall
    let rainfall = 0;
    if (rhrData?.rainfall?.data) {
      const matchKey = isTst ? ['油尖旺', '九龍城', '中西區'] : ['西貢', '將軍澳', '觀塘'];
      const rain = rhrData.rainfall.data.find((r: any) => matchKey.some((k) => r.place?.includes(k)));
      if (rain && typeof rain.max === 'number') {
        rainfall = rain.max;
      }
    }

    // Icon
    const iconId = rhrData?.icon?.[0] || 53;

    // UV Index
    let uvIndex: number | undefined = undefined;
    let uvLevel: string | undefined = undefined;
    if (rhrData?.uvindex?.data?.[0]) {
      uvIndex = rhrData.uvindex.data[0].value;
      if (uvIndex !== undefined) {
        if (uvIndex < 3) uvLevel = '低';
        else if (uvIndex < 6) uvLevel = '中等';
        else if (uvIndex < 8) uvLevel = '高';
        else if (uvIndex < 11) uvLevel = '甚高';
        else uvLevel = '極高';
      }
    }

    // AQHI
    let aqhi = { index: 3, level: '低至中等', station: isTst ? '尖沙咀/中西區' : '將軍澳' };
    if (Array.isArray(aqhiData)) {
      const targetStations = isTst ? ['中西區', '深水埗', '銅鑼灣', '旺角'] : ['將軍澳', '觀塘'];
      const matchedAqhi = aqhiData.find((item: any) =>
        targetStations.some((s) => item.station === s || item.station_name === s)
      );
      if (matchedAqhi) {
        const val = parseInt(matchedAqhi.aqhi || matchedAqhi.index || '3', 10);
        const level = val <= 3 ? '低' : val <= 6 ? '中等' : val <= 7 ? '高' : val <= 10 ? '甚高' : '嚴重';
        aqhi = { index: val, level, station: isTst ? '九龍核心區' : '將軍澳' };
      }
    }

    // Forecast range & PSR from 9-day forecast
    let todayMin = temp - 3;
    let todayMax = temp + 3;
    let psr = '中';
    let nineDayForecast: any[] = [];

    if (fndData?.weatherForecast && Array.isArray(fndData.weatherForecast)) {
      const todayForecast = fndData.weatherForecast[0];
      if (todayForecast) {
        if (todayForecast.forecastMintemp?.value) {
          todayMin = todayForecast.forecastMintemp.value;
        }
        if (todayForecast.forecastMaxtemp?.value) {
          todayMax = todayForecast.forecastMaxtemp.value;
        }
        if (todayForecast.PSR) {
          psr = todayForecast.PSR;
        }
      }

      nineDayForecast = fndData.weatherForecast.slice(0, 7).map((item: any) => ({
        date: item.forecastDate ? `${item.forecastDate.slice(4, 6)}/${item.forecastDate.slice(6, 8)}` : '',
        week: item.week || '',
        minTemp: item.forecastMintemp?.value || 25,
        maxTemp: item.forecastMaxtemp?.value || 31,
        weather: item.forecastWeather || '',
        iconId: item.ForecastIcon || 50,
        psr: item.PSR || '中',
      }));
    }

    // Weather description from local forecast (flw)
    let weatherDescription = '大致多雲，日間短暫時間有陽光，局部地區有驟雨。';
    if (flwData?.forecastDesc) {
      weatherDescription = flwData.forecastDesc;
    } else if (rhrData?.specialWxTips?.[0]) {
      weatherDescription = rhrData.specialWxTips[0];
    }

    // Warnings
    const warnings: Array<{ type: string; code: string; name: string; actionPrompt?: string }> = [];
    if (rhrData?.warningMessage && Array.isArray(rhrData.warningMessage)) {
      rhrData.warningMessage.forEach((msg: string) => {
        if (msg.trim()) {
          warnings.push({
            type: 'warning',
            code: 'HKO',
            name: msg.trim(),
          });
        }
      });
    }

    // Generate upcoming hourly simulation based on current temp and forecast trend
    const hourlyForecast = Array.from({ length: 6 }).map((_, i) => {
      const targetHour = (currentHour + i) % 24;
      const hourStr = `${targetHour.toString().padStart(2, '0')}:00`;
      let hourTemp = temp;
      if (targetHour >= 11 && targetHour <= 15) {
        hourTemp = Math.min(todayMax, temp + (i > 0 ? 1 : 0));
      } else if (targetHour >= 0 && targetHour <= 6) {
        hourTemp = Math.max(todayMin, temp - 2);
      } else {
        hourTemp = Math.round((todayMin + todayMax) / 2);
      }

      return {
        time: hourStr,
        temp: hourTemp,
        iconId: iconId,
        pop: psr === '高' ? 80 : psr === '中高' ? 60 : psr === '中' ? 40 : 20,
      };
    });

    return {
      temperature: temp,
      place,
      humidity,
      rainfall,
      weatherDescription,
      iconId,
      todayMinTemp: todayMin,
      todayMaxTemp: todayMax,
      psr,
      uvIndex,
      uvLevel,
      aqhi,
      warnings,
      specialTips: rhrData?.specialWxTips?.[0],
      hourlyForecast,
      nineDayForecast,
      updateTime: now.toLocaleTimeString('zh-HK', { hour: '2-digit', minute: '2-digit' }),
    };
  } catch (error) {
    console.warn('HKO API fetch fallback used:', error);
    return getFallbackWeather(locationId);
  }
}

export function getFallbackWeather(locationId: LocationId = 'TKO'): WeatherData {
  const now = new Date();
  const currentHour = now.getHours();
  const place = locationId === 'TST' ? '尖沙咀' : '將軍澳';

  return {
    temperature: 28,
    place,
    humidity: 78,
    rainfall: 0,
    weatherDescription: '大致多雲，日間部分時間有陽光，天氣炎熱。',
    iconId: 53,
    todayMinTemp: 26,
    todayMaxTemp: 32,
    psr: '中',
    uvIndex: 6,
    uvLevel: '高',
    aqhi: { index: 3, level: '低至中等', station: place },
    warnings: [],
    hourlyForecast: Array.from({ length: 6 }).map((_, i) => ({
      time: `${((currentHour + i) % 24).toString().padStart(2, '0')}:00`,
      temp: 28 + (i % 2 === 0 ? 0 : 1),
      iconId: 53,
      pop: 30,
    })),
    nineDayForecast: [
      { date: '08/19', week: '週三', minTemp: 27, maxTemp: 32, weather: '部分時間有陽光', iconId: 51, psr: '低' },
      { date: '08/20', week: '週四', minTemp: 27, maxTemp: 32, weather: '短暫陽光有驟雨', iconId: 54, psr: '中' },
      { date: '08/21', week: '週五', minTemp: 26, maxTemp: 31, weather: '多雲有雷暴', iconId: 65, psr: '高' },
    ],
    updateTime: now.toLocaleTimeString('zh-HK', { hour: '2-digit', minute: '2-digit' }),
  };
}
