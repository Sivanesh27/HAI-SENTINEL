# Machine Learning Target Definition
### Operationalizing Healthcare-Associated Infections (CDC/NHSN Criteria)

---

## 1. Clinical Definition and Inclusion Criteria

In clinical epidemiology, a **Hospital-Acquired Infection (HAI)** is defined by the Centers for Disease Control and Prevention (CDC) National Healthcare Safety Network (NHSN) as an infection that occurs **on or after Calendar Day 3 of admission** (where Day 1 is the day of hospital admission), corresponding to $\ge 48$ hours after hospital entry.

### Inclusion Criteria:
- Patient admitted to an Intensive Care Unit (ICU).
- Minimum ICU Length of Stay (LOS) $\ge 48$ hours.
- Age $\ge 18$ years.

### Exclusion Criteria:
- Documented infection present on admission (POA / Community-Acquired Infection within first 48 hours).
- Incomplete vitals / observation window $< 24$ hours.

---

## 2. Mathematical Target Formulation

Let an ICU stay for patient $i$ be represented as a multivariate time series $X_i(t)$ observed from $t = 0$ (ICU admission) to $t = T_i$ (discharge/event).

For any prediction timestamp $t \ge 24\text{h}$, the observation window spans $[t - 24\text{h}, t]$.

The prediction target $Y_i(t) \in \{0, 1\}$ over a forward prediction horizon $\Delta t = 24\text{h}$ is defined as:

$$Y_i(t) = \begin{cases} 1 & \text{if HAI event onset occurs within } (t, t + 24\text{h}] \\ 0 & \text{otherwise} \end{cases}$$

---

## 3. HAI Event Onset Definition ($t_{\text{onset}}$)

The HAI event timestamp $t_{\text{onset}} > 48\text{h}$ is defined as the timestamp of the earliest occurrence of all three conditions:
1. **Microbiological Evidence**: Positive blood, sputum, tracheal aspirate, urine, or wound culture, OR an explicit order for blood/sputum culture followed by positive isolation.
2. **Antimicrobial Initiation**: Commencement of a new broad-spectrum systemic antimicrobial course maintained for $\ge 4$ consecutive days (or until discharge/death).
3. **Physiological / Laboratory Derangement**:
   - Temperature $> 38.0^\circ\text{C}$ or $< 36.0^\circ\text{C}$, OR
   - White Blood Cell count (WBC) $> 12.0 \times 10^9/\text{L}$ or $< 4.0 \times 10^9/\text{L}$, OR
   - Sudden escalation in vasopressor support or oxygen requirement.

---

## 4. Prevention of Data & Target Leakage

To prevent optimistic bias:
- **Masking Horizon**: No clinical features (labs, vitals, microbiology results) timestamped after $t$ are accessible to the feature extractor at prediction time $t$.
- **Culture Reporting Latency**: Laboratory culture results take 24–72 hours to finalize; therefore, preliminary/unfinalized microbiology results are excluded from the pre-onset feature vector.
- **Split Strategy**: GroupKFold / temporal splitting grouped strictly by `patient_id` so no single patient's observations span both training and validation splits.
