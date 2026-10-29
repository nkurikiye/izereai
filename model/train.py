"""Train a delay-risk baseline from historical project snapshots.

Input CSV must contain one row per project at a defined observation date.
All feature values must be known on or before that date. The label
late_6m must be 1 if actual completion exceeded original planned completion
by more than six months, otherwise 0. Do not use outcome-derived features.
Usage: python model/train.py historical_projects.csv
Requires: pandas, scikit-learn, joblib
"""
import json
import sys
from pathlib import Path
import joblib
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import brier_score_loss, roc_auc_score
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler

FEATURES = ["design", "permits", "procurement", "changes", "stakeholders"]
TARGET = "late_6m"

def main(path):
    df = pd.read_csv(path)
    required = FEATURES + [TARGET, "project_id", "snapshot_date"]
    missing = [c for c in required if c not in df.columns]
    if missing:
        raise ValueError("Missing columns: " + ", ".join(missing))
    if df["project_id"].duplicated().any():
        raise ValueError("Use one snapshot per project for this baseline; duplicates leak across splits.")
    df["snapshot_date"] = pd.to_datetime(df["snapshot_date"], errors="raise")
    df = df.sort_values("snapshot_date")
    if len(df) < 100 or df[TARGET].nunique() != 2:
        raise ValueError("Need at least 100 labelled projects and both outcome classes.")
    cutoff = int(len(df) * .8)
    train, test = df.iloc[:cutoff], df.iloc[cutoff:]
    if train[TARGET].nunique() != 2 or test[TARGET].nunique() != 2:
        raise ValueError("Temporal train/test split must contain both classes.")
    model = Pipeline([
        ("preprocess", ColumnTransformer([
            ("numeric", Pipeline([
                ("impute", SimpleImputer(strategy="median")),
                ("scale", StandardScaler())
            ]), FEATURES)
        ])),
        ("classifier", LogisticRegression(max_iter=1000, class_weight=None))
    ])
    model.fit(train[FEATURES], train[TARGET])
    probabilities = model.predict_proba(test[FEATURES])[:, 1]
    report = {
        "target": TARGET,
        "train_projects": len(train),
        "test_projects": len(test),
        "test_roc_auc": round(float(roc_auc_score(test[TARGET], probabilities)), 4),
        "test_brier": round(float(brier_score_loss(test[TARGET], probabilities)), 4),
        "last_train_snapshot": str(train["snapshot_date"].max().date()),
        "first_test_snapshot": str(test["snapshot_date"].min().date()),
        "warning": "Research baseline. Validate outcome labels, temporal leakage, calibration and subgroup performance before operational use."
    }
    output = Path(__file__).resolve().parent
    joblib.dump(model, output / "delay_risk.joblib")
    (output / "validation.json").write_text(json.dumps(report, indent=2))
    print(json.dumps(report, indent=2))

if __name__ == "__main__":
    if len(sys.argv) != 2:
        raise SystemExit("Usage: python model/train.py historical_projects.csv")
    main(sys.argv[1])
