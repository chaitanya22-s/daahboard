export type PageId = 'overview' | 'threat-map' | 'raw-logs' | 'analytics' | 'system-health';

export type AlertSeverity = 'critical' | 'high' | 'medium' | 'low';
export type AlertStatus = 'Critical' | 'Mitigating' | 'Blocked' | 'Investigating' | 'Mitigated';

export interface ThreatAlert {
  id: string;
  attackType: string;
  target: string;
  targetIp: string;
  sourceIp: string;
  sourceCountry: string;
  sourceGeo: [number, number]; // [lat, lng]
  status: AlertStatus;
  severity: AlertSeverity;
  timestamp: string;
  confidence: number;
  description: string;
  mitreId: string;
  mitreTactic: string;
  payloadSample?: string;
  impactScore: number;
}

export interface SiemLog {
  id: string;
  timestamp: string;
  sourceIp: string;
  destIp: string;
  protocol: 'TCP' | 'UDP' | 'ICMP' | 'HTTP/2' | 'DNS';
  port: number;
  size: string;
  attackType: string;
  confidence: number;
  status: 'Blocked' | 'Flagged' | 'Quarantined' | 'Dropped' | 'Allowed';
  severity: AlertSeverity;
  rawPayload?: string;
  countryCode: string;
}

export interface DefenseNode {
  id: string;
  name: string;
  ipRange: string;
  type: 'Firewall' | 'IDS/IPS' | 'WAF' | 'SIEM Broker' | 'Honeypot' | 'EDR Fleet';
  status: 'Healthy' | 'Under Load' | 'Degraded' | 'Offline';
  cpuUsage: number;
  memoryUsage: number;
  networkThroughput: string;
  packetLoss: string;
  activeRules: number;
  lastUpdate: string;
}

export interface AttackArc {
  id: string;
  sourceCoords: [number, number]; // [lng, lat]
  targetCoords: [number, number]; // [lng, lat]
  sourceCountry: string;
  targetNode: string;
  attackType: string;
  severity: AlertSeverity;
  progress: number;
  active: boolean;
}

export interface MitreTechnique {
  id: string;
  name: string;
  tactic: string;
  detections: number;
  severity: AlertSeverity;
  description: string;
}

export type DefconLevel = 1 | 2 | 3 | 4;
