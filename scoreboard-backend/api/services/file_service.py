from fastapi import HTTPException
import pandas as pd
import io
from typing import Dict, Optional, List
from ai.prophet_service import ProphetService

class FileService:
    _instance = None
    _global_data: Dict[str, pd.DataFrame] = {}

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(FileService, cls).__new__(cls)
        return cls._instance

    def __init__(self):
        # Initialize only once
        if not hasattr(self, '_initialized'):
            self._initialized = True

    def get_current_dataframe(self) -> Optional[pd.DataFrame]:
        """Get the current DataFrame from global data."""
        return self._global_data.get("current_df")

    def set_current_dataframe(self, df: pd.DataFrame) -> None:
        """Set the current DataFrame in global data."""
        self._global_data["current_df"] = df

    def get_columns(self) -> List[str]:
        """Get column names from current DataFrame."""
        df = self.get_current_dataframe()
        if df is None:
            raise HTTPException(status_code=400, detail="No file uploaded")
        return df.columns.tolist()

    def add_new_data(self, new_data: dict) -> pd.DataFrame:
        """Add new data to the existing DataFrame."""
        df = self.get_current_dataframe()
        if df is None:
            raise HTTPException(status_code=400, detail="No file uploaded")

        # Validate that all required columns are present in new_data
        missing_columns = [col for col in df.columns if col not in new_data]
        if missing_columns:
            raise HTTPException(
                status_code=400,
                detail=f"Missing required columns: {missing_columns}"
            )

        # Create a new row with the provided data
        new_row = pd.DataFrame([new_data])
        
        # Ensure date column is in correct format
        if 'DATE RECEIVED (MM/DD/YYYY)' in new_row.columns:
            new_row['DATE RECEIVED (MM/DD/YYYY)'] = pd.to_datetime(
                new_row['DATE RECEIVED (MM/DD/YYYY)']
            ).dt.strftime('%m/%d/%Y')

        # Append the new row to the existing DataFrame
        updated_df = pd.concat([df, new_row], ignore_index=True)
        
        # Update the global data
        self.set_current_dataframe(updated_df)
        
        return updated_df

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

    def create_prophet_model(self, per_month_df: pd.DataFrame):
        """Create and fit Prophet model."""
        return ProphetService.create_prophet_model(per_month_df)

    def forecast_future_months(self, model, latest_date: pd.Timestamp, months_to_end: int, target_year: int) -> pd.DataFrame:
        """Forecast future months using Prophet model."""
        return ProphetService.forecast_future_months(model, latest_date, months_to_end, target_year)

    @staticmethod
    def convert_to_python_types(obj):
        """Recursively convert NumPy types to Python native types."""
        return ProphetService.convert_to_python_types(obj) 