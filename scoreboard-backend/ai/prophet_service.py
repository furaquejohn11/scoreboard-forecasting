from prophet import Prophet
import pandas as pd
import numpy as np
from typing import Dict

class ProphetService:
    @staticmethod
    def create_prophet_model(per_month_df: pd.DataFrame) -> Prophet:
        """Create and fit Prophet model."""
        # Make the seasonality true if need seasonality forecasting
        model = Prophet(yearly_seasonality=False, weekly_seasonality=False, daily_seasonality=False, 
                        changepoint_prior_scale=0.5, n_changepoints=50, changepoint_range=0.9)
        # model.add_seasonality(name='monthly', period=30.42, fourier_order=5)
        model.fit(per_month_df)
        return model

    @staticmethod
    def forecast_future_months(model: Prophet, latest_date: pd.Timestamp, months_to_end: int, target_year: int) -> pd.DataFrame:
        """Forecast future months using Prophet model."""
        future = model.make_future_dataframe(periods=months_to_end, freq='MS')
        forecast = model.predict(future)
        forecast = forecast[(forecast['ds'] > latest_date) & 
                          (forecast['ds'].dt.year == target_year)][['ds', 'yhat']]
        return forecast

    @staticmethod
    def convert_to_python_types(obj):
        """Recursively convert NumPy types to Python native types."""
        if isinstance(obj, np.integer):
            return int(obj)
        elif isinstance(obj, np.floating):
            return float(obj)
        elif isinstance(obj, np.ndarray):
            return obj.tolist()
        elif isinstance(obj, dict):
            return {key: ProphetService.convert_to_python_types(value) for key, value in obj.items()}
        elif isinstance(obj, list):
            return [ProphetService.convert_to_python_types(item) for item in obj]
        return obj 