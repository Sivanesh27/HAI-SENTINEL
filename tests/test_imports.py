def test_ml_imports():
    """Verify that all core ML, scientific, and database libraries import correctly."""
    import numpy as np
    import pandas as pd
    import sklearn
    import xgboost as xgb
    import lightgbm as lgb
    import shap
    import sqlalchemy

    assert np.__version__ is not None
    assert pd.__version__ is not None
    assert sklearn.__version__ is not None
    assert xgb.__version__ is not None
    assert lgb.__version__ is not None
    assert shap.__version__ is not None
    assert sqlalchemy.__version__ is not None
