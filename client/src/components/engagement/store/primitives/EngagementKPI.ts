export enum EngagementKPIType {
  TOTAL_HOURS_SPENT = "TOTAL_HOURS_SPENT",
  XP_GROWTH_RATE_WEEKLY = "XP_GROWTH_RATE_WEEKLY",
  STAGNANT_CATEGORY = "STAGNANT_CATEGORY",
  SESSIONS_FROM_NOTIFICATIONS = "SESSIONS_FROM_NOTIFICATIONS",
  POOREST_PERFORMING_CATEGORY = "POOREST_PERFORMING_CATEGORY"
}

export interface BaseKpiPayload {
  timestamp: number;
}

export interface TotalHoursSpentPayload extends BaseKpiPayload {
  hours: number; // total hours
}

export interface XpGrowthRatePayload extends BaseKpiPayload {
  xpPerWeek: number; // XP gained this week
}

export interface StagnantCategoryPayload extends BaseKpiPayload {
  categoryId: string;
  weeksPractised: number;
  avgHoursPerWeek: number;
}

export interface SessionsFromNotificationsPayload extends BaseKpiPayload {
  sessionCount: number;
}

export interface PoorestPerformingCategoryPayload extends BaseKpiPayload {
  categoryId: string;
  accuracyPercent: number;
}

export type EngagementKpiPayload =
  | TotalHoursSpentPayload
  | XpGrowthRatePayload
  | StagnantCategoryPayload
  | SessionsFromNotificationsPayload
  | PoorestPerformingCategoryPayload;

export class EngagementKPI {
  id: string;
  type: EngagementKPIType;
  payload: EngagementKpiPayload;

  constructor(type: EngagementKPIType, payload: Omit<EngagementKpiPayload, "timestamp">) {
    this.id = crypto.randomUUID();
    this.type = type;
    this.payload = { ...payload, timestamp: Date.now() } as EngagementKpiPayload;
  }
}
