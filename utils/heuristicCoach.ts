
import { Shot, ClubStats } from '../types';

export interface ProRange {
  min: number;
  max: number;
}

export interface ClubBenchmark {
  carry: ProRange;
  ballSpeed: ProRange;
  smash: ProRange;
  launch: ProRange;
  spin: ProRange;
  apex: ProRange;
  clubSpeed: ProRange;
  aoa: ProRange;
}

/**
 * Professional Ranges based on PGA Tour Averages (Trackman Official Data)
 * Focuses on key performance outcomes and impact geometry.
 */
export const PRO_BENCHMARKS: Record<string, ClubBenchmark> = {
  'Driver': {
    carry: { min: 265, max: 285 },
    ballSpeed: { min: 165, max: 172 },
    smash: { min: 1.48, max: 1.51 },
    launch: { min: 10, max: 12.5 },
    spin: { min: 2400, max: 2800 },
    apex: { min: 90, max: 110 },
    clubSpeed: { min: 112, max: 116 },
    aoa: { min: -1.5, max: 1.5 }
  },
  '3W': {
    carry: { min: 235, max: 250 },
    ballSpeed: { min: 155, max: 162 },
    smash: { min: 1.46, max: 1.49 },
    launch: { min: 9, max: 11.5 },
    spin: { min: 3500, max: 3900 },
    apex: { min: 85, max: 100 },
    clubSpeed: { min: 106, max: 110 },
    aoa: { min: -3.5, max: -2.5 }
  },
  '5W': {
    carry: { min: 220, max: 235 },
    ballSpeed: { min: 148, max: 155 },
    smash: { min: 1.45, max: 1.48 },
    launch: { min: 10.5, max: 13 },
    spin: { min: 4200, max: 4600 },
    apex: { min: 90, max: 105 },
    clubSpeed: { min: 102, max: 106 },
    aoa: { min: -4.0, max: -3.0 }
  },
  '3I': {
    carry: { min: 205, max: 218 },
    ballSpeed: { min: 140, max: 145 },
    smash: { min: 1.43, max: 1.46 },
    launch: { min: 11, max: 13.5 },
    spin: { min: 4500, max: 4900 },
    apex: { min: 85, max: 98 },
    clubSpeed: { min: 98, max: 102 },
    aoa: { min: -4.0, max: -3.0 }
  },
  '4I': {
    carry: { min: 195, max: 208 },
    ballSpeed: { min: 135, max: 140 },
    smash: { min: 1.42, max: 1.45 },
    launch: { min: 11.5, max: 14 },
    spin: { min: 4800, max: 5200 },
    apex: { min: 80, max: 95 },
    clubSpeed: { min: 95, max: 99 },
    aoa: { min: -4.2, max: -3.2 }
  },
  '5I': {
    carry: { min: 185, max: 198 },
    ballSpeed: { min: 130, max: 135 },
    smash: { min: 1.40, max: 1.43 },
    launch: { min: 12.5, max: 15 },
    spin: { min: 5300, max: 5700 },
    apex: { min: 80, max: 92 },
    clubSpeed: { min: 93, max: 97 },
    aoa: { min: -4.3, max: -3.3 }
  },
  '6I': {
    carry: { min: 175, max: 188 },
    ballSpeed: { min: 125, max: 130 },
    smash: { min: 1.38, max: 1.41 },
    launch: { min: 14, max: 16.5 },
    spin: { min: 6000, max: 6400 },
    apex: { min: 80, max: 90 },
    clubSpeed: { min: 91, max: 95 },
    aoa: { min: -4.5, max: -3.5 }
  },
  '7I': {
    carry: { min: 165, max: 178 },
    ballSpeed: { min: 118, max: 123 },
    smash: { min: 1.33, max: 1.38 },
    launch: { min: 16, max: 18.5 },
    spin: { min: 6800, max: 7300 },
    apex: { min: 78, max: 88 },
    clubSpeed: { min: 89, max: 93 },
    aoa: { min: -4.7, max: -3.7 }
  },
  '8I': {
    carry: { min: 155, max: 165 },
    ballSpeed: { min: 112, max: 118 },
    smash: { min: 1.31, max: 1.35 },
    launch: { min: 18, max: 20.5 },
    spin: { min: 7700, max: 8200 },
    apex: { min: 75, max: 85 },
    clubSpeed: { min: 86, max: 90 },
    aoa: { min: -4.9, max: -3.9 }
  },
  '9I': {
    carry: { min: 142, max: 153 },
    ballSpeed: { min: 106, max: 112 },
    smash: { min: 1.27, max: 1.31 },
    launch: { min: 20, max: 23 },
    spin: { min: 8300, max: 8800 },
    apex: { min: 72, max: 82 },
    clubSpeed: { min: 84, max: 88 },
    aoa: { min: -5.1, max: -4.1 }
  },
  'PW': {
    carry: { min: 130, max: 140 },
    ballSpeed: { min: 98, max: 105 },
    smash: { min: 1.23, max: 1.27 },
    launch: { min: 23, max: 26 },
    spin: { min: 9100, max: 9600 },
    apex: { min: 70, max: 80 },
    clubSpeed: { min: 82, max: 86 },
    aoa: { min: -5.3, max: -4.3 }
  },
  'SW': {
    carry: { min: 115, max: 125 },
    ballSpeed: { min: 90, max: 98 },
    smash: { min: 1.15, max: 1.22 },
    launch: { min: 26, max: 30 },
    spin: { min: 9600, max: 10500 },
    apex: { min: 65, max: 75 },
    clubSpeed: { min: 79, max: 83 },
    aoa: { min: -5.5, max: -4.5 }
  }
};

