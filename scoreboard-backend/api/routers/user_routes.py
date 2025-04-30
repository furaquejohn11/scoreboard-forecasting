from fastapi import APIRouter, UploadFile, File, HTTPException
import pandas as pd
import io

router = APIRouter()

@router.post("/csv-row-count")
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
        raise HTTPException(status_code=400, detail=f"Error reading CSV file: {str(e)}")