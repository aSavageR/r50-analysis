
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
  angleAttack: number;
  offline: number; // Carry Deviation
  totalOffline: number; // Total Deviation
  sessionId: string;
  clubPath: number;
  clubFace: number;
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
  smashFactor: number;
  carryDistance: number;
  totalDistance: number;
  launchAngle: number;
  launchDirection: number;
  spinRate: number;
  backSpin: number;
  sideSpin: number;
  sideSpin_dir?: string; // Optional helpers if needed
  spinAxis: number;
  apex: number;
  angleAttack: number;
  offline: number;
  totalOffline: number;
  clubPath: number;
  clubFace: number;
}

export interface SessionSummary {
  id: string;
  date: string;
  shotCount: number;
  avgCarry: number;
}
