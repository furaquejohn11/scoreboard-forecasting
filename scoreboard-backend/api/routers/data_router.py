from fastapi import APIRouter, HTTPException, Depends
from typing import List, Dict, Any
from api.services.file_service import FileService
from pydantic import BaseModel

router = APIRouter(prefix="/data", tags=["data"])

class NewDataRequest(BaseModel):
    data: Dict[str, Any]

@router.get("/columns")
async def get_columns(file_service: FileService = Depends()):
    """Get column names from the current file."""
    try:
        columns = file_service.get_columns()
        return {"columns": columns}
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/add")
async def add_data(
    new_data: NewDataRequest,
    file_service: FileService = Depends()
):
    """Add new data to the current file."""
    try:
        updated_df = file_service.add_new_data(new_data.data)
        return {
            "message": "Data added successfully",
            "data": file_service.convert_to_python_types(updated_df.to_dict(orient='records'))
        }
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 