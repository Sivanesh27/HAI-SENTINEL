# Machine Learning Methodology & Validation Report

---

## 1. Dataset Formulation & CDC/NHSN Target Operationalization

### 1.1 Synthetic ICU Cohort (`data/demo/`)
To enable fully reproducible, offline, and privacy-preserving evaluation without transmitting protected health information (PHI), the cohort is synthesized using physiological models aligned with MIMIC-IV clinical ranges:
- **Total ICU Patients**: 250
- **Total Longitudinal Hourly Records**: 21,189 observations
- **Overall HAI Prevalence**: 17.6% (patients developing CDC/NHSN-defined HAI after 48h)
- **Wards Represented**: ICU-A (Medical), ICU-B (Surgical), ICU-C (Cardiac), Ward-3 (Stepdown)

### 1.2 Target Definition ($Y_{\text{HAI}}$)
$$Y_i(t) = \begin{cases} 1 & \text{if CDC-defined HAI onset occurs within } (t, t + 24\text{h}] \\ 0 & \text{otherwise} \end{cases}$$
Where $t \ge 12\text{h}$ from admission, and $t_{\text{onset}} > 48\text{h}$ strictly following CDC/NHSN surveillance rules (positive culture + $\ge 4$ days new systemic antimicrobial therapy + systemic inflammatory response).

---

## 2. Temporal Feature Engineering (Causal & Leakage-Free)

All features at prediction timestamp $t$ are derived exclusively from backward-looking windows $[t - \tau, t]$ where $\tau \in \{12\text{h}, 24\text{h}\}$:

| Feature Name | Clinical Domain | Mathematical Formulation / Description |
| :--- | :--- | :--- |
| `age` | Demographics | Patient age in years at ICU admission |
| `gender_male` | Demographics | Binary indicator (1 = Male, 0 = Female) |
| `charlson_comorbidity_index` | Comorbidities | Charlson Comorbidity Index score (0 to 6) |
| `recent_surgery` | Surgical History | Binary flag for surgical procedure prior to admission |
| `hour_from_admission` | Stay Duration | Elapsed hours since ICU entry timestamp $t_0$ |
| `heart_rate_last` | Vital Signs | Instantaneous heart rate at timestamp $t$ |
| `heart_rate_mean_12h` | Vital Signs | $\mu_{\text{HR}} = \frac{1}{12} \sum_{k=0}^{11} \text{HR}_{t-k}$ |
| `heart_rate_slope_12h` | Vital Signs | Least-squares linear regression slope: $\frac{\sum (k - \bar{k})(\text{HR}_k - \bar{\text{HR}})}{\sum (k - \bar{k})^2}$ |
| `temp_c_last` | Vital Signs | Instantaneous body temperature ($^\circ\text{C}$) |
| `temp_c_max_12h` | Vital Signs | Peak temperature observed in last 12 hours |
| `temp_c_slope_12h` | Vital Signs | 12h temperature velocity ($^\circ\text{C}/\text{hour}$) |
| `resp_rate_mean_12h` | Vital Signs | 12h moving average respiratory rate |
| `spo2_min_12h` | Vital Signs | Nadir pulse oximetry oxygen saturation in last 12 hours |
| `map_mean_12h` | Vital Signs | 12h moving average Mean Arterial Pressure |
| `map_min_12h` | Vital Signs | Lowest MAP in last 12 hours |
| `wbc_last` | Laboratory | Current White Blood Cell count ($\times 10^9/\text{L}$) |
| `wbc_change_24h` | Laboratory | Absolute delta: $\text{WBC}_t - \text{WBC}_{t-24\text{h}}$ |
| `wbc_slope_24h` | Laboratory | 24h WBC upward trajectory slope |
| `platelets_last` | Laboratory | Current platelet count ($\times 10^9/\text{L}$) |
| `platelets_slope_24h` | Laboratory | 24h platelet consumption slope |
| `creatinine_last` | Laboratory | Serum creatinine (mg/dL) |
| `lactate_last` | Laboratory | Serum lactate (mmol/L) |
| `cvc_duration_hours` | Invasive Devices | Cumulative continuous Central Venous Catheter hours |
| `foley_duration_hours` | Invasive Devices | Cumulative Indwelling Urinary Catheter hours |
| `vent_duration_hours` | Invasive Devices | Cumulative Mechanical Ventilation hours |
| `total_device_burden` | Invasive Devices | Concurrent invasive device count ($0 \le N \le 3$) |
| `broad_spec_antibiotics_72h` | Medications | Binary exposure to broad-spectrum antibiotics in prior 72h |

