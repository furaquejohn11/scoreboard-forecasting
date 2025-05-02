import { TotalBeneficiaries, BeneficiariesByYear, HighestGrowthDistrictResponse } from "./types";

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
        return {
          message: "Failed to fetch",
          total_beneficiaries: 0,
          beneficiaries_by_year: [],
        };
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

  export const getHighestGrowthDistrict = async (): Promise<HighestGrowthDistrictResponse> => {
    try {
      const response = await fetch(`${fileEndpoint}/highest-growth-district`, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      })
  
      if (!response.ok) {
        return {
          counts_by_year: {
            "2025": {},
          },
          highest_growth_by_year: [],
        }
      }
  
      const data: HighestGrowthDistrictResponse = await response.json()
      return data
    } catch (error) {
      console.error("Error fetching highest growth district:", error)
  
      // Return default fallback if fetch fails
      return {
        counts_by_year: {
          "2025": {},
        },
        highest_growth_by_year: [],
      }
    }
  }