"""
Model training, hyperparameter tuning, evaluation, and persistence.
"""

import joblib
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier
from sklearn.svm import SVC
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    classification_report,
)
from sklearn.model_selection import (
    cross_val_score,
    KFold,
    GridSearchCV,
    RandomizedSearchCV,
    train_test_split,
)
from tqdm import tqdm

from app import data
from app.config import MODELS_DIR


# Module-level state
models: dict = {}
grid_tuning_models: dict = {}
randomized_tuning_models: dict = {}
results: dict = {}
training_complete = False
training_progress = ""


# Persistence paths
_ARTIFACTS = {
    "models":              MODELS_DIR / "untuned_models.joblib",
    "grid_models":         MODELS_DIR / "grid_tuning_models.joblib",
    "randomized_models":   MODELS_DIR / "randomized_tuning_models.joblib",
    "results":             MODELS_DIR / "results.joblib",
    "scaler":              MODELS_DIR / "scaler.joblib",
    "selector":            MODELS_DIR / "selector.joblib",
    "feature_columns":     MODELS_DIR / "feature_columns.joblib",
}


# Parameter grids (small for Grid Search to keep training fast)
PARAM_GRIDS = {
    "Decision Tree": {
        "criterion": ["gini", "entropy"],
        "max_depth": [10, 20, None],
        "min_samples_split": [2, 10],
        "min_samples_leaf": [1, 4],
    },
    "Random Forest": {
        "n_estimators": [100, 200],
        "max_depth": [15, 25],
        "min_samples_split": [2, 5],
        "min_samples_leaf": [1, 2],
    },
    "Support Vector Machine": {
        "C": [0.1, 1],
        "kernel": ["rbf"],
        "gamma": ["scale"],
    },
}

# Broader grids for RandomizedSearchCV (samples n_iter from these)
RANDOMIZED_PARAM_GRIDS = {
    "Decision Tree": {
        "criterion": ["gini", "entropy"],
        "max_depth": [None, 10, 15, 20, 30, 50],
        "min_samples_split": [2, 5, 10, 15],
        "min_samples_leaf": [1, 2, 4, 8],
    },
    "Random Forest": {
        "n_estimators": [100, 200, 300],
        "criterion": ["gini", "entropy"],
        "max_depth": [None, 15, 25, 35],
        "min_samples_split": [2, 5, 10],
        "min_samples_leaf": [1, 2, 4],
    },
    "Support Vector Machine": {
        "C": [0.1, 0.5, 1, 5, 10],
        "gamma": ["scale", "auto"],
        "kernel": ["rbf"],
    },
}

MODEL_CONSTRUCTORS = {
    "Decision Tree": DecisionTreeClassifier,
    "Random Forest": RandomForestClassifier,
    "Support Vector Machine": SVC,
}


# Persistence helpers
def _saved_models_exist() -> bool:
    """Check if all required model artifacts are present on disk."""
    return all(path.exists() for path in _ARTIFACTS.values())


def _save_artifacts() -> None:
    """Save all trained models and preprocessing objects to disk."""
    MODELS_DIR.mkdir(parents=True, exist_ok=True)

    joblib.dump(models, _ARTIFACTS["models"])
    joblib.dump(grid_tuning_models, _ARTIFACTS["grid_models"])
    joblib.dump(randomized_tuning_models, _ARTIFACTS["randomized_models"])
    joblib.dump(results, _ARTIFACTS["results"])
    joblib.dump(data.scaler, _ARTIFACTS["scaler"])
    joblib.dump(data.selector, _ARTIFACTS["selector"])
    joblib.dump(data.feature_columns, _ARTIFACTS["feature_columns"])

    print(f"[OK] Saved all model artifacts to {MODELS_DIR}/")


def load_saved_models() -> bool:
    """
    Attempt to load previously saved models from disk.
    Returns True if successful, False if artifacts are missing or corrupted.
    """
    global models, grid_tuning_models, randomized_tuning_models
    global results, training_complete, training_progress

    if not _saved_models_exist():
        print("[*] No saved models found. Training from scratch...")
        return False

    try:
        print("[*] Loading saved models from disk...")

        models = joblib.load(_ARTIFACTS["models"])
        grid_tuning_models = joblib.load(_ARTIFACTS["grid_models"])
        randomized_tuning_models = joblib.load(_ARTIFACTS["randomized_models"])
        results = joblib.load(_ARTIFACTS["results"])
        data.scaler = joblib.load(_ARTIFACTS["scaler"])
        data.selector = joblib.load(_ARTIFACTS["selector"])
        data.feature_columns = joblib.load(_ARTIFACTS["feature_columns"])

        training_complete = True
        training_progress = "Complete (loaded from disk)"

        print(f"   Loaded {len(models)} untuned models")
        print(f"   Loaded {len(grid_tuning_models)} grid-tuned models")
        print(f"   Loaded {len(randomized_tuning_models)} randomized-tuned models")
        print(f"   Loaded {len(results)} evaluation results")
        print("[OK] All models loaded successfully!\n")
        print("Results summary:")
        for name, metrics in results.items():
            print(f"   {name}: {metrics['accuracy']:.2%} accuracy")
        return True

    except Exception as e:
        print(f"[!] Failed to load saved models: {e}")
        print("[*] Will retrain from scratch...")
        # Reset state
        models = {}
        grid_tuning_models = {}
        randomized_tuning_models = {}
        results = {}
        training_complete = False
        training_progress = ""
        return False


