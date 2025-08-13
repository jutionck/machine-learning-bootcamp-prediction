# Machine Learning Bootcamp Prediction

A Next.js (App Router) app that trains ML models on a bootcamp dataset using a Python pipeline, then visualizes results and enables single-record prediction.

## Features

- Upload CSV dataset with inline validation and preview
- Select algorithms and train with or without SMOTE
- Real Python training pipeline (scikit-learn, imbalanced-learn, xgboost, shap)
- Comparison mode: with vs without SMOTE + improvements table
- Best Performing Algorithm banner and radar charts
- Results table with accuracy, precision, recall, F1, ROC-AUC
- McNemar statistical analysis (when available)
- Export results to JSON/CSV and academic report JSON
- Individual Prediction form with “Train New Data” shortcut

## Tech Stack

- Frontend: Next.js 14, TypeScript, Tailwind CSS, shadcn/ui, Recharts
- Backend: Next.js Route Handlers (Node), Python child process
- Python: pandas, numpy, scikit-learn, imbalanced-learn, xgboost, shap, scipy

## Prerequisites

- Node.js 18+
- pnpm
- Python 3.10+

## Setup

1. Install JS deps

```bash
pnpm install
```

2. Create a Python virtualenv and install ML packages

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r scripts/requirements.txt
```

3. Verify Python runner works (optional)

```bash
python scripts/run_advanced_trainer.py --help
```

## Development

Run the dev server:

```bash
pnpm dev
```

Open http://localhost:3000.

## Usage

1. Training Mode

- Upload a CSV containing required columns: age, gender, grades, majoring, experience, logical_test_score, tech_interview_grades, class
- Choose algorithms and toggle SMOTE or Comparison Mode
- Click Start Training; results appear with best algorithm and charts

2. Prediction Mode

- Fill the participant form and click Predict Success
- If there are no trained models, click “Train New Data” to jump to Training Mode

3. Export

- Export JSON, CSV, or an academic-report JSON from the results panel

## Project Structure

- app/
  - api/train/route.ts: runs Python training and returns results
  - api/predict/route.ts: mock prediction using selected models
  - page.tsx: main UI (training + prediction)
- components/predictor/
  - UploadPanel.tsx, DatasetConfigCard.tsx, ResultsSummary.tsx, ExportPanel.tsx
- components/ui/
  - shadcn/ui components and chart helpers
- scripts/
  - advanced_ml_trainer.py: core training pipeline
  - run_advanced_trainer.py: CLI wrapper; prints only JSON to stdout
  - requirements.txt: Python deps

## Environment Details

- The app prefers .venv/bin/python to run training. You can override via env var PYTHON_INTERPRETER if needed.
- Python script logs go to stderr; only JSON goes to stdout to ensure robust parsing.

## CSV Format Notes

- Header row + data rows required.
- Column expectations:
  - gender: L/P
  - majoring: IT/Non IT
  - experience: yes/no
  - logical_test_score, tech_interview_grades: 0–100
  - class: pass/failed

## Troubleshooting

- xgboost missing: ensure venv is active and pip install -r scripts/requirements.txt
- JSON parse errors: confirm Python prints only JSON to stdout (use the provided wrapper)
- Type errors: run `pnpm -s tsc --noEmit`

## Scripts

- Python training entry: `scripts/run_advanced_trainer.py`
- Core trainer: `scripts/advanced_ml_trainer.py`

## License

MIT
