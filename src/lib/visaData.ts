// Static Visa Policy Dictionary
// Mapping ISO Alpha-2 code to general policy for US/Western tourists (simplified for MVP)
export const visaPolicy: Record<string, string> = {
  US: "Visa Waiver Program / ESTA",
  GB: "Visa-free / ETA",
  FR: "Schengen Area (90 days visa-free)",
  DE: "Schengen Area (90 days visa-free)",
  IT: "Schengen Area (90 days visa-free)",
  ES: "Schengen Area (90 days visa-free)",
  JP: "Visa-free (90 days)",
  CN: "Visa Required (144h transit available in some cities)",
  IN: "E-Visa / Visa Required",
  BR: "Visa-free (90 days)",
  TZ: "Visa Required (E-Visa / On Arrival)",
  KE: "ETA Required",
  ZA: "Visa-free (90 days for many nations)",
  EG: "Visa On Arrival / E-Visa",
  AE: "Visa-free / Visa On Arrival",
  SA: "E-Visa / Visa on Arrival",
  TR: "E-Visa",
  TH: "Visa Exemption (30-60 days)",
  ID: "Visa On Arrival",
  VN: "E-Visa",
  AU: "E-Visitor / ETA",
  NZ: "NZeTA Required",
  CA: "eTA Required",
  MX: "Visa-free (180 days)",
  // Default fallback
};

export function getVisaInfo(countryCode: string): string {
  return visaPolicy[countryCode] || "Check Official Embassy Requirements";
}
