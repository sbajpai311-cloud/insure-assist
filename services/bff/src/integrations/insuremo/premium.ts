import axios from 'axios';
import { getInsureMoToken, insureMoHeaders } from './auth';

export interface PremiumCalcRequest {
  gender: 'M' | 'F';
  birthdate: string;         // ISO8601
  sumAssured: number;
  coverageYear: number;
  chargeYear: number;
  paymentFreq: 1 | 2 | 4 | 12; // Annual/Semi/Quarterly/Monthly
}

export async function calculatePremium(req: PremiumCalcRequest) {
  const token = await getInsureMoToken();
  const clientRequestId = `BI${Date.now()}`;

  const payload = {
    clientRequestId,
    clientRequestTime: new Date().toISOString(),
    calculatePolicy: {
      inceptionDate: new Date().toISOString(),
      discountType: 0,
      coverages: [{
        coverageSerialId: 1,
        productCode: 'GTR1',
        chargePeriod: '2',
        chargeYear: req.chargeYear,
        coveragePeriod: '2',
        coverageYear: req.coverageYear,
        calculatePremium: {
          sumAssured: req.sumAssured,
          paymentFreq: req.paymentFreq,
        },
        insureds: [{
          orderId: 1,
          gender: req.gender,
          birthdate: req.birthdate,
        }],
      }],
    },
  };

  const res = await axios.post(
    `${process.env.INSUREMO_API_BASE}/pd/products/benefitPremiumSA`,
    payload,
    { headers: { Authorization: `Bearer ${token}`, ...insureMoHeaders() } }
  );

  if (res.data.result !== 1) throw new Error(`InsureMO error: ${JSON.stringify(res.data)}`);

  return {
    stdPremAf: res.data.calculatePolicyResult.calculateCoverageResults[0].stdPremAf,
    sumAssured: res.data.calculatePolicyResult.calculateCoverageResults[0].sumAssured,
    installPrem: res.data.calculatePolicyResult.installPrem,
  };
}
