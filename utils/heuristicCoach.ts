
import { Shot, ClubStats } from '../types';

export const analyzeClubTactically = (stats: ClubStats): string => {
  const { averages, club } = stats;
  let report = "[LAUNCH OPTIMIZATION]\n";

  // Smash Factor Logic
  const isDriver = club.toLowerCase().includes('driver');
  const isWedge = club.toLowerCase().includes('w');
  const isIron = club.toLowerCase().includes('i') || (!isDriver && !isWedge);

  if (isDriver && averages.ballSpeed / (averages.clubSpeed || 1) < 1.42) {
    report += "- **Smash Factor is sub-optimal**. You are likely missing the center of the face, costing you 10-15 yards.\n";
  } else if (isIron && averages.ballSpeed / (averages.clubSpeed || 1) < 1.3) {
    report += "- **Strike Efficiency is low**. Focus on a more centered strike to stabilize carry distances.\n";
  } else {
    report += "- **Efficiency looks solid**. Your speed-to-distance conversion is within the professional window.\n";
  }

  // Spin Logic
  if (isDriver && averages.spinRate > 3000) {
    report += "- **Spin is too high**. This is causing a 'ballooning' flight. Check your angle of attack.\n";
  } else if (isIron && averages.spinRate < 4500 && averages.spinRate > 0) {
    report += "- **Low Spin Detected**. This may lead to 'fliers' that won't stop on the green.\n";
  }

  report += "\n[MECHANICAL FIX]\n";
  if (Math.abs(averages.offline) > 12) {
    const side = averages.offline > 0 ? "Right" : "Left";
    report += `- **Lateral Bias**: You are consistently missing **${side}**. Check your face-to-path relationship.\n`;
    report += `- **Feel Drill**: Try the 'Gate Drill'—place two tees just wider than your clubhead to force a neutral path.\n`;
  } else {
    report += "- **Tight Dispersion**: Your face control is excellent. Focus on depth control (speed) rather than direction.\n";
    report += "- **Drill**: 'Ladder Drill'—try to hit three consecutive shots in 5-yard carry increments.\n";
  }

  return report;
};

export const analyzeSessionStrategically = (clubStats: ClubStats[]): string => {
  if (clubStats.length === 0) return "No data to analyze.";

  let report = "[BAG-WIDE DISPERSION]\n";
  
  // Find Gapping Issues
  const sortedByDist = [...clubStats].sort((a, b) => b.averages.carryDistance - a.averages.carryDistance);
  let gapsFound = false;
  
  for (let i = 0; i < sortedByDist.length - 1; i++) {
    const gap = sortedByDist[i].averages.carryDistance - sortedByDist[i+1].averages.carryDistance;
    if (gap < 6) {
      report += `- **Gapping Overlap**: Your **${sortedByDist[i].club}** and **${sortedByDist[i+1].club}** are too close (${gap.toFixed(1)}y). Consider removing one.\n`;
      gapsFound = true;
    } else if (gap > 18) {
      report += `- **Distance Hole**: There is a large ${gap.toFixed(1)}y gap between **${sortedByDist[i].club}** and **${sortedByDist[i+1].club}**.\n`;
      gapsFound = true;
    }
  }
  
  if (!gapsFound) report += "- **Bag Gapping is balanced**. You have consistent 10-12 yard steps between clubs.\n";

  // Macro Pattern
  const avgOffline = clubStats.reduce((acc, s) => acc + s.averages.offline, 0) / clubStats.length;
  if (Math.abs(avgOffline) > 5) {
    report += `- **Macro Pattern**: You have a session-wide **${avgOffline > 0 ? 'Push/Slice' : 'Pull/Hook'}** tendency. This is likely a setup or alignment issue.\n`;
  }

  report += "\n[STRATEGIC RECOMMENDATIONS]\n";
  const safest = [...clubStats].sort((a, b) => Math.abs(a.averages.offline) - Math.abs(b.averages.offline))[0];
  const riskiest = [...clubStats].sort((a, b) => Math.abs(b.averages.offline) - Math.abs(a.averages.offline))[0];

  report += `- **Safest Club**: Your **${safest.club}** is your most reliable 'fairway finder' (avg deviation: ${Math.abs(safest.averages.offline).toFixed(1)}y).\n`;
  report += `- **Highest Variance**: Your **${riskiest.club}** is currently the most volatile. Avoid using it on tight holes.\n`;
  report += `- **Tactical Focus**: Focus your next range session on **${riskiest.club}** face control.\n`;

  return report;
};
