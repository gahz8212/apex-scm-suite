const axios = require('axios');

/**
 * MSC Port Code to internal Port ID mapping
 */
async function getMscPortId(portCode, token) {
  if (!portCode) {
    throw new Error('Port code is required');
  }

  // Normalize port code: e.g. "BUSAN, KOREA" -> "BUSAN", "LONG BEACH (USLGB)" -> "LONG BEACH"
  const cleanCode = portCode.split(',')[0].split('(')[0].toUpperCase().trim();

  // Static common mappings
  const staticMap = {
    'KRPUS': 274,
    'BUSAN': 274,
    'KRINC': 275,
    'INCHEON': 275,
    'USLGB': 82,
    'LONG BEACH': 82,
    'USLAX': 120,
    'LOS ANGELES': 120,
    'USSEA': 1585,
    'SEATTLE': 1585,
    'CNSHA': 252,
    'SHANGHAI': 252,
    'NLRTM': 941,
    'ROTTERDAM': 941,
  };

  if (staticMap[cleanCode]) {
    return staticMap[cleanCode];
  }

  // Dynamic fallback: Query MSC Port Search API
  try {
    const searchUrl = 'https://www.msc.com/api/feature/tools/SearchPorts';
    const headers = {
      'Accept': 'application/json, text/plain, */*',
      'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36',
      'X-Requested-With': 'XMLHttpRequest',
      'sec-ch-ua': '"Google Chrome";v="149", "Chromium";v="149", "Not)A;Brand";v="24"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"Windows"',
      'sec-fetch-dest': 'empty',
      'sec-fetch-mode': 'cors',
      'sec-fetch-site': 'same-origin'
    };

    if (token) {
      if (token.includes('=') && (token.includes('SessionId') || token.includes('msccargo') || token.includes('ak_bmsc'))) {
        headers['Cookie'] = token;
      } else {
        headers['Authorization'] = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
      }
    }

    const response = await axios.get(searchUrl, {
      params: { query: cleanCode, language: 'ko-KR' },
      headers,
      timeout: 5000
    });

    let portsArray = [];
    if (response.data) {
      if (Array.isArray(response.data)) {
        portsArray = response.data;
      } else if (Array.isArray(response.data.Data)) {
        portsArray = response.data.Data;
      } else if (Array.isArray(response.data.data)) {
        portsArray = response.data.data;
      } else {
        for (const key of Object.keys(response.data)) {
          if (Array.isArray(response.data[key])) {
            portsArray = response.data[key];
            break;
          }
        }
      }
    }

    if (portsArray.length > 0) {
      const port = portsArray.find((p) => {
        const pCode = String(p.LocationCode || p.portCode || p.PortCode || p.code || p.Code || '').toUpperCase().trim();
        const pName = String(p.LocationName || p.name || p.Name || p.portName || p.PortName || '').toUpperCase().trim();
        return pCode === cleanCode || pName.includes(cleanCode);
      });

      if (port) {
        const portId = port.PortId || port.portId || port.id || port.Id;
        if (portId !== undefined && portId !== null) {
          return Number(portId);
        }
      }
    }
  } catch (error) {
    console.error(`[MSC Port Search] Failed to fetch ID for ${portCode}:`, error.message);
  }

  // Fallback defaults if not found
  if (cleanCode.includes('PUS') || cleanCode.includes('BUSAN')) return 274;
  if (cleanCode.includes('INC') || cleanCode.includes('INCHEON')) return 275;
  if (cleanCode.includes('LGB') || cleanCode.includes('BEACH')) return 82;
  if (cleanCode.includes('LAX') || cleanCode.includes('ANGELES')) return 120;
  if (cleanCode.includes('SHA') || cleanCode.includes('SHANGHAI')) return 252;
  if (cleanCode.includes('RTM') || cleanCode.includes('ROTTERDAM')) return 941;

  throw new Error(`MSC Port ID mapping not found for: ${portCode}`);
}

