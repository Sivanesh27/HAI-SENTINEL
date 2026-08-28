export type RiskCategory = 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
export type ConfidenceLevel = 'LOW' | 'MODERATE' | 'HIGH';
export type ReviewPriority = 1 | 2 | 3;
export type UserRole = 'IPC_ADMIN' | 'CLINICIAN' | 'RESEARCHER' | 'VIEWER';

export interface HealthCheckResponse {
  status: string;
  app_name: string;
  version: string;
  environment: string;
  disclaimer: string;
}

export interface PatientListItem {
  patient_id: string;
  mrn: string;
  ward_id: string;
  ward_name: string;
  bed: string;
  age: number;
  gender: string;
  admission_time: string;
  icu_los_hours: number;
  current_risk: number;
  risk_category: RiskCategory;
  risk_velocity: number;
  risk_velocity_label: string;
  risk_delta_12h: number;
  risk_acceleration: number;
  rapid_escalation: boolean;
  review_priority: ReviewPriority;
  confidence_level: ConfidenceLevel;
  data_completeness_pct: number;
  primary_drivers: string[];
  last_update: string;
  is_demo_patient: boolean;
}

export interface PatientListResponse {
  total: number;
  offset: number;
  limit: number;
  patients: PatientListItem[];
}

export interface VitalSignSnapshot {
  heart_rate: number;
  temp_c: number;
  sbp: number;
  dbp: number;
  map: number;
  resp_rate: number;
  spo2: number;
  wbc: number;
  platelets: number;
  creatinine: number;
  lactate: number;
  cvc_duration_hours: number;
  foley_duration_hours: number;
  vent_duration_hours: number;
  total_device_burden: number;
  broad_spec_antibiotics_72h: number;
}

export interface PatientDetailResponse {
  patient_id: string;
  mrn: string;
  first_name: string;
  last_name: string;
  age: number;
  gender: string;
  charlson_comorbidity_index: number;
  recent_surgery: boolean;
  is_demo_patient: boolean;
  encounter: {
    encounter_id: string;
    ward_id: string;
    ward_name: string;
    bed: string;
    admission_time: string;
    status: string;
    primary_diagnosis: string;
  };
  current_prediction: {
    current_risk: number;
    risk_category: RiskCategory;
    risk_velocity: number;
    risk_velocity_label: string;
    rapid_escalation: boolean;
    review_priority: ReviewPriority;
    confidence_level: ConfidenceLevel;
    data_completeness_pct: number;
    last_update: string;
  };
  latest_vitals: VitalSignSnapshot;
}

export interface TrajectoryPoint {
  hour_from_admission: number;
  timestamp: string;
  risk_pct: number;
  risk_category: RiskCategory;
}

export interface SHAPDriver {
  feature_name: string;
  display_name: string;
  category: string;
  feature_value: number;
  shap_value: number;
  contribution_direction: 'ELEVATES_RISK' | 'REDUCES_RISK';
  abs_importance: number;
}

export interface SHAPExplanation {
  base_value: number;
  top_positive_drivers: SHAPDriver[];
  top_negative_drivers: SHAPDriver[];
  all_attributions: SHAPDriver[];
  disclaimer: string;
}

export interface PatientRiskTrajectoryResponse {
  patient_id: string;
  current_risk: number;
  risk_category: RiskCategory;
  confidence: ConfidenceLevel;
  data_completeness_pct: number;
  risk_delta_6h: number;
  risk_delta_12h: number;
  risk_delta_24h: number;
  risk_velocity: number;
  risk_velocity_label: string;
  risk_acceleration: number;
  rapid_escalation: boolean;
  review_priority: ReviewPriority;
  trajectory_summary: string;
  trajectory: TrajectoryPoint[];
  timestamp: string;
  model_version: string;
  top_features: SHAPExplanation | null;
  scientific_disclaimer: string;
}

export interface WardSummary {
  ward_id: string;
  ward_name: string;
  unit_type: string;
  bed_count: number;
  occupied_beds: number;
  occupancy_rate_pct: number;
  average_risk: number;
  median_risk: number;
  risk_density: number;
  high_risk_count: number;
  critical_risk_count: number;
  rapidly_rising_count: number;
  ward_risk_level: 'LOW' | 'MODERATE' | 'HIGH';
  cluster_signal: boolean;
  cluster_message: string;
  review_recommendation: string;
  contributing_patients: Array<{
    patient_id: string;
    bed: string;
    current_risk: number;
    risk_velocity_label: string;
    rapid_escalation: boolean;
    review_priority: ReviewPriority;
  }>;
  scientific_disclaimer: string;
}

export interface BedSlot {
  bed: string;
  occupied: boolean;
  patient_id: string | null;
  current_risk: number;
  risk_category: RiskCategory | 'EMPTY';
  risk_velocity_label: string;
  rapid_escalation: boolean;
  review_priority: ReviewPriority | null;
}

export interface WardDetail extends WardSummary {
  bed_layout: BedSlot[];
  patient_roster: PatientListItem[];
}

