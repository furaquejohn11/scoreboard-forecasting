from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from typing import Annotated, List, Dict, Any
import pandas as pd
import io
import json
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import insert, select
from api.database.db import get_session, csv_data_table
from api.routers.user_routes import get_current_user
from api.entities import User

router = APIRouter()

@router.post("/csv-row-count")
async def count_csv_rows(
    file: Annotated[UploadFile, File(...)],
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
) -> dict:
    try:
        # Validate file extension
        if not file.filename.endswith('.csv'):
            raise HTTPException(status_code=400, detail="File must be a CSV")
        
        # Read the uploaded CSV file
        content = await file.read()
        csv_data = io.StringIO(content.decode('utf-8'))
        
        # Use pandas to read CSV and count rows
        df = pd.read_csv(csv_data)
        row_count = len(df)
        
        # Store each row in the database
        timestamp = datetime.now().isoformat()
        rows = [
            {
                "user_id": current_user.id,
                "filename": file.filename,
                "upload_timestamp": timestamp,
                "row_data": row.to_json(),
                "file_type": "csv"
            }
            for _, row in df.iterrows()
        ]
        session.execute(insert(csv_data_table), rows)
        session.commit()
        
        return {
            "filename": file.filename,
            "row_count": row_count
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error reading CSV file: {str(e)}")

# Placeholder function for reading Excel files (not implemented)
async def read_excel(file: UploadFile = File(...)):
    pass

@router.get("/total-beneficiaries")
async def get_total_beneficiaries(
    filename: str,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
) -> dict:
    try:
        # Fetch data for the given filename and user
        query = select(csv_data_table).where(
            csv_data_table.c.filename == filename,
            csv_data_table.c.user_id == current_user.id
        )
        rows = session.execute(query).fetchall()
        if not rows:
            raise HTTPException(status_code=404, detail=f"File {filename} not found")
        
        # Convert rows to DataFrame
        df = pd.DataFrame([json.loads(row.row_data) for row in rows])
        
        # Use 'score' instead of 'beneficiaries'
        if 'score' not in df.columns:
            raise HTTPException(status_code=400, detail="Data does not contain 'score' column")
        
        total = int(df['score'].sum())
        return {"filename": filename, "total_scores": total}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error calculating total scores: {str(e)}")

# Commented out due to missing 'category' column
# @router.get("/highest-growth-category")
# async def get_highest_growth_category(
#     filename: str,
#     current_user: User = Depends(get_current_user),
#     session: Session = Depends(get_session)
# ) -> dict:
#     try:
#         query = select(csv_data_table).where(
#             csv_data_table.c.filename == filename,
#             csv_data_table.c.user_id == current_user.id
#         )
#         rows = session.execute(query).fetchall()
#         if not rows:
#             raise HTTPException(status_code=404, detail=f"File {filename} not found")
#         
#         df = pd.DataFrame([json.loads(row.row_data) for row in rows])
#         
#         if 'category' not in df.columns or 'progress' not in df.columns:
#             raise HTTPException(status_code=400, detail="Data does not contain 'category' or 'progress' columns")
#         
#         growth_by_category = df.groupby('category')['progress'].mean().to_dict()
#         highest_category = max(growth_by_category, key=growth_by_category.get)
#         return {
#             "filename": filename,
#             "highest_growth_category": highest_category,
#             "growth": float(growth_by_category[highest_category])
#         }
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=f"Error calculating highest growth category: {str(e)}")

