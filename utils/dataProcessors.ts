
import { Shot, ClubStats, ShotStats } from '../types';
import { CLUB_COLORS, DEFAULT_COLOR } from '../constants';

const normalizeClub = (club: string): string => {
  if (!club) return 'Unknown';
  let c = club.toUpperCase().trim();
  
  const mapping: Record<string, string> = {
    'PITCHING WEDGE': 'PW',
    'SAND WEDGE': 'SW',
    'GAP WEDGE': 'GW',
    'LOB WEDGE': 'LW',
    'APPROACH WEDGE': 'AW',
    '5 IRON': '5I',
    '6 IRON': '6I',
    '7 IRON': '7I',
    '8 IRON': '8I',
    '9 IRON': '9I',
    '3 WOOD': '3W',
    '5 WOOD': '5W',
    'DRIVER': 'Driver'
  };

  if (mapping[c]) return mapping[c];
  return c.replace(/IRON/g, 'I').replace(/WOOD/g, 'W').replace(/HYBRID/g, 'H').replace(/\s+/g, '');
};

const parseDate = (dateStr: string): string => {
  if (!dateStr) return new Date().toISOString();
  const match = dateStr.match(/^(\d{2})\/(\d{2})\/(\d{4})\s(\d{2}):(\d{2}):(\d{2})$/);
  if (match) {
    const [_, d, m, y, h, min, s] = match;
    const date = new Date(parseInt(y), parseInt(m) - 1, parseInt(d), parseInt(h), parseInt(min), parseInt(s));
    if (!isNaN(date.getTime())) return date.toISOString();
  }
  const fallback = new Date(dateStr);
  return !isNaN(fallback.getTime()) ? fallback.toISOString() : new Date().toISOString();
};

/**
 * Robustly find a value from multiple possible header variations
 */
const getRowValue = (row: any, keys: string[]): string => {
  const rowKeys = Object.keys(row);
  
  // Direct match check
  for (const key of keys) {
    if (row[key] !== undefined && row[key] !== null && row[key] !== '') {
      return row[key].toString();
    }
  }

  // Fuzzy match (lowercase, no whitespace)
  const normalizedKeys = keys.map(k => k.toLowerCase().replace(/[\s_]/g, ''));
  for (const rKey of rowKeys) {
    const normalizedRKey = rKey.toLowerCase().replace(/[\s_]/g, '');
    if (normalizedKeys.includes(normalizedRKey)) {
      if (row[rKey] !== undefined && row[rKey] !== null && row[rKey] !== '') {
        return row[rKey].toString();
      }
    }
  }

  return '0';
};

const safeParse = (val: string): number => {
  const parsed = parseFloat(val);
  return isNaN(parsed) ? 0 : parsed;
};

