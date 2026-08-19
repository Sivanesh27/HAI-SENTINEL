"""
Models package for HAI-Sentinel
"""
from .baselines import build_logistic_regression, build_random_forest
from .trainer import train_and_evaluate_all_models

__all__ = [
    "build_logistic_regression",
    "build_random_forest",
    "train_and_evaluate_all_models"
]
