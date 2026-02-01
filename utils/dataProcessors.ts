
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
  for (const key of keys) {
    if (row[key] !== undefined && row[key] !== null && row[key] !== '') {
      return row[key];
    }
  }
  return '0';
};

export const processCsvRows = (rows: any[], sessionId: string): Shot[] => {
  return rows
    .map((row, index) => {
      const clubValue = getRowValue(row, ['Club Type', 'Club Name']);
      const club = clubValue !== '0' ? normalizeClub(clubValue) : undefined;
      const ballSpeed = parseFloat(getRowValue(row, ['Ball Speed']));
      const carryDistance = parseFloat(getRowValue(row, ['Carry Distance']));

      if (!club || isNaN(ballSpeed) || isNaN(carryDistance) || carryDistance < 10 || ballSpeed < 20) {
        return null;
      }

      const spinRate = parseFloat(getRowValue(row, ['Spin Rate', 'Total Spin']));
      const spinAxis = parseFloat(getRowValue(row, ['Spin Axis']));
      
      let backSpin = parseFloat(getRowValue(row, ['Back Spin']));
      let sideSpin = parseFloat(getRowValue(row, ['Side Spin']));

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
        clubSpeed: parseFloat(getRowValue(row, ['Club Speed'])),
        smashFactor: parseFloat(getRowValue(row, ['Smash Factor'])),
        carryDistance,
        totalDistance: parseFloat(getRowValue(row, ['Total Distance'])),
        launchAngle: parseFloat(getRowValue(row, ['Launch Angle'])),
        launchDirection: parseFloat(getRowValue(row, ['Launch Direction'])),
        spinRate,
        backSpin,
        sideSpin,
        spinAxis,
        apex: parseFloat(getRowValue(row, ['Apex Height'])),
        // R50 CSVs can use different casing or naming for Angle of Attack
        angleAttack: parseFloat(getRowValue(row, ['Angle of Attack', 'Attack Angle', 'AngleOfAttack', 'AoA'])),
        offline: parseFloat(getRowValue(row, ['Carry Deviation Distance', 'Horizontal Carry'])),
        totalOffline: parseFloat(getRowValue(row, ['Total Deviation Distance', 'Horizontal Total'])),
        sessionId,
      };
    })
    .filter((shot): shot is Shot => shot !== null);
};

export const filterOutliers = (shots: Shot[]): Shot[] => {
  if (shots.length < 4) return shots;

  const sortedByCarry = [...shots].sort((a, b) => a.carryDistance - b.carryDistance);
  const start = Math.floor(shots.length * 0.15);
  const end = Math.ceil(shots.length * 0.90);
  const trimmed = sortedByCarry.slice(start, end);

  if (trimmed.length < 2) return shots;

  const values = trimmed.map(s => s.carryDistance).sort((a, b) => a - b);
  const q1 = values[Math.floor(values.length * 0.25)];
  const q3 = values[Math.floor(values.length * 0.75)];
  const iqr = q3 - q1;
  const lowerBound = q1 - 0.75 * iqr;
  const upperBound = q3 + 0.75 * iqr;

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
      'apex', 'angleAttack', 'offline', 'totalOffline'
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