export const processCsvRows = (rows: any[], sessionId: string): Shot[] => {
  return rows
    .map((row, index) => {
      const clubValue = getRowValue(row, ['Club Type', 'Club Name', 'Club']);
      const club = clubValue !== '0' ? normalizeClub(clubValue) : undefined;
      const ballSpeed = safeParse(getRowValue(row, ['Ball Speed']));
      const carryDistance = safeParse(getRowValue(row, ['Carry Distance']));

      if (!club || isNaN(ballSpeed) || isNaN(carryDistance) || carryDistance < 5 || ballSpeed < 10) {
        return null;
      }

      const spinRate = safeParse(getRowValue(row, ['Spin Rate', 'Total Spin', 'Spin']));
      const spinAxis = safeParse(getRowValue(row, ['Spin Axis']));
      
      let backSpin = safeParse(getRowValue(row, ['Back Spin']));
      let sideSpin = safeParse(getRowValue(row, ['Side Spin']));

      if (spinRate > 0 && backSpin === 0 && sideSpin === 0) {
        const axisInRadians = (spinAxis * Math.PI) / 180;
        sideSpin = spinRate * Math.sin(axisInRadians);
        backSpin = spinRate * Math.cos(axisInRadians);
      }

      return {
        id: `${sessionId}-${index}`,
        timestamp: parseDate(getRowValue(row, ['Date'])),
        club: club,
        ballSpeed,
        clubSpeed: safeParse(getRowValue(row, ['Club Speed'])),
        smashFactor: safeParse(getRowValue(row, ['Smash Factor', 'Smash'])),
        carryDistance,
        totalDistance: safeParse(getRowValue(row, ['Total Distance'])),
        launchAngle: safeParse(getRowValue(row, ['Launch Angle', 'Launch V'])),
        launchDirection: safeParse(getRowValue(row, ['Launch Direction', 'Launch H'])),
        spinRate,
        backSpin,
        sideSpin,
        spinAxis,
        apex: safeParse(getRowValue(row, ['Apex Height', 'Apex'])),
        angleAttack: safeParse(getRowValue(row, ['Angle of Attack', 'Attack Angle', 'AoA'])),
        offline: safeParse(getRowValue(row, ['Carry Deviation Distance', 'Horizontal Carry', 'Offline Carry'])),
        totalOffline: 0,
        sessionId,
      };
    })
    .filter((shot): shot is Shot => shot !== null);
};

export const filterOutliers = (shots: Shot[]): Shot[] => {
  if (shots.length < 4) return shots;

  const sortedByCarry = [...shots].sort((a, b) => a.carryDistance - b.carryDistance);
  const start = Math.floor(shots.length * 0.1);
  const end = Math.ceil(shots.length * 0.9);
  const trimmed = sortedByCarry.slice(start, end);

  if (trimmed.length < 2) return shots;

  const values = trimmed.map(s => s.carryDistance).sort((a, b) => a - b);
  const q1 = values[Math.floor(values.length * 0.25)];
  const q3 = values[Math.floor(values.length * 0.75)];
  const iqr = q3 - q1;
  const lowerBound = q1 - 1.5 * iqr;
  const upperBound = q3 + 1.5 * iqr;

  return trimmed.filter(s => 
    s.carryDistance >= lowerBound && 
    s.carryDistance <= upperBound
  );
};

export const calculateClubStats = (shots: Shot[]): ClubStats[] => {
  const clubs = Array.from(new Set(shots.map(s => s.club)));
  
  return clubs.map(clubName => {
    const allShots = shots.filter(s => s.club === clubName);
    const filteredShots = filterOutliers(allShots);
    const count = filteredShots.length;

    const metrics: (keyof ShotStats)[] = [
      'ballSpeed', 'clubSpeed', 'smashFactor', 'carryDistance', 'totalDistance', 
      'launchAngle', 'spinRate', 'backSpin', 'sideSpin', 'spinAxis', 
      'apex', 'angleAttack', 'offline'
    ];

    const averages: any = {};
    const highs: any = {};
    const lows: any = {};

    metrics.forEach(m => {
      const vals = filteredShots.map(s => s[m as keyof Shot] as number);
      averages[m] = vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / count : 0;
      highs[m] = vals.length > 0 ? Math.max(...vals) : 0;
      lows[m] = vals.length > 0 ? Math.min(...vals) : 0;
    });

    return {
      club: clubName,
      count,
      averages: averages as ShotStats,
      highs: highs as ShotStats,
      lows: lows as ShotStats,
      color: CLUB_COLORS[clubName] || DEFAULT_COLOR,
      shots: allShots
    };
  }).sort((a, b) => {
    const order = ["Driver", "3W", "5W", "3H", "4H", "3I", "4I", "5I", "6I", "7I", "8I", "9I", "PW", "GW", "SW", "LW"];
    const idxA = order.indexOf(a.club);
    const idxB = order.indexOf(b.club);
    if (idxA !== -1 && idxB !== -1) return idxA - idxB;
    if (idxA !== -1) return -1;
    if (idxB !== -1) return 1;
    return a.club.localeCompare(b.club);
  });
};
