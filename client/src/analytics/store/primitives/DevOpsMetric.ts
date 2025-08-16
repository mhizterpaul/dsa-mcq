export enum DevOpsMetricType {
  APP_STARTUP_TIME = "APP_STARTUP_TIME",      // Cold start & warm start timings
  HYDRATION_LATENCY = "HYDRATION_LATENCY",    // Time to fetch + prepare client data
  COMPONENT_RENDER_TIME = "COMPONENT_RENDER_TIME", // Time to render & commit UI
  NETWORK_CONDITION = "NETWORK_CONDITION",    // Latency, throughput, packet loss
  CRASH = "CRASH",                            // Uncaught exceptions
  ERROR = "ERROR"                             // Logged handled errors
}


export interface BaseMetricPayload {
  timestamp: number;
}


export interface AppStartupPayload extends BaseMetricPayload {
  timeToFirstPrintMs: number;
}

export interface LongRunningProcessPayload extends BaseMetricPayload {
  processName: string;
  durationMs: number;
  status: "running" | "completed" | "failed";
}

export interface NetworkConditionPayload extends BaseMetricPayload {
  latencyMs: number;
  throughputKbps: number;
  packetLossPercent: number;
}

export interface CrashPayload extends BaseMetricPayload {
  errorMessage: string;
  stackTrace: string;
  severity: "low" | "medium" | "high" | "critical";
}

export interface ErrorPayload extends BaseMetricPayload {
  errorCode: string;
  message: string;
  severity: "low" | "medium" | "high";
}

export type DevOpsMetricPayload =
  | SystemResourcePayload
  | AppStartupPayload
  | LongRunningProcessPayload
  | NetworkConditionPayload
  | CrashPayload
  | ErrorPayload;


export class DevOpsMetric {
  id: string;
  type: DevOpsMetricType;
  payload: DevOpsMetricPayload;

  constructor(type: DevOpsMetricType, payload: Omit<DevOpsMetricPayload, "timestamp">) {
    this.id = crypto.randomUUID();
    this.type = type;
    this.payload = { ...payload, timestamp: Date.now() } as DevOpsMetricPayload;
  }
}