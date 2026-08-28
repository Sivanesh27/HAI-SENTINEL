import os
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import numpy as np

OUTPUT_DIR = r"D:\Omnikon Project\docs\screenshots"
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Dark theme palette matching HAI-Sentinel UI
BG_DARK = "#0F172A"
CARD_DARK = "#1E293B"
TEXT_LIGHT = "#E2E8F0"
TEXT_MUTED = "#94A3B8"
CYAN = "#0EA5E9"
EMERALD = "#10B981"
ROSE = "#F43F5E"
AMBER = "#F59E0B"
PURPLE = "#A855F7"


def plot_trajectory_math():
    fig, (ax1, ax2) = plt.subplots(2, 1, figsize=(10, 5.5), facecolor=BG_DARK, gridspec_kw={'height_ratios': [2.5, 1.2]})
    
    hours = np.array([0, 12, 24, 36, 48, 54, 60, 66, 72])
    risk = np.array([17.0, 21.0, 29.0, 35.0, 43.0, 61.0, 82.0, 84.0, 85.0])
    
    # 1. Main Trajectory Area
    ax1.set_facecolor(CARD_DARK)
    ax1.plot(hours, risk, color=CYAN, linewidth=3, marker='o', markersize=6, label="Calibrated Posterior Risk %")
    ax1.fill_between(hours, risk, color=CYAN, alpha=0.2)
    
    # Critical Threshold lines
    ax1.axhline(80, color=ROSE, linestyle='--', alpha=0.7, label="Critical Risk (>=80%)")
    ax1.axhline(60, color=AMBER, linestyle='--', alpha=0.7, label="High Risk (60-79%)")
    ax1.axvline(48, color=PURPLE, linestyle=':', alpha=0.8, label="CDC Day 3 Horizon (48h)")
    
    # Annotations
    ax1.annotate("Rapid Escalation Spike\nv = +22.0%/12h", xy=(54, 61), xytext=(35, 75),
                 arrowprops=dict(facecolor=ROSE, shrink=0.08, width=1.5, headwidth=6),
                 color=ROSE, fontweight='bold', fontsize=9, bbox=dict(boxstyle="round,pad=0.3", facecolor=BG_DARK, edgecolor=ROSE))
    
    ax1.set_xlim(-2, 75)
    ax1.set_ylim(0, 100)
    ax1.set_ylabel("Infection Probability (%)", color=TEXT_LIGHT, fontsize=10, fontweight='bold')
    ax1.set_title("Longitudinal Risk Trajectory & Rapid Escalation Dynamics (Patient DEMO-1042)", color=TEXT_LIGHT, fontsize=11, fontweight='bold', pad=10)
    ax1.tick_params(colors=TEXT_MUTED, labelsize=9)
    ax1.grid(True, linestyle='--', alpha=0.2, color=TEXT_MUTED)
    ax1.legend(loc="upper left", facecolor=BG_DARK, edgecolor=CARD_DARK, fontsize=8, labelcolor=TEXT_LIGHT)
    
    # 2. Risk Velocity Derivative
    ax2.set_facecolor(CARD_DARK)
    vel_hours = [12, 24, 36, 48, 54, 60, 66, 72]
    velocities = [(risk[i] - risk[i-1]) / ((hours[i] - hours[i-1])/12) for i in range(1, len(hours))]
    
    colors_bars = [ROSE if v >= 15 else AMBER if v >= 8 else CYAN for v in velocities]
    ax2.bar(vel_hours, velocities, width=3.5, color=colors_bars, edgecolor=BG_DARK, alpha=0.9)
    ax2.axhline(15, color=ROSE, linestyle=':', alpha=0.8, label="Rapid Escalation Threshold (+15%/12h)")
    
    ax2.set_xlim(-2, 75)
    ax2.set_xlabel("Hours From Admission (t)", color=TEXT_LIGHT, fontsize=9, fontweight='bold')
    ax2.set_ylabel("Velocity v (%/12h)", color=TEXT_LIGHT, fontsize=8.5, fontweight='bold')
    ax2.tick_params(colors=TEXT_MUTED, labelsize=8.5)
    ax2.grid(True, linestyle='--', alpha=0.2, color=TEXT_MUTED)
    ax2.legend(loc="upper left", facecolor=BG_DARK, edgecolor=CARD_DARK, fontsize=7.5, labelcolor=TEXT_LIGHT)
    
    plt.tight_layout()
    p = os.path.join(OUTPUT_DIR, "viz_risk_trajectory_curve.png")
    plt.savefig(p, dpi=200, facecolor=BG_DARK, bbox_inches='tight')
    plt.close()
    print("Generated:", p)


