import pytest
import pandas as pd
import numpy as np
from fastapi import HTTPException
from datetime import datetime
from api.repositories.file_repository import FileRepository

@pytest.fixture
def file_repository():
    return FileRepository()

@pytest.fixture
def sample_csv_content():
    return b"""DATE RECEIVED (MM/DD/YYYY),SOCIAL SERVICE / PROGRAM,MUNICIPALITY/CITY
01/01/2023,LIVELIHOOD_ASSISTANCE,SAN PEDRO
02/01/2023,MEDICAL_SERVICES,BAY
03/01/2023,EDUCATIONAL_ASSISTANCE,CABUYAO"""

@pytest.fixture
def sample_dataframe():
    return pd.DataFrame({
        'DATE RECEIVED (MM/DD/YYYY)': ['01/01/2023', '02/01/2023', '03/01/2023'],
        'SOCIAL SERVICE / PROGRAM': ['LIVELIHOOD_ASSISTANCE', 'MEDICAL_SERVICES', 'EDUCATIONAL_ASSISTANCE'],
        'MUNICIPALITY/CITY': ['SAN PEDRO', 'BAY', 'CABUYAO']
    })

def test_validate_file_type_success(file_repository):
    # Test valid file types
    assert file_repository.validate_file_type('test.xlsx') is None
    assert file_repository.validate_file_type('test.xls') is None
    assert file_repository.validate_file_type('test.csv') is None

def test_validate_file_type_invalid(file_repository):
    # Test invalid file type
    with pytest.raises(HTTPException) as exc_info:
        file_repository.validate_file_type('test.txt')
    assert exc_info.value.status_code == 400
    assert "Only Excel (.xlsx, .xls) or CSV (.csv) files are supported" in exc_info.value.detail

def test_read_excel_file_csv(file_repository, sample_csv_content):
    # Test reading CSV file
    df = file_repository.read_excel_file(sample_csv_content, 'test.csv')
    assert isinstance(df, pd.DataFrame)
    assert len(df) == 3
    assert list(df.columns) == ['DATE RECEIVED (MM/DD/YYYY)', 'SOCIAL SERVICE / PROGRAM', 'MUNICIPALITY/CITY']

def test_validate_dataframe_success(file_repository, sample_dataframe):
    # Test valid DataFrame
    assert file_repository.validate_dataframe(sample_dataframe) is None

def test_validate_dataframe_empty(file_repository):
    # Test empty DataFrame
    with pytest.raises(HTTPException) as exc_info:
        file_repository.validate_dataframe(pd.DataFrame())
    assert exc_info.value.status_code == 400
    assert "DataFrame is empty" in exc_info.value.detail

def test_validate_required_columns_success(file_repository, sample_dataframe):
    # Test valid columns
    required_columns = ['DATE RECEIVED (MM/DD/YYYY)', 'SOCIAL SERVICE / PROGRAM']
    assert file_repository.validate_required_columns(sample_dataframe, required_columns) is None

def test_validate_required_columns_missing(file_repository, sample_dataframe):
    # Test missing columns
    with pytest.raises(HTTPException) as exc_info:
        file_repository.validate_required_columns(sample_dataframe, ['NONEXISTENT_COLUMN'])
    assert exc_info.value.status_code == 400
    assert "Required columns are missing" in exc_info.value.detail

def test_process_dates_success(file_repository, sample_dataframe):
    # Test date processing
    processed_df = file_repository.process_dates(sample_dataframe)
    assert 'DATE RECEIVED' in processed_df.columns
    assert 'ds' in processed_df.columns
    assert 'YEAR' in processed_df.columns
    assert all(isinstance(date, datetime) for date in processed_df['DATE RECEIVED'])

def test_process_dates_invalid(file_repository):
    # Test invalid dates
    invalid_df = pd.DataFrame({
        'DATE RECEIVED (MM/DD/YYYY)': ['invalid_date', '02/01/2023']
    })
    with pytest.raises(HTTPException) as exc_info:
        file_repository.process_dates(invalid_df)
    assert exc_info.value.status_code == 400
    assert "Some dates in 'DATE RECEIVED' are invalid" in exc_info.value.detail

def test_get_monthly_aggregate(file_repository, sample_dataframe):
    # Test monthly aggregation
    processed_df = file_repository.process_dates(sample_dataframe)
    monthly_df = file_repository.get_monthly_aggregate(processed_df)
    assert isinstance(monthly_df, pd.DataFrame)
    assert list(monthly_df.columns) == ['ds', 'y']
    assert len(monthly_df) > 0

def test_convert_to_python_types(file_repository):
    # Test type conversion
    test_data = {
        'int': np.int64(1),
        'float': np.float64(1.5),
        'array': np.array([1, 2, 3]),
        'nested': {
            'int': np.int64(2),
            'array': np.array([4, 5, 6])
        }
    }
    converted = file_repository.convert_to_python_types(test_data)
    assert isinstance(converted['int'], int)
    assert isinstance(converted['float'], float)
    assert isinstance(converted['array'], list)
    assert isinstance(converted['nested']['int'], int)
    assert isinstance(converted['nested']['array'], list) 