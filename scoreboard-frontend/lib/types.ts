export interface TotalBeneficiaries {
    message: string
    total_beneficiaries: number
    beneficiaries_by_year: BeneficiariesByYear[]
}
  
export interface BeneficiariesByYear {
    YEAR: number
    BENEFICIARY_COUNT: number
}
  