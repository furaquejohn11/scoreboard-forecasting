from fastapi import HTTPException
import pandas as pd
import io
from typing import Dict, Optional
from prophet import Prophet
import numpy as np

class FileRepository:
    def __init__(self):
        self._global_data: Dict[str, pd.DataFrame] = {}

    def get_current_dataframe(self) -> Optional[pd.DataFrame]:
        """Get the current DataFrame from global data."""
        return self._global_data.get("current_df")

    def set_current_dataframe(self, df: pd.DataFrame) -> None:
        """Set the current DataFrame in global data."""
        self._global_data["current_df"] = df

    def read_excel_file(self, file_content: bytes, filename: str) -> pd.DataFrame:
        """Read Excel or CSV file content into a DataFrame."""
        try:
            if filename.endswith('.csv'):
                df = pd.read_csv(io.StringIO(file_content.decode('utf-8')))
            else:
                excel_data = io.BytesIO(file_content)
                df = pd.read_excel(excel_data, engine='openpyxl')
            return df
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Error reading file: {str(e)}")

    def validate_file_type(self, filename: str) -> None:
        """Validate if the file type is supported."""
        if not filename.endswith(('.xlsx', '.xls', '.csv')):
            raise HTTPException(status_code=400, detail="Only Excel (.xlsx, .xls) or CSV (.csv) files are supported")

    def validate_dataframe(self, df: pd.DataFrame) -> None:
        """Validate DataFrame integrity."""
        if df is None:
            raise HTTPException(status_code=400, detail="No data available. Please upload a file first.")
        if df.empty:
            raise HTTPException(status_code=400, detail="DataFrame is empty.")
        if not isinstance(df, pd.DataFrame):
            raise HTTPException(status_code=500, detail="Loaded data is not a valid pandas DataFrame.")

    def validate_required_columns(self, df: pd.DataFrame, required_columns: list) -> None:
        """Validate if required columns exist in DataFrame."""
        if not all(col in df.columns for col in required_columns):
            raise HTTPException(status_code=400, detail=f"Required columns are missing: {required_columns}")

    def process_dates(self, df: pd.DataFrame, date_column: str = 'DATE RECEIVED (MM/DD/YYYY)') -> pd.DataFrame:
        """Process and validate dates in DataFrame."""
        df['DATE RECEIVED'] = pd.to_datetime(df[date_column], format='%m/%d/%Y', errors='coerce')
        if df['DATE RECEIVED'].isna().any():
            raise HTTPException(status_code=400, detail="Some dates in 'DATE RECEIVED' are invalid.")
        df['ds'] = df['DATE RECEIVED'].dt.to_period('M').dt.to_timestamp()
        df['YEAR'] = df['DATE RECEIVED'].dt.year
        return df

    def get_monthly_aggregate(self, df: pd.DataFrame) -> pd.DataFrame:
        """Get monthly aggregated data."""
        per_month_df = df.groupby('ds').size().reset_index(name='y')
        per_month_df.columns = ['ds', 'y']
        per_month_df['ds'] = pd.to_datetime(per_month_df['ds'])
        return per_month_df

    def create_prophet_model(self, per_month_df: pd.DataFrame) -> Prophet:
        """Create and fit Prophet model."""
        # Make the seasonality true if need seasonality forecasting
        model = Prophet(yearly_seasonality=False, weekly_seasonality=False, daily_seasonality=False)
        # model.add_seasonality(name='monthly', period=30.42, fourier_order=5)
        model.fit(per_month_df)
        return model

    def forecast_future_months(self, model: Prophet, latest_date: pd.Timestamp, months_to_end: int, target_year: int) -> pd.DataFrame:
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
            return {key: FileRepository.convert_to_python_types(value) for key, value in obj.items()}
        elif isinstance(obj, list):
            return [FileRepository.convert_to_python_types(item) for item in obj]
        return obj 