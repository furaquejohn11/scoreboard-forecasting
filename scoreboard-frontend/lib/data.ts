import { TotalBeneficiaries, BeneficiariesByYear } from "./types";

const fileEndpoint = "http://127.0.0.1:8000/api/file";


export const getTotalBeneficiaries = async (): Promise<TotalBeneficiaries> => {
    try {
      const response = await fetch(`${fileEndpoint}/total-beneficiaries`, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      });
  
      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.statusText}`);
      }
  
      const data: TotalBeneficiaries = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching total beneficiaries:", error);
  
      // Return default values if fetch fails
      return {
        message: "Failed to fetch",
        total_beneficiaries: 0,
        beneficiaries_by_year: [],
      };
    }
  };