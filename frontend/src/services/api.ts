import {
  HealthCheckResponse,
  PatientListResponse,
  PatientDetailResponse,
  PatientRiskTrajectoryResponse,
  WardSummary,
  WardDetail,
  ClusterAlert,
  DashboardResponse,
  DataQualityResponse,
  ModelPerformanceResponse,
  ModelComparisonItem,
  ScenarioSimulationResult,
  AuditLogItem
} from '../types';

const API_BASE = '/api';

export async function fetchHealth(): Promise<HealthCheckResponse> {
  const res = await fetch(`${API_BASE}/health`);
  if (!res.ok) throw new Error(`Health check failed: ${res.statusText}`);
  return res.json();
}

export async function fetchDashboard(): Promise<DashboardResponse> {
  const res = await fetch(`${API_BASE}/dashboard`);
  if (!res.ok) throw new Error(`Failed to fetch dashboard: ${res.statusText}`);
  return res.json();
}

export async function fetchDataQuality(): Promise<DataQualityResponse> {
  const res = await fetch(`${API_BASE}/data-quality`);
  if (!res.ok) throw new Error(`Failed to fetch data quality: ${res.statusText}`);
  return res.json();
}

export async function fetchPatients(params?: {
  ward?: string;
  risk_level?: string;
  rapid_escalation?: boolean;
  review_priority?: number;
  limit?: number;
  offset?: number;
}): Promise<PatientListResponse> {
  const query = new URLSearchParams();
  if (params?.ward) query.append('ward', params.ward);
  if (params?.risk_level) query.append('risk_level', params.risk_level);
  if (params?.rapid_escalation !== undefined) query.append('rapid_escalation', String(params.rapid_escalation));
  if (params?.review_priority !== undefined) query.append('review_priority', String(params.review_priority));
  if (params?.limit) query.append('limit', String(params.limit));
  if (params?.offset) query.append('offset', String(params.offset));

  const res = await fetch(`${API_BASE}/patients?${query.toString()}`);
  if (!res.ok) throw new Error(`Failed to fetch patients: ${res.statusText}`);
  return res.json();
}

export async function fetchPatientDetail(patientId: string): Promise<PatientDetailResponse> {
  const res = await fetch(`${API_BASE}/patients/${encodeURIComponent(patientId)}`);
  if (!res.ok) throw new Error(`Failed to fetch patient ${patientId}: ${res.statusText}`);
  return res.json();
}

export async function fetchPatientRiskTrajectory(patientId: string): Promise<PatientRiskTrajectoryResponse> {
  const res = await fetch(`${API_BASE}/patients/${encodeURIComponent(patientId)}/risk`);
  if (!res.ok) throw new Error(`Failed to fetch risk trajectory for ${patientId}: ${res.statusText}`);
  return res.json();
}

export async function fetchWards(): Promise<WardSummary[]> {
  const res = await fetch(`${API_BASE}/wards`);
  if (!res.ok) throw new Error(`Failed to fetch wards: ${res.statusText}`);
  return res.json();
}

export async function fetchWardDetail(wardId: string): Promise<WardDetail> {
  const res = await fetch(`${API_BASE}/wards/${encodeURIComponent(wardId)}`);
  if (!res.ok) throw new Error(`Failed to fetch ward ${wardId}: ${res.statusText}`);
  return res.json();
}

export async function fetchClusters(): Promise<ClusterAlert[]> {
  const res = await fetch(`${API_BASE}/clusters`);
  if (!res.ok) throw new Error(`Failed to fetch active clusters: ${res.statusText}`);
  return res.json();
}

export async function fetchModelPerformance(): Promise<ModelPerformanceResponse> {
  const res = await fetch(`${API_BASE}/model/performance`);
  if (!res.ok) throw new Error(`Failed to fetch model performance: ${res.statusText}`);
  return res.json();
}

export async function fetchModelComparison(): Promise<ModelComparisonItem[]> {
  const res = await fetch(`${API_BASE}/model/comparison`);
  if (!res.ok) throw new Error(`Failed to fetch model comparison: ${res.statusText}`);
  return res.json();
}

export async function simulateScenario(payload: {
  patient_id: string;
  base_features: Record<string, any>;
  perturbed_features: Record<string, any>;
}): Promise<ScenarioSimulationResult> {
  const res = await fetch(`${API_BASE}/model/scenario`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error(`Failed to simulate scenario: ${res.statusText}`);
  return res.json();
}

export async function fetchAuditLogs(limit: number = 50): Promise<{ total: number; logs: AuditLogItem[] }> {
  const res = await fetch(`${API_BASE}/audit?limit=${limit}`);
  if (!res.ok) throw new Error(`Failed to fetch audit logs: ${res.statusText}`);
  return res.json();
}

export async function createAuditLog(entry: {
  user_id: string;
  user_role: string;
  action: string;
  patient_id?: string;
  details?: Record<string, any>;
}): Promise<{ status: string; log_id: number }> {
  const res = await fetch(`${API_BASE}/audit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(entry)
  });
  if (!res.ok) throw new Error(`Failed to record audit log: ${res.statusText}`);
  return res.json();
}

export async function fetchLiveTelemetryFeed(): Promise<import('../types').LiveTelemetryFeedResponse> {
  const res = await fetch(`${API_BASE}/telemetry/live-feed`);
  if (!res.ok) throw new Error(`Failed to fetch live telemetry feed: ${res.statusText}`);
  return res.json();
}

export async function calculateLiveTriage(payload: import('../types').LiveTriageRequest): Promise<import('../types').LiveTriageResponse> {
  const res = await fetch(`${API_BASE}/telemetry/triage-calculator`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error(`Failed to compute live triage: ${res.statusText}`);
  return res.json();
}

export async function ingestLiveTelemetry(payload: Record<string, any>): Promise<any> {
  const res = await fetch(`${API_BASE}/telemetry/ingest`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error(`Failed to ingest live telemetry: ${res.statusText}`);
  return res.json();
}
