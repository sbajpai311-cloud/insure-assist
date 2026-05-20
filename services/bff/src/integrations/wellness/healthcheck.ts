// Health Assessment Network (HA) — mock stub
export async function getHealthCheckPackages() {
  return [
    {
      packageId: 'AHC_BASIC',
      name: 'Annual Health Check-Up — Basic',
      parameters: 78,
      includesHomeVisit: true,
      price: 0,  // included in wellness bundle
    },
    {
      packageId: 'AHC_COMPREHENSIVE',
      name: 'Annual Health Check-Up — Comprehensive',
      parameters: 120,
      includesHomeVisit: true,
      price: 999,
    },
  ];
}

export async function bookHealthCheck(packageId: string, patientName: string, preferredDate: string) {
  return {
    bookingId: `HC_${Date.now()}`,
    packageId,
    patientName,
    preferredDate,
    status: 'BOOKED',
    labCenter: 'HA Network — Nearest Center',
    reportExpectedIn: '48 hours',
  };
}
