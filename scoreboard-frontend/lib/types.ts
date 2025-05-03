export interface TotalBeneficiaries {
    message: string
    total_beneficiaries: number
    beneficiaries_by_year: BeneficiariesByYear[]
}
  
export interface BeneficiariesByYear {
    YEAR: number
    BENEFICIARY_COUNT: number
}
export interface DistrictStats {
    count: number
    percent: number
  }
  
  export interface GrowthInsight {
    year: number
    district: string
    growth_rate_percent: number
  }
  
  export interface HighestGrowthDistrictResponse {
    counts_by_year: {
      [year: string]: {
        [district: string]: DistrictStats
      }
    }
    highest_growth_by_year: GrowthInsight[]
  }


  export interface GrowthData {
    year: number;
    district: string;
    growth_rate_percent: number;
  };
  
  export interface GrowthResponse {
    message: string;
    total_beneficiaries: number;
    highest_growth_by_year: GrowthData[];
    counts_by_year: Record<string, number>;
  };