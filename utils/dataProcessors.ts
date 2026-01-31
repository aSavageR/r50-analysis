
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

export const processCsvRows = (rows: any[], sessionId: string): Shot[] => {
  return rows
    .map((row, index) => {
      const clubValue = row['Club Type'] || row['Club Name'];
      const club = clubValue ? normalizeClub(clubValue) : undefined;
      const ballSpeed = parseFloat(row['Ball Speed'] || '0');
      const carryDistance = parseFloat(row['Carry Distance'] || '0');

      // Basic data validity check
      if (!club || isNaN(ballSpeed) || isNaN(carryDistance) || (ballSpeed === 0 && carryDistance === 0)) {
        return null;
      }

      const spinRate = parseFloat(row['Spin Rate'] || row['Total Spin'] || '0');
      const spinAxis = parseFloat(row['Spin Axis'] || '0');
      
      let backSpin = parseFloat(row['Back Spin'] || '0');
      let sideSpin = parseFloat(row['Side Spin'] || '0');

      if (spinRate > 0 && backSpin === 0 && sideSpin === 0) {
        const axisInRadians = (spinAxis * Math.PI) / 180;
        sideSpin = spinRate * Math.sin(axisInRadians);
        backSpin = spinRate * Math.cos(axisInRadians);
      }

      return {
        id: `${sessionId}-${index}`,
        timestamp: parseDate(row['Date']),
        club: club,
        ballSpeed,
        clubSpeed: parseFloat(row['Club Speed'] || '0'),
        smashFactor: parseFloat(row['Smash Factor'] || '0'),
        carryDistance,
        totalDistance: parseFloat(row['Total Distance'] || '0'),
        launchAngle: parseFloat(row['Launch Angle'] || '0'),
        launchDirection: parseFloat(row['Launch Direction'] || '0'),
        spinRate,
        backSpin,
        sideSpin,
        spinAxis,
        apex: parseFloat(row['Apex Height'] || '0'),
        descentAngle: parseFloat(row['Descent Angle'] || '0'),
        offline: parseFloat(row['Carry Deviation Distance'] || row['Horizontal Carry'] || '0'),
        totalOffline: parseFloat(row['Total Deviation Distance'] || row['Horizontal Total'] || '0'),
        sessionId,
      };
    })
    .filter((shot): shot is Shot => shot !== null);
};

/**
 * Enhanced outlier filtering.
 * Uses a two-stage approach:
 * 1. Percentile Trim: Removes the bottom 10% and top 5% of shots by carry (highly effective for launch monitor data).
 * 2. Tight IQR: Uses a 1.0 multiplier (stricter than the standard 1.5) to find the core data cluster.
 */
export const filterOutliers = (shots: Shot[]): Shot[] => {
  if (shots.length < 5) return shots;

  // Initial sort by carry distance to identify extreme mishits
  const sortedByCarry = [...shots].sort((a, b) => a.carryDistance - b.carryDistance);
  
  // Stage 1: Aggressive Percentile Trim
  // Removes bottom 10% (duffs/topped) and top 5% (glitch/wind reads)
  const start = Math.floor(shots.length * 0.1);
  const end = Math.ceil(shots.length * 0.95);
  const trimmed = sortedByCarry.slice(start, end);

  if (trimmed.length < 3) return shots;

  // Stage 2: Tight Interquartile Range (IQR) Filter
  // Multiplier reduced from 1.5 to 1.0 for a significantly higher removal percentage
  const values = trimmed.map(s => s.carryDistance).sort((a, b) => a - b);
  const q1 = values[Math.floor(values.length * 0.25)];
  const q3 = values[Math.floor(values.length * 0.75)];
  const iqr = q3 - q1;
  const lowerBound = q1 - 1.0 * iqr;
  const upperBound = q3 + 1.0 * iqr;

  // Return the data that fits in the tightest cluster, ensuring no total duffs (under 10yds)
  return trimmed.filter(s => 
    s.carryDistance >= lowerBound && 
    s.carryDistance <= upperBound &&
    s.carryDistance > 10
  );
};

export const calculateClubStats = (shots: Shot[]): ClubStats[] => {
  const clubs = Array.from(new Set(shots.map(s => s.club)));
  
  return clubs.map(clubName => {
    const allShots = shots.filter(s => s.club === clubName);
    const filteredShots = filterOutliers(allShots);
    const count = filteredShots.length;

    const metrics: (keyof ShotStats)[] = [
      'ballSpeed', 'clubSpeed', 'carryDistance', 'totalDistance', 
      'launchAngle', 'spinRate', 'backSpin', 'sideSpin', 'spinAxis', 
      'apex', 'descentAngle', 'offline', 'totalOffline'
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
