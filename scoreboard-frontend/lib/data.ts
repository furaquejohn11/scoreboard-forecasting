import { TotalBeneficiaries, BeneficiariesByYear, HighestGrowthDistrictResponse, GrowthResponse } from "./types";

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

  export async function getLastYearHighestGrowthDistrict(): Promise<{
    year: number | "N/A";
    district: string;
    growthPercent: number;
  }> {
    const response = await fetch(`${fileEndpoint}/highest-growth-district`, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });
  
    if (!response.ok) {
      return {
        year: "N/A",
        district: "N/A",
        growthPercent: 0,
      };
    }
  
    const data: GrowthResponse = await response.json();
  
    const sorted = [...data.highest_growth_by_year].sort((a, b) => b.year - a.year);
    const latest = sorted[1];
  
    return {
      year: latest?.year ?? "N/A",
      district: latest?.district ?? "N/A",
      growthPercent: latest?.growth_rate_percent ?? 0,
    };
  }
  
  export async function getLastYearHighestGrowthCategory(): Promise<{
    year: number | "N/A";
    category: string;
    growthPercent: number;
    count: number;
  }> {
    const response = await fetch(`${fileEndpoint}/highest-category-growth`, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });
  
    if (!response.ok) {
      return {
        year: "N/A",
        category: "N/A",
        growthPercent: 0,
        count: 0,
      };
    }
  
    const data = await response.json();
  
    const highestGrowth = [...data.highest_growth_by_year].sort((a, b) => b.year - a.year)[1];
    const yearStr = highestGrowth.year.toString();
    const category = highestGrowth.category;
    const count = data.counts_by_year?.[yearStr]?.[category] ?? 0;
  
    return {
      year: highestGrowth.year,
      category,
      growthPercent: highestGrowth.growth_rate_percent,
      count,
    };
  }
  