/**
 * English ordinal cleanup and Date parser
 */
function parseMscDate(dateStr) {
  if (!dateStr) return null;
  const cleaned = String(dateStr).replace(/(\d+)(st|nd|rd|th)/gi, '$1');
  const parsed = new Date(cleaned);
  return isNaN(parsed.getTime()) ? null : parsed;
}

/**
 * Generate fallback mock schedules when live API is blocked by Akamai or cookie expires
 */
function generateFallbackSchedules(pol, pod) {
  const polClean = pol.toUpperCase();
  const podClean = pod.toUpperCase();
  const now = new Date();

  const vessels = [
    { name: 'MSC GULSUN', voyage: '2401E', line: 'ORIENT EXPRESS', daysToEtd: 4, transitDays: 14 },
    { name: 'MSC SIXIN', voyage: '2403E', line: 'PACIFIC DIRECT', daysToEtd: 10, transitDays: 13 },
    { name: 'MSC AMBRA', voyage: '2405E', line: 'CALIFORNIA STAR', daysToEtd: 17, transitDays: 15 },
    { name: 'MSC SAMU', voyage: '2407E', line: 'ORIENT EXPRESS', daysToEtd: 24, transitDays: 14 }
  ];

  return vessels.map(v => {
    const etd = new Date(now.getTime() + v.daysToEtd * 24 * 60 * 60 * 1000);
    const eta = new Date(etd.getTime() + v.transitDays * 24 * 60 * 60 * 1000);
    const docClosing = new Date(etd.getTime() - 2 * 24 * 60 * 60 * 1000);
    const cargoClosing = new Date(etd.getTime() - 1 * 24 * 60 * 60 * 1000);
    const vgmClosing = new Date(etd.getTime() - 36 * 60 * 60 * 1000);

    return {
      vesselName: v.name,
      voyage: v.voyage,
      line: v.line,
      carrier: 'MSC',
      pol: polClean,
      pod: podClean,
      etd: etd.toISOString().split('T')[0],
      eta: eta.toISOString().split('T')[0],
      docClosingDate: docClosing.toISOString().replace('T', ' ').slice(0, 16),
      cargoClosingDate: cargoClosing.toISOString().replace('T', ' ').slice(0, 16),
      vesselImo: '9839438',
      isFallback: true,
      metadata: {
        siCutOff: docClosing.toISOString(),
        cyCutOff: cargoClosing.toISOString(),
        vgmCutOff: vgmClosing.toISOString(),
        originalCarrier: 'MSC'
      }
    };
  });
}

/**
 * Fetch MSC Schedules from official MSC website API
 */
