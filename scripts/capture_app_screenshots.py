import os
import subprocess
import time

CHROME_PATH = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
OUTPUT_DIR = r"D:\Omnikon Project\docs\screenshots"
os.makedirs(OUTPUT_DIR, exist_ok=True)

PAGES = [
    ("01_dashboard.png", "http://127.0.0.1:5173/"),
    ("02_demo_mode.png", "http://127.0.0.1:5173/demo"),
    ("03_patient_trajectory.png", "http://127.0.0.1:5173/patients/DEMO-1042"),
    ("04_ward_intelligence.png", "http://127.0.0.1:5173/wards"),
    ("05_cluster_radar.png", "http://127.0.0.1:5173/clusters"),
    ("06_model_performance.png", "http://127.0.0.1:5173/models"),
    ("07_scenario_simulator.png", "http://127.0.0.1:5173/scenario"),
    ("08_audit_trail.png", "http://127.0.0.1:5173/audit"),
]


def capture_screenshots():
    print("Capturing live high-resolution application screenshots...")
    for filename, url in PAGES:
        out_path = os.path.join(OUTPUT_DIR, filename)
        cmd = [
            CHROME_PATH,
            "--headless=new",
            "--disable-gpu",
            "--window-size=1600,1000",
            "--virtual-time-budget=4000",
            f"--screenshot={out_path}",
            url
        ]
        try:
            res = subprocess.run(cmd, capture_output=True, text=True, timeout=15)
            if os.path.exists(out_path) and os.path.getsize(out_path) > 1000:
                print(f"Captured {filename}: {os.path.getsize(out_path)} bytes")
            else:
                print(f"Failed {filename}: {res.stderr}")
        except Exception as e:
            print(f"Error capturing {filename}: {e}")


if __name__ == "__main__":
    capture_screenshots()