export const getBenchmarkForClub = (club: string): ClubBenchmark | null => {
  if (PRO_BENCHMARKS[club]) return PRO_BENCHMARKS[club];
  
  // Fuzzy match for wedges
  if (club.includes('W') && !PRO_BENCHMARKS[club]) {
    if (club === 'LW' || club === 'LW') return PRO_BENCHMARKS['SW'];
    if (club === 'GW' || club === 'AW') return PRO_BENCHMARKS['PW'];
    return PRO_BENCHMARKS['SW'];
  }

  // Fuzzy match for hybrids
  if (club.includes('H')) {
    const ironNum = club.match(/\d/);
    if (ironNum) {
      const ironKey = `${ironNum[0]}I`;
      return PRO_BENCHMARKS[ironKey] || PRO_BENCHMARKS['3I'];
    }
    return PRO_BENCHMARKS['3I'];
  }

  return null;
};

export const analyzeClubTactically = (stats: ClubStats): string => {
  const { averages, club, highs, lows } = stats;
  const benchmark = getBenchmarkForClub(club);
  
  let report = "[GROUPING & DISPERSION]\n";

  // Dispersion Area Footprint
  const carrySpread = highs.carryDistance - lows.carryDistance;
  const offlineSpread = Math.abs(highs.offline - lows.offline);
  const footprint = Math.max(1, carrySpread * offlineSpread);
  
  if (benchmark) {
    // Basic area benchmark (heuristic)
    const targetArea = (benchmark.carry.max - benchmark.carry.min) * 5; 
    const areaRatio = footprint / targetArea;
    if (areaRatio < 1.2) {
      report += `- **Tour-Level Tightness**: Your landing footprint of **${footprint.toFixed(0)} sq yards** is remarkably close to the professional standard for a ${club}.\n`;
    } else if (areaRatio > 2.5) {
      report += `- **Loose Grouping**: Your dispersion area (**${footprint.toFixed(0)} sq yds**) is over 2.5x the pro target. Focus on centering your strike to shrink this box.\n`;
    } else {
      report += `- **Stable Footprint**: Your grouping area is consistent with an advanced amateur profile.\n`;
    }
  }

  const lateralBias = averages.offline;
  if (Math.abs(lateralBias) > 10) {
    report += `- **Spatial Bias**: You are grouping heavily to the **${lateralBias > 0 ? 'Right' : 'Left'}**. This isn't just a miss; it's a repeatable pattern that requires aim compensation or path work.\n`;
  }

  report += "\n[VARIANCE DIAGNOSTICS]\n";
  const carryVariance = (carrySpread / (averages.carryDistance || 1)) * 100;
  
  report += `- **Vertical Variance**: Your carry distance oscillates by **${carrySpread.toFixed(1)} yards** (${carryVariance.toFixed(1)}%).\n`;
  
  if (carryVariance > 10) {
    report += `- **High Volatility**: The large front-to-back variance suggests "thin" or "heavy" strikes. Consistency here is more important than raw speed.\n`;
  } else {
    report += `- **Reliable Depth**: Your depth control is excellent. You can trust this yardage for forced carries over hazards.\n`;
  }

  if (benchmark) {
    const speedIndex = (averages.ballSpeed / benchmark.ballSpeed.min) * 100;
    report += `- **Power Index**: You are generating **${speedIndex.toFixed(1)}%** of the ball speed produced by the average PGA Tour pro with this club.\n`;
  }

  return report;
};

export const analyzeSessionStrategically = (clubStats: ClubStats[]): string => {
  if (clubStats.length === 0) return "Upload session data to begin analysis.";

  let report = "[BAG-WIDE GROUPINGS]\n";
  
  const groupings = clubStats.map(s => ({
    club: s.club,
    area: (s.highs.carryDistance - s.lows.carryDistance) * Math.abs(s.highs.offline - s.lows.offline)
  })).sort((a, b) => a.area - b.area);

  const tightest = groupings[0];
  const widest = groupings[groupings.length - 1];

  report += `- **Consistency Anchor**: Your **${tightest.club}** has the most concentrated grouping in the bag today. This is your "safety" club.\n`;
  report += `- **Dispersion Outlier**: Your **${widest.club}** is struggling with spatial consistency. Its landing area is the largest in your session.\n`;

  report += "\n[VARIANCE HEATMAP]\n";
  
  const volatility = clubStats.map(s => ({
    club: s.club,
    v: (s.highs.carryDistance - s.lows.carryDistance) / (s.averages.carryDistance || 1)
  })).sort((a, b) => b.v - a.v);

  const mostVolatile = volatility[0];

  report += `- **Variance Leader**: The **${mostVolatile.club}** is showing the highest percentage of yardage volatility (**${(mostVolatile.v * 100).toFixed(1)}%**).\n`;
  report += `- **Strategic Focus**: Your next practice block should prioritize the **${mostVolatile.club}**. Tightening the variance on this specific club will provide the fastest drop in your handicap.\n`;
  
  const avgSmash = clubStats.reduce((acc, s) => acc + (s.averages.ballSpeed / (s.averages.clubSpeed || 1)), 0) / clubStats.length;
  report += `- **Ball Striking Efficiency**: Your session-wide Smash Factor is **${avgSmash.toFixed(2)}**. (Tour average: ~1.38 across the bag).\n`;

  return report;
};
