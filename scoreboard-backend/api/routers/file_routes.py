from fastapi import APIRouter, UploadFile, File, HTTPException
import pandas as pd
import io
from typing import Dict
from prophet import Prophet
import numpy as np

router = APIRouter()

# Basis for file reading. You should update it
'''@router.post("/csv-row-count")
async def count_csv_rows(file: UploadFile = File(...)):
    try:
        # Read the uploaded CSV file
        content = await file.read()
        csv_data = io.StringIO(content.decode('utf-8'))

        # Use pandas to read CSV and count rows
        df = pd.read_csv(csv_data)
        row_count = len(df)

        return {"filename": file.filename, "row_count": row_count}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error reading CSV file: {str(e)}")'''

# TODO: Once the excel has been uploaded, it must be accessible by other functions.

global_data: Dict[str, pd.DataFrame] = {}

@router.post("/upload-excel")
async def read_excel(file: UploadFile = File(...)):
    try:
        if not file.filename.endswith(('.xlsx', '.xls', '.csv')):
            raise HTTPException(status_code=400, detail="Only Excel (.xlsx, .xls) or CSV (.csv) files are supported")

        content = await file.read()
        if file.filename.endswith('.csv'):
            df = pd.read_csv(io.StringIO(content.decode('utf-8')))
        else:
            excel_data = io.BytesIO(content)
            df = pd.read_excel(excel_data, engine='openpyxl')

        global_data["current_df"] = df

        return {"filename": file.filename, "message": "File uploaded successfully", "row_count": len(df)}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error reading file: {str(e)}")