@router.get("/highest-growth-region")
async def get_highest_growth_region(
    filename: str,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
) -> dict:
    try:
        query = select(csv_data_table).where(
            csv_data_table.c.filename == filename,
            csv_data_table.c.user_id == current_user.id
        )
        rows = session.execute(query).fetchall()
        if not rows:
            raise HTTPException(status_code=404, detail=f"File {filename} not found")
        
        df = pd.DataFrame([json.loads(row.row_data) for row in rows])
        
        if 'area' not in df.columns or 'progress' not in df.columns:
            raise HTTPException(status_code=400, detail="Data does not contain 'area' or 'progress' columns")
        
        growth_by_region = df.groupby('area')['progress'].mean().to_dict()
        highest_region = max(growth_by_region, key=growth_by_region.get)
        return {
            "filename": filename,
            "highest_growth_region": highest_region,
            "growth": float(growth_by_region[highest_region])
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error calculating highest growth region: {str(e)}")

@router.get("/beneficiary-forecast")
async def get_beneficiary_forecast(
    filename: str,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
) -> dict:
    try:
        query = select(csv_data_table).where(
            csv_data_table.c.filename == filename,
            csv_data_table.c.user_id == current_user.id
        )
        rows = session.execute(query).fetchall()
        if not rows:
            raise HTTPException(status_code=404, detail=f"File {filename} not found")
        
        df = pd.DataFrame([json.loads(row.row_data) for row in rows])
        
        if 'date' not in df.columns or 'score' not in df.columns:
            raise HTTPException(status_code=400, detail="Data does not contain 'date' or 'score' columns")
        
        df['date'] = pd.to_datetime(df['date'])
        df = df.sort_values('date')
        df['daily_increase'] = df['score'].diff().fillna(0)
        avg_increase = df['daily_increase'].mean()
        last_score = df['score'].iloc[-1]
        forecast_next = last_score + avg_increase * 30
        
        return {
            "filename": filename,
            "last_score": int(last_score),
            "forecasted_score_30_days": int(forecast_next)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error calculating score forecast: {str(e)}")

@router.get("/regional-distribution")
async def get_regional_distribution(
    filename: str,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
) -> dict:
    try:
        query = select(csv_data_table).where(
            csv_data_table.c.filename == filename,
            csv_data_table.c.user_id == current_user.id
        )
        rows = session.execute(query).fetchall()
        if not rows:
            raise HTTPException(status_code=404, detail=f"File {filename} not found")
        
        df = pd.DataFrame([json.loads(row.row_data) for row in rows])
        
        if 'area' not in df.columns or 'score' not in df.columns:
            raise HTTPException(status_code=400, detail="Data does not contain 'area' or 'score' columns")
        
        distribution = df.groupby('area')['score'].sum().to_dict()
        return {
            "filename": filename,
            "regional_distribution": {region: int(value) for region, value in distribution.items()}
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error calculating regional distribution: {str(e)}")

@router.get("/anomaly-detection")
async def get_anomaly_detection(
    filename: str,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
) -> List[Dict[str, Any]]:
    try:
        query = select(csv_data_table).where(
            csv_data_table.c.filename == filename,
            csv_data_table.c.user_id == current_user.id
        )
        rows = session.execute(query).fetchall()
        if not rows:
            raise HTTPException(status_code=404, detail=f"File {filename} not found")
        
        df = pd.DataFrame([json.loads(row.row_data) for row in rows])
        
        if 'score' not in df.columns:
            raise HTTPException(status_code=400, detail="Data does not contain 'score' column")
        
        mean = df['score'].mean()
        std = df['score'].std()
        df['z_score'] = (df['score'] - mean) / std
        anomalies = df[df['z_score'].abs() > 2]
        
        return [
            {
                "row_index": int(index),
                "score": int(row['score']),
                "z_score": float(row['z_score'])
            }
            for index, row in anomalies.iterrows()
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error detecting anomalies: {str(e)}")

@router.get("/feature-importance")
async def get_feature_importance(
    filename: str,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
) -> dict:
    try:
        query = select(csv_data_table).where(
            csv_data_table.c.filename == filename,
            csv_data_table.c.user_id == current_user.id
        )
        rows = session.execute(query).fetchall()
        if not rows:
            raise HTTPException(status_code=404, detail=f"File {filename} not found")
        
        df = pd.DataFrame([json.loads(row.row_data) for row in rows])
        
        if 'score' not in df.columns:
            raise HTTPException(status_code=400, detail="Data does not contain 'score' column")
        
        numeric_cols = df.select_dtypes(include=['float64', 'int64']).columns
        if 'score' not in numeric_cols:
            raise HTTPException(status_code=400, detail="Score must be numeric")
        
        correlations = {col: float(df[col].corr(df['score'])) for col in numeric_cols if col != 'score'}
        return {
            "filename": filename,
            "feature_importance": correlations
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error calculating feature importance: {str(e)}")

@router.get("/historical-trends-forecast")
async def get_historical_trends_forecast(
    filename: str,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
) -> dict:
    try:
        query = select(csv_data_table).where(
            csv_data_table.c.filename == filename,
            csv_data_table.c.user_id == current_user.id
        )
        rows = session.execute(query).fetchall()
        if not rows:
            raise HTTPException(status_code=404, detail=f"File {filename} not found")
        
        df = pd.DataFrame([json.loads(row.row_data) for row in rows])
        
        if 'date' not in df.columns or 'score' not in df.columns:
            raise HTTPException(status_code=400, detail="Data does not contain 'date' or 'score' columns")
        
        df['date'] = pd.to_datetime(df['date'])
        df = df.sort_values('date')
        
        df['growth_rate'] = df['score'].pct_change().fillna(0)
        avg_growth_rate = df['growth_rate'].mean()
        last_score = df['score'].iloc[-1]
        forecast_next = last_score * (1 + avg_growth_rate) ** 30
        
        return {
            "filename": filename,
            "historical_avg_growth_rate": float(avg_growth_rate),
            "last_score": int(last_score),
            "forecasted_score_30_days": int(forecast_next)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error calculating historical trends forecast: {str(e)}")