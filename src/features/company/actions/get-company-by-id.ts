"use server";

import { db } from "@/db/drizzle";
import { companies } from "@/db/schema/companies";
import { eq } from "drizzle-orm";
import { generateLogoUrl } from "@/lib/utils/logo";

export interface CompanyResult {
  id: number;
  companyName: string;
  nifCode: string;
  webSite?: string;
  emailPortugal?: string;
  telephone?: string;
  city?: string;
  address?: string;
  postalCode?: string;
  numberOfEmployeesLastAvailYr?: number;
  operatingRevenueTurnoverThEurLastAvailYr?: number;
  grossProfitThEurLastAvailYr?: number;
  plBeforeTaxThEurLastAvailYr?: number;
  plAfterTaxThEurLastAvailYr?: number;
  ebitdaThEurLastAvailYr?: number;
  ebitThEurLastAvailYr?: number;
  caeRev4PrimaryLabel?: string;
  caeRev4PrimaryCode?: string;
  caeRev4SecondaryCodes?: string;
  legalForm?: string;
  president?: string;
  logo?: string;
}

export const getCompanyById = async (companyId: number) => {
  try {
    // Validate input
    if (!companyId || isNaN(companyId)) {
      return {
        success: false,
        error: "Invalid company ID provided",
        data: null,
      };
    }

    // Query the database
    const result = await db
      .select({
        id: companies.id,
        companyName: companies.companyName,
        nifCode: companies.nifCode,
        webSite: companies.webSite,
        emailPortugal: companies.emailPortugal,
        telephone: companies.telephone,
        city: companies.city,
        address: companies.address,
        postalCode: companies.postalCode,
        numberOfEmployeesLastAvailYr: companies.numberOfEmployeesLastAvailYr,
        operatingRevenueTurnoverThEurLastAvailYr:
          companies.operatingRevenueTurnoverThEurLastAvailYr,
        grossProfitThEurLastAvailYr: companies.grossProfitThEurLastAvailYr,
        plBeforeTaxThEurLastAvailYr: companies.plBeforeTaxThEurLastAvailYr,
        plAfterTaxThEurLastAvailYr: companies.plAfterTaxThEurLastAvailYr,
        ebitdaThEurLastAvailYr: companies.ebitdaThEurLastAvailYr,
        ebitThEurLastAvailYr: companies.ebitThEurLastAvailYr,
        caeRev4PrimaryLabel: companies.caeRev4PrimaryLabel,
        caeRev4PrimaryCode: companies.caeRev4PrimaryCode,
        caeRev4SecondaryCodes: companies.caeRev4SecondaryCodes,
        legalForm: companies.legalForm,
        president: companies.president,
      })
      .from(companies)
      .where(eq(companies.id, companyId))
      .limit(1);

    // Check if company was found
    if (!result || result.length === 0) {
      return {
        success: false,
        error: "Company not found",
        data: null,
      };
    }

    const company = result[0];

    // Clean and format the data
    const formattedCompany: CompanyResult = {
      id: company.id,
      companyName: company.companyName || "N/A",
      nifCode: company.nifCode,
      webSite: company.webSite || undefined,
      emailPortugal: company.emailPortugal || undefined,
      telephone: company.telephone || undefined,
      city: company.city || undefined,
      address: company.address || undefined,
      postalCode: company.postalCode || undefined,
      numberOfEmployeesLastAvailYr:
        company.numberOfEmployeesLastAvailYr || undefined,
      operatingRevenueTurnoverThEurLastAvailYr:
        company.operatingRevenueTurnoverThEurLastAvailYr
          ? Number(company.operatingRevenueTurnoverThEurLastAvailYr)
          : undefined,
      grossProfitThEurLastAvailYr: company.grossProfitThEurLastAvailYr
        ? Number(company.grossProfitThEurLastAvailYr)
        : undefined,
      plBeforeTaxThEurLastAvailYr: company.plBeforeTaxThEurLastAvailYr
        ? Number(company.plBeforeTaxThEurLastAvailYr)
        : undefined,
      plAfterTaxThEurLastAvailYr: company.plAfterTaxThEurLastAvailYr
        ? Number(company.plAfterTaxThEurLastAvailYr)
        : undefined,
      ebitdaThEurLastAvailYr: company.ebitdaThEurLastAvailYr
        ? Number(company.ebitdaThEurLastAvailYr)
        : undefined,
      ebitThEurLastAvailYr: company.ebitThEurLastAvailYr
        ? Number(company.ebitThEurLastAvailYr)
        : undefined,
      caeRev4PrimaryLabel: company.caeRev4PrimaryLabel || undefined,
      caeRev4PrimaryCode: company.caeRev4PrimaryCode || undefined,
      caeRev4SecondaryCodes: company.caeRev4SecondaryCodes || undefined,
      legalForm: company.legalForm || undefined,
      president: company.president || undefined,
      logo: company.webSite
        ? generateLogoUrl(company.webSite, { format: "png" })
        : undefined,
    };

    return {
      success: true,
      data: formattedCompany,
      error: null,
    };
  } catch (error) {
    console.error("Error fetching company by ID:", error);
    return {
      success: false,
      error: "Failed to fetch company data",
      data: null,
    };
  }
};