export interface ClusterAlert {
  ward_id: string;
  ward_name: string;
  unit_type: string;
  ward_risk_level: 'LOW' | 'MODERATE' | 'HIGH';
  high_risk_count: number;
  critical_risk_count: number;
  rapidly_rising_count: number;
  risk_density: number;
  cluster_signal: boolean;
  cluster_message: string;
  review_recommendation: string;
  contributing_patients: Array<{
    patient_id: string;
    bed: string;
    current_risk: number;
    risk_velocity_label: string;
    rapid_escalation: boolean;
    review_priority: ReviewPriority;
  }>;
  timestamp: string;
  scientific_disclaimer: string;
}

export interface DashboardResponse {
  kpis: {
    total_monitored_patients: number;
    critical_risk_count: number;
    high_risk_count: number;
    moderate_risk_count: number;
    low_risk_count: number;
    rapidly_rising_count: number;
    priority_1_reviews: number;
    elevated_wards_count: number;
    active_clusters_count: number;
  };
  risk_distribution: Array<{ tier: string; count: number; color: string }>;
  wards_overview: WardSummary[];
  recent_escalations: PatientListItem[];
  timestamp: string;
  scientific_disclaimer: string;
}

export interface DataQualityResponse {
  overall_completeness_pct: number;
  vitals_completeness_pct: number;
  laboratory_completeness_pct: number;
  device_tracking_completeness_pct: number;
  total_monitored_patients: number;
  total_hourly_observations: number;
  telemetry_stream_status: string;
  data_freshness_seconds: number;
  missingness_penalty_active: boolean;
  disclaimer: string;
}

export interface ModelPerformanceResponse {
  metadata: {
    model_id: string;
    primary_model: string;
    version: string;
    training_date: string;
    dataset_name: string;
    features: string[];
    n_features: number;
    split_summary: {
      train_patients: number;
      val_patients: number;
      test_patients: number;
      train_samples: number;
      val_samples: number;
      test_samples: number;
    };
  };
  metrics: {
    auroc: number;
    auprc: number;
    precision: number;
    recall: number;
    f1: number;
    sensitivity: number;
    specificity: number;
    sens_at_85_spec: number;
    brier_score: number;
    operating_threshold: number;
    confusion_matrix: {
      true_negative: number;
      false_positive: number;
      false_negative: number;
      true_positive: number;
    };
  };
  calibration: {
    expected_calibration_error: number;
    prob_true: number[];
    prob_pred: number[];
    bins: Array<{
      bin_index: number;
      confidence_mean: number;
      accuracy_empirical: number;
      count: number;
    }>;
  };
  roc_curve: Array<{ fpr: number; tpr: number; threshold: number }>;
  pr_curve: Array<{ recall: number; precision: number }>;
  confusion_matrix: {
    true_negative: number;
    false_positive: number;
    false_negative: number;
    true_positive: number;
  };
}

export interface ModelComparisonItem {
  model_name: string;
  auroc: number;
  auprc: number;
  f1_score: number;
  sensitivity: number;
  specificity: number;
  sens_at_85_spec: number;
  brier_score_raw: number;
  brier_score_calibrated: number;
  expected_calibration_error: number;
  is_primary: boolean;
}

export interface ScenarioSimulationResult {
  patient_id: string;
  baseline_risk_pct: number;
  simulated_risk_pct: number;
  delta_risk_pct: number;
  baseline_category: RiskCategory;
  simulated_category: RiskCategory;
  simulated_explanation: SHAPExplanation;
  scientific_disclaimer: string;
}

export interface AuditLogItem {
  id: number;
  timestamp: string;
  user_id: string;
  user_role: string;
  action: string;
  patient_id: string | null;
  model_version: string;
  details: Record<string, any>;
}

export interface LiveTelemetryItem {
  patient_id: string;
  patient_name: string;
  mrn: string;
  bed: string;
  ward_id: string;
  current_risk: number;
  risk_velocity: number;
  rapid_escalation: boolean;
  risk_category: RiskCategory;
  review_priority: ReviewPriority;
  last_pulse: string;
}

export interface LiveTelemetryFeedResponse {
  timestamp: string;
  active_stream_beds: number;
  hospital_status: string;
  live_telemetry: LiveTelemetryItem[];
}

export interface LiveTriageRequest {
  age: number;
  gender: string;
  charlson_index: number;
  temp_c: number;
  heart_rate: number;
  resp_rate: number;
  map: number;
  spo2: number;
  wbc: number;
  lactate: number;
  platelets: number;
  cvc_dwell_hours: number;
  foley_dwell_hours: number;
  vent_dwell_hours: number;
}

export interface LiveTriageResponse {
  calibrated_risk_pct: number;
  risk_category: RiskCategory;
  clinical_review_priority: string;
  confidence_level: ConfidenceLevel;
  data_completeness_pct: number;
  uncertainty_margin: number;
  expected_calibration_error: number;
  brier_score: number;
  top_positive_drivers: Array<{ feature_name: string; contribution_value: number; display_name: string; clinical_category: string }>;
  top_negative_drivers: Array<{ feature_name: string; contribution_value: number; display_name: string; clinical_category: string }>;
  inference_latency_ms: number;
  non_causal_notice: string;
}
