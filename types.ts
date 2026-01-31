
export interface Shot {
  id: string;
  timestamp: string;
  club: string;
  ballSpeed: number;
  clubSpeed: number;
  smashFactor: number;
  carryDistance: number;
  totalDistance: number;
  launchAngle: number;
  launchDirection: number;
  spinRate: number;
  backSpin: number;
  sideSpin: number;
  spinAxis: number;
  apex: number;
  descentAngle: number;
  offline: number; // Carry Deviation
  totalOffline: number; // Total Deviation
  sessionId: string;
}

export interface ClubStats {
  club: string;
  count: number;
  averages: ShotStats;
  highs: ShotStats;
  lows: ShotStats;
  color: string;
  shots: Shot[]; // Added raw shots for drilldown
}

export interface ShotStats {
  ballSpeed: number;
  clubSpeed: number;
  carryDistance: number;
  totalDistance: number;
  launchAngle: number;
  spinRate: number;
  backSpin: number;
  sideSpin: number;
  spinAxis: number;
  apex: number;
  descentAngle: number;
  offline: number;
  totalOffline: number;
}

export interface SessionSummary {
  id: string;
  date: string;
  shotCount: number;
  avgCarry: number;
}