@router.get("/total-beneficiaries")
async def get_total_beneficiaries():
    try:
        if "current_df" not in global_data or global_data["current_df"] is None:
            raise HTTPException(status_code=400, detail="No data available. Please upload a file first.")

        df = global_data["current_df"]

        if df.empty:
            raise HTTPException(status_code=400, detail="DataFrame is empty.")

        df['DATE RECEIVED'] = pd.to_datetime(df['DATE RECEIVED (MM/DD/YYYY)'], format='%m/%d/%Y', errors='coerce')
        if df['DATE RECEIVED'].isna().any():
            raise HTTPException(status_code=400, detail="Some dates in 'DATE RECEIVED' are invalid.")

        df['YEAR'] = df['DATE RECEIVED'].dt.year

        beneficiaries_per_year = df.groupby('YEAR').size().reset_index(name='BENEFICIARY_COUNT')
        
        year_counts = beneficiaries_per_year.to_dict(orient='records')

        total_beneficiaries = len(df)

        return {
            "message": "Total beneficiaries and year-wise breakdown",
            "total_beneficiaries": total_beneficiaries,
            "beneficiaries_by_year": year_counts
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error processing data: {str(e)}")

def assign_category(row):
    program = row['SOCIAL SERVICE / PROGRAM']
    if program in ['LIVELIHOOD_ASSISTANCE', 'SLP', 'OTHER_CAPABILITY_BUILDING_SUPPORT']:
        return 'Livelihood & Employment Support'
    elif program in ['MEDICAL_SERVICES', 'PWD_ASSISTANCE']:
        return 'Medical & Health Services'
    elif program in ['EDUCATIONAL_ASSISTANCE', 'AICS', 'SOCIAL_PENSION']:
        return 'Educational & Financial Assistance'
    elif program in ['KALAHI', 'OTHER_PROGRAM']:
        return 'Community Development & Welfare'
    elif program in ['SUPPLEMENTAL_FEEDING', 'DISASTER_RELIEF_ASSISTANCE']:
        return 'Food & Emergency Aid'
    else:
        return 'Unknown'

@router.get("/highest-category-growth")
async def get_highest_growth_category():
    try:
        # Check if DataFrame exists
        if "current_df" not in global_data or global_data["current_df"] is None:
            raise HTTPException(status_code=400, detail="No data available. Please upload a file first.")

        # Get the stored DataFrame
        df = global_data["current_df"].copy()

        # Validate DataFrame
        if df.empty:
            raise HTTPException(status_code=400, detail="DataFrame is empty.")

        # Validate required columns
        required_columns = ['SOCIAL SERVICE / PROGRAM', 'DATE RECEIVED (MM/DD/YYYY)']
        if not all(col in df.columns for col in required_columns):
            raise HTTPException(status_code=400, detail="Required columns are missing.")

        # Handle missing or invalid data
        df = df.dropna(subset=required_columns)
        if df.empty:
            raise HTTPException(status_code=400, detail="No valid data after removing missing values.")

        # Validate SOCIAL SERVICE / PROGRAM
        valid_programs = ['LIVELIHOOD_ASSISTANCE', 'KALAHI', 'MEDICAL_SERVICES', 'SUPPLEMENTAL_FEEDING',
                          'OTHER_PROGRAM', 'DISASTER_RELIEF_ASSISTANCE', 'OTHER_CAPABILITY_BUILDING_SUPPORT',
                          'SOCIAL_PENSION', 'PWD_ASSISTANCE', 'EDUCATIONAL_ASSISTANCE', 'AICS', 'SLP']
        invalid_programs = df[~df['SOCIAL SERVICE / PROGRAM'].isin(valid_programs)]['SOCIAL SERVICE / PROGRAM'].unique()
        if len(invalid_programs) > 0:
            raise HTTPException(status_code=400, detail=f"Invalid programs found: {invalid_programs}")

        # Convert DATE RECEIVED to datetime and extract year
        df['DATE RECEIVED'] = pd.to_datetime(df['DATE RECEIVED (MM/DD/YYYY)'], format='%m/%d/%Y', errors='coerce')
        if df['DATE RECEIVED'].isna().any():
            raise HTTPException(status_code=400, detail="Some dates in 'DATE RECEIVED' are invalid.")
        df['YEAR'] = df['DATE RECEIVED'].dt.year

        # Assign categories
        df['CATEGORY'] = df.apply(assign_category, axis=1)

        # Check for 'Unknown' category
        if 'Unknown' in df['CATEGORY'].values:
            unknown_programs = df[df['CATEGORY'] == 'Unknown']['SOCIAL SERVICE / PROGRAM'].unique()
            raise HTTPException(status_code=400, detail=f"Unknown programs found: {unknown_programs}")

        # Group by year and category, count beneficiaries
        counts = df.groupby(['YEAR', 'CATEGORY']).size().unstack(fill_value=0)

        # Convert counts to dictionary for JSON response
        counts_dict = counts.to_dict(orient='index')
        counts_by_year = {str(year): {category: int(count) for category, count in categories.items()}
                         for year, categories in counts_dict.items()}

        # Calculate year-over-year growth rates
        growth_rates = counts.pct_change() * 100  # Returns growth rate as percentage
        growth_rates = growth_rates.round(2)  # Round to 2 decimal places

        # Replace inf/-inf with None (happens when dividing by 0)
        growth_rates = growth_rates.replace([float('inf'), -float('inf')], None)

        # Find the category with the highest growth rate each year
        highest_growth = []
        for year in growth_rates.index:
            if year == counts.index[0]:  # Skip first year (no previous year for growth)
                continue
            year_data = growth_rates.loc[year]
            max_category = year_data.idxmax()
            max_growth = year_data.max()
            if pd.notna(max_growth):
                highest_growth.append({
                    "year": int(year),
                    "category": max_category,
                    "growth_rate_percent": max_growth
                })

        # Get total beneficiaries
        total_beneficiaries = len(df)

        return {
            "message": "Highest category growth per year with counts",
            "total_beneficiaries": total_beneficiaries,
            "highest_growth_by_year": highest_growth,
            "counts_by_year": counts_by_year
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error processing data: {str(e)}")

def assign_district(row):
    city = row['MUNICIPALITY/CITY']
    first_district = ['SAN PEDRO']
    second_district = ['BAY', 'CABUYAO', 'LOS BAÑOS']
    third_district = ['ALAMINOS', 'CALAUAN', 'LILIW', 'NAGCARLAN', 'RIZAL', 'SAN PABLO', 'VICTORIA']
    fourth_district = ['CAVINTI', 'FAMY', 'KALAYAAN', 'LUISIANA', 'LUMBAN', 'MABITAC', 'MAGDALENA', 
                       'MAJAYJAY', 'PAETE', 'PAGSANJAN', 'PAKIL', 'PANGIL', 'PILA', 'SANTA CRUZ', 
                       'SANTA MARIA', 'SINILOAN']
    lone_district = ['BIÑAN', 'CALAMBA', 'SANTA ROSA']
    
    if city in first_district:
        return 'First District'
    elif city in second_district:
        return 'Second District'
    elif city in third_district:
        return 'Third District'
    elif city in fourth_district:
        return 'Fourth District'
    elif city in lone_district:
        return 'Lone District'
    else:
        return 'Unknown'

@router.get("/highest-growth-district")
async def get_highest_growth_district():
    try:
        # Check if DataFrame exists
        if "current_df" not in global_data or global_data["current_df"] is None:
            raise HTTPException(status_code=400, detail="No data available. Please upload a file first.")

        # Get the stored DataFrame
        df = global_data["current_df"].copy()

        # Validate DataFrame
        if df.empty:
            raise HTTPException(status_code=400, detail="DataFrame is empty.")

        # Validate required columns
        required_columns = ['MUNICIPALITY/CITY', 'DATE RECEIVED (MM/DD/YYYY)']
        if not all(col in df.columns for col in required_columns):
            raise HTTPException(status_code=400, detail="Required columns are missing.")

        # Handle missing or invalid data
        df = df.dropna(subset=required_columns)
        if df.empty:
            raise HTTPException(status_code=400, detail="No valid data after removing missing values.")

        # Convert MUNICIPALITY/CITY to uppercase
        df['MUNICIPALITY/CITY'] = df['MUNICIPALITY/CITY'].str.upper()

        # Validate MUNICIPALITY/CITY
        valid_cities = ['SAN PEDRO', 'BAY', 'CABUYAO', 'LOS BAÑOS', 'ALAMINOS', 'CALAUAN', 'LILIW', 
                        'NAGCARLAN', 'RIZAL', 'SAN PABLO', 'VICTORIA', 'CAVINTI', 'FAMY', 'KALAYAAN', 
                        'LUISIANA', 'LUMBAN', 'MABITAC', 'MAGDALENA', 'MAJAYJAY', 'PAETE', 'PAGSANJAN', 
                        'PAKIL', 'PANGIL', 'PILA', 'SANTA CRUZ', 'SANTA MARIA', 'SINILOAN', 'BIÑAN', 
                        'CALAMBA', 'SANTA ROSA']
        invalid_cities = df[~df['MUNICIPALITY/CITY'].isin(valid_cities)]['MUNICIPALITY/CITY'].unique()
        if len(invalid_cities) > 0:
            raise HTTPException(status_code=400, detail=f"Invalid cities found: {invalid_cities}")

        # Convert DATE RECEIVED to datetime and extract year
        df['DATE RECEIVED'] = pd.to_datetime(df['DATE RECEIVED (MM/DD/YYYY)'], format='%m/%d/%Y', errors='coerce')
        if df['DATE RECEIVED'].isna().any():
            raise HTTPException(status_code=400, detail="Some dates in 'DATE RECEIVED' are invalid.")
        df['YEAR'] = df['DATE RECEIVED'].dt.year

        # Assign districts
        df['DISTRICT'] = df.apply(assign_district, axis=1)

        # Check for 'Unknown' district
        if 'Unknown' in df['DISTRICT'].values:
            unknown_cities = df[df['DISTRICT'] == 'Unknown']['MUNICIPALITY/CITY'].unique()
            raise HTTPException(status_code=400, detail=f"Unknown cities found: {unknown_cities}")

        # Group by year and district, count beneficiaries
        counts = df.groupby(['YEAR', 'DISTRICT']).size().unstack(fill_value=0)

        # Calculate total counts per year
        yearly_totals = counts.sum(axis=1)

        # Calculate percentages for each district per year
        percentages = (counts.div(yearly_totals, axis=0) * 100).round(2)

        # Convert counts and percentages to dictionary for JSON response
        counts_dict = counts.to_dict(orient='index')
        percentages_dict = percentages.to_dict(orient='index')
        counts_by_year = {
            str(year): {
                district: {"count": int(count), "percent": float(percentages_dict[year][district])}
                for district, count in districts.items()
            }
            for year, districts in counts_dict.items()
        }

        # Calculate year-over-year growth rates
        growth_rates = counts.pct_change() * 100  # Returns growth rate as percentage
        growth_rates = growth_rates.round(2)  # Round to 2 decimal places

        # Replace inf/-inf with None (happens when dividing by 0)
        growth_rates = growth_rates.replace([float('inf'), -float('inf')], None)

        # Find the district with the highest growth rate each year
        highest_growth = []
        for year in growth_rates.index:
            if year == counts.index[0]:  # Skip first year (no previous year for growth)
                continue
            year_data = growth_rates.loc[year]
            max_district = year_data.idxmax()
            max_growth = year_data.max()
            if pd.notna(max_growth):
                highest_growth.append({
                    "year": int(year),
                    "district": max_district,
                    "growth_rate_percent": max_growth
                })

        # Get total beneficiaries
        total_beneficiaries = len(df)

        return {
            "message": "Highest district growth per year with counts and percentages",
            "total_beneficiaries": total_beneficiaries,
            "highest_growth_by_year": highest_growth,
            "counts_by_year": counts_by_year
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error processing data: {str(e)}")

def process_dataframe(df: pd.DataFrame) -> pd.DataFrame:
    """Process raw DataFrame to monthly exclusive household counts."""
    df['DATE RECEIVED (MM/DD/YYYY)'] = pd.to_datetime(df['DATE RECEIVED (MM/DD/YYYY)'])
    df['ds'] = df['DATE RECEIVED (MM/DD/YYYY)'].dt.to_period('M').dt.to_timestamp()
    per_month_df = df.groupby('ds')['HOUSEHOLD ID'].nunique().reset_index()
    per_month_df.columns = ['ds', 'y']
    return per_month_df

@router.post("/forecast")
async def forecast_beneficiary():
    try:
        if "current_df" not in global_data:
            raise HTTPException(status_code=400, detail="No file uploaded. Please upload a file first.")

        df = global_data["current_df"]

        # Process DataFrame to get monthly row counts (total beneficiaries)
        df['DATE RECEIVED'] = pd.to_datetime(df['DATE RECEIVED (MM/DD/YYYY)'], format='%m/%d/%Y', errors='coerce')
        if df['DATE RECEIVED'].isna().any():
            raise HTTPException(status_code=400, detail="Some dates in 'DATE RECEIVED' are invalid.")
        
        df['ds'] = df['DATE RECEIVED'].dt.to_period('M').dt.to_timestamp()
        per_month_df = df.groupby('ds').size().reset_index(name='y')
        per_month_df.columns = ['ds', 'y']
        
        if 'ds' not in per_month_df.columns or 'y' not in per_month_df.columns:
            raise HTTPException(status_code=400, detail="Processed DataFrame must contain 'ds' (date) and 'y' (beneficiaries) columns")

        per_month_df['ds'] = pd.to_datetime(per_month_df['ds'])

        # Initialize Prophet model
        model = Prophet(yearly_seasonality=True, weekly_seasonality=False, daily_seasonality=False)
        model.add_seasonality(name='monthly', period=30.42, fourier_order=5)
        model.fit(per_month_df)

        # Create future dataframe for only the next month
        future = model.make_future_dataframe(periods=1, freq='MS')
        forecast = model.predict(future)

        # Get current month data
        latest_date = per_month_df['ds'].max()
        current_month = latest_date.strftime('%B %Y')
        current_count = per_month_df[per_month_df['ds'] == latest_date]['y'].iloc[0]

        # Get next month forecast
        forecast = forecast[forecast['ds'] > latest_date][['ds', 'yhat']]
        next_month = forecast['ds'].iloc[0].strftime('%B %Y')
        next_count = round(forecast['yhat'].iloc[0])

        # Get past 4 months' data (excluding current month)
        past_months = []
        for i in range(1, 13):  # Start from 1 to skip current month
            month_date = latest_date - pd.offsets.MonthBegin(i)
            month_data = per_month_df[per_month_df['ds'] == month_date]
            if not month_data.empty:
                past_months.append({
                    "name": month_date.strftime('%B %Y'),
                    "count": int(month_data['y'].iloc[0])
                })
        past_months = past_months[::-1]  # Reverse to show oldest to newest

        # Calculate total for 2025 (current year)
        current_year = 2025
        # Get actual data for 2025 up to latest date
        current_year_df = per_month_df[per_month_df['ds'].dt.year == current_year]
        total_current_year_actual = current_year_df['y'].sum()

        # Forecast remaining months of 2025
        months_to_end = 12 - latest_date.month  # Months from next month to December
        if months_to_end > 0:
            future_2025 = model.make_future_dataframe(periods=months_to_end, freq='MS')
            forecast_2025 = model.predict(future_2025)
            # Filter for future dates in 2025
            forecast_2025 = forecast_2025[(forecast_2025['ds'] > latest_date) & 
                                        (forecast_2025['ds'].dt.year == current_year)][['ds', 'yhat']]
            total_current_year_forecast = round(forecast_2025['yhat'].sum())
        else:
            total_current_year_forecast = 0  # No future months to forecast

        # Total for 2025 = actual (Jan to latest) + forecast (remaining months)
        total_2025 = total_current_year_actual + total_current_year_forecast

        return {
            "message": "Next month forecast generated successfully",
            "current_month": {
                "name": current_month,
                "count": int(current_count)
            },
            "next_month": {
                "name": next_month,
                "forecast": int(next_count)
            },
            "past_months": past_months,
            "yearly_total": {
                "year": current_year,
                "total_forecast": int(total_2025),
                "actual_until": current_month,
                "actual_count": int(total_current_year_actual),
                "forecasted_count": int(total_current_year_forecast)
            }
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating forecast: {str(e)}")

@router.post("/forecast_by_category")
async def forecast_by_category():
    try:
        if "current_df" not in global_data:
            raise HTTPException(status_code=400, detail="No file uploaded. Please upload a file first.")

        df = global_data["current_df"]
        df['category'] = df.apply(assign_category, axis=1)
        categories = df['category'].unique()

        results = []

        for category in categories:
            # Filter DataFrame for the specific category
            category_df = df[df['category'] == category]
            
            # Process DataFrame to get monthly row counts (total beneficiaries)
            category_df['DATE RECEIVED'] = pd.to_datetime(category_df['DATE RECEIVED (MM/DD/YYYY)'], format='%m/%d/%Y', errors='coerce')
            if category_df['DATE RECEIVED'].isna().any():
                continue  # Skip category if dates are invalid
            
            category_df['ds'] = category_df['DATE RECEIVED'].dt.to_period('M').dt.to_timestamp()
            per_month_df = category_df.groupby('ds').size().reset_index(name='y')
            per_month_df.columns = ['ds', 'y']
            
            if per_month_df.empty or 'ds' not in per_month_df.columns or 'y' not in per_month_df.columns:
                continue  # Skip if no data for this category

            per_month_df['ds'] = pd.to_datetime(per_month_df['ds'])

            # Initialize Prophet model
            model = Prophet(yearly_seasonality=True, weekly_seasonality=False, daily_seasonality=False)
            model.add_seasonality(name='monthly', period=30.42, fourier_order=5)
            model.fit(per_month_df)

            # Create future dataframe for only the next month
            future = model.make_future_dataframe(periods=1, freq='MS')
            forecast = model.predict(future)

            # Get current month data
            latest_date = per_month_df['ds'].max()
            current_month = latest_date.strftime('%B %Y')
            current_count = per_month_df[per_month_df['ds'] == latest_date]['y'].iloc[0]

            # Get next month forecast
            forecast = forecast[forecast['ds'] > latest_date][['ds', 'yhat']]
            next_month = forecast['ds'].iloc[0].strftime('%B %Y')
            next_count = round(forecast['yhat'].iloc[0])

            results.append({
                "category": category,
                "current_month": {
                    "name": current_month,
                    "count": int(current_count)
                },
                "next_month": {
                    "name": next_month,
                    "forecast": int(next_count)
                }
            })

        return {
            "message": "Next month forecasts by category generated successfully",
            "forecasts": results
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating category forecasts: {str(e)}")

async def get_regional_distribution():
    ...
async def get_anomaly_detection():
    ...
async def get_feature_importance():
    ...

def convert_to_python_types(obj):
    """Recursively convert NumPy types to Python native types."""
    if isinstance(obj, np.integer):
        return int(obj)
    elif isinstance(obj, np.floating):
        return float(obj)
    elif isinstance(obj, np.ndarray):
        return obj.tolist()
    elif isinstance(obj, dict):
        return {key: convert_to_python_types(value) for key, value in obj.items()}
    elif isinstance(obj, list):
        return [convert_to_python_types(item) for item in obj]
    return obj

@router.post("/historical_trends_forecast_category")
async def historical_trends_forecast_category():
    try:
        # Check global_data
        if "current_df" not in global_data or global_data["current_df"] is None:
            raise HTTPException(status_code=400, detail="No file uploaded. Please upload a file first.")

        df = global_data["current_df"].copy()

        # Validate DataFrame integrity
        if df.empty:
            raise HTTPException(status_code=400, detail="DataFrame is empty after loading.")
        if not isinstance(df, pd.DataFrame):
            raise HTTPException(status_code=500, detail="Loaded data is not a valid pandas DataFrame.")

        print(f"DataFrame shape: {df.shape}")
        print(f"Columns: {df.columns.tolist()}")

        # Validate required columns
        required_columns = ['DATE RECEIVED (MM/DD/YYYY)']
        if not all(col in df.columns for col in required_columns):
            raise HTTPException(status_code=400, detail=f"Required columns are missing: {required_columns}")

        # Handle missing data
        df = df.dropna(subset=required_columns)
        if df.empty:
            raise HTTPException(status_code=400, detail="No valid data after removing missing values.")

        # Parse dates and filter future ones
        df['DATE RECEIVED'] = pd.to_datetime(df['DATE RECEIVED (MM/DD/YYYY)'], format='%m/%d/%Y', errors='coerce')
        df = df[df['DATE RECEIVED'].notna()]
        today = pd.Timestamp.today()
        df = df[df['DATE RECEIVED'] <= today]
        print(f"Shape after date filtering: {df.shape}")
        print(f"Invalid dates dropped: {df['DATE RECEIVED'].isna().sum()}")

        if df.empty:
            raise HTTPException(status_code=400, detail="All dates are invalid or in the future.")

        df['ds'] = df['DATE RECEIVED'].dt.to_period('M').dt.to_timestamp()
        df['YEAR'] = df['DATE RECEIVED'].dt.year
        print(f"Unique months: {df['ds'].nunique()}")

        # Assign categories
        try:
            df['category'] = df.apply(assign_category, axis=1)
            if df['category'].isna().any():
                raise HTTPException(status_code=400, detail="NaN categories detected after assign_category.")
            print("Category counts:\n", df['category'].value_counts(dropna=False).to_dict())
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error in assign_category: {str(e)}")

        # Validate categories
        valid_categories = [
            'Community Development & Welfare',
            'Educational & Financial Assistance',
            'Food & Emergency Aid',
            'Livelihood & Employment Support',
            'Medical & Health Services'
        ]
        invalid_categories = df[~df['category'].isin(valid_categories)]['category'].unique()
        if len(invalid_categories) > 0:
            raise HTTPException(status_code=400, detail=f"Invalid categories found: {invalid_categories}")

        counts_by_year = {}
        latest_date = df['ds'].max()
        current_year = latest_date.year
        latest_month = latest_date.month
        print(f"Current year: {current_year}, Latest month: {latest_month}")

        # Historical counts
        historical_years = df[df['YEAR'] < current_year]['YEAR'].unique()
        for year in sorted(historical_years):
            year_df = df[df['YEAR'] == year]
            counts = year_df.groupby('category').size().to_dict()
            counts_by_year[str(year)] = {cat: int(counts.get(cat, 0)) for cat in valid_categories}

        # Monthly aggregate
        per_month_df = df.groupby('ds').size().reset_index(name='y')
        per_month_df.columns = ['ds', 'y']
        per_month_df['ds'] = pd.to_datetime(per_month_df['ds'])
        print(f"Aggregated data shape: {per_month_df.shape}")

        if per_month_df.empty or 'ds' not in per_month_df.columns or 'y' not in per_month_df.columns:
            raise HTTPException(status_code=400, detail="Processed DataFrame must contain 'ds' and 'y' columns")

        per_month_df = per_month_df.drop_duplicates(subset=['ds'])
        if per_month_df['y'].le(0).any():
            raise HTTPException(status_code=400, detail="Beneficiary counts must be positive.")

        # Fallback for insufficient data
        if len(per_month_df) < 2:
            historical_avg = int(df.groupby('category').size().mean()) if not df.empty else 0
            forecast_current_year = {cat: historical_avg for cat in valid_categories}
            counts_by_year[str(current_year)] = forecast_current_year
            result = {
                "message": f"Historical trends and {current_year} forecast by category generated using historical average due to insufficient data",
                "counts_by_year": counts_by_year
            }
            return convert_to_python_types(result)

        # Prophet model
        try:
            model = Prophet(yearly_seasonality=True, weekly_seasonality=False, daily_seasonality=False)
            model.add_seasonality(name='monthly', period=30.42, fourier_order=5)
            model.fit(per_month_df)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Prophet model fitting failed: {str(e)}")

        # Actuals this year
        current_year_df = per_month_df[per_month_df['ds'].dt.year == current_year]
        total_current_year_actual = int(current_year_df['y'].sum()) if not current_year_df.empty else 0
        print(f"Current year actual counts: {total_current_year_actual}")

        # Forecast remaining months
        months_to_end = 12 - latest_month
        total_current_year_forecast = 0
        if months_to_end > 0:
            try:
                future_current_year = model.make_future_dataframe(periods=months_to_end, freq='MS')
                forecast_data = model.predict(future_current_year)
                forecast_data = forecast_data[
                    (forecast_data['ds'] > latest_date) &
                    (forecast_data['ds'].dt.year == current_year)
                ][['ds', 'yhat']]
                if forecast_data.empty:
                    raise HTTPException(status_code=500, detail="Forecast data is empty. Check date coverage or model training.")
                total_current_year_forecast = int(round(forecast_data['yhat'].sum()))
                if total_current_year_forecast < 0:
                    total_current_year_forecast = 0
                print(f"Forecast for remaining months: {total_current_year_forecast}")
            except Exception as e:
                raise HTTPException(status_code=500, detail=f"Prophet forecasting failed: {str(e)}")

        total_current_year = total_current_year_actual + total_current_year_forecast
        print(f"Total current year forecast: {total_current_year}")

        # Forecast per category
        forecast_current_year = {}
        if total_current_year > 0:
            category_proportions = {}
            total_historical = 0
            for category in valid_categories:
                category_df = df[df['category'] == category]
                category_count = int(category_df.groupby('ds').size().sum())
                category_proportions[category] = category_count
                total_historical += category_count

            if total_historical > 0:
                for category in valid_categories:
                    proportion = category_proportions.get(category, 0) / total_historical
                    category_forecast = int(round(proportion * total_current_year))
                    forecast_current_year[category] = category_forecast
            else:
                equal_share = int(total_current_year // len(valid_categories))
                for category in valid_categories:
                    forecast_current_year[category] = equal_share
        else:
            for category in valid_categories:
                forecast_current_year[category] = 0

        # Adjust sum
        current_total = sum(forecast_current_year.values())
        if current_total != total_current_year and forecast_current_year:
            max_category = max(forecast_current_year, key=lambda x: forecast_current_year[x] if forecast_current_year[x] > 0 else -1)
            forecast_current_year[max_category] += total_current_year - current_total

        counts_by_year[str(current_year)] = forecast_current_year

        result = {
            "message": f"Historical trends and {current_year} full-year forecast by category generated successfully",
            "counts_by_year": counts_by_year
        }
        return convert_to_python_types(result)

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating category trends and forecast: {str(e)}")

@router.post("/historical_trends_forecast_district")
async def historical_trends_forecast_district():
    try:
        if "current_df" not in global_data or global_data["current_df"] is None:
            raise HTTPException(status_code=400, detail="No file uploaded. Please upload a file first.")

        df = global_data["current_df"].copy()

        if df.empty:
            raise HTTPException(status_code=400, detail="DataFrame is empty.")

        required_columns = ['DATE RECEIVED (MM/DD/YYYY)', 'MUNICIPALITY/CITY']
        if not all(col in df.columns for col in required_columns):
            raise HTTPException(status_code=400, detail="Required columns are missing.")

        df = df.dropna(subset=required_columns)
        if df.empty:
            raise HTTPException(status_code=400, detail="No valid data after removing missing values.")

        df['MUNICIPALITY/CITY'] = df['MUNICIPALITY/CITY'].str.upper()

        df['DATE RECEIVED'] = pd.to_datetime(df['DATE RECEIVED (MM/DD/YYYY)'], format='%m/%d/%Y', errors='coerce')
        if df['DATE RECEIVED'].isna().all():
            raise HTTPException(status_code=400, detail="All dates in 'DATE RECEIVED' are invalid.")
        if df['DATE RECEIVED'].isna().any():
            df = df.dropna(subset=['DATE RECEIVED'])

        df['ds'] = df['DATE RECEIVED'].dt.to_period('M').dt.to_timestamp()
        df['YEAR'] = df['DATE RECEIVED'].dt.year

        try:
            df['DISTRICT'] = df.apply(assign_district, axis=1)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error in assign_district: {str(e)}")

        valid_districts = ['First District', 'Second District', 'Third District', 'Fourth District', 'Lone District']
        if 'Unknown' in df['DISTRICT'].values:
            unknown_cities = df[df['DISTRICT'] == 'Unknown']['MUNICIPALITY/CITY'].unique()
            raise HTTPException(status_code=400, detail=f"Unknown cities found: {unknown_cities}")
        invalid_districts = df[~df['DISTRICT'].isin(valid_districts)]['DISTRICT'].unique()
        if len(invalid_districts) > 0:
            raise HTTPException(status_code=400, detail=f"Invalid districts found: {invalid_districts}")

        counts_by_year = {}

        latest_date = df['ds'].max()
        if pd.isna(latest_date):
            raise HTTPException(status_code=400, detail="No valid dates found in data.")
        latest_year = latest_date.year
        latest_month = latest_date.month

        historical_years = df[df['YEAR'] < latest_year]['YEAR'].unique()
        for year in sorted(historical_years):
            year_df = df[df['YEAR'] == year]
            counts = year_df.groupby('DISTRICT').size().to_dict()
            counts_by_year[str(year)] = {dist: {"count": int(counts.get(dist, 0))} for dist in valid_districts}

        per_month_df = df.groupby('ds').size().reset_index(name='y')
        per_month_df.columns = ['ds', 'y']
        per_month_df['ds'] = pd.to_datetime(per_month_df['ds'])

        if per_month_df.empty or 'ds' not in per_month_df.columns or 'y' not in per_month_df.columns:
            raise HTTPException(status_code=400, detail="Processed DataFrame must contain 'ds' and 'y' columns")

        per_month_df = per_month_df.drop_duplicates(subset=['ds'], keep='first')
        if per_month_df['y'].le(0).any():
            raise HTTPException(status_code=400, detail="Beneficiary counts must be positive.")
        if len(per_month_df) < 2:
            raise HTTPException(status_code=400, detail="Insufficient data for forecasting (need at least 2 months).")

        try:
            model = Prophet(yearly_seasonality=True, weekly_seasonality=False, daily_seasonality=False)
            model.add_seasonality(name='monthly', period=30.42, fourier_order=5)
            model.fit(per_month_df)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Prophet model fitting failed: {str(e)}")

        latest_year_df = per_month_df[per_month_df['ds'].dt.year == latest_year]
        total_existing = latest_year_df['y'].sum() if not latest_year_df.empty else 0

        months_to_end = 12 - latest_month
        total_forecast = 0
        if months_to_end > 0:
            try:
                future_latest_year = model.make_future_dataframe(periods=months_to_end, freq='MS')
                forecast_data = model.predict(future_latest_year)
                forecast_data = forecast_data[(forecast_data['ds'] > latest_date) & 
                                             (forecast_data['ds'].dt.year == latest_year)][['ds', 'yhat']]
                total_forecast = round(forecast_data['yhat'].sum())
                if total_forecast < 0:
                    total_forecast = 0
            except Exception as e:
                raise HTTPException(status_code=500, detail=f"Prophet forecasting failed: {str(e)}")

        total_latest_year = total_existing + total_forecast

        forecast_latest_year = {}
        if total_latest_year > 0:
            district_proportions = {}
            total_historical = 0
            for district in valid_districts:
                district_df = df[df['DISTRICT'] == district]
                district_count = district_df.groupby('ds').size().sum()
                district_proportions[district] = district_count
                total_historical += district_count

            if total_historical > 0:
                for district in valid_districts:
                    proportion = district_proportions.get(district, 0) / total_historical
                    district_forecast = round(proportion * total_latest_year)
                    forecast_latest_year[district] = int(district_forecast)
            else:
                equal_share = total_latest_year // len(valid_districts)
                for district in valid_districts:
                    forecast_latest_year[district] = equal_share
        else:
            for district in valid_districts:
                forecast_latest_year[district] = 0

        current_total = sum(forecast_latest_year.values())
        if current_total != total_latest_year and forecast_latest_year:
            max_district = max(forecast_latest_year, key=lambda x: forecast_latest_year[x] if forecast_latest_year[x] > 0 else -1)
            forecast_latest_year[max_district] += total_latest_year - current_total

        counts_by_year[str(latest_year)] = {dist: {"count": count} for dist, count in forecast_latest_year.items()}

        return {
            "message": f"Historical trends and {latest_year} full-year forecast by district generated successfully",
            "counts_by_year": counts_by_year
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating district trends and forecast: {str(e)}")