async function fetchMscSchedule(pol, pod, customToken) {
  const token = customToken || process.env.MSC_COOKIE || process.env.MSC_BEARER_TOKEN;

  let fromPortId;
  let toPortId;

  try {
    fromPortId = await getMscPortId(pol, token);
    toPortId = await getMscPortId(pod, token);
  } catch (err) {
    console.warn('[MSC Service] Port resolution error, generating fallback:', err.message);
    return generateFallbackSchedules(pol, pod);
  }

  const url = 'https://www.msc.com/api/feature/tools/SearchSailingRoutes';
  const todayStr = new Date().toISOString().split('T')[0];

  const payload = {
    FromDate: todayStr,
    dataSourceId: "{E9CCBD25-6FBA-4C5C-85F6-FC4F9E5A931F}",
    fromPortId: fromPortId,
    language: "ko-KR",
    toPortId: toPortId
  };

  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json, text/plain, */*',
    'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
    'Origin': 'https://www.msc.com',
    'Referer': 'https://www.msc.com/ko/search-a-schedule',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36',
    'X-Requested-With': 'XMLHttpRequest',
    'sec-ch-ua': '"Google Chrome";v="149", "Chromium";v="149", "Not)A;Brand";v="24"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"Windows"',
    'sec-fetch-dest': 'empty',
    'sec-fetch-mode': 'cors',
    'sec-fetch-site': 'same-origin'
  };

  if (token) {
    if (token.includes('=') && (token.includes('SessionId') || token.includes('msccargo') || token.includes('ak_bmsc'))) {
      headers['Cookie'] = token;
    } else {
      headers['Authorization'] = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
    }
  }

  try {
    console.log(`[MSC Service] Calling MSC API: POL(${pol}:${fromPortId}) -> POD(${pod}:${toPortId})`);
    const response = await axios.post(url, payload, { headers, timeout: 8000 });
    const data = response.data;

    // Check if response is empty string or HTML redirection (blocked by WAF)
    if (!data || (typeof data === 'string' && (data.trim() === '' || data.includes('<html')))) {
      console.warn('[MSC Service] MSC returned HTML/empty response (WAF blocked or cookie expired). Falling back to mock schedules.');
      return generateFallbackSchedules(pol, pod);
    }

    const results = [];
    const items = data.Data || data.data || [];

    if (Array.isArray(items) && items.length > 0) {
      for (const item of items) {
        const routes = item.Routes || item.routes || [];
        if (Array.isArray(routes)) {
          for (const route of routes) {
            const vesselName = route.VesselName || item.VesselName || 'MSC VESSEL';
            const voyage = route.DepartureVoyageNo || item.DepartureVoyageNo || 'V001';
            const line = item.LoadingService || route.LoadingService || 'ORIENT SERVICE';

            const etdStr = route.EstimatedDepartureDate || route.EstimatedDepartureTime || item.EstimatedDepartureTime;
            const etaStr = route.EstimatedArrivalDate || route.EstimatedArrivalTime || item.EstimatedArrivalTime;

            const etd = etdStr ? parseMscDate(etdStr) : new Date();
            const eta = etaStr ? parseMscDate(etaStr) : new Date();

            const docClosingDate = parseMscDate(route.CutOffs?.ShippingInstructionsCutOffDate);
            const cargoClosingDate = parseMscDate(route.CutOffs?.ContainerYardCutOffDate);
            const vgmCutOff = parseMscDate(route.CutOffs?.VerifiedGrossMassCutOffDate);

            const leg = route.RouteScheduleLegDetails?.[0];
            const vesselImo = leg?.Vessel?.VesselImoCode || route.VesselImoCode || null;

            results.push({
              vesselName,
              voyage,
              line,
              carrier: 'MSC',
              pol: item.PortOfLoadUnCode || pol,
              pod: item.PortOfDischargeUnCode || pod,
              etd: etd ? etd.toISOString().split('T')[0] : null,
              eta: eta ? eta.toISOString().split('T')[0] : null,
              docClosingDate: docClosingDate ? docClosingDate.toISOString().replace('T', ' ').slice(0, 16) : null,
              cargoClosingDate: cargoClosingDate ? cargoClosingDate.toISOString().replace('T', ' ').slice(0, 16) : null,
              vesselImo,
              isFallback: false,
              metadata: {
                siCutOff: docClosingDate ? docClosingDate.toISOString() : null,
                cyCutOff: cargoClosingDate ? cargoClosingDate.toISOString() : null,
                vgmCutOff: vgmCutOff ? vgmCutOff.toISOString() : null,
                originalCarrier: 'MSC'
              }
            });
          }
        }
      }
    }

    if (results.length === 0) {
      console.log('[MSC Service] No routes in response data. Using fallback.');
      return generateFallbackSchedules(pol, pod);
    }

    return results;
  } catch (error) {
    console.error(`[MSC Service Error] API request failed: ${error.message}. Returning fallback schedules.`);
    return generateFallbackSchedules(pol, pod);
  }
}

module.exports = {
  getMscPortId,
  fetchMscSchedule,
  generateFallbackSchedules
};
