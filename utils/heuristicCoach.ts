
import { Shot, ClubStats } from '../types';

// PGA Tour Averages for Comparison
const PGA_BENCHMARKS: Record<string, { carry: number, spin: number, smash: number, apex: number, ballSpeed: number, landArea: number }> = {
  'Driver': { carry: 275, ballSpeed: 167, spin: 2500, smash: 1.48, apex: 95, landArea: 800 },
  '3W': { carry: 243, ballSpeed: 158, spin: 3600, smash: 1.46, apex: 92, landArea: 650 },
  '5W': { carry: 230, ballSpeed: 152, spin: 4300, smash: 1.45, apex: 95, landArea: 600 },
  '3I': { carry: 212, ballSpeed: 142, spin: 4600, smash: 1.43, apex: 88, landArea: 550 },
  '4I': { carry: 203, ballSpeed: 137, spin: 4800, smash: 1.42, apex: 85, landArea: 500 },
  '5I': { carry: 194, ballSpeed: 132, spin: 5300, smash: 1.41, apex: 82, landArea: 450 },
  '6I': { carry: 183, ballSpeed: 127, spin: 6100, smash: 1.38, apex: 80, landArea: 400 },
  '7I': { carry: 172, ballSpeed: 120, spin: 7000, smash: 1.33, apex: 78, landArea: 350 },
  '8I': { carry: 160, ballSpeed: 115, spin: 7900, smash: 1.32, apex: 75, landArea: 300 },
  '9I': { carry: 148, ballSpeed: 109, spin: 8500, smash: 1.28, apex: 72, landArea: 250 },
  'PW': { carry: 136, ballSpeed: 102, spin: 9300, smash: 1.23, apex: 68, landArea: 200 },
};

export const analyzeClubTactically = (stats: ClubStats): string => {
  const { averages, club, highs, lows } = stats;
  const benchmark = PGA_BENCHMARKS[club];
  
  let report = "[GROUPING & DISPERSION]\n";

  // Dispersion Area Footprint
  const carrySpread = highs.carryDistance - lows.carryDistance;
  const offlineSpread = Math.abs(highs.offline - lows.offline);
  const footprint = Math.max(1, carrySpread * offlineSpread);
  
  if (benchmark) {
    const areaRatio = footprint / benchmark.landArea;
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
  const carryVariance = (carrySpread / averages.carryDistance) * 100;
  
  report += `- **Vertical Variance**: Your carry distance oscillates by **${carrySpread.toFixed(1)} yards** (${carryVariance.toFixed(1)}%).\n`;
  
  if (carryVariance > 10) {
    report += `- **High Volatility**: The large front-to-back variance suggests "thin" or "heavy" strikes. Consistency here is more important than raw speed.\n`;
  } else {
    report += `- **Reliable Depth**: Your depth control is excellent. You can trust this yardage for forced carries over hazards.\n`;
  }

  if (benchmark) {
    const speedIndex = (averages.ballSpeed / benchmark.ballSpeed) * 100;
    report += `- **Power Index**: You are generating **${speedIndex.toFixed(1)}%** of the ball speed produced by the average PGA Tour pro with this club.\n`;
  }

  return report;
};

export const analyzeSessionStrategically = (clubStats: ClubStats[]): string => {
  if (clubStats.length === 0) return "Upload session data to begin analysis.";

  let report = "[BAG-WIDE GROUPINGS]\n";
  
  // Find the "Group Leader" (tightest area)
  const groupings = clubStats.map(s => ({
    club: s.club,
    area: (s.highs.carryDistance - s.lows.carryDistance) * Math.abs(s.highs.offline - s.lows.offline)
  })).sort((a, b) => a.area - b.area);

  const tightest = groupings[0];
  const widest = groupings[groupings.length - 1];

  report += `- **Consistency Anchor**: Your **${tightest.club}** has the most concentrated grouping in the bag today. This is your "safety" club.\n`;
  report += `- **Dispersion Outlier**: Your **${widest.club}** is struggling with spatial consistency. Its landing area is the largest in your session.\n`;

  report += "\n[VARIANCE HEATMAP]\n";
  
  // Variance logic
  const volatility = clubStats.map(s => ({
    club: s.club,
    v: (s.highs.carryDistance - s.lows.carryDistance) / s.averages.carryDistance
  })).sort((a, b) => b.v - a.v);

  const mostVolatile = volatility[0];

  report += `- **Variance Leader**: The **${mostVolatile.club}** is showing the highest percentage of yardage volatility (**${(mostVolatile.v * 100).toFixed(1)}%**).\n`;
  report += `- **Strategic Focus**: Your next practice block should prioritize the **${mostVolatile.club}**. Tightening the variance on this specific club will provide the fastest drop in your handicap.\n`;
  
  const avgSmash = clubStats.reduce((acc, s) => acc + (s.averages.ballSpeed / (s.averages.clubSpeed || 1)), 0) / clubStats.length;
  report += `- **Ball Striking Efficiency**: Your session-wide Smash Factor is **${avgSmash.toFixed(2)}**. (Tour average: ~1.38 across the bag).\n`;

  return report;
};
