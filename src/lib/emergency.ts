export const emergencyNumbers: Record<string, { police: string; fire: string; ambulance: string }> = {
  US: { police: "911", fire: "911", ambulance: "911" },
  GB: { police: "999", fire: "999", ambulance: "999" },
  EU: { police: "112", fire: "112", ambulance: "112" }, // Generic EU
  FR: { police: "17", fire: "18", ambulance: "15" },
  DE: { police: "110", fire: "112", ambulance: "112" },
  JP: { police: "110", fire: "119", ambulance: "119" },
  CN: { police: "110", fire: "119", ambulance: "120" },
  IN: { police: "100", fire: "101", ambulance: "102" },
  TZ: { police: "112", fire: "112", ambulance: "112" },
  BR: { police: "190", fire: "193", ambulance: "192" },
  AU: { police: "000", fire: "000", ambulance: "000" },
  NZ: { police: "111", fire: "111", ambulance: "111" },
  ZA: { police: "10111", fire: "10177", ambulance: "10177" },
};

export function getEmergencyNumbers(countryCode: string) {
  return emergencyNumbers[countryCode] || emergencyNumbers['EU'] || { police: "112", fire: "112", ambulance: "112" };
}
