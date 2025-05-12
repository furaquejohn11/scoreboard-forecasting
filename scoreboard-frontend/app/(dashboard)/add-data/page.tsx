'use client';

import { DynamicForm } from "@/components/dynamic-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AddDataPage() {
  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Add New Records</CardTitle>
          <CardDescription>
            Add new data entries to the existing dataset. Fill in all required fields below.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DynamicForm 
            onDataAdded={() => {
              // You can add additional logic here, like refreshing the data table
              console.log('Data added successfully');
            }} 
          />
        </CardContent>
      </Card>
    </div>
  );
} 