def train_all_models() -> None:
    """Train untuned, grid-tuned, and randomized-tuned models with progress."""
    global models, grid_tuning_models, randomized_tuning_models
    global results, training_complete, training_progress

    X_train = data.X_train
    X_test = data.X_test
    y_train = data.y_train
    y_test = data.y_test

    steps = list(MODEL_CONSTRUCTORS.keys())
    total_steps = len(steps) * 3  # 3 tuning variants per model

    print("[*] Training models...\n")
    pbar = tqdm(total=total_steps, desc="Training", unit="model", ncols=80)

    for name, Constructor in MODEL_CONSTRUCTORS.items():
        # Untuned
        training_progress = f"Training untuned {name}..."
        pbar.set_postfix_str(f"Untuned {name}")
        instance = Constructor(random_state=42) if name != "Support Vector Machine" else Constructor()
        instance.fit(X_train, y_train)
        models[name] = instance
        pbar.update(1)

        # Grid Search
        training_progress = f"Grid search tuning {name}..."
        pbar.set_postfix_str(f"Grid {name}")
        grid_cv = GridSearchCV(
            Constructor(),
            PARAM_GRIDS[name],
            cv=3,
            n_jobs=-1,
            scoring="accuracy",
        )
        grid_cv.fit(X_train, y_train)
        grid_tuning_models[name] = grid_cv.best_estimator_
        print(f"\n   Grid Search {name} best params: {grid_cv.best_params_}")
        pbar.update(1)

        # Randomized Search
        training_progress = f"Randomized search tuning {name}..."
        pbar.set_postfix_str(f"Random {name}")
        rand_cv = RandomizedSearchCV(
            Constructor(),
            RANDOMIZED_PARAM_GRIDS[name],
            cv=3,
            n_iter=8,
            n_jobs=-1,
            scoring="accuracy",
            random_state=42,
        )
        rand_cv.fit(X_train, y_train)
        randomized_tuning_models[name] = rand_cv.best_estimator_
        print(f"   Randomized Search {name} best params: {rand_cv.best_params_}")
        pbar.update(1)

    pbar.close()

    # Evaluate all 9 model variants
    print("\n[*] Evaluating models...\n")

    all_models = {}
    for name in MODEL_CONSTRUCTORS:
        all_models[f"Untuned {name}"] = models[name]
        all_models[f"Grid Search {name}"] = grid_tuning_models[name]
        all_models[f"Randomized Search {name}"] = randomized_tuning_models[name]

    kf = KFold(n_splits=3, shuffle=True, random_state=42)

    for model_name, model in tqdm(all_models.items(), desc="Evaluating", ncols=80):
        y_pred = model.predict(X_test)
        accuracy = accuracy_score(y_test, y_pred)
        precision = precision_score(y_test, y_pred, average="weighted")
        recall = recall_score(y_test, y_pred, average="weighted")
        f1 = f1_score(y_test, y_pred, average="weighted")

        # Cross-validate on the TRAINING data only (no test leakage). SVM has
        # ~O(n^2) fit cost, so estimate it on a stratified subsample to stay fast.
        if "Support Vector Machine" in model_name:
            sample_n = min(5000, len(X_train))
            X_cv, _, y_cv, _ = train_test_split(
                X_train, y_train, train_size=sample_n,
                random_state=42, stratify=y_train,
            )
        else:
            X_cv, y_cv = X_train, y_train
        cv_mean = cross_val_score(model, X_cv, y_cv, cv=kf, n_jobs=-1).mean()

        report = classification_report(y_test, y_pred, output_dict=True)
        print(f"\n   {model_name}: accuracy={accuracy:.4f}")

        results[model_name] = {
            "accuracy": round(accuracy, 4),
            "precision": round(precision, 4),
            "recall": round(recall, 4),
            "f1_score": round(f1, 4),
            "cross_val_score": round(cv_mean, 4),
        }

    training_complete = True
    training_progress = "Complete"
    print("\n[OK] All models trained and evaluated!\n")
    print("Results summary:")
    for name, metrics in results.items():
        print(f"   {name}: {metrics['accuracy']:.2%} accuracy")

    # Persist to disk
    _save_artifacts()
