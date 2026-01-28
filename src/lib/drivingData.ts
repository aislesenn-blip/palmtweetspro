export interface DrivingRules {
  side: 'right' | 'left';
  minAge: number;
  license: string;
}

const defaultRules: DrivingRules = {
  side: 'right',
  minAge: 18,
  license: 'International Driving Permit (IDP) recommended'
};

const drivingData: Record<string, DrivingRules> = {
  US: { side: 'right', minAge: 16, license: 'Valid National License' },
  GB: { side: 'left', minAge: 17, license: 'Valid National License' },
  FR: { side: 'right', minAge: 18, license: 'National License (Non-EU need IDP)' },
  DE: { side: 'right', minAge: 18, license: 'National License (Non-EU need IDP)' },
  JP: { side: 'left', minAge: 18, license: 'IDP Required (1949 Geneva Convention)' },
  CN: { side: 'right', minAge: 18, license: 'Chinese License Required (IDP NOT accepted)' },
  IN: { side: 'left', minAge: 18, license: 'IDP Required' },
  AU: { side: 'left', minAge: 17, license: 'English License or IDP' },
  TH: { side: 'left', minAge: 18, license: 'IDP Required' },
  ID: { side: 'left', minAge: 17, license: 'IDP Required' },
  VN: { side: 'right', minAge: 18, license: 'Vietnamese License or IDP (Strict)' },
  ZA: { side: 'left', minAge: 18, license: 'English License or IDP' },
};

export function getDrivingRules(cca2: string): DrivingRules {
  return drivingData[cca2] || defaultRules;
}
