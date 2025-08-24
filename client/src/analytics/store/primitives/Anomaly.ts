export enum AnomalyType {
  AUTHENTICITY = "AUTHENTICITY",           // App signature mismatch, tampering
  SECURITY_BREACH = "SECURITY_BREACH",     // Auth bypass, privilege escalation
  RESOURCE_DEFICIENCY = "RESOURCE_DEFICIENCY", // Low memory, overheating, battery drain
  API_ABNORMALITY = "API_ABNORMALITY",     // Abnormal request patterns
  GAMEPLAY_FRAUD = "GAMEPLAY_FRAUD"        // Unrealistic high score in short time
}

export enum AnomalySeverity {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  CRITICAL = "CRITICAL"
}

export interface AnomalyEvidence {
  message: string;      // Human-readable description
  details?: any;        // Additional structured info (stack trace, payload, etc.)
}

export class Anomaly {
  id: string;
  metricId?: string; // optional if anomaly not tied to a single metric
  type: AnomalyType;
  severity: AnomalySeverity;
  timestamp: number; // Serves as createdAt
  updatedAt: number;
  deviation?: number;   // statistical deviation, optional
  evidence: AnomalyEvidence[];

  constructor(params: {
    id?: string;
    metricId?: string;
    type: AnomalyType;
    severity: AnomalySeverity;
    deviation?: number;
    evidence: AnomalyEvidence[];
  }) {
    this.id = params.id ?? crypto.randomUUID();
    this.metricId = params.metricId;
    this.type = params.type;
    this.severity = params.severity;
    this.timestamp = Date.now();
    this.updatedAt = Date.now();
    this.deviation = params.deviation;
    this.evidence = params.evidence;
  }
}


