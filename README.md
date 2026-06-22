# Cardiovascular Disease Prediction

A full-stack machine learning web application that predicts the presence of cardiovascular disease in patients. Built with a **FastAPI** backend running scikit-learn models and a **React + Vite** frontend with interactive data exploration and visualization.

---

## Table of Contents

- [About the Dataset](#about-the-dataset)
- [Machine Learning Approach](#machine-learning-approach)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [API Endpoints](#api-endpoints)
- [Credits](#credits)

---

## About the Dataset

The project uses the **Cardiovascular Disease dataset** containing **70,000 patient records** with 11 features and a binary target variable.

### Features

| Feature       | Type        | Description                                      |
| ------------- | ----------- | ------------------------------------------------ |
| `age`         | Numerical   | Age of the patient (in days)                     |
| `gender`      | Categorical | 1 = Female, 2 = Male                            |
| `height`      | Numerical   | Height in centimeters                            |
| `weight`      | Numerical   | Weight in kilograms                              |
| `ap_hi`       | Numerical   | Systolic blood pressure                          |
| `ap_lo`       | Numerical   | Diastolic blood pressure                         |
| `cholesterol` | Categorical | 1 = Normal, 2 = Above normal, 3 = Well above    |
| `gluc`        | Categorical | 1 = Normal, 2 = Above normal, 3 = Well above    |
| `smoke`       | Binary      | 0 = No, 1 = Yes                                 |
| `alco`        | Binary      | 0 = No, 1 = Yes                                 |
| `active`      | Binary      | 0 = No, 1 = Yes                                 |

### Target

| Variable  | Type   | Description                                      |
| --------- | ------ | ------------------------------------------------ |
| `cardio`  | Binary | 0 = No cardiovascular disease, 1 = Has CVD       |

---

## Machine Learning Approach

### Data Preprocessing

1. **Outlier removal**: Physiologically impossible values are filtered (e.g., negative blood pressure, extreme height/weight)
2. **Feature engineering**: New features are derived:
   - **BMI** — Body Mass Index (`weight / (height/100)²`)
   - **MAP** — Mean Arterial Pressure
   - **Pulse Pressure** — Difference between systolic and diastolic
   - **Age in years** — Converted from days
3. **Feature selection**: Recursive Feature Elimination (RFE) with Random Forest selects the 10 most predictive features
4. **Scaling**: StandardScaler normalizes all features

> **Leakage-free pipeline:** the train/test split happens **before** feature selection and scaling. The RFE selector and the `StandardScaler` are fit on the **training set only** and then applied to the held-out test set, so no test information leaks into preprocessing. The exact same engineering → selection → scaling steps are reused at prediction time via a single shared function.

### Classification Algorithms

Three algorithms are trained:

| Algorithm              | Description                                               |
| ---------------------- | --------------------------------------------------------- |
| **Decision Tree**      | Simple, interpretable tree-based classifier               |
| **Random Forest**      | Ensemble of decision trees for improved accuracy          |
| **Support Vector Machine (SVM)** | Finds optimal hyperplane for classification     |

### Hyperparameter Tuning

Each algorithm is trained with three tuning strategies, yielding **9 model variants** total:

| Strategy              | Description                                                |
| --------------------- | ---------------------------------------------------------- |
| **Untuned**           | Default sklearn hyperparameters                            |
| **Grid Search CV**    | Exhaustive search over a predefined parameter grid         |
| **Randomized Search CV** | Random sampling from parameter distributions            |

### Evaluation Metrics

All models are evaluated on the held-out test set:
- **Accuracy** — Overall correctness
- **Precision** — Positive predictive value (weighted)
- **Recall** — Sensitivity (weighted)
- **F1 Score** — Harmonic mean of precision and recall (weighted)
- **Cross-Validation Score** — 3-fold CV mean accuracy, computed on the **training set only**. (SVM is cross-validated on a 5,000-sample stratified subsample to keep its ~O(n²) fit time manageable.)

---

## Model Evaluation & Results

The models below were trained on the cleaned dataset (**~68,600 rows** after outlier removal, 80/20 train/test split) using the leakage-free pipeline described above. RFE selected the following 10 features:

```
gender, height, weight, ap_hi, ap_lo, cholesterol, age_years, bmi, map, pulse_pressure
```

> Note: `gluc`, `smoke`, `alco`, and `active` were dropped by feature selection — within this dataset they carry little marginal predictive signal once blood pressure, cholesterol, age, and body-composition features are present.

### Results (all 9 variants, sorted by test accuracy)

| Model                                   | Accuracy   | Precision | Recall  | F1 Score | CV Score |
| --------------------------------------- | ---------- | --------- | ------- | -------- | -------- |
| **Randomized Search Random Forest**  | **72.59%** | 72.80%    | 72.59%  | 72.50%   | 73.05%   |
| Grid Search Random Forest               | 72.55%     | 72.77%    | 72.55%  | 72.46%   | 73.00%   |
| Untuned Support Vector Machine          | 72.37%     | 72.84%    | 72.37%  | 72.19%   | 73.14%   |
| Grid Search Support Vector Machine      | 72.37%     | 72.84%    | 72.37%  | 72.19%   | 73.14%   |
| Randomized Search Support Vector Machine| 72.37%     | 72.84%    | 72.37%  | 72.19%   | 73.14%   |
| Grid Search Decision Tree               | 71.84%     | 72.02%    | 71.84%  | 71.76%   | 72.43%   |
| Randomized Search Decision Tree         | 71.81%     | 72.00%    | 71.81%  | 71.73%   | 72.41%   |
| Untuned Random Forest                   | 69.36%     | 69.37%    | 69.36%  | 69.34%   | 70.36%   |
| Untuned Decision Tree                   | 62.45%     | 62.44%    | 62.45%  | 62.44%   | 63.29%   |

### Best hyperparameters found

| Model          | Best parameters (Grid Search)                                                  |
| -------------- | ------------------------------------------------------------------------------ |
| Decision Tree  | `criterion=entropy`, `max_depth=10`                                             |
| Random Forest  | `n_estimators=200`, `max_depth=15`, `min_samples_split=5`, `min_samples_leaf=2` |
| SVM            | `C=1`, `kernel=rbf`, `gamma=scale`                                              |

### Findings

- **Tuning matters most for tree models.** An untuned Decision Tree overfits badly (**62.5%**) because it grows unbounded; constraining `max_depth=10` lifts it to **71.8%** — a ~9-point jump. The untuned Random Forest (69.4%) similarly improves to ~72.6% once depth and leaf sizes are tuned.
- **Random Forest (tuned) is the top performer** at **72.6%** accuracy, narrowly ahead of SVM and tuned Decision Trees.
- **SVM is stable but tuning-insensitive here.** All three SVM variants land on `C=1, rbf` and score identically (**72.4%**); the parameter grid didn't surface a better region. SVM is also by far the slowest to train on this dataset size.
- **Grid vs. Randomized search are effectively tied** for every algorithm — the search spaces are small enough that randomized sampling finds essentially the same optima.
- **The ~72–73% ceiling is a property of the data, not the models.** Test accuracy and (leakage-free) cross-validation accuracy agree closely across models, which indicates the pipeline is **not overfitting** — the remaining error reflects genuine overlap between healthy and at-risk patients given only these features.

> **Reproducibility:** all runs use `random_state=42`. Trained artifacts are cached to `server/models/` after the first run, so subsequent server starts load instantly instead of retraining.

## Architecture

```
cardiovascular-disease-prediction/
├── server/                  # Python FastAPI backend
│   ├── app/
│   │   ├── __init__.py
│   │   ├── config.py        # Environment configuration
│   │   ├── data.py          # Data loading & preprocessing
│   │   ├── models.py        # ML training & evaluation
│   │   ├── routes.py        # API endpoint definitions
│   │   └── main.py          # FastAPI app creation
│   ├── cvd_dataset.csv      # Dataset (70K rows)
│   ├── run.py               # Uvicorn entry point
│   ├── requirements.txt     # Python dependencies
│   ├── .env                 # Environment variables
│   └── .env.example         # Example env file
│
├── client/                  # React + Vite frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── tabs/        # Page tabs (Prediction, Evaluation, Exploration, About)
│   │   │   ├── sections/    # Reusable sections (Inputs, Settings, Result, ReportDisplay)
│   │   │   └── ui/          # shadcn/ui primitives
│   │   ├── lib/utils.ts     # Utility functions
│   │   ├── App.tsx          # Root component
│   │   ├── main.tsx         # Entry point
│   │   └── index.css        # Global styles
│   ├── index.html
│   ├── package.json
│   ├── vite.config.ts
│   ├── .env                 # Environment variables (VITE_API_URL)
│   └── .env.example         # Example env file
│
├── README.md
└── TODO.md
```

---

## Tech Stack

### Backend
- **Python 3.12+**
- **FastAPI** — Modern async web framework
- **Uvicorn** — ASGI server
- **scikit-learn** — Machine learning models
- **pandas** — Data manipulation
- **tqdm** — Training progress bars

### Frontend
- **React 18** — UI framework
- **TypeScript** — Type safety
- **Vite** — Build tool
- **Tailwind CSS** — Utility-first styling
- **shadcn/ui** — UI component primitives
- **Chart.js + react-chartjs-2** — Data visualization
- **Zod** — Input validation

---

## Getting Started

### Prerequisites

- **Python 3.12+** with `pip`
- **Node.js 18+** with `npm`
- **Git**

### Installation

```bash
# Clone the repository
git clone https://github.com/MoBakour/cardiovascular-disease-prediction.git
cd cardiovascular-disease-prediction
```

#### Server Setup

```bash
cd server

# (Optional) Create a virtual environment
python -m venv .venv
.venv\Scripts\activate    # Windows
# source .venv/bin/activate  # macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Configure environment (edit .env if needed)
cp .env.example .env
```

#### Client Setup

```bash
cd client

# Install dependencies
npm install

# Configure environment (sets VITE_API_URL — defaults to http://localhost:5000)
cp .env.example .env
```

### Running the Application

#### Start the Server

```bash
cd server
python run.py
```

The server will:
1. Load and preprocess the dataset (70K rows)
2. Train 9 model variants with progress bars
3. Start the API at `http://localhost:5000`

> **Note**: First startup takes ~1–3 minutes for model training. Subsequent requests are instant.

#### Start the Client

```bash
cd client
npm run dev
```

The client will start at `http://localhost:5173` (Vite default).

---

## API Endpoints

| Method | Endpoint            | Description                              |
| ------ | ------------------- | ---------------------------------------- |
| GET    | `/health`           | Health check                             |
| GET    | `/training-status`  | Check if models are trained              |
| GET    | `/evaluate`         | Get evaluation results for all 9 models  |
| POST   | `/predict`          | Predict CVD for a patient                |

### POST `/predict` — Request Body

```json
{
    "model": "Random Forest",
    "tuning": "Grid Search",
    "input": [18393, 2, 168, 62, 110, 80, 1, 1, 0, 0, 1]
}
```

`input` is the **11 raw features in this exact order** (the server engineers `age_years`, `bmi`, `map`, and `pulse_pressure` itself):

```
[age (days), gender, height (cm), weight (kg), ap_hi, ap_lo, cholesterol, gluc, smoke, alco, active]
```

### POST `/predict` — Response

```json
{
    "prediction": [0]
}
```

`0` = No cardiovascular disease, `1` = Has cardiovascular disease.

---

## Credits

Built by [MoBakour](https://github.com/MoBakour).

- [GitHub](https://github.com/MoBakour)
- [LinkedIn](https://www.linkedin.com/in/mobakour)
- [Source Code](https://github.com/MoBakour/cardiovascular-disease-prediction)