---

## 3. Data Splitting & Leakage Prevention

```
+----------------------------------------------------------------------------------------------------+
|                                    GROUP-SHUFFLE SPLIT BY PATIENT                                  |
+----------------------------------------------------------------------------------------------------+
|  Total Patients: 250  -->  Train Cohort: 175 (70%)  |  Val Cohort: 37 (15%)  |  Test Cohort: 38 (15%) |
|                                                                                                    |
|  * GUARANTEE: Zero patient ID overlap between Train, Validation, and Test splits.                 |
|  * GUARANTEE: All time-series observations for Patient X exist in exactly one split.              |
+----------------------------------------------------------------------------------------------------+
```

---

## 4. Model Training, Calibration & Evaluation Results

All models were evaluated on the held-out patient test split ($N = 38$ unseen patients, 2,820 longitudinal test observations):

| Model Candidate | AUROC | AUPRC | F1-Score | Sens @ 85% Spec | Raw Brier | Calibrated Brier | ECE |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Logistic Regression (L2 Baseline)** | 0.9529 | 0.7123 | 0.7500 | 0.9048 | 0.0482 | 0.0265 | 0.0072 |
| **Random Forest Classifier** | 0.9723 | 0.8526 | 0.8196 | 0.9345 | 0.0298 | 0.0184 | 0.0069 |
| **XGBoost Classifier (Primary)** | **0.9799** | **0.8715** | **0.8563** | **0.9524** | 0.0241 | **0.0155** | **0.0057** |

### Key Findings:
1. **AUPRC Superiority**: While all models achieve $>0.95$ AUROC, XGBoost demonstrates superior Precision-Recall curve area (**0.8715** vs 0.7123 for Logistic Regression), minimizing false alarm fatigue in low-prevalence settings.
2. **Calibration Impact**: Isotonic regression reduced the XGBoost Brier score from $0.0241 \to 0.0155$ and Expected Calibration Error (ECE) to **0.0057**, ensuring that a predicted 80% risk reflects an empirical 80% event probability.

---

## 5. Local Explainability (Tree-SHAP)

For each patient inference, `HAISHAPExplainer` computes exact Shapley attributions:
$$f(x) = \phi_0 + \sum_{j=1}^M \phi_j(x)$$
Where $\phi_0$ is the baseline log-odds and $\phi_j(x)$ is feature $j$'s additive contribution to the prediction.

### Clinical vs. Statistical Attribution Guardrail:
> [!IMPORTANT]
> SHAP values represent statistical feature attributions within the trained gradient-boosted decision trees. They **do not prove causal physiological mechanisms**. For example, a high SHAP value for `cvc_duration_hours` indicates that elevated catheter dwell time increased the model's posterior probability estimate, but does not diagnose line sepsis in isolation.

---

## 6. Uncertainty & Missingness Confidence Scoring

Predictions are accompanied by an automated **Confidence Level**:
- **HIGH ($\ge 85\%$ feature completeness)**: $\pm 5\%$ uncertainty interval.
- **MODERATE ($65\% - 84\%$ completeness)**: $\pm 12\%$ uncertainty interval.
- **LOW ($< 65\%$ completeness)**: $\pm 25\%$ uncertainty interval with clinical warning flag.
