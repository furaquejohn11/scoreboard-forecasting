'use client';

import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface DynamicFormProps {
  onDataAdded?: () => void;
}

interface ColumnConfig {
  name: string;
  type: 'text' | 'number' | 'date' | 'select';
  options?: string[];
  required?: boolean;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
}

export function DynamicForm({ onDataAdded }: DynamicFormProps) {
  const [columns, setColumns] = useState<ColumnConfig[]>([]);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isExcelNotAvailable, setIsExcelNotAvailable] = useState(false);
  const [isFetchingColumns, setIsFetchingColumns] = useState(true);

  useEffect(() => {
    fetchColumns();
  }, []);

  const getColumnType = (columnName: string): ColumnConfig => {
    const name = columnName.toLowerCase();
    
    // Date columns
    if (name.includes('date')) {
      return {
        name: columnName,
        type: 'date',
        required: true
      };
    }
    
    // Number columns
    if (name.includes('amount') || name.includes('age') || name.includes('count') || name.includes('number')) {
      return {
        name: columnName,
        type: 'number',
        required: true,
        validation: {
          min: 0
        }
      };
    }

    // Select columns (example for status or type fields)
    if (name.includes('status') || name.includes('type')) {
      return {
        name: columnName,
        type: 'select',
        options: ['Active', 'Inactive', 'Pending'], // This could be fetched from the backend
        required: true
      };
    }

    // Default to text
    return {
      name: columnName,
      type: 'text',
      required: true
    };
  };

  const fetchColumns = async () => {
    setIsFetchingColumns(true);
    try {
      const response = await fetch('http://localhost:8000/api/data/data/columns');
      if (!response.ok) {
        setIsExcelNotAvailable(true);
        return;
      }
      const data = await response.json();
      
      // Convert column names to ColumnConfig objects
      const columnConfigs = data.columns.map((col: string) => getColumnType(col));
      setColumns(columnConfigs);
      
      // Initialize form data with empty values
      const initialData = columnConfigs.reduce((acc: Record<string, string>, col: ColumnConfig) => {
        acc[col.name] = '';
        return acc;
      }, {});
      setFormData(initialData);
    } catch (error) {
      setIsExcelNotAvailable(true);
      console.error('Error fetching columns:', error);
    } finally {
      setIsFetchingColumns(false);
    }
  };

  const handleInputChange = (columnName: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [columnName]: value
    }));
  };

  const validateForm = (): boolean => {
    for (const column of columns) {
      const value = formData[column.name];
      
      // Check required fields
      if (column.required && !value) {
        toast.error(`${column.name} is required`);
        return false;
      }

      // Validate numbers
      if (column.type === 'number' && value) {
        const num = Number(value);
        if (isNaN(num)) {
          toast.error(`${column.name} must be a number`);
          return false;
        }
        if (column.validation?.min !== undefined && num < column.validation.min) {
          toast.error(`${column.name} must be greater than ${column.validation.min}`);
          return false;
        }
        if (column.validation?.max !== undefined && num > column.validation.max) {
          toast.error(`${column.name} must be less than ${column.validation.max}`);
          return false;
        }
      }
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:8000/api/data/data/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data: formData }),
      });

      if (!response.ok) {
        throw new Error('Failed to add data');
      }

      const result = await response.json();
      toast.success('Data added successfully');
      alert('Data added successfully');
      
      // Reset form
      const resetData = columns.reduce((acc: Record<string, string>, col: ColumnConfig) => {
        acc[col.name] = '';
        return acc;
      }, {});
      setFormData(resetData);

      // Notify parent component
      if (onDataAdded) {
        onDataAdded();
      }
    } catch (error) {
      toast.error('Failed to add data');
      console.error('Error adding data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderInput = (column: ColumnConfig) => {
    switch (column.type) {
      case 'date':
        return (
          <Input
            id={column.name}
            type="date"
            value={formData[column.name] || ''}
            onChange={(e) => handleInputChange(column.name, e.target.value)}
            required={column.required}
            className="w-full"
          />
        );
      
      case 'number':
        return (
          <Input
            id={column.name}
            type="number"
            value={formData[column.name] || ''}
            onChange={(e) => handleInputChange(column.name, e.target.value)}
            required={column.required}
            min={column.validation?.min}
            max={column.validation?.max}
            className="w-full"
          />
        );
      
      case 'select':
        return (
          <Select
            value={formData[column.name]}
            onValueChange={(value) => handleInputChange(column.name, value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder={`Select ${column.name}`} />
            </SelectTrigger>
            <SelectContent>
              {column.options?.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      
      default:
        return (
          <Input
            id={column.name}
            type="text"
            value={formData[column.name] || ''}
            onChange={(e) => handleInputChange(column.name, e.target.value)}
            required={column.required}
            className="w-full"
          />
        );
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Add New Data</h2>
      {isFetchingColumns ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading form structure...</p>
        </div>
      ) : columns.length === 0 ? (
        <div className="text-center py-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Data Upload Required</h3>
          <p className="text-gray-600 mb-4">Adding data is not possible at the moment because the Excel file has not been uploaded yet.</p>
          <p className="text-sm text-gray-500">Please upload your Excel file first to enable the data entry form.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {columns.map((column) => (
            <div key={column.name} className="space-y-2">
              <Label htmlFor={column.name}>
                {column.name}
                {column.required && <span className="text-red-500 ml-1">*</span>}
              </Label>
              {renderInput(column)}
            </div>
          ))}
          <Button 
            type="submit" 
            className="w-full mt-6"
            disabled={isLoading}
          >
            {isLoading ? 'Adding...' : 'Add Data'}
          </Button>
        </form>
      )}
    </div>
  );
} 