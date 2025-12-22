# Machine Learning Bootcamp Prediction System

Research-grade machine learning system built for Thesis Deployment. This application integrates a Next.js frontend with an advanced Python backend to predict bootcamp candidate success using the **AdaBoost (App Champion)** model.

## key Features

### 1. Training Lab (Research Mode)
- **Advanced Pipeline**: Full scikit-learn pipeline with SMOTE Oversampling.
- **Algorithm Comparison**: Side-by-side performance metrics for 6 algorithms (Logistic Regression, Decision Tree, KNN, SVM, AdaBoost, XGBoost).
- **Statistical Testing**: McNemar Test integration to prove significance.
- **Visualizations**: ROC Curves, Confusion Matrices, and Feature Importance (SHAP).
- **Export**: JSON/CSV reports for academic analysis.

### 2. Prediction System (Deployment Mode)
- **Champion Model**: Automatically utilizes the **AdaBoost Classifier** (identified as best performer in Chapter 4).
- **Decision Support System (DSS)**:
  - **< 20% Probability**: Low Tier -> "Disarankan Program Persiapan (Pre-Bootcamp)".
  - **20% - 60% Probability**: Middle Tier -> "Perlu Review Manual / Wawancara Standar".
  - **> 60% Probability**: High Tier -> "Direkomendasikan Fast-Track".
- **Batch Processing**: Upload new candidate CSVs for bulk feasibility analysis.
- **Fail-Safe**: Explains feature engineering logic (e.g. IT vs Non-IT normalization).

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, Shadcn/UI.
- **Backend API**: Next.js Route Handlers + Python Child Processes.
- **ML Engine**: Python 3.10+, Scikit-learn, Imbalanced-learn, XGBoost, Joblib.

## Project Structure

```
.
├── app/
│   ├── api/train/          # Triggers run_advanced_trainer.py
│   ├── api/predict/        # Triggers run_predictor.py
│   ├── page.tsx            # Training Mode UI
│   └── prediction/         # Prediction Mode UI (Deployment Prototype)
├── scripts/
│   ├── advanced_ml_trainer.py  # MAIN CLASS: Pipeline logic, Training, Evaluation
│   ├── run_advanced_trainer.py # ENTRY POINT: Training Mode CLI Wrapper
│   └── run_predictor.py        # ENTRY POINT: Prediction Mode CLI Wrapper
├── saved_models/           # Stores trained .joblib artifacts
├── dataset/                # Dataset examples
└── Thesis_Materials/       # Chapter documents (Markdown)
```

## Setup & Installation

### 1. Install Node.js Dependencies
```bash
pnpm install
```

### 2. Setup Python Environment (Vital)
The backend requires a specific python environment.
```bash
python3 -m venv .venv
source .venv/bin/activate  # MacOS/Linux
# .venv\Scripts\activate   # Windows

pip install -r scripts/requirements.txt
```

### 3. Run Development Server
```bash
pnpm dev
```
Open [http://localhost:3000](http://localhost:3000).

## Usage Guide

### A. Training (First Step)
1. Go to **Training Mode**.
2. Upload `dataset_2020_2024.csv`.
3. Select Algorithms (Recommended: Select All to see comparison).
4. Enable **Use SMOTE** (System Recommendation).
5. Click **Start Training**.
   - *Note: This will generate `.joblib` files in the `saved_models/` folder.*

### B. Prediction (Deployment)
1. Go to **Prediction Mode**.
2. Input Candidate Data:
   - **Age**: 17-40
   - **Gender**: L/P
   - **Education**: SMA/D3/S1/S2
   - **Major**: IT / Non-IT (System auto-normalizes related majors)
   - **Logical Test**: 0-100
   - **Tech Result**: Pass/Fail
3. Click **Run Prediction**.
4. View the Decision Support recommendation Card.

## CSV Schema (for Batch Upload)
Ensure your CSV has these headers (case-insensitive):
- `age`: integer
- `gender`: 'L' or 'P'
- `grades`: 'SMA', 'D3', 'S1', 'S2'
- `majoring`: 'IT' or 'Non IT' (or specific majors like 'Informatika' which are auto-detected)
- `logical_test_score`: 0-100
- `tech_interview_result`: 'Pass' or 'Fail' (or 1/0)
- `class`: (Training only) 'pass' or 'failed'

## License
MIT - Thesis Project Only.
