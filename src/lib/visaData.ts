// Static Visa Policy Dictionary
// Expanded for multiple visa types

interface VisaRequirements {
    tourist: string;
    student: string;
    business: string;
    work: string;
    transit: string;
    volunteer: string;
}

const defaultVisa: VisaRequirements = {
    tourist: "Visa Required (Check Embassy)",
    student: "Student Visa Required (Acceptance Letter)",
    business: "Business Visa Required (Invitation)",
    work: "Work Permit Required (Sponsorship)",
    transit: "Transit Visa Required (>24h)",
    volunteer: "Special Purpose / Social Visa Required"
};

// Simplified override map (Partial)
// In a real app, this would be a massive DB or API.
const visaPolicies: Record<string, Partial<VisaRequirements>> = {
  US: {
      tourist: "ESTA (Visa Waiver) or B1/B2 Visa",
      student: "F-1 / M-1 Visa (I-20 Required)",
      business: "B-1 Visa",
      work: "H-1B / L-1 (Strict Quotas)",
      volunteer: "B-1 (Limited) or J-1"
  },
  GB: {
      tourist: "Standard Visitor Visa (6 Months)",
      student: "Student Visa (CAS Required)",
      business: "Standard Visitor (Business activity)",
      work: "Skilled Worker Visa (Sponsorship)",
      volunteer: "Charity Worker Visa (Temporary)"
  },
  JP: {
      tourist: "Visa Exemption (90 Days)",
      student: "Student Visa (COE Required)",
      business: "Temporary Visitor (90 Days)",
      work: "Work Visa (Degree/Experience Required)",
      volunteer: "Cultural Activities Visa"
  },
  FR: {
      tourist: "Schengen Visa (90/180 Days)",
      student: "Long-Stay Student Visa (VLS-TS)",
      business: "Schengen Visa",
      work: "Talent Passport / Salaried Visa",
      volunteer: "Volunteering Visa (Mission)"
  },
  CN: {
      tourist: "L Visa (Invitation/Itinerary)",
      student: "X1 (>180d) / X2 (<180d)",
      business: "M Visa (Commercial Trade)",
      work: "Z Visa (Work Permit)",
      transit: "144-Hour Visa-Free Transit (Select Ports)"
  }
};

export function getVisaInfo(countryCode: string): VisaRequirements {
  const specific = visaPolicies[countryCode] || {};

  // Merge with default
  return { ...defaultVisa, ...specific };
}
