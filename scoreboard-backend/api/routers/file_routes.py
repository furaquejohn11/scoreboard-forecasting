from fastapi import APIRouter, UploadFile, File, HTTPException
import pandas as pd
from typing import Dict
from api.services.file_service import FileService

router = APIRouter()
file_repository = FileService()

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
        file_repository.validate_file_type(file.filename)
        content = await file.read()
        df = file_repository.read_excel_file(content, file.filename)
        file_repository.set_current_dataframe(df)
        return {"filename": file.filename, "message": "File uploaded successfully", "row_count": len(df)}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error reading file: {str(e)}")

@router.get("/total-beneficiaries")
async def get_total_beneficiaries():
    try:
        df = file_repository.get_current_dataframe()
        file_repository.validate_dataframe(df)
        
        df = file_repository.process_dates(df)
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
        df = file_repository.get_current_dataframe()
        file_repository.validate_dataframe(df)
        file_repository.validate_required_columns(df, ['SOCIAL SERVICE / PROGRAM', 'DATE RECEIVED (MM/DD/YYYY)'])

        df = df.dropna(subset=['SOCIAL SERVICE / PROGRAM', 'DATE RECEIVED (MM/DD/YYYY)'])
        if df.empty:
            raise HTTPException(status_code=400, detail="No valid data after removing missing values.")

        valid_programs = ['LIVELIHOOD_ASSISTANCE', 'KALAHI', 'MEDICAL_SERVICES', 'SUPPLEMENTAL_FEEDING',
                         'OTHER_PROGRAM', 'DISASTER_RELIEF_ASSISTANCE', 'OTHER_CAPABILITY_BUILDING_SUPPORT',
                         'SOCIAL_PENSION', 'PWD_ASSISTANCE', 'EDUCATIONAL_ASSISTANCE', 'AICS', 'SLP']
        invalid_programs = df[~df['SOCIAL SERVICE / PROGRAM'].isin(valid_programs)]['SOCIAL SERVICE / PROGRAM'].unique()
        if len(invalid_programs) > 0:
            raise HTTPException(status_code=400, detail=f"Invalid programs found: {invalid_programs}")

        df = file_repository.process_dates(df)
        df['CATEGORY'] = df.apply(assign_category, axis=1)

        if 'Unknown' in df['CATEGORY'].values:
            unknown_programs = df[df['CATEGORY'] == 'Unknown']['SOCIAL SERVICE / PROGRAM'].unique()
            raise HTTPException(status_code=400, detail=f"Unknown programs found: {unknown_programs}")

        counts = df.groupby(['YEAR', 'CATEGORY']).size().unstack(fill_value=0)
        counts_dict = counts.to_dict(orient='index')
        counts_by_year = {str(year): {category: int(count) for category, count in categories.items()}
                         for year, categories in counts_dict.items()}

        growth_rates = counts.pct_change() * 100
        growth_rates = growth_rates.round(2)
        growth_rates = growth_rates.replace([float('inf'), -float('inf')], None)

        highest_growth = []
        for year in growth_rates.index:
            if year == counts.index[0]:
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
        df = file_repository.get_current_dataframe()
        file_repository.validate_dataframe(df)
        file_repository.validate_required_columns(df, ['MUNICIPALITY/CITY', 'DATE RECEIVED (MM/DD/YYYY)'])

        df = df.dropna(subset=['MUNICIPALITY/CITY', 'DATE RECEIVED (MM/DD/YYYY)'])
        if df.empty:
            raise HTTPException(status_code=400, detail="No valid data after removing missing values.")

        df['MUNICIPALITY/CITY'] = df['MUNICIPALITY/CITY'].str.upper()

        valid_cities = ['SAN PEDRO', 'BAY', 'CABUYAO', 'LOS BAÑOS', 'ALAMINOS', 'CALAUAN', 'LILIW', 
                        'NAGCARLAN', 'RIZAL', 'SAN PABLO', 'VICTORIA', 'CAVINTI', 'FAMY', 'KALAYAAN', 
                        'LUISIANA', 'LUMBAN', 'MABITAC', 'MAGDALENA', 'MAJAYJAY', 'PAETE', 'PAGSANJAN', 
                        'PAKIL', 'PANGIL', 'PILA', 'SANTA CRUZ', 'SANTA MARIA', 'SINILOAN', 'BIÑAN', 
                        'CALAMBA', 'SANTA ROSA']
        invalid_cities = df[~df['MUNICIPALITY/CITY'].isin(valid_cities)]['MUNICIPALITY/CITY'].unique()
        if len(invalid_cities) > 0:
            raise HTTPException(status_code=400, detail=f"Invalid cities found: {invalid_cities}")

        df = file_repository.process_dates(df)
        df['DISTRICT'] = df.apply(assign_district, axis=1)

        valid_districts = ['First District', 'Second District', 'Third District', 'Fourth District', 'Lone District']
        if 'Unknown' in df['DISTRICT'].values:
            unknown_cities = df[df['DISTRICT'] == 'Unknown']['MUNICIPALITY/CITY'].unique()
            raise HTTPException(status_code=400, detail=f"Unknown cities found: {unknown_cities}")

        counts = df.groupby(['YEAR', 'DISTRICT']).size().unstack(fill_value=0)
        yearly_totals = counts.sum(axis=1)
        percentages = (counts.div(yearly_totals, axis=0) * 100).round(2)

        counts_dict = counts.to_dict(orient='index')
        percentages_dict = percentages.to_dict(orient='index')
        counts_by_year = {
            str(year): {
                district: {"count": int(count), "percent": float(percentages_dict[year][district])}
                for district, count in districts.items()
            }
            for year, districts in counts_dict.items()
        }

        growth_rates = counts.pct_change() * 100
        growth_rates = growth_rates.round(2)
        growth_rates = growth_rates.replace([float('inf'), -float('inf')], None)

        highest_growth = []
        for year in growth_rates.index:
            if year == counts.index[0]:
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

        total_beneficiaries = len(df)

        return {
            "message": "Highest district growth per year with counts and percentages",
            "total_beneficiaries": total_beneficiaries,
            "highest_growth_by_year": highest_growth,
            "counts_by_year": counts_by_year
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error processing data: {str(e)}")

@router.post("/forecast")
async def forecast_beneficiary():
    try:
        df = file_repository.get_current_dataframe()
        file_repository.validate_dataframe(df)
        
        df = file_repository.process_dates(df)
        per_month_df = file_repository.get_monthly_aggregate(df)
        
        if per_month_df.empty or 'ds' not in per_month_df.columns or 'y' not in per_month_df.columns:
            raise HTTPException(status_code=400, detail="Processed DataFrame must contain 'ds' and 'y' columns")

        model = file_repository.create_prophet_model(per_month_df)

        latest_date = per_month_df['ds'].max()
        current_month = latest_date.strftime('%B %Y')
        current_count = per_month_df[per_month_df['ds'] == latest_date]['y'].iloc[0]

        forecast = file_repository.forecast_future_months(model, latest_date, 1, latest_date.year)
        next_month = forecast['ds'].iloc[0].strftime('%B %Y')
        next_count = round(forecast['yhat'].iloc[0])

        past_months = []
        for i in range(1, 13):
            month_date = latest_date - pd.offsets.MonthBegin(i)
            month_data = per_month_df[per_month_df['ds'] == month_date]
            if not month_data.empty:
                past_months.append({
                    "name": month_date.strftime('%B %Y'),
                    "count": int(month_data['y'].iloc[0])
                })
        past_months = past_months[::-1]

        current_year = 2025
        current_year_df = per_month_df[per_month_df['ds'].dt.year == current_year]
        total_current_year_actual = current_year_df['y'].sum()

        months_to_end = 12 - latest_date.month
        if months_to_end > 0:
            forecast_2025 = file_repository.forecast_future_months(model, latest_date, months_to_end, current_year)
            total_current_year_forecast = round(forecast_2025['yhat'].sum())
        else:
            total_current_year_forecast = 0

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
        df = file_repository.get_current_dataframe()
        file_repository.validate_dataframe(df)
        
        df['category'] = df.apply(assign_category, axis=1)
        categories = df['category'].unique()

        results = []

        for category in categories:
            category_df = df[df['category'] == category]
            category_df = file_repository.process_dates(category_df)
            
            if category_df['DATE RECEIVED'].isna().any():
                continue
            
            per_month_df = file_repository.get_monthly_aggregate(category_df)
            
            if per_month_df.empty or 'ds' not in per_month_df.columns or 'y' not in per_month_df.columns:
                continue

            model = file_repository.create_prophet_model(per_month_df)

            latest_date = per_month_df['ds'].max()
            current_month = latest_date.strftime('%B %Y')
            current_count = per_month_df[per_month_df['ds'] == latest_date]['y'].iloc[0]

            forecast = file_repository.forecast_future_months(model, latest_date, 1, latest_date.year)
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

@router.post("/historical_trends_forecast_category")
async def historical_trends_forecast_category():
    try:
        df = file_repository.get_current_dataframe()
        file_repository.validate_dataframe(df)
        file_repository.validate_required_columns(df, ['DATE RECEIVED (MM/DD/YYYY)'])

        df = df.dropna(subset=['DATE RECEIVED (MM/DD/YYYY)'])
        if df.empty:
            raise HTTPException(status_code=400, detail="No valid data after removing missing values.")

        df = file_repository.process_dates(df)
        df['category'] = df.apply(assign_category, axis=1)

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

        historical_years = df[df['YEAR'] < current_year]['YEAR'].unique()
        for year in sorted(historical_years):
            year_df = df[df['YEAR'] == year]
            counts = year_df.groupby('category').size().to_dict()
            counts_by_year[str(year)] = {cat: int(counts.get(cat, 0)) for cat in valid_categories}

        per_month_df = file_repository.get_monthly_aggregate(df)

        if per_month_df.empty or 'ds' not in per_month_df.columns or 'y' not in per_month_df.columns:
            raise HTTPException(status_code=400, detail="Processed DataFrame must contain 'ds' and 'y' columns")

        per_month_df = per_month_df.drop_duplicates(subset=['ds'])
        if per_month_df['y'].le(0).any():
            raise HTTPException(status_code=400, detail="Beneficiary counts must be positive.")

        if len(per_month_df) < 2:
            historical_avg = int(df.groupby('category').size().mean()) if not df.empty else 0
            forecast_current_year = {cat: historical_avg for cat in valid_categories}
            counts_by_year[str(current_year)] = forecast_current_year
            result = {
                "message": f"Historical trends and {current_year} forecast by category generated using historical average due to insufficient data",
                "counts_by_year": counts_by_year
            }
            return file_repository.convert_to_python_types(result)

        model = file_repository.create_prophet_model(per_month_df)

        current_year_df = per_month_df[per_month_df['ds'].dt.year == current_year]
        total_current_year_actual = int(current_year_df['y'].sum()) if not current_year_df.empty else 0

        months_to_end = 12 - latest_month
        total_current_year_forecast = 0
        if months_to_end > 0:
            forecast_data = file_repository.forecast_future_months(model, latest_date, months_to_end, current_year)
            if forecast_data.empty:
                raise HTTPException(status_code=500, detail="Forecast data is empty. Check date coverage or model training.")
            total_current_year_forecast = int(round(forecast_data['yhat'].sum()))
            if total_current_year_forecast < 0:
                total_current_year_forecast = 0

        total_current_year = total_current_year_actual + total_current_year_forecast

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

        current_total = sum(forecast_current_year.values())
        if current_total != total_current_year and forecast_current_year:
            max_category = max(forecast_current_year, key=lambda x: forecast_current_year[x] if forecast_current_year[x] > 0 else -1)
            forecast_current_year[max_category] += total_current_year - current_total

        counts_by_year[str(current_year)] = forecast_current_year

        result = {
            "message": f"Historical trends and {current_year} full-year forecast by category generated successfully",
            "counts_by_year": counts_by_year
        }
        return file_repository.convert_to_python_types(result)

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating category trends and forecast: {str(e)}")

@router.post("/historical_trends_forecast_district")
async def historical_trends_forecast_district():
    try:
        df = file_repository.get_current_dataframe()
        file_repository.validate_dataframe(df)
        file_repository.validate_required_columns(df, ['DATE RECEIVED (MM/DD/YYYY)', 'MUNICIPALITY/CITY'])

        df = df.dropna(subset=['DATE RECEIVED (MM/DD/YYYY)', 'MUNICIPALITY/CITY'])
        if df.empty:
            raise HTTPException(status_code=400, detail="No valid data after removing missing values.")

        df['MUNICIPALITY/CITY'] = df['MUNICIPALITY/CITY'].str.upper()

        df = file_repository.process_dates(df)
        df['DISTRICT'] = df.apply(assign_district, axis=1)

        valid_districts = ['First District', 'Second District', 'Third District', 'Fourth District', 'Lone District']
        if 'Unknown' in df['DISTRICT'].values:
            unknown_cities = df[df['DISTRICT'] == 'Unknown']['MUNICIPALITY/CITY'].unique()
            raise HTTPException(status_code=400, detail=f"Unknown cities found: {unknown_cities}")

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

        per_month_df = file_repository.get_monthly_aggregate(df)

        if per_month_df.empty or 'ds' not in per_month_df.columns or 'y' not in per_month_df.columns:
            raise HTTPException(status_code=400, detail="Processed DataFrame must contain 'ds' and 'y' columns")

        per_month_df = per_month_df.drop_duplicates(subset=['ds'], keep='first')
        if per_month_df['y'].le(0).any():
            raise HTTPException(status_code=400, detail="Beneficiary counts must be positive.")
        if len(per_month_df) < 2:
            raise HTTPException(status_code=400, detail="Insufficient data for forecasting (need at least 2 months).")

        model = file_repository.create_prophet_model(per_month_df)

        latest_year_df = per_month_df[per_month_df['ds'].dt.year == latest_year]
        total_existing = latest_year_df['y'].sum() if not latest_year_df.empty else 0

        months_to_end = 12 - latest_month
        total_forecast = 0
        if months_to_end > 0:
            forecast_data = file_repository.forecast_future_months(model, latest_date, months_to_end, latest_year)
            total_forecast = round(forecast_data['yhat'].sum())
            if total_forecast < 0:
                total_forecast = 0

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