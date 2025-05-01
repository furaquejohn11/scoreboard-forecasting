from fastapi import APIRouter, UploadFile, File, HTTPException
import pandas as pd
import io
from typing import Dict

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

        # Convert counts to dictionary for JSON response
        counts_dict = counts.to_dict(orient='index')
        counts_by_year = {str(year): {district: int(count) for district, count in districts.items()}
                         for year, districts in counts_dict.items()}

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
            "message": "Highest district growth per year with counts",
            "total_beneficiaries": total_beneficiaries,
            "highest_growth_by_year": highest_growth,
            "counts_by_year": counts_by_year
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error processing data: {str(e)}")
async def get_beneficiary_forecast():
    ...
async def get_regional_distribution():
    ...
async def get_anomaly_detection():
    ...
async def get_feature_importance():
    ...
async def get_historical_trends_forecast():
    ...