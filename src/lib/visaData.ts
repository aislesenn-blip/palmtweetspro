// Static Visa Policy Dictionary
// Mapping ISO Alpha-2 code to general policy for US/Western tourists (simplified for MVP)

export const visaPolicy: Record<string, string> = {
  US: "Visa Waiver / ESTA Required",
  GB: "Visa-Free (6 months)",
  FR: "Schengen Visa-Free (90 days)",
  DE: "Schengen Visa-Free (90 days)",
  IT: "Schengen Visa-Free (90 days)",
  ES: "Schengen Visa-Free (90 days)",
  JP: "Visa-Free (90 days)",
  CN: "Visa Required (144h Transit Available)",
  IN: "E-Visa Required",
  BR: "Visa-Free (90 days)",
  TZ: "E-Visa / Visa On Arrival",
  KE: "eTA Required",
  ZA: "Visa-Free (90 days)",
  EG: "Visa On Arrival / E-Visa",
  AE: "Visa-Free / Visa On Arrival",
  SA: "E-Visa / Visa On Arrival",
  TR: "E-Visa Required",
  TH: "Visa Exemption (30-60 days)",
  ID: "Visa On Arrival",
  VN: "E-Visa Required",
  AU: "eVisitor / ETA Required",
  NZ: "NZeTA Required",
  CA: "eTA Required",
  MX: "Visa-Free (180 days)",
};

export function getVisaInfo(countryCode: string): string {
  return visaPolicy[countryCode] || "Check Official Embassy Requirements";
}
