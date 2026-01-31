
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

      if (!club || isNaN(ballSpeed) || isNaN(carryDistance) || (ballSpeed === 0 && carryDistance === 0)) {
        return null;
      }

      // Base metrics
      const spinRate = parseFloat(row['Spin Rate'] || row['Total Spin'] || '0');
      const spinAxis = parseFloat(row['Spin Axis'] || '0');
      
      // Check for provided components first
      let backSpin = parseFloat(row['Back Spin'] || '0');
      let sideSpin = parseFloat(row['Side Spin'] || '0');

      // PHYSICS CALCULATION: If components are missing (common in R50 exports) but Axis/Total are present
      // Spin Component = Total Spin * sin/cos(Axis). Axis is tilt from vertical.
      if (spinRate > 0 && backSpin === 0 && sideSpin === 0) {
        const axisInRadians = (spinAxis * Math.PI) / 180;
        // Side spin is horizontal component (sine)
        sideSpin = spinRate * Math.sin(axisInRadians);
        // Back spin is vertical component (cosine)
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

export const filterOutliers = (shots: Shot[]): Shot[] => {
  if (shots.length < 3) return shots;
  const values = shots.map(s => s.carryDistance).sort((a, b) => a - b);
  const q1 = values[Math.floor(values.length / 4)];
  const q3 = values[Math.floor(values.length * 0.75)];
  const iqr = q3 - q1;
  const lowerBound = q1 - 1.5 * iqr;
  const upperBound = q3 + 1.5 * iqr;
  return shots.filter(s => s.carryDistance >= lowerBound && s.carryDistance <= upperBound);
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