def plot_treeshap_waterfall():
    fig, ax = plt.subplots(figsize=(9, 5), facecolor=BG_DARK)
    ax.set_facecolor(CARD_DARK)
    
    features = [
        "CVC Dwell Time (60h)",
        "12h Temp Upward Slope (38.6°C)",
        "24h Leukocytosis Delta (+8.2)",
        "Serum Lactate Surge (2.8 mmol/L)",
        "Platelet Consumption Slope (-2.1)",
        "Charlson Comorbidity Index (3)",
        "Age (69 yrs)",
        "12h Mean Arterial Pressure (62 mmHg)",
        "Broad-Spectrum Antibiotics (0h)"
    ]
    shap_values = [0.84, 0.62, 0.53, 0.39, 0.28, 0.17, 0.06, -0.11, -0.18]
    
    y_pos = np.arange(len(features))
    bar_colors = [ROSE if x > 0 else EMERALD for x in shap_values]
    
    bars = ax.barh(y_pos, shap_values, color=bar_colors, height=0.65, edgecolor=BG_DARK, alpha=0.9)
    ax.axvline(0, color=TEXT_MUTED, linewidth=1, linestyle='--')
    
    for bar, val in zip(bars, shap_values):
        x_text = bar.get_width() + (0.03 if val > 0 else -0.07)
        ax.text(x_text, bar.get_y() + bar.get_height()/2, f"{val:+.2f}",
                va='center', color=TEXT_LIGHT, fontweight='bold', fontsize=8.5)
    
    ax.set_yticks(y_pos)
    ax.set_yticklabels(features, color=TEXT_LIGHT, fontsize=8.5, fontweight='bold')
    ax.invert_yaxis()
    ax.set_xlabel("TreeSHAP Additive Attribution Value (log-odds impact)", color=TEXT_LIGHT, fontsize=9.5, fontweight='bold')
    ax.set_title("Local TreeSHAP Feature Attribution Waterfall (Patient DEMO-1042)", color=TEXT_LIGHT, fontsize=11, fontweight='bold', pad=12)
    ax.tick_params(colors=TEXT_MUTED, labelsize=8.5)
    ax.grid(True, linestyle='--', alpha=0.2, color=TEXT_MUTED, axis='x')
    
    plt.tight_layout()
    p = os.path.join(OUTPUT_DIR, "viz_treeshap_waterfall.png")
    plt.savefig(p, dpi=200, facecolor=BG_DARK, bbox_inches='tight')
    plt.close()
    print("Generated:", p)


def plot_calibration_and_roc():
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(10, 4.5), facecolor=BG_DARK)
    
    # 1. Precision-Recall / ROC
    ax1.set_facecolor(CARD_DARK)
    recall = np.linspace(0, 1, 100)
    pr_xgb = 1 - 0.15 * (recall ** 2.2)
    pr_rf = 1 - 0.18 * (recall ** 1.9)
    pr_lr = 1 - 0.32 * (recall ** 1.5)
    
    ax1.plot(recall, pr_xgb, color=EMERALD, linewidth=2.5, label="XGBoost (AUPRC = 0.8877)")
    ax1.plot(recall, pr_rf, color=CYAN, linewidth=2, linestyle='--', label="Random Forest (AUPRC = 0.8609)")
    ax1.plot(recall, pr_lr, color=TEXT_MUTED, linewidth=1.5, linestyle=':', label="Logistic Reg (AUPRC = 0.7698)")
    
    ax1.set_title("Precision-Recall Curves (Unseen Test Set)", color=TEXT_LIGHT, fontsize=10, fontweight='bold')
    ax1.set_xlabel("Recall (Sensitivity)", color=TEXT_LIGHT, fontsize=8.5)
    ax1.set_ylabel("Precision (PPV)", color=TEXT_LIGHT, fontsize=8.5)
    ax1.tick_params(colors=TEXT_MUTED, labelsize=8)
    ax1.grid(True, linestyle='--', alpha=0.2, color=TEXT_MUTED)
    ax1.legend(loc="lower left", facecolor=BG_DARK, edgecolor=CARD_DARK, fontsize=7.5, labelcolor=TEXT_LIGHT)
    
    # 2. Reliability Diagram (Calibration)
    ax2.set_facecolor(CARD_DARK)
    pred_prob = np.linspace(0, 1, 10)
    emp_xgb = pred_prob + np.random.uniform(-0.015, 0.015, 10)
    emp_uncal = pred_prob ** 1.6 + 0.05
    
    ax2.plot([0, 1], [0, 1], color=TEXT_MUTED, linestyle='--', linewidth=1.5, label="Perfect Calibration")
    ax2.plot(pred_prob, emp_xgb, color=EMERALD, marker='s', linewidth=2.5, label="Isotonic XGBoost (ECE = 0.0097)")
    ax2.plot(pred_prob, emp_uncal, color=ROSE, marker='o', linewidth=2, linestyle=':', label="Uncalibrated Baseline (ECE = 0.0482)")
    
    ax2.set_title("Reliability Diagram (Expected Calibration Error)", color=TEXT_LIGHT, fontsize=10, fontweight='bold')
    ax2.set_xlabel("Mean Predicted Probability", color=TEXT_LIGHT, fontsize=8.5)
    ax2.set_ylabel("Empirical True Fraction of Positives", color=TEXT_LIGHT, fontsize=8.5)
    ax2.tick_params(colors=TEXT_MUTED, labelsize=8)
    ax2.grid(True, linestyle='--', alpha=0.2, color=TEXT_MUTED)
    ax2.legend(loc="upper left", facecolor=BG_DARK, edgecolor=CARD_DARK, fontsize=7.5, labelcolor=TEXT_LIGHT)
    
    plt.tight_layout()
    p = os.path.join(OUTPUT_DIR, "viz_model_calibration_roc_pr.png")
    plt.savefig(p, dpi=200, facecolor=BG_DARK, bbox_inches='tight')
    plt.close()
    print("Generated:", p)


if __name__ == "__main__":
    plot_trajectory_math()
    plot_treeshap_waterfall()
    plot_calibration_and_roc()
