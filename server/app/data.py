"""
Data loading, cleaning, feature engineering, and preprocessing.

The feature-engineering logic lives in a single function (`engineer_features`)
that is shared by both training and prediction, so the model always sees inputs
built the exact same way.
"""

import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.feature_selection import RFE
from sklearn.ensemble import RandomForestClassifier

from app.config import DATASET_PATH


# Public contract for the /predict endpoint
# Raw features a client must send, in this exact order. These mirror the raw
# dataset columns (minus id/cardio). `age` is expected in DAYS, as in the data.
RAW_INPUT_COLUMNS: list[str] = [
    "age", "gender", "height", "weight", "ap_hi", "ap_lo",
    "cholesterol", "gluc", "smoke", "alco", "active",
]


# Module-level state (populated by load_and_prepare())
scaler: StandardScaler | None = None
selector: RFE | None = None
feature_columns: list[str] = []  # engineered feature names, pre-selection
X_train = None
X_test = None
y_train = None
y_test = None


def engineer_features(df: pd.DataFrame) -> pd.DataFrame:
    """
    Build the engineered feature matrix from a frame of RAW_INPUT_COLUMNS.

    Used for both the training set and single prediction requests so the two
    paths can never drift apart.
    """
    out = df.copy()

    # Age: days -> years
    out["age_years"] = (out["age"] / 365.25).round(1)
    # BMI
    out["bmi"] = (out["weight"] / ((out["height"] / 100) ** 2)).round(2)
    # Mean Arterial Pressure (MAP)
    out["map"] = (out["ap_lo"] + (out["ap_hi"] - out["ap_lo"]) / 3).round(2)
    # Pulse Pressure
    out["pulse_pressure"] = out["ap_hi"] - out["ap_lo"]

    # Drop the raw age column (age_years replaces it)
    return out.drop(columns=["age"])


def load_and_prepare() -> None:
    """Load the dataset, clean it, engineer features, split, and fit transforms.

    To avoid data leakage, the train/test split happens BEFORE feature selection
    and scaling: the RFE selector and the StandardScaler are fit on the training
    data only, then applied to the held-out test data.
    """
    global scaler, selector, feature_columns
    global X_train, X_test, y_train, y_test

    print("\n[*] Loading dataset...")
    data = pd.read_csv(DATASET_PATH, sep=";")
    print(f"   Raw dataset shape: {data.shape}")
    print(f"   Missing values: {data.isnull().sum().sum()}")

    # Drop missing values
    data.dropna(inplace=True)

    # Remove physiologically impossible / extreme outliers
    # Blood pressure: systolic 50-250, diastolic 30-200
    data = data[(data["ap_hi"] >= 50) & (data["ap_hi"] <= 250)]
    data = data[(data["ap_lo"] >= 30) & (data["ap_lo"] <= 200)]
    # Systolic should be >= diastolic
    data = data[data["ap_hi"] >= data["ap_lo"]]
    # Height: 100-220 cm, Weight: 30-250 kg
    data = data[(data["height"] >= 100) & (data["height"] <= 220)]
    data = data[(data["weight"] >= 30) & (data["weight"] <= 250)]
    print(f"   After cleaning: {data.shape}")

    # Feature engineering (shared with prediction)
    X = engineer_features(data[RAW_INPUT_COLUMNS])
    y_series = data["cardio"]

    feature_columns = list(X.columns)
    print(f"   Features ({len(feature_columns)}): {feature_columns}")

    # Train / test split FIRST (prevents leakage)
    X_train_raw, X_test_raw, y_train, y_test = train_test_split(
        X, y_series, test_size=0.2, random_state=42, stratify=y_series
    )

    # Feature selection (RFE) — fit on TRAIN only
    print("[*] Running feature selection (RFE) on training data...")
    estimator = RandomForestClassifier(n_estimators=100, random_state=42, n_jobs=-1)
    n_select = min(10, len(feature_columns))
    selector = RFE(estimator, n_features_to_select=n_select, step=1)
    X_train_sel = selector.fit_transform(X_train_raw, y_train)
    X_test_sel = selector.transform(X_test_raw)

    selected = [f for f, s in zip(feature_columns, selector.support_) if s]
    print(f"   Selected features ({len(selected)}): {selected}")

    # Scale — fit on TRAIN only
    print("[*] Scaling features...")
    scaler = StandardScaler()
    X_train = scaler.fit_transform(X_train_sel)
    X_test = scaler.transform(X_test_sel)

    print(f"   Train set: {X_train.shape[0]} samples")
    print(f"   Test set:  {X_test.shape[0]} samples")
    print("[OK] Data preparation complete!\n")


def prepare_input(raw_values: list[float]):
    """Turn a list of raw feature values into a model-ready, scaled array.

    Applies the exact same engineering, selection, and scaling as training.
    """
    if scaler is None or selector is None:
        raise RuntimeError("Preprocessing artifacts are not loaded.")
    if len(raw_values) != len(RAW_INPUT_COLUMNS):
        raise ValueError(
            f"Expected {len(RAW_INPUT_COLUMNS)} raw features "
            f"{RAW_INPUT_COLUMNS}, got {len(raw_values)}."
        )

    raw_df = pd.DataFrame([raw_values], columns=RAW_INPUT_COLUMNS)
    engineered = engineer_features(raw_df)[feature_columns]
    selected = selector.transform(engineered)
    return scaler.transform(selected)
